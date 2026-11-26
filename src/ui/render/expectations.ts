import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { EXPECTATIONS_CAST, EXPECTATIONS_SHOTS, type ExpectationsId, type ExpectationsView } from '../../scene/expectations.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type SetName = 'channel' | 'audience' | 'main' | 'split' | 'letters' | 'prize' | 'phone'
  | 'blue' | 'survey' | 'question' | 'pink' | 'gold' | 'money' | 'finale';
type Clothes = { top: string; lower: string; accessory?: 'shades' | 'beret' | 'phone' | 'feathers' | 'card'; wig?: boolean };
type Blocking = { id: ExpectationsId; at: Point; scale?: number };
type Shot = { set: SetName; at: Point; camera: Point; cast?: readonly Blocking[] };
type SignLine = { text: string; color: string; size?: number; italic?: boolean };
type Attire = {
  shades: THREE.Group;
  beret: THREE.Group;
  phone: THREE.Group;
  feathers: THREE.Group;
  card: THREE.Group;
  wig: THREE.Group;
};

const BLUE = '#2564b4';
const NAVY = '#16264b';
const PALE = '#f7e5c6';
const GOLD = '#ffc968';
const RED = '#d63367';
const MINT = '#49ad8d';
const PINK = '#e66b9d';
const INK = '#171b39';
const OLIVIA = 'expect-olivia';
const CHAPPELL = 'expect-chappell';
const HOST = 'expect-johnny';
const ANNOUNCER = 'expect-announcer';
const centerHost: Blocking = { id: HOST, at: [0, 165, 43], scale: 1.12 };
const centerOlivia: Blocking = { id: OLIVIA, at: [0, 157, 47], scale: 1.20 };
const pair: readonly Blocking[] = [
  { id: OLIVIA, at: [-72, 157, 46] },
  { id: CHAPPELL, at: [72, 157, 46] },
];
const interview: readonly Blocking[] = [pair[0], { id: HOST, at: [72, 163, 46] }];
const SHOTS: Record<ExpectationsView, Shot> = {
  'expect-channel': { set: 'channel', at: [0, 127, 0], camera: [0, 135, 452] },
  'expect-audience': { set: 'audience', at: [0, 126, -15], camera: [17, 178, 471] },
  'expect-title': { set: 'main', at: [0, 148, -71], camera: [7, 164, 535] },
  'expect-introductions': { set: 'main', at: [0, 138, 20], camera: [0, 166, 476], cast: [centerOlivia] },
  'expect-host': { set: 'main', at: [0, 168, 35], camera: [14, 171, 271], cast: [centerHost] },
  'expect-contestants': { set: 'main', at: [0, 133, 22], camera: [13, 160, 465], cast: [centerOlivia] },
  'expect-split': { set: 'split', at: [0, 144, 28], camera: [0, 156, 422], cast: pair },
  'expect-letterboard': { set: 'letters', at: [0, 146, -62], camera: [0, 153, 473] },
  'expect-prize': { set: 'prize', at: [0, 126, 7], camera: [20, 174, 505] },
  'expect-phone': { set: 'phone', at: [0, 152, 33], camera: [6, 154, 304], cast: [centerOlivia] },
  'expect-blue-grid': { set: 'blue', at: [0, 138, 0], camera: [4, 160, 475], cast: [centerOlivia] },
  'expect-squabble': { set: 'survey', at: [0, 142, -25], camera: [22, 155, 510], cast: [centerHost] },
  'expect-survey': { set: 'survey', at: [0, 154, 21], camera: [1, 170, 457],
    cast: [{ id: OLIVIA, at: [-101, 151, 52] }, centerHost, { id: CHAPPELL, at: [101, 151, 52] }] },
  'expect-buzzer': { set: 'survey', at: [87, 160, 50], camera: [96, 172, 307],
    cast: [{ id: CHAPPELL, at: [101, 151, 52] }, centerHost] },
  'expect-question': { set: 'question', at: [0, 139, 27], camera: [3, 163, 478], cast: pair },
  'expect-pink-grid': { set: 'pink', at: [0, 142, 20], camera: [1, 159, 451], cast: pair },
  'expect-gold-titles': { set: 'gold', at: [0, 144, 14], camera: [2, 164, 466], cast: pair },
  'expect-prize-money': { set: 'money', at: [0, 140, 14], camera: [9, 155, 462], cast: [centerHost, ...pair] },
  'expect-finale': { set: 'finale', at: [0, 143, 28], camera: [0, 173, 518], cast: pair },
  'expect-goodnight': { set: 'finale', at: [0, 132, 25], camera: [16, 184, 491], cast: [centerHost] },
};
const MANUAL: Record<ExpectationsId, ExpectationsView> = {
  [OLIVIA]: 'expect-phone', [CHAPPELL]: 'expect-buzzer', [HOST]: 'expect-host', [ANNOUNCER]: 'expect-channel',
};
const SUNGLASSES: Clothes = { top: '#f1c4cc', lower: '#bd6892', accessory: 'shades' };
const CHECKERED: Clothes = { top: '#b3a145', lower: '#322743' };
const BLACK_DRESS: Clothes = { top: '#262336', lower: '#302a40' };
const PHONE: Clothes = { top: PINK, lower: BLUE, accessory: 'phone' };
const MINT_DRESS: Clothes = { top: MINT, lower: '#236e68' };
const LEOPARD: Clothes = { top: '#a16745', lower: '#5c323c', accessory: 'feathers', wig: true };
const BLAZER: Clothes = { top: '#939daa', lower: '#596784', accessory: 'card' };
const PLUM: Clothes = { top: '#5e3469', lower: NAVY };
const COLOR_CHIPS = [PALE, GOLD, '#ea9ec9', '#679ce4', '#3bd6b7', '#d83f66'];
const STILL_ARMS: [Point, Point, Point, Point] = [[-29, -29, 6], [-29, -52, 14], [30, -28, 9], [33, -47, 18]];

