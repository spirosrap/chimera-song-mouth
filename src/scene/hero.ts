import type {CameraView} from './scene.ts';
export type HeroPoint=[number,number,number];
export type HeroPlace='station'|'desert'|'car'|'chapel'|'bedroom'|'courtyard'|'rain';
export type HeroView='enrique'|'hero-station'|'hero-desert'|'hero-car'|'hero-escape'|'hero-chapel'|'hero-bedroom'|'hero-courtyard'|'hero-rain'|'hero-embrace';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export const HERO_SHOTS:[number,HeroView][]=[
 [0,'hero-bedroom'],[10,'hero-station'],[18,'enrique'],[23,'hero-station'],[31,'hero-desert'],[39,'enrique'],[47,'hero-bedroom'],[61,'hero-escape'],[70,'enrique'],[79,'hero-car'],[89,'hero-station'],[94,'enrique'],[101,'hero-chapel'],[111,'hero-chapel'],[120,'hero-bedroom'],[131,'enrique'],[137,'hero-courtyard'],[143,'hero-bedroom'],[151,'hero-courtyard'],[158,'enrique'],[163,'hero-courtyard'],[170,'hero-courtyard'],[176,'enrique'],[182,'hero-courtyard'],[189,'hero-courtyard'],[195,'enrique'],[201,'hero-courtyard'],[207,'enrique'],[213,'hero-desert'],[220,'hero-rain'],[225,'enrique'],[231,'hero-rain'],[237,'hero-rain'],[242,'hero-embrace'],[251,'hero-rain'],[256,'hero-embrace']
];
export function heroPose(time:number){
 const t=Math.max(0,Math.min(262.97,Number.isFinite(time)?time:0)),shot=HERO_SHOTS.reduce((best,[start],i)=>t>=start?i:best,0),[start,view]=HERO_SHOTS[shot],progress=ease(start,HERO_SHOTS[shot+1]?.[0]??262.97,t);
 const singerPlace:HeroPlace=t<32?'station':t<61?'desert':t<89?'car':t<101?'station':t<137?'chapel':t<220?'courtyard':'rain';
 const place:HeroPlace=view==='enrique'?singerPlace:view==='hero-embrace'?(t<220?'bedroom':'rain'):view==='hero-station'?'station':view==='hero-desert'?'desert':view==='hero-car'||view==='hero-escape'?'car':view==='hero-chapel'?'chapel':view==='hero-bedroom'?'bedroom':view==='hero-courtyard'?'courtyard':'rain';
 return {t,shot,progress,place,view,beanie:t<101,shades:t<32,fall:ease(234,240,t),recoil:ease(191,193,t)*(1-ease(197,201,t)),confront:ease(151,171,t)*(1-ease(211,220,t)),cash:ease(160,168,t)*(1-ease(177,180,t)),hand:.5+.5*Math.sin(t*.38),sway:Math.sin(t*.39)*.018,wind:.7+.3*Math.sin(t*.6),drive:ease(61,89,t),pulse:.5+.5*Math.sin(t*7),fade:ease(0,1.2,t)*(1-ease(258,262.5,t))};
}
export function heroPlace(view:CameraView,time:number):HeroPlace{
 const p=heroPose(time),map:Partial<Record<CameraView,HeroPlace>>={'hero-station':'station','hero-desert':'desert','hero-car':'car','hero-escape':'car','hero-chapel':'chapel','hero-bedroom':'bedroom','hero-courtyard':'courtyard','hero-rain':'rain','hero-embrace':time<220?'bedroom':'rain'};
 return map[view]??p.place;
}
export function heroCamera(view:CameraView,aspect:number,time:number){
 const p=heroPose(time),place=heroPlace(view,time),close=view==='enrique',embrace=view==='hero-embrace',low=place==='rain'&&p.fall>.5;
 const target:HeroPoint=close?(low?[12,35,80]:[0,163,35]):embrace&&low?[-25,55,80]:place==='station'?[0,113,-40]:place==='desert'?[0,110,-180]:place==='car'?[0,80,-30]:place==='chapel'?[0,120,-90]:place==='bedroom'?[0,106,5]:place==='courtyard'?[0,118,-35]:[-20,105,35];
 const hh=close?43:embrace?90:place==='car'?120:145,hw=close?54:embrace?190:place==='desert'?450:place==='car'?350:place==='chapel'?290:place==='bedroom'?240:place==='courtyard'?370:390,fov=38,zoom=1-(close?.06:.025)*p.progress;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360)*zoom,dir:HeroPoint=[close?([.14,-.22,.29][p.shot%3]):view==='hero-escape'?-.13:.16,low?.36:close?.035:.12,view==='hero-escape'?-1:1],n=Math.hypot(...dir);
 return {target,position:target.map((x,i)=>x+d*dir[i]/n)as HeroPoint,fov};
}
