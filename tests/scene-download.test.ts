import {test,expect} from 'bun:test';
import {sceneVideoUrl} from '../src/scene/download.ts';
test('hosted video overrides preserve the local download in ordinary builds',()=>{
 expect(sceneVideoUrl('/scenes/a-few-good-men/','for-x.mp4','')).toBe('/scenes/a-few-good-men/for-x.mp4');
 const release='https://github.com/spirosrap/chimera-song-mouth/releases/download/v1.0.0/for-x.mp4';
 expect(sceneVideoUrl('/scenes/a-few-good-men/','for-x.mp4',release)).toBe(release);
 expect(sceneVideoUrl('/scenes/princess-bride/','other.mp4',release)).toBe('/scenes/princess-bride/other.mp4');
});
