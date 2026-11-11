/** Rebuild the Project Hail Mary singer, mix and mouth movement from the prepared score. */
import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync,gunzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
await initEngine();
const {EnglishG2P}=await import('../src/wasm/engine.ts');
const {planPart}=await import('../src/band/planning.ts');
const {renderPart}=await import('../src/band/render.ts');
const root=new URL('../',import.meta.url).pathname,out=join(root,'public/scenes/project-hail-mary');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(join(root,'public/data/cmudict.txt.gz'))).toString());
const a:Arrangement=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
const singer=a.parts.find(p=>p.id==='singer')!,backing=a.parts.find(p=>p.kind==='backing')!;
if(!singer?.performance||!backing||!validPerformance(singer.performance,a.duration))throw Error('The prepared karaoke performance is invalid.');
const rendered=renderPart(wasmModule,singer,a.duration,planPart(singer));
if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error('The physical singer is silent or unstable.');
const temp=mkdtempSync(join(tmpdir(),'chimera-karaoke-'));
try{
 const raw=join(temp,'singer.f32'),mix=join(temp,'mix.mp3');writeFileSync(raw,Buffer.from(rendered.samples.buffer));
 const theta=(singer.pan+1)*Math.PI/4,left=Math.cos(theta)*singer.volume,right=Math.sin(theta)*singer.volume;
 const filter=`[0:a]pan=stereo|c0=${left}*c0|c1=${right}*c0[v];[1:a]volume=${backing.volume}[b];[v][b]amix=inputs=2:normalize=0:duration=longest:dropout_transition=0,atrim=end_sample=${rendered.samples.length}[out]`;
 const r=spawnSync('ffmpeg',['-v','error','-y','-f','f32le','-ar','48000','-ac','1','-i',raw,'-i',join(out,'backing.mp3'),'-filter_complex',filter,'-map','[out]','-map_metadata','-1','-c:a','libmp3lame','-b:a','256k',mix],{stdio:'inherit'});
 if(r.status!==0)throw Error('Karaoke mix encoding failed.');
 copyFileSync(mix,join(out,'mix.mp3'));writeFileSync(join(out,'singer.tele.gz'),gzipSync(Buffer.from(rendered.tele),{level:9}));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('Rebuilt the physical singer, original-music mix and synchronized movement. Check the audio, then run bun run content:manifest.');
