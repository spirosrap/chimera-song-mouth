import * as THREE from 'three';
import {zaraState} from '../../scene/zara-blue-moon.ts';
import type {CameraView} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {VideoFigure,VideoProps,type VideoPoint as P} from './videoProps.ts';
import {bodyPoint} from './profile.ts';

const group=(parent:THREE.Object3D)=>{const g=new THREE.Group();parent.add(g);return g;};
const tau=2*Math.PI;
function translucent(m:THREE.Mesh,alpha:number,additive=false){
  const mat=m.material as THREE.MeshBasicMaterial;
  mat.transparent=true;mat.opacity=alpha;mat.depthWrite=false;
  if(additive)mat.blending=THREE.AdditiveBlending;
  return m;
}
function disc(p:VideoProps,g:THREE.Object3D,r:number,c:string,at:P){
  return p.mesh(g,new THREE.CircleGeometry(r,48),at,c);
}
function kite(p:VideoProps,g:THREE.Object3D,pts:P[],c:string,alpha:number,additive=false){
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));
  geo.setIndex(pts.slice(2).flatMap((_,i)=>[0,i+1,i+2]));
  return translucent(p.mesh(g,geo,[0,0,0],c),alpha,additive);
}
function pennant(p:VideoProps,g:THREE.Object3D,at:P,c:string){
  const flag=kite(p,g,[[0,0,0],[28,4,0],[13,-24,0]],c,.9);
  flag.position.set(...at);return flag;
}
function pickup(p:VideoProps,g:THREE.Group,x:number,z:number){
  const car=group(g);car.position.set(x,0,z);
  p.box(car,175,36,77,'#315753',[0,40,0]);p.box(car,66,37,72,'#344b50',[-45,76,0]);
  p.box(car,52,24,2,'#688e92',[-45,79,37]);p.box(car,170,5,4,'#a3beb9',[0,26,40]);
  for(const s of [-1,1])for(const k of [-1,1]){
    const tire=p.mesh(car,new THREE.CylinderGeometry(22,22,11,16),[s*58,22,k*35],'#161d28');tire.rotation.x=Math.PI/2;
    const hub=disc(p,car,10,'#93a5ae',[s*58,22,k*42]);hub.rotation.y=k<0?Math.PI:0;
  }
  for(const side of [-1,1])p.box(car,10,5,2,'#ff7185',[side*77,49,40]);
  return car;
}
const asphalt='#181e2c',cyan='#58f7e8',pink='#ff64b6',lilac='#ae85ff',gold='#ffcb70';
export class ZaraMoonStage{
  readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(37,16/9,1,4500);
  readonly props=new VideoProps();readonly singer:VideoFigure;
  readonly alley=group(this.scene);readonly lot=group(this.scene);readonly shelter=group(this.scene);
  readonly dream=group(this.scene);readonly tank=group(this.scene);readonly poster=group(this.scene);
  readonly titles=group(this.scene);readonly moon:THREE.Mesh;readonly moonProp:THREE.Mesh;readonly halo:THREE.Group=group(this.scene);readonly wings:THREE.Group[]=[];private haloTexture:THREE.Texture|null=null;
  readonly tail:THREE.Group;readonly fins:THREE.Group;readonly skirt:THREE.Mesh;readonly fish:THREE.Group[]=[];
  readonly sparkles:THREE.InstancedMesh;readonly butterfly:THREE.Group[]=[];private epoch=-1;
  private last=NaN;private aspect=16/9;private w=1280;private h=720;
  constructor(readonly model:VoiceModel,readonly track:TeleTrack){
    const p=this.props;this.scene.fog=new THREE.Fog('#152d3e',700,2400);
    this.singer=new VideoFigure(model,track,p,this.scene,'#c4c3ac','#dabbaa');
    const f=this.singer,origin=bodyPoint(model),scale=model.tract.scale;
    // The head is line art, so hair only frames the face: a fringe above the brows, locks
    // beside the cheeks, and a back mass wider than the skull. No strand crosses the face.
    const hy=(y:number)=>origin(0,y).y;
    const hair=p.ink(f.root);hair.begin();
    const blonde=['#e8cf9d','#f3ddaf','#c7ae83','#d8bd8d'];
    for(let i=0;i<9;i++){
      const u=i/8,x=(u-.5)*13;
      const strand:P[]=[[x*.62,hy(23.4),4.6],[x*.9,hy(21.5)+.6,7.2],[x,hy(18.6)+.5,8.6],[x*1.04,hy(16.4),8.9]];
      p.line(hair,strand,blonde[i%4],i===4?1.5:.95);
    }
    for(const side of [-1,1]){
      for(let i=0;i<9;i++){
        const e=i/8;
        const strand=Array.from({length:10},(_,j):P=>{
          const q=j/9,sway=Math.sin(q*3.1+i*.8)*1.1*q,out=7.2+e*.8+q*(1.4+e*4.4);
          return [side*(out+sway),hy(20.2-q*50)+.4,1.4-q*5.6-e*.6];
        });p.line(hair,strand,blonde[i%4],i%5===0?1.4:.85);
      }
      for(let i=0;i<7;i++){
        const e=i/6;
        const strand=Array.from({length:9},(_,j):P=>{
          const q=j/8,out=1.8+Math.pow(q,.25)*(6.6+e*4.8),sway=Math.sin(q*2.7+i)*.8*q;
          return [side*(out+sway),hy(23-q*54),-4.2-q*2.6-e];
        });p.line(hair,strand,i%3?'#d5b987':'#b99c6c',i%4===0?1.25:.8);
      }
    }
    for(let i=0;i<4;i++){
      const u=i/3-.5,strand:P[]=[[u*6,hy(23),-1],[u*9.5,hy(25.2),.2],[u*13+Math.sin(i*1.7)*2,hy(26.6),1]];
      p.line(hair,strand,i%2?'#fff0c8':'#e8cf9d',1.2);
    }
    hair.end();
    for(const side of [-1,1]){
      const wing=group(f.root);wing.position.set(side*16,-24,-18);this.wings.push(wing);
      const b=p.ink(wing);b.begin();
      translucent(p.oval(wing,[side*35,30,0],[32,42,1],'#b6fff7'),.30,true);
      translucent(p.oval(wing,[side*27,-6,-1],[24,25,1],'#ffb3dd'),.24,true);
      for(let j=0;j<4;j++){
        const t=j/3;
        p.line(b,[[0,0,0],[side*(18+t*22),18+t*30,1],[side*(36+t*16),58+t*12,0]],'#bffff4',.8,true);
        p.line(b,[[0,0,0],[side*(14+t*14),-2-t*8,1],[side*(24+t*16),-22-t*10,0]],'#ffbde2',.7,true);
      }
      b.end();
    }
    this.skirt=p.mesh(f.root,new THREE.CylinderGeometry(20,31,42,20),[0,-91,0],'#3c4a5f');this.skirt.scale.z=.62;
    // A neckline, zip and waistband keep the body from reading as one flat block in close shots.
    const trim=p.ink(f.root);trim.begin();
    p.line(trim,[[-7.4,-7,12.4],[0,-15.4,12.8],[7.4,-7,12.4]],'#39473f',1.5);
    p.line(trim,[[0,-15.4,12.8],[0,-71,12.25]],'#39473f',1.1);
    p.line(trim,[[-18.4,-69,8.6],[0,-72.2,12.3],[18.4,-69,8.6]],'#39473f',1.8);
    trim.end();
    this.tail=group(f.root);this.tail.position.set(0,-67,0);const skin=['#66e2d5','#5abece','#378ead','#8bdcd9'];
    for(let i=0;i<8;i++){
      const m=p.mesh(this.tail,new THREE.CylinderGeometry(18-i*1.65,16.35-i*1.65,10.5,22),[i*i*.27,-i*9,3+i*.9],skin[i%4]);
      m.rotation.z=i*.061;m.scale.z=.69;
    }
    this.fins=group(this.tail);this.fins.position.set(15,-70,10);
    for(const s of [-1,1]){
      const pts:P[]=[[0,0,0],[s*15,-8,1],[s*33,-29,-3],[s*8,-22,-4],[0,-13,0]];
      kite(p,this.fins,pts,'#80fff0',.8);const ink=p.ink(this.fins);ink.begin();p.line(ink,pts,cyan,2,true);ink.end();
    }
    // Dusk service lane: corrugated siding, lit doorway, crates, a chair and a tipped toy.
    p.box(this.alley,720,4,900,'#544f48',[0,-4,-125]);
    p.box(this.alley,205,173,265,'#63706f',[-235,84,-150]);
    for(let i=0;i<25;i++)p.box(this.alley,3,172,2,'#7b8380',[-333+i*8,84,-16]);
    p.box(this.alley,60,107,4,'#364e4f',[-181,54,-13]);p.box(this.alley,49,7,6,'#ffb46d',[-181,119,-8]);
    for(let i=0;i<11;i++)p.box(this.alley,22+i%4*3,17+i%3*9,22,['#9ccc9d','#bda56e','#9c818e'][i%3],[-310+i*20,11,-20-i%2*12]);
    p.box(this.alley,32,5,29,'#c9c7b2',[-116,27,-62]);p.box(this.alley,32,28,5,'#c9c7b2',[-116,41,-75]);
    for(const s of [-1,1])p.tube(this.alley,[-116+s*12,27,-60],[-116+s*14,1,-50],2,'#c9c7b2');
    pickup(p,this.alley,160,-300);p.box(this.alley,1000,116,10,'#53625d',[0,58,-420]);
    // Wet parking bays and the line of illuminated storefront panels reflected in the asphalt.
    p.box(this.lot,1300,4,1300,asphalt,[0,-4,-180]);
    for(let i=-6;i<7;i++)p.box(this.lot,3,.6,190,'#828984',[i*81,0,-185]);
    p.box(this.lot,860,99,42,'#242f37',[0,49,-422]);
    for(let i=0;i<12;i++){
      const x=-340+i*62,c=[gold,cyan,'#dae59f',pink][i%4];
      p.box(this.lot,52,23,3,c,[x,74,-399]);
      p.box(this.lot,27,49,3,'#314d54',[x,32,-399]);
      for(let k=0;k<3;k++)translucent(p.box(this.lot,19+k*8,.4,42+k*24,c,[x+k*3,.65,-278+k*60]),.10);
    }
    // The motel windows carry neon mermaids and fairies, the picture's recurring figures.
    const neon=p.ink(this.lot);neon.begin();
    for(const [cx,cy,r] of [[-216,90,4.6],[32,90,4.4],[156,91,4.8]])p.ring(neon,[cx,cy,-396],[r,0,0],[0,r,0],'#7dfbe6',1.5);
    p.line(neon,[[-216,86,-396],[-216,79,-396],[-209,74,-396],[-202,69,-396]],'#66f8e4',1.7);
    p.line(neon,[[-216,86,-396],[-213,90,-396],[-208,91,-396]],'#66f8e4',1.4);
    p.line(neon,[[-209,74,-396],[-201,77,-396],[-197,83,-396]],'#ff8fd0',1.7);
    p.line(neon,[[-209,74,-396],[-198,72,-396],[-192,70,-396]],'#ff8fd0',1.4);
    p.line(neon,[[32,88,-396],[32,80,-396],[36,72,-396],[39,66,-396]],'#ffd479',1.7);
    for(const s of [-1,1])p.line(neon,[[32,84,-396],[32+s*9,93,-396],[32+s*16,80,-396],[32+s*8,76,-396]],'#ff9fe0',1.3,true);
    p.line(neon,[[32,80,-396],[24,74,-396],[20,71,-396]],'#7dfbe6',1.3);
    p.line(neon,[[32,80,-396],[40,74,-396],[44,71,-396]],'#7dfbe6',1.3);
    neon.end();
    for(const x of [-226,260]){p.tube(this.lot,[x,0,-220],[x,216,-220],2.4,'#485766');p.box(this.lot,32,3,10,'#fdf1b7',[x+11,215,-220]);}
    pickup(p,this.lot,215,-298);
    this.moon=p.oval(this.lot,[-238,158,-360],[54,54,54],'#dceeff');
    this.moonProp=p.mesh(this.lot,new THREE.CircleGeometry(56,64),[0,0,0],'#eaf4ff');this.moonProp.position.set(0,0,40);
    for(let i=0;i<14;i++)translucent(p.oval(this.lot,[Math.sin(i*2.1)*290,1,-90+i*13],[24+i%3*9,.38,6+i%4*3],'#93b6c2'),.18);
    // A cyan bus shelter becomes the frame of the ocean advertisement.
    p.box(this.shelter,220,7,78,'#255770',[0,181,-83]);p.box(this.shelter,213,2.5,5,cyan,[0,178,-47]);
    for(const x of [-103,103])p.tube(this.shelter,[x,0,-87],[x,180,-87],3,'#88abb3');
    p.box(this.shelter,190,5,28,'#7d8e96',[0,41,-93]);p.box(this.shelter,58,149,4,'#8be3ed',[-74,90,-106]);p.box(this.shelter,122,149,4,'#293d50',[22,90,-106]);
    // Dream water, a rolling horizon, moons and a translucent cyan aquarium on a truck bed.
    p.box(this.dream,1700,3,1900,'#5cbac7',[0,-10,-420]);
    for(let i=0;i<22;i++){
      const b=p.ink(this.dream);b.begin();
      p.line(b,Array.from({length:32},(_,j):P=>[-690+j*46,-4+3*Math.cos(.69*j+i),160-i*41+Math.sin(j*.42+i)*7]),i%3? '#8de2e0':'#d0fbeb',1.4);b.end();
    }
    for(let i=0;i<17;i++)p.oval(this.dream,[-580+i*70,120+Math.cos(i)*16,-620],[73,17,6],i%2?'#a7e6e5':'#bceaf1');
    for(let i=0;i<5;i++){
      const fg=group(this.tank);this.fish.push(fg);
      p.oval(fg,[0,0,0],[12,4.6,3],i%2?pink:cyan);kite(p,fg,[[-9,0,0],[-19,5,1],[-18,-6,0]],gold,.9);
    }
    pickup(p,this.tank,0,-96);
    for(const x of [-90,90])for(const z of [-96,30])p.tube(this.tank,[x,48,z],[x,260,z],2,cyan);
    p.box(this.tank,182,2,126,'#57bdc7',[0,48,-33]);
    translucent(p.box(this.tank,182,2,126,'#57bdc7',[0,260,-33]),.45);
    translucent(p.box(this.tank,180,212,1,cyan,[0,154,30]),.075);
    p.box(this.tank,184,220,2,'#0b4b58',[0,154,-42]);
    for(let i=0;i<16;i++){
      const b=translucent(p.mesh(this.tank,new THREE.CircleGeometry(1.6+i%5,16),[0,0,0],'#9fe8e4'),.21);
      b.position.set(-74+i*9.7,54+(i*37)%154,-38);
    }
    // Closing image: a magenta balloon caught beside a chain-link fence and warning plaque.
    p.box(this.poster,800,4,450,'#9b798a',[0,-2,-60]);
    const wire=p.ink(this.poster);wire.begin();
    for(let i=-18;i<=18;i++){
      const x=i*20;for(const s of [-1,1])p.line(wire,[[x,0,-65],[x+s*118,154,-65]],'#708390',1);
    }wire.end();p.box(this.poster,67,23,2,'#dfbc55',[0,45,-62]);
    const flag=pennant(p,this.poster,[0,0,0],pink);flag.position.set(-89,102,-53);
    p.oval(this.poster,[80,158,-60],[16,22,11],pink);p.tube(this.poster,[78,137,-60],[74,96,-60],.7,'#c9a7cc');
    // Star trails animate from source time; no random history is retained on seek.
    const sparkle=new THREE.InstancedMesh(new THREE.OctahedronGeometry(1),new THREE.MeshBasicMaterial({color:'#fff1b6',transparent:true,opacity:.82,depthWrite:false,blending:THREE.AdditiveBlending}),88);
    this.sparkles=sparkle;this.scene.add(sparkle);
    for(let i=0;i<10;i++){
      const g=group(this.scene);this.butterfly.push(g);
      for(const s of [-1,1]){const m=p.oval(g,[s*3,1,0],[3.6,5,1],i%2?pink:cyan);m.rotation.z=-s*.5;}
    }
    // A soft dark vignette behind the line-art head keeps the face readable against bright skies.
    if(typeof document!=='undefined'){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=192;
      const ctx=canvas.getContext('2d')!,grad=ctx.createRadialGradient(96,96,6,96,96,96);
      grad.addColorStop(0,'rgba(4,18,28,.66)');grad.addColorStop(.45,'rgba(4,18,28,.42)');
      grad.addColorStop(.76,'rgba(4,18,28,.14)');grad.addColorStop(1,'rgba(4,18,28,0)');
      ctx.fillStyle=grad;ctx.fillRect(0,0,192,192);this.haloTexture=new THREE.CanvasTexture(canvas);
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.haloTexture,transparent:true,depthWrite:false}));
      sprite.scale.set(108,108,1);this.halo.add(sprite);
    }
    const title=p.ink(this.titles);title.begin();
    // Title intercuts echo the looping title ornament with a crescent and four-point stars.
    const disc=translucent(p.mesh(this.titles,new THREE.CircleGeometry(86,48),[18,96,-8],'#dceeff'),.20,true);
    p.line(title,Array.from({length:80},(_,i):P=>{const a=i/80*tau;return [86*Math.cos(a)+18,96+86*Math.sin(a),-6];}),'#3f8fc4',1.1);
    p.line(title,Array.from({length:60},(_,i):P=>{const a=-1.45+i/59*5.1;return [58*Math.cos(a),106+58*Math.sin(a),0];}),'#8fd0ff',3.2);
    p.line(title,Array.from({length:48},(_,i):P=>{const a=-1.1+i/47*4.2;return [45*Math.cos(a)+20,109+45*Math.sin(a),1];}),'#02060b',5.2);
    for(const [x,y,r] of [[-105,152,12],[82,164,13],[-88,48,9],[112,72,10],[15,32,7]])p.line(title,[[x-r,y,0],[x-1,y+1,0],[x,y+r,0],[x+1,y+1,0],[x+r,y,0],[x+1,y-1,0],[x,y-r,0],[x-1,y-1,0]],'#cdefff',2.2,true);
    title.end();disc.name='title-disc';this.resize(1280,720);this.frame(0,false,0,'wide');
  }
  resize(w:number,h:number){this.w=Math.max(w,1);this.h=Math.max(h,1);this.aspect=this.w/this.h;this.singer.head.resize(this.w,this.h);this.props.resize(this.w,this.h);}
  frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity=0){
    const s=zaraState(view,time),{t,place,pose,look}=s,f=this.singer,night=place!=='alley',sea=place==='surf',fair=look==='fairy',mer=look==='mermaid';
    this.alley.visible=!night;this.lot.visible=['lot','shelter','moon','tank','flight'].includes(place);
    this.moon.visible=night&&place!=='fence'&&place!=='title'&&place!=='black'&&place!=='moon';this.shelter.visible=place==='shelter';this.dream.visible=sea;this.tank.visible=place==='tank';this.poster.visible=place==='fence';this.titles.visible=place==='title';
    this.moonProp.visible=place==='moon';
    this.scene.background=new THREE.Color(sea?'#96daec':place==='fence'?'#b68691':place==='title'||place==='black'?'#02060b':night?'#0b1726':'#48595f');(this.scene.fog as THREE.Fog).color.copy(this.scene.background);
    const beat=t*1.67*tau,sw=Math.sin(beat),walk=pose==='walk',floor=pose==='floor',fly=pose==='hover',close=pose==='portrait';
    f.root.visible=place!=='title'&&place!=='black';
    const x=walk?-45+Math.min(s.local,16)*4:floor?-25:fly?Math.sin(t*.72)*14:mer?Math.sin(t*.8)*10:sw*2;
    const y=floor?134:fly?220+Math.sin(t*1.2)*10:mer?(place==='tank'?185:155):150;
    f.root.position.set(x,y,mer&&place==='tank'?0:52);
    this.moonProp.position.set(x+95,122,12);
    f.root.rotation.set(0,walk?.30:Math.sin(t*.26)*.12,floor?-.05:mer&&pose==='swim'?-.95:sw*.025);
    const coat=fair?'#ea5581':mer?'#93ddcc':'#bcc3a8';
    (f.torso.material as THREE.MeshBasicMaterial).color.set(coat);f.arms.forEach(m=>(m.material as THREE.MeshBasicMaterial).color.set(coat));
    this.skirt.visible=!mer;
    this.wings.forEach((g,i)=>{g.visible=fair;g.rotation.y=(i?-1:1)*(.26+.54*Math.sin(beat*1.5));});
    this.tail.visible=mer;this.tail.rotation.z=(mer?-.95:0)+.16*Math.sin(beat*.45);
    this.fins.rotation.y=.44*Math.sin(beat*.45+.8);[...f.legs,...f.feet].forEach(m=>m.visible=!mer);
    const lift=fly?.95:close?.22:floor?.30:(.5+.5*sw);
    const arms:P[]=[];for(const side of [-1,1]){
      arms.push([side*(27+lift*11),-37+28*lift,5+side*Math.cos(beat)*3],[side*(27+lift*28),-54+67*lift,14+7*Math.cos(beat+side)]);
    }f.pose(t,arms as [P,P,P,P],floor);
    if(floor)for(const [i,side] of [-1,1].entries()){
      this.props.segment(f.legs[i*2],[side*10,-70,0],[side*26,-104,8],7);
      this.props.segment(f.legs[i*2+1],[side*26,-104,8],[side*22,-134,-16],5);
      f.feet[i].position.set(side*22,-134,-16);
    }
    if(walk){for(const [i,side] of [-1,1].entries()){
      const z=sw*side*16,k:P=[side*12,-103+Math.max(z,0)*.35,z],foot:P=[side*14,-146+Math.max(z,0)*.48,z*.7+8];
      this.props.segment(f.legs[i*2],[side*10,-70,0],k,7);this.props.segment(f.legs[i*2+1],k,foot,5);f.feet[i].position.set(...foot);
    }}
    this.fish.forEach((g,i)=>{g.position.set(Math.sin(t*.45+i*1.2)*67,120+i*16+6*Math.sin(t*.8+i),-58+i*12);g.rotation.y=Math.cos(t*.45+i*1.2)>0?0:Math.PI;});
    this.butterfly.forEach((g,i)=>{g.visible=place==='alley'&&t>47||fair;g.position.set(x+Math.sin(t*.72+i*2)*68,y+6+i*5+10*Math.sin(t*1.45+i),23-3*i);g.scale.x=.35+Math.abs(Math.sin(t*5+i));});
    const dust=this.sparkles;dust.visible=fair||mer||place==='moon';
    if(dust.visible){const mat=new THREE.Matrix4();for(let i=0;i<dust.count;i++){const a=i*2.4+t*.92,r=23+i*.82,v=.6+(i%4)*.45;mat.makeScale(v,v,v);mat.setPosition(x+Math.cos(a)*r,y-27+Math.sin(a*1.1)*r,4+Math.sin(i+t*.68)*21);dust.setMatrixAt(i,mat);}dust.instanceMatrix.needsUpdate=true;dust.computeBoundingSphere();}
    f.root.updateMatrixWorld(true);
    const head=f.root.localToWorld(new THREE.Vector3(0,9,0));
    this.halo.visible=close;this.halo.position.set(head.x,head.y,head.z-22);
    const focus:P=place==='title'?[0,106,0]:place==='black'?[0,0,0]:close?[head.x,head.y,head.z]:floor?[head.x,head.y-50,head.z]:[x,fly?y-24:place==='tank'?150:108,f.root.position.z];
    const hh=close?21:floor?80:fly?136:place==='title'?112:place==='tank'?126:148,hw=close?20:floor?70:place==='title'?120:place==='moon'?195:172;
    const d=Math.max(hh,hw/this.aspect)/Math.tan(this.camera.fov*Math.PI/360);
    this.camera.aspect=this.aspect;this.camera.up.set(0,1,0);
    this.camera.position.set(focus[0]+d*(floor?.18:walk?.20:close?.10:.16),focus[1]+d*(floor?.16:pose==='swim'?.20:.055),focus[2]+d*.96);this.camera.lookAt(...focus);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    const reset=epoch!==this.epoch||!Number.isFinite(this.last)||Math.abs(t-this.last)>.24;
    this.scene.updateMatrixWorld(true);if(f.root.visible)f.update(t,playing,this.camera,reset?0:Math.min(.05,Math.max(0,t-this.last)),reset);
    this.epoch=epoch;this.last=t;this.scene.updateMatrixWorld(true);
  }
  dispose(){this.singer.dispose();this.props.dispose();this.sparkles.geometry.dispose();(this.sparkles.material as THREE.Material).dispose();this.sparkles.dispose();this.haloTexture?.dispose();(this.halo.children[0] as THREE.Sprite|undefined)?.material.dispose?.();}
}
