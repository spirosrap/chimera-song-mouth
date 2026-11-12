import {bowlingSourceTime} from './bowling-timing.ts';
import type {CameraView} from './scene.ts';
export type BowlingSpeaker='dude'|'walter'|'donny'|'jesus';
export type BowlingPerson=BowlingSpeaker|'liam';
export type BowlingPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+.35,t)*(1-ease(b-.35,b,t));
const mix=(a:BowlingPoint,b:BowlingPoint,t:number)=>a.map((v,i)=>v+(b[i]-v)*t) as BowlingPoint;
export const bowlingWorld=(p:BowlingPoint,o:BowlingPoint,yaw:number):BowlingPoint=>[o[0]+p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),o[1]+p[1],o[2]-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw)];
/** The bowling routine, rolling ball, reactions and confrontation share the source clock. */
export function bowlingPose(time:number){
 const t=bowlingSourceTime(time),approach=ease(36.3,41.4,t),returning=ease(51,66,t),confront=ease(215,219,t);
 let jesus=mix([0,108,90],[0,100,-18],approach);jesus=mix(jesus,[25,108,80],returning);jesus=mix(jesus,[75,108,146],ease(67,92,t));jesus=mix(jesus,[55,108,135],confront);
 const jesusYaw=Math.PI*(1-returning),lick=pulse(23.8,29.3,t),swing=pulse(36,43,t),dance=pulse(51,59,t),take=ease(5,14,t),released=t>=41.8;
 const hand:BowlingPoint=[17*(1-lick),-45+57*lick+14*swing,10+8*lick-28*Math.sin(approach*Math.PI)];
 const held=bowlingWorld(hand,jesus,jesusYaw),roll=Math.max(0,t-41.8),impact=ease(47.8,48.4,t);
 const ball:BowlingPoint=!released?held:[-2+Math.min(1,roll/6)*3,7.5,-20-Math.min(roll,6.1)*182];
 const dude:BowlingPoint=[-27,90,252],walter:BowlingPoint=[-98,92,252],donny:BowlingPoint=[-61,89,325],liam:BowlingPoint=[127,108,146];
 const dudeGesture=pulse(123,126.5,t)+pulse(134,136.8,t)+pulse(153.3,162.6,t)+pulse(166.5,177.8,t)+pulse(187,189,t)+pulse(207,214,t);
 const walterPoint=pulse(98.7,104,t)+pulse(116.7,118.3,t)+pulse(138.2,142.9,t)+pulse(184,186.6,t)+pulse(199,201,t);
 const walterCross=ease(107,110,t)*(1-.25*walterPoint),donnyTurn=pulse(113.9,118.1,t)+pulse(132.7,134.5,t)+pulse(143.3,144.7,t)+pulse(173.5,184,t)+pulse(192,199,t);
 const threaten=pulse(226,237,t)+pulse(242,257,t),finger=pulse(242,250,t),dudeTurn=.15*Math.sin(t*.45)*dudeGesture+.38*pulse(125,131,t)+.32*pulse(151,165,t);
 return {t,beeper:pulse(128,133,t),flashback:t>=108.691917&&t<120.995875,jesus,dude,walter,donny,liam,jesusYaw,lick,swing,dance,take,hand,ball,roll,impact,ballVisible:t<49.4,confront,dudeGesture,walterPoint,walterCross,donnyTurn,threaten,finger,dudeTurn,
  jesusLean:-.32*pulse(39,43.5,t)+.12*dance*Math.sin(t*3),dudeLean:-.10+.08*dudeGesture,walterLean:.06*walterPoint,
  turnAway:ease(257,259.5,t),sitting:(id:BowlingPerson)=>id==='dude'||id==='walter'||id==='donny'};
}
export function bowlingCamera(view:CameraView,aspect:number,time:number){
 const p=bowlingPose(time);
 if(p.flashback||view==='bowling-flashback'){const target:BowlingPoint=[0,59,-20],distance=Math.max(100,160/Math.max(.4,aspect))/Math.tan(37*Math.PI/360);return {target,position:[distance*.08,59+distance*.3,-20+distance*.95] as BowlingPoint,fov:37};}
 const wide=view==='wide',lane=view==='bowling-lane',ball=view==='bowling-ball',pair=view==='bowling-pair',rivals=view==='bowling-rivals',shoes=view==='bowling-shoes';
 const id:BowlingSpeaker=view==='walter'?'walter':view==='donny'?'donny':view==='dude'?'dude':'jesus';
 const target:BowlingPoint=wide?[-10,60,98]:lane?[0,10,p.t<41.8?-500:p.ball[2]]:ball?p.ball:pair?[-62,91,252]:rivals?[88,106,144]:shoes?[p.jesus[0],5,p.jesus[2]+10]:[p[id][0],p[id][1]+6,p[id][2]];
 const fov=37,vertical=wide?145:lane?68:ball?21:shoes?30:rivals?76:pair?43:34,horizontal=wide?265:lane?82:ball?31:shoes?50:rivals?117:pair?98:42;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const dir:BowlingPoint=wide?[1,.48,-.7]:lane?[.18,.34,1]:ball?p.t<41.8?[.7,.05,.5]:[.25,.3,1]:shoes?[1,.25,.3]:rivals?[.1,.05,1]:pair?[.1,.02,-1]:id==='jesus'?p.t<51?[.75,.04,-1]:[.05,.04,1]:id==='donny'?[.85,.04,.7]:[-.15,.03,-1];
 const len=Math.hypot(...dir);return {target,position:target.map((v,i)=>v+dir[i]*distance/len) as BowlingPoint,fov};
}
