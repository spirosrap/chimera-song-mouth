import { useEffect, useRef, useState } from "react";
import { SONGS, formatTime, type Melody, type MelodyNote } from "../../song/melody.ts";
import { readMidi } from "../../song/midi.ts";
import { playMelody, stopSinging, useSing } from "../singing.ts";
import { useStore } from "../store.ts";

export function SongPanel() {
  const [song,setSong]=useState<Melody>(SONGS[0]);
  const [parts,setParts]=useState<Melody[]>([]);
  const [busy,setBusy]=useState(false);
  const [progress,setProgress]=useState(0);
  const [error,setError]=useState("");
  const [speed,setSpeed]=useState(1);
  const [transpose,setTranspose]=useState(0);
  const [original,setOriginal]=useState<string|null>(null);
  const [starting,setStarting]=useState(false);
  const file=useRef<HTMLInputElement>(null);
  const worker=useRef<Worker|null>(null);
  const job=useRef(0);
  const originalAudio=useRef<HTMLAudioElement>(null);
  const demo=useSing(s=>s.demo);
  const elapsed=useSing(s=>s.elapsed);
  const duration=useSing(s=>s.duration);
  const renderProgress=useSing(s=>s.renderProgress);
  const playing=demo===song.name;

  useEffect(()=>{useSing.getState().setLyrics(SONGS[0].lyrics);return()=>{job.current++;worker.current?.terminate();};},[]);
  useEffect(()=>()=>{if(original)URL.revokeObjectURL(original);},[original]);

  function choose(next:Melody) {
    stopSinging(); originalAudio.current?.pause();
    setSong(next); useSing.getState().setLyrics(next.lyrics); setError("");
  }

  async function importFile(input:File) {
    stopSinging(); originalAudio.current?.pause();
    worker.current?.terminate();
    const token=++job.current;
    setError("");setBusy(true);setProgress(0);setOriginal(null);
    try {
      if(input.size>50*1024*1024)throw new Error("Choose a file smaller than 50 MB.");
      const bytes=await input.arrayBuffer();
      if(token!==job.current)return;
      if(/\.midi?$/i.test(input.name)) {
        const imported=readMidi(bytes,input.name.replace(/\.midi?$/i,""));
        setParts(imported);choose(imported[0]);
      } else {
        setProgress(-1);
        // Decoding and downsampling use an offline context: choosing a file never plays it.
        const decoder=new OfflineAudioContext(1,1,8000);
        let audio:AudioBuffer;
        try { audio=await decoder.decodeAudioData(bytes); }
        catch { throw new Error("This audio format could not be read. Try an MP3, WAV, M4A or OGG file."); }
        if(token!==job.current)return;
        if(audio.duration>180)throw new Error("Choose an audio excerpt under 3 minutes.");
        if(audio.duration<.2)throw new Error("This audio clip is too short.");
        const render=new OfflineAudioContext(1,Math.ceil(audio.duration*8000),8000);
        const source=render.createBufferSource();source.buffer=audio;source.connect(render.destination);source.start();
        const mono=(await render.startRendering()).getChannelData(0);
        if(token!==job.current)return;
        setProgress(0);
        const notes=await new Promise<MelodyNote[]>((resolve,reject)=>{
          const w=new Worker(new URL("../../song/pitch.worker.ts",import.meta.url),{type:"module"});worker.current=w;
          w.onmessage=(e)=>{
            if(token!==job.current)return;
            if(e.data.type==="progress")setProgress(e.data.value);
            else {w.terminate();worker.current=null;e.data.type==="done"?resolve(e.data.notes):reject(new Error(e.data.message));}
          };
          w.onerror=()=>{w.terminate();worker.current=null;reject(new Error("The melody analysis could not finish. Try a shorter clip."));};
          w.postMessage(mono,[mono.buffer]);
        });
        if(token!==job.current)return;
        if(!notes.length)throw new Error("No clear melody found. Try a solo vocal, humming, or a MIDI melody.");
        const next:Melody={name:input.name.replace(/\.[^.]+$/,""),notes,duration:audio.duration,lyrics:"",source:"Estimated melody · best with solo vocals or humming"};
        setParts([]);choose(next);setOriginal(URL.createObjectURL(input));
      }
    } catch(e){if(token===job.current)setError(e instanceof Error?e.message:String(e));}
    finally {if(token===job.current)setBusy(false);}
  }

  async function play() {
    if(playing){stopSinging();return;}
    originalAudio.current?.pause();setError("");setStarting(true);
    try { const state=useStore.getState();await playMelody(song,state.body,state.start,speed,transpose,{source:{...state.source},artic:{...state.artic},tipFree:state.tipFree}); }
    catch(e){setError(e instanceof Error?e.message:String(e));}
    finally {setStarting(false);}
  }
  const shown=playing?elapsed:0;
  const total=playing?duration:song.duration/speed+.35;
  return <div className="song-picker" onKeyDown={e=>e.stopPropagation()}>
    <p className="song-intro">Pick a song. Give it a mouth.</p>
    <a className="band-link" href="?band=1">Hear a whole a cappella band →</a>
    <div className="song-source-row">
      <label className="song-select">Song
        <select value={SONGS.includes(song)?song.name:"imported"} disabled={busy} onChange={e=>{
          const s=SONGS.find(x=>x.name===e.target.value);if(s){setParts([]);setOriginal(null);choose(s);}
        }}>
          {SONGS.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
          {!SONGS.includes(song)&&<option value="imported">{song.name}</option>}
        </select>
      </label>
      <button className="chip" disabled={busy} onClick={()=>file.current?.click()}>Import audio / MIDI</button>
      <input ref={file} className="song-file" type="file" accept="audio/*,.mid,.midi" aria-label="Import a song file" onChange={e=>{
        const f=e.target.files?.[0];e.target.value="";if(f)void importFile(f);
      }}/>
    </div>
    {parts.length>1&&<label className="song-part">Melody part
      <select aria-label="MIDI melody part" value={parts.indexOf(song)} onChange={e=>choose(parts[Number(e.target.value)])}>
        {parts.map((p,i)=><option key={i} value={i}>{p.name} · {p.notes.length} notes</option>)}
      </select>
    </label>}
    <div className="song-settings">
      <label>Speed <select aria-label="Playback speed" value={speed} onChange={e=>{stopSinging();setSpeed(Number(e.target.value));}}>
        {[.5,.75,1,1.25,1.5].map(s=><option key={s} value={s}>{s}×</option>)}
      </select></label>
      <label>Pitch <select aria-label="Transpose melody" value={transpose} onChange={e=>{stopSinging();setTranspose(Number(e.target.value));}}>
        {[-24,-12,-7,-5,0,5,7,12].map(n=><option key={n} value={n}>{n===0?"Original":`${n>0?"+":""}${n} semitones`}</option>)}
      </select></label>
      <span className="song-meta">{song.notes.length} notes · {formatTime(song.duration/speed)}</span>
    </div>
    <div className="song-transport">
      <button className="primary" disabled={busy||starting} onClick={()=>void play()}>{starting?"Starting…":playing?"■ Stop song":"▶ Sing through the mouth"}</button>
      <progress max={starting?1:Math.max(.1,total)} value={starting?(renderProgress??0):shown} aria-label={starting?"Preparing the voice":"Song playback progress"}/>
      <span className="song-clock">{formatTime(shown)} / {formatTime(total)}</span>
    </div>
    {starting&&renderProgress!==null&&<p role="status">Preparing the voice for smooth playback… {Math.round(renderProgress*100)}% <button className="chip" onClick={stopSinging}>Cancel</button></p>}
    {busy&&<div className="song-analysis" role="status">
      <span>{progress<0?"Reading audio…":`Finding the melody… ${Math.round(progress*100)}%`}</span>
      <button className="chip" onClick={()=>{job.current++;worker.current?.terminate();worker.current=null;setBusy(false);}}>Cancel</button>
    </div>}
    {error&&<p className="error" role="alert">{error}</p>}
    <p className="song-caption">{song.source}. Add words below, or leave lyrics empty for “ah”. Voice changes apply the next time you play.</p>
    <details className="song-help"><summary>About song import</summary>
      <p>Audio import estimates one melody from the recording. Solo vocals or humming work best; a full mix may follow instruments. It does not separate vocals or recognize lyrics. MIDI gives exact notes; choose the melody part if the file has several tracks.</p>
      <p>Files stay on this device. Up to 3 minutes / 50 MB. Spotify and YouTube links are not audio files.</p>
    </details>
    {original&&<details className="song-original"><summary>Compare with your original</summary>
      <audio ref={originalAudio} src={original} controls preload="none" onPlay={()=>stopSinging()}/>
    </details>}
  </div>;
}
