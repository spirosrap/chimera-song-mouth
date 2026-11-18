import * as THREE from 'three';
import {subwayState,type SubwaySet} from '../../scene/the-subway.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure,VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';
import {tourLabel,wash} from './house-tour-props.ts';
import {buildSubwaySets} from './subway-sets.ts';

type State=ReturnType<typeof subwayState>;
const red=['#522b28','#723929','#97513b','#b45a3e','#d68758','#f3b37d'];
const green=['#294638','#365535','#537043','#719756','#94ad67'];
const backdrops:Record<SubwaySet,string>={
  day:'#9a9480',night:'#263141',station:'#5d766a',train:'#526c62',
  'train-side':'#292f3c',roof:'#a59d8c',fountain:'#152c37',hair:'#432d2c',sky:'#203b5d',black:'#000000',
};

function color(mesh:THREE.Mesh,value:string) {
  (mesh.material as THREE.MeshBasicMaterial).color.set(value);
}

function wigs(p:VideoProps,figure:VideoFigure) {
  const origin=bodyPoint(figure.model);
  const scale=figure.model.tract.scale;
  figure.hair.begin();
  for(let i=0;i<64;i++){
    const side=i%2===0?-1:1;
    const spread=5.1+(i%12)*.51;
    const fall=(i%9)*1.15;
    const points=Array.from({length:29},(_,j):Point=>{
      const k=j/28,a=j*.81+i*.46;
      const curl=Math.sin(Math.PI*k)*(1.5+k*.8);
      const px=-1.5-6.6*k+curl*Math.sin(a);
      const pt=origin(px,24.2-(10.8+fall)*k+Math.cos(a)*curl*.9);
      return [pt.x,pt.y,side*(.8+spread*Math.sin(k*Math.PI*.76)+curl*Math.cos(a))*scale];
    });
    p.line(figure.hair,points,red[i%red.length],i%3?1.3:2.1);
  }
  figure.hair.end();
  const tail=p.ink(figure.root);
  for(let i=0;i<14;i++){
    const side=i%2===0?-1:1;
    const y=12-Math.floor(i/2)*7;
    const z=-12-Math.floor(i/4)*2.2;
    p.oval(figure.root,[side*(11+Math.floor(i/3)*1.9),y,z],
      [8+i%3,11+i%4,8.2],red[i%4]);
  }
  for(const sign of [-1,1]){
    p.mesh(figure.root,new THREE.TorusGeometry(3.5,.6,5,16),[sign*15,-4,2],'#edc18b');
  }
  return tail;
}

function passerby(p:VideoProps,scene:THREE.Scene,i:number) {
  const root=propGroup(scene);
  const coat=['#9d9483','#374353','#657b76','#b6a16f','#8a6574','#995e4b','#6a7a9b','#483e52'][i%8];
  const skin=['#b68d70','#745442','#a07058','#cbaa92'][i%4];
  p.oval(root,[0,118,0],[13,19,11],skin);
  p.oval(root,[0,130,-3],[14,10,11],i%4===0?'#db9c75':i%4===1?'#343144':'#7b5948');
  p.mesh(root,new THREE.CylinderGeometry(20,16,49,13),[0,82,0],coat).scale.z=.64;
  const arms=[-1,1].map(()=>p.mesh(root,new THREE.CylinderGeometry(1,1,1,11),[0,0,0],coat));
  for(const sign of [-1,1]){
    p.tube(root,[sign*9,58,0],[sign*11,10,0],6.7,i%4===0?'#625975':'#303840');
    p.oval(root,[sign*11,8,4],[7,3.7,11],slateShoe);
  }
  return {root,arms};
}
const slateShoe='#313741';

function greenTraveler(p:VideoProps,scene:THREE.Scene) {
  const root=propGroup(scene);
  p.oval(root,[0,100,-3],[23,54,14],'#314f3b');
  p.oval(root,[0,134,-4],[17,25,13],'#486548');
  const weave=p.ink(root);
  weave.begin();
  for(let i=0;i<73;i++){
    const a=i*2.39996,side=Math.cos(a),face=Math.sin(a);
    p.line(weave,Array.from({length:32},(_,j):Point=>{
      const f=j/31,k=Math.sin(j*.55+i*.26);
      const r=3.9+22*Math.sin(f*Math.PI*.61);
      return [side*r+k*(2+f*4),157-f*(139+i%8),face*r*.56+Math.cos(j*.5+i*.32)*2.5];
    }),green[i%green.length],i%4===0?2.1:1.3);
  }
  weave.end();
  return root;
}

