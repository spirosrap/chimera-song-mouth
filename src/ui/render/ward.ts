import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {NEUTRAL} from '../../wasm/engine.ts';
import {WARD_PEOPLE,wardCamera,wardPose,type WardPerson,type WardSpeaker,type WardPoint as P} from '../../scene/ward.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,cream='#bac3ac',blue='#5493a8',wood='#8b8063',skin='#96bac2',green='#638b79';
interface Person{id:WardPerson;model:VoiceModel;track?:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;clothes:Beams;arms:Beams}
/** A seated ward conversation, with physical speakers and separately animated listeners. */
export class WardRoom{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,3000);readonly people:Person[]=[];
 readonly room=new Beams();readonly furniture=new Beams();readonly details=new Beams();
 private readonly nurseModel:VoiceModel;private readonly beams:Beams[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;private duration:number;
 constructor(cast:{id:WardSpeaker;model:VoiceModel;track:TeleTrack}[]){
  if(!cast.length)throw Error('The ward needs its physical speakers.');
  this.duration=Math.max(...cast.map(c=>c.track.duration));this.nurseModel=new VoiceModel({female:.7,child:0},cast[0].track.sampleRate);
  this.scene.background=new THREE.Color(0x080c09);this.scene.fog=new THREE.Fog(0x000000,140,350);
  for(const id of Object.keys(WARD_PEOPLE) as WardPerson[]){
   const voice=cast.find(c=>c.id===id),nurse=id==='ratched'||id==='pilbow';
   const p:Person={id,model:voice?.model??(nurse?this.nurseModel:cast[0].model),track:voice?.track,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),clothes:new Beams(),arms:new Beams()};
   p.root.name=id;p.head.centred=true;p.head.attachAccessory(p.hair.group);p.root.add(p.head.scene,p.clothes.group,p.arms.group);this.scene.add(p.root);this.people.push(p);
   for(const [n,b] of Object.entries({hair:p.hair,clothes:p.clothes,arms:p.arms})){b.group.name=id+'-'+n;this.beams.push(b);}this.makeHair(p);this.makeClothes(p);
  }
  for(const [n,b] of Object.entries({room:this.room,furniture:this.furniture,details:this.details})){b.group.name=n;this.scene.add(b.group);this.beams.push(b);}
  this.makeRoom();this.makeFurniture();this.resize(1280,720);this.frame(0,false,0,'ward-pair',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6){this.line(b,Array.from({length:28},(_,i)=>{const a=i/28*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.6){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);
  for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 private makeHair(p:Person){
  const b=p.hair,id=p.id,nurse=id==='ratched'||id==='pilbow',bald=id==='cheswick',long=id==='scanlon';b.begin();
  for(let i=0;i<27;i++){
   const z=(i/26-.5)*14.6,c=Math.sqrt(1-(z/8)**2);
   if(!bald||Math.abs(z)>5)this.line(b,Array.from({length:25},(_,j)=>{const a=j/24*Math.PI,high=id==='billy'?1.7:1;return [-.6-8*c*Math.cos(a),17.8+6.7*c*Math.sin(a)+high*Math.sin(a*5+i*.5),z] as P;}),long?'#8a9181':'#757d69',.9,.8);
  }
  if(id==='mcmurphy'||id==='billy'||id==='harding')for(let i=0;i<17;i++)this.line(b,Array.from({length:20},(_,j)=>{const t=j/19;return [7-16*t,20+4*Math.sin(t*Math.PI)+(id==='billy'?1:0), (i/16-.5)*13+1.1*Math.sin(t*3)] as P;}),'#8c8b6f',.9,.7);
  if(id==='mcmurphy')for(const z of [-7,7])for(let i=0;i<4;i++)this.line(b,[[2-i*.4,15,z],[3-i*.4,9,z]],'#777e69',1,.8);
  if(long){
   for(let i=0;i<24;i++)this.line(b,Array.from({length:23},(_,j)=>{const t=j/22;return [-8-2*t,19-28*t,(i/23-.5)*18+.6*Math.sin(t*15+i)] as P;}),'#929581',.9,.75);
   for(let i=0;i<27;i++){const z=(i/26-.5)*17;this.line(b,Array.from({length:25},(_,j)=>{const t=j/24;return [7-2*t+.4*Math.sin(t*18+i),7-22*t,z*(1-.75*t)] as P;}),'#a0a58c',.9,.85);}
  }
  if(bald){
   for(const z of [-4.7,4.7])this.line(b,[[9.7,14.8,z-3.6],[10.2,18.2,z-3.6],[10.2,18.2,z+3.6],[9.7,14.8,z+3.6]],'#bad0bf',1.3,.95,true);
   this.line(b,[[10,16.8,-1.1],[10.4,17.2,0],[10,16.8,1.1]],'#bad0bf',1.3,.95);for(const z of [-8.2,8.2])this.line(b,[[10,17.4,z],[-2,17,z]],'#bad0bf',1.3,.9);
  }
  if(nurse){
   for(const z of [-7,7])for(let i=0;i<8;i++)this.line(b,[[-4+i*.5,20,z],[-9+i*.4,9,z*1.15],[-8+i*.3,0,z*.8]],'#8e8a71',.9,.8);
   for(const x of [-5,-4.5])this.line(b,[[x,22,-11],[x,31,-8],[x,33,8],[x,23,11]],'#d1d8c3',1.3,.95,true);
   for(let i=0;i<9;i++)this.line(b,[[-5,23,-10+i*2.5],[-5,31,-8+i*2]],'#c0c8b5',.8,.65);
  }b.end();
 }
 private makeClothes(p:Person){
  const b=p.clothes,id=p.id,nurse=id==='ratched'||id==='pilbow',shirt=id==='scanlon'?'#b39680':id==='martini'?'#6c7e66':id==='taber'?blue:id==='harding'?'#829078':cream;b.begin();
  const rings=[[-4,5.5,5],[-11,id==='martini'?19:21,9],[-29,19,10],[-48,19,10]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],shirt,.9,.7);
  for(let i=0;i<20;i++){const a=i/20*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),shirt,.85,.65);}
  const collar=id==='mcmurphy'?blue:shirt;
  if(id!=='cheswick')for(const side of [-1,1])this.line(b,[[side*5,-3,5],[side*13,-11,10],[side*6,-21,11],[side*2,-12,10]],collar,1.3,.95);
  if(id==='scanlon')for(let x=-15;x<=15;x+=4)for(let y=-16;y>=-40;y-=5)this.line(b,[[x-.7,y,10],[x,y-1,10],[x+.7,y,10]],'#cfb39a',.65,.55);
  if(id==='mcmurphy')this.line(b,[[-6,-3,6],[0,-12,10],[6,-3,6]],'#375b57',2,.8);
  this.line(b,[[0,-15,11],[0,-46,11]],shirt,1,.65);
  if(nurse){
   for(const y of [-20,-28,-36])this.ring(b,[0,y,11],[.6,0,0],[0,.6,0],'#a3af9b',.85,.8);
   this.line(b,[[-15,-21,9],[-7,-21,11],[-7,-25,11],[-15,-25,9]],'#8db5a2',.85,.9,true);
   for(let i=0;i<13;i++){const x=(i/12-.5)*33;this.line(b,[[x,-46,8],[x*1.1,-57,34],[x*1.1,-68,35]],shirt,.9,.7);}
   for(const side of [-1,1]){const bottom=-WARD_PEOPLE[id].position[1];this.tube(b,[side*8,-65,32],[side*8,bottom+3,33],4,3,skin,.5);this.box(b,side*8-4,bottom,29,8,4,15,cream,.7);}
   if(id==='ratched'){this.box(b,-15,-51,25,28,2,22,'#958871',.85);for(let i=0;i<5;i++)this.line(b,[[-10,-48.8,29+i*3],[9,-48.8,29+i*3]],cream,.65,.65);}
  }else for(const side of [-1,1]){
   const knee:P=[side*(id==='martini'?13:11),-50,29],ankle:P=[side*12,-WARD_PEOPLE[id].position[1]+4,31];
   this.tube(b,[side*10,-46,0],knee,7,6,cream,.65);this.tube(b,knee,ankle,6,4,cream,.6);this.box(b,ankle[0]-4,-WARD_PEOPLE[id].position[1],27,8,5,17,'#657269',.75);
  }b.end();
 }
 private hand(b:Beams,w:P,point=false){const [x,y,z]=w;this.line(b,[[x-2,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2,y,z]],skin,1,.85,true);for(let i=0;i<4;i++){const dx=-1.5+i;this.line(b,[[x+dx,y+3,z+1],[x+dx,y+(point&&i===1?10:6),z+2],[x+dx,y+(point&&i===1?10:5),z+3]],skin,.85,.75);}}
 private arms(p:Person,pose:ReturnType<typeof wardPose>){
  const b=p.arms,id=p.id,nurse=id==='ratched'||id==='pilbow',shirt=id==='scanlon'?'#b39680':id==='martini'?'#6c7e66':id==='taber'?blue:id==='harding'?'#829078':cream;b.begin();
  for(const side of [-1,1]){
   let elbow:P=[side*26,-29,8],wrist:P=[side*13,-43,30];
   if(id==='mcmurphy'){elbow=[side*(26+pose.appeal*7),-29+pose.appeal*8,12];wrist=[side*(15+pose.appeal*25+pose.point*12),-42+pose.appeal*21+pose.point*(side===1?25:7),28+pose.appeal*8];}
   if(id==='cheswick'){wrist=[-side*8,-29+pose.hideFace*30,14+pose.hideFace*3];elbow=[side*24,-30+pose.hideFace*12,9];}
   if(id==='billy'){wrist=[-side*8,-41,28];elbow=[side*23,-28,12];}
   if(id==='martini'&&side===1)wrist=[2,-7,13];
   if(id==='harding'&&side===1){wrist=[4,-39+pose.laugh*39,27-pose.laugh*9];elbow=[23,-27,15];}
   if(id==='taber'||id==='pilbow'){wrist=[-side*14,-24,13];elbow=[side*24,-28,10];}
   if(id==='ratched'&&side===1)wrist=[5,-45,33];
   const short=['billy','martini','scanlon','pilbow'].includes(id);this.tube(b,[side*21,-10,0],elbow,5,4,shirt,.7);this.tube(b,elbow,wrist,4,2.4,short?skin:shirt,.7);this.hand(b,wrist,id==='mcmurphy'&&pose.point>.3&&side===1);
   if(id==='ratched'&&side===1)this.line(b,[[wrist[0]-1,wrist[1]+3,wrist[2]-2],[wrist[0]+2,wrist[1]-2,wrist[2]+5]],'#c09183',1.3,.9);
  }
  if(id==='cheswick'&&pose.hideFace>0){const y=-30+pose.hideFace*30;for(let i=0;i<17;i++){const x=(i/16-.5)*27;this.line(b,[[x,y-16,19],[x+Math.sin(i)*2,y+3,20],[x*.8,y+10,15]],'#415a55',1.3,.7);}this.line(b,[[-14,y-13,18],[14,y-13,18],[11,y+8,16],[-10,y+8,16]],'#587568',1.3,.7,true);}
  b.end();
 }
 private makeRoom(){
  const b=this.room;b.begin();this.box(b,-210,0,-160,420,176,340,green,.3);
  for(let x=-210;x<=210;x+=24)this.line(b,[[x,0,-160],[x,0,180]],cream,.65,.18);
  for(let z=-160;z<=180;z+=24)this.line(b,[[-210,0,z],[210,0,z]],cream,.65,.18);
  for(const y of [4,37,43,160,169])this.line(b,[[-210,y,180],[-210,y,-160],[210,y,-160],[210,y,180]],cream,1,.4);
  for(const x of [-162,-54,54,162]){
   this.box(b,x-42,48,-159,84,108,4,cream,.7);
   for(const dx of [-38,0,38])this.line(b,[[x+dx,51,-154],[x+dx,153,-154]],'#b0caba',1,.65);
   for(const y of [77,102,127])this.line(b,[[x-38,y,-154],[x+38,y,-154]],'#b0caba',1,.65);
   for(let dx=-34;dx<34;dx+=12)for(let y=59;y<143;y+=17)this.line(b,[[x+dx,y,-153],[x+dx+6,y+8,-153],[x+dx+12,y,-153]],'#729c89',.65,.35);
   for(let dx=-35;dx<=35;dx+=5)this.box(b,x+dx,8,-153,3,28,8,'#81917b',.5);
  }
  this.box(b,205,0,70,4,140,72,wood,.6);this.box(b,204,76,80,3,51,51,green,.6);
  this.box(b,-209,82,-61,3,55,91,wood,.7);this.box(b,-205,87,-56,2,45,81,'#446a5d',.6);
  for(let i=0;i<5;i++)this.line(b,[[-202,121-i*7,-47],[-202,122-i*7,2],[-202,120-i*7,8]],cream,.85,.5);
  this.ring(b,[-203,151,83],[0,10,0],[0,0,10],cream,1,.75);this.line(b,[[-202,158,83],[-202,151,83],[-202,148,88]],cream,1,.9);b.end();
 }
 private makeFurniture(){
  const b=this.furniture;b.begin();
  for(const config of Object.values(WARD_PEOPLE)){
   const root=new THREE.Matrix4().compose(new THREE.Vector3(config.position[0],0,config.position[2]),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),config.yaw),new THREE.Vector3(1,1,1));
   const map=(p:P)=>new THREE.Vector3(...p).applyMatrix4(root).toArray() as P;
   for(const y of [34,38])this.line(b,[[-23,y,-13],[23,y,-13],[23,y,27],[-23,y,27]].map(v=>map(v as P)),wood,1,.8,true);
   for(const x of [-21,21])for(const z of [-11,25])this.line(b,[map([x,0,z]),map([x,38,z])],wood,1.3,.8);
   for(const x of [-23,23])this.line(b,[map([x,36,-13]),map([x,84,-13])],wood,1.3,.8);
   for(const y of [61,80,85])this.line(b,[map([-23,y,-13]),map([23,y,-13])],wood,1.3,.8);
  }b.end();const d=this.details;d.begin();this.box(d,-185,0,-132,60,47,28,wood,.55);
  this.tube(d,[-158,48,-120],[-158,60,-120],6,7,'#a7927f',.7);
  for(let i=0;i<9;i++){const a=i/9*TAU;this.line(d,[[-158,60,-120],[-158+13*Math.sin(a),74+i%3*4,-120+9*Math.cos(a)]],green,1,.7);this.ring(d,[-158+13*Math.sin(a),74+i%3*4,-120+9*Math.cos(a)],[3,0,0],[0,3,1],'#b28183',1,.7);}
  d.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),pose=wardPose(t);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=wardCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;fog.near=distance*1.04;fog.far=distance+(view==='wide'?280:150);
  for(const p of this.people){const base=WARD_PEOPLE[p.id];p.root.position.set(...base.position);p.root.rotation.y=base.yaw+(p.id==='mcmurphy'?pose.turn:0);p.head.scene.rotation.set(0,-Math.PI/2,p.id==='mcmurphy'?-.24*pose.hunch:p.id==='billy'?-.2*pose.billyDown+pose.billyStutter:p.id==='cheswick'?pose.cheswickNod-.38*pose.hideFace:p.id==='martini'||p.id==='scanlon'?pose.assent:p.id==='harding'?pose.laugh*.08:p.id==='ratched'?.045*pose.nurseLook:p.id==='pilbow'?-.03*pose.nurseLook:0);p.head.scene.position.set(0,p.id==='mcmurphy'?-5*pose.hunch:0,p.id==='mcmurphy'?6*pose.hunch:0);this.arms(p,pose);
   const msg=p.track?.message(p.track.indexAt(t)),tele=playing&&msg?msg:null,artic=msg?VoiceModel.articFromArray(msg.t.artic):NEUTRAL;
   p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:!!msg,particles:!!msg,grid:false,calipers:false},dt);
  }this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();this.nurseModel.dispose();}
}
