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
const { BangarangaStage } = await import('../src/ui/render/bangaranga.ts');
const { VoiceModel } = await import('../src/ui/analysis.ts');

const read = (name: string) => readFileSync(new URL(`../public/scenes/bangaranga/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('Bangaranga scores Lead Vocal and Riot Chants across the full 3:25 Eurovision Grand Final video', () => {
  expect(voices.map(p => p.id)).toEqual(['bg-lead', 'bg-chant']);
  expect(scene.characters.map(c => c.id)).toEqual(['bg-lead', 'bg-chant']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(25);
  expect(scene.shots.length).toBeGreaterThan(18);
  const entry = movieScene('bangaranga');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('bangaranga-20261122');
});

test('Bangaranga ships full engine mix, synchronized telemetry, and hero-framed 3D cameras', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(4_500_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(3_500_000);

  const tracks = scene.characters.map(c => {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    expect(track.body.female).toBeGreaterThan(0.8);
    return { track, model: new VoiceModel(track.body, track.sampleRate) };
  });

  const stage = new BangarangaStage(tracks[0].model, tracks[0].track, tracks[1].model, tracks[1].track);
  try {
    expect(stage.lead.head.scene.scale.x).toBeGreaterThanOrEqual(2);
    expect(stage.detainees.length).toBe(3);
    expect(stage.roomChairs.length).toBe(5);
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      stage.resize(w, h);
      for (const view of SCENE_SETTINGS.bangaranga.cameras) {
        stage.frame(50, true, 1, view, 0.9, 'bg-lead');
        expect(stage.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
        // Hands must stay below head level (local y < 0) rather than waving above the head
        for (const hand of [...stage.lead.hands, ...stage.chant.hands]) {
          expect(hand.position.y).toBeLessThan(0);
        }
        if (view !== 'bg-chant') {
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
