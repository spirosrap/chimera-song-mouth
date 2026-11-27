import * as THREE from 'three';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { EMO_GIRL_SHOTS, type EmoGirlId, type EmoGirlView } from '../../scene/emo-girl.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { VoiceModel } from '../analysis.ts';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';

type Actor = { id: CharacterId; model: VoiceModel; track: TeleTrack };
type SetName = 'snow' | 'rainbow' | 'alley' | 'plaza' | 'night' | 'store' | 'room' | 'yard' | 'end';
type Shot = { set: SetName; from: Point; target: Point; singer?: EmoGirlId; roll?: number };
const SHOTS: Record<EmoGirlView, Shot> = {
  'emo-snow': { set: 'snow', from: [31, 143, 350], target: [0, 95, 0] },
  'emo-snow-portrait': { set: 'snow', from: [3, 158, 162], target: [0, 146, 0] },
  'emo-snow-profile': { set: 'snow', from: [-80, 153, 143], target: [0, 145, 0], roll: .019 },
  'emo-rainbow': { set: 'rainbow', from: [22, 139, 305], target: [0, 102, 0], singer: 'emo-fantano' },
  'emo-brick-alley': { set: 'alley', from: [-15, 144, 306], target: [0, 102, 0], singer: 'emo-fantano' },
  'emo-fisheye': { set: 'alley', from: [56, 210, 239], target: [0, 99, 0], singer: 'emo-fantano', roll: -.23 },
  'emo-crowd': { set: 'plaza', from: [-13, 169, 315], target: [0, 98, 0], roll: -.024 },
  'emo-dance': { set: 'plaza', from: [61, 135, 293], target: [0, 91, 0], roll: .047 },
  'emo-night': { set: 'night', from: [-32, 144, 285], target: [0, 110, 0], roll: .056 },
  'emo-storefront': { set: 'store', from: [37, 152, 316], target: [0, 107, 0], roll: -.08 },
  'emo-living-room': { set: 'room', from: [-40, 156, 312], target: [0, 109, 0] },
  'emo-backyard': { set: 'yard', from: [18, 144, 347], target: [0, 94, 0] },
  'emo-outro': { set: 'end', from: [0, 120, 330], target: [0, 100, 0] },
};

const PALETTE: Record<SetName, string> = {
  snow: '#a6c8d8', rainbow: '#3a3865', alley: '#272142', plaza: '#96a7ba',
  night: '#202334', store: '#221b36', room: '#99929a', yard: '#646e81', end: '#080710',
};

