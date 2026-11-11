/**
 * Renders the Apollo 13 scene into public/scenes/apollo-13/.
 *
 *   bun tools/render-odyssey-scene.ts            # the five voices in parallel; needs ffmpeg
 *   bun tools/render-odyssey-scene.ts --plan     # print the timeline only
 *
 * The words are the crew's, the CapCom's and the flight director's on 13 April 1970, from NASA's
 * air-to-ground transcript and the flight director's loop as collected in the Apollo 13 Flight
 * Journal (public record): 055:52:58 to 055:58:33 ground elapsed time, then 056:08:57 to
 * 056:10:46. Hesitations and some exchanges are left out; nothing is added. The silences are
 * shortened: in the mission the bang came 101 seconds after "Stand by". No recording is used.
 */
import {readFileSync,writeFileSync,mkdirSync,rmSync,mkdtempSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn,spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Gesture} from '../src/wasm/types.ts';
import type {BandPart} from '../src/band/types.ts';
import {ODYSSEY_STIR,ODYSSEY_BANG,ODYSSEY_LATER,odysseyState,type OdysseySpeaker} from '../src/scene/odyssey.ts';

await initEngine();
const {EnglishG2P,planPhrases}=await import('../src/wasm/engine.ts');
const {renderPart,BAND_RATE,BAND_HOP}=await import('../src/band/render.ts');
const {clearPhrases}=await import('../src/scene/clarity.ts');
const root=new URL('../',import.meta.url).pathname,out=root+'public/scenes/apollo-13/';
const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(root+'public/data/cmudict.txt.gz')).toString());
const RATE=BAND_RATE,args=process.argv.slice(2),planOnly=args.includes('--plan'),only=args.includes('--voice')?args[args.indexOf('--voice')+1] as OdysseySpeaker:undefined;

const part=(id:OdysseySpeaker,name:string,body:BandPart['body'],voice:BandPart['voice']):BandPart=>({id,name,role:'',body,volume:1,pan:0,vibrato:0,voice});
const parts:Record<OdysseySpeaker,BandPart>={
 lovell:part('lovell','Jim Lovell',{female:.06,child:0},{breathiness:.2,tension:.5}),
 swigert:part('swigert','Jack Swigert',{female:.2,child:0},{breathiness:.18,tension:.54}),
 haise:part('haise','Fred Haise',{female:.3,child:0},{breathiness:.22,tension:.5}),
 capcom:part('capcom','Jack Lousma',{female:.12,child:0},{breathiness:.25,tension:.48}),
 kranz:part('kranz','Gene Kranz',{female:0,child:0},{breathiness:.12,tension:.62}),
};
const manner:Record<OdysseySpeaker,{f0:number;rate:number}>={lovell:{f0:104,rate:1.02},swigert:{f0:122,rate:1.05},haise:{f0:134,rate:1.05},capcom:{f0:114,rate:1.04},kranz:{f0:98,rate:1.0}};

/**
 * `say` spells numbers and initials for the dictionary and respells a few words it says unclearly,
 * without changing the word ("Rah jer" for Roger, "awn" for a stressed "on", "hadd" where the
 * dictionary's weak "had" was heard as "heard"). `gap` is the silence
 * before the line; `at` pins a line to one of the scene's fixed moments.
 */
