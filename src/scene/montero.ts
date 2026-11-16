import type{CameraView}from'./scene.ts';
export type MonteroPoint=[number,number,number];
export type MonteroLook='eden'|'serpent'|'prisoner'|'judge-left'|'judge-right'|'ascend'|'pole'|'inferno'|'sovereign';
export type MonteroPlace='eden'|'court'|'sky'|'pole'|'hell'|'end';
export const MONTERO_SHOTS:[number,CameraView][]=[
 [0,'montero-world'],[4,'montero-title'],[9,'montero-garden'],[15,'montero-trail'],[20,'montero-eden-close'],[25,'montero-tree'],[29,'montero-guitar'],[34,'montero-flowers'],[39,'montero-eden'],[44,'montero-serpent'],[48,'montero-serpent-close'],[53,'montero-garden-wide'],[58,'montero-serpent'],[62,'montero-pair'],[67,'montero-inscription'],[72,'montero-procession'],[77,'montero-prisoner-close'],[81,'montero-trial'],[85,'montero-judges'],[89,'montero-prisoner'],[94,'montero-chains'],[98,'montero-crowd'],[102,'montero-verdict'],[106,'montero-ascent'],[110,'montero-wings'],[114,'montero-fall'],[117,'montero-pole'],[121,'montero-tunnel'],[125,'montero-pole-invert'],[130,'montero-pole-close'],[134,'montero-lava'],[138,'montero-inferno'],[142,'montero-throne-wide'],[145,'montero-dancer-close'],[150,'montero-throne'],[155,'montero-devil'],[160,'montero-dance'],[166,'montero-crouch'],[170,'montero-throne-pair'],[175,'montero-transfer'],[179,'montero-horns'],[182,'montero-sovereign'],[185,'montero-credits'],
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function monteroView(t:number):CameraView{return MONTERO_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'montero-world'as CameraView);}
export function monteroResolve(v:CameraView,t:number):CameraView{return v==='wide'?monteroView(t):v==='nas-montero'?'montero-eden-close':v;}
export function monteroPose(time:number){const t=Math.max(0,Math.min(190.5,Number.isFinite(time)?time:0)),beat=(t-20.88)*89.1/60,q=beat*Math.PI*2;return{t,q,beat,sway:Math.sin(q*.5),step:Math.sin(q),travel:ease(114,134,t),transfer:ease(174,178,t),fade:1-ease(188.3,190.1,t)};}
export function monteroState(view:CameraView,time:number){const p=monteroPose(time),v=monteroResolve(view,p.t);let place:MonteroPlace=v==='montero-world'||v==='montero-title'||v==='montero-ascent'||v==='montero-wings'?'sky':v==='montero-fall'||v.startsWith('montero-pole')||v==='montero-tunnel'?'pole':v==='montero-credits'?'end':['montero-procession','montero-prisoner-close','montero-trial','montero-judges','montero-prisoner','montero-chains','montero-crowd','montero-verdict'].includes(v)?'court':['montero-lava','montero-inferno','montero-throne-wide','montero-dancer-close','montero-throne','montero-devil','montero-dance','montero-crouch','montero-throne-pair','montero-transfer','montero-horns','montero-sovereign'].includes(v)?'hell':'eden';let look:MonteroLook=place==='court'?v==='montero-judges'?'judge-left':'prisoner':place==='sky'?'ascend':place==='pole'?'pole':place==='hell'?v==='montero-horns'||v==='montero-sovereign'||v==='montero-transfer'&&p.t>177?'sovereign':'inferno':v==='montero-serpent'||v==='montero-serpent-close'?'serpent':'eden';const scenic=['montero-world','montero-title','montero-garden','montero-trail','montero-flowers','montero-inscription','montero-lava','montero-credits'].includes(v),pair=v==='montero-pair',crouch=v==='montero-crouch',invert=v==='montero-pole-invert';return{...p,v,place,look,scenic,pair,crouch,invert,leadY:place==='sky'?183+Math.sin(p.t*.7)*7:crouch?105:151};}
export function monteroCamera(view:CameraView,aspect:number,time:number){const p=monteroState(view,time),v=p.v;let target:MonteroPoint=[0,127,0],hh=192,hw=320,dir:MonteroPoint=[.12,.08,1],up:MonteroPoint=[0,1,0];
 if(p.place==='eden'){target=[0,127,-5];hh=183;hw=325;}
 if(v.endsWith('close')){target=[0,174,25];hh=86;hw=p.look==='serpent'?150:129;dir=[.03,.03,1];}
 if(v==='montero-tree'||v==='montero-garden-wide'){target=[70,157,-39];hh=238;hw=390;dir=[.12,.1,1];}
 if(v==='montero-garden'||v==='montero-trail'){target=[0,95,-100];hh=215;hw=420;dir=[.2,.18,1];}
 if(v==='montero-flowers'){target=[0,50,-30];hh=89;hw=171;dir=[.07,.4,1];}
 if(v==='montero-inscription'){target=[142,143,-108];hh=81;hw=128;dir=[.04,.02,1];}
 if(v==='montero-pair'){target=[0,167,30];hh=121;hw=214;dir=[0,.02,1];}
 if(p.place==='court'&&!v.endsWith('close')){target=[0,137,-30];hh=199;hw=338;}
 if(v==='montero-judges'){target=[-86,173,8];hh=115;hw=195;dir=[.12,.04,1];}
 if(v==='montero-crowd'||v==='montero-trial'){target=[0,167,-55];hh=254;hw=421;dir=[.25,.21,1];}
 if(p.place==='sky'){target=[0,p.scenic?230:p.leadY,0];hh=p.scenic?245:207;hw=p.scenic?377:315;dir=[.02,.08,1];}
 if(p.place==='pole'){target=[0,142,0];hh=202;hw=233;dir=[.18,.06,1];}
 if(v==='montero-pole-close'){target=[0,170,24];hh=101;hw=143;dir=[.03,.02,1];}
 if(p.place==='hell'&&!v.endsWith('close')){target=[0,159,-15];hh=221;hw=358;dir=[.13,.12,1];}
 if(v==='montero-throne'||v==='montero-devil'||v==='montero-throne-pair'){target=[0,175,-9];hh=184;hw=279;dir=[.14,.08,1];}
 if(v==='montero-crouch'){target=[0,139,16];hh=198;hw=302;dir=[.18,.1,1];}
 if(v==='montero-horns'){target=[0,177,23];hh=119;hw=230;dir=[.03,.04,1];}
 if(v==='montero-lava'){target=[0,67,-100];hh=204;hw=396;dir=[.13,.27,1];}
 if(p.place==='end'){target=[0,145,0];hh=130;hw=280;dir=[0,0,1];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...p,target,position:target.map((x,i)=>x+d*dir[i]/n)as MonteroPoint,up,fov};}
