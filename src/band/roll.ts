import type {MelodyNote} from '../song/melody.ts';

/** Band notes use a 350 ms render lead-in; telemetry already uses the audio clock. */
export const NOTE_AUDIO_OFFSET=.35;
export function performanceWindow(time:number,width:number,duration:number){
  const span=Math.min(20,Math.max(8,width/72));
  const left=Math.min(Math.max(0,duration-span),Math.max(0,time-span*.27));
  return {left,right:left+span,span};
}
export function performanceRange(notes:MelodyNote[]){
  const pitches=notes.map(n=>n.midi).filter(Number.isFinite);
  const low=pitches.length?Math.floor(Math.min(...pitches))-3:45;
  const high=pitches.length?Math.ceil(Math.max(...pitches))+3:69;
  const span=Math.max(16,high-low),centre=(low+high)/2;
  return {low:centre-span/2,high:centre+span/2};
}
export const noteAudioSpan=(n:MelodyNote)=>({start:n.start+NOTE_AUDIO_OFFSET,end:n.start+n.duration+NOTE_AUDIO_OFFSET});
