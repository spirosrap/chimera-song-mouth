import type {CameraView} from './scene.ts';
export type ManchildPoint=[number,number,number];
export type ManchildLook='road'|'red'|'green'|'fur'|'pond'|'yellow'|'party'|'pink'|'gingham';
export type ManchildPlace='road'|'cab'|'van'|'truck'|'tanker'|'wagon'|'pool'|'water'|'diner'|'kitchen'|'motel'|'pond'|'chairs'|'phone'|'bike'|'bar'|'bath'|'trailer'|'cliff'|'orca'|'dryer';
/** Cuts follow the supplied complete official edit, including its long road ending. */
export const MANCHILD_SHOTS:[number,CameraView][]=[
 [0,'manchild-tortoises'],[5,'manchild-road'],[9,'manchild-hitch'],[13,'manchild-hitch-close'],[18,'manchild-window'],[22,'manchild-cab'],[26,'manchild-cab-close'],[29,'manchild-truck'],[33,'manchild-rolling'],[36,'manchild-van'],[40,'manchild-chandelier'],[44,'manchild-tanker'],[48,'manchild-red-close'],[52.5,'manchild-legs'],[57,'manchild-pool'],[61,'manchild-green-close'],[65,'manchild-fish'],[69,'manchild-long-road'],[73,'manchild-wine'],[78,'manchild-wine-close'],[81.5,'manchild-diner'],[84,'manchild-kitchen'],[87.5,'manchild-fur'],[91,'manchild-petrol'],[95,'manchild-pond'],[98.5,'manchild-chairs'],[102.5,'manchild-motel'],[106,'manchild-sail'],[108.5,'manchild-pink'],[111,'manchild-phone'],[115,'manchild-phone-close'],[118.5,'manchild-gingham'],[123,'manchild-bike'],[128,'manchild-bike-wide'],[131,'manchild-party'],[135,'manchild-party-close'],[139,'manchild-dance'],[143,'manchild-pigs'],[146,'manchild-dog'],[150,'manchild-trailer'],[155,'manchild-car-stop'],[159.5,'manchild-cliff'],[164,'manchild-orca'],[168.5,'manchild-push'],[173,'manchild-wagon'],[176.5,'manchild-flatbed'],[181,'manchild-passing'],[184,'manchild-dryer'],[189,'manchild-floor'],[193,'manchild-dusk'],[198,'manchild-car-rest'],[203,'manchild-overhead'],[208,'manchild-turn'],[213,'manchild-rear'],[217,'manchild-gull'],[221,'manchild-credits'],[231,'manchild-sunset']
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function manchildView(t:number):CameraView{return MANCHILD_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'manchild-tortoises' as CameraView);}
export function manchildPose(time:number){const t=Math.max(0,Math.min(236.71,Number.isFinite(time)?time:0)),beat=(t-14.0046)*123/60,q=beat*Math.PI;return{t,beat,q,bounce:Math.sin(q)*1.3,travel:((t*76)%1600+1600)%1600,fall:ease(159.5,163.8,t),breach:Math.sin(Math.PI*ease(164,168.5,t)),fade:ease(0,.6,t)*(1-ease(235.5,236.7,t))};}
export function manchildResolve(view:CameraView,t:number):CameraView{return view==='wide'?manchildView(t):view==='manchild-sabrina'?'manchild-hitch-close':view;}
export function manchildState(view:CameraView,time:number){const p=manchildPose(time),v=manchildResolve(view,p.t);let place:ManchildPlace='road',look:ManchildLook='road';
 if(['manchild-window','manchild-cab','manchild-cab-close','manchild-wine','manchild-wine-close','manchild-pink','manchild-gingham'].includes(v))place='cab';
 if(v==='manchild-van'||v==='manchild-chandelier')place='van';if(v==='manchild-truck'||v==='manchild-flatbed')place='truck';if(v==='manchild-tanker'||v==='manchild-red-close'){place='tanker';look='red';}
 if(['manchild-legs','manchild-push','manchild-wagon'].includes(v))place='wagon';if(v==='manchild-pool'||v==='manchild-green-close'){place='pool';look='green';}if(v==='manchild-fish')place='water';if(v==='manchild-diner')place='diner';if(v==='manchild-kitchen')place='kitchen';if(v==='manchild-fur'||v==='manchild-petrol'||v==='manchild-motel'){place='motel';look='fur';}if(v==='manchild-pond'){place='pond';look='pond';}if(v==='manchild-chairs')place='chairs';if(v==='manchild-phone'||v==='manchild-phone-close'){place='phone';look='yellow';}if(v==='manchild-bike'||v==='manchild-bike-wide')place='bike';if(v==='manchild-party'||v==='manchild-party-close'||v==='manchild-dance'){place='bar';look='party';}if(v==='manchild-pigs')place='bath';if(v==='manchild-dog'||v==='manchild-trailer')place='trailer';if(v==='manchild-cliff'||v==='manchild-car-stop')place='cliff';if(v==='manchild-orca')place='orca';if(v==='manchild-dryer'||v==='manchild-floor')place='dryer';if(v==='manchild-pink')look='pink';if(v==='manchild-gingham')look='gingham';
 const scenic=['manchild-tortoises','manchild-road','manchild-rolling','manchild-legs','manchild-fish','manchild-long-road','manchild-sail','manchild-pigs','manchild-car-stop','manchild-cliff','manchild-orca','manchild-wagon','manchild-passing','manchild-floor','manchild-dusk','manchild-car-rest','manchild-overhead','manchild-turn','manchild-rear','manchild-gull','manchild-credits','manchild-sunset'].includes(v),seated=['cab','chairs','bike','dryer'].includes(place)||v==='manchild-van'||v==='manchild-chandelier';return{...p,v,place,look,scenic,seated,wine:v==='manchild-wine'||v==='manchild-wine-close',phone:place==='phone',dance:place==='bar',sunset:p.t>193};}
