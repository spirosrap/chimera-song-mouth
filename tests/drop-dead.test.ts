import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { DROP_CAST, DROP_SHOTS, type DropId } from '../src/scene/drop-dead.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { DropDeadStage } = await import('../src/ui/render/drop-dead.ts');
const file = (name: string) => new URL(`../public/scenes/drop-dead/${name}`, import.meta.url);
const read = (name: string) => readFileSync(file(name));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
function readTrack(name: string) {
  return new TeleTrack(Uint8Array.from(gunzipSync(read(name))).buffer);
}

test('the complete drop dead edit retains two physical voices and the original instrumental', () => {
  const entry = movieScene('drop-dead');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('drop-dead-20261125');
  expect(scene.duration).toBeCloseTo(250.195011, 4);
  expect(scene.shots).toEqual([...DROP_SHOTS]);
  expect(scene.characters.map(actor => actor.id)).toEqual([...DROP_CAST]);
  expect(sceneCamera(scene, 1.0, 'auto')).toBe('drop-card-intro');
  expect(sceneCamera(scene, 15.0, 'auto')).toBe('drop-bar-dance');
  expect(sceneCamera(scene, 52.0, 'auto')).toBe('drop-laptop');
  expect(sceneCamera(scene, 88.0, 'auto')).toBe('drop-gallery-bench');
  expect(sceneCamera(scene, 118.0, 'auto')).toBe('drop-stairs-rail');
  expect(sceneCamera(scene, 148.0, 'auto')).toBe('drop-guitar-trio');
  expect(sceneCamera(scene, 166.0, 'auto')).toBe('drop-swan');
  expect(sceneCamera(scene, 180.0, 'auto')).toBe('drop-gold-gate');
  expect(sceneCamera(scene, 230.0, 'auto')).toBe('drop-steps-sprawl');
  expect(sceneCamera(scene, 246.0, 'auto')).toBe('drop-card-outro');
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  expect(read(scene.audio).length).toBeGreaterThan(6_000_000);
  for (const character of scene.characters) {
    const part = score.parts.find(candidate => candidate.id === character.id)!;
    expect(part.recordingType).toBeUndefined();
    expect(validPerformance(part.performance!, scene.duration)).toBe(true);
    const track = readTrack(character.tele + '.gz');
    expect(track.rate).toBe(20);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    for (const cue of scene.cues.filter(cue => cue.speaker === character.id)) {
      let peak = 0;
      for (let frame = track.indexAt(cue.start); frame <= track.indexAt(cue.end); frame++) {
        const { t } = track.message(frame);
        expect(t.clock).toBeCloseTo(frame / track.rate, 4);
        expect(Number.isFinite(t.outRms)).toBe(true);
        peak = Math.max(peak, t.outRms);
      }
      expect(peak).toBeGreaterThan(0.00014);
    }
  }
});

test('the active mouth stays inside the shot and clear of opaque props on desktop and phone', () => {
  const models = DROP_CAST.map(id => {
    const track = readTrack(id + '.tele.gz');
    return { model: new VoiceModel(track.body, track.sampleRate), track };
  });
  const stage = new DropDeadStage(models[0]!, models[1]!);
  const times = [
    ...scene.cues.map(cue => (cue.start + cue.end) * 0.5),
    ...DROP_SHOTS.map(shot => shot.time + 0.055),
  ].sort((a, b) => a - b);
  try {
    for (const [w, h] of [
      [1280, 720],
      [375, 430],
    ] as const) {
      stage.resize(w, h);
      for (const time of times) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, 1, view, cue?.intensity ?? 0, cue?.speaker);
        expect(Object.values(stage.sets).filter(set => set.visible)).toHaveLength(1);
        if (!cue) continue;
        const fig = stage.figures[cue.speaker as DropId];
        expect(fig.root.visible).toBe(true);
        const mouth = fig.head.scene.localToWorld(new THREE.Vector3(6.5, -1, 0));
        const screen = mouth.clone().project(stage.camera);
        expect(Math.abs(screen.x)).toBeLessThan(0.84);
        expect(Math.abs(screen.y)).toBeLessThan(0.78);
        expect(screen.z).toBeGreaterThan(-1);
        expect(screen.z).toBeLessThan(1);
        const opaque: THREE.Mesh[] = [];
        stage.scene.traverseVisible(object => {
          if (
            object instanceof THREE.Mesh &&
            (object.material as THREE.Material).isMaterial &&
            !(object.material as THREE.Material).transparent &&
            stage.props.meshes.includes(object)
          ) {
            opaque.push(object);
          }
        });
        const towards = mouth.clone().sub(stage.camera.position);
        const ray = new THREE.Raycaster(stage.camera.position, towards.clone().normalize(), 0, towards.length() - 2.5);
        const blocking = ray.intersectObjects(opaque, false);
        expect({ view, w, blocking: blocking.length }).toEqual({ view, w, blocking: 0 });
      }
    }

    // Verify deterministic seeking & clean set transitions
    stage.frame(148, true, 10, 'drop-guitar-trio', 0.88, 'drop-lead');
    expect(stage.sets.salon.visible).toBe(true);
    const snap = () => [stage.camera.position.toArray(), stage.figures['drop-lead'].root.position.toArray()];
    const before = snap();
    stage.frame(1.5, false, 11, 'drop-card-intro', 0);
    expect(stage.sets.card.visible).toBe(true);
    expect(Object.values(stage.figures).every(fig => !fig.root.visible)).toBe(true);
    stage.frame(166, false, 12, 'drop-swan', 0.85, 'drop-lead');
    expect(stage.sets.garden.visible).toBe(true);
    stage.frame(148, true, 13, 'drop-guitar-trio', 0.88, 'drop-lead');
    expect(snap()).toEqual(before);
    stage.frame(246, false, 14, 'drop-card-outro', 0);
    expect(stage.sets.card.visible).toBe(true);
    expect(Object.values(stage.figures).every(fig => !fig.root.visible)).toBe(true);
  } finally {
    stage.dispose();
    for (const { model } of models) model.dispose();
  }
});
