/** Rebuild the physical Sagan narration and their synchronized conversation mix. */
import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {DialoguePerformance} from '../src/scene/dialogue.ts';
await initEngine();
const {planDialoguePart}=await import('../src/scene/dialogue.ts');
const {clearPhrases,CLEAR_SPEECH_TIGHT}=await import('../src/scene/clarity.ts');
const {renderDialogueVoice}=await import('./render-dialogue-voice.ts');
const out=fileURLToPath(new URL('../public/scenes/sagan-dimensions/',import.meta.url));
const score:DialoguePerformance=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
for(const line of score.lines)line.segments=clearPhrases([{segments:line.segments}],score.parts[0].body,CLEAR_SPEECH_TIGHT)[0].segments;
const temp=mkdtempSync(join(tmpdir(),'chimera-sagan-dimensions-'));
try{
 const inputs:string[]=[],filters:string[]=[],tracks:{id:string;tele:ArrayBuffer}[]=[];
 for(const [index,part] of score.parts.entries()){
  const rendered=renderDialogueVoice(wasmModule,part,score.duration,planDialoguePart(score,part.id));
  if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error('A physical Sagan voice is silent or unstable.');
  const path=join(temp,part.id+'.f32');writeFileSync(path,Buffer.from(rendered.samples.buffer));
  inputs.push('-f','f32le','-ar','48000','-ac','1','-i',path);
  const angle=(part.pan+1)*Math.PI/4;
  filters.push(`[${index}:a]pan=stereo|c0=${Math.cos(angle)*part.volume}*c0|c1=${Math.sin(angle)*part.volume}*c0[v${index}]`);
  tracks.push({id:part.id,tele:rendered.tele});
 }
 inputs.push('-i',join(out,'backing.mp3'));
 filters.push(`[${score.parts.length}:a]volume=${score.backingVolume}[b]`);
 filters.push(`${score.parts.map((_,i)=>`[v${i}]`).join('')}[b]amix=inputs=${score.parts.length+1}:normalize=0:duration=longest:dropout_transition=0,atrim=end_sample=${Math.ceil(score.duration*48000)}[out]`);
 const mix=join(temp,'mix.mp3');
 const r=spawnSync('ffmpeg',['-v','error','-y',...inputs,'-filter_complex',filters.join(';'),'-map','[out]','-map_metadata','-1','-c:a','libmp3lame','-b:a','256k',mix],{stdio:'inherit'});
 if(r.status!==0)throw Error('Sagan mix encoding failed.');
 copyFileSync(mix,join(out,'mix.mp3'));
 for(const track of tracks)writeFileSync(join(out,track.id+'.tele.gz'),gzipSync(Buffer.from(track.tele),{level:9}));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('Rebuilt the physical voices, original-background mix and synchronized movement. Check the audio, then run bun run content:manifest.');
