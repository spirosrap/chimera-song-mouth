import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type DrumsDeathId = 'dd-lead' | 'dd-glitch';

const officeTeal = '#4a6068';
const suitCharcoal = '#2e3840';
const cottonWhite = '#e8eae6';
const skinLead = '#c89678';
const skinGlitch = '#a87c64';
const carpetBlue = '#364b58';
const cabinetGrey = '#748086';

function makeOfficeChair(): THREE.Group {
  const g = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color: '#3a4248', roughness: 0.8 });
  const legMat = new THREE.MeshStandardMaterial({ color: '#181c20', metalness: 0.5, roughness: 0.4 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(42, 6, 42), seatMat);
  seat.position.y = 46;
  const back = new THREE.Mesh(new THREE.BoxGeometry(40, 44, 6), seatMat);
  back.position.set(0, 70, -19);
  g.add(seat, back);
  for (const [lx, lz] of [[-18, -18], [18, -18], [-18, 18], [18, 18]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 46, 6), legMat);
    leg.position.set(lx, 23, lz);
    g.add(leg);
  }
  return g;
}

function makeOfficeWorker(suited: boolean, skin: string): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: suited ? suitCharcoal : cottonWhite, roughness: 0.72 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.75 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(34, 58, 18), bodyMat);
  torso.position.y = 104;
  const head = new THREE.Mesh(new THREE.SphereGeometry(12, 10, 8), skinMat);
  head.position.y = 148;
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4, 48, 8), suited ? bodyMat : skinMat);
  armL.position.set(-24, 108, 6);
  armL.rotation.z = 0.35;
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4, 48, 8), suited ? bodyMat : skinMat);
  armR.position.set(24, 108, 6);
  armR.rotation.z = -0.35;
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 64, 8), suited ? bodyMat : skinMat);
  legL.position.set(-10, 44, 12);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 64, 8), suited ? bodyMat : skinMat);
  legR.position.set(10, 44, 12);
  g.add(torso, head, armL, armR, legL, legR);
  return g;
}

/**
 * Procedural 3D cinematic stage for FKA twigs — "Drums of Death (choreography glitch)"
 * Recreates the stark teal-lit fluorescent open-plan corporate office: infinite ceiling light-panel
 * grid, filing cabinets and archive boxes, synchronized rows of convulsing office chairs & suited
 * dancers, the white-cotton liberation ensemble, overhead retro keyboard & desk interlude, and
 * rhythmic fluorescent blackout strobe choreography.
 */
