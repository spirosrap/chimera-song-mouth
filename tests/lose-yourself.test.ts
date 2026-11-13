import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {lyricLines,lyricAt,lyricLayout,validLyricVideo} from '../src/band/lyricVideo.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
const file=(name:string)=>readFileSync(new URL(`../public/band/lose-yourself/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString()),song=BAND_SONGS.find(s=>s.id==='lose-yourself')!;
test('Lose Yourself adds the full recording with one physical rap voice and independent original music',async()=>{
 expect(BAND_SONGS).toHaveLength(22);expect(BAND_SONGS[20]).toBe(song);expect(BAND_SONGS[19].id).toBe('smile');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.duration).toBeGreaterThan(327);expect(a.duration).toBeLessThan(328);expect(a.presentation).toBe('lyric-video');
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['backing','backing']]);
 const p=a.parts[0];expect(validPerformance(p.performance!,a.duration)).toBe(true);expect(p.performance!.lyrics).toBe(p.melody!.lyrics);expect(p.body.female).toBe(.12);
 expect(p.performance!.phrases.flatMap(x=>x.phones).length).toBeGreaterThan(1800);expect(p.melody!.notes).toHaveLength(1008);expect(a.parts[1].recordingType).toBe('instrumental');
 expect(validLyricVideo(a.lyricVideo,a.duration)).toBe(true);expect(a.lyricVideo!.words).toHaveLength(786);
 expect(a.lyricVideo!.words[0].start).toBeGreaterThan(34);expect(a.lyricVideo!.words.at(-1)!.end).toBeGreaterThan(281);
 expect(file('rainy-city.png').subarray(1,4).toString()).toBe('PNG');
});
test('all verses and hooks have bounded lyric layouts and exact highlights after seeking',()=>{
 const lines=lyricLines(score.lyricVideo!.words);
 for(const line of lines){
  for(const word of line.words){const at=lyricAt(lines,(word.start+word.end)/2);expect(at.line?.words[at.active]).toBe(word);}
  for(const [w,h] of [[1280,720],[375,211],[320,180]]){
   const l=lyricLayout(line.words,w,h,(s,f)=>s.length*f*.61);expect(new Set(l.words.map(x=>x.y)).size).toBeLessThanOrEqual(2);
   for(const x of l.words){expect(x.x).toBeGreaterThan(0);expect(x.x+x.width).toBeLessThan(w);expect(x.y+l.font*.7).toBeLessThan(l.mouth.y);}
  }
 }
 expect(lyricAt(lines,0).line).toBeNull();expect(lyricAt(lines,300).line).toBeNull();
});
test('the full mouth animation shares the audio clock, starts silent and leaves music independent',async()=>{
 const urls:string[]=[];
 const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration}) as AudioBuffer,async url=>{urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));});
 expect(urls).toHaveLength(3);expect(loaded[1].track).toBeNull();const track=loaded[0].track!;
 expect(Math.abs(track.duration-score.duration)).toBeLessThan(.051);expect(track.body.female).toBeCloseTo(.12,6);
 const raw=gunzipSync(file('lead.tele.gz'));expect(new Float32Array(raw.buffer,raw.byteOffset+48,(raw.byteLength-48)/4).every(Number.isFinite)).toBe(true);
 expect(track.message(track.indexAt(20)).t.gate).toBeLessThan(.01);expect(track.message(track.indexAt(300)).t.gate).toBeLessThan(.01);
 for(const t of [56,99,124,169,199,258,280])expect(track.message(track.indexAt(t)).t.outRms).toBeGreaterThan(.001);
});
await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('every syllable rebuilds as actual mouth gestures within the existing renderer capacity',()=>{
 const p=score.parts[0],g=planPart(p),syllables=lyricsToSyllables(p.melody!.lyrics);
 expect(g.length).toBeGreaterThan(9000);expect(g.length).toBeLessThan(16000);expect(g.every(x=>Number.isFinite(x.t0)&&Number.isFinite(x.t1)&&x.t1>=x.t0&&x.t1<score.duration)).toBe(true);
 expect(p.melody!.notes.map(x=>x.lyricIndex)).toEqual(syllables.map((_,i)=>i));
 expect(g.some(x=>x.targets.lipAp!==undefined&&x.targets.lipAp<0)).toBe(true);expect(g.some(x=>x.targets.abduction!==undefined&&x.targets.abduction>0)).toBe(true);
});
