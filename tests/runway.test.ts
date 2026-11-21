import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
import {movieScene} from '../src/scene/library.ts';
import {validateScene} from '../src/scene/scene.ts';
import {TeleTrack} from '../src/show/tele.ts';

const read = (name: string) => readFileSync(new URL(`../public/scenes/runway/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const voices = score.parts.filter(p => p.kind === 'voice');

test('RUNWAY scores two physical voices from intro through outro', () => {
  expect(voices.map(p => p.id)).toEqual(['runway-gaga', 'runway-doechii']);
  expect(scene.characters.map(c => c.id)).toEqual(['runway-gaga', 'runway-doechii']);
  expect(score.duration).toBe(scene.duration);
  for (const v of voices) {
    expect(validPerformance(v.performance!, scene.duration)).toBe(true);
  }
  expect(scene.cues.length).toBeGreaterThan(90);
  const entry = movieScene('runway');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('runway-20261121');
});

test('RUNWAY ships full engine mix and synchronized mouth telemetry for both characters', () => {
  expect(read('mix.mp3').byteLength).toBeGreaterThan(4_000_000);
  expect(read('backing.mp3').byteLength).toBeGreaterThan(4_000_000);

  for (const c of scene.characters) {
    const raw = Uint8Array.from(gunzipSync(read(c.tele + '.gz')));
    const track = new TeleTrack(raw.buffer);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    expect(track.sampleRate).toBe(48000);
    expect(track.rate).toBe(20);
    expect(track.body.female).toBeGreaterThan(0.8);
  }
});
