import {expect,test} from 'bun:test';
import {videoFormat,subtitleLines,drawVideoFrame,drawLyricsVideoFrame,recordSceneVideo,VIDEO_PRESETS} from '../src/scene/video.ts';
import type {SceneFile} from '../src/scene/scene.ts';
import type {Transport} from '../src/show/transport.ts';
const scene:SceneFile={title:'Scene',description:'Test',duration:.5,audio:'mix.mp3',characters:[{id:'kaffee',name:'Counsel',role:'Asking',tele:'kaffee.tele'},{id:'jessep',name:'Witness',role:'Answering',tele:'jessep.tele'}],cues:[{start:0,end:.5,speaker:'kaffee',text:'A short test.',intensity:.5}],shots:[{time:0,view:'wide'}]};
test('video chooses a supported MP4 or WebM container and rejects unsupported recording',()=>{
 expect(videoFormat(m=>m==='video/mp4;codecs=avc1.64001f,mp4a.40.2').extension).toBe('mp4');expect(videoFormat(m=>m==='video/webm').extension).toBe('webm');expect(()=>videoFormat(()=>false)).toThrow('cannot save');
 expect(subtitleLines('Every word remains visible here',13,s=>s.length)).toEqual(['Every word','remains','visible here']);
});
test('generic MP4 capability cannot select VP9 or Opus inside an MP4',()=>{
 const choice=videoFormat(m=>m==='video/mp4'||m==='video/mp4;codecs=vp9,opus'||m==='video/webm');
 expect(choice.extension).toBe('webm');expect(choice.mimeType).toBe('video/webm');
 expect(()=>videoFormat(m=>m==='video/mp4')).toThrow('cannot save');
});
test('the exported picture contains the subtitle and speaker, even without a DOM caption',()=>{
 const words:string[]=[];const ctx={fillRect(){},drawImage(){},fillText:(s:string)=>words.push(s),measureText:(s:string)=>({width:s.length*10})} as unknown as CanvasRenderingContext2D;
 drawVideoFrame(ctx,{} as CanvasImageSource,scene,.1);expect(words).toEqual(['COUNSEL','A short test.']);
 words.length=0;drawVideoFrame(ctx,{} as CanvasImageSource,scene,.5);expect(words).toEqual([]);
});

