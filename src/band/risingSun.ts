import type { Arrangement, BandPart } from "./types.ts";
import type { MelodyNote } from "../song/melody.ts";

/** Traditional anonymous tune, new verse words and a new seven-voice arrangement.
 * Tune reference: Frank Nordberg's anonymous folk-tune transcription, transposed Dm → Am:
 * https://trillian.mit.edu/~jc/music/abc/mirror/musicaviva.com/tunes/usa/house-of-the-rising-01.abc
 * Traditional provenance: https://www.loc.gov/static/events/concerts-from-the-library-of-congress/documents/programs/2324-Kronos-Quartet-April18-program.pdf
 * No commercial performance, modern recording arrangement, or audio samples are used.
 */
export function risingSunBand():Arrangement {
  const bpm=88, beat=60/bpm, duration=246*beat+1.5;
  const source="Traditional folk melody and opening lines · new verse words and vocal arrangement";
  const melody=(name:string,notes:MelodyNote[],lyrics:string)=>({name,notes,duration,lyrics,source});
  // Four ballad phrases, 12 quarter-note beats each. Held notes retain their syllable.
  const phrases:{pitches:number[];lengths:number[];syllables:number[]}[]=[
    {pitches:[69,62,64,62,65,67,68,69,65,64,62],lengths:[1,2,.5,.5,2,.5,.5,2,.5,.5,2],syllables:[0,1,2,2,3,4,4,5,6,6,7]},
    {pitches:[69,74,69,72,69,67,69],lengths:[1,2,1,2,.5,.5,4],syllables:[0,1,2,3,4,4,5]},
    {pitches:[69,69,74,62,65,67,69,69,65,64,62],lengths:[.5,.5,2,1,2,1,.5,1.5,.5,.5,2],syllables:[0,1,2,3,3,4,5,5,6,6,7]},
    {pitches:[69,69,69,69,57,65,64,62],lengths:[1,2,1,.5,1.5,.5,.5,5],syllables:[0,1,2,3,3,4,4,5]},
  ];
  const verse1=["The tide rolls on beneath the moon","The streets grow dark and still","I hear a song beyond the doors","And feel the night grow chill"];
  const refrain=["There is a house in New Or-leans","They call the Rising Sun","The lights still burn but hope is gone","Beneath the rising sun"];
  const verse2=["At dawn the road will call my name","I'll take the path back home","And leave the lamps beside the rain","Where shadows used to roam"];
  const lead:MelodyNote[]=[],words:string[]=[];
  let syllableOffset=0;
  function stanza(start:number,lines:string[]){
    lines.forEach((line,p)=>{
      const f=phrases[p];let time=start+p*12;
      f.pitches.forEach((pitch,i)=>{
        lead.push({midi:pitch-5,start:time*beat,duration:f.lengths[i]*beat,lyricIndex:syllableOffset+f.syllables[i],hold:i>0&&f.syllables[i]===f.syllables[i-1]});
        time+=f.lengths[i];
      });
      words.push(line);syllableOffset+=p%2===0?8:6;
    });
  }
  stanza(6,verse1);stanza(54,refrain);stanza(126,verse2);stanza(174,refrain);
  const high:MelodyNote[]=[],alto:MelodyNote[]=[],tenor:MelodyNote[]=[],bass:MelodyNote[]=[],answers:MelodyNote[]=[];
  // Our own minor-key choral progression and voice leading, one chord per 3/4 bar.
  const chords=[
    [45,52,60,64],[41,48,57,60],[50,57,62,65],[40,47,56,62],
    [45,52,60,64],[43,50,59,62],[48,55,60,64],[40,47,56,62],
    [45,52,60,64],[41,48,57,60],[50,57,62,65],[43,50,59,62],
    [45,52,60,64],[40,47,56,62],[45,52,60,64],[45,52,57,64],
  ];
  const hit=(midi:number,start:number,length:number):MelodyNote=>({midi,start:start*beat,duration:length*beat});
  const isChorus=(b:number)=>(b>=54&&b<102)||(b>=174&&b<222);
  const isBridge=(b:number)=>b>=102&&b<126;
  const isCoda=(b:number)=>b>=222;
  for(let bar=0;bar<82;bar++){
    const start=bar*3;
    const origin=start>=222?222:start>=174?174:start>=126?126:start>=102?102:start>=54?54:start>=6?6:0;
    const chord=chords[Math.floor((start-origin)/3)%chords.length];
    const choir=isChorus(start),bridge=isBridge(start),coda=isCoda(start);
    if(start<6||choir||bridge||coda)high.push(hit(chord[3]+(choir?0:-12),start,2.8));
    if(start>=6&&(choir||bridge||coda||bar%4>=2))alto.push(hit(chord[2],start+.12,2.6));
    if(start>=3&&start<240){
      const pattern=[chord[1],chord[2],chord[3],chord[2],chord[1],chord[2]];
      const pulses=bridge||choir?6:3;
      for(let p=0;p<pulses;p++)tenor.push(hit(pattern[p*6/pulses],start+p*3/pulses+.03,.29));
    }
    bass.push(hit(chord[0],start,.9));
    if(!coda||bar%2===0)bass.push(hit(chord[1]-12,start+1.5,.65));
    if((choir&&bar%4===3)||(coda&&bar%2===0)){
      answers.push(hit(chord[2],start,.65),hit(chord[1]+5,start+.75,.65),hit(chord[2],start+1.5,1.25));
    }
  }
  const beats=[];
  for(let bar=2;bar<78;bar++){
    const start=bar*3;
    if(isBridge(start)&&bar%2)continue;
    beats.push({time:start*beat,id:"B",accent:.8},{time:(start+1.5)*beat,id:"Pf",accent:.8});
    for(const p of [.5,1,2,2.5])beats.push({time:(start+p)*beat,id:p===2.5?"tss":"t",accent:.5});
  }
  const parts:BandPart[]=[
    {id:"lead",name:"Lead ballad",role:"Verses & traditional refrain",body:{female:.7,child:0},volume:.78,pan:0,melody:melody("Lead",lead,words.join(" "))},
    {id:"soprano",name:"High choir",role:"Open-vowel harmonies",body:{female:1,child:0},volume:.27,pan:-.65,melody:melody("High choir",high,"ooh")},
    {id:"alto",name:"Low choir",role:"Warm chord layers",body:{female:.6,child:0},volume:.31,pan:.6,melody:melody("Low choir",alto,"ah")},
    {id:"tenor",name:"Rolling voices",role:"Doo-wop arpeggios",body:{female:.18,child:0},volume:.28,pan:-.2,melody:melody("Rolling voices",tenor,"doo")},
    {id:"bass",name:"Bass",role:"Minor-key walking foundation",body:{female:0,child:0},volume:.7,pan:0,melody:melody("Bass",bass,"dum")},
    {id:"answer",name:"Answering choir",role:"Rising-sun responses",body:{female:.35,child:0},volume:.42,pan:.35,melody:melody("Answering choir",answers,"rising sun")},
    {id:"percussion",name:"Beatbox",role:"Soft mouth drums",body:{female:0,child:0},volume:.8,pan:.12,beats},
  ];
  return {title:"House of the Rising Sun",description:"A 2:49 seven-mouth folk choir arrangement of the traditional tune, with new verse words, answering harmonies, a wordless bridge and a layered final refrain.",bpm,duration,parts,
    sections:[{name:"Humming intro",time:0},{name:"Verse 1",time:6*beat},{name:"Refrain",time:54*beat},{name:"Wordless bridge",time:102*beat},{name:"Verse 2",time:126*beat},{name:"Final choir",time:174*beat},{name:"Coda",time:222*beat}]};
}
