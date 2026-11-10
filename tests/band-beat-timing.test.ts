import {expect,test} from 'bun:test';
import {initEngine,wasmModule} from './harness.ts';
import {renderPart,BAND_RATE} from '../src/band/render.ts';

test('prepared drum attacks land on their score times rather than after a live-pad setup delay',async()=>{
 await initEngine();
 for(const [id,female] of [['B',0],['Pf',.25],['t',.5],['tss',.65]] as const){
  const {samples}=renderPart(wasmModule,{id,name:id,role:'timing check',body:{female,child:0},volume:1,pan:0,beats:[{time:.5,id,accent:1},{time:.8,id,accent:1}]},1.55,[]);
  for(const time of [.5,.8]){
   const expected=time+.35,lo=Math.round((expected-.04)*BAND_RATE),hi=Math.round((expected+.18)*BAND_RATE);
   let peak=0,totalEnergy=0,attackEnergy=0;
   for(let i=lo;i<hi;i++){
    const energy=samples[i]*samples[i];totalEnergy+=energy;
    if(i<(expected+.05)*BAND_RATE)attackEnergy+=energy;
    peak=Math.max(peak,Math.abs(samples[i]));
   }
   expect(peak).toBeGreaterThan(.01);
   // A substantial attack must be audible on the beat. Open hats have a long
   // noisy tail, so their single largest sample is not a reliable onset marker.
   // Before the fix all four sounds had <5% of their energy in this window.
   expect(attackEnergy/totalEnergy).toBeGreaterThan(id==='tss'?.12:.5);
  }
 }
},15000);
