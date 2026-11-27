export const ENCORE_SETTINGS = ['virtualinsanity','genghiskhan','silkchiffon','auroracure','aboutdamntime','kyliehead','roisinover'] as const;
export type EncoreSetting = typeof ENCORE_SETTINGS[number];

export const ENCORE_CAST = {
  virtualinsanity:['virtual-jay'], genghiskhan:['genghis-andrew'],
  silkchiffon:['silk-katie','silk-phoebe'], auroracure:['cure-aurora'],
  aboutdamntime:['time-lizzo'], kyliehead:['head-kylie'], roisinover:['over-roisin'],
} as const;

export const ENCORE_INFO = {
  virtualinsanity: {
    id:'jamiroquai-virtual-insanity', title:'Jamiroquai · Virtual Insanity', eyebrow:'PHYSICAL VOICE · A ROOM THAT SLIDES',
    description:'A dancer in a gray room moves between sliding black seats and white-panel walls.',
    names:['Jay'], female:[.17], child:[.007], bpm:92, source:'4JkIs37a2JE',
    shots:[[0,'virtual-gray-room'],[15,'virtual-seat-dance'],[39,'virtual-white-ensemble'],[63,'virtual-floor-dance'],[82,'virtual-gray-room'],[103,'virtual-seat-dance'],[125,'virtual-floor-dance'],[147,'virtual-hat-close'],[171,'virtual-gray-room'],[189,'virtual-hat-close'],[210,'virtual-seat-dance'],[227,'virtual-finale']] as const,
  },
  genghiskhan: {
    id:'miike-snow-genghis-khan', title:'Miike Snow · Genghis Khan', eyebrow:'PHYSICAL VOICE · AN UNEXPECTED DUET IN A SPY LAIR',
    description:'A retro lair, a warm sitting room and a blue-lit passage frame a playful dance between two rivals.',
    names:['Andrew'], female:[.19], child:[.016], bpm:94, source:'P_SlAzsXa7E',
    shots:[[0,'genghis-lab'],[17,'genghis-machine'],[34,'genghis-lab-close'],[56,'genghis-passage'],[74,'genghis-lab'],[94,'genghis-lab-close'],[110,'genghis-machine'],[130,'genghis-passage'],[148,'genghis-lab-dance'],[169,'genghis-pair-dance'],[191,'genghis-house'],[212,'genghis-pair-dance'],[228,'genghis-finale']] as const,
  },
  silkchiffon: {
    id:'muna-silk-chiffon', title:'MUNA feat. Phoebe Bridgers · Silk Chiffon', eyebrow:'PHYSICAL VOICES · A PASTEL SUMMER CAMP',
    description:'A pink camp room, bright porch and improvised performance frame an exchange between Katie and Phoebe.',
    names:['Katie','Phoebe'], female:[.8,.87], child:[.019,.025], bpm:100, source:'fhyk9rchC2c',
    shots:[[0,'silk-porch'],[13,'silk-pink-close'],[29,'silk-room'],[46,'silk-garden'],[62,'silk-ensemble'],[78,'silk-porch'],[92,'silk-guest-close'],[107,'silk-room'],[127,'silk-garden'],[147,'silk-ensemble'],[165,'silk-pink-close'],[185,'silk-finale']] as const,
  },
  auroracure: {
    id:'aurora-cure-for-me', title:'AURORA · Cure For Me', eyebrow:'PHYSICAL VOICE · A MASKED CHECKERBOARD DANCE',
    description:'A checkerboard floor, striped curtains and playful masked dancers surround the lead performer.',
    names:['AURORA'], female:[.93], child:[.04], bpm:120, source:'K17df81RL9Y',
    shots:[[0,'cure-room'],[15,'cure-mask-close'],[33,'cure-lamp-ensemble'],[54,'cure-curtain'],[77,'cure-checker-dance'],[97,'cure-lamp-ensemble'],[114,'cure-mask-close'],[135,'cure-checker-dance'],[156,'cure-lamp-ensemble'],[178,'cure-mask-close'],[193,'cure-finale']] as const,
  },
  aboutdamntime: {
    id:'lizzo-about-damn-time', title:'Lizzo · About Damn Time', eyebrow:'PHYSICAL VOICE · FROM A MEETING ROOM TO DISCO',
    description:'A support circle, a mirror and a colored hallway lead to a night-time dance and a blue-lit pool.',
    names:['Lizzo'], female:[.78], child:[.008], bpm:109, source:'IXXxciRUMzE',
    shots:[[0,'time-meeting'],[17,'time-mirror-close'],[38,'time-meeting'],[57,'time-hall'],[77,'time-mirror-close'],[96,'time-disco-dance'],[115,'time-night-dance'],[137,'time-disco-dance'],[158,'time-hall'],[179,'time-night-dance'],[204,'time-water'],[230,'time-finale']] as const,
  },
  kyliehead: {
    id:'kylie-cant-get-you-out', title:"Kylie Minogue · Can't Get You Out Of My Head", eyebrow:'PHYSICAL VOICE · A FUTURIST HIGHWAY AND WHITE HOODS',
    description:'A car, a bright city plaza and white hoods give way to red costumes and a night-time ensemble.',
    names:['Kylie'], female:[.87], child:[.019], bpm:126, source:'c18441Eh_WE',
    shots:[[0,'head-road'],[13,'head-car-close'],[30,'head-white-dance'],[51,'head-ensemble'],[72,'head-hood-close'],[92,'head-red-dance'],[113,'head-white-dance'],[136,'head-hood-close'],[153,'head-night-dance'],[176,'head-night-dance'],[198,'head-night-close'],[219,'head-finale']] as const,
  },
  roisinover: {
    id:'roisin-overpowered', title:'Róisín Murphy · Overpowered', eyebrow:'PHYSICAL VOICE · COUTURE ON THE WAY HOME',
    description:'A sculptural black-and-white costume travels from a performance space to a bus, a shop and a quiet bedroom.',
    names:['Róisín'], female:[.77], child:[.006], bpm:122, source:'ysIl0qMK1ps',
    shots:[[0,'over-portrait'],[16,'over-stage'],[41,'over-street'],[64,'over-bus-close'],[87,'over-bus-close'],[108,'over-counter'],[133,'over-counter'],[154,'over-street'],[176,'over-laundry'],[196,'over-finale'],[222,'over-portrait']] as const,
  },
} as const;

export type EncoreView = typeof ENCORE_INFO[EncoreSetting]['shots'][number][1];
export const ENCORE_VIEWS = Object.fromEntries(ENCORE_SETTINGS.map(setting =>
  [setting,[...new Set(ENCORE_INFO[setting].shots.map(([,view])=>view))]],
)) as Record<EncoreSetting,EncoreView[]>;
export const isEncore = (value:unknown):value is EncoreSetting => ENCORE_SETTINGS.some(setting=>value===setting);
