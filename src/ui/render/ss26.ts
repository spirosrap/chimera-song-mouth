import * as THREE from 'three';
import {ss26State,type RunwayLook,type RunwayRoom,type SS26Id} from '../../scene/ss26.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure,VideoProps,type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';
import {tourLabel,wash} from './house-tour-props.ts';
import {buildRunwaySets} from './ss26-sets.ts';

type State=ReturnType<typeof ss26State>;
type Performer={id:SS26Id;model:VoiceModel;track:TeleTrack};
type Actor={figure:VideoFigure;lapels:THREE.Group;collar:THREE.Group;skirt:THREE.Mesh;stole:THREE.Group;
  glasses:THREE.Group;jewels:THREE.Group;hair:ReturnType<VideoProps['ink']>};
const outfits:Record<RunwayLook,string>={
  leather:'#262832',ivory:'#ddd9c6',fur:'#242830',grey:'#868a91',guest:'#736463',rehearsal:'#393c44',
};
const backgrounds:Record<RunwayRoom,string>={
  runway:'#11151e',vanity:'#748692',boards:'#292c36',wings:'#252831',
  control:'#151a23',void:'#302f39',black:'#eeeeec',
};
const coats=['#21252d','#333438','#323843','#39323b','#343740','#2d3440','#34373c','#463e3b'];
const skins=['#b49788','#766054','#a87966','#bda08b','#7c6965','#9a7867','#c3a89c'];
function tint(m:THREE.Mesh,c:string) {
  (m.material as THREE.MeshBasicMaterial).color.set(c);
}

function makeActor(p:VideoProps,root:THREE.Scene,person:Performer):Actor {
  const f=new VideoFigure(person.model,person.track,p,root,outfits.leather,person.id==='ss26-charli'?'#cda695':'#b08e81');
  const hair=p.ink(f.root);
  const origin=bodyPoint(person.model),scale=person.model.tract.scale;
  f.hair.begin();
  for(let i=0;i<56;i++){
    const side=i%2?1:-1;
    const strand=Array.from({length:21},(_,j):Point=>{
      const q=j/20,a=i*.61+q*5.1;
      const x=-2.0-5.6*q+Math.cos(a)*1.2*q;
      const pt=origin(x,23.3-(7.7+i%13*.72)*q);
      return [pt.x,pt.y,side*(1.5+Math.sin(q*1.8)*(4.8+i%12*.25)+Math.sin(a)*.73)*scale];
    });
    p.line(f.hair,strand,['#252833','#30323e','#424250','#5d5863'][i%4],i%4===0?1.6:.85);
  }
  f.hair.end();
  const lapels=propGroup(f.root);
  const jewels=propGroup(f.root);
  for(const side of [-1,1]){
    const edge=p.box(lapels,5.6,34,2,'#565963',[side*9.6,-28,11]);
    edge.rotation.z=side*.36;
    p.mesh(jewels,new THREE.TorusGeometry(2.6,.54,5,15),[side*14,-4,3],'#aeb9c0');
  }
  p.oval(jewels,[0,-16,3],[10,1.9,8.8],'#a9a9a5');
  p.oval(jewels,[1,-29,14],[2.2,3.8,1.5],'#c1a778');
  const skirt=p.mesh(f.root,new THREE.CylinderGeometry(19,15,33,14),[0,-67,0],outfits.leather);
  skirt.scale.z=.72;
  const collar=propGroup(f.root);
  p.oval(collar,[0,-24,-4],[16,8,11],'#636773');
  const stole=propGroup(f.root);
  for(let i=0;i<44;i++){
    const side=i%2?1:-1;
    const u=Math.floor(i/2);
    const x=side*(19+(u%6)*3),y=-14-(u%8)*8,z=-8+(u%5)*3;
    const tuft=p.oval(stole,[x,y,z],[7+i%4,13+i%5,5+i%3],['#262731','#343842','#22252c','#484453'][i%4]);
    tuft.rotation.z=side*(-.54+u%4*.18);
  }
  const glasses=propGroup(f.root,[0,13,9.6]);
  for(const side of [-1,1]){
    const lens=p.box(glasses,12,5.1,1.9,'#232730',[side*7,0,0]);
    lens.rotation.z=side*.12;
    p.box(glasses,10,1,1.2,'#6d7481',[side*7,1.9,1.2]);
  }
  p.box(glasses,5.8,1,1.6,'#32323b',[0,-.1,1.0]);
  return {figure:f,lapels,collar,skirt,stole,glasses,jewels,hair};
}

