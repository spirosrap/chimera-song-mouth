import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,sceneCue,type CameraView,type SceneFile} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {THRONE_AXE,THRONE_CRASH,THRONE_DEMO,THRONE_PEOPLE,THRONE_ROAR,THRONE_SCREEN,THRONE_SCREEN_HEIGHT,throneCamera,thronePose,throneYaw,type ThroneSpeaker} from '../src/scene/throne.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {ThroneRoom}=await import('../src/ui/render/throne.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/wizard-of-oz/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const ids=['oz','dorothy','scarecrow','tin-woodman','lion'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength) as ArrayBuffer);});
const VIEWS=['wide','throne-head','throne-row',...ids] as CameraView[];

test('the throne room is a scene of five voices, and only it may hold five',()=>{
 expect(movieScene('wizard-of-oz')?.readyVideo).toBeUndefined();expect(scene.setting).toBe('throne');
 expect(scene.characters.map(c=>c.id)).toEqual([...ids]);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,4)})).toThrow('missing');
 expect(()=>validateScene({...scene,setting:'ward'})).toThrow('incomplete');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'hal'}]})).toThrow('camera');
 const court:SceneFile={...scene,setting:undefined};expect(()=>validateScene(court)).toThrow('incomplete');
 expect(sceneCamera(scene,0,'auto')).toBe('wide');expect(sceneCamera(scene,5,'auto')).toBe('throne-head');
 expect(sceneCamera(scene,THRONE_ROAR+.5,'auto')).toBe('lion');expect(sceneCamera(scene,THRONE_CRASH,'auto')).toBe('oz');
 expect(sceneCamera(scene,THRONE_AXE+.5,'auto')).toBe('tin-woodman');expect(sceneCamera(scene,THRONE_DEMO[0]+1,'auto')).toBe('throne-head');
});

test('the screen stands until the roar, falls clear of the travellers, and a backwards seek stands it up again',()=>{
 expect(thronePose(THRONE_ROAR).fall).toBe(0);expect(thronePose(THRONE_CRASH).fall).toBe(1);expect(thronePose(THRONE_ROAR).power).toBe(1);expect(thronePose(THRONE_CRASH+1).power).toBe(0);
 let last=0;for(let t=THRONE_ROAR;t<=THRONE_CRASH;t+=.05){const f=thronePose(t).fall;expect(f).toBeGreaterThanOrEqual(last);last=f;}
 for(const id of ids.slice(1)){const p=THRONE_PEOPLE[id].position;expect(Math.hypot(p[0]-THRONE_SCREEN[0],p[2]-THRONE_SCREEN[2])).toBeGreaterThan(THRONE_SCREEN_HEIGHT+20);}
 // The little man is hidden: shorter than the screen, and behind it as seen from the row.
 expect(THRONE_PEOPLE.oz.position[1]+12).toBeLessThan(THRONE_SCREEN_HEIGHT);
 const late=thronePose(150);thronePose(10);expect(thronePose(150)).toEqual(late);expect(thronePose(NaN)).toEqual(thronePose(0));
 expect(thronePose(10).turn).toBe(0);expect(late.turn).toBe(1);expect(throneYaw('dorothy',10)).toBeCloseTo(Math.PI,6);expect(throneYaw('oz',10)).toBe(throneYaw('oz',150));
 expect(thronePose(THRONE_AXE+1).axe).toBe(1);expect(thronePose(THRONE_AXE+8).axe).toBe(0);expect(thronePose((THRONE_DEMO[0]+THRONE_DEMO[1])/2).demo).toBe(1);expect(thronePose(THRONE_DEMO[1]+1).demo).toBe(0);
 // Toto leaves Dorothy's feet on the roar and is at the screen when it goes.
 const d=THRONE_PEOPLE.dorothy.position,dog=(t:number)=>thronePose(t).toto;
 expect(Math.hypot(dog(5)[0]-d[0],dog(5)[2]-d[2])).toBeLessThan(30);expect(Math.hypot(dog(THRONE_ROAR+1.5)[0]-THRONE_SCREEN[0],dog(THRONE_ROAR+1.5)[2]-THRONE_SCREEN[2])).toBeLessThan(30);
 for(const view of VIEWS)for(const aspect of [16/9,.7])for(const t of [5,THRONE_CRASH,150]){const c=throneCamera(view,aspect,t);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);}
});

test('the prepared scene is complete: ordered captions, every line audible on its own mouth, clocks on the scene',()=>{
 scene.cues.forEach((c,i)=>{if(i)expect(c.start).toBeGreaterThanOrEqual(scene.cues[i-1].end);});
 expect(scene.cues.at(-1)!.text).toContain('very bad Wizard');expect(scene.cues.at(-1)!.end).toBeLessThan(scene.duration-3);expect(sceneCue(scene,scene.duration-1)).toBeUndefined();
 expect(scene.cues.filter(c=>c.speaker==='lion'&&c.start===THRONE_ROAR)).toHaveLength(1);
 expect(file('mix.mp3').length).toBeGreaterThan(3_000_000);
 for(const [i,id] of ids.entries()){
  const track=tracks[i];expect(Math.abs(track.duration-scene.duration)).toBeLessThan(.1);
  for(const c of scene.cues.filter(q=>q.speaker===id)){let peak=0;for(let f=track.indexAt(c.start);f<=track.indexAt(Math.min(c.end,c.start+4));f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.003);}
  for(let f=0;f<track.frames;f+=7)expect(track.message(f).t.clock).toBeCloseTo(f/20,2);
  expect(track.message(track.indexAt(scene.duration-.5)).t.outRms).toBeLessThan(.002);
 }
});

