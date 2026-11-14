import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {BOYZ_IDS,boyzPose,boyzPlace} from '../src/scene/boyz.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {BoyzStage}=await import('../src/ui/render/boyz.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/ill-make-love-to-you/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const dialogue:{voices:Record<string,{gestures:{t0:number;t1:number;targets:Record<string,number>}[];lines:{start:number;end:number;text:string}[]}>}=JSON.parse(file('dialogue.json').toString());
const names=['lead','tenor','baritone','bass','dwayne','sparks'];
const tracks=names.map(name=>{const raw=gunzipSync(file(name+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const stageFixture=()=>{const people=BOYZ_IDS.map((id,i)=>({id,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)}));return{people,stage:new BoyzStage(people)};};
test('the full Boyz II Men video retains the spoken opening, song, story ending and six required mouths',()=>{
 expect(movieScene('ill-make-love-to-you')).toBeDefined();expect(scene.setting).toBe('boyz');expect(scene.duration).toBeCloseTo(260.367052,5);expect(scene.characters.map(c=>c.id)).toEqual(BOYZ_IDS);expect(scene.cues[0].start).toBeLessThan(2);expect(scene.cues.at(-1)!.end).toBeGreaterThan(250);expect(scene.shots.length).toBe(37);expect(scene.cues.length).toBe(59);expect(file('mix.mp3').length).toBeGreaterThan(8_000_000);
 expect(sceneCamera(scene,13,'auto')).toBe('boyz-keypad');expect(sceneCamera(scene,257,'auto')).toBe('boyz-letter');expect(()=>validateScene({...scene,characters:scene.characters.slice(0,4)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'titanic-bow'}]})).toThrow('camera');
});
test('all six voices use audible complete physical phrases and the three harmonies have independent pitch paths',()=>{
 const counts=[337,212,212,212];for(let i=0;i<6;i++){const part=score.parts[i],track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(part.voice!.drift).toBe(0);let windows:{start:number;end:number}[];
  if(i<4){const p=part.performance!;expect(validPerformance(p,score.duration)).toBe(true);expect(part.melody!.notes.length).toBe(counts[i]);windows=p.phrases.map(ph=>({start:ph.start,end:ph.start+ph.phones.reduce((s,c)=>s+c.duration,0)}));}
  else{const native=dialogue.voices[part.id];expect(part.performance).toBeUndefined();expect(native.gestures.length).toBeGreaterThan(100);expect(part.speech!.length).toBe(native.lines.length);for(const g of native.gestures){expect([g.t0,g.t1,...Object.values(g.targets)].every(Number.isFinite)).toBe(true);expect(g.t1).toBeGreaterThanOrEqual(g.t0);}windows=native.lines;}
  for(const ph of windows){let peak=0;for(let f=track.indexAt(ph.start);f<=track.indexAt(ph.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.0001);}}
 expect(score.parts[6].recordingType).toBe('instrumental');const hz=score.parts.slice(0,4).map(p=>p.performance!.contour.find(c=>c.time>=96)!.hz);expect(new Set(hz.map(h=>Math.round(69+12*Math.log2(h/440)))).size).toBeGreaterThanOrEqual(3);expect(hz[3]).toBeLessThan(hz[0]);
 for(const track of tracks.slice(0,4)){let peak=0;for(let i=track.indexAt(89);i<track.indexAt(113);i++)peak=Math.max(peak,track.message(i).t.outRms);expect(peak).toBeGreaterThan(.02);}
});
test('the dialogue and group telemetry share exact source time and return to silence in their rests',()=>{
 for(const[n,track]of tracks.entries()){expect(track.duration).toBeCloseTo(scene.duration,1);expect(track.frames).toBe(5208);for(let i=0;i<track.frames;i++){const t=track.message(i).t,time=i/20;expect(t.clock).toBeCloseTo(time,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(time<.5||time>255||n>=4&&time>45||n===0&&time<46||n>0&&n<4&&time<87)expect(t.outRms).toBeLessThan(.00001);}}
});
test('the six rooms, keypad hand, writing pen, choir, robe and letter restore on absolute-time seeks',()=>{
 const{people,stage}=stageFixture();try{
  for(const[time,place,view]of [[4,'foyer','boyz-foyer'],[13,'foyer','boyz-keypad'],[60,'study','boyz-study'],[76,'stage','boyz-stage'],[108,'blue','boyz-blue'],[174,'vanity','boyz-vanity'],[235,'letter','boyz-letter'],[93,'study','boyz-dissolve']]as const){
   stage.frame(time,true,1,view,.7);expect(boyzPlace(view,time)).toBe(place);expect(stage.rooms[place].visible).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);const snap=()=>[...BOYZ_IDS.flatMap(id=>[...stage.actors[id].root.matrixWorld.elements,...stage.actors[id].body.figures.flatMap(f=>f.hands.flatMap(h=>h.position.toArray()))]),...stage.heldLetter.matrixWorld.elements,...stage.pen.matrixWorld.elements],before=snap();stage.frame(251,false,2,'sparks',0);stage.frame(13,false,3,'boyz-keypad',0);stage.frame(time,false,4,view,0);expect(snap()).toEqual(before);
  }
  expect(boyzPose(NaN)).toEqual(boyzPose(0));stage.frame(13,false,5,'boyz-keypad',0);const hand=stage.actors.dwayne.body.figures[0].hands[1].getWorldPosition(new THREE.Vector3());expect(hand.distanceTo(stage.keypad.position)).toBeLessThan(12);stage.frame(60,false,6,'boyz-study',0);expect(stage.pen.visible).toBe(true);stage.frame(76,false,7,'boyz-stage',0);expect(BOYZ_IDS.slice(0,4).every(id=>stage.actors[id].root.visible)).toBe(true);stage.frame(174,false,8,'boyz-vanity',0);expect(stage.perfume.visible).toBe(true);stage.frame(235,false,9,'boyz-letter',0);expect(stage.heldLetter.visible).toBe(true);expect(stage.perfume.visible).toBe(false);expect(stage.heldLetter.position.y+57*.82/2).toBeLessThan(0);
 }finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('all six retained mouths fit the 4:3 aperture and portrait views without releasing their voice models',()=>{
 const{people,stage}=stageFixture();try{for(const[w,h]of [[1280,720],[375,430]])for(const[id,time]of [['boyz-lead',83],['boyz-tenor',76],['boyz-baritone',193],['boyz-bass',225],['dwayne',13],['dwayne',60],['sparks',251]]as const){
  stage.resize(w,h);stage.frame(time,true,1,id,.7);let count=0,inside=true;const aperture=Math.min(1,(4/3)/(w/h));stage.actors[id].head.scene.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(stage.camera);count++;inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<aperture&&Math.abs(p.y)<.99&&Math.abs(p.z)<1;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);expect(stage.bars.every(b=>b.visible)).toBe(w/h>4/3);
 }}finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).not.toHaveBeenCalled();dispose.mockRestore();people.forEach(p=>p.model.dispose());}
});
