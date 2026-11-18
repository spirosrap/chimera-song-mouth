import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
import {sceneCamera,validateScene} from '../src/scene/scene.ts';
import {SUBWAY_CAST,SUBWAY_SHOTS,subwayState} from '../src/scene/the-subway.ts';
import {TeleTrack} from '../src/show/tele.ts';

await initEngine();
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {SubwayStage}=await import('../src/ui/render/the-subway.ts');

const read=(name:string)=>readFileSync(new URL('../public/scenes/the-subway/'+name,import.meta.url));
const scene=validateScene(JSON.parse(read('scene.json').toString()));
const score:Arrangement=JSON.parse(read('performance.json').toString());

function readTrack(name:string) {
  const raw=gunzipSync(read(name+'.tele.gz'));
  return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length));
}

test('The Subway appends the complete New York and last train edit',()=>{
  expect(MOVIE_SCENES.slice(-2).map(scene=>scene.id)).toEqual(['house-tour','the-subway']);
  expect(movieScene('the-subway')).toHaveProperty('assetVersion','the-subway-20261118');
  expect(scene.characters.map(person=>person.id)).toEqual([...SUBWAY_CAST]);
  expect(scene.shots).toEqual(SUBWAY_SHOTS.map(([time,view])=>({time,view})));
  expect(scene.duration).toBeCloseTo(271.396,2);
  for(const [at,view] of [
    [3,'subway-grate'],[16,'subway-green'],[39,'subway-doors'],[65,'subway-fire-escape'],
    [100,'subway-rats'],[108,'subway-drag-wide'],[129,'subway-club'],[168,'subway-bike'],
    [176,'subway-float'],[252,'subway-hair-tower'],[261,'subway-bench'],
    [268,'subway-last-look'],[270.6,'subway-black'],
  ] as const) expect(sceneCamera(scene,at,'auto')).toBe(view);
  expect(subwayState('wide',NaN)).toEqual(subwayState('wide',0));
});

test('each vocal part uses physical phones and telemetry on the source clock',()=>{
  expect(score.parts.map(part=>part.id)).toEqual(['lead','double','pa','backing']);
  expect(score.parts.at(-1)?.recordingType).toBe('instrumental');
  expect(score.duration).toBeCloseTo(scene.duration,5);
  expect(scene.cues.filter(c=>c.speaker==='subway-pa')).toHaveLength(1);
  for(const part of score.parts.slice(0,3)){
    const plan=part.performance!;
    const track=readTrack(part.id);
    expect(validPerformance(plan,score.duration)).toBe(true);
    expect(track.duration).toBeCloseTo(scene.duration,1);
    const onset=plan.phrases[0].start;
    expect(onset).toBeGreaterThan(part.id==='lead'?16:part.id==='double'?177:267);
    for(const phrase of plan.phrases){
      const end=phrase.start+phrase.phones.reduce((total,phone)=>total+phone.duration,0);
      let peak=0;
      for(let i=track.indexAt(phrase.start);i<=track.indexAt(end);i++)
        peak=Math.max(peak,track.message(i).t.outRms);
      expect(peak).toBeGreaterThan(.0001);
    }
    for(let i=0;i<track.frames;i++){
      const row=track.message(i).t;
      expect(row.clock).toBeCloseTo(i/20,4);
      expect(row.artic.every(Number.isFinite)).toBe(true);
      if(row.clock<onset-.1) expect(row.outRms).toBeLessThan(.00001);
    }
  }
});

test('the visible singer stays in frame and clear of set geometry through all cuts',()=>{
  const track=readTrack('lead');
  const model=new VoiceModel(track.body,track.sampleRate);
  const stage=new SubwayStage({model,track});
  const headPoint=new THREE.Vector3();
  const ray=new THREE.Raycaster();
  let checked=0;
  try{
    for(const [width,height] of [[960,720],[375,430]]){
      stage.resize(width,height);
      for(const [index,[start,view]] of SUBWAY_SHOTS.entries()){
        const end=SUBWAY_SHOTS[index+1]?.[0]??scene.duration;
        for(const fraction of [.02,.50,.98]){
          const time=start+(end-start)*fraction;
          stage.frame(time,true,index,view,.85);
          const figure=stage.singer;
          if(!figure.root.visible)continue;
          checked++;
          figure.head.scene.traverseVisible(object=>{
            if(figure.ornaments.getObjectById(object.id))return;
            const mesh=object as THREE.Mesh<THREE.InstancedBufferGeometry>;
            const points=mesh.geometry?.getAttribute('instanceStart');
            if(!points)return;
            for(let i=0;i<mesh.geometry.instanceCount;i++){
              headPoint.fromBufferAttribute(points,i).applyMatrix4(mesh.matrixWorld).project(stage.camera);
              const edge=Math.max(Math.abs(headPoint.x),Math.abs(headPoint.y));
              if(!Number.isFinite(edge)||edge>=.995||!Number.isFinite(headPoint.z)||Math.abs(headPoint.z)>=1)
                throw Error(`Head outside ${view} at ${time.toFixed(2)}s and ${width}px`);
            }
          });
          const frame=model.frame(VoiceModel.articFromArray(track.message(track.indexAt(time)).t.artic));
          const upper=frame.upperLip.reduce((a,b)=>a.x>b.x?a:b);
          const lower=frame.lowerLip.reduce((a,b)=>a.x>b.x?a:b);
          const lip=headPoint.set((upper.x+lower.x)*.5,(upper.y+lower.y)*.5,0)
            .applyMatrix4(figure.head.scene.children[0].matrixWorld);
          ray.set(stage.camera.position,lip.clone().sub(stage.camera.position).normalize());
          const distance=lip.distanceTo(stage.camera.position);
          const occluders:THREE.Mesh[]=[];
          stage.scene.traverseVisible(object=>{
            const mesh=object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>;
            if(mesh.isMesh&&mesh.geometry.type!=='LineSegmentsGeometry'&&mesh.material.opacity>.9
              &&(!figure.head.scene.getObjectById(mesh.id)||figure.ornaments.getObjectById(mesh.id)))
              occluders.push(mesh);
          });
          if(ray.intersectObjects(occluders,false).some(hit=>hit.distance<distance-.1))
            throw Error(`Mouth blocked in ${view} at ${time.toFixed(2)}s and ${width}px`);
        }
      }
    }
    expect(checked).toBeGreaterThan(400);
  }finally{stage.dispose();model.dispose();}
},15000);

test('hair, train cars and fountain props follow absolute time after seeks',()=>{
  const track=readTrack('lead');
  const model=new VoiceModel(track.body,track.sampleRate);
  const stage=new SubwayStage({model,track});
  function snapshot(at:number,epoch:number){
    stage.frame(at,true,epoch,'wide',.8);
    return {
      root:stage.singer.root.visible?stage.singer.root.matrixWorld.toArray():[],
      traveler:stage.traveler.visible?stage.traveler.matrixWorld.toArray():[],
      camera:stage.camera.matrixWorld.toArray(),
      water:stage.sets.groups.fountain.visible?stage.sets.jets.map(jet=>jet.position.toArray()):[],
      car:stage.sets.groups['train-side'].visible?stage.sets.outerCar.position.toArray():[],
      rope:stage.sets.groups.sky.visible?stage.sets.rope.rotation.z:0,
    };
  }
  try{
    for(const at of [2,16,44,101,134,169,176,211,252,261,268,271]){
      const first=snapshot(at,1);
      snapshot(172.9,2);
      expect(snapshot(at,3)).toEqual(first);
    }
  }finally{stage.dispose();model.dispose();}
});
