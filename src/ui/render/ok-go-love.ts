import * as THREE from 'three';
import {loveCamera,loveState,type LoveId} from '../../scene/ok-go-love.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure,VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';
import {tourLabel,wash} from './house-tour-props.ts';
import {buildLoveArm,buildLoveStation,poseLoveArm} from './ok-go-love-sets.ts';
import {LoveMirrors} from './ok-go-love-mirrors.ts';

type Performer={id:LoveId;model:VoiceModel;track:TeleTrack};
type State=ReturnType<typeof loveState>;
type Actor={id:LoveId;figure:VideoFigure;lapels:THREE.Group;tie:THREE.Mesh;cap:THREE.Group;
  mosaic:THREE.InstancedMesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>};
const balloonColors=['#e9772b','#cb4355','#cc5594','#a6bc63','#efa93d','#8d6cbb','#53a284'];
const costume=['#786052','#c9bea3','#a74868'];
const panelTone=['#516868','#5d756b','#8d7061','#546270'];

function tint(mesh:THREE.Mesh,c:string){(mesh.material as THREE.MeshBasicMaterial).color.set(c);}

function singer(p:VideoProps,root:THREE.Scene,person:Performer,i:number):Actor{
  const f=new VideoFigure(person.model,person.track,p,root,costume[i],['#d5b39c','#c1a58b','#c49e84'][i]);
  f.root.name=person.id;
  const origin=bodyPoint(person.model),scale=person.model.tract.scale;
  f.hair.begin();
  for(let j=0;j<46;j++){
    const a=j*2.39996,c=Math.cos(a),s=Math.sin(a);
    const points=Array.from({length:12},(_,k):Point=>{
      const q=k/11,pt=origin(-2.0+c*(3.9+q)-3.4*q,23.5-7.2*q+Math.cos(k*.68+a)*1.15*q);
      return [pt.x,pt.y,s*(2.7+q*3.6)*scale];
    });
    p.line(f.hair,points,i===0?j%5?'#624936':'#a08056':'#4c433c',i===0?1.3:.85);
  }
  f.hair.end();
  const lapels=propGroup(f.root);
  p.box(lapels,19,54,2,'#d7c6a4',[0,-37,11.6]);
  for(const sign of [-1,1]){
    const flap=p.box(lapels,7,43,2.5,'#8f7560',[sign*11.5,-33,13]);
    flap.rotation.z=sign*.29;
  }
  const tie=p.box(lapels,4.4,29,1.4,'#383637',[0,-40,14.2]);
  const cap=propGroup(f.root);
  p.oval(cap,[0,24,-5],[13,8.7,11],'#54473d');
  p.box(cap,25.6,2.6,16.6,'#5b4b3f',[0,22,-1]);
  for(const sign of [-1,1]){
    p.box(cap,9.8,4.7,1.4,'#2a3d3c',[sign*6.2,16.1,10.0]);
    p.box(cap,8.8,.8,1.5,'#5e7772',[sign*6.2,18.4,10.8]);
  }
  p.box(cap,4.3,1.1,1.1,'#2a3d3c',[0,17.3,11.2]);
  const mosaicGeometry=new THREE.BufferGeometry();
  mosaicGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,1,-1,0,1,1,0,-1,-1,0,1,1,0,-1,1,0],3));
  const mosaic=new THREE.InstancedMesh(mosaicGeometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),190);
  const stamp=new THREE.Object3D(),color=new THREE.Color();
  for(let j=0;j<mosaic.count;j++){
    const a=j*2.39996,rows=Math.floor(j/19);
    const r=13+((j%15)*.74);
    stamp.position.set(Math.sin(a)*r,-13-rows*6.3,Math.cos(a)*(11+rows*.42)+.8);
    stamp.rotation.set(.35*Math.sin(a),a*.62,.6*Math.cos(a));
    const k=1.7+j%5*.34;stamp.scale.set(k,k*(.66+j%7*.09),k);
    stamp.updateMatrix();
    mosaic.setMatrixAt(j,stamp.matrix);
    mosaic.setColorAt(j,color.set(['#cec2a3','#e5d8b5','#8d887b','#e6e2cd','#aa9b81'][j%5]));
  }
  mosaic.instanceMatrix.needsUpdate=true;
  mosaic.computeBoundingSphere();
  f.root.add(mosaic);
  return {id:person.id,figure:f,lapels,tie,cap,mosaic};
}