function harness(){
 const prior=new Map<string,PropertyDescriptor|undefined>(),frames=new Map<number,FrameRequestCallback>(),events=new Map<string,()=>void>();let number=0,released=0,taps=0,time=0,pos=17,playing=false;
 const draws:number[]=[],starts:number[]=[],tracks=[{kind:'video',stopped:false,stop(){this.stopped=true;}},{kind:'audio',stopped:false,stop(){this.stopped=true;}}];
 class Stream {constructor(readonly tracks:{kind:string;stopped:boolean;stop():void}[]){}getTracks(){return this.tracks;}getVideoTracks(){return this.tracks.filter(t=>t.kind==='video');}getAudioTracks(){return this.tracks.filter(t=>t.kind==='audio');}}
 class Recorder {
  static latest:Recorder;static isTypeSupported(m:string){return m==='video/webm';}
  state='inactive';mimeType='video/webm';ondataavailable:((e:{data:Blob})=>void)|null=null;onstop:(()=>void)|null=null;onerror:(()=>void)|null=null;
  constructor(readonly stream:Stream){Recorder.latest=this;}
  start(){this.state='recording';}stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['complete-video'])});this.onstop?.();});}
 }
 const context={fillRect(){},drawImage(){},fillText(){},measureText:(s:string)=>({width:s.length*10})};
 const doc={hidden:false,fonts:{ready:Promise.resolve()},createElement:()=>({width:0,height:0,getContext:()=>context,captureStream:()=>new Stream([tracks[0]])}),addEventListener:(name:string,fn:()=>void)=>events.set(name,fn),removeEventListener:(name:string)=>events.delete(name)};
 const globals:Record<string,unknown>={document:doc,MediaRecorder:Recorder,MediaStream:Stream,requestAnimationFrame:(fn:FrameRequestCallback)=>{frames.set(++number,fn);return number;},cancelAnimationFrame:(id:number)=>frames.delete(id)};
 for(const [key,value] of Object.entries(globals)){prior.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
 const transport={ctx:{resume:async()=>{},createMediaStreamDestination:()=>({stream:new Stream([tracks[1]]),disconnect(){}})},time:()=>pos,renderTime:()=>time,get isPlaying(){return playing;},seek:(t:number)=>{pos=t;time=t;},pause:()=>{playing=false;},play:()=>{playing=true;starts.push(pos);},connectOutput:()=>{taps++;return()=>{taps--;};}} as unknown as Transport;
 const stage={capture:()=>({draw:(t:number)=>{draws.push(t);return {} as HTMLCanvasElement;},release:()=>{released++;}})};
 return {transport,stage,draws,starts,tracks,doc,events,get recorder(){return Recorder.latest;},get released(){return released;},get taps(){return taps;},get pos(){return pos;},frame(t:number){time=t;const jobs=[...frames.values()];frames.clear();jobs.forEach(fn=>fn(t*1000));},restore(){for(const [key,descriptor] of prior){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}}};
}
const ready=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
test('a full export starts at zero, contains audio and video, and restores the player',async()=>{
 const h=harness();try{
  const promise=recordSceneVideo(h.stage,scene,h.transport,()=>{},new AbortController().signal);await ready();
  expect(h.starts).toEqual([0]);expect(h.recorder.stream.getTracks().map(t=>t.kind)).toEqual(['video','audio']);expect(h.taps).toBe(1);
  h.frame(.1);h.frame(.5);const file=await promise;
  expect(file.extension).toBe('webm');expect(file.blob.size).toBeGreaterThan(0);expect(h.draws).toContain(.5);expect(h.released).toBe(1);expect(h.taps).toBe(0);expect(h.pos).toBe(17);expect(h.tracks.every(t=>t.stopped)).toBe(true);
 }finally{h.restore();}
});
test('cancel and hiding the tab reject partial videos and release the streams',async()=>{
 for(const hidden of [false,true]){
  const h=harness();try{
   const controller=new AbortController(),promise=recordSceneVideo(h.stage,scene,h.transport,()=>{},controller.signal);await ready();
   if(hidden){h.doc.hidden=true;h.events.get('visibilitychange')!();}else controller.abort();
   await expect(promise).rejects.toThrow(hidden?'tab was hidden':'cancelled');expect(h.released).toBe(1);expect(h.taps).toBe(0);expect(h.tracks.every(t=>t.stopped)).toBe(true);expect(h.pos).toBe(17);
  }finally{h.restore();}
 }
});
test('compact X lyrics preset draws song title, karaoke-highlighted lyrics, upcoming preview, and clips cleanly',async()=>{
 const multi:SceneFile={...scene,duration:10,cues:[{start:1,end:4,speaker:'kaffee',text:'First lyric line',intensity:.8},{start:5,end:8,speaker:'jessep',text:'Second lyric line',intensity:.9}]};
 expect(VIDEO_PRESETS['x-lyrics']).toEqual({width:960,height:540,fps:24,videoBitsPerSecond:1_500_000,audioBitsPerSecond:128_000});
 const words:string[]=[];const ctx={fillRect(){},drawImage(){},fillText:(s:string)=>words.push(s),measureText:(s:string)=>({width:s.length*10})} as unknown as CanvasRenderingContext2D;
 drawLyricsVideoFrame(ctx,{} as CanvasImageSource,multi,0.2);
 expect(words).toContain('Scene');expect(words).toContain('NEXT LYRIC');expect(words).toContain('First lyric line');
 words.length=0;drawLyricsVideoFrame(ctx,{} as CanvasImageSource,multi,2.5);
 expect(words).toContain('COUNSEL');expect(words).toContain('First');expect(words).toContain('lyric');expect(words).toContain('line');expect(words).toContain('Second lyric line');
 const h=harness();try{
  const promise=recordSceneVideo(h.stage,multi,h.transport,()=>{},new AbortController().signal,{preset:'x-lyrics',startTime:1,endTime:4});await ready();
  expect(h.starts).toEqual([1]);
  h.frame(2.5);h.frame(4);const file=await promise;
  expect(file.extension).toBe('webm');expect(file.blob.size).toBeGreaterThan(0);expect(h.pos).toBe(17);expect(h.released).toBe(1);
 }finally{h.restore();}
});
test('fast offline WebCodecs path muxes an MP4 silently faster than real time and survives hidden tabs',async()=>{
 const h=harness();
 const priorWC=new Map<string,PropertyDescriptor|undefined>();
 let encodedVideo=0,encodedAudio=0;
 class MockVideoFrame{constructor(readonly src:unknown,readonly init:{timestamp:number;duration:number}){}close(){}}
 class MockAudioData{constructor(readonly init:{timestamp:number;numberOfFrames:number}){}close(){}}
 class MockEncodedVideoChunk{
  readonly type:'key'|'delta';readonly timestamp:number;readonly duration:number;readonly byteLength:number;
  constructor(private readonly bytes:Uint8Array,type:'key'|'delta',timestamp:number,duration:number){this.type=type;this.timestamp=timestamp;this.duration=duration;this.byteLength=bytes.byteLength;}
  copyTo(dst:ArrayBufferView){new Uint8Array(dst.buffer,dst.byteOffset,dst.byteLength).set(this.bytes);}
 }
 class MockEncodedAudioChunk{
  readonly type:'key'|'delta';readonly timestamp:number;readonly duration:number;readonly byteLength:number;
  constructor(private readonly bytes:Uint8Array,timestamp:number,duration:number){this.type='key';this.timestamp=timestamp;this.duration=duration;this.byteLength=bytes.byteLength;}
  copyTo(dst:ArrayBufferView){new Uint8Array(dst.buffer,dst.byteOffset,dst.byteLength).set(this.bytes);}
 }
 class MockVideoEncoder{
  static async isConfigSupported(){return {supported:true};}
  state='configured';encodeQueueSize=0;
  constructor(readonly init:{output:(chunk:unknown,meta?:unknown)=>void;error:(e:unknown)=>void}){}
  configure(){}
  encode(frame:{init:{timestamp:number;duration:number}},opts?:{keyFrame?:boolean}){
   encodedVideo++;
   const bytes=new Uint8Array([0,0,0,4,0x65,0x88,0x84,0x21]);
   const chunk=new MockEncodedVideoChunk(bytes,opts?.keyFrame?'key':'delta',frame.init.timestamp,frame.init.duration);
   const meta=encodedVideo===1?{decoderConfig:{codec:'avc1.640028',description:new Uint8Array([1,0x64,0,0x28,0xff,0xe1,0,4,0x67,0x64,0,0x28,1,0,4,0x68,0xee,0x3c,0x80])}}:undefined;
   this.init.output(chunk,meta);
  }
  async flush(){}
  close(){this.state='closed';}
 }
 class MockAudioEncoder{
  static async isConfigSupported(){return {supported:true};}
  state='configured';encodeQueueSize=0;
  constructor(readonly init:{output:(chunk:unknown,meta?:unknown)=>void;error:(e:unknown)=>void}){}
  configure(){}
  encode(data:{init:{timestamp:number;numberOfFrames:number}}){
   encodedAudio++;
   const bytes=new Uint8Array([0x21,0x10,0x04,0x60]);
   const chunk=new MockEncodedAudioChunk(bytes,data.init.timestamp,Math.round((data.init.numberOfFrames/48000)*1_000_000));
   const meta=encodedAudio===1?{decoderConfig:{codec:'mp4a.40.2',description:new Uint8Array([0x11,0x90])}}:undefined;
   this.init.output(chunk,meta);
  }
  async flush(){}
  close(){this.state='closed';}
 }
 const globals:Record<string,unknown>={VideoEncoder:MockVideoEncoder,AudioEncoder:MockAudioEncoder,VideoFrame:MockVideoFrame,AudioData:MockAudioData,EncodedVideoChunk:MockEncodedVideoChunk,EncodedAudioChunk:MockEncodedAudioChunk};
 for(const [k,v] of Object.entries(globals)){priorWC.set(k,Object.getOwnPropertyDescriptor(globalThis,k));Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true});}
 const fakeAudio={sampleRate:48000,numberOfChannels:2,length:48000,getChannelData:()=>new Float32Array(48000)} as unknown as AudioBuffer;
 Object.defineProperty(h.transport,'audioBuffer',{get:()=>fakeAudio});
 h.doc.hidden=true; // Must succeed even when the tab is hidden!
 let mode='';
 try{
  const file=await recordSceneVideo(h.stage,scene,h.transport,()=>{},new AbortController().signal,{preset:'x-lyrics',onMode:m=>{mode=m;}});
  expect(mode).toBe('offline');
  expect(file.extension).toBe('mp4');
  expect(file.fast).toBe(true);
  expect(encodedVideo).toBe(12); // 0.5s * 24fps
  expect(encodedAudio).toBeGreaterThan(0);
  expect(h.starts).toEqual([]); // Never played audio aloud!
  expect(h.pos).toBe(17); // Restored playhead
  expect(h.released).toBe(1);
  const head=new TextDecoder().decode(new Uint8Array(await file.blob.arrayBuffer()).slice(4,8));
  expect(head).toBe('ftyp'); // Real valid MP4 box header!
 }finally{
  for(const [k,d] of priorWC){if(d)Object.defineProperty(globalThis,k,d);else Reflect.deleteProperty(globalThis,k);}
  h.restore();
 }
});
