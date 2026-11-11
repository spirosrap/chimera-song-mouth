import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {cosmosCamera,cosmosPose,tesseractGeometry,type CosmosPoint as P} from '../../scene/cosmos.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,tan='#be9d70',burgundy='#a44d57',skin='#9fbdc7',green='#83b49a',wood='#8c6654';
/** Sagan's desk, physical speaking head and source-timed dimensional demonstrations. */
export class CosmosStudy{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,2500);
 readonly actor=new THREE.Group();readonly head=new Anatomy3D();readonly hair=new Beams();readonly clothes=new Beams();readonly arms=new Beams();
 readonly furniture=new Beams();readonly surroundings=new Beams();readonly flatland=new Beams();readonly props=new Beams();
 private readonly beams:Beams[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color(0x030806);this.scene.fog=new THREE.Fog(0x030806,500,1000);
  this.beams=[this.hair,this.clothes,this.arms,this.furniture,this.surroundings,this.flatland,this.props];
  this.head.centred=true;this.head.attachAccessory(this.hair.group);this.actor.add(this.head.scene,this.clothes.group);this.scene.add(this.actor);
  for(const [name,b] of Object.entries({hair:this.hair,clothes:this.clothes,arms:this.arms,furniture:this.furniture,surroundings:this.surroundings,flatland:this.flatland,props:this.props})){b.group.name=name;if(!['hair','clothes'].includes(name))this.scene.add(b.group);}
  this.makeHair();this.makeClothes();this.makeFurniture();this.resize(1280,720);this.frame(0,false,0,'wide',0);
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

 private makeHair(){
  const b=this.hair;b.begin();
  for(let i=0;i<32;i++){const z=(i/31-.5)*15.3,c=Math.sqrt(1-(z/8.1)**2);this.line(b,Array.from({length:28},(_,j)=>{const a=j/27*Math.PI;return [-.8-8.2*c*Math.cos(a),17.5+7*c*Math.sin(a),z] as P;}),'#8d8879',.9,.8);}
  for(let i=0;i<24;i++)this.line(b,Array.from({length:23},(_,j)=>{const t=j/22;return [8-16*t,20.5+4*Math.sin(t*Math.PI),(i/23-.5)*14+1.5*Math.sin(t*3)] as P;}),'#a3957c',.85,.7);
  for(const z of [-7.4,7.4])for(let i=0;i<5;i++)this.line(b,[[2-i*.5,15,z],[3-i*.5,7.5,z]],'#8b8575',.9,.75);b.end();
 }
 private makeClothes(){
  const b=this.clothes;b.begin();const rings=[[-4,6,5],[-11,22,9],[-29,20,10],[-48,20,10]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],tan,.9,.7);
  for(let i=0;i<22;i++){const a=i/22*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),tan,.85,.65);}
  for(let x=-5;x<=5;x+=1.5)this.line(b,[[x,-4,6],[x,-16,11],[x*1.6,-43,11]],burgundy,1.3,.9);
  for(const side of [-1,1]){this.line(b,[[side*6,-4,6],[side*15,-10,11],[side*9,-19,12],[side*12,-24,12],[side*3,-39,12]],tan,1.5,.95);this.line(b,[[side*6,-4,6],[side*9,-8,11],[side*5,-17,12],[side*2,-10,10]],burgundy,1.3,.9);
   this.tube(b,[side*10,-46,0],[side*12,-53,30],7,6,'#7a7465',.45);this.tube(b,[side*12,-53,30],[side*12,-90,33],6,4,'#7a7465',.45);this.box(b,side*12-4,-94,29,8,5,16,wood,.5);
  }b.end();
 }
 private makeFurniture(){
  const b=this.furniture;b.begin();this.box(b,-125,53,-2,250,5,139,wood,.8);
  for(const x of [-116,116])for(const z of [8,125])this.box(b,x-3,0,z,6,53,6,wood,.55);
  this.box(b,-105,58.1,15,185,.2,111,green,.75);
  for(let x=-100;x<=75;x+=12)this.line(b,[[x,58.3,18],[x,58.3,122]],green,.65,.10);
  // High-backed, buttoned leather chair behind the presenter.
  for(const z of [-49,-43])this.line(b,[[-29,32,z],[-32,98,z],[-27,110,z],[27,110,z],[32,98,z],[29,32,z]],wood,1.3,.75,true);
  for(let x=-24;x<=24;x+=12)for(let y=47;y<=101;y+=14){this.line(b,[[x-6,y,-42],[x,y+7,-41],[x+6,y,-42],[x,y-7,-41]],'#9b7769',.85,.6,true);this.ring(b,[x,y,-40],[.8,0,0],[0,.8,0],tan,.85,.7);}
  for(const x of [-31,31])this.line(b,[[x,0,-46],[x,57,-46],[x,57,-7],[x,32,-7]],wood,1.3,.8);b.end();
  const d=this.surroundings;d.begin();
  // Tiffany-style desk lamp, closed book, plate, bowl and a small framed print.
  this.ring(d,[-105,59,16],[12,0,0],[0,0,9],tan,1,.8);this.line(d,[[-105,59,16],[-105,126,16]],tan,1.5,.8);
  for(let ring=0;ring<7;ring++){const y=126-ring*2,r=8+ring*2.8;this.ring(d,[-105,y,16],[r,0,0],[0,0,r*.74],ring%2?green:tan,1,.7);}
  for(let i=0;i<18;i++){const a=i/18*TAU;this.line(d,[[-105+8*Math.cos(a),126,16+6*Math.sin(a)],[-105+25*Math.cos(a),114,16+19*Math.sin(a)]],tan,.85,.65);}
  this.box(d,-116,59,77,25,4,33,wood,.75);this.box(d,-114,60,79,21,1,28,'#bab69c',.55);
  this.ring(d,[-81,59,3],[16,0,0],[0,0,11],tan,1,.7);
  for(let i=0;i<5;i++)this.ring(d,[-94,60+i*2,111],[10-i*.7,0,0],[0,0,8-i*.5],wood,1,.7);
  this.box(d,69,108,-102,35,45,3,tan,.7);this.box(d,73,112,-98,27,37,1,'#afa990',.55);
  for(let i=0;i<4;i++)this.ring(d,[80+i%2*12,121+Math.floor(i/2)*17,-96],[4,0,0],[0,6,0],wood,.85,.6);d.end();
 }
 private polygon(b:Beams,x:number,y:number,z:number,r:number,sides:number,color:string,angle=0){const pts=Array.from({length:sides},(_,i)=>[x+r*Math.cos(i/sides*TAU+angle),y,z+r*Math.sin(i/sides*TAU+angle)] as P);this.line(b,pts,color,1.4,.95,true);for(let k=.3;k<1;k+=.2)this.line(b,pts.map(p=>[x+(p[0]-x)*k,y,z+(p[2]-z)*k] as P),color,.8,.4,true);}
 private demonstration(p:ReturnType<typeof cosmosPose>){
  const f=this.flatland;f.begin();
  this.line(f,[[-33,58.6,68],[-33,58.6,48],[26,58.6,48],[26,58.6,100],[-33,58.6,100],[-33,58.6,80]],'#90c3a5',2,.95);
  const doorOpen=p.t>=41&&p.t<51||p.t>=95&&p.t<100;this.line(f,doorOpen?[[-33,58.6,68],[-45,58.6,68]]:[[-33,58.6,68],[-33,58.6,80]],'#90c3a5',2,.95);
  for(const [x,z,n,c] of [[-67,39,3,'#c29c6a'],[-53,107,3,'#a2bfba'],[49,93,28,'#c4a56f'],[53,50,4,'#c7c4ac'],[-73,80,3,'#c29c6a'],[43,31,3,'#7fafa1']] as const)this.polygon(f,x+(x<0?22:-17)*p.reunion,58.6,z+(74-z)*p.reunion*.45,7,n,c,.4);
  const squareX=-4+p.squareMove-54*p.squareOutside,squareY=59+p.lift*34,squareZ=74-p.lift*35;
  this.polygon(f,squareX,squareY,squareZ,7,4,burgundy,Math.PI/4);
  // A three-dimensional visitor first intersects the plane as a changing cross-section.
  if(p.appleContact>.01||p.appleSlice>.01)this.ring(f,[-6,58.8,72],[7*p.appleContact+11*p.appleSlice,0,0],[0,0,6*p.appleContact+9*p.appleSlice],'#e1ba83',1.7,.95);
  if(p.appleSlice>.01)for(const x of [-3,3])this.ring(f,[-6+x,58.9,72],[1.2,0,0],[0,0,2],wood,1,.9);
  f.end();const b=this.props;b.begin();
  if(p.apple>.01){
   const center:P=[-6,91-25*p.appleContact,47+25*p.appleContact];
   for(let i=1;i<10;i++){const a=i/10*Math.PI,r=9*Math.sin(a);this.ring(b,[center[0],center[1]+9*Math.cos(a),center[2]],[r,0,0],[0,0,r*.85],'#c26b62',1,.7*p.apple);}
   for(let i=0;i<12;i++){const a=i/12*TAU;this.line(b,Array.from({length:25},(_,j)=>{const u=j/24*Math.PI;return [center[0]+9*Math.sin(u)*Math.cos(a),center[1]+9*Math.cos(u),center[2]+8*Math.sin(u)*Math.sin(a)] as P;}),'#c26b62',1,.7*p.apple);}
   this.line(b,[[center[0],center[1]+8,center[2]],[center[0]+2,center[1]+13,center[2]-1]],wood,1.3,p.apple);
  }
  const cubeCenter:P=[74-79*p.cube,75+p.cube,32-p.cube];
  const rotation=new THREE.Euler(.18*p.cube,p.cube*p.cubeTurn,.08*p.cube),q=new THREE.Quaternion().setFromEuler(rotation);
  const cube=Array.from({length:8},(_,i)=>new THREE.Vector3(i&1?15:-15,i&2?15:-15,i&4?15:-15).applyQuaternion(q).add(new THREE.Vector3(...cubeCenter)).toArray() as P);
  for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))this.line(b,[cube[i],cube[i|bit]],'#a3c3b7',1.3,.85);
  if(p.tesseract>.01){
   const shape=tesseractGeometry(p.tesseractTurn),vertices=shape.vertices.map(v=>[v[0]*7.5,v[1]*7.5+77,v[2]*7.5+36] as P);
   for(const [a,z] of shape.edges)this.line(b,[vertices[a],vertices[z]],a<8&&z<8?'#9ad7d0':a>=8?'#d3ad85':'#8caaa4',1.4,p.tesseract*.9);
  }
  // The model's shadow stays in the two-dimensional plane during the cube explanation.
  if(p.cube>.05)for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))this.line(b,[[cube[i][0]-25,58.8,cube[i][2]+44],[cube[i|bit][0]-25,58.8,cube[i|bit][2]+44]],'#759b87',1.3,.6*p.cube);
  b.end();
 }
 private makeArms(p:ReturnType<typeof cosmosPose>){
  const b=this.arms;b.begin();
  for(const side of [-1,1]){
   const shoulder:P=[side*22,83,-26],elbow:P=[side*35,67,-1];let wrist:P=[side*(20+p.explain*5),64+p.explain*5,22];
   const blend=(target:P,amount:number)=>{wrist=wrist.map((v,i)=>v+(target[i]-v)*amount) as P;};
   blend([side===1?-3:-26,63,side===1?70:40],p.point);
   if(side===1){blend([-2,84-25*p.appleContact,45+25*p.appleContact],p.apple);blend([-4,89,32],p.lift);}
   blend([side*23,77,29],Math.max(p.cube,p.tesseract));
   this.tube(b,shoulder,elbow,5,4,tan,.8);this.tube(b,elbow,wrist,4,2.3,tan,.8);this.ring(b,wrist,[3,0,0],[0,0,2.7],burgundy,1.5,.9);
   const [x,y,z]=wrist;this.line(b,[[x-2,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2,y,z]],skin,1,.85,true);
   for(let i=0;i<4;i++)this.line(b,[[x-1.5+i,y+3,z+1],[x-1.5+i,y+6,z+2],[x-1.5+i,y+5,z+4]],skin,.85,.75);
  }b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=cosmosPose(t);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)this.head.resetMotion();
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=cosmosCamera(view,this.width/this.height);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  this.actor.position.set(0,94-p.lean*5,-28+p.lean*7);this.head.scene.rotation.set(0,-Math.PI/2+.08*Math.sin(t*.38),-.20*p.lean);
  this.makeArms(p);this.demonstration(p);
  const msg=this.track.message(this.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic);
  this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();for(const b of this.beams)b.dispose();}
}
