import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {takePose,takePlace,takeCamera} from '../src/scene/take-on-me.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {TakeStage}=await import('../src/ui/render/take-on-me.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/take-on-me/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','answer'].map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:['morten','take-answer'][i]as 'morten'|'take-answer',model:new VoiceModel(track.body,track.sampleRate),track}));
test('Take On Me retains the complete supplied video, instrumental opening, physical replies and ending',()=>{
 expect(movieScene('take-on-me')).toBeDefined();expect(scene.setting).toBe('takeon');expect(scene.duration).toBeGreaterThan(244.3);expect(scene.duration).toBeLessThan(244.5);expect(scene.characters.map(c=>c.id)).toEqual(['morten','take-answer']);expect(score.parts[0].melody!.notes.length).toBe(175);expect(score.parts[1].melody!.notes.length).toBe(27);expect(score.parts[2].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(35);expect(scene.cues.at(-1)!.end).toBeGreaterThan(212);expect(scene.cues.at(-1)!.end).toBeLessThan(215);expect(scene.cues.every(c=>c.text.length<100)).toBe(true);expect(file('mix.mp3').length).toBeGreaterThan(7_500_000);expect(sceneCamera(scene,8,'auto')).toBe('take-helmet');expect(sceneCamera(scene,209,'auto')).toBe('take-transform');expect(sceneCamera(scene,235,'auto')).toBe('take-cover');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'sinead'}]})).toThrow('camera');
});
test('both physical singers have audible complete phrases, exact telemetry time and silent instrumental passages',()=>{
 score.parts.filter(p=>p.kind==='voice').forEach((part,i)=>{const track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((s,x)=>s+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<30||j/20>217)expect(t.outRms).toBeLessThan(.00001);}
 });
});
test('graphite is dark normal-blended ink on paper and never changes the shared neon renderer',()=>{
 const defaultInk=new Beams(),people=cast(),stage=new TakeStage(people);const difference=()=>{let diff=0,count=0;stage.actors[0].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceColorStart');if(!a)return;expect((m.material as THREE.Material).blending).toBe(THREE.NormalBlending);for(let i=0;i<m.geometry.instanceCount;i++){diff=Math.max(diff,Math.abs(a.getX(i)-a.getY(i)),Math.abs(a.getY(i)-a.getZ(i)));count++;}});expect(count).toBeGreaterThan(1000);return diff;};
 try{stage.frame(85,true,1,'take-pair',.8);expect(difference()).toBeLessThan(.000001);stage.frame(220,true,2,'morten',.8);expect(difference()).toBeGreaterThan(.03);stage.frame(85,false,3,'take-pair',.8);expect(difference()).toBeLessThan(.000001);for(const child of defaultInk.group.children){const m=(child as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}}
 finally{stage.dispose();people.forEach(p=>p.model.dispose());defaultInk.dispose();}
});
test('the wink, reaching hand, paper escape, bin climb and transformation restore directly after seeking',()=>{
 expect(takePose(NaN)).toEqual(takePose(0));const people=cast(),stage=new TakeStage(people);const snapshot=()=>[...Object.values(stage.sets).flatMap(g=>[g.visible,...g.matrixWorld.elements]),...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,a.winkCover?.visible??false]),...stage.book.matrixWorld.elements];
 try{for(const t of [8,38,43,55,71,82,96,119,154,176,190,210,220,235]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snapshot();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(3,true,2,'take-race',0);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(before);}expect(takePose(55.4).wink).toBeGreaterThan(.9);stage.frame(55.4,true,4,'morten',.8);expect(stage.actors[0].winkCover!.visible).toBe(true);expect((stage.actors[0].winkCover!.material as THREE.Material).transparent).toBe(true);expect(stage.actors[0].winkCover!.renderOrder).toBeGreaterThan(30);stage.frame(60,true,5,'morten',.8);expect(stage.actors[0].winkCover!.visible).toBe(false);expect(takePose(71).reach).toBeGreaterThan(.8);expect(takePose(176).girl[1]).toBeLessThan(takePose(180).girl[1]);expect(takePose(215).transform).toBeLessThan(takePose(220).transform);expect(takePlace('morten',53)).toBe('comic');expect(stage.bikes.children.length).toBe(3);}
 finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('named physical heads remain visible and framed on mobile and cinema cameras and retain borrowed models',()=>{
 const people=cast(),stage=new TakeStage(people);
 try{expect(stage.actors[0].model).toBe(stage.actors[1].model);expect(stage.actors[0].model).toBe(stage.actors[2].model);expect(stage.actors[3].model).not.toBe(stage.actors[0].model);for(const [w,h]of [[1280,720],[375,430]])for(const [time,view,index]of [[53,'morten',0],[84,'take-girl',1],[105,'morten',0],[112,'take-answer',3],[210,'morten',0],[220,'morten',0],[3,'take-girl',1]]as const){stage.resize(w,h);stage.frame(time,true,1,view,.8);const actor=stage.actors[index];expect(actor.root.visible).toBe(true);let count=0,inside=true;actor.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===actor.hair.group||parent===actor.wink.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.takeon.cameras){const c=takeCamera(v,w/h,time);expect([...c.target,...c.position,c.fov].every(Number.isFinite)).toBe(true);}}
 }finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();people.forEach(p=>p.model.dispose());}
});
