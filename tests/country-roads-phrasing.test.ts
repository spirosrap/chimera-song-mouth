import {readFileSync} from 'node:fs';
import {test,expect} from 'bun:test';
import {validPerformance} from '../src/band/performance.ts';
import {noteAudioSpan} from '../src/band/roll.ts';
import {renderPart,BAND_RATE} from '../src/band/render.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine,wasmModule} from './harness.ts';

const score:Arrangement=JSON.parse(readFileSync(new URL('../public/band/country-roads/arrangement.json',import.meta.url),'utf8'));
const lead=score.parts[0];

test('Country Roads keeps prepared phonetics, the full outro and a score covering held chorus vowels',()=>{
 expect(validPerformance(lead.performance!,score.duration)).toBe(true);
 expect(lead.performance!.lyrics).toBe(lead.melody!.lyrics);
 expect(lead.melody!.lyrics).toContain('Take me home. Country Roads, take me home. Country Roads.');
 expect(score.duration).toBeGreaterThan(195);
 expect(score.presentation).toBe('solo-roll');
 // These held vowels used to finish over a second early. The note display and
 // the phonetic performance must both cover the missing part of each sustain.
 for(const time of [44,44.5,44.9,46.8,47.3,47.7]){
  expect(lead.melody!.notes.some(n=>{const s=noteAudioSpan(n);return s.start<=time&&s.end>time;})).toBe(true);
  const phrase=lead.performance!.phrases.find(p=>p.start<=time&&p.start+p.phones.reduce((sum,x)=>sum+x.duration,0)>time)!;
  expect(phrase).toBeDefined();
  let t=phrase.start;
  const phone=phrase.phones.find(p=>{const start=t;t+=p.duration;return start<=time&&t>time;});
  expect(phone?.ipa).toBe('ɑ');
 }
 // Both syllables of the opening "Country" need time to be sung.
 const opening=lead.melody!.notes.filter(n=>{const t=noteAudioSpan(n).start;return t>30.6&&t<31.15;});
 expect(opening).toHaveLength(2);
 expect(opening.every(n=>n.duration>=.15)).toBe(true);
});

await initEngine();
const {planPart}=await import('../src/band/planning.ts');
test('the actual mouth remains audible through Virginia and Mama instead of dropping to silence',()=>{
 const gestures=planPart(lead).filter(g=>g.t1>=42&&g.t0<48).map(g=>({...g,t0:g.t0-42,t1:g.t1-42}));
 const {samples}=renderPart(wasmModule,lead,6,gestures);
 for(const time of [44,44.5,44.9,46.8,47.3,47.7]){
  const start=Math.round((time-42)*BAND_RATE),chunk=samples.subarray(start,start+BAND_RATE*.1);
  const rms=Math.sqrt(chunk.reduce((sum,x)=>sum+x*x,0)/chunk.length);
  expect(rms).toBeGreaterThan(.01);
 }
 expect(samples.every(Number.isFinite)).toBe(true);
});
