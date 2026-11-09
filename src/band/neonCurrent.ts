import type { Arrangement, BandPart, VocalEffects } from "./types.ts";
import type { MelodyNote } from "../song/melody.ts";

/** Original melodic breakbeat composition. Every dry sound is a CHIMERA mouth. */
export function neonCurrentBand():Arrangement {
  const bpm=128,beat=60/bpm,bar=4*beat,duration=96*bar+3;
  const source="Original wordless electronic composition · processed simulated voices";
  const note=(midi:number,b:number,length:number):MelodyNote=>({midi,start:b*beat,duration:length*beat});
  const chords=[
    {root:41,tones:[65,68,72,75]}, // F minor / added ninth in the lead
    {root:37,tones:[65,68,73,77]},
    {root:44,tones:[63,68,72,75]},
    {root:39,tones:[63,67,70,77]},
  ];
  const hook:MelodyNote[]=[],arp:MelodyNote[]=[],answer:MelodyNote[]=[],high:MelodyNote[]=[],low:MelodyNote[]=[],bass:MelodyNote[]=[];
  const drums:NonNullable<BandPart['beats']>=[],hats:NonNullable<BandPart['beats']>=[];
  const broken=(b:number)=>b>=8&&b<48||b>=64&&b<92;
  const dropping=(b:number)=>b>=32&&b<48||b>=72&&b<88;
  for(let b=0;b<96;b++){
    const t=b*4,c=chords[Math.floor(b/2)%4],drop=dropping(b),build=b>=64&&b<72;
    if(b%2===0){
      high.push(note(c.tones[2],t,7.7));low.push(note(c.tones[0]-12,t+.08,7.65));
    }
    if(b>=4&&(b<48||b>=64)){
      const positions=[0,.75,1.5,2.75];
      const motif=b%2===0?[0,2,1,3]:[2,1,0,1];
      positions.forEach((p,i)=>hook.push(note(c.tones[motif[(i+Math.floor(b/8))%4]],t+p,[.48,.22,.3,.72][i])));
      if(drop&&b%4===3)hook.push(note(c.tones[1]+12,t+3.65,.18));
    }
    if(b<48||b>=56){
      const dense=drop||build||b>=16&&b<32;
      const count=dense?16:8;
      const motif=[0,2,1,3,2,0,3,1];
      for(let p=0;p<count;p++){
        const step=4/count;
        arp.push(note(c.tones[motif[(p+Math.floor(b/4))%8]]+(b%8===7&&p>=count-2?12:0),t+p*step,step*.72));
      }
    }
    if(drop||b>=16&&b<24||b>=52&&b<64){
      for(const p of [1.25,2.5,3.5])answer.push(note(c.tones[(Math.floor(p)+b)%4]-12,t+p,drop?.23:.55));
    }
    if(b>=4&&b<48||b>=64&&b<94){
      const positions=[.12,.75,1.5,2.5,3.25],interval=[0,0,12,7,0];
      positions.forEach((p,i)=>bass.push(note(c.root+interval[i],t+p,[.42,.22,.38,.35,.35][i])));
    }else if(b>=52&&b<64){bass.push(note(c.root,t+.25,2.8));}
    if(broken(b)){
      const kicks=drop?[0,1.5,2.5,3.25]:[0,2.5];
      for(const p of kicks)drums.push({time:(t+p)*beat,id:"B",accent:drop?1:.85});
      for(const p of [1,3])drums.push({time:(t+p)*beat,id:"Pf",accent:drop?1:.8});
      if(build&&b>=70)for(const p of [3.25,3.5,3.75])drums.push({time:(t+p)*beat,id:"K",accent:.7});
    }
    if(b>=4&&b<48||b>=60&&b<94){
      const count=build&&b>=70?16:8;
      for(let p=0;p<count;p++)hats.push({time:(t+p*4/count)*beat,id:p%4===3?"tss":"t",accent:p%2?.7:.4});
    }
  }
  const keys=(points:[number,number,number][])=>points.map(([b,cutoffHz,level])=>({time:b*bar,cutoffHz,level}));
  const energy=keys([[0,800,.3],[8,3000,.85],[24,6000,1],[31.75,8500,1],[31.92,800,.05],[32,9000,1],[48,650,.2],[56,1300,.35],[64,1100,.4],[71.75,9000,1],[71.92,700,.05],[72,10000,1],[88,5500,.85],[96,400,0]]);
  const pads=keys([[0,650,.75],[8,1500,.7],[24,3200,.85],[32,4800,.8],[48,1100,1],[56,2600,.9],[64,1200,.65],[72,5500,.85],[88,2200,.75],[96,300,0]]);
  const fx=(extra:Partial<VocalEffects>={}):VocalEffects=>({bpm,highpassHz:100,lowpassHz:7000,delayBeats:.75,delayMix:.28,feedback:.32,pump:.64,drive:1.3,automation:energy,fadeOut:2.5,...extra});
  const melody=(name:string,notes:MelodyNote[],vowel:string)=>({name,notes,duration,lyrics:vowel,source});
  const parts:BandPart[]=[
    {id:"lead",name:"Pulse hook",role:"Chopped vowel melody",body:{female:.8,child:0},volume:.9,pan:0,vibrato:0,voice:{breathiness:.025,brightness:.8},effects:fx({delayMix:.36,pump:.55}),melody:melody("Pulse hook",hook,"ah")},
    {id:"arp",name:"Glass arpeggio",role:"Sixteenth-note vocal shimmer",body:{female:1,child:0},volume:.9,pan:-.55,vibrato:0,voice:{breathiness:.05,brightness:.9},effects:fx({delayBeats:.5,delayMix:.42,highpassHz:320,pump:.7}),melody:melody("Glass arpeggio",arp,"ooh")},
    {id:"answer",name:"Counter pulses",role:"Syncopated low answers",body:{female:.25,child:0},volume:.52,pan:.5,vibrato:0,effects:fx({delayBeats:1.5,delayMix:.32,lowpassHz:4000,pump:.6}),melody:melody("Counter pulses",answer,"oh")},
    {id:"high",name:"Air choir",role:"High wordless chord cloud",body:{female:.95,child:0},volume:.2,pan:.65,vibrato:0,voice:{breathiness:.18,brightness:.5},effects:fx({automation:pads,highpassHz:220,delayBeats:1.5,delayMix:.4,feedback:.4,pump:.75}),melody:melody("Air choir",high,"ooh")},
    {id:"low",name:"Warm choir",role:"Pulsing lower harmony",body:{female:.4,child:0},volume:.22,pan:-.65,vibrato:0,voice:{breathiness:.08,brightness:.35},effects:fx({automation:pads,highpassHz:100,delayMix:.22,pump:.78,drive:1.5}),melody:melody("Warm choir",low,"ah")},
    {id:"bass",name:"Vowel bass",role:"Rolling rounded sub voice",body:{female:0,child:0},volume:.8,pan:0,vibrato:0,voice:{breathiness:.01,brightness:.25,tension:.6},effects:{bpm,highpassHz:28,lowpassHz:480,pump:.78,drive:1.8,automation:[{time:0,cutoffHz:480,level:3}],fadeOut:2.5},melody:melody("Vowel bass",bass,"ooh")},
    {id:"drums",name:"Mouth breakbeat",role:"Kick, snare and build rolls",body:{female:.1,child:0},volume:1.7,pan:0,beats:drums,effects:{bpm,highpassHz:35,lowpassHz:10000,drive:1.3,fadeOut:2.5}},
    {id:"hats",name:"Breath percussion",role:"Offbeat hats and shuffles",body:{female:.15,child:0},volume:1.05,pan:.25,beats:hats,effects:{bpm,highpassHz:1500,lowpassHz:12000,delayBeats:.75,delayMix:.18,feedback:.2,drive:1,fadeOut:2.5}},
  ];
  return {title:"Neon Current",description:"An original 3:03 wordless electronic track. Eight simulated voices become pulsing hooks, rolling bass, shimmering arpeggios, warm chord clouds and a broken mouth beat, with two drops and a spacious breakdown.",bpm,duration,wordless:true,parts,
    sections:[{name:"Air intro",time:0},{name:"Rolling groove",time:8*bar},{name:"First lift",time:24*bar},{name:"Drop",time:32*bar},{name:"Breakdown",time:48*bar},{name:"Build",time:64*bar},{name:"Final drop",time:72*bar},{name:"Afterglow",time:88*bar}]};
}
