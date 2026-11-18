import * as THREE from 'three';
import type {CameraView} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {VideoFigure,VideoProps,type VideoPoint as P} from './videoProps.ts';

const group=(parent:THREE.Object3D)=>{const g=new THREE.Group();parent.add(g);return g;};
const colors={navy:'#070d20',blue:'#17365f',cyan:'#52f5ec',pink:'#f050b5',gold:'#ffd761',white:'#ecf7ed',orange:'#ff723d',lava:'#d43432'};

/** A source-clocked pixel-platformer performance with the real CHIMERA airway in the foreground. */
export class FertoStage{
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(36,16/9,1,3000);
  readonly props=new VideoProps();
  readonly player:VideoFigure;
  private readonly worlds:Record<string,THREE.Group>;
  private readonly coins:THREE.Mesh[]=[];
  private readonly enemies:{group:THREE.Group;baseY:number}[]=[];
  private readonly hudCanvas=document.createElement('canvas');
  private readonly hudTexture:THREE.CanvasTexture;
  private readonly hud:THREE.Sprite;
  private epoch=-1;private last=NaN;private width=1280;private height=720;private aspect=16/9;

  constructor(readonly model:VoiceModel,readonly track:TeleTrack){
    this.scene.background=new THREE.Color(colors.navy);this.scene.fog=new THREE.Fog(colors.navy,1000,2300);
    this.worlds={island:group(this.scene),castle:group(this.scene),continued:group(this.scene),moon:group(this.scene),lava:group(this.scene),vienna:group(this.scene),concert:group(this.scene),end:group(this.scene)};
    this.buildIsland();this.buildCastle();this.buildContinue();this.buildMoon();this.buildLava();this.buildVienna();this.buildConcert();this.buildEnd();this.buildStars();
    this.player=new VideoFigure(model,track,this.props,this.scene,'#d7e5e8','#d8bba7');
    this.player.root.position.set(-90,142,75);this.player.root.scale.setScalar(1.05);
    const trim=this.props.ink(this.player.root);trim.begin();
    // Small neon jacket piping keeps the face clean and gives the player a readable arcade silhouette.
    this.props.line(trim,[[-17,-13,12],[-9,-30,12],[0,-36,12],[9,-30,12],[17,-13,12]],colors.cyan,1.7);
    this.props.line(trim,[[-8,-40,11],[0,-37,13],[8,-40,11]],colors.pink,1.5);trim.end();
    this.hudCanvas.width=1280;this.hudCanvas.height=720;
    this.hudTexture=new THREE.CanvasTexture(this.hudCanvas);this.hudTexture.colorSpace=THREE.SRGBColorSpace;
    this.hudTexture.magFilter=THREE.NearestFilter;this.hudTexture.minFilter=THREE.NearestFilter;
    const material=new THREE.SpriteMaterial({map:this.hudTexture,transparent:true,depthTest:false,depthWrite:false});
    this.hud=new THREE.Sprite(material);this.hud.renderOrder=1000;this.camera.add(this.hud);this.scene.add(this.camera);
    this.resize(1280,720);this.frame(0,false,0,'wide');
  }

