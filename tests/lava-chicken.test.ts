import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { LAVA_CAST } from '../src/scene/lava-chicken.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { LavaChickenStage } = await import('../src/ui/render/lava-chicken.ts');
const read = (name: string) => readFileSync(new URL(`../public/scenes/lava-chicken/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const tracks = scene.characters.map(({ tele }) => {
  const raw = gunzipSync(read(tele + '.gz'));
  return new TeleTrack(Uint8Array.from(raw).buffer);
});

test('the full clip has three synthesized voices and the original instrumental backing', () => {
  const entry = movieScene('lava-chicken');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('lava-chicken-20261122');
  expect(scene.characters.map(character => character.id)).toEqual([...LAVA_CAST]);
  expect(scene.duration).toBeCloseTo(50.828, 2);
  expect(scene.audio).toBe('mix.mp3');
  expect(read(scene.audio).length).toBeGreaterThan(1_000_000);
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  for (const [i, id] of LAVA_CAST.entries()) {
    const part = score.parts.find(part => part.id === id)!;
    const track = tracks[i];
    expect(part.recordingType).toBeUndefined();
    expect(validPerformance(part.performance!, scene.duration)).toBe(true);
    expect(track.rate).toBeCloseTo(20);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    for (const cue of scene.cues.filter(cue => cue.speaker === id)) {
      let peak = 0;
      for (let frame = track.indexAt(cue.start); frame <= track.indexAt(cue.end); frame++) {
        const { t } = track.message(frame);
        expect(t.clock).toBeCloseTo(frame / track.rate, 4);
        expect(Number.isFinite(t.outRms)).toBe(true);
        peak = Math.max(peak, t.outRms);
      }
      expect(peak).toBeGreaterThan(.0001);
    }
  }
});

test('automatic shots keep the speaking mouth in frame and restore the props on seek', () => {
  const actors = tracks.map(track => ({ track, model: new VoiceModel(track.body, track.sampleRate) }));
  const stage = new LavaChickenStage(actors[0], actors[1], actors[2]);
  const figures = [stage.host, stage.guest, stage.customer];
  try {
    for (const [width, height] of [[1280, 720], [375, 430]]) {
      stage.resize(width, height);
      for (const cue of scene.cues) {
        const i = scene.characters.findIndex(character => character.id === cue.speaker);
        const cuts = scene.shots!.map(shot => shot.time + .015).filter(time => cue.start < time && time < cue.end);
        for (const time of [cue.start + .015, ...cuts, cue.end - .015]) {
          stage.frame(time, true, 1, sceneCamera(scene, time, 'auto'), cue.intensity, cue.speaker);
          stage.scene.updateMatrixWorld(true);
          const center = figures[i].head.scene.getWorldPosition(new THREE.Vector3());
          const head = center.clone().project(stage.camera);
          const opaque: THREE.Mesh[] = [];
          stage.scene.traverseVisible(object => {
            if (!(object instanceof THREE.Mesh) || !stage.props.meshes.includes(object)) return;
            if (!(object.material as THREE.Material).transparent) opaque.push(object);
          });
          const direction = center.clone().sub(stage.camera.position);
          const ray = new THREE.Raycaster(stage.camera.position, direction.clone().normalize(), 0, direction.length() - 5);
          expect(ray.intersectObjects(opaque, false)).toHaveLength(0);
          expect(Math.abs(head.x)).toBeLessThan(.84);
          expect(Math.abs(head.y)).toBeLessThan(.84);
          expect(head.z).toBeGreaterThan(-1);
          expect(head.z).toBeLessThan(1);
        }
      }
    }

    stage.frame(14, true, 1, sceneCamera(scene, 14, 'auto'), 0);
    expect(stage.chicken.visible).toBe(true);
    expect(stage.platter.visible).toBe(false);
    const lever = stage.lever.rotation.x;
    const location = stage.chicken.position.toArray();
    stage.frame(42, true, 2, sceneCamera(scene, 42, 'auto'), 0);
    expect(stage.chicken.visible).toBe(false);
    expect(stage.platter.visible).toBe(true);
    stage.frame(0, false, 3, sceneCamera(scene, 0, 'auto'), 0);
    expect(stage.lever.rotation.x).toBeLessThan(lever);
    stage.frame(14, true, 4, sceneCamera(scene, 14, 'auto'), 0);
    expect(stage.chicken.position.toArray()).toEqual(location);
    expect(stage.lever.rotation.x).toBe(lever);
  } finally {
    stage.dispose();
    for (const { model } of actors) model.dispose();
  }
});
