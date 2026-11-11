import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {matrixCamera,matrixPose,matrixWorld,spoonBowl,type MatrixPerson,type MatrixPoint as P} from '../../scene/matrix.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,green='#648274',wood='#7d8061',robe='#b7c1a2',coat='#385957',silver='#c1dddd',skin='#96bac2';
interface Person{id:MatrixPerson;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;clothes:Beams;arms:Beams}
/** Three physical speakers and a bendable spoon in the Oracle's waiting room. */
export class MatrixRoom{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,3000);readonly people:Person[]=[];
 readonly room=new Beams();readonly furniture=new Beams();readonly rug=new Beams();readonly pile=new Beams();readonly spoon=new Beams();readonly spoonRoot=new THREE.Group();readonly reflection=new Anatomy3D();
 private beams:Beams[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(cast:{id:MatrixPerson;model:VoiceModel;track:TeleTrack}[]){
  this.scene.background=new THREE.Color(0x050b08);
  this.scene.fog=new THREE.Fog(0x000000,140,350);
  for(const c of cast){
   const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),clothes:new Beams(),arms:new Beams()};
   p.head.centred=true;p.head.attachAccessory(p.hair.group);p.root.add(p.head.scene,p.clothes.group,p.arms.group);this.scene.add(p.root);this.people.push(p);
   for(const [n,b] of Object.entries({hair:p.hair,clothes:p.clothes,arms:p.arms})){b.group.name=c.id+'-'+n;this.beams.push(b);}this.makeHair(p);
  }
  for(const [n,b] of Object.entries({room:this.room,furniture:this.furniture,rug:this.rug,pile:this.pile})){b.group.name=n;this.scene.add(b.group);this.beams.push(b);}
  this.spoon.group.name='bending-spoon';this.beams.push(this.spoon);this.spoonRoot.add(this.spoon.group,this.reflection.scene);this.scene.add(this.spoonRoot);
  this.reflection.centred=true;this.reflection.scene.rotation.order='ZYX';this.reflection.scene.scale.set(-.21,.21,.12);this.reflection.scene.rotation.y=-Math.PI/2;
  this.makeRoom();this.makeFurniture();this.makeRug();this.makePile();this.resize(1280,720);this.frame(0,false,0,'matrix-floor',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6){this.line(b,Array.from({length:28},(_,i)=>{const a=i/28*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){
  for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);
  for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);
 }
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.6){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);
  for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 private makeHair(p:Person){
  const b=p.hair;b.begin();
  if(p.id!=='spoon-boy'){
   for(let i=0;i<27;i++){const z=(i/26-.5)*14.6,c=Math.sqrt(1-(z/8)**2);this.line(b,Array.from({length:25},(_,j)=>{const a=j/24*Math.PI;return [-.6-8*c*Math.cos(a),17.8+6.7*c*Math.sin(a)+.25*Math.sin(a*5+i*.4),z] as P;}),'#64726b',.9,.8);}
   if(p.id==='neo')for(let i=0;i<18;i++)this.line(b,Array.from({length:20},(_,j)=>{const t=j/19;return [7-16*t,20+4*Math.sin(t*Math.PI),(i/17-.5)*13+1.1*Math.sin(t*3)] as P;}),'#78877a',.9,.7);
   else{
    for(let i=0;i<16;i++)this.line(b,Array.from({length:28},(_,j)=>{const t=j/27;return [-8-3*t,18-36*t,(i/15-.5)*15+.5*Math.sin(t*24+i)] as P;}),'#586a61',1,.8);
    for(const z of [-8,8])this.ring(b,[-.5,10.3,z],[1.1,0,0],[0,1.7,0],'#b8bd8b',1.3,.85);
   }
  }b.end();
 }
 private clothes(p:Person,sit:number){
  const b=p.clothes,boy=p.id==='spoon-boy',assistant=p.id==='oracle-assistant',color=boy?robe:assistant?'#a9c3b8':coat;b.begin();
  if(boy){
   const rings=[[-4,5,4],[-10,14,7],[-24,12,7],[-36,23,15],[-45,27,17]];
   for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],color,.9,.8);
   for(let i=0;i<28;i++){const a=i/28*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a)+.5*Math.sin(i),y,z*Math.sin(a)]),color,.85,.65);}
   for(let i=0;i<5;i++)this.line(b,[[-12,-5-i,4],[-6,-12-i,9],[4,-17-i,9],[13,-8-i,5]],color,1,.85);
   this.line(b,[[-25,-39,8],[-5,-42,16],[22,-37,12]],color,1,.8);
  }else{
   const rings=[[-4,5.5,5],[-11,assistant?18:21,9],[-31,assistant?16:20,10],[-46,assistant?18:20,10]];
   for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],color,.9,.7);
   for(let i=0;i<18;i++){const a=i/18*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),color,.85,.6);}
   for(const side of [-1,1]){
    this.line(b,[[side*5,-3,5],[side*13,-12,10],[side*4,-25,11],[side*3,-13,10]],color,1.3,.85);
    const bottom=-100+44*sit,knee:P=[side*(10+sit*13),-74+sit*26,2+sit*24],ankle:P=[side*(10+sit*22),bottom+3,4+sit*17];
    this.tube(b,[side*9,-45,0],knee,7,5,coat);this.tube(b,knee,ankle,5,3.5,coat);this.box(b,ankle[0]-4,bottom,ankle[2]-3,8,5,15,coat,.65);
   }
   this.line(b,[[0,-14,11],[0,-45,11]],color,1,.75);
   if(!assistant)for(const y of [-21,-29,-37])this.ring(b,[0,y,11],[.5,0,0],[0,.5,0],'#788a7d',.8,.65);
  }b.end();
 }
 private hand(b:Beams,w:P,grip:boolean){
  const [x,y,z]=w;this.line(b,[[x-2,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2,y,z]],skin,1,.85,true);
  for(let i=0;i<4;i++){const dx=-1.5+i;this.line(b,[[x+dx,y+3,z+1],[x+dx,y+6,z+1],[x+dx,y+(grip?4:7),z+(grip?3:2)]],skin,.85,.8);}
 }
 private arms(p:Person,pose:ReturnType<typeof matrixPose>){
  const b=p.arms,boy=p.id==='spoon-boy',assistant=p.id==='oracle-assistant',color=boy?robe:assistant?'#a9c3b8':coat;b.begin();
  for(const side of [-1,1]){
   let wrist:P=[side*(boy?12:18),boy?-32:-46,10],elbow:P=[side*(boy?18:25),boy?-20:-29,5];
   const holding=boy&&side===1&&pose.take<.9||p.id==='neo'&&side===-1&&pose.take>.08;
   if(holding){const v=new THREE.Vector3(...pose.base).applyMatrix4(p.root.matrixWorld.clone().invert());wrist=v.toArray() as P;elbow=[side*(boy?19:26),boy?-18:-27,16];}
   if(p.id==='neo'&&side===1&&pose.lean>.7&&pose.take>.95){const v=new THREE.Vector3(...matrixWorld([0,12,0],pose.base,pose.spoonYaw)).applyMatrix4(p.root.matrixWorld.clone().invert());wrist=[v.x-6,v.y-9,v.z];elbow=[23,-24,19];}
   this.tube(b,[side*(boy?13:assistant?18:21),-10,0],elbow,boy?3.6:5,boy?2.8:4,color,.7);this.tube(b,elbow,wrist,boy?2.8:4,boy?1.7:2.3,color,.7);this.hand(b,wrist,holding);
  }b.end();
 }
 private drawSpoon(b:Beams,bend:number,map:(p:P)=>P,width=1){
  const at=(t:number,side:number):P=>{const a=bend*t,x=Math.abs(bend)<1e-6?0:17/bend*(1-Math.cos(a)),y=Math.abs(bend)<1e-6?17*t:17/bend*Math.sin(a);return [x+side*(.45+.2*t)*Math.cos(a),y-side*(.45+.2*t)*Math.sin(a),0];};
  for(const side of [-1,1])this.line(b,Array.from({length:28},(_,i)=>map(at(i/27,side))),silver,width,1);
  this.line(b,[map(at(0,-1)),map([0,-2,0]),map(at(0,1))],silver,width,.9);
  const bowl=spoonBowl(bend);
  for(let ring=0;ring<6;ring++){const r=1-ring*.15;this.line(b,Array.from({length:45},(_,i)=>{const a=i/45*TAU;return map(bowl.center.map((x,j)=>x+bowl.side[j]*3.2*r*Math.cos(a)+bowl.along[j]*4.4*r*Math.sin(a)+(j===2?-.9*(1-r*r):0)) as P);}),silver,width*(ring===0?1.3:.65),ring===0?1:.45,true);}
  for(let k=0;k<8;k++)this.line(b,Array.from({length:20},(_,i)=>{const a=k/8*TAU,r=-1+2*i/19;return map(bowl.center.map((x,j)=>x+bowl.side[j]*3.2*r*Math.cos(a)+bowl.along[j]*4.4*r*Math.sin(a)+(j===2?-.9*(1-r*r):0)) as P);}),silver,width*.65,.4);
 }
 private makePile(){
  const b=this.pile;b.begin();for(let i=0;i<7;i++){const a=i*.93,bend=.2+(i%4)*.45;this.drawSpoon(b,bend,v=>[-56+(i%3)*11+v[0]*Math.cos(a)-v[1]*Math.sin(a),1+v[2],17+Math.floor(i/3)*13+v[0]*Math.sin(a)+v[1]*Math.cos(a)],.9);}b.end();
 }
 private makeRug(){
  const b=this.rug;b.begin();for(let k=0;k<6;k++)this.line(b,[[-112+k*3,.3,77-k*3],[108-k*3,.3,77-k*3],[108-k*3,.3,-55+k*3],[-112+k*3,.3,-55+k*3]],wood,.8,.45,true);
  for(let x=-90;x<=90;x+=18)for(let z=-38;z<=58;z+=16)this.line(b,[[x-5,.4,z],[x,.4,z-5],[x+5,.4,z],[x,.4,z+5]],'#778563',.75,.3,true);
  for(let x=-108;x<108;x+=3)for(const z of [-55,77])this.line(b,[[x,.3,z],[x+1,.3,z+(z>0?5:-5)]],wood,.7,.5);b.end();
 }
 private makeRoom(){
  const b=this.room;b.begin();this.box(b,-190,-1,-150,380,166,320,green,.3);
  for(let x=-190;x<=190;x+=32){this.line(b,[[x,0,-150],[x,0,170]],wood,.75,.3);this.line(b,[[x,165,-150],[x,165,170]],'#99b1a1',.85,.3);}
  for(let z=-150;z<=170;z+=32)this.line(b,[[-190,165,z],[190,165,z]],'#99b1a1',.85,.3);
  for(const y of [5,43,150,158])this.line(b,[[-190,y,170],[-190,y,-150],[190,y,-150],[190,y,170]],green,1,.45);
  for(let i=0;i<38;i++){const x=-170+i*2.7;this.line(b,Array.from({length:30},(_,j)=>[x+Math.sin(j*.13+i)*1.4,12+j*5,-143+Math.sin(i*1.2)*4]),'#8c9c7d',.85,.6);}
  this.box(b,-189,0,12,4,130,75,wood,.7);this.box(b,-188,4,16,4,122,67,green,.5);
  this.box(b,60,65,-148,76,78,2,'#9b9e7b',1);this.box(b,64,69,-145,68,70,1,'#657f72',.5);b.end();
 }
 private makeFurniture(){
  const b=this.furniture;b.begin();
  for(const [x,z] of [[-6,-95],[135,-78]]){this.box(b,x-20,28,z-15,40,5,35,wood,.7);this.box(b,x-20,33,z-18,40,57,4,wood,.7);for(const dx of [-18,18])for(const dz of [-13,18])this.box(b,x+dx-2,0,z+dz-2,4,31,4,wood,.6);for(const dx of [-12,0,12])this.line(b,[[x+dx,37,z-16],[x+dx,85,z-16]],wood,1,.65);}
  this.box(b,78,0,-130,90,60,30,wood,.65);for(const y of [16,38,58])this.box(b,79,y,-130,88,2,30,wood,.6);
  for(let i=0;i<14;i++){const x=84+i*5.3;this.box(b,x,40,-108,4,15+(i%4)*2,16,i%3===0?'#a5966e':'#607a6b',.65);}
  for(let i=0;i<4;i++){const x=90+i*18;this.tube(b,[x,61,-115],[x,80+i%2*5,-115],2,4,'#b2ab6d',.7);this.ring(b,[x,81+i%2*5,-115],[5,0,0],[0,0,5],'#b2ab6d',1,.7);}
  for(const [x,z] of [[-115,-76],[-88,-104]]){this.box(b,x-17,1,z-12,34,6,24,'#94a48d',.4);this.tube(b,[x,8,z],[x,35,z],11,6,'#6f8b7d',.25);this.ring(b,[x,46,z],[6,0,0],[0,8,0],'#799787',.8,.25);}
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);this.reflection.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const duration=Math.max(...this.people.map(p=>p.track.duration)),t=Math.max(0,Math.min(duration,Number.isFinite(time)?time:0)),pose=matrixPose(t);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25){for(const p of this.people)p.head.resetMotion();this.reflection.resetMotion();}
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=matrixCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;fog.near=distance*1.05;fog.far=distance+(view==='wide'?270:150);
  // The reflection close-up isolates the spoon so a second, full-size face cannot show through its wireframe bowl.
  for(const p of this.people){const boy=p.id==='spoon-boy',assistant=p.id==='oracle-assistant';p.root.visible=(!assistant||pose.assistantVisible)&&!(p.id==='neo'&&view==='matrix-spoon'&&t>=50);p.root.position.set(...(boy?pose.boy:assistant?pose.assistant:pose.neo));p.root.rotation.y=boy?pose.boyYaw:assistant?pose.assistantYaw:pose.neoYaw;p.head.scene.rotation.set(0,-Math.PI/2,p.id==='neo'?.26*pose.lookUp:boy?-.04:0);this.clothes(p,p.id==='neo'?pose.sit:0);}
  this.scene.updateMatrixWorld(true);for(const p of this.people)this.arms(p,pose);
  this.spoonRoot.position.set(...pose.base);this.spoonRoot.rotation.set(0,pose.spoonYaw,pose.lean);this.spoon.begin();this.drawSpoon(this.spoon,pose.bend,v=>v,1.25);this.spoon.end();
  const bowl=spoonBowl(pose.bend);this.reflection.scene.visible=t>=50;this.reflection.scene.position.set(bowl.center[0],bowl.center[1]-1.3,.25);this.reflection.scene.rotation.z=-pose.bend;
  for(const p of this.people){p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();const msg=p.track.message(p.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic),frame=p.model.frame(artic);p.head.face.update(tele,dt);p.head.update(p.model,frame,artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
   if(p.id==='neo'&&this.reflection.scene.visible){this.reflection.camera.copy(this.camera);this.reflection.camera.updateMatrixWorld();this.reflection.face.update(tele,dt);this.reflection.update(p.model,frame,artic,tele,{pressure:false,particles:false,grid:false,calipers:false},dt);}
  }this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.head.dispose();}this.reflection.dispose();for(const b of this.beams)b.dispose();}
}