  private slab(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,c:string){return this.props.box(g,w,h,d,c,[x,y,z]);}
  private platform(g:THREE.Group,x:number,z:number,w:number,d:number,c:string,top=8){
    this.slab(g,x,top-hFor(w,d),z,w,18,d,c);this.slab(g,x,top,z,w-4,3,d-4,colors.cyan);
  }
  private buildIsland(){
    const g=this.worlds.island;
    this.slab(g,0,-40,-160,1500,24,1150,'#1c89aa');
    this.slab(g,0,-16,-145,1110,20,330,'#24435b');
    for(let i=-4;i<=4;i++)this.slab(g,i*145,-4,-212,136,6,80,i%2?'#3f7390':'#315b79');
    this.platform(g,-40,45,300,120,'#3b8fba',36);this.platform(g,230,-35,190,95,'#33739d',93);this.platform(g,420,-130,190,110,'#3d83a4',148);
    for(const [x,z,s] of [[-410,-330,1],[-180,-380,.82],[100,-425,.92],[390,-370,.8],[540,-250,.72]] as [number,number,number][]){
      this.slab(g,x,48*s,z,142*s,112*s,105*s,colors.white);this.slab(g,x,106*s,z,154*s,17*s,116*s,'#83c7d1');
      this.props.mesh(g,new THREE.SphereGeometry(1,10,6),[x,136*s,z],'#29a9de').scale.set(44*s,35*s,44*s);
      for(const dx of [-38,38])this.slab(g,x+dx* s,53*s,z+54*s,15*s,31*s,3,'#16456a');
    }
    this.slab(g,380,18,-298,110,3,4,colors.gold);
    const coin=this.props.mesh(g,new THREE.TorusGeometry(18,4,7,16),[380,48,-298],colors.gold);this.coins.push(coin);
    this.slab(g,-280,18,-70,48,28,42,'#8c513c');this.slab(g,-280,34,-70,36,5,34,'#e5b062');
  }
  private buildCastle(){
    const g=this.worlds.castle;this.slab(g,0,-24,-100,1180,40,770,'#36445d');
    this.slab(g,70,55,-210,430,138,100,'#8b9bb0');this.slab(g,70,131,-210,460,16,112,'#b6c6d3');
    for(const x of [-145,285]){this.slab(g,x,155,-210,88,190,100,'#7d8ea6');this.slab(g,x,256,-210,102,16,112,'#d5cfaa');this.props.mesh(g,new THREE.ConeGeometry(52,64,4),[x,296,-210],'#764d70').rotation.y=Math.PI/4;}
    for(let i=0;i<7;i++){this.slab(g,-72+i*45,60,-154,17,60,5,'#182a46');this.slab(g,-72+i*45,61,-150,7,51,2,i%2?colors.cyan:colors.gold);}
    this.slab(g,70,8,100,650,24,410,'#4b5871');this.slab(g,180,24,2,160,8,70,'#bc9e73');
    for(let i=0;i<6;i++){this.slab(g,125+i*22,43,5,8,29,8,colors.gold);}
    this.slab(g,88,46,-162,94,4,5,'#c8d6e2');
    this.slab(g,70,78,186,136,9,80,'#b09176');
    for(let i=0;i<4;i++)this.slab(g,26+i*29,132,193,13,103,10,'#914c64');
  }
  private buildContinue(){
    const g=this.worlds.continued;this.slab(g,0,-38,-70,1400,22,1050,'#122342');
    this.slab(g,0,225,-360,400,8,4,'#192b49');this.slab(g,0,88,-170,780,24,160,'#344b65');
    for(let i=0;i<12;i++){this.slab(g,-370+i*67,38,-170,37,80,16,i%2?'#597788':'#45657b');}
    for(const x of [-100,0,100]){this.slab(g,x,183,-30,20,20,12,colors.gold);this.slab(g,x,210,-30,68,8,12,'#dcc888');}
    this.slab(g,0,300,-310,450,68,6,'#06101e');this.slab(g,0,300,-302,420,6,3,colors.cyan);
  }
  private buildMoon(){
    const g=this.worlds.moon;this.slab(g,0,-70,-130,1800,20,1100,'#11182e');
    const moon=this.props.mesh(g,new THREE.SphereGeometry(180,20,14),[315,-20,-360],'#aab4bb');
    for(let i=0;i<12;i++){const a=i*2.4,r=35+(i%5)*27;this.props.mesh(g,new THREE.SphereGeometry(1,10,8),[315+Math.cos(a)*r,-20+Math.sin(a)*r,-205],'#818d9a').scale.set(11+i%3*3,5,8);}
    for(let i=0;i<9;i++)this.platform(g,-420+i*116,-60-(i%3)*98,88,72,i%2?'#50819c':'#456b9d',20+i%3*24);
    for(let i=0;i<5;i++){
      const e=group(g);e.position.set(-240+i*128,92+(i%2)*40,-150-(i%3)*30);
      this.slab(e,0,0,0,48,48,38,i%2?colors.pink:'#a35ff1');this.slab(e,-10,6,21,7,7,3,colors.white);this.slab(e,10,6,21,7,7,3,colors.white);this.enemies.push({group:e,baseY:e.position.y});
    }
    for(let i=0;i<5;i++)this.slab(g,-340+i*160,208,-225,7,55,7,colors.cyan);
    void moon;
  }
  private buildLava(){
    const g=this.worlds.lava;this.slab(g,0,-54,-100,1550,30,940,'#7d202b');this.slab(g,0,-32,-100,1450,10,780,colors.orange);
    for(let i=0;i<12;i++){const x=-560+i*104,z=-320+(i%3)*105;this.slab(g,x,13,z,94,58,84,i%2?'#47354c':'#5a3d57');this.slab(g,x,43,z,86,5,77,'#c94443');}
    for(let i=0;i<8;i++){const ghost=group(g),x=-380+i*112,z=-25-(i%3)*100;ghost.position.set(x,100,z);this.slab(ghost,0,0,0,36,54,25,'#d7f3ee');this.slab(ghost,-8,8,14,5,7,3,'#342c60');this.slab(ghost,8,8,14,5,7,3,'#342c60');this.enemies.push({group:ghost,baseY:ghost.position.y});}
    this.slab(g,430,140,-240,240,16,50,'#e9544b');this.slab(g,500,190,-240,22,95,22,'#fbc15c');
  }
  private buildVienna(){
    const g=this.worlds.vienna;this.slab(g,0,-34,-90,1500,24,1100,'#383a50');this.slab(g,0,-18,-100,1400,10,250,'#171e2d');
    for(let i=-4;i<=4;i++)this.slab(g,i*145,-10,-100,3,2,55,'#f6d57c');
    for(let i=0;i<5;i++){const x=-500+i*242,h=210+(i%3)*55;this.slab(g,x,h/2,-360,170,h,130,i%2?'#857d7a':'#a49b86');this.slab(g,x,h+13,-360,180,18,140,'#c3b493');for(let j=-1;j<=1;j++)this.slab(g,x+j*43,90,-293,15,55,4,'#34415a');}
    this.slab(g,385,170,-320,122,340,105,'#a9a18e');this.slab(g,385,345,-320,132,14,113,'#536a91');
    const cab=group(g);cab.position.set(195,14,90);this.slab(cab,0,32,0,150,40,82,'#edbf39');this.slab(cab,-10,66,-1,88,34,72,'#f5d252');this.slab(cab,-10,66,38,36,24,3,'#65a6b2');this.slab(cab,38,66,38,32,24,3,'#65a6b2');
    for(const x of [-47,48]){const wheel=this.props.mesh(cab,new THREE.CylinderGeometry(18,18,9,12),[x,8,25],'#171b24');wheel.rotation.x=Math.PI/2;}
    this.slab(cab,0,98,0,70,10,10,'#f3e6a1');
  }
  private buildConcert(){
    const g=this.worlds.concert;this.slab(g,0,-30,-100,1550,32,1000,'#15182c');this.slab(g,0,8,-220,840,52,250,'#282244');
    for(const x of [-410,-300,300,410]){this.slab(g,x,135,-295,14,250,12,colors.cyan);this.slab(g,x,263,-295,100,10,12,colors.pink);}
    this.slab(g,0,282,-295,465,72,14,'#040916');this.slab(g,0,282,-286,440,7,4,colors.gold);
    for(let i=0;i<32;i++){const x=-590+(i%16)*78,y=28+Math.floor(i/16)*29,z=110+Math.floor(i/16)*14;this.slab(g,x,y,z,28,22,18,i%3?colors.cyan:colors.pink);}
    for(let i=0;i<8;i++){const x=-430+i*123;this.props.mesh(g,new THREE.ConeGeometry(19,80,4),[x,250,-175],i%2?colors.cyan:colors.pink).rotation.z=(i%3-1)*.4;}
    this.slab(g,-510,174,-270,8,310,8,colors.pink);this.slab(g,510,174,-270,8,310,8,colors.cyan);
  }
  private buildEnd(){
    const g=this.worlds.end;this.slab(g,0,-35,-100,1300,24,800,'#070d20');
    for(let i=0;i<32;i++){this.slab(g,-620+i*40,Math.sin(i*3.1)*155,-240,3,3,3,i%2?colors.cyan:colors.gold);}
    this.slab(g,0,170,-200,530,9,5,'#1f385d');this.slab(g,0,-5,-200,530,9,5,'#1f385d');
  }
  private buildStars(){
    for(let i=0;i<95;i++){const x=Math.sin(i*91.71)*650,y=230+Math.sin(i*17.4)*190,z=-550-Math.abs(Math.cos(i*2.13))*550;this.props.box(this.scene,3+i%3,3+i%2,2,i%3?colors.cyan:colors.white,[x,y,z]);}
  }
  private stageAt(time:number,view:CameraView){
    if(view==='ferto-island')return 'island';if(view==='ferto-castle')return 'castle';if(view==='ferto-continue')return 'continued';if(view==='ferto-moon')return 'moon';if(view==='ferto-lava')return 'lava';if(view==='ferto-vienna')return 'vienna';if(view==='ferto-concert')return 'concert';if(view==='ferto-end')return 'end';
    if(time<6.9)return 'end';if(time>=39.5&&time<42.1)return 'continued';if(time>=32&&time<42)return 'castle';if(time>=78&&time<118.8)return 'moon';if(time>=118.8&&time<131.3)return 'lava';if(time>=131.3&&time<173.5)return 'vienna';if(time>=173.5&&time<186.3)return 'concert';if(time>=186.3)return 'end';return 'island';
  }
  private titleFor(stage:string){return ({island:'AEGEAN ISLAND · STAGE 1',castle:'CASTLE VAULT · BOSS ROOM',continued:'CONTINUE? · 5 CREDITS',moon:'MOON RUN · SECRET STAGE',lava:'LAVA CAVE · FINAL LIFE',vienna:'VIENNA TAXI · BONUS ROUND',concert:'PIXEL CONCERT · FINAL LEVEL',end:'FERTO · INSERT COIN'} as Record<string,string>)[stage]??'FERTO';}
  private drawHud(time:number,stage:string){
    const c=this.hudCanvas,ctx=c.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='rgba(3,9,23,.90)';ctx.fillRect(22,18,1236,84);ctx.fillRect(22,614,1236,86);
    ctx.strokeStyle=colors.cyan;ctx.lineWidth=3;ctx.strokeRect(22,18,1236,84);ctx.strokeRect(22,614,1236,86);
    ctx.font='bold 31px monospace';ctx.fillStyle=colors.cyan;ctx.fillText('CHIMERA  //  FERTO',48,56);
    ctx.font='bold 16px monospace';ctx.fillStyle=colors.white;ctx.fillText('ONE PLAYER · ARCADE ANNOUNCER MODE',50,82);
    ctx.textAlign='right';ctx.font='bold 21px monospace';ctx.fillStyle=colors.gold;ctx.fillText(this.titleFor(stage),1228,58);
    const heartState=[...this.mapHearts()].filter(h=>h.time<=time).at(-1)?.hearts??0;
    const hx=1030,hy=77;for(let i=0;i<8;i++){
      const on=i<heartState;ctx.fillStyle=on?(i>5?colors.gold:colors.pink):'#344258';
      const x=hx+i*24;for(const [r,pattern]of ['0110110','1111111','1111111','0111110','0011100','0001000'].entries())for(let j=0;j<pattern.length;j++)if(pattern[j]==='1')ctx.fillRect(x+j*2,hy+r*2,2,2);
    }
    const cue=this.mapHooks().filter(h=>h.start<=time&&time<h.end).at(-1);
    ctx.textAlign='left';ctx.font='bold 23px monospace';ctx.fillStyle=cue?colors.white:colors.cyan;
    ctx.fillText(cue?.text??(time<6.9?'INSERT COIN · PRESS START':this.titleFor(stage)),48,667);
    ctx.textAlign='right';ctx.font='bold 17px monospace';ctx.fillStyle=colors.gold;ctx.fillText(`SCORE ${String(Math.floor(time*125)).padStart(6,'0')}`,1225,665);
    this.hudTexture.needsUpdate=true;
  }
  private mapHooks(){return [
    {start:61.24,end:62.96,text:'Φέρτο μου, φέρτο μου, φέρτο'},{start:62.96,end:64.68,text:'Φέρτο μου, φέρτο μου, φέρτο'},
    {start:64.68,end:66.4,text:'Φέρτο μου, φέρτο μου, φέρτο'},{start:66.56,end:67.82,text:'Σου είπα φέρτο'},
    {start:68,end:72.9,text:'Φέρτο μου, φέρτο μου, φέρτο'},{start:118.98,end:124.22,text:'Φέρτο μου, φέρτο μου, φέρτο'},
    {start:124.22,end:125.46,text:'Σου είπα φέρτο'},{start:125.46,end:130.5,text:'Φέρτο μου, φέρτο μου, φέρτο'},
    {start:173.6,end:179.2,text:'Φέρτο μου, φέρτο μου, φέρτο'},{start:179.98,end:184.9,text:'Φέρτο μου, φέρτο μου, φέρτο'},
    {start:185,end:186.22,text:'Σου είπα φέρτο'},
  ];}
  private mapHearts(){return [{time:16.8,hearts:7},{time:39.52,hearts:0},{time:42.04,hearts:2},{time:43.7,hearts:3},{time:45.72,hearts:4},{time:48.66,hearts:5},{time:50.58,hearts:6},{time:51.92,hearts:7},{time:80.22,hearts:8},{time:118.98,hearts:7},{time:130.5,hearts:3},{time:131.3,hearts:7},{time:173.6,hearts:8}];}

