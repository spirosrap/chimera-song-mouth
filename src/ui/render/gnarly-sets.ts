import * as THREE from 'three';
import {gnarlyState, type GnarlyRoom} from '../../scene/gnarly.ts';
import {VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';

const pink = '#ee447f';
const red = '#951d35';
const mint = '#9bf428';
const charcoal = '#161e28';
const cream = '#e7dbbc';
const blue = '#55ceff';
const letters: Record<string, string[]> = {
  G:['01111','10000','10111','10001','01110'], N:['10001','11001','10101','10011','10001'],
  A:['01110','10001','11111','10001','10001'], R:['11110','10001','11110','10010','10001'],
  L:['10000','10000','10000','10000','11111'], Y:['10001','01010','00100','00100','00100'],
};

function title(p:VideoProps, parent:THREE.Object3D, at:Point, unit:number) {
  const root = propGroup(parent, at);
  for (const [i,ch] of [...'GNARLY'].entries()) {
    const glyph = propGroup(root,[(i-2.5)*5.6*unit, (i%2-.5)*unit*.8,0]);
    glyph.rotation.z = -.08 + Math.sin(i*2.1)*.12;
    for (const [y,row] of letters[ch].entries()) {
      for (const [x,bit] of [...row].entries()) if (bit==='1')
        p.box(glyph,unit,unit,.9,mint,[(x-2)*unit,(2-y)*unit,0]);
    }
    p.oval(glyph,[(i%3-1)*unit,-2.65*unit,0],[.44*unit, .72*unit, .7],mint);
  }
  return root;
}

function transparent(mesh:THREE.Mesh, opacity:number) {
  const material = mesh.material as THREE.MeshBasicMaterial;
  material.transparent = true;
  material.opacity = opacity;
  material.depthWrite = false;
  return mesh;
}

function floor(p:VideoProps, room:THREE.Object3D, color:string, width=1450) {
  p.box(room,width,8,1550,color,[0,-4,-220]);
}

function roundedRect(w:number, h:number, r:number) {
  const s = new THREE.Shape();
  s.moveTo(-w/2+r,-h/2);
  s.lineTo(w/2-r,-h/2);
  s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  s.lineTo(w/2,h/2-r);
  s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
  s.lineTo(-w/2+r,h/2);
  s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
  s.lineTo(-w/2,-h/2+r);
  s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  return s;
}

function bezel(p:VideoProps, room:THREE.Object3D, w:number, h:number, rim:number,
  color:string, at:Point, corner=12) {
  const shape = roundedRect(w,h,corner);
  shape.holes.push(roundedRect(w-rim*2,h-rim*2,Math.max(2,corner-rim*.5)));
  return p.mesh(room,new THREE.ShapeGeometry(shape),at,color);
}

function traySet(p:VideoProps, room:THREE.Group) {
  p.mesh(room,new THREE.ShapeGeometry(roundedRect(156,95,14)),[0,169,4],'#902956');
  p.mesh(room,new THREE.ShapeGeometry(roundedRect(148,87,11)),[0,169,5],'#ac3364');
  for (const sign of [-1,1]) {
    const hair=p.oval(room,[sign*29,173,11],[29,34,5.1],sign===-1?'#2e2031':'#322137');
    hair.rotation.z=sign*.32;
  }
  bezel(p,room,161,99,7,pink,[0,169,21],15);
  bezel(p,room,151,91,2,'#f889ad',[0,169,22],13);
  const ribs = p.ink(room);
  ribs.begin();
  for (const y of [133,144,157,169,180,193,204]) {
    p.line(ribs,[[-73,y,6],[73,y,6]],'#cc507b',1.4);
  }
  ribs.end();
  const film = propGroup(room,[0,169,34]);
  transparent(p.mesh(film,new THREE.ShapeGeometry(roundedRect(160,98,14)),[0,0,0],'#fed7f3'),.055);
  const glare = p.ink(film);
  glare.begin();
  for (const s of [-1,1]) {
    p.line(glare,[[s*77,-39,1],[s*69,-45,1],[s*36,-47,1]],'#f8a6c9',2);
    p.line(glare,[[s*43,46,1],[s*71,43,1],[s*77,30,1]],'#ffc5da',1.8);
  }
  glare.end();
  const label = propGroup(film,[52,30,2]);
  label.rotation.z = -.1;
  p.mesh(label,new THREE.ShapeGeometry(roundedRect(38,20,3)),[0,0,0],'#f1dceb');
  for (let i=0;i<21;i++)
    p.box(label,i%3?.67:1.25,i%7===0?7:5,.5,charcoal,[-15+i*1.38,-3,.6]);
  for (const [x,y,w] of [[-6,5,19],[4,2,25],[13,-7,5]])
    p.box(label,w,.8,.42,'#9e718b',[x,y,.7]);
  const hand = propGroup(room,[81,125,47]);
  p.oval(hand,[7,5,0],[9,18,4],'#aa6e67');
  for (const [i,angle] of [-.68,-.43,-.24,.14].entries()) {
    const finger = p.tube(hand,[4+i*3,10,0],[4+i*3,30-i,1],2.6,'#c68c83');
    finger.rotateZ(angle);
    p.oval(hand,[2+i*3,32-i,1],[1.7,3.2,1.4],'#c9e981');
  }
  p.tube(hand,[8,-7,0],[20,-27,-2],6,'#b68077');
  return {film,hand};
}

function sandwich(p:VideoProps, parent:THREE.Object3D, at:Point, scale=1) {
  const g=propGroup(parent,at);
  g.scale.setScalar(scale);
  for (const [i,c] of ['#bc8647','#febc71','#7a3c2a','#e3a541','#65a244','#e87654','#e2c080'].entries()) {
    const h = i===0 || i===6 ? 4 : 2;
    const layer=p.box(g,34+i%2*3,h,26+i%3*1.5,c,[(i%3-1)*1.1,2+i*2.25,.5]);
    layer.rotation.y=Math.sin(i*1.3)*.11;
    if (i===4) {
      for (let j=0;j<13;j++) p.oval(g,[(j-6)*2.5,11.6,11+Math.cos(j*3)*1.3],
        [2.4,1,4.1],j%2?'#8ab93a':'#4f8d46');
    }
  }
  p.box(g,31,1.4,24,'#f2d590',[0,17.2,-.5]).rotation.y=.075;
  return g;
}

function boba(p:VideoProps, parent:THREE.Object3D, at:Point) {
  const g=propGroup(parent,at);
  p.mesh(g,new THREE.CylinderGeometry(8.8,7,22,18),[0,11,0],'#bc4569');
  p.mesh(g,new THREE.CylinderGeometry(9,9,1.7,18),[0,22,.1],'#ebb0c4');
  p.tube(g,[1,20,0],[4,36,0],1.6,'#ecbed3');
  for (let i=0;i<17;i++) {
    const a=i*.93;
    p.oval(g,[Math.cos(a)*7.25,3+i%4*1.9,Math.sin(a)*7.25],[1.5,1.5,1.5],'#473147');
  }
  return g;
}

function kitchenSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#cdd3ce');
  for (let row=0;row<13;row++) for (const x of [-267,267,0]) {
    const stripe = row%2===0 ? '#263239' : '#53626a';
    p.box(room,x===0?144:117,.6,20,stripe,[x,0,-551+88*row]);
  }
  p.box(room,850,349,8,'#24343d',[0,171,-253]);
  p.box(room,608,91,42,'#dfe4db',[65,196,-214]);
  p.box(room,608,58,18,'#acc8ca',[65,120,-223]);
  p.box(room,608,65,59,'#d5dbd8',[65,37,-206]);
  p.box(room,623,5.5,70,'#2e3a3c',[65,73,-200]);
  for(let i=0;i<11;i++) {
    const x=i*54-204;
    p.box(room,1,87,1,'#728583',[x,196,-191]);
    p.box(room,1,64,1,'#768688',[x,37,-175]);
  }
  const tile=p.ink(room);
  tile.begin();
  for(let i=0;i<22;i++) p.line(tile,[[i*29-250,90,-211],[i*29-250,141,-211]],'#3c5b64',.85);
  for(const y of [87,105,123,141]) p.line(tile,[[-247,y,-211],[373,y,-211]],'#3c5b64',.85);
  tile.end();
  for(const x of [-221,0,221]) p.box(room,154,3.2,10,'#b7edf3',[x,285,-116]);
  const fridge=propGroup(room,[-163,0,-118]);
  p.box(fridge,132,210,22,'#827e80',[0,108,-20]);
  p.box(fridge,126,193,3,'#a42634',[0,105,-7]);
  for(let i=0;i<9;i++) p.box(fridge,118,2.1,3,i%3?'#ba4450':'#e96d75',[0,18+i*22,-4]);
  const door=propGroup(fridge,[-63,106,4]);
  p.box(door,128,194,7,'#9fa9aa',[62,0,0]);
  p.box(door,2,194,1,'#606f78',[91,0,4.1]);
  p.box(door,4,52,8,'#d1dddd',[72,14,7]);
  const island=propGroup(room,[0,0,79]);
  p.box(island,306,78,86,'#d5d9d2',[0,40,0]);
  p.box(island,326,7,99,'#1d2f36',[0,82,0]);
  p.box(island,295,3,2,'#95a9a7',[0,71,44]);
  const board=propGroup(island,[40,87,14]);
  p.box(board,93,3,55,'#a37f61',[0,0,0]);
  for(let i=0;i<24;i++) {
    const x=-45+i*3.94;
    p.box(board,1.1+i%4*.24,.4,54,i%3?'#bf9e7c':'#d7ba94',[x,1.66,0]);
  }
  const stack=sandwich(p,board,[0,2.1,0],1.22);
  const ingredient=propGroup(island,[-52,88,10]);
  for(const [i,c] of ['#d65891','#5c7ead','#af76ad'].entries()) {
    const a=i*31-26;
    p.mesh(ingredient,new THREE.ShapeGeometry(roundedRect(29,24,4)),[a,1,0],c).rotation.x=-Math.PI/2;
    for(let j=0;j<5;j++) p.oval(ingredient,[a+Math.sin(j*2.4)*8,2,Math.cos(j*2.4)*6],
      [3.6,1.45,3.1],i===2?'#ad7043':'#dba399');
  }
  const pan=propGroup(room,[89,90,44]);
  p.box(pan,112,8,71,'#2d3e43',[0,-7,-6]);
  p.mesh(pan,new THREE.CylinderGeometry(26,23,4,32),[0,0,0],'#7a8589');
  p.mesh(pan,new THREE.CylinderGeometry(22,22,.6,32),[0,2.2,0],'#343b43');
  p.tube(pan,[21,1,-10],[54,7,-25],3.1,'#263038');
  for(const x of [-10,10]) {
    p.oval(pan,[x,3,4],[9.4,.8,8.7],'#f3e1b9');
    p.oval(pan,[x,4.1,4],[4.7,1.9,4.7],'#ee9834');
  }
  const reach=propGroup(board,[-16,16,8]);
  p.tube(reach,[-24,52,-15],[-5,9,0],6,'#d9c8b1');
  p.oval(reach,[0,5,2],[9,4.2,7.6],'#b88877');
  for (let i=0;i<4;i++) {
    const x=(i-1.5)*3.6;
    p.tube(reach,[x,5,2],[x+1,2,13-i*.82],1.8,'#cfa68f');
    p.oval(reach,[x+1,2.8,13-i*.82],[1.4,.7,2.6],i%2?'#d38aa5':'#a5c47e');
  }
  const endTitle=title(p,board,[2,35,5],3.1);
  return {island,stack,door,ingredient,pan,reach,endTitle};
}

function corridorSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#6d1529',1150);
  p.box(room,520,284,5,'#a82749',[0,140,-495]);
  for(const s of [-1,1]) {
    p.box(room,7,286,550,'#812035',[s*246,143,-227]);
    for(let row=0;row<7;row++) {
      p.box(room,6,5,551,row%2?'#b72847':'#be3f64',[s*240,25+row*36,-227]);
    }
    p.box(room,2,3,570,'#f67293',[s*225,260,-208]);
    p.box(room,13,2,530,'#ad5167',[s*206,7,-228]);
  }
  p.box(room,338,7,495,'#d75072',[0,275,-237]);
  for(let i=0;i<13;i++) {
    p.box(room,305,3,11,i%3?'#e0708c':'#fcc6c9',[0,270,-473+i*40]);
    p.box(room,416,.7,2,'#ad4e63',[0,.5,-464+i*40]);
  }
  p.box(room,78,236,5,'#e64c77',[0,117,-487]);
}

function audience(p:VideoProps, room:THREE.Group, club:boolean) {
  const group=propGroup(room);
  const arms:THREE.Group[]=[];
  const lights:THREE.Mesh[]=[];
  for(let i=0;i<24;i++) {
    const s=i%2?1:-1;
    const j=Math.floor(i/2);
    const x=s*(219+j%3*33+(club?17:0));
    const z=201-j*49;
    const g=propGroup(group,[x,0,z]);
    g.rotation.y=-s*.5;
    const tone=['#926963','#c39281','#83675f','#d0a695'][j%4];
    const coat=i%3?'#242b35':'#343441';
    p.oval(g,[0,95,0],[22,45,12],coat);
    p.oval(g,[0,142,0],[14.5,19,15.1],tone);
    p.oval(g,[0,151,-2],[15.2,12,14.6],'#29262d');
    if(!club) {
      p.box(g,11,22,2.6,'#b5c2bb',[0,123,10]);
      p.box(g,4,26,2.8,'#3b4756',[.4,123,12]);
    }
    const arm=propGroup(g,[s*14,117,8]);
    p.tube(arm,[0,0,0],[-s*11,12,10],4.6,coat);
    p.tube(arm,[-s*11,12,10],[-s*13,29,14],3.4,tone);
    if (club) {
      bezel(p,arm,12,20,1.7,'#8c9ba9',[-s*15,35,15],2.6);
      p.box(arm,9,16,1.1,'#47767d',[-s*15,35,14.8]);
    } else {
      p.box(arm,19,13,7,'#333b42',[-s*13,32,16]);
      const lens=p.mesh(arm,new THREE.CylinderGeometry(5.5,6.1,10,13),[-s*13,32,22],'#71838e');
      lens.rotation.x=Math.PI/2;
    }
    lights.push(p.box(arm,club?5:9,club?10:5,1.2,club?'#7fb2d2':'#e1ece3',[-s*13,club?35:40,club?16:22]));
    arms.push(arm);
  }
  return {group,arms,lights};
}

function clubSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#111920');
  p.box(room,422,6,274,'#6ab83c',[0,3,-25]);
  const panels = [];
  const ceiling = propGroup(room);
  for(let row=0;row<6;row++) for(let i=0;i<8;i++){
    const c=(row+i)%3;
    panels.push(p.box(room,50,1.5,40,['#71c92f','#a6dd49','#50a446'][c],[(i-3.5)*51,7,-136+row*44]));
    p.box(ceiling,44,2.8,31,['#38a552','#78d17f','#dde4b3'][c],[(i-3.5)*52,252,-155+row*50]);
  }
  for(const s of [-1,1]) p.box(room,14,270,16,'#a83942',[s*206,135,-190]);
  p.box(room,580,310,6,'#131922',[0,155,-246]);
  const crowd=audience(p,room,true);
  const phone=propGroup(room,[64,145,171]);
  p.box(phone,38,61,6.8,'#343c53',[0,0,0]);
  p.box(phone,31,48,1.4,'#376d5c',[0,2,4.0]);
  for(const y of [-13,1,15]) p.box(phone,29,2,1,'#6ed360',[0,y,4.8]);
  for(const s of [-1,1]) p.oval(phone,[s*22,-10,1],[6,15,5],'#8c6f63');
  const lift=propGroup(room,[0,0,55]);
  for(const [i,x] of [-94,-61,-31,20,62,89].entries()){
    const z=i%2*29-10;
    p.tube(lift,[x,69,z],[x+12,122,z],5.5,'#263443');
    p.oval(lift,[x+13,124,z],[6.3,7,5.2],i%2?'#b78475':'#84665b');
  }
  return {crowd,phone,lift,panels,ceiling};
}