test('the Voice and the little man say the same sentence in one throat, the Voice far lower and slower',()=>{
 const same=scene.cues.filter(c=>c.text==='I am Oz, the Great and Terrible.'||c.text.startsWith('I am Oz, the Great and Terrible. Why'));
 expect(same).toHaveLength(2);expect(same[0].start).toBeLessThan(THRONE_ROAR);expect(same[1].start).toBeGreaterThan(THRONE_CRASH);
 const oz=tracks[0],pitch=(a:number,b:number)=>{const v:number[]=[];for(let t=a;t<b;t+=.05){const m=oz.message(oz.indexAt(t)).t;if(m.voicing>.5&&m.outRms>.003)v.push(m.f0);}expect(v.length).toBeGreaterThan(8);return v.sort((x,y)=>x-y)[Math.floor(v.length/2)];};
 const great=pitch(same[0].start,same[0].start+3.5),man=pitch(same[1].start,same[1].end);
 expect(great).toBeLessThan(95);expect(man).toBeGreaterThan(150);expect(man/great).toBeGreaterThan(2);
 // One body throughout: the enlargement is in the clock, not in a second voice.
 expect(oz.body.female).toBeCloseTo(.3,6);expect(oz.body.child).toBeCloseTo(.1,6);
 // The shaken Voice has already lost some of its size.
 const shaken=scene.cues.find(c=>c.text.startsWith('Is the Wicked Witch really'))!;expect(pitch(shaken.start,shaken.end)).toBeGreaterThan(great*1.15);
});

test('every camera frames its subject, the Head speaks only with the Voice or the thread, and seeks restore the room',()=>{
 const cast=ids.map((id,i)=>({id:id as ThroneSpeaker,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),room=new ThroneRoom(cast);
 try{
  expect(room.people.map(p=>p.id)).toEqual([...ids]);
  for(const t of [5,THRONE_CRASH+3,150,5])for(const view of VIEWS){
   room.resize(1280,720);room.frame(t,true,t,view,.5);expect(room.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
   const person=room.people.find(p=>p.id===view);
   if(person){const point=person.root.getWorldPosition(new THREE.Vector3());point.y+=4;point.project(room.camera);expect(Math.abs(point.x)).toBeLessThan(.3);expect(Math.abs(point.y)).toBeLessThan(.45);expect(point.z).toBeLessThan(1);}
   if(view==='wide')for(const p of room.people){const point=p.root.getWorldPosition(new THREE.Vector3()).project(room.camera);expect(Math.abs(point.x)).toBeLessThan(.95);expect(Math.abs(point.y)).toBeLessThan(.95);}
  }
  // Feet on the floor, whatever the figure's size.
  room.frame(5,false,1,'wide',0);
  for(const p of room.people){let lowest=Infinity;p.clothes.group.traverseVisible(o=>{const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=mesh.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<mesh.geometry.instanceCount;i++)lowest=Math.min(lowest,new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).y);});expect(lowest).toBeCloseTo(0,3);}
  const jaw=()=>room.greatHead.children.filter(c=>c.visible).map(c=>c.position.y),drop=(t:number)=>{room.frame(t,true,t,'throne-head',0);return Math.min(...jaw());};
  const speaking=scene.cues.find(c=>c.speaker==='oz')!;let deepest=0;for(let t=speaking.start;t<speaking.start+3;t+=.05)deepest=Math.min(deepest,drop(t));
  expect(deepest).toBeLessThan(-3);expect(drop(1)).toBeCloseTo(0,5);
  // After the crash the little man's speech no longer moves it; the thread does.
  const later=scene.cues.find(c=>c.speaker==='oz'&&c.start>THRONE_CRASH+20&&c.end<THRONE_DEMO[0]-8)!;for(let t=later.start;t<later.end;t+=.1)expect(drop(t)).toBeCloseTo(0,5);
  let pulled=0;for(let t=THRONE_DEMO[0];t<THRONE_DEMO[1];t+=.05)pulled=Math.min(pulled,drop(t));expect(pulled).toBeLessThan(-8);
  room.frame(150,false,2,'wide',0);const flat=room.screen.group.rotation.x;room.frame(5,false,3,'wide',0);expect(room.screen.group.rotation.x).toBe(0);
  room.frame(150,false,4,'wide',0);expect(room.screen.group.rotation.x).toBe(flat);expect(flat).toBeGreaterThan(1.5);
 }finally{room.dispose();cast.forEach(c=>c.model.dispose());}
});
