import {renderPart,BAND_RATE,BAND_HOP} from '../src/band/render.ts';
import type {BandPart,RenderedPart} from '../src/band/types.ts';
import type {Gesture} from '../src/wasm/types.ts';
/** Skip only the quiet pre-dialogue lead-in; pad neutral telemetry on the same 50 ms clock. */
export function renderDialogueVoice(module:WebAssembly.Module,part:BandPart,duration:number,gestures:Gesture[],progress?:(n:number)=>void):RenderedPart{
 if(!gestures.length)throw Error('A dialogue speaker has no physical score.');
 const hop=BAND_HOP/BAND_RATE,offsetFrames=Math.max(0,Math.floor((Math.min(...gestures.map(g=>g.t0))-.25)/hop)),offset=offsetFrames*hop;
 const rendered=renderPart(module,part,duration-offset,gestures.map(g=>({...g,t0:g.t0-offset,t1:g.t1-offset})),progress);
 const total=Math.ceil(duration*BAND_RATE),samples=new Float32Array(total),first=offsetFrames*BAND_HOP;
 samples.set(rendered.samples.subarray(0,total-first),first);
 const source=new DataView(rendered.tele),width=source.getUint32(20,true),frames=Math.floor(total/BAND_HOP)+1;
 const tele=new ArrayBuffer(48+frames*width*4);new Uint8Array(tele,0,48).set(new Uint8Array(rendered.tele,0,48));new DataView(tele).setUint32(16,frames,true);
 const from=new Float32Array(rendered.tele,48),data=new Float32Array(tele,48),available=source.getUint32(16,true);
 for(let i=0;i<frames;i++){
  const index=Math.max(0,Math.min(available-1,i-offsetFrames));data.set(from.subarray(index*width,(index+1)*width),i*width);data[i*width+10]=i*hop;
 }
 return {id:part.id,samples,tele};
}
