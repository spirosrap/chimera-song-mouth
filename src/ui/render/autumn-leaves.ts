import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {autumnPose,autumnCamera,type AutumnPoint as P} from '../../scene/autumn-leaves.ts';
const TAU=Math.PI*2;
/** All scene colours, including the normally coloured airway, are monochrome. */
export class AutumnStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,4000);
 readonly head=new Anatomy3D();readonly singer=new THREE.Group();readonly foliage=new THREE.Group();readonly chair=new THREE.Group();
 readonly hair=new Beams();readonly clothes=new Beams();readonly limbs=new Beams();
 private beams=[this.hair,this.clothes,this.limbs];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#090909');this.scene.fog=new THREE.Fog('#090909',750,2200);this.scene.add(this.singer,this.foliage,this.chair);this.head.centred=true;this.head.attachAccessory(this.hair.group);this.singer.add(this.head.scene,this.clothes.group,this.limbs.group);
  for(const b of this.beams){b.begin();b.end();}this.buildHair();this.buildGarden();this.buildChair();this.buildCoat();
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
 private buildHair(){const b=this.hair;b.begin();for(let i=0;i<64;i++){const a=i/64*TAU,end=Math.cos(a)>.4?.8:1.65;this.line(b,Array.from({length:17},(_,j)=>{const q=.08+j/16*end,wave=Math.sin(j*1.2+i)*.17;return [-2+(9.0+wave)*Math.sin(q)*Math.cos(a),16+8.8*Math.cos(q),(8.6+wave)*Math.sin(q)*Math.sin(a)] as P;}),i%4?'#707070':'#aaaaaa',.85,.8);}b.end();}
 private buildCoat(){const geo=new THREE.CylinderGeometry(21,17,54,12),m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#383838'}));m.position.y=-41;m.scale.z=.51;this.singer.add(m);this.meshes.push(m);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-7,-3,11,7,-3,11,0,-30,12],3));const shirt=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#dedede',side:THREE.DoubleSide}));this.singer.add(shirt);this.meshes.push(shirt);
 }
 private leaf(b:Beams,c:P,angle:number,size:number,col:string){const u:P=[Math.cos(angle)*size,Math.sin(angle)*size,0],v:P=[-Math.sin(angle)*size*.32,Math.cos(angle)*size*.32,0];this.ring(b,c,u,v,col,.85,.65);this.line(b,[[c[0]-u[0],c[1]-u[1],c[2]],[c[0]+u[0],c[1]+u[1],c[2]]],col,.85,.5);}
 private buildGarden(){const g=this.foliage,b=this.ink(g);const floor=this.plane(g,1000,900,'#111111',[0,-1,-150]);floor.rotation.x=-Math.PI/2;
  // A dark reed screen, branching foliage, flowers and fluted garden urns.
  for(let i=0;i<90;i++){const x=-350+i*8;this.line(b,[[x,0,-240],[x+Math.sin(i)*2,120,-241],[x+Math.cos(i)*3,250,-240]],i%3?'#373737':'#484848',.85,.65);}
  for(let branch=0;branch<18;branch++){const side=branch%2?1:-1,x=side*(65+(branch*47)%200),y=35+(branch*37)%210,z=-100-(branch%4)*25;this.line(b,[[side*260,0,z],[x*.9,y*.45,z],[x,y,z],[x-side*65,y+55,z]],'#7b7b7b',1.6,.6);
   for(let i=0;i<14;i++){const f=i/13,c:P=[x-side*f*65+Math.sin(i+branch)*17,y+f*50+Math.cos(i*2+branch)*12,z+3];this.leaf(b,c,Math.sin(i+branch)*2,6+(i%4)*2,i%3?'#8c8c8c':'#bbbbbb');}}
  for(const x of [-145,142]){this.tube(b,[x,0,-20],[x,48,-20],18,12,'#777777');this.ring(b,[x,54,-20],[26,0,0],[0,0,20],'#a0a0a0',1.3);this.ring(b,[x,48,-20],[12,0,0],[0,0,12],'#a0a0a0');for(let i=0;i<25;i++){const q=i*2.4,c:P=[x+Math.cos(q)*((i*7)%31),60+(i*13)%45,-20+Math.sin(q)*18];this.line(b,[[x,50,-20],c],'#828282',.85);for(let k=0;k<5;k++)this.ring(b,[c[0]+Math.cos(k/5*TAU)*3,c[1]+Math.sin(k/5*TAU)*3,c[2]],[2.5,0,0],[0,3,0],i%3?'#bbbbbb':'#eeeeee',.85,.7);}}
  b.end();
 }
 private buildChair(){const g=this.chair,b=this.ink(g);g.position.set(-53,0,28);g.rotation.y=.10;
  for(const y of [42,45])this.ring(b,[0,y,0],[32,0,0],[0,0,24],'#bbbbbb',1.3);for(const side of [-1,1])for(const z of [-15,15])this.line(b,[[side*24,43,z],[side*29,3,z+4]],'#999999',1.6);
  // Peacock-shaped woven fan, looped rim and radiating ribs.
  for(let i=0;i<15;i++){const a=(-.94+i/14*1.88),top:P=[Math.sin(a)*62,75+Math.cos(a)*61,-10];this.line(b,[[0,45,-9],[top[0]*.65,87,-10],top],'#a7a7a7',1.3);this.ring(b,top,[Math.cos(a)*7,Math.sin(a)*-7,0],[Math.sin(a)*7,Math.cos(a)*12,0],'#dedede',1.3);}
  for(let j=0;j<11;j++){const r=20+j*3.4;this.line(b,Array.from({length:34},(_,i)=>{const a=-.94+i/33*1.88;return [Math.sin(a)*r,75+Math.cos(a)*r,-9] as P;}),'#999999',.85);}
  for(const side of [-1,1])this.line(b,[[side*27,43,15],[side*36,75,8],[side*31,85,-8],[side*22,78,-10]],'#c5c5c5',1.6);b.end();
 }
 private body(p:ReturnType<typeof autumnPose>,energy:number){const b=this.clothes;b.begin();const levels=[[-3,6,5],[-15,23,11],[-41,20,10],[-68,17,10]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],'#a8a8a8');for(let i=0;i<20;i++){const q=i/20*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),'#999999',.85);}
  for(const side of [-1,1]){this.line(b,[[side*6,-2,7],[side*11,-12,12],[side*3,-20,12]],'#eeeeee',1.3);this.line(b,[[side*10,-7,12],[side*17,-23,12],[side*9,-27,12],[0,-45,12]],'#bdbdbd',1.3);}
  this.line(b,[[0,-10,13],[-3.5,-16,13],[0,-53,13],[4,-46,13],[3.5,-16,13],[0,-10,13]],'#d4d4d4',1.3);for(let i=0;i<14;i++)this.ring(b,[Math.sin(i*4)*1.9,-17-i*2.3,13.5],[.7,0,0],[0,.9,0],'#eeeeee',.85);
  this.line(b,[[9,-29,12],[18,-28,12],[18,-30,12],[9,-31,12]],'#ffffff',1.6);for(const y of [-44,-58])this.ring(b,[0,y,11.5],[1,0,0],[0,1,0],'#cccccc',1);b.end();
  const l=this.limbs;l.begin();for(const side of [-1,1]){
   this.tube(l,[side*9,-67,0],[side*10,-107,2],8,6,'#8d8d8d');this.tube(l,[side*10,-107,2],[side*12,-148,3],6,4.5,'#8d8d8d');this.tube(l,[side*12,-148,3],[side*12,-148,18],5,4,'#b0b0b0');
   const hand:P=side<0?[-42-15*p.open,-23+19*p.open,17+8*p.open]:[18,-62,13],elbow:P=side<0?[-32,-32,3]:[31,-36,0];this.tube(l,[side*23,-15,0],elbow,6,4.5,'#a4a4a4');this.tube(l,elbow,hand,4.5,2.5,'#a4a4a4');this.ring(l,hand,[3,0,0],[0,0,3],'#eeeeee',1.3);for(let i=0;i<5;i++)this.line(l,[[hand[0]+side*(i-2),hand[1],hand[2]],[hand[0]+side*(i-2)*1.6,hand[1]-7+i*.5,hand[2]+1+energy]],'#d4d4d4',1.05);
  }l.end();
 }
 /** Desaturate only this stage's owned buffers after each physical-head update. */
 private monochrome(){this.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>;if(!m.geometry)return;for(const key of ['instanceColorStart','instanceColorEnd','color']){const a=m.geometry.getAttribute(key);if(!a)continue;const count=key.startsWith('instance')?Math.min(a.count,m.geometry.instanceCount):a.count;for(let i=0;i<count;i++){const y=.2126*a.getX(i)+.7152*a.getY(i)+.0722*a.getZ(i);a.setXYZ(i,y,y,y);}a.needsUpdate=true;}});}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=autumnPose(t),c=autumnCamera(view,this.width/this.height,t);if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.singer.position.set(15,150,35);this.singer.rotation.set(0,0,p.lean);this.head.scene.rotation.set(p.nod+p.settle*.05,-Math.PI/2+p.turn,-p.lean);
  const msg=this.track.message(this.track.indexAt(t)),energy=Math.min(1,msg.t.outRms*4),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.body(p,energy);this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);this.monochrome();
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
