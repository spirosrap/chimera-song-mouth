/**
 * Renders the Apollo 11 landing scene into public/scenes/apollo-11/.
 *
 *   bun tools/render-landing-scene.ts            # the three voices in parallel; needs ffmpeg
 *   bun tools/render-landing-scene.ts --plan     # print the timeline only
 *
 * The words are the crew's and the CapCom's, from NASA's air-to-ground and onboard transcripts of
 * 20 July 1969 as collected in the Apollo Lunar Surface Journal (public record), 102:42:08 to
 * 102:46:16 ground elapsed time, with a few asides left out. Each line starts at its mission time,
 * or as soon after as the line before it allows; the lander on screen follows the altitudes and
 * speeds that are called out. Every voice is a CHIMERA airway. No recording is used.
 */
import {readFileSync,writeFileSync,mkdirSync,rmSync,mkdtempSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn,spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Gesture} from '../src/wasm/types.ts';
import type {BandPart} from '../src/band/types.ts';
import {at,landingState,LANDING_CONTACT,LANDING_SHUTDOWN,type LandingSpeaker} from '../src/scene/landing.ts';

await initEngine();
const {EnglishG2P,planPhrases}=await import('../src/wasm/engine.ts');
const {renderPart,BAND_RATE,BAND_HOP}=await import('../src/band/render.ts');
const {clearPhrases}=await import('../src/scene/clarity.ts');
const root=new URL('../',import.meta.url).pathname,out=root+'public/scenes/apollo-11/';
const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(root+'public/data/cmudict.txt.gz')).toString());
const RATE=BAND_RATE,args=process.argv.slice(2),planOnly=args.includes('--plan'),only=args.includes('--voice')?args[args.indexOf('--voice')+1] as LandingSpeaker:undefined;

const part=(id:LandingSpeaker,name:string,body:BandPart['body'],voice:BandPart['voice']):BandPart=>({id,name,role:'',body,volume:1,pan:0,vibrato:0,voice});
const parts:Record<LandingSpeaker,BandPart>={
 armstrong:part('armstrong','Neil Armstrong',{female:.04,child:0},{breathiness:.2,tension:.5}),
 aldrin:part('aldrin','Buzz Aldrin',{female:.24,child:0},{breathiness:.15,tension:.56}),
 capcom:part('capcom','Charlie Duke',{female:.12,child:0},{breathiness:.25,tension:.48}),
};
const manner:Record<LandingSpeaker,{f0:number;rate:number}>={armstrong:{f0:108,rate:1.02},aldrin:{f0:128,rate:1.14},capcom:{f0:116,rate:1.04}};

/**
 * `m` is the mission time [minute, second] after 102:00:00. `say` spells numbers and initials for
 * the dictionary, and respells a few words it says unclearly, without changing the word: "Rah jer"
 * for Roger, "awn" for a stressed "on" (it reduces it to "un"), "dee tent" for detent. Each was
 * checked with Whisper. "Eagle" inside a sentence is still heard as "acre": no respelling helped.
 */
