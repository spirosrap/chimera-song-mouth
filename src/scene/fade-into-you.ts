import type {CameraView} from './scene.ts';
export type FadePoint=[number,number,number];
export type FadePlace='stage'|'desert'|'train'|'car'|'stairs'|'poles';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** The supplied blue-stage and desert edit, on absolute song time. */
export function fadePose(time:number){
 const t=Math.max(0,Math.min(261.5,Number.isFinite(time)?time:0));
 const place:FadePlace=t<36?'stage':t<51?'stairs':t<66?'train':t<81?'desert':t<99?'stage':t<129?'desert':t<144?'poles':t<159?'car':t<174?'desert':t<189?'stage':t<204?'desert':t<219?'car':t<237?'stage':t<249?'desert':'poles';
 return {t,place,sway:Math.sin(t*.31)*.013,nod:.025+Math.sin(t*.28)*.016,turn:Math.sin(t*.17)*.045,hand:.5+.5*Math.sin(t*.24),shades:t>=99&&t<129,wind:Math.sin(t*.43)*.7,flight:ease(131,137,t)*(1-ease(141,146,t))+ease(252,257,t),fade:ease(0,.6,t)*(1-ease(259.8,261.15,t))};
}
export function fadePlace(view:CameraView,time:number):FadePlace{return view==='hope'||view==='fade-stage'?'stage':view==='fade-desert'?'desert':view==='fade-train'?'train':view==='fade-car'?'car':view==='fade-stairs'?'stairs':view==='fade-poles'?'poles':fadePose(time).place;}
export function fadeCamera(view:CameraView,aspect:number,time:number){
 const place=fadePlace(view,time),close=view==='hope',target:FadePoint=close?[0,160,35]:place==='stage'?[0,105,-40]:place==='desert'?[60,100,-30]:place==='train'?[0,85,-110]:place==='stairs'?[0,135,-85]:place==='poles'?[0,210,-190]:[0,80,-40];
 const hh=close?39:place==='poles'?200:135,hw=close?48:place==='stage'?300:place==='car'?270:place==='train'?420:place==='poles'?410:330,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return{target,position:[target[0]+d*(close?.08:place==='train'?.22:.12),target[1]+d*(close?.02:place==='stairs'?.12:.06),target[2]+d]as FadePoint,fov};
}
