import type {CameraView} from './scene.ts';
export type PhantomPoint=[number,number,number];
export type PhantomId='phantom-tarja'|'phantom-marco';
export const PHANTOM_ASPECT=1862/1080;
export const PHANTOM_PEOPLE=[
 {id:'phantom-tarja',position:[40,150,110],colour:'#c4973e',instrument:'mic'},
 {id:'phantom-marco',position:[-120,154,22],colour:'#191b24',instrument:'bass'},
 {id:'phantom-guitarist',position:[165,141,-55],colour:'#182536',instrument:'guitar'},
 {id:'phantom-keyboardist',position:[-210,146,-145],colour:'#141a2b',instrument:'keys'},
 {id:'phantom-drummer',position:[5,174,-245],colour:'#191d25',instrument:'drums'},
]as const;
export const PHANTOM_SHOTS:[number,CameraView][]=[
 [0,'phantom-tarja'],[11,'phantom-crowd'],[19,'phantom-profile'],[28,'phantom-tarja'],[38,'phantom-stage'],[45,'phantom-keyboards'],[51,'phantom-tarja'],[60,'phantom-crowd'],[69,'phantom-bass'],[77,'phantom-rear'],[85,'phantom-marco'],[92,'phantom-drums'],[99,'phantom-marco'],[112,'phantom-duet'],[121,'phantom-profile'],[133,'phantom-guitar'],[144,'phantom-keyboards'],[152,'phantom-duet'],[166,'phantom-stage'],[178,'phantom-rig'],[190,'phantom-stage'],[202,'phantom-tarja'],[213,'phantom-crowd'],[224,'phantom-rear'],[234,'phantom-tarja'],[249,'phantom-stage'],[261,'phantom-drums'],[268,'phantom-tarja'],[277,'phantom-crowd']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function phantomPose(time:number){
 const t=Math.max(0,Math.min(284.4,Number.isFinite(time)?time:0)),beat=t*170/60,phase=beat*Math.PI*2;
 return{t,beat,phase,sway:Math.sin(phase*.25),strum:Math.sin(phase),kick:Math.max(0,Math.cos(phase))**8,arms:ease(205,212,t)*(1-ease(272,280,t)),raise:ease(231,237,t)*(1-ease(261,271,t)),red:ease(187,194,t)*(1-ease(211,218,t)),fade:ease(0,.4,t)*(1-ease(281,284,t))};
}
export function phantomCamera(view:CameraView,aspect:number,time:number){
 const p=phantomPose(time),fov=35;let target:PhantomPoint=[-10,126,-105],hh=183,hw=410,dir:PhantomPoint=[.04,.13,1];
 if(view==='phantom-stage'||view==='wide'){target=[0,90,130];hh=360;hw=620;dir=[.04,.28,1];}
 else if(view==='phantom-tarja'){target=[40,164,115];hh=43;hw=46;dir=[-.05,.01,1];}
 else if(view==='phantom-marco'){target=[-120,162,28];hh=47;hw=53;dir=[.12,.03,1];}
 else if(view==='phantom-profile'){target=[41,162,113];hh=37;hw=45;dir=[.93,.02,.37];}
 else if(view==='phantom-duet'){target=[-30,144,60];hh=103;hw=205;dir=[.03,.04,1];}
 else if(view==='phantom-bass'){target=[-115,119,24];hh=99;hw=100;dir=[-.3,.06,1];}
 else if(view==='phantom-guitar'){target=[165,115,-50];hh=97;hw=108;dir=[-.25,.07,1];}
 else if(view==='phantom-keyboards'){target=[-207,119,-104];hh=91;hw=130;dir=[.7,.5,1];}
 else if(view==='phantom-drums'){target=[5,133,-232];hh=91;hw=122;dir=[1,.65,.38];}
 else if(view==='phantom-rear'){target=[-45,129,80];hh=115;hw=230;dir=[-.55,.15,-1];}
 else if(view==='phantom-crowd'){target=[0,-43,490];hh=130;hw=320;dir=[-.1,.55,-1];}
 else if(view==='phantom-rig'){target=[0,190,-135];hh=290;hw=500;dir=[.14,.35,1];}
 const a=Math.max(.42,Math.min(PHANTOM_ASPECT,aspect)),d=Math.max(hh,hw/a)*(1-.02*Math.sin(p.t*.11))/Math.tan(fov*Math.PI/360),norm=Math.hypot(...dir);
 return{target,position:target.map((v,i)=>v+dir[i]*d/norm)as PhantomPoint,fov};
}
