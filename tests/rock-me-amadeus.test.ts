import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {amadeusPose,amadeusCamera} from '../src/scene/rock-me-amadeus.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {AmadeusStage}=await import('../src/ui/render/rock-me-amadeus.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/rock-me-amadeus/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','tenor','bass'].map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:['falco','amadeus-tenor','amadeus-bass'][i]as 'falco'|'amadeus-tenor'|'amadeus-bass',model:new VoiceModel(track.body,track.sampleRate),track}));
test('Rock Me Amadeus retains the full supplied video, both verses, layered chorus and closing echoes',()=>{
 expect(movieScene('rock-me-amadeus')).toBeDefined();expect(scene.setting).toBe('amadeus');expect(scene.duration).toBeGreaterThan(224.6);expect(scene.duration).toBeLessThan(224.8);expect(scene.characters.map(c=>c.id)).toEqual(['falco','amadeus-tenor','amadeus-bass']);expect(scene.cues.every(c=>c.text.length<100)).toBe(true);expect(scene.cues.length).toBeGreaterThan(50);expect(scene.cues[0].start).toBeGreaterThan(27);expect(scene.cues.at(-1)!.end).toBeGreaterThan(221);expect(score.parts[0].melody!.notes.length).toBe(582);expect(score.parts[3].recordingType).toBe('instrumental');expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(sceneCamera(scene,3,'auto')).toBe('amadeus-vienna');expect(sceneCamera(scene,221,'auto')).toBe('amadeus-prayer');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,2)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'kate'}]})).toThrow('camera');
});
test('all three physical voices retain complete audible phrases, synchronized airways and a silent instrumental opening',()=>{
 score.parts.filter(p=>p.kind==='voice').forEach((part,i)=>{const track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((s,x)=>s+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<26)expect(t.outRms).toBeLessThan(.00001);}
 });expect(score.parts[1].melody!.notes.length).toBeGreaterThan(300);expect(score.parts[2].melody!.notes.length).toBe(score.parts[1].melody!.notes.length);
});
test('sets, costumes, coach wheels, motorcycle arrival and prayer restore after a backward seek',()=>{
 expect(amadeusPose(NaN)).toEqual(amadeusPose(0));const people=cast(),stage=new AmadeusStage(people);
 try{for(const t of [3,29,36,56,74,84,89,97,106,178,190,221]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const snapshot=()=>[...Object.values(stage.sets).map(g=>g.visible),...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.clothes.group.children.flatMap(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,g=m.geometry,at=g.getAttribute('instanceStart');return Array.from({length:g.instanceCount},(_,i)=>[at.getX(i),at.getY(i),at.getZ(i)]).flat();})]),...stage.coach.matrixWorld.elements,...stage.bikes.matrixWorld.elements,...stage.wheels.map(w=>w.rotation.z)];const before=snapshot();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);expect(stage.wheels.length).toBe(4);expect(stage.bikes.children.length).toBe(3);if(t===29)expect(stage.actors.every(a=>!a.root.visible)).toBe(true);if(t===56)expect(stage.actors[0].root.visible).toBe(true);if(t===89)expect(stage.actors[1].root.visible).toBe(true);if(t===178)expect(stage.bikes.visible).toBe(true);stage.frame(2,true,2,'amadeus-vienna',0);stage.frame(t,false,3,view,0);expect(snapshot()).toEqual(before);}expect(amadeusPose(221).prayer).toBe(1);expect(amadeusPose(178).motorcycles).toBeGreaterThan(0);expect(amadeusPose(178).motorcycles).toBeLessThan(1);}
 finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('all four physical heads stay framed in portrait and cinema close-ups without disposing borrowed models',()=>{
 const people=cast(),stage=new AmadeusStage(people);
 try{for(const time of [3,56,89,221])for(const [view,index]of [['falco',0],['amadeus-wig',1],['amadeus-tenor',2],['amadeus-bass',3]]as const){stage.frame(time,true,1,view,.8);expect(stage.actors[index].root.visible).toBe(true);}expect(stage.actors[0].model).toBe(stage.actors[1].model);expect(stage.actors[2].model).not.toBe(stage.actors[3].model);for(const [w,h]of [[1280,720],[375,430]])for(const [time,view,index]of [[56,'falco',0],[89,'amadeus-wig',1],[221,'amadeus-prayer',1],[106,'amadeus-tenor',2],[106,'amadeus-bass',3]]as const){stage.resize(w,h);stage.frame(time,true,1,view,.8);const actor=stage.actors[index];expect(actor.root.visible).toBe(true);let count=0,inside=true;actor.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===actor.hair.group||parent===actor.glasses.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.amadeus.cameras){const c=amadeusCamera(v,w/h,time);expect([...c.target,...c.position,c.fov].every(Number.isFinite)).toBe(true);}}
 }finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();people.forEach(p=>p.model.dispose());}
});
