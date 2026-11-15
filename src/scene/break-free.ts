import type {CameraView} from './scene.ts';
export type FreePoint=[number,number,number];
export type FreeSet='title'|'roofs'|'home'|'kitchen'|'crowd'|'cave'|'ballet';
export const FREE_SHOTS:[number,CameraView][]=[
 [0,'free-title'],[4,'free-roofs'],[20,'free-handle'],[26,'free-vacuum'],[35,'free-maid'],
 [38,'free-kitchen'],[45,'free-home'],[52,'free-maid'],[62,'free-vacuum'],[70,'free-maid'],
 [78,'free-crowd'],[92,'free-band'],[101,'free-cave'],[109,'free-dancer'],[122,'free-box'],
 [132,'free-ballet'],[141,'free-pyramid'],[149,'free-ballet'],[158,'free-dancer'],
 [164,'free-lift'],[175,'free-hands'],[184,'free-ballet'],[193,'free-crowd'],
 [198,'free-home'],[207,'free-vacuum'],[214,'free-newspaper'],[219,'free-home'],
 [224,'free-stairs'],[230,'free-frontman'],[239,'free-band'],[246,'free-frontman'],
 [254,'free-crowd'],[266,'free-title']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function freePose(time:number){
 const t=Math.max(0,Math.min(272,Number.isFinite(time)?time:0)),beat=(t-26)*109/60;
 const cleaning=t<78?Math.max(0,t-26):t-198,walk=Math.sin(cleaning*1.8);
 const maid:FreePoint=t>=224&&t<230?[65+(t-224)*10,150+(t-224)*14,-70-(t-224)*9]:[-35+Math.sin(cleaning*.53)*26,150,25+Math.sin(cleaning*.31)*16];
 return{t,beat,walk,maid,push:Math.sin(cleaning*1.8)*19,turn:Math.sin(t*.28)*.07,
  dance:(t-109),roll:ease(174,185,t),lift:ease(162,166,t)*(1-ease(172,176,t)),
  fade:ease(0,.5,t)*(1-ease(270.8,271.65,t))};
}
export function freeSet(view:CameraView,time:number):FreeSet{
 if(view==='freddie')return time>=78&&time<101||time>=193&&time<198||time>=230?'crowd':time>=101&&time<193?'ballet':'home';if(view==='free-title')return'title';if(view==='free-roofs')return'roofs';
 if(view==='free-kitchen')return'kitchen';if(view==='free-cave')return'cave';
 if(['free-crowd','free-band','free-frontman'].includes(view))return'crowd';
 if(['free-dancer','free-box','free-ballet','free-pyramid','free-lift','free-hands'].includes(view))return'ballet';
 if(view!=='wide')return'home';
 return time<4||time>=266?'title':time<20?'roofs':time<78?'home':time<101?'crowd':time<109?'cave':time<193?'ballet':time<198?'crowd':time<230?'home':'crowd';
}
export function freeCamera(view:CameraView,aspect:number,time:number){
 if(view==='freddie'){const set=freeSet(view,time);view=set==='crowd'?'free-frontman':set==='ballet'||set==='cave'?'free-dancer':'free-maid';}
 const p=freePose(time);let target:FreePoint=[0,115,-20],hh=145,hw=230,dir:FreePoint=[.08,.07,1],up:FreePoint=[0,1,0];
 if(view==='free-maid'){target=[p.maid[0],p.maid[1]+9,p.maid[2]];hh=43;hw=54;dir=[.12,.02,1];}
 else if(view==='free-vacuum'){target=[p.maid[0]+12,90,p.maid[2]+23];hh=103;hw=94;dir=[.2,.06,1];}
 else if(view==='free-handle'){target=[p.maid[0]+25,69,p.maid[2]+43];hh=43;hw=47;dir=[.25,.18,1];}
 else if(view==='free-kitchen'){target=[-160,127,-110];hh=112;hw=168;dir=[.28,.08,1];}
 else if(view==='free-stairs'){target=[112,175,-98];hh=146;hw=200;dir=[-.3,.05,1];}
 else if(view==='free-newspaper'){target=[102,88,-54];hh=43;hw=63;dir=[-.12,.22,1];}
 else if(view==='free-title'){target=[0,25,0];hh=85;hw=130;dir=[0,0,1];}
 else if(view==='free-roofs'){target=[0,100,-60];hh=165;hw=370;dir=[.6,.75,1];}
 else if(view==='free-cave'){target=[0,130,-15];hh=190;hw=210;dir=[.12,.05,1];}
 else if(view==='free-crowd'){target=[0,75,-170];hh=184;hw=295;dir=[.06,.18,1];}
 else if(view==='free-band'){target=[0,156,-35];hh=92;hw=147;dir=[.12,.03,1];}
 else if(view==='free-frontman'){target=[0,164,25];hh=38;hw=49;dir=[.12,.02,1];}
 else if(view==='free-dancer'){target=[0,161+Math.sin(p.dance*.7)*3,25];hh=55;hw=73;dir=[.12,.02,1];}
 else if(view==='free-box'){target=[0,99,0];hh=141;hw=190;dir=[-.34,.18,1];}
 else if(view==='free-ballet'||view==='free-pyramid'){target=[0,117,-10];hh=144;hw=205;dir=[.12,.14,1];}
 else if(view==='free-lift'){target=[0,152,-8];hh=120;hw=185;dir=[.25,.14,1];}
 else if(view==='free-hands'){target=[0,75,0];hh=105;hw=154;dir=[.12,.8,1];}
 const fov=34,effective=Math.max(.42,Math.min(4/3,aspect)),d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);
 return{target,position:target.map((v,i)=>v+dir[i]*d/n)as FreePoint,fov,up};
}
