import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {puppetPose,puppetCamera,PUPPET_POSITIONS,type PuppetId,type PuppetPoint as P} from '../../scene/puppets.ts';
const TAU=2*Math.PI,pink='#ff70bc',yellow='#ffe65d',orange='#ff9b32',green='#a7d55d',white='#fff7db';
interface Puppet{id:PuppetId;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;costume:Beams;motion:Beams;eyes:THREE.Group}
/** The trio's costumes surround the physical heads; the voices and airway movement share one clock. */
export class PuppetStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,6000);readonly actors:Puppet[]=[];
 readonly studio=new THREE.Group();readonly curtain=new THREE.Group();readonly backstage=new THREE.Group();readonly balcony=new THREE.Group();readonly telephone=new Beams();
 private beams:Beams[]=[];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private lastTime:number|null=null;private epoch=-1;private duration:number;
 constructor(cast:{id:PuppetId;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==6||Object.keys(PUPPET_POSITIONS).some(id=>!cast.some(c=>c.id===id)))throw Error('The trio and three supporting voices are required.');
  this.duration=cast[0].track.duration;this.scene.background=new THREE.Color('#261727');
  this.scene.add(this.studio,this.curtain,this.backstage,this.balcony,this.telephone.group);this.beams.push(this.telephone);
  for(const c of cast){const a:Puppet={...c,root:new THREE.Group(),head:new Anatomy3D(),costume:new Beams(),motion:new Beams(),eyes:new THREE.Group()};a.root.name=c.id;a.head.centred=true;a.head.scene.rotation.y=-Math.PI/2;a.head.scene.scale.setScalar(c.id.startsWith('snowth')?1.3:1.5);a.root.add(a.head.scene,a.costume.group,a.motion.group,a.eyes);this.scene.add(a.root);this.actors.push(a);this.beams.push(a.costume,a.motion);this.costume(a);}
  this.stage();this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,ps:P[],color:string,width=1,alpha=.8,close=false){b.line(ps.flat(),ps.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.8,n=32){this.line(b,Array.from({length:n},(_,i)=>{const a=i/n*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,.8,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color);}
 private mesh(parent:THREE.Group,geometry:THREE.BufferGeometry,color:string,p:P,scale:P=[1,1,1]){const m=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color}));m.position.set(...p);m.scale.set(...scale);parent.add(m);this.meshes.push(m);return m;}
 private sphere(parent:THREE.Group,p:P,scale:P,color:string){return this.mesh(parent,new THREE.SphereGeometry(1,18,12),color,p,scale);}
 private fur(b:Beams,c:P,r:P,color:string,count=180){for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,a=i*2.399963,rr=Math.sqrt(1-y*y),n:[number,number,number]=[rr*Math.cos(a),y,rr*Math.sin(a)],length=3+5*(.5+.5*Math.sin(i*13.71));const start=c.map((x,j)=>x+n[j]*r[j]) as P;this.line(b,[start,start.map((x,j)=>x+n[j]*length+(j===1?-2:0)) as P],color,.9,.75);}}
 private costume(a:Puppet){const b=a.costume;b.begin();const snow=a.id.startsWith('snowth'),old=a.id==='statler'||a.id==='waldorf';
  if(snow){
   for(let y=-74;y<-8;y+=7)this.ring(b,[0,y,0],[21+(y+74)*.08,0,0],[0,0,17],pink,1.3,.85);
   this.fur(b,[0,-40,0],[25,37,18],pink,260);
   // A long pink snout, horns and eyelashes distinguish the two answering creatures.
   for(let z=-3;z<=23;z+=4)this.ring(b,[0,17,z],[21,0,0],[0,18,0],pink,1.6,.9);
   for(let i=0;i<24;i++){const q=i/24*TAU;this.line(b,[[21*Math.cos(q),17+18*Math.sin(q),-3],[21*Math.cos(q),17+18*Math.sin(q),23]],pink,1.1,.75);}
   for(const side of [-1,1]){this.line(b,[[side*19,30,-4],[side*32,36,-5],[side*39,48,-7],[side*37,29,-8],[side*27,23,-7]],pink,2.1,.95);const x=side*10;
    this.sphere(a.eyes,[x,42,8],[9,11,6],white);this.sphere(a.eyes,[x,42,13.5],[4.3,5.7,2.5],'#16121b');
    for(let i=0;i<9;i++){const q=(i/8)*Math.PI;this.line(b,[[x+10*Math.cos(q),43+11*Math.sin(q),7],[x+17*Math.cos(q),45+18*Math.sin(q),6]],'#8988ef',1.6,.95);}}
  }else if(a.id==='mahna'){
   this.fur(b,[0,-34,-1],[30,41,22],green,300);for(const y of [-70,-50,-25,-8])this.ring(b,[0,y,0],[29,0,0],[0,0,20],green,1.3,.85);
   this.fur(b,[0,28,-5],[35,29,23],orange,330);this.fur(b,[0,2,1],[27,16,19],orange,160);
   this.sphere(a.eyes,[0,17,26],[10,8,7],'#d18ed4');
   for(const side of [-1,1]){this.sphere(a.eyes,[side*12,35,21],[9,10,3],'#17131b');this.ring(b,[side*12,35,25],[11,0,0],[0,12,0],yellow,2.1,.95);}
   this.line(b,[[-2,36,25],[2,36,25]],yellow,2.1,.95);
  }else if(a.id==='kermit'){
   for(let y=-65;y<5;y+=7)this.ring(b,[0,y,-2],[22-(y+65)*.04,0,0],[0,0,14],green,1.3,.9);
   for(const side of [-1,1]){this.sphere(a.eyes,[side*12,35,7],[11,11,9],white);this.sphere(a.eyes,[side*12,36,15],[3,5,2],'#151a12');this.line(b,[[side*18,35,17],[side*7,35,17]],'#151a12',2,.95);}
   for(let i=0;i<14;i++){const q=i/14*TAU;this.line(b,[[20*Math.cos(q),-9,14*Math.sin(q)],[29*Math.cos(q+.13),-28,21*Math.sin(q+.13)],[20*Math.cos(q+.24),-9,14*Math.sin(q+.24)]],green,1.6,.95);}
   for(const y of [10,20,27])this.ring(b,[0,y,3],[26,0,0],[0,0,18],green,1.3,.85);
  }else if(old){
   const color=a.id==='waldorf'?'#d3bca0':'#b8a6a4';this.fur(b,[0,34,-5],[23,18,17],white,a.id==='waldorf'?85:140);
   for(const y of [-60,-40,-14])this.ring(b,[0,y,0],[28,0,0],[0,0,20],color,1.3,.9);
   for(const side of [-1,1]){this.line(b,[[side*5,-5,15],[side*23,-17,20],[side*5,-37,21]],white,1.6,.9);this.line(b,[[0,-12,21],[side*8,-18,22],[0,-20,21]],white,2,.9);}
   this.sphere(a.eyes,[0,20,23],[a.id==='waldorf'?10:7,8,a.id==='waldorf'?8:15],color);
   if(a.id==='waldorf'){this.fur(b,[0,2,12],[11,8,10],white,70);for(const side of [-1,1])this.ring(b,[side*11,31,21],[10,0,0],[0,8,0],white,1.6,.95);}
  }b.end();
 }
 private stage(){
  this.mesh(this.studio,new THREE.BoxGeometry(800,450,3),'#4d334c',[0,175,-320]);
  this.mesh(this.studio,new THREE.BoxGeometry(800,3,600),'#352339',[0,0,-50]);
  // Red theatre curtains for the presenter and the closing balcony.
  for(const group of [this.curtain,this.balcony]){this.mesh(group,new THREE.BoxGeometry(700,350,4),'#451721',[0,150,-150]);const b=new Beams();this.beams.push(b);group.add(b.group);b.begin();for(let x=-340;x<=340;x+=8)this.line(b,[[x,-25,-145],[x,325,-145]],x%24===0?'#dc5157':'#88353e',1.6,.9);b.end();}
  const stage=new Beams();this.beams.push(stage);this.backstage.add(stage.group);stage.begin();this.mesh(this.backstage,new THREE.BoxGeometry(700,350,4),'#2f2927',[0,150,-180]);
  for(let x=-280;x<=280;x+=60)this.box(stage,x,0,-175,50,280,30,'#936e47');this.box(stage,-110,35,-4,220,7,88,'#c29d69');for(const x of [-95,95])this.box(stage,x,0,5,8,35,65,'#c29d69');this.box(stage,-60,42,35,24,17,22,white);this.ring(stage,[-25,48,50],[8,0,0],[0,0,8],white);stage.end();
  const box=new Beams();this.beams.push(box);this.balcony.add(box.group);box.begin();this.mesh(this.balcony,new THREE.BoxGeometry(240,62,12),'#762e2d',[0,34,45]);for(const y of [4,12,58,68])this.line(box,[[-130,y,55],[130,y,55]],yellow,2.1,.9);for(let x=-120;x<=120;x+=20){this.ring(box,[x,36,54],[7,0,0],[0,17,0],'#deac5a',1.3,.9);}for(const x of [-135,135]){this.box(box,x-7,0,30,14,275,15,'#e2ba72');for(let y=0;y<280;y+=20)this.ring(box,[x,y,48],[10,0,0],[0,7,0],yellow,1.3,.8);}box.end();
 }
 private moving(a:Puppet,q:ReturnType<typeof puppetPose>,energy:number,artic:{jaw:number;lipAp:number}){const b=a.motion;b.begin();const snow=a.id.startsWith('snowth');const opening=Math.max(2,Math.min(15,3+artic.jaw*5+artic.lipAp*3+energy*6));
  if(snow){for(const d of [0,2.5,5])this.ring(b,[0,15,24+d],[22-d*.3,0,0],[0,opening+d*.25,0],yellow,2.1,.97);}
  else if(a.id==='kermit'){this.ring(b,[0,13,22],[24,0,0],[0,opening*.8,0],green,2.1,.95);}
  for(const side of [-1,1]){const color=snow?pink:a.id==='mahna'?green:a.id==='kermit'?green:white;const arm:P=[side*(30+energy*8),-31+energy*20,10];this.line(b,[[side*23,-11,0],arm,[side*(39+8*Math.sin(q.phase+side)),-39+energy*28,23]],color,2.1,.9);if(!snow)this.ring(b,[side*(39+8*Math.sin(q.phase+side)),-39+energy*28,23],[6,0,0],[0,5,0],color,1.6,.95);}
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const b of this.beams)b.setResolution(this.width,this.height);for(const a of this.actors)a.head.resize(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),q=puppetPose(t),cam=puppetCamera(view,this.width/this.height,t);if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const a of this.actors)a.head.resetMotion();const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;this.camera.position.set(...cam.position);this.camera.lookAt(...cam.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const backstage=view==='puppet-backstage'||view==='wide'&&q.backstage,balcony=view==='puppet-balcony'||view==='statler'||view==='waldorf'||view==='wide'&&q.balcony,intro=view==='kermit'&&!q.main&&!backstage||q.curtain&&!backstage&&!balcony;
  this.studio.visible=!backstage&&!balcony&&!intro;this.curtain.visible=intro;this.backstage.visible=backstage;this.balcony.visible=balcony;(this.scene.background as THREE.Color).set(this.studio.visible?'#352238':'#130d14');
  for(const a of this.actors){const snow=a.id.startsWith('snowth'),old=a.id==='statler'||a.id==='waldorf',p=a.id==='mahna'?q.lead:PUPPET_POSITIONS[a.id];a.root.position.set(...p);a.root.rotation.set(0,0,0);
   if(snow){a.root.rotation.y=(a.id==='snowth-left'?1:-1)*(.12+q.turn*2.7+q.lean*.42);a.root.position.y+=Math.sin(q.phase+(a.id==='snowth-left'?0:.12))*2.5;}
   if(a.id==='mahna'){a.root.rotation.z=Math.sin(q.phase*.48)*.07;a.root.rotation.y=Math.sin(q.t*1.3)*.12;}
   if(q.kermitOnStage>.1){if(a.id==='kermit'){a.root.position.x=-95;a.root.position.z=30;}if(a.id==='snowth-left')a.root.position.x=0;}
   a.root.visible=backstage?a.id==='kermit'||a.id==='mahna'&&q.t<130.6:balcony?old:intro?a.id==='kermit':a.id==='mahna'?q.entry<.95&&q.exit<.95&&q.t<137.5:snow||a.id==='kermit'&&q.kermitOnStage>.1;
   if(view in PUPPET_POSITIONS)a.root.visible=a.id===view;
   if(view==='puppet-pair'&&a.id==='mahna')a.root.visible=false;
   if(backstage&&a.id==='mahna'){a.root.position.set(-190+(130.6-q.t)*75,105,55);a.root.rotation.y=-.5;}
   if(!a.root.visible)continue;
   const msg=a.track.message(a.track.indexAt(t)),artic=VoiceModel.articFromArray(msg.t.artic),energy=Math.min(1,msg.t.outRms*4),tele=playing?msg:null;this.moving(a,q,energy,artic);a.head.camera.copy(this.camera);a.head.camera.updateMatrixWorld();a.head.face.update(tele,dt);a.head.face.content=snow?.2:.1;a.head.update(a.model,a.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  }
  const phone=this.telephone;phone.begin();this.box(phone,45,44,50,36,8,24,'#a0aaa5');this.ring(phone,[63,54,60],[10,0,0],[0,0,8],white,1.3,.95);const lifted=q.t>=138&&q.t<143.6,handset:P=lifted?[-27,122,42]:[63,59,61];this.line(phone,[[handset[0]-15,handset[1],handset[2]],[handset[0]-10,handset[1]+7,handset[2]],[handset[0]+10,handset[1]+7,handset[2]],[handset[0]+15,handset[1],handset[2]]],'#c0c5bb',2.1,.95);this.ring(phone,[handset[0]-15,handset[1],handset[2]],[5,0,0],[0,5,0],white,2,.95);this.ring(phone,[handset[0]+15,handset[1],handset[2]],[5,0,0],[0,5,0],white,2,.95);this.line(phone,Array.from({length:70},(_,i)=>{const u=i/69;return [handset[0]+15+(65-handset[0]-15)*u+3*Math.sin(i),handset[1]+(44-handset[1])*u,handset[2]+(60-handset[2])*u] as P;}),'#8c978e',1,.8);phone.end();phone.group.visible=backstage||q.t>=138&&q.t<145;this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const a of this.actors)a.head.dispose();for(const b of this.beams)b.dispose();for(const m of this.meshes){m.geometry.dispose();(m.material as THREE.Material).dispose();}}
}