export class EmoGirlStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, .5, 2100);
  private readonly props = new VideoProps();
  private readonly sets = new Map<SetName, THREE.Group>();
  private readonly outfits: Record<'winter' | 'rainbow' | 'hoodie', VideoFigure>;
  private readonly dancers: THREE.Group[] = [];
  private readonly backdrop = new THREE.Color();
  private lastTime = -1;
  private lastEpoch = -1;
  private lastView?: CameraView;

  constructor(actors: Actor[]) {
    const p = this.props;
    const yuno = actors.find(actor => actor.id === 'emo-yuno')!;
    const fantano = actors.find(actor => actor.id === 'emo-fantano')!;
    this.outfits = {
      winter: new VideoFigure(yuno.model, yuno.track, p, this.scene, '#282530', '#976b59'),
      rainbow: new VideoFigure(fantano.model, fantano.track, p, this.scene, '#164da6', '#e2bca1'),
      hoodie: new VideoFigure(yuno.model, yuno.track, p, this.scene, '#d4d6df', '#976b59'),
    };
    this.scene.background = this.backdrop;
    for (const name of Object.keys(PALETTE) as SetName[]) {
      const group = new THREE.Group();
      this.sets.set(name, group);
      this.scene.add(group);
    }
    this.costumes();
    this.winter();
    this.alley();
    this.plaza();
    this.street();
    this.interiors();
  }

  private costumes() {
    const p = this.props;
    const { winter, rainbow, hoodie } = this.outfits;
    // The hair sits on the head's accessory rig, leaving the airway cutaway visible.
    p.oval(winter.ornaments, [-8, 15, -2], [16.5, 13, 17], '#191723');
    for (let i = 0; i < 10; i++) {
      const lock = p.oval(winter.ornaments, [-14 + i * 2.65, 11 - i * 1.36, -10 - i * .22],
        [3.9, 11 + i * .95, 3.8], i % 3 ? '#292333' : '#403544');
      lock.rotation.z = -.74 + i * .053;
    }
    p.oval(winter.ornaments, [-12, -2, 10], [7, 20, 9], '#1c1925');
    p.box(winter.root, 1.7, 48, 1, '#aaa1ac', [0, -44, 13.3]);
    for (const side of [-1, 1]) {
      p.oval(winter.root, [side * 13.5, -42, 12], [9, 27, 4], '#36323e');
      p.oval(hoodie.ornaments, [-4, 0, side * 12.5], [12, 22, 7], '#aeb3c5');
      p.tube(hoodie.root, [side * 5, -17, 14], [side * 7, -40, 13], .6, '#f1eadc');
    }
    p.oval(hoodie.ornaments, [-5, 17, 0], [13, 6.5, 19], '#e1e2ea');
    p.oval(rainbow.ornaments, [-7, 15, 0], [12, 8, 14], '#b38c7f');
    const puffer = ['#ecd656', '#e65564', '#2973ca', '#278d72', '#ef8054'];
    p.box(rainbow.root, 2, 55, 1, '#242541', [0, -43, 14]);
    for (const [i, color] of puffer.entries()) {
      const y = -24 - i * 8.2;
      p.box(rainbow.root, 17, 7.4, 3, color, [-10, y, 12]);
      p.box(rainbow.root, 17, 7.4, 3, puffer[(i + 2) % puffer.length], [10, y, 12]);
    }
    for (const [i, arm] of rainbow.arms.entries()) {
      (arm.material as THREE.MeshBasicMaterial).color.set(puffer[(i + 2) % puffer.length]);
    }
    for (const actor of [winter, rainbow, hoodie]) {
      for (const leg of actor.legs) {
        (leg.material as THREE.MeshBasicMaterial).color.set(actor === hoodie ? '#70628a' : '#424c68');
      }
    }
  }

  private ground(set: SetName, color: string) {
    const group = this.sets.get(set)!;
    this.props.box(group, 1040, 5, 900, color, [0, -3, -175]);
    return group;
  }

  private winter() {
    const p = this.props;
    const snow = this.ground('snow', '#c0cbd4');
    p.box(snow, 750, 1, 88, '#a0acb7', [0, .1, 41]);
    p.box(snow, 750, 5, 3, '#e0e7e6', [0, 1, 84]);
    const yard = this.ground('yard', '#535968');
    for (const [i, group] of [snow, yard].entries()) {
      const wall = i ? '#8a7b91' : '#909caa';
      p.box(group, 191, 106, 78, wall, [118, 53, -177]);
      const roof = p.mesh(group, new THREE.CylinderGeometry(0, 118, 59, 4, 1), [118, 134, -177], '#55586d');
      roof.rotation.y = Math.PI / 4;
      for (let row = 0; row < 11; row++) p.box(group, 191, .9, 1.3, '#a5a6b4', [118, 8 + row * 9, -137]);
      for (const x of [60, 172]) {
        p.box(group, 36, 41, 2, '#d9d5d1', [x, 66, -135]);
        p.box(group, 29, 34, 2, '#474e68', [x, 66, -133]);
        p.box(group, 29, 1.7, 2, '#d9d5d1', [x, 66, -131]);
        p.box(group, 1.7, 34, 2, '#d9d5d1', [x, 66, -131]);
      }
      for (let j = 0; j < 7; j++) {
        const x = -220 + 37 * j, z = -113 - (j % 3) * 35, h = 145 + j % 3 * 28;
        p.tube(group, [x, 0, z], [x + 9, h, z - 11], 2.8, '#645663');
        for (let k = 0; k < 4; k++) {
          const side = k % 2 ? 1 : -1;
          p.tube(group, [x + 5, h - 70 + k * 17, z], [x + side * (25 - k * 2), h - 46 + k * 21, z - 3], 1.1, '#726474');
        }
      }
    }
    for (let i = 0; i < 13; i++) {
      p.oval(snow, [i * 45 - 265, 1, -46 - i % 4 * 12], [25 + i % 3 * 7, 3.3, 19], '#dee8ed');
      p.box(yard, 15, 71 + i % 3 * 1.2, 4, i % 3 ? '#9c8398' : '#ad95a8', [i * 16 + 32, 36, -63]);
    }
  }

  private alley() {
    const p = this.props;
    const alley = this.ground('alley', '#484456');
    const rainbow = this.ground('rainbow', '#444366');
    const colors = ['#701d65', '#333e80', '#1f667d', '#ab4c6d'];
    for (const [i, color] of colors.entries()) {
      p.box(rainbow, 105, 225, 4, color, [(i - 1.5) * 105, 112, -116]);
      p.oval(rainbow, [(i - 1.5) * 82, 1, -23], [58, .7, 65], color);
    }
    for (const side of [-1, 1]) {
      p.box(alley, 9, 229, 430, '#76515b', [side * 98, 113, -124]);
      for (let row = 0; row < 18; row++) {
        const y = 5 + row * 12;
        p.box(alley, .8, 1.35, 427, '#432f44', [side * 93, y, -124]);
        for (let j = 0; j < 11; j++) {
          p.box(alley, .8, 10.5, 1.25, '#563d4d', [side * 93, y + 5.8, 61 - j * 37 + (row % 2) * 17]);
        }
      }
      p.box(alley, 3.2, 1.1, 400, '#d7ac78', [side * 64, .6, -105]);
    }
    p.box(alley, 178, 180, 4, '#33293d', [0, 88, -299]);
    for (let i = 0; i < 9; i++) {
      const z = 74 - i * 37;
      p.tube(alley, [-90, 201, z], [90, 201, z - 18], .75, '#2b1927');
      for (const x of [-61, -18, 25, 64]) p.oval(alley, [x, 198, z - (x + 90) * .1], [2.5, 2.1, 2.5], '#ffe3a3');
    }
  }

  private plaza() {
    const p = this.props;
    const group = this.ground('plaza', '#908b99');
    p.box(group, 551, 173, 15, '#646477', [0, 85, -143]);
    p.box(group, 382, 26, 2, '#a73d65', [0, 120, -132]);
    for (let i = 0; i < 11; i++) {
      const x = i * 44 - 220;
      p.box(group, 32, 55, 2, i % 3 ? '#3a4059' : '#535473', [x, 76, -133]);
      p.box(group, 30, 2, 1, '#a3a5af', [x, 94, -131]);
      p.box(group, 3, 31, 1, '#e5ae83', [x, 123, -130]);
    }
    for (let i = 0; i < 25; i++) {
      const x = (i % 13 - 6) * 26, z = -85 + Math.floor(i / 13) * 24;
      const coat = ['#37374e', '#764d64', '#3f6772', '#ae6870', '#424954'][i % 5];
      const extra = new THREE.Group();
      extra.position.set(x, 0, z);
      extra.scale.setScalar(.7 + (i * 7 % 6) * .043);
      group.add(extra);
      this.dancers.push(extra);
      p.oval(extra, [0, 105, 0], [10, 13, 9], i % 3 ? '#b7928d' : '#735568');
      p.oval(extra, [0, 66, 0], [16, 31, 10], coat);
      p.tube(extra, [-6, 6, 1], [-8, 45, -1], 4.5, '#39374b');
      p.tube(extra, [6, 6, 1], [8, 45, -1], 4.5, '#39374b');
    }
    for (let row = 0; row < 10; row++) p.box(group, 800, .56, 1, '#b0a3a4', [0, .2, row * 33 - 117]);
  }

  private street() {
    const p = this.props;
    const night = this.ground('night', '#383446');
    for (let i = 0; i < 8; i++) {
      const x = i % 2 ? 84 : -101, z = -19 - i * 35;
      p.box(night, 67, 54 + i * 7, 42, i % 2 ? '#35304c' : '#463448', [x * 1.45, 22, z]);
      p.tube(night, [x, 0, z], [x, 143, z], 1.6, '#747480');
      p.oval(night, [x + 6, 143, z], [8, 3, 5], i % 2 ? '#ebba95' : '#e6949d');
      p.oval(night, [x, .45, z], [22, .47, 34], i % 2 ? '#574b56' : '#63505d');
    }
    const store = this.ground('store', '#484158');
    p.box(store, 367, 106, 45, '#433958', [15, 50, -114]);
    p.box(store, 367, 7, 58, '#f0b66f', [15, 108, -104]);
    p.box(store, 367, 3, 58, '#dc6785', [15, 114, -104]);
    for (const x of [-121, -51, 19, 89, 159]) {
      p.box(store, 59, 67, 2, '#d89d7f', [x, 55, -89]);
      p.box(store, 53, 61, 2, '#715675', [x, 55, -87]);
      p.box(store, 53, 2, 2, '#e2be89', [x, 64, -85]);
    }
  }

  private interiors() {
    const p = this.props;
    const room = this.ground('room', '#7f7184');
    p.box(room, 550, 230, 6, '#b9aeb9', [0, 110, -99]);
    p.box(room, 88, 83, 4, '#686479', [116, 112, -94]);
    for (let i = 0; i < 11; i++) p.box(room, 87, 4, 2, '#d0c8cb', [116, 74 + i * 7, -91]);
    p.box(room, 151, 35, 53, '#363142', [-70, 20, -46]);
    p.box(room, 151, 38, 14, '#3b354a', [-70, 44, -69]);
    p.oval(room, [86, 56, 8], [37, 2.8, 25], '#a38980');
    p.tube(room, [86, 1, 4], [86, 55, 4], 3.8, '#665463');
    p.oval(room, [86, 59, 8], [17, 4, 12], '#ea9e84');
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.props.resize(width, height);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const automatic = EMO_GIRL_SHOTS.filter(shot => shot.time <= time).at(-1)?.view ?? 'emo-snow';
    const selected = view === 'emo-yuno' ? 'emo-snow-portrait' : view === 'emo-fantano' ? 'emo-brick-alley'
      : view === 'wide' ? automatic : view as EmoGirlView;
    const shot = SHOTS[selected] ?? SHOTS[automatic];
    for (const [name, group] of this.sets) group.visible = name === shot.set;
    this.backdrop.set(PALETTE[shot.set]);
    const reset = this.lastEpoch !== epoch || this.lastView !== view || Math.abs(time - this.lastTime) > .19;
    const dt = reset ? 0 : Math.max(0, time - this.lastTime);
    const action = time * 5.3;
    const singer = view === 'emo-yuno' || view === 'emo-fantano' ? view : speaker ?? shot.singer;
    const outfit = singer === 'emo-fantano' ? 'rainbow'
      : ['snow', 'plaza', 'alley', 'rainbow'].includes(shot.set) ? 'winter' : 'hoodie';
    for (const [name, figure] of Object.entries(this.outfits)) {
      figure.root.visible = shot.set !== 'end' && name === outfit;
    }
    const actor = this.outfits[outfit];
    const [x, y, z] = shot.from;
    const drift = shot.set === 'snow' ? 2.2 : 5.6;
    this.camera.position.set(x + drift * Math.sin(time * 1.9), y + 2.2 * Math.cos(time * .94), z);
    this.camera.fov = this.camera.aspect < 1 ? 49 : 37;
    this.camera.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
    this.camera.lookAt(...shot.target);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    if (actor.root.visible) {
      const bounce = shot.set === 'snow' ? 1.4 : 4.3;
      actor.root.position.set(3 * Math.sin(action * .48), 148 + bounce * Math.sin(action), 0);
      actor.root.rotation.y = .04 * Math.sin(action * .52);
      const lively = outfit === 'rainbow' || shot.set === 'plaza';
      const reach = lively ? 24 + intensity * 13 : 9 + intensity * 5;
      actor.pose(time, [
        [-28, -35 + reach * Math.sin(action * .83), 9], [-34, -55 + reach * Math.sin(action * .83), 22],
        [27, -35 + reach * Math.cos(action * .71), 9], [32, -56 + reach * Math.cos(action * .71), 22],
      ]);
      actor.head.scene.rotation.y += x * .0025;
      actor.head.scene.rotation.z = .047 * Math.sin(action * .62);
      actor.update(time, playing, this.camera, dt, reset);
    }
    if (shot.set === 'plaza') this.dancers.forEach((dancer, i) => {
      dancer.position.y = 2.2 * Math.abs(Math.sin(action + i * .61));
      dancer.rotation.z = .068 * Math.sin(action + i * .96);
    });
    this.lastTime = time;
    this.lastEpoch = epoch;
    this.lastView = view;
  }

  dispose() {
    for (const actor of Object.values(this.outfits)) actor.dispose();
    this.props.dispose();
  }
}
