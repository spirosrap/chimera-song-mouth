import type {CameraView} from './scene.ts';
export type SupermanId='laurie'|'superman-pulse';
export type SupermanPoint=[number,number,number];
export const SUPERMAN_OFFSET=.35;
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** Source-clock cuts and gestures; no accumulated animation state when seeking. */
export function supermanPose(time:number){
 const t=Math.max(0,Math.min(507,(Number.isFinite(time)?time:0)-SUPERMAN_OFFSET));
 const darkFace=t>=99&&t<141, silhouette=t>=141&&t<161, closeFace=t>=161&&t<184;
 const red=t>=141&&t<161||t>=184&&t<235||t>=439,abstract=t>=263&&t<319,blue=t>=319&&t<338;
 const inset=t>=235&&t<263,handOnly=t>=411,profile=t>=82&&t<99;
 const performer=t>=26&&t<218||inset||t>=319&&t<411;
 const hand=t>=44&&t<82||t>=184&&t<218||t>=367;
 const mode=t>=66&&t<82||t>=184&&t<218||t>=435&&t<478||t>=490&&t<500?2:t>=404&&t<435||t>=478&&t<490?1:0;
 const lift=hand?(mode===1?.72:mode===2?.95:.48):silhouette?.8:0;
 return {t,darkFace,silhouette,closeFace,red,abstract,blue,inset,handOnly,profile,performer,hand,lift,mode,
  circle:t<82||t>=184&&t<218||inset||abstract||t>=338,
  keyboard:profile||silhouette||t>=338&&t<411,
  bow:blue?Math.sin(Math.PI*Math.min(1,(t-319)/19))*.7:0,
  fade:1-smooth(503,507,t),turn:profile?.95:.04*Math.sin(t*.35),
  position:[inset?115:darkFace||silhouette||closeFace||blue?0:-68,inset?158:darkFace||closeFace?103:100,35] as SupermanPoint,
  circlePosition:[t<26||abstract||handOnly?0:49,t<26||abstract||handOnly?137:164,-95] as SupermanPoint,
  handAngle:mode===0?-.25:mode===1?-1.25:t>=462&&t<478?-.85:.12,
 };
}
export function supermanCamera(view:CameraView,aspect:number,time:number){
 const p=supermanPose(time);let target:SupermanPoint=[0,125,0],vertical=145,horizontal=195,dir:SupermanPoint=[0,0,1];
 if(view==='laurie'||view==='superman-profile'||view==='wide'&&(p.darkFace||p.closeFace)){
  target=[p.position[0],p.position[1]+10,35];vertical=52;horizontal=58;if(view==='superman-profile')dir=[1,.02,.5];
 }else if(view==='superman-circle'||view==='superman-hands'||view==='superman-pulse'||view==='wide'&&(p.handOnly||p.abstract||p.t<26)){
  target=[...p.circlePosition];vertical=105;horizontal=110;
 }else if(view==='superman-keyboard'){target=[p.position[0],76,35];vertical=73;horizontal=100;dir=[.4,.24,1];}
 else if(view==='superman-silhouette'){target=[0,110,0];vertical=100;horizontal=120;}
 const d=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360),n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*d/n) as SupermanPoint,fov:36};
}
