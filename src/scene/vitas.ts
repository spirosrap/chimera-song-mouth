import type {CameraView} from './scene.ts';
export type VitasPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,c:number,d:number,t:number)=>ease(a,b,t)*(1-ease(c,d,t));
/** Poses follow the supplied full video, never accumulated frame time. */
export function vitasPose(time:number){
 const t=Math.max(0,Math.min(249.65,Number.isFinite(time)?time:0));
 const raise=pulse(65,68,74,78,t)+pulse(154,158,162,165,t)+pulse(216,218,222,225,t)+ease(246,248,t);
 const spread=pulse(79,82,88,92,t)+pulse(147,150,153,156,t)+pulse(233,237,245,247,t);
 const chorus=pulse(34,37,61,64,t)+pulse(126,129,153,156,t)+pulse(181,184,213,216,t);
 const turn=pulse(56,58,62,64,t)*.8-pulse(88,90,94,97,t)*.8+pulse(128,130,133,135,t)*.75+pulse(216,219,223,226,t)*2.8;
 return {t,raise,spread,chorus,turn,lean:.08*Math.sin(t*1.3)+.19*pulse(185,188,201,205,t),bounce:(.5+.5*Math.sin(t*Math.PI*4.3))*chorus,
  left:pulse(17,20,24,27,t)+pulse(103,106,111,114,t),chest:pulse(129,131,134,136,t),
  fade:1-ease(248.9,249.3,t),ending:ease(233,237,t)};
}
export function vitasCamera(view:CameraView,aspect:number,time:number){
 const p=vitasPose(time),close=view==='vitas',body=view==='vitas-performer',dancers=view==='vitas-dancers',audience=view==='vitas-audience';
 const target:VitasPoint=close?[0,147+p.bounce*1.5,55]:body?[0,83,55]:dancers?[-130,102,-65]:audience?[90,48,265]:[0,111,-45];
 const hh=close?33:body?100:dancers?128:audience?72:195,hw=close?42:body?92:dancers?205:audience?185:360,fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360),direction:VitasPoint=close?[.12+Math.sin(p.t*.04)*.03,.025,1]:body?[.18,.08,1]:dancers?[.2,.12,1]:audience?[.2,.12,-1]:[.12+Math.sin(p.t*.025)*.08,.25,1];
 const len=Math.hypot(...direction);return {target,position:target.map((x,i)=>x+d*direction[i]/len) as VitasPoint,fov};
}
