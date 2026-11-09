import type { VocalEffects } from "./types.ts";

/** Effects on rendered mouth audio only: no oscillators, instrument samples or new sources. */
export function processVocalEffects(samples:Float32Array,rate:number,fx:VocalEffects):void {
  const beat=60/Math.max(30,fx.bpm),period=Math.max(1,Math.round(beat*rate));
  const pump=new Float32Array(period);
  for(let i=0;i<period;i++)pump[i]=1-Math.min(.95,Math.max(0,fx.pump??0))*Math.exp(-9*i/period);
  const delayLength=Math.max(1,Math.round((fx.delayBeats??.75)*beat*rate));
  const delay=new Float32Array(delayLength);
  const mix=Math.max(0,Math.min(.6,fx.delayMix??0)),feedback=Math.max(0,Math.min(.7,fx.feedback??.25));
  const keys=[...(fx.automation??[])].sort((a,b)=>a.time-b.time);
  const hp=fx.highpassHz?1-Math.exp(-2*Math.PI*fx.highpassHz/rate):0;
  const drive=Math.max(.1,Math.min(5,fx.drive??1));
  const start=Math.round(.35*rate),fade=Math.max(0,fx.fadeOut??1.5)*rate;
  let low=0,high=0,write=0,key=0,a=1,level=1;
  for(let i=0;i<samples.length;i++){
    if(i%64===0){
      const time=Math.max(0,i/rate-.35);
      while(key+1<keys.length&&keys[key+1].time<=time)key++;
      const from=keys[key],to=keys[key+1];
      const f=from&&to?Math.max(0,Math.min(1,(time-from.time)/(to.time-from.time))):0;
      const cutoff=from?(to?from.cutoffHz+(to.cutoffHz-from.cutoffHz)*f:from.cutoffHz):(fx.lowpassHz??16000);
      level=from?(to?from.level+(to.level-from.level)*f:from.level):1;
      a=1-Math.exp(-2*Math.PI*Math.max(40,Math.min(rate*.45,cutoff))/rate);
    }
    high+=hp*(samples[i]-high);
    const input=hp?samples[i]-high:samples[i];
    low+=a*(input-low);
    const filtered=Math.tanh(low*drive)/drive;
    const echo=delay[write];delay[write]=filtered+echo*feedback;write=(write+1)%delayLength;
    const phase=((i-start)%period+period)%period;
    const tail=fade?Math.min(1,(samples.length-1-i)/fade):1;
    const value=Math.tanh((filtered+echo*mix)*level*pump[phase]*Math.max(0,tail));
    if(!Number.isFinite(value))throw new Error("The vocal effects produced an invalid sample.");
    samples[i]=value;
  }
}
