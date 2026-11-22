import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';

export type BaileId = 'baile-benito' | 'baile-coro';

const skinBenito = '#c2906e';
const hairDark = '#1b1412';
const powderSuit = '#9fc2d8';
const creamSweat = '#dcd4c2';
const capGreen = '#1b5030';
const guayaberaWhite = '#ece6d8';
const goldDress = '#d8a84e';
const woodWall = '#4a2b16';
const woodFloor = '#8c5a2c';

function makeClasesSignTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#2d1a0e';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#c89b54';
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, 476, 220);
  ctx.fillStyle = '#e8c47a';
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 44px Georgia, serif';
  ctx.fillText('Clases de', 256, 108);
  ctx.font = 'italic 900 72px Georgia, serif';
  ctx.fillText('Baile', 256, 188);
  return new THREE.CanvasTexture(c);
}

function makePianoKeysTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#f2ede2';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#26201a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    ctx.strokeRect(i * 25.6, 0, 25.6, 128);
    if (i % 7 !== 2 && i % 7 !== 6) {
      ctx.fillStyle = '#181412';
      ctx.fillRect(i * 25.6 + 16, 0, 16, 76);
    }
  }
  return new THREE.CanvasTexture(c);
}

function makeDancerProxy(
  outfit: string,
  pantsOrSkirt: string,
  skin = '#bd8868',
  hat = false,
  beard = false,
): THREE.Group {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 18, 60, 10),
    new THREE.MeshStandardMaterial({ color: outfit, roughness: 0.72 }),
  );
  top.position.y = 92;
  const bot = new THREE.Mesh(
    new THREE.CylinderGeometry(17, 20, 62, 10),
    new THREE.MeshStandardMaterial({ color: pantsOrSkirt, roughness: 0.78 }),
  );
  bot.position.y = 32;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(14, 12, 10),
    new THREE.MeshStandardMaterial({ color: skin, roughness: 0.62 }),
  );
  head.position.y = 138;
  g.add(top, bot, head);
  if (hat) {
    const strawMat = new THREE.MeshStandardMaterial({ color: '#decba0', roughness: 0.85 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(23, 23, 3, 14), strawMat);
    brim.position.y = 148;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(13, 15, 13, 12), strawMat);
    crown.position.y = 155;
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(15.2, 15.2, 3.5, 12),
      new THREE.MeshStandardMaterial({ color: '#2b1f18', roughness: 0.7 }),
    );
    band.position.y = 150.5;
    g.add(brim, crown, band);
  }
  if (beard) {
    const bMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 10, 8),
      new THREE.MeshStandardMaterial({ color: '#e2e0dc', roughness: 0.85 }),
    );
    bMesh.scale.set(0.95, 0.85, 0.75);
    bMesh.position.set(0, 131, 6);
    const whiteHair = new THREE.Mesh(
      new THREE.SphereGeometry(15, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
      new THREE.MeshStandardMaterial({ color: '#dcdad6', roughness: 0.8 }),
    );
    whiteHair.position.set(0, 140, -1);
    g.add(bMesh, whiteHair);
  }
  return g;
}

/**
 * Procedural 3D cinematic stage for BAD BUNNY — "BAILE INoLVIDABLE"
 * Recreates the wood-paneled "Clases de Baile" lobby and elderly dreamer, the warm hardwood
 * salsa studio circle with young Benito in cream sweatshirt & green cap, the pitch-black
 * single-spotlight ballroom memory in powder-blue suit & gold sequin dress, the upright
 * salsa piano, golden velvet-curtain Puerto Rican orchestra stage with Panama-hat coro singers
 * and congas, smoky cyan backlit dance silhouettes, and the warm studio finale.
 */
