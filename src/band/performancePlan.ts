import {planUtterance} from '../wasm/engine.ts';
import type {Gesture} from '../wasm/types.ts';
import type {BandPart,VocalPerformance} from './types.ts';

/** Measured consonant/vowel spans bypass text normalization and default sung durations. */
export function planPerformance(part:BandPart,p:VocalPerformance):Gesture[]{
  const out:Gesture[]=[];
  for(const phrase of p.phrases){
    const plan=planUtterance(phrase.phones.map(s=>({ipa:s.ipa,dur:s.duration,...(s.nasalized?{nasalized:true}:{}),...(s.palatalized?{palatalized:true}:{})})),{body:part.body,t0:phrase.start-.06,rate:1,f0:180,intonation:'flat',sung:true});
    for(const gesture of plan.gestures){
      const {f0,breath,vibrato,...targets}=gesture.targets;
      if(Object.keys(targets).length)out.push({...gesture,targets});
    }
    const end=phrase.start+phrase.phones.reduce((sum,s)=>sum+s.duration,0);
    const points=p.contour.filter(c=>c.time>=phrase.start-1e-6&&c.time<end);
    points.forEach((c,i)=>{
      const t1=i+1<points.length?Math.min(end,points[i+1].time):end;
      if(t1>c.time)out.push({t0:c.time,t1,rampIn:Math.min(.018,(t1-c.time)/2),rampOut:Math.min(.018,(t1-c.time)/2),strength:6,targets:{f0:c.hz,breath:c.breath,vibrato:part.vibrato??0},label:'source performance'});
    });
  }
  return out;
}
