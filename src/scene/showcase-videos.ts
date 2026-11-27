import { CINEMATIC_CAST, CINEMATIC_INFO, CINEMATIC_SETTINGS } from './cinematic-videos.ts';
import { POP_CAST, POP_INFO, POP_SETTINGS } from './pop-videos.ts';
import { INDIE_CAST, INDIE_INFO, INDIE_SETTINGS } from './indie-videos.ts';
import { VARIETY_CAST, VARIETY_INFO, VARIETY_SETTINGS } from './variety-videos.ts';
import { ENCORE_CAST, ENCORE_INFO, ENCORE_SETTINGS } from './encore-videos.ts';

export const SHOWCASE_SETTINGS = ['mitskinobody','letforeverbe','tilteddance','welcometoisland','lifeitself','robynfriend','idlesdancer',
  'kimbrasettle','tuneyardswater','metrolook','jainmakeba','jbreakfastsweet','chvrchesmother','altjtessellate', ...ENCORE_SETTINGS, ...VARIETY_SETTINGS, ...INDIE_SETTINGS, ...POP_SETTINGS, ...CINEMATIC_SETTINGS] as const;
export type ShowcaseSetting = typeof SHOWCASE_SETTINGS[number];

export const SHOWCASE_CAST = {
  ...ENCORE_CAST,
  ...VARIETY_CAST,
  ...INDIE_CAST,
  ...POP_CAST,
  ...CINEMATIC_CAST,
  mitskinobody:['nobody-mitski'], letforeverbe:['forever-noel'], tilteddance:['tilted-chris'],
  welcometoisland:['island-caroline'], lifeitself:['life-dave'], robynfriend:['girlfriend-robyn'],
  idlesdancer:['dancer-joe','dancer-response'],
  kimbrasettle:['settle-kimbra'], tuneyardswater:['water-merrill'], metrolook:['look-joe'],
  jainmakeba:['makeba-jain'], jbreakfastsweet:['sweet-michelle'], chvrchesmother:['mother-lauren'],
  altjtessellate:['tessellate-joe'],
} as const;

