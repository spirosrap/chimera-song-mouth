import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {NEUTRAL} from '../../wasm/engine.ts';
import {arrivalCamera,arrivalPose,type ArrivalPoint as P} from '../../scene/arrival.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,olive='#7d8669',dark='#455e62',skin='#92b4bf',hair='#897458';
/** Ian's physical dialogue and Louise's silent reaction, at the field camp at dusk. */
export class ArrivalField{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,4000);
 readonly ian=new THREE.Group();readonly louise=new THREE.Group();readonly head=new Anatomy3D();readonly listenerHead=new Anatomy3D();
 readonly ianHair=new Beams();readonly louiseHair=new Beams();readonly ianClothes=new Beams();readonly louiseClothes=new Beams();readonly arms=new Beams();
 readonly ground=new Beams();readonly mountains=new Beams();readonly sky=new Beams();readonly camp=new Beams();
 private listenerModel:VoiceModel;private beams:Beams[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color(0x04090d);this.listenerModel=new VoiceModel({female:.65,child:0},track.sampleRate);
  this.beams=[this.ianHair,this.louiseHair,this.ianClothes,this.louiseClothes,this.arms,this.ground,this.mountains,this.sky,this.camp];
  this.head.centred=true;this.listenerHead.centred=true;
  this.head.attachAccessory(this.ianHair.group);this.listenerHead.attachAccessory(this.louiseHair.group);
  this.ian.add(this.head.scene,this.ianClothes.group);this.louise.add(this.listenerHead.scene,this.louiseClothes.group);
  this.scene.add(this.ian,this.louise,this.arms.group,this.ground.group,this.mountains.group,this.sky.group,this.camp.group);
  for(const [name,b] of Object.entries({ianHair:this.ianHair,louiseHair:this.louiseHair,ianClothes:this.ianClothes,louiseClothes:this.louiseClothes,arms:this.arms,ground:this.ground,mountains:this.mountains,sky:this.sky,camp:this.camp}))b.group.name=name;
  this.makeHair(this.ianHair,false);this.makeHair(this.louiseHair,true);this.makeClothes(this.ianClothes,false);this.makeClothes(this.louiseClothes,true);this.makeLandscape();this.makeCamp();this.resize(1280,720);this.frame(0,false,0,'ian',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6){this.line(b,Array.from({length:28},(_,i)=>{const a=i/28*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.6){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,angle:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(angle)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(angle)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);
  for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){
  for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);
  for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);
 }
 private makeHair(b:Beams,long:boolean){
  b.begin();
  for(let i=0;i<29;i++){const z=(i/28-.5)*14.5,c=Math.sqrt(1-(z/8)**2);this.line(b,Array.from({length:26},(_,j)=>{const a=j/25*Math.PI;return [-.5-8*c*Math.cos(a),17.8+6.8*c*Math.sin(a)+(long?0:.65*Math.sin(a*7+i*.4)),z] as P;}),hair,.9,.8);}
  if(long){
   for(const side of [-1,1])for(let i=0;i<16;i++)this.line(b,Array.from({length:30},(_,j)=>{const t=j/29;return [-8+i*.57-2.2*t,18-43*t,side*(7.4+2*Math.sin(t*3))+.6*Math.sin(t*9+i)] as P;}),'#998365',.85,.65);
   for(let i=0;i<11;i++)this.line(b,Array.from({length:22},(_,j)=>{const t=j/21;return [7-10*t,19+3*Math.sin(t*3),-5+i*.7-3*t] as P;}),hair,.85,.7);
  }else{
   for(let i=0;i<20;i++){const z=(i/19-.5)*13;this.line(b,[[1,23,z],[5,24.7+.55*Math.sin(i*1.7),z+.3],[8,22+Math.sin(i*.7),z+.6]],hair,.9,.85);}
  }b.end();
 }
 private makeClothes(b:Beams,woman:boolean){
  b.begin();const color=woman?dark:olive,floor=woman?-97:-105,rings=[[-4,6,5],[-11,woman?17:21,9],[-30,woman?16:20,10],[-49,woman?18:20,10]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],color,.9,.7);
  for(let i=0;i<19;i++){const a=i/19*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),color,.85,.55);}
  for(const side of [-1,1]){
   this.line(b,[[side*5,-3,5],[side*13,-10,10],[side*6,-20,11],[side*2,-14,11]],color,1.4,.85);
   this.line(b,[[side*6,-27,10.5],[side*16,-27,9.5],[side*15,-34,10],[side*7,-34,11]],color,1,.7,true);
   this.tube(b,[side*9,-48,0],[side*10,-74,1],7,5,dark);this.tube(b,[side*10,-74,1],[side*10,floor+3,2],5,3.8,dark);
   this.box(b,side*10-4,floor,-1,8,5,15,dark,.6);
  }
  this.line(b,[[0,-15,11.5],[0,-49,11]],'#a1ac94',1,.75);
  if(woman)for(let i=0;i<4;i++)this.ring(b,[0,-5,-4-i*.6],[11+i,0,0],[0,7,-3],dark,1,.6);
  b.end();
 }
 private makeLandscape(){
  const g=this.ground;g.begin();
  for(let z=-800;z<=250;z+=30)this.line(g,Array.from({length:55},(_,i)=>{const x=-1000+i*38;return [x,-6+2*Math.sin(x*.01+z*.003),z] as P;}),'#28534e',.8,.3);
  for(let x=-900;x<=900;x+=50)this.line(g,Array.from({length:30},(_,i)=>{const z=-800+i*37;return [x,-6+2*Math.sin(x*.01+z*.003),z] as P;}),'#28534e',.75,.2);g.end();
  const m=this.mountains;m.begin();
  for(let ridge=0;ridge<6;ridge++)for(let contour=0;contour<9;contour++)this.line(m,Array.from({length:150},(_,i)=>{const x=-1600+i*22,y=30+ridge*22+70*Math.sin(i*.035+ridge*.4)**2+27*Math.sin(i*.12+ridge)*Math.sin(i*.067);return [x,y-contour*7,-750-ridge*100+contour*10] as P;}),ridge%2?'#54727b':'#3c626b',.9,.35);m.end();
  const sky=this.sky;sky.begin();
  for(let cloud=0;cloud<13;cloud++)for(let stripe=0;stripe<3;stripe++)this.line(sky,Array.from({length:75},(_,i)=>{const x=-1500+i*42;return [x,185+cloud*17+stripe*3+Math.sin(i*.1+cloud*.8)*8,-1450-cloud*12] as P;}),cloud<4?'#a18f86':'#546d81',.9,cloud<4?.3:.2);
  for(let i=0;i<18;i++){const x=Math.sin(i*45.3)*1250,y=290+(Math.sin(i*37.7)+1)*130;this.line(sky,[[x-1,y,-1700],[x+1,y,-1700]],'#9da6ac',1,.4);}sky.end();
 }
 private makeCamp(){
  const b=this.camp;b.begin();
  for(const [x,z,w] of [[-260,-240,90],[-125,-325,75],[170,-280,95],[310,-220,80]]){
   for(const zz of [z,z-90])this.line(b,[[x-w/2,-5,zz],[x-w/2,22,zz],[x,48,zz],[x+w/2,22,zz],[x+w/2,-5,zz]],'#5c6e61',1,.5,true);
   for(const [dx,y] of [[-w/2,22],[0,48],[w/2,22]])this.line(b,[[x+dx,y,z],[x+dx,y,z-90]],'#5c6e61',.9,.45);
   this.line(b,[[x-10,-5,z+.2],[x-10,24,z+.2],[x+10,24,z+.2],[x+10,-5,z+.2]],'#788078',.9,.55);
  }
  for(const [x,z] of [[-350,-140],[245,-160]]){
   this.box(b,x,1,z,58,24,29,'#66756a',.6);this.box(b,x+40,25,z,18,13,29,'#7b8981',.6);
   for(const dx of [12,48])for(const zz of [z,z+29])this.ring(b,[x+dx,0,zz],[6,0,0],[0,6,0],'#53636d',1,.65);
  }
  for(const x of [-205,270]){this.line(b,[[x,-5,-240],[x,80,-240]],'#7c8b82',1,.7);this.box(b,x-5,77,-239,10,3,3,'#c8c4a0',.8);}
  b.end();
 }
 private movement(p:ReturnType<typeof arrivalPose>){
  const b=this.arms;b.begin();
  for(const [person,woman] of [[this.ian,false],[this.louise,true]] as const)for(const side of [-1,1]){
   const tr=(v:P)=>new THREE.Vector3(...v).applyMatrix4(person.matrixWorld).toArray() as P;
   const shoulder=tr([side*(woman?17:21),-12,0]),elbow=tr([side*25,-31,3]),wrist=tr([side*(woman?18:16),-46+p.breath,10]);
   this.tube(b,shoulder,elbow,5,4,woman?dark:olive,.7);this.tube(b,elbow,wrist,4,2.4,woman?dark:olive,.7);
   this.line(b,[tr([side*18,-46+p.breath,10]),tr([side*19,-52+p.breath,12]),tr([side*15,-53+p.breath,12]),tr([side*14,-47+p.breath,10])],skin,1,.7,true);
  }b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const h of [this.head,this.listenerHead])h.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=arrivalPose(t);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25){this.head.resetMotion();this.listenerHead.resetMotion();}
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=arrivalCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog(0x04090d,distance+950,distance+2700);
  this.ian.position.set(...p.ian);this.louise.position.set(...p.louise);this.ian.rotation.y=p.ianYaw;this.louise.rotation.y=p.louiseYaw;
  this.head.scene.rotation.set(0,-Math.PI/2,p.gazeUp*.30);this.listenerHead.scene.rotation.set(0,-Math.PI/2,.035-.08*p.reaction);
  this.listenerHead.face.content=.12+.3*p.reaction;this.listenerHead.face.brow=.08;this.listenerHead.face.lid=.08+.8*Math.max(0,1-Math.abs((t%5.7)-.16)/.13);
  this.scene.updateMatrixWorld(true);this.movement(p);for(const h of [this.head,this.listenerHead]){h.camera.copy(this.camera);h.camera.updateMatrixWorld();}
  const message=this.track.message(this.track.indexAt(t)),tele=playing?message:null,artic=VoiceModel.articFromArray(message.t.artic);
  this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  const quiet={...NEUTRAL,jaw:.05,lipAp:-.2};this.listenerHead.update(this.listenerModel,this.listenerModel.frame(quiet),quiet,null,{pressure:false,particles:false,grid:false,calipers:false},0);this.scene.updateMatrixWorld(true);
 }
 dispose(){this.ianHair.group.removeFromParent();this.louiseHair.group.removeFromParent();this.head.dispose();this.listenerHead.dispose();this.listenerModel.dispose();for(const b of this.beams)b.dispose();}
}