interface Line{m:[number,number];who:LandingSpeaker;text:string;say?:string;rate?:number;f0?:number;intensity?:number;view?:string}
const A='armstrong',B='aldrin',C='capcom';
const lines:Line[]=[
 {m:[42,8],who:C,text:'Eagle, Houston. You’re Go for landing. Over.'},
 {m:[42,13],who:A,text:'Okay. 3000 at 70.',say:'Okay. Three thousand at seventy.'},
 {m:[42,16],who:B,text:'Roger. Understand. Go for landing. 3000 feet.',say:'Rah jer. Understand. Go for landing. Three thousand feet.'},
 {m:[42,19],who:B,text:'Program alarm.',intensity:.8},
 {m:[42,22],who:B,text:'1201.',say:'Twelve oh one.',intensity:.8},
 {m:[42,24],who:A,text:'1201.',say:'Twelve oh one.',intensity:.7},
 {m:[42,25],who:C,text:'Roger. 1201 alarm. We’re Go. Same type. We’re Go.',say:'Rah jer. Twelve oh one alarm. We’re Go. Same type. We’re Go.',intensity:.7},
 {m:[42,31],who:B,text:'2000 feet. 2000 feet.',say:'Two thousand feet. Two thousand feet.'},
 {m:[42,35],who:C,text:'Roger.',say:'Rah jer.'},
 {m:[42,37],who:A,text:'That’s not a bad looking area. Okay. 1000 at 30 is good.',say:'That’s not a bad looking area. Okay. One thousand at thirty is good.',view:'landing-above'},
 {m:[42,43],who:C,text:'Eagle, looking great. You’re Go.'},
 {m:[42,55],who:C,text:'Roger. 1202. We copy it.',say:'Rah jer. Twelve oh two. We copy it.'},
 {m:[43,1],who:B,text:'35 degrees. 35 degrees. 750. Coming down at 23.',say:'Thirty five degrees. Thirty five degrees. Seven fifty. Coming down at twenty three.'},
 {m:[43,7],who:B,text:'700 feet, 21 down, 33 degrees.',say:'Seven hundred feet, twenty one down, thirty three degrees.',view:'wide'},
 {m:[43,10],who:A,text:'Pretty rocky area.',view:'landing-above'},
 {m:[43,11],who:B,text:'600 feet, down at 19.',say:'Six hundred feet, down at nineteen.',view:'landing-above'},
 {m:[43,16],who:B,text:'540 feet, down at… 30. Down at 15.',say:'Five forty feet, down at, thirty. Down at fifteen.'},
 {m:[43,26],who:B,text:'Okay, 400 feet, down at 9. 58 forward.',say:'Okay, four hundred feet, down at nine. Fifty eight forward.',view:'wide'},
 {m:[43,32],who:A,text:'No problem.'},
 {m:[43,33],who:B,text:'350 feet, down at 4.',say:'Three fifty feet, down at four.'},
 {m:[43,36],who:B,text:'330, three and a half down.',say:'Three thirty, three and a half down.',view:'wide'},
 {m:[43,42],who:B,text:'Okay, you’re pegged on horizontal velocity.'},
 {m:[43,46],who:B,text:'300 feet, down 3½, 47 forward. Slow it up.',say:'Three hundred feet, down three and a half, forty seven forward. Slow it up.',view:'landing-above'},
 {m:[43,52],who:B,text:'1½ down. Ease her down. 270.',say:'One and a half down. Ease her down. Two seventy.'},
 {m:[43,58],who:A,text:'Okay, how’s the fuel?'},
 {m:[44,0],who:B,text:'Eight percent.'},
 {m:[44,2],who:A,text:'Okay. Here’s a… Looks like a good area here.',say:'Okay. Here’s a. Looks like a good area here.'},
 {m:[44,4],who:B,text:'I got the shadow out there.',say:'I got thee shadow, out there.',view:'landing-above'},
 {m:[44,7],who:B,text:'250, down at 2½, 19 forward.',say:'Two fifty, down at two and a half, nineteen forward.',view:'landing-above'},
 {m:[44,13],who:B,text:'Altitude velocity lights.'},
 {m:[44,16],who:B,text:'3½ down, 220 feet, 13 forward.',say:'Three and a half down, two twenty feet, thirteen forward.',view:'wide'},
 {m:[44,22],who:B,text:'11 forward. Coming down nicely.',say:'Eleven forward. Coming down nicely.'},
 {m:[44,25],who:A,text:'Gonna be right over that crater.',view:'landing-above'},
 {m:[44,27],who:B,text:'200 feet, 4½ down.',say:'Two hundred feet, four and a half down.',view:'landing-above'},
 {m:[44,29],who:A,text:'I got a good spot.'},
 {m:[44,31],who:B,text:'160 feet, 6½ down.',say:'One sixty feet, six and a half down.',view:'wide'},
 {m:[44,34],who:B,text:'5½ down, 9 forward. You’re looking good.',say:'Five and a half down, nine forward. You’re looking good.'},
 {m:[44,40],who:B,text:'120 feet.',say:'One twenty feet.',view:'landing-ground'},
 {m:[44,45],who:B,text:'100 feet, 3½ down, 9 forward. Five percent. Quantity light.',say:'One hundred feet, three and a half down, nine forward. Five percent. Quantity light.'},
 {m:[44,54],who:B,text:'Okay. 75 feet. And it’s looking good. Down a half, 6 forward.',say:'Okay. Seventy five feet. And it’s looking good. Down a half, six forward.',view:'wide'},
 {m:[45,2],who:C,text:'60 seconds.',say:'Sixty seconds.',intensity:.8},
 {m:[45,4],who:B,text:'Light’s on.',say:'Light’s awn.'},
 {m:[45,8],who:B,text:'60 feet, down 2½. 2 forward. 2 forward. That’s good.',say:'Sixty feet, down two and a half. Two forward. Two forward. That’s good.',view:'landing-ground'},
 {m:[45,17],who:B,text:'40 feet, down 2½. Picking up some dust.',say:'Forty feet, down two and a half. Picking up some dust.',view:'wide'},
 {m:[45,21],who:B,text:'30 feet, 2½ down. Faint shadow.',say:'Thirty feet, two and a half down. Faint, shadow.',view:'landing-above'},
 {m:[45,25],who:B,text:'4 forward. 4 forward. Drifting to the right a little. 20 feet, down a half.',say:'Four forward. Four forward. Drifting to the right a little. Twenty feet, down a half.',view:'landing-ground'},
 {m:[45,31],who:C,text:'30 seconds.',say:'Thirty seconds.',intensity:.9},
 {m:[45,33],who:B,text:'Drifting forward just a little bit; that’s good.',view:'landing-ground'},
 {m:[45,40],who:B,text:'Contact light.',intensity:.9,view:'landing-ground'},
 {m:[45,43],who:A,text:'Shutdown.',intensity:.8,view:'landing-crew'},
 {m:[45,44],who:B,text:'Okay. Engine stop.',say:'Okay. Engine, stop.',view:'landing-crew'},
 {m:[45,46],who:B,text:'ACA out of detent.',say:'Ay see ay out of dee tent.',view:'landing-crew'},
 {m:[45,48],who:A,text:'Out of detent. Auto.',say:'Out of dee tent. Auto.'},
 {m:[45,50],who:B,text:'Mode control, both auto. Descent engine command override, off. Engine arm, off. 413 is in.',say:'Mode control, both auto. Descent engine command override, off. Engine arm, off. Four thirteen is in.'},
 {m:[45,57],who:C,text:'We copy you down, Eagle.'},
 {m:[46,0],who:A,text:'Houston, Tranquility Base here. The Eagle has landed.',rate:.94,intensity:1},
 {m:[46,6],who:C,text:'Roger, Twan… Tranquility. We copy you on the ground. You got a bunch of guys about to turn blue. We’re breathing again. Thanks a lot.',say:'Rah jer, Twan. Tranquility. We copy you awn the ground. You got a bunch of guys about to turn blue. We’re breathing again. Thanks a lot.',intensity:.9},
 {m:[46,16],who:B,text:'Thank you.',view:'landing-crew'},
];

