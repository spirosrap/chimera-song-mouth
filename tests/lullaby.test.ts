import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validateScene,sceneCamera,SCENE_SETTINGS} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {lullabyPose,lullabyCamera} from '../src/scene/lullaby.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {Beams} from '../src/ui/render/beams3d.ts';
await initEngine();
const {LullabyStage}=await import('../src/ui/render/lullaby.ts');const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(n:string)=>readFileSync(new URL(`../public/scenes/lullaby/${n}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString())),score:Arrangement=JSON.parse(file('performance.json').toString()),raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
const segments=(b:Beams)=>b.group.children.reduce((s,o)=>s+((o as THREE.Mesh<THREE.InstancedBufferGeometry>).geometry?.instanceCount??0),0);

test('Lullaby appends the complete bedroom video, instrumental opening, sung words and spoken ending without losing earlier scenes',()=>{
 expect(movieScene('lullaby')).toBeDefined();expect(movieScene('wild-boys')).toBeDefined();expect(movieScene('walking-broken-glass')).toBeDefined();expect(scene.setting).toBe('lullaby');expect(scene.duration).toBeGreaterThan(250.1);expect(scene.duration).toBeLessThan(250.3);expect(scene.characters.map(c=>c.id)).toEqual(['lullaby-robert']);expect(scene.cues.length).toBe(24);expect(scene.shots.length).toBe(33);expect(score.parts[0].melody!.notes.length).toBe(265);expect(score.parts[1].recordingType).toBe('instrumental');expect(scene.cues[0].start).toBeGreaterThan(61);expect(scene.cues[0].text).toContain('candy-striped');expect(scene.cues.some(c=>c.text.includes('parlour'))).toBe(true);expect(scene.cues.at(-1)!.end).toBeGreaterThan(233);
 for(const [t,v]of [[30,'lullaby-singer'],[75,'lullaby-window-hands'],[102,'lullaby-wall'],[119,'lullaby-brass'],[155,'lullaby-predator'],[161,'lullaby-mouth'],[177,'lullaby-struggle'],[198,'lullaby-overhead'],[215,'lullaby-drums'],[221,'lullaby-bass'],[248,'lullaby-ending']]as const)expect(sceneCamera(scene,t,'auto')).toBe(v);
 expect(()=>validateScene({...scene,characters:[{...scene.characters[0],id:'wild-simon'}]})).toThrow();expect(()=>validateScene({...scene,shots:[{time:0,view:'wild-singer'}]})).toThrow('camera');
});

test('the approved airway voice performs all 17 phrases with exact finite mouth telemetry and preserves the long instrumental intervals',()=>{
 const part=score.parts[0];expect(part.effects).toBeUndefined();expect(part.recordingType).toBeUndefined();expect(validPerformance(part.performance!,score.duration)).toBe(true);expect(part.performance!.phrases.length).toBe(17);expect(track.duration).toBeCloseTo(scene.duration,1);
 for(const ph of part.performance!.phrases){const end=ph.start+ph.phones.reduce((n,p)=>n+p.duration,0);let peak=0;for(let j=track.indexAt(ph.start);j<=track.indexAt(end);j++)peak=Math.max(peak,track.message(j).t.outRms);expect(peak).toBeGreaterThan(.0001);}
 let outro=0;for(let j=0;j<track.frames;j++){const t=track.message(j).t,clock=j/20;expect(t.clock).toBeCloseTo(clock,4);expect([...t.artic].every(Number.isFinite)).toBe(true);if(clock<61||clock>235||clock>103.5&&clock<122.8||clock>187.2&&clock<224.6)expect(t.outRms).toBeLessThan(.00001);if(clock>226&&clock<233)outro=Math.max(outro,t.outRms);}expect(outro).toBeGreaterThan(.0001);
});

test('early webs are absent, their fade is true opacity, and spider, hands, bed, band and trapped figure restore on backward seeks',()=>{
 expect(lullabyPose(NaN)).toEqual(lullabyPose(0));const model=new VoiceModel(track.body,track.sampleRate),stage=new LullabyStage(model,track);
 const snapshot=()=>[stage.bedroom.visible,stage.band.visible,stage.void.visible,...stage.spider.matrixWorld.elements,...stage.spiderLegs.flatMap(p=>p.flatMap(m=>m.matrixWorld.elements)),...stage.actors.flatMap(a=>[a.root.visible,...a.root.matrixWorld.elements,...a.hands.flatMap(h=>h.matrixWorld.elements),segments(a.wrap)]),...stage.windowHands.flatMap(h=>[h.visible,...h.matrixWorld.elements]),...stage.handFingers.flatMap(f=>f.rotation.toArray().slice(0,3)),...stage.players.flatMap(p=>[...p.head.matrixWorld.elements,...p.arms.flatMap(a=>a.matrixWorld.elements)]),...stage.duvet.scale.toArray(),...(stage.duvet.material as THREE.MeshBasicMaterial).color.toArray(),...stage.panes.flatMap(p=>(p.material as THREE.MeshBasicMaterial).color.toArray()),segments(stage.bedWeb),...stage.bedWeb.group.children.map(o=>((o as THREE.Mesh).material as THREE.Material).opacity),...stage.camera.up.toArray(),...stage.camera.matrixWorld.elements];
 try{stage.frame(30,true,1,'lullaby-singer',.8);expect(segments(stage.bedWeb)).toBe(0);expect(segments(stage.actors[0].wrap)).toBe(0);stage.frame(139,true,1,'lullaby-singer',.8);expect(segments(stage.bedWeb)).toBeGreaterThan(100);for(const o of stage.bedWeb.group.children)expect(((o as THREE.Mesh).material as THREE.Material).opacity).toBeGreaterThan(.6);
  for(const t of [6,15,22,30,38,51,75,102,112,119,125,133,148,155,161,170,177,184,191,214,221,228,235,248]){const view=sceneCamera(scene,t,'auto');stage.frame(t,true,1,view,.8);const a=snapshot();expect(a.every(v=>typeof v==='boolean'||Number.isFinite(v))).toBe(true);stage.frame(177,true,2,'lullaby-struggle',.8);stage.frame(t,false,3,view,.8);expect(snapshot()).toEqual(a);}expect(stage.actors.length).toBe(3);expect(stage.players.length).toBe(4);expect(stage.spiderLegs.length).toBe(8);expect(stage.windowHands.length).toBe(2);
 }finally{stage.dispose();model.dispose();}
});

test('bed and nightmare heads fit phones and desktop, the bed props leave the mouth clear and the singer lease is retained',()=>{
 const model=new VoiceModel(track.body,track.sampleRate),stage=new LullabyStage(model,track),shared=new Beams();
 const points=(look:string,fn:(v:THREE.Vector3)=>void)=>{const a=stage.actors.find(a=>a.look===look)!;let count=0;a.head.scene.traverseVisible(o=>{let p:THREE.Object3D|null=o;while(p){if(p===a.hair.group||p===a.paint)return;p=p.parent;}const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>,pos=m.geometry?.getAttribute('instanceStart');if(pos)for(let j=0;j<m.geometry.instanceCount;j++){fn(new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld));count++;}});return count;};
 try{for(const [w,h]of [[960,720],[375,430]])for(const [t,v,look]of [[67,'lullaby-singer','bed'],[94,'lullaby-profile','bed'],[102,'lullaby-wall','wall'],[139,'lullaby-cocoon','bed'],[155,'lullaby-predator','wall'],[177,'lullaby-struggle','caught'],[198,'lullaby-overhead','bed']]as const){stage.resize(w,h);stage.frame(t,true,1,v,.8);let inside=true;expect(points(look,p=>{p.project(stage.camera);inside&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.max(Math.abs(p.x),Math.abs(p.y))<.99&&Math.abs(p.z)<1;})).toBeGreaterThan(1000);expect(inside).toBe(true);for(const view of SCENE_SETTINGS.lullaby.cameras){const c=lullabyCamera(view,w/h,t);expect([...c.target,...c.position,...c.up,c.fov].every(Number.isFinite)).toBe(true);}}
  const actor=stage.actors[0];for(const [t,view]of [[67,'lullaby-singer'],[94,'lullaby-profile'],[139,'lullaby-cocoon'],[198,'lullaby-overhead']]as const){stage.frame(t,true,1,view,.8);const face=actor.root.localToWorld(new THREE.Vector3(0,12,18)),ray=new THREE.Raycaster(stage.camera.position,face.clone().sub(stage.camera.position).normalize()),distance=stage.camera.position.distanceTo(face),blockers:THREE.Object3D[]=[];stage.bedroom.traverseVisible(o=>{const m=o as THREE.Mesh;if(m.isMesh&&!(m as any).isLineSegments2&&(m.material as THREE.Material).opacity>.9)blockers.push(o);});expect(ray.intersectObjects(blockers,false).some(h=>h.distance<distance-.1)).toBe(false);}
  for(const o of shared.group.children){const m=(o as THREE.Mesh).material as THREE.Material;expect(m.blending).toBe(THREE.CustomBlending);expect(m.blendEquation).toBe(THREE.MaxEquation);}
 }finally{const dispose=spyOn(VoiceModel.prototype,'dispose');stage.dispose();expect(dispose).toHaveBeenCalledTimes(0);dispose.mockRestore();model.dispose();shared.dispose();}
});
