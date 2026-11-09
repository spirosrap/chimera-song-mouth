import {expect,test} from "bun:test";
import {initEngine,wasmModule} from "./harness.ts";
import {renderPart,BAND_RATE} from "../src/band/render.ts";
import type {BandPart} from "../src/band/types.ts";
await initEngine();
const {planPart}=await import("../src/band/planning.ts");

function periodicity(samples:Float32Array):number{
  const x=samples.slice(Math.floor(.65*BAND_RATE),Math.floor(1.05*BAND_RATE));let best=0;
  for(let lag=Math.floor(BAND_RATE/350);lag<Math.ceil(BAND_RATE/85);lag+=2){
    let xy=0,xx=0,yy=0;
    for(let i=lag;i<x.length;i+=2){xy+=x[i]*x[i-lag];xx+=x[i]*x[i];yy+=x[i-lag]*x[i-lag];}
    best=Math.max(best,xy/Math.sqrt(xx*yy||1));
  }
  return best;
}
test("whisper delivery removes periodic voicing while keeping audible speech and silent rests",()=>{
  const part:BandPart={id:"lead",name:"Test voice",role:"test",body:{female:0,child:0},volume:1,pan:0,vibrato:0,voice:{breathiness:.4,brightness:.4,tension:.45},melody:{name:"test",source:"test",lyrics:"α",duration:1.6,notes:[{start:.1,duration:.85,midi:55,lyricIndex:0}]}};
  const gestures=planPart(part),normal=renderPart(wasmModule,part,1.6,gestures).samples;
  const whisper=renderPart(wasmModule,{...part,voice:{...part.voice,voiced:false}},1.6,gestures).samples;
  expect(whisper.length).toBe(normal.length);expect(whisper.every(Number.isFinite)).toBe(true);
  const rms=(a:Float32Array)=>Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length);
  expect(rms(whisper.slice(0,.2*BAND_RATE))).toBeLessThan(.001);
  expect(rms(whisper.slice(.65*BAND_RATE,1.05*BAND_RATE))).toBeGreaterThan(.005);
  expect(Math.max(...whisper.slice(.65*BAND_RATE,1.05*BAND_RATE).map(Math.abs))).toBeLessThan(.86);
  expect(periodicity(normal)).toBeGreaterThan(.4);
  expect(periodicity(whisper)).toBeLessThan(periodicity(normal)*.6);
});