function guest(p:VideoProps,scene:THREE.Scene,i:number) {
  const g=propGroup(scene);
  const tint=coats[i%coats.length],skin=skins[i%skins.length];
  p.oval(g,[0,92,0],[11+i%3,14,10.7],skin);
  p.oval(g,[0,102,-2],[12+i%2,7.4,11],['#292931','#4b403b','#51443c','#80766e'][i%4]);
  p.mesh(g,new THREE.CylinderGeometry(17.5,15.6,34,10),[0,65,0],tint).scale.z=.71;
  const frames=i%5===1||i%7===3;
  if(frames){
    p.box(g,18,4.5,1.8,'#252630',[0,93,9.5]);
    p.box(g,15,1.1,1.9,'#666d73',[0,94.9,10.4]);
  }
  for(const s of [-1,1]){
    p.tube(g,[s*9,49,0],[s*11,38,21],6.9,tint);
    p.tube(g,[s*11,37,21],[s*11,7,23],5.0,'#2a2b35');
    p.oval(g,[s*11,6,26],[5.5,3.3,8],'#24252e');
  }
  const hands=[-1,1].map(sign=>p.oval(g,[sign*20,55,15],[4,5,3.3],skin));
  const phone=propGroup(g,[7,72,20]);
  p.box(phone,8,13,2,'#272a31',[0,0,0]);
  p.box(phone,6.7,11.5,1.4,'#526774',[0,0,1.25]);
  return {g,hands,phone};
}
function modelProxy(p:VideoProps,scene:THREE.Scene,i:number) {
  const root=propGroup(scene);
  const coat=['#d5d8d3','#2e2932','#b3948e','#242630','#e0ddcf','#575662'][i%6];
  const dress=p.mesh(root,new THREE.CylinderGeometry(14,20,58,10),[0,94,0],coat);
  dress.scale.z=.68;
  p.oval(root,[0,143,0],[11.1,16,10.8],skins[i%7]);
  p.oval(root,[0,151,-3],[11.8,11.6,10.1],i%2?'#2d2a34':'#767275');
  p.tube(root,[-15,110,0],[-20,63,8],4.5,coat);
  p.tube(root,[15,110,0],[23,63,9],4.4,coat);
  const boots=[-1,1].map(()=>p.mesh(root,new THREE.CylinderGeometry(1,1,1,10),[0,0,0],i%3===0?'#d7d3ce':'#37333a'));
  return {root,boots};
}

export class SS26Stage {
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(36,16/9,1,4900);
  readonly props=new VideoProps();
  readonly sets=buildRunwaySets(this.props,this.scene);
  readonly charli:Actor;
  readonly frontRow:Actor;
  readonly portraitEchoes:Actor[];
  private readonly audience=Array.from({length:34},(_,i)=>guest(this.props,this.scene,i));
  private readonly models=Array.from({length:8},(_,i)=>modelProxy(this.props,this.scene,i));
  private readonly title=tourLabel(this.props,this.scene,'CHARLI XCX  SS26',[0,137,78],2.65,'#eef0ee');
  private readonly credit=tourLabel(this.props,this.scene,'DIRECTED BY TORSO',[0,124,76],1.71,'#e4e5e2');
  private readonly accessories=propGroup(this.scene);
  private readonly cup=propGroup(this.scene,[30,119,83]);
  private readonly shoes=propGroup(this.scene);
  private readonly sparks=propGroup(this.scene,[0,0,21]);
  private readonly embers:THREE.Mesh[];
  private readonly veil=new THREE.Mesh(new THREE.PlaneGeometry(18,18),
    new THREE.MeshBasicMaterial({color:'#efefee',transparent:true,depthWrite:false,depthTest:false,opacity:0}));
  private readonly viewRay=new THREE.Vector3();
  private readonly background=new THREE.Color();
  private readonly fog=new THREE.Fog('#272e3b',390,1630);
  private last=-1;
  private epoch=-1;

