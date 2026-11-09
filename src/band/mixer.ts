import type { BandPart } from "./types.ts";

export class BandMixer {
  readonly ctx:AudioContext;
  private channels:{source:AudioBufferSourceNode|null;gain:GainNode;pan:StereoPannerNode;buffer:AudioBuffer;part:BandPart;mute:boolean;solo:boolean}[]=[];
  private playing=false;
  private offset=0;
  private startedAt=0;
  private generation=0;
  epoch=0;
  constructor(ctx:AudioContext=new AudioContext({latencyHint:"playback"})){
    this.ctx=ctx;
    ctx.onstatechange=()=>{if(ctx.state!=="running"&&this.playing)this.pause();};
  }
  load(parts:BandPart[],buffers:AudioBuffer[]):void{
    this.pause();this.clear();this.offset=0;
    const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=4;compressor.attack.value=.008;compressor.release.value=.15;
    compressor.connect(this.ctx.destination);
    this.channels=parts.map((part,i)=>{
      const gain=this.ctx.createGain(),pan=this.ctx.createStereoPanner();
      gain.connect(pan).connect(compressor);pan.pan.value=part.pan;
      return {source:null,gain,pan,buffer:buffers[i],part:{...part},mute:false,solo:false};
    });
    this.updateGains();
  }
  get duration():number{return Math.max(0,...this.channels.map(c=>c.buffer.duration));}
  get isPlaying():boolean{return this.playing;}
  time():number{
    if(!this.playing)return this.offset;
    const ts=this.ctx.getOutputTimestamp?.();
    const audible=ts&&ts.contextTime!==undefined&&ts.performanceTime!==undefined&&ts.contextTime>0?Math.min(this.ctx.currentTime,ts.contextTime+Math.max(0,(performance.now()-ts.performanceTime)/1000)):this.ctx.currentTime-(this.ctx.outputLatency||this.ctx.baseLatency||0);
    const time=Math.min(this.duration,this.offset+Math.max(0,audible-this.startedAt));
    if(time>=this.duration){this.offset=this.duration;this.playing=false;this.stopSources();}
    return time;
  }
  play():void{
    if(this.playing||!this.channels.length)return;
    if(this.offset>=this.duration-.02)this.offset=0;
    const generation=++this.generation;
    void this.ctx.resume().catch(()=>{if(generation===this.generation)this.pause();});
    this.startedAt=this.ctx.currentTime+.04;
    for(const channel of this.channels){
      const source=this.ctx.createBufferSource();source.buffer=channel.buffer;source.connect(channel.gain);
      if(this.offset<channel.buffer.duration)source.start(this.startedAt,this.offset);
      channel.source=source;
    }
    this.playing=true;
  }
  pause():void{this.generation++;if(!this.playing)return;this.offset=this.time();this.playing=false;this.stopSources();}
  seek(time:number):void{const resume=this.playing;this.pause();this.offset=Math.max(0,Math.min(this.duration,time));this.epoch++;if(resume)this.play();}
  setVoice(index:number,patch:{volume?:number;mute?:boolean;solo?:boolean}):void{
    const c=this.channels[index];if(!c)return;
    if(patch.volume!==undefined)c.part.volume=patch.volume;
    if(patch.mute!==undefined)c.mute=patch.mute;
    if(patch.solo!==undefined)c.solo=patch.solo;
    this.updateGains();
  }
  audible(index:number):boolean{const c=this.channels[index];return !!c&&!c.mute&&(!this.channels.some(c=>c.solo)||c.solo)&&c.part.volume>0;}
  private updateGains():void{this.channels.forEach((c,i)=>c.gain.gain.setTargetAtTime(this.audible(i)?c.part.volume:0,this.ctx.currentTime,.015));}
  private stopSources():void{for(const c of this.channels){if(c.source){try{c.source.stop();}catch{}c.source.disconnect();c.source=null;}}}
  private clear():void{this.stopSources();for(const c of this.channels){c.gain.disconnect();c.pan.disconnect();}this.channels=[];}
  dispose():void{this.pause();this.clear();void this.ctx.close().catch(()=>{});}
}

/** Export mono voices and stereo recordings with the same levels, pans, mutes and solos. */
export function mixWave(parts:BandPart[],samples:(Float32Array|readonly Float32Array[])[],rate:number,muted:boolean[],solo:boolean[]):Uint8Array{
  const channels=samples.map(s=>s instanceof Float32Array?[s]:s);
  const frames=Math.max(0,...channels.map(s=>s[0]?.length??0));
  const left=new Float32Array(frames),right=new Float32Array(frames);
  const hasSolo=solo.some(Boolean);
  parts.forEach((part,k)=>{
    if(muted[k]||(hasSolo&&!solo[k]))return;
    const [l,r]=channels[k];if(!l)return;
    if(r){
      // StereoPanner's equal-power crossfeed law; centered backing retains both channels.
      const angle=(part.pan<=0?part.pan+1:part.pan)*Math.PI/2;
      for(let i=0;i<l.length;i++){
        left[i]+=(part.pan<=0?l[i]+r[i]*Math.cos(angle):l[i]*Math.cos(angle))*part.volume;
        right[i]+=(part.pan<=0?r[i]*Math.sin(angle):r[i]+l[i]*Math.sin(angle))*part.volume;
      }
    }else{
      const angle=(part.pan+1)*Math.PI/4;
      for(let i=0;i<l.length;i++){left[i]+=l[i]*part.volume*Math.cos(angle);right[i]+=l[i]*part.volume*Math.sin(angle);}
    }
  });
  let peak=1;for(let i=0;i<frames;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
  const bytes=new Uint8Array(44+frames*4),v=new DataView(bytes.buffer);
  const text=(at:number,s:string)=>[...s].forEach((c,i)=>bytes[at+i]=c.charCodeAt(0));
  text(0,"RIFF");v.setUint32(4,bytes.length-8,true);text(8,"WAVEfmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);text(36,"data");v.setUint32(40,frames*4,true);
  for(let i=0;i<frames;i++){v.setInt16(44+i*4,Math.round(left[i]/peak*.96*32767),true);v.setInt16(46+i*4,Math.round(right[i]/peak*.96*32767),true);}
  return bytes;
}
