import * as THREE from 'three';
import {snapPose,type FingerSnap} from '../../band/snaps.ts';

/** Jointed robotic hand: the thumb loads the middle finger, which releases against the palm. */
export class SnappingHand {
 readonly scene=new THREE.Scene();
 readonly camera=new THREE.PerspectiveCamera(43,1,1,250);
 readonly root=new THREE.Group();
 readonly fingers:THREE.Group[][]=[];
 readonly thumb:THREE.Group[];
 private readonly tip=new THREE.Vector3();
 private readonly up=new THREE.Vector3(0,1,0);
 private readonly aim=new THREE.Quaternion();
 private readonly openThumb=new THREE.Quaternion().setFromEuler(new THREE.Euler(.12,0,.8));
 private readonly mats=new Map<string,THREE.MeshStandardMaterial>();
 private readonly spark:THREE.Mesh;
 private readonly flashMaterial=new THREE.MeshBasicMaterial({color:'#87ffd6',transparent:true,opacity:0,depthWrite:false});
 constructor(){
  this.scene.background=new THREE.Color('#000000');this.scene.add(this.root);
  this.scene.add(new THREE.AmbientLight('#6091b0',2));
  const key=new THREE.DirectionalLight('#d7f0ff',3);key.position.set(-15,35,45);this.scene.add(key);
  const rim=new THREE.DirectionalLight('#38b7db',2);rim.position.set(30,8,-20);this.scene.add(rim);
  this.box([8.1,10.5,2.4],[0,5.1,0],'#123044');
  for(const x of [-3,-1,1,3])this.line([[x,.4,1.4],[x,8.9,1.4]],'#53a4ce',.6);
  for(let y=1;y<10;y+=1.8)this.line([[-3.9,y,1.4],[3.9,y,1.4]],'#375f79',.6);
  const wrist=new THREE.Mesh(new THREE.CylinderGeometry(3,2.5,7,10),this.material('#183143'));wrist.position.y=-3.5;this.root.add(wrist);this.edges(wrist);
  this.box([4.6,13,2.8],[0,-13.3,-.2],'#0b1c2b');
  for(const x of [-1.5,1.5])this.line([[x,-19.5,1.5],[x,-6.6,1.5]],'#65aacb',.9);
  for(const [i,x] of [-3,-1,1,3].entries())this.fingers.push(this.finger([x,10.3,0],[[4.6,2.6,2.1],[5.2,3.1,2.4],[4.8,2.8,2.2],[3.8,2.2,1.8]][i]));
  this.thumb=this.finger([-4,3.2,0],[3.8,2.7,2]);
  this.spark=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),this.flashMaterial);this.spark.position.set(-1,8,5);this.root.add(this.spark);
  this.camera.position.set(23,14,62);this.camera.lookAt(0,6,0);this.resize(500,430);this.frame([],0,false);
 }
 private material(color:string){let m=this.mats.get(color);if(!m){m=new THREE.MeshStandardMaterial({color,metalness:.65,roughness:.35});this.mats.set(color,m);}return m;}
 private edges(mesh:THREE.Mesh){mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:'#71badd',transparent:true,opacity:.75})));}
 private box(size:[number,number,number],at:[number,number,number],color:string,parent:THREE.Object3D=this.root){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),this.material(color));m.position.set(...at);parent.add(m);this.edges(m);return m;}
 private line(points:[number,number,number][],color:string,opacity:number){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity}));this.root.add(l);}
 private finger(at:[number,number,number],lengths:number[]){
  const joints:THREE.Group[]=[];let parent:THREE.Object3D=this.root;
  lengths.forEach((length,i)=>{
   const joint=new THREE.Group();joint.position.set(...(i?[0,lengths[i-1],0] as [number,number,number]:at));parent.add(joint);joints.push(joint);
   const hinge=new THREE.Mesh(new THREE.SphereGeometry(.75-i*.12,10,8),this.material('#254c64'));joint.add(hinge);this.edges(hinge);
   this.box([1.15-i*.13,length-.7,1.15-i*.15],[0,length*.5,0],'#183446',joint);
   const cable=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,length,5),this.material('#79c6da'));cable.position.set(0,length*.5,.68);joint.add(cable);
   if(i===lengths.length-1){const pad=new THREE.Mesh(new THREE.SphereGeometry(.54,10,8),this.material('#7cbac7'));pad.position.y=length;joint.add(pad);}
   parent=joint;
  });return joints;
 }
 resize(w:number,h:number){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 frame(events:readonly FingerSnap[],time:number,audible:boolean){
  const p=snapPose(events,time),g=p.grip,s=p.strike;
  for(const [i,finger] of this.fingers.entries()){
   if(i===1){finger[0].rotation.x=.15+g*.72+s*1.85;finger[1].rotation.x=.2+g*1.2*(1-s);finger[2].rotation.x=.15+g*.85*(1-s);}
   else {finger[0].rotation.x=(i<1?.12:.5)+g*(i<1?.12:.15);finger[1].rotation.x=(i<1?.15:.65)+g*.12;finger[2].rotation.x=i<1?.1:.3;}
   finger[0].rotation.z=(i-1.5)*-.035;
  }
  // Oppose the thumb toward the loaded middle fingertip, keeping the pads in contact.
  this.thumb[0].position.set(-4+g*.8,3.2+g*.6,g*.3);this.root.updateMatrixWorld(true);
  this.tip.set(0,2.4,0);this.fingers[1][2].localToWorld(this.tip);this.root.worldToLocal(this.tip);this.tip.sub(this.thumb[0].position).normalize();
  this.aim.setFromUnitVectors(this.up,this.tip);this.thumb[0].quaternion.copy(this.openThumb).slerp(this.aim,g);
  this.thumb[1].rotation.x=.15*(1-g)+.02*g;this.thumb[2].rotation.x=.15*(1-g)+.02*g;
  this.root.rotation.y=-.12+Math.sin(time*.7)*.035;this.root.rotation.z=-.1+s*.055;
  this.root.position.y=s*-.24;
  this.flashMaterial.opacity=audible?Math.min(.9,p.flash):0;this.spark.scale.setScalar(1+p.flash*1.5);
  this.scene.updateMatrixWorld(true);return p;
 }
 dispose(){
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  this.scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.mats.clear();
 }
}
