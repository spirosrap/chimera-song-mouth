import * as THREE from 'three';
import type { SevenVideoSetting, SevenVideoView } from '../../scene/seven-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

type Scenery = { root: THREE.Group; background: string; features: THREE.Object3D[] };
export const SEVEN_VIDEO_WARDROBE = {
  rinaxs: { jackets: ['#e2aa30', '#6e3534', '#e2ddcf', '#5d6b7c'], hair: ['#362b28', '#c3a573', '#613c2f'] },
  magimage: { jackets: ['#2747a2', '#b8295e', '#ebc0b3', '#c5a444'], hair: ['#352131', '#a92351', '#b28075'] },
  modelcinderella: { jackets: ['#184aa3', '#242333', '#433b4b', '#4b5562'], hair: ['#4b312b', '#45352c', '#a08364'] },
  wolfbloom: { jackets: ['#27222a', '#40637e', '#85534b', '#c7b9a5', '#485c4f'], hair: ['#382523', '#d1ac67', '#6c422f'] },
  geesetaxes: { jackets: ['#302527', '#75483f', '#29464b', '#63564a'], hair: ['#685041', '#351f1b', '#ab8864'] },
  gecsdoritos: { jackets: ['#4e3691', '#d0a12b', '#354f57'], hair: ['#e8c887', '#4b3427'] },
  confholiday: { jackets: ['#c0d0b0', '#dedcd1', '#22252c', '#3d3540'], hair: ['#694430', '#d5b28a'] },
};
export const SEVEN_VIDEO_FIGURES: Record<SevenVideoSetting, number> = {
  rinaxs: 4, magimage: 4, modelcinderella: 5, wolfbloom: 7, geesetaxes: 6, gecsdoritos: 3, confholiday: 4,
};

