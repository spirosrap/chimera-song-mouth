import type {CameraView} from './scene.ts';
export type RiverPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,c:number,d:number,t:number)=>ease(a,b,t)*(1-ease(c,d,t));
/** The river set, choreography and ending are driven by source time, including seeks. */
export function riverPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0);
 return {time:t,raise:pulse(26,33,38,43,t)+pulse(177,183,188,194,t),reach:pulse(62,67,75,81,t)+pulse(98,103,108,113,t)+pulse(127,133,143,150,t),
  chest:pulse(44,48,58,62,t)+pulse(157,161,169,173,t),lean:pulse(61,65,70,75,t)*.14+pulse(139,143,149,153,t)*.18+pulse(190,194,197,201,t)*.35,
  kneel:ease(197,204,t),micLower:ease(215,220,t),sway:.018*Math.sin(t*.54),dancers:ease(63,76,t),danceWave:ease(87,96,t),
  waterfall:ease(82,94,t)*(1-ease(193,203,t)),curtain:ease(218,224,t),applause:ease(217,222,t),boat:ease(194,205,t)};
}
export function riverCamera(view:CameraView,aspect:number,time:number){
 const p=riverPose(time),close=view==='diana',body=view==='river-singer',dance=view==='river-dancers',judges=view==='river-judges',audience=view==='river-audience';
 const target:RiverPoint=close?[0,112-44*p.kneel,54]:body?[0,70-24*p.kneel,54]:dance?[0,63,-48]:judges?[60,48,300]:audience?[245,35,130]:[0,106,-55];
 const hh=close?30:body?81:dance?95:judges?65:audience?60:190,hw=close?42:body?78:dance?200:judges?(aspect<1?60:125):audience?155:370,fov=36;
 const distance=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const dir:RiverPoint=close?[.13,.015,1]:body?[.3,.06,1]:judges?[.08,.3,-1]:audience?[-1,.3,.15]:[.15+Math.sin(p.time*.022)*.09,.23,1],n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*distance/n) as RiverPoint,fov};
}
