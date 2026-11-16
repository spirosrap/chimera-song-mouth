import type {CameraView} from './scene.ts';
export type VoltagePoint=[number,number,number];
export type VoltagePlace='salon'|'ride'|'sax';
export const VOLTAGE_SHOTS:[number,CameraView][]=[
 [0,'volt-gallery'],[4,'volt-horse-painting'],[9,'volt-chair'],[15,'volt-man'],[21,'volt-man-close'],
 [28,'volt-woman'],[34,'volt-woman-close'],[39,'volt-chair'],[45,'volt-man'],[51,'volt-woman'],
 [58,'volt-dance'],[64,'volt-duet'],[70,'volt-embrace'],[75,'volt-chair'],[80,'volt-embrace'],
 [86,'volt-duet'],[91,'volt-embrace'],[98,'volt-girl-painting'],[104,'volt-chair'],[111,'volt-man'],
 [116,'volt-woman-chair'],[121,'volt-man-close'],[127,'volt-woman-close'],[131,'volt-duet'],
 [136,'volt-ride'],[143,'volt-ride-close'],[148,'volt-ride'],[153,'volt-ride-close'],[159,'volt-eye-painting'],
 [164,'volt-sax'],[170,'volt-sax-man'],[176,'volt-sax'],[182,'volt-sax-woman'],[188,'volt-sax-fire'],
 [194,'volt-gallery'],[199,'volt-eye-painting'],[203,'volt-horse-painting'],[207,'volt-fire'],
 [211,'volt-girl-painting'],[215,'volt-fire'],[219,'volt-finale'],
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function voltageView(time:number):CameraView{return VOLTAGE_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'volt-gallery'as CameraView);}
export function voltageResolve(view:CameraView,time:number):CameraView{
 if(view==='wide')return voltageView(time);
 if(view==='voltage-man')return time>=164&&time<194?'volt-sax-man':time>=136&&time<159?'volt-ride-close':'volt-man';
 if(view==='voltage-woman')return time>=164&&time<194?'volt-sax-woman':time>=136&&time<159?'volt-ride-close':'volt-woman';
 return view;
}
export function voltagePlace(view:CameraView,time:number):VoltagePlace{const v=voltageResolve(view,time);return v.startsWith('volt-sax')?'sax':v.startsWith('volt-ride')?'ride':'salon';}
export function voltagePose(time:number){
 const t=Math.max(0,Math.min(221.7,Number.isFinite(time)?time:0)),beat=t*123/60,q=beat*Math.PI*2;
 const dance=ease(56,60,t)*(1-ease(95,98,t)),embrace=ease(70,78,t)*(1-ease(95,98,t));
 const pulse=.18+.82*Math.max(0,Math.sin(q))**2,lit=Math.max(ease(73,77,t)*(1-ease(97,100,t)),ease(106,110,t)*(1-ease(130,134,t)),ease(136,139,t)*(1-ease(157,160,t)),ease(165,168,t)*(1-ease(193,196,t)));
 return{t,beat,dance,embrace,pulse,lit,sway:Math.sin(q*.5),nod:Math.sin(q)*.045,ride:Math.sin(q*.5)*3.5,
  left:[-43-Math.sin(q*.5)*10,-28+Math.sin(q*.5)*19,22]as VoltagePoint,
  right:[43+Math.sin(q*.5)*12,-22+Math.cos(q*.5)*27,21]as VoltagePoint,
  fade:ease(0,.7,t)*(1-ease(218.7,221.1,t))};
}
export function voltageCamera(view:CameraView,aspect:number,time:number){
 const p=voltagePose(time),v=voltageResolve(view,p.t),place=voltagePlace(v,p.t);
 let target:VoltagePoint=[0,139,0],hh=164,hw=253,dir:VoltagePoint=[.12,.06,1];
 if(v==='volt-chair'){target=[-94,118,44];hh=121;hw=163;dir=[.12,.05,1];}
 if(v==='volt-man'||v==='volt-man-close'){target=[-94,154,43];hh=v.endsWith('close')?44:55;hw=hh*1.5;dir=[.08,.02,1];}
 if(v==='volt-woman'||v==='volt-woman-close'){target=[93,154,39];hh=v.endsWith('close')?43:55;hw=hh*1.5;dir=[-.1,.02,1];}
 if(v==='volt-woman-chair'){target=[93,113,42];hh=125;hw=177;dir=[-.12,.08,1];}
 if(v==='volt-dance'||v==='volt-duet'){target=[0,114,106];hh=v==='volt-dance'?152:104;hw=v==='volt-dance'?226:160;dir=[.1,.05,1];}
 if(v==='volt-embrace'){target=[0,157,118];hh=67;hw=113;dir=[-.18,.02,1];}
 if(place==='ride'){target=[0,181,12];hh=v==='volt-ride-close'?91:203;hw=v==='volt-ride-close'?184:285;dir=[.12,.08,1];}
 if(place==='sax'){target=[0,123,12];hh=157;hw=240;dir=[.12,.04,1];}
 if(v==='volt-sax-man'){target=[40,174,-7];hh=53;hw=80;dir=[.09,.03,1];}
 if(v==='volt-sax-woman'){target=[-66,118,60];hh=75;hw=112;dir=[-.18,.07,1];}
 if(v==='volt-sax-fire'){target=[0,132,13];hh=171;hw=258;dir=[.1,.04,1];}
 if(v==='volt-gallery'||v==='volt-finale'){target=[0,192,-182];hh=v==='volt-finale'?201:164;hw=256;dir=[.02,0,1];}
 if(v==='volt-horse-painting'){target=[-8,230,-185];hh=65;hw=97;dir=[0,0,1];}
 if(v==='volt-girl-painting'){target=[-242,190,-181];hh=47;hw=43;dir=[0,0,1];}
 if(v==='volt-eye-painting'){target=[239,216,-182];hh=56;hw=48;dir=[0,0,1];}
 if(v==='volt-fire'){target=[0,62,-104];hh=77;hw=98;dir=[0,.04,1];}
 const a=Math.max(.42,Math.min(1856/1080,Number.isFinite(aspect)?aspect:1856/1080)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);
 return{target,position:target.map((x,i)=>x+d*dir[i]/n)as VoltagePoint,up:[0,1,0]as VoltagePoint,fov};
}
