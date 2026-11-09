import { TeleTrack } from "../show/tele.ts";
import type { TelemetryMessage } from "../worklet/protocol.ts";

/** Play prepared airway audio without running its expensive solver on the audio thread. */
export class BufferedVoice {
  readonly track:TeleTrack;
  readonly duration:number;
  private source:AudioBufferSourceNode;
  private startedAt:number;
  private timer:ReturnType<typeof setInterval>|null=null;
  private stopped=false;
  private stoppedAt=0;
  constructor(private ctx:AudioContext,output:AudioNode,samples:Float32Array,tele:ArrayBuffer,private publish:(m:TelemetryMessage)=>void){
    this.track=new TeleTrack(tele);
    const buffer=ctx.createBuffer(1,samples.length,this.track.sampleRate);
    buffer.copyToChannel(new Float32Array(samples),0);
    this.duration=buffer.duration;
    this.source=ctx.createBufferSource();this.source.buffer=buffer;this.source.connect(output);
    this.startedAt=ctx.currentTime+.04;this.source.start(this.startedAt);
    this.tick();this.timer=setInterval(()=>this.tick(),20);
  }
  time():number{
    if(this.stopped)return this.stoppedAt;
    const stamp=this.ctx.getOutputTimestamp?.();
    const audible=stamp&&stamp.contextTime!==undefined&&stamp.performanceTime!==undefined&&stamp.contextTime>0?Math.min(this.ctx.currentTime,stamp.contextTime+Math.max(0,(performance.now()-stamp.performanceTime)/1000)):this.ctx.currentTime-(this.ctx.outputLatency||this.ctx.baseLatency||0);
    return Math.max(0,Math.min(this.duration,audible-this.startedAt));
  }
  tick():void{
    if(this.stopped)return;
    const time=this.time(),m=this.track.message(this.track.indexAt(time));
    // A silent tail keeps the face at rest once the last vowel has ended.
    this.publish({...m,t:{...m.t,clock:time}});
    if(time>=this.duration&&this.timer!==null){clearInterval(this.timer);this.timer=null;}
  }
  stop():void{
    if(this.stopped)return;
    this.stoppedAt=this.time();this.stopped=true;
    if(this.timer!==null)clearInterval(this.timer);this.timer=null;
    this.source.stop();this.source.disconnect();
  }
}
