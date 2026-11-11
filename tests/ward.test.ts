import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {wardPose,wardCamera,type WardSpeaker} from '../src/scene/ward.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {WardRoom}=await import('../src/ui/render/ward.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {NEUTRAL}=await import('../src/wasm/engine.ts');
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/cuckoos-nest/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const score:DialoguePerformance<WardSpeaker>=JSON.parse(file('performance.json').toString());
const ids=['mcmurphy','cheswick','billy','martini'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});

test('the full Cuckoo’s Nest clip includes the lead, hesitant replies and nurses’ closing shot',()=>{
 expect(movieScene('cuckoos-nest')).toBeDefined();expect(scene.setting).toBe('ward');
 expect(scene.duration).toBeGreaterThan(62.5);expect(scene.duration).toBeLessThan(62.6);
 expect(scene.characters.map(c=>c.id)).toEqual([...ids]);expect(scene.cues).toHaveLength(22);expect(score.lines.flatMap(l=>l.words)).toHaveLength(130);
 expect(file('mix.mp3').length).toBeGreaterThan(1_900_000);expect(file('backing.mp3').length).toBeGreaterThan(1_900_000);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,3)})).toThrow('missing');
 expect(()=>validateScene({...scene,setting:'matrix'})).toThrow('character');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'neo'}]})).toThrow('camera');
 expect(sceneCamera(scene,0,'auto')).toBe('ward-pair');expect(sceneCamera(scene,12,'auto')).toBe('ward-group');expect(sceneCamera(scene,21,'auto')).toBe('billy');
 expect(sceneCamera(scene,36,'auto')).toBe('ward-laughter');expect(sceneCamera(scene,57,'auto')).toBe('cheswick');expect(sceneCamera(scene,61,'auto')).toBe('ward-nurses');
 expect(sceneCamera(scene,61,'wide')).toBe('wide');expect(sceneCue(scene,61.9)).toBeUndefined();
});

test('short assent and Billy’s four repeated words remain audible on their original timeline',()=>{
 const billy=score.lines.find(l=>l.speaker==='billy')!;expect(billy.words.map(w=>w.text.toLowerCase().replace(/[,?.]/g,''))).toEqual(['no','no','no','no']);
 expect(billy.start).toBeGreaterThan(20.3);expect(billy.end).toBeLessThan(22.8);
 expect(sceneCue(scene,8.6)?.speaker).toBe('cheswick');expect(sceneCue(scene,48.9)?.speaker).toBe('martini');
 // The clearer closing line uses part of the final pause; sample silence after its physical release.
 for(const t of [0,1.8,10,14,16,62.2,62.4]){
  expect(sceneCue(scene,t)).toBeUndefined();for(const track of tracks){const msg=track.message(track.indexAt(t)).t;expect(msg.gate).toBeLessThan(.01);expect(msg.outRms).toBeLessThan(.00001);}
 }
});

test('all dialogue uses physical gestures with separate phrase releases and full-clock telemetry',()=>{
 for(const [i,id] of ids.entries()){
  const part=score.parts.find(p=>p.id===id)!,track=tracks[i],plan=planDialoguePart(score,id);
  expect(part.kind).toBe('voice');expect(part.recordingType).toBeUndefined();expect(part.effects).toBeUndefined();
  expect(plan.length).toBeGreaterThan(0);expect(plan.length).toBeLessThan(2000);
  expect(plan.some(g=>g.targets.velum!==undefined&&g.targets.velum>0)).toBe(true);
  expect(plan.some(g=>g.targets.f0!==undefined&&g.targets.f0>80)).toBe(true);
  expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.body.female).toBeCloseTo(part.body.female,6);expect(track.body.child).toBeCloseTo(part.body.child,6);
  for(const line of score.lines.filter(l=>l.speaker===id)){
   expect(line.segments.filter(s=>s.wordEnd)).toHaveLength(line.words.length);
   let peak=0;for(let f=track.indexAt(line.start);f<=track.indexAt(line.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.001);
  }
  for(let f=0;f<track.frames;f++)expect(track.message(f).t.clock).toBeCloseTo(f/20,4);
 }
 for(const [i,line] of score.lines.entries())if(score.lines[i+1])expect(line.end).toBeLessThanOrEqual(score.lines[i+1].start-.10);
});

