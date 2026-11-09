import { lyricsToSyllables, planSong } from "../wasm/engine.ts";
import type { BodyMix, Plan, Syllable } from "../wasm/types.ts";
import type { Melody } from "./melody.ts";

/** Schedule separate phrases at their original timestamps so imported rests stay silent. */
export function planMelody(song:Melody, lyrics:string, body:BodyMix, speed:number, transpose:number, vibrato:number){
  const syllables=lyricsToSyllables(lyrics.trim()||"ah");
  const plan:Plan={gestures:[],segments:[],end:.35+song.duration/speed};
  const times:[number,number][]=[];
  const sung:Syllable[]=[];
  const midi:number[]=[];
  let phrase:{midi:number;beats:number;syl:Syllable}[]=[];
  let phraseStart=.35;
  const flush=()=>{
    if(!phrase.length)return;
    const p=planSong(phrase,{body,bpm:60,t0:phraseStart,vibrato});
    plan.gestures.push(...p.gestures);plan.segments.push(...p.segments);plan.end=Math.max(plan.end,p.end);phrase=[];
  };
  song.notes.forEach((n,i)=>{
    const t0=.35+n.start/speed, t1=t0+n.duration/speed;
    const previous=song.notes[i-1];
    if(previous&&n.start-previous.start-previous.duration>.025){flush();phraseStart=t0;}
    if(!phrase.length)phraseStart=t0;
    const base=syllables[(n.lyricIndex??i)%syllables.length];
    const syl=n.hold?{...base,onset:[],coda:[],melisma:true,phraseEnd:false}:base;
    const pitch=Math.max(24,Math.min(96,n.midi+transpose));
    const next=song.notes[i+1];
    const span=next&&next.start-n.start-n.duration<=.025?next.start-n.start:n.duration;
    phrase.push({midi:pitch,beats:span/speed,syl});
    times.push([t0,t1]);sung.push(syl);midi.push(pitch);
  });
  flush();
  return {plan,times,syllables:sung,midi};
}