  constructor(people:Performer[]) {
    const lead=people.find(p=>p.id==='ss26-charli');
    const guest=people.find(p=>p.id==='ss26-guest');
    if(!lead||!guest)throw Error('SS26 requires the lead and front-row mouth tracks.');
    this.charli=makeActor(this.props,this.scene,lead);
    this.frontRow=makeActor(this.props,this.scene,guest);
    this.portraitEchoes=[makeActor(this.props,this.scene,lead),makeActor(this.props,this.scene,lead)];
    wash(this.props.box(this.title,251,30,1,'#252733',[0,0,-2]),.55);
    this.props.mesh(this.cup,new THREE.CylinderGeometry(5,4,15,13),[0,0,0],'#a63f79');
    this.props.tube(this.cup,[0,4,0],[2,21,-1],.65,'#ddd293');
    this.props.oval(this.cup,[10,-2,-2],[11,3.6,5.4],'#be947e');
    for(const sign of [-1,1]){
      const heel=podiumHeel(this.props,this.shoes,sign);
      heel.rotation.y=sign*.12;
      const tool=propGroup(this.accessories,[sign*41,118,63]);
      this.props.oval(tool,[0,0,0],[11,5.5,7],sign===1?'#b58275':'#bfa094');
      this.props.tube(tool,[-sign*9,0,8],[-sign*26,0,4],1.8,'#9d7d78');
      this.props.oval(tool,[-sign*27,0,4],[4,3,5],sign===1?'#b57982':'#b29985');
    }
    this.embers=Array.from({length:37},(_,i)=>wash(this.props.oval(this.sparks,[0,0,0],
      [1.4+i%3,2.8+i%3*1.15,1.5],['#d96944','#e99b65','#edc97e','#91b9bc'][i%4]),.67));
    this.veil.renderOrder=1000;
    this.scene.add(this.veil);
    this.resize(1280,720);
    this.frame(0,false,0,'wide',0);
  }

  resize(width:number,height:number) {
    this.camera.aspect=Math.max(1,width)/Math.max(1,height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width,height);
    this.actors().forEach(a=>a.figure.head.resize(width,height));
  }

  private actors() {return [this.charli,this.frontRow,...this.portraitEchoes];}

