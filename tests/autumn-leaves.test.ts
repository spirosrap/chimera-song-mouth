import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {autumnPose,autumnCamera} from '../src/scene/autumn-leaves.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {AutumnStage}=await import('../src/ui/render/autumn-leaves.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/autumn-leaves/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Autumn Leaves includes both verses and the complete final held note',()=>{
 expect(movieScene('autumn-leaves')).toBeDefined();expect(scene.duration).toBeGreaterThan(158.9);expect(scene.duration).toBeLessThan(159.5);expect(scene.setting).toBe('autumn');expect(scene.characters.map(c=>c.id)).toEqual(['cole']);
 expect(score.parts[0].performance!.lyrics.match(/falling leaves/gi)!.length).toBe(2);expect(scene.cues.at(-1)!.end).toBeGreaterThan(150);expect(sceneCamera(scene,5,'auto')).toBe('wide');expect(sceneCamera(scene,40,'auto')).toBe('cole');expect(sceneCamera(scene,155,'auto')).toBe('wide');
 expect(file('mix.mp3').length).toBeGreaterThan(5_000_000);expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'lifetime-water'}]})).toThrow('camera');
});
test('the full physical singer has audible phrases and synchronized finite telemetry',()=>{
 const p=score.parts[0],performance=p.performance!;expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(p.body).toEqual({female:0,child:0});expect(validPerformance(performance,score.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');expect(performance.lyrics.split(/\s+/).length).toBe(117);expect(p.melody!.notes.length).toBe(137);
 for(const ph of performance.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20>153)expect(t.outRms).toBeLessThan(.00001);}
});
test('all visible garden and airway geometry remains black and white after seeking',()=>{
 expect(autumnPose(NaN)).toEqual(autumnPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new AutumnStage(model,track);
 try{for(const time of [5,25,48,90,120,149,156]){
  stage.frame(time,true,1,'wide',.7);const before=[...stage.singer.matrixWorld.elements,...stage.head.scene.matrixWorld.elements];let colors=0;
  const background=stage.scene.background as THREE.Color;expect(background.r).toBe(background.g);expect(background.g).toBe(background.b);
  stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>;if(!m.geometry)return;const mat=m.material as THREE.MeshBasicMaterial;if(mat?.color){expect(mat.color.r).toBe(mat.color.g);expect(mat.color.g).toBe(mat.color.b);}for(const key of ['instanceColorStart','instanceColorEnd','color']){const a=m.geometry.getAttribute(key);if(!a)continue;const count=key.startsWith('instance')?Math.min(a.count,m.geometry.instanceCount):a.count;expect(Number.isFinite(count)).toBe(true);for(let i=0;i<count;i++){expect(a.getX(i)).toBe(a.getY(i));expect(a.getY(i)).toBe(a.getZ(i));colors++;}}});expect(colors).toBeGreaterThan(10000);
  stage.frame(2,true,2,'wide',0);stage.frame(time,false,3,'wide',0);expect([...stage.singer.matrixWorld.elements,...stage.head.scene.matrixWorld.elements]).toEqual(before);
 }}finally{stage.dispose();model.dispose();}
});
test('the monochrome stage keeps its borrowed model and frames the mouth in portrait and landscape',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new AutumnStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [5,36,60,100,149]){
  stage.resize(w,h);stage.frame(time,true,1,'cole',.7);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const view of SCENE_SETTINGS.autumn.cameras){const c=autumnCamera(view,w/h,time);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
