import type {CameraView} from './scene.ts';
export type TastePoint=[number,number,number];
export type TasteLook='blue'|'pink'|'lounge'|'feather'|'aqua'|'mourning'|'ivory'|'nurse'|'purple'|'rival-pool'|'rival-mourning';
export type TastePlace='vanity'|'bedroom'|'hospital'|'lounge'|'stairs'|'pool'|'funeral'|'end';
export const TASTE_SHOTS:[number,CameraView][]=[
 [0,'taste-prologue'],[4,'taste-vanity'],[10,'taste-lipstick'],[14,'taste-title'],[20,'taste-door'],[26,'taste-blue-close'],[31,'taste-peek'],[34,'taste-bedroom'],[39,'taste-window'],[44,'taste-curtains'],[49,'taste-bed'],[54,'taste-balcony'],[59,'taste-rival-close'],[65,'taste-balcony-wide'],[70,'taste-hospital'],[75,'taste-pink-close'],[79,'taste-hospital-wide'],[83,'taste-nurse'],[89,'taste-bedside'],[95,'taste-lounge'],[100,'taste-purple'],[105,'taste-lounge-pair'],[109,'taste-night'],[113,'taste-fire'],[117,'taste-feather'],[123,'taste-staircase'],[129,'taste-stair-pair'],[135,'taste-stair-floor'],[139,'taste-pool-memory'],[144,'taste-pool-pair'],[149,'taste-aqua-close'],[153,'taste-pool'],[157,'taste-saw'],[161,'taste-join'],[166,'taste-pool-friends'],[170,'taste-funeral'],[175,'taste-mourning-pair'],[181,'taste-mourning-close'],[187,'taste-rival-mourning'],[191,'taste-walk'],[198.5,'taste-ending'],
];
const ease=(a:number,b:number,t:number)=>{const v=Math.max(0,Math.min(1,(t-a)/(b-a)));return v*v*(3-2*v);};
export function tasteView(t:number):CameraView{return TASTE_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'taste-prologue' as CameraView);}
export function tasteResolve(v:CameraView,t:number):CameraView{return v==='wide'?tasteView(t):v==='taste-sabrina'?'taste-blue-close':v==='taste-jenna'?'taste-rival-close':v;}
export function tastePose(time:number){const t=Math.max(0,Math.min(199,Number.isFinite(time)?time:0)),q=(t-23.1)*113/60*Math.PI*2;return{t,q,sway:Math.sin(q*.5),step:Math.sin(q),walk:ease(188,198,t),fall:ease(132,136,t),splash:Math.max(0,Math.sin((t-155)*4))*ease(154,158,t),fade:1-ease(198.2,198.75,t)};}
export function tasteState(view:CameraView,time:number){const p=tastePose(time),v=tasteResolve(view,p.t);const place:TastePlace=['taste-prologue','taste-vanity','taste-lipstick','taste-title'].includes(v)?'vanity':v.startsWith('taste-hospital')||['taste-pink-close','taste-nurse','taste-bedside'].includes(v)?'hospital':['taste-lounge','taste-purple','taste-lounge-pair','taste-night','taste-fire'].includes(v)?'lounge':v==='taste-feather'||v.startsWith('taste-stair')?'stairs':v.startsWith('taste-pool')||['taste-aqua-close','taste-saw','taste-join'].includes(v)?'pool':v.startsWith('taste-mourning')||['taste-funeral','taste-rival-mourning','taste-walk'].includes(v)?'funeral':v==='taste-ending'?'end':'bedroom';
 const scenic=['taste-prologue','taste-vanity','taste-lipstick','taste-title','taste-fire','taste-ending'].includes(v),rival=['taste-rival-close','taste-balcony','taste-lounge','taste-purple','taste-nurse','taste-saw','taste-rival-mourning'].includes(v),lead:TasteLook=place==='hospital'?'pink':place==='lounge'?'lounge':place==='stairs'?'feather':place==='pool'?'aqua':place==='funeral'?'mourning':'blue',other:TasteLook=place==='hospital'?'nurse':place==='lounge'?'purple':place==='pool'?'rival-pool':place==='funeral'?'rival-mourning':'ivory';const pair=['taste-hospital-wide','taste-bedside','taste-lounge-pair','taste-stair-pair','taste-stair-floor','taste-pool-memory','taste-pool-pair','taste-pool','taste-join','taste-pool-friends','taste-funeral','taste-mourning-pair','taste-walk'].includes(v);return{...p,v,place,scenic,rival,lead,other,pair,focus:rival?other:lead,scenicMan:v==='taste-pool-memory'||v==='taste-lounge'||v==='taste-purple',seat:place==='hospital'||place==='lounge',floor:v==='taste-stair-floor'};}
