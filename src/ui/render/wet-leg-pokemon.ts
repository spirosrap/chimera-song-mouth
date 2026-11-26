import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { EGG_CRACK_AT, EGG_HATCH_AT, POKEMON_SHOTS, type PokemonView } from '../../scene/wet-leg-pokemon.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type SetName = 'living' | 'drive' | 'garden' | 'road' | 'cabin';
type Shot = { set: SetName; target: Point; from: Point; egg?: Point; person?: Point };
type Crew = { root: THREE.Group; arms: [THREE.Mesh, THREE.Mesh]; hands: [THREE.Mesh, THREE.Mesh] };

const ROOM_EGG: Point = [-68, 104, 4];
const ROOM_PERSON: Point = [66, 142, 49];
const CAR_EGG: Point = [24, 109, -1];
const CAR_PERSON: Point = [-52, 109, 17];
const GARDEN_EGG: Point = [82, 93, 4];
const GARDEN_PERSON: Point = [-70, 148, 53];
const ROAD_EGG: Point = [0, 65, 7];
const SHOTS: Record<PokemonView, Shot> = {
  'pokemon-chair': { set: 'living', target: [-12, 121, 7], from: [-5, 129, 426], egg: ROOM_EGG, person: ROOM_PERSON },
  'pokemon-breakfast': { set: 'living', target: [35, 127, 8], from: [74, 147, 338], egg: ROOM_EGG, person: ROOM_PERSON },
  'pokemon-window': { set: 'living', target: [48, 136, 9], from: [17, 159, 334], egg: ROOM_EGG, person: ROOM_PERSON },
  'pokemon-shell': { set: 'living', target: [-63, 113, 9], from: [-60, 134, 312], egg: ROOM_EGG },
  'pokemon-day-drive': { set: 'drive', target: [0, 113, 2], from: [5, 137, 447], egg: CAR_EGG, person: CAR_PERSON },
  'pokemon-goggles': { set: 'drive', target: [-35, 113, 39], from: [-29, 118, 282], egg: CAR_EGG, person: CAR_PERSON },
  'pokemon-studio': { set: 'drive', target: [0, 108, -42], from: [18, 166, 526], egg: CAR_EGG, person: CAR_PERSON },
  'pokemon-picnic': { set: 'garden', target: [0, 106, 4], from: [2, 142, 460], egg: GARDEN_EGG, person: GARDEN_PERSON },
  'pokemon-grill': { set: 'garden', target: [-59, 137, 2], from: [-25, 153, 340], egg: GARDEN_EGG, person: GARDEN_PERSON },
  'pokemon-treadmill': { set: 'garden', target: [0, 116, 8], from: [4, 133, 409], egg: [58, 91, 16], person: GARDEN_PERSON },
  'pokemon-neighbours': { set: 'garden', target: [3, 131, -8], from: [2, 163, 451], egg: [58, 91, 16], person: GARDEN_PERSON },
  'pokemon-night-drive': { set: 'drive', target: [2, 108, 5], from: [6, 132, 441], egg: CAR_EGG, person: CAR_PERSON },
  'pokemon-crack': { set: 'drive', target: [-8, 119, 11], from: [-3, 133, 308], egg: CAR_EGG, person: CAR_PERSON },
  'pokemon-lift': { set: 'road', target: [0, 115, -10], from: [8, 153, 466], egg: ROAD_EGG },
  'pokemon-road': { set: 'road', target: [0, 96, -8], from: [6, 139, 412], egg: ROAD_EGG },
  'pokemon-hatch': { set: 'road', target: [0, 90, 8], from: [6, 126, 413], egg: ROAD_EGG, person: [0, 83, 49] },
  'pokemon-hatchling': { set: 'road', target: [0, 126, 15], from: [-5, 142, 322], egg: ROAD_EGG, person: [0, 141, 55] },
  'pokemon-road-crew': { set: 'road', target: [0, 108, 6], from: [1, 151, 467], egg: ROAD_EGG, person: [0, 147, 56] },
  'pokemon-mirror': { set: 'cabin', target: [0, 126, 14], from: [2, 149, 359], person: [-64, 124, 59] },
  'pokemon-hands': { set: 'cabin', target: [0, 105, 17], from: [1, 147, 406], person: [-64, 124, 59] },
};
const IVORY = '#fff1d9';
const SOFT_PINK = '#e7b7b2';
const VINYL = '#245247';
const HAIR = '#2b1d2c';
const ROAD = '#302032';
const DUSK = '#542b6b';
const HANDS: [Point, Point, Point, Point] = [[-28, -29, 6], [-30, -51, 18], [27, -30, 7], [29, -41, 22]];

function noise(seed: number) {
  const v = Math.sin(seed * 287.09 + 119.2) * 38771.47;
  return v - Math.floor(v);
}

