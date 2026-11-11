import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {songCaption} from '../src/band/presentation.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';

const file=(name:string)=>readFileSync(new URL(`../public/band/blue-moon/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='blue-moon')!;

test('Blue Moon appends a full physical singer and original orchestra without changing the previous selections',async()=>{
  expect(BAND_SONGS.map(s=>s.id)).toEqual(['house-of-the-rising-sun','all-made-of-air','neon-current','bicep-glue','night-train-quartet','synnefoula','megalovania','bicep-apricots','ta-paidia-tou-peiraia','rodehihi-den-xanakano-fylaki','small-hours','country-roads','blue-moon','mr-sandman-quartet','be-my-baby','life-on-mars','starman','space-oddity']);
  expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
  const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
  expect(a.duration).toBeGreaterThan(171);expect(a.duration).toBeLessThan(173);
  expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['backing','backing']]);
  const lead=a.parts[0];
  expect(validPerformance(lead.performance!,a.duration)).toBe(true);
  expect(lead.performance!.lyrics).toBe(lead.melody!.lyrics);
  expect(lead.performance!.phrases).toHaveLength(26);expect(lead.melody!.notes).toHaveLength(200);
  expect(lead.effects).toBeUndefined();expect(lead.vibrato).toBe(0);
  const last=lead.performance!.phrases.at(-1)!;
  expect(last.start+last.phones.reduce((s,p)=>s+p.duration,0)).toBeGreaterThan(168);
});

test('real phrase rests remain silent captions and do not become held lyric syllables',()=>{
  expect(songCaption(score,18)).not.toBe('');
  for(const time of [5,19.8,90,110,171])expect(songCaption(score,time)).toBe('');
  expect(songCaption(score,160)).not.toBe('');
  for(const c of score.captions!)expect(c.end).toBeGreaterThan(c.time);
});

test('the orchestra loads in stereo without mouth telemetry and the lead covers the full song',async()=>{
  const urls:string[]=[];
  const loaded=await loadBandAssets('blue-moon',score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
    urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
  });
  expect(urls).toHaveLength(3);expect(urls.some(u=>u.includes('backing.tele'))).toBe(false);
  expect(loaded[1].track).toBeNull();
  expect(Math.abs(loaded[0].track!.duration-score.duration)).toBeLessThan(.051);
  expect(urls.every(u=>u.endsWith('?v=phonetic-mouth-20261110'))).toBe(true);
});

test('the generated mouth articulates the full vocal, rests in the instrumental break and seeks on its own audio clock',()=>{
  const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
  const all=new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4);
  expect(all.every(Number.isFinite)).toBe(true);
  const at=(t:number)=>track.message(track.indexAt(t)).t;
  expect(at(90).gate).toBeLessThan(.01);expect(at(5).gate).toBeLessThan(.01);
  expect(at(18).outRms).toBeGreaterThan(.001);expect(at(164).outRms).toBeGreaterThan(.001);
  const first=Array.from(at(18).artic);at(164);expect(Array.from(at(18).artic)).toEqual(first);
  expect(at(18).clock).toBeCloseTo(18,3);
  expect(first.some((v,i)=>Math.abs(v-at(22).artic[i])>.05)).toBe(true);
});

await initEngine();
const {EnglishG2P}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('the app rerenders the prepared phonetics, with explicit closures and source pitch rather than an audio effect',()=>{
  const gestures=planPart(score.parts[0]);
  expect(gestures.length).toBeGreaterThan(3000);expect(gestures.length).toBeLessThan(16000);
  expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0)).toBe(true);
  expect(gestures.some(g=>g.targets.f0!==undefined)).toBe(true);
  expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
  expect(gestures.every(g=>g.t1<score.duration)).toBe(true);
});
