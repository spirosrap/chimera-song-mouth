import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {MOVIE_SCENES,movieScene} from '../src/scene/library.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {validPerformance} from '../src/band/performance.ts';
import {helloPose,helloPlace,type HelloId} from '../src/scene/hello.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {HelloStage}=await import('../src/ui/render/hello.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/hello/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
function track(n:string){const b=gunzipSync(file(n+'.tele.gz'));return new TeleTrack(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
test('Hello adds the complete source video, lesson, singing and final portrait conversation',()=>{
 const i=MOVIE_SCENES.findIndex(s=>s.id==='hello');expect(MOVIE_SCENES[i]).toBe(movieScene('hello')!);expect(MOVIE_SCENES[i-1].id).toBe('always-love-you');expect(scene.setting).toBe('hello');expect(scene.duration).toBeCloseTo(326.474263,4);expect(scene.characters.map(c=>c.id)).toEqual(['lionel','hello-lisa','hello-student','hello-messenger']);expect(score.parts.map(p=>p.id)).toEqual(['lead','lisa','student','messenger','backing']);expect(scene.cues[0].start).toBeLessThan(17);expect(scene.cues.at(-1)!.end).toBeGreaterThan(319);expect(file('mix.mp3').length).toBeGreaterThan(10_000_000);expect(()=>validateScene({...scene,shots:[{time:0,view:'always-airport'}]})).toThrow();
});
test('all four voices use complete physical phrases, with singing and spoken turns sharing the source clock',()=>{
 for(const p of score.parts.slice(0,4)){expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(p.voice!.drift).toBe(0);expect(p.effects).toBeUndefined();expect(planPart(p).every(g=>Number.isFinite(g.t0)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);}
 const lead=score.parts[0].performance!;expect(lead.phrases[0].start).toBeLessThan(17);expect(lead.phrases.at(-1)!.start).toBeGreaterThan(310);expect(score.parts[0].melody!.notes.length).toBeGreaterThan(300);expect(score.parts[4].recordingType).toBe('instrumental');expect(new Set(score.parts.slice(0,4).map(p=>p.body.female)).size).toBe(4);
});
test('the full four-track telemetry has one clock and silent people stay silent during the approved chorus',()=>{
 for(const name of ['lead','lisa','student','messenger']){const t=track(name);expect(Math.abs(t.duration-scene.duration)).toBeLessThan(.051);for(const at of [0,60,110,230,320])expect(t.message(t.indexAt(at)).t.clock).toBeCloseTo(at,4);if(name!=='lead')expect(t.message(t.indexAt(110)).t.gate).toBeLessThan(.01);else expect(t.message(t.indexAt(110)).t.outRms).toBeGreaterThan(.001);}
 expect(sceneCamera(scene,295,'auto')).toBe('hello-sculpture');expect(sceneCamera(scene,317,'auto')).toBe('lionel');
});
test('the full school story and face-touch restore on seeks without disposing any borrowed model',()=>{
 const cast=scene.characters.map(c=>{const t=track(c.tele.replace('.tele',''));return{id:c.id as HelloId,track:t,model:new VoiceModel(t.body,t.sampleRate)};}),s=new HelloStage(cast),spies=cast.map(c=>spyOn(c.model,'dispose'));s.resize(375,430);s.frame(307,true,1,'hello-sculpture',.7);const a=s.people.find(p=>p.id==='hello-lisa')!.group.position.toArray();expect(s.bust.visible).toBe(true);s.frame(105,false,2,'wide',.5);expect(s.rooms.corridor.visible).toBe(true);expect(s.bust.visible).toBe(false);s.frame(307,true,3,'hello-sculpture',.7);expect(s.people.find(p=>p.id==='hello-lisa')!.group.position.toArray()).toEqual(a);
 for(const [time,place]of [[25,'classroom'],[105,'corridor'],[135,'studio'],[165,'dance'],[225,'bedroom'],[255,'piano'],[295,'reveal']]as const){expect(helloPose(time).place).toBe(place);expect(helloPlace('wide',time)).toBe(place);s.frame(time,false,4,'wide',.5);expect(s.rooms[place].visible).toBe(true);expect(s.camera.position.toArray().every(Number.isFinite)).toBe(true);}
 s.frame(65,false,5,'lionel',.5);expect(s.people[0].group.position.y).toBe(110);s.frame(195,true,6,'wide',.5);expect(s.people.find(p=>p.id==='hello-student')!.group.visible).toBe(true);s.frame(110,true,7,'lionel',.5);const focus=new THREE.Vector3(0,167,20).project(s.camera);expect(Math.abs(focus.x)).toBeLessThan(.01);expect(Math.abs(focus.y)).toBeLessThan(.01);s.dispose();for(const spy of spies){expect(spy).not.toHaveBeenCalled();spy.mockRestore();}cast.forEach(c=>c.model.dispose());
});
