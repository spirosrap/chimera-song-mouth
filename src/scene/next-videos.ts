import { LATER_VIDEO_CAST, LATER_VIDEO_INFO, LATER_VIDEO_SETTINGS, LATER_VIDEO_VIEWS, isLaterVideo } from './later-videos.ts';
import { SEVEN_VIDEO_CAST, SEVEN_VIDEO_INFO, SEVEN_VIDEO_SETTINGS, SEVEN_VIDEO_VIEWS, isSevenVideo } from './seven-videos.ts';

export const NEXT_VIDEO_SETTINGS = ['jamieoliver', 'barabastu', 'anotrlikeit', 'pinkyup', 'simzyoung', 'manmadeofmeat', ...SEVEN_VIDEO_SETTINGS, ...LATER_VIDEO_SETTINGS] as const;
export type NextVideoSetting = typeof NEXT_VIDEO_SETTINGS[number];

export const NEXT_VIDEO_CAST = {
  ...SEVEN_VIDEO_CAST,
  ...LATER_VIDEO_CAST,
  jamieoliver: ['petrol-cmat', 'petrol-chef'],
  barabastu: ['bastu-kevin', 'bastu-axel', 'bastu-jakob'],
  anotrlikeit: ['likeit-vocal'],
  pinkyup: ['pinky-one', 'pinky-two', 'pinky-three', 'pinky-four', 'pinky-five'],
  simzyoung: ['young-simz'],
  manmadeofmeat: ['meat-sebastian'],
} as const;
export type NextVideoCharacter = typeof NEXT_VIDEO_CAST[NextVideoSetting][number];

const VIEW_KEYS = {
  ...SEVEN_VIDEO_VIEWS,
  ...LATER_VIDEO_VIEWS,
  jamieoliver: ['petrol-kitchen', 'petrol-revue', 'petrol-close', 'petrol-service', 'petrol-drums'],
  barabastu: ['bastu-opening', 'bastu-campfire', 'bastu-choir', 'bastu-steam', 'bastu-lights', 'bastu-finale'],
  anotrlikeit: ['likeit-hall', 'likeit-party', 'likeit-portrait', 'likeit-smoke', 'likeit-dance'],
  pinkyup: ['pinky-swans', 'pinky-toys', 'pinky-claw', 'pinky-car', 'pinky-dust', 'pinky-tea', 'pinky-dance'],
  simzyoung: ['young-flat', 'young-window', 'young-street', 'young-chase', 'young-pub', 'young-stage'],
  manmadeofmeat: ['meat-canvas', 'meat-gallery', 'meat-critics', 'meat-trampoline', 'meat-party', 'meat-blue-room', 'meat-auction'],
} as const;
export type NextVideoView = typeof VIEW_KEYS[NextVideoSetting][number];
type Shot = readonly [time: number, view: NextVideoView];

