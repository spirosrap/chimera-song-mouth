import * as THREE from 'three';
import type { PopSetting, PopView } from '../../scene/pop-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const POP_WARDROBE = {
  daftworld:{jackets:['#9695a5','#b0858c','#858e75','#777a99','#9c756a','#a19a71'],hair:['#646576','#544d62']},
  deeegroove:{jackets:['#a75286','#637b9b','#9d995e','#b87661','#8e62a2','#62a39d'],hair:['#73483e','#4d3b4d']},
  coffeetv:{jackets:['#8b726b','#627b77','#6e6a83','#928775'],hair:['#5a4742','#594a43']},
  kyliemirror:{jackets:['#a16d83','#a16d83','#a16d83','#a16d83','#a16d83'],hair:['#c3a87d','#bd9f78']},
  soquiet:{jackets:['#8a705d','#a37788','#74989a','#6a7d8d','#9c916b'],hair:['#433b45','#705345']},
  missyrain:{jackets:['#4f475a','#655971','#715b70','#6d7e83','#a57c79'],hair:['#423448','#504354']},
  favouritegame:{jackets:['#78636b','#665463','#958378'],hair:['#b6a181','#80685e']},
};
export const POP_FIGURES:Record<PopSetting,number> = {
  daftworld:7, deeegroove:6, coffeetv:4, kyliemirror:5, soquiet:5, missyrain:5, favouritegame:3,
};

