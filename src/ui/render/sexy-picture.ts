import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';

export type SexyPictureId = 'cm-lead' | 'cm-choir';

const skinFair = '#e6bba2';
const hairCopper = '#7a2c18';
const redDress = '#c41822';
const silverSequin = '#d6dce4';
const leopardGold = '#d49a3a';
const velvetBlue = '#142a6e';
const crimsonCurtain = '#5e0a12';
const neonBlue = '#2878ff';

function makeBoutiqueSignTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#9a1820';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#f2d8a8';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 116);
  ctx.fillStyle = '#fff3d6';
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.fillText('GRAND OPENING', 256, 78);
  return new THREE.CanvasTexture(c);
}

function makeEuroCoinTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#d4b468';
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8dce0';
  ctx.beginPath();
  ctx.arc(128, 128, 86, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5e6268';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#3c4048';
  ctx.textAlign = 'center';
  ctx.font = 'bold 104px Georgia, serif';
  ctx.fillText('1', 96, 162);
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('EURO', 162, 148);
  return new THREE.CanvasTexture(c);
}

function makeDesertBackdropTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#c88088');
  sky.addColorStop(0.5, '#f2b888');
  sky.addColorStop(1, '#fff0c2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 384);
  // Giant glowing sunset sun
  ctx.fillStyle = '#fff8dc';
  ctx.beginPath();
  ctx.arc(256, 188, 92, 0, Math.PI * 2);
  ctx.fill();
  // Distant purple mesas
  ctx.fillStyle = '#8b4b5c';
  ctx.beginPath();
  ctx.moveTo(0, 265);
  ctx.lineTo(120, 215);
  ctx.lineTo(240, 250);
  ctx.lineTo(390, 205);
  ctx.lineTo(512, 260);
  ctx.lineTo(512, 384);
  ctx.lineTo(0, 384);
  ctx.closePath();
  ctx.fill();
  // Sandy desert floor
  ctx.fillStyle = '#c4865e';
  ctx.fillRect(0, 280, 512, 104);
  // Painted silhouettes of cacti
  ctx.fillStyle = '#48342e';
  for (const [cx, cy, h] of [[85, 290, 88], [418, 295, 96], [462, 305, 58]]) {
    ctx.fillRect(cx - 7, cy - h, 14, h);
    ctx.fillRect(cx - 24, cy - h * 0.65, 18, 10);
    ctx.fillRect(cx - 24, cy - h * 0.85, 10, h * 0.25);
    ctx.fillRect(cx + 6, cy - h * 0.55, 18, 10);
    ctx.fillRect(cx + 14, cy - h * 0.78, 10, h * 0.28);
  }
  return new THREE.CanvasTexture(c);
}

function makeCactusCutout(h: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: '#3b7438', roughness: 0.86 });
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(20, h, 8), mat);
  trunk.position.y = h / 2;
  const armL = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 8), mat);
  armL.position.set(-18, h * 0.58, 0);
  const armLUp = new THREE.Mesh(new THREE.BoxGeometry(14, h * 0.28, 8), mat);
  armLUp.position.set(-28, h * 0.72, 0);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 8), mat);
  armR.position.set(17, h * 0.45, 0);
  const armRUp = new THREE.Mesh(new THREE.BoxGeometry(14, h * 0.26, 8), mat);
  armRUp.position.set(26, h * 0.58, 0);
  g.add(trunk, armL, armLUp, armR, armRUp);
  return g;
}

function makeDancerProxy(color: string, skin: string): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.72 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(34, 62, 18), bodyMat);
  torso.position.y = 108;
  const head = new THREE.Mesh(new THREE.SphereGeometry(13, 10, 8), skinMat);
  head.position.y = 152;
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 76, 8), bodyMat);
  legL.position.set(-10, 38, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 76, 8), bodyMat);
  legR.position.set(10, 38, 0);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4, 52, 8), skinMat);
  armL.position.set(-24, 114, 0);
  armL.rotation.z = 0.35;
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4, 52, 8), skinMat);
  armR.position.set(24, 114, 0);
  armR.rotation.z = -0.35;
  g.add(torso, head, legL, legR, armL, armR);
  return g;
}