function balloonRig(p:VideoProps,root:THREE.Scene) {
  const g=propGroup(root,[0,0,-42]);
  const table=p.mesh(g,new THREE.CylinderGeometry(68,69,12,36),[0,34,0],'#337970');
  p.tube(g,[0,0,0],[0,29,0],7,'#536564');
  const strings=p.ink(g);
  const balls=Array.from({length:46},(_,i)=>
    p.oval(g,[0,60,0],[8+i%5*2.6,9+i%4*3.1,8+i%5*2.6],balloonColors[i%balloonColors.length]));
  return {g,table,balls,strings};
}

function frames(p:VideoProps,root:THREE.Scene,texture:THREE.Texture) {
  const g=propGroup(root);
  const rectangles:THREE.Mesh[]=[];
  for(let row=0;row<4;row++)for(let side=-1;side<=1;side+=2)for(let col=0;col<3;col++){
    const pane=propGroup(g,[side*(72+col*58),97+row*45,-row*125-col*18]);
    pane.rotation.y=-side*(.16+col*.16);
    p.box(pane,60,104,3,'#cec39f',[0,0,0]);
    const face=p.mesh(pane,new THREE.PlaneGeometry(55,99),[0,0,2],panelTone[(col+row)%4]);
    (face.material as THREE.MeshBasicMaterial).map=texture;
    rectangles.push(face);
  }
  const lines=p.ink(g);
  lines.begin();
  for(let depth=0;depth<8;depth++){
    const z=13-depth*83,a=173+depth*4;
    p.line(lines,[[-a,14,z],[a,14,z],[a,276,z],[-a,276,z]],depth%2?'#cfbe96':'#e1cca1',1.4,true);
    p.line(lines,[[-a,14,z],[0,142,z],[-a,276,z]],'#ac9c86',.85);
    p.line(lines,[[a,14,z],[0,142,z],[a,276,z]],'#a8a38a',.85);
  }
  lines.end();
  return {g,rectangles};
}

function lens(p:VideoProps,scene:THREE.Scene) {
  const ring=propGroup(scene,[0,136,39]);
  const edges=p.ink(ring);
  edges.begin();
  for(let i=0;i<8;i++){
    const r=11+i*3.1;
    p.ring(edges,[0,0,i*.56],[r,0,0],[0,r,0],i%2?'#a89e81':'#5a6461',i%2===0?1.6:.85);
  }
  edges.end();
  p.oval(ring,[0,0,0],[23.4,23.4,7],'#272d2d');
  p.oval(ring,[0,0,7],[15.3,15.3,3],'#38494a');
  p.oval(ring,[-5,7,9],[2.6,2.6,1.4],'#92a6a2');
  return ring;
}

/** Continuous camera, articulated mirror arms and a single live reflection pass. */
export class LoveStage {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(36,16/9,1,6300);
  readonly props=new VideoProps();
  readonly station=buildLoveStation(this.props,this.scene);
  readonly mirrors=new LoveMirrors(this.scene);
  readonly actors:Actor[];
  readonly armsRoot=propGroup(this.scene);
  readonly arms=Array.from({length:16},(_,i)=>{
    const side=i%2===0?-1:1,row=Math.floor(i/2),large=i>=12;
    return buildLoveArm(this.props,this.armsRoot,[side*(large?137:104+row%2*12),0,
      large?33-(row-6)*122:178-row*94],side,large);
  });
  readonly balloons=balloonRig(this.props,this.scene);
  readonly frameRig=frames(this.props,this.scene,this.mirrors.target.texture);
  readonly portraitScene=new THREE.Scene();
  readonly portraitCamera=new THREE.PerspectiveCamera(31,1,1,1200);
  private readonly portraits:Actor[];
  private readonly aperture=lens(this.props,this.scene);
  private readonly credit=tourLabel(this.props,this.scene,'OK GO   LOVE',[0,146,94],3.4,'#f2e4c1');
  private readonly light=wash(this.props.oval(this.scene,[0,2,24],[138,.7,103],'#d3b06d'),.23);
  private readonly background=new THREE.Color();
  private readonly portraitBg=new THREE.Color();
  private readonly costumeColor=new THREE.Color();
  private readonly fog=new THREE.Fog('#9c876b',550,2240);
  private last=-1;
  private epoch=-1;
  private reflectionNeeded=true;

