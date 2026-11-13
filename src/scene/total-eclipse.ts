import type {CameraView} from './scene.ts';
export type EclipsePoint=[number,number,number];
export type EclipsePlace='hall'|'stairs'|'curtains'|'dance'|'courtyard'|'school';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+.8,t)*(1-ease(b-.8,b,t));
/** The supplied official video's changes of room, nightmare and daylight ending. */
export function eclipsePose(time:number){
 const t=Math.max(0,Math.min(335,Number.isFinite(time)?time:0));
 const place:EclipsePlace=t<8?'school':t<39?'hall':t<50?'stairs':t<75?'curtains':t<95?'dance':t<117?'hall':t<156?'stairs':t<166?'hall':t<197?'curtains':t<278?'dance':t<285?'school':'courtyard';
 const open=Math.min(1,pulse(112,155,t)+pulse(221,265,t)*.9),reach=Math.min(1,pulse(54,73,t)+pulse(97,110,t)+pulse(166,176,t)+pulse(240,250,t)),heart=Math.min(1,pulse(16,29,t)+pulse(132,144,t)+pulse(219,232,t)),handshake=pulse(295,314,t);
 return {t,place,open,reach,heart,handshake,wind:place==='courtyard'?.15:.7+.3*Math.sin(t*.7),eyes:place==='courtyard'?pulse(317,324,t):ease(201,212,t),dance:place==='dance'?1:0,day:place==='courtyard',fade:ease(0,1.2,t)*(1-ease(330,333.95,t))};
}
export function eclipsePlace(view:CameraView,time:number):EclipsePlace{return view==='eclipse-school'?'school':view==='eclipse-hall'?'hall':view==='eclipse-stairs'?'stairs':view==='eclipse-curtains'?'curtains':view==='eclipse-dancers'||view==='eclipse-eyes'?'dance':view==='eclipse-courtyard'?'courtyard':eclipsePose(time).place;}
export function eclipseCamera(view:CameraView,aspect:number,time:number){
 const place=eclipsePlace(view,time),lead=view==='bonnie',reply=view==='bright-eyes'||view==='eclipse-eyes',close=lead||reply;
 const balcony=place==='stairs'&&time>=117&&time<156,handshake=eclipsePose(time).handshake;
 const target:EclipsePoint=lead?(balcony?[0,323,-620]:[0,165,62]):reply?[105-5*handshake,165,-3+65*handshake]:place==='school'?[0,330,-640]:place==='courtyard'?[15,110,-95]:place==='stairs'?[0,144,-92]:place==='curtains'?[0,120,-65]:[0,112,-66];
 const hh=close?37:place==='school'?430:place==='stairs'?176:145,hw=close?44:place==='school'?930:place==='courtyard'?400:place==='stairs'?340:290,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*(close?.08:.12),target[1]+d*(close?.03:.08),target[2]+d] as EclipsePoint,fov};
}
