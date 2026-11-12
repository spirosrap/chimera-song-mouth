import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {riverCamera,riverPose,type RiverPoint as P} from '../../scene/river.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,teal='#456a8a',dark='#253850',cream='#c1c4ca',blue='#269fe9',gold='#b08a61';
/** Rechenka's river stage: the physical singer, dock and boat, shadow dancers,
 * water/forest backdrop, blue floor mist and televised reactions. */
export class RiverStage {
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,5000);
 readonly singer=new THREE.Group();readonly head=new Anatomy3D();
 readonly hair=new Beams();readonly clothes=new Beams();readonly hands=new Beams();readonly microphone=new Beams();
 readonly architecture=new Beams();readonly furniture=new Beams();readonly dancers=new Beams();readonly audience=new Beams();readonly lights=new Beams();readonly judges=new Beams();readonly forest=new Beams();readonly water=new Beams();readonly boat=new Beams();
 readonly mist:THREE.Mesh<THREE.CircleGeometry,THREE.MeshBasicMaterial>[]=[];
 private beams:Beams[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color(0x010817);
  this.beams=[this.hair,this.clothes,this.hands,this.microphone,this.architecture,this.furniture,this.dancers,this.audience,this.lights,this.judges,this.forest,this.water,this.boat];
  this.singer.position.set(0,106,54);this.singer.add(this.head.scene,this.clothes.group,this.hands.group,this.microphone.group);this.head.centred=true;this.head.attachAccessory(this.hair.group);
  this.scene.add(this.singer,...this.beams.filter(b=>![this.hair,this.clothes,this.hands,this.microphone].includes(b)).map(b=>b.group));
  for(const [name,b] of Object.entries({hair:this.hair,clothes:this.clothes,hands:this.hands,microphone:this.microphone,architecture:this.architecture,furniture:this.furniture,dancers:this.dancers,audience:this.audience,lights:this.lights,judges:this.judges,forest:this.forest,water:this.water,boat:this.boat}))b.group.name=name;
  this.makeSinger();this.makeStage();this.makeFurniture();
  for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x197fa8,transparent:true,opacity:.035,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.name='floor-mist';m.rotation.x=-Math.PI/2;this.scene.add(m);this.mist.push(m);}
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
  const b=this.clothes;b.begin();const rings=[[-3,4.8,3.8],[-10,14,6],[-30,11.5,6],[-45,13,7],[-65,15,8],[-85,18,10],[-99,20,11]];
  for(const [y,x,z] of rings)this.ellipse(b,[0,y,0],[x,0,0],[0,0,z],cream,1,.8);
  // A long grey crochet dress, with its uneven net-like vertical pattern.
  for(let i=0;i<30;i++){const a=i/30*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),cream,.85,.7);}
  for(let y=-10;y>=-98;y-=4){const radius=12+Math.max(0,-y-38)*.13;const pts=Array.from({length:40},(_,i)=>{const a=i/40*TAU;return [radius*Math.cos(a),y+2*Math.sin(i*1.8+y),radius*.54*Math.sin(a)] as P;});this.line(b,pts,cream,.8,.48,true);}
  this.line(b,[[-4,-3,4],[0,-7,6],[4,-3,4]],dark,1,.9);b.end();
  const h=this.hair;h.begin();
  // Straight dark hair below the shoulders and a blunt fringe across the forehead.
  for(let i=0;i<44;i++){
   const a=.38+i/43*(TAU-.76),z=8.5*Math.sin(a),x=-1-9*Math.cos(a);
   const top=24-3*Math.abs(Math.sin(a));this.line(h,[[x*.5,top,z*.5],[x,18,z],[x*1.04,2,z*1.1],[x*1.05-2,-19,z*1.14],[x*1.1-2,-34+Math.sin(i)*3,z*1.3]],'#52637c',.85,.72);
  }
  for(let i=0;i<25;i++){const z=-7.5+i/24*15;this.line(h,[[-1,24,z*.7],[5.5,22,z],[8,17,z],[8.5,14.5+.4*Math.cos(i),z]],'#627189',.85,.85);}h.end();
 }
 private makeStage(){
  const b=this.architecture;b.begin();
  this.ellipse(b,[0,-1,-45],[340,0,0],[0,0,245],blue,1.3,.7);
  for(const x of [-315,-105,105])this.box(b,x,12,-238,205,250,4,blue,.55);
  for(const y of [265,278])this.line(b,[[-350,y,-218],[-250,y,-265],[250,y,-265],[350,y,-218]],blue,1.3,.7);
  // A wooden dock with six mooring posts surrounds the shallow boat.
  for(let i=0;i<17;i++)this.box(b,-112,1,-142+i*12,224,5,11,gold,.6);
  for(const x of [-125,125])for(const z of [-126,-42,74])this.tube(b,[x,0,z],[x,35+(z<0?6:0),z],5.2,4.5,gold,.85);
  b.end();
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1,96),new THREE.MeshBasicMaterial({color:0x020812,side:THREE.DoubleSide}));floor.name='river-floor';floor.rotation.x=-Math.PI/2;floor.scale.set(340,245,1);floor.position.set(0,-2,-45);this.scene.add(floor);
 }
 private makeFurniture(){
  const b=this.furniture;b.begin();
  for(let i=0;i<4;i++){
   const x=-177+i*118;this.box(b,x-27,0,300,54,78,14,dark,.85);
   for(const y of [15,35,55,78])this.line(b,[[x-27,y,314],[x+27,y,314]],blue,2,.9);
   for(const side of [-1,1])this.box(b,x+side*26-4,18,278,8,27,28,cream,.65);
   this.box(b,x-28,27,265,56,6,20,cream,.8);this.ellipse(b,[x,35,274],[5,0,0],[0,0,5],blue,1.6,.9);
  }b.end();
 }
 private makeBoat(time:number){
  const p=riverPose(time),b=this.boat;b.begin();
  for(const [y,rx,rz] of [[4,94,20],[16,111,29],[29,120,32]])this.ellipse(b,[0,y,44],[rx,0,0],[0,0,rz],gold,1.3,.9);
  for(let i=0;i<28;i++){const a=i/28*TAU;this.line(b,[[94*Math.cos(a),4,44+20*Math.sin(a)],[111*Math.cos(a),16,44+29*Math.sin(a)],[120*Math.cos(a),29,44+32*Math.sin(a)]],gold,.85,.6);}
  for(const x of [-50,45])this.box(b,x-6,19,20,12,3,48,gold,.8);b.end();this.boat.group.rotation.z=.007*Math.sin(time*.8)*p.boat;
 }
 private makePeople(time:number){
  const p=riverPose(time),b=this.dancers;b.begin();
  for(let i=0;i<6;i++){
   const side=i<3?-1:1,j=i%3,phase=time*1.35+i*.8;
   const x=side*(55+j*35)+Math.sin(phase*.3)*10*p.danceWave,z=-68-j*27+28*p.danceWave*Math.sin(phase*.2);
   const crouch=(.5+.5*Math.sin(phase*.4))*24*p.danceWave+26*p.kneel,y=92-crouch;
   const color=p.dancers>0?'#507390':dark;
   this.person(b,x,y,z,.86,color);
   for(const s of [-1,1]){
    this.tube(b,[x+s*5,y-28,z],[x+s*10,y-50,z+3],4,3,dark);this.tube(b,[x+s*10,y-50,z+3],[x+s*15,6,z+8],3,2.5,dark);
    const wrist:P=[x+s*(26+13*Math.sin(phase)),y-12+24*Math.sin(phase+s)*p.danceWave,z+12+8*Math.cos(phase)];
    this.tube(b,[x+s*12,y-7,z],[x+s*23,y-17,z+4],3,2.5,color);this.tube(b,[x+s*23,y-17,z+4],wrist,2.5,1.5,color);
   }
  }b.end();this.dancers.group.visible=p.dancers>0;
  const j=this.judges;j.begin();
  for(let i=0;i<4;i++){
   const x=-177+i*118,y=62;this.person(j,x,y,292,.95,i%2?cream:teal,0,-1);
   const clap=p.applause*(.5+.5*Math.sin(time*10+i));
   for(const side of [-1,1])this.line(j,[[x+side*13,y-7,292],[x+side*18,37,280],[x+side*(12-9*clap),38+18*p.applause,271]],cream,1,.8);
  }j.end();
  const a=this.audience;a.begin();
  for(const side of [-1,1])for(let row=0;row<4;row++)for(let i=0;i<9;i++){
   const x=side*(240+row*29),z=-110+i*37,y=32+row*11;this.person(a,x,y,z,.6,blue,0,1);
   const clap=(.5+.5*Math.sin(time*9+i+row))*p.applause;
   for(const s of [-1,1])this.line(a,[[x+s*8,y-4,z],[x+s*12,y-13,z+5],[x+s*(9-7*clap),y-15+12*p.applause,z+10]],teal,.85,.7);
  }a.end();
 }
 private makeHands(time:number){
  const p=riverPose(time),b=this.hands;b.begin();const right:P=[6,3-34*p.micLower,18];
  const left:P=[-17-24*p.reach+14*p.chest,-38+70*p.raise+35*p.chest+27*p.reach,8+10*p.chest+12*p.reach];
  for(const [side,wrist] of [[1,right],[-1,left]] as [number,P][]){
   const elbow:P=[side*(20+8*p.reach),-22+25*p.raise*(side<0?1:0),5];
   this.tube(b,[side*14,-10,0],elbow,4.3,3,cream,.7);this.tube(b,elbow,wrist,3,1.8,cream,.75);
   for(let i=0;i<5;i++)this.line(b,[[wrist[0]-2+i,wrist[1],wrist[2]],[wrist[0]-2+i,wrist[1]+(side>0?3:5),wrist[2]+2]],cream,.85,.9);
  }b.end();
  const m=this.microphone;m.begin();const tip:P=[1,8-34*p.micLower,17],base:P=[7,-7-34*p.micLower,21];
  this.tube(m,base,tip,1.1,1.4,cream,.95);for(let i=0;i<5;i++)this.ellipse(m,[tip[0],tip[1]+i*.5,tip[2]],[1.8,0,0],[0,0,1.8],cream,.85,.9);m.end();
 }
 private makeEnvironment(time:number){
  const p=riverPose(time),f=this.forest;f.begin();
  // Weeping branches on the large LED backdrop, replaced by rippling vertical water.
  for(let tree=0;tree<9;tree++){
   const x=-300+tree*75,z=-228;
   this.line(f,[[x,18,z],[x-8,110,z],[x+7,193,z],[x-12,255,z]],teal,2,.8*(1-p.waterfall));
   for(let n=0;n<10;n++){
    const side=n%2?-1:1,top=168+n*8,bx=x+side*(20+n*3);
    this.line(f,[[x,top-22,z],[bx,top,z],[bx+side*25,top-8,z]],blue,1,.65*(1-p.waterfall));
    this.line(f,Array.from({length:12},(_,k)=>[bx+Math.sin(time*.25+k*.45+n)*3,top-k*13,z+1] as P),blue,.85,.65*(1-p.waterfall));
   }
  }f.end();
  const w=this.water;w.begin();
  for(let i=0;i<46;i++){
   const x=-305+i*13.5,bright=.2+.75*p.waterfall;
   this.line(w,Array.from({length:35},(_,j)=>[x+4*Math.sin(j*.9+time*1.5+i),16+j*7,-225] as P),i%3?'#328bdf':'#8af0ff',i%3?1:1.6,bright*(.45+.35*Math.sin(i+time*.9)**2));
  }
  for(let i=0;i<24;i++){
   const z=-160+i*17+3*Math.sin(time*.6+i),rx=90+i*6;
   this.line(w,Array.from({length:32},(_,j)=>[-rx+j/31*rx*2,-.3,z+3*Math.sin(j*.5+time)] as P),blue,.85,.16+.22*p.waterfall);
  }w.end();
  const b=this.lights;b.begin();const col=p.curtain>.5?'#f5bc5f':'#67c9ff';
  for(let i=0;i<9;i++){
   const x=-300+i*75,target:P=[x*.75+Math.sin(time*.23+i)*50,1,20+Math.sin(i+time*.2)*85];
   this.ellipse(b,[x,260,-150],[3,0,0],[0,0,3],col,2,.95);
   for(const dx of [-7,0,7])this.line(b,[[x,260,-150],[target[0]+dx,target[1],target[2]]],col,1.3,.18+.18*p.curtain);
  }b.end();
  this.scene.background=new THREE.Color(0x010817).lerp(new THREE.Color(0x15100a),p.curtain);
  for(const [i,m] of this.mist.entries()){m.position.set(-270+i*60+20*Math.sin(time*.09+i),3+i*.6,-60+100*Math.sin(i*1.2+time*.04));m.scale.set(100+18*Math.sin(time*.08+i),58,1);m.material.opacity=.018+.012*Math.sin(time*.2+i)**2;}
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0));if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)this.head.resetMotion();this.epoch=epoch;
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;const p=riverPose(t),c=riverCamera(view,this.width/this.height,t);
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const d=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog(this.scene.background as THREE.Color,d+(view==='diana'?25:170),d+(view==='diana'?340:740));
  this.singer.position.y=106-44*p.kneel;this.singer.rotation.set(p.lean,0,p.sway);this.head.scene.rotation.set(0,-Math.PI/2-.04,p.lean*.2);
  this.clothes.group.scale.y=1-.44*p.kneel;
  this.makeHands(t);this.makePeople(t);this.makeBoat(t);this.makeEnvironment(t);this.scene.fog.color.copy(this.scene.background as THREE.Color);
  const message=this.track.message(this.track.indexAt(t)).t,tele=playing?this.track.message(this.track.indexAt(t)):null;this.head.face.update(tele,dt);this.head.face.lid=.45+Math.min(.45,message.outRms*1.6);
  this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();const artic=VoiceModel.articFromArray(message.artic);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();for(const b of this.beams)b.dispose();this.scene.traverse(o=>{if(o instanceof THREE.Mesh&&(o.name==='river-floor'||o.name==='floor-mist')){o.geometry.dispose();(o.material as THREE.Material).dispose();}});}
}
