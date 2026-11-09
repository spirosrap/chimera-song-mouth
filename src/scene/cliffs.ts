import type {CliffCharacterId} from './scene.ts';
export type Point3=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
/** All staging uses the song clock, so replay and backwards seeks restore the climb exactly. */
export function cliffActorPose(id:CliffCharacterId,time:number):{position:Point3;scale:number;rotation:number}{
 const t=time-.35,arrival=ease(72,87,t),height=-340*(1-ease(0,76,t));
 const climbing:Record<CliffCharacterId,Point3>={vizzini:[-47,height+173,76],inigo:[43,height+165,72],fezzik:[0,height+146,61]};
 const standing:Record<CliffCharacterId,Point3>={vizzini:[-12,114,-13],inigo:[-82,137,-70],fezzik:[88,159,-74]};
 return {position:climbing[id].map((p,i)=>p+(standing[id][i]-p)*arrival) as Point3,scale:id==='vizzini'?.85:id==='fezzik'?1.3:1,rotation:id==='vizzini'?-.18: id==='inigo'?.2:-.2};
}
export function pursuerPose(time:number):Point3{
 const t=time-.35,cut=ease(104,106,t),recover=ease(109,140,t);
 return [13+cut*15,-760+590*ease(8,104,t)-cut*40+recover*150,92-cut*45];
}
export function ropeDrop(time:number){return Math.min(1500,Math.max(0,time-.35-104.5)**2*90);}
