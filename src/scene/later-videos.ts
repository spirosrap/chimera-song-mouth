export const LATER_VIDEO_SETTINGS = ['amylshouldnot', 'digitalwitness', 'yardhits', 'jungle74', 'tightrope', 'fervkandy', 'animalflow'] as const;
export type LaterVideoSetting = typeof LATER_VIDEO_SETTINGS[number];
export const LATER_VIDEO_CAST = {
  amylshouldnot: ['amyl-amy'], digitalwitness: ['witness-annie'], yardhits: ['hits-james'],
  jungle74: ['jungle-lead', 'jungle-response'], tightrope: ['tightrope-janelle', 'tightrope-big-boi'],
  fervkandy: ['kandy-karin'], animalflow: ['animal-ren'],
} as const;

export const LATER_VIDEO_INFO = {
  amylshouldnot: {
    id:'amyl-should-not', title:'Amyl and The Sniffers · U Should Not Be Doing That', eyebrow:'PHYSICAL VOICE · A DANCE-OFF FROM NEON TO DAYLIGHT',
    description:'A neon storefront, an empty swimming pool, red bar lights and a green-lit runway frame a dance-off.',
    names:['Amy'], female:[.77], child:[.015], bpm:109, source:'jCxgUPFVFkA',
    shots:[[0,'amyl-neon'],[12,'amyl-store-close'],[31,'amyl-lot-dance'],[48,'amyl-store-close'],[66,'amyl-lot-dance'],[82,'amyl-pool-dance'],[104,'amyl-sunset-close'],[119,'amyl-pool-dance'],[137,'amyl-bar-dance'],[156,'amyl-bar-close'],[173,'amyl-runway-close'],[186,'amyl-runway-dance'],[201,'amyl-finale']] as const,
  },
  digitalwitness: {
    id:'st-vincent-digital-witness', title:'St. Vincent · Digital Witness', eyebrow:'PHYSICAL VOICE · PASTEL ARCHITECTURE AND SYNCHRONIZED ROUTINES',
    description:'A teal portrait, a mustard-yellow door, monumental buildings and workers in synchronized formations.',
    names:['Annie'], female:[.82], child:[.024], bpm:110, source:'mVAxUMuhz98',
    shots:[[0,'witness-teal-close'],[15,'witness-yellow-door'],[31,'witness-plaza'],[46,'witness-line'],[61,'witness-desks'],[79,'witness-wheels'],[98,'witness-plaza'],[115,'witness-desks'],[131,'witness-green-close'],[150,'witness-conference'],[168,'witness-line'],[183,'witness-dusk-close'],[198,'witness-finale']] as const,
  },
  yardhits: {
    id:'yard-act-we-make-hits', title:'Yard Act · We Make Hits', eyebrow:'PHYSICAL VOICE · A BAND BUILDS A SHOW',
    description:'Two friends in a warm living room, a portable stereo, a brick alley and a purple-lit dance floor take the track from talk to performance.',
    names:['James'], female:[.09], child:[0], bpm:119, source:'vct334H6m-w',
    shots:[[0,'hits-lounge'],[19,'hits-lounge-close'],[45,'hits-neon-dance'],[64,'hits-alley'],[81,'hits-street'],[99,'hits-stairwell-close'],[116,'hits-neon-dance'],[135,'hits-stage-close'],[152,'hits-wall-dance'],[172,'hits-street'],[191,'hits-finale']] as const,
  },
  jungle74: {
    id:'jungle-back-on-74', title:'Jungle · Back On 74', eyebrow:'PHYSICAL VOICES · CHOREOGRAPHY IN ONE ROOM',
    description:'A timber dance floor, painted city scenery, amber spotlights and a control booth frame ensemble, pair and solo formations.',
    names:['Lead','Response'], female:[.9,.28], child:[.02,0], bpm:104, source:'q3lX2p_Uy9I',
    shots:[[0,'jungle-opening'],[16,'jungle-pair-dance'],[34,'jungle-palace-dance'],[56,'jungle-close'],[76,'jungle-city-dance'],[96,'jungle-palace-dance'],[112,'jungle-city-dance'],[130,'jungle-ensemble'],[149,'jungle-lights-dance'],[169,'jungle-line-dance'],[192,'jungle-close'],[216,'jungle-control'],[232,'jungle-finale']] as const,
  },
  tightrope: {
    id:'janelle-tightrope', title:'Janelle Monáe feat. Big Boi · Tightrope', eyebrow:'PHYSICAL VOICES · DANCE AT THE PALACE OF THE DOGS',
    description:'Institutional corridors, black-and-white tailoring, a dance hall and an exchange between two lead performers.',
    names:['Janelle','Big Boi'], female:[.85,.12], child:[.02,0], bpm:166, source:'pwnefUaKCbc',
    shots:[[0,'rope-entry'],[17,'rope-room'],[35,'rope-corridor'],[51,'rope-close'],[68,'rope-corridor'],[88,'rope-floor-dance'],[110,'rope-ensemble'],[126,'rope-guest-close'],[150,'rope-band'],[165,'rope-floor-dance'],[186,'rope-steps'],[208,'rope-room'],[229,'rope-ensemble'],[253,'rope-band'],[276,'rope-corridor'],[290,'rope-room'],[307,'rope-finale']] as const,
  },
  fervkandy: {
    id:'fever-ray-kandy', title:'Fever Ray · Kandy', eyebrow:'PHYSICAL VOICE · A JUKEBOX AND A RED-LIT STAGE',
    description:'Jukebox light, blue curtains, a green chair and a red performance space follow the changing costumes and close-ups.',
    names:['Karin'], female:[.6], child:[.008], bpm:107, source:'HpxEXMIY64c',
    shots:[[0,'kandy-jukebox'],[16,'kandy-blue-close'],[35,'kandy-pink-stage'],[60,'kandy-chair-close'],[79,'kandy-red-stage'],[99,'kandy-red-close'],[123,'kandy-blue-close'],[144,'kandy-red-stage'],[165,'kandy-red-close'],[193,'kandy-red-stage'],[221,'kandy-red-close'],[246,'kandy-finale']] as const,
  },
  animalflow: {
    id:'ren-animal-flow', title:'Ren · Animal Flow', eyebrow:'PHYSICAL RAP · ANIMAL MASKS AND A BANQUET',
    description:'A tiled corridor and a lavish table give way to masked figures, a crown and a close rap performance.',
    names:['Ren'], female:[.08], child:[0], bpm:108, source:'F4mUnmFbVNg',
    shots:[[0,'animal-entry'],[12,'animal-banquet'],[25,'animal-close'],[38,'animal-masks'],[53,'animal-banquet'],[66,'animal-close'],[80,'animal-masks'],[94,'animal-crown'],[111,'animal-banquet'],[125,'animal-close'],[144,'animal-masks'],[162,'animal-finale']] as const,
  },
} as const;

export type LaterVideoView = typeof LATER_VIDEO_INFO[LaterVideoSetting]['shots'][number][1];
export const LATER_VIDEO_VIEWS = Object.fromEntries(LATER_VIDEO_SETTINGS.map(setting =>
  [setting,[...new Set(LATER_VIDEO_INFO[setting].shots.map(([,view])=>view))]],
)) as Record<LaterVideoSetting,LaterVideoView[]>;
export const isLaterVideo = (setting: unknown): setting is LaterVideoSetting => LATER_VIDEO_SETTINGS.some(value=>value===setting);
