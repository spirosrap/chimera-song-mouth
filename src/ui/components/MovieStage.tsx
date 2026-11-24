import {LoveStage} from '../render/ok-go-love.ts';
import type {LoveId} from '../../scene/ok-go-love.ts';
import {SS26Stage} from '../render/ss26.ts';
import {ZaraMoonStage} from '../render/zara-blue-moon.ts';
import {FertoStage} from '../render/ferto.ts';
import {RunwayStage} from '../render/runway.ts';
import {BerghainStage} from '../render/berghain.ts';
import {ElevatorOperatorStage, type ElevatorId} from '../render/elevator-operator.ts';
import {PhoebeStage} from '../render/phoebe.ts';
import {WheneverStage} from '../render/whenever.ts';
import {TheCureStage} from '../render/the-cure.ts';
import {IJustMightStage} from '../render/i-just-might.ts';
import {MilkshakeManStage} from '../render/milkshake-man.ts';
import {GabrielaStage} from '../render/gabriela.ts';
import {ReturnToInnocenceStage} from '../render/return-to-innocence.ts';
import {StatesideStage} from '../render/stateside.ts';
import {SodaPopStage} from '../render/soda-pop.ts';
import {AnxietyStage} from '../render/anxiety.ts';
import {IMissUsStage} from '../render/i-miss-us.ts';
import {ClickClackStage} from '../render/click-clack.ts';
import {HateMadeLoveStage} from '../render/hate-made-love.ts';
import {BaileInolvidableStage} from '../render/baile-inolvidable.ts';
import {ElectricBlueStage} from '../render/mr-electric-blue.ts';
import {SexyPictureStage} from '../render/sexy-picture.ts';
import {DojaGorgeousStage} from '../render/doja-gorgeous.ts';
import {DrumsOfDeathStage} from '../render/drums-of-death.ts';
import {BackstabberStage} from '../render/backstabber.ts';
import {TheGiverStage} from '../render/the-giver.ts';
import {StoneRollsStage} from '../render/stone-rolls.ts';
import {JadeAngelStage} from '../render/jade-angel.ts';
import {LavaChickenStage} from '../render/lava-chicken.ts';
import {BangarangaStage} from '../render/bangaranga.ts';
import type {SS26Id} from '../../scene/ss26.ts';
import {SubwayStage} from '../render/the-subway.ts';
import {HouseTourStage} from '../render/house-tour.ts';
import type {TourId} from '../../scene/house-tour.ts';
import {GnarlyStage} from '../render/gnarly.ts';
import type {GnarlyId} from '../../scene/gnarly.ts';
import {EinsStage, type EinsId} from '../render/eins-zwei-drei.ts';
import {LithoniaStage, type LithoniaId} from '../render/lithonia.ts';
import {DemonsStage, type DemonsId} from '../render/doja-demons.ts';
import {TearsStage,type TearsId} from '../render/sabrina-tears.ts';
import {DeadDanceStage} from '../render/dead-dance.ts';
import {RatatataStage} from '../render/ratatata.ts';
import {JennieStage} from '../render/like-jennie.ts';
import {TwoStage,type TwoId} from '../render/bbno-two.ts';
import{SwifStage,type SwifId}from'../render/tailor-swif.ts';
import{HoudiniStage,type HoudiniId}from'../render/houdini.ts';
import{EuropapaStage,type EuropapaId}from'../render/europapa.ts';
import {StormStage,type StormId} from '../render/storm.ts';
import {DenialStage,type DenialId} from '../render/denial-river.ts';
import {ApertureStage,type ApertureId} from '../render/aperture.ts';
import {ManchildStage} from '../render/manchild.ts';
import {SkibidiStage} from '../render/skibidi.ts';
import {TasteStage,type TasteId} from '../render/taste.ts';
import {RememberStage} from '../render/remember-time.ts';
import type {RememberId} from '../../scene/remember-time.ts';
import {MonkeyStage} from '../render/shock-monkey.ts';
import {SpinStage} from '../render/spin-round.ts';
import {SurpriseStage} from '../render/no-surprises.ts';
import {GoWestStage,type WestId} from '../render/go-west.ts';
import {CrucifiedStage,type CrucifiedId} from '../render/crucified.ts';
import {MonteroStage} from '../render/montero.ts';
import {BadGuyStage} from '../render/bad-guy.ts';
import {SpellStage} from '../render/abracadabra.ts';
import {AptStage,type AptId} from '../render/apt.ts';
import {EspressoStage} from '../render/espresso.ts';
import {LoserStage,type LoserId} from '../render/loser.ts';
import {ReligionStage} from '../render/religion.ts';
import {VoltageStage,type VoltageId} from '../render/voltage.ts';
import {BabooshkaStage} from '../render/babooshka.ts';
import {RockStage} from '../render/rock-dj.ts';
import {LandStage,type LandId} from '../render/land-confusion.ts';
import {BlackHoleStage} from '../render/black-hole-sun.ts';
import {DarknessStage} from '../render/darkness-love.ts';
import {LullabyStage} from '../render/lullaby.ts';
import {WildStage} from '../render/wild-boys.ts';
import {GlassStage} from '../render/walking-broken-glass.ts';
import {PhantomStage,type PhantomId} from '../render/nightwish-phantom.ts';
import {DreamsStage} from '../render/sweet-dreams.ts';
import {BehaviourStage} from '../render/human-behaviour.ts';
import {BreakFreeStage} from '../render/break-free.ts';
import {PlayerStage,type PlayerId} from '../render/player-baby-come-back.ts';
import {TipsyStage} from '../render/aporo-tipsy.ts';
import {AshStage} from '../render/ashes-to-ashes.ts';
import {SledgeStage,type SledgeId} from '../render/sledgehammer.ts';
import {RosesStage,type RoseId} from '../render/wild-roses.ts';
import {TakeStage,type TakeId} from '../render/take-on-me.ts';
import {NothingStage} from '../render/nothing-compares.ts';
import {AmadeusStage} from '../render/rock-me-amadeus.ts';
import type {AmadeusId} from '../../scene/rock-me-amadeus.ts';
import {WutheringStage} from '../render/wuthering-heights.ts';
import {StayStage} from '../render/stay.ts';
import type {StayId} from '../../scene/stay.ts';
import {MendesStage} from '../render/mas-que-nada.ts';
import {HelloStage} from '../render/hello.ts';
import type {HelloId} from '../../scene/hello.ts';
import {BoyzStage} from '../render/boyz.ts';
import type {BoyzId} from '../../scene/boyz.ts';
import {TitanicStage} from '../render/titanic.ts';
import {HeroStage} from '../render/hero.ts';
import {UnbreakStage} from '../render/unbreak-my-heart.ts';
import {NovemberStage,type RainId} from '../render/november-rain.ts';
import {BonJoviStage} from '../render/bon-jovi-always.ts';
import {AlwaysStage} from '../render/always-love-you.ts';
import {JeTaimeStage} from '../render/je-taime.ts';
import {FadeStage} from '../render/fade-into-you.ts';
import {AirSupplyStage} from '../render/making-love.ts';
import {BeastStage,type BeastId} from '../render/anything-for-love.ts';
import {EclipseStage,type EclipseId} from '../render/total-eclipse.ts';
import {BoltonStage} from '../render/said-i-loved-you.ts';
import {WorkshopStage} from '../render/whats-he-building.ts';
import {AutumnStage} from '../render/autumn-leaves.ts';
import {LifetimeStage} from '../render/once-in-a-lifetime.ts';
import {StonehengeStage} from '../render/stonehenge.ts';
import {VitasStage} from '../render/vitas.ts';
import {MansionStage} from '../render/mansion.ts';
import {SupermanStage} from '../render/superman.ts';
import type {SupermanId} from '../../scene/superman.ts';
import {PuppetStage} from '../render/puppets.ts';
import type {PuppetId} from '../../scene/puppets.ts';
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
    const room=scene.setting==='remember'
      ?new RememberStage(people.map(p=>({...p,id:p.id as RememberId})))
      :scene.setting==='monkey'
      ?new MonkeyStage(people[0].model,people[0].track)
      :scene.setting==='spin'
      ?new SpinStage(people[0].model,people[0].track)
      :scene.setting==='surprises'
      ?new SurpriseStage(people[0].model,people[0].track)
      :scene.setting==='crucified'
      ?new CrucifiedStage(people.map(c=>({...c,id:c.id as CrucifiedId})))
      :scene.setting==='gowest'
      ?new GoWestStage(people.map(c=>({...c,id:c.id as WestId})))
      :scene.setting==='okgolove'?new LoveStage(people.map(c=>({...c,id:c.id as LoveId})))
      :scene.setting==='ss26'?new SS26Stage(people.map(c=>({...c,id:c.id as SS26Id})))
      :scene.setting==='zara'?new ZaraMoonStage(people[0].model,people[0].track)
      :scene.setting==='ferto'?new FertoStage(people[0].model,people[0].track)
      :scene.setting==='runway'?new RunwayStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='berghain'?new BerghainStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='elevator'?new ElevatorOperatorStage(people.map(c=>({...c,id:c.id as ElevatorId})))
      :scene.setting==='phoebe'?new PhoebeStage(people[0].model,people[0].track)
      :scene.setting==='whenever'?new WheneverStage(people[0].model,people[0].track)
      :scene.setting==='thecure'?new TheCureStage(people[0].model,people[0].track)
      :scene.setting==='ijustmight'?new IJustMightStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='milkshake'?new MilkshakeManStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='gabriela'?new GabrielaStage(people[0].model,people[0].track,people[1].model,people[1].track,people[2].model,people[2].track)
      :scene.setting==='enigma'?new ReturnToInnocenceStage(people[0].model,people[0].track,people[1].model,people[1].track,people[2].model,people[2].track)
      :scene.setting==='stateside'?new StatesideStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='sodapop'?new SodaPopStage(people[0].model,people[0].track,people[1].model,people[1].track,people[2].model,people[2].track)
      :scene.setting==='anxiety'?new AnxietyStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='imissus'?new IMissUsStage(people[0].model,people[0].track,people[1].model,people[1].track,people[2].model,people[2].track)
      :scene.setting==='clickclack'?new ClickClackStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='hatemadelove'?new HateMadeLoveStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='baile'?new BaileInolvidableStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='electricblue'?new ElectricBlueStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='sexypicture'?new SexyPictureStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='dojagorgeous'?new DojaGorgeousStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='drumsofdeath'?new DrumsOfDeathStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='backstabber'?new BackstabberStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='thegiver'?new TheGiverStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='stonerolls'?new StoneRollsStage(people[0],people[1])
      :scene.setting==='jadeangel'?new JadeAngelStage(people[0],people[1],people[2],people[3])
      :scene.setting==='lavachicken'?new LavaChickenStage(people[0],people[1],people[2])
      :scene.setting==='bangaranga'?new BangarangaStage(people[0].model,people[0].track,people[1].model,people[1].track)
      :scene.setting==='subway'?new SubwayStage(people.find(c=>c.id==='subway-chappell')!)
      :scene.setting==='housetour'?new HouseTourStage(people.map(c=>({...c,id:c.id as TourId}))):scene.setting==='gnarly'?new GnarlyStage(people.map(c=>({...c,id:c.id as GnarlyId}))):scene.setting==='einszwei'?new EinsStage(people.map(c=>({...c,id:c.id as EinsId}))):scene.setting==='lithonia'?new LithoniaStage(people.map(c=>({...c,id:c.id as LithoniaId}))):scene.setting==='dojademons'?new DemonsStage(people.map(c=>({...c,id:c.id as DemonsId}))):scene.setting==='sabrinatears'?new TearsStage(people.map(c=>({...c,id:c.id as TearsId}))):scene.setting==='deaddance'?new DeadDanceStage(people.map(c=>({...c,id:'dead-gaga' as const}))):scene.setting==='ratatata'?new RatatataStage(people.map(c=>({...c,id:c.id as 'rata-nico'|'rata-kevin'|'rata-su'}))):scene.setting==='likejennie'?new JennieStage(people.map(c=>({...c,id:'jennie-singer' as const}))):scene.setting==='bbnotwo'?new TwoStage(people.map(c=>({...c,id:c.id as TwoId}))):scene.setting==='tailorswif'?new SwifStage(people.map(c=>({...c,id:c.id as SwifId}))):scene.setting==='houdini'?new HoudiniStage(people.map(c=>({...c,id:c.id as HoudiniId}))):scene.setting==='europapa'?new EuropapaStage(people.map(c=>({...c,id:c.id as EuropapaId}))):scene.setting==='storm'
      ?new StormStage(people.map(c=>({...c,id:c.id as StormId})))
      :scene.setting==='denial'
      ?new DenialStage(people.map(c=>({...c,id:c.id as DenialId})))
      :scene.setting==='aperture'
      ?new ApertureStage(people.map(c=>({...c,id:c.id as ApertureId})))
      :scene.setting==='manchild'
      ?new ManchildStage(people[0].model,people[0].track)
      :scene.setting==='skibidi'
      ?new SkibidiStage(people[0].model,people[0].track)
      :scene.setting==='taste'
      ?new TasteStage(people.map(c=>({...c,id:c.id as TasteId})))
      :scene.setting==='montero'
      ?new MonteroStage(people[0].model,people[0].track)
      :scene.setting==='badguy'
      ?new BadGuyStage(people[0].model,people[0].track)
      :scene.setting==='abracadabra'
      ?new SpellStage(people[0].model,people[0].track)
      :scene.setting==='apt'
      ?new AptStage(people.map(c=>({...c,id:c.id as AptId})))
      :scene.setting==='espresso'
      ?new EspressoStage(people[0].model,people[0].track)
      :scene.setting==='loser'
      ?new LoserStage(people.map(c=>({...c,id:c.id as LoserId})))
      :scene.setting==='religion'
      ?new ReligionStage(people[0].model,people[0].track)
      :scene.setting==='voltage'
      ?new VoltageStage(people.map(c=>({...c,id:c.id as VoltageId})))
      :scene.setting==='babooshka'
      ?new BabooshkaStage(people[0].model,people[0].track)
      :scene.setting==='rockdj'
      ?new RockStage(people[0].model,people[0].track)
      :scene.setting==='confusion'
      ?new LandStage(people.map(c=>({...c,id:c.id as LandId})))
      :scene.setting==='blackhole'
      ?new BlackHoleStage(people[0].model,people[0].track)
      :scene.setting==='darkness'
      ?new DarknessStage(people[0].model,people[0].track)
      :scene.setting==='lullaby'
      ?new LullabyStage(people[0].model,people[0].track)
      :scene.setting==='wildboys'
      ?new WildStage(people[0].model,people[0].track)
      :scene.setting==='glass'
      ?new GlassStage(people[0].model,people[0].track)
      :scene.setting==='phantom'
      ?new PhantomStage(people.map(c=>({...c,id:c.id as PhantomId})))
      :scene.setting==='dreams'
      ?new DreamsStage(people[0].model,people[0].track)
      :scene.setting==='behaviour'
      ?new BehaviourStage(people[0].model,people[0].track)
      :scene.setting==='breakfree'
      ?new BreakFreeStage(people[0].model,people[0].track)
      :scene.setting==='player'
      ?new PlayerStage(people.map(c=>({...c,id:c.id as PlayerId})))
      :scene.setting==='tipsy'
      ?new TipsyStage(people[0].model,people[0].track)
      :scene.setting==='ashes'
      ?new AshStage(people[0].model,people[0].track)
      :scene.setting==='sledge'
      ?new SledgeStage(people.map(c=>({...c,id:c.id as SledgeId})))
      :scene.setting==='wildroses'
      ?new RosesStage(people.map(c=>({...c,id:c.id as RoseId})))
      :scene.setting==='takeon'
      ?new TakeStage(people.map(c=>({...c,id:c.id as TakeId})))
      :scene.setting==='nothing'
      ?new NothingStage(people[0].model,people[0].track)
      :scene.setting==='amadeus'
      ?new AmadeusStage(people.map(c=>({...c,id:c.id as AmadeusId})))
      :scene.setting==='wuthering'
      ?new WutheringStage(people[0].model,people[0].track)
      :scene.setting==='stay'
      ?new StayStage(people.map(c=>({...c,id:c.id as StayId})))
      :scene.setting==='mendes'
      ?new MendesStage(people[0].model,people[0].track)
      :scene.setting==='hello'
      ?new HelloStage(people.map(c=>({...c,id:c.id as HelloId})))
      :scene.setting==='boyz'
      ?new BoyzStage(people.map(c=>({...c,id:c.id as BoyzId})))
      :scene.setting==='titanic'
      ?new TitanicStage(people[0].model,people[0].track)
      :scene.setting==='hero'
      ?new HeroStage(people[0].model,people[0].track)
      :scene.setting==='unbreak'
      ?new UnbreakStage(people[0].model,people[0].track)
      :scene.setting==='november'
      ?new NovemberStage(people.map(c=>({...c,id:c.id as RainId})))
      :scene.setting==='bonjovi'
      ?new BonJoviStage(people[0].model,people[0].track)
      :scene.setting==='bodyguard'
      ?new AlwaysStage(people[0].model,people[0].track)
      :scene.setting==='jetaime'
      ?new JeTaimeStage(people[0].model,people[0].track)
      :scene.setting==='fade'
      ?new FadeStage(people[0].model,people[0].track)
      :scene.setting==='airsupply'
      ?new AirSupplyStage(people.map(c=>({...c,id:c.id as 'air-singer'|'air-guitarist'})))
      :scene.setting==='beast'
      ?new BeastStage(people.map(c=>({...c,id:c.id as BeastId})))
      :scene.setting==='eclipse'
      ?new EclipseStage(people.map(c=>({...c,id:c.id as EclipseId})))
      :scene.setting==='bolton'
      ?new BoltonStage(people[0].model,people[0].track)
      :scene.setting==='workshop'
      ?new WorkshopStage(people[0].model,people[0].track)
      :scene.setting==='autumn'
      ?new AutumnStage(people[0].model,people[0].track)
      :scene.setting==='lifetime'
      ?new LifetimeStage(people[0].model,people[0].track)
      :scene.setting==='henge'
      ?new StonehengeStage(people[0].model,people[0].track)
      :scene.setting==='disco'
      ?new VitasStage(people[0].model,people[0].track)
      :scene.setting==='mansion'
      ?new MansionStage(people[0].model,people[0].track)
      :scene.setting==='superman'
      ?new SupermanStage(people.map(c=>({...c,id:c.id as SupermanId})))
      :scene.setting==='puppets'
      ?new PuppetStage(people.map(c=>({...c,id:c.id as PuppetId})))
      :scene.setting==='theatre'
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
      const chosen=recording?'auto':choice.current;
      const view=room instanceof LoveStage&&chosen==='auto'?'wide':sceneCamera(scene,time,chosen);
      room.frame(time,recording||transport.isPlaying,transport.epoch,view,cue?.intensity??0,cue?.speaker);
      if(room instanceof LoveStage)room.renderReflections(gl);
      gl.render(room.scene,room.camera);
      if(recording)return gl.domElement;
      ctx.drawImage(gl.domElement,0,0,canvas.width,canvas.height);return canvas;
    };
    onReady({capture:(width=1920,height=1080)=>{
      if(!alive||capturing)throw Error('The scene is already preparing a video.');
      capturing=true;gl.setPixelRatio(1);gl.setSize(width,height,false);room.resize(width,height);
      let released=false;
      return {draw:(time)=>draw(time,true),release:()=>{if(released)return;released=true;capturing=false;if(alive)fit();}};
    }});
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(capturing||!visible||now-last<1000/30)return;last=now;draw(transport.time());
    };
    raf=requestAnimationFrame(frame);
    return()=>{alive=false;onReady(null);cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();room.dispose();leases.forEach(off=>off());release();};
  },[scene,tracks,transport,onReady]);
  return <div ref={wrapRef} className={`courtroom-stage${scene.setting==='moon'||scene.setting==='odyssey'?' moon-stage':scene.setting==='throne'?' throne-stage':scene.setting==='core'?' core-stage':scene.setting==='press'?' press-stage':''}`}>{error?<p role="status">{error}</p>:<canvas ref={canvasRef} role="img" aria-label={scene.setting==='jadeangel'?'JADE performs across a street market, paparazzi arrivals, a white limousine and a bright winged dance studio':scene.setting==='lavachicken'?'Steve and two customers at a blocky market kitchen with a lava channel and an animated chicken':scene.setting==='electricblue'?'The complete Benson Boone Mr Electric Blue official music video: moody 1970s Industry Plant Records agent office, sunlit hillside lawn mowing and dog walking, electric-blue Discount Jumpsuits sidewalk sign-spinner, pastel pink ice-cream truck, foamy cherry-red muscle car wash, turquoise backyard pool, and backyard trampoline backflip':scene.setting==='baile'?'The complete BAD BUNNY BAILE INoLVIDABLE official music video: wood-paneled Clases de Baile lobby, warm hardwood salsa studio and dance circle, single-spotlight pitch-black ballroom memory in powder-blue suit, golden velvet-curtain Puerto Rican salsa orchestra stage with piano, congas and Panama-hat coro singers, smoky cyan dance silhouettes, and warm studio return':scene.setting==='hatemadelove'?'The complete Ariana Grande hate that i made you love me official music video: Hitchcockian yellow title card, moonlit desert grave and vintage sedan, green-lit fluorescent bunker, buttercup-yellow dress on rainy midnight road, overturned burning car crash, scattered composition notebooks, mid-century living room inferno, crimson neon Bunny Hop diner exterior and retro waitress counter with ceiling fan, and amber dawn grave reversal':scene.setting==='clickclack'?'The complete RAYE and Hans Zimmer Click Clack Symphony official music video: B&W musical-staff globe, moody London manor parlor, tufted teal pillow sofa, crimson Friday-night neon sign, gravity-tilted hall, South London terraced street with piano-key crosswalk and floating musical notes, giant flying eighth-note over London and castle, and golden-hour English downs in a scarlet feather coat':scene.setting==='imissus'?'The complete Joost, Tommy Cash and Käärijä I MISS US 90s boyband music video: vintage chrome microphones, starry Basel night, Nordic lakeside beach, curved crimson grid boyband chamber, candlelit grand piano, pouring rain with clear umbrellas, graffiti hip-hop alley with DJ turntables, folding-chair garage, highway sidecar motorcycle, airport tarmac jetliner, and POP Times finale':scene.setting==='anxiety'?'The complete Doechii Anxiety official music video: bougainvillea-framed bedroom window with mandala tapestry, backlit mansion hallway, arched sunlit sunroom, navy sofa with powder-blue twin sisters, flaming kitchen stove, Gotye geometric pastel wall, hearth-lit piano parlor, golden-hour suburban hedge with giant walking elephant, vintage black convertible, and overhead cul-de-sac flash-mob finale':scene.setting==='sodapop'?'The complete Saja Boys Soda Pop K-pop street video: magenta smoke reveal, sunlit Seoul plaza with FIRST RUN storefronts, five pastel boyband performers, fizzy soda bubbles, dreamy pastel bokeh bridge, circular pedestal and neon magenta climax':scene.setting==='stateside'?'The complete PinkPantheress and Zara Larsson Stateside Y2K pop-art music video: London FANCY that red shop window, crimson tartan boutique with pop-art lips, aqua seashell window, hot-pink tropical souvenir shop, blue tartan Polaroid, floating AIR MAIL postcards, and polka-dot hibiscus duet':scene.setting==='enigma'?'The complete Enigma Return To Innocence reverse-time music video: sepia Spanish orchard with rising apples, candlelit altar, misty blue ocean waves, vineyard, shepherd pasture, reverse wedding, snow-capped mountains, silver-birch forest with white unicorn, sunlit cottage, bicycle and baptism':scene.setting==='gabriela'?'The complete KATSEYE Gabriela 90s telenovela music video: Gabriela skyscraper, CEO boardroom, sunlit and blue Venetian blinds, crimson conference-table dance, peach mansion ballroom, rose-arch wedding crash, KATFIGHT talk-show stage with rose petals, and neon outro':scene.setting==='milkshake'?'The complete Go-Jo Milkshake Man Eurovision 2025 live performance: retro CRT TV frame, diner curtains, optical checkerboard LED floor, giant glowing milkshake blender, neon lime, electric blue lasers, amber starburst, pink smoke, red milk splash, berry wall and shirtless finale':scene.setting==='ijustmight'?'The complete I Just Might music video with Bruno Mars: 1970s curved wood-slat disco lounge, concentric glowing circular ceiling lights in amber, rainbow, blue and red, all-Bruno mint-green leisure-suit funk band, DJ turntable booth, trio close-up and carpet-lounge pose':scene.setting==='thecure'?'The complete the cure music video with Olivia Rodrigo: crimson yarn title tray, mint hospital corridor with pink O R doors, glowing glass chemistry lab, ribcage X-ray frame, corridor guitar and mic, green ECG monitors, overhead pink bed tangled in red yarn, and sunlit miniature dollhouse reveal':scene.setting==='whenever'?'The complete Whenever music video with Megan Thee Stallion: retro waiting room with CRT TV and fish-headed patients, glass reception booth, giant wall aquarium, monochrome studio, burnt-orange desert with Cadillac, checkered chess knight, giant 8-ball and crashed-car office finale':scene.setting==='phoebe'?'The complete Phoebe music video with Audrey Hobert: Pacific sea stacks, warm wood cabin with fireplace and bed, pink-lily meadow, diner booth, redwood highway, neon hoodie fishing for $100 bills, starry I LOVE YOU sky, twilight ocean, beach lightsaber kick and sunset':scene.setting==='elevator'?'The complete ELEVATOR OPERATOR music video with Nico, Kevin and the Elevator Operator: night alley, geometric white LED elevator cabin, glowing button panel, aquarium floor, blue rave club with band stage, and zero-gravity floating finale':scene.setting==='berghain'?'The complete Berghain music video with Rosalía and Björk: Berlin domestic chore room, steam and iron, orchestra and German choir':scene.setting==='runway'?'The complete RUNWAY couture ballroom video with Lady Gaga and Doechii, black and white striped catwalk, red studio, twin-head suit and crystal spiked staging':scene.setting==='ferto'?'Ferto arcade platformer with a Greek-speaking physical announcer, pickups, moon level, lava cave and pixel concert':scene.setting==='okgolove'?'Love station, robot arms and kaleidoscope performance':scene.setting==='ss26'?'SS26 catwalk, front row and backstage performance':scene.setting==='subway'?'The Subway street, train and fountain performance':scene.setting==='housetour'?'House Tour mansion, pink van and three animated performers':scene.setting==='gnarly'?'KATSEYE kitchen, club, limo and red carpet with six animated performers':scene.setting==='einszwei'?'Eins, Zwei, Drei: the office, modular synthesizers, singing pizza, a winged car and coastal finale':scene.setting==='lithonia'?'Lithonia: an isolated microphone, a band under warm lights, seated listeners and a chase in the woods':scene.setting==='dojademons'?'Demons: a moonlit house, horned performer, ceiling crawl, green bathtub, attic with goats and a typewriter, and a kitchen fire':scene.setting==='sabrinatears'?'The complete Tears horror party: crashed car, blue suit and hat, porch and doorbell, host and vampire costumes, red bathroom and tears can, blue mirrors and cornfield, silver fringe, crowd dance and the full comic roadside ending':scene.setting==='deaddance'?'The full Dead Dance video: monochrome doll forest, hanging dolls, a thorned costume, curly-haired pale doll singer, tattered gown and ribbons, doorway choreography, moonlit group dance and magenta lighting':scene.setting==='ratatata'?'The full RATATATA scene: two mirror-helmet singers, three armored dancers, office wall crashes, neon karaoke lounge, giant disco ball, lightning and laser finale':scene.setting==='likejennie'?'The complete like JENNIE video: red spacesuit, white capsule and floating bean, chrome dance hall, group formations, fiery landscape and capybara transformation':scene.setting==='bbnotwo'?'The complete two surreal video: choir, sauna, excavator, wedding, football, cloning band and costume dance':scene.setting==='tailorswif'?'The complete Tailor Swif surreal video: carpet car, bathroom, apartment, bathtub ride, dog office, gym and playground':scene.setting==='houdini'?'The complete Houdini comic-book video: portal, superhero, rooftop duel, clones and car chase':scene.setting==='europapa'?'Europapa video scene':scene.setting==='storm'?'The complete STORM school film: uniformed physical singer, school grounds, corridors, canteen, dining hall, rooftop trolley, classmates and the coordinated group routine on the steps':scene.setting==='denial'?'The full DENIAL IS A RIVER sitcom: house, flowers, living rooms, kitchen, guests and costumes, slapstick window exit, exposed television studio, telephone, smoke, falling scenery and breathing exercise':scene.setting==='aperture'?'The complete Aperture hotel encounter: night room and telephone, mirror, empty reception, escalators, spiral stairs and tumble, strange companion, laundry collision, lifts, inverted dance, planter, lounge and return':scene.setting==='manchild'?'The complete Manchild road trip: blonde singer in nine outfits, hitchhiking, strange vehicles, chandelier, tanker, pool hall, motel, phone, lily pond, wheeled chairs, jet ski, party, pigs, dog, orca and sunset road':scene.setting==='skibidi'?'The full SKIBIDI video: bent-wrist dance and knee lifts, street, rooster, baby carriage, aerobics trio, pub, bathroom, overhead bedroom, park, alley crowd and giant rooftop reveal. Physical mouths follow the featured singing and chant.':scene.setting==='taste'?'The complete Taste horror-comedy video: vanity, bedroom, balcony, pink hospital gown and nurse, dark lounge and fire, feathered stairwell, pool confrontation, black dresses, funeral and coffee cups. Two physical mouths follow the lullaby, singing and closing dialogue.':scene.setting==='montero'?'The complete MONTERO video: pastel garden and serpent, pink guitar, blue wigs and pink fur, tribunal and chains, wings and clouds, inverted pole descent, inferno and throne, horn transfer and winged ending. The physical mouth generates narration, singing, rap and nasal humming.':scene.setting==='badguy'?'The complete bad guy video: colourful rooms, torn yellow paper, blue-ended hair and oversized costumes, toy car and riders, pigeons and cereal, desert, snorkel goggles, spiral, water bags and red-room push-ups. The physical mouth follows the spoken opening, singing and calls.':scene.setting==='abracadabra'?'Abracadabra: physical singer in white corset, hood and flowing cape, elevated red figure with a spiked hat and cage, red dance costume, industrial hall and windows, white and dark dancers, floor movement, circle and lifted finale. Mouth movement follows the complete singing and announcement.':scene.setting==='apt'?'APT: two physical singers on the pink set, blonde curls, leather jackets, backwards cap and sunglasses, red plaid, drums, microphones, paper cut-outs, star glasses, silhouettes and dance ending. Both mouths follow the Korean and English duet.':scene.setting==='espresso'?'The complete Espresso Macchiato music video: two suited singers and coffee cups, split-screen dancing, boxes, half-and-half costume, giant cup, milk and sugar dancers, security puppeteers, swing and flying coffee beans. The mouth engine generates the singing.':scene.setting==='loser'?'The complete Loser video: yellow-shirted rapper on sunny pavement, monochrome guitar and moving coffin, park busker and white suit, red graveyard dancers, night stage and flames, racing cars, shop projections and a dog. Physical mouths follow the rap, Spanish refrain and spoken dialogue.':scene.setting==='religion'?'The complete Losing My Religion video as physical singing and staged tableaux: amber room, tall window, chair and floor poses, mandolin band, giant wings, blue garden, arrows, masks, workshop, flames and red curtains.':scene.setting==='voltage'?'Two physical singers in an ornate green room with portraits, fireplace and armchairs, glowing costumes, stuffed-moose ride and red-curtain saxophone finale. Mouths, dancing, light pulses and cuts follow the complete music video.':scene.setting==='babooshka'?'Babooshka: physical singer in black veil beside a carved double bass, touching strings and neck, gold warrior costume, crown, boots and flowing striped sleeves, backlight and closing dance':scene.setting==='rockdj'?'Rock DJ: roller disco, physical singer, circular hatch and stage, skaters and wheels, DJ booth, industrial fans, clothes removal, anatomy panels, ribs, skeleton and closing dance':scene.setting==='confusion'?'Land of Confusion: physical puppet singers, bedroom and chimpanzee, exaggerated caricatures, nightmare jungle, dinosaurs, band and political screens, Superman, puppet crowd and the wrong button':scene.setting==='blackhole'?'Black Hole Sun: physical hilltop singer, strange suburb, warped smiles, preacher, kitchen, dog, barbecue, television, pool, black hole, flying debris and dark band finale':scene.setting==='remember'?'Remember the Time: Egyptian palace, physical royal cast, gold costume, magic sand, corridor chase, market, balcony and dancing courtyard':scene.setting==='monkey'?'Shock the Monkey: blue office, physical singer, scattered papers and projector, painted face and white ritual room, forest, water and looming animal':scene.setting==='spin'?'You Spin Me Round: purple velvet costume, black eye-patch look, gold picture frame, mirror ball, extra arms, circling ribbons, band and flag dancers':scene.setting==='surprises'?'No Surprises: a physical singer with short hair and dark clothing inside a transparent helmet, changing reflections and lighting, rising and draining water, bubbles and a relieved ending':scene.setting==='crucified'?'Crucified: the full baroque video pageant with three physical voices, crown, curls, red coat, ruffles, throne, curtains, bathtub, bonnet, violin and giant birdcage':scene.setting==='gowest'?'Go West: the full geometric video with physical lead and answering chorus, blue and yellow uniforms, star helmets, stairs, clouds, marching figures, grey city, red statues and rings':scene.setting==='darkness'?'The Darkness: silver spaceship, heart bath, purple bedroom, pink alien landscape and crab, amplifier walls, glam costumes, moving band, red tentacles and guitar lasers':scene.setting==='lullaby'?'Lullaby: the iron bed, striped pyjamas, pillows and red blanket, spider and webs, window hands, trapped singer and cobweb-covered band':scene.setting==='wildboys'?'The Wild Boys: industrial factory, rotating windmill, bound physical singer, mechanical head and monitor, water, cages, band and punk dancers':scene.setting==='glass'?'Walking on Broken Glass: red hood and embroidered gown, powdered wigs, candlelit party, romantic quarrel and spiral staircase':scene.setting==='phantom'?'The full Nightwish Phantom of the Opera concert: five physical band heads and two singing voices, a gold-coated singer with a yellow microphone, long-haired bassist with a split beard, guitarist, keyboard player and bandana-wearing drummer. Blue and purple beams, a red-lit finale, stage trusses, backdrop, moving instruments and waving audience follow source time.':scene.setting==='dreams'?'Eurythmics Sweet Dreams: orange-haired physical singer in a suit and gloves, boardroom and globe, synthesizer and monitors, cows, outdoor string players, boat and wake-up ending.':scene.setting==='behaviour'?'Björk Human Behaviour: miniature forest and giant plush bear, wooden cabin and cereal bowl, moth, road, blue water and the moon journey.':scene.setting==='breakfree'?'Queen I Want to Break Free: the costumed singer and moving vacuum cleaner, patterned living room and stairs, kitchen, blue-lit crowd and white-box ballet.':scene.setting==='player'?'The full Baby Come Back band performance: five physical heads, separate lead and backing singers, blue-shirted lead in a dark vest, red-shirted bassist, white-jacketed guitarist, blue keyboard player and blond drummer. Twin keyboards, guitars, drums, amplifiers and microphone stands follow the original vintage stage and camera cuts.':scene.setting==='tipsy'?'The full Greek rock mashup: long-haired physical singer in a fringed waistcoat and red scarf with a handheld microphone, pink-shirted bassist, red guitar, organ and moving hands, drummer, cymbals and seated audience. Greek singing, English hook, greetings and closing speech follow the original music.':scene.setting==='ashes'?'The complete Ashes to Ashes video: a physical singer in a ruffled Pierrot costume on a pink shoreline, memory cards, a dark-clad procession and yellow bulldozer, padded room and wooden chair, monochrome astronaut and attendants, dark water, blue hoses and the closing walk with the older woman. Four physical heads share one retained singing model and follow the original music.':scene.setting==='sledge'?'The full Sledgehammer video: microscopic cells and a giant physical singing face, miniature train, speaker, chalkboard, clay and fruit masks, fish, cardboard room, dancing chickens, crowded dance floor, moving furniture and a final figure made of lights. Stop-motion props follow source time while the physical mouths follow the original music.':scene.setting==='wildroses'?'The complete Where the Wild Roses Grow video: two physical singers, a red-haired woman in a white slip dress floating face-up among reeds and reflections, a dark-haired man in a white shirt kneeling on the bank, soft rose-filled portraits, hand gestures, a snake across the gown and a red rose placed at her lips. Their independent physical voices follow the original music.':scene.setting==='takeon'?'The complete Take On Me video: a pencil-sketch motorcycle race, a woman reading a comic in a colour cafe, a reaching hand, the paper world and a window into a colour band performance, wrench-wielding pursuers, torn-paper escape, apartment and sketch-to-human transformation. Physical lead and chorus mouths follow the original music.':scene.setting==='nothing'?'The complete Nothing Compares 2 U video: a close physical singer with cropped hair, black high collar, restrained expressions and tears against black. Formal garden paths, autumn trees, clipped hedges, fountain, stone statues, balustrade and a walking figure dissolve over her face. The two physical heads borrow one retained mouth model and follow the original music.':scene.setting==='amadeus'?'The full Rock Me Amadeus video: a Vienna title postcard, Ferris wheel and cathedral, coach and horses, tuxedoed physical Falco, his coloured Mozart wig, brocade coat and white cravat, pastel courtiers with powdered wigs, a grand windowed hall, chandelier, neon biker bar, motorcycles and final prayer. The featured German and English vocals and chorus come from physical mouths.':scene.setting==='wuthering'?'The complete red-dress Wuthering Heights video: one physical singer with long brown hair, fringe, a red flower, earrings, red flowing sleeves, black belt and moving skirt dances in a windswept green field among tall pine trees. Face-framing hands, reaches, turns and a long receding dance follow the source clock.':scene.setting==='stay'?'Two contrasting physical singers in the full Stay bedside scene: cropped hair and a white-trimmed black dress, long dark curls and a sparkling metallic outfit, a brass bed and silent patient, blue pillars, stars and Earth, the backlit curtain tunnel, bedside struggle, revival and final embrace.':scene.setting==='mendes'?'A warm sepia performance of Mas Que Nada. One physical female Portuguese singer with long hair, a patterned period dress and a vintage microphone moves between close-ups and a lush jungle duo. Decorative figures show Sérgio playing a grand piano, a second singer and the band. Gentle zooms and source-time camera cuts end in a fade.':scene.setting==='november'?'The complete November Rain film: a physical singer at a grand piano, orchestra and answering singer, candlelit wedding and veil, desert church and top-hatted guitarist, reception and storm, cake dive, funeral, umbrellas and red roses at the grave. Mouths and camera cuts follow the source clock.':scene.setting==='unbreak'?'A physical Toni with brown curls moves from warm home memories and a blue pool to a lonely staircase and a white-gown theatre performance. The motorcycle, mirror, bedroom, orchestra, audience, moving bows, spotlights and closing red curtains follow the source video.':scene.setting==='bonjovi'?'A shaggy-blond physical Jon in dark clothing sings expressive gestures beside a vintage silver microphone. The complete video moves from a black opening and crowded balcony market to a dusty convertible, apartment and bed, a crowded party, dramatic close-ups, clothed embraces and silhouettes, a kitchen and painting loft argument, Jon on the phone, an explosion, an emergency street and a turquoise art studio.':scene.setting==='hello'?'A performing-arts school with a physical singer and actors, lockers, dance class, telephone, grand piano and the clay portrait reveal.':scene.setting==='bodyguard'?'A physical singer with short curls and a navy suit follows the complete supplied video, from warm microphone close-ups and a dark theatre to a lounge chair, cabin, snowy exterior and airport farewell. Her physical mouth follows the original song, including its unaccompanied opening and full final high run.':scene.setting==='jetaime'?'A physical French singer with an updo, hoop earrings, purple feather shoulders and patterned long dress performs at a vintage microphone in a green industrial warehouse. A long black limousine, square lamps, roof trusses and three copies follow the full supplied video.':scene.setting==='fade'?'A restrained long-haired singer at a microphone, a blue-lit band and monochrome clouds alternate with dusty desert, sunglasses, a freight train, a car, sunlit stairs and birds flying from power lines. Her physical mouth follows the full song.':scene.setting==='airsupply'?'Two physical singers, an acoustic guitar, a blue-lit band, a white vintage car, a brick street, picnic, petrol station, diner and romantic closing silhouettes follow the complete music video.':scene.setting==='beast'?'Two physical singers in a gothic love story, with a motorcycle chase, a cracked mirror, candles, an ornate chair, a floating bed, detectives and a sunset escape.':scene.setting==='eclipse'?'The gothic school, Bonnie, the bright-eyed chorus and the courtyard':scene.setting==='bolton'?'A physical singer with long windblown curls sings with enormous romantic gestures amid sunset fire, canyon rocks and a dark cave. Brown coat, blue shirt and black clothing, lovers and silhouettes of horses follow the complete video.':scene.setting==='workshop'?'A suspicious physical narrator watches a flickering workshop window. Covered machinery, tools, shelves, drifting haze and unexplained human shadows accompany the complete recording.':scene.setting==='autumn'?'A black-and-white physical singer in a suit, patterned tie and pocket square performs in a leafy television garden with flowers and a woven fan-backed chair. His mouth and gentle gestures follow the full song.':scene.setting==='lifetime'?'A physical performer in a dark suit, bow tie and glasses dances with stiff knees, chopping arms and hands at his head. Four copies, blue-green flowing water and monochrome dance projections follow the complete music video.':scene.setting==='henge'?'A physical singer with curly hair moves between a TV studio, kitchen, bedroom, car and Stonehenge. Exaggerated gestures, a bewildered companion, car headlights and a sunset follow the full music video.':scene.setting==='disco'?'A silver-suited physical singer with a sculpted headpiece, coloured disco circles, checkerboard dancers and a waving audience. His gestures and mouth follow the full performance.':scene.setting==='mansion'?'A physical singer in a flowing pale robe moves through a candlelit mansion, bedroom, mirrors and wind-filled corridors. Rain, lightning, a motorcycle opening and a ghostly lover follow the music video.':scene.setting==='superman'?'A physical singer at a keyboard, a circular light and enlarged hand shadows. Red silhouettes, dark close-ups and abstract lights follow the music video.':scene.setting==='puppets'?'Mahna Mahna puppet performance':scene.setting==='theatre'?'A surreal theatre with gold curtains, six physical voices, a stern headmaster, drummer, orchestra, cowboy exchange, ghosts, a human-headed turtle, dancers, a megaphone, a parrot and a spinning record. Mouth movement and camera cuts follow the supplied music video.':scene.setting==='classroom'?'A colourful classroom with a dancing teacher in glasses and a long coat, seated students answering with physical mouths, desks, a globe, arched windows, audience and a harmonica player. The class rises to dance in the finale.':scene.setting==='dome'?'Truman discovers the painted sky wall from his sailboat, climbs the stairs and opens an exit. Christof speaks from a broadcast room with screens, glasses and a beret. Viewers watch, Truman bows and leaves, and the transmission ends. Physical mouths follow the dialogue.':scene.setting==='park'?'Sean in a cap and beard and Will in a brown jacket sit on a wooden bench beside a pond. Their physical mouths follow the conversation. Trees, swans and distant walkers surround them; Sean stands and walks away at the end.':scene.setting==='ranger'?'The Interstellar launch cabin with four helmeted astronauts and TARS, a rectangular robot with a physical airway inside its display. A joke light flashes, the humor setting changes, and exterior shots show the rocket and Earth during stage separation.':scene.setting==='bowling'?'A wireframe bowling alley with wooden lanes, pins, red seats and ball returns. Jesus wears purple and bowls, celebrates and approaches the Dude, Walter and Donny with his teammate. Four physical mouths follow the conversation; Walter wears yellow glasses and the Dude has a beard and a beeper.':scene.setting==='rooftop'?'Roy and Deckard on a rainy wireframe rooftop, with neon lights, pipes and puddles. Roy leaps across the gap, pulls Deckard to safety and speaks through his physical mouth. A white dove rests in his hand, then flies into the night as his head bows.':scene.setting==='river'?'A wireframe singer in a long patterned dress performs Rechenka on a blue river stage, with a boat, wooden dock, weeping branches, flowing water lights, mist, shadow dancers, judges and an audience. Her mouth, hands and kneeling ending follow the performance.':scene.setting==='concert'?'A wireframe singer in a dark teal suit performs with a handheld microphone on a televised concert stage. Blue, amber, red and white light fans sweep above a pianist, strings, drum kit, guitarists, backing singers and a seated audience. His mouth and expressive hands follow the performance.':scene.setting==='opera'?'An Italian tenor sings through a physical mouth at a stand microphone on a blue-lit opera stage. A conductor leads seated violinists, cellists and brass players; a choir stands behind them and an audience applauds.':scene.setting==='odyssey'?'A wireframe Apollo spacecraft, docked to its lunar module, drifts between the Earth and the Moon. A panel blows off its side and gas streams out. Three astronauts float at the control panel as warning lights come on; a controller sits at a console in Houston and the flight director stands behind him. Their mouths follow the physical dialogue.':scene.setting==='moon'?'A wireframe lunar module descends over a cratered grey surface, its shadow running ahead and dust blowing out as it touches down. Two helmeted astronauts stand in its cabin and a flight controller sits at a console in Houston; their mouths follow the physical dialogue.':scene.setting==='cosmos'?'Carl Sagan’s physical mouth sits at a wireframe desk in a tan jacket. Flatland figures, an apple, a cube and a tesseract follow his explanation.':scene.setting==='throne'?'A green wireframe throne room. A great glowing Head hangs over the throne and speaks to a girl, a scarecrow, a tin man and a lion, until a small dog tips over a screen and a little old man is found behind it. Their mouths follow the physical dialogue.':scene.setting==='ward'?'McMurphy and the other patients sit in a wireframe ward with windows and wooden chairs. The physical mouths follow the dialogue; the patients react and the nurses watch with a clipboard.':scene.setting==='matrix'?'Neo, a bald boy in a robe and the Oracle’s assistant in a green wireframe waiting room. A spoon bends, passes to Neo and shows his stylized reflection. Their mouths follow the physical dialogue.':scene.setting==='arrival'?'Ian and Louise stand at a wireframe field camp beneath a dusk sky. Ian looks up, then turns toward Louise; his mouth follows the physical dialogue while she reacts silently.':scene.setting==='beach'?'Two physical mouth characters meet on a glowing beach beneath a spiral galaxy. Ellie wears a flight suit and headset; her father approaches, embraces her and joins her on the sand. Their mouths follow the reconstructed dialogue.':scene.setting==='karaoke'?'A wireframe singer with shoulder-length hair and a handheld microphone in a warm karaoke room. A seated listener in glasses and a cardigan watches and joins the applause. The mouth follows the physical singing.':scene.setting==='press'?'A robotic speaker in a wireframe suit and red tie, behind a lectern with two microphones and an American flag. His mouth, head and hand follow the speech.':scene.setting==='core'?'A dark red memory core. A simulated mouth speaks from the computer’s eye while an astronaut removes glowing modules from the wall, and the room dims.':scene.setting==='cliffs'?'The Cliffs of Insanity with three wireframe characters and a masked climber. Their simulated mouths follow the dialogue.':'A cinematic courtroom with two wireframe characters. The simulated mouths follow the spoken dialogue.'}/>}</div>;
}
