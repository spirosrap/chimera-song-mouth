export type CourtCharacterId = 'kaffee' | 'jessep';
export type CliffCharacterId = 'vizzini' | 'inigo' | 'fezzik';
export type CoreCharacterId = 'hal' | 'dave';
export type MainCharacterId = CourtCharacterId | CliffCharacterId | CoreCharacterId | 'bush' | 'karaoke-singer' | 'ellie' | 'father' | 'ian' | 'neo' | 'spoon-boy' | 'oracle-assistant' | 'mcmurphy' | 'cheswick' | 'billy' | 'martini' | 'oz' | 'dorothy' | 'scarecrow' | 'tin-woodman' | 'lion' | 'sagan' | 'armstrong' | 'aldrin' | 'capcom' | 'lovell' | 'swigert' | 'haise' | 'kranz' | 'opera-tenor' | 'opera-chorus' | 'dimash' | 'diana' | 'roy' | 'deckard' | 'dude' | 'walter' | 'donny' | 'jesus' | 'tars' | 'cooper' | 'doyle' | 'sean' | 'will' | 'truman' | 'christof' | 'broadcast-director' | 'network-exec' | 'guard-one' | 'guard-two' | 'sylvia' | 'adriano' | 'classroom-chorus' | 'frontier-headmaster' | 'frontier-mother' | 'frontier-cowboy' | 'frontier-doctor' | 'frontier-announcer' | 'frontier-parrot' | 'mahna' | 'snowth-left' | 'snowth-right' | 'kermit' | 'statler' | 'waldorf' | 'laurie' | 'superman-pulse' | 'celine' | 'vitas' | 'henge-singer' | 'lifetime-singer' | 'cole' | 'watcher' | 'bolton' | 'bonnie' | 'bright-eyes' | 'beast-singer' | 'love-answer' | 'air-singer' | 'air-guitarist' | 'hope' | 'lara';
export type CharacterId = MainCharacterId | 'ross' | 'judge';
export type CameraView = 'wide' | 'climber' | 'modules' | 'listener' | 'contact-sky' | 'contact-hands' | 'louise' | 'matrix-floor' | 'matrix-spoon' | 'ward-pair' | 'ward-group' | 'ward-laughter' | 'ward-nurses' | 'throne-head' | 'throne-row' | 'flatland' | 'dimension-model' | 'landing-above' | 'landing-ground' | 'landing-crew' | 'odyssey-crew' | 'odyssey-vent' | 'opera-orchestra' | 'opera-conductor' | 'opera-choir' | 'concert-singer' | 'concert-band' | 'concert-audience' | 'river-singer' | 'river-dancers' | 'river-judges' | 'river-audience' | 'roof-ledge' | 'roof-dove' | 'roof-sky' | 'bowling-lane' | 'bowling-ball' | 'bowling-pair' | 'bowling-rivals' | 'bowling-shoes' | 'bowling-flashback' | 'brand' | 'romilly' | 'ranger-launch' | 'ranger-separation' | 'ranger-crew' | 'ranger-panel' | 'park-lake' | 'park-bench' | 'park-pair' | 'dome-boat' | 'dome-wall' | 'dome-stairs' | 'dome-exit' | 'dome-sky' | 'control-room' | 'control-monitor' | 'viewers-bar' | 'viewer-bath' | 'security-room' | 'broadcast-end' | 'classroom-front' | 'classroom-back' | 'classroom-side' | 'classroom-harmonica' | 'classroom-audience' | 'theatre-curtain' | 'theatre-orchestra' | 'theatre-drums' | 'theatre-ghosts' | 'theatre-turtle' | 'theatre-cowboys' | 'theatre-blackboard' | 'theatre-dancers' | 'theatre-megaphone' | 'theatre-turntable' | 'puppet-pair' | 'puppet-away' | 'puppet-backstage' | 'puppet-balcony' | 'superman-circle' | 'superman-hands' | 'superman-keyboard' | 'superman-profile' | 'superman-silhouette' | 'mansion-exterior' | 'mansion-road' | 'mansion-bedroom' | 'mansion-mirror' | 'mansion-memory' | 'mansion-window' | 'mansion-corridor' | 'mansion-stairs' | 'vitas-performer' | 'vitas-dancers' | 'vitas-audience' | 'henge-studio' | 'henge-kitchen' | 'henge-bedroom' | 'henge-car' | 'henge-road' | 'henge-monument' | 'henge-night' | 'henge-sunset' | 'lifetime-water' | 'lifetime-copies' | 'lifetime-archive' | 'autumn-chair' | 'autumn-garden' | 'workshop-bench' | 'workshop-window' | 'workshop-shadows' | 'bolton-fire' | 'bolton-cliffs' | 'bolton-cave' | 'bolton-lovers' | 'bolton-horses' | MainCharacterId | 'eclipse-hall' | 'eclipse-stairs' | 'eclipse-curtains' | 'eclipse-dancers' | 'eclipse-eyes' | 'eclipse-courtyard' | 'eclipse-school' | 'beast-chase' | 'beast-mirror' | 'beast-forest' | 'beast-hall' | 'beast-bedroom' | 'beast-duet' | 'beast-police' | 'beast-escape' | 'air-stage' | 'air-street' | 'air-meadow' | 'air-car' | 'air-gas' | 'air-diner' | 'air-silhouette' | 'fade-stage' | 'fade-desert' | 'fade-train' | 'fade-car' | 'fade-stairs' | 'fade-poles' | 'jetaime-warehouse' | 'jetaime-car' | 'jetaime-copies';
export type CameraChoice = 'auto' | CameraView;
export interface SceneCue { start:number; end:number; speaker:CharacterId; text:string; intensity:number }
export interface SceneShot { time:number; view:CameraView }
export type SceneSetting='courtroom'|'cliffs'|'core'|'press'|'karaoke'|'beach'|'arrival'|'matrix'|'ward'|'throne'|'cosmos'|'moon'|'odyssey'|'opera'|'concert'|'river'|'rooftop'|'bowling'|'ranger'|'park'|'dome'|'classroom'|'theatre'|'puppets'|'superman'|'mansion'|'disco'|'henge'|'lifetime'|'autumn'|'workshop'|'bolton'|'eclipse'|'beast'|'airsupply'|'fade'|'jetaime';
/** Each film has its own cast and cameras; a score cannot borrow another film's. */
export const SCENE_SETTINGS:Record<SceneSetting,{cast:CharacterId[];main:CharacterId[];cameras:CameraView[]}>={
  courtroom:{cast:['kaffee','jessep','ross','judge'],main:['kaffee','jessep'],cameras:['wide','kaffee','jessep']},
  cliffs:{cast:['vizzini','inigo','fezzik'],main:['vizzini','inigo','fezzik'],cameras:['wide','climber','vizzini','inigo','fezzik']},
  core:{cast:['hal','dave'],main:['hal','dave'],cameras:['wide','hal','dave','modules']},
  press:{cast:['bush'],main:['bush'],cameras:['wide','bush']},
  beach:{cast:['ellie','father'],main:['ellie','father'],cameras:['wide','ellie','father','contact-sky','contact-hands']},
  matrix:{cast:['neo','spoon-boy','oracle-assistant'],main:['neo','spoon-boy','oracle-assistant'],cameras:['wide','neo','spoon-boy','oracle-assistant','matrix-floor','matrix-spoon']},
  ward:{cast:['mcmurphy','cheswick','billy','martini'],main:['mcmurphy','cheswick','billy','martini'],cameras:['wide','mcmurphy','cheswick','billy','martini','ward-pair','ward-group','ward-laughter','ward-nurses']},
  odyssey:{cast:['lovell','swigert','haise','capcom','kranz'],main:['lovell','swigert','haise','capcom','kranz'],cameras:['wide','odyssey-vent','odyssey-crew','lovell','swigert','haise','capcom','kranz']},
  moon:{cast:['armstrong','aldrin','capcom'],main:['armstrong','aldrin','capcom'],cameras:['wide','landing-above','landing-ground','landing-crew','armstrong','aldrin','capcom']},
  cosmos:{cast:['sagan'],main:['sagan'],cameras:['wide','sagan','flatland','dimension-model']},
  throne:{cast:['oz','dorothy','scarecrow','tin-woodman','lion'],main:['oz','dorothy','scarecrow','tin-woodman','lion'],cameras:['wide','throne-head','oz','dorothy','scarecrow','tin-woodman','lion','throne-row']},
  arrival:{cast:['ian'],main:['ian'],cameras:['wide','ian','louise']},
  jetaime:{cast:['lara'],main:['lara'],cameras:['wide','lara','jetaime-warehouse','jetaime-car','jetaime-copies']},
  fade:{cast:['hope'],main:['hope'],cameras:['wide','hope','fade-stage','fade-desert','fade-train','fade-car','fade-stairs','fade-poles']},
  airsupply:{cast:['air-singer','air-guitarist'],main:['air-singer','air-guitarist'],cameras:['wide','air-singer','air-guitarist','air-stage','air-street','air-meadow','air-car','air-gas','air-diner','air-silhouette']},
  beast:{cast:['beast-singer','love-answer'],main:['beast-singer','love-answer'],cameras:['wide','beast-singer','love-answer','beast-chase','beast-mirror','beast-forest','beast-hall','beast-bedroom','beast-duet','beast-police','beast-escape']},
  eclipse:{cast:['bonnie','bright-eyes'],main:['bonnie','bright-eyes'],cameras:['wide','bonnie','bright-eyes','eclipse-hall','eclipse-stairs','eclipse-curtains','eclipse-dancers','eclipse-eyes','eclipse-courtyard','eclipse-school']},
  bolton:{cast:['bolton'],main:['bolton'],cameras:['wide','bolton','bolton-fire','bolton-cliffs','bolton-cave','bolton-lovers','bolton-horses']},
  workshop:{cast:['watcher'],main:['watcher'],cameras:['wide','watcher','workshop-bench','workshop-window','workshop-shadows']},
  autumn:{cast:['cole'],main:['cole'],cameras:['wide','cole','autumn-chair','autumn-garden']},
  lifetime:{cast:['lifetime-singer'],main:['lifetime-singer'],cameras:['wide','lifetime-singer','lifetime-water','lifetime-copies','lifetime-archive']},
  henge:{cast:['henge-singer'],main:['henge-singer'],cameras:['wide','henge-singer','henge-studio','henge-kitchen','henge-bedroom','henge-car','henge-road','henge-monument','henge-night','henge-sunset']},
  disco:{cast:['vitas'],main:['vitas'],cameras:['wide','vitas','vitas-performer','vitas-dancers','vitas-audience']},
  mansion:{cast:['celine'],main:['celine'],cameras:['wide','celine','mansion-exterior','mansion-road','mansion-bedroom','mansion-mirror','mansion-memory','mansion-window','mansion-corridor','mansion-stairs']},
  superman:{cast:['laurie','superman-pulse'],main:['laurie','superman-pulse'],cameras:['wide','laurie','superman-pulse','superman-circle','superman-hands','superman-keyboard','superman-profile','superman-silhouette']},
  puppets:{cast:['mahna', 'snowth-left', 'snowth-right', 'kermit', 'statler', 'waldorf'],main:['mahna', 'snowth-left', 'snowth-right', 'kermit', 'statler', 'waldorf'],cameras:['wide', 'mahna', 'snowth-left', 'snowth-right', 'kermit', 'statler', 'waldorf', 'puppet-pair', 'puppet-away', 'puppet-backstage', 'puppet-balcony']},
  theatre:{cast:['frontier-headmaster', 'frontier-mother', 'frontier-cowboy', 'frontier-doctor', 'frontier-announcer', 'frontier-parrot'],main:['frontier-headmaster', 'frontier-mother', 'frontier-cowboy', 'frontier-doctor', 'frontier-announcer', 'frontier-parrot'],cameras:['wide', 'frontier-headmaster', 'frontier-mother', 'frontier-cowboy', 'frontier-doctor', 'frontier-announcer', 'frontier-parrot', 'theatre-curtain', 'theatre-orchestra', 'theatre-drums', 'theatre-ghosts', 'theatre-turtle', 'theatre-cowboys', 'theatre-blackboard', 'theatre-dancers', 'theatre-megaphone', 'theatre-turntable']},
  classroom:{cast:['adriano','classroom-chorus'],main:['adriano','classroom-chorus'],cameras:['wide','adriano','classroom-chorus','classroom-front','classroom-back','classroom-side','classroom-harmonica','classroom-audience']},
  dome:{cast:['truman','christof','broadcast-director','network-exec','guard-one','guard-two','sylvia'],main:['truman','christof','broadcast-director','network-exec','guard-one','guard-two','sylvia'],cameras:['wide','truman','christof','broadcast-director','network-exec','guard-one','guard-two','sylvia','dome-boat','dome-wall','dome-stairs','dome-exit','dome-sky','control-room','control-monitor','viewers-bar','viewer-bath','security-room','broadcast-end']},
  park:{cast:['sean','will'],main:['sean','will'],cameras:['wide','sean','will','park-lake','park-bench','park-pair']},
  ranger:{cast:['tars','cooper','doyle'],main:['tars','cooper','doyle'],cameras:['wide','tars','cooper','doyle','brand','romilly','ranger-launch','ranger-separation','ranger-crew','ranger-panel']},
  bowling:{cast:['dude','walter','donny','jesus'],main:['dude','walter','donny','jesus'],cameras:['wide','dude','walter','donny','jesus','bowling-lane','bowling-ball','bowling-pair','bowling-rivals','bowling-shoes','bowling-flashback']},
  rooftop:{cast:['roy','deckard'],main:['roy','deckard'],cameras:['wide','roy','deckard','roof-ledge','roof-dove','roof-sky']},
  river:{cast:['diana'],main:['diana'],cameras:['wide','diana','river-singer','river-dancers','river-judges','river-audience']},
  concert:{cast:['dimash'],main:['dimash'],cameras:['wide','dimash','concert-singer','concert-band','concert-audience']},
  opera:{cast:['opera-tenor','opera-chorus'],main:['opera-tenor','opera-chorus'],cameras:['wide','opera-tenor','opera-orchestra','opera-conductor','opera-choir']},
  karaoke:{cast:['karaoke-singer'],main:['karaoke-singer'],cameras:['wide','karaoke-singer','listener']},
};
export interface SceneFile {
  setting?:SceneSetting; title:string; description:string; duration:number; audio:string;
  characters:{id:CharacterId;name:string;role:string;tele:string;telemetryEncoding?:'gzip'}[];
  cues:SceneCue[];shots:SceneShot[];
}
const character=(id:unknown):id is CharacterId=>id==='kaffee'||id==='jessep'||id==='ross'||id==='judge'||id==='vizzini'||id==='inigo'||id==='fezzik'||id==='hal'||id==='dave'||id==='bush'||id==='karaoke-singer'||id==='ellie'||id==='father'||id==='ian'||id==='neo'||id==='spoon-boy'||id==='oracle-assistant'||id==='mcmurphy'||id==='cheswick'||id==='billy'||id==='martini'||id==='oz'||id==='dorothy'||id==='scarecrow'||id==='tin-woodman'||id==='lion'||id==='sagan'||id==='armstrong'||id==='aldrin'||id==='capcom'||id==='lovell'||id==='swigert'||id==='haise'||id==='kranz'||id==='opera-tenor'||id==='opera-chorus'||id==='dimash'||id==='diana'||id==='roy'||id==='deckard'||id==='dude'||id==='walter'||id==='donny'||id==='jesus'||id==='tars'||id==='cooper'||id==='doyle'||id==='sean'||id==='will'||id==='truman'||id==='christof'||id==='broadcast-director'||id==='network-exec'||id==='guard-one'||id==='guard-two'||id==='sylvia'||id==='adriano'||id==='classroom-chorus'||id==='frontier-headmaster'||id==='frontier-mother'||id==='frontier-cowboy'||id==='frontier-doctor'||id==='frontier-announcer'||id==='frontier-parrot'||id==='mahna'||id==='snowth-left'||id==='snowth-right'||id==='kermit'||id==='statler'||id==='waldorf'||id==='laurie'||id==='superman-pulse'||id==='celine'||id==='vitas'||id==='henge-singer'||id==='lifetime-singer'||id==='cole'||id==='watcher'||id==='bolton'||id==='bonnie'||id==='bright-eyes'||id==='beast-singer'||id==='love-answer'||id==='air-singer'||id==='air-guitarist'||id==='hope'||id==='lara';
const file=(name:unknown)=>typeof name==='string'&&/^[a-z0-9-]+\.(mp3|tele)$/.test(name);
export function validateScene(data:unknown):SceneFile {
  const s=data as SceneFile;
  if(!s||typeof s.title!=='string'||typeof s.description!=='string'||!Number.isFinite(s.duration)||s.duration<=0||s.duration>600||!file(s.audio)||!s.audio.endsWith('.mp3')||!Array.isArray(s.characters)||s.characters.length<(s.setting==='press'||s.setting==='karaoke'||s.setting==='arrival'||s.setting==='cosmos'||s.setting==='concert'||s.setting==='river'||s.setting==='mansion'||s.setting==='disco'||s.setting==='henge'||s.setting==='lifetime'||s.setting==='autumn'||s.setting==='workshop'||s.setting==='bolton'||s.setting==='jetaime'||s.setting==='fade'?1:2)||s.characters.length>(s.setting==='dome'?7:s.setting==='theatre'||s.setting==='puppets'?6:s.setting==='throne'||s.setting==='odyssey'?5:4)||!Array.isArray(s.cues)||!s.cues.length||!Array.isArray(s.shots)||!s.shots.length)throw Error('The scene is incomplete. Reload and try again.');
  if(s.setting!==undefined&&!Object.hasOwn(SCENE_SETTINGS,s.setting))throw Error('The scene setting is invalid.');
  const {cast,main,cameras}=SCENE_SETTINGS[s.setting??'courtroom'];
  const ids=new Set<string>();
  for(const c of s.characters){if(!c||!character(c.id)||!cast.includes(c.id)||ids.has(c.id)||(c.telemetryEncoding!==undefined&&c.telemetryEncoding!=='gzip')||!file(c.tele)||!c.tele.endsWith('.tele')||typeof c.name!=='string'||typeof c.role!=='string')throw Error('A scene character is invalid.');ids.add(c.id);}
  if(main.some(id=>!ids.has(id)))throw Error('The main scene characters are missing.');
  let last=-1;
  for(const c of s.cues){if(!c||(!character(c.speaker)||!ids.has(c.speaker))||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.start<last||c.end<=c.start||c.end>s.duration||typeof c.text!=='string'||!Number.isFinite(c.intensity)||c.intensity<0||c.intensity>1)throw Error('The scene dialogue is invalid.');last=c.start;}
  last=-1;
  for(const c of s.shots){if(!c||!Number.isFinite(c.time)||c.time<0||c.time<last||c.time>s.duration||!cameras.includes(c.view))throw Error('A scene camera cue is invalid.');last=c.time;}
  return s;
}
export function sceneCue(scene:SceneFile,time:number):SceneCue|undefined {return scene.cues.find(c=>c.start<=time&&time<c.end);}
export function sceneCamera(scene:SceneFile,time:number,choice:CameraChoice):CameraView {
  return choice==='auto'?(scene.shots.filter(s=>s.time<=time).at(-1)?.view??'wide'):choice;
}
/** Camera and focus in centimetres: consistent framing across playback, pause and backwards seeks. */
export function courtCamera(view:CameraView,aspect:number):{position:[number,number,number];target:[number,number,number];fov:number}{
  const narrow=aspect<1;
  if(view==='kaffee')return {position:[-9,140,-69],target:[55,132,5],fov:narrow?43:29};
  if(view==='jessep')return {position:[-35,137,39],target:[-62,132,-70],fov:narrow?43:29};
  return {position:narrow?[200,180,360]:[170,160,270],target:[0,95,-45],fov:narrow?48:43};
}
