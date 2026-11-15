import * as THREE from 'three';
import {Beams} from './beams3d.ts';
export type FilmPoint=[number,number,number];
/** Graphics owned by the two source-film stages. Never owns a VoiceModel. */
export class FilmKit{
 readonly meshes:THREE.Mesh[]=[];readonly inks:Beams[]=[];
 mesh(parent:THREE.Object3D,g:THREE.BufferGeometry,p:FilmPoint,c:string){const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);parent.add(m);this.meshes.push(m);return m;}
 box(parent:THREE.Object3D,w:number,h:number,d:number,c:string,p:FilmPoint){return this.mesh(parent,new THREE.BoxGeometry(w,h,d),p,c);}
 oval(parent:THREE.Object3D,p:FilmPoint,s:FilmPoint,c:string){const m=this.mesh(parent,new THREE.SphereGeometry(1,16,10),p,c);m.scale.set(...s);return m;}
 segment(m:THREE.Mesh,a:FilmPoint,b:FilmPoint,r:number){const v=new THREE.Vector3(...a),d=new THREE.Vector3(...b).sub(v);m.position.copy(v).addScaledVector(d,.5);m.scale.set(r,d.length(),r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 tube(parent:THREE.Object3D,a:FilmPoint,b:FilmPoint,r:number,c:string){const m=this.mesh(parent,new THREE.CylinderGeometry(1,1,1,10),[0,0,0],c);this.segment(m,a,b,r);return m;}
 ink(parent?:THREE.Object3D){const b=new Beams();for(const o of b.group.children){const m=(o as THREE.Mesh).material as THREE.Material;m.blending=THREE.NormalBlending;m.depthTest=true;m.depthWrite=false;}b.begin();parent?.add(b.group);this.inks.push(b);return b;}
 line(b:Beams,p:FilmPoint[],c:string,w=1,close=false){b.line(p.flat(),p.length,c,w,{alpha:1,close});}
 ring(b:Beams,c:FilmPoint,u:FilmPoint,v:FilmPoint,col:string,w=1){this.line(b,Array.from({length:36},(_,i)=>{const q=i/36*Math.PI*2;return c.map((x,k)=>x+u[k]*Math.cos(q)+v[k]*Math.sin(q))as FilmPoint;}),col,w,true);}
 opacity(b:Beams,alpha:number){for(const o of b.group.children)((o as THREE.Mesh).material as THREE.Material).opacity=alpha;}
 resolution(w:number,h:number){this.inks.forEach(b=>b.setResolution(w,h));}
 dispose(){this.inks.forEach(b=>b.dispose());for(const m of this.meshes){m.geometry.dispose();(m.material as THREE.Material).dispose();}}
}
