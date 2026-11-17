import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {JENNIE_SHOTS,jenniePose,jennieState,jennieCamera} from '../src/scene/like-jennie.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {skippedIpa}=await import('../src/wasm/engine.ts');
const {JennieStage}=await import('../src/ui/render/like-jennie.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/like-jennie/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
const cast=()=>[{id:'jennie-singer'as const,track,model:new VoiceModel(track.body,track.sampleRate)}];

test('like JENNIE appends the complete capsule, dance and capybara film with original music and physical vocals',()=>{
 expect(movieScene('like-jennie')).toHaveProperty('assetVersion','like-jennie-20261117');expect(movieScene('bbno-two')).toBeDefined();expect(scene.setting).toBe('likejennie');expect(scene.duration).toBeCloseTo(182.583016,4);expect(scene.characters.map(c=>c.id)).toEqual(['jennie-singer']);expect(scene.shots.length).toBe(64);
 expect(score.parts.map(p=>p.kind)).toEqual(['voice','backing']);expect(score.parts[1].recordingType).toBe('instrumental');expect(score.parts[0].melody!.notes.length).toBe(454);expect(score.parts[0].performance!.phrases.length).toBe(53);expect(score.parts[0].body.female).toBe(.76);expect(score.parts[0].voice?.brightness).toBe(.58);
 for(const[t,v]of [[1,'jennie-hatch'],[8,'jennie-bean'],[15,'jennie-bite'],[37,'jennie-cap-face'],[49,'jennie-circle-above'],[97,'jennie-verse'],[133,'jennie-floor'],[154,'jennie-red-face'],[168.5,'jennie-flames'],[173,'jennie-capybara'],[181,'jennie-capybara-face']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'two-sauna'}]})).toThrow('camera');
});

test('English and native Korean syllables retain the approved physical score and exact mouth clock without fabricated intro or ending words',()=>{
 const part=score.parts[0],perf=part.performance!;expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(perf,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);
 const phones=new Set(perf.phrases.flatMap(ph=>ph.phones.map(p=>p.ipa)));for(const ipa of phones)expect(skippedIpa(ipa)).toEqual({unknown:[],noSound:[],ignoredMarks:[]});expect(phones.has('ɯ')).toBe(true);expect(phones.has('ɕ')||phones.has('tɕ')).toBe(true);expect(part.melody!.lyrics).toContain('서커스짓');expect(part.melody!.lyrics).toContain('예술작품엔');expect(part.melody!.lyrics).not.toContain('Thanks for watching');expect(part.melody!.notes.map(n=>n.lyricIndex).sort((a,b)=>a!-b!)).toEqual(Array.from({length:454},(_,i)=>i));
 for(const ph of perf.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let rms=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)rms=Math.max(rms,track.message(j).t.outRms);expect(rms).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t,time=j/20;expect(t.clock).toBeCloseTo(time,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(!perf.phrases.some(ph=>time>=ph.start-.2&&time<=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0)+.45))expect(t.outRms).toBeLessThan(.00001);}
 expect(scene.cues[0].start).toBeGreaterThan(36);expect(scene.cues.at(-1)!.end).toBeLessThan(167);
});

