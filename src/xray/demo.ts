/**
 * Mock-up page (xray.html): the body rig with no skin drawn, only its nervous system as tubes,
 * and the head's recognisable parts (eyes, nose, lips, the vocal tract inside). Dev only.
 * URL: ?look=function|xray|signal&view=body|head|front|back&pose=<preset>&t=<seconds>&mouth=0..1
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { initChimera } from "../wasm/chimera.ts";
import rigUrl from "../rig/body.rig.bin?url";

await initChimera();
const [{ Rig }, { PRESETS }, { wearHead }, { VoiceModel }, { PRESETS: BODIES }, { REST_ARTIC }, { Nerves, NerveView }] = await Promise.all([
  import("../rig/rig.ts"),
  import("../rig/pose.ts"),
  import("../rig/head.ts"),
  import("../ui/analysis.ts"),
  import("../ui/body.ts"),
  import("../ui/render/anatomy3d.ts"),
  import("./nerves.ts"),
]);
type Mode = "function" | "xray" | "signal";

const q = new URLSearchParams(location.search);
const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(30, 1, 5, 5000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.45, 0.35, 0.3);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const rig = await Rig.load(rigUrl);
const model = new VoiceModel(BODIES.male, 48000);
const head = wearHead(rig, model);
const skinned = new Float32Array(3 * rig.n);
/** the head without its outside: no grid, no shell, no midline profile, no ears; its own brain and spine left to the nerves */
const lookHead = (bone: number) => {
  head.setLook({ inner: 1, bone, outline: 0, shell: 0, skin: 0, features: 2.6 });
  head.head.drawing = { ...head.head.drawing, fade: null, parts: { brain: 0, skull: 0, spine: 0, ears: 0 } };
};
lookHead(0.3);
scene.add(head.mount);

const form = document.querySelector("form")!;
const field = (name: string) => form.elements.namedItem(name) as HTMLSelectElement & HTMLInputElement;
field("pose").append(...Object.keys(PRESETS).map((k) => new Option(k, k)));
field("pose").value = q.get("pose") ?? "neutral";
field("look").value = q.get("look") ?? "function";
field("mouth").value = q.get("mouth") ?? "0";

const artic = () => {
  const open = Number(field("mouth").value);
  return { ...REST_ARTIC, jaw: 1.8 * open, lipAp: 1.8 * open };
};
const place = () => {
  rig.pose(PRESETS.neutral);
  rig.skin(skinned);
  head.update(camera, artic(), null, 0);
};
place();
const t0 = performance.now();
const nerves = new Nerves(rig, skinned, head.mount.matrixWorld.clone(), model);
console.log(`nerves: ${nerves.fibres.length} fibres in ${(performance.now() - t0).toFixed(0)} ms`);
const view = new NerveView(nerves);
scene.add(view.mesh);
console.log(`tubes: ${view.mesh.geometry.getAttribute("position").count} vertices`);

const setPose = () => {
  rig.pose(PRESETS[field("pose").value] ?? PRESETS.neutral);
  rig.skin(skinned);
  head.update(camera, artic(), null, 0);
  nerves.pose(head.mount.matrixWorld);
  view.rebuild();
};
const setLook = () => {
  const m = field("look").value as Mode;
  view.mode = m;
  bloom.strength = m === "function" ? 0.3 : 0.45;
  view.mat.uniforms.uGain.value = m === "xray" ? 1.1 : 1;
};
field("pose").onchange = () => {
  setPose();
  frame(q.get("view") ?? "body");
};
field("look").onchange = setLook;
setLook();
setPose();

/** where the camera looks from, for each view */
function frame(which: string): void {
  const headC = new THREE.Vector3(1, 12, 0).applyMatrix4(head.mount.matrixWorld);
  const body = new THREE.Vector3(2, 6, 0);
  const views: Record<string, [THREE.Vector3, THREE.Vector3]> = {
    body: [body, new THREE.Vector3(300, 40, 175)],
    front: [body, new THREE.Vector3(360, 20, 0)],
    back: [body, new THREE.Vector3(-300, 40, 175)],
    head: [headC, new THREE.Vector3(86, 10, 40)],
    side: [headC, new THREE.Vector3(0, 4, 80)],
    torso: [new THREE.Vector3(2, 40, 0), new THREE.Vector3(160, 20, 95)],
  };
  const [t, off] = views[which] ?? views.body;
  controls.target.copy(t);
  camera.position.copy(t).add(off);
  controls.update();
}
frame(q.get("view") ?? "body");
for (const b of form.querySelectorAll<HTMLButtonElement>("button[data-view]")) b.onclick = (e) => {
  e.preventDefault();
  frame(b.dataset.view!);
};

function resize(): void {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  head.resize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

const fixedT = q.has("t") ? Number(q.get("t")) : null;
let last = performance.now(), frames = 0;
renderer.setAnimationLoop((now) => {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  controls.update();
  head.update(camera, artic(), null, dt);
  // the head's lines over the tubes, never hidden by them
  head.mount.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (m && m.depthTest) m.depthTest = false;
  });
  // the depth range for the x-ray's colours: the body's near and far sides as seen now
  const d = camera.position.distanceTo(controls.target), span = q.get("view") === "head" || q.get("view") === "side" ? 14 : 30;
  view.mat.uniforms.uNear.value = d - span;
  view.mat.uniforms.uFar.value = d + span;
  view.mat.uniforms.uTime.value = fixedT ?? now / 1000;
  composer.render();
  if (++frames === 8) (window as unknown as { xrayReady: boolean }).xrayReady = true;
});
