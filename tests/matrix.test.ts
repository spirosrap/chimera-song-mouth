import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {matrixPose,matrixCamera,matrixSpoonPoint,type MatrixPerson} from '../src/scene/matrix.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {MatrixRoom}=await import('../src/ui/render/matrix.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/matrix-spoon/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance<MatrixPerson>=JSON.parse(file('performance.json').toString());
const ids=['neo','spoon-boy','oracle-assistant'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});

test('Matrix includes the complete clip, all three speakers and both spoon cameras',()=>{
 expect(movieScene('matrix-spoon')).toBeDefined();expect(scene.setting).toBe('matrix');
 expect(scene.duration).toBeGreaterThan(71);expect(scene.duration).toBeLessThan(71.1);
 expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(scene.cues).toHaveLength(8);
 expect(score.lines.flatMap(l=>l.words)).toHaveLength(47);
 expect(file('mix.mp3').length).toBeGreaterThan(2_000_000);expect(file('backing.mp3').length).toBeGreaterThan(2_000_000);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,2)})).toThrow('missing');
 expect(()=>validateScene({...scene,setting:'beach'})).toThrow('character');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'father'}]})).toThrow('camera');
 expect(sceneCamera(scene,1,'auto')).toBe('matrix-floor');expect(sceneCamera(scene,9,'auto')).toBe('matrix-spoon');
 expect(sceneCamera(scene,55,'auto')).toBe('matrix-spoon');expect(sceneCamera(scene,63,'auto')).toBe('oracle-assistant');
 expect(sceneCamera(scene,63,'wide')).toBe('wide');
});

test('the soft opening words and final invitation retain their source timing',()=>{
 const first=score.lines[0],last=score.lines.at(-1)!;
 expect(first.text).toBe('Do not try and bend the spoon.');expect(first.words.slice(0,2).map(w=>w.text.toLowerCase())).toEqual(['do','not']);
 expect(first.start).toBeGreaterThan(23.8);expect(first.start).toBeLessThan(24.1);
 expect(last.speaker).toBe('oracle-assistant');expect(last.start).toBeGreaterThan(62.2);expect(last.end).toBeLessThan(64.2);
 expect(sceneCue(scene,24.1)?.speaker).toBe('spoon-boy');expect(sceneCue(scene,63)?.speaker).toBe('oracle-assistant');
 for(const t of [0,5,12,19,23,48,53,60,66,70]){
  expect(sceneCue(scene,t)).toBeUndefined();
  for(const track of tracks){const msg=track.message(track.indexAt(t)).t;expect(msg.gate).toBeLessThan(.01);expect(msg.outRms).toBeLessThan(.00001);}
 }
});

test('every voice uses actual airway gestures and telemetry on the full scene clock',()=>{
 for(const [i,id] of ids.entries()){
  const part=score.parts.find(p=>p.id===id)!,track=tracks[i],plan=planDialoguePart(score,id);
  expect(part.kind).toBe('voice');expect(part.recordingType).toBeUndefined();expect(part.effects).toBeUndefined();
  expect(plan.length).toBeGreaterThan(20);expect(plan.length).toBeLessThan(1000);
  // Only Neo and the boy say bilabials; the assistant's phrase uses tongue closures and laterals.
  if(id!=='oracle-assistant')expect(plan.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  else expect(plan.some(g=>g.targets.lateral===1&&g.targets.ttY!==undefined)).toBe(true);
  expect(plan.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
  expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(part.body.female,6);expect(track.body.child).toBeCloseTo(part.body.child,6);
  for(const line of score.lines.filter(l=>l.speaker===id)){
   expect(line.segments.filter(s=>s.wordEnd)).toHaveLength(line.words.length);
   let peak=0;for(let f=track.indexAt(line.start);f<=track.indexAt(line.end);f++)peak=Math.max(peak,track.message(f).t.outRms);
   expect(peak).toBeGreaterThan(.001);
  }
  for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,4);
 }
 for(const [i,line] of score.lines.entries())expect(line.end).toBeLessThan(score.lines[i+1]?.start??scene.duration);
});

test('the spoon is lifted, bent twice and handed to Neo before the assistant enters',()=>{
 expect(matrixPose(0).lift).toBe(0);expect(matrixPose(6).lift).toBe(1);
 expect(matrixPose(10).bend).toBeGreaterThan(.9);expect(matrixPose(15).bend).toBe(0);
 expect(matrixPose(14).take).toBe(0);expect(matrixPose(20).take).toBe(1);expect(matrixPose(20).sit).toBe(1);
 expect(matrixPose(52).bend).toBe(0);expect(matrixPose(59).bend).toBeGreaterThan(.9);
 expect(matrixPose(61).assistantVisible).toBe(false);expect(matrixPose(63).assistantVisible).toBe(true);
 expect(matrixPose(65).lookUp).toBe(1);expect(matrixPose(70).lookUp).toBe(0);
 expect(matrixPose(NaN)).toEqual(matrixPose(0));
 for(const view of ['neo','spoon-boy','oracle-assistant','matrix-spoon','matrix-floor','wide'] as CameraView[])for(const aspect of [16/9,.87]){
  const c=matrixCamera(view,aspect,55);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);
 }
});

