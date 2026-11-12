import type {CameraView} from './scene.ts';
export type OperaPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** The conductor, bows and applause use the clip clock, including backwards seeks. */
export function operaPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),playing=1-ease(218,223,t),applause=ease(222,227,t);
 const swell=ease(135,160,t)*(1-ease(215,222,t));
 return {playing,applause,swell,sway:Math.sin(t*.36)*.012*playing,
  beat:Math.sin(t*Math.PI*1.15),lift:.5+.5*Math.cos(t*Math.PI*1.15),
  bow:ease(222,225,t)*(1-ease(228,231,t))+ease(263,265,t)*(1-ease(268,270,t)),
  arm:ease(146,161,t)*(1-ease(218,224,t)),clap:.5+.5*Math.sin(t*10.5)};
}
export function operaCamera(view:CameraView,aspect:number,time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),close=view==='opera-tenor';
 const choir=view==='opera-choir',conductor=view==='opera-conductor',orchestra=view==='opera-orchestra';
 const target:OperaPoint=close?[-24,103,76]:choir?[0,121,-202]:conductor?[84,90,85]:orchestra?[0,65,-65]:[0,103,-15];
 const halfHeight=close?35:choir?62:conductor?75:orchestra?104:178;
 const halfWidth=close?43:choir?240:conductor?90:orchestra?270:350,fov=36;
 const distance=Math.max(halfHeight,halfWidth/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const drift=Math.sin(t*.027)*.018;
 const direction:OperaPoint=close?[.17+drift,.025,1]:choir?[.06,.12,1]:conductor?[.65,.1,1]:orchestra?[.17,.28,1]:[.12+drift,.19,1];
 const length=Math.hypot(...direction);
 return {target,position:target.map((x,i)=>x+direction[i]*distance/length) as OperaPoint,fov};
}
