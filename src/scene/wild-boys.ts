import type {CameraView} from './scene.ts';
export type WildPoint=[number,number,number];
export const WILD_SHOTS:[number,CameraView][]=[
 [0,'wild-dust'],[12,'wild-factory'],[20,'wild-machine'],[29,'wild-monitors'],[35,'wild-robot'],[41,'wild-dancers'],[49,'wild-screen'],[57,'wild-platforms'],[64,'wild-dance'],[70,'wild-screen'],[79,'wild-pool'],[86,'wild-wheel'],[93,'wild-singer'],[101,'wild-splash'],[107,'wild-straps'],[115,'wild-drummer'],[122,'wild-scaffold'],[129,'wild-cage'],[137,'wild-wheel'],[145,'wild-dancers'],[152,'wild-underwater'],[160,'wild-robot'],[168,'wild-monitors'],[175,'wild-dancers'],[183,'wild-bridge'],[190,'wild-straps'],[198,'wild-factory'],[205,'wild-cage'],[213,'wild-dancers'],[221,'wild-dance'],[229,'wild-silhouette'],[236,'wild-crew'],[243,'wild-finale'],[249,'wild-crew']
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const angles:[[number,number],...[number,number][]]=[[0,0],[79,0],[89,.35],[111,1.02],[141,2.45],[154,Math.PI],[178,4.1],[200,5.2],[222,Math.PI*2],[244,6.95],[253.2,7.1]];
export function wildPose(time:number){const t=Math.max(0,Math.min(253.2,Number.isFinite(time)?time:0)),rawIndex=angles.findIndex((p,j)=>j<angles.length-1&&t>=p[0]&&t<angles[j+1][0]),i=rawIndex<0?angles.length-2:rawIndex,a=angles[i],b=angles[i+1],q=a[1]+(b[1]-a[1])*Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0]))),beat=t*112/60;return{t,q,beat,step:Math.sin(beat*Math.PI),warm:ease(82,102,t),rain:ease(229,238,t),fade:ease(0,1,t)*(1-ease(251,252.9,t)),head:[-101*Math.sin(q),185+101*Math.cos(q),36]as WildPoint};}
export function wildCamera(view:CameraView,aspect:number,time:number){const p=wildPose(time);let target:WildPoint=[0,210,-70],hh=380,hw=700,dir:WildPoint=[.2,.15,1],up:WildPoint=[0,1,0];
 if(view==='wild-dust'){target=[0,135,800];hh=190;hw=470;dir=[.18,.11,1];}
 else if(view==='wild-machine'||view==='wild-robot'){target=[-450,view==='wild-robot'?293:285,-260];hh=view==='wild-robot'?86:180;hw=view==='wild-robot'?115:340;dir=[.1,.04,1];}
 else if(view==='wild-monitors'){target=[-450,286,-260];hh=160;hw=355;dir=[.14,.08,1];}
 else if(view==='wild-screen'){target=[-650,304,-233];hh=52;hw=78;dir=[.06,.02,1];}
 else if(view==='wild-simon'||view==='wild-singer'){target=p.head;hh=51;hw=76;dir=[.14,.03,1];}
 else if(view==='wild-straps'){target=[-32*Math.sin(p.q),185+32*Math.cos(p.q),36];hh=117;hw=145;dir=[.25,.02,1];}
 else if(view==='wild-wheel'||view==='wild-pool'||view==='wild-splash'){target=[0,183,0];hh=view==='wild-pool'?300:265;hw=view==='wild-pool'?490:335;dir=[view==='wild-splash'?-.26:.17,.17,1];}
 else if(view==='wild-underwater'){target=p.head;hh=95;hw=147;dir=[.1,.27,1];}
 else if(view==='wild-cage'){target=[390,250,-280];hh=75;hw=110;dir=[-.13,.03,1];}
 else if(view==='wild-drummer'){target=[-430,230,190];hh=148;hw=230;dir=[.25,.18,1];}
 else if(view==='wild-platforms'||view==='wild-scaffold'){target=[120,240,-280];hh=300;hw=500;dir=[.22,.2,1];}
 else if(view==='wild-bridge'){target=[240,260,25];hh=180;hw=310;dir=[.25,.04,1];}
 else if(view==='wild-dancers'||view==='wild-dance'||view==='wild-silhouette'){target=[470,235,255];hh=view==='wild-silhouette'?155:185;hw=view==='wild-silhouette'?190:335;dir=[.15,.05,1];}
 else if(view==='wild-crew'){target=[445,244,255];hh=137;hw=215;dir=[.1,.05,1];}
 else if(view==='wild-finale'){target=[0,210,30];hh=410;hw=720;dir=[.3,.38,1];}
 const effective=Math.max(.42,Math.min(4/3,aspect)),fov=36,d=Math.max(hh,hw/effective)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,j)=>x+d*dir[j]/n)as WildPoint,up,fov};
}
