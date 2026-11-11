import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {LANDING_PEOPLE,MOON_BOULDERS,MOON_CRATERS,SUN_STRETCH,landingCamera,landingSet,landingState,moonHeight,type LandingSpeaker,type LandingPoint as P} from '../../scene/landing.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,regolith='#8f979e',rim='#c3cad0',gold='#d9b45a',silver='#cdd6da',suit='#e6ebee',amber='#ffb648',crt='#5fe39a',shadow='#59616a';
interface Person{id:LandingSpeaker;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;gear:Beams;body:Beams}
/**
 * Three places on one clock: the Moon with the lander coming down, the lander's cabin, and the
 * CapCom's console in Houston. Only the set the camera is in is drawn.
 */
export class LandingSite{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,10,3_000_000);readonly people:Person[]=[];
 readonly moon=new THREE.Group();readonly cabin=new THREE.Group();readonly houston=new THREE.Group();
 /** The lander: its own frame has the footpads at y = 0 and the windows facing -x, the way it flies. */
 readonly lander=new THREE.Group();readonly plume=new Beams();readonly probes=new Beams();readonly dust=new Beams();readonly shade=new Beams();
 readonly progLight=new Beams();readonly contactLight=new Beams();
 private readonly beams:Beams[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;private readonly duration:number;
 constructor(cast:{id:LandingSpeaker;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==3)throw Error('The landing needs both astronauts and the CapCom.');
  this.duration=Math.max(...cast.map(c=>c.track.duration));
  this.scene.background=new THREE.Color(0x020304);this.scene.fog=new THREE.Fog(0x000000,20000,400000);
  this.scene.add(this.moon,this.cabin,this.houston);this.moon.add(this.lander);
  const add=(parent:THREE.Object3D,name:string,b=new Beams())=>{b.group.name=name;parent.add(b.group);this.beams.push(b);return b;};
  this.makeTerrain(add(this.moon,'terrain'));
  this.makeLander(add(this.lander,'lander'),p=>p,gold,silver,.8);
  // The shadow is the same drawing laid along the ground, away from the low Sun.
  add(this.moon,'shadow',this.shade);this.makeLander(this.shade,([x,y,z])=>[x-y*SUN_STRETCH,0,z],shadow,shadow,.55);
  add(this.lander,'plume',this.plume);add(this.lander,'probes',this.probes);add(this.moon,'dust',this.dust);this.makeEffects();
  this.makeCabin(add(this.cabin,'cabin'));add(this.cabin,'prog',this.progLight);add(this.cabin,'contact',this.contactLight);this.makeLights();
  this.makeHouston(add(this.houston,'houston'));
  for(const c of cast){
   const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),gear:new Beams(),body:new Beams()};
   p.root.name=c.id;p.head.centred=true;p.head.attachAccessory(p.gear.group);p.root.add(p.head.scene,p.body.group);p.root.position.set(...LANDING_PEOPLE[c.id].position);
   (LANDING_PEOPLE[c.id].set==='cabin'?this.cabin:this.houston).add(p.root);this.people.push(p);this.beams.push(p.gear,p.body);this.dress(p);
  }
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false,hot=false){b.line(p.flat(),p.length,color,width,{alpha,close,hot});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6,n=24,tf:(p:P)=>P=p=>p){this.line(b,Array.from({length:n},(_,i)=>{const a=i/n*TAU;return tf(c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P);}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5,tf:(p:P)=>P=p=>p){for(const zz of [z,z+d])this.line(b,([[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]] as P[]).map(tf),color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,([[xx,yy,z],[xx,yy,z+d]] as P[]).map(tf),color,1,alpha);}
 private makeTerrain(b:Beams){
  b.begin();const on=(x:number,z:number):P=>[x,moonHeight(x,z),z];
  // A coarse grid over the whole approach, and a fine one where it comes down.
  for(let z=-60000;z<=60000;z+=4000)this.line(b,Array.from({length:109},(_,i)=>on(-56000+i*4000,z)),regolith,.8,.44);
  for(let x=-56000;x<=376000;x+=4000)this.line(b,Array.from({length:31},(_,i)=>on(x,-60000+i*4000)),regolith,.8,.44);
  // Beyond it, a wider and coarser one, so the ground has no edge from high up.
  for(let z=-240000;z<=240000;z+=16000)if(Math.abs(z)>60000)this.line(b,Array.from({length:44},(_,i)=>on(-240000+i*16000,z)),regolith,.8,.3);
  for(let x=-240000;x<=448000;x+=16000)for(const [a,c] of x<-56000||x>376000?[[-240000,240000]]:[[-240000,-60000],[60000,240000]])this.line(b,Array.from({length:Math.round((c-a)/16000)+1},(_,i)=>on(x,a+i*16000)),regolith,.8,.3);
  for(let z=-6000;z<=6000;z+=500)if(z%4000)this.line(b,Array.from({length:41},(_,i)=>on(-8000+i*500,z)),regolith,.7,.22);
  for(let x=-8000;x<=12000;x+=500)if(x%4000)this.line(b,Array.from({length:25},(_,i)=>on(x,-6000+i*500)),regolith,.7,.22);
  for(const c of MOON_CRATERS)for(const [k,alpha] of [[1,.7],[.55,.35]] as const)this.line(b,Array.from({length:32},(_,i)=>on(c.x+Math.cos(i/32*TAU)*c.r*k,c.z+Math.sin(i/32*TAU)*c.r*k)),rim,1,alpha,true);
  for(const [i,r] of MOON_BOULDERS.entries()){
   const y=moonHeight(r.x,r.z),s=r.size,turn=i*1.7,corner=(k:number):P=>[r.x+Math.cos(turn+k*TAU/3)*s*.6,y,r.z+Math.sin(turn+k*TAU/3)*s*.6],top:P=[r.x,y+s*.7,r.z];
   this.line(b,[corner(0),corner(1),corner(2)],rim,1,.75,true);for(let k=0;k<3;k++)this.line(b,[corner(k),top],rim,1,.75);
  }
  b.end();
 }
 /** Drawn twice: as itself, and through `tf` flattened into its shadow. */
 private makeLander(b:Beams,tf:(p:P)=>P,descent:string,ascent:string,alpha:number){
  b.begin();const l=(p:P[],color:string,width=1,close=false)=>this.line(b,p.map(tf),color,width,alpha,close);
  const oct=(r:number,y:number)=>Array.from({length:8},(_,i)=>[r*Math.cos((i+.5)/8*TAU),y,r*Math.sin((i+.5)/8*TAU)] as P);
  // Descent stage: an octagonal box on four legs, the engine bell underneath.
  l(oct(210,150),descent,1.2,true);l(oct(210,320),descent,1.2,true);for(let i=0;i<8;i++)l([oct(210,150)[i],oct(210,320)[i]],descent);
  for(let k=0;k<4;k++){
   const a=k/4*TAU,c=Math.cos(a),s=Math.sin(a),pad:P=[430*c,0,430*s];
   l([[205*c,300,205*s],[430*c,22,430*s]],descent,1.6);
   for(const side of [-1,1])l([[190*c-side*70*s,165,190*s+side*70*c],[430*c,22,430*s]],descent);
   this.ring(b,pad,[45*c,0,45*s],[-45*s,0,45*c],descent,1.2,alpha,12,tf);
  }
  this.ring(b,[0,150,0],[42,0,0],[0,0,42],descent,1,alpha,12,tf);this.ring(b,[0,55,0],[80,0,0],[0,0,80],descent,1,alpha,12,tf);
  for(let i=0;i<8;i++){const a=i/8*TAU;l([[42*Math.cos(a),150,42*Math.sin(a)],[80*Math.cos(a),55,80*Math.sin(a)]],descent);}
  // The ladder and porch on the forward leg.
  for(const z of [-22,22])l([[-215,300,z],[-395,60,z]],descent);for(let i=0;i<7;i++){const u=i/6;l([[-215-180*u,300-240*u,-22],[-215-180*u,300-240*u,22]],descent);}
  // Ascent stage: the cabin drum facing forward, the midsection, the tanks and the aft bay.
  for(const x of [-150,-85,-20])this.ring(b,[x,445,0],[0,118,0],[0,0,118],ascent,1.1,alpha,20,tf);
  for(let i=0;i<10;i++){const a=i/10*TAU;l([[-150,445+118*Math.cos(a),118*Math.sin(a)],[-20,445+118*Math.cos(a),118*Math.sin(a)]],ascent);}
  this.box(b,-20,330,-105,135,200,210,ascent,alpha,tf);this.box(b,115,365,-72,60,135,144,ascent,alpha,tf);
  for(const z of [-160,160]){this.ring(b,[30,410,z],[62,0,0],[0,62,0],ascent,1,alpha,14,tf);this.ring(b,[30,410,z],[62,0,0],[0,0,40],ascent,1,alpha,14,tf);}
  this.ring(b,[-10,530,0],[42,0,0],[0,0,42],ascent,1,alpha,12,tf);this.ring(b,[-10,585,0],[42,0,0],[0,0,42],ascent,1,alpha,12,tf);
  for(const z of [-58,58])l([[-152,500,z-32],[-152,500,z+32],[-152,440,z+(z<0?30:-30)]],ascent,1.4,true);
  l([[-110,563,-60],[-110,625,-60]],ascent);this.ring(b,[-128,640,-60],[0,34,0],[0,0,34],ascent,1,alpha,12,tf);
  l([[60,530,95],[75,640,120]],ascent);this.ring(b,[75,655,120],[30,0,10],[0,8,-30],ascent,1,alpha,12,tf);
  b.end();
 }
 private makeEffects(){
  // The engine's exhaust, hung from the bell; three contact probes under the pads; dust along the ground.
  const p=this.plume;p.begin();for(let i=0;i<12;i++){const a=i/12*TAU;this.line(p,[[70*Math.cos(a),0,70*Math.sin(a)],[150*Math.cos(a),-330,150*Math.sin(a)]],'#a8d6ff',1,.45);}
  for(const [y,r] of [[-110,95],[-230,125]])this.ring(p,[0,y,0],[r,0,0],[0,0,r],'#a8d6ff',.9,.3,16);p.end();p.group.position.y=55;
  const q=this.probes;q.begin();for(const k of [1,2,3]){const a=k/4*TAU;this.line(q,[[430*Math.cos(a),0,430*Math.sin(a)],[430*Math.cos(a),-170,430*Math.sin(a)]],gold,1,.8);}q.end();
  const d=this.dust;d.begin();for(let i=0;i<56;i++){const a=i/56*TAU+(i%3)*.04,far=900+(i*37%11)*95;this.line(d,[[170*Math.cos(a),6,170*Math.sin(a)],[far*.55*Math.cos(a),22+i%4*9,far*.55*Math.sin(a)],[far*Math.cos(a),8,far*Math.sin(a)]],'#e2dccd',1,.5);}d.end();
 }
 private makeCabin(b:Beams){
  b.begin();
  // A drum a little over two metres across: the two men stand side by side, facing the windows (+z).
  for(const z of [-70,-20,40,92])this.ring(b,[0,150,z],[116,0,0],[0,116,0],silver,.9,.3,28);
  for(let i=0;i<12;i++){const a=i/12*TAU;this.line(b,[[116*Math.cos(a),150+116*Math.sin(a),-70],[116*Math.cos(a),150+116*Math.sin(a),92]],silver,.8,.22);}
  // Behind them: the ascent engine cover, the hatch overhead, stowage.
  this.ring(b,[0,58,-38],[40,0,0],[0,0,40],silver,1,.5,16);this.ring(b,[0,20,-38],[46,0,0],[0,0,46],silver,1,.4,16);for(let i=0;i<8;i++){const a=i/8*TAU;this.line(b,[[40*Math.cos(a),58,-38+40*Math.sin(a)],[46*Math.cos(a),20,-38+46*Math.sin(a)]],silver,.8,.35);}
  this.ring(b,[0,262,-12],[40,0,0],[0,0,40],silver,1,.45,16);this.box(b,-96,70,-72,44,80,6,silver,.4);this.box(b,52,70,-72,44,80,6,silver,.4);
  // Ahead: the two triangular windows and the panel between them, with the computer's keyboard.
  for(const side of [-1,1])this.line(b,[[side*22,214,96],[side*84,214,96],[side*40,158,104]],'#bfe6ff',1.4,.85,true);
  this.box(b,-30,96,92,60,108,10,silver,.6);
  for(let r=0;r<4;r++)for(let c=0;c<5;c++)this.box(b,-21+c*8.6,104+r*8,91,6.4,5.6,1,crt,.5);
  this.box(b,-21,142,91,20,24,1,crt,.8);this.box(b,3,142,91,20,24,1,amber,.5);
  for(const x of [-64,48])this.box(b,x,118,90,16,10,8,silver,.6);
  b.end();
 }
 private makeLights(){
  // On the computer: PROG, lit by the 1201 and 1202 alarms. On the panel: the blue lunar contact light.
  const p=this.progLight;p.begin();for(let i=0;i<4;i++)this.line(p,[[4+i,152+i,90.5],[22-i,152+i,90.5],[22-i,164-i,90.5],[4+i,164-i,90.5]],amber,2,1,true,true);p.end();
  const c=this.contactLight;c.begin();for(const x of [-60,52])for(let i=0;i<3;i++)this.ring(c,[x+8,123,89.5],[3+i*1.6,0,0],[0,3+i*1.6,0],'#6fb6ff',2,1,14);c.end();
 }
 private makeHouston(b:Beams){
  b.begin();
  // The CapCom's console: a sloped desk of screens in front of him, and the rows behind on their tiers.
  const console=(x:number,y:number,z:number,w:number,glow:number)=>{
   this.box(b,x,y,z,w,30,44,crt,.5);this.line(b,[[x,y+30,z],[x,y+52,z+16],[x+w,y+52,z+16],[x+w,y+30,z]],crt,1,.6,true);
   for(let i=0;i<Math.round(w/34);i++)this.line(b,[[x+5+i*34,y+33,z+3],[x+29+i*34,y+33,z+3],[x+29+i*34,y+49,z+14],[x+5+i*34,y+49,z+14]],i%2?amber:crt,1.1,glow,true);
  };
  console(-82,66,34,164,.9);
  for(const [row,z] of [[1,-118],[2,-236]] as const)for(const x of [-250,-82,86]){
   console(x,66+row*22,z+34,164,.45);
   // Flight controllers, drawn as plain figures: only the CapCom has a working mouth.
   for(const dx of [38,120]){const hx=x+dx,hy=118+row*22;this.ring(b,[hx,hy,z],[8,0,0],[0,10.5,0],suit,.9,.4,12);this.ring(b,[hx,hy,z],[0,0,8],[0,10.5,0],suit,.9,.3,12);this.line(b,[[hx-19,hy-21,z],[hx-8,hy-12,z],[hx+8,hy-12,z],[hx+19,hy-21,z],[hx+17,hy-52,z],[hx-17,hy-52,z]],suit,.9,.35,true);}
  }
  for(const row of [0,1,2])this.line(b,[[-330,row*22,-118*row+92],[330,row*22,-118*row+92]],crt,.8,.25);
  this.box(b,-24,34,-28,48,6,44,suit,.4);this.line(b,[[-22,40,-27],[-22,104,-33],[22,104,-33],[22,40,-27]],suit,1,.45);
  b.end();
 }
 /** Gear sits in the head's own frame (+x is the face); the body hangs from the head centre (+z is the front). */
 private dress(p:Person){
  const g=p.gear,b=p.body,crew=p.id!=='capcom';g.begin();
  if(crew){
   // The soft "Snoopy" communications cap, with both microphones.
   for(let i=0;i<9;i++){const z=(i/8-.5)*15,c=Math.sqrt(1-(z/8.2)**2);this.line(g,Array.from({length:13},(_,j)=>{const a=j/12*Math.PI;return [-.6-8.4*c*Math.cos(a),17.6+7*c*Math.sin(a),z] as P;}),i>2&&i<6?'#f1f3f4':'#6f5a48',1,.75);}
   for(const z of [-8.8,8.8]){this.ring(g,[0,8,z],[3.4,0,0],[0,3.4,0],'#6f5a48',1.1,.85,12);this.line(g,[[1,6,z],[7,2.5,z*.8],[9.6,1.5,z*.35]],'#d7dde0',1.1,.9);}
  }else{
   for(let i=0;i<13;i++){const z=(i/12-.5)*14.4,c=Math.sqrt(1-(z/8)**2);this.line(g,Array.from({length:11},(_,j)=>{const a=j/10*Math.PI;return [-.8-8*c*Math.cos(a),17.8+6.4*c*Math.sin(a),z] as P;}),'#9a8a6c',.9,.7);}
   // A headset: the band over the top, one earpiece, the boom to the mouth.
   this.line(g,Array.from({length:13},(_,j)=>{const a=j/12*Math.PI;return [-1,9+15.5*Math.sin(a),-9.4*Math.cos(a)] as P;}),'#dfe5e7',1.4,.9);
   this.ring(g,[-1,8,9.4],[3.2,0,0],[0,3.2,0],'#dfe5e7',1.3,.9,12);this.line(g,[[0,6,9.4],[6.5,2.4,7.5],[9.8,1.4,3]],'#dfe5e7',1.3,.95);
  }
  g.end();b.begin();
  const shirt=crew?suit:'#eef1f2',rings:[number,number,number][]=crew?[[-9,13.5,13.5],[-14,24,13],[-34,23,13],[-52,22,13]]:[[-4,5.5,5],[-11,21,9],[-30,19,10],[-46,19,10]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],shirt,.9,.65);
  for(let i=0;i<16;i++){const a=i/16*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)] as P),shirt,.85,.5);}
  if(crew){
   // The pressure helmet: a clear bubble on the neck ring.
   for(const [u,v] of [[[17,0,0],[0,17,0]],[[0,0,17],[0,17,0]],[[17,0,0],[0,0,17]]] as [P,P][])this.ring(b,[1,4,0],u,v,'#bfe6ff',.8,.3,24);
   this.ring(b,[0,-9,0],[13.5,0,0],[0,0,13.5],'#b8c2c8',1.6,.9);
   // Hoses to the suit, and hands forward on the controls.
   for(const x of [-9,9])this.ring(b,[x,-27,13.4],[3.4,0,0],[0,3.4,0],x<0?'#6f9bd8':'#d86f6f',1.2,.9,10);
   for(const side of [-1,1]){const elbow:P=[side*28,-34,10],wrist:P=[side*20,-44,42];this.line(b,[[side*24,-16,0],elbow,wrist],shirt,2,.8);this.ring(b,wrist,[3.6,0,0],[0,3.6,0],'#cfd6da',1.2,.8,10);}
  }else{
   for(const side of [-1,1]){this.line(b,[[side*5,-3,5],[side*12,-10,9.5],[side*5,-20,10.5],[side*1.5,-11,10]],'#ffffff',1.2,.9);const elbow:P=[side*25,-30,8],wrist:P=[side*12,-38,36];this.line(b,[[side*21,-12,0],elbow,wrist],shirt,2,.75);}
   this.line(b,[[0,-11,10.4],[-2.6,-30,11],[0,-35,11],[2.6,-30,11]],'#3b4a5a',1.6,.95,true);
  }
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),s=landingState(t),set=landingSet(view);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  this.moon.visible=set==='moon';this.cabin.visible=set==='cabin';this.houston.visible=set==='houston';
  const c=landingCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;
  if(set==='moon'){this.camera.near=50;fog.near=Math.max(5000,distance*1.1);fog.far=Math.max(70000,distance*3.4,s.altitude*4.5+60000);}else{this.camera.near=2;fog.near=distance*1.5;fog.far=distance+620;}
  this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  // The lander, tilted back while it brakes; its exhaust, probes, dust and shadow follow the same clock.
  const [x,y,z]=s.position;this.lander.position.set(x,y,z);this.lander.rotation.z=-s.pitch;
  this.plume.group.visible=s.throttle>0;this.plume.group.scale.set(1,.85+.25*Math.sin(t*47)*Math.sin(t*13),1);
  this.probes.group.scale.y=Math.max(.02,Math.min(1,s.altitude/170));
  this.dust.group.visible=s.dust>.01;this.dust.group.position.set(x,moonHeight(x,z),z);this.dust.group.rotation.y=t*.9;this.dust.group.scale.setScalar(.25+1.05*s.dust+.06*Math.sin(t*31));
  const far=x-s.altitude*SUN_STRETCH;this.shade.group.position.set(far,moonHeight(far,z)+3,z);
  this.progLight.group.visible=s.alarmLit;this.contactLight.group.visible=s.contact;
  for(const p of this.people){
   // The pilot watches the ground through his window; the other reads the instruments aloud.
   const turn=p.id==='armstrong'?.38*s.relief:p.id==='aldrin'?-.38*s.relief:0,nod=p.id==='aldrin'?-.16*(1-s.relief):p.id==='armstrong'?.05:0;
   p.root.rotation.y=turn;p.head.scene.rotation.set(0,-Math.PI/2,nod);
   const msg=p.track.message(p.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic);
   p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  }
  this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.gear.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();}
}
