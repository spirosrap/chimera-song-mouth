import type { MelodyNote } from "./melody.ts";

/** YIN's cumulative mean normalized difference; one unaccompanied voice, 65–1000 Hz. */
export function pitchOf(samples: Float32Array, offset:number, rate=8000):number|null {
  const size=512, max=Math.ceil(rate/65), min=Math.floor(rate/1000);
  if(offset+size+max>=samples.length)return null;
  let energy=0, mean=0;
  for(let i=0;i<size;i++)mean+=samples[offset+i]; mean/=size;
  for(let i=0;i<size;i++)energy+=(samples[offset+i]-mean)**2;
  if(Math.sqrt(energy/size)<.008)return null;
  const difference=new Float32Array(max+1);
  let total=0;
  for(let lag=1;lag<=max;lag++){
    let d=0;
    for(let i=0;i<size;i++){const delta=samples[offset+i]-samples[offset+i+lag];d+=delta*delta;}
    total+=d; difference[lag]=total?d*lag/total:1;
  }
  for(let lag=min;lag<max-1;lag++){
    if(difference[lag]>.16)continue;
    while(lag<max-1 && difference[lag+1]<difference[lag])lag++;
    const l=difference[lag-1],c=difference[lag],r=difference[lag+1];
    const divisor=2*(2*c-r-l);
    const refined=lag+(divisor?(r-l)/divisor:0);
    const hz=rate/refined;
    return hz>=65&&hz<=1000?69+12*Math.log2(hz/440):null;
  }
  return null;
}

export function extractMelody(samples:Float32Array, progress?:(v:number)=>void):MelodyNote[]{
  const hop=160, step=hop/8000;
  const pitches:(number|null)[]=[];
  for(let offset=0;offset+650<samples.length;offset+=hop){
    pitches.push(pitchOf(samples,offset));
    if(pitches.length%100===0)progress?.(offset/samples.length);
  }
  // A short median suppresses octave flicker while retaining actual unvoiced gaps.
  const smooth=pitches.map((p,i)=>{
    if(p===null)return null;
    const near=pitches.slice(Math.max(0,i-2),i+3).filter((x):x is number=>x!==null).sort((a,b)=>a-b);
    return Math.round(near[Math.floor(near.length/2)]);
  });
  const notes:MelodyNote[]=[];
  let i=0;
  while(i<smooth.length){
    const pitch=smooth[i]; let j=i+1;
    while(j<smooth.length&&smooth[j]===pitch)j++;
    if(pitch!==null&&(j-i)*step>=.06){
      const start=i*step, duration=(j-i)*step;
      const last=notes.at(-1);
      if(last&&last.midi===pitch&&start-last.start-last.duration<=.06)last.duration=start+duration-last.start;
      else notes.push({midi:pitch,start,duration});
    }
    i=j;
  }
  progress?.(1);
  return notes;
}
