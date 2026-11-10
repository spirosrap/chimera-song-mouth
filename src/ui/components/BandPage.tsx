import {PerformanceRoll} from "./PerformanceRoll.tsx";
import {FolkSinger} from "./FolkSinger.tsx";
import {SnapHand} from "./SnapHand.tsx";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BAND_SONGS, findBandSong, loadBandArrangement } from "../../band/library.ts";
import { midiBand } from "../../band/midi.ts";
import {loadBandAssets} from "../../band/assets.ts";
import { BandMixer, mixWave } from "../../band/mixer.ts";
import { BAND_RATE } from "../../band/render.ts";
import { MAX_BAND_VOICES, isVoicePart, type Arrangement, type BandPart, type RenderedPart } from "../../band/types.ts";
import { TeleTrack } from "../../show/tele.ts";
import { formatTime } from "../../song/melody.ts";
import { AnatomyView3D, type HeadFeed } from "./AnatomyView3D.tsx";
import { Screen } from "./Screen.tsx";
import { useRetainedModel } from "../useModel.ts";
import { VoiceModel } from "../analysis.ts";
import { mouthWords } from "../mouthWords.ts";
import { V } from "../colors.ts";
import { lyricsToSyllables } from "../../wasm/engine.ts";
import { g2p } from "../speech.ts";
import {featuredVoice,songCaption} from "../../band/presentation.ts";
import {HomeLink} from "./HomeLink.tsx";

interface LoadedBand { parts: BandPart[]; buffers: AudioBuffer[]; tracks: (TeleTrack|null)[] }
const INITIAL_SONG=findBandSong(typeof window==="undefined"?null:new URLSearchParams(window.location.search).get("song"));
const INITIAL=INITIAL_SONG.arrangement;