export class BaileInolvidableStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly lobbyGroup = new THREE.Group();
  readonly studioGroup = new THREE.Group();
  readonly spotlightGroup = new THREE.Group();
  readonly stageGroup = new THREE.Group();
  readonly mistGroup = new THREE.Group();

  readonly benito: VideoFigure;
  readonly coro: VideoFigure;
  readonly elderProxy: THREE.Group;
  readonly partnerProxy: THREE.Group;
  readonly studioDancers: THREE.Group[] = [];
  readonly orchestraBand: THREE.Group[] = [];
  readonly spotlightCone: THREE.Mesh;
  readonly stageBeams: THREE.Mesh[] = [];
  readonly greenCap: THREE.Group;
  readonly shades: THREE.Group;
  readonly panamaHat: THREE.Group;

  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly signTex: THREE.CanvasTexture | null;
  private readonly pianoTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly benitoModel: VoiceModel,
    readonly benitoTrack: TeleTrack,
    readonly coroModel: VoiceModel,
    readonly coroTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#1a1008');

    const amb = new THREE.AmbientLight('#e8d2b4', 0.82);
    this.keyLight = new THREE.DirectionalLight('#ffdfaa', 1.45);
    this.keyLight.position.set(160, 420, 320);
    this.fillLight = new THREE.PointLight('#ffaa46', 1.5, 2200);
    this.fillLight.position.set(-220, 240, 180);
    this.rimLight = new THREE.PointLight('#4cc4d4', 1.2, 2200);
    this.rimLight.position.set(220, 260, -220);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    // 1. Wood-paneled "Clases de Baile" lobby & elder sofa
    const lobbyFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1200),
      new THREE.MeshStandardMaterial({ color: woodFloor, roughness: 0.55 }),
    );
    lobbyFloor.rotation.x = -Math.PI / 2;
    const lobbyWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: woodWall, roughness: 0.72 }),
    );
    lobbyWall.position.set(0, 260, -340);
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(240, 54, 84),
      new THREE.MeshStandardMaterial({ color: '#636c3e', roughness: 0.85 }),
    );
    sofa.position.set(0, 34, -220);
    const lampL = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 24, 52, 10),
      new THREE.MeshBasicMaterial({ color: '#ffe8b2' }),
    );
    lampL.position.set(-165, 118, -220);
    const lampR = lampL.clone();
    lampR.position.x = 165;
    this.signTex = makeClasesSignTexture();
    const signBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 120),
      this.signTex
        ? new THREE.MeshBasicMaterial({ map: this.signTex })
        : new THREE.MeshBasicMaterial({ color: '#c89b54' }),
    );
    signBoard.position.set(0, 228, -334);
    this.elderProxy = makeDancerProxy('#7a7d78', '#3c4044', '#cca286', false, true);
    this.elderProxy.position.set(0, 8, -195);
    this.lobbyGroup.add(lobbyFloor, lobbyWall, sofa, lampL, lampR, signBoard, this.elderProxy);
    this.scene.add(this.lobbyGroup);

    // 2. Warm hardwood salsa dance class & circle of dancers
    const stFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#9c6834', roughness: 0.42, metalness: 0.08 }),
    );
    stFloor.rotation.x = -Math.PI / 2;
    const stBack = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 540),
      new THREE.MeshStandardMaterial({ color: '#452814', roughness: 0.75 }),
    );
    stBack.position.set(0, 270, -400);
    const panelMat = new THREE.MeshBasicMaterial({ color: '#fff2cc' });
    for (let r = 0; r < 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(110, 6, 60), panelMat);
        panel.position.set(c * 220, 385, -240 + r * 200);
        this.studioGroup.add(panel);
      }
    }
    const dancerColors: [string, string][] = [
      ['#e28454', '#2a3844'],
      ['#36768c', '#1c2428'],
      ['#a83244', '#681a28'],
      ['#d6c49a', '#2e2b26'],
      ['#5c8248', '#222820'],
      ['#c24e76', '#4c1e34'],
      ['#d8a25e', '#32261e'],
      ['#242428', '#141418'],
    ];
    for (let i = 0; i < dancerColors.length; i++) {
      const ang = (i / dancerColors.length) * Math.PI * 2;
      const d = makeDancerProxy(dancerColors[i][0], dancerColors[i][1], '#b88262', i === 3);
      d.position.set(Math.cos(ang) * 215, 0, Math.sin(ang) * 145 - 120);
      d.rotation.y = -ang + Math.PI * 0.5;
      this.studioGroup.add(d);
      this.studioDancers.push(d);
    }
    this.studioGroup.add(stFloor, stBack);
    this.scene.add(this.studioGroup);

    // 3. Single-spotlight pitch-black ballroom memory
    const darkFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#0c0b0a', roughness: 0.35, metalness: 0.2 }),
    );
    darkFloor.rotation.x = -Math.PI / 2;
    this.spotlightCone = new THREE.Mesh(
      new THREE.ConeGeometry(145, 560, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: '#ffe4a8', transparent: true, opacity: 0.14, side: THREE.DoubleSide }),
    );
    this.spotlightCone.position.set(40, 275, -25);
    this.spotlightCone.rotation.z = 0.22;
    this.partnerProxy = makeDancerProxy(goldDress, '#b88430', '#bd8664', false);
    this.partnerProxy.position.set(58, 0, -24);
    this.partnerProxy.rotation.y = -1.25;
    this.spotlightGroup.add(darkFloor, this.spotlightCone, this.partnerProxy);
    this.scene.add(this.spotlightGroup);

    // 4. Golden velvet-curtain live Puerto Rican salsa orchestra stage
    const stageFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1200),
      new THREE.MeshStandardMaterial({ color: '#784820', roughness: 0.45, metalness: 0.15 }),
    );
    stageFloor.rotation.x = -Math.PI / 2;
    const curtainMat = new THREE.MeshStandardMaterial({ color: '#a86426', roughness: 0.72, metalness: 0.18 });
    for (let i = -7; i <= 7; i++) {
      const fold = new THREE.Mesh(new THREE.CylinderGeometry(36, 40, 480, 10), curtainMat);
      fold.position.set(i * 74, 240, -340 + (i % 2) * 14);
      this.stageGroup.add(fold);
    }
    // Overhead golden stage spotlight beams
    const beamMat = new THREE.MeshBasicMaterial({ color: '#ffd48a', transparent: true, opacity: 0.11, side: THREE.DoubleSide });
    for (let b = -3; b <= 3; b++) {
      const bm = new THREE.Mesh(new THREE.ConeGeometry(78, 480, 12, 1, true), beamMat);
      bm.position.set(b * 125, 250, -180);
      bm.rotation.z = b * 0.08;
      this.stageGroup.add(bm);
      this.stageBeams.push(bm);
    }
    // Upright salsa piano on stage left
    const piano = new THREE.Group();
    const pBody = new THREE.Mesh(
      new THREE.BoxGeometry(148, 124, 62),
      new THREE.MeshStandardMaterial({ color: '#3b2112', roughness: 0.42 }),
    );
    pBody.position.y = 62;
    this.pianoTex = makePianoKeysTexture();
    const pKeys = new THREE.Mesh(
      new THREE.BoxGeometry(132, 8, 28),
      this.pianoTex
        ? new THREE.MeshBasicMaterial({ map: this.pianoTex })
        : new THREE.MeshBasicMaterial({ color: '#f0ece2' }),
    );
    pKeys.position.set(0, 78, 36);
    piano.add(pBody, pKeys);
    piano.position.set(-245, 0, -170);
    piano.rotation.y = 0.42;
    this.stageGroup.add(piano);

    // Congas & timbales on stage right
    const congaMat = new THREE.MeshStandardMaterial({ color: '#9c5424', roughness: 0.42 });
    const headMat = new THREE.MeshStandardMaterial({ color: '#ece0c4', roughness: 0.7 });
    for (const [cx, cz] of [[210, -165], [248, -155]]) {
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(18, 13, 86, 12), congaMat);
      shell.position.set(cx, 48, cz);
      const skinTop = new THREE.Mesh(new THREE.CylinderGeometry(18.2, 18.2, 4, 12), headMat);
      skinTop.position.set(cx, 92, cz);
      this.stageGroup.add(shell, skinTop);
    }
    // Live salsa orchestra players (white guayaberas & Panama hats)
    for (const [bx, bz] of [[-240, -125], [-135, -245], [140, -235], [230, -210], [305, -185]]) {
      const mus = makeDancerProxy(guayaberaWhite, '#282420', '#9c6c4e', true);
      mus.position.set(bx, 0, bz);
      this.stageGroup.add(mus);
      this.orchestraBand.push(mus);
    }
    this.stageGroup.add(stageFloor);
    this.scene.add(this.stageGroup);

    // 5. Smoky cyan backlit dance silhouettes
    const mistFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#10242c', roughness: 0.25, metalness: 0.45 }),
    );
    mistFloor.rotation.x = -Math.PI / 2;
    const mistGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 520),
      new THREE.MeshBasicMaterial({ color: '#428ea0', transparent: true, opacity: 0.28 }),
    );
    mistGlow.position.set(0, 220, -300);
    const sil1 = makeDancerProxy('#091318', '#091318', '#091318');
    sil1.position.set(-140, 0, -130);
    const sil2 = makeDancerProxy('#091318', '#091318', '#091318');
    sil2.position.set(135, 0, -140);
    this.mistGroup.add(mistFloor, mistGlow, sil1, sil2);
    this.scene.add(this.mistGroup);

    // Two physical male voices: Bad Bunny (lead) & Salsa Coro (chorus)
    this.benito = new VideoFigure(
      benitoModel,
      benitoTrack,
      this.props,
      this.scene,
      powderSuit,
      skinBenito,
    );
    this.coro = new VideoFigure(
      coroModel,
      coroTrack,
      this.props,
      this.scene,
      guayaberaWhite,
      '#b48060',
    );

    // Accessories: forest-green LA cap (for dance studio), amber aviators (for salsa stage), Panama hat for coro
    this.greenCap = new THREE.Group();
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(18, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: capGreen, roughness: 0.8 }),
    );
    capDome.position.set(0, 152, -1);
    const capBill = new THREE.Mesh(
      new THREE.BoxGeometry(26, 3, 20),
      new THREE.MeshStandardMaterial({ color: capGreen, roughness: 0.8 }),
    );
    capBill.position.set(0, 151, 14);
    this.greenCap.add(capDome, capBill);
    this.benito.root.add(this.greenCap);

    this.shades = new THREE.Group();
    const lensMat = new THREE.MeshStandardMaterial({ color: '#6b3e18', roughness: 0.2, metalness: 0.6 });
    for (const sx of [-7.5, 7.5]) {
      const lens = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 2), lensMat);
      lens.position.set(sx, 146, 16);
      this.shades.add(lens);
    }
    const curlyHair = new THREE.Mesh(
      new THREE.SphereGeometry(18.5, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: hairDark, roughness: 0.85 }),
    );
    curlyHair.position.set(0, 153, -1);
    this.shades.add(curlyHair);
    this.benito.root.add(this.shades);

    this.panamaHat = new THREE.Group();
    const pStraw = new THREE.MeshStandardMaterial({ color: '#e0cfa4', roughness: 0.82 });
    const pBrim = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 3, 14), pStraw);
    pBrim.position.y = 158;
    const pCrown = new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 14, 12), pStraw);
    pCrown.position.y = 166;
    const pRibbon = new THREE.Mesh(
      new THREE.CylinderGeometry(18.3, 18.3, 3.5, 12),
      new THREE.MeshStandardMaterial({ color: '#241a14', roughness: 0.7 }),
    );
    pRibbon.position.y = 160.5;
    this.panamaHat.add(pBrim, pCrown, pRibbon);
    this.coro.root.add(this.panamaHat);

    this.resize(1280, 720);
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.benito.head.resize(this.width, this.height);
    this.coro.head.resize(this.width, this.height);
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

    const salsa = t * (104 / 60) * Math.PI * 2;
    const sway = Math.sin(salsa * 0.5);
    const step = Math.abs(Math.sin(salsa));

    const isLobby = view === 'baile-lobby' || view === 'baile-ending';
    const isStudio = view === 'baile-studio' || view === 'baile-circle';
    const isSpotlight = view === 'baile-spotlight';
    const isMist = view === 'baile-mist';
    const isStage =
      view === 'baile-stage' ||
      view === 'baile-piano' ||
      view === 'baile-congas' ||
      view === 'baile-coro' ||
      view === 'baile-benito' ||
      view === 'wide';

    this.lobbyGroup.visible = isLobby;
    this.studioGroup.visible = isStudio;
    this.spotlightGroup.visible = isSpotlight;
    this.stageGroup.visible = isStage;
    this.mistGroup.visible = isMist;

    // Studio look (green cap) vs Salsa Stage look (amber aviators & curly hair)
    const studioLook = isStudio;
    this.greenCap.visible = studioLook;
    this.shades.visible = !studioLook;

    // Animate salsa dancers & orchestra
    for (let i = 0; i < this.studioDancers.length; i++) {
      this.studioDancers[i].position.y = Math.abs(Math.sin(salsa + i * 0.7)) * 6;
      this.studioDancers[i].rotation.y += 0;
    }
    for (let i = 0; i < this.orchestraBand.length; i++) {
      this.orchestraBand[i].position.y = Math.abs(Math.sin(salsa + i * 0.9)) * 5;
    }
    this.partnerProxy.position.x = 58 + Math.sin(salsa * 0.35) * 14;
    this.partnerProxy.rotation.y = -1.25 + sway * 0.25;

    // Lighting per environment
    if (isLobby || isStudio) {
      this.scene.background = new THREE.Color('#24150a');
      this.keyLight.color.set('#ffe2b4');
      this.fillLight.color.set('#d88838');
      this.rimLight.color.set('#b86828');
    } else if (isSpotlight) {
      this.scene.background = new THREE.Color('#040405');
      this.keyLight.color.set('#ffe6b0');
      this.fillLight.color.set('#584428');
      this.rimLight.color.set('#282018');
    } else if (isMist) {
      this.scene.background = new THREE.Color('#0c2028');
      this.keyLight.color.set('#78cedc');
      this.fillLight.color.set('#246272');
      this.rimLight.color.set('#a8f0ff');
    } else {
      this.scene.background = new THREE.Color('#2c1608');
      this.keyLight.color.set('#ffd996');
      this.fillLight.color.set('#ff8e36');
      this.rimLight.color.set('#ffe29c');
    }

    // Place Benito & Coro
    this.benito.root.visible = !isLobby;
    const benSpot: P = isSpotlight
      ? [-18 + Math.sin(salsa * 0.35) * 12, 0, -24]
      : isStudio
      ? [sway * 22, 0, -40]
      : [sway * 14, 0, -35];
    this.benito.root.position.set(benSpot[0], benSpot[1], benSpot[2]);
    this.benito.root.rotation.y = isSpotlight ? 0.65 + sway * 0.2 : sway * 0.16;

    this.coro.root.visible = isStage;
    this.coro.root.position.set(138, 0, -145);
    this.coro.root.rotation.y = -0.35 - sway * 0.14;

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -4 + Math.sin(phase) * 14, 22],
      [-52, 16 + lift + Math.sin(phase) * 20, 28],
      [34, -4 - Math.sin(phase) * 14, 22],
      [52, 16 + lift - Math.sin(phase) * 20, 28],
    ];
    this.benito.pose(t, arms(salsa, speaker === 'baile-benito' || !speaker ? 18 + step * 8 : 8));
    this.coro.pose(t, arms(salsa + 0.6, speaker === 'baile-coro' ? 20 + step * 8 : 8));

    // Deterministic cameras
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.32) * 55, 158, 260];
    let target: [number, number, number] = [0, 134, -45];
    let fov = portrait ? 54 : 40;

    switch (view) {
      case 'baile-lobby':
      case 'baile-ending':
        pos = [Math.sin(t * 0.22) * 38, 136, 175];
        target = [0, 128, -210];
        fov = portrait ? 54 : 40;
        break;
      case 'baile-studio':
        pos = [Math.sin(t * 0.35) * 65, 162, 245];
        target = [0, 126, -75];
        fov = portrait ? 54 : 42;
        break;
      case 'baile-circle':
        pos = [Math.sin(t * 0.38) * 115, 225, 285];
        target = [0, 108, -110];
        fov = portrait ? 58 : 44;
        break;
      case 'baile-spotlight':
        pos = [Math.sin(t * 0.3) * 70, 178, 285];
        target = [18, 118, -24];
        fov = portrait ? 52 : 38;
        break;
      case 'baile-piano':
        pos = [-145 + Math.sin(t * 0.4) * 18, 126, -40];
        target = [-245, 86, -155];
        fov = portrait ? 48 : 34;
        break;
      case 'baile-congas':
        pos = [165 + Math.sin(t * 0.4) * 24, 138, 25];
        target = [230, 102, -175];
        fov = portrait ? 50 : 36;
        break;
      case 'baile-mist':
        pos = [Math.sin(t * 0.3) * 45, 144, 245];
        target = [0, 126, -80];
        fov = portrait ? 54 : 40;
        break;
      case 'baile-coro':
        pos = [152 + Math.sin(t * 0.4) * 14, 152, 4];
        target = [138, 146, -145];
        fov = portrait ? 42 : 30;
        break;
      case 'baile-benito':
        pos = [benSpot[0] + Math.sin(t * 0.45) * 14, 150, 98];
        target = [benSpot[0], 146, benSpot[2]];
        fov = portrait ? 40 : 28;
        break;
      case 'baile-stage':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.3) * 72, 166, 305];
        target = [0, 134, -105];
        fov = portrait ? 56 : 42;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(salsa) * 1.4;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.benito.root.visible) this.benito.update(t, playing, this.camera, dt, reset);
    if (this.coro.root.visible) this.coro.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.benito.dispose();
    this.coro.dispose();
    this.signTex?.dispose();
    this.pianoTex?.dispose();
    this.props.dispose();
  }
}
