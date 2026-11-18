import * as THREE from 'three';
import {propGroup} from './lithonia-set.ts';
import {VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {wash} from './house-tour-props.ts';

const marble=['#b89a7c','#a98476','#c9aa91'];
const brass='#aa8f68';
const stone='#b9ad91';

function arch(p:VideoProps,room:THREE.Group,at:Point,radius:number,spring:number,width:number) {
  const g=propGroup(room,at);
  for(let i=0;i<25;i++){
    const a=(i+.5)/25*Math.PI;
    p.box(g,width,radius*Math.PI/24,width*.57,i%6===0?'#ccbea1':'#a8987a',
      [radius*Math.cos(a),spring+radius*Math.sin(a),0]).rotation.z=a;
  }
  return g;
}

export function buildLoveStation(p:VideoProps,scene:THREE.Scene) {
  const hall=propGroup(scene);
  p.box(hall,1110,12,2300,'#7d5849',[0,-7,-328]);
  p.box(hall,1060,526,23,'#928068',[0,261,-1118]);
  p.box(hall,323,316,6,'#d2c7a6',[0,156,-1105]);
  arch(p,hall,[0,0,-1082],165,273,25);
  p.box(hall,945,18,2140,'#a6977d',[0,793,-335]);
  for(const side of [-1,1]){
    p.box(hall,20,522,2120,'#9e8b71',[side*391,259,-342]);
    p.box(hall,15,36,2100,'#cabb9d',[side*379,442,-339]);
    p.box(hall,16,39,2100,'#8a6759',[side*376,59,-339]);
    for(let i=0;i<12;i++){
      const z=599-i*147;
      const x=side*343;
      p.box(hall,43,13,48,'#ac9b83',[x,8,z]);
      p.mesh(hall,new THREE.CylinderGeometry(15.5,19.2,396,14),[x,214,z],marble[i%3]);
      p.box(hall,49,17,46,'#c3b294',[x,417,z]);
      p.box(hall,54,11,49,'#b5a383',[x,432,z]);
      const slot=propGroup(hall,[side*378,216,z-54]);
      slot.rotation.y=-side*Math.PI/2;
      p.box(slot,92,244,7,'#846c54',[0,0,0]);
      p.box(slot,77,226,7,side===-1?'#e0d1aa':'#c3ba9d',[0,1,5]);
      p.box(slot,4.5,224,8,'#a08b66',[0,1,9]);
      p.box(slot,80,5,9,'#ae997b',[0,23,10]);
      p.box(slot,93,8,10,'#a58e74',[0,-117,9]);
    }
  }
  const tiles=p.ink(hall);
  tiles.begin();
  for(let row=0;row<36;row++){
    const z=616-row*47;
    p.line(tiles,[[-360,.5,z],[360,.5,z]],row%4===0?'#a3826c':'#725648',row%4===0?1.2:.7);
    for(let col=0;col<13;col++){
      const x=-339+col*54+(row%2)*15;
      p.line(tiles,[[x,.6,z],[x,.6,z-46]],'#8c6c59',.7);
    }
  }
  for(const side of [-1,1]){
    p.line(tiles,[[side*66,1,630],[side*66,1,-1085]],'#cfb99b',1.4);
    p.line(tiles,[[side*81,1,630],[side*81,1,-1085]],'#947766',1.1);
  }
  tiles.end();
  for(let i=0;i<8;i++){
    const z=614-i*201;
    arch(p,hall,[0,0,z],341,220,15);
    p.tube(hall,[0,532,z],[0,423,z],1.8,'#4d433b');
    p.oval(hall,[0,417,z],[8.2,9.9,8.2],'#f2d9a4');
    wash(p.oval(hall,[0,419,z],[15,16,15],'#edc988'),.16);
  }
  for(let i=0;i<11;i++){
    const z=573-i*151;
    const light=wash(p.mesh(hall,new THREE.PlaneGeometry(243,66),[-214,1.2,z],'#f2cf92'),.14);
    light.rotation.x=-Math.PI/2;
    light.rotation.z=-.17;
  }
  const table=propGroup(hall,[-77,0,104]);
  p.box(table,73,7,63,'#7f8b85',[0,79,0]);
  for(const x of [-30,30])for(const z of [-25,25])
    p.tube(table,[x,2,z],[x,80,z],2.9,'#586462');
  p.oval(table,[14,87,16],[10.5,2.3,8.6],'#9ca3a0');
  return {hall,table};
}

export type LoveArm = {
  root:THREE.Group;lower:THREE.Mesh;upper:THREE.Mesh;elbow:THREE.Mesh;
  shoulder:THREE.Mesh;wrist:THREE.Mesh;panel:THREE.Group;face:THREE.Mesh;
  foot:THREE.Mesh;base:Point;side:number;size:number;
};

export function buildLoveArm(p:VideoProps,root:THREE.Group,base:Point,side:number,large=false):LoveArm {
  const g=propGroup(root,base),size=large?1.75:1;
  const steel=large?'#b76548':'#78a0a1',shade=large?'#8f4c3c':'#487679';
  const stand=large?26:36,depth=large?56:51;
  p.box(g,62*size,6,depth,'#7b827e',[0,stand,0]);
  for(const x of [-22,22])for(const z of [-18,18]){
    p.tube(g,[x*size,2,z],[x*size,stand-3,z],2.9*size,'#596460');
    p.box(g,8*size,4,7,'#454c49',[x*size,2,z]);
  }
  const foot=p.mesh(g,new THREE.CylinderGeometry(11*size,17*size,13,22),[0,stand+9,0],shade);
  const lower=p.mesh(g,new THREE.CylinderGeometry(1,1,1,16),[0,0,0],steel);
  const upper=p.mesh(g,new THREE.CylinderGeometry(1,1,1,16),[0,0,0],steel);
  const shoulder=p.oval(g,[0,stand+19,0],[11*size,10*size,10*size],shade);
  const elbow=p.oval(g,[0,0,0],[10*size,10*size,10*size],shade);
  const wrist=p.oval(g,[0,0,0],[7*size,7*size,7*size],'#596663');
  const panel=propGroup(g);
  const geo=large?new THREE.PlaneGeometry(91,125):new THREE.CircleGeometry(15.1,28);
  const face=p.mesh(panel,geo,[0,0,1.9],large?'#c7cbba':'#c4ceca');
  if(large)p.box(panel,96,130,4.5,'#565a52',[0,0,-1.4]);
  else p.mesh(panel,new THREE.CylinderGeometry(16.5,16.5,3.2,28),[0,0,-.45],'#818e83').rotation.x=Math.PI/2;
  return {root:g,lower,upper,elbow,shoulder,wrist,panel,face,foot,base,side,size};
}

export function poseLoveArm(p:VideoProps,a:LoveArm,t:number,phase:number,reach:number) {
  const size=a.size,side=a.side,large=size>1;
  const [x,y,z]=a.base;
  a.root.position.set(x,y,z);
  const q=t*1.54+phase;
  const start:Point=[0,large?45:55,0];
  const shoulderTurn=.7*Math.sin(q*.57)+side*reach*.27;
  const bend=.40*Math.cos(q*.87)-side*reach*.38;
  const first=57*size,second=56*size;
  const elbow:Point=[
    Math.sin(shoulderTurn)*first,
    start[1]+Math.cos(shoulderTurn)*first*.96,
    9*Math.sin(q*.6)*size,
  ];
  const wrist:Point=[
    elbow[0]+Math.sin(bend)*second,
    elbow[1]+Math.cos(bend)*second*.86,
    elbow[2]+Math.sin(q*.38)*21*size,
  ];
  p.segment(a.lower,start,elbow,7.8*size);
  p.segment(a.upper,elbow,wrist,6.3*size);
  a.elbow.position.set(...elbow);
  a.wrist.position.set(...wrist);
  a.shoulder.position.set(...start);
  a.foot.rotation.y=shoulderTurn;
  a.panel.position.set(wrist[0],wrist[1]+(large?15:4),wrist[2]+(large?12:7));
  a.panel.rotation.set(.20*Math.sin(q)+.08,side*(.35-.24*reach)+.39*Math.sin(q*.72),q*.27);
}
