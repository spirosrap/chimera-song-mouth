import {planPhrases,plannedCounts} from '../wasm/engine.ts';
import type {BodyMix,Segment} from '../wasm/types.ts';

type Phrase={segments:Segment[];intonation?:'statement'|'question'|'flat';pause?:number};
/** Multipliers on the planner's own vowel lengths, and minimum lengths (s) for a kind of consonant. */
export interface Clarity{unstressed:number;stressed:number;floors?:Record<string,number>}
/**
 * The planner itself now speaks vowels at clear-speech length (crates/chimera, durations.rs:
 * unstressed 1.7x and stressed 1.4x Klatt's fluent-speech rules), which is what this helper used
 * to add: measured with Whisper, word errors 29 % -> 17 % on 81 sentences for 25 % more time; see
 * docs/speech-clarity.md. What is left here is that an affricate is never under 90 ms.
 */
export const CLEAR_SPEECH:Clarity={unstressed:1,stressed:1,floors:{affricate:.09}};
/**
 * For a line that must fit a slot in a source clip: vowels part of the way back toward fluent
 * speech (unstressed 1.5x Klatt, stressed 1x), which kept most of the gain for 8 % more time.
 */
export const CLEAR_SPEECH_TIGHT:Clarity={unstressed:1.5/1.7,stressed:1/1.4};

/**
 * Adjusts the planner's own sound lengths before planning. Sounds that already carry an explicit
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
   return Math.abs(wanted-natural)>1e-9?{...s,dur:wanted}:s;
  })};
 });
}
