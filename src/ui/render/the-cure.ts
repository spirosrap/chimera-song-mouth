import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type CureId = 'cure-olivia';

const mintWall = '#a8c2b5';
const mintDark = '#4a7060';
const mintTile = '#c4dad0';
const pastelPink = '#e5b8c2';
const roseDoor = '#c78998';
const crimsonYarn = '#9c1422';
const creamMonitor = '#d9d5c9';
const ecgGreen = '#2e6e58';
const ecgGlow = '#7cffb2';
const nursePink = '#f5dce2';
const capWhite = '#faf8f6';
const darkHair = '#171314';
const skinTone = '#e4bfa9';
const guitarWood = '#a86e3c';
const boxTan = '#a6825c';

/**
 * Procedural 3D stage for Olivia Rodrigo — "the cure".
 * Recreates the pastel retro hospital & miniature dollhouse video:
 * crimson-yarn title tray, mint hospital corridor with pastel pink "O R" double doors,
 * glass-tube glowing chemistry lab, ribcage X-ray frame with pulsing red heart,
 * vintage corridor microphone & acoustic guitar, retro green ECG oscilloscope monitors,
 * overhead pink hospital bed tangled in crimson yarn with 6 surgical trays,
 * and the sunlit miniature dollhouse & cardboard moving boxes finale.
 */
