import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {ODYSSEY_BAY,ODYSSEY_PEOPLE,odysseyCamera,odysseyPanel,odysseySet,odysseyState,type OdysseySpeaker,type OdysseyPoint as P} from '../../scene/odyssey.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,silver='#cdd6da',gold='#d9b45a',white='#eef1f2',crt='#5fe39a',amber='#ffb648',red='#ff5a4d',gas='#bfe6ff',earth='#6fb6ff',moon='#aeb6bb';
interface Person{id:OdysseySpeaker;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;gear:Beams;body:Beams}
/**
 * Apollo 13 on one clock, in three places: the spacecraft between the Earth and the Moon, its
 * command module's cabin, and Mission Control. Only the place the camera is in is drawn.
 */
export class OdysseyFlight{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,10,900_000);readonly people:Person[]=[];
 readonly space=new THREE.Group();readonly cabin=new THREE.Group();readonly houston=new THREE.Group();
 /** The docked stack, long axis along x: engine bell at +x, the lunar module at -x. */
 readonly stack=new THREE.Group();readonly panel=new Beams();readonly bay=new Beams();readonly vent=new Beams();readonly cloud=new Beams();readonly debris=new Beams();
 readonly masterAlarm=new Beams();readonly busB=new Beams();readonly busA=new Beams();readonly needle1=new Beams();readonly needle2=new Beams();readonly streaks=new Beams();readonly fanOn=new Beams();
 private readonly beams:Beams[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;private readonly duration:number;
 constructor(cast:{id:OdysseySpeaker;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==5)throw Error('The scene needs the three astronauts, the CapCom and the flight director.');
  this.duration=Math.max(...cast.map(c=>c.track.duration));
  this.scene.background=new THREE.Color(0x020304);this.scene.fog=new THREE.Fog(0x000000,100,2000);
  this.scene.add(this.space,this.cabin,this.houston);this.space.add(this.stack);
  const add=(parent:THREE.Object3D,name:string,b=new Beams())=>{b.group.name=name;parent.add(b.group);this.beams.push(b);return b;};
  this.makeSky(add(this.space,'sky'));this.makeStack(add(this.stack,'stack'));
  add(this.stack,'bay',this.bay);add(this.stack,'vent',this.vent);add(this.stack,'cloud',this.cloud);add(this.space,'panel',this.panel);add(this.space,'debris',this.debris);this.makeDamage();
  this.makeCabin(add(this.cabin,'cabin'));
  for(const [name,b] of Object.entries({masterAlarm:this.masterAlarm,busB:this.busB,busA:this.busA,needle1:this.needle1,needle2:this.needle2,streaks:this.streaks,fanOn:this.fanOn}))add(this.cabin,name,b);
  this.makeIndicators();this.makeHouston(add(this.houston,'houston'));
  for(const c of cast){
   const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),gear:new Beams(),body:new Beams()};
   p.root.name=c.id;p.head.centred=true;p.head.attachAccessory(p.gear.group);p.root.add(p.head.scene,p.body.group);p.root.position.set(...ODYSSEY_PEOPLE[c.id].position);
   (ODYSSEY_PEOPLE[c.id].set==='cabin'?this.cabin:this.houston).add(p.root);this.people.push(p);this.beams.push(p.gear,p.body);this.dress(p);
  }
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false,hot=false){b.line(p.flat(),p.length,color,width,{alpha,close,hot});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6,n=24){this.line(b,Array.from({length:n},(_,i)=>{const a=i/n*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 /** A circle of radius r around the stack's axis at x. */
 private hoop(b:Beams,x:number,r:number,color:string,width=1,alpha=.6,n=28){this.ring(b,[x,0,0],[0,r,0],[0,0,r],color,width,alpha,n);}
 private makeSky(b:Beams){
  b.begin();
  // The Earth behind, already small; the Moon ahead; a few hundred stars, placed by a fixed sequence.
  const globe=(c:P,r:number,color:string,alpha:number)=>{for(let i=1;i<8;i++){const lat=-Math.PI/2+i/8*Math.PI;this.ring(b,[c[0],c[1]+r*Math.sin(lat),c[2]],[r*Math.cos(lat),0,0],[0,0,r*Math.cos(lat)],color,1,alpha,36);}for(let i=0;i<8;i++){const a=i/8*Math.PI;this.ring(b,c,[r*Math.cos(a),0,r*Math.sin(a)],[0,r,0],color,1,alpha,36);}};
  globe([-52000,-14000,-150000],15000,earth,.5);globe([70000,-4000,-120000],5200,moon,.45);
  let seed=1970;const next=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<260;i++){const u=next()*2-1,a=next()*TAU,r=Math.sqrt(1-u*u),p:P=[380000*r*Math.cos(a),380000*u,380000*r*Math.sin(a)],s=700+next()*900;this.line(b,[p,[p[0]+s,p[1],p[2]]],white,1+next(),.35+next()*.5);}
  b.end();
 }
 private makeStack(b:Beams){
  b.begin();const around=(x:number,r:number,a:number):P=>[x,r*Math.cos(a),r*Math.sin(a)];
  // Service module: a cylinder of six bays, the engine bell behind it, the high-gain antenna on its boom.
  for(const x of [0,250,500,750])this.hoop(b,x,195,silver,1.1,.7);
  for(let i=0;i<12;i++)this.line(b,[around(0,195,i/12*TAU),around(750,195,i/12*TAU)],silver,.9,i%2?.3:.55);
  this.hoop(b,750,62,silver,1,.6,16);this.hoop(b,1010,128,silver,1.2,.7);for(let i=0;i<10;i++)this.line(b,[around(750,62,i/10*TAU),around(1010,128,i/10*TAU)],silver,.9,.5);
  for(let k=0;k<4;k++){const a=k/4*TAU+.2,c=around(250,203,a);this.line(b,[[c[0]-22,c[1],c[2]],[c[0]+22,c[1],c[2]]],white,1.3,.8);this.line(b,[around(250,203,a-.1),around(250,203,a+.1)],white,1.3,.8);}
  this.line(b,[around(740,150,3.6),around(900,330,3.6)],silver,1,.7);for(const [dy,dz] of [[-38,-38],[38,-38],[-38,38],[38,38]]){const c=around(900,330,3.6);this.ring(b,[c[0],c[1]+dy,c[2]+dz],[0,30,0],[0,0,30],white,1,.7,12);}
  // Command module: the cone, its apex in the lunar module's docking tunnel.
  this.hoop(b,-110,150,white,1,.7);this.hoop(b,-220,96,white,1,.7);this.hoop(b,-330,40,white,1,.7,14);
  for(let i=0;i<12;i++)this.line(b,[around(0,195,i/12*TAU),around(-330,40,i/12*TAU)],white,.9,.5);
  for(const a of [-.5,.5])this.line(b,[around(-150,128,a-.12),around(-150,128,a+.12),around(-205,104,a+.1),around(-205,104,a-.1)],gas,1.2,.9,true);
  // Lunar module Aquarius, docked nose to nose with its legs folded.
  for(const x of [-345,-470,-560])this.hoop(b,x,112,gold,1,.6,20);for(let i=0;i<10;i++)this.line(b,[around(-345,112,i/10*TAU),around(-560,112,i/10*TAU)],gold,.9,.4);
  const oct=(x:number,r:number)=>Array.from({length:8},(_,i)=>around(x,r,(i+.5)/8*TAU));
  this.line(b,oct(-575,205),gold,1.2,.75,true);this.line(b,oct(-745,205),gold,1.2,.75,true);for(let i=0;i<8;i++)this.line(b,[oct(-575,205)[i],oct(-745,205)[i]],gold,.9,.55);
  this.hoop(b,-745,42,gold,1,.6,12);this.hoop(b,-835,80,gold,1,.6,14);for(let i=0;i<8;i++)this.line(b,[around(-745,42,i/8*TAU),around(-835,80,i/8*TAU)],gold,.9,.45);
  for(let k=0;k<4;k++){const a=k/4*TAU;this.line(b,[around(-590,205,a),around(-700,290,a),around(-800,215,a)],gold,1.4,.8);this.ring(b,around(-808,215,a),[0,26*Math.cos(a+1.57),26*Math.sin(a+1.57)],[26,0,0],gold,1,.7,10);}
  b.end();
 }
 /** Bay 4: the panel that leaves, what is seen inside once it has, and the gas that comes out. */
 private makeDamage(){
  const edge=(x:number,r:number,a:number):P=>[x,r*Math.cos(a),r*Math.sin(a)],half=.5,a0=ODYSSEY_BAY-half,a1=ODYSSEY_BAY+half;
  // The panel is drawn about its own centre, so it can tumble.
  this.panel.begin();for(const x of [-155,155])this.line(this.panel,Array.from({length:9},(_,i)=>[x,197*Math.cos(-half+i/8*2*half)-197,197*Math.sin(-half+i/8*2*half)] as P),silver,1.5,.95);for(let i=0;i<5;i++){const a=-half+i/4*2*half;this.line(this.panel,[[-155,197*Math.cos(a)-197,197*Math.sin(a)],[155,197*Math.cos(a)-197,197*Math.sin(a)]],silver,1.2,.9);}this.panel.end();
  const o=this.bay;o.begin();
  for(const x of [20,330])this.line(o,[edge(x,197,a0),edge(x,120,a0),edge(x,120,a1),edge(x,197,a1)],red,1.6,.9);
  for(const a of [a0,a1])this.line(o,[edge(20,197,a),edge(330,197,a)],red,1.6,.9);
  // The two oxygen tanks and a fuel cell shelf, seen through the hole.
  for(const [x,a] of [[120,ODYSSEY_BAY-.22],[220,ODYSSEY_BAY+.2]] as const){const c=edge(x,150,a);this.ring(o,c,[34,0,0],[0,34*Math.cos(a+1.57),34*Math.sin(a+1.57)],amber,1.2,.85,14);this.ring(o,c,[34,0,0],[0,34*Math.cos(a),34*Math.sin(a)],amber,1,.6,14);}
  o.end();
  const v=this.vent;v.begin();for(let i=0;i<18;i++){const a=ODYSSEY_BAY-half*.8+(i%6)/5*half*1.6,x=60+(i*53)%250,reach=420+(i*97)%520;this.line(v,[edge(x,150,a),edge(x+((i%5)-2)*60,150+reach*.5,a+((i%3)-1)*.08),edge(x+((i%5)-2)*140,150+reach,a+((i%3)-1)*.2)],gas,1.1,.55);}v.end();
  const c=this.cloud;c.begin();for(let i=0;i<5;i++){const r=420+i*210,x=175+(i%2?-1:1)*i*30,centre=edge(x,260+i*150,ODYSSEY_BAY);this.ring(c,centre,[r,0,0],[0,r*.6*Math.cos(ODYSSEY_BAY+1.57),r*.6*Math.sin(ODYSSEY_BAY+1.57)],gas,.9,.22-i*.03,30);}c.end();
  const d=this.debris;d.begin();for(let i=0;i<22;i++){const a=ODYSSEY_BAY+((i*37)%19-9)*.07,x=175+((i*61)%31-15)*14,r=60+(i*29)%70,p=edge(x,r,a),s=5+i%5*3;this.line(d,[p,[p[0]+s,p[1]+s*.6,p[2]],[p[0]+s*.3,p[1],p[2]+s]],i%4?silver:gold,1.2,.85,true);}d.end();
 }
 private makeCabin(b:Beams){
  b.begin();
  // Three couches abreast, the main display console ahead (+z), the hatch window in the middle of it.
  for(const x of [-58,0,58]){this.line(b,[[x-22,40,-34],[x-22,62,-22],[x-22,150,-22],[x+22,150,-22],[x+22,62,-22],[x+22,40,-34]],silver,1,.4);for(const y of [84,116])this.line(b,[[x-22,y,-22],[x+22,y,-22]],silver,.9,.3);}
  for(const z of [-60,10,96])this.ring(b,[0,120,z],[150+z*.3,0,0],[0,118+z*.2,0],silver,.9,.22,32);
  this.box(b,-150,84,96,300,112,8,silver,.55);this.line(b,[[-150,140,95],[150,140,95]],silver,.9,.4);
  for(let r=0;r<3;r++)for(let c=0;c<14;c++)if(c<4||c>9)this.box(b,-143+c*20.6,146+r*15,95,16,11,1,crt,.3);
  for(let c=0;c<11;c++)this.ring(b,[-120+c*24,108,95],[7,0,0],[0,7,0],silver,.9,.35,12);
  // The caution and warning matrix, and the two oxygen quantity gauges.
  for(let r=0;r<4;r++)for(let c=0;c<6;c++)this.box(b,-39+c*13,150+r*9,94.6,11,7,1,amber,.22);
  for(const x of [74,98]){this.box(b,x,96,94.6,12,36,1,crt,.6);for(let i=0;i<=4;i++)this.line(b,[[x-3,98+i*8,94],[x,98+i*8,94]],crt,.9,.6);}
  this.ring(b,[0,214,97],[21,0,0],[0,21,0],gas,1.5,.9,24);this.ring(b,[0,214,97],[25,0,0],[0,25,0],silver,1,.5,24);
  for(const x of [-96,96])this.line(b,[[x-22,222,96],[x+22,222,96],[x+16,196,97],[x-16,196,97]],gas,1.2,.6,true);
  this.box(b,-131,112,94,10,16,2,silver,.6);
  b.end();
 }
 private makeIndicators(){
  const lit=(b:Beams,x:number,y:number,w:number,h:number,color:string)=>{b.begin();for(let i=0;i<3;i++)this.line(b,[[x+i,y+i,94.2],[x+w-i,y+i,94.2],[x+w-i,y+h-i,94.2],[x+i,y+h-i,94.2]],color,2,1,true,true);b.end();};
  // Master alarm, at both ends of the console; the two bus undervolt lights in the matrix.
  this.masterAlarm.begin();for(const x of [-146,134])for(let i=0;i<3;i++)this.line(this.masterAlarm,[[x+i,206+i,94.2],[x+12-i,206+i,94.2],[x+12-i,216-i,94.2],[x+i,216-i,94.2]],red,2.4,1,true,true);this.masterAlarm.end();
  lit(this.busB,-13,159,11,7,amber);lit(this.busA,-26,159,11,7,amber);
  for(const [b,x] of [[this.needle1,74],[this.needle2,98]] as const){b.begin();this.line(b,[[x-1,0,93.8],[x+13,0,93.8]],white,2.4,1,false,true);b.end();}
  // What the hatch window shows once the gas is out there: pale streaks crossing it.
  const s=this.streaks;s.begin();for(let i=0;i<9;i++){const y=199+i*3.6,w=Math.sqrt(Math.max(0,21*21-(y-214)**2));this.line(s,[[-w*.9+((i*7)%5),y,97.4],[-w*.2+((i*5)%7),y+1,97.4],[w*.7,y+((i%3)-1),97.4]],gas,1.2,.75);}s.end();
  const f=this.fanOn;f.begin();this.line(f,[[-126,120,93.6],[-126,131,91]],white,2.6,1,false,true);f.end();
 }
 private makeHouston(b:Beams){
  b.begin();
  const console=(x:number,y:number,z:number,w:number,glow:number)=>{
   this.box(b,x,y,z,w,30,44,crt,.5);this.line(b,[[x,y+30,z],[x,y+52,z+16],[x+w,y+52,z+16],[x+w,y+30,z]],crt,1,.6,true);
   for(let i=0;i<Math.round(w/34);i++)this.line(b,[[x+5+i*34,y+33,z+3],[x+29+i*34,y+33,z+3],[x+29+i*34,y+49,z+14],[x+5+i*34,y+49,z+14]],i%2?amber:crt,1.1,glow,true);
  };
  // The CapCom's row in front; behind and a step up, the flight director's, where Kranz stands.
  console(-82,66,34,164,.9);
  for(const [row,z] of [[1,-118],[2,-236]] as const)for(const x of [-250,-82,86]){
   console(x,66+row*22,z+34,164,.45);
   for(const dx of [38,120]){const hx=x+dx,hy=118+row*22;if(row===1&&x===86&&dx===120)continue;this.ring(b,[hx,hy,z],[8,0,0],[0,10.5,0],white,.9,.4,12);this.ring(b,[hx,hy,z],[0,0,8],[0,10.5,0],white,.9,.3,12);this.line(b,[[hx-19,hy-21,z],[hx-8,hy-12,z],[hx+8,hy-12,z],[hx+19,hy-21,z],[hx+17,hy-52,z],[hx-17,hy-52,z]],white,.9,.35,true);}
  }
  for(const row of [0,1,2])this.line(b,[[-330,row*22,-118*row+92],[330,row*22,-118*row+92]],crt,.8,.25);
  this.box(b,-24,34,-28,48,6,44,white,.4);this.line(b,[[-22,40,-27],[-22,104,-33],[22,104,-33],[22,40,-27]],white,1,.45);
  b.end();
 }
 /** Gear sits in the head's own frame (+x is the face); the body hangs from the head centre (+z is the front). */
 private dress(p:Person){
  const g=p.gear,b=p.body,id=p.id,crew=ODYSSEY_PEOPLE[id].set==='cabin',kranz=id==='kranz';g.begin();
  const hair=kranz?'#c9c2ae':id==='lovell'?'#a39679':id==='haise'?'#8a7a5c':id==='swigert'?'#b0a183':'#9a8a6c',rise=kranz?4.2:6.4;
  for(let i=0;i<13;i++){const z=(i/12-.5)*14.4,c=Math.sqrt(1-(z/8)**2);this.line(g,Array.from({length:11},(_,j)=>{const a=j/10*Math.PI;return [-.8-8*c*Math.cos(a),17.8+(kranz?Math.min(rise,rise*1.6*Math.sin(a)):rise*Math.sin(a))*c,z] as P;}),hair,.9,.7);}
  // A light headset: the band, one earpiece, the boom to the mouth.
  this.line(g,Array.from({length:13},(_,j)=>{const a=j/12*Math.PI;return [-1,9+15.5*Math.sin(a),-9.4*Math.cos(a)] as P;}),'#dfe5e7',1.4,.9);
  this.ring(g,[-1,8,9.4],[3.2,0,0],[0,3.2,0],'#dfe5e7',1.3,.9,12);this.line(g,[[0,6,9.4],[6.5,2.4,7.5],[9.8,1.4,3]],'#dfe5e7',1.3,.95);
  g.end();b.begin();
  const cloth=crew?'#e9eef0':'#eef1f2',rings:[number,number,number][]=[[-4,5.5,5],[-11,21,9],[-30,19,10],[-46,19,10]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],cloth,.9,.65);
  for(let i=0;i<16;i++){const a=i/16*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)] as P),cloth,.85,.5);}
  for(const side of [-1,1]){const elbow:P=[side*25,-30,8],wrist:P=crew?[side*14,-34,40]:kranz?[side*17,-52,6]:[side*12,-38,36];this.line(b,[[side*21,-12,0],elbow,wrist],cloth,2,.75);this.ring(b,wrist,[3.4,0,0],[0,3.4,0],'#cfd6da',1.1,.7,10);}
  if(crew){
   // The white constant-wear garment, with the mission patch on the chest.
   this.line(b,[[0,-9,10],[0,-46,10.4]],'#b8c2c8',1,.7);this.ring(b,[-9,-20,10],[4,0,0],[0,4,0],gold,1.1,.85,12);
  }else{
   for(const side of [-1,1])this.line(b,[[side*5,-3,5],[side*12,-10,9.5],[side*5,-20,10.5],[side*1.5,-11,10]],'#ffffff',1.2,.9);
   this.line(b,[[0,-11,10.4],[-2.6,-30,11],[0,-35,11],[2.6,-30,11]],'#3b4a5a',1.6,.95,true);
   if(kranz){
    // The white vest his wife made for the mission, and the rest of him, standing.
    for(const side of [-1,1])this.line(b,[[side*4,-13,10.6],[side*17,-13,9],[side*18,-45,10],[side*3,-47,11]],'#ffffff',1.6,.95,true);
    for(const y of [-22,-31,-40])this.ring(b,[1.5,y,11.2],[.9,0,0],[0,.9,0],gold,1,.9,8);
    for(const side of [-1,1])this.line(b,[[side*9,-46,0],[side*10,-150,2]],cloth,2,.5);
   }
  }
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),s=odysseyState(t),set=odysseySet(view);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  this.space.visible=set==='space';this.cabin.visible=set==='cabin';this.houston.visible=set==='houston';
  const c=odysseyCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;
  // Space has no haze; the two rooms fade behind their speakers.
  if(set==='space'){this.camera.near=50;fog.near=500000;fog.far=2000000;}else{this.camera.near=2;fog.near=distance*1.5;fog.far=distance+620;}
  this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  this.stack.rotation.set(s.roll,s.yaw,s.pitch);
  const panel=odysseyPanel(t);this.bay.group.visible=panel.gone;this.vent.group.visible=s.vent>0;this.cloud.group.visible=s.cloud>.02;this.debris.group.visible=panel.gone&&s.after<40;
  this.vent.group.scale.setScalar(.55+.6*s.vent+.07*Math.sin(t*37)*Math.sin(t*11));this.cloud.group.scale.setScalar(.35+.9*s.cloud);
  // Until it blows, the panel rides on the stack where the bay is; then it tumbles away on its own.
  if(panel.gone){this.panel.group.position.set(...panel.position);this.panel.group.rotation.set(ODYSSEY_BAY+panel.spin,panel.spin*.7,panel.spin*.4);this.debris.group.rotation.x=s.roll;this.debris.group.scale.setScalar(1+s.after*.42);}
  else{const a=ODYSSEY_BAY+s.roll;this.panel.group.position.set(175,197*Math.cos(a),197*Math.sin(a));this.panel.group.rotation.set(a,0,0);}
  this.masterAlarm.group.visible=s.alarmLit;this.busB.group.visible=s.mainB;this.busA.group.visible=s.mainA;this.fanOn.group.visible=s.stirred;
  this.needle1.group.position.y=98+32*s.tank1;this.needle2.group.position.y=98+32*s.tank2;
  this.streaks.group.visible=s.cloud>.05;this.streaks.group.position.x=Math.sin(t*.9)*3;
  for(const p of this.people){
   const base=ODYSSEY_PEOPLE[p.id],crew=base.set==='cabin',phase=p.id==='swigert'?0:p.id==='lovell'?2:4;
   // Weightless, the crew drift a little and are thrown by the jolt; Houston leans in at the venting.
   p.root.position.set(base.position[0],base.position[1]+(crew?s.drift*(p.id==='lovell'?.8:.5)+Math.sin(t*.4+phase)*1.2:0),base.position[2]+(crew?0:p.id==='capcom'?4*s.lean:0));
   p.root.rotation.z=crew?Math.sin(t*.31+phase)*.03:0;p.head.scene.rotation.set(0,-Math.PI/2,crew?.06:p.id==='kranz'?-.1:-.04*s.lean);
   const msg=p.track.message(p.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic);
   p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  }
  this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.gear.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();}
}
