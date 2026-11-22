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
const { ReturnToInnocenceStage } = await import('../src/ui/render/return-to-innocence.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/return-to-innocence/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('Return To Innocence scores Angel X, Sandra and Amis Chant across the reverse-time video', () => {
  expect(voices.map(p => p.id)).toEqual(['enigma-angel', 'enigma-sandra', 'enigma-chant']);
  expect(scene.characters.map(c => c.id)).toEqual(['enigma-angel', 'enigma-sandra', 'enigma-chant']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(25);
  expect(scene.shots.length).toBeGreaterThan(20);
  const entry = movieScene('return-to-innocence');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('enigma-20261122-v2');
});

test('Return To Innocence ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(5_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(5_000_000);

  const tracks = scene.characters.map((c, idx) => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    if (idx === 1) expect(track.body.female).toBeGreaterThan(0.75);
    else expect(track.body.female).toBeLessThan(0.35);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new ReturnToInnocenceStage(
    tracks[0].model, tracks[0].track,
    tracks[1].model, tracks[1].track,
    tracks[2].model, tracks[2].track,
  );
  try {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.enigma.cameras) {
        stage.frame(140, true, 1, view, 0.85, 'enigma-angel');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
      }
    }
  } finally {
    stage.dispose();
    tracks.forEach(t => t.model.dispose());
  }
});
