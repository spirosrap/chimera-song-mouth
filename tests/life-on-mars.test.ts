import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {songCaption} from '../src/band/presentation.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
const file=(name:string)=>readFileSync(new URL(`../public/band/life-on-mars/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='life-on-mars')!;

test('Life on Mars adds a full physical singer and original music as the sixteenth selection',async()=>{
 expect(BAND_SONGS).toHaveLength(20);expect(BAND_SONGS[15]).toBe(song);
 expect(BAND_SONGS[14].id).toBe('be-my-baby');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.presentation).toBe('backed-solo');expect(a.duration).toBeGreaterThan(242);expect(a.duration).toBeLessThan(244);
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['backing','backing']]);
 expect(a.parts[1].recordingType).toBe('instrumental');expect(a.parts[1].performance).toBeUndefined();
 const lead=a.parts[0];expect(validPerformance(lead.performance!,a.duration)).toBe(true);
 expect(lead.performance!.lyrics).toBe(lead.melody!.lyrics);expect(lead.effects).toBeUndefined();expect(lead.vibrato).toBe(0);
 expect(lead.voice?.pressure).toBe(7.2);expect(lead.voice?.brightness).toBe(.46);
 const last=lead.performance!.phrases.at(-1)!;expect(last.start+last.phones.reduce((s,p)=>s+p.duration,0)).toBeGreaterThan(192);
 expect(last.start+last.phones.reduce((s,p)=>s+p.duration,0)).toBeLessThan(196);
});

test('instrumental passages have no invented lyrics while both verses and the long final note retain captions',()=>{
 for(const t of [.5,98,218,241])expect(songCaption(score,t)).toBe('');
 for(const t of [8,84,113,191])expect(songCaption(score,t)).not.toBe('');
 expect(score.parts[0].performance!.lyrics.toLowerCase()).not.toContain('thank you');
 expect(songCaption(score,191).toLowerCase()).toContain('mars');
});

test('the singer loads complete moving telemetry and seeks on the audio clock; original music has no synthetic head',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
  urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
 });
 expect(urls).toHaveLength(3);expect(urls.every(u=>u.endsWith('?v=life-on-mars-20261111'))).toBe(true);
 expect(loaded[1].track).toBeNull();expect(urls.some(u=>u.includes('backing.tele'))).toBe(false);
 const raw=gunzipSync(file('lead.tele.gz')),track=loaded[0].track!;
 expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);
 expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
 const at=(t:number)=>track.message(track.indexAt(t)).t;
 for(const t of [.5,98,218])expect(at(t).gate).toBeLessThan(.01);
 for(const t of [8,84,191])expect(at(t).outRms).toBeGreaterThan(.001);
 const first=Array.from(at(8).artic);at(191);expect(Array.from(at(8).artic)).toEqual(first);
 expect(at(8).clock).toBeCloseTo(8,3);expect(first.some((v,k)=>Math.abs(v-at(10).artic[k])>.05)).toBe(true);
});

await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('every syllable rebuilds through physical closures, airflow and continuous pitch instead of an audio effect',()=>{
 const p=score.parts[0],gestures=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
 expect(gestures.length).toBeGreaterThan(4000);expect(gestures.length).toBeLessThan(16000);
 expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
 expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
 expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
 expect(p.melody!.notes).toHaveLength(syllables.length);
 expect(p.melody!.notes.map(n=>n.lyricIndex)).toEqual(syllables.map((_,i)=>i));
 const notes=p.performance!.contour.filter(c=>c.time>84&&c.time<87);
 expect(notes.length).toBeGreaterThan(60);expect(Math.max(...notes.map(c=>c.hz))-Math.min(...notes.map(c=>c.hz))).toBeGreaterThan(5);
});


test('the flagged high entries and show descent follow the backing tuning and keep intermediate notes',()=>{
 const c=score.parts[0].performance!.contour;
 const midiAt=(time:number)=>{const p=c.reduce((a,b)=>Math.abs(a.time-(time-7))<Math.abs(b.time-(time-7))?a:b);return 69+12*Math.log2(p.hz/440);};
 for(const [time,note] of [[75.1,69],[75.63,64],[79.1,69],[79.65,64],[86.55,64],[86.94,62],[87.09,61],[87.3,59],[95.55,61]]){
  expect(Math.abs(midiAt(time)-(note+.295))).toBeLessThan(.20);
 }
});
