import type {CameraView} from './scene.ts';
export type EspressoPoint=[number,number,number];
export type EspressoPlace='tan'|'white'|'ingredients'|'crew'|'sky'|'end';
export const ESPRESSO_SHOTS:[number,CameraView][]=[
 [0,'espresso-boxes'],[8.6,'espresso-emerge'],[14,'espresso-pair'],[21.8,'espresso-portraits'],[31.8,'espresso-cups'],[35,'espresso-dance'],[43.8,'espresso-pair'],[51.5,'espresso-hands'],[58.6,'espresso-faceoff'],[65.7,'espresso-dance'],[73.4,'espresso-pair'],[79.2,'espresso-faceoff'],[86.9,'espresso-cups'],[94,'espresso-faceoff'],[99.2,'espresso-cup-close'],[101.7,'espresso-run'],[105.1,'espresso-fusion'],[109.1,'espresso-crossed'],[111.6,'espresso-kiss'],[114.9,'espresso-white'],[117.9,'espresso-coffee'],[120.3,'espresso-cup-man'],[122.6,'espresso-ingredients'],[127.2,'espresso-milk'],[130.8,'espresso-ingredients'],[135.1,'espresso-cameo'],[143.8,'espresso-security'],[150,'espresso-lift'],[153.9,'espresso-crowd'],[157.9,'espresso-swing'],[161.2,'espresso-empty'],[162.3,'espresso-sky'],[164.4,'espresso-swing-close'],[166.5,'espresso-fusion-close'],[168.1,'espresso-cameo'],[172.1,'espresso-security'],[174,'espresso-sky'],[177.7,'espresso-ending'],[184.1,'espresso-credits'],
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function espressoPose(time:number){const t=Math.max(0,Math.min(192.7,Number.isFinite(time)?time:0)),beat=(t-7.9)*120/60,q=beat*Math.PI*2;return{t,beat,q,sway:Math.sin(q*.5),hop:Math.max(0,Math.sin(q))*.8,emerge:ease(8.4,12,t),turn:Math.sin(t*.4)*.09,swing:Math.sin((t-158)*1.4)*.18,flight:ease(162,177,t),fade:ease(0,.5,t)*(1-ease(191.2,192.6,t))};}
export function espressoView(t:number):CameraView{return ESPRESSO_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'espresso-boxes'as CameraView);}
export function espressoResolve(v:CameraView,t:number):CameraView{return v==='wide'?espressoView(t):v==='espresso-tommy'?'espresso-fusion-close':v;}
export function espressoPlace(view:CameraView,t:number):EspressoPlace{const v=espressoResolve(view,t);return['espresso-coffee','espresso-cup-man','espresso-ingredients','espresso-milk'].includes(v)?'ingredients':['espresso-security','espresso-lift','espresso-crowd'].includes(v)?'crew':v==='espresso-sky'?'sky':v==='espresso-credits'?'end':['espresso-run','espresso-fusion','espresso-crossed','espresso-kiss','espresso-white','espresso-cameo','espresso-swing','espresso-empty','espresso-swing-close','espresso-fusion-close','espresso-ending'].includes(v)?'white':'tan';}
export function espressoCamera(view:CameraView,aspect:number,time:number){const p=espressoPose(time),v=espressoResolve(view,p.t),place=espressoPlace(v,p.t);let target:EspressoPoint=[0,111,9],hh=158,hw=255,dir:EspressoPoint=[.04,.03,1];
 if(v==='espresso-boxes'||v==='espresso-emerge'){target=[0,80,0];hh=156;hw=251;}
 if(v==='espresso-portraits'){target=[0,223,0];hh=169;hw=175;}
 if(v==='espresso-cups'||v==='espresso-faceoff'||v==='espresso-hands'){target=[0,155,13];hh=v==='espresso-faceoff'?81:101;hw=219;}
 if(v==='espresso-cup-close'){target=[0,122,13];hh=47;hw=72;}
 if(v==='espresso-fusion-close'||v==='espresso-swing-close'||v==='espresso-ending'){target=[0,165,12];hh=56;hw=84;}
 if(v==='espresso-fusion'||v==='espresso-crossed'||v==='espresso-kiss'||v==='espresso-cameo'){target=[0,145,9];hh=v==='espresso-kiss'?79:108;hw=hh*1.44;}
 if(v==='espresso-cup-man'){target=[0,145,16];hh=112;hw=163;}
 if(v==='espresso-coffee'){target=[0,117,14];hh=76;hw=115;}
 if(v==='espresso-ingredients'||v==='espresso-milk'){target=[0,111,-4];hh=168;hw=361;}
 if(v==='espresso-security'||v==='espresso-crowd'){target=[0,122,10];hh=170;hw=306;}
 if(v==='espresso-lift'){target=[0,147,13];hh=197;hw=301;}
 if(v==='espresso-swing'){target=[0,155,8];hh=203;hw=215;}
 if(v==='espresso-sky'){target=[0,246+p.flight*105,0];hh=271;hw=290;dir=[.12,.02,1];}
 if(v==='espresso-credits'){target=[0,130,0];hh=153;hw=261;}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{place,target,position:target.map((x,i)=>x+d*dir[i]/n)as EspressoPoint,up:[0,1,0]as EspressoPoint,fov};}
