import type {CameraView} from './scene.ts';
export type PlayerPoint=[number,number,number];
export type PlayerId='player-lead'|'player-bass'|'player-guitar'|'player-keys';
export const PLAYER_PEOPLE=[
 {id:'player-lead',position:[25,150,80],colour:'#7fa8ca',instrument:'guitar'},
 {id:'player-bass',position:[-110,150,50],colour:'#9c2729',instrument:'bass'},
 {id:'player-guitar',position:[155,150,12],colour:'#ddd8c8',instrument:'guitar'},
 {id:'player-keys',position:[-145,132,-125],colour:'#4d7da7',instrument:'keys'},
 {id:'player-drums',position:[-30,153,-190],colour:'#342d28',instrument:'drums'},
]as const;
/** Cuts follow the supplied four-minute vintage performance, not a looping montage. */
export const PLAYER_SHOTS:[number,CameraView][]=[
 [0,'player-keyboard'],[8,'player-fretboard'],[18,'player-stage'],[27,'player-lead'],[43,'player-profile'],[52,'player-lead'],[65,'player-trio'],[80,'player-keys'],[87,'player-lead'],[103,'player-bass'],[112,'player-lead'],[124,'player-profile'],[137,'player-trio'],[151,'player-stage'],[163,'player-guitar'],[175,'player-keys'],[184,'player-lead'],[198,'player-profile'],[210,'player-trio'],[221,'player-drums'],[228,'player-fretboard'],[237,'player-stage'],[245,'player-drums']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function playerPose(time:number){
 const t=Math.max(0,Math.min(250.5,Number.isFinite(time)?time:0)),beat=t*81.7/60,phase=beat*Math.PI*2;
 return{t,beat,phase,sway:Math.sin(phase*.5),strum:Math.sin(phase*2),kick:Math.max(0,Math.cos(phase))**9,fade:ease(0,.8,t)*(1-ease(246,250.12,t)),solo:t>219};
}
export function playerCamera(view:CameraView,aspect:number,time:number){
 const p=playerPose(time),fov=33;let target:PlayerPoint=[5,106,-45],halfHeight=138,halfWidth=245,dir:PlayerPoint=[.08,.08,1];
 const who=PLAYER_PEOPLE.find(a=>a.id===view);
 if(who){target=[who.position[0],who.position[1]+10,who.position[2]+3];halfHeight=39;halfWidth=43;dir=[-.06,.02,1];}
 if(view==='player-keyboard'){target=[-145,99,-75];halfHeight=49;halfWidth=85;dir=[.65,.75,1];}
 if(view==='player-fretboard'){target=[51,86,110];halfHeight=46;halfWidth=65;dir=[.15,.15,1];}
 if(view==='player-drums'){target=[-30,119,-166];halfHeight=91;halfWidth=120;dir=[1,.7,.4];}
 if(view==='player-trio'){target=[20,126,55];halfHeight=84;halfWidth=205;dir=[-.06,.02,1];}
 if(view==='player-profile'){target=[23,153,50];halfHeight=50;halfWidth=145;dir=[1,.05,.24];}
 // Ease a restrained optical push-in while preserving complete heads on narrow screens.
 const push=1-.025*Math.sin(p.t*.1),a=Math.max(.42,Math.min(4/3,aspect)),d=Math.max(halfHeight,halfWidth/a)*push/Math.tan(fov*Math.PI/360),norm=Math.hypot(...dir);
 return{target,position:target.map((v,i)=>v+dir[i]*d/norm)as PlayerPoint,fov};
}