export const NEXT_VIDEO_INFO = {
  ...SEVEN_VIDEO_INFO,
  ...LATER_VIDEO_INFO,
  jamieoliver: {
    id: 'jamie-oliver-petrol-station', title: 'CMAT · The Jamie Oliver Petrol Station', eyebrow: 'PHYSICAL VOICE · KITCHEN AND VARIETY REVUE',
    description: 'A flustered chef, an exuberant singer in white feathers and a blue-carpeted television revue. Original accompaniment with CHIMERA singing and dialogue.',
    names: ['CMAT', 'Chef'], female: [.82,.11], child: [.06,.01], bpm: 128, source: 'pb7eWPEyK6w',
    shots: [[0,'petrol-kitchen'],[10,'petrol-close'],[22,'petrol-revue'],[43,'petrol-close'],[49,'petrol-revue'],[64,'petrol-kitchen'],[80,'petrol-revue'],[103,'petrol-close'],[109,'petrol-revue'],[146,'petrol-service'],[159,'petrol-kitchen'],[182,'petrol-service'],[190,'petrol-close'],[199,'petrol-revue'],[218,'petrol-kitchen'],[231,'petrol-revue'],[261,'petrol-close'],[279,'petrol-drums'],[294,'petrol-revue'],[308,'petrol-drums'],[317,'petrol-revue']] satisfies Shot[],
  },
  barabastu: {
    id: 'bara-bada-bastu', title: 'KAJ · Bara Bada Bastu', eyebrow: 'PHYSICAL VOICES · THE EUROVISION SAUNA',
    description: 'A Swedish-language Eurovision performance with three singers, conifers, sparks, a wooden sauna, towels and lasers. Original accompaniment with CHIMERA vocals.',
    names: ['Kevin','Axel','Jakob'], female: [.11,.04,.18], child: [.01,0,.03], bpm: 140, source: 'WSh7U3m9KgA',
    shots: [[0,'bastu-opening'],[10,'bastu-campfire'],[26,'bastu-choir'],[45,'bastu-steam'],[59,'bastu-choir'],[84,'bastu-steam'],[113,'bastu-choir'],[122,'bastu-steam'],[132,'bastu-lights'],[149,'bastu-finale'],[175,'bastu-lights'],[181,'bastu-finale']] satisfies Shot[],
  },
  anotrlikeit: {
    id: 'anotr-like-it', title: 'ANOTR feat. 3DDY · Like It', eyebrow: 'PHYSICAL VOCAL · THE STRANGE DANCE FLOOR',
    description: 'A red hallway opens onto a club full of veils, shoulder pads, bright spots and improvised dance steps. Original accompaniment with a CHIMERA voice.',
    names: ['3DDY'], female: [.19], child: [.03], bpm: 128, source: 'ZdcdGr940h0',
    shots: [[0,'likeit-hall'],[12,'likeit-party'],[40,'likeit-portrait'],[57,'likeit-party'],[78,'likeit-portrait'],[97,'likeit-hall'],[115,'likeit-party'],[127,'likeit-dance'],[145,'likeit-portrait'],[158,'likeit-smoke'],[174,'likeit-dance'],[216,'likeit-party'],[226,'likeit-dance'],[250,'likeit-smoke']] satisfies Shot[],
  },
  pinkyup: {
    id: 'katseye-pinky-up', title: 'KATSEYE · PINKY UP', eyebrow: 'PHYSICAL VOICES · TOYS, SWANS AND PINKIES',
    description: 'Swans, a plush-toy pile, a claw machine, a dust-filled dance hall and a strangely formal tea party. Original accompaniment with five CHIMERA voices.',
    names: ['Voice 1','Voice 2','Voice 3','Voice 4','Voice 5'], female: [.79,.85,.68,.91,.8], child: [.04,.08,.015,.05,.025], bpm: 131, source: '7F1ET2XHQfk',
    shots: [[0,'pinky-swans'],[12,'pinky-toys'],[29,'pinky-claw'],[43,'pinky-toys'],[57,'pinky-dance'],[70,'pinky-dust'],[81,'pinky-car'],[94,'pinky-dance'],[106,'pinky-toys'],[117,'pinky-car'],[128,'pinky-tea'],[147,'pinky-dance'],[163,'pinky-dust']] satisfies Shot[],
  },
  simzyoung: {
    id: 'little-simz-young', title: 'Little Simz · Young', eyebrow: 'PHYSICAL RAP · PUNK THROUGH THE WINDOW',
    description: 'An older punk with a gold grill plays bass in her flat, gets into trouble on the street and takes the stage at a crowded pub. Original accompaniment with CHIMERA rap.',
    names: ['Simz'], female: [.7], child: [0], bpm: 121, source: 's07gWh37Xcc',
    shots: [[0,'young-flat'],[18,'young-window'],[37,'young-flat'],[60,'young-street'],[80,'young-chase'],[93,'young-street'],[111,'young-pub'],[129,'young-stage'],[148,'young-pub'],[163,'young-stage'],[175,'young-street']] satisfies Shot[],
  },
  manmadeofmeat: {
    id: 'man-made-of-meat', title: 'Viagra Boys · Man Made of Meat', eyebrow: 'PHYSICAL VOICE · ART-WORLD SPECTACLE',
    description: 'An abstract canvas, glaring gallery lights, a performance-art trampoline, a blue installation and an auction crowd. Original accompaniment with CHIMERA’s deadpan vocal.',
    names: ['Sebastian'], female: [.05], child: [0], bpm: 142, source: 'UD4jRK5j2Ow',
    shots: [[0,'meat-canvas'],[18,'meat-gallery'],[29,'meat-critics'],[44,'meat-gallery'],[60,'meat-critics'],[71,'meat-gallery'],[91,'meat-trampoline'],[113,'meat-party'],[145,'meat-blue-room'],[178,'meat-critics'],[184,'meat-auction'],[208,'meat-blue-room'],[224,'meat-critics'],[247,'meat-gallery'],[267,'meat-canvas']] satisfies Shot[],
  },
} as const satisfies Record<NextVideoSetting, {
  id: string; title: string; eyebrow: string; description: string; names: readonly string[];
  female: readonly number[]; child: readonly number[]; bpm: number; source: string; shots: readonly Shot[];
}>;

export const isNextVideo = (value: unknown): value is NextVideoSetting =>
  NEXT_VIDEO_SETTINGS.some(setting => value === setting);

export const NEXT_VIDEO_SCENES = Object.fromEntries(NEXT_VIDEO_SETTINGS.map(setting => {
  const cast = [...NEXT_VIDEO_CAST[setting]];
  return [setting, { cast, main: cast, cameras: ['wide', ...cast, ...VIEW_KEYS[setting]] }];
})) as Record<NextVideoSetting,{ cast: NextVideoCharacter[]; main: NextVideoCharacter[]; cameras: ('wide' | NextVideoCharacter | NextVideoView)[] }>;

export const NEXT_VIDEO_ENTRIES = NEXT_VIDEO_SETTINGS.map(setting => {
  const { id, title, eyebrow, description } = NEXT_VIDEO_INFO[setting];
  return { id, title, eyebrow, description, assetVersion: `${id}-${isSevenVideo(setting) || isLaterVideo(setting) ? '20261127' : '20261126'}`, readyVideo: undefined,
    credit: 'A stylized CHIMERA reconstruction of the supplied video. Vocal timing, individual voice assignments and scene choreography are approximate.' };
});
