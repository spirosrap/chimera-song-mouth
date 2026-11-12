import type {CameraView} from './scene.ts';

export type MansionPoint=[number,number,number];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a:number,b:number,t:number)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
const pulse=(t:number,at:number,width:number)=>Math.max(0,1-Math.abs(t-at)/width);

/** Absolute source seconds: the supplied extended video retains its dramatic opening. */
export function mansionPose(time:number){
 const t=clamp(Number.isFinite(time)?time:0,0,459.4);
 const exterior=t<43,bed=t>=43&&t<65,mirror=t>=110&&t<131;
 const memory=t>=171&&t<207||t>=248&&t<263||t>=349&&t<370;
 const ghost=t>=218&&t<238||t>=314&&t<324||t>=425&&t<444;
 const corridor=t>=155&&t<171||t>=207&&t<238||t>=279&&t<295||t>=310&&t<349||t>=393;
 const window=t>=82&&t<100||t>=263&&t<279||t>=370&&t<393;
 const walk=corridor?.5+.5*Math.sin(t*1.9):0;
 const position:MansionPoint=bed?[-130,76,40]:mirror?[110,153,-80]:corridor?[Math.sin(t*.25)*22,151,60-170*smooth(393,431,t)]:window?[-100,153,-65]:[0,153,85];
 const lightning=Math.max(...[4.1,16.5,28.4,38.8,40.0,87.5,164,222.8,272,318.4,360.2,428].map(at=>pulse(t,at,.13)+.45*pulse(t,at+.24,.08)));
 const door=smooth(426,436,t)*(1-smooth(439,449,t));
 const fade=smooth(0,2,t)*(1-smooth(450,459,t));
 return {t,exterior,bed,mirror,memory,ghost,corridor,window,walk,position,lightning,door,fade,
  storm:exterior?1:.35,ride:clamp((t-10)/29),crash:t>=38.8&&t<43,
  turn:bed?0:mirror?-.6:window?.55:.15*Math.sin(t*.3),
  reach:ghost?.8:mirror?.55:.22+.35*(.5+.5*Math.sin(t*.6)),
  photo:t>=99&&t<110||t>=376&&t<389,
  curtain:1+Math.sin(t*1.6)*.3+Math.sin(t*.51)*.22,
 };
}

/** Framing is derived from scene dimensions, including narrow screens. */
export function mansionCamera(view:CameraView,aspect:number,time:number){
 const p=mansionPose(time);let target:MansionPoint=[0,145,-40],vertical=180,horizontal=300,dir:MansionPoint=[.24,.1,1];
 if(view==='celine'){
  target=[p.position[0],p.position[1]+10,p.position[2]];vertical=27;horizontal=35;dir=[.08,.03,1];
 }else if(view==='mansion-exterior'||view==='mansion-road'||view==='wide'&&p.exterior){
  target=view==='mansion-road'?[0,65,50]:[0,195,-50];vertical=view==='mansion-road'?150:245;horizontal=view==='mansion-road'?260:460;dir=[.32,.1,1];
 }else if(view==='mansion-bedroom'||view==='wide'&&p.bed){
  target=[-65,94,38];vertical=80;horizontal=135;dir=[.35,.45,1];
 }else if(view==='mansion-mirror'||view==='wide'&&p.mirror){
  target=[91,158,-95];vertical=105;horizontal=180;dir=[-.55,.05,1];
 }else if(view==='mansion-memory'||view==='wide'&&p.memory){
  target=[0,147,65];vertical=110;horizontal=160;dir=[-.2,.05,1];
 }else if(view==='mansion-window'||view==='wide'&&p.window){
  target=[-78,165,-95];vertical=170;horizontal=250;dir=[.45,.05,1];
 }else if(view==='mansion-corridor'||view==='wide'&&p.corridor){
  target=[0,148,-130];vertical=175;horizontal=270;dir=[.06,.02,1];
 }else if(view==='mansion-stairs'){
  target=[-145,150,-180];vertical=175;horizontal=240;dir=[.55,.18,1];
 }
 const d=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(38*Math.PI/360),n=Math.hypot(...dir);
 return {target,position:target.map((x,i)=>x+dir[i]*d/n) as MansionPoint,fov:38};
}
