import type {CameraView} from './scene.ts';
export type RockPoint=[number,number,number];
export const ROCK_SHOTS:[number,CameraView][]=[
 [0,'rock-rink'],[6,'rock-skater'],[12,'rock-hatch'],[21,'rock-above'],[28,'rock-booth'],[34,'rock-dancer'],[43,'rock-dj-close'],[52,'rock-dj-close'],[59,'rock-skates'],[66,'rock-skater'],[73,'rock-singer'],[82,'rock-singer'],[90,'rock-vest'],[96,'rock-tattoos'],[104,'rock-booth'],[111,'rock-ring'],[119,'rock-point'],[127,'rock-skates'],[134,'rock-tattoos'],[141,'rock-singer'],[149,'rock-singer'],[155,'rock-trousers'],[163,'rock-skater'],[170,'rock-peel'],[178,'rock-ring'],[185,'rock-ribbons'],[193,'rock-skater'],[201,'rock-muscle'],[209,'rock-dj-close'],[216,'rock-ribbons'],[224,'rock-ring'],[231,'rock-bones'],[237,'rock-duet'],[243,'rock-duet'],[246.5,'rock-credits']
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function rockPose(time:number){const t=Math.max(0,Math.min(257.9,Number.isFinite(time)?time:0)),beat=(t-8.8)*104/60;return{t,beat,rise:ease(8,27,t),jacket:1-ease(29,34,t),vest:1-ease(91,96,t),trousers:1-ease(151,160,t),peel:ease(171,201,t),bones:ease(224,238,t),djJoin:ease(230,239,t),credits:t>=246.5,fade:ease(0,.7,t)*(1-ease(257,257.8,t)),sway:Math.sin(beat*Math.PI),pulse:.5+.5*Math.sin(beat*Math.PI*2)};}
export function rockView(time:number):CameraView{return ROCK_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'rock-rink'as CameraView);}
export function rockCamera(view:CameraView,aspect:number,time:number){const p=rockPose(time);if(view==='wide')view=rockView(time);if(view==='rock-robbie')view='rock-singer';if(p.credits)view='rock-credits';const head=-55+213*p.rise;let target:RockPoint=[0,137,0],hh=213,hw=340,dir:RockPoint=[.1,.13,1],up:RockPoint=[0,1,0];
 if(view==='rock-singer'||view==='rock-point'){target=[0,head+13,3];hh=57;hw=96;dir=[.1,.05,1];}
 if(view==='rock-hatch'){target=[0,Math.max(12,head),0];hh=88;hw=133;dir=[.15,.5,1];}
 if(view==='rock-above'){target=[0,40,0];hh=286;hw=410;dir=[0,1,.001];up=[0,0,-1];}
 if(view==='rock-dancer'||view==='rock-vest'||view==='rock-tattoos'||view==='rock-trousers'){target=[0,view==='rock-trousers'?86:127,4];hh=view==='rock-tattoos'?94:157;hw=view==='rock-tattoos'?153:236;dir=[.16,.1,1];}
 if(view==='rock-booth'||view==='rock-dj-close'){target=[-180*(1-p.djJoin)+92*p.djJoin,290-112*p.djJoin,-180+200*p.djJoin];hh=view==='rock-dj-close'?63:139;hw=view==='rock-dj-close'?96:225;dir=[.13,.05,1];}
 if(view==='rock-skater'||view==='rock-ribbons'){const q=p.t*.47+.65,r=288;target=[Math.sin(q)*r,view==='rock-ribbons'?125:132,Math.cos(q)*r];hh=view==='rock-ribbons'?105:117;hw=view==='rock-ribbons'?166:181;dir=[Math.sin(q)*.55,.08,Math.cos(q)*.55];}
 if(view==='rock-skates'){const q=p.t*.47+.65;target=[Math.sin(q)*288,30,Math.cos(q)*288];hh=84;hw=143;dir=[Math.sin(q)*.65,.18,Math.cos(q)*.65];}
 if(view==='rock-muscle'||view==='rock-bones'||view==='rock-peel'){target=[0,126,6];hh=153;hw=237;dir=[.16,.08,1];}
 if(view==='rock-duet'){target=[44,126,10];hh=171;hw=263;dir=[.13,.12,1];}
 if(view==='rock-credits'){target=[0,37,0];hh=90;hw=310;dir=[0,0,1];}
 const a=Math.max(.42,Math.min(1.95,Number.isFinite(aspect)?aspect:16/9)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as RockPoint,up,fov};
}
