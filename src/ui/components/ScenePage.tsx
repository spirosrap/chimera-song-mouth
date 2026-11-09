import {unpackTelemetry} from "../../show/unpackTelemetry.ts";
import {MOVIE_SCENES,movieScene,type MovieSceneId} from '../../scene/library.ts';
import {useEffect,useState,useRef} from 'react';
import {validateScene,sceneCue,type CameraChoice,type SceneFile} from '../../scene/scene.ts';
import {TeleTrack} from '../../show/tele.ts';
import {Transport} from '../../show/transport.ts';
import {formatTime} from '../../song/melody.ts';
import {MovieStage} from './MovieStage.tsx';
import {recordSceneVideo,type SceneStage} from '../../scene/video.ts';
import {sceneVideoUrl} from '../../scene/download.ts';
import '../scene.css';

const read=async(base:string,name:string)=>{const r=await fetch(base+name);if(!r.ok)throw Error(`The scene could not load (${r.status}). Reload and try again.`);return r;};
interface LoadedScene{scene:SceneFile;tracks:TeleTrack[]}
export function ScenePage({sceneId}:{sceneId:MovieSceneId}){
  const entry=movieScene(sceneId)!,BASE=`/scenes/${sceneId}/`;
  const [transport,setTransport]=useState<Transport|null>(null),[loaded,setLoaded]=useState<LoadedScene|null>(null),[error,setError]=useState('');
  const [camera,setCamera]=useState<CameraChoice>('auto'),[subtitles,setSubtitles]=useState(true),[,tick]=useState(0),[retry,setRetry]=useState(0);
  const [stage,setStage]=useState<SceneStage|null>(null),[exporting,setExporting]=useState(false),[exportTime,setExportTime]=useState(0),[exportError,setExportError]=useState('');
  const [savedVideo,setSavedVideo]=useState<{url:string;name:string}|null>(null),exportJob=useRef<AbortController|null>(null),mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;exportJob.current?.abort();};},[]);
  useEffect(()=>()=>{if(savedVideo)URL.revokeObjectURL(savedVideo.url);},[savedVideo]);
  async function downloadVideo(){
    if(!stage||!loaded||!transport||exportJob.current)return;
    const controller=new AbortController();exportJob.current=controller;setExporting(true);setExportTime(0);setExportError('');setSavedVideo(null);setCamera('auto');setSubtitles(true);
    try{
      const result=await recordSceneVideo(stage,loaded.scene,transport,setExportTime,controller.signal);
      if(!mounted.current||controller.signal.aborted)return;
      const video={url:URL.createObjectURL(result.blob),name:`${sceneId}-with-subtitles.${result.extension}`};setSavedVideo(video);
      const link=document.createElement('a');link.href=video.url;link.download=video.name;link.click();
    }catch(e){if(mounted.current&&!(e instanceof DOMException&&e.name==='AbortError'))setExportError(e instanceof Error?e.message:String(e));}
    finally{if(exportJob.current===controller)exportJob.current=null;if(mounted.current)setExporting(false);}
  }
  useEffect(()=>{const t=new Transport();setTransport(t);return()=>t.dispose();},[]);
  useEffect(()=>{
    if(!transport)return;let live=true;setError('');setLoaded(null);transport.pause();transport.seek(0);
    void(async()=>{
      const scene=validateScene(await(await read(BASE,'scene.json')).json());
      const [audio,...tele]=await Promise.all([read(BASE,scene.audio).then(r=>r.arrayBuffer()),...scene.characters.map(c=>read(BASE,c.tele+(c.telemetryEncoding==='gzip'?'.gz':'')).then(r=>r.arrayBuffer()).then(unpackTelemetry))]);
      const tracks=tele.map(t=>new TeleTrack(t));
      if(tracks.some(t=>Math.abs(t.duration-scene.duration)>.1))throw Error('The mouth movement and scene audio do not match. Reload and try again.');
      if(!live)return;await transport.load(audio);if(!live)return;
      if(Math.abs(transport.duration-scene.duration)>.1)throw Error('The scene audio is incomplete. Reload and try again.');
      setLoaded({scene,tracks});
    })().catch((e:unknown)=>{if(live)setError(e instanceof Error?e.message:String(e));});
    return()=>{live=false;};
  },[transport,retry,BASE]);
  useEffect(()=>{if(!transport)return;const off=transport.subscribe(()=>tick(n=>n+1));const timer=setInterval(()=>{if(transport.isPlaying)tick(n=>n+1);},80);return()=>{off();clearInterval(timer);};},[transport]);
  const state=transport?.state??{playing:false,time:0,duration:0},scene=loaded?.scene,cue=scene?sceneCue(scene,state.time):undefined;
  const speaker=scene?.characters.find(c=>c.id===cue?.speaker);
  return <div className="scene-page">
    <header className="scene-top"><a className="wordmark" href="?band=1">Chimera</a><span>MOVIE SCENES</span><a href="?band=1">Back to the songs ↗</a></header>
    <main>
      <nav className="scene-picker" aria-label="Movie scenes">{MOVIE_SCENES.map(m=><a key={m.id} className={`chip${m.id===sceneId?' on':''}`} href={`?scene=${m.id}`} aria-current={m.id===sceneId?'page':undefined}>{m.title}</a>)}</nav>
      <div className="scene-intro"><div><p className="scene-eyebrow">{entry.eyebrow}</p><h1>{entry.title}</h1><p>{entry.description}</p></div><span className="scene-runtime">{formatTime(scene?.duration??0)}<small>FULL SCENE</small></span></div>
      <figure className="scene-film">
        {loaded&&transport?<MovieStage scene={loaded.scene} tracks={loaded.tracks} transport={transport} camera={camera} onReady={setStage}/>:<div className="scene-loading"><p role={error?'alert':'status'}>{error||'Preparing the scene…'}</p>{error&&<button className="chip" onClick={()=>setRetry(n=>n+1)}>Reload scene</button>}</div>}
        <figcaption className="scene-caption" aria-live="off">{subtitles&&cue?<><span>{speaker?.name}</span><p>{cue.text}</p></>:<p aria-hidden="true">&nbsp;</p>}</figcaption>
      </figure>
      <div className="scene-transport" aria-label="Movie scene playback">
        <button className="primary large" disabled={!loaded||exporting} onClick={()=>{state.playing?transport?.pause():transport?.play();}}>{state.playing?'Ⅱ Pause':state.time>=state.duration-.05&&state.duration?'▶ Watch again':'▶ Play scene'}</button>
        <button className="chip" disabled={!loaded||exporting} onClick={()=>{transport?.pause();transport?.seek(0);}}>Restart</button>
        <input aria-label="Position in the movie scene" type="range" min={0} max={state.duration||1} step={.05} value={state.time} disabled={!loaded||exporting} onChange={e=>transport?.seek(Number(e.target.value))}/>
        <span>{formatTime(state.time)} / {formatTime(state.duration)}</span>
        <button className="chip" disabled={!loaded||!stage||exporting} onClick={()=>void downloadVideo()}>Record a new video</button>
        {scene&&entry.readyVideo&&<a className="chip" href={sceneVideoUrl(BASE,entry.readyVideo)} download={`${sceneId}-with-subtitles-X-ready.mp4`}>Download MP4 for X</a>}
        {scene&&<a className="chip" href={BASE+scene.audio} download={`${sceneId}-chimera.mp3`}>Download audio</a>}
      </div>
      {exporting&&<div className="scene-export" role="status"><div><strong>Preparing your video · {formatTime(exportTime)} / {formatTime(scene?.duration??0)}</strong><p>Keep this tab open. The full scene is being saved with sound and subtitles.</p></div><progress value={exportTime} max={scene?.duration||1}/><button className="chip" onClick={()=>exportJob.current?.abort()}>Cancel</button></div>}
      {exportError&&<p className="scene-export-error" role="alert">{exportError}</p>}
      {savedVideo&&<p className="scene-export-saved">Video ready. <a href={savedVideo.url} download={savedVideo.name}>Save video</a></p>}
      <div className="scene-options"><fieldset disabled={exporting}><legend>Camera</legend>{(['auto','wide',...(scene?.setting==='cliffs'?['climber','vizzini','inigo','fezzik']:['jessep','kaffee'])] as CameraChoice[]).map(v=><button key={v} className={`chip${camera===v?' on':''}`} aria-pressed={camera===v} onClick={()=>setCamera(v)}>{v==='auto'?'Movie cuts':v==='wide'?'Whole scene':v==='climber'?'The pursuer':scene?.characters.find(c=>c.id===v)?.name??v}</button>)}</fieldset><label><input type="checkbox" disabled={exporting} checked={subtitles} onChange={e=>setSubtitles(e.target.checked)}/>Subtitles</label></div>
      <div className="scene-cast">{scene?.characters.map(c=><div key={c.id}><span>{c.id==='jessep'?'ON THE STAND':c.id==='kaffee'?'AT THE LECTERN':scene.setting==='cliffs'?'ON THE CLIFFS':'OFF CAMERA'}</span><strong>{c.name}</strong><p>{c.role}</p></div>)}</div>
      <p className="scene-credit">{entry.credit} The dialogue is synthesized through CHIMERA’s simulated airways; the original actors’ audio is not played. Dialogue timing and pronunciation are approximate.</p>
    </main>
  </div>;
}
