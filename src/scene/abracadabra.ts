import type {CameraView} from './scene.ts';
export type SpellPoint=[number,number,number];
export const SPELL_SHOTS:[number,CameraView][]=[
 [0,'spell-queen'],[11.6,'spell-white-close'],[16.2,'spell-white'],[21,'spell-lines'],[28,'spell-wide'],[32,'spell-cape'],[39,'spell-sleeves'],[45,'spell-white'],[49,'spell-overhead'],[54,'spell-wide'],[61,'spell-crowd'],[68,'spell-lines'],[75,'spell-ring'],[81,'spell-white-close'],[88,'spell-cape'],[94,'spell-wide'],[101,'spell-crowd'],[109,'spell-white-floor'],[118,'spell-queen'],[125,'spell-cage'],[131,'spell-dark'],[137,'spell-red'],[144,'spell-red-close'],[151,'spell-dark'],[159,'spell-red-back'],[166,'spell-red'],[173,'spell-red-floor'],[180,'spell-red-close'],[188,'spell-dark'],[194,'spell-white-lift'],[201,'spell-ring'],[208,'spell-crowd'],[215,'spell-floor'],[223,'spell-white-floor'],[231,'spell-hands'],[237,'spell-window'],[244,'spell-white-lift'],[251,'spell-overhead'],[258,'spell-crowd'],[263.8,'spell-queen'],[268,'spell-ending'],
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function spellView(t:number):CameraView{return SPELL_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'spell-queen'as CameraView);}
export function spellResolve(v:CameraView,t:number):CameraView{return v==='wide'?spellView(t):v==='gaga-spell'?'spell-white-close':v;}
export function spellPose(time:number){const t=Math.max(0,Math.min(270,Number.isFinite(time)?time:0)),beat=(t-12)*126/60,q=beat*Math.PI*2;return{t,beat,q,sway:Math.sin(q*.5),step:Math.sin(q),mode:Math.floor(Math.max(0,beat)/8)%4,fade:ease(0,.5,t)*(1-ease(267,269.7,t))};}
export function spellState(view:CameraView,time:number){const p=spellPose(time),v=spellResolve(view,p.t),queen=['spell-queen','spell-cage','spell-ending'].includes(v),red=['spell-dark','spell-red','spell-red-close','spell-red-back','spell-red-floor'].includes(v),floor=['spell-white-floor','spell-red-floor','spell-floor'].includes(v),overhead=['spell-overhead','spell-ring'].includes(v),lift=v==='spell-white-lift';return{...p,v,queen,red,floor,overhead,lift,ring:overhead||lift,leadY:lift?236:overhead?52:floor?90:151};}
export function spellCamera(view:CameraView,aspect:number,time:number){const p=spellState(view,time),v=p.v;let target:SpellPoint=[0,134,-40],hh=202,hw=370,dir:SpellPoint=[.12,.12,1],up:SpellPoint=[0,1,0];
 if(p.queen){target=[-165,407,-159];hh=v==='spell-cage'?283:113;hw=v==='spell-cage'?236:184;dir=[.06,.02,1];}
 if(v==='spell-white'||v==='spell-red'){target=[0,119,40];hh=158;hw=238;dir=[.08,.03,1];}
 if(v==='spell-white-close'||v==='spell-red-close'){target=[0,165,56];hh=70;hw=p.red?138:105;dir=[.03,.02,1];}
 if(v==='spell-cape'||v==='spell-sleeves'){target=[0,104,-8];hh=177;hw=289;dir=[-.4,.18,1];}
 if(v==='spell-crowd'||v==='spell-hands'){target=[0,146,18];hh=125;hw=254;dir=[.2,.12,1];}
 if(v==='spell-lines'){target=[0,103,-58];hh=207;hw=337;dir=[.46,.22,1];}
 if(p.overhead){target=[0,70,0];hh=191;hw=238;dir=[.015,1,.015];up=[0,0,-1];}
 if(p.floor){target=[0,99,41];hh=129;hw=244;dir=[.15,.22,1];}
 if(v==='spell-red-back'){target=[0,127,22];hh=164;hw=289;dir=[1,.13,-.26];}
 if(p.lift){target=[0,187,12];hh=221;hw=346;dir=[.1,.13,1];}
 if(v==='spell-window'){target=[0,151,-36];hh=231;hw=365;dir=[-.3,.1,1];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as SpellPoint,up,fov};}
