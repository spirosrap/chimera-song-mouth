import * as THREE from 'three';
import type { VarietySetting, VarietyView } from '../../scene/variety-videos.ts';
import { VideoProps, type VideoPoint } from './videoProps.ts';

export const VARIETY_WARDROBE = {
  dogdays:{jackets:['#c6a28e','#5f7caa','#5d78a2','#ad7154','#896b81','#c7926a'], hair:['#a65e47','#403546']},
  grimesoblivion:{jackets:['#4b4963','#85777b','#43596c','#618478'], hair:['#be9f83','#513b37']},
  britneytoxic:{jackets:['#7aaabd','#4a586e','#a36273','#ae8fa2'], hair:['#dec79a','#554046']},
  gorillazdare:{jackets:['#8e5e7f','#526e67','#796d8c','#4f6175'], hair:['#3f3747','#5e4b37']},
  mgmtelectric:{jackets:['#899473','#b88760','#886780','#668b84','#b7857c'], hair:['#513b37','#6d5240']},
  passionwalk:{jackets:['#88796a','#708455','#5f7c8b'], hair:['#51423b','#6f5845']},
  loveshack:{jackets:['#b57075','#64a29a','#b68b63','#9378a1','#748dae','#bfab71'], hair:['#453542','#a58462','#b98059']},
};

export const VARIETY_FIGURES:Record<VarietySetting,number> = {
  dogdays:6, grimesoblivion:4, britneytoxic:4, gorillazdare:4, mgmtelectric:5, passionwalk:3, loveshack:6,
};

