import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {rosePose,roseCamera} from '../src/scene/wild-roses.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {RosesStage}=await import('../src/ui/render/wild-roses.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/wild-roses/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','answer'].map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:['kylie-rose','nick-cave'][i]as 'kylie-rose'|'nick-cave',model:new VoiceModel(track.body,track.sampleRate),track}));
test('Wild Roses retains the full duet, instrumental opening and empty river ending',()=>{
 expect(movieScene('wild-roses')).toBeDefined();expect(scene.setting).toBe('wildroses');expect(scene.duration).toBeGreaterThan(272.3);expect(scene.duration).toBeLessThan(272.5);expect(scene.characters.map(c=>c.id)).toEqual(['kylie-rose','nick-cave']);expect(score.parts.slice(0,2).map(p=>p.melody!.notes.length)).toEqual([272,272]);expect(score.parts[2].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(35);expect(scene.cues.at(-1)!.end).toBeGreaterThan(259);expect(scene.cues.at(-1)!.end).toBeLessThan(263);expect(scene.cues.length).toBe(42);expect(scene.cues.every(c=>c.text.length<100&&!/thanks for watching/i.test(c.text))).toBe(true);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(sceneCamera(scene,120,'auto')).toBe('roses-snake');expect(sceneCamera(scene,255,'auto')).toBe('roses-lips');expect(sceneCamera(scene,270,'auto')).toBe('roses-ending');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'morten'}]})).toThrow('camera');
});
test('both independent physical singers have complete audible phrases, source-clock telemetry and a silent opening',()=>{
 score.parts.filter(p=>p.kind==='voice').forEach((part,i)=>{const track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((s,x)=>s+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<30||j/20>264)expect(t.outRms).toBeLessThan(.00001);}
 });expect(score.parts[0].body.female).not.toBe(score.parts[1].body.female);
});
test('lying poses, moving cloth, snake, hand and rose restore directly after backwards seeks',()=>{
 expect(rosePose(NaN)).toEqual(rosePose(0));const people=cast(),stage=new RosesStage(people);const snapshot=()=>[...stage.singers.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.cloth.geometry.getAttribute('position').array]),...stage.camera.matrixWorld.elements,...stage.camera.up.toArray(),stage.snake.visible,...stage.snake.geometry.getAttribute('position').array,stage.lipRose.visible,...stage.lipRose.matrixWorld.elements];
 try{for(const t of [16,45,55,80,100,120,164,174,229,255,270]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snapshot();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(3,true,2,'roses-water',0);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(before);}stage.frame(120,true,4,'roses-snake',.8);expect(stage.snake.visible).toBe(true);stage.frame(100,true,5,'roses-touch',.8);expect(stage.snake.visible).toBe(false);stage.frame(255,true,6,'roses-lips',.8);expect(stage.lipRose.visible).toBe(true);expect(stage.lipRose.position.distanceTo(new THREE.Vector3(...rosePose(255).mouth))).toBeCloseTo(2);stage.frame(270,true,7,'roses-ending',0);expect(stage.singers.every(a=>!a.root.visible)).toBe(true);expect(rosePose(255).rose).toBe(1);expect(rosePose(80).kneel).toBe(true);}
 finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('upright and face-up physical heads fit desktop and mobile cameras without changing other neon scenes or borrowed models',()=>{
 const people=cast(),stage=new RosesStage(people),defaultInk=new Beams();
 try{expect(stage.singers[0].model).not.toBe(stage.singers[1].model);for(const [w,h]of [[1280,720],[375,430]])for(const [time,view,index]of [[55,'kylie-rose',1],[130,'kylie-rose',1],[73,'nick-cave',0],[80,'nick-cave',0],[220,'nick-cave',0],[255,'roses-lips',1]]as const){stage.resize(w,h);stage.frame(time,true,1,view,.8);const a=stage.singers[index];expect(a.root.visible).toBe(true);let count=0,inside=true;a.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===a.hair.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,attr=m.geometry?.getAttribute('instanceStart');if(attr)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(attr,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);expect(stage.camera.up.toArray()).toEqual(time===130||time===255?[0,0,-1]:[0,1,0]);for(const v of SCENE_SETTINGS.wildroses.cameras){const c=roseCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
 // A decorative river rose formerly sat directly over her face in the overhead close-up.
 for(const [time,view]of [[130,'kylie-rose'],[255,'roses-lips']]as const){stage.frame(time,true,2,view,.8);const eyeLine=stage.singers[1].root.localToWorld(new THREE.Vector3(0,16,6)),delta=eyeLine.clone().sub(stage.camera.position),distance=delta.length(),ray=new THREE.Raycaster(stage.camera.position,delta.normalize()),solids:THREE.Object3D[]=[];stage.river.traverseVisible(o=>{const mesh=o as THREE.Mesh;const mat=mesh.material as THREE.Material;if(mesh.isMesh&&!(mesh as any).isLineSegments2&&mat.opacity>.9)solids.push(o);});expect(ray.intersectObjects(solids,false).some(hit=>hit.distance<distance-1)).toBe(false);}
 stage.frame(55,true,2,'kylie-rose',.8);stage.singers[1].head.scene.traverse(o=>{const m=o as THREE.Mesh;if((m as any).isLineSegments2)expect((m.material as THREE.Material).blending).toBe(THREE.NormalBlending);});for(const child of defaultInk.group.children){const m=(child as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();people.forEach(p=>p.model.dispose());defaultInk.dispose();}
});
