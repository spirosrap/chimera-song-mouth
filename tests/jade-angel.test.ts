import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { JADE_CAST, JADE_SHOTS, type JadeId } from '../src/scene/jade-angel.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { JadeAngelStage } = await import('../src/ui/render/jade-angel.ts');
const file = (name: string) => new URL(`../public/scenes/jade-angel/${name}`, import.meta.url);
const read = (name: string) => readFileSync(file(name));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
function readTrack(name: string) {
  return new TeleTrack(Uint8Array.from(gunzipSync(read(name))).buffer);
}

test('the complete music-video edit retains four physical voices and the original instrumental', () => {
  const entry = movieScene('jade-angel');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('jade-angel-20261122');
  expect(scene.duration).toBeCloseTo(231.781587, 4);
  expect(scene.shots).toEqual([...JADE_SHOTS]);
  expect(scene.characters.map(actor => actor.id)).toEqual([...JADE_CAST]);
  expect(sceneCamera(scene, 16, 'auto')).toBe('jade-candles');
  expect(sceneCamera(scene, 50, 'auto')).toBe('jade-paparazzi');
  expect(sceneCamera(scene, 114, 'auto')).toBe('jade-contract');
  expect(sceneCamera(scene, 152, 'auto')).toBe('jade-red-hair');
  expect(sceneCamera(scene, 230, 'auto')).toBe('jade-fade');
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
      expect(peak).toBeGreaterThan(.00014);
    }
  }
});

test('the active mouth stays inside the shot and clear of opaque props on desktop and phone', () => {
  const models = JADE_CAST.map(id => {
    const track = readTrack(id + '.tele.gz');
    return { model: new VoiceModel(track.body, track.sampleRate), track };
  });
  const stage = new JadeAngelStage(models[0], models[1], models[2], models[3]);
  const times = [
    ...scene.cues.map(cue => (cue.start + cue.end) * .5),
    ...JADE_SHOTS.map(shot => shot.time + .055),
  ].sort((a,b) => a-b);
  try {
    for (const [w, h] of [[1280, 720], [375, 430]]) {
      stage.resize(w, h);
      for (const time of times) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, 1, view, cue?.intensity ?? 0, cue?.speaker);
        expect(Object.values(stage.sets).filter(set => set.visible)).toHaveLength(1);
        if (!cue) continue;
        const fig = stage.figures[cue.speaker as JadeId];
        expect(fig.root.visible).toBe(true);
        const mouth = fig.head.scene.localToWorld(new THREE.Vector3(6.5, -1, 0));
        const screen = mouth.clone().project(stage.camera);
        expect(Math.abs(screen.x)).toBeLessThan(.82);
        expect(Math.abs(screen.y)).toBeLessThan(.78);
        expect(screen.z).toBeGreaterThan(-1);
        expect(screen.z).toBeLessThan(1);
        const opaque: THREE.Mesh[] = [];
        stage.scene.traverseVisible(object => {
          if (object instanceof THREE.Mesh && (object.material as THREE.Material).isMaterial &&
              !(object.material as THREE.Material).transparent && stage.props.meshes.includes(object)) opaque.push(object);
        });
        const towards = mouth.clone().sub(stage.camera.position);
        const ray = new THREE.Raycaster(stage.camera.position, towards.clone().normalize(), 0, towards.length() - 2.5);
        const blocking = ray.intersectObjects(opaque, false);
        expect({ view, blocking: blocking.length }).toEqual({ view, blocking: 0 });
      }
    }

    stage.frame(151, true, 12, 'jade-rehearsal', .8, 'jade-lead');
    expect(stage.sets.studio.visible).toBe(true);
    const snap = () => [stage.camera.position.toArray(), stage.dancers.map(d => d.root.position.toArray())];
    const before = snap();
    stage.frame(9, false, 13, 'jade-medallion', 0);
    expect(stage.medallion.visible).toBe(true);
    stage.frame(150, false, 14, 'jade-shoot', 0);
    expect(stage.studioSUV.visible).toBe(true);
    stage.frame(151, true, 15, 'jade-rehearsal', .8, 'jade-lead');
    expect(snap()).toEqual(before);
    stage.frame(230, false, 16, 'jade-fade', 0);
    expect(stage.sets.black.visible).toBe(true);
    expect(Object.values(stage.figures).every(fig => !fig.root.visible)).toBe(true);
  } finally {
    stage.dispose();
    for (const { model } of models) model.dispose();
  }
});