const round=(v:number)=>Math.round(v*100)/100;
interface Placed extends Line{start:number;end:number;late:number}
const gestures:Record<LandingSpeaker,Gesture[]>={armstrong:[],aldrin:[],capcom:[]},placed:Placed[]=[];
let free=0;
for(const line of lines){
 const due=at(...line.m),start=Math.max(due,free),m=manner[line.who];
 const phrases=clearPhrases(g2p.toPhrases((line.say??line.text).replaceAll('’',"'")),parts[line.who].body);
 // A line that starts late is said a little faster, to give the time back.
 const plan=planPhrases(phrases,{body:parts[line.who].body,t0:start,f0:line.f0??m.f0,rate:(line.rate??m.rate)*(1+Math.min(.18,(start-due)*.06))});
 gestures[line.who].push(...plan.gestures);
 placed.push({...line,start:round(start),end:round(plan.end+.12),late:round(start-due)});free=plan.end+.22;
}
const duration=Math.ceil((placed.at(-1)!.end+5)*2)/2,worst=Math.max(...placed.map(p=>p.late));
for(const p of placed)if(!only)console.log(`${p.start.toFixed(2).padStart(7)} – ${p.end.toFixed(2).padStart(7)}  ${p.late?('+'+p.late.toFixed(1)).padStart(5):'     '}  ${p.who.padEnd(9)} ${p.text}`);
if(!only)console.log(`duration ${duration}s · latest line ${worst.toFixed(1)} s behind the mission clock · ${Object.entries(gestures).map(([k,g])=>`${k} ${g.length}`).join(' · ')}`);
if(worst>4)throw Error(`A line starts ${worst.toFixed(1)} s after its mission time; cut or shorten something before it.`);
for(const [text,event,name] of [['Contact light.',LANDING_CONTACT,'the contact light'],['Shutdown.',LANDING_SHUTDOWN,'the shutdown']] as const){
 const p=placed.find(q=>q.text===text)!;if(Math.abs(p.start-event)>2.5)throw Error(`"${text}" is said at ${p.start}, but the picture shows ${name} at ${event}.`);
}
if(planOnly)process.exit(0);
if(only){
 // One voice in its own process: the three render side by side.
 const r=renderPart(wasmModule,parts[only],duration,gestures[only].sort((a,b)=>a.t0-b.t0));
 writeFileSync(args[args.indexOf('--voice')+2],new Uint8Array(r.samples.buffer));writeFileSync(args[args.indexOf('--voice')+3],new Uint8Array(r.tele));process.exit(0);
}
const temp=mkdtempSync(join(tmpdir(),'chimera-landing-')),ids=Object.keys(parts) as LandingSpeaker[];
await Promise.all(ids.map(id=>new Promise<void>((ok,bad)=>spawn(process.execPath,[import.meta.path,'--voice',id,join(temp,id+'.f32'),join(temp,id+'.tele')],{stdio:'inherit'}).on('exit',c=>c?bad(Error(`${id} did not render.`)):ok()))));
const voices=Object.fromEntries(ids.map(id=>{const b=readFileSync(join(temp,id+'.f32')),t=readFileSync(join(temp,id+'.tele'));return [id,{samples:new Float32Array(b.buffer,b.byteOffset,b.byteLength/4),tele:t}];})) as unknown as Record<LandingSpeaker,{samples:Float32Array;tele:Buffer}>;
for(const [id,v] of Object.entries(voices))if(!v.samples.every(Number.isFinite)||!v.samples.some(x=>Math.abs(x)>.01))throw Error(`${id} is silent or unstable.`);

