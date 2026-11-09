import {expect,test} from 'bun:test';
import {videoFormat,subtitleLines,drawVideoFrame,recordSceneVideo} from '../src/scene/video.ts';
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
