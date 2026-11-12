import type {CameraView} from './scene.ts';
export type ConcertPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,c:number,d:number,t:number)=>ease(a,b,t)*(1-ease(c,d,t));
/** Reference gestures, microphone handoff and lighting use absolute clip time. */
export function concertPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0);
 return {time:t,handheld:ease(74,78,t),micLower:pulse(134,136,139,141,t),
  high:pulse(151,155,159,162,t),ear:pulse(76,79,88,91,t),raise:pulse(116,120,123,126,t)+pulse(132,136,139,143,t)+pulse(232,235,242,245,t),
  reach:pulse(51,56,66,70,t)+pulse(141,145,153,156,t)+pulse(199,203,217,221,t),
  chest:pulse(31,34,43,46,t)+pulse(175,178,185,188,t),
  lean:.04*Math.sin(t*.46)+.1*pulse(100,103,110,113,t),sway:.012*Math.sin(t*.42),
  warmth:ease(48,63,t)*(1-ease(71,76,t)),red:ease(77,85,t)*(1-ease(222,230,t)),
  white:ease(94,102,t),applause:pulse(106,108,113,115,t)+pulse(154,156,160,162,t),bow:0,
  playing:1-ease(244.5,245.5,t)};
}
export function concertCamera(view:CameraView,aspect:number,time:number){
 const p=concertPose(time),close=view==='dimash',body=view==='concert-singer',band=view==='concert-band',audience=view==='concert-audience';
 const target:ConcertPoint=close?[0,108,71]:body?[0,69,71]:band?[130,65,-116]:audience?[120,13,285]:[0,110,-42];
 const hh=close?30:body?79:band?92:audience?45:204,hw=close?42:body?73:band?237:audience?145:410,fov=36;
 const distance=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const direction:ConcertPoint=close?[.08+Math.sin(p.time*.04)*.025,.025,1]:body?[.19,.07,1]:band?[-.4,.18,1]:audience?[.2,.24,-1]:[.1+Math.sin(p.time*.025)*.06,.2,1];
 const len=Math.hypot(...direction);
 return {target,position:target.map((n,i)=>n+direction[i]*distance/len) as ConcertPoint,fov};
}
