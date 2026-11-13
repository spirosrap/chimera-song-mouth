import type {CameraView} from './scene.ts';
export type AirPoint=[number,number,number];
export type AirPlace='stage'|'street'|'meadow'|'car'|'gas'|'diner'|'silhouette';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));
/** Complete supplied video edit; source time is the only animation state. */
export function airPose(time:number){
 const t=Math.max(0,Math.min(293.1,Number.isFinite(time)?time:0));
 const place:AirPlace=t<33?'street':t<47?'stage':t<65?'street':t<88?'meadow':t<106?'car':t<127?'stage':t<145?'gas':t<178?'stage':t<198?'diner':t<227?'stage':t<246?'diner':t<257?'stage':t<264?'silhouette':t<287?'stage':'silhouette';
 return {t,place,open:Math.min(1,pulse(105,124,t)*.75+pulse(148,176,t)*.55+pulse(204,225,t)+pulse(268,285,t)*.9),heart:Math.min(1,pulse(35,46,t)+pulse(111,118,t)+pulse(210,218,t)),reach:Math.min(1,pulse(115,126,t)+pulse(158,172,t)+pulse(246,254,t)),sway:Math.sin(t*.9)*.025,carTravel:1-ease(5,17,t),walk:ease(17,33,t),separation:1-ease(257,292,t),fade:ease(0,.7,t)*(1-ease(291.2,292.74,t))};
}
export function airPlace(view:CameraView,time:number):AirPlace{
 return view==='air-singer'||view==='air-guitarist'||view==='air-stage'?'stage':view==='air-street'?'street':view==='air-meadow'?'meadow':view==='air-car'?'car':view==='air-gas'?'gas':view==='air-diner'?'diner':view==='air-silhouette'?'silhouette':airPose(time).place;
}
export function airCamera(view:CameraView,aspect:number,time:number){
 const place=airPlace(view,time),close=view==='air-singer',guitar=view==='air-guitarist';
 const target:AirPoint=close?[65,159,35]:guitar?[-75,112,12]:place==='stage'?[0,108,-15]:place==='silhouette'?[0,133,20]:place==='diner'?[0,100,-15]:place==='car'?[0,86,-100]:[0,96,-70];
 const hh=close?39:guitar?97:place==='silhouette'?95:place==='diner'?130:150,hw=close?47:guitar?90:place==='stage'?235:place==='silhouette'?125:place==='diner'?230:place==='car'?240:365,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*(close?.07:place==='car'?.4:.12),target[1]+d*(close?.025:place==='silhouette'?0:.10),target[2]+d]as AirPoint,fov};
}