  constructor(people:Performer[]) {
    this.actors=people.map((person,i)=>singer(this.props,this.scene,person,i));
    this.portraits=people.map((person,i)=>singer(this.props,this.portraitScene,person,i));
    for(const arm of this.arms){
      const material=arm.face.material as THREE.MeshBasicMaterial;
      material.map=this.mirrors.target.texture;
      material.color.set(arm.size>1?'#f1dab4':'#d8ded1');
    }
    this.scene.fog=this.fog;
    this.resize(1280,720);
    this.frame(0,false,0,'wide',0);
  }

  resize(width:number,height:number){
    this.camera.aspect=Math.max(1,width)/Math.max(1,height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width,height);
    this.actors.forEach(a=>a.figure.head.resize(width,height));
    this.portraits.forEach(a=>a.figure.head.resize(448,448));
  }

  renderReflections(renderer:THREE.WebGLRenderer){
    if(this.reflectionNeeded)this.mirrors.capture(renderer,this.portraitScene,this.portraitCamera);
  }

  frame(at:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,active?:CharacterId){
    const {s,position}=loveCamera(view,at,this.camera.aspect);
    const reset=epoch!==this.epoch||Math.abs(s.t-this.last)>.27;
    const dt=Math.max(0,Math.min(.05,s.t-this.last));
    this.last=s.t;this.epoch=epoch;
    this.camera.position.set(...position);
    this.camera.up.set(0,1,0);
    this.camera.lookAt(...s.focus);
    this.camera.updateMatrixWorld();

    this.scene.background=this.background.set(s.look==='reflective'?'#6f5e53':'#ac9678');
    this.fog.color.copy(this.background);
    this.station.table.visible=s.view==='love-count';
    this.configureMirrors(s);
    this.configureArms(s);
    this.configureBalloons(s);
    this.credit.visible=s.view==='love-credits';
    this.light.visible=s.lead;
    this.light.position.set(s.focus[0],.4,s.focus[2]+16);
    const ending=s.view==='love-celebrate'||s.view==='love-credits';
    for(const [i,a] of this.actors.entries()){
      a.figure.root.visible=i===0?s.lead:i===1?s.view==='love-swap'||ending:s.view==='love-count'||ending||s.view==='love-bow';
      if(a.figure.root.visible)this.poseActor(a,s,i,false);
    }
    this.scene.updateMatrixWorld(true);
    for(const a of this.actors)if(a.figure.root.visible)a.figure.update(s.t,playing,this.camera,dt,reset);

    this.portraitScene.background=this.portraitBg.set(s.pattern==='balloons'?'#245948':s.look==='reflective'?'#6a5440':'#56483f');
    this.portraitCamera.position.set(0,149,178);
    this.portraitCamera.lookAt(0,143,0);
    this.portraitCamera.updateMatrixWorld();
    const pick=active==='love-crew'?2:s.t<20||s.pattern==='balloons'?1:0;
    for(const [i,a] of this.portraits.entries()){
      a.figure.root.visible=i===pick;
      if(a.figure.root.visible){
        this.poseActor(a,s,i,true);
        a.figure.root.updateMatrixWorld(true);
        a.figure.update(s.t,playing,this.portraitCamera,dt,reset);
      }
    }
    this.scene.updateMatrixWorld(true);
    this.reflectionNeeded=this.mirrors.screen.visible||this.frameRig.g.visible||this.arms.some(a=>a.root.visible);
  }

  private configureMirrors(s:State) {
    const z=s.focus[2]-(s.lead?59:-19);
    const width=s.lead?s.width*1.52:s.width*1.92;
    const height=s.lead?s.height*1.28:s.height*1.72;
    this.mirrors.screen.position.set(0,s.focus[1],z);
    this.mirrors.screen.scale.set(width*.5,height*.5,1);
    this.mirrors.screen.rotation.set(s.pattern==='balloons'&&s.lead?-.08:0,
      s.lead?.14*Math.sin(s.t*.61):0,s.pattern==='prism'?.15*Math.sin(s.t*.73):0);
    const fade=s.lead?.76:.98;
    this.mirrors.pose(s.pattern,s.t,fade*(.25+.75*s.mix));
    this.aperture.visible=s.view==='love-lens';
    this.aperture.position.z=z+5;
    this.frameRig.g.visible=s.pattern==='crystal'||s.pattern==='tunnel'&&s.lead;
    this.frameRig.g.position.z=s.focus[2]-74;
    const cool=.5+.5*Math.sin(s.t*.77);
    for(const [i,rect] of this.frameRig.rectangles.entries())
      (rect.material as THREE.MeshBasicMaterial).color.setRGB(.83-.32*cool,.67+.20*cool,.45+.39*cool).multiplyScalar(.85+i%4*.04);
  }

