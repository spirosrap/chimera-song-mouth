import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {songCaption} from '../src/band/presentation.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
const file=(name:string)=>readFileSync(new URL(`../public/band/space-oddity/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='space-oddity')!;
const end=(p:{start:number;phones:{duration:number}[]})=>p.start+p.phones.reduce((s,p)=>s+p.duration,0);

test('Space Oddity appends the full recording with physical singer and countdown',async()=>{
 expect(BAND_SONGS).toHaveLength(20);expect(BAND_SONGS[17]).toBe(song);
 expect(BAND_SONGS[16].id).toBe('starman');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.presentation).toBe('backed-ensemble');expect(a.duration).toBeGreaterThan(305);expect(a.duration).toBeLessThan(306);
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['countdown','voice'],['backing','backing']]);
 expect(a.parts[2].recordingType).toBe('instrumental');expect(a.parts[2].performance).toBeUndefined();
 for(const p of a.parts.slice(0,2))expect(validPerformance(p.performance!,a.duration)).toBe(true);
 const lead=a.parts[0];expect(lead.performance!.lyrics).toBe(lead.melody!.lyrics);
 expect(lead.voice?.pressure).toBe(7.2);expect(lead.voice?.brightness).toBe(.46);expect(lead.voice?.drift).toBe(0);
 expect(lead.performance!.phrases[0].start).toBeGreaterThan(34);expect(lead.performance!.phrases[0].start).toBeLessThan(34.4);
 expect(end(lead.performance!.phrases.at(-1)!)).toBeGreaterThan(251.3);expect(end(lead.performance!.phrases.at(-1)!)).toBeLessThan(251.8);
});

test('the launch countdown remains independent while it overlaps sung words',()=>{
 const lead=score.parts[0],countdown=score.parts[1];
 expect(countdown.performance!.lyrics.toLowerCase()).toBe('ten nine eight seven six five four three two one lift off');
 expect(countdown.melody!.notes).toHaveLength(13);expect(countdown.performance!.phrases).toHaveLength(11);
 expect(countdown.volume).toBeLessThan(lead.volume);expect(countdown.pan).toBeLessThan(0);
 for(const phrase of countdown.performance!.phrases){expect(phrase.start).toBeGreaterThan(54);expect(end(phrase)).toBeLessThan(75);}
 const singing=lead.performance!.phrases;
 expect(countdown.performance!.phrases.filter(p=>singing.some(q=>p.start<end(q)&&end(p)>q.start)).length).toBeGreaterThan(7);
 for(const t of [5,30,82,170,280,303])expect(songCaption(score,t)).toBe('');
 for(const t of [35,64,89,138,188,237,250])expect(songCaption(score,t)).not.toBe('');
});

test('both heads seek from their own rendered telemetry without inventing a head for the original music',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
  urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
 });
 expect(urls).toHaveLength(5);expect(urls.every(u=>u.endsWith('?v=space-oddity-20261111'))).toBe(true);
 expect(loaded[2].track).toBeNull();expect(urls.some(u=>u.includes('backing.tele'))).toBe(false);
 for(const i of [0,1]){
  const raw=gunzipSync(file(score.parts[i].id+'.tele.gz')),track=loaded[i].track!;
  expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);
  expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
  for(const t of [5,30,82,170,280,303])expect(track.message(track.indexAt(t)).t.gate).toBeLessThan(.01);
 }
 const lead=loaded[0].track!,countdown=loaded[1].track!;
 for(const t of [35,64,89,138,236.6,250])expect(lead.message(lead.indexAt(t)).t.outRms).toBeGreaterThan(.001);
 for(const t of [57,60.3,63.9,69.4,73.8])expect(countdown.message(countdown.indexAt(t)).t.outRms).toBeGreaterThan(.0001);
 expect(countdown.message(countdown.indexAt(138)).t.gate).toBeLessThan(.01);
 const first=Array.from(lead.message(lead.indexAt(35)).t.artic);lead.message(lead.indexAt(250));
 expect(Array.from(lead.message(lead.indexAt(35)).t.artic)).toEqual(first);
});

await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('all singer and countdown syllables rebuild through the actual mouth engine',()=>{
 for(const p of score.parts.slice(0,2)){
  const gestures=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
  expect(gestures.length).toBeGreaterThan(200);expect(gestures.length).toBeLessThan(16000);
  expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
  if(p.id==='lead')expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
  expect(p.melody!.notes).toHaveLength(syllables.length);
  expect(p.melody!.notes.map(n=>n.lyricIndex)).toEqual(syllables.map((_,i)=>i));
 }
});

test('the low intro, held-note descents and early second Far follow the recording',()=>{
 const p=score.parts[0],c=p.performance!.contour;
 const noteAt=(t:number)=>{const q=c.reduce((a,b)=>Math.abs(a.time-t)<Math.abs(b.time-t)?a:b);return 69+12*Math.log2(q.hz/440);};
 for(const [time,note] of [[35.2,48],[36.1,50],[37.0,47],[89.1,65],[94.5,60],[95.15,57],[108.7,62],[109.2,60],[133.4,65],[134.25,60],[138,64],[142,55],[151.8,62],[157.2,57],[208.25,65],[209.2,60],[236.5,64],[250,57]])expect(Math.abs(noteAt(time)-(note+.052))).toBeLessThan(.16);
 const far=p.melody!.notes.find(n=>n.lyricIndex===236)!;
 expect(far.start+.35).toBeCloseTo(236.02,2);expect(far.duration).toBeGreaterThan(2);
});
