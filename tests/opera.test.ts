import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,SCENE_SETTINGS,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {operaPose,operaCamera} from '../src/scene/opera.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {OperaStage}=await import('../src/ui/render/opera.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/nessun-dorma/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const performance:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['tenor','chorus'].map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});

test('the full opera concert has separate tenor and choir, including its extended finale',()=>{
 expect(movieScene('nessun-dorma')).toBeDefined();expect(scene.setting).toBe('opera');
 expect(scene.duration).toBeGreaterThan(271);expect(scene.duration).toBeLessThan(272);
 expect(scene.characters.map(c=>c.id)).toEqual(['opera-tenor','opera-chorus']);
 expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(file('backing.mp3').length).toBeGreaterThan(8_000_000);
 expect(performance.parts.at(-1)?.recordingType).toBe('instrumental');
 expect(sceneCue(scene,6)?.text).toBe('Nessun dorma,');expect(sceneCue(scene,116)?.speaker).toBe('opera-chorus');
 expect(sceneCue(scene,174)?.text).toContain('Eternità');expect(sceneCue(scene,219)?.text).toBe('Gloria a te!');
 for(const t of [0,3,91,230,267])expect(sceneCue(scene,t)).toBeUndefined();
 expect(sceneCamera(scene,118,'auto')).toBe('opera-choir');expect(sceneCamera(scene,219,'auto')).toBe('opera-tenor');
 expect(sceneCamera(scene,250,'auto')).toBe('wide');
 expect(()=>validateScene({...scene,setting:'karaoke'})).toThrow('character');
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();
 expect(()=>validateScene({...scene,shots:[{time:0,view:'sagan'}]})).toThrow('camera');
});

test('Italian phrases use physical articulations and both tracks share the audio clock',()=>{
 for(const [i,part] of performance.parts.filter(p=>p.kind==='voice').entries()){
  expect(validPerformance(part.performance!,performance.duration)).toBe(true);
  const gestures=planPart(part);expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);
  expect(gestures.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  expect(tracks[i].duration).toBeCloseTo(scene.duration,1);
  for(const t of [0,2,230,269])expect(tracks[i].message(tracks[i].indexAt(t)).t.gate).toBeLessThan(.01);
 }
 const phones=performance.parts[0].performance!.phrases.flatMap(p=>p.phones);
 for(const ipa of ['r','ʎ','ts','tʃ','ɔ','ɛ'])expect(phones.some(p=>p.ipa===ipa)).toBe(true);
 expect(phones.some((p,i)=>p.ipa==='s'&&phones[i+1]?.ipa==='s')).toBe(true);
 expect(phones.every(p=>p.ipa!=='ɹ'&&p.ipa!=='oʊ')).toBe(true);
 for(const t of [6,21,52,77,98,152,163,190,218])expect(tracks[0].message(tracks[0].indexAt(t)).t.outRms).toBeGreaterThan(.0001);
 for(const t of [116,125,175,181])expect(tracks[1].message(tracks[1].indexAt(t)).t.outRms).toBeGreaterThan(.0001);
 for(const t of [20,70,150,200])expect(tracks[1].message(tracks[1].indexAt(t)).t.gate).toBeLessThan(.01);
 // The first finale 'te' is G4, not the spurious second-harmonic G5.
 expect(performance.parts[0].performance!.contour.filter(c=>c.time>209.9&&c.time<210.5).every(c=>c.hz>360&&c.hz<430)).toBe(true);
});

test('opera staging keeps the tenor framed and motion seek-safe without extra physical model leases',()=>{
 const model=new VoiceModel(tracks[0].body,tracks[0].sampleRate),stage=new OperaStage(model,tracks[0],tracks[1]),update=spyOn(stage.head,'update');
 const motion=()=>{
  const out:number[]=[];
  for(const group of [stage.hands.group,stage.conductor.group,stage.choir.group,stage.audience.group])group.traverseVisible(o=>{
   const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');
   if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));
  });return out;
 };
 try{
  for(const [w,h] of [[1280,720],[375,211],[375,430]])for(const view of SCENE_SETTINGS.opera.cameras){
   stage.resize(w,h);stage.frame(120,true,1,view,.6,'opera-chorus');
   const cam=operaCamera(view,w/h,120);expect([...cam.position,...cam.target,cam.fov].every(Number.isFinite)).toBe(true);
   if(view==='wide'||view==='opera-tenor'){
    let count=0,framed=true;
    stage.head.scene.traverseVisible(o=>{
     const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(!a)return;
     for(let i=0;i<m.geometry.instanceCount;i++){
      const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;
      framed&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&v.z<1;
     }
    });expect(count).toBeGreaterThan(1000);expect(framed).toBe(true);
   }
  }
  for(const t of [6,120,164,219,225,265,0]){
   stage.frame(t,true,2,'wide',.6);const before=motion();
   expect(update.mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(tracks[0].message(tracks[0].indexAt(t)).t.artic));
   stage.frame(t,false,2,'wide',0);expect(motion()).toEqual(before);
   stage.frame(270,true,3,'wide',0);stage.frame(t,true,4,'wide',0);expect(motion()).toEqual(before);
  }
  expect(operaPose(120).applause).toBe(0);expect(operaPose(240).applause).toBe(1);expect(operaPose(240).playing).toBe(0);
  expect(operaPose(NaN)).toEqual(operaPose(0));
 }finally{
  update.mockRestore();let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const disposal=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(disposal).toHaveBeenCalledTimes(0);disposal.mockRestore();model.dispose();
  expect(released).toBe(meshes);expect(stage.hair.group.parent).toBeNull();
 }
});
