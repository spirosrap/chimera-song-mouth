import * as THREE from 'three';
import { isEncore, type EncoreView } from '../../scene/encore-videos.ts';
import { buildEncoreSet, ENCORE_FIGURES, ENCORE_WARDROBE } from './encore-videos.ts';
import type { ShowcaseSetting, ShowcaseView } from '../../scene/showcase-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const SHOWCASE_WARDROBE = {
  ...ENCORE_WARDROBE,
  mitskinobody:{jackets:['#354667','#af4a50','#437181','#637a52'],hair:['#30262b','#493738']},
  letforeverbe:{jackets:['#ca5254','#e2b688','#ae4447','#e7c5aa'],hair:['#614636','#d1a163']},
  tilteddance:{jackets:['#282c37','#2e343c','#393a47','#2f313a'],hair:['#52433a','#2d2327']},
  welcometoisland:{jackets:['#56798c','#873527','#c98451'],hair:['#393337','#69483e']},
  lifeitself:{jackets:['#91714e','#a36058','#565e5d','#856b69'],hair:['#3e3331','#503c34']},
  robynfriend:{jackets:['#5c86a1'],hair:['#e6ce9f']},
  idlesdancer:{jackets:['#b9b6a5','#445e5a','#7e665a','#53494b','#365556'],hair:['#4a3730','#443544']},
  kimbrasettle:{jackets:['#292531','#90aab2','#b49ca4'],hair:['#36262c','#634935']},
  tuneyardswater:{jackets:['#86679b','#cf805e','#62a192','#7386a7','#9c925e'],hair:['#574238','#473344']},
  metrolook:{jackets:['#857d6a','#908a79','#a7a08b','#696b5c'],hair:['#62493b','#584738']},
  jainmakeba:{jackets:['#383941','#b09b5d','#548475','#896e5b'],hair:['#433332','#372e33']},
  jbreakfastsweet:{jackets:['#8d4e60','#736478','#a7846b'],hair:['#32313a','#5e4b3b']},
  chvrchesmother:{jackets:['#665772','#42475a','#4f5d75'],hair:['#3d282c','#514438']},
  altjtessellate:{jackets:['#615c54','#8e5655','#4c6272','#877256','#725d6b'],hair:['#453935','#3a343d']},
};
export const SHOWCASE_FIGURES:Record<ShowcaseSetting,number> = {
  ...ENCORE_FIGURES,
  mitskinobody:4, letforeverbe:7, tilteddance:4, welcometoisland:3, lifeitself:4, robynfriend:1, idlesdancer:5,
  kimbrasettle:3, tuneyardswater:5, metrolook:4, jainmakeba:5, jbreakfastsweet:2, chvrchesmother:3, altjtessellate:6,
};

