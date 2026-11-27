import * as THREE from 'three';
import type { EncoreSetting, EncoreView } from '../../scene/encore-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const ENCORE_WARDROBE = {
  virtualinsanity:{jackets:['#253553','#d4d3c6','#d1d0c7','#dcd8cb','#b5bbc0'],hair:['#302c31','#595156']},
  genghiskhan:{jackets:['#826858','#ada58c','#394d59'],hair:['#4b372e','#62513b']},
  silkchiffon:{jackets:['#a66e8b','#806183','#5f8c76','#b07b6b','#9fa776'],hair:['#563931','#b784a0','#60493c']},
  auroracure:{jackets:['#384b55','#596978','#35474c','#8b8777','#a67f78'],hair:['#d2b58a','#4c3836']},
  aboutdamntime:{jackets:['#8172a2','#58517b','#a57578','#6b8e80','#a1846c'],hair:['#38272d','#553c38']},
  kyliehead:{jackets:['#d6d1bb','#7e8285','#a99788','#a38d80','#757c88'],hair:['#725542','#3e3738']},
  roisinover:{jackets:['#3c3a46','#646a7f','#9b7f72'],hair:['#c1ac82','#3b333b']},
};

export const ENCORE_FIGURES:Record<EncoreSetting,number> = {
  virtualinsanity:5, genghiskhan:2, silkchiffon:5, auroracure:5,
  aboutdamntime:5, kyliehead:5, roisinover:3,
};

