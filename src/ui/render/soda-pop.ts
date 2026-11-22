import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type SodaId = 'soda-jinu' | 'soda-rap' | 'soda-chorus';

const skyDay = '#82c8f4';
const pastelPink = '#ff72c8';
const mintShirt = '#6be6a4';
const yellowShirt = '#f2da38';
const purpleVest = '#7a48d8';
const whiteShirt = '#f4f4f8';
const neonMagenta = '#ff2ea8';
const neonCyan = '#36ecff';
const skinBoy = '#e2b89c';
const hairBlack = '#1a181e';
const hairCyan = '#36c4d8';
const hairPink = '#d6588c';
const hairLavender = '#a8a2cc';
const hairCoral = '#d8665c';

function makePlazaBanner(text: string, bg: string, fg: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 160);
  ctx.fillStyle = fg;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 104);
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D Seoul street K-pop stage for Saja Boys — "Soda Pop" (KPop Demon Hunters).
 * Recreates the sunlit Seoul plaza with FIRST RUN glass storefronts and green trees,
 * billowing magenta smoke entrance, five candy-pastel boyband members (Jinu in white over pink,
 * Abby in mint floral, Baby in cyan hair & pink argyle, Romance in yellow & pink hair,
 * Mystery in purple vest & lavender bangs), elevated plaza pedestal, street food cart,
 * dreamy pastel soda-bubble bokeh backdrop, and neon magenta/cyan climax finale.
 */