export function BandPage(){
  const [arrangement,setArrangement]=useState<Arrangement>(INITIAL);
  const [selected,setSelected]=useState<string[]>(INITIAL.parts.filter(p=>isVoicePart(p)).map(p=>p.id));
  const [songId,setSongId]=useState(INITIAL_SONG.id);
  const [mixer,setMixer]=useState<BandMixer|null>(null);
  const [loaded,setLoaded]=useState<LoadedBand|null>(null);
  const [busy,setBusy]=useState("Loading the vocal band…");
  const [progress,setProgress]=useState(0);
  const [error,setError]=useState("");
  const [muted,setMuted]=useState<boolean[]>([]);
  const [solo,setSolo]=useState<boolean[]>([]);
  const [stale,setStale]=useState(false);
  const [time,setTime]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [version,setVersion]=useState(0);
  const backing=useRef<{part:BandPart;buffer:AudioBuffer}[]>([]);
  const job=useRef(0),worker=useRef<Worker|null>(null),file=useRef<HTMLInputElement>(null);

  useEffect(()=>{const m=new BandMixer();setMixer(m);return()=>{job.current++;worker.current?.terminate();m.dispose();};},[]);
  useEffect(()=>{
    if(!mixer)return;
    void loadSong(mixer,INITIAL_SONG.id);
    const timer=setInterval(()=>{setTime(mixer.time());setPlaying(mixer.isPlaying);},100);
    return()=>clearInterval(timer);
  },[mixer]);

  function install(m:BandMixer,parts:BandPart[],buffers:AudioBuffer[],tracks:(TeleTrack|null)[]){
    backing.current=parts.flatMap((part,i)=>!isVoicePart(part)?[{part,buffer:buffers[i]}]:[]);
    m.load(parts,buffers);setLoaded({parts,buffers,tracks});setMuted(parts.map(()=>false));setSolo(parts.map(()=>false));setStale(false);setBusy("");setProgress(0);setTime(0);setPlaying(false);setVersion(v=>v+1);
  }
  async function loadSong(m:BandMixer,id:string){
    const song=BAND_SONGS.find(s=>s.id===id);
    if(!song)return;
    const token=++job.current;worker.current?.terminate();m.pause();m.seek(0);setTime(0);setPlaying(false);setError("");setBusy("Loading the vocal band…");setLoaded(null);setStale(false);
    backing.current=[];
    setSongId(id);setArrangement(song.arrangement);setSelected(song.arrangement.parts.filter(p=>isVoicePart(p)).map(p=>p.id));
    const address=new URL(window.location.href);address.searchParams.set("song",id);window.history.replaceState(null,"",address);
    try{
      const arrangement=await loadBandArrangement(song);
      if(token!==job.current)return;
      setArrangement(arrangement);setSelected(arrangement.parts.filter(p=>isVoicePart(p)).map(p=>p.id));setBusy("Loading song audio…");
      const result=await loadBandAssets(song.id,arrangement.parts,data=>m.ctx.decodeAudioData(data));
      await g2p.load().catch(()=>{});
      if(token===job.current)install(m,arrangement.parts,result.map(r=>r.buffer),result.map(r=>r.track));
    }catch(e){if(token===job.current){setBusy("");setError(message(e));}}
  }
  function cancel(){job.current++;worker.current?.terminate();worker.current=null;setBusy("");setProgress(0);}
  async function importMidi(f:File){
    if(!mixer)return;
    cancel();mixer.pause();setError("");
    const token=++job.current;setBusy("Reading MIDI parts…");
    try{
      if(f.size>10*1024*1024)throw new Error("Choose a MIDI file smaller than 10 MB.");
      const next=midiBand(await f.arrayBuffer(),f.name.replace(/\.midi?$/i,""));
      if(token!==job.current)return;
      backing.current=[];setSongId("");setArrangement(next);setSelected(next.parts.slice(0,MAX_BAND_VOICES).map(p=>p.id));setLoaded(null);setStale(true);
    }catch(e){if(token===job.current)setError(message(e));}
    finally{if(token===job.current)setBusy("");}
  }
  function updatePart(id:string,patch:Partial<BandPart>){
    setArrangement(a=>({...a,parts:a.parts.map(p=>p.id===id?{...p,...patch}:p)}));setStale(true);mixer?.pause();
  }
  function render(){
    if(!mixer)return;
    const parts=arrangement.parts.filter(p=>isVoicePart(p)&&selected.includes(p.id));
    const recorded=backing.current;
    if(arrangement.parts.some(p=>!isVoicePart(p))&&!recorded.length){setError("Reload the song to restore the music and rhythm before rendering.");return;}
    if(!parts.length){setError("Select at least one voice.");return;}
    if(parts.length>MAX_BAND_VOICES){setError(`Select up to ${MAX_BAND_VOICES} voices at a time.`);return;}
    cancel();mixer.pause();setLoaded(null);setError("");setBusy("Preparing the voices…");
    const token=++job.current;
    const w=new Worker(new URL("../../band/render.worker.ts",import.meta.url),{type:"module"});worker.current=w;
    const rendered:RenderedPart[]=[];
    w.onmessage=async(e)=>{
      if(token!==job.current)return;
      if(e.data.type==="progress"){setBusy(`Singing ${e.data.part}…`);setProgress(e.data.value);}
      if(e.data.type==="part")rendered.push(e.data);
      if(e.data.type==="error"){w.terminate();worker.current=null;setBusy("");setError(e.data.message);}
      if(e.data.type==="done"){
        w.terminate();worker.current=null;
        try{
          await g2p.load().catch(()=>{});
          if(token!==job.current)return;
          const ordered=parts.map(p=>rendered.find(r=>r.id===p.id)!);
          const buffers=ordered.map(r=>{const b=mixer.ctx.createBuffer(1,r.samples.length,BAND_RATE);b.copyToChannel(new Float32Array(r.samples),0);return b;});
          install(mixer,[...parts,...recorded.map(r=>r.part)],[...buffers,...recorded.map(r=>r.buffer)],[...ordered.map(r=>new TeleTrack(r.tele)),...recorded.map(()=>null)]);
        }catch(e){setBusy("");setError(message(e));}
      }
    };
    w.onerror=()=>{w.terminate();worker.current=null;if(token===job.current){setBusy("");setError("The vocal rendering stopped. Try fewer voices or a shorter MIDI file.");}};
    w.postMessage({...arrangement,parts});
  }
  function changeMix(index:number,patch:{volume?:number;mute?:boolean;solo?:boolean}){
    mixer?.setVoice(index,patch);
    if(patch.volume!==undefined)backing.current=backing.current.map(b=>b.part.id===loaded?.parts[index]?.id?{...b,part:{...b.part,volume:patch.volume!}}:b);
    if(patch.mute!==undefined)setMuted(a=>a.map((v,i)=>i===index?patch.mute!:v));
    if(patch.solo!==undefined)setSolo(a=>a.map((v,i)=>i===index?patch.solo!:v));
    if(patch.volume!==undefined)setLoaded(l=>l?{...l,parts:l.parts.map((p,i)=>i===index?{...p,volume:patch.volume!}:p)}:l);
  }
  function download(){
    if(!loaded)return;
    const bytes=mixWave(loaded.parts,loaded.buffers.map(b=>Array.from({length:Math.min(2,b.numberOfChannels)},(_,i)=>b.getChannelData(i))),loaded.buffers[0].sampleRate,muted,solo);
    const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:"audio/wav"}));
    const a=document.createElement("a");a.href=url;a.download=`${arrangement.title.replace(/[^a-z0-9-]/gi,"-")}-${arrangement.parts.some(p=>p.kind==="backing")?"performance":"acappella"}.wav`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  const currentSection=arrangement.sections.filter(s=>s.time+.35<=time).at(-1)?.name??"Intro";
  const canPlay=!!loaded&&!busy&&!stale;
  const displayedDuration=loaded?(mixer?.duration??arrangement.duration):arrangement.duration;
  const ensemble=arrangement.presentation==="ensemble"||(loaded?.parts.filter(p=>isVoicePart(p)).length??0)>8;
  const soloRoll=arrangement.presentation==="solo-roll";
  const folkSinger=songId==="synnefoula";
  const backed=arrangement.presentation==="backed-solo"||soloRoll;
  const hasHand=!!loaded?.parts.some(p=>p.kind==="hand");
  const quartet=arrangement.presentation==="quartet",featured=featuredVoice(arrangement,time);
  const transport=(<div className="band-transport" aria-label="Vocal band playback">
        <button className="primary large" disabled={!canPlay} onClick={()=>{if(!mixer)return;playing?mixer.pause():mixer.play();setPlaying(mixer.isPlaying);}}>{playing?"Ⅱ Pause":backed?"▶ Play song":"▶ Play the whole band"}</button>
        <button className="chip" disabled={!loaded||!!busy} onClick={()=>{mixer?.pause();mixer?.seek(0);setTime(0);setPlaying(false);}}>Restart</button>
        <input type="range" aria-label="Position in the vocal song" min={0} max={displayedDuration} step={.05} value={loaded?time:0} disabled={!canPlay} onChange={e=>{const t=Number(e.target.value);mixer?.seek(t);setTime(t);}}/>
        <span className="band-clock">{formatTime(loaded?time:0)} / {formatTime(displayedDuration)}</span>
        {!!arrangement.sections.length&&<span className="band-section" role="status">{currentSection}</span>}
        <button className="chip" disabled={!canPlay} onClick={download}>Download WAV</button>
      </div>);
  return <div className={`band-page${soloRoll?" band-performance-page":""}`}>
    <header className="band-top"><HomeLink/><a className="wordmark" href="?band=1">Chimera</a><span className="band-badge">{soloRoll?"SOLO PERFORMANCE":"THE VOCAL BAND"}</span><a className="band-solo" href="?scene=a-few-good-men">Scenes & speeches ↗</a><a className="band-solo" href="?solo=1">Single-mouth player ↗</a></header>
    <main>
      <div className="band-intro"><div><p className="band-eyebrow">{backed?"Original music · a new lead":"Every instrument is a voice"}</p><h1>{arrangement.title}</h1><p>{arrangement.description}</p></div>
        <div className="band-choices"><label>Choose a song<select aria-label="Choose a choir song" value={songId} disabled={!!busy} onChange={e=>mixer&&void loadSong(mixer,e.target.value)}>{BAND_SONGS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}{!songId&&<option value="">Your MIDI arrangement</option>}</select></label><button className="chip" disabled={!!busy} onClick={()=>file.current?.click()}>Import a MIDI arrangement</button><input ref={file} className="song-file" type="file" accept=".mid,.midi" aria-label="Import a band MIDI" onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)void importMidi(f);}}/></div>
      </div>
      {!soloRoll&&transport}
      {busy&&<div className="band-status" role="status"><span>{busy} {progress>0&&`${Math.round(progress*100)}%`}</span><progress value={progress} max={1}/><button className="chip" onClick={cancel}>Cancel</button></div>}
      {error&&<p role="alert" className="error band-error">{error}</p>}
      {!loaded&&!busy&&!stale&&songId&&<button className="chip" onClick={()=>mixer&&void loadSong(mixer,songId)}>Reload song</button>}
      {stale&&!busy&&<div className="band-status"><span>Your selected parts are ready to render. This can take a few minutes for a long song.</span><button className="primary" onClick={render}>Render selected voices ({selected.length})</button></div>}
      {loaded&&mixer&&<div className={`band-heads${quartet?" band-quartet":""}${backed?" band-backed-solo":""}${hasHand?" band-with-hand":""}${ensemble?" band-ensemble":""}${soloRoll?" band-solo-roll":""}${folkSinger?" band-folk-singer":""}`} style={quartet?{"--quartet-columns":loaded.parts.map(p=>`minmax(0,${p.id===featured?1.65:1}fr)`).join(" ")} as CSSProperties:undefined}>
        {loaded.parts.map((part,i)=>part.kind==="backing"?null:<div className={`band-channel${quartet?(part.id===featured?" quartet-featured":""):(!folkSinger&&!soloRoll&&!ensemble&&!hasHand&&part.id==="lead"?" band-lead":"")}`} key={`${version}:${part.id}`}>
          <>{part.kind==="hand"?<SnapHand part={part} mixer={mixer} index={i}/>:folkSinger&&part.id==="lead"?<FolkSinger part={part} caption={songCaption(arrangement,time)} track={loaded.tracks[i]!} mixer={mixer} index={i} bpm={arrangement.bpm}/>:<BandHead part={part} track={loaded.tracks[i]!} mixer={mixer} index={i} bpm={arrangement.bpm} showWords={!arrangement.wordless||arrangement.showSyllables===true} quartet={quartet} ensemble={ensemble}/>}</>
          <div className="band-channel-controls"><button className={`chip${muted[i]?" on":""}`} aria-pressed={!!muted[i]} onClick={()=>changeMix(i,{mute:!muted[i]})} aria-label={`Mute ${part.name}`}>{ensemble?"Mute":`Mute ${part.name}`}</button><button className={`chip${solo[i]?" on":""}`} aria-pressed={!!solo[i]} aria-label={`Solo ${part.name}`} onClick={()=>changeMix(i,{solo:!solo[i]})}>Solo</button><label>Level <input aria-label={`${part.name} level`} type="range" min={0} max={part.effects?2:1} step={.01} value={part.volume} onChange={e=>changeMix(i,{volume:Number(e.target.value)})}/></label></div>
        </div>)}
        {soloRoll&&loaded.parts.map((part,i)=>isVoicePart(part)&&loaded.tracks[i]&&<PerformanceRoll key={`roll:${version}:${part.id}`} part={part} track={loaded.tracks[i]!} mixer={mixer} duration={displayedDuration}/>)}
      </div>}
      {soloRoll&&transport}
      {loaded&&loaded.parts.map((part,i)=>part.kind==="backing"&&<div className="band-backing" key={part.id}>
        <div><strong>{part.name}</strong><p>{part.role}</p></div>
        <div className="band-channel-controls"><button className={`chip${muted[i]?" on":""}`} aria-pressed={!!muted[i]} onClick={()=>changeMix(i,{mute:!muted[i]})}>Mute {part.recordingType==='vocal'?'vocal':'music'}</button><button className={`chip${solo[i]?" on":""}`} aria-pressed={!!solo[i]} onClick={()=>changeMix(i,{solo:!solo[i]})}>Solo {part.recordingType==='vocal'?'vocal':'music'}</button><label>{part.recordingType==='vocal'?'Vocal':'Music'} level <input aria-label={part.recordingType==='vocal'?'Original vocal level':'Instrumental backing level'} type="range" min={0} max={1} step={.01} value={part.volume} onChange={e=>changeMix(i,{volume:Number(e.target.value)})}/></label></div>
      </div>)}
      {!folkSinger&&(quartet||backed)&&<p className="quartet-lyrics" aria-label="Current lyric line">{songCaption(arrangement,time)||"\u00a0"}</p>}
      <details className="band-edit"><summary>{soloRoll?"Change singer or lyrics":arrangement.wordless?"Choose voices, vowels & singers":"Choose voices, edit lyrics & change singers"}</summary>
        <fieldset disabled={!!busy}>
        <p>{soloRoll?"Change the singer or words, then render again. The instrumental music stays in place.":backed?"The song follows its original vocal timing and any included whistle or finger-click passages. You can edit the voice and render again; the music and accompanying rhythm stay in place.":arrangement.wordless?"Pick up to 24 voices and choose a vowel for each pitched part. Recorded audio stays in place when you render again after changing vowels or singers.":"Pick up to 24 voices. MIDI chords split into separate mouths. Original MIDI timing is retained; instrument timbres become voices, and drum notes become beatboxing. Re-render after changing words or singers."}</p>
        <div className="band-part-list">{arrangement.parts.filter(p=>isVoicePart(p)).map(part=><div className="band-part-edit" key={part.id}>
          <label><input type="checkbox" checked={selected.includes(part.id)} onChange={e=>{setSelected(a=>e.target.checked?[...a,part.id]:a.filter(id=>id!==part.id));setStale(true);mixer?.pause();}}/>{part.name}</label><span>{part.role}</span>
          <label>Singer <select aria-label={`${part.name} singer`} value={part.body.child?"child":part.body.female>.5?"female":"male"} onChange={e=>updatePart(part.id,{body:{female:e.target.value==="female"?1:0,child:e.target.value==="child"?1:0}})}><option value="male">Low / male</option><option value="female">High / female</option><option value="child">Child</option></select></label>
          {part.melody&&(part.whistleMelody?<span>Automatic: singing + original whistle passages</span>:<label>Delivery <select aria-label={`${part.name} delivery`} value={part.delivery??"sing"} onChange={e=>updatePart(part.id,{delivery:e.target.value as "sing"|"whistle",voice:{...part.voice,voiced:true}})}><option value="sing">Singing</option><option value="whistle">Whistling</option></select></label>)}
          {part.melody&&(part.delivery==="whistle"?<span>Whistling follows the melody; no words are sung.</span>:arrangement.wordless?<label>Vowel<select aria-label={`${part.name} vowel`} value={part.melody.lyrics} onChange={e=>updatePart(part.id,{melody:{...part.melody!,lyrics:e.target.value}})}>{[...new Set([part.melody.lyrics,"ah","ooh","oh","da","dum","doo"]) ].map(v=><option key={v} value={v}>{v}</option>)}</select></label>:<label className="band-lyrics">Words<textarea aria-label={`${part.name} lyrics`} rows={2} value={part.melody.lyrics} onChange={e=>updatePart(part.id,{melody:{...part.melody!,lyrics:e.target.value}})}/></label>)}
          {part.speech&&<span>Spoken: {part.speech.map(s=>s.text).join(" ")}</span>}
        </div>)}</div>
        <button className="primary" disabled={!!busy||selected.length<1||selected.length>MAX_BAND_VOICES} onClick={render}>{soloRoll?"Render singer":`Render selected voices (${selected.length}/${MAX_BAND_VOICES})`}</button>
        </fieldset>
      </details>
      <p className="band-note">“MEGALOVANIA” by Toby Fox (Undertale) uses Radixán’s MIDIlovania transcription, arranged for 24 pitched mouths with the singer types, octave settings and scat syllables shown in the supplied reference video. “Τα παιδιά του Πειραιά” uses the supplied Μελίνα Μερκούρη recording’s instruments, a synthesized Greek lead and generated finger clicks synchronized to a robotic hand. The original clicks are reduced in the backing. “Συννεφούλα” by Διονύσης Σαββόπουλος uses instrumental audio separated from the supplied recording and a simulated Greek singer. The mouth sings its vocal sections and recreates the original whistle passages with pursed lips. Recorded whistles are reduced in the backing so the mouth performs them. Some original vocal traces may remain in the backing. “Night Train Radio” uses the Mr. Sandman tune (Pat Ballard) with newly written lyrics and a quartet adaptation of F. Montero’s musical-note reference. “Apricots” by BICEP keeps the original vocal sample from the supplied recording, with nine simulated mouths playing the accompaniment. “Glue” by BICEP is a wordless vocal remake prepared from the supplied recording. “House of the Rising Sun” uses a traditional folk tune and opening lines, new verse words and a new vocal arrangement. “All Made of Air” and “Neon Current” are original. The other songs use CHIMERA’s simulated airways for every sound; the electronic tracks add effects to the voices. MIDI files stay on your device. To work from MP3 audio, use the <a href="?solo=1">single-mouth player</a>; automatic separation into a full vocal arrangement is not included.</p>
    </main>
  </div>;
}

