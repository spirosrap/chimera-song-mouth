import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCamera,sceneCue,type CameraView} from '../src/scene/scene.ts';
import {movieScene} from '../src/scene/library.ts';
import {LANDING_ALARMS,LANDING_CONTACT,LANDING_SHUTDOWN,MOON_BOULDERS,MOON_CRATERS,at,landingCamera,landingSet,landingState,moonHeight,type LandingSpeaker} from '../src/scene/landing.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {LandingSite}=await import('../src/ui/render/landing.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const file=(name:string)=>readFileSync(new URL(`../public/scenes/apollo-11/${name}`,import.meta.url));
const scene=validateScene(JSON.parse(file('scene.json').toString()));
const ids=['armstrong','aldrin','capcom'] as const;
const tracks=ids.map(id=>{const raw=gunzipSync(file(id+'.tele.gz'));return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength) as ArrayBuffer);});
const VIEWS=['wide','landing-above','landing-ground','landing-crew',...ids] as CameraView[],FT=30.48;

test('the landing is a scene of three voices with its own cast and cameras',()=>{
 expect(movieScene('apollo-11')?.readyVideo).toBeUndefined();expect(scene.setting).toBe('moon');expect(scene.characters.map(c=>c.id)).toEqual([...ids]);
 expect(()=>validateScene({...scene,characters:scene.characters.slice(0,2)})).toThrow('missing');
 expect(()=>validateScene({...scene,setting:'core'})).toThrow('character');
 expect(()=>validateScene({...scene,shots:[{time:0,view:'hal'}]})).toThrow('camera');
 expect(sceneCamera(scene,0,'auto')).toBe('wide');expect(sceneCamera(scene,3.5,'auto')).toBe('capcom');
 expect(landingSet('capcom')).toBe('houston');expect(landingSet('aldrin')).toBe('cabin');expect(landingSet('landing-crew')).toBe('cabin');expect(landingSet('landing-above')).toBe('moon');expect(landingSet('wide')).toBe('moon');
});

test('the lander follows the heights and speeds that were called, and seeks restore it',()=>{
 // Aldrin's calls, at their mission times.
 for(const [m,s,feet] of [[42,13,3000],[43,26,400],[43,46,300],[44,24,200],[44,45,100],[45,17,40],[45,28,20]] as const)expect(landingState(at(m,s)).altitude).toBeCloseTo(feet*FT,3);
 expect(landingState(at(43,26)).forward).toBeCloseTo(58,6);expect(landingState(at(44,45)).forward).toBeCloseTo(9,6);
 let lastAltitude=Infinity,lastRange=Infinity;
 for(let t=0;t<=260;t+=.5){
  const s=landingState(t);expect(s.altitude).toBeLessThanOrEqual(lastAltitude+1e-6);expect(s.position[0]).toBeLessThanOrEqual(lastRange+1e-6);lastAltitude=s.altitude;lastRange=s.position[0];
  // It never flies through the ground, crater rims included.
  expect(s.position[1]).toBeGreaterThanOrEqual(moonHeight(s.position[0],s.position[2])-1e-6);
  expect(s.pitch).toBeGreaterThanOrEqual(0);expect(s.pitch).toBeLessThanOrEqual(.9);
 }
 const start=landingState(0),down=landingState(LANDING_CONTACT+3);
 // More than three kilometres still to fly at the start; standing level on the surface at the end.
 expect(start.position[0]).toBeGreaterThan(300000);expect(start.position[0]).toBeLessThan(420000);expect(start.pitch).toBeGreaterThan(.5);
 expect(down.altitude).toBe(0);expect(down.position[0]).toBe(0);expect(down.pitch).toBe(0);expect(down.landed).toBe(true);
 expect(landingState(LANDING_SHUTDOWN-.1).throttle).toBe(1);expect(landingState(LANDING_SHUTDOWN).throttle).toBe(0);
 expect(landingState(at(44,45)).dust).toBe(0);expect(landingState(at(45,25)).dust).toBeGreaterThan(.4);expect(landingState(LANDING_SHUTDOWN+4).dust).toBe(0);
 expect(landingState(LANDING_CONTACT-.1).contact).toBe(false);expect(landingState(LANDING_CONTACT+1).contact).toBe(true);expect(landingState(LANDING_SHUTDOWN+2).contact).toBe(false);
 for(const [a,b] of LANDING_ALARMS){expect(landingState(a-.1).alarm).toBe(false);expect(landingState((a+b)/2).alarm).toBe(true);expect(landingState(b+.1).alarm).toBe(false);}
 expect(landingState(at(46,5)).relief).toBe(0);expect(landingState(at(46,12)).relief).toBe(1);
 const late=landingState(200);landingState(10);expect(landingState(200)).toEqual(late);expect(landingState(NaN)).toEqual(landingState(0));
});

test('the ground is level where it lands, cratered elsewhere, and every camera is finite',()=>{
 expect(moonHeight(0,0)).toBe(0);
 for(let a=0;a<6.3;a+=.4)for(const r of [200,600,1200])expect(Math.abs(moonHeight(Math.cos(a)*r,Math.sin(a)*r))).toBeLessThan(40);
 const west=MOON_CRATERS[0];expect(moonHeight(west.x,west.z)).toBeLessThan(-2000);expect(MOON_CRATERS.length).toBe(74);expect(MOON_BOULDERS.length).toBe(190);
 expect(MOON_CRATERS.every(c=>Math.hypot(c.x,c.z)>c.r)).toBe(true);
 for(const view of VIEWS)for(const aspect of [16/9,.7])for(const t of [0,60,150,LANDING_CONTACT,250]){
  const c=landingCamera(view,aspect,t);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);expect(c.fov).toBeGreaterThan(5);expect(c.fov).toBeLessThan(90);
  if(landingSet(view)==='moon')expect(c.position[1]).toBeGreaterThan(moonHeight(c.position[0],c.position[2]));
 }
});

