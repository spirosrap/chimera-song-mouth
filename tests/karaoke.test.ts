import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,type CameraView} from '../src/scene/scene.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
import {karaokePose,karaokeCamera} from '../src/scene/karaoke.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {KaraokeRoom}=await import('../src/ui/render/karaoke.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/project-hail-mary/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const performance:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('singer.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('the complete karaoke clip appends a scene with its own singer, music and listener camera',()=>{
 expect(MOVIE_SCENES.map(s=>s.id)).toEqual(['a-few-good-men','princess-bride','hal-9000','fool-me-once','project-hail-mary','contact','arrival','matrix-spoon','cuckoos-nest','wizard-of-oz','sagan-dimensions','apollo-11','apollo-13','nessun-dorma','dimash-sos','rechenka','tears-in-rain','big-lebowski','tars','good-will-hunting','truman-show']);
 expect(movieScene('project-hail-mary')).toBeDefined();expect(scene.setting).toBe('karaoke');
 expect(scene.duration).toBeGreaterThan(143);expect(scene.duration).toBeLessThan(144);
 expect(scene.characters.map(c=>c.id)).toEqual(['karaoke-singer']);expect(track.duration).toBeCloseTo(scene.duration,1);
 expect(file('mix.mp3').length).toBeGreaterThan(4_000_000);expect(file('backing.mp3').length).toBeGreaterThan(4_000_000);
 expect(performance.parts[1].recordingType).toBe('instrumental');expect(performance.parts[1].performance).toBeUndefined();
 expect(()=>validateScene({...scene,setting:'press'})).toThrow('character');
 expect(()=>validateScene({...scene,setting:'courtroom'})).toThrow('incomplete');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'bush'}]})).toThrow('camera');
 expect(()=>validateScene({...scene,characters:[]})).toThrow('incomplete');
});

test('singing, the spoken sign-off, pauses and reaction cuts share the original clip clock',()=>{
 expect(sceneCue(scene,18.5)?.text).toContain('Just stop');
 expect(sceneCue(scene,115)?.text.toLowerCase().startsWith('remember')).toBe(true);
 expect(sceneCue(scene,128.3)?.text).toBe('And that is enough');
 for(const t of [1,14,63,131,140]){expect(sceneCue(scene,t)).toBeUndefined();expect(track.message(track.indexAt(t)).t.gate).toBeLessThan(.01);}
 for(const t of [18.5,26.5,54,69.5,84.5,116.5,128.25])expect(track.message(track.indexAt(t)).t.outRms).toBeGreaterThan(.0001);
 expect(sceneCamera(scene,100,'auto')).toBe('listener');expect(sceneCamera(scene,20,'auto')).toBe('karaoke-singer');expect(sceneCamera(scene,136,'auto')).toBe('wide');
 const p=karaokePose(100);expect(p.touch).toBeGreaterThan(.9);expect(karaokePose(135).applause).toBe(1);expect(karaokePose(20).applause).toBe(0);
 expect(karaokePose(100)).toEqual(p);expect(karaokePose(NaN)).toEqual(karaokePose(0));
});

test('the prepared words rebuild through physical closures and clear consonant intervals',()=>{
 const p=performance.parts[0],v=p.performance!;expect(validPerformance(v,performance.duration)).toBe(true);
 expect(p.body.female).toBe(.45);expect(p.melody!.notes).toHaveLength(182);
 expect(lyricsToSyllables(v.lyrics)).toHaveLength(182);expect(p.melody!.notes.map(n=>n.lyricIndex)).toEqual(Array.from({length:182},(_,i)=>i));
 const plan=planPart(p);expect(plan.length).toBeGreaterThan(2500);expect(plan.length).toBeLessThan(16000);
 expect(plan.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);
 expect(plan.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);expect(plan.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
 const opening=v.phrases.find(ph=>ph.start>65&&ph.start<66)!;
 expect(opening.phones[0].ipa).toBe('dʒ');expect(opening.phones[0].duration).toBeGreaterThan(.07);
 expect(opening.phones.filter(ph=>ph.ipa==='s').some(ph=>ph.duration>=.07)).toBe(true);
 expect(opening.phones.some(ph=>ph.ipa==='ɒ')).toBe(true);
 expect(opening.phones.some((ph,i)=>ph.ipa==='ɔ'&&opening.phones[i+1]?.ipa==='ə')).toBe(true);
 const openingPitch=v.contour.filter(c=>c.time>65.8&&c.time<65.9);
 expect(openingPitch.length).toBeGreaterThan(0);expect(openingPitch.every(c=>c.hz>300)).toBe(true);
 expect(track.body.female).toBeCloseTo(p.body.female,6);expect(track.body.child).toBeCloseTo(p.body.child,6);
});

test('singer, microphone and listener stay framed and deterministic through pause and backwards seeking',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new KaraokeRoom(model,track),update=spyOn(stage.head,'update');
 const movement=()=>{
  const values:number[]=[];
  for(const group of [stage.hands.group,stage.microphone.group,stage.listenerHands.group])group.traverseVisible(o=>{
   const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');
   if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)values.push(a.getX(i),a.getY(i),a.getZ(i));
  });return values;
 };
 try{
  for(const [w,h] of [[1280,720],[375,211],[320,180],[375,430]])for(const view of ['wide','karaoke-singer','listener'] as CameraView[]){
   stage.resize(w,h);
   for(const t of [20,75,100,128.3,135,0]){
    stage.frame(t,true,1,view,.6,'karaoke-singer');
    expect(update.mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(track.message(track.indexAt(t)).t.artic));
    const before=movement();stage.frame(t,false,1,view,0);stage.frame(t,false,1,view,0);expect(movement()).toEqual(before);
    stage.frame(140,true,2,view,.6);stage.frame(t,true,3,view,.6);expect(movement()).toEqual(before);
    const camera=karaokeCamera(view,w/h,t);expect([...camera.position,...camera.target,camera.fov].every(Number.isFinite)).toBe(true);
    const objects=view==='wide'?[stage.head.scene,stage.listenerHead.scene]:view==='listener'?[stage.listenerHead.scene]:[stage.head.scene];
    let count=0,framed=true;
    for(const object of objects)object.traverseVisible(o=>{
     const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(!a)return;
     for(let i=0;i<mesh.geometry.instanceCount;i++){
      const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).project(stage.camera);count++;
      framed&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&p.z<1;
     }
    });expect(count).toBeGreaterThan(1000);expect(framed).toBe(true);
   }
  }
 }finally{
  update.mockRestore();let meshes=0,released=0;
  stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const disposal=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposal).toHaveBeenCalledTimes(1);disposal.mockRestore();model.dispose();
  expect(released).toBe(meshes);expect(stage.hair.group.parent).toBeNull();expect(stage.glasses.group.parent).toBeNull();
 }
});
