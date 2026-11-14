import type {CameraView} from './scene.ts';
export type BoyzId='boyz-lead'|'boyz-tenor'|'boyz-baritone'|'boyz-bass'|'dwayne'|'sparks';
export type BoyzPlace='foyer'|'study'|'stage'|'blue'|'vanity'|'letter';
export type BoyzPoint=[number,number,number];
export const BOYZ_IDS:BoyzId[]=['boyz-lead','boyz-tenor','boyz-baritone','boyz-bass','dwayne','sparks'];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const window=(a:number,b:number,t:number)=>ease(a,a+1.2,t)*(1-ease(b-1.2,b,t));
export const BOYZ_SHOTS:[number,CameraView][]=[
 [0,'boyz-foyer'],[5.3,'dwayne'],[7.6,'sparks'],[9.4,'boyz-keypad'],[18,'boyz-foyer'],[22,'sparks'],[26,'dwayne'],[32,'dwayne'],[40,'sparks'],[43.5,'boyz-foyer'],[48,'boyz-study'],[56,'dwayne'],[65,'boyz-study'],[72,'boyz-stage'],[80,'boyz-lead'],[89,'boyz-dissolve'],[95,'boyz-study'],[104,'boyz-blue'],[113,'boyz-dissolve'],[120,'boyz-study'],[129,'boyz-lead'],[137,'boyz-dissolve'],[145,'boyz-study'],[153,'boyz-blue'],[161,'boyz-study'],[168,'boyz-vanity'],[179,'sparks'],[185,'boyz-lead'],[193,'boyz-stairs'],[201,'boyz-letter'],[208,'sparks'],[216,'boyz-letter'],[224,'boyz-stage'],[232,'sparks'],[240,'boyz-letter'],[248,'sparks'],[255,'boyz-letter']
];
export function boyzPose(time:number){
 const t=Math.max(0,Math.min(260.38,Number.isFinite(time)?time:0)),shot=BOYZ_SHOTS.reduce((best,[start],i)=>t>=start?i:best,0),[start,view]=BOYZ_SHOTS[shot],progress=ease(start,BOYZ_SHOTS[shot+1]?.[0]??260.38,t);
 const place:BoyzPlace=t<44?'foyer':view==='boyz-study'||view==='dwayne'?'study':view==='boyz-blue'?'blue':view==='boyz-vanity'||view==='sparks'&&t>=166&&t<196?'vanity':view==='boyz-letter'||view==='sparks'&&t>=196?'letter':view==='boyz-dissolve'?(t<100?'study':t<145?'vanity':'blue'):'stage';
 return {t,shot,view,place,progress,button:window(9,18,t),write:window(49,173,t),read:ease(225,235,t),night:t>166,blue:view==='boyz-blue',echo:view==='boyz-dissolve'?1:0,hand:.5+.5*Math.sin(t*.43),sway:Math.sin(t*.37)*.014,fade:ease(0,.65,t)*(1-ease(256.5,260.1,t))};
}
export function boyzPlace(view:CameraView,time:number):BoyzPlace{
 const p=boyzPose(time);return view==='boyz-foyer'||view==='boyz-keypad'?'foyer':view==='boyz-study'?'study':view==='boyz-stage'||view==='boyz-stairs'||view==='boyz-lead'||view==='boyz-tenor'||view==='boyz-baritone'||view==='boyz-bass'?'stage':view==='boyz-blue'?'blue':view==='boyz-vanity'?'vanity':view==='boyz-letter'?'letter':view==='boyz-dissolve'?(time<100?'study':time<145?'vanity':'blue'):view==='dwayne'?(time<44?'foyer':'study'):view==='sparks'?(time<44?'foyer':time<196?'vanity':'letter'):p.place;
}
export function boyzSubject(id:BoyzId,place:BoyzPlace):BoyzPoint{
 if(id==='dwayne')return place==='foyer'?[-50,150,15]:[-10,112,-10];
 if(id==='sparks')return place==='foyer'?[100,146,25]:place==='vanity'?[0,125,25]:[10,124,30];
 return [[-165,151,0],[-55,151,-14],[55,154,-6],[165,153,0]][BOYZ_IDS.indexOf(id)]as BoyzPoint;
}
export function boyzCamera(view:CameraView,aspect:number,time:number){
 const p=boyzPose(time),place=boyzPlace(view,time),person=BOYZ_IDS.includes(view as BoyzId)?view as BoyzId:undefined,close=!!person,keypad=view==='boyz-keypad',stairs=view==='boyz-stairs',echo=view==='boyz-dissolve';
 const subject=person?boyzSubject(person,place):[0,105,0];if(person==='dwayne'&&place==='foyer'){subject[0]+=90*p.button;subject[2]-=115*p.button;}const target:BoyzPoint=keypad?[105,130,-190]:view==='boyz-blue'?[5,158,0]:close?[subject[0],subject[1]+12,subject[2]+5]:place==='study'?[-5,92,-5]:place==='vanity'?[0,110,0]:place==='letter'?[10,105,15]:[0,108,-20];
 const effective=Math.max(.4,Math.min(4/3,aspect)),hh=keypad?63:view==='boyz-blue'?72:close?43:echo?130:stairs?170:place==='stage'?120:135,hw=keypad?110:view==='boyz-blue'?135:close?54:echo?245:place==='stage'?265:place==='foyer'?285:215,fov=38,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360)*(1-p.progress*(close?.045:.02)),dir:BoyzPoint=stairs?[.14,-.24,1]:close?[p.shot%2?.16:-.14,.03,1]:place==='study'?[.4,.32,1]:[.16,.11,1],n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+d*dir[i]/n)as BoyzPoint,fov};
}
