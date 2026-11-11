import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';

const file=(name:string)=>readFileSync(new URL(`../public/band/cry-me-a-river/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='cry-me-a-river')!;

test('Cry Me a River appends the complete Julie London recording with a physical singer',async()=>{
 expect(BAND_SONGS[18]).toBe(song);
 expect(BAND_SONGS[17].id).toBe('space-oddity');
 expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.duration).toBeGreaterThan(178.5);expect(a.duration).toBeLessThan(180);
 expect(a.presentation).toBe('backed-solo');
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['backing','backing']]);
 const lead=a.parts[0];expect(validPerformance(lead.performance!,a.duration)).toBe(true);
 expect(lead.performance!.lyrics).toBe(lead.melody!.lyrics);
 expect(lead.performance!.phrases.length).toBeGreaterThan(15);
 const last=lead.performance!.phrases.at(-1)!;
 expect(last.start+last.phones.reduce((s,p)=>s+p.duration,0)).toBeGreaterThan(160);
 expect(a.parts[1].recordingType).toBe('instrumental');expect(a.parts[1].performance).toBeUndefined();
});

test('the mouth follows its own full-length telemetry and leaves the recorded music independent',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
  urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
 });
 expect(urls).toHaveLength(3);expect(urls.every(u=>u.endsWith('?v=cry-me-a-river-20261111'))).toBe(true);
 expect(loaded[1].track).toBeNull();expect(urls.some(u=>u.includes('backing.tele'))).toBe(false);
 const raw=gunzipSync(file('lead.tele.gz')),track=loaded[0].track!;
 expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);
 expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
 expect(track.message(track.indexAt(.5)).t.gate).toBeLessThan(.01);
 const phrases=score.parts[0].performance!.phrases;
 for(const p of [phrases[0],phrases[Math.floor(phrases.length/2)],phrases.at(-1)!]){
  const span=p.phones.reduce((s,p)=>s+p.duration,0);
  const times=Array.from({length:5},(_,i)=>p.start+span*(i+1)/6);
  expect(Math.max(...times.map(t=>track.message(track.indexAt(t)).t.outRms))).toBeGreaterThan(.001);
 }
});

await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('the entire singer can rebuild as timed mouth gestures without the original vocal',()=>{
 const p=score.parts[0],gestures=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
 expect(gestures.length).toBeGreaterThan(500);expect(gestures.length).toBeLessThan(16000);
 expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
 expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
 expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
 expect(p.melody!.notes.map(n=>n.lyricIndex)).toEqual(syllables.map((_,i)=>i));
});
