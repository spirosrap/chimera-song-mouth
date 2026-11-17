import type {CameraView} from './scene.ts';
export type JenniePoint=[number,number,number];
export type JennieLook='helmet'|'cap'|'beige'|'red';
export const JENNIE_SHOTS:[number,CameraView][]=[
 [0,'jennie-hatch'],[2.3,'jennie-capsule'],[5,'jennie-red-door'],[7.3,'jennie-bean'],[10.5,'jennie-fingers'],[14,'jennie-bite'],[18,'jennie-helmet'],[21.8,'jennie-glove'],[24.5,'jennie-spacesuit'],[28,'jennie-door'],[30,'jennie-title'],[34,'jennie-sculpture'],[36.6,'jennie-cap-face'],[39.3,'jennie-profile'],[42.1,'jennie-lines'],[45.2,'jennie-ring'],[48,'jennie-circle-above'],[50.6,'jennie-fold'],[53.7,'jennie-low-dance'],[56,'jennie-hands'],[58.6,'jennie-hall'],[61.7,'jennie-shoulders'],[64.5,'jennie-shadow'],[66.1,'jennie-refrain'],[69.2,'jennie-lean'],[72.2,'jennie-braids'],[75.3,'jennie-overhead'],[78.4,'jennie-cap-hands'],[81.2,'jennie-group'],[84.3,'jennie-front'],[87.3,'jennie-rows'],[90.5,'jennie-crowd'],[93.5,'jennie-light-columns'],[96.4,'jennie-verse'],[99.3,'jennie-portrait'],[102.4,'jennie-turn'],[105.4,'jennie-screens-above'],[108.5,'jennie-group-low'],[111.5,'jennie-fold-close'],[114.6,'jennie-centre'],[117.5,'jennie-square-above'],[120.6,'jennie-ring-wide'],[123.6,'jennie-cap-dance'],[126.7,'jennie-wave'],[129.7,'jennie-crowd-above'],[132.7,'jennie-floor'],[135.7,'jennie-floor-wide'],[138.7,'jennie-rise'],[141.6,'jennie-final-group'],[144.2,'jennie-final-hands'],[147.2,'jennie-red-dance'],[150.2,'jennie-red-crowd'],[153.2,'jennie-red-face'],[156.2,'jennie-farewell'],[158.3,'jennie-landscape'],[161.3,'jennie-red-back'],[164.3,'jennie-red-profile'],[166.3,'jennie-embers'],[168.3,'jennie-flames'],[170.3,'jennie-transformation'],[172.3,'jennie-capybara'],[175.2,'jennie-blue-flower'],[178,'jennie-quiet-world'],[180,'jennie-capybara-face']
];
export const jennieEase=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function jenniePose(time:number){const t=Math.max(0,Math.min(182.584,Number.isFinite(time)?time:0)),q=(t-49.5)*120/60*Math.PI;return {t,q,beat:Math.sin(q),sway:Math.sin(q*.5),fade:jennieEase(0,.25,t)*(1-jennieEase(182.05,182.58,t)),transform:jennieEase(168.8,171.1,t),fire:jennieEase(165.2,167.3,t)*(1-jennieEase(170.5,174.4,t))};}
export function jennieView(t:number):CameraView{return JENNIE_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'jennie-hatch' as CameraView);}
export function jennieState(view:CameraView,time:number){const p=jenniePose(time),solo=view==='jennie-singer'||view==='jennie-portrait',v=view==='wide'||solo?jennieView(p.t):view,capsule=['jennie-hatch','jennie-capsule','jennie-red-door','jennie-bean','jennie-fingers','jennie-bite','jennie-helmet','jennie-glove','jennie-spacesuit','jennie-door'].includes(v),title=v==='jennie-title',landscape=['jennie-landscape','jennie-red-back','jennie-red-profile','jennie-embers','jennie-flames','jennie-transformation','jennie-capybara','jennie-blue-flower','jennie-quiet-world','jennie-capybara-face'].includes(v),capy=landscape&&p.t>=170.3&&!solo;
 let look:JennieLook=capsule?'helmet':landscape||v.includes('red-')?'red':['jennie-braids','jennie-refrain','jennie-lean','jennie-portrait','jennie-verse','jennie-floor','jennie-rise','jennie-final-group','jennie-final-hands'].includes(v)?'beige':'cap';
 const scenic=!solo&&(title||['jennie-bean','jennie-fingers','jennie-glove','jennie-red-door','jennie-door','jennie-sculpture','jennie-shadow','jennie-screens-above'].includes(v)||capy),above=v.includes('above')||v==='jennie-overhead',fold=v==='jennie-fold'||v==='jennie-fold-close',floor=v==='jennie-floor'||v==='jennie-floor-wide',ring=['jennie-ring','jennie-circle-above','jennie-overhead','jennie-ring-wide','jennie-crowd-above'].includes(v),crowd=p.t>=126&&p.t<156.3,lights=p.t>=93.5&&p.t<108.5;
 return {...p,v,solo,capsule,title,landscape,capy,look,scenic,above,fold,floor,ring,crowd,lights,pos:[0,151,65]as JenniePoint,profile:v==='jennie-profile'||v==='jennie-red-profile',hands:v==='jennie-fingers'||v==='jennie-glove',bean:p.t>=6.5&&p.t<16.8,dance:!capsule&&!landscape&&!title,redDance:look==='red'&&!landscape};
}
export function jennieCamera(view:CameraView,aspect:number,time:number){const s=jennieState(view,time);let target:JenniePoint=[0,181,-60],hh=200,hw=350,dir:JenniePoint=[.015,.04,1],up:JenniePoint=[0,1,0];
 if(s.capsule){target=[0,185,-80];hh=215;hw=340;if(s.v==='jennie-hatch'){target=[0,220,-120];hh=245;hw=360;up=[Math.sin(s.t*.16),Math.cos(s.t*.16),0];}}
 if(s.v==='jennie-bean'||s.hands){target=[0,205,90];hh=90;hw=150;}
 if(s.v==='jennie-red-door'||s.v==='jennie-door'){target=[0,215,-610];hh=285;hw=370;}
 if(s.v==='jennie-bite'||s.v==='jennie-helmet'){target=[0,173,74];hh=83;hw=110;}
 if(s.title){target=[0,210,0];hh=200;hw=370;}
 if(s.v==='jennie-sculpture'){target=[0,280,-570];hh=330;hw=470;dir=[-.12,.1,1];}
 if(s.solo||s.v.includes('face')||s.v==='jennie-portrait'||s.v==='jennie-braids'){target=[0,172,75];hh=s.look==='helmet'?83:51;hw=s.look==='helmet'?110:78;}
 if(s.profile){target=[0,171,65];hh=90;hw=140;dir=[.65,.04,1];}
 if(s.v==='jennie-hands'||s.v==='jennie-cap-hands'||s.v==='jennie-final-hands'){target=[0,160,45];hh=145;hw=210;}
 if(s.v==='jennie-low-dance'||s.v==='jennie-group-low'){target=[0,140,-90];hh=205;hw=420;dir=[.05,-.04,1];}
 if(s.v==='jennie-fold-close'){target=[0,135,70];hh=145;hw=215;dir=[.15,.4,1];}
 if(s.ring||s.crowd&&!s.solo){target=[0,185,-160];hh=310;hw=s.crowd?630:550;}
 if(s.above){target=[0,10,-40];hh=390;hw=620;dir=[0,1,.001];up=[0,0,-1];}
 if(s.floor){target=[0,62,-90];hh=245;hw=470;dir=[.08,.65,1];}
 if(s.v==='jennie-screens-above'){target=[0,210,-370];hh=350;hw=580;dir=[.1,.65,1];}
 if(s.landscape){target=[0,150,-70];hh=240;hw=460;dir=[.03,.07,1];if(s.v==='jennie-red-profile'||s.v==='jennie-red-back'){target=[0,173,65];hh=95;hw=155;dir=[s.v==='jennie-red-back'?.8:.55,.04,1];}if(s.capy){target=[0,72,70];hh=155;hw=270;}if(s.v==='jennie-blue-flower'){target=[-30,60,90];hh=125;hw=230;}if(s.v==='jennie-capybara-face'){target=[0,66,105];hh=70;hw=110;}}
 if(!s.capsule&&!s.landscape&&(s.v.includes('face')||s.v==='jennie-portrait'||s.v==='jennie-braids')){target=[0,172,75];hh=51;hw=78;}
 if(s.solo){target=[0,172,75];hh=s.look==='helmet'?83:51;hw=s.look==='helmet'?110:78;dir=[.02,.04,1];up=[0,1,0];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return {...s,target,position:target.map((x,i)=>x+d*dir[i]/n)as JenniePoint,up,fov};
}
