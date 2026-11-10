import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {V} from '../colors.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';

type Point=[number,number,number];
const TAU=Math.PI*2;
const guitarAngle=-.65;
const guitarPoint=([x,y,z]:readonly number[]):Point=>[7+x*Math.cos(guitarAngle)-y*Math.sin(guitarAngle),-43+x*Math.sin(guitarAngle)+y*Math.cos(guitarAngle),15+z];
/** The accompaniment supplies the beat; the recorded mouth supplies articulation. */
export function folkSingerPose(time:number,bpm:number){
  const t=Math.max(0,Number.isFinite(time)?time:0),beat=t*(Number.isFinite(bpm)&&bpm>0?bpm:120)/60;
  return {sway:Math.sin(beat*Math.PI/4)*.018,strum:Math.sin(beat*TAU)*3.5,fret:Math.floor(beat/8)%4};
}
export function folkSingerCamera(aspect:number,scale=1){
  const fov=32,distance=1.12*Math.max(47,43/Math.max(.35,aspect))/Math.tan(fov*Math.PI/360)*scale;
  const target=new THREE.Vector3(8,-17,7).multiplyScalar(scale);
  const position=target.clone().add(new THREE.Vector3(-.48,.055,.875).normalize().multiplyScalar(distance));
  return {target,position,fov};
}

