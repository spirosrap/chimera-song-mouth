import {test,expect} from 'bun:test';
import {BAND_SONGS,DEFAULT_BAND} from '../src/band/library.ts';
import {featuredVoice,songCaption} from '../src/band/presentation.ts';
import {NIGHT_TRAIN_LINES} from '../src/band/nightTrainWords.ts';
const song={...DEFAULT_BAND.arrangement,spotlights:[{time:2,partId:'bass'},{time:4,partId:'lead'}],captions:[{time:1,end:2,text:'Example line'}]};
test('quartet is a fifth song and preserves the previous songs and default',()=>{
 expect(BAND_SONGS.slice(0,5)).toHaveLength(5);expect(BAND_SONGS[4].id).toBe('night-train-quartet');expect(BAND_SONGS[4].arrangement.presentation).toBe('quartet');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 expect(NIGHT_TRAIN_LINES).toHaveLength(27);
});
test('quartet captions and featured voices share the audio lead-in and survive backwards seeking',()=>{
 expect(songCaption(song,1.34)).toBe('');expect(songCaption(song,1.36)).toBe('Example line');expect(songCaption(song,2.36)).toBe('');
 expect(featuredVoice(song,2.34)).toBe('lead');expect(featuredVoice(song,2.36)).toBe('bass');expect(featuredVoice(song,4.36)).toBe('lead');expect(featuredVoice(song,2.5)).toBe('bass');
});
