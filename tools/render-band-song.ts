/**
 * Renders a song whose score is written in src/band/ into public/band/<id>/.
 *
 *   bun tools/render-band-song.ts small-hours              # every part, one process each; needs ffmpeg
 *   bun tools/render-band-song.ts small-hours --mix x.wav  # also write the stereo mix, for checking
 *
 * Each part is a CHIMERA airway rendered with the same code as the app's own "Render" button,
 * so the prepared files are what the app would produce.
 */
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn,spawnSync} from 'node:child_process';
import {cpus} from 'node:os';
import {initEngine,wasmModule} from '../tests/harness.ts';
import {BAND_SONGS} from '../src/band/library.ts';
import {mixWave} from '../src/band/mixer.ts';

const [id,...flags]=process.argv.slice(2);
const song=BAND_SONGS.find(s=>s.id===id);
if(!song||song.arrangementUrl)throw Error(`"${id}" is not a song with a score in src/band/.`);
const root=new URL('../',import.meta.url).pathname,out=`${root}public/band/${id}/`;
const {parts,duration}=song.arrangement;
const flag=(name:string)=>flags.includes(name)?flags[flags.indexOf(name)+1]:undefined;
const raw=(part:string)=>`${out}${part}.f32`;

const only=flag('--part');
if(only){
  await initEngine();
  const {EnglishG2P}=await import('../src/wasm/engine.ts');
  new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(root+'public/data/cmudict.txt.gz')).toString());
  const {planPart}=await import('../src/band/planning.ts');
  const {renderPart,BAND_RATE}=await import('../src/band/render.ts');
  const part=parts.find(p=>p.id===only)!;
  const {samples,tele}=renderPart(wasmModule,part,duration,planPart(part));
  writeFileSync(raw(only),new Uint8Array(samples.buffer));
  const mp3=spawnSync('ffmpeg',['-y','-v','error','-f','f32le','-ar',String(BAND_RATE),'-ac','1','-i',raw(only),'-codec:a','libmp3lame','-b:a','96k','-map_metadata','-1','-fflags','+bitexact','-flags:a','+bitexact','-id3v2_version','0',`${out}${only}.mp3`],{stdio:'inherit'});
  if(mp3.status!==0)throw Error('ffmpeg could not write the MP3.');
  writeFileSync(`${out}${only}.tele.gz`,gzipSync(new Uint8Array(tele),{level:9}));
  process.exit(0);
}

mkdirSync(out,{recursive:true});
const queue=flag('--only')?parts.filter(p=>flag('--only')!.split(',').includes(p.id)):[...parts];
const pending=[...queue];
await Promise.all(Array.from({length:Math.min(pending.length,Math.max(1,cpus().length-2))},async()=>{
  for(let part=pending.shift();part;part=pending.shift()){
    const partId=part.id,started=Date.now();
    const code=await new Promise<number>(done=>spawn(process.execPath,[import.meta.path,id,'--part',partId],{stdio:'inherit'}).on('exit',c=>done(c??1)));
    if(code!==0)throw Error(`${partId} did not render.`);
    console.log(`${partId} ${((Date.now()-started)/1000).toFixed(0)} s`);
  }
}));
writeFileSync(out+'arrangement.json',JSON.stringify(song.arrangement));
const mix=flag('--mix');
if(mix){
  const samples=parts.map(p=>{const b=readFileSync(raw(p.id));return new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);});
  writeFileSync(mix,mixWave(parts,samples,48000,parts.map(()=>false),parts.map(()=>false)));
}
if(!flags.includes('--keep-raw'))for(const p of parts)rmSync(raw(p.id),{force:true});
