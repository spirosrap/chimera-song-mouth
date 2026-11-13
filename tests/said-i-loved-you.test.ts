import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {boltonPose,boltonPlace,boltonCamera} from '../src/scene/said-i-loved-you.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {BoltonStage}=await import('../src/ui/render/said-i-loved-you.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/said-i-loved-you/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('the full Bolton video includes its verses, chorus reprises and closing horses',()=>{
 expect(movieScene('said-i-loved-you')).toBeDefined();expect(scene.setting).toBe('bolton');expect(scene.duration).toBeGreaterThan(303);expect(scene.duration).toBeLessThan(303.2);expect(scene.characters.map(c=>c.id)).toEqual(['bolton']);expect(score.parts[0].performance!.lyrics).toContain('With all my soul');expect(scene.cues.at(-1)!.end).toBeGreaterThan(282);
 expect(sceneCamera(scene,66,'auto')).toBe('bolton');expect(sceneCamera(scene,201,'auto')).toBe('bolton-lovers');expect(sceneCamera(scene,300,'auto')).toBe('bolton-horses');expect(file('mix.mp3').length).toBeGreaterThan(9_000_000);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'workshop-window'}]})).toThrow('camera');
});
test('the full singer uses explicit physical phones with audible phrases and finite sample-clock telemetry',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:0,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');expect(performance.lyrics.split(/\s+/).length).toBe(280);expect(p.melody!.notes.length).toBe(304);
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<24||i/20>287)expect(t.outRms).toBeLessThan(.00001);}
});
test('locations, fire, lovers and opaque horses restore from absolute time after seeking',()=>{
 expect(boltonPose(NaN)).toEqual(boltonPose(0));expect(boltonPlace('bolton-cave',20)).toBe('cave');const model=new VoiceModel(track.body,track.sampleRate),stage=new BoltonStage(model,track);
 try{for(const time of [5,32,65,87,145,203,232,250,280,299]){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>[...stage.singer.matrixWorld.elements,...stage.lovers.matrixWorld.elements,...stage.horses.matrixWorld.elements,...stage.fireSprites.flatMap(m=>[...m.matrixWorld.elements,Number(m.visible)]),...Object.values(stage.rooms).map(g=>Number(g.visible))],before=snapshot();expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);
  expect(stage.fireSprites.every(m=>m.visible===(boltonPose(time).place==='fire'||boltonPose(time).place==='horses'))).toBe(true);expect(stage.horses.children.length).toBe(3);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('all costumes keep the mouth framed and the stage retains its borrowed voice model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new BoltonStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [32,65,87,145,170,232,280]){
  stage.resize(w,h);stage.frame(time,true,1,'bolton',.7);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.bolton.cameras){const c=boltonCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
