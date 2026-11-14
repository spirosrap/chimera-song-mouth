import type {CameraView} from './scene.ts';
export type WutheringPoint=[number,number,number];
export type WutheringGesture='cup'|'frame'|'reach'|'cross'|'turn'|'high'|'beckon'|'away';
const ease=(a:number,b:number,t:number)=>{if(b<=a)return t>=b?1:0;const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** Sampled poses from the supplied red-dress film, including its long dance outro. */
export const WUTHERING_DANCE:[number,WutheringGesture,number,number,number][]=[
 [0,'away',0,70,-50],[7,'high',0,0,30],[13,'frame',0,0,30],[20,'cup',0,0,30],[27,'frame',0,0,30],[33,'reach',0,-15,20],[39,'turn',180,-25,10],[45,'reach',360,20,20],[51,'cross',360,10,30],[57,'high',360,0,15],[63,'turn',540,15,5],[70,'cup',720,-15,25],[76,'frame',720,0,30],[82,'reach',720,15,20],[89,'cross',720,5,20],[96,'cup',720,0,35],[102,'high',720,10,10],[109,'turn',1080,-20,0],[115,'high',1080,0,20],[122,'beckon',1080,5,35],[129,'frame',1080,0,30],[136,'reach',1080,20,20],[143,'beckon',1080,0,30],[150,'cross',1080,-10,30],[157,'high',1080,0,10],[164,'turn',1440,20,0],[171,'cup',1440,5,20],[178,'frame',1440,0,35],[185,'reach',1440,0,35],[193,'high',1440,-15,20],[200,'high',1440,0,10],[208,'turn',1800,15,-20],[216,'reach',1800,-15,-80],[224,'high',1800,5,-160],[232,'turn',2160,20,-230],[240,'frame',2160,-10,-290],[250,'reach',2160,15,-350],[261,'away',2340,0,-390],[270,'away',2340,0,-410]
];
export const WUTHERING_SHOTS:[number,CameraView][]=[
 [0,'wuthering-grove'],[6.5,'kate'],[15,'wuthering-profile'],[20,'kate'],[25,'wuthering-hands'],[32,'wuthering-dance'],[41,'wuthering-medium'],[48,'kate'],[57,'wuthering-dance'],[72,'kate'],[83,'wuthering-dance'],[92,'wuthering-hands'],[102,'wuthering-dance'],[112,'kate'],[126,'wuthering-dance'],[138,'kate'],[146,'wuthering-hands'],[154,'wuthering-dance'],[173,'kate'],[183,'wuthering-medium'],[192,'kate'],[201,'wuthering-outro']
];
const hands:Record<WutheringGesture,[WutheringPoint,WutheringPoint]>={
 cup:[[-14,5,26],[14,5,26]],frame:[[-20,19,22],[21,24,16]],reach:[[-78,-10,19],[78,-2,16]],cross:[[9,-12,32],[-9,-8,35]],turn:[[-71,-15,7],[71,-15,7]],high:[[-37,59,8],[66,22,11]],beckon:[[-29,-39,25],[21,3,35]],away:[[-58,20,-7],[58,9,-12]]
};
export function wutheringGround(x:number,z:number){return Math.sin(x*.013)*1.8+Math.sin(z*.009)*2.2;}
export function wutheringPose(time:number){
 const t=Math.max(0,Math.min(270.52,Number.isFinite(time)?time:0)),i=WUTHERING_DANCE.reduce((n,[at],j)=>t>=at?j:n,0),a=WUTHERING_DANCE[i],b=WUTHERING_DANCE[Math.min(i+1,WUTHERING_DANCE.length-1)],f=ease(a[0],b[0],t),mix=(x:number,y:number)=>x+(y-x)*f;
 const gesture=a[1],turn=mix(a[2],b[2])*Math.PI/180,velocity=(b[2]-a[2])/Math.max(.1,b[0]-a[0]),spin=Math.min(1,Math.abs(velocity)/40)*Math.sin(f*Math.PI),beat=t*125/60,step=Math.sin(beat*Math.PI),x=mix(a[3],b[3]),z=mix(a[4],b[4]),lean=.08*Math.sin(t*.65),crouch=mix(a[1]==='cup'?.25:0,b[1]==='cup'?.25:0)+.12*(1-Math.cos(beat*Math.PI*2));
 const root:WutheringPoint=[x,150+wutheringGround(x,z)-crouch*12+Math.sin(t*1.3)*1.4,z];
 const wrists=hands[a[1]].map((p,j)=>p.map((v,k)=>mix(v,hands[b[1]][j][k]))as WutheringPoint)as [WutheringPoint,WutheringPoint];
 return {t,gesture,turn,spin,beat,step,lean,crouch,root,wrists,wind:Math.sin(t*.9)*.6+.5,fade:ease(0,.8,t)*(1-ease(264,269.9,t)),visible:t<269.9};
}
export function wutheringCamera(view:CameraView,aspect:number,time:number){
 const p=wutheringPose(time),close=view==='kate'||view==='wuthering-profile'||view==='wuthering-hands',medium=view==='wuthering-medium',outro=view==='wuthering-outro'||time>=201&&view==='wide',grove=view==='wuthering-grove';
 const target:WutheringPoint=close?[p.root[0],p.root[1]+10,p.root[2]]:medium?[p.root[0],p.root[1]-32,p.root[2]]:outro?[0,112,-110]:grove?[0,165,-175]:[p.root[0]*.3,99,0];
 const hh=close?37:medium?74:outro?205:grove?210:125,hw=close?43:medium?90:outro?350:grove?390:205,effective=Math.max(.42,Math.min(656/480,aspect)),fov=38,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),yaw=close?p.turn+(view==='wuthering-profile'?.65:.06):.04;
 return {target,position:[target[0]+d*Math.sin(yaw),target[1]+d*(close?.02:.045),target[2]+d*Math.cos(yaw)]as WutheringPoint,fov};
}
