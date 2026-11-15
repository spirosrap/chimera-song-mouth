import type {CameraView} from './scene.ts';
export type GlassPoint=[number,number,number];
export type GlassSet='party'|'portrait'|'corridor'|'stairs';
export const GLASS_SHOTS:[number,CameraView][]=[
 [0,'glass-room'],[4,'glass-couple'],[12,'glass-party'],[20,'glass-couple'],[24,'glass-singer'],[35,'glass-portrait'],[40,'glass-rival'],[47,'glass-party'],[54,'glass-lover'],[61,'glass-gossip'],[68,'glass-couple'],[74,'glass-singer'],[81,'glass-kiss'],[88,'glass-portrait'],[94,'glass-singer'],[101,'glass-dancers'],[109,'glass-trio'],[118,'glass-corridor'],[122,'glass-argument'],[128,'glass-pair'],[134,'glass-embrace'],[140,'glass-argument'],[146,'glass-singer'],[152,'glass-corridor'],[158,'glass-party'],[164,'glass-singer'],[172,'glass-jealous'],[181,'glass-singer'],[188,'glass-couple'],[194,'glass-struggle'],[202,'glass-rival'],[208,'glass-spiral'],[216,'glass-stairs'],[222,'glass-rescue'],[230,'glass-final-kiss'],[235,'glass-ending']
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function glassPose(time:number){const t=Math.max(0,Math.min(239.5,Number.isFinite(time)?time:0)),beat=t*124/60,flourish=.5+.5*Math.sin(beat*Math.PI*.5),argument=ease(121,126,t)*(1-ease(145,151,t)),struggle=ease(191,197,t)*(1-ease(202,206,t)),descent=ease(209,220,t),carry=ease(222,224,t),kiss=ease(229,233,t),q=.7+descent*3.7;return{t,beat,flourish,argument,struggle,descent,carry,kiss,step:Math.sin(beat*Math.PI),stair:[Math.cos(q)*140,150+(1-descent)*216,Math.sin(q)*140]as GlassPoint,fade:ease(0,1.3,t)*(1-ease(236.4,238.8,t))};}
export function glassSet(view:CameraView,time:number):GlassSet{
 if(view==='wide')return glassSet(GLASS_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'glass-room'as CameraView),time);
 if(view==='glass-singer'||view==='glass-portrait')return'portrait';
 if(['glass-corridor','glass-argument','glass-pair','glass-embrace'].includes(view))return'corridor';
 if(['glass-spiral','glass-stairs','glass-rescue','glass-final-kiss','glass-ending'].includes(view))return'stairs';
 if(view==='glass-annie')return time>=208?'stairs':time>=118&&time<153?'corridor':'portrait';return'party';
}
export function glassActor(view:CameraView,time:number):GlassPoint{const p=glassPose(time),set=glassSet(view,time);return set==='portrait'?[0,150,30]:set==='corridor'?[34+Math.sin(time*.25)*4,150,50]:set==='stairs'?(p.t>=222?[70-45*p.kiss+Math.sin(time*.25)*2,168-8*p.kiss,260]as GlassPoint:p.stair):[view==='glass-struggle'?0:-75,150,70];}
export function glassCamera(view:CameraView,aspect:number,time:number){const p=glassPose(time),set=glassSet(view,time),person=glassActor(view,time);let target:GlassPoint=[0,135,-10],hh=180,hw=340,dir:GlassPoint=[.12,.08,1],up:GlassPoint=[0,1,0];
 if(view==='glass-singer'||view==='glass-portrait'||view==='glass-annie'){target=[person[0],person[1]+12,person[2]];hh=view==='glass-portrait'?33:47;hw=view==='glass-portrait'?42:64;dir=[.1,.02,1];}
 else if(view==='glass-couple'||view==='glass-kiss'||view==='glass-jealous'){target=[90,153,0];hh=view==='glass-kiss'?43:83;hw=view==='glass-kiss'?70:145;dir=[-.1,.035,1];}
 else if(view==='glass-rival'){target=[-162,156,4];hh=43;hw=65;dir=[.15,.02,1];}
 else if(view==='glass-lover'){target=[119,158,-2];hh=41;hw=56;dir=[-.15,.02,1];}
 else if(view==='glass-gossip'){target=[-92,153,-74];hh=65;hw=145;dir=[.12,.02,1];}
 else if(view==='glass-trio'){target=[16,148,8];hh=105;hw=230;dir=[.1,.05,1];}
 else if(view==='glass-dancers'||view==='glass-party'){target=[0,130,-55];hh=177;hw=355;dir=[.12,.09,1];}
 else if(view==='glass-struggle'){target=[0,145,40];hh=95;hw=143;dir=[.1,.12,1];}
 else if(view==='glass-argument'||view==='glass-pair'||view==='glass-embrace'){target=[11,147,30];hh=view==='glass-embrace'?61:90;hw=view==='glass-embrace'?101:143;dir=[.08,.025,1];}
 else if(set==='corridor'){target=[0,155,-5];hh=193;hw=260;dir=[.12,.04,1];}
 else if(view==='glass-spiral'){target=[0,90,0];hh=255;hw=290;dir=[.03,1,.05];up=[0,0,-1];}
 else if(view==='glass-stairs'){target=[person[0],person[1]-32,person[2]];hh=135;hw=197;dir=[person[0]/140,.2,person[2]/140];}
 else if(view==='glass-rescue'||view==='glass-final-kiss'){target=[20,143,260];hh=view==='glass-final-kiss'?65:100;hw=view==='glass-final-kiss'?106:180;dir=[.15,.04,1];}
 else if(set==='stairs'){target=[0,157,0];hh=190;hw=310;dir=[.25,.1,1];}
 const effective=Math.max(.42,Math.min(16/9,aspect)),fov=35,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as GlassPoint,up,fov};
}
