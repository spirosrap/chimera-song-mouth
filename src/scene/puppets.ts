import type {CameraView} from './scene.ts';
export type PuppetId='mahna'|'snowth-left'|'snowth-right'|'kermit'|'statler'|'waldorf';
export type PuppetPoint=[number,number,number];
export const PUPPET_OFFSET=.35;
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const span=(a:number,b:number,t:number)=>smooth(a,a+.35,t)*(1-smooth(b-.35,b,t));
export function puppetPose(time:number){
 const t=Math.max(0,Math.min(156.221,(Number.isFinite(time)?time:0)-PUPPET_OFFSET));
 const music=t>=6.3&&t<149.4,backstage=t>=128&&t<133.8||t>=137.7&&t<143.5,balcony=t>=149.4;
 const below=span(76,89,t),away=span(90,104,t),exit=span(22.3,27.5,t)+span(46.7,51,t)+span(68.8,76.8,t)+span(103.5,112.3,t);
 const entry=1-smooth(11.7,13.1,t),returning=span(112.4,121,t);
 return {t,music,backstage,balcony,below,away,exit,entry,returning,phase:t*Math.PI*2*1.8,
  lead:[entry*170+exit*230,104-below*62,20-away*280] as PuppetPoint,
  turn:span(104.4,115.5,t),lean:span(52.3,64.8,t),kermitOnStage:span(142.3,148,t),
  main:music&&!backstage,curtain:!music&&!balcony,phone:backstage};
}
export const PUPPET_POSITIONS:Record<PuppetId,PuppetPoint>={mahna:[0,104,20],'snowth-left':[-83,117,3],'snowth-right':[83,117,3],kermit:[0,111,20],statler:[52,113,0],waldorf:[-52,113,0]};
export function puppetCamera(view:CameraView,aspect:number,time:number){
 const q=puppetPose(time);let target:PuppetPoint=[0,107,10],dir:PuppetPoint=[0,.02,1],vertical=93,horizontal=160;
 if(view==='puppet-backstage'||view==='wide'&&q.backstage){target=[0,91,0];vertical=105;horizontal=175;dir=[.12,.08,1];}
 else if(view==='puppet-balcony'||view==='wide'&&q.balcony){target=[0,105,0];vertical=100;horizontal=160;}
 else if(view==='puppet-pair'){target=[0,117,3];vertical=75;horizontal=160;}
 else if(view==='puppet-away'){target=[0,115,-100];vertical=100;horizontal=170;}
 else if(view in PUPPET_POSITIONS){const p=PUPPET_POSITIONS[view as PuppetId];target=[...p];if(q.kermitOnStage>.1){if(view==='kermit'){target[0]=-95;target[2]=30;}if(view==='snowth-left')target[0]=0;}target[1]+=10;vertical=view==='mahna'?58:54;horizontal=view==='mahna'?65:60;if(view==='mahna'){target[0]=q.lead[0];target[1]+=q.lead[1]-104;target[2]=q.lead[2];}}
 else if(q.curtain){target=[0,119,20];vertical=72;horizontal=85;}
 const d=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360),n=Math.hypot(...dir);return {target,position:target.map((x,i)=>x+dir[i]*d/n) as PuppetPoint,fov:36};
}
