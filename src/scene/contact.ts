import type {CameraView} from './scene.ts';
export type ContactPerson='ellie'|'father';
export type BeachPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** All gestures use the source clip's clock, including the arrival, embrace and seated conversation. */
export function contactPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),arrive=ease(80,109,t),hug=ease(112,122,t)*(1-ease(148,160,t)),sit=ease(165,176,t);
 const ellie:BeachPoint=[-42+29*hug,91-38*sit,9-12*hug];
 const father:BeachPoint=[185-148*arrive-23*hug,100-45*sit,-370+365*arrive];
 return {ellie,father,arrive,hug,sit,visible:t>=79,ellieYaw:1.05*ease(91,110,t),fatherYaw:-1.08,
  gazeUp:ease(2,10,t)*(1-ease(53,64,t)),point:ease(28,31,t)*(1-ease(40,44,t)),
  touch:ease(120,123,t)*(1-ease(140,148,t)),sand:ease(173,177,t)*(1-ease(213,220,t)),
  joined:ease(224,228,t),step:Math.sin(t*5.2)*(1-arrive)*Number(t>=79),t};
}
export function contactCamera(view:CameraView,aspect:number,time:number){
 const p=contactPose(time),sky=view==='contact-sky',hands=view==='contact-hands',close=view==='ellie'||view==='father';
 const target:BeachPoint=sky?[-145,270,-600]:hands?[16,31,23]:view==='ellie'?[p.ellie[0],p.ellie[1]+2,p.ellie[2]]:view==='father'?[p.father[0],p.father[1]+2,p.father[2]]:[-5,56-p.sit*20,-30];
 const fov=38,vertical=sky?130:hands?24:close?33:110,horizontal=sky?185:hands?38:close?39:205;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const d:BeachPoint=sky?[0,-.1,1]:hands?[.1,.85,1]:view==='ellie'?[.82,.04,1]:view==='father'?[-.8,.03,1]:[.13,.12,1];
 const len=Math.hypot(...d);return {target,position:target.map((x,i)=>x+d[i]*distance/len) as BeachPoint,fov};
}
