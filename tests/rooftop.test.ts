import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {rooftopPose,rooftopCamera} from '../src/scene/rooftop.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {RainRooftop}=await import('../src/ui/render/rooftop.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/tears-in-rain/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance=JSON.parse(file('performance.json').toString());
const ids=['roy','deckard'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});

test('Tears in Rain keeps the whole rescue, monologue, dove and quiet ending',()=>{
 expect(movieScene('tears-in-rain')).toBeDefined();expect(scene.setting).toBe('rooftop');
 expect(scene.duration).toBeGreaterThan(225.7);expect(scene.duration).toBeLessThan(225.8);
 expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(scene.cues).toHaveLength(8);
 expect(score.lines.flatMap(l=>l.words)).toHaveLength(59);
 expect(sceneCue(scene,44)?.text).toContain('experience');expect(sceneCue(scene,131)?.text).toContain('Tannhäuser');expect(sceneCue(scene,159.3)?.text).toBe('Time to die.');
 expect(sceneCamera(scene,70,'auto')).toBe('roy');expect(sceneCamera(scene,175,'auto')).toBe('roof-dove');expect(sceneCamera(scene,180,'auto')).toBe('roof-sky');expect(sceneCamera(scene,223,'auto')).toBe('deckard');
 for(const t of [0,20,70,90,170,224])expect(sceneCue(scene,t)).toBeUndefined();
 expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(file('backing.mp3').length).toBeGreaterThan(7_000_000);
 expect(()=>validateScene({...scene,setting:'matrix'})).toThrow('character');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'neo'}]})).toThrow('camera');
});
test('Roy speaks through physical articulations while Deckard remains silent',()=>{
 const part=score.parts[0],plan=planDialoguePart(score,'roy');expect(score.parts).toHaveLength(1);expect(part.kind).toBe('voice');expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();
 expect(plan.length).toBeGreaterThan(400);expect(plan.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);expect(plan.some(g=>g.targets.abduction!==undefined&&g.targets.abduction>0)).toBe(true);
 for(const [i,line]of score.lines.entries()){
  expect(line.segments.filter(s=>s.wordEnd)).toHaveLength(line.words.length);expect(line.end).toBeLessThan(score.lines[i+1]?.start??scene.duration);
  let rms=0;for(let f=tracks[0].indexAt(line.start);f<=tracks[0].indexAt(line.end);f++)rms=Math.max(rms,tracks[0].message(f).t.outRms);expect(rms).toBeGreaterThan(.001);
 }
 for(const track of tracks){expect(track.duration).toBeCloseTo(scene.duration,1);for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,4);}
 for(let f=0;f<tracks[1].frames;f++){expect(tracks[1].message(f).t.outRms).toBe(0);expect(tracks[1].message(f).t.gate).toBe(0);}
 for(const t of [0,23,40,60,80,100,110,135,145,154,161,176,200,225]){const m=tracks[0].message(tracks[0].indexAt(t)).t;expect(m.outRms).toBeLessThan(.00001);expect(m.gate).toBeLessThan(.01);}
});
test('the rescue, bowed head and dove use an absolute clock',()=>{
 expect(rooftopPose(10).deckard[1]).toBeLessThan(0);expect(rooftopPose(30).jump).toBe(1);expect(rooftopPose(80).deckard[1]).toBeGreaterThan(0);
 expect(rooftopPose(110).sit).toBe(1);expect(rooftopPose(160).death).toBe(0);expect(rooftopPose(170).death).toBe(1);expect(rooftopPose(170).royTilt).toBeLessThan(-.6);
 expect(rooftopPose(174).flight).toBe(0);expect(rooftopPose(179).dove[1]).toBeGreaterThan(rooftopPose(176).dove[1]+40);expect(rooftopPose(220).doveVisible).toBe(false);expect(rooftopPose(NaN)).toEqual(rooftopPose(0));
});
test('rooftop framing, articulation, rain and dove survive pause and backwards seeks',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new RainRooftop(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const motion=()=>{const out=[...stage.doveRoot.matrixWorld.elements];for(const group of [stage.rain.group,stage.water.group,stage.dove.group,...stage.people.map(p=>p.arms.group)])group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  for(const [w,h]of [[1280,720],[375,211],[375,430]]){
   stage.resize(w,h);
   for(const view of SCENE_SETTINGS.rooftop.cameras){const c=rooftopCamera(view,w/h,140);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   for(const [view,t]of [['roy',45],['roy',125],['roy',170],['deckard',20],['deckard',180],['wide',140]] as const){
    stage.frame(t,true,1,view,.5);if(t>=170)expect(stage.people[0].head.face.lid).toBe(1);
    for(const [i,p]of stage.people.entries()){
     expect(updates[i].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(tracks[i].message(tracks[i].indexAt(t)).t.artic));
     if(view!=='wide'&&view!==p.id)continue;let n=0,inside=true;p.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);n++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(n).toBeGreaterThan(1000);expect(inside).toBe(true);
    }
   }
   for(const [view,t]of [['roof-dove',175],['roof-sky',179]] as const){stage.frame(t,true,1,view,0);const v=stage.doveRoot.position.clone().project(stage.camera);expect(Math.abs(v.x)).toBeLessThan(.2);expect(Math.abs(v.y)).toBeLessThan(.2);expect(v.z).toBeLessThan(1);}
  }
  for(const t of [0,25,69,75,100,130,170,176.9,179,224]){stage.frame(t,true,2,'wide',.5);const before=motion();stage.frame(t,false,2,'wide',0);expect(motion()).toEqual(before);stage.frame(225,true,3,'wide',0);stage.frame(t,true,4,'wide',0);expect(motion()).toEqual(before);}
 }finally{
  updates.forEach(u=>u.mockRestore());let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());for(const p of stage.people)expect(p.hair.group.parent).toBeNull();
 }
});
