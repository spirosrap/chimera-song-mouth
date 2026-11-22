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
const { DojaGorgeousStage } = await import('../src/ui/render/doja-gorgeous.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/doja-gorgeous/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('Gorgeous scores Lead Vocal and Backing Echoes across the full 4:26 video', () => {
  expect(voices.map(p => p.id)).toEqual(['dg-lead', 'dg-echo']);
  expect(scene.characters.map(c => c.id)).toEqual(['dg-lead', 'dg-echo']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(25);
  expect(scene.shots.length).toBeGreaterThan(18);
  const entry = movieScene('doja-gorgeous');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('dojagorgeous-20261122');
});

test('Gorgeous ships full engine mix, synchronized telemetry, and deterministic 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(6_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(5_000_000);

  const tracks = scene.characters.map(c => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    expect(track.body.female).toBeGreaterThan(0.8);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new DojaGorgeousStage(tracks[0].model, tracks[0].track, tracks[1].model, tracks[1].track);
  try {
    expect(stage.lead.head.scene.scale.x).toBeGreaterThanOrEqual(2);
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.dojagorgeous.cameras) {
        stage.frame(120, true, 1, view, 0.9, 'dg-lead');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
        if (view !== 'dg-echo') {
          const headPos = stage.lead.root.position.clone().project(stage.camera);
          expect(Math.abs(headPos.x)).toBeLessThan(0.75);
          expect(Math.abs(headPos.y)).toBeLessThan(0.55);
          expect(headPos.z).toBeLessThan(1);
        }
      }
    }
  } finally {
    stage.dispose();
    tracks.forEach(t => t.model.dispose());
  }
});
