import { ELECTRONIC_CAST, ELECTRONIC_INFO, ELECTRONIC_SETTINGS } from './electronic-videos.ts';
import { STORYBOOK_CAST, STORYBOOK_INFO, STORYBOOK_SETTINGS } from './storybook-videos.ts';

export const CINEMATIC_SETTINGS = [
  'teardrop', 'lotusflower', 'prodigybreathe', 'batforlashes', 'glorybox', 'basementhead', 'miabadgirls',
  ...ELECTRONIC_SETTINGS,
  ...STORYBOOK_SETTINGS,
] as const;
export type CinematicSetting = typeof CINEMATIC_SETTINGS[number];

export const CINEMATIC_CAST = {
  ...ELECTRONIC_CAST,
  ...STORYBOOK_CAST,
  teardrop: ['teardrop-voice'],
  lotusflower: ['lotus-voice'],
  prodigybreathe: ['breathe-voice'],
  batforlashes: ['night-road-voice'],
  glorybox: ['glory-voice'],
  basementhead: ['head-at-voice'],
  miabadgirls: ['bad-girls-voice'],
} as const;

export const CINEMATIC_INFO = {
  ...ELECTRONIC_INFO,
  ...STORYBOOK_INFO,
  teardrop: {
    id: 'massive-teardrop', title: 'Massive Attack · Teardrop',
    eyebrow: 'PHYSICAL VOICE · THE SUBMERGED GLASSHOUSE',
    description: 'A copper-lit seed pod hangs in an underwater glasshouse. Ripples and drifting fragments follow the pulse of the song.',
    names: ['Lead voice'], female: [.80], child: [.017], bpm: 77, source: 'u7K72X4eo_s',
    shots: [[0,'teardrop-glasshouse'],[22,'teardrop-portrait'],[41,'teardrop-ripples'],[64,'teardrop-portrait'],[84,'teardrop-seed'],[105,'teardrop-ripples'],[132,'teardrop-seed'],[148,'teardrop-portrait'],[178,'teardrop-ripples'],[207,'teardrop-portrait'],[231,'teardrop-seed'],[256,'teardrop-glasshouse'],[275,'teardrop-portrait']],
  },
  lotusflower: {
    id: 'radiohead-lotus-flower', title: 'Radiohead · Lotus Flower (From the Basement)',
    eyebrow: 'PHYSICAL VOICE · PAPER AND SILVER',
    description: 'A silver-gelatin paper theater opens and closes around a single dancer, using the full From the Basement performance.',
    names: ['Lead voice'], female: [.24], child: [.018], bpm: 128, source: 'JAhywJkalUE',
    shots: [[0,'lotus-folds'],[18,'lotus-shadow-dance'],[33,'lotus-portrait'],[58,'lotus-paper'],[81,'lotus-shadow-dance'],[108,'lotus-portrait'],[131,'lotus-paper'],[155,'lotus-shadow-dance'],[178,'lotus-portrait'],[202,'lotus-paper'],[225,'lotus-shadow-dance'],[250,'lotus-portrait'],[279,'lotus-folds']],
  },
  prodigybreathe: {
    id: 'prodigy-breathe', title: 'The Prodigy · Breathe',
    eyebrow: 'PHYSICAL VOICE · THE FURNACE HALL',
    description: 'Hot steel, an open furnace and a shuttered turbine frame a rave performance. Sparks and shifting light move with the beat.',
    names: ['Lead voice'], female: [.07], child: [.007], bpm: 130, source: 'rmHDhAohJlQ',
    shots: [[0,'breathe-turbine'],[14,'breathe-close'],[30,'breathe-furnace-dance'],[46,'breathe-shutter'],[64,'breathe-close'],[82,'breathe-turbine'],[106,'breathe-furnace-dance'],[128,'breathe-close'],[146,'breathe-shutter'],[164,'breathe-furnace-dance'],[183,'breathe-close'],[206,'breathe-furnace-dance'],[224,'breathe-turbine']],
  },
  batforlashes: {
    id: 'bat-for-lashes-girl', title: "Bat for Lashes · What's a Girl to Do?",
    eyebrow: 'PHYSICAL VOICE · THE MIDNIGHT ROAD',
    description: 'A wet ribbon of road disappears into a hand-built nocturnal forest. Moonlight, mist and small lanterns follow the singer.',
    names: ['Lead voice'], female: [.77], child: [.015], bpm: 111, source: 'n1wnOUH2jk8',
    shots: [[0,'night-road'],[15,'night-portrait'],[29,'night-fog'],[45,'night-moon'],[62,'night-portrait'],[79,'night-lanterns'],[96,'night-road'],[111,'night-portrait'],[126,'night-moon'],[141,'night-lanterns'],[156,'night-close'],[166,'night-road']],
  },
  glorybox: {
    id: 'portishead-glory-box', title: 'Portishead · Glory Box',
    eyebrow: 'PHYSICAL VOICE · AFTER THE LAST SHOW',
    description: 'In an empty Art Deco theater, velvet, warm brass and smoke frame a quiet vocal that grows into a full spotlight.',
    names: ['Lead voice'], female: [.78], child: [.005], bpm: 120, source: '8uciibl0rcs',
    shots: [[0,'glory-curtain'],[14,'glory-portrait'],[35,'glory-staircase'],[54,'glory-spotlight'],[73,'glory-portrait'],[92,'glory-curtain'],[111,'glory-staircase'],[132,'glory-portrait'],[152,'glory-spotlight'],[173,'glory-curtain'],[191,'glory-portrait'],[204,'glory-curtain']],
  },
  basementhead: {
    id: 'basement-jaxx-head-at', title: "Basement Jaxx · Where's Your Head At",
    eyebrow: 'PHYSICAL VOICE · THE ANALOG SOUND LAB',
    description: 'Glass chambers, blue steel and phosphor-green dials form a sound lab where the chorus takes over the experiment.',
    names: ['Lead voice'], female: [.14], child: [.008], bpm: 128, source: '5rAOyh7YmEc',
    shots: [[0,'lab-chambers'],[19,'lab-oscillators'],[37,'lab-portrait'],[56,'lab-cable-dance'],[74,'lab-scan'],[92,'lab-close'],[111,'lab-chambers'],[128,'lab-cable-dance'],[147,'lab-oscillators'],[167,'lab-portrait'],[186,'lab-scan'],[207,'lab-cable-dance'],[229,'lab-chambers']],
  },
  miabadgirls: {
    id: 'mia-bad-girls', title: 'M.I.A. · Bad Girls',
    eyebrow: 'PHYSICAL RAP · THE MIRROR VALLEY',
    description: 'Terracotta dust and mirrored forms catch the last light over an open desert road while the rapper and her doubles trade poses.',
    names: ['Lead voice'], female: [.58], child: [.012], bpm: 143, source: '2uYs0gJD-LE',
    shots: [[0,'valley-road'],[16,'valley-portrait'],[31,'valley-mirror-dance'],[50,'valley-dust'],[70,'valley-portrait'],[91,'valley-lamps'],[109,'valley-mirror-dance'],[129,'valley-road'],[150,'valley-portrait'],[170,'valley-dust'],[189,'valley-mirror-dance'],[210,'valley-lamps'],[231,'valley-road']],
  },
} as const;

export const isCinematic = (setting: unknown): setting is CinematicSetting =>
  CINEMATIC_SETTINGS.some(candidate => candidate === setting);
