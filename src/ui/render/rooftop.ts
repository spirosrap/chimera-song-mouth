import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {rooftopPose,rooftopCamera,rooftopWorld,type RooftopPerson,type RooftopPoint as P} from '../../scene/rooftop.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,steel='#456e78',cyan='#74c9d0',skin='#8bb6bb',coat='#8b8071',white='#e5f3ee';
interface Person{id:RooftopPerson;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;body:Beams;arms:Beams}
/** Rain, a wet industrial roof, two articulated figures and a dove on the source clock. */
export class RainRooftop{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(37,16/9,1,6000);readonly people:Person[]=[];
 readonly architecture=new Beams();readonly skyline=new Beams();readonly neon=new Beams();readonly rain=new Beams();readonly water=new Beams();readonly mist=new Beams();readonly dove=new Beams();readonly doveRoot=new THREE.Group();
 private beams:Beams[]=[];private surfaces:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
 constructor(cast:{id:RooftopPerson;model:VoiceModel;track:TeleTrack}[]){
  this.scene.background=new THREE.Color('#02070b');this.scene.fog=new THREE.Fog('#02070b',350,1400);
  for(const c of cast){const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),body:new Beams(),arms:new Beams()};p.head.centred=true;p.head.attachAccessory(p.hair.group);p.root.add(p.head.scene,p.body.group,p.arms.group);this.scene.add(p.root);this.people.push(p);for(const [n,b]of Object.entries({hair:p.hair,body:p.body,arms:p.arms})){b.group.name=c.id+'-'+n;this.beams.push(b);}this.hair(p);}
  for(const [n,b]of Object.entries({architecture:this.architecture,skyline:this.skyline,neon:this.neon,rain:this.rain,water:this.water,mist:this.mist})){b.group.name=n;this.scene.add(b.group);this.beams.push(b);}
  this.dove.group.name='white-dove';this.doveRoot.add(this.dove.group);this.scene.add(this.doveRoot);this.beams.push(this.dove);
  this.set();this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6){this.line(b,Array.from({length:28},(_,i)=>{const a=i/28*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.65){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 private surface(x:number,y:number,z:number,w:number,h:number,d:number,color:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);this.scene.add(m);this.surfaces.push(m);}
 private set(){
  const b=this.architecture;b.begin();this.surface(-10,-9,-55,330,16,310,'#030c11');this.box(b,-175,-17,-210,330,17,310,steel,.8);this.surface(-270,-9,-55,80,16,310,'#030c11');this.box(b,-310,-17,-210,80,17,310,steel,.5);
  for(let x=-175;x<=155;x+=22)this.line(b,[[x,.2,-210],[x,.2,100]],steel,.7,.4);for(let z=-210;z<=100;z+=24)this.line(b,[[-175,.2,z],[155,.2,z]],steel,.7,.4);
  // Parapet, exposed riveted girders, brick wall and rain-soaked service pipes.
  this.box(b,130,0,-210,25,58,275,steel,.8);this.box(b,-175,0,-210,330,150,18,steel,.55);
  for(let y=12;y<150;y+=12){this.line(b,[[-175,y,-190],[155,y,-190]],steel,.7,.35);for(let x=-175+(y%24?0:12);x<155;x+=25)this.line(b,[[x,y-12,-190],[x,y,-190]],steel,.7,.3);}
  for(const x of [-150,-80,0,80]){this.box(b,x,-105,99,9,111,9,steel,.8);for(let y=-99;y<5;y+=12)this.ring(b,[x+4,y,109],[1.1,0,0],[0,1.1,0],cyan,.8,.65);}
  for(const z of [-150,-103]){this.tube(b,[-165,16,z],[140,16,z],8,8,steel,.8);for(let x=-145;x<140;x+=35)this.ring(b,[x,16,z],[0,10,0],[0,0,10],cyan,1,.6);}
  this.tube(b,[105,0,-120],[105,144,-120],9,9,steel,.8);this.tube(b,[105,144,-120],[50,144,-120],9,9,steel,.8);
  for(const [x,z]of [[-135,-72],[116,-28]]){this.box(b,x-17,0,z-20,34,65,40,steel,.6);for(let y=8;y<60;y+=5)this.line(b,[[x-13,y,z+21],[x+13,y,z+21]],cyan,.8,.4);}
  this.box(b,-75,0,-32,80,9,50,steel,.7);for(let i=0;i<4;i++)this.box(b,-150-i*4,0,55-i*22,55,4+i*5,18,cyan,.5);b.end();
  const s=this.skyline;s.begin();for(let i=0;i<28;i++){const x=-1400+i*100,y=-300+(i*73%240),z=-430-(i%4)*140,w=56+i%3*15,h=180+(i*47%290);this.box(s,x,y,z,w,h,62,steel,.35);for(let yy=y+18;yy<y+h-8;yy+=24)for(let xx=x+8;xx<x+w-8;xx+=14)if((i+xx+yy)%5!==0)this.line(s,[[xx,yy,z+63],[xx+5,yy,z+63]],(i+xx)%3?'#447a8a':'#bf8c57',1.3,.45);this.line(s,[[x+w*.5,y+h,z+30],[x+w*.5,y+h+45,z+30]],steel,.8,.35);}s.end();
  const n=this.neon;n.begin();const letters:P[][]=[[[0,0,0],[0,80,0]],[[-30,80,0],[30,80,0]],[[50,0,0],[50,80,0],[83,80,0],[100,65,0],[100,15,0],[83,0,0],[50,0,0]],[[123,0,0],[123,80,0]],[[170,80,0],[123,38,0],[170,0,0]]];
  for(const color of ['#3de0dc','#db5164'])for(let k=0;k<3;k++)for(const pts of letters)this.line(n,pts.map(([x,y,z])=>[x-110+k*1.8,y+101,z-174+(color==='#db5164'?2:0)]),color,1.3,.68);n.end();
 }
 private hair(p:Person){const b=p.hair;b.begin();const roy=p.id==='roy';for(let i=0;i<34;i++){const z=(i/33-.5)*14.8,c=Math.sqrt(Math.max(0,1-(z/8)**2));this.line(b,Array.from({length:24},(_,j)=>{const t=j/23;return [-7.3+15*t,18+6.1*c*Math.sin(t*Math.PI)+Math.sin(t*7+i)*.35,z+(roy?.4:1.1)*Math.sin(t*3)] as P;}),roy?'#c1ced0':'#65787b',.85,roy?.7:.85);}
  for(let i=0;i<12;i++){const z=(i/11-.5)*12;this.line(b,[[6,21,z],[8.2,17.5,z+.6],[8.8,roy?15.6:12.6,z+.7]],roy?'#bbcfd0':'#65787b',.85,.75);}b.end();}
 private body(p:Person,pose:ReturnType<typeof rooftopPose>){const b=p.body,roy=p.id==='roy',c=roy?skin:coat,sit=roy?pose.sit:pose.rescue;b.begin();
  const rings=[[-4,5,4],[-12,roy?22:24,9],[-25,roy?18:23,11],[-40,roy?13:22,8],[-46,15,9]];
  for(const [y,x,z]of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],c,.85,.7);for(let i=0;i<22;i++){const a=i/22*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),c,.85,.55);}
  if(roy){for(const side of [-1,1]){this.line(b,[[side*3,-10,7],[side*12,-13,10],[side*19,-15,6],[side*15,-21,10],[side*3,-20,11]],skin,.85,.8);this.line(b,[[side*3,-24,11],[side*8,-29,10],[side*6,-37,8]],skin,.85,.6);}this.line(b,[[0,-8,6],[0,-37,9]],skin,.85,.65);}
  else {for(const side of [-1,1])this.line(b,[[side*5,-4,6],[side*17,-10,10],[side*9,-28,13],[side*3,-14,11]],coat,1.3,.9);for(let k=0;k<4;k++)this.line(b,[[0,-7-k*2,8],[7,-11-k*2,11],[17,-8-k*2,10]],'#a4a49a',.85,.7);}
  for(const side of [-1,1]){const knee:P=[side*(10+sit*14),-73+sit*30,3+sit*37],ankle:P=[side*(10+sit*24),-98+sit*47,8+sit*28];this.tube(b,[side*9,-45,0],knee,8,5,roy?'#4f6268':coat);this.tube(b,knee,ankle,5,3.7,roy?'#4f6268':coat);this.box(b,ankle[0]-4,ankle[1]-4,ankle[2]-2,8,6,16,roy?'#6f8a90':coat,.7);}
  b.end();}
 private hand(b:Beams,w:P,closed:boolean){const [x,y,z]=w;this.line(b,[[x-2.5,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2.5,y,z]],skin,.85,.85,true);for(let i=0;i<4;i++)this.line(b,[[x-1.7+i*1.1,y+3,z+1],[x-1.7+i*1.1,y+6,z+1],[x-1.7+i*1.1,y+(closed?4:8),z+(closed?3:2)]],skin,.85,.8);this.line(b,[[x-2,y+1,z],[x-4,y+3,z+1],[x-3,y+4,z+2]],skin,.85,.8);}
 private arms(p:Person,pose:ReturnType<typeof rooftopPose>){const b=p.arms,roy=p.id==='roy';b.begin();for(const side of [-1,1]){let wrist:P=[side*18,-47,8],elbow:P=[side*26,-29,3];
   if(roy&&side===-1){wrist=pose.hand;elbow=[-24,-27,10];}
   if(roy&&side===1&&pose.t>=65&&pose.t<79||!roy&&side===-1&&pose.rescue<1){wrist=new THREE.Vector3(...pose.grip).applyMatrix4(p.root.matrixWorld.clone().invert()).toArray() as P;elbow=[side*25,(wrist[1]-10)*.52,wrist[2]*.5];}
   if(!roy&&pose.rescue<.04&&side===1){wrist=new THREE.Vector3(58,5,99).applyMatrix4(p.root.matrixWorld.clone().invert()).toArray() as P;elbow=[25,20,5];}
   if(!roy&&pose.rescue>=1){wrist=[side*23,-28,31];elbow=[side*29,-24,15];}
   if(roy&&side===-1&&pose.flight>0)wrist=[-7,-32-6*pose.death,19];
   this.tube(b,[side*(roy?21:23),-12,0],elbow,5.5,4,roy?skin:coat);this.tube(b,elbow,wrist,4,2.5,roy?skin:coat);this.hand(b,wrist,pose.t<176.7);
  }b.end();}
 private bird(p:ReturnType<typeof rooftopPose>){const b=this.dove;b.begin();this.doveRoot.position.set(...p.dove);this.doveRoot.rotation.set(0,.8-p.flight*.7,p.flight*.12);this.doveRoot.visible=p.doveVisible;
  for(let i=0;i<9;i++){const a=i/8*Math.PI,r=Math.sin(a);this.ring(b,[0,5+Math.cos(a)*4,0],[4.3*r,0,0],[0,0,7*r],white,.85,.9);}
  for(let i=0;i<14;i++){const a=i/14*TAU;this.line(b,Array.from({length:28},(_,j)=>{const t=j/27*Math.PI;return [Math.sin(t)*Math.cos(a)*4.3,5+Math.cos(t)*4,Math.sin(t)*Math.sin(a)*7] as P;}),white,.85,.8);}
  this.ring(b,[0,9,5],[2.8,0,0],[0,3,0],white,1,.95);this.ring(b,[0,9,5],[2.8,0,0],[0,0,2.5],white,1,.95);
  this.ring(b,[0,9,5],[0,3,0],[0,0,2.5],white,1,.9);
  this.line(b,[[-1,9,7],[0,8.5,10],[1,9,7]],'#d4c69d',1,.9,true);for(const x of [-2.5,2.5])this.ring(b,[x,9.4,6],[0,.35,0],[0,0,.35],'#90dbe0',1.3,1);
  for(const side of [-1,1])for(let i=0;i<11;i++){const f=i/10,span=4+p.flight*(14+6*f),rise=p.flight*Math.sin(p.wing)*span;this.line(b,[[side*3,6,3-f*8],[side*span,5+rise,-1-f*8],[side*(span-3),4+rise,-4-f*6],[side*3,4,-4]],white,.85,.9);}
  for(let i=0;i<7;i++)this.line(b,[[(i-3)*.7,4,-5],[(i-3)*1.7,3,-13],[(i-3)*.5,4,-6]],white,.85,.85);b.end();}
 private weather(t:number){const r=this.rain;r.begin();for(let i=0;i<1000;i++){const x=-420+((i*73.173+t*13)%840),z=-300+(i*137.37%650),y=-100+((i*43.183-t*170)%470+470)%470;this.line(r,[[x,y,z],[x-1.2,y+11+i%9,z+.3]],'#6aa1b0',.6,.26+(i%4)*.035);}r.end();
  const w=this.water;w.begin();for(let i=0;i<40;i++){const x=-160+i*73.7%300,z=-165+i*47.3%248,phase=(t*1.3+i*.27)%1;this.ring(w,[x,.8,z],[phase*5+.3,0,0],[0,0,phase*5+.3],cyan,.6,(1-phase)*.23);}for(let i=0;i<32;i++){const z=-145+i*7.3;this.line(w,[[-93+Math.sin(t*1.5+i)*5,.5,z],[-13+Math.sin(t*1.4+i)*8,.5,z]],i%3?'#42b6c0':'#ad4260',.85,.12);}w.end();
  const m=this.mist;m.begin();for(let k=0;k<16;k++)this.line(m,Array.from({length:40},(_,j)=>{const a=j/39;return [-165+a*330,32+k*5+6*Math.sin(a*7+t*.3+k*.4),-125+12*Math.sin(a*4+t*.25+k)] as P;}),'#5b8596',.6,.065);m.end();}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){const pose=rooftopPose(time),t=pose.t;
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=rooftopCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();const dist=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;fog.near=dist+80;fog.far=dist+1100;
  for(const p of this.people){const roy=p.id==='roy';p.root.position.set(...(roy?pose.roy:pose.deckard));p.root.rotation.y=roy?pose.royYaw:pose.deckardYaw;p.head.scene.rotation.set(0,-Math.PI/2,roy?pose.royTilt:pose.deckardTilt);p.head.scene.position.y=roy?pose.breath:0;this.body(p,pose);}this.scene.updateMatrixWorld(true);for(const p of this.people)this.arms(p,pose);
  this.bird(pose);this.weather(t);for(const p of this.people){p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();const msg=p.track.message(p.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic),frame=p.model.frame(artic);p.head.face.update(tele,dt);if(p.id==='roy')p.head.face.lid=.22+.78*pose.death;p.head.update(p.model,frame,artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();for(const m of this.surfaces){m.geometry.dispose();(m.material as THREE.Material).dispose();}}
}
