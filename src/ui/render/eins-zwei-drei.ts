import * as THREE from 'three';
import {einsCamera, einsState, type EinsLook} from '../../scene/eins-zwei-drei.ts';
import type {CameraView, CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {propGroup} from './lithonia-set.ts';
import {VideoFigure, VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {buildEinsSets, einsLetters} from './eins-sets.ts';

export type EinsId = 'eins-sam' | 'eins-counter';
type Voice = {id: EinsId; model: VoiceModel; track: TeleTrack};
type Actor = {
  look: EinsLook;
  figure: VideoFigure;
  count: THREE.Group[];
  receiver?: THREE.Group;
};
const clothing: Record<EinsLook, string> = {
  clerk:'#abb7b5', red:'#bc403f', yellow:'#d4b75e', 'counter-left':'#35383d',
  'counter-right':'#414448', pink:'#aa4775', pizza:'#dc974e',
};

function cable(p: VideoProps, root: THREE.Object3D, start: Point, end: Point, color: string) {
  const ink = p.ink(root);
  ink.begin();
  p.line(ink, Array.from({length: 24}, (_, i) => {
    const u = i / 23;
    return [start[0]*(1-u)+end[0]*u+Math.sin(u*31)*1.2,
      start[1]*(1-u)+end[1]*u-Math.sin(u*Math.PI)*9,
      start[2]*(1-u)+end[2]*u] as Point;
  }), color, 1.6);
  ink.end();
}

export class EinsStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35, 16/9, 1, 6200);
  readonly props = new VideoProps();
  readonly sets = buildEinsSets(this.props, this.scene);
  readonly actors: Actor[];
  readonly veil = new THREE.Mesh(new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({color:'#101626', depthTest:false, depthWrite:false, transparent:true}));
  private last = -1;
  private epoch = -1;

  constructor(voices: Voice[]) {
    const sam = voices.find(v => v.id === 'eins-sam');
    const counter = voices.find(v => v.id === 'eins-counter');
    if (!sam || !counter) throw Error('Eins, Zwei, Drei needs its two voice tracks.');
    this.actors = [
      this.makeActor('clerk',sam), this.makeActor('red',sam), this.makeActor('yellow',sam),
      this.makeActor('counter-left',counter), this.makeActor('counter-right',counter),
      this.makeActor('pink',counter), this.makeActor('pizza',counter),
    ];
    this.veil.renderOrder = 1000;
    this.scene.add(this.veil);
    this.resize(1280,720);
    this.frame(0,false,0,'wide',0);
  }

  private makeActor(look: EinsLook, voice: Voice): Actor {
    const p = this.props;
    const c = clothing[look];
    const human = look === 'clerk' || look === 'red' || look === 'yellow';
    const robot = look.startsWith('counter');
    const figure = new VideoFigure(voice.model,voice.track,p,this.scene,c,human?'#c3947e':'#766d60');
    figure.head.scene.scale.setScalar(human?2.16:robot?1.86:look==='pizza'?1.91:1.68);
    const count: THREE.Group[] = [];
    let receiver: THREE.Group | undefined;
    if (human) {
      for (const side of [-1,1]) p.oval(figure.root,[side*15,-24,-1],[10.8,10,10.3],c);
      const point = bodyPoint(figure.model);
      const cm = figure.model.tract.scale;
      const strand = (x:number,y:number,z:number):Point => {
        const at=point(x,y);return [at.x,at.y,z*cm];
      };
      const hair=figure.hair;hair.begin();
      for (let i=0;i<40;i++) {
        const x=-7+(i%13)*1.05;
        const z=(i%9-4)*1.32;
        const high=2+Math.sin(i*2.67)*1.4+Math.max(0,1-Math.abs(x-1)/9)*2;
        p.line(hair,[strand(x,20.4+high*.22,z),strand(x+1.2,23+high,z*.88),
          strand(x+3.1,23.8+high*.91,z*.84),strand(x+4.4,22.7+high*.69,z*.79)],
        ['#b39371','#c6ad89','#b0a083','#9d836e'][i%4],1.8);
      }
      hair.end();
      const collar=p.ink(figure.root);collar.begin();
      for (const side of [-1,1]) p.line(collar,[[side*12,-11,8],[side*7,-24,12],[0,-16,13]],
        look==='clerk'?'#e3e6dc':'#ead9b2',1.8);
      p.line(collar,[[0,-15,12],[0,-65,12]],look==='clerk'?'#48454b':'#6d3637',2.3);
      collar.end();
      if (look==='clerk') {
        p.box(figure.root,5.2,37,1.6,'#323b40',[0,-36,12.7]);
        p.box(figure.root,8,2.3,1.6,'#b25e59',[11,-24,12.4]).rotation.z=.28;
        receiver=propGroup(figure.root);
        p.tube(receiver,[0,-11,0],[0,12,0],3.8,'#3c7161');
        p.oval(receiver,[0,-9,3],[5.4,5.1,5.2],'#61897a');
        p.oval(receiver,[0,11,3],[5.4,5.1,5.2],'#61897a');
        cable(p,receiver,[0,-11,-1],[2,-44,10],'#548072');
      } else {
        p.box(figure.root,9,3,2,'#dfb076',[10,-25,13]);
        p.box(figure.root,7,2,2,'#6f4234',[-10,-25,13]);
      }
    } else if (robot) {
      const pelt = propGroup(figure.root,[0,22,-7]);
      p.box(pelt,62,59,33,'#5a5145',[0,6,-11]);
      p.box(pelt,50,43,5,'#202c31',[0,7,9.5]);
      for (const s of [-1,1]) p.box(pelt,7,55,6,'#858574',[s*29,6,12]);
      const fur=p.ink(pelt);fur.begin();
      for (let i=0;i<76;i++) {
        const s=i%2?1:-1;
        const y=-17+(i%29)*2.35;
        const x=s*(29+(i%4)*1.45);
        const z=3+Math.sin(i*1.7)*10;
        p.line(fur,[[x,y,z],[x+s*(2+i%5),y-1.3,z+4],[x+s*(4+i%7),y-4,z+5]],
          ['#6c6455','#a79a7d','#675d51','#8b8067'][i%4],1.4);
      }
      fur.end();
      for (const s of [-1,1]) cable(p,figure.root,[s*19,-17,6],[s*18,-64,9],'#878473');
      for(const [i,text] of ['EINS','ZWEI','DREI'].entries())
        count.push(einsLetters(p,figure.root,text,[0,53,20],1.78,['#6fe9dc','#ffd878','#fb708c'][i]));
    } else {
      figure.torso.visible=false;
      for (const limb of [...figure.arms,...figure.legs,...figure.hands,...figure.feet]) limb.visible=false;
      if (look==='pizza') {
        const pie = propGroup(figure.root,[0,14,-12]);
        p.box(pie,151,127,12,'#b5774e',[0,1,-12]);
        p.box(pie,143,118,2,'#e1b47a',[0,1,-5]);
        p.box(pie,152,9,12,'#a96548',[0,-61,-5]);
        for(const s of [-1,1]) p.box(pie,7,117,11,'#bd7953',[s*72,2,-4]);
        p.oval(pie,[0,4,-1],[64,55,6],'#c58342');
        p.oval(pie,[0,3,5],[59,49,4],'#efbe65');
        p.oval(pie,[0,3,8],[53,44,2.4],'#efc981');
        for(let i=0;i<26;i++){
          const q=i*2.39996,r=21+(i*17)%32;
          const x=Math.cos(q)*r,y=Math.sin(q)*r*.83;
          if(Math.abs(x)<26 && y>-19 && y<29) continue;
          p.oval(pie,[x,y+4,10],[3.5+(i%4)*.81,3.4+(i%3)*.76,1.0],i%3?'#a84f3b':'#86774b');
        }
        for(const s of [-1,1]){
          p.oval(pie,[s*23,25,12],[7.1,7.5,2.4],'#faf0ca');
          p.oval(pie,[s*22,24.4,14.1],[3.7,3.9,1.2],'#408ea0');
          p.oval(pie,[s*21,24.4,15.1],[2.0,2.7,1.1],'#233738');
        }
        // Slice lines retain their gaps through the moving face.
        const seams=p.ink(pie);seams.begin();
        for(let i=0;i<8;i++){
          const q=i*Math.PI/4;
          p.line(seams, [[Math.cos(q)*27,Math.sin(q)*27+3,10.5],[Math.cos(q)*57,Math.sin(q)*47+3,10.5]],'#b77a4d',1.05);
        }
        seams.end();
      }
    }
    return {look,figure,count,receiver};
  }

  resize(w:number,h:number){
    this.camera.aspect=Math.max(1,w)/Math.max(1,h);
    this.camera.updateProjectionMatrix();
    this.props.resize(w,h);
    for(const a of this.actors) a.figure.head.resize(w,h);
  }

  frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
    const s=einsState(view,time);
    const camera=einsCamera(view,s.t,this.camera.aspect);
    this.camera.position.set(...camera.position);
    this.camera.up.set(...camera.up);
    this.camera.lookAt(...camera.target);
    this.camera.updateMatrixWorld();
    const reset = epoch!==this.epoch || Math.abs(s.t-this.last)>.28;
    const dt=Math.max(0,Math.min(.05,s.t-this.last));
    this.epoch=epoch;
    this.last=s.t;
    this.sets.update(s);
    this.scene.background=new THREE.Color(s.room==='coast'?'#93c9d4':s.room==='office'?'#1a2d36':s.room==='card'?'#151a38':'#1b293f');
    this.scene.fog = new THREE.Fog(s.room==='coast'?'#83acb7':'#202d39',s.room==='coast'?490:420,s.room==='coast'?2900:2080);
    for(const a of this.actors){
      a.figure.root.visible=s.cast.includes(a.look);
      if(a.figure.root.visible)this.pose(a,s);
    }
    this.scene.updateMatrixWorld(true);
    for(const {figure} of this.actors){
      if(figure.root.visible)figure.update(s.t,playing,this.camera,dt,reset);
    }
    this.veil.position.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(new THREE.Vector3()),2);
    this.veil.quaternion.copy(this.camera.quaternion);
    this.veil.material.opacity=1-s.dim;
    this.veil.visible=s.dim<1;
    this.scene.updateMatrixWorld(true);
  }

  private pose(actor:Actor,s:ReturnType<typeof einsState>){
    const {figure,look,count,receiver}=actor;
    const step=Math.sin(s.cycle*.5);
    const accent=Math.sin(s.cycle);
    let at: Point=[0,152,60];
    let yaw = .13*step;
    let bend = -.04*accent;
    let lean = .037*step;
    let seated=false;
    let arms:[Point,Point,Point,Point]=[[-30,-36,17],[-42,-47+13*step,24],[33,-24,17],[42,-18-20*step,31]];
    if(look==='clerk'){
      at=[0,141,6];
      seated=true;
      yaw=.12*Math.sin(s.t*1.6);
      arms=[[-28,-38,15],[-27,-58+3*accent,69],[28,-39,22],[26,-56-4*accent,62]];
      if(s.view==='eins-paper')bend=.18;
      if(s.view==='eins-office-turn'){arms[1]=[-37,-36,41];arms[3]=[43,-24,33];yaw=.28;}
      if(receiver){
        receiver.visible=s.view==='eins-phone';
        receiver.position.set(27,9,9);
        receiver.rotation.set(-.18,0,-.35);
      }
      if(s.view==='eins-phone'){arms[2]=[40,-24,17];arms[3]=[31,4,13];}
    }else if(look==='red'){
      at=[7*step,153+2.4*Math.abs(accent),53];
      if(s.view==='eins-patch'){
        at=[37,145,24];
        yaw=-.64;
        bend=.14;
        arms=[[-32,-22,12],[-36,-11,26],[26,-27,16],[41,-19+4*step,32]];
      }else if(s.view==='eins-reveal'){
        at=[0,154,-6];
        arms=[[-35,-17,14],[-59,4+22*accent,21],[35,-12,14],[59,12-19*accent,26]];
      }else if(s.view.startsWith('eins-desk-danc')){
        at=[15*step,232+4*Math.abs(accent),55];
        yaw=.24*step;lean=.075*step;
        arms=[[-39,-22,13],[-65,-2+22*accent,24],[39,-22,15],[58,6-24*accent,31]];
      }else{
        arms[1]=[-43,-17+23*step,28];arms[3]=[47,-12-23*step,29];
      }
    }else if(look==='yellow'){
      seated=true;
      for (const limb of [...figure.legs,...figure.feet]) limb.visible=!s.driving;
      at=s.driving?[-17,132,75]:[0,147,105];
      yaw=s.driving?.19*step:.2;
      bend=s.driving?.07:.14;
      if(s.view==='eins-car-map'){at=[30,133,104];arms=[[-25,-16,15],[-34,-39,36],[27,-23,18],[31,-37,37]];}
      else if(s.view==='eins-car-detail'){at=[57,135,91];yaw=-.35;}
      else if(s.driving)arms=[[-28,-27,19],[-24,-29+7*step,44],[28,-29,16],[24,-26-7*step,42]];
      else arms=[[-30,-27,15],[-39,-42+14*step,33],[30,-29,17],[40,-37-15*step,38]];
    }else if(look==='pink'){
      at=[-94,114,41];yaw=0;bend=0;lean=0;
    }else if(look==='pizza'){
      at=[82,113,80];yaw=.12+.12*step;bend=.08;lean=.045*accent;
    }else{
      const side=look==='counter-left'?-1:1;
      at=[side*173,145+2*Math.abs(accent),-2];
      yaw=side*-.10;lean=.04*step*side;
      arms=[[-27,-26,11],[-24,-53+2*accent,31],[28,-28,8],[23,-55-2*accent,31]];
      const bar = Math.floor(Math.max(0,(s.t-49.91)*127/60))%8;
      const triplet = s.t>=147.8 && s.t<149.2 ? 2 : Math.min(2,bar);
      for(const [i,number] of count.entries())number.visible=i===triplet;
    }
    figure.root.position.set(...at);
    figure.root.rotation.set(bend,yaw,lean);
    figure.pose(s.t,arms,seated);
    if(look==='pizza' || look==='pink')figure.head.scene.rotation.y=-Math.PI*.5;
  }

  dispose(){
    this.actors.forEach(a=>a.figure.dispose());
    this.props.dispose();
    this.veil.geometry.dispose();
    this.veil.material.dispose();
  }
}