interface Line{who:OdysseySpeaker;text:string;say?:string;gap?:number;at?:number;rate?:number;f0?:number;intensity?:number;view?:string}
const L='lovell',S='swigert',H='haise',C='capcom',K='kranz';
const lines:Line[]=[
 {who:C,text:'13, we’ve got one more item for you, when you get a chance. We’d like you to stir up your cryo tanks.',say:'Thirteen, we’ve got one more item for you, when you get a chance. We’d like you to stir up your cry oh tanks.',at:3},
 {who:C,text:'In addition, I have shaft and trunnion…',say:'In addition, I have shaft and trunnion.',gap:.4},
 {who:S,text:'Okay.',gap:.3},
 {who:C,text:'…for looking at the Comet Bennett, if you need it.',say:'For looking at the Comet Bennett, if you need it.',gap:.3},
 {who:S,text:'Okay. Stand by.',gap:.7,view:'odyssey-crew'},
 // ---- the bang ----
 {who:S,text:'Okay, Houston, we’ve had a problem here.',at:ODYSSEY_BANG+5.5,intensity:.9},
 {who:C,text:'This is Houston. Say again, please.',gap:1.4,intensity:.7},
 {who:L,text:'Houston, we’ve had a problem. We’ve had a Main B Bus Undervolt.',say:'Houston, we’ve hadd a problem. We’ve hadd a Main B Bus Under volt.',gap:1.2,rate:.96,intensity:1},
 {who:C,text:'Roger. Main B Undervolt.',say:'Rah jer. Main B Under volt.',gap:.9,intensity:.7},
 {who:C,text:'Okay, stand by, 13. We’re looking at it.',say:'Okay, stand by, thirteen. We’re looking at it.',gap:2.2},
 {who:H,text:'Okay. Right now, Houston, the voltage is looking good. And we had a pretty large bang associated with the Caution and Warning there.',gap:1.6,intensity:.7},
 {who:H,text:'And as I recall, Main B was the one that had had an amp spike on it once before.',gap:.5},
 {who:C,text:'Roger, Fred.',say:'Rah jer, Fred.',gap:1.2},
 {who:H,text:'In the interim here, we’re starting to go ahead and button up the tunnel again.',gap:1.6},
 {who:C,text:'Roger.',say:'Rah jer.',gap:.8},
 {who:H,text:'That jolt must have rocked the sensor on O2 Quantity 2. It was oscillating down around 20 to 60 percent. Now it’s full-scale high again.',say:'That jolt must have rocked the sensor on oh two Quantity two. It was oscillating down around twenty to sixty percent. Now it’s full scale high again.',gap:.9,view:'odyssey-crew'},
 {who:C,text:'Roger.',say:'Rah jer.',gap:.9},
 {who:L,text:'And, Houston, we had a Restart on our computer and we had a PGNCS light and the Restart Reset.',say:'And, Houston, we had a Restart awn our computer and we had a pings light and the Restart Reset.',gap:1.4},
 {who:C,text:'Roger. Restart and a PGNCS light.',say:'Rah jer. Restart and a pings light.',gap:.8},
 {who:H,text:'Okay, AC 2 is showing zip. I’m going to try to reconfigure on that, Jack.',say:'Okay, A C two is showing zip. I’m going to try to reconfigure awn that, Jack.',gap:1.6,intensity:.7},
 {who:C,text:'Roger.',say:'Rah jer.',gap:.7},
 {who:H,text:'We got a Main Bus A Undervolt now, too, showing.',say:'We got a Main Bus A Under volt now, too, showing.',gap:1.8,intensity:.8,view:'odyssey-crew'},
 {who:C,text:'Main A Undervolt.',say:'Main A Under volt.',gap:.8},
 {who:H,text:'It’s reading about 25½. Main B is reading zip right now.',say:'It’s reading about twenty five and a half. Main B is reading zip right now.',gap:.9,intensity:.8},
 // ---- ten minutes later ----
 {who:L,text:'And, Jack, our O2 quantity number 2 tank is reading zero. Did you get that?',say:'And, Jack, our oh two quantity number two tank is reading zero. Did you get that?',at:ODYSSEY_LATER+2.5,intensity:.8,view:'odyssey-crew'},
 {who:C,text:'O2 Quantity number 2 is zero.',say:'Oh two Quantity number two is zero.',gap:1.3},
 {who:L,text:'And it looks to me, looking out the hatch, that we are venting something.',gap:1.2,rate:.95,intensity:1},
 {who:L,text:'We are venting something out into the… into space.',say:'We are venting something out into the, into space.',gap:.5,rate:.95,intensity:1,view:'odyssey-vent'},
 {who:C,text:'Roger. We copy your venting.',say:'Rah jer. We copy your venting.',gap:1.8,intensity:.8},
 {who:L,text:'It’s a gas of some sort.',gap:1.6,intensity:.8,view:'wide'},
 {who:K,text:'Okay now, let’s everybody keep cool. We got the LM still attached, the LM spacecraft’s good,',say:'Okay now, let’s everybody keep cool. We got the lem still attached, the lem spacecraft’s good,',gap:2.6,rate:.98,intensity:.9},
 {who:K,text:'so if we need to get back home we’ve got a LM to do a good portion of it with.',say:'so if we need to get back home we’ve got a lem to do a good portion of it with.',gap:.35,rate:.98,intensity:.9},
];

