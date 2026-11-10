import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {Screen} from './Screen.tsx';
import {headRendererPool} from '../render/sharedHeadRenderer.ts';
import {FolkSinger as SingerScene} from '../render/folkSinger.ts';
import {Glow} from '../render/vector.ts';
import {useRetainedModel} from '../useModel.ts';
import type {BandMixer} from '../../band/mixer.ts';
import type {TeleTrack} from '../../show/tele.ts';

export function FolkSinger({track,mixer,index,bpm}:{track:TeleTrack;mixer:BandMixer;index:number;bpm:number}){
  const canvas=useRef<HTMLCanvasElement>(null),wrap=useRef<HTMLDivElement>(null),[error,setError]=useState('');
  const model=useRetainedModel(track.body,track.sampleRate);
  useEffect(()=>{
    if(!model)return;
    const node=canvas.current!,ctx=node.getContext('2d');if(!ctx){setError('The singer graphic is unavailable. The song can still play.');return;}
    let lease:ReturnType<typeof headRendererPool.acquire>;
    try{lease=headRendererPool.acquire();}catch{setError('The singer needs WebGL. The song can still play.');return;}
    const renderer=lease.renderer,singer=new SingerScene(model,track,bpm),glow=new Glow(),size=new THREE.Vector2();let w=1,h=1,dpr=1,raf=0,last=-Infinity;
    const fit=()=>{const box=wrap.current!.getBoundingClientRect();w=Math.max(1,Math.round(box.width));h=Math.max(1,Math.round(box.height));dpr=Math.min(1.5,window.devicePixelRatio||1);node.width=Math.round(w*dpr);node.height=Math.round(h*dpr);singer.resize(w,h);};
    fit();const observer=new ResizeObserver(fit);observer.observe(wrap.current!);
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(now-last<1000/30)return;last=now;
      singer.frame(mixer.time(),mixer.isPlaying,mixer.epoch,mixer.audible(index));
      renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.setPixelRatio(dpr);renderer.setClearColor(0x000000,1);renderer.getSize(size);if(size.x!==w||size.y!==h)renderer.setSize(w,h,false);
      renderer.render(singer.scene,singer.camera);ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(renderer.domElement,0,0,node.width,node.height);ctx.setTransform(dpr,0,0,dpr,0,0);glow.apply(node,ctx,dpr);
    };raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();singer.dispose();lease.release();};
  },[model,track,mixer,index,bpm]);
  return <Screen className="band-head folk-singer-head" title="Συννεφούλα" sub="Singing & whistling · original music" label="Wireframe singer performance"><div className="folk-singer-stage" ref={wrap}><canvas ref={canvas} role="img" aria-label="An animated wireframe singer in a hat, strumming a guitar at a microphone. The mouth follows the song's Greek vocals and whistle passages."/>{error&&<p role="status">{error}</p>}</div></Screen>;
}
