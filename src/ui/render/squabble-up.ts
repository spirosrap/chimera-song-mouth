import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CharacterId, CameraView } from '../../scene/scene.ts';
import type { SquabbleId, SquabbleView } from '../../scene/squabble-up.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type Shot = { aim: Point; from: Point; inset?: boolean };
type Costume = { book: THREE.Group; belt: THREE.Mesh; cap: THREE.Group };
type Dancer = { root: THREE.Group; home: Point; joints: THREE.Mesh[]; skirt: THREE.Mesh; seed: number };
const WIDE: Shot = { aim: [0, 170, -80], from: [0, 189, 691] };
const SHOTS: Record<SquabbleView, Shot> = {
  'squabble-chandelier': { aim: [0, 299, -95], from: [25, 299, 158], inset: true },
  'squabble-nod': { aim: [2, 183, 26], from: [-6, 151, 259] },
  'squabble-two-step': { aim: [0, 145, -20], from: [0, 166, 521] },
  'squabble-crew': WIDE,
  'squabble-cross': { aim: [8, 150, 20], from: [43, 160, 319] },
  'squabble-bikes': { aim: [-70, 139, 6], from: [-100, 160, 391], inset: true },
  'squabble-reader': { aim: [-1, 120, 11], from: [16, 155, 291] },
  'squabble-flags': WIDE,
  'squabble-dancers': { aim: [6, 143, -45], from: [21, 159, 534] },
  'squabble-letters': { aim: [160, 147, -11], from: [150, 164, 300], inset: true },
  'squabble-portraits': { aim: [-192, 145, -35], from: [-200, 160, 317], inset: true },
  'squabble-placard': WIDE,
  'squabble-party': { aim: [11, 140, 24], from: [11, 159, 461] },
  'squabble-crouch': { aim: [-27, 124, 33], from: [-40, 131, 289] },
  'squabble-trike': { aim: [129, 89, -34], from: [117, 117, 253], inset: true },
  'squabble-lowrider': WIDE,
  'squabble-robed': { aim: [118, 140, -52], from: [104, 156, 505], inset: true },
  'squabble-parade': WIDE,
  'squabble-fade': WIDE,
};

const PALETTE = {
  olive: '#85844b', shade: '#6c6d38', gold: '#f2c45d',
  cobalt: '#2053ae', denim: '#a8b2bf', skin: '#a16e56',
  light: '#f9f0d1', floor: '#b1855d',
};
const STAGE_LANES = ['pair', 'crew', 'bikes', 'dancers', 'tableaux', 'party', 'lowrider', 'parade'] as const;
type Lane = typeof STAGE_LANES[number];
const laneAt = (t: number): Lane => {
  if (t < 32.991) return 'pair';
  if (t < 51.468) return 'crew';
  if (t < 65.31) return 'bikes';
  if (t < 86.920) return 'dancers';
  if (t < 106.69) return 'tableaux';
  if (t < 124.31) return 'party';
  if (t < 144.02) return 'lowrider';
  return 'parade';
};
const wobble = (n: number) => {
  const a = Math.sin(78.23 + n * 1.7529) * 34827.23;
  return a - Math.floor(a);
};

