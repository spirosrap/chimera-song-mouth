import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {freePose,freeCamera} from '../src/scene/break-free.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {BreakFreeStage}=await import('../src/ui/render/break-free.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/break-free/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('the full Queen video retains the domestic scenes, complete final refrains and instrumental dance sequence',()=>{
 expect(movieScene('break-free')).toBeDefined();expect(scene.setting).toBe('breakfree');expect(scene.duration).toBeGreaterThan(271.5);expect(scene.duration).toBeLessThan(272);expect(scene.characters.map(c=>c.id)).toEqual(['freddie']);
 expect(score.parts[0].melody!.notes.length).toBe(205);expect(scene.cues.length).toBe(32);expect(scene.cues[0].start).toBeGreaterThan(44);expect(scene.cues.at(-1)!.end).toBeGreaterThan(252);
 expect(score.parts[1].recordingType).toBe('instrumental');expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);
 for(const [time,view]of [[32,'free-vacuum'],[41,'free-kitchen'],[143,'free-pyramid'],[168,'free-lift'],[205,'free-home'],[226,'free-stairs'],[248,'free-frontman']]as const)expect(sceneCamera(scene,time,'auto')).toBe(view);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'tipsy-singer'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'tipsy-band'}]})).toThrow('camera');
});

test('the physical lead has complete audible phrases, exact articulation clocks and silent instrumental bookends',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const phrase of part.performance!.phrases){const end=phrase.start+phrase.phones.reduce((s,p)=>s+p.duration,0);let peak=0;for(let j=track.indexAt(phrase.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<44||j/20>132&&j/20<191||j/20>254.5)expect(t.outRms).toBeLessThan(.00001);}
});

test('the vacuum, staircase, dancers, lift and cloth restore immediately after forward and backward seeks',()=>{
 expect(freePose(NaN)).toEqual(freePose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new BreakFreeStage(model,track);
 const snapshot=()=>[...['home','kitchen','roofs','crowd','ballet','cave','title'].map(k=>(stage as any)[k].visible),stage.vacuum.visible,stage.sheet.visible,...stage.vacuum.matrixWorld.elements,...stage.vacuumHandle.matrixWorld.elements,...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.limbs.flatMap(m=>m.matrixWorld.elements)]),...stage.dancers.flatMap(d=>[d.root.visible,...d.root.matrixWorld.elements,...d.limbs.flatMap(m=>m.matrixWorld.elements)]),...stage.camera.matrixWorld.elements];
 try{for(const time of [1,12,23,32,41,54,84,96,105,115,126,140,168,180,205,216,226,248,269]){const view=sceneCamera(scene,time,'auto');stage.frame(time,true,1,view,.8);const before=snapshot();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(0,true,2,'free-title',0);stage.frame(time,false,3,view,.8);expect(snapshot()).toEqual(before);}
  expect(stage.actors.map(a=>a.look)).toEqual(['maid','frontman','dancer']);expect(stage.family.length).toBe(4);expect(stage.dancers.length).toBe(13);expect(stage.audience.length).toBe(99);expect(stage.vacuumWheels.length).toBe(2);
  stage.resize(960,720);stage.frame(56,true,1,'free-vacuum',.8);expect(stage.bars.every(b=>!b.visible)).toBe(true);stage.resize(1280,720);stage.frame(56,true,1,'free-vacuum',.8);expect(stage.bars.every(b=>b.visible)).toBe(true);
 }finally{stage.dispose();model.dispose();}
});

test('the three physical heads fit mobile and landscape cameras without disposing the retained model or changing other scenes',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new BreakFreeStage(model,track),shared=new Beams();
 try{for(const [w,h]of [[960,720],[375,430]])for(const [time,view]of [[56,'free-maid'],[115,'free-dancer'],[248,'free-frontman']]as const){stage.resize(w,h);stage.frame(time,true,1,view,.8);const a=stage.actors.find(a=>a.root.visible)!;let count=0,inside=true;
   a.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===a.hair.group)return;p=p.parent;}const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=mesh.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<mesh.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(mesh.matrixWorld).project(stage.camera);inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.max(Math.abs(v.x),Math.abs(v.y))<.99&&Math.abs(v.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
   for(const v of SCENE_SETTINGS.breakfree.cameras){const c=freeCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
  }
  const lip=model.frame(VoiceModel.articFromArray(track.message(0).t.artic)).upperLip;for(const a of stage.actors){const moustache=a.head.scene.getObjectByName('freddie-moustache')!;expect(moustache.children.length).toBe(2);for(const piece of moustache.children){expect(piece.position.y).toBeGreaterThan(lip[6].y);expect(piece.position.y).toBeLessThan(lip.at(-1)!.y+.3);expect(Math.abs(piece.position.x-lip[9].x)).toBeLessThan(1);}}
  for(const child of shared.group.children){const m=(child as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
