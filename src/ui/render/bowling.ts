import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import {NEUTRAL} from '../../wasm/engine.ts';
import {bowlingPose,bowlingCamera,bowlingWorld,type BowlingSpeaker,type BowlingPerson,type BowlingPoint as P} from '../../scene/bowling.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
const TAU=Math.PI*2,wood='#bd9460',cream='#c3b9a1',red='#a95242',purple='#ac73c6',skin='#98b7bc',green='#6b9686';
interface Person{id:BowlingPerson;model:VoiceModel;track?:TeleTrack;root:THREE.Group;head:Anatomy3D;hair:Beams;body:Beams;arms:Beams}
export class BowlingAlley{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(37,16/9,1,5000);readonly people:Person[]=[];
 readonly room=new Beams();readonly furniture=new Beams();readonly scenery=new Beams();readonly flashback=new Beams();readonly pins=new Beams();readonly ball=new Beams();readonly ballRoot=new THREE.Group();
 private beams:Beams[]=[];private surfaces:THREE.Mesh[]=[];private width=1280;private height=720;private epoch=-1;private lastTime:number|null=null;private duration:number;
 constructor(cast:{id:BowlingSpeaker;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==4)throw Error('The bowling scene needs four physical speakers.');this.duration=Math.max(...cast.map(p=>p.track.duration));
  this.scene.background=new THREE.Color('#0c0b0a');this.scene.fog=new THREE.Fog('#0c0b0a',500,1700);
  for(const id of ['dude','walter','donny','jesus','liam'] as const){const c=cast.find(p=>p.id===id),p:Person={id,model:c?.model??cast.find(p=>p.id==='walter')!.model,track:c?.track,root:new THREE.Group(),head:new Anatomy3D(),hair:new Beams(),body:new Beams(),arms:new Beams()};p.root.name=id;p.head.centred=true;p.head.attachAccessory(p.hair.group);p.root.add(p.head.scene,p.body.group,p.arms.group);this.scene.add(p.root);this.people.push(p);for(const [n,b]of Object.entries({hair:p.hair,body:p.body,arms:p.arms})){b.group.name=id+'-'+n;this.beams.push(b);}this.hair(p);this.body(p);}
  for(const [n,b]of Object.entries({room:this.room,furniture:this.furniture,scenery:this.scenery,pins:this.pins,flashback:this.flashback})){b.group.name=n;this.scene.add(b.group);this.beams.push(b);}this.ball.group.name='rolling-bowling-ball';this.ballRoot.add(this.ball.group);this.scene.add(this.ballRoot);this.beams.push(this.ball);
  this.set();this.makeFurniture();this.makeFlashback();this.ball.begin();this.makeBall(this.ball,[0,0,0],7.5,'#cc6ca5');this.ball.end();this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.6,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.6){this.line(b,Array.from({length:28},(_,i)=>{const a=i/28*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.5){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.65){
  const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();
  const pt=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;
  for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>pt(t,i/12*TAU)),color,.85,alpha,true);for(let i=0;i<8;i++)this.line(b,[pt(0,i/8*TAU),pt(1,i/8*TAU)],color,.85,alpha);
 }
 private surface(x:number,y:number,z:number,w:number,h:number,d:number,color:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);this.scene.add(m);this.surfaces.push(m);}
 private set(){const b=this.room;b.begin();this.surface(0,-3,-430,1100,5,1900,'#14110d');this.box(b,-550,-5,-1380,1100,220,1900,cream,.24);
  for(let lane=-5;lane<=5;lane++){const x=lane*84;this.surface(x,-.3,-600,72,.5,1200,'#241c11');this.box(b,x-36,0,-1200,72,1,1200,wood,.75);for(let board=-30;board<=30;board+=6)this.line(b,[[x+board,1,-1200],[x+board,1,0]],wood,.6,.28);
   for(const dx of [-39,39]){this.line(b,[[x+dx,0,-1200],[x+dx,0,0]],'#717c7a',1,.65);this.line(b,[[x+dx,-3,-1200],[x+dx,-3,0]],'#717c7a',.85,.45);}this.line(b,[[x-36,1.3,0],[x+36,1.3,0]],red,2,.9);
   for(let i=-3;i<=3;i++)this.line(b,[[x+i*7-2,1.4,-150-Math.abs(i)*5],[x+i*7,1.4,-154-Math.abs(i)*5],[x+i*7+2,1.4,-150-Math.abs(i)*5]],'#c6bb91',.85,.7,true);
   for(let i=0;i<5;i++)this.ring(b,[x-14+i*7,1.4,35],[.6,0,0],[0,0,.6],wood,.85,.8);
   this.box(b,x-40,53,-1220,80,47,8,cream,.7);this.line(b,[[x-40,58,-1210],[x,85,-1210],[x+40,58,-1210]],red,1.3,.75);
   if(lane!==0)this.drawPins(b,x,0);
  }
  for(let x=-520;x<=520;x+=80)for(let z=-1300;z<=450;z+=95){this.line(b,[[x,214,z],[x+78,214,z],[x+78,214,z+92],[x,214,z+92]],cream,.6,.22,true);if((Math.round(x/80)+Math.round(z/95))%3===0)this.box(b,x+18,212,z+20,42,2,54,'#e7e7ce',.6);}
  for(const y of [18,32,118,170])this.line(b,[[-550,y,-1380],[550,y,-1380],[550,y,520]],y===32||y===118?red:cream,1.3,.6);
  for(let i=0;i<9;i++){const x=-450+i*115;for(let j=0;j<8;j++){const a=j/8*TAU;this.line(b,[[x+Math.cos(a)*8,145+Math.sin(a)*8,505],[x+Math.cos(a)*26,145+Math.sin(a)*26,505],[x+Math.cos(a+.1)*9,145+Math.sin(a+.1)*9,505]],'#6dceef',1.3,.9);}this.ring(b,[x,145,505],[7,0,0],[0,7,0],'#bfecff',1,.9);}
  b.end();const s=this.scenery;s.begin();
  for(const [i,x]of [-390,-270,190,310,430].entries()){
   const z=325+(i%2)*80,c=i%2?'#b78899':green;this.tube(s,[x,50,z],[x,93,z],15,19,c,.35);this.ring(s,[x,109,z],[9,0,0],[0,12,0],skin,.85,.35);for(const side of [-1,1]){this.line(s,[[x+side*17,85,z],[x+side*24,67,z+5],[x+side*10,53,z+8]],c,1,.45);this.tube(s,[x+side*9,49,z],[x+side*10,4,z+5],6,3,c,.3);}}
  s.end();}
 private makeFlashback(){const b=this.flashback;b.begin();
  for(const z of [-32,-65,-120])this.line(b,[[-250,0,z],[250,0,z]],cream,1,.8);
  for(const x of [-140,140]){this.box(b,x-5,0,20,10,70,10,green,.8);this.tube(b,[x,0,-170],[x,170,-170],7,5,'#a29c83',.6);for(let i=0;i<12;i++){const a=i/12*TAU;this.line(b,[[x,170,-170],[x+Math.cos(a)*45,177,-170+Math.sin(a)*45],[x+Math.cos(a)*62,151,-170+Math.sin(a)*62]],green,1,.7);}}
  for(const side of [-1,1]){const lo=side===1?30:-220,hi=side===1?220:-30;this.box(b,lo,3,20,hi-lo,55,1,green,.8);for(let x=lo;x<=hi;x+=8)for(let y=4;y<53;y+=10)this.line(b,[[x,y,21],[x+4,y+5,21],[x,y+10,21],[x-4,y+5,21]],'#819f95',.6,.55,true);}
  this.box(b,-35,0,22,5,65,5,green,.9);this.box(b,30,0,22,5,65,5,green,.9);for(let z=25;z<150;z+=12)for(let x=-30;x<30;x+=15)this.box(b,x,0,z,14,.4,11,'#ac8071',.5);
  this.box(b,-105,0,-240,210,135,70,cream,.7);this.line(b,[[-120,135,-170],[0,190,-170],[120,135,-170]],'#a59f8d',1.3,.9);this.box(b,-18,0,-168,36,91,3,'#809c94',.9);for(const x of [-65,65]){this.box(b,x-20,47,-167,40,50,2,cream,.8);for(const y of [50,73,96])this.line(b,[[x-18,y,-164],[x+18,y,-164]],'#8aa6a2',1,.75);this.line(b,[[x,49,-164],[x,96,-164]],cream,1,.8);}
  for(let x=-235;x<230;x+=14)for(const z of [-150,80]){this.line(b,[[x,0,z],[x+3,4,z+1],[x+5,0,z+3]],green,.85,.4);}b.end();}
 private makeBall(b:Beams,c:P,r:number,color:string){for(let i=0;i<10;i++){const a=i/10*Math.PI;this.ring(b,c,[Math.cos(a)*r,0,Math.sin(a)*r],[0,r,0],color,.85,.8);}for(const h of [-.6,0,.6])this.ring(b,[c[0],c[1]+h*r,c[2]],[r*Math.sqrt(1-h*h),0,0],[0,0,r*Math.sqrt(1-h*h)],color,.85,.7);for(const [x,y]of [[-2,2],[2,2],[0,-2]])this.ring(b,[c[0]+x,c[1]+y,c[2]+Math.sqrt(r*r-x*x-y*y)],[1.05,0,0],[0,1.05,0],'#e8ccde',.85,.9);}
 private makeFurniture(){const b=this.furniture;b.begin();
  for(const [x,z]of [[-98,252],[-27,252],[-61,325],[75,205],[140,205],[-280,270],[290,270]]){this.box(b,x-25,38,z-19,50,7,43,red,.85);this.box(b,x-25,45,z+19,50,45,5,red,.85);for(let i=0;i<7;i++)this.line(b,[[x-22+i*7,43,z-17],[x-22+i*7,43,z+17],[x-22+i*7,85,z+21]],red,.85,.5);for(const side of [-1,1])this.line(b,[[x+side*21,0,z-13],[x+side*21,40,z-13],[x+side*21,40,z+19],[x+side*21,0,z+19]],cream,1.3,.65);}
  for(const [x,z]of [[45,135],[-210,95],[250,95]]){this.box(b,x-22,22,z-45,44,40,85,cream,.75);this.line(b,[[x-25,61,z-40],[x-25,65,z+25],[x+25,65,z+25],[x+25,61,z-40]],red,1.6,.9,true);for(const dz of [-30,-12,6,24])this.makeBall(b,[x,65,z+dz],7.5,dz%3?'#7eaa99':'#ba7391');this.ring(b,[x,55,z+43],[16,0,0],[0,12,0],cream,1,.8);for(let i=-4;i<=4;i++)this.line(b,[[x+i*2,50,z+44],[x+i*2,59,z+44]],cream,.85,.8);}
  for(const [x,z]of [[-155,190],[190,178],[325,170]]){this.tube(b,[x,0,z],[x,83,z],2,2,cream,.7);this.box(b,x-26,79,z-16,52,4,34,cream,.85);this.box(b,x-20,120,z-7,40,23,15,cream,.9);this.tube(b,[x,83,z],[x,121,z],2,2,cream,.8);for(const dx of [-13,13])this.ring(b,[x+dx,132,z-8],[8,0,0],[0,8,0],'#b1d2d7',1.3,.9);for(let i=0;i<4;i++)this.line(b,[[x-20,84,z-9+i*5],[x+20,84,z-9+i*5]],'#899b9a',.85,.65);this.tube(b,[x+16,84,z+7],[x+16,99,z+7],3,3,cream,.8);}
  for(let row=0;row<2;row++){this.box(b,80,34+row*32,386,340,5,24,red,.8);for(let i=0;i<13;i++)this.makeBall(b,[92+i*26,48+row*32,397],8,['#9eb6a0','#ac819a','#8facc3'][i%3]);}
  b.end();}
 private hair(p:Person){const b=p.hair,id=p.id;b.begin();const long=id==='dude',pony=id==='jesus',bald=id==='liam',color=long?'#aaa184':pony?'#637c7e':id==='walter'?'#8d9485':'#7c8176';
  for(let i=0;i<28;i++){const z=(i/27-.5)*15,c=Math.sqrt(Math.max(0,1-(z/8)**2));if(!bald||Math.abs(z)>5)this.line(b,Array.from({length:24},(_,j)=>{const t=j/23;return [-8+16*t,18+6.3*c*Math.sin(t*Math.PI)+(long?1.1:.3)*Math.sin(t*14+i),z] as P;}),color,.85,.75);}
  if(long)for(let i=0;i<30;i++){const a=i<15?1.0+i/14*1.05:4.23+(i-15)/14*1.05;this.line(b,Array.from({length:25},(_,j)=>{const t=j/24;return [-1+Math.cos(a)*(9+2*t),21-29*t,Math.sin(a)*(9+2*t)+Math.sin(t*14+i)*.8] as P;}),color,.85,.85);}
  if(pony)for(let i=0;i<14;i++)this.line(b,Array.from({length:30},(_,j)=>{const t=j/29;return [-9-5*t+.6*Math.sin(t*24+i),15-34*t,(i/13-.5)*4+Math.sin(t*28+i)*.55] as P;}),color,.85,.8);
  if(id==='dude'||id==='walter'||id==='jesus'){for(let i=0;i<24;i++){const z=(i/23-.5)*(long?13:8);this.line(b,Array.from({length:17},(_,j)=>{const t=j/16;return [8-1.5*t,7-(long?14:7)*t,z*(1-.7*t)] as P;}),long?'#9d9c8a':'#687c7c',.85,.8);}for(const side of [-1,1])for(let i=0;i<4;i++)this.line(b,[[9,8.6+i*.3,side*.6],[9,7.5+i*.3,side*3.5]],color,.85,.9);}
  if(id==='walter'){for(const z of [-4.4,4.4]){this.ring(b,[10,16.6,z],[0,2.4,0],[0,0,3.5],'#e6be5b',1.6,1);for(let k=-2;k<=2;k++)this.line(b,[[10.1,16.6+k*.6,z-2.8],[10.1,16.6+k*.6,z+2.8]],'#bd994b',.6,.45);}this.line(b,[[10,17,-1],[10.4,17.4,0],[10,17,1]],'#e6be5b',1.3,.95);for(const z of [-8,8])this.line(b,[[10,17,z],[-3,17,z]],'#e6be5b',1.3,.9);}
  b.end();}
 private body(p:Person,flashback=false,at=0){const b=p.body,id=p.id,standing=id==='jesus'||id==='liam',wide=id==='walter'||id==='liam',shirt=flashback?cream:id==='jesus'||id==='liam'?purple:id==='dude'?'#7c9687':id==='donny'?green:'#8cabb9';b.begin();
  const width=wide?27:20,rings=[[-4,5.5,5],[-12,width,10],[-31,wide?29:19,wide?15:11],[-48,wide?25:19,12]];for(const [y,x,z]of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],shirt,.85,.75);for(let i=0;i<22;i++){const a=i/22*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(a),y,z*Math.sin(a)]),shirt,.85,.65);}
  if(flashback)for(let y=-15;y>=-45;y-=5)this.line(b,[[-18,y,11],[18,y,11]],'#857d79',1.3,.9);
  if(id==='dude'){this.line(b,[[-6,-4,5],[0,-13,12],[6,-4,5]],cream,1.3,.8);}
  else {for(const side of [-1,1])this.line(b,[[side*5,-3,5],[side*13,-12,11],[side*5,-20,12],[side*2,-11,11]],shirt,1.3,.9);this.line(b,[[0,-14,13],[0,-46,13]],shirt,1,.85);for(const y of [-20,-29,-38])this.ring(b,[0,y,13],[.5,0,0],[0,.5,0],cream,.8,.85);}
  if(id==='walter'){for(let y=-17;y>=-43;y-=6)this.line(b,[[-23,y,12],[23,y,12]],'#b7b4a4',.85,.55);for(let x=-21;x<=21;x+=7)this.line(b,[[x,-13,12],[x,-46,13]],'#c2c0ae',.85,.6);for(const side of [-1,1]){this.line(b,[[side*7,-4,7],[side*24,-12,10],[side*26,-46,12],[side*7,-46,15],[side*7,-4,7]],'#b6ab8f',1.3,.95);for(const y of [-18,-35])this.box(b,side===1?11:-23,y,14,12,9,1,'#b6ab8f',.8);}}
  if(id==='jesus'&&!flashback){this.line(b,[[-5,-7,7],[0,-22,14],[5,-7,7]],'#d5bd75',1,.85);this.line(b,[[0,-20,14],[0,-25,14],[-2,-22,14],[2,-22,14]],'#d5bd75',1.3,.9);}
  const walking=id==='jesus'&&!flashback&&(at>36.3&&at<41.8||at>51&&at<66),stride=walking?Math.sin(at*4)*12:0,follow=id==='jesus'&&!flashback?Math.max(0,Math.min(1,(at-39)/1.8,(45-at)/1.8)):0;
  for(const side of [-1,1]){const lift=Math.max(0,side*stride)*.4,knee:P=[side*(standing?10:13),standing?-80+lift:-52,standing?side*stride*.5+side*follow*10:33],ankle:P=[side*(standing?11:14),standing?-104+lift:-86,standing?3+side*stride+side*follow*23:36],pants=flashback?'#749fae':id==='jesus'?purple:id==='dude'?'#b3b2a1':id==='walter'?'#7f8d77':'#8c8a75';this.tube(b,[side*10,-46,0],knee,wide?10:7,6,pants);this.tube(b,knee,ankle,6,4,standing||id==='donny'?pants:skin);this.box(b,ankle[0]-5,ankle[1]-4,ankle[2]-3,10,6,18,id==='jesus'&&!flashback?purple:cream,.8);for(let k=0;k<4;k++)this.line(b,[[ankle[0]-3,ankle[1]+2,ankle[2]+3+k*2],[ankle[0]+3,ankle[1]+2,ankle[2]+4+k*2]],cream,.8,.75);
   if(id==='dude')for(let k=0;k<5;k++)this.line(b,[[side*7-k,-47,5],[side*14-k,-52,30]],'#718984',.8,.65);}
  b.end();}
 private hand(b:Beams,w:P,point=false,color=skin){const [x,y,z]=w;this.line(b,[[x-2.5,y,z],[x-2,y+4,z+1],[x+2,y+4,z+1],[x+2.5,y,z]],color,.85,.85,true);for(let i=0;i<4;i++)this.line(b,[[x-1.6+i,y+3,z+1],[x-1.6+i,y+(point&&i===1?10:6),z+2],[x-1.6+i,y+(point&&i===1?11:5),z+3]],color,.85,.8);}
 private arms(p:Person,q:ReturnType<typeof bowlingPose>){const b=p.arms,id=p.id,shirt=q.flashback?cream:id==='jesus'||id==='liam'?purple:id==='dude'?'#7c9687':id==='donny'?green:'#8cabb9';b.begin();for(const side of [-1,1]){let elbow:P=[side*26,-28,9],wrist:P=[side*16,-45,12];
   if(id==='jesus'&&!q.flashback){if(side===1&&q.t<43){wrist=q.hand;elbow=[25,-23+q.lick*17,5+q.lick*10];}else if(q.dance>0){wrist=[side*(22+q.dance*14),-35+q.dance*12,17];elbow=[side*30,-24,10];}if(q.confront>.9&&side===1){wrist=[22+q.threaten*9,-45+q.threaten*29,14+q.threaten*19];elbow=[29,-27,10];}}
   if(id==='dude'){wrist=side===-1?[-27,-26,2]:[16+q.dudeGesture*22,-43+q.dudeGesture*18,30+q.dudeGesture*9];elbow=[side*28,-24,12];if(q.beeper>.1)wrist=[side*4,-24,20];}
   if(id==='walter'){wrist=[-side*16*q.walterCross+side*15*(1-q.walterCross),-43+q.walterCross*21+q.walterPoint*(side===1?22:0),29-q.walterCross*10+q.walterPoint*10];elbow=[side*32,-28,12];}
   if(id==='donny')wrist=[side*10,-43,26];
   this.tube(b,[side*(id==='walter'||id==='liam'?26:20),-12,0],elbow,6,4,shirt,.75);this.tube(b,elbow,wrist,4,2.5,skin,.75);this.hand(b,wrist,id==='jesus'&&side===1&&q.finger>.3||id==='walter'&&side===1&&q.walterPoint>.3,id==='jesus'&&side===1&&!q.flashback?'#7d9293':skin);
   if(id==='jesus'&&side===1){for(const y of [0,2])this.ring(b,[wrist[0],wrist[1]+y,wrist[2]],[2.8,0,0],[0,0,2],'#c2c4ab',.85,.9);}
  }
  if(id==='dude'&&q.t>=128){const x=q.beeper>.1?-3:6,y=q.beeper>.1?-24:-13,z=q.beeper>.1?23:12;this.box(b,x,y,z,6,8,1,'#a8bfbc',1);this.line(b,[[x+1,y+5,z+1.1],[x+5,y+5,z+1.1]],'#c8dedb',1,.9);}
  if(id==='jesus'&&q.lick>.2)this.line(b,[[0,10,11],[1,10+q.lick*2,16],[0,11+q.lick*2,18]],'#eb8a9f',2,.9);
  b.end();}
 private drawPins(b:Beams,x:number,fall:number){for(let row=0;row<4;row++)for(let col=0;col<=row;col++){const cx=x+(col-row/2)*12,z=-1135-row*11,y=2,angle=fall*(.9+(row+col)%3*.3),map=(v:P):P=>[cx+v[0]*Math.cos(angle)+v[1]*Math.sin(angle)*(col%2?1:-1),y-v[0]*Math.sin(angle)+v[1]*Math.cos(angle),z+v[2]+fall*(row*8+col*2)];const rings=[[0,3.5],[5,4.4],[12,2.2],[17,1.7],[20,2.7],[23,1.8]];for(const [yy,r]of rings)this.line(b,Array.from({length:12},(_,i)=>map([r*Math.cos(i/12*TAU),yy,r*Math.sin(i/12*TAU)])),yy===17?red:'#d8ddc9',.85,.9,true);for(let k=0;k<6;k++)this.line(b,rings.map(([yy,r])=>map([r*Math.cos(k/6*TAU),yy,r*Math.sin(k/6*TAU)])),'#d8ddc9',.85,.7);}}
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const p of this.people)p.head.resize(this.width,this.height);for(const b of this.beams)b.setResolution(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){const playbackTime=Math.max(0,Math.min(this.duration,time)),q=bowlingPose(playbackTime),t=playbackTime;if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const p of this.people)p.head.resetMotion();const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;
  const c=bowlingCamera(view,this.width/this.height,t);this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();const dist=this.camera.position.distanceTo(new THREE.Vector3(...c.target)),fog=this.scene.fog as THREE.Fog;fog.near=dist+150;fog.far=dist+1600;
  this.body(this.people.find(p=>p.id==='jesus')!,q.flashback,q.t);this.flashback.group.visible=q.flashback;for(const b of [this.room,this.furniture,this.scenery,this.pins])b.group.visible=!q.flashback;for(const m of this.surfaces)m.visible=!q.flashback;
  for(const p of this.people){p.root.visible=!q.flashback||p.id==='jesus';p.root.position.set(...(q.flashback?[0,108,0] as P:q[p.id]));p.root.rotation.y=q.flashback?0:p.id==='jesus'?q.jesusYaw+q.turnAway*.8:p.id==='liam'?0:p.id==='donny'?-.4-q.donnyTurn*.8:Math.PI+(p.id==='dude'?q.dudeTurn:-q.walterPoint*.2);p.head.scene.rotation.set(0,-Math.PI/2,p.id==='jesus'?q.jesusLean:p.id==='dude'?q.dudeLean:p.id==='walter'?q.walterLean:0);this.arms(p,q);const msg=p.track?.message(p.track.indexAt(t)),tele=playing&&msg?msg:null,artic=msg?VoiceModel.articFromArray(msg.t.artic):NEUTRAL;p.head.camera.copy(this.camera);p.head.camera.updateMatrixWorld();p.head.face.update(tele,dt);p.head.update(p.model,p.model.frame(artic),artic,tele,{pressure:!!msg,particles:!!msg,grid:false,calipers:false},dt);}
  this.ballRoot.position.set(...q.ball);this.ballRoot.rotation.set(q.roll*6,.4,0);this.ballRoot.visible=q.ballVisible&&!q.flashback;this.pins.begin();this.drawPins(this.pins,0,q.impact);this.pins.end();this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const p of this.people){p.hair.group.removeFromParent();p.head.dispose();}for(const b of this.beams)b.dispose();for(const m of this.surfaces){m.geometry.dispose();(m.material as THREE.Material).dispose();}}
}
