import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { STONE_CAST, STONE_SHOTS, type StoneId } from '../src/scene/stone-rolls.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { StoneRollsStage } = await import('../src/ui/render/stone-rolls.ts');
const file = (name: string) => new URL(`../public/scenes/stone-rolls/${name}`, import.meta.url);
const read = (name: string) => readFileSync(file(name));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
function readTrack(name: string) {
  return new TeleTrack(Uint8Array.from(gunzipSync(read(name))).buffer);
}

test('the complete A Stone Only Rolls Downhill edit retains two physical voices and the original instrumental', () => {
  const entry = movieScene('stone-rolls');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('stone-rolls-20261124');
  expect(scene.duration).toBeCloseTo(236.518458, 4);
  expect(scene.shots).toEqual([...STONE_SHOTS]);
  expect(scene.characters.map(actor => actor.id)).toEqual([...STONE_CAST]);
  expect(sceneCamera(scene, 1.0, 'auto')).toBe('stone-slab');
  expect(sceneCamera(scene, 14.0, 'auto')).toBe('stone-two');
  expect(sceneCamera(scene, 59.0, 'auto')).toBe('stone-chevrons');
  expect(sceneCamera(scene, 95.0, 'auto')).toBe('stone-droste');
  expect(sceneCamera(scene, 118.0, 'auto')).toBe('stone-burst');
  expect(sceneCamera(scene, 150.0, 'auto')).toBe('stone-trio');
  expect(sceneCamera(scene, 193.0, 'auto')).toBe('stone-wall64');
  expect(sceneCamera(scene, 196.0, 'auto')).toBe('stone-studio');
  expect(sceneCamera(scene, 205.0, 'auto')).toBe('stone-outro');
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
  const models = STONE_CAST.map(id => {
    const track = readTrack(id + '.tele.gz');
    return { model: new VoiceModel(track.body, track.sampleRate), track };
  });
  const stage = new StoneRollsStage(models[0]!, models[1]!);
  const times = [
    ...scene.cues.map(cue => (cue.start + cue.end) * 0.5),
    ...STONE_SHOTS.map(shot => shot.time + 0.055),
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
        const fig = stage.figures[cue.speaker as StoneId];
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
    stage.frame(150, true, 10, 'stone-trio', 0.85, 'stone-lead');
    expect(stage.sets.wall35.visible).toBe(true);
    const snap = () => [stage.camera.position.toArray(), stage.figures['stone-lead'].root.position.toArray()];
    const before = snap();
    stage.frame(1.0, false, 11, 'stone-slab', 0);
    expect(stage.sets.table.visible).toBe(true);
    expect(Object.values(stage.figures).every(fig => !fig.root.visible)).toBe(true);
    stage.frame(96.0, false, 12, 'stone-droste', 0.8, 'stone-lead');
    expect(stage.sets.droste.visible).toBe(true);
    stage.frame(150, true, 13, 'stone-trio', 0.85, 'stone-lead');
    expect(snap()).toEqual(before);
    stage.frame(205, false, 14, 'stone-outro', 0);
    expect(stage.sets.black.visible).toBe(true);
    expect(Object.values(stage.figures).every(fig => !fig.root.visible)).toBe(true);
  } finally {
    stage.dispose();
    for (const { model } of models) model.dispose();
  }
});
