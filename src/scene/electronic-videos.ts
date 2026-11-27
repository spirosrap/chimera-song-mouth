export const ELECTRONIC_SETTINGS = [
  'royksoppstorm', 'knifecabaret', 'strictmachine', 'empiredream', 'depechesilence', 'galvanize', 'feelgoodinc',
] as const;
export type ElectronicSetting = typeof ELECTRONIC_SETTINGS[number];

export const ELECTRONIC_CAST = {
  royksoppstorm: ['observatory-voice'],
  knifecabaret: ['cabaret-voice'],
  strictmachine: ['machine-voice'],
  empiredream: ['dream-voice'],
  depechesilence: ['silence-voice'],
  galvanize: ['depot-voice'],
  feelgoodinc: ['feel-good-lead', 'feel-good-rap'],
} as const;

export const ELECTRONIC_INFO = {
  royksoppstorm: {
    id: 'royksopp-what-else', title: 'Röyksopp · What Else Is There?',
    eyebrow: 'PHYSICAL VOICE · THE COASTAL OBSERVATORY',
    description: 'Sea stacks, wet slate and sweeping lighthouse beams frame a voice at the edge of a storm.',
    names: ['Lead voice'], female: [.68], child: [.006], bpm: 118,
    source: 'https://www.dailymotion.com/video/x2me5eu',
    shots: [[0,'observatory-terrace'],[16,'observatory-portrait'],[37,'observatory-sea'],[55,'observatory-close'],[72,'observatory-lighthouse'],[90,'observatory-terrace'],[108,'observatory-portrait'],[125,'observatory-sea'],[145,'observatory-close'],[164,'observatory-lighthouse'],[185,'observatory-portrait'],[199,'observatory-terrace']],
  },
  knifecabaret: {
    id: 'knife-pass-this-on', title: 'The Knife · Pass This On',
    eyebrow: 'PHYSICAL VOICE · A SMALL-TOWN CABARET',
    description: 'A salmon-and-mint dance hall catches the glitter of a turning mirror ball as a quiet performance becomes a dance.',
    names: ['Lead voice'], female: [.66], child: [.006], bpm: 106,
    source: 'https://www.dailymotion.com/video/x1dvom',
    shots: [[0,'cabaret-floor'],[17,'cabaret-portrait'],[39,'cabaret-banquette'],[55,'cabaret-portrait'],[75,'cabaret-mirrors'],[96,'cabaret-ensemble'],[116,'cabaret-close'],[138,'cabaret-floor'],[151,'cabaret-ensemble'],[172,'cabaret-mirrors'],[190,'cabaret-close'],[211,'cabaret-ensemble'],[226,'cabaret-floor']],
  },
  strictmachine: {
    id: 'goldfrapp-strict-machine', title: 'Goldfrapp · Strict Machine',
    eyebrow: 'PHYSICAL VOICE · THE OPTICAL THEATER',
    description: 'Black lacquer, ivory shutters and colored glass butterflies glow in a theater built from optical instruments.',
    names: ['Lead voice'], female: [.86], child: [.014], bpm: 124,
    source: 'https://www.dailymotion.com/video/x17tfx',
    shots: [[0,'machine-shutters'],[18,'machine-portrait'],[36,'machine-citrine'],[53,'machine-glass-dance'],[72,'machine-close'],[91,'machine-shutters'],[109,'machine-glass-dance'],[123,'machine-portrait'],[141,'machine-citrine'],[156,'machine-glass-dance'],[177,'machine-close'],[196,'machine-glass-dance'],[208,'machine-shutters']],
  },
  empiredream: {
    id: 'empire-walking-dream', title: 'Empire of the Sun · Walking on a Dream (live)',
    eyebrow: 'PHYSICAL VOICE · A JADE ROOFTOP GARDEN',
    description: 'The televised live performance unfolds above a misty river, with bronze bells, lacquered pavilions and a coral ribbon.',
    names: ['Lead voice'], female: [.24], child: [.028], bpm: 127,
    source: 'https://www.dailymotion.com/video/x45ss8c',
    shots: [[0,'dream-river'],[16,'dream-portrait'],[33,'dream-pavilion'],[49,'dream-ribbon-dance'],[67,'dream-close'],[84,'dream-river'],[101,'dream-bells'],[117,'dream-portrait'],[135,'dream-ribbon-dance'],[154,'dream-close'],[173,'dream-bells'],[192,'dream-river'],[213,'dream-portrait'],[226,'dream-river']],
  },
  depechesilence: {
    id: 'depeche-enjoy-silence', title: 'Depeche Mode · Enjoy the Silence (Devotional Tour)',
    eyebrow: 'PHYSICAL VOICE · SILENCE ON THE SALT FLATS',
    description: 'Salt flats, suspended velvet and distant quartz frame the full Devotional Tour performance.',
    names: ['Lead voice'], female: [.07], child: [.004], bpm: 114,
    source: 'https://www.dailymotion.com/video/xjej6z',
    shots: [[0,'silence-salt'],[23,'silence-portrait'],[42,'silence-quartz'],[65,'silence-velvet'],[87,'silence-close'],[110,'silence-salt'],[137,'silence-portrait'],[160,'silence-quartz'],[187,'silence-close'],[213,'silence-velvet'],[237,'silence-salt'],[262,'silence-portrait'],[288,'silence-quartz'],[318,'silence-close'],[347,'silence-velvet'],[374,'silence-salt']],
  },
  galvanize: {
    id: 'chemical-galvanize', title: 'The Chemical Brothers · Galvanize',
    eyebrow: 'PHYSICAL RAP · THE TRAM DEPOT',
    description: 'A scarlet and cerulean dance arena lights up beneath the roof of a disused tram depot.',
    names: ['Lead rap'], female: [.10], child: [.006], bpm: 104,
    source: 'https://www.dailymotion.com/video/x3u3zr1',
    shots: [[0,'depot-girders'],[16,'depot-portrait'],[33,'depot-tile-dance'],[51,'depot-scarlet'],[69,'depot-close'],[85,'depot-cerulean'],[101,'depot-tile-dance'],[119,'depot-portrait'],[137,'depot-tile-dance'],[155,'depot-cerulean'],[176,'depot-close'],[194,'depot-tile-dance'],[211,'depot-girders']],
  },
  feelgoodinc: {
    id: 'gorillaz-feel-good-inc', title: 'Gorillaz · Feel Good Inc.',
    eyebrow: 'PHYSICAL VOICES · THE FLYING OBSERVATORY',
    description: 'A radio observatory floats beyond a painted dockside city while two physical voices trade verses.',
    names: ['Lead voice', 'Guest rap'], female: [.22,.10], child: [.012,.004], bpm: 139,
    source: 'https://www.dailymotion.com/video/x209605',
    shots: [[0,'dockside-roof'],[18,'dockside-portrait'],[40,'dockside-city'],[60,'dockside-island'],[80,'dockside-close'],[100,'dockside-island'],[119,'dockside-ensemble'],[138,'dockside-portrait'],[157,'dockside-city'],[177,'dockside-island'],[196,'dockside-close'],[215,'dockside-ensemble'],[234,'dockside-roof']],
  },
} as const;

export const isElectronic = (setting: unknown): setting is ElectronicSetting =>
  ELECTRONIC_SETTINGS.some(candidate => candidate === setting);
