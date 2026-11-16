import type {CameraView}from'./scene.ts';
export type BadPoint=[number,number,number];
export const BAD_SHOTS:[number,CameraView][]=[
 [0,'bad-paper'],[12,'bad-tear'],[21,'bad-yellow'],[29,'bad-white-close'],[34,'bad-yellow-close'],[40,'bad-knees'],[45,'bad-yellow'],[50,'bad-stairs'],[55,'bad-bellies'],[61,'bad-street'],[67,'bad-riders'],[71,'bad-spiral'],[76,'bad-car-side'],[81,'bad-pigeons'],[87,'bad-cereal'],[91,'bad-desert'],[98,'bad-black-close'],[102,'bad-goggles'],[107,'bad-bags'],[112,'bad-white-chair'],[118,'bad-goggles-close'],[123,'bad-spiral-close'],[127,'bad-pigeons'],[133,'bad-riders'],[139,'bad-blue-close'],[144,'bad-stairs'],[149,'bad-desert'],[154,'bad-black-close'],[158,'bad-spiral'],[163,'bad-blackout'],[169,'bad-red-room'],[174,'bad-red-close'],[182,'bad-pushups'],[190,'bad-red-room'],[198,'bad-red-close'],[204,'bad-ending'],
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function badView(t:number):CameraView{return BAD_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'bad-paper'as CameraView);}
export function badResolve(v:CameraView,t:number):CameraView{return v==='wide'?badView(t):v==='billie-bad'?'bad-white-close':v;}
export function badPose(time:number){const t=Math.max(0,Math.min(206.5,Number.isFinite(time)?time:0)),beat=(t-30.159456)*135.86896/60,q=beat*Math.PI*2;return{t,q,beat,step:Math.sin(q),sway:Math.sin(q*.5),tear:ease(10,19,t),push:.5+.5*Math.sin((t-169)*Math.PI*1.1),fade:1-ease(203.8,206,t)};}
export function badState(view:CameraView,time:number){const p=badPose(time),v=badResolve(view,p.t),place=v.startsWith('bad-red')||v==='bad-pushups'||v==='bad-ending'?'red':v.includes('spiral')?'spiral':v.includes('goggle')||v==='bad-bags'?'goggles':v.includes('desert')||v==='bad-black-close'?'desert':v.includes('white')||v==='bad-knees'?'teal':v==='bad-stairs'||v==='bad-bellies'||v.includes('street')||v.includes('car')||v==='bad-riders'||v.includes('pigeon')||v.includes('cereal')||v==='bad-blue-close'?'street':'yellow',look=place==='red'||place==='desert'?'black':place==='spiral'?'floral':place==='teal'?'white':place==='goggles'||place==='yellow'?'yellow':v==='bad-pigeons'||v==='bad-cereal'||v==='bad-blue-close'?'blue':v==='bad-stairs'||v==='bad-bellies'?'black':'red';return{...p,v,place,look,overhead:v==='bad-spiral',chair:v==='bad-white-chair',car:look==='red',pigeons:look==='blue',blackout:v==='bad-blackout',paper:v==='bad-paper'&&p.t<12};}
export function badCamera(view:CameraView,aspect:number,time:number){const p=badState(view,time),v=p.v;let target:BadPoint=[0,115,0],hh=172,hw=260,dir:BadPoint=[.12,.06,1],up:BadPoint=[0,1,0];
 if(v==='bad-paper'||v==='bad-tear'){target=[0,123,-5];hh=177;hw=260;dir=[0,0,1];}
 if(v.endsWith('close')){target=[0,p.place==='red'?151:169,25];hh=65;hw=v==='bad-goggles-close'?110:98;dir=[.02,.02,1];}
 if(v==='bad-knees'){target=[0,51,16];hh=58;hw=107;dir=[.02,0,1];}
 if(v==='bad-stairs'||v==='bad-bellies'){target=[0,122,-58];hh=190;hw=335;dir=[.21,.08,1];}
 if(v==='bad-riders'||v==='bad-street'){target=[0,103,12];hh=177;hw=365;dir=[.05,.04,1];}
 if(v==='bad-car-side'){target=[0,95,16];hh=151;hw=290;dir=[.75,.15,1];}
 if(p.pigeons&&!v.endsWith('close')){target=[0,115,38];hh=v==='bad-cereal'?122:172;hw=v==='bad-cereal'?195:290;dir=[-.24,.18,1];}
 if(v==='bad-bags'){target=[0,175,-7];hh=129;hw=220;dir=[-.18,.1,1];}
 if(p.chair){target=[0,104,23];hh=142;hw=184;dir=[.06,.18,1];}
 if(p.overhead){target=[0,74,16];hh=187;hw=238;dir=[.01,1,.01];up=[0,0,-1];}
 if(p.place==='red'&&!v.endsWith('close')){target=[0,113,10];hh=169;hw=295;dir=[.22,.1,1];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...p,target,position:target.map((x,i)=>x+d*dir[i]/n)as BadPoint,up,fov};
}