export function buildSevenVideoSet(p: VideoProps, setting: SevenVideoSetting, view: SevenVideoView): Scenery {
  const root = new THREE.Group();
  const features: THREE.Object3D[] = [];
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    p.box(root, w, h, d, c, [x,y,z]);
  const oval = (c: string, x: number, y: number, z: number, a: number, b: number, d: number) =>
    p.oval(root,[x,y,z],[a,b,d],c);
  const rod = (c: string, a: VideoPoint, b: VideoPoint, r = 1.5) => p.tube(root, a, b, r, c);
  const ground = (c: string) => box(1600, 2, 1500, c, 0, -2, -270);
  const wall = (c: string) => box(1400, 520, 2, c, 0, 245, -282);
  const bulb = (x: number, y: number, z: number, c: string, radius = 6) => {
    oval('#242632',x,y,z-3,radius+2,radius+2,4);
    features.push(oval(c,x,y,z,radius,radius,3));
  };
  const panel = (x: number, y: number, z: number, w: number, h: number, face: string, frame = '#3b2a30') => {
    box(w+9,h+9,8,frame,x,y,z);
    box(w,h,1,face,x,y,z+4.5);
  };
  const star = (x: number, y: number, z: number, r: number, c: string) => {
    const shape = new THREE.Shape();
    for (let i=0;i<10;i++) {
      const a=i*Math.PI/5 + Math.PI/2, radius=r*(i%2 ? .43 : 1);
      const point: [number,number] = [Math.cos(a)*radius, Math.sin(a)*radius];
      if(i)shape.lineTo(...point); else shape.moveTo(...point);
    }
    shape.closePath();
    return p.mesh(root,new THREE.ShapeGeometry(shape),[x,y,z],c);
  };
  const bars = (x: number, y: number, z: number, w: number, palette: readonly string[]) => {
    for (const [i,c] of palette.entries()) box(w/palette.length,30,2,c,x-w/2+w*(i+.5)/palette.length,y,z);
  };
  const crate = (x: number, y: number, z: number, w: number, h: number, c: string) => {
    box(w,h,w*.64,c,x,y,z);
    box(w*.19,.7,w*.65,'#c3a477',x,y+h/2,z);
    box(w*.25,h*.26,1.2,'#d6bc91',x,y,z+w*.33);
  };
  const mic = (x: number, z: number, c: string) => {
    rod('#6b6269',[x,0,z],[x,126,z],1.45);
    rod('#8b8182',[x,126,z],[x+10,147,z],1.7);
    oval(c,x+12,149,z,6,3.5,4);
  };
  const backlight = (x: number, y: number, z: number, c: string, size: number) => {
    oval(c,x,y,z,size,size*.68,1.1);
    oval('#fff1d3',x,y,z+1,size*.58,size*.44,1.1);
  };
  const landscape = (palette: readonly string[]) => {
    wall(palette[0]);ground(palette[1]);
    for (let i=0;i<12;i++) oval(palette[2+i%2],(i-5.5)*83,17+i%3*3,-245,93,28+i%4*7,23);
  };

  let background: string;
  if (setting==='rinaxs') {
    const factory=view.startsWith('xs-factory');
    const parcels=view==='xs-parcels'||view==='xs-end';
    const sales=view.startsWith('xs-sales')||view==='xs-broadcast';
    background=factory?'#0d2729':parcels?'#544230':'#4e322a';
    ground(factory?'#173a38':parcels?'#554538':'#854337');wall(sales?'#49858c':background);
    if(factory) {
      for(let i=0;i<10;i++) {
        const x=(i-4.5)*42;
        rod('#51665c',[x,0,-174],[x,225,-174],6.3);
        oval(i%2?'#a36c32':'#326157',x,99,-150,16,58,12);
        bulb(x,190,-145,'#7eb889',4);
      }
      backlight(-113,160,-230,'#3e8069',67);
    } else if(parcels) {
      for(let i=0;i<24;i++) crate((i%7-3)*42,16+Math.floor(i/7)*28,-150+(i%4)*7,31+i%3*7,27,i%2?'#ac855a':'#7d5c3e');
      panel(109,173,-224,82,93,'#97aea5');
    } else {
      for(let i=0;i<17;i++) box(29,246,4,i%2?'#754629':'#633c28',(i-8)*34,111,-228);
      if(sales) {
        panel(0,153,-205,260,125,'#6ea2a4','#c3a560');
        box(218,39,52,'#9f704f',0,32,70);
        for(const x of [-86,-61,55,85]) {
          rod('#d6b365',[x,51,63],[x,74,63],4);
          box(8,5,7,'#ead2a3',x,75,63);
        }
      }
      for (const x of [-155,155]) bulb(x,186,-200,'#ffcd79',10);
    }
  } else if(setting==='magimage') {
    const clinic=/clinic|telephone|television/.test(view), runway=view.includes('runway');
    background=clinic?'#eae9ed':runway?'#1792ac':view==='image-cosmos'?'#4d2669':'#100e24';
    wall(background);ground(clinic?'#dbdce4':runway?'#e5cdbe':'#19192b');
    if(clinic){
      panel(70,105,-186,65,177,'#c22a48','#8e253e');
      oval('#eac9a7',94,104,-177,4,4,2);
      for(const x of [-126,-64,121]) {
        box(39,4,35,'#597182',x,46,-142);box(37,34,4,'#7b9aa8',x,62,-158);
        rod('#575866',[x-13,0,-142],[x-13,46,-142]);rod('#575866',[x+13,0,-142],[x+13,46,-142]);
      }
      panel(-92,124,-112,65,47,'#394893','#76574b');
      star(-93,124,-106,15,'#f04a52');
      box(42,6,32,'#76574b',-91,94,-111);
    }else if(runway){
      box(125,4,370,'#f1dfd2',0,0,-56);
      for(const x of [-110,110])for(let j=0;j<5;j++) {
        const leaf=oval('#376e65',x+j*3-7,49+j*8,-155,3.5,15,3);
        leaf.rotation.z=(j-2)*.35;
      }
    }else{
      const furnace=view==='image-furnace';
      for(let i=0;i<9;i++)for(let j=0;j<10;j++)box(43,1,41,(i+j)%2?'#222137':'#e5dad8',(i-4)*43,-.5,-245+j*41);
      features.push(star(35,146,-173,77,furnace?'#ea672a':'#e93645'));
      for(let i=0;i<12;i++) {
        const a=i*.64;
        oval(['#e765aa','#6356de','#28bccb','#e19542'][i%4],Math.cos(a)*(71+i*8),126+Math.sin(a)*75,-204,8+i%5,8+i%5,2);
        if(furnace)features.push(oval(i%2?'#e7722e':'#f2b146',(i-5.5)*25,26+i%3*6,-101,9,20+i%4*8,4));
      }
    }
  } else if(setting==='modelcinderella') {
    const club=/club|dj|cake/.test(view), street=/street|passage/.test(view), book=/book|end/.test(view);
    background=club?'#151533':street?'#353b3e':book?'#3a3029':'#2b3c3b';
    wall(background);ground(club?'#27263d':street?'#61605b':'#544235');
    if(club){
      for(const x of [-128,108]) {
        panel(x,101,-138,51,130,'#372730','#7a5a42');
        for(const y of [64,102,139]) {oval('#171522',x,y,-126,19,19,5);oval('#5f5467',x,y,-120,7,7,2);}
      }
      for(let j=0;j<10;j++)bulb((j-4.5)*24,200,-193,j%3?'#488fd9':'#eb9851');
      if(view==='cindy-cake'){
        box(160,9,76,'#5c3c53',0,43,57);
        oval('#c7919d',0,54,57,29,9,17);
        for(let i=0;i<11;i++){rod('#ede3d1',[(i-5)*4.5,60,58],[(i-5)*4.5,69,58],.6);bulb((i-5)*4.5,72,58,'#ffc769',1.6);}
      }
    }else if(street){
      for(let i=0;i<9;i++){
        const x=(i-4)*65;
        box(57,238,7,i%2?'#67524e':'#494d52',x,113,-216);
        panel(x,151,-208,31,36,'#8e9393');panel(x,64,-208,26,76,'#4b4343');
      }
    }else if(book){
      const cover=box(80,102,11,'#17666a',0,91,-28);cover.rotation.z=-.15;
      star(0,101,-20,23,'#ead087');
      for(let i=0;i<16;i++)crate((i%6-2.5)*51,12+i%3*5,-115-i%4*14,31,18,'#705a40');
    }else{
      panel(-96,120,-175,107,105,'#778682');panel(101,112,-174,64,76,'#465759');
      for(const x of [-89,79]) {
        oval('#89524b',x,57,-76,17,29,15);oval('#a97466',x,80,-64,11,12,9);
        oval('#af796d',x-7,90,-65,5,6,4);oval('#af796d',x+7,90,-65,5,6,4);
      }
    }
  } else if(setting==='wolfbloom') {
    const red=view.includes('red'), amber=view.includes('amber'), dance=/dance|ensemble/.test(view);
    background=red?'#9d2626':amber?'#d79835':'#526269';
    ground(red?'#3f252c':'#45474e');wall(background);
    for(let i=0;i<13;i++) {
      const x=(i-6)*34;
      rod('#323845',[x,210,-198],[x,234,-198],1.1);
      bulb(x,214,-183,red?'#e05948':amber?'#f5bc66':'#d5dedc',6);
    }
    if(dance||red) {
      for(let i=0;i<7;i++)box(435,1.2,2,i%2?'#a3a8a4':'#696c72',0,0,-158+i*42);
      if(view.includes('backlit'))backlight(4,116,-196,'#c1c9c9',105);
    }else{
      for(const x of [-107,112]){
        box(41,46,10,'#242832',x,25,-78);
        oval('#343748',x,25,-70,15,16,2);
      }
      oval('#383b47',-104,45,-101,36,29,15);
      mic(-43,39,'#b7c1c5');
    }
  } else if(setting==='geesetaxes') {
    const band=/band|mic/.test(view);
    background=band?'#3a2e2d':'#161e22';ground(band?'#514344':'#27292f');wall(background);
    for(let row=0;row<11;row++)for(let j=0;j<15;j++)box(30,12,3,(j+row)%3?'#513e3a':'#694a41',(j-7)*32+row%2*16,10+row*14,-208);
    backlight(band?67:-54,173,-187,band?'#be9363':'#71949e',51);
    if(band){mic(-25,45,'#b2a697');panel(121,37,-81,47,49,'#33363d');}
    else for(let j=0;j<10;j++) oval(j%2?'#263b42':'#36333a',(j-4.5)*28,85+j%3*10,-78-j%4*10,14,39,13);
    if(view==='taxes-door')panel(0,103,-112,79,171,'#5e7f84','#624a39');
  } else if(setting==='gecsdoritos') {
    const prism=view.includes('prism')||view==='doritos-end';
    background=prism?'#39235b':'#90b9cb';
    if(prism){
      ground('#27455c');wall(background);
      for(let i=0;i<32;i++)box(12,202,3,['#7555a7','#269ea1','#bc528d','#df8a66','#283977'][i%5],(i-15.5)*15,112,-166);
      for(let i=0;i<6;i++)features.push(star((i-2.5)*68,158-i%2*70,-122,16+i%3*5,'#e4c447'));
    }else{
      landscape(['#8eb7cf','#a88b58','#586e70','#718387']);
      for(let i=0;i<16;i++)oval(i%2?'#68784d':'#7c8457',(i-7.5)*30,3,-95-i%4*14,18,8,13);
      if(view==='doritos-telescope'){
        const sight=p.ink(root);sight.begin();p.ring(sight,[0,130,-87],[85,0,0],[0,85,0],'#30344c',1.6);
        p.line(sight,[[-84,130,-87],[84,130,-87]],'#30344c');p.line(sight,[[0,47,-87],[0,213,-87]],'#30344c');sight.end();
      }
      if(view==='doritos-news'){bars(0,30,70,252,['#ac2e30','#ea5244','#f7cc6f','#315f93','#367d9c']);panel(-116,168,-86,59,35,'#a6334e');}
    }
  } else {
    const balloon=/balloon|basket/.test(view), twilight=/night|salt-flat|twilight|end/.test(view);
    background=twilight?'#192c45':'#6fa9b9';
    landscape(twilight?['#243654','#52536b','#3b3b50','#3f4a58']:['#72b8c4','#b7ba9a','#797b80','#8a9188']);
    if(balloon){
      if(view==='holiday-basket'){
        for(const x of [-75,75])rod('#884e3e',[x,42,31],[x*.64,225,-12],5);
        box(180,53,70,'#9e6e52',0,35,29);
        for(let i=0;i<15;i++)box(2,51,1,i%2?'#c79b69':'#8d5945',(i-7)*12,35,65);
      }
      for(let j=0;j<5;j++)for(let i=0;i<14;i++) {
        const arc=(i-6.5)*.183;
        const x=Math.sin(arc)*(166-j*19), y=125+j*28+10*Math.cos(arc);
        const tile=box(29-j*1.85,31,4,(i+j)%2?'#ddc64b':'#60a9a0',x,y,-172+Math.cos(arc)*32);
        tile.rotation.z=-arc*.72;
      }
      backlight(0,243,-165,'#ebc454',26);
    }else if(twilight){
      box(810,17,2,'#a76650',0,40,-278);
      for(const x of [-120,83])bulb(x,69,-199,view==='holiday-night'?'#e9524c':'#6f92c4',8);
      if(view==='holiday-night')backlight(-91,129,-198,'#9b4143',79);
    }
  }
  return {root, background, features};
}
