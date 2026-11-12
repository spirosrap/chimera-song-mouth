import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';import * as THREE from 'three';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {theatrePose,theatreCamera,theatreBeat,THEATRE_POSITIONS} from '../src/scene/theatre.ts';import {THEATRE_BEATS} from '../src/scene/theatre-beats.ts';
import {TeleTrack} from '../src/show/tele.ts';import {initEngine,wasmModule} from './harness.ts';
await initEngine();const {SurrealTheatre}=await import('../src/ui/render/theatre.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');const {planDialoguePart}=await import('../src/scene/dialogue.ts');const {renderTheatreVoice}=await import('../tools/render-theatre-voice.ts');const {planUtterance}=await import('../src/wasm/engine.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/frontier-psychiatrist/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score=JSON.parse(file('performance.json').toString());
const tracks=scene.characters.map(c=>{const b=gunzipSync(file(c.tele+'.gz'));return new TeleTrack(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));});
test('Frontier Psychiatrist preserves the full video, separate samples and curtain ending',()=>{
 expect(movieScene('frontier-psychiatrist')).toBeDefined();expect(scene.setting).toBe('theatre');expect(scene.duration).toBeCloseTo(258.178957,4);expect(scene.characters).toHaveLength(6);expect(scene.cues).toHaveLength(91);expect(scene.shots).toHaveLength(45);expect(sceneCamera(scene,0,'auto')).toBe('theatre-curtain');expect(sceneCamera(scene,60,'auto')).toBe('theatre-turtle');expect(sceneCamera(scene,231,'auto')).toBe('theatre-turntable');expect(sceneCamera(scene,scene.duration,'auto')).toBe('theatre-curtain');expect(scene.duration-scene.cues.at(-1)!.end).toBeGreaterThan(29);
 expect(()=>validateScene({...scene,setting:'classroom'})).toThrow();expect(()=>validateScene({...scene,characters:scene.characters.slice(0,5)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'truman'}]})).toThrow('camera');expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(file('backing.mp3').length).toBeGreaterThan(8_000_000);
});
test('six physical speakers keep source-time words, clear koh/somatic phones and complete telemetry',()=>{
 expect(score.parts).toHaveLength(6);expect(new Set(score.parts.map((p:any)=>p.body.female))).toHaveProperty('size',6);expect(score.sourceOffset).toBe(.35);expect(score.lines).toHaveLength(91);
 for(const [i,p]of score.parts.entries()){expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(planDialoguePart(score,p.id).length).toBeGreaterThan(100);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(p.body.female,5);
  for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,4);
  for(const l of score.lines.filter((l:any)=>l.speaker===p.id)){let peak=0;for(let f=track.indexAt(l.start);f<=track.indexAt(l.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.001);}
  for(const [lo,hi]of [[0,14],[232,258]])for(let t=lo;t<hi;t+=.25)expect(track.message(track.indexAt(t)).t.outRms).toBeLessThan(.00001);
 }
 for(const l of score.lines.filter((l:any)=>l.text.toLowerCase().includes('psychosomatic'))){expect(l.segments.some((p:any)=>p.ipa==='o'&&p.dur>=.14)).toBe(true);expect(l.segments.some((p:any)=>p.ipa==='ə'&&p.dur>=.1)).toBe(true);}
 const first=score.lines.find((l:any)=>l.text==='Psychosomatic.');const second=score.lines.find((l:any)=>l.text===first.text&&l.start>100);expect(second.start-first.start).toBeCloseTo(87.33571,3);
});
test('sample rendering retains quiet gaps and the absolute telemetry clock',()=>{
 const part=score.parts[0],one=planUtterance([{ipa:'s',dur:.12},{ipa:'a',dur:.22}],{body:part.body,t0:.4,f0:130}).gestures,plan=[...one,...one.map(g=>({...g,t0:g.t0+2,t1:g.t1+2}))],r=renderTheatreVoice(wasmModule,part,4,plan),track=new TeleTrack(r.tele);
 expect(r.samples).toHaveLength(192000);expect([...r.samples.subarray(0,4800)].every(x=>x===0)).toBe(true);expect([...r.samples.subarray(60000,90000)].every(x=>x===0)).toBe(true);expect(r.samples.some(x=>Math.abs(x)>.02)).toBe(true);expect(r.samples.every(Number.isFinite)).toBe(true);expect(track.message(track.indexAt(2.5)).t.clock).toBeCloseTo(2.5,5);
});
test('the theatre props, curtain, measured motion and borrowed mouths survive seeking and disposal',()=>{
 const cast=scene.characters.map((c,i)=>({id:c.id as keyof typeof THEATRE_POSITIONS,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new SurrealTheatre(cast);const pose=()=>{const out=stage.actors.flatMap(a=>[...a.root.matrixWorld.elements]);for(const b of [stage.orchestra,stage.ghosts,stage.dancers,stage.record])b.group.traverse(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  expect(stage.actors).toHaveLength(7);expect(stage.actors.at(-1)!.model).toBe(cast[0].model);expect(THEATRE_BEATS.length).toBeGreaterThan(350);THEATRE_BEATS.forEach((t,i)=>expect(theatreBeat(t)).toBeCloseTo(i,4));expect(theatrePose(NaN)).toEqual(theatrePose(0));
  for(const t of [0,257]){stage.frame(t,true,1,'theatre-curtain',0);expect(stage.actors.some(a=>a.root.visible)).toBe(false);expect(stage.furniture.group.visible).toBe(false);expect(stage.orchestra.group.visible).toBe(false);expect(stage.curtainLeft.position.x).toBeCloseTo(0,4);}
  for(const [w,h]of [[1280,720],[375,430]]){stage.resize(w,h);for(const view of SCENE_SETTINGS.theatre.cameras){const c=theatreCamera(view,w/h,80);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   stage.frame(18,true,1,'frontier-headmaster',.5,'frontier-headmaster');expect(stage.actors.filter(a=>a.root.visible)).toHaveLength(1);let n=0,inside=true;stage.actors[0].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);n++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(n).toBeGreaterThan(1000);expect(inside).toBe(true);
  }
  stage.frame(60.5,true,1,'theatre-turtle',.5,'frontier-cowboy');expect(stage.turtle.group.visible).toBe(true);expect(stage.actors.at(-1)!.model).toBe(cast[2].model);expect(stage.actors.at(-1)!.track).toBe(cast[2].track);
  stage.frame(90,true,1,'theatre-blackboard',0);expect(stage.scene.getObjectByName('blackboard-panel')!.visible).toBe(true);expect(stage.furniture.group.visible).toBe(false);stage.frame(50,true,1,'theatre-ghosts',0);expect(stage.scene.getObjectByName('blackboard-panel')!.visible).toBe(false);expect(stage.ghosts.group.visible).toBe(true);stage.frame(231,true,1,'theatre-turntable',0);expect(stage.record.group.visible).toBe(true);
  for(const t of [17,50,60,74,113,142,191,231,253]){stage.frame(t,true,2,'wide',.5);const before=pose();stage.frame(t,false,2,'wide',0);expect(pose()).toEqual(before);stage.frame(250,true,3,'wide',0);stage.frame(t,true,4,'wide',.5);expect(pose()).toEqual(before);}
 }finally{let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(c=>c.model.dispose());}
});
