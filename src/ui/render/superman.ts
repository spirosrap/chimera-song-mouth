import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {supermanPose,supermanCamera,type SupermanId,type SupermanPoint as P} from '../../scene/superman.ts';
const TAU=2*Math.PI;
/** The supplied video's sparse performance, circular projection and enlarged hand shadows. */
export class SupermanStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,5000);
 readonly performer=new THREE.Group();readonly head=new Anatomy3D();readonly pulseHead=new Anatomy3D();
 readonly circle=new THREE.Group();readonly shadow=new THREE.Group();readonly silhouette=new THREE.Group();readonly glove=new THREE.Group();
 readonly hair=new Beams();readonly clothes=new Beams();readonly arms=new Beams();readonly keyboard=new Beams();readonly particles=new Beams();
 private beams=[this.hair,this.clothes,this.arms,this.keyboard,this.particles];private meshes:THREE.Mesh[]=[];
 private shadowFingers:THREE.Mesh[]=[];private gloveFingers:THREE.Mesh[]=[];private backdrop:THREE.Mesh;private shadowMask:THREE.Mesh;private halo:THREE.Mesh;private projection:THREE.Mesh;private mouthLight:THREE.Mesh;
 private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 private lead:{model:VoiceModel;track:TeleTrack};private pulse:{model:VoiceModel;track:TeleTrack};
 constructor(cast:{id:SupermanId;model:VoiceModel;track:TeleTrack}[]){
  const lead=cast.find(c=>c.id==='laurie'),pulse=cast.find(c=>c.id==='superman-pulse');if(!lead||!pulse)throw Error('The lead and repeated physical pulse are required.');this.lead=lead;this.pulse=pulse;
  this.scene.background=new THREE.Color('#020204');this.scene.add(this.performer,this.circle,this.silhouette,this.keyboard.group,this.particles.group);
  this.head.centred=true;this.head.scene.rotation.y=-Math.PI/2;this.head.attachAccessory(this.hair.group);this.performer.add(this.head.scene,this.clothes.group,this.arms.group,this.glove);
  this.pulseHead.centred=true;this.pulseHead.scene.rotation.y=-Math.PI/2;this.pulseHead.scene.position.set(0,-10,8);this.pulseHead.scene.scale.setScalar(2.5);this.circle.add(this.pulseHead.scene);
  this.backdrop=this.mesh(this.scene,new THREE.PlaneGeometry(1600,1100),'#020204',[0,160,-160]);
  this.halo=this.mesh(this.circle,new THREE.CircleGeometry(96,96),'#63313f',[0,0,-.8]);
  const disk=new THREE.CircleGeometry(90,96),pos=disk.getAttribute('position'),colors=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){const r=Math.min(1,Math.hypot(pos.getX(i),pos.getY(i))/90),c=new THREE.Color('#f2f0eb').lerp(new THREE.Color('#a6a7c8'),r*.45);colors.set([c.r,c.g,c.b],i*3);}disk.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const light=this.projection=this.mesh(this.circle,disk,'#ffffff',[0,0,0]);(light.material as THREE.MeshBasicMaterial).vertexColors=true;this.circle.add(this.shadow);
  this.buildHand(this.shadow,this.shadowFingers,'#6c1823',1);this.buildHand(this.glove,this.gloveFingers,'#e9f2ff',.15);
  const mask=new THREE.Shape();mask.moveTo(-600,-600);mask.lineTo(600,-600);mask.lineTo(600,600);mask.lineTo(-600,600);mask.closePath();const hole=new THREE.Path();hole.absarc(0,0,96,0,TAU,true);mask.holes.push(hole);this.shadowMask=this.mesh(this.circle,new THREE.ShapeGeometry(mask,96),'#020204',[0,0,8]);
  this.mouthLight=this.mesh(this.performer,new THREE.SphereGeometry(1,16,12),'#ff632d',[0,2,14],[3.8,1.3,1.2]);
  this.costume();this.makeSilhouette();this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private mesh(parent:THREE.Object3D,g:THREE.BufferGeometry,color:string,p:P,s:P=[1,1,1]){const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(...p);m.scale.set(...s);parent.add(m);this.meshes.push(m);return m;}
 private line(b:Beams,p:P[],color:string,width=1,alpha=.8,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.8){this.line(b,Array.from({length:32},(_,i)=>{const a=i/32*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private tube(b:Beams,a:P,c:P,r:number,color:string){const axis=new THREE.Vector3(...c).sub(new THREE.Vector3(...a)).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=axis.clone().cross(u);for(let k=0;k<8;k++){const ang=k/8*TAU,d=u.clone().multiplyScalar(Math.cos(ang)*r).addScaledVector(v,Math.sin(ang)*r);this.line(b,[new THREE.Vector3(...a).add(d).toArray() as P,new THREE.Vector3(...c).add(d).toArray() as P],color,1,.85);}}
 private costume(){
  this.clothes.begin();const rings=[[-4,5,4],[-12,18,8],[-35,15,8],[-64,17,9]];
  for(const [y,x,z]of rings)this.ring(this.clothes,[0,y,0],[x,0,0],[0,0,z],'#536581',1,.85);
  for(let i=0;i<18;i++){const a=i/18*TAU;this.line(this.clothes,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),'#4a5c76',1,.75);}
  for(const side of [-1,1])this.line(this.clothes,[[side*4,-3,5],[side*11,-12,8],[side*5,-30,10],[0,-9,9]],'#a5acb6',1.5,.95);
  this.line(this.clothes,[[0,-8,10],[-2,-13,11],[0,-35,11],[2,-13,11],[0,-8,10]],'#bfc9db',1.3,.95);this.clothes.end();
  // Short, irregular spikes around the physical head, without covering its airway.
  this.hair.begin();for(let i=0;i<100;i++){const a=i*2.399963,z=(i%19-9)*.78,x=Math.cos(a)*Math.sqrt(Math.max(0,1-(z/8)**2))*8,y=19+5*Math.sqrt(Math.max(0,1-(x/9)**2-(z/9)**2));this.line(this.hair,[[x,y,z],[x*1.15-1,y+1+(i%5)*.4,z*1.1],[x*1.3-1.5,y+1.5+(i%7)*.4,z*1.25]],'#c4bca8',.85,.9);}this.hair.end();
 }
 private makeSilhouette(){
  const shape=new THREE.Shape();shape.moveTo(-13,-63);for(const p of [[-17,-25],[-23,-13],[-13,-5],[-6,-3],[-7,8],[-10,18],[-7,28],[0,32],[8,28],[11,17],[7,5],[6,-3],[15,-6],[23,-13],[17,-25],[13,-63]])shape.lineTo(...p as [number,number]);shape.closePath();this.mesh(this.silhouette,new THREE.ShapeGeometry(shape),'#050507',[0,0,0]);
  for(const side of [-1,1]){const arm=new THREE.Shape();arm.moveTo(side*17,-10);for(const p of [[side*33,-18],[side*43,4],[side*40,19],[side*35,18],[side*35,5],[side*29,-5],[side*20,0]])arm.lineTo(...p as [number,number]);arm.closePath();this.mesh(this.silhouette,new THREE.ShapeGeometry(arm),'#050507',[0,0,1]);}
 }
 private buildHand(parent:THREE.Group,out:THREE.Mesh[],color:string,scale:number){
  parent.scale.setScalar(scale);this.mesh(parent,new THREE.SphereGeometry(1,20,12),color,[-4,-3,2],[16,19,1]);
  const arm=this.mesh(parent,new THREE.BoxGeometry(22,70,1),color,[-9,-47,2]);arm.rotation.z=-.2;
  for(let i=0;i<5;i++){const finger=this.mesh(parent,new THREE.CapsuleGeometry(i===0?4.8:3.5,i===0?16:24,5,10),color,[0,0,3],[1,1,.3]);out.push(finger);}
 }
 private fingers(fingers:THREE.Mesh[],mode:number){
  for(let i=0;i<5;i++){const thumb=i===0,spread=mode===2?1.25:.7,extended=mode===0?false:mode===1?i<2:mode===2?true:i===1||i===2;
   const x=thumb?-17:-13+(i-1)*8.3;fingers[i].position.set(x*(extended?spread:.9),thumb?0:extended?23+(i===2?3:0):8,3);fingers[i].rotation.z=thumb?-.95:(i-2.2)*-.12*spread;fingers[i].scale.y=extended?1:.35;
  }
 }
 private movement(p:ReturnType<typeof supermanPose>){
  this.arms.begin();for(const side of [-1,1]){const raised=side===1?p.lift:0,w:P=[side*(21+13*raised),-48+68*raised,10],elbow:P=[side*(24+6*raised),-30+20*raised,3];this.tube(this.arms,[side*18,-12,0],elbow,4,'#667d9d');this.tube(this.arms,elbow,w,3,side===1?'#80a8de':'#667d9d');if(side===1){this.glove.position.set(...w);this.glove.rotation.z=p.handAngle;}}
  this.arms.end();this.fingers(this.gloveFingers,p.mode);this.glove.visible=p.hand||p.inset;
  this.shadow.visible=p.hand||p.handOnly;this.shadow.rotation.z=p.handAngle;this.shadow.position.set(-12,-4,2);this.shadow.scale.setScalar(p.handOnly?1.3:1.15);this.fingers(this.shadowFingers,p.mode);
  this.keyboard.begin();for(const z of [23,51])this.line(this.keyboard,[[p.position[0]-54,43,z],[p.position[0]+54,43,z]],'#c1cee2',1.3,.85);
  for(let i=0;i<=36;i++){const x=p.position[0]-54+i*3;this.line(this.keyboard,[[x,43,27],[x,43,49]],i%7===1||i%7===2||i%7===4||i%7===5||i%7===6?'#68768a':'#d0d6e2',1.3,.85);}for(const side of [-1,1])this.line(this.keyboard,[[p.position[0]+side*50,43,42],[p.position[0]+side*33,-4,39]],'#63748e',1.3,.8);this.keyboard.end();this.keyboard.group.visible=p.keyboard;
  this.particles.begin();if(p.abstract)for(let i=0;i<65;i++){const a=i*2.399963+p.t*.12,r=105+(i%11)*4,y=130+Math.sin(a)*r;this.line(this.particles,[[Math.cos(a)*r,y,-75],[Math.cos(a)*r+Math.sin(i)*2,y+3+(i%5),-75]],'#dceaf0',1.3,.8);}this.particles.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.pulseHead.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.lead.track.duration,Number.isFinite(time)?time:0)),p=supermanPose(t),c=supermanCamera(view,this.width/this.height,t);
  if(this.epoch!==epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25){this.head.resetMotion();this.pulseHead.resetMotion();}const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const col=new THREE.Color(p.blue?'#438cbe':p.red||view==='superman-silhouette'?'#8e201a':'#020204').multiplyScalar(p.fade);this.scene.background=col;(this.backdrop.material as THREE.MeshBasicMaterial).color.copy(col);(this.shadowMask.material as THREE.MeshBasicMaterial).color.copy(col);
  this.performer.position.set(...p.position);const manualLead=view==='laurie'||view==='superman-profile'||view==='superman-keyboard';this.performer.visible=(p.performer&&!p.silhouette||manualLead)&&view!=='superman-silhouette';this.performer.scale.setScalar(p.inset?.6:1.6);this.performer.rotation.x=p.bow;
  this.head.scene.rotation.set(0,-Math.PI/2+p.turn,0);this.silhouette.visible=!manualLead&&(p.silhouette||view==='superman-silhouette');this.silhouette.position.set(0,106,25);this.silhouette.scale.setScalar(2.1);
  this.circle.visible=p.circle||view==='superman-pulse'||view==='superman-circle'||view==='superman-hands';this.circle.position.set(...p.circlePosition);this.circle.rotation.y=p.abstract?Math.sin((p.t-263)*.065)*1.5:0;
  const pulse=this.pulse.track.message(this.pulse.track.indexAt(t)),energy=Math.min(1,pulse.t.outRms*7);this.halo.scale.setScalar(1+.012*energy);(this.halo.material as THREE.MeshBasicMaterial).color.set(p.red?'#b43936':'#674459').multiplyScalar(p.fade);
  (this.projection.material as THREE.MeshBasicMaterial).color.setRGB(p.fade,p.fade,p.fade);this.shadow.traverse(o=>{if(o instanceof THREE.Mesh)(o.material as THREE.MeshBasicMaterial).color.set('#6c1823').multiplyScalar(p.fade);});
  this.movement(p);if(view==='superman-keyboard')this.keyboard.group.visible=true;this.pulseHead.scene.visible=view==='superman-pulse';if(view==='superman-pulse')this.shadow.visible=false;if(view==='superman-hands')this.shadow.visible=true;
  const lead=this.lead.track.message(this.lead.track.indexAt(t));this.mouthLight.visible=p.darkFace;this.mouthLight.scale.set(3.8,1+Math.min(2,lead.t.outRms*8),1.2);
  this.scene.updateMatrixWorld(true);
  for(const [head,voice,message]of [[this.head,this.lead,lead],[this.pulseHead,this.pulse,pulse]] as const){if(!head.scene.visible||head===this.head&&!this.performer.visible)continue;head.camera.copy(this.camera);head.camera.updateMatrixWorld();const tele=playing?message:null;head.face.update(tele,dt);const artic=VoiceModel.articFromArray(message.t.artic);head.update(voice.model,voice.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.pulseHead.dispose();for(const b of this.beams)b.dispose();for(const m of this.meshes){m.geometry.dispose();(m.material as THREE.Material).dispose();}}
}
