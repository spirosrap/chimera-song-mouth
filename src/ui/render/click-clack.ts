import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type ClickClackId = 'cc-raye' | 'cc-choir';

const skinRaye = '#c49272';
const hairAuburn = '#4c2218';
const crimsonDress = '#9e0e1e';
const crimsonPlume = '#b41222';
const tealPillow = '#2c5c68';
const overcastSky = '#788488';
const downsGold = '#c8c4a4';

function makeNeonSignTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#380c12';
  ctx.fillRect(0, 0, 512, 256);
  ctx.shadowColor = '#ff7294';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#fff0f4';
  ctx.font = 'italic bold 34px serif';
  ctx.textAlign = 'center';
  ctx.fillText("We don't settle", 256, 88);
  ctx.fillText('for depression', 256, 138);
  ctx.fillText('on a Friday night', 256, 188);
  return new THREE.CanvasTexture(c);
}

function makePianoWalkTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#eceef0';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#1c1e22';
  ctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    ctx.strokeRect(i * 32, 0, 32, 128);
    if (i % 7 !== 2 && i % 7 !== 6) {
      ctx.fillStyle = '#181a1e';
      ctx.fillRect(i * 32 + 21, 0, 20, 76);
    }
  }
  return new THREE.CanvasTexture(c);
}

function makeMusicalNoteMesh(scale = 1, color = '#111216'): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(14 * scale, 12, 10), mat);
  head.scale.set(1.25, 0.9, 0.7);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(2.8 * scale, 2.8 * scale, 68 * scale, 8), mat);
  stem.position.set(14 * scale, 34 * scale, 0);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(36 * scale, 11 * scale, 5 * scale), mat);
  flag.position.set(30 * scale, 62 * scale, 0);
  flag.rotation.z = -0.35;
  g.add(head, stem, flag);
  return g;
}

/**
 * Procedural 3D cinematic stage for RAYE feat. Hans Zimmer — "Click Clack Symphony."
 * Recreates the B&W globe wrapped in musical staves, moody London manor parlor, tufted teal
 * pillow sofa, crimson "We don't settle for depression on a Friday night" neon room,
 * gravity-tilted hardwood hall, South London terraced street with piano-key zebra crossing
 * and drifting eighth-notes, giant flying musical note soaring over London & medieval castle,
 * and golden-hour English hillside downs in a scarlet feather coat.
 */
