export const SEVEN_VIDEO_SETTINGS = ['rinaxs', 'magimage', 'modelcinderella', 'wolfbloom', 'geesetaxes', 'gecsdoritos', 'confholiday'] as const;
export type SevenVideoSetting = typeof SEVEN_VIDEO_SETTINGS[number];

export const SEVEN_VIDEO_CAST = {
  rinaxs: ['xs-rina', 'xs-host'],
  magimage: ['image-mica'],
  modelcinderella: ['cinderella-cole'],
  wolfbloom: ['bloom-ellie'],
  geesetaxes: ['taxes-cameron'],
  gecsdoritos: ['doritos-laura', 'doritos-dylan'],
  confholiday: ['holiday-janet', 'holiday-sugar'],
} as const;

export const SEVEN_VIDEO_INFO = {
  rinaxs: {
    id: 'rina-xs', title: 'Rina Sawayama · XS', eyebrow: 'PHYSICAL VOICES · AFTER HOURS AT THE SHOPPING CHANNEL',
    description: 'A parcel-strewn storeroom, a television sales desk, a wood-panelled revue and the green-lit factory under the studio.',
    names: ['Rina', 'Host'], female: [.85, .12], child: [.02, 0], bpm: 114, source: 'TO2c06p6m5w',
    shots: [[0,'xs-parcels'],[12,'xs-broadcast'],[32,'xs-sales-close'],[43,'xs-broadcast'],[58,'xs-dance'],[82,'xs-sales-close'],[94,'xs-dance'],[122,'xs-broadcast'],[130,'xs-dance'],[144,'xs-factory'],[163,'xs-factory-close'],[184,'xs-factory'],[198,'xs-parcels'],[211,'xs-end']] as const,
  },
  magimage: {
    id: 'magdalena-image', title: 'Magdalena Bay · Image', eyebrow: 'PHYSICAL VOICE · THE IMAGINAL DISK WAITING ROOM',
    description: 'A white clinic, a red door, a retro television and a surreal checkerboard world with a red star and a blue runway.',
    names: ['Mica'], female: [.92], child: [.05], bpm: 118, source: 'DfcWOPpmw14',
    shots: [[0,'image-television'],[12,'image-clinic'],[33,'image-telephone'],[49,'image-television'],[66,'image-cosmos'],[86,'image-furnace'],[104,'image-checkers'],[125,'image-star'],[143,'image-clinic'],[158,'image-runway'],[183,'image-runway-close'],[199,'image-star'],[213,'image-end']] as const,
  },
  modelcinderella: {
    id: 'model-cinderella', title: 'Model/Actriz · Cinderella', eyebrow: 'PHYSICAL VOICE · A FAIRY TALE AFTER DARK',
    description: 'A blue fairy-tale book opens onto a dingy room, puppet rats, a city pavement, a blue nightclub and a candlelit birthday cake.',
    names: ['Cole'], female: [.19], child: [0], bpm: 125, source: '37ptdYkJ1d0',
    shots: [[0,'cindy-book'],[14,'cindy-room'],[44,'cindy-rats'],[69,'cindy-passage'],[91,'cindy-street'],[119,'cindy-club-close'],[151,'cindy-dj'],[172,'cindy-club'],[199,'cindy-dj'],[222,'cindy-street'],[248,'cindy-cake'],[281,'cindy-book'],[288,'cindy-end']] as const,
  },
  wolfbloom: {
    id: 'wolf-alice-bloom', title: 'Wolf Alice · Bloom Baby Bloom', eyebrow: 'PHYSICAL VOICE · ROCK BAND AND DANCE COMPANY',
    description: 'A grey rehearsal floor, a rock band, red ensemble silhouettes and an amber close-up carry the choreography across the entire cut.',
    names: ['Ellie'], female: [.84], child: [.02], bpm: 126, source: 'lBGcloF8LIY',
    shots: [[0,'bloom-rehearsal'],[17,'bloom-band'],[36,'bloom-close'],[53,'bloom-red-dance'],[73,'bloom-floor-dance'],[93,'bloom-rehearsal'],[111,'bloom-backlit-dance'],[130,'bloom-floor-dance'],[150,'bloom-close'],[165,'bloom-ensemble'],[188,'bloom-rehearsal'],[206,'bloom-amber-close'],[222,'bloom-end']] as const,
  },
  geesetaxes: {
    id: 'geese-taxes', title: 'Geese · Taxes', eyebrow: 'PHYSICAL VOICE · THROUGH THE CROWD',
    description: 'A backlit entrance and a tightly packed room alternate with a brick-wall band set and close-ups at the microphone.',
    names: ['Cameron'], female: [.13], child: [0], bpm: 132, source: 'Phh3oVCtzBg',
    shots: [[0,'taxes-door'],[12,'taxes-crowd'],[29,'taxes-crowd-close'],[49,'taxes-crowd'],[65,'taxes-band'],[79,'taxes-mic-close'],[92,'taxes-crowd'],[106,'taxes-crowd-close'],[122,'taxes-band'],[138,'taxes-mic-close'],[151,'taxes-crowd'],[163,'taxes-crowd-close'],[181,'taxes-mic-close'],[194,'taxes-end']] as const,
  },
  gecsdoritos: {
    id: 'gecs-doritos-fritos', title: '100 gecs · Doritos & Fritos', eyebrow: 'PHYSICAL VOICES · TWO WIZARDS OVER THE DESERT',
    description: 'Star-covered clothes, a flat desert, airborne wizard silhouettes, mock television news and a prismatic ending.',
    names: ['Laura', 'Dylan'], female: [.84, .28], child: [.04, .02], bpm: 117, source: '2PWMiy4RysI',
    shots: [[0,'doritos-flight'],[14,'doritos-news'],[28,'doritos-flight'],[47,'doritos-field'],[64,'doritos-prism-close'],[79,'doritos-telescope'],[97,'doritos-telescope'],[113,'doritos-news'],[132,'doritos-prism-close'],[151,'doritos-flight'],[171,'doritos-field'],[190,'doritos-prism-close'],[203,'doritos-end']] as const,
  },
  confholiday: {
    id: 'confidence-holiday', title: 'Confidence Man · Holiday', eyebrow: 'PHYSICAL VOICES · A BALLOON ABOVE THE SALT FLATS',
    description: 'Salt flats at twilight, yellow-and-teal balloon fabric, an aerial basket and a red-lit night dance.',
    names: ['Janet', 'Sugar'], female: [.89, .12], child: [.03, 0], bpm: 125, source: 'VcCSBrtyEP8',
    shots: [[0,'holiday-salt-flat'],[19,'holiday-daylight'],[42,'holiday-twilight'],[66,'holiday-balloon-dance'],[106,'holiday-basket'],[138,'holiday-balloon-dance'],[158,'holiday-night'],[181,'holiday-basket'],[209,'holiday-balloon-dance'],[233,'holiday-night'],[259,'holiday-salt-flat'],[279,'holiday-end']] as const,
  },
} as const;

export type SevenVideoView = typeof SEVEN_VIDEO_INFO[SevenVideoSetting]['shots'][number][1];
export const isSevenVideo = (value: unknown): value is SevenVideoSetting => SEVEN_VIDEO_SETTINGS.some(setting => setting === value);
export const SEVEN_VIDEO_VIEWS = Object.fromEntries(SEVEN_VIDEO_SETTINGS.map(setting =>
  [setting, [...new Set(SEVEN_VIDEO_INFO[setting].shots.map(([,view]) => view))]],
)) as Record<SevenVideoSetting, SevenVideoView[]>;
