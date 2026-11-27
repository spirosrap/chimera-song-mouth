import * as THREE from 'three';
import type { IndieSetting, IndieView } from '../../scene/indie-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const INDIE_WARDROBE = {
  brickgirl:{jackets:['#bc3e48','#33343d'],hair:['#39323d','#604039']},
  yeahzero:{jackets:['#49434f','#57425d','#493848','#6d5662'],hair:['#292431','#62514a']},
  takemeout:{jackets:['#7c554b','#44424b','#a47a56','#535a57'],hair:['#55423b','#3d3838']},
  lesartistes:{jackets:['#cab796','#a47574','#748579','#987e92'],hair:['#332d38','#665047']},
  justicedance:{jackets:['#343044','#4c4160','#394344','#4d383e'],hair:['#4d3947','#6a4c48']},
  intergalactic:{jackets:['#c58e66','#a39169','#7a91a1','#9a9b76','#b3886e'],hair:['#675844','#4f4340','#5c514a']},
  treadmills:{jackets:['#a78464','#9b5260','#746b82','#596d68'],hair:['#58443d','#3b373f']},
};

export const INDIE_FIGURES:Record<IndieSetting,number> = {
  brickgirl:2, yeahzero:4, takemeout:4, lesartistes:4, justicedance:4, intergalactic:5, treadmills:4,
};

