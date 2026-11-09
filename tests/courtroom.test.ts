import {expect,test} from 'bun:test';
import {initEngine,wasmModule} from './harness.ts';
import {TeleTrack} from '../src/show/tele.ts';
import {renderPart} from '../src/band/render.ts';
await initEngine();
const {Courtroom}=await import('../src/ui/render/courtroom.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
test('the courtroom contains two working airway heads and every camera can frame them after a seek',()=>{
 const part={id:'voice',name:'Actor',role:'Speech',body:{female:0,child:0},volume:1,pan:0};
 const track=new TeleTrack(renderPart(wasmModule,part,.2,[]).tele);
 const models=[new VoiceModel(part.body,48000),new VoiceModel({...part.body,female:.14},48000)];
 const court=new Courtroom([{id:'kaffee',track,model:models[0]},{id:'jessep',track,model:models[1]}]);
 try{
  expect(court.actors.map(a=>a.id)).toEqual(['kaffee','jessep']);
  expect(court.actors[0].root.position.x).not.toBe(court.actors[1].root.position.x);
  expect(court.scene.children.length).toBeGreaterThan(90);
  for(const view of ['wide','kaffee','jessep'] as const){
   court.resize(1280,720);court.frame(.1,true,1,view,.8,view==='wide'?'judge':view);
   expect(court.camera.matrixWorld.elements.every(Number.isFinite)).toBe(true);
   const actor=court.actors.find(a=>a.id===view);
   if(actor){const point=actor.root.position.clone();point.y+=10;point.project(court.camera);expect(Math.abs(point.x)).toBeLessThan(.3);expect(Math.abs(point.y)).toBeLessThan(.4);expect(point.z).toBeLessThan(1);}
  }
  court.frame(0,false,2,'wide',0);expect(court.actors.every(a=>a.arm.rotation.x===0)).toBe(true);
 }finally{court.dispose();models.forEach(m=>m.dispose());}
});

test('timed transcript punctuation cannot bypass the pronunciation dictionary',async()=>{
 const {speechWord}=await import('../src/scene/speech.ts');
 const {EnglishG2P}=await import('../src/wasm/engine.ts');
 const {readFileSync}=await import('node:fs');const {gunzipSync}=await import('node:zlib');
 const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
 expect(speechWord(g2p,' answers? ')).toEqual(g2p.toPhrases('answers?')[0].segments);
 expect(speechWord(g2p,' can’t!')).toEqual(g2p.toPhrases("can't.")[0].segments);
 expect(speechWord(g2p,' ... ')).toEqual([]);
});
