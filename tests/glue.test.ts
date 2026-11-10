import {expect,test} from 'bun:test';
import {readFileSync,existsSync} from 'node:fs';
import type {Arrangement} from '../src/band/types.ts';
import {isVoicePart} from '../src/band/types.ts';
import {loadBandAssets} from '../src/band/assets.ts';

const base=new URL('../public/band/bicep-glue/',import.meta.url);
const score:Arrangement=JSON.parse(readFileSync(new URL('arrangement.json',base),'utf8'));

test('Glue keeps its full vocal and accompaniment entirely mouth-generated',()=>{
 expect(score.parts).toHaveLength(9);expect(score.duration).toBeCloseTo(270.8);
 expect(score.parts.every(isVoicePart)).toBe(true);
 expect(score.parts.every(p=>p.recordingType===undefined)).toBe(true);
 const vocal=score.parts.find(p=>p.id==='vocal')!;
 expect(vocal.performance!.lyrics).toBe(vocal.melody!.lyrics);
 expect(vocal.performance!.phrases.some(p=>p.phones.some(ph=>ph.duration>1))).toBe(true);
 // The initial remake uniformly lowered the detected vocal by an octave.
 expect(Math.min(...vocal.melody!.notes.map(n=>n.midi))).toBeGreaterThanOrEqual(62);
 for(const p of score.parts){
  expect(p.telemetryEncoding).toBe('gzip');
  expect(existsSync(new URL(p.id+'.mp3',base))).toBe(true);
  expect(existsSync(new URL(p.id+'.tele.gz',base))).toBe(true);
 }
});

test('Glue retains connected pitch lanes and the source pulse without artificial restarts',()=>{
 for(const p of score.parts.filter(p=>p.melody)){
  const notes=p.melody!.notes;
  expect(notes.every(n=>n.hold)).toBe(true);
  for(let i=1;i<notes.length;i++){
   const previous=notes[i-1],next=notes[i];
   expect(next.start+1e-6).toBeGreaterThanOrEqual(previous.start+previous.duration);
   expect(next.midi===previous.midi&&next.start-previous.start-previous.duration<.12-1e-6).toBe(false);
  }
  expect(p.effects?.pump??0).toBe(0);expect(p.effects?.delayMix??0).toBe(0);
  const keys=p.effects!.automation!;
  expect(keys.some((k,i)=>i>0&&k.time-keys[i-1].time<.03)).toBe(true);
 }
});

test('Glue separates short claps from kicks and loads the new mouth animation',async()=>{
 const kick=score.parts.find(p=>p.id==='drums')!,clap=score.parts.find(p=>p.id==='snare')!,hats=score.parts.find(p=>p.id==='hats')!;
 expect(kick.beats!.every(b=>b.id==='B')).toBe(true);
 expect(clap.beats!.every(b=>b.id==='K')).toBe(true);
 expect(hats.beats!.every(b=>b.id==='t')).toBe(true);
 // Measured source attack peaks, with the small mouth attack compensation.
 expect(kick.beats!.some(b=>Math.abs(b.time-90.071)<.01)).toBe(true);
 expect(clap.beats!.some(b=>Math.abs(b.time-90.301)<.01)).toBe(true);
 const requests:string[]=[];
 await loadBandAssets('bicep-glue',[clap],async()=>({} as AudioBuffer),async url=>{
  requests.push(String(url));const path=String(url).split('/').at(-1)!.split('?')[0];
  return new Response(readFileSync(new URL(path,base)));
 });
 expect(requests).toEqual(['/band/bicep-glue/snare.mp3?v=glue-refined-20261110','/band/bicep-glue/snare.tele.gz?v=glue-refined-20261110']);
});
