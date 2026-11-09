import {test,expect,mock,afterEach} from 'bun:test';
import {initEngine,wasmModule} from './harness.ts';
import {renderPart} from '../src/band/render.ts';
import {TeleTrack} from '../src/show/tele.ts';
await initEngine();
const {DEFAULT_SOURCE,NEUTRAL}=await import('../src/wasm/engine.ts');
const {planMelody}=await import('../src/song/plan.ts');
// This unit harness exercises routing and clocks; it does not open a browser.
mock.module('../src/worklet/processor.ts?worker&url',()=>({default:'/processor.js'}));
// @ts-expect-error isolate the real engine from the live-singing suite's module mock
const {AudioEngine}=await import('../src/audio/AudioEngine.ts?prepared-test') as typeof import('../src/audio/AudioEngine.ts');
class Node {
 gain={value:0,setTargetAtTime(v:number){this.value=v;}};frequency={value:0};Q={value:0};threshold={value:0};knee={value:0};ratio={value:0};attack={value:0};release={value:0};
 connections:unknown[]=[];buffer:any;started:number|null=null;stopped=false;port={onmessage:null as unknown, messages:[] as unknown[],postMessage(m:unknown){this.messages.push(m);}};
 connect(n:unknown){this.connections.push(n);return n as Node;}disconnect(){this.connections=[];}start(t:number){this.started=t;}stop(){this.stopped=true;}
}
class Context {
 state='suspended';sampleRate=48000;currentTime=0;outputLatency=.1;baseLatency=0;destination=new Node();sources:Node[]=[];resumeWait:Promise<void>|null=null;
 audioWorklet={addModule:async()=>{}};
 async resume(){await this.resumeWait;this.state='running';}
 createGain(){return new Node();}createAnalyser(){return new Node();}createBiquadFilter(){return new Node();}createDynamicsCompressor(){return new Node();}
 createBuffer(_c:number,n:number,rate:number){return {duration:n/rate,copyToChannel(){}};}
 createBufferSource(){const n=new Node();this.sources.push(n);return n;}
}
const global=globalThis as unknown as Record<string,unknown>,oldContext=global.AudioContext,oldNode=global.AudioWorkletNode;
afterEach(()=>{global.AudioContext=oldContext;global.AudioWorkletNode=oldNode;});
const melody={name:'solo',source:'test',duration:.8,lyrics:'',notes:[{midi:60,start:0,duration:.5}]};
const {plan}=planMelody(melody,'',{female:0,child:0},1,0,0);
const part={id:'solo',name:'solo',role:'test',body:{female:0,child:0},volume:1,pan:0};
const settings={source:{...DEFAULT_SOURCE},artic:{...NEUTRAL},tipFree:true};
const rendered=renderPart(wasmModule,part,plan.end+.5,plan.gestures,undefined,settings);

test('prepared solo audio sounds, preserves the selected source settings, and has synchronized telemetry',()=>{
 const rms=Math.sqrt(rendered.samples.reduce((s,x)=>s+x*x,0)/rendered.samples.length);
 expect(rms).toBeGreaterThan(.01);expect(rendered.samples.every(Number.isFinite)).toBe(true);
 const track=new TeleTrack(rendered.tele);expect(Math.abs(track.duration-rendered.samples.length/48000)).toBeLessThan(.051);
 const zeroPressure=renderPart(wasmModule,part,plan.end+.5,plan.gestures,undefined,{...settings,source:{...DEFAULT_SOURCE,pressure:0}});
 const zeroTrack=new TeleTrack(zeroPressure.tele);
 expect(zeroTrack.message(zeroTrack.indexAt(.6)).t.pLung).toBe(0);
 expect(track.message(track.indexAt(.6)).t.pLung).toBeGreaterThan(0);
});

test('prepared audio uses an AudioBufferSource, freezes the solver, and follows the audible clock',async()=>{
 const ctx=new Context();let node:Node,options:unknown;
 global.AudioContext=class{constructor(o:unknown){options=o;return ctx;}};
 global.AudioWorkletNode=class{constructor(){node=new Node();return node;}};
 const engine=new AudioEngine();await engine.start();engine.beginPreparedSong();
 expect(options).toEqual({latencyHint:'interactive',sampleRate:48000});
 expect(node!.port.messages).toContainEqual({type:'rendering',enabled:false});
 const id=await engine.playPreparedSong(rendered.samples,rendered.tele,plan);
 let planned=0;engine.onPlanned(m=>{planned=m.id;});await new Promise(r=>setTimeout(r,5));expect(planned).toBe(id);
 expect(engine.lastPlan?.id).toBe(id);
 expect(ctx.sources).toHaveLength(1);expect(ctx.sources[0].connections.length).toBe(1);
 expect(engine.voiceClock()).toBe(0);ctx.currentTime=.74;expect(engine.voiceClock()).toBeCloseTo(.6);
 ctx.currentTime=10;expect(engine.voiceClock()).toBeCloseTo(rendered.samples.length/48000);
 expect(engine.voiceClock()!).toBeGreaterThan(plan.end+.4);
 engine.stopPreparedSong();expect(ctx.sources[0].stopped).toBe(true);
 expect(node!.port.messages.at(-1)).toEqual({type:'rendering',enabled:true});
});

test('a cancelled preparation cannot start an old buffer after a new song begins',async()=>{
 const ctx=new Context();global.AudioContext=class{constructor(){return ctx;}};global.AudioWorkletNode=Node;
 const engine=new AudioEngine();await engine.start();engine.beginPreparedSong();
 let resume!:()=>void;ctx.resumeWait=new Promise<void>(r=>{resume=r;});
 const old=engine.playPreparedSong(rendered.samples,rendered.tele,plan);
 engine.stopPreparedSong();engine.beginPreparedSong();resume();
 await expect(old).rejects.toThrow('cancelled');expect(ctx.sources).toHaveLength(0);engine.stopPreparedSong();
});

test('the solo render worker returns actual audio and mouth data with progress',async()=>{
 const worker=new Worker(new URL('./solo-worker-host.ts',import.meta.url).href,{type:'module'});
 let progress=0;
 try{
  const result=await new Promise<{samples:Float32Array;tele:ArrayBuffer}>((resolve,reject)=>{
   worker.onerror=()=>reject(new Error('render worker failed'));
   worker.onmessage=({data})=>{
    if(data.type==='boot-ready')worker.postMessage({name:melody.name,plan,body:part.body,...settings});
    if(data.type==='progress')progress++;
    if(data.type==='error')reject(new Error(data.message));
    if(data.type==='done')resolve(data);
   };
  });
  expect(progress).toBeGreaterThan(1);expect(result.samples.some(x=>Math.abs(x)>.01)).toBe(true);
  const track=new TeleTrack(result.tele);expect(Math.abs(track.duration-result.samples.length/48000)).toBeLessThan(.051);
 }finally{worker.terminate();}
},15000);
