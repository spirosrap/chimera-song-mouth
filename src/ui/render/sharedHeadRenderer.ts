import * as THREE from "three";

/** A wall of heads must fit within the browser's small WebGL-context limit.
 * Each scene is rendered and copied to its own 2D canvas before the next uses this renderer. */
export function createHeadRendererPool(create: () => THREE.WebGLRenderer) {
  let renderer: THREE.WebGLRenderer | null = null;
  let users = 0;
  return {
    acquire() {
      const value = renderer ??= create();
      users++;
      let released = false;
      return { renderer: value, release() {
        if (released) return;
        released = true;
        if (--users === 0) {
          value.dispose();
          value.forceContextLoss();
          renderer = null;
        }
      } };
    },
  };
}

export const headRendererPool = createHeadRendererPool(() => new THREE.WebGLRenderer({
  canvas: document.createElement("canvas"), antialias: true, alpha: false, powerPreference: "high-performance",
}));
