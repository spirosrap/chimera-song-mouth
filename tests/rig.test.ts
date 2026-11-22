/**
 * The body rig (src/rig/): posing, skinning, and the CHIMERA head worn on it. On the real engine
 * (the head is fitted to a VoiceModel), without a GPU.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { initEngine } from "./harness.ts";
import type { Rig as RigT } from "../src/rig/rig.ts";

type Mods = {
  Rig: typeof import("../src/rig/rig.ts").Rig;
  pose: typeof import("../src/rig/pose.ts");
  head: typeof import("../src/rig/head.ts");
  VoiceModel: typeof import("../src/ui/analysis.ts").VoiceModel;
  BODIES: typeof import("../src/ui/body.ts").PRESETS;
  REST_ARTIC: typeof import("../src/ui/render/anatomy3d.ts").REST_ARTIC;
};
let M: Mods;
beforeAll(async () => {
  await initEngine();
  // the head reads the engine's tables as it loads: after the engine
  const [rig, pose, head, analysis, body, a3d] = await Promise.all([import("../src/rig/rig.ts"), import("../src/rig/pose.ts"), import("../src/rig/head.ts"), import("../src/ui/analysis.ts"), import("../src/ui/body.ts"), import("../src/ui/render/anatomy3d.ts")]);
  M = { Rig: rig.Rig, pose, head, VoiceModel: analysis.VoiceModel, BODIES: body.PRESETS, REST_ARTIC: a3d.REST_ARTIC };
});

function loadRig(): RigT {
  const b = readFileSync(new URL("../src/rig/body.rig.bin", import.meta.url));
  return new M.Rig(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
}

/** the mesh's edges that only one quad has, as vertex pairs */
function openEdges(rig: RigT): [number, number][] {
  const count = new Map<number, number>();
  for (let f = 0; f < rig.nq; f++) {
    for (let j = 0; j < 4; j++) {
      const a = rig.quads[4 * f + j], b = rig.quads[4 * f + ((j + 1) % 4)];
      const k = Math.min(a, b) * 1048576 + Math.max(a, b);
      count.set(k, (count.get(k) ?? 0) + 1);
    }
  }
  return [...count].filter(([, c]) => c === 1).map(([k]) => [Math.floor(k / 1048576), k % 1048576]);
}

const at = (P: ArrayLike<number>, i: number) => new THREE.Vector3(P[3 * i], P[3 * i + 1], P[3 * i + 2]);
const maxMove = (A: ArrayLike<number>, B: ArrayLike<number>, ids: Iterable<number>) => {
  let m = 0;
  for (const i of ids) m = Math.max(m, at(A, i).distanceTo(at(B, i)));
  return m;
};

describe("the body", () => {
  test("its only open edges are the neck's rim", () => {
    const rig = loadRig(), open = openEdges(rig);
    expect(open.length).toBe(rig.rim.length);
    const rim = new Set(rig.rim);
    expect(open.every(([a, b]) => rim.has(a) && rim.has(b))).toBe(true);
  });

  test("unposed, both skinnings give the rest mesh back", () => {
    const rig = loadRig(), out = new Float32Array(3 * rig.n);
    for (const method of ["cor", "lbs"] as const) {
      rig.skin(out, method);
      for (let i = 0; i < out.length; i++) expect(Math.abs(out[i] - rig.rest[i])).toBeLessThan(1e-3);
    }
  });

  test("at anatomical zero the arms hang straight down and the legs stand under the hips", () => {
    const rig = loadRig();
    rig.pose(M.pose.neutral());
    const down = (from: string, to: string) => rig.P[rig.bone(to)].clone().sub(rig.P[rig.bone(from)]).normalize().y;
    for (const s of ["R", "L"]) {
      expect(down(`upperarm.${s}`, `forearm.${s}`)).toBeLessThan(-0.999);
      expect(down(`forearm.${s}`, `hand.${s}`)).toBeLessThan(-0.999);
      // seen from the front the hip, knee and ankle are in one vertical line
      const hip = rig.P[rig.bone(`thigh.${s}`)], ankle = rig.P[rig.bone(`foot.${s}`)];
      expect(Math.abs(ankle.z - hip.z)).toBeLessThan(0.05);
    }
  });
});

