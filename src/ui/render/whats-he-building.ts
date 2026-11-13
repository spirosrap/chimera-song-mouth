import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {workshopPose,workshopCamera,type WorkshopPoint as P} from '../../scene/whats-he-building.ts';
const TAU=Math.PI*2;
/** A suspicious physical narrator outside an imagined, flickering workshop. */
export class WorkshopStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,4000);
 readonly head=new Anatomy3D();readonly singer=new THREE.Group();readonly workshop=new THREE.Group();readonly window=new THREE.Group();readonly silhouette=new THREE.Group();readonly shadowArms:THREE.Mesh[]=[];readonly shadows=new Beams();readonly haze=new Beams();
 readonly hair=new Beams();readonly clothes=new Beams();readonly limbs=new Beams();
 private beams=[this.hair,this.clothes,this.limbs,this.shadows,this.haze];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;private glow:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#080c0e');this.scene.fog=new THREE.Fog('#080c0e',650,1800);this.scene.add(this.singer,this.workshop,this.window,this.silhouette,this.shadows.group,this.haze.group);this.head.centred=true;this.head.attachAccessory(this.hair.group);this.singer.add(this.head.scene,this.clothes.group,this.limbs.group);
  for(const b of this.beams){b.begin();b.end();}this.buildHair();this.buildRoom();this.buildBench();this.buildWindow();this.buildShadow();
  this.glow=this.plane(this.workshop,100,130,'#817650',[-130,144,-158]);this.glow.renderOrder=-1;
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;m.opacity=0;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,ps:P[],c:string,w=1,a=.85,close=false){b.line(ps.flat(),ps.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.85){this.line(b,Array.from({length:28},(_,i)=>{const q=i/28*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q)) as P;}),col,w,a,true);}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const point=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),c,.85,.9,true);for(let i=0;i<10;i++)this.line(b,[point(0,i/10*TAU),point(1,i/10*TAU)],c,.85,.85);
 }
 private buildHair(){const b=this.hair;b.begin();for(let i=0;i<60;i++){const a=i/60*TAU;this.line(b,Array.from({length:15},(_,j)=>{const q=.08+j/14*(Math.cos(a)>.4?.9:1.8),curl=Math.sin(j+i)*.5;return [-2+(9+curl)*Math.sin(q)*Math.cos(a),16+8.8*Math.cos(q),(8.6+curl)*Math.sin(q)*Math.sin(a)] as P;}),i%3?'#666d6b':'#9d9b86',.85,.8);}for(let i=0;i<30;i++){const z=-5+(i%10),y=5+Math.floor(i/10);this.line(b,[[7,y,z],[8.3,y-1,z+.3]],'#7c8680',.85,.8);}b.end();}
 private box(b:Beams,p:P,w:number,h:number,d:number,c:string){for(const z of [-d/2,d/2])this.line(b,[[-w/2,-h/2,z],[w/2,-h/2,z],[w/2,h/2,z],[-w/2,h/2,z]].map(v=>v.map((x,k)=>x+p[k]) as P),c,1,.8,true);for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])this.line(b,[[p[0]+x,p[1]+y,p[2]-d/2],[p[0]+x,p[1]+y,p[2]+d/2]],c);}
 private buildRoom(){const g=this.workshop,b=this.ink(g),floor=this.plane(g,1000,950,'#141b19',[0,-1,-150]);floor.geometry.dispose();floor.geometry=new THREE.PlaneGeometry(1000,950,16,16);floor.rotation.x=-Math.PI/2;this.plane(g,640,340,'#202b27',[0,169,-190]);
  for(let i=0;i<24;i++){const x=-310+i*27;this.line(b,[[x,0,-187],[x+3,150,-187],[x,333,-187]],'#526057',1,.65);}for(const y of [34,235])this.line(b,[[-315,y,-186],[315,y,-186]],'#72766a',1.3,.75);
  for(const x of [-290,275]){this.line(b,[[x,0,-60],[x,275,-60],[x-20,285,-60]],'#82958c',2);this.ring(b,[x-20,285,-60],[12,0,0],[0,0,12],'#a3a58a',1.6);}
  // Shelving with anonymous jars, boxes and coils; nothing reveals what is being built.
  for(const y of [77,134,191]){this.box(b,[218,y,-144],130,6,75,'#8e8c72');for(let i=0;i<5;i++){const x=169+i*24;this.tube(b,[x,y+5,-140],[x,y+33+(i%2)*8,-140],8,7,'#818e84');this.ring(b,[x,y+36+(i%2)*8,-140],[7,0,0],[0,0,7],'#b4a77a');}}for(const x of [150,286])this.line(b,[[x,0,-180],[x,235,-180]],'#78877d',1.6);
  for(let i=0;i<8;i++)this.line(b,[[-270+i*75,2,200],[-260+i*75,2,-180]],'#45584f',1,.5);for(let i=0;i<6;i++)this.line(b,[[-300,2,180-i*60],[300,2,180-i*60]],'#45584f',1,.5);
  this.box(b,[40,38,-120],90,76,70,'#7b897a');for(let i=0;i<4;i++)this.box(b,[40,14+i*19,-83],77,13,3,'#9a9c82');this.box(b,[-230,41,-28],61,82,49,'#596d62');for(let i=0;i<9;i++)this.line(b,[[-257+i*6,4,-1],[-257+i*6,78,-1]],'#7d8e7f');b.end();}
 private buildBench(){const b=this.ink(this.workshop);this.box(b,[42,77,-22],204,12,91,'#a49b7a');for(const x of [-47,131])for(const z of [-56,12])this.box(b,[x,35,z],8,70,8,'#87947c');
  this.box(b,[100,92,-13],28,22,26,'#9da297');this.line(b,[[84,96,4],[116,96,4],[123,96,4]],'#c0b794',2);this.line(b,[[124,87,4],[124,104,4]],'#b5aa8b',2);
  this.box(b,[18,96,-37],61,24,46,'#9fa990');for(const z of [-28,-45])this.ring(b,[18,105,z],[14,0,0],[0,14,0],'#bac0a0',1.4);this.line(b,[[18,119,-28],[18,119,-45]],'#9da587',1.6);
  for(let i=0;i<5;i++){const x=-36+i*22;this.line(b,[[x,175,-183],[x+4,148,-181],[x+10,142,-181]],'#c2b18e',2);this.ring(b,[x,179,-183],[4,0,0],[0,5,0],'#b7b5a3',1.3);}this.box(b,[-32,88,-15],28,4,44,'#c1b493');
  // A covered mechanism remains opaque; the mystery is never resolved.
  const shroud=this.plane(this.workshop,80,48,'#25392f',[20,112,-7]);shroud.rotation.y=-.1;for(let i=0;i<12;i++)this.line(b,[[-20+i*7,88,-4],[-15+i*6,112,1],[-10+i*5,136,-5]],'#6b8771',1,.55);
  this.line(b,[[-74,80,-26],[-74,136,-30],[-34,153,-29]],'#b6b28c',2);this.line(b,[[-48,153,-29],[-38,166,-29],[-19,166,-29],[-11,153,-29]],'#d6c58d',1.6,.95,true);b.end();}
 private buildWindow(){const b=this.ink(this.window);this.box(b,[-130,144,-154],112,142,8,'#a1a995');this.box(b,[-130,144,-148],101,130,3,'#7d9388');this.line(b,[[-130,79,-143],[-130,209,-143]],'#c3bda0',2);this.line(b,[[-181,144,-143],[-79,144,-143]],'#c3bda0',2);
  for(let i=0;i<9;i++)this.line(b,[[-180+i*12,208,-139],[-180+i*12,183,-139],[-177+i*12,174,-139]],'#a1aaa1',1.6,.8);this.box(b,[-130,74,-136],135,8,30,'#a2a38c');b.end();}
 private buildShadow(){const add=(geo:THREE.BufferGeometry,x:number,y:number)=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#090f0c',side:THREE.DoubleSide}));m.position.set(x,y,0);this.silhouette.add(m);this.meshes.push(m);return m;};add(new THREE.CircleGeometry(15,30),0,45);const shape=new THREE.Shape();shape.moveTo(-14,28);shape.lineTo(15,24);shape.lineTo(12,-28);shape.lineTo(-11,-25);shape.closePath();add(new THREE.ShapeGeometry(shape),0,0);for(const side of [-1,1]){const arm=add(new THREE.PlaneGeometry(55,9),side*34,13);this.shadowArms.push(arm);const leg=add(new THREE.PlaneGeometry(9,58),side*15,-52);leg.rotation.z=side*.25;}}
 private body(p:ReturnType<typeof workshopPose>){const b=this.clothes;b.begin();const levels=[[-3,6,5],[-16,23,11],[-52,22,11],[-96,26,13]];for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],'#8a9993');for(let i=0;i<22;i++){const q=i/22*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),'#687e75',.85,.85);}for(const side of [-1,1])this.line(b,[[side*5,0,7],[side*15,-12,13],[side*7,-33,12],[0,-52,12]],'#c0bca0',1.3);for(let y=-45;y>-90;y-=14)this.ring(b,[2,y,12],[1,0,0],[0,1,0],'#afad91');b.end();
  const l=this.limbs;l.begin();for(const side of [-1,1]){this.tube(l,[side*9,-88,0],[side*12,-117,7],8,5.5,'#687b75');this.tube(l,[side*12,-117,7],[side*17,-149,16],5.5,4,'#687b75');this.tube(l,[side*17,-149,16],[side*17,-149,32],5,4,'#a0a996');const hand:P=side>0&&p.listen>.1?[15,13,13]:side<0&&p.point>.1?[-60,-5,20]:[side*(24+10*p.peer),-65+30*p.peer,15+12*p.peer],elbow:P=[side*(30+8*p.peer),-35+16*p.listen,3];this.tube(l,[side*23,-16,0],elbow,6,4.5,'#80958b');this.tube(l,elbow,hand,4.5,2.7,'#80958b');for(let i=0;i<5;i++)this.line(l,[[hand[0]+side*(i-2),hand[1],hand[2]],[hand[0]+side*(i-2)*1.7,hand[1]+7-i*.5,hand[2]+2]],'#c1c4ad',1.05);}l.end();}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=workshopPose(t),c=workshopCamera(view,this.width/this.height,t);if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.singer.visible=view==='wide'||view==='watcher';this.singer.position.set(-110,150,70);this.singer.rotation.set(.08*p.peer,-.1*p.peer,-.06*p.peer);this.head.scene.rotation.set(.04*p.peer,-Math.PI/2+p.turn+p.listen*.16,-.04*p.point);this.body(p);
  (this.glow.material as THREE.MeshBasicMaterial).color.setRGB(.22+p.flicker*.28,.25+p.flicker*.23,.17+p.flicker*.13);
  this.silhouette.position.set(25+p.shadow*90,130+Math.sin(t*.21)*14,-182);this.silhouette.scale.set(1.3,1.2,1);this.shadowArms.forEach((m,i)=>m.rotation.z=(i?1:-1)*(.2+Math.sin(t*.7+i)*.45));
  this.haze.begin();for(let i=0;i<24;i++){const z=-170+(i%6)*48,x=((i*79+t*5)%600)-300,y=6+(i%8)*12;this.line(this.haze,[[x-35,y,z],[x,y+Math.sin(t*.4+i)*5,z],[x+35,y,z]],'#849b88',.85,.10);}this.haze.end();
  const msg=this.track.message(this.track.indexAt(t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
