import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type BackstabberId = 'kb-lead' | 'kb-gang';

const goldCar = '#b88c38';
const skinKesha = '#dfbaa0';
const skinRival = '#d6b096';
const glamBlack = '#18181e';
const neonCyan = '#2ee6ff';
const flareRed = '#ff3a28';
const cobaltBlue = '#2068ff';

function makeMarqueeTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#fff5d8';
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = '#ff3878';
  ctx.lineWidth = 12;
  ctx.strokeRect(8, 8, 496, 176);
  // Bulb dots along marquee border
  ctx.fillStyle = '#ffe878';
  for (let x = 22; x <= 490; x += 26) {
    ctx.beginPath(); ctx.arc(x, 18, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, 174, 4.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#181422';
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('MIDNIGHT', 256, 86);
  ctx.fillStyle = '#d41c48';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('SHOWTIME · LIVE', 256, 138);
  return new THREE.CanvasTexture(c);
}

function makeEagleHoodTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = goldCar;
  ctx.fillRect(0, 0, 256, 256);
  // Stylized black-and-bronze Firebird wing decal
  ctx.fillStyle = '#221c12';
  ctx.beginPath();
  ctx.moveTo(128, 34);
  ctx.lineTo(234, 108);
  ctx.lineTo(192, 196);
  ctx.lineTo(128, 152);
  ctx.lineTo(64, 196);
  ctx.lineTo(22, 108);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f2cc6c';
  ctx.lineWidth = 5;
  ctx.stroke();
  return new THREE.CanvasTexture(c);
}

function makeGlamDancer(topColor: string, pantsColor: string): THREE.Group {
  const g = new THREE.Group();
  const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.6 });
  const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.65 });
  const skinMat = new THREE.MeshStandardMaterial({ color: '#d8b498', roughness: 0.72 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(32, 56, 18), topMat);
  torso.position.y = 108;
  const head = new THREE.Mesh(new THREE.SphereGeometry(12, 10, 8), skinMat);
  head.position.y = 150;
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 76, 8), legMat);
  legL.position.set(-10, 38, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 76, 8), legMat);
  legR.position.set(10, 38, 0);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.8, 50, 8), skinMat);
  armL.position.set(-22, 114, 0);
  armL.rotation.z = 0.45;
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.8, 50, 8), skinMat);
  armR.position.set(22, 114, 0);
  armR.rotation.z = -0.45;
  g.add(torso, head, legL, legR, armL, armR);
  return g;
}

/**
 * Procedural 3D cinematic stage for Kesha — "Backstabber"
 * Recreates the gritty 2010 LA night-street aesthetic: metallic gold Firebird Trans Am with
 * black eagle hood decal, glowing neon theatre marquee sidewalk with glam dancers, cobalt-blue
 * corrugated-shutter alley confrontation, blazing red/cyan anamorphic headlight flares through
 * street fog, and neon-smoke punk finale.
 */
