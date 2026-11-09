import { originalBand } from "./original.ts";
import { risingSunBand } from "./risingSun.ts";
import { neonCurrentBand } from "./neonCurrent.ts";
import { MAX_BAND_VOICES, type Arrangement } from "./types.ts";

export interface BandSong { id:string; name:string; arrangement:Arrangement; arrangementUrl?:string }

/** Prepared telemetry is losslessly compressed; editor rendering still uses the original score. */
const prepared=(score:Arrangement):Arrangement=>({...score,parts:score.parts.map(p=>({...p,telemetryEncoding:'gzip'}))});

export const BAND_SONGS:BandSong[]=[
  {id:"house-of-the-rising-sun",name:"House of the Rising Sun · 2:49",arrangement:prepared(risingSunBand())},
  {id:"all-made-of-air",name:"All Made of Air · 0:35",arrangement:prepared(originalBand())},
  {id:"neon-current",name:"Neon Current · 3:03 · wordless electronic",arrangement:prepared(neonCurrentBand())},
  {id:"bicep-glue",name:"BICEP — Glue · 4:30 · vocal remake",arrangementUrl:"/band/bicep-glue/arrangement.json",arrangement:{
    title:"Glue · BICEP",description:"BICEP’s Glue, reimagined as eight wordless mouths: a repeating hook, layered choir, deep bass and a shuffling mouth beat.",bpm:130,duration:270.8,wordless:true,parts:[],sections:[],
  }},
  {id:"night-train-quartet",name:"Night Train Radio · 2:26 · new-lyrics quartet",arrangementUrl:"/band/night-train-quartet/arrangement.json",arrangement:{
    title:"Night Train Radio",description:"The Mr. Sandman tune with newly written words about a night train and a waking city. Bass, tenor, alto and soprano sing the full piece, with close harmonies and a changing lead.",bpm:112.5,duration:146.3,presentation:"quartet",parts:[],sections:[],
  }},
  {id:"synnefoula",name:"Συννεφούλα · singing & original whistle passages",arrangementUrl:"/band/synnefoula/arrangement.json",arrangement:{
    title:"Συννεφούλα · Διονύσης Σαββόπουλος",description:"One mouth sings the Greek vocal sections and whistles the recording's original whistle passages, over the original instrumental backing.",bpm:120,duration:135.43,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"megalovania",name:"MEGALOVANIA · 2:36 · 24 mouths",arrangementUrl:"/band/megalovania/arrangement.json",arrangement:{
    title:"MEGALOVANIA · 24 mouths",description:"The full Undertale track, performed by 24 simulated mouths. The riff, layered choir, bass and beatboxing are all voices. No recorded instruments.",bpm:120,duration:157,wordless:true,presentation:"ensemble",parts:[],sections:[],
  }},
  {id:"bicep-apricots",name:"BICEP — Apricots · 4:09 · 12 mouths",arrangementUrl:"/band/bicep-apricots/arrangement.json",arrangement:{
    title:"Apricots · BICEP",description:"The full supplied Apricots recording reimagined as a wordless mouth choir, with layered vocal hooks, warm harmonies, bass and beatboxing.",bpm:128,duration:249.412,wordless:true,presentation:"ensemble",parts:[],sections:[],
  }},
  {id:"ta-paidia-tou-peiraia",name:"Τα παιδιά του Πειραιά · 3:19 · robotic voice & fingers",arrangementUrl:"/band/ta-paidia-tou-peiraia/arrangement.json",arrangement:{
    title:"Τα παιδιά του Πειραιά · Μελίνα Μερκούρη",description:"The original instrumental music, a robotic Greek singer and an animated hand recreating the recording’s finger clicks.",bpm:120,duration:199.3,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"rodehihi-den-xanakano-fylaki",name:"Rodehihi — Δεν ξανακάνω φυλακή · 3:12",arrangementUrl:"/band/rodehihi-den-xanakano-fylaki/arrangement.json",arrangement:{
    title:"Δεν ξανακάνω φυλακή · Rodehihi",description:"Rodehihi’s full recording with its original instrumental backing and a robotic Greek singer following the vocal melody and phrasing.",bpm:120,duration:192.68,presentation:"backed-solo",parts:[],sections:[],
  }},
];
export const DEFAULT_BAND=BAND_SONGS[0];
/** Previous experimental links now open the complete singing-and-whistling performance. */
export function findBandSong(id:string|null):BandSong{
  return BAND_SONGS.find(s=>s.id===(["synnefoula-whisper","synnefoula-whistle"].includes(id??"")?"synnefoula":id))??DEFAULT_BAND;
}

/** Covers can carry their locally prepared score in the deployment without putting it in Git. */
export async function loadBandArrangement(song:BandSong,request:(url:string)=>Promise<Response>=fetch):Promise<Arrangement>{
  if(!song.arrangementUrl)return song.arrangement;
  const response=await request(song.arrangementUrl);
  if(!response.ok)throw new Error(`The song arrangement could not load (${response.status}). Reload and try again.`);
  const data=await response.json() as Arrangement;
  if(!data||!Number.isFinite(data.duration)||data.duration<=0||!Number.isFinite(data.bpm)||data.bpm<=0||!Array.isArray(data.parts)||!data.parts.length||data.parts.length>MAX_BAND_VOICES||!Array.isArray(data.sections))throw new Error("The song arrangement is incomplete. Reload and try again.");
  const ids=new Set<string>();
  for(const part of data.parts){
    if(!part||typeof part.id!=="string"||!/^[a-z0-9-]+$/.test(part.id)||ids.has(part.id)||(part.telemetryEncoding!==undefined&&part.telemetryEncoding!=="gzip")||!part.body||!Number.isFinite(part.volume)||!Number.isFinite(part.pan)||(part.kind!==undefined&&part.kind!=="voice"&&part.kind!=="backing"&&part.kind!=="hand"))throw new Error("A voice in the song arrangement is invalid.");
    if(part.kind==='hand'){
      if(!Array.isArray(part.snaps)||!part.snaps.length||part.snaps.length>4000)throw new Error('The finger-click rhythm is invalid.');
      let last=-1;
      for(const snap of part.snaps){if(!snap||!Number.isFinite(snap.time)||snap.time<0||snap.time<last||snap.time>=data.duration||!Number.isFinite(snap.accent)||snap.accent<0||snap.accent>1.4)throw new Error('The finger-click rhythm is invalid.');last=snap.time;}
    }
    ids.add(part.id);
  }
  return data;
}
