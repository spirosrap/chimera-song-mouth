import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {vitasPose,vitasCamera,type VitasPoint as P} from '../../scene/vitas.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,silver='#d8e8ef',shade='#6e879f',colours=['#f04836','#efb938','#4dbe49','#4778d0','#cf459f'];
/** Silver costume and disco theatre from the supplied video. One borrowed physical head. */
export class VitasStage {
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,5000);
 readonly singer=new THREE.Group();readonly head=new Anatomy3D();readonly crown=new Beams();readonly suit=new Beams();readonly arms=new Beams();readonly legs=new Beams();
 readonly architecture=new Beams();readonly dancers=new Beams();readonly audience=new Beams();readonly lights=new Beams();
 readonly discs:THREE.Mesh<THREE.CircleGeometry,THREE.MeshBasicMaterial>[]=[];
 private all:Beams[];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#030615');this.scene.fog=new THREE.Fog('#030615',500,1600);
  this.all=[this.crown,this.suit,this.arms,this.legs,this.architecture,this.dancers,this.audience,this.lights];this.all.forEach(b=>{b.begin();b.end();});
  this.head.centred=true;this.head.attachAccessory(this.crown.group);this.singer.add(this.head.scene,this.suit.group,this.arms.group,this.legs.group);
  this.scene.add(this.singer,this.architecture.group,this.dancers.group,this.audience.group,this.lights.group);this.buildCostume();this.buildStage();
  this.veil=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color:'#000000',transparent:true,opacity:0,depthTest:false,depthWrite:false}));this.veil.renderOrder=1000;this.scene.add(this.veil);this.meshes.push(this.veil);
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,ps:P[],c:string,w=1,a=.8,close=false){b.line(ps.flat(),ps.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.8){this.line(b,Array.from({length:28},(_,i)=>{const q=i/28*TAU;return c.map((x,k)=>x+u[k]*Math.cos(q)+v[k]*Math.sin(q)) as P;}),col,w,a,true);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string,alpha=.8){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...z),axis=end.clone().sub(start).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const point=(t:number,q:number)=>start.clone().lerp(end,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),c,.85,alpha,true);for(let i=0;i<10;i++)this.line(b,[point(0,i/10*TAU),point(1,i/10*TAU)],c,.85,alpha);
 }
 private buildCostume(){
  const b=this.suit;b.begin();const rings=[[-1,6,5],[-10,22,10],[-34,17,9],[-57,14,9],[-68,17,10]];
  for(const [y,x,z]of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],silver,1,.9);
  for(let i=0;i<32;i++){const q=i/32*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),i%4?shade:silver,.85,.9);}
  // High ribbed collar and the sharp, fluted shoulder caps.
  for(let y=-6;y<=1;y+=1.25)this.ring(b,[0,y,0],[6.5,0,0],[0,0,5.2],silver,1,.95);
  for(const side of [-1,1])for(let i=0;i<10;i++)this.line(b,[[side*(7+i*1.6),-6-i*.1,-8],[side*(9+i*1.7),-6-i*.2,0],[side*(7+i*1.7),-12,10]],silver,.85,.9);
  for(let i=0;i<5;i++)this.line(b,[[i-2,-12,9],[i-2,-59,9]],silver,.85,.8);b.end();
  const h=this.crown;h.begin();
  // Sculpted dark silver blades on the crown; the face, lips and airway remain exposed.
  for(let i=0;i<30;i++){const z=-8+i*16/29,k=Math.sqrt(Math.max(0,1-(z/9)**2));this.line(h,Array.from({length:17},(_,j)=>{const q=j/16*Math.PI;return [-2-9*k*Math.cos(q),20+7*k*Math.sin(q),z] as P;}),i%3?shade:silver,.85,.9);}
  for(const side of [-1,1])for(let i=0;i<4;i++)this.line(h,[[6,22,side*(3+i)],[8,21,side*(5+i*.6)],[3,18,side*8],[-2,17,side*9],[-4,12,side*9]],i%2?silver:'#34495e',1.3,.95);
  h.end();
 }
 private disc(x:number,y:number,z:number,r:number,col:string,floor=false){
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,32),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide,transparent:true,opacity:.75}));m.position.set(x,y,z);if(floor)m.rotation.x=-Math.PI/2;this.scene.add(m);this.discs.push(m);this.meshes.push(m);
 }
 private buildStage(){
  const b=this.architecture;b.begin();
  for(let row=0;row<6;row++)for(let col=0;col<11;col++){const x=(col-5)*59,y=35+row*49;this.disc(x,y,-240,18,colours[(col+row*2)%5]);this.ring(b,[x,y,-239],[19,0,0],[0,19,0],colours[(col+row*2)%5],1,.8);}
  for(let row=0;row<6;row++)for(let col=0;col<7;col++)this.disc((col-3)*50,.4,-170+row*49,19,colours[(row+col*2)%5],true);
  for(const side of [-1,1]){this.line(b,[[side*190,1,155],[side*190,1,-210]],silver,1.6,.8);for(const z of [-190,-110,-30,50,130])this.line(b,[[side*193,0,z],[side*193,65,z]],shade,1.3,.75);for(const y of [38,65])this.line(b,[[side*193,y,155],[side*193,y,-210]],silver,1.3,.75);}
  for(const x of [-120,120]){this.line(b,[[x-30,0,154],[x+30,0,154],[x+24,22,130],[x-24,22,130]],shade,1.3,.9,true);}
  for(let i=0;i<7;i++){const q=i/7*TAU,x=Math.cos(q)*270,y=220+Math.sin(q)*80;for(let k=0;k<8;k++){const a=k/8*TAU;this.line(b,[[x,y,-220],[x+Math.cos(a)*10,y+Math.sin(a)*10,-220]],'#f8c96e',1.3,.8);}}
  b.end();const floor=new THREE.Mesh(new THREE.PlaneGeometry(410,430),new THREE.MeshBasicMaterial({color:'#0a1023',side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-1,-45);this.scene.add(floor);this.meshes.push(floor);
 }
 private body(p:ReturnType<typeof vitasPose>){
  this.legs.begin();for(const side of [-1,1]){const step=Math.sin(p.t*3.2+side)*5*p.chorus,ankle:P=[side*(13+4*p.chorus),-139+p.bounce*1.5,6+step];this.tube(this.legs,[side*9,-65,0],[side*11,-102,3+step*.3],8,5.5,silver);this.tube(this.legs,[side*11,-102,3+step*.3],ankle,5.5,4.7,silver);this.tube(this.legs,ankle,[ankle[0],ankle[1]-1,ankle[2]+15],5,4,shade);}this.legs.end();
  this.arms.begin();for(const side of [-1,1]){
   const raising=side>0?p.raise:p.raise*.35,spread=p.spread,flutter=Math.sin(p.t*7+side)*p.chorus;
   let wrist:P=[side*(28+43*spread+8*p.chorus),-58+58*spread+96*raising+flutter*5,14+12*p.chorus];
   if(side<0&&p.left>.1)wrist=[-32,-30+57*p.left,24];if(side>0&&p.chest>.1)wrist=[22-17*p.chest,-38+18*p.chest,21];
   const elbow:P=[side*(28+20*spread),-34+35*spread+43*raising,8];this.tube(this.arms,[side*22,-11,0],elbow,5.8,4.1,silver);this.tube(this.arms,elbow,wrist,4.1,2.5,silver);
   this.ring(this.arms,wrist,[3,0,0],[0,4,0],silver,1,.95);for(let i=0;i<5;i++)this.line(this.arms,[[wrist[0]+side*(i-2),wrist[1],wrist[2]],[wrist[0]+side*(i-2)*1.7,wrist[1]+7-i*.5,wrist[2]+1]],silver,1,.95);
  }this.arms.end();
 }
 private extras(t:number){
  const b=this.dancers;b.begin();
  for(let i=0;i<4;i++){
   const side=i<2?-1:1,x=side*(i%2?145:94)+Math.sin(t*1.1+i)*10,z=-76-(i%2)*90,y=128+Math.sin(t*2.2+i)*7,c=i%2?'#ec5c8e':silver;
   const p=(a:number,h:number,d:number):P=>[x+a,y+h,z+d];
   this.tube(b,p(0,-5,0),p(0,-66,0),17,13,c);this.tube(b,p(0,12,0),p(Math.sin(t*.9+i)*10,79,0),13,8,c);
   // Large checkerboard panels and striped red partners echo the eccentric costumes.
   for(let row=0;row<13;row++)for(let col=0;col<4;col++){
    const yy=-60+row*10,xx=-13+col*7,colour=i%2?(col%2?'#802d65':'#f17da8'):(row+col)%2?'#374965':silver;
    this.line(b,[p(xx,yy,14),p(xx+6,yy,14),p(xx+6,yy+8,14),p(xx,yy+8,14)],colour,1,.8,true);
   }
   for(const s of [-1,1]){const wave=Math.sin(t*2+i+s);this.tube(b,p(s*15,-9,0),p(s*30,-21,5),4,3,c);this.tube(b,p(s*30,-21,5),p(s*(34+wave*8),5+wave*22,8),3,2,c);this.tube(b,p(s*8,-64,0),[x+s*(16+Math.sin(t*2+i)*5),3,z+8],6,4,c);}
   this.ring(b,p(0,2,12),[5,0,0],[0,7,0],'#1a2540',1,.9);
  }b.end();
  const a=this.audience;a.begin();for(let row=0;row<3;row++)for(let i=0;i<14;i++){
   const x=(i-6.5)*39+(row%2)*12,z=218+row*41,y=58+Math.sin(t*2+i+row)*3,col=i%4?'#467694':'#a5729e';
   this.ring(a,[x,y,z],[7,0,0],[0,10,0],col,1,.8);this.tube(a,[x,y-11,z],[x,y-42,z],12,10,col,.6);
   for(const side of [-1,1]){const wave=.5+.5*Math.sin(t*3.2+i+row*.7),hand:P=[x+side*(12+wave*10),y+10+22*wave,z-8];this.line(a,[[x+side*12,y-14,z],[x+side*20,y-1,z-5],hand],col,1.3,.8);for(let j=0;j<3;j++)this.line(a,[hand,[hand[0]+(j-1)*2,hand[1]+5,hand[2]]],silver,.85,.5);}
  }a.end();
 }
 private lighting(t:number){
  for(const [i,m]of this.discs.entries()){m.material.opacity=.5+.28*(.5+.5*Math.sin(t*3.2+i*.71));}
  this.lights.begin();for(let i=0;i<8;i++){const x=-245+i*70,tip:P=[x+Math.sin(t*.5+i)*100,12,40+Math.cos(t*.4+i)*90];for(const dx of [-9,0,9])this.line(this.lights,[[x,310,-220],[tip[0]+dx,tip[1],tip[2]]],i%3?'#5c96e9':'#d3dcea',1,.18);}
  this.lights.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.all.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=vitasPose(t),c=vitasCamera(view,this.width/this.height,t);
  if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  this.singer.position.set(0,140+p.bounce*1.5,55);this.singer.rotation.set(p.lean,p.turn,.035*Math.sin(t*2.1));this.head.scene.rotation.set(-.08*p.raise,-Math.PI/2+.05*Math.sin(t*.7),-.08*p.chorus);
  this.body(p);this.extras(t);this.lighting(t);const message=this.track.message(this.track.indexAt(t)),tele=playing?message:null;
  this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();const artic=VoiceModel.articFromArray(message.t.artic);this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.crown.group.removeFromParent();this.head.dispose();this.all.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
