import {sceneCue,type SceneCue,type SceneFile} from './scene.ts';
import type {Transport} from '../show/transport.ts';
export interface StageCapture {draw(time:number):HTMLCanvasElement;release():void}
export interface SceneStage {capture(width?:number,height?:number):StageCapture}
export interface VideoFile {blob:Blob;extension:'mp4'|'webm'}
export type VideoPreset = 'hd'|'x-lyrics';
export interface VideoExportOptions {
  preset?:VideoPreset;
  startTime?:number;
  endTime?:number;
}

export const VIDEO_PRESETS:Record<VideoPreset,{width:number;height:number;fps:number;videoBitsPerSecond:number;audioBitsPerSecond:number}>={
  hd:{width:1280,height:720,fps:30,videoBitsPerSecond:5_000_000,audioBitsPerSecond:192_000},
  // Compact 540p 24fps H.264/WebM (~12 MB/min) tuned for fast sharing on X with live lyrics.
  'x-lyrics':{width:960,height:540,fps:24,videoBitsPerSecond:1_500_000,audioBitsPerSecond:128_000},
};

export function videoFormat(supported:(mime:string)=>boolean):{mimeType:string;extension:'mp4'|'webm'}{
  for(const mimeType of [
    'video/mp4;codecs=avc1.64001f,mp4a.40.2',
    'video/mp4;codecs=avc1.4d001f,mp4a.40.2',
    'video/mp4;codecs=avc1.42E01F,mp4a.40.2',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]){
    if(supported(mimeType))return {mimeType,extension:mimeType.startsWith('video/mp4')?'mp4':'webm'};
  }
  throw Error('This browser cannot save video. Try opening the scene in another browser.');
}

