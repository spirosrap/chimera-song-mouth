import type {CameraView} from './scene.ts';
export type RooftopPoint=[number,number,number];
export type RooftopPerson='roy'|'deckard';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const mix=(a:RooftopPoint,b:RooftopPoint,t:number)=>a.map((v,i)=>v+(b[i]-v)*t) as RooftopPoint;
export const rooftopWorld=(p:RooftopPoint,o:RooftopPoint,yaw:number):RooftopPoint=>[o[0]+p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),o[1]+p[1],o[2]-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw)];
/** All action is driven by the supplied clip's clock, including the rescue and final release. */
export function rooftopPose(time:number){
 const t=Math.max(0,Math.min(225.77,Number.isFinite(time)?time:0));
 const jump=ease(24,26,t),rescue=ease(68,77,t),sit=ease(92,101,t),death=ease(163,169,t),flight=ease(176.7,177.5,t);
 const roy=mix([-195,100,0],[-24,100,38],jump);roy[1]+=Math.sin(jump*Math.PI)*55;
 const crouch=ease(65,68,t)*(1-ease(75,79,t));roy[1]-=crouch*30;
 const seated:RooftopPoint=[-40,52,-4];const r=mix(roy,seated,sit);
 const deckard=mix([32,-57,105],[47,52,49],rescue);
 const royYaw=.28,deckardYaw=-1.1*rescue;
 const grip:RooftopPoint=[30,6+88*rescue,98-46*rescue];
 const hand:RooftopPoint=[-7,-32,19];
 const held=rooftopWorld(hand,r,royYaw),fly=Math.max(0,t-176.7);
 const dove:RooftopPoint=flight===0?held:[held[0]-fly*9,held[1]+fly*25,held[2]-fly*8];
 return {t,jump,rescue,sit,death,flight,roy:r,deckard,royYaw,deckardYaw,grip,hand,dove,crouch,
  wing:flight*Math.sin(fly*10.5)*.95,breath:(1-death)*Math.sin(t*1.65)*.35,
  royTilt:-.06-death*.72,deckardTilt:-.08+.22*ease(178,181,t),doveVisible:t<185};
}
export function rooftopCamera(view:CameraView,aspect:number,time:number){
 const p=rooftopPose(time),wide=view==='wide',ledge=view==='roof-ledge',bird=view==='roof-dove',sky=view==='roof-sky';
 const person=view==='deckard'?p.deckard:p.roy;
 const target:RooftopPoint=wide?[-24,38,20]:ledge?[22,14,95]:bird?p.dove:sky?p.dove:[person[0],person[1]+7,person[2]];
 const fov=37,vertical=wide?151:ledge?107:bird?25:sky?70:34,horizontal=wide?250:ledge?95:bird?36:sky?110:43;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const dir:RooftopPoint=wide?[.9,.35,1]:ledge?[.4,.1,1]:bird?[.2,.2,1]:sky?[.2,-.2,1]:view==='deckard'?[-.8,.14,1]:[.3,.02,1];
 const len=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*distance/len) as RooftopPoint,fov};
}
