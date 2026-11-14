import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {stayPose,stayPlace,stayCamera,type StayId,type StayPoint as P} from '../../scene/stay.ts';
interface Actor{id:StayId;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;body:Beams;makeup:Beams}
const TAU=Math.PI*2,ivory='#dddde4',blue='#69b9e5',gold='#c5a27a';
/** Two leased singing airways, one silent borrowed patient, and source-clock acting. */
export class StayStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,4/3,1,8000);readonly actors:Actor[]=[];
 readonly room=new THREE.Group();readonly tunnel=new THREE.Group();readonly bed=new THREE.Group();readonly earth=new THREE.Group();readonly patient=new THREE.Group();readonly patientHead=new Anatomy3D();
 readonly bars:THREE.Mesh[]=[];readonly sheet:THREE.Mesh;readonly curtain=new Beams();readonly flames=new Beams();readonly patientInk=new Beams();
 private beams:Beams[]=[this.curtain,this.flames,this.patientInk];private meshes:THREE.Mesh[]=[];private candles:P[]=[];private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 constructor(cast:{id:StayId;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==2||!cast.some(c=>c.id==='marcella')||!cast.some(c=>c.id==='siobhan'))throw Error('Stay requires both contrasting physical singers.');
  this.scene.background=new THREE.Color('#020613');this.scene.add(this.room,this.tunnel,this.bed,this.patient,this.flames.group);
  for(const c of cast){const a:Actor={...c,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),body:new Beams(),makeup:new Beams()};a.head.centred=true;a.head.attachAccessory(a.hair.group);a.head.attachAccessory(a.makeup.group);a.root.add(a.head.scene,a.body.group);this.scene.add(a.root);this.actors.push(a);this.beams.push(a.hair,a.body,a.makeup);const profile=(c.id==='marcella'?[[31,-125],[25,-90],[19,-62],[16,-40],[22,-16],[5,-3]]:[[18,-73],[17,-58],[16,-36],[21,-16],[5,-3]]).map(([r,y])=>new THREE.Vector2(r,y));const garment=new THREE.Mesh(new THREE.LatheGeometry(profile,32),new THREE.MeshBasicMaterial({color:c.id==='marcella'?'#111724':'#171829',side:THREE.DoubleSide}));garment.scale.z=.48;a.root.add(garment);this.meshes.push(garment);}
  this.patientHead.centred=true;this.patient.add(this.patientHead.scene,this.patientInk.group);this.patientHead.scene.rotation.y=-Math.PI/2;
  this.buildRoom();this.buildTunnel();this.buildBed();
  const geo=new THREE.PlaneGeometry(260,146,30,16);geo.rotateX(-Math.PI/2);this.sheet=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#8596b6',side:THREE.DoubleSide}));this.sheet.position.set(0,89,22);this.bed.add(this.sheet);this.meshes.push(this.sheet);
  for(let i=0;i<2;i++){const bar=this.plane(this.scene,2,2,'#000000',[0,0,0]);(bar.material as THREE.MeshBasicMaterial).depthTest=false;(bar.material as THREE.MeshBasicMaterial).depthWrite=false;bar.renderOrder=999;this.bars.push(bar);}
  this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'stay-earth',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,p:P[],c:string,w=1,a=.85,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.85){this.line(b,Array.from({length:32},(_,i)=>{const q=i/32*TAU;return c.map((x,k)=>x+u[k]*Math.cos(q)+v[k]*Math.sin(q))as P;}),col,w,a,true);}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P,alpha=1){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,transparent:alpha<1,opacity:alpha,depthWrite:alpha>=1}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private box(parent:THREE.Object3D,w:number,h:number,d:number,c:string,p:P){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private sphere(parent:THREE.Object3D,p:P,s:P,c:string){const m=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),new THREE.MeshBasicMaterial({color:c}));m.position.set(...p);m.scale.set(...s);parent.add(m);this.meshes.push(m);return m;}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();const at=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray()as P;for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>at(t,i/12*TAU)),c,.85,.8,true);for(let i=0;i<9;i++)this.line(b,[at(0,i/9*TAU),at(1,i/9*TAU)],c,.85,.85);}
 private hand(b:Beams,a:P,side:number,c:string,spread=1){for(let i=0;i<5;i++){const dx=side*(i-2)*1.7;this.line(b,[[a[0]+dx,a[1],a[2]],[a[0]+dx*spread,a[1]+7-i*.5,a[2]+3],[a[0]+dx*spread,a[1]+11-i*.8,a[2]+2]],c,1);}}
 private buildRoom(){
  const b=this.ink(this.room);this.plane(this.room,2300,2300,'#081022',[0,-2,-150]).rotation.x=-Math.PI/2;this.plane(this.room,2400,1350,'#010513',[0,350,-950]);
  for(let i=0;i<240;i++){const x=-1120+(i*173.71)%2240,y=20+(i*89.13)%1050,z=-910+(i%4)*20;this.line(b,[[x,y,z],[x+1.2+(i%4),y+.6,z]],i%3===0?'#99d7fa':'#486eae',i%9===0?2.8:1,.75);}
  this.earth.position.set(-160,215,-565);this.room.add(this.earth);this.sphere(this.earth,[0,0,0],[145,145,145],'#10516d');const globe=this.ink(this.earth);
  for(let j=-3;j<=3;j++){const q=j/4*Math.PI/2;this.ring(globe,[0,Math.sin(q)*145,0],[Math.cos(q)*145,0,0],[0,0,Math.cos(q)*145],'#177990',1,.32);}for(let i=0;i<9;i++){const q=i/9*Math.PI;this.ring(globe,[0,0,0],[Math.cos(q)*145,0,Math.sin(q)*145],[0,145,0],'#298da0',1,.3);}
  const continents=[[[ -15,35],[5,36],[30,28],[42,10],[35,-20],[18,-35],[7,-20],[-5,5]], [[-10,37],[-10,55],[8,70],[35,64],[45,40],[28,36]],[[35,35],[48,62],[85,73],[145,60],[170,42],[120,20],[105,0],[73,8],[58,25]],[[110,-12],[140,-10],[154,-27],[130,-40],[115,-30]],[[-170,66],[-132,70],[-110,53],[-54,48],[-80,10],[-100,20],[-125,45]],[[-81,12],[-50,5],[-35,-10],[-55,-50],[-70,-53],[-80,-10]]];
  const point=(lon:number,lat:number,r=146):P=>{const a=lon*Math.PI/180,q=lat*Math.PI/180;return [r*Math.cos(q)*Math.sin(a),r*Math.sin(q),r*Math.cos(q)*Math.cos(a)];};
  for(const land of continents){const centre=land.reduce((v,p)=>[v[0]+p[0]/land.length,v[1]+p[1]/land.length],[0,0]),verts:number[]=[];for(let i=0;i<land.length;i++){const v=land[i],w=land[(i+1)%land.length];const grid=(u:number,z:number)=>point(centre[0]+(v[0]-centre[0])*u/8+(w[0]-centre[0])*z/8,centre[1]+(v[1]-centre[1])*u/8+(w[1]-centre[1])*z/8);for(let j=0;j<8;j++)for(let k=0;k<8-j;k++){verts.push(...grid(j,k),...grid(j+1,k),...grid(j,k+1));if(k<7-j)verts.push(...grid(j+1,k),...grid(j+1,k+1),...grid(j,k+1));}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#5095a3',side:THREE.DoubleSide}));this.earth.add(m);this.meshes.push(m);this.line(globe,land.map(([lon,lat])=>point(lon,lat,147)),'#8bc8ce',1.3,.8,true);}
  for(let i=0;i<20;i++){const lat=-65+(i*31)%130,lon=(i*71)%360-180;this.line(globe,Array.from({length:24},(_,j)=>point(lon+j*1.1,lat+Math.sin(j*.3+i)*2,148)),'#b0d4e1',2.5,.4);}
  globe.end();
  for(const x of [-405,-235,235,405]){this.box(this.room,30,630,24,'#154b78',[x,250,-320]);this.line(b,[[x-10,-65,-305],[x-10,570,-305]],'#499fc9',2.5,.85);this.box(this.room,41,14,40,'#18405c',[x,15,-320]);}
  for(const side of [-1,1]){for(let k=0;k<3;k++){const x=side*(178+k*45),z=-50-k*25,y=116+k*22;this.line(b,[[x,16,z],[x,y,z]],gold,1.7);this.ring(b,[x,y-3,z],[13,0,0],[0,0,8],gold,1.4);this.box(this.room,4,22,4,'#c7beb1',[x,y+10,z]);this.candles.push([x,y+23,z]);}}
  b.end();
 }
 private buildTunnel(){
  const b=this.ink(this.tunnel);this.tunnel.add(this.curtain.group);this.plane(this.tunnel,1500,1100,'#080f34',[0,400,-950]);this.plane(this.tunnel,750,1000,'#b8d9f6',[0,400,-900]);
  for(let i=0;i<9;i++){const w=90+i*20,z=-830+i*73,alpha=.12+i*.025;for(const side of [-1,1]){this.plane(this.tunnel,210,680,'#164baf',[side*(w+108),280,z],alpha+.15);this.line(b,[[side*w,0,z],[side*(w+8),520,z],[side*(w-3),600,z]],'#8bbdfb',2,alpha);}}
  this.plane(this.tunnel,1100,1600,'#143371',[0,-2,-270]).rotation.x=-Math.PI/2;b.end();
 }
 private buildBed(){const b=this.ink(this.bed);this.box(this.bed,292,18,160,'#302733',[0,65,18]);this.box(this.bed,278,17,149,'#8e91a2',[0,81,18]);this.box(this.bed,65,14,111,'#bdc1ca',[-100,95,18]);
  for(const x of [-151,151]){this.box(this.bed,8,123,8,'#756049',[x,65,-69]);this.sphere(this.bed,[x,128,-69],[7,7,7],gold);for(const inset of [0,7,14])this.ring(b,[x,125,-69],[0,0,73-inset],[0,73-inset,0],gold,1.7);}
  for(const z of [-69,104])this.line(b,[[-150,57,z],[150,57,z]],gold,2);for(const x of [-137,137])for(const z of [-60,95])this.box(this.bed,9,54,9,'#756049',[x,27,z]);b.end();
 }
 private hair(a:Actor,t:number){const b=a.hair,dark=a.id==='siobhan';b.begin();
  for(let i=0;i<(dark?102:80);i++){const angle=i/(dark?102:80)*TAU,front=Math.cos(angle)>.3;
   this.line(b,Array.from({length:dark?24:17},(_,j)=>{const q=.06+Math.min(1,j/(dark?13:16))*(front?.95:2.4),tail=dark?Math.max(0,j-13)/10:0,r=10+(dark?Math.sin(j*1.5+i)*1.5:0),sweep=dark?0:Math.sin(q)*Math.sin(angle)*2;return [-2+r*Math.sin(q)*Math.cos(angle)+tail*Math.sin(t*.5+i)*1.2,16+10*Math.cos(q)-tail*23+sweep,(r*Math.sin(q))*Math.sin(angle)+tail*Math.sin(j+i)*2]as P;}),dark?'#6a7697':'#747d95',dark?1.2:1,.9);
  }if(dark){for(let i=0;i<12;i++){const q=i/12*TAU;this.ring(b,[-2+9*Math.cos(q),24+Math.sin(q)*2,9*Math.sin(q)],[1.1,0,0],[0,.8,0],gold,1.7,.9);}}
  b.end();const m=a.makeup;m.begin();for(const side of [-1,1]){this.line(m,[[7,21,side*5],[10,20,side*8],[9,19,side*5]],dark?'#b7a9bd':'#adb4cc',1.5);this.line(m,[[11,6,side*.4],[11.2,6.5,side*3.5]],dark?'#ae8aa7':'#c68d9e',1.7);}m.end();
 }
 private body(a:Actor,p:ReturnType<typeof stayPose>){const b=a.body,dark=a.id==='siobhan',col=dark?'#8d93ad':'#717b94',levels=dark?[[-3,5,5],[-16,22,10],[-36,17,9],[-58,18,10],[-73,19,11]]:[[-3,5,5],[-16,23,10],[-40,17,9],[-62,20,11],[-90,26,14],[-125,32,18]];b.begin();
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],col,1,.9);for(let i=0;i<20;i++){const q=i/20*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),col,.9,.8);}
  if(!dark){this.line(b,[[-15,-12,7],[-13,-22,10],[0,-25,12],[13,-22,10],[15,-12,7]],ivory,3.5);this.line(b,[[-14,-13,8],[-10,-20,11],[0,-22,13],[10,-20,11],[14,-13,8]],ivory,2);}
  else {for(let i=0;i<52;i++){const y=-9-(i*13)%63,x=((i*17)%34)-17,z=10+Math.sin(i)*1.4;this.line(b,[[x-1.5,y,z],[x+1.5,y+.5,z]],i%4?gold:'#c7c9df',i%5?1.5:2.5,.65+.3*Math.sin(p.t*1.1+i)**2);}for(const side of [-1,1]){this.tube(b,[side*11,-72,0],[side*13,-111,1],10,7,col);this.tube(b,[side*13,-111,1],[side*15,-150,7],7,4,col);}}
  for(const side of [-1,1]){let hand:P,elbow:P;
   if(dark){const lift=45+40*p.threat;hand=[side*(39+21*p.threat),-48+lift,23];elbow=[side*34,-24,4];if(p.place!=='tunnel'){hand=[-side*12-47,-36+14*p.struggle,27];elbow=[side*29,-27,5];}}
   else {hand=[side*(13+7*p.plead),-30+8*p.plead,26];elbow=[side*28,-36,7];if(p.struggle>.1){hand=[side*(25+25*p.struggle),-15,35];elbow=[side*36,-25,8];}if(p.embrace>.1){hand=[side*19,-12,28];elbow=[side*29,-20,9];}}
   this.tube(b,[side*22,-17,0],elbow,6,4,col);this.tube(b,elbow,hand,4,2.6,col);this.hand(b,hand,side,dark?'#b7acb7':ivory,dark?1.9:1.1);
  }b.end();
 }
 private drawPatient(p:ReturnType<typeof stayPose>){const b=this.patientInk;b.begin();for(const side of [-1,1]){this.tube(b,[side*11,-59,0],[side*13,-103,0],10,7,ivory);this.tube(b,[side*13,-103,0],[side*15,-145,7],7,4,ivory);const elbow:P=[side*30,-31,7],hand:P=[side*(10+16*p.embrace),-17+10*p.embrace,24];this.tube(b,[side*23,-17,0],elbow,6,4,ivory);this.tube(b,elbow,hand,4,2.7,ivory);this.hand(b,hand,side,ivory);}
  for(const [y,w]of [[-5,6],[-18,25],[-40,24],[-61,21]])this.ring(b,[0,y,0],[w,0,0],[0,0,10],ivory);for(let i=0;i<16;i++){const q=i/16*TAU;this.line(b,[[-5*Math.cos(q),-5,5*Math.sin(q)],[25*Math.cos(q),-18,10*Math.sin(q)],[21*Math.cos(q),-61,10*Math.sin(q)]],ivory,.9);}b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.actors.forEach(a=>a.head.resize(w,h));this.patientHead.resize(w,h);this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const p=stayPose(time),place=stayPlace(view,p.t),c=stayCamera(view,this.width/this.height,p.t),tunnel=place==='tunnel';
  if(this.epoch!==epoch||this.last!==null&&Math.abs(p.t-this.last)>.25){this.actors.forEach(a=>a.head.resetMotion());this.patientHead.resetMotion();}
  const dt=this.last===null?0:Math.max(0,Math.min(.05,p.t-this.last));this.epoch=epoch;this.last=p.t;this.camera.position.set(...c.position);this.camera.fov=c.fov;this.camera.lookAt(...c.target);if(view==='stay-overhead')this.camera.rotateZ(Math.sin(p.t*.1)*.4);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  this.room.visible=!tunnel;this.tunnel.visible=tunnel;this.bed.visible=!tunnel;this.patient.visible=!tunnel&&view!=='stay-earth';this.earth.rotation.y=p.t*.006;
  for(const a of this.actors){const dark=a.id==='siobhan',at=dark?p.siobhan:p.marcella;a.root.position.set(...at);a.root.visible=view===a.id||(dark?tunnel||p.place==='struggle':!tunnel&&view!=='stay-earth');a.root.rotation.set(dark?Math.sin(p.t*.65)*.025:0,0,dark?Math.sin(p.t*.71)*.035:p.embrace>.1?.08:-.13*p.plead);
   a.head.scene.rotation.set(dark?-.03:.04,-Math.PI/2+(dark?Math.sin(p.t*.7)*.11:Math.sin(p.t*.25)*.07),dark?Math.sin(p.t*.4)*.04:0);this.hair(a,p.t);this.body(a,p);
   const msg=a.track.message(a.track.indexAt(p.t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.scene.updateMatrixWorld(true);if(a.root.visible){a.head.camera.copy(this.camera);a.head.camera.updateMatrixWorld();a.head.face.update(tele,dt);a.head.update(a.model,a.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  }
  this.patient.position.set(-110+145*p.revival,101+37*p.revival,31+27*p.revival);this.patient.rotation.set(0,0,Math.PI/2*(1-p.revival));this.drawPatient(p);this.patient.updateMatrixWorld(true);
  if(this.patient.visible){const model=this.actors.find(a=>a.id==='marcella')!.model,artic=VoiceModel.articFromArray(this.actors[0].track.message(0).t.artic);this.patientHead.camera.copy(this.camera);this.patientHead.camera.updateMatrixWorld();this.patientHead.face.update(null,dt);this.patientHead.update(model,model.frame(artic),artic,null,{pressure:false,particles:false,grid:false,calipers:false},dt);}
  const pos=this.sheet.geometry.getAttribute('position');for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,Math.sin(x*.08+z*.04)*1.5+Math.exp(-(((x-5)/62)**2))*12*(1-p.revival)+p.struggle*(5+Math.sin(p.t*5+x*.07)*8)*(z+73)/146);}pos.needsUpdate=true;
  this.curtain.begin();for(const side of [-1,1])for(let i=0;i<38;i++){const x=side*(50+i*9),z=-220-i*7;this.line(this.curtain,Array.from({length:20},(_,j)=>[x+Math.sin(j*.65+p.t*.6+i)*5,5+j*30,z+Math.cos(j*.4+i)*7]as P),'#5483cb',1.25,.55); }this.curtain.end();
  this.flames.begin();if(!tunnel)for(const [i,[x,y,z]]of this.candles.entries())this.line(this.flames,[[x,y,z],[x+Math.sin(p.t*6+i)*1.6,y+8+Math.sin(p.t*8+i)*2,z]],'#ffe0b2',2.4,.95);this.flames.end();
  const direction=this.camera.getWorldDirection(new THREE.Vector3()),right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),height=2*Math.tan(this.camera.fov*Math.PI/360)*1.5,width=height*this.camera.aspect,band=Math.max(0,(width-height*656/480)/2);this.bars.forEach((bar,i)=>{bar.visible=band>0;bar.position.copy(this.camera.position).addScaledVector(direction,1.5).addScaledVector(right,(i?1:-1)*(width/2-band/2));bar.quaternion.copy(this.camera.quaternion);bar.scale.set(band/2+.001,height/2+.01,1);});
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const a of this.actors){a.hair.group.removeFromParent();a.makeup.group.removeFromParent();a.head.dispose();}this.patientHead.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
