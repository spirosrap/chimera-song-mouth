import * as THREE from 'three';
import {HOUSE_TOUR_CAST,houseTourCamera,houseTourState,type TourId,type TourRoom} from '../../scene/house-tour.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure,VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {buildTourSets} from './house-tour-sets.ts';
import {necklace} from './house-tour-props.ts';

type Person={id:TourId; model:VoiceModel; track:TeleTrack};
type State=ReturnType<typeof houseTourState>;
type Actor={
  id:TourId; index:number; figure:VideoFigure; beret:THREE.Group; earrings:THREE.Group;
  cuffs:THREE.Mesh[]; lapels:THREE.Mesh[]; skirt:THREE.Mesh; dress:THREE.Group; pearls:THREE.Group;
};
const main=['#b6597e','#554056','#c8ac83'];
const travel=['#795c64','#653447','#9b755c'];
const party=['#c3bfb5','#a86176','#c4a25e'];
const shade=['#dfb098','#c18f7a','#c5a287'];
const hair=['#c5a773','#71515a','#a38769'];
const backdrops:Record<TourRoom,string>={
  drive:'#273847',passage:'#3b4c4c',lounge:'#685044',kitchen:'#855d45',
  stairs:'#5b4948',bath:'#997d74',billiards:'#674b44',bedroom:'#966c52',
  wardrobe:'#8e684f',pool:'#234764',lookout:'#283954',garage:'#3c4249',
  monitor:'#2d4852',ending:'#263c56',card:'#ad8c6d',
};

function tint(mesh:THREE.Mesh,color:string) {
  (mesh.material as THREE.MeshBasicMaterial).color.set(color);
}

/** Source-time cut and pose control for the three leads, props and vehicles. */
export class HouseTourStage {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(35,16/9,1,6500);
  readonly props=new VideoProps();
  readonly sets=buildTourSets(this.props,this.scene);
  readonly actors:Actor[];
  private readonly color=new THREE.Color();
  private readonly fog=new THREE.Fog('#292234',460,2550);
  private readonly direction=new THREE.Vector3();
  private readonly veil=new THREE.Mesh(new THREE.PlaneGeometry(10,10),
    new THREE.MeshBasicMaterial({color:'#201b2c',transparent:true,depthTest:false,depthWrite:false}));
  private last=-1;
  private epoch=-1;

  constructor(voices:Person[]) {
    this.actors=HOUSE_TOUR_CAST.map((id,index)=>{
      const person=voices.find(voice=>voice.id===id);
      if(!person)throw Error('House Tour needs each of its three physical mouth tracks.');
      return this.makeActor(person,index);
    });
    this.veil.renderOrder=1000;
    this.scene.add(this.veil);
    this.resize(1280,720);
    this.frame(0,false,0,'wide',0);
  }

  private makeActor(person:Person,index:number):Actor {
    const p=this.props;
    const f=new VideoFigure(person.model,person.track,p,this.scene,main[index],shade[index]);
    const origin=bodyPoint(person.model),s=person.model.tract.scale;
    const xyz=(x:number,y:number,z:number):Point=>{
      const at=origin(x,y);
      return [at.x,at.y,z*s];
    };
    f.hair.begin();
    for(let i=0;i<48;i++){
      const a=i*2.39996,dx=Math.cos(a)*6.5,dz=Math.sin(a)*5.9;
      const fall=[11.3,9.8,14.2][index]+i%7*.7;
      p.line(f.hair,[
        xyz(dx-4.2,23.1+i%4*.51,dz*.54),xyz(dx-4.9,22,dz),
        xyz(dx-7.1,18.8+i%5*.7,dz*1.20),xyz(dx-6.6,fall+2.1,dz*1.16),
        xyz(dx-6.0,fall,dz*.92),
      ],i%5===0?['#e3c391','#956f72','#c5aa85'][index]:hair[index],index===0?2:1.6);
    }
    f.hair.end();

    const beret=new THREE.Group();
    f.root.add(beret);
    p.oval(beret,[0,37,-4],[21.1,6.1,17.6],'#443c4b').rotation.z=.14;
    for(let i=0;i<36;i++){
      const a=i*2.39996,r=6+12*Math.sqrt(i/36);
      p.oval(beret,[Math.cos(a)*r,40.2+Math.sin(i*.72)*1.9,-4+Math.sin(a)*r*.63],
        [.95,.99,.9],i%4?'#ccbba3':'#f1d9ab');
    }
    const earrings=new THREE.Group();
    f.root.add(earrings);
    for(const sign of [-1,1]){
      p.mesh(earrings,new THREE.TorusGeometry(3.4,.78,5,13),[sign*16,-3,3],'#c49e68');
    }
    const pearls=necklace(p,f.root,[0,-17,14],'#dacfaf',13.2);
    pearls.scale.y=.63;
    const lapels:THREE.Mesh[]=[];
    const cuffs:THREE.Mesh[]=[];
    for(const sign of [-1,1]){
      lapels.push(p.oval(f.root,[sign*15,-24,1],[10,12,8.5],main[index]));
      const lace=p.box(f.root,3.1,31,1.7,index===1?'#b7728c':'#c69c8d',[sign*9,-35,13.3]);
      lace.rotation.z=sign*.29;
      lapels.push(lace);
      cuffs.push(p.oval(f.root,[0,0,0],[5.1,7,4.9],index===1?'#907779':'#caae86'));
    }
    const dress=new THREE.Group();
    f.root.add(dress);
    const skirt=p.mesh(dress,new THREE.CylinderGeometry(18,25,22,22),[0,-75,0],main[index]);
    skirt.scale.z=.69;
    const embroidery=p.ink(dress);
    embroidery.begin();
    for(let i=0;i<7;i++){
      const x=(i-3)*5.7,y=-63-(i%3)*3;
      p.line(embroidery,[[x-2.7,y,16],[x,y+2.1,16],[x+2.6,y,16],[x,y-3,16]],
        ['#c9989a','#aa6c84','#dcbe9b'][index],1.2,true);
    }
    embroidery.end();
    return {id:person.id,index,figure:f,beret,earrings,cuffs,lapels,skirt,dress,pearls};
  }

