import {CLASSROOM_BEATS} from './classroom-beats.ts';
import type {CameraView} from './scene.ts';
export type ClassroomSpeaker='adriano'|'classroom-chorus';
export type ClassroomPoint=[number,number,number];
export const CLASSROOM_OFFSET=.35;
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>smooth(a,a+.3,t)*(1-smooth(b-.3,b,t));
const path:readonly (readonly [number,number,number])[]=[[0,-35,12],[19,0,0],[70,-30,5],[78,-145,130],[85,-110,100],[91,0,0],[109,0,5],[114,-30,25],[125,0,5],[154,-10,0],[160,-130,130],[169,-130,65],[177,-40,20],[190,0,0],[200,-30,30],[210,60,15],[224,0,0]];
export function classroomBeat(time:number){const t=Number.isFinite(time)?time:0;let i=0;while(i<CLASSROOM_BEATS.length-2&&CLASSROOM_BEATS[i+1]<t)i++;return i+(t-CLASSROOM_BEATS[i])/(CLASSROOM_BEATS[i+1]-CLASSROOM_BEATS[i]);}
export function classroomPose(time:number){
 const t=Math.max(0,Math.min(224.606625,(Number.isFinite(time)?time:0)-CLASSROOM_OFFSET));let i=0;while(i<path.length-2&&path[i+1][0]<t)i++;const a=path[i],b=path[i+1],u=smooth(a[0],b[0],t),beat=classroomBeat(t),phase=beat*Math.PI*2,finale=smooth(198.5,201.5,t),dance=pulse(21,75,t)+pulse(108,152,t)+pulse(173,181,t)+finale;
 return {t,beat,phase,finale,dance,teacher:[a[1]+(b[1]-a[1])*u+Math.sin(phase)*5*dance,108-3*(.5+.5*Math.cos(phase))*dance,a[2]+(b[2]-a[2])*u] as ClassroomPoint,
 conduct:pulse(0,9,t),point:pulse(49,61,t)+pulse(126,137,t)+pulse(160,171,t),lean:pulse(76,85,t)+pulse(156,164,t),harmonica:smooth(182,185,t),clap:.5+.5*Math.sin(phase),kick:Math.sin(phase),sway:Math.sin(phase*.5),breath:Math.sin(t*1.5)*.1};
}
export function classroomCamera(view:CameraView,aspect:number,time:number){
 const p=classroomPose(time);let target:ClassroomPoint,dir:ClassroomPoint,vertical:number,horizontal:number;
 if(view==='adriano'){target=[p.teacher[0],p.teacher[1]+8,p.teacher[2]];dir=[.25,.025,1];vertical=34;horizontal=48;}
 else if(view==='classroom-harmonica'){target=[-150,96+36*p.finale,135-65*p.finale];dir=[.15,.06,-1];vertical=39;horizontal=52;}
 else if(view==='classroom-chorus'){target=[0,89+36*p.finale,135-65*p.finale];dir=[0,.12,-1];vertical=78;horizontal=225;}
 else if(view==='classroom-back'){target=[0,93,130];dir=[-.2,.22,-1];vertical=160;horizontal=360;}
 else if(view==='classroom-front'){target=[p.teacher[0]*.35,93,35];dir=[.15,.14,1];vertical=135;horizontal=230;}
 else if(view==='classroom-side'){target=[-50,100,135];dir=[1,.12,-.18];vertical=160;horizontal=350;}
 else if(view==='classroom-audience'){target=[0,161,-280];dir=[0,.1,1];vertical=80;horizontal=350;}
 else{target=[0,108,85];dir=[.65,.38,1];vertical=220;horizontal=430;}
 const d=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360),n=Math.hypot(...dir);return {target,position:target.map((x,i)=>x+dir[i]*d/n) as ClassroomPoint,fov:36};
}
