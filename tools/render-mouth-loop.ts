import {renderPart,BAND_RATE,BAND_HOP} from '../src/band/render.ts';
import {planPart} from '../src/band/planning.ts';
import type {BandPart,RenderedPart} from '../src/band/types.ts';
/** Repeated *engine-generated* cells, with their own physical telemetry, on measured source onsets. */
export function renderMouthLoop(module:WebAssembly.Module,part:BandPart,duration:number):RenderedPart{
 if(!part.performance||!part.melody)throw Error('A prepared mouth loop is required.');
 const hop=BAND_HOP/BAND_RATE,total=Math.ceil(duration*BAND_RATE),frames=Math.floor(total/BAND_HOP)+1;
 const rest=renderPart(module,part,.05,[]),width=new DataView(rest.tele).getUint32(20,true),tele=new ArrayBuffer(48+frames*width*4),data=new Float32Array(tele,48),neutral=new Float32Array(rest.tele,48).subarray(0,width),samples=new Float32Array(total);
 new Uint8Array(tele,0,48).set(new Uint8Array(rest.tele,0,48));new DataView(tele).setUint32(16,frames,true);
 for(let f=0;f<frames;f++){data.set(neutral,f*width);data[f*width+10]=f*hop;}
 const cache=new Map<string,RenderedPart>(),round=(n:number)=>Math.round(n*1e6)/1e6;
 for(const phrase of part.performance.phrases){
  const length=phrase.phones.reduce((s,p)=>s+p.duration,0),contour=part.performance.contour.filter(c=>c.time>=phrase.start-1e-6&&c.time<phrase.start+length).map(c=>({...c,time:round(c.time-phrase.start+.1)}));
  const performance={lyrics:part.performance.lyrics,phrases:[{...phrase,start:.1}],contour};
  const key=JSON.stringify(performance);let cell=cache.get(key);
  if(!cell){const one={...part,performance};cell=renderPart(module,one,.1+length+.12,planPart(one));cache.set(key,cell);}
  const first=Math.round((phrase.start-.1)*BAND_RATE),from=Math.max(0,-first),to=Math.min(cell.samples.length,total-first);
  for(let i=from;i<to;i++)samples[first+i]+=cell.samples[i];
  const source=new Float32Array(cell.tele,48),count=new DataView(cell.tele).getUint32(16,true);
  for(let f=Math.max(0,Math.ceil(first/BAND_HOP));f<Math.min(frames,Math.ceil((first+to)/BAND_HOP));f++){
   const at=Math.max(0,Math.min(count-1,Math.round((f*BAND_HOP-first)/BAND_HOP)));
   data.set(source.subarray(at*width,(at+1)*width),f*width);data[f*width+10]=f*hop;
  }
 }
 return {id:part.id,samples,tele};
}
