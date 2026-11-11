import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,sceneCue,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {ODYSSEY_BANG,ODYSSEY_LATER,ODYSSEY_STIR,odysseyCamera,odysseyPanel,odysseySet,odysseyState,type OdysseySpeaker} from '../src/scene/odyssey.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {OdysseyFlight}=await import('../src/ui/render/odyssey.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/apollo-13/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const ids=['lovell','swigert','haise','capcom','kranz'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength) as ArrayBuffer);});
const VIEWS=['wide','odyssey-vent','odyssey-crew',...ids] as CameraView[];

test('the scene has five voices, its own cast and cameras, and shares the CapCom with no other setting’s lines',()=>{
 expect(movieScene('apollo-13')?.readyVideo).toBeUndefined();expect(scene.setting).toBe('odyssey');expect(scene.characters.map(c=>c.id)).toEqual([...ids]);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,4)})).toThrow('missing');
 expect(()=>validateScene({...scene,setting:'moon'})).toThrow('incomplete');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'landing-above'}]})).toThrow('camera');
 expect(sceneCamera(scene,0,'auto')).toBe('wide');expect(sceneCamera(scene,4,'auto')).toBe('capcom');
 expect(sceneCamera(scene,ODYSSEY_BANG+2,'auto')).toBe('odyssey-vent');expect(sceneCamera(scene,ODYSSEY_BANG+4,'auto')).toBe('odyssey-crew');
 expect(odysseySet('kranz')).toBe('houston');expect(odysseySet('haise')).toBe('cabin');expect(odysseySet('odyssey-crew')).toBe('cabin');expect(odysseySet('odyssey-vent')).toBe('space');expect(odysseySet('wide')).toBe('space');
});

test('nothing is wrong until the bang; then the panel leaves, gas vents, lights come on and the gauge misbehaves',()=>{
 const calm=odysseyState(ODYSSEY_BANG-.1),hit=odysseyState(ODYSSEY_BANG+.1),soon=odysseyState(ODYSSEY_BANG+20),late=odysseyState(ODYSSEY_LATER+20);
 expect(calm.vent).toBe(0);expect(calm.cloud).toBe(0);expect(calm.alarm).toBe(false);expect(calm.mainB).toBe(false);expect(calm.pitch).toBeCloseTo(0,9);expect(calm.tank2).toBe(.82);expect(calm.stirred).toBe(true);
 expect(odysseyState(ODYSSEY_STIR-.1).stirred).toBe(false);expect(odysseyPanel(ODYSSEY_BANG-.1).gone).toBe(false);
 expect(hit.alarm).toBe(true);expect(hit.mainB).toBe(true);expect(hit.flash).toBeGreaterThan(.5);expect(hit.vent).toBeGreaterThan(.9);expect(hit.stirred).toBe(false);expect(odysseyPanel(ODYSSEY_BANG+.1).gone).toBe(true);
 // "Oscillating down around 20 to 60 percent", then "full-scale high", then "reading zero".
 for(let a=1;a<33;a+=.7){const v=odysseyState(ODYSSEY_BANG+a).tank2;expect(v).toBeGreaterThanOrEqual(.2-1e-9);expect(v).toBeLessThanOrEqual(.6+1e-9);}
 expect(odysseyState(ODYSSEY_BANG+50).tank2).toBe(1);expect(late.tank2).toBe(0);expect(late.tank1).toBeLessThan(odysseyState(ODYSSEY_BANG+50).tank1);
 expect(odysseyState(ODYSSEY_BANG+9).alarm).toBe(false);expect(soon.mainA).toBe(false);expect(late.mainA).toBe(true);
 expect(Math.abs(odysseyState(ODYSSEY_BANG+1).pitch)+Math.abs(odysseyState(ODYSSEY_BANG+1.6).pitch)).toBeGreaterThan(.05);expect(Math.abs(odysseyState(ODYSSEY_BANG+90).pitch)).toBeLessThan(.001);
 expect(soon.vent).toBeLessThan(hit.vent);expect(late.vent).toBeGreaterThan(.4);expect(late.cloud).toBe(1);expect(soon.cloud).toBeLessThan(.3);
 // The panel only ever travels away.
 let far=0;for(let a=0;a<60;a+=2){const p=odysseyPanel(ODYSSEY_BANG+a).position,d=Math.hypot(p[1],p[2]);expect(d).toBeGreaterThanOrEqual(far);far=d;}expect(far).toBeGreaterThan(4000);
 const again=odysseyState(150);odysseyState(5);expect(odysseyState(150)).toEqual(again);expect(odysseyState(NaN)).toEqual(odysseyState(0));
 for(const view of VIEWS)for(const aspect of [16/9,.7])for(const t of [0,ODYSSEY_BANG,90,190]){const c=odysseyCamera(view,aspect,t);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);expect(c.fov).toBeGreaterThan(20);expect(c.fov).toBeLessThan(95);}
});

