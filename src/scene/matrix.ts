import type {CameraView} from './scene.ts';
export type MatrixPerson='neo'|'spoon-boy'|'oracle-assistant';
export type MatrixPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const lerp=(a:MatrixPoint,b:MatrixPoint,t:number)=>a.map((x,i)=>x+(b[i]-x)*t) as MatrixPoint;
export const matrixWorld=(point:MatrixPoint,position:MatrixPoint,yaw:number):MatrixPoint=>[position[0]+point[0]*Math.cos(yaw)+point[2]*Math.sin(yaw),position[1]+point[1],position[2]-point[0]*Math.sin(yaw)+point[2]*Math.cos(yaw)];
/** Source-clock poses preserve the demonstration, handoff, lesson and final invitation. */
export function matrixPose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),sit=ease(15.1,19,t),take=ease(14.8,18.6,t),lift=ease(1.7,5,t),lookUp=ease(62.4,64.2,t)*(1-ease(67.2,69,t));
 const boy:MatrixPoint=[-46,48,0],neo:MatrixPoint=[70-25*ease(5,18,t),100-44*sit,35-27*ease(5,18,t)],assistant:MatrixPoint=[-142,100,65-18*ease(61,62.4,t)];
 const boyYaw=1.0,neoYaw=-1.03-.25*lookUp,assistantYaw=1.65;
 const boyHand:MatrixPoint=[-4,-43+38*lift,22],neoHand:MatrixPoint=[-6,-12,25];
 const base=lerp(matrixWorld(boyHand,boy,boyYaw),matrixWorld(neoHand,neo,neoYaw),take);
 const lean=-(1-lift)*1.45+1.15*ease(19,22,t)*(1-ease(48,51,t));
 const bend=.95*ease(7.1,9.8,t)*(1-ease(11.6,13.8,t))+.95*ease(53,57.7,t);
 return {t,sit,take,lift,lookUp,boy,neo,assistant,boyYaw,neoYaw,assistantYaw,boyHand,neoHand,base,lean,bend,spoonYaw:boyYaw+(neoYaw-boyYaw)*take,assistantVisible:t>=61.6};
}
export function spoonBowl(bend:number):{center:MatrixPoint;side:MatrixPoint;along:MatrixPoint}{
 const x=Math.abs(bend)<1e-6?0:17/bend*(1-Math.cos(bend)),y=Math.abs(bend)<1e-6?17:17/bend*Math.sin(bend);
 return {center:[x+4.2*Math.sin(bend),y+4.2*Math.cos(bend),0],side:[Math.cos(bend),-Math.sin(bend),0],along:[Math.sin(bend),Math.cos(bend),0]};
}
export function matrixSpoonPoint(time:number,point?:MatrixPoint):MatrixPoint{
 const p=matrixPose(time),v=point??spoonBowl(p.bend).center;
 return matrixWorld([v[0]*Math.cos(p.lean)-v[1]*Math.sin(p.lean),v[0]*Math.sin(p.lean)+v[1]*Math.cos(p.lean),v[2]],p.base,p.spoonYaw);
}
export function matrixCamera(view:CameraView,aspect:number,time:number){
 const p=matrixPose(time),floor=view==='matrix-floor',spoon=view==='matrix-spoon',wide=view==='wide',assistant=view==='oracle-assistant';
 const person=view==='spoon-boy'?p.boy:assistant?p.assistant:p.neo;
 const reflection=spoon&&p.t>=50,bowl=spoonBowl(p.bend).center;
 const target:MatrixPoint=floor?[-44,2,24]:spoon?matrixSpoonPoint(time,reflection?bowl:bowl.map(x=>x*.5) as MatrixPoint):wide?[-15,53,0]:[person[0],person[1]+4,person[2]];
 const fov=36,vertical=floor?26:reflection?6.4:spoon?18:wide?113:36,horizontal=floor?40:reflection?9:spoon?24:wide?206:43;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const d:MatrixPoint=floor?[.1,1,.6]:spoon?[Math.sin(p.spoonYaw),.035,Math.cos(p.spoonYaw)]:wide?[.13,.10,1]:view==='spoon-boy'?[.66,.035,1]:assistant?[1,.04,.3]:[-.72,.035,1],length=Math.hypot(...d);
 return {target,position:target.map((x,i)=>x+d[i]*distance/length) as MatrixPoint,fov};
}
