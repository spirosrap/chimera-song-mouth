import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {validateScene,sceneCue,sceneCamera} from '../src/scene/scene.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {PressConference}=await import('../src/ui/render/pressConference.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const base=new URL('../public/scenes/fool-me-once/',import.meta.url);
const scene=validateScene(JSON.parse(readFileSync(new URL('scene.json',base),'utf8')));
const raw=gunzipSync(readFileSync(new URL('bush.tele.gz',base)));
const track=new TeleTrack(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));

test('a single-speaker speech loads alongside the movies without weakening their cast requirements',()=>{
  expect(MOVIE_SCENES.map(s=>s.id)).toEqual(['a-few-good-men','princess-bride','hal-9000','fool-me-once','project-hail-mary','contact','arrival','matrix-spoon','cuckoos-nest','wizard-of-oz','sagan-dimensions','apollo-11','apollo-13','nessun-dorma','dimash-sos','rechenka','tears-in-rain','big-lebowski','tars','good-will-hunting','truman-show','celentano','frontier-psychiatrist','mahna-mahna','o-superman','celine-coming-back','vitas-7th-element','stonehenge','once-in-a-lifetime','autumn-leaves','whats-he-building','said-i-loved-you','total-eclipse','anything-for-love','making-love','fade-into-you']);
  expect(movieScene('fool-me-once')).toBeDefined();expect(scene.characters.map(c=>c.id)).toEqual(['bush']);
  expect(scene.setting).toBe('press');expect(track.duration).toBeCloseTo(scene.duration,1);
  expect(readFileSync(new URL('mix.mp3',base)).length).toBeGreaterThan(100_000);
  expect(()=>validateScene({...scene,setting:'courtroom'})).toThrow('incomplete');
  expect(()=>validateScene({...scene,setting:'courtroom',characters:[...scene.characters,{id:'kaffee',name:'Counsel',role:'Questioning',tele:'kaffee.tele'}]})).toThrow('character');
  expect(()=>validateScene({...scene,shots:[{time:0,view:'jessep'}]})).toThrow('camera');
  expect(()=>validateScene({...scene,characters:[]})).toThrow('incomplete');
  const court=JSON.parse(readFileSync(new URL('../public/scenes/a-few-good-men/scene.json',import.meta.url),'utf8'));
  court.characters=court.characters.filter((c:{id:string})=>c.id!=='jessep');
  expect(()=>validateScene(court)).toThrow('main scene characters');
});

test('hesitations, punchline captions and camera cuts use the audio clock after a backwards seek',()=>{
  expect(sceneCue(scene,13)?.text).toBe('Shame on…');expect(sceneCue(scene,14)).toBeUndefined();
  expect(sceneCue(scene,19.5)).toBeUndefined();expect(sceneCue(scene,21)?.text).toContain("can't get fooled");
  expect(sceneCamera(scene,13,'auto')).toBe('bush');expect(sceneCamera(scene,2,'auto')).toBe('wide');
  expect(sceneCue(scene,2)?.text).toContain('Tennessee');
});

test('the actual speech mouth and staged gesture freeze, seek and stay framed on phone and desktop',()=>{
  const model=new VoiceModel(track.body,track.sampleRate),stage=new PressConference(model,track),update=spyOn(stage.head,'update');
  let released=0,meshes=0;
  stage.scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;o.geometry.addEventListener('dispose',()=>released++);}});
  const geometry=()=>{
    const values:number[]=[];
    stage.hands.group.traverseVisible(o=>{const m=o as THREE.Mesh<THREE.InstancedBufferGeometry>;const a=m.geometry?.getAttribute('instanceStart');if(a)for(let i=0;i<m.geometry.instanceCount;i++)values.push(a.getX(i),a.getY(i),a.getZ(i));});return values;
  };
  try{
    for(const [w,h] of [[1280,720],[375,211],[320,180],[375,430]])for(const view of ['wide','bush'] as const){
      stage.resize(w,h);
      for(const t of [2,14,15.6,19.5,21.5,0]){
        stage.frame(t,true,1,view,.7,'bush');
        const articulation=VoiceModel.articFromArray(track.message(track.indexAt(t)).t.artic);
        expect(update.mock.calls.at(-1)![2]).toEqual(articulation);
        const before=geometry();stage.frame(t,false,1,view,0);stage.frame(t,false,1,view,0);
        expect(geometry()).toEqual(before);expect(update.mock.calls.at(-1)![3]).toBeNull();
        stage.frame(24,true,2,view,.7);stage.frame(t,true,3,view,.7);expect(geometry()).toEqual(before);
        let count=0,framed=true;
        for(const object of [stage.head.scene,stage.microphones.group])object.traverseVisible(o=>{
          const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>;const a=mesh.geometry?.getAttribute('instanceStart');if(!a)return;
          for(let i=0;i<mesh.geometry.instanceCount;i++){
            const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).project(stage.camera);
            count++;framed&&=[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.99&&Math.abs(p.y)<.99&&p.z<1;
          }
        });
        expect(count).toBeGreaterThan(1000);expect(framed).toBe(true);
      }
    }
  }finally{update.mockRestore();stage.dispose();model.dispose();}
  expect(stage.hair.group.parent).toBeNull();expect(released).toBe(meshes);
});
