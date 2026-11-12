import type {CameraView} from './scene.ts';
import {PARK_TIMELINE} from './park-timing.ts';
export type ParkPerson='sean'|'will';
export type ParkPoint=[number,number,number];
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>smooth(a,a+.5,t)*(1-smooth(b-.5,b,t));
export function parkSourceTime(time:number){const t=Math.max(0,Math.min(PARK_TIMELINE.at(-1)![1],Number.isFinite(time)?time:0));let i=0;while(i<PARK_TIMELINE.length-2&&PARK_TIMELINE[i+1][1]<t)i++;const [a,x]=PARK_TIMELINE[i],[b,y]=PARK_TIMELINE[i+1];return a+(b-a)*(t-x)/(y-x);}
/** The monologue moves from playful conversation to grief, then a quiet walk away. */
export function parkPose(time:number){const t=parkSourceTime(time),stand=smooth(273.2,276.2,t),walk=smooth(276.2,287.75,t),seanTurn=.28*pulse(14,23,t)+.18*pulse(40,59,t)+.25*pulse(80,119,t)+.48*pulse(131,273,t),willTurn=.12*pulse(0,14,t)+.10*pulse(30,38,t)-.52*smooth(276,281,t);return {t,stand,walk,seanTurn,willTurn,
 sean:[35-225*walk,99+48*stand,4-36*walk] as ParkPoint,will:[-35,98,4] as ParkPoint,
 gazeUp:.15*pulse(70,80,t),seanDown:.13*pulse(110,123,t)+.10*pulse(152,164,t),willDown:.06+.10*smooth(128,176,t),
 gesture:.7*pulse(39,44,t)+.5*pulse(95,99,t)+.6*pulse(158,163,t)+.8*pulse(231,236,t),breath:.18*Math.sin(t*1.2),steps:Math.sin((t-276.2)*6)*Math.min(1,walk*10),reaction:smooth(177,235,t)};}
export function parkCamera(view:CameraView,aspect:number,time:number){const p=parkPose(time),lake=view==='park-lake',wide=view==='wide'||view==='park-bench',pair=view==='park-pair',will=view==='will';let target:ParkPoint,dir:ParkPoint,vertical:number,horizontal:number;
 if(lake){target=[0,54,170];dir=[-.08,.23,-1];vertical=155;horizontal=250;}
 else if(wide){target=[-35*p.walk,70,5];dir=[-.22,.18,1];vertical=122;horizontal=180;}
 else if(pair){target=[0,102,7];dir=[.4,.04,1];vertical=48;horizontal=106;}
 else{const at=will?p.will:p.sean;target=[at[0],at[1]+8,at[2]];dir=will?[-.42,.02,1]:[.38,.02,1];vertical=35;horizontal=48;}
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360),length=Math.hypot(...dir);return {target,position:target.map((x,i)=>x+dir[i]*distance/length) as ParkPoint,fov:36};}