export class BackstabberStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly transamGroup = new THREE.Group();
  readonly marqueeGroup = new THREE.Group();
  readonly alleyGroup = new THREE.Group();
  readonly flaresGroup = new THREE.Group();

  readonly lead: VideoFigure;
  readonly gang: VideoFigure;
  readonly squad: THREE.Group[] = [];
  readonly flareBeams: THREE.Mesh[] = [];
  readonly smokeOrbs: THREE.Mesh[] = [];
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly marqueeTex: THREE.CanvasTexture | null;
  private readonly hoodTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly gangModel: VoiceModel,
    readonly gangTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#0c0e14');

    const amb = new THREE.AmbientLight('#d4dce8', 0.85);
    this.keyLight = new THREE.DirectionalLight('#fff2da', 1.45);
    this.keyLight.position.set(160, 420, 300);
    this.fillLight = new THREE.PointLight(cobaltBlue, 1.8, 2200);
    this.fillLight.position.set(-220, 210, 170);
    this.rimLight = new THREE.PointLight(flareRed, 1.8, 2200);
    this.rimLight.position.set(220, 240, -210);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    this.marqueeTex = makeMarqueeTexture();
    this.hoodTex = makeEagleHoodTexture();

    // Shared dark asphalt street plane
    const street = new THREE.Mesh(
      new THREE.PlaneGeometry(2600, 2000),
      new THREE.MeshStandardMaterial({ color: '#1b1d22', roughness: 0.55 }),
    );
    street.rotation.x = -Math.PI / 2;
    this.scene.add(street);

    // 1. Gold Firebird Trans Am Night Street
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(330, 62, 148),
      new THREE.MeshStandardMaterial({ color: goldCar, metalness: 0.72, roughness: 0.24 }),
    );
    carBody.position.set(0, 46, -155);
    const carCabin = new THREE.Mesh(
      new THREE.BoxGeometry(148, 44, 126),
      new THREE.MeshStandardMaterial({ color: '#22242a', metalness: 0.5, roughness: 0.25 }),
    );
    carCabin.position.set(-28, 96, -155);
    const hoodDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 125),
      this.hoodTex
        ? new THREE.MeshBasicMaterial({ map: this.hoodTex })
        : new THREE.MeshBasicMaterial({ color: '#2a2216' }),
    );
    hoodDecal.rotation.x = -Math.PI / 2;
    hoodDecal.position.set(78, 78, -155);
    // Glowing headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: '#fff8cc' });
    for (const hz of [-195, -115]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(12, 10, 8), hlMat);
      hl.position.set(166, 48, hz);
      this.transamGroup.add(hl);
    }
    this.transamGroup.add(carBody, carCabin, hoodDecal);
    this.scene.add(this.transamGroup);

    // 2. Neon Theatre Marquee Boulevard
    const facade = new THREE.Mesh(
      new THREE.BoxGeometry(920, 420, 160),
      new THREE.MeshStandardMaterial({ color: '#24222c', roughness: 0.78 }),
    );
    facade.position.set(0, 210, -340);
    const marquee = new THREE.Mesh(
      new THREE.BoxGeometry(460, 140, 44),
      this.marqueeTex
        ? new THREE.MeshBasicMaterial({ map: this.marqueeTex })
        : new THREE.MeshBasicMaterial({ color: '#ffe8a8' }),
    );
    marquee.position.set(0, 255, -245);
    const palette: [string, string][] = [
      ['#eae8e4', '#e85234'],
      ['#24242c', '#d4b448'],
      ['#5890c8', '#e8e8ee'],
      ['#d82874', '#181820'],
    ];
    for (let i = 0; i < palette.length; i++) {
      const d = makeGlamDancer(palette[i][0], palette[i][1]);
      d.position.set(-185 + i * 124, 0, -135 + (i % 2) * 28);
      this.marqueeGroup.add(d);
      this.squad.push(d);
    }
    this.marqueeGroup.add(facade, marquee);
    this.scene.add(this.marqueeGroup);

    // 3. Cobalt-Blue Corrugated Shutter Alley
    const shutterMat = new THREE.MeshStandardMaterial({ color: '#3c4c62', metalness: 0.55, roughness: 0.45 });
    const backShutter = new THREE.Mesh(new THREE.PlaneGeometry(1400, 480), shutterMat);
    backShutter.position.set(0, 240, -240);
    const barMat = new THREE.MeshBasicMaterial({ color: neonCyan });
    for (let i = -5; i <= 5; i++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(1200, 4, 6), shutterMat);
      rib.position.set(0, 40 + (i + 5) * 32, -236);
      this.alleyGroup.add(rib);
    }
    for (const bx of [-180, 180]) {
      const neonBar = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 360, 8), barMat);
      neonBar.position.set(bx, 180, -210);
      this.alleyGroup.add(neonBar);
    }
    this.alleyGroup.add(backShutter);
    this.scene.add(this.alleyGroup);

    // 4. Blazing Red & Cyan Anamorphic Headlight Fog Street
    const bldgMat = new THREE.MeshStandardMaterial({ color: '#181c28', roughness: 0.8 });
    for (const sx of [-360, 360]) {
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(180, 460, 960), bldgMat);
      bldg.position.set(sx, 230, -240);
      this.flaresGroup.add(bldg);
    }
    const flareMatR = new THREE.MeshBasicMaterial({ color: flareRed, transparent: true, opacity: 0.78 });
    const flareMatC = new THREE.MeshBasicMaterial({ color: neonCyan, transparent: true, opacity: 0.72 });
    for (const [fx, mat] of [[-125, flareMatR], [125, flareMatR], [-195, flareMatC], [195, flareMatC]] as const) {
      const vBeam = new THREE.Mesh(new THREE.PlaneGeometry(24, 520), mat);
      vBeam.position.set(fx, 160, -240);
      const hBeam = new THREE.Mesh(new THREE.PlaneGeometry(520, 18), mat);
      hBeam.position.set(fx, 88, -238);
      this.flaresGroup.add(vBeam, hBeam);
      this.flareBeams.push(vBeam, hBeam);
    }
    const smokeMat = new THREE.MeshBasicMaterial({ color: '#c8d6f4', transparent: true, opacity: 0.16, depthWrite: false });
    for (let i = 0; i < 10; i++) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(52 + (i % 3) * 24, 12, 10), smokeMat);
      orb.position.set(-220 + i * 48, 70 + (i % 3) * 38, -165 - (i % 2) * 55);
      this.flaresGroup.add(orb);
      this.smokeOrbs.push(orb);
    }
    this.scene.add(this.flaresGroup);

    // Two physical female voices: Lead Vocal & Gang Chants / Rival
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      glamBlack,
      skinKesha,
    );
    this.lead.head.scene.scale.setScalar(2.14);

    this.gang = new VideoFigure(
      gangModel,
      gangTrack,
      this.props,
      this.scene,
      '#d83268',
      skinRival,
    );
    this.gang.head.scene.scale.setScalar(2.06);

    this.styleHair(this.lead, '#e6cf94');
    this.styleHair(this.gang, '#f2e0b4');

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
    this.gang.head.resize(this.width, this.height);
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

    // Punchy 128 BPM electro-pop dance beat
    const beat = t * (128 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.5);
    const bounce = Math.abs(Math.sin(beat));

    const isTransam = view === 'kb-transam';
    const isMarquee = view === 'kb-marquee' || view === 'wide';
    const isAlley = view === 'kb-alley' || view === 'kb-gang';
    const isFlares = view === 'kb-flares' || view === 'kb-finale' || view === 'kb-lead';

    this.transamGroup.visible = isTransam;
    this.marqueeGroup.visible = isMarquee;
    this.alleyGroup.visible = isAlley;
    this.flaresGroup.visible = isFlares;

    // Animate street dancers, anamorphic headlight flares & drifting fog
    for (let i = 0; i < this.squad.length; i++) {
      this.squad[i].position.y = Math.abs(Math.sin(beat + i * 0.7)) * 10;
      this.squad[i].rotation.y = Math.sin(beat * 0.5 + i) * 0.28;
    }
    for (let i = 0; i < this.flareBeams.length; i++) {
      this.flareBeams[i].scale.setScalar(0.88 + Math.sin(beat * 0.5 + i) * 0.22);
    }
    for (let i = 0; i < this.smokeOrbs.length; i++) {
      this.smokeOrbs[i].position.y = 74 + Math.sin(t * 0.9 + i) * 18;
    }

    // Lighting per night set
    if (isAlley) {
      this.scene.background = new THREE.Color('#09142c');
      this.keyLight.color.set('#b8d8ff');
      this.fillLight.color.set(cobaltBlue);
      this.rimLight.color.set(neonCyan);
    } else if (view === 'kb-finale') {
      this.scene.background = new THREE.Color('#0b1634');
      this.keyLight.color.set('#d8f4ff');
      this.fillLight.color.set(neonCyan);
      this.rimLight.color.set('#ff3c9c');
    } else if (isFlares) {
      this.scene.background = new THREE.Color('#140c18');
      this.keyLight.color.set('#fff0dc');
      this.fillLight.color.set(flareRed);
      this.rimLight.color.set(neonCyan);
    } else if (isTransam) {
      this.scene.background = new THREE.Color('#121014');
      this.keyLight.color.set('#ffe2a8');
      this.fillLight.color.set(goldCar);
      this.rimLight.color.set('#4c88cc');
    } else {
      this.scene.background = new THREE.Color('#14101a');
      this.keyLight.color.set('#fff2d4');
      this.fillLight.color.set('#ff427c');
      this.rimLight.color.set('#ffe27a');
    }

    // Position lead & gang voices (VideoFigure head sits at root.y = 150!)
    const leadSpot: P = isAlley
      ? [-16 + sway * 6, 150 + bounce * 3, -18]
      : [sway * 14, 150 + bounce * 4, -14];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.y = isAlley ? 0.25 : sway * 0.16;

    this.gang.root.visible = !isTransam;
    if (isAlley) {
      this.gang.root.position.set(48, 148 + bounce * 3, -26);
      this.gang.root.rotation.y = -0.35;
    } else {
      this.gang.root.position.set(84 - sway * 10, 148 + bounce * 4, -48);
      this.gang.root.rotation.y = -0.22;
    }

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -2 + Math.sin(phase) * 16, 22],
      [-54, 20 + lift + Math.sin(phase) * 22, 28],
      [34, -2 - Math.sin(phase) * 16, 22],
      [54, 20 + lift - Math.sin(phase) * 22, 28],
    ];
    this.lead.pose(t, arms(beat, speaker === 'kb-lead' || !speaker ? 24 + bounce * 10 : 10));
    this.gang.pose(t, arms(beat + 0.6, speaker === 'kb-gang' ? 24 + bounce * 8 : 8));

    // Deterministic hero cameras centered cleanly on the Chimera head
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.35) * 44, 158, 188];
    let target: [number, number, number] = [leadSpot[0], 150, leadSpot[2]];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'kb-transam':
        pos = [Math.sin(t * 0.28) * 48, 156, 195];
        target = [0, 146, -42];
        fov = portrait ? 52 : 38;
        break;
      case 'kb-marquee':
      case 'wide':
        pos = [Math.sin(t * 0.32) * 46, 160, 198];
        target = [8, 150, -32];
        fov = portrait ? 52 : 38;
        break;
      case 'kb-alley':
        pos = [Math.sin(t * 0.3) * 26, 158, portrait ? 215 : 168];
        target = [4, 150, -22];
        fov = portrait ? 52 : 38;
        break;
      case 'kb-flares':
      case 'kb-finale':
        pos = [Math.sin(t * 0.36) * 42, 158, 184];
        target = [6, 150, -28];
        fov = portrait ? 52 : 38;
        break;
      case 'kb-gang':
        pos = [this.gang.root.position.x + Math.sin(t * 0.38) * 10, 156, 86];
        target = [this.gang.root.position.x, 150, this.gang.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'kb-lead':
      default:
        pos = [leadSpot[0] + Math.sin(t * 0.42) * 12, 156, 100];
        target = [leadSpot[0], 152, leadSpot[2]];
        fov = portrait ? 38 : 27;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(beat) * 1.5;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    if (this.gang.root.visible) this.gang.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.gang.dispose();
    this.marqueeTex?.dispose();
    this.hoodTex?.dispose();
    this.props.dispose();
  }
}
