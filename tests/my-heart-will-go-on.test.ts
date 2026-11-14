import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {titanicPose,titanicPlace,titanicCamera} from '../src/scene/titanic.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {TitanicStage}=await import('../src/ui/render/titanic.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/my-heart-will-go-on/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('My Heart Will Go On retains the complete anniversary alternate performance and instrumental outro',()=>{
 expect(movieScene('my-heart-will-go-on')).toBeDefined();expect(scene.setting).toBe('titanic');expect(scene.duration).toBeCloseTo(280.916712,5);expect(scene.characters.map(c=>c.id)).toEqual(['celine-sea']);expect(scene.cues[0].start).toBeGreaterThan(20);expect(scene.cues.at(-1)!.end).toBeGreaterThan(250);expect(scene.shots.length).toBe(32);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);
 expect(sceneCamera(scene,14,'auto')).toBe('titanic-bow');expect(sceneCamera(scene,244,'auto')).toBe('titanic-dissolve');expect(()=>validateScene({...scene,shots:[{time:0,view:'mansion-bedroom'}]})).toThrow('camera');
});
test('the complete physical score keeps the approved voice and every phrase audible through the held ending',()=>{
 const part=score.parts[0],p=part.performance!;expect(validPerformance(p,score.duration)).toBe(true);expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(part.voice!.drift).toBe(0);expect(part.body).toEqual({female:.86,child:0});expect(part.melody!.notes.length).toBe(192);expect(score.parts[1].recordingType).toBe('instrumental');expect(p.lyrics.split(/\s+/).length).toBe(172);expect(p.phrases.length).toBe(24);
 for(const ph of p.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 const last=p.phrases.at(-1)!;expect(last.start+last.phones.reduce((s,c)=>s+c.duration,0)).toBeGreaterThan(250);expect(track.message(track.indexAt(249)).t.outRms).toBeGreaterThan(.001);
});
test('the shared physical mouth telemetry has finite articulations, exact sample time and silent bookends',()=>{
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<19||i/20>257)expect(t.outRms).toBeLessThan(.00001);}
});
test('deck, ocean, starry close-ups, lace hands and double exposure restore directly after seeks',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new TitanicStage(model,track);
 try{
  for(const [time,place,view]of [[14,'deck','titanic-bow'],[50,'deck','titanic-deck'],[70,'sunset','celine-sea'],[130,'stars','titanic-stars'],[59,'sunset','titanic-dissolve'],[218,'stars','titanic-stars']]as const){
   stage.frame(time,true,1,view,.7);expect(titanicPlace(view,time)).toBe(place);expect(stage.rooms[place].visible).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);const snap=()=>[...stage.singers.flatMap(g=>g.matrixWorld.elements),...stage.ship.matrixWorld.elements,...stage.bodies.flatMap(b=>b.figures.flatMap(f=>f.hands.flatMap(h=>h.position.toArray())))],before=snap();stage.frame(244,false,2,'titanic-dissolve',0);stage.frame(14,false,3,'titanic-bow',0);stage.frame(time,false,4,view,0);expect(snap()).toEqual(before);
  }
  expect(titanicPose(NaN)).toEqual(titanicPose(0));stage.frame(59,false,5,'titanic-dissolve',0);expect(stage.singers[1].visible).toBe(true);stage.frame(130,false,6,'titanic-stars',0);expect(stage.singers[1].visible).toBe(false);expect(stage.starfield.visible).toBe(true);expect(stage.sunset.visible).toBe(false);stage.frame(218,false,7,'titanic-stars',0);expect(stage.bodies[0].figures[0].hands[1].position.x).toBeGreaterThan(60);expect(stage.rails.children.length).toBe(19);expect(stage.stars.length).toBe(240);expect(stage.gowns.length).toBe(2);
 }finally{stage.dispose();model.dispose();}
});
test('both borrowed-model heads fit landscape and portrait close-ups without releasing the airway',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new TitanicStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const [time,view]of [[70,'celine-sea'],[59,'titanic-dissolve'],[218,'titanic-stars']]as const){
  stage.resize(w,h);stage.frame(time,true,1,view,.7);let count=0,inside=true;
  for(let n=0;n<2;n++){if(!stage.singers[n].visible)continue;stage.heads[n].scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});}
  expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);const c=titanicCamera(view,w/h,time);expect([...c.position,...c.target].every(Number.isFinite)).toBe(true);
 }}finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).not.toHaveBeenCalled();dispose.mockRestore();model.dispose();}
});
