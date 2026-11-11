import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {cosmosPose,cosmosCamera,tesseractGeometry} from '../src/scene/cosmos.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {CosmosStudy}=await import('../src/ui/render/cosmos.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const {clearPhrases,CLEAR_SPEECH_TIGHT}=await import('../src/scene/clarity.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/sagan-dimensions/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('sagan.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('the Sagan scene retains the full supplied explanation, single narrator and source camera cuts',()=>{
 expect(movieScene('sagan-dimensions')).toBeDefined();expect(scene.setting).toBe('cosmos');
 expect(scene.duration).toBeGreaterThan(443.5);expect(scene.duration).toBeLessThan(443.7);
 expect(scene.characters.map(c=>c.id)).toEqual(['sagan']);expect(score.lines.flatMap(l=>l.words)).toHaveLength(949);
 expect(scene.cues).toHaveLength(score.lines.length);expect(scene.shots).toHaveLength(16);
 for(const phrase of ['astronomers','Flatland','apple','fourth','tesseract'])expect(scene.cues.some(c=>c.text.includes(phrase))).toBe(true);
 expect(scene.cues.at(-1)!.end).toBeGreaterThan(443);expect(scene.cues.at(-1)!.text).toEndWith('truly');
 expect(()=>validateScene({...scene,characters:[]})).toThrow();
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'bush'}]})).toThrow();
 expect(()=>validateScene({...scene,shots:[{time:0,view:'ward-group'}]})).toThrow('camera');
 expect(sceneCamera(scene,44,'auto')).toBe('flatland');expect(sceneCamera(scene,175,'auto')).toBe('sagan');expect(sceneCamera(scene,420,'auto')).toBe('dimension-model');
 expect(sceneCamera(scene,420,'wide')).toBe('wide');expect(sceneCue(scene,1)).toBeUndefined();
});

test('the whole narration uses physical articulations with audible phrases and a full-clock track',()=>{
 const part=score.parts[0],plan=planDialoguePart(score,'sagan');expect(score.parts).toHaveLength(1);
 expect(part.kind).toBe('voice');expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();
 expect(plan.length).toBeGreaterThan(5000);expect(plan.length).toBeLessThan(16000);
 expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(part.body.female,6);
 for(const line of score.lines){
  expect(clearPhrases([{segments:line.segments}],part.body,CLEAR_SPEECH_TIGHT)[0].segments).toEqual(line.segments);
  expect(line.segments.filter(s=>s.wordEnd)).toHaveLength(line.words.length);
  let peak=0;for(let i=track.indexAt(line.start);i<=track.indexAt(line.end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.001);
 }
 for(let i=0;i<40;i++){expect(track.message(i).t.outRms).toBeLessThan(.00001);expect(track.message(i).t.gate).toBeLessThan(.01);}
 for(let i=0;i<track.frames;i++)expect(track.message(i).t.clock).toBeCloseTo(i/20,4);
 for(let i=0;i<score.lines.length-1;i++)expect(score.lines[i].end).toBeLessThanOrEqual(score.lines[i+1].start-.10);
});

test('the tesseract is a finite projection of a four-dimensional cube with four edges at every vertex',()=>{
 for(const a of [0,.2,.8,1.4,2.7,4,5.9]){
  const g=tesseractGeometry(a);expect(g.vertices).toHaveLength(16);expect(g.edges).toHaveLength(32);
  expect(g.vertices.flat().every(Number.isFinite)).toBe(true);
  const degree=Array(16).fill(0),seen=new Set<string>();
  for(const [x,y] of g.edges){const bit=x^y;expect((bit&(bit-1))===0).toBe(true);degree[x]++;degree[y]++;seen.add(`${x}:${y}`);}
  expect(degree).toEqual(Array(16).fill(4));expect(seen.size).toBe(32);
 }
 expect(tesseractGeometry(0).vertices).not.toEqual(tesseractGeometry(.8).vertices);
});

test('dimensional demonstrations occur in their narrated order and have finite camera poses',()=>{
 expect(cosmosPose(45).squareMove).not.toBe(0);expect(cosmosPose(90).apple).toBe(1);
 expect(cosmosPose(166).appleContact).toBe(1);expect(cosmosPose(190).appleSlice).toBe(1);
 expect(cosmosPose(240).lift).toBe(1);expect(cosmosPose(270).lift).toBe(0);expect(cosmosPose(270).reunion).toBe(1);
 expect(cosmosPose(330).cube).toBe(1);expect(cosmosPose(413).cube).toBe(0);expect(cosmosPose(413).tesseract).toBe(1);
 expect(cosmosPose(NaN)).toEqual(cosmosPose(0));
 for(const v of ['wide','sagan','flatland','dimension-model'] as CameraView[])for(const a of [16/9,.87]){const c=cosmosCamera(v,a);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
});

test('presenter and important demonstrations fit desktop and mobile cameras with the actual mouth state',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new CosmosStudy(model,track),update=spyOn(stage.head,'update');
 try{
  for(const [w,h] of [[1280,720],[375,211],[375,430]])for(const [view,t] of [['wide',8],['sagan',116],['flatland',44],['dimension-model',413]] as [CameraView,number][]){
   stage.resize(w,h);stage.frame(t,true,1,view,.6,'sagan');expect(update.mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(track.message(track.indexAt(t)).t.artic));
   const points:P[]=[];
   if(view==='wide'||view==='sagan')stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)points.push(new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).toArray() as P);});
   else if(view==='flatland')points.push([-80,59,30],[65,59,120]);
   else points.push(...tesseractGeometry(cosmosPose(t).tesseractTurn).vertices.map(v=>[v[0]*7.5,v[1]*7.5+77,v[2]*7.5+36] as P));
   expect(points.length).toBeGreaterThan(1);for(const p of points){const v=new THREE.Vector3(...p).project(stage.camera);expect(Math.abs(v.x)).toBeLessThan(.99);expect(Math.abs(v.y)).toBeLessThan(.99);expect(v.z).toBeLessThan(1);expect(v.z).toBeGreaterThan(-1);}
  }
 }finally{update.mockRestore();stage.dispose();model.dispose();}
});
type P=[number,number,number];

test('props and hands retain their positions through pause and backwards seek; the mounted model remains owned by its caller',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new CosmosStudy(model,track);
 const snapshot=()=>{const out:number[]=[...stage.actor.matrixWorld.elements,...stage.head.scene.matrixWorld.elements];for(const b of [stage.arms,stage.flatland,stage.props])b.group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{for(const t of [8,44,145,189,240,332,413]){stage.frame(t,true,1,'wide',0);const a=snapshot();stage.frame(t,false,1,'wide',0);expect(snapshot()).toEqual(a);stage.frame(443,true,2,'wide',0);stage.frame(t,true,3,'wide',0);expect(snapshot()).toEqual(a);}}
 finally{let count=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){count++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(model,'dispose');stage.dispose();expect(dispose).not.toHaveBeenCalled();dispose.mockRestore();expect(released).toBe(count);expect(stage.hair.group.parent).toBeNull();model.dispose();}
});