export const SHOWCASE_INFO = {
  ...ENCORE_INFO,
  ...VARIETY_INFO,
  ...INDIE_INFO,
  ...POP_INFO,
  ...CINEMATIC_INFO,
  mitskinobody: {
    id:'mitski-nobody', title:'Mitski · Nobody', eyebrow:'PHYSICAL VOICE · A HOUSE OF DISGUISES',
    description:'A divided table, yellow bedroom and double portraits reveal the theatrical set behind the singer.',
    names:['Mitski'], female:[.81], child:[.017], bpm:117, source:'qooWnw5rEcI',
    shots:[[0,'nobody-table'],[13,'nobody-bedroom'],[39,'nobody-letter-close'],[58,'nobody-mirror-close'],[81,'nobody-colored-room'],[99,'nobody-hands-ensemble'],[117,'nobody-mirror-close'],[137,'nobody-colored-room'],[158,'nobody-letter-close'],[175,'nobody-studio'],[190,'nobody-finale']] as const,
  },
  letforeverbe: {
    id:'chemical-let-forever-be', title:'The Chemical Brothers · Let Forever Be', eyebrow:'PHYSICAL VOICE · FROM A BEDROOM TO A KALEIDOSCOPE',
    description:'A bedside clock, department-store escalators and repeated dancers turn an ordinary morning into a patterned stage revue.',
    names:['Noel'], female:[.12], child:[.0], bpm:109, source:'s5FyfQDO5g0',
    shots:[[0,'forever-escalator'],[18,'forever-mirror-dance'],[41,'forever-escalator'],[63,'forever-red-revue'],[87,'forever-mirror-dance'],[107,'forever-escalator'],[129,'forever-red-revue'],[151,'forever-mirror-dance'],[177,'forever-bedroom'],[198,'forever-clock-close'],[216,'forever-finale']] as const,
  },
  tilteddance: {
    id:'christine-tilted', title:'Christine and the Queens · Tilted', eyebrow:'PHYSICAL VOICE · AN ENSEMBLE UNDER WHITE LIGHT',
    description:'A blue stage and a small ensemble trade tight hand gestures for sweeping synchronized steps.',
    names:['Chris'], female:[.52], child:[.009], bpm:95, source:'9RBzsjga73s',
    shots:[[0,'tilted-empty'],[12,'tilted-portrait'],[29,'tilted-line-dance'],[49,'tilted-pair-dance'],[67,'tilted-line-dance'],[86,'tilted-floor'],[104,'tilted-portrait'],[125,'tilted-ensemble'],[144,'tilted-floor'],[163,'tilted-line-dance'],[181,'tilted-ensemble'],[203,'tilted-portrait'],[219,'tilted-finale']] as const,
  },
  welcometoisland: {
    id:'caroline-welcome-island', title:'Caroline Polachek · Welcome To My Island', eyebrow:'PHYSICAL VOICE · CARDBOARD ROOMS AND VOLCANIC RED',
    description:'A convenience shop, cardboard box, painted coastline and a red volcanic hollow give way to a subterranean platform.',
    names:['Caroline'], female:[.91], child:[.026], bpm:117, source:'hxgcz_6GKX0',
    shots:[[0,'island-open-close'],[19,'island-shop'],[46,'island-painted'],[66,'island-box'],[94,'island-passage'],[119,'island-lava-close'],[142,'island-lava'],[160,'island-star-close'],[182,'island-coast'],[207,'island-passage'],[230,'island-finale']] as const,
  },
  lifeitself: {
    id:'glass-life-itself', title:'Glass Animals · Life Itself', eyebrow:'PHYSICAL VOICE · A DESERT MOTEL AND ROADSIDE LIGHTS',
    description:'A red car, drawn motel curtains and open desert roads frame a restless roadside story.',
    names:['Dave'], female:[.17], child:[.009], bpm:92, source:'yd9p4n5hLEg',
    shots:[[0,'life-neon'],[19,'life-road'],[46,'life-close'],[69,'life-room'],[96,'life-room'],[119,'life-diner'],[146,'life-close'],[179,'life-room'],[208,'life-motel'],[242,'life-road'],[266,'life-finale']] as const,
  },
  robynfriend: {
    id:'robyn-call-girlfriend', title:'Robyn · Call Your Girlfriend', eyebrow:'PHYSICAL VOICE · ONE DANCER UNDER A GRID OF LIGHT',
    description:'A solo dancer crosses an empty warehouse as its industrial lights shift from cool white to violet and red.',
    names:['Robyn'], female:[.86], child:[.021], bpm:125, source:'F6ImxY6hnfA',
    shots:[[0,'girlfriend-door'],[16,'girlfriend-wall-dance'],[39,'girlfriend-close'],[60,'girlfriend-wall-dance'],[82,'girlfriend-low-dance'],[104,'girlfriend-close'],[119,'girlfriend-violet-dance'],[145,'girlfriend-low-dance'],[162,'girlfriend-violet-dance'],[177,'girlfriend-red-close'],[194,'girlfriend-wall-dance'],[208,'girlfriend-finale']] as const,
  },
  idlesdancer: {
    id:'idles-dancer', title:'IDLES · Dancer', eyebrow:'PHYSICAL VOICES · A CONCRETE ROOM IN MOTION',
    description:'A laundromat and its concrete storefront give way to a red-lit band and a doubled vocal close-up.',
    names:['Joe','Response'], female:[.10,.45], child:[0,.012], bpm:110, source:'A3ZZj5y6Qt4',
    shots:[[0,'idles-door'],[14,'idles-laundry-close'],[33,'idles-laundry-dance'],[56,'idles-shutters'],[79,'idles-laundry-dance'],[97,'idles-red-dance'],[118,'idles-stage-close'],[141,'idles-red-dance'],[159,'idles-violet-dance'],[178,'idles-joe-close'],[192,'idles-finale']] as const,
  },
  kimbrasettle: {
    id:'kimbra-settle-down', title:'Kimbra · Settle Down', eyebrow:'PHYSICAL VOICE · A DOLLHOUSE DINNER',
    description:'A staged dinner, a garden picnic, red curtains and ranks of dolls frame a bright domestic fantasy.',
    names:['Kimbra'], female:[.87], child:[.015], bpm:88, source:'yHV04eSGzAA',
    shots:[[0,'settle-solo-close'],[19,'settle-dinner'],[40,'settle-school-dance'],[64,'settle-garden'],[89,'settle-dinner'],[110,'settle-garden'],[132,'settle-dollroom'],[153,'settle-portrait'],[173,'settle-school-dance'],[194,'settle-firelight'],[215,'settle-school-dance'],[237,'settle-finale']] as const,
  },
  tuneyardswater: {
    id:'tuneyards-water-fountain', title:'Tune-Yards · Water Fountain', eyebrow:'PHYSICAL VOICE · PUPPETS AND A COLOR TV STUDIO',
    description:'A handmade television set bursts into color, with puppet shapes, studio stripes and a playful ensemble.',
    names:['Merrill'], female:[.73], child:[.012], bpm:96, source:'jbiFcPhccu8',
    shots:[[0,'water-stripes-dance'],[14,'water-puppet-close'],[33,'water-studio'],[50,'water-color-dance'],[71,'water-puppet-close'],[94,'water-tv'],[117,'water-stripes-dance'],[139,'water-studio'],[158,'water-color-dance'],[176,'water-tv'],[191,'water-finale']] as const,
  },
  metrolook: {
    id:'metronomy-the-look', title:'Metronomy · The Look', eyebrow:'PHYSICAL VOICE · SEAGULLS AND AN EMPTY STUDIO',
    description:'A spare white studio alternates between the band’s instruments and a small seaside world of paper seagulls.',
    names:['Joe'], female:[.11], child:[.005], bpm:83, source:'sFrNsSnk8GM',
    shots:[[0,'look-white-stage'],[16,'look-birds'],[40,'look-cart-birds'],[65,'look-band-ensemble'],[91,'look-birds'],[115,'look-white-stage'],[132,'look-organ-close'],[153,'look-cart-birds'],[182,'look-band-ensemble'],[198,'look-organ-close'],[215,'look-birds'],[229,'look-finale']] as const,
  },
  jainmakeba: {
    id:'jain-makeba', title:'Jain · Makeba', eyebrow:'PHYSICAL VOICE · GRAPHIC PATTERNS IN JOHANNESBURG',
    description:'Painted geometry and patterned street corners give way to an avenue of trees and a zebra-striped finale.',
    names:['Jain'], female:[.79], child:[.009], bpm:116, source:'59Q_lhgGANc',
    shots:[[0,'makeba-street'],[14,'makeba-pattern-dance'],[30,'makeba-skyline'],[47,'makeba-court-dance'],[64,'makeba-portrait'],[79,'makeba-grove'],[107,'makeba-grove-dance'],[133,'makeba-mono'],[154,'makeba-pattern-dance'],[175,'makeba-street'],[202,'makeba-zebra'],[216,'makeba-finale']] as const,
  },
  jbreakfastsweet: {
    id:'japanese-breakfast-be-sweet', title:'Japanese Breakfast · Be Sweet', eyebrow:'PHYSICAL VOICE · A LATE-NIGHT UFO CASE',
    description:'Two investigators follow a cryptic signal through a green-lit car, a late-night interview and a wooded clearing.',
    names:['Michelle'], female:[.86], child:[.017], bpm:112, source:'2ZfcZEIo6Bw',
    shots:[[0,'sweet-monitor-close'],[17,'sweet-car'],[36,'sweet-office'],[57,'sweet-car'],[72,'sweet-portrait'],[92,'sweet-office'],[117,'sweet-car'],[135,'sweet-night'],[156,'sweet-woods'],[177,'sweet-ufo'],[194,'sweet-finale']] as const,
  },
  chvrchesmother: {
    id:'chvrches-mother-we-share', title:'CHVRCHES · The Mother We Share', eyebrow:'PHYSICAL VOICE · CITY LIGHTS AND A FIGURE IN BLUE',
    description:'A quiet bedroom and a silhouetted band open into a portrait surrounded by suspended points of light.',
    names:['Lauren'], female:[.88], child:[.026], bpm:87, source:'_mTRvJ9fugM',
    shots:[[0,'mother-bedroom'],[17,'mother-portrait'],[32,'mother-bedroom'],[50,'mother-amber-ensemble'],[69,'mother-blue-close'],[86,'mother-amber-ensemble'],[103,'mother-portrait'],[122,'mother-light-close'],[139,'mother-pixels'],[157,'mother-light-close'],[175,'mother-finale'],[188,'mother-pixels']] as const,
  },
  altjtessellate: {
    id:'altj-tessellate', title:'alt-J · Tessellate', eyebrow:'PHYSICAL VOICE · A RENAISSANCE HALL RECAST',
    description:'A painted vaulted hall fills with performers who gather and break into groups around steps, pillars and a long table.',
    names:['Joe'], female:[.17], child:[.006], bpm:90, source:'Qg6BwvDcANg',
    shots:[[0,'tessellate-hall'],[15,'tessellate-crowd-ensemble'],[34,'tessellate-portrait'],[50,'tessellate-steps'],[66,'tessellate-table'],[88,'tessellate-crowd-ensemble'],[108,'tessellate-pillars'],[129,'tessellate-portrait'],[145,'tessellate-steps'],[163,'tessellate-crowd-ensemble'],[179,'tessellate-finale']] as const,
  },
} as const;

export type ShowcaseView = typeof SHOWCASE_INFO[ShowcaseSetting]['shots'][number][1];
export const SHOWCASE_VIEWS = Object.fromEntries(SHOWCASE_SETTINGS.map(setting => {
  const shots: readonly (readonly [number, ShowcaseView])[] = SHOWCASE_INFO[setting].shots;
  return [setting, [...new Set(shots.map(([, view]) => view))]];
})) as Record<ShowcaseSetting, ShowcaseView[]>;
export const isShowcase = (setting:unknown):setting is ShowcaseSetting => SHOWCASE_SETTINGS.some(value=>value===setting);