function BandHead({part,track,mixer,index,bpm,showWords,quartet,ensemble}:{part:BandPart;track:TeleTrack;mixer:BandMixer;index:number;bpm:number;showWords:boolean;quartet?:boolean;ensemble?:boolean}){
  const model=useRetainedModel(track.body,track.sampleRate);
  const {feed,overlay}=useMemo(()=>{
    if(!model)return {feed:undefined,overlay:undefined};
    const syllables=part.melody?lyricsToSyllables(part.melody.lyrics||"ah"):[];
    const feed:HeadFeed={model,view:{pressure:true,particles:true,grid:false,calipers:false},maxDpr:1,sharedRenderer:ensemble,maxFps:ensemble?20:undefined,facing:quartet?(index>=2?-1:1):(index%3===2?-1:1),
      frame:()=>{
        const time=mixer.time(),tele=track.message(track.indexAt(time),bpm?Math.floor(time*bpm/60*4)%16:-1);
        return {tele:mixer.isPlaying&&mixer.audible(index)?tele:null,artic:VoiceModel.articFromArray(tele.t.artic),epoch:mixer.epoch};
      }};
    const overlay=mouthWords(()=>{
      if(!showWords||part.delivery==="whistle"||!mixer.isPlaying||!mixer.audible(index)||!part.melody)return null;
      const time=mixer.time()-.35,k=part.melody.notes.findIndex(n=>time>=n.start&&time<n.start+n.duration);
      const lyric=k>=0?(part.melody.notes[k].lyricIndex??k):-1;
      return k>=0?{key:lyric,text:syllables[lyric%syllables.length]?.text??""}:null;
    },V.green,feed.facing);
    return {feed,overlay};
  },[model,part.id,track,mixer,index,bpm,showWords,quartet,ensemble]);
  return <Screen className="band-head" title={part.name} sub={part.role} label={`${part.name} mouth`}>{feed&&<AnatomyView3D feed={feed} overlay={overlay} readouts={false}/>}</Screen>;
}
function message(e:unknown):string{return e instanceof Error?e.message:String(e);}
