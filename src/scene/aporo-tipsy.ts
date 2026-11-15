import type {CameraView} from './scene.ts';
export type TipsyPoint=[number,number,number];
export const TIPSY_SHOTS:[number,CameraView][]=[
 [0,'tipsy-title'],[3,'tipsy-plane'],[9,'tipsy-singer'],[16,'tipsy-mouth'],[29,'tipsy-keyboard'],[35,'tipsy-guitar'],[43,'tipsy-singer'],[49,'tipsy-audience'],[55,'tipsy-keys-close'],[61,'tipsy-singer'],[68,'tipsy-drums'],[75,'tipsy-keyboard'],[80,'tipsy-bass'],[83,'tipsy-band'],[89,'tipsy-bass'],[95,'tipsy-guitar'],[103,'tipsy-guitar-close'],[108,'tipsy-credits'],[114,'tipsy-singer'],[119,'tipsy-credits'],[121,'tipsy-singer']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function tipsyPose(time:number){const t=Math.max(0,Math.min(124.2,Number.isFinite(time)?time:0)),beat=(t-9)*144/60,phase=t<3?'title':t<9?'plane':t<108?'stage':'credits';return{t,beat,phase,root:[Math.sin(t*.27)*5,150+Math.sin(beat*Math.PI)*.7,45]as TipsyPoint,nod:Math.sin(beat*Math.PI)*.025,turn:Math.sin(t*.44)*.08,tilt:Math.sin(t*.6)*.035,headbang:Math.sin(beat*Math.PI)*.18,pluck:Math.sin(beat*TAU),stick:Math.max(0,Math.sin(beat*TAU)),fade:ease(0,.45,t)*(1-ease(123.35,124,t))};}
const TAU=Math.PI*2;
export function tipsySet(view:CameraView,time:number){return view==='tipsy-title'?'title':view==='tipsy-plane'?'plane':view==='tipsy-credits'?'credits':view==='wide'?tipsyPose(time).phase:'stage';}
export function tipsyCamera(view:CameraView,aspect:number,time:number){const p=tipsyPose(time);let target:TipsyPoint=[0,104,-30],hh=136,hw=300,dir:TipsyPoint=[.08,.05,1];
 if(view==='tipsy-singer'||view==='tipsy-mouth'){target=[p.root[0],p.root[1]+10,p.root[2]];hh=view==='tipsy-mouth'?22:31;hw=view==='tipsy-mouth'?29:39;dir=[.12,.03,1];}
 else if(view==='tipsy-guitar'||view==='tipsy-guitar-close'){target=[126,view==='tipsy-guitar-close'?83:115,-20];hh=view==='tipsy-guitar-close'?43:77;hw=view==='tipsy-guitar-close'?62:105;dir=[-.2,.09,1];}
 else if(view==='tipsy-bass'){target=[-109,116,-30];hh=78;hw=110;dir=[.2,.07,1];}
 else if(view==='tipsy-keyboard'||view==='tipsy-keys-close'){target=[-170,view==='tipsy-keys-close'?96:122,-113];hh=view==='tipsy-keys-close'?35:74;hw=view==='tipsy-keys-close'?69:108;dir=[.5,.35,1];}
 else if(view==='tipsy-drums'){target=[53,92,-135];hh=94;hw=138;dir=[-.25,.55,1];}
 else if(view==='tipsy-audience'){target=[-230,100,90];hh=92;hw=150;dir=[.25,.12,-1];}
 else if(view==='tipsy-title'||view==='tipsy-credits'){target=[0,10,0];hh=64;hw=110;dir=[0,0,1];}
 else if(view==='tipsy-plane'){target=[0,75,-30];hh=112;hw=220;dir=[0,.08,1];}
 const fov=34,effective=Math.max(.42,Math.min(16/9,aspect)),d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((v,i)=>v+dir[i]*d/n)as TipsyPoint,fov};}
