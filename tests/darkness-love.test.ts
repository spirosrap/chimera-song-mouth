import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {darknessPose,darknessCamera,darknessPlace} from '../src/scene/darkness-love.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {DarknessStage}=await import('../src/ui/render/darkness-love.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/darkness-love/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('the complete Darkness video appends independent spaceship cameras and keeps original instrumental music and full guitar ending',()=>{
 expect(movieScene('darkness-love')).toBeDefined();expect(movieScene('lullaby')).toBeDefined();expect(movieScene('nightwish-phantom')).toBeDefined();expect(scene.setting).toBe('darkness');expect(scene.duration).toBeGreaterThan(232);expect(scene.duration).toBeLessThan(232.5);expect(scene.characters.map(c=>c.id)).toEqual(['darkness-justin']);expect(scene.cues.length).toBe(35);expect(scene.shots.length).toBe(33);expect(score.parts[0].melody!.notes.length).toBe(238);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(26);expect(scene.cues.at(-1)!.end).toBeLessThan(186);expect(scene.cues.some(c=>c.text==='Guitar')).toBe(true);
 for(const [t,v]of [[7,'darkness-space'],[28,'darkness-bath'],[41,'darkness-bed'],[83,'darkness-moon'],[89,'darkness-crab'],[103,'darkness-boulder'],[136,'darkness-guitar'],[173,'darkness-band'],[186,'darkness-singer'],[199,'darkness-monster'],[204,'darkness-drums'],[216,'darkness-tentacles']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'lullaby-robert'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'lullaby-singer'}]})).toThrow('camera');
});
test('the physical falsetto and clear phones retain exact finite mouth clocks and genuine instrumental rests',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);expect(Math.max(...part.performance!.contour.map(c=>c.hz))).toBeGreaterThan(650);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t,clock=j/20;expect(t.clock).toBeCloseTo(clock,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(clock<26||clock>186||clock>126.3&&clock<155)expect(t.outRms).toBeLessThan(.00001);}
});
test('the bath, bedroom, crab, boulder, amplifier band, saucer and tentacle battle restore on arbitrary backward seeks',()=>{
 expect(darknessPose(NaN)).toEqual(darknessPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new DarknessStage(model,track);
 const snapshot=()=>[...Object.values(stage.rooms).map(g=>g.visible),...stage.spacecraft.matrixWorld.elements,...stage.crab.matrixWorld.elements,...stage.crabLegs.flatMap(p=>p.flatMap(m=>m.matrixWorld.elements)),stage.boulder.visible,...stage.boulder.matrixWorld.elements,...stage.giants.flatMap(h=>[h.visible,...h.matrixWorld.elements]),...stage.saucer.matrixWorld.elements,stage.monster.visible,...stage.tentacles.flatMap(p=>p.flatMap(m=>m.matrixWorld.elements)),...stage.cups.flatMap(p=>p.flatMap(m=>m.matrixWorld.elements)),...stage.actors.flatMap(a=>[...a.root.matrixWorld.elements,...a.hands.flatMap(h=>h.matrixWorld.elements)]),...stage.players.flatMap(p=>[...p.head.matrixWorld.elements,...p.arms.flatMap(a=>a.matrixWorld.elements),...p.sticks.flatMap(a=>a.matrixWorld.elements)]),...stage.hull.flatMap(m=>(m.material as THREE.MeshBasicMaterial).color.toArray()),...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{for(const t of [7,16,28,41,54,75,83,89,96,103,129,136,158,164,173,180,186,194,199,204,209,216,228]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const a=snapshot();expect(a.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);stage.frame(216,true,2,'darkness-tentacles',.8);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(a);}
  expect(stage.actors.length).toBe(4);expect(stage.players.length).toBe(5);expect(stage.tentacles.length).toBe(8);expect(stage.crabLegs.length).toBe(8);expect(stage.players.find(p=>p.role==='drums')!.sticks.length).toBe(2);stage.frame(180,true,1,'darkness-band',1);expect(stage.monster.visible).toBe(false);stage.frame(199,true,1,'darkness-monster',1);expect(stage.monster.visible).toBe(true);stage.frame(209.2,true,1,'darkness-lasers',1);expect(stage.beams.group.children.some(o=>((o as THREE.Mesh<THREE.InstancedBufferGeometry>).geometry?.instanceCount??0)>0)).toBe(true);for(const t of [7,136]){stage.frame(t,false,1,'darkness-justin',0);expect(stage.rooms.bed.visible).toBe(true);}
 }finally{stage.dispose();model.dispose();}
});
test('all four physical lead heads fit phone and desktop views, props leave lips visible and graphics retain the singer lease',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new DarknessStage(model,track),shared=new Beams();
 try{for(const [w,h]of [[960,540],[375,430]])for(const [t,v,look]of [[28,'darkness-bath','bath'],[54,'darkness-portrait','bed'],[83,'darkness-moon','moon'],[186,'darkness-singer','ship'],[194,'darkness-battle','ship']]as const){stage.resize(w,h);stage.frame(t,true,1,v,.8);const a=stage.actors.find(a=>a.look===look)!;let n=0,inside=true;a.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===a.hair.group||p===a.crown)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const q=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[q.x,q.y,q.z].every(Number.isFinite)&&Math.max(Math.abs(q.x),Math.abs(q.y))<.99&&Math.abs(q.z)<1;n++;}});expect(n).toBeGreaterThan(1000);expect(inside).toBe(true);
   const face=a.root.localToWorld(new THREE.Vector3(0,12,18)),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.rooms[darknessPlace(v,t)].traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9&&!a.root.getObjectById(m.id))blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);
   for(const view of SCENE_SETTINGS.darkness.cameras){const c=darknessCamera(view,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
  }for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
