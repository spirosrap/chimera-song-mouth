import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {tarsPose,tarsCamera,tarsSourceTime,TARS_TIMELINE} from '../src/scene/tars.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {RangerCabin}=await import('../src/ui/render/ranger.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/tars/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance&{sourceTimeline:readonly (readonly [number,number])[]}=JSON.parse(file('performance.json').toString());
const ids=['tars','cooper','doyle'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const performanceTime=(source:number)=>{let i=0;while(i<TARS_TIMELINE.length-2&&TARS_TIMELINE[i+1][0]<source)i++;const [s0,t0]=TARS_TIMELINE[i],[s1,t1]=TARS_TIMELINE[i+1];return t0+(t1-t0)*(source-s0)/(s1-s0);};

test('TARS preserves the full supplied scene, jokes and stage separation',()=>{
 expect(movieScene('tars')).toBeDefined();expect(scene.setting).toBe('ranger');expect(scene.duration).toBeGreaterThan(39.45);expect(scene.duration).toBeLessThan(44);
 expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(scene.cues).toHaveLength(13);expect(score.lines.flatMap(l=>l.words)).toHaveLength(97);
 expect(scene.cues.some(c=>c.text.includes('cue light'))).toBe(true);expect(scene.cues.some(c=>c.text.includes('seventy-five'))).toBe(true);expect(scene.cues.at(-1)?.text).toBe('Stage two separation.');
 expect(sceneCamera(scene,0,'auto')).toBe('ranger-launch');expect(sceneCamera(scene,performanceTime(30),'auto')).toBe('tars');expect(sceneCamera(scene,performanceTime(35.9),'auto')).toBe('ranger-panel');expect(sceneCamera(scene,performanceTime(39),'auto')).toBe('ranger-separation');
 expect(file('mix.mp3').length).toBeGreaterThan(1_000_000);expect(file('backing.mp3').length).toBeGreaterThan(1_000_000);
 expect(()=>validateScene({...scene,setting:'odyssey'})).toThrow();expect(()=>validateScene({...scene,characters:scene.characters.slice(0,2)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'jesus'}]})).toThrow('camera');
});
test('three distinct physical voices keep every word audible and take separate turns',()=>{
 expect(score.parts).toHaveLength(3);expect(new Set(score.parts.map(p=>JSON.stringify(p.body))).size).toBe(3);
 for(const [i,l]of score.lines.entries()){
  expect(l.segments.filter(s=>s.wordEnd)).toHaveLength(l.words.length);if(i)expect(l.start-score.lines[i-1].end).toBeGreaterThanOrEqual(.1499);
  const track=tracks[ids.indexOf(l.speaker as typeof ids[number])];let rms=0;for(let f=track.indexAt(l.start);f<=track.indexAt(l.end);f++)rms=Math.max(rms,track.message(f).t.outRms);expect(rms).toBeGreaterThan(.001);
 }
 for(const [i,p]of score.parts.entries()){expect(p.kind).toBe('voice');expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(planDialoguePart(score,p.id).length).toBeGreaterThan(100);expect(tracks[i].duration).toBeCloseTo(scene.duration,1);for(let f=0;f<tracks[i].frames;f++)expect(tracks[i].message(f).t.clock).toBeCloseTo(f/20,4);for(const t of [0,1,2])expect(tracks[i].message(tracks[i].indexAt(t)).t.outRms).toBe(0);}
 expect(score.sourceTimeline).toEqual(TARS_TIMELINE);for(const [s,t]of TARS_TIMELINE)expect(tarsSourceTime(t)).toBeCloseTo(s,6);
});
test('the joke indicator, humor setting and separated rocket follow the retimed dialogue',()=>{
 expect(tarsPose(performanceTime(28)).joke).toBe(0);expect(tarsPose(performanceTime(30)).joke).toBe(1);
 expect(tarsPose(performanceTime(34)).humor).toBe(100);expect(tarsPose(performanceTime(36)).humor).toBe(75);
 expect(tarsPose(performanceTime(38)).separation).toBe(0);expect(tarsPose(scene.duration).separation).toBe(1);expect(tarsPose(NaN)).toEqual(tarsPose(0));
});
test('the cabin, working robot airway, helmets and exterior survive pause and backwards seeks',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new RangerCabin(cast),updates=stage.people.map(p=>spyOn(p.head,'update')),physical=spyOn(stage.robot.model,'frame');
 const motion=()=>{const out=[...stage.robotRoot.matrixWorld.elements,...stage.booster.matrixWorld.elements];for(const group of [stage.robotScreen.group,stage.airway.group,...stage.people.map(p=>p.arms.group)])group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  expect(stage.columns).toHaveLength(4);expect(stage.people.map(p=>p.id)).toEqual(['cooper','doyle','brand','romilly']);expect(stage.people.slice(2).every(p=>p.track===undefined)).toBe(true);
  for(const [w,h]of [[1280,720],[375,211],[375,430]]){
   stage.resize(w,h);for(const view of SCENE_SETTINGS.ranger.cameras){const c=tarsCamera(view,w/h,18);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   for(const [view,t]of [['cooper',18],['doyle',12],['brand',3],['romilly',5],['tars',7],['ranger-panel',40]] as const){
    stage.frame(t,true,1,view,.5);expect(stage.cabin.visible).toBe(true);expect(stage.space.visible).toBe(false);expect(stage.robotRoot.visible).toBe(view==='tars'||view==='ranger-panel');
    expect(physical.mock.calls.at(-1)![0]).toEqual(VoiceModel.articFromArray(tracks[0].message(tracks[0].indexAt(t)).t.artic));
    for(const [i,p]of stage.people.entries()){
     if(i<2)expect(updates[i].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(tracks[i+1].message(tracks[i+1].indexAt(t)).t.artic));
     if(p.id!==view){expect(p.root.visible).toBe(false);continue;}
     let count=0,inside=true;p.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
    }
    if(view==='tars'||view==='ranger-panel'){let inside=true;stage.airway.group.traverse(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=Math.abs(v.x)<.95&&Math.abs(v.y)<.95&&Math.abs(v.z)<1;}});expect(inside).toBe(true);}
   }
   stage.frame(5,true,2,'wide',0);expect(stage.people.every(p=>p.root.visible)).toBe(true);expect(stage.forward.group.visible).toBe(false);
   stage.frame(scene.duration,true,2,'ranger-separation',0);expect(stage.space.visible).toBe(true);expect(stage.cabin.visible).toBe(false);expect(stage.booster.position.y).toBeLessThan(-100);
  }
  for(const t of [0,3,7,14,18,performanceTime(30),40,scene.duration]){stage.frame(t,true,3,'wide',.5);const before=motion();stage.frame(t,false,3,'wide',0);expect(motion()).toEqual(before);stage.frame(scene.duration,true,4,'tars',0);stage.frame(t,true,5,'wide',0);expect(motion()).toEqual(before);}
 }finally{
  updates.forEach(u=>u.mockRestore());physical.mockRestore();let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());for(const p of stage.people)expect(p.gear.group.parent).toBeNull();
 }
});
