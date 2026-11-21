import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type PhoebeId = 'phoebe-audrey';

const oceanDeep = '#1a4966';
const oceanFoam = '#d8e8f0';
const coastSky = '#7ab0cc';
const twilightBlue = '#124a78';
const sunsetOrange = '#d4743b';
const cabinWood = '#4a2614';
const cabinDark = '#211008';
const warmLamp = '#ffcf78';
const fireOrange = '#ff7b24';
const meadowGold = '#b09562';
const lilyPink = '#f5a3c8';
const forestGreen = '#1f4526';
const redwoodBark = '#4d2b1a';
const neonHoodie = '#29e638';
const dollarGreen = '#88c990';
const skinTone = '#e8c4b0';
const blondeHair = '#c49058';
const dressNavy = '#141d29';
const saberCyan = '#6ef2ff';

/**
 * Procedural 3D stage for Audrey Hobert — "Phoebe".
 * Recreates the coastal road-trip & cabin video:
 * Pacific waves & sea stacks, warm wood-paneled cabin with fireplace & bedside lamp,
 * pink-lily gravestone meadow, sunny diner booth, redwood forest & white cargo van,
 * neon-green hoodie river fishing for $100 bills, starry "I LOVE YOU" night sky,
 * twilight blue ocean portrait, dusk beach lightsaber kick, and golden sunset ocean.
 */
