import type {CameraView} from './scene.ts';
export type TitanicPoint=[number,number,number];
export type TitanicPlace='deck'|'sunset'|'stars';
export type TitanicView='celine-sea'|'titanic-deck'|'titanic-bow'|'titanic-stars'|'titanic-sunset'|'titanic-dissolve';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const window=(a:number,b:number,t:number)=>ease(a,a+2,t)*(1-ease(b-2,b,t));
export const TITANIC_SHOTS:[number,TitanicView][]=[
 [0,'celine-sea'],[9,'titanic-bow'],[23,'celine-sea'],[34,'titanic-bow'],[39,'celine-sea'],[48,'titanic-deck'],[55,'titanic-dissolve'],[65,'celine-sea'],[78,'titanic-sunset'],[89,'titanic-deck'],[96,'celine-sea'],[107,'titanic-stars'],[113,'titanic-sunset'],[120,'titanic-deck'],[128,'titanic-stars'],[138,'celine-sea'],[146,'titanic-sunset'],[159,'celine-sea'],[170,'titanic-sunset'],[178,'titanic-stars'],[184,'titanic-dissolve'],[187,'titanic-bow'],[194,'celine-sea'],[201,'titanic-stars'],[211,'titanic-stars'],[224,'titanic-sunset'],[233,'titanic-deck'],[241,'titanic-dissolve'],[250,'titanic-bow'],[256,'titanic-stars'],[265,'celine-sea'],[274,'titanic-dissolve']
];
export function titanicPose(time:number){
 const t=Math.max(0,Math.min(280.92,Number.isFinite(time)?time:0)),shot=TITANIC_SHOTS.reduce((best,[start],i)=>t>=start?i:best,0),[start,view]=TITANIC_SHOTS[shot],progress=ease(start,TITANIC_SHOTS[shot+1]?.[0]??280.92,t);
 const stars=t>=107&&t<113||t>=128&&t<138||t>=178&&t<187||t>=201&&t<224||t>=256&&t<265;
 const place:TitanicPlace=view==='titanic-bow'||view==='titanic-deck'?'deck':view==='titanic-stars'||stars?'stars':'sunset';
 const echo=Math.max(window(55,65,t),window(182,191,t),window(241,250,t),window(274,280.5,t));
 return {t,shot,view,place,progress,echo,open:Math.max(window(146,158,t)*.65,window(202,224,t),window(229,235,t)*.5),heart:Math.max(window(37,48,t),window(169,178,t),window(192,205,t)),grip:view==='titanic-bow',sway:Math.sin(t*.38)*.012,wind:.7+.3*Math.sin(t*.51),fade:ease(0,.8,t)*(1-ease(278.2,280.65,t))};
}
export function titanicPlace(view:CameraView,time:number):TitanicPlace{
 return view==='titanic-bow'||view==='titanic-deck'?'deck':view==='titanic-stars'?'stars':view==='titanic-sunset'||view==='titanic-dissolve'?'sunset':titanicPose(time).place;
}
export function titanicCamera(view:CameraView,aspect:number,time:number){
 const p=titanicPose(time),place=titanicPlace(view,time),bow=view==='titanic-bow',echo=view==='titanic-dissolve',close=view==='celine-sea'||place!=='deck'&&view!=='titanic-deck';
 const target:TitanicPoint=bow?[0,85,10]:close?[echo?-20:0,162,5]:[0,95,0];
 const hh=bow?155:echo?61:close?43:109,hw=bow?345:echo?103:close?55:225,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360)*(1-p.progress*(close?.055:.018));
 const dir:TitanicPoint=bow?[.82,-.18,1]:close?[p.shot%3===0?-.13:.23,.03,1]:[.19,.1,1],n=Math.hypot(...dir);
 return {target,position:target.map((x,i)=>x+d*dir[i]/n)as TitanicPoint,fov};
}
