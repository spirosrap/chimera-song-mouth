import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { movieScene } from '../src/scene/library.ts';
import { validateScene, SCENE_SETTINGS } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';
import { initEngine } from './harness.ts';

await initEngine();
const { ElevatorOperatorStage } = await import('../src/ui/render/elevator-operator.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/elevator-operator/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('ELEVATOR OPERATOR scores three physical voices from night alley through zero-G finale', () => {
  expect(voices.map(p => p.id)).toEqual(['elev-nico', 'elev-kevin', 'elev-operator']);
  expect(scene.characters.map(c => c.id)).toEqual(['elev-nico', 'elev-kevin', 'elev-operator']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(60);
  expect(scene.shots.length).toBeGreaterThan(35);
  const entry = movieScene('elevator-operator');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('elevator-20261121');
});

test('ELEVATOR OPERATOR ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(4_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(4_000_000);

  const tracks = scene.characters.map(c => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    expect(track.body.female).toBeLessThan(0.3);
    return { id: c.id as 'elev-nico' | 'elev-kevin' | 'elev-operator', track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new ElevatorOperatorStage(tracks);
  try {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.elevator.cameras) {
        stage.frame(82, true, 1, view, 0.9, 'elev-nico');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
      }
    }
  } finally {
    stage.dispose();
    tracks.forEach(t => t.model.dispose());
  }
});
