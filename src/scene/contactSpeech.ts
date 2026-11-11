import {planUtterance} from '../wasm/engine.ts';
import type {Gesture,Segment} from '../wasm/types.ts';
import type {BandPart} from '../band/types.ts';
import type {ContactPerson} from './contact.ts';
export interface ContactLine{speaker:ContactPerson;text:string;start:number;end:number;pitch:number;sourceEnd:number;timingWeight:number;words:{text:string;start:number;end:number}[];segments:Segment[]}
export interface ContactPerformance{duration:number;backingVolume:number;parts:BandPart[];lines:ContactLine[]}
const diphthongs=new Set(['aɪ','aʊ','ɔɪ','eɪ','oʊ']);
/** Blend source word anchors with natural phone durations so short detected words stay intelligible. */
export function planContactPart(score:ContactPerformance,id:ContactPerson):Gesture[]{
 const part=score.parts.find(p=>p.id===id);if(!part)throw Error('Missing Contact speaker.');
 const out:Gesture[]=[];
 for(const line of score.lines.filter(l=>l.speaker===id)){
  const plan=planUtterance(line.segments,{body:part.body,t0:0,f0:line.pitch,rate:1,intonation:line.text.trim().endsWith('?')?'question':'statement',accent:.11});
  const input=[0],output=[line.start-.06];let cursor=0,word=0;
  for(const [index,segment] of line.segments.entries()){
   if(cursor===0||line.segments[index-1]?.wordEnd){
    const planned=plan.segments[cursor],source=line.words[word++];if(!planned||!source)throw Error('Contact word anchors do not match the phonemes.');
    const natural=(planned.t0-.06)/(plan.end-.06),measured=(source.start-line.start)/(line.sourceEnd-line.start);
    input.push(planned.t0);output.push(line.start+(line.end-line.start)*(natural*(1-line.timingWeight)+measured*line.timingWeight));
   }
   cursor+=diphthongs.has(segment.ipa)?2:1;
  }
  if(cursor!==plan.segments.length||word!==line.words.length)throw Error('Incomplete Contact word timing.');
  input.push(plan.end);output.push(line.end);
  if(input.some((t,i)=>i>0&&t<=input[i-1])||output.some((t,i)=>i>0&&t<=output[i-1]))throw Error('Contact word timing must advance.');
  const warp=(time:number)=>{let k=0;while(k<input.length-2&&input[k+1]<time)k++;return output[k]+(time-input[k])/(input[k+1]-input[k])*(output[k+1]-output[k]);};
  for(const g of plan.gestures)out.push({...g,t0:warp(g.t0),t1:warp(g.t1),rampIn:warp(g.t0)-warp(g.t0-g.rampIn),rampOut:warp(g.t1+g.rampOut)-warp(g.t1),releaseHold:g.releaseHold===undefined?undefined:warp(g.t1+g.releaseHold)-warp(g.t1)});
 }
 if(out.some(g=>![g.t0,g.t1,g.rampIn,g.rampOut].every(Number.isFinite)||g.t0<0||g.t1<g.t0||g.t1>score.duration))throw Error('Invalid Contact physical score.');
 return out;
}
