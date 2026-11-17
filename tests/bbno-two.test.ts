import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {TWO_SHOTS,twoPose,twoState,twoCamera} from '../src/scene/bbno-two.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {skippedIpa}=await import('../src/wasm/engine.ts');
const {TwoStage}=await import('../src/ui/render/bbno-two.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/bbno-two/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','low','high'].map(n=>{const raw=gunzipSync(file(n+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:(['two-lead','two-low','two-high']as const)[i],track,model:new VoiceModel(track.body,track.sampleRate)}));

test('two adds the complete supplied film, original music and three actual physical voices',()=>{
 expect(movieScene('bbno-two')).toHaveProperty('assetVersion','bbno-two-20261117');expect(movieScene('tailor-swif')).toBeDefined();
 expect(scene.setting).toBe('bbnotwo');expect(scene.duration).toBeCloseTo(137.323016,4);expect(scene.characters.map(c=>c.id)).toEqual(['two-lead','two-low','two-high']);expect(scene.shots.length).toBe(58);
 expect(score.parts.map(p=>p.kind)).toEqual(['voice','voice','voice','backing']);expect(score.parts[3].recordingType).toBe('instrumental');
 expect(score.parts[0].melody!.notes.length).toBe(550);expect(score.parts[0].performance!.phrases.length).toBe(64);expect(score.parts.slice(1,3).map(p=>p.melody!.notes.length)).toEqual([120,120]);
 for(const[t,v]of [[5,'two-pink-dance'],[10,'two-sauna'],[16,'two-excavator'],[28,'two-dentist'],[34,'two-wire'],[46,'two-truck'],[55,'two-football'],[66,'two-grass-above'],[79,'two-priest'],[87,'two-clones'],[96,'two-melon'],[99,'two-money'],[114,'two-dance-close'],[128,'two-clown-boat'],[130,'two-flex']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,2)})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'swif-fridge'}]})).toThrow('camera');
});

test('every prepared syllable uses supported physical phones and exact audio-clock mouth snapshots',()=>{
 for(const[i,part]of score.parts.slice(0,3).entries()){
  const perf=part.performance!,track=tracks[i];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(perf,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
  for(const ipa of new Set(perf.phrases.flatMap(ph=>ph.phones.map(p=>p.ipa))))expect(skippedIpa(ipa)).toEqual({unknown:[],noSound:[],ignoredMarks:[]});
  for(const ph of perf.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let rms=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)rms=Math.max(rms,track.message(j).t.outRms);expect(rms).toBeGreaterThan(.0001);}
  for(let j=0;j<track.frames;j++){const t=track.message(j).t,time=j/20;expect(t.clock).toBeCloseTo(time,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(!perf.phrases.some(ph=>time>=ph.start-.2&&time<=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0)+.45))expect(t.outRms).toBeLessThan(.00001);}
 }
 expect(score.parts[0].melody!.notes.map(n=>n.lyricIndex).sort((a,b)=>a!-b!)).toEqual(Array.from({length:550},(_,i)=>i));
 expect(score.parts[0].melody!.lyrics).not.toContain('Thanks for watching');expect(scene.cues.at(-1)!.end).toBeLessThan(132);
 expect(score.parts[1].performance!.phrases.some(p=>p.start>100)).toBe(true);expect(score.parts[2].performance!.phrases.some(p=>p.start>52&&p.start<68)).toBe(true);
});

