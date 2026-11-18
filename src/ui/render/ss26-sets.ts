import * as THREE from 'three';
import {propGroup} from './lithonia-set.ts';
import {VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {wash} from './house-tour-props.ts';

const metal='#525864';

function floor(p:VideoProps,root:THREE.Group,color:string) {
  p.box(root,1720,10,1600,color,[0,-5,-130]);
}

function runway(p:VideoProps,root:THREE.Group) {
  floor(p,root,'#090b11');
  // The white intersection is continuous with the upright panels at each end.
  p.box(root,135,6,1180,'#d8dce0',[0,1,-105]);
  p.box(root,821,6,118,'#d8dce0',[0,1,-102]);
  p.box(root,132,290,10,'#e2e6e7',[0,145,-388]);
  p.box(root,151,287,10,'#232733',[0,143,-394]);
  for(const side of [-1,1]){
    p.box(root,230,298,12,'#13161f',[side*189,148,-388]);
    p.box(root,7,260,18,'#333744',[side*171,128,-369]);
    p.box(root,85,13,820,'#171820',[side*130,5,37]);
    for(let i=0;i<8;i++){
      const z=400-i*110;
      p.box(root,8,266,8,'#191e28',[side*341,133,z]);
      p.box(root,8,272,17,'#1b1f27',[side*340,133,z-18]);
      p.box(root,5,35,7,'#414450',[side*338,238,z+6]);
    }
  }
  const lines=p.ink(root);
  lines.begin();
  for(const side of [-1,1]){
    p.line(lines,[[side*67,4,-387],[side*67,4,-160]],'#b5c3cb',1.3);
    p.line(lines,[[side*67,4,-42],[side*67,4,466]],'#b5c3cb',1.3);
    p.line(lines,[[-403,4,-102+side*59],[-68,4,-102+side*59]],'#b5c3cb',1.3);
    p.line(lines,[[68,4,-102+side*59],[403,4,-102+side*59]],'#b5c3cb',1.3);
  }
  for(let i=0;i<9;i++){
    const z=i*81-326;
    p.line(lines,[[-66,4,z],[66,4,z]],'#c5cbd1',.55);
  }
  lines.end();
  const lamps=Array.from({length:9},(_,i)=>{
    const x=(i-4)*51,y=i%2?229:254,z=-303+i%3*21;
    const holder=propGroup(root,[x,y,z]);
    p.oval(holder,[0,0,-2],[10.4,10.4,9],'#242835');
    const light=p.oval(holder,[0,0,8.5],[7.4,7.4,3.7],'#e8eefa');
    const glow=wash(p.oval(holder,[0,0,12],[12,12,1],'#b5d6ef'),.16);
    return {light,glow};
  });
  const pools=[-235,-55,133,307].map((z,i)=>
    wash(p.oval(root,[0,4.3,z],[55,0.2,93],i%2?'#b5d8f1':'#c5cde9'),.22));
  return {lamps,pools};
}

function rack(p:VideoProps,room:THREE.Group,at:Point,tones:string[]) {
  const r=propGroup(room,at);
  p.tube(r,[-43,0,0],[-43,123,0],2.1,metal);
  p.tube(r,[43,0,0],[43,123,0],2.1,metal);
  p.tube(r,[-45,123,0],[45,123,0],2.3,metal);
  for(let i=0;i<8;i++){
    const x=-36+i*10.2;
    p.tube(r,[x,123,0],[x,113,0],1.1,'#232630');
    const garment=p.mesh(r,new THREE.CylinderGeometry(8+i%2*2,11+i%3*1.8,52+i%4*9,8),
      [x,79-i%4*3,2],tones[i%tones.length]);
    garment.scale.z=.62;
    garment.rotation.z=(i-4)*.057;
  }
}

function bottles(p:VideoProps,root:THREE.Object3D,x:number,z:number) {
  for(let i=0;i<7;i++){
    const a=x+i*6.1,b=z+(i%2)*5,h=3+i%4*2;
    p.mesh(root,new THREE.CylinderGeometry(1.4,1.8,h,8),[a,73+h/2,b],
      ['#a28791','#261f2d','#a39375','#687682'][i%4]);
    p.mesh(root,new THREE.CylinderGeometry(1.5,1.5,2,8),[a,74+h,b],'#242631');
  }
}

function vanity(p:VideoProps,root:THREE.Group) {
  floor(p,root,'#969a9f');
  p.box(root,850,248,12,'#7f8890',[0,120,-217]);
  p.box(root,848,12,16,'#b4bac1',[0,211,-216]);
  for(let i=0;i<3;i++){
    const x=(i-1)*170;
    p.box(root,120,8,58,'#c6c5be',[x,70,-54]);
    p.box(root,115,70,35,'#acaeac',[x,34,-55]);
    p.box(root,101,103,7,'#515d67',[x,130,-89]);
    p.box(root,90,93,5,i===1?'#7c909e':'#687e8c',[x,130,-84]);
    p.box(root,87,53,1,'#859aa5',[x,149,-80]);
    for(const sign of [-1,1]){
      p.box(root,4,103,5,'#eaf3f3',[x+sign*49,130,-79]);
      p.box(root,99,3.8,5,'#e2edef',[x,130+sign*51,-78]);
    }
    bottles(p,root,x-45,-33);
    bottles(p,root,x+8,-68);
    p.oval(root,[x-7,72,-35],[8,.6,5],'#3d3946');
  }
  rack(p,root,[-165,0,-166],['#c7c6bd','#e3e3d7','#989d9a','#a2a7ae']);
  rack(p,root,[170,0,-166],['#262a32','#414550','#7d8389']);
  const chair=propGroup(root,[0,0,21]);
  p.oval(chair,[0,48,0],[22,4,21],'#292b36');
  p.box(chair,39,46,6,'#30333d',[0,67,-17]);
  p.tube(chair,[0,4,0],[0,49,0],3.7,'#626d77');
  p.oval(chair,[0,3,0],[21,2,17],'#67717d');
}

function boards(p:VideoProps,root:THREE.Group) {
  floor(p,root,'#272832');
  const panel=propGroup(root,[0,0,9]);
  p.box(panel,395,204,8,'#242833',[0,109,-38]);
  for(let i=0;i<35;i++){
    const x=(i%7-3)*52,y=27+Math.floor(i/7)*42;
    const image=propGroup(panel,[x,y,-32]);
    image.rotation.z=((i*11)%9-4)*.019;
    p.box(image,32,36,.9,i%3?'#c7c8c2':'#949ca0',[0,0,0]);
    p.oval(image,[0,11,.7],[3.0,4.4,.4],'#5f5457');
    p.box(image,11,13,.7,['#3b3d4a','#49454b','#c0b6aa'][i%3],[0,1,.75]);
    p.tube(image,[-3,-4,1],[-5,-15,1],1.7,'#423e49');
    p.tube(image,[3,-4,1],[5,-15,1],1.7,'#423e49');
    p.box(image,2.4,1.1,1,'#d3c275',[0,18,1.3]);
  }
}

function wings(p:VideoProps,root:THREE.Group) {
  floor(p,root,'#1e1f26');
  p.box(root,300,254,10,'#22252d',[0,126,-168]);
  p.box(root,90,196,8,'#393645',[0,98,-160]);
  p.box(root,15,224,10,'#343941',[-52,110,-149]);
  p.box(root,15,224,10,'#343941',[52,110,-149]);
  for(const side of [-1,1]){
    rack(p,root,[side*145,0,-88],['#44414c','#252a34','#a6a3ae','#d5d6ca']);
    p.box(root,64,37,53,'#5b5659',[side*121,19,27]);
  }
  const truss=p.ink(root);
  truss.begin();
  for(let i=0;i<9;i++){
    const x=i*33-132;
    p.line(truss,[[x,201,-133],[x+16,227,-133],[x+33,201,-133]],'#555764',1.5);
  }
  p.line(truss,[[-132,201,-133],[165,201,-133]],'#626675',2);
  truss.end();
}

function control(p:VideoProps,root:THREE.Group) {
  floor(p,root,'#151922');
  p.box(root,850,228,13,'#191d26',[0,114,-153]);
  p.box(root,191,11,55,'#43454c',[0,66,-37]);
  for(let i=0;i<7;i++){
    const x=(i%4-1.5)*52,y=i<4?147:197;
    p.box(root,49,34,4,'#29313d',[x,y,-126]);
    p.box(root,43,28,4,'#485d64',[x,y,-122]);
    p.box(root,7,25,1,'#a8bdba',[x,y,-119]);
    const pose=p.box(root,2.8,14,1,'#d9dad3',[x,y-1,-117]);
    pose.rotation.z=(i%3-1)*.22;
  }
  for(let i=0;i<26;i++){
    const x=(i%13-6)*7,z=-38+Math.floor(i/13)*8;
    p.box(root,3,2,3,['#a5a18a','#8c6170','#548b87','#65717e'][i%4],[x,73,z]);
  }
}

function finale(p:VideoProps,root:THREE.Group) {
  const edge=propGroup(root,[0,0,-87]);
  p.box(edge,116,5,570,'#dde0e1',[0,0,-285]);
  const end=p.box(edge,116,5,1.2,'#b0bbc1',[0,0,1]);
  end.rotation.x=-.04;
  return edge;
}

export function buildRunwaySets(p:VideoProps,scene:THREE.Scene) {
  const rooms={
    runway:propGroup(scene),vanity:propGroup(scene),boards:propGroup(scene),
    wings:propGroup(scene),control:propGroup(scene),void:propGroup(scene),black:propGroup(scene),
  };
  const {lamps,pools}=runway(p,rooms.runway);
  vanity(p,rooms.vanity);
  boards(p,rooms.boards);
  wings(p,rooms.wings);
  control(p,rooms.control);
  const edge=finale(p,rooms.void);
  return {rooms,lamps,pools,edge};
}
