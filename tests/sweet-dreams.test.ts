import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {dreamPose,dreamCamera} from '../src/scene/sweet-dreams.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {DreamsStage}=await import('../src/ui/render/sweet-dreams.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/sweet-dreams/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('Sweet Dreams retains the entire recording, head-up section, four wordless passages and the fading incomplete repetition',()=>{
 expect(movieScene('sweet-dreams')).toBeDefined();expect(scene.setting).toBe('dreams');expect(scene.duration).toBeGreaterThan(214.3);expect(scene.duration).toBeLessThan(214.5);expect(scene.characters.map(c=>c.id)).toEqual(['annie']);expect(score.parts[0].melody!.notes.length).toBe(355);expect(scene.cues.length).toBe(49);expect(scene.cues.filter(c=>c.text==='[Wordless call]').length).toBe(4);expect(scene.cues.some(c=>c.text.includes('Hold your head up'))).toBe(true);expect(scene.cues.at(-1)!.text).toBe('Sweet dreams are made of');expect(scene.cues.at(-1)!.end).toBeGreaterThan(213);expect(score.parts[1].recordingType).toBe('instrumental');
 for(const [t,view]of [[12,'dreams-singer'],[38,'dreams-keys'],[82,'dreams-blindfold'],[113,'dreams-table'],[125,'dreams-kiss'],[138,'dreams-pasture'],[176,'dreams-field-strings'],[183,'dreams-boat'],[196,'dreams-cassette'],[208,'dreams-ending']]as const)expect(sceneCamera(scene,t,'auto')).toBe(view);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'bjork'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'behaviour-bear'}]})).toThrow('camera');
});

test('the physical engine performs the complete words and calls through the audio-only source tail with finite exact-clock articulation',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(part.performance!.phrases.length).toBe(29);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const phrase of part.performance!.phrases){const end=phrase.start+phrase.phones.reduce((s,p)=>s+p.duration,0);let peak=0;for(let j=track.indexAt(phrase.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 let late=0;for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<6.5||j/20>214.3)expect(t.outRms).toBeLessThan(.00001);if(j/20>211&&j/20<213.5)late=Math.max(late,t.outRms);}expect(late).toBeGreaterThan(.0001);
});

test('the boardroom, monitor, gloves, cows, strings, boat, bed and cassette restore on direct backward seeks',()=>{
 expect(dreamPose(NaN)).toEqual(dreamPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new DreamsStage(model,track);
 const snapshot=()=>[stage.board.visible,stage.records.visible,stage.strings.visible,stage.field.visible,stage.fieldDesk.visible,stage.boat.visible,stage.bedroom.visible,stage.globe.visible,...stage.globe.matrixWorld.elements,...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.hands.flatMap(h=>[h.visible,...h.matrixWorld.elements])]),...stage.cows.flatMap(c=>[...c.root.matrixWorld.elements,...c.head.matrixWorld.elements,...c.legs.flatMap(l=>l.matrixWorld.elements),...c.tail.matrixWorld.elements]),...stage.daves.flatMap(d=>[d.root.visible,...d.root.children.map(o=>o.visible),...d.arms.flatMap(a=>a.matrixWorld.elements)]),...stage.keys.map(k=>k.position.y),...stage.rowboat.matrixWorld.elements,...stage.pressHand.matrixWorld.elements,...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{for(const t of [6,12,18,26,33,38,45,50,56,75,82,88,94,100,113,125,138,145,160,171,176,183,192,196,208]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snapshot();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(113,true,2,'dreams-table',.8);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(before);}expect(stage.actors.length).toBe(5);expect(stage.cows.length).toBe(7);expect(stage.keys.length).toBe(33);expect(stage.fieldKeys.length).toBe(33);expect(stage.cellos.length).toBe(5);expect(stage.daves.length).toBe(7);stage.frame(125,true,1,'dreams-kiss',.8);expect(stage.globe.visible).toBe(false);expect(stage.actors.find(a=>a.look==='board')!.root.visible).toBe(false);
 }finally{stage.dispose();model.dispose();}
});

test('the singer and gloves fit phones, the TV head stays inside its monitor, cello necks clear the face and shared model ownership is retained',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new DreamsStage(model,track),shared=new Beams();
 const headPoints=(look:string,fn:(v:THREE.Vector3)=>void)=>{const a=stage.actors.find(a=>a.look===look)!;let count=0;a.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===a.hair.group||p===a.mask)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){fn(new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld));count++;}});return count;};
 try{for(const [w,h]of [[960,720],[375,430]])for(const [t,view,look]of [[12,'dreams-singer','board'],[56,'dreams-records','board'],[82,'dreams-blindfold','strings'],[145,'dreams-outdoor','field'],[192,'dreams-bed','bed']]as const){stage.resize(w,h);stage.frame(t,true,1,view,.8);let inside=true;expect(headPoints(look,v=>{v.project(stage.camera);inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.max(Math.abs(v.x),Math.abs(v.y))<.99&&Math.abs(v.z)<1;})).toBeGreaterThan(1000);expect(inside).toBe(true);if(t===56)for(const hand of stage.actors[0].hands){const v=hand.getWorldPosition(new THREE.Vector3()).project(stage.camera);expect(Math.max(Math.abs(v.x),Math.abs(v.y))).toBeLessThan(.9);}for(const v of SCENE_SETTINGS.dreams.cameras){const c=dreamCamera(v,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
  stage.resize(960,720);stage.frame(38,true,1,'dreams-keys',.8);let inside=true;headPoints('screen',v=>inside&&=Math.abs(v.x-126)<30.5&&v.y>133&&v.y<170);expect(inside).toBe(true);expect(stage.actors.find(a=>a.look==='screen')!.root.children.filter(o=>(o as THREE.Mesh).isMesh&&o.visible).length).toBe(0);expect(stage.actors[0].root.visible).toBe(false);stage.frame(82,true,1,'dreams-blindfold',.8);const face=new THREE.Vector3(65,157,30),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face);ray.camera=stage.camera;const visible=(o:THREE.Object3D)=>{let p:THREE.Object3D|null=o;while(p){if(!p.visible)return false;p=p.parent;}return true;};expect(ray.intersectObjects(stage.cellos.filter(visible),true).some(h=>h.distance<distance-.1)).toBe(false);
  for(const child of shared.group.children){const m=(child as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
