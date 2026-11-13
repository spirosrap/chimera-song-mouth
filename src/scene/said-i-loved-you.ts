import type {CameraView} from './scene.ts';
export type BoltonPoint=[number,number,number];
export type BoltonPlace='storm'|'fire'|'cliffs'|'cave'|'lovers'|'horses';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));
/** Locations, clothing and excessive declarations on the supplied video's clock. */
export function boltonPose(time:number){
 const t=Math.max(0,Math.min(304,Number.isFinite(time)?time:0));
 const place:BoltonPlace=t<8?'storm':t<76?'fire':t<114?'cliffs':t<156?'cave':t<189?'cliffs':t<197?'fire':t<212?'lovers':t<239?'cave':t<256?'cliffs':t<265?'lovers':t<291?'fire':t<297?'cliffs':'horses';
 const open=Math.min(1,pulse(54,76,t)*.6+pulse(159,181,t)*.5+pulse(223,238,t)+pulse(269,285,t)*.6),heart=pulse(13,26,t)+pulse(116,130,t)+pulse(147,156,t)+pulse(211,222,t),reach=pulse(34,50,t)+pulse(87,111,t)+pulse(168,185,t)+pulse(247,255,t);
 return {t,place,open,heart:Math.min(1,heart),reach:Math.min(1,reach),walk:pulse(82,98,t),wind:.6+.4*Math.sin(t*.8),tilt:Math.sin(t*.22)*.035-open*.07,fade:ease(0,.7,t)*(1-ease(300.5,302.7,t)),flash:pulse(239,242,t)};
}
export function boltonPlace(view:CameraView,time:number):BoltonPlace{return view==='bolton-fire'?'fire':view==='bolton-cliffs'?'cliffs':view==='bolton-cave'?'cave':view==='bolton-lovers'?'lovers':view==='bolton-horses'?'horses':boltonPose(time).place;}
export function boltonCamera(view:CameraView,aspect:number,time:number){
 const place=boltonPlace(view,time),close=view==='bolton',scenic=view==='bolton-cliffs'||view==='bolton-horses',lovers=place==='lovers';
 const target:BoltonPoint=close?[0,159,55]:lovers?[0,112,25]:scenic?[0,110,-200]:[0,109,-30];
 const hh=close?37:lovers?105:scenic?180:130,hw=close?44:lovers?145:scenic?460:270,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*(close?.1:.18),target[1]+d*(scenic?.2:.08),target[2]+d] as BoltonPoint,fov};
}
