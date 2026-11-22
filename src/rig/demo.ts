/**
 * The body rig wearing the CHIMERA head, as a page: `bun run dev`, then /rig.html. Pick a pose,
 * open the mouth, pick how the head is drawn; drag to turn round it. Dev only (not in the app's
 * build). See docs/rig.md.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { initChimera } from "../wasm/chimera.ts";
import rigUrl from "./body.rig.bin?url";

await initChimera();
// the head reads the engine's tables as it loads, so it comes after the engine
const [{ Rig }, { PRESETS }, { wearHead, HEAD_LOOKS, HEAD_LOOK }, { RigView }, { VoiceModel }, { PRESETS: BODIES }, { REST_ARTIC }] = await Promise.all([
  import("./rig.ts"),
  import("./pose.ts"),
  import("./head.ts"),
  import("./view.ts"),
  import("../ui/analysis.ts"),
  import("../ui/body.ts"),
  import("../ui/render/anatomy3d.ts"),
]);

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// the head's colours are the app's display values, passed through as the app's 3D view does
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(32, 1, 5, 5000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.25, 0.3, 0.7));
composer.addPass(new OutputPass());

const rig = await Rig.load(rigUrl);
const model = new VoiceModel(BODIES.male, 48000);
const head = wearHead(rig, model);
const view = new RigView(rig);
scene.add(view.group, head.mount);
const skinned = new Float32Array(3 * rig.n);

// the form: a pose, the mouth (jaw and lips together), the head's look
const form = document.querySelector("form")!;
const field = (name: string) => form.elements.namedItem(name) as HTMLSelectElement & HTMLInputElement;
for (const [name, keys] of [["pose", Object.keys(PRESETS)], ["look", Object.keys(HEAD_LOOKS)]] as const) field(name).append(...keys.map((k) => new Option(k, k)));
field("look").value = HEAD_LOOK;
field("look").onchange = () => {
  head.setLook(HEAD_LOOKS[field("look").value]);
  view.toneChanged();
};

// looking at the chest from in front and to its right; the view follows the chest from pose to pose
const chest = () => rig.P[rig.bone("upperchest")].clone();
rig.pose(PRESETS.neutral);
controls.target.copy(chest());
camera.position.copy(controls.target).add(new THREE.Vector3(150, 25, 70));
field("pose").onchange = () => {
  rig.pose(PRESETS[field("pose").value]);
  const move = chest().sub(controls.target);
  controls.target.add(move);
  camera.position.add(move);
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

let last = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  controls.update();
  rig.pose(PRESETS[field("pose").value] ?? PRESETS.neutral);
  rig.skin(skinned);
  const open = Number(field("mouth").value);
  head.update(camera, { ...REST_ARTIC, jaw: 1.8 * open, lipAp: 1.8 * open }, null, dt);
  head.face(skinned, view.posed);
  view.update();
  composer.render();
});
