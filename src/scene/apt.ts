import type {CameraView} from './scene.ts';
export type AptPoint=[number,number,number];
export const APT_SHOTS:[number,CameraView][]=[
 [0,'apt-cable'],[2.1,'apt-shadows'],[4.6,'apt-pair'],[8,'apt-bruno'],[9.8,'apt-mouth'],[11.2,'apt-paper-rose'],[14.2,'apt-paper-pair'],[17.6,'apt-rose-stage'],[21,'apt-rose-close'],[24.6,'apt-rose-stage'],[29.2,'apt-rose-close'],[32,'apt-overhead'],[34,'apt-lean'],[40.3,'apt-pair'],[44,'apt-rose-close'],[47.8,'apt-stars'],[51.2,'apt-kiss'],[54.3,'apt-floor'],[57,'apt-pair'],[59.4,'apt-bruno-stage'],[63.2,'apt-fisheye'],[66.7,'apt-flags'],[69.2,'apt-bruno-close'],[72,'apt-bow'],[74.2,'apt-clapper'],[77.2,'apt-mouth-bruno'],[79.4,'apt-fisheye'],[83,'apt-silhouettes'],[87.6,'apt-rose-stage'],[91,'apt-fisheye-rose'],[93.8,'apt-paper-pair'],[95.6,'apt-rose-close'],[99.3,'apt-rose-stage'],[102.6,'apt-silhouettes'],[105.1,'apt-dance'],[108.5,'apt-hold'],[111,'apt-rose-stage'],[114.6,'apt-hold'],[118,'apt-pair'],[120,'apt-silhouettes'],[123.7,'apt-guitar'],[127,'apt-hold'],[130,'apt-circle-pair'],[132.7,'apt-dance'],[136.3,'apt-dance'],[138.6,'apt-rose-close'],[141,'apt-dance'],[144,'apt-paper-rose'],[147,'apt-pair'],[149.3,'apt-paper-bruno'],[152.7,'apt-dance'],[155.8,'apt-paper-pair'],[159,'apt-camera'],[162.5,'apt-pair'],[168,'apt-credits'],
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function aptPose(time:number){const t=Math.max(0,Math.min(173.9,Number.isFinite(time)?time:0)),beat=(t-6.48)*149/60,q=beat*Math.PI*2;return{t,beat,q,sway:Math.sin(q*.5),step:Math.sin(q),hop:Math.max(0,Math.sin(q))*3,turn:Math.sin(t*.5)*.11,fade:ease(0,.5,t)*(1-ease(167.2,170,t)),nod:Math.sin(q)*.035};}
export function aptView(t:number):CameraView{return APT_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'apt-cable'as CameraView);}
export function aptResolve(v:CameraView,t:number):CameraView{return v==='wide'?aptView(t):v==='apt-rose'?'apt-rose-close':v==='apt-bruno'?'apt-bruno-close':v;}
export function aptCamera(view:CameraView,aspect:number,time:number){const p=aptPose(time),v=aptResolve(view,p.t),paper=v.startsWith('apt-paper'),silhouette=['apt-shadows','apt-silhouettes','apt-hold'].includes(v),circle=['apt-fisheye','apt-fisheye-rose','apt-circle-pair'].includes(v);let target:AptPoint=[0,112,-12],hh=158,hw=251,dir:AptPoint=[.08,.04,1];
 if(v==='apt-cable'){target=[0,8,67];hh=65;hw=114;dir=[.1,1,.1];}
 if(v==='apt-rose-stage'||v==='apt-bruno-stage'){target=[-10,117,-11];hh=148;hw=230;}
 if(v==='apt-rose-close'){target=[-58,161,25];hh=55;hw=83;}
 if(v==='apt-bruno-close'||v==='apt-fisheye'){target=[-58,161,28];hh=circle?92:57;hw=hh*1.44;dir=[.08,circle?.2:.02,1];}
 if(v==='apt-fisheye-rose'){target=[-58,157,25];hh=96;hw=143;dir=[.08,.24,1];}
 if(v==='apt-mouth'||v==='apt-mouth-bruno'){target=[-58,166,38];hh=8;hw=14;dir=[0,0,1];}
 if(v==='apt-lean'||v==='apt-kiss'||v==='apt-stars'||v==='apt-clapper'||v==='apt-camera'){target=[0,158,29];hh=v==='apt-camera'?68:84;hw=157;}
 if(v==='apt-overhead'){target=[0,60,0];hh=181;hw=240;dir=[.02,.9,.65];}
 if(v==='apt-floor'){target=[0,47,37];hh=126;hw=245;dir=[.03,.3,1];}
 if(v==='apt-guitar'){target=[0,131,20];hh=131;hw=211;}
 if(v==='apt-circle-pair'){target=[0,130,13];hh=153;hw=244;}
 if(paper){target=[0,151,25];hh=130;hw=246;dir=[0,0,1];}
 if(v==='apt-credits'){target=[0,130,0];hh=150;hw=250;}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=circle?61:35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as AptPoint,up:[0,1,0]as AptPoint,fov,paper,silhouette,circle};}
