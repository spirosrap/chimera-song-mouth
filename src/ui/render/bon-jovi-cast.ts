import * as THREE from 'three';
type P=[number,number,number];
export type StoryPose='stand'|'sit'|'walk'|'dance'|'embrace'|'argue'|'paint'|'grief'|'recline'|'sing';
export interface StoryAppearance {female?:boolean;blonde?:boolean;shades?:boolean;hat?:boolean;seated?:boolean;gesture?:number;phone?:boolean;yaw?:number;pose?:StoryPose;phase?:number}
type Figure={root:THREE.Group;head:THREE.Group;torso:THREE.Mesh;skirt:THREE.Mesh;face:THREE.Mesh;nose:THREE.Mesh;mouth:THREE.Mesh;eyes:THREE.Mesh[];brows:THREE.Mesh[];hair:THREE.Mesh[];hat:THREE.Mesh[];limbs:THREE.Mesh[];hands:THREE.Mesh[];shoes:THREE.Mesh[]};
const UP=new THREE.Vector3(0,1,0);
/** A retained, scene-local cast. Geometry is shared; poses are reconstructed from time after a seek. */
export class BonJoviCast{
 readonly group=new THREE.Group();readonly figures:Figure[]=[];
 private sphere=new THREE.SphereGeometry(1,16,12);private tube=new THREE.CylinderGeometry(1,1,1,12);private cone=new THREE.CylinderGeometry(.65,1,1,16);
 private materials=new Map<string,THREE.MeshLambertMaterial>();private count=0;
 private material(c:string){let m=this.materials.get(c);if(!m){m=new THREE.MeshLambertMaterial({color:c});this.materials.set(c,m);}return m;}
 private mesh(g:THREE.Group,c:string,shape:'sphere'|'tube'|'cone'='sphere'){const m=new THREE.Mesh(shape==='sphere'?this.sphere:shape==='cone'?this.cone:this.tube,this.material(c));g.add(m);return m;}
 private create(){
  const root=new THREE.Group(),head=new THREE.Group();root.add(head);this.group.add(root);
  const f:Figure={root,head,torso:this.mesh(root,'#4e626f','cone'),skirt:this.mesh(root,'#823f4e','cone'),face:this.mesh(head,'#caa38a'),nose:this.mesh(head,'#caa38a'),mouth:this.mesh(head,'#79504a'),eyes:[],brows:[],hair:[],hat:[],limbs:[],hands:[],shoes:[]};
  f.face.scale.set(9.2,13.1,8.7);f.nose.position.set(0,-.5,8.2);f.nose.scale.set(1.6,3,2.8);f.mouth.position.set(0,-5.3,8.1);f.mouth.scale.set(2.7,.45,.5);
  for(const side of [-1,1]){const eye=this.mesh(head,'#303238');eye.position.set(side*3.6,2.3,8.1);eye.scale.set(1.4,.65,.5);f.eyes.push(eye);const brow=this.mesh(head,'#624c3e','tube');brow.scale.set(.5,4,.5);brow.rotation.z=side*1.4;brow.position.set(side*3.6,4.3,8);f.brows.push(brow);}
  for(let i=0;i<23;i++)f.hair.push(this.mesh(head,'#786044'));
  f.hat.push(this.mesh(head,'#302c28','tube'),this.mesh(head,'#39312a','cone'));
  for(let i=0;i<8;i++)f.limbs.push(this.mesh(root,'#4e626f','tube'));
  for(let i=0;i<2;i++){f.hands.push(this.mesh(root,'#caa38a'));f.shoes.push(this.mesh(root,'#302b29'));}
  this.figures.push(f);return f;
 }
 private link(m:THREE.Mesh,a:P,b:P,r:number,c:string){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UP,d.clone().normalize());m.scale.set(r,Math.max(.01,d.length()),r);m.material=this.material(c);}
 begin(){this.count=0;}
 person(x:number,y:number,z:number,color:string,o:StoryAppearance,time:number){
  const i=this.count++,f=this.figures[i]??this.create(),phase=time+(o.phase??i*.73),pose=o.pose??(o.seated?'sit':'stand'),sit=pose==='sit'||pose==='recline',wave=Math.sin(phase*2.8),walk=pose==='walk'?wave:pose==='dance'?wave*.45:0,gesture=o.gesture??0;
  f.root.visible=true;f.root.position.set(x,y-135,z);f.root.rotation.set(0,o.yaw??0,pose==='grief'?.12:pose==='dance'?Math.sin(phase*2.8)*.045:0);
  const hipY=sit?54:72,shoulderY=hipY+47,headY=shoulderY+21;
  f.torso.position.set(0,hipY+23,0);f.torso.scale.set(o.female?17:21,48,o.female?10:12);f.torso.material=this.material(color);
  f.skirt.visible=!!o.female;f.skirt.position.set(0,hipY-10,0);f.skirt.scale.set(25,32,15);f.skirt.material=this.material(color);
  f.head.position.set(0,headY,pose==='grief'?8:0);f.head.rotation.set(pose==='grief'?.35:pose==='paint'?.07:0,pose==='argue'?Math.sin(phase*1.5)*.1:pose==='embrace'?.27:Math.sin(phase*.32)*.035,pose==='grief'?.12:0);
  const hair=o.blonde?'#b89763':o.female?'#302329':'#49342c';
  for(let k=0;k<f.hair.length;k++){const m=f.hair[k];m.material=this.material(k%5===0?(o.blonde?'#d3b480':'#674a3a'):hair);if(k===0){m.position.set(0,7,-1);m.scale.set(10.2,7.8,9.8);}else{const a=(k-1)/22*Math.PI*2,front=Math.sin(a)>.45,length=front?5:o.female?25:19;m.position.set(Math.cos(a)*9,front?8:-2-length*.16,Math.sin(a)*8);m.scale.set(2.5,length*.7,2.3);m.rotation.set(Math.sin(a)*.12,0,Math.cos(a)*.15+Math.sin(phase*.6+k)*.025);}}
  for(const [k,m]of f.hat.entries()){m.visible=!!o.hat;m.position.set(0,k?19:14,0);m.scale.set(k?12:22,k?12:2,k?11:18);}
  for(const [k,m]of f.eyes.entries()){m.scale.x=o.shades?4:1.4;m.scale.y=o.shades?2.3:.65;m.position.z=o.shades?8.8:8.1;f.brows[k].rotation.z=(k?1:-1)*(pose==='grief'?1.23:pose==='argue'?1.62:1.4);}
  for(const [n,side]of [-1,1].entries()){
   const hip:P=[side*9,hipY,0],knee:P=[side*12,sit?28:38,sit?34:walk*side*16],foot:P=[side*(pose==='dance'?22:14),5, sit?48:walk*side*26];
   this.link(f.limbs[n*2],hip,knee,7.5,'#637c89');this.link(f.limbs[n*2+1],knee,foot,5.5,'#637c89');f.shoes[n].position.set(foot[0],foot[1]-1,foot[2]+6);f.shoes[n].scale.set(6,4,12);
   const shoulder:P=[side*(o.female?16:20),shoulderY-4,0],elbow:P=[side*(27+gesture*5),shoulderY-24,6];let hand:P=[side*26,hipY+2,12];
   if(sit)hand=[side*20,hipY-2,32];if(pose==='walk')hand=[side*26,hipY+3,-walk*side*18];if(pose==='dance'){elbow[1]+=12;hand=[side*(33+wave*8),shoulderY-15+side*wave*17,20];}
   if(pose==='argue')hand=[side*(35+gesture*9),shoulderY-10+Math.sin(phase*2+n)*8,28];if(pose==='embrace')hand=[-side*8,shoulderY-5,43];if(pose==='grief')hand=[side*5,headY-5,19];if(pose==='paint'&&side>0)hand=[12,shoulderY+4+Math.sin(phase*1.9)*9,62];if(pose==='sing')hand=side>0?[12,headY-9,30]:[-25-gesture*20,hipY+18+gesture*45,22+gesture*8];if(o.phone&&side>0)hand=[12,headY,12];
   this.link(f.limbs[4+n*2],shoulder,elbow,5.3,color);this.link(f.limbs[5+n*2],elbow,hand,3.7,skinColor);f.hands[n].position.set(...hand);f.hands[n].scale.set(3.3,5,2.7);
  }
  return f.root;
 }
 end(){for(let i=this.count;i<this.figures.length;i++)this.figures[i].root.visible=false;}
 dispose(){this.group.removeFromParent();this.sphere.dispose();this.tube.dispose();this.cone.dispose();this.materials.forEach(m=>m.dispose());}
}
const skinColor='#caa38a';
