import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type TheGiverId = 'gv-lead' | 'gv-choir';

const skinFair = '#eac4ae';
const skinChoir = '#dfb69e';
const lawyerNavy = '#1e2432';
const detectiveTan = '#b89e7c';
const dentistTeal = '#24665c';
const plumberNavy = '#1d2b3a';
const hiVisYellow = '#d8e428';
const hardhatOrange = '#e8481c';

function makeVhsMenuTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#2452b8';
  ctx.fillRect(0, 0, 512, 384);
  ctx.fillStyle = '#e8f0ff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('* * *  DVD MENU · SELECT TRACK  * * *', 256, 52);
  ctx.fillText('--------------------------------------', 256, 82);
  const items = [
    '   1.  THE LAWYER',
    '   2.  THE DETECTIVE',
    '-> 3.  THE DENTIST',
    '   4.  THE PLUMBER',
    '   5.  THE BUILDER',
  ];
  ctx.textAlign = 'left';
  for (let i = 0; i < items.length; i++) {
    if (i === 2) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(108, 108 + i * 38, 296, 30);
      ctx.fillStyle = '#2452b8';
    } else {
      ctx.fillStyle = '#dce8ff';
    }
    ctx.fillText(items[i], 116, 130 + i * 38);
  }
  ctx.fillStyle = '#ffe468';
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('CALL 620-HOT-TO-GO · ONLY $13.98', 256, 344);
  return new THREE.CanvasTexture(c);
}

function makeCharacterSelectTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#c85432';
  ctx.fillRect(0, 0, 512, 384);
  const cards: [number, number, string, string][] = [
    [56, 34, '#243448', 'PLUMBER'],
    [196, 34, '#e8481c', 'BUILDER'],
    [336, 34, '#b89e7c', 'DETECTIVE'],
    [126, 196, '#24665c', 'DENTIST'],
    [266, 196, '#1e2432', 'LAWYER'],
  ];
  for (const [x, y, col, label] of cards) {
    ctx.fillStyle = '#e8e2d8';
    ctx.fillRect(x, y, 118, 128);
    ctx.strokeStyle = '#241812';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, 118, 128);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x + 59, y + 48, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 28, y + 74, 62, 46);
    ctx.fillStyle = '#fff0c4';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 59, y + 146);
  }
  ctx.fillStyle = '#f2c838';
  ctx.fillRect(0, 354, 512, 30);
  ctx.fillStyle = '#241812';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE YOUR CHARACTER ★ SHE GETS THE JOB DONE', 256, 374);
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D cinematic stage for Chappell Roan — "The Giver"
 * Recreates the retro 1990s VHS infomercial & 5-job character revue:
 * 1. VHS DVD Menu & "Choose Your Character" 5-portrait infomercial board (gv-menu)
 * 2. The Lawyer — navy pinstripe suit, mahogany courtroom gavel (gv-lawyer)
 * 3. The Detective — tan trench coat, oversized magnifying glass & fingerprint clue (gv-detective)
 * 4. The Dentist — teal scrubs, giant hot-pink toothbrush & molar model (gv-dentist)
 * 5. The Plumber — dark jumpsuit, golden star badge & oversized rubber plunger (gv-plumber)
 * 6. The Construction Worker — orange safety hardhat, hi-vis vest & red cordless drill (gv-hardhat)
 */