/** Source-timed sets, hair and subway passengers for the supplied full edit. */
export class SubwayStage {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(36,16/9,1,4400);
  readonly props=new VideoProps();
  readonly sets=buildSubwaySets(this.props,this.scene);
  readonly singer:VideoFigure;
  readonly traveler=greenTraveler(this.props,this.scene);
  private readonly extras=Array.from({length:12},(_,i)=>passerby(this.props,this.scene,i));
  private readonly hair:ReturnType<VideoProps['ink']>;
  private readonly title=tourLabel(this.props,this.sets.groups.day,'THE SUBWAY',[0,19,65],2.1,'#f2dfbe');
  private readonly shoe=propGroup(this.sets.groups.day);
  private readonly tumble=Array.from({length:3},()=>propGroup(this.sets.groups.day));
  private readonly blouse=new THREE.Group();
  private readonly takeout=propGroup(this.sets.groups.fountain,[39,16,66]);
  private readonly figureLight=wash(this.props.oval(this.scene,[0,80,22],[125,114,2],'#a77c48'),.08);
  private readonly fog=new THREE.Fog('#283743',390,1650);
  private readonly background=new THREE.Color();
  private last=-1;
  private epoch=-1;

  constructor(person:{model:VoiceModel;track:TeleTrack}) {
    this.singer=new VideoFigure(person.model,person.track,this.props,this.scene,'#713737','#ddc0ae');
    this.hair=wigs(this.props,this.singer);
    for(const [i,root] of this.tumble.entries()){
      const ink=this.props.ink(root);
      ink.begin();
      for(let j=0;j<21;j++){
        const a=j*2.39996,r=4+j%6;
        this.props.line(ink,Array.from({length:16},(_,k):Point=>[
          Math.cos(k*.83+a)*(r+k*.14)+Math.cos(a)*r*.63,
          Math.sin(k*.91+a)*(r*.62)+Math.sin(a)*r*.48,
          Math.sin(k*.79+a)*(r+k*.23),
        ]),red[(i+j)%red.length],1.6);
      }
      ink.end();
    }
    this.props.oval(this.shoe,[0,5,12],[7.5,3.5,17],'#6a3137');
    this.props.box(this.shoe,3.5,11,5,'#512934',[0,9,-5]);
    this.props.oval(this.shoe,[0,31,2],[5.8,22,5.3],'#c28b77');
    this.singer.root.add(this.blouse);
    for(const side of [-1,1]){
      this.props.box(this.blouse,5.7,26,1.3,'#e4dfcc',[side*9,-21,11]).rotation.z=side*.43;
      this.props.box(this.blouse,3.2,18,1.2,'#423a4c',[side*4,-26,12]).rotation.z=-side*.22;
    }
    this.props.box(this.takeout,60,5,37,'#9b9d88',[0,0,0]);
    this.props.box(this.takeout,33,3,27,'#d2c5a3',[4,4,0]);
    this.props.box(this.takeout,33,2,25,'#a29476',[17,6,-14]).rotation.x=-.82;
    for(let i=0;i<5;i++)
      this.props.oval(this.takeout,[-5+i*5,6,Math.sin(i)*8],[3.7,2.1,6],'#b7834c');
    this.props.mesh(this.takeout,new THREE.CylinderGeometry(3.6,3.3,12,11),[-21,9,3],'#ab534d');
    this.resize(1280,720);
    this.frame(0,false,0,'wide',0);
  }

  resize(width:number,height:number) {
    this.camera.aspect=Math.max(1,width)/Math.max(1,height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width,height);
    this.singer.head.resize(width,height);
  }

  frame(at:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId) {
    const s=subwayState(view,at);
    const reset=epoch!==this.epoch||Math.abs(s.t-this.last)>.28;
    const dt=Math.max(0,Math.min(.05,s.t-this.last));
    this.last=s.t;
    this.epoch=epoch;

    const [x,y,z]=s.direction;
    const fit=Math.max(.48,Math.min(1.78,this.camera.aspect));
    const distance=Math.max(s.height,s.width/fit)/(Math.tan(36*Math.PI/360)*Math.hypot(x,y,z));
    const roll=s.pose==='climb'?.07:s.pose==='wind'?-.055:0;
    this.camera.position.set(s.target[0]+x*distance+Math.sin(s.t*.47)*2.3,s.target[1]+y*distance,s.target[2]+z*distance);
    this.camera.up.set(Math.sin(roll),Math.cos(roll),0);
    this.camera.lookAt(...s.target);
    this.camera.updateMatrixWorld();

    this.scene.background=this.background.set(s.view==='subway-car-dark'||s.view==='subway-last-look'?'#3b514d':backdrops[s.set]);
    this.scene.fog=this.fog;
    this.fog.color.copy(this.background);
    for(const [name,group] of Object.entries(this.sets.groups))group.visible=name===s.set;
    this.dressSet(s);
    this.placeCommuters(s);
    this.singer.root.visible=s.pose!=='empty'&&s.pose!=='follow';
    if(this.singer.root.visible)this.perform(s);
    this.scene.updateMatrixWorld(true);
    if(this.singer.root.visible)this.singer.update(s.t,playing,this.camera,dt,reset);
    this.scene.updateMatrixWorld(true);
  }

