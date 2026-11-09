import {expect,test} from 'bun:test';
import {initEngine,wasmModule} from './harness.ts';
import {renderPart} from '../src/band/render.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {cliffActorPose,pursuerPose,ropeDrop} from '../src/scene/cliffs.ts';
import {movieScene,MOVIE_SCENES} from '../src/scene/library.ts';
await initEngine();
const {Cliffs}=await import('../src/ui/render/cliffs.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
test('the cliff climb, arrival and rope cut restore their positions on backwards seeks',()=>{
 const start=cliffActorPose('fezzik',0),top=cliffActorPose('fezzik',90);
 expect(start.position[1]).toBeLessThan(0);expect(top.position[1]).toBe(159);
 expect(cliffActorPose('vizzini',90).scale).toBeLessThan(top.scale);
 expect(pursuerPose(139)[1]).toBeGreaterThan(pursuerPose(110)[1]);
 expect(ropeDrop(100)).toBe(0);expect(ropeDrop(110)).toBeGreaterThan(1000);expect(ropeDrop(100)).toBe(0);
 expect(cliffActorPose('fezzik',0)).toEqual(start);
});
test('the new movie is an addition and only the existing finished capture has a direct MP4',()=>{
 expect(MOVIE_SCENES.map(m=>m.id)).toEqual(['a-few-good-men','princess-bride']);
 expect(movieScene('a-few-good-men')?.readyVideo).toBe('for-x.mp4');
 expect(movieScene('princess-bride')?.readyVideo).toBeUndefined();expect(movieScene('../invalid')).toBeUndefined();
});
test('three distinct airway heads stay in their close-ups while climbing and on the plateau',()=>{
 const part={id:'test',name:'Voice',role:'Speech',body:{female:0,child:0},volume:1,pan:0};
 const track=new TeleTrack(renderPart(wasmModule,part,.2,[]).tele);
 const ids=['vizzini','inigo','fezzik'] as const,models=ids.map(()=>new VoiceModel(part.body,48000));
 const set=new Cliffs(ids.map((id,i)=>({id,track,model:models[i]})));
 try{
  expect(set.actors.map(a=>a.id)).toEqual([...ids]);expect(set.scene.children.length).toBeGreaterThan(200);
  for(const time of [40,130,0,130])for(const view of ['wide','climber',...ids] as const){
   set.resize(1280,720);set.frame(time,true,time,view,.8,view==='wide'||view==='climber'?'vizzini':view);
   expect(set.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
   const actor=set.actors.find(a=>a.id===view);
   if(actor){const point=actor.root.position.clone();point.y+=10;point.project(set.camera);expect(Math.abs(point.x)).toBeLessThan(.05);expect(Math.abs(point.y)).toBeLessThan(.05);expect(point.z).toBeLessThan(1);}
  }
  set.frame(130,false,132,'wide',0);expect(set.actors.every(a=>a.arms.every(arm=>arm.rotation.x===0))).toBe(true);
  set.frame(40,false,133,'wide',0);expect(set.pursuer.position.toArray()).toEqual(pursuerPose(40));
 }finally{set.dispose();models.forEach(m=>m.dispose());}
});