test('the costumes and comedy props restore on seeks without releasing the three retained airways',()=>{
 expect(twoPose(NaN)).toEqual(twoPose(0));const people=cast(),stage=new TwoStage(people);
 const snap=()=>[...Object.values(stage.rooms).map(g=>g.visible),stage.title.visible,stage.credits.visible,...stage.boat.matrixWorld.elements,stage.boat.visible,...stage.boom.matrixWorld.elements,...stage.ball.matrixWorld.elements,...stage.people.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.hands.flatMap(m=>m.matrixWorld.elements)]),...stage.actors.flatMap(a=>[a.figure.root.visible,...a.figure.root.matrixWorld.elements,...a.figure.hands.flatMap(m=>m.matrixWorld.elements),...Object.values(a.items).flatMap(g=>[g.visible,...g.matrixWorld.elements])]),...stage.camera.matrixWorld.elements];
 try{
  expect(stage.actors.length).toBe(18);expect(new Set(stage.actors.map(a=>a.figure.model)).size).toBe(3);expect(stage.choir.length).toBe(13);expect(stage.clones.length).toBe(18);expect(stage.dancers.length).toBe(12);expect(stage.sheep.length).toBe(6);
  for(const[t,v]of TWO_SHOTS){stage.frame(t+.1,true,1,v,.8);const before=snap();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(99,true,2,'two-money',.8);stage.frame(t+.1,false,3,v,.8);expect(snap()).toEqual(before);}
  for(const[t,v,item]of [[122,'two-crown','crown'],[71,'two-tin-teeth','foil'],[89,'two-bread','bread'],[96,'two-melon','melon'],[116,'two-lemons','lemon-left']]as const){stage.frame(t,false,1,v,0);const actor=stage.actors.find(a=>a.figure.root.visible&&a.id==='two-lead')!;expect(actor.items[item].visible).toBe(true);}
  for(const t of [0,34,66,88,99,133]){stage.frame(t,false,1,'two-lead',0);expect(stage.actors.filter(a=>a.figure.root.visible).length).toBe(1);expect(stage.title.visible||stage.credits.visible).toBe(false);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();people.forEach(p=>p.model.dispose());}
});

test('source cuts keep the physical heads framed and mouths clear of opaque backgrounds and costume props',()=>{
 const people=cast(),stage=new TwoStage(people);
 try{for(const[w,h]of [[960,720],[375,430]])for(const[index,[at,view]]of TWO_SHOTS.entries())for(const fraction of [.01,.5,.99]){
  const time=at+Math.max(.05,((TWO_SHOTS[index+1]?.[0]??137.323)-at)*fraction),s=twoState(view,time);stage.resize(w,h);stage.frame(time,true,1,view,.8);
  const active=stage.actors.filter(a=>a.figure.root.visible);if(s.scenic){expect(active.length).toBe(0);continue;}expect(active.length).toBeGreaterThan(0);
  for(const a of active){const f=a.figure;let count=0,inside=true;f.head.scene.traverseVisible(o=>{let q:THREE.Object3D|null=o;while(q){if(q===f.ornaments)return;q=q.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const pp=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[pp.x,pp.y,pp.z].every(Number.isFinite)&&Math.max(Math.abs(pp.x),Math.abs(pp.y))<.99&&Math.abs(pp.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect({view,width:w,look:a.look,inside}).toEqual({view,width:w,look:a.look,inside:true});
   const shape=f.model.frame(VoiceModel.articFromArray(f.track.message(f.track.indexAt(time)).t.artic)),up=shape.upperLip.reduce((a,b)=>a.x>b.x?a:b),lo=shape.lowerLip.reduce((a,b)=>a.x>b.x?a:b),face=new THREE.Vector3((up.x+lo.x)/2,(up.y+lo.y)/2,0).applyMatrix4(f.head.scene.children[0].matrixWorld),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];
   stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&m.renderOrder<1000&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9&&(!f.head.scene.getObjectById(m.id)||f.ornaments.getObjectById(m.id))){m.geometry.computeBoundingBox();blockers.push(o);}});
   expect(ray.intersectObjects(blockers,false).filter(h=>h.distance<distance-.1).map(h=>({view,width:w,look:a.look,geometry:(h.object as THREE.Mesh).geometry.type,position:h.object.getWorldPosition(new THREE.Vector3()).toArray()}))).toEqual([]);
  }
  for(const v of SCENE_SETTINGS.bbnotwo.cameras){const c=twoCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{stage.dispose();people.forEach(p=>p.model.dispose());}
},30000);
