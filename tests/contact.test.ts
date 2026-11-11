import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {contactPose,contactCamera} from '../src/scene/contact.ts';
import type {ContactPerformance} from '../src/scene/contactSpeech.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {ContactBeach}=await import('../src/ui/render/contact.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planContactPart}=await import('../src/scene/contactSpeech.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/contact/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:ContactPerformance=JSON.parse(file('performance.json').toString());
const tracks=Object.fromEntries(['ellie','father'].map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return [id,new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength))];}));

test('Contact includes the full supplied clip with its own two speakers and beach cameras',()=>{
 expect(movieScene('contact')).toBeDefined();expect(scene.setting).toBe('beach');
 expect(scene.duration).toBeGreaterThan(299);expect(scene.duration).toBeLessThan(300);
 expect(scene.characters.map(c=>c.id)).toEqual(['ellie','father']);
 expect(scene.cues).toHaveLength(47);expect(score.lines.flatMap(l=>l.words)).toHaveLength(229);
 expect(file('mix.mp3').length).toBeGreaterThan(9_000_000);expect(file('backing.mp3').length).toBeGreaterThan(9_000_000);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow('incomplete');
 expect(()=>validateScene({...scene,setting:'core'})).toThrow('character');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'listener'}]})).toThrow('camera');
});

test('both physical mouths preserve the musical introduction, turn taking and complete clip clock',()=>{
 for(const id of ['ellie','father']){
  const track=tracks[id];expect(track.duration).toBeCloseTo(scene.duration,1);
  expect(track.body.female).toBeCloseTo(score.parts.find(p=>p.id===id)!.body.female,6);
  for(const t of [0,40,80,108,170,230,298.7]){
   expect(sceneCue(scene,t)).toBeUndefined();
   const msg=track.message(track.indexAt(t)).t;expect(msg.gate).toBeLessThan(.01);expect(msg.outRms).toBeLessThan(.00001);
   expect(msg.clock).toBeCloseTo(track.indexAt(t)/20,4);
  }
  for(const line of score.lines.filter(l=>l.speaker===id)){
   const a=track.indexAt(line.start),b=track.indexAt(line.end);let peak=0;
   for(let i=a;i<=b;i++)peak=Math.max(peak,track.message(i).t.outRms);
   expect(peak).toBeGreaterThan(.001);
  }
 }
 expect(sceneCue(scene,113)?.speaker).toBe('ellie');expect(sceneCue(scene,260)?.speaker).toBe('father');
 expect(sceneCamera(scene,13,'auto')).toBe('contact-sky');expect(sceneCamera(scene,226,'auto')).toBe('contact-hands');
 expect(sceneCamera(scene,220,'ellie')).toBe('ellie');
});

test('prepared pronunciation rebuilds real closures and frication without recorded actor voices',()=>{
 expect(score.parts.every(p=>p.kind==='voice'&&!p.recordingType&&!p.effects)).toBe(true);
 for(const id of ['ellie','father'] as const){
  const plan=planContactPart(score,id);expect(plan.length).toBeGreaterThan(600);expect(plan.length).toBeLessThan(16000);
  expect(plan.every(g=>[g.t0,g.t1,g.rampIn,g.rampOut].every(Number.isFinite)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);
  expect(plan.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  expect(plan.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
 }
 for(const [i,line] of score.lines.entries()){
  expect(line.segments.filter(s=>s.wordEnd)).toHaveLength(line.words.length);
  expect(line.end).toBeGreaterThanOrEqual(line.sourceEnd);
  expect(line.end).toBeLessThan(score.lines[i+1]?.start??scene.duration);
 }
});

test('beach gestures and camera choices are deterministic after seeking',()=>{
 expect(contactPose(78).visible).toBe(false);expect(contactPose(109).visible).toBe(true);
 expect(contactPose(130).hug).toBe(1);expect(contactPose(200).sit).toBe(1);
 expect(contactPose(200).sand).toBe(1);expect(contactPose(240).joined).toBe(1);
 expect(contactPose(NaN)).toEqual(contactPose(0));
 for(const view of ['wide','ellie','father','contact-sky','contact-hands'] as CameraView[])for(const aspect of [16/9,.87]){
  const cam=contactCamera(view,aspect,230);expect([...cam.position,...cam.target,cam.fov].every(Number.isFinite)).toBe(true);
 }
});

test('both heads remain framed and borrow their models through pause, seek and disposal',()=>{
 const cast=(['ellie','father'] as const).map(id=>({id,track:tracks[id],model:new VoiceModel(tracks[id].body,tracks[id].sampleRate)}));
 const stage=new ContactBeach(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const movement=()=>{
  const values:number[]=[];
  for(const group of [...stage.people.map(p=>p.arms.group),stage.ocean.group,stage.galaxy.group])group.traverseVisible(o=>{
   const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');
   if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)values.push(a.getX(i),a.getY(i),a.getZ(i));
  });return values;
 };
 try{
  for(const [w,h] of [[1280,720],[375,430]])for(const view of ['wide','ellie','father'] as CameraView[])for(const t of [130,230]){
   stage.resize(w,h);stage.frame(t,true,1,view,.6,'ellie');
   for(const [i,p] of stage.people.entries())expect(updates[i].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(p.track.message(p.track.indexAt(t)).t.artic));
   const before=movement();stage.frame(t,false,1,view,0);expect(movement()).toEqual(before);
   stage.frame(290,true,2,view,.6);stage.frame(t,true,3,view,.6);expect(movement()).toEqual(before);
   const people=view==='wide'?stage.people:stage.people.filter(p=>p.id===view);let count=0,framed=true;
   for(const p of people)p.head.scene.traverseVisible(o=>{
    const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(!a)return;
    for(let i=0;i<mesh.geometry.instanceCount;i++){
     const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).project(stage.camera);count++;
     framed&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&v.z<1;
    }
   });expect(count).toBeGreaterThan(1000);expect(framed).toBe(true);
  }
 }finally{
  updates.forEach(s=>s.mockRestore());let meshes=0,released=0;
  stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const disposal=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposal).toHaveBeenCalledTimes(0);disposal.mockRestore();
  expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());
 }
});
