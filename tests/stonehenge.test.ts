import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {hengePose,hengePlace,hengeCamera} from '../src/scene/stonehenge.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {StonehengeStage}=await import('../src/ui/render/stonehenge.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/stonehenge/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('the full Stonehenge video preserves the domestic scenes, car exchange and sunset',()=>{
 expect(movieScene('stonehenge')).toBeDefined();expect(scene.duration).toBeCloseTo(235.87,3);expect(scene.setting).toBe('henge');
 expect(scene.characters.map(c=>c.id)).toEqual(['henge-singer']);expect(scene.cues.some(c=>c.text.includes('prosciutto'))).toBe(true);expect(scene.cues.some(c=>c.text.includes('Drive a Civic'))).toBe(true);expect(scene.cues.at(-1)!.end).toBeGreaterThan(229);
 expect(sceneCamera(scene,5,'auto')).toBe('henge-studio');expect(sceneCamera(scene,120,'auto')).toBe('henge-bedroom');expect(sceneCamera(scene,230,'auto')).toBe('henge-sunset');
 expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'vitas-dancers'}]})).toThrow('camera');
});
test('the approved physical singer covers the complete words with finite sample-clock articulation',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:0,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(planPart(p).length).toBeLessThan(16000);expect(score.parts[1].recordingType).toBe('instrumental');
 expect(performance.phrases.length).toBe(34);expect(performance.lyrics).toContain('jalapenos');expect(performance.lyrics).toContain('Stone Age');
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);
 for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<10||i/20>234)expect(t.outRms).toBeLessThan(.00001);}
});
test('domestic poses, the stone circle and manual cameras restore after backward seeks',()=>{
 expect(hengePose(NaN)).toEqual(hengePose(0));expect(hengePose(125).lying).toBe(true);expect(hengePose(132).lying).toBe(false);expect(hengePose(165).open).toBeGreaterThan(.9);expect(hengePose(235.4).fade).toBe(0);
 expect(hengePlace('henge-car',55)).toBe('car');for(const aspect of [16/9,375/430])for(const view of SCENE_SETTINGS.henge.cameras){const c=hengeCamera(view,aspect,150);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 const model=new VoiceModel(track.body,track.sampleRate),stage=new StonehengeStage(model,track);
 try{for(const time of [20,55,94,125,132,140,148,165,180,204,232]){
  stage.frame(time,true,1,'wide',.7);const before=[...stage.singer.matrixWorld.elements,...stage.companion.matrixWorld.elements,...Object.values(stage.rooms).map(g=>Number(g.visible))];
  expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(3,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect([...stage.singer.matrixWorld.elements,...stage.companion.matrixWorld.elements,...Object.values(stage.rooms).map(g=>Number(g.visible))]).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('the physical head stays in frame across rooms and the stage retains its borrowed model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new StonehengeStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [20,55,94,125,132,140,165,220]){
  stage.resize(w,h);stage.frame(time,true,1,'henge-singer',.7);let count=0,inside=true;
  stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
