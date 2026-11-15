import type {CameraView} from './scene.ts';
export type SledgePoint=[number,number,number];
export type SledgeSet='micro'|'portrait'|'train'|'clouds'|'speaker'|'chalk'|'popcorn'|'clay'|'fish'|'fruit'|'flowers'|'cardboard'|'marble'|'redroom'|'junk'|'theatre'|'room'|'lights'|'credits';
export const SLEDGE_SHOTS:[number,CameraView][]=[
 [0,'sledge-micro'],[39,'sledge-eye'],[47,'sledge-mouth'],[56,'gabriel'],[64,'sledge-train'],[72,'gabriel'],[78,'sledge-clouds'],[83,'sledge-speaker'],[90,'sledge-chalk'],[102,'sledge-popcorn'],[110,'sledge-flip'],[117,'sledge-clay'],[126,'sledge-fish'],[143,'sledge-fruit'],[166,'sledge-flowers'],[171,'sledge-cardboard'],[183,'sledge-marble'],[187,'sledge-redroom'],[196,'sledge-junk'],[200,'sledge-theatre'],[206,'sledge-chickens'],[219,'sledge-room'],[228,'gabriel'],[235,'sledge-dance'],[256,'sledge-crowd'],[267,'gabriel'],[272,'sledge-furniture'],[285,'sledge-lights'],[310,'sledge-credits']
];
const cuts:[number,SledgeSet][]=[[0,'micro'],[39,'portrait'],[64,'train'],[72,'portrait'],[78,'clouds'],[83,'speaker'],[90,'chalk'],[102,'popcorn'],[110,'portrait'],[117,'clay'],[126,'fish'],[143,'fruit'],[166,'flowers'],[171,'cardboard'],[183,'marble'],[187,'redroom'],[196,'junk'],[200,'theatre'],[219,'room'],[285,'lights'],[310,'credits']];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function sledgePose(time:number){
 const t=Math.max(0,Math.min(345.5,Number.isFinite(time)?time:0)),stop=Math.floor(t*9+1e-7)/9,beat=(stop-55)*96/60,set=cuts.reduce((s,[at,next])=>t>=at?next:s,'micro' as SledgeSet),dance=Math.sin(beat*Math.PI),travel=Math.sin(beat*Math.PI*.5);
 return {t,stop,beat,set,dance,travel,root:[travel*10,150+Math.abs(dance)*3,0]as SledgePoint,yaw:Math.sin(beat*.42)*.17,tilt:Math.sin(beat*.9)*.035,flip:t>=110&&t<117?Math.PI:0,fruit:ease(143,153,t)*(1-ease(160,167,t)),clay:set==='clay',shirt:t>=230,jacket:t<230,chair:ease(272,285,stop),fade:ease(0,1.5,t)*(1-ease(343,345,t))};
}
export function sledgeSet(view:CameraView,time:number):SledgeSet{
 const p=sledgePose(time);if(view==='sledge-chorus')return'room';const explicit:Partial<Record<CameraView,SledgeSet>>={'sledge-micro':'micro','sledge-train':'train','sledge-clouds':'clouds','sledge-speaker':'speaker','sledge-chalk':'chalk','sledge-popcorn':'popcorn','sledge-clay':'clay','sledge-fish':'fish','sledge-fruit':'fruit','sledge-flowers':'flowers','sledge-cardboard':'cardboard','sledge-marble':'marble','sledge-redroom':'redroom','sledge-junk':'junk','sledge-theatre':'theatre','sledge-chickens':'theatre','sledge-room':'room','sledge-dance':'room','sledge-crowd':'room','sledge-furniture':'room','sledge-lights':'lights','sledge-credits':'credits'};
 if(explicit[view])return explicit[view]!;if(view==='sledge-eye'||view==='sledge-mouth'||view==='sledge-flip')return'portrait';if(view==='gabriel'&&(p.set==='micro'||p.set==='credits'||p.set==='lights'||p.set==='theatre'))return'portrait';return p.set;
}
export function sledgeCamera(view:CameraView,aspect:number,time:number){
 const p=sledgePose(time),set=sledgeSet(view,time),room=set==='room',root=room?p.root:[0,0,0]as SledgePoint;let target:SledgePoint=room?[0,100,-20]:[0,10,0],hh=room?115:28,hw=room?190:37,dir:SledgePoint=[0,.025,1];
 if(view==='gabriel'){target=[root[0],root[1]+(room||!p.flip?11:-11),root[2]];hh=26;hw=34;}
 if(view==='sledge-chorus'){target=[-86,143,-50];hh=26;hw=34;}
 if(view==='sledge-flip'||view==='wide'&&p.flip){target=[0,-11,0];}
 if(view==='sledge-eye'){target=[-2.7,14.6,5];hh=4.3;hw=7;}
 if(view==='sledge-mouth'){target=[0,7,7];hh=6;hw=10;}
 if(view==='sledge-micro'){target=[0,0,0];hh=40;hw=53;}
 if(view==='sledge-cardboard'||view==='sledge-redroom'||view==='sledge-junk'){target=[0,5,0];hh=38;hw=51;}
 if(view==='sledge-theatre'||view==='sledge-chickens'){target=[0,37,0];hh=58;hw=88;dir=[0,.1,1];}
 if(view==='sledge-furniture'){target=[0,85,-5];hh=105;hw=155;}
 if(view==='sledge-crowd'){target=[0,111,-25];hh=83;hw=150;}
 if(view==='sledge-lights'){target=[0,85,0];hh=115;hw=175;}
 if(view==='sledge-credits'){target=[0,3,0];hh=48;hw=64;}
 const fov=34,effective=Math.max(.42,Math.min(4/3,aspect)),distance=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((v,i)=>v+dir[i]*distance/n)as SledgePoint,fov};
}
