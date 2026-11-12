import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {operaCamera,operaPose,type OperaPoint as P} from '../../scene/opera.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,blue='#3988df',dark='#365875',gold='#c39a56',cream='#c3ced8',dim='#203e77',red='#6d3548';
/** A concert-opera stage. Only the featured singer needs the detailed airway model;
 * the ensemble uses pooled line geometry rather than dozens of WebGL/model leases. */
export class OperaStage {
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,4000);
 readonly singer=new THREE.Group();readonly head=new Anatomy3D();
 readonly hair=new Beams();readonly clothes=new Beams();readonly hands=new Beams();readonly microphone=new Beams();
 readonly architecture=new Beams();readonly furniture=new Beams();readonly musicians=new Beams();readonly conductor=new Beams();readonly choir=new Beams();readonly audience=new Beams();
 private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;private beams:Beams[];
 constructor(readonly model:VoiceModel,readonly track:TeleTrack,readonly choirTrack?:TeleTrack){
  this.scene.background=new THREE.Color(0x02030a);
  this.beams=[this.hair,this.clothes,this.hands,this.microphone,this.architecture,this.furniture,this.musicians,this.conductor,this.choir,this.audience];
  this.singer.position.set(-24,100,76);this.singer.add(this.head.scene,this.clothes.group,this.hands.group);
  this.head.centred=true;this.head.attachAccessory(this.hair.group);
  this.scene.add(this.singer,this.microphone.group,this.architecture.group,this.furniture.group,this.musicians.group,this.conductor.group,this.choir.group,this.audience.group);
  for(const [name,b] of Object.entries({hair:this.hair,clothes:this.clothes,hands:this.hands,microphone:this.microphone,architecture:this.architecture,furniture:this.furniture,musicians:this.musicians,conductor:this.conductor,choir:this.choir,audience:this.audience}))b.group.name=name;
  this.makeSinger();this.makeStage();this.makeFurniture();this.resize(1280,720);this.frame(0,false,0,'wide',0);
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
 private makeSinger(){
  const b=this.clothes;b.begin();const rings=[[-4,5.5,4.5],[-10,17,7.5],[-26,15,8],[-47,14,7.5]];
  for(const [y,x,z] of rings)this.ellipse(b,[0,y,0],[x,0,0],[0,0,z],dark,1,.8);
  for(let i=0;i<18;i++){const a=i/18*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),dark,.85,.7);}
  for(const side of [-1,1]){
   this.line(b,[[side*5,-5,5],[side*10,-12,8],[side*4,-24,8.5],[side*2,-46,8]],cream,.9,.6);
   this.tube(b,[side*7,-47,0],[side*8,-72,1],6.4,4.5,dark);this.tube(b,[side*8,-72,1],[side*8,-94,3],4.5,3.8,dark);this.box(b,side*8-4,-98,0,8,5,16,cream,.6);
  }
  for(let y=-10;y>-40;y-=7)this.ellipse(b,[0,y,8.5],[.7,0,0],[0,.7,0],cream,.8,.6);b.end();
  const h=this.hair;h.begin();
  for(let i=0;i<25;i++){const z=(i/24-.5)*14.9,c=Math.sqrt(1-(z/8)**2);this.line(h,Array.from({length:19},(_,j)=>{const a=j/18*Math.PI;return [-.7-8*c*Math.cos(a),18+6.5*c*Math.sin(a)+.45*Math.sin(i+a*7),z] as P;}),cream,.9,.8);}h.end();
  const m=this.microphone;m.begin();this.tube(m,[-24,2,94],[-24,108,94],.65,.65,cream,.8);
  this.tube(m,[-24,108,94],[-24,109,88],1.15,1.15,cream,.95);
  for(let i=0;i<5;i++)this.ellipse(m,[-24,109,87+i*.5],[1.7,0,0],[0,1.7,0],cream,.85,.95);
  for(let i=0;i<3;i++){const a=i/3*TAU;this.line(m,[[-24,5,94],[-24+12*Math.sin(a),2,94+12*Math.cos(a)]],cream,1,.6);}
  this.line(m,[[-24,106,94],[-23,2,96],[20,1,100],[92,1,44]],dim,.85,.65);m.end();
 }
 private makeStage(){
  const b=this.architecture;b.begin();
  for(const y of [0,-5])this.line(b,[[-290,y,175],[290,y,175],[290,y,-280],[-290,y,-280]],gold,1,.45,true);
  for(let x=-280;x<=280;x+=28)this.line(b,[[x,.1,175],[x,.1,-280]],dim,.8,.3);
  for(const z of [-150,-200,-246])this.box(b,-250,0,z,500,z===-246?58:24,45,dim,.5);
  // Blue-lit classical columns, warm capitals and the curved concert-hall cornice.
  for(const x of [-274,-210,-140,-70,0,70,140,210,274]){
   const z=-265+Math.abs(x)*.13;
   this.tube(b,[x,42,z],[x,251,z],11,10,blue,.8);
   for(const y of [39,43,247,252,258])this.ellipse(b,[x,y,z],[15,0,0],[0,0,15],gold,1,.6);
   for(let i=0;i<12;i++){const a=i/12*TAU;this.line(b,[[x+10.6*Math.cos(a),48,z+10.6*Math.sin(a)],[x+9.6*Math.cos(a),244,z+9.6*Math.sin(a)]],blue,1,.55);}
  }
  for(const y of [253,264,276])this.line(b,Array.from({length:35},(_,i)=>{const x=-290+i*580/34;return [x,y,-265+Math.abs(x)*.13] as P;}),gold,1.4,.75);
  for(const side of [-1,1]){
   for(let i=0;i<14;i++)this.line(b,[[side*(290+i*1.4),0,130],[side*(290+i*1.4),245,125],[side*(292+i*1.4),277,-25]],red,1.4,.7);
   for(const y of [60,140,220])this.box(b,side<0?-345:300,y,-180,45,8,300,gold,.5);
  }
  for(const x of [-200,-100,0,100,200]){
   this.tube(b,[x,270,40],[x,260,34],5,6,cream,.8);
   for(const d of [-1,1])this.line(b,[[x,257,34],[x+d*52,1,10]],blue,1,.08);
   this.ellipse(b,[x,257,34],[7,0,0],[0,0,5],cream,1.4,.85);
  }b.end();
 }
 private stand(b:Beams,x:number,y:number,z:number){
  this.line(b,[[x,y,z],[x,y+35,z]],gold,1,.6);
  for(const dx of [-10,10])this.line(b,[[x,y+4,z],[x+dx,y,z+6]],gold,.9,.6);
  this.line(b,[[x-14,y+28,z],[x+14,y+28,z],[x+14,y+48,z-7],[x-14,y+48,z-7]],cream,1,.65,true);
  this.line(b,[[x,y+28,z],[x,y+48,z-7]],cream,.85,.7);
  for(let i=0;i<6;i++)for(const side of [-1,1])this.line(b,[[x+side*2,y+31+i*2.2,z-1-i*.77],[x+side*11,y+31+i*2.2,z-1-i*.77]],gold,.7,.55);
  this.line(b,[[x,y+47,z-7],[x,y+52,z-6],[x+6,y+52,z-2]],gold,1.1,.85);
 }
 private makeFurniture(){
  const b=this.furniture;b.begin();
  for(let row=0;row<3;row++)for(let col=0;col<8;col++){
   const x=-213+col*60,z=-22-row*62,y=row===2?24:0;
   this.box(b,x-12,y+25,z-7,24,3,24,dark,.6);this.box(b,x-12,y+28,z-8,24,27,2,dark,.5);
   for(const dx of [-10,10])this.line(b,[[x+dx,y+25,z+12],[x+dx,y,z+12]],dark,1,.7);
   this.stand(b,x+8,y,z+35);
  }
  this.box(b,60,0,69,51,8,46,gold,.7);this.stand(b,85,8,66);
  // Two timpani at the back, with their player between them.
  for(const x of [176,216]){this.tube(b,[x,24,-201],[x,60,-201],8,17,gold,.7);this.ellipse(b,[x,61,-201],[17,0,0],[0,0,17],cream,1.1,.8);}
  b.end();
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
 private makePeople(time:number){
  const p=operaPose(time),b=this.musicians;b.begin();
  for(let row=0;row<3;row++)for(let col=0;col<8;col++){
   const x=-213+col*60,z=-22-row*62,y=64+(row===2?24:0),sway=Math.sin(time*2.3+col*.3)*p.playing;
   this.person(b,x,y,z,.85,col%3===0?cream:dark);
   for(const side of [-1,1]){this.line(b,[[x+side*8,y-26,z],[x+side*10,y-37,z+14],[x+side*10,y-62,z+14]],dark,1,.7);}
   if(row<2){
    const cello=row===1&&col%3===0;
    if(cello){this.ellipse(b,[x,y-33,z+17],[9,0,0],[0,17,0],gold,1,.8);this.line(b,[[x,y-58,z+17],[x,y+1,z+17]],cream,.9,.8);}
    else{this.ellipse(b,[x-8,y-5,z+13],[9,0,0],[0,4,0],gold,1,.9);this.line(b,[[x-21,y-3,z+13],[x+1,y-8,z+13]],cream,.9,.85);}
    const yy=cello?y-29:y-7;
    this.line(b,[[x+13,y-7,z],[x+19,y-20,z+7],[x+7+sway*5,yy,z+16]],cream,1,.8);
    this.line(b,[[x-15+sway*5,yy+9,z+17],[x+16+sway*5,yy-12,z+17]],gold,1.2,.9);
    this.line(b,[[x-12,y-7,z],[x-20,y-18,z+5],[x-17,yy+3,z+13]],cream,1,.7);
   }else{
    this.tube(b,[x,y+5,z+8],[x-7,y-3,z+28],1.3,6,gold,.85);
    this.ellipse(b,[x-7,y-3,z+28],[6,0,0],[0,6,0],gold,1.1,.9);
    for(const side of [-1,1])this.line(b,[[x+side*12,y-7,z],[x+side*16,y-16,z+7],[x+side*4,y,z+18]],cream,.9,.65);
   }
  }b.end();
  const c=this.conductor;c.begin();this.person(c,84,104,89,1,cream,0,-1);
  for(const side of [-1,1]){
   const hand:P=[84+side*(23+10*p.lift*p.playing),100+(-12+25*p.lift+12*p.swell)*p.playing,74];
   this.tube(c,[84+side*14,97,89],[84+side*26,82,87],4,3,dark);this.tube(c,[84+side*26,82,87],hand,3,1.7,cream);
   this.ellipse(c,hand,[2,0,0],[0,3,0],cream,1,.9);
   if(side===1)this.line(c,[hand,[hand[0]+9*p.beat*p.playing,hand[1]+24,hand[2]-8]],cream,1.4,.95);
   this.tube(c,[84+side*7,74,89],[84+side*8,9,90],5,3,dark);
  }c.end();
  const q=this.choir;q.begin();const energy=this.choirTrack?.message(this.choirTrack.indexAt(time)).t.outRms??0,mouth=Math.min(1,energy*20);
  for(let i=0;i<16;i++){
   const x=-225+i*30,y=132+(i%2)*3,z=-214;this.person(q,x,y,z,.8,i%2?cream:blue,mouth);
   this.box(q,x-9,y-72,z-2,18,42,12,dark,.45);
   this.line(q,[[x-11,y-9,z],[x-14,y-22,z+7],[x-8,y-18,z+16],[x+8,y-18,z+16],[x+14,y-22,z+7],[x+11,y-9,z]],cream,.85,.6);
   this.line(q,[[x-11,y-15,z+15],[x,y-19,z+18],[x+11,y-15,z+15],[x+11,y-29,z+15],[x,y-31,z+18],[x-11,y-29,z+15]],gold,1,.7,true);
  }q.end();
  const a=this.audience;a.begin();
  for(let row=0;row<3;row++)for(let i=0;i<15;i++){
   const x=-268+i*38+(row%2)*12,y=15-row*5,z=225+row*38;this.person(a,x,y,z,.64,dim);
   this.box(a,x-11,y-20,z+9,22,31,3,red,.45);
   for(const side of [-1,1]){const clap=p.applause*(.5+.5*Math.sin(time*10+i*.6+row));this.line(a,[[x+side*9,y-5,z],[x+side*13,y-13,z-2],[x+side*(10-8*clap),y-15+13*p.applause,z-11]],dark,.85,.6);}
  }a.end();
 }
 private makeHands(time:number){
  const p=operaPose(time),b=this.hands;b.begin();
  for(const side of [-1,1]){
   const wrist:P=[side*(18+15*p.arm),-43+26*p.arm,7+7*p.arm],elbow:P=[side*(21+7*p.arm),-26,5];
   this.tube(b,[side*16,-10,0],elbow,4.5,3.3,dark);this.tube(b,elbow,wrist,3.3,2,cream,.65);
   this.ellipse(b,wrist,[2.5,0,0],[0,4,0],cream,1,.85);
   for(let i=0;i<4;i++)this.line(b,[[wrist[0]-1.5+i,wrist[1]-2,wrist[2]],[wrist[0]-1.5+i,wrist[1]-7,wrist[2]+1]],cream,.85,.7);
  }b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0));
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)this.head.resetMotion();
  this.epoch=epoch;const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;
  const p=operaPose(t),c=operaCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target));this.scene.fog=new THREE.Fog(0x02030a,distance+(view==='opera-tenor'?35:230),distance+(view==='opera-tenor'?260:700));
  this.singer.rotation.set(p.bow*.22,0,p.sway);this.head.scene.rotation.set(0,-Math.PI/2-.08,.02*Math.sin(t*.35));
  this.makeHands(t);this.makePeople(t);
  const message=this.track.message(this.track.indexAt(t)),tele=playing?message:null;this.head.face.update(tele,dt);this.head.face.lid=.36;
  this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();
  const artic=VoiceModel.articFromArray(message.t.artic);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();for(const b of this.beams)b.dispose();}
}
