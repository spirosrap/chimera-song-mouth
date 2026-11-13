import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {MOVIE_SCENES,movieScene} from '../src/scene/library.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {validPerformance} from '../src/band/performance.ts';
import {fadePose,fadePlace} from '../src/scene/fade-into-you.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {FadeStage}=await import('../src/ui/render/fade-into-you.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/fade-into-you/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
function track(){const b=gunzipSync(file('lead.tele.gz'));return new TeleTrack(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}

test('Mazzy Star appends the complete supplied edit with one physical singer and original music',()=>{
 const index=MOVIE_SCENES.findIndex(s=>s.id==='fade-into-you');expect(MOVIE_SCENES[index]!).toBe(movieScene('fade-into-you')!);expect(MOVIE_SCENES[index-1]!.id).toBe('making-love');
 expect(scene.setting).toBe('fade');expect(scene.duration).toBeGreaterThan(261.4);expect(scene.duration).toBeLessThan(261.6);
 expect(scene.characters.map(c=>c.id)).toEqual(['hope']);expect(score.parts.map(p=>p.id)).toEqual(['lead','backing']);
 expect(scene.cues.at(-1)!.end).toBeGreaterThan(243);expect(scene.cues.at(-1)!.end).toBeLessThan(251);expect(scene.shots.at(-1)!.view).toBe('fade-poles');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'air-stage'}]})).toThrow();expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);
});

test('the whole restrained lead uses real phones, measured pitch and instrumental rests',()=>{
 const p=score.parts[0];expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(p.performance!.lyrics).toBe(p.melody!.lyrics);expect(p.performance!.lyrics.toLowerCase()).toContain('fade into you');
 expect(p.melody!.notes.length).toBeGreaterThanOrEqual(140);expect(p.voice!.drift).toBe(0);expect(p.effects).toBeUndefined();
 expect(p.performance!.phrases.some(ph=>ph.start>130&&ph.start<163)).toBe(false);
 const g=planPart(p);expect(g.length).toBeGreaterThan(1000);expect(g.every(x=>Number.isFinite(x.t0)&&x.t1>=x.t0&&x.t1<scene.duration)).toBe(true);
 expect(score.parts[1].kind).toBe('backing');expect(score.parts[1].recordingType).toBe('instrumental');expect(score.parts[1].performance).toBeUndefined();
});

test('the complete physical telemetry preserves the shared audio clock, quiet opening and interlude',()=>{
 const t=track();expect(Math.abs(t.duration-scene.duration)).toBeLessThan(.051);expect(t.body.female).toBeCloseTo(.78,5);
 for(const time of [2,140,255])expect(t.message(t.indexAt(time)).t.gate).toBeLessThan(.01);
 for(const [a,b]of [[20,24],[94.6,98],[176,180],[240,245]])expect(Math.max(...Array.from({length:8},(_,i)=>t.message(t.indexAt(a+(b-a)*i/8)).t.outRms))).toBeGreaterThan(.001);
 for(const time of [0,40,142,240])expect(t.message(t.indexAt(time)).t.clock).toBeCloseTo(time,4);
 expect(sceneCamera(scene,259,'auto')).toBe('fade-poles');
});

test('the full video restores its locations and train at early seeks while retaining the borrowed model',()=>{
 const t=track(),model=new VoiceModel(t.body,t.sampleRate),stage=new FadeStage(model,t),drop=spyOn(model,'dispose');
 try{
  for(const [time,place]of [[30,'stage'],[75,'desert'],[60,'train'],[150,'car'],[42,'stairs'],[135,'poles']]as const){
   stage.frame(time,true,1,'wide',.4);expect(stage.rooms[place].visible).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible)).toHaveLength(1);
   const car=stage.car.position.clone(),train=stage.train.position.clone();stage.frame(200,true,2,'wide',.4);stage.frame(time,false,3,'wide',.4);expect(stage.car.position).toEqual(car);expect(stage.train.position).toEqual(train);
  }
  for(const time of [0,1,60,260]){stage.frame(time,true,4,'fade-train',.4);expect(stage.train.visible).toBe(true);expect(Math.abs(stage.train.position.x)).toBeLessThanOrEqual(350);}
  stage.frame(105,true,5,'wide',.4);expect(stage.glasses.visible).toBe(true);stage.frame(75,true,6,'wide',.4);expect(stage.glasses.visible).toBe(false);
  for(const [w,h]of [[1280,720],[375,430]]){stage.resize(w,h);stage.frame(100,true,7,'hope',.4);for(const p of [new THREE.Vector3(0,27,0),new THREE.Vector3(14,0,0),new THREE.Vector3(0,-7,0)]){const v=p.multiplyScalar(model.tract.scale).applyMatrix4(stage.head.scene.matrixWorld).project(stage.camera);expect(Math.abs(v.x)).toBeLessThan(.98);expect(Math.abs(v.y)).toBeLessThan(.98);}expect(fadePlace('hope',200)).toBe('stage');}
  stage.dispose();expect(drop).not.toHaveBeenCalled();expect(stage.hair.group.parent).toBeNull();expect(stage.glasses.parent).toBeNull();expect(fadePose(135)).toEqual(fadePose(135));
 }finally{drop.mockRestore();model.dispose();}
});