// ---- the mix: everything is heard over the air-to-ground loop ----
const total=Math.ceil(duration*RATE),L=new Float32Array(total),Rt=new Float32Array(total);
const onePole=(x:Float32Array,hz:number,high=false)=>{const a=1-Math.exp(-2*Math.PI*hz/RATE),y=new Float32Array(x.length);let s=0;for(let i=0;i<x.length;i++){s+=a*(x[i]-s);y[i]=high?x[i]-s:s;}return y;};
const level=(x:Float32Array)=>{const blocks:number[]=[];for(let i=0;i+BAND_HOP<=x.length;i+=BAND_HOP){let e=0;for(let j=i;j<i+BAND_HOP;j++)e+=x[j]*x[j];blocks.push(Math.sqrt(e/BAND_HOP));}blocks.sort((a,b)=>b-a);const top=blocks.slice(0,Math.max(1,Math.floor(blocks.filter(b=>b>1e-4).length/10)));return top.reduce((s,v)=>s+v,0)/top.length;};
let seed=1969;const noise=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};
/** A voice channel of the time: 300 Hz to 2.8 kHz, driven a little, with the channel's hiss riding on it. */
function radio(x:Float32Array,gain:number,pan:number,hiss:number){
 const band=onePole(onePole(onePole(onePole(x,2800),2800),300,true),300,true),g=gain/Math.max(1e-6,level(band)),angle=(pan+1)*Math.PI/4,l=Math.cos(angle),r=Math.sin(angle);
 let env=0,tone=0;
 for(let i=0;i<total;i++){
  const v=Math.tanh(band[i]*g*3.2)/3.2;env+=(Math.abs(v)>env?.02:.0004)*(Math.abs(v)-env);tone+=.25*(noise()-tone);
  const y=v+tone*hiss*Math.min(1,env*40);L[i]+=l*y;Rt[i]+=r*y;
 }
}
radio(voices.armstrong.samples,.15,-.12,.012);radio(voices.aldrin.samples,.15,.12,.012);radio(voices.capcom.samples,.15,0,.006);
// Houston's transmissions are keyed with the Quindar tones: 2525 Hz going on, 2475 Hz going off.
for(const p of placed)if(p.who==='capcom')for(const [time,hz] of [[p.start-.3,2525],[p.end+.02,2475]] as const){
 const first=Math.floor(time*RATE);for(let i=0;i<.25*RATE;i++){const k=first+i;if(k<0||k>=total)continue;const v=Math.sin(2*Math.PI*hz*i/RATE)*.035*Math.min(1,i/200,(.25*RATE-i)/200);L[k]+=v;Rt[k]+=v;}
}
// The channel itself, and under it the descent engine as the cabin carried it: gone at "Shutdown".
let hiss=0,brown=0,rumble=0;
for(let i=0;i<total;i++){
 const t=i/RATE,s=t<LANDING_SHUTDOWN?1:Math.max(0,1-(t-LANDING_SHUTDOWN)/.6),fade=Math.min(1,t/1.5);
 hiss+=.2*(noise()-hiss);brown+=.02*(noise()-brown);rumble+=.004*(brown-rumble);
 const crackle=Math.abs(noise())>.99985?noise()*.05:0,v=fade*(hiss*.0035+crackle+rumble*s*s*(2.4+.5*Math.sin(2*Math.PI*.7*t)));
 L[i]+=v;Rt[i]+=v;
}
let peak=0;for(let i=0;i<total;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(Rt[i]));
const master=.86/peak,release=Math.floor(1.5*RATE),pcm=new Int16Array(total*2);
for(let i=0;i<total;i++){const g=master*Math.min(1,i/(.05*RATE),(total-i)/release);pcm[2*i]=Math.round(L[i]*g*32767);pcm[2*i+1]=Math.round(Rt[i]*g*32767);}
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
const cues=placed.map(p=>({start:p.start,end:p.end,speaker:p.who,text:p.text,intensity:p.intensity??.5}));
// The CapCom and the commander are watched as they speak; Aldrin's calls alternate between his face
// and what he is describing, unless a line names its view.
const shots:{time:number;view:string}[]=[{time:0,view:'wide'}];
const cut=(time:number,view:string)=>{const last=shots.at(-1)!;if(last.view===view)return;if(time-last.time<1.1&&shots.length>1)shots.pop();if(shots.at(-1)?.view!==view)shots.push({time:round(Math.max(0,time)),view});};
let calls=0;
for(const p of placed)cut(p.start-.25,p.view??(p.who==='aldrin'?(calls++%2?(landingState(p.start).altitude>9000?'wide':'landing-above'):'aldrin'):p.who));
cut(placed.at(-1)!.end+.8,'wide');
const scene={
 setting:'moon',title:'Apollo 11 · The Eagle has landed',
 description:'The last four minutes of the first landing on the Moon, on the mission clock.',
 duration,audio:'mix.mp3',
 characters:[
  {id:'armstrong',name:'Neil Armstrong',role:'Commander · flying the lander by hand, and saying little',tele:'armstrong.tele',telemetryEncoding:'gzip'},
  {id:'aldrin',name:'Buzz Aldrin',role:'Lunar module pilot · reading height and speed aloud',tele:'aldrin.tele',telemetryEncoding:'gzip'},
  {id:'capcom',name:'Charlie Duke',role:'CapCom in Houston · the one voice from Earth',tele:'capcom.tele',telemetryEncoding:'gzip'},
 ],
 cues,shots,
};
writeFileSync(out+'scene.json',JSON.stringify(scene));
writeFileSync(out+'credits.txt',[
 'Apollo 11, 20 July 1969: the landing of the lunar module Eagle, 102:42:08 to 102:46:16 ground elapsed time.',
 'The words are Neil Armstrong\'s, Buzz Aldrin\'s and CapCom Charlie Duke\'s, from NASA\'s air-to-ground and onboard voice transcripts',
 'as collected in the Apollo Lunar Surface Journal (public record). A few asides are left out; nothing is added.',
 'Each line starts at its mission time or just after. The lander follows the altitudes and speeds called out; speeds before "58 forward" are estimates.',
 'Physical voices, radio sound, Quindar tones and engine rumble: CHIMERA. No recording of the mission is used.',
 'Timing and pronunciation are approximate.',
 '',
].join('\n'));
console.log(`${cues.length} cues · ${shots.length} shots · wrote ${out}`);
