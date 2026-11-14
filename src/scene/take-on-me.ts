import type {CameraView} from './scene.ts';
export type TakePoint=[number,number,number];
export type TakePlace='race'|'cafe'|'comic'|'window'|'chase'|'home'|'cover';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export const TAKE_SHOTS:[number,CameraView][]=[
 [0,'take-race'],[7,'take-helmet'],[14,'take-race'],[23,'take-wheel'],[30,'take-rivals'],[35,'take-cafe'],[43,'take-book'],[53,'morten'],[61,'take-girl'],[67,'take-hand'],[76,'take-pair'],[84,'take-girl'],[92,'take-window'],[99,'morten'],[107,'take-band'],[117,'take-keyboard'],[125,'take-drums'],[133,'take-rivals'],[140,'take-chase'],[148,'take-run'],[157,'take-rivals'],[165,'morten'],[172,'take-escape'],[178,'take-cafe'],[183,'take-home'],[190,'take-book'],[198,'take-chase'],[205,'take-transform'],[214,'take-girl'],[218,'take-reunion'],[223,'take-cover'],[228,'take-cover']
];
export function takePose(time:number){
 const t=Math.max(0,Math.min(244.4,Number.isFinite(time)?time:0)),place:TakePlace=t<35?'race':t<76?'cafe':t<92?'comic':t<133?'window':t<172?'chase':t<183?'cafe':t<190?'home':t<205?'chase':t<223?'home':'cover',frame=Math.floor(t*12),reach=ease(65,73,t)*(1-ease(75,79,t)),pull=ease(73,81,t),chase=ease(136,147,t)*(1-ease(169,175,t)),escape=ease(167,176,t),transform=ease(205,219,t),scribble=t>=205&&t<218&&(Math.floor(t*8)%4!==0),reunion=ease(218,222,t),beat=(t-3)*169/60;
 const hero:TakePoint=place==='home'?[24+(1-transform)*14*Math.sin(t*12),151,20]:place==='window'?[-100,151,30]:place==='cafe'?[0,142,-30]:place==='chase'?[-35+Math.sin(t*.8)*18,147+Math.sin(t*12)*chase*3,40]:[-10,151,35],girl:TakePoint=place==='cafe'?(t>=172?[155-205*ease(176,182,t),105+43*ease(173,178,t),45]:[-50,112,40]):place==='home'?[-90+100*reunion,147,95-65*reunion]:place==='chase'?[80,147+Math.sin(t*12+1)*chase*3,30]:[100-45*pull,147,45];
 return {t,place,frame,hand:[-25,85+69*reach,54]as TakePoint,clasp:[(hero[0]+girl[0])*.5,116,(hero[2]+girl[2])*.5]as TakePoint,wink:ease(54.9,55.15,t)*(1-ease(55.8,56.2,t)),reach,pull,chase,escape,transform,scribble,reunion,beat,hero,girl,step:Math.sin(t*12)*chase,fade:ease(0,.35,t)*(1-ease(242,243.9,t))};
}
export function takePlace(view:CameraView,time:number):TakePlace{
 if(view==='morten')return takePose(time).place==='cafe'?'comic':takePose(time).place==='cover'?'home':takePose(time).place;
 if(view==='take-girl')return takePose(time).place==='race'?'cafe':takePose(time).place==='cover'?'home':takePose(time).place;
 if(['take-race','take-wheel','take-helmet','take-rivals'].includes(view))return takePose(time).place==='chase'?'chase':'race';
 if(['take-cafe','take-hand'].includes(view))return 'cafe';
 if(['take-window','take-band','take-keyboard','take-drums','take-answer'].includes(view))return 'window';
 if(['take-chase','take-run','take-escape'].includes(view))return 'chase';
 if(['take-home','take-transform','take-reunion'].includes(view))return 'home';
 if(view==='take-cover')return 'cover';
 if(view==='take-book')return time<180?'cafe':time<205?'home':'cover';
 return takePose(time).place;
}
export function takeCamera(view:CameraView,aspect:number,time:number){
 const p=takePose(time),place=takePlace(view,p.t),close=view==='morten'||view==='take-girl'||view==='take-helmet'||view==='take-answer',person=view==='take-girl'?p.girl:view==='take-answer'?[95,150,-110]as TakePoint:p.hero;let target:TakePoint=close?[person[0],person[1]+10,person[2]]:place==='race'?[0,90,-40]:place==='cafe'?[-15,100,-50]:place==='window'?[0,135,-70]:place==='home'?[0,130,0]:place==='cover'?[0,100,0]:[0,120,-110],hh=close?35:place==='race'?155:place==='cover'?130:150,hw=close?42:place==='race'?300:place==='window'?290:place==='cover'?205:260,dir:TakePoint=close?[.08,.02,1]:[.1,.08,1];
 if(view==='take-book'){target=place==='cafe'?(p.t>=172?[p.girl[0],p.girl[1]-43,p.girl[2]+20]:[-45,83,54]):place==='home'?[-85,80,100]:[0,100,0];hh=place==='cover'?125:43;hw=place==='cover'?205:65;dir=[.02,.9,1];}
 if(view==='take-hand'){target=[-25,110,42];hh=80;hw=125;dir=[.12,.35,1];}
 if(view==='take-wheel'){target=[38,29,0];hh=46;hw=65;dir=[.3,.05,1];}
 if(view==='take-keyboard'){target=[95,125,-110];hh=85;hw=120;}
 if(view==='take-drums'){target=[-45,105,-160];hh=95;hw=120;}
 if(view==='take-band'){target=[0,147,-120];hh=105;hw=180;}
 const effective=Math.max(.42,Math.min(4/3,aspect)),fov=38,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*d/n)as TakePoint,fov};
}
