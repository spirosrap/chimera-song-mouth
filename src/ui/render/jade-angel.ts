import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { JadeId, JadeView } from '../../scene/jade-angel.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type Set = 'street' | 'bedroom' | 'audition' | 'limo' | 'suite' | 'arrival' | 'studio' | 'black';
type Wardrobe = 'busker' | 'child' | 'gown' | 'blue' | 'ivory' | 'blonde' | 'red' | 'rehearsal' | 'reporter';
type Shot = { set: Set; look: Wardrobe; aim: Point; offset: Point; cast: Point; wide?: boolean; detail?: boolean };

function shot(set: Set, look: Wardrobe, aim: Point, offset: Point, cast: Point, wide = false, detail = false): Shot {
  return { set, look, aim, offset, cast, wide, detail };
}

const STREET = shot('street', 'busker', [5, 142, 2], [-75, 43, 520], [5, 152, 8], true);
const CAMERA: Record<JadeView | 'wide', Shot> = {
  wide: STREET,
  'jade-street': STREET,
  'jade-medallion': shot('street', 'busker', [-88, 78, 68], [-102, 25, 221], [-49, 157, 20], false, true),
  'jade-candles': shot('bedroom', 'child', [1, 115, 8], [37, 24, 237], [9, 136, -19]),
  'jade-childhood': shot('bedroom', 'child', [15, 142, -16], [-48, 8, 267], [15, 146, 3]),
  'jade-audition': shot('audition', 'gown', [5, 151, 1], [10, 14, 290], [5, 170, 1]),
  'jade-busker': shot('street', 'busker', [-46, 145, 9], [36, 22, 266], [-48, 164, 14]),
  'jade-suv': shot('street', 'blue', [16, 154, 27], [139, 23, 459], [9, 171, 64], true),
  'jade-paparazzi': shot('street', 'blue', [24, 147, 47], [-57, 29, 379], [23, 168, 53], true),
  'jade-press-close': shot('street', 'blue', [23, 168, 53], [38, 14, 249], [23, 168, 53]),
  'jade-gadget': shot('street', 'blue', [128, 75, 139], [98, 38, 160], [56, 166, 59], false, true),
  'jade-limo': shot('limo', 'ivory', [3, 141, -32], [-38, 9, 320], [6, 151, -42]),
  'jade-contract': shot('limo', 'ivory', [-73, 113, 2], [-18, 47, 218], [-20, 155, -36], false, true),
  'jade-phone': shot('suite', 'blonde', [35, 146, 23], [-37, 13, 259], [35, 157, 18]),
  'jade-suite': shot('suite', 'blonde', [31, 135, 9], [59, 35, 395], [36, 157, 13], true),
  'jade-arrival': shot('arrival', 'ivory', [10, 139, 30], [-26, 36, 458], [13, 166, 39], true),
  'jade-angels': shot('arrival', 'ivory', [4, 155, 48], [-34, 23, 341], [2, 163, 48], true),
  'jade-shoot': shot('studio', 'ivory', [3, 155, 17], [65, 29, 461], [11, 166, 26], true),
  'jade-rehearsal': shot('studio', 'rehearsal', [-10, 125, 37], [-71, 46, 479], [4, 166, 63], true),
  'jade-red-hair': shot('studio', 'rehearsal', [5, 161, 60], [31, 14, 266], [5, 165, 60]),
  'jade-spotlight': shot('studio', 'rehearsal', [12, 161, 66], [-27, 42, 316], [11, 171, 59]),
  'jade-finale': shot('suite', 'red', [1, 129, 19], [33, 18, 369], [10, 148, 28], true),
  'jade-news': shot('street', 'reporter', [24, 146, 58], [14, 10, 296], [24, 163, 58]),
  'jade-fade': shot('black', 'busker', [0, 151, 0], [0, 0, 290], [0, 152, 0]),
};

const TONES: Record<Set, { sky: string; fog: string }> = {
  street: { sky: '#adc1c2', fog: '#b4c1bd' },
  bedroom: { sky: '#22171d', fog: '#473542' },
  audition: { sky: '#131025', fog: '#272657' },
  limo: { sky: '#363747', fog: '#6c7588' },
  suite: { sky: '#100e20', fog: '#4a2b43' },
  arrival: { sky: '#11121d', fog: '#121d2e' },
  studio: { sky: '#8cb1b3', fog: '#a5c9cb' },
  black: { sky: '#000000', fog: '#000000' },
};

const CLOTH: Record<Wardrobe, { top: string; trim: string; hair: string; accent: string }> = {
  busker: { top: '#785c47', trim: '#bc9d74', hair: '#2b2528', accent: '#594147' },
  child: { top: '#712e58', trim: '#ffd3bc', hair: '#533439', accent: '#a0655f' },
  gown: { top: '#5d87ae', trim: '#d6ecff', hair: '#614138', accent: '#aa7254' },
  blue: { top: '#165394', trim: '#4b98e6', hair: '#e2bf7f', accent: '#ffdea4' },
  ivory: { top: '#e9e3da', trim: '#ffffff', hair: '#503328', accent: '#ad7452' },
  blonde: { top: '#352438', trim: '#e5a78e', hair: '#edca84', accent: '#f9e09f' },
  red: { top: '#a91f3c', trim: '#e85154', hair: '#edcc86', accent: '#ffe2a3' },
  rehearsal: { top: '#eef1e6', trim: '#c1e4df', hair: '#983630', accent: '#e76146' },
  reporter: { top: '#39414d', trim: '#873341', hair: '#35282a', accent: '#624d45' },
};

