import type {Gesture} from "../wasm/types.ts";
import type {BandPart} from "./types.ts";

/** A separate whistle tone model, paired with airway-driven pursed-lip animation.
 * The voice solver has no lip-jet feedback oscillator; this does not label a sung vowel as a whistle.
 */
export function whistleNotes(part:BandPart){
  const recorded=part.delivery!=="whistle"&&part.whistleMelody;
  const notes=((recorded||part.melody)?.notes??[]).filter(n=>Number.isFinite(n.start)&&n.start>=0&&Number.isFinite(n.duration)&&n.duration>0&&Number.isFinite(n.midi))
    .map(n=>({start:n.start+.35,end:n.start+.35+n.duration,hz:440*2**((Math.max(24,Math.min(recorded?127:103,n.midi))+(recorded?0:24)-69)/12)})).sort((a,b)=>a.start-b.start);
  const joined:typeof notes=[];
  for(const n of notes){
    const previous=joined.at(-1);
    if(previous&&n.start-previous.end<=.04&&n.hz===previous.hz)previous.end=Math.max(previous.end,n.end);
    else joined.push({...n});
  }
  return joined.map((n,i)=>({...n,end:joined[i+1]&&joined[i+1].start-n.end<=.04?joined[i+1].start:n.end}));
}
/** Cover full whistle phrases, including breath gaps and the airway's short release. */
export function whistleSpans(part:BandPart){
  const spans:{start:number;end:number}[]=[];
  for(const n of whistleNotes(part)){
    const previous=spans.at(-1);
    if(previous&&n.start-previous.end<.25)previous.end=Math.max(previous.end,n.end+.1);
    else spans.push({start:Math.max(0,n.start-.06),end:n.end+.1});
  }
  return spans;
}
export function planWhistle(part:BandPart):Gesture[]{
  return whistleNotes(part).flatMap(n=>[
    {t0:n.start,t1:n.end,rampIn:.045,rampOut:.055,strength:20,targets:{lipAp:.12,lipProt:1.35,lipWidth:.08,jaw:.12,tbX:3.1,tbY:7.0,velum:0},label:"pursed lips"},
    {t0:n.start,t1:n.end,rampIn:.025,rampOut:.05,strength:1,targets:{breath:.8,f0:n.hz},label:"whistle breath"},
  ]);
}
const smooth=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function synthesizeWhistle(part:BandPart,duration:number,rate:number):Float32Array{
  const out=new Float32Array(Math.ceil(duration*rate)),notes=whistleNotes(part);
  let phase=0,seed=0x73a1b65f,wind=0,phraseStart=0,phraseEnd=0,fromHz=0;
  notes.forEach((n,k)=>{
    const previous=notes[k-1],connected=previous&&n.start-previous.end<.001;
    if(!connected){phase=0;phraseStart=n.start;let last=k;while(notes[last+1]&&notes[last+1].start-notes[last].end<.001)last++;phraseEnd=notes[last].end;}
    fromHz=connected?previous.hz:n.hz;
    const a=Math.max(0,Math.round(n.start*rate)),b=Math.min(out.length,Math.round(n.end*rate));
    for(let i=a;i<b;i++){
      const t=i/rate,glide=smooth((t-n.start)/.022),base=fromHz+(n.hz-fromHz)*glide;
      const hz=base*2**((5*Math.sin(2*Math.PI*5.15*t)+1.8*Math.sin(2*Math.PI*.71*t))/1200);
      phase=(phase+2*Math.PI*hz/rate)%(2*Math.PI);
      seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const noise=(seed>>>0)/2147483648-1;
      wind+=.18*(noise-wind);
      const envelope=smooth((t-phraseStart)/.035)*smooth((phraseEnd-t)/.055);
      const breath=.96+.035*Math.sin(2*Math.PI*1.3*t);
      out[i]=envelope*breath*(.18*Math.sin(phase)+.003*Math.sin(2*phase)+.005*wind);
    }
  });
  return out;
}
