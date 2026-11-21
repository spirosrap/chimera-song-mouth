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
const { TheCureStage } = await import('../src/ui/render/the-cure.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/the-cure/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('the cure scores one physical female voice from crimson yarn tray through dollhouse finale', () => {
  expect(voices.map(p => p.id)).toEqual(['cure-olivia']);
  expect(scene.characters.map(c => c.id)).toEqual(['cure-olivia']);
  expect(score.duration).toBe(scene.duration);
  expect(validPerformance(voices[0].performance!, scene.duration)).toBe(true);
  expect(scene.cues.length).toBeGreaterThan(30);
  expect(scene.shots.length).toBeGreaterThan(25);
  const entry = movieScene('the-cure');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('the-cure-20261121-v2');
});

test('the cure ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(7_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(7_000_000);

  const raw = Uint8Array.from(gunzipSync(read(scene.characters[0].tele + '.gz')));
  const track = new TeleTrack(raw.buffer);
  expect(track.duration).toBeCloseTo(scene.duration, 1);
  expect(track.sampleRate).toBe(48000);
  expect(track.rate).toBe(20);
  expect(track.body.female).toBeGreaterThan(0.8);

  const model = new VoiceModel(track.body, track.sampleRate);
  const stage = new TheCureStage(model, track);
  try {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.thecure.cameras) {
        stage.frame(200, true, 1, view, 0.9, 'cure-olivia');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
      }
    }
  } finally {
    stage.dispose();
    model.dispose();
  }
});
