import { expect, test } from "bun:test";
import { initEngine, wasmModule } from "./harness.ts";
import type { ToWorklet, FromWorklet } from "../src/worklet/protocol.ts";
await initEngine();
const { planMelody }=await import("../src/song/plan.ts");
const messages:FromWorklet[]=[];
class WorkletHost {
  port={onmessage:null as null|((e:{data:ToWorklet})=>void),postMessage:(m:FromWorklet)=>messages.push(m)};
}
let Processor: {new(options:unknown):WorkletHost & {process(inputs:Float32Array[][],outputs:Float32Array[][]):boolean}};
const globals=globalThis as unknown as Record<string,unknown>;
globals.AudioWorkletProcessor=WorkletHost;globals.sampleRate=48000;
globals.registerProcessor=(_name:string,p:typeof Processor)=>{Processor=p;};
// @ts-expect-error a distinct module instance isolates registration from other worklet tests
await import("../src/worklet/processor.ts?song-import");

test("the real worklet sings gestures beyond the 4,000-record transfer buffer, then stops",()=>{
  const processor=new Processor({processorOptions:{module:wasmModule}});
  const {plan}=planMelody({name:"last note",source:"test",lyrics:"",duration:.8,notes:[{midi:60,start:.1,duration:.5}]},"",{female:0,child:0},1,0,0);
  const padding=Array.from({length:4000},()=>({t0:0,t1:.01,rampIn:0,rampOut:0,strength:0,targets:{}}));
  processor.port.onmessage!({data:{type:"schedule",id:1,gestures:[...padding,...plan.gestures],segments:plan.segments,end:plan.end,replace:true}});
  let peak=0;
  for(let block=0;block<400;block++){
    const out=new Float32Array(128);processor.process([],[[out,out]]);
    if(block>150&&block<300)peak=Math.max(peak,Math.sqrt(out.reduce((s,x)=>s+x*x,0)/128));
  }
  expect(peak).toBeGreaterThan(.005);
  expect(messages.some(m=>m.type==="planned")).toBe(true);
  expect(messages.filter(m=>m.type==="error")).toEqual([]);
  processor.port.onmessage!({data:{type:"stopSpeech"}});
  let last=new Float32Array(128);
  for(let block=0;block<200;block++){last=new Float32Array(128);processor.process([],[[last,last]]);}
  expect(Math.max(...last.map(Math.abs))).toBeLessThan(.001);
});

test("prepared playback bypasses the overloaded real-time solver and can restore live notes",()=>{
 const processor=new Processor({processorOptions:{module:wasmModule}});
 const {plan}=planMelody({name:'buffered',source:'test',lyrics:'',duration:.8,notes:[{midi:60,start:.1,duration:.5}]},'',{female:0,child:0},1,0,0);
 processor.port.onmessage!({data:{type:'schedule',id:2,gestures:plan.gestures,segments:plan.segments,end:plan.end,replace:true}});
 processor.port.onmessage!({data:{type:'rendering',enabled:false}});
 const before=messages.length;
 for(let i=0;i<400;i++){const out=new Float32Array(128).fill(1);processor.process([],[[out]]);expect(out.every(x=>x===0)).toBe(true);}
 // No advancing engine clock or telemetry while prepared audio uses the native buffer player.
 expect(messages.length).toBe(before);
 processor.port.onmessage!({data:{type:'rendering',enabled:true}});
 let peak=0;
 for(let i=0;i<400;i++){const out=new Float32Array(128);processor.process([],[[out]]);for(const x of out)peak=Math.max(peak,Math.abs(x));}
 expect(peak).toBeGreaterThan(.005);
});