export function tasteCamera(view:CameraView,aspect:number,time:number){const p=tasteState(view,time);let target:TastePoint=[0,132,0],hh=186,hw=318,dir:TastePoint=[.1,.08,1],up:TastePoint=[0,1,0];
 if(p.pair){target=[0,142,5];hh=195;hw=356;}
 if(p.v.endsWith('close')||p.v==='taste-peek'){target=[0,174,24];hh=81;hw=138;dir=[.03,.03,1];}
 if(p.place==='vanity'){target=[0,94,0];hh=121;hw=260;dir=[.08,.65,1];if(p.v==='taste-title'||p.v==='taste-prologue'){target=[0,148,0];hh=110;hw=250;dir=[0,0,1];}}
 if(p.v==='taste-lipstick'){target=[0,99,43];hh=45;hw=91;dir=[.07,.6,1];}
 if(p.v==='taste-door'){target=[0,140,-14];hh=201;hw=334;}
 if(p.v==='taste-balcony'||p.v==='taste-balcony-wide'){target=[0,185,-4];hh=210;hw=358;dir=[.13,-.08,1];}
 if(p.v==='taste-bed'){target=[0,126,-22];hh=200;hw=355;dir=[.12,.24,1];}
 if(p.place==='hospital'&&!p.v.endsWith('close')){target=[0,157,5];hh=194;hw=350;dir=[.16,.1,1];}
 if(p.v==='taste-nurse'){target=[0,172,17];hh=115;hw=191;}
 if(p.place==='lounge'&&!p.v.endsWith('close')){target=[0,143,16];hh=191;hw=335;dir=[.08,.12,1];}
 if(p.v==='taste-purple'){target=[0,174,20];hh=115;hw=181;}
 if(p.v==='taste-fire'){target=[0,137,-48];hh=165;hw=320;dir=[.1,.1,1];}
 if(p.place==='stairs'){target=[0,p.floor?104:152,0];hh=p.floor?188:221;hw=365;dir=[.16,.1,1];}
 if(p.v==='taste-feather'){target=[0,174,25];hh=97;hw=169;dir=[.03,.03,1];}
 if(p.place==='pool'&&!p.v.endsWith('close')){target=[0,132,0];hh=205;hw=389;dir=[.14,.16,1];}
 if(p.v==='taste-join'){target=[0,169,21];hh=116;hw=207;dir=[.04,.03,1];}
 if(p.v==='taste-saw'){target=[0,153,0];hh=167;hw=281;}
 if(p.place==='funeral'&&!p.v.endsWith('close')){target=[0,148,-16];hh=209;hw=371;dir=[.07,.1,1];}
 if(p.v==='taste-rival-mourning'){target=[0,174,25];hh=86;hw=147;dir=[.03,.02,1];}
 if(p.v==='taste-walk'){target=[0,145,-9];hh=210;hw=378;}
 if(p.place==='end'){target=[0,150,0];hh=100;hw=250;dir=[0,0,1];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...p,target,position:target.map((x,i)=>x+d*dir[i]/n)as TastePoint,up,fov};}
