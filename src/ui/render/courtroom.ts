import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import {courtCamera,type CameraView,type CourtCharacterId,type CharacterId} from '../../scene/scene.ts';

type V3=[number,number,number];
/** The room is built in centimetres, around the original CHIMERA airway heads. */
export class Courtroom {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(43,16/9,1,1600);
  readonly actors:{id:CourtCharacterId;head:Anatomy3D;model:VoiceModel;track:TeleTrack;root:THREE.Group;arm:THREE.Group}[]=[];
  private readonly materials=new Map<string,THREE.MeshLambertMaterial>();
  private readonly target=new THREE.Vector3();
  private width=1;private height=1;private epoch=-1;
  constructor(characters:{id:CourtCharacterId;model:VoiceModel;track:TeleTrack}[]){
    this.scene.background=new THREE.Color('#100d0b');
    this.scene.fog=new THREE.Fog('#17110d',230,700);
    this.scene.add(new THREE.AmbientLight('#c7b6a2',1.4));
    const key=new THREE.DirectionalLight('#ffdfb1',2.6);key.position.set(-100,250,140);this.scene.add(key);
    const fill=new THREE.DirectionalLight('#9ec3e6',.7);fill.position.set(150,170,-100);this.scene.add(fill);
    this.room();
    for(const c of characters){
      const root=new THREE.Group();root.name=c.id;root.position.set(c.id==='jessep'?-62:55,122,c.id==='jessep'?-70:5);root.rotation.y=c.id==='jessep'?.15:-2.4;
      this.scene.add(root);
      const head=new Anatomy3D();head.centred=true;head.scene.rotation.y=-Math.PI/2;root.add(head.scene);
      const arm=this.uniform(root,c.id==='jessep');
      this.hair(root,c.id==='jessep');
      this.actors.push({...c,head,root,arm});
    }
    this.resize(1280,720);
    this.pose('wide',true);
  }
  private material(color:string){let m=this.materials.get(color);if(!m){m=new THREE.MeshLambertMaterial({color});this.materials.set(color,m);}return m;}
  private box(parent:THREE.Object3D,size:V3,at:V3,color:string,edge=true){
    const g=new THREE.BoxGeometry(...size),mesh=new THREE.Mesh(g,this.material(color));mesh.position.set(...at);parent.add(mesh);
    if(edge){const lines=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:'#c99864',transparent:true,opacity:.23}));mesh.add(lines);}return mesh;
  }
  private line(parent:THREE.Object3D,points:V3[],color='#b7d7df',opacity=.5){
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(line);return line;
  }
  private cylinder(parent:THREE.Object3D,r1:number,r2:number,h:number,at:V3,color:string){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),this.material(color));m.position.set(...at);parent.add(m);return m;}
  private room(){
    const s=this.scene;
    this.box(s,[440,5,460],[0,-4,25],'#33281f');
    for(let x=-210;x<=210;x+=21)this.line(s,[[x,-1,-190],[x,-1,250]],'#79624a',.18);
    this.box(s,[440,210,7],[0,103,-185],'#9a8060');
    this.box(s,[7,210,460],[-220,103,25],'#75604b');
    this.box(s,[7,210,460],[220,103,25],'#75604b');
    for(let x=-200;x<=200;x+=40){
      this.box(s,[37,74,4],[x,39,-179],'#4e2a1c');
      this.box(s,[3,200,8],[x+20,100,-176],'#5d3b25');
      this.box(s,[28,52,3],[x,148,-178],'#4a3628');
      this.box(s,[22,44,4],[x,148,-175],'#2c2b29');
    }
    this.box(s,[440,5,12],[0,80,-177],'#452b1d');
    // Warm wall sconces provide the visual lighting cues behind the close-ups.
    for(const x of [-145,15,145]){
      this.box(s,[8,5,12],[x,131,-168],'#38291d');
      this.box(s,[10,15,7],[x,143,-167],'#ffce8b',false);
      const bulb=new THREE.PointLight('#ffc787',4000,180,2);bulb.position.set(x,143,-150);s.add(bulb);
    }
    // Raised bench, witness box, papers and a small microphone.
    this.box(s,[165,8,75],[-80,4,-100],'#4b2d1b');
    this.box(s,[104,85,6],[-62,49,-31],'#603922');
    this.box(s,[111,5,68],[-62,94,-62],'#342116');
    for(let x=-106;x<-12;x+=19)this.box(s,[2,67,2],[x,49,-27],'#966746');
    this.box(s,[45,45,7],[-62,111,-91],'#3c2620');
    this.cylinder(s,2,2,16,[-36,103,-54],'#252c2c');
    this.line(s,[[-36,110,-54],[-43,115,-57]],'#b7b4a9',.9);
    this.box(s,[18,.6,12],[-81,97,-46],'#d4c6a3',false);
    this.cylinder(s,3,3,9,[-99,101,-51],'#7b8d8d');
    // Counsel lectern and tables, then rows of public seating.
    this.box(s,[49,5,33],[77,87,32],'#4b2b1d');
    this.box(s,[8,85,15],[77,42,32],'#583621');
    this.box(s,[21,.6,15],[73,90,30],'#e2d8bd',false);
    this.box(s,[120,5,46],[70,65,111],'#3f291d');
    for(const x of [18,122])this.box(s,[5,65,5],[x,31,111],'#4a2a1d');
    for(const z of [156,209])for(const x of [-117,100]){
      this.box(s,[127,5,26],[x,34,z],'#593a26');this.box(s,[127,36,5],[x,53,z+13],'#543321');
      for(const dx of [-53,53])this.box(s,[5,34,20],[x+dx,15,z],'#3c291d');
    }
    this.flag();
    // Court seal: a restrained ring and scales above the witness stand.
    const ring=new THREE.Mesh(new THREE.TorusGeometry(15,1.2,8,40),this.material('#b08b4d'));ring.position.set(-62,153,-169);s.add(ring);
    this.line(s,[[-62,140,-166],[-62,165,-166]],'#dec18a',.9);
    this.line(s,[[-73,158,-166],[-51,158,-166]],'#dec18a',.9);
    for(const x of [-72,-52])this.line(s,[[x,158,-166],[x-5,147,-166],[x+5,147,-166],[x,158,-166]],'#dec18a',.9);
  }
  private flag(){
    const s=this.scene;this.cylinder(s,1,1,176,[-155,88,-149],'#af8a49');
    for(let i=0;i<13;i++)this.box(s,[39,2,1],[-135,165-i*2,-150],i%2?'#d3c5a9':'#7a2d26',false);
    this.box(s,[17,14,1.4],[-146,159,-148.7],'#273951',false);
    for(let y=0;y<4;y++)for(let x=0;x<5;x++)this.box(s,[.8,.8,.5],[-152+x*3,164-y*3,-147.8],'#e3dbbc',false);
  }
  private uniform(root:THREE.Group,marine:boolean):THREE.Group{
    const cloth=marine?'#353c2a':'#111c2b';
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(18,14,43,10),this.material(cloth));torso.position.set(0,-27,0);root.add(torso);
    const wire=new THREE.LineSegments(new THREE.WireframeGeometry(torso.geometry),new THREE.LineBasicMaterial({color:'#8fa6ad',transparent:true,opacity:.2}));torso.add(wire);
    this.box(root,[10,13,2],[0,-12,14],marine?'#a59b79':'#dfd8c3',false);
    this.box(root,[3,22,2.5],[0,-22,16],'#111619',false);
    this.line(root,[[-15,-5,8],[-5,-22,17],[-10,-30,14]],'#bbd6d7',.6);
    this.line(root,[[15,-5,8],[5,-22,17],[10,-30,14]],'#bbd6d7',.6);
    for(const x of [-6,6])for(const y of [-28,-38])this.cylinder(root,.8,.8,2,[x,y,14],'#b79d56').rotation.x=Math.PI/2;
    for(const x of [-17,17])this.box(root,[7,2,9],[x,-6,0],marine?'#9f925f':'#c5b567');
    if(marine)for(let y=0;y<3;y++)for(let x=0;x<4;x++)this.box(root,[2.2,1.2,1],[6+x*2.4,-15-y*1.8,15],['#b66a43','#d0b978','#405e8b','#985b61'][(x+y)%4],false);
    else this.box(root,[9,1,1],[-9,-17,15],'#c9a65c',false);
    // The far arm rests on the stand; the near forearm points as the delivery grows.
    const arm=new THREE.Group();arm.position.set(-19,-8,0);root.add(arm);
    this.cylinder(arm,4.5,3.5,26,[0,-13,0],cloth);
    const fore=new THREE.Group();fore.position.set(0,-26,0);fore.rotation.x=-.65;arm.add(fore);
    this.cylinder(fore,3.4,2.7,21,[0,-10,0],cloth);this.hand(fore,[0,-24,0]);
    this.cylinder(root,4,3,39,[20,-25,0],cloth);this.hand(root,[20,-48,0]);
    for(const x of [-8,8])this.cylinder(root,6,4,68,[x,-84,0],cloth);
    return arm;
  }
  private hand(parent:THREE.Object3D,p:V3){
    const g=new THREE.Group();g.position.set(...p);parent.add(g);
    this.box(g,[5,7,2.5],[0,0,0],'#6d7978',false);
    for(let i=0;i<4;i++)this.line(g,[[i*1.4-2,-2,1],[i*1.4-2,-6-i*.2,2],[i*1.4-2,-8.5,2]],'#b1d3d7',.8);
    this.line(g,[[-2,1,0],[-4,-1,2],[-4.8,-3,3]],'#b1d3d7',.8);
  }
  private hair(root:THREE.Group,marine:boolean){
    // Separate wire strokes provide two readable silhouettes without covering the working mouth.
    const hair=new THREE.Group();hair.rotation.y=-Math.PI/2;root.add(hair);
    for(let i=0;i<24;i++){
      const z=(i/23-.5)*13,top=23-Math.abs(z)*.3;
      if(marine&&Math.abs(z)<3.2)continue;
      this.line(hair,[[-5,16,z],[-6,21,z],[-3,top,z],[2,top-.3,z],[5,19.8,z*.85]],marine?'#8b9390':'#9da3a0',.65);
    }
  }
  resize(w:number,h:number){this.width=w;this.height=h;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.actors.forEach(a=>a.head.resize(w,h));}
  private pose(view:CameraView,snap:boolean){
    const p=courtCamera(view,this.width/this.height);this.camera.fov=p.fov;this.camera.updateProjectionMatrix();
    if(snap)this.camera.position.set(...p.position);else this.camera.position.lerp(new THREE.Vector3(...p.position),.12);
    this.target.set(...p.target);this.camera.lookAt(this.target);this.camera.updateMatrixWorld();
  }
  frame(time:number,playing:boolean,epoch:number,view:CameraView,intensity:number,speaker?:CharacterId){
    const seek=epoch!==this.epoch;this.epoch=epoch;this.pose(view,true);this.scene.updateMatrixWorld(true);
    for(const actor of this.actors){
      const message=actor.track.message(actor.track.indexAt(time));
      const tele=playing?message:null;
      if(seek)actor.head.resetMotion();
      actor.head.face.update(tele,1/30);
      actor.head.camera.copy(this.camera);actor.head.camera.updateMatrixWorld();
      const artic=VoiceModel.articFromArray(message.t.artic);
      actor.head.update(actor.model,actor.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},1/30);
      const active=playing&&actor.id===speaker;
      actor.arm.rotation.x=active?-.15-intensity*.45:0;
      actor.arm.rotation.z=active?Math.sin(time*1.8)*.08+intensity*.2:0;
    }
  }
  dispose(){
    for(const a of this.actors){a.root.remove(a.head.scene);a.head.dispose();}
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
    this.scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.materials.clear();
  }
}