type FigureCostume = {
  curls: THREE.Mesh[];
  fur: THREE.Mesh[];
  wings: THREE.Group[];
  skirt: THREE.Mesh;
  lapels: THREE.Mesh[];
  collar: THREE.Mesh;
  glasses: THREE.Group;
  mic: THREE.Group;
  phone: THREE.Group;
};

type Proxy = {
  root: THREE.Group; arms: THREE.Mesh[]; wings?: THREE.Group[]; base: Point; phase: number;
};

const BONE = '#f7efd9';
const BRASS = '#d8a751';
const rng = (i: number) => {
  const value = Math.sin(i * 127.1 + 19.19) * 43758.54531;
  return value - Math.floor(value);
};

export class JadeAngelStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(41, 16 / 9, 1, 3200);
  readonly props = new VideoProps();
  readonly sets: Record<Set, THREE.Group> = {
    street: new THREE.Group(), bedroom: new THREE.Group(), audition: new THREE.Group(), limo: new THREE.Group(),
    suite: new THREE.Group(), arrival: new THREE.Group(), studio: new THREE.Group(), black: new THREE.Group(),
  };
  readonly figures: Record<JadeId, VideoFigure>;
  private readonly costumes = new Map<VideoFigure, FigureCostume>();
  private readonly textures: THREE.Texture[] = [];
  readonly cameras: THREE.Group[] = [];
  readonly crowd: Proxy[] = [];
  readonly dancers: Proxy[] = [];
  readonly candles: THREE.Mesh[] = [];
  readonly pressFlashes: THREE.Mesh[] = [];
  readonly medallion = new THREE.Group();
  readonly contract = new THREE.Group();
  readonly streetSUV = new THREE.Group();
  readonly arrivalSUV = new THREE.Group();
  readonly studioSUV = new THREE.Group();
  private time = -1;
  private epoch = -1;

  constructor(lead: Actor, harmony: Actor, sample: Actor, dialogue: Actor) {
    this.scene.background = new THREE.Color(TONES.street.sky);
    this.scene.fog = new THREE.Fog(TONES.street.fog, 510, 1580);
    this.scene.add(...Object.values(this.sets));
    this.makeStreet();
    this.makeBedroom();
    this.makeAudition();
    this.makeLimo();
    this.makeSuite();
    this.makeArrival();
    this.makeStudio();
    this.figures = {
      'jade-lead': this.figure(lead, '#aa7053'),
      'jade-harmony': this.figure(harmony, '#936453'),
      'jade-sample': this.figure(sample, '#b58161'),
      'jade-dialogue': this.figure(dialogue, '#d6a38a'),
    };
    this.frame(0, false, 0, 'jade-street', 0);
  }

  private slab(g: THREE.Object3D, at: Point, size: Point, color: string) {
    const mesh = this.props.box(g, ...size, color, at);
    // Independently shade faces, keeping the geometry readable through haze and flashbulbs.
    const colors: number[] = [];
    for (const shade of [.71, .60, 1.16, .51, 1, .71]) {
      const { r, g: green, b } = new THREE.Color(color).multiplyScalar(shade);
      for (let vertex = 0; vertex < 4; vertex++) colors.push(r, green, b);
    }
    mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.set('#ffffff');
    mat.vertexColors = true;
    return mesh;
  }

  private bar(g: THREE.Object3D, a: Point, b: Point, r: number, color: string) {
    return this.props.tube(g, a, b, r, color);
  }

  private label(g: THREE.Object3D, text: string, at: Point, w: number, h: number, ink: string) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = 'bold 68px Arial, sans-serif';
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 384, 64, 738);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    const plane = this.props.mesh(g, new THREE.PlaneGeometry(w, h), at, '#ffffff');
    const material = plane.material as THREE.MeshBasicMaterial;
    material.map = texture;
    material.transparent = true;
    material.depthWrite = false;
  }

  private makeStreet() {
    const s = this.sets.street;
    this.slab(s, [0, -12, 0], [2300, 18, 1500], '#657175');
    this.slab(s, [0, 0, -98], [2300, 12, 275], '#a6a9a1');
    this.slab(s, [0, 6, 40], [2300, 9, 11], '#c0b6a1');
    for (let i = -9; i <= 9; i++) {
      this.slab(s, [i * 104, -1, 220], [53, .8, 4], '#cfbf8f');
      this.slab(s, [i * 120, 7, -30], [3, .9, 132], '#726c67');
    }
    for (let i = -3; i <= 3; i++) {
      const x = i * 254;
      const paint = ['#685052', '#1a6b81', '#427b72', '#b47959'][Math.abs(i + 2) % 4];
      this.slab(s, [x, 184, -297], [248, 370, 82], i % 2 ? '#a58773' : '#c0a587');
      this.slab(s, [x, 87, -249], [242, 167, 14], paint);
      this.slab(s, [x, 158, -234], [242, 37, 19], paint);
      this.slab(s, [x, 141, -222], [230, 3, 12], '#e6be7c');
      this.label(s, ['MARKET', 'RECORDS', 'THE COURTYARD', 'CAFÉ'][Math.abs(i + 1) % 4], [x, 158, -222], 200, 28, '#f2e8cd');
      for (const side of [-1, 1]) {
        this.slab(s, [x + side * 62, 83, -234], [99, 107, 7], '#37494d');
        this.slab(s, [x + side * 61, 84, -227], [2.4, 112, 8], '#bed4cd');
        this.slab(s, [x + side * 61, 56, -227], [97, 2.4, 8], '#b5c5ba');
        this.slab(s, [x + side * 59, 239, -252], [62, 70, 9], '#373b44');
        this.slab(s, [x + side * 58, 275, -245], [75, 6, 10], '#e5cfa9');
      }
      for (let item = 0; item < 10; item++) {
        const columns = ['#99715d', '#7c9e9f', '#c19954', '#b6c78d', '#ca886f'];
        const x1 = x - 87 + (item % 5) * 43;
        const height = 14 + (item % 3) * 6;
        const y = item < 5 ? 35 : 81;
        this.slab(s, [x1, y, -227], [14, height, 5], columns[(item * 3 + i + 6) % 5]);
      }
    }
    for (let n = 0; n < 8; n++) {
      const x = -453 + n * 32;
      this.slab(s, [x, 19, -121 + (n % 2) * 8], [25, 23, 19], n % 2 ? '#806954' : '#606e71');
    }
    this.slab(s, [-80, 23, 89], [77, 22, 26], '#4e4443');
    this.slab(s, [-82, 45, 89], [59, 3, 27], '#a88f70');
    const caseLid = this.slab(s, [-86, 37, 73], [73, 5, 29], '#75564c');
    caseLid.rotation.x = -.46;
    this.slab(s, [127, 65, 140], [34, 35, 22], '#4c5b68');
    this.slab(s, [127, 78, 149], [20, 12, 2], '#6ed3cf');
    for (let j = 0; j < 3; j++) this.slab(s, [120 + j * 7, 65, 152], [3.5, 3.5, 3.5], '#be6a82');

    this.medallion.position.set(-94, 100, 53);
    s.add(this.medallion);
    this.props.mesh(this.medallion, new THREE.TorusGeometry(26, 3, 10, 48), [0, 0, 0], BRASS);
    const medal = this.props.mesh(this.medallion, new THREE.CylinderGeometry(20, 20, 6, 28), [0, 0, -2], '#ac7133');
    medal.rotation.x = Math.PI / 2;
    this.props.mesh(this.medallion, new THREE.TorusGeometry(12, 1, 8, 24), [0, 0, 3], '#f5d295');
    for (let n = 0; n < 9; n++) this.props.oval(this.medallion, [-20 + n * 5, 27 + n * 8, -2], [3.2, 4.3, 1.1], '#dbaf56');

    this.car(this.streetSUV, s, [196, 0, -97], .48);
    const colors = ['#52645c', '#593d51', '#425367', '#72747a', '#ae7c63', '#2d414d'];
    for (let n = 0; n < 14; n++) {
      const x = (n - 6.5) * 50 + (rng(n) - .5) * 34;
      const z = -61 - ((n * 13) % 3) * 36;
      this.crowd.push(this.proxy(s, [x, 0, z], .62 + .27 * rng(n + 30), colors[n % colors.length], false, n));
      if (n % 2 !== 0) continue;
      const g = new THREE.Group();
      g.position.set(x, 83 + 19 * rng(n + 18), z + 34);
      s.add(g);
      this.cameras.push(g);
      this.slab(g, [0, 0, 0], [19, 13, 14], '#3a383e');
      this.slab(g, [0, 0, 9], [8, 8, 7], '#859fbd');
      this.slab(g, [3, 10, 7], [14, 6, 3], '#c9d2d1');
      const flash = this.props.oval(g, [0, 10, 11], [9, 6, 3], '#f8f8fa');
      const material = flash.material as THREE.MeshBasicMaterial;
      material.transparent = true;
      material.depthWrite = false;
      this.pressFlashes.push(flash);
    }
    // Two press cameras work near the sides of the close coverage.
    for (const side of [-1, 1]) {
      const rig = new THREE.Group();
      rig.position.set(side * 133, 124, 43);
      s.add(rig);
      this.cameras.push(rig);
      this.slab(rig, [0, 0, 0], [25, 17, 17], '#2a2934');
      this.props.oval(rig, [0, 1, 11], [8, 7, 6], '#5294ae');
      this.slab(rig, [0, 11, 8], [17, 7, 4], '#c2cdd8');
      const flash = this.props.oval(rig, [0, 11, 11], [8, 6, 4], '#fff8ec');
      const material = flash.material as THREE.MeshBasicMaterial;
      material.transparent = true;
      material.depthWrite = false;
      this.pressFlashes.push(flash);
    }
    const barrierY = 70;
    for (const x of [-294, 334]) {
      this.bar(s, [x, 8, 35], [x, barrierY, 35], 4, BRASS);
      this.props.oval(s, [x, barrierY, 35], [6, 6, 6], '#e5c986');
    }
  }

  private makeBedroom() {
    const s = this.sets.bedroom;
    this.slab(s, [0, -2, 0], [820, 14, 720], '#62475b');
    this.slab(s, [0, 151, -165], [565, 306, 24], '#9e6773');
    for (let col = -9; col <= 9; col++) this.slab(s, [col * 28, 149, -150], [9, 295, 4], '#ab7780');
    this.slab(s, [238, 152, -46], [19, 310, 311], '#795463');
    this.slab(s, [51, 25, -103], [291, 45, 78], '#b28d9e');
    this.slab(s, [51, 47, -105], [283, 11, 74], '#d7abb8');
    for (let n = 0; n < 9; n++) {
      const x = -209 + n % 5 * 54;
      const y = 205 + Math.floor(n / 5) * 35 + (n % 2) * 14;
      this.slab(s, [x, y, -144], [41, 28 + 10 * rng(n + 12), 3], n % 2 ? '#eab39d' : '#b89bb0');
      this.slab(s, [x - 4, y + 3, -141], [17, 14, 2], n % 2 ? '#977485' : '#b76368');
    }
    this.slab(s, [-26, 43, 55], [116, 80, 58], '#6e4247');
    this.slab(s, [-26, 84, 56], [125, 6, 62], '#be7f61');
    this.props.oval(s, [-29, 89, 56], [35, 4, 26], '#f4d4ca');
    this.props.oval(s, [-29, 97, 56], [26, 8, 19], '#d78b86');
    this.props.oval(s, [-29, 103, 56], [25, 5, 19], '#f2c3af');
    for (let n = 0; n < 8; n++) {
      const x = -29 + 18 * Math.cos(n * .785);
      const z = 56 + 13 * Math.sin(n * .785);
      this.bar(s, [x, 105, z], [x, 117, z], 1.35, n % 2 ? '#ffbbb8' : '#fcdfb6');
      this.candles.push(this.props.oval(s, [x, 121, z], [2, 4.5, 2], '#ffe6a3'));
    }
    for (let n = 0; n < 58; n++) {
      const x = (rng(n + 5) - .5) * 495;
      const y = 113 + rng(n + 61) * 183;
      this.props.oval(s, [x, y, -126 - rng(n + 200) * 10], [2.1, 2.1, 1.5], n % 2 ? '#ffd4a1' : '#fff0d5');
    }
  }

  private makeAudition() {
    const s = this.sets.audition;
    this.slab(s, [0, -5, 0], [950, 12, 550], '#203153');
    this.slab(s, [0, 145, -193], [905, 300, 15], '#282149');
    const row = ['#8b73e7', '#377faf', '#b863c2', '#4cadcf'];
    for (let i = -6; i <= 6; i++) {
      this.slab(s, [i * 62, 148, -181], [9, 284, 5], row[Math.abs(i) % row.length]);
      this.slab(s, [i * 62, 146, -177], [3.1, 281, 2], '#edd9ff');
    }
    for (const radius of [124, 138, 151]) {
      this.props.mesh(s, new THREE.TorusGeometry(radius, 1.75, 7, 96), [0, 138, -162], radius === 138 ? '#f1d2fc' : '#61afdc');
    }
    for (const x of [-215, 210]) this.slab(s, [x, 14, -41], [79, 23, 51], '#253849');
    this.label(s, 'AUDITIONS', [0, 255, -149], 132, 23, '#bfe9fd');
  }

  private makeLimo() {
    const s = this.sets.limo;
    this.slab(s, [0, -7, -35], [510, 10, 500], '#9c9ca7');
    this.slab(s, [0, 137, -189], [462, 288, 15], '#bac6c8');
    this.slab(s, [0, 201, -173], [368, 74, 6], '#425063');
    this.slab(s, [-177, 39, -77], [80, 64, 218], '#dedbd3');
    this.slab(s, [174, 39, -71], [80, 64, 227], '#e4e4df');
    this.slab(s, [0, 35, -137], [228, 58, 44], BONE);
    for (let r = 0; r < 4; r++) {
      const z = -155 + r * 92;
      const rib: Point[] = [[-222, 89, z], [-220, 223, z], [-153, 275, z], [155, 275, z], [222, 223, z], [222, 89, z]];
      for (let i = 1; i < rib.length; i++) this.bar(s, rib[i - 1], rib[i], 2.7, '#e8e9f3');
    }
    for (const y of [94, 218]) {
      this.bar(s, [-221, y, -158], [-221, y, 131], 2, '#7ee4db');
      this.bar(s, [221, y, -158], [221, y, 131], 2, '#bad9ff');
    }
    const table = this.slab(s, [-73, 82, 19], [76, 8, 74], '#f6edda');
    table.rotation.y = -.18;
    this.contract.position.set(-74, 90, 15);
    s.add(this.contract);
    this.slab(this.contract, [0, 0, 0], [45, 5, 34], '#9d6755');
    this.slab(this.contract, [0, 3, 0], [38, 2, 30], '#f8edcf');
    for (let n = 0; n < 6; n++) this.slab(this.contract, [0, 4.3, -12 + n * 4], [22 + (n % 3) * 5, .3, .72], '#937b73');
    this.slab(this.contract, [12, 4.5, 13], [11, .3, 1.7], '#8f4649');
    const exec = this.proxy(s, [146, 14, -119], .95, '#377e9d', false, 43);
    this.bar(exec.root, [-17, 95, 9], [15, 94, 10], 2, BRASS);
    for (const x of [-151, 145]) {
      this.bar(s, [x, 70, -58], [x, 83, -58], 1.1, '#af8d5c');
      this.props.oval(s, [x, 87, -58], [3.7, 5.5, 3.7], '#f5cca7');
    }
  }

  private makeSuite() {
    const s = this.sets.suite;
    this.slab(s, [0, -6, -38], [950, 12, 560], '#594356');
    this.slab(s, [0, 141, -213], [728, 284, 17], '#6d4958');
    this.slab(s, [0, 167, -202], [420, 215, 9], '#182d45');
    for (let n = 0; n < 82; n++) {
      const x = (rng(n + 20) - .5) * 414;
      const y = 62 + rng(n + 63) * 178;
      this.slab(s, [x, y, -195], [1.9 + rng(n + 130) * 4, 1.6, 1], n % 3 ? '#aab9b8' : '#b7669a');
    }
    for (const x of [-208, -105, 2, 104, 209]) this.slab(s, [x, 164, -189], [5, 216, 9], '#785263');
    for (let n = 0; n < 15; n++) {
      const sign = n < 8 ? -1 : 1;
      const x = sign * (196 + n % 8 * 8);
      this.props.mesh(s, new THREE.CylinderGeometry(7, 9, 260, 6), [x, 141, -176], n % 2 ? '#6c3c52' : '#75495d');
    }
    this.slab(s, [5, 33, -83], [260, 59, 73], '#534759');
    this.slab(s, [5, 58, -108], [269, 65, 22], '#665465');
    for (const x of [-83, 11, 94]) this.slab(s, [x, 70, -94], [42, 32, 8], x > 0 ? '#d1a06c' : '#845367').rotation.z = x < 0 ? -.15 : .24;
    this.slab(s, [10, 8, 3], [320, 4, 104], '#7d4356');
    for (const x of [-214, 212]) {
      this.bar(s, [x, 8, -91], [x, 138, -91], 2, '#a58a72');
      this.props.mesh(s, new THREE.CylinderGeometry(16, 28, 28, 18), [x, 144, -91], '#e3b67f');
      this.props.oval(s, [x, 151, -90], [19, 12, 16], '#ecd2a2');
    }
    this.slab(s, [-136, 46, 33], [54, 8, 45], '#94624c');
    this.slab(s, [-135, 24, 33], [34, 39, 33], '#694337');
    this.slab(s, [-135, 53, 34], [22, 9, 14], '#8e6373');
  }

  private makeArrival() {
    const s = this.sets.arrival;
    this.slab(s, [0, -5, -15], [1300, 13, 1100], '#333a49');
    for (let i = -6; i <= 6; i++) {
      const x = i * 96;
      const h = 129 + rng(i + 71) * 107;
      this.slab(s, [x, h / 2, -291], [89, h, 36], i % 2 ? '#353647' : '#222a3c');
      for (const dx of [-25, 15]) {
        for (let n = 0; n < 4; n++) this.slab(s, [x + dx, 43 + n * 24, -269], [16, 8, 1.3], n % 2 ? '#775371' : '#c39478');
      }
    }
    this.car(this.arrivalSUV, s, [-135, 1, -79], .77);
    for (const x of [-304, 305]) {
      this.bar(s, [x, 1, -142], [x, 155, -142], 3.3, '#6a686e');
      this.slab(s, [x - 6, 157, -140], [23, 8, 10], '#ffe3bc');
    }
    for (let n = 0; n < 4; n++) {
      const x = (n < 2 ? -1 : 1) * (70 + (n % 2) * 62);
      this.dancers.push(this.proxy(s, [x, 0, -25 - n % 2 * 23], .79, '#d5d3db', true, n + 18));
    }
  }

  private makeStudio() {
    const s = this.sets.studio;
    this.slab(s, [0, -10, -55], [1320, 20, 750], '#bdd7d0');
    this.slab(s, [0, 149, -254], [940, 316, 19], '#9ebbb7');
    this.slab(s, [0, 136, -240], [742, 178, 15], '#e0f0e9');
    for (let col = -7; col <= 7; col++) {
      this.slab(s, [col * 50, 140, -230], [3, 195, 6], col % 2 ? '#afccc6' : '#78aeb0');
      this.slab(s, [col * 51, .2, -22], [1.1, .7, 426], '#99c2b8');
    }
    for (const y of [64, 158, 223]) this.slab(s, [0, y, -224], [766, 3, 4], '#a0c1be');
    this.bar(s, [-448, 90, -161], [448, 90, -161], 3.3, '#548f95');
    for (const x of [-387, -191, 152, 355]) this.bar(s, [x, 3, -161], [x, 92, -161], 2, '#709ba0');
    for (let i = -4; i <= 4; i++) {
      this.slab(s, [i * 112, 276, -91], [59, 5, 245], i % 2 ? '#dbeeed' : '#c5dfdc');
      this.slab(s, [i * 112, 272, -97], [39, 2, 223], '#fbf8ea');
    }
    // The glass observation window frames the label team overlooking rehearsal.
    this.slab(s, [244, 242, -216], [218, 64, 7], '#52767b');
    this.slab(s, [244, 242, -211], [205, 54, 3], '#d0e7ed');
    for (let n = 0; n < 5; n++) this.props.oval(s, [166 + n * 37, 245, -208], [6, 8, 4], ['#718997', '#537382', '#81939d'][n % 3]);
    for (let n = 0; n < 8; n++) {
      const side = n % 2 ? 1 : -1;
      const x = side * (83 + Math.floor(n / 2) * 55);
      this.dancers.push(this.proxy(s, [x, 0, -8 - (n % 3) * 45], .72 + .1 * rng(n + 48), BONE, true, n + 71));
    }
    this.car(this.studioSUV, s, [-178, 0, -112], .28);
    for (const x of [-237, 245]) {
      const panel = this.slab(s, [x, 181, -43], [44, 39, 8], '#f5efdc');
      panel.rotation.y = x > 0 ? -.3 : .3;
      this.bar(s, [x, 3, -41], [x, 165, -41], 2.5, '#596775');
    }
  }

  private car(body: THREE.Group, parent: THREE.Group, location: Point, scale: number) {
    parent.add(body);
    body.position.set(...location);
    body.scale.setScalar(scale);
    this.slab(body, [0, 50, 1], [338, 61, 125], '#e5e7e8');
    this.slab(body, [-9, 91, -6], [211, 54, 117], '#e2e4e3');
    this.slab(body, [-8, 98, 56], [202, 34, 3.5], '#303847');
    this.slab(body, [99, 90, 44], [11, 29, 16], '#6f8a9e');
    for (const x of [-69, 1, 70]) {
      this.slab(body, [x, 94, 59], [6, 42, 5], '#d3e2e4');
      this.slab(body, [x, 65, 64], [16, 3.4, 4], '#7b8a8e');
    }
    this.slab(body, [0, 30, 63], [298, 7, 6], '#5e6673');
    this.slab(body, [-146, 63, 63], [21, 9, 4], '#b74b5b');
    this.slab(body, [149, 66, 63], [25, 10, 5], '#f6e8b3');
    this.slab(body, [170, 48, 1], [4, 21, 68], '#799093');
    for (const x of [-110, 110]) {
      for (const z of [-60, 60]) {
        const wheel = this.props.mesh(body, new THREE.CylinderGeometry(28, 28, 13, 28), [x, 27, z], '#292b38');
        wheel.rotation.x = Math.PI / 2;
        const hub = this.props.mesh(body, new THREE.CylinderGeometry(17, 17, 5, 20), [x, 27, z + Math.sign(z) * 8], '#a5bcc2');
        hub.rotation.x = wheel.rotation.x;
      }
    }
  }

  private angelWings(parent: THREE.Object3D, size = 1) {
    const wings: THREE.Group[] = [];
    for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      wing.position.set(side * 17, -18, -14);
      wing.scale.setScalar(size);
      parent.add(wing);
      wings.push(wing);
      for (let n = 0; n < 13; n++) {
        const x = side * (10 + n * 3.8);
        const y = n * 1.6 - 5;
        const z = -n * .82;
        const length = 19 + Math.sin(n / 12 * Math.PI * .89) * 22;
        const plume = this.props.oval(wing, [x, y, z], [3.7, length / 2, 2], n % 4 === 0 ? '#a6c8c6' : '#fbf3e3');
        plume.rotation.z = -side * (.24 + n * .063);
        const ridge = this.props.oval(wing, [x, y + 5, z + 1.5], [1.5, length / 3, 1], '#fffbee');
        ridge.rotation.z = plume.rotation.z;
      }
    }
    return wings;
  }

  private proxy(parent: THREE.Group, at: Point, scale: number, top: string, angel: boolean, phase: number): Proxy {
    const root = new THREE.Group();
    root.scale.setScalar(scale);
    root.position.set(...at);
    parent.add(root);
    const skin = ['#d39b80', '#ab7556', '#b28679', '#8a5b50'][phase % 4];
    const shade = angel ? '#d9ddd5' : '#323443';
    this.props.oval(root, [0, 125, 0], [12, 16, 9], skin);
    this.props.oval(root, [0, 131, -4], [12.5, 13, 8], '#54404b');
    const coat = this.props.mesh(root, new THREE.CylinderGeometry(19, 14, 50, 12), [0, 88, 0], top);
    coat.scale.z = .57;
    for (const x of [-9, 9]) {
      this.bar(root, [x * .8, 74, 0], [x, 8, 0], 5.8, shade);
      this.props.oval(root, [x, 4, 5], [5, 3.5, 9], shade);
    }
    const arms = [-1, 1].map(side => this.bar(root, [side * 16, 106, 0], [side * 25, 66, 8], 4.3, top));
    const wingRoot = new THREE.Group();
    wingRoot.position.set(0, 109, 0);
    root.add(wingRoot);
    return { root, arms, base: at, phase, wings: angel ? this.angelWings(wingRoot, .72) : undefined };
  }

  private figure(actor: Actor, skin: string) {
    const f = new VideoFigure(actor.model, actor.track, this.props, this.scene, '#936a70', skin);
    f.head.scene.scale.setScalar(2.12);
    const curls: THREE.Mesh[] = [];
    for (let n = 0; n < 19; n++) {
      const side = n < 9 ? -1 : 1;
      const row = n % 9;
      const x = side * (19 + rng(n + 35) * 5);
      const y = 20 - row * 5.8;
      curls.push(this.props.oval(f.root, [x, y, -13 - rng(n + 8) * 6], [5 + rng(n + 36) * 3, 8 + rng(n + 33) * 5, 7.7], '#382831'));
    }
    for (let n = 0; n < 5; n++) {
      curls.push(this.props.oval(f.root, [(n - 2) * 7, 26 + Math.sin(n * .72) * 5, -12], [8, 8, 9], '#453336'));
    }

    const fur: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      for (let n = 0; n < 10; n++) {
        const y = -11 - (n % 5) * 8;
        const x = side * (16 + (n % 2) * 8 + rng(n) * 4);
        fur.push(this.props.oval(f.root, [x, y, -2 + rng(n + 4) * 12], [7 + rng(n + 9) * 7, 9, 9], '#1c639e'));
      }
    }
    const skirt = this.props.mesh(f.root, new THREE.CylinderGeometry(16, 27, 29, 20), [0, -77, 0], BONE);
    skirt.scale.z = .63;
    const lapels = [-1, 1].map(side => {
      const lapel = this.props.box(f.root, 4, 37, 2, '#ba997a', [side * 9, -34, 12]);
      lapel.rotation.z = side * -.34;
      lapel.scale.x = .67;
      return lapel;
    });
    const collar = this.props.box(f.root, 19, 4, 4, BRASS, [0, -14, 12]);
    const glasses = new THREE.Group();
    f.root.add(glasses);
    this.bar(glasses, [-14, 7, 14], [14, 7, 14], .85, '#6e687d');
    for (const x of [-6, 6]) {
      const tint = this.props.oval(glasses, [x, 6, 14.5], [5.2, 2.8, .7], '#17263d');
      const material = tint.material as THREE.MeshBasicMaterial;
      material.opacity = .45;
      material.transparent = true;
      material.depthWrite = false;
    }
    const wings = this.angelWings(f.root);
    const mic = new THREE.Group();
    const phone = new THREE.Group();
    f.root.add(mic, phone);
    this.bar(mic, [0, -9, 2], [0, 10, 2], 2.4, '#333548');
    this.props.oval(mic, [0, 12, 2], [3.6, 4.6, 3.3], '#d9dce1');
    this.slab(phone, [0, 0, 0], [6, 21, 4], '#91395d');
    this.slab(phone, [0, 1, 2.2], [4, 15, .6], '#eac6bb');
    this.costumes.set(f, { curls, fur, wings, skirt, lapels, collar, glasses, mic, phone });
    return f;
  }

  private ward(f: VideoFigure, look: Wardrobe, beat: number, energy: number, t: number) {
    const c = CLOTH[look];
    const costume = this.costumes.get(f)!;
    const dance = look === 'rehearsal' || look === 'ivory';
    const useMic = look === 'busker' || look === 'child' || look === 'gown' || look === 'reporter';
    const usingPhone = look === 'blonde';
    const wideArm = dance ? 17 + 12 * Math.sin(beat) : 5 + 9 * energy;
    const hands: [Point, Point, Point, Point] = [
      [-27, -29 + (dance ? 11 * Math.sin(beat + 1) : 0), 7], [-26 - wideArm, -57 + (dance ? 27 * Math.sin(beat + 1) : energy * 13), 16],
      [25, -27, 10], useMic ? [18, -21, 19] : usingPhone ? [24, -7, 4] : [28 + wideArm, -58 + (dance ? 21 * Math.cos(beat) : energy * 8), 18],
    ];
    f.pose(t, hands, look === 'red');
    f.head.scene.rotation.x = dance ? Math.sin(beat * .5) * .074 : -.025;
    f.head.scene.rotation.y -= Math.sin(beat * .53) * (dance ? .28 : .13);
    f.head.scene.rotation.z = (dance ? .052 : .025) * Math.sin(beat);
    // The physical airway is the sole face. All hair and feathers are placed behind it.
    for (const [i, curl] of costume.curls.entries()) {
      (curl.material as THREE.MeshBasicMaterial).color.set(i % 4 === 0 ? c.accent : c.hair);
      curl.visible = look !== 'reporter' || i >= 16;
      const curlRadius = i < 19 ? 5 + rng(i + 36) * 3 : 8;
      curl.scale.x = curlRadius * (look === 'blue' ? 1.29 : look === 'rehearsal' ? .88 : 1);
      curl.position.z = -18 - rng(i + 8) * 5;
    }
    for (const flock of costume.fur) flock.visible = look === 'blue';
    for (const [i, wing] of costume.wings.entries()) {
      wing.visible = dance;
      wing.rotation.y = (i ? -1 : 1) * (Math.sin(beat) * .26 + .14);
      wing.rotation.z = (i ? 1 : -1) * Math.cos(beat + .66) * .15;
    }
    for (const mesh of [f.torso, ...f.arms, ...costume.lapels, costume.skirt, costume.collar]) {
      const color = mesh === costume.collar ? BRASS : costume.lapels.includes(mesh) ? c.trim : c.top;
      (mesh.material as THREE.MeshBasicMaterial).color.set(color);
    }
    for (const mesh of [...f.legs, ...f.feet]) (mesh.material as THREE.MeshBasicMaterial).color.set(dance ? BONE : look === 'red' ? '#8e233c' : '#252833');
    costume.collar.visible = look === 'blue' || look === 'blonde';
    costume.glasses.visible = look === 'blue' && t >= 45.9;
    for (const lapel of costume.lapels) lapel.visible = look === 'busker' || look === 'blue' || look === 'red' || look === 'reporter';
    costume.skirt.visible = dance || look === 'child' || look === 'gown';
    costume.mic.visible = useMic;
    costume.mic.position.set(...hands[3]);
    costume.mic.rotation.z = -.25;
    costume.phone.visible = usingPhone;
    costume.phone.position.set(...hands[3]);
    costume.phone.rotation.z = -.17;
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
  }

  frame(t: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const reset = epoch !== this.epoch || this.time < 0 || Math.abs(t - this.time) > .24;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, t - this.time);
    this.epoch = epoch;
    this.time = t;
    const focused = speaker && Object.hasOwn(this.figures, speaker) ? speaker as JadeId : 'jade-lead';
    const master = Object.hasOwn(this.figures, view) ? view as JadeId : focused;
    const chosen: Shot = Object.hasOwn(CAMERA, view) ? CAMERA[view as JadeView | 'wide'] : STREET;
    const { set, look } = chosen;
    for (const name of Object.keys(this.sets) as Set[]) this.sets[name].visible = name === set;
    (this.scene.background as THREE.Color).set(TONES[set].sky);
    (this.scene.fog as THREE.Fog).color.set(TONES[set].fog);

    const pulse = t * 2 * Math.PI * (look === 'child' || look === 'gown' ? 1.1 : 1.96);
    const busy = set === 'street' && look === 'blue';
    this.streetSUV.visible = busy;
    this.medallion.visible = view === 'jade-medallion';
    this.medallion.rotation.y = .19 + Math.sin(t * 2.4) * .46;
    this.contract.rotation.y = -.18 + Math.sin(t * .5) * .11;
    this.arrivalSUV.position.x = -147 + Math.sin(t * .38) * 17;
    this.studioSUV.visible = view === 'jade-shoot';
    for (const [i, candle] of this.candles.entries()) {
      const glow = 1 + Math.sin(t * 21 + i * 5) * .16;
      candle.scale.y = 4.5 * glow;
    }

    for (const [i, attendee] of this.crowd.entries()) {
      attendee.root.visible = (busy || (view === 'jade-news' && i < 3)) && i !== 6 && i !== 7;
      attendee.root.position.y = Math.sin(pulse + attendee.phase * 1.1) * (busy ? 10 : 2);
      attendee.root.rotation.y = -.27 + Math.sin(t * 1.72 + i) * .52;
      for (const [arm, mesh] of attendee.arms.entries()) {
        const side = arm ? 1 : -1;
        const raised = busy && (i + arm) % 3 !== 1;
        this.props.segment(mesh, [side * 16, 106, 0], [side * 24, raised ? 120 + 10 * Math.sin(pulse + i) : 67, 19], 4.3);
      }
    }
    for (const [i, mount] of this.cameras.entries()) {
      mount.visible = busy;
      mount.rotation.y = -.48 + Math.sin(t * 1.5 + i * 4) * .46;
      const phase = (t * 2.05 + i * .371) % 1;
      const flash = this.pressFlashes[i];
      flash.visible = phase < .115;
      (flash.material as THREE.MeshBasicMaterial).opacity = .92 - phase * 6.4;
      flash.scale.x = 8.5 + phase * 22;
    }

    if (set === 'studio' || set === 'arrival') {
      for (const dancer of this.dancers) {
        const phase = pulse * .5 + dancer.phase * .86;
        dancer.root.position.set(dancer.base[0] + 15 * Math.sin(phase), Math.max(0, Math.sin(phase * 2)) * 7, dancer.base[2] + 8 * Math.cos(phase));
        dancer.root.rotation.y = Math.sin(phase) * .46;
        for (const [i, a] of dancer.arms.entries()) {
          const side = i ? 1 : -1;
          this.props.segment(a, [side * 15, 109, 0], [side * (30 + Math.sin(phase) * 12), 97 + 39 * Math.sin(phase + side), 16], 4.3);
          dancer.wings![i].rotation.y = -side * (.23 + .29 * Math.sin(phase * 2));
        }
      }
    }

    const central = new THREE.Vector3(...chosen.cast);
    const pose = (): Wardrobe => {
      if (master === 'jade-dialogue') return view === 'jade-news' ? 'reporter' : look === 'busker' ? 'reporter' : look;
      return look === 'reporter' ? 'busker' : look;
    };
    const mainLook = pose();
    const portrait = this.camera.aspect < 1.16;
    const activeDialogue = focused === 'jade-dialogue' && intensity > 0;
    const stagePair = set === 'studio' || set === 'arrival' || set === 'limo';
    for (const [id, f] of Object.entries(this.figures) as [JadeId, VideoFigure][]) {
      f.root.visible = set !== 'black' && (id === master || (stagePair && chosen.wide === true && !portrait && id === 'jade-harmony'));
      if (!f.root.visible) continue;
      const isMain = id === master;
      const offset = isMain ? 0 : 91;
      f.root.position.copy(central).add(new THREE.Vector3(offset + Math.sin(pulse * .48) * 4, id === 'jade-harmony' && !isMain ? -9 : Math.sin(pulse) * 3.1, isMain ? 0 : -44));
      f.root.scale.setScalar((mainLook === 'child' ? .94 : mainLook === 'blue' ? 1.22 : 1.17) * (isMain ? 1 : .92));
      this.ward(f, isMain ? mainLook : 'ivory', pulse + (isMain ? 0 : 1.8), isMain ? intensity : .45, t);
    }
    const aim = new THREE.Vector3(...chosen.aim);
    const anchor = new THREE.Vector3(central.x, central.y - (chosen.wide ? 23 : 9), central.z);
    if ((chosen.detail && intensity > .03) || portrait || activeDialogue) {
      // Portrait coverage and shots with an active line favour the singer over the insert.
      const weight = chosen.detail && intensity < .03 ? 0 : portrait || activeDialogue ? .93 : .78;
      aim.lerp(anchor, weight);
    }
    aim.x += 3.5 * Math.sin(t * .71);
    const distance = new THREE.Vector3(...chosen.offset);
    if (portrait && chosen.wide) distance.multiplyScalar(.86);
    this.camera.position.copy(aim).add(distance);
    this.camera.lookAt(aim);
    this.camera.updateMatrixWorld(true);
    this.scene.updateMatrixWorld(true);
    for (const f of Object.values(this.figures)) {
      if (f.root.visible) f.update(t, playing, this.camera, dt, reset);
    }
  }

  dispose() {
    for (const f of Object.values(this.figures)) f.dispose();
    for (const texture of this.textures) texture.dispose();
    this.props.dispose();
  }
}
