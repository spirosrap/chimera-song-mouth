import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { validPerformance } from '../src/band/performance.ts';
import type { Arrangement } from '../src/band/types.ts';
import { EXPECTATIONS_CAST, EXPECTATIONS_SHOTS } from '../src/scene/expectations.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, sceneViewChoices, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';
import { initEngine } from './harness.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { ExpectationsStage } = await import('../src/ui/render/expectations.ts');
const read = (file: string) => readFileSync(new URL(`../public/scenes/expectations/${file}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());

function trackFor(id: string) {
  return new TeleTrack(Uint8Array.from(gunzipSync(read(id + '.tele.gz'))).buffer);
}

test('the full game-show edit has a physical duet, host and announcer on the source clock', () => {
  const entry = movieScene('expectations');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('expectations-20261126');
  expect(scene.duration).toBeCloseTo(292.687528, 5);
  expect(scene.characters.map(actor => actor.id)).toEqual([...EXPECTATIONS_CAST]);
  expect(scene.shots).toEqual([...EXPECTATIONS_SHOTS]);
  expect(sceneViewChoices(scene)).toContain('expect-johnny');
  expect(sceneViewChoices(scene)).not.toContain('jessep');
  expect(sceneCamera(scene, 73, 'auto')).toBe('expect-letterboard');
  expect(sceneCamera(scene, 152, 'auto')).toBe('expect-survey');
  expect(sceneCamera(scene, 270, 'auto')).toBe('expect-finale');
  expect(sceneCamera(scene, 289, 'auto')).toBe('expect-goodnight');
  expect(sceneCue(scene, 9)?.speaker).toBe('expect-announcer');
  expect(sceneCue(scene, 36)?.speaker).toBe('expect-johnny');
  expect(sceneCue(scene, 56)?.speaker).toBe('expect-olivia');
  expect(sceneCue(scene, 164)?.speaker).toBe('expect-chappell');
  expect(sceneCue(scene, 288)?.speaker).toBe('expect-johnny');
  expect(sceneCue(scene, 29)).toBeUndefined();
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  expect(read(scene.audio).length).toBeGreaterThan(9_000_000);
  for (const actor of scene.characters) {
    const part = score.parts.find(candidate => candidate.id === actor.id)!;
    expect(part.recordingType).toBeUndefined();
    expect(validPerformance(part.performance!, scene.duration)).toBe(true);
    const track = trackFor(actor.id);
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
      expect({ cue: cue.start, sounds: peak > .00015 }).toEqual({ cue: cue.start, sounds: true });
    }
  }
  for (const id of ['expect-olivia', 'expect-chappell']) {
    expect(trackFor(id).message(trackFor(id).indexAt(282)).t.outRms).toBeGreaterThan(.0001);
  }
});

test('automatic camera cuts keep the active mouth on screen and unobstructed on desktop and phone', () => {
  const actors = EXPECTATIONS_CAST.map(id => {
    const track = trackFor(id);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });
  const stage = new ExpectationsStage(actors[0], actors[1], actors[2], actors[3]);
  const times = [
    ...scene.cues.flatMap(cue => [cue.start + .055, (cue.start + cue.end) / 2, cue.end - .055]),
    ...EXPECTATIONS_SHOTS.map(shot => shot.time + .055),
    288.4, 257, 154, 11.6, 72.9, 195, 44.9,
  ];
  const props = new Set(stage.props.meshes);
  try {
    for (const [w, h] of [[1280, 720], [375, 430]]) {
      stage.resize(w, h);
      for (const [epoch, time] of times.entries()) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, epoch, view, cue?.intensity ?? 0, cue?.speaker);
        expect([...stage.sets.values()].filter(group => group.visible)).toHaveLength(1);
        if (!cue || !EXPECTATIONS_CAST.some(id => id === cue.speaker)) continue;
        const figure = stage.figures[cue.speaker as typeof EXPECTATIONS_CAST[number]];
        expect(figure.root.visible).toBe(true);
        const mouth = figure.head.scene.localToWorld(new THREE.Vector3(6.5, -1, 0));
        const screen = mouth.clone().project(stage.camera);
        expect({ time, view, inside: Math.abs(screen.x) < .95 && Math.abs(screen.y) < .89 && screen.z > -1 && screen.z < 1 })
          .toEqual({ time, view, inside: true });
        const opaque: THREE.Mesh[] = [];
        stage.scene.traverseVisible(node => {
          if (node instanceof THREE.Mesh && props.has(node) && !(node.material as THREE.Material).transparent) opaque.push(node);
        });
        const direction = mouth.clone().sub(stage.camera.position);
        stage.scene.updateMatrixWorld(true);
        const ray = new THREE.Raycaster(stage.camera.position, direction.clone().normalize(), 0, direction.length() - 2.5);
        const blockers = ray.intersectObjects(opaque).length;
        expect({ time, view, blockers }).toEqual({ time, view, blockers: 0 });
      }
    }
  } finally {
    stage.dispose();
    actors.forEach(actor => actor.model.dispose());
  }
}, 15000);
