import * as THREE from 'three';
import {houseTourState, type TourRoom} from '../../scene/house-tour.ts';
import {VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';
import {chandelier,chassis,creamPhone,necklace,palm,tickGlass,tourLabel,wash} from './house-tour-props.ts';

const brass='#ba9158';
const wood='#8a5c42';
const cream='#e3cfaa';
const rose='#dc7fb1';

function ground(p:VideoProps,g:THREE.Object3D,color:string,y=-4) {
  p.box(g,1460,8,1320,color,[0,y,-259]);
}
function lamp(p:VideoProps,root:THREE.Object3D,at:Point,color=cream) {
  const g=propGroup(root,at);
  p.tube(g,[0,0,0],[0,32,0],2,brass);
  p.oval(g,[0,1,0],[11,2,10],brass);
  p.mesh(g,new THREE.CylinderGeometry(11,18,21,18,1,true),[0,32,0],color);
  return g;
}
function plant(p:VideoProps,root:THREE.Object3D,at:Point,h=91) {
  const g=propGroup(root,at);
  p.mesh(g,new THREE.CylinderGeometry(15,12,29,17),[0,14,0],'#765e43');
  palm(p,g,[0,23,0],h,'#6a815c');
}
function linen(p:VideoProps,g:THREE.Object3D,at:Point,w:number,h:number,d:number,c:string) {
  p.box(g,w,h,d,c,at);
  p.oval(g,[at[0],at[1]+h*.28,at[2]],[w*.51,h*.46,d*.51],c);
}
function frameArt(p:VideoProps,room:THREE.Object3D,at:Point,w:number,h:number) {
  const frame=propGroup(room,at);
  p.box(frame,w+8,h+8,4,brass,[0,0,0]);
  p.box(frame,w+1,h+1,3,'#685747',[0,0,3.2]);
  p.box(frame,w,h,2,'#423d48',[0,0,5.1]);
  for(let i=0;i<21;i++){
    const a=i*2.39996;
    p.oval(frame,[Math.sin(a)*w*.27,Math.cos(a)*h*.32,6.3],[3+i%6,4+i%7,.6],
      ['#736755','#83a292','#c0a88b','#b5826f'][i%4]);
  }
  return frame;
}
function lightStrip(p:VideoProps,room:THREE.Object3D,at:Point,w:number,color='#e6bc6b') {
  p.box(room,w,3.2,7,color,at);
}
function woodenWall(p:VideoProps,room:THREE.Object3D) {
  p.box(room,920,345,8,wood,[0,173,-239]);
  for(let x=-436;x<440;x+=46)p.box(room,1.5,339,2,'#61453c',[x,171,-233]);
  lightStrip(p,room,[0,299,-226],907);
  p.box(room,914,30,8,'#615044',[0,22,-227]);
}
function dashSky(p:VideoProps,room:THREE.Object3D,depth:number) {
  p.box(room,1580,490,3,'#253e61',[0,222,depth]);
  for(let i=0;i<65;i++){
    const x=-522+i*17;
    const h=7+i*23%38;
    p.box(room,12+(i%4)*3,h,2,i%3?'#303c59':'#355374',[x,51+h/2,depth+3]);
    for(let j=0;j<4;j++){
      if((i+j)%5<2)continue;
      p.box(room,1.8,1.65,.5,['#acd0d4','#d2bd89','#807fa4'][i%3],[x+j*2.8-4,58+(i+j)*4%h,depth+5]);
    }
  }
}

function driveSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#35404c');
  p.box(room,813,278,8,'#263639',[0,134,-285]);
  for(let i=0;i<7;i++){
    const x=(i-3)*98;
    p.box(room,80,76,4,'#344b4d',[x,178,-277]);
    p.box(room,70,60,4,i%2?'#4a6a7b':'#263c4c',[x,180,-273]);
    p.box(room,3,74,4,'#58716d',[x,178,-271]);
  }
  p.box(room,693,26,3,'#475053',[0,116,-267]);
  for(const s of [-1,1])for(let i=0;i<9;i++){
    const x=s*(199+i*21),z=-250+i*39;
    p.oval(room,[x,36+i%3*21,z],[31+i%4*7,35+i%4*6,39],i%2?'#263f34':'#304c40');
    p.box(room,22,4,20,'#97a596',[s*156,1,z]);
  }
  p.box(room,330,8,14,'#475354',[0,4,-145]);
  const van=chassis(p,room,[4,0,-10],'van');
  const shoes=propGroup(room,[73,2,86]);
  const shoeColors=['#e4d5c9','#a34362','#832c44'];
  const shoeSteps=shoeColors.map((color,i)=>{
    const foot=propGroup(shoes,[0,0,0]);
    p.oval(foot,[0,i===1?4.2:7,7],[8,4.9,16],i===1?'#bc9683':color);
    if(i!==1)p.box(foot,4.2,16,3,color,[0,9,-9]).rotation.x=-.12;
    p.oval(foot,[0,31,0],[6.5,27,5.7],['#ac7f75','#bc9683','#bf8d80'][i]);
    return foot;
  });
  const title=tourLabel(p,room,'HOUSE TOUR',[75,46,93],2.75,rose);
  const underline=p.ink(title);
  underline.begin();
  p.line(underline,[[-60,-13,1],[-33,-14.6,1],[5,-14.4,1],[48,-12,1],[63,-8.3,1]],'#c870a5',2);
  underline.end();
  const escapeCue=tourLabel(p,room,'HOUSE TOUR',[0,176,-40],5.8,'#db9dbb');
  const beacon=wash(p.oval(room,[0,2,-1],[164,2.7,134],'#a33d62'),.18);
  return {van,shoes,shoeSteps,title,escapeCue,beacon};
}

function passageSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#4b4e4c');
  p.box(room,537,315,9,'#4a5350',[0,156,-282]);
  for(const s of [-1,1]){
    p.box(room,8,286,406,'#475652',[s*225,140,-108]);
    for(let row=0;row<8;row++)for(let col=0;col<12;col++)
      p.box(room,2.4,27+((row+col)%3)*3,31,'#56645d',[s*219,18+row*34,-292+col*31+(row%2)*9]);
    for(let i=0;i<4;i++)lamp(p,room,[s*204,126,-227+i*78],i%2?'#d8bc89':'#c3b192');
    palm(p,room,[s*194,0,-101],122,'#587a67');
  }
  p.box(room,143,226,9,'#665449',[0,112,-259]);
  const door=propGroup(room,[-67,0,-247]);
  p.box(door,132,221,7,'#432f30',[65,111,0]);
  p.box(door,109,194,2,'#523338',[65,111,4.4]);
  p.box(door,3,210,1.1,'#806d54',[127,112,5]);
  p.oval(door,[114,95,7],[4.1,6.3,3],brass);
  const painting=frameArt(p,room,[-124,159,-191],53,73);
  const spotlight=wash(p.mesh(room,new THREE.CircleGeometry(101,35),[-35,162,-185],'#bcd3dd'),.15);
  return {door,painting,spotlight};
}

function loungeSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#a48b6d');
  woodenWall(p,room);
  p.box(room,494,161,6,'#4f4c42',[-87,126,-222]);
  const weave=p.ink(room);
  weave.begin();
  for(let i=0;i<24;i++)for(let j=0;j<6;j++){
    const x=-308+i*19,y=66+j*24;
    p.line(weave,[[x-8,y,-216],[x,y+7,-216],[x+8,y,-216],[x,y-7,-216]],'#77725d',.84,true);
  }
  weave.end();
  p.oval(room,[0,1,-2],[188,1.4,137],'#8b4d4d');
  p.oval(room,[0,2,-3],[164,.55,119],'#ac655d');
  for(let i=0;i<9;i++){
    const a=(i-4)*.235;
    const x=Math.sin(a)*192,z=-157+Math.cos(a)*62;
    const c=i%3?'#c09c76':'#bc785d';
    const sofa=propGroup(room,[x,0,z]);
    sofa.rotation.y=-a;
    linen(p,sofa,[0,22,0],51,31,50,c);
    linen(p,sofa,[0,42,-16],52,29,17,'#cfa982');
    p.oval(sofa,[9,40,1],[12,10,9],['#b97d6c','#dacba9','#a36f60'][i%3]);
  }
  p.oval(room,[0,30,45],[68,8,36],'#6a4a41');
  p.tube(room,[0,4,45],[0,28,45],9,'#66534b');
  tickGlass(p,room,[-26,38,53]);
  tickGlass(p,room,[34,38,56]);
  for(const s of [-1,1]){
    plant(p,room,[s*225,0,-112],100);
    lamp(p,room,[s*179,57,-115]);
  }
  const crystal=chandelier(p,room,[-8,257,-86],1.2);
  p.tube(room,[21,266,-31],[21,237,-31],1.8,brass);
  const discoBall=propGroup(room,[21,224,-31]);
  p.oval(discoBall,[0,0,0],[16.1,16.1,16.1],'#99a9bc');
  for(let i=0;i<58;i++){
    const dy=(i%13-6)*2.37,theta=i*2.4;
    const rr=Math.sqrt(Math.max(0,17*17-dy*dy));
    const facet=p.box(discoBall,2.4,2.4,1.8,i%3?'#dcd6f6':'#9f84c8',
      [rr*Math.cos(theta),dy,rr*Math.sin(theta)]);
    facet.rotation.y=theta;
  }
  const lightSpots:THREE.Mesh[]=[];
  for(let i=0;i<28;i++)lightSpots.push(wash(p.oval(room,[0,3,0],
    [4+i%3,1.1,6+i%4],['#a090d8','#6a9ac9','#e2a6cf'][i%3]),.65));
  const rug=propGroup(room,[0,2,22]);
  p.oval(rug,[0,.4,0],[107,.8,74],'#c5a778');
  for(let i=0;i<156;i++){
    const a=i*2.399963,r=Math.sqrt(i/156);
    p.oval(rug,[Math.cos(a)*98*r,1.4,Math.sin(a)*67*r],[2+i%4,.15,2+i%3],i%3?'#54453b':'#87705d');
  }
  const pup=propGroup(room,[43,0,88]);
  p.oval(pup,[4,20,-8],[13,12,17],'#a98165');
  const head=propGroup(pup,[-3,30,7]);
  p.oval(head,[0,0,3],[10,10,10],'#c4a17d');
  p.oval(head,[0,-4,10],[6.6,4.5,6.4],'#dfc4a0');
  p.oval(head,[0,-2,15],[3,2,1.4],'#473b3d');
  for(const s of [-1,1]){
    p.oval(head,[s*8,-2,1],[3.7,10.5,3.6],'#94715e');
    p.oval(head,[s*4,2.7,10.2],[1.45,1.78,.75],'#403a41');
  }
  for(const x of [-5,9])p.oval(pup,[x,5,6],[4,5,6],'#b99572');
  const candles=propGroup(room,[3,102,52]);
  const flames:THREE.Mesh[]=[];
  for(const [i,x] of [-9,1,11].entries()){
    p.tube(candles,[x,0,0],[x,15+i*3,0],1.36,'#d5bb98');
    flames.push(p.oval(candles,[x,18+i*3,0],[2.55,4.5,2.1],'#f8d07d'));
  }
  return {crystal,discoBall,lightSpots,rug,pup,head,candles,flames};
}

function kitchenSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#a78a6b');
  woodenWall(p,room);
  const panels=propGroup(room,[53,155,-139]);
  p.box(panels,270,150,5,'#d69a59',[0,0,0]);
  for(let i=0;i<7;i++){
    const x=(i%4-1.5)*71,y=i<4?28:-31;
    for(let petal=0;petal<10;petal++){
      const a=petal*Math.PI/5;
      const m=p.oval(panels,[x+16*Math.cos(a),y+16*Math.sin(a),4],[8.9,19,1.1],i%2?'#d58d4d':'#dbab59');
      m.rotation.z=a-Math.PI/2;
    }
    p.oval(panels,[x,y,5.4],[10,10,1.3],'#8c543e');
  }
  const fridge=propGroup(room,[-90,0,-80]);
  p.box(fridge,104,185,59,'#668b89',[0,93,-4]);
  p.box(fridge,92,127,3,'#c3c2ac',[0,111,27]);
  for(let row=0;row<4;row++){
    p.box(fridge,85,3,30,'#a3b4a6',[0,65+row*31,37]);
    for(let i=0;i<5;i++)p.box(fridge,7+i%2*4,12+i%3*5,12,
      ['#966b64','#bb985e','#769087','#dad2ab'][i%4],[-32+i*16,75+row*31,34]);
  }
  const door=propGroup(fridge,[-51,0,36]);
  p.box(door,102,178,6.3,'#76a29e',[49,91,0]);
  p.box(door,4,42,5,'#b7c7bd',[79,103,4]);
  p.box(door,100,2.7,1.4,'#6d8c84',[48,127,3.8]);
  const counter=propGroup(room,[-43,0,51]);
  p.box(counter,173,86,57,'#754f3e',[0,43,0]);
  p.box(counter,181,5,68,'#b28b6b',[0,88,0]);
  p.box(counter,50,1.8,34,'#bd8368',[-6,91,0]);
  for(let i=0;i<8;i++){
    const a=i*2.4;
    p.oval(counter,[-6+Math.cos(a)*19,93.1,Math.sin(a)*14],[6,1.45,6],'#cea66d');
  }
  p.box(counter,13,24,7,'#895664',[26,103,0]);
  p.box(counter,12,4,7.5,'#d7b580',[26,113,0]);
  return {door,counter};
}

function stairsSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#89735e');
  p.box(room,517,335,7,'#4c4947',[0,166,-283]);
  for(let i=0;i<13;i++){
    const y=i*6.5,z=-35-i*15.4;
    p.box(room,175,7,17,'#695c50',[0,y,z]);
    p.box(room,124,1.6,17.3,'#a04756',[0,y+4.1,z]);
    for(const s of [-1,1])p.box(room,15,1,17.4,'#c09c70',[s*78,y+4,z]);
  }
  for(const s of [-1,1]){
    p.tube(room,[s*102,65,-13],[s*102,150,-229],2.7,brass);
    for(let i=0;i<8;i++)p.tube(room,[s*103,i*10.5,-31-i*28],[s*103,73+i*10.5,-31-i*28],1.55,'#9e805f');
  }
  frameArt(p,room,[-134,139,-180],59,72);
  lamp(p,room,[155,138,-148]);
  const extras=propGroup(room);
  for(const s of [-1,1]){
    const officer=propGroup(extras,[s*134,0,-105]);
    p.oval(officer,[0,125,0],[12,16,12],'#ac8e78');
    p.oval(officer,[0,136,-3],[16,5.8,15],'#293d53');
    p.box(officer,29,37,19,'#5b8094',[0,91,0]);
    p.box(officer,13,42,14,'#283c54',[-8,51,0]);
    p.box(officer,13,42,14,'#283c54',[8,51,0]);
    p.box(officer,4.2,5.9,1.5,'#c7a36a',[8,101,10]);
    p.tube(officer,[s*-17,95,1],[s*-28,67,13],3.6,'#535f79');
  }
  return {extras};
}

function bathSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#c3ab97');
  p.box(room,575,286,6,'#8a6d60',[0,144,-154]);
  for(let i=0;i<29;i++)p.box(room,5,227,5,i%2?'#a78a74':'#c0a38b',[-211+i*15,139,-139+4*(i%3)]);
  p.oval(room,[0,35,4],[111,29,59],'#9cb6ac');
  p.oval(room,[0,57,4],[111,8.4,57],'#d7ddc4');
  p.oval(room,[0,62,4],[101,4.7,51],'#d5dbcc');
  const bubbles=[];
  for(let i=0;i<54;i++){
    const a=i*2.39996,r=Math.sqrt(i/54);
    bubbles.push(wash(p.oval(room,[Math.cos(a)*96*r,64+(i%4)*3,Math.sin(a)*48*r],
      [6.5+i%5,3.1+i%4,5.9+i%4],i%3?'#e9e2d6':'#ede8d8'),.58));
  }
  p.tube(room,[-84,59,-34],[-84,81,-34],2.9,brass);
  p.tube(room,[-84,81,-34],[-84,80,-21],2.8,brass);
  const book=propGroup(room,[55,86,54]);
  p.box(book,29,34,4,'#b47e73',[-9,0,0]).rotation.y=.23;
  p.box(book,29,34,4,'#c2a27c',[11,0,-1]).rotation.y=-.25;
  for(let row=0;row<7;row++)p.box(book,17,.5,.7,'#d8c6a1',[13,12-row*3.2,2.4]);
  return {bubbles,book};
}

function billiardsSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#75644e');
  p.box(room,687,320,5,'#524345',[0,157,-201]);
  for(let i=0;i<31;i++)p.box(room,4,293,4,i%2?'#8d6550':'#a78157',[-251+i*16,149,-195]);
  p.box(room,267,13,130,'#90583b',[0,58,3]);
  p.box(room,247,1.6,108,'#93695b',[0,65,3]);
  for(const x of [-110,110])for(const z of [-48,54])p.tube(room,[x,0,z],[x,55,z],4.8,'#6c4b42');
  for(const x of [-123,0,123])for(const z of [-52,56])p.oval(room,[x,66,z],[5.8,1,6.1],'#322b37');
  const balls=[];
  for(let i=0;i<13;i++)balls.push(p.oval(room,[Math.sin(i*2.9)*90,69,Math.cos(i*2.7)*42],
    [3.65,3.65,3.65],['#dcd0b8','#ad6f53','#a27f59','#434759'][i%4]));
  const stick=p.tube(room,[-73,82,32],[31,73,4],.96,'#c5a17a');
  chandelier(p,room,[0,234,-15],.7);
  return {balls,stick};
}

function bedroomSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#af8c6d');
  woodenWall(p,room);
  p.box(room,193,113,18,'#6b5051',[0,85,-107]);
  p.box(room,193,38,185,'#b39674',[0,25,-32]);
  const quilt=p.box(room,206,15,194,'#dbc49c',[0,52,-30]);
  for(let i=0;i<14;i++)p.box(room,199,.5,2,'#ba9e81',[0,59.8,-115+i*12.9]);
  for(const x of [-45,37])linen(p,room,[x,69,-93],65,17,28,'#cdb288');
  const pinkBed=p.box(room,213,16,200,'#c683a1',[0,63,-28]);
  for(const s of [-1,1])lamp(p,room,[s*131,73,-73]);
  const desk=propGroup(room,[43,0,42]);
  p.box(desk,131,11,57,'#715242',[0,81,0]);
  p.box(desk,128,71,47,'#8c6549',[0,39,-2]);
  const drawer=propGroup(desk,[19,69,25]);
  p.box(drawer,96,15,31,'#9f7754',[-9,0,4]);
  p.box(drawer,96,3,29,'#674d3f',[-9,-5,9]);
  p.oval(drawer,[-10,0,20],[6,1.9,2.5],brass);
  necklace(p,drawer,[-28,5,11],'#dfbc81',8).rotation.x=Math.PI/2;
  const phone=creamPhone(p,desk,[-25,90,-2]);
  const stereo=propGroup(room,[-73,84,42]);
  p.box(stereo,63,32,24,'#77756f',[0,0,0]);
  p.box(stereo,50,11,2,'#394d55',[0,5,13]);
  p.box(stereo,25,5,1.2,'#b2bac1',[-4,5,14.5]);
  for(const x of [-24,24])p.mesh(stereo,new THREE.CircleGeometry(8,16),[x,-1,15],'#424953');
  return {quilt,pinkBed,desk,drawer,phone,stereo};
}

function wardrobeSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#a37e5f');
  woodenWall(p,room);
  p.box(room,306,6,318,'#b88e69',[0,2,-48]);
  const palette=['#b06972','#c3a278','#8f6174','#6e8291','#a98071','#d6c29a','#786f6e'];
  for(const s of [-1,1]){
    p.box(room,72,238,260,'#76503e',[s*201,121,-89]);
    p.tube(room,[s*154,209,-206],[s*154,209,35],2.8,brass);
    p.box(room,3,5,264,'#efc886',[s*160,227,-88]);
    for(let i=0;i<10;i++){
      const z=-185+i*23;
      const g=propGroup(room,[s*154,189,z]);
      g.rotation.y=s*.39;
      p.tube(g,[0,0,0],[0,19,0],1.2,brass);
      p.tube(g,[-13,-1,0],[13,-1,0],1.6,brass);
      p.box(g,28,66+i%3*7,5,palette[(i+(s===1?2:0))%palette.length],[0,-34,0]);
      for(let j=0;j<5;j++)p.box(g,.7,41,1,'#b59682',[(j-2)*5,-38,3]);
    }
  }
  p.box(room,157,181,9,'#b29572',[0,134,-206]);
  p.box(room,146,171,3,'#a59b99',[0,134,-198]);
  p.box(room,138,165,.8,'#8c868e',[0,134,-194]);
  for(const s of [-1,1])for(let i=0;i<11;i++)
    p.oval(room,[s*77,52+i*16,-193],[3.7,3.7,2.9],'#f2d8a0');
  const bag=propGroup(room,[85,73,60]);
  p.box(bag,71,7,39,'#805e45',[0,-2,-2]);
  p.box(bag,44,31,25,'#6a6262',[0,18,0]);
  for(let i=0;i<4;i++)p.box(bag,9,28,1.4,palette[i],[-16+i*10,18,13.2]);
  p.mesh(bag,new THREE.TorusGeometry(12,1.8,5,18,Math.PI),[0,33,.2],'#b2926d');
  return {bag};
}

function poolSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#35404c',-21);
  dashSky(p,room,-539);
  p.box(room,598,8,326,'#2b7794',[0,29,-37]);
  p.box(room,622,11,14,'#91b7b4',[0,31,132]);
  p.box(room,622,11,14,'#468299',[0,31,-200]);
  for(const s of [-1,1])p.box(room,13,10,324,'#4e8692',[s*304,31,-37]);
  const ripples:THREE.Mesh[]=[];
  for(let i=0;i<27;i++)
    ripples.push(wash(p.oval(room,[0,34,0],[31+i%9*7,.6,4+i%4*2],'#9be2e6'),.32));
  const drops:THREE.Mesh[]=[];
  for(let i=0;i<49;i++)
    drops.push(wash(p.oval(room,[0,48,45],[1.6+i%4*.6,2.4+i%3,1.5],'#a8e7ea'),.7));
  return {ripples,drops};
}

function lookoutSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#8f6d5c');
  dashSky(p,room,-426);
  const lounge=propGroup(room);
  for(const s of [-1,1]){
    p.box(lounge,9,265,3,'#745952',[s*205,129,-125]);
    p.box(lounge,9,281,3,'#54463e',[s*260,131,-122]);
    lamp(p,lounge,[s*181,47,-62],'#bd886d');
    for(let i=0;i<11;i++)
      p.box(lounge,3.4,223,5,'#c1a88f',[s*(238-i*3.08),128,-124+(i%3)*3.52]);
  }
  p.box(lounge,580,18,8,'#5c4b42',[0,251,-122]);
  lightStrip(p,lounge,[0,242,-115],555);
  p.box(lounge,571,9,8,'#a89c88',[0,18,-124]);
  p.oval(lounge,[0,36,-27],[113,17,56],'#533f48');
  p.oval(lounge,[0,49,-30],[102,9,45],'#b29e71');
  const palms=propGroup(room);
  for(const [i,x] of [-166,-106,149].entries())palm(p,palms,[x,-13,-138-i*8],206+i*18,'#809794');
  const beam=wash(p.mesh(palms,new THREE.CircleGeometry(43,29),[117,212,-283],'#d3e0e2'),.62);
  return {lounge,palms,beam};
}

function garageSet(p:VideoProps,room:THREE.Group) {
  ground(p,room,'#464d50');
  p.box(room,621,288,8,'#383a40',[0,141,-172]);
  for(const x of [-237,-96,152,251])p.box(room,6,268,8,'#62656a',[x,133,-164]);
  lightStrip(p,room,[0,228,-118],399,'#c5b9a7');
  const car=chassis(p,room,[62,0,-13],'coupe');
  return {car};
}

function monitorSet(p:VideoProps,room:THREE.Group) {
  p.box(room,515,329,13,'#202c34',[0,139,-48]);
  p.box(room,337,198,4,'#335766',[0,141,-34]);
  const grid=p.ink(room);
  grid.begin();
  for(let i=0;i<35;i++)p.line(grid,[[-166,45+i*5.35,-27],[166,45+i*5.35,-27]],'#55808b',.84);
  for(const s of [-1,1]){
    p.line(grid,[[s*157,58,-27],[s*151,58,-27],[s*151,79,-27]],'#8ba6af',2.5);
    p.line(grid,[[s*157,224,-27],[s*151,224,-27],[s*151,203,-27]],'#8ba6af',2.5);
  }
  grid.end();
  const flicker=wash(p.box(room,331,14,1,'#7aabb6',[0,158,91]),.13);
  return {flicker};
}

function endingSet(p:VideoProps,room:THREE.Group) {
  p.box(room,387,245,8,'#25354b',[0,115,-162]);
  p.box(room,348,124,6,'#396077',[0,133,-158]);
  p.box(room,382,9,5,'#886782',[0,199,-30]);
  for(const s of [-1,1]){
    p.tube(room,[s*156,74,58],[s*130,199,-10],4.8,'#8d7192');
    p.box(room,71,77,44,'#724861',[s*69,95,-81]);
    p.box(room,59,29,23,'#87596e',[s*69,141,-79]);
  }
  p.box(room,307,51,42,'#3e4e65',[0,47,75]);
  p.box(room,308,9,48,'#a0739a',[0,74,76]);
  p.mesh(room,new THREE.TorusGeometry(21,2.5,8,26),[52,93,79],'#333d50');
  p.box(room,18,3,5,'#8b8494',[52,92,80]);
  const parcel=propGroup(room,[15,83,-75]);
  p.box(parcel,37,26,40,'#986455',[0,0,0]);
  p.box(parcel,9,30,42,'#cc986a',[0,0,0]);
  return {parcel};
}