  private dressSet(s:State) {
    const r=this.sets;
    const t=s.t;
    r.traffic.day[0].position.set(s.pose==='drag'?107:-270+((t*27)%490),0,s.pose==='drag'?8:-167);
    r.traffic.day[1].position.x=312-((t*22)%460);
    r.traffic.night[0].position.x=-258+((t*22)%490);
    r.traffic.night[1].position.x=320-((t*16)%490);
    r.car.doors.visible=s.view==='subway-doors';
    r.car.lights.position.x=Math.sin(t*.81)*35;
    r.outerCar.position.x=s.view==='subway-last-train'?-Math.max(0,t-265)*144:Math.sin(t*.87)*8;
    r.rope.rotation.z=.025*Math.sin(t*.6);
    r.bike.visible=s.pose==='bike';
    this.takeout.visible=s.view==='subway-bench';
    r.bike.position.set(9+4*Math.sin(t*2.2),0,49);
    this.title.visible=s.view==='subway-grate'&&t>=1.15&&t<5.75;
    this.figureLight.visible=s.extras==='club'&&s.set==='train';
    this.figureLight.position.x=Math.sin(t*2.1)*46;
    const opening=s.view==='subway-grate';
    this.shoe.visible=opening;
    this.shoe.position.set(-49+((t*44)%119),3.5+Math.max(0,Math.sin(t*8))*14,75);
    this.shoe.rotation.z=.27*Math.sin(t*8);
    for(const [i,root] of this.tumble.entries()){
      root.visible=opening;
      root.position.set(-44+i*37+(t*(9+i*2)%42),4+i*1.2,73-i*16);
      root.rotation.z=t*(1.7+i*.4);
    }
    this.traveler.visible=s.pose==='follow'||s.pose==='chase';
    if(this.traveler.visible){
      const ahead=s.pose==='chase';
      this.traveler.position.set((ahead?78:6)+Math.sin(t*.91)*16,Math.abs(Math.sin(s.beat*6.28))*2.4,ahead?-46:18);
      this.traveler.rotation.y=Math.sin(t*.62)*.44;
    }
    if(s.set==='hair'){
      for(const [i,rat] of r.rats.entries()){
        const angle=t*.70+i*2.39996;
        const radius=44+i*17;
        rat.position.set(Math.cos(angle)*radius,11,40+Math.sin(angle)*radius*.73);
        rat.rotation.y=Math.PI/2-angle;
      }
    }
    if(s.set==='fountain'){
      for(const [i,drop] of r.jets.entries()){
        const angle=i*2.39996,q=(t*.67+i*.19)%1;
        const spread=(i%6<3?29:44)*q;
        drop.position.set(Math.cos(angle)*spread,10+Math.sin(q*Math.PI)*(18+i%7*3),-12+Math.sin(angle)*spread);
      }
    }
  }

  private placeCommuters(s:State) {
    const club=s.extras==='club',interior=s.set==='train'||s.set==='train-side';
    for(const [i,extra] of this.extras.entries()){
      const side=i%2===0?1:-1,rank=Math.floor(i/2);
      extra.root.visible=s.extras!=='none'&&(s.set!=='train-side'||rank<3);
      if(!extra.root.visible)continue;
      const sway=Math.sin(s.beat*2*Math.PI+i*1.37),stride=Math.sin(s.beat*Math.PI+i*1.16);
      const z=interior?-31-rank*18+Math.cos(i*2.34)*16:17-rank*28+Math.sin(i*1.76)*16;
      const x=side*(65+rank*(interior?32:25))+sway*(club?14:9);
      const seated=s.set==='train'&&!club&&rank%2===0;
      extra.root.position.set(x,club?Math.abs(sway)*8:seated?30:0,z);
      extra.root.scale.set(.95+i%4*.070,seated?.78:.93+i%5*.034,.96);
      extra.root.rotation.y=side*(club?.53:.28)+sway*.28;
      const arms=extra.arms;
      this.props.segment(arms[0],[-17,99,0],[-29,club?111+25*sway:64,13+stride*9],5);
      this.props.segment(arms[1],[17,99,0],[29,club?112-26*sway:64,13-stride*9],5);
    }
  }

