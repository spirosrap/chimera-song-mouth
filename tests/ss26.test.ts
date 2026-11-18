import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
import {sceneCamera,validateScene} from '../src/scene/scene.ts';
import {SS26_CAST,SS26_SHOTS,ss26State} from '../src/scene/ss26.ts';
import {TeleTrack} from '../src/show/tele.ts';

await initEngine();
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {SS26Stage}=await import('../src/ui/render/ss26.ts');

const read=(name:string)=>readFileSync(new URL('../public/scenes/ss26/'+name,import.meta.url));
const scene=validateScene(JSON.parse(read('scene.json').toString()));
const score:Arrangement=JSON.parse(read('performance.json').toString());

function readTrack(name:string) {
  const raw=gunzipSync(read(name+'.tele.gz'));
  return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length));
}

test('SS26 appends the full backstage and runway edit',()=>{
  const index=MOVIE_SCENES.findIndex(scene=>scene.id==='ss26');
  expect(MOVIE_SCENES[index-1]?.id).toBe('the-subway');
  expect(movieScene('ss26')).toHaveProperty('assetVersion','ss26-20261118');
  expect(scene.characters.map(person=>person.id)).toEqual([...SS26_CAST]);
  expect(scene.shots).toEqual(SS26_SHOTS.map(([time,view])=>({time,view})));
  expect(scene.duration).toBeCloseTo(172.8975,3);
  for(const [at,view] of [
    [4,'ss26-guest-close'],[10,'ss26-title'],[18.5,'ss26-first-walk'],[28.5,'ss26-backlight'],
    [43.5,'ss26-makeup'],[62.5,'ss26-ivory'],[65.5,'ss26-mirror'],[76,'ss26-overhead'],
    [103,'ss26-floor'],[124,'ss26-sparks'],[134,'ss26-overhead'],[146,'ss26-control'],
    [152.5,'ss26-edge'],[154,'ss26-fall'],[157,'ss26-final-portrait'],[165,'ss26-dissolve'],
    [170,'ss26-whiteout'],
  ] as const) expect(sceneCamera(scene,at,'auto')).toBe(view);
  expect(ss26State('wide',NaN)).toEqual(ss26State('wide',0));
});

test('the two physical voices have complete phrases and source-timed articulations',()=>{
  expect(score.parts.map(part=>part.id)).toEqual(['lead','intro','backing']);
  expect(score.parts.at(-1)?.recordingType).toBe('instrumental');
  expect(score.duration).toBeCloseTo(scene.duration,5);
  expect(scene.cues.filter(c=>c.speaker==='ss26-guest')).toHaveLength(2);
  for(const part of score.parts.slice(0,2)){
    const plan=part.performance!;
    const track=readTrack(part.id);
    expect(validPerformance(plan,score.duration)).toBe(true);
    expect(track.duration).toBeCloseTo(scene.duration,1);
    const onset=plan.phrases[0].start;
    expect(onset).toBeGreaterThan(part.id==='lead'?14:3);
    expect(onset).toBeLessThan(part.id==='lead'?15.5:4.7);
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
      if(row.clock<onset-.1||row.clock>(part.id==='intro'?9:157))
        expect(row.outRms).toBeLessThan(.00001);
    }
  }
});

function makePeople() {
  return SS26_CAST.map((id,i)=>{
    const track=readTrack(i===0?'lead':'intro');
    return {id,track,model:new VoiceModel(track.body,track.sampleRate)};
  });
}

test('the visible singer stays in frame and clear of set geometry through all cuts',()=>{
  const people=makePeople();
  const stage=new SS26Stage(people);
  const headPoint=new THREE.Vector3();
  const ray=new THREE.Raycaster();
  let checked=0;
  try{
    for(const [width,height] of [[960,720],[375,430]]){
      stage.resize(width,height);
      for(const [index,[start,view]] of SS26_SHOTS.entries()){
        const end=SS26_SHOTS[index+1]?.[0]??scene.duration;
        for(const fraction of [.02,.50,.98]){
          const time=start+(end-start)*fraction;
          stage.frame(time,true,index,view,.85);
          const actors=[stage.charli,stage.frontRow,...stage.portraitEchoes];
          for(const {figure} of actors){
            if(!figure.root.visible)continue;
            const {model,track}=figure;
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
              if(mesh.isMesh&&mesh.geometry.type!=='LineSegmentsGeometry'&&mesh.material.depthTest&&mesh.material.opacity>.9
                &&(!figure.head.scene.getObjectById(mesh.id)||figure.ornaments.getObjectById(mesh.id)))
                occluders.push(mesh);
            });
            if(ray.intersectObjects(occluders,false).some(hit=>hit.distance<distance-.1))
              throw Error(`Mouth blocked in ${view} at ${time.toFixed(2)}s and ${width}px`);
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(400);
  }finally{stage.dispose();people.forEach(person=>person.model.dispose());}
},15000);

test('the catwalk costumes, makeup and final portrait echoes restore on seek',()=>{
  const people=makePeople();
  const stage=new SS26Stage(people);
  function snapshot(at:number,epoch:number){
    stage.frame(at,true,epoch,'wide',.8);
    return {
      cast:[stage.charli,stage.frontRow,...stage.portraitEchoes]
        .map(({figure})=>figure.root.visible?figure.root.matrixWorld.toArray():[]),
      camera:stage.camera.matrixWorld.toArray(),
      edge:stage.sets.edge.visible,
      pools:stage.sets.pools.map(pool=>(pool.material as THREE.Material).opacity),
    };
  }
  try{
    expect(stage.portraitEchoes.every(a=>a.figure.model===people[0].model)).toBe(true);
    for(const at of [4,18.5,28.4,44,65,76,103,134,152,157,163,170]){
      const first=snapshot(at,1);
      snapshot(30.2,2);
      expect(snapshot(at,3)).toEqual(first);
    }
  }finally{stage.dispose();people.forEach(person=>person.model.dispose());}
});