function limoBody(p:VideoProps, parent:THREE.Object3D, at:Point, long=true) {
  const car=propGroup(parent,at);
  const length=long?280:156;
  p.box(car,length,41,78,'#cacfc1',[0,48,0]);
  p.box(car,length-27,16,69,'#bac5b9',[1,70,-1]);
  p.box(car,length-54,27,65,'#20334a',[4,79,-1]);
  p.box(car,length-57,7,67,'#b5bdb4',[4,96,-1]);
  for(const x of [-length*.27,0,length*.27])
    p.box(car,4,26,2,'#afbab8',[x,79,33.0]);
  for(const x of [-length*.37,length*.37]) for(const z of [-37,37]){
    const wheel=p.mesh(car,new THREE.CylinderGeometry(21.5,21.5,14,23),[x,23,z],'#18242c');
    wheel.rotation.x=Math.PI/2;
    const hub=p.mesh(car,new THREE.CircleGeometry(10.8,15),[x,23,z+Math.sign(z)*7.11],'#8b9a9a');
    hub.rotation.y=z<0?Math.PI:0;
  }
  for(const z of [-23,23]) p.box(car,3,12,17,'#ffe8aa',[length*.5+1,51,z]);
  p.box(car,2.5,16,54,'#777e7b',[length*.5+1.2,39,0]);
  for(let i=0;i<6;i++)p.box(car,.65,13,1.76,'#2b3536',[length*.5+2.9,39,(i-2.5)*6]);
  p.box(car,length-17,3,3,'#686c69',[0,45,40]);
  const door=propGroup(car,[length*.18,58,39]);
  p.box(door,54,38,4,'#c6cbbb',[-23,-3,0]);
  p.box(door,49,23,3.3,'#2e4656',[-22,25,0]);
  p.box(door,7,2,1,'#464c53',[-38,10,2.5]);
  return {car,door};
}

function streetSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#252b34');
  p.box(room,1120,310,7,'#25303b',[0,151,-368]);
  const windows=propGroup(room);
  for(let i=0;i<18;i++) {
    const x=-474+i*58;
    const h=73+(i*31)%207;
    p.box(windows,48,h,39,i%3?'#273844':'#404350',[x,h/2,-318]);
    for(let row=0;row<h/22-1;row++) for(let col=0;col<3;col++) {
      if((i+row+col)%4===0)continue;
      p.box(windows,5,8,1.4,(i+row)%5?'#6d8795':'#bba681',[x+(col-1)*11,18+row*20,-297]);
    }
  }
  for(let i=0;i<12;i++)p.box(room,40,.8,2.2,'#b6a158',[-371+i*71,.5,56]);
  return {...limoBody(p,room,[0,0,-14]),windows};
}

function limoSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#163147',760);
  p.box(room,538,242,10,'#1a385c',[0,122,-274]);
  p.box(room,492,75,11,'#6192b5',[0,179,-262]);
  for(const s of [-1,1]) {
    p.box(room,14,94,360,'#21344c',[s*235,52,-85]);
    p.box(room,12,77,321,'#223d66',[s*232,161,-79]);
    p.box(room,3,3,339,'#7652b9',[s*224,116,-82]);
    p.box(room,8,2.6,367,blue,[s*214,227,-94]);
    p.box(room,43,33,305,'#364968',[s*178,61,-98]);
    p.box(room,14,70,305,'#34405c',[s*205,92,-98]);
  }
  p.box(room,106,2,337,'#315477',[0,245,-104]);
  for(let i=0;i<8;i++)p.box(room,71,2.2,32,i%2?'#55d1f4':'#3196be',[0,242,-253+i*40]);
  p.box(room,322,53,31,'#3a4a65',[0,78,-219]);
  p.box(room,317,38,5,'#3f87b8',[0,164,-252]);
  const cup=boba(p,room,[35,106,98]);
  const laptop=propGroup(room,[64,80,98]);
  p.box(laptop,66,4,40,'#9199b7',[0,0,0]);
  for(let i=0;i<48;i++)p.box(laptop,4,.7,2.8,i%7?'#414c69':'#62bef0',[(i%12-5.5)*4.6,2.3,7-Math.floor(i/12)*5]);
  const screen=p.box(laptop,66,37,4,'#374c67',[0,18,-16]);
  screen.rotation.x=-.15;
  for(let i=0;i<8;i++)p.box(laptop,30+i%3*6,1.1,1.4,i%2?'#6cc9ed':'#b083cf',[-7,10+i*2.5,-12-(i*.33)]);
  return {cup,laptop};
}

function houseSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#e0c9a4');
  p.box(room,805,340,9,'#decab0',[0,167,-227]);
  p.box(room,213,309,9,'#88442c',[-197,153,-212]);
  p.box(room,388,131,7,'#d2a166',[143,158,-214]);
  p.box(room,381,58,6,'#758979',[143,131,-207]);
  for(const x of [-50,143,332])p.box(room,3,131,3,'#eee1c7',[x,157,-200]);
  for(let i=0;i<7;i++)p.box(room,388,3.2,3,'#e2ccb0',[143,97+i*21,-203]);
  p.box(room,171,30,68,'#ac693e',[105,33,-121]);
  p.box(room,172,36,25,'#b1724e',[105,56,-142]);
  for(const [i,c] of ['#a45842','#bb9061','#d0a773'].entries())
    p.oval(room,[55+i*42,55,-116],[19,10,19],c);
  p.oval(room,[26,43,-47],[58,9,32],'#f7dbad');
  p.tube(room,[26,4,-47],[26,42,-47],6,'#725346');
  const crashWall=propGroup(room,[99,66,-198]);
  const fracture=new THREE.Shape();
  fracture.moveTo(-78,-53);
  for (const [x,y] of [[-79,22],[-63,68],[-36,66],[-18,89],[22,68],[69,72],[76,37],[108,22],[92,-61],[24,-64]])
    fracture.lineTo(x,y);
  fracture.closePath();
  p.mesh(crashWall,new THREE.ShapeGeometry(fracture),[0,0,0],'#5c443c');
  for (let i=0;i<12;i++) {
    const side=i%2?-1:1;
    const plank=p.box(crashWall,11+i%4,17+i%7*6,4,'#b28c70',[side*(69+i%3*9),i*9-47,4]);
    plank.rotation.z=side*(.48+i%4*.26);
  }
  const crash=limoBody(p,room,[99,0,-85],false);
  crash.car.rotation.y=-1.33;
  const debris=propGroup(room,[100,6,-39]);
  for(let i=0;i<34;i++){
    const x=Math.sin(i*2.4)*(13+i*3.6),z=Math.cos(i*2.4)*(11+i*2.1);
    const d=p.box(debris,6+i%7*2,4+i%4,6+i%5*1.6,i%3?'#b99774':'#d9bc8d',[x,3+(i%3),z]);
    d.rotation.set(i*.51,i*.74,.24);
  }
  const tv=propGroup(room,[-110,158,19]);
  p.box(tv,139,88,12,'#454457',[0,0,-12]);
  bezel(p,tv,139,88,9,'#29313b',[0,0,3],14);
  bezel(p,tv,125,74,3,'#98a4a0',[0,0,4],11);
  const scan = p.ink(tv);
  scan.begin();
  for(let j=0;j<22;j++)p.line(scan,[[-58,34-j*3.2,.75],[58,34-j*3.2,.75]],'#6d7778',.4);
  scan.end();
  const flash=transparent(p.box(tv,8,73,1,'#ffd9a9',[0,0,10]),.26);
  const slime=propGroup(room,[98,76,54]);
  const strands=p.ink(slime);
  strands.begin();
  for(let i=0;i<16;i++) {
    const x=6*(i/15-.5);
    const points=Array.from({length:23},(_,j)=>[x+Math.sin(j*.47+i)*6,99-j*4.1,Math.cos(j*.24+i)*6] as Point);
    p.line(strands,points,i%3?'#dd6896':'#ff91c0',3+i%2);
    p.oval(slime,[x+Math.sin(i*4)*21,9+i%7*3.3,4],[3.5,3+i%4,2.0],i%4?'#b05683':'#8cce8b');
  }
  strands.end();
  return {crash,debris,crashWall,tv,flash,slime};
}

function hillsSet(p:VideoProps, room:THREE.Group) {
  p.box(room,1960,620,4,'#d99870',[0,224,-650]);
  p.mesh(room,new THREE.CircleGeometry(41,42),[131,254,-637],'#efca8b');
  for(let row=0;row<4;row++){
    const terrain=new THREE.Shape();
    terrain.moveTo(-940,-170);
    for(let i=0;i<58;i++){
      const x=-940+i*34;
      terrain.lineTo(x,69+row*28+Math.sin(i*.31+.4*row)*52+Math.sin(i*.91+row)*23);
    }
    terrain.lineTo(998,-170);
    p.mesh(room,new THREE.ShapeGeometry(terrain),[0,-row*34,-538+row*54],['#9e7354','#886043','#6e664f','#3e5350'][row]);
  }
  const letters=title(p,room,[0,124,-218],7.4);
  letters.traverse(o=>{
    if(o instanceof THREE.Mesh)(o.material as THREE.MeshBasicMaterial).color.set('#d0ba92');
  });
}