export class TheCureStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 18000);
  readonly props = new VideoProps();

  readonly trayGroup = new THREE.Group();
  readonly corridorGroup = new THREE.Group();
  readonly labGroup = new THREE.Group();
  readonly examGroup = new THREE.Group();
  readonly monitorGroup = new THREE.Group();
  readonly bedGroup = new THREE.Group();
  readonly dollhouseGroup = new THREE.Group();

  readonly olivia: VideoFigure;
  readonly nurseCap = new THREE.Group();
  readonly xrayFrame = new THREE.Group();
  readonly xrayHeart: THREE.Mesh;
  readonly guitar = new THREE.Group();
  readonly micStand = new THREE.Group();
  readonly yarnThreads = new THREE.Group();
  readonly casualTop = new THREE.Group();

  readonly ecgTrace: ReturnType<VideoProps['ink']>;
  readonly labFlasks: THREE.Mesh[] = [];

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(readonly oliviaModel: VoiceModel, readonly oliviaTrack: TeleTrack) {
    this.scene.background = new THREE.Color(mintWall);
    this.scene.add(
      this.trayGroup,
      this.corridorGroup,
      this.labGroup,
      this.examGroup,
      this.monitorGroup,
      this.bedGroup,
      this.dollhouseGroup
    );

    this.buildTitleTray();
    this.buildCorridor();
    this.buildLab();
    this.buildExamRoom();
    this.ecgTrace = this.buildMonitors();
    this.buildBedRoom();
    this.buildDollhouse();

    this.olivia = new VideoFigure(oliviaModel, oliviaTrack, this.props, this.scene, nursePink, skinTone);
    this.olivia.head.scene.scale.setScalar(2.05);
    this.xrayHeart = this.styleOlivia();

    this.resize(1280, 720);
    this.frame(0, false, 0, 'cure-tray', 0);
  }

  private buildTitleTray() {
    const p = this.props;
    const g = this.trayGroup;
    // Pastel pink table + mint surgical tray + crimson yarn heart & waves (0:00-0:07, 0:49!)
    p.box(g, 900, 12, 650, pastelPink, [0, 0, -80]);
    p.box(g, 420, 18, 280, '#d0d9d5', [0, 10, -80]);
    p.box(g, 390, 20, 250, '#bfd9d2', [0, 12, -80]);
    // Crimson yarn heart & cursive loops on the tray
    p.oval(g, [-16, 26, -88], [26, 8, 24], crimsonYarn);
    p.oval(g, [16, 26, -88], [26, 8, 24], crimsonYarn);
    p.oval(g, [0, 26, -64], [24, 8, 28], crimsonYarn);
    const ink = p.ink(g);
    p.line(ink, [[-140, 25, -120], [-90, 25, -135], [-40, 25, -110], [40, 25, -50], [110, 25, -40], [160, 25, -60]], crimsonYarn, 4);
    ink.end();
  }

  private buildCorridor() {
    const p = this.props;
    const g = this.corridorGroup;
    // Checkered pastel mint/cream hospital hallway floor & tiled side walls (0:14-0:21, 2:27, 2:48, 3:58!)
    p.box(g, 520, 10, 2400, mintTile, [0, -5, -800]);
    p.box(g, 520, 10, 2400, '#c8d9d2', [0, 460, -800]);
    for (const sign of [-1, 1]) {
      p.box(g, 16, 470, 2400, mintWall, [sign * 255, 230, -800]);
      // Side green hospital ward doors receding down the hall
      for (let i = 0; i < 6; i++) {
        const z = -150 - i * 310;
        p.box(g, 20, 320, 145, mintDark, [sign * 244, 160, z]);
        p.box(g, 22, 110, 85, '#b8d6cc', [sign * 242, 235, z]);
      }
    }
    // Iconic pastel pink double doors at the far end labeled "O" and "R"
    p.box(g, 145, 340, 16, roseDoor, [-76, 170, -1450]);
    p.box(g, 145, 340, 16, roseDoor, [76, 170, -1450]);
    p.box(g, 76, 105, 20, '#e3e8e6', [-76, 225, -1444]);
    p.box(g, 76, 105, 20, '#e3e8e6', [76, 225, -1444]);
    p.mesh(g, new THREE.TorusGeometry(18, 3.2, 6, 18), [-76, 225, -1432], crimsonYarn);
    p.tube(g, [60, 205, -1432], [60, 245, -1432], 3.2, crimsonYarn);
    p.mesh(g, new THREE.TorusGeometry(11, 3, 6, 16, Math.PI), [68, 234, -1432], crimsonYarn).rotation.z = -Math.PI / 2;
    p.tube(g, [68, 224, -1432], [86, 205, -1432], 3.2, crimsonYarn);

    // Vintage corridor microphone stand (3:58-4:12!)
    g.add(this.micStand);
    this.micStand.position.set(0, 0, -5);
    p.mesh(this.micStand, new THREE.CylinderGeometry(24, 28, 6, 18), [0, 3, 0], '#6e6556');
    p.tube(this.micStand, [0, 6, 0], [0, 168, 0], 2.5, '#b8aa8a');
    p.oval(this.micStand, [0, 176, 4], [7, 10, 7], '#d8cfa8');
  }

  private buildLab() {
    const p = this.props;
    const g = this.labGroup;
    // Mint tiled lab walls & white counter (0:56-1:31!)
    p.box(g, 1600, 10, 1200, mintTile, [0, -5, -100]);
    p.box(g, 1600, 620, 14, '#d2e2dc', [0, 305, -420]);
    p.box(g, 920, 115, 160, '#e8ecea', [0, 58, 35]);
    // Elaborate glass chemistry lab stands, tubes & glowing pink/amber flasks
    for (let i = -3; i <= 3; i++) {
      const x = i * 110;
      p.tube(g, [x, 115, 30], [x, 315, 30], 2.2, '#7d8a86');
      const flask = p.oval(g, [x + 18, 145 + (i % 2) * 35, 35], [18, 22, 18], i % 2 === 0 ? '#f7889d' : '#ffba75');
      Object.assign(flask.material, { transparent: true, opacity: 0.72 });
      this.labFlasks.push(flask);
      if (i < 3) {
        p.tube(g, [x + 18, 220, 30], [x + 128, 240, 30], 2.0, '#d8f0ec');
      }
    }
  }

  private buildExamRoom() {
    const p = this.props;
    const g = this.examGroup;
    // Pale mint tiled exam room & specimen cabinet (1:38, 2:34, 3:16, 3:51!)
    p.box(g, 1400, 10, 1200, mintTile, [0, -5, -100]);
    p.box(g, 1400, 620, 14, '#b8d1c7', [0, 305, -360]);
    for (let i = -8; i <= 8; i++) {
      p.box(g, 3, 420, 16, '#9cb8ad', [i * 75, 210, -352]);
    }
    // Pink glass specimen cabinet on the side
    p.box(g, 150, 190, 55, pastelPink, [-260, 195, -310]);
    p.box(g, 124, 164, 10, '#dce8e4', [-260, 195, -280]);
    for (let row = 0; row < 3; row++) {
      p.oval(g, [-290, 145 + row * 48, -274], [15, 11, 12], '#7d6e68');
      p.oval(g, [-230, 145 + row * 48, -274], [15, 11, 12], '#7d6e68');
    }
  }

  private buildMonitors(): ReturnType<VideoProps['ink']> {
    const p = this.props;
    const g = this.monitorGroup;
    // Retro cream dual-screen ECG oscilloscope station (3:30!)
    p.box(g, 1400, 620, 14, '#8fa69d', [0, 305, -380]);
    p.box(g, 380, 220, 120, creamMonitor, [0, 175, -140]);
    p.box(g, 148, 96, 10, ecgGreen, [-88, 212, -78]);
    p.box(g, 148, 96, 10, ecgGreen, [88, 212, -78]);
    // Heart silhouette inside right monitor
    p.oval(g, [88, 212, -70], [22, 26, 4], '#9bf2c6');
    // Control knobs & dial row
    for (let i = -4; i <= 4; i++) {
      p.mesh(g, new THREE.CylinderGeometry(7, 7, 10, 12), [i * 34, 112, -78], '#6e6c64').rotation.x = Math.PI / 2;
    }
    return p.ink(g);
  }

  private buildBedRoom() {
    const p = this.props;
    const g = this.bedGroup;
    // Pink-and-white checkered floor (3:44, 4:19, 4:33!)
    for (let x = -5; x <= 5; x++) {
      for (let z = -4; z <= 4; z++) {
        const col = (x + z) % 2 === 0 ? '#e5b8c2' : '#d8dee2';
        p.box(g, 110, 8, 110, col, [x * 110, -4, z * 110 - 60]);
      }
    }
    // Pink hospital bed centerpiece
    p.box(g, 210, 82, 340, '#e8c4cc', [0, 42, -60]);
    p.oval(g, [0, 92, -165], [75, 22, 48], '#f7e6ea');
    // Six surrounding surgical trays with red yarn hearts (3:44, 4:19!)
    for (const sx of [-195, 195]) {
      for (const sz of [-155, -55, 45]) {
        p.box(g, 88, 10, 62, '#c0d6d2', [sx, 78, sz]);
        p.tube(g, [sx, 0, sz], [sx, 76, sz], 3.5, '#8c9491');
        p.oval(g, [sx, 88, sz], [14, 8, 14], crimsonYarn);
        // Crimson yarn connecting trays to bed
        p.tube(g, [sx * 0.85, 86, sz], [sx * 0.35, 84, sz - 10], 2.2, crimsonYarn);
      }
    }
  }

  private buildDollhouse() {
    const p = this.props;
    const g = this.dollhouseGroup;
    // Sunlit warm living room carpet & walls with cardboard moving boxes (4:47-5:08!)
    p.box(g, 2200, 10, 1800, '#857154', [0, -5, -200]);
    p.box(g, 2200, 720, 14, '#e6d8cc', [0, 355, -520]);
    p.box(g, 380, 340, 18, '#fff7e0', [340, 290, -508]);
    // Miniature pastel pink-and-mint hospital dollhouse sitting on the carpet
    p.box(g, 260, 155, 175, mintWall, [-210, 78, -210]);
    p.box(g, 240, 12, 165, pastelPink, [-210, 12, -210]);
    p.box(g, 90, 32, 65, roseDoor, [-210, 34, -210]);
    // Stacked cardboard moving boxes
    p.box(g, 115, 95, 110, boxTan, [160, 48, -120]);
    p.box(g, 105, 85, 100, '#96724d', [260, 42, -220]);
    p.box(g, 90, 75, 88, boxTan, [120, 128, -140]);
  }

  private styleOlivia(): THREE.Mesh {
    const p = this.props;
    const f = this.olivia;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // Dark wavy vintage 1950s hair
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-6, 20);
      const b = B(7, 17);
      p.line(f.hair, [[a.x, a.y + 3 * k, z], [a.x + 5 * k, a.y + 6 * k, z], [b.x, b.y, z]], darkHair, 3.3);
    }
    for (let i = -4; i <= 4; i++) {
      p.line(f.hair, [[i * 5, 22, -10], [i * 6, -4, -14], [i * 6.5, -36, -15]], darkHair, 4.2);
    }
    f.hair.end();

    // Retro crisp white folded nurse cap
    f.root.add(this.nurseCap);
    p.box(this.nurseCap, 42, 14, 18, capWhite, [0, 44, -6]);
    p.box(this.nurseCap, 14, 4, 2, crimsonYarn, [0, 44, 4]);
    p.box(this.nurseCap, 4, 12, 2, crimsonYarn, [0, 44, 4]);

    // Glowing skeleton ribcage X-ray frame held in front of torso (2:34, 3:16, 3:51!)
    f.root.add(this.xrayFrame);
    p.box(this.xrayFrame, 104, 122, 8, '#8c7258', [0, -34, 32]);
    p.box(this.xrayFrame, 92, 110, 10, '#5a6e5c', [0, -34, 33]);
    p.tube(this.xrayFrame, [0, 10, 39], [0, -82, 39], 4.5, '#eef2eb');
    for (let r = 0; r < 6; r++) {
      const y = 2 - r * 12;
      const w = 24 + Math.sin((r / 5) * Math.PI) * 14;
      p.tube(this.xrayFrame, [-w, y, 39], [w, y, 39], 2.6, '#eef2eb');
    }
    const heart = p.oval(this.xrayFrame, [11, -12, 41], [9, 11, 5], crimsonYarn);

    // Acoustic guitar (2:48!)
    f.root.add(this.guitar);
    p.oval(this.guitar, [6, -48, 28], [32, 38, 12], guitarWood);
    p.mesh(this.guitar, new THREE.CircleGeometry(10, 16), [6, -46, 36], '#291a0e');
    p.tube(this.guitar, [20, -36, 30], [74, 8, 30], 4.5, '#6e4523');

    // Unraveling crimson yarn strands trailing from nurse dress (2:27, 3:02!)
    f.root.add(this.yarnThreads);
    for (let i = -2; i <= 2; i++) {
      p.tube(this.yarnThreads, [i * 12, -16, 16], [i * 28, -76, 22], 2.2, crimsonYarn);
    }

    // Casual grey sweater & blue jeans overlay for dollhouse moving-box epilogue (5:01!)
    f.root.add(this.casualTop);
    p.box(this.casualTop, 42, 62, 26, '#8f969e', [0, -34, 0]);
    p.box(this.casualTop, 38, 66, 22, '#5a82a6', [0, -96, 0]);

    return heart;
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.olivia.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, _speaker?: CharacterId) {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const aspect = this.width / this.height;
    const narrow = aspect < 1;
    const sway = Math.sin(t * 2.4);
    const pulse = Math.sin(t * 6.5);

    const isTray = view === 'cure-tray';
    const isCorridor = view === 'cure-corridor' || view === 'cure-doors' || view === 'cure-guitar' || view === 'cure-mic' || view === 'cure-yarn';
    const isLab = view === 'cure-lab' || view === 'cure-olivia';
    const isExam = view === 'cure-xray' || view === 'cure-exam';
    const isMonitor = view === 'cure-monitor';
    const isBed = view === 'cure-bed';
    const isDollhouse = view === 'cure-dollhouse';

    this.trayGroup.visible = isTray;
    this.corridorGroup.visible = isCorridor;
    this.labGroup.visible = isLab;
    this.examGroup.visible = isExam;
    this.monitorGroup.visible = isMonitor;
    this.bedGroup.visible = isBed;
    this.dollhouseGroup.visible = isDollhouse;

    const bg = isDollhouse ? '#dfd2c3'
      : isBed ? '#cfb6c2'
      : isMonitor ? '#7d948c'
      : isLab ? '#cde0da'
      : mintWall;
    this.scene.background = new THREE.Color(bg);

    // Animate ECG heartbeat waveform on monitor
    this.ecgTrace.begin();
    if (isMonitor) {
      const pts: P[] = [];
      for (let i = 0; i < 28; i++) {
        const u = i / 27;
        const x = -152 + u * 128;
        const phase = ((u * 2.2 - t * 0.9) % 1 + 1) % 1;
        const spike = phase > 0.42 && phase < 0.48 ? 28 : phase > 0.48 && phase < 0.54 ? -16 : 0;
        pts.push([x, 210 + spike, -71]);
      }
      this.props.line(this.ecgTrace, pts, ecgGlow, 2.2);
    }
    this.ecgTrace.end();

    // Gently pulse chemistry flasks & X-ray heart
    if (isLab) {
      this.labFlasks.forEach((fl, i) => {
        fl.scale.setScalar(0.95 + Math.sin(t * 3 + i) * 0.08);
      });
    }
    this.xrayHeart.scale.setScalar(0.92 + Math.abs(pulse) * 0.25);

    // Props & outfit toggles per scene
    const isCasual = isDollhouse;
    this.nurseCap.visible = !isCasual;
    this.casualTop.visible = isCasual;
    this.xrayFrame.visible = view === 'cure-xray';
    this.guitar.visible = view === 'cure-guitar';
    this.micStand.visible = view === 'cure-mic';
    this.yarnThreads.visible = view === 'cure-yarn' || isBed;

    const showOlivia = !isTray && !isMonitor && view !== 'cure-doors';
    this.olivia.root.visible = showOlivia;
    this.olivia.root.rotation.set(0, 0, 0);

    if (isBed) {
      // Lying horizontally on the pink hospital bed viewed from directly overhead!
      this.olivia.root.position.set(0, 96, -70);
      this.olivia.root.rotation.set(-Math.PI / 2, 0, 0);
    } else if (isDollhouse) {
      this.olivia.root.position.set(18, 146, -40);
      this.olivia.root.rotation.set(0, -0.15 + sway * 0.06, 0);
    } else {
      this.olivia.root.position.set(0, 148 + Math.abs(sway) * 2.5, -55);
      this.olivia.root.rotation.set(0, sway * 0.06, 0);
    }

    let arms: [P, P, P, P] = [
      [-28, -14 + sway * 8, 18],
      [-40, -6 + sway * 12, 28],
      [28, -14 - sway * 8, 18],
      [40, -6 - sway * 12, 28],
    ];
    if (view === 'cure-yarn') {
      // Wide outstretched arms unraveling crimson yarn in corridor (2:27!)
      arms = [[-46, 2, 14], [-82, -6 + sway * 12, 18], [46, 2, 14], [82, -6 - sway * 12, 18]];
    } else if (view === 'cure-xray') {
      arms = [[-36, -24, 24], [-48, -28, 36], [36, -24, 24], [48, -28, 36]];
    } else if (view === 'cure-guitar') {
      arms = [[-28, -32, 24], [-10, -42, 34], [32, -26, 22], [58, -4, 32]];
    } else if (view === 'cure-mic') {
      arms = [[-22, -10, 26], [-8, 12, 42], [22, -10, 26], [8, 12, 42]];
    } else if (isBed) {
      arms = [[-42, -6, 12], [-58, 22, 16], [42, -6, 12], [58, 22, 16]];
    } else if (intensity > 0.88) {
      arms = [[-34, -4 + sway * 14, 22], [-50, 16 + sway * 18, 32], [34, -4 - sway * 14, 22], [50, 16 - sway * 18, 32]];
    }
    this.olivia.pose(t, arms);

    // Camera framing per shot
    let camPos: P = [0, 174, 210];
    let camLook: P = [0, 162, -55];
    let camUp: P = [0, 1, 0];
    let fov = narrow ? 46 : 36;

    switch (view) {
      case 'cure-tray':
        camPos = [0, 320, -45];
        camLook = [0, 16, -80];
        fov = narrow ? 54 : 44;
        break;
      case 'cure-doors':
        camPos = [0, 185, -520];
        camLook = [0, 180, -1450];
        fov = narrow ? 46 : 36;
        break;
      case 'cure-corridor':
      case 'cure-yarn':
      case 'cure-guitar':
      case 'cure-mic':
        camPos = [0, 168, 215];
        camLook = [0, 158, -120];
        fov = narrow ? 48 : 38;
        break;
      case 'cure-lab':
        camPos = [0, 176, 245];
        camLook = [0, 164, -45];
        fov = narrow ? 48 : 38;
        break;
      case 'cure-exam':
      case 'cure-xray':
        camPos = [0, 166, 240];
        camLook = [0, 150, -55];
        fov = narrow ? 46 : 36;
        break;
      case 'cure-monitor':
        camPos = [0, 190, 160];
        camLook = [0, 180, -120];
        fov = narrow ? 46 : 36;
        break;
      case 'cure-bed':
        // Symmetrical overhead camera looking straight down at Olivia on the pink hospital bed!
        camPos = [0, 480, -68];
        camLook = [0, 88, -70];
        camUp = [0, 0, -1];
        fov = narrow ? 62 : 52;
        break;
      case 'cure-dollhouse':
        camPos = [35, 195, 290];
        camLook = [-35, 130, -120];
        fov = narrow ? 52 : 42;
        break;
      case 'cure-olivia':
      case 'wide':
      default:
        camPos = [0, 174, 138];
        camLook = [0, 168, -55];
        fov = narrow ? 38 : 28;
        break;
    }

    this.camera.fov = fov;
    this.camera.up.set(...camUp);
    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.olivia.root.visible) {
      this.olivia.update(t, playing, this.camera, dt, reset);
    }
  }

  dispose() {
    this.olivia.dispose();
    this.props.dispose();
  }
}
