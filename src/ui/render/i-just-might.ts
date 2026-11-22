import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type MightId = 'might-bruno' | 'might-chorus';

const loungeWarmBg = '#24140a';
const woodWall = '#5c3318';
const woodSlat = '#381d0c';
const carpetOrange = '#8f4620';
const mintSuit = '#5cb37c';
const mintVest = '#4c9c6a';
const collarWhite = '#f5f2e8';
const skinTone = '#c79370';
const hairDark = '#1c1512';
const headbandRed = '#a82a2a';
const lampWarm = '#ffe19e';
const lampBlue = '#66c7ff';
const lampRed = '#ff5447';
const rainbowColors = ['#ff7eb6', '#ffd166', '#66d9ff', '#c78cff', '#7cff9b'];

/**
 * Procedural 3D stage for Bruno Mars — "I Just Might".
 * Recreates the curved 1970s mahogany wood-slat lounge studio with terracotta carpet,
 * concentric glowing circular ceiling disco lights (warm amber / rainbow / cobalt blue / crimson red),
 * all-Bruno mint-green leisure-suit funk band (lead, guitar, bass, congas, drums),
 * DJ turntable booth with twin floor speakers, trio close-up, and carpet-lounge pose.
 */
export class IJustMightStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 18000);
  readonly props = new VideoProps();

  readonly loungeGroup = new THREE.Group();
  readonly bandPropsGroup = new THREE.Group();
  readonly djBoothGroup = new THREE.Group();

  readonly ceilingOrbs: THREE.Mesh[] = [];
  readonly turntableDisc: THREE.Mesh;

  readonly lead: VideoFigure;
  readonly leftBand: VideoFigure;
  readonly rightBand: VideoFigure;
  readonly leftGuitar = new THREE.Group();
  readonly rightBass = new THREE.Group();

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly chorusModel: VoiceModel,
    readonly chorusTrack: TeleTrack
  ) {
    this.scene.background = new THREE.Color(loungeWarmBg);
    this.scene.add(this.loungeGroup, this.bandPropsGroup, this.djBoothGroup);

    this.buildLounge();
    this.buildRisersAndInstruments();
    this.turntableDisc = this.buildDjBooth();

    // 1. Lead Bruno (front center — mint-green 70s leisure suit, red headband, curly hair & mustache)
    this.lead = new VideoFigure(leadModel, leadTrack, this.props, this.scene, mintSuit, skinTone);
    this.lead.head.scene.scale.setScalar(2.08);
    this.styleBruno(this.lead, true, false);

    // 2. Guitarist Bruno (left — mint-green vest, white sleeves, sunglasses, borrows chorus mouth)
    this.leftBand = new VideoFigure(chorusModel, chorusTrack, this.props, this.scene, collarWhite, skinTone);
    this.leftBand.head.scene.scale.setScalar(2.0);
    this.styleBruno(this.leftBand, false, true);
    this.leftBand.root.add(this.leftGuitar);
    this.props.oval(this.leftGuitar, [4, -44, 24], [24, 30, 7], '#7a3318');
    this.props.tube(this.leftGuitar, [16, -34, 26], [62, 6, 26], 3.8, '#d4b27a');

    // 3. Bassist Bruno (right — mint-green vest, white sleeves, sunglasses, borrows chorus mouth)
    this.rightBand = new VideoFigure(chorusModel, chorusTrack, this.props, this.scene, collarWhite, skinTone);
    this.rightBand.head.scene.scale.setScalar(2.0);
    this.styleBruno(this.rightBand, false, true);
    this.rightBand.root.add(this.rightBass);
    this.props.oval(this.rightBass, [-4, -44, 24], [24, 32, 7], '#efe9d8');
    this.props.tube(this.rightBass, [-14, -34, 26], [-64, 10, 26], 3.8, '#c7a269');

    this.resize(1280, 720);
    this.frame(0, false, 0, 'might-silhouette', 0);
  }

  private buildLounge() {
    const p = this.props;
    const g = this.loungeGroup;

    // Terracotta-orange 70s carpeted floor
    p.box(g, 2800, 10, 2400, carpetOrange, [0, -5, -400]);

    // Curved wood-slat semi-circular lounge wall
    const wallPanels = 24;
    const radius = 820;
    for (let i = 0; i < wallPanels; i++) {
      const a = -Math.PI * 0.62 + (i / (wallPanels - 1)) * Math.PI * 1.24;
      const x = Math.sin(a) * radius;
      const z = -Math.cos(a) * radius + 120;
      const panel = p.box(g, 118, 520, 16, i % 2 === 0 ? woodWall : '#522c14', [x, 260, z]);
      panel.rotation.y = -a;
      const slat = p.box(g, 8, 520, 20, woodSlat, [x * 0.99, 260, z * 0.99]);
      slat.rotation.y = -a;
    }

    // Dark ceiling canopy + concentric glowing circular 70s disco ceiling lights!
    p.box(g, 2600, 14, 2200, '#1f1208', [0, 490, -250]);
    for (let ring = 0; ring < 5; ring++) {
      const r = 110 + ring * 145;
      const count = 8 + ring * 6;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const z = -120 + Math.sin(theta) * r * 0.78;
        const orb = p.mesh(g, new THREE.CircleGeometry(30, 18), [x, 480, z], lampWarm);
        orb.rotation.x = Math.PI / 2;
        this.ceilingOrbs.push(orb);
      }
    }
  }

  private buildRisersAndInstruments() {
    const p = this.props;
    const g = this.bandPropsGroup;

    // Left circular riser + Conga Bruno + twin wooden congas
    p.mesh(g, new THREE.CylinderGeometry(165, 175, 28, 24), [-420, 14, -220], '#6e3216');
    p.mesh(g, new THREE.CylinderGeometry(158, 158, 6, 24), [-420, 29, -220], carpetOrange);
    for (const dx of [-24, 22]) {
      p.mesh(g, new THREE.CylinderGeometry(18, 12, 78, 16), [-420 + dx, 68, -170], '#452412');
      p.mesh(g, new THREE.CircleGeometry(17, 16), [-420 + dx, 108, -170], '#e8dcc5').rotation.x = -Math.PI / 2;
    }
    // Conga player silhouette in matching mint-green suit
    p.oval(g, [-420, 178, -230], [16, 20, 15], skinTone);
    p.oval(g, [-420, 196, -232], [20, 11, 18], hairDark);
    p.tube(g, [-420, 100, -230], [-420, 156, -230], 20, mintVest);

    // Right circular riser + Drummer Bruno + vintage white drum kit
    p.mesh(g, new THREE.CylinderGeometry(165, 175, 28, 24), [420, 14, -220], '#6e3216');
    p.mesh(g, new THREE.CylinderGeometry(158, 158, 6, 24), [420, 29, -220], carpetOrange);
    p.mesh(g, new THREE.CylinderGeometry(36, 36, 34, 20), [420, 66, -180], '#e6e1d3').rotation.x = Math.PI / 2;
    p.mesh(g, new THREE.CircleGeometry(32, 20), [420, 66, -162], '#f5f2ea');
    for (const dx of [-52, 52]) {
      p.tube(g, [420 + dx, 28, -210], [420 + dx, 142, -210], 2, '#c8c4b8');
      p.oval(g, [420 + dx, 146, -210], [34, 2.5, 26], '#d9b552');
    }
    // Drummer silhouette in mint-green suit
    p.oval(g, [420, 174, -245], [16, 20, 15], skinTone);
    p.oval(g, [420, 192, -247], [20, 11, 18], hairDark);
    p.tube(g, [420, 96, -245], [420, 152, -245], 20, mintVest);
  }

  private buildDjBooth(): THREE.Mesh {
    const p = this.props;
    const g = this.djBoothGroup;
    // Wooden DJ table with vinyl turntable & twin large vintage floor speakers (0:50, 1:00, 3:00!)
    p.box(g, 230, 14, 110, '#593218', [0, 102, 10]);
    for (const sx of [-95, 95]) {
      p.tube(g, [sx, 0, 10], [sx, 100, 10], 6, '#3d200e');
    }
    p.box(g, 92, 14, 74, '#242220', [0, 114, 10]);
    const disc = p.mesh(g, new THREE.CylinderGeometry(28, 28, 3, 24), [0, 123, 10], '#111214');
    p.mesh(g, new THREE.CircleGeometry(9, 16), [0, 125.5, 10], '#d45a3b').rotation.x = -Math.PI / 2;
    // Twin angled floor speakers flanking DJ booth
    for (const sx of [-260, 260]) {
      p.box(g, 82, 145, 68, '#362114', [sx, 72, 40]);
      p.mesh(g, new THREE.CircleGeometry(24, 18), [sx, 48, 76], '#141312');
      p.mesh(g, new THREE.CircleGeometry(15, 16), [sx, 102, 76], '#141312');
    }
    return disc;
  }

  private styleBruno(f: VideoFigure, isLead: boolean, shades: boolean) {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // Wide 1970s white disco lapels / collar & mint vest
    p.box(f.root, 14, 34, 18, collarWhite, [-10, -20, 8]).rotation.z = 0.28;
    p.box(f.root, 14, 34, 18, collarWhite, [10, -20, 8]).rotation.z = -0.28;
    if (!isLead) {
      p.box(f.root, 34, 58, 22, mintVest, [0, -34, 2]);
    } else {
      // Iconic red 70s headband across forehead!
      p.mesh(f.root, new THREE.TorusGeometry(19, 3.2, 6, 20), [0, 34, -2], headbandRed).rotation.x = Math.PI / 2;
    }

    // Curly voluminous dark 70s hair & pencil mustache
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-7, 21);
      const b = B(7, 18);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y, z]], hairDark, 3.6);
    }
    p.line(f.hair, [[-7, 12, 19], [0, 14, 21], [7, 12, 19]], '#241a15', 2.8);
    f.hair.end();

    // Retro tinted aviator shades for band Brunos
    if (shades) {
      for (const sign of [-1, 1]) {
        p.oval(f.root, [sign * 10, 26, 20], [8.5, 6.5, 3], '#302016');
      }
      p.box(f.root, 6, 1.8, 3, '#c4a464', [0, 26, 20]);
    }
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.lead.head.resize(w, h);
    this.leftBand.head.resize(w, h);
    this.rightBand.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, _speaker?: CharacterId) {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const aspect = this.width / this.height;
    const narrow = aspect < 1;
    const q = t * (112 / 60) * Math.PI * 2; // 112 BPM funk groove
    const beat = Math.sin(q);
    const sway = Math.sin(q * 0.5);

    const isSilhouette = view === 'might-silhouette';
    const isDj = view === 'might-dj';
    const isRainbow = view === 'might-rainbow' || view === 'might-trio';
    const isBlue = view === 'might-blue';
    const isRed = view === 'might-red';
    const isCarpet = view === 'might-carpet';
    const isTrio = view === 'might-trio';
    const isSolo = view === 'might-bruno' || view === 'might-chorus';

    // Dynamic 70s lighting palette across the studio
    const bgHex = isBlue ? '#061a3b'
      : isRed ? '#380909'
      : isSilhouette ? '#140b05'
      : loungeWarmBg;
    this.scene.background = new THREE.Color(bgHex);

    // Update concentric ceiling disco orbs!
    this.ceilingOrbs.forEach((orb, idx) => {
      const mat = orb.material as THREE.MeshBasicMaterial;
      if (isBlue) {
        mat.color.set(idx % 3 === 0 ? '#a8e6ff' : lampBlue);
      } else if (isRed) {
        mat.color.set(idx % 3 === 0 ? '#ffa07a' : lampRed);
      } else if (isRainbow || isDj) {
        const shift = Math.floor(t * 2.2);
        mat.color.set(rainbowColors[(idx + shift) % rainbowColors.length]);
      } else {
        mat.color.set(beat > 0.3 && intensity > 0.8 ? '#fff3c4' : lampWarm);
      }
    });

    this.bandPropsGroup.visible = !isDj;
    this.djBoothGroup.visible = isDj || isRed;
    if (this.djBoothGroup.visible) {
      this.turntableDisc.rotation.y = t * 4.5;
    }

    // Performer visibility & groovy 70s formations
    this.lead.root.visible = view !== 'might-chorus';
    this.leftBand.root.visible = !isSilhouette && view !== 'might-bruno';
    this.rightBand.root.visible = !isSilhouette && view !== 'might-bruno';
    this.leftGuitar.visible = !isTrio && !isDj;
    this.rightBass.visible = !isTrio && !isDj;

    const grooveY = Math.abs(beat) * 4.5;

    if (isCarpet) {
      // Iconic reclining-on-the-carpet pose (1:10-1:15, 3:10-3:20!)
      this.lead.root.position.set(0, 56, 35);
      this.lead.root.rotation.set(0, 0, -Math.PI * 0.42);
      this.leftBand.root.position.set(-165, 148 + grooveY * 0.4, -120);
      this.leftBand.root.rotation.set(0, 0.25, 0);
      this.rightBand.root.position.set(165, 148 + grooveY * 0.4, -120);
      this.rightBand.root.rotation.set(0, -0.25, 0);
    } else if (isTrio) {
      // Tight smiling 3-Bruno close-up under rainbow orbs (1:55-2:00!)
      this.lead.root.position.set(0, 152 + grooveY * 0.5, -20);
      this.lead.root.rotation.set(0, sway * 0.08, sway * 0.06);
      this.leftBand.root.position.set(-74, 146 + grooveY * 0.4, -32);
      this.leftBand.root.rotation.set(0, 0.16, -0.12 + sway * 0.05);
      this.rightBand.root.position.set(74, 146 + grooveY * 0.4, -32);
      this.rightBand.root.rotation.set(0, -0.16, 0.12 + sway * 0.05);
    } else if (isDj) {
      this.lead.root.position.set(0, 150 + grooveY, -35);
      this.lead.root.rotation.set(0, sway * 0.14, sway * 0.04);
      this.leftBand.root.position.set(-195, 148 + grooveY * 0.6, -95);
      this.leftBand.root.rotation.set(0, 0.2, 0);
      this.rightBand.root.position.set(195, 148 + grooveY * 0.6, -95);
      this.rightBand.root.rotation.set(0, -0.2, 0);
    } else if (isSolo) {
      this.lead.root.position.set(0, 150 + grooveY * 0.5, -35);
      this.lead.root.rotation.set(0, sway * 0.08, 0);
      this.leftBand.root.position.set(-55, 148 + grooveY * 0.5, -35);
      this.leftBand.root.rotation.set(0, 0.12, 0);
      this.rightBand.root.position.set(55, 148 + grooveY * 0.5, -35);
      this.rightBand.root.rotation.set(0, -0.12, 0);
    } else {
      // Full synchronized 70s funk dance step formation!
      const stepX = sway * 24;
      this.lead.root.position.set(stepX, 150 + grooveY, -25);
      this.lead.root.rotation.set(0, sway * 0.12, sway * 0.05);
      this.leftBand.root.position.set(-148 + stepX * 0.85, 148 + grooveY * 0.85, -80);
      this.leftBand.root.rotation.set(0, 0.15 + sway * 0.1, sway * 0.04);
      this.rightBand.root.position.set(148 + stepX * 0.85, 148 + grooveY * 0.85, -80);
      this.rightBand.root.rotation.set(0, -0.15 + sway * 0.1, sway * 0.04);
    }

    // Expressive disco/funk choreography
    const leadArms: [P, P, P, P] = isDj
      ? [[-30, -32, 18], [-34, -40, 28], [28, -30, 18], [18, -36, 32]]
      : [
          [-28, -36 + Math.sin(q) * 5, 16],
          [-34, -46 + Math.sin(q) * 8, 24],
          [28, -36 - Math.sin(q) * 5, 16],
          [34, -46 - Math.sin(q) * 8, 24],
        ];
    const bandArms: [P, P, P, P] = [
      [-28, -26, 22],
      [-12, -38, 32],
      [28, -20 + beat * 8, 22],
      [44, -8 + beat * 12, 32],
    ];
    this.lead.pose(t, leadArms);
    this.leftBand.pose(t, bandArms);
    this.rightBand.pose(t, bandArms);

    // Camera framing per shot
    let camPos: P = [0, 175, 360];
    let camLook: P = [0, 155, -80];
    let fov = narrow ? 50 : 40;

    switch (view) {
      case 'might-silhouette':
        camPos = [0, 145, 310];
        camLook = [0, 215, -120];
        fov = narrow ? 54 : 44;
        break;
      case 'might-dj':
        camPos = [25, 168, 220];
        camLook = [0, 150, -25];
        fov = narrow ? 48 : 38;
        break;
      case 'might-trio':
        camPos = [0, 155, 185];
        camLook = [0, 168, -25];
        fov = narrow ? 44 : 34;
        break;
      case 'might-blue':
      case 'might-red':
        camPos = [Math.sin(t * 0.5) * 45, 148, 250];
        camLook = [0, 195, -80];
        fov = narrow ? 52 : 42;
        break;
      case 'might-carpet':
        camPos = [0, 132, 330];
        camLook = [0, 118, -60];
        fov = narrow ? 50 : 40;
        break;
      case 'might-bruno':
        camPos = [0, 168, 135];
        camLook = [0, 172, -35];
        fov = narrow ? 38 : 28;
        break;
      case 'might-chorus':
        camPos = [0, 166, 195];
        camLook = [0, 168, -35];
        fov = narrow ? 44 : 34;
        break;
      case 'might-rainbow':
      case 'might-stage':
      case 'wide':
      default:
        camPos = [Math.sin(t * 0.28) * 35, 176, 395];
        camLook = [0, 164, -90];
        fov = narrow ? 52 : 42;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.lead.root.visible) this.lead.update(t, playing, this.camera, dt, reset);
    if (this.leftBand.root.visible) this.leftBand.update(t, playing, this.camera, dt, reset);
    if (this.rightBand.root.visible) this.rightBand.update(t, playing, this.camera, dt, reset);
  }

  dispose() {
    this.lead.dispose();
    this.leftBand.dispose();
    this.rightBand.dispose();
    this.props.dispose();
  }
}
