import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {airPose,airPlace,airCamera,type AirPoint as P,type AirPlace} from '../../scene/making-love.ts';
const TAU=Math.PI*2;
/** Two recorded airways, two borrowed heads, and the complete romantic video montage. */
export class AirSupplyStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,8000);
 readonly head=new Anatomy3D();readonly guitarHead=new Anatomy3D();readonly singer=new THREE.Group();readonly guitarist=new THREE.Group();
 readonly car=new THREE.Group();readonly carDoor=new THREE.Group();readonly couple=new THREE.Group();readonly silhouettes=new THREE.Group();
 readonly rooms:Record<AirPlace,THREE.Group>={stage:new THREE.Group(),street:new THREE.Group(),meadow:new THREE.Group(),car:new THREE.Group(),gas:new THREE.Group(),diner:new THREE.Group(),silhouette:new THREE.Group()};
 readonly hair=new Beams();readonly guitarHair=new Beams();readonly clothes=new Beams();readonly guitarClothes=new Beams();readonly guitar=new Beams();readonly story=new Beams();readonly lights=new Beams();
 private beams=[this.hair,this.guitarHair,this.clothes,this.guitarClothes,this.guitar,this.story,this.lights];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 readonly model:VoiceModel;readonly track:TeleTrack;readonly supportModel:VoiceModel;readonly supportTrack:TeleTrack;
 constructor(cast:{id:'air-singer'|'air-guitarist';model:VoiceModel;track:TeleTrack}[]){
  const lead=cast.find(c=>c.id==='air-singer'),back=cast.find(c=>c.id==='air-guitarist');if(!lead||!back)throw Error('The Air Supply duo is incomplete');this.model=lead.model;this.track=lead.track;this.supportModel=back.model;this.supportTrack=back.track;
  this.scene.background=new THREE.Color('#080e1b');this.scene.fog=new THREE.Fog('#080e1b',1900,4800);Object.values(this.rooms).forEach(g=>this.scene.add(g));this.scene.add(this.singer,this.guitarist,this.car,this.couple,this.lights.group);this.couple.add(this.story.group);this.rooms.silhouette.add(this.silhouettes);
  for(const [head,actor,hair]of [[this.head,this.singer,this.hair],[this.guitarHead,this.guitarist,this.guitarHair]]as const){head.centred=true;head.attachAccessory(hair.group);actor.add(head.scene);}
  this.singer.add(this.clothes.group);this.guitarist.add(this.guitarClothes.group,this.guitar.group);this.buildSets();this.buildCar();this.buildSilhouettes();this.buildHair();
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;m.opacity=0;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'wide',0);
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
 private buildSets(){
  for(const [name,g]of Object.entries(this.rooms)){
   const place=name as AirPlace,b=this.ink(g),day=['street','meadow','gas'].includes(place),warm=place==='diner';this.floor(g,day?'#67694d':warm?'#9a8868':'#080d15');this.plane(g,3200,1400,day?'#a0b1a4':warm?'#b5a070':place==='silhouette'?'#d9d5bd':'#101e3c',[0,600,-1250]);
   if(place==='street'||place==='meadow'){
    this.solid(g,[70,185,-380],1000,370,70,'#77513d');for(let row=0;row<15;row++){const y=row*25;this.line(b,[[-430,y,-343],[570,y,-343]],'#ad7858',.85,.5);for(let col=0;col<25;col++){const x=-430+col*40+(row%2)*20;this.line(b,[[x,y,-342],[x,y+25,-342]],'#a27459',.6,.55);}}
    for(const x of [-330,-180,-30,120,270,420]){this.box(b,[x,205,-338],72,112,5,'#c9ad83');this.plane(g,66,106,'#222c30',[x,205,-335]);this.line(b,[[x,150,-331],[x,260,-331]],'#9caea6');this.line(b,[[x-35,208,-331],[x+35,208,-331]],'#9caea6');}
    this.solid(g,[-350,70,-338],100,140,10,'#36312a');this.box(b,[-350,70,-330],100,140,12,'#ba9b71');for(const x of [-400,-140,400])this.solid(g,[x,15,-210],65,30,60,'#929282');
    if(place==='meadow'){const grass=this.plane(g,1200,420,'#6b7b43',[0,1,-100]);grass.rotation.x=-Math.PI/2;for(let i=0;i<70;i++){const x=-600+(i*97)%1200,z=-260+(i*41)%400;this.line(b,[[x,2,z],[x+4,12,z+1],[x-3,4,z+2]],'#97ab62',.85,.6);}}
    else for(let i=0;i<14;i++){const x=-650+(i*101)%1350,z=-150+(i%3)*60;this.line(b,[[x,0,z],[x+18,0,z+2]],'#8c9681',1,.5);}
   }
   if(place==='stage'){
    this.solid(g,[0,20,-165],420,40,230,'#17283c');for(let i=0;i<4;i++){const x=-190+i*120;this.solid(g,[x,25,-300],100,50,80,'#172033');this.box(b,[x,25,-300],100,50,80,'#446782');}
    for(const x of [-100,-25,65]){this.ring(b,[x,84,-190],[27,0,0],[0,27,0],'#829fb2',1.3);this.ring(b,[x,84,-195],[21,0,0],[0,21,0],'#d0c2a5');}
    for(const x of [-135,110]){this.line(b,[[x,40,-185],[x,151,-185]],'#a8bbca',1.3);this.ring(b,[x,153,-185],[36,0,0],[0,0,17],'#bfad76',1.3);}
    this.person(b,0,174,-226,false,'#8795ac',true);this.person(b,-265,145,-130,false,'#8297b0',true);this.box(b,[-265,90,-90],115,12,50,'#bacbd5');for(let i=0;i<20;i++)this.line(b,[[-318+i*5.4,98,-65],[-318+i*5.4,98,-95]],'#dee0d7',1);for(const x of [-300,300])this.box(b,[x,40,-90],55,80,60,'#586d87');
   }
   if(place==='gas'){
    this.solid(g,[-230,120,-230],120,240,75,'#847f6c');this.box(b,[-230,120,-187],120,240,10,'#d5cabb');this.plane(g,84,66,'#24282c',[-230,182,-180]);for(let i=0;i<4;i++)this.box(b,[-260+i*21,184,-175],14,25,1,'#b7c8ad');this.line(b,[[-173,170,-185],[-137,155,-170],[-133,38,-115],[-166,24,-80],[-190,85,-80],[-181,145,-100]],'#232326',3);this.box(b,[-180,150,-105],11,35,8,'#c5c4b5');this.solid(g,[0,270,-260],900,24,330,'#a69e82');for(const x of [-400,400])this.box(b,[x,133,-200],14,266,14,'#c9be9e');
   }
   if(place==='diner'){
    for(const x of [-320,-110,100,310]){this.box(b,[x,155,-260],170,240,12,'#ddc499');this.plane(g,160,230,'#86a2ab',[x,155,-250]);for(const y of [110,220])this.line(b,[[x-82,y,-240],[x+82,y,-240]],'#e0c6a0',1.6);this.line(b,[[x,35,-240],[x,275,-240]],'#e0c6a0',1.6);}
    this.solid(g,[0,78,10],205,7,135,'#e4ddc7');for(const x of [-70,70])for(const z of [-40,60])this.box(b,[x,36,z],7,72,7,'#a69b7d');for(const x of [-115,115]){this.box(b,[x,43,10],50,7,54,'#b3a16e');this.box(b,[x,83,-13],50,75,6,'#cfbb81');for(const z of [-12,32])this.box(b,[x,22,z],5,44,5,'#c4b795');}
    for(const x of [-53,47]){this.tube(b,[x,83,10],[x,104,10],7,8,'#d25340');this.ring(b,[x+9,94,10],[4,0,0],[0,6,0],'#e6b4a4');this.ring(b,[x,83,10],[15,0,0],[0,0,12],'#dfd6bb');}this.box(b,[10,90,-12],27,17,10,'#bba98a');this.box(b,[255,95,-170],120,190,60,'#bca67b');this.box(b,[250,210,-165],84,25,35,'#372e27');
   }
   b.end();
  }
 }
 private buildCar(){
  const b=this.ink(this.car);this.solid(this.car,[0,45,0],295,40,128,'#a5b7b4');this.solid(this.car,[85,72,0],118,18,125,'#d1dad1');this.box(b,[0,44,0],300,40,130,'#e2e4d4');
  for(const z of [-65,65]){this.line(b,[[-142,64,z],[-95,70,z],[-62,126,z],[-5,129,z],[33,80,z],[148,74,z]],'#e1e7dd',1.6);this.line(b,[[-60,126,z],[16,126,z],[42,77,z]],'#c2d2cd',1.6);this.line(b,[[-70,74,z],[-57,118,z],[-5,121,z],[18,78,z]],'#879d9e',1.05,.8,true);this.line(b,[[24,75,z],[147,71,z],[135,46,z],[26,44,z]],'#d9dfd3',1.3);this.line(b,[[-100,64,z],[-101,40,z],[19,40,z],[20,76,z]],'#e6ddbd',1.3);}
  for(const x of [-95,96])for(const z of [-69,69]){for(const r of [15,23,27])this.ring(b,[x,28,z],[r,0,0],[0,r,0],r===23?'#2b3336':'#d8d8bd',1.6);for(let i=0;i<12;i++){const q=i/12*TAU;this.line(b,[[x+10*Math.cos(q),28+10*Math.sin(q),z],[x+21*Math.cos(q),28+21*Math.sin(q),z]],'#b6b9a7',.85);}}
  for(const z of [-48,48]){this.ring(b,[152,65,z],[0,11,0],[0,0,11],'#f4e7bb',1.6);this.ring(b,[153,65,z],[0,8,0],[0,0,8],'#d4dece',1.3);}
  this.box(b,[155,41,0],10,14,136,'#d4ddd6');for(let z=-50;z<=50;z+=9)this.line(b,[[157,48,z],[157,59,z]],'#e5e5cc',1.3);this.line(b,[[-150,40,-68],[-150,40,68]],'#d2d8c9',2);this.box(b,[-42,74,0],62,18,100,'#80959b');this.box(b,[-75,91,0],10,40,100,'#71878d');this.ring(b,[-4,103,33],[0,13,0],[8,0,9],'#c1cbc4',1.3);b.end();
  this.car.add(this.carDoor);const d=this.ink(this.carDoor);this.box(d,[48,-8,0],96,40,4,'#d9e0d3');this.line(d,[[0,15,0],[14,57,0],[64,57,0],[96,15,0]],'#c1d1cd',1.3);d.end();this.carDoor.position.set(-90,67,68);
 }
 private buildSilhouettes(){
  const profile=[[-16,-15],[-20,0],[-16,20],[-8,29],[5,30],[13,20],[14,14],[23,9],[15,6],[19,2],[15,-1],[18,-4],[13,-9],[4,-14]];
  for(const side of [-1,1]){const group=new THREE.Group();this.silhouettes.add(group);const shape=new THREE.Shape();profile.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:'#111319',side:THREE.DoubleSide}));group.add(mesh);this.meshes.push(mesh);mesh.scale.set(side<0?1:-1,1,1);const shoulder=this.solid(group,[side<0?-12:12,-59,-2],82,96,9,'#111319');shoulder.rotation.z=side<0?-.3:.3;
   const hair=new THREE.Shape();hair.moveTo(-16,-15);hair.lineTo(-26,-3);hair.lineTo(-24,24);hair.quadraticCurveTo(-5,43,14,28);hair.lineTo(10,16);hair.lineTo(-8,20);hair.closePath();const h=new THREE.Mesh(new THREE.ShapeGeometry(hair),new THREE.MeshBasicMaterial({color:'#111319',side:THREE.DoubleSide}));h.scale.x=side<0?1:-1;h.position.z=.5;group.add(h);this.meshes.push(h);
  }
 }
 private buildHair(){
  for(const [b,curly]of [[this.hair,true],[this.guitarHair,false]]as const){b.begin();for(let i=0;i<(curly?58:40);i++){const a=i/(curly?58:40)*TAU;this.line(b,Array.from({length:24},(_,j)=>{const q=.08+j/23*(Math.cos(a)>.2?.9:2.3),tail=Math.max(0,j-16)/7;return [-2+(10.4*Math.sin(q)+(curly?Math.sin(j*1.8+i)*.9:0))*Math.cos(a),17+10.5*Math.cos(q)-tail*(curly?4:15),(9.5*Math.sin(q)+(curly?Math.cos(j*1.8+i)*.8:0))*Math.sin(a)]as P;}),curly?'#ae9d7f':'#cfba86',.85,.9);}b.end();}
 }
 private performer(b:Beams,p:ReturnType<typeof airPose>,guitarist:boolean){
  b.begin();const c=guitarist?'#c8b78f':'#6e9cba',vest='#b1aa71';const levels=[[-3,6,5],[-16,23,11],[-43,20,10],[-69,17,10]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],c);for(let i=0;i<20;i++){const q=i/20*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),c,.85);}
  if(!guitarist)for(const side of [-1,1]){this.line(b,[[side*6,-3,7],[side*13,-11,12],[side*5,-26,13]],'#a8bed0',1.3);this.line(b,[[side*13,-5,10],[side*24,-17,10],[side*20,-69,12],[side*5,-67,14],[side*6,-27,14]],vest,1.6,.9,true);for(let j=0;j<4;j++)this.line(b,[[side*(9+j*3),-29,14],[side*(9+j*2),-63,13]],vest,.85,.8);}
  for(const side of [-1,1]){this.tube(b,[side*9,-69,0],[side*12,-109,0],8,6,'#9caeac');this.tube(b,[side*12,-109,0],[side*14,-150,4],6,4.5,'#9caeac');this.line(b,[[side*14,-150,4],[side*14,-150,20]],'#c7bd9e',2);
   const hand:P=guitarist?(side<0?[-3,-62+Math.sin(p.t*8)*2.5,28]:[29,-27,24]):p.heart>.3?[side*12,-30,25]:[side*(28+48*p.open),-55+59*p.open+(side<0?20*p.reach:0),18+14*p.reach];const elbow:P=guitarist?[side*30,-40,9]:[side*(31+21*p.open),-36+20*p.open,8];this.tube(b,[side*23,-16,0],elbow,6,4.5,c);this.tube(b,elbow,hand,4.5,2.6,c);for(let k=0;k<5;k++)this.line(b,[[hand[0]+k-2,hand[1],hand[2]],[hand[0]+(k-2)*1.6,hand[1]+7-k*.4,hand[2]+2]],'#ccbca1',1.05);}
  if(guitarist)this.line(b,[[-19,-10,12],[12,-77,30],[21,-72,26],[-9,-9,12]],'#9f865b',2);b.end();
 }
 private playGuitar(t:number){const b=this.guitar;b.begin();const pos=(x:number,y:number,z=0):P=>[-5+x*Math.cos(-.72)-y*Math.sin(-.72),-61+x*Math.sin(-.72)+y*Math.cos(-.72),24+z];
  for(const depth of [-3,3]){const outline:P[]=Array.from({length:80},(_,i)=>{const q=i/80*TAU,r=1-.17*Math.cos(q*2);return pos(16*r*Math.cos(q),24*Math.sin(q),depth);});this.line(b,outline,'#bc9b63',1.3,.95,true);}this.ring(b,pos(0,4,3.5),[4.4*Math.cos(-.72),4.4*Math.sin(-.72),0],[-4.4*Math.sin(-.72),4.4*Math.cos(-.72),0],'#cbb681',1.3);this.line(b,[pos(-2,22,3),pos(-2,63,3),pos(3,63,3),pos(3,22,3)],'#c6ac75',1.3,.9,true);for(let i=0;i<6;i++)this.line(b,[pos((i-2.5)*.6,-13,3.5),pos((i-2.5)*.6+Math.sin(t*45+i)*.03,65,3.5)],'#d9d6bc',.85);for(let i=0;i<12;i++)this.line(b,[pos(-2,23+i*3,3.6),pos(3,23+i*3,3.6)],'#ccb47e',.6);b.end();}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const head of [this.head,this.guitarHead])head.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=airPose(t),place=airPlace(view,t),c=airCamera(view,this.width/this.height,t);if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25){this.head.resetMotion();this.guitarHead.resetMotion();}const dt=this.last===null?0:Math.min(.05,Math.max(0,t-this.last));this.last=t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([key,g])=>g.visible=key===place);const day=place==='street'||place==='meadow'||place==='gas',bg=new THREE.Color(day?'#89998e':place==='diner'?'#a68e69':place==='silhouette'?'#d9d5bd':'#080e1b');this.scene.background=bg;(this.scene.fog as THREE.Fog).color.copy(bg);
  this.singer.visible=place==='stage'&&view!=='air-guitarist';this.guitarist.visible=place==='stage'&&view!=='air-singer';this.singer.position.set(65,150,35);this.guitarist.position.set(-75,150,12);this.singer.rotation.set(0,0,p.sway-p.open*.035);this.guitarist.rotation.set(0,-.04,Math.sin(t*.6)*.017);this.head.scene.rotation.set(-p.open*.11,-Math.PI/2+Math.sin(t*.34)*.035,0);this.guitarHead.scene.rotation.set(.08,-Math.PI/2-.14,0);this.performer(this.clothes,p,false);this.performer(this.guitarClothes,p,true);this.playGuitar(t);
  this.car.visible=['street','meadow','car','gas'].includes(place);this.car.position.set(place==='street'?-600*p.carTravel:place==='gas'?95:0,0,place==='car'?-100:-150);this.car.rotation.set(0,place==='gas'?-.18:-.12,0);this.carDoor.rotation.y=place==='street'?.55*pulseDoor(t):0;
  this.couple.visible=place!=='stage'&&place!=='silhouette';this.story.begin();if(place==='street'){this.person(this.story,-110+p.walk*90,143,20,true,'#afa3b3');this.person(this.story,25+p.walk*60,147,2,false,'#d5c6aa',false,Math.sin(t*.8)*.1);}else if(place==='meadow'){this.person(this.story,25,143,14,true,'#caa1aa');this.person(this.story,-64,102,45,false,'#c9c2b0',true);}else if(place==='car'){this.person(this.story,-42,95,-80,true,'#a8a3ad',true,0,true);this.person(this.story,35,99,-92,false,'#8b9aa4',true,0,true);}else if(place==='gas'){this.person(this.story,32,145,38,true,'#cb766e');this.person(this.story,157,118,-110,false,'#85959b',true);}else if(place==='diner'){this.person(this.story,-118,112,0,true,'#a8bacb',true,.8);this.person(this.story,116,116,3,false,'#687b93',true,.25);}this.story.end();
  this.silhouettes.children.forEach((g,i)=>{g.position.set(i?25+p.separation*15:-25-p.separation*15,155+(i?2:0),20+(i?0:1));g.rotation.z=(i?-1:1)*(.04+.035*Math.sin(t*.3));});
  this.lights.begin();if(place==='stage')for(let i=0;i<18;i++){const x=-380+(i*113)%760,q=.15*Math.sin(t*.25+i);this.line(this.lights,[[x,310,-250],[x+Math.sin(q)*280,20,-50]],i%3?'#728fae':'#bbc7d0',2,.17);this.ring(this.lights,[x,310,-250],[10,0,0],[0,5,0],'#c0d1e0',1.3,.6);}this.lights.end();
  this.scene.updateMatrixWorld(true);for(const [head,model,track]of [[this.head,this.model,this.track],[this.guitarHead,this.supportModel,this.supportTrack]]as const){if(place!=='stage')continue;const msg=track.message(track.indexAt(t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;head.camera.copy(this.camera);head.camera.updateMatrixWorld();head.face.update(tele,dt);head.update(model,model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const [head,hair]of [[this.head,this.hair],[this.guitarHead,this.guitarHair]]as const){hair.group.removeFromParent();head.dispose();}this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
function pulseDoor(t:number){return Math.max(0,Math.min(1,(t-12)/2))*Math.max(0,Math.min(1,(24-t)/2));}
