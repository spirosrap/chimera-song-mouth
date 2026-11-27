import * as THREE from 'three';
import { KNOCKING_SHOTS, type KnockingView } from '../../scene/knocking-at-the-sky.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { VoiceModel } from '../analysis.ts';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';

type Actor = { id: CharacterId; model: VoiceModel; track: TeleTrack };
type SetName = 'cream' | 'car' | 'hall' | 'noir' | 'garden' | 'stairs' | 'stage' | 'tv' | 'ruby' | 'credits';
type Costume = 'white' | 'noir' | 'blonde' | 'harmony' | 'violet' | 'guitar' | 'phone' | 'ruby';
type Shot = { set: SetName; from: Point; to: Point; outfit?: Costume; duo?: boolean; seated?: boolean; roll?: number };
const SHOTS: Record<KnockingView, Shot> = {
  'sky-interview': { set: 'cream', from: [4, 155, 178], to: [0, 136, 0], outfit: 'white' },
  'sky-passenger': { set: 'car', from: [44, 159, 184], to: [0, 132, 2], outfit: 'noir', seated: true, roll: -.027 },
  'sky-road': { set: 'car', from: [-40, 142, 323], to: [0, 106, -19], outfit: 'noir', seated: true },
  'sky-doorway': { set: 'hall', from: [14, 162, 323], to: [0, 112, -1], outfit: 'noir', duo: true },
  'sky-monochrome': { set: 'noir', from: [-27, 156, 204], to: [0, 129, 0], outfit: 'noir', seated: true },
  'sky-window': { set: 'noir', from: [64, 165, 186], to: [0, 139, 4], outfit: 'noir', roll: .032 },
  'sky-portrait': { set: 'cream', from: [-15, 156, 165], to: [0, 136, 0], outfit: 'blonde' },
  'sky-garden': { set: 'garden', from: [-32, 154, 303], to: [0, 117, 0], outfit: 'white', duo: true, roll: .027 },
  'sky-stairs': { set: 'stairs', from: [45, 185, 278], to: [-5, 115, 2], outfit: 'noir', roll: .104 },
  'sky-violet': { set: 'stage', from: [-51, 163, 172], to: [0, 137, 0], outfit: 'violet', roll: -.04 },
  'sky-intermission': { set: 'tv', from: [0, 123, 303], to: [0, 121, 0] },
  'sky-test-card': { set: 'tv', from: [0, 123, 273], to: [0, 121, 0] },
  'sky-band': { set: 'stage', from: [17, 166, 356], to: [0, 112, -15], outfit: 'guitar', duo: true },
  'sky-guitar': { set: 'stage', from: [-48, 151, 230], to: [0, 115, 12], outfit: 'guitar', roll: .017 },
  'sky-telephone': { set: 'garden', from: [15, 163, 186], to: [0, 133, 0], outfit: 'phone' },
  'sky-ruby-card': { set: 'ruby', from: [31, 153, 299], to: [0, 113, 2] },
  'sky-red-room': { set: 'ruby', from: [26, 156, 316], to: [0, 113, 1], outfit: 'ruby', duo: true, seated: true },
  'sky-shadow': { set: 'ruby', from: [68, 157, 139], to: [0, 139, 0], outfit: 'ruby', roll: -.053 },
  'sky-credits': { set: 'credits', from: [0, 123, 310], to: [0, 121, 0] },
};
const PALETTE: Record<SetName, string> = {
  cream: '#c9c0aa', car: '#88987f', hall: '#604f53', noir: '#424347', garden: '#6e8c88',
  stairs: '#655257', stage: '#332243', tv: '#211c2b', ruby: '#702635', credits: '#130e1a',
};
const WARDROBE: Record<Costume, { coat: string; hair: string; long: boolean }> = {
  white: { coat: '#e0dacf', hair: '#3a2d36', long: true },
  noir: { coat: '#25242e', hair: '#38303b', long: true },
  blonde: { coat: '#3f333e', hair: '#cfb393', long: false },
  harmony: { coat: '#504151', hair: '#cfb393', long: false },
  violet: { coat: '#ead4c8', hair: '#ae6555', long: false },
  guitar: { coat: '#813340', hair: '#554047', long: true },
  phone: { coat: '#3a3445', hair: '#3a2d36', long: true },
  ruby: { coat: '#a63d4e', hair: '#4e253b', long: true },
};

