import {test,expect} from 'bun:test';
import {BAND_SONGS,DEFAULT_BAND,loadBandArrangement} from '../src/band/library.ts';

const cover=BAND_SONGS.find(s=>s.id==='bicep-glue')!;
const fixture=()=>({...DEFAULT_BAND.arrangement,title:'Loaded arrangement'});
const request=(body:unknown,status=200)=>(async()=>new Response(JSON.stringify(body),{status}));

test('cover is an addition with a separately loaded score; existing default stays intact',async()=>{
 expect(BAND_SONGS.slice(0,4).map(s=>s.id)).toEqual(['house-of-the-rising-sun','all-made-of-air','neon-current','bicep-glue']);expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 expect(cover.arrangementUrl).toBe('/band/bicep-glue/arrangement.json');
 expect((await loadBandArrangement(cover,request(fixture()))).title).toBe('Loaded arrangement');
 expect(await loadBandArrangement(DEFAULT_BAND,()=>{throw new Error('must not fetch');})).toBe(DEFAULT_BAND.arrangement);
});

test('missing or incomplete external scores fail before fetching voice assets',async()=>{
 await expect(loadBandArrangement(cover,request({},404))).rejects.toThrow('404');
 await expect(loadBandArrangement(cover,request({duration:270,bpm:130,parts:[],sections:[]}))).rejects.toThrow('incomplete');
 const bad=fixture();bad.parts=bad.parts.map(p=>({...p}));bad.parts[0].id='../wrong';
 await expect(loadBandArrangement(cover,request(bad))).rejects.toThrow('invalid');
 bad.parts[0].id=bad.parts[1].id;
 await expect(loadBandArrangement(cover,request(bad))).rejects.toThrow('invalid');
});

test('24-mouth song is an addition and a full ensemble can load',async()=>{
 const song=BAND_SONGS.find(s=>s.id==='megalovania')!;
 expect(song.arrangement.presentation).toBe('ensemble');
 expect(BAND_SONGS.slice(0,7).map(s=>s.id)).toEqual(['house-of-the-rising-sun','all-made-of-air','neon-current','bicep-glue','night-train-quartet','synnefoula','megalovania']);
 const score=fixture();score.parts=Array.from({length:24},(_,i)=>({...score.parts[0],id:`voice-${i}`}));
 expect((await loadBandArrangement(song,request(score))).parts.length).toBe(24);
 score.parts.push({...score.parts[0],id:'extra'});
 await expect(loadBandArrangement(song,request(score))).rejects.toThrow('incomplete');
});


test('Apricots is an additional full electronic choir and keeps the existing default and songs',async()=>{
 const song=BAND_SONGS.find(s=>s.id==='bicep-apricots')!;
 expect(BAND_SONGS[7]).toBe(song);expect(BAND_SONGS.slice(0,8)).toHaveLength(8);
 expect(song.arrangementUrl).toBe('/band/bicep-apricots/arrangement.json');
 expect(song.arrangement.wordless).toBe(true);expect(song.arrangement.presentation).toBe('ensemble');
 expect(song.arrangement.duration).toBeGreaterThan(248);expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 expect((await loadBandArrangement(song,request(fixture()))).title).toBe('Loaded arrangement');
});


test('the second Greek song adds a backed singer and hand without replacing existing songs',()=>{
 const song=BAND_SONGS[8];
 expect(song.id).toBe('ta-paidia-tou-peiraia');expect(song.arrangement.presentation).toBe('backed-solo');
 expect(song.arrangement.duration).toBeGreaterThan(198);expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 expect(BAND_SONGS.slice(0,8).map(s=>s.id)).toEqual(['house-of-the-rising-sun','all-made-of-air','neon-current','bicep-glue','night-train-quartet','synnefoula','megalovania','bicep-apricots']);
});


test('Rodehihi adds a full backed Greek singer while keeping all previous songs',async()=>{
 const song=BAND_SONGS[9];expect(BAND_SONGS).toHaveLength(11);
 expect(song.id).toBe('rodehihi-den-xanakano-fylaki');expect(song.arrangement.presentation).toBe('backed-solo');
 expect(song.arrangement.duration).toBeGreaterThan(192);expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 expect(BAND_SONGS[8].id).toBe('ta-paidia-tou-peiraia');
 expect((await loadBandArrangement(song,request(fixture()))).title).toBe('Loaded arrangement');
});
