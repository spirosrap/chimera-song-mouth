import type { Arrangement, BandPart, BeatHit, VocalEffects } from "./types.ts";
import type { MelodyNote } from "../song/melody.ts";

interface Chord { root:number; pad:[number,number,number]; arp:[number,number,number,number] }
const F:Chord={root:41,pad:[57,60,64],arp:[65,69,72,76]};
const G:Chord={root:43,pad:[59,62,64],arp:[67,71,74,76]};
const Am:Chord={root:45,pad:[60,64,67],arp:[69,72,76,79]};
const Em:Chord={root:40,pad:[59,62,67],arp:[64,67,71,74]};
const Dm:Chord={root:38,pad:[57,60,65],arp:[62,65,69,76]};
const C:Chord={root:48,pad:[55,62,64],arp:[64,67,72,74]};
const Gopen:Chord={root:43,pad:[55,59,62],arp:[62,67,71,74]};
const Cend:Chord={root:48,pad:[55,60,64],arp:[64,67,72,76]};

/** The night loop the hook lives in, and the warmer loop that the lone voice brings with it. */
const NIGHT=[F,G,Am,Em],WARM=[Dm,F,C,Gopen];
export const SMALL_HOURS_BARS=112;
/** One chord every two bars. The same five-note hook is heard over all of them. */
export function smallHoursChord(bar:number):Chord{
  const slot=Math.floor(bar/2);
  if(bar>=104)return [F,G,Cend,Cend][Math.min(3,slot-52)];
  if(bar>=96)return WARM[slot%4];
  if(bar>=72&&bar<80)return [Am,G,Em,Em][slot-36];
  if(bar>=56&&bar<72)return WARM[slot%4];
  return NIGHT[slot%4];
}

/** [midi, sixteenth step in the bar, length in steps] */
type Step=[number,number,number];
const HOOK:Step[][]=[
  [[76,0,3],[74,3,3],[72,6,2],[69,8,5],[72,14,2]],
  [[74,0,3],[76,3,3],[79,6,2],[76,8,6]],
  [[76,0,3],[74,3,3],[72,6,2],[74,8,5],[69,14,2]],
  [[72,0,3],[69,3,3],[67,6,2],[69,8,7]],
];
const CHOP:Step[][]=[
  [[69,2,1],[69,5,1],[67,11,1],[69,13,2]],
  [[72,2,1],[69,5,1],[67,8,2],[64,11,1],[69,14,1],[69,15,1]],
];
/** [midi, beat from the passage's first bar, beats, sustained from the previous note] */
type Line=[number,number,number,boolean?];
const ALONE_FIRST:Line[]=[
  [69,0,3],[72,3,1,true],[76,4,3.5,true],
  [74,8,1.5],[72,9.5,1.5,true],[69,11,4,true],
  [67,16,2],[72,18,2,true],[74,20,3,true],[76,23,1,true],[74,24,5.5,true],
];
const ALONE_SECOND:Line[]=[
  [76,0,3],[77,3,1,true],[79,4,3.5,true],
  [76,8,1.5],[74,9.5,1.5,true],[72,11,3,true],[69,14,1.5,true],
  [67,16,2],[72,18,2,true],[76,20,2,true],
];
const ALONE_DESCANT:Line[]=[[72,0,4],[76,4,4,true],[74,8,4],[79,12,4,true],[76,16,6],[74,22,2,true],[71,24,7]];
const ALONE_DAWN:Line[]=[[69,0,2],[72,2,2,true],[76,4,3.5,true],[74,8,3],[71,11,4.5,true],[72,16,2],[74,18,2,true],[76,20,10,true]];

