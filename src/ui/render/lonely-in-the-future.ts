import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { FUTURE_SHOTS, type FutureView } from '../../scene/lonely-in-the-future.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type SetName = 'band' | 'critic' | 'news' | 'control' | 'cinema' | 'protest' | 'bach' | 'beach'
  | 'sanctuary' | 'party' | 'cell' | 'orbit' | 'credits' | 'meditation';
type Shot = { set: SetName; target: Point; from: Point };
type Puppet = { root: THREE.Group; head: THREE.Group; jaw: THREE.Mesh; pupils: THREE.Mesh[] };

const SHOTS: Record<FutureView, Shot> = {
  'future-band': { set: 'band', target: [0, 113, 0], from: [12, 148, 550] },
  'future-singer': { set: 'band', target: [0, 167, 33], from: [-19, 164, 258] },
  'future-guitar': { set: 'band', target: [104, 130, -12], from: [145, 139, 411] },
  'future-drums': { set: 'band', target: [-52, 136, -48], from: [-121, 175, 451] },
  'future-critic': { set: 'critic', target: [0, 143, 8], from: [7, 158, 379] },
  'future-news': { set: 'news', target: [0, 129, -6], from: [-8, 141, 433] },
  'future-control': { set: 'control', target: [0, 120, -20], from: [9, 171, 449] },
  'future-cinema': { set: 'cinema', target: [0, 140, -24], from: [8, 151, 480] },
  'future-protest': { set: 'protest', target: [0, 126, 0], from: [10, 149, 462] },
  'future-bach': { set: 'bach', target: [0, 126, 0], from: [-16, 143, 428] },
  'future-beach': { set: 'beach', target: [0, 113, 1], from: [1, 139, 435] },
  'future-sanctuary': { set: 'sanctuary', target: [0, 132, 0], from: [2, 143, 459] },
  'future-party': { set: 'party', target: [0, 118, 0], from: [8, 135, 450] },
  'future-cell': { set: 'cell', target: [0, 126, 0], from: [4, 142, 396] },
  'future-orbit': { set: 'orbit', target: [0, 128, 0], from: [0, 128, 465] },
  'future-credits': { set: 'credits', target: [0, 124, 0], from: [0, 125, 492] },
  'future-meditation': { set: 'meditation', target: [0, 108, 0], from: [0, 128, 405] },
};
const PALE = '#d6ab89';
const DARK = '#1a1617';
const GOLD = '#ffca79';
const SKY = '#60b6d0';
const RED = '#d92f37';
const BLACK = '#100e16';
const HANDS: [Point, Point, Point, Point] = [[-28, -33, 4], [-29, -55, 15], [28, -30, 12], [11, -17, 28]];
const SHOT_NAMES = Object.keys(SHOTS) as FutureView[];

function random(seed: number) {
  const value = Math.sin(seed * 298.18 + 759.3) * 32749.27;
  return value - Math.floor(value);
}

