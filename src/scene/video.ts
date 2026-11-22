import {sceneCamera,sceneCue,type SceneCue,type SceneFile} from './scene.ts';
import type {Transport} from '../show/transport.ts';
export interface StageCapture {draw(time:number):HTMLCanvasElement;release():void}
export interface SceneStage {capture(width?:number,height?:number):StageCapture}
export interface VideoFile {blob:Blob;extension:'mp4'|'webm';fast?:boolean}
export type VideoPreset = 'hd'|'x-lyrics';
export interface VideoExportOptions {
  preset?:VideoPreset;
  startTime?:number;
  endTime?:number;
  onMode?:(mode:'offline'|'realtime')=>void;
}

export const VIDEO_PRESETS:Record<VideoPreset,{width:number;height:number;fps:number;videoBitsPerSecond:number;audioBitsPerSecond:number}>={
  hd:{width:1920,height:1080,fps:30,videoBitsPerSecond:8_000_000,audioBitsPerSecond:192_000},
  // Crisp 1080p Full HD 30fps VBR H.264 High + AAC-LC MP4 tuned for X's highest HD playback tier with live lyrics.
  'x-lyrics':{width:1920,height:1080,fps:30,videoBitsPerSecond:4_500_000,audioBitsPerSecond:160_000},
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
export function drawVideoFrame(ctx:CanvasRenderingContext2D,source:CanvasImageSource,scene:SceneFile,time:number,w=1280,h=720):void{
  const s=w/1280;
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);ctx.drawImage(source,0,0,w,h);
  ctx.fillStyle='#000';ctx.fillRect(0,h-Math.round(112*s),w,Math.round(112*s));
  const cue=sceneCue(scene,time);if(!cue)return;
  const name=scene.characters.find(c=>c.id===cue.speaker)?.name??'';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${Math.round(13*s)}px Archivo, sans-serif`;ctx.fillStyle='#d6b786';ctx.fillText(name.toUpperCase(),w/2,h-Math.round(91*s));
  ctx.font=`500 ${Math.round(27*s)}px Archivo, sans-serif`;ctx.fillStyle='#fff';
  const lines=subtitleLines(cue.text,w-Math.round(100*s),txt=>ctx.measureText(txt).width);
  const top=h-Math.round(53*s)-(lines.length-1)*Math.round(17*s);
  lines.forEach((line,i)=>ctx.fillText(line,w/2,top+i*Math.round(34*s)));
}

/** Draws a share-ready 16:9 HD frame with song title header, live word-highlighted lyrics, upcoming preview, and progress bar. */
export function drawLyricsVideoFrame(ctx:CanvasRenderingContext2D,source:CanvasImageSource,scene:SceneFile,time:number,w=1920,h=1080):void{
  const s=w/960;
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  ctx.imageSmoothingEnabled=true;
  if('imageSmoothingQuality' in ctx)ctx.imageSmoothingQuality='high';
  ctx.drawImage(source,0,0,w,h);

  // Subtle top bar with song title & clock
  const topH=Math.round(58*s);
  if(typeof ctx.createLinearGradient==='function'){
    const topGrad=ctx.createLinearGradient(0,0,0,topH);
    topGrad.addColorStop(0,'rgba(8,6,5,0.72)');
    topGrad.addColorStop(1,'rgba(8,6,5,0)');
    ctx.fillStyle=topGrad;
  }else{
    ctx.fillStyle='rgba(8,6,5,0.68)';
  }
  ctx.fillRect(0,0,w,topH);

  ctx.textBaseline='middle';
  ctx.textAlign='left';
  ctx.font=`600 ${Math.round(14*s)}px Archivo, sans-serif`;
  ctx.fillStyle='rgba(246,236,220,0.92)';
  ctx.fillText(scene.title,Math.round(24*s),Math.round(24*s));

  ctx.textAlign='right';
  ctx.font=`500 ${Math.round(12*s)}px Archivo, sans-serif`;
  ctx.fillStyle='rgba(214,183,134,0.88)';
  ctx.fillText(`CHIMERA · ${fmtClock(time)} / ${fmtClock(scene.duration)}`,w-Math.round(24*s),Math.round(24*s));

  // Bottom cinema gradient for live lyrics deck
  const deckH=Math.round(158*s),fadeH=Math.round(36*s);
  if(typeof ctx.createLinearGradient==='function'){
    const botGrad=ctx.createLinearGradient(0,h-deckH-fadeH,0,h);
    botGrad.addColorStop(0,'rgba(8,6,5,0)');
    botGrad.addColorStop(0.28,'rgba(8,6,5,0.78)');
    botGrad.addColorStop(1,'rgba(6,5,4,0.95)');
    ctx.fillStyle=botGrad;
  }else{
    ctx.fillStyle='rgba(8,6,5,0.88)';
  }
  ctx.fillRect(0,h-deckH-fadeH,w,deckH+fadeH);

  const cue=sceneCue(scene,time);
  const next=nextSceneCue(scene,time,cue);
  const maxW=w-Math.round(88*s);

  if(cue){
    const name=scene.characters.find(c=>c.id===cue.speaker)?.name??'';
    ctx.textAlign='center';
    ctx.font=`600 ${Math.round(12*s)}px Archivo, sans-serif`;
    ctx.fillStyle='#e2be82';
    ctx.fillText(name.toUpperCase(),w/2,h-Math.round(126*s));

    ctx.font=`600 ${Math.round(24*s)}px Archivo, sans-serif`;
    const lines=subtitleLines(cue.text,maxW,txt=>ctx.measureText(txt).width).slice(0,2);
    const allWords=lines.flatMap(l=>l.split(/\s+/).filter(Boolean));
    const progress=Math.max(0,Math.min(1,(time-cue.start)/Math.max(0.05,cue.end-cue.start)));
    const litCount=Math.max(1,Math.ceil(progress*allWords.length));
    const lineStartY=lines.length===1?h-Math.round(82*s):h-Math.round(95*s);

    let wordIdx=0;
    ctx.textAlign='left';
    for(let li=0;li<lines.length;li++){
      const words=lines[li].split(/\s+/).filter(Boolean);
      const lineText=words.join(' ');
      const lineW=ctx.measureText(lineText).width;
      let x=(w-lineW)/2;
      const y=lineStartY+li*Math.round(30*s);
      const spaceW=ctx.measureText(' ').width;
      for(let wi=0;wi<words.length;wi++){
        const word=words[wi];
        const lit=wordIdx<litCount;
        ctx.fillStyle=lit?'#ffd98a':'rgba(255,255,255,0.92)';
        ctx.fillText(word,x,y);
        x+=ctx.measureText(word).width+spaceW;
        wordIdx++;
      }
    }

    if(next){
      ctx.textAlign='center';
      ctx.font=`400 ${Math.round(14*s)}px Archivo, sans-serif`;
      ctx.fillStyle='rgba(232,220,202,0.58)';
      const preview=subtitleLines(next.text,maxW,txt=>ctx.measureText(txt).width)[0]??next.text;
      ctx.fillText(preview,w/2,h-Math.round(32*s));
    }
  }else if(next){
    ctx.textAlign='center';
    ctx.font=`500 ${Math.round(12*s)}px Archivo, sans-serif`;
    ctx.fillStyle='rgba(214,183,134,0.75)';
    ctx.fillText('NEXT LYRIC',w/2,h-Math.round(92*s));
    ctx.font=`500 ${Math.round(18*s)}px Archivo, sans-serif`;
    ctx.fillStyle='rgba(244,236,222,0.72)';
    const preview=subtitleLines(next.text,maxW,txt=>ctx.measureText(txt).width)[0]??next.text;
    ctx.fillText(preview,w/2,h-Math.round(60*s));
  }

  // Bottom progress bar
  const barH=Math.max(4,Math.round(4*s));
  ctx.fillStyle='rgba(255,255,255,0.16)';
  ctx.fillRect(0,h-barH,w,barH);
  const ratio=scene.duration>0?Math.max(0,Math.min(1,time/scene.duration)):0;
  ctx.fillStyle='#e2be82';
  ctx.fillRect(0,h-barH,Math.round(w*ratio),barH);
}

/** Instant event-loop yield (MessageChannel isn't throttled to 1s in background tabs like setTimeout). */
function yieldImmediate():Promise<void>{
  if(typeof MessageChannel!=='undefined'){
    return new Promise(resolve=>{
      const ch=new MessageChannel();
      ch.port1.onmessage=()=>resolve();
      ch.port2.postMessage(0);
    });
  }
  return new Promise(resolve=>setTimeout(resolve,0));
}

let aacEncoderRegistered=false;

/**
 * Fast, silent, background-safe offline MP4 renderer using WebCodecs H.264 + AAC-LC.
 * Automatically lazy-loads the WASM AAC-LC encoder on browsers (like Linux Brave/Chromium)
 * that lack a built-in proprietary AAC AudioEncoder, guaranteeing an X-compatible H.264+AAC MP4.
 */
async function exportSceneVideoOffline(
  stage:SceneStage,
  scene:SceneFile,
  audioBuffer:AudioBuffer,
  presetName:VideoPreset,
  start:number,
  end:number,
  onProgress:(elapsed:number)=>void,
  signal:AbortSignal,
):Promise<VideoFile|null>{
  if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
  const preset=VIDEO_PRESETS[presetName];
  const channels=Math.max(1,Math.min(2,audioBuffer.numberOfChannels));
  const sampleRate=audioBuffer.sampleRate;

  const mb=await import('mediabunny');
  let width=preset.width,height=preset.height,videoBps=preset.videoBitsPerSecond;
  let canH264=await mb.canEncodeVideo('avc',{width,height,bitrate:videoBps});
  if(!canH264&&width>1280){
    width=1280;height=720;videoBps=presetName==='x-lyrics'?3_200_000:6_000_000;
    canH264=await mb.canEncodeVideo('avc',{width,height,bitrate:videoBps});
  }
  if(!canH264)return null;

  let canAac=await mb.canEncodeAudio('aac',{sampleRate,numberOfChannels:channels,bitrate:preset.audioBitsPerSecond});
  if(!canAac){
    if(!aacEncoderRegistered){
      const {registerAacEncoder}=await import('@mediabunny/aac-encoder');
      registerAacEncoder();
      aacEncoderRegistered=true;
    }
    canAac=await mb.canEncodeAudio('aac',{sampleRate,numberOfChannels:channels,bitrate:preset.audioBitsPerSecond});
  }
  if(!canAac)return null;

  let hwH264=false;
  try{
    const hwCheck=await VideoEncoder.isConfigSupported({
      codec:width>1280?'avc1.640028':'avc1.64001f',
      width,height,bitrate:videoBps,framerate:preset.fps,
      hardwareAcceleration:'prefer-hardware',
    });
    hwH264=Boolean(hwCheck.supported);
  }catch{hwH264=false;}

  const target=new mb.BufferTarget();
  const output=new mb.Output({
    format:new mb.Mp4OutputFormat({fastStart:'in-memory'}),
    target,
  });

  let capture:StageCapture|undefined;
  let started=false;
  try{
    await document.fonts.ready;
    if(signal.aborted)throw new DOMException('Video export cancelled.','AbortError');

    capture=stage.capture(width,height);
    const canvas=document.createElement('canvas');
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('This browser cannot render the scene video.');

    const duration=end-start;
    const gopFrames=preset.fps*2;
    const maxShareBps=Math.max(2_500_000,Math.floor((450*8_000_000)/Math.max(1,duration)));
    const effectiveBps=Math.min(videoBps,maxShareBps);

    const videoSource=new mb.CanvasSource(canvas,{
      codec:'avc',
      bitrate:effectiveBps,
      bitrateMode:'variable',
      latencyMode:'quality',
      keyFrameInterval:gopFrames/preset.fps,
      hardwareAcceleration:hwH264?'prefer-hardware':'no-preference',
    });
    const audioSource=new mb.AudioSampleSource({
      codec:'aac',
      bitrate:preset.audioBitsPerSecond,
    });

    output.addVideoTrack(videoSource,{frameRate:preset.fps});
    output.addAudioTrack(audioSource);
    await output.start();
    started=true;

    const totalFrames=Math.max(1,Math.ceil(duration*preset.fps));
    const frameDur=1/preset.fps;

    // Encode audio concurrently in 1-second slices so video progress updates immediately from frame 1!
    const audioTask=(async()=>{
      const startSample=Math.floor(start*sampleRate);
      const endSample=Math.min(audioBuffer.length,Math.ceil(end*sampleRate));
      const chunkSamples=sampleRate; // 1s per chunk (tiny overhead, fast WASM/native AAC encoding)
      for(let pos=startSample;pos<endSample;pos+=chunkSamples){
        if(signal.aborted)throw new DOMException('Video export cancelled.','AbortError');
        const frames=Math.min(chunkSamples,endSample-pos);
        const planar=new Float32Array(frames*channels);
        for(let ch=0;ch<channels;ch++){
          planar.set(audioBuffer.getChannelData(ch).subarray(pos,pos+frames),ch*frames);
        }
        const sample=new mb.AudioSample({
          data:planar,
          format:'f32-planar',
          numberOfChannels:channels,
          sampleRate,
          timestamp:(pos-startSample)/sampleRate,
        });
        try{
          await audioSource.add(sample);
        }finally{
          sample.close();
        }
      }
      audioSource.close();
    })();

    let lastProgressAt=0,lastKeyFrame=-gopFrames,prevView:string|undefined;
    for(let i=0;i<totalFrames;i++){
      if(signal.aborted)throw new DOMException('Video export cancelled.','AbortError');
      const t=Math.min(end,start+i*frameDur);
      const source=capture.draw(t);
      if(presetName==='x-lyrics')drawLyricsVideoFrame(ctx,source,scene,t,width,height);
      else drawVideoFrame(ctx,source,scene,t,width,height);

      const view=sceneCamera(scene,t,'auto');
      const keyFrame=i===0||(i-lastKeyFrame)>=gopFrames||(prevView!==undefined&&view!==prevView);
      if(keyFrame)lastKeyFrame=i;
      prevView=view;
      await videoSource.add(i*frameDur,frameDur,{keyFrame});

      const now=typeof performance!=='undefined'?performance.now():Date.now();
      if(i===0||i%3===0||now-lastProgressAt>80){
        onProgress(Math.min(duration,(i+1)*frameDur));
        lastProgressAt=now;
        await yieldImmediate();
      }
    }
    videoSource.close();

    await audioTask;
    if(signal.aborted)throw new DOMException('Video export cancelled.','AbortError');
    await output.finalize();
    onProgress(duration);

    if(!target.buffer||!target.buffer.byteLength){
      throw Error('The browser created an empty video. Please try again.');
    }
    return {blob:new Blob([target.buffer],{type:'video/mp4'}),extension:'mp4',fast:true};
  }catch(e){
    if(started){try{await output.cancel();}catch{ /* ignore */ }}
    throw e;
  }finally{
    capture?.release();
  }
}

/** Exports a video take (fast offline H.264+AAC MP4 when available, otherwise real-time MediaRecorder fallback). */
export async function recordSceneVideo(stage:SceneStage,scene:SceneFile,transport:Transport,onProgress:(time:number)=>void,signal:AbortSignal,options:VideoExportOptions={}):Promise<VideoFile>{
  const presetName=options.preset??'hd';
  const preset=VIDEO_PRESETS[presetName];
  const start=Math.max(0,Math.min(scene.duration-0.1,options.startTime??0));
  const end=Math.max(start+0.1,Math.min(scene.duration,options.endTime??scene.duration));

  // Prefer fast silent offline H.264 + AAC-LC MP4 export (works on Linux Brave/Chrome/macOS/Windows & background tabs!)
  const buf=transport.audioBuffer;
  if(buf){
    const previous=transport.time();
    transport.pause();
    options.onMode?.('offline');
    try{
      const result=await exportSceneVideoOffline(stage,scene,buf,presetName,start,end,onProgress,signal);
      if(result)return result;
    }finally{
      transport.seek(previous);
    }
  }

  // Real-time MediaRecorder fallback for browsers without WebCodecs support
  if(typeof MediaRecorder==='undefined')throw Error('This browser cannot save video. Try opening the scene in another browser.');
  if(document.hidden)throw Error('Keep this tab visible while preparing the video.');
  options.onMode?.('realtime');
  const format=videoFormat(m=>MediaRecorder.isTypeSupported(m));
  const previous=transport.time();transport.pause();transport.seek(start);
  let capture:StageCapture|undefined,video:MediaStream|undefined,audio:MediaStreamAudioDestinationNode|undefined,recorder:MediaRecorder|undefined,untap:(()=>void)|undefined;
  let raf=0,timer:ReturnType<typeof setTimeout>|undefined;
  let abortListener=()=>{},visibilityListener=()=>{};
  const renderFrame=(ctx:CanvasRenderingContext2D,t:number)=>{
    if(presetName==='x-lyrics')drawLyricsVideoFrame(ctx,capture!.draw(t),scene,t,preset.width,preset.height);
    else drawVideoFrame(ctx,capture!.draw(t),scene,t,preset.width,preset.height);
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
    return {blob,extension:format.extension,fast:false};
  }finally{
    cancelAnimationFrame(raf);if(timer)clearTimeout(timer);
    signal.removeEventListener('abort',abortListener);document.removeEventListener('visibilitychange',visibilityListener);
    if(recorder&&recorder.state!=='inactive')recorder.stop();
    transport.pause();untap?.();video?.getTracks().forEach(t=>t.stop());audio?.stream.getTracks().forEach(t=>t.stop());audio?.disconnect();capture?.release();transport.seek(previous);
  }
}
