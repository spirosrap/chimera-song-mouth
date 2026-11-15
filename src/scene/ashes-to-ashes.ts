import type {CameraView} from './scene.ts';
export type AshPoint=[number,number,number];
export type AshSet='beach'|'procession'|'room'|'portrait'|'kitchen'|'water'|'blue'|'ending';
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export const ASH_SHOTS:[number,CameraView][]=[
 [0,'ashes-beach'],[10,'ashes-pierrot'],[24,'ashes-card'],[29,'ashes-procession'],[37,'ashes-cliffs'],[42,'ashes-room'],[49,'ashes-patient'],[56,'ashes-card'],[61,'ashes-portrait'],[68,'ashes-procession'],[78,'ashes-cliffs'],[86,'ashes-corner'],[94,'ashes-patient'],[100,'ashes-kitchen'],[107,'ashes-nurses'],[115,'ashes-water'],[131,'ashes-blue'],[139,'ashes-astronaut'],[145,'ashes-pierrot'],[150,'ashes-dozer'],[157,'ashes-cliffs'],[162,'ashes-corner'],[169,'ashes-card'],[176,'ashes-kitchen'],[182,'ashes-water'],[189,'ashes-mother'],[196,'ashes-ending'],[202,'ashes-blue'],[209,'ashes-dissolve']
];
const cuts:[number,AshSet][]=[[0,'beach'],[29,'procession'],[37,'beach'],[42,'room'],[56,'beach'],[61,'portrait'],[68,'procession'],[78,'beach'],[86,'room'],[100,'kitchen'],[115,'water'],[131,'blue'],[145,'beach'],[150,'procession'],[157,'beach'],[162,'room'],[169,'beach'],[176,'kitchen'],[182,'water'],[189,'beach'],[196,'ending'],[202,'blue']];
export function ashPose(time:number){
 const t=Math.max(0,Math.min(217.2,Number.isFinite(time)?time:0)),set=cuts.reduce((s,[at,next])=>t>=at?next:s,'beach' as AshSet),walk=Math.sin(t*3.55),travel=(t%24)/24,clown:AshPoint=[Math.sin(t*.14)*10,150+Math.abs(walk)*1.2,15],patient:AshPoint=[-55*ease(78,90,t),143-40*ease(78,90,t),-20],wade:AshPoint=[0,42+Math.sin(t*.8)*1.4,0],mother=t>=189&&t<202||t>=37&&t<42;
 return{t,set,walk,travel,clown,patient,wade,mother,nod:Math.sin(t*.63)*.045,turn:Math.sin(t*.3)*.055,tilt:Math.sin(t*.43)*.035,card:t>=24&&t<29||t>=56&&t<61||t>=169&&t<176,listen:ease(189,194,t),point:Math.sin(t*1.25)*.5+.5,dissolve:t>=209?ease(209,214,t):0,fade:ease(0,.7,t)*(1-ease(213.5,216.5,t))};
}
export function ashSet(view:CameraView,time:number):AshSet{
 if(view==='ashes-bowie')return'beach';const map:Partial<Record<CameraView,AshSet>>={'ashes-pierrot':'beach','ashes-beach':'beach','ashes-cliffs':'beach','ashes-card':'beach','ashes-procession':'procession','ashes-dozer':'procession','ashes-patient':'room','ashes-room':'room','ashes-corner':'room','ashes-portrait':'portrait','ashes-astronaut':'blue','ashes-kitchen':'kitchen','ashes-nurses':'kitchen','ashes-water':'water','ashes-blue':'blue','ashes-mother':'beach','ashes-ending':'ending','ashes-dissolve':'blue'};return map[view]??ashPose(time).set;
}
export function ashCamera(view:CameraView,aspect:number,time:number){
 const p=ashPose(time),set=ashSet(view,p.t),fov=34;let target:AshPoint=[0,100,-10],hh=155,hw=260,dir:AshPoint=[.04,.04,1];
 if(view==='ashes-pierrot'||view==='ashes-bowie'){target=[p.clown[0],p.clown[1]+17,p.clown[2]];hh=44;hw=46;}
 else if(view==='ashes-portrait'){target=[0,11,0];hh=23;hw=32;}
 else if(view==='ashes-card'){target=[p.clown[0]+3,p.clown[1]-2,p.clown[2]+10];hh=57;hw=70;}
 else if(view==='ashes-patient'){target=[p.patient[0],p.patient[1]+9,p.patient[2]];hh=34;hw=43;dir=[-.13,.04,1];}
 else if(view==='ashes-corner'){target=[-20,94,-10];hh=150;hw=215;dir=[.34,.5,1];}
 else if(set==='room'){target=[0,145,-45];hh=185;hw=270;}
 else if(view==='ashes-nurses'){target=[0,152,-10];hh=92;hw=150;}
 else if(set==='kitchen'){target=[0,108,-20];hh=130;hw=200;dir=[.18,.12,1];}
 else if(view==='ashes-astronaut'){target=[0,150,0];hh=46;hw=60;}
 else if(set==='blue'){target=[0,110,-10];hh=140;hw=220;dir=[-.12,.2,1];}
 else if(set==='water'){target=[0,45,0];hh=79;hw=120;dir=[.06,.16,1];}
 else if(view==='ashes-dozer'){target=[0,108,-100];hh=150;hw=235;}
 else if(view==='ashes-mother'){target=[36,117,12];hh=112;hw=175;}
 else if(view==='ashes-cliffs'){target=[0,115,-70];hh=180;hw=320;dir=[-.15,.06,1];}
 else if(view==='ashes-ending'){target=[0,125,-20];hh=225;hw=400;}
 const effective=Math.max(.42,Math.min(4/3,aspect)),d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((v,i)=>v+dir[i]*d/n)as AshPoint,fov};
}
