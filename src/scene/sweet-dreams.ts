import type {CameraView} from './scene.ts';
export type DreamPoint=[number,number,number];
export type DreamSet='board'|'records'|'strings'|'field'|'boat'|'bed';
export const DREAM_SHOTS:[number,CameraView][]=[
 [0,'dreams-boardroom'],[7,'dreams-singer'],[17,'dreams-globe'],[23,'dreams-portrait'],
 [32,'dreams-gloves'],[37,'dreams-keys'],[42,'dreams-duo'],[49,'dreams-fist'],
 [53,'dreams-records'],[61,'dreams-keys'],[67,'dreams-duo'],[74,'dreams-monitor'],
 [79,'dreams-blindfold'],[85,'dreams-eye'],[91,'dreams-strings'],[98,'dreams-cows'],
 [105,'dreams-blindfold'],[110,'dreams-table'],[117,'dreams-keys'],[123,'dreams-kiss'],
 [129,'dreams-eye'],[134,'dreams-pasture'],[141,'dreams-outdoor'],[152,'dreams-cows'],
 [157,'dreams-arms'],[166,'dreams-herd'],[174,'dreams-field-strings'],[180,'dreams-boat'],
 [188,'dreams-eye'],[191,'dreams-bed'],[195,'dreams-cassette'],[199,'dreams-ending']
];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function dreamPose(time:number){const t=Math.max(0,Math.min(214.5,Number.isFinite(time)?time:0)),beat=t*125/60;return{t,beat,tap:Math.max(0,Math.sin(beat*Math.PI)),turn:Math.sin(t*.25)*.055,tilt:Math.sin(t*.48)*.023,board:[0,147,-45]as DreamPoint,field:[15,147,8]as DreamPoint,raise:ease(154,158,t)*(1-ease(164,168,t)),wake:ease(191.2,194,t),fade:ease(0,1.2,t)*(1-ease(212.2,214.2,t))};}
export function dreamSet(view:CameraView,time:number):DreamSet{
 if(view==='wide')return dreamSet(DREAM_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'dreams-boardroom'as CameraView),time);
 if(view==='annie')return time>=79&&time<110?'strings':time>=134&&time<180?'field':time>=180&&time<188?'boat':time>=191?'bed':time>=42&&time<74?'records':'board';
 if(['dreams-records','dreams-duo'].includes(view))return'records';
 if(['dreams-strings','dreams-blindfold'].includes(view))return'strings';
 if(['dreams-pasture','dreams-outdoor','dreams-arms','dreams-cows','dreams-herd','dreams-field-strings'].includes(view))return'field';
 if(view==='dreams-boat')return'boat';if(['dreams-bed','dreams-cassette','dreams-ending'].includes(view))return'bed';return'board';
}
export function dreamCamera(view:CameraView,aspect:number,time:number){const p=dreamPose(time),set=dreamSet(view,time);if(view==='annie')view=set==='strings'?'dreams-blindfold':set==='field'?'dreams-outdoor':set==='boat'?'dreams-boat':set==='bed'?'dreams-bed':'dreams-singer';let target:DreamPoint=[0,114,-25],hh=150,hw=275,dir:DreamPoint=[.12,.12,1],up:DreamPoint=[0,1,0];
 if(['dreams-singer','dreams-portrait','dreams-records','dreams-outdoor'].includes(view)){const pos=set==='field'?p.field:set==='records'?[0,147,20]as DreamPoint:p.board;target=[pos[0],pos[1]+12,pos[2]];hh=view==='dreams-portrait'?31:43;hw=view==='dreams-portrait'?42:56;dir=[.12,.01,1];}
 else if(view==='dreams-gloves'){target=[0,147,-13];hh=52;hw=78;dir=[.08,.03,1];}
 else if(view==='dreams-globe'){target=[-88,105,13];hh=53;hw=71;dir=[.3,.3,1];}
 else if(view==='dreams-fist'){target=[30,88,30];hh=32;hw=51;dir=[.12,.23,1];}
 else if(view==='dreams-keys'||view==='dreams-monitor'){target=[126,view==='dreams-monitor'?151:111,view==='dreams-monitor'?-39:-25];hh=view==='dreams-monitor'?28:85;hw=view==='dreams-monitor'?40:116;dir=[.09,view==='dreams-monitor'?.02:.35,1];}
 else if(view==='dreams-duo'){target=[35,143,12];hh=73;hw=136;dir=[.1,.02,1];}
 else if(view==='dreams-eye'){target=[1,165,-39];hh=10;hw=16;dir=[.12,0,1];}
 else if(view==='dreams-blindfold'){target=[65,152,20];hh=45;hw=59;dir=[.11,.01,1];}
 else if(view==='dreams-strings'||view==='dreams-field-strings'){target=[0,109,13];hh=137;hw=207;dir=[.12,.05,1];}
 else if(view==='dreams-table'){target=[0,83,18];hh=132;hw=180;dir=[.04,.8,1];up=[0,0,-1];}
 else if(view==='dreams-kiss'){target=[-65,151,-110];hh=39;hw=54;dir=[-.4,.08,1];}
 else if(view==='dreams-arms'){target=[15,157,8];hh=94;hw=144;dir=[.12,.01,1];}
 else if(view==='dreams-cows'||view==='dreams-herd'){target=[0,95,-80];hh=170;hw=390;dir=[.08,.12,1];}
 else if(set==='field'){target=[0,109,-10];hh=150;hw=310;dir=[.14,.08,1];}
 else if(set==='boat'){target=[0,85,7];hh=145;hw=210;dir=[.18,.2,1];}
 else if(view==='dreams-cassette'){target=[82,60,20];hh=38;hw=54;dir=[.15,.7,1];}
 else if(set==='bed'){target=[0,62,18];hh=110;hw=176;dir=[.16,1,.5];up=[0,0,-1];}
 const fov=34,effective=Math.max(.42,Math.min(4/3,aspect)),d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((v,i)=>v+dir[i]*d/n)as DreamPoint,up,fov};}
