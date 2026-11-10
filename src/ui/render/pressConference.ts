import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {V} from '../colors.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';

type Point=[number,number,number];
const TAU=Math.PI*2;
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,c:number,d:number,t:number)=>smooth(a,b,t)*(1-smooth(c,d,t));
/** The gestures are on the audio clock, so pause and seek cannot accumulate drift. */
export function pressPose(time:number){
  const t=Math.max(0,Number.isFinite(time)?time:0);
  const hesitation=pulse(12.8,13.7,15,15.4,t)+pulse(18.4,19.1,20.2,20.7,t);
  const point=pulse(14.8,15.3,16.2,16.8,t)+pulse(20.2,20.7,22.8,23.5,t);
  return {turn:.1*Math.sin(t*.55)+hesitation*.17,tilt:hesitation*-.065,nod:point*.04,point,shrug:pulse(6,6.4,7.7,8.3,t)};
}
export function pressCamera(view:CameraView,aspect:number){
  const close=view==='bush',fov=32;
  const target=new THREE.Vector3(0,close?1:-17,5);
  const distance=Math.max(close?33:61,(close?39:73)/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
  return {target,position:target.clone().add(new THREE.Vector3(close?.5:.27,.09,.96).normalize().multiplyScalar(distance)),fov};
}

/** A press-conference tableau in the same glowing line language as the physical head. */
export class PressConference {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(32,16/9,1,2000);
  readonly actor=new THREE.Group();
  readonly head=new Anatomy3D();
  readonly hair=new Beams();
  readonly suit=new Beams();
  readonly hands=new Beams();
  readonly lectern=new Beams();
  readonly microphones=new Beams();
  readonly backdrop=new Beams();
  readonly flag=new Beams();
  private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;
  constructor(readonly model:VoiceModel,readonly track:TeleTrack){
    this.scene.background=new THREE.Color(0x000000);
    this.actor.add(this.suit.group,this.hands.group,this.head.scene);
    this.scene.add(this.actor,this.lectern.group,this.microphones.group,this.backdrop.group,this.flag.group);
    this.head.centred=true;this.head.scene.rotation.y=-Math.PI/2;
    this.head.attachAccessory(this.hair.group);
    for(const [name,b] of Object.entries({hair:this.hair,suit:this.suit,hands:this.hands,lectern:this.lectern,microphones:this.microphones,backdrop:this.backdrop,flag:this.flag}))b.group.name=name;
    this.makeSuit();this.makeHair();this.makeLectern();this.makeMicrophones();this.makeBackdrop();this.makeFlag();this.resize(1280,720);this.frame(0,false,0,'wide',0);
  }
  private line(b:Beams,p:Point[],color:string,width=1,alpha=.75,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
  private ellipse(b:Beams,c:Point,u:Point,v:Point,color:string,width=1,alpha=.75){
    this.line(b,Array.from({length:36},(_,i)=>{const a=i/36*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as Point;}),color,width,alpha,true);
  }
  private tube(b:Beams,a:Point,z:Point,r0:number,r1:number,color:string,alpha=.7){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...z),axis=end.clone().sub(start).normalize();
    const u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
    const point=(t:number,ang:number)=>start.clone().lerp(end,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as Point;
    for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>point(t,i/12*TAU)),color,.85,alpha,true);
    for(let i=0;i<8;i++)this.line(b,[point(0,i/8*TAU),point(1,i/8*TAU)],color,.85,alpha);
  }
  private makeSuit(){
    const b=this.suit;b.begin();
    const rings=[[-5,6,4.5],[-9,19,8],[-15,21,10],[-27,18.5,10],[-40,17,9]];
    for(const [y,rx,rz] of rings)this.ellipse(b,[0,y,0],[rx,0,0],[0,0,rz],V.blueDim,1,.8);
    for(let i=0;i<16;i++){const a=i/16*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),V.blueDim,1,.6);}
    this.line(b,[[-6,-5,5],[0,-10,9],[6,-5,5],[5,-19,10],[0,-27,11],[-5,-19,10]],V.white,1,.8,true);
    for(const side of [-1,1])this.line(b,[[side*7,-6,7],[side*17,-11,9],[side*11,-16,11],[side*14,-20,11],[side*3,-33,11]],V.blue,1.3,.9);
    this.line(b,[[0,-9,10],[-2,-12,11],[0,-15,11.5],[2,-12,11]],V.red,1.6,.95,true);
    this.line(b,[[0,-15,11.5],[-2,-27,11.5],[0,-31,11.8],[2,-27,11.5]],V.red,1.6,.95,true);
    for(let y=-16;y>-29;y-=2)this.line(b,[[-1.6,y,11.6],[1.6,y-1,11.6]],V.red,.85,.6);
    // Small flag pin on the lapel, as in the event photograph.
    for(let i=0;i<7;i++)this.line(b,[[-13,-11-i*.33,11],[-9,-11-i*.33,11]],i%2?V.white:V.red,.85,.85);
    this.line(b,[[-13,-11,11.1],[-11,-11,11.1],[-11,-12.3,11.1],[-13,-12.3,11.1]],V.blue,1,.9,true);
    b.end();
  }
  private makeHair(){
    const b=this.hair;b.begin();
    for(let i=0;i<28;i++){
      const z=(i/27-.5)*14.5,crown=Math.sqrt(1-(z/7.9)**2);
      this.line(b,Array.from({length:25},(_,j)=>{const a=j/24*Math.PI;return [.3-7.8*crown*Math.cos(a),17.5+2*(1-crown)+6.1*Math.sin(a)*crown,z*(.96+.04*Math.sin(a))] as Point;}),V.white,.85,.38);
    }
    this.line(b,Array.from({length:20},(_,j)=>{const a=j/19*Math.PI;return [.3-7.8*Math.cos(a),17.7+5.8*Math.sin(a),-2.8-.7*Math.sin(a)] as Point;}),V.amber,.85,.45);
    b.end();
  }
  private makeLectern(){
    const b=this.lectern;b.begin();
    const front:Point[]=[[-35,-27,25],[35,-27,25],[26,-73,25],[-26,-73,25]];
    this.line(b,front,V.blue,1.6,.8,true);this.line(b,[[-35,-27,25],[-32,-24,10],[32,-24,10],[35,-27,25]],V.blue,1.3,.65);
    this.line(b,[[-34,-29,25],[34,-29,25]],V.amber,1.3,.65);
    for(const x of [-24,-12,12,24])this.line(b,[[x,-31,25],[x*.85,-70,25]],V.blueDim,.85,.4);
    for(const r of [10.6,12])this.ellipse(b,[0,-46,25.2],[r,0,0],[0,r,0],V.amber,1.3,.85);
    for(let i=0;i<28;i++){const a=i/28*TAU;this.line(b,[[10.8*Math.cos(a),-46+10.8*Math.sin(a),25.3],[11.5*Math.cos(a),-46+11.5*Math.sin(a),25.3]],V.amber,.85,.7);}
    // A stylized eagle and shield make the lectern readable without a raster emblem.
    this.line(b,[[-1,-41,25.4],[-3,-43,25.4],[-8,-40,25.4],[-7,-46,25.4],[-3,-47,25.4],[-3,-50,25.4],[0,-53,25.4],[3,-50,25.4],[3,-47,25.4],[7,-46,25.4],[8,-40,25.4],[3,-43,25.4],[1,-41,25.4],[2,-39,25.4],[0,-39,25.4]],V.amber,1,.85,true);
    for(const x of [-2,-1,0,1,2])this.line(b,[[x,-46,25.6],[x,-49+Math.abs(x)*.4,25.6]],V.white,.85,.7);
    b.end();
  }
  private makeMicrophones(){
    const b=this.microphones;b.begin();
    for(const side of [-1,1]){
      const x=side*11;
      this.tube(b,[x,-25,15],[x,-14,17],.5,.45,V.white,.6);
      this.tube(b,[x,-14,17],[side*7,4.5,19],.45,.4,V.white,.8);
      const c:Point=[side*7,4.5,19];
      this.ellipse(b,c,[1.8,0,0],[0,2,0],V.white,1.3,.85);
      this.ellipse(b,c,[1.8,0,0],[0,0,2.8],V.white,1,.7);
      this.ellipse(b,c,[0,2,0],[0,0,2.8],V.white,1,.7);
      for(let y=-1;y<=1;y++)this.ellipse(b,[c[0],c[1]+y,c[2]],[1.5,0,0],[0,0,2.2],V.blueMid,.6,.65);
    }b.end();
  }
  private makeFlag(){
    const b=this.flag;b.begin();
    this.line(b,[[-67,-75,-14],[-67,58,-14]],V.amber,1.3,.5);
    for(let i=0;i<14;i++){
      const y=51-i*3.1;this.line(b,Array.from({length:17},(_,j)=>[-67+j*1.75,y,-12+Math.sin(j*.45)*1.4] as Point),i%2?V.white:V.red,1,.5);
    }
    this.line(b,[[-67,51,-10],[-54,51,-10],[-54,29,-10],[-67,29,-10]],V.blue,1,.6,true);
    for(let row=0;row<6;row++)for(let col=0;col<4;col++){const x=-65+col*3,y=49-row*3.3;this.line(b,[[x-.4,y,-9.8],[x+.4,y,-9.8]],V.white,.85,.6);}
    b.end();
  }
  private makeBackdrop(){
    const b=this.backdrop;b.begin();
    const font:Record<string,number[][]>={P:[[0,0,0,1,1,1,1,.5,0,.5]],L:[[0,1,0,0,1,0]],E:[[1,1,0,1,0,0,1,0],[0,.5,.8,.5]],D:[[0,0,0,1,.7,1,1,.75,1,.25,.7,0,0,0]],G:[[1,.8,.8,1,.2,1,0,.8,0,.2,.2,0,1,0,1,.5,.5,.5]],A:[[0,0,.5,1,1,0],[.2,.4,.8,.4]],C:[[1,1,.2,1,0,.8,0,.2,.2,0,1,0]],R:[[0,0,0,1,1,1,1,.5,0,.5],[.5,.5,1,0]],O:[[.2,0,0,.2,0,.8,.2,1,.8,1,1,.8,1,.2,.8,0,.2,0]],S:[[1,1,0,1,0,.5,1,.5,1,0,0,0]],M:[[0,0,0,1,.5,.4,1,1,1,0]],I:[[0,1,1,1],[.5,1,.5,0],[0,0,1,0]]};
    const text=(str:string,x:number,y:number,size:number)=>{
      for(const ch of str){for(const stroke of font[ch]??[])this.line(b,Array.from({length:stroke.length/2},(_,i)=>[x+stroke[i*2]*size,y+stroke[i*2+1]*size,-28]),V.blueMid,.6,.18);x+=size*1.5;}
    };
    for(const y of [-44,-14,16,46])for(const x of [-90,-45,45,90]){text('PLEDGE',x-8,y,1.8);text('ACROSS AMERICA',x-14,y-4,1.25);}
    this.line(b,[[-105,-78,-28],[105,-78,-28],[105,60,-28],[-105,60,-28]],V.frame,.85,.45,true);
    b.end();
  }
  private makeHands(time:number){
    const b=this.hands,p=pressPose(time);b.begin();
    for(const side of [-1,1]){
      const pointing=side===-1?p.point:0,shrug=p.shrug*2;
      const shoulder:Point=[side*19,-10,1],elbow:Point=[side*27,-25+shrug,8],wrist:Point=[side*(26-pointing*3),-24+pointing*13+shrug,23-pointing*4];
      this.tube(b,shoulder,elbow,4.5,3.5,V.blueDim);this.tube(b,elbow,wrist,3.5,2.1,V.blueMid);
      const [x,y,z]=wrist;
      this.line(b,[[x-2,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2,y,z]],V.blue,1,.9,true);
      for(let i=0;i<4;i++){
        const fx=x-1.6+i*1.05,lift=i===1?pointing*5:0;
        this.line(b,[[fx,y+3,z+1],[fx,y+5+lift,z+2-lift*.2],[fx,y+5.5+lift,z+3-lift*.3]],V.white,.85,.6);
      }
      this.line(b,[[x+2,y+1,z],[x+4,y+2,z+1],[x+4.5,y+3,z+1]],V.blue,1,.8);
    }b.end();
  }
  resize(w:number,h:number){
    this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;
    this.head.resize(this.width,this.height);
    for(const b of [this.hair,this.suit,this.hands,this.lectern,this.microphones,this.backdrop,this.flag])b.setResolution(this.width,this.height);
  }
  frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
    const t=Math.max(0,Math.min(this.track.duration,Number.isFinite(time)?time:0));
    if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)this.head.resetMotion();
    this.epoch=epoch;const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;
    const pose=pressPose(t),camera=pressCamera(view,this.width/this.height);
    this.camera.fov=camera.fov;this.camera.position.copy(camera.position);this.camera.lookAt(camera.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    const distance=this.camera.position.distanceTo(camera.target);this.scene.fog=new THREE.Fog(0x000000,distance+15,distance+130);
    this.head.scene.rotation.set(pose.nod,-Math.PI/2-.24+pose.turn*.5,pose.tilt);this.makeHands(t);
    const message=this.track.message(this.track.indexAt(t)),tele=playing?message:null;
    this.head.face.update(tele,dt);this.scene.updateMatrixWorld(true);this.head.camera.copy(this.camera);this.head.camera.updateMatrixWorld();
    const artic=VoiceModel.articFromArray(message.t.artic);
    this.head.update(this.model,this.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
    this.scene.updateMatrixWorld(true);
  }
  dispose(){
    this.hair.group.removeFromParent();this.head.dispose();
    for(const b of [this.hair,this.suit,this.hands,this.lectern,this.microphones,this.backdrop,this.flag])b.dispose();
  }
}
