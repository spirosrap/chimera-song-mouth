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

  test("the lips lie together at rest and part as the mouth opens, as far as the drawn lips", () => {
    const w = wear(), pairs = lipPairs(w.rig);
    const shut = frame(w, M.pose.neutral(), M.REST_ARTIC).out;
    for (const [u, l] of pairs) expect(at(shut, u).distanceTo(at(shut, l))).toBeLessThan(1e-3);
    const open = { ...M.REST_ARTIC, jaw: 1.8, lipAp: 1.8 };
    const { out } = frame(w, M.pose.neutral(), open);
    const gap = Math.max(...pairs.map(([u, l]) => at(out, u).distanceTo(at(out, l))));
    // the drawn lips' gap at the middle (head cm → body cm)
    const e = w.head.head.lipEdges(w.model, open), mid = 3 * Math.floor(e.upper.length / 6);
    const drawn = Math.hypot(e.upper[mid] - e.lower[mid], e.upper[mid + 1] - e.lower[mid + 1], e.upper[mid + 2] - e.lower[mid + 2]) / w.head.s;
    expect(drawn).toBeGreaterThan(0.5);
    expect(Math.abs(gap - drawn) / drawn).toBeLessThan(0.2);
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
