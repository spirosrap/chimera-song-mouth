import { readMidi } from "../song/midi.ts";
import type { Arrangement, BandPart } from "./types.ts";

export function midiBand(bytes:ArrayBuffer,name:string):Arrangement{
  const melodies=readMidi(bytes,name,true);
  const parts:BandPart[]=melodies.map((melody,i)=>{
    const low=melody.notes.reduce((s,n)=>s+n.midi,0)/melody.notes.length<55;
    return {id:`midi-${i}`,name:melody.name,role:melody.percussion?"Mouth drums":low?"Bass voice":"Sung MIDI part",body:{female:low?0:(i%3)/2,child:0},volume:low?.65:.45,pan:melodies.length===1?0:(i/(melodies.length-1)-.5)*1.2,
      ...(melody.percussion?{beats:melody.notes.map(n=>({time:n.start,id:n.midi===35||n.midi===36?"B":n.midi===38||n.midi===40?"Pf":"t",accent:.8}))}:{melody:{...melody,lyrics:low?"dum":"doo"}})};
  });
  return {title:name,description:"Your MIDI parts, sung together. Each overlapping note has its own voice; pitches, tempo changes and rests come from the file.",bpm:0,duration:Math.max(...melodies.map(m=>m.duration))+.9,parts,sections:[]};
}
