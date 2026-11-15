import type {CameraView} from './scene.ts';
export type BehaviourPoint=[number,number,number];
export type BehaviourSet='forest'|'cabin'|'road'|'water'|'space'|'belly';
export const BEHAVIOUR_SHOTS:[number,CameraView][]=[
 [0,'behaviour-road'],[12,'behaviour-hut'],[21,'behaviour-bear'],[28,'behaviour-singer'],
 [40,'behaviour-forest'],[44,'behaviour-bear'],[50,'behaviour-moth'],[56,'behaviour-cabin'],
 [64,'behaviour-forest'],[70,'behaviour-singer'],[79,'behaviour-hunter'],[87,'behaviour-small'],
 [94,'behaviour-hunter'],[99,'behaviour-small'],[106,'behaviour-road'],[115,'behaviour-car'],
 [123,'behaviour-forest'],[131,'behaviour-float'],[140,'behaviour-water'],[147,'behaviour-bear'],
 [153,'behaviour-bowl'],[161,'behaviour-singer'],[169,'behaviour-astronaut'],[176,'behaviour-planet'],
 [184,'behaviour-small'],[191,'behaviour-belly'],[198,'behaviour-bulb'],[205,'behaviour-spoon'],
 [211,'behaviour-singer'],[216,'behaviour-bear'],[224,'behaviour-paws'],[231,'behaviour-bear'],
 [237,'behaviour-belly'],[244,'behaviour-ending']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function behaviourPose(time:number){
 const t=Math.max(0,Math.min(255.5,Number.isFinite(time)?time:0)),beat=t*110/60,walk=Math.sin(t*2.7);
 return{t,beat,walk,singer:[Math.sin(t*.18)*13,148+Math.abs(walk)*.7,35]as BehaviourPoint,
  bear:[105+Math.sin(t*.19)*18,0,-105+Math.sin(t*.17)*10]as BehaviourPoint,
  moth:[Math.sin(t*.8)*19,133+Math.sin(t*1.4)*13,85+Math.cos(t*.5)*14]as BehaviourPoint,
  fly:Math.sin(t*16),turn:Math.sin(t*.3)*.08,tilt:Math.sin(t*.7)*.03,
  fade:ease(0,1,t)*(1-ease(252.4,255.1,t))};
}
export function behaviourSet(view:CameraView,time:number):BehaviourSet{
 if(view==='bjork')return time>=169&&time<184?'space':time>=191&&time<198||time>=237&&time<244?'belly':time>=131&&time<147?'water':time>=56&&time<64||time>=153&&time<161||time>=198&&time<211?'cabin':'forest';
 if(['behaviour-cabin','behaviour-bowl','behaviour-bulb','behaviour-spoon'].includes(view))return'cabin';
 if(['behaviour-road','behaviour-car'].includes(view))return'road';
 if(['behaviour-water','behaviour-float'].includes(view))return'water';
 if(['behaviour-space','behaviour-astronaut','behaviour-planet','behaviour-ending'].includes(view))return'space';
 if(view==='behaviour-belly')return'belly';
 if(view==='wide')return behaviourSet(BEHAVIOUR_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'behaviour-road' as CameraView),time);
 return'forest';
}
export function behaviourCamera(view:CameraView,aspect:number,time:number){
 const p=behaviourPose(time),set=behaviourSet(view,time);if(view==='bjork')view=set==='space'?'behaviour-astronaut':set==='water'?'behaviour-float':set==='cabin'?'behaviour-bowl':set==='belly'?'behaviour-belly':'behaviour-singer';
 let target:BehaviourPoint=[0,124,-40],hh=160,hw=290,dir:BehaviourPoint=[.1,.1,1],up:BehaviourPoint=[0,1,0];
 if(view==='behaviour-singer'){target=[p.singer[0],p.singer[1]+12,p.singer[2]];hh=43;hw=53;dir=[.12,.01,1];}
 else if(view==='behaviour-bear'||view==='behaviour-paws'){target=[p.bear[0],view==='behaviour-paws'?75:165,p.bear[2]];hh=view==='behaviour-paws'?85:173;hw=view==='behaviour-paws'?122:165;dir=[.2,.08,1];}
 else if(view==='behaviour-hut'){target=[-176,117,-218];hh=145;hw=199;dir=[.4,.15,1];}
 else if(view==='behaviour-moth'){target=[p.moth[0],p.moth[1],p.moth[2]];hh=47;hw=68;dir=[.12,.02,1];}
 else if(view==='behaviour-hunter'){target=[28,28,-112];hh=72;hw=106;dir=[-.7,1,.35];up=[0,0,-1];}
 else if(view==='behaviour-small'){target=[-12,39,26];hh=73;hw=112;dir=[.2,.22,1];}
 else if(view==='behaviour-bowl'){target=[0,134,25];hh=53;hw=77;dir=[.16,.03,1];}
 else if(view==='behaviour-bulb'){target=[-40,159,40];hh=46;hw=68;dir=[.05,.03,1];}
 else if(view==='behaviour-spoon'){target=[8,98,25];hh=58;hw=99;dir=[.13,.7,1];}
 else if(set==='cabin'){target=[0,122,0];hh=112;hw=180;dir=[.14,.08,1];}
 else if(view==='behaviour-car'){target=[0,58,-78];hh=99;hw=185;dir=[.2,.07,1];}
 else if(set==='road'){target=[0,65,-110];hh=150;hw=300;dir=[.04,.12,1];}
 else if(view==='behaviour-float'){target=[0,8,-3];hh=38;hw=55;dir=[.03,1,.35];up=[0,0,-1];}
 else if(set==='water'){target=[0,2,0];hh=88;hw=164;dir=[.1,.7,1];}
 else if(view==='behaviour-astronaut'){target=[0,151,20];hh=47;hw=65;dir=[.12,.02,1];}
 else if(view==='behaviour-planet'){target=[0,126,-30];hh=185;hw=280;dir=[.14,.18,1];}
 else if(view==='behaviour-ending'){target=[0,63,-30];hh=280;hw=390;dir=[.12,.14,1];}
 else if(set==='space'){target=[0,123,0];hh=156;hw=230;dir=[.12,.12,1];}
 else if(set==='belly'){target=[0,145,0];hh=185;hw=192;dir=[.15,.06,1];}
 const fov=34,effective=Math.max(.42,Math.min(4/3,aspect)),d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);
 return{target,position:target.map((v,i)=>v+dir[i]*d/n)as BehaviourPoint,up,fov};
}
