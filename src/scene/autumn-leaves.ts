import type {CameraView} from './scene.ts';
export type AutumnPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));
/** Quiet gestures and cameras on the supplied television performance's clock. */
export function autumnPose(time:number){
 const t=Math.max(0,Math.min(160,Number.isFinite(time)?time:0));
 return {t,lean:Math.sin(t*.22)*.022,turn:Math.sin(t*.145)*.10,nod:Math.sin(t*.29)*.035,
  open:pulse(25,36,t)*.5+pulse(48,61,t)*.65+pulse(80,93,t)*.45+pulse(112,126,t)*.6,
  settle:ease(149,157,t),fade:ease(0,.4,t)*(1-ease(157.2,158.9,t))};
}
export function autumnCamera(view:CameraView,aspect:number,time:number){
 const close=view==='cole',chair=view==='autumn-chair',garden=view==='autumn-garden';
 const target:AutumnPoint=close?[15,159,35]:chair?[-59,97,38]:garden?[0,139,-100]:[0,112,0];
 const hh=close?37:chair?80:garden?146:111,hw=close?40:chair?85:garden?260:140,fov=36;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*.08,target[1]+d*.025,target[2]+d] as AutumnPoint,fov};
}