export class LonelyFutureStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(39, 1, 1, 2200);
  readonly props = new VideoProps();
  readonly sets = new Map<SetName, THREE.Group>();
  readonly singer: VideoFigure;
  readonly broadcast: VideoFigure;
  private readonly textures: THREE.Texture[] = [];
  private readonly puppets: Puppet[] = [];
  private readonly flames: THREE.Mesh[] = [];
  private readonly orbitBone = new THREE.Group();
  private readonly orbitRocket = new THREE.Group();
  private readonly microphone: THREE.Group;
  private readonly newspaper: THREE.Group;
  private readonly inset = new THREE.Group();
  private readonly cards: THREE.Group[] = [];
  private readonly newsCards: THREE.Group[] = [];
  private readonly bands: Puppet[] = [];
  private readonly critic: Puppet;
  private readonly meditation: Puppet;
  private readonly whiteWig = new THREE.Group();
  private epoch = -1;
  private previous = -1;

  constructor(lead: Actor, dialogue: Actor) {
    this.scene.background = new THREE.Color(BLACK);
    this.scene.add(new THREE.HemisphereLight('#ffefe1', '#423349', 1.75));
    const key = new THREE.DirectionalLight('#ffd3b1', 1.9);
    key.position.set(-110, 216, 185);
    const edge = new THREE.DirectionalLight('#6588d4', 1.05);
    edge.position.set(185, 118, -120);
    this.scene.add(key, edge);
    for (const view of SHOT_NAMES) {
      const name = SHOTS[view].set;
      if (!this.sets.has(name)) {
        const g = new THREE.Group();
        g.name = name;
        this.sets.set(name, g);
        this.scene.add(g);
      }
    }
    this.scene.add(this.inset);
    const p = this.props;
    p.box(this.inset, 88, 94, 1, '#101725', [0, -15, -23]);
    p.box(this.inset, 88, 2.5, 2, SKY, [0, 31, -22]);
    p.box(this.inset, 88, 2.5, 2, '#305773', [0, -62, -22]);
    this.singer = new VideoFigure(lead.model, lead.track, p, this.scene, '#24202b', '#bb8a68');
    this.broadcast = new VideoFigure(dialogue.model, dialogue.track, p, this.scene, '#283754', PALE);
    this.microphone = this.dressLead();
    this.dressAnchor();
    this.buildBand();
    this.critic = this.buildCritic();
    this.buildBroadcasts();
    this.newspaper = this.buildCinema();
    this.buildProtest();
    this.buildBach();
    this.buildBeach();
    this.buildSanctuary();
    this.buildPartyAndCell();
    this.buildOrbit();
    this.buildCredits();
    this.meditation = this.buildMeditation();
  }

  private set(name: SetName) {
    return this.sets.get(name)!;
  }

  private label(g: THREE.Object3D, text: string, at: Point, size: [number, number], color: string, mono = false) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.font = `bold 98px ${mono ? 'monospace' : 'sans-serif'}`;
    ctx.fillText(text, 360, 75, 697);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(map);
    const mesh = this.props.mesh(g, new THREE.PlaneGeometry(...size), at, '#ffffff');
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.map = map;
    material.transparent = true;
    material.depthWrite = false;
    mesh.renderOrder = 4;
  }

  private room(g: THREE.Group, wall: string, floor: string) {
    const p = this.props;
    p.box(g, 1200, 730, 6, wall, [0, 220, -177]);
    p.box(g, 1200, 7, 540, floor, [0, -5, 22]);
  }

  private puppet(g: THREE.Group, at: Point, suit: string, skin: string, hair: string, variant = 0) {
    const p = this.props;
    const root = new THREE.Group();
    const head = new THREE.Group();
    g.add(root);
    root.position.set(...at);
    root.add(head);
    const torso = p.mesh(root, new THREE.CylinderGeometry(27, 32, 69, 18), [0, -65, -6], suit);
    torso.scale.z = .56;
    p.oval(root, [0, -54, 11], [11, 30, 4], variant === 3 ? '#221d26' : '#e9cdb0');
    for (const side of [-1, 1]) {
      p.tube(root, [side * 24, -44, -3], [side * 38, -86, 2], 7, suit);
      p.oval(root, [side * 39, -88, 4], [7, 10, 6], skin);
      p.oval(head, [side * 25, 0, 0], [7, 12, 8], skin);
      p.oval(head, [side * 12, -4, 18], [12, 12, 7], skin);
    }
    p.oval(head, [0, 5, -1], [25, 30, 18], skin);
    p.oval(head, [0, -7, 20], [7.5, 10 + variant * 2, 9], skin);
    p.oval(head, [0, -19, 17], [16, 6, 6], '#311118');
    const jaw = p.oval(head, [0, -23, 17], [17, 7, 7], skin);
    p.oval(head, [0, -19, 22], [11, 1.3, 2], '#f0d3af');
    const pupils = [-1, 1].map(side => {
      p.oval(head, [side * 11, 8, 15], [9, 7.5, 7], '#ebe3d5');
      const pupil = p.oval(head, [side * 11, 8, 21], [3.6, 4.8, 2], '#242027');
      p.oval(head, [side * 11, 16, 16], [10, 3, 4], hair);
      return pupil;
    });
    const curls = variant === 3 ? 30 : variant === 2 ? 24 : 16;
    for (let n = 0; n < curls; n++) {
      const t = n / curls * Math.PI * 2;
      const r = 3.7 + random(n + 33 * variant) * 3.2;
      const y = 21 + Math.sin(t) * 8;
      p.oval(head, [Math.cos(t) * 22, y, Math.sin(t) * 11 - 4], [r * 1.3, r * 1.4, r], hair);
    }
    if (variant === 2) {
      for (const side of [-1, 1]) for (let n = 0; n < 6; n++) {
        p.oval(head, [side * (23 + n % 2 * 3), 15 - n * 6, -7 + n % 2 * 7],
          [7.5, 6, 10.5], n % 3 === 0 ? '#b2a697' : hair);
      }
    }
    if (variant === 1) {
      for (const side of [-1, 1]) p.oval(head, [side * 12, 8, 24], [11, 8, 2], '#181b27');
      p.box(head, 8, 2, 1, '#5c3938', [0, 9, 24]);
    }
    root.traverse(node => {
      if (!(node instanceof THREE.Mesh) || !(node.material instanceof THREE.MeshBasicMaterial)) return;
      const material = node.material;
      node.material = new THREE.MeshStandardMaterial({ color: material.color, roughness: .77 });
      material.dispose();
    });
    const puppet = { root, head, jaw, pupils };
    this.puppets.push(puppet);
    return puppet;
  }

  private dressLead() {
    const p = this.props;
    const f = this.singer;
    f.head.scene.scale.setScalar(2.18);
    for (let i = 0; i < 25; i++) {
      const t = i / 25 * Math.PI * 2;
      const r = 5 + random(i + 19) * 4;
      p.oval(f.root, [23 * Math.cos(t), 17 + 16 * Math.sin(t), (i < 14 ? -14 : -10) + 5 * Math.sin(t)],
        [r * 1.23, r * 1.49, r], i % 3 ? '#352627' : '#62413b');
    }
    for (const s of [-1, 1]) {
      p.oval(f.root, [s * 20, 0, -4], [6, 12, 6], '#a97558');
      const lapel = p.box(f.root, 8, 29, 2, '#46404c', [s * 11, -23, 10]);
      lapel.rotation.z = s * .44;
    }
    for (let i = 0; i < 3; i++) {
      const chain = p.ink(f.root);
      chain.begin();
      p.line(chain, [[-12, -16 - 4 * i, 12], [-7, -22 - 4 * i, 14], [0, -24 - 4 * i, 16],
        [7, -22 - 4 * i, 14], [12, -16 - 4 * i, 12]], ['#cf5160', '#ded1ad', '#408b91'][i], 1.55);
      chain.end();
    }
    const mic = new THREE.Group();
    f.root.add(mic);
    p.tube(mic, [0, -3, 0], [0, 8, 0], 3, '#4a4448');
    p.oval(mic, [0, 8, 0], [4.9, 4.9, 4.9], '#c2b7ae');
    return mic;
  }

  private dressAnchor() {
    const p = this.props;
    const f = this.broadcast;
    f.head.scene.scale.setScalar(2.15);
    f.root.add(this.whiteWig);
    for (let i = 0; i < 15; i++) {
      const t = i / 15 * Math.PI * 2;
      p.oval(this.whiteWig, [24 * Math.cos(t), 16 + Math.sin(t) * 13, -10], [7, 9, 9], '#c1bdc3');
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        p.oval(this.whiteWig, [side * (17 - i * 1.5), -15 - i * 5, 2], [7, 12, 5], i % 2 ? '#d0cbd0' : '#aea9b3');
      }
      p.oval(f.root, [side * 24, 9, -10], [7, 8, 7], '#88809b');
    }
  }

  private guitar(g: THREE.Object3D, at: Point, color: string, neck = 56) {
    const p = this.props;
    const instrument = new THREE.Group();
    g.add(instrument);
    instrument.position.set(...at);
    instrument.rotation.z = -.75;
    p.oval(instrument, [0, -13, 0], [16, 21, 5], color);
    p.oval(instrument, [0, -1, 1], [11, 14, 5], '#e6d4bc');
    p.box(instrument, 6, neck, 4, '#9e775e', [0, neck * .5, 0]);
    p.box(instrument, 10, 10, 4, '#c99558', [0, neck + 4, 0]);
    for (let i = 0; i < 4; i++) p.box(instrument, .22, neck + 21, .25, '#dbcdb2', [i - 1.5, neck * .5 - 4, 2.8]);
    for (let i = 0; i < 9; i++) p.box(instrument, 6, .45, 2, '#dbbfa1', [0, i * neck / 10 + 4, 2.2]);
    return instrument;
  }

  private buildBand() {
    const g = this.set('band');
    const p = this.props;
    this.room(g, '#171a29', '#1e1822');
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const x = side * (62 + i * 42);
        p.oval(g, [x, 237 - i * 4, -150], [14, 15, 4], i % 2 ? '#c8d7eb' : '#eee2ba');
        p.oval(g, [x, 237 - i * 4, -154], [27, 28, 3], i % 2 ? '#496176' : '#685647');
      }
    }
    const guitarist = this.puppet(g, [114, 151, -34], '#292436', '#c59169', '#3e2825', 3);
    const bassist = this.puppet(g, [-116, 150, -42], '#263345', '#c38a72', '#2e2427');
    const drummer = this.puppet(g, [-44, 147, -105], '#613439', '#bd896c', '#302732', 3);
    const keys = this.puppet(g, [214, 137, -95], '#2c222b', '#b98261', '#271c23');
    this.bands.push(guitarist, bassist, drummer, keys);
    this.guitar(guitarist.root, [17, -58, 21], '#dea358');
    this.guitar(bassist.root, [8, -60, 21], '#eadcbb', 68);
    p.box(keys.root, 86, 9, 21, '#171820', [0, -68, 23]);
    for (let i = 0; i < 18; i++) p.box(keys.root, 3.7, 1.2, 13, i % 5 === 2 ? '#372737' : '#ded0bd', [i * 4.5 - 38, -62.8, 24]);
    const bassDrum = p.mesh(g, new THREE.CylinderGeometry(31, 31, 28, 32), [-44, 42, -59], '#bb9c86');
    bassDrum.rotation.x = Math.PI / 2;
    p.oval(g, [-44, 42, -43], [29, 29, 2.2], '#d6bbad');
    p.oval(g, [-44, 42, -40], [12, 12, .8], '#715969');
    for (const side of [-1, 1]) {
      const x = -44 + side * 52;
      p.tube(g, [x, 15, -65], [x, 120, -75], 2, '#aaa6a5');
      p.oval(g, [x, 120, -75], [25, 2.5, 17], GOLD);
      p.oval(g, [-44 + side * 23, 82, -63], [16, 9, 11], '#dac8b7');
    }
  }

  private buildCritic() {
    const p = this.props;
    const g = this.set('critic');
    this.room(g, '#471324', '#25111f');
    p.oval(g, [0, 151, -160], [109, 101, 5], '#c12b3c');
    p.oval(g, [0, 151, -151], [87, 85, 2], '#f15b47');
    const critic = this.puppet(g, [0, 141, 17], '#19161c', '#b9836a', '#2f222c', 1);
    critic.root.scale.setScalar(1.31);
    p.oval(critic.root, [0, -22, 30], [10, 8, 5], '#562b2e');
    this.label(g, 'THE CRITIC', [0, 251, -145], [122, 15], '#ffd2ab', true);
    return critic;
  }

  private crt(g: THREE.Object3D, at: Point, width: number, height: number, color: string) {
    const p = this.props;
    const caseGroup = new THREE.Group();
    g.add(caseGroup);
    caseGroup.position.set(...at);
    p.box(caseGroup, width + 22, height + 17, 23, '#161822', [0, 0, -13]);
    p.box(caseGroup, width + 8, height + 7, 3, '#37465e', [0, 0, 0]);
    p.box(caseGroup, width, height, 2, color, [0, 0, 3]);
    for (let i = 0; i < 10; i++) p.box(caseGroup, width - 3, .5, .3, '#374a64', [0, -height * .42 + i * height * .092, 4.1]);
    p.oval(caseGroup, [width / 2 + 4, -height / 2 - 3, 1], [1.4, 1.4, 1.4], RED);
    return caseGroup;
  }

  private buildBroadcasts() {
    const p = this.props;
    const news = this.set('news');
    this.room(news, '#151b2a', '#10151e');
    const tv = this.crt(news, [0, 139, -57], 245, 139, '#294460');
    const anchors = [
      this.puppet(tv, [-54, 2, 38], '#373b59', '#b48163', '#866a60', 1),
      this.puppet(tv, [49, -2, 39], '#243254', '#ba836a', '#342638', 3),
    ];
    for (const cast of anchors) cast.root.scale.setScalar(.70);
    p.box(tv, 243, 25, 4, '#dddddf', [0, -57, 56]);
    p.box(tv, 46, 25, 5, '#9a1f36', [-98, -57, 57]);
    this.label(tv, 'LIVE', [-98, -57, 61], [31, 12], '#faf2da', true);
    const scroll = ['ON THE MEDIA', 'INTERVIEW', 'THE NEWSROOM'];
    for (const title of scroll) {
      const tile = new THREE.Group();
      tv.add(tile);
      this.label(tile, title, [17, -57, 60], [127, 13], '#272b3b', true);
      this.newsCards.push(tile);
    }

    const control = this.set('control');
    this.room(control, '#10192a', '#141720');
    for (const [i, x] of [-152, -62, 62, 152].entries()) {
      const panel = this.crt(control, [x, 169 + (i % 2) * 19, -92], 79, 55, '#223a55');
      this.label(panel, ['FEED 01', 'STUDIO', 'MONITOR', 'FEED 04'][i], [0, 2, 5], [57, 10], SKY, true);
    }
    const buttons = new THREE.Group();
    control.add(buttons);
    buttons.rotation.x = -.45;
    buttons.position.set(13, 84, 20);
    p.box(buttons, 215, 53, 12, '#292530', [0, 0, -9]);
    for (let i = 0; i < 11; i++) p.box(buttons, 13, 11, 4, i % 3 === 0 ? '#df4e39' : '#773341', [i * 17 - 84, -13, 0]);
    p.oval(buttons, [-52, 13, 1], [17, 16, 5], '#398da7');
    p.oval(buttons, [55, 13, 1], [17, 16, 5], '#c8283b');
    this.label(buttons, 'ON AIR', [0, 14, 0], [62, 11], '#fba6a2', true);
    const owner = this.puppet(control, [0, 144, -7], '#292331', '#9f5855', '#b77e6b', 1);
    owner.root.scale.setScalar(.82);
  }

  private buildCinema() {
    const p = this.props;
    const g = this.set('cinema');
    this.room(g, '#2e212a', '#201926');
    for (const side of [-1, 1]) {
      p.box(g, 63, 188, 10, '#5f343e', [side * 168, 95, -88]);
      p.box(g, 49, 81, 4, '#232a39', [side * 168, 117, -79]);
      p.box(g, 40, 69, 3, side > 0 ? '#56455f' : '#343d64', [side * 168, 117, -74]);
    }
    p.box(g, 305, 39, 16, '#f0dabc', [0, 220, -60]);
    this.label(g, '2001: A SPACE ODYSSEY', [0, 222, -49], [285, 19], '#34252e', true);
    for (let i = 0; i < 24; i++) p.oval(g, [(i - 11.5) * 12.2, 192, -41], [3.4, 3.4, 3.4], GOLD);
    const reader = this.puppet(g, [0, 136, 6], '#312b39', '#aa7d61', '#352529', 3);
    const paper = new THREE.Group();
    reader.root.add(paper);
    p.box(paper, 78, 50, 1.5, '#cec2a3', [0, -29, 30]);
    this.label(paper, 'THE DAILY NEWS', [0, -13, 31.1], [67, 9], '#332b2b', true);
    for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
      p.box(paper, 32 - 5 * random(i), .6, .3, '#675759', [side * 17, -19 - i * 5.8, 31]);
    }
    return paper;
  }

  private buildProtest() {
    const p = this.props;
    const g = this.set('protest');
    this.room(g, '#273649', '#233345');
    for (let i = 0; i < 13; i++) {
      const x = (i - 6) * 39;
      const h = 45 + random(i * 8) * 101;
      p.box(g, 29, h, 15, i % 2 ? '#364862' : '#32384e', [x, h / 2, -145]);
    }
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * 51;
      const cast = this.puppet(g, [x, 119 + random(i) * 16, -22 - (i % 2) * 25],
        i === 3 ? '#d39748' : '#263f55', i % 2 ? '#aa755b' : '#ae856f', i % 2 ? '#332938' : '#454059', i % 3 === 0 ? 3 : 0);
      cast.root.scale.setScalar(i === 3 ? 1.12 : .65);
      if (i !== 3) {
        p.tube(cast.root, [26, -76, 12], [33, 78, 1], 2, '#926e53');
        p.box(cast.root, 50, 29, 3, i % 2 ? '#9bb3ac' : '#cfb28c', [33, 63, 1]);
        if (i === 2 || i === 4) this.label(cast.root, 'ON AIR', [33, 63, 4], [43, 10], '#463637', true);
      }
    }
    const horn = p.mesh(g, new THREE.CylinderGeometry(7, 18, 38, 20), [39, 117, 29], '#9c9caa');
    horn.rotation.z = Math.PI * .63;
  }

  private buildBach() {
    const p = this.props;
    const g = this.set('bach');
    this.room(g, '#201924', '#251725');
    const bach = this.puppet(g, [-20, 143, -9], '#633b39', '#c7906c', '#ded4ba', 2);
    bach.root.scale.setScalar(1.20);
    this.puppet(g, [-118, 128, -56], '#4c323e', '#a6785b', '#633b38', 1).root.scale.setScalar(.67);
    p.box(g, 130, 22, 56, '#42252b', [21, 63, 7]);
    p.oval(g, [-35, 82, 26], [29, 3, 17], '#a36e41');
    for (const x of [43, 75, 113]) {
      const height = 35 + (x % 30);
      p.tube(g, [x, 76, 52], [x, 78 + height, 52], 3, '#b28655');
      p.oval(g, [x, 77, 52], [11, 2.4, 6], '#957050');
      p.box(g, 5, 21, 5, '#eec78a', [x, 88 + height, 52]);
      this.flames.push(p.oval(g, [x, 104 + height, 53], [4, 10, 3], '#ffeab2'));
    }
    this.label(g, 'LEIPZIG', [0, 232, -84], [111, 15], '#b79072', true);
  }

  private buildBeach() {
    const p = this.props;
    const g = this.set('beach');
    this.room(g, '#a77585', '#b68e7a');
    p.box(g, 980, 82, 2, '#807ca0', [0, 53, -164]);
    p.oval(g, [112, 114, -160], [29, 29, 4], '#fbc194');
    for (let i = 0; i < 11; i++) p.box(g, 35 + random(i) * 112, 1.4, 2, i % 2 ? '#caadb3' : '#ac98a5',
      [(i - 5) * 48, 57 + i * 2.2, -158]);
    const a = this.puppet(g, [-49, 125, 6], '#565564', '#cc9d7e', '#bfb3a9', 1);
    const b = this.puppet(g, [49, 123, 6], '#403646', '#b18166', '#47303b', 3);
    a.root.rotation.y = .23;
    b.root.rotation.y = -.23;
    p.oval(g, [0, 78, 24], [18, 7, 5.5], '#bc8e70');
  }

  private buildSanctuary() {
    const p = this.props;
    const g = this.set('sanctuary');
    this.room(g, '#621e32', '#2d1426');
    for (let i = 0; i < 21; i++) p.box(g, 12, 280, 8, i % 2 ? '#733341' : '#451527', [(i - 10) * 22, 137, -103]);
    for (let i = 0; i < 17; i++) p.oval(g, [(i - 8) * 22, 236, -12], [3.5, 3.5, 3.5], GOLD);
    this.puppet(g, [-58, 141, -12], '#2d2936', '#c29271', '#d1baa9', 1);
    this.puppet(g, [57, 133, -18], '#34273b', '#ad8060', '#463139', 3);
    p.box(g, 149, 51, 23, '#603e35', [0, 67, 36]);
    this.label(g, 'INDEPENDENT MEDIA', [0, 78, 49], [126, 11], '#eccea9');
    this.label(g, 'SANCTUARY', [0, 61, 49], [126, 15], '#eccea9');
    for (let i = 0; i < 8; i++) p.oval(g, [(i - 3.5) * 46, 37 + (i % 2) * 14, 102], [7, 14, 7], '#a36d6b');
  }

  private buildPartyAndCell() {
    const p = this.props;
    const party = this.set('party');
    this.room(party, '#2d1736', '#20172b');
    for (let i = 0; i < 28; i++) {
      p.oval(party, [random(i * 4) * 479 - 239, random(i * 7) * 165 + 30, -121],
        [9, 6, 2], i % 2 ? '#783452' : '#2a587c');
    }
    this.puppet(party, [-65, 141, 4], '#312b3f', '#64aabe', '#282c42', 1).root.scale.setScalar(1.1);
    this.puppet(party, [65, 144, 4], '#315776', '#8cb0c2', '#3c3148', 1).root.scale.setScalar(1.12);
    p.box(party, 246, 28, 4, '#ccdae0', [0, 49, 74]);
    this.label(party, 'BILLIONAIRES CELEBRATE', [0, 49, 77], [212, 13], '#412a39', true);
    const cell = this.set('cell');
    this.room(cell, '#262633', '#161a25');
    this.puppet(cell, [28, 135, 10], '#484052', '#a17669', '#34243c', 3);
    for (let i = 0; i < 8; i++) p.tube(cell, [(i - 3.5) * 42, 1, 64], [(i - 3.5) * 42, 225, 64], 3.1, '#47495d');
    p.box(cell, 303, 5, 4, '#48495a', [0, 187, 62]);
  }

  private buildOrbit() {
    const p = this.props;
    const g = this.set('orbit');
    g.add(this.orbitBone, this.orbitRocket);
    for (let i = 0; i < 132; i++) {
      const a = .25 + random(i * 9) * 1.15;
      p.oval(g, [(-.5 + random(i * 4)) * 990, random(i * 11) * 550 - 100, -150], [a, a, .3], i % 4 ? '#77758a' : '#c8c1bc');
    }
    p.tube(this.orbitBone, [0, -51, 0], [0, 51, 0], 7, '#e3cdb7');
    for (const side of [-1, 1]) for (const other of [-1, 1]) {
      p.oval(this.orbitBone, [side * 7, other * 54, 0], [10, 11, 8], '#e8d3bd');
    }
    p.tube(this.orbitRocket, [0, -58, 0], [0, 47, 0], 6.2, '#e6ddd4');
    p.oval(this.orbitRocket, [0, 48, 0], [6.2, 15, 6.2], '#f1e7db');
    p.box(this.orbitRocket, 12.7, 7.2, 12.7, '#352f41', [0, 30, 0]);
    for (const side of [-1, 1]) p.box(this.orbitRocket, 14, 18, 1.6, '#bbb0ae', [side * 7, -49, 0]);
  }

  private buildCredits() {
    const p = this.props;
    const g = this.set('credits');
    const names = [
      ['DIRECTED BY', 'WARREN FU'], ['PUPPETRY', 'SPITTING IMAGE'],
      ['THE STROKES', 'LONELY IN THE FUTURE'], ['VOCAL SYNTHESIS', 'CHIMERA'],
    ];
    for (const [i, pair] of names.entries()) {
      const item = new THREE.Group();
      g.add(item);
      if (i < 2) {
        this.puppet(item, [-68, 125, 19], '#644b55', '#aa795d', '#d9cbb4', 2).root.scale.setScalar(.79);
        for (const x of [-35, -17]) {
          p.box(item, 3.5, 33 + x * -.2, 3.5, '#d3a66b', [x, 101, 26]);
          this.flames.push(p.oval(item, [x, 123 + x * -.14, 26], [2.6, 5.5, 2.5], '#ffe1a3'));
        }
      } else {
        this.crt(item, [-76, 124, -17], 143, 104, i === 2 ? '#3a4162' : '#69243d');
        this.puppet(item, [-76, 132, 17], '#40354e', '#6ca7b9', '#312936', i === 2 ? 3 : 1).root.scale.setScalar(.65);
      }
      this.label(item, pair[0], [64, 136, 12], [106, 10], '#b59766', true);
      this.label(item, pair[1], [64, 116, 12], [140, 13], GOLD, true);
      this.cards.push(item);
      p.box(item, 34, 1, .4, '#795139', [64, 96 - i * .5, 12]);
    }
  }

  private buildMeditation() {
    const p = this.props;
    const g = this.set('meditation');
    this.room(g, '#242733', '#1e2029');
    p.oval(g, [0, 132, -152], [89, 89, 3], '#5f6673');
    p.oval(g, [0, 132, -143], [67, 68, 3], '#8f9096');
    const sage = this.puppet(g, [0, 131, 10], '#938f99', '#b69586', '#d3ced0', 2);
    p.oval(sage.root, [0, -31, 13], [16, 34, 8], '#c0b9be');
    p.oval(sage.root, [-22, -89, 4], [29, 10, 15], '#a4a1a7').rotation.z = -.20;
    p.oval(sage.root, [22, -89, 4], [29, 10, 15], '#b2afb0').rotation.z = .20;
    return sage;
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
    const auto = FUTURE_SHOTS.filter(shot => shot.time <= t).at(-1)?.view ?? 'future-band';
    const manualActor = view === 'future-julian' || view === 'future-broadcast';
    const selected = view === 'future-julian' ? 'future-singer' : view === 'future-broadcast' ? 'future-news'
      : Object.hasOwn(SHOTS, view) ? view as FutureView : auto;
    const shot = SHOTS[selected];
    for (const [name, group] of this.sets) group.visible = name === shot.set;
    const beat = t * 2 * Math.PI * 1.55;
    const target = new THREE.Vector3(...shot.target);
    const camera = new THREE.Vector3(...shot.from);
    if (this.camera.aspect < 1.12) {
      const ratio = Math.max(.60, this.camera.aspect);
      if (shot.set !== 'band' || selected === 'future-band') camera.z += (1.12 - ratio) * 174;
    }
    if (shot.set === 'band' && speaker === 'future-julian' && intensity > .03 && !manualActor) {
      const weight = this.camera.aspect < 1.12 ? .82 : .56;
      target.lerp(new THREE.Vector3(0, 157, 39), weight);
      camera.x *= 1 - weight;
    }
    camera.x += 3 * Math.sin(t * 1.17);
    this.camera.position.copy(camera);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld(true);
    const leadOnStage = shot.set === 'band' && view !== 'future-broadcast';
    const insetLead = shot.set !== 'band' && speaker === 'future-julian' && intensity > .03 && !manualActor;
    const visibleAnchor = view === 'future-broadcast' || speaker === 'future-broadcast' && intensity > .03;
    this.singer.root.visible = leadOnStage || insetLead;
    this.broadcast.root.visible = visibleAnchor;
    this.inset.visible = insetLead || visibleAnchor && shot.set !== 'news' && shot.set !== 'meditation';
    const focus = visibleAnchor ? this.broadcast : this.singer;

    if (this.inset.visible) {
      const portrait = this.camera.aspect < .98;
      const at = new THREE.Vector3(portrait ? 0 : -.68, portrait ? -.62 : -.53, .992).unproject(this.camera);
      this.inset.position.copy(at);
      this.inset.quaternion.copy(this.camera.quaternion);
      this.inset.scale.setScalar(portrait ? 1.02 : .92);
      focus.root.position.copy(at);
      focus.root.scale.setScalar(portrait ? .92 : .84);
    }
    if (leadOnStage) {
      this.singer.root.position.set(Math.sin(beat * .5) * 7, 166 + Math.cos(beat) * 2.2, 42);
      this.singer.root.scale.setScalar(1.12);
    }
    if (visibleAnchor && (shot.set === 'news' || shot.set === 'meditation')) {
      this.broadcast.root.position.set(0, shot.set === 'meditation' ? 131 : 145, shot.set === 'meditation' ? 25 : 10);
      this.broadcast.root.scale.setScalar(1.02);
    }
    const meditationLine = shot.set === 'meditation' && visibleAnchor;
    this.meditation.head.visible = !meditationLine;
    this.whiteWig.visible = meditationLine;
    for (const piece of [this.broadcast.torso, ...this.broadcast.arms, ...this.broadcast.hands,
      ...this.broadcast.legs, ...this.broadcast.feet]) piece.visible = !meditationLine;
    if (meditationLine) this.broadcast.root.position.y += 6 * Math.sin((t - 249.21) * .6);
    if (this.singer.root.visible) {
      const gestures: typeof HANDS = [
        HANDS[0], [-24 + 11 * Math.sin(beat * .46), -53 + 9 * Math.cos(beat * .72), 14],
        HANDS[2], [22, -17 + 2.2 * Math.cos(beat), 21],
      ];
      this.singer.pose(t, gestures);
      this.microphone.position.set(22, -15 + 2.2 * Math.cos(beat), 21);
      this.microphone.rotation.z = .24 + .08 * Math.sin(beat);
      this.singer.head.scene.rotation.y = -Math.PI / 2 - .14 + .18 * Math.sin(beat * .38);
      this.singer.head.scene.rotation.z = .055 * Math.sin(beat * .6);
      this.singer.update(t, playing, this.camera, dt, reset);
    }
    if (this.broadcast.root.visible) {
      this.broadcast.pose(t, HANDS, true);
      this.broadcast.head.scene.rotation.y = -Math.PI / 2 + .09 * Math.sin(beat);
      this.broadcast.update(t, playing, this.camera, dt, reset);
    }

    for (const [i, puppet] of this.puppets.entries()) {
      puppet.head.rotation.set(.035 * Math.sin(beat + i), .11 * Math.sin(t * 1.8 + i * 2), .04 * Math.cos(t * 2.3 + i));
      puppet.jaw.position.y = -23 - Math.max(0, Math.sin(beat * 1.7 + i)) * (puppet === this.critic ? 4 : 2);
      puppet.pupils.forEach((pupil, j) => { pupil.position.x = (j === 0 ? -11 : 11) + 1.7 * Math.sin(t * 1.4 + i); });
    }
    this.bands.forEach((puppet, i) => { puppet.root.rotation.z = .075 * Math.sin(beat * .5 + i); });
    this.flames.forEach((flame, i) => { flame.scale.y = 9 + 2 * Math.sin(t * 17 + i); });
    this.newspaper.rotation.y = .19 * Math.sin(t * 2);
    this.critic.head.rotation.z += .07 * Math.sin(t * 2.3);
    this.meditation.root.position.y = 131 + 6 * Math.sin((t - 249.21) * .6);
    this.orbitRocket.visible = t < 198.72;
    this.orbitBone.visible = !this.orbitRocket.visible;
    this.orbitRocket.position.set(-38 + 26 * (t - 195.5), 104 + 15 * (t - 195.5), 8);
    this.orbitBone.position.set(2, 132, 8);
    this.orbitRocket.rotation.set(.2, .6, -.56 - (t - 195.5) * .42);
    this.orbitBone.rotation.set(.60, .34 * t, (t - 198.72) * 1.6);
    this.cards.forEach((card, i) => { card.visible = i === Math.min(3, Math.max(0, Math.floor((t - 201.75) / 11.6))); });
    this.newsCards.forEach((card, i) => { card.visible = i === (t < 23 ? 1 : t < 56 ? 0 : 2); });
    (this.scene.background as THREE.Color).set(shot.set === 'orbit' ? '#080913' : BLACK);
  }

  dispose() {
    this.singer.dispose();
    this.broadcast.dispose();
    this.props.dispose();
    this.textures.forEach(texture => texture.dispose());
  }
}