  resize(w:number,h:number){this.width=Math.max(1,w);this.height=Math.max(1,h);this.aspect=this.width/this.height;this.player.head.resize(this.width,this.height);this.props.resize(this.width,this.height);const z=480,visibleH=2*z*Math.tan(this.camera.fov*Math.PI/360);this.hud.position.set(0,0,-z);this.hud.scale.set(visibleH*this.aspect,visibleH,1);}
  frame(time:number,playing:boolean,epoch:number,view:CameraView,_intensity=0){
    const t=Math.max(0,time),stage=this.stageAt(t,view);for(const [k,g]of Object.entries(this.worlds))g.visible=k===stage;
    this.scene.background=new THREE.Color(stage==='moon'?'#090f2a':stage==='lava'?'#280d23':stage==='vienna'?'#353849':stage==='concert'?'#080b1b':stage==='end'?'#060a18':'#0a1831');
    (this.scene.fog as THREE.Fog).color.copy(this.scene.background);
    const run=Math.sin(t*7),hook=this.mapHooks().some(h=>t>=h.start&&t<h.end),close=view==='ferto-close';
    this.player.root.position.set(close?-24:-90+(Math.sin(t*.9)*11),142+(hook?Math.abs(run)*7:Math.sin(t*2)*3),75);
    this.player.root.rotation.set(0,Math.sin(t*.7)*.055,hook?Math.sin(t*5)*.035:Math.sin(t*1.8)*.018);
    const lift=hook?1.0:.55,arms:P[]=[];for(const s of [-1,1])arms.push([s*(25+lift*11),-37+lift*28,8],[s*(28+lift*32),-52+lift*56,16+Math.sin(t*5+s)*5]);
    this.player.pose(t,arms as [P,P,P,P]);
    for(const [i,m]of this.coins.entries())m.rotation.y=t*2+i;
    for(const [i,e]of this.enemies.entries())e.group.position.y=e.baseY+Math.sin(t*3+i)*7;
    const focus:THREE.Vector3=close?new THREE.Vector3(-24,142,70):new THREE.Vector3(-8,145,-30);
    const distance=close?390:(this.aspect<1?570:650);this.camera.aspect=this.aspect;
    this.camera.position.set(focus.x+(close?0:36),focus.y+(close?30:208),focus.z+distance);this.camera.lookAt(focus);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    const reset=epoch!==this.epoch||!Number.isFinite(this.last)||Math.abs(t-this.last)>.24;
    this.scene.updateMatrixWorld(true);this.player.update(t,playing,this.camera,reset?0:Math.min(.05,Math.max(0,t-this.last)),reset);
    this.epoch=epoch;this.last=t;this.drawHud(t,stage);
  }
  dispose(){this.player.dispose();this.props.dispose();this.hudTexture.dispose();(this.hud.material as THREE.Material).dispose();}
}
function hFor(_w:number,_d:number){return 9;}
