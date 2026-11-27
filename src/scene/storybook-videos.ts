export const STORYBOOK_SETTINGS = [
  'cornflake', 'waterriver', 'bachelorette', 'suburbs', 'elephantstudio', 'heyya', 'chandelier',
] as const;
export type StorybookSetting = typeof STORYBOOK_SETTINGS[number];

export const STORYBOOK_CAST = {
  cornflake: ['conservatory-voice'],
  waterriver: ['boathouse-voice'],
  bachelorette: ['paper-opera-voice'],
  suburbs: ['model-street-voice'],
  elephantstudio: ['clay-studio-voice'],
  heyya: ['television-voice'],
  chandelier: ['mica-loft-voice'],
} as const;

export const STORYBOOK_INFO = {
  cornflake: {
    id: 'tori-cornflake-girl', title: 'Tori Amos · Cornflake Girl',
    eyebrow: 'PHYSICAL VOICE · THE CLOCKWORK CONSERVATORY',
    description: 'A burgundy piano sits in a glass conservatory of brass gears and dried wheat. Seed heads catch a blade of afternoon light.',
    names: ['Lead voice'], female: [.81], child: [.018], bpm: 102,
    source: 'https://www.dailymotion.com/video/xbxlqi6',
    shots: [[0,'conservatory-glass'],[17,'conservatory-portrait'],[32,'conservatory-wheat'],[49,'conservatory-piano'],[64,'conservatory-close'],[83,'conservatory-wheat'],[101,'conservatory-portrait'],[120,'conservatory-piano'],[143,'conservatory-clockwork'],[163,'conservatory-close'],[179,'conservatory-wheat'],[197,'conservatory-portrait'],[218,'conservatory-clockwork'],[230,'conservatory-glass']],
  },
  waterriver: {
    id: 'pj-harvey-down-water', title: 'PJ Harvey · Down by the Water',
    eyebrow: 'PHYSICAL VOICE · THE FLOODED BOATHOUSE',
    description: 'Oxblood velvet hangs over a flooded slate floor. A low red lantern and spreading ripples pick out the singer in the dark.',
    names: ['Lead voice'], female: [.72], child: [.006], bpm: 123,
    source: 'https://www.dailymotion.com/video/x8syx4s',
    shots: [[0,'boathouse-flood'],[12,'boathouse-portrait'],[28,'boathouse-slate'],[43,'boathouse-lantern'],[59,'boathouse-close'],[74,'boathouse-flood'],[91,'boathouse-portrait'],[111,'boathouse-slate'],[129,'boathouse-lantern'],[148,'boathouse-portrait'],[163,'boathouse-close'],[183,'boathouse-flood']],
  },
  bachelorette: {
    id: 'bjork-bachelorette', title: 'Björk · Bachelorette',
    eyebrow: 'PHYSICAL VOICE · THE PAPER OPERA',
    description: 'An opera house built from folded pages surrounds the singer with carved paper balconies, ink-black trees and a red proscenium.',
    names: ['Lead voice'], female: [.83], child: [.024], bpm: 90,
    source: 'https://www.dailymotion.com/video/x15ctd',
    shots: [[0,'paper-opera-book'],[19,'paper-opera-portrait'],[37,'paper-opera-balcony'],[54,'paper-opera-proscenium'],[75,'paper-opera-close'],[93,'paper-opera-trees'],[111,'paper-opera-portrait'],[130,'paper-opera-book'],[151,'paper-opera-balcony'],[171,'paper-opera-close'],[192,'paper-opera-trees'],[211,'paper-opera-proscenium'],[231,'paper-opera-portrait'],[252,'paper-opera-balcony'],[272,'paper-opera-close'],[294,'paper-opera-trees'],[315,'paper-opera-book']],
  },
  suburbs: {
    id: 'arcade-fire-suburbs', title: 'Arcade Fire · The Suburbs',
    eyebrow: 'PHYSICAL VOICE · BLUE HOUR ON THE MODEL STREET',
    description: 'Handmade houses and miniature cars line an empty street at blue hour. Porch lamps warm the edges of the paper sky.',
    names: ['Lead voice'], female: [.13], child: [.009], bpm: 117,
    source: 'https://www.universal-music.de/arcade-fire/videos/the-suburbs-330974',
    shots: [[0,'model-street-blue-hour'],[21,'model-street-portrait'],[39,'model-street-porch'],[56,'model-street-lanes'],[73,'model-street-close'],[93,'model-street-horizon'],[111,'model-street-portrait'],[130,'model-street-porch'],[151,'model-street-lanes'],[170,'model-street-close'],[190,'model-street-horizon'],[211,'model-street-blue-hour'],[230,'model-street-portrait'],[249,'model-street-lanes'],[268,'model-street-close'],[290,'model-street-porch'],[310,'model-street-horizon'],[334,'model-street-blue-hour']],
  },
  elephantstudio: {
    id: 'tame-impala-elephant', title: 'Tame Impala · Elephant',
    eyebrow: 'PHYSICAL VOICE · THE CLAY RECORDING ROOM',
    description: 'Cables, cabinets and reels made from hand-shaped clay lean into the groove under tobacco-orange lamps.',
    names: ['Lead voice'], female: [.28], child: [.014], bpm: 123,
    source: 'https://www.dailymotion.com/video/x2of336',
    shots: [[0,'clay-studio-cabinets'],[12,'clay-studio-portrait'],[27,'clay-studio-reels'],[44,'clay-studio-close'],[59,'clay-studio-lamps'],[73,'clay-studio-cabinets'],[86,'clay-studio-portrait'],[106,'clay-studio-reels'],[129,'clay-studio-lamps'],[152,'clay-studio-close'],[171,'clay-studio-portrait'],[191,'clay-studio-cabinets'],[204,'clay-studio-reels']],
  },
  heyya: {
    id: 'outkast-hey-ya', title: 'OutKast · Hey Ya!',
    eyebrow: 'PHYSICAL VOICE · THE EMERALD TELEVISION STUDIO',
    description: 'Four performers share a mid-century color television stage built from emerald panels, chrome tubing and illuminated glass.',
    names: ['Lead voice'], female: [.18], child: [.012], bpm: 159,
    source: 'https://www.youtube.com/watch?v=PWgvGjAhvIw',
    shots: [[0,'television-panel'],[17,'television-portrait'],[35,'television-ensemble'],[53,'television-close'],[71,'television-tubes'],[91,'television-ensemble'],[109,'television-portrait'],[131,'television-panel'],[150,'television-close'],[170,'television-ensemble'],[191,'television-tubes'],[213,'television-portrait'],[231,'television-ensemble'],[255,'television-close'],[274,'television-ensemble'],[293,'television-panel']],
  },
  chandelier: {
    id: 'sia-chandelier', title: 'Sia · Chandelier',
    eyebrow: 'PHYSICAL VOICE · THE MICA LOFT',
    description: 'Silver mica hangs from the ceiling of an indigo loft. The singer moves between a cool skylight and the amber gleam of the chandelier.',
    names: ['Lead voice'], female: [.88], child: [.012], bpm: 87,
    source: 'https://www.dailymotion.com/video/x7y7rv1',
    shots: [[0,'mica-loft-skylight'],[12,'mica-loft-portrait'],[29,'mica-loft-close'],[43,'mica-loft-chandelier'],[61,'mica-loft-floor'],[77,'mica-loft-portrait'],[95,'mica-loft-skylight'],[114,'mica-loft-close'],[132,'mica-loft-chandelier'],[152,'mica-loft-portrait'],[170,'mica-loft-floor'],[189,'mica-loft-close'],[206,'mica-loft-chandelier'],[223,'mica-loft-skylight']],
  },
} as const;

export const isStorybook = (setting: unknown): setting is StorybookSetting =>
  STORYBOOK_SETTINGS.some(candidate => candidate === setting);
