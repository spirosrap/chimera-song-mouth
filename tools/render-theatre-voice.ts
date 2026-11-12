import {renderPart,BAND_RATE,BAND_HOP} from '../src/band/render.ts';
import type {BandPart,RenderedPart} from '../src/band/types.ts';
import type {Gesture} from '../src/wasm/types.ts';
/** Render sample phrases with their physical attacks and releases; keep silent gaps on the source clock. */
export function renderTheatreVoice(module:WebAssembly.Module,part:BandPart,duration:number,gestures:Gesture[],progress?:(p:number)=>void):RenderedPart{
 const hop=BAND_HOP/BAND_RATE,total=Math.ceil(duration*BAND_RATE),frames=Math.floor(total/BAND_HOP)+1;
 const spans:{start:number;end:number;gestures:Gesture[]}[]=[];
 for(const g of [...gestures].sort((a,b)=>a.t0-b.t0)){
  const start=Math.max(0,Math.floor((g.t0-.2)/hop)*hop),end=Math.min(duration,Math.ceil((g.t1+.2)/hop)*hop),last=spans.at(-1);
  if(last&&start<=last.end+1e-6){last.end=Math.max(last.end,end);last.gestures.push(g);}else spans.push({start,end,gestures:[g]});
 }
 const neutral=renderPart(module,part,.05,[]),head=new DataView(neutral.tele),width=head.getUint32(20,true),tele=new ArrayBuffer(48+frames*width*4),data=new Float32Array(tele,48),rest=new Float32Array(neutral.tele,48).subarray(0,width),samples=new Float32Array(total);
 new Uint8Array(tele,0,48).set(new Uint8Array(neutral.tele,0,48));new DataView(tele).setUint32(16,frames,true);
 for(let f=0;f<frames;f++){data.set(rest,f*width);data[f*width+10]=f*hop;}
 for(const [i,span]of spans.entries()){
  const offsetFrames=Math.round(span.start/hop),first=offsetFrames*BAND_HOP,r=renderPart(module,part,span.end-span.start,span.gestures.map(g=>({...g,t0:g.t0-span.start,t1:g.t1-span.start})));
  samples.set(r.samples.subarray(0,total-first),first);const source=new Float32Array(r.tele,48),count=Math.min(new DataView(r.tele).getUint32(16,true),frames-offsetFrames);
  for(let f=0;f<count;f++){data.set(source.subarray(f*width,(f+1)*width),(f+offsetFrames)*width);data[(f+offsetFrames)*width+10]=(f+offsetFrames)*hop;}
  progress?.((i+1)/spans.length);
 }
 progress?.(1);return {id:part.id,samples,tele};
}
