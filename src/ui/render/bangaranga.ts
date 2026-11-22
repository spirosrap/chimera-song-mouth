import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type BangarangaId = 'bg-lead' | 'bg-chant';

const skinLead = '#f2c6b6';
const skinChant = '#e4b8a4';
const halterPink = '#f888b8';
const furCream = '#fff4f8';
const detaineeBrown = '#6c4828';
const chairRed = '#e4283c';

function makeClockTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#f8f6f0';
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d4ccb8';
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.fillStyle = '#18181c';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = 128 + Math.sin(a) * 92;
    const y = 128 - Math.cos(a) * 92;
    ctx.beginPath();
    ctx.arc(x, y, i % 3 === 0 ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D cinematic stage for DARA — "Bangaranga (LIVE Eurovision 2026)"
 * Recreates all 5 staging chapters from the Grand Final live performance:
 * 1. Eurovision Arena Laser Intro — sweeping green, white, and red stadium laser beams (bg-arena)
 * 2. Inverted Wood-Paneled Waiting Room — upside-down camera roll ("Come alive / Surrender to the blinding lights") (bg-inverted)
 * 3. Retro Wood-Paneled Waiting Room — teal carpet floor, wood-slat walls, glowing amber spherical sconces, analog wall clock, frosted window & 5 red chairs (bg-room)
 * 4. Red-Chair Riot & Blue Smoke — dancers hoist the red chairs overhead in billowing cyan smoke (bg-chairs)
 * 5. Eurovision Main Arena Stage & Purple Laser Riot — violet laser cones, giant floating purple smoke cloud overhead & strobe beams (bg-stage)
 */
export class BangarangaStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly arenaGroup = new THREE.Group();
  readonly roomGroup = new THREE.Group();
  readonly chairsRiotGroup = new THREE.Group();
  readonly stageGroup = new THREE.Group();
  readonly halo: THREE.Group = new THREE.Group();

  readonly lead: VideoFigure;
  readonly chant: VideoFigure;
  readonly roomChairs: THREE.Group[] = [];
  readonly riotChairs: THREE.Group[] = [];
  readonly laserBeams: THREE.Mesh[] = [];
  readonly stageLasers: THREE.Mesh[] = [];
  readonly purpleCloud: THREE.Group = new THREE.Group();
  readonly clockHandMin: THREE.Mesh;
  readonly clockHandHr: THREE.Mesh;

  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly clockTex: THREE.CanvasTexture | null;
  private haloTex: THREE.CanvasTexture | null = null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly chantModel: VoiceModel,
    readonly chantTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#090512');

    const amb = new THREE.AmbientLight('#f2e8ff', 0.88);
    this.keyLight = new THREE.DirectionalLight('#fff6f0', 1.48);
    this.keyLight.position.set(160, 420, 310);
    this.fillLight = new THREE.PointLight('#ff88c8', 1.45, 2400);
    this.fillLight.position.set(-210, 210, 190);
    this.rimLight = new THREE.PointLight('#58c8ff', 1.4, 2400);
    this.rimLight.position.set(220, 240, -210);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    this.clockTex = makeClockTexture();

    // 1. Eurovision Arena Laser Intro (bg-arena)
    const arenaFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#080c18', roughness: 0.45, metalness: 0.35 }),
    );
    arenaFloor.rotation.x = -Math.PI / 2;
    this.arenaGroup.add(arenaFloor);

    const laserColors = ['#22c55e', '#ffffff', '#ef4444'];
    for (let i = -6; i <= 6; i++) {
      const col = laserColors[(i + 6) % 3]!;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 16, 620, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.set(i * 58, 220, -220);
      this.laserBeams.push(beam);
      this.arenaGroup.add(beam);
    }
    this.scene.add(this.arenaGroup);

    // 2 & 3. Retro Wood-Paneled Waiting Room (bg-inverted & bg-room)
    const tealCarpet = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#1e6478', roughness: 0.85 }),
    );
    tealCarpet.rotation.x = -Math.PI / 2;

    const woodWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1500, 520),
      new THREE.MeshStandardMaterial({ color: '#8c4e24', roughness: 0.72 }),
    );
    woodWall.position.set(0, 260, -250);

    // Wood vertical slats
    const slatMat = new THREE.MeshStandardMaterial({ color: '#5c3014', roughness: 0.78 });
    for (let x = -480; x <= 480; x += 48) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(6, 520, 8), slatMat);
      slat.position.set(x, 260, -246);
      this.roomGroup.add(slat);
    }

    // White analog wall clock on upper-left wood wall
    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(36, 28),
      this.clockTex
        ? new THREE.MeshBasicMaterial({ map: this.clockTex })
        : new THREE.MeshBasicMaterial({ color: '#f8f6f0' }),
    );
    clockFace.position.set(-185, 245, -240);
    const handMat = new THREE.MeshBasicMaterial({ color: '#181820' });
    this.clockHandMin = new THREE.Mesh(new THREE.BoxGeometry(3, 26, 2), handMat);
    this.clockHandMin.position.set(-185, 245, -238);
    this.clockHandHr = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 2), handMat);
    this.clockHandHr.position.set(-185, 245, -238);

    // Glowing amber spherical wall sconces
    const sconceMat = new THREE.MeshBasicMaterial({ color: '#ffe484' });
    for (const sx of [-115, 0, 115]) {
      const sconce = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 12), sconceMat);
      sconce.position.set(sx, 238, -236);
      this.roomGroup.add(sconce);
    }

    // Frosted white window on the right
    const frostedWin = new THREE.Mesh(
      new THREE.PlaneGeometry(118, 165),
      new THREE.MeshBasicMaterial({ color: '#e6f4ff' }),
    );
    frostedWin.position.set(220, 195, -241);

    // Row of 5 red waiting-room chairs
    for (let i = -2; i <= 2; i++) {
      const ch = this.makeRedChair();
      ch.position.set(i * 78, 0, -95);
      this.roomChairs.push(ch);
      this.roomGroup.add(ch);
    }

    this.roomGroup.add(tealCarpet, woodWall, clockFace, this.clockHandMin, this.clockHandHr, frostedWin);
    this.scene.add(this.roomGroup);

    // 4. Red-Chair Riot & Blue Smoke (bg-chairs)
    const riotFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1600),
      new THREE.MeshStandardMaterial({ color: '#0c243c', roughness: 0.6 }),
    );
    riotFloor.rotation.x = -Math.PI / 2;
    this.chairsRiotGroup.add(riotFloor);

    // Split wood walls opening into cyan smoke
    const leftSplitWall = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 500),
      new THREE.MeshStandardMaterial({ color: '#703c1c', roughness: 0.75 }),
    );
    leftSplitWall.position.set(-340, 250, -260);
    const rightSplitWall = leftSplitWall.clone();
    rightSplitWall.position.set(340, 250, -260);
    this.chairsRiotGroup.add(leftSplitWall, rightSplitWall);

    // Hoisted red chairs spinning in the air + cyan smoke rings
    for (let i = -2; i <= 2; i++) {
      const ch = this.makeRedChair();
      ch.position.set(i * 82, 185, -110);
      this.riotChairs.push(ch);
      this.chairsRiotGroup.add(ch);
    }
    const cyanRingMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.42,
    });
    for (let i = 0; i < 5; i++) {
      const smokeRing = new THREE.Mesh(new THREE.TorusGeometry(95 + i * 38, 12, 12, 32), cyanRingMat);
      smokeRing.position.set(0, 120 + i * 24, -155);
      this.chairsRiotGroup.add(smokeRing);
    }
    this.scene.add(this.chairsRiotGroup);

    // 5. Eurovision Main Arena Stage & Purple Laser Riot (bg-stage)
    const mainStageFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2600, 1800),
      new THREE.MeshStandardMaterial({ color: '#120624', roughness: 0.35, metalness: 0.45 }),
    );
    mainStageFloor.rotation.x = -Math.PI / 2;
    this.stageGroup.add(mainStageFloor);

    // Illuminated neon magenta/cyan runway rings on the arena floor
    for (let i = 1; i <= 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(i * 68, i * 68 + 8, 40),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? '#e879f9' : '#38bdf8',
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 2, -40);
      this.stageGroup.add(ring);
    }

    // Giant floating purple/violet smoke cloud overhead (signature Eurovision 160-168s visual)
    const cloudMat = new THREE.MeshStandardMaterial({
      color: '#c084fc',
      emissive: '#7e22ce',
      emissiveIntensity: 0.55,
      roughness: 0.65,
    });
    for (let i = -4; i <= 4; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(42 + (i % 2) * 12, 18, 14), cloudMat);
      puff.position.set(i * 44, (i % 2) * 14, (i % 3) * -12);
      this.purpleCloud.add(puff);
    }
    this.purpleCloud.position.set(0, 255, -150);
    this.stageGroup.add(this.purpleCloud);

    // Cone of violet, magenta & white strobe laser beams
    const stageColors = ['#e879f9', '#818cf8', '#ffffff'];
    for (let i = -7; i <= 7; i++) {
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 18, 640, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: stageColors[(i + 7) % 3]!,
          transparent: true,
          opacity: 0.36,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.set(i * 54, 225, -210);
      this.stageLasers.push(beam);
      this.stageGroup.add(beam);
    }
    this.scene.add(this.stageGroup);

    // Two physical female voices: DARA Lead Vocal & Bangaranga Riot Chants
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      halterPink,
      skinLead,
    );
    this.lead.head.scene.scale.setScalar(2.14);

    this.chant = new VideoFigure(
      chantModel,
      chantTrack,
      this.props,
      this.scene,
      detaineeBrown,
      skinChant,
    );
    this.chant.head.scene.scale.setScalar(2.04);

    // Fluffy cream arm-warmer cuffs on lead singer
    const cuffGeo = new THREE.CylinderGeometry(11, 11, 18, 12);
    const cuffMat = new THREE.MeshStandardMaterial({ color: furCream, roughness: 0.85 });
    const leftCuff = new THREE.Mesh(cuffGeo, cuffMat);
    leftCuff.position.set(-36, -34, 18);
    const rightCuff = new THREE.Mesh(cuffGeo, cuffMat);
    rightCuff.position.set(36, -34, 18);
    this.lead.root.add(leftCuff, rightCuff);

    this.styleHair(this.lead, '#3b1c14');
    this.styleHair(this.chant, '#24140e');

    if (typeof document !== 'undefined') {
      const hc = document.createElement('canvas');
      hc.width = hc.height = 192;
      const hctx = hc.getContext('2d')!;
      const grad = hctx.createRadialGradient(96, 96, 10, 96, 96, 96);
      grad.addColorStop(0, 'rgba(10, 12, 20, 0.74)');
      grad.addColorStop(0.5, 'rgba(10, 12, 20, 0.40)');
      grad.addColorStop(1, 'rgba(10, 12, 20, 0)');
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 192, 192);
      this.haloTex = new THREE.CanvasTexture(hc);
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.haloTex, transparent: true, depthWrite: false }),
      );
      sp.scale.set(118, 118, 1);
      this.halo.add(sp);
    }
    this.scene.add(this.halo);

    this.resize(1280, 720);
  }

  private makeRedChair(): THREE.Group {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: chairRed, roughness: 0.4 });
    const legMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.7, roughness: 0.25 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(44, 6, 40), frameMat);
    seat.position.y = 38;
    const back = new THREE.Mesh(new THREE.BoxGeometry(42, 36, 6), frameMat);
    back.position.set(0, 64, -17);
    g.add(seat, back);
    for (const lx of [-18, 18]) {
      for (const lz of [-16, 16]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 38, 8), legMat);
        leg.position.set(lx, 19, lz);
        g.add(leg);
      }
    }
    return g;
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
      p.line(
        f.hair,
        [
          [a.x, a.y + 4 * k, z],
          [a.x + 7 * k, a.y + 10 * k, z],
          [b.x + 8 * k, b.y - 6 * k, z],
        ],
        color,
        4.0,
      );
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
    this.chant.head.resize(this.width, this.height);
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

    // Bangaranga electro-pop riot pulse (~134 BPM)
    const beat = t * (134 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.5);
    const bounce = Math.abs(Math.sin(beat));

    const isArena = view === 'bg-arena';
    const isInverted = view === 'bg-inverted';
    const isRoom = view === 'bg-room' || isInverted || view === 'wide';
    const isChairs = view === 'bg-chairs' || view === 'bg-chant';
    const isStage = view === 'bg-stage' || view === 'bg-lead';

    this.arenaGroup.visible = isArena;
    this.roomGroup.visible = isRoom;
    this.chairsRiotGroup.visible = isChairs;
    this.stageGroup.visible = isStage;

    // Animate clock hands, chairs, lasers & floating purple cloud
    this.clockHandMin.rotation.z = -t * 1.4;
    this.clockHandHr.rotation.z = -t * 0.22;

    for (let i = 0; i < this.laserBeams.length; i++) {
      this.laserBeams[i]!.rotation.z = Math.sin(t * 1.8 + i * 0.45) * 0.42;
    }
    for (let i = 0; i < this.stageLasers.length; i++) {
      this.stageLasers[i]!.rotation.z = Math.cos(t * 2.2 + i * 0.38) * 0.48;
    }
    for (let i = 0; i < this.riotChairs.length; i++) {
      const ch = this.riotChairs[i]!;
      ch.position.y = 175 + Math.sin(beat + i) * 18;
      ch.rotation.z = Math.sin(t * 2.5 + i) * 0.45;
      ch.rotation.x = Math.cos(t * 2.1 + i) * 0.35;
    }
    this.purpleCloud.position.y = 252 + Math.sin(t * 1.6) * 8;

    // Background color per chapter
    if (isArena) {
      this.scene.background = new THREE.Color('#060913');
    } else if (isRoom) {
      this.scene.background = new THREE.Color('#2c180c');
    } else if (isChairs) {
      this.scene.background = new THREE.Color('#071d34');
    } else {
      this.scene.background = new THREE.Color('#130526');
    }

    // Hero-framed lead & chant figures (head at root.y = 150)
    const leadSpot: P = [sway * 14, 150 + bounce * 4, -14];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.y = sway * 0.16;
    this.halo.visible = true;
    this.halo.position.set(leadSpot[0], leadSpot[1] + 6, leadSpot[2] - 28);

    this.chant.root.visible = !isArena || t > 8;
    this.chant.root.position.set(78 - sway * 10, 148 + bounce * 3, -46);
    this.chant.root.rotation.y = -0.24;

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -2 + Math.sin(phase) * 16, 22],
      [-54, 20 + lift + Math.sin(phase) * 22, 28],
      [34, -2 - Math.sin(phase) * 16, 22],
      [54, 20 + lift - Math.sin(phase) * 22, 28],
    ];
    this.lead.pose(t, arms(beat, speaker === 'bg-lead' || !speaker ? 26 + bounce * 10 : 12));
    this.chant.pose(t, arms(beat + 0.6, speaker === 'bg-chant' ? 28 + bounce * 10 : 10));

    // Deterministic hero cameras centered cleanly on the Chimera head
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.35) * 38, 158, 188];
    let target: [number, number, number] = [leadSpot[0], 150, leadSpot[2]];
    let fov = portrait ? 52 : 38;
    let roll = 0;

    switch (view) {
      case 'bg-arena':
        pos = [Math.sin(t * 0.3) * 40, 160, 198];
        target = [0, 150, -28];
        fov = portrait ? 54 : 40;
        break;
      case 'bg-inverted':
        pos = [Math.sin(t * 0.28) * 34, 156, 182];
        target = [0, 150, -22];
        fov = portrait ? 50 : 36;
        // Dramatic upside-down waiting-room roll that still keeps the head centered
        roll = Math.PI * 0.88;
        break;
      case 'bg-room':
      case 'wide':
        pos = [Math.sin(t * 0.32) * 38, 158, 188];
        target = [4, 150, -26];
        fov = portrait ? 52 : 38;
        break;
      case 'bg-chairs':
        pos = [Math.sin(t * 0.36) * 40, 158, 190];
        target = [6, 150, -26];
        fov = portrait ? 52 : 38;
        break;
      case 'bg-stage':
        pos = [Math.sin(t * 0.34) * 40, 158, 192];
        target = [0, 150, -24];
        fov = portrait ? 52 : 38;
        break;
      case 'bg-chant':
        pos = [this.chant.root.position.x + Math.sin(t * 0.38) * 10, 156, 86];
        target = [this.chant.root.position.x, 150, this.chant.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'bg-lead':
      default:
        pos = [leadSpot[0] + Math.sin(t * 0.42) * 12, 156, 100];
        target = [leadSpot[0], 152, leadSpot[2]];
        fov = portrait ? 38 : 27;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(beat) * 1.5;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    if (this.chant.root.visible) this.chant.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.chant.dispose();
    this.clockTex?.dispose();
    this.haloTex?.dispose();
    (this.halo.children[0] as THREE.Sprite | undefined)?.material.dispose();
    this.props.dispose();
  }
}