  private configureArms(s:State){
    const end=s.view==='love-celebrate'||s.view==='love-credits'||s.view==='love-bow';
    for(const [i,a] of this.arms.entries()){
      const large=a.size>1;
      a.root.visible=s.rig==='giants'?large:s.rig==='prism'?i<10:s.rig==='rings'?i<12:false;
      if(!a.root.visible)continue;
      const reach=s.view==='love-mirrors-open'?.16:s.rig==='prism'?1.0:s.rig==='giants'?.30:.52;
      poseLoveArm(this.props,a,end?233.1:s.t,i*.74,reach);
      a.root.position.z+=s.focus[2]-(large?141:238);
      if(large)a.panel.rotation.z+=a.side*.72*Math.sin(s.t*.27);
    }
  }

  private configureBalloons(s:State){
    const r=this.balloons;
    r.g.visible=s.pattern==='balloons';
    if(!r.g.visible)return;
    r.g.position.z=s.focus[2]+(s.view==='love-balloons'?-104:-16);
    r.table.visible=s.view==='love-balloon-rig';
    r.strings.begin();
    for(const [i,b] of r.balls.entries()){
      const a=i*2.39996+s.t*.89,q=(i*.143+s.local*.24)%1;
      const radius=34+i%9*7+12*Math.sin(s.t*1.9+i*.7);
      const height=48+Math.sin(q*Math.PI)*138;
      const x=Math.cos(a)*radius,z=Math.sin(a)*radius*.86;
      b.position.set(x,height,z);
      b.rotation.set(a*.4,q*2,q*.6);
      this.props.line(r.strings,[[x,height-9,z],[x*.88,height-24,z+.5],[x*.75,height-38,z+3]],'#baac86',.66);
    }
    r.strings.end();
  }

  private poseActor(a:Actor,s:State,i:number,portrait:boolean) {
    const f=a.figure,step=Math.sin(s.pulse*Math.PI*2+i*.5),sway=Math.sin(s.pulse*Math.PI+i*.45);
    let x=i===0?0:i===1?-78:82,y=151+Math.abs(step)*2.4,z=s.focus[2]+9;
    let yaw=.19+.16*sway,roll=.034*step,pitch=0;
    const arms:[Point,Point,Point,Point]=[[-27,-35,9],[-33,-61,9+8*step],[27,-35,9],[33,-62,10-8*step]];
    const close=s.view==='love-count',party=s.view==='love-celebrate'||s.view==='love-bow'||s.view==='love-credits';
    const crystal=s.look==='reflective';
    if(close&&i!==0){
      x=-39;y=148;z=88;yaw=.54+.085*sway;
      arms[1]=[-23,-28,25];arms[3]=[26,-8,24];
    } else if(party){
      y=148+Math.abs(sway)*4;z+=i===0?-8:12;
      yaw=(i-1)*-.20+sway*.12;
      if(i!==0){arms[1]=[-37,-12+13*step,22];arms[3]=[38,-3-14*step,22];}
      if(s.view==='love-bow'&&i===0)pitch=.29*Math.sin(s.local*.91);
    } else if(crystal&&i===0){
      arms[1]=[-43,-38+16*sway,31];arms[3]=[43,-37-14*sway,30];
    }
    if(portrait){x=0;y=150;z=0;yaw=-.14+.12*sway;}
    f.root.position.set(x,y,z);
    f.root.rotation.set(pitch,yaw,roll);
    const body=crystal&&i===0?'#b8ac96':close?costume[1]:costume[i];
    tint(f.torso,body);
    f.arms.forEach(m=>tint(m,body));
    f.legs.forEach(m=>tint(m,i===0?'#594839':i===1?'#8a826e':'#684c62'));
    a.mosaic.visible=crystal&&i===0;
    a.lapels.visible=i===0&&!a.mosaic.visible;
    a.tie.visible=a.lapels.visible;
    a.cap.visible=i===1||close;
    if(a.mosaic.visible){
      const k=.5+.5*Math.sin(s.t*.77);
      a.mosaic.material.color.copy(this.costumeColor.setRGB(.72+.20*(1-k),.74+.16*k,.61+.26*k));
    }
    f.pose(s.t,arms,false);
  }

  dispose(){
    for(const a of [...this.actors,...this.portraits]){
      a.figure.dispose();
      a.mosaic.dispose();
      a.mosaic.geometry.dispose();
      a.mosaic.material.dispose();
    }
    this.mirrors.dispose();
    this.props.dispose();
  }
}