test('costumes, crowd formations, overhead cutaways and capybara transformation restore after seeks without releasing the retained model',()=>{
 expect(jenniePose(NaN)).toEqual(jenniePose(0));const people=cast(),stage=new JennieStage(people),snap=()=>[stage.capsule.visible,stage.hall.visible,stage.landscape.visible,stage.title.visible,stage.detailBackdrop.visible,stage.bean.visible,...stage.bean.matrixWorld.elements,stage.hand.visible,...stage.hand.matrixWorld.elements,stage.capybara.visible,...stage.capybara.matrixWorld.elements,...stage.capyHead.matrixWorld.elements,...stage.flower.matrixWorld.elements,...stage.flames.flatMap(m=>[m.visible,...m.matrixWorld.elements]),...stage.dancers.flatMap(d=>[d.root.visible,...d.root.matrixWorld.elements,...d.head.matrixWorld.elements,...d.arms.flatMap(m=>m.matrixWorld.elements)]),...stage.actors.flatMap(a=>[a.figure.root.visible,...a.figure.root.matrixWorld.elements,...a.figure.hands.flatMap(m=>m.matrixWorld.elements)]),...stage.lights.map(m=>m.visible),...stage.camera.matrixWorld.elements];
 try{
  expect(stage.actors.length).toBe(4);expect(new Set(stage.actors.map(a=>a.figure.model)).size).toBe(1);expect(stage.dancers.length).toBe(64);expect(stage.capyPaws.length).toBe(4);expect(stage.capyEars.length).toBe(2);
  for(const[t,v]of JENNIE_SHOTS){stage.frame(t+.1,true,1,v,.8);const before=snap();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(174,true,2,'jennie-capybara',.8);stage.frame(t+.1,false,3,v,.8);expect(snap()).toEqual(before);}
  stage.frame(49,true,1,'jennie-circle-above',0);expect(stage.lights.every(m=>!m.visible)).toBe(true);const cap=stage.actors.find(a=>a.look==='cap')!.cap;cap.traverse(o=>{if((o as THREE.Mesh).isMesh)expect(((o as THREE.Mesh).material as THREE.Material).opacity).toBe(.3);});stage.frame(37,true,2,'jennie-cap-face',0);cap.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.opacity).toBe(1);expect(m.transparent).toBe(false);expect(m.depthWrite).toBe(true);}});
  stage.frame(173,false,1,'jennie-capybara',0);expect(stage.capybara.visible&&stage.flower.visible).toBe(true);expect(stage.actors.every(a=>!a.figure.root.visible)).toBe(true);stage.frame(165,false,2,'jennie-red-profile',0);expect(stage.capybara.visible).toBe(false);expect(stage.actors.find(a=>a.figure.root.visible)!.look).toBe('red');
  for(const t of [8,32,49,99,151,173,181]){stage.frame(t,false,1,'jennie-singer',0);expect(stage.actors.filter(a=>a.figure.root.visible).length).toBe(1);expect(stage.title.visible||stage.capybara.visible).toBe(false);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();people[0].model.dispose();}
});

test('all source cameras frame the physical head and keep its lips clear of opaque sets, clothing and foreground dancers on desktop and phone',()=>{
 const people=cast(),stage=new JennieStage(people);
 try{for(const[w,h]of [[960,720],[375,430]])for(const[index,[at,view]]of JENNIE_SHOTS.entries())for(const fraction of [.01,.5,.99]){
  const time=at+Math.max(.1,((JENNIE_SHOTS[index+1]?.[0]??182.583)-at)*fraction),s=jennieState(view,time);stage.resize(w,h);stage.frame(time,true,1,view,.8);const active=stage.actors.filter(a=>a.figure.root.visible);if(s.scenic){expect(active.length).toBe(0);continue;}expect(active.length).toBe(1);
  for(const a of active){const f=a.figure;let count=0,inside=true;f.head.scene.traverseVisible(o=>{let q:THREE.Object3D|null=o;while(q){if(q===f.ornaments)return;q=q.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const pp=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[pp.x,pp.y,pp.z].every(Number.isFinite)&&Math.max(Math.abs(pp.x),Math.abs(pp.y))<.99&&Math.abs(pp.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect({view,width:w,look:a.look,inside}).toEqual({view,width:w,look:a.look,inside:true});
   const shape=f.model.frame(VoiceModel.articFromArray(track.message(track.indexAt(time)).t.artic)),up=shape.upperLip.reduce((a,b)=>a.x>b.x?a:b),lo=shape.lowerLip.reduce((a,b)=>a.x>b.x?a:b),face=new THREE.Vector3((up.x+lo.x)/2,(up.y+lo.y)/2,0).applyMatrix4(f.head.scene.children[0].matrixWorld),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&m.renderOrder<1000&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9&&(!f.head.scene.getObjectById(m.id)||f.ornaments.getObjectById(m.id))){m.geometry.computeBoundingBox();blockers.push(o);}});expect(ray.intersectObjects(blockers,false).filter(h=>h.distance<distance-.1).map(h=>({view,width:w,look:a.look,geometry:(h.object as THREE.Mesh).geometry.type,position:h.object.getWorldPosition(new THREE.Vector3()).toArray()}))).toEqual([]);
  }
  for(const v of SCENE_SETTINGS.likejennie.cameras){const c=jennieCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{stage.dispose();people[0].model.dispose();}
},30000);
