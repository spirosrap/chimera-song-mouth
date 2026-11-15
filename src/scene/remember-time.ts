import type {CameraView} from './scene.ts';
export type RememberId='remember-michael'|'remember-pharaoh'|'remember-queen'|'remember-herald';
export type RememberPoint=[number,number,number];
export type RememberPlace='egypt'|'throne'|'magic'|'corridor'|'market'|'bedroom'|'balcony'|'dance';
export const REMEMBER_SHOTS:[number,CameraView][]=[
 [0,'remember-egypt'],[25,'remember-cats'],[39,'remember-throne'],[48,'remember-king'],[63,'remember-palace'],[80,'remember-royals'],[93,'remember-herald-close'],[108,'remember-entertainer'],[120,'remember-king'],[129,'remember-fire'],[148,'remember-herald-close'],[158,'remember-queen-close'],[169,'remember-cloak'],[178,'remember-sand'],[187,'remember-magic'],[204,'remember-royals'],[219,'remember-singer'],[234,'remember-palace'],[245,'remember-singer'],[255,'remember-guards'],[266,'remember-chase'],[277,'remember-cats'],[290,'remember-market'],[304,'remember-stalls'],[314,'remember-bed'],[324,'remember-overhead'],[338,'remember-balcony'],[351,'remember-duet'],[365,'remember-kiss'],[375,'remember-queen-close'],[387,'remember-dancers'],[405,'remember-singer'],[421,'remember-dance'],[438,'remember-guards'],[451,'remember-dancers'],[466,'remember-dance'],[479,'remember-queen-close'],[490,'remember-singer'],[505,'remember-spin'],[516,'remember-disappear'],[526,'remember-cloak'],[538,'remember-chase'],[550,'remember-ending']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function rememberPose(time:number){const t=Math.max(0,Math.min(558.8,Number.isFinite(time)?time:0));return{t,beat:t*108/60,step:Math.sin(t*5.65),gesture:Math.sin(t*1.5)*.5+.5,turn:Math.sin(t*.35)*.07,magic:ease(173,190,t)*(1-ease(196,207,t)),disappear:ease(511,519,t),kiss:ease(358,367,t)*(1-ease(369,376,t)),fade:ease(0,1.5,t)*(1-ease(548.5,555,t))};}
export function rememberPlace(view:CameraView,time:number):RememberPlace{
 if(view==='wide'||view==='remember-michael')return rememberPlace(REMEMBER_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'remember-egypt'as CameraView),time);
 if(view==='remember-egypt'||view==='remember-ending')return'egypt';
 if(['remember-cloak','remember-sand','remember-magic','remember-disappear'].includes(view))return'magic';
 if(['remember-chase','remember-guards'].includes(view))return'corridor';
 if(['remember-market','remember-stalls'].includes(view))return'market';
 if(['remember-cats','remember-bed'].includes(view))return'bedroom';
 if(['remember-balcony','remember-duet','remember-kiss'].includes(view))return'balcony';
 if(['remember-dancers','remember-dance','remember-spin','remember-overhead','remember-singer'].includes(view))return'dance';return'throne';
}
export function rememberCamera(view:CameraView,aspect:number,time:number){const p=rememberPose(time),place=rememberPlace(view,p.t);if(view==='remember-michael')view=place==='magic'?'remember-magic':place==='balcony'?'remember-duet':'remember-singer';let target:RememberPoint=[0,136,-10],hh=174,hw=310,dir:RememberPoint=[.12,.1,1],up:RememberPoint=[0,1,0];
 if(place==='egypt'){target=[0,100,-45];hh=240;hw=450;dir=[.23,.16,1];}
 else if(view==='remember-king'||view==='remember-pharaoh'){target=[-53,200,-123];hh=47;hw=73;dir=[.13,.04,1];}
 else if(view==='remember-queen-close'||view==='remember-queen'){target=[55,197,-122];hh=49;hw=74;dir=[-.13,.04,1];}
 else if(view==='remember-herald-close'||view==='remember-herald'){target=[-166,153,57];hh=55;hw=90;dir=[.1,.03,1];}
 else if(view==='remember-royals'){target=[0,168,-120];hh=112;hw=188;dir=[.05,.08,1];}
 else if(view==='remember-palace'){target=[0,167,-100];hh=240;hw=410;dir=[.12,.1,1];}
 else if(view==='remember-entertainer'||view==='remember-fire'){target=[0,129,80];hh=140;hw=220;dir=[.12,.06,1];}
 else if(place==='magic'){target=[0,119,52];hh=view==='remember-sand'?87:165;hw=view==='remember-sand'?170:280;dir=[.1,view==='remember-sand'?.36:.12,1];}
 else if(view==='remember-singer'){target=[0,164,30];hh=58;hw=97;dir=[.11,.03,1];}
 else if(view==='remember-overhead'){target=[0,68,12];hh=220;hw=310;dir=[.02,1,.04];up=[0,0,-1];}
 else if(place==='dance'){target=[0,129,14];hh=180;hw=335;dir=[.11,.13,1];}
 else if(place==='corridor'){target=[0,123,0];hh=173;hw=295;dir=[.04,.08,1];}
 else if(place==='market'){target=[0,124,0];hh=184;hw=330;dir=[.24,.14,1];}
 else if(place==='bedroom'){target=[0,118,-18];hh=163;hw=295;dir=[.18,.18,1];}
 else if(place==='balcony'){target=[0,155,12];hh=view==='remember-kiss'?73:146;hw=view==='remember-kiss'?132:245;dir=[.12,.08,1];}
 const effective=Math.max(.42,Math.min(1.94,aspect)),fov=35,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as RememberPoint,up,fov};
}
