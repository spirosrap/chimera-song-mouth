import type{CameraView}from'./scene.ts';
export type HoudiniPoint=[number,number,number];
export type HoudiniLook='young'|'modern'|'robin'|'hybrid'|'phone'|'driver';
export type HoudiniPlace='bedroom'|'portal'|'corridor'|'car'|'store'|'studio'|'roof'|'clones';
export const HOUDINI_SHOTS:[number,CameraView][]=[
[0,'houdini-phone'],[6,'houdini-call'],[12,'houdini-news'],[18,'houdini-portal'],[25,'houdini-arrival'],[31,'houdini-callout'],[37,'houdini-corridor'],[43,'houdini-comic'],[49,'houdini-modern-face'],[55,'houdini-hall-wide'],[61,'houdini-old-school'],[67,'houdini-drive'],[73,'houdini-driver-dre'],[79,'houdini-chase'],[85,'houdini-hood'],[91,'houdini-car-pair'],[97,'houdini-mask'],[103,'houdini-store'],[109,'houdini-trophies'],[115,'houdini-car-face'],[121,'houdini-driver'],[127,'houdini-reactions'],[133,'houdini-guest'],[139,'houdini-studio'],[145,'houdini-climb'],[151,'houdini-roof-edge'],[157,'houdini-hall-face'],[163,'houdini-hall-wide'],[169,'houdini-robin'],[175,'houdini-showdown'],[181,'houdini-split'],[187,'houdini-roof-duel'],[193,'houdini-corridor'],[199,'houdini-collision'],[205,'houdini-monster'],[211,'houdini-modern-face'],[217,'houdini-lightning'],[223,'houdini-hybrid-face'],[229,'houdini-cameo'],[235,'houdini-clones'],[241,'houdini-driver'],[247,'houdini-message'],[253,'houdini-guests'],[259,'houdini-final-drive'],[265,'houdini-clone-face'],[271,'houdini-car-pair'],[277,'houdini-car-face'],[283,'houdini-road'],[289,'houdini-chase'],[294,'houdini-ending']];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function houdiniPose(time:number){const t=Math.max(0,Math.min(297.36,Number.isFinite(time)?time:0)),q=(t-37)*127/60*Math.PI;return{t,q,beat:Math.sin(q),sway:Math.sin(q*.5),portal:ease(14,19,t)*(1-ease(31,35,t)),fusion:ease(198,205,t),fade:ease(0,.5,t)*(1-ease(296.1,297.34,t))};}
export function houdiniView(t:number):CameraView{return HOUDINI_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'houdini-phone'as CameraView);}
export function houdiniState(view:CameraView,time:number){const p=houdiniPose(time),solo=view==='houdini-em'||view==='houdini-paul'||view==='houdini-dre'||view==='houdini-pete'||view==='houdini-portrait',v=view==='wide'||solo?houdiniView(p.t):view;let place:HoudiniPlace='corridor',look:HoudiniLook=p.t>=203?'hybrid':'modern';
 if(['houdini-phone','houdini-call','houdini-news'].includes(v)){place='bedroom';look='phone';}
 if(['houdini-portal','houdini-arrival','houdini-callout'].includes(v)){place='portal';look='young';}
 if(['houdini-drive','houdini-driver-dre','houdini-chase','houdini-hood','houdini-car-pair','houdini-car-face','houdini-driver','houdini-final-drive','houdini-road','houdini-ending'].includes(v)){place='car';look=p.t>=235?'hybrid':'robin';}
 if(['houdini-store','houdini-trophies','houdini-old-school'].includes(v)){place='store';look='young';}
 if(['houdini-reactions','houdini-guest','houdini-studio','houdini-cameo','houdini-message','houdini-guests'].includes(v)){place='studio';look=p.t>=203?'hybrid':'modern';}
 if(['houdini-climb','houdini-roof-edge','houdini-robin','houdini-showdown','houdini-split','houdini-roof-duel','houdini-collision','houdini-monster','houdini-lightning','houdini-hybrid-face'].includes(v)){place='roof';look=p.t>=203?'hybrid':'robin';}
 if(v==='houdini-mask'){place='car';look='robin';}
 if(v==='houdini-clones'||v==='houdini-clone-face'){place='clones';look='hybrid';}
 let role=view==='houdini-dre'?'houdini-dre':view==='houdini-pete'?'houdini-pete':view==='houdini-paul'?'houdini-paul':view==='houdini-em'?'houdini-em':p.t<7.2?'houdini-paul':p.t>=12.75&&p.t<14.45||p.t>=28&&p.t<29.5?'houdini-dre':p.t>=272.25&&p.t<278.25?'houdini-pete':'houdini-em';if(role==='houdini-paul'||role==='houdini-dre'){place='bedroom';look='phone';}else if(role==='houdini-pete'){place='car';look='hybrid';}else if(look==='phone')look='young';
 const scenic=!solo&&role==='houdini-em'&&['houdini-news','houdini-chase','houdini-hood','houdini-trophies','houdini-road','houdini-ending','houdini-message'].includes(v),seated=place==='car',climbing=v==='houdini-climb'||v==='houdini-roof-edge',duel=place==='roof'&&p.t>=173&&p.t<204,pos:HoudiniPoint=place==='bedroom'?[0,205,30]:[seated?(solo&&role==='houdini-pete'?-65:65):0,seated?154:151,place==='roof'?102:68];
 return{...p,v:solo?'houdini-portrait':v,place,look,role,solo,scenic,seated,climbing,duel,pos,comic:['houdini-comic','houdini-callout','houdini-old-school','houdini-trophies','houdini-reactions','houdini-guest','houdini-split','houdini-cameo','houdini-message','houdini-guests'].includes(v)};}
