import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {unbreakPose,unbreakPlace,unbreakCamera} from '../src/scene/unbreak-my-heart.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {UnbreakStage}=await import('../src/ui/render/unbreak-my-heart.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/unbreak-my-heart/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Un-Break My Heart adds the full supplied music video and complete sustained ending',()=>{
 expect(movieScene('unbreak-my-heart')).toBeDefined();expect(scene.setting).toBe('unbreak');expect(scene.duration).toBeGreaterThan(273.4);expect(scene.duration).toBeLessThan(273.6);expect(scene.characters.map(c=>c.id)).toEqual(['toni']);expect(scene.cues[0].start).toBeLessThan(22);expect(scene.cues.at(-1)!.end).toBeGreaterThan(260);expect(scene.shots.length).toBe(31);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);
 expect(sceneCamera(scene,225,'auto')).toBe('unbreak-theatre');expect(sceneCamera(scene,270,'auto')).toBe('unbreak-curtain');expect(()=>validateScene({...scene,shots:[{time:0,view:'bonjovi-loft'}]})).toThrow('camera');
});
test('the source-aligned physical score retains all syllables and an audible long final on',()=>{
 const part=score.parts[0],p=part.performance!;expect(validPerformance(p,score.duration)).toBe(true);expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(part.voice!.drift).toBe(0);expect(part.body).toEqual({female:.82,child:0});expect(part.melody!.notes.length).toBe(295);expect(score.parts[1].recordingType).toBe('instrumental');expect(p.lyrics.split(/\s+/).length).toBe(260);
 for(const ph of p.phrases){const end=ph.start+ph.phones.reduce((sum,x)=>sum+x.duration,0);let peak=0;for(let i=track.indexAt(ph.start);i<=track.indexAt(end);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 const last=p.phrases.at(-1)!;expect(last.start).toBeLessThan(246);expect(last.start+last.phones.reduce((s,c)=>s+c.duration,0)).toBeGreaterThan(260);expect(track.message(track.indexAt(249)).t.outRms).toBeGreaterThan(.001);
});
test('the physical mouth uses a finite exact sample clock with quiet introductory and ending frames',()=>{
 expect(track.duration).toBeCloseTo(scene.duration,1);for(let i=0;i<track.frames;i++){const t=track.message(i).t;expect(t.clock).toBeCloseTo(i/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(i/20<18||i/20>266)expect(t.outRms).toBeLessThan(.00001);}
});
test('all seven sets, seated grief, gown, orchestra and curtain restore directly after seeks',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new UnbreakStage(model,track);
 try{
  for(const [time,place,view]of [[12,'road','unbreak-road'],[44,'home','unbreak-home'],[66,'pool','unbreak-pool'],[104,'mirror','unbreak-mirror'],[140,'bedroom','unbreak-bedroom'],[150,'stairs','unbreak-stairs'],[225,'theatre','unbreak-theatre']]as const){
   stage.frame(time,true,1,view,.7);expect(unbreakPlace(view,time)).toBe(place);expect(stage.rooms[place].visible).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);const snap=()=>[...stage.singer.matrixWorld.elements,...stage.bike.matrixWorld.elements,...stage.cast.figures.filter(f=>f.root.visible).flatMap(f=>f.hands.flatMap(h=>h.position.toArray()))],before=snap();stage.frame(3,false,2,'wide',0);stage.frame(time,false,3,view,0);expect(snap()).toEqual(before);
  }
  expect(unbreakPose(NaN)).toEqual(unbreakPose(0));stage.frame(150,false,4,'unbreak-stairs',0);expect(stage.singer.position.y).toBe(110);stage.frame(225,false,5,'unbreak-theatre',0);expect(stage.singer.position.y).toBe(140);expect(stage.cast.figures.filter(f=>f.root.visible).length).toBeGreaterThan(30);expect(stage.orchestraSet.visible).toBe(true);stage.frame(225,false,6,'toni',0);expect(stage.orchestraSet.visible).toBe(false);expect(stage.cast.group.visible).toBe(false);
  stage.frame(272,false,7,'unbreak-curtain',0);expect(stage.singer.visible).toBe(false);expect(stage.motion.group.children.some(o=>o.visible)).toBe(false);expect(Math.abs(stage.curtains[0].position.x)).toBeLessThan(10);
 }finally{stage.dispose();model.dispose();}
});
test('landscape and portrait close-ups frame the actual airway and disposal retains the borrowed voice model',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new UnbreakStage(model,track);
 try{for(const [w,h]of [[1280,720],[375,430]])for(const time of [25,54,129,155,195,254]){
  stage.resize(w,h);stage.frame(time,true,1,'toni',.7);let count=0,inside=true;stage.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);const c=unbreakCamera('toni',w/h,time);expect([...c.position,...c.target].every(Number.isFinite)).toBe(true);
 }}finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).not.toHaveBeenCalled();dispose.mockRestore();model.dispose();}
});
