import type {CameraView} from './scene.ts';
export type BeastPoint=[number,number,number];
export type BeastPlace='chase'|'mirror'|'forest'|'hall'|'bedroom'|'duet'|'police'|'escape';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));
/** Source-time fantasy, duet and escape; no animation depends on a previous frame. */
export function beastPose(time:number,override?:BeastPlace){
 const t=Math.max(0,Math.min(462,Number.isFinite(time)?time:0));
 const place:BeastPlace=override??(t<35?'chase':t<113?'mirror':t<144?'forest':t<172?'hall':t<190?'forest':t<227?'hall':t<250?'bedroom':t<269?'hall':t<296?'bedroom':t<327?'hall':t<390?'duet':t<399?'police':t<414?'duet':t<427?'police':t<444?'duet':'escape');
 const riding=place==='chase'||place==='escape',seated=place==='hall'||place==='duet'||riding,lying=place==='bedroom',lift=place==='duet'?(60+18*Math.sin(t*.65))*ease(340,347,t):0;
 const open=Math.min(1,pulse(57,80,t)+pulse(152,171,t)+pulse(250,268,t)+pulse(297,325,t)),heart=Math.min(1,pulse(80,106,t)+pulse(190,208,t)+pulse(269,283,t)),reach=Math.min(1,pulse(38,60,t)+pulse(204,225,t)+pulse(328,340,t)+pulse(405,414,t));
 const travel=place==='escape'?ease(444,460,t):0;
 const lead:BeastPoint=riding?[15+travel*150,106,-travel*650]:place==='duet'?[-65,145+lift,20]:place==='hall'?[0,116,45]:[0,150,50];
 const answer:BeastPoint=riding?[-24+travel*150,119,-travel*650]:lying?[83,115,-20]:place==='duet'?[85,145+lift,20]:[105,150,12];
 return {t,place,riding,seated,lying,lift,open,heart,reach,travel,lead,answer,human:ease(427,439,t),wind:.4+.25*Math.sin(t*.8),shatter:pulse(148,155,t),fade:ease(0,1,t)*(1-ease(457,460.6,t))};
}
export function beastPlace(view:CameraView,time:number):BeastPlace{
 const places:Partial<Record<CameraView,BeastPlace>>={'beast-chase':'chase','beast-mirror':'mirror','beast-forest':'forest','beast-hall':'hall','beast-bedroom':'bedroom','beast-duet':'duet','beast-police':'police','beast-escape':'escape'};
 return places[view]??beastPose(time).place;
}
export function beastCamera(view:CameraView,aspect:number,time:number){
 const place=beastPlace(view,time),p=beastPose(time,place),close=view==='beast-singer'||view==='love-answer',female=view==='love-answer',at=female?p.answer:p.lead;
 const target:BeastPoint=close?[at[0]+(female&&p.lying?16:0),at[1]+(female&&p.lying?0:15),at[2]]:place==='chase'?[0,130,-30]:place==='escape'?[0,110,-280]:place==='forest'?[0,120,-80]:place==='bedroom'?[0,95,-55]:place==='duet'?[0,115+p.lift,-20]:place==='police'?[0,120,-65]:[0,118,-65];
 const hh=close?39:place==='bedroom'?120:place==='escape'?220:170,hw=close?47:place==='escape'?650:place==='chase'?400:place==='forest'?380:320,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*(close?.09:.15),target[1]+d*(close?.025:.1),target[2]+d] as BeastPoint,fov};
}
