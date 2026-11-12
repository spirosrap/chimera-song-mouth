import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import * as THREE from 'three';
import {Anatomy3D} from '../render/anatomy3d.ts';
import {headRendererPool} from '../render/sharedHeadRenderer.ts';
import {VoiceModel} from '../analysis.ts';
import {useRetainedModel} from '../useModel.ts';
import {lyricAt,lyricLines,lyricLayout} from '../../band/lyricVideo.ts';
import {BASE_PATH} from '../../base.ts';
import type {BandMixer} from '../../band/mixer.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {LyricVideoSpec} from '../../band/types.ts';

export function LyricVideo({spec,title,songId,track,mixer,index,controls,showLyrics}:{spec:LyricVideoSpec;title:string;songId:string;track:TeleTrack;mixer:BandMixer;index:number;controls:ReactNode;showLyrics:boolean}){
  const root=useRef<HTMLDivElement>(null),wrap=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const [error,setError]=useState(''),[fullscreen,setFullscreen]=useState(false);
  const model=useRetainedModel(track.body,track.sampleRate),lines=useMemo(()=>lyricLines(spec.words),[spec]);
  useEffect(()=>{const change=()=>setFullscreen(document.fullscreenElement===root.current);document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change);},[]);
  useEffect(()=>{
    if(!model)return;
    const node=canvas.current!,ctx=node.getContext('2d');if(!ctx){setError('The lyric display is unavailable. Audio can still play.');return;}
    let lease:ReturnType<typeof headRendererPool.acquire>|undefined;
    try{lease=headRendererPool.acquire();}catch{setError('The animated mouth needs WebGL. Lyrics and audio can still play.');}
    const renderer=lease?.renderer,head=new Anatomy3D(),size=new THREE.Vector2();head.centred=true;
    const background=new Image();background.src=BASE_PATH+`band/${songId}/${spec.background}`;
    background.onerror=()=>setError('The background could not load. Reload to try again.');
    let w=1,h=1,dpr=1,raf=0,last=-Infinity,previous=-Infinity,epoch=-1,headSize=0;
    const fit=()=>{const box=wrap.current!.getBoundingClientRect();w=Math.max(1,Math.round(box.width));h=Math.max(1,Math.round(box.height));dpr=Math.min(1.5,window.devicePixelRatio||1);node.width=Math.round(w*dpr);node.height=Math.round(h*dpr);};
    fit();const observer=new ResizeObserver(fit);observer.observe(wrap.current!);
    const measure=(text:string,font:number)=>{ctx.font=`700 ${font}px Arial, sans-serif`;return ctx.measureText(text).width;};
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(now-last<1000/30)return;last=now;
      const time=mixer.time(),current=lyricAt(lines,time),layout=lyricLayout(showLyrics?current.line?.words??[]:[],w,h,measure);
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080e17';ctx.fillRect(0,0,w,h);
      if(background.complete&&background.naturalWidth){const scale=Math.max(w/background.naturalWidth,h/background.naturalHeight);ctx.drawImage(background,(w-background.naturalWidth*scale)/2,(h-background.naturalHeight*scale)/2,background.naturalWidth*scale,background.naturalHeight*scale);}
      const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#0008');shade.addColorStop(.4,'#0005');shade.addColorStop(1,'#000a');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
      const labelSize=Math.max(9,w*.015),pad=w*.018;ctx.font=`700 ${labelSize}px Arial, sans-serif`;const label='CHIMERA / '+title.toUpperCase();ctx.fillStyle='#000b';ctx.fillRect(pad,pad,Math.min(w-pad*2,ctx.measureText(label).width+pad*2),labelSize*3.1);ctx.fillStyle='#f1fffb';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(label,pad*2,pad+labelSize*1.05,w-pad*4);ctx.font=`${labelSize*.7}px Arial, sans-serif`;ctx.fillStyle='#9ccec2';ctx.fillText('ONE MOUTH · ORIGINAL MUSIC',pad*2,pad+labelSize*2.15);
      ctx.font=`700 ${layout.font}px Arial, sans-serif`;ctx.lineJoin='round';ctx.textBaseline='middle';
      for(const word of layout.words){
        const active=word.index===current.active;
        if(active){ctx.fillStyle='#064a3a';ctx.beginPath();ctx.roundRect(word.x-layout.font*.12,word.y-layout.font*.65,word.width+layout.font*.24,layout.font*1.3,layout.font*.12);ctx.fill();}
        ctx.strokeStyle='#000c';ctx.lineWidth=Math.max(2,layout.font*.11);ctx.strokeText(word.text,word.x,word.y);ctx.fillStyle=active?'#65ffc9':'#fff';ctx.fillText(word.text,word.x,word.y);
      }
      if(!current.line||!showLyrics){ctx.font=`500 ${Math.max(13,w*.021)}px Arial, sans-serif`;ctx.fillStyle='#d5e6e1';ctx.textAlign='center';ctx.fillText(time<spec.words[0].start?title.split('·')[0].trim().toUpperCase():time>spec.words.at(-1)!.end?'Original music · CHIMERA voice':'',w/2,h*.4);ctx.textAlign='left';}
      const m=layout.mouth;ctx.save();ctx.beginPath();ctx.arc(m.x+m.size/2,m.y+m.size/2,m.size/2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#000e';ctx.fillRect(m.x,m.y,m.size,m.size);
      if(renderer){
        const tele=track.message(track.indexAt(time)),artic=VoiceModel.articFromArray(tele.t.artic);
        const reset=epoch!==mixer.epoch||time<previous||time-previous>.25;if(reset)head.resetMotion();
        if(headSize!==m.size){head.resize(m.size,m.size);headSize=m.size;}const pose=head.poses(model);head.camera.position.copy(pose.home);head.camera.lookAt(pose.target);head.camera.updateMatrixWorld();
        head.update(model,model.frame(artic),artic,mixer.isPlaying&&mixer.audible(index)?tele:null,{pressure:true,particles:true,grid:false,calipers:false},reset?0:Math.max(0,time-previous));
        renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.setPixelRatio(dpr);renderer.setClearColor(0x000000,1);renderer.getSize(size);if(size.x!==m.size||size.y!==m.size)renderer.setSize(m.size,m.size,false);renderer.render(head.scene,head.camera);ctx.drawImage(renderer.domElement,m.x,m.y,m.size,m.size);
        previous=time;epoch=mixer.epoch;
      }
      ctx.restore();ctx.beginPath();ctx.arc(m.x+m.size/2,m.y+m.size/2,m.size/2-1,0,Math.PI*2);ctx.strokeStyle='#81c6b580';ctx.lineWidth=Math.max(1,w*.0012);ctx.stroke();
    };raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();background.onerror=null;head.dispose();lease?.release();};
  },[model,track,mixer,index,lines,spec,songId,title,showLyrics]);
  async function toggleFullscreen(){try{if(document.fullscreenElement===root.current)await document.exitFullscreen();else await root.current?.requestFullscreen();}catch{setError('Fullscreen is unavailable in this browser.');}}
  return <div className="lyric-video" ref={root}><div className="lyric-video-picture" ref={wrap}><canvas ref={canvas} role="img" aria-label="Rainy city street, synchronized highlighted lyrics and a circular animated mouth"/></div><div className="lyric-video-controls">{controls}<button className="chip" onClick={()=>void toggleFullscreen()}>{fullscreen?'Exit fullscreen':'Fullscreen'}</button></div>{error&&<p role="status">{error}</p>}</div>;
}
