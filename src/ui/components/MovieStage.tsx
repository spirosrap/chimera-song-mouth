import {ContactBeach} from '../render/contact.ts';
import {ArrivalField} from '../render/arrival.ts';
import {KaraokeRoom} from '../render/karaoke.ts';
import {Cliffs} from '../render/cliffs.ts';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {headRendererPool} from '../render/sharedHeadRenderer.ts';
import {Courtroom} from '../render/courtroom.ts';
import {MemoryCore} from '../render/core.ts';
import {PressConference} from '../render/pressConference.ts';
import {acquireModel} from '../useModel.ts';
import {sceneCamera,sceneCue,type CameraChoice,type SceneFile,type CourtCharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {Transport} from '../../show/transport.ts';
import type {SceneStage} from '../../scene/video.ts';

export function MovieStage({scene,tracks,transport,camera,onReady}:{scene:SceneFile;tracks:TeleTrack[];transport:Transport;camera:CameraChoice;onReady:(stage:SceneStage|null)=>void}){
  const canvasRef=useRef<HTMLCanvasElement>(null),wrapRef=useRef<HTMLDivElement>(null),choice=useRef(camera);
  const [error,setError]=useState('');choice.current=camera;
  useEffect(()=>{
    const canvas=canvasRef.current!,wrap=wrapRef.current!,ctx=canvas.getContext('2d')!;
    let gl:THREE.WebGLRenderer,release:()=>void;
    try{const lease=headRendererPool.acquire();gl=lease.renderer;release=lease.release;}catch{setError('The scene needs WebGL. You can still play and download the scene audio.');return;}
    gl.outputColorSpace=THREE.LinearSRGBColorSpace;
    gl.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
    const leases:(()=>void)[]=[];
    const people=scene.characters.flatMap((c,i)=>{
      if(c.id==='ross'||c.id==='judge')return [];
      const held=acquireModel(tracks[i].body,tracks[i].sampleRate);leases.push(held.release);
      return [{id:c.id,track:tracks[i],model:held.model}];
    });
    const room=scene.setting==='arrival'
      ?new ArrivalField(people[0].model,people[0].track)
      :scene.setting==='beach'
      ?new ContactBeach(people.flatMap(c=>c.id==='ellie'||c.id==='father'?[{...c,id:c.id}]:[]))
      :scene.setting==='karaoke'
      ?new KaraokeRoom(people[0].model,people[0].track)
      :scene.setting==='press'
      ?new PressConference(people[0].model,people[0].track)
      :scene.setting==='core'
      ?new MemoryCore(people.flatMap(c=>c.id==='hal'||c.id==='dave'?[{...c,id:c.id}]:[]),scene.duration)
      :scene.setting==='cliffs'
      ?new Cliffs(people.flatMap(c=>c.id==='vizzini'||c.id==='inigo'||c.id==='fezzik'?[{...c,id:c.id}]:[]))
      :new Courtroom(people.flatMap(c=>c.id==='kaffee'||c.id==='jessep'?[{...c,id:c.id as CourtCharacterId}]:[]));
    let capturing=false,alive=true;
    const fit=()=>{if(capturing||!alive)return;gl.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));const rect=wrap.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);gl.setSize(w,h,false);canvas.width=gl.domElement.width;canvas.height=gl.domElement.height;room.resize(w,h);};
    fit();const observer=new ResizeObserver(fit);observer.observe(wrap);
    let raf=0,last=-Infinity,visible=true;
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'});visibility.observe(wrap);
    const draw=(time:number,recording=false)=>{
      if(!alive)throw Error('The scene was closed.');
      const cue=sceneCue(scene,time);
      room.frame(time,recording||transport.isPlaying,transport.epoch,sceneCamera(scene,time,recording?'auto':choice.current),cue?.intensity??0,cue?.speaker);
      gl.render(room.scene,room.camera);ctx.drawImage(gl.domElement,0,0,canvas.width,canvas.height);return canvas;
    };
    onReady({capture:()=>{
      if(!alive||capturing)throw Error('The scene is already preparing a video.');
      capturing=true;gl.setPixelRatio(1);gl.setSize(1280,720,false);canvas.width=1280;canvas.height=720;room.resize(1280,720);
      let released=false;
      return {draw:(time)=>draw(time,true),release:()=>{if(released)return;released=true;capturing=false;if(alive)fit();}};
    }});
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(capturing||!visible||now-last<1000/30)return;last=now;draw(transport.time());
    };
    raf=requestAnimationFrame(frame);
    return()=>{alive=false;onReady(null);cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();room.dispose();leases.forEach(off=>off());release();};
  },[scene,tracks,transport,onReady]);
  return <div ref={wrapRef} className={`courtroom-stage${scene.setting==='core'?' core-stage':scene.setting==='press'?' press-stage':''}`}>{error?<p role="status">{error}</p>:<canvas ref={canvasRef} role="img" aria-label={scene.setting==='arrival'?'Ian and Louise stand at a wireframe field camp beneath a dusk sky. Ian looks up, then turns toward Louise; his mouth follows the physical dialogue while she reacts silently.':scene.setting==='beach'?'Two physical mouth characters meet on a glowing beach beneath a spiral galaxy. Ellie wears a flight suit and headset; her father approaches, embraces her and joins her on the sand. Their mouths follow the reconstructed dialogue.':scene.setting==='karaoke'?'A wireframe singer with shoulder-length hair and a handheld microphone in a warm karaoke room. A seated listener in glasses and a cardigan watches and joins the applause. The mouth follows the physical singing.':scene.setting==='press'?'A robotic speaker in a wireframe suit and red tie, behind a lectern with two microphones and an American flag. His mouth, head and hand follow the speech.':scene.setting==='core'?'A dark red memory core. A simulated mouth speaks from the computer’s eye while an astronaut removes glowing modules from the wall, and the room dims.':scene.setting==='cliffs'?'The Cliffs of Insanity with three wireframe characters and a masked climber. Their simulated mouths follow the dialogue.':'A cinematic courtroom with two wireframe characters. The simulated mouths follow the spoken dialogue.'}/>}</div>;
}