  frame(at:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId) {
    const s=ss26State(view,at);
    const reset=epoch!==this.epoch||Math.abs(s.t-this.last)>.28;
    const dt=Math.max(0,Math.min(.05,s.t-this.last));
    this.last=s.t;
    this.epoch=epoch;
    const [dx,dy,dz]=s.angle;
    const fit=Math.min(1.78,Math.max(.48,this.camera.aspect));
    const range=Math.max(s.height,s.width/fit)/(Math.tan(Math.PI/10)*Math.hypot(dx,dy,dz));
    const roll=s.view==='ss26-overhead'?.61:s.view==='ss26-fall'?-.16:0;
    this.camera.position.set(s.focus[0]+dx*range+Math.sin(s.t*.81)*1.8,s.focus[1]+dy*range,s.focus[2]+dz*range);
    this.camera.up.set(Math.sin(roll),Math.cos(roll),0);
    this.camera.lookAt(...s.focus);
    this.camera.updateMatrixWorld();

    this.scene.fog=this.fog;
    const bg=s.pose==='finale'?'#555965':s.light==='dark'&&s.room==='runway'?'#101219':backgrounds[s.room];
    this.scene.background=this.background.set(bg);
    this.fog.color.copy(this.background);
    for(const [room,g] of Object.entries(this.sets.rooms))g.visible=room===s.room;
    this.dress(s);
    this.placeAudience(s);
    this.placeModels(s);
    const opener=s.pose==='seated'&&s.t<13;
    this.charli.figure.root.visible=s.pose!=='empty'&&!opener;
    this.frontRow.figure.root.visible=opener;
    this.portraitEchoes.forEach(a=>a.figure.root.visible=s.view==='ss26-dissolve'&&s.t>=161.2);
    if(this.charli.figure.root.visible)this.perform(this.charli,s,0);
    if(this.frontRow.figure.root.visible)this.perform(this.frontRow,s,0);
    for(const [i,a] of this.portraitEchoes.entries())if(a.figure.root.visible)this.perform(a,s,(i===0?-1:1)*43);
    this.scene.updateMatrixWorld(true);
    for(const a of this.actors())if(a.figure.root.visible)a.figure.update(s.t,playing,this.camera,dt,reset);
    this.veil.material.opacity=s.view==='ss26-dissolve'?THREE.MathUtils.smoothstep(s.t,158,169.15)*.99:0;
    this.veil.visible=this.veil.material.opacity>0;
    this.veil.position.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(this.viewRay),2);
    this.veil.quaternion.copy(this.camera.quaternion);
    this.scene.updateMatrixWorld(true);
  }

  private dress(s:State) {
    this.title.visible=s.view==='ss26-title';
    this.credit.visible=s.view==='ss26-wing-portrait'&&s.t<13.63;
    this.credit.position.set(0,132,78);
    this.sets.edge.visible=s.view==='ss26-edge';
    this.shoes.visible=s.view==='ss26-shoes';
    this.shoes.position.set(0,-1,34+3*Math.sin(s.beat*Math.PI*2));
    this.shoes.rotation.y=.19*Math.sin(s.t*2.1);
    this.accessories.visible=s.pose==='makeup';
    this.accessories.position.x=2.5*Math.sin(s.t*2.4);
    this.cup.visible=s.view==='ss26-drink';
    this.cup.position.x=27+4*Math.sin(s.t*1.7);
    if(this.accessories.visible){
      this.accessories.children.forEach((g,i)=>g.rotation.z=(i?-.11:.13)*Math.sin(s.t*3.3+i));
    }
    this.sparks.visible=s.view==='ss26-sparks';
    if(this.sparks.visible){
      for(const [i,m] of this.embers.entries()){
        const q=(s.local*.43+i*.121)%1,a=i*2.39996;
        m.position.set(Math.cos(a)*q*(25+i%8*3),74+122*q,Math.sin(a)*q*33);
        (m.material as THREE.MeshBasicMaterial).opacity=.61*(1-q);
      }
    }
    for(const [i,{light,glow}] of this.sets.lamps.entries()){
      const powered=s.light!=='dark'||s.view==='ss26-first-close';
      tint(light,powered?i%3===0?'#e5e8f6':'#bfcce0':'#5b687d');
      (glow.material as THREE.MeshBasicMaterial).opacity=powered?.13+.07*Math.sin(s.t*2.1+i*.63):.045;
    }
    for(const [i,pool] of this.sets.pools.entries()){
      const material=pool.material as THREE.MeshBasicMaterial;
      material.opacity=s.light==='dark'?.10:.18+.065*Math.sin(s.t*2.7+i*.99);
    }
  }

  private placeAudience(s:State) {
    for(const [i,a] of this.audience.entries()){
      a.g.visible=s.room==='runway';
      if(!a.g.visible)continue;
      const side=i%2===0?-1:1,rank=Math.floor(i/2),z=372-rank*38;
      a.g.position.set(side*(102+(rank%3)*22),-3,z-(rank%4===0?8:0));
      a.g.rotation.y=-side*.71+.10*Math.sin(i+s.t*.7);
      const applause=s.t>=139&&s.t<152;
      for(const [j,hand] of a.hands.entries()){
        const wave=applause?Math.sin(s.t*8+i*.81)*(j?1:-1):0;
        hand.position.set((j?1:-1)*(12+wave*7),applause?72:56,15+wave*5);
      }
      a.phone.visible=i%4===0||i%7===3;
      a.phone.rotation.y=.36*Math.sin(s.t*.58+i);
    }
  }

  private placeModels(s:State) {
    const focused=s.view==='ss26-white-model';
    const line=s.view==='ss26-crossing'||s.view==='ss26-overhead'||s.view==='ss26-encore'
      ||s.view==='ss26-runway-floor'||s.view==='ss26-side-walk';
    for(const [i,m] of this.models.entries()){
      m.root.visible=focused?i===0:line&&(s.view==='ss26-overhead'?true:i<4);
      if(!m.root.visible)continue;
      const walk=(s.local*.39+i*.161)%1,side=i%2?1:-1;
      if(focused)m.root.position.set(0,0,40+(walk-.5)*33);
      else if(s.view==='ss26-overhead')m.root.position.set(side*(97+walk*137),0,-105+(i%3-1)*24);
      else m.root.position.set(side*(42+i%3*6),0,-102+(walk-.4)*151);
      m.root.rotation.y=focused?0:s.view==='ss26-overhead'?side*1.43:side*.51;
      const stride=Math.sin(s.beat*Math.PI*2+i*.8);
      for(const [j,boot] of m.boots.entries())
        this.props.segment(boot,[j?8:-8,71,0],[j?9:-9,5,15*stride*(j?1:-1)],5.1);
    }
  }

  private perform(actor:Actor,s:State,echo:number) {
    const f=actor.figure,p=this.props,step=Math.sin(s.beat*2*Math.PI),sway=Math.sin(s.beat*Math.PI);
    const t=s.t;
    let at:Point=[s.focus[0],151+1.7*step,s.focus[2]];
    let yaw=.21+sway*.09,roll=.035*step,pitch=0,seated=false;
    const arms:[Point,Point,Point,Point]=[[-27,-36,10],[-34,-63,12],[26,-35,11],[31,-62,12]];
    switch(s.pose){
      case 'walk': {
        at=[Math.sin(s.local*1.32)*4,149+Math.abs(step)*4,s.focus[2]+29*Math.sin((s.local-.5)*.68)];
        yaw=s.view==='ss26-overhead'?.43:.11+.11*sway;
        arms[1][2]+=step*11;
        arms[3][2]-=step*10;
        break;
      }
      case 'seated':
        at=[-113,127,s.focus[2]+3];seated=true;yaw=-.34+sway*.13;
        arms[1]=[-18,-34,31];arms[3]=[24,-55,34];
        break;
      case 'makeup':
        at=[0,119+step*.46,s.focus[2]-3];seated=true;yaw=.10+sway*.09;roll=-.16;
        arms[1]=[-27,-35,22];arms[3]=[27,-51,23];
        break;
      case 'floor':
        at=[-21,21+step*.5,57];yaw=.26;roll=-1.52;pitch=-.08;
        arms[1]=[-24,-54,20];arms[3]=[51,-38,4];
        break;
      case 'jump':
        at=[Math.sin(t*.71)*9,Math.max(62,145-s.local*(s.view==='ss26-fall'?42:6)),s.focus[2]+17];
        yaw=.4+s.local*.78;roll=-.21-s.local*.34;
        arms[1]=[-48,-28,19];arms[3]=[48,-24,15];
        break;
      case 'finale':
        at=[echo,151+Math.sin(t)*1.5,s.focus[2]-(echo?23:0)];yaw=echo?.25*Math.sign(echo):.11+.17*sway;
        break;
      default:
        if(s.view==='ss26-dance'){
          arms[1]=[-44,-5+step*14,18];arms[3]=[46,3-step*17,25];
          roll=step*.077;at[1]=146+4*step;
        }
        if(s.view==='ss26-fitting')at=[0,148+step,s.focus[2]+4];
    }
    f.root.position.set(...at);
    f.root.rotation.set(pitch,yaw,roll);
    f.pose(t,arms,seated);
    this.style(actor,s);
    if(s.pose==='walk'){
      for(const [j,side] of [-1,1].entries()){
        const lead=side*step,hip:Point=[side*10,-69,0],knee:Point=[side*13,-105+Math.max(0,lead)*3,12*lead];
        const ankle:Point=[side*12,-145+Math.max(0,lead)*6,7+lead*27];
        p.segment(f.legs[j*2],hip,knee,6.9);p.segment(f.legs[j*2+1],knee,ankle,5.3);
        f.feet[j].position.set(...ankle);
      }
    }
  }

  private style(actor:Actor,s:State) {
    const f=actor.figure,c=outfits[s.look];
    tint(f.torso,c);tint(actor.skirt,c);
    f.arms.forEach(m=>tint(m,c));
    f.legs.forEach(m=>tint(m,s.look==='ivory'?'#54505a':'#33323e'));
    actor.lapels.visible=s.look==='ivory'||s.look==='leather';
    actor.collar.visible=s.look==='grey';
    actor.stole.visible=s.look==='fur'||s.look==='guest';
    actor.glasses.visible=s.view==='ss26-grey-close'||s.view==='ss26-dance'||s.pose==='seated'&&s.t>100;
    actor.jewels.visible=s.look!=='rehearsal';
    const short=s.look==='grey'||s.pose==='seated'||s.pose==='finale';
    const length=short?26:s.look==='fur'?101:78;
    const blowing=s.view==='ss26-backlight'||s.view==='ss26-dance';
    actor.hair.begin();
    for(let i=0;i<39;i++){
      const side=i%2?1:-1;
      const points=Array.from({length:18},(_,j):Point=>{
        const q=j/17,swing=(blowing?27:5)*q*q*Math.sin(s.t*2.44+i*.29);
        const strand=Math.sin(i*.55+j*.64)*q;
        return [side*(11+i%9*.69+5*q)+swing+2.2*strand,19-length*q+2.4*strand,-8-i%6*.91-8*q];
      });
      this.props.line(actor.hair,points,['#242735','#333648','#454658','#596275'][i%4],i%4===0?1.6:.85);
    }
    actor.hair.end();
  }

  dispose() {
    this.actors().forEach(a=>a.figure.dispose());
    this.veil.geometry.dispose();
    this.veil.material.dispose();
    this.props.dispose();
  }
}

function podiumHeel(p:VideoProps,root:THREE.Group,s:number) {
  const foot=propGroup(root,[s*18,0,0]);
  p.oval(foot,[0,8,9],[6.9,5.2,18],'#29262e');
  p.oval(foot,[0,3,16],[6.2,1.9,10],'#8e4449');
  p.tube(foot,[0,1,-8],[0,13,-6],1.9,'#802c36');
  p.oval(foot,[0,27,-4],[6.7,18,5.9],'#33323d');
  return foot;
}
