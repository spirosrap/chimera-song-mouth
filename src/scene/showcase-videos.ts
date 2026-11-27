export const SHOWCASE_SETTINGS = ['mitskinobody','letforeverbe','tilteddance','welcometoisland','lifeitself','robynfriend','idlesdancer'] as const;
export type ShowcaseSetting = typeof SHOWCASE_SETTINGS[number];

export const SHOWCASE_CAST = {
  mitskinobody:['nobody-mitski'], letforeverbe:['forever-noel'], tilteddance:['tilted-chris'],
  welcometoisland:['island-caroline'], lifeitself:['life-dave'], robynfriend:['girlfriend-robyn'],
  idlesdancer:['dancer-joe','dancer-response'],
} as const;

export const SHOWCASE_INFO = {
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
} as const;

export type ShowcaseView = typeof SHOWCASE_INFO[ShowcaseSetting]['shots'][number][1];
export const SHOWCASE_VIEWS = Object.fromEntries(SHOWCASE_SETTINGS.map(setting =>
  [setting,[...new Set(SHOWCASE_INFO[setting].shots.map(([,view])=>view))]],
)) as Record<ShowcaseSetting,ShowcaseView[]>;
export const isShowcase = (setting:unknown):setting is ShowcaseSetting => SHOWCASE_SETTINGS.some(value=>value===setting);