function shellCut(phi: number) {
  const teeth = Math.asin(Math.sin(phi * 9)) * .063;
  return Math.PI * .56 + teeth + .087 * Math.sin(phi * 4 + .32) + .041 * Math.cos(phi * 13);
}

function shellPoint(theta: number, phi: number, shrink = 1): Point {
  const radius = 48 * Math.sin(theta) * (1 - .20 * Math.cos(theta)) * shrink;
  return [radius * Math.cos(phi), 61 * Math.cos(theta) * shrink, .89 * radius * Math.sin(phi)];
}

/** Both surfaces share the same jagged seam, from the intact egg through the split. */
function shellGeometry(upper: boolean) {
  const rings = 20;
  const slices = 144;
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= rings; row++) for (let j = 0; j <= slices; j++) {
    const phi = j * Math.PI * 2 / slices;
    const seam = shellCut(phi);
    const theta = upper ? THREE.MathUtils.lerp(.0005, seam, row / rings)
      : THREE.MathUtils.lerp(seam, Math.PI - .0005, row / rings);
    vertices.push(...shellPoint(theta, phi));
    const sin = Math.sin(theta), cos = Math.cos(theta);
    const slope = 48 * (cos * (1 - .20 * cos) + .20 * sin ** 2);
    // Match the normals at the seam before the two shells separate.
    const n = new THREE.Vector3(.89 * 61 * sin * Math.cos(phi), .89 * slope, 61 * sin * Math.sin(phi)).normalize();
    normals.push(n.x, n.y, n.z);
    if (row < rings && j < slices) {
      const a = row * (slices + 1) + j;
      const b = a + slices + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

export class PokemonStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(39, 1, 1, 2100);
  readonly props = new VideoProps();
  readonly sets = new Map<SetName, THREE.Group>();
  readonly lead: VideoFigure;
  readonly hatchling: VideoFigure;
  readonly egg = new THREE.Group();
  readonly upperShell: THREE.Mesh;
  readonly lowerShell: THREE.Mesh;
  readonly crack: THREE.Group;
  private readonly singerAccessories = new Map<VideoFigure, { goggles: THREE.Group; book: THREE.Group }>();
  private readonly textures: THREE.Texture[] = [];
  private readonly filmCrew: THREE.Group[] = [];
  private readonly neighbours = new THREE.Group();
  private readonly treadmill = new THREE.Group();
  private readonly stroller = new THREE.Group();
  private readonly duskPanel = new THREE.Group();
  private readonly daylightPanel = new THREE.Group();
  private readonly inset = new THREE.Group();
  private readonly carryCrew: Crew[] = [];
  private readonly wheelHubs: THREE.Mesh[] = [];
  private readonly filmCar = new THREE.Group();
  private readonly smoke: THREE.Mesh[] = [];
  private readonly joinedHands = new THREE.Group();
  private epoch = -1;
  private previous = -1;

  constructor(actor: Actor) {
    this.scene.background = new THREE.Color('#211a2b');
    const lamp = new THREE.DirectionalLight('#fff3df', 2.1);
    lamp.position.set(-129, 242, 175);
    const rim = new THREE.DirectionalLight('#f1c6f2', 1.15);
    rim.position.set(123, 162, -111);
    this.scene.add(lamp, rim, new THREE.HemisphereLight('#ffe7d4', '#52506e', 1.6), this.egg, this.inset);
    for (const { set } of Object.values(SHOTS)) {
      if (this.sets.has(set)) continue;
      const group = new THREE.Group();
      group.name = set;
      this.sets.set(set, group);
      this.scene.add(group);
    }
    const p = this.props;
    this.upperShell = p.mesh(this.egg, shellGeometry(true), [0, 0, 0], IVORY);
    this.lowerShell = p.mesh(this.egg, shellGeometry(false), [0, 0, 0], IVORY);
    for (const mesh of [this.upperShell, this.lowerShell]) {
      if (mesh.material instanceof THREE.Material) mesh.material.dispose();
      mesh.material = new THREE.MeshStandardMaterial({
        color: '#f7f2e5', roughness: .61, side: THREE.DoubleSide, emissive: '#c8c5b5', emissiveIntensity: .32,
      });
    }
    const line = p.ink(this.egg);
    const edge = Array.from({ length: 145 }, (_, j) => {
      const phi = j * Math.PI * 2 / 144;
      return shellPoint(shellCut(phi), phi, 1.006);
    });
    line.begin();
    p.line(line, edge, '#422e3f', 1.7, true);
    line.end();
    this.crack = line.group;
    p.box(this.inset, 70, 87, 1, '#22162d', [0, -19, -20]);
    p.box(this.inset, 70, 2.1, 1, '#dc9894', [0, 26, -18]);
    this.lead = this.makeSinger(actor, false);
    this.hatchling = this.makeSinger(actor, true);
    this.buildLiving();
    this.buildDrive();
    this.buildGarden();
    this.buildRoad();
    this.buildCabin();
  }

  private set(name: SetName) { return this.sets.get(name)!; }

  private shade(mesh: THREE.Mesh, glow = .11) {
    const old = mesh.material;
    if (!(old instanceof THREE.MeshBasicMaterial) || old.transparent) return;
    mesh.material = new THREE.MeshStandardMaterial({
      color: old.color, side: old.side, roughness: .77, emissive: old.color, emissiveIntensity: glow,
    });
    old.dispose();
  }

  private backdrop(g: THREE.Object3D, at: Point, size: [number, number], colors: string[], clouds = false) {
    const p = this.props;
    const plane = p.mesh(g, new THREE.PlaneGeometry(...size), at, colors[0]);
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    colors.forEach((color, i) => gradient.addColorStop(i / (colors.length - 1), color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (clouds) {
      for (let n = 0; n < 43; n++) {
        const x = noise(n * 5.4) * 768;
        const y = 55 + noise(n * 3.7) * 227;
        const w = 24 + noise(n) * 104;
        const c = ctx.createRadialGradient(x, y, 0, x, y, w);
        c.addColorStop(0, 'rgba(250,209,212,.37)');
        c.addColorStop(1, 'rgba(242,194,217,0)');
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1.0, .20 + noise(n + 13) * .20);
        ctx.translate(-x, -y);
        ctx.fillStyle = c;
        ctx.fillRect(x - w, y - w, 2 * w, 2 * w);
        ctx.restore();
      }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(map);
    const mat = plane.material as THREE.MeshBasicMaterial;
    mat.map = map;
    mat.color.set('#ffffff');
  }

  private makeSinger(actor: Actor, red: boolean) {
    const p = this.props;
    const first = p.meshes.length;
    const figure = new VideoFigure(actor.model, actor.track, p, this.scene, red ? '#eac1a1' : SOFT_PINK,
      red ? '#bc8276' : '#d19986');
    figure.head.scene.scale.setScalar(2.16);
    const goggles = new THREE.Group();
    const book = new THREE.Group();
    figure.root.add(goggles, book);
    this.singerAccessories.set(figure, { goggles, book });
    const hair = red ? '#a44c48' : HAIR;
    const silk = red ? '#dc775d' : '#583344';
    p.oval(figure.root, [0, 17, -14], [21, 20, 13], hair);
    for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
      const x = side * (18 + Math.sin(i * .7) * 4);
      const strand = p.oval(figure.root, [x, 12 - i * 6.6, -12 + (i % 2) * 3], [6.0, 12.1, 7.1], i % 3 ? hair : silk);
      strand.rotation.z = side * (.04 + .05 * i);
    }
    for (const [i, x] of [-12, -6, 0, 6, 12].entries()) {
      const fringe = p.oval(figure.root, [x, 26 - Math.abs(x) * .26, 2.0], [5.8, red ? 5.7 : 4.4, 6.2], i % 2 ? silk : hair);
      fringe.rotation.z = -.21 + i * .08;
    }
    for (const side of [-1, 1]) {
      p.mesh(figure.root, new THREE.TorusGeometry(3.2, .65, 8, 21), [side * 17, -5, 6], '#e7a366').rotation.y = side * .45;
      p.oval(goggles, [side * 8, 10.9, 16], [9, 5.4, 2.0], '#251d36');
      p.oval(goggles, [side * 8 - 1, 13.1, 17.4], [4.6, .55, .55], '#746d94');
    }
    p.box(goggles, 7, 1.4, 1.3, '#32293f', [0, 11.3, 16]);
    if (!red) {
      for (const direction of [-1, 1]) {
        const page = new THREE.Group();
        book.add(page);
        page.rotation.y = direction * -.25;
        p.box(page, 13.7, 17, 1, '#a5534d', [direction * 7, 0, 0]);
        p.box(page, 12.6, 15.7, 1.1, '#ead2a9', [direction * 7, 0, .6]);
        for (let i = 0; i < 4; i++) p.box(page, 9 - i * .8, .35, .25, '#746052', [direction * 7, 4 - i * 2.5, 1.32]);
      }
    }
    for (const mesh of p.meshes.slice(first)) this.shade(mesh, red ? .23 : .17);
    return figure;
  }

  private plant(g: THREE.Object3D, at: Point, size: number) {
    const p = this.props;
    p.mesh(g, new THREE.CylinderGeometry(size * .17, size * .12, size * .29, 18),
      [at[0], at[1] + size * .145, at[2]], '#ac6a58');
    for (let j = 0; j < 12; j++) {
      const angle = j * 2.399;
      const x = at[0] + Math.cos(angle) * size * (.21 + noise(j) * .20);
      const z = at[2] + Math.sin(angle) * size * .23;
      const y = at[1] + size * (.48 + .28 * noise(j * 11));
      p.tube(g, [at[0], at[1] + size * .22, at[2]], [x, y, z], size * .009, '#5c7853');
      const leaf = p.oval(g, [x, y, z], [size * .10, size * .23, size * .035], j % 2 ? '#3b6d52' : '#51875f');
      leaf.rotation.z = -.53 * Math.cos(angle);
      leaf.rotation.y = angle;
    }
  }

  private buildLiving() {
    const p = this.props, g = this.set('living');
    this.backdrop(g, [0, 162, -123], [620, 365], ['#d4b16e', '#dec38d', '#a87e58']);
    p.box(g, 667, 7, 280, '#294d43', [0, -5, -3]);
    p.box(g, 667, 7, 2, '#ead4ac', [0, 7, -119]);
    p.box(g, 96, 188, 11, '#a43944', [155, 95, -99]);
    p.oval(g, [190, 91, -92], [4, 4, 2.5], '#df9e5c');
    p.box(g, 79, 100, 6, '#eee1b8', [47, 167, -112]);
    this.backdrop(g, [47, 167, -107], [68, 90], ['#3d82ae', '#79b5dc']);
    p.box(g, 69, 2.8, 2, '#ead8bd', [47, 166, -104]);
    p.box(g, 3.3, 92, 2, '#ead8bd', [47, 167, -104]);
    for (const side of [-1, 1]) for (let j = 0; j < 8; j++) {
      p.box(g, 3.6, 113, 1.4, j % 2 ? '#d0a5a1' : '#e7c1ad', [47 + side * (31 + j * 3.0), 164, -104 + (j % 2) * 1.3]);
    }
    p.box(g, 79, 69, 5, '#e6a686', [-114, 179, -112]);
    p.box(g, 69, 60, 3, '#ca8880', [-114, 179, -108]);
    for (let j = 0; j < 7; j++) {
      const dot = p.oval(g, [-137 + j * 8, 178 + 17 * Math.sin(j * .52), -106], [15, 10, .45],
        ['#2d6b64', '#e59975', '#f1c27f', '#8b496b'][j % 4]);
      dot.rotation.z = .5 * Math.cos(j);
    }
    const seatGroup = new THREE.Group();
    g.add(seatGroup);
    const couch = [
      p.box(seatGroup, 111, 15, 57, VINYL, [-68, 40, 2]),
      p.oval(seatGroup, [-69, 69, -21], [55, 36, 13], '#37665b'),
      p.oval(seatGroup, [-111, 48, 7], [12, 21, 32], '#33564c'),
      p.oval(seatGroup, [-25, 48, 7], [12, 21, 32], '#33564c'),
    ];
    couch.forEach(item => this.shade(item, .16));
    p.box(g, 34, 5, 34, '#d9b381', [-22, 51, 35]);
    for (let i = 0; i < 15; i++) {
      p.box(g, 1, 14, 1, i % 2 ? '#d8b181' : '#ae8e6a', [-38 + i * 2.2, 42, 52.1]);
    }
    p.tube(g, [112, 0, -44], [112, 145, -44], 1.8, '#8c785f');
    p.mesh(g, new THREE.CylinderGeometry(14, 24, 28, 28), [112, 149, -44], IVORY);
    this.plant(g, [-165, 0, -65], 93);
    p.box(g, 82, 6, 43, '#8b5d55', [66, 68, 16]);
    for (const x of [32, 100]) for (const z of [0, 33]) p.tube(g, [x, 2, z], [x, 65, z], 2.4, '#743d42');
    p.oval(g, [40, 72, 17], [9, 1.5, 8], '#edddd0');
    p.oval(g, [40, 75.3, 17], [3.8, 5.9, 3.8], IVORY);
    p.mesh(g, new THREE.CylinderGeometry(4.0, 3.1, 6, 14), [76, 74, 11], '#d6a4a3');
  }

  private sky(g: THREE.Object3D, evening: boolean) {
    this.backdrop(g, [0, 175, -161], [750, 435], evening
      ? ['#482e78', '#9c4b86', '#dc7891', '#eea19b']
      : ['#3b7aab', '#71b7d7', '#c5deeb'], true);
  }

  private crew(group: THREE.Object3D, at: Point, coat: string, gloves: string, scale = 1) {
    const p = this.props;
    const root = new THREE.Group();
    group.add(root);
    root.position.set(...at);
    root.scale.setScalar(scale);
    p.oval(root, [0, 51, 0], [21, 40, 13.5], coat);
    p.oval(root, [0, 106, 2], [19, 23, 16], coat);
    p.oval(root, [0, 103, 13], [11, 12, 5.5], '#5c5672');
    p.oval(root, [0, 97, 15], [10, 5.3, 5], '#a8abc2');
    for (const s of [-1, 1]) {
      p.tube(root, [s * 10, 5, 1], [s * 10, 40, 0], 7, coat);
      p.oval(root, [s * 10, 3, 4], [7.5, 4, 12], coat);
    }
    const arm = () => p.mesh(root, new THREE.CylinderGeometry(1, 1, 1, 10), [0, 0, 0], coat);
    const hand = () => p.oval(root, [0, 0, 0], [5.2, 7.2, 4.1], gloves);
    const person: Crew = { root, arms: [arm(), arm()], hands: [hand(), hand()] };
    this.reach(person, [-30, 43, 10], [31, 46, 10]);
    return person;
  }

  private reach(crew: Crew, left: Point, right: Point) {
    for (const [i, hand] of [left, right].entries()) {
      this.props.segment(crew.arms[i], [i === 0 ? -17 : 17, 76, 0], hand, 6.9);
      crew.hands[i].position.set(...hand);
    }
  }

  private buildDrive() {
    const p = this.props, g = this.set('drive');
    g.add(this.daylightPanel, this.duskPanel, this.filmCar);
    this.sky(this.daylightPanel, false);
    this.sky(this.duskPanel, true);
    p.box(g, 900, 7, 350, '#4b4154', [0, -6, 13]);
    p.box(g, 510, 1, 5, '#c6b7b7', [0, -1.5, 84]);
    const car = this.filmCar;
    p.oval(car, [0, 35, 0], [151, 22, 47], '#c8b69b');
    p.box(car, 271, 23, 79, '#eee1bf', [0, 43, 0]);
    p.box(car, 278, 6, 83, '#aa9da2', [0, 27, 0]);
    p.box(car, 202, 2.8, 69, '#332b3c', [14, 56, -4]);
    p.box(car, 131, 18, 71, '#694757', [5, 61, -7]);
    p.box(car, 8, 34, 68, '#715262', [52, 65, -6]);
    p.box(car, 78, 12, 71, '#e6d1af', [-93, 51, 2]);
    for (const side of [-1, 1]) {
      p.tube(car, [-72, 55, side * 29], [-40, 111, side * 26], 2.0, '#b2a0a9');
      p.tube(car, [-40, 111, side * 26], [-40, 111, side * -26], 1.7, '#b2a0a9');
    }
    p.box(car, 35, 2, 1, '#a99b9b', [-67, 50.5, 40]);
    p.box(car, 37, 2, 1, '#a99b9b', [29, 50.5, 40]);
    p.box(car, 3, 15, 38, '#e5d6c2', [-132, 44, 5]);
    p.oval(car, [-133.5, 43, 34], [3.5, 5, 5], '#ffe3a7');
    p.oval(car, [132, 44, 33], [3.5, 6, 5], '#993b52');
    for (const x of [-94, 92]) {
      p.mesh(car, new THREE.CylinderGeometry(22, 22, 77, 32), [x, 20, 0], '#272132').rotation.x = Math.PI / 2;
      const hub = p.mesh(car, new THREE.CylinderGeometry(11.8, 11.8, 2.4, 16), [x, 20, 39], '#9e9cae');
      hub.rotation.x = Math.PI / 2;
      this.wheelHubs.push(hub);
    }
    p.mesh(car, new THREE.TorusGeometry(11, 1.4, 8, 23), [-76, 74, 32], '#2e2637').rotation.y = -.22;
    for (const [i, x] of [-236, 186, 221].entries()) {
      const helper = this.crew(g, [x, 0, -34], '#347864', '#348566', .88);
      this.filmCrew.push(helper.root);
      const stand = new THREE.Group();
      g.add(stand);
      stand.position.set(x + (i % 2 ? -10 : 18), 0, -65);
      p.tube(stand, [0, 0, 0], [0, 191, 0], 2, '#332337');
      p.box(stand, 24, 16, 12, '#333044', [0, 193, 0]).rotation.z = -.28;
      p.box(stand, 16, 9, 2, '#ebc99a', [0, 191, 7]);
      this.filmCrew.push(stand);
    }
  }

  private buildGarden() {
    const p = this.props, g = this.set('garden');
    this.sky(g, false);
    p.box(g, 640, 8, 304, '#497455', [0, -5, 0]);
    p.box(g, 650, 34, 10, '#3c6149', [0, 14, -95]);
    const fence = p.ink(g);
    fence.begin();
    for (let i = 0; i < 66; i++) {
      const x = i * 8.4 - 270;
      for (const direction of [-1, 1]) p.line(fence, [[x, 41, -101], [x + direction * 31, 88, -101]], '#f2dcb8', 1.54);
    }
    fence.end();
    p.box(g, 550, 3, 5, '#dbc9ac', [5, 88, -100]);
    p.box(g, 105, 172, 9, '#814f49', [-160, 87, -86]);
    p.box(g, 56, 62, 3, '#fff0c8', [-160, 119, -79]);
    p.box(g, 47, 53, 3, '#96bccd', [-160, 119, -76]);
    p.box(g, 2, 54, 3, IVORY, [-160, 119, -73]);
    p.box(g, 50, 3, 3, IVORY, [-160, 119, -73]);
    this.plant(g, [-110, 0, -31], 91);
    this.plant(g, [162, 0, -43], 81);
    const table = new THREE.Group();
    g.add(table);
    table.position.set(-113, 0, 32);
    p.box(table, 86, 5, 52, '#d5b1a5', [0, 49, 0]);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) {
      p.box(table, 7.1, .45, 6.4, (r + c) % 2 ? '#c54c5c' : '#f1d6c1', [c * 7.1 - 39.1, 51.8, r * 6.4 - 22.4]);
    }
    for (let n = 0; n < 10; n++) p.oval(table, [(n - 4.5) * 5, 55.5, 10 + 8 * Math.sin(n)], [4, 4.2, 3.8], n % 3 ? '#dda950' : '#c9504f');
    p.oval(g, [-40, 76, -18], [25, 15, 15], '#863d40');
    p.oval(g, [-40, 64, -16], [26, 9, 16], '#59445a');
    p.tube(g, [-44, 86, -15], [-36, 86, -15], 1.3, '#f6cd98');
    for (const x of [-54, -26]) p.tube(g, [x, 5, -23], [x, 69, -19], 2, '#242639');
    g.add(this.treadmill, this.stroller, this.neighbours);
    p.box(this.treadmill, 115, 5, 38, '#b899a9', [-67, 7, 39]);
    p.box(this.treadmill, 102, 2, 29, '#3b3046', [-70, 10, 40]);
    for (const z of [23, 54]) p.tube(this.treadmill, [-20, 9, z], [-25, 77, z], 1.8, '#af8b92');
    p.tube(this.treadmill, [-24, 77, 23], [-24, 77, 54], 2, '#ab7f87');
    p.tube(this.stroller, [62, 15, 25], [30, 116, 25], 3, '#b44b57');
    p.tube(this.stroller, [66, 15, -2], [36, 116, -2], 2.7, '#bc5260');
    p.tube(this.stroller, [29, 116, 25], [35, 116, -2], 2.6, '#a84852');
    p.tube(this.stroller, [20, 78, 24], [90, 78, 22], 2.3, '#423243');
    for (const z of [-5, 29]) p.oval(this.stroller, [63, 11, z], [12, 12, 3.4], '#433342');
    for (const [i, x] of [-62, -26, 12, 53, 88].entries()) {
      this.crew(this.neighbours, [x, 20, -90], ['#82738e', '#5e646e', '#b28e7c', '#7c6074', '#a1aba0'][i], '#b18077', .93 + i % 2 * .1);
    }
  }

  private buildRoad() {
    const p = this.props, g = this.set('road');
    this.sky(g, true);
    p.box(g, 830, 8, 390, ROAD, [0, -6, 12]);
    p.box(g, 724, 2, 9, '#ada1a8', [0, -1.2, -75]);
    p.box(g, 830, 29, 11, '#6d5460', [0, 8, -113]);
    for (let i = 0; i < 95; i++) {
      const x = (i - 47) * 6.7;
      p.oval(g, [x, 10 + 18 * noise(i * 15), -106], [5.5, 3.8 + 4 * noise(i), 3.5],
        ['#a17462', '#855e68', '#b59365', '#555c51'][i % 4]);
    }
    for (const side of [-1, 1]) {
      const crew = this.crew(g, [side * 88, 0, -5], '#e6dedc', '#365e9a', 1.04);
      this.carryCrew.push(crew);
      for (let i = 0; i < 2; i++) {
        this.crew(g, [side * (124 + i * 31), 0, -39 - i * 8],
          i ? '#4a5a72' : '#d5cad0', '#a1797d', .86 + .12 * i);
      }
    }
    for (let i = 0; i < 17; i++) {
      const puff = p.oval(g, [0, 0, -22], [17, 10, 12], '#eadac9');
      const mat = puff.material as THREE.MeshBasicMaterial;
      mat.transparent = true;
      mat.opacity = .12;
      mat.depthWrite = false;
      this.smoke.push(puff);
    }
  }

  private buildCabin() {
    const p = this.props, g = this.set('cabin');
    this.sky(g, true);
    p.box(g, 326, 65, 54, '#391f3d', [0, 31, 15]);
    p.box(g, 313, 11, 48, '#7b536c', [0, 63, 21]);
    for (const x of [-63, 66]) {
      p.oval(g, [x, 66, 6], [29, 52, 13], '#785165');
      p.oval(g, [x, 106, 0], [16, 13, 10], '#8c677a');
    }
    for (const s of [-1, 1]) p.tube(g, [s * 140, 64, 6], [s * 113, 185, -23], 3.3, '#a388a3');
    p.tube(g, [-113, 185, -23], [113, 185, -23], 3.3, '#a388a3');
    p.box(g, 53, 16, 3, '#43334b', [0, 167, -19]);
    p.box(g, 49, 12, 2, '#aa667b', [0, 167, -16]);
    p.mesh(g, new THREE.TorusGeometry(17, 2, 10, 29), [84, 83, 46], '#322739').rotation.y = .20;
    g.add(this.joinedHands);
    const handA = p.oval(this.joinedHands, [-7, 92, 78], [13, 6, 4.4], '#cc998f');
    const handB = p.oval(this.joinedHands, [7, 94, 81], [13, 6, 4.4], '#392b48');
    handA.rotation.z = -.24;
    handB.rotation.z = .28;
    for (let i = 0; i < 5; i++) p.tube(this.joinedHands,
      [-7 + i * 4, 95, 83], [-8 + i * 4, 91, 86], .52, '#e7a8a4');
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
  }

  private pose(fig: VideoFigure, t: number, playing: boolean, reset: boolean, dt: number, set: SetName, beat: number, hatch: boolean) {
    const costume = this.singerAccessories.get(fig)!;
    const arms: typeof HANDS = [
      HANDS[0], [-22 - 7 * Math.sin(beat * .48), -47 + 9 * Math.sin(beat * .6), 19],
      HANDS[2], [28, -39 + 11 * Math.sin(beat * .49 + .42), 24],
    ];
    if (set === 'cabin' && t >= 198.156) {
      if (hatch) {
        arms[2] = [33, -31, 15];
        arms[3] = [66, -37, 22];
      } else {
        arms[0] = [-33, -29, 16];
        arms[1] = [-66, -35, 26];
      }
    }
    const inCar = set === 'drive' || set === 'cabin';
    for (const piece of [...fig.legs, ...fig.feet]) piece.visible = !inCar;
    costume.goggles.visible = set === 'drive' && t < 72.698 && !hatch;
    costume.book.visible = set === 'living' && t >= 23.69 && t <= 40;
    costume.book.position.set(13, -36.5, 27);
    costume.book.rotation.set(-.25, -.21, .13);
    const top = hatch ? '#e8bfa6' : set === 'garden' ? '#ded6b9' : set === 'drive' || set === 'cabin' ? '#392a44' : SOFT_PINK;
    for (const piece of [fig.torso, ...fig.arms]) (piece.material as THREE.MeshStandardMaterial).color.set(top);
    for (const leg of fig.legs) (leg.material as THREE.MeshStandardMaterial).color.set(hatch ? '#8e6265' : '#523849');
    fig.pose(t, arms, inCar);
    fig.head.scene.rotation.y -= (hatch ? -.17 : .17) + .17 * Math.sin(beat * .34);
    fig.head.scene.rotation.z = .044 * Math.cos(beat * .49);
    fig.update(t, playing, this.camera, dt, reset);
  }

  frame(t: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const reset = epoch !== this.epoch || this.previous < 0 || Math.abs(t - this.previous) > .22;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, t - this.previous);
    this.epoch = epoch;
    this.previous = t;
    const scheduled = POKEMON_SHOTS.filter(shot => shot.time <= t).at(-1)?.view ?? 'pokemon-chair';
    const selected = view === 'pokemon-vocal' ? t >= EGG_HATCH_AT ? 'pokemon-hatchling' : 'pokemon-window'
      : Object.hasOwn(SHOTS, view) ? view as PokemonView : scheduled;
    const shot = SHOTS[selected];
    const afterHatch = t >= EGG_HATCH_AT;
    const active = speaker === 'pokemon-vocal' && intensity > .04;
    const focus = afterHatch ? this.hatchling : this.lead;
    const portrait = this.camera.aspect < 1.07;
    const beat = t * Math.PI * 2 * (164 / 60);
    const target = new THREE.Vector3(...shot.target);
    const from = new THREE.Vector3(...shot.from);
    if (portrait) from.z += 51;
    if (active && shot.person && portrait) target.x = THREE.MathUtils.lerp(target.x, shot.person[0], .40);
    this.camera.position.copy(from);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld(true);
    for (const [name, group] of this.sets) group.visible = name === shot.set;
    this.duskPanel.visible = t >= EGG_CRACK_AT;
    this.daylightPanel.visible = !this.duskPanel.visible;
    const studio = selected === 'pokemon-studio';
    this.filmCrew.forEach(person => { person.visible = studio; });
    const training = selected === 'pokemon-treadmill' || selected === 'pokemon-neighbours';
    this.treadmill.visible = training;
    this.stroller.visible = training;
    this.neighbours.visible = t >= 104.65;
    this.wheelHubs.forEach(hub => { hub.rotation.y = t * 1.5; });
    this.filmCar.rotation.z = .009 * Math.sin(beat * .4);
    this.joinedHands.visible = selected === 'pokemon-hands';
    this.joinedHands.position.y = 1.5 * Math.sin(beat * .37);

    const eggTravel = shot.set === 'road' && selected === 'pokemon-lift'
      ? THREE.MathUtils.smoothstep(t, 144.45, 147.17) * (1 - THREE.MathUtils.smoothstep(t, 150.8, 156.25))
      : 0;
    const hatch = THREE.MathUtils.smoothstep(t, EGG_HATCH_AT, EGG_HATCH_AT + 1.42);
    const opening = shot.set === 'road' ? hatch : 0;
    this.egg.visible = !!shot.egg;
    if (shot.egg) {
      const [x, y, z] = shot.egg;
      this.egg.position.set(x + eggTravel * 63, y + eggTravel * 40 + .65 * Math.sin(beat * .46), z);
      this.egg.rotation.set(0, -.09 + .094 * Math.sin(beat * .26), training ? -.22 : eggTravel * -.35);
      this.egg.scale.setScalar(shot.set === 'drive' ? .88 : 1.03);
    }
    this.crack.visible = t >= EGG_CRACK_AT && opening < .06;
    this.upperShell.position.set(49 * opening, -13 * opening, -6 * opening);
    this.upperShell.rotation.set(.07 * opening, .13 * opening, -.96 * opening);
    this.lowerShell.position.set(-49 * opening, -4 * opening, -5 * opening);
    this.lowerShell.rotation.set(-.07 * opening, -.11 * opening, 1.00 * opening);

    for (const [i, actor] of this.carryCrew.entries()) {
      const s = i === 0 ? -1 : 1;
      actor.root.position.x = s * (79 + opening * 20) + 58 * eggTravel;
      actor.root.position.y = -2 + 2.2 * Math.sin(beat * .42 + i) * eggTravel;
      actor.root.rotation.z = s * (.07 + .17 * eggTravel);
      actor.root.visible = selected !== 'pokemon-road';
      this.reach(actor, [-28, 40 + 35 * eggTravel, 13], [27, 40 + 33 * eggTravel, 12]);
    }
    this.smoke.forEach((puff, i) => {
      const phase = Math.max(0, t - EGG_HATCH_AT) * 9 + 2 * i;
      puff.visible = opening > .1 && t < 184.4;
      puff.position.set((noise(i * 11) - .5) * (65 + phase * .8), 7 + phase % 54, -18 - i % 3 * 7);
      (puff.material as THREE.MeshBasicMaterial).opacity = .15 * (1 - phase % 54 / 54);
    });

    this.lead.root.visible = false;
    this.hatchling.root.visible = false;
    this.inset.visible = active && (!shot.person || t < 11.887);
    if (shot.person && t >= 11.887) {
      const [x, y, z] = shot.person;
      focus.root.visible = true;
      focus.root.position.set(x + 4 * Math.sin(beat * .37), y + Math.sin(beat) * 1.8, z);
      focus.root.scale.setScalar(shot.set === 'drive' || shot.set === 'cabin' ? .83 : 1.05);
    }
    if (this.inset.visible) {
      const at = new THREE.Vector3(portrait ? -.57 : -.72, -.44, .992).unproject(this.camera);
      this.inset.position.copy(at);
      this.inset.quaternion.copy(this.camera.quaternion);
      this.inset.scale.setScalar(portrait ? .81 : .93);
      focus.root.position.copy(at);
      focus.root.scale.setScalar(portrait ? .75 : .83);
      focus.root.visible = true;
    }
    if (shot.set === 'cabin') {
      this.lead.root.visible = true;
      this.lead.root.position.set(64, 124 + Math.sin(beat * .38), 58);
      this.lead.root.scale.setScalar(.83);
    }
    if (this.lead.root.visible) this.pose(this.lead, t, playing, reset, dt, shot.set, beat, false);
    if (this.hatchling.root.visible) this.pose(this.hatchling, t, playing, reset, dt, shot.set, beat, true);
  }

  dispose() {
    this.lead.dispose();
    this.hatchling.dispose();
    this.props.dispose();
    this.textures.forEach(texture => texture.dispose());
  }
}
