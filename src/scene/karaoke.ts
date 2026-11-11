import type {CameraView} from './scene.ts';
export type KaraokePoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** Absolute scene time keeps the microphone, reactions and applause stable after a seek. */
export function karaokePose(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),singing=ease(5,10,t)*(1-ease(128.7,130.5,t));
 const touch=ease(86,91,t)*(1-ease(126,129,t)),applause=ease(129,132,t);
 return {sway:Math.sin(t*.65)*.018*singing,turn:Math.sin(t*.11)*.12,raise:singing,touch,applause,bow:ease(133,135,t)*(1-ease(137,139,t)),clap:applause*(.5+.5*Math.sin((t-124)*Math.PI*3.4))};
}
export function karaokeCamera(view:CameraView,aspect:number,time:number){
 const singer=view==='karaoke-singer',listener=view==='listener',close=singer||listener;
 const target:KaraokePoint=singer?[-43,26,-25]:listener?[56,3,47]:[-3,-8,-4];
 const vertical=singer?34:listener?35:91,horizontal=singer?38:listener?40:156,fov=36;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const drift=Math.sin(Math.max(0,time)*.045)*.025;
 const direction:KaraokePoint=singer?[.17+drift,.035,1]:listener?[-.26+drift,.035,1]:[.2+drift,.1,1];
 const length=Math.hypot(...direction);
 return {target,position:target.map((x,i)=>x+direction[i]*distance/length) as KaraokePoint,fov,close};
}
