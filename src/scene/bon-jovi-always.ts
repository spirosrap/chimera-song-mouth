import type {CameraView} from './scene.ts';
export type BonJoviPoint=[number,number,number];
export type BonJoviPlace='city'|'road'|'apartment'|'party'|'microphone'|'bedroom'|'loft'|'fire'|'street'|'studio';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));
const cuts:[number,BonJoviPlace][]=[[18,'city'],[28,'apartment'],[35,'city'],[39,'road'],[43,'microphone'],[49,'road'],[54,'microphone'],[80,'apartment'],[84,'microphone'],[104,'party'],[116,'bedroom'],[124,'microphone'],[132,'apartment'],[154,'microphone'],[169,'bedroom'],[179,'city'],[184,'bedroom'],[195,'loft'],[200,'bedroom'],[205,'microphone'],[260,'loft'],[275,'microphone'],[310,'loft'],[315,'bedroom'],[320,'fire'],[338,'street'],[366,'studio']];
/** The complete supplied video's locations and gestures, all on absolute source time. */
export function bonJoviPose(time:number){
 const t=Math.max(0,Math.min(365.85,Number.isFinite(time)?time:0)),place=cuts.find(([end])=>t<end)?.[1]??'studio';
 const open=Math.min(1,pulse(38,54,t)*.7+pulse(79,85,t)*.65+pulse(85,104,t)*.65+pulse(116,154,t)*.75+pulse(199,206,t)+pulse(259,276,t));
 const reach=Math.min(1,pulse(87,96,t)+pulse(135,143,t)+pulse(201,205,t)+pulse(264,274,t));
 return {t,place,open,reach,heart:pulse(121,131,t)+pulse(151,158,t),sway:Math.sin(t*.57)*.025,wind:.6+.4*Math.sin(t*.83),road:ease(35,49,t),dance:.5+.5*Math.sin(t*3.4),embrace:Math.min(1,pulse(176,185,t)+pulse(193,200,t)),argument:Math.min(1,pulse(205,219,t)+pulse(275,296,t)),phone:pulse(295,305,t),paint:ease(338,344,t),blast:ease(313,315.5,t)*(1-ease(318.5,320,t)),emergency:.5+.5*Math.sin(t*7),fade:ease(0,3,t)*(1-ease(363.8,365.6,t)),flash:pulse(314.3,316.1,t)};
}
export function bonJoviPlace(view:CameraView,time:number):BonJoviPlace{
 const manual:Partial<Record<CameraView,BonJoviPlace>>={jon:'microphone','bonjovi-city':'city','bonjovi-road':'road','bonjovi-apartment':'apartment','bonjovi-party':'party','bonjovi-bedroom':'bedroom','bonjovi-loft':'loft','bonjovi-fire':'fire','bonjovi-street':'street','bonjovi-studio':'studio'};
 return manual[view]??bonJoviPose(time).place;
}
export function bonJoviCamera(view:CameraView,aspect:number,time:number){
 const p=bonJoviPose(time),place=bonJoviPlace(view,time),close=view==='jon'||place==='microphone',phone=place==='loft'&&p.phone>.01;
 const target:BonJoviPoint=close?[0,159,48]:phone?[70,145,25]:place==='city'?[0,120,-90]:place==='road'?[0,82,-65]:place==='apartment'?[0,102,-15]:place==='party'?[0,125,5]:place==='bedroom'?[0,83,-5]:place==='fire'?[0,125,-55]:place==='street'?[0,108,-65]:place==='studio'?[0,112,-25]:[0,108,-20];
 const hh=close?39:phone?82:place==='bedroom'?100:place==='road'?115:place==='studio'?125:place==='party'?120:150,hw=close?49:phone?125:place==='city'?390:place==='road'?340:place==='apartment'?270:place==='party'?230:place==='bedroom'?205:place==='street'?390:place==='loft'?325:place==='studio'?260:285,fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360),direction:BonJoviPoint=close?[.09,.025,1]:place==='road'?[.25,.11,1]:place==='city'?[.18,.15,1]:[.13,.09,1],length=Math.hypot(...direction);
 return {target,position:target.map((x,i)=>x+d*direction[i]/length) as BonJoviPoint,fov};
}