const round=(v:number)=>Math.round(v*100)/100;
interface Placed extends Line{start:number;end:number}
const gestures:Record<OdysseySpeaker,Gesture[]>={lovell:[],swigert:[],haise:[],capcom:[],kranz:[]},placed:Placed[]=[];
let free=0;
for(const line of lines){
 const start=line.at??free+(line.gap??.6),m=manner[line.who];
 if(line.at!==undefined&&line.at<free+.2)throw Error(`"${line.text}" is pinned to ${line.at}, but the line before it ends at ${round(free)}.`);
 const phrases=clearPhrases(g2p.toPhrases((line.say??line.text).replaceAll('’',"'")),parts[line.who].body);
 const plan=planPhrases(phrases,{body:parts[line.who].body,t0:start,f0:line.f0??m.f0,rate:line.rate??m.rate});
 gestures[line.who].push(...plan.gestures);placed.push({...line,start:round(start),end:round(plan.end+.12)});free=plan.end+.12;
}
const before=placed.filter(p=>p.start<ODYSSEY_BANG).at(-1)!,first=placed.filter(p=>p.start<ODYSSEY_LATER).at(-1)!;
if(before.end>ODYSSEY_STIR-.4)throw Error(`"Stand by" ends at ${before.end}; ODYSSEY_STIR is ${ODYSSEY_STIR}. Set it to about ${round(before.end+1)} and ODYSSEY_BANG six seconds later.`);
if(first.end>ODYSSEY_LATER-1.5||first.end<ODYSSEY_LATER-6)throw Error(`The first part ends at ${first.end}; ODYSSEY_LATER is ${ODYSSEY_LATER}. Set it to about ${Math.ceil(first.end+3)}.`);
const duration=Math.ceil((placed.at(-1)!.end+5)*2)/2;
if(!only){for(const p of placed)console.log(`${p.start.toFixed(2).padStart(7)} – ${p.end.toFixed(2).padStart(7)}  ${p.who.padEnd(8)} ${p.text}`);console.log(`duration ${duration}s · stir ${ODYSSEY_STIR} · bang ${ODYSSEY_BANG} · later ${ODYSSEY_LATER} · ${Object.entries(gestures).map(([k,g])=>`${k} ${g.length}`).join(' · ')}`);}
if(planOnly)process.exit(0);
if(only){
 const r=renderPart(wasmModule,parts[only],duration,gestures[only].sort((a,b)=>a.t0-b.t0));
 writeFileSync(args[args.indexOf('--voice')+2],new Uint8Array(r.samples.buffer));writeFileSync(args[args.indexOf('--voice')+3],new Uint8Array(r.tele));process.exit(0);
}
const temp=mkdtempSync(join(tmpdir(),'chimera-odyssey-')),ids=Object.keys(parts) as OdysseySpeaker[];
await Promise.all(ids.map(id=>new Promise<void>((ok,bad)=>spawn(process.execPath,[import.meta.path,'--voice',id,join(temp,id+'.f32'),join(temp,id+'.tele')],{stdio:'inherit'}).on('exit',c=>c?bad(Error(`${id} did not render.`)):ok()))));
const voices=Object.fromEntries(ids.map(id=>{const b=readFileSync(join(temp,id+'.f32')),t=readFileSync(join(temp,id+'.tele'));return [id,{samples:new Float32Array(b.buffer,b.byteOffset,b.byteLength/4),tele:t}];})) as unknown as Record<OdysseySpeaker,{samples:Float32Array;tele:Buffer}>;
for(const [id,v] of Object.entries(voices))if(!v.samples.every(Number.isFinite)||!v.samples.some(x=>Math.abs(x)>.01))throw Error(`${id} is silent or unstable.`);

