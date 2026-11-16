import * as THREE from 'three';
import {VideoProps,VideoFigure,type VideoPoint as P} from './videoProps.ts';
import type {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {bodyPoint} from './profile.ts';
import {voltagePose,voltagePlace,voltageResolve,voltageCamera,type VoltagePlace} from '../../scene/voltage.ts';
export type VoltageId='voltage-man'|'voltage-woman';
type Person={id:VoltageId;model:VoiceModel;track:TeleTrack};
type Actor={figure:VideoFigure;id:VoltageId;place:VoltagePlace;look:'tweed'|'dance'|'woman'|'hunt'|'sax';pos:P;glows:THREE.Mesh[];halos:THREE.Mesh[];sax?:THREE.Group;gun?:THREE.Group;};
const gold='#bca36c',cream='#d1c9af',wood='#3b3028',green='#34443a',skin='#cfb6a1',red='#7d3035';
/** Eight clothed graphics borrow two retained physical singers in the supplied surreal film. */
export class VoltageStage{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(35,1856/1080,1,8000);
 readonly props=new VideoProps();readonly rooms={salon:new THREE.Group(),ride:new THREE.Group(),sax:new THREE.Group()};
 readonly actors:Actor[]=[];readonly flames:THREE.Mesh[]=[];readonly mounts:THREE.Group[]=[];readonly foregroundFire=new THREE.Group();
 private width=1280;private height=720;private last:number|null=null;private epoch=-1;private veil:THREE.Mesh;
 constructor(readonly people:Person[]){
  Object.values(this.rooms).forEach(g=>this.scene.add(g));this.salon();this.hunt();this.recital();
  const cast:[VoltageId,VoltagePlace,Actor['look'],P][]=[
   ['voltage-man','salon','tweed',[-94,143,43]],['voltage-woman','salon','woman',[93,144,39]],
   ['voltage-man','salon','dance',[35,158,112]],['voltage-woman','salon','dance',[-37,157,118]],
   ['voltage-man','ride','hunt',[26,201,18]],['voltage-woman','ride','hunt',[-28,195,-24]],
   ['voltage-man','sax','sax',[40,174,-7]],['voltage-woman','sax','sax',[-66,118,60]],
  ];
  for(const [id,place,look,pos]of cast){const person=people.find(p=>p.id===id)??people[0],female=id==='voltage-woman',f=new VideoFigure(person.model,person.track,this.props,this.rooms[place],female?'#292c29':look==='tweed'||look==='hunt'?'#9a9b80':look==='sax'?'#783e38':'#242a28',skin);f.root.position.set(...pos);f.head.scene.scale.setScalar(1.95);const a:Actor={figure:f,id,place,look,pos,glows:[],halos:[]};this.costume(a);this.actors.push(a);}
  this.veil=this.props.box(this.scene,2,2,.01,'#000000',[0,0,0]);this.veil.renderOrder=1000;const m=this.veil.material as THREE.MeshBasicMaterial;m.transparent=true;m.depthTest=false;m.depthWrite=false;
  this.resize(1280,720);this.frame(0,false,0,'volt-gallery',0);
 }
 private framePicture(g:THREE.Object3D,x:number,y:number,w:number,h:number,kind:number){
  const p=this.props,z=-182;p.box(g,w+9,h+9,6,gold,[x,y,z]);p.box(g,w,h,3,kind%2?'#303e32':'#3e4337',[x,y,z+4]);
  const b=p.ink(g);for(const k of [-1,1])p.line(b,[[x+k*w/2,y-h/2,z+6],[x+k*w/2,y+h/2,z+6]],'#c7b88d',1.1);
  const face=(cx:number,cy:number,r:number,eyePatch=false)=>{p.ring(b,[cx,cy,z+7],[r*.65,0,0],[0,r,0],'#a4ad82',2.6);p.line(b,[[cx-r*.45,cy+r*.13,z+7],[cx-r*.15,cy+r*.13,z+7]],'#1b2926',2.2);p.line(b,[[cx+r*.14,cy+r*.13,z+7],[cx+r*.45,cy+r*.13,z+7]],'#1b2926',2.2);p.line(b,[[cx-r*.25,cy-r*.5,z+7],[cx+r*.27,cy-r*.52,z+7]],'#858b66',1.7);if(eyePatch)p.line(b,[[cx-r*.6,cy+r*.8,z+7],[cx+r*.6,cy-r*.05,z+7]],'#101d19',5);};
  if(kind===0){for(const d of [-1,1]){face(x+d*w*.16,y+h*.18,h*.16);p.line(b,[[x+d*w*.16,y+h*.02,z+7],[x+d*w*.28,y-h*.27,z+7],[x+d*w*.05,y-h*.38,z+7]],'#838f68',4);}p.line(b,[[x-w*.42,y-h*.2,z+7],[x-w*.2,y-h*.1,z+7],[x+w*.28,y-h*.26,z+7],[x+w*.39,y-h*.01,z+7]],'#697853',4);}
  else if(kind===1){face(x,y+h*.12,h*.22);p.line(b,[[x-w*.29,y-h*.48,z+7],[x-w*.23,y-h*.14,z+7],[x+w*.23,y-h*.14,z+7],[x+w*.3,y-h*.48,z+7]],'#6d785d',4);}
  else if(kind===2){face(x,y+h*.04,h*.31,true);p.line(b,[[x-w*.3,y-h*.4,z+7],[x,y-h*.49,z+7],[x+w*.3,y-h*.4,z+7]],'#171f1c',3);}
  else{p.line(b,[[x-w*.43,y-h*.1,z+7],[x-w*.14,y+h*.22,z+7],[x+w*.28,y+h*.1,z+7],[x+w*.4,y-h*.25,z+7]],'#a6a180',3);}
  b.end();
 }
 private gallery(g:THREE.Object3D){const p=this.props,b=p.ink(g);p.box(g,1050,5,1050,'#282b24',[0,-3,0]);p.box(g,1050,430,8,green,[0,205,-194]);
  for(let i=-18;i<=18;i++)for(let j=0;j<13;j++){const x=i*26,y=j*31+10;p.ring(b,[x,y,-188],[7,0,0],[0,11,0],'#53604a',.65);p.line(b,[[x-10,y-6,-188],[x,y+10,-188],[x+10,y-6,-188]],'#596149',.6);}
  p.box(g,1050,64,10,'#352d25',[0,29,-185]);for(let i=-15;i<=15;i++){p.box(g,2,61,4,'#716047',[i*33,30,-177]);p.line(b,[[i*33,0,200],[i*33,0,-178]],'#4d4938',.8);}p.box(g,1050,6,12,gold,[0,65,-179]);
  for(const [x,y,w,h,k]of [[-8,230,170,116,0],[-242,190,64,89,1],[239,216,63,84,2],[-151,296,73,44,3],[139,304,77,52,3],[-158,150,49,57,2],[143,155,63,41,3],[-332,275,80,73,0],[338,113,64,72,3]])this.framePicture(g,x,y,w,h,k);b.end();
 }
 private fireplace(g:THREE.Object3D,foreground=false){const p=this.props,b=p.ink(g),z=foreground?265:-140;const fire=new THREE.Group();g.add(fire);fire.position.set(0,0,z);
  if(foreground){g.remove(fire);g.add(this.foregroundFire);this.foregroundFire.add(fire);for(let i=0;i<24;i++){const m=p.mesh(fire,new THREE.ConeGeometry(11,1,5),[-190+i*17,20,0],i%3?'#dfaf61':'#eee1a7'),mat=m.material as THREE.MeshBasicMaterial;mat.transparent=true;mat.opacity=.7;mat.depthWrite=false;m.userData={i,foreground};this.flames.push(m);}b.end();return;}
  p.box(fire,133,12,35,'#92794d',[0,111,0]);for(const s of [-1,1])p.box(fire,16,108,30,gold,[s*58,53,0]);p.box(fire,103,102,3,'#131a17',[0,52,-12]);p.box(fire,136,7,54,'#5a5140',[0,2,11]);for(let i=-3;i<=3;i++)p.tube(fire,[i*12,6,24],[i*12,32,24],1.3,'#555548');
  for(let i=0;i<28;i++){const m=p.mesh(fire,new THREE.ConeGeometry(7,1,5),[-48+i%9*12,25,-3+(i%3)*5],i%3?'#dfaf61':'#eee1a7'),mat=m.material as THREE.MeshBasicMaterial;mat.transparent=true;mat.opacity=.72;mat.depthWrite=false;m.userData={i,foreground};this.flames.push(m);}for(const side of [-1,1])p.tube(fire,[side*44,14,22],[side*44,90,15],1.5,'#bda66a');
  if(!foreground){p.ring(b,[0,76,-102],[62,0,0],[0,74,0],'#b4a078',1.5);for(const x of [-142,142])this.poodle(g,x,-73);b.end();}
 }
 private poodle(g:THREE.Object3D,x:number,z:number){const p=this.props,c='#963c3b';p.oval(g,[x,32,z],[12,22,11],c);p.oval(g,[x+4,63,z],[12,13,11],c);p.oval(g,[x+15,65,z+3],[14,7,8],c);for(const side of [-1,1]){p.oval(g,[x+side*9,54,z],[6,14,7],c);p.tube(g,[x+side*7,0,z+2],[x+side*7,24,z+2],3.5,c);}p.tube(g,[x-10,36,z-5],[x-17,52,z-7],3,c);}
 private chair(g:THREE.Object3D,x:number,z:number){const p=this.props,b=p.ink(g);p.box(g,76,17,68,'#303b2f',[x,65,z]);p.oval(g,[x,91,z-24],[45,69,17],'#26372e');for(const s of [-1,1]){p.tube(g,[x+s*38,0,z+23],[x+s*39,80,z+23],3.4,wood);p.tube(g,[x+s*39,80,z+23],[x+s*36,79,z-26],5,wood);p.tube(g,[x+s*32,7,z-28],[x+s*32,129,z-28],3,wood);p.ring(b,[x+s*39,74,z+23],[5,0,0],[0,7,0],gold,1.3);}for(let j=0;j<18;j++){const q=j/18*Math.PI*2;p.oval(g,[x+Math.cos(q)*40,91+Math.sin(q)*65,z-7],[1.4,1.4,1.3],gold);}b.end();}
 private salon(){const g=this.rooms.salon,p=this.props;this.gallery(g);this.fireplace(g);this.chair(g,-94,23);this.chair(g,93,19);for(const x of [-183,181]){p.box(g,56,5,53,wood,[x,66,-49]);for(const s of [-1,1])p.tube(g,[x+s*22,0,-30],[x+s*22,64,-30],2,wood);}p.tube(g,[-184,67,-49],[-184,150,-49],2,gold);p.mesh(g,new THREE.CylinderGeometry(29,38,35,32),[-184,155,-49],'#cbc8a3');p.oval(g,[182,88,-46],[7,20,7],'#66744d');for(let i=0;i<7;i++)p.oval(g,[182+Math.sin(i*2.4)*11,112+Math.cos(i)*8,-46],[7,7,7],red);
  const gram=new THREE.Group();g.add(gram);gram.position.set(177,76,-61);p.box(gram,37,6,30,wood,[0,0,0]);const horn=p.mesh(gram,new THREE.ConeGeometry(23,35,24,1,true),[0,28,0],gold);horn.rotation.z=-.85;p.oval(gram,[0,6,0],[15,1,13],'#1d2923');
 }
 private mount(g:THREE.Object3D,moose:boolean){const p=this.props,m=new THREE.Group();g.add(m);this.mounts.push(m);const c=moose?'#7e8066':'#a8a88b';p.oval(m,[0,94,0],[76,35,30],c);p.oval(m,[73,130,0],[18,49,20],c);p.oval(m,[87,154,0],[29,19,17],c);for(const s of [-1,1])for(const x of [-48,48])p.tube(m,[x,77,s*18],[x+8,8,s*24],7,c);for(const s of [-1,1]){p.oval(m,[73,180,s*15],[6,14,5],c);p.oval(m,[102,160,s*14],[2,2,1],'#222a23');}p.tube(m,[-70,103,0],[-94,60,0],4,c);p.box(m,81,7,64,'#6b4634',[-8,127,0]);
  if(moose){const b=p.ink(m);for(const s of [-1,1]){p.line(b,[[70,175,s*12],[60,212,s*27],[43,237,s*49]],'#8f967a',4);for(let i=0;i<5;i++)p.line(b,[[61-i*4,210+i*5,s*(26+i*5)],[76-i*9,228+i*7,s*(29+i*6)]],'#969d80',2.9);}b.end();}return m;
 }
 private curtains(g:THREE.Object3D){const p=this.props;for(const s of [-1,1])for(let j=0;j<12;j++){const m=p.oval(g,[s*(85+j*19),218,-100-j*2],[23,228,15],j%2?'#6e3035':'#452c2d');m.rotation.z=-s*.25;}for(let j=0;j<16;j++)p.oval(g,[-230+j*31,367-Math.sin(j/15*Math.PI)*47,-107],[25,47,15],j%2?'#542a30':'#7c393b');}
 private hunt(){const g=this.rooms.ride;this.gallery(g);this.curtains(g);this.mount(g,true);}
 private recital(){const g=this.rooms.sax,p=this.props;this.gallery(g);this.curtains(g);this.mount(g,false);p.box(g,144,14,68,'#29342c',[-66,37,51]);p.oval(g,[-66,76,12],[77,37,15],'#29392e');for(const s of [-1,1]){p.oval(g,[-66+s*69,56,49],[9,10,38],'#29392e');p.tube(g,[-66+s*59,0,68],[-66+s*59,35,68],3,wood);}this.fireplace(g,true);}
 private costume(a:Actor){
  const p=this.props,f=a.figure,woman=a.id==='voltage-woman',k=f.model.tract.scale,B=bodyPoint(f.model),hair=f.hair;hair.begin();
  for(let i=0;i<(woman?135:76);i++){const q=i*2.4,r=(i%29)/29,c=B(-3+Math.cos(q)*8,23-r*(woman?23:9)),z=(i%2?-1:1)*(7+r*(woman?4:1))*k;p.line(hair,Array.from({length:woman?8:4},(_,j)=>[c.x+Math.sin(q+j*.45)*.6*k,c.y-j*(woman?1.1:.5)*k,z+Math.sin(j+q)*.4*k]as P),woman?i%3?'#b7b18b':'#ddd2a2':i%3?'#26372d':'#5d6854',woman?1.8:1.4);}hair.end();
  const b=p.ink(f.ornaments);if(woman){const eye=B(10,11);for(const s of [-1,1])p.ring(b,[eye.x+.8*k,eye.y,s*4.3*k],[0,0,3.9*k],[0,3.1*k,0],'#b0a776',2.2);p.line(b,[[eye.x+.9*k,eye.y,-.6*k],[eye.x+.9*k,eye.y,.6*k]],gold,1.3);p.line(b,[[eye.x,eye.y,-8*k],[-3*k,eye.y,-8.1*k]],'#8e916b',1.7);p.line(b,[[eye.x,eye.y,8*k],[-3*k,eye.y,8.1*k]],'#8e916b',1.7);for(const s of [-1,1])p.ring(b,[-1*k,5*k,s*8*k],[.6*k,0,0],[0,1.7*k,0],gold,1.2);
   f.torso.visible=false;p.oval(f.root,[0,-45,0],[19,28,11],skin);for(const s of [-1,1])p.oval(f.root,[s*10,-26,12],[11,10,5],'#292f29');p.oval(f.root,[0,-72,0],[20,13,12],'#222e26');for(const m of f.arms)(m.material as THREE.MeshBasicMaterial).color.set(skin);for(const m of f.legs)(m.material as THREE.MeshBasicMaterial).color.set('#464d3e');for(const side of [-1,1])p.tube(f.root,[side*10,-12,10],[side*12,-28,12],1.2,'#28342b');p.mesh(f.root,new THREE.CylinderGeometry(7,7,5,18),[0,-3,0],'#333b32');
  }else{const e=B(9,5);p.line(b,[[e.x,e.y,-3.5*k],[e.x+1.2*k,e.y+.25*k,0],[e.x,e.y,3.5*k]],'#394035',1.6);p.box(f.root,17,55,4,cream,[0,-31,12]);for(const s of [-1,1])p.tube(f.root,[s*7,-4,15],[0,-22,16],2,cream);for(let i=0;i<4;i++)p.oval(f.root,[8,-32-i*10,15],[1.3,1.3,1],gold);
   const ribbon=p.mesh(f.root,new THREE.ConeGeometry(9,38,4),[0,-21,17],a.look==='dance'?red:a.look==='sax'?'#a5a579':'#81765a');ribbon.rotation.z=.13;for(const s of [-1,1])p.oval(f.root,[s*6,-9,16],[7,4,3],a.look==='dance'?red:'#7c7657');if(a.look==='sax')for(const side of [-1,1]){p.oval(f.root,[side*24,-11,-2],[10,5,10],gold);for(let i=0;i<6;i++)p.tube(f.root,[side*4,-20-i*7,17],[side*18,-18-i*7,14],1.2,gold);for(const m of f.legs)(m.material as THREE.MeshBasicMaterial).color.set(cream);}
  }b.end();
  const seams=f.costume;seams.begin();for(const side of [-1,1])p.line(seams,[[side*20,-10,8],[side*13,-52,13],[side*22,-70,8]],woman?'#817b59':a.look==='tweed'||a.look==='hunt'?'#b8b89c':gold,1.1);if(!woman&&a.look==='tweed')for(let y=-61;y<-8;y+=5)for(const s of [-1,1])p.line(seams,[[s*11,y,13],[s*19,y+3,11]],'#747e68',.6);seams.end();
  const locations:P[]=woman?[[-10,-26,17],[10,-26,17]]:[[0,-73,16]];for(const pos of locations){const bulb=p.oval(f.root,pos,woman?[6,6,3]:[9,11,4],'#e8e2ab'),halo=p.mesh(f.root,new THREE.CircleGeometry(woman?17:23,24),[pos[0],pos[1],pos[2]+1],'#e4dc93');const m=halo.material as THREE.MeshBasicMaterial;m.transparent=true;m.opacity=0;m.depthWrite=false;a.glows.push(bulb);a.halos.push(halo);}
  if(a.look==='hunt'){const hat=new THREE.Group();f.ornaments.add(hat);p.mesh(hat,new THREE.CylinderGeometry(13*k,13*k,1*k,26),[0,26*k,0],'#aaa98b');p.mesh(hat,new THREE.CylinderGeometry(7.5*k,10*k,8*k,24),[0,29.5*k,0],'#979c7e');p.mesh(hat,new THREE.CylinderGeometry(10.1*k,10.1*k,2*k,24),[0,26.8*k,0],'#5e644c');if(!woman){a.gun=new THREE.Group();f.root.add(a.gun);for(const s of [-1,1])p.tube(a.gun,[-30,-28,38],[46,-21,37+s*2],1.2,'#626d63');p.box(a.gun,24,7,6,wood,[-30,-28,38]);}}
  if(a.look==='sax'&&woman){const sax=new THREE.Group();f.root.add(sax);a.sax=sax;p.tube(sax,[5,-7,23],[-8,-47,30],3,gold);p.tube(sax,[-8,-47,30],[-7,-66,35],3.2,gold);p.tube(sax,[-7,-66,35],[12,-67,39],4,gold);const bell=p.mesh(sax,new THREE.ConeGeometry(13,25,24,1,true),[13,-55,39],gold);bell.rotation.z=.22;for(let i=0;i<9;i++)p.oval(sax,[-4+i*.8,-22-i*3.6,33],[2,1,1.8],'#d8cba0');}
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;this.props.resize(w,h);this.actors.forEach(a=>a.figure.head.resize(w,h));}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const p=voltagePose(time),v=voltageResolve(view,p.t),place=voltagePlace(v,p.t),c=voltageCamera(v,this.width/this.height,p.t),reset=epoch!==this.epoch||this.last!==null&&Math.abs(p.t-this.last)>.25,dt=this.last===null?0:Math.max(0,Math.min(.05,p.t-this.last));this.last=p.t;this.epoch=epoch;
  this.camera.fov=c.fov;this.camera.up.set(...c.up);this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.scene.background=new THREE.Color('#15231d');Object.entries(this.rooms).forEach(([key,g])=>g.visible=key===place);
  this.foregroundFire.visible=v==='volt-sax-fire';this.mounts.forEach((m,i)=>{m.position.y=i===0?p.ride:0;m.rotation.z=i===0?Math.sin(p.beat*Math.PI)*.018:0;});
  for(const flame of this.flames){const i=flame.userData.i as number,h=20+13*Math.sin(p.t*9+i*2.4)+9*Math.sin(p.t*15+i);flame.scale.set(1,h,1);flame.position.y=10+h*.5;flame.rotation.z=Math.sin(p.t*5+i)*.2;}
  const danceView=['volt-dance','volt-duet','volt-embrace'].includes(v),gallery=['volt-gallery','volt-horse-painting','volt-girl-painting','volt-eye-painting','volt-fire','volt-finale'].includes(v);
  for(const a of this.actors){const f=a.figure,woman=a.id==='voltage-woman',s=woman?-1:1,seated=a.look==='tweed'||a.look==='woman'||a.look==='hunt'||woman&&a.look==='sax';
   f.root.visible=a.place===place&&!gallery&&(a.place!=='salon'||(a.look==='dance')===danceView);f.root.position.set(...a.pos);f.root.rotation.set(0,0,0);
   let hands:[P,P,P,P];
   if(a.look==='dance'){f.root.position.x=s*(35-p.embrace*18)+p.sway*3;f.root.rotation.y=-s*p.embrace*.55;f.root.rotation.z=s*p.nod;hands=[[-27,-22,6],p.left,[27,-20,6],p.right];if(p.embrace>.5)hands=woman?[[-25,-24,24],[-16,-18,34],[25,-22,24],[24,-18,34]]:[[-28,-20,19],[-35,-12,41],[27,-21,18],[0,-4,40]];}
   else if(a.look==='hunt'){f.root.position.y+=p.ride;f.root.rotation.z=Math.sin(p.beat*Math.PI)*.018;hands=woman?[[-28,-28,20],[-31,12+Math.sin(p.t*2)*12,27],[28,-30,20],[36,-39,28]]:[[-28,-30,20],[-32,-27,38],[30,-27,20],[38,-23,38]];}
   else if(woman&&a.look==='sax')hands=[[-25,-26,18],[-8,-29,32],[28,-33,19],[-4,-49,33]];
   else if(a.look==='sax')hands=[[-29,-26,7],[-40,-49+p.sway*8,12],[30,-28,8],[39,-40-p.sway*11,13]];
   else if(woman)hands=[[-30,-35,6],[-45,24+Math.sin(p.t*1.6)*12,17],[30,-39,8],[34,-48,23]];
   else hands=[[-33,-44,5],[-37,-67,27],[33,-44,5],[38,-67,26]];
   f.pose(p.t,hands,seated);if(seated){for(const [j,side]of [-1,1].entries()){const knee:P=[side*25,-64,40],foot:P=[side*31,-f.root.position.y+(a.look==='hunt'?58:8),49];this.props.segment(f.legs[j*2],[side*10,-70,0],knee,7);this.props.segment(f.legs[j*2+1],knee,foot,5);f.feet[j].position.set(...foot);}}
   const light=p.lit*(.3+.7*p.pulse);a.glows.forEach(m=>{(m.material as THREE.MeshBasicMaterial).color.set(light>.2?'#eee4a3':'#696d50');m.visible=light>.01;});a.halos.forEach(m=>(m.material as THREE.Material).opacity=light*.18);
   if(reset)f.head.resetMotion();if(f.root.visible){this.scene.updateMatrixWorld(true);f.update(p.t,playing,this.camera,dt,reset);}
  }
  const dir=this.camera.getWorldDirection(new THREE.Vector3());this.veil.position.copy(this.camera.position).addScaledVector(dir,2);this.veil.quaternion.copy(this.camera.quaternion);this.veil.scale.set(10,10,1);(this.veil.material as THREE.MeshBasicMaterial).opacity=1-p.fade;this.scene.updateMatrixWorld(true);
 }
 dispose(){this.actors.forEach(a=>a.figure.dispose());this.props.dispose();}
}
