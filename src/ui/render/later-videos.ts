import * as THREE from 'three';
import type { LaterVideoSetting, LaterVideoView } from '../../scene/later-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const LATER_VIDEO_WARDROBE = {
  amylshouldnot: { jackets:['#63bbba','#d0a72b','#263849','#988267'], hair:['#e7cf96','#967b5d'] },
  digitalwitness: { jackets:['#377e6c','#309083','#c9a24d','#508285'], hair:['#d3d3c4','#263c3e'] },
  yardhits: { jackets:['#ad9c78','#4d8691','#b69b4d','#668b72'], hair:['#b78a6c','#31252d'] },
  jungle74: { jackets:['#888451','#b17d55','#775f59','#ac9b80','#514841'], hair:['#443430','#704b38','#3c2c2b'] },
  tightrope: { jackets:['#282936','#292c35','#4f424c','#676061'], hair:['#37262c','#3b3034'] },
  fervkandy: { jackets:['#72585b','#5c7c76','#7d6b50','#43434d'], hair:['#c5ae86','#4a362e','#b57261'] },
  animalflow: { jackets:['#e2dac8','#292626','#483938','#413649'], hair:['#352820','#816955'] },
};
export const LATER_VIDEO_FIGURES: Record<LaterVideoSetting,number> = {
  amylshouldnot:2, digitalwitness:7, yardhits:5, jungle74:7, tightrope:6, fervkandy:4, animalflow:5,
};

