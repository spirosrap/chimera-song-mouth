export const POP_SETTINGS = ['daftworld','deeegroove','coffeetv','kyliemirror','soquiet','missyrain','favouritegame'] as const;
export type PopSetting = typeof POP_SETTINGS[number];

export const POP_CAST = {
  daftworld:['world-robot'], deeegroove:['groove-kier'],
  coffeetv:['coffee-graham'], kyliemirror:['world-kylie'], soquiet:['quiet-bjork'],
  missyrain:['rain-missy'], favouritegame:['game-nina'],
} as const;

export const POP_INFO = {
  daftworld:{
    id:'daft-around-the-world', title:'Daft Punk · Around the World',
    eyebrow:'PHYSICAL VOICE · A CIRCULAR DANCE FLOOR',
    description:'Robot dancers, circular floor patterns and colored tiers repeat against a dark stage.',
    names:['Robot'], female:[.19], child:[.008], bpm:121, source:'K0HSD_i2DvA',
    shots:[[0,'daft-disc'],[13,'daft-ring-dance'],[30,'daft-robot-close'],[47,'daft-stairs'],[64,'daft-tier-ensemble'],[85,'daft-ring-dance'],[109,'daft-disc'],[131,'daft-robot-close'],[152,'daft-stairs'],[174,'daft-tier-ensemble'],[196,'daft-ring-dance'],[218,'daft-finale']] as const,
  },
  deeegroove:{
    id:'deee-lite-groove', title:'Deee-Lite · Groove Is in the Heart (live)',
    eyebrow:'PHYSICAL VOICE · A LIVE DANCE FLOOR',
    description:'A live-band performance under saturated violet and amber stage lights, with the singer and rhythm section trading close and wide views.',
    names:['Lady Miss Kier'], female:[.78], child:[.012], bpm:122, source:'etviGf1uWlg',
    shots:[[0,'groove-disc'],[16,'groove-kier-close'],[33,'groove-mosaic-dance'],[51,'groove-records'],[68,'groove-band'],[88,'groove-mosaic-dance'],[106,'groove-kier-close'],[126,'groove-kier-close'],[145,'groove-records'],[162,'groove-band'],[182,'groove-mosaic-dance'],[205,'groove-band'],[229,'groove-kier-close'],[253,'groove-records'],[275,'groove-band'],[299,'groove-kier-close'],[321,'groove-mosaic-dance'],[341,'groove-finale']] as const,
  },
  coffeetv:{
    id:'blur-coffee-and-tv', title:'Blur · Coffee & TV',
    eyebrow:'PHYSICAL VOICE · A LOST MILK CARTON',
    description:'A milk carton travels from a breakfast table through city pavements and a bus shelter to a rehearsal room.',
    names:['Graham'], female:[.15], child:[.008], bpm:108, source:'6oqXVx3sBOk',
    shots:[[0,'coffee-kitchen'],[18,'coffee-carton'],[36,'coffee-pavement'],[56,'coffee-shelter'],[79,'coffee-graham-close'],[100,'coffee-pavement'],[123,'coffee-carton'],[147,'coffee-shelter'],[169,'coffee-graham-close'],[194,'coffee-rehearsal'],[217,'coffee-pavement'],[241,'coffee-rehearsal'],[263,'coffee-graham-close'],[286,'coffee-rehearsal'],[306,'coffee-pavement'],[327,'coffee-graham-close'],[346,'coffee-carton']] as const,
  },
  kyliemirror:{
    id:'kylie-come-into-my-world', title:'Kylie Minogue · Come Into My World',
    eyebrow:'PHYSICAL VOICE · A LOOPING STREET CORNER',
    description:'Repeated figures circle the same street corner, passing a striped awning, glass storefronts and a crosswalk.',
    names:['Kylie'], female:[.83], child:[.016], bpm:110, source:'vQCirTog0cs',
    shots:[[0,'mirror-street'],[19,'mirror-kylie-close'],[38,'mirror-awning'],[60,'mirror-crosswalk'],[82,'mirror-loop-dance'],[102,'mirror-street'],[123,'mirror-kylie-close'],[145,'mirror-awning'],[163,'mirror-crosswalk'],[184,'mirror-loop-dance'],[206,'mirror-street'],[227,'mirror-loop-dance'],[246,'mirror-finale']] as const,
  },
  soquiet:{
    id:'bjork-oh-so-quiet', title:"Björk · It's Oh So Quiet",
    eyebrow:'PHYSICAL VOICE · FROM A WHISPER TO A STREET MUSICAL',
    description:'Muted garage and shop fronts open onto sweeping street choreography under pastel signs and an umbrella canopy.',
    names:['Björk'], female:[.79], child:[.019], bpm:145, source:'htobTBlCvUU',
    shots:[[0,'quiet-garage'],[15,'quiet-whisper-close'],[32,'quiet-street-dance'],[48,'quiet-storefront'],[67,'quiet-umbrella'],[83,'quiet-whisper-close'],[104,'quiet-garage'],[125,'quiet-street-dance'],[148,'quiet-storefront'],[169,'quiet-umbrella'],[188,'quiet-street-dance'],[208,'quiet-storefront'],[223,'quiet-finale']] as const,
  },
  missyrain:{
    id:'missy-the-rain', title:'Missy Elliott · The Rain (Supa Dupa Fly)',
    eyebrow:'PHYSICAL VOICE · A FISHEYE RAP STAGE',
    description:'Oversized jackets and curved floor graphics cut between a dark circular set and a luminous rain scene.',
    names:['Missy'], female:[.49], child:[.008], bpm:86, source:'hHcyJPTTn9w',
    shots:[[0,'rain-ring'],[17,'rain-inflated-close'],[35,'rain-street'],[55,'rain-ring'],[74,'rain-glass'],[94,'rain-inflated-close'],[114,'rain-crew-dance'],[135,'rain-street'],[155,'rain-ring'],[178,'rain-inflated-close'],[199,'rain-glass'],[219,'rain-crew-dance'],[237,'rain-finale']] as const,
  },
  favouritegame:{
    id:'cardigans-favourite-game', title:'The Cardigans · My Favourite Game',
    eyebrow:'PHYSICAL VOICE · A ROAD THROUGH THE DESERT',
    description:'A dark convertible crosses a pale highway beside layered rock ridges and roadside signs.',
    names:['Nina'], female:[.81], child:[.011], bpm:143, source:'u9WgtlgGAgs',
    shots:[[0,'game-highway'],[16,'game-convertible'],[37,'game-nina-close'],[56,'game-ridges'],[75,'game-highway'],[94,'game-convertible'],[115,'game-nina-close'],[136,'game-ridges'],[155,'game-roadside'],[175,'game-convertible'],[195,'game-ridges'],[215,'game-nina-close'],[234,'game-roadside'],[249,'game-finale']] as const,
  },
} as const;

export type PopView = typeof POP_INFO[PopSetting]['shots'][number][1];
export const isPop = (value:unknown):value is PopSetting => POP_SETTINGS.some(setting=>value===setting);
