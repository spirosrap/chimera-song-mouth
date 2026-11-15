import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {phantomPose,phantomCamera} from '../src/scene/nightwish-phantom.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {PhantomStage}=await import('../src/ui/render/nightwish-phantom.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/nightwish-phantom/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),voices=score.parts.filter(p=>p.kind==='voice');
const tracks=voices.map(p=>{const raw=gunzipSync(file(p.id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const feeds=()=>voices.map((p,i)=>({id:('phantom-'+p.id)as 'phantom-tarja'|'phantom-marco',model:new VoiceModel(tracks[i].body,tracks[i].sampleRate),track:tracks[i]}));
test('the complete Nightwish duet retains its instrumental bridge, high finale, Finnish thanks and original music',()=>{
 expect(movieScene('nightwish-phantom')).toBeDefined();expect(scene.setting).toBe('phantom');expect(scene.duration).toBeGreaterThan(284);expect(scene.duration).toBeLessThan(284.5);expect(scene.characters.map(c=>c.id)).toEqual(['phantom-tarja','phantom-marco']);expect(voices.length).toBe(2);expect(voices[0].melody!.notes.length).toBeGreaterThan(100);expect(voices[1].melody!.notes.length).toBeGreaterThan(130);expect(score.parts.at(-1)!.recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(14);expect(scene.cues.at(-1)!.text).toBe('Kiitos!');expect(scene.cues.at(-1)!.end).toBeGreaterThan(277);expect(scene.cues.every(c=>c.text.length<100)).toBe(true);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(sceneCamera(scene,90,'auto')).toBe('phantom-marco');expect(sceneCamera(scene,95,'auto')).toBe('phantom-drums');expect(sceneCamera(scene,240,'auto')).toBe('phantom-tarja');expect(()=>validateScene({...scene,shots:[{time:0,view:'player-stage'}]})).toThrow('camera');
});
test('both physical singers have audible complete phrases, exact telemetry clocks and an actual soprano ending above 1200 Hz',()=>{
 for(const [i,part]of voices.entries()){
  const track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
  for(const phrase of part.performance!.phrases){const end=phrase.start+phrase.phones.reduce((n,p)=>n+p.duration,0);let rms=0;for(let j=track.indexAt(phrase.start);j<=track.indexAt(end);j++)rms=Math.max(rms,track.message(j).t.outRms);expect(rms).toBeGreaterThan(.0001);}
  let high=0;for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<14||j/20>59&&j/20<80||j/20>256&&j/20<274)expect(t.outRms).toBeLessThan(.00001);if(i===0&&j/20>238&&j/20<254)high=Math.max(high,t.f0);}if(i===0)expect(high).toBeGreaterThan(1200);
 }
 expect(voices[0].performance!.phrases.at(-1)!.phones.map(p=>p.ipa)).toEqual(['k','i','t','o','s']);
});
test('five band members, the yellow microphone, light rig, drums and crowd restore directly after backward seeking',()=>{
 expect(phantomPose(NaN)).toEqual(phantomPose(0));const people=feeds(),stage=new PhantomStage(people),snapshot=()=>[...stage.actors.flatMap(a=>a.root.matrixWorld.elements),...stage.microphone.matrixWorld.elements,...stage.sticks.flatMap(s=>s.matrixWorld.elements),...stage.spotlights.flatMap(s=>s.matrixWorld.elements),...stage.camera.matrixWorld.elements];
 try{expect(stage.actors.length).toBe(5);expect(stage.spotlights.length).toBe(12);expect(stage.cymbals.length).toBe(4);expect(stage.crowd.children.some(o=>(o as THREE.InstancedMesh).isInstancedMesh)).toBe(true);expect(stage.actors.slice(2).every(a=>a.feed===people[1])).toBe(true);for(const t of [7,30,40,77,95,105,135,150,190,215,239,252,277]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snapshot();expect(before.every(Number.isFinite)).toBe(true);stage.frame(1,true,2,'phantom-stage',0);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(before);}stage.frame(77,true,4,'phantom-rear',.8);expect(stage.camera.position.z).toBeGreaterThan(-380);}
 finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('both featured heads remain framed on phone and wide cameras while five heads retain just the two borrowed models',()=>{
 const people=feeds(),stage=new PhantomStage(people);
 try{const masks=stage.scene.children.filter(o=>o.renderOrder===999)as THREE.Mesh[];expect(masks.length).toBe(2);expect(masks.every(m=>(m.material as THREE.Material).transparent&&!(m.material as THREE.Material).depthTest)).toBe(true);for(const [w,h]of [[1280,720],[375,430]])for(const [i,view]of ['phantom-tarja','phantom-marco'].entries()){
  stage.resize(w,h);stage.frame(140,true,1,view as any,.8);let count=0,inside=true;const actor=stage.actors[i];actor.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===actor.hair.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.phantom.cameras){const c=phantomCamera(v,w/h,140);expect([...c.target,...c.position,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();people.forEach(p=>p.model.dispose());}
});