export function manchildCamera(view:CameraView,aspect:number,time:number){const p=manchildState(view,time);let target:ManchildPoint=[0,127,0],hh=167,hw=300,dir:ManchildPoint=[.13,.1,1],up:ManchildPoint=[0,1,0];
 if(p.v.endsWith('close')){target=[0,177,31];hh=77;hw=137;dir=[.035,.02,1];}
 if(p.place==='cab'){target=[-44,155,61];hh=130;hw=242;dir=[-.15,.08,1];if(p.v.endsWith('close')||p.look==='gingham'){target=[-44,182,66];hh=76;hw=133;dir=[0,.015,1];}}
 if(p.place==='van'||p.place==='dryer'){target=[-33,191,49];hh=175;hw=310;dir=[-.09,.035,1];}
 if(p.v==='manchild-window'){target=[-44,145,64];hh=158;hw=280;dir=[-.3,.06,1];}
 if(p.place==='truck'){target=[0,143,15];hh=192;hw=365;dir=[.22,.14,1];}
 if(p.place==='tanker'){target=[0,160,169];hh=182;hw=343;dir=[.16,.06,1];if(p.v.endsWith('close')){target=[0,182,190];hh=84;hw=146;dir=[.025,.025,1];}}
 if(p.place==='wagon'){target=[-23,122,43];hh=191;hw=345;dir=[.2,.16,1];if(p.v==='manchild-legs'){target=[20,195,30];hh=240;hw=360;}}
 if(p.place==='pool'){target=p.v.endsWith('close')?[0,177,25]:[0,127,32];hh=p.v.endsWith('close')?78:172;hw=p.v.endsWith('close')?139:315;dir=[.04,.08,1];}
 if(p.place==='water'){target=[0,86,0];hh=120;hw=265;dir=[0,.04,1];}
 if(p.place==='diner'){target=[0,151,28];hh=153;hw=278;dir=[.09,.06,1];}
 if(p.place==='motel'&&p.v==='manchild-petrol'){target=[0,136,20];hh=188;hw=330;dir=[.15,.1,1];}
 if(p.place==='pond'){target=[-17,140,0];hh=182;hw=325;dir=[.1,.14,1];}
 if(p.place==='chairs'){target=[-12,135,26];hh=172;hw=335;dir=[.18,.13,1];}
 if(p.place==='phone'){target=p.v.endsWith('close')?[0,181,26]:[0,133,16];hh=p.v.endsWith('close')?81:183;hw=p.v.endsWith('close')?142:310;dir=[.08,.05,1];}
 if(p.place==='bike'){target=[-16,150,21];hh=175;hw=345;dir=[.19,.06,1];}
 if(p.place==='bath'){target=[0,89,0];hh=117;hw=217;dir=[.05,.5,1];}
 if(p.place==='trailer'){target=[0,133,20];hh=178;hw=335;dir=[.1,.09,1];}
 if(p.place==='cliff'){target=[0,70,-44];hh=200;hw=380;dir=[.18,.23,1];}
 if(p.place==='orca'){target=[0,136,0];hh=210;hw=365;dir=[0,.08,1];}
 if(p.v==='manchild-tortoises'){target=[0,34,0];hh=81;hw=166;dir=[.1,.48,1];}
 if(p.v==='manchild-rolling'){target=[0,81,0];hh=205;hw=381;dir=[0,.17,1];}
 if(p.v==='manchild-long-road'||p.v==='manchild-road'||p.v==='manchild-passing'){target=[0,102,-110];hh=219;hw=430;dir=[.07,.18,1];}
 if(p.v==='manchild-sail'){target=[0,139,-20];hh=220;hw=381;dir=[.2,.15,1];}
 if(p.v==='manchild-floor'){target=[0,37,33];hh=45;hw=85;dir=[0,.9,1];}
 if(p.sunset){target=[0,86,-42];hh=197;hw=390;dir=[.16,.22,1];if(p.v==='manchild-overhead'){target=[0,68,5];hh=210;hw=341;dir=[0,1,.002];up=[0,0,-1];}if(p.v==='manchild-rear')dir=[-.1,.12,-1];if(p.v==='manchild-gull'){target=[0,225,-53];hh=157;hw=287;dir=[0,.06,1];}}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...p,target,position:target.map((x,i)=>x+d*dir[i]/n)as ManchildPoint,up,fov};
}
