import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {lifetimePose,lifetimeCamera} from '../src/scene/once-in-a-lifetime.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {LifetimeStage}=await import('../src/ui/render/once-in-a-lifetime.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/once-in-a-lifetime/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Once in a Lifetime includes the full video and both spoken and sung passages',()=>{
 expect(movieScene('once-in-a-lifetime')).toBeDefined();expect(scene.duration).toBeCloseTo(225.0495,3);expect(scene.setting).toBe('lifetime');expect(scene.characters.map(c=>c.id)).toEqual(['lifetime-singer']);
 expect(scene.cues.some(c=>c.text.includes('shotgun shack'))).toBe(true);expect(scene.cues.map(c=>c.text).join(' ').match(/Same as it ever was/g)!.length).toBeGreaterThan(9);expect(scene.cues.some(c=>c.text.includes('Under the rocks'))).toBe(true);expect(scene.cues.at(-1)!.end).toBeGreaterThan(217);
 expect(sceneCamera(scene,12,'auto')).toBe('lifetime-water');expect(sceneCamera(scene,56,'auto')).toBe('lifetime-copies');expect(sceneCamera(scene,216,'auto')).toBe('lifetime-water');
 expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'henge-car'}]})).toThrow('camera');
});
test('physical phrases retain local source timing and finite sample-clock articulation',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:0,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(planPart(p).length).toBeLessThan(16000);expect(score.parts[1].recordingType).toBe('instrumental');
 expect(performance.lyrics.split(/\s+/).length).toBe(418);expect(p.melody!.notes.length).toBe(553);
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<27||i/20>220)expect(t.outRms).toBeLessThan(.00001);}
});
test('the choreography, copies and water restore after backward seeks',()=>{
 expect(lifetimePose(NaN)).toEqual(lifetimePose(0));expect(lifetimePose(12).water).toBe(true);expect(lifetimePose(56).copies).toBe(true);expect(lifetimePose(40).archive).toBe(true);expect(lifetimePose(209).shirt).toBe(true);expect(lifetimePose(224).fade).toBe(0);
 const model=new VoiceModel(track.body,track.sampleRate),stage=new LifetimeStage(model,track);
 try{for(const time of [12,34,40,56,64,96,127,180,209,216]){
  stage.frame(time,true,1,'wide',.7);const snapshot=()=>stage.figures.flatMap(f=>[...f.root.matrixWorld.elements,...f.body.matrixWorld.elements,Number(f.root.visible)]),before=snapshot();expect(stage.figures.filter(f=>f.root.visible).length).toBe(lifetimePose(time).copies?5:1);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(3,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect(snapshot()).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('five heads share a borrowed model and the foreground head stays framed',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new LifetimeStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [34,40,56,64,96,127,180,209]){
  stage.resize(w,h);stage.frame(time,true,1,'lifetime-singer',.7);let count=0,inside=true;
  stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.lifetime.cameras){const c=lifetimeCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
