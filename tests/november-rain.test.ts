import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {novemberPose,novemberPlace,novemberCamera} from '../src/scene/november-rain.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {NovemberStage}=await import('../src/ui/render/november-rain.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/november-rain/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const track=(name:string)=>{const raw=gunzipSync(file(name));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));};
const lead=track('lead.tele.gz'),chorus=track('rain-chorus.tele.gz');
test('the complete film includes every sung section, guitar breaks, responses and the grave ending',()=>{
 expect(movieScene('november-rain')).toBeDefined();expect(scene.setting).toBe('november');expect(scene.duration).toBeGreaterThan(557);expect(scene.duration).toBeLessThan(557.4);expect(scene.characters.map(c=>c.id)).toEqual(['axl','rain-chorus']);expect(score.parts[0].performance!.lyrics).toContain('love restrained');expect(score.parts[1].performance!.lyrics).toContain("You're not the only one");expect(scene.cues.at(-1)!.end).toBeGreaterThan(517);
 expect(sceneCamera(scene,100,'auto')).toBe('axl');expect(sceneCamera(scene,312,'auto')).toBe('rain-guitar');expect(sceneCamera(scene,480,'auto')).toBe('rain-cemetery');expect(sceneCamera(scene,540,'auto')).toBe('rain-grave');expect(file('mix.mp3').length).toBeGreaterThan(16_000_000);
 expect(()=>validateScene({...scene,characters:[scene.characters[0]]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'bonjovi-city'}]})).toThrow('camera');
});
test('both physical voices use valid explicit phones and finite sample-clock telemetry',()=>{
 for(const [i,name,t,words,notes]of [[0,'lead',lead,327,403],[1,'rain-chorus',chorus,30,36]]as const){const p=score.parts[i],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(validPerformance(performance,score.duration)).toBe(true);expect(performance.lyrics.split(/\s+/).length).toBe(words);expect(p.melody!.notes.length).toBe(notes);
  for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let j=t.indexAt(ph.start);j<=t.indexAt(end);j++)peak=Math.max(peak,t.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
  expect(t.duration).toBeCloseTo(scene.duration,1);for(let j=0;j<t.frames;j++){const m=t.message(j).t;expect(m.clock).toBeCloseTo(j/20,4);expect([...m.artic].every(Number.isFinite)).toBe(true);if(j/20<88||j/20>522)expect(m.outRms).toBeLessThan(.00001);}
 }expect(score.parts[0].body).toEqual({female:0,child:0});expect(score.parts[1].body).toEqual({female:.72,child:0});expect(score.parts[2].recordingType).toBe('instrumental');
});
test('all nine locations, wedding action, storm and grave motion restore after seeking',()=>{
 expect(novemberPose(NaN)).toEqual(novemberPose(0));expect(novemberPlace('rain-guitar',20)).toBe('desert');const models=[new VoiceModel(lead.body,lead.sampleRate),new VoiceModel(chorus.body,chorus.sampleRate)],stage=new NovemberStage([{id:'axl',model:models[0],track:lead},{id:'rain-chorus',model:models[1],track:chorus}]);
 try{for(const time of [5,30,60,90,150,190,280,340,410,440,475,500,535,550]){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>[...stage.actors.flatMap(a=>[...a.root.matrixWorld.elements]),...stage.soloist.matrixWorld.elements,...stage.cakeGuest.matrixWorld.elements,...stage.procession.matrixWorld.elements,...stage.bouquet.matrixWorld.elements,...Object.values(stage.rooms).map(g=>Number(g.visible))],before=snapshot();expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);expect(novemberPlace('wide',time)).toBe(novemberPose(time).place);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }}finally{stage.dispose();models.forEach(m=>m.dispose());}
});
test('lead close-ups keep the mouth framed and both models remain borrowed',()=>{
 const models=[new VoiceModel(lead.body,lead.sampleRate),new VoiceModel(chorus.body,chorus.sampleRate)],stage=new NovemberStage([{id:'axl',model:models[0],track:lead},{id:'rain-chorus',model:models[1],track:chorus}]);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [90,150,280,410,500]){
  stage.resize(w,h);stage.frame(time,true,1,'axl',.7);const actor=stage.actors[0];let count=0,inside=true;actor.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.november.cameras){const c=novemberCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();models.forEach(m=>m.dispose());}
});
