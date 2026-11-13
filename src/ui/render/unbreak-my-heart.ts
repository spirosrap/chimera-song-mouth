import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {BonJoviCast as StoryCast} from './bon-jovi-cast.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {unbreakPose,unbreakPlace,unbreakCamera,type UnbreakPlace,type UnbreakPoint as P} from '../../scene/unbreak-my-heart.ts';
const TAU=Math.PI*2,SKIN='#ad7757',DARK_SKIN='#79513d';
/** The entire supplied video on one clock. The stage borrows one physical mouth model. */
export class UnbreakStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,10000);
 readonly head=new Anatomy3D();readonly singer=new THREE.Group();readonly hair=new Beams();readonly detail=new Beams();readonly motion=new Beams();
 readonly orchestraSet=new THREE.Group();readonly cast=new StoryCast();readonly body=new StoryCast();readonly bike=new THREE.Group();readonly helmet=new THREE.Group();readonly water=new THREE.Group();readonly curtains=[new THREE.Group(),new THREE.Group()];
 readonly rooms:Record<UnbreakPlace,THREE.Group>={road:new THREE.Group(),home:new THREE.Group(),pool:new THREE.Group(),mirror:new THREE.Group(),bedroom:new THREE.Group(),stairs:new THREE.Group(),theatre:new THREE.Group()};
 readonly key=new THREE.DirectionalLight('#ffe0b2',2.4);readonly rim=new THREE.DirectionalLight('#9acbd9',1.2);
 private beams:Beams[]=[this.hair,this.detail,this.motion];private meshes:THREE.Mesh[]=[];private gown:THREE.Mesh;private veil:THREE.Mesh;private width=1280;private height=720;private last:number|null=null;private epoch=-1;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#161313');this.scene.fog=new THREE.Fog('#161313',1700,5200);
  Object.values(this.rooms).forEach(g=>this.scene.add(g));this.scene.add(this.singer,this.cast.group,this.key,this.rim,new THREE.AmbientLight('#b9b6b0',1.1),this.motion.group);
  this.key.position.set(-200,340,250);this.rim.position.set(260,220,-180);this.head.centred=true;this.head.attachAccessory(this.hair.group);this.singer.add(this.head.scene,this.body.group,this.detail.group);
  this.buildHome();this.buildRoad();this.buildPool();this.buildMirror();this.buildBedroom();this.buildStairs();this.buildTheatre();
  this.gown=new THREE.Mesh(new THREE.LatheGeometry([[29,4],[33,12],[28,35],[19,62],[15,82],[16,91]].map(([r,y])=>new THREE.Vector2(r,y)),32),new THREE.MeshLambertMaterial({color:'#f2e4c8',side:THREE.DoubleSide}));this.scene.add(this.gown);this.meshes.push(this.gown);
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);b.group.traverse(o=>{const m=(o as THREE.Mesh).material as THREE.Material|undefined;if(m)m.depthTest=true;});this.beams.push(b);return b;}
 private line(b:Beams,p:P[],c:string,w=1,a=.75,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ring(b:Beams,p:P,u:P,v:P,c:string,w=1,a=.75){this.line(b,Array.from({length:32},(_,i)=>p.map((x,k)=>x+u[k]*Math.cos(i/32*TAU)+v[k]*Math.sin(i/32*TAU))as P),c,w,a,true);}
 private solid(g:THREE.Object3D,p:P,w:number,h:number,d:number,c:string,lit=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lit?new THREE.MeshLambertMaterial({color:c}):new THREE.MeshBasicMaterial({color:c}));m.position.set(...p);g.add(m);this.meshes.push(m);return m;}
 private plane(g:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);g.add(m);this.meshes.push(m);return m;}
 private floor(g:THREE.Object3D,c:string){const m=this.plane(g,2200,2100,c,[0,-2,-470]);m.rotation.x=-Math.PI/2;}
 private wall(g:THREE.Object3D,c:string){this.floor(g,'#655144');this.solid(g,[0,210,-390],1100,460,20,c);for(const x of [-480,480])this.solid(g,[x,200,-100],20,400,600,c);}
 private window(g:THREE.Object3D,x:number,z:number,w=140,h=260){const b=this.ink(g);this.solid(g,[x,180,z],w+16,h+16,12,'#c5b69a');this.plane(g,w,h,'#97b2a3',[x,180,z+8]);for(const a of [-.5,0,.5])this.solid(g,[x+a*w,180,z+12],4,h+8,3,'#d8d4bd');this.solid(g,[x,180,z+12],w,4,3,'#d8d4bd');for(let i=0;i<9;i++)this.line(b,[[x-w/2+i*w/8,50,z+14],[x-w/2+i*w/8,310,z+14]],'#a6b9a6',.6,.2);b.end();}
 private buildHome(){const g=this.rooms.home;this.wall(g,'#a18868');this.window(g,-165,-372,180);this.window(g,165,-372,180);
  this.solid(g,[-80,30,-25],220,45,100,'#79563e');this.solid(g,[-80,68,-65],220,44,24,'#8e7155');for(const x of [-180,20])this.solid(g,[x,60,-25],22,56,100,'#886c50');
  this.solid(g,[140,39,30],142,8,95,'#9d7953');for(const x of [83,197])for(const z of [-8,68])this.solid(g,[x,19,z],7,38,7,'#76563c');
  for(const x of [-320,315]){this.solid(g,[x,85,-120],6,170,6,'#a28d68');const shade=new THREE.Mesh(new THREE.CylinderGeometry(22,35,42,24),new THREE.MeshLambertMaterial({color:'#c8b692'}));shade.position.set(x,185,-120);g.add(shade);this.meshes.push(shade);}
  for(let i=0;i<5;i++){const x=-300+i*150;this.solid(g,[x,237,-370],58,77,5,'#564735');this.plane(g,48,65,i%2?'#897652':'#777866',[x,237,-366]);}
  const b=this.ink(g);for(let i=0;i<12;i++)this.line(b,[[-460+i*85,0,250],[-460+i*85,0,-380]],'#b49a72',1,.23);b.end();
 }
 private buildRoad(){const g=this.rooms.road;this.floor(g,'#806f54');this.plane(g,2600,1200,'#c0c7b9',[0,480,-1300]);const road=this.plane(g,1400,500,'#6d706b',[0,0,-25]);road.rotation.x=-Math.PI/2;const b=this.ink(g);
  for(let i=0;i<13;i++)this.line(b,[[-690+i*115,1,-40],[-630+i*115,1,-40]],'#d2cbaa',2,.7);
  for(const side of [-1,1]){this.solid(g,[side*390,100,-380],250,200,170,'#c2b79a');this.solid(g,[side*390,205,-380],290,16,200,'#b49e7d');}
  this.solid(g,[-250,39,-120],205,62,95,'#c7bf91');this.solid(g,[-255,83,-120],104,40,85,'#9fa49b');for(const x of [-320,-183])this.ring(b,[x,25,-69],[24,0,0],[0,24,0],'#333a37',2);
  g.add(this.bike,this.helmet);const shell=new THREE.Mesh(new THREE.SphereGeometry(12,24,16),new THREE.MeshLambertMaterial({color:'#dfded2'}));this.helmet.add(shell);this.meshes.push(shell);const visor=this.solid(this.helmet,[0,1,10],18,9,5,'#303a3f');visor.rotation.x=.12;for(const x of [-50,50]){this.ring(b,[x,27,40],[27,0,0],[0,27,0],'#373b39',2);}
  const m=this.ink(this.bike);for(const x of [-50,50]){this.ring(m,[x,27,0],[26,0,0],[0,26,0],'#272c2c',2);this.ring(m,[x,27,0],[18,0,0],[0,18,0],'#b4b6ad',1.2);}this.line(m,[[-50,27,0],[-15,65,0],[20,40,0],[50,27,0],[32,86,0],[50,85,10]],'#b0b4ae',2);this.solid(this.bike,[-5,58,0],65,20,30,'#3a3b3a');this.solid(this.bike,[-17,74,0],46,8,29,'#242a2b');m.end();b.end();
 }
 private buildPool(){const g=this.rooms.pool;this.floor(g,'#bbb8a0');this.plane(g,1300,600,'#2b6a82',[0,230,-700]);const water=this.plane(this.water,660,380,'#2a7899',[0,35,-50]);water.rotation.x=-Math.PI/2;const material=water.material as THREE.MeshBasicMaterial;material.transparent=true;material.opacity=.35;material.depthWrite=false;g.add(this.water);this.water.position.y=55;this.solid(g,[-345,27,-50],22,56,420,'#d4cdb7');this.solid(g,[345,27,-50],22,56,420,'#d4cdb7');this.solid(g,[0,27,-250],710,56,22,'#d4cdb7');
  const b=this.ink(g);for(let i=0;i<20;i++)this.line(b,[[-330+i*35,56,-250],[-330+i*35,56,160]],'#657e7c',.85,.3);for(let i=0;i<8;i++)this.line(b,[[-350,56,-250+i*57],[350,56,-250+i*57]],'#657e7c',.85,.3);b.end();
 }
 private buildMirror(){const g=this.rooms.mirror;this.wall(g,'#c7b596');this.solid(g,[0,90,-130],280,15,90,'#b5a285');this.solid(g,[0,45,-155],240,90,60,'#87775f');const b=this.ink(g);this.ring(b,[0,210,-360],[135,0,0],[0,140,0],'#b9aa82',3);const mirror=new THREE.Mesh(new THREE.CircleGeometry(130,64),new THREE.MeshBasicMaterial({color:'#72908d'}));mirror.position.set(0,210,-361);g.add(mirror);this.meshes.push(mirror);for(const x of [-65,65])this.ring(b,[x,103,-105],[29,0,0],[0,0,22],'#d7d5bf',2);this.solid(g,[-88,108,-95],15,22,15,'#b9c7bd');b.end();
 }
 private buildBedroom(){const g=this.rooms.bedroom;this.wall(g,'#7e6964');this.window(g,-210,-370);this.window(g,210,-370);this.solid(g,[0,31,-5],280,52,220,'#635753');this.solid(g,[0,64,-5],286,15,224,'#9b9c8d');this.solid(g,[0,67,35],280,16,140,'#666f6c');for(const side of [-1,1])this.solid(g,[side*70,82,-67],100,18,42,'#c9beaa');this.solid(g,[0,92,-121],295,145,15,'#8b7462');
  const b=this.ink(g);for(let i=0;i<23;i++)this.line(b,[[-135+i*12,78,-35],[-135+i*12,79,105]],'#a6a79a',.85,.45);b.end();
 }
 private buildStairs(){const g=this.rooms.stairs;this.wall(g,'#556971');for(let i=0;i<12;i++){this.solid(g,[70,9+i*18,-150-i*33],320,18,35,'#738286');this.solid(g,[-100,115+i*18,-150-i*33],8,12,34,'#a3aaa1');}const b=this.ink(g);this.line(b,[[-100,115,-120],[-100,325,-520]],'#d4ccc1',2);for(let i=0;i<9;i++)this.line(b,[[-100,24+i*24,-145-i*42],[-100,113+i*24,-145-i*42]],'#a6aaa3',1.5);b.end();this.solid(g,[-285,190,-100],90,380,7,'#444b4e');
 }
 private buildTheatre(){const g=this.rooms.theatre,band=this.orchestraSet;g.add(band);this.floor(g,'#101820');this.plane(g,1600,700,'#101c27',[0,300,-900]);this.solid(g,[0,14,-125],1080,28,600,'#24313b');this.solid(g,[0,29,50],170,16,150,'#3a4851');
  for(const side of [-1,1]){this.solid(g,[side*510,275,-180],65,550,190,'#a1814f');for(let k=0;k<10;k++)this.solid(g,[side*510-27+k*6,275,-80],2,530,5,'#c1a476');}
  for(let i=0;i<18;i++){const x=-650+i*76;this.solid(g,[x,568,-180],72,26+(i%2)*14,160,'#9b7645');}
  for(const [i,c]of this.curtains.entries()){g.add(c);for(let k=0;k<30;k++){const x=(i?1:-1)*(k*18+14);this.solid(c,[x,270,0],22,540,16,k%2?'#5e222c':'#7b303a');}}
  const trim=this.ink(g);for(let i=0;i<15;i++){const x=-490+i*70;this.ring(trim,[x,560,-68],[34,0,0],[0,17,0],'#d6b575',1.6);this.ring(trim,[x,542,-67],[23,0,0],[0,23,0],'#b89558',1.2);for(let k=0;k<6;k++){const q=k/6*TAU;this.line(trim,[[x,551,-66],[x+Math.cos(q)*17,551+Math.sin(q)*12,-66]],'#ddc18b',1,.6);}}trim.end();
  const b=this.ink(band);for(let row=0;row<3;row++)for(let i=0;i<8;i++){const x=(i-3.5)*95,z=-140-row*108;this.solid(band,[x,37,z],44,8,40,'#3e3e3d');this.solid(band,[x,65,z-18],44,55,9,'#464440');this.solid(band,[x-18,98,z+37],38,45,4,'#b6b6a7');this.line(b,[[x,0,z+40],[x,84,z+40]],'#79858a',1.4);for(let k=0;k<4;k++)this.line(b,[[x-32,119-k*8,z+41],[x-3,119-k*8,z+41]],'#4b5356',.6,.65);}
  for(let row=0;row<3;row++)for(let i=0;i<12;i++)this.solid(band,[(i-5.5)*62,22,350+row*70],48,43,45,'#413337');b.end();
 }
 private dress(p:ReturnType<typeof unbreakPose>,gown:boolean,seated:boolean){
  this.body.begin();this.body.person(0,seated?18:0,0,gown?'#e6dbc1':'#252b2d',{female:true,skirt:false,skin:SKIN,hairColor:'#4f3022',pose:seated?'sit':'ballad',trousers:'#252b2d',gesture:gown?.2+p.open*(.25+.35*(.5+.5*Math.sin(p.t*.27))):.12,phase:0},p.t);this.body.end();this.body.figures[0].head.visible=false;
  const h=this.hair;h.begin();for(let i=0;i<70;i++){const a=i/70*TAU,front=Math.cos(a)>.4;this.line(h,Array.from({length:28},(_,j)=>{const u=j/27,q=.12+u*(front?1.05:2.35),tail=Math.max(0,u-.55)/.45,curl=Math.sin(u*27+i*1.6)*.65;return[(10.8*Math.sin(q)+curl)*Math.cos(a)-1.8,17.5+11*Math.cos(q)-tail*(gown?5:15)+(Math.sin(a)*.8),(9.5*Math.sin(q)+curl)*Math.sin(a)+Math.cos(u*27+i)*.65]as P;}),i%4===0?'#b08b5c':i%3===0?'#72503a':'#916747',.85,.8);}h.end();
  const b=this.detail;b.begin();for(const side of [-1,1]){this.ring(b,[side*8,10,1],[1,0,0],[0,1.2,0],'#e5c887',1.1);this.line(b,[[side*12,-14,9],[side*5,-22,14],[0,-25,15]],gown?'#e2ddce':'#baa47c',1.1);}if(gown)this.line(b,[[-13,-9,9],[0,-20,15],[13,-9,9]],'#fff2d0',1.6);b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=unbreakPose(t),place=unbreakPlace(view,t),c=unbreakCamera(view,this.width/this.height,t),dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();this.last=t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([id,g])=>g.visible=id===place);
  const colors:Record<UnbreakPlace,string>={road:'#b8bea9',home:'#554335',pool:'#255c78',mirror:'#796d57',bedroom:'#3a3736',stairs:'#2e444e',theatre:'#09131d'},bg=new THREE.Color(colors[place]);this.scene.background=bg;(this.scene.fog as THREE.Fog).color.copy(bg);this.key.color.set(place==='theatre'?'#d6ecf0':place==='pool'?'#8abfd6':'#ffe0b2');
  const show=p.curtain<.65&&(view==='toni'||place==='theatre'||place==='stairs'||place==='home'&&t>=18&&t<34||place==='home'&&t>=49&&t<62);this.singer.visible=show;const seated=place==='stairs'||place==='home'&&t<34;this.singer.position.set(0,seated?110:140,place==='home'?15:35);this.singer.rotation.set(0,Math.sin(t*.19)*.05,p.sway);this.head.scene.rotation.set(-p.open*.045,-Math.PI/2+Math.sin(t*.21)*.08,Math.sin(t*.31)*.025);this.dress(p,p.gown,seated);this.gown.visible=show&&p.gown;this.gown.position.set(0,0,35);this.gown.rotation.z=p.sway*.3;
  this.bike.position.set(0,0,-30);this.bike.rotation.set(0,.14,-p.crash*.9);this.helmet.position.set(p.crash>.8?130:-25,p.crash>.8?13:163,p.crash>.8?55:-20);
  this.cast.begin();const skin=SKIN,man={skin:DARK_SKIN,bald:true},woman={skin,hairColor:'#4b2b1c',female:true};
  if(place==='road'){this.cast.person(90-p.crash*10,p.crash>.95?120:145,60,'#e1dcca',{...woman,skirt:false,pose:p.crash>.95?'sit':'walk',yaw:p.crash>.95?0:-.6},t);const partner=this.cast.person(-25,152,-20,'#323a3b',{...man,pose:t<3?'stand':'sit',yaw:.5},t);if(p.crash>.95){partner.position.set(-55,22,85);partner.rotation.set(0,0,-Math.PI/2);}else partner.rotation.z=-p.crash*.4;this.helmet.position.set(p.crash>.8?130:-25,p.crash>.8?13:163,p.crash>.8?55:-20);}
  if(place==='home'&&!show){this.cast.person(-90,140,5,'#262f31',{...woman,pose:p.embrace>.1?'embrace':'sit',yaw:1},t);this.cast.person(-30,148,-4,'#283033',{...man,pose:p.embrace>.1?'embrace':'sit',yaw:-1},t);}
  if(place==='pool'){const a=this.cast.person(-50,100,-10,SKIN,{...woman,pose:'embrace',yaw:1},t),b=this.cast.person(30,105,-20,DARK_SKIN,{...man,pose:'embrace',yaw:-1},t);a.rotation.z=p.swim*.05;b.rotation.z=-p.swim*.05;this.water.position.y=55+Math.sin(t*1.4)*.8;}
  if(place==='mirror'){this.cast.person(25,145,20,'#34444a',{...man,pose:'sit'},t);this.cast.person(-55,145,0,'#3a4c51',{...woman,pose:'paint',yaw:.9},t);const b=this.motion;b.begin();const hand=this.cast.figures[1].hands[1];this.cast.figures[1].root.updateMatrixWorld(true);const point=hand.getWorldPosition(new THREE.Vector3());this.ring(b,[25,127,30],[9,0,0],[0,5,0],'#e9e9d9',3);this.line(b,[point.toArray()as P,[20,126,34]],'#c4c4bb',2);b.end();}
  if(place==='bedroom'){this.cast.person(-35,145,0,'#4b5660',{...woman,pose:'embrace',yaw:1.1},t);this.cast.person(25,148,-4,'#34444b',{...man,pose:'embrace',yaw:-1.1},t);}
  if(place==='theatre'){for(let row=0;row<3;row++)for(let i=0;i<8;i++){const x=(i-3.5)*95;if(Math.abs(x)<60&&row===0)continue;this.cast.person(x,135,-140-row*108,'#252c34',{skin:i%3?SKIN:'#c3a186',female:i%4===0,bald:i%5===0,pose:'violin',trousers:'#252b32',gesture:.2,phase:i+row*8},t);}for(let i=0;i<12;i++)this.cast.person((i-5.5)*62,100,380,'#272b31',{skin:i%2?SKIN:'#b08e73',pose:'sit',yaw:Math.PI,phase:i},t);}
  this.cast.end();this.cast.group.visible=view!=='toni'||place!=='theatre';this.orchestraSet.visible=view!=='toni';const b=this.motion;if(place!=='mirror'){b.begin();if(place==='pool')for(let i=0;i<18;i++){const z=-230+i*22;this.line(b,Array.from({length:20},(_,j)=>[-320+j*34,91+Math.sin(j*.6+t*1.6+i)*1.5,z+Math.sin(t+i)*4]as P),'#a3d0d6',1.1,.35);}if(place==='theatre'&&p.curtain<.65){
   for(let i=0;i<10;i++){const x=-480+i*106,aim=Math.sin(t*.18+i)*100;this.line(b,[[x,410,-400],[x*.3+aim,10,60]],i%3?'#9bd6e0':'#e0c292',2,.18);for(let k=0;k<4;k++)this.line(b,[[x+(k-2)*6,410,-400],[x*.3+aim+(k-2)*48,10,60]],'#8dc5d8',1.2,.065);}
   if(view!=='toni')for(let row=0;row<3;row++)for(let i=0;i<8;i++){const x=(i-3.5)*95,z=-140-row*108;if(Math.abs(x)<60&&row===0)continue;const stroke=Math.sin(t*2.2+i+row)*12;this.ring(b,[x+12,115,z+16],[7,0,0],[0,11,0],'#a8814f',1.5);this.line(b,[[x-12,115+stroke,z+22],[x+37,111+stroke,z+24]],'#c2ac7d',1.3);}
  }b.end();}
  this.curtains.forEach((g,i)=>g.position.set((i?1:-1)*(530-p.curtain*530),0,205));this.scene.updateMatrixWorld(true);
  if(show){const msg=this.track.message(this.track.indexAt(t)),a=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(a),a,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.cast.dispose();this.body.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
