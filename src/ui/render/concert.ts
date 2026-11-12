import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {concertCamera,concertPose,type ConcertPoint as P} from '../../scene/concert.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,teal='#4b7979',dark='#233f54',cream='#a9c2c9',blue='#289ee9',gold='#d4a86c';
/** The televised SOS performance: dark suit, hand microphone, sweeping light fans,
 * band and audience. Only the featured singer owns a physical model lease. */
export class ConcertStage {
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,5000);
 readonly singer=new THREE.Group();readonly head=new Anatomy3D();
 readonly hair=new Beams();readonly clothes=new Beams();readonly hands=new Beams();readonly microphone=new Beams();
 readonly architecture=new Beams();readonly furniture=new Beams();readonly musicians=new Beams();readonly audience=new Beams();readonly lights=new Beams();
 readonly lightCones:THREE.Mesh<THREE.ConeGeometry,THREE.MeshBasicMaterial>[]=[];
 private beams:Beams[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color(0x020610);
  this.beams=[this.hair,this.clothes,this.hands,this.microphone,this.architecture,this.furniture,this.musicians,this.audience,this.lights];
  this.singer.position.set(0,100,72);this.singer.add(this.head.scene,this.clothes.group,this.hands.group,this.microphone.group);this.head.centred=true;this.head.attachAccessory(this.hair.group);
  this.scene.add(this.singer,this.architecture.group,this.furniture.group,this.musicians.group,this.audience.group,this.lights.group);
  for(const [name,b] of Object.entries({hair:this.hair,clothes:this.clothes,hands:this.hands,microphone:this.microphone,architecture:this.architecture,furniture:this.furniture,musicians:this.musicians,audience:this.audience,lights:this.lights}))b.group.name=name;
  this.makeSinger();this.makeStage();this.makeFurniture();
  for(let i=0;i<16;i++){
   const mesh=new THREE.Mesh(new THREE.ConeGeometry(32,1,16,1,true),new THREE.MeshBasicMaterial({color:0x70bcff,transparent:true,opacity:.025,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));mesh.name='spotlight-'+i;this.scene.add(mesh);this.lightCones.push(mesh);
  }
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.7,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ellipse(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.7){this.line(b,Array.from({length:32},(_,i)=>{const a=i/32*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){
  for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);
  for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);
 }
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.65){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...z),axis=end.clone().sub(start).normalize();
  const u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const point=(t:number,ang:number)=>start.clone().lerp(end,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),color,.85,alpha,true);
  for(let i=0;i<8;i++)this.line(b,[point(0,i/8*TAU),point(1,i/8*TAU)],color,.85,alpha);
 }
 private person(b:Beams,x:number,y:number,z:number,scale:number,color:string,mouth=0,facing=1){
  // y is the neck; small ellipsoid heads are lightweight, visibly human extras.
  const p=(a:number,c:number,d:number):P=>[x+a*scale,y+c*scale,z+d*scale*facing];
  for(const yy of [2,7,12,17]){const r=Math.sqrt(Math.max(0,1-((yy-10)/11)**2));this.ellipse(b,p(0,yy,0),[7*r*scale,0,0],[0,0,6*r*scale],color,.85,.65);}
  for(const zz of [-1,0,1])this.ellipse(b,p(0,10,zz),[7*scale,0,0],[0,10*scale,0],color,.8,.5);
  this.line(b,[p(-3.8,12,5),p(-1.2,12,6)],cream,.85,.55);this.line(b,[p(1.2,12,6),p(3.8,12,5)],cream,.85,.55);
  this.ellipse(b,p(0,6,6),[2*scale,0,0],[0,(.4+2*mouth)*scale,0],mouth>.1?gold:color,.9,.75);
  const rings=[[-1,5,4],[-7,14,6],[-30,12,7]];
  for(const [yy,rx,rz] of rings)this.ellipse(b,p(0,yy,0),[rx*scale,0,0],[0,0,rz*scale],color,.9,.6);
  for(let i=0;i<10;i++){const a=i/10*TAU;this.line(b,rings.map(([yy,rx,rz])=>p(rx*Math.cos(a),yy,rz*Math.sin(a))),color,.8,.55);}
 }
 private makeSinger(){
  const b=this.clothes;b.begin();const rings=[[-4,5.2,4],[-10,16.5,7],[-28,14.5,7.4],[-44,14,7.2]];
  for(const [y,x,z] of rings)this.ellipse(b,[0,y,0],[x,0,0],[0,0,z],teal,1,.9);
  for(let i=0;i<20;i++){const a=i/20*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),teal,.9,.7);}
  for(const side of [-1,1]){
   this.line(b,[[side*5,-5,4],[side*10,-13,7.5],[side*4,-25,8],[side*2,-42,7.5]],cream,1,.65);
   this.tube(b,[side*7,-44,0],[side*8,-70,1],6,4.3,dark);this.tube(b,[side*8,-70,1],[side*8,-94,3],4.3,3.5,dark);this.box(b,side*8-4,-98,0,8,5,16,cream,.5);
  }
  this.line(b,[[-4,-6,5],[0,-8,6],[4,-6,5]],dark,1,.8);this.ellipse(b,[2,-28,8],[.65,0,0],[0,.65,0],cream,1,.8);b.end();
  const h=this.hair;h.begin();
  // Swept asymmetric dark quiff, with a visible side part and in-ear monitors.
  for(let i=0;i<28;i++){const z=(i/27-.5)*15,c=Math.sqrt(Math.max(0,1-(z/8)**2));this.line(h,Array.from({length:22},(_,j)=>{const a=j/21*Math.PI;return [-1-8*c*Math.cos(a),18+7*c*Math.sin(a)+2*Math.pow(Math.sin(a),2)*(1-z/10),z] as P;}),'#687786',.95,.9);}
  for(const side of [-1,1]){this.ellipse(h,[-2,12,side*8],[1.4,0,0],[0,2,0],cream,.9,.65);this.line(h,[[-2,12,side*8],[-4,7,side*8],[-4,2,side*5]],dark,.8,.75);}h.end();
 }
 private makeStage(){
  const b=this.architecture;b.begin();
  for(const y of [0,-5])this.ellipse(b,[0,y,-38],[350,0,0],[0,0,245],blue,1.2,.65);
  for(const r of [120,180,245,310])this.ellipse(b,[0,.3,-38],[r,0,0],[0,0,r*.7],teal,.9,.3);
  for(let a=0;a<TAU;a+=TAU/24)this.line(b,[[0,.2,-38],[350*Math.cos(a),.2,-38+245*Math.sin(a)]],dark,.8,.25);
  // Curved overhead lighting rig and vertical LED ribs behind the band.
  for(const y of [246,258,272])this.ellipse(b,[0,y,-150],[340,0,0],[0,0,100],blue,1.1,.6);
  for(let i=0;i<25;i++){const x=-336+i*28,z=-240+Math.abs(x)*.15;this.line(b,[[x,25,z],[x,245,z],[x+8,259,z]],blue,1.1,.42);}
  for(const side of [-1,1])for(let i=0;i<7;i++)this.box(b,side<0?-330:235,0,-218+i*14,95,i*5+5,14,blue,.4);
  b.end();
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1,96),new THREE.MeshBasicMaterial({color:0x03070d,side:THREE.DoubleSide}));floor.name='dark-stage-floor';floor.rotation.x=-Math.PI/2;floor.scale.set(350,245,1);floor.position.set(0,-.6,-38);this.scene.add(floor);
 }
 private makeFurniture(){
  const b=this.furniture;b.begin();
  // The empty microphone stand remains visible after the hand microphone is lifted.
  this.tube(b,[0,1,91],[0,108,91],.6,.6,cream,.75);this.ellipse(b,[0,109,91],[1.8,0,0],[0,1.8,0],cream,1,.8);
  for(let i=0;i<3;i++){const a=i/3*TAU;this.line(b,[[0,5,91],[14*Math.cos(a),1,91+14*Math.sin(a)]],cream,1,.6);}
  // Band risers, grand piano, drum kit, music stands and three backing microphones.
  for(const side of [-1,1])this.box(b,side<0?-285:95,0,-204,190,16,150,dark,.6);
  this.box(b,-265,48,-168,115,9,60,teal,.8);this.line(b,[[-265,57,-168],[-265,98,-218],[-150,98,-218],[-150,57,-168]],cream,1,.6);
  for(let i=0;i<35;i++)this.line(b,[[-262+i*3.1,58,-108],[-262+i*3.1,58,-120]],cream,.8,.8);
  for(const x of [-250,-165])this.line(b,[[x,48,-133],[x,16,-133]],dark,1,.9);
  this.ellipse(b,[190,39,-130],[24,0,0],[0,24,0],cream,1,.8);this.ellipse(b,[190,39,-118],[24,0,0],[0,24,0],blue,1,.6);
  for(const x of [157,219]){this.tube(b,[x,48,-153],[x,62,-153],12,12,cream,.7);this.ellipse(b,[x,90,-160],[25,0,0],[0,0,19],gold,1,.8);this.line(b,[[x,16,-160],[x,90,-160]],cream,.9,.8);}
  for(const x of [-94,-49,-4]){this.tube(b,[x,16,-205],[x,99,-205],.5,.5,cream,.7);this.tube(b,[x,99,-205],[x,100,-212],1,1,cream,.8);this.box(b,x-14,54,-185,28,22,1,dark,.7);}
  // Seated players have chairs and bent legs; standing guitarists keep both feet on the riser.
  for(const [x,y,z] of [[-205,83,-127],[190,91,-181],...Array.from({length:4},(_,i)=>[-280+i*47,78,-67])]){
   this.box(b,x-11,y-35,z-8,22,3,19,dark,.6);
   for(const side of [-1,1]){
    this.line(b,[[x+side*9,y-35,z],[x+side*9,16,z]],dark,.9,.65);
    this.tube(b,[x+side*5,y-30,z],[x+side*8,y-32,z+17],3.5,3,dark);
    this.tube(b,[x+side*8,y-32,z+17],[x+side*8,17,z+18],3,2.4,dark);
   }
  }
  for(const x of [106,270])for(const side of [-1,1]){
   this.tube(b,[x+side*6,78,-86],[x+side*8,18,-86],4,3,dark);
   this.box(b,x+side*8-3,16,-88,6,3,12,cream,.5);
  }
  for(const x of [-112,106])this.box(b,x-23,1,114,46,18,24,dark,.85);
  b.end();
 }
 private makePeople(time:number){
  const p=concertPose(time),b=this.musicians;b.begin();
  // Pianist, drummer, string players, guitarists and backing singers.
  this.person(b,-205,83,-127,.9,teal);this.person(b,190,91,-181,.9,teal);
  for(const side of [-1,1]){
   this.line(b,[[-205+side*13,76,-127],[-205+side*18,62,-115],[-205+side*(12+Math.sin(time*4)*3),59,-108]],cream,1,.8);
   const strike=Math.sin(time*8+side);this.line(b,[[190+side*13,84,-181],[190+side*21,73,-172],[190+side*25,76+strike*10,-150],[190+side*32,80+strike*15,-141]],cream,1,.8);
  }
  for(let i=0;i<4;i++){
   const x=-280+i*47,z=-67;this.person(b,x,78,z,.8,teal);
   this.ellipse(b,[x-6,68,z+12],[8,0,0],[0,4,0],gold,1,.8);this.line(b,[[x-18,69,z+12],[x+4,66,z+12]],cream,.9,.9);
   const bow=Math.sin(time*2.4+i*.3)*6*p.playing;this.line(b,[[x-15+bow,78,z+14],[x+12+bow,56,z+14]],gold,1.1,.8);
   for(const side of [-1,1])this.line(b,[[x+side*12,71,z],[x+side*15,59,z+8],[x+side*6+bow,66,z+13]],teal,1,.8);
  }
  for(const x of [106,270]){
   this.person(b,x,105,-86,.9,teal);this.ellipse(b,[x,66,-75],[13,0,0],[0,17,0],gold,1,.8);this.line(b,[[x+4,69,-75],[x+29,101,-75]],cream,1.8,.9);
   for(const side of [-1,1])this.line(b,[[x+side*13,98,-86],[x+side*20,79,-80],[x+(side<0?22:Math.sin(time*7)*4),side<0?92:68,-73]],cream,1,.7);
  }
  const energy=this.track.message(this.track.indexAt(time)).t.outRms;
  for(let i=0;i<3;i++){
   const x=-94+i*45,y=106+Math.sin(time*.7+i)*1.2;this.person(b,x,y,-221,.86,teal,time>204&&time<224?Math.min(1,energy*8):0);
   for(const side of [-1,1]){this.tube(b,[x+side*6,y-28,-221],[x+side*7,16,-221],4,3,dark);this.line(b,[[x+side*12,y-7,-221],[x+side*17,y-25,-216],[x+side*12,y-42,-214]],teal,.9,.8);}
  }b.end();
  const a=this.audience;a.begin();
  for(let row=0;row<4;row++)for(let i=0;i<17;i++){
   const x=-296+i*37+(row%2)*10,y=18-row*4,z=231+row*34;this.person(a,x,y,z,.62,blue,0,-1);this.box(a,x-11,y-22,z+8,22,31,3,dark,.5);
   const cheer=p.applause+(time>90&&time<110?.4:0),clap=(.5+.5*Math.sin(time*10+i*.7+row))*cheer;
   for(const side of [-1,1])this.line(a,[[x+side*9,y-5,z],[x+side*13,y-12,z-3],[x+side*(10-8*clap),y-13+12*cheer,z-11]],teal,.9,.7);
  }a.end();
 }
 private makeHands(time:number){
  const p=concertPose(time),b=this.hands;b.begin();const right:P=[5*p.handheld,5+2*p.handheld-30*p.micLower+16*p.high,19-2*p.handheld-2*p.micLower-4*p.high];
  const left:P=[-15-28*p.reach+12*p.chest+6*p.ear,-40+35*p.chest+52*p.ear+70*p.raise+23*p.reach,9+7*p.chest+9*p.reach-5*p.ear];
  for(const [side,wrist] of [[1,right],[-1,left]] as [number,P][]){
   const elbow:P=[side*(21+8*p.reach),-23+18*p.ear*(side<0?1:0)+25*p.raise*(side<0?1:0),7];
   this.tube(b,[side*16,-10,0],elbow,4.5,3.2,teal);this.tube(b,elbow,wrist,3.2,2,teal);this.ellipse(b,wrist,[2.5,0,0],[0,3.2,0],cream,1,.9);
   for(let i=0;i<4;i++)this.line(b,[[wrist[0]-1.5+i,wrist[1],wrist[2]],[wrist[0]-1.5+i,wrist[1]+(side>0?3:5),wrist[2]+(side>0?2:p.raise?3:0)]],cream,.9,.85);
  }b.end();
  const m=this.microphone;m.begin();const tip:P=[p.handheld,10-30*p.micLower+14*p.high,19-4*p.handheld-5*p.high],base:P=[6*p.handheld,-3-29*p.micLower+24*p.high,19+3*p.handheld-4*p.high];
  this.tube(m,base,tip,1.2,1.5,cream,.95);for(let i=0;i<5;i++)this.ellipse(m,[tip[0],tip[1]+i*.5,tip[2]],[1.8,0,0],[0,0,1.8],cream,.9,.95);m.end();
 }
 private makeLights(time:number){
  const p=concertPose(time),b=this.lights;b.begin();const hue=new THREE.Color(blue).lerp(new THREE.Color('#ffac36'),p.warmth).lerp(new THREE.Color('#ef273d'),p.red),color='#'+hue.getHexString();
  this.scene.background=new THREE.Color(0x020610).lerp(new THREE.Color(0x190407),p.red*.7);
  for(let i=0;i<16;i++){
   const side=i<8?-1:1,j=i%8,x=side*(75+j*35),source:P=[x,246+(j%2)*12,-150];
   const sweep=Math.sin(time*.22+j*.33)*38,target:P=[side*(100+j*21)+sweep,2,40+Math.sin(time*.17+j)*70];
   const beamColor=p.white>.5&&i%3!==0?'#c9e8ff':color;
   this.ellipse(b,source,[4,0,0],[0,0,4],beamColor,2,.95);
   for(const dx of [-5,0,5])this.line(b,[source,[target[0]+dx*4,target[1],target[2]+dx*2]],beamColor,1.2,.12+.13*p.white);
   this.ellipse(b,target,[21,0,0],[0,0,15],beamColor,1.3,.2);
   const s=new THREE.Vector3(...source),t=new THREE.Vector3(...target),mesh=this.lightCones[i],axis=s.clone().sub(t),length=axis.length();mesh.position.copy(s).add(t).multiplyScalar(.5);mesh.scale.set(1,length,1);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());mesh.material.color.set(beamColor);mesh.material.opacity=.012+.012*p.white;
  }
  for(let i=0;i<14;i++){const x=-300+i*46;this.line(b,[[x,5,-200],[x+Math.sin(time*.15+i)*50,230,-210]],color,1.2,.6);}
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0));if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)this.head.resetMotion();this.epoch=epoch;
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;const p=concertPose(t),c=concertCamera(view,this.width/this.height,t);
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const d=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog(this.scene.background as THREE.Color,d+(view==='dimash'?30:200),d+(view==='dimash'?330:720));
  this.singer.rotation.set(p.bow*.35+p.lean*.2,0,p.sway);this.head.scene.rotation.set(-.32*p.high,-Math.PI/2-.04,-p.lean*.4);
  this.makeHands(t);this.makePeople(t);this.makeLights(t);this.scene.fog.color.copy(this.scene.background as THREE.Color);
  const message=this.track.message(this.track.indexAt(t)),tele=playing?message:null;this.head.face.update(tele,dt);this.head.face.lid=.4+Math.min(.45,message.t.outRms*1.5);
  this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();const artic=VoiceModel.articFromArray(message.t.artic);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();for(const b of this.beams)b.dispose();this.scene.traverse(o=>{if(o instanceof THREE.Mesh&&o.name==='dark-stage-floor'){o.geometry.dispose();(o.material as THREE.Material).dispose();}});for(const m of this.lightCones){m.geometry.dispose();m.material.dispose();}}
}
