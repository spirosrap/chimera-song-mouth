import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {classroomPose,classroomCamera,classroomBeat,CLASSROOM_OFFSET} from '../src/scene/classroom.ts';
import {CLASSROOM_BEATS} from '../src/scene/classroom-beats.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {ClassroomStage}=await import('../src/ui/render/classroom.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/celentano/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:Arrangement=JSON.parse(file('performance.json').toString());
const voices=score.parts.filter(p=>p.kind==='voice');
const ids=['adriano','classroom-chorus'] as const;
const tracks=['lead','chorus'].map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
test('Celentano adds the complete classroom performance, including the instrumental and harmonica ending',()=>{
 expect(movieScene('celentano')).toBeDefined();expect(scene.setting).toBe('classroom');expect(scene.duration).toBeCloseTo(225.206625,5);expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(scene.cues).toHaveLength(44);expect(scene.duration-scene.cues.at(-1)!.end).toBeGreaterThan(40);expect(sceneCamera(scene,0,'auto')).toBe('classroom-back');expect(sceneCamera(scene,190,'auto')).toBe('classroom-harmonica');expect(sceneCamera(scene,scene.duration,'auto')).toBe('wide');
 expect(()=>validateScene({...scene,setting:'dome'})).toThrow();expect(()=>validateScene({...scene,characters:scene.characters.slice(0,1)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'truman'}]})).toThrow('camera');expect(file('mix.mp3').length).toBeGreaterThan(7_000_000);expect(file('backing.mp3').length).toBeGreaterThan(7_000_000);
 expect(file('credits.txt').toString()).toContain('not English sentences');
});
test('two physical voices follow timed nonsense phones without inventing English or singing over the harmonica',()=>{
 const phones=voices.flatMap(p=>p.performance!.phrases.flatMap(ph=>ph.phones.map(x=>x.ipa)));
 expect(phones.some(x=>['r','a','e','y','ø','x','o','ts'].includes(x))).toBe(false);expect(phones).toContain('ɹ');
 // Source consonants stay at their own landmarks, not delayed to the next vowel.
 const response=voices[1].performance!.phrases.flatMap(ph=>{let t=ph.start;return ph.phones.map(x=>{const out={ipa:x.ipa,start:t};t+=x.duration;return out;});});
 expect(response.some(x=>x.ipa==='n'&&Math.abs(x.start-99.60101)<.001)).toBe(true);
 expect(voices).toHaveLength(2);expect(voices[0].body).not.toEqual(voices[1].body);expect(score.parts.find(p=>p.kind==='backing')?.recordingType).toBe('instrumental');expect(voices.map(p=>p.performance!.phrases.length)).toEqual([24,5]);expect(voices.map(p=>p.performance!.phrases.reduce((a,x)=>a+x.phones.length,0))).toEqual([801,102]);
 for(const [i,p]of voices.entries()){expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(planPart(p).length).toBeGreaterThan(500);expect(p.melody!.lyrics).toBe(p.performance!.lyrics);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(p.body.female,6);
  for(const phrase of p.performance!.phrases){const end=phrase.start+phrase.phones.reduce((s,p)=>s+p.duration,0);let peak=0;for(let f=track.indexAt(phrase.start);f<=track.indexAt(end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.001);}
  // HumanVoice advances its articulatory clock in 64-sample control steps.
  for(let f=0;f<track.frames;f++)expect(Math.abs(track.message(f).t.clock-f/20)).toBeLessThan(64/track.sampleRate+.00002);for(const [lo,hi]of [[10,20],[184,225]])for(let t=lo;t<hi;t+=.25)expect(track.message(track.indexAt(t)).t.outRms).toBeLessThan(.00001);
 }
});
test('the conductor, desk visits, measured beat, harmonica and standing finale survive absolute-time seeking',()=>{
 const pose=(s:number)=>classroomPose(s+CLASSROOM_OFFSET);expect(pose(3).conduct).toBe(1);expect(pose(22).conduct).toBe(0);expect(pose(79).lean).toBe(1);expect(pose(80).teacher[0]).toBeLessThan(-100);expect(pose(140).dance).toBeGreaterThan(.9);expect(pose(180).harmonica).toBe(0);expect(pose(190).harmonica).toBe(1);expect(pose(195).finale).toBe(0);expect(pose(207).finale).toBe(1);expect(classroomPose(NaN)).toEqual(classroomPose(0));expect(CLASSROOM_BEATS).toHaveLength(400);CLASSROOM_BEATS.forEach((t,i)=>expect(classroomBeat(t)).toBeCloseTo(i,5));
});
test('the classroom shows real lead and shared chorus mouths, framed close-ups, props and owned graphics',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new ClassroomStage(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const motion=()=>{const out=stage.people.flatMap(p=>[...p.root.matrixWorld.elements,...p.torso.matrixWorld.elements]);for(const b of [stage.students,stage.audience,stage.harmonica,stage.balloons,...stage.people.map(p=>p.limbs)])b.group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  expect(stage.people).toHaveLength(5);expect(stage.people.slice(1).every(p=>p.track===tracks[1]&&p.model===cast[1].model)).toBe(true);expect(stage.furniture.group.children.length).toBeGreaterThan(0);expect(stage.globe.group.children.length).toBeGreaterThan(0);
  for(const [w,h]of [[1280,720],[375,430]]){stage.resize(w,h);for(const view of SCENE_SETTINGS.classroom.cameras){const c=classroomCamera(view,w/h,140);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   for(const [view,index,time]of [['adriano',0,140],['classroom-harmonica',1,99]] as const){stage.frame(time,true,1,view,.5);expect(stage.people.filter(p=>p.root.visible)).toHaveLength(1);const p=stage.people[index];expect(p.root.visible).toBe(true);for(const [j,p]of stage.people.entries())expect(updates[j].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(p.track.message(p.track.indexAt(time)).t.artic));let count=0,inside=true;p.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);}
   stage.frame(99,true,1,'classroom-chorus',.5);expect(stage.people[0].root.visible).toBe(false);expect(stage.people.slice(1).every(p=>p.root.visible)).toBe(true);for(const p of stage.people.slice(1)){const top=new THREE.Vector3(0,35,0).applyMatrix4(p.root.matrixWorld).project(stage.camera);expect(Math.abs(top.x)).toBeLessThan(1);expect(Math.abs(top.y)).toBeLessThan(1);}
   stage.scene.traverse(o=>{if(o.name==='back-wall'&&stage.camera.position.z<-310)expect(o.visible).toBe(false);if(o.name==='front-wall'&&stage.camera.position.z>420)expect(o.visible).toBe(false);});
  }
  stage.frame(100,true,2,'classroom-harmonica',.5);expect(stage.harmonica.group.visible).toBe(false);stage.frame(190,true,2,'classroom-harmonica',0);expect(stage.harmonica.group.visible).toBe(true);
  for(const t of [0,29,79,99,140,165,190,207,225]){stage.frame(t,true,3,'wide',.5);const before=motion();stage.frame(t,false,3,'wide',0);expect(motion()).toEqual(before);stage.frame(scene.duration,true,4,'adriano',0);stage.frame(t,true,5,'wide',0);expect(motion()).toEqual(before);}
 }finally{updates.forEach(u=>u.mockRestore());let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());for(const p of stage.people)expect(p.hair.group.parent).toBeNull();}
});
