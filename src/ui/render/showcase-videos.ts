import * as THREE from 'three';
import type { ShowcaseSetting, ShowcaseView } from '../../scene/showcase-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const SHOWCASE_WARDROBE = {
  mitskinobody:{jackets:['#354667','#af4a50','#437181','#637a52'],hair:['#30262b','#493738']},
  letforeverbe:{jackets:['#ca5254','#e2b688','#ae4447','#e7c5aa'],hair:['#614636','#d1a163']},
  tilteddance:{jackets:['#282c37','#2e343c','#393a47','#2f313a'],hair:['#52433a','#2d2327']},
  welcometoisland:{jackets:['#56798c','#873527','#c98451'],hair:['#393337','#69483e']},
  lifeitself:{jackets:['#91714e','#a36058','#565e5d','#856b69'],hair:['#3e3331','#503c34']},
  robynfriend:{jackets:['#5c86a1'],hair:['#e6ce9f']},
  idlesdancer:{jackets:['#b9b6a5','#445e5a','#7e665a','#53494b','#365556'],hair:['#4a3730','#443544']},
};
export const SHOWCASE_FIGURES:Record<ShowcaseSetting,number> = {
  mitskinobody:4, letforeverbe:7, tilteddance:4, welcometoisland:3, lifeitself:4, robynfriend:1, idlesdancer:5,
};

export function buildShowcaseSet(p:VideoProps, setting:ShowcaseSetting, view:ShowcaseView) {
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
  }else{
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
  }

  return {root,background:bg,features};
}
