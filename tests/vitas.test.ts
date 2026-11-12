import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {vitasPose,vitasCamera} from '../src/scene/vitas.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {VitasStage}=await import('../src/ui/render/vitas.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/vitas-7th-element/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
const rolls=[38.62,46.12,53.67,61.18,128.62,136.12,143.67,151.18];

test('the full Vitas performance retains the silver stage, Russian phrases and instrumental ending',()=>{
 expect(movieScene('vitas-7th-element')).toBeDefined();expect(scene.setting).toBe('disco');expect(scene.duration).toBeCloseTo(249.639456,4);
 expect(scene.characters.map(c=>c.id)).toEqual(['vitas']);expect(scene.cues.some(c=>c.text.includes('Я пришёл'))).toBe(true);expect(scene.cues.at(-1)!.end).toBeCloseTo(232.4,1);
 expect(sceneCamera(scene,14,'auto')).toBe('vitas');expect(sceneCamera(scene,165,'auto')).toBe('vitas-dancers');expect(sceneCamera(scene,245,'auto')).toBe('vitas-performer');
 expect(file('mix.mp3').length).toBeGreaterThan(7_500_000);expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'mansion-mirror'}]})).toThrow('camera');
});
test('both rolling choruses are physical lateral movements with continuing sound, never missing rests',()=>{
 const p=score.parts[0];expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(planPart(p).length).toBeLessThan(16000);expect(score.parts[1].recordingType).toBe('instrumental');
 for(const start of rolls){const ph=p.performance!.phrases.find(ph=>Math.abs(ph.start-start)<.001)!;expect(ph).toBeDefined();expect(ph.phones.filter(x=>x.ipa==='l').length).toBeGreaterThan(30);expect(ph.phones.every(x=>x.ipa==='l'||x.ipa==='a')).toBe(true);
  const end=start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let sum=0,count=0;for(let i=track.indexAt(start+.1);i<track.indexAt(end-.1);i++){sum+=track.message(i).t.outRms;count++;}expect(sum/count).toBeGreaterThan(.04);
 }
 for(const ph of p.performance!.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(p.performance!.phrases.at(-1)!.start).toBeGreaterThan(227);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20>234)expect(t.outRms).toBeLessThan(.00001);}
});
test('the silver costume gestures, lights and crowd restore after backward seeks',()=>{
 expect(vitasPose(NaN)).toEqual(vitasPose(0));expect(vitasPose(70).raise).toBeGreaterThan(.9);expect(vitasPose(85).spread).toBeGreaterThan(.9);expect(vitasPose(249.3).fade).toBe(0);
 for(const aspect of [16/9,375/430])for(const view of SCENE_SETTINGS.disco.cameras){const c=vitasCamera(view,aspect,150);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 const model=new VoiceModel(track.body,track.sampleRate),stage=new VitasStage(model,track);
 try{for(const time of [5,39,70,85,135,185,220,245]){
  stage.frame(time,true,1,'wide',.7);const before=[...stage.singer.matrixWorld.elements,...stage.discs.map(d=>d.material.opacity)];
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a){expect(Number.isFinite(m.geometry.instanceCount)).toBe(true);expect(m.geometry.instanceCount).toBeLessThanOrEqual(a.count);for(let i=0;i<m.geometry.instanceCount;i++)expect([a.getX(i),a.getY(i),a.getZ(i)].every(Number.isFinite)).toBe(true);}});
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect([...stage.singer.matrixWorld.elements,...stage.discs.map(d=>d.material.opacity)]).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('the physical head stays framed in portrait and landscape without freeing its borrowed model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new VitasStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [15,39,70,135,190]){
  stage.resize(w,h);stage.frame(time,true,1,'vitas',.7);let count=0,inside=true;
  stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
