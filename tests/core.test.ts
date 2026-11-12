import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {initEngine,wasmModule} from './harness.ts';
import {renderPart} from '../src/band/render.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {validateScene,sceneCamera,sceneCue,type SceneFile} from '../src/scene/scene.ts';
import {CORE_MODULES,HAL_EYE,astronautPose,coreCamera,corePower,modulePullTime,moduleTravel,modulePosition} from '../src/scene/core.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
await initEngine();
const {MemoryCore}=await import('../src/ui/render/core.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const folder=new URL('../public/scenes/hal-9000/',import.meta.url);
const prepared=()=>validateScene(JSON.parse(readFileSync(new URL('scene.json',folder),'utf8')));

test('the memory core is a third movie beside the two existing ones, without a pre-encoded MP4',()=>{
 expect(MOVIE_SCENES.map(m=>m.id)).toEqual(['a-few-good-men','princess-bride','hal-9000','fool-me-once','project-hail-mary','contact','arrival','matrix-spoon','cuckoos-nest','wizard-of-oz','sagan-dimensions','apollo-11','apollo-13','nessun-dorma']);
 expect(movieScene('hal-9000')?.readyVideo).toBeUndefined();
});
test('the core accepts only its own cast and cameras',()=>{
 const s:SceneFile={setting:'core',title:'Core',description:'Two voices',duration:10,audio:'mix.mp3',characters:[{id:'hal',name:'HAL',role:'Computer',tele:'hal.tele'},{id:'dave',name:'Dave',role:'Astronaut',tele:'dave.tele'}],cues:[{start:1,end:3,speaker:'hal',text:'Stop.',intensity:.4}],shots:[{time:0,view:'wide'},{time:1,view:'hal'},{time:4,view:'modules'}]};
 expect(validateScene(s).setting).toBe('core');expect(sceneCamera(s,5,'auto')).toBe('modules');
 s.shots[1].view='jessep';expect(()=>validateScene(s)).toThrow('camera');s.shots[1].view='climber';expect(()=>validateScene(s)).toThrow('camera');s.shots[1].view='dave';
 s.characters[1].id='kaffee';expect(()=>validateScene(s)).toThrow('character');s.characters.pop();expect(()=>validateScene(s)).toThrow('incomplete');
 const court:SceneFile={...s,setting:undefined,characters:[{id:'hal',name:'HAL',role:'Computer',tele:'hal.tele'},{id:'dave',name:'Dave',role:'Astronaut',tele:'dave.tele'}]};
 expect(()=>validateScene(court)).toThrow('character');
});
test('modules leave in order, the room dims with them, and a backwards seek restores everything',()=>{
 const duration=187.5;
 expect(corePower(0,duration)).toBe(1);
 let last=1;for(let t=0;t<=duration;t+=2.5){const p=corePower(t,duration);expect(p).toBeLessThanOrEqual(last+1e-9);expect(p).toBeGreaterThanOrEqual(0);last=p;}
 expect(corePower(duration-8,duration)).toBeGreaterThan(.05);expect(corePower(duration,duration)).toBe(0);
 for(let i=0;i<CORE_MODULES;i++){expect(moduleTravel(i,modulePullTime(i))).toBe(0);expect(moduleTravel(i,modulePullTime(i)+3)).toBe(1);if(i)expect(modulePullTime(i)).toBeGreaterThan(modulePullTime(i-1));}
 expect(modulePullTime(CORE_MODULES-1)+3).toBeLessThan(duration-5);
 expect(new Set(Array.from({length:CORE_MODULES},(_,i)=>modulePosition(i).join())).size).toBe(CORE_MODULES);
 const early=astronautPose(20);astronautPose(150);expect(astronautPose(20)).toEqual(early);
 expect(astronautPose(150).position[2]).toBeGreaterThan(early.position[2]);
 for(const view of ['wide','hal','dave','modules'] as const){const c=coreCamera(view,16/9,60,duration),n=coreCamera(view,.7,60,duration);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);expect(n.fov).toBeGreaterThan(c.fov);}
});
test('both airway heads are framed by their close-ups, and the room follows the clock after seeks',()=>{
 const part={id:'test',name:'Voice',role:'Speech',body:{female:0,child:0},volume:1,pan:0};
 const track=new TeleTrack(renderPart(wasmModule,part,.2,[]).tele);
 const ids=['hal','dave'] as const,models=ids.map(()=>new VoiceModel(part.body,48000));
 const set=new MemoryCore(ids.map((id,i)=>({id,track,model:models[i]})),187.5);
 try{
  expect(set.actors.map(a=>a.id)).toEqual([...ids]);expect(set.modules.length).toBe(CORE_MODULES);expect(set.scene.children.length).toBeGreaterThan(90);
  for(const time of [5,120,0,180])for(const view of ['wide','modules',...ids] as const){
   set.resize(1280,720);set.frame(time,true,time,view,.4,'hal');
   expect(set.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
   const actor=set.actors.find(a=>a.id===view);
   if(actor){
    // HAL's close-up centres the eye, where the mouth sits; the head only has to stay in frame as the camera closes in.
    const point=actor.root.getWorldPosition(actor.root.position.clone());point.y+=4;point.project(set.camera);
    expect(Math.abs(point.x)).toBeLessThan(.25);expect(Math.abs(point.y)).toBeLessThan(view==='hal'?.8:.25);expect(point.z).toBeLessThan(1);
    if(view==='hal'){const eye=actor.root.position.clone().set(...HAL_EYE).project(set.camera);expect(Math.abs(eye.x)).toBeLessThan(.25);expect(Math.abs(eye.y)).toBeLessThan(.1);}
   }
  }
  set.frame(120,false,200,'wide',0);const late=set.modules.map(m=>m.position.x);
  set.frame(5,false,201,'wide',0);const start=set.modules.map(m=>m.position.x);
  expect(late[0]).toBeGreaterThan(start[0]+15);expect(late.at(-1)).toBe(start.at(-1)!);
  set.frame(120,false,202,'wide',0);expect(set.modules.map(m=>m.position.x)).toEqual(late);
 }finally{set.dispose();models.forEach(m=>m.dispose());}
});
test('the prepared scene is complete: ordered captions, HAL sings after Dave asks, and both mouths match the clock',()=>{
 const s=prepared();
 expect(s.setting).toBe('core');expect(s.characters.map(c=>c.id)).toEqual(['hal','dave']);
 const dave=s.cues.filter(c=>c.speaker==='dave');expect(dave.length).toBe(1);
 const song=s.cues.findIndex(c=>c.text.startsWith('Daisy, Daisy'));expect(song).toBeGreaterThan(s.cues.indexOf(dave[0]));
 expect(s.cues.at(-1)!.text).toContain('built for two');expect(s.cues.at(-1)!.end).toBeLessThan(s.duration-3);
 s.cues.forEach((c,i)=>{if(i)expect(c.start).toBeGreaterThanOrEqual(s.cues[i-1].end);});
 expect(sceneCue(s,s.duration-1)).toBeUndefined();
 for(const c of s.characters){
  const packed=gunzipSync(readFileSync(new URL(c.tele+'.gz',folder)));
  const track=new TeleTrack(packed.buffer.slice(packed.byteOffset,packed.byteOffset+packed.byteLength) as ArrayBuffer);
  expect(Math.abs(track.duration-s.duration)).toBeLessThan(.1);
  const levels=s.cues.filter(q=>q.speaker===c.id).map(q=>Math.max(...[.25,.5,.75].map(f=>track.message(track.indexAt(q.start+(q.end-q.start)*f)).t.outRms)));
  expect(levels.every(v=>Number.isFinite(v)&&v>.003)).toBe(true);
  expect(track.message(track.indexAt(s.duration-.5)).t.outRms).toBeLessThan(.002);
 }
 // The voice runs down: the last sung line sits well below the first.
 const packed=gunzipSync(readFileSync(new URL('hal.tele.gz',folder))),hal=new TeleTrack(packed.buffer.slice(packed.byteOffset,packed.byteOffset+packed.byteLength) as ArrayBuffer);
 const pitch=(a:number,b:number)=>{const v:number[]=[];for(let t=a;t<b;t+=.1){const m=hal.message(hal.indexAt(t)).t;if(m.voicing>.5)v.push(m.f0);}return v.sort((x,y)=>x-y)[Math.floor(v.length/2)];};
 const first=s.cues[song],final=s.cues.at(-1)!;
 expect(pitch(final.start,final.end)).toBeLessThan(pitch(first.start,first.end)*.7);
});
