import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {Screen} from './Screen.tsx';
import {headRendererPool} from '../render/sharedHeadRenderer.ts';
import {SnappingHand} from '../render/snapHand.ts';
import type {BandPart} from '../../band/types.ts';
import type {BandMixer} from '../../band/mixer.ts';
export function SnapHand({part,mixer,index}:{part:BandPart;mixer:BandMixer;index:number}){
 const canvas=useRef<HTMLCanvasElement>(null),wrap=useRef<HTMLDivElement>(null),[error,setError]=useState('');
 useEffect(()=>{
  const node=canvas.current!,ctx=node.getContext('2d')!;let lease:ReturnType<typeof headRendererPool.acquire>;
  try{lease=headRendererPool.acquire();}catch{setError('The hand needs WebGL. Its finger clicks will still play.');return;}
  const renderer=lease.renderer,hand=new SnappingHand(),size=new THREE.Vector2();let w=1,h=1,raf=0,last=-Infinity;
  const fit=()=>{const box=wrap.current!.getBoundingClientRect();w=Math.max(1,Math.round(box.width));h=Math.max(1,Math.round(box.height));node.width=w;node.height=h;hand.resize(w,h);};
  fit();const observer=new ResizeObserver(fit);observer.observe(wrap.current!);
  const frame=(now:number)=>{
   raf=requestAnimationFrame(frame);if(now-last<1000/30)return;last=now;
   hand.frame(part.snaps??[],mixer.time(),mixer.isPlaying&&mixer.audible(index));
   renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.setPixelRatio(1);renderer.getSize(size);if(size.x!==w||size.y!==h)renderer.setSize(w,h,false);
   renderer.render(hand.scene,hand.camera);ctx.drawImage(renderer.domElement,0,0,w,h);
  };raf=requestAnimationFrame(frame);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();hand.dispose();lease.release();};
 },[part.snaps,mixer,index]);
 return <Screen className="band-head" title={part.name} sub={part.role} label="Robotic hand finger clicks"><div className="snap-hand-stage" ref={wrap}>{error?<p role="status">{error}</p>:<canvas ref={canvas} role="img" aria-label="A robotic hand presses its thumb against the middle finger and snaps in time with the song."/>}</div></Screen>;
}
