import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {spellPose,spellCamera,spellState,SPELL_SHOTS} from '../src/scene/abracadabra.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
await initEngine();
const {SpellStage}=await import('../src/ui/render/abracadabra.ts'),{VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/abracadabra/${n}`,import.meta.url)),scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
test('Abracadabra appends the full source, original instrumental and physical voice without changing earlier selections',()=>{
 expect(movieScene('abracadabra')).toBeDefined();expect(movieScene('apt')).toBeDefined();expect(scene.setting).toBe('abracadabra');expect(scene.duration).toBeGreaterThan(269.7);expect(scene.duration).toBeLessThan(270);expect(scene.characters.map(c=>c.id)).toEqual(['gaga-spell']);expect(scene.shots.length).toBe(41);expect(score.parts.map(p=>p.kind)).toEqual(['voice','backing']);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(6);expect(scene.cues.at(-1)!.end).toBeGreaterThan(259);expect(score.parts[0].melody!.notes.length).toBe(505);
 for(const [t,v]of [[1,'spell-queen'],[20,'spell-white'],[29,'spell-wide'],[50,'spell-overhead'],[82,'spell-white-close'],[126,'spell-cage'],[138,'spell-red'],[145,'spell-red-close'],[160,'spell-red-back'],[174,'spell-red-floor'],[196,'spell-white-lift'],[202,'spell-ring'],[252,'spell-overhead'],[269,'spell-ending']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'apt-pair'}]})).toThrow('camera');
});
test('physical syllables, genuine rests and captured mouths retain the exact source clock',()=>{
 const part=score.parts[0],perf=part.performance!;expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(perf,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);expect(perf.phrases.flatMap(p=>p.phones).some(p=>p.ipa==='b')).toBe(true);
 for(const ph of perf.phrases){const end=ph.start+ph.phones.reduce((a,p)=>a+p.duration,0);let rms=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)rms=Math.max(rms,track.message(j).t.outRms);expect(rms).toBeGreaterThan(.0001);}
 for(let j=0;j<track.frames;j++){const t=track.message(j).t;expect(t.clock).toBeCloseTo(j/20,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(j/20<5||j/20>262)expect(t.outRms).toBeLessThan(.00001);}
});
test('dancers, red and white costumes, cloth, floor poses and lift restore from absolute time',()=>{
 expect(spellPose(NaN)).toEqual(spellPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new SpellStage(model,track),snap=()=>[stage.cage.visible,...stage.actors.flatMap(a=>[a.figure.root.visible,a.cape.visible,...a.figure.root.matrixWorld.elements,...Array.from(a.cape.geometry.getAttribute('position').array),...a.figure.hands.flatMap(m=>m.matrixWorld.elements)]),...stage.dancers.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,(a.body.material as THREE.MeshBasicMaterial).color.getHex(),...a.hands.flatMap(m=>m.matrixWorld.elements)]),...stage.camera.matrixWorld.elements,...stage.camera.up.toArray()];
 try{expect(stage.actors.length).toBe(3);expect(new Set(stage.actors.map(a=>a.figure.model)).size).toBe(1);expect(stage.dancers.length).toBe(32);
 for(const t of [1,20,29,33,40,50,62,76,82,110,126,138,145,160,174,196,202,216,232,238,252,269]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snap();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(145,true,2,'spell-red-close',.8);stage.frame(t,false,3,view,.8);expect(snap()).toEqual(before);}
 stage.frame(145,false,1,'spell-red-close',0);expect(stage.actors[2].figure.root.visible).toBe(true);expect(stage.dancers.every(d=>!d.light)).toBe(true);stage.frame(20,false,1,'spell-white',0);expect(stage.actors[0].figure.root.visible).toBe(true);expect(stage.actors[2].figure.root.visible).toBe(false);expect(stage.dancers.every(d=>d.light)).toBe(true);expect(stage.camera.up.toArray()).toEqual([0,1,0]);
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();}
});
test('costumes and dancers leave focused physical mouths visible on desktop and phone',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new SpellStage(model,track);
 try{for(const [w,h]of [[960,720],[375,430]])for(const [at,view]of SPELL_SHOTS){const time=at+.1,p=spellState(view,time),index=p.queen?1:p.red?2:0;stage.resize(w,h);stage.frame(time,true,1,view,.8);if(view==='spell-red-back')expect(stage.camera.position.z).toBeGreaterThan(-350);const f=stage.actors[index].figure;let count=0,inside=true;f.head.scene.traverseVisible(o=>{let q:THREE.Object3D|null=o;while(q){if(q===f.ornaments)return;q=q.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
 const shape=model.frame(VoiceModel.articFromArray(track.message(track.indexAt(time)).t.artic)),up=shape.upperLip.reduce((a,b)=>a.x>b.x?a:b),lo=shape.lowerLip.reduce((a,b)=>a.x>b.x?a:b),face=new THREE.Vector3((up.x+lo.x)/2,(up.y+lo.y)/2,0).applyMatrix4(f.head.scene.children[0].matrixWorld),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9&&!f.head.scene.getObjectById(m.id)&&!(view==='spell-red-back'&&(f.root.getObjectById(m.id)||m===stage.actors[index].cape))){m.geometry.computeBoundingBox();blockers.push(o);}});expect(ray.intersectObjects(blockers,false).filter(h=>h.distance<distance-.1).map(h=>({time,view,width:w,geometry:(h.object as THREE.Mesh).geometry.type,position:h.object.getWorldPosition(new THREE.Vector3()).toArray()}))).toEqual([]);
 for(const v of SCENE_SETTINGS.abracadabra.cameras){const c=spellCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
 }}finally{stage.dispose();model.dispose();}
});
