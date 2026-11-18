import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
import {movieScene} from '../src/scene/library.ts';
import {sceneCue, validateScene} from '../src/scene/scene.ts';
import {TeleTrack} from '../src/show/tele.ts';

const read = (name: string) => readFileSync(new URL(`../public/scenes/ferto/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const [singer] = score.parts;
const performance = singer.performance!;

test('Ferto scores one physical voice from the first verse through the outro', () => {
  expect(score.parts.map(part => part.kind)).toEqual(['voice']);
  expect(singer.id).toBe(scene.characters[0].id);
  expect(score.duration).toBe(scene.duration);
  expect(validPerformance(performance, scene.duration)).toBe(true);
  expect(scene.cues.length).toBe(performance.phrases.length);
  for (const [index, phrase] of performance.phrases.entries()) {
    const end = phrase.phones.reduce((time, phone) => time + phone.duration, phrase.start);
    expect(scene.cues[index].start).toBeCloseTo(phrase.start, 5);
    expect(scene.cues[index].end).toBeCloseTo(end, 5);
  }
  for (const t of [17.1, 20, 30, 48, 62, 75, 84, 102, 120, 146, 171.1, 175, 194]) {
    expect(sceneCue(scene, t)?.speaker).toBe(scene.characters[0].id);
  }
  expect(sceneCue(scene, 8)).toBeUndefined();
  expect(sceneCue(scene, 204)).toBeUndefined();
  const entry = movieScene('ferto');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('ferto-full-mouth-20261118');
});

test('Ferto ships the full engine mix and synchronized active mouth telemetry', () => {
  const raw = Uint8Array.from(gunzipSync(read(scene.characters[0].tele + '.gz')));
  const track = new TeleTrack(raw.buffer);
  expect(track.duration).toBeCloseTo(scene.duration, 1);
  expect(track.sampleRate).toBe(48000);
  expect(track.rate).toBe(20);
  expect(track.body.female).toBeCloseTo(singer.body.female);
  expect(track.body.child).toBeCloseTo(singer.body.child);
  expect(read(scene.audio).byteLength).toBeGreaterThan(5_000_000);
  for (const cue of scene.cues) {
    let peak = 0;
    for (let i = track.indexAt(cue.start); i <= track.indexAt(cue.end); i++) {
      const {t} = track.message(i);
      expect(t.clock).toBeCloseTo(i / track.rate, 4);
      expect(t.artic.every(Number.isFinite)).toBe(true);
      peak = Math.max(peak, t.outRms);
    }
    expect(peak).toBeGreaterThan(.0001);
  }
});
