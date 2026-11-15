import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {glassPose,glassCamera} from '../src/scene/walking-broken-glass.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {GlassStage}=await import('../src/ui/render/walking-broken-glass.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/walking-broken-glass/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('Walking on Broken Glass retains the full party video, lyrics, quarrel, stairs and carried ending beside the existing catalog',()=>{
 expect(movieScene('walking-broken-glass')).toBeDefined();expect(movieScene('nightwish-phantom')).toBeDefined();expect(movieScene('sweet-dreams')).toBeDefined();expect(scene.setting).toBe('glass');expect(scene.duration).toBeGreaterThan(239.3);expect(scene.duration).toBeLessThan(239.5);expect(scene.characters.map(c=>c.id)).toEqual(['glass-annie']);expect(scene.cues.length).toBe(41);expect(scene.shots.length).toBe(36);expect(score.parts[0].melody!.notes.length).toBe(365);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues.some(c=>c.text==='So take me from the wreckage')).toBe(true);expect(scene.cues.at(-1)!.end).toBeGreaterThan(235);
 for(const [t,v]of [[28,'glass-singer'],[63,'glass-gossip'],[120,'glass-corridor'],[129,'glass-pair'],[196,'glass-struggle'],[211,'glass-spiral'],[219,'glass-stairs'],[226,'glass-rescue'],[232,'glass-final-kiss']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'annie'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'dreams-cows'}]})).toThrow('camera');
});

test('the approved physical singer stays audible through all 38 phrases with quiet instrumental gaps and finite exact-clock mouth movement',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(part.performance!.phrases.length).toBe(38);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const phrase of part.performance!.phrases){const end=phrase.start+phrase.phones.reduce((n,p)=>n+p.duration,0);let peak=0;for(let j=track.indexAt(phrase.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 let last=0;for(let j=0;j<track.frames;j++){const t=track.message(j).t,clock=j/20;expect(t.clock).toBeCloseTo(clock,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(clock<8.3||clock>236.3||clock>153&&clock<159)expect(t.outRms).toBeLessThan(.00001);if(clock>234&&clock<235.5)last=Math.max(last,t.outRms);}expect(last).toBeGreaterThan(.0001);
});

test('party guests, fans, goblets, costume, quarrel and staircase poses restore directly on backward seeks',()=>{
 expect(glassPose(NaN)).toEqual(glassPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new GlassStage(model,track);
 const snapshot=()=>[stage.party.visible,stage.portrait.visible,stage.corridor.visible,stage.stairs.visible,stage.actor.visible,...stage.actor.matrixWorld.elements,...stage.skirt.matrixWorld.elements,...stage.guests.flatMap(g=>[g.root.visible,...g.root.matrixWorld.elements,...g.head.matrixWorld.elements,g.fan.visible,...g.fan.matrixWorld.elements,g.goblet.visible,...g.goblet.matrixWorld.elements,...g.arms.flatMap(a=>a.matrixWorld.elements),...g.hands.flatMap(a=>a.matrixWorld.elements)]),...stage.flames.flatMap(f=>f.scale.toArray()),...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{for(const t of [2,6,16,28,38,41,55,63,82,95,105,115,120,129,137,149,173,196,211,219,226,232,237]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const a=snapshot();expect(a.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(211,true,2,'glass-spiral',.8);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(a);}stage.frame(221.99,true,1,'glass-stairs',.8);expect(stage.actor.position.z).toBeLessThan(0);expect(stage.rescuer.root.visible).toBe(false);stage.frame(222,true,1,'glass-rescue',.8);expect(stage.actor.position.z).toBe(260);expect(stage.rescuer.root.visible).toBe(true);expect(stage.guests.length).toBe(17);expect(stage.stairSteps.length).toBe(37);stage.frame(226,true,1,'glass-rescue',.8);expect(stage.rescuer.root.visible).toBe(true);expect(stage.actor.rotation.z).toBeLessThan(-.5);stage.frame(232,true,1,'glass-final-kiss',.8);expect(stage.actor.rotation.z).toBeGreaterThan(-.4);
 }finally{stage.dispose();model.dispose();}
});

test('the hooded physical head fits phones and desktop, the rescuer keeps a visible face and the stage never disposes its borrowed singer',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new GlassStage(model,track),shared=new Beams();
 const physicalPoints=(fn:(v:THREE.Vector3)=>void)=>{let count=0;stage.head.scene.traverseVisible(o=>{let a:THREE.Object3D|null=o;while(a){if(a===stage.hood||a===stage.hair.group)return;a=a.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){fn(new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld));count++;}});return count;};
 try{for(const [w,h]of [[960,720],[375,430]])for(const [t,view]of [[28,'glass-singer'],[38,'glass-portrait'],[129,'glass-pair'],[196,'glass-struggle'],[219,'glass-stairs'],[226,'glass-rescue'],[232,'glass-final-kiss']]as const){stage.resize(w,h);stage.frame(t,true,1,view,.8);let inside=true;expect(physicalPoints(v=>{v.project(stage.camera);inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.max(Math.abs(v.x),Math.abs(v.y))<.99&&Math.abs(v.z)<1;})).toBeGreaterThan(1000);expect(inside).toBe(true);for(const view of SCENE_SETTINGS.glass.cameras){const c=glassCamera(view,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
  for(const t of [226,232]){stage.resize(960,720);stage.frame(t,true,1,t===226?'glass-rescue':'glass-final-kiss',.8);const face=stage.rescuer.root.localToWorld(new THREE.Vector3(0,163,11)),v=face.clone().project(stage.camera);expect(Math.max(Math.abs(v.x),Math.abs(v.y))).toBeLessThan(.9);const blockers:THREE.Object3D[]=[];stage.actor.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===stage.head.scene)return;p=p.parent;}if((o as THREE.Mesh).isMesh&&!(o as any).isLineSegments2)blockers.push(o);});stage.stairs.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===stage.rescuer.root)return;p=p.parent;}if((o as THREE.Mesh).isMesh&&!(o as any).isLineSegments2)blockers.push(o);});const distance=stage.camera.position.distanceTo(face),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize());expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);}
  stage.frame(219,true,1,'glass-stairs',.8);const point=stage.actor.localToWorld(new THREE.Vector3(0,13,14)),distance=stage.camera.position.distanceTo(point),ray=new THREE.Raycaster(stage.camera.position,point.clone().sub(stage.camera.position).normalize()),blockers:THREE.Object3D[]=[];stage.stairs.traverseVisible(o=>{if((o as THREE.Mesh).isMesh&&!(o as any).isLineSegments2)blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);
  for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
