import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import type {VoiceModel} from '../analysis.ts';
import {VoiceModel as Model} from '../analysis.ts';
import {contactCamera,contactPose,type ContactPerson,type BeachPoint as P} from '../../scene/contact.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,white='#c3d5e7',blue='#388eb7',dark='#30485a',tan='#b38c55',gold='#cba779',pink='#ba64be',water='#24a6cd';
interface Person{ id:ContactPerson; model:VoiceModel; track:TeleTrack; root:THREE.Group; head:Anatomy3D; hair:Beams; outfit:Beams; arms:Beams; gear:Beams; }
/** The supplied Contact beach: physical speakers inside a moving, remembered shoreline. */
export class ContactBeach{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,4000);
 readonly people:Person[]=[];readonly shore=new Beams();readonly ocean=new Beams();readonly forest=new Beams();readonly stars=new Beams();readonly galaxy=new Beams();readonly sand=new Beams();
 private beams:Beams[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(cast:{id:ContactPerson;model:VoiceModel;track:TeleTrack}[]){
  this.scene.background=new THREE.Color(0x080511);
  for(const c of cast){
   const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),outfit:new Beams(),arms:new Beams(),gear:new Beams()};
   p.head.centred=true;p.head.scene.rotation.y=-Math.PI/2;p.head.attachAccessory(p.hair.group);p.head.attachAccessory(p.gear.group);
   p.root.add(p.head.scene,p.outfit.group,p.arms.group);this.scene.add(p.root);this.people.push(p);
   for(const [name,b] of Object.entries({hair:p.hair,outfit:p.outfit,arms:p.arms,gear:p.gear})){b.group.name=c.id+'-'+name;this.beams.push(b);}
   this.makeHair(p);this.makeGear(p);
  }
  for(const [name,b] of Object.entries({shore:this.shore,ocean:this.ocean,forest:this.forest,stars:this.stars,galaxy:this.galaxy,sand:this.sand})){b.group.name=name;this.scene.add(b.group);this.beams.push(b);}
  this.makeShore();this.makeForest();this.makeStars();this.resize(1280,720);this.frame(0,false,0,'ellie',0);
 }
 private line(b:Beams,points:P[],color:string,width=1,alpha=.65,close=false){b.line(points.flat(),points.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.65){this.line(b,Array.from({length:32},(_,i)=>{const a=i/32*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.6){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);
  for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 private hand(b:Beams,w:P,color:string,cup=0){
  const [x,y,z]=w;this.line(b,[[x-2,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2,y,z]],color,1,.85,true);
  for(let i=0;i<4;i++){const dx=-1.6+i;this.line(b,[[x+dx,y+3,z+1],[x+dx,y+6,z+2],[x+dx,y+6.5-cup*2,z+3+cup*2]],color,.8,.75);}
  this.line(b,[[x+2,y+1,z],[x+4,y+3,z+1],[x+3,y+5,z+3]],color,.8,.8);
 }
 private makeHair(p:Person){
  const b=p.hair,woman=p.id==='ellie';b.begin();
  for(let i=0;i<26;i++){const z=(i/25-.5)*14.5,c=Math.sqrt(1-(z/8)**2);this.line(b,Array.from({length:22},(_,j)=>{const a=j/21*Math.PI;return [-.5-8*c*Math.cos(a),17.4+6.8*c*Math.sin(a)+.3*Math.sin(a*4+i*.3),z] as P;}),woman?'#8c745d':gold,.85,.7);}
  if(woman){
   for(const side of [-1,1])for(let i=0;i<9;i++)this.line(b,Array.from({length:20},(_,j)=>{const t=j/19;return [4-i*.8-15*t,18-9*t,side*(7.5-4*t)] as P;}),'#8c745d',.85,.65);
   for(let i=0;i<7;i++)this.line(b,Array.from({length:30},(_,j)=>{const t=j/29;return [-11-2*Math.sin(t*2),10-31*t,(i-3)*.6+Math.sin(t*22+i)*.9] as P;}),'#a68b6a',.9,.75);
  }b.end();
 }
 private makeGear(p:Person){
  const b=p.gear;b.begin();
  if(p.id==='ellie'){
   for(const z of [7.7,8.3])this.ring(b,[-.9,14,z],[2.1,0,0],[0,2.9,0],dark,1.4,.95);
   this.line(b,[[-2,16,8],[0,21,7],[1,23,0],[0,21,-7],[-2,16,-8]],white,1,.75);
   this.line(b,[[0,13.5,8],[6,9,8],[9.1,8,4],[9.3,8,1]],dark,2,.95);
   this.tube(b,[9.3,8,-.1],[9.3,8,1.8],.5,.5,white,.8);
   this.line(b,[[-1,12,8],[-6,4,8],[-6,-6,7]],dark,1,.75);
  }b.end();
 }
 private outfit(p:Person,sit:number,step:number){
  const b=p.outfit,woman=p.id==='ellie',color=woman?white:tan;b.begin();
  const rings=[[-5,6,5],[-12,woman?17:21,9],[-30,woman?16:20,9],[-44,woman?16:19,9]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],color,.9,.65);
  for(let i=0;i<18;i++){const a=i/18*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),color,.85,.5);}
  this.line(b,[[-7,-6,5],[-10,-13,10],[0,-18,11],[10,-13,10],[7,-6,5]],color,1.4,.8);
  this.line(b,[[0,-18,11],[0,-43,10]],color,1,.7);
  if(woman){
   for(const side of [-1,1])for(let i=0;i<4;i++)this.line(b,[[side*(10+i*2),-9,7],[side*(15+i*1.5),-17,6]],dark,2,.95);
   for(const y of [-27,-30,-33])this.line(b,[[-16,y,10],[-6,y,10]],blue,1.3,.9);
   this.ring(b,[10,-23,10],[3.5,0,0],[0,3.5,0],blue,1.2,.85);
  }else for(const y of [-21,-28,-35,-41])this.ring(b,[0,y,11],[.55,0,0],[0,.55,0],white,.8,.8);
  for(const side of [-1,1]){
   const knee:P=[side*(9+sit*13),-70+sit*10,2+sit*27+step*side*5],foot:P=[side*(9+sit*26),-94+sit*34,6+sit*13-step*side*5];
   this.tube(b,[side*9,-44,0],knee,7,5,woman?white:dark);this.tube(b,knee,foot,5,3.8,woman?white:dark);
   this.tube(b,foot,[foot[0],foot[1],foot[2]+12],4,4,dark,.8);
  }b.end();
 }
 private arms(p:Person,pose:ReturnType<typeof contactPose>){
  const b=p.arms,woman=p.id==='ellie',color=woman?white:tan;b.begin();
  for(const side of [-1,1]){
   let w:P=[side*18,-48+pose.sit*9,8+pose.sit*12],elbow:P=[side*25,-29,3];
   if(woman&&side===-1&&pose.point){const u=pose.point;w=[-18-12*u,-48+63*u,8+33*u];elbow=[-25,-29+25*u,3+17*u];}
   const embrace=pose.hug;
   w=w.map((x,i)=>x*(1-embrace)+[side*14,-18,36][i]*embrace) as P;elbow=elbow.map((x,i)=>x*(1-embrace)+[side*25,-22,18][i]*embrace) as P;
   if(!woman&&side===1){const u=pose.touch;w=w.map((x,i)=>x*(1-u)+[-9,6,28][i]*u) as P;}
   if(!woman&&side===-1){const u=pose.sand;w=w.map((x,i)=>x*(1-u)+[-10,-24,32][i]*u) as P;}
   if((woman&&side===1)||(!woman&&side===-1)){
    const u=pose.joined,position=pose[p.id],yaw=woman?pose.ellieYaw:pose.fatherYaw;
    const dx=(woman?-2:2)-position[0],dz=24-position[2];
    const joined:P=[dx*Math.cos(yaw)-dz*Math.sin(yaw),23-position[1],dx*Math.sin(yaw)+dz*Math.cos(yaw)];
    w=w.map((x,i)=>x*(1-u)+joined[i]*u) as P;
   }
   this.tube(b,[side*(woman?17:21),-13,0],elbow,5,4,color,.65);this.tube(b,elbow,w,4,2.1,color,.65);this.hand(b,w,white,!woman?pose.sand:0);
  }b.end();
 }
 private makeShore(){
  const b=this.shore;b.begin();
  for(let z=-70;z<=380;z+=16)this.line(b,Array.from({length:65},(_,i)=>{const x=-460+i*14.5;return [x,-7+Math.sin(x*.015+z*.01)*.6,z+.0004*x*x] as P;}),pink,.8,.28);
  for(let x=-460;x<=460;x+=22)this.line(b,Array.from({length:30},(_,i)=>[x,-7+Math.sin(x*.015+i*.16)*.6,-70+i*16+.0004*x*x]),pink,.7,.2);
  for(let k=0;k<4;k++)this.line(b,Array.from({length:90},(_,i)=>{const x=-600+i*14;return [x,-7.2,-74+.0004*x*x-k*3] as P;}),k%2?white:pink,1.2,.6);
  b.end();
 }
 private makeForest(){
  const b=this.forest;b.begin();
  for(const [x,z,h,lean] of [[185,-100,150,-36],[235,-110,175,-30],[325,-50,155,-50],[-310,-80,145,28],[390,35,185,-50]]){
   const top:P=[x+lean,h-7,z];this.tube(b,[x,-7,z],top,7,3,'#62765b',.55);
   for(let j=0;j<9;j++){const a=j/9*TAU;const points=Array.from({length:25},(_,i)=>{const t=i/24;return [top[0]+Math.cos(a)*100*t,top[1]+25*Math.sin(t*Math.PI)-55*t*t,top[2]+Math.sin(a)*100*t] as P;});this.line(b,points,'#45765b',1,.65);
    for(let k=3;k<23;k+=2){const t=k/24,c=points[k];for(const side of [-1,1])this.line(b,[c,[c[0]+Math.cos(a+side*.7)*18*(1-t),c[1]-7,c[2]+Math.sin(a+side*.7)*18*(1-t)]],'#36634c',.8,.55);}
   }
  }
  for(let j=0;j<25;j++){const x=120+j*15,z=-100+Math.sin(j*.9)*30;this.line(b,Array.from({length:22},(_,i)=>{const a=i/21*Math.PI;return [x-25*Math.cos(a),-7+28*Math.sin(a)*(1+.2*Math.sin(j)),z] as P;}),'#356549',.8,.45);}
  b.end();
 }
 private makeStars(){
  const b=this.stars;b.begin();const rnd=(n:number)=>{const z=Math.sin(n*127.1+311.7)*43758.5453;return z-Math.floor(z);};
  for(let i=0;i<420;i++){const x=(rnd(i*3)-.5)*2100,y=30+rnd(i*3+1)*680,z=-700-rnd(i*3+2)*200,r=.6+rnd(i*8)*1.7,c=i%4===0?'#d889da':i%5===0?'#8db9df':white;
   this.line(b,[[x-r,y,z],[x+r,y,z]],c,.85,.5);this.line(b,[[x,y-r,z],[x,y+r,z]],c,.85,.5);
  }b.end();
 }
 private scenery(time:number,pose:ReturnType<typeof contactPose>){
  const o=this.ocean;o.begin();
  for(let j=0;j<50;j++){const z=-85-j*12;this.line(o,Array.from({length:100},(_,i)=>{const x=-1000+i*20;return [x,-9+1.7*Math.sin(x*.017+j*.8-time*.7),z+2*Math.sin(x*.014+time*.5+j)] as P;}),j%5===0?'#6ed3e8':water,j%5===0?1.3:.8,.33+(.18*(1-j/50)));}o.end();
  const g=this.galaxy;g.begin();const center:P=[-145,270,-600];
  for(let arm=0;arm<5;arm++)for(let lane=0;lane<7;lane++)this.line(g,Array.from({length:110},(_,i)=>{const t=i/109,r=6+t*150,a=arm/5*TAU+t*7.8+time*.022+lane*.012;return [center[0]+r*Math.cos(a),center[1]+r*.58*Math.sin(a)+lane*.6,center[2]+r*.2*Math.sin(a)] as P;}),lane<2?'#eea2ce':'#703c91',lane<2?1.3:.8,lane<2?.7:.32);
  for(let i=0;i<10;i++)this.ring(g,center,[6+i*1.5,0,0],[0,3+i,0],i<3?'#ffe5d3':'#dd87b9',1.4,.7);g.end();
  const s=this.sand;s.begin();
  if(pose.sand>.01){const person=this.people.find(p=>p.id==='father')!;for(let i=0;i<30;i++){const age=(time*.55+i*.127)%1,point=new THREE.Vector3(-10+(i%5-2)*.4,-18-age*21,34+(i%3-1)*.6).applyMatrix4(person.root.matrixWorld);this.line(s,[[point.x,point.y,point.z],[point.x+.3,point.y+.5,point.z]],i%3?'#d8b3d4':'#90e1ef',1.1,pose.sand*.8);}}s.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);this.camera.aspect=this.width/this.height;}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const duration=Math.max(...this.people.map(p=>p.track.duration)),t=Math.max(0,Math.min(duration,Number.isFinite(time)?time:0)),pose=contactPose(t);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();
  this.epoch=epoch;const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;
  const c=contactCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog(0x080511,distance+900,distance+2500);
  for(const p of this.people){p.root.visible=p.id==='ellie'||pose.visible;p.root.position.set(...pose[p.id]);p.root.rotation.y=p.id==='ellie'?pose.ellieYaw:pose.fatherYaw;p.head.scene.rotation.z=p.id==='ellie'?-pose.gazeUp*.28:pose.sand*.09;this.outfit(p,pose.sit,p.id==='father'?pose.step:0);this.arms(p,pose);}
  this.scene.updateMatrixWorld(true);this.scenery(t,pose);
  for(const p of this.people){p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();const message=p.track.message(p.track.indexAt(t)),tele=playing?message:null,artic=Model.articFromArray(message.t.artic);p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.gear.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();}
}