test('heads and spoon remain framed on desktop and mobile; actual articulation feeds the reflection',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new MatrixRoom(cast);
 const updates=stage.people.map(p=>spyOn(p.head,'update')),reflection=spyOn(stage.reflection,'update');
 const framed=(root:THREE.Object3D)=>{
  let count=0,inside=true;root.traverseVisible(o=>{const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(!a)return;
   for(let i=0;i<mesh.geometry.instanceCount;i++){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).project(stage.camera);count++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&v.z<1&&v.z>-1;}
  });expect(count).toBeGreaterThan(100);expect(inside).toBe(true);
 };
 try{
  for(const [w,h] of [[1280,720],[375,211],[375,430]]){
   stage.resize(w,h);
   for(const [view,t] of [['neo',6],['neo',35],['spoon-boy',30],['oracle-assistant',63],['wide',70]] as const){
    stage.frame(t,true,1,view,.5);
    for(const [i,p] of stage.people.entries()){
     expect(updates[i].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(tracks[i].message(tracks[i].indexAt(t)).t.artic));
     if(view==='wide'||p.id===view)framed(p.head.scene);
    }
   }
   for(const t of [9,55]){stage.frame(t,true,1,'matrix-spoon',.5);const v=new THREE.Vector3(...matrixSpoonPoint(t)).project(stage.camera);expect(Math.abs(v.x)).toBeLessThan(.9);expect(Math.abs(v.y)).toBeLessThan(.9);expect(v.z).toBeLessThan(1);}
   stage.frame(55,true,1,'matrix-spoon',0);framed(stage.reflection.scene);
   expect(stage.people[0].root.visible).toBe(false);expect(stage.reflection.scene.visible).toBe(true);
   expect(reflection.mock.calls.at(-1)![0]).toBe(cast[0].model);
   expect(reflection.mock.calls.at(-1)![2]).toEqual(updates[0].mock.calls.at(-1)![2]);
   stage.frame(55,true,1,'neo',0);expect(stage.people[0].root.visible).toBe(true);
  }
 }finally{updates.forEach(s=>s.mockRestore());reflection.mockRestore();stage.dispose();cast.forEach(p=>p.model.dispose());}
});

test('spoon and hands survive pauses and backward seeks; the scene releases geometry but keeps borrowed models',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new MatrixRoom(cast);
 const movement=()=>{
  const values=[...stage.spoonRoot.matrixWorld.elements,...stage.reflection.scene.matrixWorld.elements];
  for(const root of [stage.spoon.group,...stage.people.map(p=>p.arms.group)])root.traverseVisible(o=>{const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)values.push(a.getX(i),a.getY(i),a.getZ(i));});return values;
 };
 try{
  for(const t of [4,9,17,20,42,55,63]){
   stage.frame(t,true,1,'wide',0);const before=movement();stage.frame(t,false,1,'wide',0);expect(movement()).toEqual(before);
   stage.frame(70,true,2,'wide',0);stage.frame(t,true,3,'wide',0);expect(movement()).toEqual(before);
  }
 }finally{
  let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();
  expect(released).toBe(meshes);for(const p of stage.people)expect(p.hair.group.parent).toBeNull();cast.forEach(p=>p.model.dispose());
 }
});
