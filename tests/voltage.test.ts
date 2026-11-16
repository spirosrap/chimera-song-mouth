import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {voltagePose,voltageCamera,voltagePlace} from '../src/scene/voltage.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {VoltageStage}=await import('../src/ui/render/voltage.ts'),{VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/danger-voltage/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString());
const tracks=['lead','answer'].map(name=>{const raw=gunzipSync(file(name+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));});
const cast=()=>tracks.map((track,i)=>({id:i?'voltage-woman' as const:'voltage-man' as const,track,model:new VoiceModel(track.body,track.sampleRate)}));
test('the complete High Voltage duet appends the full film, original backing and all six closing calls',()=>{
 expect(movieScene('danger-voltage')).toBeDefined();expect(movieScene('babooshka')).toBeDefined();expect(scene.setting).toBe('voltage');expect(scene.duration).toBeGreaterThan(221.6);expect(scene.duration).toBeLessThan(221.8);
 expect(scene.characters.map(c=>c.id)).toEqual(['voltage-man','voltage-woman']);expect(scene.cues.length).toBe(47);expect(scene.shots.length).toBe(41);expect(score.parts.map(p=>p.kind)).toEqual(['voice','voice','backing']);expect(score.parts[2].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(11);expect(scene.cues.at(-1)!.end).toBeGreaterThan(191.5);expect(scene.cues.filter(c=>c.start>185).map(c=>c.text).join(' ').match(/hell/gi)?.length).toBe(6);
 for(const [t,v]of [[3,'volt-gallery'],[6,'volt-horse-painting'],[21,'volt-man-close'],[31,'volt-woman'],[60,'volt-dance'],[84,'volt-embrace'],[139,'volt-ride'],[173,'volt-sax-man'],[185,'volt-sax-woman'],[208,'volt-fire']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[scene.characters[0]]})).toThrow();expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'kate'},scene.characters[1]]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'bab-bass'}]})).toThrow('camera');
});
test('both voices use independent physical scores, complete phones, exact mouth clocks and quiet instrumental breaks',()=>{
 expect(score.parts[0].body).not.toEqual(score.parts[1].body);expect(score.parts.slice(0,2).map(p=>p.melody!.notes.length)).toEqual([171,128]);
 for(const [i,track]of tracks.entries()){const part=score.parts[i],perf=part.performance!;expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(perf,score.duration)).toBe(true);expect(track.duration).toBeCloseTo(scene.duration,1);expect(perf.phrases.length).toBe(i?18:29);expect(perf.phrases.flatMap(p=>p.phones).some(p=>p.ipa==='dʒ')).toBe(true);
  for(const ph of perf.phrases){const end=ph.start+ph.phones.reduce((a,p)=>a+p.duration,0);let rms=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)rms=Math.max(rms,track.message(j).t.outRms);expect(rms).toBeGreaterThan(.0001);}
  for(let j=0;j<track.frames;j++){const t=track.message(j).t,clock=j/20;expect(t.clock).toBeCloseTo(clock,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(clock<10||clock>193||clock>76&&clock<104.5||clock>153.3&&clock<167.3)expect(t.outRms).toBeLessThan(.00001);}
 }
});
test('costumes, seated hips, dance, moose, light pulses and foreground fire restore exactly after backwards seeking',()=>{
 expect(voltagePose(NaN)).toEqual(voltagePose(0));const people=cast(),stage=new VoltageStage(people);
 const snap=()=>[...Object.values(stage.rooms).map(g=>g.visible),stage.foregroundFire.visible,...stage.mounts.flatMap(m=>m.matrixWorld.elements),...stage.flames.flatMap(m=>m.matrixWorld.elements),...stage.actors.flatMap(a=>[a.figure.root.visible,...a.figure.root.matrixWorld.elements,...a.figure.hands.flatMap(m=>m.matrixWorld.elements),...a.figure.legs.flatMap(m=>m.matrixWorld.elements),...a.glows.map(m=>m.visible),...a.halos.map(m=>(m.material as THREE.Material).opacity)]),...stage.camera.matrixWorld.elements,...stage.camera.up.toArray()];
 try{expect(stage.actors.length).toBe(8);for(const t of [3,11,21,31,60,68,84,118,139,149,166,173,185,190,208]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const before=snap();expect(before.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);expect(Object.values(stage.rooms).filter(g=>g.visible).length).toBe(1);stage.frame(190,true,2,'volt-sax-fire',.8);stage.frame(t,false,3,view,.8);expect(snap()).toEqual(before);expect(stage.rooms[voltagePlace(view,t)].visible).toBe(true);expect(stage.foregroundFire.visible).toBe(view==='volt-sax-fire');}
  stage.frame(11,false,1,'volt-chair',0);for(const a of stage.actors.slice(0,2)){const hip=a.figure.root.position.y-70;expect(Math.abs(hip-73.5)).toBeLessThan(1);}
  stage.frame(139,false,1,'volt-ride',0);expect(Math.abs(stage.actors[4].figure.root.position.y-70-stage.mounts[0].position.y-130.5)).toBeLessThan(1);for(const a of stage.actors.slice(4,6))for(const foot of a.figure.feet)expect(a.figure.root.localToWorld(foot.position.clone()).y).toBeCloseTo(58,0);
  stage.frame(166,false,1,'volt-sax',0);expect(stage.foregroundFire.visible).toBe(false);expect(stage.actors[7].sax).toBeDefined();stage.frame(190,false,2,'volt-sax-fire',0);expect(stage.foregroundFire.visible).toBe(true);stage.frame(31,false,3,'volt-woman',0);expect(stage.actors.every(a=>a.halos.every(m=>(m.material as THREE.Material).opacity===0))).toBe(true);
 }finally{stage.dispose();people.forEach(p=>p.model.dispose());}
});
test('focused physical heads stay framed with clear lips, glasses and saxophone, while both voices remain retained',()=>{
 const people=cast(),stage=new VoltageStage(people),shared=new Beams();
 try{for(const [w,h]of [[960,558],[375,430]])for(const [time,view,indices]of [[21,'volt-man-close',[0]],[31,'volt-woman',[1]],[35,'volt-woman-close',[1]],[60,'volt-dance',[2,3]],[68,'volt-duet',[2,3]],[84,'volt-embrace',[2,3]],[139,'volt-ride',[4,5]],[149,'volt-ride-close',[4,5]],[173,'volt-sax-man',[6]],[185,'volt-sax-woman',[7]],[190,'volt-sax-fire',[6,7]]]as const){stage.resize(w,h);stage.frame(time,true,1,view,.8);
   for(const index of indices){const actor=stage.actors[index],f=actor.figure;let count=0,inside=true;f.head.scene.traverseVisible(o=>{let q:THREE.Object3D|null=o;while(q){if(q===f.ornaments)return;q=q.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){const p=new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld).project(stage.camera);inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;count++;}});expect(count).toBeGreaterThan(1000);expect(inside).toBe(true);
    const model=f.model,artic=VoiceModel.articFromArray(f.track.message(f.track.indexAt(time)).t.artic),shape=model.frame(artic),up=shape.upperLip.reduce((a,b)=>a.x>b.x?a:b),lo=shape.lowerLip.reduce((a,b)=>a.x>b.x?a:b),face=new THREE.Vector3((up.x+lo.x)/2,(up.y+lo.y)/2,0).applyMatrix4(f.head.scene.children[0].matrixWorld),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.scene.traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9&&!f.head.scene.getObjectById(m.id)){m.geometry.computeBoundingBox();blockers.push(o);}});expect(ray.intersectObjects(blockers,false).filter(h=>h.distance<distance-.1).map(h=>({view,index,width:w,geometry:(h.object as THREE.Mesh).geometry.type,position:h.object.getWorldPosition(new THREE.Vector3()).toArray()}))).toEqual([]);
   }
   for(const v of SCENE_SETTINGS.voltage.cameras){const c=voltageCamera(v,w/h,time);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}
  }
  for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();people.forEach(p=>p.model.dispose());shared.dispose();}
});
