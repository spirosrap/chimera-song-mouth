import * as THREE from 'three';
import { DEPENDS_CAST, DEPENDS_SHOTS, type DependsId, type DependsView } from '../../scene/xg-depends.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { VoiceModel } from '../analysis.ts';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';

type Actor = { id: CharacterId; model: VoiceModel; track: TeleTrack };
type SetName = 'studio' | 'sky' | 'station' | 'grocery' | 'picnic' | 'highway';
type Shot = { set: SetName; mode: 'group' | 'close' | 'chase' | 'insects' | 'portrait' | 'card'; angle: number };
type Performer = {
  figure: VideoFigure;
  cap: THREE.Group;
  scarf: THREE.Group;
  jacket: THREE.Group;
  skirt: THREE.Mesh;
  shadow: THREE.Mesh;
};
type Insect = { root: THREE.Group; wings: THREE.Group[]; feelers: THREE.Group };
type Sign = { view: DependsView; root: THREE.Group };

const CLOTHES = [
  { top: '#f4c639', trousers: '#23242d', hair: '#e6cf9e', boots: '#7d2539', length: 2 },
  { top: '#176280', trousers: '#282949', hair: '#222033', boots: '#3d54af', length: 3 },
  { top: '#702d96', trousers: '#25182e', hair: '#8c532a', boots: '#4f2f5c', length: 6 },
  { top: '#8d939f', trousers: '#32313e', hair: '#55403a', boots: '#51455c', length: 1 },
  { top: '#c5363b', trousers: '#dbc397', hair: '#ebc992', boots: '#31252c', length: 7 },
  { top: '#165344', trousers: '#ab7e31', hair: '#221f2b', boots: '#493246', length: 5 },
  { top: '#e08222', trousers: '#5c92a0', hair: '#a7492e', boots: '#2a2928', length: 4 },
];
const INSECTS = [
  { kind: 'bee', body: '#bc9f57', shell: '#523837', wing: '#bfc9bd', accent: '#eedb91', length: 15, span: 34 },
  { kind: 'cicada', body: '#6d9a4c', shell: '#406531', wing: '#81b7aa', accent: '#b5d278', length: 21, span: 38 },
  { kind: 'mantis', body: '#91ab7e', shell: '#53293d', wing: '#a6beb1', accent: '#d2cf7c', length: 26, span: 39 },
  { kind: 'butterfly', body: '#493a6a', shell: '#2e1e51', wing: '#4c327c', accent: '#e05472', length: 17, span: 50 },
  { kind: 'ladybird', body: '#437a44', shell: '#d13787', wing: '#f34f89', accent: '#e1ef69', length: 20, span: 31 },
  { kind: 'leafhopper', body: '#5c9e25', shell: '#304919', wing: '#78b927', accent: '#bdde54', length: 19, span: 33 },
  { kind: 'pink-mantis', body: '#d7789b', shell: '#a63d62', wing: '#dbab65', accent: '#ffce8f', length: 25, span: 44 },
] as const;
const PORTRAITS: readonly DependsView[] = [
  'depends-bee', 'depends-cicada', 'depends-mantis', 'depends-butterfly',
  'depends-ladybird', 'depends-leafhopper', 'depends-pink-mantis',
];
const SHOTS: Record<DependsView, Shot> = {
  'depends-gather': { set: 'studio', mode: 'group', angle: 0 },
  'depends-title': { set: 'studio', mode: 'card', angle: 0 },
  'depends-service-station': { set: 'station', mode: 'group', angle: -.1 },
  'depends-convertible': { set: 'station', mode: 'close', angle: .32 },
  'depends-grocery': { set: 'grocery', mode: 'group', angle: .07 },
  'depends-shopping-cart': { set: 'grocery', mode: 'close', angle: -.24 },
  'depends-picnic': { set: 'picnic', mode: 'group', angle: .09 },
  'depends-flowers': { set: 'picnic', mode: 'close', angle: -.18 },
  'depends-roadside': { set: 'highway', mode: 'group', angle: -.12 },
  'depends-sparks': { set: 'highway', mode: 'group', angle: .12 },
  'depends-blue-dance': { set: 'sky', mode: 'group', angle: -.03 },
  'depends-dance-close': { set: 'sky', mode: 'close', angle: -.22 },
  'depends-white-dance': { set: 'studio', mode: 'group', angle: .13 },
  'depends-chase': { set: 'studio', mode: 'chase', angle: -.13 },
  'depends-creature-reveal': { set: 'studio', mode: 'insects', angle: .09 },
  'depends-bee': { set: 'sky', mode: 'portrait', angle: -.13 },
  'depends-cicada': { set: 'sky', mode: 'portrait', angle: .09 },
  'depends-mantis': { set: 'sky', mode: 'portrait', angle: -.12 },
  'depends-butterfly': { set: 'sky', mode: 'portrait', angle: .1 },
  'depends-ladybird': { set: 'sky', mode: 'portrait', angle: -.1 },
  'depends-leafhopper': { set: 'sky', mode: 'portrait', angle: .14 },
  'depends-pink-mantis': { set: 'sky', mode: 'portrait', angle: -.07 },
  'depends-flight': { set: 'studio', mode: 'insects', angle: 0 },
  'depends-masthead': { set: 'station', mode: 'card', angle: -.06 },
  'depends-name-card': { set: 'grocery', mode: 'card', angle: 0 },
  'depends-garden-card': { set: 'picnic', mode: 'card', angle: .03 },
  'depends-end-credits': { set: 'highway', mode: 'card', angle: -.11 },
  'depends-logo': { set: 'studio', mode: 'card', angle: 0 },
};
const BACKGROUNDS: Record<SetName, string> = {
  studio: '#cedfe9', sky: '#55add9', station: '#389aca', grocery: '#c99860',
  picnic: '#6db8da', highway: '#4f192c',
};
const FLOOR: Record<SetName, string> = {
  studio: '#c9dbe4', sky: '#a6d8ee', station: '#b29f87', grocery: '#ca9e73',
  picnic: '#6b9043', highway: '#936248',
};
const CHASE_COSTUMES = ['#415448', '#2b5b6e', '#9c764c', '#58434f', '#721f3f', '#ac943f', '#ad9356'];
const TRIM = ['#b04448', '#83a8b2', '#b99367', '#d0a387', '#ebc397', '#e5b962', '#6d8998'];
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const random = (n: number) => {
  const value = Math.sin(n * 479.67 + 9.82) * 43814.381;
  return value - Math.floor(value);
};

