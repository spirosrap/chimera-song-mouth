import type {CameraView} from './scene.ts';
export type JeTaimePoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** The complete supplied studio edit, including its leader and closing fade. */
export function jeTaimePose(time:number){const t=Math.max(0,Math.min(300.45,Number.isFinite(time)?time:0));return{t,copies:t>=204&&t<264,sway:Math.sin(t*.45)*.024,turn:Math.sin(t*.23)*.13,nod:Math.sin(t*.36)*.05,open:ease(110,118,t)*(1-ease(147,154,t))+ease(186,193,t)*(1-ease(264,271,t)),hand:.5+.5*Math.sin(t*.69),fade:ease(12.4,14,t)*(1-ease(295,298,t))};}
export function jeTaimeCamera(view:CameraView,aspect:number,time:number){const p=jeTaimePose(time),close=view==='lara',copies=view==='jetaime-copies'||(view==='wide'&&p.copies),car=view==='jetaime-car',target:JeTaimePoint=close?[0,159,30]:car?[-220,65,-130]:copies?[0,105,-55]:[0,100,-35],hh=close?42:140,hw=close?50:car?450:copies?450:390,fov=38,d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);return{target,position:[target[0]+d*(close?.09:car?.17:.11),target[1]+d*(close?.03:copies?.25:.08),target[2]+d]as JeTaimePoint,fov};}
