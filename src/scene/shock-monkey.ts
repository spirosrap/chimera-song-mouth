import type {CameraView} from './scene.ts';
export type MonkeyPoint=[number,number,number];
export type MonkeyPlace='office'|'white'|'forest'|'water'|'hall';
export const MONKEY_SHOTS:[number,CameraView][]=[
 [0,'monkey-office'],[10,'monkey-singer'],[21,'monkey-papers'],[29,'monkey-singer'],[36,'monkey-double'],[43,'monkey-desk'],[50,'monkey-office'],[55,'monkey-white'],[63,'monkey-animal'],[69,'monkey-office'],[76,'monkey-projector'],[82,'monkey-flowers'],[91,'monkey-forest'],[99,'monkey-running'],[106,'monkey-river'],[113,'monkey-city'],[121,'monkey-running'],[127,'monkey-water'],[135,'monkey-bulb'],[141,'monkey-painted'],[148,'monkey-ritual'],[155,'monkey-double'],[164,'monkey-shadow'],[170,'monkey-struggle'],[179,'monkey-hands'],[185,'monkey-corridor'],[192,'monkey-hall'],[199,'monkey-papers'],[207,'monkey-projector'],[213,'monkey-painted-office'],[220,'monkey-animal'],[226,'monkey-swim'],[234,'monkey-mask'],[240,'monkey-ending']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function monkeyPose(time:number){const t=Math.max(0,Math.min(243.6,Number.isFinite(time)?time:0));return{t,beat:t*148/60,run:Math.sin(t*7),strain:Math.sin(t*2.7)*.5+.5,turn:Math.sin(t*.47)*.08,paint:t>=55&&t<69||t>=141&&t<155||t>=211,fade:ease(0,.8,t)*(1-ease(240,243,t)),sink:ease(225,240,t),paper:Math.sin(t*1.4)};}
export function monkeyPlace(view:CameraView,time:number):MonkeyPlace{
 if(view==='wide'||view==='monkey-gabriel')return monkeyPlace(MONKEY_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'monkey-office'as CameraView),time);
 if(['monkey-white','monkey-painted','monkey-ritual','monkey-mask'].includes(view))return'white';
 if(['monkey-forest','monkey-running','monkey-flowers','monkey-river','monkey-city'].includes(view))return'forest';
 if(['monkey-water','monkey-swim'].includes(view))return'water';
 if(['monkey-corridor','monkey-hall'].includes(view))return'hall';return'office';
}
export function monkeyCamera(view:CameraView,aspect:number,time:number){const p=monkeyPose(time),place=monkeyPlace(view,p.t);if(view==='monkey-gabriel')view=place==='white'?'monkey-painted':place==='forest'?'monkey-running':place==='water'?'monkey-water':place==='hall'?'monkey-hall':'monkey-singer';let target:MonkeyPoint=[0,111,0],hh=150,hw=240,dir:MonkeyPoint=[.15,.12,1];
 if(['monkey-singer','monkey-painted-office','monkey-painted','monkey-hands'].includes(view)){target=[0,151,0];hh=46;hw=76;dir=[.12,.02,1];}
 else if(view==='monkey-animal'){target=[-120,178,-104];hh=61;hw=85;dir=[.05,.03,1];}
 else if(view==='monkey-projector'){target=[142,104,55];hh=90;hw=130;dir=[.35,.12,1];}
 else if(view==='monkey-desk'||view==='monkey-papers'){target=[0,109,35];hh=110;hw=170;dir=[.17,.3,1];}
 else if(view==='monkey-bulb'){target=[0,211,0];hh=125;hw=185;dir=[.1,-.1,1];}
 else if(view==='monkey-double'||view==='monkey-struggle'){target=[0,147,0];hh=100;hw=160;}
 else if(place==='white'){target=[0,121,-5];hh=view==='monkey-mask'?65:160;hw=view==='monkey-mask'?95:245;dir=[-.15,.12,1];}
 else if(place==='forest'){target=[0,127,0];hh=view==='monkey-flowers'?86:167;hw=view==='monkey-flowers'?150:290;dir=[.12,.1,1];}
 else if(place==='water'){target=[0,64-45*p.sink,0];hh=100;hw=180;dir=[.1,.25,1];}
 else if(place==='hall'){target=[0,125,-30];hh=185;hw=270;dir=[.02,.03,1];}
 const effective=Math.max(.42,Math.min(4/3,aspect)),fov=35,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as MonkeyPoint,up:[0,1,0]as MonkeyPoint,fov};
}