export class PhoebeStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 18000);
  readonly props = new VideoProps();

  readonly coastGroup = new THREE.Group();
  readonly cabinGroup = new THREE.Group();
  readonly meadowGroup = new THREE.Group();
  readonly dinerGroup = new THREE.Group();
  readonly forestGroup = new THREE.Group();
  readonly riverGroup = new THREE.Group();
  readonly starsGroup = new THREE.Group();
  readonly twilightGroup = new THREE.Group();
  readonly sunsetGroup = new THREE.Group();

  readonly audrey: VideoFigure;
  readonly hoodieOverlay = new THREE.Group();
  readonly sunglasses = new THREE.Group();
  readonly fishingRod = new THREE.Group();
  readonly lightsaber = new THREE.Group();
  readonly paperPages = new THREE.Group();

  readonly waveStrips: THREE.Mesh[] = [];
  readonly fireFlames: THREE.Mesh[] = [];
  readonly starPoints: THREE.Mesh[] = [];
  readonly floatingBill: THREE.Mesh;
  readonly vanGroup = new THREE.Group();
  readonly sunsetDisc: THREE.Mesh;

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(readonly audreyModel: VoiceModel, readonly audreyTrack: TeleTrack) {
    this.scene.background = new THREE.Color(coastSky);
    this.scene.add(
      this.coastGroup,
      this.cabinGroup,
      this.meadowGroup,
      this.dinerGroup,
      this.forestGroup,
      this.riverGroup,
      this.starsGroup,
      this.twilightGroup,
      this.sunsetGroup
    );

    this.buildCoast();
    this.buildCabin();
    this.buildMeadow();
    this.buildDiner();
    this.buildForest();
    this.floatingBill = this.buildRiver();
    this.buildStars();
    this.buildTwilight();
    this.sunsetDisc = this.buildSunset();

    this.audrey = new VideoFigure(audreyModel, audreyTrack, this.props, this.scene, dressNavy, skinTone);
    this.audrey.head.scene.scale.setScalar(2.05);
    this.styleAudrey();

    this.resize(1280, 720);
    this.frame(0, false, 0, 'phoebe-coast', 0);
  }

  private buildCoast() {
    const p = this.props;
    const g = this.coastGroup;
    // Ocean surface & cliff bluff
    p.box(g, 3800, 10, 2600, oceanDeep, [0, -10, -1400]);
    p.box(g, 1600, 120, 700, meadowGold, [0, 50, 20]);
    // Iconic Pacific sea stacks
    p.oval(g, [-480, 140, -1300], [180, 170, 130], '#3e423d');
    p.oval(g, [-240, 110, -1250], [120, 130, 100], '#4a4d46');
    p.oval(g, [520, 95, -1350], [140, 105, 110], '#3d413b');
    // Animated rolling surf lines
    for (let i = 0; i < 8; i++) {
      const m = p.box(g, 2400, 4, 18, oceanFoam, [0, 2, -450 - i * 165]);
      Object.assign(m.material, { transparent: true, opacity: 0.55 });
      this.waveStrips.push(m);
    }
  }

  private buildCabin() {
    const p = this.props;
    const g = this.cabinGroup;
    // Wood-paneled cabin walls & floor
    p.box(g, 1400, 10, 1200, '#2e170c', [0, -5, -100]);
    p.box(g, 1400, 620, 14, cabinWood, [0, 305, -420]);
    for (let i = -9; i <= 9; i++) {
      p.box(g, 4, 620, 18, cabinDark, [i * 72, 305, -412]);
    }
    // Cozy cabin bed with white pillows & wooden headboard
    p.box(g, 300, 60, 210, '#6e4e3d', [-210, 35, -240]);
    p.box(g, 280, 26, 195, '#d6cfc4', [-210, 70, -240]);
    p.oval(g, [-280, 92, -260], [45, 22, 34], '#f2ede4');
    p.box(g, 24, 175, 220, '#3b1e0e', [-355, 92, -240]);
    // White lace cabin window curtains
    p.box(g, 220, 200, 10, '#0a121c', [-200, 260, -408]);
    p.box(g, 60, 200, 14, '#e6dfd3', [-290, 260, -400]);
    p.box(g, 60, 200, 14, '#e6dfd3', [-110, 260, -400]);
    // Glowing warm vintage bedside lamp
    p.box(g, 110, 95, 90, '#361b0d', [220, 48, -280]);
    p.tube(g, [220, 95, -280], [220, 138, -280], 10, '#d8d2c7');
    p.mesh(g, new THREE.CylinderGeometry(20, 44, 48, 18), [220, 162, -280], warmLamp);
    // Warm fireplace hearth with animated flames
    p.box(g, 220, 190, 65, '#3b241c', [260, 95, -390]);
    p.box(g, 140, 120, 24, '#120804', [260, 65, -358]);
    for (let i = 0; i < 5; i++) {
      const fl = p.mesh(g, new THREE.ConeGeometry(16 - i * 2, 52 + i * 8, 8), [230 + i * 15, 42, -350], i % 2 ? fireOrange : '#ffd15c');
      this.fireFlames.push(fl);
    }
  }

  private buildMeadow() {
    const p = this.props;
    const g = this.meadowGroup;
    p.box(g, 2800, 10, 2400, meadowGold, [0, -5, -400]);
    // Pale grey rounded gravestone
    p.box(g, 92, 145, 22, '#c6cbd0', [120, 72, -120]);
    p.oval(g, [120, 144, -120], [46, 26, 11], '#c6cbd0');
    // Blooming pink lilies beside gravestone (0:55 frame!)
    for (let i = 0; i < 16; i++) {
      const x = 155 + (i % 4) * 28 + Math.sin(i * 2.1) * 10;
      const z = -95 + Math.floor(i / 4) * 24;
      p.tube(g, [x, 0, z], [x + Math.sin(i) * 6, 48 + (i % 3) * 14, z], 2.2, '#426b36');
      p.oval(g, [x + Math.sin(i) * 6, 54 + (i % 3) * 14, z], [11, 8, 11], i % 2 ? lilyPink : '#ffd4e8');
    }
  }

  private buildDiner() {
    const p = this.props;
    const g = this.dinerGroup;
    p.box(g, 1400, 10, 1200, '#54463b', [0, -5, -100]);
    p.box(g, 1400, 620, 14, '#7d6c5a', [0, 305, -400]);
    // Big bright sunny diner windows
    p.box(g, 520, 280, 16, '#b8e0f5', [-240, 270, -390]);
    p.box(g, 420, 280, 16, '#c4e6f7', [290, 270, -390]);
    // Red-topped diner table with coffee mug & water glass (1:15 frame!)
    p.box(g, 240, 12, 130, '#8f2525', [0, 88, 25]);
    p.tube(g, [0, 0, 25], [0, 86, 25], 8, '#30343a');
    p.mesh(g, new THREE.CylinderGeometry(11, 9, 20, 14), [-34, 104, 28], '#f5f2eb');
    p.mesh(g, new THREE.CylinderGeometry(8, 7, 26, 14), [22, 107, 15], '#cfe8f5');
  }

  private buildForest() {
    const p = this.props;
    const g = this.forestGroup;
    // Forest floor & asphalt curving highway
    p.box(g, 3200, 10, 2800, '#2a3b20', [0, -5, -600]);
    p.box(g, 420, 12, 2800, '#2a2d33', [0, 0, -600]);
    p.box(g, 8, 13, 2800, '#e3b842', [-14, 1, -600]);
    p.box(g, 8, 13, 2800, '#e3b842', [14, 1, -600]);
    // Towering California redwood trunks & green canopy
    for (let i = 0; i < 16; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (290 + (i % 4) * 145);
      const z = -140 - Math.floor(i / 2) * 220;
      p.tube(g, [x, 0, z], [x, 950, z], 44 + (i % 3) * 14, redwoodBark);
      p.oval(g, [x, 620, z], [160, 120, 150], forestGreen);
    }
    // White cargo van (appears at 1:30, 1:50, 2:50, 3:15!)
    g.add(this.vanGroup);
    this.vanGroup.position.set(-140, 0, -480);
    p.box(this.vanGroup, 190, 135, 340, '#eef2f5', [0, 88, 0]);
    p.box(this.vanGroup, 168, 52, 8, '#1d2d3b', [0, 112, 172]);
    p.oval(this.vanGroup, [-66, 62, 173], [14, 10, 5], '#fff5b8');
    p.oval(this.vanGroup, [66, 62, 173], [14, 10, 5], '#fff5b8');
    for (const sx of [-92, 92]) {
      for (const sz of [-105, 105]) {
        p.mesh(this.vanGroup, new THREE.CylinderGeometry(28, 28, 18, 16), [sx, 28, sz], '#181a1f').rotation.z = Math.PI / 2;
      }
    }
  }

  private buildRiver(): THREE.Mesh {
    const p = this.props;
    const g = this.riverGroup;
    // Sandy riverbank + shimmering green-blue river
    p.box(g, 3200, 10, 1600, '#c2b59b', [0, -5, 150]);
    p.box(g, 3200, 8, 1800, '#2a4d45', [0, -7, -950]);
    // Distant forest trees across river
    for (let i = -8; i <= 8; i++) {
      p.oval(g, [i * 190, 160, -1400], [115, 220, 110], i % 2 ? forestGreen : '#2a5932');
    }
    // Floating $100 dollar bill on the water (2:10-2:15 frame!)
    const bill = p.box(g, 48, 2, 24, dollarGreen, [0, 4, -220]);
    return bill;
  }

  private buildStars() {
    const p = this.props;
    const g = this.starsGroup;
    // Ambient starfield
    for (let i = 0; i < 90; i++) {
      const sx = Math.sin(i * 12.7) * 900;
      const sy = 140 + ((i * 53) % 520);
      const sz = -650 - (i % 5) * 40;
      const st = p.oval(g, [sx, sy, sz], [3, 3, 3], '#d8e8ff');
      this.starPoints.push(st);
    }
    // Iconic "I LOVE YOU" star constellation (2:40 frame!)
    const glyphDots: [number, number][] = [
      // I
      [-260, 0], [-260, 20], [-260, 40], [-260, 60],
      // L
      [-190, 60], [-190, 40], [-190, 20], [-190, 0], [-170, 0], [-150, 0],
      // O
      [-115, 15], [-115, 45], [-95, 60], [-75, 45], [-75, 15], [-95, 0],
      // V
      [-40, 60], [-30, 30], [-20, 0], [-10, 30], [0, 60],
      // E
      [35, 0], [35, 30], [35, 60], [55, 60], [55, 30], [55, 0],
      // Y
      [115, 60], [130, 35], [145, 60], [130, 15], [130, 0],
      // O
      [180, 15], [180, 45], [200, 60], [220, 45], [220, 15], [200, 0],
      // U
      [255, 60], [255, 30], [255, 10], [275, 0], [295, 10], [295, 30], [295, 60],
    ];
    for (const [gx, gy] of glyphDots) {
      const st = p.oval(g, [gx, 240 + gy, -520], [5.5, 5.5, 5.5], '#ffffff');
      this.starPoints.push(st);
    }
  }

  private buildTwilight() {
    const p = this.props;
    const g = this.twilightGroup;
    p.box(g, 3600, 10, 2600, twilightBlue, [0, -8, -1100]);
    p.box(g, 3600, 900, 10, '#103c66', [0, 440, -1900]);
    // Dusk beach sand
    p.box(g, 2800, 14, 900, '#2a333d', [0, -2, 100]);
  }

  private buildSunset(): THREE.Mesh {
    const p = this.props;
    const g = this.sunsetGroup;
    p.box(g, 3600, 10, 2600, '#784836', [0, -8, -1200]);
    p.box(g, 3600, 900, 10, sunsetOrange, [0, 440, -1900]);
    // Glowing golden sun setting right on the ocean horizon (3:40 frame!)
    return p.mesh(g, new THREE.CircleGeometry(72, 32), [140, 140, -1650], '#fff3b8');
  }

  private styleAudrey() {
    const p = this.props;
    const f = this.audrey;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // Long flowing strawberry-blonde hair
    f.hair.begin();
    for (let row = -9; row <= 9; row++) {
      const z = row * 0.85 * k;
      const a = B(-6, 20);
      const b = B(7, 17);
      p.line(f.hair, [[a.x, a.y + 3 * k, z], [a.x + 4 * k, a.y + 5 * k, z], [b.x, b.y, z]], blondeHair, 3.2);
    }
    // Long flowing hair strands down past shoulders
    for (let i = -4; i <= 4; i++) {
      p.line(f.hair, [[i * 5, 22, -10], [i * 6.5, -10, -14], [i * 7, -46, -15], [i * 7.5, -72, -14]], blondeHair, 4.2);
    }
    f.hair.end();

    // Neon lime-green zip hoodie overlay (shown on highway & river fishing shots!)
    f.root.add(this.hoodieOverlay);
    p.box(this.hoodieOverlay, 44, 68, 28, neonHoodie, [0, -34, 0]);
    // Pulled-up neon hood framing her head
    p.mesh(this.hoodieOverlay, new THREE.TorusGeometry(23, 6, 8, 20, Math.PI * 1.25), [0, 24, -6], neonHoodie).rotation.z = -Math.PI * 0.125;

    // Dark retro sunglasses (shown on log, fishing $100 bill & redwood walk)
    f.root.add(this.sunglasses);
    for (const sign of [-1, 1]) {
      p.box(this.sunglasses, 16, 10, 4, '#111418', [sign * 10, 26, 20]);
    }
    p.box(this.sunglasses, 6, 2, 4, '#111418', [0, 26, 20]);

    // Fishing rod & hooked $100 bill prop
    f.root.add(this.fishingRod);
    p.tube(this.fishingRod, [34, -8, 28], [130, 82, 130], 2, '#9c6e3b');
    p.tube(this.fishingRod, [130, 82, 130], [130, -35, 130], 0.7, '#dce8e4');
    p.box(this.fishingRod, 34, 18, 2, dollarGreen, [130, -40, 130]);

    // Glowing cyan/blue lightsaber prop (3:25 dusk beach kick!)
    f.root.add(this.lightsaber);
    p.tube(this.lightsaber, [36, 4, 24], [52, 18, 36], 3.5, '#3b424c');
    p.tube(this.lightsaber, [52, 18, 36], [156, 98, 92], 3.8, '#ffffff');
    const glow = p.tube(this.lightsaber, [52, 18, 36], [156, 98, 92], 7.5, saberCyan);
    Object.assign(glow.material, { transparent: true, opacity: 0.45, depthWrite: false });

    // Reading papers in cabin (0:35)
    f.root.add(this.paperPages);
    p.box(this.paperPages, 46, 36, 2, '#f4efe6', [0, -18, 38]);
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.audrey.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, _speaker?: CharacterId) {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const aspect = this.width / this.height;
    const narrow = aspect < 1;
    const sway = Math.sin(t * 2.1);
    const gentle = Math.cos(t * 1.4);

    const isCoast = view === 'phoebe-coast' || view === 'phoebe-cliff';
    const isCabin = view === 'phoebe-cabin' || view === 'phoebe-bed' || view === 'phoebe-fire';
    const isMeadow = view === 'phoebe-meadow';
    const isDiner = view === 'phoebe-diner';
    const isForest = view === 'phoebe-forest' || view === 'phoebe-highway';
    const isRiver = view === 'phoebe-river' || view === 'phoebe-cash';
    const isStars = view === 'phoebe-stars';
    const isTwilight = view === 'phoebe-twilight' || view === 'phoebe-saber' || view === 'phoebe-audrey';
    const isSunset = view === 'phoebe-sunset';

    this.coastGroup.visible = isCoast;
    this.cabinGroup.visible = isCabin;
    this.meadowGroup.visible = isMeadow;
    this.dinerGroup.visible = isDiner;
    this.forestGroup.visible = isForest;
    this.riverGroup.visible = isRiver;
    this.starsGroup.visible = isStars;
    this.twilightGroup.visible = isTwilight;
    this.sunsetGroup.visible = isSunset;

    const bg = isCoast ? coastSky
      : isCabin ? '#1b0d06'
      : isMeadow ? '#c2b699'
      : isDiner ? '#b8d7e8'
      : isForest ? '#1f3622'
      : isRiver ? '#688c7a'
      : isStars ? '#03060d'
      : isSunset ? '#b55628'
      : '#0c2c4d';
    this.scene.background = new THREE.Color(bg);

    // Animate ocean surf
    if (isCoast) {
      this.waveStrips.forEach((m, i) => {
        m.position.z = -400 - (((i * 165 - t * 65) % 1320) + 1320) % 1320;
      });
    }
    // Animate cabin fire
    if (isCabin) {
      this.fireFlames.forEach((fl, i) => {
        fl.scale.y = 0.8 + Math.abs(Math.sin(t * 9 + i * 1.3)) * 0.55;
      });
    }
    // Animate highway van gently approaching
    if (isForest) {
      this.vanGroup.position.z = -520 + Math.sin(t * 0.35) * 90;
    }
    // Animate floating $100 bill on river
    if (isRiver) {
      this.floatingBill.position.x = Math.sin(t * 1.1) * 45;
      this.floatingBill.rotation.y = Math.sin(t * 0.9) * 0.4;
    }
    // Twinkle stars
    if (isStars) {
      this.starPoints.forEach((st, i) => {
        const s = 0.75 + Math.sin(t * 4 + i * 0.9) * 0.35;
        st.scale.setScalar(s);
      });
    }
    // Slowly sink sunset disc
    if (isSunset) {
      this.sunsetDisc.position.y = Math.max(85, 165 - (t - 215) * 3.5);
    }

    // Outfit & prop switches per scene
    const wearHoodie = view === 'phoebe-highway' || view === 'phoebe-river' || view === 'phoebe-cash';
    const wearShades = view === 'phoebe-forest' || view === 'phoebe-cash';
    const holdRod = view === 'phoebe-river' || view === 'phoebe-cash';
    const holdSaber = view === 'phoebe-saber';
    const holdPapers = view === 'phoebe-cabin';

    this.hoodieOverlay.visible = wearHoodie;
    this.sunglasses.visible = wearShades;
    this.fishingRod.visible = holdRod;
    this.lightsaber.visible = holdSaber;
    this.paperPages.visible = holdPapers;

    // Position Audrey cleanly in each environment
    this.audrey.root.visible = !isStars;
    this.audrey.root.rotation.set(0, 0, 0);
    if (view === 'phoebe-bed') {
      this.audrey.root.position.set(-180, 128, -210);
      this.audrey.root.rotation.set(-0.35, 0.2, 0);
    } else if (view === 'phoebe-diner') {
      this.audrey.root.position.set(0, 140, -25);
    } else if (view === 'phoebe-meadow') {
      this.audrey.root.position.set(-35, 118, -80);
    } else if (view === 'phoebe-saber') {
      this.audrey.root.position.set(-15, 148 + Math.abs(sway) * 6, -40);
      this.audrey.root.rotation.set(0, 0.2, Math.sin(t * 3.2) * 0.08);
    } else if (view === 'phoebe-sunset') {
      this.audrey.root.position.set(0, 138, -60);
      this.audrey.root.rotation.set(0, Math.PI * 0.08, 0);
    } else {
      this.audrey.root.position.set(0, 146 + Math.abs(sway) * 2, -45);
      this.audrey.root.rotation.set(0, sway * 0.06, gentle * 0.02);
    }

    // Expressive arms
    let arms: [P, P, P, P] = [
      [-28, -16 + sway * 6, 18],
      [-40, -10 + sway * 10, 28],
      [28, -16 - sway * 6, 18],
      [40, -10 - sway * 10, 28],
    ];
    if (view === 'phoebe-cliff') {
      // Arms raised wide overlooking the ocean bluff (1:35!)
      arms = [[-42, 16, 12], [-72, 48, 16], [42, 16, 12], [72, 48, 16]];
    } else if (holdSaber) {
      arms = [[-36, 4, 18], [-58, 22, 24], [32, 6, 22], [46, 14, 34]];
    } else if (holdRod) {
      arms = [[-22, -12, 22], [12, -10, 32], [28, -10, 22], [36, -6, 30]];
    } else if (holdPapers) {
      arms = [[-24, -18, 24], [-20, -18, 36], [24, -18, 24], [20, -18, 36]];
    } else if (intensity > 0.85) {
      arms = [[-32, -6 + sway * 12, 20], [-48, 12 + sway * 16, 30], [32, -6 - sway * 12, 20], [48, 12 - sway * 16, 30]];
    }
    this.audrey.pose(t, arms, view === 'phoebe-diner' || view === 'phoebe-meadow');

    // Camera framing per shot
    let camPos: P = [0, 170, 245];
    let camLook: P = [0, 158, -45];
    let fov = narrow ? 46 : 36;

    switch (view) {
      case 'phoebe-coast':
        camPos = [Math.sin(t * 0.2) * 55, 195, 290];
        camLook = [0, 145, -350];
        fov = narrow ? 50 : 40;
        break;
      case 'phoebe-cliff':
        camPos = [0, 185, 320];
        camLook = [0, 155, -260];
        fov = narrow ? 50 : 40;
        break;
      case 'phoebe-cabin':
        camPos = [0, 166, 195];
        camLook = [0, 156, -70];
        fov = narrow ? 44 : 34;
        break;
      case 'phoebe-fire':
        camPos = [95, 145, 155];
        camLook = [130, 115, -280];
        fov = narrow ? 46 : 36;
        break;
      case 'phoebe-bed':
        camPos = [-65, 175, 45];
        camLook = [-180, 138, -210];
        fov = narrow ? 44 : 34;
        break;
      case 'phoebe-meadow':
        camPos = [25, 148, 210];
        camLook = [45, 110, -100];
        fov = narrow ? 46 : 36;
        break;
      case 'phoebe-diner':
        camPos = [85, 164, 185];
        camLook = [0, 142, -15];
        fov = narrow ? 44 : 34;
        break;
      case 'phoebe-forest':
      case 'phoebe-highway':
        camPos = [35, 172, 260];
        camLook = [-15, 152, -180];
        fov = narrow ? 48 : 38;
        break;
      case 'phoebe-river':
        camPos = [120, 168, 240];
        camLook = [15, 135, -130];
        fov = narrow ? 48 : 38;
        break;
      case 'phoebe-cash':
        camPos = [35, 166, 155];
        camLook = [22, 158, -30];
        fov = narrow ? 40 : 30;
        break;
      case 'phoebe-stars':
        camPos = [0, 210, 120];
        camLook = [0, 275, -520];
        fov = narrow ? 56 : 46;
        break;
      case 'phoebe-saber':
        camPos = [20, 168, 285];
        camLook = [30, 158, -40];
        fov = narrow ? 50 : 40;
        break;
      case 'phoebe-sunset':
        camPos = [0, 165, 250];
        camLook = [30, 152, -300];
        fov = narrow ? 46 : 36;
        break;
      case 'phoebe-twilight':
      case 'phoebe-audrey':
      case 'wide':
      default:
        camPos = [0, 170, 145];
        camLook = [0, 166, -45];
        fov = narrow ? 38 : 28;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.audrey.root.visible) {
      this.audrey.update(t, playing, this.camera, dt, reset);
    }
  }

  dispose() {
    this.audrey.dispose();
    this.props.dispose();
  }
}