  private perform(s:State) {
    const f=this.singer;
    const beat=s.beat*2*Math.PI;
    const sway=Math.sin(beat*.5),kick=Math.sin(beat);
    const t=s.t;
    let at:Point=[0,151+1.8*kick,47];
    let yaw=.21+sway*.16,roll=.046*sway,pitch=0;
    let seated=false,costume='#783e36';
    const arms:[Point,Point,Point,Point]=[[-27,-39,10],[-32,-64,12],[28,-37,13],[35,-64,14]];
    switch(s.pose){
      case 'chase':
        at=[-9+9*Math.sin(t*.88),149+Math.abs(kick)*4,44+Math.sin(t*.56)*9];
        arms[1]=[-32,-53+kick*14,18];arms[3]=[35,-51-kick*13,25];
        break;
      case 'pole':
        at=[0,150+1.5*sway,48];yaw=s.view==='subway-last-look'?.62*Math.sin(t*1.4):.38+sway*.12;
        arms[2]=[28,-30,13];arms[3]=[25,-9,24];
        break;
      case 'dance':
        at=[8*Math.sin(t*1.52),147+Math.abs(kick)*10,s.set==='train-side'?3:49];
        yaw=.20+sway*.41;roll=sway*.09;
        arms[1]=[-39,-25+26*kick,26];arms[3]=[38,-17-25*kick,23];
        break;
      case 'sill':
        at=[s.view==='subway-fire-escape'?-34:0,179+1.6*sway,43];yaw=-.29+sway*.16;
        arms[1]=[-22,-51,25];arms[3]=[29,-45,27];seated=true;costume='#a3614c';
        break;
      case 'drag':
        at=[s.view==='subway-drag-wide'?-20:0,35+1.2*sway,51];
        roll=-1.32+sway*.041;yaw=.18;pitch=-.38;costume='#5e6068';
        break;
      case 'bike':
        at=[0,135+2.2*kick,53];yaw=.29;pitch=.09;seated=true;costume='#704036';
        arms[1]=[-34,-57,31];arms[3]=[37,-55,29];
        break;
      case 'float':
        at=[0,28+1.7*kick,56];yaw=.21;pitch=-.52;roll=-1.21;costume='#694859';
        break;
      case 'rise':
        at=[0,102+3.5*sway,50];yaw=s.view==='subway-arch'?.39:.095;pitch=-.09;
        arms[1]=[-21,-55,24];arms[3]=[11,-49,27];costume='#643839';seated=true;
        break;
      case 'wind':
        at=[8*sway,141+6*kick,51];yaw=.28+sway*.39;roll=kick*.105;pitch=.05*sway;costume='#c9c7b6';
        arms[1]=[-41,-5+29*kick,10];arms[3]=[47,10-31*kick,16];
        break;
      case 'climb':
        at=[-6+sway*4,149+7*Math.sin(t*.69),40];yaw=-.26+sway*.12;roll=-.105;
        arms[1]=[-15,14+kick*17,19];arms[3]=[23,17-kick*15,5];seated=true;costume='#965b50';
        break;
    }
    f.root.position.set(...at);
    f.root.rotation.set(pitch,yaw,roll);
    color(f.torso,costume);
    this.blouse.visible=s.pose==='wind';
    f.arms.forEach(m=>color(m,costume));
    f.legs.forEach(m=>color(m,s.pose==='wind'?'#565958':costume));
    f.pose(t,arms,seated);
    this.styleHair(s);
  }

  private styleHair(s:State) {
    const p=this.props;
    const long=s.pose==='wind'?105:s.pose==='climb'?151:s.pose==='drag'?217:s.pose==='float'?166:182;
    const wind=s.pose==='wind'?120:s.pose==='climb'?55:s.pose==='bike'?92:37;
    this.hair.begin();
    for(let i=0;i<77;i++){
      const side=i%2===0?1:-1;
      const lane=i%15;
      const phase=i*.83;
      const points=Array.from({length:25},(_,j):Point=>{
        const q=j/24,u=q*q;
        const curl=Math.cos(j*.96+phase)*Math.sin(q*Math.PI/2);
        const length=long*(.68+lane*.031);
        return [
          side*(10+lane*.76+10*q)+curl*(2.4+8*q)+u*wind*Math.sin(s.t*.72+i*.16)*.72,
          18-q*length+(s.pose==='wind'?Math.sin(s.t*4+phase)*u*39:curl*2.2),
          -7-lane*.75-14*q+u*(5+i%11)*Math.sin(s.t*.9+phase),
        ];
      });
      p.line(this.hair,points,red[i%red.length],i%4===0?2.1:1.3);
    }
    this.hair.end();
  }

  dispose() {
    this.singer.dispose();
    this.props.dispose();
  }
}