export class DependsStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(39, 1, 1, 3000);
  readonly props = new VideoProps();
  readonly sets = new Map<SetName, THREE.Group>();
  readonly figures = new Map<DependsId, Performer>();
  readonly insects: Insect[];
  private readonly textures: THREE.Texture[] = [];
  private readonly signs: Sign[] = [];
  private readonly sparks = new THREE.Group();
  private readonly sparkPositions = new Float32Array(288 * 3);
  private readonly movingCart = new THREE.Group();
  private readonly convertible = new THREE.Group();
  private readonly light = new THREE.HemisphereLight('#d9eeff', '#ac7987', 2.18);
  private readonly key = new THREE.DirectionalLight('#fff1da', 2.35);
  private epoch = -1;
  private previous = -1;

  constructor(actors: Actor[]) {
    this.scene.background = new THREE.Color(BACKGROUNDS.studio);
    this.key.position.set(160, 240, 280);
    this.scene.add(this.light, this.key);
    for (const name of Object.keys(BACKGROUNDS) as SetName[]) {
      const group = new THREE.Group();
      this.sets.set(name, group);
      this.scene.add(group);
      this.props.box(group, 2600, 2, 1900, FLOOR[name], [0, -1, -300]);
    }
    for (const [i, id] of DEPENDS_CAST.entries()) {
      const actor = actors.find(person => person.id === id);
      if (!actor) throw new Error('Missing DEPENDS performer: ' + id);
      this.figures.set(id, this.makePerformer(actor, i));
    }
    this.insects = INSECTS.map((spec, i) => this.makeInsect(spec, i));
    this.buildSky();
    this.buildStation();
    this.buildGrocery();
    this.buildPicnic();
    this.buildHighway();
    this.card('depends-title', ['DEPENDS'], '#608db7', 220);
    this.card('depends-masthead', ['XG'], '#ed3944', 200);
    this.card('depends-name-card', ['IN', 'DEPENDS'], '#d9ff55', 266);
    this.card('depends-garden-card', ['STARRING', 'JURIN · CHISA · HINATA · HARVEY', 'JURIA · MAYA · COCONA'], '#fff9b1', 290);
    this.card('depends-end-credits', ['XG', 'DEPENDS', 'CHIMERA SCENE'], '#eecbce', 232);
    this.card('depends-logo', ['XG'], '#647789', 132);
  }

  private shade(mesh: THREE.Mesh, glow = .12, metallic = .05) {
    const old = mesh.material as THREE.MeshBasicMaterial;
    mesh.material = new THREE.MeshStandardMaterial({
      color: old.color, emissive: old.color, emissiveIntensity: glow,
      roughness: .66, metalness: metallic, side: THREE.DoubleSide,
    });
    old.dispose();
  }

  private makePerformer(actor: Actor, index: number): Performer {
    const p = this.props;
    const start = p.meshes.length;
    const c = CLOTHES[index];
    const figure = new VideoFigure(actor.model, actor.track, p, this.scene, c.top, '#d5a597');
    figure.head.scene.scale.setScalar(2.03);
    figure.root.name = actor.id;
    const cap = new THREE.Group();
    const scarf = new THREE.Group();
    const jacket = new THREE.Group();
    figure.root.add(cap, scarf, jacket);
    p.oval(figure.root, [0, 18, -13], [20, 18, 13], c.hair);
    for (const side of [-1, 1]) {
      for (let strand = 0; strand < c.length; strand++) {
        const x = side * (17 + 3 * Math.sin(strand + index));
        const lock = p.oval(figure.root, [x, 14 - strand * 7.5, -12 + 2 * Math.cos(strand)], [5.5, 12, 6.7], c.hair);
        lock.rotation.z = .17 * side;
      }
      p.oval(figure.root, [side * 14.8, -2, 4], [1.55, 2.8, 1.12], '#e8be6d');
      const trim = TRIM[index];
      const lapel = p.box(jacket, index === 0 ? 9 : 6, index === 0 ? 44 : 32, 1.5, trim, [side * 8.6, -29, 14]);
      lapel.rotation.z = side * -.32;
      p.box(jacket, 11, 3, 1, trim, [side * 11, -54, 12]);
      if (index === 4) {
        const ruff = p.oval(jacket, [side * 20, -17, .5], [5.3, 9.1, 9], '#a3234c');
        ruff.rotation.z = side * .39;
      }
      if (index === 6) for (let stripe = 0; stripe < 4; stripe++) {
        p.box(jacket, 15, 2.6, 1, trim, [side * 10, -22 - stripe * 9, 12]);
      }
    }
    for (let j = 0; j < 6; j++) {
      const x = -14 + j * 5.6;
      const fringe = p.oval(figure.root, [x, 27 - Math.abs(x) * .24, 2.3], [5.2, index === 0 ? 7.2 : 4.0, 7], c.hair);
      fringe.rotation.z = -.38 + j * .09;
    }
    if (index === 2 || index === 3) p.oval(figure.root, [0, 32, -12], [9, 12, 9], c.hair);
    p.oval(cap, [0, 28, -2], [22, 8.5, 17], '#806750');
    p.oval(cap, [0, 24, 10], [19, 2, 15], '#a28d77');
    const fabric = index === 1 ? '#2b8d6e' : index === 6 ? '#7e3547' : '#4c3c45';
    p.oval(scarf, [0, -14, 3], [12, 4, 11], fabric);
    const tail = p.box(scarf, 5.4, 32, 1.2, fabric, [5, -29, 14]);
    tail.rotation.z = .26;
    for (let j = 0; j < 4; j++) p.oval(scarf, [8 - j * 1.4, -20 - j * 5, 15], [1.4, 1.5, .5], '#d8b479');
    const skirt = p.mesh(figure.root, new THREE.CylinderGeometry(17.5, 26, 20, 20), [0, -72, 0], c.trousers);
    skirt.scale.z = .68;
    for (const mesh of p.meshes.slice(start)) this.shade(mesh);
    const short = [1, 2, 4, 6].includes(index);
    for (const [piece, leg] of figure.legs.entries()) {
      (leg.material as THREE.MeshStandardMaterial).color.set(short ? piece % 2 === 0 ? '#bb856e' : c.boots : c.trousers);
    }
    for (const foot of figure.feet) (foot.material as THREE.MeshStandardMaterial).color.set(c.boots);
    const shadow = p.mesh(this.scene, new THREE.CircleGeometry(1, 28), [0, .15, 0], '#302732');
    shadow.rotation.x = -Math.PI / 2;
    const shadowMaterial = shadow.material as THREE.MeshBasicMaterial;
    shadowMaterial.opacity = .22;
    shadowMaterial.transparent = true;
    shadowMaterial.depthWrite = false;
    return { figure, cap, scarf, jacket, skirt, shadow };
  }

  private makeInsect(spec: typeof INSECTS[number], index: number): Insect {
    const p = this.props;
    const first = p.meshes.length;
    const root = new THREE.Group();
    const feelers = new THREE.Group();
    const wings: THREE.Group[] = [];
    root.name = spec.kind;
    root.add(feelers);
    this.scene.add(root);
    const narrow = spec.kind === 'mantis' || spec.kind === 'pink-mantis' || spec.kind === 'leafhopper';
    const broad = spec.kind === 'butterfly' || spec.kind === 'ladybird';
    p.oval(root, [0, -6, -1], [broad ? 13 : 9, spec.length, 8], spec.shell);
    p.oval(root, [0, 7, 3], [7.8, 10, 8.2], spec.body);
    p.oval(root, [0, 17, 6], [narrow ? 8.7 : 9.6, 7.4, 7.4], spec.body);
    for (const side of [-1, 1]) {
      p.oval(root, [side * 6.7, 18.3, 11], [4, 5.3, 3.3], spec.accent);
      p.oval(root, [side * 7.4, 18.8, 13.7], [2.45, 3.55, 1.2], '#211a2d');
      p.oval(root, [side * 7.4 - .6, 20, 14.9], [.92, .9, .35], '#fef6d8');
      p.tube(feelers, [side * 5, 22, 5], [side * 11, 33, 8], .62, '#514235');
      p.tube(feelers, [side * 11, 33, 8], [side * 16, 36, 9], .4, spec.accent);
      for (let j = 0; j < 3; j++) {
        const y = 9 - j * 9;
        const joint: Point = [side * (16 + j * 2.5), y + (narrow ? 8 : -2), 7 - j];
        p.tube(root, [side * 6, y, 2], joint, narrow && j === 0 ? 1.65 : .9, spec.body);
        p.tube(root, joint, [side * (23 + j * 2.5), y - 9 - j * 2, 9 - j], .65, spec.accent);
      }
      const wing = new THREE.Group();
      wings.push(wing);
      root.add(wing);
      wing.position.set(side * 5, 6, -6);
      const wide = spec.span;
      const upper = p.oval(wing, [side * wide * .52, wide * .22, -4], [wide * .62, wide * (broad ? .36 : .25), broad ? 3.1 : 1.3], spec.wing);
      upper.rotation.z = side * (broad ? .47 : .31);
      const lower = p.oval(wing, [side * wide * .38, -wide * .28, -4.5],
        [wide * .45, wide * .24, 1.7], spec.kind === 'ladybird' ? spec.shell : spec.wing);
      lower.rotation.z = side * -.47;
      for (let j = 0; j < 5; j++) {
        const spot = p.oval(wing, [side * wide * (.33 + j * .127), wide * (.02 + j * .071), -1.6],
          [wide * .075, broad ? wide * .055 : .68, .69], spec.accent);
        spot.rotation.z = side * .43;
      }
      for (let j = 0; j < 3; j++) {
        p.tube(wing, [0, -2, -2.8], [side * wide * (.68 + .08 * j), wide * (.15 + .15 * j), -2.2], .37, spec.shell);
      }
      if (spec.kind === 'ladybird') for (const [x, y] of [[12, 4], [21, 12], [28, 8], [15, -12]]) {
        p.oval(wing, [side * x, y, -1], [3.2, 3.6, .65], '#482536');
      }
    }
    for (let j = 0; j < 5; j++) {
      p.oval(root, [0, -4 - j * spec.length * .19, 4], [broad ? 11 : 7.1, 1.7, 4], j % 2 ? spec.body : spec.accent);
    }
    if (index === 0) for (let j = 0; j < 20; j++) {
      const angle = j * Math.PI * 2 / 20;
      p.tube(root, [8 * Math.cos(angle), 9, 8 * Math.sin(angle)],
        [10.6 * Math.cos(angle), 8 - random(j) * 3, 10.6 * Math.sin(angle)], .48, '#e6c685');
    }
    for (const mesh of p.meshes.slice(first)) this.shade(mesh, .24, .12);
    return { root, wings, feelers };
  }

  private buildSky() {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#2363a0');
    sky.addColorStop(.58, '#5daaca');
    sky.addColorStop(1, '#a9d9e9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 25; i++) {
      const x = random(i + 238) * 1250;
      const y = 71 + random(i + 68) * 410;
      const radius = 25 + random(i + 7) * 63;
      for (let j = 0; j < 11; j++) {
        const seed = i * 13 + j;
        const puffX = x + (random(seed + 4) - .5) * radius * 2.9;
        const puffY = y + (random(seed + 261) - .5) * radius * .58;
        const puffRadius = radius * (.30 + random(seed + 93) * .62);
        const cloud = ctx.createRadialGradient(0, 0, 0, 0, 0, puffRadius);
        cloud.addColorStop(0, 'rgba(241,250,255,.69)');
        cloud.addColorStop(.56, 'rgba(232,247,251,.39)');
        cloud.addColorStop(1, 'rgba(218,240,253,0)');
        ctx.save();
        ctx.translate(puffX, puffY);
        ctx.scale(1.12, .21 + .15 * random(seed + 18));
        ctx.fillStyle = cloud;
        ctx.fillRect(-puffRadius, -puffRadius, 2 * puffRadius, 2 * puffRadius);
        ctx.restore();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    const backdrop = this.props.mesh(this.sets.get('sky')!, new THREE.PlaneGeometry(1550, 775), [0, 290, -604], '#ffffff');
    (backdrop.material as THREE.MeshBasicMaterial).map = texture;
  }

  private buildCar(group: THREE.Object3D, color: string) {
    const p = this.props;
    const first = p.meshes.length;
    p.box(group, 218, 25, 77, color, [0, 31, 0]);
    p.oval(group, [-15, 40, 0], [110, 16, 43], color);
    p.box(group, 90, 11, 63, '#282831', [1, 47, 0]);
    p.box(group, 33, 7, 59, '#c1b498', [-9, 53, 0]);
    p.box(group, 10, 14, 58, '#b7aa8d', [-25, 57, 0]).rotation.z = .18;
    const glass = p.box(group, 3, 27, 69, '#7bb1b6', [32, 64, 0]);
    glass.rotation.z = .32;
    const material = glass.material as THREE.MeshBasicMaterial;
    material.transparent = true;
    material.opacity = .43;
    material.depthWrite = false;
    p.box(group, 9, 11, 81, '#929796', [106, 24, 0]);
    p.box(group, 8, 9, 83, '#91817c', [-106, 25, 0]);
    for (const z of [-43, 43]) {
      for (const x of [-66, 65]) {
        p.oval(group, [x, 22, z], [20, 20, 7.5], '#222128');
        p.oval(group, [x, 22, z * 1.15], [11.5, 11.5, 1.8], '#c8c9c8');
        p.oval(group, [x, 22, z * 1.2], [4.3, 4.3, 1], '#757984');
      }
      p.box(group, 4, 11, 14, '#e9d8a0', [112, 38, .71 * z]);
      p.box(group, 4, 9, 16, '#d3434d', [-112, 38, .71 * z]);
      p.box(group, 12, 2, 2, '#c3ccc9', [19, 43, .95 * z]);
    }
    for (const mesh of p.meshes.slice(first)) {
      if (mesh !== glass) this.shade(mesh, .14, .25);
    }
  }

  private buildStation() {
    const p = this.props;
    const stage = this.sets.get('station')!;
    p.box(stage, 720, 130, 15, '#a39482', [-30, 65, -220]);
    for (const i of range(7)) {
      p.box(stage, 717, 1, 1, '#807466', [-30, i * 19, -211]);
      for (const j of range(28)) p.box(stage, 1, 18, 1, '#938374', [-377 + j * 26 + (i % 2) * 13, i * 19 + 9, -211]);
    }
    p.tube(stage, [-174, 0, -135], [-174, 218, -135], 2, '#d6d0af');
    p.oval(stage, [-174, 204, -135], [72, 14, 54], '#e7b832');
    for (const x of [-142, -80]) {
      p.box(stage, 40, 103, 35, '#327163', [x, 51, -128]);
      p.box(stage, 33, 33, 1, '#d9ddc0', [x, 77, -110]);
      p.box(stage, 25, 11, 1, '#22393c', [x, 81, -109]);
      p.box(stage, 50, 7, 39, '#d7c4a2', [x, 105, -128]);
      p.tube(stage, [x + 18, 79, -108], [x + 26, 25, -104], 1.8, '#303239');
    }
    stage.add(this.convertible);
    this.buildCar(this.convertible, '#174d50');
    this.convertible.position.set(124, 0, -117);
    this.convertible.rotation.y = -.20;
    for (let i = 0; i < 3; i++) {
      p.mesh(stage, new THREE.TorusGeometry(43, 6, 8, 31), [141, 8 + i * 8, -214], '#3c9ee5').rotation.x = Math.PI / 2;
    }
    this.sign(stage, [-111, 119, -107], 114, 17, ['SELF SERVICE'], '#d3cead', '#493c34');
    this.sign(stage, [-56, 163, -206], 24, 25, ['7'], '#eee6cf', '#544d4d');
  }

  private buildGrocery() {
    const p = this.props;
    const stage = this.sets.get('grocery')!;
    p.box(stage, 730, 330, 9, '#d0a06e', [0, 165, -288]);
    p.box(stage, 131, 144, 5, '#96cedb', [-119, 72, -281]);
    p.box(stage, 3, 143, 2, '#e9ddb5', [-119, 72, -277]);
    for (const [row, z] of [[0, -175], [1, -255]]) {
      const x = row === 0 ? 177 : -196;
      p.box(stage, 158, 139, 38, '#95704b', [x, 69, z]);
      for (const j of range(5)) {
        const y = 9 + j * 28;
        p.box(stage, 163, 4, 47, '#e7d1a4', [x, y, z + 3]);
        for (const k of range(14)) {
          const tint = ['#d96342', '#c1aa58', '#688448', '#749eb1', '#e9d9ad', '#87514a'][Math.floor(random(k * 19 + j * 35) * 6)];
          const at: Point = [x - 72 + k * 11, y + 9, z + 23];
          p.box(stage, 8.7, 17, 8.7, tint, at);
          p.box(stage, 6.2, 4.1, .25, '#eeddb8', [at[0], at[1] - 1.7, at[2] + 4.5]);
        }
      }
    }
    for (const [i, label] of ['PANTRY', 'GROCERIES', 'FRESH TODAY'].entries()) {
      this.sign(stage, [-192 + i * 189, 191, -278], 114, 24, [label], '#eacb9c', '#805844');
    }
    stage.add(this.movingCart);
    const cart = this.movingCart;
    const ink = p.ink(cart);
    ink.begin();
    for (const i of range(7)) {
      const y = 39 + i * 4;
      p.line(ink, [[-33, y, 16], [32, y, 16], [38, y, -18], [-28, y, -18]], '#d2d5cf', 1.6, true);
    }
    for (const i of range(13)) {
      const x = -33 + i * 5.3;
      for (const z of [-18, 16]) p.line(ink, [[x, 39, z], [x - 2, 63, z]], '#c8c9bd', 1.3);
    }
    ink.end();
    p.tube(cart, [-33, 55, 1], [-47, 74, 1], 1.6, '#bfc1b5');
    p.tube(cart, [-47, 74, -22], [-47, 74, 22], 2.6, '#c34442');
    for (const z of [-15, 15]) for (const x of [-27, 23]) {
      p.tube(cart, [x, 39, z], [x, 11, z], 2, '#a9afa9');
      p.oval(cart, [x, 8, z], [5, 5, 2.5], '#464450');
    }
  }

  private buildPicnic() {
    const p = this.props;
    const stage = this.sets.get('picnic')!;
    p.box(stage, 780, 77, 9, '#e4e9d2', [0, 38, -208]);
    for (let i = 0; i < 52; i++) {
      const x = -460 + i * 18;
      p.box(stage, 1.3, 77, 2, '#b9c5ae', [x, 38, -203]);
      p.oval(stage, [x, 92 + random(i) * 36, -239 - random(i + 60) * 40],
        [18, 28, 22], i % 3 === 0 ? '#7c9f3d' : '#3d704b');
    }
    p.box(stage, 143, 5, 67, '#f4d7c5', [-143, 67, -116]);
    for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) {
      p.box(stage, 8, 1.4, 8, i % 2 === j % 2 ? '#d35266' : '#f5b7b4', [-208 + i * 16, 70, -145 + j * 14]);
    }
    for (const x of [-203, -82]) {
      p.tube(stage, [x, 64, -103], [x, 1, -103], 2.7, '#eaddc7');
      p.box(stage, 28, 4, 29, '#e1d8ba', [x, 35, -41]);
      p.box(stage, 27, 27, 3, '#8baf79', [x, 48, -54]);
    }
    p.oval(stage, [151, 49, -94], [28, 12, 27], '#344243');
    p.oval(stage, [151, 56, -93], [26, 2, 25], '#a47346');
    for (const side of [-1, 1]) p.tube(stage, [151 + side * 11, 45, -96], [151 + side * 26, 0, -91], 2.1, '#55545a');
    for (let i = 0; i < 92; i++) {
      const x = -337 + random(i * 3) * 674;
      const z = -164 + random(i * 6 + 4) * 81;
      const y = 7 + random(i + 88) * 32;
      p.tube(stage, [x, 0, z], [x, y, z], .85, '#547745');
      p.oval(stage, [x, y, z], [3.3, 2.1, 3.45], i % 6 < 4 ? '#cb4e58' : '#e6946c');
    }
  }

  private buildHighway() {
    const p = this.props;
    const stage = this.sets.get('highway')!;
    p.box(stage, 1490, 1, 125, '#534449', [0, .13, -118]);
    for (const [y, color] of [[36, '#c4ada3'], [42, '#8b797b']] as const) {
      p.box(stage, 1100, 3, 3, color, [0, y, -181]);
    }
    for (let i = 0; i < 13; i++) {
      p.box(stage, 5, 39, 5, '#b09588', [-450 + i * 72, 19, -181]);
    }
    const car = new THREE.Group();
    stage.add(car, this.sparks);
    this.buildCar(car, '#202936');
    car.position.set(165, 0, -113);
    car.rotation.y = Math.PI * .22;
    p.tube(stage, [-186, 0, -158], [-186, 168, -158], 2, '#bd9a75');
    p.box(stage, 31, 31, 3, '#daa33e', [-186, 164, -155]).rotation.z = Math.PI / 4;
    this.sign(stage, [-186, 132, -155], 29, 23, ['35'], '#d99e3d', '#402734');
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#ffdbab', size: 7.3,
      opacity: .91, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    points.frustumCulled = false;
    this.sparks.add(points);
  }

  private sign(parent: THREE.Object3D, at: Point, width: number, height: number,
    lines: string[], background: string | null, foreground: string) {
    const plane = this.props.mesh(parent, new THREE.PlaneGeometry(width, height), at, background ?? foreground);
    plane.visible = background !== null;
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = Math.round(1024 * height / width);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = foreground;
    const lineHeight = canvas.height / (lines.length + .47);
    for (const [i, line] of lines.entries()) {
      ctx.font = `900 italic ${lineHeight * (i === 0 ? .83 : .65)}px sans-serif`;
      ctx.fillText(line, canvas.width * .5, (i + .73) * lineHeight, canvas.width * .95);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(map);
    const mat = plane.material as THREE.MeshBasicMaterial;
    mat.map = map;
    mat.color.set('#ffffff');
    mat.transparent = !background;
    mat.depthWrite = !!background;
    plane.visible = true;
  }

  private card(view: DependsView, lines: string[], color: string, width: number) {
    const root = new THREE.Group();
    this.scene.add(root);
    root.position.set(0, 130, 26);
    this.sign(root, [0, 0, 0], width, lines.length === 1 ? 76 : 95, lines, null, color);
    this.signs.push({ view, root });
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width, height);
  }

  private pose(person: Performer, index: number, time: number, phase: number, moving: boolean, close: boolean) {
    const { figure } = person;
    const bounce = Math.sin(phase);
    const reach = moving ? Math.sin(phase * .5 + index * .7) : .18;
    const lift = moving && Math.floor(phase / Math.PI) % 4 < 2 ? 22 : 6;
    figure.pose(time, [
      [-29, -24 - 7 * bounce, 8], [-32 + 9 * reach, -40 + lift * bounce, 20 + 6 * reach],
      [29, -26 + 8 * bounce, 9], [31 + lift * reach, -35 - lift * bounce, 23 - 5 * reach],
    ]);
    for (const [leg, side] of [-1, 1].entries()) {
      const stride = moving ? side * Math.sin(phase) : 0;
      const knee: Point = [side * (13 + 4 * stride), -103 + 7 * Math.max(0, stride), 8 + 14 * stride];
      const foot: Point = [side * (16 + 8 * stride), -146 + 11 * Math.max(0, stride), 8 + 24 * stride];
      this.props.segment(figure.legs[leg * 2], [side * 10, -68, 0], knee, 7.4);
      this.props.segment(figure.legs[leg * 2 + 1], knee, foot, 5.5);
      figure.feet[leg].position.set(...foot);
    }
    figure.head.scene.rotation.y += .23 + .11 * Math.sin(phase * .42);
    figure.head.scene.rotation.z = (close ? .063 : .031) * Math.cos(phase * .51);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const reset = epoch !== this.epoch || this.previous < 0 || Math.abs(time - this.previous) > .22;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, time - this.previous);
    this.epoch = epoch;
    this.previous = time;
    const scheduled = DEPENDS_SHOTS.filter(shot => shot.time <= time).at(-1) ?? DEPENDS_SHOTS[0];
    const manual = DEPENDS_CAST.findIndex(id => id === view);
    const selected = manual >= 0 ? PORTRAITS[manual]
      : Object.hasOwn(SHOTS, view) ? view as DependsView : scheduled.view;
    const { set, mode, angle } = SHOTS[selected];
    const active = DEPENDS_CAST.findIndex(id => id === speaker);
    const portrait = PORTRAITS.indexOf(selected);
    const close = mode === 'close';
    const activeIndex = active >= 0 ? active : Math.floor(time / 2.15) % DEPENDS_CAST.length;
    const focus = portrait >= 0 ? portrait : activeIndex;
    const tall = this.camera.aspect < 1.1;
    const group = mode === 'group' || mode === 'chase' || view === 'wide';
    const roadSets = set === 'station' || set === 'grocery' || set === 'picnic' || set === 'highway';
    const beat = (time - 11.935) * (112 / 60) * Math.PI * 2;
    const sinceCut = Math.max(0, time - scheduled.time);
    const targetY = portrait >= 0 || close ? 115 : group ? 87 : 103;
    const distance = portrait >= 0 ? 330 : close ? 338 : mode === 'insects' ? 440 : tall ? 541 : 483;
    this.camera.position.set((angle + .017 * Math.sin(time * .86)) * distance, targetY + 35, distance);
    this.camera.lookAt(0, targetY, -7);
    this.camera.updateMatrixWorld(true);
    (this.scene.background as THREE.Color).set(BACKGROUNDS[set]);
    this.light.color.set(set === 'highway' ? '#fcb183' : '#dceeff');
    this.key.color.set(set === 'highway' ? '#ff8b69' : '#ffeed7');

    for (const [name, scenery] of this.sets) scenery.visible = name === set;
    for (const sign of this.signs) {
      sign.root.visible = selected === sign.view;
      sign.root.position.y = sign.view === 'depends-title' && active >= 0 ? 213 : 130;
    }
    this.sparks.visible = selected === 'depends-sparks';
    if (this.sparks.visible) {
      for (const i of range(288)) {
        const fountain = i % 8;
        const travel = (random(i + 90) + time * (.74 + random(i) * .49)) % 1;
        const n = i * 3;
        this.sparkPositions[n] = -240 + fountain * 68 + (random(i + 66) - .5) * travel * 53;
        this.sparkPositions[n + 1] = 10 + 4 * travel * (1 - travel) * (101 + 171 * random(i + 66));
        this.sparkPositions[n + 2] = -165 + (random(i * 2) - .5) * 44 * travel;
      }
      (this.sparks.children[0] as THREE.Points).geometry.attributes.position.needsUpdate = true;
    }
    this.movingCart.position.set(112 + 19 * Math.sin(time * 1.3), 0, -38);
    this.movingCart.rotation.y = .20 + .18 * Math.sin(time * 1.2);
    this.convertible.rotation.y = selected === 'depends-convertible' ? -.37 : -.20;

    const groupOrder = [focus, ...range(7).filter(i => i !== focus)];
    for (const [i, id] of DEPENDS_CAST.entries()) {
      const person = this.figures.get(id)!;
      const { figure } = person;
      const slot = groupOrder.indexOf(i);
      const audible = active === i && intensity > .02;
      const supported = active >= 0 && figure.track.message(figure.track.indexAt(time)).t.outRms > .0025;
      figure.root.visible = group || (close && slot < 3) || (portrait >= 0 && i === portrait) || audible;
      person.shadow.visible = figure.root.visible;
      if (!figure.root.visible) continue;
      const angleStep = Math.sin(beat * .5 + slot * .9);
      const lane = slot === 0 ? 0 : (slot % 2 ? -1 : 1) * Math.ceil(slot / 2);
      const spacing = tall ? 49 : 68;
      const flee = mode === 'chase' ? 19 * Math.sin(sinceCut * 1.65 - slot * .47) : 0;
      const entering = selected === 'depends-gather' ? (1 - THREE.MathUtils.smoothstep(time, .45, 5.8)) * lane * 17 : 0;
      const x = portrait >= 0 ? (i === portrait ? -16 : 54) : lane * spacing + flee + entering + angleStep * 6;
      const baseHeight = slot === 0 || close ? 151 : 136;
      const y = baseHeight + Math.abs(Math.sin(beat + slot * .34)) * (group ? 9 : 2);
      const z = portrait >= 0 ? (i === portrait ? 33 : 12) : audible || slot === 0 ? 28 : -19 - Math.abs(lane) * 5;
      figure.root.position.set(x, y, z);
      figure.root.rotation.set(0, angleStep * .13, group ? angleStep * -.055 : 0);
      const scale = portrait >= 0 || slot === 0 ? 1.01 : .88;
      figure.root.scale.setScalar(scale);
      person.shadow.position.set(x + 4, .16, z - 4);
      person.shadow.scale.set(30 * scale, 15.4 * scale, 1);
      person.skirt.visible = [1, 2, 4, 6].includes(i);
      person.cap.visible = i === 5 || (roadSets && i === 6);
      person.scarf.visible = i !== 2 || roadSets;
      person.jacket.visible = roadSets;
      const color = roadSets ? CHASE_COSTUMES[i] : CLOTHES[i].top;
      (figure.torso.material as THREE.MeshStandardMaterial).color.set(color);
      for (const arm of figure.arms) (arm.material as THREE.MeshStandardMaterial).color.set(color);
      this.pose(person, i, time, beat * .5 + slot * .78, mode !== 'card', close || portrait >= 0);
      figure.update(time, playing && (audible || supported), this.camera, dt, reset);
    }

    this.insects.forEach(({ root, wings, feelers }, i) => {
      const pair = i === portrait;
      root.visible = pair || mode === 'insects' || mode === 'chase' || (roadSets && mode !== 'card' && (i + 7 - focus) % 7 < 3);
      if (!root.visible) return;
      const lane = i - 3;
      const drift = time * 2.4 + i * 2.18;
      const flight = selected === 'depends-flight' ? Math.max(0, sinceCut - .48) : 0;
      const parentX = this.figures.get(DEPENDS_CAST[i])!.figure.root.position.x;
      const followX = parentX + 24 * Math.cos(sinceCut * 1.65 - i * .47) + 7 * Math.sin(drift);
      const x = pair ? (tall ? 44 : 70) : mode === 'insects' ? lane * (tall ? 36 : 57) + 12 * Math.sin(drift)
        : mode === 'chase' ? followX : Math.max(-3, Math.min(3, i - focus)) * (tall ? 43 : 62) + 15 + 16 * Math.sin(drift);
      const y = pair ? 152 : mode === 'insects' ? 77 + 37 * (i % 3) + 38 * flight + 9 * Math.sin(drift)
        : 73 + 15 * (i % 3) + 16 * Math.cos(drift + parentX * .016);
      root.position.set(x, y, pair ? -82 : mode === 'insects' ? 0 : 1);
      root.scale.setScalar(pair ? 2.25 : mode === 'insects' ? .53 : .29);
      root.rotation.set(.17 + .12 * Math.cos(drift), .18 * Math.sin(drift * .52),
        pair ? -.39 : .48 * Math.sin(drift * .82));
      wings.forEach((wing, j) => {
        const side = j === 0 ? -1 : 1;
        wing.rotation.y = side * ((pair ? .18 : .44) + (pair ? .19 : .49) * Math.sin(time * (pair ? 11 : 27) + i));
      });
      feelers.rotation.x = .10 * Math.sin(drift * 2);
    });
  }

  dispose() {
    for (const { figure } of this.figures.values()) figure.dispose();
    this.props.dispose();
    this.textures.forEach(map => map.dispose());
    const particles = this.sparks.children[0] as THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
    particles.geometry.dispose();
    particles.material.dispose();
  }
}