export class SquabbleUpStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 3000);
  readonly props = new VideoProps();
  readonly room = new THREE.Group();
  readonly chandelier = new THREE.Group();
  readonly roadSign = new THREE.Group();
  private readonly reachingArm = new THREE.Group();
  readonly placard = new THREE.Group();
  readonly letters = new THREE.Group();
  readonly sedan = new THREE.Group();
  readonly trike = new THREE.Group();
  readonly banner = new THREE.Group();
  readonly figures: Record<SquabbleId, VideoFigure>;
  readonly lanes: Record<Lane, THREE.Group> = {
    pair: new THREE.Group(), crew: new THREE.Group(), bikes: new THREE.Group(), dancers: new THREE.Group(),
    tableaux: new THREE.Group(), party: new THREE.Group(), lowrider: new THREE.Group(), parade: new THREE.Group(),
  };
  private readonly textures: THREE.Texture[] = [];
  private readonly costumes = new Map<VideoFigure, Costume>();
  private readonly dancers = new Map<Lane, Dancer[]>();
  private readonly wheels: THREE.Group[] = [];
  private readonly balloons = new THREE.Group();
  private previous = -1;
  private epoch = -1;

  constructor(lead: Actor, hook: Actor, sample: Actor) {
    this.scene.background = new THREE.Color('#88804e');
    this.scene.fog = new THREE.Fog('#877d49', 800, 1760);
    this.scene.add(this.room);
    this.room.add(...Object.values(this.lanes));
    this.buildRoom();
    this.buildChandelier();
    this.buildProps();
    this.buildCast();
    this.figures = {
      'squabble-lead': this.figure(lead),
      'squabble-hook': this.figure(hook),
      'squabble-sample': this.figure(sample),
    };
    this.frame(0, false, 0, 'squabble-chandelier', 0);
  }

  private box(group: THREE.Object3D, at: Point, size: Point, color: string) {
    const mesh = this.props.box(group, ...size, color, at);
    const swatch = new THREE.Color(color);
    const colors: number[] = [];
    for (const light of [.76, .71, 1.15, .58, 1, .73]) {
      for (let n = 0; n < 4; n++) colors.push(swatch.r * light, swatch.g * light, swatch.b * light);
    }
    mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.color.set('#fff');
    material.vertexColors = true;
    return mesh;
  }

  private print(group: THREE.Object3D, at: Point, size: [number, number], lines: readonly string[], ink: string, plain = false) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 780;
    canvas.height = 340;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = ink;
    ctx.font = `${plain ? '600 67px monospace' : 'bold 75px sans-serif'}`;
    const leading = Math.min(82, 300 / lines.length);
    lines.forEach((line, n) => ctx.fillText(line, 390, 170 + (n - (lines.length - 1) / 2) * leading, 741));
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    const plane = this.props.mesh(group, new THREE.PlaneGeometry(...size), at, '#ffffff');
    const mat = plane.material as THREE.MeshBasicMaterial;
    mat.map = texture;
    mat.transparent = true;
    mat.depthWrite = false;
    plane.renderOrder = 6;
  }

  private buildRoom() {
    const g = this.room;
    this.box(g, [0, -9, 32], [989, 17, 1220], PALETTE.floor);
    this.box(g, [0, 207, -235], [979, 416, 20], PALETTE.olive);
    for (const side of [-1, 1]) {
      this.box(g, [side * 487, 207, 19], [15, 416, 521], '#767745');
      this.box(g, [side * 477, 17, 18], [8, 25, 505], PALETTE.shade);
      for (let i = 0; i < 5; i++) {
        const z = -173 + i * 88;
        this.box(g, [side * 473, 87, z], [2.6, 122, 76], '#737442');
        this.box(g, [side * 470, 86, z], [2.8, 112, 65], '#85834b');
      }
      this.box(g, [side * 473, 151, 15], [7, 7, 510], '#919358');
    }
    this.box(g, [0, 418, 22], [987, 17, 515], '#b79d78');
    this.box(g, [0, 152, -216], [965, 10, 9], '#97945a');
    this.box(g, [0, 18, -216], [964, 11, 10], PALETTE.shade);
    for (let i = -4; i <= 4; i++) {
      const x = i * 104;
      this.box(g, [x, 84, -220], [94, 116, 3.2], PALETTE.shade);
      this.box(g, [x, 84, -218], [87, 109, 4], '#97965a');
      this.box(g, [x, 84, -214], [77, 100, 2.4], '#82834b');
      this.box(g, [x, 31, -213], [79, 1.1, 2], '#b2a565');
    }
    for (let i = 0; i < 31; i++) {
      const z = -214 + i * 20;
      for (let j = -2; j <= 2; j++) {
        const tint = ['#b58e65', '#b38760', '#ae835c', '#b99167'][Math.floor(wobble(i * 6 + j) * 4)];
        this.box(g, [j * 195 + (i % 2 ? 5 : -5), .8, z], [194, 1.2, 19.7], tint);
      }
    }
    this.room.add(this.roadSign);
    this.roadSign.position.set(215, 327, -206);
    this.box(this.roadSign, [0, 0, 0], [260, 76, 10], '#34495a');
    this.box(this.roadSign, [0, 0, 7], [248, 66, 4], '#36564e');
    this.print(this.roadSign, [0, 1, 10], [235, 57], ['Central Ave', 'Compton Ave', 'Long Beach Blvd'], '#e2e8d6', true);
  }

  private buildChandelier() {
    this.room.add(this.chandelier);
    this.chandelier.position.set(0, 301, -94);
    const g = this.chandelier;
    this.props.tube(g, [0, 51, 0], [0, 113, 0], 2, '#ad925c');
    this.props.oval(g, [0, 112, 0], [11, 2.7, 11], '#bfaa78');
    for (let ring = 0; ring < 5; ring++) {
      const radius = 36 - ring * 6.5;
      const y = 45 - ring * 13.8;
      const rim = this.props.mesh(g, new THREE.TorusGeometry(radius, 1.45, 8, 40), [0, y, 0], '#d6c597');
      rim.rotation.x = Math.PI / 2;
      const drops = 22 - 3 * ring;
      for (let i = 0; i < drops; i++) {
        const angle = i * Math.PI * 2 / drops + ring * .35;
        const glass = this.props.mesh(g, new THREE.OctahedronGeometry(1), [radius * Math.cos(angle), y - 10, radius * Math.sin(angle)], i % 4 === 0 ? '#c8bb9c' : '#fff3d5');
        glass.scale.set(1.9, 9 + wobble(i + ring) * 5, 1.9);
        if (i % 2 === 0) this.props.oval(g, [glass.position.x, y + 1, glass.position.z], [1.7, 2.3, 1.7], '#fff1c6');
      }
    }
    const drop = this.props.mesh(g, new THREE.IcosahedronGeometry(1, 0), [0, -35, 0], '#fff1c3');
    drop.scale.set(4, 6.4, 4);

    this.room.add(this.reachingArm);
    this.props.tube(this.reachingArm, [134, -20, 5], [63, -3, 4], 11, '#353337');
    this.props.tube(this.reachingArm, [70, -6, 4], [16, 6, 4], 6, '#ad795b');
    this.props.oval(this.reachingArm, [12, 8, 4], [11, 5.5, 4.1], '#b48063');
    for (let n = 0; n < 4; n++) {
      this.props.tube(this.reachingArm, [8, 5 + n * 2.1, 3], [-2 - n % 2 * 2, 7 + n * 2.1, 4], 1.7, '#bd8665');
    }
  }

  private wheel(g: THREE.Object3D, at: Point, radius: number, width: number) {
    const wheel = new THREE.Group();
    wheel.position.set(...at);
    g.add(wheel);
    this.props.mesh(wheel, new THREE.TorusGeometry(radius * .86, width, 8, 32), [0, 0, 0], '#222634');
    this.props.mesh(wheel, new THREE.TorusGeometry(radius * .79, 1.15, 6, 28), [0, 0, 1], '#dec49a');
    for (let n = 0; n < 8; n++) {
      const a = Math.PI * n / 4;
      this.props.tube(wheel, [0, 0, .8], [radius * .78 * Math.cos(a), radius * .78 * Math.sin(a), .8], .75, '#b9b7a8');
    }
    this.props.oval(wheel, [0, 0, width], [radius * .24, radius * .24, 2], '#d5b96f');
    this.wheels.push(wheel);
  }

  private bicycle(g: THREE.Object3D, x: number, z: number, color: string, angle: number) {
    const frame = new THREE.Group();
    g.add(frame);
    frame.position.set(x, 0, z);
    frame.rotation.y = angle;
    this.wheel(frame, [-33, 18, 0], 18.5, 2.2);
    this.wheel(frame, [38, 18, 0], 18.5, 2.2);
    const points: Point[] = [[-33, 18, 0], [-19, 45, 0], [27, 46, 0], [2, 19, 0], [-33, 18, 0], [-19, 45, 0], [2, 19, 0], [27, 46, 0], [38, 18, 0]];
    for (let i = 1; i < points.length; i++) this.props.tube(frame, points[i - 1], points[i], 1.45, color);
    this.props.tube(frame, [27, 46, 0], [28, 59, 0], 1.5, '#bcbbb0');
    this.props.tube(frame, [27, 58, -9], [27, 58, 9], 1.3, '#bcbbb0');
    this.box(frame, [-20, 48, 0], [13, 3, 7], '#333338');
  }

  private buildProps() {
    const bikes = this.lanes.bikes;
    this.bicycle(bikes, -188, -45, '#9ea74d', -.21);
    this.bicycle(bikes, 182, -50, '#e1c655', .22);
    for (const side of [-1, 1]) {
      const flag = new THREE.Group();
      flag.position.set(side * 329, 278, -145);
      flag.rotation.z = side * -.44;
      bikes.add(flag);
      this.props.tube(flag, [0, -51, -20], [0, 71, 12], 2.2, '#3c4141');
      for (let n = 0; n < 8; n++) this.box(flag, [side * 28, 54 - n * 8, 12], [55, 8.1, 2.5], n % 2 ? '#263031' : '#a9433e');
      this.box(flag, [side * 13, 43, 14], [28, 29, 1], '#37624e');
      for (let n = 0; n < 14; n++) this.props.oval(flag, [side * (4 + n % 4 * 6), 33 + Math.floor(n / 4) * 6, 15], [1, 1, .6], '#a4ae80');
    }
    this.balloons.position.set(82, 120, -52);
    bikes.add(this.balloons);
    for (const [n, color] of ['#a5dcd9', '#f5c3af'].entries()) {
      const x = n * 24 - 10;
      this.props.oval(this.balloons, [x, 89 - 33 * n, 5], [13, 16, 11], color);
      this.props.tube(this.balloons, [x, 76 - 33 * n, 5], [x - 10, 2, 5], .46, '#c8b5af');
    }
    this.box(bikes, [0, 67, 25], [53, 10, 35], '#d9c7b1');
    for (const x of [-18, 18]) this.box(bikes, [x, 34, 25], [5, 66, 25], '#b4aa9e');

    const groups = this.lanes.tableaux;
    groups.add(this.letters, this.placard);
    this.letters.position.set(213, 108, -40);
    this.box(this.letters, [0, 0, 0], [128, 181, 18], '#c7c9b7');
    this.box(this.letters, [0, 7, 12], [111, 133, 5], '#39433d');
    this.print(this.letters, [0, 9, 15], [105, 129], ['M  N   I    E S T', 'T A    L Q I', 'E   D A    O', 'I E  R  N  T W'], '#f2ecd8', true);
    for (const edge of [-1, 1]) {
      this.props.tube(this.letters, [edge * 48, -83, 3], [edge * 48, -104, 14], 4, '#c3b8a5');
    }
    this.box(groups, [-221, 98, -57], [217, 194, 14], '#d5a4a4');
    for (let n = 0; n < 33; n++) {
      const x = -317 + wobble(n) * 184;
      const y = 24 + wobble(n + 90) * 158;
      const tint = n % 3 ? '#debbbb' : '#d18b91';
      this.props.oval(groups, [x - 4, y + 3, -46], [5.8, 5, 1], tint);
      this.props.oval(groups, [x + 4, y + 3, -46], [5.8, 5, 1], tint);
      this.props.mesh(groups, new THREE.CircleGeometry(6.5, 3), [x, y - 2, -44], tint).rotation.z = Math.PI;
    }
    this.placard.position.set(9, 121, 48);
    this.box(this.placard, [0, 0, 0], [120, 72, 4], '#eee0b8');
    this.print(this.placard, [0, 0, 2.5], [116, 69], ['JESUS', 'SAVES', 'GANGSTERS', 'TOO!'], '#7d5044');

    const party = this.lanes.party;
    party.add(this.trike);
    this.trike.position.set(153, 0, 18);
    this.wheel(this.trike, [29, 15, 0], 16, 3.8);
    this.wheel(this.trike, [-25, 11, 0], 11, 4.1);
    this.box(this.trike, [0, 17, 0], [52, 9, 22], '#dc784a');
    this.box(this.trike, [-10, 33, 0], [23, 6, 14], '#302e36');
    this.props.tube(this.trike, [26, 17, 0], [24, 47, 0], 2.1, '#8497a0');
    this.props.tube(this.trike, [24, 47, -10], [24, 47, 10], 1.9, '#8497a0');
    for (let i = 0; i < 17; i++) {
      const x = -163 + i % 10 * 14;
      const z = 128 + Math.floor(i / 10) * 10;
      const h = 8 + wobble(i + 30) * 22;
      const colors = ['#e3cab0', '#7796a1', '#b58c51', '#b45341'];
      this.props.mesh(party, new THREE.CylinderGeometry(3.3, 3.3, h, 10), [x, h / 2, z], colors[i % colors.length]);
      this.props.oval(party, [x, h + 1, z], [3.3, 1.1, 3.3], '#d5c8a7');
    }

    this.lanes.lowrider.add(this.sedan);
    this.sedan.position.set(-88, 0, -69);
    this.box(this.sedan, [0, 47, 2], [318, 50, 106], '#bc9161');
    this.box(this.sedan, [0, 63, 2], [325, 9, 112], '#ddad6e');
    this.box(this.sedan, [-22, 88, -2], [164, 41, 95], '#e6b984');
    this.box(this.sedan, [-20, 87, 48], [150, 27, 5], '#586877');
    for (const x of [-89, -26, 43]) this.box(this.sedan, [x, 87, 52], [4, 30, 4], '#d7ac75');
    this.box(this.sedan, [0, 38, 58], [288, 4, 5], '#d7d6b9');
    this.box(this.sedan, [159, 49, 0], [6, 14, 70], '#b2b0a9');
    this.box(this.sedan, [-156, 52, 56], [18, 10, 5], '#a54d3c');
    this.box(this.sedan, [151, 53, 56], [18, 12, 5], '#f6e1b5');
    for (const x of [-102, 107]) {
      this.wheel(this.sedan, [x, 25, 56], 25, 6.6);
      this.wheel(this.sedan, [x, 25, -56], 25, 6.6);
    }

    this.lanes.parade.add(this.banner);
    this.banner.position.set(-207, 318, -208);
    this.box(this.banner, [0, 0, 0], [257, 81, 4], '#d9c6a2');
    this.print(this.banner, [0, 0, 3], [243, 76], ['COMPTON', 'CHRISTMAS', 'PARADE'], '#90433d');
    this.box(this.lanes.parade, [103, 39, 10], [58, 71, 5], '#b69b6e');
    this.box(this.lanes.parade, [103, 39, 14], [50, 62, 2], '#d7bd9e');
    this.props.mesh(this.lanes.parade, new THREE.CircleGeometry(15, 12), [103, 45, 16], '#b86848');
  }

  private makeDancer(lane: Lane, position: Point, scale: number, top: string, trousers: string, withSkirt = false) {
    const root = new THREE.Group();
    root.scale.setScalar(scale);
    root.position.set(...position);
    this.lanes[lane].add(root);
    const seed = (this.dancers.get(lane)?.length ?? 0) + position[0] / 25;
    const skin = ['#966346', '#b78562', '#765447', '#ad6f4e'][Math.floor(wobble(seed + 31) * 4)];
    this.props.oval(root, [0, 141, 0], [12, 17, 10], skin);
    this.props.oval(root, [0, 147, -6], [12.6, 11.8, 8], '#322c2c');
    const body = this.props.mesh(root, new THREE.CylinderGeometry(19, 17, 50, 16), [0, 100, 0], top);
    body.scale.z = .62;
    const skirt = this.props.mesh(root, new THREE.CylinderGeometry(16, 28, 29, 14), [0, 65, -1], trousers);
    skirt.scale.z = .70;
    skirt.visible = withSkirt;
    const joints: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      joints.push(this.props.tube(root, [side * 16, 116, 0], [side * 25, 96, 6], 4.6, top));
      joints.push(this.props.tube(root, [side * 25, 96, 6], [side * 22, 76, 9], 3.9, skin));
      joints.push(this.props.tube(root, [side * 9, 76, 0], [side * 12, 40, 2], 5.9, withSkirt ? skin : trousers));
      joints.push(this.props.tube(root, [side * 12, 40, 2], [side * 12, 6, 4], 4.8, withSkirt ? skin : trousers));
      this.props.oval(root, [side * 12, 5, 9], [6, 3, 10], '#d5ccc0');
    }
    const people = this.dancers.get(lane) ?? [];
    people.push({ root, home: position, joints, skirt, seed });
    this.dancers.set(lane, people);
    return root;
  }

  private buildCast() {
    const first = this.makeDancer('pair', [-214, 0, 12], 1.13, '#785b46', '#f4e5d0', true);
    this.props.oval(first, [1, 157, 2], [5, 5, 4], '#a94d48');
    const clothes = ['#333539', '#a74743', '#4b5260', '#b2b6ad', '#53645c', '#4d4548'];
    for (const lane of ['crew', 'bikes', 'dancers', 'tableaux', 'party', 'lowrider'] as const) {
      const count = lane === 'crew' || lane === 'party' ? 8 : lane === 'tableaux' ? 7 : 4;
      for (let i = 0; i < count; i++) {
        const side = i % 2 ? 1 : -1;
        const x = side * (95 + Math.floor(i / 2) * 60);
        const color = lane === 'lowrider' ? '#ede7d4' : lane === 'dancers' && i < 2 ? '#c6a549' : clothes[i % clothes.length];
        const home: Point = lane === 'tableaux' && i < 5
          ? [-289 + i % 3 * 53, 0, i < 3 ? -37 : 10]
          : [x, 0, -9 - Math.floor(i / 2) * 32];
        const dancer = this.makeDancer(lane, home, .92 + wobble(i + x) * .25, color, lane === 'lowrider' ? '#a8a6aa' : '#44414a', lane === 'tableaux' && i < 5);
        if (lane === 'dancers' && i < 2) {
          for (let k = 0; k < 3; k++) this.box(dancer, [0, 87 + k * 12, 12], [32, 5, 2], k % 2 ? '#703742' : '#374d41');
        }
      }
    }
    const robe = this.makeDancer('parade', [216, 0, 26], 1.13, '#735348', '#775e53');
    this.box(robe, [0, 65, 0], [52, 137, 27], '#94725a');
    for (const x of [-20, -13, -6, 3, 11, 19]) this.box(robe, [x, 68, 14], [2.5, 135, 2], '#c39b77');
    const memorial = this.makeDancer('parade', [-184, 5, -1], .78, '#303038', '#3c424a');
    memorial.rotation.z = 1.25;
  }

  private figure(actor: Actor) {
    const f = new VideoFigure(actor.model, actor.track, this.props, this.room, PALETTE.cobalt, PALETTE.skin);
    f.head.scene.scale.setScalar(2.17);
    const hood = this.props.oval(f.root, [0, -8, -14], [21, 18, 14], '#294889');
    hood.rotation.x = .24;
    const cap = new THREE.Group();
    cap.position.set(0, 22, -4);
    f.root.add(cap);
    const crown = this.props.mesh(cap, new THREE.SphereGeometry(17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), [0, 0, 0], PALETTE.cobalt);
    crown.scale.y = .59;
    this.props.oval(cap, [-14, .8, 0], [16, 2.2, 11], '#2d60ad');
    this.props.oval(cap, [2, 8, 0], [2, 2, 2], '#5378be');
    const belt = this.props.oval(f.root, [0, -67, 13.8], [11, 4.5, 3.6], PALETTE.gold);
    for (const limb of [...f.legs, ...f.feet]) (limb.material as THREE.MeshBasicMaterial).color.set(limb.geometry.type === 'SphereGeometry' ? '#334c87' : PALETTE.denim);
    const book = new THREE.Group();
    f.root.add(book);
    for (const side of [-1, 1]) {
      book.add(new THREE.Group());
      const cover = book.children.at(-1)!;
      cover.position.x = side * 8;
      cover.rotation.y = side * -.35;
      this.box(cover, [0, 0, 0], [15, 20, 1.4], '#283e68');
      this.box(cover, [0, 0, -1.1], [14, 19, .8], '#e9ddc4');
      if (side < 0) this.print(cover, [0, 1, 1.05], [14, 15], ['HOW TO BE', 'MORE LIKE', 'KENDRICK'], '#e2bd67');
      else for (let n = 0; n < 4; n++) this.box(cover, [0, 4 - n * 2.5, 1], [10 - n, .4, .2], '#d8b467');
    }
    this.costumes.set(f, { book, cap, belt });
    return f;
  }

  private dance(lane: Lane, phase: number) {
    for (const [i, dancer] of (this.dancers.get(lane) ?? []).entries()) {
      const t = phase + dancer.seed * .74;
      const lift = Math.sin(t * 2) * .5 + .5;
      dancer.root.position.set(dancer.home[0] + 17 * Math.sin(t * .5), dancer.home[1] + 5 * lift, dancer.home[2] + Math.cos(t) * 12);
      if (lane !== 'parade') dancer.root.rotation.z = Math.sin(t) * .09;
      dancer.root.rotation.y = Math.sin(t * .5) * .28;
      dancer.skirt.rotation.z = Math.sin(t) * .09;
      for (const [j, side] of [-1, 1].entries()) {
        const f = j * 4;
        const elbow: Point = [side * (25 + 9 * Math.cos(t)), 105 + Math.sin(t + side) * 23, 9];
        const hand: Point = lane === 'parade' && i === 0 ? [side * 49, 112, 1]
          : [side * (31 + 10 * Math.sin(t * .7)), 90 + Math.cos(t + side * .6) * 38, 17];
        const knee: Point = [side * (12 + 9 * Math.sin(t)), 42 + 5 * lift, 5 + side * 11 * Math.sin(t)];
        this.props.segment(dancer.joints[f], [side * 16, 116, 0], elbow, 4.6);
        this.props.segment(dancer.joints[f + 1], elbow, hand, 3.9);
        this.props.segment(dancer.joints[f + 2], [side * 9, 75, 0], knee, 5.7);
        this.props.segment(dancer.joints[f + 3], knee, [side * 12, 6, 4], 4.8);
      }
    }
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

    const lane = laneAt(t);
    const focused = speaker && Object.hasOwn(this.figures, speaker) ? speaker as SquabbleId : 'squabble-lead';
    const main = Object.hasOwn(this.figures, view) ? view as SquabbleId : focused;
    const autoShot = Object.hasOwn(SHOTS, view) ? SHOTS[view as SquabbleView] : WIDE;
    const fade = view === 'squabble-fade';
    this.room.visible = !fade;
    (this.scene.background as THREE.Color).set(fade ? '#16141b' : '#877c49');
    for (const id of STAGE_LANES) this.lanes[id].visible = id === lane;
    this.roadSign.visible = t < 32.991 && view !== 'squabble-chandelier';
    const beat = 2 * Math.PI * (104 / 60) * t;
    this.chandelier.rotation.z = Math.sin(beat * .14) * (t < 5 ? .039 : .014);
    this.chandelier.rotation.y = .06 * Math.sin(beat * .12);
    this.reachingArm.visible = view === 'squabble-chandelier' && t > 2.4 && t < 4.73;
    const reach = Math.sin(Math.PI * THREE.MathUtils.clamp((t - 2.4) / 2.33, 0, 1));
    this.reachingArm.position.set(122 - 99 * reach, 302 - 10 * reach, -73);
    this.balloons.rotation.z = Math.sin(beat * .18) * .08;
    this.sedan.position.y = 2.6 + Math.sin(beat) * 3.3;
    this.sedan.rotation.z = .037 * Math.sin(beat + .4);
    this.trike.position.x = 147 + Math.sin(beat * .25) * 20;
    this.trike.rotation.y = .15 + Math.sin(beat * .23) * .23;
    this.banner.visible = t >= 155.53;
    this.banner.position.y = 318 - 22 * (1 - THREE.MathUtils.smoothstep(t, 155.53, 158.65));
    for (const wheel of this.wheels) wheel.rotation.z = .23 * beat;
    this.dance(lane, beat);

    const soft = lane === 'bikes' || (lane === 'party' && t > 117.4);
    const position: Point = [lane === 'parade' ? -66 : lane === 'party' && soft ? -44 : 4,
      soft ? 136 : 176, soft ? 44 : 38];
    const hip = 10 * Math.sin(beat * .55);
    const energy = Math.max(.23, intensity);
    const right = 12 * Math.cos(beat * .5);
    const current = this.figures[main];
    const costume = this.costumes.get(current)!;
    for (const f of Object.values(this.figures)) f.root.visible = f === current && !fade && (t >= 4.25 || intensity > .03);
    current.root.position.set(position[0] + hip, position[1] + 3 * Math.sin(beat), position[2]);
    current.root.scale.setScalar(1.19);
    const reading = lane === 'bikes' && t >= 52 && t < 65.31;
    const sign = lane === 'tableaux' && view === 'squabble-placard';
    const hands: [Point, Point, Point, Point] = reading
      ? [[-30, -31, 12], [-13, -40, 29], [27, -26, 13], [13, -39, 29]]
      : [[-31, -30, 6], [-30 - right * energy, -46 + Math.sin(beat) * 18 * energy, 18],
        [28, -28, 8], [32 + right * energy, -31 + Math.sin(beat + .8) * 21 * energy, 21]];
    current.pose(t, hands, soft);
    current.head.scene.rotation.x = -.04 * Math.sin(beat) - (reading ? .12 : 0);
    current.head.scene.rotation.y -= .20 * Math.sin(beat * .4);
    current.head.scene.rotation.z = .04 * Math.sin(beat * .75);
    costume.book.visible = reading;
    costume.book.position.set(0, -35.5, 30);
    costume.book.rotation.x = -.39;
    costume.cap.rotation.y = .23 + Math.sin(beat * .25) * .13;
    costume.belt.visible = !reading;
    this.placard.visible = sign;
    this.placard.position.x = current.root.position.x;
    this.placard.position.y = 110 + 1.3 * Math.sin(beat);
    this.placard.position.z = 63;

    const aim = new THREE.Vector3(...autoShot.aim);
    const camera = new THREE.Vector3(...autoShot.from);
    const singer = new THREE.Vector3(...position).add(new THREE.Vector3(0, -13, 0));
    const portrait = this.camera.aspect < 1.09;
    if ((autoShot.inset && intensity > .05) || portrait && current.root.visible) {
      const weight = portrait ? .94 : .79;
      aim.lerp(singer, weight);
      camera.x = THREE.MathUtils.lerp(camera.x, position[0], weight * .82);
    }
    if (portrait && camera.z > 500 && current.root.visible) camera.z -= 86;
    this.camera.position.copy(camera);
    this.camera.lookAt(aim);
    this.camera.updateMatrixWorld(true);
    if (current.root.visible) {
      this.room.updateMatrixWorld(true);
      current.update(t, playing, this.camera, dt, reset);
    }
  }

  dispose() {
    for (const f of Object.values(this.figures)) f.dispose();
    for (const texture of this.textures) texture.dispose();
    this.props.dispose();
  }
}
