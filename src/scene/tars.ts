import type {CameraView} from './scene.ts';
export type TarsSpeaker='tars'|'cooper'|'doyle';
export type RangerPerson='cooper'|'doyle'|'brand'|'romilly';
export type RangerPoint=[number,number,number];
export const TARS_TIMELINE:readonly (readonly [number,number])[]=[[0,0],[2,2],[2.94353,2.94353],[5.76194,5.76194],[11.3421,11.3421],[15.12263,15.12263],[16.7624,16.8588257],[20.68358,20.68358],[22.10245,22.10245],[24.82,26.206242],[25.74,27.4291587],[31.06284,32.6928187],[32.72276,35.2381962],[34.38352,37.451476199999995],[36.54237,39.507336599999995],[39.7,42.1448366]];
export function tarsSourceTime(time:number){const t=Math.max(0,Math.min(TARS_TIMELINE.at(-1)![1],Number.isFinite(time)?time:0));let i=0;while(i<TARS_TIMELINE.length-2&&TARS_TIMELINE[i+1][1]<t)i++;const [s0,t0]=TARS_TIMELINE[i],[s1,t1]=TARS_TIMELINE[i+1];return s0+(s1-s0)*(t-t0)/(t1-t0);}
export const RANGER_CREW:Record<RangerPerson,RangerPoint>={cooper:[-43,112,36],doyle:[43,112,36],brand:[-43,112,-67],romilly:[43,112,-67]};
export const TARS_POSITION:RangerPoint=[90,80,91];
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>smooth(a,a+.2,t)*(1-smooth(b-.2,b,t));
export function tarsPose(time:number){const t=tarsSourceTime(time),separation=smooth(38.25,39.7,t);return {t,humor:t>=35.65?75:100,joke:pulse(29.25,30.65,t),separation,jolt:.8*pulse(38,38.6,t),vibration:.12*Math.sin(t*37)+.08*Math.sin(t*53),cooperTurn:.26*pulse(16.7,21.7,t)+.34*pulse(30.9,36,t),doyleTurn:-.17*pulse(11,16.6,t),brandTurn:.13*pulse(5,9,t),romillyTurn:-.12*pulse(5.8,10,t),robotLean:.013*Math.sin(t*2.4),hand:pulse(34.2,36,t)};}
export function tarsCamera(view:CameraView,aspect:number,time:number){
 const p=tarsPose(time),outside=view==='ranger-launch'||view==='ranger-separation';
 if(outside){const targetY=-65*p.separation,distance=Math.max(250+50*p.separation,250/Math.max(.4,aspect))/Math.tan(42*Math.PI/360);return {outside,target:[0,targetY,0] as RangerPoint,position:[distance*.6,targetY+distance*.65,distance*.72] as RangerPoint,fov:42};}
 const wide=view==='wide'||view==='ranger-crew',robot=view==='tars',panel=view==='ranger-panel',id:RangerPerson=view==='doyle'?'doyle':view==='brand'?'brand':view==='romilly'?'romilly':'cooper';
 const target:RangerPoint=wide?[22,100,5]:robot?[90,80,91]:panel?[90,89,104]:[RANGER_CREW[id][0],119,RANGER_CREW[id][2]];
 const distance=Math.max(wide?95:robot?70:panel?58:34,(wide?173:robot?57:panel?43:43)/Math.max(.4,aspect))/Math.tan(36*Math.PI/360);
 const direction:RangerPoint=wide?[.18,.18,1]:robot?[-.25,.03,1]:panel?[-.1,.04,1]:id==='brand'||id==='cooper'?[-.50,.04,1]:[.5,.04,1],length=Math.hypot(...direction);
 return {outside,target,position:target.map((x,i)=>x+distance*direction[i]/length) as RangerPoint,fov:36};
}
