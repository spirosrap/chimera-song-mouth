import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {songCaption} from '../src/band/presentation.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {Arrangement} from '../src/band/types.ts';
import {initEngine} from './harness.ts';
const file=(name:string)=>readFileSync(new URL(`../public/band/pame-sti-honolulu/${name}`,import.meta.url));
const score:Arrangement=JSON.parse(file('arrangement.json').toString());
const song=BAND_SONGS.find(s=>s.id==='pame-sti-honolulu')!;
await initEngine();
const {lyricsToSyllables}=await import('../src/wasm/engine.ts');
const {planPart}=await import('../src/band/planning.ts');
const {singerCues}=await import('../src/ui/render/folkSingerOverlay.ts');
const {FolkSinger}=await import('../src/ui/render/folkSinger.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');

test('Honolulu appends the whole Greek recording and keeps the instrumental break',async()=>{
 expect(BAND_SONGS.at(-1)).toBe(song);expect(BAND_SONGS.at(-2)!.id).toBe('lose-yourself');
 expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const a=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)));
 expect(a.duration).toBeGreaterThan(187);expect(a.duration).toBeLessThan(188);
 expect(a.parts.map(p=>[p.id,p.kind])).toEqual([['lead','voice'],['backing','backing']]);
 expect(validPerformance(a.parts[0].performance!,a.duration)).toBe(true);
 expect(a.parts[1].recordingType).toBe('instrumental');expect(a.parts[1].performance).toBeUndefined();
 const p=a.parts[0].performance!;
 expect(p.phrases[0].start).toBeLessThan(.5);expect(p.phrases.some(x=>x.start>12&&x.start<57)).toBe(false);
 const last=p.phrases.at(-1)!;expect(last.start+last.phones.reduce((s,x)=>s+x.duration,0)).toBeGreaterThan(179);
 expect(songCaption(a,60)).toContain('Χονολουλού');expect(songCaption(a,30)).toBe('');expect(songCaption(a,150)).toContain('σκατ');
});

test('Greek words and every wordless syllable stay on the recorded mouth clock',()=>{
 const p=score.parts[0],s=lyricsToSyllables(p.melody!.lyrics),n=p.melody!.notes;
 expect(n.length).toBeGreaterThan(350);expect(n.length).toBe(s.length);
 expect(n.map(x=>x.lyricIndex!).sort((a,b)=>a-b)).toEqual(s.map((_,i)=>i));
 const cues=singerCues(p),firstWord=n.find(n=>n.start+.35>58&&n.start+.35<59)!;
 expect(cues.word(firstWord.start+.36)?.text).toContain('πάμε');
 expect(cues.word(30)).toBeNull();expect(cues.whistling(62)).toBe(false);
 const gestures=planPart(p);
 expect(gestures.length).toBeGreaterThan(1000);
 expect(gestures.every(g=>Number.isFinite(g.t0)&&g.t1>=g.t0&&g.t1<score.duration)).toBe(true);
 expect(p.performance!.phrases.flatMap(p=>p.phones).some(p=>p.ipa==='ɾ')).toBe(true);
});

test('the independent music and engine recording load with complete finite telemetry',async()=>{
 const urls:string[]=[];const loaded=await loadBandAssets(song.id,score.parts,async()=>({duration:score.duration})as AudioBuffer,async url=>{urls.push(url);return new Response(file(url.split('/').at(-1)!.split('?')[0]));});
 expect(urls).toHaveLength(3);expect(urls.every(u=>u.endsWith('?v=honolulu-20261113'))).toBe(true);
 expect(loaded[1].track).toBeNull();expect(urls.some(x=>x.includes('backing.tele'))).toBe(false);
 const t=loaded[0].track!;expect(Math.abs(t.duration-score.duration)).toBeLessThan(.051);
 expect(t.message(t.indexAt(30)).t.gate).toBeLessThan(.01);
 for(const time of [1,60,100,144,172])expect(t.message(t.indexAt(time)).t.outRms).toBeGreaterThan(.001);
 const b=gunzipSync(file('lead.tele.gz'));expect(new Float32Array(b.buffer,b.byteOffset+48,(b.byteLength-48)/4).every(Number.isFinite)).toBe(true);
});

function geometry(g:THREE.Object3D){const points:number[]=[];g.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>;if(!m.geometry?.hasAttribute('instanceStart'))return;for(const n of ['instanceStart','instanceEnd']){const a=m.geometry.getAttribute(n);for(let i=0;i<m.geometry.instanceCount;i++)points.push(a.getX(i),a.getY(i),a.getZ(i));}});return points;}
test('the island singer pauses and seeks deterministically, borrows its model and frames both palms',()=>{
 const raw=gunzipSync(file('lead.tele.gz')),track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
 const model=new VoiceModel(track.body,track.sampleRate),singer=new FolkSinger(model,track,score.bpm,'honolulu'),dispose=spyOn(model,'dispose');
 try{
  expect(singer.scene.background).toEqual(new THREE.Color('#100d22'));
  for(const [w,h]of [[900,760],[350,430],[272,430]]){
   singer.resize(w,h);singer.frame(60,true,1,true);const hands=geometry(singer.hands.group),back=geometry(singer.backdrop.group);
   singer.frame(60,false,1,true);expect(geometry(singer.hands.group)).toEqual(hands);expect(geometry(singer.backdrop.group)).toEqual(back);
   singer.frame(100,true,2,true);singer.frame(60,true,3,true);expect(geometry(singer.backdrop.group)).toEqual(back);
   for(const [x,y] of [[-48,31],[48,25]]){const v=new THREE.Vector3(x,y,0).multiplyScalar(model.tract.scale).applyQuaternion(singer.backdrop.group.quaternion).add(singer.backdrop.group.position).project(singer.camera);expect(Math.abs(v.x)).toBeLessThan(.99);expect(Math.abs(v.y)).toBeLessThan(.99);}
  }
  singer.dispose();expect(dispose).not.toHaveBeenCalled();expect(singer.hat.group.parent).toBeNull();
 }finally{dispose.mockRestore();model.dispose();}
});