export function houdiniCamera(view:CameraView,aspect:number,time:number){const s=houdiniState(view,time);let target:HoudiniPoint=[0,163,0],hh=185,hw=325,dir:HoudiniPoint=[.04,.025,1],up:HoudiniPoint=[0,1,0];
 if(s.place==='bedroom'){target=[0,205,35];hh=158;hw=280;}
 if(s.v.includes('face')||s.v==='houdini-mask'||s.solo){target=[s.pos[0],s.pos[1]+25,s.pos[2]+15];hh=85;hw=155;}
 if(s.v==='houdini-portal'||s.v==='houdini-arrival'){target=[0,210,-110];hh=245;hw=455;}
 if(s.place==='car'&&!s.solo&&!s.v.includes('face')&&s.v!=='houdini-mask'){target=[0,140,0];hh=195;hw=370;dir=[.13,.09,1];}
 if(s.v==='houdini-drive'||s.v==='houdini-final-drive'||s.v==='houdini-car-pair'){target=[0,168,40];hh=155;hw=320;dir=[.02,.06,1];}
 if(s.v==='houdini-chase'||s.v==='houdini-road'||s.v==='houdini-ending'){target=[0,185,-160];hh=270;hw=560;dir=[-.22,.15,1];}
 if(s.v==='houdini-hood'){target=[0,95,70];hh=160;hw=350;dir=[.4,.15,1];}
 if(s.v==='houdini-hall-wide'){target=[0,190,-170];hh=240;hw=430;}
 if(s.v==='houdini-trophies'){target=[0,170,-40];hh=240;hw=500;}
 if(s.v==='houdini-studio'||s.v==='houdini-guests'){target=[0,175,-100];hh=225;hw=480;}
 if(s.climbing){target=[0,140,-40];hh=245;hw=430;dir=[.14,-.12,1];}
 if(s.duel||s.v==='houdini-lightning'||s.v==='houdini-monster'){target=[-48,175,-30];hh=220;hw=480;dir=[.02,.04,1];}
 if(s.v==='houdini-clones'){target=[0,190,-120];hh=245;hw=560;}
 if(s.v==='houdini-split'){up=[.05,1,0];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...s,target,position:target.map((x,i)=>x+d*dir[i]/n)as HoudiniPoint,up,fov};}
