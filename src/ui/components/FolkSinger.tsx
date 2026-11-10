import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {Screen} from './Screen.tsx';
import {headRendererPool} from '../render/sharedHeadRenderer.ts';
import {FolkSinger as SingerScene} from '../render/folkSinger.ts';
import {singerOverlay} from '../render/folkSingerOverlay.ts';
import {VoiceModel} from '../analysis.ts';
import {Glow} from '../render/vector.ts';
import {useRetainedModel} from '../useModel.ts';
import type {BandMixer} from '../../band/mixer.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {BandPart} from '../../band/types.ts';

export function FolkSinger({part,caption,track,mixer,index,bpm}:{part:BandPart;caption:string;track:TeleTrack;mixer:BandMixer;index:number;bpm:number}){
  const canvas=useRef<HTMLCanvasElement>(null),wrap=useRef<HTMLDivElement>(null),[error,setError]=useState('');
  const model=useRetainedModel(track.body,track.sampleRate);
  useEffect(()=>{
    if(!model)return;
    const node=canvas.current!,ctx=node.getContext('2d');if(!ctx){setError('The singer graphic is unavailable. The song can still play.');return;}
    let lease:ReturnType<typeof headRendererPool.acquire>;
    try{lease=headRendererPool.acquire();}catch{setError('The singer needs WebGL. The song can still play.');return;}
    const renderer=lease.renderer,singer=new SingerScene(model,track,bpm),overlay=singerOverlay(part),glow=new Glow(),size=new THREE.Vector2();let w=1,h=1,dpr=1,raf=0,last=-Infinity;
    const fit=()=>{const box=wrap.current!.getBoundingClientRect();w=Math.max(1,Math.round(box.width));h=Math.max(1,Math.round(box.height));dpr=Math.min(1.5,window.devicePixelRatio||1);node.width=Math.round(w*dpr);node.height=Math.round(h*dpr);singer.resize(w,h);};
    fit();const observer=new ResizeObserver(fit);observer.observe(wrap.current!);
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(now-last<1000/30)return;last=now;
      const time=mixer.time(),audible=mixer.audible(index);
      singer.frame(time,mixer.isPlaying,mixer.epoch,audible);
      renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.setPixelRatio(dpr);renderer.setClearColor(0x000000,1);renderer.getSize(size);if(size.x!==w||size.y!==h)renderer.setSize(w,h,false);
      renderer.render(singer.scene,singer.camera);ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(renderer.domElement,0,0,node.width,node.height);ctx.setTransform(dpr,0,0,dpr,0,0);
      const artic=VoiceModel.articFromArray(track.message(track.indexAt(time)).t.artic),mouth=model.frame(artic);
      overlay(ctx,singer.head.faceView(model,mouth,artic),model,mouth,artic,{w,h,dt:0},{time,epoch:mixer.epoch,audible});
      glow.apply(node,ctx,dpr);
    };raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();singer.dispose();lease.release();};
  },[model,track,mixer,index,bpm,part.melody,part.delivery,part.whistleMelody]);
  return <Screen className="band-head folk-singer-head" title="Συννεφούλα" sub="Singing & whistling · original music" label="Wireframe singer performance"><div className="folk-singer-stage" ref={wrap}><canvas ref={canvas} role="img" aria-label="An animated wireframe singer in a hat, strumming a guitar at a microphone. Sung words drift from the mouth; floating musical notes mark the whistle passages."/>{error&&<p role="status">{error}</p>}</div><p className="folk-singer-caption" aria-label="Current lyric line" aria-live="off">{caption||'\u00a0'}</p></Screen>;
}
