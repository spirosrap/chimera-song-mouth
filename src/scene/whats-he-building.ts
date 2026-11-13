import type {CameraView} from './scene.ts';
export type WorkshopPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+.7,t)*(1-ease(b-.7,b,t));
/** Imagined workshop staging: the supplied video itself is an album-cover still. */
export function workshopPose(time:number){
 const t=Math.max(0,Math.min(201,Number.isFinite(time)?time:0));
 return {t,peer:pulse(10,32,t)+pulse(67,86,t)+pulse(125,145,t)+pulse(175,194,t),point:pulse(38,52,t)+pulse(92,108,t)+pulse(152,166,t),listen:pulse(55,66,t)+pulse(110,124,t)+pulse(168,177,t),
  flicker:.62+.19*Math.sin(t*8.1)+.11*Math.sin(t*29.3)+.08*Math.sin(t*71.7),shadow:Math.sin(t*.33)*.5+.5,
  lamp:pulse(30,64,t)+pulse(93,123,t)+pulse(147,185,t),turn:Math.sin(t*.19)*.05,fade:ease(0,.8,t)*(1-ease(198,200.4,t))};
}
export function workshopCamera(view:CameraView,aspect:number,time:number){
 const close=view==='watcher',bench=view==='workshop-bench',window=view==='workshop-window',wall=view==='workshop-shadows';
 const target:WorkshopPoint=close?[-110,148,70]:bench?[65,88,-45]:window?[-130,145,-130]:wall?[55,130,-174]:[0,114,-20];
 const hh=close?39:bench?93:window?78:wall?116:140,hw=close?43:bench?125:window?94:wall?177:285,fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*(close?-.45:.16),target[1]+d*(close?.02:.13),target[2]+d] as WorkshopPoint,fov};
}
