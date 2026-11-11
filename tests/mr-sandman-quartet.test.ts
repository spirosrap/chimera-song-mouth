import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {featuredVoice,songCaption} from '../src/band/presentation.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';

const file=(name:string)=>readFileSync(new URL(`../public/band/mr-sandman-quartet/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='mr-sandman-quartet')!;

test('Mr Sandman adds a full original-lyrics physical quartet alongside Night Train and Blue Moon',async()=>{
 expect(BAND_SONGS[13]).toBe(song);expect(BAND_SONGS).toHaveLength(20);
 expect(BAND_SONGS[4].id).toBe('night-train-quartet');expect(BAND_SONGS[12].id).toBe('blue-moon');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.presentation).toBe('quartet');expect(a.duration).toBeGreaterThan(145);expect(a.duration).toBeLessThan(147);
 expect(a.parts.map(p=>p.id)).toEqual(['bass','lead','alto','soprano']);
 for(const p of a.parts){
  expect(p.kind).toBe('voice');expect(p.effects).toBeUndefined();expect(p.beats).toBeUndefined();
  expect(validPerformance(p.performance!,a.duration)).toBe(true);expect(p.performance!.lyrics).toBe(p.melody!.lyrics);
  const end=p.performance!.phrases.at(-1)!;
  expect(end.start+end.phones.reduce((s,x)=>s+x.duration,0)).toBeGreaterThan(145.7);
 }
 expect(a.parts[0].melody!.lyrics).toContain('Pagliacci');expect(a.parts[0].melody!.lyrics).toContain('Liberace');
});

test('adjacent bum-bum attacks and pickups survive instead of being dropped as overlaps',()=>{
 const opening=[
  [0,1.867,2.133,3.733,4.267,6.133,6.4],
  [.267,1.6,2.4,4.533,5.867,6.667],
  [.533,1.333,2.667,4.8,5.6,6.933],
  [.8,1.067,2.933,3.2,5.067,5.333,7.2,7.467],
 ];
 score.parts.forEach((p,i)=>{
  const notes=p.melody!.notes.filter(n=>n.start<8);
  expect(notes.map(n=>Math.round(n.start*1000)/1000)).toEqual(opening[i]);
  expect(notes.every(n=>n.lyricIndex===0&&n.duration<=.23)).toBe(true);
  for(const n of notes){
   const phrase=p.performance!.phrases.find(ph=>Math.abs(ph.start-(n.start+.35-.047))<.04);
   expect(phrase).toBeDefined();expect(phrase!.phones[0].ipa).toBe('b');
   expect(phrase!.phones.at(-1)!.ipa).toBe('m');
  }
 });
 expect(score.parts[0].melody!.notes.filter(n=>n.start>8&&n.start<42&&n.lyricIndex===0).length).toBeGreaterThan(50);
 expect(score.parts[0].melody!.notes.filter(n=>n.start>42&&n.start<50.67&&n.lyricIndex===0).length).toBeGreaterThan(8);
});

test('the bass answer and changing lead use the same clock as captions and syllables',()=>{
 expect(featuredVoice(score,10)).toBe('lead');expect(featuredVoice(score,60)).toBe('alto');
 expect(featuredVoice(score,95.5)).toBe('bass');expect(featuredVoice(score,103)).toBe('soprano');
 expect(songCaption(score,95.5)).toBe('Yes?');expect(songCaption(score,97)).toBe('Bring us a dream.');
 expect(songCaption(score,140)).toBe('A dream…');
 const response=score.parts[0].melody!.notes.filter(n=>n.lyricIndex===1);
 expect(response).toHaveLength(1);expect(response[0].start).toBeCloseTo(94.96,2);
 expect(score.parts.slice(1).every(p=>!p.melody!.notes.some(n=>n.lyricIndex===1))).toBe(true);
});

test('all four complete audio channels load with their own finite moving engine telemetry',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
  urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
 });
 expect(urls).toHaveLength(8);expect(urls.every(u=>u.endsWith('?v=sandman-quartet-20261110'))).toBe(true);
 for(const [i,part] of score.parts.entries()){
  const raw=gunzipSync(file(part.id+'.tele.gz')),track=loaded[i].track!;
  expect(track).toBeInstanceOf(TeleTrack);expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);
  expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
  const at=(t:number)=>track.message(track.indexAt(t)).t;
  expect(at(140).outRms).toBeGreaterThan(.001);
  const first=Array.from(at(11.5).artic);at(140);expect(Array.from(at(11.5).artic)).toEqual(first);
  expect(at(11.5).clock).toBeCloseTo(11.5,3);
  expect(first.some((v,k)=>Math.abs(v-at(20).artic[k])>.05)).toBe(true);
 }
});

await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('re-rendering uses physical articulation, explicit consonants and independent harmony contours',()=>{
 for(const p of score.parts){
  const gestures=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
  expect(gestures.length).toBeGreaterThan(3000);expect(gestures.length).toBeLessThan(16000);
  expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
  expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
  expect(p.melody!.notes.every(n=>n.lyricIndex!>=0&&n.lyricIndex!<syllables.length)).toBe(true);
 }
 expect(new Set(score.parts.map(p=>p.performance!.contour.find(c=>c.time>11)!.hz)).size).toBeGreaterThan(2);
});
