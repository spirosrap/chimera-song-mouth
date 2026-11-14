import type {CameraView} from './scene.ts';
export type AmadeusId='falco'|'amadeus-tenor'|'amadeus-bass';
export type AmadeusPlace='titles'|'street'|'hall'|'bar';
export type AmadeusPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export const AMADEUS_SHOTS:[number,CameraView][]=[
 [0,'amadeus-vienna'],[25,'amadeus-coach'],[35,'amadeus-arrival'],[41,'falco'],[48,'amadeus-court'],[55,'falco'],[61,'amadeus-hall'],[66,'falco'],[74,'amadeus-court'],[79,'amadeus-hall'],[82,'amadeus-street'],[88,'amadeus-wig'],[93,'amadeus-bar'],[99,'amadeus-wig'],[105,'amadeus-bikers'],[111,'amadeus-wig'],[117,'amadeus-bikers'],[123,'amadeus-wig'],[130,'amadeus-bar'],[137,'amadeus-hall'],[143,'falco'],[149,'amadeus-court'],[157,'falco'],[163,'amadeus-court'],[168,'falco'],[174,'amadeus-motorcycles'],[182,'amadeus-motorcycles'],[190,'amadeus-court'],[197,'amadeus-hall'],[204,'falco'],[211,'amadeus-hall'],[217,'amadeus-wig'],[220,'amadeus-prayer']
];
/** One source clock for the title postcard, costumes, coach, bikers and final prayer. */
export function amadeusPose(time:number){
 const t=Math.max(0,Math.min(224.7,Number.isFinite(time)?time:0)),place:AmadeusPlace=t<25?'titles':t<35?'street':t<82?'hall':t<93?'street':t<137?'bar':t<217?'hall':'bar',shot=AMADEUS_SHOTS.reduce((n,[at],j)=>t>=at?j:n,0),[start,view]=AMADEUS_SHOTS[shot],progress=ease(start,AMADEUS_SHOTS[shot+1]?.[0]??224.65,t),beat=(t-28.4)*89.4/60,step=Math.sin(beat*Math.PI);
 const rap=t>=50&&t<73.5||t>=94&&t<115.5,prayer=ease(217,220,t),motorcycles=ease(172,185,t),enter=ease(25,40,t),open=.5+.5*Math.sin(beat*Math.PI*.5),point=.5+.5*Math.sin(beat*Math.PI*.7);
 const tux:AmadeusPoint=[Math.sin(t*.2)*6,151,80+Math.sin(t*.3)*6],wig:AmadeusPoint=[0,151,place==='street'?75:70];
 return {t,place,shot,view,progress,beat,step,rap,prayer,motorcycles,enter,open,point,tux,wig,fade:ease(0,.6,t)*(1-ease(223.4,224.3,t))};
}
export function amadeusPlace(view:CameraView,time:number):AmadeusPlace{
 if(view==='amadeus-vienna')return 'titles';
 if(view==='amadeus-wig')return amadeusPose(time).place==='street'&&time>=80?'street':'bar';
 if(view==='amadeus-tenor'||view==='amadeus-bass')return amadeusPose(time).place==='hall'?'hall':'bar';
 if(view==='amadeus-coach'||view==='amadeus-street')return 'street';
 if(view==='amadeus-arrival'||view==='amadeus-hall'||view==='amadeus-court'||view==='amadeus-motorcycles'||view==='falco')return 'hall';
 if(view==='amadeus-bar'||view==='amadeus-bikers'||view==='amadeus-prayer')return 'bar';
 return amadeusPose(time).place;
}
export function amadeusCamera(view:CameraView,aspect:number,time:number){
 const p=amadeusPose(time),place=amadeusPlace(view,time),close=view==='falco'||view==='amadeus-wig'||view==='amadeus-prayer'||view==='amadeus-tenor'||view==='amadeus-bass',wig=view==='amadeus-wig'||view==='amadeus-prayer',choir=view==='amadeus-tenor'||view==='amadeus-bass',person:AmadeusPoint=choir?[view==='amadeus-tenor'?-110:110,150,20]:wig?p.wig:p.tux;
 const target:AmadeusPoint=place==='titles'?[0,250,-80]:close?[person[0],person[1]+12,person[2]]:view==='amadeus-motorcycles'?[0,100,-100]:view==='amadeus-coach'?[30,120,-90]:place==='street'?[0,140,-40]:place==='bar'?[0,118,-35]:[0,160,-150];
 const hh=close?39:place==='titles'?290:place==='bar'?155:place==='street'?210:230,hw=close?47:place==='titles'?570:place==='bar'?300:place==='street'?470:460,effective=Math.max(.42,Math.min(4/3,aspect)),fov=38,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360)*(1-p.progress*(close?.035:.015)),dir:AmadeusPoint=view==='amadeus-coach'?[1,.1,.45]:view==='amadeus-hall'?[.18,-.17,1]:view==='amadeus-motorcycles'?[.25,-.08,1]:view==='amadeus-court'?[-.25,.12,1]:close?[p.shot%2?.12:-.1,.025,1]:[.07,.08,1],n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+d*dir[i]/n)as AmadeusPoint,fov};
}
