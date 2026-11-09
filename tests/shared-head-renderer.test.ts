import {expect,test} from 'bun:test';
import type {WebGLRenderer} from 'three';
import {createHeadRendererPool} from '../src/ui/render/sharedHeadRenderer.ts';

test('24 mouth scenes share one context and release it only after the last head',()=>{
 let created=0,disposed=0,lost=0;
 const pool=createHeadRendererPool(()=>{created++;return {dispose:()=>disposed++,forceContextLoss:()=>lost++} as unknown as WebGLRenderer;});
 const heads=Array.from({length:24},()=>pool.acquire());
 expect(created).toBe(1);expect(new Set(heads.map(h=>h.renderer)).size).toBe(1);
 heads.slice(0,23).forEach(h=>h.release());expect(disposed).toBe(0);
 heads[0].release();expect(disposed).toBe(0);
 heads[23].release();expect(disposed).toBe(1);expect(lost).toBe(1);
 const next=pool.acquire();expect(created).toBe(2);next.release();expect(disposed).toBe(2);
});

test('a failed context creation does not leave a phantom user in the pool',()=>{
 let fail=true,disposed=0;
 const pool=createHeadRendererPool(()=>{if(fail)throw Error('no WebGL');return {dispose:()=>disposed++,forceContextLoss:()=>{}} as unknown as WebGLRenderer;});
 expect(()=>pool.acquire()).toThrow('no WebGL');fail=false;
 pool.acquire().release();expect(disposed).toBe(1);
});
