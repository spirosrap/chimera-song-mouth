import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {parkPose,parkCamera,parkSourceTime} from '../src/scene/park.ts';
import {PARK_TIMELINE} from '../src/scene/park-timing.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {GardenBench}=await import('../src/ui/render/park.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/good-will-hunting/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance&{sourceTimeline:readonly (readonly [number,number])[]}=JSON.parse(file('performance.json').toString());
const ids=['sean','will'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const performanceTime=(source:number)=>{let i=0;while(i<PARK_TIMELINE.length-2&&PARK_TIMELINE[i+1][0]<source)i++;const [s0,t0]=PARK_TIMELINE[i],[s1,t1]=PARK_TIMELINE[i+1];return t0+(t1-t0)*(source-s0)/(s1-s0);};
test('Good Will Hunting retains the complete park scene and quiet ending, without the promotional endcard',()=>{
 expect(movieScene('good-will-hunting')).toBeDefined();expect(scene.setting).toBe('park');expect(scene.duration).toBeGreaterThan(287.74);expect(scene.duration).toBeLessThan(290);expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(score.lines.flatMap(l=>l.words)).toHaveLength(570);expect(scene.cues).toHaveLength(68);
 expect(scene.cues.at(-1)?.text).toBe('Your move, chief.');expect(scene.duration-scene.cues.at(-1)!.end).toBeGreaterThan(14);
 expect(sceneCamera(scene,0,'auto')).toBe('park-lake');expect(sceneCamera(scene,performanceTime(180),'auto')).toBe('will');expect(sceneCamera(scene,performanceTime(287),'auto')).toBe('park-lake');
 expect(()=>validateScene({...scene,setting:'ranger'})).toThrow();expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'tars'}]})).toThrow('camera');
 expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(file('backing.mp3').length).toBeGreaterThan(8_000_000);
});
test('Sean and Will use separate physical voices, source inflection and non-overlapping clear speech',()=>{
 expect(score.parts).toHaveLength(2);expect(new Set(score.parts.map(p=>JSON.stringify(p.body))).size).toBe(2);expect(score.sourceTimeline).toEqual(PARK_TIMELINE);
 for(const [i,l]of score.lines.entries()){expect(l.segments.filter(s=>s.wordEnd)).toHaveLength(l.words.length);if(i)expect(l.start-score.lines[i-1].end).toBeGreaterThanOrEqual(.1299);expect(l.pitchContour?.length).toBeGreaterThan(1);const track=tracks[ids.indexOf(l.speaker as typeof ids[number])];let peak=0;for(let f=track.indexAt(l.start);f<=track.indexAt(l.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.001);}
 for(const [i,p]of score.parts.entries()){expect(p.kind).toBe('voice');expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(planDialoguePart(score,p.id).length).toBeGreaterThan(300);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,3);for(let t=274;t<scene.duration;t+=.25)expect(track.message(track.indexAt(t)).t.outRms).toBeLessThan(.00001);}
 for(const [s,t]of PARK_TIMELINE)expect(parkSourceTime(t)).toBeCloseTo(s,6);
});
test('the reflective gestures, stand and walk-away follow the same source clock as the dialogue',()=>{
 const early=parkPose(performanceTime(30)),late=parkPose(performanceTime(270)),standing=parkPose(performanceTime(276.2)),leaving=parkPose(scene.duration);
 expect(early.stand).toBe(0);expect(late.stand).toBe(0);expect(standing.stand).toBe(1);expect(leaving.walk).toBe(1);expect(leaving.sean[0]).toBeLessThan(-150);expect(leaving.sean[1]).toBeGreaterThan(early.sean[1]+40);expect(leaving.will).toEqual(early.will);expect(parkPose(NaN)).toEqual(parkPose(0));
});
test('the bench, cap, beard, swans and physical mouths survive seeking, framing and borrowed-model disposal',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new GardenBench(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const motion=()=>{const out=stage.people.flatMap(p=>[...p.root.matrixWorld.elements,...p.head.scene.matrixWorld.elements]);for(const b of [stage.swans,stage.walkers,stage.pond,...stage.people.map(p=>p.limbs)])b.group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  expect(stage.people.map(p=>p.id)).toEqual([...ids]);expect(stage.bench.group.children.length).toBeGreaterThan(0);expect(stage.swans.group.children.length).toBeGreaterThan(0);
  for(const [w,h]of [[1280,720],[375,211],[375,430]]){stage.resize(w,h);for(const view of SCENE_SETTINGS.park.cameras){const c=parkCamera(view,w/h,20);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   for(const [i,view]of ids.entries()){stage.frame(20,true,1,view,.5);expect(stage.people[i].root.visible).toBe(true);expect(stage.people[1-i].root.visible).toBe(false);for(const [j,p]of stage.people.entries())expect(updates[j].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(tracks[j].message(tracks[j].indexAt(20)).t.artic));let count=0,inside=true;stage.people[i].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);}
   stage.frame(150,true,2,'park-pair',.5);expect(stage.people.every(p=>p.root.visible)).toBe(true);
   stage.frame(performanceTime(279),true,2,'wide',.5);for(const p of stage.people){const top=new THREE.Vector3(0,30,0).applyMatrix4(p.root.matrixWorld).project(stage.camera);expect(Math.abs(top.x)).toBeLessThan(1);expect(Math.abs(top.y)).toBeLessThan(1);}
  }
  for(const t of [0,20,80,170,235,performanceTime(275),scene.duration]){stage.frame(t,true,3,'wide',.5);const before=motion();stage.frame(t,false,3,'wide',0);expect(motion()).toEqual(before);stage.frame(scene.duration,true,4,'sean',0);stage.frame(t,true,5,'wide',0);expect(motion()).toEqual(before);}
 }finally{updates.forEach(u=>u.mockRestore());let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());for(const p of stage.people)expect(p.hair.group.parent).toBeNull();}
});
