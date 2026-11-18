import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {ZARA_SHOTS,ZARA_CAMERAS,zaraState} from '../src/scene/zara-blue-moon.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {ZaraMoonStage}=await import('../src/ui/render/zara-blue-moon.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/zara-blue-moon/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('the complete Blue Moon edit keeps its lyric sections, breaks and picture tail',()=>{
 expect(movieScene('zara-blue-moon')).toBeDefined();
 expect(scene.setting).toBe('zara');expect(scene.duration).toBeGreaterThan(194.3);expect(scene.duration).toBeLessThan(194.4);
 expect(scene.characters.map(c=>c.id)).toEqual(['zara-moon']);
 expect(score.parts[0].performance!.lyrics).toContain('blue moon');
 expect(score.parts[0].performance!.lyrics).toContain('underneath the stars');
 expect(scene.cues.at(-1)!.end).toBeGreaterThan(170);expect(scene.cues.at(-1)!.end).toBeLessThan(171.5);
 expect(sceneCamera(scene,0,'auto')).toBe('zara-alley');expect(sceneCamera(scene,80,'auto')).toBe('zara-fairy');
 expect(sceneCamera(scene,120,'auto')).toBe('zara-fairy-close');expect(sceneCamera(scene,190,'auto')).toBe('zara-black');
 expect(file('mix.mp3').length).toBeGreaterThan(4_000_000);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();
 expect(()=>validateScene({...scene,shots:[{time:0,view:'zara-nowhere' as never}]})).toThrow('camera');
});
test('the physical lead sings audible phrases with finite 20 Hz telemetry',()=>{
 const p=score.parts[0],performance=p.performance!;
 expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();
 expect(p.body).toEqual({female:.91,child:0});expect(validPerformance(performance,score.duration)).toBe(true);
 expect(score.parts[1].recordingType).toBe('instrumental');
 expect(performance.lyrics.split(/\s+/).length).toBe(324);expect(p.melody!.notes.length).toBe(413);
 for(const ph of performance.phrases){
  const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;
  for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);
  expect(peak).toBeGreaterThan(.0001);
 }
 expect(track.duration).toBeCloseTo(scene.duration,0);
 for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);}
});
test('all six sets and source-time zooms restore from absolute time after seeking',()=>{
 expect(zaraState('wide',NaN)).toEqual(zaraState('wide',0));
 const model=new VoiceModel(track.body,track.sampleRate),stage=new ZaraMoonStage(model,track);
 try{for(const [time,place]of [[2,'alley'],[70,'lot'],[80,'flight'],[85,'shelter'],[105,'surf'],[127,'moon'],[147,'tank'],[183,'fence'],[190,'black']]as const){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>[...stage.singer.root.matrixWorld.elements,...stage.camera.position.toArray(),...stage.camera.quaternion.toArray(),stage.alley.visible,stage.lot.visible,stage.shelter.visible,stage.dream.visible,stage.tank.visible,stage.poster.visible],before=snapshot();
  expect(zaraState('wide',time).place).toBe(place);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');
   if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('every camera keeps the singer and its geometry in front of the lens',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new ZaraMoonStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const view of ZARA_CAMERAS){
  stage.resize(w,h);stage.frame(80,true,1,view,.7);
  expect([...stage.camera.position.toArray(),...stage.camera.quaternion.toArray()].every(Number.isFinite)).toBe(true);
  const head=stage.singer.head.scene.getWorldPosition(new THREE.Vector3()).project(stage.camera);
  if(view!=='zara-title'&&view!=='zara-black')expect([head.x,head.y,head.z].every(Number.isFinite)).toBe(true);
 }
 for(const [start]of ZARA_SHOTS)expect(typeof zaraState('wide',start+.1).place).toBe('string');
 expect(SCENE_SETTINGS.zara.cameras).toEqual(ZARA_CAMERAS);
 }finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
