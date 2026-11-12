import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {hengePose,hengePlace,hengeCamera,type HengePoint as P,type HengePlace} from '../../scene/stonehenge.ts';
const TAU=Math.PI*2,shirt='#d9e1e5',dark='#64768c',skin='#9ebdd0';
/** An earnest physical singer, domestic distractions, and an excessively dramatic stone circle. */
export class StonehengeStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,7000);
 readonly head=new Anatomy3D();readonly singer=new THREE.Group();readonly companion=new THREE.Group();
 readonly rooms:Record<HengePlace,THREE.Group>={studio:new THREE.Group(),night:new THREE.Group(),kitchen:new THREE.Group(),bedroom:new THREE.Group(),car:new THREE.Group(),road:new THREE.Group(),stones:new THREE.Group(),sunset:new THREE.Group()};
 readonly hair=new Beams();readonly clothes=new Beams();readonly limbs=new Beams();readonly wife=new Beams();readonly atmosphere=new Beams();
 private beams=[this.hair,this.clothes,this.limbs,this.wife,this.atmosphere];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#080d18');this.scene.fog=new THREE.Fog('#080d18',1200,3500);
  Object.values(this.rooms).forEach(g=>this.scene.add(g));this.scene.add(this.singer,this.companion,this.atmosphere.group);
  this.head.centred=true;this.head.attachAccessory(this.hair.group);this.singer.add(this.head.scene,this.clothes.group,this.limbs.group);this.companion.add(this.wife.group);
  for(const b of this.beams){b.begin();b.end();}this.buildHair();this.buildCompanion();this.buildStudio();this.buildKitchen();this.buildBedroom();this.buildCar(this.rooms.car);this.buildCar(this.rooms.night,true);this.buildRoad();this.buildStones(this.rooms.stones,false);this.buildStones(this.rooms.sunset,true);
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;m.opacity=0;this.veil.renderOrder=1000;
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,p:P[],c:string,w=1,a=.85,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.85){this.line(b,Array.from({length:26},(_,i)=>{const q=i/26*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q)) as P;}),col,w,a,true);}
 private box(b:Beams,p:P,w:number,h:number,d:number,c:string){for(const z of [-d/2,d/2])this.line(b,[[-w/2,-h/2,z],[w/2,-h/2,z],[w/2,h/2,z],[-w/2,h/2,z]].map(v=>v.map((x,k)=>x+p[k]) as P),c,1,.85,true);for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])this.line(b,[[p[0]+x,p[1]+y,p[2]-d/2],[p[0]+x,p[1]+y,p[2]+d/2]],c);}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private floor(parent:THREE.Object3D,w:number,d:number,c:string,z=0){const m=this.plane(parent,w,d,c,[0,-1,z]);m.geometry.dispose();m.geometry=new THREE.PlaneGeometry(w,d,16,16);m.rotation.x=-Math.PI/2;}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const point=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),c,.85,.85,true);for(let i=0;i<9;i++)this.line(b,[point(0,i/9*TAU),point(1,i/9*TAU)],c,.85,.85);
 }
 private person(b:Beams,x:number,y:number,z:number,c:string){for(let i=0;i<4;i++){const a=i/4*Math.PI;this.ring(b,[x,y+18,z],[10*Math.cos(a),0,10*Math.sin(a)],[0,14,0],skin);}
  this.tube(b,[x,y,z],[x,y-45,z],20,15,c);for(const side of [-1,1]){this.line(b,[[x+side*20,y-5,z],[x+side*26,y-31,z+6],[x+side*13,y-44,z+12]],c,1.4);this.line(b,[[x+side*9,y-45,z],[x+side*13,y-70,z+30],[x+side*14,y-103,z+28]],c,1.4);}}
 private buildHair(){const b=this.hair;b.begin();for(let i=0;i<62;i++){const a=i/62*TAU,end=Math.cos(a)>.4?.9:Math.cos(a)>-.1?1.5:2.1;const points=Array.from({length:17},(_,j)=>{const f=j/16,q=.08+f*end,curl=Math.sin(f*TAU*3+i)*.65;return [-2+(9.4*Math.sin(q)+curl)*Math.cos(a),16+9*Math.cos(q)+Math.cos(f*TAU*3+i)*.5,(8.7*Math.sin(q)+curl)*Math.sin(a)] as P;});this.line(b,points,i%3?'#475463':'#83909c',.85,.85);}b.end();}
 private buildCompanion(){const b=this.wife;b.begin();this.person(b,0,135,0,'#b99fa7');for(let i=0;i<38;i++){const a=i/38*TAU;this.line(b,[[Math.cos(a)*8,167,Math.sin(a)*9],[Math.cos(a)*13,152,Math.sin(a)*12],[Math.cos(a)*16,127,Math.sin(a)*13]],'#c8a971',1,.85);}b.end();}
 private buildStudio(){const g=this.rooms.studio,b=this.ink(g);this.floor(g,730,560,'#29121a');this.plane(g,700,320,'#311e24',[0,160,-205]);
  this.box(b,[0,62,-25],170,124,90,'#ab815e');this.box(b,[-180,32,-32],180,58,85,'#8c9695');this.box(b,[-180,85,-65],180,55,22,'#8c9695');
  this.person(b,-160,113,-25,'#aeb7c5');this.person(b,0,139,-68,'#7b8799');this.box(b,[135,45,40],70,8,65,'#7a8494');
  this.box(b,[20,221,-195],410,133,7,'#ba9877');for(let i=0;i<24;i++){const x=-175+i*16,h=25+(i*29)%65;this.box(b,[x,165+h/2,-188],10,h,2,'#7692b5');}
  for(const x of [-290,290]){this.line(b,[[x,0,-130],[x,170,-130]],'#bc9d78',1.6);this.line(b,[[x-30,170,-130],[x-19,215,-130],[x+19,215,-130],[x+30,170,-130]],'#edca92',1.3,.95,true);}
  // Visible production camera and seated studio audience.
  this.box(b,[-245,119,155],50,31,35,'#899eaf');this.tube(b,[-245,119,137],[-245,119,115],12,12,'#afc4d3');for(const dx of [-30,0,30])this.line(b,[[-245,104,155],[-245+dx,0,177+dx*.3]],'#7b91a7',1.6);
  for(let row=0;row<2;row++)for(let i=0;i<11;i++)this.person(b,(i-5)*49,69,260+row*55,i%2?'#667d94':'#8f7083');b.end();}
 private buildKitchen(){const g=this.rooms.kitchen,b=this.ink(g);this.floor(g,620,540,'#191d1e');this.plane(g,580,300,'#242825',[0,150,-190]);
  for(let i=0;i<6;i++){const x=-225+i*90;this.box(b,[x,44,-145],86,88,80,'#8b9692');this.line(b,[[x+25,48,-102],[x+25,67,-102]],'#d1d8ca',1.3);this.box(b,[x,227,-166],86,96,42,'#9ba59c');}
  this.box(b,[130,140,-139],84,278,85,'#a1aab2');for(const y of [90,178]){this.box(b,[130,y,-94],68,62,8,'#b4b7ba');this.line(b,[[105,y+17,-88],[155,y+17,-88]],'#cad2d5',1.4);}
  this.box(b,[-45,88,-53],255,12,115,'#d1c9ab');for(const x of [-104,-55])for(const z of [-73,-30])this.ring(b,[x,96,z],[16,0,0],[0,0,16],'#778fa4');
  this.ring(b,[-55,102,-30],[25,0,0],[0,0,25],'#abb7be',1.4);this.line(b,[[-29,102,-30],[9,102,-30]],'#c2ccd0',2);this.box(b,[47,99,-48],36,8,30,'#c4a67e');b.end();}
 private buildBedroom(){const g=this.rooms.bedroom,b=this.ink(g);this.floor(g,580,520,'#101a25');this.plane(g,540,285,'#1a2735',[0,142,-160]);this.box(b,[0,30,0],215,46,235,'#7d8e9e');this.box(b,[0,78,-115],225,100,16,'#78909f');
  for(const x of [-55,55])this.box(b,[x,62,-74],80,20,43,'#c2d0d4');for(let i=0;i<20;i++)this.line(b,[[-103+i*11,50,118],[-103+i*11,65,25],[-103+i*11,63,-45]],'#a6bbc9');
  for(const x of [-155,155]){this.box(b,[x,33,-70],58,66,55,'#8a929f');this.line(b,[[x,67,-70],[x,112,-70]],'#b4b2a1',1.4);this.line(b,[[x-22,107,-70],[x-13,139,-70],[x+13,139,-70],[x+22,107,-70]],'#dbd0af',1.3,.9,true);}b.end();}
 private buildCar(g:THREE.Group,exterior=false){const b=this.ink(g);if(exterior){this.floor(g,1100,1300,'#070c17');this.box(b,[0,52,-110],190,78,270,'#8e9fb3');this.box(b,[0,109,-150],154,65,130,'#75859b');
   this.line(b,[[-77,136,-85],[-93,88,21],[93,88,21],[77,136,-85]],'#b8c8d5',1.5,.9,true);for(const x of [-71,71]){this.ring(b,[x,61,27],[20,0,0],[0,11,0],'#eef6ff',2,.95);for(let i=0;i<8;i++)this.line(b,[[x-16+i*4,53,29],[x-16+i*4,69,29]],'#e8f4ff',1,.95);}
   this.box(b,[0,52,30],64,17,3,'#bdcad4');for(const x of [-97,97])for(const z of [-207,-10])this.ring(b,[x,28,z],[0,0,27],[0,27,0],'#8ea2b7',1.5);
  }else{this.box(b,[0,137,-43],220,86,145,'#7c8c9f');for(const x of [-65,65]){this.box(b,[x,54,15],66,88,45,'#abb4b8');this.box(b,[x,114,5],48,30,24,'#aeb9c4');}this.box(b,[0,65,100],213,22,35,'#a0afbd');this.ring(b,[59,89,88],[26,0,0],[0,21,0],'#becbd4',1.8);this.line(b,[[-115,180,90],[115,180,90]],'#c1cbd4',1.6);}
  b.end();}
 private buildRoad(){const g=this.rooms.road,b=this.ink(g);this.floor(g,1500,1800,'#23332d',-400);this.plane(g,1800,800,'#344851',[0,400,-1100]);
  for(const side of [-1,1])this.line(b,[[side*100,1,450],[side*22,1,-850]],'#899a99',1.3);for(let i=0;i<12;i++)this.line(b,[[0,2,390-i*95],[0,2,350-i*95]],'#c1c7ac',1.4);
  this.box(b,[200,67,-140],170,132,90,'#c4d1cc');this.box(b,[205,95,-91],76,47,4,'#91a9ba');for(const x of [150,250])this.ring(b,[x,17,-100],[17,0,0],[0,17,0],'#7b8e98',1.5);for(let i=0;i<30;i++){const x=300+(i*79)%400,z=-200-(i*89)%650;this.line(b,[[x,0,z],[x-10,55,z],[x+12,105,z]],'#557b68',1.5);}b.end();}
 private rock(parent:THREE.Group,b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,seed:number){
  const pts:P[]=Array.from({length:8},(_,i)=>[x+(i&1?1:-1)*w/2+Math.sin(seed+i*3)*w*.08,y+(i&2?1:-1)*h/2+Math.sin(seed+i*2)*h*.035,z+(i&4?1:-1)*d/2+Math.cos(seed+i)*d*.1]);
  const faces=[0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(faces.flatMap(i=>pts[i]),3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:seed%2?'#394748':'#424f4d',side:THREE.DoubleSide}));parent.add(m);this.meshes.push(m);
  for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))this.line(b,[pts[i],pts[i|bit]],'#a5aaa0',1.25,.85);
  for(let j=0;j<4;j++)this.line(b,[[x-w*.4+j*w*.25,y-h*.48,z+d*.52],[x-w*.3+j*w*.23,y-h*.04,z+d*.53],[x-w*.35+j*w*.24,y+h*.42,z+d*.51]],'#73867e',.85,.65);
 }
 private buildStones(g:THREE.Group,sunset:boolean){const b=this.ink(g);this.floor(g,2600,2400,sunset?'#192a2b':'#2b3c32',-500);this.plane(g,3000,1100,sunset?'#704d48':'#4c6473',[0,500,-1500]);
  // An incomplete sarsen ring and inner trilithons, with rough, opaque stone faces.
  for(let i=0;i<18;i++){const a=i/18*TAU,x=Math.sin(a)*260,z=-330+Math.cos(a)*155;if(i===1||i===2||i===3||i===16)continue;const h=140+(i%4)*12;this.rock(g,b,x,h/2,z,42,h,42,i+4);if(i%3!==0)this.rock(g,b,x+Math.cos(a)*25,h+13,z-Math.sin(a)*19,92,25,47,i+41);}
  for(const x of [-115,25,150]){this.rock(g,b,x-35,109,-325,45,218,47,x+200);this.rock(g,b,x+35,109,-325,45,218,47,x+202);this.rock(g,b,x,231,-325,121,30,53,x+206);}
  for(let i=0;i<6;i++)this.rock(g,b,-220+i*87,12,-140+(i%2)*40,70,24,38,i+70);
  for(let i=0;i<100;i++){const x=((i*197)%1800)-900,z=((i*163)%1600)-900;this.line(b,[[x,0,z],[x+2,5+(i%3)*3,z]],'#5e7968',.85,.5);}
  for(const side of [-1,1])for(let i=0;i<15;i++){const x=side*(320+i*65);this.line(b,[[x,0,-20],[x,44,-20]],'#7b8977');if(i)this.line(b,[[x,31,-20],[x-side*65,31,-20]],'#8b9785');}
  b.end();if(sunset){const sun=new THREE.Mesh(new THREE.CircleGeometry(31,40),new THREE.MeshBasicMaterial({color:'#ffc78b'}));sun.position.set(460,132,-1400);g.add(sun);this.meshes.push(sun);}}
 private body(p:ReturnType<typeof hengePose>,place:HengePlace,energy:number){
  const b=this.clothes;b.begin();const c=place==='studio'?'#839294':place==='bedroom'?'#a54e60':shirt,levels=[[-3,6,5],[-16,23,11],[-42,20,10],[-68,18,10]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],c);for(let i=0;i<22;i++){const q=i/22*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),c,.85);}
  for(const side of [-1,1])this.line(b,[[side*6,-2,5],[side*12,-12,11],[0,-24,12]],shirt,1.3);for(let y=-29;y>-65;y-=9)this.ring(b,[0,y,11],[1.1,0,0],[0,1.1,0],dark,.85);
  if(place==='studio')this.line(b,[[0,-13,12],[-4,-21,13],[0,-52,13],[4,-21,13],[0,-13,12]],dark,1.5);if(place==='car')for(const side of [-1,1])this.line(b,[[side*7,0,7],[side*15,-28,14],[side*14,-62,14]],'#d0bb98',3,.9);b.end();
  const l=this.limbs;l.begin();for(const side of [-1,1]){
   const run=Math.sin(p.t*13+side)*p.run;const knee:P=[side*12,-103+(p.seated?25:0),p.seated?40:run*22],ankle:P=[side*(15+6*p.open),-147+(p.seated?28:0)+Math.max(0,run)*20,p.seated?40:run*8];this.tube(l,[side*10,-65,0],knee,9,6,dark);this.tube(l,knee,ankle,6,4.5,dark);this.tube(l,ankle,[ankle[0],ankle[1],ankle[2]+16],5,4,'#a7b1bb');
   let hand:P=[side*(28+48*p.open),-56+62*p.open,16+energy*6];if(p.point>.01&&side<0)hand=[-48,-16+76*p.point,18];if(p.forehead>.1&&side>0)hand=[15,11,15];if(p.cook>.1)hand=[side*20,-48,35];if(p.read>.1)hand=[side*14,-30,32];if(p.run>.1)hand=[side*25,-30+run*25,25];if(p.seated&&!p.read)hand=[side*19,-62,32];
   const elbow:P=[side*(29+26*p.open),-34+30*p.open,7];this.tube(l,[side*23,-16,0],elbow,6,4.5,c);this.tube(l,elbow,hand,4.5,2.4,c);for(let i=0;i<5;i++)this.line(l,[[hand[0]+side*(i-2),hand[1],hand[2]],[hand[0]+side*(i-2)*1.8,hand[1]+8-i*.5,hand[2]+1]],skin,1.15);
  }if(p.read>.1){if(place==='bedroom')this.box(l,[0,-26,36],30,25,12,'#c0b7a0');else this.box(l,[0,-25,36],31,15,1,'#ded5b7');}l.end();}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=hengePose(t),place=hengePlace(view,t),c=hengeCamera(view,this.width/this.height,t);
  if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([key,g])=>g.visible=key===place);
  const outdoor=place==='stones'||place==='road'||place==='sunset';const bg=new THREE.Color(place==='sunset'?'#493e46':outdoor?'#344c5d':place==='studio'?'#170d17':'#080d18');this.scene.background=bg;(this.scene.fog as THREE.Fog).color.copy(bg);
  this.singer.visible=place!=='sunset'&&view!=='henge-monument';const position=place===p.place?p.position:place==='car'?[0,108,32]:place==='bedroom'?[20,105,30]:place==='studio'?[135,111,55]:[0,150,80];this.singer.position.set(...position as P);this.singer.rotation.set(p.lying&&place==='bedroom'?-Math.PI/2:0,p.run?-.3:Math.sin(t*.33)*.035,-p.open*.06);
  this.head.scene.rotation.set(-p.open*.12,-Math.PI/2+Math.sin(t*.47)*.08,p.forehead*.1);
  const message=this.track.message(this.track.indexAt(t)),energy=Math.min(1,message.t.outRms*5);this.body(p,place,energy);
  this.companion.visible=place==='kitchen'||place==='bedroom';this.companion.position.set(place==='kitchen'?65-p.embrace*28:55,place==='bedroom'?60:0,place==='kitchen'?-4:70);this.companion.rotation.set(place==='bedroom'?-Math.PI/2:0,place==='bedroom'?0:-.25,place==='bedroom'?0:Math.sin(t*.7)*.025);
  this.atmosphere.begin();if(place==='night'||place==='sunset')for(let i=0;i<35;i++){const x=((i*83+t*12)%1100)-550,y=8+(i%7)*8,z=-350+(i%9)*67;this.line(this.atmosphere,[[x-65,y,z],[x,y+Math.sin(t+i)*4,z],[x+65,y,z]],'#8299b3',1,.13);}this.atmosphere.end();
  this.scene.updateMatrixWorld(true);if(this.singer.visible){this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();const artic=VoiceModel.articFromArray(message.t.artic),tele=playing?message:null;this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
