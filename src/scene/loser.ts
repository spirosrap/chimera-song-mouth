import type {CameraView} from './scene.ts';
export type LoserPoint=[number,number,number];
export type LoserPlace='pavement'|'mono'|'park'|'grave'|'stage'|'race'|'store'|'hill';
export const LOSER_SHOTS:[number,CameraView][]=[
 [0,'lose-lot'],[12,'lose-stage'],[17.68,'lose-yellow'],[25.78,'lose-driver'],[28.28,'lose-grave'],[34.53,'lose-mono'],[37.83,'lose-portrait'],
 [40.42,'lose-mono-guitar'],[44.5,'lose-coffin'],[50.68,'lose-mono-guitar'],[53.35,'lose-coffin'],[56.1,'lose-mono'],[58.06,'lose-box'],
 [65.36,'lose-busker'],[67.11,'lose-elvis'],[69.53,'lose-dancers'],[78.2,'lose-elvis-close'],[79.91,'lose-grave'],[81.25,'lose-elvis'],
 [84.21,'lose-cross'],[90.09,'lose-dancers'],[93.51,'lose-elvis'],[96.43,'lose-stage'],[97.35,'lose-store'],[100.1,'lose-exit'],
 [104.86,'lose-mic'],[107.44,'lose-race'],[108.57,'lose-store'],[109.99,'lose-stage'],[113.28,'lose-yellow-close'],[116.66,'lose-flames'],
 [118,'lose-coffin'],[124.25,'lose-acoustic'],[135.47,'lose-projector'],[145.52,'lose-stage'],[152.57,'lose-mono'],[154.78,'lose-drums'],
 [157.57,'lose-mono-guitar'],[165.37,'lose-elvis'],[168.84,'lose-grave'],[174.6,'lose-driver'],[177.26,'lose-elvis'],[180.56,'lose-dancers'],
 [185.64,'lose-drums'],[188.56,'lose-cross'],[189.56,'lose-mic'],[192.5,'lose-mono-guitar'],[200.33,'lose-coffin'],[204.79,'lose-stage'],
 [208.12,'lose-dog'],[215,'lose-yellow-close'],[218,'lose-guitar'],[222,'lose-stage'],[227.4,'lose-exit'],[230,'lose-coffin'],
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function loserView(time:number):CameraView{return LOSER_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'lose-lot'as CameraView);}
export function loserResolve(view:CameraView,time:number):CameraView{return view==='wide'?loserView(time):view==='loser-beck'?'lose-yellow-close':view==='loser-driver'?'lose-driver':view;}
export function loserPlace(view:CameraView,time:number):LoserPlace{const v=loserResolve(view,time);return['lose-mono','lose-portrait','lose-mono-guitar','lose-coffin'].includes(v)?'mono':['lose-box','lose-busker','lose-elvis','lose-elvis-close'].includes(v)?'park':['lose-grave','lose-cross','lose-dancers'].includes(v)?'grave':['lose-stage','lose-mic','lose-flames','lose-drums'].includes(v)?'stage':['lose-race','lose-driver'].includes(v)?'race':['lose-store','lose-projector','lose-dog','lose-exit'].includes(v)?'store':['lose-acoustic','lose-guitar'].includes(v)?'hill':'pavement';}
export function loserPose(time:number){const t=Math.max(0,Math.min(232.7,Number.isFinite(time)?time:0)),beat=t*86/60,q=beat*Math.PI*2,stop=Math.floor(t*6)/6;return{t,beat,stop,sway:Math.sin(q*.5),nod:Math.sin(q)*.035,turn:Math.sin(t*.43)*.15,left:[-43-Math.sin(q*.5)*9,-24+Math.sin(q)*13,25]as LoserPoint,right:[39+Math.cos(q*.5)*9,-13+Math.cos(q)*22,25]as LoserPoint,coffinX:-145+(stop*27)%290,coffinZ:-20+Math.sin(stop*.7)*29,exit:ease(207,232,t),fire:ease(115,117,t)*(1-ease(231,232,t)),fade:ease(0,.55,t)*(1-ease(230.8,232.5,t))};}
export function loserCamera(view:CameraView,aspect:number,time:number){const p=loserPose(time),v=loserResolve(view,p.t),place=loserPlace(v,p.t);let target:LoserPoint=[0,113,0],hh=161,hw=235,dir:LoserPoint=[.12,.06,1];
 if(v==='lose-yellow'||v==='lose-mono'){target=[0,148,9];hh=96;hw=144;}
 if(v==='lose-yellow-close'||v==='lose-portrait'){target=[0,163,10];hh=52;hw=78;dir=[.07,.02,1];}
 if(v==='lose-mono-guitar'){target=[0,122,10];hh=135;hw=191;}
 if(v==='lose-coffin'){target=[p.coffinX,32,p.coffinZ];hh=76;hw=128;dir=[.5,.32,1];}
 if(v==='lose-busker'||v==='lose-box'){target=[109,132,-17];hh=v==='lose-box'?154:119;hw=hh*1.42;dir=[-.12,.05,1];}
 if(v==='lose-elvis'){target=[-73,113,21];hh=154;hw=220;dir=[.07,.03,1];}
 if(v==='lose-elvis-close'){target=[-73,164,20];hh=51;hw=77;dir=[.05,.02,1];}
 if(v==='lose-cross'){target=[-77,98,0];hh=130;hw=190;dir=[.25,.07,1];}
 if(v==='lose-dancers'){target=[18,111,25];hh=155;hw=242;}
 if(v==='lose-mic'){target=[0,163,13];hh=55;hw=83;dir=[.06,.03,1];}
 if(v==='lose-flames'){target=[0,114,8];hh=157;hw=236;dir=[-.4,.03,1];}
 if(v==='lose-drums'){target=[99,78,-12];hh=91;hw=145;dir=[.14,.5,1];}
 if(v==='lose-race'){target=[0,42,-5];hh=182;hw=290;dir=[.5,.7,1];}
 if(v==='lose-driver'){target=[0,150,4];hh=53;hw=82;dir=[.08,.03,1];}
 if(v==='lose-store'||v==='lose-projector'){target=[0,157,13];hh=v==='lose-projector'?93:68;hw=hh*1.5;dir=[.1,.03,1];}
 if(v==='lose-dog'||v==='lose-exit'){target=[-30+p.exit*134,95,20-p.exit*55];hh=146;hw=231;dir=[-.25,.07,1];}
 if(v==='lose-acoustic'){target=[0,113,0];hh=160;hw=229;}
 if(v==='lose-guitar'){target=[0,127,7];hh=108;hw=161;}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as LoserPoint,up:[0,1,0]as LoserPoint,fov,place};}
