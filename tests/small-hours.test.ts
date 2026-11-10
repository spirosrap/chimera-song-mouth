import {test,expect} from 'bun:test';
import {smallHoursBand,smallHoursChord,SMALL_HOURS_BARS} from '../src/band/smallHours.ts';
import {BAND_SONGS} from '../src/band/library.ts';
import {MAX_BAND_VOICES} from '../src/band/types.ts';

const song=smallHoursBand(),bar=240/song.bpm;

test('Small Hours keeps its library slot, wordless, for twelve mouths, and fits its stated length',()=>{
 expect(BAND_SONGS[10].id).toBe('small-hours');
 expect(song.wordless).toBe(true);expect(song.parts).toHaveLength(12);expect(song.parts.length).toBeLessThanOrEqual(MAX_BAND_VOICES);
 expect(song.duration).toBe(211);expect(SMALL_HOURS_BARS*bar).toBeLessThan(song.duration-3);
 expect(song.sections.map(s=>s.name)).toEqual(['Streetlight','Stirring','Two-step','Lift','Drop','Alone','Build','Second drop','Together','First light']);
 expect(song.spotlights!.every(s=>song.parts.some(p=>p.id===s.partId))).toBe(true);
});

test('every mouth sings one note at a time, in order and inside the song',()=>{
 for(const part of song.parts){
  let end=0;
  for(const n of part.melody?.notes??[]){
   expect(n.start).toBeGreaterThanOrEqual(end-1e-9);expect(n.duration).toBeGreaterThan(.05);
   expect(n.midi).toBeGreaterThanOrEqual(36);expect(n.midi).toBeLessThanOrEqual(84);
   end=n.start+n.duration;
  }
  expect(end).toBeLessThan(song.duration-3);
  let last=-1;
  for(const b of part.beats??[]){expect(b.time).toBeGreaterThan(last);expect(b.time).toBeLessThan(SMALL_HOURS_BARS*bar);last=b.time;}
  expect(!!part.melody!==!!part.beats).toBe(true);
 }
});

test('the hook is the same four bars under both chord loops, and the lone melody returns over the last lift',()=>{
 const lead=song.parts.find(p=>p.id==='lead')!.melody!.notes,alone=song.parts.find(p=>p.id==='alone')!.melody!.notes;
 const bars=(notes:typeof lead,from:number,count:number)=>notes.filter(n=>n.start>=from*bar-.01&&n.start<(from+count)*bar-.01).map(n=>[n.midi,Math.round((n.start-from*bar)*1000)]);
 expect(bars(lead,16,4)).toEqual(bars(lead,96,4));expect(bars(lead,16,4)).toHaveLength(18);
 expect(smallHoursChord(16)).not.toBe(smallHoursChord(96));
 expect(bars(alone,64,5)).toEqual(bars(alone,96,5));
 expect(alone.every(n=>n.start>=56*bar-.01)).toBe(true);
 // It ends on the major chord, with the lone voice on its third.
 expect(smallHoursChord(111).root%12).toBe(0);expect(alone.at(-1)!.midi%12).toBe(4);
});

test('both drops are preceded by half a bar without the beat',()=>{
 const hits=song.parts.flatMap(p=>p.beats??[]);
 for(const b of [39,79]){
  expect(hits.filter(h=>h.time>=(b+.875)*bar&&h.time<(b+1)*bar)).toHaveLength(0);
  expect(hits.filter(h=>Math.abs(h.time-(b+1)*bar)<.01).length).toBeGreaterThanOrEqual(2);
 }
});
