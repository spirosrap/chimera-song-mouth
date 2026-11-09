import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId,CliffCharacterId} from '../../scene/scene.ts';
import {cliffActorPose,pursuerPose,ropeDrop,type Point3} from '../../scene/cliffs.ts';

/** A miniature fantasy film set. The three speaking heads are the actual airway renderer. */
export class Cliffs {
 readonly scene=new THREE.Scene();
 readonly camera=new THREE.PerspectiveCamera(43,16/9,1,9000);
 readonly actors:{id:CliffCharacterId;head:Anatomy3D;model:VoiceModel;track:TeleTrack;root:THREE.Group;arms:THREE.Group[]}[]=[];
 readonly pursuer=new THREE.Group();
 private readonly passenger=new THREE.Group();
 private readonly rope=new THREE.Group();
 private readonly knife=new THREE.Group();
 private readonly water:THREE.Mesh;
 private readonly mats=new Map<string,THREE.MeshLambertMaterial>();
 private epoch=-1;private width=1280;private height=720;
 constructor(characters:{id:CliffCharacterId;model:VoiceModel;track:TeleTrack}[]){
  this.scene.background=new THREE.Color('#465961');this.scene.fog=new THREE.Fog('#677b7f',1100,3900);
  this.scene.add(new THREE.AmbientLight('#b6cbd0',2.1));
  const sun=new THREE.DirectionalLight('#f6e7c0',3);sun.position.set(-330,750,650);this.scene.add(sun);
  const rim=new THREE.DirectionalLight('#6da3c3',1.1);rim.position.set(200,200,-300);this.scene.add(rim);
  this.water=this.landscape();
  for(const c of characters){
   const root=new THREE.Group();root.name=c.id;this.scene.add(root);
   const head=new Anatomy3D();head.centred=true;head.scene.rotation.y=-Math.PI/2;root.add(head.scene);
   const arms=this.costume(root,c.id);this.hair(root,c.id);
   if(c.id==='vizzini'){arms[1].add(this.knife);this.knife.position.set(0,-49,0);this.blade(this.knife);}
   this.actors.push({...c,head,root,arms});
  }
  this.silentFigure(this.pursuer,'#141d24',true);this.scene.add(this.pursuer);
  this.silentFigure(this.passenger,'#9b332f',false);this.passenger.scale.setScalar(.83);this.scene.add(this.passenger);
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private material(color:string){let m=this.mats.get(color);if(!m){m=new THREE.MeshLambertMaterial({color,flatShading:true});this.mats.set(color,m);}return m;}
 private mesh(parent:THREE.Object3D,g:THREE.BufferGeometry,at:Point3,color:string,wire=false){
  const m=new THREE.Mesh(g,this.material(color));m.position.set(...at);parent.add(m);
  if(wire)m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:'#aec6c8',transparent:true,opacity:.24})));
  return m;
 }
 private box(parent:THREE.Object3D,size:Point3,at:Point3,color:string,wire=false){return this.mesh(parent,new THREE.BoxGeometry(...size),at,color,wire);}
 private line(parent:THREE.Object3D,points:Point3[],color='#bdc6b2',opacity=.7){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(line);return line;}
 private cylinder(parent:THREE.Object3D,r1:number,r2:number,h:number,at:Point3,color:string,wire=false){return this.mesh(parent,new THREE.CylinderGeometry(r1,r2,h,10),at,color,wire);}
 private landscape(){
  const s=this.scene;
  this.box(s,[1050,1000,620],[0,-500,-305],'#46504b');
  // Faceted strata and cracks give the wall depth without photographs of the source film.
  for(let row=0;row<12;row++)for(let col=0;col<11;col++){
   const q=Math.sin(row*91+col*37),rock=this.box(s,[92+q*12,72+q*11,36+q*9],[-490+col*96+(row%2)*17,-45-row*81,-3+q*7],['#48534f','#53605a','#414c49','#596259'][(row*3+col)%4],true);rock.rotation.z=q*.05;
  }
  for(let i=0;i<17;i++){
   const x=Math.sin(i*13)*440,z=-65-Math.abs(Math.cos(i*7))*360;
   const rock=this.mesh(s,new THREE.IcosahedronGeometry(30+i%4*12,0),[x,14,z],i%3?'#697063':'#66734e',true);rock.scale.set(1.5,.8,1.1);
  }
  // Ruined walls frame the plateau, with an open arch and the path inland.
  for(const x of [-235,235])for(let row=0;row<5;row++)for(let col=0;col<3;col++)this.box(s,[44,31,37],[x+col*44,row*31+16,-260+(row%2)*5],'#555c50',true);
  for(const x of [-50,50])for(let row=0;row<5;row++)this.box(s,[28,31,26],[x,row*31+15,-430],'#596353',true);
  for(let i=0;i<9;i++){const a=i*Math.PI/8;const m=this.box(s,[25,27,28],[Math.cos(a)*50,145+Math.sin(a)*45,-430],'#626c5b',true);m.rotation.z=a-Math.PI/2;}
  for(let i=0;i<8;i++)this.box(s,[37,1,45],[Math.sin(i*2)*18,1,-80-i*44],'#717565');
  const sea=this.mesh(s,new THREE.PlaneGeometry(16000,16000),[0,-995,2500],'#294d5a');sea.rotation.x=-Math.PI/2;
  for(let i=0;i<95;i++){
   const z=180+i*34,x=Math.sin(i*33)*1800,y=-991+(i%3)*.2;
   this.line(s,[[x,y,z],[x+60+(i%7)*11,y,z]],i%3?'#94b0ae':'#cfcec0',.2);
  }
  // Distant headlands read behind the close-ups.
  for(const x of [-2100,1800]){const rock=this.mesh(s,new THREE.ConeGeometry(600,1400,6),[x,-300,-1300],'#53675f');rock.rotation.z=x>0?-.1:.1;}
  this.box(s,[120,35,48],[-10,17,-53],'#727465',true);
  for(let i=0;i<4;i++){const coil=this.mesh(s,new THREE.TorusGeometry(34+i*3,1.6,5,32),[-10,39+i*2,-53],'#b6a987');coil.rotation.x=Math.PI/2;}
  // One continuous rope hangs below the lip. After the cut the whole free length falls.
  this.cylinder(this.rope,2,2,910,[0,-450,66],'#c1b391',true);s.add(this.rope);
  this.line(s,[[-10,40,-53],[0,14,10],[0,5,66]],'#d2c5a4',1);
  // Small boat at the foot of the cliff provides a scale cue in the opening shot.
  const boat=new THREE.Group();boat.position.set(230,-977,350);s.add(boat);
  const hull=this.mesh(boat,new THREE.SphereGeometry(45,10,6),[0,0,0],'#503c2a',true);hull.scale.set(1.5,.27,.5);
  this.cylinder(boat,1,1,110,[0,55,0],'#93795a');
  const sail=this.mesh(boat,new THREE.PlaneGeometry(48,74),[22,65,0],'#c2bba3');sail.rotation.y=.25;
  return sea;
 }
 private costume(root:THREE.Group,id:CliffCharacterId){
  const color=id==='vizzini'?'#364e36':id==='fezzik'?'#81765e':'#71603d';
  const torso=this.cylinder(root,id==='fezzik'?22:17,id==='fezzik'?23:14,44,[0,-29,0],color,true);
  if(id==='inigo'){
   this.box(root,[15,33,3],[0,-24,15],'#a49b7a');
   for(const x of [-12,12])this.box(root,[8,39,4],[x,-27,15],'#594b31',true);
   this.line(root,[[0,-5,18],[2,-13,18],[-2,-18,18],[0,-24,18]],'#d3c4a0');
   const sword=new THREE.Group();sword.position.set(-23,-45,4);sword.rotation.z=-.25;root.add(sword);
   this.cylinder(sword,1.6,1.6,58,[0,-18,0],'#c4c8ba');this.box(sword,[14,2,3],[0,12,0],'#ac9c68');
   const guard=this.mesh(sword,new THREE.TorusGeometry(6,.8,5,20),[0,8,0],'#c5b67d');guard.rotation.y=.5;
  }else if(id==='vizzini'){
   // Embroidered dark doublet, stripes and a chain, leaving the airway face clear.
   for(const x of [-13,-7,7,13])this.line(root,[[x,-7,15],[x*1.15,-27,17],[x,-49,13]],'#c8b97b',.8);
   this.line(root,[[-14,-5,12],[-10,-20,17],[0,-25,18],[10,-20,17],[14,-5,12]],'#e3cc88',.9);
   this.mesh(root,new THREE.SphereGeometry(2.4,8,6),[0,-25,19],'#c9a561');
  }else{
   this.line(root,[[-12,-7,18],[0,-13,21],[13,-7,18]],'#c8c0a1');
   this.line(root,[[0,-13,21],[0,-30,23]],'#c8c0a1');
  }
  this.box(root,[id==='fezzik'?49:35,5,33],[0,-48,0],'#3f382b',true);
  for(const x of [-9,9]){
   this.cylinder(root,7,4.5,50,[x,-76,0],id==='vizzini'?'#746c50':'#544f3e',true);
   this.box(root,[11,17,18],[x,-107,3],'#292e2a',true);
  }
  const arms:THREE.Group[]=[];
  for(const x of [-21,21]){
   const arm=new THREE.Group();arm.position.set(x,-10,0);root.add(arm);
   this.cylinder(arm,5,4,26,[0,-13,0],id==='inigo'?'#9a9274':color,true);
   const fore=new THREE.Group();fore.position.set(0,-26,0);fore.rotation.x=-.4;arm.add(fore);
   this.cylinder(fore,3.8,2.7,22,[0,-11,0],id==='inigo'?'#9a9274':color,true);
   this.box(fore,[5,7,3],[0,-25,0],'#84918a',true);
   for(let i=0;i<4;i++)this.line(fore,[[i*1.4-2,-26,1],[i*1.4-2,-31,2]],'#c1d4cc');
   arms.push(arm);
  }
  torso.name='doublet';return arms;
 }
 private hair(root:THREE.Group,id:CliffCharacterId){
  // Anatomy coordinates have the nose along +x; match the airway's quarter-turn.
  const hair=new THREE.Group();hair.rotation.y=-Math.PI/2;root.add(hair);
  for(let i=0;i<28;i++){
   const z=(i/27-.5)*16,side=Math.abs(z)>5;
   if(id==='vizzini'&&!side)continue;
   const points:Point3[]=[];
   for(let j=0;j<8;j++){const u=j/7;points.push([-5+u*9+(id==='fezzik'?Math.sin(j*2+i)*1.1:0),21-Math.abs(z)*.12-Math.sin(u*Math.PI)*-2,z]);}
   this.line(hair,points,id==='vizzini'?'#9c9e82':'#78827a',.8);
   if(side&&id!=='vizzini')this.line(hair,[[-4,20,z],[-7,15,z*1.1],[-7+Math.sin(i)*2,5,z*1.15],[-5, id==='inigo'?-5:5,z]],'#737e74',.9);
  }
  if(id==='inigo')for(const side of [-1,1])this.line(hair,[[7.5,9,side*.5],[7.6,8.5,side*2.8],[7,7.9,side*4.2]],'#afbbaf',.9);
 }
 private blade(parent:THREE.Object3D){this.box(parent,[3,15,1],[0,0,0],'#cfd4cc',true);this.box(parent,[7,2,3],[0,-8,0],'#9f8c54');this.cylinder(parent,1.5,1.5,7,[0,-12,0],'#3c3021');}
 private silentFigure(root:THREE.Group,color:string,masked:boolean){
  this.cylinder(root,15,12,41,[0,-28,0],color,true);
  const head=this.mesh(root,new THREE.SphereGeometry(10,10,8),[0,11,0],masked?'#9daca5':'#c6b392',true);head.scale.set(.8,1.3,.8);
  if(masked){this.box(root,[18,5,17],[0,16,0],'#111b23',true);this.line(root,[[-7,17,9],[-3,17,9]],'#d4e2dc');this.line(root,[[3,17,9],[7,17,9]],'#d4e2dc');}
  else {const dress=this.mesh(root,new THREE.ConeGeometry(24,66,10),[0,-65,0],color,true);dress.rotation.z=Math.PI;for(let i=0;i<12;i++)this.line(root,[[Math.sin(i)*8,21,Math.cos(i)*8],[Math.sin(i)*10,-8,Math.cos(i)*10]],'#b5a17a',.8);}
  for(const x of [-10,10])this.cylinder(root,5,3,54,[x,-72,0],color,true);
  for(const x of [-15,15])this.line(root,[[x,-9,0],[x*1.4,18,12],[x*.7,37,6]],'#aebcb4',1);
 }
 resize(w:number,h:number){this.width=w;this.height=h;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.actors.forEach(a=>a.head.resize(w,h));}
 private cameraPose(view:CameraView,time:number){
  const narrow=this.width/this.height<1;
  let target=new THREE.Vector3(),position=new THREE.Vector3(),fov=narrow?57:43;
  const actor=this.actors.find(a=>a.id===view);
  if(actor){
   target.copy(actor.root.position).add(new THREE.Vector3(0,10,0));
   position.copy(target).add(new THREE.Vector3(view==='inigo'?95:-95,24,195));fov=narrow?43:29;
  }else if(view==='climber'){
   target.copy(this.pursuer.position).add(new THREE.Vector3(0,-15,0));position.copy(target).add(new THREE.Vector3(190,110,360));
  }else if(time<14){target.set(0,-390,0);position.set(950,160,1600);fov=narrow?60:48;}
  else {
   const party=this.actors.find(a=>a.id==='fezzik')!.root.position;
   target.set(0,party.y-48,-15);position.set(narrow?330:270,party.y+120,narrow?790:520);
  }
  this.camera.position.copy(position);this.camera.fov=fov;this.camera.lookAt(target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
 }
 frame(time:number,playing:boolean,epoch:number,view:CameraView,intensity:number,speaker?:CharacterId){
  const seek=epoch!==this.epoch;this.epoch=epoch;
  for(const a of this.actors){const pose=cliffActorPose(a.id,time);a.root.position.set(...pose.position);a.root.scale.setScalar(pose.scale);a.root.rotation.y=pose.rotation;}
  const fez=this.actors.find(a=>a.id==='fezzik')!;
  this.passenger.position.copy(fez.root.position).add(new THREE.Vector3(0,-23,29));
  if(time>87.35)this.passenger.position.set(159,78,-150);
  this.pursuer.position.set(...pursuerPose(time));this.pursuer.rotation.z=Math.sin(time*1.6)*.045;
  this.rope.position.y=-ropeDrop(time);this.rope.visible=this.rope.position.y>-1400;
  this.knife.visible=time>94&&time<110;
  this.water.position.y=-995+Math.sin(time*.5)*.8;
  this.cameraPose(view,time);this.scene.updateMatrixWorld(true);
  for(const a of this.actors){
   const message=a.track.message(a.track.indexAt(time)),tele=playing?message:null;
   if(seek)a.head.resetMotion();a.head.face.update(tele,1/30);a.head.camera.copy(this.camera);a.head.camera.updateMatrixWorld();
   const artic=VoiceModel.articFromArray(message.t.artic);
   a.head.update(a.model,a.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},1/30);
   const active=playing&&speaker===a.id;
   a.arms.forEach((arm,i)=>{
    const climbing=time<77&&a.id==='fezzik',cutting=time>95&&time<104.85&&a.id==='vizzini'&&i===1;
    arm.rotation.x=climbing?-2.6+Math.sin(time*2+i*Math.PI)*.28:cutting?-1.25+Math.sin(time*9)*.25:active?-.2-intensity*.4:0;
    arm.rotation.z=climbing?(i?-.15:.15):active?Math.sin(time*2+i)*.08:0;
   });
  }
 }
 dispose(){
  for(const a of this.actors){a.root.remove(a.head.scene);a.head.dispose();}
  const geometry=new Set<THREE.BufferGeometry>(),material=new Set<THREE.Material>();
  this.scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])material.add(m);}});
  geometry.forEach(g=>g.dispose());material.forEach(m=>m.dispose());this.mats.clear();
 }
}
