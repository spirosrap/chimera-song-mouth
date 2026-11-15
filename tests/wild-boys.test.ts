import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {wildPose,wildCamera} from '../src/scene/wild-boys.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {WildStage}=await import('../src/ui/render/wild-boys.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/wild-boys/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('The Wild Boys appends the full industrial recording with intro calls, verses, final choruses and the incomplete fading last refrain',()=>{
 expect(movieScene('wild-boys')).toBeDefined();expect(movieScene('walking-broken-glass')).toBeDefined();expect(movieScene('nightwish-phantom')).toBeDefined();expect(scene.setting).toBe('wildboys');expect(scene.duration).toBeGreaterThan(253);expect(scene.duration).toBeLessThan(253.3);expect(scene.characters.map(c=>c.id)).toEqual(['wild-simon']);expect(scene.cues.length).toBe(51);expect(scene.shots.length).toBe(34);expect(score.parts[0].melody!.notes.length).toBe(294);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues[0].text).toBe('Wild boys');expect(scene.cues.at(-1)!.text).toBe('Wild boys always');expect(scene.cues.at(-1)!.end).toBeGreaterThan(249);
 for(const [t,v]of [[7,'wild-dust'],[37,'wild-robot'],[54,'wild-screen'],[89,'wild-wheel'],[98,'wild-singer'],[118,'wild-drummer'],[133,'wild-cage'],[156,'wild-underwater'],[186,'wild-bridge'],[239,'wild-crew'],[245,'wild-finale']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'glass-annie'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'glass-singer'}]})).toThrow('camera');
});

test('the approved physical singer has 40 audible phrases, finite exact-clock articulation and quiet instrumental passages',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(part.performance!.phrases.length).toBe(40);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 let late=0;for(let j=0;j<track.frames;j++){const t=track.message(j).t,clock=j/20;expect(t.clock).toBeCloseTo(clock,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(clock<2.2||clock>251||clock>163.2&&clock<174.8||clock>183&&clock<199.5)expect(t.outRms).toBeLessThan(.00001);if(clock>247.5&&clock<249.5)late=Math.max(late,t.outRms);}expect(late).toBeGreaterThan(.0001);
});

test('the wheel, three shared displays, punk dancers, band, water and machinery restore deterministically on backward seeks',()=>{
 expect(wildPose(NaN)).toEqual(wildPose(0));expect(wildPose(999).q).toBeCloseTo(7.1,6);const model=new VoiceModel(track.body,track.sampleRate),stage=new WildStage(model,track);
 const snapshot=()=>[...stage.wheel.matrixWorld.elements,...stage.keyboard.matrixWorld.elements,...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements]),...stage.punks.flatMap(p=>[p.root.visible,...p.root.matrixWorld.elements,...p.head.matrixWorld.elements,...p.limbs.flatMap(m=>m.matrixWorld.elements),...p.hands.flatMap(m=>m.matrixWorld.elements)]),...stage.flames.flatMap(m=>m.scale.toArray()),...stage.cymbals.flatMap(m=>m.rotation.toArray().slice(0,3)),...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{for(const t of [7,16,23,31,37,44,54,60,81,89,98,104,111,118,126,133,141,156,168,186,200,218,230,239,245,252]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const a=snapshot();expect(a.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(156,true,2,'wild-underwater',.8);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(a);}expect(stage.actors.length).toBe(3);expect(stage.punks.length).toBe(12);expect(stage.rotors.length).toBe(4);expect(wildPose(154).head[1]).toBeLessThan(94);
 }finally{stage.dispose();model.dispose();}
});

test('rotating heads fit phones and desktop, the portrait stays inside its monitor and the windmill does not hide the singer',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new WildStage(model,track),shared=new Beams();
 const headPoints=(look:string,fn:(v:THREE.Vector3)=>void)=>{const a=stage.actors.find(a=>a.look===look)!;let count=0;a.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===a.hair.group||p===a.mask)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){fn(new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld));count++;}});return count;};
 try{for(const [w,h]of [[960,720],[375,430]])for(const [t,v,look]of [[37,'wild-robot','robot'],[54,'wild-screen','screen'],[93,'wild-singer','wheel'],[111,'wild-singer','wheel'],[141,'wild-singer','wheel'],[154,'wild-singer','wheel'],[186,'wild-singer','wheel'],[220,'wild-singer','wheel'],[245,'wild-singer','wheel']]as const){stage.resize(w,h);stage.frame(t,true,1,v,.8);let inside=true;expect(headPoints(look,p=>{p.project(stage.camera);inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;})).toBeGreaterThan(1000);expect(inside).toBe(true);for(const view of SCENE_SETTINGS.wildboys.cameras){const c=wildCamera(view,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
  stage.resize(960,720);stage.frame(54,true,1,'wild-screen',.8);let monitor=true;headPoints('screen',p=>monitor&&=Math.abs(p.x+650)<63&&p.y>256&&p.y<344);expect(monitor).toBe(true);const actor=stage.actors.find(a=>a.look==='wheel')!;
  for(const t of [93,111,141,154,186,220]){stage.frame(t,true,1,'wild-singer',.8);const face=actor.root.localToWorld(new THREE.Vector3(0,13,18)),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];for(const root of [stage.wheel,stage.factory])root.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===actor.root)return;p=p.parent;}const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9)blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);}
  for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