test('the prepared scene: ordered lines around the fixed moments, each on its own mouth, the famous ones in place',()=>{
 scene.cues.forEach((c,i)=>{if(i)expect(c.start).toBeGreaterThanOrEqual(scene.cues[i-1].end);});
 const cue=(text:string)=>scene.cues.find(c=>c.text.startsWith(text))!,spoken=scene.cues.filter(c=>!c.text.startsWith('('));
 expect(spoken).toHaveLength(32);expect(scene.cues).toHaveLength(35);
 expect(cue('13, we’ve got one more item').speaker).toBe('capcom');expect(cue('Okay. Stand by.').end).toBeLessThan(ODYSSEY_STIR);
 expect(cue('(A bang.').start).toBe(ODYSSEY_BANG);
 const swigert=cue('Okay, Houston, we’ve had a problem here.'),lovell=cue('Houston, we’ve had a problem. We’ve had a Main B Bus Undervolt.');
 expect(swigert.speaker).toBe('swigert');expect(swigert.start).toBeGreaterThan(ODYSSEY_BANG+4.6);expect(lovell.speaker).toBe('lovell');expect(lovell.start).toBeGreaterThan(swigert.end);
 // Nothing is said across the bang or across the cut.
 expect(spoken.some(c=>c.start<ODYSSEY_BANG+4.6&&c.end>ODYSSEY_STIR)).toBe(false);expect(spoken.some(c=>c.start<ODYSSEY_LATER+2.2&&c.end>ODYSSEY_LATER-1.2)).toBe(false);
 expect(cue('And it looks to me, looking out the hatch').start).toBeGreaterThan(ODYSSEY_LATER);expect(scene.cues.at(-1)!.speaker).toBe('kranz');expect(scene.cues.at(-1)!.text).toContain('a good portion of it with');
 expect(sceneCue(scene,scene.duration-1)).toBeUndefined();expect(file('mix.mp3').length).toBeGreaterThan(3_000_000);
 for(const [i,id] of ids.entries()){
  const track=tracks[i];expect(Math.abs(track.duration-scene.duration)).toBeLessThan(.1);
  for(const c of spoken.filter(q=>q.speaker===id)){let peak=0;for(let f=track.indexAt(c.start);f<=track.indexAt(c.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.003);}
  expect(track.message(track.indexAt(scene.duration-.5)).t.outRms).toBeLessThan(.002);
 }
 // The flight director says nothing until the end.
 const kranz=tracks[4];for(let t=1;t<ODYSSEY_LATER;t+=1.5)expect(kranz.message(kranz.indexAt(t)).t.outRms).toBeLessThan(.002);
});

test('only the place in view is drawn, the damage and the lights follow the clock, and close-ups frame their speaker',()=>{
 const cast=ids.map((id,i)=>({id:id as OdysseySpeaker,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),flight=new OdysseyFlight(cast);
 try{
  expect(flight.people.map(p=>p.id)).toEqual([...ids]);
  for(const t of [10,ODYSSEY_BANG+1,100,180,10])for(const view of VIEWS){
   flight.resize(1280,720);flight.frame(t,true,t,view,.5);expect(flight.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
   const set=odysseySet(view);expect([flight.space.visible,flight.cabin.visible,flight.houston.visible]).toEqual([set==='space',set==='cabin',set==='houston']);
   const person=flight.people.find(p=>p.id===view);
   if(person){const point=person.root.getWorldPosition(new THREE.Vector3());point.y+=3;point.project(flight.camera);expect(Math.abs(point.x)).toBeLessThan(.3);expect(Math.abs(point.y)).toBeLessThan(.3);expect(point.z).toBeLessThan(1);}
   if(view==='odyssey-crew')for(const p of flight.people.filter(q=>q.id==='lovell'||q.id==='swigert'||q.id==='haise')){const point=p.root.getWorldPosition(new THREE.Vector3()).project(flight.camera);expect(Math.abs(point.x)).toBeLessThan(.9);expect(Math.abs(point.y)).toBeLessThan(.9);}
   // The whole stack, engine bell to lunar module, stays in the wide shot.
   if(view==='wide')for(const x of [-835,1010]){const point=flight.stack.localToWorld(new THREE.Vector3(x,0,0)).project(flight.camera);expect(Math.abs(point.x)).toBeLessThan(.95);expect(Math.abs(point.y)).toBeLessThan(.95);}
  }
  const see=(t:number)=>{flight.frame(t,false,t,'wide',0);return {bay:flight.bay.group.visible,vent:flight.vent.group.visible,cloud:flight.cloud.group.visible,alarm:flight.masterAlarm.group.visible,b:flight.busB.group.visible,a:flight.busA.group.visible,fan:flight.fanOn.group.visible,streaks:flight.streaks.group.visible,panel:flight.panel.group.position.length(),n2:flight.needle2.group.position.y,tilt:flight.stack.rotation.z};};
  const calm=see(ODYSSEY_STIR+2),later=see(ODYSSEY_LATER+20);
  expect(calm).toMatchObject({bay:false,vent:false,cloud:false,alarm:false,b:false,a:false,fan:true,streaks:false});expect(Math.abs(calm.tilt)).toBe(0);expect(calm.panel).toBeLessThan(300);
  expect(later).toMatchObject({bay:true,vent:true,cloud:true,alarm:false,b:true,a:true,fan:false,streaks:true});expect(later.panel).toBeGreaterThan(5000);expect(later.n2).toBe(98);expect(calm.n2).toBeGreaterThan(120);
  let lit=0;for(let t=ODYSSEY_BANG;t<ODYSSEY_BANG+8;t+=.1)if(see(t).alarm)lit++;expect(lit).toBeGreaterThan(25);expect(lit).toBeLessThan(55);
  expect(see(ODYSSEY_STIR+2)).toEqual(calm);
 }finally{flight.dispose();cast.forEach(c=>c.model.dispose());}
});