function carpetSet(p:VideoProps, room:THREE.Group) {
  floor(p,room,'#191b22');
  p.box(room,332,1.2,885,'#a4203b',[0,.7,-80]);
  for(const s of [-1,1]){
    p.box(room,7,1.2,886,'#db7b93',[s*163,1.6,-78]);
    for(let i=0;i<10;i++){
      const z=225-i*60;
      p.tube(room,[s*188,0,z],[s*188,66,z],1.9,'#c48d75');
      p.oval(room,[s*188,68,z],[3.8,4,3.8],'#ead2a0');
      if(i<9)p.tube(room,[s*188,63,z],[s*188,63,z-60],2.25,'#ac3b55');
    }
  }
  const crowd=audience(p,room,false);
  const runwayLight=propGroup(room,[0,265,-220]);
  p.box(runwayLight,84,4,15,'#b5b9b8',[0,0,0]);
  const table=propGroup(room,[0,0,92]);
  p.box(table,255,78,76,'#ccc4b0',[0,40,0]);
  p.box(table,261,3,80,'#e3dfcb',[0,80,0]);
  p.box(table,235,1.3,24,'#ae3d4f',[0,82,3]);
  for(const x of [-83,0,83]){
    p.mesh(table,new THREE.CylinderGeometry(24,24,1.2,28),[x,83,0],'#ebdac3');
    sandwich(p,table,[x,84,3],.86);
    p.mesh(table,new THREE.CylinderGeometry(3.8,3,8,13),[x+24,87,-16],'#9c9a93');
  }
  const utensil=propGroup(table,[3,104,4]);
  p.box(utensil,48,2,9,'#b7c2c0',[0,0,0]);
  p.box(utensil,25,4,9,'#333a44',[35,0,0]);
  const bug=propGroup(table,[0,101,5]);
  p.oval(bug,[0,0,0],[4,2.8,2.6],'#42332c');
  for(const s of [-1,1]) {
    p.oval(bug,[s*2.5,1,1],[2.1,.8,3.4],'#858178');
    p.tube(bug,[s*1,0,1],[s*5,-.4,4],.4,'#4d3a31');
  }
  const pressCamera=propGroup(room,[142,145,143]);
  p.box(pressCamera,49,32,29,'#343b4c',[0,0,0]);
  p.mesh(pressCamera,new THREE.CylinderGeometry(15,17,20,26),[0,1,22],'#656e7e').rotation.x=Math.PI/2;
  p.mesh(pressCamera,new THREE.CircleGeometry(12,24),[0,1,32.4],'#324657');
  const bulb=p.box(pressCamera,34,15,7,'#e0ecea',[-6,23,13]);
  return {crowd,table,utensil,bug,pressCamera,bulb};
}

function bladeSet(p:VideoProps, room:THREE.Group) {
  p.box(room,730,500,4,'#631a30',[0,173,-225]);
  const blade=new THREE.Shape();
  blade.moveTo(-93,-33);
  blade.lineTo(93,-32);
  blade.quadraticCurveTo(135,-25,157,21);
  blade.lineTo(-88,42);
  blade.closePath();
  const plate=p.mesh(room,new THREE.ShapeGeometry(blade),[0,158,6],'#8c9caa');
  plate.rotation.z=.49;
  const middle=p.mesh(room,new THREE.ShapeGeometry(blade),[0,158,7],'#aec1cb');
  middle.rotation.z=.49;
  middle.scale.set(.91,.73,1);
  p.box(room,115,43,7,'#212a35',[-104,91,5]).rotation.z=.49;
  const ink=p.ink(room);
  ink.begin();
  p.line(ink,[[-83,92,8],[-64,107,8],[-22,129,8],[77,187,8],[125,221,8]],'#e5edef',3.5);
  ink.end();
}

