import {sceneCue,type SceneFile} from './scene.ts';
import type {Transport} from '../show/transport.ts';
export interface StageCapture {draw(time:number):HTMLCanvasElement;release():void}
export interface SceneStage {capture():StageCapture}
export interface VideoFile {blob:Blob;extension:'mp4'|'webm'}

export function videoFormat(supported:(mime:string)=>boolean):{mimeType:string;extension:'mp4'|'webm'}{
  for(const mimeType of ['video/mp4;codecs=avc1.64001f,mp4a.40.2','video/mp4;codecs=avc1.42E01F,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']){
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

/** One complete take, from zero. The video track and audio tap use the same source clock. */
export async function recordSceneVideo(stage:SceneStage,scene:SceneFile,transport:Transport,onProgress:(time:number)=>void,signal:AbortSignal):Promise<VideoFile>{
  if(typeof MediaRecorder==='undefined')throw Error('This browser cannot save video. Try opening the scene in another browser.');
  if(document.hidden)throw Error('Keep this tab visible while preparing the video.');
  const format=videoFormat(m=>MediaRecorder.isTypeSupported(m));
  const previous=transport.time();transport.pause();transport.seek(0);
  let capture:StageCapture|undefined,video:MediaStream|undefined,audio:MediaStreamAudioDestinationNode|undefined,recorder:MediaRecorder|undefined,untap:(()=>void)|undefined;
  let raf=0,timer:ReturnType<typeof setTimeout>|undefined;
  let abortListener=()=>{},visibilityListener=()=>{};
  try{
    await transport.ctx.resume();await document.fonts.ready;
    if(signal.aborted)throw new DOMException('Video export cancelled.','AbortError');
    capture=stage.capture();
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
    const ctx=canvas.getContext('2d');if(!ctx||!canvas.captureStream)throw Error('This browser cannot capture the scene video.');
    drawVideoFrame(ctx,capture.draw(0),scene,0);
    video=canvas.captureStream(30);audio=transport.ctx.createMediaStreamDestination();untap=transport.connectOutput(audio);
    const stream=new MediaStream([...video.getVideoTracks(),...audio.stream.getAudioTracks()]);
    recorder=new MediaRecorder(stream,{mimeType:format.mimeType,videoBitsPerSecond:5_000_000,audioBitsPerSecond:192_000});
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
          if(!transport.isPlaying&&time<scene.duration-.05){fail(Error('Audio was interrupted. Please try preparing the video again.'));return;}
          if(now-lastDraw>=1000/30){drawVideoFrame(ctx,capture!.draw(time),scene,time);lastDraw=now;}
          if(now-lastProgress>150){onProgress(time);lastProgress=now;}
          if(time>=scene.duration-.001){stopping=true;onProgress(scene.duration);timer=setTimeout(()=>{if(writer.state!=='inactive')writer.stop();},150);return;}
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
