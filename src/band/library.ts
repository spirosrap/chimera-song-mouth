import {BASE_PATH} from "../base.ts";
import { originalBand } from "./original.ts";
import { risingSunBand } from "./risingSun.ts";
import { neonCurrentBand } from "./neonCurrent.ts";
import { smallHoursBand } from "./smallHours.ts";
import { MAX_BAND_VOICES, isVoicePart, type Arrangement } from "./types.ts";
import {validPerformance} from './performance.ts';

export interface BandSong { id:string; name:string; arrangement:Arrangement; arrangementUrl?:string }

/** Prepared telemetry is losslessly compressed; editor rendering still uses the original score. */
const prepared=(score:Arrangement):Arrangement=>({...score,parts:score.parts.map(p=>({...p,telemetryEncoding:'gzip'}))});

export const BAND_SONGS:BandSong[]=[
  {id:"house-of-the-rising-sun",name:"House of the Rising Sun · 2:49",arrangementUrl:BASE_PATH+"band/house-of-the-rising-sun/arrangement.json?v=phrasing-20261110",arrangement:prepared(risingSunBand())},
  {id:"all-made-of-air",name:"All Made of Air · 0:35",arrangementUrl:BASE_PATH+"band/all-made-of-air/arrangement.json?v=phrasing-20261110",arrangement:prepared(originalBand())},
  {id:"neon-current",name:"Neon Current · 3:03 · wordless electronic",arrangement:prepared(neonCurrentBand())},
  {id:"bicep-glue",name:"BICEP — Glue · 4:30 · 9 mouths",arrangementUrl:BASE_PATH+"band/bicep-glue/arrangement.json?v=glue-refined-20261110",arrangement:{
    title:"Glue · BICEP · 9 mouths",description:"The full Glue arrangement performed entirely by nine simulated mouths: connected vocal and synth phrases, deep bass, and the recording’s shuffling breakbeat. Every voice and percussion sound is synthesized; no original recording is mixed in.",bpm:130,duration:270.8,wordless:true,presentation:"ensemble",parts:[],sections:[],
  }},
  {id:"night-train-quartet",name:"Night Train Radio · 2:26 · new-lyrics quartet",arrangementUrl:BASE_PATH+"band/night-train-quartet/arrangement.json?v=phrasing-20261110",arrangement:{
    title:"Night Train Radio",description:"The Mr. Sandman tune with newly written words about a night train and a waking city. Bass, tenor, alto and soprano sing the full piece, with close harmonies and a changing lead.",bpm:112.5,duration:146.3,presentation:"quartet",parts:[],sections:[],
  }},
  {id:"synnefoula",name:"Συννεφούλα · singing & original whistle passages",arrangementUrl:BASE_PATH+"band/synnefoula/arrangement.json?v=phrasing-20261110",arrangement:{
    title:"Συννεφούλα · Διονύσης Σαββόπουλος",description:"One mouth sings the Greek vocal sections and whistles the recording's original whistle passages, over the original instrumental backing.",bpm:120,duration:135.43,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"megalovania",name:"MEGALOVANIA · 2:36 · 24 mouths",arrangementUrl:BASE_PATH+"band/megalovania/arrangement.json?v=reference-20261110",arrangement:{
    title:"MEGALOVANIA · 24 mouths",description:"The full Undertale track as a 24-mouth vocal orchestra, following the reference video's singers and octaves. Connected DA riffs, DUM pulses and a rounded OOH bass keep the music flowing — every sound comes from a simulated mouth.",bpm:120,duration:156.9,wordless:true,showSyllables:true,presentation:"ensemble",parts:[],sections:[],
  }},
  {id:"bicep-apricots",name:"BICEP — Apricots · 4:09 · original vocal + 9 mouths",arrangementUrl:BASE_PATH+"band/bicep-apricots/arrangement.json?v=apricots-claps-20261110",arrangement:{
    title:"Apricots · BICEP · original vocal + 9 mouths",description:"The full song with its original vocal sample and nine simulated mouths playing the music. Sustained harmonies, a deep bass line and a stronger beat follow the recording’s electronic groove.",bpm:128,duration:249.412,wordless:true,presentation:"ensemble",parts:[],sections:[],
  }},
  {id:"ta-paidia-tou-peiraia",name:"Τα παιδιά του Πειραιά · 3:19 · robotic voice & fingers",arrangementUrl:BASE_PATH+"band/ta-paidia-tou-peiraia/arrangement.json?v=phrasing-20261110",arrangement:{
    title:"Τα παιδιά του Πειραιά · Μελίνα Μερκούρη",description:"The original instrumental music, a robotic Greek singer and an animated hand recreating the recording’s finger clicks.",bpm:120,duration:199.3,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"rodehihi-den-xanakano-fylaki",name:"Rodehihi — Δεν ξανακάνω φυλακή · 3:12",arrangementUrl:BASE_PATH+"band/rodehihi-den-xanakano-fylaki/arrangement.json?v=phrasing-20261110",arrangement:{
    title:"Δεν ξανακάνω φυλακή · Rodehihi",description:"Rodehihi’s full recording with its original instrumental backing and a robotic Greek singer following the vocal melody and phrasing.",bpm:120,duration:192.68,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"small-hours",name:"Small Hours · 3:31 · original electronic",arrangement:prepared(smallHoursBand())},
  {id:"country-roads",name:"Country Roads · 3:15 · one voice & score",arrangementUrl:BASE_PATH+"band/country-roads/arrangement.json?v=melody-3",arrangement:{
    title:"Take Me Home, Country Roads",description:"The full song, with one robotic singer over the original instrumental music and a scrolling melody and pitch graph.",bpm:82,duration:195.8504375,presentation:"solo-roll",parts:[],sections:[],
  }},
  {id:"blue-moon",name:"Blue Moon — Frank Sinatra · 2:52 · robotic singer",arrangementUrl:BASE_PATH+"band/blue-moon/arrangement.json?v=phonetic-mouth-20261110",arrangement:{
    title:"Blue Moon · Frank Sinatra",description:"The full Sinatra recording’s orchestral music with one robotic mouth singing the words, following his swing timing, held notes and phrasing.",bpm:120,duration:172.23573696145124,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"mr-sandman-quartet",name:"Mr. Sandman · 2:26 · original-lyrics quartet",arrangementUrl:BASE_PATH+"band/mr-sandman-quartet/arrangement.json?v=sandman-quartet-20261110",arrangement:{
    title:"Mr. Sandman · the mouth quartet",description:"The complete song with its original words, sung by bass, tenor, alto and soprano. Four simulated mouths supply every melody, close harmony, bum-bum passage and playful response.",bpm:112.5,duration:146.3,presentation:"quartet",parts:[],sections:[],
  }},
  {id:"be-my-baby",name:"Be My Baby — The Ronettes · 2:40 · lead & backing singers",arrangementUrl:BASE_PATH+"band/be-my-baby/arrangement.json?v=be-my-baby-20261110",arrangement:{
    title:"Be My Baby · The Ronettes",description:"The full original instrumental recording with a robotic lead and two backing mouths singing the familiar responses. Each mouth follows its own vocal part and words.",bpm:129,duration:160.71897959183673,presentation:"backed-ensemble",parts:[],sections:[],
  }},
  {id:"life-on-mars",name:"Life on Mars? — David Bowie · 4:03 · robotic singer",arrangementUrl:BASE_PATH+"band/life-on-mars/arrangement.json?v=life-on-mars-20261111",arrangement:{
    title:"Life on Mars? · David Bowie",description:"The full supplied recording’s original music, with one physical mouth singing the words, following the rising melody, held notes and phrasing.",bpm:123,duration:243.31283446712018,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"starman",name:"Starman — David Bowie · 4:18 · robotic singer",arrangementUrl:BASE_PATH+"band/starman/arrangement.json?v=starman-tuned-20261111",arrangement:{
    title:"Starman · David Bowie",description:"The full original instrumental music with a physical mouth singing the verses, choruses and the complete la-la ending, with synchronized words.",bpm:100,duration:258.24244897959187,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"space-oddity",name:"Space Oddity — David Bowie · 5:05 · singer & countdown",arrangementUrl:BASE_PATH+"band/space-oddity/arrangement.json?v=space-oddity-20261111",arrangement:{
    title:"Space Oddity · David Bowie",description:"The full original music with a physical mouth singing the words, and a second mouth speaking the overlapping launch countdown. Both follow the recording with synchronized words and mouth animation.",bpm:68,duration:305.32090702947846,presentation:"backed-ensemble",parts:[],sections:[],
  }},
  {id:"cry-me-a-river",name:"Cry Me a River — Julie London · 2:58 · robotic singer",arrangementUrl:BASE_PATH+"band/cry-me-a-river/arrangement.json?v=cry-me-a-river-20261111",arrangement:{
    title:"Cry Me a River · Julie London",description:"The full original guitar and bass accompaniment with one physical mouth singing the words, following the recording’s melody, held notes and relaxed phrasing.",bpm:75,duration:178.92333333333332,presentation:"backed-solo",parts:[],sections:[],
  }},
  {id:"smile",name:"Smile — Nat King Cole · 2:56 · robotic singer",arrangementUrl:BASE_PATH+"band/smile/arrangement.json?v=smile-20261111",arrangement:{
    title:"Smile · Nat King Cole",description:"The full original orchestral accompaniment with one physical mouth singing the words, following the recording’s melody, held notes and phrasing.",bpm:78,duration:176.56625850340134,presentation:"backed-solo",parts:[],sections:[],
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
    if(part.performance&&!validPerformance(part.performance,data.duration))throw new Error('The vocal performance data is invalid.');
    if(part.recordingType!==undefined&&(part.kind!=='backing'||!['vocal','instrumental'].includes(part.recordingType)))throw new Error('The recorded audio type is invalid.');
    if(part.assetVersion!==undefined&&(typeof part.assetVersion!=='string'||!/^[a-z0-9-]{1,64}$/.test(part.assetVersion)))throw new Error('The song asset version is invalid.');
    ids.add(part.id);
  }
  if(data.presentation==="solo-roll"&&data.parts.filter(isVoicePart).length!==1)throw new Error("The solo performance needs exactly one singer.");
  return data;
}
