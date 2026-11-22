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
const [{ Rig }, { PRESETS }, { wearHead }, { VoiceModel }, { PRESETS: BODIES }, { REST_ARTIC }, { Nerves, NerveView }, { bodyPoint, buildProfile }] = await Promise.all([
  import("../rig/rig.ts"),
  import("../rig/pose.ts"),
  import("../rig/head.ts"),
  import("../ui/analysis.ts"),
  import("../ui/body.ts"),
  import("../ui/render/anatomy3d.ts"),
  import("./nerves.ts"),
  import("../ui/render/profile.ts"),
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
head.setLook({ inner: 1, bone: 0.3, outline: 0, shell: 0, skin: 0, features: 2.6 });
const parts = { brain: 0, skull: 0, spine: 0, ears: 0, pop: 2, cores: true };
head.head.drawing = { ...head.head.drawing, fade: null, parts };
/**
 * The face's lines are so many px wide whatever the head's size on screen: seen whole-body they
 * pile into a few px and bloom to white. So they're drawn as bright, as wide and with white cores
 * only as the head comes close; far off, softer and thinner, the vocal tract dimmer.
 */
const headC = new THREE.Vector3();
const scaleFace = () => {
  headC.set(1, 12, 0).applyMatrix4(head.mount.matrixWorld);
  const pxPerCm = innerHeight / (2 * camera.position.distanceTo(headC) * Math.tan((camera.fov * Math.PI) / 360));
  const near = THREE.MathUtils.smoothstep(pxPerCm, 5, 16), mix = (a: number, b: number) => a + (b - a) * near;
  head.look.features = mix(1.15, 2.6);
  head.head.drawing.inner = mix(0.5, 1);
  head.head.drawing.bone = mix(0.12, 0.3);
  parts.pop = mix(1.1, 2);
  parts.cores = near > 0.45;
};
scene.add(head.mount);

const form = document.querySelector("form")!;
const field = (name: string) => form.elements.namedItem(name) as HTMLSelectElement & HTMLInputElement;
field("pose").append(...Object.keys(PRESETS).map((k) => new Option(k, k)));
field("pose").value = q.get("pose") ?? "neutral";
field("look").value = q.get("look") ?? "function";
if (q.has("signal")) field("signal").value = q.get("signal")!;
if (q.has("speed")) field("speed").value = q.get("speed")!;
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
const setSignal = () => (view.mat.uniforms.uSignal.value = Number(field("signal").value));
field("signal").oninput = setSignal;
setSignal();

// the face's features, in the head's cm: the nerves clear away behind them (see the shader's `cleared`)
const k = model.tract.scale, B = bodyPoint(model);
const eye = B(6.15, 15.35);
const lip = head.head.lipEdges(model, REST_ARTIC).upper;
const lipC = new THREE.Vector3();
for (let i = 0; i < lip.length; i += 3) lipC.add(new THREE.Vector3(lip[i], lip[i + 1], lip[i + 2]));
lipC.divideScalar(lip.length / 3);
const prof = buildProfile(model, model.frame(REST_ARTIC), REST_ARTIC);
const nose = prof.skinUpper.filter((p) => p.y > B(0, 10.9).y && p.y < B(0, 15).y).reduce((a, b) => (b.x > a.x ? b : a));
const FEATURES: [THREE.Vector3, number][] = [
  [new THREE.Vector3(eye.x, eye.y, 3.15 * k), 2.3],
  [new THREE.Vector3(eye.x, eye.y, -3.15 * k), 2.3],
  [new THREE.Vector3(nose.x - 0.6 * k, nose.y + 0.6 * k, 0), 2.0],
  [lipC, 3.0],
];
const fwd = new THREE.Vector3(), toCam = new THREE.Vector3();
const clearFeatures = () => {
  const M = head.mount.matrixWorld, U = view.mat.uniforms;
  FEATURES.forEach(([p, r], i) => {
    const w = p.clone().applyMatrix4(M);
    (U.uClear.value as THREE.Vector4[])[i].set(w.x, w.y, w.z, r);
  });
  // only while the face is towards the camera
  fwd.set(1, 0, 0).transformDirection(M);
  toCam.copy(camera.position).sub(FEATURES[3][0].clone().applyMatrix4(M)).normalize();
  U.uClearAmt.value = THREE.MathUtils.smoothstep(fwd.dot(toCam), -0.2, 0.35) * Number(q.get("clear") ?? 1);
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
let last = performance.now(), frames = 0, run = 0;
renderer.setAnimationLoop((now) => {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  controls.update();
  scaleFace();
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
  // the pulses run on at the speed set (cm/s); a change of speed doesn't jump them
  run = fixedT !== null ? fixedT * Number(field("speed").value) : run + dt * Number(field("speed").value);
  view.mat.uniforms.uRun.value = run;
  clearFeatures();
  composer.render();
  if (++frames === 8) (window as unknown as { xrayReady: boolean }).xrayReady = true;
});
