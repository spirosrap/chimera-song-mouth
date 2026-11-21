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
const { IJustMightStage } = await import('../src/ui/render/i-just-might.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/i-just-might/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('I Just Might scores Lead Bruno and Backing Brunos across the full 70s disco studio video', () => {
  expect(voices.map(p => p.id)).toEqual(['might-bruno', 'might-chorus']);
  expect(scene.characters.map(c => c.id)).toEqual(['might-bruno', 'might-chorus']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(35);
  expect(scene.shots.length).toBeGreaterThan(25);
  const entry = movieScene('i-just-might');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('i-just-might-20261121-v2');
});

test('I Just Might ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(4_500_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(4_500_000);

  const tracks = scene.characters.map(c => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    expect(track.body.female).toBeLessThan(0.35);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new IJustMightStage(tracks[0].model, tracks[0].track, tracks[1].model, tracks[1].track);
  try {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.ijustmight.cameras) {
        stage.frame(115, true, 1, view, 0.9, 'might-bruno');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
      }
    }
  } finally {
    stage.dispose();
    tracks.forEach(t => t.model.dispose());
  }
});