export class DrumsOfDeathStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly hallGroup = new THREE.Group();
  readonly deskGroup = new THREE.Group();
  readonly suitedDancers: THREE.Group[] = [];
  readonly shedDancers: THREE.Group[] = [];
  readonly lightPanels: THREE.Mesh[] = [];
  readonly halo: THREE.Group = new THREE.Group();

  readonly lead: VideoFigure;
  readonly glitch: VideoFigure;
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private haloTex: THREE.CanvasTexture | null = null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly glitchModel: VoiceModel,
    readonly glitchTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#203038');

    const amb = new THREE.AmbientLight('#c2d6dc', 0.9);
    this.keyLight = new THREE.DirectionalLight('#e8f6fa', 1.45);
    this.keyLight.position.set(140, 420, 260);
    this.fillLight = new THREE.PointLight('#6898a6', 1.4, 2200);
    this.fillLight.position.set(-220, 220, 180);
    this.rimLight = new THREE.PointLight('#d6eef4', 1.35, 2200);
    this.rimLight.position.set(220, 250, -210);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    // 1. Open-plan fluorescent corporate office hall
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 2200),
      new THREE.MeshStandardMaterial({ color: carpetBlue, roughness: 0.92 }),
    );
    floor.rotation.x = -Math.PI / 2;
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 2200),
      new THREE.MeshStandardMaterial({ color: '#9aaab0', roughness: 0.85 }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 330;
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 380),
      new THREE.MeshStandardMaterial({ color: '#bcc8cc', roughness: 0.86 }),
    );
    backWall.position.set(0, 180, -480);

    // Rows of glowing fluorescent ceiling light panels
    const panelMat = new THREE.MeshBasicMaterial({ color: '#f2fcff' });
    for (let row = 0; row < 5; row++) {
      for (const lx of [-240, -80, 80, 240]) {
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(58, 95), panelMat.clone());
        panel.rotation.x = Math.PI / 2;
        panel.position.set(lx, 328, -380 + row * 125);
        this.hallGroup.add(panel);
        this.lightPanels.push(panel);
      }
    }

    // Steel filing cabinets & stacked archive boxes lining left/right
    const cabMat = new THREE.MeshStandardMaterial({ color: cabinetGrey, roughness: 0.65 });
    const boxMat = new THREE.MeshStandardMaterial({ color: '#9c8c78', roughness: 0.88 });
    for (let i = 0; i < 4; i++) {
      for (const side of [-1, 1]) {
        const cab = new THREE.Mesh(new THREE.BoxGeometry(58, 138, 62), cabMat);
        cab.position.set(side * 320, 69, -320 + i * 95);
        this.hallGroup.add(cab);
        if (i % 2 === 0) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(44, 30, 42), boxMat);
          box.position.set(side * 320, 153, -320 + i * 95);
          this.hallGroup.add(box);
        }
      }
    }

    // Center hero office chair + flank chair ensemble
    const heroChair = makeOfficeChair();
    heroChair.position.set(0, 0, -24);
    this.hallGroup.add(heroChair);

    const skins = ['#c8987c', '#744834', '#dcb498', '#4c3024', '#b48266', '#d8ae90'];
    const spots: [number, number][] = [
      [-145, -75], [145, -75],
      [-215, -145], [-75, -145], [75, -145], [215, -145],
    ];
    for (let i = 0; i < spots.length; i++) {
      const [sx, sz] = spots[i];
      const ch = makeOfficeChair();
      ch.position.set(sx, 0, sz);
      this.hallGroup.add(ch);
      const suited = makeOfficeWorker(true, skins[i % skins.length]);
      suited.position.set(sx, 0, sz);
      this.hallGroup.add(suited);
      this.suitedDancers.push(suited);

      const shed = makeOfficeWorker(false, skins[i % skins.length]);
      shed.position.set(sx, 0, sz);
      shed.visible = false;
      this.hallGroup.add(shed);
      this.shedDancers.push(shed);
    }

    this.hallGroup.add(floor, ceiling, backWall);
    this.scene.add(this.hallGroup);

    // 2. Retro Corporate Desk & Mechanical Keyboard Interlude
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(360, 14, 210),
      new THREE.MeshStandardMaterial({ color: '#4c5e66', roughness: 0.62 }),
    );
    deskTop.position.set(0, 74, -40);
    const kbBody = new THREE.Mesh(
      new THREE.BoxGeometry(118, 9, 44),
      new THREE.MeshStandardMaterial({ color: '#d4d8d4', roughness: 0.5 }),
    );
    kbBody.position.set(-18, 84, -22);
    kbBody.rotation.y = 0.28;
    // Key rows
    const keyMat = new THREE.MeshStandardMaterial({ color: '#8e9698', roughness: 0.6 });
    for (let r = 0; r < 3; r++) {
      const row = new THREE.Mesh(new THREE.BoxGeometry(96, 4, 8), keyMat);
      row.position.set(-18, 89, -32 + r * 10);
      row.rotation.y = 0.28;
      this.deskGroup.add(row);
    }
    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(18, 8, 28),
      new THREE.MeshStandardMaterial({ color: '#dce0dc', roughness: 0.45 }),
    );
    mouse.position.set(62, 83, -36);
    const binder = new THREE.Mesh(
      new THREE.BoxGeometry(72, 10, 96),
      new THREE.MeshStandardMaterial({ color: '#9aa4a8', roughness: 0.7 }),
    );
    binder.position.set(108, 84, -46);
    this.deskGroup.add(deskTop, kbBody, mouse, binder);
    this.scene.add(this.deskGroup);

    // Two physical female voices: Lead Ethereal Vocal & Fierce Glitch/Chant Voice
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      suitCharcoal,
      skinLead,
    );
    this.lead.head.scene.scale.setScalar(2.14);

    this.glitch = new VideoFigure(
      glitchModel,
      glitchTrack,
      this.props,
      this.scene,
      suitCharcoal,
      skinGlitch,
    );
    this.glitch.head.scene.scale.setScalar(2.06);

    this.styleHair(this.lead, '#181414');
    this.styleHair(this.glitch, '#141212');

    // Soft dark studio halo behind the wireframe face for crisp contrast against bright fluorescent office
    if (typeof document !== 'undefined') {
      const hc = document.createElement('canvas');
      hc.width = hc.height = 192;
      const hctx = hc.getContext('2d')!;
      const grad = hctx.createRadialGradient(96, 96, 10, 96, 96, 96);
      grad.addColorStop(0, 'rgba(8, 16, 22, 0.72)');
      grad.addColorStop(0.5, 'rgba(8, 16, 22, 0.38)');
      grad.addColorStop(1, 'rgba(8, 16, 22, 0)');
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
    this.glitch.head.resize(this.width, this.height);
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

    // Relentless 136 BPM glitch-techno pulse
    const beat = t * (136 / 60) * Math.PI * 2;
    const twitch = Math.sin(beat * 2) * (intensity > 0.7 ? 1 : 0.35);
    const sway = Math.sin(beat * 0.5);
    const pulse = Math.abs(Math.sin(beat));

    const isDesk = view === 'dd-desk';
    const isShed = view === 'dd-shed' || (t >= 67 && t < 103.5) || t >= 143;
    const isStrobe = view === 'dd-strobe';
    const isEndingBlack = t >= 191.5;

    this.hallGroup.visible = !isEndingBlack;
    this.deskGroup.visible = isDesk && !isEndingBlack;

    // Switch ensemble & lead costume between corporate charcoal suit and white cotton liberation tank
    const coat = isShed ? cottonWhite : suitCharcoal;
    (this.lead.torso.material as THREE.MeshBasicMaterial).color.set(coat);
    this.lead.arms.forEach(m => (m.material as THREE.MeshBasicMaterial).color.set(isShed ? skinLead : coat));
    (this.glitch.torso.material as THREE.MeshBasicMaterial).color.set(coat);
    this.glitch.arms.forEach(m => (m.material as THREE.MeshBasicMaterial).color.set(isShed ? skinGlitch : coat));

    for (let i = 0; i < this.suitedDancers.length; i++) {
      this.suitedDancers[i].visible = !isShed && !isDesk && !isEndingBlack;
      this.shedDancers[i].visible = isShed && !isDesk && !isEndingBlack;
      const active = isShed ? this.shedDancers[i] : this.suitedDancers[i];
      const phase = beat + i * 0.65;
      active.rotation.z = Math.sin(phase) * (isStrobe ? 0.35 : 0.22);
      active.rotation.x = Math.cos(phase * 0.5) * 0.24;
      active.position.y = Math.abs(Math.sin(phase)) * 6;
    }

    // Rhythmic fluorescent flicker on strobe sections
    const strobeOn = !isStrobe || Math.sin(beat * 2) > -0.25;
    for (let i = 0; i < this.lightPanels.length; i++) {
      const m = this.lightPanels[i].material as THREE.MeshBasicMaterial;
      m.color.set(strobeOn ? '#f2fcff' : '#24343c');
    }

    if (isEndingBlack) {
      this.scene.background = new THREE.Color('#040608');
      this.keyLight.intensity = 0.25;
      this.fillLight.intensity = 0.2;
    } else if (isStrobe && !strobeOn) {
      this.scene.background = new THREE.Color('#0c1418');
      this.keyLight.intensity = 0.55;
      this.fillLight.color.set('#38525c');
      this.fillLight.intensity = 0.8;
    } else {
      this.scene.background = new THREE.Color(isDesk ? '#283840' : officeTeal);
      this.keyLight.intensity = 1.45;
      this.fillLight.color.set('#7aa8b6');
      this.fillLight.intensity = 1.4;
    }

    // Position lead & glitch voices (VideoFigure head sits at root.y = 148..152!)
    this.lead.root.visible = !isEndingBlack;
    const seated = view === 'dd-chairs';
    const leadSpot: P = isDesk
      ? [-18, 150, -34]
      : [sway * 12 + twitch * 4, (seated ? 138 : 150) + pulse * 4, -18];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.set(0, sway * 0.14, twitch * 0.08);
    this.halo.visible = !isEndingBlack && strobeOn;
    this.halo.position.set(leadSpot[0], leadSpot[1] + 6, leadSpot[2] - 28);

    this.glitch.root.visible = !isEndingBlack && !isDesk;
    this.glitch.root.position.set(82 - sway * 10, 148 + pulse * 3, -52);
    this.glitch.root.rotation.set(0, -0.24 - sway * 0.12, -twitch * 0.1);

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-29, -36 + Math.sin(phase) * 6, 14],
      [-35, -46 + lift * 0.45 + Math.cos(phase) * 8, 24],
      [29, -36 - Math.sin(phase) * 6, 14],
      [35, -46 + lift * 0.45 - Math.cos(phase) * 8, 24],
    ];
    this.lead.pose(t, arms(beat, speaker === 'dd-lead' || !speaker ? 26 + pulse * 12 : 12), seated);
    this.glitch.pose(t, arms(beat + 0.7, speaker === 'dd-glitch' ? 28 + pulse * 10 : 10), seated);

    // Deterministic hero cameras centered cleanly on the Chimera head
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.35) * 42, 158, 185];
    let target: [number, number, number] = [leadSpot[0], leadSpot[1] + 2, leadSpot[2]];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'dd-office':
      case 'wide':
        pos = [Math.sin(t * 0.3) * 46, 160, 198];
        target = [6, 150, -32];
        fov = portrait ? 52 : 38;
        break;
      case 'dd-chairs':
        pos = [Math.sin(t * 0.38) * 42, 148, 182];
        target = [0, 140, -28];
        fov = portrait ? 52 : 38;
        break;
      case 'dd-shed':
        pos = [Math.sin(t * 0.34) * 44, 158, 188];
        target = [0, 150, -28];
        fov = portrait ? 52 : 38;
        break;
      case 'dd-desk':
        pos = [-12 + Math.sin(t * 0.25) * 24, 186, 138];
        target = [-14, 144, -34];
        fov = portrait ? 50 : 36;
        break;
      case 'dd-strobe':
        pos = [Math.sin(t * 0.48) * 38, 158, 168];
        target = [leadSpot[0], 150, -22];
        fov = portrait ? 50 : 36;
        break;
      case 'dd-glitch':
        pos = [this.glitch.root.position.x + Math.sin(t * 0.4) * 10, 156, 78];
        target = [this.glitch.root.position.x, 150, this.glitch.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'dd-lead':
      default:
        pos = [leadSpot[0] + Math.sin(t * 0.42) * 12, leadSpot[1] + 4, 100];
        target = [leadSpot[0], leadSpot[1] + 2, leadSpot[2]];
        fov = portrait ? 38 : 27;
        break;
    }

    if (intensity > 0.85) {
      pos[0] += twitch * 2.2;
      pos[1] += Math.sin(beat) * 1.6;
    }

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.lead.root.visible) this.lead.update(t, playing, this.camera, dt, reset);
    if (this.glitch.root.visible) this.glitch.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.glitch.dispose();
    this.haloTex?.dispose();
    (this.halo.children[0] as THREE.Sprite | undefined)?.material.dispose();
    this.props.dispose();
  }
}
