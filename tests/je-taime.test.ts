import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {MOVIE_SCENES,movieScene} from '../src/scene/library.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {validPerformance} from '../src/band/performance.ts';
import {jeTaimePose} from '../src/scene/je-taime.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {JeTaimeStage}=await import('../src/ui/render/je-taime.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/je-taime/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
function track(){const b=gunzipSync(file('lead.tele.gz'));return new TeleTrack(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
test('Je t’aime appends the full supplied studio edit, leader and ending with one physical French voice',()=>{
 const i=MOVIE_SCENES.findIndex(s=>s.id==='je-taime');expect(MOVIE_SCENES[i]!).toBe(movieScene('je-taime')!);expect(MOVIE_SCENES[i-1]!.id).toBe('fade-into-you');
 expect(scene.setting).toBe('jetaime');expect(scene.duration).toBeCloseTo(300.444694,5);expect(scene.characters.map(c=>c.id)).toEqual(['lara']);expect(score.parts.map(p=>p.id)).toEqual(['lead','backing']);expect(scene.cues[0].start).toBeGreaterThan(49);expect(scene.cues.at(-1)!.end).toBeGreaterThan(280);expect(file('mix.mp3').length).toBeGreaterThan(9_000_000);expect(()=>validateScene({...scene,shots:[{time:0,view:'fade-stage'}]})).toThrow();
});
test('the complete French score keeps native nasal vowels, rounded vowels and consonants in the physical planner',()=>{
 const p=score.parts[0];expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(p.melody!.notes.length).toBe(288);const phones=p.performance!.phrases.flatMap(ph=>ph.phones);expect(phones.some(ph=>ph.nasalized)).toBe(true);expect(phones.some(ph=>ph.ipa==='y')).toBe(true);expect(phones.some(ph=>ph.ipa==='ʁ')).toBe(true);expect(p.performance!.phrases.every(ph=>ph.start>49&&ph.phones.every(c=>c.duration<=10))).toBe(true);expect(p.voice!.drift).toBe(0);expect(p.effects).toBeUndefined();expect(planPart(p).every(g=>Number.isFinite(g.t0)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');
});
test('the one recorded airway retains the complete audio clock, silent leader and source-timed final phrase',()=>{
 const t=track();expect(Math.abs(t.duration-scene.duration)).toBeLessThan(.051);expect(t.body.female).toBeCloseTo(.82,5);for(const time of [0,15,40,295])expect(t.message(t.indexAt(time)).t.gate).toBeLessThan(.01);for(const time of [0,60,130,230,299])expect(t.message(t.indexAt(time)).t.clock).toBeCloseTo(time,4);for(const [a,b]of [[53,58],[115,124],[187,200],[276,283]])expect(Math.max(...Array.from({length:12},(_,i)=>t.message(t.indexAt(a+(b-a)*i/12)).t.outRms))).toBeGreaterThan(.001);expect(sceneCamera(scene,211,'auto')).toBe('jetaime-copies');
});
test('three visual copies share the retained model and restore the studio, gestures and portrait framing after seeks',()=>{
 const t=track(),m=new VoiceModel(t.body,t.sampleRate),s=new JeTaimeStage(m,t),drop=spyOn(m,'dispose');s.resize(375,430);s.frame(212,true,1,'wide',.9);expect(s.singers.map(g=>g.visible)).toEqual([true,true,true]);const a=s.singers.map(g=>g.position.toArray());s.frame(95,false,2,'wide',.4);expect(s.singers.map(g=>g.visible)).toEqual([true,false,false]);s.frame(212,true,3,'wide',.9);expect(s.singers.map(g=>g.position.toArray())).toEqual(a);expect(jeTaimePose(212)).toEqual(jeTaimePose(212));expect(jeTaimePose(0).fade).toBe(0);s.frame(212,true,4,'lara',.8);expect(s.singers.map(g=>g.visible)).toEqual([true,false,false]);const focus=new THREE.Vector3(0,159,30).project(s.camera);expect(Math.abs(focus.x)).toBeLessThan(.01);expect(Math.abs(focus.y)).toBeLessThan(.01);expect(s.camera.position.toArray().every(Number.isFinite)).toBe(true);s.dispose();expect(drop).not.toHaveBeenCalled();drop.mockRestore();m.dispose();
});
