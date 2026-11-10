import {test,expect} from 'bun:test';
import {noteAudioSpan,performanceRange,performanceWindow} from '../src/band/roll.ts';
test('prepared note boxes use the same lead-in as rendered band audio',()=>{
 expect(noteAudioSpan({start:12,duration:1.5,midi:60})).toEqual({start:12.35,end:13.85});
});
test('the scrolling window handles initial playback, seek, narrow screens and the final phrase',()=>{
 for(const width of [280,700,1400])for(const time of [0,12,120,195]){
  const v=performanceWindow(time,width,195);expect(v.left).toBeGreaterThanOrEqual(0);expect(v.right).toBeLessThanOrEqual(195);
  expect(time).toBeGreaterThanOrEqual(v.left);expect(time).toBeLessThanOrEqual(v.right);
 }
 expect(performanceWindow(2,800,4).left).toBe(0);
});
test('the pitch range keeps the full melody visible with headroom for glides',()=>{
 const r=performanceRange([{start:0,duration:1,midi:45},{start:1,duration:1,midi:72}]);
 expect(r.low).toBeLessThan(45);expect(r.high).toBeGreaterThan(72);
 const single=performanceRange([{start:0,duration:1,midi:60}]);expect(single.high-single.low).toBe(16);
 expect(Object.values(performanceRange([])).every(Number.isFinite)).toBe(true);
});
