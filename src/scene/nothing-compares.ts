import type {CameraView} from './scene.ts';
export type NothingPoint=[number,number,number];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const window=(a:number,b:number,c:number,d:number,t:number)=>ease(a,b,t)*(1-ease(c,d,t));
export const NOTHING_SHOTS:[number,CameraView][]=[
 [0,'nothing-path'],[5.5,'nothing-fountain'],[12.2,'sinead'],[47.5,'nothing-dissolve'],[60,'sinead'],[154,'nothing-dissolve'],[169,'nothing-terrace'],[180,'nothing-walk'],[193,'nothing-dissolve'],[202,'sinead'],[230,'nothing-tears'],[270,'sinead'],[277,'nothing-dissolve'],[285,'nothing-statue'],[292,'nothing-ending']
];
// Time, downward nod, turn, tilt, closed lids. Restrained poses sampled from the supplied film.
const poses:[number,number,number,number,number][]=[
 [0,0,0,0,0],[13,.1,-.03,0,.1],[18,.23,-.03,.02,.8],[25,-.02,.01,0,0],[34,.02,-.03,-.02,0],[43,.07,.03,0,.1],[55,.03,-.06,-.04,.1],[70,.01,.02,.02,0],[85,.21,-.05,-.03,.85],[100,.18,.08,.05,.4],[115,-.03,-.03,-.04,.1],[130,.17,-.04,-.01,.75],[145,-.06,.02,0,0],[160,-.02,.07,.04,.1],[175,.06,-.03,.02,.1],[190,.12,.03,-.02,.45],[205,.06,-.04,.04,0],[220,-.07,.03,.05,0],[235,.15,-.02,.03,.85],[245,.02,.01,0,.1],[250,.22,.01,-.02,.8],[260,.12,-.03,.04,.2],[270,-.02,.01,.05,.05],[282,.06,-.04,-.02,.3],[295,-.01,.04,.03,.05],[308,.05,.02,.03,.2]
];
export function nothingPose(time:number){
 const t=Math.max(0,Math.min(308.55,Number.isFinite(time)?time:0)),i=poses.reduce((n,p,j)=>t>=p[0]?j:n,0),a=poses[i],b=poses[Math.min(i+1,poses.length-1)],f=ease(a[0],Math.max(a[0]+.001,b[0]),t),mix=(k:number)=>a[k]+(b[k]-a[k])*f;
 const garden=Math.max(1-ease(11,14,t),window(46.5,50,56,61,t),window(152.5,160,194,202,t),ease(275,284,t)),portrait=Math.max(ease(11,14,t)*(1-ease(166,173,t)),window(191,200,278,286,t),window(289,294,305,308,t)*.68),walker=window(164,169,193,199,t)+window(276,281,288,294,t),tear=ease(218,239,t),blink=Math.exp(-(((t%5.7-4.8)/.095)**2));
 const walk=window(170,174,190,195,t)+window(279,282,288,291,t),root:NothingPoint=[-70+100*ease(172,195,t),151,-80-260*ease(172,195,t)],step=Math.sin(t*3.6)*walk;
 return {t,garden,portrait,walker:Math.min(1,walker),tear,lid:Math.max(mix(4),blink),nod:mix(1),turn:mix(2),tilt:mix(3),lookUp:-mix(1)*.8,brow:.12+.14*tear,root,step,fade:ease(0,.65,t)*(1-ease(304.3,307.7,t))};
}
export function nothingView(view:CameraView,time:number){
 const p=nothingPose(time),close=view==='sinead'||view==='nothing-tears'||view==='nothing-eyes',blend=view==='nothing-dissolve'||view==='nothing-ending';
 const sourceDissolve=time>=46.5&&time<=61||time>=152.5&&time<=202||time>=275;
 const portrait=blend?(sourceDissolve?p.portrait*(1-.5*p.garden):.55):view==='wide'?p.portrait*(1-.5*p.garden):0,garden=blend?(sourceDissolve?p.garden:1):view==='wide'?p.garden:1;
 return {portrait:close?1:portrait,garden:close?0:garden,walker:close?0:p.walker};
}
export function nothingCamera(view:CameraView,aspect:number,time:number){
 const p=nothingPose(time),fov=32,effective=Math.max(.42,Math.min(4/3,aspect));let target:NothingPoint=[0,130,-420],hh=200,hw=360,dir:NothingPoint=[.03,.08,1];
 if(view==='nothing-fountain'){target=[-210,123,-470];hh=122;hw=155;dir=[.2,.04,1];}
 else if(view==='nothing-statue'){target=[240,149,-580];hh=165;hw=180;dir=[-.12,.08,1];}
 else if(view==='nothing-terrace'){target=[0,158,-540];hh=175;hw=315;dir=[-.17,.1,1];}
 else if(view==='nothing-walk'){target=[p.root[0],106,p.root[2]];hh=115;hw=170;dir=[.12,.04,1];}
 else if(view==='nothing-path'||view==='nothing-ending'){target=[0,155,-620];hh=210;hw=355;dir=[.02,.06,1];}
 const d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*d/n)as NothingPoint,fov,portraitDistance:Math.max(view==='nothing-eyes'?14.5:16.5,14/effective)/Math.tan(fov*Math.PI/360)};
}
