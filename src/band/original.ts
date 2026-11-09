import type { Arrangement, BandPart } from "./types.ts";
import type { MelodyNote } from "../song/melody.ts";

/** Original music and words, written for this app. All accompaniment is a physical voice. */
export function originalBand():Arrangement {
  const bpm=112, beat=60/bpm;
  const melody=(name:string,notes:MelodyNote[],lyrics:string)=>({name,notes,duration:64*beat,lyrics,source:"Original vocal arrangement"});
  const line=(start:number,pitches:number[],lengths:number[]):MelodyNote[]=>{
    let t=start;return pitches.map((midi,i)=>{const n={midi,start:t*beat,duration:lengths[i]*beat};t+=lengths[i];return n;});
  };
  const lead:MelodyNote[]=[];
  const words:string[]=[];
  const phrase=(start:number,pitches:number[],lengths:number[],text:string)=>{lead.push(...line(start,pitches,lengths));words.push(text);};
  phrase(8,[64,67,69,67,64],[.5,.5,1,1,1],"One voice wakes the room.");
  phrase(12,[64,65,67,69,67,64],[.5,.5,.5,.5,1,1],"Two voices make it bloom.");
  phrase(16,[62,64,65,64,60],[.5,.5,1,1,1],"Low notes hold the ground.");
  phrase(20,[62,67,69,67,62],[.5,.5,1,1,1],"High notes lift the sound.");
  phrase(24,[67,67,69,72,71],[1,1,2,2,2],"We are made of air.");
  phrase(32,[69,69,67,65,64],[1,1,2,2,2],"Sing it far and wide.");
  phrase(40,[65,65,67,69,67],[1,1,2,2,2],"Each voice brings a light.");
  phrase(48,[67,69,67,64,60],[1,1,2,2,2],"Carry us tonight.");
  const roots=[48,45,41,43];
  const bass:MelodyNote[]=[],tenor:MelodyNote[]=[],alto:MelodyNote[]=[],answer:MelodyNote[]=[];
  const upper=[64,60,60,62],lower=[55,57,53,55];
  for(let bar=0;bar<16;bar++){
    const b=bar*4,c=bar%4;
    bass.push(...line(b,[roots[c],roots[c]+7,roots[c],roots[c]+7],[1.4,.6,1.4,.6]).map(n=>({...n,duration:n.duration*.78})));
    if(bar>=2&&bar<14){
      for(const pulse of [.5,1.5,2.5,3.5])tenor.push({midi:lower[c],start:(b+pulse)*beat,duration:.32*beat});
    }
    if(bar>=6&&bar<14){
      alto.push({midi:upper[c],start:b*beat,duration:3.8*beat});
      answer.push(...line(b+2,[lower[c]+7,lower[c]+5,lower[c]+7],[.5,.5,1]));
    }
  }
  const parts:BandPart[]=[
    {id:"lead",name:"Lead",role:"Verse & chorus",body:{female:.8,child:0},volume:.78,pan:0,melody:melody("Lead",lead,words.join(" "))},
    {id:"alto",name:"High harmony",role:"Held chorus chords",body:{female:1,child:0},volume:.31,pan:-.55,melody:melody("High harmony",alto,"ooh")},
    {id:"answer",name:"Answering choir",role:"Call & response",body:{female:.25,child:0},volume:.38,pan:.55,melody:melody("Answering choir",answer,"made of air")},
    {id:"tenor",name:"Vocal rhythm",role:"Offbeat doo-wop",body:{female:.12,child:0},volume:.3,pan:-.25,melody:melody("Vocal rhythm",tenor,"doo")},
    {id:"bass",name:"Bass",role:"Dum-dum bass line",body:{female:0,child:0},volume:.68,pan:0,melody:melody("Bass",bass,"dum")},
    {id:"percussion",name:"Beatbox",role:"Mouth drums",body:{female:0,child:0},volume:.52,pan:.2,
      beats:Array.from({length:28},(_,half)=>{
        const start=half*2;
        return [{time:start*beat,id:half%2===0?"B":"Pf",accent:1},{time:(start+.5)*beat,id:"t",accent:.65},{time:(start+1)*beat,id:"t",accent:.6},{time:(start+1.5)*beat,id:"tss",accent:.7}];
      }).flat()},
    {id:"spoken",name:"Spoken responses",role:"Spoken outro",body:{female:.2,child:0},volume:.65,pan:-.15,speech:[{time:57*beat,text:"All made of air."},{time:61*beat,text:"One more time!"}]},
  ];
  return {title:"All Made of Air",description:"An original seven-voice a cappella song. The lead, harmony, answering choir, bass, drums and spoken responses all come from simulated mouths.",bpm,duration:64*beat+1,parts,
    sections:[{name:"Intro",time:0},{name:"Verse",time:8*beat},{name:"Chorus",time:24*beat},{name:"Spoken outro",time:56*beat}]};
}
