import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {mendesPose,mendesPlace,mendesCamera,type MendesPoint as P,type MendesPlace} from '../../scene/mas-que-nada.ts';

const TAU=Math.PI*2;
type DecorOptions={female?:boolean;seated?:boolean;sergio?:boolean;gesture?:number;phase?:number;instrument?:'guitar'|'bass'|'drums';dress?:string};

/** One borrowed physical Lani; Sérgio, the second singer and band are procedural decorative figures. */
export class MendesStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(38,16/9,1,5000);
 readonly head=new Anatomy3D();readonly singer=new THREE.Group();
 readonly rooms:Record<MendesPlace,THREE.Group>={stage:new THREE.Group(),piano:new THREE.Group(),singers:new THREE.Group(),jungle:new THREE.Group(),band:new THREE.Group()};
 readonly hair=new Beams();readonly dress=new Beams();readonly limbs=new Beams();readonly microphone=new Beams();readonly decor=new Beams();readonly effects=new Beams();readonly film=new Beams();
 private beams:Beams[]=[this.hair,this.dress,this.limbs,this.microphone,this.decor,this.effects,this.film];private meshes:THREE.Mesh[]=[];
 private width=1280;private height=720;private epoch=-1;private last:number|null=null;private veil:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.background=new THREE.Color('#211b10');this.scene.fog=new THREE.Fog('#211b10',900,3200);
  Object.values(this.rooms).forEach(g=>this.scene.add(g));this.scene.add(this.singer,this.microphone.group,this.decor.group,this.effects.group,this.film.group);
  this.head.centred=true;this.head.attachAccessory(this.hair.group);this.singer.add(this.head.scene,this.dress.group,this.limbs.group);
  for(const b of this.beams){b.begin();b.end();}this.buildSets();this.buildDressForm();
  this.veil=this.plane(this.scene,2,2,'#120e08',[0,0,0]);const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;m.opacity=1;this.veil.renderOrder=1000;
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private ink(parent:THREE.Object3D){const b=new Beams();b.begin();parent.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,ps:P[],c:string,w=1,a=.8,close=false){b.line(ps.flat(),ps.length,c,w,{alpha:a,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,a=.8){this.line(b,Array.from({length:28},(_,i)=>{const q=i/28*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q))as P;}),col,w,a,true);}
 private box(b:Beams,p:P,w:number,h:number,d:number,c:string){for(const z of [-d/2,d/2])this.line(b,[[-w/2,-h/2,z],[w/2,-h/2,z],[w/2,h/2,z],[-w/2,h/2,z]].map(v=>v.map((x,k)=>x+p[k])as P),c,1,.8,true);for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])this.line(b,[[p[0]+x,p[1]+y,p[2]-d/2],[p[0]+x,p[1]+y,p[2]+d/2]],c);}
 private plane(parent:THREE.Object3D,w:number,h:number,c:string,p:P){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private solid(parent:THREE.Object3D,p:P,w:number,h:number,d:number,c:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private floor(parent:THREE.Object3D,c:string){const m=this.plane(parent,2200,2200,c,[0,-1,-400]);m.rotation.x=-Math.PI/2;}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,c:string){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const point=(t:number,q:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(q)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(q)).toArray()as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:10},(_,i)=>point(t,i/10*TAU)),c,.85,.78,true);for(let i=0;i<8;i++)this.line(b,[point(0,i/8*TAU),point(1,i/8*TAU)],c,.85,.75);
 }
 private leaf(b:Beams,c:P,angle:number,size:number,col:string){
  const u:P=[Math.cos(angle)*size,Math.sin(angle)*size,size*.15],v:P=[-Math.sin(angle)*size*.31,Math.cos(angle)*size*.31,0];
  this.ring(b,c,u,v,col,.85,.65);this.line(b,[[c[0]-u[0],c[1]-u[1],c[2]-u[2]],[c[0]+u[0],c[1]+u[1],c[2]+u[2]]],col,.85,.5);
 }
 private garden(b:Beams,place:MendesPlace){
  const dense=place==='jungle'||place==='singers',branches=dense?32:20;
  for(let i=0;i<55;i++){const x=-520+i*19;this.line(b,[[x,0,-350],[x+Math.sin(i)*9,130,-350],[x+Math.cos(i)*12,290,-350]],i%3?'#49452a':'#615638',.85,.42);}
  for(let j=0;j<branches;j++){
   const side=j%2?1:-1,x=side*(55+(j*71)%390),y=45+(j*43)%190,z=-80-(j%6)*42;
   this.line(b,[[side*360,0,z],[x*.85,y*.42,z],[x,y,z],[x-side*75,y+65,z]],'#746443',1.3,.62);
   for(let i=0;i<12;i++){const f=i/11,c:P=[x-side*f*75+Math.sin(i+j)*15,y+f*62+Math.cos(i*2+j)*10,z+4];this.leaf(b,c,Math.sin(i+j)*2.2,8+(i%5)*3,i%3?'#81784c':'#aaa06a');}
   if(j%3===0)for(let k=0;k<9;k++){const q=-1.2+k*.3,c:P=[x,y+72,z];this.line(b,[c,[c[0]+Math.sin(q)*48,c[1]+Math.cos(q)*35,c[2]+8],[c[0]+Math.sin(q)*85,c[1]+Math.cos(q)*45-14,c[2]+15]],'#9b915c',1.2,.55);}
  }
 }
 private piano(g:THREE.Group,b:Beams){
  this.solid(g,[0,75,-15],250,20,112,'#281c12');this.box(b,[0,75,-15],254,23,116,'#9b8053');
  const lid=this.solid(g,[0,116,-43],250,7,105,'#382719');lid.rotation.x=-.17;this.line(b,[[-125,120,8],[125,120,8],[125,105,-95],[-125,105,-95],[-125,120,8]],'#b0925c',1.6);
  this.solid(g,[0,83,52],224,8,45,'#c2ad7f');this.box(b,[0,83,52],228,10,47,'#756041');
  for(let i=0;i<=32;i++){const x=-108+i*6.75;this.line(b,[[x,88,32],[x,88,73]],'#6c5b40',.75,.8);if(i%7!==2&&i%7!==6)this.box(b,[x+2.7,91,40],3.5,4,23,'#3d3020');}
  for(const x of [-102,102])for(const z of [-52,35])this.tube(b,[x,70,z],[x,2,z],5,3,'#745b39');
  this.box(b,[0,106,-16],76,50,5,'#8c734a');this.plane(g,68,41,'#c8b98f',[0,107,-12]);for(let i=0;i<5;i++)this.line(b,[[-29,94+i*6,-8],[29,94+i*6,-8]],'#71664c',.75,.7);
  this.line(b,[[-12,30,25],[-9,4,38],[0,3,38]],'#a68b54',2);this.line(b,[[12,30,25],[9,4,38],[0,3,38]],'#a68b54',2);
 }
 private buildSets(){
  for(const [name,g]of Object.entries(this.rooms)){
   const place=name as MendesPlace,b=this.ink(g);this.floor(g,place==='jungle'?'#292718':place==='stage'?'#372c1b':'#302619');this.plane(g,2600,1100,place==='jungle'?'#35351e':'#2b2817',[0,480,-900]);this.garden(b,place);
   if(place==='stage'){
    for(const x of [-220,220]){this.box(b,[x,175,-150],42,350,45,'#79613c');for(let y=15;y<340;y+=24)this.line(b,[[x-18,y,-124],[x+18,y+8,-124]],'#a88c57',1,.45);}
    for(const r of [95,125,155])this.ring(b,[0,2,25],[r,0,0],[0,0,r*.55],'#8d7448',1.2,.35);
   }
   if(place==='piano'||place==='band')this.piano(g,b);
   if(place==='band'){
    this.solid(g,[185,15,-90],180,30,130,'#44351f');this.box(b,[185,31,-90],182,4,132,'#8c7348');
    for(const x of [-260,260])this.line(b,[[x,340,-210],[x*.65,0,60]],'#b89b61',3,.12);
   }
   if(place==='singers'||place==='jungle')for(let i=0;i<28;i++){const x=-340+(i*83)%680,z=-40-(i*47)%240;this.leaf(b,[x,18+(i%4)*12,z],i*2.4,18+(i%5)*4,i%2?'#777142':'#9b8d56');}
   b.end();
  }
 }
 private buildDressForm(){
  const bodice=new THREE.Mesh(new THREE.CylinderGeometry(18,15,52,20),new THREE.MeshBasicMaterial({color:'#9b8659'}));bodice.position.y=-29;bodice.scale.z=.52;this.singer.add(bodice);this.meshes.push(bodice);
  const skirt=new THREE.Mesh(new THREE.CylinderGeometry(15,38,68,24),new THREE.MeshBasicMaterial({color:'#887345'}));skirt.position.y=-83;skirt.scale.z=.48;this.singer.add(skirt);this.meshes.push(skirt);
 }
 private buildHair(){
  const b=this.hair;b.begin();
  for(let i=0;i<76;i++){
   const a=i/76*TAU,front=Math.sin(a)>.42;
   this.line(b,Array.from({length:19},(_,j)=>{const u=j/18,q=.08+u*(front?1.05:2.18),tail=Math.max(0,u-.42)/.58,wave=Math.sin(u*7+i*.8)*.55;
    return [(10.1+wave)*Math.sin(q)*Math.cos(a)-1.2,17+11.5*Math.cos(q)-tail*(front?5:57),(9.5+wave)*Math.sin(q)*Math.sin(a)-tail*3]as P;
   }),i%5===0?'#b18b57':i%3===0?'#795535':'#543922',.85,.82);
  }
  for(const side of [-1,1]){this.ring(b,[side*10,-3,5],[2.2,0,0],[0,4.5,0],'#d0b77b',1.2);this.ring(b,[side*10,-10,5],[1.5,0,0],[0,2.5,0],'#d0b77b',1);}
  b.end();
 }
 private dressBody(p:ReturnType<typeof mendesPose>,place:MendesPlace){
  const b=this.dress;b.begin();const levels:[number,number,number][]=[[-3,8,5],[-16,19,10],[-49,15,9],[-74,26,12],[-113,38,18]];
  for(const [y,x,z]of levels)this.ring(b,[0,y,0],[x,0,0],[0,0,z],y===-49?'#d4bd83':'#b39a63',1.1);
  for(let i=0;i<24;i++){const q=i/24*TAU;this.line(b,levels.map(([y,x,z])=>[x*Math.cos(q),y,z*Math.sin(q)]),'#c0a56e',.85,.72);}
  for(const y of [-23,-36,-65,-82,-99]){const width=y>-49?17:y>-75?22:34,depth=y>-49?10:y>-75?12:17;this.line(b,Array.from({length:49},(_,i)=>{const q=i/48*TAU,dy=(i%4<2?1:-1)*2.1;return [width*Math.cos(q),y+dy,depth*Math.sin(q)]as P;}),y%2?'#4e4329':'#e0c88e',1.2,.85,true);}
  b.end();const l=this.limbs;l.begin();
  for(const side of [-1,1]){
   this.tube(l,[side*9,-108,0],[side*11,-143,2],6,4,'#927c53');this.line(l,[[side*11,-143,2],[side*11,-148,15]],'#c0aa7c',4);
   const shoulder:P=[side*18,-15,0],elbow:P=[side*(27+p.gesture*5),-37+p.gesture*8,8];
   const hand:P=side<0?[-29-23*p.gesture,-42+46*p.gesture,22]:place==='stage'?[15,-18,34]:[27+8*p.gesture,-48+16*p.gesture,22];
   this.tube(l,shoulder,elbow,5.2,3.8,'#b69c6d');this.tube(l,elbow,hand,3.8,2.5,'#c5aa78');this.ring(l,hand,[3,0,0],[0,0,3],'#dbc28e',1.1);
   for(let k=0;k<5;k++)this.line(l,[[hand[0]+k-2,hand[1],hand[2]],[hand[0]+(k-2)*1.5,hand[1]-6+k*.5,hand[2]+3]],'#ddc591',.85);
  }l.end();
 }
 private mic(x:number,z:number){
  const b=this.microphone;this.line(b,[[x,0,z],[x,137,z],[x-3,143,z]],'#aaa18a',1.8);this.ring(b,[x,1,z],[19,0,0],[0,0,13],'#8f846c',1.5);this.box(b,[x-3,151,z],10,22,8,'#c5b995');
  for(let y=142;y<161;y+=3)this.line(b,[[x-8,y,z+4],[x+2,y,z+4]],'#746d5b',.75);for(let xx=x-7;xx<x+2;xx+=2)this.line(b,[[xx,141,z+4],[xx,161,z+4]],'#8f8670',.65);
  this.line(b,[[x,126,z],[x+12,80,z],[x+4,35,z],[x+28,0,z+8],[x+70,0,z+20]],'#6d6451',.85,.7);
 }
 private person(b:Beams,x:number,y:number,z:number,o:DecorOptions={}){
  const female=!!o.female,seated=!!o.seated,g=o.gesture??0,phase=o.phase??0,skin='#bca47a',cloth=o.dress??(female?'#a48d59':'#56503a'),hair=o.sergio?'#35291c':female?'#5d3e26':'#493824';
  for(const q of [0,Math.PI/2])this.ring(b,[x,y,z],[9*Math.cos(q),0,9*Math.sin(q)],[0,13,0],skin,1,.82);
  for(let i=0;i<(female?24:15);i++){const a=i/(female?24:15)*TAU,long=female?28:10;this.line(b,[[x+9*Math.cos(a),y+8,z+8*Math.sin(a)],[x+11*Math.cos(a),y-4,z+9*Math.sin(a)],[x+10*Math.cos(a),y-long,z+7*Math.sin(a)]],i%4?hair:'#8c6740',.85);}
  for(const side of [-1,1]){this.line(b,[[x+side*3,y+2,z+9],[x+side*4,y+2,z+9]],'#423824',1.4);this.line(b,[[x+side*3,y+5,z+8],[x+side*5,y+6,z+8]],hair,1);}
  this.line(b,[[x,y+1,z+9],[x+1,y-3,z+11],[x-1,y-3,z+10]],'#8f7653',.85);this.line(b,[[x-3,y-7,z+9],[x,y-8-(o.sergio?1:0),z+10],[x+4,y-6,z+9]],'#6b4931',o.sergio?1.5:1);
  if(o.sergio)this.line(b,[[x-5,y-4,z+9],[x,y-3,z+10],[x+5,y-4,z+9]],'#3b2c1d',2);
  const hip=y-(seated?60:67);this.tube(b,[x,y-18,z],[x,hip,z],female?17:21,female?14:17,cloth);
  if(female){this.tube(b,[x,hip+8,z],[x,y-108,z],16,34,cloth);for(const yy of [y-55,y-72,y-89])this.ring(b,[x,yy,z],[22+(y-yy)*.12,0,0],[0,0,12],'#d0b678',1.1);}
  else{this.line(b,[[x-14,y-20,z+11],[x,y-47,z+13],[x+14,y-20,z+11]],'#c0ae83',1.3);if(o.sergio){this.line(b,[[x-6,y-21,z+13],[x,y-17,z+14],[x,y-25,z+14],[x-6,y-21,z+13],[x+6,y-21,z+13],[x,y-17,z+14],[x,y-25,z+14],[x+6,y-21,z+13]],'#2e291e',1.5);}}
  for(const side of [-1,1]){
   const knee:P=[x+side*12,seated?y-75:y-103,z+(seated?35:0)],foot:P=[x+side*14,4,z+(seated?43:4)];this.tube(b,[x+side*9,hip,z],knee,7,5,cloth);this.tube(b,knee,foot,5,3.5,cloth);this.line(b,[foot,[foot[0],3,foot[2]+12]],'#322b20',3);
   let hand:P=[x+side*28,hip+3,z+15];if(o.sergio)hand=[x+side*(25+g*8),82+(side>0?g*3:-g*3),z+110];else if(o.instrument==='drums')hand=[x+side*25,y-40+g*side*12,z+34];else if(o.instrument)hand=side<0?[x-5,y-35,z+24]:[x+29,y-49+g*4,z+25];else if(female)hand=[x+side*(30+g*13),y-50+g*25,z+18];
   const elbow:P=[x+side*29,y-38,z+9];this.tube(b,[x+side*19,y-22,z],elbow,5.5,4,cloth);this.tube(b,elbow,hand,4,2.6,skin);this.ring(b,hand,[3,0,0],[0,0,3],skin,1);
  }
  if(o.instrument==='guitar'||o.instrument==='bass'){
   const yy=y-52;this.ring(b,[x,yy,z+24],[18,0,0],[0,23,0],'#b78d4d',2);this.ring(b,[x+12,yy+18,z+24],[13,0,0],[0,16,0],'#c19a5b',2);this.ring(b,[x+2,yy+4,z+25],[5,0,0],[0,6,0],'#463723',1.3);this.line(b,[[x+12,yy+20,z+24],[x+58,yy+70,z+24]],'#b28a4f',5);this.line(b,[[x+54,yy+65,z+24],[x+67,yy+79,z+24]],'#d0b071',6);for(let i=0;i<4;i++)this.line(b,[[x-4+i*2,yy-12,z+27],[x+56+i,yy+68,z+27]],'#d2bc85',.65);
  }
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.head.resize(this.width,this.height);this.beams.forEach(b=>b.setResolution(this.width,this.height));}
 /** Desaturate only this head's owned colour buffers, then warm its owned materials. */
 private warmAirway(){
  this.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>;if(!m.geometry)return;const materials=Array.isArray(m.material)?m.material:[m.material];for(const material of materials){const coloured=material as THREE.Material&{color?:THREE.Color};coloured.color?.set('#ddc18e');}
   for(const key of ['instanceColorStart','instanceColorEnd','color']){const a=m.geometry.getAttribute(key);if(!a)continue;const count=key.startsWith('instance')?Math.min(a.count,m.geometry.instanceCount):a.count;for(let i=0;i<count;i++){const y=.2126*a.getX(i)+.7152*a.getY(i)+.0722*a.getZ(i);a.setXYZ(i,y,y,y);}a.needsUpdate=true;}
  });
 }
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const duration=Number.isFinite(this.track.duration)?this.track.duration:155.434,t=Math.max(0,Math.min(duration,Number.isFinite(time)?time:0)),p=mendesPose(t),place=mendesPlace(view,t),c=mendesCamera(view,this.width/this.height,t);
  if(this.epoch!==epoch||this.last!==null&&Math.abs(t-this.last)>.25)this.head.resetMotion();const dt=this.last===null?0:Math.max(0,Math.min(.05,t-this.last));this.epoch=epoch;this.last=t;
  this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();Object.entries(this.rooms).forEach(([key,g])=>g.visible=key===place);
  const colors:Record<MendesPlace,string>={stage:'#292313',piano:'#211b10',singers:'#30301a',jungle:'#34351d',band:'#251e12'},bg=new THREE.Color(colors[place]);this.scene.background=bg;(this.scene.fog as THREE.Fog).color.copy(bg);
  const show=place==='stage'||place==='singers'||place==='jungle';this.singer.visible=show;const sx=place==='singers'?-55:place==='jungle'?-45:0,sz=place==='singers'?30:place==='jungle'?20:35;
  this.singer.position.set(sx,150,sz);this.singer.rotation.set(0,0,p.sway*.45);this.head.scene.rotation.set(p.nod,-Math.PI/2+p.turn,-p.sway*.3);this.buildHair();this.dressBody(p,place);
  this.microphone.group.visible=place==='stage'||place==='singers';this.microphone.begin();if(place==='stage')this.mic(17,72);if(place==='singers'){this.mic(-39,67);this.mic(78,47);}this.microphone.end();
  const d=this.decor;d.begin();
  if(place==='piano'){this.person(d,0,142,-66,{seated:true,sergio:true,gesture:p.keys,dress:'#4b4432'});this.person(d,150,147,-105,{instrument:'guitar',gesture:p.keys,phase:1,dress:'#62563a'});}
  if(place==='band'){
   this.person(d,-65,142,-65,{seated:true,sergio:true,gesture:p.keys,dress:'#3d392c'});this.person(d,105,150,-35,{instrument:'guitar',gesture:p.keys,dress:'#6b5939'});this.person(d,-210,148,-90,{instrument:'bass',gesture:1-p.keys,dress:'#494733'});this.person(d,205,137,-100,{instrument:'drums',gesture:p.keys,dress:'#756344'});
   for(const x of [170,205,240]){this.ring(d,[x,65,-45],[25,0,0],[0,0,20],'#a78e5d',1.5);this.ring(d,[x,68,-45],[25,0,0],[0,12,0],'#b8a06e',1.2);this.line(d,[[x,5,-45],[x,60,-45]],'#827353',1.2);}this.ring(d,[205,112,-70],[38,0,0],[0,0,24],'#c1a66c',1.5);
  }
  if(place==='stage')this.person(d,105,145,-45,{female:true,gesture:.15+.15*p.gesture,phase:2,dress:'#817344'});
  if(place==='singers'||place==='jungle'){this.person(d,65,150,10,{female:true,gesture:.2+p.gesture*.35,phase:1,dress:'#a58c57'});if(place==='jungle')this.person(d,165,143,-105,{instrument:'guitar',gesture:p.keys,dress:'#4f4b31'});}
  d.end();
  const e=this.effects;e.begin();if(show)for(let i=0;i<24;i++){const x=-260+(i*97)%520,y=25+((i*43+t*3)%245),z=-90+(i%6)*29;this.line(e,[[x-1,y,z],[x+1,y+1,z]],i%3?'#c5ac71':'#e0ca94',.85,.28);}if(place==='band')for(const x of [-230,0,230])this.line(e,[[x,330,-170],[x*.7+Math.sin(t*.3)*35,0,70]],'#d1b377',3,.09);e.end();
  this.scene.updateMatrixWorld(true);if(show){const msg=this.track.message(this.track.indexAt(t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);this.warmAirway();}
  const f=this.film;f.begin();const tick=Math.floor(t*8),aspect=this.width/this.height;for(let i=0;i<2;i++){const x=(Math.sin(tick*12.37+i*4.1)*.78)*aspect;f.line([x,-.62,-1.8,x+.003,.62,-1.8],2,'#c8b381',.6,{alpha:.045});}for(let i=0;i<9;i++){const x=Math.sin(tick*3.17+i*8.3)*aspect*.8,y=Math.cos(tick*2.31+i*5.7)*.55;f.line([x,y,-1.8,x+.004,y+.003,-1.8],2,'#d7c08c',.85,{alpha:.07});}f.end();this.film.group.position.copy(this.camera.position);this.film.group.quaternion.copy(this.camera.quaternion);
  this.veil.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.hair.group.removeFromParent();this.head.dispose();this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
