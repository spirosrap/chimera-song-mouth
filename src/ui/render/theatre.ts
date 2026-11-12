import * as THREE from 'three';
import {Anatomy3D} from './anatomy3d.ts';
import {Beams} from './beams3d.ts';
import {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView,CharacterId} from '../../scene/scene.ts';
import {theatrePose,theatreCamera,THEATRE_POSITIONS,type TheatreSpeaker,type TheatrePoint as P} from '../../scene/theatre.ts';
const TAU=Math.PI*2,gold='#c4ae72',cream='#dad6be',dark='#657d83',pink='#bf879d',blue='#65aace';
interface Actor{id:TheatreSpeaker|'turtle';model:VoiceModel;track:TeleTrack;root:THREE.Group;head:Anatomy3D;accessory:Beams;clothes:Beams;limbs:Beams;color:string}
/** A surreal stage revue. The featured speakers expose actual physical airway motion. */
export class SurrealTheatre{
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(36,16/9,1,6000);readonly actors:Actor[]=[];
 readonly architecture=new Beams();readonly furniture=new Beams();readonly orchestra=new Beams();readonly ghosts=new Beams();readonly turtle=new Beams();readonly dancers=new Beams();readonly bird=new Beams();readonly megaphone=new Beams();readonly record=new Beams();readonly blackboard=new Beams();readonly curtainLeft=new THREE.Group();readonly curtainRight=new THREE.Group();
 private beams:Beams[]=[];private meshes:THREE.Mesh[]=[];private width=1280;private height=720;private lastTime:number|null=null;private epoch=-1;private duration:number;
 constructor(cast:{id:TheatreSpeaker;model:VoiceModel;track:TeleTrack}[]){
  if(cast.length!==6||Object.keys(THEATRE_POSITIONS).some(id=>!cast.some(c=>c.id===id)))throw Error('All six theatre voices are required.');this.duration=cast[0].track.duration;this.scene.background=new THREE.Color('#120d16');
  for(const [name,b]of Object.entries({architecture:this.architecture,furniture:this.furniture,orchestra:this.orchestra,ghosts:this.ghosts,turtle:this.turtle,dancers:this.dancers,bird:this.bird,megaphone:this.megaphone,record:this.record,blackboard:this.blackboard})){b.group.name=name;this.scene.add(b.group);this.beams.push(b);}
  for(const [i,id]of [...Object.keys(THEATRE_POSITIONS),'turtle'].entries()){
   const c=cast.find(c=>c.id===(id==='turtle'?'frontier-headmaster':id))!,a:Actor={id:id as Actor['id'],model:c.model,track:c.track,root:new THREE.Group(),head:new Anatomy3D(),accessory:new Beams(),clothes:new Beams(),limbs:new Beams(),color:[dark,'#b5bac5',cream,'#717381','#b9a192','#8bad7b',cream][i]};a.root.name=id;a.head.centred=true;a.head.attachAccessory(a.accessory.group);a.head.scene.rotation.y=-Math.PI/2;a.root.add(a.head.scene,a.clothes.group,a.limbs.group);this.scene.add(a.root);this.actors.push(a);this.beams.push(a.accessory,a.clothes,a.limbs);this.makeActor(a);
  }
  this.makeStage();this.makeProps();this.resize(1280,720);this.frame(0,false,0,'wide',0);
 }
 private line(b:Beams,p:P[],color:string,width=1,alpha=.65,close=false){b.line(p.flat(),p.length,color,width,{alpha,close});}
 private ring(b:Beams,c:P,u:P,v:P,color:string,width=1,alpha=.65,n=24){this.line(b,Array.from({length:n},(_,i)=>{const a=i/n*TAU;return c.map((x,j)=>x+u[j]*Math.cos(a)+v[j]*Math.sin(a)) as P;}),color,width,alpha,true);}
 private box(b:Beams,x:number,y:number,z:number,w:number,h:number,d:number,color:string,alpha=.65){for(const zz of [z,z+d])this.line(b,[[x,y,zz],[x+w,y,zz],[x+w,y+h,zz],[x,y+h,zz]],color,1,alpha,true);for(const xx of [x,x+w])for(const yy of [y,y+h])this.line(b,[[xx,yy,z],[xx,yy,z+d]],color,1,alpha);}
 private tube(b:Beams,a:P,z:P,r0:number,r1:number,color:string,alpha=.65){const s=new THREE.Vector3(...a),e=new THREE.Vector3(...z),axis=e.clone().sub(s).normalize(),u=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize();const at=(t:number,ang:number)=>s.clone().lerp(e,t).addScaledVector(u,(r0+(r1-r0)*t)*Math.cos(ang)).addScaledVector(v,(r0+(r1-r0)*t)*Math.sin(ang)).toArray() as P;for(const t of [0,.5,1])this.line(b,Array.from({length:12},(_,i)=>at(t,i/12*TAU)),color,.85,alpha,true);for(let i=0;i<8;i++)this.line(b,[at(0,i/8*TAU),at(1,i/8*TAU)],color,.8,alpha);}
 private surface(p:P,size:P,color:string,name='floor'){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshBasicMaterial({color}));m.name=name;m.position.set(...p);this.scene.add(m);this.meshes.push(m);}
 private makeStage(){const b=this.architecture;b.begin();this.surface([0,-3,-10],[820,5,620],'#282225');this.surface([0,160,-300],[820,320,5],'#48313d','backdrop');
  for(let x=-395;x<400;x+=28)this.line(b,[[x,0,290],[x,0,-300]],gold,.7,.25);for(const y of [0,10,300,315])this.line(b,[[-400,y,280],[400,y,280]],gold,2,.8);
  for(const x of [-400,400]){this.box(b,x-7,0,-300,14,315,580,gold,.8);for(let k=0;k<10;k++)this.line(b,[[x+k*(x<0?-1:1),0,280],[x+k*(x<0?-1:1),300,280]],pink,2,.8);}
  for(let x=-390;x<400;x+=30){this.ring(b,[x,305,282],[3,0,0],[0,3,0],cream,2,1);this.line(b,[[x-3,300,281],[x+3,310,281]],cream,1,.8);}
  this.box(b,-350,0,-270,700,18,250,dark,.8);this.box(b,-315,18,-265,630,18,110,dark,.8);b.end();
  for(const [side,g]of [[-1,this.curtainLeft],[1,this.curtainRight]] as const){g.name=side<0?'left-curtain':'right-curtain';this.scene.add(g);const mesh=new THREE.Mesh(new THREE.BoxGeometry(402,310,5),new THREE.MeshBasicMaterial({color:'#57432c'}));mesh.position.set(side*200,153,270);g.add(mesh);this.meshes.push(mesh);const curtain=new Beams();g.add(curtain.group);this.beams.push(curtain);curtain.begin();for(let x=0;x<=400;x+=3.8)this.line(curtain,[[side*x,0,274+2*Math.sin(x*.5)],[side*x,308,274+2*Math.sin(x*.5)]],x%3<1?cream:gold,.8,.85);curtain.end();}
 }
 private makeProps(){const b=this.furniture;b.begin();
  // The principal's armchair, standing microphone and orchestra risers.
  this.box(b,-27,36,77,54,6,46,dark,.8);this.box(b,-27,42,70,54,44,7,dark,.8);for(const x of [-28,24])this.box(b,x,38,78,5,23,45,dark,.8);
  for(const x of [-24,24])for(const z of [80,118])this.line(b,[[x,0,z],[x,38,z]],gold,1,.8);
  this.tube(b,[-30,0,118],[-30,114,118],.7,.7,gold,.9);this.ring(b,[-30,115,118],[3,0,0],[0,7,0],cream,1.3,.9);
  // Drum kit with bass drum, snare, toms and cymbals.
  for(const z of [-90,-65])this.ring(b,[205,45,z],[28,0,0],[0,28,0],cream,1,.9);for(let i=0;i<12;i++){const a=i/12*TAU;this.line(b,[[205+28*Math.cos(a),45+28*Math.sin(a),-90],[205+28*Math.cos(a),45+28*Math.sin(a),-65]],gold,.8,.8);}
  for(const [x,z,y]of [[162,-110,71],[240,-110,73],[190,-123,80],[220,-126,82]])this.tube(b,[x,y-13,z],[x,y,z],14,14,cream,.8);
  for(const [x,z,y]of [[150,-120,139],[255,-120,145],[176,-70,111],[245,-60,116]]){this.ring(b,[x,y,z],[25,0,0],[0,0,22],gold,1.2,.85);this.tube(b,[x,18,z],[x,y+3,z],.7,.7,cream,.7);}
  // Chairs and music stands in front of the string players.
  for(const x of [-280,-205,-130,-55]){this.box(b,x-15,49,-175,30,4,28,dark,.7);this.box(b,x-15,53,-182,30,27,4,dark,.7);this.tube(b,[x,18,-110],[x,87,-110],.7,.7,gold,.7);this.box(b,x-26,83,-114,52,34,3,cream,.9);for(let y=89;y<112;y+=4)this.line(b,[[x-22,y,-109],[x+22,y,-109]],dark,.8,.9);}
  this.box(b,-310,61,0,115,8,58,gold,.8);for(let i=0;i<34;i++)this.line(b,[[-306+i*3.1,70,8],[-306+i*3.1,70,39]],cream,.9,.9);for(const x of [-305,-205])this.line(b,[[x,0,7],[x,61,7]],gold,2,.9);
  // A target, balloons and a horse outline add the revue's unrelated props.
  for(const r of [8,20,33,47])this.ring(b,[298,122,-230],[r,0,0],[0,r,0],r%2?cream:blue,2,.85);
  for(const [x,z]of [[-340,65],[315,75]]){this.ring(b,[x,165,z],[23,0,0],[0,30,0],pink,1.2,.9);this.line(b,[[x,135,z],[x-7,12,z]],cream,.8,.6);}
  this.line(b,[[285,0,30],[278,70,15],[268,80,-35],[270,96,-50],[282,111,-42],[292,85,-20],[329,71,17],[345,60,34],[342,0,45]],cream,2,.85);b.end();
  this.surface([0,140,-237],[338,198,3],'#122821','blackboard-panel');const board=this.blackboard;board.begin();this.box(board,-170,40,-240,340,200,5,dark,.9);for(const y of [67,103,143,177,214])for(let x=-150;x<130;x+=42){this.line(board,[[x,y,-233],[x+15,y+8,-233],[x+22,y-7,-233],[x+32,y+4,-233]],cream,.9,.65);this.ring(board,[x+8,y+17,-233],[5,0,0],[0,7,0],cream,.8,.6);}board.end();
 }
 private makeActor(a:Actor){const b=a.clothes,h=a.accessory;b.begin();h.begin();
  if(a.id==='turtle'){h.end();b.end();return;}
  if(a.id==='frontier-parrot'){for(let i=0;i<14;i++){const z=(i/13-.5)*15;this.line(h,[[-7,17,z],[-7,23,z],[0,27,z],[7,21,z]],'#b7c78f',1,.8);}h.end();b.end();return;}
  const suit=a.id!=='frontier-mother',rings=[[-4,6,5],[-12,20,9],[-37,17,10],[-53,18,10]];
  for(const [y,x,z]of rings)this.ring(b,[0,y,0],[x,0,0],[0,0,z],a.color,1,.85);for(let j=0;j<18;j++){const t=j/18*TAU;this.line(b,rings.map(([y,x,z])=>[x*Math.cos(t),y,z*Math.sin(t)] as P),a.color,.85,.7);}
  if(suit){for(const side of [-1,1])this.line(b,[[side*5,-5,6],[side*16,-12,10],[side*5,-29,12]],cream,1.1,.9);this.line(b,[[0,-8,8],[-3,-14,11],[0,-39,12],[3,-32,12],[2,-14,11],[0,-8,8]],a.id==='frontier-headmaster'?cream:gold,1.2,.9);}
  else for(const y of [-12,-17,-23])this.ring(b,[0,y,4],[10,0,0],[0,10,7],cream,1.1,.9);
  if(a.id==='frontier-cowboy'||a.id==='frontier-doctor'){
   const color=a.id==='frontier-cowboy'?cream:dark;this.ring(h,[0,23,0],[19,0,0],[0,0,14],color,1.4,.95);for(const y of [23,29,35])this.ring(h,[0,y,0],[10,0,0],[0,0,8],color,1.2,.9);for(const z of [-8,8])this.line(h,[[-10,23,z],[-8,35,z],[7,35,z],[10,23,z]],color,1,.9);
   for(const side of [-1,1])for(let i=0;i<8;i++)this.line(b,[[side*(7+i*1.3),-15,9],[side*(7+i*1.3),-25,11]],gold,.8,.9);
  }else{
   for(let j=0;j<22;j++){const z=(j/21-.5)*16,c=Math.sqrt(Math.max(0,1-(z/9)**2));this.line(h,Array.from({length:16},(_,k)=>{const t=k/15*Math.PI;return [-1-8*c*Math.cos(t),18+(a.id==='frontier-mother'?8:5)*c*Math.sin(t),z] as P;}),cream,.8,.8);}
   for(const z of [-4.8,4.8])this.line(h,[[10,14,z-4],[10,20,z-4],[10,20,z+4],[10,14,z+4]],cream,1.5,.95,true);this.line(h,[[10,17,-.8],[11,17,0],[10,17,.8]],cream,1.6,.95);for(const z of [-9,9])this.line(h,[[10,18,z],[-7,18,z]],cream,1.2,.9);
  }h.end();b.end();
 }
 private simplePerson(b:Beams,x:number,y:number,z:number,color:string,phase:number,standing=true){for(const yy of [4,10,16])this.ring(b,[x,y+yy,z],[7,0,0],[0,0,6],blue,.8,.7);this.ring(b,[x,y+10,z],[7,0,0],[0,11,0],blue,.9,.8);this.box(b,x-15,y-31,z-8,30,28,16,color,.7);for(const side of [-1,1]){this.line(b,[[x+side*13,y-8,z],[x+side*23,y-20,z+10],[x+side*18+Math.sin(phase)*9,y-8,z+23]],color,1.3,.9);this.line(b,[[x+side*8,y-31,z],[x+side*10,y-52,z+(standing?0:25)],[x+side*12,Math.max(2,y-87),z+(standing?5:29)]],color,1.3,.8);}}
 private ensemble(q:ReturnType<typeof theatrePose>){const b=this.orchestra;b.begin();for(const [i,x]of [-280,-205,-130,-55].entries()){const y=94,z=-155;this.simplePerson(b,x,y,z,i%2?dark:pink,q.phase+i,false);this.ring(b,[x+8,y-14,z+21],[7,0,0],[0,12,0],gold,1.1,.9);this.line(b,[[x+8,y-22,z+21],[x+8,y+18,z+21]],cream,1.2,.9);this.line(b,[[x-13,y-5+Math.sin(q.phase)*5,z+23],[x+29,y+5+Math.sin(q.phase)*5,z+23]],cream,1.1,.9);}
  this.simplePerson(b,-252,95,-20,gold,q.phase,false);
  for(const x of [-280,-180,-80,20,110,290]){this.simplePerson(b,x,130,-245,cream,q.phase*.5+x);this.line(b,[[x+12,124,-232],[x+30,128,-216],[x+35,116,-211]],gold,1.6,.9);this.ring(b,[x+35,116,-210],[6,0,0],[0,6,0],gold,1.3,.9);}b.end();
  const ghost=this.ghosts;ghost.begin();for(let i=0;i<5;i++){const x=-265+i*49,y=105+Math.sin(q.phase*.5+i)*5,z=25;for(let j=0;j<18;j++){const t=j/18*TAU;this.line(ghost,[[x,y+30,z],[x+18*Math.cos(t),y+21,z+18*Math.sin(t)],[x+20*Math.cos(t),65,z+21*Math.sin(t)],[x+30*Math.cos(t),3+4*Math.sin(j),z+28*Math.sin(t)]],cream,1,.85);}this.ring(ghost,[x-6,y+15,z+18],[2,0,0],[0,3,0],dark,1.4,.9);this.ring(ghost,[x+6,y+15,z+18],[2,0,0],[0,3,0],dark,1.4,.9);}ghost.end();
  const turtle=this.turtle;turtle.begin();for(const y of [10,18,27,34]){const r=Math.sqrt(Math.max(.05,1-((y-9)/29)**2));this.ring(turtle,[-135,y,100],[58*r,0,0],[0,0,45*r],gold,1.3,.9);}for(let j=0;j<12;j++){const a=j/12*TAU;this.line(turtle,Array.from({length:20},(_,i)=>{const t=i/19*Math.PI/2;return [-135+58*Math.cos(t)*Math.cos(a),10+29*Math.sin(t),100+45*Math.cos(t)*Math.sin(a)] as P;}),cream,1,.8);}for(const side of [-1,1])for(const z of [70,126])this.tube(turtle,[-135+side*42,9,z],[-135+side*65,4,z+10],5,3,gold,.9);turtle.end();
  const dancers=this.dancers;dancers.begin();for(let i=0;i<4;i++){const x=-275+i*80+Math.sin(q.phase*.5+i)*10,y=107+Math.abs(Math.sin(q.phase+i))*5,z=145;this.simplePerson(dancers,x,y,z,i%2?pink:cream,q.phase+i);for(let j=0;j<12;j++){const a=j/12*TAU;this.line(dancers,[[x+14*Math.cos(a),y-30,z+8*Math.sin(a)],[x+29*Math.cos(a),y-51,z+20*Math.sin(a)]],i%2?pink:cream,1,.9);}this.ring(dancers,[x,y+25,z],[10,0,0],[0,0,9],gold,1,.9);}dancers.end();
  const r=this.record;r.begin();this.box(r,-65,45,130,130,10,110,dark,.9);this.ring(r,[0,57,185],[49,0,0],[0,0,49],cream,1.3,.95);for(let rad=13;rad<48;rad+=3)this.ring(r,[0,58,185],[rad,0,0],[0,0,rad],blue,.8,.6);const a=q.t*5+Math.sin(q.t*23)*q.scratch*.7;this.line(r,[[0,59,185],[43*Math.cos(a),59,185+43*Math.sin(a)]],gold,2,.9);this.ring(r,[0,59,185],[12,0,0],[0,0,12],pink,2,.95);this.line(r,[[57,58,220],[55,68,216],[26,68,190],[20,61,186]],cream,2,.95);r.end();
 }
 private limbs(a:Actor,q:ReturnType<typeof theatrePose>,energy:number){const b=a.limbs;b.begin();if(a.id==='turtle'||a.id==='frontier-parrot'){b.end();return;}const drummer=a.id==='frontier-mother',seated=drummer||a.id==='frontier-headmaster'||a.id==='frontier-announcer';for(const side of [-1,1]){const k:P=[side*10,-72,seated?25:0],foot:P=[side*12,-107,seated?28:3];this.tube(b,[side*9,-50,0],k,7,5,a.color);this.tube(b,k,foot,5,3.5,a.color);this.box(b,foot[0]-4,foot[1],foot[2]-3,8,5,16,cream,.8);
   const wrist:P=drummer?[side*30,-23+18*Math.sin(q.phase+side),27]:[side*(25+energy*10),-38+energy*25+q.point*(side===1?30:0),17];const elbow:P=[side*27,-26,5];this.tube(b,[side*20,-12,0],elbow,5,3,a.color);this.tube(b,elbow,wrist,3,2,a.color);this.ring(b,wrist,[3,0,0],[0,0,4],cream,1,.9);if(drummer)this.line(b,[wrist,[wrist[0]+side*8,wrist[1]+12,wrist[2]+28]],cream,2,.95);}
  b.end();
 }
 resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.camera.aspect=this.width/this.height;for(const b of this.beams)b.setResolution(this.width,this.height);for(const a of this.actors)a.head.resize(this.width,this.height);}
 frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity:number,_speaker?:CharacterId){const t=Math.max(0,Math.min(this.duration,Number.isFinite(time)?time:0)),q=theatrePose(t),c=theatreCamera(view,this.width/this.height,t);if(epoch!==this.epoch||this.lastTime!==null&&Math.abs(t-this.lastTime)>.25)for(const a of this.actors)a.head.resetMotion();const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,t-this.lastTime));this.lastTime=t;this.epoch=epoch;this.camera.fov=c.fov;this.camera.position.set(...c.position);this.camera.lookAt(...c.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.curtainLeft.position.x=-405*q.open;this.curtainRight.position.x=405*q.open;
  const close=view in THEATRE_POSITIONS,tableau=['theatre-turtle','theatre-ghosts','theatre-blackboard','theatre-dancers','theatre-turntable'].includes(view);
  (this.scene.background as THREE.Color).set(q.monochrome>.5?'#0b0d10':'#170f19');for(const m of this.meshes)if(m.name==='backdrop')(m.material as THREE.MeshBasicMaterial).color.copy(new THREE.Color('#48313d')).lerp(new THREE.Color('#30373c'),q.monochrome);
  for(const a of this.actors){if(a.id==='turtle'){const active=this.actors.find(x=>x.id===_speaker)??this.actors[0];a.model=active.model;a.track=active.track;}const pos=a.id==='turtle'?[-135,31,157] as P:THEATRE_POSITIONS[a.id];a.root.position.set(...pos);a.root.rotation.y=a.id==='frontier-cowboy'?.28:a.id==='frontier-doctor'?-.28:0;
   a.root.visible=close?a.id===view:view==='theatre-turtle'?a.id==='turtle':view==='theatre-drums'?a.id==='frontier-mother':view==='theatre-cowboys'?a.id==='frontier-cowboy'||a.id==='frontier-doctor':view==='theatre-megaphone'?a.id==='frontier-announcer':tableau?false:a.id==='frontier-mother'||a.id==='frontier-headmaster'&&q.t<66||a.id==='frontier-announcer'&&q.t>=135&&q.t<189||a.id==='frontier-parrot'&&q.bird>.1||a.id==='frontier-cowboy'&&q.cowboys>.1||a.id==='frontier-doctor'&&q.cowboys>.1;
   const msg=a.track.message(a.track.indexAt(t)),artic=VoiceModel.articFromArray(msg.t.artic),tele=playing?msg:null,energy=Math.min(1,msg.t.outRms*4);this.limbs(a,q,energy);a.head.camera.copy(this.camera);a.head.camera.updateMatrixWorld();a.head.face.update(tele,dt);a.head.face.content=a.id==='frontier-cowboy'?.15:.05;a.head.update(a.model,a.model.frame(artic),artic,tele,{pressure:true,particles:true,grid:false,calipers:false},dt);}
  this.ensemble(q);this.orchestra.group.visible=!close&&!tableau&&view!=='theatre-megaphone';this.ghosts.group.visible=view==='theatre-ghosts'||view==='wide'&&q.ghosts>.1;this.turtle.group.visible=view==='theatre-turtle';this.dancers.group.visible=view==='theatre-dancers';this.blackboard.group.visible=view==='theatre-blackboard';this.record.group.visible=view==='theatre-turntable';
  const bird=this.bird;bird.begin();const p=this.actors.find(a=>a.id==='frontier-parrot')!,mouth=Math.min(1,p.track.message(p.track.indexAt(t)).t.outRms*5);for(let j=0;j<12;j++){const a=j/12*TAU;this.line(bird,[[145,108,140],[145+22*Math.cos(a),75,145+14*Math.sin(a)],[145,34,133]],'#9bbc91',1.2,.85);}for(const side of [-1,1]){this.line(bird,[[145+side*15,90,145],[145+side*(35+12*Math.sin(q.phase)),65,145],[145+side*15,45,133]],cream,1.2,.9);this.line(bird,[[145+side*6,40,145],[145+side*7,24,157],[145+side*12,24,163]],gold,1.2,.9);}this.line(bird,[[140,113,162],[145,110,179],[150,113,162]],gold,2,.95);this.line(bird,[[140,110-4*mouth,162],[145,109-9*mouth,177],[150,110-4*mouth,162]],gold,2,.95);bird.end();bird.group.visible=p.root.visible;
  const m=this.megaphone;m.begin();for(const [z,r]of [[118,3],[128,4],[152,16]])this.ring(m,[-30,116,z],[r,0,0],[0,r,0],gold,1.2,.9);for(let j=0;j<12;j++){const a=j/12*TAU;this.line(m,[[-30+4*Math.cos(a),116+4*Math.sin(a),128],[-30+16*Math.cos(a),116+16*Math.sin(a),152]],cream,1,.8);}m.end();m.group.visible=view==='theatre-megaphone';
  // The glowing anatomy and line batches deliberately ignore depth. Hide the revue
  // while the opaque curtain closes so its performers cannot shine through it.
  const revealed=q.open>.98;this.furniture.group.visible=revealed&&view!=='theatre-blackboard'&&view!=='theatre-turntable';for(const mesh of this.meshes)if(mesh.name==='blackboard-panel')mesh.visible=revealed&&view==='theatre-blackboard';this.architecture.group.visible=revealed;for(const a of this.actors)a.root.visible&&=revealed;for(const b of [this.orchestra,this.ghosts,this.turtle,this.dancers,this.bird,this.megaphone,this.record,this.blackboard])b.group.visible&&=revealed;this.scene.updateMatrixWorld(true);
 }
 dispose(){for(const a of this.actors){a.accessory.group.removeFromParent();a.head.dispose();}for(const b of this.beams)b.dispose();for(const m of this.meshes){m.geometry.dispose();(m.material as THREE.Material).dispose();}}
}
