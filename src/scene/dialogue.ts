import {planUtterance} from '../wasm/engine.ts';
import type {Gesture,Segment} from '../wasm/types.ts';
import type {BandPart} from '../band/types.ts';
export interface DialogueLine<Id extends string=string>{speaker:Id;text:string;start:number;end:number;pitch:number;accent?:number;humming?:boolean;sourceEnd:number;timingWeight:number;pitchContour?:{time:number;hz:number}[];words:{text:string;start:number;end:number}[];segments:Segment[]}
export interface DialoguePerformance<Id extends string=string>{duration:number;backingVolume:number;parts:BandPart[];lines:DialogueLine<Id>[]}
const diphthongs=new Set(['aɪ','aʊ','ɔɪ','eɪ','oʊ']);
/** Blend source word anchors with natural phone durations so short detected words stay intelligible. */
export function planDialoguePart<Id extends string>(score:DialoguePerformance<Id>,id:Id):Gesture[]{
 const part=score.parts.find(p=>p.id===id);if(!part)throw Error('Missing Dialogue speaker.');
 const out:Gesture[]=[];
 for(const line of score.lines.filter(l=>l.speaker===id)){
  if(line.humming){
   // A nonverbal assent has two nasal pulses. Keep the lips sealed through the gap so it cannot become "muh-mam".
   const start=line.start,end=line.end,split=start+(end-start)*.42;
   const add=(t0:number,t1:number,targets:Gesture['targets'],rampIn:number,rampOut:number)=>out.push({t0,t1,targets,rampIn,rampOut,strength:1});
   add(start-.10,end+.10,{jaw:.2,lipAp:-.2,lipProt:0,lipWidth:0,velum:.45},.04,.08);
   add(start-.08,end+.12,{abduction:.015},.03,.06);
   add(start,split-.035,{breath:.75},.035,.035);
   add(split+.065,end,{breath:1},.04,.055);
   add(start-.08,split,{f0:line.pitch},.025,.03);
   add(split,end+.08,{f0:line.pitch*(1+(line.accent??.2))},.06,.05);
   continue;
  }
  const plan=planUtterance(line.segments,{body:part.body,t0:0,f0:line.pitch,rate:1,intonation:line.text.trim().endsWith('?')?'question':'statement',accent:line.accent??.11});
  const input=[0],output=[line.start-.06];let cursor=0,word=0;
  for(const [index,segment] of line.segments.entries()){
   if(cursor===0||line.segments[index-1]?.wordEnd){
    const planned=plan.segments[cursor],source=line.words[word++];if(!planned||!source)throw Error('Dialogue word anchors do not match the phonemes.');
    const natural=(planned.t0-.06)/(plan.end-.06),measured=(source.start-line.start)/(line.sourceEnd-line.start);
    input.push(planned.t0);output.push(line.start+(line.end-line.start)*(natural*(1-line.timingWeight)+measured*line.timingWeight));
   }
   cursor+=diphthongs.has(segment.ipa)?2:1;
  }
  if(cursor!==plan.segments.length||word!==line.words.length)throw Error('Incomplete Dialogue word timing.');
  input.push(plan.end);output.push(line.end);
  if(input.some((t,i)=>i>0&&t<=input[i-1])||output.some((t,i)=>i>0&&t<=output[i-1]))throw Error('Dialogue word timing must advance.');
  const warp=(time:number)=>{let k=0;while(k<input.length-2&&input[k+1]<time)k++;return output[k]+(time-input[k])/(input[k+1]-input[k])*(output[k+1]-output[k]);};
  const contour=line.pitchContour;
  if(contour?.some((p,i)=>!Number.isFinite(p.time)||!Number.isFinite(p.hz)||p.hz<=0||i>0&&p.time<=contour[i-1].time))throw Error('Invalid dialogue pitch contour.');
  // An optional source-shaped contour changes pitch only; articulation and word timing are retained.
  const pitch=(time:number)=>{
   if(!contour?.length)return undefined;
   if(time<=contour[0].time)return contour[0].hz;let i=0;while(i<contour.length-2&&contour[i+1].time<time)i++;
   const a=contour[i],b=contour[i+1]??a;if(time>=b.time)return b.hz;const u=(time-a.time)/(b.time-a.time);return a.hz*(b.hz/a.hz)**u;
  };
  for(const g of plan.gestures)out.push({...g,targets:g.targets.f0!==undefined&&line.pitchContour?.length?{...g.targets,f0:pitch((warp(g.t0)+warp(g.t1))/2)}:g.targets,t0:warp(g.t0),t1:warp(g.t1),rampIn:warp(g.t0)-warp(g.t0-g.rampIn),rampOut:warp(g.t1+g.rampOut)-warp(g.t1),releaseHold:g.releaseHold===undefined?undefined:warp(g.t1+g.releaseHold)-warp(g.t1)});
 }
 if(out.some(g=>![g.t0,g.t1,g.rampIn,g.rampOut].every(Number.isFinite)||g.t0<0||g.t1<g.t0||g.t1>score.duration))throw Error('Invalid Dialogue physical score.');
 return out;
}
