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
const { MilkshakeManStage } = await import('../src/ui/render/milkshake-man.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/milkshake-man/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('Milkshake Man scores Go-Jo and Dancer across the full Eurovision 2025 performance', () => {
  expect(voices.map(p => p.id)).toEqual(['milk-gojo', 'milk-dancer']);
  expect(scene.characters.map(c => c.id)).toEqual(['milk-gojo', 'milk-dancer']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(40);
  expect(scene.shots.length).toBeGreaterThan(20);
  const entry = movieScene('milkshake-man');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('milkshake-20261121');
});

test('Milkshake Man ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(4_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(4_000_000);

  const tracks = scene.characters.map((c, idx) => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    if (idx === 0) expect(track.body.female).toBeLessThan(0.35);
    else expect(track.body.female).toBeGreaterThan(0.75);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new MilkshakeManStage(tracks[0].model, tracks[0].track, tracks[1].model, tracks[1].track);
  try {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.milkshake.cameras) {
        stage.frame(100, true, 1, view, 0.9, 'milk-gojo');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
      }
    }
  } finally {
    stage.dispose();
    tracks.forEach(t => t.model.dispose());
  }
});
