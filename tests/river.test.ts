import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {riverPose,riverCamera} from '../src/scene/river.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {RiverStage}=await import('../src/ui/render/river.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/rechenka/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const performance:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('the river scene keeps the full performance, vocalise, boat ending and applause',()=>{
 expect(movieScene('rechenka')).toBeDefined();expect(scene.setting).toBe('river');
 expect(scene.duration).toBeGreaterThan(228);expect(scene.duration).toBeLessThan(229);
 expect(scene.characters.map(c=>c.id)).toEqual(['diana']);expect(scene.cues.length).toBe(18);
 expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(file('backing.mp3').length).toBeGreaterThan(7_000_000);
 expect(performance.parts.at(-1)?.recordingType).toBe('instrumental');
 expect(sceneCue(scene,12)?.text).toContain('река');expect(sceneCue(scene,151)?.text).toBe('А-а-а');expect(sceneCue(scene,212)?.text).toContain('колыбнёшься');
 for(const t of [0,3,220,227])expect(sceneCue(scene,t)).toBeUndefined();
 expect(sceneCamera(scene,53,'auto')).toBe('river-judges');expect(sceneCamera(scene,97,'auto')).toBe('river-dancers');expect(sceneCamera(scene,205,'auto')).toBe('river-singer');
 expect(()=>validateScene({...scene,setting:'karaoke'})).toThrow('character');expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'dimash'}]})).toThrow('camera');
});
test('Russian soft consonants and held vowels remain physical and aligned to the complete audio',()=>{
 const part=performance.parts[0],p=part.performance!;expect(validPerformance(p,performance.duration)).toBe(true);expect(p.phrases.length).toBe(22);
 const gestures=planPart(part);expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);
 expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 const phones=p.phrases.flatMap(p=>p.phones);for(const ipa of ['ɨ','ɐ','ʂ','ʐ','ts','r'])expect(phones.some(p=>p.ipa===ipa)).toBe(true);
 expect(phones.filter(p=>p.palatalized).length).toBe(62);expect(phones.every(p=>!p.ipa.includes('ʲ'))).toBe(true);
 expect(Math.max(...p.contour.map(c=>c.hz))).toBeGreaterThan(740);expect(Math.min(...p.contour.map(c=>c.hz))).toBeLessThan(160);
 for(const t of [0,2,7,221,227])expect(track.message(track.indexAt(t)).t.gate).toBeLessThan(.01);
 for(const t of [16,79,82])expect(track.message(track.indexAt(t)).t.outRms).toBeLessThan(.0001);
 // Long notes were previously truncated at ASR word-label endpoints.
 for(const t of [12,19,31,39,51,65,88,99,120,140,153,170,182,205,214])expect(track.message(track.indexAt(t)).t.outRms).toBeGreaterThan(.0001);
});

test('river cameras frame the singer and gestures survive pause and backward seeks',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new RiverStage(model,track),update=spyOn(stage.head,'update');
 const motion=()=>{const out:number[]=[];for(const group of [stage.hands.group,stage.microphone.group,stage.dancers.group,stage.audience.group])group.traverseVisible(o=>{
  const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));
 });return out;};
 try{
  for(const [w,h] of [[1280,720],[375,211],[375,430]])for(const view of SCENE_SETTINGS.river.cameras){
   stage.resize(w,h);stage.frame(185,true,1,view,.6,'diana');
   const cam=riverCamera(view,w/h,185);expect([...cam.position,...cam.target,cam.fov].every(Number.isFinite)).toBe(true);
   if(view==='wide'||view==='diana'||view==='river-singer'){
    let count=0,framed=true;
    stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(!a)return;
     for(let i=0;i<m.geometry.instanceCount;i++){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;framed&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&v.z<1;}
    });expect(count).toBeGreaterThan(1000);expect(framed).toBe(true);
   }
  }
  for(const t of [10,56,80,120,138,158,219,240,0]){
   stage.frame(t,true,2,'wide',.6);const before=motion(),color=stage.scene.background!.clone();
   expect(update.mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(track.message(track.indexAt(t)).t.artic));
   stage.frame(t,false,2,'wide',0);expect(motion()).toEqual(before);
   stage.frame(244,true,3,'wide',0);stage.frame(t,true,4,'wide',0);expect(motion()).toEqual(before);expect(stage.scene.background).toEqual(color);
  }
  expect(riverPose(10).dancers).toBe(0);expect(riverPose(95).dancers).toBe(1);expect(riverPose(105).waterfall).toBe(1);
  expect(riverPose(35).raise).toBe(1);expect(riverPose(205).kneel).toBe(1);expect(riverPose(225).applause).toBe(1);
  expect(riverPose(NaN)).toEqual(riverPose(0));
 }finally{
  update.mockRestore();let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const disposal=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposal).toHaveBeenCalledTimes(0);disposal.mockRestore();model.dispose();
  expect(released).toBe(meshes);expect(stage.hair.group.parent).toBeNull();
 }
});
