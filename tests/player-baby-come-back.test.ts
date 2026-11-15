import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {playerPose,playerCamera} from '../src/scene/player-baby-come-back.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {PlayerStage}=await import('../src/ui/render/player-baby-come-back.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/player-baby-come-back/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const voices=score.parts.filter(p=>p.kind==='voice'),tracks=voices.map(p=>{const raw=gunzipSync(file(p.id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const feeds=()=>voices.map((p,i)=>({id:('player-'+p.id)as 'player-lead'|'player-bass'|'player-guitar'|'player-keys',model:new VoiceModel(tracks[i].body,tracks[i].sampleRate),track:tracks[i]}));
test('Baby Come Back retains the complete supplied performance and four independent physical singers',()=>{
 expect(movieScene('player-baby-come-back')).toBeDefined();expect(scene.setting).toBe('player');expect(scene.duration).toBeGreaterThan(250.1);expect(scene.duration).toBeLessThan(250.6);expect(scene.characters.map(c=>c.id)).toEqual(['player-lead','player-bass','player-guitar','player-keys']);expect(voices.length).toBe(4);expect(voices[0].melody!.notes.length).toBeGreaterThan(250);expect(voices.slice(1).every(p=>p.melody!.notes.length>130)).toBe(true);expect(score.parts.at(-1)!.recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(38);expect(scene.cues.at(-1)!.end).toBeLessThan(207);expect(scene.cues.every(c=>c.text.length<100)).toBe(true);expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(sceneCamera(scene,3,'auto')).toBe('player-keyboard');expect(sceneCamera(scene,70,'auto')).toBe('player-trio');expect(sceneCamera(scene,224,'auto')).toBe('player-drums');expect(()=>validateScene({...scene,shots:[{time:0,view:'ashes-beach'}]})).toThrow('camera');
});
test('every generated phrase sounds, every mouth uses the exact clock, and the original instrumental opening and ending remain vocal-free',()=>{
 for(const [i,part]of voices.entries()){
  const track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
  for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let rms=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)rms=Math.max(rms,track.message(j).t.outRms);expect(rms).toBeGreaterThan(.0001);}
  for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<37||j/20>208)expect(t.outRms).toBeLessThan(.00001);}
 }
});
test('five musicians, guitars, keyboards, drumsticks and cymbals restore directly after seeking backwards',()=>{
 expect(playerPose(NaN)).toEqual(playerPose(0));const people=feeds(),stage=new PlayerStage(people);const snapshot=()=>[...stage.actors.flatMap(a=>a.root.matrixWorld.elements),...stage.sticks.flatMap(s=>s.matrixWorld.elements),...stage.cymbals.flatMap(c=>c.matrixWorld.elements),...stage.camera.matrixWorld.elements];
 try{expect(stage.actors.length).toBe(5);expect(stage.keyboard.children.length).toBeGreaterThan(100);expect(stage.cymbals.length).toBe(4);expect(stage.sticks.length).toBe(2);expect(stage.actors[4].feed).toBe(people[0]);for(const time of [6,20,42,70,104,152,184,224,241]){const view=sceneCamera(scene,time,'auto');stage.frame(time,true,1,view,.8);const before=snapshot();expect(before.every(Number.isFinite)).toBe(true);stage.frame(1,true,2,'player-keyboard',0);stage.frame(time,false,3,view,.8);expect(snapshot()).toEqual(before);}expect(stage.actors.slice(0,4).map(a=>a.feed.id)).toEqual(people.map(p=>p.id));}
 finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('the four featured heads remain framed on phone and wide cameras and stage disposal preserves all borrowed models',()=>{
 const people=feeds(),stage=new PlayerStage(people);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const [i,view]of ['player-lead','player-bass','player-guitar','player-keys'].entries()){
  stage.resize(w,h);stage.frame(70,true,1,view as any,.8);let count=0,inside=true;const actor=stage.actors[i];actor.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===actor.hair.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const v of SCENE_SETTINGS.player.cameras){const c=playerCamera(v,w/h,70);expect([...c.target,...c.position,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();people.forEach(p=>p.model.dispose());}
});
