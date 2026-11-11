import type {CameraView} from './scene.ts';
export type ThroneSpeaker='oz'|'dorothy'|'scarecrow'|'tin-woodman'|'lion';
export type ThronePoint=[number,number,number];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(a:number,b:number,t:number)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number,edge=.4)=>ease(a,a+edge,t)*(1-ease(b-edge,b,t));

/** The scene's fixed moments. tools/render-oz-scene.ts lays the dialogue out around them and refuses to drift. */
export const THRONE_ROAR=70.5;
/** The screen lands. Everything before this is the show; everything after is the man. */
export const THRONE_CRASH=THRONE_ROAR+2.3;
/** The Tin Woodman's challenge, axe raised. */
export const THRONE_AXE=THRONE_CRASH+2.2;
/** "I pulled a thread, to make the eyes move and the mouth open": the dead Head moves once more. */
export const THRONE_DEMO:[number,number]=[139.12,143.8];

/** The great Head hangs over the throne by a wire. Centimetres; the travellers face -z. */
export const THRONE_HEAD:ThronePoint=[0,212,-150];
export const THRONE_HEAD_RADIUS=46;
/** Head centres. The little man stands in the corner the screen hides. */
export const THRONE_PEOPLE:Record<ThroneSpeaker,{position:ThronePoint;scale:number}>={
 scarecrow:{position:[-112,158,48],scale:1},
 dorothy:{position:[-58,116,40],scale:.82},
 'tin-woodman':{position:[-2,166,44],scale:1},
 lion:{position:[56,150,50],scale:1.08},
 oz:{position:[215,128,-110],scale:.88},
};
const ROW:ThronePoint=[-28,0,46];
/** The screen stands between the man and the row, and is short enough to fall clear of them. */
export const THRONE_SCREEN_HEIGHT=150;
export const THRONE_SCREEN:ThronePoint=(()=>{const o=THRONE_PEOPLE.oz.position,d=Math.hypot(ROW[0]-o[0],ROW[2]-o[2]);return [o[0]+(ROW[0]-o[0])/d*30,0,o[2]+(ROW[2]-o[2])/d*30] as ThronePoint;})();
const toward=(from:ThronePoint,to:ThronePoint)=>Math.atan2(to[0]-from[0],to[2]-from[2]);
const OZ_YAW=toward(THRONE_PEOPLE.oz.position,ROW);

/** Every pose is a function of the scene clock, so pausing and backwards seeks restore the room exactly. */
export function thronePose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),fall=ease(THRONE_ROAR+1.25,THRONE_CRASH,t),after=Math.max(0,t-THRONE_CRASH);
 const run=ease(THRONE_ROAR+.35,THRONE_ROAR+1.45,t),home=ease(THRONE_CRASH+3,THRONE_CRASH+6,t);
 const dog=THRONE_PEOPLE.dorothy.position,from:ThronePoint=[dog[0]+16,0,dog[2]-14],to:ThronePoint=[THRONE_SCREEN[0]-20,0,THRONE_SCREEN[2]+16],k=run*(1-home*.55);
 return {t,
  /** 0 = the screen stands, 1 = flat on the floor; it accelerates as it goes. */
  fall:fall*fall,
  /** The show's power: the Head's glow and the drone, cut when the screen lands. */
  power:1-ease(THRONE_CRASH-.05,THRONE_CRASH+.7,t),
  /** The travellers turn from the throne to the corner. */
  turn:ease(THRONE_CRASH+.15,THRONE_CRASH+1.5,t),
  /** The dead Head swings on its wire after the crash, then settles. */
  sway:Math.sin(after*2.1)*.09*Math.exp(-after/9)*(t>THRONE_CRASH?1:0),
  roar:pulse(THRONE_ROAR-.1,THRONE_ROAR+2,t,.3),
  axe:pulse(THRONE_AXE-.7,THRONE_AXE+3.4,t,.5),
  cower:pulse(THRONE_CRASH+.3,THRONE_AXE+7,t,.8),
  demo:pulse(THRONE_DEMO[0],THRONE_DEMO[1],t,.5),
  toto:[from[0]+(to[0]-from[0])*k,Math.abs(Math.sin(run*Math.PI*4))*7*(run<1?1:0),from[2]+(to[2]-from[2])*k] as ThronePoint,
 };
}
/** Which way a figure faces: 0 looks down +z, π looks at the throne. */
export function throneYaw(id:ThroneSpeaker,time:number):number{
 if(id==='oz')return OZ_YAW;
 const p=THRONE_PEOPLE[id].position,turn=thronePose(time).turn;
 return Math.PI+(toward(p,THRONE_PEOPLE.oz.position)-Math.PI)*turn;
}
export function throneCamera(view:CameraView,aspect:number,time:number){
 const pose=thronePose(time),fov=36;
 let target:ThronePoint,dir:ThronePoint,vertical:number,horizontal:number;
 if(view==='throne-head'){target=[THRONE_HEAD[0],THRONE_HEAD[1]-8,THRONE_HEAD[2]];dir=[.22+Math.sin(time*.05)*.04,-.3,1];vertical=135;horizontal=150;}
 else if(view==='throne-row'){target=[ROW[0],128,ROW[2]];dir=[.75*pose.turn,.06,-1+.45*pose.turn];vertical=135;horizontal=250+60*pose.turn;}
 else if(view==='oz'||view==='dorothy'||view==='scarecrow'||view==='tin-woodman'||view==='lion'){
  const p=THRONE_PEOPLE[view],yaw=throneYaw(view,time)+(view==='oz'?-.3:view==='dorothy'||view==='tin-woodman'?.22:-.22);
  target=[p.position[0],p.position[1]+(view==='oz'?3-9*pose.cower:view==='tin-woodman'?9:view==='scarecrow'?8:4),p.position[2]];dir=[Math.sin(yaw),.03,Math.cos(yaw)];vertical=view==='oz'?56:(view==='tin-woodman'||view==='scarecrow'?50:40)*p.scale;horizontal=view==='oz'?70:50*p.scale;
 }else{target=[10,125,-40];dir=[.15,.2,1];vertical=400;horizontal=560;}
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360)/2,norm=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*distance/norm) as ThronePoint,fov};
}
