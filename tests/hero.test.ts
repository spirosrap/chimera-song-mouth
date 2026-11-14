import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {heroPose,heroPlace,heroCamera} from '../src/scene/hero.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {HeroStage}=await import('../src/ui/render/hero.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/hero/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Hero adds the complete source film, quiet opening and full final vocal release',()=>{
 expect(movieScene('hero')).toBeDefined();expect(scene.setting).toBe('hero');expect(scene.duration).toBeCloseTo(262.967687,5);expect(scene.characters.map(c=>c.id)).toEqual(['enrique']);expect(scene.cues[0].start).toBeLessThan(6);expect(scene.cues.at(-1)!.end).toBeGreaterThan(257);expect(scene.shots.length).toBe(36);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);
 expect(sceneCamera(scene,222,'auto')).toBe('hero-rain');expect(sceneCamera(scene,245,'auto')).toBe('hero-embrace');expect(()=>validateScene({...scene,shots:[{time:0,view:'unbreak-theatre'}]})).toThrow('camera');
});
test('the approved physical lead retains complete source phones and an audible opening and ending',()=>{
 const part=score.parts[0],p=part.performance!;expect(validPerformance(p,score.duration)).toBe(true);expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(part.voice!.drift).toBe(0);expect(part.body).toEqual({female:.06,child:0});expect(part.melody!.notes.length).toBe(274);expect(score.parts[1].recordingType).toBe('instrumental');expect(p.lyrics.split(/\s+/).length).toBe(238);expect(p.phrases.length).toBe(47);
 for(const ph of p.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 const last=p.phrases.at(-1)!;expect(last.start+last.phones.reduce((s,c)=>s+c.duration,0)).toBeGreaterThan(257);expect(track.message(track.indexAt(4)).t.outRms).toBeGreaterThan(.001);
});
test('Hero telemetry stays finite on the source sample clock, including quiet bookends',()=>{
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<2||i/20>260)expect(t.outRms).toBeLessThan(.00001);}
});
test('all seven Hero sets, costumes, villain and cradling pose restore after arbitrary seeks',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new HeroStage(model,track);
 try{
  for(const [time,place,view]of [[15,'station','hero-station'],[42,'desert','hero-desert'],[82,'car','hero-car'],[108,'chapel','hero-chapel'],[125,'bedroom','hero-bedroom'],[188,'courtyard','hero-courtyard'],[245,'rain','hero-embrace']]as const){
   stage.frame(time,true,1,view,.7);expect(heroPlace(view,time)).toBe(place);expect(stage.rooms[place].visible).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);const snap=()=>[...stage.singer.matrixWorld.elements,...stage.car.matrixWorld.elements,...stage.cast.figures.filter(f=>f.root.visible).flatMap(f=>[...f.root.matrixWorld.elements,...f.hands.flatMap(h=>h.position.toArray())])],before=snap();stage.frame(194,false,2,'hero-courtyard',0);stage.frame(3,false,3,'wide',0);stage.frame(time,false,4,view,0);expect(snap()).toEqual(before);
  }
  expect(heroPose(NaN)).toEqual(heroPose(0));stage.frame(18,false,5,'enrique',0);expect(stage.beanie.visible).toBe(true);expect(stage.shades.visible).toBe(true);stage.frame(228,false,6,'enrique',0);expect(stage.beanie.visible).toBe(false);expect(stage.shades.visible).toBe(false);stage.frame(245,false,7,'hero-embrace',0);expect(stage.singer.position.y).toBe(22);expect(stage.singer.rotation.z).toBeCloseTo(-Math.PI/2,6);expect(stage.cast.figures[0].hands[0].position.y).toBe(43);expect(stage.cast.figures[0].root.scale.toArray()).toEqual([1,1,1]);expect(heroCamera('hero-escape',16/9,80).position[2]).toBeLessThan(heroCamera('hero-escape',16/9,80).target[2]);
 }finally{stage.dispose();model.dispose();}
});
test('Hero close-ups fit the cinema aperture and portrait without disposing the borrowed airway',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new HeroStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [18,70,108,188,228,245]){
  stage.resize(w,h);stage.frame(time,true,1,'enrique',.7);let count=0,inside=true;const aperture=w/h>1.5?Math.min(1,w/h/2.35):1;
  stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<aperture&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);expect(stage.bars.every(b=>b.visible)).toBe(w/h>1.5);const c=heroCamera('enrique',w/h,time);expect([...c.position,...c.target].every(Number.isFinite)).toBe(true);
 }}finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).not.toHaveBeenCalled();dispose.mockRestore();model.dispose();}
});
