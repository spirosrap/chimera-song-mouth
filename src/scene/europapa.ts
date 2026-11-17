import type{CameraView}from'./scene.ts';
export type EuropapaPoint=[number,number,number];
export type EuropapaLook='blue'|'cowboy'|'vest'|'guitar';
export type EuropapaPlace='podium'|'field'|'bedroom'|'curtain'|'road'|'dinner'|'windmill'|'sunset'|'library'|'rave'|'night'|'memory';
export const EUROPAPA_SHOTS:[number,CameraView][]=[
[0,'europapa-title'],[8,'europapa-windmill'],[15.8,'europapa-podium'],[23.1,'europapa-face'],[28.8,'europapa-nederland'],[33.8,'europapa-cowboy'],[40.7,'europapa-vest'],[46.8,'europapa-bedroom'],[50.3,'europapa-building'],[53.1,'europapa-podium'],[59.1,'europapa-face'],[65.1,'europapa-dance'],[71.2,'europapa-hands'],[76.8,'europapa-italia'],[81.8,'europapa-scooter'],[88.7,'europapa-dinner'],[94.8,'europapa-podium'],[101.2,'europapa-band'],[107.1,'europapa-guitar-face'],[113.1,'europapa-band-wide'],[119.1,'europapa-strings'],[125.1,'europapa-silhouettes'],[131.2,'europapa-hat-close'],[137.2,'europapa-library'],[140.6,'europapa-rave'],[147.5,'europapa-night'],[153.6,'europapa-friends'],[160,'europapa-dark'],[164.6,'europapa-fire'],[171.1,'europapa-tribute'],[178,'europapa-photos'],[184,'europapa-farewell'],[191,'europapa-dedication']];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function europapaPose(time:number){const t=Math.max(0,Math.min(202.1,Number.isFinite(time)?time:0)),q=(t-17)*160/60*Math.PI;return{t,q,step:Math.sin(q),wave:Math.sin(q*.5),fade:ease(0,.7,t)*(1-ease(200.5,202.05,t)),quiet:t>=160};}
export function europapaView(t:number):CameraView{return EUROPAPA_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'europapa-title'as CameraView);}
export function europapaState(view:CameraView,time:number){const p=europapaPose(time),solo=view==='europapa-joost'||view==='europapa-portrait',v=view==='wide'||solo?europapaView(p.t):view;let place:EuropapaPlace='podium';let look:EuropapaLook='blue';
 if(['europapa-windmill','europapa-nederland','europapa-cowboy','europapa-hat-close','europapa-building'].includes(v))place='field';
 if(['europapa-vest','europapa-bedroom'].includes(v)){place='bedroom';look='vest';}
 if(v==='europapa-dance')place='curtain';if(v==='europapa-italia'||v==='europapa-scooter')place='road';if(v==='europapa-dinner')place='dinner';
 if(v==='europapa-windmill')place='windmill';
 if(v.startsWith('europapa-band')||v==='europapa-guitar-face'||v==='europapa-strings'){place='windmill';look='guitar';}
 if(v==='europapa-silhouettes')place='sunset';if(v==='europapa-library')place='library';if(v==='europapa-rave')place='rave';if(v==='europapa-night'||v==='europapa-friends')place='night';
 if(['europapa-fire','europapa-tribute','europapa-photos','europapa-farewell'].includes(v)){place='memory';look='vest';}
 if(v==='europapa-cowboy'||v==='europapa-hat-close')look='cowboy';

 const scenic=!solo&&['europapa-title','europapa-nederland','europapa-italia','europapa-building','europapa-silhouettes','europapa-dark','europapa-photos','europapa-farewell','europapa-dedication'].includes(v),seated=['europapa-bedroom','europapa-scooter','europapa-dinner'].includes(v),pos:EuropapaPoint=[0,seated?134:151,place==='memory'?100:68];
 return{...p,v:solo?'europapa-portrait':v,place,look,solo,scenic,seated,pos,dancing:place==='curtain'||place==='rave',riding:v==='europapa-scooter',guitar:look==='guitar',fire:place==='memory'&&p.t<184};}
export function europapaCamera(view:CameraView,aspect:number,time:number){const s=europapaState(view,time);let target:EuropapaPoint=[0,160,10],hh=185,hw=315,dir:EuropapaPoint=[.04,.03,1],up:EuropapaPoint=[0,1,0];
 if(s.v.includes('face')||s.v.endsWith('close')||s.solo){target=[0,s.pos[1]+28,78];hh=s.look==='cowboy'?120:92;hw=s.look==='cowboy'?220:168;}
 if(s.v==='europapa-title'||s.v==='europapa-dedication'){target=[0,240,0];hh=270;hw=500;}
 if(s.v==='europapa-windmill'||s.v==='europapa-band-wide'){target=[0,235,-200];hh=295;hw=590;}
 if(s.v==='europapa-nederland'||s.v==='europapa-italia'){target=[0,180,-40];hh=240;hw=420;dir=[-.14,.04,1];}
 if(s.v==='europapa-building'){target=[0,295,-320];hh=350;hw=610;}
 if(s.v==='europapa-dance'||s.v==='europapa-rave'){target=[0,170,-70];hh=235;hw=460;}
 if(s.v==='europapa-bedroom'||s.v==='europapa-dinner'){target=[0,150,-30];hh=180;hw=350;}
 if(s.v==='europapa-scooter'){target=[0,130,-100];hh=220;hw=460;}
 if(s.v==='europapa-strings'){target=[0,115,60];hh=180;hw=310;}
 if(s.v==='europapa-silhouettes'||s.v==='europapa-night'||s.v==='europapa-friends'){target=[0,185,-60];hh=245;hw=520;}
 if(s.v==='europapa-fire'||s.v==='europapa-tribute'){target=[0,190,8];hh=220;hw=460;}
 if(s.v==='europapa-photos'){target=[0,100,-20];hh=160;hw=290;dir=[.03,.7,1];}
 if(s.v==='europapa-farewell'){target=[0,200,-20];hh=250;hw=480;}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...s,target,position:target.map((x,i)=>x+d*dir[i]/n)as EuropapaPoint,up,fov};}
