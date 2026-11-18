import * as THREE from 'three';
import {VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';

const script:Record<string,string[]> = {
  H:['10001','10001','11111','10001','10001'], O:['01110','10001','10001','10001','01110'],
  U:['10001','10001','10001','10001','01110'], S:['01111','10000','01110','00001','11110'],
  E:['11111','10000','11110','10000','11111'], T:['11111','00100','00100','00100','00100'],
  R:['11110','10001','11110','10010','10001'], P:['11110','10001','11110','10000','10000'],
  Y:['10001','01010','00100','00100','00100'], G:['01111','10000','10111','10001','01110'],
  I:['111','010','010','010','111'], L:['10000','10000','10000','10000','11111'],
  C:['01111','10000','10000','10000','01111'], A:['01110','10001','11111','10001','10001'],
  N:['10001','11001','10101','10011','10001'], W:['10001','10001','10101','11011','10001'],
  B:['11110','10001','11110','10001','11110'], X:['10001','01010','00100','01010','10001'],
  D:['11110','10001','10001','10001','11110'], 2:['01110','10001','00010','01100','11111'],
  6:['01110','10000','11110','10001','01110'],
  ' ':['00','00','00','00','00'],
};

export function tourLabel(p:VideoProps,parent:THREE.Object3D,text:string,at:Point,size:number,color:string) {
  const root=propGroup(parent,at);
  const width=[...text].reduce((n,ch)=>n+script[ch][0].length+1,0);
  let x=-(width-1)*size/2;
  for(const ch of text){
    const glyph=script[ch];
    for(const [row,bits] of glyph.entries())
      for(const [col,bit] of [...bits].entries())
        if(bit==='1')p.box(root,size*.98,size*.98,.8,color,[x+(col+(4-row)*.16)*size,(2-row)*size,0]);
    x+=(glyph[0].length+1)*size;
  }
  return root;
}

export function wash(m:THREE.Mesh,alpha:number) {
  const material=m.material as THREE.MeshBasicMaterial;
  material.transparent=true;
  material.opacity=alpha;
  material.depthWrite=false;
  return m;
}

export function palm(p:VideoProps,root:THREE.Object3D,at:Point,height:number,color:string) {
  const g=propGroup(root,at);
  const ink=p.ink(g);
  ink.begin();
  for(let i=0;i<7;i++) {
    const a=i*2.39996;
    const frond=Array.from({length:16},(_,j)=>{
      const u=j/15;
      return [Math.cos(a)*height*.43*u,height*(1+.24*u-.34*u*u),Math.sin(a)*height*.43*u] as Point;
    });
    p.line(ink,frond,color,2.3);
    for(let j=2;j<15;j+=2) {
      const [x,y,z]=frond[j];
      const width=height*.13*(1-j/18);
      for(const s of [-1,1])p.line(ink,[[x,y,z],[x+width*s*Math.sin(a),y-height*.08,z-width*s*Math.cos(a)]],color,1.5);
    }
  }
  p.line(ink,[[0,0,0],[height*.022,height*.4,0],[0,height,0]],'#796653',3.3);
  ink.end();
  return g;
}

export function chandelier(p:VideoProps,root:THREE.Object3D,at:Point,scale=1) {
  const g=propGroup(root,at);
  g.scale.setScalar(scale);
  p.tube(g,[0,10,0],[0,-41,0],1.6,'#75604e');
  for(let tier=0;tier<4;tier++) {
    const radius=31-tier*5.7;
    const y=-10-tier*9;
    p.mesh(g,new THREE.TorusGeometry(radius,1.3,6,28),[0,y,0],'#bf985f').rotation.x=Math.PI/2;
    for(let i=0;i<20;i++){
      const theta=i*Math.PI/10;
      const dot=p.mesh(g,new THREE.OctahedronGeometry(1),[radius*Math.cos(theta),y-4,radius*Math.sin(theta)],
        i%3?'#ead6a9':'#f9e9bf');
      dot.scale.set(2.0,6.9,2.1);
    }
  }
  return g;
}

export function necklace(p:VideoProps,parent:THREE.Object3D,at:Point,pearl:string,radius:number) {
  const g=propGroup(parent,at);
  for(let i=0;i<24;i++){
    const a=i*Math.PI/12;
    p.oval(g,[radius*Math.cos(a),radius*Math.sin(a)*.67,Math.sin(a)*.42],[1.65,1.75,1.4],pearl);
  }
  return g;
}

export function creamPhone(p:VideoProps,root:THREE.Object3D,at:Point) {
  const h=propGroup(root,at);
  p.oval(h,[0,0,0],[20,6.2,12.4],'#dfc9a3');
  p.oval(h,[0,5,3],[9.5,2.4,8.2],'#ad9379');
  for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9;
    p.oval(h,[7*Math.sin(a),7.2,3+6.1*Math.cos(a)],[1.3,.6,1.3],'#504548');
  }
  const receiver=propGroup(h,[0,10,-4]);
  p.tube(receiver,[-15,0,0],[15,0,0],2.5,'#efdbb2');
  for(const s of [-1,1])p.oval(receiver,[s*13,-.1,.2],[6,3.3,5.4],'#efdbb2');
  const wire=p.ink(h);
  wire.begin();
  p.line(wire,Array.from({length:42},(_,i)=>[15+i*.6,2+Math.sin(i*1.42)*1.4,-2+i*.19] as Point),'#b79d85',1.4);
  wire.end();
  return {base:h,receiver};
}