/** Keep scenery and practical lights behind the tracked performers. */
export function buildLaterVideoSet(p:VideoProps, setting:LaterVideoSetting, view:LaterVideoView) {
  const root=new THREE.Group();
  const features:THREE.Object3D[]=[];
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>p.box(root,w,h,d,c,[x,y,z]);
  const oval=(c:string,x:number,y:number,z:number,a:number,b:number,d:number)=>p.oval(root,[x,y,z],[a,b,d],c);
  const rod=(c:string,a:VideoPoint,b:VideoPoint,r=1.2)=>p.tube(root,a,b,r,c);
  const wall=(c:string)=>box(1120,450,3,c,0,210,-274);
  const floor=(c:string)=>box(1460,1.5,1130,c,0,-1,-330);
  const frame=(x:number,y:number,z:number,w:number,h:number,outer:string,inner:string)=>{
    box(w+8,h+8,6,outer,x,y,z);
    box(w,h,1.2,inner,x,y,z+3.4);
  };
  const lamp=(x:number,y:number,z:number,c:string,r=5)=>{
    oval('#292632',x,y,z-3,r*1.28,r*1.28,4);
    features.push(oval(c,x,y,z,r,r,3));
  };
  const railing=(c:string,z:number,low:number)=>{
    for(let i=0;i<14;i++)rod(c,[(i-6.5)*34,low,z],[(i-6.5)*34,low+78,z],.9);
    for(const y of [low,low+39,low+78])rod(c,[-250,y,z],[250,y,z],1.4);
  };
  const couch=(c:string,x:number,z:number)=>{
    box(105,30,38,c,x,24,z);
    box(99,38,7,c,x,51,z-14);
    box(9,24,36,c,x-55,36,z);box(9,24,36,c,x+55,36,z);
  };
  const columns=(colors:readonly string[],y=124,z=-235)=>{
    for(let i=0;i<15;i++)box(27,238,7,colors[i%colors.length],(i-7)*36,y,z);
  };
  const lowLights=(colors:readonly string[],y=184,z=-169)=>{
    for(let i=0;i<9;i++)lamp((i-4)*43,y+i%2*11,z,colors[i%colors.length],6);
  };
  let background:string;

  if(setting==='amylshouldnot'){
    const pool=/pool|sunset/.test(view);
    const runway=/runway|finale/.test(view);
    const bar=view.includes('bar');
    background=pool?'#b37d55':runway?'#237672':bar?'#251b2c':'#202d43';
    wall(background);
    floor(pool?'#c6aa78':runway?'#405b62':bar?'#3d2634':'#40526a');
    if(pool){
      oval('#547f7c',0,5,-76,201,4,152);
      oval('#d2c197',0,6,-73,180,3.3,132);
      for(const x of [-138,145]){
        rod('#685044',[x,0,-168],[x,118,-171],2.8);
        for(let j=0;j<8;j++){
          const leaf=oval('#4a684d',x+Math.cos(j*.9)*12,108+j%3*9,-172,18,3,4);
          leaf.rotation.z=j*.7;
        }
      }
    }else if(runway){
      box(90,1.2,340,'#6e817d',23,0,-49);
      railing('#386669',-140,4);
      for(let j=0;j<12;j++)box(24,1,7,'#b3c295',(j-5.5)*31,1,-19);
    }else if(bar){
      columns(['#483144','#4a2938','#392530']);lowLights(['#bd4054','#d77766','#685181']);
      box(410,22,22,'#75504c',0,34,-94);
      for(let j=0;j<13;j++)box(5+j%2,16+j%4*2,6,'#936272',(j-6)*24,54,-89);
    }else{
      for(let i=0;i<7;i++)frame((i-3)*69,107,-146,58,118,'#5f657c',i%2?'#98b8ca':'#648ea8');
      box(540,8,5,'#ad668c',0,189,-139);box(540,6,5,'#7799ab',0,207,-140);
      for(const x of [-133,113]){
        oval('#303841',x,25,-68,48,18,23);
        box(51,9,25,'#7999aa',x+6,39,-73);
        oval('#d1cb9c',x+39,29,-49,7,3,4);
      }
      lowLights(['#74a2c5','#ca7da6','#e0ba79'],164,-123);
    }
  }else if(setting==='digitalwitness'){
    const outdoor=/plaza|line|wheels/.test(view),yellow=view.includes('yellow');
    const dusk=view.includes('dusk')||view.endsWith('finale');
    background=yellow?'#a3953b':dusk?'#3f535b':outdoor?'#7faba2':'#426e61';
    wall(background);
    floor(outdoor?'#91928a':'#718679');
    if(outdoor){
      box(142,143,63,'#b1974f',-95,71,-175);
      box(142,71,60,'#455d65',-95,163,-175);
      box(154,183,58,'#908e7b',105,90,-218);
      for(let j=0;j<11;j++)box(144,2,2,j%2?'#a6a592':'#646d6b',105,17+j*15,-186);
      if(view.includes('wheels'))for(const x of [-128,127])oval('#c3a54b',x,31,-52,31,31,7);
    }else{
      frame(0,126,-176,126,171,yellow?'#b5a650':'#6b9581',yellow?'#938536':'#587e74');
      for(let j=0;j<9;j++)box(2,74,1,yellow?'#ded3a3':'#9ab6a6',72+j*6,147,-165);
      if(/desks|conference/.test(view)){
        box(166,14,91,'#84a69a',0,64,17);
        for(let j=0;j<5;j++)box(21,1.1,16,'#9bc4b4',(j-2)*30,71.5,30);
      }
    }
  }else if(setting==='yardhits'){
    const lounge=view.includes('lounge'),neon=/neon|stage/.test(view),stairs=view.includes('stairwell');
    background=lounge?'#765347':neon?'#2e2a4a':stairs?'#584333':'#525f60';
    wall(background);floor(lounge?'#6a4f48':neon?'#343044':'#696c66');
    if(lounge){
      couch('#8b6255',0,-107);
      for(const [i,x] of [-122,-42,57,138].entries())frame(x,147+i%3*17,-175,28+i%2*7,43,'#61483a','#b59868');
      rod('#886b47',[-128,0,-106],[-128,145,-106],2);
      oval('#e0b363',-128,151,-105,16,10,10);
    }else if(neon){
      columns(['#46455f','#50344f','#355a61']);lowLights(['#dc6cac','#68c9c9','#b39be1'],208,-132);
      for(let i=0;i<7;i++)box(439,1.1,1,'#7a586f',0,-.4,-177+i*43);
    }else if(stairs){
      for(let i=0;i<10;i++)box(133,11,19,'#9d8062',80,7+i*11,-67-i*14);
      lamp(83,185,-163,'#f4c180',11);
    }else{
      for(let j=0;j<11;j++)for(let i=0;i<13;i++)box(30,11,2,(i+j)%3?'#655958':'#775e54',(i-6)*33+j%2*15,9+j*13,-197);
      railing('#536261',-161,7);
      box(60,28,18,'#32383e',-84,41,-69);
      for(const x of [-103,-66])oval('#6f7580',x,41,-59,8,8,2);
    }
  }else if(setting==='jungle74'){
    const control=/control|finale/.test(view);
    const city=view.includes('city'),palace=view.includes('palace');
    background=control?'#302a34':city?'#625f5a':'#755443';wall(background);floor('#886749');
    for(let j=0;j<9;j++)box(510,.65,1,'#685044',0,0,-181+j*40);
    if(control){
      for(let j=0;j<10;j++)frame((j%5-2)*51,137+Math.floor(j/5)*41,-131,39,28,'#50495b',j%3?'#a4b8b2':'#85a9b9');
      box(278,24,57,'#4b424d',0,31,-89);
    }else if(city){
      for(let i=0;i<7;i++){
        const x=(i-3)*67;
        box(62,177,5,i%2?'#817663':'#69716c',x,87,-214);
        for(const y of [66,102,140])frame(x,y,-206,26,25,'#6f6860','#8b9185');
      }
      lowLights(['#d3b180','#9ca28c'],177,-158);
    }else{
      for(let j=0;j<18;j++)box(2,220,2,j%2?'#9b7961':'#6e4e42',(j-8.5)*28,117,-215);
      for(const x of [-141,0,141])frame(x,140,-181,55,98,'#605042',palace?'#a36158':'#aa8c62');
      lowLights(['#ccab74','#e0b57b','#b99467'],208,-153);
    }
  }else if(setting==='tightrope'){
    const corridor=/corridor|entry/.test(view),steps=view.includes('steps');
    background=corridor?'#766f65':'#676150';wall(background);floor('#898476');
    for(let i=0;i<17;i++){
      const x=(i-8)*28;
      box(2,118,3,'#8d8879',x,56,-183);
      box(27,3,3,'#b4a990',x,124,-183);
    }
    for(const x of [-117,116])frame(x,105,-155,65,166,'#5b5148','#8b8070');
    if(steps)for(let i=0;i<6;i++)box(235,8,27,'#a59b86',0,8+i*7,-89-i*15);
    else if(view==='rope-room'){
      box(95,21,57,'#afab9b',105,27,-85);
      railing('#59534d',-112,6);
      frame(-105,132,-153,54,73,'#7c7166','#b7ac93');
    }else{
      for(let j=0;j<7;j++)box(480,1,2,j%2?'#aaa18d':'#827f73',0,0,-171+j*44);
      for(const x of [-106,114])lamp(x,178,-147,'#e0cda8',8);
    }
  }else if(setting==='fervkandy'){
    const blue=/blue|pink/.test(view),chair=view.includes('chair'),jukebox=view.includes('jukebox');
    background=blue?'#263c53':chair?'#3d574f':'#3d2934';
    wall(background);floor(blue?'#48576c':chair?'#536050':'#49343e');
    columns(blue?['#35516b','#36516e','#2a405a']:chair?['#40685c','#31554e','#4b6b5f']:['#583237','#502b36','#6e3a45'],125,-206);
    if(jukebox){
      oval('#c2714b',0,102,-113,40,62,8);
      oval('#734953',0,108,-101,28,51,4);
      frame(0,98,-94,42,53,'#ad5a45','#723946');
      for(const x of [-26,26])for(let j=0;j<6;j++)lamp(x,64+j*15,-90,'#eb9c5c',2.4);
    }else if(chair){
      couch('#5e8062',0,-101);
      lamp(-96,171,-118,'#b8ca88',9);
    }else{
      for(const x of [-133,115])lamp(x,189,-137,blue?'#a1d0e5':'#ed7158',9);
      rod('#68636b',[-38,2,23],[-38,130,23],1.5);
      oval('#a2a1a4',-32,138,22,5,3,3);
    }
  }else{
    const stairwell=/entry|masks/.test(view);
    const finale=view.endsWith('finale');
    background=stairwell?'#555752':finale?'#2c5150':'#3c343b';
    wall(background);floor(stairwell?'#53534d':finale?'#263d3f':'#53464a');
    for(let i=0;i<12;i++)box(3,168,8,'#5b4a45',(i-5.5)*37,90,-187);
    if(stairwell){
      frame(102,108,-146,77,177,'#844240','#702f30');
      for(let i=0;i<8;i++)box(142,10,20,'#727571',-104,8+i*8,-48-i*13);
      railing('#795b49',-132,45);
    }else if(finale){
      for(const x of [-126,117]){
        rod('#3a524b',[x,0,-101],[x+18,141,-113],2.1);
        for(let j=0;j<8;j++){
          const leaf=oval('#3a6860',x+(j%2?1:-1)*18,37+j*16,-110,20,4,5);
          leaf.rotation.z=(j%2?1:-1)*.4;
        }
      }
    }else{
      box(255,16,59,'#59434c',0,52,27);
      for(let j=0;j<7;j++){
        const x=(j-3)*31;
        oval('#b6a88e',x,61,36,10,2,9);
        rod('#b99367',[x,62,14],[x,79,14],1.0);
        lamp(x,81,14,'#e6b975',2.2);
      }
      for(const x of [-103,105])frame(x,154,-160,48,79,'#705747','#6c5365');
    }
  }
  return {root,background,features};
}
