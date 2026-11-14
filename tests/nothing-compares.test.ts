import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {nothingPose,nothingView,nothingCamera} from '../src/scene/nothing-compares.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {NothingStage}=await import('../src/ui/render/nothing-compares.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/nothing-compares/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Nothing Compares retains the complete supplied video and long garden outro after the final singing',()=>{
 expect(movieScene('nothing-compares')).toBeDefined();expect(scene.setting).toBe('nothing');expect(scene.duration).toBeGreaterThan(308.4);expect(scene.duration).toBeLessThan(308.7);expect(scene.characters.map(c=>c.id)).toEqual(['sinead']);expect(score.parts[0].melody!.notes.length).toBe(273);expect(scene.cues[0].start).toBeGreaterThan(7);expect(scene.cues.at(-1)!.end).toBeGreaterThan(264);expect(scene.cues.at(-1)!.end).toBeLessThan(267);expect(scene.cues.every(c=>c.text.length<100)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');expect(file('mix.mp3').length).toBeGreaterThan(9_000_000);expect(sceneCamera(scene,18,'auto')).toBe('sinead');expect(sceneCamera(scene,295,'auto')).toBe('nothing-ending');expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'falco'}]})).toThrow('camera');
});
test('the physical voice has audible complete phrases, exact telemetry time and a silent instrumental outro',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((s,x)=>s+x.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<5||j/20>268)expect(t.outRms).toBeLessThan(.00001);}
});
test('portrait, double exposure, garden walk and tears restore after seeking without cumulative darkening',()=>{
 expect(nothingPose(NaN)).toEqual(nothingPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new NothingStage(model,track);const snapshot=()=>{const rows:number[]=[];stage.garden.traverse(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceColorStart');if(a&&m.geometry.instanceCount)rows.push(a.getX(0),a.getY(0),a.getZ(0));});return [...rows,...stage.figures.flatMap(f=>[...f.root.matrixWorld.elements,...f.head.scene.matrixWorld.elements])];};
 try{for(const t of [3,8,18,55,85,145,160,175,186,205,236,260,285,299]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snapshot();expect(before.every(Number.isFinite)).toBe(true);stage.frame(105,true,2,'sinead',.8);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(before);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(before);}const tearCount=()=>stage.figures[0].tears.group.children.reduce((n,o)=>n+(o as THREE.Mesh<THREE.InstancedBufferGeometry>).geometry.instanceCount,0);stage.frame(100,true,1,'sinead',.8);expect(tearCount()).toBe(0);stage.frame(236,true,2,'nothing-tears',.8);expect(tearCount()).toBeGreaterThan(20);stage.frame(100,false,3,'sinead',.8);expect(tearCount()).toBe(0);expect(nothingView('sinead',175)).toEqual({portrait:1,garden:0,walker:0});expect(nothingView('nothing-dissolve',55).portrait).toBeGreaterThan(0);expect(nothingPose(185).walker).toBeGreaterThan(.8);expect(nothingView('nothing-dissolve',48).garden).toBeLessThan(nothingView('nothing-dissolve',54).garden);expect(nothingView('nothing-dissolve',48).portrait).toBeGreaterThan(nothingView('nothing-dissolve',54).portrait);}
 finally{stage.dispose();model.dispose();}
});
test('the source-facing portrait stays framed on desktop and mobile and both heads borrow one model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new NothingStage(model,track);
 try{expect(stage.figures.length).toBe(2);expect(stage.model).toBe(model);for(const [w,h]of [[1280,720],[375,430]])for(const time of [18,28,85,145,236,260,300]){stage.resize(w,h);stage.frame(time,true,1,'sinead',.8);const f=stage.figures[0];let count=0,inside=true;f.head.scene.traverseVisible(o=>{let parent:THREE.Object3D|null=o;while(parent){if(parent===f.hair.group||parent===f.tears.group)return;parent=parent.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);for(const v of SCENE_SETTINGS.nothing.cameras){const c=nothingCamera(v,w/h,time);expect([...c.target,...c.position,c.portraitDistance].every(Number.isFinite)).toBe(true);}}
 }finally{const disposed=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposed).toHaveBeenCalledTimes(0);disposed.mockRestore();model.dispose();}
});
