import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import type {Arrangement} from '../src/band/types.ts';
import {BAND_SONGS} from '../src/band/library.ts';
import {gunzipSync} from 'node:zlib';
import {initEngine,wasmModule} from './harness.ts';
import {renderPart} from '../src/band/render.ts';

const score:Arrangement=JSON.parse(readFileSync(new URL('../public/band/megalovania/arrangement.json',import.meta.url),'utf8'));

test('MEGALOVANIA retains the full reference-style 24 pitched parts, including short cameos',()=>{
 expect(score.parts).toHaveLength(24);
 expect(score.duration).toBeCloseTo(156.9);
 expect(score.parts.every(p=>p.melody&&!p.beats&&!p.effects)).toBe(true);
 expect(score.parts.reduce((sum,p)=>sum+p.melody!.notes.length,0)).toBe(3239);
 expect(createHash('sha256').update(JSON.stringify(score.parts.map(p=>p.melody!.notes.map(n=>[n.start,n.midi])))).digest('hex')).toBe('d7eb9477f3198ddc6312adb2dfc49383fda1e2e82909643b71d36f10b848fa3c');
 expect(score.parts.flatMap(p=>p.melody!.notes).filter(n=>n.hold)).toHaveLength(44);
 // Previously five mouths were assigned drums and the lead/harmony score differed.
 expect(score.parts.map(p=>p.name)).toEqual(['Saw','Saw 2','Saw 3','Polysynth','Square','Polysynth','Strings','Brass Ensemble','Trumpet','Saw','Bass 2','Voice','Brass Ensemble 3','Overdriven','Brass Ensemble 2','Bass','Distorted','Voice 2','Strings','Strings 2','Square','Strings 2','Orchestra Hit','Strings 3']);
 expect(score.parts[20].melody!.notes).toEqual([{start:39.5,duration:.5,midi:65}]);
 expect(score.parts[0].melody!.notes.slice(0,5).map(n=>[n.start,n.midi])).toEqual([[0,62],[.125,62],[.25,74],[.5,69],[.875,68]]);
 expect(score.parts[0].melody!.notes.at(-1)!.start).toBe(155.875);
 // The quarter-second rest in the opening riff stays a rest.
 expect(score.parts[0].melody!.notes[3].duration).toBe(.125);
 expect(score.parts[0].melody!.notes[4].start).toBe(.875);
 // The two identically named child parts occupy different panels in the clip.
 expect(score.parts[19].melody!.notes[0].start).toBe(108.25);
 expect(score.parts[21].melody!.notes[0].start).toBe(16);
 for(const p of score.parts){
  const notes=p.melody!.notes;
  expect(notes.length).toBeGreaterThan(0);
  for(const [i,n] of notes.entries()){
   expect(n.duration).toBeGreaterThan(0);
   if(n.duration<.055)expect(n.hold).toBe(true);
   expect(n.start+n.duration).toBeLessThanOrEqual(score.duration-.35);
   if(i)expect(n.start+1e-8).toBeGreaterThanOrEqual(notes[i-1].start+notes[i-1].duration);
  }
 }
});

test('the reference body presets, bass syllables and renewed assets stay paired',()=>{
 expect(score.parts.map(p=>p.body.child?'C':p.body.female?'F':'M').join('')).toBe('FFMCFCCFFFMFMMMMMMFCFCFF');
 expect(score.parts[10].melody!.lyrics).toBe('dum');
 expect(score.parts[15].melody!.lyrics).toBe('ooh');
 expect(score.parts.filter(p=>p.melody!.lyrics==='da')).toHaveLength(22);
 expect(score.parts[10].melody!.notes[0].midi).toBe(62);
 expect(score.parts[15].melody!.notes[0].midi).toBe(50);
 expect(score.parts[10].melody!.notes[0].duration).toBe(.25);
 expect(score.parts[13].melody!.notes[0].duration).toBe(.25);
 expect(score.parts.every(p=>p.voice?.brightness===.25&&p.voice?.breathiness===.15&&p.voice?.pressure===8&&p.voice?.drift===5)).toBe(true);
 expect(score.parts.every(p=>p.telemetryEncoding==='gzip'&&p.assetVersion==='reference-20261110')).toBe(true);
 expect(score.wordless).toBe(true);expect(score.showSyllables).toBe(true);
 const slot=BAND_SONGS.find(s=>s.id==='megalovania')!;
 expect(slot.arrangement.showSyllables).toBe(true);
 expect(slot.arrangementUrl).toContain('?v=reference-20261110');
});

test('the rapid Square ornaments sound instead of disappearing into D closures',async()=>{
 await initEngine();
 const {EnglishG2P}=await import('../src/wasm/engine.ts');
 new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
 const {planPart}=await import('../src/band/planning.ts');
 const part=structuredClone(score.parts[4]);
 part.melody!.notes=part.melody!.notes.filter(n=>n.start>=34&&n.start<36).map(n=>({...n,start:n.start-34}));
 part.melody!.duration=2;
 const {samples}=renderPart(wasmModule,part,2.9,planPart(part));
 const ornaments=part.melody!.notes.filter(n=>n.duration<.055);
 expect(ornaments).toHaveLength(4);
 for(const n of ornaments){
  const from=Math.round((n.start+.35+n.duration*.25)*48000),to=Math.round((n.start+.35+n.duration*.8)*48000);
  let energy=0;for(let i=from;i<to;i++)energy+=samples[i]*samples[i];
  expect(Math.sqrt(energy/(to-from))).toBeGreaterThan(.01);
 }
},15000);
