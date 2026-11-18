import * as THREE from 'three';
import {VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';
import {tourLabel,wash} from './house-tour-props.ts';
import type {SubwaySet} from '../../scene/the-subway.ts';

const amber = '#d6ad79';
const steel = '#687d80';
const cream = '#d6d4bb';
const slate = '#3d464f';

function floor(p:VideoProps,g:THREE.Group,color:string) {
  p.box(g,2400,9,2400,color,[0,-5,-510]);
}

function windows(p:VideoProps,g:THREE.Object3D,at:Point,w:number,h:number,color:string,glowing=false) {
  const [x,y,z]=at;
  p.box(g,w+6,h+9,4,'#867466',[x,y-1,z]);
  p.box(g,w,h,4,color,[x,y,z+3]);
  p.box(g,2,h,1,glowing?'#926044':'#546569',[x,y,z+5]);
  p.box(g,w,2,1,glowing?'#926044':'#546569',[x,y-h*.17,z+5]);
  p.box(g,w+9,2.5,6,'#9a8977',[x,y-h/2-4,z+3]);
}

function skyline(p:VideoProps,g:THREE.Group,z:number,night:boolean) {
  const tones=night?['#3b434a','#364147','#4c4954','#283946']:['#9d8a73','#8b8b82','#ada18e','#7d8a8c'];
  for(let i=0;i<23;i++){
    const x=(i-11)*69;
    const h=170+(i*79)%237;
    const c=tones[i%tones.length];
    p.box(g,62,h,49,c,[x,h*.5-54,z-i%3*15]);
    for(let j=0;j<15;j++){
      const wx=x+((j%3)-1)*15,wy=h-77-Math.floor(j/3)*19;
      p.box(g,5,8,1,j%4===0?(night?'#cf9a60':'#abb1a5'):'#545961',[wx,wy,z+25-i%3*15]);
    }
  }
  p.box(g,58,257,38,night?'#495362':'#9da39a',[-108,232,z-121]);
  p.box(g,39,27,31,night?'#555c65':'#b1af9d',[-108,374,z-121]);
  p.tube(g,[-108,379,z-121],[-108,435,z-121],2.1,night?'#8e7f75':'#777d78');
}

function lamp(p:VideoProps,g:THREE.Group,x:number,z:number,night:boolean) {
  p.tube(g,[x,0,z],[x,235,z],3.2,'#374842');
  p.tube(g,[x,228,z],[x-27,248,z],2.4,'#374842');
  p.oval(g,[x-31,246,z],[9,3,7],night?'#eed094':'#b6b9ab');
  if(night)wash(p.oval(g,[x-32,2.5,z],[58,.8,33],'#bc946c'),.15);
}

function taxi(p:VideoProps,g:THREE.Group,x:number,color:string) {
  const car=propGroup(g,[x,0,-155]);
  p.box(car,128,23,55,color,[0,26,0]);
  p.box(car,72,21,48,'#444c50',[-8,47,0]);
  p.box(car,67,4,49,color,[-8,59,0]);
  p.box(car,18,9,19,'#f0d674',[-8,64,0]);
  p.box(car,6,14,44,'#aaa49b',[65,23,0]);
  for(const s of [-1,1])for(const wheel of [-40,40]){
    p.mesh(car,new THREE.CylinderGeometry(14,14,7,14),[wheel,13,s*25],'#282831').rotation.x=Math.PI/2;
    p.oval(car,[wheel,13,s*29],[6,6,1.5],'#889296');
  }
  return car;
}

function street(p:VideoProps,g:THREE.Group,night:boolean) {
  floor(p,g,night?'#4b444b':'#77736b');
  skyline(p,g,-500,night);
  p.box(g,1400,2,172,night?'#383b47':'#525758',[0,1,-166]);
  p.box(g,1000,6,30,night?'#6d6263':'#989085',[0,3,-68]);
  const lines=p.ink(g);
  lines.begin();
  for(let i=-7;i<=7;i++){
    const x=i*72;
    p.line(lines,[[x,3,-46],[x+5,3,290]],night?'#635456':'#898075',.85);
    p.line(lines,[[x,3,-166],[x+38,3,-166]],night?'#ad8d63':'#cfad69',2);
  }
  for(let d=-18;d<240;d+=58)p.line(lines,[[-600,2,d],[600,2,d]],night?'#635456':'#898075',1);
  lines.end();
  for(let i=0;i<9;i++){
    const x=(i-4)*126,h=214+i%4*45;
    p.box(g,118,h,30,night?['#57444a','#675750','#48505b'][i%3]:['#a27660','#b3a88c','#827b6e'][i%3],[x,h/2,-317]);
    p.box(g,123,9,34,night?'#755851':'#c0ad90',[x,h,-316]);
    for(let a=0;a<3;a++)for(let j=0;j<3;j++)
      windows(p,g,[x+(a-1)*32,87+j*52,-299],21,29,night?(a+j+i)%3===0?'#c68d5a':'#495362':'#586564',night);
    p.box(g,107,46,4,night?'#513941':'#756b55',[x,31,-298]);
  }
  for(let i=-3;i<=3;i++) lamp(p,g,i*175,-64,night);
  const cabs=[taxi(p,g,-266,'#d69d35'),taxi(p,g,164,night?'#b14d53':'#bd8931')];
  const grate=p.ink(g);
  grate.begin();
  for(let i=-16;i<=16;i+=2) p.line(grate,[[i*2,2,-13],[i*2,2,107]],'#363838',1.4);
  for(let i=-10;i<=10;i+=2) p.line(grate,[[-34,2,45+i*6],[34,2,45+i*6]],'#363838',1.1);
  grate.end();
  return cabs;
}

function station(p:VideoProps,g:THREE.Group) {
  floor(p,g,'#777e78');
  p.box(g,1150,246,15,'#a7ae9a',[0,122,-204]);
  const grout=p.ink(g);
  grout.begin();
  for(let x=-560;x<=560;x+=21)p.line(grout,[[x,1,-193],[x,242,-193]],'#8a9788',.7);
  for(let y=19;y<243;y+=16)p.line(grout,[[-560,y,-193],[560,y,-193]],'#8a9788',.7);
  grout.end();
  p.box(g,1120,35,4,'#4c6861',[0,177,-190]);
  p.box(g,1120,2,4,cream,[0,161,-186]);
  p.box(g,1120,2,4,cream,[0,194,-186]);
  p.box(g,1120,11,4,'#cfa257',[0,2,136]);
  for(let j=-2;j<=2;j++){
    const x=j*153;
    const column=propGroup(g,[x,0,-75]);
    p.box(column,11,219,11,'#4c625b',[0,109,0]);
    p.box(column,19,9,17,'#526f64',[0,211,0]);
    p.box(g,91,4,8,'#e2e2c1',[x,214,-105]);
    p.box(g,106,41,4,'#364244',[x+67,149,-182]);
    if(j%2===0)tourLabel(p,g,'SUBWAY',[x+67,147,-179],2.8,cream);
  }
  p.box(g,165,15,15,'#6e483c',[-95,42,-84]);
  p.box(g,168,25,7,'#886352',[-95,61,-93]);
  for(const x of [-158,-34]) p.tube(g,[x,0,-84],[x,43,-84],3,slate);
  const turn=propGroup(g,[181,0,-35]);
  for(let i=0;i<3;i++){
    const x=i*31;
    p.box(turn,12,46,25,steel,[x,23,0]);
    p.tube(turn,[x+7,40,0],[x+27,40,0],2.2,'#a9b7ae');
  }
  tourLabel(p,g,'EXIT',[210,181,-189],3.1,'#f0c590');
}

function train(p:VideoProps,g:THREE.Group) {
  floor(p,g,'#57655e');
  p.box(g,1050,218,12,'#7e9188',[0,109,-173]);
  p.box(g,1050,22,6,'#68796f',[0,205,-164]);
  p.box(g,1050,35,5,'#859086',[0,28,-165]);
  const windowsRoot=propGroup(g,[0,0,-161]);
  for(let i=-4;i<=4;i++){
    const x=i*112;
    p.box(g,104,221,1,'#809287',[x,110,-164]);
    p.box(g,90,84,5,'#a7b1a0',[x,144,-159]);
    p.box(windowsRoot,82,74,4,'#37494a',[x,144,5]);
    p.box(windowsRoot,80,5,4,'#536967',[x,141,8]);
    p.box(g,92,12,91,i%2?'#a18865':'#a69b6e',[x,39,-105]);
    p.box(g,92,30,8,'#9a8765',[x,58,-149]);
    p.tube(g,[x+48,4,-78],[x+48,219,-78],2.7,'#acb2a1');
    p.box(g,89,5,7,'#d8e1bf',[x,213,-83]);
  }
  const doors=propGroup(g,[0,0,-134]);
  for(const sign of [-1,1]){
    p.box(doors,51,209,7,'#95a6a0',[sign*27,108,0]);
    p.box(doors,35,77,4,'#4b5d5c',[sign*27,146,4.3]);
    p.box(doors,3,198,2,'#445650',[sign*2,108,5]);
  }
  const lights=propGroup(g,[0,0,-151]);
  for(let i=0;i<11;i++)
    p.box(lights,48,2,2,i%2?'#c1be92':'#78918b',[(i-5)*86,138+i%3*5,10]);
  tourLabel(p,g,'THE SUBWAY',[0,200,-128],3.0,'#e5d3aa');
  return {doors,lights};
}

function trainExterior(p:VideoProps,g:THREE.Group) {
  floor(p,g,'#272b31');
  const shell=propGroup(g,[0,0,15]);
  p.box(shell,1330,32,70,'#475964',[0,201,6]);
  p.box(shell,1330,76,70,'#384d56',[0,39,6]);
  const trim=p.ink(shell);
  trim.begin();
  for(let i=0;i<9;i++){
    const y=9+i*8;
    p.line(trim,[[-650,y,43],[650,y,43]],i%3?'#647681':'#a0a9a0',i%3===0?2:1);
  }
  trim.end();
  for(const x of [-279,-143,143,279]){
    p.box(shell,28,220,70,'#4e626a',[x,108,6]);
    p.box(shell,12,95,2,'#788980',[x,125,44]);
  }
  p.box(shell,108,141,18,'#687d82',[-400,132,34]);
  p.box(shell,88,78,4,'#333f4c',[-400,144,44]);
  p.box(shell,82,66,3,'#293e45',[-400,144,47]);
  p.box(shell,86,45,3,'#38516a',[-400,144,49]);
  tourLabel(p,shell,'NYC',[-400,145,51],3.7,'#bcc4b2');
  for(const x of [-69,69]){
    p.tube(shell,[x,76,43],[x,184,43],2.7,'#a2afa6');
    p.box(shell,26,4,5,'#b1b7a0',[x,181,44]);
  }
  p.box(g,1380,160,14,'#263843',[0,107,-84]);
  for(let col=-4;col<=4;col++) p.box(g,76,6,4,'#808065',[col*143,178,-72]);
  return shell;
}

function skylineClimb(p:VideoProps,g:THREE.Group) {
  skyline(p,g,-557,true);
  for(let i=0;i<38;i++){
    const x=(i%19-9)*93+31;
    const top=38+(i*13)%99;
    const z=-311-Math.floor(i/19)*83;
    p.box(g,81,213,66,['#243c53','#354d66','#283c52','#304158'][i%4],[x,top-106,z]);
    for(let j=0;j<16;j++){
      const col=j%4,row=Math.floor(j/4);
      p.box(g,9,4,1,j%3?'#88a99d':'#cec3a4',[x-28+19*col,top-10-row*15,z+34]);
    }
  }
  const rope=propGroup(g,[24,0,9]);
  for(let i=0;i<30;i++){
    const a=i*2.39996;
    p.oval(rope,[Math.cos(a)*14,i*20-121,Math.sin(a)*11],[11+i%3*2,22,14],['#233f35','#3b5d4b','#526b4b'][i%3]);
  }
  const strands=p.ink(rope);
  strands.begin();
  for(let i=0;i<40;i++)
    p.line(strands,Array.from({length:96},(_,j):Point=>[
      Math.cos(i*2.4)*17+Math.sin(j*.61+i*1.1)*5,
      j*6-140,
      Math.sin(i*2.4)*16+Math.cos(j*.59+i*1.1)*5,
    ]),['#4b785d','#678b60','#395b49','#749465'][i%4],i%6===0?2.7:1.3);
  strands.end();
  return rope;
}

function cycle(p:VideoProps,g:THREE.Group) {
  const cycle=propGroup(g,[0,0,42]);
  const wheel=p.ink(cycle);
  wheel.begin();
  for(const x of [-38,42]){
    const c:Point=[x,22,9];
    p.ring(wheel,c,[21,0,0],[0,21,0],'#27343e',5.7);
    p.ring(wheel,c,[17.5,0,0],[0,17.5,0],'#819caa',2);
    for(let j=0;j<8;j++){
      const a=j/8*Math.PI*2;
      p.line(wheel,[c,[x+17*Math.cos(a),22+17*Math.sin(a),9]],'#6b8a9a',.8);
    }
  }
  p.line(wheel,[[-38,22,9],[-12,52,9],[9,22,9],[-38,22,9]],'#3d699e',3.9);
  p.line(wheel,[[-12,52,9],[31,55,9],[9,22,9],[42,22,9],[29,64,9],[41,66,9]],'#426983',3.9);
  p.line(wheel,[[-22,55,9],[-6,55,9]],'#1f252c',5);
  wheel.end();
  return cycle;
}

function rooftop(p:VideoProps,g:THREE.Group) {
  floor(p,g,'#655451');
  skyline(p,g,-410,false);
  p.box(g,1090,65,28,'#87665b',[0,31,-118]);
  p.box(g,1090,6,34,'#ad8d75',[0,65,-119]);
  p.box(g,162,256,15,'#926359',[-177,127,-108]);
  for(let i=0;i<15;i++)
    p.box(g,155,1,2,'#79585a',[-177,8+i*16,-100]);
  windows(p,g,[-178,160,-98],82,108,'#4d5b62');
  for(const x of [-230,-135]){
    p.tube(g,[x,42,-53],[x,156,-53],2.5,'#564f4c');
    p.tube(g,[x,42,-53],[x+65,42,51],2.2,'#564f4c');
    p.tube(g,[x,132,-54],[x+65,78,51],2.2,'#564f4c');
  }
  for(let i=0;i<10;i++) p.box(g,93,3,7,'#625755',[-186+6.5*i,104-i*4,-52+i*10]);
}

function fountain(p:VideoProps,g:THREE.Group) {
  floor(p,g,'#5e6261');
  skyline(p,g,-495,true);
  const arch=propGroup(g,[0,0,-306]);
  for(const s of [-1,1]){
    p.box(arch,54,149,46,'#888678',[s*103,74,0]);
    p.box(arch,65,17,55,'#a4a08b',[s*103,9,0]);
    p.box(arch,68,9,51,'#9b9785',[s*103,152,0]);
  }
  p.mesh(arch,new THREE.TorusGeometry(102,28,5,27,Math.PI),[0,147,0],'#969480');
  p.box(arch,265,17,60,'#a6a28c',[0,251,0]);
  p.box(arch,277,26,53,'#858674',[0,269,0]);
  for(const s of [-1,1])for(let i=0;i<6;i++){
    const x=s*(188+i*39),z=-350+i*12;
    p.tube(g,[x,0,z],[x,95,z],6,'#414445');
    p.oval(g,[x,106,z],[29+i%2*9,53,36],i%2?'#424c40':'#3b493d');
  }
  for(const x of [-291,-157,155,291]) lamp(p,g,x,-176,true);
  p.oval(g,[0,2,20],[178,5,153],'#9b9785');
  p.oval(g,[0,8,20],[163,2.1,142],'#435e6d');
  p.oval(g,[0,13,-12],[26,12,24],'#777d73');
  const ripples=p.ink(g);
  ripples.begin();
  for(let i=1;i<=7;i++)p.ring(ripples,[0,11.0+i*.035,22],[i*21,0,0],[0,0,i*19],i%2?'#65878e':'#819c99',.9);
  ripples.end();
  const jets=Array.from({length:44},(_,i)=>wash(p.oval(g,[0,12,-10],[i%3===0?1.9:1.35,2.1,1.25],i%3?'#bdccd0':'#e4dbcd'),.71));
  return jets;
}

function hairSea(p:VideoProps,g:THREE.Group) {
  floor(p,g,'#472822');
  for(let i=0;i<95;i++){
    const x=(i%13-6)*39+(i%5)*3,z=Math.floor(i/13)*46-282;
    p.oval(g,[x,i%4*2,z],[42+i%6*4,8+i%6*2,31],['#582e26','#724132','#864736','#4a2b28','#9b4d36'][i%5]);
  }
  const fibers=p.ink(g);
  fibers.begin();
  for(let i=0;i<142;i++){
    const x=(i%27-13)*22,z=Math.floor(i/27)*81-272;
    p.line(fibers,Array.from({length:14},(_,j):Point=>{
      const q=j*.71;
      return [x+Math.cos(q+i*.2)*(4+j*.59),14+(i%6)*.8+Math.sin(q)*1.3,z+Math.sin(q+i*.2)*(5+j*.72)];
    }),i%5?'#a76241':'#c6895c',i%4===0?1.8:.95);
  }
  fibers.end();
  return Array.from({length:5},(_,i)=>{
    const rat=propGroup(g);
    const fur=['#53423d','#76594f','#a89180','#564744','#483735'][i];
    p.oval(rat,[0,8,-6],[8,7,15],fur);
    p.oval(rat,[0,8,7],[5,5,8],fur);
    p.oval(rat,[0,7,14],[2.1,1.9,2],'#d39485');
    for(const sign of [-1,1]){
      p.oval(rat,[sign*4,12,5],[2.9,3.6,1.3],'#bd8d85');
      p.oval(rat,[sign*3.6,9.8,10],[.9,1,.9],'#261d24');
    }
    const tail=p.ink(rat);
    tail.begin();
    p.line(tail,[[0,6,-17],[4,4,-25],[10,3,-32],[16,3,-34],[25,2,-36]],'#ac7c72',1.8);
    tail.end();
    return rat;
  });
}

export function buildSubwaySets(p:VideoProps,scene:THREE.Scene) {
  const groups:Record<SubwaySet,THREE.Group>={
    day:propGroup(scene),night:propGroup(scene),station:propGroup(scene),train:propGroup(scene),
    'train-side':propGroup(scene),roof:propGroup(scene),fountain:propGroup(scene),hair:propGroup(scene),
    sky:propGroup(scene),black:propGroup(scene),
  };
  const traffic={day:street(p,groups.day,false),night:street(p,groups.night,true)};
  station(p,groups.station);
  const car=train(p,groups.train);
  const outerCar=trainExterior(p,groups['train-side']);
  rooftop(p,groups.roof);
  const jets=fountain(p,groups.fountain);
  const rats=hairSea(p,groups.hair);
  const rope=skylineClimb(p,groups.sky);
  const bike=cycle(p,groups.night);
  return {groups,traffic,car,jets,rats,outerCar,rope,bike};
}
