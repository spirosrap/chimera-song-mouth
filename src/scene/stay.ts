import type {CameraView} from './scene.ts';
export type StayId='marcella'|'siobhan';
export type StayPoint=[number,number,number];
export type StayPlace='bedside'|'tunnel'|'struggle'|'embrace';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export const STAY_SHOTS:[number,CameraView][]=[
 [0,'stay-earth'],[9,'stay-bed'],[17,'marcella'],[26,'stay-pillow'],[35,'marcella'],[44,'stay-bed'],[49,'marcella'],[58,'stay-bed'],[64,'stay-overhead'],[73,'marcella'],[83,'stay-bed'],[88,'marcella'],[99,'stay-bed'],[108,'marcella'],[119,'stay-tunnel'],[125,'siobhan'],[132,'stay-tunnel'],[140,'siobhan'],[147,'stay-tunnel'],[154,'siobhan'],[161,'stay-tunnel'],[170,'siobhan'],[179,'stay-struggle'],[186,'marcella'],[192,'stay-bed'],[199,'stay-struggle'],[205,'stay-revival'],[212,'stay-embrace'],[219,'marcella'],[226,'stay-embrace'],[234,'stay-tunnel']
];
/** Absolute source time keeps the entrance, struggle and revival stable after seeks. */
export function stayPose(time:number){
 const t=Math.max(0,Math.min(238.3,Number.isFinite(time)?time:0)),shot=STAY_SHOTS.reduce((n,[at],i)=>t>=at?i:n,0),[start,view]=STAY_SHOTS[shot];
 const place:StayPlace=t<119?'bedside':t<179?'tunnel':t<208?'struggle':'embrace';
 const struggle=ease(179,184,t)*(1-ease(203,208,t)),revival=ease(204,211,t),embrace=ease(209,216,t),retreat=ease(198,208,t);
 const marcella:StayPoint=embrace>.01?[-38+embrace*27,123+embrace*14,70]:[-55,139,5];
 const siobhan:StayPoint=place==='tunnel'?[0,153,-50+ease(119,179,t)*90]:[90-ease(179,185,t)*115+retreat*275,146,-5-retreat*200];
 return {t,shot,view,place,struggle,revival,embrace,retreat,marcella,siobhan,progress:ease(start,STAY_SHOTS[shot+1]?.[0]??238,t),plead:.5+.5*Math.sin(t*.67),threat:.5+.5*Math.sin(t*.85),fade:ease(0,1.3,t)*(1-ease(234,237.95,t))};
}
export function stayPlace(view:CameraView,time:number):StayPlace{
 if(view==='stay-tunnel'||view==='siobhan')return 'tunnel';
 if(view==='stay-struggle')return 'struggle';
 if(view==='stay-embrace'||view==='stay-revival')return 'embrace';
 if(view==='stay-earth'||view==='stay-bed'||view==='stay-pillow'||view==='stay-overhead')return 'bedside';
 return stayPose(time).place;
}
export function stayCamera(view:CameraView,aspect:number,time:number){
 const p=stayPose(time),place=stayPlace(view,time),close=view==='marcella'||view==='siobhan',who=view==='siobhan'?p.siobhan:p.marcella,earth=view==='stay-earth',over=view==='stay-overhead',pillow=view==='stay-pillow',revival=view==='stay-revival';
 const target:StayPoint=earth?[-160,203,-565]:close?[who[0],who[1]+12,who[2]]:pillow?[-95,107,33]:place==='tunnel'?[0,135,-60]:revival?[4,125,34]:[0,111,6];
 const fov=38,effective=Math.max(.42,Math.min(656/480,aspect)),hh=earth?150:close?34:pillow?65:place==='tunnel'?165:140,hw=earth?190:close?42:pillow?114:place==='tunnel'?240:285,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360)*(1-p.progress*.025),dir:StayPoint=over?[.08,1,.2]:earth?[0,0,1]:close?[view==='siobhan'?-.07:.1,.025,1]:pillow?[-.35,.32,1]:[.2,.16,1],n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+d*dir[i]/n)as StayPoint,fov};
}