export function subtitleLines(text:string,maxWidth:number,measure:(s:string)=>number):string[]{
  const lines:string[]=[];let line='';
  for(const word of text.split(/\s+/).filter(Boolean)){
    const next=line?`${line} ${word}`:word;
    if(line&&measure(next)>maxWidth){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);return lines;
}

export function nextSceneCue(scene:SceneFile,time:number,active?:SceneCue):SceneCue|undefined{
  if(active){
    const idx=scene.cues.indexOf(active);
    return idx>=0?scene.cues[idx+1]:scene.cues.find(c=>c.start>=active.end);
  }
  return scene.cues.find(c=>c.start>time);
}

function fmtClock(sec:number):string{
  const s=Math.max(0,Math.floor(sec));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

/** Subtitles are drawn into the video pixels, independently of the page's subtitle switch. */
export function drawVideoFrame(ctx:CanvasRenderingContext2D,source:CanvasImageSource,scene:SceneFile,time:number):void{
  const w=1280,h=720;
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);ctx.drawImage(source,0,0,w,h);
  ctx.fillStyle='#000';ctx.fillRect(0,h-112,w,112);
  const cue=sceneCue(scene,time);if(!cue)return;
  const name=scene.characters.find(c=>c.id===cue.speaker)?.name??'';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 13px Archivo, sans-serif';ctx.fillStyle='#d6b786';ctx.fillText(name.toUpperCase(),w/2,h-91);
  ctx.font='500 27px Archivo, sans-serif';ctx.fillStyle='#fff';
  const lines=subtitleLines(cue.text,w-100,s=>ctx.measureText(s).width);
  const top=h-53-(lines.length-1)*17;
  lines.forEach((line,i)=>ctx.fillText(line,w/2,top+i*34));
}

/** Draws a share-ready 16:9 frame with song title header, live word-highlighted lyrics, upcoming preview, and progress bar. */
export function drawLyricsVideoFrame(ctx:CanvasRenderingContext2D,source:CanvasImageSource,scene:SceneFile,time:number,w=960,h=540):void{
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  ctx.drawImage(source,0,0,w,h);

  // Subtle top bar with song title & clock
  if(typeof ctx.createLinearGradient==='function'){
    const topGrad=ctx.createLinearGradient(0,0,0,58);
    topGrad.addColorStop(0,'rgba(8,6,5,0.72)');
    topGrad.addColorStop(1,'rgba(8,6,5,0)');
    ctx.fillStyle=topGrad;
  }else{
    ctx.fillStyle='rgba(8,6,5,0.68)';
  }
  ctx.fillRect(0,0,w,58);

  ctx.textBaseline='middle';
  ctx.textAlign='left';
  ctx.font='600 14px Archivo, sans-serif';
  ctx.fillStyle='rgba(246,236,220,0.92)';
  ctx.fillText(scene.title,24,24);

  ctx.textAlign='right';
  ctx.font='500 12px Archivo, sans-serif';
  ctx.fillStyle='rgba(214,183,134,0.88)';
  ctx.fillText(`CHIMERA · ${fmtClock(time)} / ${fmtClock(scene.duration)}`,w-24,24);

  // Bottom cinema gradient for live lyrics deck
  const deckH=158;
  if(typeof ctx.createLinearGradient==='function'){
    const botGrad=ctx.createLinearGradient(0,h-deckH-36,0,h);
    botGrad.addColorStop(0,'rgba(8,6,5,0)');
    botGrad.addColorStop(0.28,'rgba(8,6,5,0.78)');
    botGrad.addColorStop(1,'rgba(6,5,4,0.95)');
    ctx.fillStyle=botGrad;
  }else{
    ctx.fillStyle='rgba(8,6,5,0.88)';
  }
  ctx.fillRect(0,h-deckH-36,w,deckH+36);

  const cue=sceneCue(scene,time);
  const next=nextSceneCue(scene,time,cue);
  const maxW=w-88;

  if(cue){
    const name=scene.characters.find(c=>c.id===cue.speaker)?.name??'';
    ctx.textAlign='center';
    ctx.font='600 12px Archivo, sans-serif';
    ctx.fillStyle='#e2be82';
    ctx.fillText(name.toUpperCase(),w/2,h-126);

    ctx.font='600 24px Archivo, sans-serif';
    const lines=subtitleLines(cue.text,maxW,s=>ctx.measureText(s).width).slice(0,2);
    const allWords=lines.flatMap(l=>l.split(/\s+/).filter(Boolean));
    const progress=Math.max(0,Math.min(1,(time-cue.start)/Math.max(0.05,cue.end-cue.start)));
    const litCount=Math.max(1,Math.ceil(progress*allWords.length));
    const lineStartY=lines.length===1?h-82:h-95;

    let wordIdx=0;
    ctx.textAlign='left';
    for(let li=0;li<lines.length;li++){
      const words=lines[li].split(/\s+/).filter(Boolean);
      const lineText=words.join(' ');
      const lineW=ctx.measureText(lineText).width;
      let x=(w-lineW)/2;
      const y=lineStartY+li*30;
      const spaceW=ctx.measureText(' ').width;
      for(let wi=0;wi<words.length;wi++){
        const word=words[wi];
        const lit=wordIdx<litCount;
        ctx.fillStyle=lit?'#ffd98a':'rgba(255,255,255,0.88)';
        ctx.fillText(word,x,y);
        x+=ctx.measureText(word).width+spaceW;
        wordIdx++;
      }
    }

    if(next){
      ctx.textAlign='center';
      ctx.font='400 14px Archivo, sans-serif';
      ctx.fillStyle='rgba(232,220,202,0.58)';
      const preview=subtitleLines(next.text,maxW,s=>ctx.measureText(s).width)[0]??next.text;
      ctx.fillText(preview,w/2,h-32);
    }
  }else if(next){
    ctx.textAlign='center';
    ctx.font='500 12px Archivo, sans-serif';
    ctx.fillStyle='rgba(214,183,134,0.75)';
    ctx.fillText('NEXT LYRIC',w/2,h-92);
    ctx.font='500 18px Archivo, sans-serif';
    ctx.fillStyle='rgba(244,236,222,0.72)';
    const preview=subtitleLines(next.text,maxW,s=>ctx.measureText(s).width)[0]??next.text;
    ctx.fillText(preview,w/2,h-60);
  }

  // Bottom progress bar
  ctx.fillStyle='rgba(255,255,255,0.16)';
  ctx.fillRect(0,h-4,w,4);
  const ratio=scene.duration>0?Math.max(0,Math.min(1,time/scene.duration)):0;
  ctx.fillStyle='#e2be82';
  ctx.fillRect(0,h-4,Math.round(w*ratio),4);
}

/** One complete take (or clip range). The video track and audio tap use the same source clock. */
export async function recordSceneVideo(stage:SceneStage,scene:SceneFile,transport:Transport,onProgress:(time:number)=>void,signal:AbortSignal,options:VideoExportOptions={}):Promise<VideoFile>{
  if(typeof MediaRecorder==='undefined')throw Error('This browser cannot save video. Try opening the scene in another browser.');
  if(document.hidden)throw Error('Keep this tab visible while preparing the video.');
  const presetName=options.preset??'hd';
  const preset=VIDEO_PRESETS[presetName];
  const start=Math.max(0,Math.min(scene.duration-0.1,options.startTime??0));
  const end=Math.max(start+0.1,Math.min(scene.duration,options.endTime??scene.duration));
  const format=videoFormat(m=>MediaRecorder.isTypeSupported(m));
  const previous=transport.time();transport.pause();transport.seek(start);
  let capture:StageCapture|undefined,video:MediaStream|undefined,audio:MediaStreamAudioDestinationNode|undefined,recorder:MediaRecorder|undefined,untap:(()=>void)|undefined;
  let raf=0,timer:ReturnType<typeof setTimeout>|undefined;
  let abortListener=()=>{},visibilityListener=()=>{};
  const renderFrame=(ctx:CanvasRenderingContext2D,t:number)=>{
    if(presetName==='x-lyrics')drawLyricsVideoFrame(ctx,capture!.draw(t),scene,t,preset.width,preset.height);
    else drawVideoFrame(ctx,capture!.draw(t),scene,t);
  };
  try{
    await transport.ctx.resume();await document.fonts.ready;
    if(signal.aborted)throw new DOMException('Video export cancelled.','AbortError');
    capture=stage.capture(preset.width,preset.height);
    const canvas=document.createElement('canvas');canvas.width=preset.width;canvas.height=preset.height;
    const ctx=canvas.getContext('2d');if(!ctx||!canvas.captureStream)throw Error('This browser cannot capture the scene video.');
    renderFrame(ctx,start);
    video=canvas.captureStream(preset.fps);audio=transport.ctx.createMediaStreamDestination();untap=transport.connectOutput(audio);
    const stream=new MediaStream([...video.getVideoTracks(),...audio.stream.getAudioTracks()]);
    recorder=new MediaRecorder(stream,{mimeType:format.mimeType,videoBitsPerSecond:preset.videoBitsPerSecond,audioBitsPerSecond:preset.audioBitsPerSecond});
    const writer=recorder,chunks:Blob[]=[];
    const blob=await new Promise<Blob>((resolve,reject)=>{
      let settled=false,stopping=false,lastDraw=-Infinity,lastProgress=-Infinity;
      const fail=(error:Error)=>{if(settled)return;settled=true;if(writer.state!=='inactive')writer.stop();reject(error);};
      writer.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      writer.onerror=()=>fail(Error('The browser stopped preparing the video. Please try again.'));
      writer.onstop=()=>{if(settled)return;settled=true;if(!stopping){reject(Error('The browser stopped before the full scene was saved. Please try again.'));return;}const result=new Blob(chunks,{type:writer.mimeType||format.mimeType});result.size?resolve(result):reject(Error('The browser created an empty video. Please try again.'));};
      abortListener=()=>fail(new DOMException('Video export cancelled.','AbortError'));
      visibilityListener=()=>{if(document.hidden)fail(Error('Video preparation stopped because the tab was hidden. Keep this tab open and try again.'));};
      signal.addEventListener('abort',abortListener,{once:true});document.addEventListener('visibilitychange',visibilityListener);
      const frame=(now:number)=>{
        if(settled||stopping)return;
        try{
          const time=transport.renderTime();
          if(!transport.isPlaying&&time<end-.05){fail(Error('Audio was interrupted. Please try preparing the video again.'));return;}
          if(now-lastDraw>=1000/preset.fps){renderFrame(ctx,time);lastDraw=now;}
          if(now-lastProgress>150){onProgress(Math.max(0,time-start));lastProgress=now;}
          if(time>=end-.001){stopping=true;onProgress(end-start);timer=setTimeout(()=>{if(writer.state!=='inactive')writer.stop();},150);return;}
          raf=requestAnimationFrame(frame);
        }catch(e){fail(e instanceof Error?e:Error(String(e)));}
      };
      writer.start(1000);transport.play();raf=requestAnimationFrame(frame);
      if(signal.aborted)abortListener();
    });
    return {blob,extension:format.extension};
  }finally{
    cancelAnimationFrame(raf);if(timer)clearTimeout(timer);
    signal.removeEventListener('abort',abortListener);document.removeEventListener('visibilitychange',visibilityListener);
    if(recorder&&recorder.state!=='inactive')recorder.stop();
    transport.pause();untap?.();video?.getTracks().forEach(t=>t.stop());audio?.stream.getTracks().forEach(t=>t.stop());audio?.disconnect();capture?.release();transport.seek(previous);
  }
}