function random(seed: number) {
  const v = Math.sin(91.13 + seed * 671.3) * 43758.5453;
  return v - Math.floor(v);
}

export class ExpectationsStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(39, 1, 1, 2400);
  readonly props = new VideoProps();
  readonly sets = new Map<SetName, THREE.Group>();
  readonly figures: Record<ExpectationsId, VideoFigure>;
  private readonly wardrobe = new Map<VideoFigure, Attire>();
  private readonly textures: THREE.Texture[] = [];
  private readonly titleLights: THREE.Mesh[] = [];
  private readonly turnLetters: THREE.Group[] = [];
  private readonly buzzerLights: THREE.Mesh[] = [];
  private readonly surveyRows: THREE.Group[] = [];
  private readonly prizes: THREE.Group[] = [];
  private readonly tiles: THREE.Group[] = [];
  private readonly confetti: THREE.Mesh[] = [];
  private readonly insert = new THREE.Group();
  private readonly car = new THREE.Group();
  private readonly contestantPodiums = new THREE.Group();
  private readonly hostCaption = new THREE.Group();
  private readonly splitHostName = new THREE.Group();
  private readonly splitChappellName = new THREE.Group();
  private readonly openingCards: THREE.Group[] = [];
  private epoch = -1;
  private previous = -1;

  constructor(olivia: Actor, chappell: Actor, johnny: Actor, announcer: Actor) {
    this.scene.background = new THREE.Color('#161c31');
    const fill = new THREE.HemisphereLight('#fff0d5', '#384060', 1.75);
    const key = new THREE.DirectionalLight('#ffe1bf', 1.8);
    key.position.set(-105, 197, 131);
    const rim = new THREE.DirectionalLight('#779af2', .96);
    rim.position.set(170, 129, -143);
    this.scene.add(fill, key, rim, this.insert);
    for (const { set } of Object.values(SHOTS)) {
      if (this.sets.has(set)) continue;
      const group = new THREE.Group();
      group.name = set;
      this.scene.add(group);
      this.sets.set(set, group);
    }
    this.figures = {
      [OLIVIA]: this.figure(olivia, OLIVIA, '#b56d71', '#251626'),
      [CHAPPELL]: this.figure(chappell, CHAPPELL, '#d28d81', '#752738'),
      [HOST]: this.figure(johnny, HOST, '#c39b7d', '#b4bac6'),
      [ANNOUNCER]: this.figure(announcer, ANNOUNCER, '#b58179', '#37274b'),
    };
    this.rounded(this.insert, [0, -10, -21], 87, 100, 12, '#17183b');
    this.rounded(this.insert, [0, 43, -19], 84, 2.4, 1, GOLD);
    this.rounded(this.insert, [0, -61, -19], 84, 2.4, 1, PINK);
    this.buildOpening();
    this.buildMain();
    this.buildSplit();
    this.buildLetterboard();
    this.buildPrize();
    this.buildPhoneSets();
    this.buildSurvey();
    this.buildQuestion();
    this.buildGoldAndMoney();
    this.buildFinale();
  }

  private set(name: SetName) { return this.sets.get(name)!; }

  private sign(group: THREE.Object3D, at: Point, size: [number, number], lines: readonly SignLine[]) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 864;
    canvas.height = Math.round(Math.max(184, 864 * size[1] / size[0]));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) => {
      ctx.fillStyle = line.color;
      ctx.font = `${line.italic ? 'italic ' : ''}900 ${line.size ?? Math.round(canvas.height / (lines.length + .3))}px Georgia, serif`;
      ctx.fillText(line.text, canvas.width * .5, canvas.height * (i + .5) / lines.length, canvas.width * .97);
    });
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(map);
    const mesh = this.props.mesh(group, new THREE.PlaneGeometry(...size), at, '#ffffff');
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.map = map;
    material.transparent = true;
    material.depthWrite = false;
  }

  private rounded(group: THREE.Object3D, at: Point, w: number, h: number, corner: number, color: string) {
    const s = new THREE.Shape();
    const l = -w / 2, r = w / 2, b = -h / 2, t = h / 2;
    s.moveTo(l + corner, b);
    s.lineTo(r - corner, b);
    s.quadraticCurveTo(r, b, r, b + corner);
    s.lineTo(r, t - corner);
    s.quadraticCurveTo(r, t, r - corner, t);
    s.lineTo(l + corner, t);
    s.quadraticCurveTo(l, t, l, t - corner);
    s.lineTo(l, b + corner);
    s.quadraticCurveTo(l, b, l + corner, b);
    return this.props.mesh(group, new THREE.ShapeGeometry(s, 10), at, color);
  }

  private room(g: THREE.Group, wall: string, floor: string) {
    this.props.box(g, 1100, 595, 7, wall, [0, 223, -185]);
    this.props.box(g, 1080, 7, 600, floor, [0, -6, 23]);
  }

  private television(g: THREE.Object3D, at: Point, w: number, h: number, face: string, surround = BLUE) {
    const tv = new THREE.Group();
    g.add(tv);
    tv.position.set(...at);
    this.rounded(tv, [0, 0, 0], w + 19, h + 19, 22, surround);
    this.rounded(tv, [0, 0, 1.6], w + 5, h + 5, 18, PALE);
    this.rounded(tv, [0, 0, 3], w, h, 17, face);
    return tv;
  }

  private bulb(g: THREE.Object3D, at: Point, radius = 2.4, hue = GOLD) {
    return this.props.oval(g, at, [radius, radius, radius * .58], hue);
  }

  private bulbBorder(g: THREE.Object3D, at: Point, w: number, h: number) {
    const [x, y, z] = at;
    for (const s of [-1, 1]) {
      for (let i = 0; i <= 24; i++) this.titleLights.push(this.bulb(g, [x - w / 2 + i * w / 24, y + s * h / 2, z]));
      for (let i = 1; i < 13; i++) this.titleLights.push(this.bulb(g, [x + s * w / 2, y - h / 2 + i * h / 13, z]));
    }
  }

  private marquee(g: THREE.Group, label = 'EXPECTATIONS') {
    this.rounded(g, [0, 155, -147], 414, 236, 45, BLUE);
    this.rounded(g, [0, 153, -142], 384, 220, 40, '#c74368');
    this.rounded(g, [0, 153, -137], 357, 198, 34, '#ffe4b2');
    this.bulbBorder(g, [0, 153, -133], 363, 195);
    this.sign(g, [0, 184, -131], [315, 89], [
      { text: 'The Big', color: '#bc345f', italic: true },
      { text: label, color: '#2254a0' },
      { text: 'Show', color: '#bb3466', italic: true },
    ]);
  }

  private podium(g: THREE.Group, x: number, z: number, accent: string, title?: string) {
    const p = this.props;
    p.box(g, 87, 67, 35, BLUE, [x, 33, z]);
    const trapezoid = p.box(g, 68, 49, 2, accent, [x, 34, z + 18.5]);
    trapezoid.rotation.z = -.085;
    p.box(g, 92, 5.5, 40, PALE, [x, 68, z]);
    p.tube(g, [x - 23, 71, z + 8], [x - 11, 91, z + 10], 1.1, '#2f3151');
    p.oval(g, [x - 11, 91, z + 10], [2.7, 2.3, 2.1], '#202849');
    if (title) this.sign(g, [x, 37, z + 20.3], [61, 17], [{ text: title, color: INK }]);
  }

  private proxy(g: THREE.Object3D, at: Point, shirt: string, hair: string, scale = 1, skin = '#bd8183') {
    const p = this.props;
    const root = new THREE.Group();
    g.add(root);
    root.position.set(...at);
    root.scale.setScalar(scale);
    p.oval(root, [0, -39, 0], [22, 36, 13], shirt);
    p.oval(root, [0, 2, -2], [17, 23, 12], hair);
    p.oval(root, [0, 0, 5], [13, 18, 10], skin);
    p.oval(root, [0, -6, 14], [6, 2, 1.3], '#613152');
    for (const s of [-1, 1]) {
      p.oval(root, [s * 5, 4, 14], [2.8, 2.1, 1.2], '#31243f');
      p.oval(root, [s * 15, -7, -3], [6, 17, 7], hair);
      p.tube(root, [s * 18, -18, 1], [s * 29, -46, 10], 4.1, shirt);
      p.oval(root, [s * 29, -46, 12], [4, 6, 3.6], skin);
    }
    return root;
  }

  private figure(actor: Actor, id: ExpectationsId, skin: string, hair: string) {
    const p = this.props;
    const firstMesh = p.meshes.length;
    const f = new VideoFigure(actor.model, actor.track, p, this.scene, '#253766', skin);
    f.root.name = id;
    f.head.scene.scale.setScalar(2.13);
    const options: Attire = { shades: new THREE.Group(), beret: new THREE.Group(), phone: new THREE.Group(),
      feathers: new THREE.Group(), card: new THREE.Group(), wig: new THREE.Group() };
    f.root.add(...Object.values(options));
    this.wardrobe.set(f, options);
    const female = id === OLIVIA || id === CHAPPELL;
    if (id === HOST) {
      p.oval(f.root, [0, 22, -14], [16.5, 10.8, 12.3], '#9ca4b3');
      for (const [i, x] of [-11, -5, 1, 7, 12].entries()) {
        const sweep = p.oval(f.root, [x, 28 + i * .55, -5 - i * 1.55], [5.3, 4.9, 11.3],
          i % 2 ? '#c8c7cf' : '#b6bacc');
        sweep.rotation.x = -.29;
        sweep.rotation.z = -.21;
      }
    } else {
      for (let i = 0; i < 21; i++) {
        const phase = i * 2 * Math.PI / 21;
        const r = (female ? 5.1 : 3.6) + random(i + 40) * 4.4;
        p.oval(f.root, [20 * Math.cos(phase), 18 + 13 * Math.sin(phase), -13],
          [r * 1.15, r * (female ? 1.55 : .8), r], i % 3 ? hair : new THREE.Color(hair).multiplyScalar(1.52).getStyle());
      }
    }
    if (female) {
      for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
        const ox = s * (19 + i % 3 * 2);
        p.oval(f.root, [ox, 13 - i * 5.4, -12], [8, 9, 8.5], hair);
        p.oval(options.wig, [ox * 1.24, 8 - i * 6.2, -8], [9.4, 12, 9], i % 2 ? '#941e39' : '#692040');
      }
      for (const s of [-1, 1]) {
        const earring = p.mesh(f.root, new THREE.TorusGeometry(4, .63, 8, 25), [s * 18, -9, 4], GOLD);
        earring.rotation.y = s * .45;
        const frame = p.mesh(options.shades, new THREE.TorusGeometry(6, .7, 8, 26), [s * 7, 11, 15], '#fac0d7');
        frame.scale.set(1.05, .60, 1);
        p.oval(options.shades, [s * 7, 11, 14.6], [5.7, 3.4, 1.1], '#412949');
      }
      p.box(options.shades, 4, 1, .9, '#fac0d7', [0, 10.8, 15]);
      const beret = p.oval(options.beret, [0, 26, -5], [21, 5.4, 15], '#ef8cae');
      beret.rotation.z = -.19;
      p.oval(options.beret, [0, 30, -5], [2, 2, 2], '#fca3bf');
      for (let i = 0; i < 20; i++) {
        const phase = i * .74;
        const feather = p.oval(options.feathers, [17 * Math.cos(phase), -15 - 11 * Math.sin(phase), 9 + (i % 2) * 4],
          [4.5, 10, 2.6], i % 3 ? '#bc2a5b' : '#e55b89');
        feather.rotation.z = phase;
      }
      p.box(options.phone, 10, 26, 6, '#f1e5cf', [0, 0, 0]);
      p.box(options.phone, 6, 7, 1, '#638fa8', [0, 6, 3.5]);
      p.tube(options.phone, [3, 9, 0], [5, 23, 0], .70, '#e5d9bd');
      for (let i = 0; i < 4; i++) p.box(options.phone, 6, .9, .6, '#a49a91', [0, -2 - i * 1.6, 3.2]);
    } else {
      if (id === ANNOUNCER) p.oval(f.root, [0, 24, -9], [16, 6.5, 12], hair);
      p.box(f.root, 12, 38, 1.4, PALE, [0, -34, 12.3]);
      p.box(f.root, 4.9, 29, 2.6, GOLD, [0, -32, 13.4]);
      for (let i = 0; i < 4; i++) p.oval(f.root, [0, -23 - i * 6, 14.9], [.9, .9, .35], '#5776a8');
      p.box(options.card, 26, 15, 1.5, PALE, [0, 0, 0]);
      this.sign(options.card, [0, 0, .95], [24, 9], [{ text: 'EXPECTATIONS', color: BLUE }]);
    }
    for (const mesh of p.meshes.slice(firstMesh)) {
      const old = mesh.material;
      if (!(old instanceof THREE.MeshBasicMaterial) || old.transparent) continue;
      mesh.material = new THREE.MeshStandardMaterial({ color: old.color, roughness: .75, side: old.side,
        emissive: old.color, emissiveIntensity: id === HOST ? .20 : .11 });
      old.dispose();
    }
    return f;
  }

  private buildOpening() {
    const p = this.props;
    const channel = this.set('channel');
    this.room(channel, '#331f46', '#252748');
    const tv = this.television(channel, [0, 130, -50], 310, 207, '#333a69', GOLD);
    this.sign(tv, [0, 45, 5], [246, 46], [{ text: 'CHANNEL OR', color: PALE }]);
    this.sign(tv, [0, -56, 5], [250, 47], [
      { text: 'UP NEXT', color: GOLD, italic: true }, { text: 'THE BIG EXPECTATIONS SHOW', color: PALE },
    ]);
    for (let i = 0; i < 14; i++) p.box(tv, 304, .68, .4, '#4a4b79', [0, i * 13 - 87, 4]);
    const audience = this.set('audience');
    this.room(audience, '#291d3d', '#291f39');
    for (let row = 0; row < 4; row++) for (let n = 0; n < 9; n++) {
      const x = (n - 4) * 44 + (row % 2) * 15;
      const z = 123 - row * 55;
      const y = 22 + row * 22;
      p.box(audience, 35, 39, 20, n % 3 ? '#98325b' : '#ad3b65', [x, y + 14, z]);
      if (n % 2 === row % 2) this.proxy(audience, [x, y + 42, z + 2], '#665477', '#51415a', .47, '#bd9ab0');
    }
    this.rounded(audience, [0, 219, -38], 196, 43, 7, PALE);
    this.sign(audience, [0, 219, -37], [182, 29], [{ text: 'APPLAUSE!', color: '#ab3255' }]);
  }

  private buildMain() {
    const p = this.props;
    const g = this.set('main');
    this.room(g, '#24315d', '#556e9d');
    this.marquee(g);
    g.add(this.hostCaption);
    this.rounded(this.hostCaption, [66, 138, 66], 67, 10, 2.5, '#283a74');
    this.sign(this.hostCaption, [66, 138, 67], [61, 7], [{ text: 'JOHNNY JOHNSON', color: PALE }]);
    p.oval(g, [0, -3, 4], [221, 9, 142], '#d0d9eb');
    for (let i = 0; i < 43; i++) {
      const phase = i * Math.PI * 2 / 43;
      this.bulb(g, [212 * Math.cos(phase), 5, 139 * Math.sin(phase) + 4], 2.0);
    }
    g.add(this.contestantPodiums);
    for (const [i, x] of [-108, 0, 108].entries()) {
      this.podium(this.contestantPodiums, x, 83, ['#dbad62', '#daa775', '#ecb6bc'][i], 'OLIVIA R.');
      if (i !== 1) this.proxy(this.contestantPodiums, [x, 148, 29], i === 0 ? '#2d284d' : '#bcad66', '#33223e', 1.03);
    }
    for (const x of [-241, 241]) {
      const curve = this.television(g, [x, 128, -100], 71, 170, '#33558c');
      curve.rotation.y = x > 0 ? -.19 : .19;
    }
    for (const label of ['OLIVIA R.   ·   1', 'OLIVIA R.   ·   2', 'OLIVIA R.   ·   3']) {
      const card = new THREE.Group();
      g.add(card);
      this.rounded(card, [0, 104, 93], 101, 25, 7, '#1d3f83');
      this.sign(card, [0, 104, 94], [91, 14], [{ text: label, color: '#ffd4a5' }]);
      this.openingCards.push(card);
    }
  }

  private buildSplit() {
    const g = this.set('split');
    this.room(g, '#122f67', '#233668');
    for (const [i, x] of [-91, 91].entries()) {
      const tv = this.television(g, [x, 145, -64], 167, 196, i ? '#393b70' : '#ab5c76', i ? '#6aa9e3' : '#4489d1');
      if (i === 0) {
        this.sign(tv, [0, -80, 5], [142, 17], [{ text: 'OLIVIA R.', color: PALE }]);
      } else {
        tv.add(this.splitHostName, this.splitChappellName);
        this.sign(this.splitHostName, [0, -80, 5], [142, 17], [{ text: 'JOHNNY JOHNSON', color: PALE }]);
        this.sign(this.splitChappellName, [0, -80, 5], [142, 17], [{ text: 'CHAPPELL R.', color: PALE }]);
      }
    }
  }

  private buildLetterboard() {
    const p = this.props;
    const g = this.set('letters');
    this.room(g, '#163653', '#225c64');
    const tv = this.television(g, [0, 143, -93], 343, 207, '#157f6b', '#b8cc4c');
    this.sign(tv, [0, 77, 6], [298, 32], [{ text: 'THE FINAL SPIN', color: '#f4e5be' }]);
    const lines = ['A BAR IN', 'SILVER LAKE'];
    for (const [row, line] of lines.entries()) for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const x = (i - (line.length - 1) * .5) * 25.5;
      const y = 22 - row * 42;
      p.box(tv, 23, 32, 2.8, '#284c70', [x, y, 6]);
      if (char === ' ') continue;
      const tile = new THREE.Group();
      tv.add(tile);
      tile.position.set(x, y, 8);
      p.box(tile, 22.6, 31.5, 1.5, '#ebdcba', [0, 0, 0]);
      this.sign(tile, [0, 0, 1], [20, 25], [{ text: char, color: INK }]);
      this.turnLetters.push(tile);
    }
  }

  private buildPrize() {
    const p = this.props;
    const g = this.set('prize');
    this.room(g, '#203d48', '#514064');
    for (let i = 0; i < 64; i++) {
      const x = (i - 31.5) * 7.8;
      const h = 92 + random(i) * 121;
      p.box(g, 1.1 + i % 3, h, 1.1, i % 3 ? '#a8834e' : GOLD, [x, 178 - h / 3, -119]);
    }
    this.sign(g, [0, 235, -112], [293, 52], [{ text: 'GRAND PRIZE!', color: GOLD, italic: true }]);
    this.car.position.set(-19, 23, 36);
    g.add(this.car);
    p.oval(this.car, [0, -3, -8], [107, 23, 44], '#f6ba4f');
    p.box(this.car, 180, 17, 69, '#f4c957', [1, 3, -4]);
    p.box(this.car, 68, 2, 50, INK, [10, 13, -5]);
    p.oval(this.car, [69, 7, 19], [23, 6, 21], '#ffe793');
    p.oval(this.car, [-77, 7, 18], [23, 6, 17], '#ffd566');
    p.box(this.car, 65, 4, 16, '#ddefe5', [5, 34, -12]).rotation.z = -.22;
    for (const x of [-65, 67]) {
      p.mesh(this.car, new THREE.CylinderGeometry(19, 19, 56, 24), [x, -8, 0], '#242340').rotation.x = Math.PI / 2;
      p.mesh(this.car, new THREE.CylinderGeometry(10, 10, 1, 18), [x, -8, 30], '#a3adc6').rotation.x = Math.PI / 2;
    }
    this.proxy(this.car, [-11, 44, -8], '#e06a7d', '#8b324f', .70);
    this.proxy(this.car, [32, 49, -12], '#719476', '#362544', .69);
    for (const [index, value] of ['208','268','288'].entries()) {
      const tile = new THREE.Group();
      g.add(tile);
      this.rounded(tile, [137, 174, 1], 82, 48, 8, '#1f5758');
      this.sign(tile, [137, 174, 2], [75, 29], [{ text: value, color: GOLD }]);
      tile.rotation.y = index * -.012;
      this.prizes.push(tile);
    }
  }

  private buildPhoneSets() {
    const p = this.props;
    const phone = this.set('phone');
    this.room(phone, '#65b9db', '#3e94bd');
    this.rounded(phone, [0, 164, -95], 303, 237, 26, '#79c9dd');
    p.box(phone, 68, 83, 31, '#161c4a', [112, 37, -34]);
    for (let q = 0; q < 2; q++) {
      const name = q ? 'pink' : 'blue';
      const g = this.set(name);
      this.room(g, q ? '#a83d83' : '#3c80b4', q ? '#78336f' : '#315c99');
      for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
        const x = (col - 1) * 116;
        const y = 67 + row * 71;
        const tile = this.television(g, [x, y, -99], 104, 54, q ? '#cc568e' : '#69bbd6', '#263b67');
        const figure = this.proxy(tile, [0, 4, 14], q ? '#a13b70' : '#e073a1', q ? '#7b2645' : '#322c55', .37);
        p.box(tile, 27, 13, 4, '#253256', [0, -20, 15]);
        this.tiles.push(figure);
      }
      for (const side of [-1, 1]) {
        for (let i = 0; i < 12; i++) p.box(g, 17, 2, 13, PALE, [side * (191 + 13 * Math.cos(i / 10 * 3)), 10 + 13 * i, -98 + 11 * Math.sin(i / 10 * 3)]);
      }
    }
  }

  private buildSurvey() {
    const p = this.props;
    const g = this.set('survey');
    this.room(g, '#1d2861', '#374480');
    for (let i = 0; i < 30; i++) p.box(g, 3.4, 226, 3, i % 2 ? '#353670' : '#2e3269', [(i - 14.5) * 15, 132, -132]);
    const tv = this.television(g, [0, 185, -113], 289, 161, '#3c93cf', '#acc5e1');
    this.sign(tv, [0, 61, 5], [261, 22], [{ text: 'SISTER SQUABBLE', color: PALE }]);
    for (const [i, text] of ['CONCERT', 'DINNER', 'A BAR', 'THE MOVIES'].entries()) {
      const y = 31 - i * 26;
      p.box(tv, 245, 20, 1, '#2965a1', [0, y, 5]);
      this.sign(tv, [-102, y, 6], [26, 17], [{ text: String(i + 1), color: PALE }]);
      const row = new THREE.Group();
      tv.add(row);
      this.sign(row, [7, y, 6], [175, 16], [{ text, color: PALE }]);
      this.surveyRows.push(row);
    }
    for (const [i, x] of [-101, 0, 101].entries()) {
      this.podium(g, x, 82, i === 0 ? '#f0bd6d' : i === 1 ? '#bdc5dc' : '#9ac5b7', ['THE RODRIGOS', '', 'THE ROANS'][i]);
      if (x) {
        p.oval(g, [x + 17, 71, 90], [11, 3, 9], '#232153');
        this.buzzerLights.push(p.oval(g, [x + 17, 75, 90], [8, 3.7, 7], '#96c6e4'));
        this.proxy(g, [x * 1.85, 129, -5], i ? '#dea5bb' : '#51435b', i ? '#80413e' : '#503954', .78);
      }
    }
  }

  private buildQuestion() {
    const p = this.props;
    const g = this.set('question');
    this.room(g, '#8f2465', '#632a5f');
    for (let row = 0; row < 7; row++) for (let col = 0; col < 15; col++) {
      p.box(g, 24, 19, .8, (row + col) % 4 ? '#a13976' : '#ce5b8f',
        [(col - 7) * 30, 50 + row * 25, -118]);
    }
    for (const [i, x] of [-72, 72].entries()) {
      this.podium(g, x, 82, '#bc487a');
      this.rounded(g, [x, 36, 101], 59, 35, 4, BLUE);
      this.sign(g, [x, 36, 102], [55, 29], [
        { text: 'What is', color: PALE, italic: true },
        { text: i ? '“Call you later?”' : '“Olivia R.”', color: '#f5cfeb', italic: true },
      ]);
    }
  }

  private buildGoldAndMoney() {
    const p = this.props;
    const gold = this.set('gold');
    this.room(gold, '#282958', '#271d54');
    for (let i = 0; i < 34; i++) {
      const stripe = p.box(gold, 8, 316, 3, i % 3 ? '#975a53' : GOLD, [(i - 16.5) * 18, 139, -128]);
      stripe.rotation.z = i % 2 ? .25 : -.17;
    }
    this.sign(gold, [0, 171, -122], [355, 95], [{ text: 'THE BIG SHOW', color: '#ffe3a1', italic: true }]);
    const money = this.set('money');
    this.room(money, '#294971', '#2b4376');
    for (let i = 0; i < 13; i++) {
      const note = new THREE.Group();
      money.add(note);
      note.position.set((i % 5 - 2) * 93, 47 + Math.floor(i / 5) * 65, -95 + i % 2 * 6);
      note.rotation.z = (random(i) - .5) * .44;
      this.rounded(note, [0, 0, 0], 83, 43, 5, ['#98d5c2','#baa6db','#92c8e5'][i % 3]);
      this.rounded(note, [0, 0, 2], 74, 35, 4, '#e3dec3');
      this.sign(note, [0, 0, 3], [63, 27], [{ text: ['$5', '$20', '$100'][i % 3], color: '#315482' }]);
    }
  }

  private buildFinale() {
    const g = this.set('finale');
    this.room(g, '#273561', '#546a9c');
    this.marquee(g);
    this.props.oval(g, [0, -3, 6], [226, 10, 137], '#c9d6e9');
    for (let i = 0; i < 89; i++) this.confetti.push(this.props.box(g, 2.65, 4.25, .6, COLOR_CHIPS[i % COLOR_CHIPS.length], [0, 0, -31]));
  }

  private look(actor: ExpectationsId, set: SetName, stageTime: number): Clothes {
    if (actor === HOST) return BLAZER;
    if (actor === ANNOUNCER) return PLUM;
    if (actor === CHAPPELL) {
      if (set === 'survey') return MINT_DRESS;
      return LEOPARD;
    }
    if (set === 'phone' || set === 'blue' || set === 'pink') return PHONE;
    if (set === 'survey' || set === 'main' && stageTime >= 21 && stageTime < 26.34) return CHECKERED;
    if (set === 'main' && stageTime >= 18.55 && stageTime < 21) return BLACK_DRESS;
    if ((set === 'main' && stageTime < 55) || (set === 'split' && stageTime < 57)) return SUNGLASSES;
    if (set === 'finale') return { top: '#262337', lower: '#ead4d5' };
    return BLACK_DRESS;
  }

  private pose(id: ExpectationsId, time: number, camera: THREE.PerspectiveCamera, playing: boolean,
      dt: number, reset: boolean, set: SetName, beat: number) {
    const fig = this.figures[id];
    const outfit = this.look(id, set, time);
    const props = this.wardrobe.get(fig)!;
    (fig.torso.material as THREE.MeshStandardMaterial).color.set(outfit.top);
    for (const arm of fig.arms) (arm.material as THREE.MeshStandardMaterial).color.set(outfit.top);
    for (const leg of fig.legs) (leg.material as THREE.MeshStandardMaterial).color.set(outfit.lower);
    for (const [name, item] of Object.entries(props)) item.visible = name === outfit.accessory
      || name === 'wig' && !!outfit.wig || name === 'beret' && outfit.accessory === 'phone';
    const talking = id === HOST || id === ANNOUNCER;
    const right: Point = outfit.accessory === 'phone' ? [24, -5 + 2.1 * Math.sin(beat), 15]
      : talking ? [21, -37 + 7 * Math.sin(beat * .6), 22] : [32, -36 + 8 * Math.sin(beat * .84), 18];
    const left: Point = [-27, -44 + 10 * Math.sin(beat * .72 + (id === CHAPPELL ? 1.8 : 0)), 17];
    fig.pose(time, [STILL_ARMS[0], left, STILL_ARMS[2], right]);
    props.phone.position.set(...right);
    props.phone.rotation.z = -.25;
    props.card.position.set(...right);
    props.card.rotation.set(-.28, -.38, .14);
    fig.head.scene.rotation.y -= .085 + .12 * Math.sin(beat * .23 + (id === CHAPPELL ? .8 : 0));
    fig.head.scene.rotation.z = .052 * Math.sin(beat * .46);
    fig.update(time, playing, camera, dt, reset);
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
  }

  frame(t: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const reset = this.epoch !== epoch || this.previous < 0 || Math.abs(t - this.previous) > .22;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, t - this.previous);
    this.epoch = epoch;
    this.previous = t;
    const auto = EXPECTATIONS_SHOTS.filter(shot => shot.time <= t).at(-1)?.view ?? 'expect-channel';
    const forced = EXPECTATIONS_CAST.find(id => id === view);
    const selected = forced ? MANUAL[forced] : Object.hasOwn(SHOTS, view) ? view as ExpectationsView : auto;
    const shot = SHOTS[selected];
    const active = EXPECTATIONS_CAST.find(id => id === speaker);
    const earlyInterview = selected === 'expect-split' && t < 90;
    const cast = forced ? [{ id: forced, at: [0, 157, 49] as Point, scale: 1.10 }]
      : earlyInterview ? interview : shot.cast ?? [];
    const roles = new Set(cast.map(actor => actor.id));
    const insertActor = intensity > .04 && active && !roles.has(active) && !forced ? active : undefined;
    const hostShot = selected === 'expect-host' || selected === 'expect-goodnight' || selected === 'expect-title';
    const portrait = this.camera.aspect < 1.08;
    const beat = t * Math.PI * 2 * (133 / 60);
    const target = new THREE.Vector3(...shot.at);
    const from = new THREE.Vector3(...shot.camera);
    if (forced) { target.set(0, 150, 43); from.set(0, 156, 318); }
    else if (portrait && cast.length > 1) from.z += 86;
    else if (portrait && shot.set === 'prize') from.z += 69;
    const lead = cast.find(actor => actor.id === active);
    if (lead && !forced && portrait && cast.length > 1) target.x = THREE.MathUtils.lerp(target.x, lead.at[0], .36);
    from.x += .7 * Math.sin(t * .28);
    this.camera.position.copy(from);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld(true);

    for (const [name, group] of this.sets) group.visible = name === shot.set;
    this.contestantPodiums.visible = !hostShot;
    this.hostCaption.visible = selected === 'expect-host' && t >= 38.5 && t < 42.4;
    this.splitHostName.visible = earlyInterview;
    this.splitChappellName.visible = !earlyInterview;
    this.openingCards.forEach((card, i) => {
      card.visible = selected === 'expect-introductions' && i === Math.min(2, Math.max(0, Math.floor((t - 15.8) / 3.1)));
    });
    for (const id of EXPECTATIONS_CAST) this.figures[id].root.visible = roles.has(id) || id === insertActor;
    this.insert.visible = insertActor !== undefined;

    for (const { id, at, scale } of cast) {
      const fig = this.figures[id];
      fig.root.position.set(at[0] + (id === HOST ? .8 : 4) * Math.sin(beat * .46), at[1] + 1.45 * Math.sin(beat), at[2]);
      fig.root.scale.setScalar(scale ?? 1);
      this.pose(id, t, this.camera, playing, dt, reset, shot.set, beat);
    }
    if (insertActor) {
      const at = new THREE.Vector3(portrait ? -.57 : -.71, -.46, .9915).unproject(this.camera);
      const width = portrait ? .73 : .86;
      const fig = this.figures[insertActor];
      this.insert.position.copy(at);
      this.insert.quaternion.copy(this.camera.quaternion);
      this.insert.scale.setScalar(width);
      fig.root.position.copy(at);
      fig.root.scale.setScalar(width * .98);
      this.pose(insertActor, t, this.camera, playing, dt, reset, shot.set, beat);
    }
    if (shot.set === 'finale') this.confetti.forEach((flake, i) => {
      const seconds = Math.max(0, t - 253.833);
      flake.visible = t >= 253.833 && t < 286.958;
      flake.position.set((random(i + 804) - .5) * 388 + 13 * Math.sin(beat * .44 + i),
        19 + (275 + random(i * 2) * 180 - seconds * (37 + i % 7 * 3)) % 247 + (seconds > 8 ? 38 : 0),
        -21 - i % 5 * 7);
      flake.rotation.set(i + seconds * .86, i - seconds * .51, i * 1.9 + seconds);
    });
    this.titleLights.forEach((bulb, i) => (bulb.material as THREE.MeshBasicMaterial).color.set(
      Math.sin(t * 7.7 + i * .76) > -.11 ? '#ffe9a2' : '#b89365',
    ));
    this.turnLetters.forEach((tile, i) => {
      const start = selected === 'expect-letterboard' && t >= 89.4 ? 89.54 : 72.25;
      tile.rotation.y = (1 - THREE.MathUtils.smoothstep(t, start + .17 * i, start + .17 * i + .32)) * Math.PI / 2;
    });
    this.prizes.forEach((tile, i) => { tile.visible = i === (t < 69.3 ? Math.floor(t * 4) % 3 : 1); });
    this.car.position.x = -13 + 10 * Math.sin(t * 1.25);
    this.car.rotation.y = -.17 + .12 * Math.sin(t * .9);
    this.tiles.forEach((figure, i) => { figure.rotation.z = .16 * Math.sin(beat + i); });
    this.surveyRows.forEach((row, i) => { row.visible = t >= [154.7, 159.67, 163.8, 166.4][i]; });
    this.buzzerLights.forEach((bulb, i) => {
      const pulse = Math.exp(-((t - (i ? 154.71 : 146.25)) ** 2) * 13);
      bulb.scale.y = 3.7 - pulse * .95;
      (bulb.material as THREE.MeshBasicMaterial).color.set(pulse > .1 ? '#ffe0a1' : '#96c6e4');
    });
  }

  dispose() {
    for (const figure of Object.values(this.figures)) figure.dispose();
    this.props.dispose();
    this.textures.forEach(texture => texture.dispose());
  }
}
