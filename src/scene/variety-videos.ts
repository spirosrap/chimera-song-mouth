export const VARIETY_SETTINGS = ['dogdays','grimesoblivion','britneytoxic','gorillazdare','mgmtelectric','passionwalk','loveshack'] as const;
export type VarietySetting = typeof VARIETY_SETTINGS[number];

export const VARIETY_CAST = {
  dogdays:['dogdays-florence'], grimesoblivion:['oblivion-grimes'],
  britneytoxic:['toxic-britney'], gorillazdare:['dare-rosie','dare-shaun'],
  mgmtelectric:['electric-andrew'], passionwalk:['walk-michael'],
  loveshack:['shack-fred','shack-chorus'],
} as const;

export const VARIETY_INFO = {
  dogdays: {
    id:'florence-dog-days', title:'Florence + The Machine · Dog Days Are Over', eyebrow:'PHYSICAL VOICE · A STUDIO FILLED WITH COLOR',
    description:'A white studio fills with blue singers, copper costumes, rolling drums and plumes of color.',
    names:['Florence'], female:[.77], child:[.007], bpm:75, source:'iWOyfLBYtuU',
    shots:[[0,'dogdays-white'],[15,'dogdays-florence-close'],[35,'dogdays-white'],[56,'dogdays-blue-ensemble'],[76,'dogdays-copper-dance'],[97,'dogdays-florence-close'],[117,'dogdays-blue-ensemble'],[134,'dogdays-copper-dance'],[151,'dogdays-drums'],[173,'dogdays-blue-ensemble'],[188,'dogdays-florence-close'],[205,'dogdays-finale']] as const,
  },
  grimesoblivion: {
    id:'grimes-oblivion', title:'Grimes · Oblivion', eyebrow:'PHYSICAL VOICE · BLEACHERS AND FLUORESCENT HALLS',
    description:'A voice and headphones thread through a stadium, a fluorescent locker room and pools of light at the edge of a crowd.',
    names:['Grimes'], female:[.91], child:[.028], bpm:78, source:'JtH68PJIQLE',
    shots:[[0,'oblivion-lockers'],[16,'oblivion-headphones-close'],[34,'oblivion-bleachers'],[57,'oblivion-field'],[78,'oblivion-headphones-close'],[99,'oblivion-bleachers'],[126,'oblivion-aisle'],[143,'oblivion-lockers'],[167,'oblivion-aisle'],[193,'oblivion-night-ensemble'],[213,'oblivion-night-dance'],[236,'oblivion-finale']] as const,
  },
  britneytoxic: {
    id:'britney-toxic', title:'Britney Spears · Toxic', eyebrow:'PHYSICAL VOICE · A CABIN, A CITY AND A CHROME STAGE',
    description:'A candy-colored cabin cuts to a dark city, red-lit passage and a reflective performance set.',
    names:['Britney'], female:[.91], child:[.018], bpm:143, source:'LOZuxwVk7TU',
    shots:[[0,'toxic-cabin'],[14,'toxic-cabin-close'],[34,'toxic-red-dance'],[53,'toxic-chrome'],[71,'toxic-cabin'],[88,'toxic-city'],[113,'toxic-chrome-close'],[131,'toxic-city'],[150,'toxic-passage'],[168,'toxic-red-dance'],[185,'toxic-passage-close'],[202,'toxic-finale']] as const,
  },
  gorillazdare: {
    id:'gorillaz-dare', title:'Gorillaz · DARE', eyebrow:'PHYSICAL VOICES · A BEDROOM DANCE AND A GIANT VISITOR',
    description:'A little room, a stairwell and an outsized guest turn a private dance into a two-voice performance.',
    names:['Rosie','Shaun'], female:[.85,.13], child:[.012,0], bpm:120, source:'uAOR6ib95kQ',
    shots:[[0,'dare-room'],[15,'dare-stairs'],[31,'dare-room-dance'],[48,'dare-guest'],[67,'dare-close'],[86,'dare-room-dance'],[104,'dare-stairs'],[123,'dare-guest'],[143,'dare-room-dance'],[162,'dare-close'],[184,'dare-guest'],[206,'dare-room-dance'],[224,'dare-guest'],[243,'dare-room-dance'],[265,'dare-finale'],[279,'dare-close']] as const,
  },
  mgmtelectric: {
    id:'mgmt-electric-feel', title:'MGMT · Electric Feel', eyebrow:'PHYSICAL VOICE · A FOREST PARTY UNDER ELECTRIC LIGHT',
    description:'A night forest glows with stage lanterns, patterned dancers and a bright moon over the clearing.',
    names:['Andrew'], female:[.16], child:[.012], bpm:103, source:'MmZexg8sxyk',
    shots:[[0,'electric-forest'],[15,'electric-party'],[32,'electric-lantern-close'],[48,'electric-lantern-close'],[67,'electric-party'],[89,'electric-forest'],[104,'electric-moon'],[128,'electric-night-dance'],[150,'electric-night-dance'],[174,'electric-lantern-close'],[194,'electric-party'],[217,'electric-finale']] as const,
  },
  passionwalk: {
    id:'passion-pit-take-a-walk', title:'Passion Pit · Take a Walk', eyebrow:'PHYSICAL VOICE · A BOUNCING VIEW OF A TOWN',
    description:'A bouncing ball follows the neighborhood from the park and terraced streets to glass towers and their reflections.',
    names:['Michael'], female:[.54], child:[.015], bpm:101, source:'dZX6Q-Bj_xg',
    shots:[[0,'walk-playground'],[16,'walk-grass'],[34,'walk-street'],[55,'walk-portrait'],[73,'walk-towers'],[94,'walk-street'],[113,'walk-towers'],[132,'walk-park'],[156,'walk-street'],[177,'walk-portrait'],[198,'walk-towers'],[223,'walk-finale']] as const,
  },
  loveshack: {
    id:'b52-love-shack', title:"The B-52's · Love Shack", eyebrow:'PHYSICAL VOICES · THE ROAD TO A TIN-ROOF PARTY',
    description:'A roadside convertible arrives at a ramshackle house full of bright costumes, lanterns and a call-and-response dance.',
    names:['Fred','Kate and Cindy'], female:[.1,.78], child:[.005,.018], bpm:133, source:'9SOryJvTAGs',
    shots:[[0,'shack-road'],[17,'shack-fred-close'],[38,'shack-front'],[57,'shack-party'],[76,'shack-chorus-close'],[96,'shack-porch-dance'],[116,'shack-party'],[137,'shack-fred-close'],[158,'shack-chorus-close'],[179,'shack-party'],[199,'shack-porch-dance'],[220,'shack-fred-close'],[242,'shack-finale']] as const,
  },
} as const;

export type VarietyView = typeof VARIETY_INFO[VarietySetting]['shots'][number][1];
export const VARIETY_VIEWS = Object.fromEntries(VARIETY_SETTINGS.map(setting =>
  [setting,[...new Set(VARIETY_INFO[setting].shots.map(([,view])=>view))]],
)) as Record<VarietySetting,VarietyView[]>;
export const isVariety = (value:unknown):value is VarietySetting => VARIETY_SETTINGS.some(setting=>value===setting);