export function buildShowcaseSet(p:VideoProps, setting:ShowcaseSetting, view:ShowcaseView) {
  if (isEncore(setting)) return buildEncoreSet(p, setting, view as EncoreView);
  const root=new THREE.Group();
  const features:THREE.Object3D[]=[];
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>p.box(root,w,h,d,c,[x,y,z]);
  const oval=(c:string,x:number,y:number,z:number,a:number,b:number,d:number)=>p.oval(root,[x,y,z],[a,b,d],c);
  const beam=(c:string,a:VideoPoint,b:VideoPoint,r=1.1)=>p.tube(root,a,b,r,c);
  const wall=(c:string)=>box(1100,480,4,c,0,230,-264);
  const floor=(c:string)=>box(1420,1.5,1030,c,0,-1,-320);
  const panel=(x:number,y:number,z:number,w:number,h:number,c:string,inner:string)=>{
    box(w+7,h+7,4,c,x,y,z);
    box(w,h,1.2,inner,x,y,z+2.6);
  };
  const light=(c:string,x:number,y:number,z:number,r=5)=>{
    oval('#403842',x,y,z-3,r*1.3,r*1.3,4);
    features.push(oval(c,x,y,z,r,r,3));
  };
  const floorLines=(c:string,span=420)=>{
    for(let i=0;i<8;i++)box(span,.5,1.1,c,0,.1,-200+i*48);
  };
  const stageLights=(a:string,b:string)=>{
    for(let i=0;i<7;i++)light(i%2?a:b,(i-3)*53,190+i%2*10,-148,5.4);
  };
  let bg:string;

  if(setting==='mitskinobody'){
    const studio=/studio|finale/.test(view), hands=view.includes('hands');
    const pink=/colored|mask|table/.test(view);
    bg=studio?'#c6a855':hands?'#b89b55':pink?'#76505e':'#c8a447';
    wall(bg);floor(studio?'#84735e':pink?'#695966':'#937446');
    if(studio){
      for(const x of [-155,143]){
        beam('#39413f',[x,0,-91],[x,174,-91],2.1);
        panel(x,181,-91,33,24,'#535861','#e2d4af');
        for(const d of [-1,1])beam('#495457',[x,46,-91],[x+d*29,2,-61],1.15);
      }
      panel(0,116,-178,174,162,'#647580','#6b9699');
      for(let i=0;i<7;i++)box(25,5,2,i%2?'#c2b287':'#a36861',(i-3)*32,21,-149);
    }else if(hands){
      for(const [j,x] of [-150,-83,82,151].entries()){
        const tone=['#da9d97','#7cabae','#deb874','#ba6f6b'][j];
        oval(tone,x,67,-101,23,33,10);
        for(let i=0;i<5;i++){
          const finger=oval(tone,x+(i-2)*9,109+i%2*6,-100,5.3,20+i%2*3,4.4);
          finger.rotation.z=(2-i)*.13;
        }
      }
      panel(0,126,-180,90,140,'#55867d','#b6a671');
    }else{
      panel(95,140,-123,63,90,pink?'#b6838f':'#938455',pink?'#c3a2a1':'#f0d885');
      box(94,17,53,pink?'#bd8181':'#9b6464',-101,23,-73);
      box(88,7,50,'#cec1a1',-101,36,-73);
      box(24,8,27,'#f0d2b0',-126,42,-79);
      for(let i=0;i<10;i++)box(2,204,2,i%2?'#c3a561':'#ad8c52',(i-4.5)*49,110,-195);
    }
  }else if(setting==='letforeverbe'){
    const home=/bedroom|clock/.test(view), escalator=view.includes('escalator'), red=/red|finale/.test(view);
    bg=home?'#917b6d':escalator?'#617477':red?'#843d50':'#66516d';
    wall(bg);floor(home?'#7b6258':escalator?'#536971':'#755260');
    if(home){
      box(104,26,65,'#915e62',-84,24,-66);
      box(97,9,64,'#d0a38b',-84,43,-66);
      box(30,12,25,'#e1bfaa',-110,50,-79);
      box(57,47,30,'#6e564f',94,24,-86);
      panel(94,58,-84,27,14,'#4f4044','#875d51');
      for(const x of [87,94,101])box(4,8,1,'#ffa46f',x,57,-80);
    }else if(escalator){
      for(let i=0;i<12;i++)box(101,11,17,i%2?'#81918f':'#6b7b79',38,5+i*10,-48-i*12);
      for(const x of [-15,91]){
        beam('#a0ad9d',[x,43,-46],[x,160,-186],2.6);
        for(let j=0;j<7;j++)beam('#596f78',[x,10+j*17,-47-j*23],[x,43+j*17,-47-j*23],.85);
      }
      panel(-119,139,-187,42,76,'#a79178','#b18674');
    }else{
      for(let i=0;i<14;i++){
        const angle=i*Math.PI/7;
        const a=22+8*(i%2), c=i%2?'#d28c85':'#beafba';
        beam(c,[Math.cos(angle)*a,128+Math.sin(angle)*a,-156],[Math.cos(angle)*230,128+Math.sin(angle)*155,-156],1.25);
        const facet=oval(i%2?'#9e596b':'#a786a0',Math.cos(angle)*119,128+Math.sin(angle)*85,-164,24,8,2);
        facet.rotation.z=angle;
      }
      stageLights('#e1a071','#d9a9af');
      floorLines('#936477');
    }
  }else if(setting==='tilteddance'){
    const low=/floor|finale/.test(view);
    bg=low?'#2345a0':'#1b3a88';
    wall(bg);floor(low?'#304c91':'#2d4880');
    box(427,5,197,'#1c2f55',0,1.7,-51);
    for(let i=0;i<9;i++){
      const x=(i-4)*42;
      box(2,201,4,i%2?'#7591a8':'#5d7890',x,109,-166);
      light(i%2?'#e6eded':'#bdd4e2',x,194,-154,4.4);
      box(3,1.2,54,'#91aebf',x,.5,-41);
    }
    for(let i=0;i<5;i++)box(382,1.15,1.12,'#7393b0',0,.5,-193+i*51);
    for(const x of [-133,133])beam('#a0c2d7',[x,194,-151],[x*1.36,13,-151],1.6);
  }else if(setting==='welcometoisland'){
    const lava=/lava|finale/.test(view), carton=view.includes('box'), passage=view.includes('passage');
    const coast=view.includes('coast'), shop=view.includes('shop');
    bg=lava?'#9a514c':carton?'#b59368':passage?'#566e6b':coast?'#90a4ad':shop?'#a89e83':'#555c78';
    wall(bg);floor(lava?'#8c4940':carton?'#987753':passage?'#566662':'#535b6b');
    if(lava){
      for(let i=0;i<16;i++){
        const x=(i-7.5)*36;
        p.mesh(root,new THREE.ConeGeometry(29+i%3*11,60+i%5*12,5),[x,35+i%4*10,-161+i%3*12],i%2?'#a95845':'#783a39');
      }
      for(let i=0;i<12;i++)oval(i%2?'#dd7959':'#ac654f',(i-6)*27,2,-65+i%5*7,14,2,6);
      light('#f0a064',0,175,-172,16);
    }else if(carton){
      panel(0,113,-115,182,150,'#c5a473','#947353');
      for(const x of [-97,97]){
        const flap=box(52,172,3,'#a4835c',x,116,-91);
        flap.rotation.y=(x<0?-1:1)*.56;
      }
      for(let i=0;i<12;i++)box(2,102,1,'#ac8c66',(i-5.5)*16,104,-108);
    }else if(passage){
      for(let i=0;i<5;i++){
        const x=96+i*19,z=-217+i*18;
        for(const sign of [-1,1])box(7,192,9,'#8b9987',sign*x,95,z);
        box(2*x,7,9,'#879685',0,191,z);
      }
      for(let i=0;i<7;i++)box(194,1.1,3,'#899885',0,.1,-168+i*42);
    }else if(coast){
      box(510,39,2,'#7b9fa6',0,45,-182);
      box(510,64,2,'#ae9d74',0,19,-173);
      oval('#ecc583',132,150,-178,18,18,2);
      for(let i=0;i<10;i++)box(31,1,2,'#b2beb2',(i-5)*42,30+i%4*9,-168);
    }else if(shop){
      for(const y of [48,80,112,144]){
        box(350,3.2,14,'#956c51',0,y,-126);
        for(let i=0;i<13;i++)box(15,15+i%3*3,8,i%2?'#deaf73':'#729694',(i-6)*24,y+11,-122);
      }
    }else{
      for(let i=0;i<7;i++)panel((i-3)*48,120+i%2*9,-129,36,135,'#7d7285',i%2?'#a68486':'#8798a1');
      stageLights('#d8aeb1','#a8d0d5');
    }
  }else if(setting==='lifeitself'){
    const road=/road|motel|finale/.test(view), neon=view.includes('neon'), room=view.includes('room');
    bg=road?'#b19477':neon?'#3e344b':room?'#604954':'#6a5761';
    wall(bg);floor(road?'#937761':neon?'#4c4154':'#66565a');
    if(road){
      for(let i=0;i<9;i++){
        const hill=oval(i%2?'#957a71':'#a28773',(i-4)*51,35,-197,82,41+i%3*11,7);
        hill.rotation.z=(i%2?.21:-.17);
      }
      box(78,.7,325,'#695b5c',0,.4,-57);
      for(let i=0;i<7;i++)box(3,.8,21,'#d6b481',0,.5,-158+i*38);
      beam('#655861',[111,0,-115],[111,151,-115],2.5);
      panel(111,153,-115,78,38,'#8b5d53','#b58162');
      if(view.includes('motel')){
        box(128,27,39,'#8c4848',-73,31,-72);
        box(69,15,34,'#9d5654',-89,48,-80);
        panel(-85,49,-77,43,11,'#744349','#9aa19b');
        for(const x of [-111,-32])oval('#413e40',x,21,-50,11,11,3);
      }
    }else if(room){
      for(let i=0;i<19;i++)box(7,143,2,i%2?'#9c8279':'#856d67',(i-9)*16,105,-160);
      panel(91,129,-134,50,79,'#795e5c','#96706d');
      box(98,24,57,'#845d62',-107,27,-79);
    }else{
      panel(0,136,-154,176,94,neon?'#996170':'#8f6a5c',neon?'#5d5771':'#a4826a');
      box(288,47,47,neon?'#6d4d61':'#987561',0,29,-96);
      for(let i=0;i<9;i++)light(neon?'#d784bd':'#dac095',(i-4)*31,199,-139,3.3);
    }
  }else if(setting==='robynfriend'){
    const violet=view.includes('violet'), red=view.includes('red'), door=view.includes('door');
    bg=violet?'#353552':red?'#692c3e':'#495151';
    wall(bg);floor(violet?'#474259':red?'#4f3d42':'#5b6869');
    for(let i=0;i<12;i++)box(3,222,5,violet?'#504e67':'#6c6055',(i-5.5)*41,115,-174);
    if(door)panel(0,117,-155,96,179,'#7b6d57','#5f605c');
    for(let i=0;i<7;i++){
      const x=(i-3)*48;
      beam('#4a4750',[x,226,-201],[x,226,4],1.7);
      light(violet?'#b695eb':red?'#ec846e':'#d4dae5',x,205,-105,6.1);
      box(25,.6,24,violet?'#5b5773':'#746553',x,.05,-76+i%2*12);
    }
    floorLines(violet?'#625b75':'#786956');
  }else if(setting==='idlesdancer'){
    const red=/red|stage/.test(view), violet=/violet|finale/.test(view);
    const laundry=view.includes('laundry'), door=/door|shutters/.test(view);
    bg=red?'#782e39':violet?'#453366':laundry?'#647b70':'#575e61';
    wall(bg);floor(red?'#594652':violet?'#514961':'#5d666a');
    if(door)for(const x of [-106,106]){
      panel(x,119,-148,107,174,'#72817d','#505c5e');
      for(let j=0;j<14;j++)box(108,2.6,2,'#6a7776',x,37+j*12,-143);
    }else if(laundry){
      for(let i=0;i<6;i++){
        const x=(i-2.5)*60;
        box(55,75,25,i%2?'#827a55':'#aea885',x,53,-105);
        oval('#cfbd79',x,54,-91,18,19,3.4);
        oval('#6c735c',x,54,-87,13.5,14.5,2);
        box(22,3.9,1.1,'#c6be9a',x,83,-91);
      }
      for(let i=0;i<22;i++)box(17,15,2,i%2?'#c0c1ad':'#748682',(i-10.5)*17,128,-153);
    }else{
      for(let i=0;i<14;i++)box(2.5,188,3,violet?'#6a5180':red?'#a34b51':'#7b8180',(i-6.5)*31,108,-181);
      stageLights(violet?'#b98edd':red?'#fa727b':'#aabfc3',violet?'#a493e8':'#c68681');
      for(let i=0;i<7;i++)box(25,.6,30,i%2?'#7f7f72':'#989071',(i-3)*51,.17,-54);
    }
  }else if(setting==='kimbrasettle'){
    const fire=/fire|finale/.test(view), dolls=view.includes('doll'), school=view.includes('school'), garden=view.includes('garden');
    bg=garden?'#718168':fire?'#793b46':school?'#7d414e':dolls?'#886854':'#9c6c69';
    wall(bg);floor(garden?'#a48e69':school?'#8c646a':fire?'#62434b':'#987b6f');
    if(garden){
      for(let i=0;i<13;i++){
        const x=(i-6)*35;
        beam('#786452',[x,0,-153],[x+i%2*14,188,-154],3.3);
        oval(i%2?'#a1a87a':'#78825e',x,158+i%3*13,-147,25,39,6);
      }
      box(146,1.4,82,'#bd9d6e',30,1,-43);
      for(const x of [-22,31,72])oval('#ead2a9',x,4,-37,8,2,7);
    }else if(school){
      for(let i=0;i<18;i++)box(12,203,3,i%2?'#ae5e6a':'#8f4858',(i-8.5)*26,113,-137);
      for(const x of [-125,125])light('#e2bb80',x,180,-132,8);
      floorLines('#a17c75');

    }else if(dolls||fire){
      for(const y of [61,115,169]){
        box(345,4,29,'#795448',0,y,-134);
        for(let i=0;i<11;i++){
          const x=(i-5)*30, dress=['#bd8982','#a4a0b1','#b59b6e'][i%3];
          oval(dress,x,y+13,-129,7,11,4);
          oval('#dcba97',x,y+24,-128,4.5,5,4.1);
          if(fire&&i%3===0)features.push(oval('#ec995b',x,y+6,-118,5,12,2));
        }
      }
      stageLights(fire?'#f0a472':'#e4c89d',fire?'#ce655b':'#c58b87');
    }else{
      panel(0,137,-180,115,146,'#9e7c68','#c3a186');
      box(181,18,53,'#9e625c',0,68,-88);
      box(162,2,49,'#c39e8a',0,78,-88);
      for(const x of [-57,-32,35,58])oval('#ded1ae',x,79,-84,10,2,8);
      for(const x of [-103,103]){
        beam('#81594b',[x,41,-97],[x,112,-97],3.2);
        light('#e5bd7d',x,120,-97,4);
      }
    }
  }else if(setting==='tuneyardswater'){
    const television=view.includes('tv'), puppet=view.includes('puppet'), stripes=view.includes('stripe'), studio=view.includes('studio');
    bg=television?'#373254':puppet?'#775b8d':studio?'#5a8998':stripes?'#884d78':'#548976';
    wall(bg);floor(television?'#5a4e75':'#6a7a76');
    const chips=['#d99164','#a2bd7e','#ce83a2','#6aaeb2','#e4c47c'];
    if(television){
      panel(0,117,-138,215,139,'#74628e','#817d9d');
      for(let i=0;i<19;i++)features.push(oval(chips[i%chips.length],(i%10-4.5)*34,53+Math.floor(i/10)*91+i%3*11,-127,2.1,2.1,1.5));
      for(const x of [-146,146])light('#aacaaf',x,166,-126,8);
    }else if(studio){
      box(129,21,45,'#a64f5c',5,21,-91);
      box(121,37,7,'#b35f64',5,44,-106);
      for(const x of [-61,70])box(8,24,44,'#b96a6e',x,37,-94);
      for(const x of [-142,135])panel(x,146,-151,38,77,'#759cac','#abd1c4');
    }else if(puppet){
      for(const [i,x] of [-146,-88,92,144].entries()){
        oval(chips[i],x,107,-105,20,32,8);
        oval('#e7c7a6',x-7,115,-96,4.5,5,3);
        oval('#e7c7a6',x+7,115,-96,4.5,5,3);
        oval('#5a455e',x,94,-96,10,3.7,4);
        beam('#806b84',[x,79,-106],[x+(i%2?27:-24),50,-106],2.2);
      }
    }else{
      for(let i=0;i<17;i++){
        const stripe=box(22,223,2,chips[i%chips.length],(i-8)*33,117,-170);
        stripe.rotation.z=(i%2?.19:-.19);
      }
      for(let i=0;i<11;i++)features.push(oval(chips[(i+2)%chips.length],(i-5)*38,172+i%3*17,-123,8,8,2.2));
    }
  }else if(setting==='metrolook'){
    const birds=view.includes('birds'), organ=view.includes('organ');
    bg=birds?'#9eb5bf':'#d6d5c7';
    wall(bg);floor(birds?'#aea997':'#c5c5b7');
    if(birds){
      for(let i=0;i<14;i++)box(48,1.2,2,i%2?'#8aa6b2':'#b2c0bd',(i-6.5)*38,41+i%4*13,-141);
      if(view.includes('cart'))for(const x of [-103,108]){
        oval('#4e706b',x,19,-75,37,10,26);
        oval('#7d8c75',x+7,27,-77,20,9,20);
        beam('#644f42',[x,15,-76],[x,102,-77],1.1);
      }
      for(let i=0;i<7;i++){
        const x=(i-3)*45,y=91+(i%3)*35,z=-107-i%2*14;
        oval('#e5e4d1',x,y,z,12,4.6,3.8);
        oval('#ede9d9',x+11,y+3,z,4.5,4.9,3.5);
        box(7,2,3,'#ba9b65',x+16,y+3,z);
        for(const side of [-1,1])features.push(beam('#efebd7',[x,y,z],[x+side*19,y+12,z-8],2.1));
      }
    }else{
      for(const x of [-132,127]){
        box(47,55,24,'#a5a899',x,31,-104);
        oval('#767f7c',x,33,-90,15,17,3);
      }
      const x=organ?55:92;
      box(87,12,28,'#888f83',x,74,-69);
      for(let i=0;i<22;i++)box(3.3,1.8,19,i%5===2?'#5f655e':'#dedbc8',x+(i-10.5)*3.8,81,-63);
      for(const y of [106,170])box(481,1.3,1.1,'#b5b5a5',0,y,-171);
      oval('#b8b7a8',-77,41,-53,25,23,15);
      oval('#e2dfcb',-77,42,-38,21,20,2);
    }
  }else if(setting==='jainmakeba'){
    const mono=view.includes('mono'), street=/street|skyline/.test(view), court=view.includes('court'), grove=/grove|zebra/.test(view);
    bg=mono?'#737475':street?'#a47651':grove?'#b7a485':court?'#718e79':'#d0ae54';
    wall(bg);floor(mono?'#848685':court?'#80967b':'#ab9564');
    if(grove){
      for(let i=0;i<12;i++){
        const x=(i-5.5)*39;
        beam(i%2?'#726f59':'#8e795b',[x,0,-117-i%3*20],[x+8,204,-141-i%3*18],2.9);
        oval(i%2?'#9c9e77':'#acaa83',x,206,-151,21,13,7);
      }
      if(view.includes('zebra')){
        panel(92,95,-123,102,75,'#948066','#74726a');
        for(let i=0;i<10;i++){
          const stripe=box(4.1,70,1,'#c6c4ad',53+i*8.5,94,-118);
          stripe.rotation.z=.22*Math.cos(i*.9);
        }
      }
    }else if(street){
      for(let i=0;i<9;i++){
        const x=(i-4)*52;
        box(45,160,4,i%2?'#b59164':'#a57a59',x,75,-184);
        panel(x,93,-176,24,43,'#8e705a','#bca981');
      }
    }else{
      const shades=mono?['#393c3f','#a1a1a0','#d1cebe']:['#315d59','#c89754','#e2c382','#9e6654'];
      for(let i=0;i<24;i++){
        const x=(i%12-5.5)*41,y=57+Math.floor(i/12)*86;
        const tile=box(33,33,1.5,shades[i%shades.length],x,y,-153);
        tile.rotation.z=(i%2?.38:-.38);
      }
      for(let i=0;i<9;i++)box(40,.8,18,shades[i%shades.length],(i-4)*44,0,-86+i%3*26);
    }
  }else if(setting==='jbreakfastsweet'){
    const night=/night|ufo|woods|finale/.test(view), monitors=view.includes('monitor'), car=view.includes('car');
    bg=night?'#303f42':car?'#304943':monitors?'#514358':'#6b5043';
    wall(bg);floor(night||car?'#3f5550':'#775d50');
    if(car){
      panel(0,132,-97,231,130,'#4d5950','#38544b');
      box(251,9,2,'#7d9e69',0,173,-93);
      for(const x of [-70,71]){
        box(51,74,20,'#5b5449',x,70,-44);
        box(37,24,17,'#384b47',x,118,-48);
      }
      light('#a2cb81',-91,183,-88,4.9);light('#a2cb81',91,183,-88,4.9);
    }else if(night){
      for(let i=0;i<16;i++)oval(i%2?'#4f6870':'#48605d',(i-8)*35,40+i%3*13,-184,25,35,9);
      oval('#777f79',34,174,-112,66,10,18);
      oval('#8aae9c',34,180,-112,31,17,14);
      for(let i=0;i<7;i++)light('#b6e2bc',(i-2)*16,170,-97,3.6);
      beam('#688c82',[-12,164,-117],[-56,19,-121],1.6);
      beam('#688c82',[71,164,-118],[110,19,-121],1.6);
    }else{
      for(let i=0;i<14;i++)box(4,179,2,i%2?'#87664f':'#765544',(i-6.5)*36,101,-190);
      box(273,21,39,'#825c4d',0,44,-98);
      for(let i=0;i<7;i++)panel((i-3)*48,105+i%2*25,-138,36,29,'#69515b',i%2?'#9db19c':'#88a5ba');
      for(const x of [-127,125])light('#dda979',x,168,-135,5);
    }
  }else if(setting==='chvrchesmother'){
    const bedroom=view.includes('bedroom'), amber=view.includes('amber'), lights=/light|pixel|finale/.test(view);
    bg=bedroom?'#646171':amber?'#594252':lights?'#344a70':'#3b3d65';
    wall(bg);floor('#4c4d65');
    if(bedroom){
      panel(-95,141,-141,72,101,'#7c7885','#9bb0bb');
      for(const x of [-119,-94,-72])box(3,102,2,'#b6aeb3',x,142,-135);
      box(137,24,65,'#6a6273',68,31,-93);
      box(134,8,66,'#8a8898',68,47,-93);
      box(74,10,24,'#ae9da5',82,56,-110);
    }else if(amber){
      for(let i=0;i<6;i++)light(i%2?'#edb16b':'#d58766',(i-2.5)*66,197-i%2*13,-130,6.4);
      for(const x of [-108,104]){
        box(32,28,24,'#4e404e',x,36,-77);
        oval('#99746f',x,37,-64,10,11,2.6);
      }
      floorLines('#806069');
    }else{
      for(let i=0;i<38;i++){
        const x=(i%13-6)*32, y=58+Math.floor(i/13)*52+i%4*5;
        features.push(oval(lights?i%2?'#e59f7d':'#8fc5df':'#6985b8',x,y,-122-i%3*8,2.6,2.9,2));
      }
      for(const x of [-138,136])beam('#7f91b7',[x,205,-144],[x*.67,48,-151],1.25);
    }
  }else{
    const portrait=/portrait|table/.test(view), finale=view.endsWith('finale');
    bg=finale?'#2d383d':portrait?'#675862':'#7a7566';
    wall(bg);floor(finale?'#394348':portrait?'#706168':'#959282');
    if(finale){
      beam('#81a3a2',[-67,86,-135],[0,195,-135],2.1);
      beam('#81a3a2',[0,195,-135],[67,86,-135],2.1);
      beam('#81a3a2',[-67,86,-135],[67,86,-135],2.1);
    }
    for(let i=0;i<(finale?0:5);i++){
      const x=(i-2)*95;
      box(12,188,12,'#ac9c7d',x,96,-154);
      box(19,11,17,'#b7a888',x,184,-151);
      for(let j=0;j<7;j++){
        const a=j*Math.PI/6;
        const block=box(15,9,6,'#b1a48a',x-48+Math.cos(a)*42,168+Math.sin(a)*39,-160);
        block.rotation.z=a-Math.PI/2;
      }
    }
    if(!finale){
      panel(0,121,-174,54,72,'#aa9f88','#7f9b9f');
      for(let i=0;i<5;i++)box(342,6,18,'#a29882',0,5+i*6,-72-i*17);
    }
    if(view.includes('table')){
      box(191,11,54,'#755b5b',0,55,-62);
      for(const x of [-64,-31,33,67])oval('#bdaf92',x,61,-58,9,2,7);
    }
  }

  return {root,background:bg,features};
}
