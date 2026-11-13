import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {boltonPose,boltonPlace,boltonCamera,type BoltonPoint as P,type BoltonPlace} from '../../scene/said-i-loved-you.ts';
const TAU=Math.PI*2,skin='#9ebdd0';
/** The complete supplied romantic desert video, built around one physical singer. */
export class BoltonStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,7000);
 readonly head=new Anatomy3D();readonly singer=new THREE.Group();readonly lovers=new THREE.Group();readonly horses=new THREE.Group();
 readonly rooms:Record<BoltonPlace,THREE.Group>={storm:new THREE.Group(),fire:new THREE.Group(),cliffs:new THREE.Group(),cave:new THREE.Group(),lovers:new THREE.Group(),horses:new THREE.Group()};
 readonly hair=new Beams();readonly clothes=new Beams();readonly limbs=new Beams();readonly fireSprites:THREE.Mesh[]=[];readonly flames=new Beams();readonly clouds=new Beams();
 private beams=[this.hair,this.clothes,this.limbs,this.flames,this.clouds];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#11122a');this.scene.fog=new THREE.Fog('#11122a',1400,4000);Object.values(this.rooms).forEach(g=>this.scene.add(g));this.scene.add(this.singer,this.flames.group,this.clouds.group);this.rooms.lovers.add(this.lovers);this.rooms.horses.add(this.horses);
  this.head.centred=true;this.head.attachAccessory(this.hair.group);this.singer.add(this.head.scene,this.clothes.group,this.limbs.group);for(const b of this.beams){b.begin();b.end();}this.buildLandscape();this.buildLovers();this.buildHorses();this.buildFlames();
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;m.opacity=0;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,p:P[],c:string,w=1,a=.85,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.85){this.line(b,Array.from({length:26},(_,i)=>{const q=i/26*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q)) as P;}),col,w,a,true);}
 private box(b:Beams,p:P,w:number,h:number,d:number,c:string){for(const z of [-d/2,d/2])this.line(b,[[-w/2,-h/2,z],[w/2,-h/2,z],[w/2,h/2,z],[-w/2,h/2,z]].map(v=>v.map((x,k)=>x+p[k]) as P),c,1,.85,true);for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])this.line(b,[[p[0]+x,p[1]+y,p[2]-d/2],[p[0]+x,p[1]+y,p[2]+d/2]],c);}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private floor(parent:THREE.Object3D,w:number,d:number,c:string,z=0){const m=this.plane(parent,w,d,c,[0,-1,z]);m.geometry.dispose();m.geometry=new THREE.PlaneGeometry(w,d,16,16);m.rotation.x=-Math.PI/2;}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const point=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),c,.85,.85,true);for(let i=0;i<9;i++)this.line(b,[point(0,i/9*TAU),point(1,i/9*TAU)],c,.85,.85);
 }
 private person(b:Beams,x:number,y:number,z:number,c:string){for(let i=0;i<4;i++){const a=i/4*Math.PI;this.ring(b,[x,y+18,z],[10*Math.cos(a),0,10*Math.sin(a)],[0,14,0],skin);}
  this.tube(b,[x,y,z],[x,y-45,z],20,15,c);for(const side of [-1,1]){this.line(b,[[x+side*20,y-5,z],[x+side*26,y-31,z+6],[x+side*13,y-44,z+12]],c,1.4);this.line(b,[[x+side*9,y-45,z],[x+side*13,y-70,z+30],[x+side*14,y-103,z+28]],c,1.4);}}
 private rock(parent:THREE.Group,b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,seed:number){
  const pts:P[]=Array.from({length:8},(_,i)=>[x+(i&1?1:-1)*w/2+Math.sin(seed+i*3)*w*.08,y+(i&2?1:-1)*h/2+Math.sin(seed+i*2)*h*.035,z+(i&4?1:-1)*d/2+Math.cos(seed+i)*d*.1]);
  const faces=[0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(faces.flatMap(i=>pts[i]),3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:seed%2?'#81553d':'#9d6e49',side:THREE.DoubleSide}));parent.add(m);this.meshes.push(m);
  for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))this.line(b,[pts[i],pts[i|bit]],'#cfad81',1.25,.85);
  for(let j=0;j<4;j++)this.line(b,[[x-w*.4+j*w*.25,y-h*.48,z+d*.52],[x-w*.3+j*w*.23,y-h*.04,z+d*.53],[x-w*.35+j*w*.24,y+h*.42,z+d*.51]],'#a58460',.85,.65);
 }
 private buildLandscape(){
  for(const [name,g]of Object.entries(this.rooms)){
   const place=name as BoltonPlace,b=this.ink(g),day=place==='cliffs'||place==='lovers',dark=place==='cave';this.floor(g,2400,2400,dark?'#160e09':day?'#8c6041':'#100d1a',-450);this.plane(g,3400,1300,day?'#357aaf':dark?'#21120d':place==='storm'?'#535b59':'#231d40',[0,550,-1700]);
   for(let i=0;i<15;i++){const x=-1000+i*145,z=-580-(i%4)*100,h=95+(i*47)%190;this.rock(g,b,x,h/2,z,155,h,145,i+1);}
   if(day){const water=this.plane(g,1500,550,'#22435a',[0,9,-650]);water.rotation.x=-Math.PI/2;for(let i=0;i<18;i++)this.line(b,[[-640,12,-900+i*27],[640,12,-900+i*27]],'#799da6',.85,.4);for(let i=0;i<14;i++){const x=((i*137)%1050)-525;this.rock(g,b,x,8,-20-(i%4)*83,95,22,110,80+i);}}
   if(dark){for(const side of [-1,1])for(let i=0;i<7;i++){this.rock(g,b,side*(155+i*35),80+i*28,-200+i*40,100,180+i*21,100,110+i);}}
   if(place==='fire'||place==='horses'){const sun=new THREE.Mesh(new THREE.CircleGeometry(64,40),new THREE.MeshBasicMaterial({color:'#f2ab65'}));sun.position.set(-520,136,-1650);g.add(sun);this.meshes.push(sun);for(let i=0;i<10;i++)this.line(b,[[-1500,40+i*26,-1650],[1500,40+i*26,-1650]],i%2?'#9a5b63':'#d17964',2,.65);}
   b.end();
  }
 }
 private buildFlames(){for(let i=0;i<36;i++){const shape=new THREE.Shape();shape.moveTo(-9,0);shape.quadraticCurveTo(-12,13,-5,22);shape.quadraticCurveTo(-7,31,0,49);shape.quadraticCurveTo(10,30,6,24);shape.quadraticCurveTo(14,9,9,0);shape.closePath();const m=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:i%3?'#e89b35':'#f4d18a',side:THREE.DoubleSide,transparent:true,opacity:.82,depthWrite:false}));m.position.set(-380+i*22,0,-25+(i%3)*8);this.scene.add(m);this.meshes.push(m);this.fireSprites.push(m);}}
 private buildHair(p:ReturnType<typeof boltonPose>){const b=this.hair;b.begin();for(let i=0;i<70;i++){const a=i/70*TAU,front=Math.cos(a)>.3,end=front?.75:2.2;this.line(b,Array.from({length:24},(_,j)=>{const q=.08+Math.min(1,j/15)*end,tail=Math.max(0,j-15)/8,curl=Math.sin(j*.9+i)*.6;return [-2+(9.2*Math.sin(q)+curl)*Math.cos(a)+tail*Math.sin(p.t*1.6+i)*p.wind*1.8,16+9.2*Math.cos(q)-tail*(front?0:25),(8.8*Math.sin(q)+curl)*Math.sin(a)+tail*Math.sin(p.t*1.2+i)*1.5] as P;}),i%3?'#aaa080':'#e0c79c',.85,.9);}b.end();}
 private buildLovers(){const b=this.ink(this.lovers);for(const [side,c]of [[-1,'#b9c9d0'],[1,'#d2b5b6']] as const){const x=side*13;for(let i=0;i<4;i++){const q=i/4*Math.PI;this.ring(b,[x,165,0],[9*Math.cos(q),0,9*Math.sin(q)],[0,12,0],c);}this.tube(b,[x,150,0],[x,90,0],18,15,c);for(const leg of [-1,1])this.line(b,[[x+leg*6,90,0],[x+leg*9,48,0],[x+leg*11,0,0]],c,1.6);for(const hand of [-1,1]){this.line(b,[[x+hand*17,143,0],[x-side*13+hand*12,124,15],[x-side*26,139,20]],c,1.6);}if(side>0)for(let i=0;i<32;i++){const a=i/32*TAU;this.line(b,[[x+Math.cos(a)*8,176,Math.sin(a)*9],[x+Math.cos(a)*11,154,Math.sin(a)*12],[x+Math.cos(a)*13,129,Math.sin(a)*13]],'#bd986b',1,.8);}}b.end();this.lovers.position.set(0,0,30);}
 private buildHorses(){for(let h=0;h<3;h++){const g=new THREE.Group();g.position.set(-180+h*170,0,-180-h*70);this.horses.add(g);const add=(geo:THREE.BufferGeometry,x:number,y:number,angle=0)=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#0e1020',side:THREE.DoubleSide}));m.position.set(x,y,0);m.rotation.z=angle;g.add(m);this.meshes.push(m);return m;};const body=add(new THREE.CircleGeometry(1,32),0,73);body.scale.set(56,23,1);add(new THREE.PlaneGeometry(22,58),-50,96,.38);const head=add(new THREE.CircleGeometry(1,24),-74,121);head.scale.set(24,12,1);add(new THREE.PlaneGeometry(6,17),-64,137,-.18);for(const x of [-37,36])add(new THREE.PlaneGeometry(8,66),x,33,x<0?-.12:.17);add(new THREE.PlaneGeometry(7,58),66,54,.45);}}
 private body(p:ReturnType<typeof boltonPose>,place:BoltonPlace){
  const b=this.clothes;b.begin();const c=place==='cliffs'?'#79b5d8':place==='cave'?'#777783':'#b89b72',inner=place==='cave'?'#8f9095':'#e7e5ce',levels=[[-3,6,5],[-16,23,11],[-45,20,10],[-70,18,10]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],c);for(let i=0;i<22;i++){const q=i/22*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),c,.85);}
  for(const side of [-1,1])this.line(b,[[side*6,-2,6],[side*14,-12,12],[side*5,-31,12],[side*10,-68,11]],inner,1.3);for(let y=-39;y>-64;y-=9)this.ring(b,[3,y,12],[1,0,0],[0,1,0],inner);this.ring(b,[0,-70,0],[19,0,0],[0,0,11],'#c6bf9c',1.6);this.box(b,[0,-70,12],8,6,2,'#d5cbad');if(place==='fire')for(const side of [-1,1])this.line(b,[[side*13,-10,11],[side*25,-68,10],[side*28,-97,8],[side*14,-96,13]],'#c4a37b',1.3,.9,true);b.end();
  const l=this.limbs;l.begin();for(const side of [-1,1]){const step=Math.sin(p.t*5+side)*p.walk,knee:P=[side*13,-109+Math.max(0,step)*6,step*12],ankle:P=[side*17,-149+Math.max(0,step)*10,step*8];this.tube(l,[side*10,-70,0],knee,9,6,'#809eb8');this.tube(l,knee,ankle,6,4.5,'#809eb8');this.tube(l,ankle,[ankle[0],ankle[1],ankle[2]+17],5,4,'#c3b59b');let hand:P=[side*(28+55*p.open),-57+60*p.open,17];if(p.heart>.1)hand=[side*12,-25,24];if(p.reach>.1&&side<0)hand=[-47,3+18*p.reach,28];const elbow:P=[side*(30+23*p.open),-36+25*p.open,6];this.tube(l,[side*23,-16,0],elbow,6,4.5,c);this.tube(l,elbow,hand,4.5,2.5,c);for(let i=0;i<5;i++)this.line(l,[[hand[0]+side*(i-2),hand[1],hand[2]],[hand[0]+side*(i-2)*1.8,hand[1]+8-i*.5,hand[2]+1]],'#c8c2ae',1.05);}l.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=boltonPose(t),place=boltonPlace(view,t),c=boltonCamera(view,this.width/this.height,t);if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([key,g])=>g.visible=key===place);const bg=new THREE.Color(place==='cliffs'||place==='lovers'?'#397eae':place==='cave'?'#180d09':place==='storm'?'#424c4c':'#17172e');this.scene.background=bg;(this.scene.fog as THREE.Fog).color.copy(bg);
  this.singer.visible=view==='bolton'||(place!=='lovers'&&place!=='horses'&&place!=='storm'&&view!=='bolton-cliffs');this.singer.position.set(0,150,55);this.singer.rotation.set(0,Math.sin(t*.18)*.04,p.tilt);this.head.scene.rotation.set(-p.open*.13,-Math.PI/2+Math.sin(t*.3)*.06,0);this.buildHair(p);this.body(p,place);
  this.lovers.rotation.set(0,Math.sin(t*.16)*.09,-.025);this.horses.position.x=Math.sin(t*.17)*45;this.horses.rotation.y=-.2;
  this.fireSprites.forEach((m,i)=>{m.visible=place==='fire'||place==='horses';m.scale.set(.6+(i%3)*.2,.45+.8*(.5+.5*Math.sin(t*7+i*1.7)),1);m.rotation.z=Math.sin(t*4+i)*.13;});this.flames.begin();if(place==='fire'||place==='horses')for(let i=0;i<60;i++){const x=-380+i*13,y=8+((i*17)%20),h=20+30*(.5+.5*Math.sin(t*8+i*2.1));this.line(this.flames,[[x-6,y,145],[x+Math.sin(t*6+i)*7,y+h*.5,145],[x+Math.cos(t*4+i)*9,y+h,145]],i%3?'#f6b85d':'#f6e0a0',2,.75);}this.flames.end();this.clouds.begin();if(place==='storm'||place==='fire'||place==='horses')for(let i=0;i<33;i++){const y=80+(i%11)*30,x=-900+((i*173+t*9)%1800);this.line(this.clouds,[[x-150,y,-1550],[x,y+Math.sin(t*.3+i)*20,-1550],[x+150,y+5,-1550]],place==='storm'?'#b7c1b7':'#c08c9d',2,.28);}this.clouds.end();
  const msg=this.track.message(this.track.indexAt(t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.scene.updateMatrixWorld(true);if(this.singer.visible){this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);const material=this.veil.material as THREE.MeshBasicMaterial;material.color.set(p.flash>.01?'#ffffff':'#000000');material.opacity=p.flash>.01?p.flash:1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
