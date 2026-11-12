import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {parkPose,parkCamera,type ParkPerson,type ParkPoint as P} from '../../scene/park.ts';
const TAU=Math.PI*2,wood='#928573',iron='#6d8177',leaf='#557e56',water='#4d929f',seanColor='#a39d74',willColor='#927c65';
interface Person{id:ParkPerson;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;clothes:Beams;limbs:Beams}
/** Two actual physical speakers beside the Public Garden pond. Models are borrowed from the stage's leases. */
export class GardenBench{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,8000);readonly people:Person[]=[];readonly pond=new Beams();readonly swans=new Beams();readonly walkers=new Beams();readonly bench=new Beams();readonly park=new Beams();
 private beams:Beams[]=[];private width=1280;private height=720;private lastTime:number|null=null;private epoch=-1;private duration:number;
 constructor(cast:{id:ParkPerson;model:VoiceModel;track:TeleTrack}[]){if(cast.length!==2||!cast.some(c=>c.id==='sean')||!cast.some(c=>c.id==='will'))throw Error('Sean and Will are required.');this.duration=Math.max(...cast.map(c=>c.track.duration));this.scene.background=new THREE.Color('#08100d');
  for(const [name,b] of Object.entries({pond:this.pond,swans:this.swans,walkers:this.walkers,bench:this.bench,park:this.park})){b.group.name=name;this.beams.push(b);this.scene.add(b.group);}
  for(const c of cast){const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),clothes:new Beams(),limbs:new Beams()};p.root.name=c.id;p.head.centred=true;p.head.attachAccessory(p.hair.group);p.root.add(p.head.scene,p.clothes.group,p.limbs.group);this.scene.add(p.root);this.people.push(p);this.beams.push(p.hair,p.clothes,p.limbs);this.makeHair(p);this.makeClothes(p);}
  this.makeBench();this.makePark();this.resize(1280,720);this.frame(0,false,0,'park-lake',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6,n=24){this.line(b,Array.from({length:n},(_,i)=>{const a=i/n*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.7){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.65){const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();const at=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>at(t,i/12*TAU)),color,.9,alpha,true);for(let i=0;i<8;i++)this.line(b,[at(0,i/8*TAU),at(1,i/8*TAU)],color,.85,alpha);}
 private makeBench(){const b=this.bench;b.begin();for(const z of [-17,-7,3,13])this.box(b,-91,42,z,182,4,9,wood,.9);for(const x of [-75,65]){this.box(b,x,1,-17,10,40,35,iron,.85);this.line(b,[[x-5,3,-23],[x+15,3,-23],[x+15,3,24],[x-5,3,24]],iron,1.4,.9,true);}for(let i=0;i<7;i++)this.line(b,[[-88,46.1,-15+i*4],[88,46.1,-15+i*4]],wood,.7,.5);b.end();}
 private makeHair(p:Person){const b=p.hair;b.begin();if(p.id==='sean'){
  // Soft peaked cap, brim and side hair, fitted to the anatomy's local sagittal coordinates.
  for(let j=0;j<7;j++){const y=21+j*.8,r=1-j*.10;this.ring(b,[-1,y,0],[11*r,0,0],[0,0,10*r],'#aaa794',1,.85);}
  for(let k=0;k<12;k++){const a=k/12*TAU;this.line(b,[[-1+11*Math.cos(a),21,10*Math.sin(a)],[-1+7*Math.cos(a),25.8,6*Math.sin(a)],[-1,27.2,0]],'#8e8e81',.85,.8);}
  for(let i=0;i<7;i++){const a=-1.1+i/6*2.2;this.line(b,[[8,20,Math.sin(a)*10],[12+4*Math.cos(a),18.5,Math.sin(a)*12]],'#c1bba5',1.2,.95);}
  this.line(b,Array.from({length:25},(_,i)=>{const a=-1.1+i/24*2.2;return [12+4*Math.cos(a),18.5,Math.sin(a)*12] as P;}),'#c1bba5',1.4,.95);
  for(const side of [-1,1])for(let i=0;i<17;i++)this.line(b,[[-7+i*.55,18,side*8.5],[-9+i*.65,8,side*9],[-7+i*.6,5,side*7.4]],'#8e8a78',.85,.7);
  // Beard stays around the jaw; the active lips and tongue remain visible.
  for(let i=0;i<28;i++){const z=(i/27-.5)*13,x=8.5-3*Math.abs(z)/7;this.line(b,[[x,4,z],[x+.5,1,z*.88],[4.5,-3,z*.5]],i%3?'#9f9c89':'#d3d0b7',1,.85);}
  for(const side of [-1,1])for(let i=0;i<7;i++)this.line(b,[[11.5,6,side*(2+i*.65)],[10.7,4.8,side*(2.5+i*.65)]],'#b5ad94',.85,.7);
 }else{
  for(let i=0;i<33;i++){const z=(i/32-.5)*15,c=Math.sqrt(Math.max(0,1-(z/8)**2));this.line(b,Array.from({length:20},(_,j)=>{const a=j/19*Math.PI;return [-1-8.8*c*Math.cos(a),18+7.4*c*Math.sin(a),z] as P;}),'#c2ad7e',1,.85);}
  for(let i=0;i<26;i++){const z=(i/25-.5)*14;this.line(b,[[0,25,z],[6,24,z],[10,18-Math.abs(z)*.35,z*.9]],'#d0bc8b',1,.9);}
 }b.end();}
 private makeClothes(p:Person){const b=p.clothes,c=p.id==='sean'?seanColor:willColor;b.begin();const rings=[[-4,8,6],[-12,22,11],[-31,23,13],[-52,22,12]];for(const [y,x,z]of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],c,1,.85);for(let i=0;i<22;i++){const a=i/22*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)] as P),c,.85,.65);}
  if(p.id==='sean'){
   for(const side of [-1,1]){this.line(b,[[side*7,-3,7],[side*13,-10,11],[side*4,-14,13],[0,-7,12]],'#a7bec4',1.4,.95);this.line(b,[[side*16,-11,10],[side*5,-30,14],[0,-34,14]],'#bcc1a6',1.4,.95);}
   this.line(b,[[0,-6,12.7],[0,-35,14]],'#b5c7c8',1,.85);for(let j=0;j<8;j++){const y=-33-j*2;this.line(b,[[-21,y,10],[21,y,10]],'#8f9272',.8,.7);}for(const side of [-1,1])this.box(b,side<0?-19:11,-30,12,8,8,.2,'#b2a67d',.65);
  }else{for(const side of [-1,1]){this.line(b,[[side*7,-3,7],[side*16,-9,11],[side*7,-18,13]],c,1.6,.95);this.box(b,side<0?-19:7,-28,12,12,9,.4,c,.85);}this.line(b,[[0,-8,12.5],[0,-50,12.5]],'#b5a58a',1.3,.9);}
  b.end();}
 private tree(b:Beams,x:number,z:number,h:number,spread:number,willow=false){this.tube(b,[x,0,z],[x+7,h*.68,z],7,3,'#7f8064',.65);for(let k=0;k<9;k++){const a=k/9*TAU,end:P=[x+spread*Math.cos(a),h*(.66+.12*Math.sin(k)),z+spread*Math.sin(a)];this.line(b,[[x,h*.45,z],[x+12*Math.cos(a),h*.68,z],end],'#818971',1,.65);for(let j=0;j<5;j++){const off=j*4,pts=Array.from({length:18},(_,i)=>{const t=i/17;return [end[0]+(12+off)*Math.sin(a+t),end[1]+18*Math.sin(t*Math.PI)-(willow?h*.55:30)*t,end[2]+(12+off)*Math.cos(a+t)] as P;});this.line(b,pts,willow?'#7e9870':leaf,.85,.5);}}
  if(!willow)for(let k=0;k<13;k++){const a=k/13*TAU;this.ring(b,[x+spread*.6*Math.cos(a),h*.78+15*Math.sin(k),z+spread*.6*Math.sin(a)],[spread*.36,0,0],[0,spread*.25,spread*.1],leaf,.9,.5);}}
 private makePark(){const b=this.park;b.begin();
  for(const z of [-185,-105,85,111])this.line(b,[[-1400,0,z],[1400,0,z]],'#8d927b',1,.55);for(let i=0;i<30;i++){const z=-680+i*25;this.line(b,[[-1500,-1,z],[1500,-1,z]],'#476247',.8,.3);}for(let i=-12;i<=12;i++)this.line(b,[[i*95,0,-700],[i*95,0,90]],'#476247',.8,.25);
  for(const [x,z,h,w,isWillow]of [[-155,55,260,72,1],[230,-130,240,80,0],[-350,-180,280,95,0],[70,-340,210,90,0],[-200,-450,270,100,0],[480,-340,280,100,0],[-600,790,340,120,1],[-270,830,300,110,0],[80,835,280,95,1],[450,840,350,130,0],[820,730,300,100,1]])this.tree(b,x,z,h,w,!!isWillow);
  // The distant garden path, little flowering trees and other benches.
  for(const z of [790,820])this.line(b,Array.from({length:70},(_,i)=>[-1400+i*41,4,z+35*Math.sin(i*.08)] as P),'#8f9e79',1,.7);
  for(const x of [-930,-470,190,730]){for(let k=0;k<10;k++)this.ring(b,[x+Math.cos(k*3)*35,70+k%3*16,880+Math.sin(k*3)*25],[30,0,0],[0,20,0],'#aa8e9d',.85,.7);this.line(b,[[x,0,880],[x,88,880]],wood,1.1,.8);}
  for(const x of [-750,-260,320,780]){this.box(b,x,24,848,80,4,16,wood,.8);for(const dx of [9,65])this.box(b,x+dx,0,849,5,24,12,iron,.8);}
  b.end();}
 private landscape(t:number){const b=this.pond;b.begin();for(let j=0;j<38;j++){const z=125+j*17;this.line(b,Array.from({length:100},(_,i)=>{const x=-1300+i*26;return [x,-2+.65*Math.sin(x*.027+t*.65+z*.04),z+2*Math.sin(i*.42+t*.16)] as P;}),water,.85,.38);}b.end();
  const s=this.swans;s.begin();for(let k=0;k<5;k++){const x=-240+k*125+16*Math.sin(t*.035+k),z=390+k%2*55+12*Math.cos(t*.027+k),dir=k%2?1:-1;for(const a of [0,Math.PI/3,2*Math.PI/3])this.ring(s,[x,5,z],[14,0,0],[0,7*Math.cos(a),6*Math.sin(a)],'#c7d5c0',1.15,.85,18);this.line(s,[[x+dir*10,8,z],[x+dir*15,17,z],[x+dir*13,26,z],[x+dir*18,30,z],[x+dir*23,27,z]],'#d4decb',1.8,.9);this.line(s,[[x+dir*23,27,z],[x+dir*28,25,z]],'#b6aa7f',1.4,.9);for(let r=0;r<3;r++)this.ring(s,[x,0,z],[20+r*8,0,0],[0,0,8+r*4],water,.75,.4,22);}s.end();
  const w=this.walkers;w.begin();for(let k=0;k<9;k++){const x=-1000+((k*233+t*(k%2?3:-2)+1600)%2200),z=803+(k%3)*11,y=2,step=Math.sin(t*2+k);this.ring(w,[x,y+46,z],[4,0,0],[0,5,0],'#849b89',1,.65,10);this.line(w,[[x,y+41,z],[x,y+22,z],[x-5,y,z+step*4]],'#839986',1,.6);this.line(w,[[x,y+22,z],[x+5,y,z-step*4]],'#839986',1,.6);this.line(w,[[x-6,y+24,z-step*3],[x,y+36,z],[x+6,y+24,z+step*3]],'#8b9685',1,.6);}w.end();}
 private limbs(p:Person,q:ReturnType<typeof parkPose>){const b=p.limbs,c=p.id==='sean'?seanColor:willColor,stand=p.id==='sean'?q.stand:0,step=p.id==='sean'?q.steps:0;b.begin();for(const side of [-1,1]){const knee:P=[side*11,-61-20*stand,30*(1-stand)+step*side*10*stand],foot:P=[side*12,-96-48*stand,34*(1-stand)+step*side*17*stand];this.tube(b,[side*10,-50,0],knee,9,7,'#69777b');this.tube(b,knee,foot,7,4.5,'#69777b');this.box(b,foot[0]-5,foot[1]-2,foot[2]-3,10,6,17,'#898578',.8);
   const gesture=p.id==='sean'&&side===-1?q.gesture:0,elbow:P=[side*25,-34,12*(1-stand)],wrist:P=[side*(12+gesture*11),-46+gesture*10+q.breath,32*(1-stand)];this.tube(b,[side*22,-12,0],elbow,7,5,c);this.tube(b,elbow,wrist,5,3.5,c);this.ring(b,wrist,[4,0,0],[0,0,5],'#aeb9a7',1.2,.85,16);for(let i=0;i<4;i++)this.line(b,[[wrist[0]-3+i*2,wrist[1],wrist[2]+2],[wrist[0]-3+i*2,wrist[1]-2,wrist[2]+9]],'#aeb9a7',1,.8);if(p.id==='sean'&&side===1)this.ring(b,[wrist[0],wrist[1]+1,wrist[2]-4],[4,0,0],[0,4,0],'#c7c5a9',1.3,.9);}
  b.end();}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const b of this.beams)b.setResolution(this.width,this.height);for(const p of this.people)p.head.resize(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),q=parkPose(t),c=parkCamera(view,this.width/this.height,t);if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();const d=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog('#08100d',d+550,d+2200);this.landscape(q.t);
  for(const p of this.people){p.root.visible=view==='wide'||view==='park-bench'||view==='park-lake'||view==='park-pair'||view===p.id;p.root.position.set(...(p.id==='sean'?q.sean:q.will));p.root.rotation.y=p.id==='sean'?-q.walk*1.2:0;this.limbs(p,q);p.head.scene.rotation.set(0,-Math.PI/2+(p.id==='sean'?-q.seanTurn:q.willTurn),(p.id==='sean'?q.gazeUp-q.seanDown:-q.willDown));const msg=p.track.message(p.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic);p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);if(p.id==='will'){p.head.face.content=.06-.05*q.reaction;p.head.face.brow=.07+.10*q.reaction;}p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();}
}
