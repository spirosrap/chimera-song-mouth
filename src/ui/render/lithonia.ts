import * as THREE from 'three';
import {lithoniaCamera, lithoniaState, smoothStep, type LithoniaActor} from '../../scene/lithonia.ts';
import type {CameraView, CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure, VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {buildLithoniaSet, propGroup, stageMic} from './lithonia-set.ts';

export type LithoniaId = 'lith-gambino' | 'lith-harmony' | 'lith-witness';
type Performer = {id: LithoniaId; model: VoiceModel; track: TeleTrack};
type Figure = {
  role: LithoniaActor;
  figure: VideoFigure;
  hat: THREE.Group;
  glasses: THREE.Group;
  instrument?: THREE.Group;
};
const costumes: Record<LithoniaActor, {shirt: string; trousers: string; skin: string; hair: string}> = {
  lead: {shirt: '#d6dce0', trousers: '#aeae9b', skin: '#94725a', hair: '#787062'},
  keys: {shirt: '#255ba3', trousers: '#2f394b', skin: '#866047', hair: '#32292d'},
  drums: {shirt: '#c6b67a', trousers: '#555142', skin: '#ab8975', hair: '#443232'},
  guitar: {shirt: '#306c54', trousers: '#825850', skin: '#b3977e', hair: '#8d7058'},
  bass: {shirt: '#333034', trousers: '#2f302c', skin: '#a48873', hair: '#553b32'},
  listener: {shirt: '#cfd3cf', trousers: '#49414b', skin: '#bd9182', hair: '#a57558'},
  guest: {shirt: '#353238', trousers: '#34383d', skin: '#85624e', hair: '#292528'},
};

function guitar(p: VideoProps, root: THREE.Object3D, bass: boolean) {
  const instrument = propGroup(root, [0, -57, 26]);
  const finish = bass ? '#9a6850' : '#caab89';
  p.oval(instrument, [-12, 0, 0], [22, 17, 5.5], finish);
  p.oval(instrument, [6, 0, 0], [17, 14, 5], finish);
  p.oval(instrument, [-6, 0, 5], [14, 12, 1.3], bass ? '#534440' : '#e1cf9e');
  p.box(instrument, 68, bass ? 6.5 : 5.5, 4, '#5a4b44', [44, 1, 2]);
  p.box(instrument, 18, 9, 4, '#95775d', [85, 1.8, 2]);
  for (let i = 0; i < 16; i++) {
    p.box(instrument, .4, 6.2, .7, '#96836b', [12 + i * 4.15, 1, 4.3]);
  }
  for (const x of [-10, 2, 11]) p.box(instrument, 3, 11, 1.6, '#333034', [x, 1, 6]);
  for (let i = 0; i < (bass ? 4 : 6); i++) {
    const y = (i - 2.5) * .87 + 1;
    p.tube(instrument, [-12, y, 6.5], [89, y, 4.8], .16, '#b7b196');
    p.oval(instrument, [80 + (i % 3) * 4.2, i < 3 ? -4 : 7, 2], [1.5, 1.9, 1], '#c5bdab');
  }
  return instrument;
}

export class LithoniaStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(34, 16 / 9, 1, 6800);
  readonly props = new VideoProps();
  readonly set = buildLithoniaSet(this.props, this.scene);
  readonly actors: Figure[];
  readonly sparks: THREE.Mesh[];
  private readonly key = new THREE.DirectionalLight('#eee8dd', 2.25);
  private readonly fill = new THREE.HemisphereLight('#b7c3dc', '#5d3b33', .66);
  private readonly rim = new THREE.DirectionalLight('#e7b88c', 1.22);
  private readonly fade = new THREE.Mesh(new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({color: '#050609', transparent: true, depthTest: false, depthWrite: false}));
  private epoch = -1;
  private lastTime = -1;

  constructor(people: Performer[]) {
    const lead = people.find(p => p.id === 'lith-gambino');
    const harmony = people.find(p => p.id === 'lith-harmony');
    const witness = people.find(p => p.id === 'lith-witness');
    if (!lead || !harmony || !witness) throw Error('Lithonia needs the three recorded mouth tracks.');
    this.actors = [
      this.makeFigure('lead', lead), this.makeFigure('keys', harmony),
      this.makeFigure('drums', lead), this.makeFigure('guitar', lead),
      this.makeFigure('bass', lead), this.makeFigure('listener', witness), this.makeFigure('guest', lead),
    ];
    this.sparks = Array.from({length: 41}, (_, i) => this.props.mesh(this.scene,
      new THREE.TetrahedronGeometry(1.35 + i % 3 * .66), [0, 0, 0],
      ['#e69e60','#cc6b49','#7fe0eb','#f0c583'][i % 4]));
    this.key.position.set(-165, 257, 186);
    this.rim.position.set(167, 208, -67);
    this.fade.renderOrder = 1000;
    this.scene.add(this.key, this.fill, this.rim, this.fade);
    // Solid instruments and clothes catch the practical lights. The anatomy
    // wires and lamp shades keep their own colors.
    for (const mesh of this.props.meshes) {
      const material = mesh.material as THREE.MeshBasicMaterial;
      if (material.color.getHex() >= 0xdad0b0 || this.sparks.includes(mesh)) continue;
      mesh.material = new THREE.MeshLambertMaterial({color: material.color, side: THREE.DoubleSide});
      material.dispose();
    }
    this.resize(1280, 720);
    this.frame(0, false, 0, 'wide', 0);
  }

  private makeFigure(role: LithoniaActor, performer: Performer): Figure {
    const p = this.props;
    const costume = costumes[role];
    const figure = new VideoFigure(performer.model, performer.track, p, this.scene, costume.shirt, costume.skin);
    figure.head.scene.scale.setScalar(role === 'lead' ? 2.16 : 2.02);
    for (const m of [...figure.legs, ...figure.feet]) (m.material as THREE.MeshBasicMaterial).color.set(costume.trousers);
    for (const side of [-1, 1]) {
      p.oval(figure.root, [side * 15, -24, -1], [11, 11, 10.5], costume.shirt);
    }
    const neck = p.ink(figure.root);
    neck.begin();
    p.ring(neck, [0, -10, 0], [12, 0, 0], [0, -3, 8], role === 'lead' ? '#9ba3aa' : '#5b5154', 1.25);
    if (role === 'listener') {
      p.ring(neck, [1, -36, 12], [7, 0, 0], [0, 8, 0], '#ba996e', 2.0);
      p.line(neck, [[-11,-47,12],[7,-45,13],[13,-43,12]], '#b46155', 1.9);
    }
    neck.end();
    const point = bodyPoint(figure.model);
    const cm = figure.model.tract.scale;
    const local = (x: number, y: number, z: number): Point => {
      const a = point(x, y);
      return [a.x, a.y, z * cm];
    };
    const hat = propGroup(figure.ornaments);
    const glasses = propGroup(figure.ornaments);
    const hair = figure.hair;
    hair.begin();
    if (role === 'lead' || role === 'guest' || role === 'bass') {
      const navy = role === 'lead' ? '#9f4140' : '#272831';
      p.oval(hat, local(-1.9,22,0), [8.75*cm, 4.2*cm, 8.0*cm], navy);
      p.oval(hat, local(4.5,22.7,0), [3.1*cm, 3.05*cm, 5.95*cm], role === 'lead' ? '#c9c6ae' : navy);
      p.oval(hat, local(8.0,21.0,0), [5.9*cm, .63*cm, 6.7*cm], navy);
      p.oval(hat, local(-2.1,26.1,0), [.72*cm, .48*cm, .72*cm], navy);
      if (role !== 'bass') {
        for (const side of [-1, 1]) for (let i = 0; i < 20; i++) {
          const x = -1.5 + i % 7 * .84;
          const z = side * (3.7 + .24 * (i % 8));
          const y = 4.15 + Math.floor(i / 7) * .92 + Math.sin(i * 2) * .30;
          p.line(hair, [local(x, y, z), local(x + .25, y - .72, z + side * .2)], costume.hair, 1.15);
        }
      }
    } else {
      const long = role === 'guitar' || role === 'listener' || role === 'keys';
      const color = costume.hair;
      for (const side of [-1, 1]) for (let strand = 0; strand < 23; strand++) {
        const length = long ? 18 + strand % 4 : 8 + strand % 3;
        p.line(hair, Array.from({length: 22}, (_, i) => {
          const u = i / 21;
          const x = -8.5 + strand * .54 - u * (long ? 3.7 : .4) + Math.sin(u * 11 + strand * .79) * .69;
          const y = 22.7 - u * length + .58 * Math.cos(u * 13 + strand);
          const z = side * (5.85 + Math.sin(u * Math.PI) * 1.55 + strand % 4 * .26);
          return local(x, y, z);
        }), color, role === 'keys' ? 3.0 : 2.1);
      }
      if (role === 'keys') {
        for (const side of [-1, 1]) p.mesh(figure.ornaments, new THREE.TorusGeometry(.98 * cm, .14 * cm, 8, 18),
          local(-.1, 8.1, side * 6.3), '#c5a879').rotateY(Math.PI / 2);
      }
    }
    hair.end();

    if (role === 'lead') {
      const rims = p.ink(glasses);
      rims.begin();
      for (const side of [-1, 1]) {
        p.ring(rims, local(7.43, 13.85, side * 3.5), [0,2.76*cm,0], [0,0,3.1*cm], '#c0a37b', 2.4);
        p.line(rims, [local(7.3,14.95,side*6.2),local(.2,15.12,side*7.0),local(-4.7,13.43,side*6.4)], '#9c825e', 1.5);
      }
      p.line(rims, [local(7.5,14.32,-.53),local(8.5,15.1,0),local(7.5,14.32,.53)], '#c9a986', 1.3);
      rims.end();
    }

    let instrument: THREE.Group | undefined;
    if (role === 'lead') {
      instrument = stageMic(p, figure.root, [23, -38, 40]);
    } else if (role === 'drums') {
      instrument = propGroup(figure.root);
      for (const hand of figure.hands) p.tube(hand, [.15, -.6, .45], [.15, 4.4, 4.7], .15, '#c5ad84');
    } else if (role === 'guitar' || role === 'bass') {
      instrument = guitar(p, figure.root, role === 'bass');
    }
    return {role, figure, hat, glasses, instrument};
  }

  resize(w: number, h: number) {
    this.camera.aspect = Math.max(1, w) / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
    for (const a of this.actors) a.figure.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, choice: CameraView, _intensity: number, _speaker?: CharacterId) {
    const state = lithoniaState(choice, time);
    const {t, room, intro, rise, rupture, chase} = state;
    const camera = lithoniaCamera(choice, t, this.camera.aspect);
    this.camera.position.set(...camera.position);
    this.camera.up.set(...camera.up);
    this.camera.lookAt(...camera.target);
    this.camera.updateMatrixWorld();
    const reset = epoch !== this.epoch || Math.abs(t - this.lastTime) > .24;
    const dt = Math.max(0, Math.min(.05, t - this.lastTime));
    this.epoch = epoch;
    this.lastTime = t;

    this.set.update(state);
    this.scene.background = new THREE.Color(room === 'woods' ? '#090f17' : intro ? '#040406' : '#0e0c12');
    this.scene.fog = new THREE.Fog(room === 'woods' ? '#101f27' : '#20191c', room === 'woods' ? 318 : 355, room === 'woods' ? 1580 : 2350);
    this.key.intensity = room === 'woods' ? 1.65 : intro ? 2.35 : 1.4 + rise * .66;
    this.key.color.set(room === 'woods' ? '#a9dceb' : '#ede2d4');
    this.fill.intensity = intro ? .33 : room === 'woods' ? .48 : .68;
    this.rim.intensity = rupture ? 2.45 : room === 'woods' ? 1.1 : 1.33;
    this.rim.color.set(room === 'woods' ? '#4aa696' : '#e6b18d');

    for (const actor of this.actors) {
      actor.figure.root.visible = state.cast.includes(actor.role);
      if (!actor.figure.root.visible) continue;
      this.pose(actor, state);
    }
    this.scene.updateMatrixWorld(true);
    for (const {figure, role} of this.actors) {
      if (!figure.root.visible) continue;
      const voiced = role === 'lead' || role === 'keys' || role === 'listener';
      figure.update(voiced ? t : 0, voiced && playing, this.camera, dt, reset);
    }
    for (const [i, spark] of this.sparks.entries()) {
      spark.visible = rupture;
      const u = Math.max(0, t - 104.98);
      const angle = i * 2.39996;
      spark.position.set(Math.cos(angle) * u * (128 + i * 1.4), 181 + Math.sin(angle) * u * 78 - u * u * 91, 57 + u * (15 + i * 1.5));
      spark.rotation.set(u * 11 + i, u * 13, angle);
      spark.scale.setScalar(Math.max(.2, 1 - u * 1.45));
    }
    const fade = 1 - state.fade;
    this.fade.position.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(new THREE.Vector3()), 2);
    this.fade.quaternion.copy(this.camera.quaternion);
    this.fade.material.opacity = fade;
    this.fade.visible = fade > 0;
    this.scene.updateMatrixWorld(true);
  }

  private pose(actor: Figure, state: ReturnType<typeof lithoniaState>) {
    const {t, view, rise, chase, intro} = state;
    const {role, figure, hat, glasses, instrument} = actor;
    const pulse = (t - 15.2) * 140 / 60 * Math.PI * 2;
    const sway = Math.sin(pulse);
    const lean = Math.sin(pulse * .5);
    const offsets: Record<LithoniaActor, Point> = {
      lead: [0, 149, 45], keys: [-149, 121, -83], drums: [14, 135, -164],
      guitar: [165, 153, -82], bass: [-179, 150, -151],
      listener: [141, 103, 126], guest: [-143, 104, 119],
    };
    const at = [...offsets[role]] as Point;
    let seated = ['keys', 'drums', 'listener', 'guest'].includes(role);
    let turn = 0;
    let pitch = 0;
    let roll = .025 * sway;
    let arms: [Point, Point, Point, Point] = [
      [-31, -27, 11], [-38, -50, 24], [29, -28, 14], [23, -45, 39],
    ];
    if (role === 'lead') {
      turn = intro ? -.26 : .12 + .19 * lean;
      roll += rise * .053 * lean;
      pitch = rise * .06 * sway;
      at[0] = 3.5 * lean * rise;
      at[1] += .75 * sway + rise * (3.7 * sway - 2);
      at[2] = intro ? 44 : 46;
      arms = [
        [-31, -36, 16], [-38 - lean * 9, -49 + rise * 22 * sway, 25],
        [30, -34, 17], [17 + lean * 3, 2 + sway * 2.2, 35],
      ];
      if (view === 'lith-reveal') arms[3] = [23, -18, 21];
      if (view === 'lith-rise') {
        pitch += .13 + .15 * sway;
        at[1] -= 8 + 6 * sway;
      }
      if (view === 'lith-rupture' || view === 'lith-stagger') {
        pitch = -.1 + .08 * Math.sin(t * 21);
        roll = .14 * Math.sin(t * 27);
        arms[1] = [-37, -7, 34];
        arms[3] = [33, -14, 29];
      }
      if (instrument) {
        instrument.visible = !intro && !chase && !/wide|reveal|band|rise/.test(view);
        instrument.position.set(arms[3][0], arms[3][1] + 4, arms[3][2]);
        instrument.rotation.set(-1.04, 0, -.24);
      }
    }
    if (role === 'keys') {
      at[1] += 1.4 * sway;
      arms = [[-32,-27,18],[-20,-41 + 2*Math.sin(pulse*4),55],[29,-28,18],[20,-41 + 2*Math.cos(pulse*4),55]];
      turn = .14;
    }
    if (role === 'drums') {
      at[1] += 2.6 * sway;
      const swing = Math.sin(pulse * 2);
      arms = [[-33,-25,23],[-37,-37 + 29*swing,46],[32,-26,24],[37,-40 - 28*swing,49]];
      pitch = .07 * swing;
    }
    if (role === 'guitar' || role === 'bass') {
      turn = role === 'guitar' ? -.18 : .26;
      at[1] += 1.5 * sway;
      if (instrument) instrument.rotation.z = -.24 + .06 * sway;
      arms = [[-29,-37,23],[-10,-52 + 6*Math.sin(pulse*4),31],[39,-27,25],[58 + lean*4,-44,27]];
    }
    if (role === 'listener') {
      turn = -.15 + lean * .056;
      arms = [[-27,-39,13],[-22,-60,27],[26,-40,13],[26,-59,31]];
      if (view === 'lith-shock' || view === 'lith-reaction') {
        pitch = -.15 * smoothStep(105.43, 107.45, t);
        arms = [[-28,-26,15],[-38,-24+14*sway,38],[28,-27,13],[42,-20-12*sway,32]];
      }
    }
    if (view === 'lith-room-wide' && (role === 'listener' || role === 'guest')) {
      at[0] = role === 'guest' ? -227 : 222;
      at[1] -= 3;
    }
    if (role === 'guest') {
      turn = .16;
      arms = [[-27,-36,15],[-33,-63,26],[27,-36,15],[41,-64,26]];
    }
    if (chase && (role === 'lead' || role === 'listener')) {
      const step = t * 14;
      const later = view === 'lith-run-front' && t > 112.3;
      const visiblePursuer = view === 'lith-pursuit' || later;
      at[0] = role === 'lead' ? -80 + Math.sin(t * 5) * 14 : 18 + Math.sin(t * 4.7) * 34;
      at[1] = 151 + Math.abs(Math.sin(step)) * 7;
      at[2] = role === 'lead' ? -13 : 62;
      if (role === 'lead') figure.root.visible = visiblePursuer;
      turn = view === 'lith-run-side' ? .55 : -.22;
      pitch = .24;
      roll = .095 * Math.sin(step);
      seated = false;
      if (instrument) instrument.visible = false;
      arms = [
        [-29,-36,14 + 19*Math.sin(step)],[-32,-18,29 + 36*Math.sin(step)],
        [31,-35,14 - 19*Math.sin(step)],[32,-17,29 - 36*Math.sin(step)],
      ];
    }

    figure.root.position.set(...at);
    figure.root.rotation.set(pitch, turn, roll);
    figure.pose(t, arms, seated);
    hat.visible = !intro;
    glasses.visible = role === 'lead' && (view === 'lith-glasses' || view === 'lith-profile' && t > 33.7);
    if (chase) {
      for (const [i, side] of [-1, 1].entries()) {
        const stride = side * Math.sin(t * 14);
        const knee: Point = [side*17,-103 + 18*Math.max(0, stride), stride*29];
        const foot: Point = [side*19,-145 + 26*Math.max(0, stride), stride*44];
        this.props.segment(figure.legs[i*2], [side*11,-72,0], knee, 6.5);
        this.props.segment(figure.legs[i*2+1], knee, foot, 5);
        figure.feet[i].position.set(...foot);
      }
    }
  }

  dispose() {
    this.actors.forEach(a => a.figure.dispose());
    this.props.dispose();
    this.fade.geometry.dispose();
    this.fade.material.dispose();
  }
}
