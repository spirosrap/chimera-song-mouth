import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {behaviourPose,behaviourCamera} from '../src/scene/human-behaviour.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {BehaviourStage}=await import('../src/ui/render/human-behaviour.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/human-behaviour/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('Human Behaviour retains the full film, lyric refrains, seven source-phone calls and the bear’s green-world ending',()=>{
 expect(movieScene('human-behaviour')).toBeDefined();expect(scene.setting).toBe('behaviour');expect(scene.duration).toBeGreaterThan(255.3);expect(scene.duration).toBeLessThan(255.5);expect(scene.characters.map(c=>c.id)).toEqual(['bjork']);
 expect(score.parts[0].melody!.notes.length).toBe(243);expect(scene.cues.length).toBe(37);expect(scene.cues.filter(c=>c.text==='[Wordless call]').length).toBe(7);expect(scene.cues[0].start).toBeGreaterThan(13);expect(scene.cues.at(-1)!.end).toBeGreaterThan(249.5);expect(score.parts[1].recordingType).toBe('instrumental');
 for(const [time,view]of [[25,'behaviour-bear'],[61,'behaviour-cabin'],[91,'behaviour-small'],[135,'behaviour-float'],[172,'behaviour-astronaut'],[194,'behaviour-belly'],[202,'behaviour-bulb'],[249,'behaviour-ending']]as const)expect(sceneCamera(scene,time,'auto')).toBe(view);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'freddie'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'free-vacuum'}]})).toThrow('camera');
});

test('the actual physical singer and calls have audible phrases, finite articulation and exact source-clock silence',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(part.performance!.phrases.length).toBe(36);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((s,p)=>s+p.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<12.8||j/20>117&&j/20<130||j/20>202&&j/20<232||j/20>252.5)expect(t.outRms).toBeLessThan(.00001);}
});

test('seeking restores the bear, cabin, moth, car, water, moon, tiny singer and final world without stale camera roll',()=>{
 expect(behaviourPose(NaN)).toEqual(behaviourPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new BehaviourStage(model,track);
 const snapshot=()=>[stage.forest.visible,stage.cabin.visible,stage.road.visible,stage.river.visible,stage.space.visible,stage.inside.visible,stage.finalFoliage.visible,...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.limbs.flatMap(m=>m.matrixWorld.elements)]),...stage.bears.flatMap(b=>[b.root.visible,...b.root.matrixWorld.elements,...b.jaw.matrixWorld.elements,...b.arms.flatMap(a=>a.matrixWorld.elements)]),...stage.car.matrixWorld.elements,...stage.moth.matrixWorld.elements,...stage.mothWings.flatMap(m=>m.matrixWorld.elements),...stage.earth.matrixWorld.elements,...stage.planet.matrixWorld.elements,...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{for(const time of [6,15,25,36,42,52,61,84,91,118,135,143,155,172,180,194,202,207,226,249]){const view=sceneCamera(scene,time,'auto');stage.frame(time,true,1,view,.8);const before=snapshot();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(135,true,2,'behaviour-float',.8);stage.frame(time,false,3,view,.8);expect(snapshot()).toEqual(before);}
  expect(stage.actors.map(a=>a.look)).toEqual(['forest','cabin','float','astronaut','belly']);expect(stage.bears.length).toBe(3);expect(stage.trees.length).toBeGreaterThan(8);expect(stage.mothWings.length).toBe(2);stage.frame(249,true,1,'behaviour-ending',.8);expect(stage.bears[2].root.visible).toBe(true);expect(stage.actors.every(a=>!a.root.visible)).toBe(true);
 }finally{stage.dispose();model.dispose();}
});

test('all physical looks fit phone and landscape close-ups, the bear’s face is clear, and shared model ownership stays intact',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new BehaviourStage(model,track),shared=new Beams();
 try{for(const [w,h]of [[960,720],[375,430]])for(const [time,view]of [[36,'behaviour-singer'],[61,'behaviour-bowl'],[135,'behaviour-float'],[172,'behaviour-astronaut'],[194,'behaviour-belly']]as const){stage.resize(w,h);stage.frame(time,true,1,view,.8);const actor=stage.actors.find(a=>a.root.visible)!;let count=0,inside=true;actor.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===actor.hair.group)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.max(Math.abs(v.x),Math.abs(v.y))<.99&&Math.abs(v.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.behaviour.cameras){const c=behaviourCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
  stage.resize(960,720);for(const t of [25,45,148,218]){stage.frame(t,true,1,'behaviour-bear',.8);for(const s of [-1,1]){const eye=stage.bears[0].head.localToWorld(new THREE.Vector3(s*21,11,40)),d=stage.camera.position.distanceTo(eye),ray=new THREE.Raycaster(stage.camera.position,eye.clone().sub(stage.camera.position).normalize());expect(ray.intersectObjects(stage.trees,true).some(hit=>hit.distance<d-.1)).toBe(false);}}
  stage.frame(97,true,1,'behaviour-hunter',.8);const face=stage.hunter.localToWorld(new THREE.Vector3(0,163,10)),projected=face.clone().project(stage.camera);expect(Math.max(Math.abs(projected.x),Math.abs(projected.y))).toBeLessThan(.7);const ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.forest.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===stage.hunter)return;p=p.parent;}if((o as THREE.Mesh).isMesh&&!(o as any).isLineSegments2)blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.2)).toBe(false);
  for(const child of shared.group.children){const m=(child as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