export class TheGiverStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly menuGroup = new THREE.Group();
  readonly lawyerGroup = new THREE.Group();
  readonly detectiveGroup = new THREE.Group();
  readonly dentistGroup = new THREE.Group();
  readonly plumberGroup = new THREE.Group();
  readonly hardhatGroup = new THREE.Group();
  readonly halo: THREE.Group = new THREE.Group();

  readonly lead: VideoFigure;
  readonly choir: VideoFigure;
  readonly hardhatCap: THREE.Mesh;
  readonly dentistCap: THREE.Mesh;
  readonly gavel: THREE.Group;
  readonly magnifier: THREE.Group;
  readonly toothbrush: THREE.Group;
  readonly plunger: THREE.Group;
  readonly drill: THREE.Group;

  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly vhsTex: THREE.CanvasTexture | null;
  private readonly selectTex: THREE.CanvasTexture | null;
  private haloTex: THREE.CanvasTexture | null = null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly choirModel: VoiceModel,
    readonly choirTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#d8d2c6');

    const amb = new THREE.AmbientLight('#f4efe6', 0.92);
    this.keyLight = new THREE.DirectionalLight('#fff8ec', 1.45);
    this.keyLight.position.set(160, 420, 310);
    this.fillLight = new THREE.PointLight('#ffd6a8', 1.4, 2200);
    this.fillLight.position.set(-210, 210, 190);
    this.rimLight = new THREE.PointLight('#88c8ff', 1.35, 2200);
    this.rimLight.position.set(220, 240, -210);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    this.vhsTex = makeVhsMenuTexture();
    this.selectTex = makeCharacterSelectTexture();

    // Shared VHS studio floor
    const studioFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1600),
      new THREE.MeshStandardMaterial({ color: '#c4bcb0', roughness: 0.78 }),
    );
    studioFloor.rotation.x = -Math.PI / 2;
    this.scene.add(studioFloor);

    // 1. VHS Menu & "Choose Your Character" Infomercial Board
    const selectBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(460, 330),
      this.selectTex
        ? new THREE.MeshBasicMaterial({ map: this.selectTex })
        : new THREE.MeshBasicMaterial({ color: '#c85432' }),
    );
    selectBoard.position.set(0, 172, -195);
    const vhsMonitor = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 132),
      this.vhsTex
        ? new THREE.MeshBasicMaterial({ map: this.vhsTex })
        : new THREE.MeshBasicMaterial({ color: '#2452b8' }),
    );
    vhsMonitor.position.set(-155, 148, -110);
    vhsMonitor.rotation.y = 0.25;
    this.menuGroup.add(selectBoard, vhsMonitor);
    this.scene.add(this.menuGroup);

    // 2. The Lawyer — Cream VHS Backdrop + Giant Mahogany Courtroom Gavel
    const lawWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#d8d4cc', roughness: 0.8 }),
    );
    lawWall.position.set(0, 260, -260);
    this.gavel = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#68381c', roughness: 0.45 });
    const brassMat = new THREE.MeshStandardMaterial({ color: '#d8b24c', metalness: 0.8, roughness: 0.25 });
    const gHead = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 68, 16), woodMat);
    gHead.rotation.z = Math.PI / 2;
    const gBand = new THREE.Mesh(new THREE.CylinderGeometry(22.6, 22.6, 14, 16), brassMat);
    gBand.rotation.z = Math.PI / 2;
    const gHandle = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 110, 12), woodMat);
    gHandle.position.y = -55;
    const soundBlock = new THREE.Mesh(new THREE.CylinderGeometry(42, 46, 18, 20), woodMat);
    soundBlock.position.set(125, 9, -85);
    this.gavel.add(gHead, gBand, gHandle);
    this.gavel.position.set(125, 118, -85);
    this.lawyerGroup.add(lawWall, soundBlock, this.gavel);
    this.scene.add(this.lawyerGroup);

    // 3. The Detective — Oversized Magnifying Glass & Fingerprint Clue
    const detWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#ccc6ba', roughness: 0.82 }),
    );
    detWall.position.set(0, 260, -260);
    this.magnifier = new THREE.Group();
    const rimMat = new THREE.MeshStandardMaterial({ color: '#1c1c22', metalness: 0.7, roughness: 0.3 });
    const lensGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(52, 52, 6, 24),
      new THREE.MeshStandardMaterial({ color: '#b8e0f8', transparent: true, opacity: 0.42, roughness: 0.1 }),
    );
    lensGlass.rotation.x = Math.PI / 2;
    const lensRim = new THREE.Mesh(new THREE.TorusGeometry(52, 5, 10, 28), rimMat);
    const magHandle = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 86, 10), rimMat);
    magHandle.position.set(42, -56, 0);
    magHandle.rotation.z = 0.55;
    this.magnifier.add(lensGlass, lensRim, magHandle);
    this.magnifier.position.set(112, 152, -72);
    this.detectiveGroup.add(detWall, this.magnifier);
    this.scene.add(this.detectiveGroup);

    // 4. The Dentist — Lavender/Mint Studio + Giant Hot-Pink Toothbrush & Molar
    const dentWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#c4dce0', roughness: 0.78 }),
    );
    dentWall.position.set(0, 260, -260);
    this.toothbrush = new THREE.Group();
    const brushStick = new THREE.Mesh(
      new THREE.BoxGeometry(145, 10, 12),
      new THREE.MeshStandardMaterial({ color: '#f24898', roughness: 0.35 }),
    );
    const bristles = new THREE.Mesh(
      new THREE.BoxGeometry(36, 18, 12),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }),
    );
    bristles.position.set(52, 12, 0);
    this.toothbrush.add(brushStick, bristles);
    this.toothbrush.position.set(-108, 146, -65);
    const molar = new THREE.Mesh(
      new THREE.BoxGeometry(58, 68, 54),
      new THREE.MeshStandardMaterial({ color: '#fafcff', roughness: 0.25 }),
    );
    molar.position.set(125, 92, -95);
    this.dentistGroup.add(dentWall, this.toothbrush, molar);
    this.scene.add(this.dentistGroup);

    // 5. The Plumber — Golden Star Infomercial Backdrop & Giant Rubber Plunger
    const plumbWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#b4d6d2', roughness: 0.8 }),
    );
    plumbWall.position.set(0, 260, -260);
    const starDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(125, 125, 8, 5),
      new THREE.MeshStandardMaterial({ color: '#f4c438', roughness: 0.4, metalness: 0.3 }),
    );
    starDisc.rotation.x = Math.PI / 2;
    starDisc.position.set(0, 152, -165);
    this.plunger = new THREE.Group();
    const pStick = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 130, 10),
      new THREE.MeshStandardMaterial({ color: '#e6cfa8', roughness: 0.7 }),
    );
    const pCup = new THREE.Mesh(
      new THREE.SphereGeometry(32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: '#c42428', roughness: 0.65 }),
    );
    pCup.position.y = 65;
    pCup.rotation.x = Math.PI;
    this.plunger.add(pStick, pCup);
    this.plunger.position.set(-105, 126, -60);
    this.plumberGroup.add(plumbWall, starDisc, this.plunger);
    this.scene.add(this.plumberGroup);

    // 6. The Construction Worker — Warm Amber Backdrop & Red Cordless Power Drill
    const hardWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#dcd0b4', roughness: 0.8 }),
    );
    hardWall.position.set(0, 260, -260);
    this.drill = new THREE.Group();
    const drillBody = new THREE.Mesh(
      new THREE.BoxGeometry(46, 26, 18),
      new THREE.MeshStandardMaterial({ color: '#d42222', roughness: 0.4 }),
    );
    const drillGrip = new THREE.Mesh(
      new THREE.BoxGeometry(16, 44, 16),
      new THREE.MeshStandardMaterial({ color: '#222428', roughness: 0.7 }),
    );
    drillGrip.position.set(-10, -28, 0);
    const drillBit = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 34, 8),
      new THREE.MeshStandardMaterial({ color: '#c8d0d8', metalness: 0.85, roughness: 0.2 }),
    );
    drillBit.rotation.z = Math.PI / 2;
    drillBit.position.set(38, 2, 0);
    this.drill.add(drillBody, drillGrip, drillBit);
    this.drill.position.set(-96, 152, -55);
    this.hardhatGroup.add(hardWall, this.drill);
    this.scene.add(this.hardhatGroup);

    // Two physical female voices: Lead Vocal & Infomercial Backing Choir
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      lawyerNavy,
      skinFair,
    );
    this.lead.head.scene.scale.setScalar(2.14);

    this.choir = new VideoFigure(
      choirModel,
      choirTrack,
      this.props,
      this.scene,
      plumberNavy,
      skinChoir,
    );
    this.choir.head.scene.scale.setScalar(2.04);

    // Job hats seated cleanly above the 2.14x head (local y = +28, never blocking face!)
    this.hardhatCap = new THREE.Mesh(
      new THREE.SphereGeometry(22, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshStandardMaterial({ color: hardhatOrange, roughness: 0.35 }),
    );
    this.hardhatCap.position.set(0, 27, -1);
    this.lead.root.add(this.hardhatCap);

    this.dentistCap = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 21, 14, 14),
      new THREE.MeshStandardMaterial({ color: dentistTeal, roughness: 0.65 }),
    );
    this.dentistCap.position.set(0, 30, -2);
    this.lead.root.add(this.dentistCap);

    this.styleHair(this.lead, '#6e2218');
    this.styleHair(this.choir, '#3c1812');

    if (typeof document !== 'undefined') {
      const hc = document.createElement('canvas');
      hc.width = hc.height = 192;
      const hctx = hc.getContext('2d')!;
      const grad = hctx.createRadialGradient(96, 96, 10, 96, 96, 96);
      grad.addColorStop(0, 'rgba(10, 12, 20, 0.72)');
      grad.addColorStop(0.5, 'rgba(10, 12, 20, 0.38)');
      grad.addColorStop(1, 'rgba(10, 12, 20, 0)');
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 192, 192);
      this.haloTex = new THREE.CanvasTexture(hc);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.haloTex, transparent: true, depthWrite: false }));
      sp.scale.set(118, 118, 1);
      this.halo.add(sp);
    }
    this.scene.add(this.halo);

    this.resize(1280, 720);
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
    this.camera.updateProjectionMatrix();
    this.props.resize(this.width, this.height);
    this.lead.head.resize(this.width, this.height);
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

    // Stomping country-rock fiddle groove (~126 BPM)
    const beat = t * (126 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.5);
    const bounce = Math.abs(Math.sin(beat));

    const isMenu = view === 'gv-menu';
    const isLawyer = view === 'gv-lawyer' || view === 'wide';
    const isDetective = view === 'gv-detective';
    const isDentist = view === 'gv-dentist';
    const isPlumber = view === 'gv-plumber' || view === 'gv-choir';
    const isHardhat = view === 'gv-hardhat' || view === 'gv-lead';

    this.menuGroup.visible = isMenu;
    this.lawyerGroup.visible = isLawyer;
    this.detectiveGroup.visible = isDetective;
    this.dentistGroup.visible = isDentist;
    this.plumberGroup.visible = isPlumber;
    this.hardhatGroup.visible = isHardhat;

    // Switch costume & hat per character persona
    this.hardhatCap.visible = isHardhat;
    this.dentistCap.visible = isDentist;
    const coat = isDentist
      ? dentistTeal
      : isDetective
      ? detectiveTan
      : isHardhat
      ? hiVisYellow
      : isPlumber
      ? plumberNavy
      : lawyerNavy;
    (this.lead.torso.material as THREE.MeshBasicMaterial).color.set(coat);
    this.lead.arms.forEach(m => (m.material as THREE.MeshBasicMaterial).color.set(coat));

    // Animate job props
    this.gavel.rotation.z = Math.sin(beat) * 0.35;
    this.magnifier.position.y = 152 + Math.sin(beat * 0.5) * 10;
    this.toothbrush.rotation.z = Math.sin(beat) * 0.25;
    this.plunger.rotation.z = -0.3 + Math.sin(beat * 0.5) * 0.35;
    this.drill.position.y = 152 + bounce * 8;

    // VHS background palette per set
    if (isMenu) {
      this.scene.background = new THREE.Color('#203c8c');
    } else if (isDentist) {
      this.scene.background = new THREE.Color('#9ec4cc');
    } else if (isPlumber) {
      this.scene.background = new THREE.Color('#82b4ae');
    } else if (isHardhat) {
      this.scene.background = new THREE.Color('#c8b68e');
    } else if (isDetective) {
      this.scene.background = new THREE.Color('#b6aea0');
    } else {
      this.scene.background = new THREE.Color('#c2bcb2');
    }

    // Position lead & choir (VideoFigure head sits at root.y = 150!)
    const leadSpot: P = [sway * 14, 150 + bounce * 4, -14];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.y = sway * 0.16;
    this.halo.visible = true;
    this.halo.position.set(leadSpot[0], leadSpot[1] + 6, leadSpot[2] - 28);

    this.choir.root.visible = isPlumber || isMenu || isLawyer;
    this.choir.root.position.set(82 - sway * 10, 148 + bounce * 3, -48);
    this.choir.root.rotation.y = -0.24;

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -2 + Math.sin(phase) * 16, 22],
      [-54, 20 + lift + Math.sin(phase) * 22, 28],
      [34, -2 - Math.sin(phase) * 16, 22],
      [54, 20 + lift - Math.sin(phase) * 22, 28],
    ];
    this.lead.pose(t, arms(beat, speaker === 'gv-lead' || !speaker ? 24 + bounce * 10 : 10));
    this.choir.pose(t, arms(beat + 0.6, speaker === 'gv-choir' ? 24 + bounce * 8 : 8));

    // Deterministic hero cameras centered cleanly on the Chimera head
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.35) * 42, 158, 188];
    let target: [number, number, number] = [leadSpot[0], 150, leadSpot[2]];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'gv-menu':
        pos = [Math.sin(t * 0.25) * 38, 160, 210];
        target = [0, 152, -45];
        fov = portrait ? 54 : 40;
        break;
      case 'gv-lawyer':
      case 'wide':
        pos = [Math.sin(t * 0.3) * 42, 158, 192];
        target = [6, 150, -28];
        fov = portrait ? 52 : 38;
        break;
      case 'gv-detective':
        pos = [Math.sin(t * 0.32) * 38, 158, 182];
        target = [8, 150, -24];
        fov = portrait ? 50 : 36;
        break;
      case 'gv-dentist':
        pos = [Math.sin(t * 0.34) * 40, 158, 185];
        target = [0, 150, -24];
        fov = portrait ? 50 : 36;
        break;
      case 'gv-plumber':
        pos = [Math.sin(t * 0.36) * 42, 158, 190];
        target = [6, 150, -28];
        fov = portrait ? 52 : 38;
        break;
      case 'gv-hardhat':
        pos = [Math.sin(t * 0.34) * 38, 158, 182];
        target = [-4, 150, -24];
        fov = portrait ? 50 : 36;
        break;
      case 'gv-choir':
        pos = [this.choir.root.position.x + Math.sin(t * 0.38) * 10, 156, 86];
        target = [this.choir.root.position.x, 150, this.choir.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'gv-lead':
      default:
        pos = [leadSpot[0] + Math.sin(t * 0.42) * 12, 156, 100];
        target = [leadSpot[0], 152, leadSpot[2]];
        fov = portrait ? 38 : 27;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(beat) * 1.4;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    if (this.choir.root.visible) this.choir.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.choir.dispose();
    this.vhsTex?.dispose();
    this.selectTex?.dispose();
    this.haloTex?.dispose();
    (this.halo.children[0] as THREE.Sprite | undefined)?.material.dispose();
    this.props.dispose();
  }
}
