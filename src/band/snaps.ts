export interface FingerSnap {time:number;accent:number}
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Event times are on the backing's absolute clock: no extra vocal breath lead-in. */
export function snapPose(events:readonly FingerSnap[],time:number){
 let lo=0,hi=events.length;
 while(lo<hi){const mid=(lo+hi)>>>1;if(events[mid].time<=time)lo=mid+1;else hi=mid;}
 const last=events[lo-1],next=events[lo],age=last?time-last.time:Infinity;
 const prepare=next?clamp(1-(next.time-time)/.17):0;
 const strike=age<.09?Math.sin(Math.PI*clamp(age/.09)):0;
 const release=age<.24?1-clamp((age-.07)/.17):0;
 const grip=Math.max(prepare,release*(1-strike));
 return {grip,strike,flash:age<.15?Math.exp(-age/.032)*(last?.accent??0):0,count:lo};
}

/** A finger striking the palm: a short noisy crack with damped body resonances, not a vocal beat. */
export function synthesizeSnaps(events:readonly FingerSnap[],duration:number,rate=48000):Float32Array{
 const out=new Float32Array(Math.round(duration*rate));
 events.forEach((event,index)=>{
  let seed=(index+1)*7919,previous=0;
  const start=Math.round(event.time*rate),length=Math.round(.08*rate),accent=Math.max(0,Math.min(1.4,event.accent));
  for(let i=0;i<length&&start+i<out.length;i++){
   if(start+i<0)continue;
   seed=(seed*16807)%2147483647;const random=seed/1073741823.5-1;
   const t=i/rate,high=random-previous*.7;previous=random;
   const attack=Math.min(1,t/.00018),crack=high*Math.exp(-t/.0065),body=Math.sin(2*Math.PI*970*t)*Math.exp(-t/.013),ring=Math.sin(2*Math.PI*2860*t)*Math.exp(-t/.0035);
   out[start+i]+=Math.tanh((crack*.8+body*.27+ring*.14)*accent)*attack*.66;
  }
 });
 return out;
}
