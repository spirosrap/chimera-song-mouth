import { planMelody } from "../song/plan.ts";
import { EnglishG2P, planPhrases } from "../wasm/engine.ts";
import type { Gesture } from "../wasm/types.ts";
import { isVoicePart, type BandPart } from "./types.ts";
import {planWhistle} from "./whistle.ts";
import {planPerformance} from './performancePlan.ts';

export function planPart(part:BandPart):Gesture[]{
  if(!isVoicePart(part))throw new Error("Recorded backing and finger clicks stay as audio; only singers can be rendered.");
  if(part.delivery==="whistle")return planWhistle(part);
  if(part.performance&&part.melody?.lyrics===part.performance.lyrics)return planPerformance(part,part.performance);
  const gestures:Gesture[]=part.melody?planMelody(part.melody,part.melody.lyrics,part.body,1,0,part.vibrato??18).plan.gestures:[];
  if(part.whistleMelody&&part.delivery!=="sing")gestures.push(...planWhistle(part));
  const g2p=new EnglishG2P();
  for(const line of part.speech??[]){
    gestures.push(...planPhrases(g2p.toPhrases(line.text),{body:part.body,t0:line.time+.35,f0:120,rate:1.05}).gestures);
  }
  return gestures;
}