test('the prepared scene keeps the mission clock: ordered lines, each on its own mouth, the famous ones on time',()=>{
 scene.cues.forEach((c,i)=>{if(i)expect(c.start).toBeGreaterThanOrEqual(scene.cues[i-1].end);});
 const cue=(text:string)=>scene.cues.find(c=>c.text.startsWith(text))!;
 expect(cue('Eagle, Houston').start).toBe(at(42,8));expect(cue('Eagle, Houston').speaker).toBe('capcom');
 expect(Math.abs(cue('Contact light').start-LANDING_CONTACT)).toBeLessThan(2.5);expect(Math.abs(cue('Shutdown').start-LANDING_SHUTDOWN)).toBeLessThan(2.5);
 expect(Math.abs(cue('Program alarm').start-LANDING_ALARMS[0][0])).toBeLessThan(3);
 const landed=cue('Houston, Tranquility Base here. The Eagle has landed.');expect(landed.speaker).toBe('armstrong');expect(landed.start).toBeGreaterThan(LANDING_SHUTDOWN+8);expect(landed.start).toBeLessThan(at(46,5));
 expect(scene.cues.at(-1)!.text).toBe('Thank you.');expect(sceneCue(scene,scene.duration-1)).toBeUndefined();expect(scene.duration).toBeGreaterThan(250);expect(scene.duration).toBeLessThan(270);
 expect(file('mix.mp3').length).toBeGreaterThan(4_000_000);
 for(const [i,id] of ids.entries()){
  const track=tracks[i];expect(Math.abs(track.duration-scene.duration)).toBeLessThan(.1);
  for(const c of scene.cues.filter(q=>q.speaker===id)){let peak=0;for(let f=track.indexAt(c.start);f<=track.indexAt(c.end);f++)peak=Math.max(peak,track.message(f).t.outRms);expect(peak).toBeGreaterThan(.003);}
  expect(track.message(track.indexAt(scene.duration-.5)).t.outRms).toBeLessThan(.002);
 }
});

test('only the set in view is drawn, the lander and its lights follow the clock, and close-ups frame their speaker',()=>{
 const cast=ids.map((id,i)=>({id:id as LandingSpeaker,track:tracks[i],model:new VoiceModel(tracks[i].body,tracks[i].sampleRate)})),site=new LandingSite(cast);
 try{
  expect(site.people.map(p=>p.id)).toEqual([...ids]);
  for(const t of [10,150,LANDING_CONTACT+1,250,10])for(const view of VIEWS){
   site.resize(1280,720);site.frame(t,true,t,view,.5);expect(site.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
   const set=landingSet(view);expect([site.moon.visible,site.cabin.visible,site.houston.visible]).toEqual([set==='moon',set==='cabin',set==='houston']);
   const person=site.people.find(p=>p.id===view);
   if(person){const point=person.root.getWorldPosition(new THREE.Vector3());point.y+=3;point.project(site.camera);expect(Math.abs(point.x)).toBeLessThan(.3);expect(Math.abs(point.y)).toBeLessThan(.3);expect(point.z).toBeLessThan(1);}
   if(view==='landing-crew')for(const p of site.people.filter(q=>q.id!=='capcom')){const point=p.root.getWorldPosition(new THREE.Vector3()).project(site.camera);expect(Math.abs(point.x)).toBeLessThan(.9);expect(Math.abs(point.y)).toBeLessThan(.9);}
   if(set==='moon'){const point=site.lander.getWorldPosition(new THREE.Vector3());point.y+=350;point.project(site.camera);expect(Math.abs(point.x)).toBeLessThan(.95);expect(Math.abs(point.y)).toBeLessThan(.95);expect(point.z).toBeLessThan(1);}
  }
  const state=(t:number)=>{site.frame(t,false,t,'wide',0);return {y:site.lander.position.y,x:site.lander.position.x,tilt:site.lander.rotation.z,plume:site.plume.group.visible,dust:site.dust.group.visible,prog:site.progLight.group.visible,contact:site.contactLight.group.visible};};
  const high=state(10),low=state(at(45,25)),down=state(250);
  expect(high.y).toBeGreaterThan(80000);expect(high.tilt).toBeLessThan(-.5);expect(high.plume).toBe(true);expect(high.dust).toBe(false);
  expect(low.dust).toBe(true);expect(low.plume).toBe(true);expect(down.y).toBe(0);expect(down.x).toBe(0);expect(down.tilt).toBeCloseTo(0,9);expect(down.plume).toBe(false);expect(down.dust).toBe(false);
  expect(state(LANDING_CONTACT+1).contact).toBe(true);expect(down.contact).toBe(false);
  let lit=0;for(let t=LANDING_ALARMS[0][0];t<LANDING_ALARMS[0][1];t+=.1)if(state(t).prog)lit++;expect(lit).toBeGreaterThan(20);expect(lit).toBeLessThan(80);expect(state(60).prog).toBe(false);
  // The shadow lies far ahead while it is high, and under it once it is down.
  site.frame(at(44,7),false,1,'wide',0);expect(site.lander.position.x-site.shade.group.position.x).toBeGreaterThan(30000);
  site.frame(250,false,2,'wide',0);expect(site.shade.group.position.x).toBeCloseTo(0,6);
  expect(state(10)).toEqual(high);
 }finally{site.dispose();cast.forEach(c=>c.model.dispose());}
});