export class ClickClackStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly globeGroup = new THREE.Group();
  readonly parlorGroup = new THREE.Group();
  readonly sofaGroup = new THREE.Group();
  readonly neonGroup = new THREE.Group();
  readonly streetGroup = new THREE.Group();
  readonly flightGroup = new THREE.Group();
  readonly downsGroup = new THREE.Group();

  readonly globeOrb: THREE.Mesh;
  readonly floatingNotes: THREE.Group[] = [];
  readonly giantNote: THREE.Group;
  readonly squad: THREE.Group[] = [];

  readonly raye: VideoFigure;
  readonly choir: VideoFigure;
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly neonTex: THREE.CanvasTexture | null;
  private readonly pianoTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly rayeModel: VoiceModel,
    readonly rayeTrack: TeleTrack,
    readonly choirModel: VoiceModel,
    readonly choirTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#141418');

    const amb = new THREE.AmbientLight('#eae4dc', 0.9);
    this.keyLight = new THREE.DirectionalLight('#fff4e2', 1.45);
    this.keyLight.position.set(180, 420, 320);
    this.fillLight = new THREE.PointLight('#d84a62', 1.5, 2200);
    this.fillLight.position.set(-200, 220, 180);
    this.rimLight = new THREE.PointLight('#78b4d8', 1.4, 2200);
    this.rimLight.position.set(220, 260, -200);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    // 1. B&W musical-staff globe & clouds
    this.globeOrb = new THREE.Mesh(
      new THREE.SphereGeometry(125, 20, 16),
      new THREE.MeshStandardMaterial({ color: '#c8cacd', roughness: 0.72 }),
    );
    this.globeOrb.position.set(0, 190, -240);
    this.globeGroup.add(this.globeOrb);
    const staffMat = new THREE.MeshBasicMaterial({ color: '#e8eaee', side: THREE.DoubleSide });
    for (let r = 0; r < 5; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(180 + r * 14, 1.4, 6, 48), staffMat);
      ring.position.set(0, 190, -240);
      ring.rotation.x = Math.PI * 0.42;
      ring.rotation.y = 0.25;
      this.globeGroup.add(ring);
    }

    // 2. Moody manor parlor & gravity-tilted hardwood hall
    const woodFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1200),
      new THREE.MeshStandardMaterial({ color: '#463426', roughness: 0.7 }),
    );
    woodFloor.rotation.x = -Math.PI / 2;
    const manorWall = new THREE.Mesh(
      new THREE.BoxGeometry(920, 420, 24),
      new THREE.MeshStandardMaterial({ color: '#585240', roughness: 0.85 }),
    );
    manorWall.position.set(0, 210, -220);
    const archWin = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 210),
      new THREE.MeshBasicMaterial({ color: '#9ab0b8' }),
    );
    archWin.position.set(0, 210, -206);
    this.parlorGroup.add(woodFloor, manorWall, archWin);

    // 3. Tufted teal pillow sofa
    const pillowMat = new THREE.MeshStandardMaterial({ color: tealPillow, roughness: 0.82 });
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(68, 56, 36), pillowMat);
      p.position.set(((i % 4) - 1.5) * 62, 68 + Math.floor(i / 4) * 46, -55 - (i % 2) * 18);
      p.rotation.z = ((i % 3) - 1) * 0.22;
      this.sofaGroup.add(p);
    }

    // 4. Crimson neon room ("We don't settle for depression on a Friday night")
    this.neonTex = makeNeonSignTexture();
    const neonWall = new THREE.Mesh(
      new THREE.PlaneGeometry(540, 270),
      new THREE.MeshStandardMaterial({ map: this.neonTex, roughness: 0.6 }),
    );
    neonWall.position.set(0, 190, -170);
    this.neonGroup.add(neonWall);

    // 5. South London terraced street, piano-key crosswalk & drifting eighth-notes
    const asphalt = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1600),
      new THREE.MeshStandardMaterial({ color: '#383c40', roughness: 0.88 }),
    );
    asphalt.rotation.x = -Math.PI / 2;
    this.streetGroup.add(asphalt);

    this.pianoTex = makePianoWalkTexture();
    const pianoWalk = new THREE.Mesh(
      new THREE.PlaneGeometry(520, 115),
      new THREE.MeshStandardMaterial({ map: this.pianoTex, roughness: 0.65 }),
    );
    pianoWalk.rotation.x = -Math.PI / 2;
    pianoWalk.position.set(0, 2, -25);
    this.streetGroup.add(pianoWalk);

    const houseMat = new THREE.MeshStandardMaterial({ color: '#a89e92', roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ color: '#3e3836', roughness: 0.9 });
    for (const side of [-1, 1]) {
      for (let h = 0; h < 5; h++) {
        const bx = side * 340;
        const bz = -100 - h * 190;
        const house = new THREE.Mesh(new THREE.BoxGeometry(170, 230, 165), houseMat);
        house.position.set(bx, 115, bz);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(125, 78, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(bx, 268, bz);
        this.streetGroup.add(house, roof);
      }
    }

    // Girl squad marching on the street
    const squadColors = ['#d86c82', '#383c4c', '#e6e2dc', '#8868a8', '#222228', '#d4a6b4'];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const sx = (i < 3 ? -220 + i * 56 : 110 + (i - 3) * 56);
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 14, 72, 10),
        new THREE.MeshStandardMaterial({ color: squadColors[i], roughness: 0.65 }),
      );
      body.position.y = 86;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(11.5, 10, 10),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? skinRaye : '#8c5a40', roughness: 0.65 }),
      );
      head.position.y = 142;
      g.add(body, head);
      g.position.set(sx, 0, -90);
      this.squad.push(g);
      this.streetGroup.add(g);
    }

    // Floating musical eighth-notes rising into the sky
    for (let i = 0; i < 14; i++) {
      const note = makeMusicalNoteMesh(0.55 + (i % 3) * 0.18, '#14161a');
      note.position.set(((i * 93) % 660) - 330, 180 + (i * 29) % 180, -140 - (i % 4) * 65);
      this.floatingNotes.push(note);
      this.streetGroup.add(note);
    }

    // 6. Giant flying musical eighth-note soaring over London & medieval castle
    this.giantNote = makeMusicalNoteMesh(2.6, '#101216');
    this.giantNote.position.set(0, 275, -24);
    const castleTower = new THREE.Mesh(
      new THREE.BoxGeometry(110, 260, 110),
      new THREE.MeshStandardMaterial({ color: '#645448', roughness: 0.9 }),
    );
    castleTower.position.set(220, 40, -340);
    const londonPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#424844', roughness: 0.95 }),
    );
    londonPlane.rotation.x = -Math.PI / 2;
    londonPlane.position.y = -180;
    this.flightGroup.add(this.giantNote, castleTower, londonPlane);

    // 7. Sunlit English hilltop downs
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(950, 24, 16),
      new THREE.MeshStandardMaterial({ color: '#4d6a36', roughness: 0.94 }),
    );
    hill.scale.set(1.6, 0.35, 1.3);
    hill.position.set(0, -315, -80);
    this.downsGroup.add(hill);

    this.scene.add(
      this.globeGroup,
      this.parlorGroup,
      this.sofaGroup,
      this.neonGroup,
      this.streetGroup,
      this.flightGroup,
      this.downsGroup,
    );

    // Physical Mouth Figures
    // 1. RAYE (crimson halter gown + voluminous scarlet feather stole + sculpted auburn bob)
    this.raye = new VideoFigure(rayeModel, rayeTrack, this.props, this.scene, crimsonDress, skinRaye);
    this.raye.head.scene.scale.setScalar(2.06);
    this.props.box(this.raye.root, 34, 62, 22, crimsonDress, [0, -36, 2]);
    this.props.oval(this.raye.root, [-22, -16, 4], [16, 15, 14], crimsonPlume);
    this.props.oval(this.raye.root, [22, -16, 4], [16, 15, 14], crimsonPlume);
    this.styleHair(this.raye, hairAuburn);

    // 2. Girls Squad / Symphonic Choir (classic evening dress)
    this.choir = new VideoFigure(choirModel, choirTrack, this.props, this.scene, '#242632', '#9e684e');
    this.choir.head.scene.scale.setScalar(1.98);
    this.props.box(this.choir.root, 34, 58, 22, '#242632', [0, -34, 2]);
    this.styleHair(this.choir, '#181414');

    this.resize(1280, 720);
    this.frame(0, false, 0, 'cc-globe', 0);
  }

  private styleHair(f: VideoFigure, color: string): void {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(8, 17);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 6 * k, a.y + 8 * k, z], [b.x, b.y - 4 * k, z]], color, 4.0);
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.raye.head.resize(this.width, this.height);
    this.choir.head.resize(this.width, this.height);
  }

  frame(
    time: number,
    playing: boolean,
    epoch: number,
    view: CameraView = 'wide',
    intensity = 0,
    speaker?: CharacterId,
  ): void {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const q = t * (122 / 60) * Math.PI * 2;
    const sway = Math.sin(q * 0.5);
    const march = Math.abs(Math.sin(q)) * 5.0;

    const isGlobe = view === 'cc-globe';
    const isParlor = view === 'cc-parlor' || view === 'cc-gravity';
    const isSofa = view === 'cc-sofa';
    const isNeon = view === 'cc-neon';
    const isStreet = view === 'cc-street' || view === 'cc-piano-walk' || view === 'wide';
    const isFlight = view === 'cc-flight';
    const isDowns = view === 'cc-downs' || view === 'cc-feathers';

    this.globeGroup.visible = isGlobe;
    this.parlorGroup.visible = isParlor || isSofa;
    this.sofaGroup.visible = isSofa;
    this.neonGroup.visible = isNeon;
    this.streetGroup.visible = isStreet;
    this.flightGroup.visible = isFlight;
    this.downsGroup.visible = isDowns;

    this.globeOrb.rotation.y = t * 0.22;
    this.floatingNotes.forEach((n, idx) => {
      n.position.y = 140 + ((t * 44 + idx * 31) % 240);
      n.rotation.z = Math.sin(t * 1.8 + idx) * 0.25;
    });
    this.squad.forEach((s, idx) => {
      s.position.y = Math.abs(Math.sin(q + idx * 0.5)) * 9;
    });
    this.giantNote.position.y = 265 + Math.sin(t * 1.4) * 14;

    if (isDowns) {
      this.scene.background = new THREE.Color(downsGold);
      this.keyLight.intensity = 1.8;
      this.fillLight.color.set('#ffe2b8');
    } else if (isStreet || isFlight) {
      this.scene.background = new THREE.Color(overcastSky);
      this.keyLight.intensity = 1.4;
      this.fillLight.color.set('#d8e2e8');
    } else if (isNeon) {
      this.scene.background = new THREE.Color('#28080e');
      this.keyLight.intensity = 0.9;
      this.fillLight.color.set('#ff3668');
    } else if (isGlobe) {
      this.scene.background = new THREE.Color('#16161a');
      this.keyLight.intensity = 1.25;
      this.fillLight.color.set('#d4d8dc');
    } else {
      this.scene.background = new THREE.Color('#1c1a16');
      this.keyLight.intensity = 1.05;
      this.fillLight.color.set('#c49862');
    }

    const flyLift = isFlight ? 65 + Math.sin(t * 1.4) * 14 : 0;
    this.raye.root.position.set(sway * 14, 150 + flyLift + march * 0.8, -10);
    this.raye.root.rotation.set(0, sway * 0.14, view === 'cc-gravity' ? 0.45 : sway * 0.04);

    this.choir.root.visible = !isFlight && !isDowns;
    this.choir.root.position.set(106 - sway * 10, 148 + march * 0.7, -34);
    this.choir.root.rotation.set(0, -0.18 + sway * 0.12, -sway * 0.04);

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -6 + Math.sin(phase) * 14, 22],
      [-52, 16 + lift + Math.sin(phase) * 20, 28],
      [34, -6 - Math.sin(phase) * 14, 22],
      [52, 16 + lift - Math.sin(phase) * 20, 28],
    ];
    this.raye.pose(t, arms(q, speaker === 'cc-raye' ? 20 : 8));
    this.choir.pose(t, arms(q + 0.7, speaker === 'cc-choir' ? 18 : 6));

    const portrait = this.height > this.width;
    let pos: P = [Math.sin(t * 0.35) * 60, 174, 380];
    let target: P = [0, 154, -20];
    let fov = portrait ? 52 : 40;

    switch (view) {
      case 'cc-raye':
      case 'cc-feathers':
        pos = [this.raye.root.position.x + Math.sin(t * 0.5) * 10, 170 + flyLift, 108];
        target = [this.raye.root.position.x, 168 + flyLift, -10];
        fov = portrait ? 38 : 27;
        break;
      case 'cc-choir':
        pos = [this.choir.root.position.x + 10, 168, 98];
        target = [this.choir.root.position.x, 166, -34];
        fov = portrait ? 38 : 27;
        break;
      case 'cc-globe':
        pos = [Math.sin(t * 0.25) * 45, 190, 365];
        target = [0, 175, -120];
        fov = portrait ? 52 : 40;
        break;
      case 'cc-piano-walk':
        pos = [Math.sin(t * 0.35) * 80, 215, 360];
        target = [0, 115, -25];
        fov = portrait ? 54 : 42;
        break;
      case 'cc-flight':
        pos = [Math.sin(t * 0.4) * 110, 240 + flyLift * 0.5, 430];
        target = [0, 195 + flyLift * 0.5, -24];
        fov = portrait ? 56 : 44;
        break;
      case 'cc-downs':
        pos = [Math.sin(t * 0.25) * 65, 182, 340];
        target = [0, 158, -10];
        fov = portrait ? 50 : 38;
        break;
      case 'cc-parlor':
      case 'cc-sofa':
      case 'cc-neon':
      case 'cc-gravity':
      case 'cc-street':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 65, 176, 385];
        target = [0, 154, -25];
        fov = portrait ? 52 : 40;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(q) * 1.4;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.raye.update(t, playing, this.camera, dt, reset);
    if (this.choir.root.visible) this.choir.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.raye.dispose();
    this.choir.dispose();
    this.neonTex?.dispose();
    this.pianoTex?.dispose();
    this.props.dispose();
  }
}
