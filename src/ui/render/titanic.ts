import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {BonJoviCast as StoryCast} from './bon-jovi-cast.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {titanicPose,titanicPlace,titanicCamera,type TitanicPoint as P,type TitanicPlace} from '../../scene/titanic.ts';
const TAU=Math.PI*2,UP=new THREE.Vector3(0,1,0);
/** The supplied alternate edit: one physical singer and her borrowed-model dissolve. */
export class TitanicStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,12000);
 readonly heads=[new Anatomy3D(),new Anatomy3D()];readonly singers=[new THREE.Group(),new THREE.Group()];readonly bodies=[new StoryCast(),new StoryCast()];
 readonly hair=[new Beams(),new Beams()];readonly lace=[new Beams(),new Beams()];readonly ocean=new Beams();readonly clouds=new THREE.Group();
 readonly rooms:Record<TitanicPlace,THREE.Group>={deck:new THREE.Group(),sunset:new THREE.Group(),stars:new THREE.Group()};readonly ship=new THREE.Group();readonly sunset=new THREE.Group();readonly starfield=new THREE.Group();
 readonly gowns:THREE.Mesh[]=[];readonly stars:THREE.Mesh[]=[];readonly rails:THREE.Group=new THREE.Group();
 private sleeveMaterials=[0,1].map(()=>new THREE.MeshLambertMaterial({color:'#eadfc9',transparent:true,opacity:.72}));private beams:Beams[]=[...this.hair,...this.lace,this.ocean];private meshes:THREE.Mesh[]=[];private veil:THREE.Mesh;private width=1280;private height=720;private last:number|null=null;private epoch=-1;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#07182c');this.scene.add(...this.singers,this.sunset,this.starfield,...Object.values(this.rooms),new THREE.AmbientLight('#dbd3c6',1.6));
  const key=new THREE.DirectionalLight('#ffe6c2',2.2);key.position.set(-200,350,300);const rim=new THREE.DirectionalLight('#809cbf',1.7);rim.position.set(200,200,-200);this.scene.add(key,rim);
  for(let i=0;i<2;i++){const h=this.heads[i];h.centred=true;h.attachAccessory(this.hair[i].group);this.singers[i].add(h.scene,this.bodies[i].group,this.lace[i].group);const gown=new THREE.Mesh(new THREE.LatheGeometry([[31,-150],[29,-137],[22,-100],[17,-70],[14,-47],[16,-35],[18.3,-23]].map(([r,y])=>new THREE.Vector2(r,y)),40),new THREE.MeshLambertMaterial({color:'#dfd2b7',side:THREE.DoubleSide}));this.singers[i].add(gown);this.gowns.push(gown);this.meshes.push(gown);}
  this.buildSky();this.buildStars();this.buildShip();this.rooms.deck.add(this.ship);this.veil=this.plane(this.scene,2,2,'#000000',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;this.veil.renderOrder=1000;this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],c:string,w=1,a=.75,close=false){b.line(p.flat(),p.length,c,w,{alpha:a,close});}
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);b.group.traverse(o=>{const m=(o as THREE.Mesh).material as THREE.Material|undefined;if(m)m.depthTest=true;});this.beams.push(b);return b;}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private solid(parent:THREE.Object3D,p:P,w:number,h:number,d:number,c:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private gradient(parent:THREE.Object3D,p:P,w:number,h:number,palette:string[]){const geometry=new THREE.PlaneGeometry(w,h,1,palette.length-1),position=geometry.getAttribute('position'),colors=new Float32Array(position.count*3);for(let i=0;i<position.count;i++){const c=new THREE.Color(palette[Math.floor(i/2)]);c.toArray(colors,i*3);}geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));const m=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private buildSky(){
  this.gradient(this.sunset,[0,600,-3600],12000,3000,['#061731','#1b4264','#5c5f75','#b36651','#dc7c3c','#ecb35c','#785355']);
  for(let i=0;i<12;i++){const glow=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:i%2?'#efbd6b':'#e29e51',transparent:true,opacity:.018,depthWrite:false}));glow.position.set(1000,430,-3450+i);glow.scale.setScalar(380-i*15);this.sunset.add(glow);this.meshes.push(glow);}
  this.sunset.add(this.clouds);for(let i=0;i<48;i++){const cloud=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:i%3?'#31405e':'#9c5862',transparent:true,opacity:.11,depthWrite:false}));cloud.position.set(-4700+(i*571)%9400,50+(i*173)%1450,-3350+(i%7)*7);cloud.scale.set(350+(i*79)%700,18+(i*13)%40,1);cloud.rotation.z=Math.sin(i)*.04;this.clouds.add(cloud);this.meshes.push(cloud);}
  const water=this.plane(this.rooms.deck,13000,11000,'#23455c',[0,-130,-4300]);water.rotation.x=-Math.PI/2;this.rooms.deck.add(this.ocean.group);
 }
 private buildStars(){this.gradient(this.starfield,[0,500,-1700],6500,2600,['#020817','#061226','#091e33','#07182a']);for(let i=0;i<240;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(1,8),new THREE.MeshBasicMaterial({color:i%5?'#c0cee0':'#e2d9bc',transparent:true,opacity:.28,depthWrite:false}));m.position.set(-2300+(i*197)%4600,-320+(i*113)%1880,-1600+(i*31)%340);m.scale.setScalar(1+(i*7)%5);this.starfield.add(m);this.stars.push(m);this.meshes.push(m);}}
 private buildShip(){
  const b=this.ink(this.ship),arc=(a:number,y:number,scale=1):P=>[320*Math.sin(a)*scale,y,45+210*Math.cos(a)*scale];
  const geometry=new THREE.BufferGeometry(),vertices:number[]=[];for(let i=0;i<48;i++){const a=-Math.PI/2+i/48*Math.PI,n=a+Math.PI/48;vertices.push(0,0,-160,...arc(a,0),...arc(n,0));}geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();const deck=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:'#715d48',side:THREE.DoubleSide}));this.ship.add(deck);this.meshes.push(deck);
  // Curved hull plating, white bulwark and three rails around the actual bow.
  const hull:number[]=[];for(let i=0;i<48;i++){const a=-Math.PI/2+i/48*Math.PI,n=a+Math.PI/48,p=arc(a,0),q=arc(n,0),u=arc(a,-135,.86),v=arc(n,-135,.86);hull.push(...p,...u,...q,...q,...u,...v);}const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hull,3));hg.computeVertexNormals();const shell=new THREE.Mesh(hg,new THREE.MeshLambertMaterial({color:'#344446',side:THREE.DoubleSide}));this.ship.add(shell,this.rails);this.meshes.push(shell);
  for(const y of [15,40,66,92])this.line(b,Array.from({length:61},(_,i)=>arc(-Math.PI/2+i/60*Math.PI,y)),'#d1d9d1',y===92?3:1.8,.95);
  for(let i=0;i<19;i++){const a=-Math.PI/2+i/18*Math.PI,p=arc(a,0);this.solid(this.rails,[p[0],46,p[2]],5,92,5,'#c5cfc8');}
  for(let i=0;i<40;i++){const x=-310+i*16,z=45+210*Math.sqrt(Math.max(0,1-(x/320)**2));this.line(b,[[x,.5,-160],[x,.5,z]],'#b0a184',.85,.5);}
  for(const y of [-36,-85,-127])this.line(b,Array.from({length:61},(_,i)=>arc(-Math.PI/2+i/60*Math.PI,y,1+y*.001)),'#8a9a9a',1,.6);
  for(let i=0;i<13;i++){const a=-1.45+i/12*2.9,p=arc(a,-60,.94);this.line(b,Array.from({length:25},(_,j)=>[p[0]+Math.cos(j/24*TAU)*9,p[1]+Math.sin(j/24*TAU)*9,p[2]+1]as P),'#d0d0b3',1.3,.7,true);}
  this.solid(this.ship,[0,5,-220],620,10,200,'#6e604f');b.end();
 }
 private link(m:THREE.Mesh,a:P,c:P,r:number){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...c),d=w.clone().sub(v);m.position.copy(v).add(w).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UP,d.clone().normalize());m.scale.set(r,d.length(),r);}
 private dress(index:number,p:ReturnType<typeof titanicPose>,grip:boolean){
  const body=this.bodies[index];body.begin();body.person(0,0,0,'#bc9a85',{female:true,skin:'#bc9a85',hairColor:'#9c7756',pose:'ballad',trousers:'#d2c5ae'},p.t);body.end();const f=body.figures[0];f.head.visible=false;f.neck.visible=false;f.skirt.visible=false;f.limbs.slice(0,4).forEach(m=>m.visible=false);f.shoes.forEach(m=>m.visible=false);f.torso.rotation.z=Math.PI;f.torso.position.y+=7;for(let k=4;k<8;k++)f.limbs[k].material=this.sleeveMaterials[index];
  const b=this.lace[index];b.begin();
  for(const [n,side]of [-1,1].entries()){
   const heart=p.heart,open=p.open,hand:P=grip?[side*53,72,44]:[side*(20+48*open)*(1-heart*.55),100+19*heart-3*open,18+heart*7],shoulder:P=[side*18,123,0],elbow:P=[side*(28+18*open),98+heart*5,7+heart*9];
   this.link(f.limbs[4+n*2],shoulder,elbow,5.2);this.link(f.limbs[5+n*2],elbow,hand,3.8);f.hands[n].position.set(...hand);f.hands[n].scale.set(3.2,5.5,2.4);f.hands[n].rotation.z=side*(-.2+open*.65);
   // A fine diamond lattice on both complete sleeves follows the actual arm joints.
   for(const [a,c]of [[shoulder,elbow],[elbow,hand]]){const start=new THREE.Vector3(...a),delta=new THREE.Vector3(...c).sub(start),basis=new THREE.Quaternion().setFromUnitVectors(UP,delta.clone().normalize());for(let j=0;j<9;j++)for(let k=0;k<6;k++){const points=Array.from({length:3},(_,q)=>{const u=(j+q*.5)/9,angle=(k/6+q*.045)*TAU,r=4.5;const v=new THREE.Vector3(Math.cos(angle)*r,delta.length()*u,Math.sin(angle)*r).applyQuaternion(basis).add(start);return[v.x,v.y-135,v.z]as P;});this.line(b,points,'#f1e9d3',.6,.48);}}
  }
  for(let k=0;k<18;k++){const x=-17+k*2;this.line(b,[[x*.8,-24,8],[x,-30,11],[x*.7,-40,11],[x*1.05,-66,15],[x*1.9,-149,6]],k%3?'#d0c1a3':'#f3e9ce',.6,.5);}
  this.line(b,[[-17,-23,8],[-12,-27,11],[0,-30,14],[12,-27,11],[17,-23,8]],'#f3e8cf',1.3,.95);b.end();
  const h=this.hair[index];h.begin();for(let i=0;i<80;i++){const a=i/80*TAU,front=Math.cos(a)>.45;if(!front&&Math.abs(Math.sin(a))<.68)continue;this.line(h,Array.from({length:17},(_,j)=>{const u=j/16,q=.15+u*(front?.85:2.35),tail=Math.max(0,u-.55)/.45;return[(10.5*Math.sin(q)+Math.sin(u*8+i)*.3)*Math.cos(a)-1-tail*1.5,18+11*Math.cos(q)-tail*(front?0:18),(9.3*Math.sin(q)+Math.sin(u*9+i)*.4)*Math.sin(a)+tail*(Math.sin(a)*5+Math.sin(p.t*.9+i)*p.wind*2.8)]as P;}),i%4?'#a18260':'#d3b586',.85,.9);}
  for(const side of [-1,1])this.line(h,Array.from({length:17},(_,j)=>[.2+Math.cos(j/16*TAU)*1.3,8+Math.sin(j/16*TAU)*1.3,side*10.6]as P),'#fff5d8',1.3,.95,true);h.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.heads.forEach(a=>a.resize(w,h));this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0)),p=titanicPose(t),place=titanicPlace(view,t),c=titanicCamera(view,this.width/this.height,t),dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));if(epoch!==this.epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.heads.forEach(h=>h.resetMotion());this.last=t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([id,g])=>g.visible=id===place);this.sunset.visible=place!=='stars';this.starfield.visible=place==='stars';this.ship.position.y=place==='deck'?Math.sin(t*.19)*1.1:0;this.scene.background=new THREE.Color(place==='stars'?'#030b19':'#16314a');
  const echo=view==='titanic-dissolve'?Math.max(.6,p.echo):p.echo;this.singers[1].visible=echo>.02&&place!=='deck';
  for(let i=0;i<2;i++){const s=this.singers[i];s.position.set(i?-74:0,150+this.ship.position.y+(i?7:0),i?-55:0);s.scale.setScalar(i?.86:1);s.rotation.set(0,i?-.18:0,p.sway);this.heads[i].scene.rotation.set(-.02,-Math.PI/2+(i?.4:Math.sin(t*.19)*.12),Math.sin(t*.24+i)*.028);this.dress(i,p,place==='deck'&&(view==='titanic-bow'||p.grip));}
  const b=this.ocean;b.begin();if(place==='deck')for(let i=0;i<120;i++){const z=-260-i*44,x=-4000+(i*317)%8000,length=120+(i*43)%450;this.line(b,Array.from({length:9},(_,j)=>[x+j*length/8,-128+Math.sin(t*1.5+i+j*.6)*1.5,z+Math.sin(t*.45+i+j)*9]as P),i%4?'#91a3ab':'#d5ad76',1,.18+.1*Math.sin(i+t*.5)**2);}b.end();
  this.stars.forEach((s,i)=>(s.material as THREE.MeshBasicMaterial).opacity=.18+.36*(.5+.5*Math.sin(t*.7+i*1.9)));
  this.scene.updateMatrixWorld(true);const msg=this.track.message(this.track.indexAt(t)),a=VoiceModel.articFromArray(msg.t.artic),frame=this.model.frame(a),tele=playing?msg:null;
  for(let i=0;i<2;i++){if(!this.singers[i].visible)continue;const head=this.heads[i];head.camera.copy(this.camera);head.camera.updateMatrixWorld();head.face.update(tele,dt);head.update(this.model,frame,a,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);if(i)this.singers[i].traverse(o=>{const m=(o as THREE.Mesh).material as THREE.Material|undefined;if(m){m.transparent=true;m.opacity=.25*echo;m.depthWrite=false;if((o as THREE.Mesh&{isLineSegments2?:boolean}).isLineSegments2){(m as THREE.Material&{color:THREE.Color}).color.setRGB(.25*echo,.25*echo,.25*echo);m.opacity=1;}}});}
  this.veil.position.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(new THREE.Vector3()),2);this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.forEach(b=>b.group.removeFromParent());this.heads.forEach(h=>h.dispose());this.bodies.forEach(b=>b.dispose());this.sleeveMaterials.forEach(m=>m.dispose());this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