export function buildIndieSet(p:VideoProps, setting:IndieSetting, view:IndieView) {
  const root=new THREE.Group();
  const features:THREE.Object3D[]=[];
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>p.box(root,w,h,d,c,[x,y,z]);
  const disc=(c:string,x:number,y:number,z:number,w:number,h:number,d:number)=>p.oval(root,[x,y,z],[w,h,d],c);
  const line=(c:string,a:VideoPoint,b:VideoPoint,r=1.1)=>p.tube(root,a,b,r,c);
  const wall=(c:string)=>box(1100,460,3,c,0,222,-252);
  const floor=(c:string)=>box(1480,1.4,1050,c,0,-1,-300);
  let background:string;
  let animate:((time:number)=>void)|undefined;

  if(setting==='brickgirl'){
    const mosaic=/mosaic|finale/.test(view);
    const red='#a3515d', ink='#57505b', chalk='#d5c9bf';
    background=mosaic?red:ink;
    wall(background);
    floor(mosaic?'#a37779':'#9b8a84');
    for(let row=0;row<7;row++){
      for(let col=0;col<11;col++){
        const x=(col-5)*41+row%2*18, y=15+row*29;
        const palette=mosaic?[ink,chalk,red,'#547f9e','#bfa35d']:['#6c616b','#b19b93','#9a6269'];
        box(39,26,9,palette[(col*7+row*5+Math.floor(col/3))%palette.length],x,y,-145-row%3*3);
        if((row+col)%3===0)box(14,5,6,chalk,x,y+15,-143-row%3*3);
      }
    }
    if(/guitar|duo|finale/.test(view)){
      const body=disc(red,-91,46,-71,18,23,7);
      body.rotation.z=.27;
      line(ink,[-93,43,-66],[-71,105,-69],3.4);
      box(11,15,3,chalk,-69,107,-68);
    }
    if(/drums|duo|finale/.test(view)){
      for(const [i,x] of [67,108,137].entries()){
        disc(i%2?chalk:red,x,31,-88,16,17,10);
        disc(ink,x,31,-76,12,13,2.8);
        line(ink,[x,0,-91],[x,69+i%2*7,-91],1.1);
        disc(chalk,x,69+i%2*7,-91,15,1.8,9);
      }
    }
  }else if(setting==='yeahzero'){
    const silver=/neon|finale/.test(view), alley=/alley|window/.test(view);
    background=silver?'#70758d':'#45445e';
    wall(background);
    floor(silver?'#86848c':'#535169');
    for(let i=0;i<10;i++){
      const x=(i-4.5)*45,z=-162+i%3*9;
      line('#807997',[x,0,z],[x+15,196,z-8],1.7);
      features.push(disc(i%2?'#cabbcf':'#98a9d0',x+6,182+i%3*11,z+14,5,5,3));
    }
    if(silver){
      for(let row=0;row<4;row++)for(let col=0;col<14;col++)
        features.push(disc((row+col)%3===0?'#dccec6':'#aeb6c9',(col-6.5)*29,38+38*row+col%2*12,-101-row%3*8,1.7,2,1));
    }
    if(alley){
      const colors=['#ad838f','#7d9f9f','#c6a47d'];
      for(let i=0;i<8;i++){
        const x=(i-3.5)*54;
        box(43,110,5,'#595061',x,67,-133);
        box(35,78,3,'#867f85',x,70,-129);
        box(39,8,2,colors[i%3],x,130,-126);
        for(let row=0;row<3;row++)box(36,2,3,'#605968',x,49+17*row,-125);
      }
    }
  }else if(setting==='takemeout'){
    const machine=/motor|dials|pointer/.test(view);
    background=machine?'#9d8a71':'#ae9d82';
    wall(background);
    floor('#8b7864');
    const colors=['#a46d62','#c7b89a','#8a8c85','#6f655d'];
    for(let i=0;i<12;i++){
      const piece=box(49+i%3*12,36+i%4*18,3,colors[i%4],(i-5.5)*37,43+i%4*43,-142-i%3*12);
      piece.rotation.z=(i%3-1)*.28;
    }
    const pointers:{needle:THREE.Mesh; x:number; y:number}[]=[];
    for(const [i,x] of [-127,91,144].entries()){
      if(!machine && i===1)continue;
      const y=85+i%2*54, z=-126;
      disc('#775e51',x,y,z,32,32,5);
      disc('#c5ae8c',x,y,z+6,23,23,2);
      const needle=line('#8b5657',[x,y,z+10],[x+17,y,z+10],1.65);
      pointers.push({needle,x,y});
      for(let k=0;k<12;k++){
        const angle=k*Math.PI/6;
        disc('#958174',x+Math.cos(angle)*27,y+Math.sin(angle)*27,z+7,1.9,1.9,1.2);
      }
    }
    animate=time=>{
      for(const [i,{needle,x,y}] of pointers.entries()){
        const angle=(i%2?-1:1)*time*(.8+.28*i);
        needle.rotation.z=angle-Math.PI/2;
        needle.position.x=x+8.5*Math.cos(angle);
        needle.position.y=y+8.5*Math.sin(angle);
      }
    };
  }else if(setting==='lesartistes'){
    const art=/still|splashes|finale/.test(view), forest=/courtyard|parade/.test(view);
    background=art?'#929c81':'#a8aa90';
    wall(background);
    floor(art?'#a99e88':'#aaa894');
    for(const [i,x] of [-174,-118,120,176].entries()){
      box(46,39+i%2*18,36,'#b2aa96',x,23,-100);
      disc(i%2?'#b28682':'#808d76',x,58+i%2*17,-95,15,23,12);
      if(i%2===0)disc('#c0b49a',x,84,-97,12,7,10);
    }
    for(let i=0;i<9;i++){
      const x=(i-4)*50;
      if(forest){
        const z=-159-i%3*10;
        line('#7d8477',[x,0,z],[x+i%3*7,218,z],4+i%3);
        disc('#8c967f',x,185+i%3*11,z,27,26,7);
      }else{
        box(21,147,11,i%2?'#aba792':'#bdb299',x,84,-174);
        box(41,12,15,'#928877',x,157,-172);
      }
    }
    if(forest){
      disc('#5c6265',119,55,-119,31,13,12);
      line('#63656a',[103,57,-119],[91,89,-119],7);
      disc('#6d6a70',83,88,-116,13,7,7);
      for(const x of [99,126,140])line('#64676a',[x,51,-120],[x-3,13,-119],3.2);
    }
    if(art){
      const colors=['#a25871','#d6bf66','#7ba9a2','#95749d'];
      for(let i=0;i<19;i++){
        const splash=disc(colors[i%4],(i%9-4)*42,21+Math.floor(i/9)*47+i%3*12,-108-i%5*5,8+i%4*4,4+i%3*5,3);
        splash.rotation.z=(i%5-2)*.4;
        features.push(splash);
      }
    }
  }else if(setting==='justicedance'){
    const neon=/neon|emblems|finale/.test(view);
    background=neon?'#4d4560':'#585264';
    wall(background);
    floor(neon?'#555466':'#615967');
    const colors=['#be749a','#89bab0','#deb37a','#8b95bf'];
    for(let i=0;i<12;i++){
      const x=(i-5.5)*41, y=55+i%3*43, z=-132-i%4*12;
      box(22,51,3,'#494452',x,y,z-2);
      if(i%3===0){
        features.push(disc(colors[i%4],x,y,z,7,8,2));
        features.push(box(11,1.8,3,colors[i%4],x,y-14,z));
      }else{
        for(let j=0;j<3;j++){
          const slash=box(14-j*2,4,3,colors[(i+j)%4],x,y+j*9-8,z+j);
          slash.rotation.z=(i%2?.26:-.26);
          features.push(slash);
        }
      }
    }
    if(view.includes('crossing')||neon){
      for(let i=0;i<10;i++)box(17,.45,33,colors[(i+1)%4],(i-4.5)*36,.09,-16-i%2*28);
    }
  }else if(setting==='intergalactic'){
    const station=/station|trio|close/.test(view);
    background=station?'#82928c':'#536b80';
    wall(background);
    floor(station?'#82918f':'#687986');
    if(station){
      for(let i=0;i<11;i++){
        const x=(i-5)*43;
        box(37,164,2,i%2?'#9ca59b':'#aeb4a4',x,91,-146);
        for(let row=0;row<5;row++)box(38,1.7,1,'#73898c',x,21+row*29,-143);
        box(40,6,3,'#b99f75',x,22,-141);
      }
    }else{
      for(let i=0;i<10;i++){
        const x=(i-4.5)*48,h=88+i%4*37;
        box(44,h,13,i%2?'#70838d':'#687385',x,h/2,-165);
        for(let k=0;k<4;k++)box(12,4,2,i%2?'#a4aeaf':'#c4b78d',x,21+k*17,-157);
      }
      if(/robot|rooftop|finale/.test(view)){
        const x=107,z=-111;
        box(64,62,16,'#8d9da4',x,115,z);
        box(49,40,16,'#aa9b93',x,170,z);
        box(39,11,2,'#555064',x,175,z+10);
        for(const side of [-1,1]){
          box(16,54,14,'#718b91',x+side*45,108,z-2);
          box(18,34,13,'#8794a0',x+side*19,66,z);
          features.push(disc('#c3a27c',x+side*12,175,z+13,4,3.3,1));
        }
        features.push(disc('#cc967e',x,115,z+10,12,11,2.4));
      }
    }
  }else{
    const pair=view.includes('pairs'), turn=view.includes('crossing');
    background=pair?'#89848d':'#9e9997';
    wall(background);
    floor('#827d83');
    for(let i=0;i<16;i++){
      const fold=box(16,189,5,i%2?'#a7a1a1':'#b7b0a8',(i-7.5)*27,107,-139-i%3*3);
      fold.rotation.z=(i%3-1)*.045;
    }
    const marks:THREE.Object3D[]=[];
    for(const [i,x] of [0,-44,44,-85].entries()){
      const z=turn?(i%2?4:-21):i%2?-10:-26;
      box(35,8,125,'#514d56',x,4,z);
      box(28,1.2,112,'#686474',x,8.3,z);
      for(const side of [-1,1])line('#7b7782',[x+side*16,8,z-53],[x+side*16,8,z+57],1.8);
      for(let j=0;j<5;j++){
        const mark=box(23,.3,1.25,'#979195',x,9,z);
        mark.userData.beltCenter=z;
        mark.userData.index=j;
        marks.push(mark);
      }
    }
    animate=time=>{
      for(const mark of marks)mark.position.z=mark.userData.beltCenter-50+(mark.userData.index*20+time*29)%100;
    };
  }

  return {root,background,features,animate};
}
