import type {CameraView} from './scene.ts';
export type SkibidiPoint=[number,number,number];
export type SkibidiPlace='street'|'rooster'|'pram'|'pole'|'portrait'|'kiosk'|'gym'|'pub'|'hall'|'bath'|'bed'|'park'|'alley'|'end';
export type SkibidiLook='suit'|'boxers'|'sonya-gym'|'sonya-bed'|'gym-left'|'gym-right'|'friend-grey'|'friend-purple'|'rival';
export const SKIBIDI_SHOTS:[number,CameraView][]=[
 [0,'skibidi-title'],[1.8,'skibidi-street'],[3.7,'skibidi-rooster'],[5.4,'skibidi-street'],[8.3,'skibidi-pram'],[11.7,'skibidi-pole'],[17.1,'skibidi-portrait'],[21,'skibidi-street-close'],[28.6,'skibidi-kiosk'],[33.7,'skibidi-gym'],[39.3,'skibidi-gym-close'],[43.6,'skibidi-gym-trio'],[48.6,'skibidi-pub'],[53.4,'skibidi-bar'],[57.9,'skibidi-street-call'],[62.2,'skibidi-hall'],[66.8,'skibidi-bath'],[71.8,'skibidi-bath-close'],[76.8,'skibidi-bed-wide'],[80.7,'skibidi-bed-overhead'],[85.3,'skibidi-bed-hands'],[91.4,'skibidi-park-talk'],[96,'skibidi-choir'],[100.4,'skibidi-park-trio'],[105.3,'skibidi-doorstep'],[109.3,'skibidi-grey'],[114.4,'skibidi-rivals'],[119.1,'skibidi-rival-close'],[124,'skibidi-alley-row'],[128.5,'skibidi-rival-dance'],[133.6,'skibidi-trio'],[139.6,'skibidi-alley'],[145,'skibidi-suit-close'],[150.2,'skibidi-trio-close'],[155.1,'skibidi-alley-dance'],[160.1,'skibidi-wide-crowd'],[165.5,'skibidi-purple'],[169.5,'skibidi-rival-return'],[173.6,'skibidi-crowd'],[178.3,'skibidi-rooftops'],[183.8,'skibidi-giant'],[188.4,'skibidi-ending'],
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function skibidiView(t:number):CameraView{return SKIBIDI_SHOTS.reduce((v,[at,next])=>t>=at?next:v,'skibidi-title' as CameraView);}
export function skibidiResolve(v:CameraView,t:number):CameraView{return v==='wide'?skibidiView(t):v==='skibidi-ilya'?'skibidi-street-close':v;}
/** The two-beat phrase alternates a lifted knee with a straight heel tap.
 * Bent wrists and reciprocal chest-height fists distinguish it from a generic sway. */
export function skibidiDance(time:number,offset=0){const t=Number.isFinite(time)?Math.max(0,time):0,beat=(t-1.5173)*132/60+offset,cycle=((beat%4)+4)%4,q=beat*Math.PI,step=Math.floor(cycle),u=cycle-step,up=Math.sin(Math.PI*u),side=step%2?1:-1,arms=Math.sin(q),left:SkibidiPoint=[-19, -23+arms*11, 36],right:SkibidiPoint=[19,-23-arms*11,36];
 const knees:SkibidiPoint[]=[-1,1].map(s=>[s*15,-104+(s===side?up*34:0),(s===side?up*38:0)]);
 const feet:SkibidiPoint[]=[-1,1].map(s=>[s*(17+(s!==side?up*9:0)),-146+(s===side?up*53:0),8+(s===side?up*4:up*21)]);
 return{beat,cycle,q,step,up,side,left,right,knees,feet,elbows:[[-37,-20,7],[37,-20,7]]as SkibidiPoint[],wrists:[-.75-arms*.45,.75-arms*.45],lean:Math.sin(q)*.022};}
export function skibidiPose(time:number){const t=Math.max(0,Math.min(193.3,Number.isFinite(time)?time:0)),d=skibidiDance(t);return{...d,t,giant:ease(175.5,184,t),fade:ease(0,.35,t)*(1-ease(191.8,193.1,t))};}
export function skibidiState(view:CameraView,time:number){const p=skibidiPose(time),v=skibidiResolve(view,p.t);let place:SkibidiPlace=v==='skibidi-title'||v==='skibidi-ending'?'end':v==='skibidi-rooster'?'rooster':v==='skibidi-pram'?'pram':v==='skibidi-pole'?'pole':v==='skibidi-portrait'?'portrait':v==='skibidi-kiosk'?'kiosk':v.startsWith('skibidi-gym')?'gym':v==='skibidi-pub'||v==='skibidi-bar'?'pub':v==='skibidi-hall'?'hall':v.startsWith('skibidi-bath')?'bath':v.startsWith('skibidi-bed')?'bed':['skibidi-park-talk','skibidi-choir','skibidi-park-trio','skibidi-doorstep','skibidi-grey'].includes(v)?'park':v.startsWith('skibidi-street')?'street':'alley';
 const scenic=['skibidi-title','skibidi-rooster','skibidi-pram','skibidi-pole','skibidi-portrait','skibidi-choir','skibidi-giant','skibidi-ending'].includes(v),gym=place==='gym',bed=place==='bed',overhead=v==='skibidi-bed-overhead'||v==='skibidi-bed-hands',rival=['skibidi-rivals','skibidi-rival-close','skibidi-rival-dance','skibidi-rival-return'].includes(v),look:SkibidiLook=gym?'sonya-gym':bed||place==='bath'?'boxers':v==='skibidi-grey'?'friend-grey':v==='skibidi-purple'?'friend-purple':rival?'rival':'suit',trio=place==='park'&&!scenic||['skibidi-trio','skibidi-trio-close','skibidi-alley-dance','skibidi-wide-crowd','skibidi-crowd','skibidi-rooftops'].includes(v);return{...p,v,place,scenic,gym,bed,overhead,rival,look,trio,call:v==='skibidi-street-call',crowd:place==='alley',ape:v==='skibidi-rooftops'||v==='skibidi-giant'};}
export function skibidiCamera(view:CameraView,aspect:number,time:number){const p=skibidiState(view,time);let target:SkibidiPoint=[0,120,0],hh=168,hw=278,dir:SkibidiPoint=[.08,.07,1],up:SkibidiPoint=[0,1,0];
 if(p.v.endsWith('close')||p.v==='skibidi-grey'||p.v==='skibidi-purple'){target=[0,174,25];hh=81;hw=135;dir=[.03,.02,1];}
 if(p.place==='gym'){target=[0,120,0];hh=173;hw=310;if(p.v==='skibidi-gym-close'){target=[0,173,24];hh=89;hw=150;}}
 if(p.v==='skibidi-bar'){target=[0,143,-1];hh=151;hw=280;dir=[.23,.08,1];}
 if(p.place==='hall'){target=[0,135,4];hh=184;hw=300;}
 if(p.place==='bath'&&!p.v.endsWith('close')){target=[0,127,0];hh=172;hw=294;}
 if(p.bed){target=[0,92,40];hh=189;hw=308;dir=[.1,.55,1];}
 if(p.overhead){target=[0,64,54];hh=p.v==='skibidi-bed-hands'?144:194;hw=294;dir=[0,1,.005];up=[0,0,-1];}
 if(p.trio&&!p.v.endsWith('close')){target=[0,127,0];hh=177;hw=339;}
 if(p.v==='skibidi-trio-close'){target=[0,168,19];hh=104;hw=241;}
 if(p.rival&&!p.v.endsWith('close')){target=[0,126,0];hh=178;hw=321;}
 if(p.v==='skibidi-alley'||p.v==='skibidi-alley-row'||p.v==='skibidi-wide-crowd'||p.v==='skibidi-crowd'){target=[0,147,-56];hh=218;hw=405;dir=[.12,.12,1];}
 if(p.place==='rooster'){target=[0,153,0];hh=142;hw=230;dir=[0,.04,1];}
 if(p.place==='pram'){target=[0,69,2];hh=120;hw=184;dir=[.03,.85,1];}
 if(p.place==='pole'){target=[0,143,0];hh=196;hw=292;}
 if(p.place==='portrait'){target=[0,121,0];hh=117;hw=215;dir=[.08,.18,1];}
 if(p.place==='kiosk'){target=[34,134,-20];hh=202;hw=352;dir=[.24,.1,1];}
 if(p.v==='skibidi-choir'){target=[0,95,5];hh=143;hw=286;}
 if(p.v==='skibidi-rooftops'){target=[0,280,-108];hh=485;hw=795;dir=[.1,.5,1];}
 if(p.v==='skibidi-giant'){target=[0,631,-686];hh=364;hw=563;dir=[.13,.17,1];}
 if(p.place==='end'){target=[0,151,0];hh=102;hw=240;dir=[0,0,1];}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{...p,target,position:target.map((x,i)=>x+d*dir[i]/n)as SkibidiPoint,up,fov};}
