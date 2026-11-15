import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {PLAYER_PEOPLE,playerPose,playerCamera,type PlayerId,type PlayerPoint as P} from '../../scene/player-baby-come-back.ts';
export type {PlayerId} from '../../scene/player-baby-come-back.ts';
type Feed={id:PlayerId;model:VoiceModel;track:TeleTrack};
type Actor={root:THREE.Group;head:Anatomy3D;hair:Beams;detail:Beams;limbs:THREE.Mesh[];hands:THREE.Mesh[];instrument:THREE.Group;index:number;feed:Feed};
const TAU=Math.PI*2,skin='#d2b5a2',chrome='#b6c4c9';
/** Five band members borrow four retained singers; the drummer remains vocally silent. */
export class PlayerStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(33,4/3,1,7000);readonly actors:Actor[]=[];readonly keyboard=new THREE.Group();readonly drumKit=new THREE.Group();readonly cymbals:THREE.Mesh[]=[];readonly sticks:THREE.Mesh[]=[];readonly amps=new THREE.Group();
 private meshes:THREE.Mesh[]=[];private beams:Beams[]=[];private width=1280;private height=720;private last:number|null=null;private epoch=-1;private bars:THREE.Mesh[]=[];private veil:THREE.Mesh;
 constructor(readonly feeds:Feed[]){
  if(feeds.length!==4||PLAYER_PEOPLE.slice(0,4).some(p=>!feeds.some(f=>f.id===p.id)))throw Error('Baby Come Back needs four retained singing feeds.');
  this.scene.background=new THREE.Color('#030404');this.scene.add(this.keyboard,this.drumKit,this.amps);this.environment();this.buildKeys();this.buildDrums();
  for(const [index,person]of PLAYER_PEOPLE.entries()){
   const root=new THREE.Group(),head=new Anatomy3D(),hair=new Beams(),detail=new Beams(),instrument=new THREE.Group(),feed=feeds.find(f=>f.id===person.id)??feeds[0];
   head.centred=true;head.attachAccessory(hair.group);root.add(head.scene,detail.group,instrument);root.position.set(person.position[0],person.position[1],person.position[2]);this.scene.add(root);this.beams.push(hair,detail);
   const torso=this.mesh(root,new THREE.CylinderGeometry(21,20,62,24),[0,-38,0],person.colour);torso.scale.z=.55;
   if(index===0||index===4){this.box(root,31,60,3,'#17171b',[0,-38,12]);for(const s of [-1,1]){const lapel=this.box(root,4,53,3,'#bbb0a0',[s*16,-34,14]);lapel.rotation.z=s*-.13;}for(let j=0;j<5;j++)this.oval(root,[3,-14-j*9,15],[1,1,1],'#c5b9a5');}
   if(index===2){for(const s of [-1,1]){const lapel=this.box(root,8,30,2,'#f7edda',[s*9,-22,13]);lapel.rotation.z=s*.28;}this.box(root,10,38,3,'#a8775f',[0,-29,13]);}
   const limbs=Array.from({length:8},(_,i)=>this.mesh(root,new THREE.CylinderGeometry(1,1,1,12),[0,0,0],i<4?index===4?skin:person.colour:index===0?'#cfdbdd':index===1?'#a5282d':index===2?'#e3ded2':'#243644'));
   const hands=[-1,1].map(()=>this.oval(root,[0,0,0],[4,6,2.8],skin));this.actors.push({root,head,hair,detail,limbs,hands,instrument,index,feed});
   if(index<3){this.guitar(instrument,index===1);const strap=this.box(root,4,100,2,index===0?'#a35c49':'#3d3431',[2,-41,17]);strap.rotation.z=-.45;}
   if(index!==4)this.microphone([person.position[0]+8,person.position[1]+11,person.position[2]+33],index===3);
  }
  for(let i=0;i<2;i++){const b=this.plane(this.scene,2,2,'#000000',[0,0,0]);b.renderOrder=999;(b.material as THREE.MeshBasicMaterial).depthTest=false;(b.material as THREE.MeshBasicMaterial).depthWrite=false;this.bars.push(b);}
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);this.veil.renderOrder=1000;const mat=this.veil.material as THREE.MeshBasicMaterial;mat.transparent=true;mat.depthTest=false;mat.depthWrite=false;for(const ink of this.beams)for(const o of ink.group.children){const mat=(o as THREE.Mesh).material as THREE.Material;mat.depthTest=true;}this.resize(1280,720);this.frame(0,false,0,'player-keyboard',0);
 }
 private mesh(parent:THREE.Object3D,geo:THREE.BufferGeometry,p:P,col:string){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private box(parent:THREE.Object3D,w:number,h:number,d:number,col:string,p:P){return this.mesh(parent,new THREE.BoxGeometry(w,h,d),p,col);}
 private plane(parent:THREE.Object3D,w:number,h:number,col:string,p:P){return this.mesh(parent,new THREE.PlaneGeometry(w,h,12,12),p,col);}
 private oval(parent:THREE.Object3D,p:P,scale:P,col:string){const m=this.mesh(parent,new THREE.SphereGeometry(1,20,14),p,col);m.scale.set(...scale);return m;}
 private segment(m:THREE.Mesh,a:P,b:P,r:number){const x=new THREE.Vector3(...a),y=new THREE.Vector3(...b),d=y.clone().sub(x);m.position.copy(x).lerp(y,.5);m.scale.set(r,d.length(),r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 private tube(parent:THREE.Object3D,a:P,b:P,r:number,col:string){const m=this.mesh(parent,new THREE.CylinderGeometry(1,1,1,12),[0,0,0],col);this.segment(m,a,b,r);return m;}
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,p:P[],col=chrome,w=1,alpha=.8,close=false){b.line(p.flat(),p.length,col,w,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,col=chrome,w=1,alpha=.8){this.line(b,Array.from({length:40},(_,i)=>{const q=i/40*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q))as P;}),col,w,alpha,true);}
 private environment(){
  const floor=this.plane(this.scene,820,700,'#738a9b',[0,-3,-40]);floor.rotation.x=-Math.PI/2;this.box(this.scene,820,12,700,'#2a3a43',[0,-12,-40]);const riser=this.box(this.scene,250,24,190,'#9ca4a1',[10,5,-200]);riser.name='drum-riser';
  const b=this.ink(this.amps);for(let i=0;i<6;i++){const x=-300+i*118;this.box(this.amps,108,130,58,'#141516',[x,67,-290]);this.box(this.amps,101,113,2,'#26292a',[x,67,-260]);this.box(this.amps,108,33,52,'#111517',[x,150,-290]);this.line(b,[[x-42,111,-258],[x+42,111,-258]],'#b3aa99',1.2,.8);for(let j=0;j<8;j++)this.oval(this.amps,[x-38+j*10,151,-262],[1,1,1],'#d8b979');for(const y of [36,88])this.ring(b,[x,y,-257],[23,0,0],[0,23,0],'#424849',1,.5);for(let j=0;j<18;j++)this.line(b,[[x-48,13+j*6,-258],[x+48,13+j*6,-258]],'#616363',.6,.25);}
  for(let i=0;i<5;i++){const x=-215+i*106;this.box(this.scene,51,21,37,'#232829',[x,8,172]);this.line(b,[[x-20,19,185],[x+20,19,185]],'#8e9997',1,.6);}
  for(let i=0;i<6;i++){const x=-260+i*98;this.line(b,Array.from({length:27},(_,j)=>[x+Math.sin(j*.16+i)*23,.2,150-j*15]as P),'#242e32',1.1,.8);}b.end();
 }
 private microphone(p:P,keys:boolean){const b=this.ink(this.scene);this.tube(this.scene,[p[0]+28,1,p[2]+10],[p[0]+28,p[1]-10,p[2]+10],1.1,chrome);this.tube(this.scene,[p[0]+28,p[1]-10,p[2]+10],p,1.1,chrome);for(let i=0;i<3;i++){const q=i*TAU/3;this.tube(this.scene,[p[0]+28,2,p[2]+10],[p[0]+28+Math.cos(q)*23,1,p[2]+10+Math.sin(q)*23],1,'#667378');}const mic=this.mesh(this.scene,new THREE.CylinderGeometry(3,3,16,20),p,'#c7d5cf');mic.rotation.x=Math.PI/2;this.line(b,[p,[p[0]+20,p[1]-40,p[2]+5],[p[0]+28,3,p[2]+10],[p[0]+40,0,p[2]+60]],'#151c20',1.2,.9);b.end();mic.name=keys?'keyboard-microphone':'front-microphone';}
 private guitar(parent:THREE.Group,bass:boolean){
  parent.position.set(7,-64,19);parent.rotation.z=-1.03;this.oval(parent,[0,0,0],[18,24,4],bass?'#542b1c':'#161a1b');this.oval(parent,[-11,15,0],[10,14,4],bass?'#6e3520':'#151b1d');this.oval(parent,[11,15,0],[10,14,4],bass?'#61301e':'#151b1d');this.box(parent,7,bass?94:80,3,'#3b2e22',[0,53,1]);this.box(parent,bass?13:11,20,4,'#907253',[0,bass?105:96,1]);const b=this.ink(parent);for(let i=0;i<(bass?4:6);i++){const x=(i-(bass?1.5:2.5))*.8;this.line(b,[[x,-17,4.3],[x,107,3.1]],'#b7b7a9',.55,.9);}for(let y=20;y<90;y+=6)this.line(b,[[-3.5,y,3],[3.5,y,3]],'#a5a69b',.6,.8);for(const y of [-7,7])this.box(parent,11,4,2,'#adb3ae',[0,y,4]);for(const x of [-1,1])for(let i=0;i<3;i++)this.oval(parent,[x*7,94+i*5,1],[2,1,1],chrome);this.ring(b,[0,0,3.5],[17,0,0],[0,23,0],'#b4a17c',.8,.65);b.end();
 }
 private buildKeys(){
  const g=this.keyboard;g.position.set(-145,0,-75);const b=this.ink(g);for(const [row,y,z]of [[0,87,0],[1,111,-18]]){this.box(g,140,9,40,'#322c25',[0,y,z]);for(let j=0;j<42;j++){this.box(g,3.1,2,26,'#d2dcda',[-67+j*3.2,y+5,z+7]);if(![2,6].includes(j%7))this.box(g,1.6,3.2,14,'#171c20',[-65.5+j*3.2,y+7,z]);}for(let j=0;j<17;j++)this.oval(g,[-59+j*7.2,y+6,z-14],[1.4,1,1.3],j%3?'#beb9a2':'#b33228');for(const x of [-58,58])this.tube(g,[x,2,0],[x,y-5,z-8],2,'#747b7d');this.line(b,[[-65,y+1,z+19],[65,y+1,z+19]],'#e0d7bb',1,.9);if(row)this.box(g,115,4,3,'#898f8f',[0,y-18,z-4]);}this.box(g,50,5,35,'#252d30',[0,65,-58]);for(const x of [-20,20])this.tube(g,[x,0,-58],[x,63,-58],2,'#788382');b.end();
 }
 private buildDrums(){
  const g=this.drumKit;g.position.set(-30,12,-165);const b=this.ink(g);const kick=this.mesh(g,new THREE.CylinderGeometry(35,35,46,48),[0,37,0],'#9a805f');kick.rotation.x=Math.PI/2;this.mesh(g,new THREE.CircleGeometry(34,48),[0,37,24],'#d6ddd8');this.ring(b,[0,37,24.5],[35,0,0],[0,35,0],chrome,2,1);for(const [x,y,z,r]of [[-38,74,-22,22],[21,88,-27,22],[58,42,-51,27],[-53,60,20,23]]){this.mesh(g,new THREE.CylinderGeometry(r,r,25,40),[x,y,z],'#9b805d');const top=this.mesh(g,new THREE.CircleGeometry(r,40),[x,y+13,z],'#c8d0ca');top.rotation.x=-Math.PI/2;this.ring(b,[x,y+13.5,z],[r,0,0],[0,0,r],chrome,1.5,1);this.tube(g,[x,1,z],[x,y-13,z],2,chrome);for(let j=0;j<8;j++){const q=j*TAU/8;this.tube(g,[x+Math.cos(q)*r,y-10,z+Math.sin(q)*r],[x+Math.cos(q)*r,y+11,z+Math.sin(q)*r],.75,chrome);}}
  for(const [x,y,z,r]of [[-86,132,-19,39],[73,135,-33,39],[-72,91,36,25],[25,157,-80,32]]){this.tube(g,[x,0,z],[x,y,z],1.3,chrome);const cym=this.mesh(g,new THREE.ConeGeometry(r,5,56,1,true),[x,y,z],'#b2a27b');cym.name='cymbal';this.cymbals.push(cym);this.oval(g,[x,y+3,z],[7,2,7],'#a59265');for(let j=0;j<3;j++){const q=j*TAU/3;this.tube(g,[x,21,z],[x+Math.cos(q)*20,0,z+Math.sin(q)*20],1.1,chrome);}}for(let j=0;j<2;j++)this.sticks.push(this.mesh(this.scene,new THREE.CylinderGeometry(1,1,1,10),[0,0,0],'#e3c79b'));b.end();
 }
 private animateActor(a:Actor,p:ReturnType<typeof playerPose>){
  const {index:i,root,detail:b,hair:h}=a,person=PLAYER_PEOPLE[i],seated=i>=3,drum=i===4;root.position.set(person.position[0],person.position[1],person.position[2]);root.rotation.y=i===2?-.12:i===1?.1:0;root.position.y+=seated?0:Math.sin(p.phase*.5+i)*.8;
  h.begin();const blond=i===4;for(let k=0;k<83;k++){const q=k/83*TAU,front=Math.cos(q)>.47;this.line(h,Array.from({length:22},(_,j)=>{const t=j/21,r=.02+t*(front?1.17:2.53),wobble=Math.sin(t*16+k*.5)*(i===2?.7:.22);return[-1+9.2*Math.sin(r)*Math.cos(q)+wobble,16+10.4*Math.cos(r)-(front?0:t*t*4),8.9*Math.sin(r)*Math.sin(q)]as P;}),blond?k%4?'#9e8b64':'#cebb8d':k%5?'#342f2d':'#766758',1.1,.97);}h.end();
  b.begin();const hands:P[]=drum?[[-30,-39,32],[37,-28,23]]:i===3?[[-32,-39+Math.sin(p.phase*2)*2,50],[29,-39+Math.sin(p.phase*2+.6)*2,50]]:[[-3,-69+Math.sin(p.phase*2)*5,25],[56,-40,24]];
  for(const [j,s]of [-1,1].entries()){
   if(drum){hands[j][1]+=Math.sin(p.phase*2+j*2)*15;hands[j][2]+=Math.cos(p.phase*2+j)*12;}
   const elbow:P=[s*30,-36,12],hand=hands[j];this.segment(a.limbs[j*2],[s*20,-15,0],elbow,6);this.segment(a.limbs[j*2+1],elbow,hand,4.5);a.hands[j].position.set(...hand);for(let k=0;k<4;k++)this.line(b,[[hand[0]+(k-1.5)*1.8,hand[1],hand[2]+2],[hand[0]+(k-1.5)*1.8,hand[1]-5+Math.sin(p.phase*2+k)*1.2,hand[2]+3]],skin,1,.95);
   const knee:P=seated?[s*24,-64,28]:[s*12,-107,0],foot:P=seated?[s*25,-person.position[1]+4,43]:[s*13,-person.position[1]+4,6];this.segment(a.limbs[4+j*2],[s*10,-68,0],knee,8);this.segment(a.limbs[5+j*2],knee,foot,6);this.line(b,[[foot[0]-4,foot[1],foot[2]+11],[foot[0]+4,foot[1],foot[2]+11]],'#cbd1c8',3,.8);
   if(drum){const world: P=[hand[0]+root.position.x,hand[1]+root.position.y,hand[2]+root.position.z];this.segment(this.sticks[j],world,[world[0]+s*15,world[1]-17+Math.sin(p.phase*2+j)*18,world[2]+21],.8);}
  }b.end();if(i<3){a.instrument.rotation.z=-1.03+Math.sin(p.phase*.5+i)*.015;a.instrument.position.y=-64+Math.sin(p.phase*.5+i)*.3;}
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.actors.forEach(a=>a.head.resize(w,h));this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const p=playerPose(time),c=playerCamera(view,this.width/this.height,p.t),reset=epoch!==this.epoch||this.last!==null&&Math.abs(p.t-this.last)>.25,dt=this.last===null?0:Math.min(.05,Math.max(0,p.t-this.last));this.last=p.t;this.epoch=epoch;this.camera.up.set(0,1,0);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  this.actors.forEach(a=>{this.animateActor(a,p);const msg=a.feed.track.message(a.feed.track.indexAt(a.index===4?0:p.t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing&&a.index!==4?msg:null;a.head.scene.rotation.set(Math.sin(p.phase*.5+a.index)*.025,-Math.PI/2+Math.sin(p.t*.4+a.index)*.045,Math.sin(p.t*.53+a.index)*.025);if(reset)a.head.resetMotion();this.scene.updateMatrixWorld(true);a.head.camera.copy(this.camera);a.head.camera.updateMatrixWorld();a.head.face.update(tele,dt);a.head.face.lid=Math.exp(-(((p.t%5.3-4.6)/.09)**2));a.head.face.brow=a.index===0?.16:.07;a.head.face.nod=0;a.head.face.tilt=0;a.head.update(a.feed.model,a.feed.model.frame(artic),artic,tele,{pressure:true,particles:false,grid:false,calipers:false},dt);});
  this.cymbals.forEach((m,i)=>{m.rotation.z=Math.sin(p.phase*2+i)*.014*(p.kick+.2);m.rotation.x=Math.sin(p.phase+i)*.015;});
  const dir=this.camera.getWorldDirection(new THREE.Vector3()),right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),hh=2*Math.tan(this.camera.fov*Math.PI/360)*1.5,ww=hh*this.camera.aspect,band=Math.max(0,(ww-hh*4/3)/2);this.bars.forEach((b,i)=>{b.visible=band>0;b.position.copy(this.camera.position).addScaledVector(dir,1.5).addScaledVector(right,(i?1:-1)*(ww/2-band/2));b.quaternion.copy(this.camera.quaternion);b.scale.set(band/2+.001,hh/2+.01,1);});this.veil.position.copy(this.camera.position).addScaledVector(dir,2);this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.actors.forEach(a=>{a.hair.group.removeFromParent();a.head.dispose();});this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
