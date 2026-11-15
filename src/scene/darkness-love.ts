import type {CameraView} from './scene.ts';
export type DarknessPoint=[number,number,number];
export type DarknessPlace='space'|'bath'|'bed'|'moon'|'amps'|'ship';
export const DARKNESS_SHOTS:[number,CameraView][]=[
 [0,'darkness-space'],[12,'darkness-heart'],[21,'darkness-bath'],[31,'darkness-bath'],[37,'darkness-bed'],[47,'darkness-portrait'],[57,'darkness-door'],[65,'darkness-portrait'],[72,'darkness-bedroom'],[80,'darkness-moon'],[87,'darkness-crab'],[94,'darkness-faces'],[101,'darkness-boulder'],[108,'darkness-moon'],[113,'darkness-door'],[119,'darkness-portrait'],[126,'darkness-amps'],[135,'darkness-guitar'],[142,'darkness-ampwall'],[150,'darkness-guitar'],[156,'darkness-bass'],[163,'darkness-flames'],[169,'darkness-band'],[178,'darkness-saucer'],[185,'darkness-singer'],[190,'darkness-battle'],[197,'darkness-monster'],[201,'darkness-drums'],[207,'darkness-lasers'],[214,'darkness-tentacles'],[220,'darkness-singer'],[226,'darkness-space'],[230,'darkness-ending']
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function darknessPose(time:number){const t=Math.max(0,Math.min(232.5,Number.isFinite(time)?time:0)),beat=t*128/60;return{t,beat,attack:ease(187,194,t)*(1-ease(220,227,t)),laser:t>=193&&t<221&&Math.sin(beat*2*Math.PI)>.28,rock:Math.sin(beat*Math.PI),sway:Math.sin(t*1.4),lift:ease(98,103,t)*(1-ease(106,110,t)),fade:ease(0,1.2,t)*(1-ease(229.1,232,t))};}
export function darknessPlace(view:CameraView,time:number):DarknessPlace{
 if(view==='wide'||view==='darkness-justin'){const place=darknessPlace(DARKNESS_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'darkness-space'as CameraView),time);return view==='darkness-justin'&&(place==='space'||place==='amps')?'bed':place;}
 if(['darkness-space','darkness-ending'].includes(view))return'space';
 if(['darkness-heart','darkness-bath'].includes(view))return'bath';
 if(['darkness-bed','darkness-portrait','darkness-door','darkness-bedroom'].includes(view))return'bed';
 if(['darkness-moon','darkness-crab','darkness-faces','darkness-boulder'].includes(view))return'moon';
 if(['darkness-amps','darkness-guitar','darkness-ampwall','darkness-bass','darkness-flames'].includes(view))return'amps';return'ship';
}
export function darknessCamera(view:CameraView,aspect:number,time:number){const p=darknessPose(time),place=darknessPlace(view,p.t);if(view==='darkness-justin')view=place==='bath'?'darkness-bath':place==='bed'?'darkness-portrait':place==='moon'?'darkness-moon':place==='amps'?'darkness-guitar':place==='space'?'darkness-space':'darkness-singer';let target:DarknessPoint=[0,152,0],hh=165,hw=290,dir:DarknessPoint=[.18,.12,1];
 if(place==='space'){target=[0,0,0];hh=190;hw=310;dir=[.5,.27,1];}
 else if(place==='bath'){target=[0,view==='darkness-heart'?84:120,0];hh=view==='darkness-heart'?110:54;hw=view==='darkness-heart'?170:90;dir=[.1,.18,1];}
 else if(place==='bed'){target=[0,view==='darkness-portrait'?132:104,30];hh=view==='darkness-portrait'?49:view==='darkness-door'?130:145;hw=view==='darkness-portrait'?84:240;dir=view==='darkness-door'?[-.25,.1,1]:[.16,.12,1];}
 else if(place==='moon'){target=view==='darkness-crab'?[140,69,-30]:view==='darkness-faces'?[0,195,-90]:[0,143,20];hh=view==='darkness-crab'?100:view==='darkness-boulder'?143:170;hw=view==='darkness-crab'?210:300;dir=[.12,.06,1];}
 else if(place==='amps'){target=view==='darkness-bass'?[145,125,5]:view==='darkness-guitar'?[-130,128,5]:[0,135,-20];hh=view==='darkness-guitar'||view==='darkness-bass'?120:173;hw=view==='darkness-guitar'||view==='darkness-bass'?150:310;dir=[.12,.06,1];}
 else {target=view==='darkness-singer'?[0,265,-96]:view==='darkness-saucer'?[0,226,-96]:view==='darkness-drums'?[0,119,75]:view==='darkness-monster'?[192,216,-110]:[0,178,-20];hh=view==='darkness-singer'?51:view==='darkness-saucer'?109:view==='darkness-drums'?99:205;hw=view==='darkness-singer'?90:view==='darkness-saucer'?176:view==='darkness-drums'?165:360;dir=[view==='darkness-monster'?-.18:.12,view==='darkness-drums'?.17:.06,1];}
 const effective=Math.max(.42,Math.min(1.94,aspect)),fov=35,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as DarknessPoint,up:[0,1,0]as DarknessPoint,fov};
}
