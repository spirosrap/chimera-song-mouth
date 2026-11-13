import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {helloPose,helloPlace,helloCamera,type HelloPoint as P,type HelloPlace,type HelloId} from '../../scene/hello.ts';
const TAU=Math.PI*2;
type Person={id:HelloId;model:VoiceModel;track:TeleTrack;head:Anatomy3D;group:THREE.Group;hair:Beams;clothes:Beams};
/** Four borrowed model leases; all scene motion derives from the source clock. */
export class HelloStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,10000);
 readonly people:Person[]=[];readonly bust=new THREE.Group();readonly cover=new THREE.Group();readonly dancers=new THREE.Group();readonly students=new THREE.Group();
 readonly rooms:Record<HelloPlace,THREE.Group>={classroom:new THREE.Group(),corridor:new THREE.Group(),studio:new THREE.Group(),dance:new THREE.Group(),bedroom:new THREE.Group(),piano:new THREE.Group(),reveal:new THREE.Group()};
 private beams:Beams[]=[];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private last:number|null=null;private epoch=-1;private veil:THREE.Mesh;
 constructor(cast:{id:HelloId;model:VoiceModel;track:TeleTrack}[]){
  this.scene.background=new THREE.Color('#1a171c');this.scene.fog=new THREE.Fog('#1a171c',2300,6500);Object.values(this.rooms).forEach(g=>this.scene.add(g));
  for(const c of cast){const head=new Anatomy3D(),group=new THREE.Group(),hair=new Beams(),clothes=new Beams();head.centred=true;head.attachAccessory(hair.group);group.add(head.scene,clothes.group);this.scene.add(group);this.beams.push(hair,clothes);const p={...c,head,group,hair,clothes};this.people.push(p);this.makeHair(p);}
  this.scene.add(this.bust,this.cover,this.dancers,this.students);this.buildSets();this.makeBust();
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,p:P[],c:string,w=1,a=.8,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.8){this.line(b,Array.from({length:32},(_,i)=>{const q=i/32*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q))as P;}),col,w,a,true);}
 private box(b:Beams,p:P,w:number,h:number,d:number,c:string){for(const z of [-d/2,d/2])this.line(b,[[-w/2,-h/2,z],[w/2,-h/2,z],[w/2,h/2,z],[-w/2,h/2,z]].map(v=>v.map((x,k)=>x+p[k])as P),c,1,.8,true);for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])this.line(b,[[p[0]+x,p[1]+y,p[2]-d/2],[p[0]+x,p[1]+y,p[2]+d/2]],c);}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private solid(parent:THREE.Object3D,p:P,w:number,h:number,d:number,c:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private floor(parent:THREE.Object3D,c:string){const m=this.plane(parent,2200,2200,c,[0,-1,-500]);m.rotation.x=-Math.PI/2;}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();const point=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray()as P;for(const t of [0,.5,1])this.line(b,Array.from({length:10},(_,i)=>point(t,i/10*TAU)),c,.85,.8,true);for(let i=0;i<8;i++)this.line(b,[point(0,i/8*TAU),point(1,i/8*TAU)],c,.85,.8);}
 private person(b:Beams,x:number,y:number,z:number,female:boolean,c:string,seated=false,gesture=0,inCar=false){
  for(let i=0;i<5;i++){const q=i/5*Math.PI;this.ring(b,[x,y+17,z],[9*Math.cos(q),0,9*Math.sin(q)],[0,13,0],'#c6b7a3');}
  for(let i=0;i<(female?20:16);i++){const q=i/(female?20:16)*TAU;this.line(b,[[x+9*Math.cos(q),y+29,z+9*Math.sin(q)],[x+11*Math.cos(q),y+10,z+10*Math.sin(q)],[x+12*Math.cos(q),y+(female?-6:7),z+11*Math.sin(q)]],female?'#d0af70':'#9c805c',.85);}
  this.tube(b,[x,y,z],[x,y-52,z],female?18:21,female?14:17,c);if(female){this.tube(b,[x,y-45,z],[x,y-76,z],17,30,c);this.ring(b,[x,y-39,z],[19,0,0],[0,0,11],'#c77764',1.3);}
  for(const side of [-1,1]){const hip:P=[x+side*9,y-(female?75:52),z],knee:P=[x+side*12,seated?y-58:y-94,z+(seated?34:0)],foot:P=[x+side*15,y-135,z+(seated?37:3)];if(!inCar){foot[1]=Math.max(3,foot[1]);this.tube(b,hip,knee,7,5,c);this.tube(b,knee,foot,5,3.5,c);this.line(b,[foot,[foot[0],foot[1],foot[2]+12]],'#c2b9ad',2);}
   const hand:P=gesture&&side<0?[x-9,y+7,z+18]:seated?[x+side*21,y-35,z+35]:[x+side*(28+8*gesture),y-50+gesture*12,z+14];this.tube(b,[x+side*20,y-8,z],[x+side*28,y-30,z+5],5,3.8,c);this.tube(b,[x+side*28,y-30,z+5],hand,3.8,2.6,c);for(let k=0;k<4;k++)this.line(b,[[hand[0]+k-2,hand[1],hand[2]],[hand[0]+(k-2)*1.5,hand[1]-6,hand[2]+3]],'#cbb9a2',.85);}
 }
 private chair(b:Beams,x:number,z:number){this.box(b,[x,24,z],35,8,37,'#b6aa7a');this.box(b,[x,47,z-17],35,43,8,'#d6c994');for(const a of [-14,14])for(const c of [-14,14])this.line(b,[[x+a,22,z+c],[x+a,1,z+c]],'#7f7b73',1.4);}
 private piano(g:THREE.Group,x:number,z:number){const b=this.ink(g);this.solid(g,[x,61,z-40],142,18,142,'#181c22');this.box(b,[x,61,z-40],142,18,142,'#89939b');const lid=this.solid(g,[x,96,z-65],145,3,115,'#252932');lid.rotation.x=-.27;for(const a of [-58,58])for(const c of [-70,10])this.box(b,[x+a,28,z+c],7,56,7,'#b0aaa0');for(let k=0;k<38;k++){this.solid(g,[x-62+k*3.3,72,z+36],3.05,2,16,'#dcd8c6');if(k%7!==2&&k%7!==6)this.solid(g,[x-60.5+k*3.3,74,z+30],1.5,3,9,'#252631');}for(let i=0;i<5;i++)this.plane(g,28,21,'#c6c3b3',[x-44+i*19,76+i*.4,z-6+i*3]).rotation.x=-Math.PI/2;this.box(b,[x,78,z-15],60,30,3,'#a7a399');this.solid(g,[x,28,z+86],58,8,28,'#433f3d');b.end();}
 private buildSets(){
  for(const [name,g] of Object.entries(this.rooms)){const place=name as HelloPlace,b=this.ink(g);this.floor(g,place==='dance'?'#665444':place==='corridor'?'#8b8975':'#514b45');this.plane(g,1600,650,place==='studio'||place==='reveal'?'#ad9c9f':place==='bedroom'?'#805f62':'#79726b',[0,280,-700]);
   for(const x of [-480,480]){this.plane(g,160,205,'#b2c1bd',[x,205,-690]);this.box(b,[x,205,-686],160,205,6,'#d5cfb6');this.line(b,[[x,102,-680],[x,307,-680],[x-80,205,-680],[x+80,205,-680]],'#c7c2b1',2);}
   if(place==='classroom'||place==='piano'){
    for(let row=0;row<5;row++)for(let col=0;col<9;col++)this.chair(b,(col-4)*46,-240-row*58);
    for(let i=0;i<24;i++)this.line(b,[[-600+i*50,0,-695],[-600+i*50+8,150,-695],[-600+i*50,550,-695]],'#a39b79',2);
    this.box(b,[-240,105,-100],175,130,6,'#bfbaa9');this.plane(g,166,122,'#404b48',[-240,105,-94]);for(const y of [80,90,100,110,120])this.line(b,[[-310,y,-89],[-180,y,-89]],'#b5b39f',.6,.55);
    this.piano(g,place==='piano'?0:-250,place==='piano'?15:-260);
   }
   if(place==='corridor'){
    for(const side of [-1,1])for(let i=0;i<12;i++){const z=180-i*75,x=side*260;this.solid(g,[x,100,z],16,200,65,'#777f76');this.box(b,[x-side*10,100,z],4,200,63,'#c1bca3');for(let k=0;k<4;k++)this.line(b,[[x-side*12,163+k*6,z-18],[x-side*12,163+k*6,z+18]],'#a1ad9f',1);this.line(b,[[x-side*13,98,z+20],[x-side*13,115,z+20]],'#d5d6c7',2);}
    for(let row=0;row<15;row++)for(let col=0;col<7;col++)this.line(b,[[col*70-245,1,200-row*70],[col*70-175,1,200-row*70],[col*70-175,1,130-row*70]],(col+row)%2?'#a7a18d':'#555b52',1.5);
    for(let i=0;i<9;i++)this.person(b,(i%3-1)*110,145,-220-Math.floor(i/3)*155,i%2===0,['#a67d77','#8a9c8b','#b9aa82'][i%3]);
   }
   if(place==='studio'||place==='reveal'){
    for(let i=0;i<6;i++){const x=(i%3-1)*225,z=-160-Math.floor(i/3)*220;this.box(b,[x,61,z],140,9,72,'#cdb592');for(const dx of [-60,60])for(const dz of [-29,29])this.line(b,[[x+dx,58,z+dz],[x+dx,0,z+dz]],'#bd9d75',1.8);this.line(b,[[x-30,65,z],[x,200,z-25],[x+30,65,z],[x,200,z-25],[x,65,z-45]],'#aa8d70',2);this.plane(g,60,82,'#c8c3b4',[x,144,z-10]);this.box(b,[x,144,z-8],60,82,3,'#dcd2b8');}
    this.solid(g,[15,40,20],104,6,72,'#b39778');for(const x of [-25,55])for(const z of [-8,45])this.box(b,[x,20,z],6,40,6,'#c1aa8b');
   }
   if(place==='dance'){
    this.plane(g,950,270,'#8d9997',[0,160,-490]);for(const x of [-475,-235,0,235,475])this.line(b,[[x,20,-480],[x,295,-480]],'#c6c9bb',2);this.line(b,[[-510,100,-465],[510,100,-465]],'#bca17c',2.6);
    for(const x of [-440,440])this.line(b,[[x,1,-500],[x,100,-465]],'#c9bca3',2);
   }
   if(place==='bedroom'){
    this.solid(g,[100,30,-45],135,45,195,'#a68582');this.box(b,[100,58,-45],139,12,199,'#d9c1b4');this.solid(g,[100,67,-114],88,13,41,'#ddc7bf');this.box(b,[100,115,-151],145,135,4,'#baae93');for(let i=0;i<7;i++)this.ring(b,[37+i*21,153,-146],[11,0,0],[0,16,0],'#d4c1a4',1.6);
    this.solid(g,[-90,27,0],75,6,55,'#896d5e');this.box(b,[-90,14,0],62,27,40,'#b5a28a');this.solid(g,[-90,34,0],22,9,14,'#baada3');for(let i=0;i<5;i++)for(let j=0;j<3;j++)this.box(b,[-98+j*6,40,-5+i*2],3,1,1,'#dbd4c0');
    this.line(b,[[-140,0,-70],[-140,110,-70]],'#c9ad89',2);for(let k=0;k<12;k++){const a=k/12*TAU;this.line(b,[[-140+24*Math.cos(a),105,-70+24*Math.sin(a)],[-140+13*Math.cos(a),143,-70+13*Math.sin(a)]],'#d4b895',1.3);}
   }
   b.end();
  }
  const students=this.ink(this.students);for(let row=0;row<3;row++)for(let col=0;col<6;col++)this.person(students,(col-2.5)*64,100,-250-row*70,(row+col)%2===0,['#a8a29b','#a37f6e','#83949b'][col%3],true);students.end();
  const dancers=this.ink(this.dancers);for(let i=0;i<6;i++){this.person(dancers,(i%3-1)*145,145,-120-Math.floor(i/3)*155,true,i%2?'#a9aeb8':'#cd91b6',false,1);this.line(dancers,[[(i%3-1)*145-20,140,-120-Math.floor(i/3)*155],[(i%3-1)*145-49,184,-120-Math.floor(i/3)*155],[(i%3-1)*145-35,215,-120-Math.floor(i/3)*155]],'#d4b9bd',3);}dancers.end();
 }
 private makeBust(){
  const b=this.ink(this.bust);this.solid(this.bust,[0,8,0],78,16,50,'#987256');this.tube(b,[-26,22,0],[26,22,0],22,22,'#d1ad7f');this.solid(this.bust,[0,38,0],29,40,27,'#a17b57');
  const skull=new THREE.Mesh(new THREE.SphereGeometry(28,18,14),new THREE.MeshBasicMaterial({color:'#b38d62'}));skull.scale.set(1,1.27,.89);skull.position.set(0,76,0);this.bust.add(skull);this.meshes.push(skull);
  for(let j=0;j<10;j++){const q=j/10*Math.PI;this.ring(b,[0,76,0],[29*Math.cos(q),0,25*Math.sin(q)],[0,36,0],'#e0bd8c',.7,.7);}
  for(const x of [-10,10]){this.ring(b,[x,83,23],[7,0,0],[0,3,0],'#634d3b',1.6);this.line(b,[[x-7,91,23],[x,94,25],[x+7,91,23]],'#75553e',2);}
  this.line(b,[[0,91,25],[-4,72,31],[4,72,31]],'#efc797',2);this.line(b,[[-13,64,24],[0,68,27],[13,64,24]],'#70503a',3);this.line(b,[[-10,59,24],[0,57,26],[10,59,24]],'#77543e',1.8);
  for(let k=0;k<85;k++){const q=k*2.4,a=.2+(k%19)/19*1.35,c:P=[30*Math.sin(a)*Math.cos(q),80+36*Math.cos(a),26*Math.sin(a)*Math.sin(q)];this.ring(b,c,[3,1,0],[0,3,2],'#c39c6c',1.6);}
  b.end();const cloth=this.ink(this.cover);for(let i=0;i<24;i++){const q=i/24*TAU;this.line(cloth,[[38*Math.cos(q),0,32*Math.sin(q)],[33*Math.cos(q),70,28*Math.sin(q)],[18*Math.cos(q),120,20*Math.sin(q)]],'#d4c6b4',2);}cloth.end();
 }
 private makeHair(p:Person){const b=p.hair;b.begin();const female=p.id==='hello-lisa';for(let k=0;k<(female?95:110);k++){const q=k*2.4,a=.16+(k%29)/29*1.65,c:P=[-2+11.7*Math.sin(a)*Math.cos(q),16+12.2*Math.cos(a),10.9*Math.sin(a)*Math.sin(q)];this.ring(b,c,[1.9,.8,0],[0,1.7,1.8],female?'#796b66':'#9c8a78',1.15);}if(!female)for(let k=0;k<10;k++)this.line(b,[[12,6,(k-4.5)*.7],[13.5,4.7,(k-4.5)*.75]],'#b09a80',1.2);b.end();}
 private dress(p:Person,pose:ReturnType<typeof helloPose>,place:HelloPlace,active:boolean){
  const b=p.clothes;b.begin();const female=p.id==='hello-lisa',lead=p.id==='lionel',seated=place==='piano'||place==='bedroom'||lead&&place==='classroom'&&pose.t>=50&&pose.t<74||p.id==='hello-lisa'&&place==='studio',robe=place==='bedroom',c=lead?robe?'#d7c8bc':'#d0c4b0':female?'#9faeb1':'#ad8871';
  this.tube(b,[0,-4,0],[0,-57,0],female?18:23,female?15:19,c);for(const side of [-1,1])this.line(b,[[side*20,-13,11],[side*7,-34,15],[side*5,-13,10]],c,1.6);if(lead&&!robe)for(let y=-16;y>-52;y-=7)this.line(b,[[-9,y,14],[9,y,14]],y%2?'#9aa094':'#747e77',2);
  if(female&&!robe){for(let i=-2;i<=2;i++){this.line(b,[[i*6,-8,12],[i*6,-53,12]],'#d0cdd0',.8);this.line(b,[[-17,-13+i*8-18,13],[17,-13+i*8-18,13]],'#bfc8c4',.9);}}
  for(const side of [-1,1]){const stride=place==='corridor'?Math.sin(pose.t*4.6+side*Math.PI/2)*10:0,hip:P=[side*10,-55,0],knee:P=[side*13,seated?-67:-105,seated?30:2+stride],foot:P=[side*14,seated?-110:-155+Math.max(0,stride)*.2,seated?40:7+stride*1.6];this.tube(b,hip,knee,9,6,robe?'#c4b9af':female?'#8a8580':'#6d7476');this.tube(b,knee,foot,6,4,robe?'#c4b9af':'#7f8581');this.line(b,[foot,[foot[0],foot[1],foot[2]+11]],'#b8b7aa',2);
   const phone=pose.phone&&side>0,working=place==='reveal'&&female,atPiano=place==='piano'&&lead;
   const hand:P=phone?[18,7,12]:atPiano?[side*22,-40+Math.sin(pose.t*5+side)*1.8,45]:working?[-40,-22+32*pose.touch,40-25*pose.touch]:[side*(26+(active?pose.hand*12:0)),-62+(active?pose.hand*20:0),15];
   this.tube(b,[side*22,-14,0],[side*29,-35,6],6,4.3,c);this.tube(b,[side*29,-35,6],hand,4.3,2.6,c);for(let k=0;k<5;k++)this.line(b,[[hand[0]+k-2,hand[1],hand[2]],[hand[0]+(k-2)*1.5,hand[1]-6,hand[2]+4]],'#c9b69c',.85);
   if(phone){this.line(b,[[18,14,12],[18,0,13],[19,-8,14]],'#dad0c2',3);for(let i=0;i<22;i++)this.line(b,[[19+Math.sin(i*2)*2,-10-i*2,13],[19+Math.sin((i+1)*2)*2,-12-i*2,13]],'#a99e91',1);}
  }
  if(p.id==='hello-lisa'&&(place==='corridor'||place==='classroom'))this.line(b,[[31,-61,20],[43,-155,47]],'#dfded3',1.5);
  if(lead&&place==='classroom'){this.box(b,[-20,-51,20],21,30,3,'#d4cbb9');this.line(b,[[-30,-65,22],[-30,-35,22]],'#786c61',2);}
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.people.forEach(p=>p.head.resize(w,h));this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,speaker?:CharacterId){
  const pose=helloPose(time),t=pose.t,place=helloPlace(view,t),c=helloCamera(view,this.width/this.height,t),reset=epoch!==this.epoch||this.last!==null&&Math.abs(t-this.last)>.25,dt=this.last===null?0:Math.min(.05,Math.max(0,t-this.last));this.last=t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([k,g])=>g.visible=k===place);
  this.students.visible=place==='classroom'&&t<70;this.dancers.visible=place==='dance';this.dancers.rotation.y=Math.sin(t*.3)*.07;this.dancers.position.y=Math.sin(t*1.5)*3;
  this.bust.visible=place==='reveal';this.bust.position.set(12,44,22);this.bust.rotation.y=-.16;this.cover.visible=false;this.cover.position.set(12+pose.reveal*90,44-pose.reveal*110,22);this.cover.rotation.z=-pose.reveal*.7;
  for(const p of this.people){const lead=p.id==='lionel',lisa=p.id==='hello-lisa',seated=place==='piano'||place==='bedroom'||lead&&place==='classroom'&&t>=50&&t<74||lisa&&place==='studio';p.group.visible=lead||lisa&&(place==='reveal'||place==='studio'||place==='bedroom'||place==='corridor'||place==='classroom')||p.id==='hello-student'&&place==='classroom'&&(t<74||t>=181&&t<204)||p.id==='hello-messenger'&&t>=270.5&&t<278.5;if(view===p.id)p.group.visible=true;
   const x=lead?(place==='reveal'?-85:0):lisa?(place==='reveal'?80-105*pose.touch:100):p.id==='hello-student'?-125:110;p.group.position.set(x,seated?110:155,20);p.group.rotation.set(0,0,lead?pose.sway:Math.sin(t*.32)*.01);p.head.scene.rotation.set(lead?pose.nod:0,-Math.PI/2+(lisa&&place==='reveal'?-.3:lead?pose.turn:.08),0);this.dress(p,pose,place,speaker===p.id);
   if(reset)p.head.resetMotion();const msg=p.track.message(p.track.indexAt(t)),a=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.scene.updateMatrixWorld(true);if(p.group.visible){p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(a),a,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  }
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-pose.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.people.forEach(p=>{p.hair.group.removeFromParent();p.head.dispose();});this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
