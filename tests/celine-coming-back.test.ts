import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {mansionPose,mansionCamera} from '../src/scene/mansion.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {MansionStage}=await import('../src/ui/render/mansion.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/celine-coming-back/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('the complete extended video retains the storm opening, sung ending and mansion cameras',()=>{
 expect(movieScene('celine-coming-back')).toBeDefined();expect(scene.setting).toBe('mansion');expect(scene.duration).toBeCloseTo(459.350476,4);
 expect(scene.characters.map(c=>c.id)).toEqual(['celine']);expect(scene.cues[0].start).toBeGreaterThan(47);expect(scene.cues.at(-1)!.end).toBeGreaterThan(443);
 expect(sceneCamera(scene,0,'auto')).toBe('mansion-exterior');expect(sceneCamera(scene,36,'auto')).toBe('mansion-road');expect(sceneCamera(scene,120,'auto')).toBe('mansion-mirror');expect(sceneCamera(scene,430,'auto')).toBe('mansion-corridor');
 expect(scene.cues.some(c=>c.text.toLowerCase().includes('laws allow'))).toBe(true);expect(file('mix.mp3').length).toBeGreaterThan(14_000_000);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'superman-circle'}]})).toThrow('camera');
});
test('physical lead and original backing retain complete finite articulation on the source clock',()=>{
 const p=score.parts[0];expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.melody!.notes.length).toBe(744);expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(planPart(p).length).toBeLessThan(16000);
 expect(score.parts[1].recordingType).toBe('instrumental');expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(p.body.female,5);
 for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<47)expect(t.outRms).toBeLessThan(.00001);}
 for(const phrase of p.performance!.phrases){const end=phrase.start+phrase.phones.reduce((sum,p)=>sum+p.duration,0);let peak=0;for(let i=track.indexAt(phrase.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
});
test('mansion props, storm and ending restore after pauses and backward seeks',()=>{
 expect(mansionPose(NaN)).toEqual(mansionPose(0));expect(mansionPose(40).crash).toBe(true);expect(mansionPose(55).bed).toBe(true);expect(mansionPose(120).mirror).toBe(true);expect(mansionPose(225).ghost).toBe(true);expect(mansionPose(459).fade).toBe(0);
 for(const aspect of [16/9,375/430])for(const view of SCENE_SETTINGS.mansion.cameras){const c=mansionCamera(view,aspect,225);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 const model=new VoiceModel(track.body,track.sampleRate),stage=new MansionStage(model,track);
 try{
  for(const t of [14,40,55,120,150,225,270,315,437,459]){
   stage.frame(t,true,1,'wide',.6);const before=[...stage.singer.matrixWorld.elements,...stage.ghost.matrixWorld.elements,...stage.door.matrixWorld.elements,Number(stage.interior.visible),Number(stage.outside.visible)];
   stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>;if(m.geometry?.getAttribute('instanceStart')){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(m.geometry.getAttribute('instanceStart').count);}});
   stage.frame(70,true,2,'wide',0);stage.frame(t,false,3,'wide',0);expect([...stage.singer.matrixWorld.elements,...stage.ghost.matrixWorld.elements,...stage.door.matrixWorld.elements,Number(stage.interior.visible),Number(stage.outside.visible)]).toEqual(before);
  }
  stage.frame(459,false,4,'wide',0);let veil:THREE.MeshBasicMaterial|undefined;stage.scene.traverse(o=>{if(o.renderOrder===1000)veil=(o as THREE.Mesh).material as THREE.MeshBasicMaterial;});expect(veil!.opacity).toBe(1);stage.frame(150,false,5,'wide',0);expect(veil!.opacity).toBe(0);
 }finally{stage.dispose();model.dispose();}
});
test('both physical heads remain framed and the stage leaves its borrowed model alive',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new MansionStage(model,track);
 try{
  for(const [w,h]of [[1280,720],[375,430]])for(const t of [55,150,315]){
   stage.resize(w,h);stage.frame(t,true,1,'celine',.7);let count=0,inside=true;
   stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});
   expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  }
  stage.frame(120,true,2,'mansion-mirror',.5);expect(stage.reflection.scene.visible).toBe(true);
 }finally{
  const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();
 }
});
