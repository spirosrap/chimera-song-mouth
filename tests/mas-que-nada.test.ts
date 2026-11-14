import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {mendesPose,mendesPlace,mendesCamera,MENDES_SHOTS} from '../src/scene/mas-que-nada.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {MendesStage}=await import('../src/ui/render/mas-que-nada.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/mas-que-nada/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('the complete vintage performance includes both lyric sections and the Obá ending',()=>{
 expect(movieScene('mas-que-nada')).toBeDefined();expect(scene.setting).toBe('mendes');expect(scene.duration).toBeGreaterThan(155.7);expect(scene.duration).toBeLessThan(155.9);expect(scene.characters.map(c=>c.id)).toEqual(['lani']);expect(score.parts[0].performance!.lyrics).toContain('maracatu');expect(score.parts[0].performance!.lyrics).toContain('obá-obá-obá');expect(scene.cues.at(-1)!.end).toBeGreaterThan(155);
 expect(sceneCamera(scene,20,'auto')).toBe('lani');expect(sceneCamera(scene,70,'auto')).toBe('mendes-piano');expect(sceneCamera(scene,100,'auto')).toBe('lani');expect(sceneCamera(scene,145,'auto')).toBe('lani');expect(file('mix.mp3').length).toBeGreaterThan(4_000_000);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'rain-grave'}]})).toThrow('camera');
});
test('the Portuguese lead uses explicit phones with audible phrases and finite sample-clock telemetry',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:.72,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');expect(performance.lyrics.split(/\s+/).length).toBe(142);expect(p.melody!.notes.length).toBe(250);
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<31)expect(t.outRms).toBeLessThan(.00001);}
});
test('all five locations and source-time zooms restore from absolute time after seeking',()=>{
 expect(mendesPose(NaN)).toEqual(mendesPose(0));expect(mendesPlace('mendes-jungle',20)).toBe('jungle');const model=new VoiceModel(track.body,track.sampleRate),stage=new MendesStage(model,track);
 try{for(const time of [5,25,45,70,85,100,115,135,150]){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>[...stage.singer.matrixWorld.elements,...stage.camera.position.toArray(),...stage.camera.quaternion.toArray(),...Object.values(stage.rooms).map(g=>Number(g.visible))],before=snapshot();expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);expect(mendesPlace('wide',time)).toBe(mendesPose(time).place);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('singer close-ups keep the mouth framed and the stage retains its borrowed model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new MendesStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [20,45,90,145]){
  stage.resize(w,h);stage.frame(time,true,1,'lani',.7);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.mendes.cameras){const c=mendesCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
  for(const [start]of MENDES_SHOTS){const c=mendesCamera('wide',w/h,start+.1);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