export function buildGnarlySets(p:VideoProps, scene:THREE.Scene) {
  const rooms:Record<GnarlyRoom,THREE.Group>={
    tray:propGroup(scene),kitchen:propGroup(scene),corridor:propGroup(scene),
    booth:propGroup(scene),club:propGroup(scene),street:propGroup(scene),
    limo:propGroup(scene),house:propGroup(scene),hills:propGroup(scene),
    carpet:propGroup(scene),blade:propGroup(scene),card:propGroup(scene),
  };
  const tray=traySet(p,rooms.tray);
  const kitchen=kitchenSet(p,rooms.kitchen);
  corridorSet(p,rooms.corridor);
  p.mesh(rooms.booth,new THREE.CircleGeometry(49,38),[-76,152,-46],'#a22c46');
  const club=clubSet(p,rooms.club);
  const street=streetSet(p,rooms.street);
  const limo=limoSet(p,rooms.limo);
  const house=houseSet(p,rooms.house);
  hillsSet(p,rooms.hills);
  const carpet=carpetSet(p,rooms.carpet);
  bladeSet(p,rooms.blade);
  const card=title(p,rooms.card,[0,162,0],5.6);
  p.mesh(rooms.card,new THREE.TorusGeometry(31,.8,5,44),[0,112,0],mint);

  function update(s:ReturnType<typeof gnarlyState>) {
    for(const [name,room] of Object.entries(rooms))room.visible=s.room===name;
    tray.hand.visible=s.view==='gnarly-wrapper';
    const peel=Math.min(1,Math.max(0,(s.t-3.42)/1.6));
    tray.film.rotation.y=-peel*.6;
    tray.film.position.x=peel*17;
    tray.hand.rotation.z=-.3+peel*.62;

    const counter=/prep|ingredients|sandwich|counter-hands|bite|^gnarly-kitchen$|kitchen-pair/.test(s.view);
    kitchen.island.visible=counter;
    kitchen.pan.visible=s.view==='gnarly-eggs';
    kitchen.endTitle.visible=s.view==='gnarly-end-sandwich';
    kitchen.ingredient.visible=s.view!=='gnarly-end-sandwich';
    kitchen.reach.visible=/prep|counter-hands|end-sandwich/.test(s.view);
    kitchen.reach.position.y=16+Math.sin(s.t*7)*4;
    kitchen.reach.rotation.y=.2*Math.sin(s.t*3.2);
    kitchen.door.rotation.y=s.view==='gnarly-fridge'?-.38-Math.min(1,Math.max(0,s.t-27.49))*.93:0;
    kitchen.stack.rotation.y=.12*Math.sin(s.beat*Math.PI*.5);
    const isCrowd=s.formation==='crowd' || s.formation==='lift';
    club.crowd.group.visible=isCrowd || s.view==='gnarly-audience';
    club.phone.visible=s.view==='gnarly-phone';
    club.lift.visible=s.view==='gnarly-crowd-surf';
    club.ceiling.visible=s.view!=='gnarly-club-above';
    for(const [i,panel] of club.panels.entries())
      (panel.material as THREE.MeshBasicMaterial).color.set((Math.floor(s.beat)+i)%7===0?'#b6ed7b':i%3===0?'#67c44d':'#419743');

    street.door.rotation.y=s.view==='gnarly-carpet-door' || s.view==='gnarly-limo-door'?-.92:0;
    street.car.position.x=s.view==='gnarly-limo-road'?29*Math.sin(s.t*1.2):s.view==='gnarly-carpet-door'?-51:0;
    street.car.rotation.y=s.view==='gnarly-limo-road'?.25:-.12;
    street.windows.position.x=s.view==='gnarly-limo-road'?49*Math.sin(s.t*.65):0;
    limo.cup.visible=s.view==='gnarly-boba'||s.view==='gnarly-limo-duo';
    limo.cup.rotation.z=.09*Math.sin(s.t*6);
    limo.laptop.visible=s.view==='gnarly-laptop';
    house.tv.visible=s.view==='gnarly-screen';
    house.flash.position.x=(s.t*44%132)-66;
    house.crash.car.visible=s.view==='gnarly-crash' || s.view==='gnarly-mansion-face';
    house.crash.car.position.z=s.view==='gnarly-crash'?-86+Math.min(1,Math.max(0,s.t-s.cut))*16:-70;
    house.crashWall.visible=house.debris.visible=house.crash.car.visible;
    house.slime.visible=s.view==='gnarly-slime';
    house.slime.position.y=76+Math.sin(s.t*7)*4;

    carpet.table.visible=s.view==='gnarly-banquet'||s.view==='gnarly-slice';
    carpet.utensil.visible=carpet.bug.visible=s.view==='gnarly-slice';
    carpet.utensil.rotation.z=.1*Math.sin(s.t*4);
    carpet.pressCamera.visible=s.view==='gnarly-camera';
    const shutter=Math.pow(Math.max(0,Math.sin(s.beat*Math.PI*2)),10);
    (carpet.bulb.material as THREE.MeshBasicMaterial).color.set(shutter>.5?'#e6f7ed':'#688198');
    carpet.crowd.group.visible=isCrowd || s.view==='gnarly-runway';
    for(const bank of [club.crowd,carpet.crowd]){
      if(!bank.group.visible)continue;
      for(const [i,arm] of bank.arms.entries()){
        arm.rotation.z=Math.sin(s.beat*Math.PI+i*.8)*.39;
        arm.rotation.x=Math.cos(s.beat*Math.PI*.5+i*.54)*.19;
        (bank.lights[i].material as THREE.MeshBasicMaterial).color.set(
          Math.sin(s.beat*Math.PI*2+i*1.19)>.94?'#e0f3f3':'#52697a');
      }
    }
    card.rotation.z=Math.sin(s.t*3)*.012;
  }
  return {rooms,tray,kitchen,club,street,limo,house,carpet,card,update};
}
