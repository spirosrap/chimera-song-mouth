import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {beastPose,beastPlace,beastCamera} from '../src/scene/anything-for-love.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {BeastStage}=await import('../src/ui/render/anything-for-love.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/anything-for-love/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','answer'].map(name=>{const raw=gunzipSync(file(name+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:i?'love-answer' as const:'beast-singer' as const,track,model:new VoiceModel(track.body,track.sampleRate)}));
test('the complete Meat Loaf film includes its long lead, closing duet and escape',()=>{
 expect(movieScene('anything-for-love')).toBeDefined();expect(scene.setting).toBe('beast');expect(scene.duration).toBeGreaterThan(460.9);expect(scene.duration).toBeLessThan(461.1);expect(scene.characters.map(c=>c.id)).toEqual(['beast-singer','love-answer']);expect(score.parts[0].performance!.lyrics.toLowerCase()).toContain('anything for love');expect(score.parts[1].performance!.lyrics.toLowerCase()).toContain('will you');expect(scene.cues.at(-1)!.end).toBeGreaterThan(435);expect(score.parts[0].performance!.phrases[0].start).toBeLessThan(50);expect(score.parts[0].melody!.notes.length).toBeGreaterThan(400);expect(file('mix.mp3').length).toBeGreaterThan(14_000_000);
 expect(sceneCamera(scene,70,'auto')).toBe('beast-singer');expect(sceneCamera(scene,375,'auto')).toBe('love-answer');expect(sceneCamera(scene,450,'auto')).toBe('beast-escape');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'eclipse-school'}]})).toThrow('camera');
});
test('both singers use physical phones, independent bodies and exact finite sample-clock telemetry',()=>{
 expect(score.parts[2].recordingType).toBe('instrumental');expect(score.parts[0].body.female).toBe(0);expect(score.parts[1].body.female).toBeGreaterThan(.5);
 for(const [i,p]of score.parts.slice(0,2).entries()){expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(validPerformance(p.performance!,score.duration)).toBe(true);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);for(const ph of p.performance!.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<38)expect(t.outRms).toBeLessThan(.00001);}}
});
test('the chase, mirror, throne, floating bed, detectives and escape restore after seeks',()=>{
 expect(beastPose(NaN)).toEqual(beastPose(0));expect(beastPlace('beast-bedroom',70)).toBe('bedroom');const people=cast(),stage=new BeastStage(people);
 try{for(const time of [20,70,125,151,165,245,300,370,420,435,452]){stage.frame(time,true,1,'wide',.8);const snapshot=()=>[...stage.actors.flatMap(a=>[...a.root.matrixWorld.elements,Number(a.root.visible)]),...stage.bed.matrixWorld.elements,...stage.bike.matrixWorld.elements,...stage.helicopter.matrixWorld.elements,...stage.fragments.flatMap(m=>m.matrixWorld.elements),...Object.values(stage.sets).map(g=>Number(g.visible))],before=snapshot();expect(Object.values(stage.sets).filter(g=>g.visible).length).toBe(1);expect(stage.reflectionRoot.visible).toBe(time===70);expect(stage.bike.visible).toBe(time===20||time===452);if(time===370)expect(stage.bed.position.y).toBeGreaterThan(0);if(time===435)expect(beastPose(time).human).toBeGreaterThan(.5);stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let j=0;j<m.geometry.instanceCount;j++)expect([a.getX(j),a.getY(j),a.getZ(j)].every(Number.isFinite)).toBe(true);}});stage.frame(5,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);}}
 finally{stage.dispose();people.forEach(a=>a.model.dispose());}
});
test('both heads remain framed while riding, reclining and singing, and the mirror borrows its model',()=>{
 const people=cast(),stage=new BeastStage(people);try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [20,70,165,245,370,435,452])for(const [i,view]of ['beast-singer','love-answer'].entries()){stage.resize(w,h);stage.frame(time,true,1,view as 'beast-singer'|'love-answer',.8);let count=0,inside=true;stage.actors[i].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const camera of SCENE_SETTINGS.beast.cameras){const c=beastCamera(camera,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}}}
 finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();people.forEach(a=>a.model.dispose());}
});
