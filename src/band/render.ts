import { writeGestures, writeSteps, CONTROL_KEYS } from "../wasm/wire.ts";
import type { Gesture, VoiceSource, HumanArtic } from "../wasm/types.ts";
import type { BandPart, RenderedPart } from "./types.ts";
import { processVocalEffects } from "./effects.ts";
import {synthesizeWhistle,whistleNotes,whistleSpans} from "./whistle.ts";

type Fn=(...args:number[])=>number;
type Abi={memory:WebAssembly.Memory}&Record<string,Fn>;
// The acoustic tube solver is calibrated at 48 kHz; reducing this makes its output unstable.
export const BAND_RATE=48000;
export const BAND_HOP=2400;

/** Render the actual CHIMERA airway; capture its telemetry on the same sample clock. */
export function renderPart(module:WebAssembly.Module,part:BandPart,duration:number,gestures:Gesture[],progress?:(p:number)=>void,settings?:{source:VoiceSource;artic:HumanArtic;tipFree:boolean}):RenderedPart {
  if(gestures.length>16000)throw new Error(`${part.name} has too many mouth gestures. Use a shorter excerpt.`);
  const x=new WebAssembly.Instance(module,{}).exports as unknown as Abi;
  const h=x.engine_new(BAND_RATE);
  try{
    x.engine_set_body(h,part.body.female,part.body.child);
    const source=new Float64Array(x.memory.buffer,x.engine_values(h),32).fill(NaN);
    source[2]=9;source[4]=part.voice?.tension??.55;source[8]=5;source[9]=.004;source[10]=part.delivery==="whistle"||part.voice?.voiced===false?0:1;
    if(part.voice?.breathiness!==undefined)source[3]=part.voice.breathiness;
    if(part.voice?.brightness!==undefined)source[11]=part.voice.brightness;
    if(part.vibrato!==undefined)source[7]=part.vibrato;
    if(settings){
      const keys=["f0","glide","pressure","breathiness","tension","fry","roughness","vibratoDepth","vibratoRate","drift","voiced","brightness"] as const;
      keys.forEach((key,i)=>source[i]=Number(settings.source[key]));
    }
    x.engine_set_source(h);
    if(settings){
      const values=new Float64Array(x.memory.buffer,x.engine_values(h),32).fill(NaN);
      CONTROL_KEYS.slice(0,17).forEach((key,i)=>values[i]=settings.artic[key as keyof HumanArtic]);
      x.engine_set_artic(h,settings.tipFree?1:0);
    }
    for(let i=0;i<gestures.length;i+=4000){
      const n=writeGestures(x.memory.buffer,x.engine_records(h),gestures.slice(i,i+4000),4000);
      x.engine_schedule(h,n,0,i===0?1:0);
    }
    const total=Math.ceil(duration*BAND_RATE),samples=new Float32Array(total);
    const p=x.engine_telemetry(h),header=new Float64Array(x.memory.buffer,p,16);
    const nArtic=header[11],nPh=header[12],nOr=header[13],nScope=32;
    const len=11+nArtic+3*(nPh+nOr)+2*nScope;
    const frames=Math.floor(total/BAND_HOP)+1;
    const tele=new ArrayBuffer(48+frames*len*4),view=new DataView(tele);
    new Uint8Array(tele,0,4).set([67,72,84,76]);
    [1,BAND_RATE,BAND_HOP,frames,len,nArtic,nPh,nOr,nScope].forEach((v,i)=>view.setUint32(4+4*i,v,true));
    view.setFloat32(40,part.body.female,true);view.setFloat32(44,part.body.child,true);
    const data=new Float32Array(tele,48);
    const snap=(frame:number)=>{
      const ptr=x.engine_telemetry(h),head=new Float64Array(x.memory.buffer,ptr,16),scope=head[14];
      const raw=new Float64Array(x.memory.buffer,ptr,16+nArtic+3*(nPh+nOr)+2*scope);
      let o=frame*len;
      data.set(raw.subarray(0,11),o);o+=11;
      const body=raw.subarray(16,16+nArtic+3*(nPh+nOr));data.set(body,o);o+=body.length;
      const at=16+body.length;
      for(let side=0;side<2;side++)for(let j=0;j<nScope;j++)data[o++]=raw[at+side*scope+Math.floor(j*scope/nScope)];
    };
    const beats=(part.beats??[]).map(b=>({...b,time:b.time+.35})).sort((a,b)=>a.time-b.time);
    const mixedWhistles=!!part.whistleMelody&&part.delivery!=="sing"&&part.delivery!=="whistle";
    const ranges=mixedWhistles?whistleSpans(part).map(s=>({start:Math.round(s.start*BAND_RATE),end:Math.round(s.end*BAND_RATE)})):[];
    const sungVoicing=settings?.source.voiced??(part.voice?.voiced!==false);
    let range=0,whistleVoicing=false;
    let hit=0,pos=0,nextFrame=0,frame=0;
    while(pos<total){
      if(mixedWhistles){
        while(range<ranges.length&&ranges[range].end<=pos)range++;
        const whistling=!!ranges[range]&&ranges[range].start<=pos;
        if(whistling!==whistleVoicing){
          const values=new Float64Array(x.memory.buffer,x.engine_values(h),32).fill(NaN);values[10]=whistling?0:Number(sungVoicing);x.engine_set_source(h);whistleVoicing=whistling;
        }
      }
      if(pos===nextFrame){snap(frame++);nextFrame+=BAND_HOP;progress?.(pos/total);}
      while(hit<beats.length&&Math.round(beats[hit].time*BAND_RATE)<=pos){
        const b=beats[hit++];writeSteps(x.memory.buffer,x.engine_records(h),[{id:b.id,accent:b.accent??1}]);x.engine_beat_hit(h);
      }
      const nextHit=hit<beats.length?Math.max(pos+1,Math.round(beats[hit].time*BAND_RATE)):total;
      const n=Math.min(128,total-pos,nextFrame-pos,nextHit-pos);
      const block=new Float32Array(x.memory.buffer,x.engine_render(h,n),n);
      for(const sample of block)if(!Number.isFinite(sample))throw new Error(`${part.name} produced an unstable sound. Try a different singer or a lower note range.`);
      samples.set(block,pos);pos+=n;
    }
    if(frame<frames)snap(frame++);
    if(part.delivery==="whistle"||mixedWhistles){
      const whistle=synthesizeWhistle(part,duration,BAND_RATE);
      if(mixedWhistles){for(const s of ranges){const a=Math.max(0,s.start),b=Math.min(total,s.end);samples.set(whistle.subarray(a,b),a);}}
      else samples.set(whistle);
      const notes=whistleNotes(part);let note=0;
      for(let f=0;f<frames;f++){
        if(mixedWhistles&&!ranges.some(s=>f*BAND_HOP>=s.start&&f*BAND_HOP<s.end))continue;
        const t=f*BAND_HOP/BAND_RATE;while(note<notes.length&&notes[note].end<=t)note++;
        const active=notes[note]&&notes[note].start<=t;
        let energy=0;const start=f*BAND_HOP,end=Math.min(total,start+BAND_HOP);
        for(let i=start;i<end;i++)energy+=samples[i]*samples[i];
        data[f*len+3]=active?notes[note].hz:0;data[f*len+4]=0;data[f*len+6]=end>start?Math.sqrt(energy/(end-start)):0;
      }
    }else if(part.voice?.voiced===false&&!settings){
      // A whisper has far less energy than singing. Lift it without clipping its consonants.
      let peak=0;for(const v of samples)peak=Math.max(peak,Math.abs(v));
      const gain=peak>0?Math.min(4,.85/peak):1;
      for(let i=0;i<samples.length;i++)samples[i]*=gain;
    }
    if(part.effects)processVocalEffects(samples,BAND_RATE,part.effects);
    progress?.(1);
    return {id:part.id,samples,tele};
  }finally{x.engine_free(h);}
}
