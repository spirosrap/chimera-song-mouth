import type {CameraView} from './scene.ts';
import {DOME_TIMELINE} from './dome-timing.ts';
export type TrumanSpeaker='truman'|'christof'|'broadcast-director'|'guard-one'|'guard-two'|'sylvia'|'network-exec';
export type DomePerson=TrumanSpeaker|'bath-viewer';
export type DomePoint=[number,number,number];
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>smooth(a,a+.6,t)*(1-smooth(b-.6,b,t));
export function domeSourceTime(time:number){const t=Math.max(0,Math.min(DOME_TIMELINE.at(-1)![1],Number.isFinite(time)?time:0));let i=0;while(i<DOME_TIMELINE.length-2&&DOME_TIMELINE[i+1][1]<t)i++;const [a,x]=DOME_TIMELINE[i],[b,y]=DOME_TIMELINE[i+1];return a+(b-a)*(t-x)/(y-x);}
export function domePose(time:number){const t=domeSourceTime(time),stepOff=smooth(22,31,t),walk=smooth(34,51,t),climb=smooth(51,63,t),open=smooth(64,66.5,t),leave=smooth(262,266,t),bow=pulse(250.3,258.6,t);let truman:DomePoint=t<31?[-310+75*stepOff,110-7*stepOff,116-78*stepOff]:t<51?[-235+85*walk,103,38]:[-150+382*climb,103+270*climb,38-60*leave];return {t,truman,open,leave,bow,climb,walk,stepOff,
 touch:pulse(0,18,t)+pulse(33,49,t),cry:pulse(4,19,t),lookUp:pulse(83,91,t),turnBack:pulse(127,145,t)+pulse(151,232,t),wave:pulse(238,246.5,t),armsOpen:bow*.75,
 cheer:pulse(267,288,t),screenOff:smooth(299,301,t),thought:pulse(288.5,294,t),sylviaRise:smooth(267,270,t),finger:pulse(73,83,t)+pulse(201,213,t),step:Math.sin(t*5.3),breath:.14*Math.sin(t*1.3)};}
export function domeLocation(view:CameraView){return view==='broadcast-end'?'end':view==='christof'||view==='broadcast-director'||view==='network-exec'||view==='control-room'||view==='control-monitor'?'control':view==='sylvia'?'home':view==='viewers-bar'?'bar':view==='viewer-bath'?'bath':view==='guard-one'||view==='guard-two'||view==='security-room'?'security':'dome';}
export function domeCamera(view:CameraView,aspect:number,time:number){const p=domePose(time),location=domeLocation(view);let target:DomePoint,dir:DomePoint,vertical:number,horizontal:number;
 if(location==='dome'){
  if(view==='dome-sky'){target=[100,760,-20];dir=[0,0,1];vertical=400;horizontal=550;}
  else if(view==='dome-boat'){target=[-300,107,100];dir=[-.65,.20,1];vertical=180;horizontal=255;}
  else if(view==='dome-wall'){target=[p.truman[0]+20,90,10];dir=[-.50,.04,1];vertical=125;horizontal=170;}
  else if(view==='wide'||view==='dome-stairs'){target=[40,208,0];dir=[-.16,.08,1];vertical=265;horizontal=440;}
  else if(view==='dome-exit'){target=[232,342,15];dir=[.05,.02,1];vertical=95;horizontal=95;}
  else {target=[p.truman[0],p.truman[1]+8,p.truman[2]];dir=[-.35,.025,1];vertical=34;horizontal=49;}
 }else if(location==='control'){
  if(view==='control-room'){target=[30,82,-5];dir=[-.25,.16,1];vertical=138;horizontal=265;}
  else if(view==='control-monitor'){target=[-48,78,73];dir=[.12,.06,1];vertical=40;horizontal=69;}
  else{target=view==='broadcast-director'?[133,119,-20]:view==='network-exec'?[-140,119,-15]:[0,111,12];dir=[-.10,.025,1];vertical=34;horizontal=45;}
 }else if(location==='security'){const wide=view==='security-room';target=wide?[0,83,8]:[view==='guard-one'?34:-34,111,8];dir=[0,.04,1];vertical=wide?85:34;horizontal=wide?125:45;}
 else if(location==='home'){target=[0,104+40*p.sylviaRise,0];dir=[0,.025,1];vertical=54;horizontal=68;}
 else if(location==='bath'){target=[0,83,0];dir=[.2,.16,1];vertical=88;horizontal=115;}
 else{target=[0,80,-40];dir=[0,.14,1];vertical=145;horizontal=260;}
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360),length=Math.hypot(...dir);return {location,target,position:target.map((x,i)=>x+dir[i]*distance/length) as DomePoint,fov:36};}