export function buildVarietySet(p:VideoProps, setting:VarietySetting, view:VarietyView) {
  const root=new THREE.Group();
  const features:THREE.Object3D[]=[];
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>p.box(root,w,h,d,c,[x,y,z]);
  const oval=(c:string,x:number,y:number,z:number,a:number,b:number,d:number)=>p.oval(root,[x,y,z],[a,b,d],c);
  const rail=(c:string,a:VideoPoint,b:VideoPoint,r=1.1)=>p.tube(root,a,b,r,c);
  const wall=(c:string)=>box(1110,455,4,c,0,208,-252);
  const floor=(c:string)=>box(1450,1.5,1056,c,0,-1,-320);
  const trim=(x:number,y:number,z:number,w:number,h:number,outer:string,inside:string)=>{
    box(w+6,h+6,4,outer,x,y,z);
    box(w,h,1.15,inside,x,y,z+2.4);
  };
  const lamp=(x:number,y:number,z:number,c:string,r=5)=>{
    oval('#484251',x,y,z-2,r*1.25,r*1.25,3);
    features.push(oval(c,x,y,z,r,r,2.7));
  };
  const rowLights=(a:string,b:string,y=192,z=-143)=>{
    for(let i=0;i<9;i++)lamp((i-4)*42,y+i%2*12,z,i%2?a:b);
  };
  let background:string;
  let animate:((time:number)=>void)|undefined;

  if(setting==='dogdays'){
    const blue=view.includes('blue'), copper=view.includes('copper'), drums=view.includes('drums'), finale=view.endsWith('finale');
    background=blue?'#879bb6':copper?'#c0a397':'#d4cfc2';
    wall(background);floor(blue?'#aab6c0':'#c5bbb2');
    for(let i=0;i<9;i++)box(3,188,2,i%2?'#b6b1b2':'#c3bcaf',(i-4)*51,106,-166);
    if(drums||copper){
      for(const [i,x] of [-141,-70,79,146].entries()){
        oval(i%2?'#a17062':'#9b7780',x,39,-95,23,26,12);
        oval('#dfc69f',x,42,-81,19,21,2.4);
        rail('#928572',[x,0,-96],[x,60,-96],1.6);
        oval('#c3a478',x,67,-96,18,2,13);
      }
    }
    if(blue||finale){
      const colors=['#b186a8','#7e9dbb','#d6ab84','#c18389'];
      for(let i=0;i<20;i++){
        const x=(i%10-4.5)*37;
        const plume=oval(colors[i%colors.length],x,86+Math.floor(i/10)*74+i%3*12,-119-i%4*6,13+i%4*3,18+i%3*3,4.5);
        (plume.material as THREE.MeshBasicMaterial).setValues({transparent:true,opacity:.16,depthWrite:false});
        features.push(plume);
      }
    }
  }else if(setting==='grimesoblivion'){
    const lockers=/locker|aisle/.test(view), night=/night|finale/.test(view);
    background=lockers?'#738083':night?'#3d475f':'#657983';
    wall(background);floor(lockers?'#6c776f':night?'#4c586b':'#5e7468');
    if(lockers){
      for(let i=0;i<13;i++){
        const x=(i-6)*36;
        trim(x,104,-152,31,156,'#87908a',i%2?'#82928e':'#73867f');
        for(const y of [132,138,144])box(12,1.5,1,'#5e716c',x,y,-148);
      }
      for(let i=0;i<5;i++)box(54,2.7,7,'#b1c1b7',(i-2)*77,188,-105);
    }else{
      for(let i=0;i<8;i++)box(474,7.7,23,i%2?'#718288':'#5e737c',0,6+i*11,-80-i*15);
      rail('#a3a19a',[-233,99,-168],[233,99,-168],2.6);
      for(let i=0;i<7;i++)rail('#627681',[(i-3)*69,0,-169],[(i-3)*69,99,-169],1.2);
      rowLights(night?'#b7afda':'#c9d4c2','#a0b4bb');
    }
  }else if(setting==='britneytoxic'){
    const cabin=view.includes('cabin'), chrome=view.includes('chrome'), red=/red|passage|finale/.test(view);
    background=cabin?'#65849a':chrome?'#828b9c':red?'#784553':'#4f596f';
    wall(background);floor(cabin?'#7c8c9a':chrome?'#9099a3':red?'#794f5e':'#647081');
    if(cabin){
      for(const sign of [-1,1])for(let i=0;i<4;i++){
        const x=sign*(65+i*33),z=-55-i*36;
        box(40,48,23,'#8389a4',x,37,z);
        box(37,25,13,'#8b93b1',x,63,z-3);
      }
      for(let i=0;i<7;i++){
        oval('#8b9eb6',(i-3)*53,142,-158,21,27,3);
        oval('#b0c3d2',(i-3)*53,142,-154,16,22,2);
      }
    }else if(red){
      for(let i=0;i<6;i++){
        const z=-231+i*28,x=83+i*18;
        for(const side of [-1,1])box(6,178,8,'#ad6777',x*side,90,z);
        box(x*2,6,6,i%2?'#a56b80':'#c18895',0,180,z);
      }
      rowLights('#d598b0','#e0adaf');
    }else{
      for(let i=0;i<11;i++){
        const x=(i-5)*44,h=112+i%4*24;
        box(39,h,4,chrome?'#a1acb4':'#6a748d',x,h/2,-158);
        for(let j=1;j<=4;j++)box(19,2.2,1,chrome?'#c9c9c4':'#96a5be',x,j*26,-154);
      }
      rowLights('#a9b4d9','#c2bdcc');
    }
  }else if(setting==='gorillazdare'){
    const stairs=view.includes('stairs'), guest=/guest|finale/.test(view);
    background=stairs?'#6b6279':guest?'#5e586b':'#725a78';
    wall(background);floor(stairs?'#797182':'#887383');
    if(stairs){
      for(let i=0;i<10;i++)box(144,9,18,i%2?'#918192':'#776880',55,6+i*9,-49-i*14);
      rail('#b099a6',[-24,30,-50],[-24,127,-186],2.2);
    }else{
      trim(-106,123,-152,61,104,'#98788d','#a28e9f');
      box(77,37,19,'#806877',-100,40,-98);
      for(let i=0;i<7;i++)box(35,1.0,31,i%2?'#937f91':'#74647f',(i-3)*44,.15,-52+(i%2)*38);
      if(guest){
        oval('#7d716d',82,149,-112,41,47,13);
        for(const x of [69,95])oval('#bfb39d',x,157,-99,9,6,4);
        oval('#564653',82,127,-98,18,7.3,3);
        lamp(80,202,-127,'#bba6be',9);
      }else{
        for(const [i,x] of [-88,91].entries()){
          box(39,48,18,'#625b76',x,40,-106);
          oval(i?'#a8909f':'#848199',x,40,-95,13,13,3);
        }
      }
    }
  }else if(setting==='mgmtelectric'){
    const moon=view.includes('moon'), party=/party|dance|finale/.test(view);
    background=moon?'#4c596b':party?'#4f4a62':'#455b54';
    wall(background);floor(party?'#58625b':'#556959');
    for(let i=0;i<15;i++){
      const x=(i-7)*34,z=-193+i%4*17;
      rail(i%2?'#646454':'#516252',[x,0,z],[x+10,213,z-5],2.8+i%2);
      oval(i%2?'#788069':'#5f7865',x,192+i%3*15,z,31,22,7);
    }
    oval(moon?'#d0c297':'#a6b796',95,174,-177,28,28,4);
    rowLights('#d89da2','#a1b4b0',142,-103);
    if(party)for(let i=0;i<23;i++){
      features.push(oval(i%2?'#bdb186':'#97afa3',(i%12-5.5)*36,57+Math.floor(i/12)*55+i%4*12,-124-i%5*9,2.9,3.3,1.7));
    }
  }else if(setting==='passionwalk'){
    const tower=view.includes('towers'), street=/street|finale/.test(view);
    background=tower?'#7797a9':street?'#9b8c7b':'#82977b';
    wall(background);floor(tower?'#8699a2':street?'#8d8074':'#839770');
    if(tower){
      for(let i=0;i<10;i++){
        const x=(i-4.5)*52,h=102+i%4*32;
        box(48,h,10,i%2?'#809ba7':'#93a8ad',x,h*.5,-181);
        for(let y=19;y<h;y+=23)box(45,1.4,1,'#b8c1ba',x,y,-174);
      }
    }else if(street){
      for(let i=0;i<8;i++){
        const x=(i-3.5)*64;
        box(58,83+i%2*19,8,i%2?'#b8a38b':'#a78f7c',x,46,-153);
        trim(x,51,-147,22,36,'#aa9179','#c4b6a0');
      }
      for(let i=0;i<6;i++)box(4,1,22,'#bfb29b',0,.25,-138+i*43);
    }else{
      for(let i=0;i<11;i++){
        const x=(i-5)*41;
        rail('#7e755d',[x,0,-144],[x-4,125+i%3*23,-153],2.8);
        oval('#9ca77d',x,120+i%3*23,-149,24,25,7);
      }
    }
    const ball=oval('#6e99aa',-104,15,-53,12,12,10);
    animate=time=>{
      ball.position.x=113*Math.sin(time*.7);
      ball.position.y=13+30*Math.abs(Math.sin(time*3.6));
    };
  }else{
    const outside=/road|front|porch/.test(view);
    background=outside?'#9c926f':'#855c75';
    wall(background);floor(outside?'#9b8a6d':'#997486');
    if(outside){
      box(284,114,16,'#b1a076',0,65,-163);
      const roof=box(313,22,32,'#8d7867',0,122,-159);
      roof.rotation.z=-.036;
      for(const x of [-100,91])trim(x,68,-151,50,62,'#977d6d','#8fa698');
      trim(0,55,-150,47,100,'#a48c6d','#8c796b');
      if(view.includes('road')){
        box(145,24,49,'#a65968',-100,32,-67);
        trim(-113,48,-63,50,13,'#7c5867','#a3a2a5');
        for(const x of [-152,-54])oval('#514451',x,21,-38,14,14,3.8);
      }
    }else{
      const shades=['#b5899a','#c49776','#9ea68b','#a48eaa'];
      for(let i=0;i<15;i++)box(11,190,1.8,shades[i%shades.length],(i-7)*31,107,-166);
      for(let i=0;i<9;i++)lamp((i-4)*44,187+i%3*10,-119,i%2?'#e0bb88':'#bc9fd1',6.2);
      for(let i=0;i<10;i++)box(30,.8,20,shades[i%shades.length],(i-4.5)*42,.3,-43+i%2*36);
    }
  }

  return {root,background,features,animate};
}
