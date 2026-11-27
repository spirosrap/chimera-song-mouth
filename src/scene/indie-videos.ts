export const INDIE_SETTINGS = ['brickgirl','yeahzero','takemeout','lesartistes','justicedance','intergalactic','treadmills'] as const;
export type IndieSetting = typeof INDIE_SETTINGS[number];

export const INDIE_CAST = {
  brickgirl:['bricks-jack'], yeahzero:['zero-karen'], takemeout:['takeout-alex'],
  lesartistes:['artistes-santi'], justicedance:['dance-chorus'],
  intergalactic:['intergalactic-mca','intergalactic-mike','intergalactic-adrock'], treadmills:['treads-damian'],
} as const;

export const INDIE_INFO = {
  brickgirl:{
    id:'white-stripes-fell-in-love', title:'The White Stripes · Fell In Love With A Girl',
    eyebrow:'PHYSICAL VOICE · A BRICK-BUILT ROCK DUO',
    description:'A red, white and black block mosaic turns into a miniature performance with guitar, drums and a scrolling wall of studs.',
    names:['Jack'], female:[.31], child:[.015], bpm:96, source:'fTH71AAxXmM',
    shots:[[0,'bricks-mosaic'],[8,'bricks-guitar-close'],[19,'bricks-duo'],[30,'bricks-drums'],[40,'bricks-mosaic'],[51,'bricks-guitar-close'],[63,'bricks-duo'],[74,'bricks-drums'],[88,'bricks-mosaic'],[103,'bricks-guitar-close'],[112,'bricks-finale']] as const,
  },
  yeahzero:{
    id:'yeah-zero', title:'Yeah Yeah Yeahs · Zero',
    eyebrow:'PHYSICAL VOICE · NEON LIGHTS ABOVE A NIGHT WALK',
    description:'A leather-clad singer moves through a neon alley, glass shop fronts and a silver-lit nighttime performance.',
    names:['Karen'], female:[.82], child:[.012], bpm:132, source:'pmGNo8RL5kM',
    shots:[[0,'zero-club'],[17,'zero-close'],[36,'zero-alley'],[54,'zero-window'],[73,'zero-club'],[91,'zero-neon'],[111,'zero-alley'],[133,'zero-close'],[156,'zero-window'],[178,'zero-ensemble'],[201,'zero-neon'],[224,'zero-alley'],[245,'zero-ensemble'],[265,'zero-finale']] as const,
  },
  takemeout:{
    id:'franz-take-me-out', title:'Franz Ferdinand · Take Me Out',
    eyebrow:'PHYSICAL VOICE · CUT PAPER AND CLOCKWORK',
    description:'Constructivist graphics, halftone panels and brass mechanisms shift around a sharply dressed band.',
    names:['Alex'], female:[.14], child:[.005], bpm:104, source:'Ijk4j-r7qPA',
    shots:[[0,'take-collage'],[15,'take-band'],[36,'take-motor'],[56,'take-pointer'],[75,'take-band'],[91,'take-dials'],[111,'take-close'],[132,'take-collage'],[152,'take-motor'],[174,'take-band'],[190,'take-dials'],[211,'take-motor'],[227,'take-finale']] as const,
  },
  lesartistes:{
    id:'santigold-les-artistes', title:'Santigold · L.E.S. Artistes',
    eyebrow:'PHYSICAL VOICE · A SURREAL COURTYARD',
    description:'A wooded gathering with a rider, quiet portraits and a courtyard gives way to painted color and still-life tableaux.',
    names:['Santi'], female:[.76], child:[.012], bpm:120, source:'ciJDA0tcQfs',
    shots:[[0,'artistes-courtyard'],[15,'artistes-close'],[35,'artistes-parade'],[53,'artistes-mask'],[69,'artistes-close'],[87,'artistes-still-life'],[102,'artistes-mask'],[121,'artistes-close'],[138,'artistes-still-life'],[155,'artistes-splashes'],[178,'artistes-parade'],[194,'artistes-finale']] as const,
  },
  justicedance:{
    id:'justice-dance', title:'Justice · D.A.N.C.E.',
    eyebrow:'PHYSICAL VOICE · GLOWING GRAPHICS IN MOTION',
    description:'Colorful shapes march across dark shirts and neon walls through a hallway, a crossing and an emblem-filled finale.',
    names:['Chorus'], female:[.64], child:[.21], bpm:114, source:'sy1dYFGkPUE',
    shots:[[0,'justice-hall'],[13,'justice-shirts'],[29,'justice-close'],[45,'justice-crossing'],[61,'justice-neon'],[79,'justice-shirts'],[95,'justice-hall'],[112,'justice-emblems'],[130,'justice-close'],[146,'justice-crossing'],[160,'justice-neon'],[173,'justice-finale']] as const,
  },
  intergalactic:{
    id:'beastie-intergalactic', title:'Beastie Boys · Intergalactic',
    eyebrow:'PHYSICAL VOICES · A ROBOT IN THE CITY',
    description:'Three rappers in bright workwear cross a tiled station and a miniature city below a towering robot.',
    names:['MCA','Mike D','Ad-Rock'], female:[.09,.2,.3], child:[.003,.012,.018], bpm:106, source:'qORYO0atB6g',
    shots:[[0,'intergalactic-streets'],[14,'intergalactic-robot'],[30,'intergalactic-station'],[50,'intergalactic-trio'],[71,'intergalactic-close'],[91,'intergalactic-streets'],[110,'intergalactic-robot'],[131,'intergalactic-station'],[150,'intergalactic-trio'],[172,'intergalactic-close'],[192,'intergalactic-rooftop'],[214,'intergalactic-trio'],[236,'intergalactic-robot'],[254,'intergalactic-finale']] as const,
  },
  treadmills:{
    id:'ok-go-here-it-goes', title:'OK Go · Here It Goes Again',
    eyebrow:'PHYSICAL VOICE · TREADMILL CHOREOGRAPHY',
    description:'Four silhouettes cross, turn and regroup on moving belts in a foil-lined rehearsal room.',
    names:['Damian'], female:[.31], child:[.01], bpm:146, source:'dTAAsCNK7RA',
    shots:[[0,'treads-room'],[15,'treads-crossing'],[30,'treads-line'],[45,'treads-close'],[62,'treads-pairs'],[78,'treads-crossing'],[92,'treads-line'],[107,'treads-room'],[124,'treads-close'],[140,'treads-pairs'],[155,'treads-crossing'],[170,'treads-finale']] as const,
  },
} as const;

export type IndieView = typeof INDIE_INFO[IndieSetting]['shots'][number][1];
export const isIndie = (value:unknown):value is IndieSetting => INDIE_SETTINGS.some(setting=>value===setting);
