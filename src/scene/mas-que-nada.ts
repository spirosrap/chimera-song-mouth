import type {CameraView} from './scene.ts';

export type MendesPoint=[number,number,number];
export type MendesPlace='stage'|'piano'|'singers'|'jungle'|'band';
export const MENDES_DURATION=155.434;

/** Edits inspected in the supplied sepia performance, on its absolute source clock. */
export const MENDES_SHOTS:[number,MendesPlace][]=[
 [0,'piano'],[18,'stage'],[30,'singers'],[40,'stage'],[55,'band'],[65,'piano'],
 [75,'stage'],[82,'jungle'],[90,'stage'],[105,'singers'],[120,'piano'],[130,'jungle'],[140,'stage'],
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));

/** Pure source-time choreography: seeking never integrates or inherits a previous shot. */
export function mendesPose(time:number){
 const t=Math.max(0,Math.min(MENDES_DURATION,Number.isFinite(time)?time:0));
 const shot=MENDES_SHOTS.reduce((best,[start],i)=>t>=start?i:best,0),[start,place]=MENDES_SHOTS[shot];
 const progress=ease(start,MENDES_SHOTS[shot+1]?.[0]??MENDES_DURATION,t);
 const vocal=Math.min(1,pulse(18,55,t)+pulse(75,120,t)+pulse(140,153,t));
 return {t,place,shot,progress,vocal,
  sway:Math.sin(t*.53)*.025,turn:Math.sin(t*.29)*.11,nod:Math.sin(t*.41)*.035,
  gesture:vocal*(.45+.35*Math.sin(t*.83)),step:Math.sin(t*1.7),
  keys:.5+.5*Math.sin(t*5.2),leaves:Math.sin(t*.37),
  fade:ease(0,1.2,t)*(1-ease(152.8,155.35,t))};
}

export function mendesPlace(view:CameraView,time:number):MendesPlace{
 const manual:Partial<Record<CameraView,MendesPlace>>={lani:'stage','mendes-stage':'stage','mendes-piano':'piano','mendes-singers':'singers','mendes-jungle':'jungle','mendes-band':'band'};
 return manual[view]??mendesPose(time).place;
}

/** Close-ups retain the whole airway in both landscape and portrait; movement is a gentle source-time zoom. */
export function mendesCamera(view:CameraView,aspect:number,time:number){
 const p=mendesPose(time),place=mendesPlace(view,time),a=Number.isFinite(aspect)&&aspect>0?aspect:16/9;
 const singerClose=view==='lani'||view==='wide'&&place==='stage',pianoClose=view==='mendes-piano'||view==='wide'&&place==='piano';
 const target:MendesPoint=singerClose?(place==='singers'?[-55,162,30]:place==='jungle'?[-45,162,20]:[0,162,35]):
  pianoClose?[0,94,8]:place==='stage'?[0,132,10]:place==='singers'?[0,137,15]:place==='jungle'?[0,145,-40]:place==='band'?[0,123,-55]:[0,92,-5];
 const hh=singerClose?80:pianoClose?60:place==='singers'?105:place==='jungle'?150:place==='band'?130:100;
 const hw=singerClose?60:pianoClose?170:place==='singers'?195:place==='jungle'?330:place==='band'?360:place==='stage'?155:240;
 const fov=38,zoom=(singerClose?1-.075*p.progress:1-.035*p.progress);
 const d=Math.max(hh,hw/Math.max(.4,a))/Math.tan(fov*Math.PI/360)*zoom;
 const side=singerClose?[.10,-.20,.25,-.10][p.shot%4]:pianoClose?.18:place==='jungle'?.24:.12;
 const drift=(p.progress-.5)*(view==='wide'||view==='lani'?1:.35),direction:MendesPoint=[side+drift*.035,singerClose?.025:pianoClose?.16:.09,1],length=Math.hypot(...direction);
 return {target,position:target.map((x,i)=>x+d*direction[i]/length) as MendesPoint,fov};
}