test('Martini’s assent keeps sealed lips and an open nasal route through two rising hums',()=>{
 const line=score.lines.find(l=>l.speaker==='martini')!,track=tracks[3];
 expect(line.humming).toBe(true);
 for(let t=line.start+.08;t<line.end+.06;t+=.05){
  const state=track.message(track.indexAt(t)).t,artic=VoiceModel.articFromArray(state.artic);
  expect(artic.lipAp).toBeLessThan(-.1);expect(state.velumPort).toBeGreaterThan(.05);
 }
 const first=track.message(track.indexAt(line.start+.14)).t;
 const gap=track.message(track.indexAt(line.start+.34)).t;
 const second=track.message(track.indexAt(line.start+.49)).t;
 expect(first.outRms).toBeGreaterThan(.02);expect(second.outRms).toBeGreaterThan(.03);
 expect(gap.outRms).toBeLessThan(first.outRms*.25);expect(second.f0).toBeGreaterThan(first.f0*1.15);
});

test('gestures follow the hesitant reply, laughter, emphatic speech and withdrawn closing reaction',()=>{
 expect(wardPose(21.5).billyDown).toBe(1);expect(wardPose(28).billyDown).toBe(0);
 expect(wardPose(36).laugh).toBe(1);expect(wardPose(39).laugh).toBe(0);
 expect(wardPose(41).appeal).toBe(1);expect(wardPose(30).point).toBe(1);
 expect(wardPose(52).hideFace).toBe(0);expect(wardPose(58).hideFace).toBe(1);
 expect(wardPose(61).nurseLook).toBe(1);expect(wardPose(NaN)).toEqual(wardPose(0));
 for(const view of ['mcmurphy','cheswick','billy','martini','ward-pair','ward-group','ward-laughter','ward-nurses','wide'] as CameraView[])for(const aspect of [16/9,.87]){const c=wardCamera(view,aspect,30);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
});

test('all nine characters are framed in their cameras, with actual speaker motion and neutral listeners',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new WardRoom(cast),updates=stage.people.map(p=>spyOn(p.head,'update'));
 const views:[CameraView,number,string[]][]=[['mcmurphy',30,['mcmurphy']],['cheswick',57,['cheswick']],['billy',21,['billy']],['martini',49,['martini']],['ward-pair',5,['mcmurphy','cheswick']],['ward-group',12,['scanlon','billy','martini']],['ward-laughter',36,['harding','taber']],['ward-nurses',61,['ratched','pilbow']],['wide',30,stage.people.map(p=>p.id)]];
 try{
  expect(stage.people).toHaveLength(9);stage.frame(30,false,0,'wide',0);
  for(const p of stage.people){let lowest=Infinity;p.clothes.group.traverseVisible(o=>{const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)lowest=Math.min(lowest,new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).y);});expect(lowest).toBeCloseTo(0,5);}
  for(const [w,h] of [[1280,720],[375,211],[375,430]])for(const [view,t,framed] of views){
   stage.resize(w,h);stage.frame(t,true,1,view,.6);
   for(const [i,p] of stage.people.entries()){
    expect(updates[i].mock.calls.at(-1)![2]).toEqual(p.track?VoiceModel.articFromArray(p.track.message(p.track.indexAt(t)).t.artic):NEUTRAL);
    if(!framed.includes(p.id))continue;let count=0,inside=true;
    p.head.scene.traverseVisible(o=>{const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(!a)return;
     for(let k=0;k<mesh.geometry.instanceCount;k++){const v=new THREE.Vector3().fromBufferAttribute(a,k).applyMatrix4(mesh.matrixWorld).project(stage.camera);count++;inside&&=[v.x,v.y,v.z].every(Number.isFinite)&&Math.abs(v.x)<.99&&Math.abs(v.y)<.99&&v.z<1&&v.z>-1;}
    });expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
   }
  }
 }finally{updates.forEach(s=>s.mockRestore());stage.dispose();cast.forEach(p=>p.model.dispose());}
});

test('hands and reactions remain stable through pause/seek; only the owned nurse model is disposed',()=>{
 const cast=ids.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),stage=new WardRoom(cast);
 const movement=()=>{const values:number[]=[];for(const p of stage.people){values.push(...p.root.matrixWorld.elements,...p.head.scene.matrixWorld.elements);p.arms.group.traverseVisible(o=>{const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)values.push(a.getX(i),a.getY(i),a.getZ(i));});}return values;};
 try{for(const t of [5,8.6,21,30,36,49,57,61]){stage.frame(t,true,1,'wide',0);const before=movement();stage.frame(t,false,1,'wide',0);expect(movement()).toEqual(before);stage.frame(62,true,2,'wide',0);stage.frame(t,true,3,'wide',0);expect(movement()).toEqual(before);}}
 finally{
  let meshes=0,released=0;stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(1);dispose.mockRestore();expect(released).toBe(meshes);for(const p of stage.people)expect(p.hair.group.parent).toBeNull();cast.forEach(p=>p.model.dispose());
 }
});
