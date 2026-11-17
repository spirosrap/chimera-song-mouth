import type{CameraView}from'./scene.ts';
export type AperturePoint=[number,number,number];
export type AperturePlace='room'|'mirror'|'corridor'|'lobby'|'exterior'|'escalator'|'stairs'|'hall'|'lounge';
export const APERTURE_SHOTS:[number,CameraView][]=[
 [0,'aperture-room'],[5.8,'aperture-call'],[10,'aperture-window'],[17,'aperture-chair'],[24,'aperture-dress'],[34,'aperture-shoes'],[41,'aperture-mirror'],[47,'aperture-wash'],[54,'aperture-door'],[59,'aperture-corridor'],[65,'aperture-lobby'],[72,'aperture-reception'],[77,'aperture-bell'],[82,'aperture-desk'],[89,'aperture-tower'],[95,'aperture-portrait'],[101,'aperture-stranger'],[107,'aperture-escalator'],[113,'aperture-wait'],[119,'aperture-face'],[125,'aperture-bag'],[131,'aperture-chase'],[137,'aperture-landing'],[143,'aperture-spiral'],[148,'aperture-tumble'],[154,'aperture-stair-wide'],[159,'aperture-stair-end'],[163,'aperture-run'],[168,'aperture-clash'],[173,'aperture-hall'],[179,'aperture-drink'],[185,'aperture-footwork'],[191,'aperture-think'],[197,'aperture-grapple'],[203,'aperture-lift'],[208,'aperture-invert'],[214,'aperture-pair'],[220,'aperture-mirror-walk'],[226,'aperture-arms'],[232,'aperture-hall-wide'],[238,'aperture-duet'],[244,'aperture-dance'],[250,'aperture-leap'],[256,'aperture-balance'],[262,'aperture-planter'],[268,'aperture-low-run'],[274,'aperture-goodbye'],[280,'aperture-lounge'],[286,'aperture-return'],[292,'aperture-upstairs'],[299,'aperture-escalator-return'],[305,'aperture-desk-return'],[310,'aperture-staff'],[316,'aperture-exit'],[322,'aperture-room-return'],[329,'aperture-room-close'],[335,'aperture-coat'],[341,'aperture-bed'],[348.5,'aperture-ending']
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function apertureView(t:number):CameraView{return APERTURE_SHOTS.reduce((v,[a,n])=>t>=a?n:v,'aperture-room'as CameraView);}
export function aperturePose(time:number){const t=Math.max(0,Math.min(351.46,Number.isFinite(time)?time:0)),beat=(t-58.82)*128/60,q=beat*Math.PI;return{t,beat,q,fall:ease(143,161,t),lift:ease(202.5,207,t),fade:ease(0,.6,t)*(1-ease(348.5,351.45,t))};}
export function apertureState(view:CameraView,time:number){const p=aperturePose(time),v=view==='wide'?apertureView(p.t):view==='aperture-harry'?'aperture-face':view==='aperture-clerk'?'aperture-staff':view;let place:AperturePlace='lobby';
 if(['aperture-room','aperture-call','aperture-window','aperture-chair','aperture-dress','aperture-shoes','aperture-room-return','aperture-room-close','aperture-coat','aperture-bed','aperture-ending'].includes(v))place='room';
 if(['aperture-mirror','aperture-wash'].includes(v))place='mirror';if(['aperture-door','aperture-corridor','aperture-chase','aperture-run','aperture-clash','aperture-grapple','aperture-pair','aperture-arms','aperture-low-run','aperture-goodbye','aperture-return'].includes(v))place='corridor';if(['aperture-escalator','aperture-upstairs','aperture-escalator-return'].includes(v))place='escalator';if(v==='aperture-tower')place='exterior';if(['aperture-landing','aperture-spiral','aperture-tumble','aperture-stair-wide','aperture-stair-end'].includes(v))place='stairs';if(['aperture-hall','aperture-hall-wide','aperture-duet','aperture-dance','aperture-invert'].includes(v))place='hall';if(v==='aperture-lounge')place='lounge';
 const scenic=['aperture-shoes','aperture-bell','aperture-tower','aperture-bag','aperture-footwork','aperture-ending'].includes(v),pair=['aperture-stranger','aperture-chase','aperture-clash','aperture-grapple','aperture-lift','aperture-invert','aperture-pair','aperture-arms','aperture-duet','aperture-dance','aperture-leap','aperture-balance','aperture-planter','aperture-goodbye'].includes(v),seated=v==='aperture-bed'||v==='aperture-chair'||v==='aperture-lounge';let pos:AperturePoint=[0,151,40],tilt=0,turn=0;if(v==='aperture-chair')pos=[-190,137,112];if(v==='aperture-bed')pos=[122,154,-11];if(v==='aperture-lounge')pos=[-130,137,15];
 if(place==='stairs'){pos=[Math.sin(p.fall*Math.PI*1.5)*105,151+(1-p.fall)*96,146];if(v==='aperture-tumble'||v==='aperture-stair-wide')tilt=-p.fall*Math.PI*3.2;}
 if(place==='escalator')pos=[-45+ease(292,305,p.t)*95,151+ease(292,305,p.t)*84,72];
 if(v==='aperture-lift'){pos=[-37,188,67];tilt=Math.PI/2+.08*Math.sin(p.q);}
 if(v==='aperture-invert'){pos=[0,197,63];tilt=Math.PI+Math.sin(p.q)*.06;}
 if(v==='aperture-leap'||v==='aperture-planter'){pos=[0,173+Math.sin(p.q*.5)**2*48,102];tilt=Math.sin(p.q*.5)*.7;}
 if(v==='aperture-balance'){pos=[-20,179,118];tilt=-.65;}
 if(v==='aperture-dance'||v==='aperture-duet'){pos=[-72,151,43];tilt=Math.sin(p.q)*.07;}
 const dance=['aperture-hall','aperture-arms','aperture-hall-wide','aperture-duet','aperture-dance','aperture-leap','aperture-balance','aperture-planter'].includes(v),staff=v==='aperture-staff',phone=p.t<9,mirror=place==='mirror';return{...p,v,place,scenic,pair,seated,pos,tilt,turn,dance,staff,phone,mirror,drink:v==='aperture-drink',run:v==='aperture-run'||v==='aperture-chase'||v==='aperture-low-run'||v==='aperture-return'};
}
export function apertureCamera(view:CameraView,aspect:number,time:number){const p=apertureState(view,time);let target:AperturePoint=[p.pos[0],p.pos[1]-19,p.pos[2]],hh=180,hw=315,dir:AperturePoint=[.1,.07,1],up:AperturePoint=[0,1,0];
 if(['aperture-face','aperture-portrait','aperture-think','aperture-wait','aperture-room-close','aperture-call','aperture-drink'].includes(p.v)){target=[p.pos[0],p.pos[1]+24,p.pos[2]+14];hh=83;hw=143;dir=[.035,.02,1];}
 if(p.place==='room'&&['aperture-room','aperture-window','aperture-dress','aperture-room-return','aperture-coat'].includes(p.v)){target=[0,127,3];hh=198;hw=360;dir=[.18,.09,1];}
 if(p.v==='aperture-bed'||p.v==='aperture-chair'){target=[0,104,20];hh=165;hw=293;dir=[.14,.11,1];}
 if(p.v==='aperture-mirror'||p.v==='aperture-wash'){target=[0,151,58];hh=157;hw=273;dir=[.1,.1,1];}
 if(p.pair){target=[12,p.pos[1]-6,38];hh=197;hw=355;dir=[.04,.1,1];}
 if(p.place==='stairs'){target=[p.pos[0]*.35,p.pos[1]-12,62];hh=244;hw=403;dir=[.2,.16,1];}
 if(p.v==='aperture-spiral'){target=[0,192,-94];hh=325;hw=480;dir=[.23,.35,1];}
 if(p.v==='aperture-lift'){target=[-29,156,47];hh=214;hw=372;dir=[.03,.12,1];}
 if(p.v==='aperture-invert'){target=[0,251,44];hh=226;hw=375;dir=[.025,.035,1];}
 if(p.v==='aperture-hall-wide'){target=[0,141,-84];hh=229;hw=425;dir=[.12,.1,1];}
 if(p.place==='escalator'){target=[0,p.pos[1]-15,-30];hh=235;hw=392;dir=[.2,.12,1];}
 if(p.v==='aperture-bell'){target=[-39,117,101];hh=64;hw=118;dir=[.02,.27,1];}
 if(p.v==='aperture-bag'){target=[52,48,59];hh=81;hw=137;dir=[.06,.18,1];}
 if(p.v==='aperture-shoes'||p.v==='aperture-footwork'){target=[0,32,32];hh=59;hw=112;dir=[.09,.17,1];}
 if(p.place==='exterior'){target=[0,244,-105];hh=313;hw=424;dir=[.18,.1,1];}
 if(p.staff){target=[154,177,-25];hh=105;hw=177;dir=[.05,.015,1];}
 if(p.v==='aperture-reception'||p.v==='aperture-desk'||p.v==='aperture-desk-return'){target=[0,144,-23];hh=193;hw=350;dir=[.16,.09,1];}
 if(p.v==='aperture-lounge'){target=[0,125,12];hh=192;hw=345;dir=[.16,.13,1];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...p,target,position:target.map((x,i)=>x+d*dir[i]/n)as AperturePoint,up,fov};
}