/** Original melodic breakbeat composition. Every dry sound is a CHIMERA mouth. */
export function smallHoursBand():Arrangement {
  const bpm=130,beat=60/bpm,bar=4*beat,BARS=SMALL_HOURS_BARS,duration=211;
  const source="Original wordless electronic composition · processed simulated voices";
  /** Off-beat sixteenths arrive late, as in two-step garage. */
  const SWING=.035;
  const at=(b:number,step:number)=>(b*4+step/4+(step%2?SWING:0))*beat;
  const sung=(notes:MelodyNote[],midi:number,b:number,step:number,length:number,gate=.92)=>notes.push({midi,start:at(b,step),duration:length/4*beat*gate});
  const lead:MelodyNote[]=[],chop:MelodyNote[]=[],arp:MelodyNote[]=[],alone:MelodyNote[]=[],bass:MelodyNote[]=[];
  const pads:[MelodyNote[],MelodyNote[],MelodyNote[]]=[[],[],[]];
  const kick:BeatHit[]=[],snare:BeatHit[]=[],hats:BeatHit[]=[],perc:BeatHit[]=[];
  const hit=(list:BeatHit[],b:number,step:number,id:string,accent:number)=>list.push({time:at(b,step),id,accent});
  const within=(b:number,from:number,to:number)=>b>=from&&b<to;
  const drop=(b:number)=>within(b,40,56)||within(b,80,104);
  const groove=(b:number)=>within(b,16,39)||drop(b);

  for(let b=0;b<BARS;b++){
    const chord=smallHoursChord(b),first=b===0||smallHoursChord(b-1)!==chord;
    // Choir: one breath per chord, so the three pad mouths open and close together.
    if(first){
      let bars=1;while(b+bars<BARS&&smallHoursChord(b+bars)===chord)bars++;
      chord.pad.forEach((midi,voice)=>pads[voice].push({midi:midi+(voice===2&&drop(b)?12:0),start:(b*4+voice*.06)*beat,duration:(bars*4-.35)*beat}));
    }

    // Hook: four bars long, unchanged while the harmony moves underneath it.
    const phrase=HOOK[b%4];
    if(within(b,12,16)||within(b,16,39)||drop(b))for(const [midi,step,length] of phrase)sung(lead,midi,b,step,length);
    else if(b===39)for(const [midi,step,length] of phrase.slice(0,3))sung(lead,midi,b,step,length);
    else if(within(b,76,79))for(const [midi,step,length] of HOOK[0].slice(0,3))sung(lead,midi,b,step,length);
    else if(b===79)for(const step of [0,2,4,6])sung(lead,76,b,step,1.5);
    else if(b===104||b===106)for(const [midi,step,length] of HOOK[b-104])sung(lead,midi,b,step,length);

    // Chopped answers, like a sample cut on the off-beats.
    if(within(b,4,8)||within(b,60,72)&&b%2===1)sung(chop,69,b,13,2);
    else if(within(b,24,39)||drop(b))for(const [midi,step,length] of CHOP[b%2])sung(chop,midi,b,step,length,.8);
    else if(b===78)for(let step=8;step<16;step++)sung(chop,69,b,step,1,.8);
    else if(b===79)[69,69,72,72,74,74,76,76].forEach((midi,step)=>sung(chop,midi,b,step,1,.8));

    // Arpeggio: grouped 3+3+2, thin at the edges of the night and full in the middle of it.
    const order=[0,1,2,0,1,2,3,2,0,1,3,0,1,3,2,1];
    const sparse=within(b,0,8)||within(b,64,72)||within(b,104,110),eighths=within(b,8,32);
    const full=within(b,32,56)||within(b,72,104);
    for(let step=0;step<16;step++){
      if(b===39&&step>=8||b===79&&step>=8)break;
      if(sparse&&![0,3,6,8,11,14].includes(step))continue;
      if(eighths&&step%2)continue;
      if(!sparse&&!eighths&&!full)continue;
      const rising=within(b,72,80),lift=b%8===7&&step>=12&&!rising;
      const tone=rising?chord.arp[step%4]:chord.arp[order[step]];
      sung(arp,Math.min(84,tone+(lift?12:0)),b,step,sparse?2:eighths?1.5:1,full?.85:.7);
    }

    // Bass: held under the quiet passages, syncopated against the kick under the loud ones.
    const r=chord.root;
    if(within(b,12,16)||within(b,64,76)||within(b,104,108))sung(bass,r,b,0,15);
    else if(within(b,108,112)){if(b===108)sung(bass,r,b,0,30);}
    else if(within(b,76,79))for(let step=0;step<16;step+=2)sung(bass,r,b,step,1.5);
    else if(b===39||b===79)for(const step of [0,3])sung(bass,r,b,step,2.5);
    else if(groove(b)){
      const line:Step[]=first?[[r,0,3],[r,3,2],[r+12,7,1],[r,10,3],[r+7,14,2]]:[[r,0,3],[r,6,2],[r,10,2],[r+12,13,1],[r+7,14,2]];
      for(const [midi,step,length] of line)sung(bass,midi,b,step,length,.85);
    }

    // Kick: two-step, then four to the bar for the builds and the last lift.
    const loud=drop(b)?1.05:.85,turn=b%4===3;
    if(b===39)for(const step of [0,4])hit(kick,b,step,"B",1);
    else if(b===78)for(let step=0;step<16;step+=2)hit(kick,b,step,"B",.9);
    else if(b===79)for(const step of [0,2,4,6])hit(kick,b,step,"B",1);
    else if(within(b,36,39)||within(b,72,78)||within(b,96,104))for(const step of turn&&b>=96?[0,4,8,12,14]:[0,4,8,12])hit(kick,b,step,"B",loud);
    else if(drop(b))for(const step of turn?[0,7,10,13]:[0,7,10])hit(kick,b,step,"B",step===7||step===13?.75:loud);
    else if(within(b,8,36)||within(b,104,108))for(const step of turn&&b>=16&&b<36?[0,7,10]:[0,10])hit(kick,b,step,"B",b>=104?.7:step===7?.65:loud);

    // Snare: backbeat with rimshot ghosts; the builds are rolls on the same mouth.
    if(b===39)for(let step=8;step<14;step++)hit(snare,b,step,"K",.5+.08*(step-8));
    else if(within(b,76,78))for(let step=0;step<16;step+=2)hit(snare,b,step,"K",.4+.5*((b-76)*16+step)/32);
    else if(b===78)for(let step=0;step<16;step++)hit(snare,b,step,"K",.55+.03*step);
    else if(b===79){for(let step=0;step<8;step++)hit(snare,b,step,"Pf",.7+.05*step);hit(snare,b,12,"^K",1);}
    else if(within(b,12,39)||drop(b)||within(b,72,76)||within(b,104,108)){
      const level=b>=104?.6:drop(b)?1:.85;
      hit(snare,b,4,"Pf",level);
      if(drop(b))hit(snare,b,9,"K",.42);
      hit(snare,b,12,"Pf",level);
      if(b%2===1&&groove(b))hit(snare,b,15,"K",.5);
    }

    // Hats: quiet on the beat, open on the off-beat, with late ghosts in between.
    if(within(b,64,72)||within(b,104,108))for(const step of [6,14])hit(hats,b,step,"tss",.32);
    else if(within(b,8,39)||drop(b)||within(b,72,78)){
      const ghosts=drop(b)?[5,9,13]:b>=16&&b<39?[9,13]:[];
      for(let step=0;step<16;step++){
        if(step%4===2)hit(hats,b,step,within(b,72,78)?"t":"tss",.75);
        else if(step%4===0)hit(hats,b,step,"t",.42);
        else if(ghosts.includes(step))hit(hats,b,step,"t",.3);
      }
    }

    // Small percussion: tongue clicks across the beat, a lip pop like a drip in the quiet part.
    if(b===40||b===80||b===96)hit(perc,b,0,"kch",1);
    if(within(b,24,39)||drop(b)){
      for(const step of [3,6,11])hit(perc,b,step,"!",step===6?.8:.6);
      if(b%2===1)hit(perc,b,14,"P!",.8);
    }else if(within(b,58,72)&&b%2===0)hit(perc,b,10,"P!",.6);
  }

  // The lone voice: unaccompanied by the beat first, then carried over the top of it.
  const passage=(line:Line[],b:number)=>line.forEach(([midi,from,length,hold])=>alone.push({midi,start:(b*4+from)*beat,duration:length*beat,...(hold?{hold:true}:{})}));
  passage(ALONE_FIRST,56);
  passage([...ALONE_SECOND,[74,22,6,true],[76,28,9.5,true]],64);
  passage(ALONE_DESCANT,88);
  passage([...ALONE_SECOND,[74,22,4,true],[79,26,5.5,true]],96);
  passage(ALONE_DAWN,104);

  const keys=(points:[number,number,number][])=>points.map(([b,cutoffHz,level])=>({time:b*bar,cutoffHz,level}));
  const energy=keys([[0,700,.3],[8,1400,.5],[16,3500,.85],[32,5000,.9],[39.5,9000,1],[39.9,700,.05],[40,9500,1],[55.5,8000,1],[56,900,.25],[64,1500,.4],[72,1200,.45],[79.5,9000,1],[79.9,700,.05],[80,10000,1],[104,6000,.8],[108,1500,.4],[112,400,0]]);
  const choir=keys([[0,700,.8],[8,1300,.75],[16,2400,.8],[39.5,3200,.85],[39.9,500,.05],[40,4500,.85],[55.5,4500,.85],[56,1400,1],[64,2600,1],[72,1500,.7],[79.5,6000,.9],[79.9,500,.05],[80,5500,.85],[104,2500,.9],[110,900,.6],[113,300,0]]);
  const low=keys([[0,480,3],[39.5,480,3],[39.9,300,.2],[40,480,3],[56,480,3],[57,480,1.8],[76,480,1.8],[77,480,3],[79.5,480,3],[79.9,300,.2],[80,480,3],[104,480,3],[105,480,1.8],[113,480,1.8]]);
  const fx=(extra:Partial<VocalEffects>={}):VocalEffects=>({bpm,highpassHz:100,lowpassHz:7000,delayBeats:.75,delayMix:.28,feedback:.32,pump:.5,drive:1.3,automation:energy,fadeOut:3,...extra});
  /** Percussion is driven into the limiter, as in the other electronic songs, so the beat carries. */
  const drumFx=(level:number,extra:Partial<VocalEffects>={}):VocalEffects=>{const fx={bpm,highpassHz:35,lowpassHz:10000,drive:1.2,fadeOut:3,...extra};return {...fx,automation:[{time:0,cutoffHz:fx.lowpassHz,level}]};};
  const melody=(name:string,notes:MelodyNote[],syllable:string)=>({name,notes,duration,lyrics:syllable,source});
  const parts:BandPart[]=[
    {id:"lead",name:"Hook · ah",role:"Five notes that never change",body:{female:.8,child:0},volume:.53,pan:0,vibrato:0,voice:{breathiness:.03,brightness:.75},effects:fx({delayMix:.34}),melody:melody("Hook",lead,"ah")},
    {id:"alone",name:"Lone voice · oh",role:"The slow melody of the breakdown, sung again over the last lift",body:{female:.92,child:0},volume:.43,pan:.1,vibrato:14,voice:{breathiness:.14,brightness:.55},effects:{bpm,highpassHz:140,lowpassHz:6500,delayBeats:1.5,delayMix:.34,feedback:.4,pump:.2,drive:1.1,fadeOut:3},melody:melody("Lone voice",alone,"oh")},
    {id:"chop",name:"Chops · hey",role:"Off-beat answers and the stutter before the drop",body:{female:.45,child:0},volume:.42,pan:.42,vibrato:0,voice:{breathiness:.06,brightness:.6},effects:fx({delayBeats:1.5,delayMix:.36,lowpassHz:5000}),melody:melody("Chops",chop,"hey")},
    {id:"arp",name:"Arpeggio · dee",role:"Plucked chord tones in threes and twos",body:{female:1,child:0},volume:.66,pan:-.5,vibrato:0,voice:{breathiness:.05,brightness:.9},effects:fx({delayBeats:.5,delayMix:.4,highpassHz:320,pump:.6}),melody:melody("Arpeggio",arp,"dee")},
    {id:"pad-high",name:"High choir · ooh",role:"Top of the chord, an octave up in the drops",body:{female:.95,child:0},volume:.17,pan:.65,vibrato:0,voice:{breathiness:.18,brightness:.5},effects:fx({automation:choir,highpassHz:220,delayBeats:1.5,delayMix:.4,feedback:.4,pump:.7}),melody:melody("High choir",pads[2],"ooh")},
    {id:"pad-mid",name:"Mid choir · oh",role:"The moving inner line",body:{female:.65,child:0},volume:.17,pan:-.2,vibrato:0,voice:{breathiness:.12,brightness:.4},effects:fx({automation:choir,highpassHz:160,delayMix:.25,pump:.72}),melody:melody("Middle choir",pads[1],"oh")},
    {id:"pad-low",name:"Low choir · ah",role:"Warm lower harmony",body:{female:.4,child:0},volume:.19,pan:-.65,vibrato:0,voice:{breathiness:.08,brightness:.35},effects:fx({automation:choir,delayMix:.22,pump:.75,drive:1.5}),melody:melody("Low choir",pads[0],"ah")},
    {id:"bass",name:"Bass · dum",role:"Sub voice, pushing against the kick",body:{female:0,child:0},volume:.68,pan:0,vibrato:0,voice:{breathiness:.01,brightness:.25,tension:.6},effects:{bpm,highpassHz:28,lowpassHz:480,pump:.7,drive:1.8,automation:low,fadeOut:3},melody:melody("Bass",bass,"dum")},
    {id:"kick",name:"Kick · b",role:"Two-step, then four to the bar",body:{female:.05,child:0},volume:1.7,pan:0,beats:kick,effects:drumFx(2.8,{lowpassHz:6000})},
    {id:"snare",name:"Snare · pf",role:"Backbeat, rimshot ghosts and the rolls",body:{female:.15,child:0},volume:1.28,pan:.08,beats:snare,effects:drumFx(2.6,{highpassHz:120})},
    {id:"hats",name:"Hats · t",role:"Swung breath hats",body:{female:.15,child:0},volume:.8,pan:-.28,beats:hats,effects:drumFx(1.5,{highpassHz:1500,lowpassHz:12000,delayBeats:.75,delayMix:.16,feedback:.2,drive:1})},
    {id:"perc",name:"Clicks & pops",role:"Tongue clicks, lip pops and the crash",body:{female:.3,child:0},volume:.68,pan:.5,beats:perc,effects:drumFx(1.8,{highpassHz:300,lowpassHz:12000,delayBeats:.75,delayMix:.3,feedback:.35,drive:1})},
  ];
  const sections=([["Streetlight",0],["Stirring",8],["Two-step",16],["Lift",32],["Drop",40],["Alone",56],["Build",72],["Second drop",80],["Together",96],["First light",104]] as [string,number][]).map(([name,b])=>({name,time:b*bar}));
  return {title:"Small Hours",description:"An original 3:31 wordless electronic track for twelve mouths. A five-note hook repeats over a two-step mouth beat while the chords change under it; in the breakdown one voice sings a slow melody alone, and at the end the same melody returns over the full beat before the piece settles in a major key.",bpm,duration,wordless:true,presentation:"ensemble",parts,sections,
    spotlights:[{time:0,partId:"lead"},{time:56*bar,partId:"alone"},{time:76*bar,partId:"lead"},{time:96*bar,partId:"alone"}]};
}
