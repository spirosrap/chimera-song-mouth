import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {domePose,domeCamera,domeSourceTime} from '../src/scene/dome.ts';
import {DOME_TIMELINE} from '../src/scene/dome-timing.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {BroadcastDome}=await import('../src/ui/render/dome.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/truman-show/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance&{sourceTimeline:readonly (readonly [number,number])[]}=JSON.parse(file('performance.json').toString());
const ids=['truman','christof','sylvia','network-exec','broadcast-director','guard-one','guard-two'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const performanceTime=(source:number)=>{let i=0;while(i<DOME_TIMELINE.length-2&&DOME_TIMELINE[i+1][0]<source)i++;const [s0,t0]=DOME_TIMELINE[i],[s1,t1]=DOME_TIMELINE[i+1];return t0+(t1-t0)*(source-s0)/(s1-s0);};
test('The Truman Show preserves the supplied ending, seven speakers and closing guard exchange',()=>{
 expect(movieScene('truman-show')).toBeDefined();expect(scene.setting).toBe('dome');expect(scene.duration).toBeCloseTo(315.35,2);expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(score.lines.flatMap(l=>l.words)).toHaveLength(239);expect(scene.cues).toHaveLength(51);
 expect(scene.cues.at(-1)?.text).toContain('TV Guide');expect(scene.shots.at(-1)!.time).toBeGreaterThan(scene.cues.at(-1)!.end);expect(sceneCamera(scene,0,'auto')).toBe('dome-boat');expect(sceneCamera(scene,scene.duration,'auto')).toBe('broadcast-end');
 for(const view of ['dome-stairs','dome-exit','control-monitor','viewers-bar','viewer-bath','security-room','sylvia'])expect(scene.shots.some(s=>s.view===view)).toBe(true);
 expect(()=>validateScene({...scene,setting:'park'})).toThrow();expect(()=>validateScene({...scene,characters:scene.characters.slice(0,6)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'sean'}]})).toThrow('camera');
 expect(file('mix.mp3').length).toBeGreaterThan(9_000_000);expect(file('backing.mp3').length).toBeGreaterThan(9_000_000);
});
test('all seven mouths generate separate clear dialogue on the shared source and telemetry clocks',()=>{
 expect(score.parts).toHaveLength(7);expect(new Set(score.parts.map(p=>JSON.stringify([p.body,p.voice]))).size).toBe(7);expect(score.sourceTimeline).toEqual(DOME_TIMELINE);
 expect(score.parts[0].body.female-score.parts[1].body.female).toBeGreaterThan(.3);
 for(const [i,l]of score.lines.entries()){expect(l.segments.filter(s=>s.wordEnd)).toHaveLength(l.words.length);if(i)expect(l.start-score.lines[i-1].end).toBeGreaterThanOrEqual(.1299);const track=tracks[ids.indexOf(l.speaker as typeof ids[number])];let peak=0;for(let f=track.indexAt(l.start);f<=track.indexAt(l.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.001);}
 for(const [i,p]of score.parts.entries()){expect(p.kind).toBe('voice');expect(p.effects).toBeUndefined();expect(p.recordingType).toBeUndefined();expect(planDialoguePart(score,p.id).length).toBeGreaterThan(20);const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(p.body.female,6);expect(track.body.child).toBeCloseTo(p.body.child,6);for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,3);const last=score.lines.filter(l=>l.speaker===p.id).at(-1)!.end;for(let t=last+.5;t<scene.duration;t+=.25)expect(track.message(track.indexAt(t)).t.outRms).toBeLessThan(.00001);}
 for(const [s,t]of DOME_TIMELINE)expect(domeSourceTime(t)).toBeCloseTo(s,6);
});
test('the boat, staircase, door, farewell, bow and broadcast shutdown follow source action timing',()=>{
 const pose=(t:number)=>domePose(performanceTime(t));expect(pose(0).stepOff).toBe(0);expect(pose(32).stepOff).toBe(1);expect(pose(51).climb).toBe(0);expect(pose(63).climb).toBe(1);expect(pose(63).truman[1]-pose(51).truman[1]).toBe(270);expect(pose(63).open).toBe(0);expect(pose(67).open).toBe(1);expect(pose(240).wave).toBe(1);expect(pose(253).bow).toBe(1);expect(pose(259).bow).toBe(0);expect(pose(267).leave).toBe(1);expect(pose(285).cheer).toBe(1);expect(pose(302).screenOff).toBe(1);expect(domePose(NaN)).toEqual(domePose(0));
});
test('the dome and viewers retain framed real mouths, readable monitors and deterministic owned graphics',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new BroadcastDome(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const motion=()=>{const out=stage.people.flatMap(p=>[...p.root.matrixWorld.elements,...p.torso.matrixWorld.elements]);out.push(...stage.door.matrixWorld.elements);for(const b of [stage.water,stage.reactions,stage.screens,stage.monitorPicture,...stage.people.map(p=>p.arms)])b.group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  expect(stage.people).toHaveLength(8);expect(stage.people.find(p=>p.id==='bath-viewer')!.track).toBeUndefined();
  for(const [w,h]of [[1280,720],[375,430]]){stage.resize(w,h);for(const view of SCENE_SETTINGS.dome.cameras){const c=domeCamera(view,w/h,115);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   for(const view of ids){stage.frame(115,true,1,view,.5);const person=stage.people.find(p=>p.id===view)!;expect(person.root.visible).toBe(true);for(const [j,p]of stage.people.entries()){if(!p.track)continue;expect(updates[j].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(p.track.message(p.track.indexAt(115)).t.artic));}let count=0,inside=true;person.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);}
  }
  stage.frame(115,true,1,'christof',.5);expect(stage.monitor.visible).toBe(false);
  stage.frame(115,true,1,'control-monitor',.5);expect(stage.monitor.visible).toBe(true);expect(stage.monitorHead.scene.visible).toBe(true);expect(stage.people.every(p=>!p.root.visible)).toBe(true);
  stage.frame(performanceTime(301.5),true,2,'control-monitor',0);expect(stage.monitor.visible).toBe(true);expect(stage.monitorHead.scene.visible).toBe(false);expect(stage.monitorPicture.group.children.length).toBeGreaterThan(0);
  stage.frame(scene.duration,false,2,'broadcast-end',0);expect(Object.values(stage.sets).every(s=>!s.visible)).toBe(true);expect((stage.scene.background as THREE.Color).getHex()).toBe(0);
  for(const source of [0,38,56,65,115,253,264,285,301]){const t=performanceTime(source);stage.frame(t,true,3,'wide',.5);const before=motion();stage.frame(t,false,3,'wide',0);expect(motion()).toEqual(before);stage.frame(scene.duration,true,4,'christof',0);stage.frame(t,true,5,'wide',0);expect(motion()).toEqual(before);}
 }finally{updates.forEach(u=>u.mockRestore());let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());for(const p of stage.people)expect(p.hair.group.parent).toBeNull();}
});
