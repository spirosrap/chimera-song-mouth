import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import { validPerformance } from '../src/band/performance.ts';
import type { Arrangement } from '../src/band/types.ts';
import { FUTURE_CAST, FUTURE_SHOTS } from '../src/scene/lonely-in-the-future.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, sceneViewChoices, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { LonelyFutureStage } = await import('../src/ui/render/lonely-in-the-future.ts');
const read = (name: string) => readFileSync(new URL(`../public/scenes/lonely-in-the-future/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());

function readTrack(id: string) {
  return new TeleTrack(Uint8Array.from(gunzipSync(read(id + '.tele.gz'))).buffer);
}

test('the complete puppet video retains the original accompaniment and two physical tracks', () => {
  const entry = movieScene('lonely-in-the-future');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('lonely-future-20261126');
  expect(scene.duration).toBeCloseTo(260.202812, 5);
  expect(scene.shots).toEqual([...FUTURE_SHOTS]);
  expect(scene.characters.map(actor => actor.id)).toEqual([...FUTURE_CAST]);
  expect(sceneViewChoices(scene)).toContain('future-bach');
  expect(sceneViewChoices(scene)).toContain('future-julian');
  expect(sceneViewChoices(scene)).not.toContain('jessep');
  expect(sceneCamera(scene, 90, 'auto')).toBe('future-bach');
  expect(sceneCamera(scene, 198, 'auto')).toBe('future-orbit');
  expect(sceneCamera(scene, 223, 'auto')).toBe('future-credits');
  expect(sceneCamera(scene, 252, 'auto')).toBe('future-meditation');
  expect(sceneCue(scene, 110)).toBeUndefined();
  expect(sceneCue(scene, 220)).toBeUndefined();
  expect(sceneCue(scene, 251)?.speaker).toBe('future-broadcast');
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  expect(read(scene.audio).length).toBeGreaterThan(8_000_000);
  for (const actor of scene.characters) {
    const part = score.parts.find(candidate => candidate.id === actor.id)!;
    expect(part.recordingType).toBeUndefined();
    expect(validPerformance(part.performance!, scene.duration)).toBe(true);
    const track = readTrack(actor.id);
    expect(track.rate).toBe(20);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    for (const cue of scene.cues.filter(cue => cue.speaker === actor.id)) {
      let peak = 0;
      for (let frame = track.indexAt(cue.start); frame <= track.indexAt(cue.end); frame++) {
        const { t } = track.message(frame);
        expect(t.clock).toBeCloseTo(frame / track.rate, 4);
        expect(Number.isFinite(t.outRms)).toBe(true);
        peak = Math.max(peak, t.outRms);
      }
      expect(peak).toBeGreaterThan(.00015);
    }
  }
});

test('on desktop and phone, physical mouths stay visible through cinematics and seeks', () => {
  const actors = FUTURE_CAST.map(id => {
    const track = readTrack(id);
    return { model: new VoiceModel(track.body, track.sampleRate), track };
  });
  const stage = new LonelyFutureStage(actors[0], actors[1]);
  const times = [
    ...scene.cues.flatMap(cue => [cue.start + .055, (cue.start + cue.end) / 2, cue.end - .055]),
    ...FUTURE_SHOTS.map(shot => shot.time + .055),
    258.2, 232, 8.91, 196.1, 89.4, 150.3, 249.6,
  ];
  try {
    for (const [w, h] of [[1280, 720], [375, 430]]) {
      stage.resize(w, h);
      for (const [epoch, time] of times.entries()) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, epoch, view, cue?.intensity ?? 0, cue?.speaker);
        expect([...stage.sets.values()].filter(group => group.visible)).toHaveLength(1);
        if (!cue) continue;
        const figure = cue.speaker === 'future-julian' ? stage.singer : stage.broadcast;
        expect(figure.root.visible).toBe(true);
        const mouth = figure.head.scene.localToWorld(new THREE.Vector3(6.5, -1, 0));
        const screen = mouth.clone().project(stage.camera);
        expect({ time, view, inside: Math.abs(screen.x) < .94 && Math.abs(screen.y) < .91 && screen.z > -1 && screen.z < 1 })
          .toEqual({ time, view, inside: true });

        const opaque: THREE.Mesh[] = [];
        stage.scene.traverseVisible(node => {
          if (node instanceof THREE.Mesh && stage.props.meshes.includes(node) &&
            !(node.material as THREE.Material).transparent) opaque.push(node);
        });
        const direction = mouth.clone().sub(stage.camera.position);
        stage.scene.updateMatrixWorld(true);
        const ray = new THREE.Raycaster(stage.camera.position, direction.clone().normalize(), 0, direction.length() - 2.5);
        const blockers = ray.intersectObjects(opaque);
        expect({ time, view, blockers: blockers.length }).toEqual({ time, view, blockers: 0 });
      }
    }
  } finally {
    stage.dispose();
    actors.forEach(actor => actor.model.dispose());
  }
});
