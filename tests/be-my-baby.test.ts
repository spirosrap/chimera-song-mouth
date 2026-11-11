import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {songCaption} from '../src/band/presentation.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
const file=(name:string)=>readFileSync(new URL(`../public/band/be-my-baby/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='be-my-baby')!;

test('Be My Baby appends three physical singers and the original music without replacing another selection',async()=>{
 expect(BAND_SONGS).toHaveLength(18);expect(BAND_SONGS[14]).toBe(song);
 expect(BAND_SONGS[13].id).toBe('mr-sandman-quartet');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.presentation).toBe('backed-ensemble');expect(a.duration).toBeGreaterThan(160);expect(a.duration).toBeLessThan(161);
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['harmony-low','voice'],['harmony-high','voice'],['backing','backing']]);
 expect(a.parts[3].recordingType).toBe('instrumental');expect(a.parts[3].performance).toBeUndefined();
 for(const p of a.parts.slice(0,3)){
  expect(validPerformance(p.performance!,a.duration)).toBe(true);expect(p.performance!.lyrics).toBe(p.melody!.lyrics);
  expect(p.effects).toBeUndefined();expect(p.beats).toBeUndefined();
 }
});

test('chorus responses keep their own words and recorded register while captions show both concurrent singers',()=>{
 const [lead,low,high]=score.parts;
 expect(lead.performance!.lyrics).not.toBe(low.performance!.lyrics);
 expect(low.performance!.lyrics).toBe(high.performance!.lyrics);
 expect(low.melody!.notes.length).toBeGreaterThan(100);
 const concurrent=score.captions!.find(c=>c.time>37&&c.time<45&&c.text.includes('Lead ·')&&c.text.includes('Backing ·'))!;
 expect(concurrent).toBeDefined();expect(songCaption(score,(concurrent.time+concurrent.end)/2+.35)).toBe(concurrent.text);
 const hz=(i:number)=>score.parts[i].performance!.contour.find(c=>c.time>39)!.hz;
 expect(new Set([hz(0),hz(1),hz(2)]).size).toBeGreaterThan(1);
 for(const p of [low,high]){
  const last=p.performance!.phrases.at(-1)!;expect(last.start+last.phones.reduce((s,x)=>s+x.duration,0)).toBeGreaterThan(159);
  expect(p.performance!.contour.at(-1)!.breath).toBeLessThan(.05);
 }
 for(const t of [4,104])expect(songCaption(score,t)).toBe('');
 expect(songCaption(score,154)).toContain('Backing ·');
});

test('all three mouths load complete moving telemetry on the audio clock; instrumental audio has no head',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
  urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
 });
 expect(urls).toHaveLength(7);expect(urls.every(u=>u.endsWith('?v=be-my-baby-20261110'))).toBe(true);
 expect(loaded[3].track).toBeNull();expect(urls.some(u=>u.includes('backing.tele'))).toBe(false);
 for(let i=0;i<3;i++){
  const raw=gunzipSync(file(score.parts[i].id+'.tele.gz')),track=loaded[i].track!;
  expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);
  expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
  const at=(t:number)=>track.message(track.indexAt(t)).t;
  expect(at(4).gate).toBeLessThan(.01);expect(at(104).gate).toBeLessThan(.01);
  expect(at(40).outRms).toBeGreaterThan(.001);
  const first=Array.from(at(40).artic);at(140);expect(Array.from(at(40).artic)).toEqual(first);
  expect(at(40).clock).toBeCloseTo(40,3);
  expect(first.some((v,k)=>Math.abs(v-at(42.5).artic[k])>.05)).toBe(true);
 }
});

test('backing refrains retain the fourth response and held my starts at its consonant release',()=>{
 const low=score.parts[1],high=score.parts[2];
 expect(low.performance!.lyrics).not.toContain('Whoa');
 expect(low.performance!.lyrics.split('My one and only baby').length).toBeGreaterThan(6);
 const my=low.melody!.notes.find(n=>n.lyricIndex===1)!;
 expect(my.start+.35).toBeGreaterThan(38.4);expect(my.start+.35).toBeLessThan(38.8);
 const lowPitch=low.performance!.contour.filter(c=>c.time>38&&c.time<53);
 const highPitch=high.performance!.contour.filter(c=>c.time>38&&c.time<53);
 expect(highPitch).toHaveLength(lowPitch.length);
 expect(highPitch.every((c,i)=>Math.abs(1200*Math.log2(c.hz/lowPitch[i].hz))<10)).toBe(true);
 for(const t of [51,96,126])expect(songCaption(score,t)).toContain('Whoa');
});

await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('every lead and backing syllable rebuilds with physical closures and breathing instead of an audio effect',()=>{
 for(const p of score.parts.slice(0,3)){
  const gestures=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
  expect(gestures.length).toBeGreaterThan(1500);expect(gestures.length).toBeLessThan(16000);
  expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
  expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
  expect(p.melody!.notes).toHaveLength(syllables.length);
  expect(p.melody!.notes.map(n=>n.lyricIndex)).toEqual(syllables.map((_,i)=>i));
 }
});