// ---- the mix ----
const total=Math.ceil(duration*RATE),Lc=new Float32Array(total),Rc=new Float32Array(total);
const onePole=(x:Float32Array,hz:number,high=false)=>{const a=1-Math.exp(-2*Math.PI*hz/RATE),y=new Float32Array(x.length);let s=0;for(let i=0;i<x.length;i++){s+=a*(x[i]-s);y[i]=high?x[i]-s:s;}return y;};
const level=(x:Float32Array)=>{const blocks:number[]=[];for(let i=0;i+BAND_HOP<=x.length;i+=BAND_HOP){let e=0;for(let j=i;j<i+BAND_HOP;j++)e+=x[j]*x[j];blocks.push(Math.sqrt(e/BAND_HOP));}blocks.sort((a,b)=>b-a);const top=blocks.slice(0,Math.max(1,Math.floor(blocks.filter(b=>b>1e-4).length/10)));return top.reduce((s,v)=>s+v,0)/top.length;};
let seed=1970;const noise=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};
/** A voice loop of the time: band-limited, driven a little, with the channel's hiss riding on it. */
function loop(x:Float32Array,gain:number,pan:number,hiss:number,low:number,high:number){
 const band=onePole(onePole(onePole(onePole(x,high),high),low,true),low,true),g=gain/Math.max(1e-6,level(band)),angle=(pan+1)*Math.PI/4,l=Math.cos(angle),r=Math.sin(angle);
 let env=0,tone=0;
 for(let i=0;i<total;i++){
  const v=Math.tanh(band[i]*g*3.2)/3.2;env+=(Math.abs(v)>env?.02:.0004)*(Math.abs(v)-env);tone+=.25*(noise()-tone);
  const y=v+tone*hiss*Math.min(1,env*40);Lc[i]+=l*y;Rc[i]+=r*y;
 }
}
loop(voices.swigert.samples,.15,-.18,.012,300,2800);loop(voices.lovell.samples,.15,0,.012,300,2800);loop(voices.haise.samples,.15,.18,.012,300,2800);
loop(voices.capcom.samples,.15,0,.006,300,2800);
// The flight director is heard on Mission Control's own loop, a little fuller and off to one side.
loop(voices.kranz.samples,.15,.3,.004,180,3600);
// Houston's transmissions to the spacecraft are keyed with the Quindar tones.
for(const p of placed)if(p.who==='capcom')for(const [time,hz] of [[p.start-.3,2525],[p.end+.02,2475]] as const){
 const first=Math.floor(time*RATE);for(let i=0;i<.25*RATE;i++){const k=first+i;if(k<0||k>=total)continue;const v=Math.sin(2*Math.PI*hz*i/RATE)*.035*Math.min(1,i/200,(.25*RATE-i)/200);Lc[k]+=v;Rc[k]+=v;}
}
// The channel's hiss and the cabin's fans; the tank fans the crew switched on; the bang; the master alarm.
let hiss=0,brown=0,hum=0;
for(let i=0;i<total;i++){
 const t=i/RATE,s=odysseyState(t),fade=Math.min(1,t/1.5),cut=Math.min(1,Math.abs(t-ODYSSEY_LATER)/.35);
 hiss+=.2*(noise()-hiss);brown+=.02*(noise()-brown);hum+=.006*(brown-hum);
 const crackle=Math.abs(noise())>.99985?noise()*.05:0,fans=(s.stirred?.012*Math.sin(2*Math.PI*118*t)*(.6+.4*Math.sin(2*Math.PI*3.1*t)):0);
 const v=fade*cut*(hiss*.0035+crackle+hum*1.1+fans);
 Lc[i]+=v;Rc[i]+=v;
}
{
 const start=Math.floor(ODYSSEY_BANG*RATE);let band=0,low=0;
 for(let i=0;i<1.6*RATE&&start+i<total;i++){
  const t=i/RATE;band+=.3*(noise()-band);low+=.03*(band-low);
  const v=Math.sin(2*Math.PI*(52-18*t)*t)*Math.exp(-t/.28)*.5+low*Math.exp(-t/.1)*2.2+(band-low)*Math.exp(-t/.035)*.5+Math.sin(2*Math.PI*190*t)*Math.exp(-t/.5)*.03;
  Lc[start+i]+=v;Rc[start+i]+=v*.92;
 }
 // Two alternating tones, as the master alarm sounded in the crew's headsets, until it is pushed out.
 const alarm=Math.floor((ODYSSEY_BANG+.35)*RATE);
 for(let i=0;i<3.4*RATE&&alarm+i<total;i++){const t=i/RATE,hz=Math.floor(t*2.5)%2?2000:750,v=Math.sin(2*Math.PI*hz*t)*.022*Math.min(1,t/.02,(3.4-t)/.05);Lc[alarm+i]+=v;Rc[alarm+i]+=v;}
}
let peak=0;for(let i=0;i<total;i++)peak=Math.max(peak,Math.abs(Lc[i]),Math.abs(Rc[i]));
const master=.86/peak,release=Math.floor(1.5*RATE),pcm=new Int16Array(total*2);
for(let i=0;i<total;i++){const g=master*Math.min(1,i/(.05*RATE),(total-i)/release);pcm[2*i]=Math.round(Lc[i]*g*32767);pcm[2*i+1]=Math.round(Rc[i]*g*32767);}
mkdirSync(out,{recursive:true});
const wav=out+'mix.wav',header=Buffer.alloc(44);
header.write('RIFF',0);header.writeUInt32LE(36+pcm.byteLength,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);
header.writeUInt32LE(RATE,24);header.writeUInt32LE(RATE*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.byteLength,40);
writeFileSync(wav,Buffer.concat([header,Buffer.from(pcm.buffer)]));
const encoded=spawnSync('ffmpeg',['-y','-v','error','-i',wav,'-codec:a','libmp3lame','-b:a','160k','-map_metadata','-1','-fflags','+bitexact','-flags:a','+bitexact','-id3v2_version','0',out+'mix.mp3'],{stdio:'inherit'});
if(encoded.status!==0)throw Error('ffmpeg could not write the MP3.');
if(!process.env.KEEP_WAV)rmSync(wav);
for(const id of ids)writeFileSync(`${out}${id}.tele.gz`,gzipSync(voices[id].tele,{level:9}));
rmSync(temp,{recursive:true,force:true});

