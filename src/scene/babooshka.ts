import type {CameraView} from './scene.ts';
export type BabooshkaPoint=[number,number,number];
export type BabooshkaLook='bass'|'warrior'|'last';
export const BABOOSHKA_SHOTS:[number,CameraView][]=[
 [0,'bab-bass'],[5,'bab-side'],[11,'bab-embrace'],[18,'bab-bass'],[24,'bab-portrait'],[30,'bab-hands'],[36,'bab-open'],[42,'bab-bass'],[48,'bab-veil'],[54,'bab-portrait'],[59,'bab-warrior'],[65,'bab-cape'],[71.5,'bab-hands'],[78,'bab-embrace'],[85,'bab-bass'],[93,'bab-open'],[101,'bab-side'],[108,'bab-hands'],[115,'bab-portrait'],[120.5,'bab-warrior'],[127,'bab-cape'],[134,'bab-turn'],[140,'bab-veil'],[145,'bab-warrior'],[152,'bab-high'],[159,'bab-cape'],[166,'bab-warrior-portrait'],[171.5,'bab-last-bass'],[176,'bab-warrior'],[183,'bab-crown'],[190,'bab-turn'],[197,'bab-high'],[203,'bab-finale']
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
type Key=[number,number,number,number,number,number,number];
// Time, turn, left/right wrist heights, left/right wrist spread, knee bend.
export const BABOOSHKA_DANCE:Key[]=[[0,0,-22,34,-45,70,0],[12,-.12,-30,38,52,70,.25],[20,0,-47,37,-40,70,.05],[30,.03,-23,38,65,70,.05],[37,-.12,62,40,-66,70,.1],[44,.15,-17,35,-83,70,.08],[50,-.18,17,34,-5,70,.1],[56,0,24,34,-60,70,.15],[59,0,-20,-20,-33,35,.3],[64,.3,60,18,-64,64,.2],[69,.8,15,-22,-58,50,.1],[72,0,-21,35,50,70,.1],[80,-.22,-32,35,66,70,.4],[88,.04,-24,36,49,70,.35],[95,.12,-20,36,-82,70,.1],[104,.75,-18,35,63,70,.12],[113,.1,-35,35,50,70,.08],[119,0,23,35,-66,70,.1],[122,0,49,22,-74,78,.15],[129,.75,15,-29,-61,41,.15],[136,.2,61,55,-68,66,.35],[140,0,-23,37,52,70,.1],[147,.1,16,37,-82,82,.2],[154,-.45,15,23,12,-8,.35],[161,.3,70,24,-72,82,.1],[168,0,25,25,-52,52,.13],[173,0,-22,38,49,70,.1],[179,-.35,54,41,-70,79,.32],[185,.4,37,41,-31,32,.1],[192,-.8,60,15,-76,80,.25],[198,.45,76,61,-66,81,.4],[204,.6,72,69,-70,84,.2],[210,.75,65,65,-70,75,.15]];
export function babooshkaPose(time:number){const t=Math.max(0,Math.min(211.1,Number.isFinite(time)?time:0)),i=BABOOSHKA_DANCE.reduce((n,[at],j)=>t>=at?j:n,0),a=BABOOSHKA_DANCE[i],b=BABOOSHKA_DANCE[Math.min(i+1,BABOOSHKA_DANCE.length-1)],u=ease(a[0],b[0],t),mix=(k:number)=>a[k]+(b[k]-a[k])*u;return{t,turn:mix(1),left:[mix(4),mix(2),25]as BabooshkaPoint,right:[mix(5),mix(3),23]as BabooshkaPoint,crouch:mix(6),beat:t*106/60,sway:Math.sin(t*1.1),wind:Math.sin(t*1.35)*.6+.4,fade:ease(0,.8,t)*(1-ease(205.5,210.4,t)),outro:ease(198,209,t)};}
export function babooshkaView(time:number):CameraView{return BABOOSHKA_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'bab-bass'as CameraView);}
export function babooshkaLook(view:CameraView,time:number):BabooshkaLook{if(view==='wide'||view==='babooshka-kate')view=babooshkaView(time);if(view==='bab-last-bass')return'last';return['bab-warrior','bab-cape','bab-turn','bab-high','bab-warrior-portrait','bab-crown','bab-finale'].includes(view)?'warrior':'bass';}
export function babooshkaCamera(view:CameraView,aspect:number,time:number){const p=babooshkaPose(time),look=babooshkaLook(view,p.t);if(view==='wide')view=babooshkaView(p.t);if(view==='babooshka-kate')view=look==='bass'?'bab-portrait':look==='last'?'bab-last-bass':'bab-warrior-portrait';let target:BabooshkaPoint=look==='warrior'?[0,111,12]:[-14,125,9],hh=159,hw=224,dir:BabooshkaPoint=[.12,.07,1];
 if(view==='bab-portrait'||view==='bab-veil'){target=[-72,164-p.crouch*13,23];hh=50;hw=72;dir=[Math.sin(p.turn+.08),.02,Math.cos(p.turn+.08)];}
 if(view==='bab-hands'){target=[-7,150,19];hh=115;hw=167;dir=[.14,.04,1];}
 if(view==='bab-side'){target=[-17,125,0];hh=158;hw=219;dir=[-.65,.07,1];}
 if(view==='bab-embrace'){target=[-17,111,12];hh=143;hw=199;dir=[-.16,.08,1];}
 if(view==='bab-warrior-portrait'||view==='bab-crown'){target=[0,164-p.crouch*13,18];hh=view==='bab-crown'?48:54;hw=75;dir=[Math.sin(p.turn+.08),.03,Math.cos(p.turn+.08)];}
 if(view==='bab-warrior'||view==='bab-cape'||view==='bab-turn'||view==='bab-high'){target=[0,109,13];hh=154;hw=view==='bab-cape'?270:235;dir=[.12,.06,1];}
 if(view==='bab-last-bass'){target=[-17,131,13];hh=157;hw=221;dir=[.17,.05,1];}
 if(view==='bab-finale'){target=[0,112,10];hh=154+p.outro*84;hw=244+p.outro*130;dir=[.13,.04,1];}
 const a=Math.max(.42,Math.min(656/480,Number.isFinite(aspect)?aspect:656/480)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as BabooshkaPoint,up:[0,1,0]as BabooshkaPoint,fov};
}