export function buildPopSet(p:VideoProps, setting:PopSetting, view:PopView) {
  const root=new THREE.Group();
  const features:THREE.Object3D[]=[];
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>p.box(root,w,h,d,c,[x,y,z]);
  const oval=(c:string,x:number,y:number,z:number,a:number,b:number,d:number)=>p.oval(root,[x,y,z],[a,b,d],c);
  const beam=(c:string,a:VideoPoint,b:VideoPoint,r=1.1)=>p.tube(root,a,b,r,c);
  const wall=(c:string)=>box(1100,460,3,c,0,221,-252);
  const floor=(c:string)=>box(1440,1.5,1030,c,0,-1,-309);
  const stripes=(x:number,y:number,z:number,colors:string[])=>{
    for(let i=0;i<8;i++)box(8,15,21,colors[i%colors.length],x+(i-3.5)*8,y,z);
  };
  let background:string;
  let animate:((time:number)=>void)|undefined;

  if(setting==='daftworld'){
    const tiers=/stairs|tier|finale/.test(view);
    background=tiers?'#555870':'#4a4761';
    wall(background);floor('#666175');
    const colors=['#9a82a3','#899eb4','#aa807a','#a59a7d','#849c92'];
    const ink=p.ink(root);
    ink.begin();
    for(let i=0;i<5;i++){
      const r=48+i*27;
      p.ring(ink,[0,.4,-47],[r,0,0],[0,0,r*.64],colors[i],2);
    }
    ink.end();
    for(let step=0;step<6;step++){
      const z=-160-step*7;
      box(350-step*16,4,14,colors[step%colors.length],0,11+step*6,z);
    }
    for(let i=0;i<17;i++){
      const x=(i-8)*27;
      features.push(oval(colors[i%colors.length],x,163+i%3*11,-128,4.4,4.5,2.6));
      if(tiers)box(6,110+i%4*17,4,'#777084',x,63,-170);
    }
  }else if(setting==='deeegroove'){
    const records=/records|disc/.test(view);
    background=records?'#6c617c':'#765b79';
    wall(background);floor('#8c7188');
    const colors=['#c0729a','#b69a68','#81a78d','#8b90bf','#bf836d'];
    const ink=p.ink(root);
    ink.begin();
    for(let i=0;i<9;i++){
      const x=(i-4)*49, y=78+(i%3)*43, z=-152-i%3*12, r=13+i%4*7;
      oval(colors[i%colors.length],x,y,z,r,r*.92,4);
      p.ring(ink,[x,y,z+5],[r*.8,0,0],[0,r*.75,0],colors[(i+2)%colors.length],2);
      p.ring(ink,[x,y,z+5],[r*.47,0,0],[0,r*.46,0],'#c5aab3',1.5);
    }
    ink.end();
    for(let i=0;i<24;i++){
      const color=colors[i%colors.length];
      const accent=box(15+i%3*6,11+i%4*5,3,color,(i%12-5.5)*36,41+Math.floor(i/12)*120+i%4*11,-114-i%5*8);
      accent.rotation.z=(i%5-2)*.26;
      features.push(accent);
    }
  }else if(setting==='coffeetv'){
    const interior=/kitchen|rehearsal/.test(view);
    background=interior?'#9b8b7c':'#80908c';
    wall(background);floor(interior?'#a28b77':'#858f87');
    for(let i=0;i<9;i++){
      const x=(i-4)*51;
      box(47,119+i%3*15,4,interior?'#ab9787':'#9aa39c',x,66,-156);
      box(34,39,2,interior?'#887d7a':'#788a8b',x,91,-151);
      box(41,3,3,interior?'#c0ab95':'#b0aea2',x,72,-148);
    }
    if(view.includes('shelter')){
      for(const x of [-116,118])beam('#677d81',[x,0,-112],[x,155,-112],3);
      box(252,8,26,'#8e9e9b',0,161,-120);
    }
    const carton=new THREE.Group();
    root.add(carton);
    p.box(carton,29,36,22,'#d0c6ae',[0,25,0]);
    const lid=p.box(carton,30,9,21,'#9cae9d',[0,45,0]);lid.rotation.z=.12;
    p.box(carton,27,7,1.5,'#6e91a2',[0,17,11.6]);
    for(const x of [-6,6])p.oval(carton,[x,32,11.7],[1.7,1.8,.8],'#5c5458');
    p.box(carton,8,1.8,1.5,'#8d727c',[0,24,11.8]);
    for(const x of [-9,9])p.tube(carton,[x,8,2],[x,0,7],1.6,'#5b555e');
    const showCarton=/carton|pavement|shelter/.test(view);
    carton.position.set(showCarton?72:-131,0,-42);
    animate=time=>{
      carton.position.x=(showCarton?72:-131)+16*Math.sin(time*.51);
      carton.position.y=(showCarton?5:0)*Math.abs(Math.sin(time*3));
    };
  }else if(setting==='kyliemirror'||setting==='soquiet'){
    const quiet=setting==='soquiet';
    const workshop=quiet&&/garage|whisper/.test(view);
    background=workshop?'#888b7e':quiet?'#a29b84':'#a09288';
    wall(background);floor(workshop?'#8a8378':'#8a8582');
    for(let i=0;i<8;i++){
      const x=(i-3.5)*60, height=103+i%3*19;
      box(55,height,9,workshop?'#a5a293':i%2?'#a5938d':'#b6a397',x,height*.5,-152);
      box(36,46,3,workshop?'#7f8380':i%2?'#8c9194':'#879da0',x,69,-145);
      box(42,5,3,'#bdb09d',x,49,-143);
      if((!quiet&&/awning|street|loop/.test(view))||(quiet&&view.includes('storefront'))){
        stripes(x,117,-135,quiet?['#a6807d','#c0aa98']:['#966e7e','#c6ac98']);
      }
    }
    if(/crosswalk|dance|finale/.test(view)){
      for(let i=0;i<11;i++)box(16,.42,49,'#aba69b',(i-5)*28,.05,-23);
    }
    if(quiet&&/umbrella|dance|finale/.test(view)){
      const colors=['#b79683','#b48da4','#a2aeb0','#b9ae7d'];
      for(const [i,x] of [-147,-71,78,148].entries()){
        const y=125+i%2*27, z=-106;
        oval(colors[i],x,y,z,26,7.5,13);
        beam('#7d757d',[x,y,z],[x,y-44,z],1.4);
      }
    }
  }else if(setting==='missyrain'){
    const storm=/glass|finale/.test(view);
    background=storm?'#586777':'#514b61';
    wall(background);floor(storm?'#657380':'#675e72');
    const ink=p.ink(root);
    ink.begin();
    for(let i=0;i<6;i++){
      const r=28+i*24;
      p.ring(ink,[0,119,-146],[r,0,0],[0,r*.64,0],i%2?'#8790a7':'#a883a1',2);
    }
    ink.end();
    const drops:THREE.Object3D[]=[];
    for(let i=0;i<28;i++){
      const x=(i%14-6.5)*30, y=35+Math.floor(i/14)*81+i%6*13;
      const dot=oval(storm?'#a3b0b8':'#907f9b',x,y,-98-i%4*9,storm?1.35:2.4,storm?8:2.8,1.5);
      drops.push(dot);
      features.push(dot);
    }
    if(storm)animate=time=>{
      for(const [i,drop] of drops.entries())drop.position.y=25+(199+(i*41-time*(39+i%3*4))%178)%178;
    };
  }else{
    const car=/convertible|nina|finale/.test(view);
    background=car?'#a88f7e':'#ac9b85';
    wall(background);floor('#918679');
    for(let i=0;i<20;i++){
      const x=(i-9.5)*26,y=30+i%4*8,z=-169-i%3*9;
      oval(i%2?'#a28a75':'#b39a80',x,y,z,34+i%3*8,16+i%4*9,4);
    }
    for(let i=0;i<8;i++)box(4,.4,24,'#bfaa86',25,.02,-175+i*38);
    if(car){
      box(154,20,45,'#66545c',-77,25,-68);
      box(84,8,44,'#84707a',-81,40,-71);
      beam('#ac9189',[-127,46,-60],[-117,70,-70],2);
      beam('#ac9189',[-58,46,-60],[-48,70,-70],2);
      beam('#ac9189',[-117,70,-70],[-48,70,-70],2);
      for(const x of [-127,-29])oval('#49464d',x,20,-44,13,13,3.4);
    }
  }
  return {root,background,features,animate};
}