  resize(width:number,height:number) {
    this.camera.aspect=Math.max(1,width)/Math.max(1,height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width,height);
    for(const actor of this.actors)actor.figure.head.resize(width,height);
  }

  frame(at:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId) {
    const s=houseTourState(view,at);
    const camera=houseTourCamera(view,s.t,this.camera.aspect);
    this.camera.position.set(...camera.position);
    this.camera.up.set(...camera.up);
    this.camera.lookAt(...camera.target);
    this.camera.updateMatrixWorld();
    const reset=epoch!==this.epoch||Math.abs(s.t-this.last)>.28;
    const dt=Math.max(0,Math.min(.05,s.t-this.last));
    this.last=s.t;
    this.epoch=epoch;
    this.sets.update(s);
    this.scene.background=this.color.set(s.dark?'#2c242f':s.disco?'#3e324b':backdrops[s.room]);
    this.scene.fog=s.room==='card'?null:this.fog;
    this.fog.color.copy(this.color);
    for(const actor of this.actors){
      const slot=(actor.index-s.lead+3)%3;
      const count=s.pose==='empty'?0:s.pose==='solo'||s.pose==='recline'?1:s.pose==='pair'||s.pose==='seat'?2:3;
      actor.figure.root.visible=slot<count;
      if(actor.figure.root.visible)this.pose(actor,s,slot);
    }
    this.scene.updateMatrixWorld(true);
    for(const {figure} of this.actors)
      if(figure.root.visible)figure.update(s.t,playing,this.camera,dt,reset);
    this.veil.position.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(this.direction),2);
    this.veil.quaternion.copy(this.camera.quaternion);
    this.veil.material.opacity=1-s.fade;
    this.veil.visible=s.fade<1;
    this.scene.updateMatrixWorld(true);
  }

  private pose(actor:Actor,s:State,slot:number) {
    const f=actor.figure,p=this.props;
    const b=s.beat*Math.PI,c=Math.sin(b+actor.index*.33),step=Math.sin(b*2+.71*slot);
    const seated=s.pose==='seat'||s.room==='ending'||s.room==='bath'||s.view==='tour-stair-slide';
    const walking=s.pose==='walk',dancing=s.pose==='dance';
    const exterior=s.room==='drive'||s.room==='garage'||s.room==='ending'||s.view==='tour-spotlight';
    const soft=s.room==='bedroom'||s.room==='bath'||s.room==='pool';
    const costumes=s.view==='tour-costumes'||s.view==='tour-mirror-trio'||s.room==='lookout';
    const coat=s.room==='monitor'?'#7ba3a8':exterior?travel[actor.index]:costumes?party[actor.index]:main[actor.index];
    let at:Point=[0,151+Math.abs(step)*1.7,49],yaw=.16*c,bend=-.05*step,roll=.035*c;
    let arms:[Point,Point,Point,Point]=[
      [-30,-34,11],[-36,-54+12*step,25],[31,-33,13],[41,-48-9*step,27],
    ];
    if(s.pose==='trio'||walking||dancing){
      at=[slot===0?0:slot===1?-73:73,153+Math.abs(step)*(walking?4:2.7),slot===0?33:-24];
      if(walking){
        at[2]+=17*Math.sin((s.t-s.cut)*.52+slot*.3);
        arms[1][1]+=step*11;
        arms[3][1]-=step*12;
      }
      if(dancing){
        at[0]+=c*12;
        bend=.08*Math.abs(c);
        roll=.08*c;
        arms=[[-30,-31,16],[-53,-31+17*c,22],[33,-29,17],[54,-27-17*c,25]];
      }
    }else if(s.pose==='pair'||s.pose==='seat'){
      at=[slot===0?-39:39,seated?129:153,slot===0?45:23];
      yaw=slot===0?.20:-.20;
    }else if(s.pose==='recline'){
      at=[-24,s.room==='bath'?115:112,30];
      roll=s.room==='bath'?-.25:1.05;
      bend=s.room==='bath'?.07:-.28;
      arms=[[-33,-25,21],[-51,-18,36],[30,-24,21],[48,-20,34]];
    }
    if(s.room==='stairs'&&s.view!=='tour-mirror'){
      at[2]-=43+slot*12;
      at[1]+=21+slot*8.2;
      if(s.view==='tour-stair-slide')at[1]-=24;
    }
    if(s.view==='tour-mirror')at=[-46,152,35];
    if(s.view==='tour-painting')at=[slot===0?-61:39,153,30-slot*15];
    if(s.view==='tour-fridge') {
      at=[7,149,54];yaw=-.39;
      arms[0]=[-41,-28,11];arms[1]=[-61,-16,14];
    }
    if(s.view==='tour-beret') {
      arms[2]=[36,-28,17];arms[3]=[36,17,20];
    }
    if(s.view==='tour-book'){
      at=[slot===0?-47:53,slot===0?116:147,53-slot*7];
      yaw=slot===0?.29:-.31;
    }
    if(s.view==='tour-desk-phone'){
      at=[slot===0?-24:57,129,61];
      arms[2]=[29,-22,17];arms[3]=[26,5,18];
    }
    if(s.room==='pool'){
      at[1]=s.pose==='solo'?109:115;
      at[2]=s.pose==='solo'?58:42-slot*16;
    }
    if(s.room==='ending'){
      at=[slot===0?52:slot===1?-52:0,slot===2?125:134,slot===2?-18:44];
    }
    if(s.view==='tour-van-portrait')at=[0,143,61];
    if(s.view==='tour-van-door')at=[slot===0?-9:70,154,81-slot*22];
    if(s.room==='garage')at[2]+=45;
    if(s.room==='monitor')at[1]-=6;
    f.root.position.set(...at);
    f.root.rotation.set(bend,yaw,roll);
    f.root.scale.setScalar(s.room==='monitor'?.94:1);
    f.head.scene.scale.setScalar(2.11);
    f.pose(s.t,arms,seated);
    for(const m of [f.torso,...f.arms,...f.legs,...f.feet])tint(m,coat);
    tint(actor.skirt,coat);
    const water=s.room==='bath'||s.room==='pool';
    const hideLegs=water||s.room==='ending';
    for(const limb of [...f.legs,...f.feet])limb.visible=!hideLegs;
    actor.dress.visible=!water&&s.room!=='ending';
    actor.beret.visible=actor.index===0&&!soft&&!costumes&&s.room!=='monitor';
    actor.beret.rotation.z=.06*c;
    actor.pearls.visible=s.room!=='monitor'&&!water;
    actor.earrings.visible=s.room!=='monitor';
    for(const [i,m] of actor.lapels.entries())tint(m,i%2===0?coat:actor.index===1?'#aa768d':'#cbaa91');
    for(const [i,m] of actor.cuffs.entries()){
      m.position.copy(f.hands[i].position).lerp(f.arms[i*2+1].position,.22);
      m.visible=!water;
    }
    if((walking||dancing)&&!seated){
      for(const [i,sign] of [-1,1].entries()){
        const knee:Point=[sign*16,-102+Math.max(0,sign*step)*6,Math.sin(b+sign)*8];
        const foot:Point=[sign*17+c*4,-146+Math.max(0,sign*step)*9,9+11*sign*step];
        p.segment(f.legs[2*i],[sign*9,-72,0],knee,6.8);
        p.segment(f.legs[2*i+1],knee,foot,5.0);
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
