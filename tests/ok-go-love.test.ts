import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
import {sceneCamera,validateScene} from '../src/scene/scene.ts';
import {LOVE_CAST,LOVE_PASSAGES,loveState} from '../src/scene/ok-go-love.ts';
import {TeleTrack} from '../src/show/tele.ts';

await initEngine();
const {VoiceModel}=await import('../src/ui/analysis.ts');
const {LoveStage}=await import('../src/ui/render/ok-go-love.ts');

const read=(name:string)=>readFileSync(new URL('../public/scenes/ok-go-love/'+name,import.meta.url));
const scene=validateScene(JSON.parse(read('scene.json').toString()));
const score:Arrangement=JSON.parse(read('performance.json').toString());

function readTrack(name:string) {
  const raw=gunzipSync(read(name+'.tele.gz'));
  return new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length));
}

test('Love appends the complete station and mirror performance',()=>{
  const index=MOVIE_SCENES.findIndex(scene=>scene.id==='ok-go-love');
  expect(MOVIE_SCENES[index-1]?.id).toBe('ss26');
  expect(movieScene('ok-go-love')).toHaveProperty('assetVersion','ok-go-love-20261118');
  expect(scene.characters.map(person=>person.id)).toEqual([...LOVE_CAST]);
  expect(scene.shots).toEqual(LOVE_PASSAGES.map(([time,view])=>({time,view})));
  expect(scene.duration).toBeCloseTo(262.3872,3);
  for(const [at,view] of [
    [4,'love-count'],[12,'love-wake'],[18.5,'love-hall'],[35,'love-discs'],[46,'love-ellipses'],
    [73.5,'love-triangle-fill'],[96,'love-balloons'],[106,'love-balloon-spill'],
    [113,'love-swap'],[137,'love-lens'],[157,'love-prism'],[177,'love-vest'],
    [191,'love-crystal-close'],[221,'love-giants'],[226,'love-mirrors-open'],
    [241,'love-celebrate'],[258,'love-credits'],
  ] as const) expect(sceneCamera(scene,at,'auto')).toBe(view);
  expect(loveState('wide',NaN)).toEqual(loveState('wide',0));
});

test('the three physical voices have complete phrases and source-timed articulations',()=>{
  expect(score.parts.map(part=>part.id)).toEqual(['lead','harmony','crew','backing']);
  expect(score.parts.at(-1)?.recordingType).toBe('instrumental');
  expect(score.duration).toBeCloseTo(scene.duration,5);
  expect(scene.cues.some(c=>c.speaker==='love-crew'&&c.start>237)).toBe(true);
  for(const part of score.parts.slice(0,3)){
    const plan=part.performance!;
    const track=readTrack(part.id);
    expect(validPerformance(plan,score.duration)).toBe(true);
    expect(track.duration).toBeCloseTo(scene.duration,1);
    const onset=plan.phrases[0].start;
    expect(onset).toBeGreaterThanOrEqual(part.id==='lead'?20:part.id==='harmony'?65:0);
    expect(onset).toBeLessThan(part.id==='lead'?23:part.id==='harmony'?69:2);
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
      if(row.clock<onset-.1||row.clock>(part.id==='crew'?254:234))
        expect(row.outRms).toBeLessThan(.00001);
    }
  }
});

function makePeople() {
  return LOVE_CAST.map((id,i)=>{
    const track=readTrack(['lead','harmony','crew'][i]);
    return {id,track,model:new VoiceModel(track.body,track.sampleRate)};
  });
}

test('the visible singer stays in frame and clear of set geometry through all cuts',()=>{
  const people=makePeople();
  const stage=new LoveStage(people);
  const headPoint=new THREE.Vector3();
  const ray=new THREE.Raycaster();
  let checked=0;
  try{
    for(const [width,height] of [[960,720],[375,430]]){
      stage.resize(width,height);
      for(const [index,[start,view]] of LOVE_PASSAGES.entries()){
        const end=LOVE_PASSAGES[index+1]?.[0]??scene.duration;
        for(const fraction of [.02,.50,.98]){
          const time=start+(end-start)*fraction;
          stage.frame(time,true,index,'wide',.85);
          const actors=stage.actors;
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
              if(mesh.isMesh&&mesh.geometry.type!=='LineSegmentsGeometry'&&mesh.material.depthTest&&mesh.material.depthWrite&&mesh.material.opacity>.9
                &&(!figure.head.scene.getObjectById(mesh.id)||figure.ornaments.getObjectById(mesh.id)))
                occluders.push(mesh);
            });
            if(ray.intersectObjects(occluders,false).some(hit=>hit.distance<distance-.1))
              throw Error(`Mouth blocked in ${view} at ${time.toFixed(2)}s and ${width}px`);
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(170);
  }finally{stage.dispose();people.forEach(person=>person.model.dispose());}
},15000);

test('the continuous view and articulated mirror poses restore after seeking',()=>{
  const people=makePeople();
  const stage=new LoveStage(people);
  function snapshot(at:number,epoch:number){
    stage.frame(at,true,epoch,'wide',.8);
    return {
      cast:stage.actors.map(({figure})=>figure.root.visible?figure.root.matrixWorld.toArray():[]),
      camera:stage.camera.matrixWorld.toArray(),
      arms:stage.arms.filter(a=>a.root.visible).map(a=>a.panel.matrixWorld.toArray()),
      pattern:stage.mirrors.material.uniforms.mode.value,
      balloons:stage.balloons.g.visible?stage.balloons.balls.map(b=>b.position.toArray()):[],
    };
  }
  try{
    for(const at of [4,22,36,49.5,73,92,107,112,140,157,186,205,224,242,260]){
      const first=snapshot(at,1);
      snapshot(30.2,2);
      expect(snapshot(at,3)).toEqual(first);
    }
    for(const [at] of LOVE_PASSAGES.slice(1)){
      const before=snapshot(at-.0001,4).camera;
      const after=snapshot(at+.0001,4).camera;
      expect(Math.max(...before.map((v,i)=>Math.abs(v-after[i])))).toBeLessThan(.04);
    }
    expect(snapshot(220,7).arms).toHaveLength(4);
  }finally{stage.dispose();people.forEach(person=>person.model.dispose());}
});

test('the render-target pass shares one live image and restores the main renderer target',()=>{
  const people=makePeople();
  const stage=new LoveStage(people);
  const previous=new THREE.WebGLRenderTarget(64,64);
  const target=stage.mirrors.target;
  const ops:string[]=[];
  const renderer={
    getRenderTarget:()=>previous,
    setRenderTarget:(r:THREE.WebGLRenderTarget)=>ops.push(r===target?'reflection':r===previous?'restore':'unknown'),
    clear:()=>ops.push('clear'),
    render:(scene:THREE.Scene)=>{
      expect(scene).toBe(stage.portraitScene);
      ops.push('render');
    },
  } as unknown as THREE.WebGLRenderer;
  try{
    stage.frame(187,true,0,'wide',1,'love-damian');
    expect(stage.mirrors.material.uniforms.portrait.value).toBe(target.texture);
    for(const {face} of stage.arms)expect((face.material as THREE.MeshBasicMaterial).map).toBe(target.texture);
    stage.renderReflections(renderer);
    expect(ops).toEqual(['reflection','clear','render','restore']);
  }finally{previous.dispose();stage.dispose();people.forEach(person=>person.model.dispose());}
});
