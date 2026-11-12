import type {CameraView} from './scene.ts';
export type LifetimePoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const window=(a:number,b:number,t:number)=>ease(a,a+.35,t)*(1-ease(b-.35,b,t));
/** Absolute source-time choreography, including the quiet opening and final floating figure. */
export function lifetimePose(time:number){
 const t=Math.max(0,Math.min(225.1,Number.isFinite(time)?time:0));
 const water=t<27||t>=86&&t<104||t>=213;
 const copies=t>=53&&t<69||t>=116&&t<132||t>=157&&t<188;
 const archive=t>=38&&t<53;
 const beat=(t-27.2)*117.5/60,step=Math.sin(beat*Math.PI),bounce=(1-Math.cos(beat*Math.PI*2))*.5;
 const crouch=window(60,67,t)*(.55+.45*bounce),bow=window(46,51,t)+window(116,124,t)*(.5+.5*bounce)+window(162,170,t)*(.5+.5*bounce)+window(202,207,t);
 const temple=window(124,132,t)+window(173,179,t),chop=window(29,38,t)+window(69,86,t)+window(132,146,t),hands=window(174,188,t),float=water&&(t<22||t>=213)?1:window(93,100,t);
 const backward=window(108,116,t),shirt=t>=207&&t<213;
 return {t,water,copies,archive,beat,step,bounce,crouch,bow:Math.min(1,bow),temple:Math.min(1,temple),chop,hands,float,backward,shirt,visible:t>2.4&&t<222.8,fade:ease(1,3,t)*(1-ease(220,224,t))};
}
export function lifetimeCamera(view:CameraView,aspect:number,time:number){
 const p=lifetimePose(time),close=view==='lifetime-singer',water=view==='lifetime-water'||view==='wide'&&p.water,copies=view==='lifetime-copies'||view==='wide'&&p.copies;
 const target:LifetimePoint=close?[0,148-p.crouch*48-p.bow*22,45]:[0,94,0];
 const hh=close?40:water?143:125,hw=close?43:copies?220:water?210:archiveWidth(p.archive),fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0],target[1]+d*.015,target[2]+d] as LifetimePoint,fov};
}
const archiveWidth=(archive:boolean)=>archive?190:135;
