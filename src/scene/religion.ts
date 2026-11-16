import type {CameraView} from './scene.ts';
export type ReligionPoint=[number,number,number];
export type ReligionPlace='room'|'wings'|'sky'|'workshop'|'red';
export const RELIGION_SHOTS:[number,CameraView][]=[
 [0,'faith-room'],
 [6,'faith-window'],
 [13,'faith-hands'],
 [20.4,'faith-band'],
 [21.8,'faith-mandolin'],
 [24.27,'faith-wings'],
 [31.7,'faith-floor'],
 [33.95,'faith-hands'],
 [35.24,'faith-floor'],
 [37.04,'faith-hands'],
 [38.25,'faith-floor'],
 [44.38,'faith-wings'],
 [46.17,'faith-window'],
 [52.55,'faith-floor'],
 [53.8,'faith-portrait'],
 [63.1,'faith-floor'],
 [63.86,'faith-bow'],
 [67.07,'faith-portrait'],
 [67.98,'faith-caps'],
 [69.86,'faith-pillar'],
 [73.62,'faith-window'],
 [76.12,'faith-floor'],
 [82.63,'faith-mask'],
 [83.88,'faith-flame'],
 [89.38,'faith-caps'],
 [90.47,'faith-floor'],
 [92.18,'faith-caps'],
 [96.97,'faith-bow'],
 [99.43,'faith-hands'],
 [100.68,'faith-mask'],
 [102.35,'faith-floor'],
 [109.94,'faith-workshop'],
 [112.2,'faith-feather'],
 [115.28,'faith-portrait'],
 [118.08,'faith-caps'],
 [120.2,'faith-floor'],
 [122.87,'faith-tree'],
 [125.38,'faith-portrait'],
 [128.63,'faith-red'],
 [130.01,'faith-tree'],
 [131.21,'faith-workshop'],
 [132.38,'faith-feather'],
 [133.38,'faith-elder'],
 [135.26,'faith-tree'],
 [137.05,'faith-workshop'],
 [138.89,'faith-feather'],
 [142.02,'faith-workshop'],
 [147.56,'faith-portrait'],
 [149.57,'faith-workshop'],
 [150.73,'faith-mask'],
 [153.03,'faith-portrait'],
 [155.41,'faith-wings'],
 [156.49,'faith-flame'],
 [158.2,'faith-shadow'],
 [163.08,'faith-workshop'],
 [169.63,'faith-window'],
 [175.43,'faith-workshop'],
 [177.26,'faith-dance'],
 [179.72,'faith-portrait'],
 [187.06,'faith-shadow'],
 [195.03,'faith-portrait'],
 [203.5,'faith-red'],
 [205.0,'faith-portrait'],
 [206.5,'faith-red'],
 [209.95,'faith-dance'],
 [212.09,'faith-workshop'],
 [216.8,'faith-red'],
 [218.7,'faith-shadow'],
 [221.5,'faith-floor'],
 [230.15,'faith-red'],
 [233.11,'faith-workshop'],
 [234.77,'faith-bow'],
 [236.65,'faith-workshop'],
 [237.74,'faith-dance'],
 [241.12,'faith-portrait'],
 [242.08,'faith-bow'],
 [245,'faith-mask'],
 [247.21,'faith-floor'],
 [248.37,'faith-portrait'],
 [249.1,'faith-red'],
 [252.29,'faith-hands'],
 [259,'faith-dance'],
 [266,'faith-tree'],
 [273,'faith-workshop'],
 [278,'faith-floor'],
 [286,'faith-ending'],
];
const ease=(a:number,b:number,t:number)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
type Key=[number,number,number,number,number,number,number];
// Time, facing, left/right wrist heights, left/right wrist spread, root height.
export const RELIGION_GESTURES:Key[]=[
[0,0,-48,-48,-16,16,131],[20,0,-48,-48,-14,14,131],[39,-.15,-43,-46,-17,18,131],[45,-.15,-43,-46,-17,18,131],
[49,-.2,-29,-25,-38,41,148],[55,-.15,32,-32,-12,35,131],[64,0,-46,-47,-16,18,131],
[77,0,-48,-48,-17,17,131],[84,-.5,30,-29,-13,37,148],[91,-.3,-39,-35,-24,25,76],
[106,.1,-48,-48,-17,17,76],[126,.05,-12,-18,-21,26,148],[140,0,-12,-12,-13,13,148],
[154,-.2,-48,-48,-15,16,76],[162,0,-44,-46,-20,20,76],[181,.4,10,6,-54,53,148],
[189,2.5,19,13,-57,59,148],[196,6.2,-12,-10,-14,14,148],[210,6.5,38,35,-48,49,148],
[224,6.2,-19,-19,-41,44,148],[231,6.5,-17,-15,-29,31,148],[238,9.5,8,17,-76,75,148],
[247,12.6,17,21,-53,55,148],[259,12.6,56,59,-67,68,148],[272,12.6,-46,-45,-16,16,148],
[279,12.566,-48,-48,-16,16,131],[294,12.566,-48,-48,-16,16,131],
];
export function religionPose(time:number){const t=Math.max(0,Math.min(294.5,Number.isFinite(time)?time:0)),i=RELIGION_GESTURES.reduce((n,[at],j)=>t>=at?j:n,0),a=RELIGION_GESTURES[i],b=RELIGION_GESTURES[Math.min(i+1,RELIGION_GESTURES.length-1)],u=ease(a[0],b[0],t),mix=(j:number)=>a[j]+(b[j]-a[j])*u,rootY=mix(6),seated=1-ease(137,148,rootY);return{t,turn:mix(1),left:[mix(4),mix(2),26]as ReligionPoint,right:[mix(5),mix(3),26]as ReligionPoint,seated,rootY,floor:1-ease(78,119,rootY),beat:t*126/60,sway:Math.sin(t*1.2)*(1-seated),spill:ease(5,11,t),dust:ease(259,262,t)*(1-ease(266,270,t)),fade:ease(0,.8,t)*(1-ease(285.4,288,t))};}
export function religionView(time:number):CameraView{return RELIGION_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'faith-room'as CameraView);}
export function religionResolve(view:CameraView,time:number):CameraView{return view==='wide'?religionView(time):view==='religion-michael'?'faith-portrait':view;}
export function religionPlace(view:CameraView,time:number):ReligionPlace{const v=religionResolve(view,time);return['faith-wings','faith-caps'].includes(v)?'wings':['faith-bow','faith-pillar','faith-mask','faith-tree','faith-feather'].includes(v)?'sky':['faith-workshop','faith-elder','faith-flame'].includes(v)?'workshop':v==='faith-red'?'red':'room';}
export function religionCamera(view:CameraView,aspect:number,time:number){const p=religionPose(time),v=religionResolve(view,p.t);let target:ReligionPoint=[0,142,-20],hh=171,hw=260,dir:ReligionPoint=[.08,.06,1];
 if(v==='faith-window'){target=[34,143,-13];hh=154;hw=241;dir=[.5,.06,1];}
 if(v==='faith-floor'){target=[-72,p.rootY+5,37];hh=126;hw=188;dir=[.06,.1,1];}
 if(v==='faith-portrait'||v==='faith-hands'){target=[-72,p.rootY+13,32];hh=v==='faith-hands'?86:53;hw=hh*1.5;dir=[Math.sin(p.turn+.08)*.25,.03,1];}
 if(v==='faith-dance'||v==='faith-shadow'){target=[-58,121,29];hh=156;hw=234;dir=[v==='faith-shadow'?-.5:.14,.04,1];}
 if(v==='faith-band'){target=[106,119,-24];hh=135;hw=190;dir=[.1,.05,1];}
 if(v==='faith-mandolin'){target=[118,118,-17];hh=102;hw=145;dir=[-.09,.04,1];}
 if(v==='faith-bass'){target=[-167,128,-32];hh=92;hw=132;dir=[.09,.04,1];}
 if(v==='faith-wings'){target=[0,143,0];hh=147;hw=255;dir=[.04,.03,1];}
 if(v==='faith-caps'){target=[-143,156,29];hh=61;hw=114;dir=[.07,.02,1];}
 if(v==='faith-bow'){target=[-100,128,-4];hh=144;hw=177;dir=[.09,.06,1];}
 if(v==='faith-pillar'){target=[112,139,-9];hh=155;hw=167;dir=[-.06,.06,1];}
 if(v==='faith-mask'){target=[11,157,13];hh=58;hw=95;dir=[.06,.02,1];}
 if(v==='faith-tree'){target=[-67,102,-11];hh=140;hw=220;dir=[.1,.07,1];}
 if(v==='faith-feather'){target=[120,178,0];hh=79;hw=126;dir=[.09,.03,1];}
 if(v==='faith-elder'){target=[-10,143,19];hh=66;hw=110;dir=[.16,.02,1];}
 if(v==='faith-workshop'){target=[0,119,0];hh=148;hw=248;dir=[.09,.06,1];}
 if(v==='faith-flame'){target=[137,163,14];hh=70;hw=95;dir=[.1,.03,1];}
 if(v==='faith-red'){target=[0,152,0];hh=183;hw=270;dir=[.06,.02,1];}
 if(v==='faith-ash'){target=[-17,23,41];hh=67;hw=132;dir=[.1,.7,1];}
 if(v==='faith-ending'){target=[0,143,-20];hh=171;hw=260;}
 const a=Math.max(.42,Math.min(1920/1080,Number.isFinite(aspect)?aspect:1920/1080)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return{target,position:target.map((x,i)=>x+d*dir[i]/n)as ReligionPoint,up:[0,1,0]as ReligionPoint,fov};}
