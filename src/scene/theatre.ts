import {THEATRE_BEATS} from './theatre-beats.ts';
import type {CameraView} from './scene.ts';
export type TheatreSpeaker='frontier-headmaster'|'frontier-mother'|'frontier-cowboy'|'frontier-doctor'|'frontier-announcer'|'frontier-parrot';
export type TheatrePoint=[number,number,number];
export const THEATRE_OFFSET=.35;
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>smooth(a,a+.3,t)*(1-smooth(b-.3,b,t));
export function theatreBeat(time:number){const t=Number.isFinite(time)?time:0;let i=0;while(i<THEATRE_BEATS.length-2&&THEATRE_BEATS[i+1]<t)i++;return i+(t-THEATRE_BEATS[i])/(THEATRE_BEATS[i+1]-THEATRE_BEATS[i]);}
export function theatrePose(time:number){const t=Math.max(0,Math.min(257.578957,(Number.isFinite(time)?time:0)-THEATRE_OFFSET)),phase=theatreBeat(t)*Math.PI*2;return {t,phase,open:smooth(8,14,t)*(1-smooth(239,248,t)),beat:.5+.5*Math.sin(phase),ghosts:pulse(46,56,t)+pulse(165,175,t),turtle:pulse(56,66,t),cowboys:pulse(66,86,t),board:pulse(84,98,t),dancers:pulse(106,119,t),scratch:smooth(187,195,t)*(1-smooth(233,240,t)),bird:pulse(178,235,t),point:pulse(19,28,t)+pulse(36,42,t)+pulse(88,103,t),monochrome:1-smooth(41,47,t)};}
export const THEATRE_POSITIONS:Record<TheatreSpeaker,TheatrePoint>={'frontier-headmaster':[0,109,100],'frontier-mother':[205,115,-125],'frontier-cowboy':[-95,110,90],'frontier-doctor':[95,110,90],'frontier-announcer':[-30,110,90],'frontier-parrot':[145,105,145]};
export function theatreCamera(view:CameraView,aspect:number,time:number){let target:TheatrePoint,dir:TheatrePoint=[.12,.05,1],vertical:number,horizontal:number;
 if(view==='theatre-curtain'){target=[0,155,270];vertical=180;horizontal=420;dir=[0,0,1];}
 else if(view in THEATRE_POSITIONS){const p=THEATRE_POSITIONS[view as TheatreSpeaker];target=[p[0],p[1]+8,p[2]];vertical=35;horizontal=48;}
 else if(view==='theatre-turtle'){target=[-135,34,135];vertical=66;horizontal=105;}
 else if(view==='theatre-ghosts'){target=[-155,84,20];vertical=120;horizontal=180;}
 else if(view==='theatre-cowboys'){target=[0,91,90];vertical=125;horizontal=180;}
 else if(view==='theatre-drums'){target=[205,94,-115];vertical=110;horizontal=120;dir=[-.18,.12,1];}
 else if(view==='theatre-blackboard'){target=[0,128,-200];vertical=120;horizontal=200;}
 else if(view==='theatre-dancers'){target=[-125,90,135];vertical=133;horizontal=200;}
 else if(view==='theatre-megaphone'){target=[-30,104,107];vertical=65;horizontal=86;}
 else if(view==='theatre-turntable'){target=[0,95,185];vertical=75;horizontal=115;dir=[.1,1,.9];}
 else if(view==='theatre-orchestra'){target=[-80,89,-110];vertical=135;horizontal=250;dir=[-.2,.15,1];}
 else{target=[0,130,-35];vertical=205;horizontal=385;dir=[0,.13,1];}
 const d=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360),n=Math.hypot(...dir);return {target,position:target.map((x,i)=>x+dir[i]*d/n) as TheatrePoint,fov:36};}
