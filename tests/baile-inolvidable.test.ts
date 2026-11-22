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
const { BaileInolvidableStage } = await import('../src/ui/render/baile-inolvidable.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/baile-inolvidable/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('BAILE INoLVIDABLE scores Bad Bunny and Salsa Coro across the full 6:18 salsa video', () => {
  expect(voices.map(p => p.id)).toEqual(['baile-benito', 'baile-coro']);
  expect(scene.characters.map(c => c.id)).toEqual(['baile-benito', 'baile-coro']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(25);
  expect(scene.shots.length).toBeGreaterThan(18);
  const entry = movieScene('baile-inolvidable');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('baile-20261122');
});

test('BAILE INoLVIDABLE ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(7_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(6_000_000);

  const tracks = scene.characters.map(c => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    expect(track.body.female).toBeLessThan(0.15);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new BaileInolvidableStage(tracks[0].model, tracks[0].track, tracks[1].model, tracks[1].track);
  try {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.baile.cameras) {
        stage.frame(290, true, 1, view, 0.9, 'baile-benito');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
      }
    }
  } finally {
    stage.dispose();
    tracks.forEach(t => t.model.dispose());
  }
});
