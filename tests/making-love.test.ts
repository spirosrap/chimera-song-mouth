import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {MOVIE_SCENES,movieScene} from '../src/scene/library.ts';
import {validateScene,sceneCamera,type SceneFile} from '../src/scene/scene.ts';
import {validPerformance} from '../src/band/performance.ts';
import {airPose,airPlace,airCamera} from '../src/scene/making-love.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {AirSupplyStage}=await import('../src/ui/render/making-love.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/making-love/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
function track(name:string){const b=gunzipSync(file(name+'.tele.gz'));return new TeleTrack(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}

test('Air Supply appends the complete video, duet, source settings and ending',()=>{
 const index=MOVIE_SCENES.findIndex(s=>s.id==='making-love');expect(index).toBeGreaterThan(0);expect(MOVIE_SCENES[index-1]!.id).toBe('anything-for-love');
 expect(scene.setting).toBe('airsupply');expect(scene.duration).toBeGreaterThan(293);expect(scene.duration).toBeLessThan(294);
 expect(scene.characters.map(c=>c.id)).toEqual(['air-singer','air-guitarist']);expect(score.parts.map(p=>p.id)).toEqual(['lead','answer','backing']);
 expect(scene.cues.at(-1)!.end).toBeGreaterThan(290);expect(scene.shots.at(-1)!.view).toBe('air-silhouette');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'beast-mirror'}]})).toThrow();
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();
 expect(file('mix.mp3').length).toBeGreaterThan(9_000_000);
});

test('both complete singers use physical phones and independent overlapping calls',()=>{
 for(const part of score.parts.slice(0,2)){
  expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(part.performance!.lyrics).toBe(part.melody!.lyrics);
  expect(part.voice!.drift).toBe(0);expect(part.effects).toBeUndefined();const g=planPart(part);
  expect(g.length).toBeGreaterThan(1000);expect(g.every(x=>Number.isFinite(x.t0)&&x.t1>=x.t0&&x.t1<scene.duration)).toBe(true);
  expect(part.performance!.phrases.flatMap(p=>p.phones).some(p=>['p','t','k','b','d','g'].includes(p.ipa))).toBe(true);
 }
 expect(score.parts[0].melody!.notes.length).toBeGreaterThan(450);expect(score.parts[1].melody!.notes.length).toBeGreaterThan(140);
 expect(score.parts[1].performance!.phrases.every(p=>p.start>105)).toBe(true);
 const end=(p:{start:number;phones:{duration:number}[]})=>p.start+p.phones.reduce((s,x)=>s+x.duration,0);
 expect(score.parts[0].performance!.phrases.some(a=>score.parts[1].performance!.phrases.some(b=>a.start<end(b)&&b.start<end(a)))).toBe(true);
 expect(score.parts[2].kind).toBe('backing');expect(score.parts[2].recordingType).toBe('instrumental');expect(score.parts[2].performance).toBeUndefined();
});

test('two full recorded mouths preserve the audio clock, the opening and the source fade',()=>{
 for(const name of ['lead','answer']){const t=track(name);expect(Math.abs(t.duration-scene.duration)).toBeLessThan(.051);expect(t.message(t.indexAt(3)).t.gate).toBeLessThan(.01);
  for(const time of [117,124,242.3,268])expect(t.message(t.indexAt(time)).t.outRms).toBeGreaterThan(.001);
  for(const time of [0,40,142,250])expect(t.message(t.indexAt(time)).t.clock).toBeCloseTo(Math.floor(time*20)/20,4);
 }
 expect(track('answer').message(track('answer').indexAt(30)).t.gate).toBeLessThan(.01);
 expect(sceneCamera(scene,289,'auto')).toBe('air-silhouette');
});

test('the car, diner, band and silhouettes restore on seek and borrow their voice models',()=>{
 const cast=(['lead','answer']as const).map((name,i)=>{const t=track(name);return{id:i?'air-guitarist'as const:'air-singer'as const,track:t,model:new VoiceModel(t.body,t.sampleRate)}}),stage=new AirSupplyStage(cast),drop=cast.map(c=>spyOn(c.model,'dispose'));
 try{
  for(const [time,place]of [[22,'street'],[74,'meadow'],[98,'car'],[134,'gas'],[150,'stage'],[232,'diner'],[289,'silhouette']]as const){
   stage.frame(time,true,1,'wide',.8);expect(stage.rooms[place].visible).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible)).toHaveLength(1);
   const position=stage.car.position.clone(),door=stage.carDoor.rotation.y;stage.frame(100,true,2,'wide',.5);stage.frame(time,false,3,'wide',.8);expect(stage.car.position).toEqual(position);expect(stage.carDoor.rotation.y).toBe(door);expect(airPose(time)).toEqual(airPose(time));
  }
  for(const [w,h]of [[1280,720],[375,430]])for(const view of ['air-singer','air-guitarist']as const){
   stage.resize(w,h);stage.frame(150,true,4,view,.9);const head=view==='air-singer'?stage.head:stage.guitarHead,model=cast[view==='air-singer'?0:1].model;
   for(const p of [new THREE.Vector3(0,27,0),new THREE.Vector3(14,0,0),new THREE.Vector3(0,-7,0)]){const v=p.multiplyScalar(model.tract.scale).applyMatrix4(head.scene.matrixWorld).project(stage.camera);expect(Math.abs(v.x)).toBeLessThan(.98);expect(Math.abs(v.y)).toBeLessThan(.98);}
   expect(airPlace(view,232)).toBe('stage');expect(airCamera(view,w/h,232).position.every(Number.isFinite)).toBe(true);
  }
  stage.dispose();for(const s of drop)expect(s).not.toHaveBeenCalled();expect(stage.hair.group.parent).toBeNull();expect(stage.guitarHair.group.parent).toBeNull();
 }finally{drop.forEach(s=>s.mockRestore());cast.forEach(c=>c.model.dispose());}
});
