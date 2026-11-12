import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {mansionPose,mansionCamera,type MansionPoint as P} from '../../scene/mansion.ts';

const TAU=2*Math.PI;
/** A storm outside a candlelit mansion. Only the featured singer owns a physical voice. */
export class MansionStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,6000);
 readonly head=new Anatomy3D();readonly reflection=new Anatomy3D();
 readonly singer=new THREE.Group();readonly ghost=new THREE.Group();readonly motorcycle=new THREE.Group();
 readonly interior=new THREE.Group();readonly outside=new THREE.Group();readonly door=new THREE.Group();
 readonly architecture=new Beams();readonly facade=new Beams();readonly furniture=new Beams();readonly bed=new Beams();
 readonly dress=new Beams();readonly hair=new Beams();readonly reflectionHair=new Beams();readonly mirrorDress=new Beams();readonly arms=new Beams();readonly ghostLines=new Beams();
 readonly rain=new Beams();readonly lightning=new Beams();readonly curtains=new Beams();readonly flames=new Beams();readonly bike=new Beams();
 private all=[this.architecture,this.facade,this.furniture,this.bed,this.dress,this.hair,this.reflectionHair,this.mirrorDress,this.arms,this.ghostLines,this.rain,this.lightning,this.curtains,this.flames,this.bike];
 private meshes:THREE.Mesh[]=[];private candlePoints:P[]=[];private width=1280;private height=720;private last:number|null=null;private epoch=-1;
 private mirrorPane:THREE.Mesh;private windowPanes:THREE.Mesh[]=[];private fadePlane:THREE.Mesh;
 constructor(private model:VoiceModel,private track:TeleTrack){
  this.scene.background=new THREE.Color('#05080f');this.scene.fog=new THREE.Fog('#05080f',850,2250);
  this.scene.add(this.interior,this.outside,this.singer,this.ghost,this.rain.group,this.lightning.group);
  this.interior.add(this.architecture.group,this.furniture.group,this.bed.group,this.curtains.group,this.flames.group,this.door);
  this.outside.add(this.facade.group,this.motorcycle);this.motorcycle.add(this.bike.group);
  this.head.centred=true;this.reflection.centred=true;this.head.scene.rotation.y=-Math.PI/2;this.reflection.scene.rotation.y=Math.PI/2;
  this.singer.add(this.head.scene,this.dress.group,this.arms.group);this.head.attachAccessory(this.hair.group);this.reflection.attachAccessory(this.reflectionHair.group);
  this.interior.add(this.reflection.scene,this.mirrorDress.group);this.ghost.add(this.ghostLines.group);
  this.buildMansion();this.buildOutside();this.buildFurniture();this.buildHair();this.buildBike();this.buildGhost();
  this.mirrorPane=this.plane(this.interior,90,165,'#162334',[185,148,-101]);
  for(const x of [-130,0,130])this.windowPanes.push(this.plane(this.interior,85,190,'#26354d',[x,176,-352]));
  this.plane(this.door,90,260,'#29231d',[45,130,0]);this.door.position.set(-45,0,-395);
  this.fadePlane=this.plane(this.scene,2,2,'#000000',[0,0,0]);const veil=this.fadePlane.material as THREE.MeshBasicMaterial;veil.transparent=true;veil.depthTest=false;veil.depthWrite=false;veil.opacity=0;this.fadePlane.renderOrder=1000;
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private plane(parent:THREE.Object3D,w:number,h:number,color:string,p:P){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;
 }
 private line(b:Beams,ps:P[],color:string,width=1,alpha=.8,close=false){b.line(ps.flat(),ps.length,color,width,{alpha,close});}
 private rect(b:Beams,x:number,y:number,z:number,w:number,h:number,color:string,width=1){this.line(b,[[x-w/2,y-h/2,z],[x+w/2,y-h/2,z],[x+w/2,y+h/2,z],[x-w/2,y+h/2,z]],color,width,.85,true);}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.8){this.line(b,Array.from({length:32},(_,i)=>{const a=i/32*TAU;return c.map((n,k)=>n+u[k]*Math.cos(a)+v[k]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private arch(b:Beams,x:number,z:number,w:number,h:number,color:string){
  const r=w/2;this.line(b,[[x-r,0,z],[x-r,h-r,z],...Array.from({length:25},(_,i)=>{const a=Math.PI-i/24*Math.PI;return [x+r*Math.cos(a),h-r+r*Math.sin(a),z] as P;}),[x+r,0,z]],color,1.6,.9);
 }
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string){
  for(const dz of [-d/2,d/2])this.rect(b,x,y,z+dz,w,h,color);for(const dx of [-w/2,w/2])for(const dy of [-h/2,h/2])this.line(b,[[x+dx,y+dy,z-d/2],[x+dx,y+dy,z+d/2]],color);
 }
 private buildMansion(){
  const b=this.architecture;b.begin();
  // Receding arches and pilasters make the long hall readable from every camera.
  for(let i=0;i<7;i++){
   const z=160-i*95;this.arch(b,0,z,430,350,i%2?'#8b6950':'#a89372');
   for(const side of [-1,1]){this.box(b,side*226,147,z,22,294,22,'#78654f');this.box(b,side*226,289,z,34,14,34,'#aa8d62');}
  }
  for(let z=-490;z<=220;z+=55)this.line(b,[[-245,0,z],[245,0,z]],'#455160',.85,.5);
  for(let x=-245;x<=245;x+=55)this.line(b,[[x,0,-490],[x,0,220]],'#455160',.85,.5);
  for(const x of [-130,0,130]){this.rect(b,x,176,-350,92,198,'#97bbdc',1.6);this.line(b,[[x,77,-349],[x,275,-349]],'#8eacc6',1.3);for(const y of [145,210])this.line(b,[[x-46,y,-349],[x+46,y,-349]],'#8eacc6',1.3);}
  // Side staircase, railings and a chandelier above the hall.
  for(let i=0;i<15;i++){const y=i*11,z=-100-i*12;this.line(b,[[-220,y,z],[-125,y,z],[-125,y+11,z-12],[-220,y+11,z-12]],'#9a8d78',1.3);this.line(b,[[-120,y,z],[-120,y+78,z]],'#b2a17f',1);}
  this.line(b,[[-120,78,-100],[-120,232,-268]],'#d4ba83',1.6);
  this.line(b,[[0,350,-130],[0,285,-130]],'#c0a56d',1.3);this.ring(b,[0,275,-130],[68,0,0],[0,0,68],'#b7965c',1.6);
  for(let i=0;i<10;i++){const a=i/10*TAU,p:P=[Math.cos(a)*68,275,-130+Math.sin(a)*68];this.line(b,[[0,302,-130],p,[p[0],p[1]+18,p[2]]],'#d8b77a',1.3);this.candlePoints.push([p[0],p[1]+20,p[2]]);}
  b.end();
  const floor=this.plane(this.interior,510,780,'#10131a',[0,-1,-130]);floor.rotation.x=-Math.PI/2;
 }
 private buildOutside(){
  const b=this.facade;b.begin();
  this.box(b,0,180,-200,720,360,240,'#5f7795');
  for(const x of [-310,-205,-100,100,205,310])for(const y of [98,250]){this.rect(b,x,y,-78,56,104,'#b7c1c4',1.3);this.line(b,[[x,y-52,-77],[x,y+52,-77]],'#99b0c6');}
  this.arch(b,0,-70,135,180,'#b5c1d0');
  this.line(b,[[-395,361,-60],[0,470,-185],[395,361,-60]],'#879bb5',1.6);
  this.line(b,[[-395,361,-60],[-395,361,-330],[0,470,-185],[395,361,-330],[395,361,-60]],'#6f7f95',1.3);
  for(const side of [-1,1]){for(let j=0;j<8;j++){const x=side*(355+j*34),z=70-j*85;this.line(b,[[x,0,z],[x-9,140,z],[x+5,240,z]],'#56687d',1.6);for(let k=0;k<6;k++)this.line(b,[[x,100+k*19,z],[x+Math.sin(k*3+j)*55,165+k*17,z-15],[x+Math.sin(k*3+j)*80,185+k*17,z-25]],'#52687a',1.05);}}
  for(const x of [-100,100])this.line(b,[[x,0,500],[x*.55,0,-70]],'#758ba2',1.3);
  b.end();const road=this.plane(this.outside,1000,1500,'#060b14',[0,-2,50]);road.rotation.x=-Math.PI/2;
 }
 private buildFurniture(){
  let b=this.bed;b.begin();
  this.box(b,-80,28,20,190,40,210,'#798094');this.box(b,-80,82,-86,205,105,13,'#b7a17f');
  for(let i=0;i<10;i++)this.line(b,[[-174+i*21,30,120],[-170+i*20,53,40],[-170+i*20,58,-74]],'#b1b5c3',1,.7);
  for(const x of [-125,-45]){this.box(b,x,61,-53,65,18,42,'#d1d0ca');}
  b.end();b=this.furniture;b.begin();
  // Fireplace, mantel photograph and an ornate full-length mirror.
  this.box(b,-190,87,-184,100,174,32,'#ad987d');this.rect(b,-190,60,-165,72,93,'#bf8959',1.6);
  this.box(b,122,72,-120,160,8,64,'#b8a077');for(const x of [50,194])this.line(b,[[x,70,-120],[x-7,0,-110]],'#ae9671',1.3);
  this.rect(b,113,106,-113,38,48,'#dfbc7b',1.6);this.ring(b,[113,110,-111],[8,0,0],[0,10,0],'#a7c4d5');this.line(b,[[101,94,-111],[106,101,-111],[120,101,-111],[126,94,-111]],'#a7c4d5');
  for(const inset of [0,5,9])this.rect(b,185,148,-98,102+inset,177+inset,'#c6aa6c',1.3);
  for(const z of [-305,-180,-55,70])for(const x of [-205,205]){
   this.line(b,[[x,0,z],[x,153,z]],'#bca47b',1.3);this.ring(b,[x,12,z],[18,0,0],[0,0,18],'#8d7c63');
   for(const dx of [-13,0,13]){this.line(b,[[x,120,z],[x+dx,135,z],[x+dx,155+Math.abs(dx)*.3,z]],'#c7b48c',1.3);this.candlePoints.push([x+dx,161+Math.abs(dx)*.3,z]);}
  }
  b.end();
 }
 private buildHair(){
  this.hair.begin();this.reflectionHair.begin();for(let i=0;i<75;i++){
   const a=i/75*TAU,x=Math.cos(a)*11,z=Math.sin(a)*9;
   // The anatomical face points along local +X; leave the face and airway exposed.
   const points:P[]=x>4||Math.abs(z)<6?[[x*.7,25,z*.7],[x,23,z],[x*.95,21,z]]:[[x*.7,24,z*.7],[x,18,z],[x*1.06,7,z*1.05],[x*1.25,-3,z*1.15],[x*1.4,-5,z]];
   this.line(this.hair,points,i%3?'#ab8a58':'#d9b77d',.85,.85);
   this.line(this.reflectionHair,points,'#a79375',.85,.7);
  }this.hair.end();this.reflectionHair.end();
  this.mirrorDress.begin();for(let i=0;i<15;i++){const x=-20+i*40/14;this.line(this.mirrorDress,[[x*.3,-3,0],[x,-16,0],[x*.65,-40,0],[x*1.4,-86,0]],'#a7b4b8',.85,.6);}this.mirrorDress.end();
 }
 private buildBike(){
  const b=this.bike;b.begin();for(const x of [-40,40]){for(const z of [-8,8])this.ring(b,[x,24,z],[23,0,0],[0,23,0],'#acbdcd',1.6);for(let i=0;i<12;i++){const a=i/12*TAU;this.line(b,[[x,24,9],[x+23*Math.cos(a),24+23*Math.sin(a),9]],'#7c90a7',.85);}}
  this.line(b,[[-40,24,0],[-12,63,0],[23,57,0],[40,24,0],[-40,24,0]],'#c2c9cc',2.1);this.box(b,-3,59,0,37,17,22,'#87949f');this.line(b,[[23,57,0],[15,82,0],[30,84,12]],'#c8d4df',1.6);
  this.ring(b,[9,112,0],[11,0,0],[0,13,0],'#b5c6d9',1.3);this.line(b,[[1,99,0],[-12,74,0],[10,63,0],[22,30,8]],'#9ba5b6',2.1);this.line(b,[[1,96,0],[22,83,0],[30,84,12]],'#9ba5b6',2.1);b.end();
 }
 private buildGhost(){
  const b=this.ghostLines;b.begin();for(let j=0;j<6;j++){const a=j/6*Math.PI;this.ring(b,[0,155,0],[12*Math.cos(a),0,12*Math.sin(a)],[0,17,0],'#aacddd',1,.45);}
  for(const y of [135,110,82])this.ring(b,[0,y,0],[y===135?24:20,0,0],[0,0,10],'#abc6d5',1,.45);
  for(const side of [-1,1]){this.line(b,[[side*23,131,0],[side*31,106,2],[side*29,80,7]],'#c3dce3',1.6,.5);this.line(b,[[side*12,81,0],[side*14,42,3],[side*15,0,8],[side*15,0,22]],'#a0b9c8',1.6,.5);this.line(b,[[side*7,137,9],[side*17,119,11],[0,100,12]],'#d5e5e8',1,.5);}
  this.line(b,[[-9,157,11],[9,157,11],[4,149,13],[-5,143,11]],'#dceef1',1,.55);b.end();
 }
 private body(p:ReturnType<typeof mansionPose>,intensity:number){
  const b=this.dress;b.begin();const levels=[[-3,5,4],[-15,20,9],[-40,13,8],[-75,21,13],[-111,29,20],[-150,43,28]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],'#d6d0b9',1,.8);
  for(let i=0;i<28;i++){const a=i/28*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(a)+Math.sin(p.t*1.6+i*.4)*Math.max(0,-y-45)*.045,y,z*Math.sin(a)]),'#c5c9c7',.85,.8);}
  for(const side of [-1,1])this.line(b,[[side*5,-3,5],[side*17,-15,10],[side*8,-39,10],[0,-45,11]],'#ece0c7',1.3);
  b.end();this.arms.begin();
  for(const side of [-1,1]){
   const reach=p.reach+intensity*.25,w:P=p.photo?[side*13,-28,30]:p.mirror&&side===1?[45,1,16]:[side*(27+22*reach),-58+48*reach,15+reach*13];
   const elbow:P=[side*(29+12*reach),-42+17*reach,8];
   for(let i=0;i<7;i++){const a=i/7*TAU,off:P=[Math.cos(a)*5,Math.sin(a)*5,Math.cos(a)*4];this.line(this.arms,[[side*19+off[0],-15+off[1],off[2]],elbow.map((n,k)=>n+off[k]) as P,w.map((n,k)=>n+off[k]*.5) as P],'#d7d7ce',1,.8);}
   for(let i=0;i<5;i++)this.line(this.arms,[[w[0]+i*.9*side,w[1],w[2]],[w[0]+i*1.5*side,w[1]+8-i*.5,w[2]+2]],'#eadcc5',1,.9);
  }
  if(p.photo)this.rect(this.arms,0,-20,33,28,35,'#d6b878',1.6);this.arms.end();
 }
 private weather(p:ReturnType<typeof mansionPose>,exterior:boolean){
  this.rain.begin();for(let i=0;i<(exterior?230:72);i++){const x=exterior?((i*137.91)%1100)-550:[-130,0,130][i%3]+((i*13.91)%70)-35,y=exterior?((i*73.31-p.t*320)%600+600)%600:100+((i*37.31-p.t*180)%165+165)%165,z=exterior?((i*53.17)%1000)-500:-346;this.line(this.rain,[[x,y,z],[x-5,y-22,z]],'#7396bb',.6,exterior?.4:.18);}this.rain.end();
  this.lightning.begin();if(p.lightning>.02){this.line(this.lightning,[[190,650,-450],[145,520,-440],[177,480,-440],[108,345,-430],[130,290,-430]],'#d9ebff',2.1,p.lightning);this.line(this.lightning,[[145,520,-440],[90,480,-440],[45,410,-430]],'#9dcaff',1.3,p.lightning);}
  if(p.crash&&exterior){this.line(this.lightning,[[85,30,70],[170,80,55],[245,160,35]],'#baac8b',2.1);for(let i=0;i<14;i++){const a=i/14*TAU,r=35+15*Math.sin(p.t*7+i);this.line(this.lightning,[[155,70,60],[155+Math.cos(a)*r,70+Math.sin(a)*r,65]],i%2?'#eebf84':'#c37d55',2.1,.9);}}this.lightning.end();
  this.flames.begin();for(const [i,c]of this.candlePoints.entries()){const flicker=1+Math.sin(p.t*9+i*2.5)*.15;this.line(this.flames,[[c[0]-1,c[1],c[2]],[c[0]+Math.sin(p.t*6+i)*1.1,c[1]+8*flicker,c[2]],[c[0]+1,c[1],c[2]]],'#ffd6a0',2.1,.95);}
  for(let i=0;i<8;i++)this.line(this.flames,[[-216+i*7,18,-162],[-216+i*7+Math.sin(p.t*4+i)*5,43+Math.sin(p.t*7+i)*14,-161]],'#e7a36a',2.1,.85);this.flames.end();
  this.curtains.begin();for(const x of [-181,-79,79,181])for(let k=0;k<13;k++){
   const ps=Array.from({length:19},(_,j)=>{const y=290-j*15,fall=j/18;return [x+k*.8+Math.sin(p.t*1.4+fall*5)*24*fall*p.curtain,y,-329+Math.sin(fall*7+p.t)*45*fall] as P;});this.line(this.curtains,ps,'#aec4df',.85,.65);
  }this.curtains.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.reflection.resize(w,h);this.all.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=mansionPose(t),c=mansionCamera(view,this.width/this.height,t);
  if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25){this.head.resetMotion();this.reflection.resetMotion();}const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.last=t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const exterior=view==='mansion-exterior'||view==='mansion-road'||p.exterior&&view==='wide';this.outside.visible=exterior;this.interior.visible=!exterior;this.singer.visible=!exterior;this.ghost.visible=!exterior&&(p.ghost||p.memory||view==='mansion-memory');
  const bg=new THREE.Color(p.memory?'#1e1512':p.corridor?'#100e10':'#05080f').lerp(new THREE.Color('#8494ad'),p.lightning*.45);this.scene.background=bg;(this.scene.fog as THREE.Fog).color.copy(bg);this.bed.group.visible=p.bed||p.memory||view==='mansion-bedroom';
  this.singer.position.set(...p.position);this.singer.rotation.set(0,p.turn,p.bed?1.5:0);this.head.scene.rotation.y=-Math.PI/2+Math.sin(t*.27)*.06;
  const message=this.track.message(this.track.indexAt(t)),energy=Math.min(1,message.t.outRms*5);this.body(p,energy);this.weather(p,exterior);
  this.ghost.position.set(p.memory?48:0,0,p.memory?60:-300);this.ghost.rotation.y=p.memory?-.5:0;this.door.rotation.y=-p.door*1.25;
  this.motorcycle.position.set(-180+360*p.ride,0,250-200*p.ride);this.motorcycle.rotation.set(0,.2,p.crash?-.8:0);this.motorcycle.visible=t<43;
  for(const window of this.windowPanes)(window.material as THREE.MeshBasicMaterial).color.set('#26354d').lerp(new THREE.Color('#cbdce9'),p.lightning);
  this.reflection.scene.visible=p.mirror||view==='mansion-mirror';this.reflection.scene.position.set(185,153,-96);this.reflection.scene.rotation.y=Math.PI/2;this.mirrorDress.group.position.set(185,153,-95);this.mirrorDress.group.visible=this.reflection.scene.visible;
  this.scene.updateMatrixWorld(true);
  if(this.singer.visible){const artic=VoiceModel.articFromArray(message.t.artic),frame=this.model.frame(artic);for(const head of [this.head,this.reflection]){if(!head.scene.visible)continue;head.camera.copy(this.camera);head.camera.updateMatrixWorld();const tele=playing?message:null;head.face.update(tele,dt);head.update(this.model,frame,artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}}
  // A camera-facing veil fades every scene component, and restores exactly after a seek.
  this.fadePlane.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.fadePlane.quaternion.copy(this.camera.quaternion);this.fadePlane.scale.set(10,10,1);(this.fadePlane.material as THREE.MeshBasicMaterial).opacity=1-p.fade;
  this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.reflectionHair.group.removeFromParent();this.head.dispose();this.reflection.dispose();this.all.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
