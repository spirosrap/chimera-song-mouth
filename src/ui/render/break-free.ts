import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {freeCamera,freePose,freeSet,type FreePoint as P} from '../../scene/break-free.ts';

type Look='maid'|'frontman'|'dancer';
type Actor={look:Look;root:THREE.Group;head:Anatomy3D;hair:Beams;detail:Beams;limbs:THREE.Mesh[];feet:THREE.Mesh[];top:THREE.Mesh;skirt:THREE.Mesh;straps:THREE.Group};
type Dancer={root:THREE.Group;body:THREE.Mesh;head:THREE.Group;limbs:THREE.Mesh[];index:number};
const TAU=Math.PI*2,skin='#c5a18c',cream='#d2c8a5',brown='#685447',dark='#252b30';

/** Three source looks share the retained physical singer. Props follow source time. */
export class BreakFreeStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(34,4/3,1,7000);
 readonly home=new THREE.Group();readonly kitchen=new THREE.Group();readonly roofs=new THREE.Group();
 readonly crowd=new THREE.Group();readonly ballet=new THREE.Group();readonly cave=new THREE.Group();readonly title=new THREE.Group();
 readonly actors:Actor[]=[];readonly vacuum=new THREE.Group();readonly vacuumHandle=new THREE.Group();readonly vacuumWheels:THREE.Mesh[]=[];
 readonly family:THREE.Group[]=[];readonly audience:THREE.Group[]=[];readonly crowdLights:THREE.Mesh[]=[];readonly dancers:Dancer[]=[];
 readonly sheet=new THREE.Group();readonly boxProp=new THREE.Group();readonly newspaper=new THREE.Group();readonly bars:THREE.Mesh[]=[];
 private beams:Beams[]=[];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private last:number|null=null;private epoch=-1;private veil:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack){
  this.scene.add(this.home,this.kitchen,this.roofs,this.crowd,this.ballet,this.cave,this.title);
  this.buildHome();this.buildKitchen();this.buildRoofs();this.buildVacuum();this.buildCrowd();this.buildBallet();this.buildCave();this.buildTitle();
  for(const look of ['maid','frontman','dancer']as Look[]){
   const root=new THREE.Group(),head=new Anatomy3D(),hair=this.ink(),detail=this.ink(),straps=new THREE.Group();head.centred=true;head.attachAccessory(hair.group);root.add(head.scene,detail.group,straps);this.scene.add(root);
   const moustache=new THREE.Group();moustache.name='freddie-moustache';head.attachAccessory(moustache);const lipShape=model.frame(VoiceModel.articFromArray(track.message(0).t.artic)).upperLip,upper=lipShape[lipShape.length-3];for(const side of [-1,1]){const lip=this.oval(moustache,[upper.x+.4,upper.y+.1,side*1.35],[.65,.55,1.55],'#3b3028');lip.renderOrder=41;const mm=lip.material as THREE.MeshBasicMaterial;mm.depthTest=false;mm.depthWrite=false;}
   const top=this.mesh(root,new THREE.CylinderGeometry(21,18,60,24),[0,-36,0],look==='maid'?'#d6a6b7':skin);top.scale.z=.54;
   const skirt=this.mesh(root,new THREE.CylinderGeometry(20,25,30,24),[0,-75,0],'#25272a');skirt.scale.z=.56;
   const limbs=Array.from({length:8},(_,i)=>this.mesh(root,new THREE.CylinderGeometry(1,1,1,12),[0,0,0],i<4||look==='maid'?skin:'#25292f'));
   const feet=[-1,1].map(s=>this.oval(root,[s*12,-148,9],[4,3,12],look==='dancer'?skin:'#25272b'));
   if(look==='maid'){this.mesh(root,new THREE.TorusGeometry(6,1.6,8,28),[0,-2,0],'#ca7188').rotation.x=Math.PI/2;for(const s of [-1,1]){const e=this.mesh(root,new THREE.TorusGeometry(2.2,.5,8,20),[s*10,8,0],'#d8bc8b');e.rotation.y=Math.PI/2;}}
   for(const s of [-1,1]){const band=this.box(straps,7,65,2,'#d6d6ca',[s*10,-34,13]);band.rotation.z=s*.44;}
   this.actors.push({look,root,head,hair,detail,limbs,feet,top,skirt,straps});
  }
  for(let i=0;i<2;i++){const b=this.box(this.scene,2,2,.01,'#000000',[0,0,0]);b.renderOrder=999;const m=b.material as THREE.MeshBasicMaterial;m.depthTest=false;m.depthWrite=false;this.bars.push(b);}
  this.veil=this.box(this.scene,2,2,.01,'#000000',[0,0,0]);this.veil.renderOrder=1000;const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;
  this.resize(1280,720);this.frame(0,false,0,'free-title',0);
 }
 private mesh(parent:THREE.Object3D,g:THREE.BufferGeometry,p:P,color:string){const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 private box(parent:THREE.Object3D,w:number,h:number,d:number,col:string,p:P){return this.mesh(parent,new THREE.BoxGeometry(w,h,d),p,col);}
 private oval(parent:THREE.Object3D,p:P,s:P,col:string){const m=this.mesh(parent,new THREE.SphereGeometry(1,14,10),p,col);m.scale.set(...s);return m;}
 private plane(parent:THREE.Object3D,w:number,h:number,col:string,p:P){return this.mesh(parent,new THREE.PlaneGeometry(w,h),p,col);}
 private segment(m:THREE.Mesh,a:P,b:P,r:number){const v=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(v);m.position.copy(v).lerp(end,.5);m.scale.set(r,d.length(),r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 private tube(parent:THREE.Object3D,a:P,b:P,r:number,col:string){const m=this.mesh(parent,new THREE.CylinderGeometry(1,1,1,10),[0,0,0],col);this.segment(m,a,b,r);return m;}
 private ink(parent?:THREE.Object3D){const b=new Beams();b.begin();for(const o of b.group.children){const m=(o as THREE.Mesh).material as THREE.Material;m.blending=THREE.NormalBlending;m.depthTest=true;m.depthWrite=false;}parent?.add(b.group);this.beams.push(b);return b;}
 private line(b:Beams,p:P[],col:string,w=1,alpha=.85,close=false){b.line(p.flat(),p.length,col,w,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,col:string,w=1,alpha=.85){this.line(b,Array.from({length:32},(_,i)=>{const q=i/32*TAU;return c.map((n,k)=>n+u[k]*Math.cos(q)+v[k]*Math.sin(q))as P;}),col,w,alpha,true);}
 private face(parent:THREE.Object3D,p:P,hairColor:string){const g=new THREE.Group();g.position.set(...p);parent.add(g);this.oval(g,[0,0,0],[8,11,7],skin);this.oval(g,[0,8,-2],[9,6,7],hairColor);for(const s of [-1,1])this.oval(g,[s*3,2,6.4],[1,.65,.5],'#313331');this.oval(g,[0,-1,7],[1.2,1.8,.7],'#bd9981');this.oval(g,[0,-5,6.6],[2,.6,.4],'#785752');return g;}
 private seated(parent:THREE.Object3D,p:P,style:'granny'|'curlers'|'schoolgirl'){const g=new THREE.Group();g.position.set(...p);parent.add(g);const col=style==='granny'?'#3b4143':style==='curlers'?'#cba3ad':'#e8e0ce';this.mesh(g,new THREE.CylinderGeometry(19,23,59,18),[0,83,0],col).scale.z=.55;const head=this.face(g,[0,127,-4],style==='schoolgirl'?'#c8a96e':'#a9a7a1');
  if(style==='granny'){this.oval(head,[0,14,0],[11,4,10],'#1e262d');this.box(head,26,2,20,'#30383b',[0,11,0]);const b=this.ink(head);for(const s of [-1,1])this.ring(b,[s*4,3,7],[3.5,0,0],[0,2.2,0],'#b6aa8d',.85,.9);b.end();}
  if(style==='curlers')for(let i=0;i<10;i++){const q=i/10*TAU,roll=this.mesh(head,new THREE.CylinderGeometry(2.5,2.5,6,10),[8*Math.sin(q),10+3*Math.cos(q),5*Math.cos(q)],i%2?'#c9a0b1':'#a6b7a0');roll.rotation.z=q;}
  if(style==='schoolgirl'){this.box(g,22,35,5,'#343a3c',[0,84,10]);for(const s of [-1,1]){const pony=this.oval(head,[s*10,-1,-2],[4,9,4],'#c8a96e');pony.rotation.z=s*.2;this.box(head,6,4,2,'#9b6b6d',[s*10,6,2]);}}
  for(const s of [-1,1]){this.tube(g,[s*10,53,0],[s*14,39,31],5,col);this.tube(g,[s*14,39,31],[s*15,3,38],4,style==='schoolgirl'?cream:col);this.oval(g,[s*15,2,45],[5,2.5,11],'#4a4141');this.tube(g,[s*20,104,0],[s*21,76,13],4,col);this.tube(g,[s*21,76,13],[s*10,69,27],3,skin);}
  return g;
 }
 private couch(parent:THREE.Object3D,p:P,w=145){const g=new THREE.Group();g.position.set(...p);parent.add(g);this.box(g,w,33,61,'#6a6656',[0,29,0]);this.box(g,w,56,14,'#817c66',[0,65,-26]);for(const s of [-1,1])this.box(g,14,42,67,'#8e876e',[s*(w/2-3),45,0]);const b=this.ink(g);for(let i=0;i<9;i++)this.line(b,[[-w/2+7,43,-20+i*7],[w/2-7,43,-20+i*7]],'#b5a98a',.85,.5);b.end();return g;}
 private buildHome(){const g=this.home,b=this.ink(g);this.box(g,800,4,650,'#91836c',[0,-3,10]);this.plane(g,800,370,'#c6b99d',[0,177,-170]);this.plane(g,330,370,'#bcb29e',[-380,177,-5]).rotation.y=Math.PI/2;
  for(let x=-380;x<400;x+=25)for(let y=15;y<360;y+=24){const q=x/25+y/24;this.line(b,[[x,y,-168],[x-3,y+5,-168],[x,y+10,-168],[x+3,y+5,-168]],q%3?'#a49f84':'#c9bfa2',.6,.55,true);}
  // The staircase is open to the room, rather than a flat painted backdrop.
  for(let i=0;i<14;i++){const x=5+i*19,y=6+i*13;this.box(g,24,y*2,79,'#79715f',[x,y,-118]);this.box(g,25,3,82,'#c8c1ad',[x,y*2,-116]);this.tube(g,[x,y*2,-73],[x,y*2+69,-73],1.3,'#e1d8bd');}this.tube(g,[2,79,-73],[270,262,-73],2.2,'#d8ceb7');
  this.couch(g,[104,0,-66]);this.couch(g,[-185,0,-72],104);this.family.push(this.seated(g,[104,0,-53],'granny'),this.seated(g,[-180,0,-58],'curlers'),this.seated(g,[-270,0,-32],'schoolgirl'));
  g.add(this.newspaper);this.newspaper.position.set(104,84,-22);this.newspaper.rotation.x=-.4;this.box(this.newspaper,46,32,1,'#d1cbb5',[0,0,0]);const paper=this.ink(this.newspaper);for(let i=0;i<10;i++){this.line(paper,[[-20,10-i*2,1],[-2,10-i*2,1]],'#555b54',.6,.8);this.line(paper,[[2,10-i*2,1],[20,10-i*2,1]],'#555b54',.6,.8);}this.line(paper,[[-20,12,1],[20,12,1]],'#343d39',2,1);paper.end();
  const tv=this.box(g,76,62,47,'#786044',[253,39,-78]);this.plane(g,58,42,'#616d66',[253,43,-53]);for(let i=0;i<6;i++)this.line(b,[[222,32+i*4,-52],[284,32+i*4,-52]],'#8f9b8c',.85,.45);this.tube(g,[249,72,-78],[236,104,-74],.8,'#b8b8a1');this.tube(g,[249,72,-78],[265,99,-74],.8,'#b8b8a1');void tv;
  this.box(g,90,7,56,'#7c654a',[-105,48,45]);for(const s of [-1,1])for(const z of [24,64])this.tube(g,[-105+s*35,0,z],[-105+s*35,48,z],2.2,'#64513f');this.oval(g,[-105,56,44],[11,3,11],'#c8b88f');
  this.tube(g,[-246,0,-130],[-246,182,-130],3,'#604e3d');for(let i=0;i<5;i++){const q=i/5*TAU;this.tube(g,[-246,155,-130],[-246+22*Math.cos(q),174,-130+22*Math.sin(q)],1.5,'#705743');}const coat=this.mesh(g,new THREE.ConeGeometry(14,91,12),[-260,105,-130],'#635a72');coat.scale.z=.5;
  for(const [x,y]of [[-80,223],[184,288]]){this.box(g,59,48,4,'#695b43',[x,y,-165]);this.plane(g,49,38,'#96a193',[x,y,-162]);this.oval(g,[x-8,y-4,-161],[15,4,1],'#7a8e70');}
  this.mesh(g,new THREE.CircleGeometry(13,28),[-150,219,-165],'#d9cfb6');this.line(b,[[-150,219,-163],[-150,228,-163]],'#534d42',1,1);this.line(b,[[-150,219,-163],[-142,217,-163]],'#534d42',1,1);
  for(const [x,y,z]of [[-139,121,-123],[65,114,-124]]){this.tube(g,[x,60,z],[x,y,z],1.2,'#86765a');this.mesh(g,new THREE.CylinderGeometry(10,18,20,24),[x,y+8,z],'#d2bb85');}b.end();
 }
 private buildKitchen(){const g=this.kitchen,b=this.ink(g);this.box(g,740,4,550,'#b3a78c',[0,-3,0]);this.plane(g,740,360,'#bbb69e',[0,177,-172]);for(let i=-3;i<=3;i++){this.box(g,73,96,58,'#b9b79c',[i*75,48,-135]);this.box(g,74,5,62,'#d1cab1',[i*75,98,-133]);this.box(g,15,2,2,'#6b705f',[i*75,78,-104]);}this.plane(g,140,123,'#9dbecc',[-160,211,-169]);this.box(g,7,135,5,'#d8d7bd',[-160,211,-164]);this.box(g,147,7,5,'#d8d7bd',[-160,211,-164]);for(const s of [-1,1])this.box(g,30,140,9,'#c9ccbd',[-160+s*81,211,-163]);this.oval(g,[-160,101,-130],[24,2,16],'#7d8a7e');this.tube(g,[-160,101,-155],[-160,116,-155],1.8,'#afb7ad');this.tube(g,[-160,116,-155],[-160,116,-142],1.8,'#afb7ad');const girl=new THREE.Group();girl.position.set(-160,0,-77);girl.rotation.y=Math.PI;g.add(girl);this.mesh(girl,new THREE.CylinderGeometry(17,16,59,16),[0,116,0],'#ddd9c7').scale.z=.5;this.box(girl,23,35,9,'#343b3a',[0,111,6]);this.mesh(girl,new THREE.CylinderGeometry(17,26,35,18),[0,70,0],'#343b3a').scale.z=.5;const gh=this.face(girl,[0,163,0],'#d0b279');for(const ss of [-1,1]){this.oval(gh,[ss*10,-1,-2],[4,10,4],'#c8a96e');this.box(gh,6,4,3,'#a97576',[ss*10,6,2]);this.tube(girl,[ss*9,54,0],[ss*10,29,0],4.2,skin);this.tube(girl,[ss*10,29,0],[ss*11,3,2],4.1,'#d7d5c1');this.oval(girl,[ss*11,3,8],[4,3,10],'#343c38');this.tube(girl,[ss*18,139,0],[ss*23,112,8],4,'#ddd9c7');this.tube(girl,[ss*23,112,8],[ss*15,101,25],3,skin);}this.family.push(girl);for(let i=-8;i<=8;i++){this.line(b,[[i*35,0,200],[i*35,0,-180]],'#827f70',.85,.5);this.line(b,[[-350,0,i*35],[350,0,i*35]],'#827f70',.85,.5);}b.end();}
 private buildVacuum(){this.scene.add(this.vacuum);const g=this.vacuum,b=this.ink(g);this.box(g,31,10,31,'#676853',[0,8,0]);this.box(g,35,4,10,'#b0ac8b',[0,4,13]);for(const s of [-1,1]){const wheel=this.mesh(g,new THREE.CylinderGeometry(5,5,3,16),[s*16,5,-7],'#3a403a');wheel.rotation.z=Math.PI/2;this.vacuumWheels.push(wheel);}g.add(this.vacuumHandle);const h=this.vacuumHandle;this.tube(h,[0,9,-5],[0,84,-31],1.6,'#b5baaa');this.tube(h,[-8,84,-31],[8,84,-31],2,'#5c6259');const bag=this.mesh(h,new THREE.CapsuleGeometry(9,35,4,12),[0,43,-15],'#936c62');bag.rotation.x=-.3;bag.scale.z=.65;this.line(b,[[0,5,-10],[25,1,-31],[62,1,-10],[113,1,11],[170,1,-13]],'#5a5349',1,.8);b.end();}
 private buildRoofs(){const g=this.roofs,b=this.ink(g);for(let row=0;row<5;row++)for(let j=0;j<9;j++){const x=-520+j*127+(row%2)*24,z=-380+row*140,y=40+row*9;this.box(g,120,100,125,row%2?'#6e594e':'#876b58',[x,y,z]);const roof=this.mesh(g,new THREE.CylinderGeometry(74,74,125,3),[x,y+65,z],'#706b65');roof.rotation.z=Math.PI/2;roof.rotation.y=Math.PI/2;for(let k=0;k<2;k++){this.box(g,17,45,20,'#795d4e',[x-30+k*56,y+110,z-30]);this.mesh(g,new THREE.CylinderGeometry(4,4,13,10),[x-30+k*56,y+138,z-30],'#775b4d');}for(let k=0;k<3;k++){this.plane(g,18,26,'#84948f',[x-35+k*34,y+16,z+63]);this.line(b,[[x-35+k*34,y+3,z+64],[x-35+k*34,y+29,z+64]],cream,.85,.6);}}b.end();}
 private buildCrowd(){const g=this.crowd,b=this.ink(g);this.box(g,1500,5,1500,'#182038',[0,-3,-280]);this.plane(g,1600,700,'#172748',[0,300,-680]);for(let row=0;row<9;row++)for(let j=0;j<11;j++){const p=new THREE.Group(),x=(j-5)*55+(row%2)*22,z=-100-row*59;p.position.set(x,0,z);p.scale.setScalar(.72+(row/8)*.1);g.add(p);this.audience.push(p);this.mesh(p,new THREE.CylinderGeometry(15,20,70,12),[0,88,0],'#202b3e').scale.z=.55;this.oval(p,[0,135,0],[15,17,14],'#25344c');const light=this.plane(p,8,2.4,'#d5d8b5',[0,137,14]);this.crowdLights.push(light);for(const s of [-1,1]){this.tube(p,[s*18,113,0],[s*23,67,5],4,'#253047');this.tube(p,[s*8,54,0],[s*12,0,0],5,'#20293c');}}
  for(const [i,x]of [-100,-56,100].entries()){const person=new THREE.Group();person.position.set(x,0,-45);g.add(person);this.mesh(person,new THREE.CylinderGeometry(20,22,70,16),[0,112,0],i===1?'#899196':'#25303d').scale.z=.55;const h=this.face(person,[0,169,0],i===0?'#aa9d83':i===1?'#34373b':'#cac1a0');if(i===1)for(let j=0;j<18;j++){const q=j/18*TAU;this.oval(h,[Math.cos(q)*9,4+Math.sin(q)*13,-3],[4,5,4],'#37393d');}for(const s of [-1,1]){this.tube(person,[s*11,75,0],[s*14,0,0],6,'#27323f');this.tube(person,[s*22,138,0],[s*29,82,10],4,'#27323f');}}
  const door=this.box(g,85,184,25,'#d7e1d8',[0,112,-590]);door.rotation.z=.03;
  for(const s of [-1,1]){const glow=this.mesh(g,new THREE.ConeGeometry(120,750,20,1,true),[s*250,340,-400],'#779be0');const m=glow.material as THREE.MeshBasicMaterial;m.transparent=true;m.opacity=.055;m.depthWrite=false;glow.rotation.z=s*.55;this.line(b,[[s*380,600,-600],[s*45,25,10]],'#b3cff2',2,.24);}b.end();}
 private buildCave(){const g=this.cave,b=this.ink(g);this.box(g,1000,5,700,'#343932',[0,-3,-20]);for(let i=0;i<22;i++){const x=(i%2?1:-1)*(90+(i%5)*38),y=12+(i%6)*58,z=-80-(i%4)*33;const rock=this.mesh(g,new THREE.IcosahedronGeometry(55+(i%3)*18,1),[x,y,z],i%3?'#3a4237':'#52624c');rock.scale.y=1.7;rock.rotation.set(i*.13,i*.7,i*.2);}this.box(g,90,205,9,'#3f5547',[0,108,-135]);for(let i=0;i<15;i++){const y=25+i*16;this.line(b,[[-70,y,-95],[-105+Math.sin(i)*10,y+50,-92]],'#68816a',1.3,.6);this.line(b,[[70,y,-95],[105+Math.sin(i)*10,y+45,-92]],'#68816a',1.3,.6);}b.end();}
 private buildBallet(){const g=this.ballet;this.box(g,1200,5,1000,'#30343b',[0,-3,0]);this.plane(g,1400,650,'#263954',[0,300,-350]);g.add(this.boxProp,this.sheet);this.box(this.boxProp,140,110,120,'#d9dcc5',[0,55,15]);
  const cloth=this.mesh(this.sheet,new THREE.PlaneGeometry(400,300,20,18),[0,0,0],'#c5cfcc');cloth.rotation.x=-Math.PI/2;cloth.userData.cloth=true;
  for(let i=0;i<13;i++){const root=new THREE.Group(),head=this.face(root,[0,166,0],i%2?'#464c4e':'#796a55');g.add(root);const body=this.mesh(root,new THREE.CylinderGeometry(19,16,65,16),[0,115,0],i%2?'#2b333f':'#d0d0bc');body.scale.z=.5;for(const s of [-1,1]){const band=this.box(root,9,66,2,i%2?'#d1d4c4':'#283441',[s*10,115,11]);band.rotation.z=s*.38;}const limbs=Array.from({length:8},(_,j)=>this.mesh(root,new THREE.CylinderGeometry(1,1,1,10),[0,0,0],j<4?skin:i%2?'#d0cfbc':'#2d3743'));this.dancers.push({root,head,body,limbs,index:i});}
  for(const s of [-1,1]){const light=this.mesh(g,new THREE.ConeGeometry(130,700,20,1,true),[s*220,330,-190],'#b6d0f3');light.rotation.z=s*.48;const m=light.material as THREE.MeshBasicMaterial;m.transparent=true;m.opacity=.045;m.depthWrite=false;}
 }
 private buildTitle(){const b=this.ink(this.title),font:Record<string,string>={Q:'01110/10001/10001/10001/10101/10010/01101',U:'10001/10001/10001/10001/10001/10001/01110',E:'11111/10000/10000/11110/10000/10000/11111',N:'10001/11001/11001/10101/10011/10011/10001',I:'11111/00100/00100/00100/00100/00100/11111',W:'10001/10001/10001/10101/10101/11011/10001',A:'01110/10001/10001/11111/10001/10001/10001',T:'11111/00100/00100/00100/00100/00100/00100',O:'01110/10001/10001/10001/10001/10001/01110',B:'11110/10001/10001/11110/10001/10001/11110',R:'11110/10001/10001/11110/10100/10010/10001',K:'10001/10010/10100/11000/10100/10010/10001',F:'11111/10000/10000/11110/10000/10000/10000'};
  for(const [text,y,size]of [['QUEEN',65,4],['I WANT TO',12,2.1],['BREAK FREE',-15,2.4]]as const)for(const [i,ch]of [...text].entries())for(const [row,line]of(font[ch]?.split('/')??[]).entries())for(const [col,on]of [...line].entries())if(on==='1'){const x=-text.length*size*3+i*size*6+col*size;this.line(b,[[x,y-row*size,0],[x+size*.8,y-row*size,0]],cream,2,1);}
  this.ring(b,[0,38,-4],[109,0,0],[0,68,0],'#bba47f',1,.5);b.end();}
 private hair(a:Actor,time:number){const h=a.hair;h.begin();const bob=a.look==='maid';for(let i=0;i<80;i++){const q=i/80*TAU,front=Math.cos(q)>.3;this.line(h,Array.from({length:19},(_,j)=>{const t=j/18,r=.04+t*(front?1.15:2),tail=bob&&!front?Math.max(0,t-.45)*20:0;return[-1.5+(bob?13.3:11.8)*Math.sin(r)*Math.cos(q),16+12.2*Math.cos(r)-tail,11.5*Math.sin(r)*Math.sin(q)]as P;}),i%5?'#403b35':'#675744',1,.95);}
  // Native head's forward axis is +X before its quarter-turn into the set.
  for(let i=0;i<10;i++){const z=-3.6+i*.8;this.line(h,[[12.2,6,z],[13.6,4.7,z*.95]],'#493a2e',2,1);}h.end();void time;
 }
 private actorMotion(a:Actor,p:ReturnType<typeof freePose>){const maid=a.look==='maid',dance=a.look==='dancer',b=a.detail;this.hair(a,p.t);a.skirt.visible=maid;a.straps.visible=dance&&p.t>=132;(a.top.material as THREE.MeshBasicMaterial).color.set(maid?'#d6a6b7':dance&&p.t>=132?'#313b45':skin);
  b.begin();if(maid){for(let i=-8;i<=8;i++)this.line(b,[[i*1.8,-10,10],[i*2.1,-61,10]],'#e2b9c6',.6,.55);for(let i=0;i<7;i++)this.line(b,[[-21,-64-i*3,12],[21,-64-i*3,12]],'#6e7377',.85,.6);}
  const gest=Math.sin(p.beat*Math.PI)*.5+.5;for(const [j,s]of [-1,1].entries()){
   const elbow:P=maid?[s*29,-36,8]:dance?[s*(31+gest*10),-25+gest*16,14]:[s*34,-35+gest*7,10];
   const hand:P=maid?s>0?[25,-66,9+p.push]:[-27,-67,8]:dance?[s*(49+gest*13),-8+Math.sin(p.dance*.6+s)*25,18]:[s*42,-62+gest*17,22];
   this.segment(a.limbs[j*2],[s*21,-12,0],elbow,5.5);this.segment(a.limbs[j*2+1],elbow,hand,4.2);this.ovalFingerLines(b,hand,s);
   const step=maid?p.walk:Math.sin(p.dance*.8)*.4,knee:P=[s*12,-109,s*step*13],foot:P=[s*14,-148+Math.max(0,s*step)*3,s*step*20];this.segment(a.limbs[4+j*2],[s*10,-67,0],knee,7);this.segment(a.limbs[5+j*2],knee,foot,4.6);a.feet[j].position.set(foot[0],foot[1],foot[2]+7);
  }b.end();
 }
 private ovalFingerLines(b:Beams,hand:P,side:number){for(let i=0;i<5;i++)this.line(b,[[hand[0]+(i-2)*1.25,hand[1],hand[2]],[hand[0]+(i-2)*1.4+side,hand[1]-7+i*.5,hand[2]+2]],skin,1.3,.95);}
 private ensembleMotion(p:ReturnType<typeof freePose>){
  this.vacuum.position.set(p.maid[0]+25,0,p.maid[2]+40+p.push);this.vacuum.rotation.y=.06*Math.sin(p.t*.5);this.vacuumHandle.rotation.x=Math.sin(p.t*1.8)*.04;this.vacuumWheels.forEach(w=>w.rotation.y=p.push*.06);
  this.family.forEach((g,i)=>{g.rotation.z=Math.sin(p.t*.8+i)*.006;});this.newspaper.rotation.set(-.4+Math.sin(p.t*.6)*.025,0,Math.sin(p.t*.3)*.015);
  this.audience.forEach((g,i)=>{g.rotation.z=Math.sin(p.beat*.4+i)*.018;});this.crowdLights.forEach((m,i)=>{(m.material as THREE.MeshBasicMaterial).color.setScalar(.4+.5*(.5+.5*Math.sin(p.t*2.2+i*1.7)));});
  this.boxProp.visible=p.t<132;this.boxProp.position.set(35,0,-2);this.sheet.visible=p.t>=174;
  const cloth=this.sheet.children.find(c=>c.userData.cloth)as THREE.Mesh,vertices=cloth.geometry.getAttribute('position');for(let i=0;i<vertices.count;i++)vertices.setZ(i,Math.sin(vertices.getX(i)*.035+p.t*1.3)*6+Math.cos(vertices.getY(i)*.035-p.t)*5);vertices.needsUpdate=true;this.sheet.position.y=12+Math.sin(p.t*.7)*2;
  this.dancers.forEach(d=>{const i=d.index,q=i/13*TAU,pyramid=p.t>=132&&p.t<151,lift=p.t>=162&&p.t<176;
   d.root.visible=p.t>=132;d.root.position.set(Math.sin(q)*(pyramid?75:lift?92:132),pyramid?(i>9?70:i>5?32:0):0,-35+Math.cos(q)*(pyramid?48:lift?45:85));d.root.rotation.set(0,-q*.18,Math.sin(p.t*.7+i)*.06);d.root.scale.setScalar(.78);
   if(p.t>=176){d.root.position.y=15;d.root.rotation.z=Math.sin(q)*1.05;d.root.rotation.x=Math.cos(q)*.65;}
   for(const [j,s]of [-1,1].entries()){const shoulder:P=[s*19,139,0],elbow:P=lift?[s*30,172,4]:pyramid?[s*27,123,8]:[s*38,123+Math.sin(p.t+i)*17,12],hand:P=lift?[s*37,207,9]:pyramid?[s*38,137,15]:[s*55,151+Math.sin(p.t+i)*30,18];this.segment(d.limbs[j*2],shoulder,elbow,4.7);this.segment(d.limbs[j*2+1],elbow,hand,3.6);const knee:P=[s*(pyramid?26:14),pyramid?43:45,20+Math.sin(p.t*.7+i)*5],foot:P=[s*(pyramid?43:19),3,26];this.segment(d.limbs[4+j*2],[s*10,84,0],knee,6.3);this.segment(d.limbs[5+j*2],knee,foot,4.2);}
  });
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.actors.forEach(a=>a.head.resize(w,h));this.beams.forEach(b=>b.setResolution(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const p=freePose(time),set=freeSet(view,p.t),c=freeCamera(view,this.width/this.height,p.t),reset=epoch!==this.epoch||this.last!==null&&Math.abs(p.t-this.last)>.25,dt=this.last===null?0:Math.min(.05,Math.max(0,p.t-this.last));this.last=p.t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.up.set(...c.up);this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  for(const [name,g]of Object.entries({home:this.home,kitchen:this.kitchen,roofs:this.roofs,crowd:this.crowd,ballet:this.ballet,cave:this.cave,title:this.title}))g.visible=name===set;
  this.scene.background=new THREE.Color(set==='home'?'#8c816b':set==='kitchen'?'#a6ac99':set==='roofs'?'#89999a':set==='title'?'#050708':set==='cave'?'#1d2a25':'#14233c');this.vacuum.visible=set==='home'&&view!=='free-newspaper';this.ensembleMotion(p);
  const msg=this.track.message(this.track.indexAt(p.t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;
  this.actors.forEach(a=>{a.root.visible=a.look==='maid'?set==='home':a.look==='frontman'?set==='crowd':set==='ballet'||set==='cave';a.root.rotation.set(0,0,0);a.root.position.set(...(a.look==='maid'?p.maid:[0,150+Math.sin(p.t*.7)*2,25]as P));
   if(a.look==='dancer'&&set==='ballet'){if(p.t>=132&&p.t<151)a.root.position.y=212+Math.sin(p.t)*2;if(p.t>=162&&p.t<176){a.root.position.set(65,175,8);a.root.rotation.z=-Math.PI/2;}if(p.t>=176){a.root.position.set(65-p.roll*95,66,-10);a.root.rotation.set(.1,0,-Math.PI/2+p.roll*TAU);}}
   a.head.scene.rotation.set(Math.sin(p.t*.7)*.025,-Math.PI/2+p.turn,Math.sin(p.t*.49)*.025);this.actorMotion(a,p);if(reset)a.head.resetMotion();if(a.root.visible){this.scene.updateMatrixWorld(true);a.head.camera.copy(this.camera);a.head.camera.updateMatrixWorld();a.head.face.update(tele,dt);a.head.face.nod=0;a.head.face.tilt=0;a.head.face.lid=Math.exp(-(((p.t%5.8-4.9)/.11)**2));a.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:false,grid:false,calipers:false},dt);}
  });
  const dir=this.camera.getWorldDirection(new THREE.Vector3()),right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),hh=2*Math.tan(this.camera.fov*Math.PI/360)*1.5,ww=hh*this.camera.aspect,band=Math.max(0,(ww-hh*4/3)/2);this.bars.forEach((b,i)=>{b.visible=band>0;b.position.copy(this.camera.position).addScaledVector(dir,1.5).addScaledVector(right,(i?1:-1)*(ww/2-band/2));b.quaternion.copy(this.camera.quaternion);b.scale.set(band/2+.001,hh/2+.01,1);});this.veil.position.copy(this.camera.position).addScaledVector(dir,2);this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.actors.forEach(a=>{a.hair.group.removeFromParent();a.head.dispose();});this.beams.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
