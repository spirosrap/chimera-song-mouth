import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {stayPose,stayCamera} from '../src/scene/stay.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {StayStage}=await import('../src/ui/render/stay.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/shakespears-stay/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','answer'].map(name=>{const raw=gunzipSync(file(name+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:i?'siobhan' as const:'marcella' as const,track,model:new VoiceModel(track.body,track.sampleRate)}));
test('Stay contains the full supplied film, two contrasting voices and the complete ending',()=>{
 expect(movieScene('shakespears-stay')).toBeDefined();expect(scene.setting).toBe('stay');expect(scene.duration).toBeGreaterThan(238.2);expect(scene.duration).toBeLessThan(238.4);expect(scene.characters.map(c=>c.id)).toEqual(['marcella','siobhan']);expect(scene.cues.at(-1)!.end).toBeGreaterThan(226);expect(score.parts[0].melody!.notes.length).toBe(120);expect(score.parts[1].melody!.notes.length).toBe(62);expect(score.parts[0].body.female-score.parts[1].body.female).toBeGreaterThan(.5);expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);
 expect(sceneCamera(scene,50,'auto')).toBe('marcella');expect(sceneCamera(scene,150,'auto')).toBe('stay-tunnel');expect(sceneCamera(scene,228,'auto')).toBe('stay-embrace');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'beast-mirror'}]})).toThrow('camera');
});
test('both voices contain audible physical phrases and exact finite source-clock telemetry',()=>{
 expect(score.parts[2].recordingType).toBe('instrumental');
 for(const [i,p]of score.parts.slice(0,2).entries()){
  expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(validPerformance(p.performance!,score.duration)).toBe(true);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);
  for(const ph of p.performance!.phrases){const end=ph.start+ph.phones.reduce((s,x)=>s+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
  for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<10)expect(t.outRms).toBeLessThan(.00001);}
 }
});
test('the dark entrance, sheet struggle, patient revival and embrace restore after backward seeks',()=>{
 expect(stayPose(NaN)).toEqual(stayPose(0));const people=cast(),stage=new StayStage(people);
 try{for(const t of [5,16,50,132,150,183,199,209,228]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const snapshot=()=>[...stage.actors.flatMap(a=>[...a.root.matrixWorld.elements,Number(a.root.visible)]),...stage.patient.matrixWorld.elements,...stage.earth.matrixWorld.elements,...stage.sheet.geometry.getAttribute('position').array,Number(stage.room.visible),Number(stage.tunnel.visible)],before=snapshot();expect(stage.room.visible).toBe(!stage.tunnel.visible);if(t===132)expect(stage.actors[1].root.visible).toBe(true);if(t===228){expect(stage.patient.rotation.z).toBe(0);expect(stage.patient.position.y).toBeGreaterThan(130);}stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++)expect([a.getX(j),a.getY(j),a.getZ(j)].every(Number.isFinite)).toBe(true);});stage.frame(2,true,2,'stay-earth',0);stage.frame(t,false,3,view,0);expect(snapshot()).toEqual(before);}}
 finally{stage.dispose();people.forEach(a=>a.model.dispose());}
});
test('both moving singers remain framed in portrait and landscape and their leased models survive disposal',()=>{
 const people=cast(),stage=new StayStage(people);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [16,50,132,199,228])for(const [i,view]of ['marcella','siobhan'].entries()){
  stage.resize(w,h);stage.frame(time,true,1,view as CameraView,.8);let count=0,inside=true;stage.actors[i].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
  for(const camera of SCENE_SETTINGS.stay.cameras){const c=stayCamera(camera,w/h,time);expect([...c.target,...c.position,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();people.forEach(a=>a.model.dispose());}
});
