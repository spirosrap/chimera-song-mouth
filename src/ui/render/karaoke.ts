import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {NEUTRAL} from '../../wasm/engine.ts';
import {karaokeCamera,karaokePose,type KaraokePoint as P} from '../../scene/karaoke.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';

const TAU=Math.PI*2,blue='#399cca',dark='#285a71',warm='#c89e65',cream='#d6c9aa',gold='#bb884d',dim='#644b32';
/** A warm karaoke room: one physical singer, an attentive listener and a small audience. */
export class KaraokeRoom {
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,3000);
 readonly singer=new THREE.Group();readonly listener=new THREE.Group();readonly head=new Anatomy3D();readonly listenerHead=new Anatomy3D();
 readonly hair=new Beams();readonly clothes=new Beams();readonly hands=new Beams();readonly microphone=new Beams();
 readonly listenerHair=new Beams();readonly glasses=new Beams();readonly cardigan=new Beams();readonly listenerHands=new Beams();
 readonly room=new Beams();readonly bar=new Beams();readonly audience=new Beams();readonly screen=new Beams();
 private listenerModel:VoiceModel;private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 private beams:Beams[];
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color(0x050403);this.listenerModel=new VoiceModel({female:0,child:0},track.sampleRate);
  this.beams=[this.hair,this.clothes,this.hands,this.microphone,this.listenerHair,this.glasses,this.cardigan,this.listenerHands,this.room,this.bar,this.audience,this.screen];
  this.singer.position.set(-43,20,-25);this.listener.position.set(56,-3,47);
  this.singer.add(this.head.scene,this.clothes.group,this.hands.group,this.microphone.group);
  this.listener.add(this.listenerHead.scene,this.cardigan.group,this.listenerHands.group);
  this.head.centred=true;this.listenerHead.centred=true;
  this.head.attachAccessory(this.hair.group);this.listenerHead.attachAccessory(this.listenerHair.group);this.listenerHead.attachAccessory(this.glasses.group);
  this.scene.add(this.singer,this.listener,this.room.group,this.bar.group,this.audience.group,this.screen.group);
  for(const [name,b] of Object.entries({hair:this.hair,clothes:this.clothes,hands:this.hands,microphone:this.microphone,listenerHair:this.listenerHair,glasses:this.glasses,cardigan:this.cardigan,listenerHands:this.listenerHands,room:this.room,bar:this.bar,audience:this.audience,screen:this.screen}))b.group.name=name;
  this.makeHair();this.makeClothes();this.makeRoom();this.makeBar();this.makeListener();this.resize(1280,720);this.frame(0,false,0,'wide',0);
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
 private makeHair(){
  const b=this.hair;b.begin();
  for(let i=0;i<27;i++){
   const z=(i/26-.5)*14.7,c=Math.sqrt(1-(z/8)**2);
   this.line(b,Array.from({length:24},(_,j)=>{const a=j/23*Math.PI;return [-.6-8*c*Math.cos(a),17.3+6.5*Math.sin(a)*c,z] as P;}),gold,.85,.7);
  }
  for(const side of [-1,1])for(let i=0;i<13;i++){
   const x=-7+i*.65;this.line(b,Array.from({length:20},(_,j)=>{const t=j/19;return [x-2.8*t,18-28*t,side*(7.1+1.1*Math.sin(t*3))+.4*Math.sin(t*7+i)] as P;}),gold,.85,.55);
  }b.end();
 }
 private makeClothes(){
  const b=this.clothes;b.begin();const rings=[[-4,5.3,4.4],[-9,15.5,7],[-20,15,8],[-34,12,7],[-45,16,8]];
  for(const [y,x,z] of rings)this.ellipse(b,[0,y,0],[x,0,0],[0,0,z],dark,.85,.7);
  for(let i=0;i<16;i++){const a=i/16*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),dark,.85,.55);}
  for(const y of [-4,-3,-2])this.ellipse(b,[0,y,0],[5.3,0,0],[0,0,4.4],blue,1,.6);
  for(const side of [-1,1]){
   this.line(b,[[side*5,-5,7],[side*14,-10,8],[side*9,-29,9],[side*12,-44,9]],blue,1,.6);
   this.tube(b,[side*8,-44,0],[side*8,-71,1],7,4.7,dark);this.tube(b,[side*8,-71,1],[side*8,-92,3],4.7,3.8,dark);
   this.box(b,side*8-4,-96,0,8,5,16,dark,.6);
  }b.end();
 }
 private makeRoom(){
  const b=this.room;b.begin();this.box(b,-165,-78,-105,330,155,250,dim,.28);
  for(let x=-160;x<=160;x+=20)this.line(b,[[x,-78,-104],[x,77,-104]],dim,.85,.4);
  for(const y of [-76,-30,58,74])this.line(b,[[-165,y,-103],[165,y,-103]],warm,1,.33);
  for(let z=-100;z<150;z+=30)this.line(b,[[-165,-77,z],[165,-77,z]],dim,.85,.25);
  for(let x=-160;x<170;x+=30)this.line(b,[[x,-77,-105],[x,-77,145]],dim,.85,.24);
  for(const x of [-100,-15,80])for(const z of [-60,55]){
   this.box(b,x,71,z,42,3,27,warm,.65);for(let j=0;j<4;j++)this.line(b,[[x+3,70.8,z+3+j*6],[x+39,70.8,z+3+j*6]],cream,1.3,.55);
  }
  this.box(b,-40,-76,-103,65,119,3,warm,.5);
  this.ellipse(b,[-7,14,-98],[15,0,0],[0,15,0],cream,1.3,.65);this.ellipse(b,[-7,14,-98],[12,0,0],[0,12,0],warm,.85,.5);
  this.box(b,108,-36,-99,44,61,5,blue,.45);
  this.line(b,[[112,19,-92],[148,19,-92]],gold,1.3,.65);
  // Seating and tables give the reaction shot a recognizable room behind it.
  for(const [x,z] of [[57,49],[-95,47],[110,-15]]){
   this.box(b,x-20,-50,z-13,40,5,34,warm,.4);this.box(b,x-20,-48,z-14,40,42,3,warm,.4);
   for(const dx of [-17,17])this.line(b,[[x+dx,-50,z+12],[x+dx,-77,z+12]],warm,1,.4);
  }
  this.ellipse(b,[72,-46,90],[42,0,0],[0,0,23],warm,1.3,.65);this.tube(b,[72,-48,90],[72,-77,90],3,4,warm,.4);
  for(const x of [55,82])this.tube(b,[x,-45,88],[x,-31,88],3,3,cream,.6);
  b.end();
 }
 private makeBar(){
  const b=this.bar;b.begin();this.box(b,-156,-77,-90,82,62,35,warm,.5);this.box(b,-160,-16,-92,89,5,41,warm,.65);
  for(const x of [-146,-128,-110,-92])this.box(b,x,-70,-54,12,44,1,dim,.65);
  for(const y of [2,27]){
   this.line(b,[[-157,y,-96],[-76,y,-96]],warm,1.3,.5);
   for(let i=0;i<9;i++){
    const x=-152+i*8.3,h=10+(i%3)*3,color=i%3===0?'#619f76':i%3===1?gold:'#ac826d';
    this.tube(b,[x,y+1,-94],[x,y+h,-94],2,2,color,.55);this.tube(b,[x,y+h,-94],[x,y+h+5,-94],1,.9,color,.55);
   }
  }b.end();
 }
 private makeListener(){
  const b=this.cardigan;b.begin();const rings=[[-7,7,5],[-14,22,10],[-29,20,11],[-43,20,12]];
  for(const [y,x,z] of rings)this.ellipse(b,[0,y,0],[x,0,0],[0,0,z],cream,1,.65);
  for(let i=0;i<20;i++){const a=i/20*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),cream,.85,.45);}
  for(const side of [-1,1]){
   this.line(b,[[side*7,-6,6],[side*11,-15,12],[side*6,-40,13]],warm,1.6,.8);
   for(let y=-13;y>-39;y-=3)this.line(b,[[side*12,y,11],[side*17,y-2,10]],cream,.85,.65);
   this.tube(b,[side*10,-42,0],[side*13,-45,22],7,6,dark);this.tube(b,[side*13,-45,22],[side*13,-72,24],6,4,dark);
  }b.end();
  const hair=this.listenerHair;hair.begin();
  for(let i=0;i<24;i++){
   const z=(i/23-.5)*14,c=Math.sqrt(1-(z/8)**2);this.line(hair,Array.from({length:18},(_,j)=>{const a=j/17*Math.PI;return [-.6-8*c*Math.cos(a),18+6.3*c*Math.sin(a)+.7*Math.sin(a*5+i*.6),z+.3*Math.sin(a*3)] as P;}),warm,.85,.7);
  }hair.end();
  const g=this.glasses;g.begin();
  // Head coordinates face +X; the two lenses sit either side of the bridge.
  for(const side of [-1,1]){this.ellipse(g,[7.8,15.35,side*3.15],[0,2.1,0],[0,0,2.6],cream,1.3,.9);this.line(g,[[7.8,15.35,side*5.75],[1,15.9,side*8]],cream,1,.8);}
  this.line(g,[[7.8,15.45,-.55],[8.5,15.95,0],[7.8,15.45,.55]],cream,1.3,.95);g.end();
 }
 private hand(b:Beams,w:P,color:string,spread=0){
  const [x,y,z]=w;this.line(b,[[x-2,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2,y,z]],color,1,.8,true);
  for(let i=0;i<4;i++){const dx=-1.5+i;this.line(b,[[x+dx,y+3,z+1],[x+dx*(1+spread),y+6.5,z+1.5],[x+dx*(1+spread),y+7,z+2.5]],color,.85,.7);}
  this.line(b,[[x+2,y+1,z],[x+4,y+2,z+1],[x+4,y+4,z+2]],color,.85,.8);
 }
 private makeMovement(time:number){
  const p=karaokePose(time),b=this.hands,low=(1-p.raise)*27;b.begin();
  this.tube(b,[-15,-9,0],[-21,-25,8],4,3,dark);this.tube(b,[-21,-25,8],[-7,-8-low,20],3,1.9,blue);this.hand(b,[-7,-8-low,20],cream);
  const free:P=[20+6*Math.sin(time*.21)*p.raise,-35+8*Math.sin(time*.27)*p.raise,9];
  this.tube(b,[15,-9,0],[24,-26,4],4,3,dark);this.tube(b,[24,-26,4],free,3,2,blue);this.hand(b,free,cream,.18);b.end();
  const m=this.microphone;m.begin();this.tube(m,[-7,-10-low,20],[-3,4.2-low,16],1.1,1.2,cream,.9);
  for(let i=0;i<5;i++)this.ellipse(m,[-3,4.3+i*.7-low,16],[1.7,0,0],[0,0,1.7],cream,.85,.9);
  this.line(m,[[-7,-10-low,20],[-9,-30,21],[-5,-70,15],[-10,-96,8],[-55,-96,-3]],dim,.85,.6);m.end();
  const l=this.listenerHands;l.begin();
  for(const side of [-1,1]){
   const touch=side===1?p.touch:0,clap=p.applause;const wrist:P=[side*(20*(1-clap)+(1.2+6*p.clap)*clap)-touch*11,-37+touch*53+clap*13,18-touch*15];
   const elbow:P=[side*(26+touch*5),-28+touch*25,5];
   this.tube(l,[side*21,-13,0],elbow,5,4,cream,.55);this.tube(l,elbow,wrist,4,2.5,cream,.6);this.hand(l,wrist,cream,.12);
  }l.end();
  this.audience.begin();
  for(const [i,x,z] of [[0,-118,15],[1,48,-58],[2,92,-38],[3,133,20],[4,-80,-68]]){
   const y=i===3?-3:14;this.ellipse(this.audience,[x,y+10,z],[7,0,0],[0,10,0],dark,.85,.55);
   for(const dy of [-2,2,6])this.ellipse(this.audience,[x,y+dy+5,z],[6.5,0,0],[0,0,6],dark,.6,.35);
   this.line(this.audience,[[x-7,y,z],[x-17,y-8,z],[x-15,y-48,z],[x+15,y-48,z],[x+17,y-8,z],[x+7,y,z]],dark,.85,.5,true);
   for(const side of [-1,1]){const clap=p.applause*(.5+.5*Math.sin(time*10+i));this.line(this.audience,[[x+side*16,y-8,z],[x+side*23,y-24,z+3],[x+side*(17-13*clap),y-30+15*p.applause,z+12]],blue,.85,.45);}
  }this.audience.end();
  this.screen.begin();
  for(let i=0;i<14;i++){const level=(.3+.7*Math.abs(Math.sin(time*2+i*.8)))*p.raise;this.line(this.screen,[[113+i*2.5,-25,-92],[113+i*2.5,-25+level*29,-92]],i%3===0?gold:blue,1.3,.55);}
  this.screen.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(this.width,this.height);this.listenerHead.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0));
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25){this.head.resetMotion();this.listenerHead.resetMotion();}
  this.epoch=epoch;const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;
  const p=karaokePose(t),c=karaokeCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog(0x050403,distance+70,distance+330);
  this.singer.rotation.z=p.sway;this.head.scene.rotation.set(p.bow*.2,-Math.PI/2-.14+p.turn,.025*Math.sin(t*.4));
  this.listenerHead.scene.rotation.set(-.025,-Math.PI/2+.22,-.06*p.touch);this.makeMovement(t);
  const message=this.track.message(this.track.indexAt(t)),tele=playing?message:null;this.head.face.update(tele,dt);
  this.listenerHead.face.content=.15;this.listenerHead.face.brow=.1;this.listenerHead.face.lid=.08+.8*Math.max(0,1-Math.abs((t%5.3)-.16)/.13);
  this.scene.updateMatrixWorld(true);for(const head of [this.head,this.listenerHead]){head.camera.copy(this.camera);head.camera.updateMatrixWorld();}
  const artic=VoiceModel.articFromArray(message.t.artic);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  const quiet={...NEUTRAL,jaw:.05,lipAp:-.2};this.listenerHead.update(this.listenerModel,this.listenerModel.frame(quiet),quiet,null,{pressure:false,particles:false,grid:false,calipers:false},0);this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const b of [this.hair,this.listenerHair,this.glasses])b.group.removeFromParent();this.head.dispose();this.listenerHead.dispose();this.listenerModel.dispose();for(const b of this.beams)b.dispose();}
}
