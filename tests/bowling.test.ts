import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {bowlingPose,bowlingCamera} from '../src/scene/bowling.ts';
import {BOWLING_TIMELINE,bowlingSourceTime} from '../src/scene/bowling-timing.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {BowlingAlley}=await import('../src/ui/render/bowling.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/big-lebowski/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance&{sourceTimeline:readonly (readonly [number,number])[]}=JSON.parse(file('performance.json').toString());
const ids=['dude','walter','donny','jesus'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const performanceTime=(source:number)=>{let i=0;while(i<BOWLING_TIMELINE.length-2&&BOWLING_TIMELINE[i+1][0]<source)i++;const [s0,t0]=BOWLING_TIMELINE[i],[s1,t1]=BOWLING_TIMELINE[i+1];return t0+(t1-t0)*(source-s0)/(s1-s0);};

test('The Big Lebowski retains the entire movie excerpt and four dialogue roles',()=>{
 expect(movieScene('big-lebowski')).toBeDefined();expect(scene.setting).toBe('bowling');expect(scene.duration).toBeCloseTo(264.65,3);
 expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(scene.cues).toHaveLength(79);expect(score.lines.flatMap(l=>l.words)).toHaveLength(452);
 for(const t of [0,20,50,80,92])expect(sceneCue(scene,t)).toBeUndefined();
 expect(scene.cues.some(c=>c.speaker==='dude'&&c.text.includes('your opinion'))).toBe(true);
 expect(scene.cues.some(c=>c.speaker==='jesus'&&c.text.includes('pendejo'))).toBe(true);
 for(let i=1;i<scene.cues.length;i++)expect(scene.cues[i].start).toBeGreaterThan(scene.cues[i-1].end);
 expect(scene.cues.at(-1)?.text).toBe('Eight-year-olds, dude.');
 expect(sceneCamera(scene,115,'auto')).toBe('bowling-flashback');expect(sceneCamera(scene,47,'auto')).toBe('bowling-lane');expect(sceneCamera(scene,performanceTime(228),'auto')).toBe('bowling-pair');
 expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(file('backing.mp3').length).toBeGreaterThan(8_000_000);
 expect(()=>validateScene({...scene,setting:'ward'})).toThrow();expect(()=>validateScene({...scene,characters:scene.characters.slice(0,3)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'neo'}]})).toThrow('camera');
});
test('all four mouths speak without overlapping turns and preserve their physical score',()=>{
 expect(score.parts).toHaveLength(4);expect(new Set(score.parts.map(p=>p.voice?.pressure))).toHaveProperty('size',4);
 for(const [i,line]of score.lines.entries()){
  expect(line.segments.filter(s=>s.wordEnd)).toHaveLength(line.words.length);
  // The first preview's extended phrases spoke over replies. Each rendered turn now has its own gap.
  if(i>0)expect(line.start-score.lines[i-1].end).toBeGreaterThanOrEqual(.1599);
  const track=tracks[ids.indexOf(line.speaker as typeof ids[number])];let rms=0;for(let f=track.indexAt(line.start);f<=track.indexAt(line.end);f++)rms=Math.max(rms,track.message(f).t.outRms);expect(rms).toBeGreaterThan(.001);
 }
 for(const [i,part]of score.parts.entries()){
  expect(part.kind).toBe('voice');expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();
  const plan=planDialoguePart(score,part.id);expect(plan.length).toBeGreaterThan(250);expect(plan.some(g=>g.targets.lipAp!==undefined&&g.targets.lipAp<0)).toBe(true);
  const track=tracks[i];expect(track.duration).toBeCloseTo(scene.duration,1);
  for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,4);
  for(const t of [0,20,50,80,92]){const m=track.message(track.indexAt(t)).t;expect(m.outRms).toBeLessThan(.00001);expect(m.gate).toBeLessThan(.01);}
 }
 const middle=(id:string)=>{const v=score.lines.filter(l=>l.speaker===id).map(l=>l.pitch).sort((a,b)=>a-b);return v[Math.floor(v.length/2)];};
 expect(middle('donny')-middle('walter')).toBeGreaterThan(100);expect(middle('jesus')-middle('dude')).toBeGreaterThan(20);
 expect(new Set(score.parts.map(p=>JSON.stringify(p.body))).size).toBe(4);
 const jesus=score.lines.filter(l=>l.speaker==='jesus');expect(jesus.every(l=>(l.pitchContour?.length??0)>1)).toBe(true);
 const pitches=planDialoguePart(score,'jesus').flatMap(g=>g.targets.f0===undefined?[]:[g.targets.f0]);expect(Math.max(...pitches)-Math.min(...pitches)).toBeGreaterThan(60);
 expect(()=>planDialoguePart({...score,lines:[{...jesus[0],pitchContour:[{time:jesus[0].start,hz:NaN}]}]},'jesus')).toThrow('pitch contour');
 expect(score.sourceTimeline).toEqual(BOWLING_TIMELINE);
 for(const [source,time]of BOWLING_TIMELINE)expect(bowlingSourceTime(time)).toBeCloseTo(source,6);
 expect(bowlingSourceTime(NaN)).toBe(0);expect(bowlingSourceTime(1e6)).toBeCloseTo(scene.duration,3);
});
test('ball release, falling pins, flashback and beeper follow the same absolute clock',()=>{
 expect(bowlingPose(26).lick).toBe(1);expect(bowlingPose(40).ballVisible).toBe(true);
 expect(bowlingPose(44).ball[2]).toBeLessThan(bowlingPose(42).ball[2]-250);expect(bowlingPose(49).impact).toBe(1);expect(bowlingPose(52).ballVisible).toBe(false);
 expect(bowlingPose(55).dance).toBe(1);expect(bowlingPose(performanceTime(115)).flashback).toBe(true);expect(bowlingPose(performanceTime(122)).flashback).toBe(false);
 expect(bowlingPose(performanceTime(130)).beeper).toBe(1);expect(bowlingPose(performanceTime(220)).confront).toBe(1);expect(bowlingPose(NaN).t).toBe(0);
});
test('bowling framing, articulation and props survive pause and backward seeks without disposing borrowed models',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new BowlingAlley(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const motion=()=>{const out=[...stage.ballRoot.matrixWorld.elements];for(const group of [stage.pins.group,stage.people.find(p=>p.id==='jesus')!.body.group,...stage.people.map(p=>p.arms.group)])group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)out.push(a.getX(i),a.getY(i),a.getZ(i));});return out;};
 try{
  expect(stage.people.map(p=>p.id)).toEqual([...ids,'liam']);expect(stage.people[4].model).toBe(cast[1].model);expect(stage.people[4].track).toBeUndefined();
  for(const [w,h]of [[1280,720],[375,211],[375,430]]){
   stage.resize(w,h);for(const view of SCENE_SETTINGS.bowling.cameras){const c=bowlingCamera(view,w/h,140);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
   for(const [view,t]of [['dude',145],['walter',142],['donny',139],['jesus',230],['bowling-pair',140]] as const){
    stage.frame(t,true,1,view,.5);
    for(const [i,p]of stage.people.entries()){
     if(i<4)expect(updates[i].mock.calls.at(-1)![2]).toEqual(VoiceModel.articFromArray(tracks[i].message(tracks[i].indexAt(t)).t.artic));
     if(view!==p.id&&!(view==='bowling-pair'&&(p.id==='dude'||p.id==='walter')))continue;
     let n=0,inside=true;p.head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let j=0;j<m.geometry.instanceCount;j++){const v=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).project(stage.camera);n++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&Math.abs(v.z)<1;}});expect(n).toBeGreaterThan(1000);expect(inside).toBe(true);
    }
   }
   for(const t of [25,43,47]){stage.frame(t,true,1,t<41.8?'bowling-ball':'bowling-lane',0);const v=stage.ballRoot.position.clone().project(stage.camera);expect(Math.abs(v.x)).toBeLessThan(.1);expect(Math.abs(v.y)).toBeLessThan(.1);expect(v.z).toBeLessThan(1);}
  }
  stage.frame(performanceTime(115),true,2,'bowling-flashback',0);expect(stage.flashback.group.visible).toBe(true);expect(stage.room.group.visible).toBe(false);expect(stage.people.filter(p=>p.root.visible).map(p=>p.id)).toEqual(['jesus']);
  stage.frame(130,true,3,'bowling-pair',0);expect(stage.flashback.group.visible).toBe(false);expect(stage.room.group.visible).toBe(true);expect(stage.people.every(p=>p.root.visible)).toBe(true);
  for(const t of [0,26,40,48,55,115,130,145,230,259]){stage.frame(t,true,4,'wide',.5);const before=motion();stage.frame(t,false,4,'wide',0);expect(motion()).toEqual(before);stage.frame(264,true,5,'wide',0);stage.frame(t,true,6,'wide',0);expect(motion()).toEqual(before);}
 }finally{
  updates.forEach(u=>u.mockRestore());let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();expect(released).toBe(meshes);cast.forEach(p=>p.model.dispose());for(const p of stage.people)expect(p.hair.group.parent).toBeNull();
 }
});