function cardSet(p:VideoProps,room:THREE.Group) {
  p.box(room,453,26,324,'#ab8e6b',[0,25,0]);
  const veins=p.ink(room);
  veins.begin();
  for(let i=0;i<96;i++){
    const z=-139+(i*31)%295;
    p.line(veins,Array.from({length:14},(_,j)=>[
      -215+j*33,38.3,z+Math.sin(i*.29+j*.59)*(3+i%7)
    ] as Point),['#c3a586','#92735d','#c8b08b','#805e52'][i%4],i%3?.8:1.7);
  }
  veins.end();
  const note=propGroup(room,[0,40,51]);
  note.rotation.y=.37;
  p.box(note,113,1.1,69,'#f1dfb6',[0,0,0]);
  const cursive=p.ink(note);
  cursive.begin();
  for(let line=0;line<6;line++){
    const z=-19+line*7.7;
    p.line(cursive,Array.from({length:83},(_,i)=>[
      -43+i*(line===5?.66:1.0),.77,z+Math.sin(i*1.52+line)*1.24+Math.sin(i*.36+line)*.66,
    ] as Point),'#9b7772',1.1);
  }
  cursive.end();
  p.oval(note,[42,.9,-20],[5.8,.9,5.1],'#b46d64');
  for(const s of [-1,1])
    p.oval(note,[-38,.88,26+s*1.3],[7.4,.4,2.1],'#ad615f').rotation.y=.31*s;
  const spider=propGroup(room);
  p.oval(spider,[0,10,1],[8.8,6.5,10.0],'#2b2730');
  p.oval(spider,[0,8,-7],[5.2,5,6.3],'#35303b');
  const legs:THREE.Mesh[]=[];
  for(let i=0;i<8;i++)legs.push(p.tube(spider,[0,0,0],[0,1,0],1.24,'#2a2630'),
    p.tube(spider,[0,0,0],[0,1,0],.98,'#2a2630'));
  return {spider,legs};
}

