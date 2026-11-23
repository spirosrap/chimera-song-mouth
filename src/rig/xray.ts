/**
 * The nerve x-ray as a page: `bun run dev`, then /xray.html. The body wearing the CHIMERA head
 * with no skin drawn, only its nervous system (src/rig/nerves.ts) and the head's eyes, nose,
 * lips and vocal tract. Pick a look, the pulses' strength and speed, a pose, the mouth; drag to
 * turn round it. Dev only (not in the app's build). See docs/rig.md.
 *
 * URL: ?look=function|xray|signal&pose=<preset>&view=body|front|back|torso|head|side&signal=0..1
 *      &speed=<cm/s>&mouth=0..1&shot (without the form)
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { initChimera } from "../wasm/chimera.ts";
import rigUrl from "./body.rig.bin?url";

const q = new URLSearchParams(location.search);
await initChimera();
// the head reads the engine's tables as it loads, so it comes after the engine
const [{ Rig }, { PRESETS }, { wearHead }, { VoiceModel }, { PRESETS: BODIES }, { REST_ARTIC }, { Nerves, NerveView }] = await Promise.all([
  import("./rig.ts"),
  import("./pose.ts"),
  import("./head.ts"),
  import("../ui/analysis.ts"),
  import("../ui/body.ts"),
  import("../ui/render/anatomy3d.ts"),
  import("./nerves.ts"),
]);
type NerveLook = import("./nerves.ts").NerveLook;

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// the head's colours are the app's display values, passed through as the app's 3D view does
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(30, 1, 5, 5000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.3, 0.35, 0.3);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const rig = await Rig.load(rigUrl);
const model = new VoiceModel(BODIES.male, 48000);
const head = wearHead(rig, model);
const nerves = new Nerves(rig, head);
const view = new NerveView(nerves);
scene.add(view.mesh, head.mount);

// the form: the look, the pulses, a pose, the mouth (jaw and lips together), where to look from
const form = document.querySelector("form")!;
const field = (name: string) => form.elements.namedItem(name) as HTMLSelectElement & HTMLInputElement;
field("pose").append(...Object.keys(PRESETS).map((k) => new Option(k, k)));
for (const name of ["look", "pose", "signal", "speed", "mouth"]) if (q.has(name)) field(name).value = q.get(name)!;
const artic = () => {
  const open = Number(field("mouth").value);
  return { ...REST_ARTIC, jaw: 1.8 * open, lipAp: 1.8 * open };
};
const setLook = () => {
  const look = field("look").value as NerveLook;
  view.look = look;
  bloom.strength = look === "function" ? 0.3 : 0.45;
};
const setPulses = () => {
  view.signal = Number(field("signal").value);
  view.speed = Number(field("speed").value);
};
/** a new pose: the head placed for it (no time passing), then the nerves */
const setPose = () => {
  rig.pose(PRESETS[field("pose").value] ?? PRESETS.neutral);
  view.update(camera, artic(), null, 0, innerHeight);
  view.pose();
};
field("look").onchange = setLook;
field("signal").oninput = field("speed").oninput = setPulses;
field("pose").onchange = () => {
  setPose();
  frame(q.get("view") ?? "body");
};
setLook();
setPulses();
setPose();

/** where the camera looks from, for each view: the body's middle or the head, and from where */
const target = (where: string) => (where === "head" || where === "side" ? new THREE.Vector3(1, 12, 0).applyMatrix4(head.mount.matrixWorld) : where === "torso" ? new THREE.Vector3(2, 40, 0) : new THREE.Vector3(2, 6, 0));
function frame(which: string): void {
  const from: Record<string, THREE.Vector3> = {
    body: new THREE.Vector3(300, 40, 175),
    front: new THREE.Vector3(360, 20, 0),
    back: new THREE.Vector3(-300, 40, 175),
    torso: new THREE.Vector3(160, 20, 95),
    head: new THREE.Vector3(86, 10, 40),
    side: new THREE.Vector3(0, 4, 80),
  };
  controls.target.copy(target(which));
  camera.position.copy(controls.target).add(from[which] ?? from.body);
  controls.update();
}
frame(q.get("view") ?? "body");
for (const b of form.querySelectorAll<HTMLButtonElement>("button[data-view]")) {
  b.onclick = (e) => {
    e.preventDefault();
    frame(b.dataset.view!);
  };
}

function resize(): void {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  head.resize(w, h);
  view.resize(w, h, renderer.getPixelRatio());
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

let last = performance.now(), frames = 0;
renderer.setAnimationLoop((now) => {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  controls.update();
  view.update(camera, artic(), null, dt, innerHeight);
  composer.render();
  if (++frames === 8) (window as unknown as { xrayReady: boolean }).xrayReady = true;
});
