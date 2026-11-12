import type {CameraView} from './scene.ts';
export type HengePoint=[number,number,number];
export type HengePlace='studio'|'night'|'kitchen'|'bedroom'|'car'|'road'|'stones'|'sunset';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,c:number,d:number,t:number)=>ease(a,b,t)*(1-ease(c,d,t));
/** Source-time locations and gestures. Seeking never advances a separate animation clock. */
export function hengePose(time:number){
 const t=Math.max(0,Math.min(235.9,Number.isFinite(time)?time:0));
 const place:HengePlace=t<32?'studio':t<79?'night':t<120?'kitchen':t<134?'bedroom':t<139?'stones':t<145?'car':t<151?'road':t<174?'stones':t<184?'night':t<192?'stones':t<199?'car':t<204?'stones':t<212?'night':t<229.5?'stones':'sunset';
 const open=pulse(48,50,56,58,t)+pulse(72,75,78,80,t)+pulse(150,154,166,169,t)+pulse(177,179,183,185,t)+pulse(186,188,191,193,t)+pulse(216,219,226,229,t);
 const point=pulse(60,62,70,73,t)+pulse(169,171,174,176,t)+pulse(199,200,202,204,t);
 const forehead=pulse(34,36,40,43,t)+pulse(110,112,117,119,t),cook=pulse(79,81,94,97,t),embrace=pulse(90,93,108,111,t);
 const read=pulse(129,130,133,134,t)+pulse(139,140,144,145,t)+pulse(192,194,197,199,t),run=pulse(145,146,150,151,t);
 const seated=place==='studio'||place==='car',lying=place==='bedroom'&&t<129;
 const position:HengePoint=place==='studio'?[135,111,55]:place==='kitchen'?[0,149,45]:place==='bedroom'?(lying?[-45,70,-65]:[20,105,30]):place==='car'?[0,108,32]:place==='road'?[-90+run*125,150,90-run*100]:place==='sunset'?[0,150,0]:[0,150,80];
 return {t,place,open:Math.min(1,open),point,forehead,cook,embrace,read,run,seated,lying,position,fade:1-ease(233.8,235.4,t),sunset:ease(229,232,t)};
}
export function hengePlace(view:CameraView,time:number):HengePlace{
 const manual:Partial<Record<CameraView,HengePlace>>={'henge-studio':'studio','henge-kitchen':'kitchen','henge-bedroom':'bedroom','henge-car':'car','henge-road':'road','henge-monument':'stones','henge-night':'night','henge-sunset':'sunset'};
 return manual[view]??hengePose(time).place;
}
export function hengeCamera(view:CameraView,aspect:number,time:number){
 const p=hengePose(time),place=hengePlace(view,time),close=view==='henge-singer',monument=view==='henge-monument',sunset=place==='sunset';
 const target:HengePoint=close?[p.position[0],p.lying?66:p.position[1]+10,p.position[2]]:monument?[0,120,-200]:sunset?[0,105,-350]:place==='studio'?[0,100,-15]:place==='kitchen'?[0,105,-30]:place==='bedroom'?[0,75,-10]:place==='car'?[0,93,5]:place==='road'?[0,100,-80]:[0,119,-80];
 const hh=close?35:place==='bedroom'?90:place==='car'?102:145,hw=close?46:monument?400:sunset?570:place==='studio'?310:place==='car'?135:place==='road'?350:place==='kitchen'?235:place==='bedroom'?190:300,fov=38;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360),direction:HengePoint=close?[.1,.04,1]:monument?[.25,.2,1]:place==='car'?[.18,.08,1]:[.14,.13,1];
 const length=Math.hypot(...direction);return {target,position:target.map((x,i)=>x+d*direction[i]/length) as HengePoint,fov};
}