export function buildTourSets(p:VideoProps,scene:THREE.Scene) {
  const rooms:Record<TourRoom,THREE.Group>={
    drive:propGroup(scene),passage:propGroup(scene),lounge:propGroup(scene),kitchen:propGroup(scene),
    stairs:propGroup(scene),bath:propGroup(scene),billiards:propGroup(scene),bedroom:propGroup(scene),
    wardrobe:propGroup(scene),pool:propGroup(scene),lookout:propGroup(scene),garage:propGroup(scene),
    monitor:propGroup(scene),ending:propGroup(scene),card:propGroup(scene),
  };
  const drive=driveSet(p,rooms.drive);
  const passage=passageSet(p,rooms.passage);
  const lounge=loungeSet(p,rooms.lounge);
  const kitchen=kitchenSet(p,rooms.kitchen);
  const stairs=stairsSet(p,rooms.stairs);
  const bath=bathSet(p,rooms.bath);
  const billiards=billiardsSet(p,rooms.billiards);
  const bedroom=bedroomSet(p,rooms.bedroom);
  const wardrobe=wardrobeSet(p,rooms.wardrobe);
  const pool=poolSet(p,rooms.pool);
  const lookout=lookoutSet(p,rooms.lookout);
  const garage=garageSet(p,rooms.garage);
  const monitor=monitorSet(p,rooms.monitor);
  const ending=endingSet(p,rooms.ending);
  const card=cardSet(p,rooms.card);

  function update(s:ReturnType<typeof houseTourState>) {
    for(const [name,room] of Object.entries(rooms))room.visible=s.room===name;
    drive.shoes.visible=s.view==='tour-heels';
    drive.shoes.position.y=2+Math.max(0,Math.sin(s.t*2.9))*6.1;
    const shoe=s.t<5.86?0:s.t<9.4?1:2;
    for(const [i,step] of drive.shoeSteps.entries()){
      step.visible=shoe===i;
      step.rotation.x=.15*Math.sin(s.t*2.9);
    }
    drive.title.visible=s.view==='tour-heels'&&s.t>=5.75&&s.t<9.43;
    drive.escapeCue.visible=s.view==='tour-fade';
    drive.van.door.rotation.y=s.view==='tour-van-door'?-.92:0;
    const vanMoving=s.view==='tour-fade'||s.view==='tour-night-road';
    drive.van.body.position.z=vanMoving?-20-Math.max(0,s.t-s.cut)*44:-10;
    drive.van.body.rotation.y=vanMoving?-.47:.0;
    drive.beacon.visible=s.t>175&&s.t<194;
    drive.beacon.position.x=Math.sin(s.t*3.5)*131;
    passage.door.rotation.y=s.view==='tour-beret'?-.57*Math.min(1,(s.t-27.8)*.39):0;
    passage.painting.visible=s.view==='tour-painting';
    passage.spotlight.visible=s.view==='tour-spotlight';
    passage.spotlight.position.x=Math.sin(s.t*2.9)*75;
    lounge.discoBall.visible=s.disco;
    lounge.discoBall.rotation.y=s.t*.8;
    for(const [i,m] of lounge.lightSpots.entries()){
      m.visible=s.disco;
      const a=i*2.39996+s.t*.74,r=39+i*5;
      m.position.set(r*Math.cos(a),3.5,r*Math.sin(a)-17);
    }
    lounge.crystal.visible=!s.dark;
    lounge.pup.visible=s.view==='tour-puppy';
    lounge.head.rotation.y=Math.sin(s.t*4.7)*.16;
    lounge.rug.visible=s.view==='tour-rug'||s.view==='tour-puppy';
    lounge.candles.visible=s.dark;
    for(const [i,flame] of lounge.flames.entries())flame.scale.y=4.2+Math.sin(s.t*18+i)*.92;
    kitchen.door.rotation.y=s.view==='tour-fridge'?-.96:0;
    kitchen.counter.visible=s.view==='tour-snack'||s.view==='tour-fridge';
    stairs.extras.visible=s.view==='tour-sconces';
    stairs.extras.position.z=5*Math.sin(s.t*4.1);
    bath.book.visible=s.view==='tour-book';
    bath.book.rotation.y=.25*Math.sin(s.t*1.7);
    for(const [i,bubble] of bath.bubbles.entries())bubble.position.y=64+i%4*3+Math.sin(s.t*2.9+i)*1.4;
    for(const [i,ball] of billiards.balls.entries())ball.position.x=Math.sin(i*2.9)*90+Math.sin(s.t*.4+i)*5;
    bedroom.pinkBed.visible=s.view==='tour-pink-bed';
    bedroom.quilt.visible=!bedroom.pinkBed.visible;
    bedroom.desk.visible=/phone|drawer/.test(s.view);
    bedroom.drawer.position.z=s.view==='tour-drawer'?27+7*Math.sin(s.t*2.6):25;
    bedroom.phone.receiver.rotation.z=s.view==='tour-desk-phone'?-.25:0;
    bedroom.stereo.visible=s.view==='tour-stereo';
    wardrobe.bag.visible=s.view==='tour-bag';
    for(const [i,m] of pool.ripples.entries())
      m.position.set(193*Math.sin(i*3.12+s.t*.62),34.2,-147+i*9.2+Math.sin(s.t*1.2+i)*8);
    const splash=s.view==='tour-splash';
    for(const [i,m] of pool.drops.entries()){
      m.visible=splash;
      const u=Math.max(0,Math.min(1,(s.t-s.cut)*.94+i%9*.022));
      m.position.set(Math.sin(i*2.4)*(10+105*u),35+(27+i%9*6)*Math.sin(u*Math.PI),47+Math.cos(i*2.4)*(8+36*u));
    }
    lookout.lounge.visible=s.view!=='tour-palms';
    lookout.palms.visible=s.view==='tour-palms';
    lookout.beam.position.x=120+55*Math.cos(s.t*2.53);
    garage.car.door.rotation.y=s.view==='tour-sports-car'?-.94:-.29;
    monitor.flicker.position.y=48+(s.t*105)%190;
    ending.parcel.rotation.z=Math.sin(s.t*3.5)*.035;
    if(s.room==='card'){
      const u=Math.max(0,Math.min(1,(s.t-204.29)/9.85));
      card.spider.position.set(-119+u*238,40.4,39+Math.sin(u*4.2)*22);
      card.spider.rotation.y=1.30+.41*Math.sin(u*4.46);
      for(let i=0;i<8;i++){
        const sign=i<4?-1:1,j=i%4,z=8-j*5.8,w=Math.sin(s.t*16+i*1.5);
        const a:Point=[sign*4,7,z],b:Point=[sign*(14+w*2.2),9+w*2.4,z+3.1-w*2];
        const c:Point=[sign*(21+w*3.1),.7,z+8.4+w*4];
        p.segment(card.legs[i*2],a,b,1.24);
        p.segment(card.legs[i*2+1],b,c,.98);
      }
    }
  }
  return {rooms,drive,passage,lounge,kitchen,stairs,bath,billiards,bedroom,wardrobe,pool,lookout,
    garage,monitor,ending,card,update};
}
