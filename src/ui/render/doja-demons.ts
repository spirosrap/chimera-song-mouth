import * as THREE from 'three';
import {demonsCamera, demonsState, type DemonsLook} from '../../scene/doja-demons.ts';
import type {CameraView, CharacterId} from '../../scene/scene.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {VoiceModel} from '../analysis.ts';
import {bodyPoint} from './profile.ts';
import {VideoFigure, VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {makeDemonsSets, type DemonsSets} from './demons-sets.ts';

export type DemonsId = 'demons-doja' | 'demons-shadow';
type Person = {id: DemonsId; model: VoiceModel; track: TeleTrack};
type Actor = {
  look: DemonsLook | 'shadow';
  figure: VideoFigure;
  tail?: THREE.Mesh[];
  eyes: THREE.Group;
};

export class DemonsStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35, 4 / 3, 1, 6000);
  readonly props = new VideoProps();
  readonly sets: DemonsSets;
  readonly actors: Actor[];
  private readonly veil: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private last = -1;
  private epoch = -1;

  constructor(people: Person[]) {
    const doja = people.find(p => p.id === 'demons-doja');
    const shadow = people.find(p => p.id === 'demons-shadow');
    if (!doja || !shadow) throw Error('Demons needs its lead and answer voices.');
    this.sets = makeDemonsSets(this.props, this.scene);
    this.actors = [
      this.buildActor('demon', doja), this.buildActor('bath', doja),
      this.buildActor('typist', doja), this.buildActor('homeowner', doja),
      this.buildActor('shadow', shadow), this.buildActor('shadow', shadow),
    ];
    const material = new THREE.MeshBasicMaterial({
      color: '#030709', depthTest: false, depthWrite: false, transparent: true,
    });
    this.veil = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    this.veil.renderOrder = 1000;
    this.scene.add(this.veil);
    this.resize(1280, 720);
    this.frame(0, false, 0, 'wide', 0);
  }

  private buildActor(look: Actor['look'], person: Person): Actor {
    const props = this.props;
    const infernal = look === 'demon' || look === 'shadow';
    const coat = infernal ? '#142e35' : look === 'homeowner' ? '#a63f44' : look === 'bath' ? '#36565a' : '#242123';
    const skin = infernal ? '#24464c' : look === 'homeowner' ? '#ad8571' : '#b08264';
    const figure = new VideoFigure(person.model, person.track, props, this.scene, coat, skin);
    figure.head.scene.scale.setScalar(infernal ? 2.05 : 1.88);
    const shoulders = infernal ? '#25464c' : coat;
    props.oval(figure.root, [0, -28, -2], [22, 14, 12], shoulders);
    const eyes = new THREE.Group();
    figure.ornaments.add(eyes);
    const point = bodyPoint(figure.model);
    const unit = figure.model.tract.scale;
    const ornament = (x: number, y: number, z: number): Point => {
      const p = point(x, y);
      return [p.x, p.y, z * unit];
    };

    if (infernal) {
      for (const side of [-1, 1]) {
        const a = ornament(-1, 21, side * 5);
        const b = ornament(-.8, 25.4, side * 6.6);
        const c = ornament(-1.5, 29.6, side * 7.5);
        props.tube(figure.ornaments, a, b, 1.45 * unit, '#47666b');
        props.mesh(figure.ornaments, new THREE.ConeGeometry(1.4 * unit, Math.hypot(...c.map((v, i) => v - b[i])), 12),
          c.map((v, i) => (v + b[i]) * .5) as Point, '#63868a').quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), new THREE.Vector3(...c).sub(new THREE.Vector3(...b)).normalize());
        const eye = ornament(7.3, 13.3, side * 3.9);
        props.oval(eyes, eye, [.40 * unit, .56 * unit, .57 * unit], '#fd2630');
        props.oval(eyes, [eye[0] + .26 * unit, eye[1], eye[2]], [.19 * unit, .24 * unit, .28 * unit], '#ff9c7b');
      }
      for (const row of [0, 1]) {
        for (let i = 0; i <= 20; i++) {
          const q = i / 20 * Math.PI - Math.PI / 2;
          const x = 19 * Math.sin(q);
          const link = props.mesh(figure.root, new THREE.TorusGeometry(2.4, .64, 5, 10),
            [x, -13 - (13 + row * 4) * Math.cos(q), 10 + 7 * Math.cos(q)], i % 3 ? '#bcc8c6' : '#e6dcc0');
          link.rotation.y = i % 2 ? .48 : -.52;
        }
      }
    } else if (look !== 'bath') {
      const hair = figure.hair;
      const black = look === 'typist' ? '#3d3537' : '#674741';
      hair.begin();
      for (const side of [-1, 1]) {
        for (let strand = 0; strand < 24; strand++) {
          const x = -8 + strand * .63;
          props.line(hair, Array.from({length: 18}, (_, i) => {
            const u = i / 17;
            return ornament(x - u * (look === 'homeowner' ? .5 : 2.7) + Math.sin(u * 9 + strand) * .6,
              21.6 - u * (look === 'typist' ? 13.5 : 12), side * (5.9 + Math.sin(u * 3) * 1.3));
          }), strand % 5 ? black : '#87695f', look === 'typist' ? 2.1 : 2.8);
        }
        if (look === 'typist') {
          props.oval(figure.ornaments, ornament(1.1, 24, side * 5.55),
            [1.9 * unit, 2.9 * unit, 1.6 * unit], '#282326');
        }
      }
      hair.end();
    } else {
      const ink = figure.hair;
      ink.begin();
      const eye = ornament(-9.8, 17.5, 0);
      props.ring(ink, eye, [0, 1.12 * unit, 0], [0, 0, 2.5 * unit], '#3e4b46', 1.4);
      props.ring(ink, [eye[0] - .16 * unit, eye[1], 0], [0, .5 * unit, 0], [0, 0, .6 * unit], '#4d5048', 1.4);
      ink.end();
    }
    if (look === 'bath' || look === 'typist') {
      for (const side of [-1, 1]) {
        props.mesh(figure.ornaments, new THREE.TorusGeometry(.92 * unit, .17 * unit, 6, 16),
          ornament(.4, 7.5, side * 6.1), '#c2a878').rotation.y = Math.PI / 2;
      }
      props.mesh(figure.root, new THREE.TorusGeometry(13, 1, 8, 34), [0, -12, 0], '#c7b891').rotation.x = Math.PI / 2.28;
    }

    if (infernal) for (const hand of figure.hands) for (let i = 0; i < 4; i++) {
      const nail = props.mesh(hand, new THREE.ConeGeometry(.30, 1.3, 7), [i * .43 - .64, -.95, .27], '#b1c3c0');
      nail.rotation.z = Math.PI;
    }
    const tail = infernal ? Array.from({length: 13}, () =>
      props.tube(figure.root, [0, 0, 0], [0, 1, 0], 1, '#31575c')) : undefined;
    return {look, figure, tail, eyes};
  }

  resize(width: number, height: number) {
    this.camera.aspect = Math.max(1, width) / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.props.resize(width, height);
    for (const a of this.actors) a.figure.head.resize(width, height);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, _intensity: number, _speaker?: CharacterId) {
    const state = demonsState(view, time);
    const {t, pulse} = state;
    const camera = demonsCamera(view, t, this.camera.aspect);
    this.camera.position.set(...camera.position);
    this.camera.up.set(...camera.up);
    this.camera.lookAt(...camera.target);
    this.camera.updateMatrixWorld();
    const reset = epoch !== this.epoch || Math.abs(t - this.last) > .25;
    const dt = Math.max(0, Math.min(.05, t - this.last));
    this.epoch = epoch;
    this.last = t;
    for (const [name, group] of Object.entries(this.sets.rooms)) {
      group.visible = name === state.room;
    }
    this.scene.background = new THREE.Color(state.cold ? '#08151a' : '#191712');
    this.scene.fog = new THREE.Fog(state.cold ? '#0b2127' : '#2a2320', 900, 2600);
    this.sets.update(state);
    for (const [i, actor] of this.actors.entries()) {
      const isShadow = actor.look === 'shadow';
      actor.figure.root.visible = isShadow
        ? view === 'demons-shadow' && i === 4 || state.pack
        : actor.look === state.look && view !== 'demons-shadow';
      if (!actor.figure.root.visible) continue;
      this.pose(actor, state, i);
      this.scene.updateMatrixWorld(true);
      const silent = actor.look === 'homeowner';
      actor.figure.update(silent ? 0 : t, playing && !silent, this.camera, dt, reset);
    }
    this.veil.position.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(new THREE.Vector3()), 2);
    this.veil.quaternion.copy(this.camera.quaternion);
    this.veil.material.opacity = 1 - state.fade;
    this.scene.updateMatrixWorld(true);
  }

  private pose(actor: Actor, state: ReturnType<typeof demonsState>, index: number) {
    const {figure} = actor;
    const {t, view, pulse} = state;
    const gesture = Math.sin(pulse * .5);
    const infernal = actor.look === 'demon' || actor.look === 'shadow';
    let location: Point = [0, 139 + 2 * Math.sin(pulse), 54];
    let rotation: Point = [0, -.19 * gesture, .055 * gesture];
    let seated = false;
    let arms: [Point, Point, Point, Point] = [
      [-33, -36, 18], [-44, -20 + gesture * 23, 27],
      [32, -39, 14], [43, -23 - gesture * 20, 30],
    ];

    if (state.ceiling) {
      location = [Math.sin(t * .75) * 35, 253 + 9 * Math.sin(t * 1.13), 12];
      rotation = [.12, .22 * Math.sin(t), Math.PI + .17 * gesture];
      arms = [[-42, -29, -26], [-61, -72, -58 + gesture * 14],
        [40, -28, -20], [60, -65, -58 - gesture * 14]];
    } else if (state.crawl) {
      location = [Math.sin(t * .44) * 15, 93 + 4 * Math.sin(pulse), 57];
      if (view === 'demons-headboard') location = [-40, 176, 4];
      if (view === 'demons-bed-face' || view === 'demons-bed-side') location[1] = 119;
      rotation = [.48, -.16 * gesture, .065 * gesture];
      arms = [[-35, -30, 25], [-46, -69, 58 + 13 * gesture], [31, -32, 20], [48, -69, 56 - 13 * gesture]];
    } else if (view === 'demons-chair') {
      location = [-19, 155, 57];
      rotation = [-.07, .21, -.13];
      seated = true;
      arms = [[-31, -25, 24], [-37, 8, 31], [29, -27, 23], [33, -42, 38]];
    }

    if (actor.look === 'bath') {
      location = [0, 99 + Math.sin(pulse) * 2, 5];
      if (view === 'demons-overhead') {
        location = [-22, 86, 6];
        rotation = [-1.1, 0, -.18];
      } else if (view === 'demons-eye-mark') {
        rotation = [.04, .64, .06];
      }
      seated = true;
      arms = [[-26, -28, 17], [-11, -26, 35], [23, -28, 17], [12, -24, 38]];
    }
    if (actor.look === 'typist') {
      location = [0, 140, 43];
      seated = true;
      arms = [[-28, -32, 22], [-14, -42 + 3 * Math.sin(t * 29), 49],
        [28, -33, 22], [14, -42 + 3 * Math.sin(t * 32), 49]];
    }
    if (actor.look === 'homeowner') {
      location = [0, 145, 52];
      rotation = [0, .13 * gesture, -.04];
      if (view === 'demons-sleep' || view === 'demons-wake') {
        location = [-64, 105, view === 'demons-sleep' ? -13 : 4];
        rotation = [view === 'demons-sleep' ? -1.3 : -.17, .12, .03];
        seated = true;
        arms = [[-32, -26, 5], [-36, -56, 13], [33, -26, 4], [36, -54, 9]];
      } else if (view === 'demons-escape' || view === 'demons-mailbox') {
        location = [Math.sin((t - 206) * .52) * 56, 145 + Math.abs(Math.sin(t * 9)) * 5, 76];
        rotation = [.13, .21, .08 * Math.sin(t * 8)];
        arms = [[-30, -33, -7], [-35, -15, 22 + gesture * 12], [32, -37, 14], [40, -23, 24 - gesture * 10]];
      } else if (view === 'demons-driver') {
        location = [0, 112, 100];
        seated = true;
        arms = [[-31, -35, 24], [-22, -27, 57], [26, -37, 25], [21, -27, 56]];
      } else {
        arms = [[-31, -28, 20], [-37, -18, 44], [33, -27, 21], [40, -12, 55]];
      }
    }
    const shadow = actor.look === 'shadow';
    if (shadow && view !== 'demons-shadow') {
      const side = index === 4 ? -1 : 1;
      location = [side * 109, 112 + Math.abs(Math.sin(pulse + index)) * 16, -132 - index * 5];
      rotation = [0, -side * .18, side * .12];
      seated = true;
    }
    figure.root.position.set(...location);
    figure.root.rotation.set(...rotation);
    figure.root.scale.setScalar(shadow && view !== 'demons-shadow' ? .94 : 1);
    figure.pose(t, arms, seated);
    if (actor.look === 'bath') {
      for (const mesh of [...figure.legs, ...figure.feet]) mesh.visible = false;
      if (view === 'demons-overhead') {
        figure.root.position.set(-42, 82, 2);
        figure.root.rotation.set(-.86, 0, -1.43);
      }
    }
    if (actor.look === 'homeowner') {
      const top = (view === 'demons-sleep' || view === 'demons-wake') ? '#a6a79a' : '#a63f44';
      for (const mesh of [figure.torso, ...figure.arms, ...figure.legs, ...figure.feet]) {
        (mesh.material as THREE.MeshBasicMaterial).color.set(top);
      }
    }
    if (view === 'demons-eye-mark') figure.head.scene.rotation.y += .58;
    if (state.crawl && infernal) figure.head.scene.rotation.z = .16;
    if (state.ceiling && infernal) {
      for (const [i, side] of [-1, 1].entries()) {
        const knee: Point = [side * 31, -68, -20 + side * gesture * 10];
        const toe: Point = [side * 43, -92, -44 + side * gesture * 15];
        this.props.segment(figure.legs[i * 2], [side * 10, -56, -2], knee, 7);
        this.props.segment(figure.legs[i * 2 + 1], knee, toe, 5);
        figure.feet[i].position.set(...toe);
      }
    }
    if (state.crawl && infernal) {
      for (const [i, side] of [-1, 1].entries()) {
        const knee: Point = [side * 29, -52, -54];
        const toe: Point = [side * 50, -84, -99 + 13 * side * gesture];
        this.props.segment(figure.legs[i * 2], [side * 9, -61, -29], knee, 7);
        this.props.segment(figure.legs[i * 2 + 1], knee, toe, 5);
        figure.feet[i].position.set(...toe);
      }
    }
    if (actor.look === 'homeowner' && (view === 'demons-escape' || view === 'demons-mailbox')) {
      for (const [i, side] of [-1, 1].entries()) {
        const stride = Math.sin(t * 9) * side;
        const knee: Point = [side * 14, -102 + Math.max(0, stride) * 9, 18 * stride];
        const toe: Point = [side * 17, -143 + Math.max(0, stride) * 18, 32 * stride];
        this.props.segment(figure.legs[i * 2], [side * 10, -70, 0], knee, 7);
        this.props.segment(figure.legs[i * 2 + 1], knee, toe, 5);
        figure.feet[i].position.set(...toe);
      }
    }
    if (actor.tail) {
      const tip = (u: number): Point => [
        Math.sin(u * 3.7 + pulse * .17) * u * 47,
        -52 + u * (69 + 24 * Math.sin(u * 3.1)),
        -10 - u * 113,
      ];
      for (const [i, tube] of actor.tail.entries()) {
        this.props.segment(tube, tip(i / 13), tip((i + 1) / 13), 3.3 - i * .2);
      }
    }
    actor.eyes.scale.setScalar(1 + .018 * Math.sin(pulse));
  }

  dispose() {
    this.actors.forEach(a => a.figure.dispose());
    this.props.dispose();
    this.veil.geometry.dispose();
    this.veil.material.dispose();
  }
}
