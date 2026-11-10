/** Rebuild one prepared physical singer while preserving its score and backing.
 * bun tools/render-prepared-voice.ts blue-moon lead
 */
import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync,gunzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import {isVoicePart,type Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';

const [id,partId='lead']=process.argv.slice(2);
if(!id||![id,partId].every(s=>/^[a-z0-9-]+$/.test(s)))throw Error('Supply a song ID and voice ID.');
const root=new URL('../',import.meta.url).pathname,out=join(root,'public/band',id);
const score:Arrangement=JSON.parse(readFileSync(join(out,'arrangement.json'),'utf8'));
const part=score.parts.find(p=>p.id===partId);
if(!part||!isVoicePart(part)||!part.performance||!validPerformance(part.performance,score.duration))throw Error('A prepared physical vocal performance is required.');
await initEngine();
const {EnglishG2P}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(join(root,'public/data/cmudict.txt.gz'))).toString());
const {planPart}=await import('../src/band/planning.ts');
const {renderPart}=await import('../src/band/render.ts');
const result=renderPart(wasmModule,part,score.duration,planPart(part));
if(!result.samples.every(v=>Number.isFinite(v)&&Math.abs(v)<1)||!result.samples.some(v=>Math.abs(v)>.001))throw Error('The voice is unstable or silent.');
const temp=mkdtempSync(join(tmpdir(),'chimera-voice-'));
try{
  const raw=join(temp,'voice.f32'),audio=join(temp,'voice.mp3');
  writeFileSync(raw,Buffer.from(result.samples.buffer));
  const encoded=spawnSync('ffmpeg',['-v','error','-y','-f','f32le','-ar','48000','-ac','1','-i',raw,'-map_metadata','-1','-c:a','libmp3lame','-b:a','160k',audio],{stdio:'inherit'});
  if(encoded.status!==0)throw Error('The voice MP3 could not be encoded.');
  copyFileSync(audio,join(out,partId+'.mp3'));
  writeFileSync(join(out,partId+'.tele.gz'),gzipSync(Buffer.from(result.tele),{level:9}));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log(`Rendered ${id}/${partId}; score, backing and mixer levels preserved. Run bun run content:manifest after checking the audio.`);
