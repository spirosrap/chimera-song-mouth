import {test,expect} from "bun:test";
import {synthesizeWhistle} from "../src/band/whistle.ts";
import {BAND_SONGS,findBandSong} from "../src/band/library.ts";
import {initEngine,wasmModule} from "./harness.ts";
import {renderPart,BAND_RATE} from "../src/band/render.ts";
import {TeleTrack} from "../src/show/tele.ts";
import type {BandPart} from "../src/band/types.ts";
const part:BandPart={id:"lead",name:"Whistle",role:"test",delivery:"whistle",body:{female:0,child:0},volume:.5,pan:0,melody:{name:"test",source:"test",lyrics:"ah",duration:1.6,notes:[{start:.1,duration:.85,midi:55}]}};
const rms=(x:Float32Array)=>Math.sqrt(x.reduce((s,v)=>s+v*v,0)/x.length);
function frequency(x:Float32Array,rate:number,expected:number){
  let best=0,hz=0;
  for(let f=expected*.97;f<expected*1.03;f+=.5){
    let a=0,b=0;for(let i=0;i<x.length;i++){const w=.5-.5*Math.cos(2*Math.PI*i/(x.length-1));a+=x[i]*w*Math.cos(2*Math.PI*f*i/rate);b+=x[i]*w*Math.sin(2*Math.PI*f*i/rate);}
    const energy=a*a+b*b;if(energy>best){best=energy;hz=f;}
  }
  return hz;
}
test("whistle keeps the melody in a whistle register, with silent rests and a smooth finite waveform",()=>{
  const x=synthesizeWhistle(part,1.6,48000);expect(x).toHaveLength(76800);expect(x.every(Number.isFinite)).toBe(true);
  expect(rms(x.slice(0,20000))).toBe(0);expect(rms(x.slice(65000))).toBe(0);
  expect(rms(x.slice(30000,48000))).toBeGreaterThan(.05);
  expect(frequency(x.slice(30000,48000),48000,440*2**((79-69)/12))).toBeCloseTo(440*2**((79-69)/12),-1);
  expect(synthesizeWhistle(part,1.6,48000)).toEqual(x);
  let jump=0;for(let i=1;i<x.length;i++)jump=Math.max(jump,Math.abs(x[i]-x[i-1]));expect(jump).toBeLessThan(.08);
});
await initEngine();const {planPart}=await import("../src/band/planning.ts");
test("whistle audio and pursed-lip animation share the output sample clock",()=>{
  const out=renderPart(wasmModule,part,1.6,planPart(part)),track=new TeleTrack(out.tele),t=track.message(track.indexAt(.8)).t;
  expect(out.samples).toEqual(synthesizeWhistle(part,1.6,BAND_RATE));
  expect(track.duration).toBeCloseTo(1.6,3);expect(t.f0).toBeCloseTo(440*2**((79-69)/12),2);expect(t.voicing).toBe(0);
  expect(t.outRms).toBeGreaterThan(.05);
  expect(t.artic[7]).toBeLessThan(.35);expect(t.artic[8]).toBeGreaterThan(1);expect(t.artic[9]).toBeLessThan(.4);
});
test("one Greek performance replaces experimental variants and redirects both old links",()=>{
  expect(BAND_SONGS.slice(0,6).map(s=>s.id)).toEqual(["house-of-the-rising-sun","all-made-of-air","neon-current","bicep-glue","night-train-quartet","synnefoula"]);
  expect(BAND_SONGS.some(s=>s.id==="synnefoula-whisper")).toBe(false);
  expect(findBandSong("synnefoula-whisper").id).toBe("synnefoula");
  expect(findBandSong("synnefoula-whistle").id).toBe("synnefoula");
  expect(findBandSong(null).id).toBe("house-of-the-rising-sun");
});
test("the same mouth whistles at the original pitch and then sings the vocal notes",()=>{
  const mixed:BandPart={...part,delivery:undefined,melody:{...part.melody!,lyrics:"α",notes:[{start:1.6,duration:.7,midi:55}]},whistleMelody:{...part.melody!,notes:[{start:.1,duration:.6,midi:89}]}};
  const out=renderPart(wasmModule,mixed,2.8,planPart(mixed)),track=new TeleTrack(out.tele);
  expect(frequency(out.samples.slice(26000,31000),48000,440*2**((89-69)/12))).toBeCloseTo(440*2**((89-69)/12),-1);
  const whistle=track.message(track.indexAt(.6)).t,singing=track.message(track.indexAt(2.2)).t;
  expect(whistle.f0).toBeCloseTo(440*2**((89-69)/12),2);expect(whistle.voicing).toBe(0);expect(whistle.artic[8]).toBeGreaterThan(1);
  expect(singing.f0).toBeLessThan(350);expect(singing.outRms).toBeGreaterThan(.005);expect(singing.artic[8]).toBeLessThan(.5);
  expect(rms(out.samples.slice(60000,80000))).toBeLessThan(.001);
  expect(rms(out.samples.slice(100000,110000))).toBeGreaterThan(.005);
});
