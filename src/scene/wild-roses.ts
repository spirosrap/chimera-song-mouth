import type {CameraView} from './scene.ts';
export type RosePoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export const ROSE_SHOTS:[number,CameraView][]=[
 [0,'roses-water'],[8,'roses-gown'],[16,'kylie-rose'],[24,'roses-reeds'],[35,'roses-garden'],[45,'kylie-rose'],[54,'roses-flower'],[65,'roses-water'],[73,'nick-cave'],[83,'roses-hands'],[91,'kylie-rose'],[100,'roses-touch'],[109,'roses-pair'],[118,'roses-snake'],[127,'kylie-rose'],[137,'roses-hands'],[146,'roses-pair'],[155,'roses-touch'],[164,'roses-overhead'],[174,'nick-cave'],[184,'kylie-rose'],[193,'roses-water'],[202,'kylie-rose'],[211,'roses-touch'],[220,'nick-cave'],[229,'roses-garden'],[237,'kylie-rose'],[246,'roses-overhead'],[251,'roses-lips'],[260,'roses-lips'],[267,'roses-ending']
];
export function rosePose(time:number){
 const t=Math.max(0,Math.min(272.4,Number.isFinite(time)?time:0)),garden=t>=35&&t<65||t>=229&&t<246,kylie:RosePoint=[70,10,90],kneel=t>=75&&t<267,nick:RosePoint=kneel?[20+10*ease(143,158,t),68-9*ease(143,158,t),100]:[-50,150,135],nickYaw=kneel?1.23:.12,bow=kneel?.24+.17*ease(143,158,t):.025;
 const touch=ease(77,87,t)*(1-ease(89,95,t))+.7*ease(98,104,t)*(1-ease(135,142,t))+ease(150,158,t)*(1-ease(165,172,t))+.7*ease(208,215,t)*(1-ease(222,227,t)),rose=ease(246,254,t),mouth:RosePoint=[kylie[0],kylie[1]+6.1,kylie[2]-8.1],hand:RosePoint=[mouth[0]+7*(1-rose),mouth[1]+5+5*(1-rose),mouth[2]+3];
 return {t,garden,kylie,nick,nickYaw,bow,kneel,touch:Math.min(1,touch),rose,mouth,hand,snake:ease(113,119,t)*(1-ease(134,141,t)),sleep:Math.max(ease(248,264,t),.4+.25*Math.sin(t*.23)),fade:ease(0,1.1,t)*(1-ease(268.6,271.6,t)),wind:Math.sin(t*.55)*.7+.3,water:Math.sin(t*.68)};
}
export function roseGarden(view:CameraView,time:number){if(view==='roses-garden'||view==='roses-flower')return true;if(['roses-water','roses-overhead','roses-gown','roses-reeds','roses-hands','roses-touch','roses-pair','roses-snake','roses-lips','roses-ending','nick-cave'].includes(view))return false;return rosePose(time).garden;}
export function roseCamera(view:CameraView,aspect:number,time:number){
 const p=rosePose(time),garden=roseGarden(view,p.t),k=garden?[0,150,35]as RosePoint:p.kylie,close=view==='kylie-rose'||view==='nick-cave'||view==='roses-lips',nick=view==='nick-cave';let target:RosePoint=garden?[0,108,0]:[30,25,140],hh=garden?128:145,hw=garden?210:255,dir:RosePoint=garden?[.05,.04,1]:[.2,.65,1],up:RosePoint=[0,1,0];
 if(close){target=nick?[p.nick[0],p.nick[1]+11,p.nick[2]]:garden?[k[0],k[1]+11,k[2]]:[k[0],k[1]+7,k[2]-10];hh=view==='roses-lips'?28:35;hw=view==='roses-lips'?33:42;dir=nick?[Math.sin(p.nickYaw),.18,Math.cos(p.nickYaw)]:garden?[.05,.025,1]:[.025,1,-.03];if(!nick&&!garden)up=[0,0,-1];}
 else if(view==='roses-overhead'){target=[60,8,156];hh=120;hw=150;dir=[.015,1,.03];up=[0,0,-1];}
 else if(view==='roses-gown'){target=[70,13,193];hh=58;hw=85;dir=[.08,1,.3];up=[0,0,-1];}
 else if(view==='roses-hands'||view==='roses-touch'){target=[60,25,86];hh=58;hw=85;dir=[.25,1,.35];up=[0,0,-1];}
 else if(view==='roses-snake'){target=[70,17,136];hh=65;hw=85;dir=[.08,1,.13];up=[0,0,-1];}
 else if(view==='roses-reeds'||view==='roses-ending'){target=[20,65,100];hh=170;hw=310;dir=[.35,.26,1];}
 else if(view==='roses-flower'){target=[0,160,35];hh=55;hw=75;}
 const effective=Math.max(.42,Math.min(4/3,aspect)),fov=36,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*d/n)as RosePoint,up,fov};
}
