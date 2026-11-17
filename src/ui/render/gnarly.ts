import * as THREE from 'three';
import {GNARLY_CAST, GNARLY_SHOTS, gnarlyCamera, gnarlyState, type GnarlyId, type GnarlyRoom} from '../../scene/gnarly.ts';
import type {CameraView, CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure, VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {buildGnarlySets} from './gnarly-sets.ts';

type Voice = {id:GnarlyId; model:VoiceModel; track:TeleTrack};
type State = ReturnType<typeof gnarlyState>;
type Actor = {
  index:number;
  role:GnarlyId;
  figure:VideoFigure;
  jacket:THREE.Mesh[];
  belt:THREE.Mesh[];
  fringe:THREE.Group;
  cuffs:THREE.Mesh[];
  studs:THREE.Group;
};
type Palette = [string,string,string,string,string,string];

const kitchen:Palette=['#dfcabc','#d6c294','#a2c3ac','#e4d9b4','#b89872','#cea9b1'];
const club:Palette=['#97b58b','#da586d','#58999b','#d7d8b4','#a1a664','#a26998'];
const limo:Palette=['#605b7f','#5da0a9','#b290bf','#9b6276','#bad2cc','#686d9b'];
const house:Palette=['#b58b60','#684d4b','#b5746f','#ae9878','#956a6b','#9b845b'];
const carpet:Palette=['#262831','#3b2732','#374451','#4e3340','#242b33','#332535'];
const skin=['#bf8c7e','#ae765e','#cfaa93','#936758','#bda085','#b98f77'];
const hair=['#221e2a','#312b2d','#302033','#383035','#827055','#493049'];
const backgrounds:Record<GnarlyRoom,string>={
  tray:'#120a18',kitchen:'#3f535c',corridor:'#691936',booth:'#170d19',
  club:'#111c22',street:'#1b273c',limo:'#173659',house:'#af8a6e',
  hills:'#d78962',carpet:'#16141f',blade:'#452535',card:'#101624',
};

function paint(mesh:THREE.Mesh,color:string) {
  (mesh.material as THREE.MeshBasicMaterial).color.set(color);
}

/** Six costumed performers share three retained physical mouth models. */
export class GnarlyStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35,16/9,1,6200);
  readonly props = new VideoProps();
  readonly sets = buildGnarlySets(this.props,this.scene);
  readonly actors:Actor[];
  private readonly featuredVoices = new Map<number,number>();
  private readonly backdrop = new THREE.Color();
  private readonly fog = new THREE.Fog('#101620',450,2360);
  private readonly illumination = new THREE.Vector3();
  private readonly veil = new THREE.Mesh(new THREE.PlaneGeometry(10,10),
    new THREE.MeshBasicMaterial({color:'#0d121e',depthTest:false,depthWrite:false,transparent:true}));
  private last = -1;
  private epoch = -1;

  constructor(voices:Voice[]) {
    const parts = GNARLY_CAST.map(id=>voices.find(p=>p.id===id));
    if (parts.some(p=>!p)) throw Error('Gnarly needs three retained mouth tracks.');
    this.actors=Array.from({length:6},(_,i)=>this.makeActor(i,parts[i%3]!));
    for(const [i,[start,view]] of GNARLY_SHOTS.entries()) {
      const {formation,focus}=gnarlyState(view,start);
      if(formation!=='solo'&&formation!=='pair'&&formation!=='lift')continue;
      const end=GNARLY_SHOTS[i+1]?.[0] ?? parts[0]!.track.duration;
      let featured=focus, strength=.00001;
      for(const [index,voice] of parts.entries()){
        const track=voice!.track;
        let power=0;
        for(let at=start+.025;at<end;at+=.05) {
          const level=track.message(track.indexAt(at)).t.outRms;
          power+=level*level;
        }
        if(power>strength){
          featured=index;
          strength=power;
        }
      }
      this.featuredVoices.set(start,featured);
    }
    this.veil.renderOrder=1000;
    this.scene.add(this.veil);
    this.resize(1280,720);
    this.frame(0,false,0,'wide',0);
  }

  private makeActor(index:number,voice:Voice):Actor {
    const p=this.props;
    const f=new VideoFigure(voice.model,voice.track,p,this.scene,kitchen[index],skin[index]);
    const point=bodyPoint(voice.model);
    const scale=voice.model.tract.scale;
    const xyz=(x:number,y:number,z:number):Point=>{
      const at=point(x,y);
      return [at.x,at.y,z*scale];
    };
    const length=[17,10,14,11,19,16][index];
    f.hair.begin();
    for(let i=0;i<48;i++) {
      const q=i*2.39996;
      const x=-3.8+Math.cos(q)*6.3;
      const z=Math.sin(q)*6.4;
      const fall=length+(i%7)*.47;
      p.line(f.hair,[
        xyz(x,23.6+(i%4)*.33,z*.58),xyz(x-.7,23,z*1.03),
        xyz(x-2.8,19+Math.cos(i)*1.5,z),xyz(x-6,fall,z*.94)
      ],i%7===0?(index===4?'#ba9b76':'#6b4c66'):hair[index],index===2?2.2:1.65);
    }
    f.hair.end();
    const fringe=new THREE.Group();
    f.root.add(fringe);
    for(const s of [-1,1]) {
      for(let i=0;i<8;i++) {
        const x=s*(16+i*1.25);
        p.tube(fringe,[x,-20,8],[x+s*4,-38+(i%3)*3,12],.97,'#e1d4ba');
      }
    }
    const jacket:THREE.Mesh[]=[];
    for(const s of [-1,1]) {
      jacket.push(p.oval(f.root,[s*15,-24,3],[10.2,13.6,10.7],kitchen[index]));
      const seam=p.box(f.root,3.8,39,1.6,'#d7bea4',[s*11,-38,13]);
      seam.rotation.z=s*.15;
      jacket.push(seam);
    }
    const belt=[
      p.box(f.root,40,7.8,25,'#354a44',[0,-67,0]),
      p.box(f.root,12,7.6,2.2,'#c5ae88',[4,-67,13.7]),
      p.box(f.root,7,3.6,1.9,'#39443c',[4,-67,15]),
    ];
    const studs=new THREE.Group();
    f.root.add(studs);
    for(let i=0;i<20;i++) {
      const x=(i%5-2)*5.6,y=-18-Math.floor(i/5)*8.9;
      p.mesh(studs,new THREE.TorusGeometry(1.6,.42,5,10),[x,y,13.1],'#ccd7cf');
    }
    const cuffs=[-1,1].map(s=>p.oval(f.root,[s*36,-48,20],[5.9,7.7,5.4],'#c9beba'));
    return {index,role:voice.id,figure:f,jacket,belt,fringe,cuffs,studs};
  }

  resize(width:number,height:number) {
    this.camera.aspect=Math.max(1,width)/Math.max(1,height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width,height);
    for (const a of this.actors) a.figure.head.resize(width,height);
  }

  frame(at:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId) {
    const s=gnarlyState(view,at);
    const camera=gnarlyCamera(view,s.t,this.camera.aspect);
    this.camera.position.set(...camera.position);
    this.camera.up.set(...camera.up);
    this.camera.lookAt(...camera.target);
    this.camera.updateMatrixWorld();
    const reset=epoch!==this.epoch || Math.abs(this.last-s.t)>.28;
    const dt=Math.max(0,Math.min(.05,s.t-this.last));
    this.last=s.t;
    this.epoch=epoch;
    this.sets.update(s);
    this.scene.background=this.backdrop.set(s.dark?'#381720':backgrounds[s.room]);
    this.scene.fog=['tray','card','blade'].includes(s.room)?null:this.fog;
    this.fog.color.copy(this.backdrop);
    const exactCharacter=GNARLY_CAST.some(id=>id===view);
    const sourceCut=gnarlyState('wide',s.t).view===s.view;
    const focus=!exactCharacter&&sourceCut ? this.featuredVoices.get(s.cut) ?? s.focus : s.focus;
    for(const actor of this.actors){
      const pos=(actor.index-focus+6)%6;
      const visible=s.formation==='line'||s.formation==='crowd' ||
        (s.formation==='solo'||s.formation==='lift')&&pos===0 ||
        s.formation==='pair'&&pos<2;
      actor.figure.root.visible=visible;
      if(visible)this.pose(actor,s,pos);
    }
    this.scene.updateMatrixWorld(true);
    for(const {figure} of this.actors) {
      if(figure.root.visible) figure.update(s.t,playing,this.camera,dt,reset);
    }
    this.camera.getWorldDirection(this.illumination);
    this.veil.position.copy(this.camera.position).addScaledVector(this.illumination,2);
    this.veil.quaternion.copy(this.camera.quaternion);
    this.veil.material.opacity=1-s.fade;
    this.veil.visible=s.fade<1;
    this.scene.updateMatrixWorld(true);
  }

  private pose(actor:Actor,s:State,slot:number) {
    const f=actor.figure;
    const q=s.beat*Math.PI;
    const step=Math.sin(q+actor.index*.13);
    const chop=Math.sin(q*2+actor.index*.17);
    const seated=s.room==='limo';
    const tray=s.room==='tray'||s.room==='blade'||s.view==='gnarly-screen';
    const group=s.formation==='line'||s.formation==='crowd';
    const woven=s.room==='carpet'||s.room==='club';
    const palette=s.room==='carpet'?carpet:s.room==='club'?club:s.room==='limo'?limo:s.room==='house'?house:kitchen;
    const color=s.dark?'#421d30':palette[actor.index];
    const accent=s.room==='carpet'?'#a4afba':s.room==='club'?'#b7d88d':s.room==='limo'?'#b1d3eb':'#d3bf9f';
    let pos:Point=[0,151+Math.abs(chop)*2,48];
    let yaw=.11*step, roll=.045*step, tilt=-.04*chop;
    let arms:[Point,Point,Point,Point]=[
      [-29,-38,11],[-37,-57+12*chop,23],[29,-35,12],[40,-45-13*chop,28],
    ];
    if(group){
      const x=[0,-69,69,-140,140,-196][slot];
      const z=[47,2,1,-48,-47,-88][slot];
      pos=[x+step*9,149+Math.abs(chop)*3,z+(s.room==='limo'?-30:0)];
      if(seated)pos[1]=133+Math.abs(chop)*3;
      if(s.view==='gnarly-runway'){
        pos=[(slot%2-.5)*62,148+Math.abs(chop)*2,80-slot*54+(s.t-s.cut)*11];
      }
      arms=[[-38,-31+12*step,17],[-58,-40+35*step,31],
        [38,-31-12*step,17],[58,-40-35*step,31]];
      if(woven && Math.floor(s.beat/4)%2===0) {
        arms=[[-30,-34,18],[-44,-23+9*step,28],[30,-34,18],[44,-23-9*step,30]];
        tilt=.12*Math.abs(chop);
        pos[1]-=8*Math.abs(chop);
      }
    } else if(s.formation==='pair') {
      pos=[slot===0?-36:36,seated?137:152,slot===0?56:34];
      yaw=slot===0?.19:-.19;
    } else if(s.formation==='lift') {
      pos=[s.view==='gnarly-balcony'?-35:-39,151+6*chop,54];
      roll=1.34+.12*step;
      tilt=.18;
      arms=[[-37,-29,21],[-58,-4,30],[36,-27,21],[54,-4,31]];
    }
    if(s.room==='tray') {
      pos=[0,166,17];
      yaw=.08*step; roll=.03*step; tilt=0;
    } else if(s.view==='gnarly-screen') {
      pos=[-110,157,27];
      yaw=.05;
    } else if(s.view==='gnarly-crowd-face'){
      pos=[0,144,107];
    } else if(s.view==='gnarly-carpet-door'){
      pos=[slot===0?24:87,153,65];
    } else if(s.view==='gnarly-boba' || s.view==='gnarly-bite') {
      arms[2]=[31,-27,24];
      arms[3]=[30,-25,41];
    } else if(s.view==='gnarly-kitchen-face'||s.view==='gnarly-red-face') {
      arms[1]=[-39,-9+18*step,34];
      arms[3]=[44,-24-18*step,27];
    } else if(s.room==='blade'){
      pos=[0,156,29];
      roll=.28; yaw=.18;
    }
    if(s.view==='gnarly-fridge') {
      arms[0]=[-37,-17,14];arms[1]=[-52,-7,24];
    }
    f.root.position.set(...pos);
    f.root.rotation.set(tilt,yaw,roll);
    f.root.scale.setScalar(s.room==='blade'?.87:1);
    if(s.room==='tray') f.head.scene.scale.set(2.36,2.36,3.12);
    else f.head.scene.scale.setScalar(s.formation==='lift'?1.93:2.1);
    f.pose(s.t,arms,seated);
    for(const mesh of [f.torso,...f.arms,...f.legs,...f.feet]) {
      paint(mesh,color);
      mesh.visible=!tray;
    }
    for(const mesh of f.hands)mesh.visible=!tray;
    for (const [i,mesh] of actor.jacket.entries()) {
      paint(mesh,i%2===0?color:accent);
      mesh.visible=!tray;
    }
    for (const [i,mesh] of actor.belt.entries()) {
      paint(mesh,i===1?accent:i===0?color:'#343241');
      mesh.visible=!tray;
    }
    actor.fringe.visible=!tray&&(seated||s.room==='house'||s.room==='club'&&slot%2===1);
    actor.studs.visible=!tray&&woven;
    for (const [i,cuff] of actor.cuffs.entries()){
      cuff.visible=!tray;
      paint(cuff,accent);
      cuff.position.copy(f.hands[i].position).lerp(f.arms[i*2+1].position,.23);
    }
    if(group&&!seated) {
      for(const [i,sign] of [-1,1].entries()) {
        const knee:Point=[sign*14,-105+Math.max(0,sign*step)*6,9+4*chop];
        const foot:Point=[sign*18+step*5,-144+Math.max(0,sign*step)*10,8+chop*7];
        this.props.segment(f.legs[i*2],[sign*10,-70,0],knee,7);
        this.props.segment(f.legs[i*2+1],knee,foot,5);
        f.feet[i].position.set(...foot);
      }
    }
  }

  dispose() {
    this.actors.forEach(a=>a.figure.dispose());
    this.props.dispose();
    this.veil.geometry.dispose();
    this.veil.material.dispose();
  }
}