export class SodaPopStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly plazaGroup = new THREE.Group();
  readonly smokeGroup = new THREE.Group();
  readonly pedestalGroup = new THREE.Group();
  readonly pastelHaloGroup = new THREE.Group();
  readonly bubbleGroup = new THREE.Group();

  readonly jinu: VideoFigure;
  readonly rapBoy: VideoFigure;
  readonly chorusBoy: VideoFigure;
  readonly extraBoys: THREE.Group[] = [];
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly signTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly jinuModel: VoiceModel,
    readonly jinuTrack: TeleTrack,
    readonly rapModel: VoiceModel,
    readonly rapTrack: TeleTrack,
    readonly chorusModel: VoiceModel,
    readonly chorusTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color(skyDay);

    const amb = new THREE.AmbientLight('#fff4f8', 0.98);
    const key = new THREE.DirectionalLight('#fff8ec', 1.4);
    key.position.set(160, 440, 360);
    this.fillLight = new THREE.PointLight(pastelPink, 1.9, 2400);
    this.fillLight.position.set(-220, 260, 240);
    this.rimLight = new THREE.PointLight(neonCyan, 1.9, 2400);
    this.rimLight.position.set(220, 280, -180);
    this.scene.add(amb, key, this.fillLight, this.rimLight);

    // 1. Sunlit Seoul Plaza with FIRST RUN Storefronts & Street Trees
    const pave = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1600),
      new THREE.MeshStandardMaterial({ color: '#c4b8ac', roughness: 0.75 }),
    );
    pave.rotation.x = -Math.PI / 2;
    this.plazaGroup.add(pave);

    const bldgMat = new THREE.MeshStandardMaterial({ color: '#465260', roughness: 0.55 });
    const glassMat = new THREE.MeshStandardMaterial({ color: '#78b0c8', metalness: 0.35, roughness: 0.25 });
    for (const bx of [-360, 0, 360]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(310, 420, 120), bldgMat);
      b.position.set(bx, 210, -390);
      const g = new THREE.Mesh(new THREE.PlaneGeometry(260, 220), glassMat);
      g.position.set(bx, 180, -328);
      this.plazaGroup.add(b, g);
    }

    this.signTex = makePlazaBanner('SODA POP · FIRST RUN', '#222b38', '#78f2ff');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 90),
      new THREE.MeshBasicMaterial({ map: this.signTex }),
    );
    sign.position.set(0, 345, -324);
    this.plazaGroup.add(sign);

    // Lush green Seoul street trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5a4230', roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#4ea844', roughness: 0.85 });
    for (const tx of [-440, 440]) {
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(14, 18, 170, 8), trunkMat);
      tr.position.set(tx, 85, -240);
      const lf = new THREE.Mesh(new THREE.SphereGeometry(85, 12, 10), leafMat);
      lf.position.set(tx, 210, -240);
      this.plazaGroup.add(tr, lf);
    }

    // Elevated circular plaza pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(205, 220, 46, 24),
      new THREE.MeshStandardMaterial({ color: '#dcd8d4', roughness: 0.45 }),
    );
    ped.position.set(0, 23, -15);
    const pedTrim = new THREE.Mesh(
      new THREE.TorusGeometry(206, 6, 8, 32),
      new THREE.MeshBasicMaterial({ color: neonMagenta }),
    );
    pedTrim.rotation.x = Math.PI / 2;
    pedTrim.position.set(0, 46, -15);
    this.pedestalGroup.add(ped, pedTrim);

    // 2. Billowing Magenta Demon Smoke Cloud (Opening Reveal!)
    const smokeMat = new THREE.MeshStandardMaterial({
      color: '#ff66d4',
      emissive: '#d822a8',
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.72,
      roughness: 1,
    });
    for (let i = 0; i < 16; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(48 + (i % 4) * 18, 12, 12), smokeMat);
      puff.position.set(((i % 5) - 2) * 68, 70 + Math.floor(i / 5) * 58, -75 + (i % 3) * 35);
      this.smokeGroup.add(puff);
    }

    // 3. Dreamy Pastel Bokeh Backdrop (Close-ups & Bridge)
    const haloWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 720),
      new THREE.MeshStandardMaterial({ color: '#ffd8ef', emissive: '#ffc2e6', emissiveIntensity: 0.55 }),
    );
    haloWall.position.set(0, 230, -260);
    this.pastelHaloGroup.add(haloWall);
    const bokehCols = ['#84f4ff', '#ffe868', '#ff88d4', '#98ffbe', '#c6a4ff'];
    for (let i = 0; i < 18; i++) {
      const orb = new THREE.Mesh(
        new THREE.CircleGeometry(34 + (i % 4) * 14, 16),
        new THREE.MeshBasicMaterial({ color: bokehCols[i % bokehCols.length], transparent: true, opacity: 0.5 }),
      );
      orb.position.set(((i * 97) % 720) - 360, 80 + ((i * 61) % 300), -250);
      this.pastelHaloGroup.add(orb);
    }

    // 4. Floating Fizzy Soda Bubbles
    const bubMat = new THREE.MeshStandardMaterial({
      color: '#e6fcff',
      emissive: '#88f4ff',
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.58,
      roughness: 0.1,
    });
    for (let i = 0; i < 24; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(8 + (i % 4) * 4, 10, 10), bubMat);
      b.position.set(((i * 83) % 600) - 300, 30 + ((i * 53) % 300), ((i * 41) % 240) - 140);
      this.bubbleGroup.add(b);
    }

    this.scene.add(this.plazaGroup, this.pedestalGroup, this.smokeGroup, this.pastelHaloGroup, this.bubbleGroup);

    // 1. Jinu — Lead Vocal (white shirt over pink tee, parted black hair)
    this.jinu = new VideoFigure(jinuModel, jinuTrack, this.props, this.scene, whiteShirt, skinBoy);
    this.jinu.head.scene.scale.setScalar(2.05);
    this.props.box(this.jinu.root, 34, 58, 22, whiteShirt, [0, -34, 2]);
    this.props.box(this.jinu.root, 14, 52, 23, pastelPink, [0, -34, 3]);
    this.styleHair(this.jinu, hairBlack);

    // 2. Abby / Baby — Rap & Energy (mint-green floral Hawaiian shirt, coral hair)
    this.rapBoy = new VideoFigure(rapModel, rapTrack, this.props, this.scene, mintShirt, skinBoy);
    this.rapBoy.head.scene.scale.setScalar(2.02);
    this.props.box(this.rapBoy.root, 36, 58, 22, mintShirt, [0, -34, 2]);
    this.props.oval(this.rapBoy.root, [-8, -24, 14], [7, 7, 3], '#ff5c8a');
    this.props.oval(this.rapBoy.root, [9, -42, 14], [7, 7, 3], '#ff5c8a');
    this.styleHair(this.rapBoy, hairCoral);

    // 3. Romance / Mystery — Chorus & High Hook (yellow shirt, pink K-pop hair)
    this.chorusBoy = new VideoFigure(chorusModel, chorusTrack, this.props, this.scene, yellowShirt, skinBoy);
    this.chorusBoy.head.scene.scale.setScalar(2.02);
    this.props.box(this.chorusBoy.root, 34, 58, 22, yellowShirt, [0, -34, 2]);
    this.styleHair(this.chorusBoy, hairPink);

    // 2 additional boyband members completing the 5-member Saja Boys formation (Baby cyan hair & Mystery lavender hair)
    for (const [shirtCol, hairCol, xStart] of [
      ['#eb5e98', hairCyan, -175],
      [purpleVest, hairLavender, 175],
    ] as const) {
      const grp = new THREE.Group();
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(16, 15, 86, 12),
        new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.45 }),
      );
      torso.position.y = 84;
      const head = new THREE.Mesh(new THREE.SphereGeometry(12, 12, 12), new THREE.MeshStandardMaterial({ color: skinBoy }));
      head.position.y = 148;
      const hair = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 12), new THREE.MeshStandardMaterial({ color: hairCol }));
      hair.position.set(0, 152, -2);
      grp.add(torso, head, hair);
      grp.position.set(xStart, 0, -55);
      this.extraBoys.push(grp);
      this.scene.add(grp);
    }

    this.resize(1280, 720);
    this.frame(0, false, 0, 'soda-smoke', 0);
  }

  private styleHair(f: VideoFigure, color: string) {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(8, 17);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y - 2 * k, z]], color, 3.8);
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.jinu.head.resize(this.width, this.height);
    this.rapBoy.head.resize(this.width, this.height);
    this.chorusBoy.head.resize(this.width, this.height);
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

    const q = t * (126 / 60) * Math.PI * 2;
    const beat = Math.sin(q);
    const sway = Math.sin(q * 0.5);

    const isSmoke = view === 'soda-smoke';
    const isPastel = view === 'soda-pastel' || view === 'soda-bridge' || view === 'soda-ending';
    const isNeon = view === 'soda-neon';
    const isPedestal = view === 'soda-pedestal' || isNeon;

    this.plazaGroup.visible = !isPastel;
    this.pedestalGroup.visible = isPedestal;
    this.smokeGroup.visible = isSmoke;
    this.pastelHaloGroup.visible = isPastel;
    this.bubbleGroup.visible = true;

    // Fizzy upward soda bubbles!
    this.bubbleGroup.children.forEach((b, idx) => {
      b.position.y = 20 + ((t * 68 + idx * 31) % 340);
      b.position.x += Math.sin(t * 2 + idx) * 0.15;
    });

    if (isNeon) {
      this.scene.background = new THREE.Color('#280c36');
      this.fillLight.color.set(neonMagenta);
      this.rimLight.color.set(neonCyan);
    } else if (isPastel) {
      this.scene.background = new THREE.Color('#ffd8ef');
      this.fillLight.color.set('#ffe4f4');
      this.rimLight.color.set('#8ef6ff');
    } else if (isSmoke) {
      this.scene.background = new THREE.Color('#6a8cb8');
      this.fillLight.color.set(neonMagenta);
      this.rimLight.color.set('#ffe8c4');
    } else {
      this.scene.background = new THREE.Color(skyDay);
      this.fillLight.color.set('#ffd8ec');
      this.rimLight.color.set(neonCyan);
    }

    const pedLift = isPedestal ? 46 : 0;
    const grooveY = Math.abs(beat) * 6;
    const stepX = sway * 20;

    this.jinu.root.position.set(stepX, 152 + pedLift + grooveY, -12);
    this.jinu.root.rotation.set(0, sway * 0.14, sway * 0.05);

    this.rapBoy.root.position.set(-96 + stepX * 0.9, 150 + pedLift + grooveY * 0.9, -28);
    this.rapBoy.root.rotation.set(0, 0.12 + sway * 0.12, sway * 0.04);

    this.chorusBoy.root.position.set(96 + stepX * 0.9, 150 + pedLift + grooveY * 0.9, -28);
    this.chorusBoy.root.rotation.set(0, -0.12 + sway * 0.12, -sway * 0.04);

    this.extraBoys.forEach((b, idx) => {
      b.visible = !isPastel || view === 'soda-bridge';
      b.position.x = (idx === 0 ? -185 : 185) + stepX * 0.8;
      b.position.y = pedLift + grooveY * 0.85;
    });

    // Synchronized K-pop shoulder-pop & soda-sip choreography!
    const popArm = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -6 + Math.sin(phase) * 18, 22],
      [-54, 18 + lift + Math.sin(phase) * 22, 28],
      [34, -6 - Math.sin(phase) * 18, 22],
      [54, 18 + lift - Math.sin(phase) * 22, 28],
    ];
    this.jinu.pose(t, popArm(q, speaker === 'soda-jinu' ? 18 : 8));
    this.rapBoy.pose(t, popArm(q + 0.6, speaker === 'soda-rap' ? 18 : 8));
    this.chorusBoy.pose(t, popArm(q + 1.2, speaker === 'soda-chorus' ? 18 : 8));

    // Camera framing
    const portrait = this.height > this.width;
    let pos: P = [0, 178 + pedLift * 0.5, 415];
    let target: P = [0, 158 + pedLift * 0.5, -45];
    let fov = portrait ? 54 : 40;

    switch (view) {
      case 'soda-jinu':
      case 'soda-ending':
        pos = [this.jinu.root.position.x + Math.sin(t * 0.6) * 12, 174 + pedLift, 114];
        target = [this.jinu.root.position.x, 172 + pedLift, -12];
        fov = portrait ? 40 : 28;
        break;
      case 'soda-rap':
        pos = [this.rapBoy.root.position.x - 10, 172 + pedLift, 102];
        target = [this.rapBoy.root.position.x, 170 + pedLift, -28];
        fov = portrait ? 40 : 28;
        break;
      case 'soda-chorus':
        pos = [this.chorusBoy.root.position.x + 10, 172 + pedLift, 102];
        target = [this.chorusBoy.root.position.x, 170 + pedLift, -28];
        fov = portrait ? 40 : 28;
        break;
      case 'soda-smoke':
        pos = [0, 172, 340];
        target = [0, 145, -60];
        fov = portrait ? 52 : 38;
        break;
      case 'soda-pastel':
      case 'soda-bridge':
        pos = [Math.sin(t * 0.5) * 45, 170, 260];
        target = [0, 165, -20];
        fov = portrait ? 48 : 36;
        break;
      case 'soda-pedestal':
      case 'soda-neon':
        pos = [Math.sin(t * 0.45) * 85, 225, 440];
        target = [0, 188, -20];
        fov = portrait ? 56 : 42;
        break;
      case 'soda-plaza':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 70, 182, 425];
        target = [0, 158, -40];
        fov = portrait ? 54 : 40;
        break;
    }

    if (intensity > 0.8) pos[1] += beat * 1.5;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.jinu.update(t, playing, this.camera, dt, reset);
    this.rapBoy.update(t, playing, this.camera, dt, reset);
    this.chorusBoy.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.jinu.dispose();
    this.rapBoy.dispose();
    this.chorusBoy.dispose();
    this.signTex?.dispose();
    this.props.dispose();
  }
}
