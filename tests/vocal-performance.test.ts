import {expect,test} from 'bun:test';
import {validPerformance} from '../src/band/performance.ts';
import type {BandPart,VocalPerformance} from '../src/band/types.ts';
import {initEngine,wasmModule} from './harness.ts';
import {renderPart} from '../src/band/render.ts';
import {loadBandArrangement,BAND_SONGS} from '../src/band/library.ts';
const profile=():VocalPerformance=>({lyrics:'καλημέρα',phrases:[{start:.3,phones:[{ipa:'ʃ',duration:.08},{ipa:'i',duration:.32},{ipa:'ɾ',duration:.04},{ipa:'a',duration:.36}]}],contour:Array.from({length:16},(_,i)=>({time:.3+i*.05,hz:150+i*6,breath:.6+i*.02}))});
const part=():BandPart=>({id:'lead',name:'Singer',role:'test',body:{female:.18,child:0},volume:1,pan:0,vibrato:0,performance:profile(),melody:{name:'Test',source:'test',lyrics:'καλημέρα',duration:2,notes:[{start:.3,duration:.8,midi:60,lyricIndex:0}]}});
test('performance data rejects missing pitch coverage, reversed clocks, invalid phones and nonfinite controls',async()=>{
 expect(validPerformance(profile(),2)).toBe(true);
 for(const mutate of [(p:VocalPerformance)=>p.contour.shift(),(p:VocalPerformance)=>p.contour.splice(3,4),(p:VocalPerformance)=>p.contour[1].time=0,(p:VocalPerformance)=>p.contour[0].hz=NaN,(p:VocalPerformance)=>p.phrases[0].phones[0].duration=-1,(p:VocalPerformance)=>p.phrases.push(p.phrases[0])]){
  const p=profile();mutate(p);expect(validPerformance(p,2)).toBe(false);
 }
 const score={...BAND_SONGS[9].arrangement,parts:[part()]};score.parts[0].performance!.contour=[];
 await expect(loadBandArrangement(BAND_SONGS[9],async()=>new Response(JSON.stringify(score)))).rejects.toThrow('performance');
});
await initEngine();
const {planPart}=await import('../src/band/planning.ts');
const {planUtterance}=await import('../src/wasm/engine.ts');
test('source phones preserve the actual durations and airway gestures instead of normalizing Greek spelling',()=>{
 const p=part(),actual=planPart(p);
 const expected=planUtterance(p.performance!.phrases[0].phones.map(s=>({ipa:s.ipa,dur:s.duration})),{body:p.body,t0:.24,rate:1,f0:180,intonation:'flat',sung:true}).gestures.map(g=>{const {f0,breath,vibrato,...targets}=g.targets;return {...g,targets};}).filter(g=>Object.keys(g.targets).length);
 expect(actual.filter(g=>g.label!=='source performance')).toEqual(expected);
 const controls=actual.filter(g=>g.label==='source performance');expect(controls).toHaveLength(16);expect(controls[0].t0).toBe(.3);expect(controls.at(-1)!.t1).toBeCloseTo(1.1,8);
 expect(controls.map(g=>g.targets.f0)).toEqual(p.performance!.contour.map(c=>c.hz));
 expect(actual.every(g=>g.t1<1.3)).toBe(true);
 const r=renderPart(wasmModule,p,2,actual);expect(r.samples.every(Number.isFinite)).toBe(true);
 const rms=(a:Float32Array)=>Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length);
 expect(rms(r.samples.subarray(24000,48000))).toBeGreaterThan(.01);expect(rms(r.samples.subarray(76800))).toBeLessThan(.001);
});
test('editing lyrics returns to text planning; selecting whistle still overrides the performance',()=>{
 const p=part();p.melody!.lyrics='γεια';expect(planPart(p).some(g=>g.label==='source performance')).toBe(false);
 const q=part();q.delivery='whistle';expect(planPart(q).some(g=>g.label==='source performance')).toBe(false);
});
