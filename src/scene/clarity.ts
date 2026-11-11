import {planPhrases,plannedCounts} from '../wasm/engine.ts';
import type {BodyMix,Segment} from '../wasm/types.ts';

type Phrase={segments:Segment[];intonation?:'statement'|'question'|'flat';pause?:number};
/** Multipliers on the planner's own vowel lengths, and minimum lengths (s) for a kind of consonant. */
export interface Clarity{unstressed:number;stressed:number;floors?:Record<string,number>}
/**
 * Measured with Whisper on 81 sentences (the speech judge's training sentences in both adult
 * bodies, and the Wizard of Oz lines): word errors 29 % as planned, 17 % with these, for 25 % more
 * time. The planner's reduced vowels last 55–70 ms and the words around them are the ones lost.
 * Longer consonants, a brighter or drier voice and treble did nothing; see docs/speech-clarity.md.
 */
export const CLEAR_SPEECH:Clarity={unstressed:1.7,stressed:1.4,floors:{affricate:.09}};
/** For a line that must fit a slot: most of the gain (29 → 21 %) for 8 % more time. */
export const CLEAR_SPEECH_TIGHT:Clarity={unstressed:1.5,stressed:1};

/**
 * Gives vowels the time a listener needs, before planning. Sounds that already carry an explicit
 * `dur` are left as they are, so a hand-timed line keeps its timing; a later `rate` still scales
 * everything.
 */
export function clearPhrases<P extends Phrase>(phrases:P[],body:BodyMix,clarity:Clarity=CLEAR_SPEECH):P[]{
 return phrases.map(phrase=>{
  if(!phrase.segments.length)return phrase;
  // The planner's own durations for this phrase, one or two planned sounds per written one.
  const plan=planPhrases([{segments:phrase.segments,intonation:phrase.intonation}],{body,t0:0,rate:1}),counts=plannedCounts(phrase.segments.map(s=>s.ipa));
  let k=0;
  return {...phrase,segments:phrase.segments.map((s,i)=>{
   const first=plan.segments[k],last=plan.segments[k+counts[i]-1];k+=counts[i];
   if(s.dur!==undefined||!first||!last)return s;
   const natural=last.t1-first.t0,vowel=first.kind==='vowel';
   const wanted=vowel?natural*(s.stress?clarity.stressed:clarity.unstressed):Math.max(natural,clarity.floors?.[first.kind]??0);
   return wanted>natural+1e-9?{...s,dur:wanted}:s;
  })};
 });
}
