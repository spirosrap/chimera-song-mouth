import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId,CoreCharacterId} from '../../scene/scene.ts';
import {CORE_MODULES,HAL_EYE,astronautPose,coreCamera,corePower,modulePosition,moduleTravel,type CoreView,type Point3} from '../../scene/core.ts';

const RED=new THREE.Color('#ff3a1a'),EMBER=new THREE.Color('#2a0503'),GLASS=new THREE.Color('#ffd9cf');
/**
 * HAL's memory core, in centimetres. One colour, one light source: the eye. The room has no light
 * of its own, so each module that leaves the wall takes some of the picture with it.
 */
export class MemoryCore {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(45,16/9,1,1400);
  readonly actors:{id:CoreCharacterId;head:Anatomy3D;model:VoiceModel;track:TeleTrack;root:THREE.Group}[]=[];
  readonly modules:THREE.Mesh<THREE.BoxGeometry,THREE.MeshBasicMaterial>[]=[];
  private readonly materials=new Map<string,THREE.MeshLambertMaterial>();
  private readonly ambient=new THREE.AmbientLight('#ff5038',1);
  private readonly eyeLight=new THREE.PointLight('#ff3a1c',1,520,1.6);
  private readonly lens=new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false});
  private readonly pupil=new THREE.MeshBasicMaterial({color:'#ffe9a8'});
  private readonly standby=new THREE.MeshBasicMaterial({color:RED});
  private readonly arm=new THREE.Group();
  private readonly target=new THREE.Vector3();
  private width=1280;private height=720;private epoch=-1;
  constructor(characters:{id:CoreCharacterId;model:VoiceModel;track:TeleTrack}[],private readonly duration:number){
    this.scene.background=new THREE.Color('#050101');
    this.scene.fog=new THREE.Fog('#0b0202',220,760);
    this.scene.add(this.ambient);
    this.eyeLight.position.set(HAL_EYE[0],HAL_EYE[1],HAL_EYE[2]+26);this.scene.add(this.eyeLight);
    this.room();
    for(const c of characters){
      const root=new THREE.Group();root.name=c.id;this.scene.add(root);
      const head=new Anatomy3D();head.centred=true;head.scene.rotation.y=-Math.PI/2;root.add(head.scene);
      if(c.id==='hal'){root.position.set(HAL_EYE[0],HAL_EYE[1]-11,HAL_EYE[2]+10);root.scale.setScalar(1.45);root.rotation.y=.5;}
      else{root.rotation.y=-Math.PI/2;this.suit(root);}
      this.actors.push({...c,head,root});
    }
    this.resize(1280,720);this.frame(0,false,0,'wide',0);
  }
  private material(color:string){let m=this.materials.get(color);if(!m){m=new THREE.MeshLambertMaterial({color});this.materials.set(color,m);}return m;}
  private box(parent:THREE.Object3D,size:Point3,at:Point3,color:string,edge=.16){
    const g=new THREE.BoxGeometry(...size),mesh=new THREE.Mesh(g,this.material(color));mesh.position.set(...at);parent.add(mesh);
    if(edge)mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:'#ff6a4d',transparent:true,opacity:edge})));
    return mesh;
  }
  private line(parent:THREE.Object3D,points:Point3[],color='#ff6a4d',opacity=.4){
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(line);return line;
  }
  private room(){
    const s=this.scene;
    // A tall, narrow vault: floor grille, two long racks, the eye at the far end.
    this.box(s,[190,4,440],[0,52,-10],'#2b0907');
    this.box(s,[190,4,440],[0,214,-10],'#210705');
    this.box(s,[4,166,440],[-93,133,-10],'#3a0c09');
    this.box(s,[4,166,440],[93,133,-10],'#3a0c09');
    this.box(s,[190,166,4],[0,133,-224],'#2a0806');
    for(let z=-216;z<=200;z+=16)this.line(s,[[-91,54.2,z],[91,54.2,z]],'#ff5a40',.13);
    for(let x=-80;x<=80;x+=20)this.line(s,[[x,54.2,-222],[x,54.2,206]],'#ff5a40',.1);
    for(let z=-198;z<=205;z+=31)for(const x of [-90.8,90.8])this.line(s,[[x,60,z],[x,208,z]],'#ff5a40',.2);
    for(const y of [100,127,154,181])for(const x of [-90.8,90.8])this.line(s,[[x,y,-216],[x,y,204]],'#ff5a40',.14);
    // The eye: a dark bezel, a red lens, a small hot centre.
    const bezel=new THREE.Mesh(new THREE.TorusGeometry(30,3.2,10,56),this.material('#3b3432'));bezel.position.set(HAL_EYE[0],HAL_EYE[1],HAL_EYE[2]-16);s.add(bezel);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(24,1,8,56),this.material('#8a8482'));rim.position.copy(bezel.position);s.add(rim);
    // Dark glass with a glow that falls off from the centre, so the head in front of it stays legible.
    const glass=new THREE.Mesh(new THREE.CircleGeometry(23.5,56),this.material('#0a0201'));glass.position.set(HAL_EYE[0],HAL_EYE[1],HAL_EYE[2]-17);s.add(glass);
    for(let i=0;i<7;i++){const halo=new THREE.Mesh(new THREE.CircleGeometry(22-i*3,48),this.lens);halo.position.set(HAL_EYE[0],HAL_EYE[1],HAL_EYE[2]-16.6+i*.08);halo.renderOrder=i;s.add(halo);}
    for(const r of [9,16,22])this.line(s,Array.from({length:65},(_,i)=>[HAL_EYE[0]+Math.cos(i/64*Math.PI*2)*r,HAL_EYE[1]+Math.sin(i/64*Math.PI*2)*r,HAL_EYE[2]-16.1] as Point3),'#ff8a70',.16);
    const pupil=new THREE.Mesh(new THREE.CircleGeometry(2.6,24),this.pupil);pupil.position.set(HAL_EYE[0],HAL_EYE[1],HAL_EYE[2]-15.8);s.add(pupil);
    this.box(s,[76,96,3],[HAL_EYE[0],HAL_EYE[1]-4,HAL_EYE[2]-21],'#150403',.3);
    // The far rack stays seated and only dims; the near rack is the one being emptied.
    for(let column=0;column<8;column++)for(let row=0;row<3;row++){
      const cell=new THREE.Mesh(new THREE.PlaneGeometry(22,19),this.standby);cell.rotation.y=-Math.PI/2;cell.position.set(90.6,168-row*27,-58+column*31);s.add(cell);
    }
    for(let i=0;i<CORE_MODULES;i++){
      const g=new THREE.BoxGeometry(26,17,20),m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:GLASS,transparent:true,opacity:.4,depthWrite:false}));
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:'#fff1ea',transparent:true,opacity:.75})));
      const [x,y,z]=modulePosition(i);this.box(s,[3,23,26],[x-4.5,y,z],'#120302',.45);
      s.add(m);this.modules.push(m);
    }
  }
  /** A pressure suit drawn as a silhouette: the working airway head stays visible through the helmet. */
  private suit(root:THREE.Group){
    const helmet=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(17.5,14,10)),new THREE.LineBasicMaterial({color:'#ff7a5c',transparent:true,opacity:.16}));helmet.position.y=3;root.add(helmet);
    const collar=new THREE.Mesh(new THREE.TorusGeometry(13,1.6,8,28),this.material('#5a1810'));collar.rotation.x=Math.PI/2;collar.position.y=-11;root.add(collar);
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(19,15,46,12),this.material('#7a1c12'));torso.position.y=-36;root.add(torso);
    torso.add(new THREE.LineSegments(new THREE.WireframeGeometry(torso.geometry),new THREE.LineBasicMaterial({color:'#ff7a5c',transparent:true,opacity:.14})));
    this.box(root,[30,40,12],[0,-32,-17],'#40100b',.3);
    this.box(root,[13,9,3],[0,-25,17],'#1a0504',.5);
    for(const x of [-9,9]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(7.5,5.5,70,10),this.material('#6a1810'));leg.position.set(x,-92,-6);leg.rotation.x=.16;root.add(leg);}
    const rest=new THREE.Mesh(new THREE.CylinderGeometry(5.5,4.5,44,10),this.material('#6a1810'));rest.position.set(-22,-34,4);rest.rotation.x=-.3;root.add(rest);
    // The working arm carries the key that releases each module.
    this.arm.position.set(22,-16,2);root.add(this.arm);
    const upper=new THREE.Mesh(new THREE.CylinderGeometry(5.5,4.6,30,10),this.material('#7a1c12'));upper.position.y=-15;this.arm.add(upper);
    const fore=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4,26,10),this.material('#7a1c12'));fore.position.y=-42;this.arm.add(fore);
    this.box(this.arm,[6,8,5],[0,-58,0],'#b7aaa4',.4);
    this.line(this.arm,[[0,-62,0],[0,-72,0],[2.5,-72,0]],'#fff1ea',.9);
  }
  resize(w:number,h:number){this.width=w;this.height=h;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.actors.forEach(a=>a.head.resize(w,h));}
  frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
    const seek=epoch!==this.epoch;this.epoch=epoch;
    const power=corePower(time,this.duration),hal=this.actors.find(a=>a.id==='hal');
    // The eye brightens a little with the voice that comes out of it.
    const voice=hal?Math.min(1,hal.track.message(hal.track.indexAt(time)).t.outRms*7):0;
    this.ambient.intensity=.12+1.25*power;
    this.eyeLight.intensity=(900+5200*power)*(1+.5*voice);
    this.lens.color.copy(EMBER).lerp(RED,Math.min(1,power*(.72+.28*voice)+.04));
    this.pupil.color.set('#ffe9a8').multiplyScalar(.15+.85*Math.min(1,power+.3*voice));
    this.standby.color.copy(EMBER).lerp(RED,power*.55);
    this.modules.forEach((m,i)=>{
      const travel=moduleTravel(i,time),[x,y,z]=modulePosition(i);
      m.position.set(x+7+travel*21,y,z);
      m.material.opacity=.05+.36*(1-travel)*(.35+.65*power);
      m.material.color.copy(EMBER).lerp(GLASS,(1-travel)*(.3+.7*power));
    });
    const pose=astronautPose(time);
    this.arm.rotation.x=-.35-1.15*pose.reach;this.arm.rotation.z=.12;
    const shot=coreCamera((view==='hal'||view==='dave'||view==='modules'?view:'wide') as CoreView,this.width/this.height,time,this.duration);
    this.camera.fov=shot.fov;this.camera.updateProjectionMatrix();this.camera.position.set(...shot.position);this.target.set(...shot.target);this.camera.lookAt(this.target);this.camera.updateMatrixWorld();
    for(const actor of this.actors){
      if(actor.id==='dave'){actor.root.position.set(...pose.position);actor.root.rotation.z=pose.roll;}
    }
    this.scene.updateMatrixWorld(true);
    for(const actor of this.actors){
      const message=actor.track.message(actor.track.indexAt(time)),tele=playing?message:null;
      if(seek)actor.head.resetMotion();
      actor.head.face.update(tele,1/30);
      actor.head.camera.copy(this.camera);actor.head.camera.updateMatrixWorld();
      const artic=VoiceModel.articFromArray(message.t.artic);
      actor.head.update(actor.model,actor.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},1/30);
    }
  }
  dispose(){
    for(const a of this.actors){a.root.remove(a.head.scene);a.head.dispose();}
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
    this.scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.materials.clear();
  }
}
