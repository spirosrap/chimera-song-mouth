import * as THREE from 'three';
import {Beams} from './beams3d.ts';
import {Anatomy3D} from './anatomy3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
export type VideoPoint=[number,number,number];
/** Geometry owned by one requested video, with no shared material mutations. */
export class VideoProps{
 readonly meshes:THREE.Mesh[]=[];readonly inks:Beams[]=[];
 mesh(g:THREE.Object3D,geo:THREE.BufferGeometry,p:VideoPoint,c:string){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);g.add(m);this.meshes.push(m);return m;}
 box(g:THREE.Object3D,w:number,h:number,d:number,c:string,p:VideoPoint){return this.mesh(g,new THREE.BoxGeometry(w,h,d),p,c);}
 oval(g:THREE.Object3D,p:VideoPoint,s:VideoPoint,c:string){const m=this.mesh(g,new THREE.SphereGeometry(1,16,10),p,c);m.scale.set(...s);return m;}
 segment(m:THREE.Mesh,a:VideoPoint,b:VideoPoint,r:number){const v=new THREE.Vector3(...a),d=new THREE.Vector3(...b).sub(v);m.position.copy(v).addScaledVector(d,.5);m.scale.set(r,d.length(),r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 tube(g:THREE.Object3D,a:VideoPoint,b:VideoPoint,r:number,c:string){const m=this.mesh(g,new THREE.CylinderGeometry(1,1,1,10),[0,0,0],c);this.segment(m,a,b,r);return m;}
 ink(g:THREE.Object3D){const b=new Beams();for(const o of b.group.children){const m=(o as THREE.Mesh).material as THREE.Material;m.blending=THREE.NormalBlending;m.depthTest=true;m.depthWrite=false;}g.add(b.group);this.inks.push(b);b.begin();b.end();return b;}
 line(b:Beams,p:VideoPoint[],c:string,w=1,close=false){b.line(p.flat(),p.length,c,w,{alpha:1,close});}
 ring(b:Beams,c:VideoPoint,u:VideoPoint,v:VideoPoint,col:string,w=1){this.line(b,Array.from({length:40},(_,i)=>{const q=i/40*Math.PI*2;return c.map((x,k)=>x+u[k]*Math.cos(q)+v[k]*Math.sin(q))as VideoPoint;}),col,w,true);}
 resize(w:number,h:number){this.inks.forEach(b=>b.setResolution(w,h));}
 dispose(){this.inks.forEach(b=>b.dispose());this.meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});}
}
/** A costume can own graphics while borrowing a retained physical airway. */
export class VideoFigure{
 readonly root=new THREE.Group();readonly head=new Anatomy3D();readonly hair:Beams;readonly ornaments=new THREE.Group();readonly costume:Beams;readonly arms:THREE.Mesh[]=[];readonly legs:THREE.Mesh[]=[];readonly hands:THREE.Mesh[]=[];readonly feet:THREE.Mesh[]=[];readonly torso:THREE.Mesh;
 constructor(readonly model:VoiceModel,readonly track:TeleTrack,readonly props:VideoProps,parent:THREE.Object3D,coat:string,skin='#d6bdad'){
  this.head.centred=true;this.hair=props.ink(this.ornaments);this.head.attachAccessory(this.ornaments);this.costume=props.ink(this.root);this.root.add(this.head.scene);parent.add(this.root);this.torso=props.mesh(this.root,new THREE.CylinderGeometry(21,18,65,24),[0,-39,0],coat);this.torso.scale.z=.57;
  for(const s of [-1,1]){this.arms.push(...Array.from({length:2},()=>props.mesh(this.root,new THREE.CylinderGeometry(1,1,1,12),[0,0,0],coat)));this.legs.push(...Array.from({length:2},()=>props.mesh(this.root,new THREE.CylinderGeometry(1,1,1,12),[0,0,0],coat)));this.hands.push(props.oval(this.root,[0,0,0],[3.5,6,2.5],skin));this.feet.push(props.oval(this.root,[s*15,-147,8],[5,4,12],coat));}
 }
 pose(time:number,arms:[VideoPoint,VideoPoint,VideoPoint,VideoPoint],seated=false){const p=this.props;for(const [j,s]of [-1,1].entries()){const elbow=arms[j*2],hand=arms[j*2+1];p.segment(this.arms[j*2],[s*21,-14,0],elbow,5.5);p.segment(this.arms[j*2+1],elbow,hand,4.5);this.hands[j].position.set(...hand);const knee:VideoPoint=seated?[s*23,-76,37]:[s*13,-104,0],foot:VideoPoint=seated?[s*26,-130,47]:[s*16,-146,8];p.segment(this.legs[j*2],[s*10,-70,0],knee,7);p.segment(this.legs[j*2+1],knee,foot,5);this.feet[j].position.set(...foot);}this.head.scene.rotation.set(0,-Math.PI/2+Math.sin(time*.4)*.06,0);}
 update(time:number,playing:boolean,camera:THREE.PerspectiveCamera,dt:number,reset:boolean){if(reset)this.head.resetMotion();const msg=this.track.message(this.track.indexAt(time)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null;this.head.camera.copy(camera);this.head.camera.updateMatrixWorld();this.head.face.update(tele,dt);this.head.face.nod=0;this.head.face.tilt=0;this.head.face.lid=Math.exp(-(((time%6.1-5.2)/.13)**2));this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:false,grid:false,calipers:false},dt);}
 dispose(){this.ornaments.removeFromParent();this.head.dispose();}
}
