import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {bonJoviPose,bonJoviPlace,bonJoviCamera} from '../src/scene/bon-jovi-always.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {BonJoviStage}=await import('../src/ui/render/bon-jovi-always.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/bon-jovi-always/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('the complete Bon Jovi video includes every verse, chorus, held Always and the vocalise ending',()=>{
 expect(movieScene('bon-jovi-always')).toBeDefined();expect(scene.setting).toBe('bonjovi');expect(scene.duration).toBeGreaterThan(366);expect(scene.duration).toBeLessThan(366.4);expect(scene.characters.map(c=>c.id)).toEqual(['jon']);expect(score.parts[0].performance!.lyrics).toContain('This Romeo');expect(score.parts[0].performance!.lyrics).toContain('loaded dice');expect(scene.cues.at(-1)!.end).toBeGreaterThan(355);
 expect(sceneCamera(scene,100,'auto')).toBe('bonjovi-apartment');expect(sceneCamera(scene,120,'auto')).toBe('jon');expect(sceneCamera(scene,330,'auto')).toBe('bonjovi-street');expect(sceneCamera(scene,350,'auto')).toBe('bonjovi-studio');expect(file('mix.mp3').length).toBeGreaterThan(10_000_000);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'workshop-window'}]})).toThrow('camera');
});
test('the lead uses explicit physical phones with audible phrases and finite sample-clock telemetry',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:0,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');expect(performance.lyrics.split(/\s+/).length).toBe(379);expect(p.melody!.notes.length).toBe(427);
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<37||i/20>357)expect(t.outRms).toBeLessThan(.00001);}
});
test('all locations and story motion restore from absolute time after seeking',()=>{
 expect(bonJoviPose(NaN)).toEqual(bonJoviPose(0));expect(bonJoviPlace('bonjovi-loft',20)).toBe('loft');const model=new VoiceModel(track.body,track.sampleRate),stage=new BonJoviStage(model,track);
 try{for(const time of [5,30,45,90,110,140,175,200,230,280,300,316,330,350,364]){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>[...stage.singer.matrixWorld.elements,...stage.car.matrixWorld.elements,...Object.values(stage.rooms).map(g=>Number(g.visible))],before=snapshot();expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);expect(bonJoviPlace('wide',time)).toBe(bonJoviPose(time).place);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('close-ups keep the physical mouth framed and the stage retains its borrowed model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new BonJoviStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [45,90,130,205,280]){
  stage.resize(w,h);stage.frame(time,true,1,'jon',.7);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.bonjovi.cameras){const c=bonJoviCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
test('the painting and argument have visible actors whose hands restore after a seek without growing the cast',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new BonJoviStage(model,track);
 try{
  stage.frame(90,false,1,'bonjovi-party',0);const capacity=stage.cast.figures.length;
  stage.frame(350,false,2,'bonjovi-studio',0);const snapshot=()=>stage.cast.figures.filter(f=>f.root.visible).flatMap(f=>[...f.root.matrixWorld.elements,...f.hands.flatMap(h=>h.position.toArray())]);
  const before=snapshot(),hand=stage.cast.figures[0].hands[1].position.toArray();expect(stage.cast.figures.filter(f=>f.root.visible).length).toBe(2);expect(stage.cast.figures[0].face.visible).toBe(true);
  stage.frame(351,false,2,'bonjovi-studio',0);expect(stage.cast.figures[0].hands[1].position.toArray()).not.toEqual(hand);
  stage.frame(285,false,3,'bonjovi-loft',0);expect(stage.cast.figures.filter(f=>f.root.visible).length).toBeGreaterThanOrEqual(2);
  stage.frame(350,false,4,'bonjovi-studio',0);expect(snapshot()).toEqual(before);expect(stage.cast.figures.length).toBe(capacity);
  const a=bonJoviCamera('jon',16/9,118),b=bonJoviCamera('jon',16/9,121);expect(a.position).not.toEqual(b.position);expect(bonJoviCamera('jon',16/9,118)).toEqual(a);
 }finally{stage.dispose();model.dispose();}
});
