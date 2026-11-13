import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,sceneCue,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {eclipsePose,eclipsePlace,eclipseCamera} from '../src/scene/total-eclipse.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {EclipseStage}=await import('../src/ui/render/total-eclipse.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/total-eclipse/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','answer'].map(name=>{const raw=gunzipSync(file(name+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:i?'bright-eyes' as const:'bonnie' as const,track,model:new VoiceModel(track.body,track.sampleRate)}));
test('the complete Eclipse video includes both singers, the nightmare and daylight ending',()=>{
 expect(movieScene('total-eclipse')).toBeDefined();expect(scene.setting).toBe('eclipse');expect(scene.duration).toBeGreaterThan(334);expect(scene.duration).toBeLessThan(334.4);expect(scene.characters.map(c=>c.id)).toEqual(['bonnie','bright-eyes']);expect(score.parts[0].performance!.lyrics).toContain('I need you');expect(score.parts[1].performance!.lyrics.toLowerCase()).toContain('bright eyes');expect(scene.cues.at(-1)!.end).toBeGreaterThan(290);expect(file('mix.mp3').length).toBeGreaterThan(10_000_000);
 expect(sceneCue(scene,34)?.text).toContain('terrified');expect(sceneCue(scene,34)?.text.toLowerCase()).toContain('every now and then');expect(sceneCamera(scene,120,'auto')).toBe('eclipse-stairs');expect(sceneCamera(scene,210,'auto')).toBe('eclipse-eyes');expect(sceneCamera(scene,280,'auto')).toBe('eclipse-school');expect(sceneCamera(scene,325,'auto')).toBe('eclipse-courtyard');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'bolton-fire'}]})).toThrow('camera');
});
test('both voices use independent physical phones and exact finite telemetry on the music clock',()=>{
 expect(score.parts[2].recordingType).toBe('instrumental');expect(score.parts[0].body.female).toBeGreaterThan(.5);expect(score.parts[1].body.female).toBe(0);
 for(const [i,p]of score.parts.slice(0,2).entries()){expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(validPerformance(p.performance!,score.duration)).toBe(true);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);for(const ph of p.performance!.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<7)expect(t.outRms).toBeLessThan(.00001);}}
});
test('curtains, dancers, balcony, eyes and courtyard restore after backward seeking',()=>{
 expect(eclipsePose(NaN)).toEqual(eclipsePose(0));expect(eclipsePlace('eclipse-curtains',20)).toBe('curtains');const people=cast(),stage=new EclipseStage(people);
 try{for(const time of [5,20,45,63,110,130,180,215,230,270,280,301,320]){stage.frame(time,true,1,'wide',.8);const snapshot=()=>[...stage.actors.flatMap(a=>[...a.root.matrixWorld.elements,Number(a.root.visible),Number(a.eyes.visible)]),...stage.figures.flatMap(g=>g.matrixWorld.elements),...stage.drapes.flatMap(m=>Array.from(m.geometry.getAttribute('position').array)),...Object.values(stage.rooms).map(g=>Number(g.visible))],before=snapshot();expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);expect(stage.figures.length).toBe(12);if(time===130)expect(stage.actors[0].root.position.y).toBe(308);if(time===230)expect(stage.actors[1].eyes.visible).toBe(true);stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);}}
 finally{stage.dispose();people.forEach(a=>a.model.dispose());}
});
test('both physical heads stay framed in closeups and retain their borrowed model leases',()=>{
 const people=cast(),stage=new EclipseStage(people);try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [20,63,130,230,301])for(const [i,view]of ['bonnie','bright-eyes'].entries()){stage.resize(w,h);stage.frame(time,true,1,view as 'bonnie'|'bright-eyes',.8);let count=0,inside=true;stage.actors[i].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const camera of SCENE_SETTINGS.eclipse.cameras){const c=eclipseCamera(camera,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}}}
 finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();people.forEach(a=>a.model.dispose());}
});