// ---- captions and cameras ----
const cues:{start:number;end:number;speaker:string;text:string;intensity:number}[]=placed.map(p=>({start:p.start,end:p.end,speaker:p.who,text:p.text,intensity:p.intensity??.5}));
// Two things nobody says: what happened in the service module, and the gap in the record.
cues.push({start:ODYSSEY_STIR,end:ODYSSEY_BANG-.2,speaker:'swigert',text:'(Swigert switches on the fans in the oxygen tanks.)',intensity:.2},{start:ODYSSEY_BANG,end:ODYSSEY_BANG+4.6,speaker:'swigert',text:'(A bang. The master alarm sounds.)',intensity:1},{start:round(ODYSSEY_LATER-1.2),end:round(ODYSSEY_LATER+2.2),speaker:'lovell',text:'(Ten minutes later.)',intensity:.2});
cues.sort((a,b)=>a.start-b.start);
cues.forEach((c,i)=>{const next=cues[i+1];if(next&&c.end>next.start)throw Error(`"${c.text}" runs to ${c.end}, into the next line at ${next.start}.`);});
const shots:{time:number;view:string}[]=[{time:0,view:'wide'}];
const cut=(time:number,view:string)=>{const last=shots.at(-1)!;if(last.view===view)return;if(time-last.time<1.1&&shots.length>1)shots.pop();if(shots.at(-1)?.view!==view)shots.push({time:round(Math.max(0,time)),view});};
for(const p of placed){
 if(p.start>ODYSSEY_BANG&&shots.every(s=>s.time<ODYSSEY_STIR)){cut(ODYSSEY_STIR-.3,'odyssey-crew');cut(ODYSSEY_BANG-2.6,'wide');cut(ODYSSEY_BANG+1.2,'odyssey-vent');cut(ODYSSEY_BANG+3,'odyssey-crew');}
 if(p.start>ODYSSEY_LATER&&shots.every(s=>s.time<ODYSSEY_LATER-2))cut(ODYSSEY_LATER-1.2,'wide');
 cut(p.start-.25,p.view??p.who);
}
cut(placed.at(-1)!.end+.9,'wide');
const scene={
 setting:'odyssey',title:'Apollo 13 · Houston, we’ve had a problem',
 description:'An oxygen tank bursts 200,000 miles from Earth, and nobody yet knows what has happened.',
 duration,audio:'mix.mp3',
 characters:[
  {id:'lovell',name:'Jim Lovell',role:'Commander · the one who sees the gas through the hatch window',tele:'lovell.tele',telemetryEncoding:'gzip'},
  {id:'swigert',name:'Jack Swigert',role:'Command module pilot · he stirred the tanks, and reports first',tele:'swigert.tele',telemetryEncoding:'gzip'},
  {id:'haise',name:'Fred Haise',role:'Lunar module pilot · reading the gauges as the power goes',tele:'haise.tele',telemetryEncoding:'gzip'},
  {id:'capcom',name:'Jack Lousma',role:'CapCom in Houston · the only voice the crew hear',tele:'capcom.tele',telemetryEncoding:'gzip'},
  {id:'kranz',name:'Gene Kranz',role:'Flight director · on Mission Control’s own loop',tele:'kranz.tele',telemetryEncoding:'gzip'},
 ],
 cues,shots,
};
writeFileSync(out+'scene.json',JSON.stringify(scene));
writeFileSync(out+'credits.txt',[
 'Apollo 13, 13 April 1970: the oxygen tank failure, 055:52:58 to 055:58:33 and 056:08:57 to 056:10:46 ground elapsed time.',
 'The words are Jim Lovell\'s, Jack Swigert\'s, Fred Haise\'s, CapCom Jack Lousma\'s and flight director Gene Kranz\'s, from NASA\'s',
 'air-to-ground transcript and the flight director\'s loop as collected in the Apollo 13 Flight Journal (public record).',
 'Hesitations and some exchanges are left out; nothing is added. Silences are shortened: the bang came 101 seconds after "Stand by".',
 'Physical voices, radio sound, tones, the bang and the alarm: CHIMERA. No recording of the mission is used.',
 'Timing and pronunciation are approximate.',
 '',
].join('\n'));
console.log(`${cues.length} cues · ${shots.length} shots · wrote ${out}`);
