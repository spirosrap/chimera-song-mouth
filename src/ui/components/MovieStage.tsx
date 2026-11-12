import {SurrealTheatre} from '../render/theatre.ts';
import type {TheatreSpeaker} from '../../scene/theatre.ts';
import {ClassroomStage} from '../render/classroom.ts';
import {BroadcastDome} from '../render/dome.ts';
import {GardenBench} from '../render/park.ts';
import {RangerCabin} from '../render/ranger.ts';
import {BowlingAlley} from '../render/bowling.ts';
import {RainRooftop} from '../render/rooftop.ts';
import {RiverStage} from '../render/river.ts';
import {ConcertStage} from '../render/concert.ts';
import {OperaStage} from '../render/opera.ts';
import {CosmosStudy} from '../render/cosmos.ts';
import {LandingSite} from '../render/landing.ts';
import {OdysseyFlight} from '../render/odyssey.ts';
import {ThroneRoom} from '../render/throne.ts';
import {ContactBeach} from '../render/contact.ts';
import {WardRoom} from '../render/ward.ts';
import {MatrixRoom} from '../render/matrix.ts';
import {ArrivalField} from '../render/arrival.ts';
import {KaraokeRoom} from '../render/karaoke.ts';
import {Cliffs} from '../render/cliffs.ts';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {headRendererPool} from '../render/sharedHeadRenderer.ts';
import {Courtroom} from '../render/courtroom.ts';
import {MemoryCore} from '../render/core.ts';
import {PressConference} from '../render/pressConference.ts';
import {acquireModel} from '../useModel.ts';
import {sceneCamera,sceneCue,type CameraChoice,type SceneFile,type CourtCharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {Transport} from '../../show/transport.ts';
import type {SceneStage} from '../../scene/video.ts';

export function MovieStage({scene,tracks,transport,camera,onReady}:{scene:SceneFile;tracks:TeleTrack[];transport:Transport;camera:CameraChoice;onReady:(stage:SceneStage|null)=>void}){
  const canvasRef=useRef<HTMLCanvasElement>(null),wrapRef=useRef<HTMLDivElement>(null),choice=useRef(camera);
  const [error,setError]=useState('');choice.current=camera;
  useEffect(()=>{
    const canvas=canvasRef.current!,wrap=wrapRef.current!,ctx=canvas.getContext('2d')!;
    let gl:THREE.WebGLRenderer,release:()=>void;
    try{const lease=headRendererPool.acquire();gl=lease.renderer;release=lease.release;}catch{setError('The scene needs WebGL. You can still play and download the scene audio.');return;}
    gl.outputColorSpace=THREE.LinearSRGBColorSpace;
    gl.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
    const leases:(()=>void)[]=[];
    const people=scene.characters.flatMap((c,i)=>{
      if(c.id==='ross'||c.id==='judge')return [];
      const held=acquireModel(tracks[i].body,tracks[i].sampleRate);leases.push(held.release);
      return [{id:c.id,track:tracks[i],model:held.model}];
    });
    const room=scene.setting==='theatre'
      ?new SurrealTheatre(people.map(c=>({...c,id:c.id as TheatreSpeaker})))
      :scene.setting==='classroom'
      ?new ClassroomStage(people.flatMap(c=>c.id==='adriano'||c.id==='classroom-chorus'?[{...c,id:c.id}]:[]))
      :scene.setting==='dome'
      ?new BroadcastDome(people.flatMap(c=>c.id==='truman'||c.id==='christof'||c.id==='broadcast-director'||c.id==='network-exec'||c.id==='guard-one'||c.id==='guard-two'||c.id==='sylvia'?[{...c,id:c.id}]:[]))
      :scene.setting==='park'
      ?new GardenBench(people.flatMap(c=>c.id==='sean'||c.id==='will'?[{...c,id:c.id}]:[]))
      :scene.setting==='ranger'
      ?new RangerCabin(people.flatMap(c=>c.id==='tars'||c.id==='cooper'||c.id==='doyle'?[{...c,id:c.id}]:[]))
      :scene.setting==='bowling'
      ?new BowlingAlley(people.flatMap(c=>c.id==='dude'||c.id==='walter'||c.id==='donny'||c.id==='jesus'?[{...c,id:c.id}]:[]))
      :scene.setting==='rooftop'
      ?new RainRooftop(people.flatMap(c=>c.id==='roy'||c.id==='deckard'?[{...c,id:c.id}]:[]))
      :scene.setting==='river'
      ?new RiverStage(people[0].model,people[0].track)
      :scene.setting==='concert'
      ?new ConcertStage(people[0].model,people[0].track)
      :scene.setting==='opera'
      ?new OperaStage(people[0].model,people[0].track,people[1].track)
      :scene.setting==='odyssey'
      ?new OdysseyFlight(people.flatMap(c=>c.id==='lovell'||c.id==='swigert'||c.id==='haise'||c.id==='capcom'||c.id==='kranz'?[{...c,id:c.id}]:[]))
      :scene.setting==='moon'
      ?new LandingSite(people.flatMap(c=>c.id==='armstrong'||c.id==='aldrin'||c.id==='capcom'?[{...c,id:c.id}]:[]))
      :scene.setting==='cosmos'
      ?new CosmosStudy(people[0].model,people[0].track)
      :scene.setting==='throne'
      ?new ThroneRoom(people.flatMap(c=>c.id==='oz'||c.id==='dorothy'||c.id==='scarecrow'||c.id==='tin-woodman'||c.id==='lion'?[{...c,id:c.id}]:[]))
      :scene.setting==='ward'
      ?new WardRoom(people.flatMap(c=>c.id==='mcmurphy'||c.id==='cheswick'||c.id==='billy'||c.id==='martini'?[{...c,id:c.id}]:[]))
      :scene.setting==='matrix'
      ?new MatrixRoom(people.flatMap(c=>c.id==='neo'||c.id==='spoon-boy'||c.id==='oracle-assistant'?[{...c,id:c.id}]:[]))
      :scene.setting==='arrival'
      ?new ArrivalField(people[0].model,people[0].track)
      :scene.setting==='beach'
      ?new ContactBeach(people.flatMap(c=>c.id==='ellie'||c.id==='father'?[{...c,id:c.id}]:[]))
      :scene.setting==='karaoke'
      ?new KaraokeRoom(people[0].model,people[0].track)
      :scene.setting==='press'
      ?new PressConference(people[0].model,people[0].track)
      :scene.setting==='core'
      ?new MemoryCore(people.flatMap(c=>c.id==='hal'||c.id==='dave'?[{...c,id:c.id}]:[]),scene.duration)
      :scene.setting==='cliffs'
      ?new Cliffs(people.flatMap(c=>c.id==='vizzini'||c.id==='inigo'||c.id==='fezzik'?[{...c,id:c.id}]:[]))
      :new Courtroom(people.flatMap(c=>c.id==='kaffee'||c.id==='jessep'?[{...c,id:c.id as CourtCharacterId}]:[]));
    let capturing=false,alive=true;
    const fit=()=>{if(capturing||!alive)return;gl.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));const rect=wrap.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);gl.setSize(w,h,false);canvas.width=gl.domElement.width;canvas.height=gl.domElement.height;room.resize(w,h);};
    fit();const observer=new ResizeObserver(fit);observer.observe(wrap);
    let raf=0,last=-Infinity,visible=true;
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'});visibility.observe(wrap);
    const draw=(time:number,recording=false)=>{
      if(!alive)throw Error('The scene was closed.');
      const cue=sceneCue(scene,time);
      room.frame(time,recording||transport.isPlaying,transport.epoch,sceneCamera(scene,time,recording?'auto':choice.current),cue?.intensity??0,cue?.speaker);
      gl.render(room.scene,room.camera);ctx.drawImage(gl.domElement,0,0,canvas.width,canvas.height);return canvas;
    };
    onReady({capture:()=>{
      if(!alive||capturing)throw Error('The scene is already preparing a video.');
      capturing=true;gl.setPixelRatio(1);gl.setSize(1280,720,false);canvas.width=1280;canvas.height=720;room.resize(1280,720);
      let released=false;
      return {draw:(time)=>draw(time,true),release:()=>{if(released)return;released=true;capturing=false;if(alive)fit();}};
    }});
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(capturing||!visible||now-last<1000/30)return;last=now;draw(transport.time());
    };
    raf=requestAnimationFrame(frame);
    return()=>{alive=false;onReady(null);cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();room.dispose();leases.forEach(off=>off());release();};
  },[scene,tracks,transport,onReady]);
  return <div ref={wrapRef} className={`courtroom-stage${scene.setting==='moon'||scene.setting==='odyssey'?' moon-stage':scene.setting==='throne'?' throne-stage':scene.setting==='core'?' core-stage':scene.setting==='press'?' press-stage':''}`}>{error?<p role="status">{error}</p>:<canvas ref={canvasRef} role="img" aria-label={scene.setting==='theatre'?'A surreal theatre with gold curtains, six physical voices, a stern headmaster, drummer, orchestra, cowboy exchange, ghosts, a human-headed turtle, dancers, a megaphone, a parrot and a spinning record. Mouth movement and camera cuts follow the supplied music video.':scene.setting==='classroom'?'A colourful classroom with a dancing teacher in glasses and a long coat, seated students answering with physical mouths, desks, a globe, arched windows, audience and a harmonica player. The class rises to dance in the finale.':scene.setting==='dome'?'Truman discovers the painted sky wall from his sailboat, climbs the stairs and opens an exit. Christof speaks from a broadcast room with screens, glasses and a beret. Viewers watch, Truman bows and leaves, and the transmission ends. Physical mouths follow the dialogue.':scene.setting==='park'?'Sean in a cap and beard and Will in a brown jacket sit on a wooden bench beside a pond. Their physical mouths follow the conversation. Trees, swans and distant walkers surround them; Sean stands and walks away at the end.':scene.setting==='ranger'?'The Interstellar launch cabin with four helmeted astronauts and TARS, a rectangular robot with a physical airway inside its display. A joke light flashes, the humor setting changes, and exterior shots show the rocket and Earth during stage separation.':scene.setting==='bowling'?'A wireframe bowling alley with wooden lanes, pins, red seats and ball returns. Jesus wears purple and bowls, celebrates and approaches the Dude, Walter and Donny with his teammate. Four physical mouths follow the conversation; Walter wears yellow glasses and the Dude has a beard and a beeper.':scene.setting==='rooftop'?'Roy and Deckard on a rainy wireframe rooftop, with neon lights, pipes and puddles. Roy leaps across the gap, pulls Deckard to safety and speaks through his physical mouth. A white dove rests in his hand, then flies into the night as his head bows.':scene.setting==='river'?'A wireframe singer in a long patterned dress performs Rechenka on a blue river stage, with a boat, wooden dock, weeping branches, flowing water lights, mist, shadow dancers, judges and an audience. Her mouth, hands and kneeling ending follow the performance.':scene.setting==='concert'?'A wireframe singer in a dark teal suit performs with a handheld microphone on a televised concert stage. Blue, amber, red and white light fans sweep above a pianist, strings, drum kit, guitarists, backing singers and a seated audience. His mouth and expressive hands follow the performance.':scene.setting==='opera'?'An Italian tenor sings through a physical mouth at a stand microphone on a blue-lit opera stage. A conductor leads seated violinists, cellists and brass players; a choir stands behind them and an audience applauds.':scene.setting==='odyssey'?'A wireframe Apollo spacecraft, docked to its lunar module, drifts between the Earth and the Moon. A panel blows off its side and gas streams out. Three astronauts float at the control panel as warning lights come on; a controller sits at a console in Houston and the flight director stands behind him. Their mouths follow the physical dialogue.':scene.setting==='moon'?'A wireframe lunar module descends over a cratered grey surface, its shadow running ahead and dust blowing out as it touches down. Two helmeted astronauts stand in its cabin and a flight controller sits at a console in Houston; their mouths follow the physical dialogue.':scene.setting==='cosmos'?'Carl Sagan’s physical mouth sits at a wireframe desk in a tan jacket. Flatland figures, an apple, a cube and a tesseract follow his explanation.':scene.setting==='throne'?'A green wireframe throne room. A great glowing Head hangs over the throne and speaks to a girl, a scarecrow, a tin man and a lion, until a small dog tips over a screen and a little old man is found behind it. Their mouths follow the physical dialogue.':scene.setting==='ward'?'McMurphy and the other patients sit in a wireframe ward with windows and wooden chairs. The physical mouths follow the dialogue; the patients react and the nurses watch with a clipboard.':scene.setting==='matrix'?'Neo, a bald boy in a robe and the Oracle’s assistant in a green wireframe waiting room. A spoon bends, passes to Neo and shows his stylized reflection. Their mouths follow the physical dialogue.':scene.setting==='arrival'?'Ian and Louise stand at a wireframe field camp beneath a dusk sky. Ian looks up, then turns toward Louise; his mouth follows the physical dialogue while she reacts silently.':scene.setting==='beach'?'Two physical mouth characters meet on a glowing beach beneath a spiral galaxy. Ellie wears a flight suit and headset; her father approaches, embraces her and joins her on the sand. Their mouths follow the reconstructed dialogue.':scene.setting==='karaoke'?'A wireframe singer with shoulder-length hair and a handheld microphone in a warm karaoke room. A seated listener in glasses and a cardigan watches and joins the applause. The mouth follows the physical singing.':scene.setting==='press'?'A robotic speaker in a wireframe suit and red tie, behind a lectern with two microphones and an American flag. His mouth, head and hand follow the speech.':scene.setting==='core'?'A dark red memory core. A simulated mouth speaks from the computer’s eye while an astronaut removes glowing modules from the wall, and the room dims.':scene.setting==='cliffs'?'The Cliffs of Insanity with three wireframe characters and a masked climber. Their simulated mouths follow the dialogue.':'A cinematic courtroom with two wireframe characters. The simulated mouths follow the spoken dialogue.'}/>}</div>;
}
