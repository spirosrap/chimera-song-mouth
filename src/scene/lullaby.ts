import type {CameraView} from './scene.ts';
export type LullabyPoint=[number,number,number];
export type LullabyPlace='bedroom'|'band'|'void';
export const LULLABY_SHOTS:[number,CameraView][]=[
 [0,'lullaby-web'],[8,'lullaby-pillow'],[18,'lullaby-bedroom'],[26,'lullaby-singer'],[35,'lullaby-profile'],[43,'lullaby-window'],[49,'lullaby-bed'],[56,'lullaby-singer'],[64,'lullaby-pillow'],[71,'lullaby-window-hands'],[83,'lullaby-singer'],[94,'lullaby-profile'],[100,'lullaby-wall'],[108,'lullaby-band'],[117,'lullaby-brass'],[123,'lullaby-cocoon'],[130,'lullaby-lace'],[139,'lullaby-singer'],[146,'lullaby-spider'],[153,'lullaby-predator'],[159,'lullaby-mouth'],[166,'lullaby-void'],[174,'lullaby-struggle'],[181,'lullaby-overhead'],[188,'lullaby-guitar'],[196,'lullaby-overhead'],[204,'lullaby-void'],[211,'lullaby-drums'],[218,'lullaby-bass'],[225,'lullaby-window-night'],[232,'lullaby-bed-night'],[239,'lullaby-struggle'],[247,'lullaby-ending']
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function lullabyPose(time:number){const t=Math.max(0,Math.min(250.3,Number.isFinite(time)?time:0)),beat=t*94/60;return{t,beat,blue:ease(151,169,t),web:ease(97,140,t),creep:ease(62,101,t),swallow:ease(151,169,t),pull:ease(162,176,t),turn:Math.sin(t*.21)*.11,breath:Math.sin(t*1.35),strain:Math.sin(t*2.1)*.5+.5,fade:ease(0,1,t)*(1-ease(247.2,250.1,t))};}
export function lullabyPlace(view:CameraView,time:number):LullabyPlace{
 if(view==='wide')return lullabyPlace(LULLABY_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'lullaby-web'as CameraView),time);
 if(['lullaby-band','lullaby-brass','lullaby-guitar','lullaby-drums','lullaby-bass'].includes(view))return'band';
 if(['lullaby-void','lullaby-struggle','lullaby-ending'].includes(view))return'void';
 if(view==='lullaby-robert')return time>=166&&time<181||time>=204&&time<211||time>=239?'void':'bedroom';return'bedroom';
}
export function lullabyCamera(view:CameraView,aspect:number,time:number){const p=lullabyPose(time),place=lullabyPlace(view,time);if(view==='lullaby-robert')view=place==='void'?'lullaby-struggle':'lullaby-singer';let target:LullabyPoint=[0,110,0],hh=163,hw=225,dir:LullabyPoint=[.32,.63,1],up:LullabyPoint=[0,1,0];
 if(['lullaby-singer','lullaby-pillow','lullaby-profile','lullaby-cocoon'].includes(view)){target=[0,106,-116];hh=view==='lullaby-profile'?32:43;hw=view==='lullaby-profile'?46:64;dir=view==='lullaby-profile'?[-.55,.75,.6]:[.1,.9,.65];}
 else if(view==='lullaby-web'){target=[-101,190,-175];hh=72;hw=105;dir=[.12,.1,1];}
 else if(view==='lullaby-window'||view==='lullaby-window-hands'||view==='lullaby-window-night'){target=[0,180,-263];hh=123;hw=140;dir=[.1,.035,1];}
 else if(view==='lullaby-lace'){target=[-83,179,-251];hh=85;hw=93;dir=[.12,.03,1];}
 else if(view==='lullaby-wall'||view==='lullaby-predator'){target=view==='lullaby-predator'?[-150,183,-165]:[-133,143,-170];hh=view==='lullaby-predator'?39:127;hw=view==='lullaby-predator'?56:160;dir=[.2,.04,1];}
 else if(view==='lullaby-spider'){target=[0,236,-170];hh=100;hw=177;dir=[.1,.12,1];}
 else if(view==='lullaby-mouth'){target=[0,105,-108];hh=10;hw=17;dir=[.08,1,.3];}
 else if(view==='lullaby-overhead'){target=[0,88,14];hh=180;hw=185;dir=[.02,1,.03];up=[0,0,-1];}
 else if(view==='lullaby-bed'||view==='lullaby-bed-night'){target=[0,109,15];hh=150;hw=210;dir=[.24,.63,1];}
 else if(place==='band'){const solo=view==='lullaby-guitar'||view==='lullaby-drums'||view==='lullaby-bass';target=view==='lullaby-guitar'?[-190,150,0]:view==='lullaby-bass'?[190,150,0]:view==='lullaby-drums'?[66,140,-5]:view==='lullaby-brass'?[-70,138,3]:[0,134,0];hh=solo?65:view==='lullaby-brass'?100:155;hw=solo?88:view==='lullaby-brass'?160:320;dir=[.1,.06,1];}
 else if(place==='void'){target=[0,116+Math.sin(p.t*.6)*3,16];hh=view==='lullaby-struggle'?98:152;hw=view==='lullaby-struggle'?154:235;dir=[.12,.04,1];}
 const effective=Math.max(.42,Math.min(4/3,aspect)),fov=35,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as LullabyPoint,up,fov};
}