export function buildEncoreSet(p:VideoProps, setting:EncoreSetting, view:EncoreView) {
  const root=new THREE.Group();
  const features:THREE.Object3D[]=[];
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>p.box(root,w,h,d,c,[x,y,z]);
  const oval=(c:string,x:number,y:number,z:number,a:number,b:number,d:number)=>p.oval(root,[x,y,z],[a,b,d],c);
  const bar=(c:string,a:VideoPoint,b:VideoPoint,r=1.1)=>p.tube(root,a,b,r,c);
  const wall=(c:string)=>box(1100,450,3,c,0,210,-257);
  const floor=(c:string)=>box(1450,1.5,1000,c,0,-1,-320);
  const frame=(x:number,y:number,z:number,w:number,h:number,border:string,center:string)=>{
    box(w+5,h+5,4,border,x,y,z);
    box(w,h,1.2,center,x,y,z+2.3);
  };
  const lamp=(x:number,y:number,z:number,c:string,r=4.8)=>{
    oval('#403843',x,y,z-2,r*1.27,r*1.27,3);
    features.push(oval(c,x,y,z,r,r,2.7));
  };
  const lights=(a:string,b:string)=>{
    for(let i=0;i<8;i++)lamp((i-3.5)*44,195+i%3*7,-143,i%2?a:b);
  };
  const ruledFloor=(c:string,width=450)=>{
    for(let i=0;i<8;i++)box(width,1.2,1.3,c,0,.25,-176+i*45);
  };
  const sofa=(x:number,z:number,seat:string,edge:string)=>{
    const group=new THREE.Group();
    group.position.set(x,0,z);root.add(group);
    p.box(group,99,23,48,seat,[0,24,0]);
    p.box(group,96,42,8,edge,[0,45,-18]);
    for(const side of [-1,1])p.box(group,10,27,44,edge,[side*50,37,-1]);
    for(const side of [-1,1])p.box(group,5,10,5,edge,[side*39,8,12]);
    return group;
  };
  let background:string;
  let animate:((time:number)=>void)|undefined;

  if(setting==='virtualinsanity'){
    const dark=view.endsWith('finale');
    background=dark?'#626b73':'#9a9fa3';
    wall(background);floor(dark?'#7a7f84':'#a6acaa');
    for(let i=0;i<10;i++){
      const x=(i-4.5)*67;
      frame(x,134,-192,63,158,dark?'#8b8f94':'#b6babb',i%2?'#aeb2b1':'#bec0bd');
      box(2,213,1,'#858b8e',x-32,129,-187);
    }
    for(const x of [-117,118]){
      for(let j=0;j<7;j++)box(3.4,1.8,21,'#d8d9d1',x,215,-202+j*31);
      bar('#838d91',[x,214,-190],[x*.41,210,64],1.1);
    }
    const tracks=new THREE.Group();root.add(tracks);
    for(let i=0;i<7;i++)p.box(tracks,1.1,.8,490,'#8e9697',[(i-3)*56,.3,-117]);
    for(let i=0;i<10;i++)p.box(tracks,590,.7,1.1,'#959e9d',[0,.25,-221+49*i]);
    const left=sofa(-103,-91,'#484953','#3c3f49');
    const right=sofa(123,-144,'#51535c','#444752');
    animate=time=>{
      const drift=44*Math.sin(time*.68);
      tracks.position.x=drift;
      tracks.position.z=31*Math.sin(time*.51);
      left.position.x=-120+drift*.73;
      right.position.x=128-drift*.72;
      left.position.z=-93+13*Math.sin(time*.43);
    };
  }else if(setting==='genghiskhan'){
    const home=view.includes('house'), passage=view.includes('passage');
    background=home?'#8b755f':passage?'#465c77':'#4d6569';
    wall(background);floor(home?'#846c5f':passage?'#7d594e':'#596e70');
    if(home){
      sofa(-94,-91,'#aa8a69','#87735e');
      for(const x of [-119,32,117])frame(x,151,-141,45,66,'#8d7059','#c5a888');
      bar('#705b54',[123,3,-105],[123,155,-105],1.9);
      oval('#e6c889',123,158,-103,17,10,8);
    }else if(passage){
      for(let i=0;i<6;i++){
        const x=84+i*21,z=-219+i*24;
        for(const sign of [-1,1])box(5,182,8,'#77929e',sign*x,90,z);
        box(x*2,6,7,'#8aa1ab',0,184,z);
      }
      ruledFloor('#a4705a');
    }else{
      for(let i=0;i<9;i++)frame((i-4)*43,139+i%2*27,-154,37,31,'#596567',i%3?'#8fae9b':'#cca875');
      box(304,31,35,'#485c60',0,42,-101);
      for(let i=0;i<15;i++)box(8,5,5,i%2?'#d2aa79':'#8bb39f',(i-7)*16,61,-91);
      lights('#c4a679','#85aa92');
    }
  }else if(setting==='silkchiffon'){
    const garden=view.includes('garden'), porch=view.includes('porch'), pink=/pink|room|guest/.test(view);
    background=garden?'#819075':porch?'#8a9c8b':pink?'#ad778e':'#866b94';
    wall(background);floor(garden?'#8e9b79':porch?'#8f8c74':'#ac8195');
    if(garden){
      for(let i=0;i<14;i++){
        const x=(i-6.5)*33;
        bar('#796c57',[x,0,-171],[x+5,202,-176],3.1);
        oval(i%2?'#8f9f7f':'#779076',x,198,-169,23,25,8);
      }
      for(let i=0;i<12;i++)oval(i%2?'#b9828a':'#a2ad77',(i-5.5)*32,23+i%4*5,-102,7,7,2);
    }else if(porch){
      for(let i=0;i<11;i++)box(5,98,4,'#b8ad91',(i-5)*33,50,-127);
      box(362,6,6,'#c5baa0',0,101,-125);
      for(const x of [-140,141])box(11,202,15,'#a69e83',x,100,-133);
      frame(0,146,-178,105,74,'#c6b799','#a2a384');
    }else{
      sofa(0,-111,'#ad788e','#9a667d');
      for(let i=0;i<7;i++)frame((i-3)*51,137+i%2*17,-175,34,52,'#9d6e91',i%2?'#d09bb0':'#ae8aa0');
      lights('#d9adbf','#bad0b4');
    }
  }else if(setting==='auroracure'){
    const curtain=view.includes('curtain'), close=view.includes('close'), gold=/checker|finale|lamp/.test(view);
    background=gold?'#79655a':curtain?'#50606c':close?'#557278':'#617779';
    wall(background);floor(gold?'#867264':'#646f75');
    for(let i=0;i<16;i++)box(13,198,2,gold?i%2?'#8b7562':'#6d5e58':i%2?'#596876':'#4f5f6b',(i-7.5)*29,114,-175);
    for(let row=0;row<7;row++)for(let col=0;col<11;col++){
      box(38,1,38,(row+col)%2?'#9d9e9a':'#646c76',(col-5)*38,.05,94-row*38);
    }
    for(const x of [-130,137]){
      bar('#5a5258',[x,0,-104],[x,149,-104],1.6);
      oval('#cfab83',x,158,-102,17,10,9);
    }
    if(!close)lights('#b8d5d2','#d8bb9d');
  }else if(setting==='aboutdamntime'){
    const meeting=view.includes('meeting'), water=view.includes('water'), disco=/disco|night|finale/.test(view);
    background=meeting?'#877064':water?'#426c82':disco?'#59426d':'#6b596d';
    wall(background);floor(meeting?'#80645c':water?'#537f91':disco?'#654e79':'#796876');
    if(meeting){
      for(const x of [-133,-83,75,129]){
        box(39,6,27,'#8f6456',x,32,-89);
        box(37,31,6,'#a67864',x,54,-101);
        for(const z of [-96,-78])bar('#6f564e',[x,0,z],[x,29,z],1.6);
      }
      frame(0,153,-151,105,51,'#a78670','#bfa187');
    }else if(water){
      for(let i=0;i<21;i++)features.push(oval(i%2?'#8fb9c5':'#689faf',(i%11-5)*36,.9,-40-Math.floor(i/11)*69+i%3*11,18,1.25,4));
      frame(0,124,-162,165,124,'#57768b','#7c9da7');
      lights('#9fd3cf','#a188bd');
    }else if(disco){
      const ball=oval('#bfb4ce',1,204,-109,29,28,23);
      for(let i=0;i<42;i++){
        const angle=i*2.399, y=185+i%8*5.4, radius=Math.sqrt(Math.max(40,28**2-(y-204)**2));
        box(3.7,3.6,2,i%2?'#ded2e3':'#9f92b4',Math.cos(angle)*radius,y,-104+Math.sin(angle)*radius);
      }
      features.push(ball);
      lights('#dc99c0','#a3a0e1');
      ruledFloor('#917396');
    }else{
      for(const x of [-105,0,105])frame(x,117,-128,92,161,'#8b768b','#a397a6');
      for(let i=0;i<9;i++)box(4,200,2,'#968398',(i-4)*48,107,-173);
    }
  }else if(setting==='kyliehead'){
    const road=/road|car/.test(view), red=view.includes('red'), night=/night|finale/.test(view);
    background=road?'#5e606f':red?'#8f5361':night?'#404951':'#a4abad';
    wall(background);floor(road?'#76707a':red?'#946771':night?'#546264':'#adb0a7');
    if(road){
      box(132,.9,430,'#555765',0,.3,-104);
      for(let i=0;i<9;i++)box(4,1.1,20,'#d9c8ae',0,.45,-194+i*42);
      box(124,26,41,'#a45860',-89,33,-78);
      frame(-87,51,-76,75,14,'#77525a','#afb3bc');
      for(const x of [-122,-47])oval('#484858',x,22,-54,13,13,4);
    }else if(night){
      for(let i=0;i<8;i++){
        const x=(i-3.5)*57;
        box(48,143+i%3*19,4,'#59646d',x,89,-174);
        for(let j=0;j<5;j++)box(14,3.1,1.6,i%2?'#a4aec3':'#bec9c7',x,32+j*27,-170);
      }
      lights('#a5b5d6','#b2cad3');
      ruledFloor('#677b84');
    }else{
      for(let i=0;i<13;i++){
        const x=(i-6)*40;
        box(14,200,12,red?'#b16f78':'#c5c8bb',x,99,-160);
        box(25,13,17,red?'#a4636b':'#b4b9ac',x,118+i%3*24,-151);
      }
      for(const x of [-137,139])frame(x,136,-141,74,95,red?'#9e6778':'#949da0',red?'#b58590':'#bdc7c6');
      lights(red?'#e3a2a3':'#d2ded4',red?'#d0839a':'#a2babd');
    }
  }else{
    const bus=view.includes('bus'), street=view.includes('street'), counter=view.includes('counter');
    const laundry=view.includes('laundry'), room=view.endsWith('finale');
    background=bus?'#5c6b70':street?'#6c666d':counter?'#8c6b63':laundry?'#9c9c89':room?'#9b816d':'#625472';
    wall(background);floor(bus?'#677378':counter?'#8b7267':room?'#9a8475':'#736278');
    if(bus){
      for(const x of [-115,2,117])frame(x,146,-138,96,99,'#879191','#9ba5a4');
      for(const x of [-83,79]){
        box(61,15,29,'#7e6773',x,39,-66);
        box(60,52,8,'#9b7c88',x,67,-76);
      }
      bar('#a9ab98',[-183,176,-99],[183,176,-99],2);
    }else if(counter){
      box(324,38,42,'#926f61',0,44,-99);
      frame(0,143,-139,210,45,'#a3866d','#b79c80');
      for(let i=0;i<12;i++)box(10,20+i%3*3,7,i%2?'#b3906d':'#96a793',(i-5.5)*24,74,-98);
    }else if(street){
      for(let i=0;i<9;i++){
        const x=(i-4)*52;
        box(48,140+i%3*22,3,i%2?'#817384':'#746a74',x,83,-177);
        frame(x,91,-173,18,52,'#8c7479','#af8d7d');
      }
      ruledFloor('#8e7979');
    }else if(laundry){
      for(let i=0;i<6;i++){
        const x=(i-2.5)*58;
        box(52,65,28,'#b0ab96',x,39,-103);
        oval('#766f6b',x,40,-88,17,18,3);
        oval('#92918a',x,40,-85,12,13,2);
      }
      frame(0,152,-168,133,63,'#93998b','#b6b9a9');
    }else if(room){
      sofa(-63,-87,'#aa9281','#a18470');
      frame(79,145,-128,63,92,'#8e786e','#b5aa9a');
    }else{
      for(let i=0;i<16;i++)box(12,205,2,i%2?'#8f668b':'#715b7a',(i-7.5)*31,111,-169);
      lights('#c1a1cf','#c997a1');
    }
  }

  return {root,background,features,animate};
}