/** A wireframe upper-body performer, drawn with the head's own glowing line kit. */
export class FolkSinger {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(32,1,1,1500);
  readonly actor=new THREE.Group();
  readonly head=new Anatomy3D();
  readonly hat=new Beams();
  readonly body=new Beams();
  readonly hands=new Beams();
  readonly instrument=new Beams();
  readonly microphone=new Beams();
  readonly backdrop=new Beams();
  private epoch=-1;
  private lastTime:number|null=null;
  private readonly scale:number;
  constructor(readonly model:VoiceModel,readonly track:TeleTrack,readonly bpm:number){
    this.scale=model.tract.scale;
    this.scene.background=new THREE.Color(0x000000);
    this.scene.add(this.actor,this.microphone.group,this.backdrop.group);
    this.actor.add(this.body.group,this.hands.group,this.instrument.group,this.head.scene);
    this.head.centred=true;this.head.scene.rotation.y=-1.05;this.head.scene.scale.setScalar(1.08);
    this.head.attachAccessory(this.hat.group);
    for(const b of [this.body,this.hands,this.instrument,this.hat,this.microphone,this.backdrop])b.group.scale.setScalar(this.scale);
    this.body.group.name='shirt';this.hat.group.name='hat';this.instrument.group.name='guitar';this.hands.group.name='guitar-hands';this.microphone.group.name='microphone';
    this.makeBody();this.makeHat();this.makeMicrophone();this.makeBackdrop();this.resize(800,800);
    this.frame(0,false,0,true);
  }
  private line(b:Beams,points:Point[],color:string,width=1,alpha=.75,close=false){
    b.line(points.flat(),points.length,color,width,{alpha,close});
  }
  private ellipse(b:Beams,c:Point,u:Point,v:Point,color:string,width=1,alpha=.75){
    this.line(b,Array.from({length:40},(_,i)=>{const a=i/40*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as Point;}),color,width,alpha,true);
  }
  private tube(b:Beams,a:Point,z:Point,r0:number,r1:number,color=V.blueMid,alpha=.7){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...z),axis=end.clone().sub(start).normalize();
    const u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize();
    const v=new THREE.Vector3().crossVectors(axis,u).normalize();
    const point=(t:number,angle:number):Point=>start.clone().lerp(end,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(angle)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(angle)).toArray() as Point;
    for(const t of [0,.33,.67,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),color,.85,alpha,true);
    for(let i=0;i<8;i++)this.line(b,[point(0,i/8*TAU),point(1,i/8*TAU)],color,.85,alpha);
  }
  private makeBody(){
    const b=this.body;b.begin();
    const rings=[[-5,6.3,4.8],[-9,18,8],[-15,20,10],[-25,18.5,10],[-37,16.5,9],[-50,15.8,8.5],[-63,17,9]];
    for(const [y,rx,rz] of rings)this.ellipse(b,[0,y,0],[rx,0,0],[0,0,rz],V.blueDim,1,.85);
    for(let i=0;i<18;i++){
      const a=i/18*TAU;
      this.line(b,rings.map(([y,rx,rz])=>[rx*Math.cos(a),y,rz*Math.sin(a)]),V.blueDim,1,.72);
    }
    // Shirt collar, shoulder seams and a restrained placket.
    for(const side of [-1,1]){
      this.line(b,[[side*5,-5,4],[side*11,-10,8],[side*6,-17,10],[side*2,-10,9]],V.blueMid,1,.9);
      this.line(b,[[side*10,-8,2],[side*18,-10,6],[side*20,-15,5]],V.blueMid,1,.8);
    }
    this.line(b,[[0,-10,10],[0,-25,10.2],[0,-40,9.3],[0,-63,9.1]],V.blueMid,.85,.5);
    for(const y of [-20,-29,-38])this.ellipse(b,[0,y,10.4],[.45,0,0],[0,.45,0],V.blue,.85,.45);
    b.end();
  }
  private makeHat(){
    const b=this.hat;b.begin();
    // Coordinates are in the head's sagittal frame: x forward, z across it.
    this.ellipse(b,[0,21.4,0],[14.2,0,0],[0,0,12.6],V.white,1.3,.8);
    this.ellipse(b,[0,21.1,0],[13.6,0,0],[0,0,12],V.white,.85,.5);
    for(let i=0;i<16;i++){
      const a=i/16*TAU;this.line(b,[[8.7*Math.cos(a),21.4,7.9*Math.sin(a)],[14.2*Math.cos(a),21.4,12.6*Math.sin(a)]],V.white,.85,.55);
      this.line(b,[[8.7*Math.cos(a),21.4,7.9*Math.sin(a)],[8.3*Math.cos(a)-.5,28.2,7.2*Math.sin(a)]],V.white,1,.7);
    }
    for(const [y,rx,rz] of [[21.4,8.7,7.9],[24,8.55,7.7],[28.2,8.3,7.2]])this.ellipse(b,[y===28.2?-.5:0,y,0],[rx,0,0],[0,0,rz],V.white,1.05,.8);
    for(const y of [22,23.3])this.ellipse(b,[0,y,0],[8.8,0,0],[0,0,8],V.amber,1,.8);
    this.line(b,[[-7,28.2,-2],[-2,28.5,-3],[5,28.2,-2]],V.white,.85,.6);
    b.end();
  }
  private makeMicrophone(){
    const b=this.microphone;b.begin();
    this.tube(b,[14,-68,27],[14,-10,27],.45,.45,V.blueMid,.8);
    this.tube(b,[14,-10,27],[9,5,27],1.2,1.4,V.blue,.8);
    this.ellipse(b,[14,-68,27],[8,0,0],[0,0,5],V.blueDim,1,.6);
    this.ellipse(b,[9,8,27],[2.7,0,0],[0,0,2.7],V.amber,1.3,1);
    for(let i=0;i<7;i++){
      const a=-Math.PI/2+i/6*Math.PI,r=2.7*Math.cos(a);
      this.ellipse(b,[9,8+3.4*Math.sin(a),27],[r,0,0],[0,0,r],V.amber,1,.85);
    }
    for(let i=0;i<8;i++){
      const a=i/8*TAU;
      this.line(b,Array.from({length:20},(_,j)=>{const t=j/19*Math.PI;return [9+2.7*Math.sin(t)*Math.cos(a),8+3.4*Math.cos(t),27+2.7*Math.sin(t)*Math.sin(a)];}),V.amber,.85,.6);
    }
    this.line(b,[[14,-68,27],[13,-60,28],[12,-27,28],[14,-10,28]],V.blueDim,.6,.6);b.end();
  }
  private makeBackdrop(){
    const b=this.backdrop;b.begin();
    for(let x=-100;x<=100;x+=14)this.line(b,[[x,55,-25],[x-2,12,-25],[x+1,-35,-25],[x,-90,-25]],V.blueDim,.6,.14);
    b.end();
  }
  private makeGuitar(time:number){
    const b=this.instrument;b.begin();
    const outline:Point[]=[[0,-23,0],[-10,-21,0],[-15,-15,0],[-16,-7,0],[-13,-1,0],[-9,4,0],[-10.5,10,0],[-11,15,0],[-7,20,0],[0,22,0],[7,20,0],[11,15,0],[10.5,10,0],[9,4,0],[13,-1,0],[16,-7,0],[15,-15,0],[10,-21,0]];
    const curve=new THREE.CatmullRomCurve3(outline.map(p=>new THREE.Vector3(...p)),true,'catmullrom',.35);
    const points=curve.getPoints(100).map(v=>v.toArray() as Point);
    for(const depth of [-3.3,3.3])this.line(b,points.map(([x,y])=>guitarPoint([x,y,depth])),V.amber,1.3,depth>0?.92:.45);
    for(let i=0;i<outline.length;i+=2){const [x,y]=outline[i];this.line(b,[guitarPoint([x,y,-3.3]),guitarPoint([x,y,3.3])],V.amber,1,.65);}
    for(const r of [4.9,5.5])this.line(b,Array.from({length:40},(_,i)=>guitarPoint([r*Math.cos(i/40*TAU),3+r*Math.sin(i/40*TAU),3.4])),V.amber,1,.85,true);
    this.line(b,[[-2.5,20,3.5],[-2,55,3.5],[2,55,3.5],[2.5,20,3.5]].map(guitarPoint),V.amber,1,.9,true);
    this.line(b,[[-2,54,3.5],[-3.6,57,3.5],[-3.3,65,3.5],[3.3,65,3.5],[3.6,57,3.5],[2,54,3.5]].map(guitarPoint),V.amber,1.3,.9);
    this.line(b,[[-6,-11,3.6],[-6,-13,3.6],[6,-13,3.6],[6,-11,3.6]].map(guitarPoint),V.amber,1,.85,true);
    for(let i=0;i<14;i++){
      const y=54-34*(1-2**(-i/12));this.line(b,[guitarPoint([-2.3,y,3.7]),guitarPoint([2.3,y,3.7])],V.white,.6,.4);
    }
    for(let i=0;i<6;i++){
      const x=(i-2.5)*.64;
      this.line(b,Array.from({length:17},(_,j)=>guitarPoint([x+Math.sin(j/16*Math.PI)*Math.sin(time*70+i)*.035,-11+j/16*73,3.9])),V.white,.85,.8);
    }
    for(const side of [-1,1])for(const y of [57,60,63])this.line(b,[guitarPoint([side*3.4,y,3.4]),guitarPoint([side*5,y,3.4]),guitarPoint([side*5,y+1,3.4])],V.amber,1,.9);
    b.end();
  }
  private makeHands(strum:number,fret:number){
    const b=this.hands;b.begin();
    const pick:Point=[1,-1+strum,6.4],grip:Point=[-4,36+fret*1.5,5.8];
    this.tube(b,[-18,-10,0],[-25,-34,5],4.5,3.4);
    this.tube(b,[-25,-34,5],guitarPoint([pick[0]-3,pick[1]-3,pick[2]]),3.4,2.1);
    this.tube(b,[18,-10,0],[25,-30,7],4.5,3.4);
    this.tube(b,[25,-30,7],guitarPoint([grip[0]-3,grip[1]-3,grip[2]-1]),3.4,2);
    for(const [at,fretting] of [[pick,false],[grip,true]] as const){
      const [x,y,z]=at;
      this.line(b,[[x-3,y-3,z],[x-2.8,y+1,z+.7],[x+1,y+2,z+.8],[x+2,y-2,z],[x-3,y-3,z]].map(guitarPoint),V.blue,1,.85);
      this.line(b,[[x-3,y-3,z-1.3],[x-2.8,y+1,z-.8],[x+1,y+2,z-.8],[x+2,y-2,z-1.3]].map(guitarPoint),V.blueMid,.85,.6,true);
      for(let i=0;i<4;i++){
        const dx=x-2.4+i*1.1,dy=y+1.2+i*.18;
        const path:Point[]=fretting?[[dx,dy,z+.6],[dx+3,dy+1.5,z+1],[dx+5,dy+1,z],[dx+5.3,dy,z-1]]:[[dx,dy,z+.6],[dx+.2,dy+2.4,z+.2],[dx+.8,dy+3.5,z-1],[dx+1.3,dy+2.9,z-1.5]];
        for(let j=0;j<path.length-1;j++)this.tube(b,guitarPoint(path[j]),guitarPoint(path[j+1]),.43,.36,V.blueMid,.8);
      }
      this.tube(b,guitarPoint([x+1.5,y-1.5,z]),guitarPoint([x+3.6,y-.5,z+1]),.65,.5,V.blue,.8);
      this.tube(b,guitarPoint([x+3.6,y-.5,z+1]),guitarPoint([x+4.4,y+1,z+.2]),.5,.4,V.blue,.8);
    }
    b.end();
  }
  resize(width:number,height:number){
    this.camera.aspect=Math.max(1,width)/Math.max(1,height);
    const pose=folkSingerCamera(this.camera.aspect,this.scale);this.camera.fov=pose.fov;this.camera.position.copy(pose.position);this.camera.lookAt(pose.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    this.head.resize(width,height);
    for(const b of [this.body,this.hands,this.instrument,this.hat,this.microphone,this.backdrop])b.setResolution(width,height);
    const d=this.camera.position.distanceTo(pose.target);this.scene.fog=new THREE.Fog(0x000000,d-20*this.scale,d+100*this.scale);
  }
  frame(time:number,playing:boolean,epoch:number,audible:boolean){
    const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0));
    if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)this.head.resetMotion();
    this.epoch=epoch;const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;
    const pose=folkSingerPose(t,this.bpm);this.actor.rotation.y=pose.sway;
    this.makeGuitar(t);this.makeHands(pose.strum,pose.fret);
    const message=this.track.message(this.track.indexAt(t)),tele=playing&&audible?message:null;
    this.head.face.update(tele,dt);this.scene.updateMatrixWorld(true);
    this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();
    const artic=VoiceModel.articFromArray(message.t.artic);
    this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
    this.scene.updateMatrixWorld(true);
  }
  dispose(){
    this.hat.group.removeFromParent();this.head.dispose();
    for(const b of [this.body,this.hands,this.instrument,this.hat,this.microphone,this.backdrop])b.dispose();
  }
}
