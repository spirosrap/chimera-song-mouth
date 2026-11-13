import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {workshopPose,workshopCamera} from '../src/scene/whats-he-building.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {WorkshopStage}=await import('../src/ui/render/whats-he-building.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/whats-he-building/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('the complete recording includes the suspicious monologue and original quiet ending',()=>{
 expect(movieScene('whats-he-building')).toBeDefined();expect(scene.setting).toBe('workshop');expect(scene.duration).toBeGreaterThan(200.3);expect(scene.duration).toBeLessThan(201);expect(scene.characters.map(c=>c.id)).toEqual(['watcher']);
 expect(score.parts[0].performance!.lyrics).toContain('We have a right to know');expect(scene.cues.at(-1)!.end).toBeGreaterThan(177);expect(sceneCamera(scene,10,'auto')).toBe('watcher');expect(sceneCamera(scene,65,'auto')).toBe('workshop-window');expect(sceneCamera(scene,190,'auto')).toBe('workshop-shadows');
 expect(file('mix.mp3').length).toBeGreaterThan(6_000_000);expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'autumn-chair'}]})).toThrow('camera');
});
test('speech uses clear physical phones on the source clock without recorded voice effects',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:0,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');expect(performance.lyrics.split(/\s+/).length).toBe(283);expect(p.melody!.notes.length).toBe(350);
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<7||i/20>180)expect(t.outRms).toBeLessThan(.00001);}
});
test('flickering light, opaque shadows and poses restore after backwards seeks',()=>{
 expect(workshopPose(NaN)).toEqual(workshopPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new WorkshopStage(model,track);
 try{for(const time of [10,30,52,65,97,120,145,173,194]){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>[...stage.singer.matrixWorld.elements,...stage.head.scene.matrixWorld.elements,...stage.silhouette.matrixWorld.elements,...stage.shadowArms.flatMap(m=>m.matrixWorld.elements)],before=snapshot();expect(stage.silhouette.children.length).toBeGreaterThan(4);expect(stage.silhouette.children.every(o=>o instanceof THREE.Mesh)).toBe(true);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }stage.frame(90,true,1,'workshop-window',0);expect(stage.singer.visible).toBe(false);stage.frame(90,false,2,'wide',0);expect(stage.singer.visible).toBe(true);
 }finally{stage.dispose();model.dispose();}
});
test('the stage retains its borrowed model and keeps the narrator close-up framed',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new WorkshopStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [10,45,63,95,122,150,175]){
  stage.resize(w,h);stage.frame(time,true,1,'watcher',.7);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.workshop.cameras){const c=workshopCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