/**
 * Procedural 3D cinematic stage for CMAT — "Take A Sexy Picture Of Me"
 * Recreates the mall grand-opening ribbon cutting (giant 1-Euro coin mascot, red-vest dog mascot,
 * yellow claw machine, boutique display window, giant silver scissors), crimson velvet VIP club booth,
 * sunset desert photo-studio backdrop with cardboard cacti, electric-blue neon light-tube studio
 * with flank dancers, and the warm tungsten backstage vanity mirror outro.
 */
export class SexyPictureStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly ribbonGroup = new THREE.Group();
  readonly clubGroup = new THREE.Group();
  readonly desertGroup = new THREE.Group();
  readonly blueGroup = new THREE.Group();
  readonly vanityGroup = new THREE.Group();

  readonly lead: VideoFigure;
  readonly choir: VideoFigure;
  readonly scissorsGroup: THREE.Group;
  readonly coinMascot: THREE.Group;
  readonly dogMascot: THREE.Group;
  readonly blueDancers: THREE.Group[] = [];
  readonly discoBall: THREE.Mesh;
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly signTex: THREE.CanvasTexture | null;
  private readonly coinTex: THREE.CanvasTexture | null;
  private readonly desertTex: THREE.CanvasTexture | null;
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
    this.scene.background = new THREE.Color('#dfe4ea');

    const amb = new THREE.AmbientLight('#f2efe8', 0.92);
    this.keyLight = new THREE.DirectionalLight('#ffffff', 1.45);
    this.keyLight.position.set(160, 420, 310);
    this.fillLight = new THREE.PointLight('#ffd8b0', 1.4, 2200);
    this.fillLight.position.set(-210, 210, 190);
    this.rimLight = new THREE.PointLight(neonBlue, 1.35, 2200);
    this.rimLight.position.set(220, 240, -210);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    // 1. Mall Grand Opening Ribbon Cutting
    const mallFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#d8dce0', roughness: 0.45 }),
    );
    mallFloor.rotation.x = -Math.PI / 2;
    const mallWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 520),
      new THREE.MeshStandardMaterial({ color: '#eef0f2', roughness: 0.8 }),
    );
    mallWall.position.set(0, 260, -320);

    // Boutique window with spoiler-free GRAND OPENING banner
    const shopWin = new THREE.Mesh(
      new THREE.PlaneGeometry(310, 210),
      new THREE.MeshStandardMaterial({ color: '#1b355e', roughness: 0.5 }),
    );
    shopWin.position.set(40, 140, -314);
    this.signTex = makeBoutiqueSignTexture();
    const shopSign = new THREE.Mesh(
      new THREE.PlaneGeometry(310, 56),
      this.signTex
        ? new THREE.MeshBasicMaterial({ map: this.signTex })
        : new THREE.MeshBasicMaterial({ color: '#9a1820' }),
    );
    shopSign.position.set(40, 274, -312);
    // Display mannequins inside window
    for (let i = 0; i < 3; i++) {
      const m = makeDancerProxy(i === 1 ? '#b81c28' : '#e4e8ec', '#e8ecee');
      m.scale.setScalar(0.82);
      m.position.set(-36 + i * 76, 36, -304);
      this.ribbonGroup.add(m);
    }

    // Yellow arcade claw machine on left
    const clawBody = new THREE.Mesh(
      new THREE.BoxGeometry(82, 185, 74),
      new THREE.MeshStandardMaterial({ color: '#f2c428', roughness: 0.35 }),
    );
    clawBody.position.set(-225, 92, -230);
    const clawGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(66, 86),
      new THREE.MeshBasicMaterial({ color: '#70c8e8' }),
    );
    clawGlass.position.set(-225, 132, -192);

    // Giant 1-Euro Coin Mascot (left)
    this.coinMascot = new THREE.Group();
    this.coinTex = makeEuroCoinTexture();
    const coinDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(72, 72, 22, 24),
      this.coinTex
        ? new THREE.MeshBasicMaterial({ map: this.coinTex })
        : new THREE.MeshStandardMaterial({ color: '#d4b468', metalness: 0.5, roughness: 0.4 }),
    );
    coinDisc.rotation.x = Math.PI / 2;
    coinDisc.position.y = 124;
    const coinLegL = new THREE.Mesh(new THREE.CylinderGeometry(5, 4, 62, 8), new THREE.MeshStandardMaterial({ color: '#26201c' }));
    coinLegL.position.set(-14, 31, 0);
    const coinLegR = new THREE.Mesh(new THREE.CylinderGeometry(5, 4, 62, 8), new THREE.MeshStandardMaterial({ color: '#26201c' }));
    coinLegR.position.set(14, 31, 0);
    this.coinMascot.add(coinDisc, coinLegL, coinLegR);
    this.coinMascot.position.set(-178, 0, -90);

    // Brown Dog Mascot in Red Vest (right)
    this.dogMascot = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ color: '#5c341e', roughness: 0.88 });
    const vestMat = new THREE.MeshStandardMaterial({ color: '#b41b24', roughness: 0.6 });
    const dogTorso = new THREE.Mesh(new THREE.BoxGeometry(50, 74, 34), vestMat);
    dogTorso.position.y = 104;
    const dogHead = new THREE.Mesh(new THREE.SphereGeometry(26, 14, 12), furMat);
    dogHead.position.y = 166;
    const dogEarL = new THREE.Mesh(new THREE.BoxGeometry(10, 32, 12), furMat);
    dogEarL.position.set(-24, 158, 4);
    const dogEarR = new THREE.Mesh(new THREE.BoxGeometry(10, 32, 12), furMat);
    dogEarR.position.set(24, 158, 4);
    const dogLegL = new THREE.Mesh(new THREE.CylinderGeometry(8, 7, 68, 8), furMat);
    dogLegL.position.set(-12, 34, 0);
    const dogLegR = new THREE.Mesh(new THREE.CylinderGeometry(8, 7, 68, 8), furMat);
    dogLegR.position.set(12, 34, 0);
    this.dogMascot.add(dogTorso, dogHead, dogEarL, dogEarR, dogLegL, dogLegR);
    this.dogMascot.position.set(188, 0, -90);

    // Pastel celebration balloons
    const bColors = ['#f6869c', '#f8d852', '#82d4f4', '#ffffff'];
    for (let i = 0; i < bColors.length; i++) {
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(18, 12, 10),
        new THREE.MeshStandardMaterial({ color: bColors[i], roughness: 0.25 }),
      );
      b.position.set(238 + (i % 2) * 26, 155 + i * 24, -180);
      this.ribbonGroup.add(b);
    }

    // Blue satin grand-opening ribbon + giant silver scissors
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(420, 12, 4),
      new THREE.MeshStandardMaterial({ color: '#1a4ca8', roughness: 0.35 }),
    );
    ribbon.position.set(0, 88, 28);
    this.scissorsGroup = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#d4dae0', metalness: 0.85, roughness: 0.2 });
    const handleMat = new THREE.MeshStandardMaterial({ color: '#c41822', roughness: 0.35 });
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(8, 84, 3), bladeMat);
    blade1.position.set(-10, 26, 0);
    blade1.rotation.z = 0.25;
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(8, 84, 3), bladeMat);
    blade2.position.set(10, 26, 0);
    blade2.rotation.z = -0.25;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(13, 3.5, 8, 16), handleMat);
    ring1.position.set(-14, -22, 0);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(13, 3.5, 8, 16), handleMat);
    ring2.position.set(14, -22, 0);
    this.scissorsGroup.add(blade1, blade2, ring1, ring2);
    this.scissorsGroup.position.set(28, 114, 18);

    this.ribbonGroup.add(mallFloor, mallWall, shopWin, shopSign, clawBody, clawGlass, this.coinMascot, this.dogMascot, ribbon, this.scissorsGroup);
    this.scene.add(this.ribbonGroup);

    // 2. Crimson Velvet VIP Club Booth
    const clubFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#24080a', roughness: 0.72 }),
    );
    clubFloor.rotation.x = -Math.PI / 2;
    const curtainMat = new THREE.MeshStandardMaterial({ color: crimsonCurtain, roughness: 0.85 });
    for (let i = -8; i <= 8; i++) {
      const fold = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 440, 10), curtainMat);
      fold.position.set(i * 44, 220, -260 + (i % 2) * 10);
      this.clubGroup.add(fold);
    }
    const booth = new THREE.Mesh(
      new THREE.BoxGeometry(270, 88, 92),
      new THREE.MeshStandardMaterial({ color: '#1b1414', roughness: 0.42 }),
    );
    booth.position.set(0, 44, -145);
    const vipTable = new THREE.Mesh(
      new THREE.CylinderGeometry(48, 36, 48, 16),
      new THREE.MeshStandardMaterial({ color: '#1c181a', roughness: 0.35 }),
    );
    vipTable.position.set(0, 24, -42);
    // White planters + stanchions
    for (const px of [-175, 175]) {
      const pot = new THREE.Mesh(
        new THREE.BoxGeometry(46, 72, 46),
        new THREE.MeshStandardMaterial({ color: '#e6e0d8', roughness: 0.55 }),
      );
      pot.position.set(px, 36, -85);
      const palm = new THREE.Mesh(
        new THREE.ConeGeometry(42, 120, 7),
        new THREE.MeshStandardMaterial({ color: '#204e26', roughness: 0.85 }),
      );
      palm.position.set(px, 126, -85);
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 4, 86, 8),
        new THREE.MeshStandardMaterial({ color: '#d8b24c', metalness: 0.8, roughness: 0.25 }),
      );
      post.position.set(px * 0.72, 43, 18);
      this.clubGroup.add(pot, palm, post);
    }
    this.discoBall = new THREE.Mesh(
      new THREE.SphereGeometry(28, 16, 12),
      new THREE.MeshStandardMaterial({ color: '#e8edf4', metalness: 0.92, roughness: 0.14 }),
    );
    this.discoBall.position.set(0, 285, -110);
    this.clubGroup.add(clubFloor, booth, vipTable, this.discoBall);
    this.scene.add(this.clubGroup);

    // 3. Desert Photo-Studio Backdrop
    const studioFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#b4a89e', roughness: 0.88 }),
    );
    studioFloor.rotation.x = -Math.PI / 2;
    const studioWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 520),
      new THREE.MeshStandardMaterial({ color: '#e4ded8', roughness: 0.84 }),
    );
    studioWall.position.set(0, 260, -310);
    this.desertTex = makeDesertBackdropTexture();
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(390, 290),
      this.desertTex
        ? new THREE.MeshBasicMaterial({ map: this.desertTex })
        : new THREE.MeshBasicMaterial({ color: '#f2b888' }),
    );
    backdrop.position.set(0, 152, -210);
    const cactusL = makeCactusCutout(145);
    cactusL.position.set(-158, 0, -95);
    const cactusSmall = makeCactusCutout(82);
    cactusSmall.position.set(-125, 0, -68);
    const churn = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 22, 66, 12),
      new THREE.MeshStandardMaterial({ color: '#b8c0c8', metalness: 0.75, roughness: 0.28 }),
    );
    churn.position.set(136, 33, -88);
    this.desertGroup.add(studioFloor, studioWall, backdrop, cactusL, cactusSmall, churn);
    this.scene.add(this.desertGroup);

    // 4. Electric-Blue Neon Light-Tube Studio
    const blueFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#0c2464', roughness: 0.35 }),
    );
    blueFloor.rotation.x = -Math.PI / 2;
    const blueBack = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 560),
      new THREE.MeshBasicMaterial({ color: '#1b5ce0' }),
    );
    blueBack.position.set(0, 280, -280);
    const tubeMat = new THREE.MeshBasicMaterial({ color: '#f2fbff' });
    for (const tx of [-235, -120, 120, 235]) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 420, 8), tubeMat);
      tube.position.set(tx, 210, -215);
      this.blueGroup.add(tube);
    }
    for (const dx of [-135, 135]) {
      const dancer = makeDancerProxy('#161820', '#d6a488');
      dancer.position.set(dx, 0, -95);
      this.blueGroup.add(dancer);
      this.blueDancers.push(dancer);
    }
    this.blueGroup.add(blueFloor, blueBack);
    this.scene.add(this.blueGroup);

    // 5. Backstage Vanity Mirror
    const vanFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1200),
      new THREE.MeshStandardMaterial({ color: '#1a100c', roughness: 0.75 }),
    );
    vanFloor.rotation.x = -Math.PI / 2;
    const vanWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 480),
      new THREE.MeshStandardMaterial({ color: '#381214', roughness: 0.85 }),
    );
    vanWall.position.set(0, 240, -250);
    const vanTable = new THREE.Mesh(
      new THREE.BoxGeometry(280, 74, 72),
      new THREE.MeshStandardMaterial({ color: '#2a1812', roughness: 0.5 }),
    );
    vanTable.position.set(0, 37, -145);
    const mirrorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(210, 165, 10),
      new THREE.MeshStandardMaterial({ color: '#c49844', metalness: 0.6, roughness: 0.35 }),
    );
    mirrorFrame.position.set(0, 158, -176);
    const mirrorGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(190, 145),
      new THREE.MeshStandardMaterial({ color: '#463228', metalness: 0.85, roughness: 0.12 }),
    );
    mirrorGlass.position.set(0, 158, -170);
    for (let i = 0; i < 6; i++) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(5 + (i % 2) * 2, 6, 18 + (i % 3) * 6, 10),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#f0c458' : '#e08898', roughness: 0.2, metalness: 0.4 }),
      );
      bottle.position.set(-78 + i * 30, 84, -124);
      this.vanityGroup.add(bottle);
    }
    this.vanityGroup.add(vanFloor, vanWall, vanTable, mirrorFrame, mirrorGlass);
    this.scene.add(this.vanityGroup);

    // Two physical female voices: Lead Vocal & Backing Harmony Choir
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      redDress,
      skinFair,
    );
    this.choir = new VideoFigure(
      choirModel,
      choirTrack,
      this.props,
      this.scene,
      velvetBlue,
      '#dca88e',
    );

    const hairMat = new THREE.MeshStandardMaterial({ color: hairCopper, roughness: 0.72 });
    const leadHair = new THREE.Mesh(
      new THREE.SphereGeometry(20, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
      hairMat,
    );
    leadHair.position.set(0, 155, -3);
    const leadBangs = new THREE.Mesh(new THREE.BoxGeometry(28, 9, 10), hairMat);
    leadBangs.position.set(0, 161, 13);
    this.lead.root.add(leadHair, leadBangs);

    const choirHair = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 24, 46, 12),
      new THREE.MeshStandardMaterial({ color: '#422014', roughness: 0.78 }),
    );
    choirHair.position.set(0, 144, -6);
    this.choir.root.add(choirHair);

    this.resize(1280, 720);
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
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

    // Song pulse (~118 BPM country-pop disco stomp)
    const beat = t * (118 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.5);
    const bounce = Math.abs(Math.sin(beat));

    const isRibbon = view === 'cm-ribbon' || view === 'wide';
    const isClub = view === 'cm-club';
    const isDesert = view === 'cm-desert' || view === 'cm-lead';
    const isBlue = view === 'cm-blue' || view === 'cm-choir';
    const isVanity = view === 'cm-vanity';

    this.ribbonGroup.visible = isRibbon;
    this.clubGroup.visible = isClub;
    this.desertGroup.visible = isDesert;
    this.blueGroup.visible = isBlue;
    this.vanityGroup.visible = isVanity;

    // Animated props
    this.scissorsGroup.rotation.z = Math.sin(beat * 0.5) * 0.18;
    this.coinMascot.rotation.y = Math.sin(beat * 0.25) * 0.22;
    this.dogMascot.position.y = bounce * 6;
    this.discoBall.rotation.y = t * 0.7;
    for (let i = 0; i < this.blueDancers.length; i++) {
      this.blueDancers[i].position.y = Math.abs(Math.sin(beat + i * Math.PI * 0.5)) * 10;
      this.blueDancers[i].rotation.y = Math.sin(beat * 0.5 + i) * 0.28;
    }

    // Lighting per set
    if (isRibbon) {
      this.scene.background = new THREE.Color('#dfe4ea');
      this.keyLight.color.set('#ffffff');
      this.fillLight.color.set('#fff2dc');
      this.rimLight.color.set('#9ec6f2');
    } else if (isClub) {
      this.scene.background = new THREE.Color('#220406');
      this.keyLight.color.set('#ff8e72');
      this.fillLight.color.set('#c41c24');
      this.rimLight.color.set('#ffd288');
    } else if (isDesert) {
      this.scene.background = new THREE.Color('#e8c8b6');
      this.keyLight.color.set('#fff0d2');
      this.fillLight.color.set('#f4a878');
      this.rimLight.color.set('#ffd89c');
    } else if (isBlue) {
      this.scene.background = new THREE.Color('#0c3498');
      this.keyLight.color.set('#d2e8ff');
      this.fillLight.color.set(neonBlue);
      this.rimLight.color.set('#ffffff');
    } else {
      this.scene.background = new THREE.Color('#1c0c08');
      this.keyLight.color.set('#ffc478');
      this.fillLight.color.set('#d87842');
      this.rimLight.color.set('#ffdfb0');
    }

    // Position lead & harmony singer
    const leadSpot: P = isClub
      ? [-24 + sway * 10, bounce * 3, -72]
      : isVanity
      ? [0, 0, -68]
      : [sway * 18, bounce * 4, -22];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.y = isVanity ? -0.18 : sway * 0.16;

    this.choir.root.visible = isBlue || isRibbon || isClub;
    if (isBlue) {
      this.choir.root.position.set(82, bounce * 4, -68);
      this.choir.root.rotation.y = -0.25;
    } else if (isClub) {
      this.choir.root.position.set(86, 0, -112);
      this.choir.root.rotation.y = -0.45;
    } else {
      this.choir.root.position.set(-88, bounce * 2, -105);
      this.choir.root.rotation.y = 0.25;
    }

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -4 + Math.sin(phase) * 14, 22],
      [-52, 18 + lift + Math.sin(phase) * 22, 28],
      [34, -4 - Math.sin(phase) * 14, 22],
      [52, 18 + lift - Math.sin(phase) * 22, 28],
    ];
    this.lead.pose(t, arms(beat, speaker === 'cm-lead' || !speaker ? 22 + bounce * 10 : 8));
    this.choir.pose(t, arms(beat + 0.5, speaker === 'cm-choir' ? 20 : 6));

    // Deterministic cameras
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.35) * 52, 152, 240];
    let target: [number, number, number] = [0, 128, -45];
    let fov = portrait ? 54 : 40;

    switch (view) {
      case 'cm-ribbon':
      case 'wide':
        pos = [Math.sin(t * 0.28) * 58, 148, 250];
        target = [0, 124, -75];
        fov = portrait ? 56 : 42;
        break;
      case 'cm-club':
        pos = [Math.sin(t * 0.26) * 44, 146, 170];
        target = [8, 122, -95];
        fov = portrait ? 54 : 40;
        break;
      case 'cm-desert':
        pos = [Math.sin(t * 0.36) * 60, 148, 220];
        target = [0, 126, -65];
        fov = portrait ? 54 : 40;
        break;
      case 'cm-blue':
        pos = [Math.sin(t * 0.32) * 56, 150, 215];
        target = [0, 132, -65];
        fov = portrait ? 52 : 38;
        break;
      case 'cm-vanity':
        pos = [38 + Math.sin(t * 0.2) * 14, 150, 118];
        target = [0, 138, -110];
        fov = portrait ? 46 : 34;
        break;
      case 'cm-choir':
        pos = [94 + Math.sin(t * 0.35) * 14, 150, 72];
        target = [82, 142, -68];
        fov = portrait ? 42 : 30;
        break;
      case 'cm-lead':
      default:
        pos = [leadSpot[0] + Math.sin(t * 0.42) * 14, 150, 96];
        target = [leadSpot[0], 144, leadSpot[2]];
        fov = portrait ? 40 : 28;
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
    this.signTex?.dispose();
    this.coinTex?.dispose();
    this.desertTex?.dispose();
    this.props.dispose();
  }
}
