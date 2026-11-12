import {test,expect} from 'bun:test';
import {lyricAt,lyricLayout,lyricLines,validLyricVideo} from '../src/band/lyricVideo.ts';
import type {LyricVideoSpec,VocalPerformance} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
const spec=():LyricVideoSpec=>({background:'rainy-city.png',words:[{text:'First',start:1,end:1.3,line:0},{text:'line',start:1.4,end:1.8,line:0},{text:'Next',start:1.8,end:2,line:1},{text:'verse',start:4,end:4.3,line:2}]});
test('lyrics use absolute audio time, preserve last words and can seek backwards through rests',()=>{
 const lines=lyricLines(spec().words);
 expect(lyricAt(lines,0).line).toBeNull();expect(lyricAt(lines,1).active).toBe(0);
 expect(lyricAt(lines,1.35).active).toBe(-1);expect(lyricAt(lines,1.75).line).toBe(lines[0]);expect(lyricAt(lines,1.75).active).toBe(1);
 expect(lyricAt(lines,1.8)).toEqual({line:lines[1],active:0});
 expect(lyricAt(lines,3).line).toBeNull();expect(lyricAt(lines,4).line).toBe(lines[2]);
 expect(lyricAt(lines,1.1)).toEqual({line:lines[0],active:0});expect(lyricAt(lines,5).line).toBeNull();
});
test('lyric video rejects overlapping, missing, out-of-song and path-traversing data',()=>{
 expect(validLyricVideo(spec(),5)).toBe(true);
 for(const mutate of [(s:LyricVideoSpec)=>s.background='../image.png',(s:LyricVideoSpec)=>s.words[1].start=1.1,(s:LyricVideoSpec)=>s.words[0].line=2,(s:LyricVideoSpec)=>s.words[2].end=8,(s:LyricVideoSpec)=>s.words[0].start=NaN,(s:LyricVideoSpec)=>s.words[0].text='']){
  const s=spec();mutate(s);expect(validLyricVideo(s,5)).toBe(false);
 }
});
test('rap scores beyond the old 1800-phone limit are valid but still bounded',()=>{
 const p:VocalPerformance={lyrics:'rap',phrases:[{start:1,phones:Array.from({length:2787},()=>({ipa:'a',duration:.04}))}],contour:Array.from({length:2230},(_,i)=>({time:1+i*.05,hz:150,breath:.8}))};
 expect(validPerformance(p,120)).toBe(true);
 p.phrases[0].phones=Array.from({length:6001},()=>({ipa:'a',duration:.04}));p.contour=Array.from({length:4801},(_,i)=>({time:1+i*.05,hz:150,breath:.8}));
 expect(validPerformance(p,250)).toBe(false);
});
test('the two-line caption band fits small and wide screens without covering the mouth',()=>{
 const words='A rainy city and a robotic mouth keeping every word in time'.split(' ').map((text,i)=>({text,start:i,end:i+1,line:0}));
 for(const [w,h] of [[1280,720],[375,211],[320,180],[1920,1080]]){
  const l=lyricLayout(words,w,h,(text,font)=>text.length*font*.61);
  expect(new Set(l.words.map(x=>x.y)).size).toBeLessThanOrEqual(2);
  for(const x of l.words){expect(x.x).toBeGreaterThan(0);expect(x.x+x.width).toBeLessThan(w);expect(x.y+l.font*.7).toBeLessThan(l.mouth.y);}
  expect(l.mouth.x).toBeGreaterThanOrEqual(0);expect(l.mouth.y+l.mouth.size).toBeLessThan(h);
 }
});
