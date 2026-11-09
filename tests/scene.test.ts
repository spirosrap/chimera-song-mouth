import {expect,test} from 'bun:test';
import {validateScene,sceneCue,sceneCamera,courtCamera,type SceneFile} from '../src/scene/scene.ts';
const fixture=():SceneFile=>({title:'Courtroom',description:'Two speakers',duration:10,audio:'mix.mp3',characters:[{id:'kaffee',name:'Counsel',role:'Questioning',tele:'kaffee.tele'},{id:'jessep',name:'Witness',role:'Answering',tele:'jessep.tele'}],cues:[{start:1,end:3,speaker:'kaffee',text:'A question?',intensity:.4},{start:4,end:7,speaker:'jessep',text:'An answer.',intensity:.8}],shots:[{time:0,view:'wide'},{time:1,view:'kaffee'},{time:3.5,view:'jessep'}]});
test('subtitles and camera cuts follow the scene clock, including gaps and backwards seeks',()=>{
 const s=validateScene(fixture());expect(sceneCue(s,2)?.speaker).toBe('kaffee');expect(sceneCue(s,3)).toBeUndefined();expect(sceneCue(s,6)?.speaker).toBe('jessep');expect(sceneCue(s,1)?.speaker).toBe('kaffee');
 expect(sceneCamera(s,0,'auto')).toBe('wide');expect(sceneCamera(s,5,'auto')).toBe('jessep');expect(sceneCamera(s,1.5,'auto')).toBe('kaffee');expect(sceneCamera(s,5,'wide')).toBe('wide');
});
test('invalid scores and paths fail before scene audio is fetched',()=>{
 const s=fixture();s.characters[1].id='kaffee';expect(()=>validateScene(s)).toThrow('character');
 const bad=fixture();bad.audio='../mix.mp3';expect(()=>validateScene(bad)).toThrow('incomplete');
 const cue=fixture();cue.cues[0].end=12;expect(()=>validateScene(cue)).toThrow('dialogue');
 const shot=fixture();shot.shots.reverse();expect(()=>validateScene(shot)).toThrow('camera');
});
test('each cinematic camera has a finite view and adapts to a narrow canvas',()=>{
 const positions=new Set<string>();for(const view of ['wide','kaffee','jessep'] as const){const c=courtCamera(view,16/9),n=courtCamera(view,.7);expect([...c.position,...c.target,c.fov].every(Number.isFinite)).toBe(true);expect(n.fov).toBeGreaterThan(c.fov);positions.add(c.position.join(','));}expect(positions.size).toBe(3);
});
test('off-camera judge and prosecutor can speak without becoming camera targets',()=>{
 const s=fixture();s.characters.push({id:'judge',name:'Judge',role:'Presiding',tele:'judge.tele'},{id:'ross',name:'Prosecutor',role:'Objecting',tele:'ross.tele'});
 s.cues[0].speaker='judge';expect(validateScene(s).characters.length).toBe(4);expect(sceneCue(s,2)?.speaker).toBe('judge');
 (s.shots[0] as {view:string}).view='judge';expect(()=>validateScene(s)).toThrow('camera');
});
test('a dialogue cue cannot refer to a missing off-camera voice',()=>{
 const s=fixture();s.cues[0].speaker='judge';expect(()=>validateScene(s)).toThrow('dialogue');
});

test('the cliff scene validates its own cast and rejects cameras or actors from another movie',()=>{
 const s:SceneFile={...fixture(),setting:'cliffs',characters:['vizzini','inigo','fezzik'].map(id=>({id:id as 'vizzini'|'inigo'|'fezzik',name:id,role:'Climber',tele:`${id}.tele`})),cues:[{start:1,end:3,speaker:'inigo',text:'Look down!',intensity:.5}],shots:[{time:0,view:'wide'},{time:1,view:'inigo'},{time:4,view:'climber'}]};
 expect(validateScene(s).setting).toBe('cliffs');expect(sceneCamera(s,5,'auto')).toBe('climber');
 s.shots[1].view='jessep';expect(()=>validateScene(s)).toThrow('camera');s.shots[1].view='inigo';
 s.characters.pop();expect(()=>validateScene(s)).toThrow('main scene characters');
});


test('movie mouths can use lossless gzip telemetry while rejecting unknown encodings',()=>{
 const s=fixture();s.characters[0].telemetryEncoding='gzip';expect(validateScene(s).characters[0].telemetryEncoding).toBe('gzip');
 (s.characters[0] as {telemetryEncoding:string}).telemetryEncoding='unknown';expect(()=>validateScene(s)).toThrow('character');
});
