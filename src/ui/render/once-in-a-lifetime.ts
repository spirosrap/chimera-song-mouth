import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {lifetimePose,lifetimeCamera,type LifetimePoint as P} from '../../scene/once-in-a-lifetime.ts';
const TAU=Math.PI*2,suit='#718491',shirt='#edf0dc',skin='#a8bcca';
type Figure={root:THREE.Group;body:THREE.Group;head:Anatomy3D;hair:Beams;clothes:Beams;limbs:Beams;coat:THREE.Mesh;shirt:THREE.Mesh};
/** Borrowed model shared by the foreground singer and four video-feedback copies. */
export class LifetimeStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,5000);
 readonly figures:Figure[]=[];readonly water=new Beams();readonly archive=new Beams();readonly waterPlane:THREE.Mesh;readonly archivePlane:THREE.Mesh;
 private beams:Beams[]=[];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 get head(){return this.figures[0].head;}get singer(){return this.figures[0].root;}
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#c3c8cc');this.waterPlane=this.plane(5000,5000,'#07363f',[0,100,-500]);this.archivePlane=this.plane(310,210,'#737d7c',[0,140,-220]);this.scene.add(this.water.group,this.archive.group);this.beams.push(this.water,this.archive);
  for(let i=0;i<5;i++)this.figures.push(this.figure());
  for(const b of this.beams){b.begin();b.end();}this.figures.forEach(f=>this.accessories(f));
  this.veil=this.plane(2,2,'#000000',[0,0,0]);const mat=this.veil.material as THREE.MeshBasicMaterial;mat.transparent=true;mat.depthTest=false;mat.depthWrite=false;mat.opacity=0;this.veil.renderOrder=1000;
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],c:string,w=1,a=.85,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.9){this.line(b,Array.from({length:22},(_,i)=>{const q=i/22*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q)) as P;}),col,w,a,true);}
 private plane(w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);this.scene.add(m);this.meshes.push(m);return m;}
 private figure():Figure{
  const root=new THREE.Group(),body=new THREE.Group(),head=new Anatomy3D(),hair=new Beams(),clothes=new Beams(),limbs=new Beams();head.centred=true;head.attachAccessory(hair.group);body.add(head.scene,clothes.group,limbs.group);root.add(body);this.scene.add(root);this.beams.push(hair,clothes,limbs);
  const coat=new THREE.Mesh(new THREE.CylinderGeometry(21,18,54,12),new THREE.MeshBasicMaterial({color:'#202a33'}));coat.position.y=-41;coat.scale.z=.51;body.add(coat);this.meshes.push(coat);
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(16,26),new THREE.MeshBasicMaterial({color:'#e4e7d5',side:THREE.DoubleSide}));panel.position.set(0,-18,11.6);body.add(panel);this.meshes.push(panel);
  return {root,body,head,hair,clothes,limbs,coat,shirt:panel};
 }
 private accessories(f:Figure){const b=f.hair;b.begin();
  // Anatomy faces local +X. Hair and browline spectacles turn with the head.
  for(let i=0;i<54;i++){const a=i/54*TAU,end=Math.cos(a)>.35?.9:1.75;this.line(b,Array.from({length:15},(_,j)=>{const q=.1+j/14*end,wave=Math.sin(j*.7+i)*.3;return [-2+(9.2+wave)*Math.sin(q)*Math.cos(a),16+9*Math.cos(q),(8.7+wave)*Math.sin(q)*Math.sin(a)] as P;}),i%4?'#273c48':'#617c89',1,.95);}
  for(const z of [-4.4,4.4]){
   this.line(b,[[8,14,z-3.7],[9.3,15,z-2.8],[9.7,15,z+2.9],[8.6,14,z+3.7],[8.5,10,z+3.1],[8.8,9.6,z-2.6],[8,14,z-3.7]],'#363635',1.7,1);
   this.line(b,[[8,14,z],[0,14,z>0?8:-8],[-5,12,z>0?8:-8]],'#545d5d',1.4,1);
  }this.line(b,[[9.6,13,-1],[10,13.4,0],[9.6,13,1]],'#b9c0ba',1.5,1);b.end();
 }
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const at=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>at(t,i/12*TAU)),c,.9,.9,true);for(let i=0;i<8;i++)this.line(b,[at(0,i/8*TAU),at(1,i/8*TAU)],c,.9,.9);
 }
 private dress(f:Figure,p:ReturnType<typeof lifetimePose>,copy:boolean){
  const b=f.clothes;b.begin();const c=p.shirt?shirt:suit;
  const levels=[[-3,6,5],[-15,23,11],[-39,20,10],[-68,18,10]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],c);for(let i=0;i<20;i++){const q=i/20*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),c);}
  for(const side of [-1,1]){this.line(b,[[side*6,-2,7],[side*12,-12,12],[side*3,-20,12]],shirt,1.4);if(!p.shirt){this.line(b,[[side*9,-8,12],[side*17,-22,12],[side*10,-28,12],[0,-44,12]],suit,1.5);this.line(b,[[0,-11,13],[side*7,-7,13],[side*8,-16,13],[0,-12,13]],'#c4c9bb',1.4,1,true);}}
  if(!p.shirt)this.line(b,[[9,-28,12],[17,-26,12],[18,-29,12],[9,-30,12]],shirt,1.6,1,true);
  for(let y=-35;y>-66;y-=10)this.ring(b,[0,y,11.5],[1,0,0],[0,1,0],shirt,.9);b.end();
  (f.coat.material as THREE.MeshBasicMaterial).color.set(p.shirt?'#acb6b2':'#202a33');
  const l=f.limbs;l.begin();const beat=p.beat+(copy?.18:0);const step=Math.sin(beat*Math.PI),crouch=p.crouch+(copy&&p.copies?.12*(1-Math.cos(beat*Math.PI*2)):0);
  for(const side of [-1,1]){
   const knee:P=[side*(14+14*crouch),-104+40*crouch,12+33*crouch+step*side*5],ankle:P=[side*(17+22*crouch),-148+50*crouch,5+step*side*8];
   this.tube(l,[side*10,-66,0],knee,8.5,6,suit);this.tube(l,knee,ankle,6,4.5,suit);this.tube(l,ankle,[ankle[0]+side*3,ankle[1],ankle[2]+16],5,5,'#43515b');
   let hand:P=[side*(27+4*step),-62+6*step*side,15],elbow:P=[side*29,-36,5];
   if(p.chop>.05){hand=[side>0?18:side*38,side>0?-42:1+24*step,22];elbow=[side*33,-29,12];}
   if(p.copies||p.hands>.05){hand=[side*(25+14*step),-20+38*p.hands+15*step,25];elbow=[side*39,-27+17*p.hands,9];}
   if(crouch>.1){hand=[side*22,-66+24*crouch,42];elbow=[side*33,-34,24];}
   if(p.temple>.1&&side>0){hand=[15,13,11];elbow=[42,-5,5];}
   if(p.bow>.1){hand=[side*15,-72,20];elbow=[side*24,-43,10];}
   if(p.float>.1){hand=[side*(66+8*step),-12+30*step*side,9];elbow=[side*42,-21+12*step*side,1];}
   this.tube(l,[side*23,-15,0],elbow,6,4.5,c);this.tube(l,elbow,hand,4.5,2.6,c);this.ring(l,hand,[3,0,0],[0,0,3],shirt,1.3);for(let i=0;i<5;i++)this.line(l,[[hand[0]+side*(i-2)*1.2,hand[1],hand[2]],[hand[0]+side*(i-2)*2,hand[1]+8-i*.45,hand[2]+1]],skin,1.25);
  }l.end();
 }
 private background(p:ReturnType<typeof lifetimePose>,view:CameraView){
  const wet=view==='lifetime-water'||p.water,archive=view==='lifetime-archive'||p.archive;
  this.scene.background=new THREE.Color(p.shirt?'#030609':wet?'#07363f':'#c3c8cc');this.waterPlane.visible=wet;this.water.group.visible=wet;this.archivePlane.visible=archive;this.archive.group.visible=archive;
  this.water.begin();if(wet)for(let i=0;i<100;i++){const y=-260+i*8;this.line(this.water,Array.from({length:95},(_,j)=>{const x=-800+j*17;return [x,y+6*Math.sin(x*.035+p.t*1.4+i*.71)+3*Math.sin(x*.11-p.t*.4),-490+1.6*Math.sin(i+j*.5)] as P;}),i%3===0?'#4c9790':i%3===1?'#147a9c':'#233e8a',1.4,.75);}this.water.end();
  this.archive.begin();if(archive){for(let i=0;i<9;i++){const x=(i-4)*33,y=130+(i%2)*15,q=p.t*2+i;this.ring(this.archive,[x,y+40,-213],[6,0,0],[0,8,0],'#d3d7cc');this.line(this.archive,[[x,y+32,-213],[x+4*Math.sin(q),y+6,-213],[x-9,y-18,-213],[x-18,y-28,-213]],'#313e40',3);this.line(this.archive,[[x,y+6,-213],[x+13,y-15,-213],[x+19,y-25,-213]],'#313e40',3);for(const side of [-1,1])this.line(this.archive,[[x,y+24,-213],[x+side*14,y+16,-213],[x+side*20,y+30+Math.sin(q)*9,-213]],'#3c4a4b',3);}for(let i=0;i<22;i++){const x=-150+i*14;this.line(this.archive,[[x,44,-216],[x+10,180,-216],[x-4,237,-216]],'#a0aaa1',.8,.55);}}this.archive.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.figures.forEach(f=>f.head.resize(w,h));this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=lifetimePose(t),c=lifetimeCamera(view,this.width/this.height,t),copies=view==='lifetime-copies'||p.copies;
  const reset=this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25,dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.background(p,view);
  const message=this.track.message(this.track.indexAt(t)),artic=VoiceModel.articFromArray(message.t.artic),frame=this.model.frame(artic),tele=playing?message:null;
  for(const [i,f]of this.figures.entries()){
   if(reset)f.head.resetMotion();const copy=i>0;f.root.visible=p.visible&&(!copy||copies);if(!f.root.visible)continue;
   const floating=p.float>.5&&!copy&&view!=='lifetime-singer',small=floating&&(t<22||t>213),scale=copy?.55:small?.24:1;
   f.root.scale.setScalar(scale);f.root.position.set(copy?(i-2.5)*110:floating?Math.sin(t*.42)*40:0,copy?150:small?130+Math.cos(t*.4)*25:150-p.crouch*50-p.bow*22,copy?-120:45);
   f.root.rotation.set(floating?Math.sin(t*.41)*.2:0,copy&&t<69?.55:Math.sin(t*.3)*.035,floating?Math.sin(t*.56)*.8:Math.sin(p.beat*Math.PI)*.025);
   f.body.rotation.x=p.bow*.84-p.backward*.27;f.head.scene.rotation.set(p.bow*.13-p.backward*.32,-Math.PI/2+Math.sin(t*.4)*.09,p.temple*.08);this.dress(f,p,copy);
  }
  this.scene.updateMatrixWorld(true);for(const f of this.figures)if(f.root.visible){f.head.camera.copy(this.camera);f.head.camera.updateMatrixWorld();f.head.face.update(tele,dt);f.head.update(this.model,frame,artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const f of this.figures){f.hair.group.removeFromParent();f.head.dispose();}this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
