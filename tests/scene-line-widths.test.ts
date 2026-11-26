/**
 * This edition's scenes keep the line widths they were made with. Upstream added two wider batches
 * (2.6 and 3.2 px) to `Beams` for the nerve x-ray's face, noting that nothing in its app asks for
 * them (ba774b6). The scenes here do: about 100 calls pass 2.4 to 9 px (hair at 3 and 4 px), and
 * all of them were drawn, and approved, at 2.1 px. Imported as written, each would have come out
 * at 2.6 or 3.2 px. So a `Beams` draws at six widths unless it is made `wide` (the head is).
 */
import { expect, test } from "bun:test";
import * as THREE from "three";
import type { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { Beams } from "../src/ui/render/beams3d.ts";

/** the width (px) of the batch a line asked for at `width` was put in */
function drawnAt(b: Beams, width: number): number {
  b.begin();
  b.line([0, 0, 0, 1, 0, 0], 2, "#ffffff", width);
  b.end();
  const used = b.group.children.filter((o) => (o as THREE.Mesh<THREE.InstancedBufferGeometry>).geometry.instanceCount > 0);
  expect(used.length).toBe(1);
  return ((used[0] as THREE.Mesh).material as LineMaterial).linewidth;
}

test("a scene's lines are drawn no wider than 2.1 px, whatever they ask for; the head's go up to 3.2", () => {
  const scene = new Beams();
  expect(scene.group.children.length).toBe(6);
  for (const [asked, drawn] of [[0.6, 0.6], [1.3, 1.3], [2.1, 2.1], [2.4, 2.1], [3, 2.1], [4, 2.1], [9, 2.1]]) expect(drawnAt(scene, asked)).toBe(drawn);
  const head = new Beams(true);
  expect(head.group.children.length).toBe(8);
  for (const [asked, drawn] of [[2.1, 2.1], [2.4, 2.6], [2.835, 2.6], [3, 3.2], [9, 3.2]]) expect(drawnAt(head, asked)).toBe(drawn);
});
