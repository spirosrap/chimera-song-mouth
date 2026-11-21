import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';

export type BerghainId = 'berghain-rosalia' | 'berghain-bjork';

const charcoal = '#111215';
const concrete = '#383b42';
const wallGrey = '#22252a';
const linenWhite = '#f0eee6';
const warmWood = '#422817';
const darkWood = '#24160d';
const chrome = '#cfd3db';
const amberLamp = '#e69933';
const choirBlack = '#0a0a0c';
const rosaliaBlack = '#0e0e12';
const bjorkWhite = '#f4f5f8';
const sugarWhite = '#ffffff';
const steamCol = '#c2c9d6';

export class BerghainStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 14000);
  readonly props = new VideoProps();

  readonly apartmentGroup = new THREE.Group();
  readonly orchestraGroup = new THREE.Group();
  readonly choirGroup = new THREE.Group();
  readonly steamGroup = new THREE.Group();
  readonly propsGroup = new THREE.Group();

  readonly rosalia: VideoFigure;
  readonly bjork: VideoFigure;

  // Staging props
  readonly iron: THREE.Group;
  readonly ironingBoard: THREE.Group;
  readonly coffeeTable: THREE.Group;
  readonly sugarCube: THREE.Mesh;
  readonly steamPuffs: THREE.Mesh[] = [];

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly rosaliaModel: VoiceModel,
    readonly rosaliaTrack: TeleTrack,
    readonly bjorkModel: VoiceModel,
    readonly bjorkTrack: TeleTrack
  ) {
    this.scene.background = new THREE.Color(charcoal);
    this.scene.add(
      this.apartmentGroup,
      this.orchestraGroup,
      this.choirGroup,
      this.steamGroup,
      this.propsGroup
    );

    this.buildApartment();
    this.buildOrchestra();
    this.buildChoir();
    this.buildSteam();

    // 1. Rosalía Figure
    this.rosalia = new VideoFigure(rosaliaModel, rosaliaTrack, this.props, this.scene, rosaliaBlack, '#dfc0a5');
    this.rosalia.head.scene.scale.setScalar(2.05);
    this.styleRosalia();

    // 2. Björk Figure
    this.bjork = new VideoFigure(bjorkModel, bjorkTrack, this.props, this.scene, bjorkWhite, '#e8d4c4');
    this.bjork.head.scene.scale.setScalar(2.05);
    this.styleBjork();

    // 3. Owned Props
    this.ironingBoard = this.buildIroningBoard();
    this.iron = this.buildIron();
    this.coffeeTable = this.buildCoffeeTable();
    this.sugarCube = this.props.box(this.coffeeTable, 6, 6, 6, sugarWhite, [6, 44, 0]);

    this.propsGroup.add(this.ironingBoard, this.iron, this.coffeeTable);

    this.resize(1280, 720);
    this.frame(0, false, 0, 'berghain-apartment', 0);
  }

  private buildApartment() {
    const p = this.props;
    const g = this.apartmentGroup;

    // Floorboards
    p.box(g, 2600, 4, 3200, warmWood, [0, -2, -600]);
    for (let i = -18; i <= 18; i++) {
      p.box(g, 2, 6, 3200, darkWood, [i * 70, 0, -600]);
    }

    // Apartment back wall & window frames
    p.box(g, 2600, 1500, 8, wallGrey, [0, 740, -2100]);
    p.box(g, 700, 1000, 12, '#0c0d10', [-600, 750, -2090]);
    p.box(g, 690, 8, 16, concrete, [-600, 750, -2085]);
    p.box(g, 8, 990, 16, concrete, [-600, 750, -2085]);

    // Kitchen counter & sink
    p.box(g, 480, 140, 140, concrete, [750, 68, -1200]);
    p.box(g, 180, 20, 90, chrome, [750, 139, -1200]);
    p.tube(g, [750, 140, -1230], [750, 180, -1230], 3, chrome);
    p.tube(g, [750, 180, -1230], [750, 180, -1200], 3, chrome);
  }

  private buildOrchestra() {
    const p = this.props;
    const g = this.orchestraGroup;

    // Semicircular orchestra formation with stands and warm lights
    for (let i = 0; i < 14; i++) {
      const angle = (i / 13) * Math.PI * 0.8 + Math.PI * 0.1;
      const radius = 950;
      const x = Math.cos(angle) * radius;
      const z = -Math.sin(angle) * radius - 300;

      // Musician proxy (seated figure)
      p.oval(g, [x, 70, z], [14, 22, 14], '#1a1b20');
      p.oval(g, [x, 105, z], [9, 11, 9], '#32343d');
      // Music stand & amber light
      p.tube(g, [x, 0, z + 35], [x, 80, z + 35], 2, chrome);
      p.box(g, 36, 26, 2, '#202124', [x, 85, z + 35]);
      p.oval(g, [x, 99, z + 36], [4, 4, 4], amberLamp);
    }
  }

  private buildChoir() {
    const p = this.props;
    const g = this.choirGroup;

    // 8 solemn standing choir figures behind the lead
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const x = i * 65;
      const z = -650 - Math.abs(i) * 25;
      // Tall choir silhouette
      p.oval(g, [x, 80, z], [15, 75, 14], choirBlack);
      p.oval(g, [x, 162, z], [8.5, 11, 8.5], '#cbb59f');
    }
  }

  private buildSteam() {
    const p = this.props;
    const g = this.steamGroup;

    // Atmospheric steam puffs rising near the chore station
    for (let i = 0; i < 8; i++) {
      const m = p.oval(g, [-120 + i * 8, 85 + i * 22, -180 + (i % 3) * 12], [8 + i * 3, 7 + i * 2.5, 8 + i * 3], steamCol);
      const mat = m.material as THREE.Material;
      mat.transparent = true;
      mat.opacity = 0.35 - i * 0.03;
      this.steamPuffs.push(m);
    }
  }

  private buildIroningBoard(): THREE.Group {
    const g = new THREE.Group();
    const p = this.props;

    // Board surface & cross legs
    p.box(g, 160, 6, 42, linenWhite, [-120, 80, -200]);
    p.tube(g, [-170, 0, -190], [-70, 77, -190], 3, chrome);
    p.tube(g, [-70, 0, -190], [-170, 77, -190], 3, chrome);
    p.tube(g, [-170, 0, -210], [-70, 77, -210], 3, chrome);
    p.tube(g, [-70, 0, -210], [-170, 77, -210], 3, chrome);

    return g;
  }

  private buildIron(): THREE.Group {
    const g = new THREE.Group();
    const p = this.props;

    p.box(g, 26, 12, 14, chrome, [-110, 89, -200]);
    p.tube(g, [-120, 96, -200], [-100, 96, -200], 2.5, '#1e2025');
    return g;
  }

  private buildCoffeeTable(): THREE.Group {
    const g = new THREE.Group();
    const p = this.props;

    p.box(g, 90, 8, 90, warmWood, [0, 36, 0]);
    p.tube(g, [-38, 0, -38], [-38, 32, -38], 3, darkWood);
    p.tube(g, [38, 0, -38], [38, 32, -38], 3, darkWood);
    p.tube(g, [-38, 0, 38], [-38, 32, 38], 3, darkWood);
    p.tube(g, [38, 0, 38], [38, 32, 38], 3, darkWood);

    // Coffee cup & saucer
    p.oval(g, [0, 42, 0], [10, 2, 10], linenWhite);
    p.tube(g, [0, 42, 0], [0, 49, 0], 6, linenWhite);
    return g;
  }

  private styleRosalia() {
    const b = this.rosalia.hair;
    b.begin();
    // Long sleek dark braided hair down the back and sides
    const pts: P[] = [
      [0, 18, -4],
      [-4, 8, -12],
      [-6, -8, -18],
      [-6, -26, -22],
      [-4, -48, -24],
      [-2, -72, -26],
      [0, -96, -28]
    ];
    this.props.line(b, pts, rosaliaBlack, 5.5);
    // Side accents
    this.props.line(b, [[-12, 14, 2], [-14, -6, 4], [-12, -28, 2]], rosaliaBlack, 3);
    this.props.line(b, [[12, 14, 2], [14, -6, 4], [12, -28, 2]], rosaliaBlack, 3);
    b.end();
  }

  private styleBjork() {
    const b = this.bjork.hair;
    b.begin();
    // Organic avant-garde sculptural headdress with radiating arcs
    for (let i = 0; i < 9; i++) {
      const a = (i / 8) * Math.PI - Math.PI * 0.5;
      const pts: P[] = [
        [0, 16, 0],
        [Math.sin(a) * 22, 28 + Math.cos(a) * 16, Math.sin(i * 1.3) * 8],
        [Math.sin(a) * 38, 42 + Math.cos(a) * 26, Math.sin(i * 1.7) * 14]
      ];
      this.props.line(b, pts, bjorkWhite, 3.5);
    }
    b.end();
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.rosalia.head.resize(w, h);
    this.bjork.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, _intensity: number, _speaker?: CharacterId) {
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, time - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(time - this.last) > 0.25);
    this.last = time;
    this.epoch = epoch;

    const t = time;
    const pulse = Math.sin(t * 1.8);

    // Staging group visibilities
    const isChoir = view === 'berghain-choir';
    const isOrchestra = view === 'berghain-orchestra' || view === 'berghain-strings';
    const isBjork = view === 'berghain-bjork' || view === 'berghain-bjork-close';
    const isDuet = view === 'berghain-duet';

    this.choirGroup.visible = isChoir || (t >= 26 && t <= 48);
    this.orchestraGroup.visible = isOrchestra || isDuet;
    this.apartmentGroup.visible = true;

    // Animate steam puffs
    for (let i = 0; i < this.steamPuffs.length; i++) {
      const p = this.steamPuffs[i];
      const yOrig = 85 + i * 22;
      p.position.y = yOrig + Math.sin(t * 2 + i * 0.8) * 8;
      p.position.x = -120 + i * 8 + Math.cos(t * 1.5 + i) * 6;
    }

    // Camera viewpoints
    let camPos: P = [0, 130, 360];
    let camLook: P = [0, 110, 0];
    let fov = 35;

    switch (view) {
      case 'berghain-kitchen':
        camPos = [280, 110, 180];
        camLook = [100, 60, -200];
        fov = 32;
        break;
      case 'berghain-iron':
        camPos = [-120, 105, -70];
        camLook = [-120, 85, -200];
        fov = 30;
        break;
      case 'berghain-choir':
        camPos = [0, 150, -320];
        camLook = [0, 110, -680];
        fov = 38;
        break;
      case 'berghain-orchestra':
      case 'berghain-strings':
        camPos = [0, 160, 180];
        camLook = [0, 70, -700];
        fov = 40;
        break;
      case 'berghain-rosalia-close':
        camPos = [-10, 142, 95];
        camLook = [-10, 139, 0];
        fov = 24;
        break;
      case 'berghain-rosalia':
        camPos = [-20, 138, 220];
        camLook = [-15, 128, 0];
        fov = 32;
        break;
      case 'berghain-bjork-close':
        camPos = [20, 145, 95];
        camLook = [20, 141, 0];
        fov = 24;
        break;
      case 'berghain-bjork':
        camPos = [25, 140, 220];
        camLook = [20, 130, 0];
        fov = 32;
        break;
      case 'berghain-duet':
        camPos = [0, 140, 260];
        camLook = [0, 132, 0];
        fov = 34;
        break;
      case 'berghain-steam':
        camPos = [-80, 120, 140];
        camLook = [-100, 100, -180];
        fov = 34;
        break;
      case 'berghain-apartment':
      default:
        camPos = [0, 135, 380];
        camLook = [0, 110, -50];
        fov = 36;
        break;
    }

    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();

    // Position Performers
    // Rosalía positioning (soprano lead stage left)
    const rosaliaX = (view === 'berghain-rosalia-close') ? -10 : (isDuet ? -45 : -25);
    this.rosalia.root.position.set(rosaliaX, 138 + Math.abs(pulse) * 1.5, -20);
    this.rosalia.root.rotation.set(0, 0.08, 0);

    // Björk positioning (celestial bridge stage right)
    const bjorkX = (view === 'berghain-bjork-close') ? 20 : (isDuet ? 45 : 30);
    this.bjork.root.position.set(bjorkX, 138 + Math.abs(pulse) * 2, -20);
    this.bjork.root.rotation.set(0, -0.08, 0);

    // Make Björk visible predominantly during bridge & duet & orchestra
    this.bjork.root.visible = t >= 115 || isBjork || isDuet;
    this.rosalia.root.visible = t < 125 || t > 165 || !isBjork;

    // Posing Rosalía (domestic aria pose)
    const rle: P = [-22, -18, 14];
    const rlh: P = [-32, -24, 22];
    const rre: P = [22, -16 + pulse * 6, 16];
    const rrh: P = [32, -12 + pulse * 10, 24];
    this.rosalia.pose(t, [rle, rlh, rre, rrh]);

    // Posing Björk (divine intervention reaching pose)
    const ble: P = [-26, -10 + pulse * 8, 22];
    const blh: P = [-36, -4 + pulse * 14, 30];
    const bre: P = [26, -10 - pulse * 8, 22];
    const brh: P = [36, -4 - pulse * 14, 30];
    this.bjork.pose(t, [ble, blh, bre, brh]);

    // Update mouth movements and head orientation
    this.rosalia.update(t, playing, this.camera, dt, reset);
    this.bjork.update(t, playing, this.camera, dt, reset);
  }

  dispose() {
    this.rosalia.dispose();
    this.bjork.dispose();
    this.props.dispose();
  }
}