export function tickGlass(p:VideoProps,root:THREE.Object3D,at:Point) {
  const g=propGroup(root,at);
  const pale='#dfcfad';
  p.tube(g,[0,1,0],[0,15,0],.8,pale);
  p.oval(g,[0,1,0],[5.3,.6,5.3],pale);
  wash(p.mesh(g,new THREE.CylinderGeometry(7.1,2.8,12,14,1,true),[0,19,0],pale),.45);
  p.mesh(g,new THREE.CylinderGeometry(5.9,2.8,6,14),[0,16.7,0],'#d3aa6d');
  return g;
}

export function chassis(p:VideoProps,root:THREE.Object3D,at:Point,kind:'van'|'coupe') {
  const g=propGroup(root,at);
  const van=kind==='van';
  const paint=van?'#b86e9d':'#b3b6a6';
  const length=van?268:209;
  p.box(g,length,van?63:32,76,paint,[0,van?52:39,0]);
  p.box(g,van?201:101,van?49:31,72,van?'#a76a96':'#232f38',[van?-17:7,van?96:64,-1]);
  p.box(g,van?203:104,6,74,van?'#b77ba7':'#c3c4b1',[van?-17:7,van?121:81,-1]);
  for(const s of [-1,1]) {
    p.box(g,van?45:81,van?28:23,2.5,'#2a3846',[van?60:4,van?96:66,s*36]);
    p.box(g,10,van?29:23,1.8,paint,[van?83:19,van?96:66,s*37.0]);
    p.box(g,length-7,3.5,2.4,van?'#c298b6':'#8b9992',[0,35,s*38.2]);
    for(const x of [-length*.36,length*.36]){
      p.mesh(g,new THREE.CylinderGeometry(20,20,12,24),[x,20,s*38],'#16242c').rotateX(Math.PI/2);
      p.mesh(g,new THREE.CircleGeometry(10.5,18),[x,20,s*44.2],'#9ca9ac').rotateY(s<0?Math.PI:0);
      p.oval(g,[x,20,s*44.4],[3.6,3.6,.9],'#435a67');
    }
    p.box(g,3.3,van?11:7,16,'#f4d8a5',[length*.5+1,van?64:49,s*23]);
    p.box(g,2,8.3,9,'#bb4d5f',[-length*.5-1,van?56:49,s*29]);
  }
  p.box(g,5,42,62,'#333b49',[length*.5-24,van?93:62,-1]).rotation.z=van?-.19:-.58;
  p.box(g,3,13,67,'#73848a',[length*.5+1,31,0]);
  p.box(g,3,13,67,'#73848a',[-length*.5-1,31,0]);
  const door=propGroup(g,[van?80:42,van?66:45,39]);
  p.box(door,49,van?53:32,4,paint,[-23,0,0]);
  p.box(door,48,van?26:23,3.2,'#304359',[-23,van?38:27,0]);
  p.box(door,9,2,1.8,'#d6b4a8',[-33,van?21:15,2.6]);
  if(van) {
    tourLabel(p,g,'PRETTY GIRL',[-33,91,37],3.3,'#4c3550');
    tourLabel(p,g,'CLEAN UP CREW',[-34,72,37],1.74,'#533854');
  }
  return {body:g,door};
}
