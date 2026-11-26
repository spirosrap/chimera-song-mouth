import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { SQUABBLE_CAST, SQUABBLE_SHOTS, type SquabbleId } from '../src/scene/squabble-up.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { SquabbleUpStage } = await import('../src/ui/render/squabble-up.ts');
const file = (name: string) => new URL(`../public/scenes/squabble-up/${name}`, import.meta.url);
const read = (name: string) => readFileSync(file(name));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
function readTrack(name: string) {
  return new TeleTrack(Uint8Array.from(gunzipSync(read(name))).buffer);
}

test('the complete music-video edit retains three physical voices and the original instrumental', () => {
  const entry = movieScene('squabble-up');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('squabble-up-20261126');
  expect(scene.duration).toBeCloseTo(165.511837, 4);
  expect(scene.shots).toEqual([...SQUABBLE_SHOTS]);
  expect(scene.characters.map(actor => actor.id)).toEqual([...SQUABBLE_CAST]);
  expect(sceneCamera(scene, 3, 'auto')).toBe('squabble-chandelier');
  expect(sceneCamera(scene, 56, 'auto')).toBe('squabble-reader');
  expect(sceneCamera(scene, 96, 'auto')).toBe('squabble-placard');
  expect(sceneCamera(scene, 131, 'auto')).toBe('squabble-lowrider');
  expect(sceneCamera(scene, 164, 'auto')).toBe('squabble-fade');
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  expect(read(scene.audio).length).toBeGreaterThan(5_000_000);
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
  const models = SQUABBLE_CAST.map(id => {
    const track = readTrack(id + '.tele.gz');
    return { model: new VoiceModel(track.body, track.sampleRate), track };
  });
  const stage = new SquabbleUpStage(models[0], models[1], models[2]);
  const times = [
    ...scene.cues.map(cue => (cue.start + cue.end) * .5),
    ...SQUABBLE_SHOTS.map(shot => shot.time + .055),
  ].sort((a,b) => a-b);
  try {
    for (const [w, h] of [[1280, 720], [375, 430]]) {
      stage.resize(w, h);
      for (const time of times) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, 1, view, cue?.intensity ?? 0, cue?.speaker);
        expect(Object.values(stage.lanes).filter(lane => lane.visible)).toHaveLength(1);
        if (!cue) continue;
        const fig = stage.figures[cue.speaker as SquabbleId];
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

    stage.frame(136, true, 12, 'squabble-lowrider', .8, 'squabble-lead');
    expect(stage.lanes.lowrider.visible).toBe(true);
    const snapshot = () => [stage.camera.position.toArray(), stage.sedan.position.y, stage.sedan.rotation.z];
    const before = snapshot();
    stage.frame(2, false, 13, 'squabble-chandelier', 0);
    expect(stage.chandelier.visible).toBe(true);
    expect(stage.lanes.lowrider.visible).toBe(false);
    stage.frame(158, false, 14, 'squabble-parade', 0);
    expect(stage.banner.visible).toBe(true);
    stage.frame(136, true, 15, 'squabble-lowrider', .8, 'squabble-lead');
    expect(snapshot()).toEqual(before);
    stage.frame(164, false, 16, 'squabble-fade', 0);
    expect(stage.room.visible).toBe(false);
    expect(Object.values(stage.figures).every(fig => !fig.root.visible)).toBe(true);
  } finally {
    stage.dispose();
    for (const { model } of models) model.dispose();
  }
});
