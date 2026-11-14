import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {wutheringPose,wutheringCamera} from '../src/scene/wuthering-heights.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {WutheringStage}=await import('../src/ui/render/wuthering-heights.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/wuthering-heights/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz'));const track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Wuthering Heights retains the entire red-dress video and long instrumental dance ending',()=>{
 expect(movieScene('wuthering-heights')).toBeDefined();expect(scene.setting).toBe('wuthering');expect(scene.duration).toBeGreaterThan(270.4);expect(scene.duration).toBeLessThan(270.7);expect(scene.characters.map(c=>c.id)).toEqual(['kate']);expect(scene.cues.at(-1)!.end).toBeGreaterThan(197);expect(scene.cues.at(-1)!.end).toBeLessThan(202);expect(score.parts[0].melody!.notes.length).toBe(314);expect(score.parts[1].recordingType).toBe('instrumental');expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(sceneCamera(scene,22,'auto')).toBe('kate');expect(sceneCamera(scene,223,'auto')).toBe('wuthering-outro');expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'stay-earth'}]})).toThrow('camera');
});
test('the approved physical voice has complete audible phrases and remains silent during the long guitar outro',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((s,x)=>s+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<5||j/20>202)expect(t.outRms).toBeLessThan(.00001);}
});
test('dress, sleeves, spins, hands and receding dance restore from source time after a backward seek',()=>{
 expect(wutheringPose(NaN)).toEqual(wutheringPose(0));expect([...wutheringPose(270).root,...wutheringPose(270).wrists.flat()].every(Number.isFinite)).toBe(true);const model=new VoiceModel(track.body,track.sampleRate),stage=new WutheringStage(model,track);
 try{for(const t of [3,22,29,39,61,79,97,133,196,223,260,270]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const snapshot=()=>[...stage.singer.matrixWorld.elements,...stage.dress.geometry.getAttribute('position').array,...stage.sleeves.flatMap(s=>Array.from(s.geometry.getAttribute('position').array))],before=snapshot();expect(before.every(Number.isFinite)).toBe(true);expect(stage.trees.children.length).toBeGreaterThan(60);if(t===260)expect(stage.singer.position.z).toBeLessThan(-350);stage.frame(2,true,2,'wuthering-grove',0);stage.frame(t,false,3,view,0);expect(snapshot()).toEqual(before);}expect(wutheringPose(39).turn).not.toBe(wutheringPose(29).turn);expect(wutheringPose(22).wrists).not.toEqual(wutheringPose(61).wrists);}
 finally{stage.dispose();model.dispose();}
});
test('the moving physical head stays framed in portrait and cinema views and retains its borrowed model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new WutheringStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [22,39,79,133,196,260])for(const view of ['kate','wuthering-profile','wuthering-hands']as CameraView[]){stage.resize(w,h);stage.frame(time,true,1,view,.8);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===stage.hair.group||parent===stage.jewellery.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.wuthering.cameras){const c=wutheringCamera(v,w/h,time);expect([...c.target,...c.position,c.fov].every(Number.isFinite)).toBe(true);}}
 }finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
