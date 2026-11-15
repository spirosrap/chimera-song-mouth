import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {surprisePose,surpriseCamera} from '../src/scene/no-surprises.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {SurpriseStage}=await import('../src/ui/render/no-surprises.ts'),{VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/no-surprises/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('No Surprises adds the full helmet take, complete singing and original instrumental ending',()=>{
 expect(movieScene('no-surprises')).toBeDefined();expect(movieScene('spin-round')).toBeDefined();expect(scene.setting).toBe('surprises');expect(scene.duration).toBeGreaterThan(227.3);expect(scene.duration).toBeLessThan(227.7);expect(scene.characters.map(c=>c.id)).toEqual(['surprise-thom']);expect(scene.cues.length).toBeGreaterThan(15);expect(score.parts[0].melody!.notes.length).toBeGreaterThan(100);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues.at(-1)!.end).toBeGreaterThan(190);expect(sceneCamera(scene,140,'auto')).toBe('surprise-submerged');expect(sceneCamera(scene,179,'auto')).toBe('surprise-draining');expect(sceneCamera(scene,183,'auto')).toBe('surprise-breath');expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'spin-pete'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'spin-pete'}]})).toThrow('camera');
});

test('the singing comes from the airway with audible complete phrases and exact finite telemetry',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<20)expect(t.outRms).toBeLessThan(.00001);}
});

test('the helmet water fills and drains on source time and restores exactly after backward seeks',()=>{
 expect(surprisePose(NaN)).toEqual(surprisePose(0));expect(surprisePose(70).water).toBe(0);expect(surprisePose(140).water).toBe(1);expect(surprisePose(181).water).toBe(0);const model=new VoiceModel(track.body,track.sampleRate),stage=new SurpriseStage(model,track);
 const snapshot=()=>[stage.volume.visible,...stage.volume.matrixWorld.elements,...stage.singer.matrixWorld.elements,...stage.head.scene.matrixWorld.elements,...stage.bubbles.flatMap(m=>[m.visible,...m.matrixWorld.elements]),...stage.droplets.flatMap(m=>[m.visible,...m.matrixWorld.elements]),...stage.lamps.flatMap(m=>[m.visible,...(m.material as THREE.MeshBasicMaterial).color.toArray()]),...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{for(const t of [10,35,80,111,139,179,182,211]){stage.frame(t,true,1,'surprise-helmet',.8);const a=snapshot();expect(a.every(x=>typeof x==='boolean'||Number.isFinite(x))).toBe(true);stage.frame(182,true,2,'surprise-breath',.8);stage.frame(t,false,3,'surprise-helmet',.8);expect(snapshot()).toEqual(a);}expect((stage.glass.material as THREE.Material).transparent).toBe(true);expect((stage.volume.material as THREE.Material).opacity).toBeLessThan(.2);
 }finally{stage.dispose();model.dispose();}
});

test('the face fits phones and desktop; water stays transparent, props leave its mouth clear and its borrowed model survives disposal',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new SurpriseStage(model,track),shared=new Beams();try{for(const [w,h]of [[960,720],[375,430]])for(const [t,v]of [[80,'surprise-face'],[111,'surprise-water'],[139,'surprise-submerged'],[182,'surprise-breath']]as const){stage.resize(w,h);stage.frame(t,true,1,v,.8);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===stage.hair.group)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);const face=stage.singer.localToWorld(new THREE.Vector3(0,20.4,30.6)),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.helmet.traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9)blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);for(const view of SCENE_SETTINGS.surprises.cameras){const c=surpriseCamera(view,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
 for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
