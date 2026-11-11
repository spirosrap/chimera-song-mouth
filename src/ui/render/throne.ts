import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {THRONE_CRASH,THRONE_HEAD,THRONE_PEOPLE,THRONE_SCREEN,THRONE_SCREEN_HEIGHT,throneCamera,thronePose,throneYaw,type ThroneSpeaker,type ThronePoint as P} from '../../scene/throne.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,emerald='#3fae7c',pale='#cfe8d2',gold='#d9c36a',straw='#d8c46c',tinColor='#c3d3d2',tawny='#c9a35e',gingham='#7fa9d8',coat='#9fb39a',skin='#a9c9b8';
interface Person{id:ThroneSpeaker;model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;clothes:Beams;arm:Beams}
/**
 * The Throne Room of the Great Oz. The Head over the throne is paper on a wire; the working airway
 * that speaks for it stands behind a screen in the corner, and can be watched there from the start.
 */
export class ThroneRoom{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,4000);readonly people:Person[]=[];
 readonly screen=new Beams();readonly toto=new Beams();
 /** The Head, lit while the show runs and dull after: each has a shell, a jaw and a pair of pupils. */
 readonly greatHead=new THREE.Group();
 private readonly lit={shell:new Beams(),jaw:new Beams(),eyes:new Beams()};private readonly dull={shell:new Beams(),jaw:new Beams(),eyes:new Beams()};
 private readonly room=new Beams();private readonly throne=new Beams();
 private readonly beams:Beams[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;private readonly duration:number;
 constructor(cast:{id:ThroneSpeaker;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==5)throw Error('The throne room needs Oz and the four travellers.');
  this.duration=Math.max(...cast.map(c=>c.track.duration));
  this.scene.background=new THREE.Color(0x030b07);this.scene.fog=new THREE.Fog(0x000000,300,900);
  for(const c of cast){
   const p:Person={...c,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),clothes:new Beams(),arm:new Beams()};
   p.root.name=c.id;p.head.centred=true;p.head.attachAccessory(p.hair.group);p.root.add(p.head.scene,p.clothes.group,p.arm.group);p.root.scale.setScalar(THRONE_PEOPLE[c.id].scale);
   this.scene.add(p.root);this.people.push(p);this.beams.push(p.hair,p.clothes,p.arm);this.dress(p);
  }
  for(const set of [this.lit,this.dull])for(const b of Object.values(set)){this.greatHead.add(b.group);this.beams.push(b);}
  this.greatHead.position.set(THRONE_HEAD[0],430,THRONE_HEAD[2]);this.greatHead.name='great-head';
  for(const [name,b] of Object.entries({room:this.room,throne:this.throne,screen:this.screen,toto:this.toto})){b.group.name=name;this.scene.add(b.group);this.beams.push(b);}
  this.scene.add(this.greatHead);
  this.makeRoom();this.makeHead(this.lit,'#8dffc4','#f3fff6',true,1.7);this.makeHead(this.dull,'#3c6b55','#5d8a74',false,1);this.makeScreen();this.makeToto();
  this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false,hot=false){b.line(p.flat(),p.length,color,width,{alpha,close,hot});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6,n=28){this.line(b,Array.from({length:n},(_,i)=>{const a=i/n*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.6){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);
  for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 /** Hair and hats sit in the head's own frame (+x is the face); clothes hang from the head centre (+z is the front). */
 private dress(p:Person){
  const id=p.id,h=p.hair,b=p.clothes,arm=p.arm,floor=-THRONE_PEOPLE[id].position[1]/THRONE_PEOPLE[id].scale;
  const color=id==='dorothy'?gingham:id==='scarecrow'?'#6f93a8':id==='tin-woodman'?tinColor:id==='lion'?tawny:coat,wide=id==='lion'?25:id==='dorothy'?14:id==='oz'?17:20;
  h.begin();
  if(id==='dorothy'){
   for(let i=0;i<19;i++){const z=(i/18-.5)*14.6,c=Math.sqrt(1-(z/8)**2);this.line(h,Array.from({length:19},(_,j)=>{const a=j/18*Math.PI;return [-.6-8*c*Math.cos(a),17.8+6.5*c*Math.sin(a),z] as P;}),'#a98a5a',.9,.75);}
   for(const z of [-9.5,9.5])for(let k=0;k<3;k++)this.line(h,Array.from({length:12},(_,j)=>{const t=j/11;return [-2+Math.sin(t*14+k*2)*1.3,13-24*t,z+Math.cos(t*14+k*2)*1.3] as P;}),'#b3935f',1,.85);
   for(const z of [-9.5,9.5])this.ring(h,[-2,-9,z],[2.4,0,0],[0,0,2.4],gingham,1.2,.9,10);
  }
  if(id==='scarecrow'){
   this.ring(h,[-1,21,0],[17,0,0],[0,0,17],'#6f93a8',1.2,.85);this.ring(h,[-1,22,0],[11,0,0],[0,0,11],'#6f93a8',1,.8);
   for(let i=0;i<14;i++){const a=i/14*TAU;this.line(h,[[-1+11*Math.cos(a),22,11*Math.sin(a)],[-3+3*Math.cos(a),37,3*Math.sin(a)],[-7,44,2]],'#6f93a8',.9,.7);}
   for(let i=0;i<22;i++){const a=i/22*TAU;this.line(h,[[-1+9*Math.cos(a),19,9*Math.sin(a)],[-1+(12+i%3*2)*Math.cos(a),14-i%4,(12+i%3*2)*Math.sin(a)]],straw,.9,.8);}
  }
  if(id==='tin-woodman'){
   this.ring(h,[-1,22,0],[10,0,0],[0,0,10],tinColor,1.3,.9);this.ring(h,[-1,35,0],[2.2,0,0],[0,0,2.2],tinColor,1,.9,12);this.ring(h,[-1,43,0],[2.2,0,0],[0,0,2.2],tinColor,1,.9,12);
   for(let i=0;i<12;i++){const a=i/12*TAU;this.line(h,[[-1+10*Math.cos(a),22,10*Math.sin(a)],[-1+2.2*Math.cos(a),35,2.2*Math.sin(a)],[-1+2.2*Math.cos(a),43,2.2*Math.sin(a)]],tinColor,.9,.75);}
   for(const z of [-8.6,8.6])this.ring(h,[0,6,z],[2,0,0],[0,2,0],tinColor,1,.8,10);
  }
  if(id==='lion'){
   for(let i=0;i<64;i++){const a=i/64*TAU,r=17+(i*7%5)*1.6,x=-5+(i%4)*2.2;this.line(h,[[x,6+8.5*Math.sin(a),8.5*Math.cos(a)],[x-3,6+r*.8*Math.sin(a),r*.8*Math.cos(a)],[x-7,5+r*Math.sin(a)-2,r*Math.cos(a)]],i%3?tawny:'#8f6a34',1,.75);}
   for(const z of [-9,9])this.line(h,[[-1,22,z-3],[-1,29,z],[-1,22,z+3]],tawny,1.3,.9);
  }
  if(id==='oz'){
   for(const z of [-8.4,8.4])for(let i=0;i<7;i++)this.line(h,[[-6+i*1.4,13,z],[-7+i*1.5,7+i%2,z*1.12]],pale,.9,.75);
   for(const z of [-4.7,4.7])this.ring(h,[10,15.6,z],[0,2.9,0],[0,0,3.3],gold,1.1,.9,14);this.line(h,[[10,16.2,-1.4],[10.4,16.6,0],[10,16.2,1.4]],gold,1.1,.9);
  }
  h.end();b.begin();
  // A torso of rings from the collar to the hips, then whatever the figure stands on.
  const tin=id==='tin-woodman',rings:[number,number,number][]=tin?[[-5,6,6],[-9,wide,13],[-48,wide,13],[-50,10,9]]:[[-4,5.5,5],[-11,wide,9],[-30,wide*(id==='lion'?1.05:.86),10+(id==='lion'?4:0)],[-48,wide*.9,10]];
  for(const [y,x,z] of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],color,.9,.7);
  for(let i=0;i<18;i++){const a=i/18*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)] as P),color,.85,.6);}
  if(id==='dorothy'){
   for(const [y,r] of [[-34,16],[-44,21],[-55,25],[-64,27]])this.ring(b,[0,y,0],[r,0,0],[0,0,r*.8],y===-64?pale:gingham,.9,.75);
   for(let i=0;i<22;i++){const a=i/22*TAU;this.line(b,[[13*Math.cos(a),-30,9*Math.sin(a)],[27*Math.cos(a),-64,21.6*Math.sin(a)]],i%2?gingham:pale,.85,.6);}
   this.line(b,[[-9,-11,9],[-9,-28,10],[9,-28,10],[9,-11,9]],pale,1,.8);
  }
  if(id==='scarecrow'){for(const [y,r] of [[-6,7],[-49,18]] as const)for(let i=0;i<16;i++){const a=i/16*TAU;this.line(b,[[r*Math.cos(a),y,r*.6*Math.sin(a)],[(r+5)*Math.cos(a),y-4-i%3,(r*.6+4)*Math.sin(a)]],straw,.9,.8);}this.line(b,[[-20,-31,10],[20,-31,10]],'#8a6f3a',1.5,.9);}
  if(tin){for(const y of [-20,-34])this.ring(b,[0,y,0],[wide,0,0],[0,0,13],'#8fa3a2',.8,.6);for(const y of [-16,-26,-36])this.ring(b,[0,y,13],[.9,0,0],[0,.9,0],pale,1,.9,8);}
  if(id==='oz'){
   for(const side of [-1,1])this.line(b,[[side*4,-4,5],[side*10,-12,9],[side*5,-24,10.5],[side*1.5,-13,10]],pale,1.2,.9);
   this.line(b,[[-4,-6,6],[-1,-7.5,6.5],[-4,-9,6],[4,-6,6],[1,-7.5,6.5],[4,-9,6]],gold,1.2,.9);
   for(let i=0;i<10;i++){const x=(i/9-.5)*28;this.line(b,[[x*.9,-48,-9],[x,-70,-11]],coat,.9,.6);}
   for(const y of [-22,-30,-38])this.ring(b,[0,y,10.2],[.8,0,0],[0,.8,0],gold,1,.9,8);
  }
  const hip=id==='dorothy'?-58:-48,leg=id==='dorothy'?3.4:id==='lion'?8:tin?5:6.5,legColor=id==='dorothy'?skin:color;
  for(const side of [-1,1]){
   const foot:P=[side*(wide*.5),floor+4,2];this.tube(b,[side*wide*.45,hip,0],[side*wide*.5,(hip+floor)/2,3],leg,leg*.9,legColor,.6);this.tube(b,[side*wide*.5,(hip+floor)/2,3],foot,leg*.9,leg*.7,legColor,.6);
   if(tin)this.ring(b,[side*wide*.5,(hip+floor)/2,3],[leg+1.5,0,0],[0,0,leg+1.5],pale,.9,.7,12);
   this.box(b,foot[0]-4.5,floor,-4,9,5,19,id==='dorothy'?'#eef6f4':id==='lion'?tawny:'#6b7f72',id==='dorothy'?.95:.7);
   // The Tin Woodman's right arm and both of the little man's are moved by the scene; the rest hang.
   if(!(tin&&side===1)&&id!=='oz'){
    const elbow:P=[side*(wide+4),-31,3],wrist:P=[side*(wide+2),-52,10];
    this.tube(b,[side*wide,-12,0],elbow,5,4,color,.65);this.tube(b,elbow,wrist,4,2.6,id==='dorothy'?skin:color,.65);this.ring(b,[wrist[0],wrist[1]-3,wrist[2]],[3,0,0],[0,3.4,0],id==='scarecrow'?straw:id==='lion'?tawny:id==='tin-woodman'?tinColor:skin,1,.8,10);
   }
  }
  if(id==='lion')this.line(b,Array.from({length:16},(_,j)=>{const t=j/15;return [8*Math.sin(t*3),-50-40*t+26*t*t,-10-34*t] as P;}),tawny,1.4,.85);
  b.end();arm.begin();
  if(tin){
   // The axe arm swings from the shoulder; it hangs along +y-down in its own frame.
   this.tube(arm,[0,0,0],[2,-22,2],5,4,tinColor,.7);this.tube(arm,[2,-22,2],[1,-42,6],4,3,tinColor,.7);this.ring(arm,[2,-22,2],[5.5,0,0],[0,0,5.5],pale,.9,.7,12);
   this.line(arm,[[1,-44,-30],[1,-44,34]],'#b08a55',2,.95);this.line(arm,[[1,-44,24],[1,-34,27],[1,-28,36],[1,-44,40],[1,-60,36],[1,-54,27]],pale,1.5,.95,true,true);
   arm.group.position.set(wide,-12,0);
  }
  if(id==='oz'){
   for(const side of [-1,1]){this.tube(arm,[side*wide,0,0],[side*(wide+2),-19,5],4.5,3.6,coat,.7);this.tube(arm,[side*(wide+2),-19,5],[side*7,-34,13],3.6,2.6,coat,.7);this.ring(arm,[side*5,-37,14],[3,0,0],[0,3.4,0],skin,1,.85,10);}
   arm.group.position.set(0,-12,0);
  }
  arm.end();
 }
 private makeRoom(){
  const b=this.room,t=this.throne;b.begin();
  for(let x=-280;x<=280;x+=40)this.line(b,[[x,0,-250],[x,0,230]],emerald,.65,.22);
  for(let z=-250;z<=230;z+=40)this.line(b,[[-280,0,z],[280,0,z]],emerald,.65,.22);
  for(const y of [0,300])this.line(b,[[-280,y,230],[-280,y,-250],[280,y,-250],[280,y,230]],emerald,1,.4);
  // Eight columns carry the dome's ribs to one point over the throne.
  for(const x of [-280,280])for(const z of [-250,-90,70,230]){
   this.tube(b,[x,0,z],[x,300,z],11,9,emerald,.4);this.box(b,x-15,0,z-15,30,10,30,pale,.5);
   this.line(b,Array.from({length:18},(_,j)=>{const u=j/17,s=Math.sin(u*Math.PI/2);return [x*(1-u),300+135*s,z+(-150-z)*u] as P;}),emerald,1,.4);
  }
  for(const [y,r] of [[340,230],[395,150],[425,70]])this.ring(b,[0,y,-150],[r,0,0],[0,0,r*.8],emerald,.8,.28,40);
  // Emeralds set in the back wall.
  for(let x=-240;x<=240;x+=60)for(let y=60;y<=260;y+=50)if(Math.abs(x)>70||y>280)this.line(b,[[x,y+7,-249],[x+5,y,-249],[x,y-7,-249],[x-5,y,-249]],'#8dffc4',1,.5,true);
  b.end();t.begin();
  // A dais of three steps and a tall green marble chair; the Head hangs where a sitter's would be, and much higher.
  for(let i=0;i<3;i++)this.box(t,-90+i*14,i*9,-222+i*4,180-i*28,9,150-i*26,pale,.45);
  this.box(t,-34,27,-190,68,34,60,emerald,.8);this.box(t,-34,61,-194,68,96,12,emerald,.8);
  for(const x of [-34,26])this.box(t,x,61,-182,8,24,52,emerald,.7);
  for(let i=0;i<5;i++)this.line(t,[[-24+i*12,150,-188],[-24+i*12+4,157,-188],[-24+i*12+8,150,-188]],gold,1.2,.9);
  for(const [x,y] of [[-20,128],[0,138],[20,128],[-12,96],[12,96]])this.line(t,[[x,y+5,-181.5],[x+3.5,y,-181.5],[x,y-5,-181.5],[x-3.5,y,-181.5]],'#8dffc4',1.1,.9,true);
  t.end();
 }
 /** The great Head: paper over hoops, in a frame hung from the dome's centre, so it can swing. */
 private makeHead(set:{shell:Beams;jaw:Beams;eyes:Beams},color:string,bright:string,hot:boolean,gain:number){
  const y0=THRONE_HEAD[1]-430,rx=40,ry=54,rz=42,at=(lat:number,lon:number):P=>[rx*Math.cos(lat)*Math.sin(lon),y0+ry*Math.sin(lat),rz*Math.cos(lat)*Math.cos(lon)];
  const {shell,jaw,eyes}=set;shell.begin();
  this.line(shell,[[0,0,0],[0,y0+ry,0]],bright,.8,.5);
  for(let i=1;i<12;i++){const lat=-Math.PI/2+i/12*Math.PI;this.line(shell,Array.from({length:41},(_,j)=>at(lat,j/40*TAU)),color,.9,(lat<-.45?.25:.5)*gain);}
  for(let i=0;i<16;i++){const lon=i/16*TAU,front=Math.cos(lon)>.5;this.line(shell,Array.from({length:21},(_,j)=>at(-Math.PI/2+(front?.38+.62*j/20:j/20)*Math.PI,lon)),color,.9,.45*gain);}
  for(const side of [-1,1]){
   this.line(shell,Array.from({length:17},(_,j)=>{const a=j/16*TAU;return [side*15+10*Math.cos(a),y0+12+5.5*Math.sin(a),rz*.93] as P;}),bright,1.6,.95,true,hot);
   this.line(shell,[[side*4,y0+20,rz*.97],[side*15,y0+27,rz*.95],[side*28,y0+25,rz*.84]],bright,2.2,.95,false,hot);
   this.line(shell,[[side*38,y0+10,4],[side*46,y0+16,0],[side*47,y0-2,0],[side*39,y0-8,4]],color,1.2,.7);
  }
  this.line(shell,[[-2,y0+10,rz*.99],[-6,y0-8,rz*1.08],[0,y0-11,rz*1.12],[6,y0-8,rz*1.08],[2,y0+10,rz*.99]],bright,1.4,.85);
  this.line(shell,Array.from({length:13},(_,j)=>{const u=j/12-.5;return [u*40,y0-19-Math.abs(u)*9,rz*(.97-Math.abs(u)*.2)] as P;}),bright,2,.95,false,hot);
  shell.end();jaw.begin();
  // The jaw is a separate hoop: it drops when the thread is pulled.
  this.line(jaw,Array.from({length:13},(_,j)=>{const u=j/12-.5;return [u*38,y0-22-Math.abs(u)*9,rz*(.96-Math.abs(u)*.2)] as P;}),bright,2,.95,false,hot);
  for(const k of [.55,.8,1])this.line(jaw,Array.from({length:15},(_,j)=>{const u=j/14-.5;return [u*56*k,y0-26-(1-4*u*u)*22*k,rz*(.93-Math.abs(u)*.5)*(1.02-k*.12)] as P;}),color,.9,.5);
  jaw.end();eyes.begin();
  for(const side of [-1,1]){this.ring(eyes,[side*15,y0+12,rz*.94],[3.6,0,0],[0,3.6,0],bright,2,1,14);this.ring(eyes,[side*15,y0+12,rz*.94],[1.2,0,0],[0,1.2,0],bright,2,1,8);}
  eyes.end();
 }
 private makeScreen(){
  const b=this.screen,cloth='#4f9c72';b.begin();
  // Three hinged panels standing in a shallow zigzag.
  const posts:[number,number][]=[[-62,0],[-21,9],[21,0],[62,9]];
  for(let k=0;k<3;k++){
   const [x0,z0]=posts[k],[x1,z1]=posts[k+1],at=(u:number,y:number):P=>[x0+(x1-x0)*u,y,z0+(z1-z0)*u];
   const H=THRONE_SCREEN_HEIGHT;this.line(b,[at(0,0),at(1,0),at(1,H),at(0,H)],pale,1.5,.9,true);
   for(let i=1;i<12;i++)this.line(b,[at(i/12,4),at(i/12,H-4)],cloth,.9,.5);
   for(let y=15;y<H;y+=15)this.line(b,[at(0,y),at(1,y)],cloth,.9,.5);
   for(let y=30;y<H-20;y+=45)this.line(b,[at(.5,y+13),at(.78,y),at(.5,y-13),at(.22,y)],'#8dffc4',1.1,.8,true);
  }
  b.end();b.group.position.set(...THRONE_SCREEN);
 }
 private makeToto(){
  const b=this.toto,fur='#5d6b66';b.begin();
  this.box(b,-5,9,-12,10,10,22,fur,.9);this.box(b,-4.5,15,9,9,9,10,fur,.9);this.box(b,-2.5,15,18,5,4,5,fur,.9);
  for(const x of [-4.5,4.5]){this.line(b,[[x,24,10],[x*1.3,29,12],[x,24,15]],fur,1.2,.95);for(const z of [-10,8])this.line(b,[[x,9,z],[x,0,z]],fur,1.4,.9);}
  this.line(b,[[0,18,-12],[0,26,-17],[0,29,-15]],fur,1.4,.95);
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){
  const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),pose=thronePose(t);
  if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();
  const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=throneCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  const distance=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;fog.near=distance*1.02;fog.far=distance+(view==='wide'||view==='throne-head'||view==='throne-row'?620:260);
  // The screen falls away from the man, toward the room; the dog that tipped it trots back to Dorothy.
  const ozYaw=throneYaw('oz',t);this.screen.group.rotation.set(pose.fall*Math.PI/2*.985,ozYaw,0,'YXZ');
  const next=thronePose(t+.05).toto;this.toto.group.position.set(...pose.toto);
  if(Math.hypot(next[0]-pose.toto[0],next[2]-pose.toto[2])>.01)this.toto.group.rotation.y=Math.atan2(next[0]-pose.toto[0],next[2]-pose.toto[2]);else if(t<THRONE_CRASH)this.toto.group.rotation.y=Math.PI;
  // The Head speaks with the Voice while the show runs, then only when the thread is pulled.
  const oz=this.people.find(p=>p.id==='oz')!,voice=Math.min(1,oz.track.message(oz.track.indexAt(t)).t.outRms*9),live=pose.power>.5||pose.power>.05&&Math.sin(t*61)>0;
  const open=t<THRONE_CRASH?voice:pose.demo*(.55+.45*Math.sin(t*5.2)),look=t<THRONE_CRASH?Math.sin(t*.37)*3.2:pose.demo*Math.sin(t*3.1)*5.5;
  this.greatHead.rotation.z=pose.sway;
  for(const [set,on] of [[this.lit,live],[this.dull,!live]] as const){set.shell.group.visible=set.jaw.group.visible=set.eyes.group.visible=on;set.jaw.group.position.y=-15*open;set.eyes.group.position.x=look;}
  for(const p of this.people){
   const base=THRONE_PEOPLE[p.id],id=p.id;
   p.root.position.set(base.position[0],base.position[1]-(id==='oz'?9*pose.cower:0),base.position[2]);p.root.rotation.y=throneYaw(id,t);
   // Before the crash the travellers look up at the Head; the Lion throws his head back to roar.
   const up=id==='oz'?-.1*pose.cower:.2*(1-pose.turn)+(id==='lion'?.3*pose.roar:0);p.head.scene.rotation.set(0,-Math.PI/2,up);
   if(id==='tin-woodman')p.arm.group.rotation.x=-2.55*pose.axe;
   if(id==='oz')p.arm.group.rotation.x=-1.25*pose.cower+.05*pose.cower*Math.sin(t*19);
   const msg=p.track.message(p.track.indexAt(t)),tele=playing?msg:null,artic=VoiceModel.articFromArray(msg.t.artic);
   p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);
  }
  this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();}
}
