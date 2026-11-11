import type {CameraView} from './scene.ts';
export type WardSpeaker='mcmurphy'|'cheswick'|'billy'|'martini';
export type WardPerson=WardSpeaker|'scanlon'|'harding'|'taber'|'ratched'|'pilbow';
export type WardPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+.35,t)*(1-ease(b-.35,b,t));
export const WARD_PEOPLE:Record<WardPerson,{position:WardPoint;yaw:number}>={
 mcmurphy:{position:[-87,85,55],yaw:Math.PI-.35},cheswick:{position:[-30,85,55],yaw:Math.PI+.1},
 scanlon:{position:[-53,85,-70],yaw:.05},billy:{position:[2,85,-70],yaw:-.06},martini:{position:[57,82,-70],yaw:-.2},
 harding:{position:[125,85,8],yaw:-Math.PI/2},taber:{position:[125,85,63],yaw:-Math.PI/2},
 ratched:{position:[-155,85,-18],yaw:Math.PI/2},pilbow:{position:[-155,83,-72],yaw:Math.PI/2},
};
/** Reactions and hand gestures are tied to the clip, never to elapsed animation frames. */
export function wardPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0);
 return {t,point:pulse(16.1,19.3,t)+pulse(27.7,34.2,t),appeal:pulse(38,44.9,t)+pulse(50.4,56.3,t),
  turn:-.45*(1-ease(10.8,12,t))-.12*pulse(37.5,42,t)+.25*pulse(45.4,48,t),hunch:pulse(35.6,37.7,t),
  billyDown:ease(19.8,21.3,t)*(1-ease(24.4,26,t)),billyStutter:pulse(20.4,22.6,t)*Math.sin((t-20.4)*11)*.035,
  laugh:pulse(34.7,37.7,t),assent:pulse(48.2,49.7,t)*Math.sin((t-48.2)*9)*.10,
  cheswickNod:pulse(8.25,9.1,t)*Math.sin((t-8.25)*8)*.1,hideFace:ease(53.8,57,t),nurseLook:ease(59.5,60.5,t)};
}
export function wardCamera(view:CameraView,aspect:number,time:number){
 const p=wardPose(time),pair=view==='ward-pair',group=view==='ward-group',laugh=view==='ward-laughter',nurses=view==='ward-nurses',wide=view==='wide';
 const id:WardPerson=view==='cheswick'?'cheswick':view==='billy'?'billy':view==='martini'?'martini':'mcmurphy';
 const person=WARD_PEOPLE[id],target:WardPoint=wide?[-12,62,0]:pair?[-59,89,55]:group?[2,89,-70]:laugh?[125,89,35]:nurses?[-155,88,-45]:[person.position[0],person.position[1]+4,person.position[2]];
 const fov=36,vertical=wide?94:36,horizontal=wide?210:group?89:pair||laugh||nurses?65:42;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const dir:WardPoint=wide?[.48,.25,1]:pair?[-.12,.02,-1]:group?[.08,.02,1]:laugh?[-1,.02,-.04]:nurses?[1,.02,.04]:id==='mcmurphy'?[-.35+.12*p.turn,.03,-1]:id==='cheswick'?[.16,.03,-1]:[.14,.02,1],norm=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*distance/norm) as WardPoint,fov};
}