export class KnockingStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, .5, 1800);
  private readonly props = new VideoProps();
  private readonly sets = new Map<SetName, THREE.Group>();
  private readonly wardrobe = new Map<Costume, VideoFigure>();
  private readonly textures: THREE.CanvasTexture[] = [];
  private readonly background = new THREE.Color();
  private readonly broadcast = new THREE.Group();
  private readonly testCard = new THREE.Group();
  private readonly disc = new THREE.Group();
  private readonly handset = new THREE.Group();
  private readonly rubyTitle = new THREE.Group();
  private lastTime = -1;
  private lastEpoch = -1;
  private lastView?: KnockingView;

  constructor(actors: Actor[]) {
    this.scene.background = this.background;
    for (const name of Object.keys(PALETTE) as SetName[]) {
      const group = new THREE.Group();
      this.sets.set(name, group);
      this.scene.add(group);
    }
    const lead = actors.find(actor => actor.id === 'sky-lead')!;
    const chorus = actors.find(actor => actor.id === 'sky-chorus')!;
    for (const name of Object.keys(WARDROBE) as Costume[]) {
      const voice = name === 'harmony' ? chorus : lead;
      const outfit = WARDROBE[name];
      const figure = new VideoFigure(voice.model, voice.track, this.props, this.scene, outfit.coat, '#d4ad9e');
      this.dress(figure, name, outfit);
      this.wardrobe.set(name, figure);
    }
    this.buildInteriors();
    this.buildCar();
    this.buildGarden();
    this.buildStage();
    this.buildBroadcast();
  }

  private dress(figure: VideoFigure, name: Costume, outfit: (typeof WARDROBE)[Costume]) {
    const p = this.props;
    p.oval(figure.ornaments, [-10, 13, 0], [14, 11, 16], outfit.hair);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const curl = p.oval(figure.ornaments, [-9 + 1.9 * i, 9 - i * 2.9, s * (10.9 + Math.sin(i) * 2.4)],
          [4.1 + .3 * i, outfit.long ? 9.5 - i * .2 : 5.7, 3.6], outfit.hair);
        curl.rotation.x = s * (.09 + i * .075);
      }
      p.oval(figure.ornaments, [-1.8, -9, s * 14.7], [1.1, 2.2, 1.2], name === 'blonde' || name === 'harmony' ? '#c2cfbb' : '#d0a671');
    }
    if (name === 'blonde' || name === 'harmony') {
      for (let i = -4; i <= 4; i++) p.oval(figure.root, [i * 3.4, -14.1 + Math.abs(i) * .8, 13], [1.55, 1.55, 1.1], '#c1cbbd');
    }
    if (name === 'white' || name === 'guitar' || name === 'ruby') {
      for (const arm of figure.arms) (arm.material as THREE.MeshBasicMaterial).color.set('#c49d92');
    }
    if (name === 'phone') {
      figure.root.add(this.handset);
      p.box(this.handset, 5.8, 24, 6.3, '#b84f5e', [0, 0, 2]);
      for (const side of [-1, 1]) p.oval(this.handset, [1, side * 12.5, 4], [6.1, 5.35, 4.8], '#ca5964');
      this.handset.rotation.z = -.18;
    }
    if (name === 'guitar') {
      const guitar = new THREE.Group();
      guitar.position.set(3, -54, 15);
      guitar.rotation.z = -.58;
      figure.root.add(guitar);
      p.oval(guitar, [-4, -5, 0], [19, 23, 4], '#ad465d');
      p.oval(guitar, [5, 9, 0], [17, 14, 4], '#a2334e');
      p.box(guitar, 6, 53, 3, '#583941', [1, 34, -.45]);
      p.box(guitar, 8, 11, 4, '#6b4246', [1, 64, -.45]);
      p.box(guitar, 13, 3.6, 1, '#e1bd93', [1, -1, 4]);
      for (let i = 0; i < 4; i++) p.box(guitar, .27, 68, .35, '#dfc6aa', [i * 1.1 - .5, 30, 4.2]);
    }
  }

  private ground(name: SetName, color: string) {
    const group = this.sets.get(name)!;
    this.props.box(group, 770, 4, 660, color, [0, -3, -118]);
    return group;
  }

  private lamp(group: THREE.Group, x: number, z: number, color: string) {
    const p = this.props;
    p.box(group, 34, 3, 29, '#48333b', [x, 63, z]);
    p.tube(group, [x, 63, z], [x, 103, z], 1.5, '#9e8873');
    p.mesh(group, new THREE.CylinderGeometry(8, 17, 23, 20), [x, 105, z], color);
  }

  private buildInteriors() {
    const p = this.props;
    const cream = this.ground('cream', '#a79787');
    p.box(cream, 500, 254, 4, '#cbbfa9', [0, 124, -75]);
    p.box(cream, 400, 5, 1.4, '#b5a895', [0, 13, -71.3]);
    p.box(cream, 54, 33, 4, '#b5a4a0', [90, 126, -70]);
    p.box(cream, 47, 26, 2, '#d9cbba', [90, 126, -67]);
    const hall = this.ground('hall', '#90756c');
    p.box(hall, 590, 274, 8, '#a98d83', [0, 136, -149]);
    p.box(hall, 113, 228, 3, '#dfcbb5', [0, 115, -143]);
    p.box(hall, 119, 13, 19, '#674c4d', [0, 231, -135]);
    for (const s of [-1, 1]) {
      p.box(hall, 13, 225, 20, '#634849', [s * 59, 113, -135]);
      p.box(hall, 51, 212, 9, '#8a6565', [s * 87, 109, -126]).rotation.y = s * .28;
      p.box(hall, 5, 5, 3, '#baa386', [s * 72, 104, -117]);
      p.box(hall, 168, 4, 1, '#baa093', [s * 153, 76, -143]);
    }
    const noir = this.ground('noir', '#4c4851');
    p.box(noir, 470, 240, 6, '#4d4853', [0, 116, -116]);
    p.box(noir, 92, 96, 6, '#514e5d', [-75, 134, -110]);
    p.box(noir, 79, 83, 2, '#85808e', [-75, 134, -106]);
    p.box(noir, 2.4, 83, 2.3, '#53535c', [-75, 134, -103]);
    p.box(noir, 79, 2.7, 2.3, '#53535c', [-75, 134, -103]);
    p.oval(noir, [-7, 60, -17], [44, 34, 21], '#3b3545');
    p.box(noir, 61, 8, 54, '#575062', [-6, 34, 4]);
    this.lamp(noir, 94, -44, '#a49aa3');
    const stairs = this.ground('stairs', '#5d4857');
    p.box(stairs, 600, 242, 3, '#775e66', [0, 118, -169]);
    for (let i = 0; i < 9; i++) {
      const z = -15 - i * 14, y = 6 + i * 9.2;
      p.box(stairs, 224, 11, 15, '#814852', [0, y, z]);
      p.box(stairs, 223, 1.3, 1, '#bb8a74', [0, y + 5, z + 7.5]);
      for (const s of [-1, 1]) p.tube(stairs, [s * 104, y + 5, z], [s * 104, y + 41, z], 1.3, '#b78973');
    }
    for (const s of [-1, 1]) p.tube(stairs, [s * 104, 47, -12], [s * 104, 127, -131], 3.1, '#af847c');
    const ruby = this.ground('ruby', '#6e303e');
    p.box(ruby, 516, 254, 7, '#893b50', [0, 122, -144]);
    p.box(ruby, 153, 103, 10, '#632c3b', [0, 68, -87]);
    p.box(ruby, 174, 22, 153, '#733849', [0, 33, -11]);
    p.box(ruby, 175, 6, 144, '#a95767', [0, 47, -8]);
    for (const s of [-1, 1]) {
      p.oval(ruby, [s * 51, 51, -62], [30, 6, 20], '#cf8381');
      this.lamp(ruby, s * 120, -62, '#db956f');
    }
    for (let i = 0; i < 13; i++) {
      p.box(ruby, 2.4, 1.7, 114, '#75394c', [i * 12.1 - 73, 50.25, 8]).rotation.y = .08 * Math.sin(i * .97);
    }
  }

  private buildCar() {
    const p = this.props, g = this.ground('car', '#7d746e');
    p.box(g, 700, 2, 91, '#96a27d', [0, 1, -175]);
    for (let i = 0; i < 11; i++) {
      const x = i * 58 - 290;
      p.oval(g, [x, 56 + i % 2 * 19, -217 + i % 3 * 8], [47, 64, 38], ['#60785e', '#778769', '#556c60'][i % 3]);
    }
    p.oval(g, [0, 52, 12], [115, 31, 78], '#478283');
    p.box(g, 204, 29, 77, '#4c898a', [0, 57, 45]);
    p.box(g, 190, 5, 9, '#a7a7a1', [0, 52, 89]);
    p.box(g, 163, 23, 13, '#384a57', [0, 87, -21]);
    p.box(g, 176, 4, 19, '#b9aca4', [0, 107, -26]);
    p.box(g, 160, 5, 55, '#43565e', [0, 210, -22]);
    for (const s of [-1, 1]) {
      p.tube(g, [s * 77, 70, 41], [s * 74, 206, -20], 2.3, '#bac0a9');
      p.tube(g, [s * 76, 101, -42], [s * 74, 208, -45], 2.5, '#8c9890');
      p.oval(g, [s * 77, 59, 89], [13, 11, 4], '#e4d3a7');
      const wheel = p.mesh(g, new THREE.CylinderGeometry(24, 24, 20, 24), [s * 91, 25, 36], '#3b3941');
      wheel.rotation.z = Math.PI / 2;
    }
    const wheel = p.mesh(g, new THREE.TorusGeometry(14, 1.8, 6, 22), [36, 122, 20], '#54434b');
    wheel.rotation.x = .38;
  }

  private buildGarden() {
    const p = this.props, g = this.ground('garden', '#68746a');
    for (let i = 0; i < 16; i++) {
      const x = 43 * i - 322, z = -134 - i % 5 * 16;
      const h = 106 + i % 4 * 25;
      p.tube(g, [x, 0, z], [x + 16, h, z - 9], 3.2, '#53665b');
      for (let k = 0; k < 3; k++) {
        const col = ['#678873', '#79987d', '#90a28a'][k];
        p.oval(g, [x + k * 17 - 13, h - k * 14, z - k * 17], [29, 40, 27], col);
      }
    }
    for (const [i, size] of [58, 42, 29, 18].entries()) {
      p.oval(g, [82, 153, -223 + i * 3], [size, size, .45], ['#839ea3', '#a7b9bd', '#c5d4ce', '#f4e3b7'][i]);
    }
  }

  private buildStage() {
    const p = this.props, g = this.ground('stage', '#44364f');
    p.box(g, 640, 254, 6, '#493554', [0, 121, -154]);
    for (let i = 0; i < 18; i++) {
      const x = -287 + i * 33;
      p.box(g, 6.5, 244, 1.8, i % 2 ? '#5d4267' : '#674766', [x, 121, -148]);
    }
    for (const [i, x] of [-140, 0, 140].entries()) {
      p.oval(g, [x, 210, -111], [12.5, 9, 4.3], ['#d694a8', '#dc9fc4', '#ad8bca'][i]);
      p.oval(g, [x, .75, -13], [58, .35, 67], ['#67445f', '#795174', '#655082'][i]);
    }
    const bass = p.mesh(g, new THREE.CylinderGeometry(24, 24, 25, 29), [93, 25, -98], '#76516c');
    bass.rotation.x = Math.PI / 2;
    p.oval(g, [93, 26, -84.5], [21, 21, 1], '#9c7487');
    for (const s of [-1, 1]) {
      const x = 93 + s * 40;
      p.tube(g, [x, 0, -89], [x, 59, -89], 1.3, '#9292a9');
      p.oval(g, [x, 60, -89], [17, 1.7, 13], '#c89e85');
    }
    p.box(g, 120, 7, 23, '#3f314c', [-118, 67, -75]);
    for (let i = 0; i < 23; i++) p.box(g, 3.8, 2, 11, '#c5a9ad', [-168 + 4.6 * i, 71, -68]);
  }

  private textCard(group: THREE.Group, rows: string[], from: Point, width: number, tint: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 280;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 46px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = tint;
    for (const [i, label] of rows.entries()) ctx.fillText(label, canvas.width / 2, 140 + (i - (rows.length - 1) / 2) * 56);
    const tex = new THREE.CanvasTexture(canvas);
    this.textures.push(tex);
    const panel = this.props.mesh(group, new THREE.PlaneGeometry(width, width * canvas.height / canvas.width), from, '#ffffff');
    const material = panel.material as THREE.MeshBasicMaterial;
    material.map = tex;
    material.transparent = true;
    material.depthWrite = false;
  }

  private buildBroadcast() {
    const p = this.props, g = this.sets.get('tv')!;
    g.add(this.broadcast, this.testCard);
    this.broadcast.add(this.disc);
    this.disc.position.set(0, 122, -2);
    for (const [i, radius] of [78, 70, 62, 54, 46, 38, 30, 22].entries()) {
      const ring = p.mesh(this.disc, new THREE.RingGeometry(radius - 6, radius, 60, 1, .27 * i, 5.5), [0, 0, i * .16],
        ['#607d78', '#a87677', '#9e9292', '#543c55', '#cc9987', '#5d6c75', '#a36175', '#7d5c69'][i]);
      ring.rotation.z = i * .48;
    }
    this.textCard(this.broadcast, ['INTERMISSION', 'INTERMISSION', 'INTERMISSION'], [0, 121, 8], 228, '#f7e9c3');
    const bars = ['#b5b69a', '#d3bf7b', '#80a6a1', '#7d986e', '#a86c94', '#a65f67', '#697195'];
    for (const [i, color] of bars.entries()) {
      p.box(this.testCard, 40, 91, 2, color, [(i - 3) * 40, 134, 0]);
      p.box(this.testCard, 40, 18, 2, bars[(i * 3 + 2) % bars.length], [(i - 3) * 40, 78, 0]);
    }
    p.box(this.testCard, 281, 13, 2, '#453b50', [0, 61, 0]);
    this.sets.get('ruby')!.add(this.rubyTitle);
    this.textCard(this.rubyTitle, ['THE HORROR', 'ON SUNSET'], [0, 131, 34], 220, '#f6d6bb');
    const credits = this.sets.get('credits')!;
    this.textCard(credits, ['THE LAST DINNER PARTY', 'KNOCKING AT THE SKY', 'CHIMERA PERFORMANCE'], [0, 121, 3], 253, '#d9818f');
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.props.resize(width, height);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const automatic = KNOCKING_SHOTS.filter(shot => shot.time <= time).at(-1)?.view ?? 'sky-interview';
    const selected = view === 'sky-lead' ? 'sky-interview' : view === 'sky-chorus' ? 'sky-portrait'
      : view === 'wide' ? automatic : view as KnockingView;
    const shot = SHOTS[selected] ?? SHOTS[automatic];
    for (const [name, group] of this.sets) group.visible = name === shot.set;
    this.background.set(PALETTE[shot.set]);
    this.broadcast.visible = selected === 'sky-intermission';
    this.testCard.visible = selected === 'sky-test-card';
    this.rubyTitle.visible = selected === 'sky-ruby-card';
    this.disc.rotation.z = time * .64;
    const reset = this.lastEpoch !== epoch || this.lastView !== selected || Math.abs(time - this.lastTime) > .18;
    const dt = reset ? 0 : Math.max(0, time - this.lastTime);
    const [x, y, z] = shot.from;
    this.camera.position.set(x + 2.1 * Math.sin(time * .99), y + 2.3 * Math.cos(time * .82), z);
    this.camera.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
    this.camera.lookAt(...shot.to);
    this.camera.fov = this.camera.aspect < 1 ? 48 : 37;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    // The portraits share the original vocal clock. Use the active physical voice
    // during a sung line even when a different outfit is used between lines.
    const visible = view === 'sky-chorus' || (speaker === 'sky-chorus' && !shot.duo && shot.outfit) ? 'harmony' : shot.outfit;
    const other = shot.duo ? 'harmony' : undefined;
    for (const [name, figure] of this.wardrobe) {
      figure.root.visible = name === visible || name === other;
      if (!figure.root.visible) continue;
      const secondary = name === other;
      const beat = time * 7.6 + (secondary ? 1.13 : 0);
      const seated = Boolean(shot.seated);
      const arm = seated ? 9 : 14 + intensity * 19;
      const span = secondary ? 63 : shot.duo ? -26 : 0;
      figure.root.position.set(span + 2.85 * Math.sin(beat * .23), (seated ? 132 : 151) + 2.5 * Math.sin(beat * .49), secondary ? -20 : 0);
      figure.pose(time, name === 'guitar' ? [[-29, -34, 9], [-10, -50, 25], [30, -24, 7], [26, -18, 20]]
        : name === 'phone' ? [[-27, -26, 14], [-18, -1, 17], [27, -33, 11], [30, -57, 18]] : [
        [-29, -33, 9], [-34, -49 + arm * Math.sin(beat * .63), 29],
        [26, -28, 9], [32, -43 + arm * Math.cos(beat * .56), 28],
      ], seated);
      if (name === 'phone') this.handset.position.copy(figure.hands[0].position);
      figure.head.scene.rotation.y += x * .0029;
      figure.head.scene.rotation.z = .062 * Math.sin(beat * .35);
      figure.update(time, playing, this.camera, dt, reset);
    }
    this.lastTime = time;
    this.lastEpoch = epoch;
    this.lastView = selected;
  }

  dispose() {
    for (const figure of this.wardrobe.values()) figure.dispose();
    this.props.dispose();
    for (const texture of this.textures) texture.dispose();
  }
}
