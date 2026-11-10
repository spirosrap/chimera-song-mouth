import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import type {Arrangement} from '../src/band/types.ts';
import {isVoicePart} from '../src/band/types.ts';
import {BAND_SONGS,loadBandArrangement} from '../src/band/library.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {initEngine} from './harness.ts';

const score:Arrangement=JSON.parse(readFileSync(new URL('../public/band/bicep-apricots/arrangement.json',import.meta.url),'utf8'));

test('Apricots preserves the original vocal as recorded stereo audio outside the voice renderer',async()=>{
 await initEngine();
 const {planPart}=await import('../src/band/planning.ts');
 const vocal=score.parts.find(p=>p.id==='hook')!;
 expect(vocal.kind).toBe('backing');expect(vocal.recordingType).toBe('vocal');
 expect(isVoicePart(vocal)).toBe(false);expect(vocal.melody).toBeUndefined();
 expect(()=>planPart(vocal)).toThrow('stay as audio');
 expect(score.parts.filter(isVoicePart)).toHaveLength(9);
 expect(score.parts.some(p=>p.id==='choir-low'||p.id==='choir-high')).toBe(false);
 expect(score.duration).toBeCloseTo(249.412);
 const requests:string[]=[],buffer={numberOfChannels:2,duration:score.duration} as AudioBuffer;
 const result=await loadBandAssets('bicep-apricots',[vocal],async()=>buffer,async url=>{
  requests.push(String(url));return new Response(new Uint8Array([1,2]));
 });
 expect(requests).toEqual(['/band/bicep-apricots/hook.mp3?v=apricots-original-vocal-20261110']);
 expect(result[0]).toEqual({buffer,track:null});
 const song=BAND_SONGS.find(s=>s.id==='bicep-apricots')!;
 expect(await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)))).toEqual(score);
 const invalid=structuredClone(score);invalid.parts[1].recordingType='vocal';
 await expect(loadBandArrangement(song,async()=>new Response(JSON.stringify(invalid)))).rejects.toThrow('recorded audio type');
});

test('Apricots sustained accompaniment does not restart at adjacent detector fragments',()=>{
 for(const id of ['bass','harmony-low','harmony-mid','harmony-high','shimmer']){
  const notes=score.parts.find(p=>p.id===id)!.melody!.notes;
  expect(notes.some(n=>n.duration>2)).toBe(true);
  for(let i=1;i<notes.length;i++){
   const prev=notes[i-1],next=notes[i];
   expect(next.start+1e-6).toBeGreaterThanOrEqual(prev.start+prev.duration);
   expect(next.midi===prev.midi&&next.start-prev.start-prev.duration<.12-1e-6).toBe(false);
  }
 }
 // The previous score incorrectly lowered the upper synth figures an octave.
 expect(Math.min(...score.parts.find(p=>p.id==='shimmer')!.melody!.notes.map(n=>n.midi))).toBeGreaterThanOrEqual(74);
 const snare=score.parts.find(p=>p.id==='snare')!.beats!,hats=score.parts.find(p=>p.id==='hats')!.beats!;
 // Hats previously duplicated snare transients instead of following their own rhythm.
 expect(hats.every(h=>snare.every(s=>Math.abs(h.time-s.time)>.07))).toBe(true);
});

test('Apricots percussion follows source attacks without duplicate kick or hat tails',()=>{
 const kick=score.parts.find(p=>p.id==='kick')!.beats!,hats=score.parts.find(p=>p.id==='hats')!.beats!;
 // Source second-kick clicks, measured independently from the drum waveform.
 // The mouth's shorter kick envelope needs 28 ms to align its audible energy.
 for(const source of [1.016,31.017,38.516,46.017,121.015,166.017,179.141,207.267,211.016,218.517]){
  const hits=kick.filter(b=>Math.abs(b.time-(source+.028))<.01);
  expect(hits).toHaveLength(1);
  expect(kick.some(b=>b.time>source+.075&&b.time<source+.16)).toBe(false);
 }
 // These old hi-hat triggers had no corresponding high-band source attack.
 for(const time of [33.738,35.618,37.488,44.988,48.738]){
  expect(hats.some(b=>Math.abs(b.time-time)<.03)).toBe(false);
 }
});
