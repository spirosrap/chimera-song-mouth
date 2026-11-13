import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {MOVIE_SCENES,movieScene} from '../src/scene/library.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {validPerformance} from '../src/band/performance.ts';
import {alwaysPose,alwaysPlace} from '../src/scene/always-love-you.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {AlwaysStage}=await import('../src/ui/render/always-love-you.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {planPart}=await import('../src/band/planning.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/always-love-you/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
function track(){const b=gunzipSync(file('lead.tele.gz'));return new TeleTrack(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
test('Whitney appends the full supplied video, unaccompanied opening and complete final vocal run',()=>{
 const i=MOVIE_SCENES.findIndex(s=>s.id==='always-love-you');expect(MOVIE_SCENES[i]!).toBe(movieScene('always-love-you')!);expect(MOVIE_SCENES[i-1]!.id).toBe('je-taime');expect(scene.setting).toBe('bodyguard');expect(scene.duration).toBeCloseTo(274.391905,5);expect(scene.characters.map(c=>c.id)).toEqual(['whitney']);expect(score.parts.map(p=>p.id)).toEqual(['lead','backing']);expect(scene.cues[0].start).toBeGreaterThan(2);expect(scene.cues[0].start).toBeLessThan(3);expect(scene.cues.at(-1)!.end).toBeGreaterThan(269.5);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);expect(()=>validateScene({...scene,shots:[{time:0,view:'jetaime-copies'}]})).toThrow();
});
test('the whole lead uses physical phones and continuous source pitch, including long final held vowels',()=>{
 const p=score.parts[0],ph=p.performance!.phrases;expect(validPerformance(p.performance!,score.duration)).toBe(true);expect(p.melody!.notes.length).toBe(168);expect(ph[0].start).toBeLessThan(3);expect(ph.at(-1)!.start+ph.at(-1)!.phones.reduce((a,c)=>a+c.duration,0)).toBeGreaterThan(269.5);expect(ph.every(g=>g.phones.every(c=>c.duration<=10))).toBe(true);expect(ph.at(-1)!.phones.filter(c=>c.ipa==='u').length).toBeGreaterThanOrEqual(2);expect(p.performance!.contour.some(c=>c.time>267&&c.hz>590)).toBe(true);expect(p.voice!.drift).toBe(0);expect(p.effects).toBeUndefined();expect(planPart(p).every(g=>Number.isFinite(g.t0)&&g.t1>=g.t0&&g.t1<scene.duration)).toBe(true);expect(score.parts[1].recordingType).toBe('instrumental');
});
test('full physical telemetry stays on the audio clock through the quiet instrumental and final melisma',()=>{
 const t=track();expect(Math.abs(t.duration-scene.duration)).toBeLessThan(.051);expect(t.body.female).toBeCloseTo(.82,5);for(const time of [0,1,140,272])expect(t.message(t.indexAt(time)).t.gate).toBeLessThan(.01);for(const time of [0,60,130,230,273])expect(t.message(t.indexAt(time)).t.clock).toBeCloseTo(time,4);for(const [a,b]of [[3,9],[48,54],[194,199],[263,269]])expect(Math.max(...Array.from({length:12},(_,i)=>t.message(t.indexAt(a+(b-a)*i/12)).t.outRms))).toBeGreaterThan(.001);expect(sceneCamera(scene,230,'auto')).toBe('always-airport');
});
test('the film locations, seated posture and airplane farewell restore on seeks without owning the voice model',()=>{
 const t=track(),m=new VoiceModel(t.body,t.sampleRate),s=new AlwaysStage(m,t),drop=spyOn(m,'dispose');s.resize(375,430);s.frame(230,true,1,'wide',.9);expect(s.planeGroup.visible).toBe(true);const a=s.planeGroup.position.toArray();s.frame(100,false,2,'wide',.4);expect(s.rooms.lounge.visible).toBe(true);expect(s.singer.position.y).toBe(110);expect(s.planeGroup.visible).toBe(false);s.frame(230,true,3,'wide',.9);expect(s.planeGroup.position.toArray()).toEqual(a);for(const [time,place]of [[5,'microphone'],[45,'theatre'],[70,'dance'],[100,'lounge'],[165,'cabin'],[195,'snow'],[235,'airport']]as const){expect(alwaysPose(time).place).toBe(place);expect(alwaysPlace('wide',time)).toBe(place);s.frame(time,false,4,'wide',.5);expect(s.rooms[place].visible).toBe(true);expect(s.camera.position.toArray().every(Number.isFinite)).toBe(true);}s.frame(230,true,5,'whitney',.8);expect(s.singer.visible).toBe(true);const focus=new THREE.Vector3(0,159,30).project(s.camera);expect(Math.abs(focus.x)).toBeLessThan(.01);expect(Math.abs(focus.y)).toBeLessThan(.01);s.dispose();expect(drop).not.toHaveBeenCalled();drop.mockRestore();m.dispose();
});
