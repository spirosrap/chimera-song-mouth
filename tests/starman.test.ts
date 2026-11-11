import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {songCaption} from '../src/band/presentation.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
const file=(name:string)=>readFileSync(new URL(`../public/band/starman/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='starman')!;

test('Starman adds the complete recording as the seventeenth selection with one physical singer',async()=>{
 expect(BAND_SONGS).toHaveLength(17);expect(BAND_SONGS[16]).toBe(song);
 expect(BAND_SONGS[15].id).toBe('life-on-mars');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.presentation).toBe('backed-solo');expect(a.duration).toBeGreaterThan(258);expect(a.duration).toBeLessThan(259);
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['backing','backing']]);
 expect(a.parts[1].recordingType).toBe('instrumental');expect(a.parts[1].performance).toBeUndefined();
 const lead=a.parts[0];expect(validPerformance(lead.performance!,a.duration)).toBe(true);
 expect(lead.performance!.lyrics).toBe(lead.melody!.lyrics);expect(lead.vibrato).toBe(0);
 expect(lead.voice?.pressure).toBe(7.2);expect(lead.voice?.brightness).toBe(.46);
 const last=lead.performance!.phrases.at(-1)!;const end=last.start+last.phones.reduce((s,p)=>s+p.duration,0);
 expect(end).toBeGreaterThan(252.8);expect(end).toBeLessThan(253.1);
});

test('all six la-la cycles remain sung and captioned while instrumental breaks stay wordless',()=>{
 for(const t of [1,90,194,256])expect(songCaption(score,t)).toBe('');
 for(const t of [23,58.5,120,173.5,200,251])expect(songCaption(score,t)).not.toBe('');
 expect(songCaption(score,200).toLowerCase()).toContain('la');
 const lead=score.parts[0];expect(lead.performance!.lyrics.split(/\s+/).filter(w=>w.toLowerCase()==='la')).toHaveLength(96);
 expect(lead.effects?.delayMix).toBe(0);expect(lead.effects?.pump).toBe(0);
 const levels=lead.effects!.automation!;
 expect(levels[0].level).toBe(1);expect(levels.at(-1)!.level).toBe(0);
 expect(levels.find(p=>p.time>245)!.level).toBeLessThan(.1);
});

test('complete mouth telemetry seeks on the audio clock and the original music has no synthetic head',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{
  urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));
 });
 expect(urls).toHaveLength(3);expect(urls.every(u=>u.endsWith('?v=starman-20261111'))).toBe(true);
 expect(loaded[1].track).toBeNull();expect(urls.some(u=>u.includes('backing.tele'))).toBe(false);
 const raw=gunzipSync(file('lead.tele.gz')),track=loaded[0].track!;
 expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);
 expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
 const at=(t:number)=>track.message(track.indexAt(t)).t;
 for(const t of [1,90,194,256])expect(at(t).gate).toBeLessThan(.01);
 for(const t of [23,58.5,200,251])expect(at(t).outRms).toBeGreaterThan(.001);
 const first=Array.from(at(23).artic);at(251);expect(Array.from(at(23).artic)).toEqual(first);
 expect(at(23).clock).toBeCloseTo(23,3);expect(first.some((v,k)=>Math.abs(v-at(58.5).artic[k])>.05)).toBe(true);
});

await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('every syllable rebuilds through physical closures, airflow and the tuned melody',()=>{
 const p=score.parts[0],gestures=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
 expect(gestures.length).toBeGreaterThan(4000);expect(gestures.length).toBeLessThan(16000);
 expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
 expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
 expect(gestures.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
 expect(p.melody!.notes).toHaveLength(syllables.length);
 expect(p.melody!.notes.map(n=>n.lyricIndex)).toEqual(syllables.map((_,i)=>i));
 const c=p.performance!.contour;
 const midiAt=(time:number)=>{const p=c.reduce((a,b)=>Math.abs(a.time-time)<Math.abs(b.time-time)?a:b);return 69+12*Math.log2(p.hz/440);};
 for(const [time,note] of [[57.5,53],[58.7,65],[68.5,65],[137.5,65],[173.5,65],[198.5,62],[203.1,64]]){
  expect(Math.abs(midiAt(time)-(note+.065))).toBeLessThan(.16);
 }
});
