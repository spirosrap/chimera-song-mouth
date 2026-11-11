import type {CameraView} from './scene.ts';
export type ArrivalPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** The short source clip ends on Louise's reaction, before an embrace. */
export function arrivalPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),turn=ease(18.5,21.5,t);
 return {t,turn,gazeUp:(1-turn)*(.8+.04*Math.sin(t*.5)),ianYaw:.85+.35*turn,louiseYaw:-.85,
  reaction:ease(24.2,26.7,t),breath:Math.sin(t*1.1)*.3,
  ian:[-34,99,0] as ArrivalPoint,louise:[38,91,8] as ArrivalPoint};
}
export function arrivalCamera(view:CameraView,aspect:number,time:number){
 const p=arrivalPose(time),wide=view==='wide',listener=view==='louise';
 const target:ArrivalPoint=wide?[0,56,-12]:listener?[p.louise[0],p.louise[1]+3,p.louise[2]]:[p.ian[0]+11,p.ian[1]+3,p.ian[2]];
 const fov=36,vertical=wide?112:39,horizontal=wide?135:listener?45:61;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360),d:ArrivalPoint=wide?[.1,.1,1]:listener?[-.45,.035,1]:[.22,.035,1],length=Math.hypot(...d);
 return {target,position:target.map((x,i)=>x+d[i]*distance/length) as ArrivalPoint,fov};
}
