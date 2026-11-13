import type {CameraView} from './scene.ts';
export type HelloPoint=[number,number,number];
export type HelloPlace='classroom'|'corridor'|'studio'|'dance'|'bedroom'|'piano'|'reveal';
export type HelloId='lionel'|'hello-lisa'|'hello-student'|'hello-messenger';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** Source clock, including the drama lesson and complete sculpture ending. */
export function helloPose(time:number){
 const t=Math.max(0,Math.min(326.48,Number.isFinite(time)?time:0));
 const place:HelloPlace=t<74?'classroom':t<128?'corridor':t<144?'studio':t<181?'dance':t<204?'classroom':t<234?'bedroom':t<275?'piano':'reveal';
 return {t,place,sway:Math.sin(t*.48)*.015,nod:Math.sin(t*.33)*.04,turn:Math.sin(t*.17)*.1,hand:.5+.5*Math.sin(t*.51),walk:Math.sin(t*5.5),reveal:ease(278,286,t),touch:ease(300,305,t)*(1-ease(311,315,t)),phone:t>=214&&t<234,fade:ease(1,2.2,t)*(1-ease(319.5,323,t))};
}
export function helloPlace(view:CameraView,time:number):HelloPlace{
 return view==='hello-classroom'?'classroom':view==='hello-corridor'?'corridor':view==='hello-studio'?'studio':view==='hello-dance'?'dance':view==='hello-bedroom'?'bedroom':view==='hello-piano'?'piano':view==='hello-sculpture'?'reveal':helloPose(time).place;
}
export function helloCamera(view:CameraView,aspect:number,time:number){
 const place=helloPlace(view,time),close=view==='lionel'||view==='hello-lisa'||view==='hello-student'||view==='hello-messenger',seated=place==='piano'||place==='bedroom'||view==='lionel'&&place==='classroom'&&time>=50&&time<74||view==='hello-lisa'&&place==='studio';
 const speakerX=view==='hello-lisa'?(helloPose(time).place==='reveal'?80-105*helloPose(time).touch:100):view==='hello-student'?-125:view==='hello-messenger'?110:place==='reveal'?-85:0;
 const target:HelloPoint=close?[speakerX,seated?121:167,20]:view==='hello-sculpture'?[18,132,12]:place==='bedroom'?[28,79,-18]:[0,100,-100];
 const hh=close?47:view==='hello-sculpture'?90:145,hw=close?62:view==='hello-sculpture'?175:place==='corridor'?300:370,fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 return {target,position:[target[0]+d*(close?.08:.14),target[1]+d*.055,target[2]+d]as HelloPoint,fov};
}
