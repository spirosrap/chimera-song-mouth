import type {CameraView} from './scene.ts';
export type UnbreakPoint=[number,number,number];
export type UnbreakPlace='road'|'home'|'pool'|'mirror'|'bedroom'|'stairs'|'theatre';
export type UnbreakView='toni'|'unbreak-road'|'unbreak-home'|'unbreak-pool'|'unbreak-mirror'|'unbreak-bedroom'|'unbreak-stairs'|'unbreak-theatre'|'unbreak-orchestra'|'unbreak-curtain';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export const UNBREAK_SHOTS:[number,UnbreakView][]=[
 [0,'unbreak-road'],[18,'unbreak-home'],[28,'toni'],[34,'unbreak-road'],[39,'unbreak-home'],[49,'toni'],[62,'unbreak-pool'],[71,'unbreak-pool'],[80,'unbreak-home'],[90,'unbreak-mirror'],[100,'unbreak-mirror'],[110,'unbreak-home'],[121,'unbreak-stairs'],[129,'toni'],[133,'unbreak-bedroom'],[148,'unbreak-stairs'],[155,'toni'],[160,'unbreak-bedroom'],[169,'unbreak-orchestra'],[181,'unbreak-orchestra'],[189,'toni'],[200,'unbreak-theatre'],[208,'unbreak-orchestra'],[213,'toni'],[221,'unbreak-theatre'],[231,'unbreak-theatre'],[238.5,'unbreak-stairs'],[241,'unbreak-theatre'],[250,'toni'],[260,'unbreak-theatre'],[268,'unbreak-curtain']
];
export function unbreakPose(time:number){
 const t=Math.max(0,Math.min(273.51,Number.isFinite(time)?time:0)),shot=UNBREAK_SHOTS.reduce((best,[start],i)=>t>=start?i:best,0),[start,view]=UNBREAK_SHOTS[shot],progress=ease(start,UNBREAK_SHOTS[shot+1]?.[0]??273.5,t);
 const closePlace:UnbreakPlace=t>=169?'theatre':t<62?'home':'stairs';
 const place:UnbreakPlace=view==='toni'?closePlace:view==='unbreak-road'?'road':view==='unbreak-home'?'home':view==='unbreak-pool'?'pool':view==='unbreak-mirror'?'mirror':view==='unbreak-bedroom'?'bedroom':view==='unbreak-stairs'?'stairs':'theatre';
 return{t,shot,progress,place,view,gown:t>=169,open:ease(183,192,t)*(1-ease(260,267,t)),heart:.5+.5*Math.sin(t*.39),sway:Math.sin(t*.35)*.019,embrace:ease(40,45,t)*(1-ease(47,51,t)),swim:Math.sin(t*1.4),crash:ease(8,13,t),curtain:ease(268,272.3,t),fade:ease(0,1.3,t)*(1-ease(270.8,273.05,t))};
}
export function unbreakPlace(view:CameraView,time:number):UnbreakPlace{
 const map:Partial<Record<CameraView,UnbreakPlace>>={'unbreak-road':'road','unbreak-home':'home','unbreak-pool':'pool','unbreak-mirror':'mirror','unbreak-bedroom':'bedroom','unbreak-stairs':'stairs','unbreak-theatre':'theatre','unbreak-orchestra':'theatre','unbreak-curtain':'theatre'};
 return map[view]??unbreakPose(time).place;
}
export function unbreakCamera(view:CameraView,aspect:number,time:number){
 const p=unbreakPose(time),place=unbreakPlace(view,time),close=view==='toni',orchestra=view==='unbreak-orchestra',curtain=view==='unbreak-curtain',side=p.shot%3===0;
 const target:UnbreakPoint=curtain?[0,470,-150]:close?[0,place==='stairs'||place==='home'&&time<34?123:153,35]:place==='road'?[20,88,-25]:place==='home'?[-10,105,0]:place==='pool'?[0,time>=71?55:85,-30]:place==='mirror'?[0,131,20]:place==='bedroom'?[0,97,-10]:place==='stairs'?[0,100,-20]:orchestra?[-120,106,-145]:[0,105,-100];
 const hh=close?40:curtain?175:place==='pool'?100:place==='mirror'?95:125,hw=close?51:curtain?620:orchestra?350:place==='theatre'?440:place==='road'?340:place==='pool'?300:place==='mirror'?190:place==='stairs'?190:270,fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360)*(1-(close?.075:.025)*p.progress),direction:UnbreakPoint=[close?(side?-.25:.15):place==='pool'?.18:.12,place==='pool'?(time>=71?-.10:.34):close?.035:.10,1],n=Math.hypot(...direction);
 return{target,position:target.map((x,i)=>x+d*direction[i]/n)as UnbreakPoint,fov};
}