describe("the head on the body", () => {
  const wear = () => {
    const rig = loadRig(), model = new M.VoiceModel(M.BODIES.male, 48000), head = M.head.wearHead(rig, model);
    return { rig, model, head };
  };
  /** the lips' cut: pairs of head points that lie together at rest (each upper lip point and its lower copy) */
  const lipPairs = (rig: RigT) => {
    const pairs: [number, number][] = [];
    for (let i = rig.bodyVertices; i < rig.n; i++) for (let j = i + 1; j < rig.n; j++) if (at(rig.rest, i).distanceTo(at(rig.rest, j)) < 1e-5) pairs.push([i, j]);
    return pairs;
  };
  /** the body posed and skinned, with the head drawn and its face moved for an articulation */
  const frame = (w: ReturnType<typeof wear>, p: import("../src/rig/pose.ts").Pose, a: import("../src/wasm/types.ts").HumanArtic) => {
    const { rig, head } = w, base = new Float32Array(3 * rig.n), out = new Float32Array(3 * rig.n);
    rig.pose(p);
    rig.skin(base);
    head.update(new THREE.PerspectiveCamera(), a, null, 1 / 60);
    head.face(base, out);
    return { base, out };
  };

  test("the skin closes over the head: the only open edges are the lips' cut", () => {
    const { rig } = wear(), open = openEdges(rig), pairs = lipPairs(rig);
    expect(pairs.length).toBeGreaterThan(2);
    const cut = new Set(pairs.flat());
    // the cut runs between the mouth's corners, which both lips share: each edge has at least one cut point, none a body point
    expect(open.length).toBe(2 * (pairs.length + 1));
    expect(open.every(([a, b]) => a >= rig.bodyVertices && b >= rig.bodyVertices && (cut.has(a) || cut.has(b)))).toBe(true);
  });

  /** a point's distance from a polyline (flat xyz) carried by a matrix */
  const fromLine = (p: THREE.Vector3, line: Float32Array, m: THREE.Matrix4) => {
    const a = new THREE.Vector3(), b = new THREE.Vector3(), seg = new THREE.Line3(), q = new THREE.Vector3();
    let d = Infinity;
    for (let i = 0; i + 5 < line.length; i += 3) {
      seg.set(a.fromArray(line, i).applyMatrix4(m), b.fromArray(line, i + 3).applyMatrix4(m));
      d = Math.min(d, seg.closestPointToPoint(p, true, q).distanceTo(p));
    }
    return d;
  };

  test("the lips' cut lies on the lips the head draws: together at rest; apart, narrow or wide, with the head turned", () => {
    const w = wear(), { rig } = w, pairs = lipPairs(rig);
    const shut = frame(w, M.pose.neutral(), M.REST_ARTIC).out;
    for (const [u, l] of pairs) expect(at(shut, u).distanceTo(at(shut, l))).toBeLessThan(1e-3);
    // the cut's corners: its ends, which both lips share
    const cut = new Set(pairs.flat()), corners = [...new Set(openEdges(rig).flat())].filter((i) => !cut.has(i));
    expect(corners.length).toBe(2);
    const turned = M.pose.neutral();
    turned.neck.twist = 40;
    turned.neck.flex = 20;
    for (const p of [M.pose.neutral(), turned]) {
      for (const lipWidth of [0, 1]) {
        const a = { ...M.REST_ARTIC, jaw: 1.8, lipAp: 1.8, lipWidth };
        const { out } = frame(w, p, a);
        const e = w.head.head.lipEdges(w.model, a), m = w.head.mount.matrix;
        // apart (the drawn lips' gap at the middle, in body cm)
        const mid = 3 * Math.floor(e.upper.length / 6);
        expect(new THREE.Vector3().fromArray(e.upper, mid).distanceTo(new THREE.Vector3().fromArray(e.lower, mid)) / w.head.s).toBeGreaterThan(0.5);
        for (const [u, l] of pairs) {
          expect(fromLine(at(out, u), e.upper, m)).toBeLessThan(0.01);
          expect(fromLine(at(out, l), e.lower, m)).toBeLessThan(0.01);
        }
        // the cut's ends are the mouth's corners, however wide it is
        const ends = [new THREE.Vector3().fromArray(e.upper, 0), new THREE.Vector3().fromArray(e.upper, e.upper.length - 3)].map((c) => c.applyMatrix4(m));
        for (const c of corners) expect(Math.min(...ends.map((x) => x.distanceTo(at(out, c))))).toBeLessThan(0.01);
      }
    }
  });

  test("every point's weights sum to 1 (a fitted neck once dropped a share)", () => {
    const { rig } = wear();
    for (let i = 0; i < rig.n; i++) {
      let sum = 0;
      for (let j = 0; j < rig.INF; j++) sum += rig.skinWeight[rig.INF * i + j];
      expect(Math.abs(sum - 1)).toBeLessThan(1e-5);
    }
  });

  test("the head reads its parent's transform as it is now (the features dim with the face turned away)", () => {
    const w = wear(), parent = new THREE.Group(), camera = new THREE.PerspectiveCamera();
    parent.add(w.head.mount);
    camera.position.set(400, 60, 0);
    w.rig.pose(M.pose.neutral());
    w.head.update(camera, M.REST_ARTIC, null, 0);
    const facing = w.head.head.drawing.features;
    // the body turned round under its parent since the last frame: the face is away from the camera now
    parent.rotation.y = Math.PI;
    w.head.update(camera, M.REST_ARTIC, null, 0);
    expect(facing).toBeCloseTo(w.head.look.features, 3);
    expect(w.head.head.drawing.features).toBeLessThan(0.2 * w.head.look.features);
  });

  test("the face's motion moves the face only: not the crown, not the rim (a mouth opening once dented the crown)", () => {
    const w = wear(), { rig } = w;
    const p = M.pose.neutral();
    p.neck.twist = 40;
    p.neck.flex = 20;
    const { base, out } = frame(w, p, { ...M.REST_ARTIC, jaw: 1.8, lipAp: 1.8 });
    // the crown: the head's points above its eyes
    let top = -Infinity;
    for (let i = rig.bodyVertices; i < rig.n; i++) top = Math.max(top, rig.rest[3 * i + 1]);
    const crown = [...Array(rig.n).keys()].filter((i) => i >= rig.bodyVertices && rig.rest[3 * i + 1] > top - 6);
    expect(crown.length).toBeGreaterThan(20);
    expect(maxMove(base, out, crown)).toBeLessThan(1e-4);
    expect(maxMove(base, out, rig.rim)).toBe(0);
    expect(maxMove(base, out, lipPairs(rig).map(([, l]) => l))).toBeGreaterThan(0.5);
  });
});
