import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {spinPose,spinCamera,spinSet} from '../src/scene/spin-round.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {SpinStage}=await import('../src/ui/render/spin-round.ts'),{VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/spin-round/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('You Spin Me Round adds the complete supplied video and source-timed refrain without borrowing another scene cast',()=>{
 expect(movieScene('spin-round')).toBeDefined();expect(movieScene('lullaby')).toBeDefined();expect(scene.setting).toBe('spin');expect(scene.duration).toBeGreaterThan(196.8);expect(scene.duration).toBeLessThan(197.2);expect(scene.characters.map(c=>c.id)).toEqual(['spin-pete']);expect(scene.cues.length).toBeGreaterThan(20);expect(scene.cues.at(-1)!.end).toBeGreaterThan(185);expect(score.parts[0].melody!.notes.length).toBeGreaterThan(200);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(12);expect(sceneCamera(scene,18,'auto')).toBe('spin-portrait');expect(sceneCamera(scene,57,'auto')).toBe('spin-eyepatch');expect(sceneCamera(scene,91,'auto')).toBe('spin-arms');expect(sceneCamera(scene,146,'auto')).toBe('spin-confetti');
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'lullaby-robert'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'lullaby-singer'}]})).toThrow('camera');
});

test('all phrases have physical output and exact telemetry; the opening repeated I respects its source rest',()=>{
 const part=score.parts[0];expect(part.melody!.notes.find(n=>n.lyricIndex===2)!.start).toBeGreaterThan(18.05);expect(part.melody!.notes.find(n=>n.lyricIndex===2)!.start).toBeLessThan(18.3);expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 let repeatedI=0;for(let j=0;j<track.frames;j++){const t=track.message(j).t;if(j/20>18.15&&j/20<18.5)repeatedI=Math.max(repeatedI,t.outRms);expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<12||j/20>16.95&&j/20<18)expect(t.outRms).toBeLessThan(.00001);}expect(repeatedI).toBeGreaterThan(.0001);
});

test('the three costumes, extra arms, back-to-back band, flags and mirror ball restore on backward source-time seeks',()=>{
 expect(spinPose(NaN)).toEqual(spinPose(0));expect(spinSet('spin-pete',18)).toBe('portrait');expect(spinSet('spin-pete',57)).toBe('gold');expect(spinSet('spin-pete',51)).toBe('blue');const model=new VoiceModel(track.body,track.sampleRate),stage=new SpinStage(model,track);
 const snapshot=()=>[...Object.values(stage.rooms).map(g=>g.visible),...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.hands.flatMap(h=>h.matrixWorld.elements)]),...stage.orbs.flatMap(g=>g.matrixWorld.elements),stage.band.visible,...stage.band.matrixWorld.elements,...stage.extraArms.flatMap(p=>p.flatMap(m=>[m.visible,...m.matrixWorld.elements])),...stage.dancers.flatMap(d=>[d.root.visible,...d.flag.matrixWorld.elements,...(d.cloth.geometry.getAttribute('position').array as Float32Array)]),...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{expect(stage.actors.length).toBe(3);expect(stage.dancers.length).toBe(4);expect(stage.extraArms.length).toBe(4);for(const [t,v]of [[18,'spin-portrait'],[47,'spin-blue'],[57,'spin-eyepatch'],[66,'spin-band'],[76,'spin-orb'],[91,'spin-arms'],[126,'spin-flags'],[146,'spin-confetti'],[171,'spin-ribbons']]as const){stage.frame(t,true,1,v,.8);const a=snapshot();expect(a.every(x=>typeof x==='boolean'||Number.isFinite(x))).toBe(true);stage.frame(171,true,2,'spin-ribbons',.8);stage.frame(t,false,3,v,.8);expect(snapshot()).toEqual(a);}stage.frame(57,true,1,'spin-eyepatch',.8);expect(stage.dancers.some(d=>d.root.visible)).toBe(false);stage.frame(146,true,1,'spin-confetti',.8);expect(stage.dancers.every(d=>d.root.visible)).toBe(true);
 }finally{stage.dispose();model.dispose();}
});

test('physical heads fit desktop and phones; costume and flags leave the lead mouth clear and retain its model lease',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new SpinStage(model,track),shared=new Beams();
 try{for(const [w,h]of [[960,720],[375,430]])for(const [t,v,look]of [[18,'spin-portrait','portrait'],[47,'spin-blue','blue'],[57,'spin-eyepatch','gold'],[91,'spin-arms','gold'],[146,'spin-confetti','gold']]as const){stage.resize(w,h);stage.frame(t,true,1,v,.8);const a=stage.actors.find(a=>a.look===look)!;let count=0,inside=true;a.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===a.hair.group||p===a.mask)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.spin.cameras){const c=spinCamera(v,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
 const face=a.root.localToWorld(new THREE.Vector3(0,16.8,25.2)),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.rooms[look].traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9)blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);}
 for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
