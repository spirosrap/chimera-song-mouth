import {expect,test} from 'bun:test';
import {createModelLeases} from '../src/ui/modelLeases.ts';
import {initEngine} from './harness.ts';

test('all 24 heads retain their models, share matching bodies and free only after the last user',()=>{
 const disposed:number[]=[];let count=0;
 const pool=createModelLeases<string,{id:number;dispose():void}>(()=>{const id=++count;return {id,dispose(){disposed.push(id);}};});
 const heads=Array.from({length:24},(_,i)=>pool.acquire(String(i)));
 expect(disposed).toEqual([]);expect(new Set(heads.map(h=>h.model.id)).size).toBe(24);
 const same=pool.acquire('0');expect(same.model).toBe(heads[0].model);
 heads[0].release();heads[0].release();expect(disposed).toEqual([]);
 same.release();expect(disposed).toEqual([1]);heads.slice(1).forEach(h=>h.release());expect(disposed.length).toBe(24);
 const again=pool.acquire('0');expect(again.model.id).toBe(25);again.release();expect(disposed.length).toBe(25);
});

test('MEGALOVANIA’s 13 body shapes stay drawable after the eight-entry live cache churns',async()=>{
 await initEngine();
 const {acquireModel,getModel}=await import('../src/ui/voiceModels.ts');
 const {VoiceModel}=await import('../src/ui/analysis.ts');
 const {NEUTRAL}=await import('../src/wasm/engine.ts');
 // The first six blank panels in the report used these same continuous body blends.
 const bodies=[0,.8,.3,.65,0,.15,0,.6,.85,.6,.75,.4,.15,.5,.25,0,.2,0,.35,0,.5,0,.5,0];
 const heads=bodies.map(female=>acquireModel({female,child:0},48000));
 try{
  expect(new Set(heads.map(h=>h.model)).size).toBe(13);expect(heads[0].model).toBe(heads[4].model);
  for(let i=0;i<40;i++)getModel({female:i/40,child:.05},48000);
  for(const h of heads){
   expect(h.model).toBeInstanceOf(VoiceModel);
   for(const jaw of [0,.4,.8]){
    const frame=h.model.frame({...NEUTRAL,jaw});
    expect(frame.grid.length).toBeGreaterThan(0);
    expect(frame.grid.every(g=>Number.isFinite(g.area)&&Number.isFinite(g.outer.x)&&Number.isFinite(g.outer.y))).toBe(true);
   }
  }
  heads[0].release();expect(()=>heads[4].model.frame({...NEUTRAL,jaw:.25})).not.toThrow();
 }finally{heads.forEach(h=>h.release());}
 // Remount after complete unmount (including React StrictMode's setup/cleanup/setup cycle).
 const again=acquireModel({female:.8,child:0},48000);
 try{expect(()=>again.model.frame(NEUTRAL)).not.toThrow();expect(again.model).not.toBe(heads[1].model);}finally{again.release();}
});
