import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {concertPose,concertCamera} from '../src/scene/concert.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {ConcertStage}=await import('../src/ui/render/concert.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/dimash-sos/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const performance:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('SOS keeps the complete supplied concert and captions through the final held note',()=>{
 expect(movieScene('dimash-sos')).toBeDefined();expect(scene.setting).toBe('concert');
 expect(scene.duration).toBeGreaterThan(245.4);expect(scene.duration).toBeLessThan(246);
 expect(scene.characters.map(c=>c.id)).toEqual(['dimash']);expect(scene.cues.length).toBe(29);
 expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(file('backing.mp3').length).toBeGreaterThan(7_000_000);
 expect(performance.parts.at(-1)?.recordingType).toBe('instrumental');
 expect(sceneCue(scene,10)?.text).toContain('Pourquoi je vis');expect(sceneCue(scene,242)?.text).toBe("Dodo l'enfant do");
 for(const t of [0,3,7])expect(sceneCue(scene,t)).toBeUndefined();
 expect(sceneCamera(scene,85,'auto')).toBe('concert-audience');expect(sceneCamera(scene,158,'auto')).toBe('dimash');
 expect(sceneCamera(scene,213,'auto')).toBe('concert-band');
 expect(()=>validateScene({...scene,setting:'karaoke'})).toThrow('character');
 expect(()=>validateScene({...scene,characters:[]})).toThrow();
 expect(()=>validateScene({...scene,shots:[{time:0,view:'opera-tenor'}]})).toThrow('camera');
});

test('French nasal and rounded vowels drive the physical lead across its wide register',()=>{
 const part=performance.parts[0],p=part.performance!;
 expect(validPerformance(p,performance.duration)).toBe(true);expect(p.phrases.length).toBe(32);
 const gestures=planPart(part);expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);
 expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
 expect(track.duration).toBeCloseTo(scene.duration,1);
 const phones=p.phrases.flatMap(p=>p.phones);
 for(const ipa of ['ʁ','y','ø','œ'])expect(phones.some(p=>p.ipa===ipa)).toBe(true);
 expect(phones.filter(p=>p.nasalized).length).toBe(25);
 expect(phones.every(p=>!p.ipa.includes('̃')&&p.ipa!=='ɥ')).toBe(true);
 expect(Math.max(...p.contour.map(c=>c.hz))).toBeGreaterThan(1000);
 expect(Math.min(...p.contour.map(c=>c.hz))).toBeLessThan(160);
 expect(p.contour.every(c=>Number.isFinite(c.hz)&&c.hz<1200)).toBe(true);
 for(const t of [0,2,7])expect(track.message(track.indexAt(t)).t.gate).toBeLessThan(.01);
 for(const t of [10,39,53,80,109,158,168,185,220,241])expect(track.message(track.indexAt(t)).t.outRms).toBeGreaterThan(.0001);
});

test('concert cameras frame the singer and gestures survive pause and backward seeks',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new ConcertStage(model,track),update=spyOn(stage.head,'update');
 const motion=()=>{const out:number[]=[];for(const group of [stage.hands.group,stage.microphone.group,stage.musicians.group,stage.audience.group])group.traverseVisible(o=>{
  const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));
 });return out;};
 try{
  for(const [w,h] of [[1280,720],[375,211],[375,430]])for(const view of SCENE_SETTINGS.concert.cameras){
   stage.resize(w,h);stage.frame(158,true,1,view,.6,'dimash');
   const cam=concertCamera(view,w/h,158);expect([...cam.position,...cam.target,cam.fov].every(Number.isFinite)).toBe(true);
   if(view==='wide'||view==='dimash'||view==='concert-singer'){
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
  expect(concertPose(10).handheld).toBe(0);expect(concertPose(80).handheld).toBe(1);expect(concertPose(158).high).toBe(1);
  expect(concertPose(10).red).toBe(0);expect(concertPose(180).red).toBe(1);
  expect(concertPose(240).applause).toBe(0);expect(concertPose(240).bow).toBe(0);expect(concertPose(240).playing).toBe(1);
  expect(concertPose(NaN)).toEqual(concertPose(0));
 }finally{
  update.mockRestore();let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const disposal=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposal).toHaveBeenCalledTimes(0);disposal.mockRestore();model.dispose();
  expect(released).toBe(meshes);expect(stage.hair.group.parent).toBeNull();
 }
});
