export type CourtCharacterId = 'kaffee' | 'jessep';
export type CliffCharacterId = 'vizzini' | 'inigo' | 'fezzik';
export type CoreCharacterId = 'hal' | 'dave';
export type MainCharacterId = CourtCharacterId | CliffCharacterId | CoreCharacterId | 'bush' | 'karaoke-singer' | 'ellie' | 'father' | 'ian' | 'neo' | 'spoon-boy' | 'oracle-assistant' | 'mcmurphy' | 'cheswick' | 'billy' | 'martini' | 'oz' | 'dorothy' | 'scarecrow' | 'tin-woodman' | 'lion';
export type CharacterId = MainCharacterId | 'ross' | 'judge';
export type CameraView = 'wide' | 'climber' | 'modules' | 'listener' | 'contact-sky' | 'contact-hands' | 'louise' | 'matrix-floor' | 'matrix-spoon' | 'ward-pair' | 'ward-group' | 'ward-laughter' | 'ward-nurses' | 'throne-head' | 'throne-row' | MainCharacterId;
export type CameraChoice = 'auto' | CameraView;
export interface SceneCue { start:number; end:number; speaker:CharacterId; text:string; intensity:number }
export interface SceneShot { time:number; view:CameraView }
export type SceneSetting='courtroom'|'cliffs'|'core'|'press'|'karaoke'|'beach'|'arrival'|'matrix'|'ward'|'throne';
/** Each film has its own cast and cameras; a score cannot borrow another film's. */
export const SCENE_SETTINGS:Record<SceneSetting,{cast:CharacterId[];main:CharacterId[];cameras:CameraView[]}>={
  courtroom:{cast:['kaffee','jessep','ross','judge'],main:['kaffee','jessep'],cameras:['wide','kaffee','jessep']},
  cliffs:{cast:['vizzini','inigo','fezzik'],main:['vizzini','inigo','fezzik'],cameras:['wide','climber','vizzini','inigo','fezzik']},
  core:{cast:['hal','dave'],main:['hal','dave'],cameras:['wide','hal','dave','modules']},
  press:{cast:['bush'],main:['bush'],cameras:['wide','bush']},
  beach:{cast:['ellie','father'],main:['ellie','father'],cameras:['wide','ellie','father','contact-sky','contact-hands']},
  matrix:{cast:['neo','spoon-boy','oracle-assistant'],main:['neo','spoon-boy','oracle-assistant'],cameras:['wide','neo','spoon-boy','oracle-assistant','matrix-floor','matrix-spoon']},
  ward:{cast:['mcmurphy','cheswick','billy','martini'],main:['mcmurphy','cheswick','billy','martini'],cameras:['wide','mcmurphy','cheswick','billy','martini','ward-pair','ward-group','ward-laughter','ward-nurses']},
  throne:{cast:['oz','dorothy','scarecrow','tin-woodman','lion'],main:['oz','dorothy','scarecrow','tin-woodman','lion'],cameras:['wide','throne-head','oz','dorothy','scarecrow','tin-woodman','lion','throne-row']},
  arrival:{cast:['ian'],main:['ian'],cameras:['wide','ian','louise']},
  karaoke:{cast:['karaoke-singer'],main:['karaoke-singer'],cameras:['wide','karaoke-singer','listener']},
};
export interface SceneFile {
  setting?:SceneSetting; title:string; description:string; duration:number; audio:string;
  characters:{id:CharacterId;name:string;role:string;tele:string;telemetryEncoding?:'gzip'}[];
  cues:SceneCue[];shots:SceneShot[];
}
const character=(id:unknown):id is CharacterId=>id==='kaffee'||id==='jessep'||id==='ross'||id==='judge'||id==='vizzini'||id==='inigo'||id==='fezzik'||id==='hal'||id==='dave'||id==='bush'||id==='karaoke-singer'||id==='ellie'||id==='father'||id==='ian'||id==='neo'||id==='spoon-boy'||id==='oracle-assistant'||id==='mcmurphy'||id==='cheswick'||id==='billy'||id==='martini'||id==='oz'||id==='dorothy'||id==='scarecrow'||id==='tin-woodman'||id==='lion';
const file=(name:unknown)=>typeof name==='string'&&/^[a-z0-9-]+\.(mp3|tele)$/.test(name);
export function validateScene(data:unknown):SceneFile {
  const s=data as SceneFile;
  if(!s||typeof s.title!=='string'||typeof s.description!=='string'||!Number.isFinite(s.duration)||s.duration<=0||s.duration>600||!file(s.audio)||!s.audio.endsWith('.mp3')||!Array.isArray(s.characters)||s.characters.length<(s.setting==='press'||s.setting==='karaoke'||s.setting==='arrival'?1:2)||s.characters.length>(s.setting==='throne'?5:4)||!Array.isArray(s.cues)||!s.cues.length||!Array.isArray(s.shots)||!s.shots.length)throw Error('The scene is incomplete. Reload and try again.');
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
