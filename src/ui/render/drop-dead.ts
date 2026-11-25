import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { DropId, DropView } from '../../scene/drop-dead.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type SetName = 'card' | 'bar' | 'bedroom' | 'gallery' | 'staircase' | 'salon' | 'garden' | 'courtyard';
type Wardrobe = 'pearl-white' | 'chloe' | 'chloe-headphones' | 'chloe-guitar' | 'bandmate-guitar';

type Shot = {
  set: SetName;
  look: Wardrobe;
  aim: Point;
  offset: Point;
  leadAt: Point;
  harmAt?: Point;
  wide?: boolean;
  hideCast?: boolean;
};

function shot(
  set: SetName,
  look: Wardrobe,
  aim: Point,
  offset: Point,
  leadAt: Point,
  harmAt?: Point,
  wide = false,
  hideCast = false,
): Shot {
  return { set, look, aim, offset, leadAt, harmAt, wide, hideCast };
}

const DEFAULT_SHOT: Shot = shot('gallery', 'chloe', [0, 134, 0], [0, 8, 305], [0, 152, 14]);

const CAMERA: Record<DropView | 'wide', Shot> = {
  wide: shot('courtyard', 'chloe', [0, 132, 0], [0, 14, 385], [0, 152, 16], [88, 150, 8], true),
  'drop-card-intro': shot('card', 'pearl-white', [0, 150, 0], [0, 0, 310], [0, 152, 0], undefined, true, true),
  'drop-bar-dance': shot('bar', 'pearl-white', [0, 136, 8], [0, 8, 315], [0, 152, 16], [86, 148, -6], true),
  'drop-bar-booth': shot('bar', 'pearl-white', [8, 142, 12], [0, 4, 245], [8, 152, 18]),
  'drop-bar-close': shot('bar', 'pearl-white', [0, 152, 16], [-10, 2, 195], [0, 154, 20]),
  'drop-laptop': shot('bedroom', 'chloe-headphones', [0, 126, 18], [0, 6, 225], [0, 146, 16]),
  'drop-bed-wide': shot('bedroom', 'chloe-headphones', [0, 134, 8], [0, 10, 345], [0, 150, 16], [-92, 148, 4], true),
  'drop-ceiling': shot('bedroom', 'chloe-headphones', [0, 154, 12], [0, -16, 225], [0, 152, 16]),
  'drop-gallery-bench': shot('gallery', 'chloe', [-10, 130, 10], [0, 10, 335], [-14, 150, 16], [88, 148, 6], true),
  'drop-gallery-columns': shot('gallery', 'chloe', [8, 136, 10], [16, 8, 295], [8, 150, 16]),
  'drop-gallery-leap': shot('gallery', 'chloe', [0, 138, 10], [-14, 10, 335], [0, 158, 16], [-92, 148, 6], true),
  'drop-gallery-lean': shot('gallery', 'chloe', [0, 148, 16], [0, 6, 215], [0, 152, 20]),
  'drop-stairs-rail': shot('staircase', 'chloe', [8, 136, 10], [-16, 8, 295], [10, 152, 16], [-86, 148, 6], true),
  'drop-stairs-leap': shot('staircase', 'chloe', [0, 140, 10], [0, 10, 335], [0, 158, 16], [92, 150, 8], true),
  'drop-stairs-slide': shot('staircase', 'chloe', [6, 138, 12], [18, 4, 275], [6, 150, 16]),
  'drop-stairs-heart': shot('staircase', 'chloe', [0, 146, 16], [0, 4, 215], [0, 152, 20]),
  'drop-guitar-trio': shot('salon', 'chloe-guitar', [0, 134, 10], [0, 8, 330], [0, 152, 18], [86, 150, 10], true),
  'drop-headphones-dusk': shot('garden', 'chloe-headphones', [0, 146, 16], [8, 4, 215], [0, 152, 20]),
  'drop-guitar-solo': shot('salon', 'chloe-guitar', [0, 138, 14], [-10, 6, 260], [0, 152, 18], [92, 150, 8]),
  'drop-bed-lounge': shot('bedroom', 'chloe', [-8, 136, 12], [12, 8, 265], [-8, 148, 16]),
  'drop-garden-steps': shot('garden', 'chloe-headphones', [0, 132, 8], [0, 10, 335], [0, 150, 16], [88, 148, 6], true),
  'drop-swan': shot('garden', 'chloe-headphones', [6, 128, 6], [8, 8, 310], [-48, 148, 14], [96, 148, 8], true),
  'drop-gold-gate': shot('courtyard', 'chloe', [0, 132, 10], [0, 8, 325], [0, 150, 18], [92, 148, 8], true),
  'drop-courtyard-kneel': shot('courtyard', 'chloe', [0, 136, 14], [0, 8, 250], [0, 144, 18]),
  'drop-courtyard-spin': shot('courtyard', 'chloe', [0, 134, 10], [0, 10, 340], [0, 152, 16], [-92, 148, 8], true),
  'drop-parapet-dusk': shot('garden', 'chloe-headphones', [6, 144, 14], [-14, 6, 240], [6, 150, 18]),
  'drop-steps-sprawl': shot('courtyard', 'chloe', [0, 108, 8], [0, 22, 275], [0, 136, 18]),
  'drop-steps-wide': shot('courtyard', 'chloe', [0, 124, 0], [0, 28, 435], [0, 136, 14], undefined, true),
  'drop-card-outro': shot('card', 'chloe', [0, 150, 0], [0, 0, 310], [0, 152, 0], undefined, true, true),
};

const PALETTE = {
  cardPink: '#eebac7',
  cardStripe: '#e5aebc',
  cardOrnament: '#fbf7f9',
  barBg: '#1c1228',
  barCrimson: '#3c1524',
  barPurple: '#5d2f86',
  barAmber: '#f2a444',
  bedroomCrimson: '#591b24',
  bedroomGold: '#d6ab4d',
  woodParquet: '#7d5636',
  woodDark: '#4f3522',
  velvetRed: '#8b1e2e',
  limestone: '#d7cfc4',
  limestoneDark: '#afa598',
  salonGold: '#c99c3e',
  duskSky: '#434b6e',
  nightCourtyard: '#272e47',
  palaceBrick: '#b9694d',
  palaceAmber: '#f6b95e',
  chloeBlue: '#6f85ad',
  chloeBlush: '#d8aaa6',
  bloomers: '#f3ece2',
  hotPink: '#ef5496',
  pearlWhite: '#f3f0f7',
  hairDark: '#261916',
} as const;

type CostumeParts = {
  hairBlobs: THREE.Mesh[];
  skirtOuter: THREE.Mesh;
  skirtRuffle: THREE.Mesh;
  bloomers: THREE.Mesh;
  shoulderRuffles: THREE.Mesh[];
  pearls: THREE.Mesh[];
  socks: THREE.Mesh[];
  headphones: THREE.Group;
  guitar: THREE.Group;
};

type MiniProxy = {
  root: THREE.Group;
  arms: THREE.Mesh[];
  phase: number;
};

export class DropDeadStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 3800);
  readonly props = new VideoProps();
  readonly sets: Record<SetName, THREE.Group> = {
    card: new THREE.Group(),
    bar: new THREE.Group(),
    bedroom: new THREE.Group(),
    gallery: new THREE.Group(),
    staircase: new THREE.Group(),
    salon: new THREE.Group(),
    garden: new THREE.Group(),
    courtyard: new THREE.Group(),
  };
  readonly figures: Record<DropId, VideoFigure>;
  private readonly costumes = new Map<VideoFigure, CostumeParts>();

  // Dynamic set elements
  private readonly barLights: THREE.Mesh[] = [];
  private readonly barPatrons: MiniProxy[] = [];
  private readonly laptopGlowMat = new THREE.MeshBasicMaterial({ color: '#8f44fd' });
  private readonly ceilingChandelier = new THREE.Group();
  private readonly salonThirdPlayer: MiniProxy;
  private readonly swanGroup = new THREE.Group();
  private readonly courtyardGate = new THREE.Group();

  private time = -1;
  private epoch = -1;

  constructor(lead: Actor, harmony: Actor) {
    this.scene.background = new THREE.Color(PALETTE.cardPink);
    this.scene.fog = new THREE.Fog(PALETTE.cardPink, 760, 2400);
    this.scene.add(...Object.values(this.sets));

    this.buildCardSet();
    this.buildBarSet();
    this.buildBedroomSet();
    this.buildGallerySet();
    this.buildStaircaseSet();
    this.buildSalonSet();
    this.buildGardenSet();
    this.buildCourtyardSet();

    this.salonThirdPlayer = this.makeBandProxy(this.sets.salon, [-88, 8, 8], 1.08, '#eadfce', '#3d2a20', 1.4, true);

    this.figures = {
      'drop-lead': this.makeFigure(lead, '#dfb29b'),
      'drop-harmony': this.makeFigure(harmony, '#d8aa92'),
    };
    this.frame(0, false, 0, 'drop-card-intro', 0);
  }

  /** 6-face vertex-shaded slab matching Codex's crisp architectural Three.js look. */
  private slab(g: THREE.Object3D, at: Point, size: Point, color: string): THREE.Mesh {
    const mesh = this.props.box(g, ...size, color, at);
    const colors: number[] = [];
    for (const shade of [0.76, 0.65, 1.14, 0.56, 1.0, 0.72]) {
      const { r, g: green, b } = new THREE.Color(color).multiplyScalar(shade);
      for (let v = 0; v < 4; v++) colors.push(r, green, b);
    }
    mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.set('#ffffff');
    mat.vertexColors = true;
    return mesh;
  }

  /** Builds a glowing Versailles crystal/brass chandelier. */
  private addChandelier(parent: THREE.Object3D, at: Point, scale = 1): THREE.Group {
    const g = new THREE.Group();
    g.position.set(...at);
    g.scale.setScalar(scale);
    parent.add(g);

    this.props.tube(g, [0, 42, 0], [0, 6, 0], 2.2, '#c89e40');
    this.props.oval(g, [0, 4, 0], [10, 8, 10], '#d8ae4c');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rx = Math.cos(a) * 28;
      const rz = Math.sin(a) * 28;
      this.props.tube(g, [0, 4, 0], [rx, 10, rz], 1.6, '#d4a846');
      this.props.oval(g, [rx, 16, rz], [3.8, 6.2, 3.8], '#fff4cc');
      this.props.oval(g, [rx * 0.65, -4, rz * 0.65], [2.6, 5.2, 2.6], '#f8e9c0');
    }
    return g;
  }

  /** Builds the hot-pink Fender-style electric guitar with crisp white pickguard & maple neck. */
  private makePinkGuitar(parent: THREE.Object3D, at: Point): THREE.Group {
    const g = new THREE.Group();
    g.position.set(...at);
    g.rotation.z = 0.34;
    parent.add(g);

    // Double-cutaway hot-pink body + white pickguard + maple neck + headstock
    this.props.oval(g, [-6, -2, 0], [15, 12, 3.5], PALETTE.hotPink);
    this.props.oval(g, [4, 2, 0], [10, 9, 3.5], PALETTE.hotPink);
    this.props.oval(g, [-2, -1, 2.2], [9.5, 7.5, 1.0], '#f7f8fa');
    this.slab(g, [-10, -2, 3.0], [3.5, 7, 1.4], '#b8bec6');
    this.slab(g, [24, 6, 0.5], [38, 4.2, 2.2], '#dfbe8d');
    this.props.oval(g, [45, 8, 0.5], [6.5, 3.8, 1.8], PALETTE.hotPink);
    return g;
  }

  /** 1. Pastel-pink VHS paper/felt card with sculpted angel-wing heart flourishes (spoiler-free!). */
  private buildCardSet(): void {
    const s = this.sets.card;
    this.slab(s, [0, 150, -90], [1100, 680, 12], PALETTE.cardPink);
    // Subtle VHS analog horizontal scan bands
    for (let y = -60; y <= 360; y += 26) {
      this.props.mesh(s, new THREE.PlaneGeometry(1050, 7), [0, y, -82], PALETTE.cardStripe);
    }

    // Upper and lower angel-wing heart ornaments (° · ʚ ♡ ɞ · °)
    for (const cy of [228, 74]) {
      // Center heart
      const hL = this.props.oval(s, [-5.5, cy + 3, -76], [7.5, 9.5, 3], PALETTE.cardOrnament);
      hL.rotation.z = 0.42;
      const hR = this.props.oval(s, [5.5, cy + 3, -76], [7.5, 9.5, 3], PALETTE.cardOrnament);
      hR.rotation.z = -0.42;
      // Scalloped angel wings flanking the heart
      for (const side of [-1, 1]) {
        this.props.oval(s, [side * 24, cy + 4, -76], [10, 6.5, 2.5], PALETTE.cardOrnament);
        this.props.oval(s, [side * 34, cy - 2, -76], [8, 5, 2.5], PALETTE.cardOrnament);
        this.props.oval(s, [side * 50, cy + 5, -76], [3.2, 3.2, 2.5], PALETTE.cardOrnament);
        this.props.oval(s, [side * 64, cy - 1, -76], [2.2, 2.2, 2.5], PALETTE.cardOrnament);
      }
    }
    // Center emblem: coquette white ribbon bow & heart crest (100% spoiler-free!)
    for (const side of [-1, 1]) {
      const loop = this.props.oval(s, [side * 16, 153, -76], [14, 9, 3], PALETTE.cardOrnament);
      loop.rotation.z = side * -0.26;
      const tail = this.props.tube(s, [side * 5, 148, -76], [side * 16, 128, -76], 3.4, PALETTE.cardOrnament);
      tail.scale.z = 0.5;
    }
    this.props.oval(s, [0, 152, -74], [6.5, 6.5, 3.5], '#f6dde4');
  }

  /** 2. Crowded Neon Dive Bar (0:05.5 - 0:48.5): violet/amber bokeh lights, rainbow bottle grid, patrons. */
  private buildBarSet(): void {
    const s = this.sets.bar;
    this.slab(s, [0, -6, -45], [1100, 14, 240], '#181020');
    this.slab(s, [0, 165, -135], [1100, 380, 18], '#22132e');

    // Wood-paneled booth wainscot + bar counter
    this.slab(s, [0, 48, -120], [880, 108, 12], '#381d28');
    this.slab(s, [-175, 148, -112], [92, 156, 10], '#2c1722');

    // Stained-glass / rainbow bottle light grid on left booth frame (matching 0:28!)
    const bottleCols = ['#f45d4c', '#f5b841', '#4cd480', '#54a4f8', '#d965f4'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const orb = this.props.oval(
          s,
          [-205 + c * 14, 152 + r * 14, -104],
          [4.8, 4.8, 3],
          bottleCols[(r + c) % bottleCols.length]!,
        );
        this.barLights.push(orb);
      }
    }

    // Overhead dreamy string bokeh lights across the ceiling
    const bokehCols = ['#ff9e4a', '#b66dff', '#5899ff', '#ff5c93', '#ffe28a'];
    for (let i = 0; i < 26; i++) {
      const x = -310 + i * 25;
      const y = 232 + Math.sin(i * 1.1) * 26;
      const z = -98 - (i % 3) * 12;
      const b = this.props.oval(s, [x, y, z], [6.5, 6.5, 4], bokehCols[i % bokehCols.length]!);
      this.barLights.push(b);
    }

    // Neon dive-bar star sign on back wall (matching 0:24!)
    this.props.tube(s, [132, 214, -118], [156, 232, -118], 2.0, '#d8b4ff');
    this.props.tube(s, [156, 232, -118], [146, 202, -118], 2.0, '#d8b4ff');
    this.props.tube(s, [128, 224, -118], [162, 214, -118], 2.0, '#d8b4ff');

    // Dancing dive-bar crowd silhouettes behind Olivia
    this.barPatrons.push(
      this.makeBandProxy(s, [-128, 6, -54], 0.96, '#39284f', '#1c1422', 0.2, false),
      this.makeBandProxy(s, [-64, 6, -68], 0.92, '#512b47', '#2b1b24', 1.5, false),
      this.makeBandProxy(s, [72, 6, -64], 0.94, '#2c385c', '#1a1624', 2.6, false),
      this.makeBandProxy(s, [138, 6, -52], 0.96, '#4c2c3d', '#241820', 3.8, false),
    );
  }

  /** 3. Versailles Royal Bedchamber (0:48.5 - 0:83.5): crimson & gold Rococo walls, chandeliers, royal bed & glowing laptop! */
  private buildBedroomSet(): void {
    const s = this.sets.bedroom;
    this.slab(s, [0, -6, -55], [1100, 14, 240], PALETTE.woodDark);
    this.slab(s, [0, 175, -155], [1100, 390, 18], PALETTE.bedroomCrimson);

    // Gold-leaf Rococo boiserie wall frames & pastoral tapestries (matching 1:08-1:18!)
    for (const tx of [-210, 0, 210]) {
      this.slab(s, [tx, 178, -143], [164, 220, 6], PALETTE.bedroomGold);
      this.props.mesh(s, new THREE.PlaneGeometry(144, 198), [tx, 178, -139], tx === 0 ? '#3a2c28' : '#526149');
      // Pastoral painted foliage accents inside side tapestries
      if (tx !== 0) {
        this.props.oval(s, [tx - 24, 195, -137], [28, 34, 2], '#3b4b35');
        this.props.oval(s, [tx + 22, 182, -137], [32, 28, 2], '#6c7c58');
      }
    }

    // White & gold paneled French doors on right
    this.slab(s, [355, 148, -142], [96, 250, 8], '#dfd6c7');
    this.slab(s, [355, 148, -137], [78, 226, 4], PALETTE.bedroomGold);

    // Crystal chandeliers (two flanking + overhead spinning chandelier for drop-ceiling!)
    this.addChandelier(s, [-145, 258, -82], 0.92);
    this.addChandelier(s, [145, 258, -82], 0.92);
    const topChand = this.addChandelier(this.ceilingChandelier, [0, 246, -24], 1.12);
    topChand.rotation.x = 0.28;
    s.add(this.ceilingChandelier);

    // Royal Versailles upholstered bed (strictly z = -95..+58, y <= 76 so singer & mouth at y = 148 are completely clear!)
    this.slab(s, [0, 34, -18], [240, 56, 140], '#dfd2be');
    this.slab(s, [0, 66, -18], [246, 14, 144], '#efe5d6');
    // Pink satin ribbons draped down the mattress front (matching 1:08!)
    for (const rx of [-72, 72]) {
      this.slab(s, [rx, 38, 53], [12, 62, 4], '#d98a98');
    }
    // Striped pillows at right head of bed
    this.props.oval(s, [86, 80, -34], [28, 13, 24], '#f3ece4');
    this.props.oval(s, [56, 78, -42], [24, 11, 20], '#e6c2cc');

    // Warm red-shaded bedside lamp on right nightstand
    this.slab(s, [158, 34, -36], [42, 58, 42], '#69462d');
    this.props.tube(s, [158, 64, -36], [158, 90, -36], 3.0, PALETTE.bedroomGold);
    this.props.mesh(s, new THREE.CylinderGeometry(11, 18, 20, 16), [158, 98, -36], '#d9382e');

    // Open glowing laptop in front of Olivia on the mattress (z = 36..48, y = 74..98 — well below mouth at y = 146!)
    this.slab(s, [0, 74, 34], [48, 3, 30], '#2a2833');
    const lid = this.slab(s, [0, 88, 47], [48, 28, 2.5], '#23202c');
    lid.rotation.x = -0.26;
    const glow = this.props.mesh(s, new THREE.PlaneGeometry(42, 23), [0, 88, 45.2], '#8f44fd');
    glow.rotation.x = -0.26;
    glow.material = this.laptopGlowMat;
  }

  /** 4. The Gallery of Battles (0:83.5 - 1:15.5): parquet floor, colossal battle paintings, Corinthian columns, busts, velvet benches! */
  private buildGallerySet(): void {
    const s = this.sets.gallery;
    this.slab(s, [0, -6, -55], [1300, 14, 250], PALETTE.woodParquet);
    // Parquet floor herringbone stripes
    for (let x = -520; x <= 520; x += 68) {
      this.props.mesh(s, new THREE.PlaneGeometry(4, 240), [x, 1.5, -55], '#684529').rotation.x = -Math.PI / 2;
    }

    // Back wall dado & coffered gilded ceiling
    this.slab(s, [0, 185, -168], [1300, 410, 18], '#3b332d');
    this.slab(s, [0, 46, -156], [1280, 92, 10], '#8b6a58');
    this.slab(s, [0, 326, -100], [1280, 26, 220], '#a8843c');

    // Colossal gold-framed historical battle murals (matching 1:26, 1:46, 1:52!)
    for (const px of [-245, 0, 245]) {
      this.slab(s, [px, 194, -154], [198, 168, 7], PALETTE.bedroomGold);
      this.props.mesh(s, new THREE.PlaneGeometry(180, 150), [px, 194, -149.5], '#3d352e');
      // Dramatic chiaroscuro cavalry/sky highlights inside each battle painting
      this.props.oval(s, [px - 32, 218, -148], [46, 28, 1.5], '#8a7c68');
      this.props.oval(s, [px + 28, 172, -148], [52, 32, 1.5], '#6e4736');
      this.props.oval(s, [px - 10, 164, -147.5], [26, 22, 1.5], '#c9b496');
    }

    // Paired Corinthian marble columns + white marble portrait busts on pedestals!
    for (const cx of [-365, -124, 124, 365]) {
      this.slab(s, [cx, 48, -144], [38, 92, 26], '#7b5b4c');
      this.props.mesh(s, new THREE.CylinderGeometry(11, 12.5, 196, 16), [cx, 192, -142], '#4b4542');
      this.slab(s, [cx, 294, -142], [32, 16, 28], PALETTE.bedroomGold);

      // White marble portrait bust beside each column (matching 1:26-1:40!)
      const bx = cx + (cx < 0 ? 32 : -32);
      this.slab(s, [bx, 58, -138], [18, 108, 18], '#dfd9d0');
      this.props.oval(s, [bx, 120, -138], [11, 9, 8], '#f3efe8');
      this.props.oval(s, [bx, 134, -138], [7.5, 9.5, 7.5], '#f7f4ee');
    }

    // Crimson velvet museum benches with white & gold legs (placed behind/beside singer at z = -64, never blocking mouth!)
    for (const bx of [-135, 135]) {
      this.slab(s, [bx, 42, -62], [118, 12, 38], PALETTE.velvetRed);
      this.slab(s, [bx, 33, -62], [114, 6, 34], '#ece7dc');
      for (const lx of [-50, 50]) {
        for (const lz of [-13, 13]) {
          this.slab(s, [bx + lx, 16, -62 + lz], [6, 32, 6], '#ece7dc');
        }
      }
    }
  }

  /** 5. The Queen's Grand Marble Staircase (1:56 - 2:25): limestone arches, Classical statues in niches, checkerboard marble, stone balustrade! */
  private buildStaircaseSet(): void {
    const s = this.sets.staircase;
    // Black & white marble floor (kept strictly z = -165..+85, never crossing camera near plane!)
    this.slab(s, [0, -6, -45], [1150, 14, 250], '#dedad2');
    for (let x = -280; x <= 280; x += 56) {
      for (let z = -132; z <= 64; z += 56) {
        if (Math.abs(Math.round((x + z) / 56)) % 2 === 0) {
          this.props.mesh(s, new THREE.PlaneGeometry(38, 38), [x, 1.5, z], '#25262c').rotation.x = -Math.PI / 2;
        }
      }
    }

    // Cream limestone neoclassical hall walls + dark mullioned arched night windows + Classical statues in niches!
    this.slab(s, [0, 185, -162], [1150, 410, 18], PALETTE.limestone);
    for (const wx of [-220, 0, 220]) {
      // Recessed night-sky arched window
      this.slab(s, [wx, 188, -150], [92, 190, 6], '#1a2033');
      this.props.oval(s, [wx, 282, -150], [46, 42, 6], '#1a2033');
      for (let wy = 120; wy <= 260; wy += 36) {
        this.slab(s, [wx, wy, -146], [88, 3.5, 3], PALETTE.limestone);
      }
      this.slab(s, [wx, 188, -146], [3.5, 190, 3], PALETTE.limestone);
    }

    // White Classical marble statues in wall niches between windows (matching 1:58-2:08!)
    for (const sx of [-112, 112]) {
      this.slab(s, [sx, 165, -148], [52, 148, 8], PALETTE.limestoneDark);
      this.slab(s, [sx, 82, -140], [32, 36, 22], '#cbc3b6');
      this.props.mesh(s, new THREE.CylinderGeometry(9, 12, 68, 12), [sx, 134, -138], '#f1ede6');
      this.props.oval(s, [sx, 178, -138], [8, 10, 8], '#f5f2ec');
    }

    // Sweeping diagonal cream stone balustrade & staircase behind the singer (z = -58)
    const rail = new THREE.Group();
    rail.position.set(0, 0, -58);
    s.add(rail);
    // Lower stone plinth + balusters + angled top banister
    this.slab(rail, [-130, 48, 0], [190, 96, 26], PALETTE.limestoneDark);
    for (let i = -8; i <= 8; i++) {
      const bx = i * 24;
      const by = 46 + Math.max(0, i + 2) * 7;
      this.props.mesh(rail, new THREE.CylinderGeometry(3.8, 4.8, 52, 10), [bx, by, 0], PALETTE.limestone);
    }
    const topBar = this.slab(rail, [35, 106, 0], [380, 12, 22], '#e2dbd0');
    topBar.rotation.z = 0.24;

    this.addChandelier(s, [-125, 264, -46], 1.15);
  }

  /** 6. Gilded Rococo Salon — Hot-Pink Electric Guitar Girl-Band Trio (2:26 - 2:31, 2:38, 2:54)! */
  private buildSalonSet(): void {
    const s = this.sets.salon;
    this.slab(s, [0, -6, -48], [1100, 14, 240], PALETTE.woodParquet);
    this.slab(s, [0, 180, -152], [1100, 390, 18], '#8d6c2c');

    // Ornate gold-leaf Rococo wall panels & arched mirrors
    for (const gx of [-220, 0, 220]) {
      this.slab(s, [gx, 184, -140], [172, 236, 6], PALETTE.salonGold);
      this.props.mesh(s, new THREE.PlaneGeometry(148, 212), [gx, 184, -136], '#5e4c2b');
      this.props.oval(s, [gx, 258, -134], [34, 24, 3], '#e3be62');
    }

    // Gilded royal balustrade across the back of the salon (matching 2:38 & 2:54!)
    this.slab(s, [0, 68, -94], [680, 9, 14], '#e0b64f');
    this.slab(s, [0, 16, -94], [680, 12, 16], '#b88d32');
    for (let x = -310; x <= 310; x += 26) {
      this.props.mesh(s, new THREE.CylinderGeometry(3.2, 4.0, 50, 10), [x, 42, -94], '#deb44d');
    }

    // Three dazzling crystal chandeliers overhead!
    this.addChandelier(s, [-165, 258, -68], 0.95);
    this.addChandelier(s, [0, 272, -52], 1.15);
    this.addChandelier(s, [165, 258, -68], 0.95);
  }

  /** 7. Twilight Versailles Gardens & Grand Canal White Swan (2:32, 2:42 - 2:51, 3:32)! */
  private buildGardenSet(): void {
    const s = this.sets.garden;
    // Shimmering rose-gold dusk Grand Canal water (z = -310..-45, strictly in front of camera!)
    this.slab(s, [0, -8, -175], [1400, 10, 270], '#6c586e');
    for (let i = 0; i < 10; i++) {
      this.props.mesh(s, new THREE.PlaneGeometry(540 - i * 26, 3.8), [36, -1.5, -75 - i * 20], '#f4cba4').rotation.x = -Math.PI / 2;
    }

    // Wide twilight stone garden steps behind/underneath singer (z = +50 down to -38, strictly <= y = 30)
    for (let st = 0; st < 4; st++) {
      this.slab(s, [0, st * 7 - 2, 42 - st * 24], [720, 8, 24], st % 2 === 0 ? '#8c8d9c' : '#7b7c8c');
    }
    // Stone garden balustrade on right
    this.slab(s, [215, 62, -46], [190, 12, 22], '#9b9ca8');
    for (let i = 0; i < 6; i++) {
      this.slab(s, [135 + i * 30, 36, -46], [9, 44, 12], '#858694');
    }

    // Distant twilight treeline & twinkling palace lights
    this.slab(s, [0, 88, -320], [1400, 74, 24], '#23283d');
    for (let lx = -360; lx <= 360; lx += 58) {
      this.props.oval(s, [lx, 96 + (Math.abs(lx) % 14), -304], [4.5, 4.5, 3], '#ffcf7d');
    }

    // Prominent 3D White Swan gliding on the Grand Canal (matching 2:46 / 166s!)
    this.swanGroup.position.set(52, 52, -56);
    this.swanGroup.scale.setScalar(2.15);
    s.add(this.swanGroup);
    // Water ripple rings around the swan
    this.props.oval(this.swanGroup, [0, -10, 0], [38, 2.2, 16], '#f7d8b6');
    // Layered white body & folded wings
    this.props.oval(this.swanGroup, [6, 0, 0], [22, 10, 12], '#f9f9fb');
    this.props.oval(this.swanGroup, [10, 5, 0], [18, 8.5, 10], '#ffffff');
    this.props.oval(this.swanGroup, [24, 7, 0], [9, 5, 6], '#f2f3f7');
    // Graceful S-curved swan neck, head & orange beak
    this.props.tube(this.swanGroup, [-12, 3, 0], [-19, 20, 0], 3.5, '#ffffff');
    this.props.tube(this.swanGroup, [-19, 20, 0], [-14, 29, 0], 3.1, '#ffffff');
    this.props.oval(this.swanGroup, [-17, 29, 0], [5.5, 4.4, 4.2], '#ffffff');
    this.props.oval(this.swanGroup, [-23, 27.5, 0], [4.5, 2.2, 2.0], '#e57e3a');
  }

  /** 8. Illuminated Versailles Palace Courtyard & Golden Royal Gate (2:56 - 4:03.5)! */
  private buildCourtyardSet(): void {
    const s = this.sets.courtyard;
    // Blue-grey cobblestone plaza (strictly z = -255..+115, never crossing camera!)
    this.slab(s, [0, -8, -70], [1500, 14, 370], '#545b73');
    for (let z = -120; z <= 96; z += 28) {
      this.props.mesh(s, new THREE.PlaneGeometry(920, 2.5), [0, 0.2, z], '#42485e').rotation.x = -Math.PI / 2;
    }
    // Wide limestone steps rising toward the Palace (z = -30..-110)
    for (let st = 0; st < 5; st++) {
      this.slab(s, [0, st * 8 + 2, -26 - st * 18], [760, 9, 19], '#9ca1b2');
    }

    // U-shaped Versailles Cour d'Honneur facade (center corps de logis + left & right wings!)
    this.buildPalaceWing(s, [0, 154, -235], 540, 0);
    this.buildPalaceWing(s, [-345, 154, -145], 340, 0.42);
    this.buildPalaceWing(s, [345, 154, -145], 340, -0.42);

    // Ornate Gold-Gilded Wrought-Iron Royal Fence (Grille Royale — visible in drop-gold-gate at 2:56-3:09!)
    this.courtyardGate.position.set(0, 0, -68);
    s.add(this.courtyardGate);
    this.slab(this.courtyardGate, [0, 18, 0], [680, 34, 12], '#7f8496');
    this.slab(this.courtyardGate, [0, 134, 0], [680, 6, 6], PALETTE.palaceAmber);
    for (let x = -320; x <= 320; x += 22) {
      this.props.tube(this.courtyardGate, [x, 34, 0], [x, 142, 0], 1.8, PALETTE.palaceAmber);
      this.props.oval(this.courtyardGate, [x, 146, 0], [3.2, 6.5, 3.2], '#ffd878');
    }
    // Stone gatepost pier with Classical trophy sculpture
    this.slab(this.courtyardGate, [-148, 86, 4], [48, 168, 36], '#888e9f');
    this.props.oval(this.courtyardGate, [-148, 184, 4], [18, 22, 16], '#aeb3c4');
  }

  private buildPalaceWing(parent: THREE.Group, at: Point, w: number, rotY: number): void {
    const g = new THREE.Group();
    g.position.set(...at);
    g.rotation.y = rotY;
    parent.add(g);

    // Brick & limestone facade + dark mansard roof + warmly floodlit golden arched windows!
    this.slab(g, [0, 0, 0], [w, 228, 28], PALETTE.palaceBrick);
    this.slab(g, [0, -72, 4], [w + 8, 82, 24], '#9e8f7e');
    this.slab(g, [0, 128, -4], [w - 12, 42, 26], '#33394f');

    const cols = Math.floor(w / 52);
    for (let i = 0; i < cols; i++) {
      const wx = (i - (cols - 1) / 2) * 50;
      // Pilaster column
      this.slab(g, [wx + 25, -4, 15], [8, 210, 6], '#cbbba4');
      // Ground & piano nobile warmly lit golden windows!
      this.props.mesh(g, new THREE.PlaneGeometry(24, 54), [wx, -56, 17], PALETTE.palaceAmber);
      this.props.mesh(g, new THREE.PlaneGeometry(24, 66), [wx, 34, 17], '#ffd27d');
      // Mansard dormer window
      this.slab(g, [wx, 124, 10], [18, 24, 8], '#d8a456');
    }
  }

  private makeBandProxy(
    parent: THREE.Group,
    at: Point,
    scale: number,
    shirt: string,
    hairColor: string,
    phase: number,
    withGuitar: boolean,
  ): MiniProxy {
    const root = new THREE.Group();
    root.position.set(...at);
    root.scale.setScalar(scale);
    parent.add(root);

    this.props.oval(root, [0, 128, 0], [11.5, 15.5, 10], '#dfb29b');
    this.props.oval(root, [0, 136, -3], [13, 11, 10], hairColor);
    for (const side of [-1, 1]) {
      this.props.oval(root, [side * 12, 118, -5], [5.5, 15, 6], hairColor);
    }
    const body = this.props.mesh(root, new THREE.CylinderGeometry(17, 14, 54, 14), [0, 86, 0], shirt);
    body.scale.z = 0.58;
    for (const sx of [-8.5, 8.5]) {
      this.props.tube(root, [sx * 0.85, 62, 0], [sx, 6, 0], 5.4, '#445b78');
      this.props.oval(root, [sx, 4, 5], [5, 3.5, 8], '#eceef2');
    }
    const arms = [-1, 1].map(side =>
      this.props.tube(root, [side * 16, 108, 0], [side * 24, 76, 10], 4.0, shirt),
    );
    if (withGuitar) {
      this.makePinkGuitar(root, [0, 78, 12]);
    }
    return { root, arms, phase };
  }

  private makeFigure(actor: Actor, skin: string): VideoFigure {
    const f = new VideoFigure(actor.model, actor.track, this.props, this.scene, PALETTE.chloeBlush, skin);
    f.head.scene.scale.setScalar(2.12);

    // Long wavy center-parted brunette hair strictly behind the Chimera head & shoulders (z <= -17, zero dog ears, zero occlusion!)
    const hairBlobs: THREE.Mesh[] = [];
    hairBlobs.push(this.props.oval(f.root, [0, 29, -17], [15, 6.5, 8], PALETTE.hairDark));
    for (const side of [-1, 1]) {
      hairBlobs.push(this.props.oval(f.root, [side * 10, 26, -17], [8, 6.5, 7.5], PALETTE.hairDark));
      hairBlobs.push(this.props.oval(f.root, [side * 15, 14, -19], [5.2, 11, 6.5], PALETTE.hairDark));
      hairBlobs.push(this.props.oval(f.root, [side * 16.5, -4, -19], [6.2, 15, 6.5], PALETTE.hairDark));
      hairBlobs.push(this.props.oval(f.root, [side * 15, -22, -18], [5.5, 12, 6], PALETTE.hairDark));
    }

    // Ruffled Chloé babydoll flared skirt + cream lace bloomers + ruffled shoulder straps
    const skirtOuter = this.props.mesh(f.root, new THREE.CylinderGeometry(16, 28, 28, 20), [0, -56, 0], PALETTE.chloeBlue);
    skirtOuter.scale.z = 0.68;
    const skirtRuffle = this.props.mesh(f.root, new THREE.CylinderGeometry(24, 31, 9, 20), [0, -68, 0], '#8398bf');
    skirtRuffle.scale.z = 0.68;
    const bloomers = this.props.mesh(f.root, new THREE.CylinderGeometry(18, 20, 12, 16), [0, -73, 0], PALETTE.bloomers);
    bloomers.scale.z = 0.64;

    const shoulderRuffles = [-1, 1].map(side => {
      const r = this.props.oval(f.root, [side * 19, -13, 2], [6.5, 5.5, 9], '#8398bf');
      r.rotation.z = side * 0.35;
      return r;
    });

    // Pearl beads along hem for the opening white dive-bar mini dress!
    const pearls: THREE.Mesh[] = [];
    for (let i = -4; i <= 4; i++) {
      pearls.push(this.props.oval(f.root, [i * 5.2, -67, 13], [1.8, 1.8, 1.5], '#ffffff'));
    }

    // White knit knee-high socks (lower half of legs: y = -96..-124)
    const socks = [-1, 1].map(side =>
      this.props.tube(f.root, [side * 9.5, -95, 0], [side * 10, -123, 0], 6.2, '#f2f3f7'),
    );

    // Wired pink Y2K on-ear headphones (z <= -3 so strictly behind the physical mouth!)
    const headphones = new THREE.Group();
    f.root.add(headphones);
    for (const side of [-1, 1]) {
      this.props.oval(headphones, [side * 17.5, 9, -4], [3.6, 6.2, 5.5], PALETTE.hotPink);
      this.props.tube(headphones, [side * 16.5, 14, -5], [side * 11, 29, -6], 1.2, '#cfd4dc');
    }
    this.props.tube(headphones, [-11, 29, -6], [11, 29, -6], 1.2, '#cfd4dc');

    // Hot-pink electric guitar slung at hip level (y = -48, strictly below neck/mouth!)
    const guitar = this.makePinkGuitar(f.root, [0, -48, 15]);

    this.costumes.set(f, {
      hairBlobs,
      skirtOuter,
      skirtRuffle,
      bloomers,
      shoulderRuffles,
      pearls,
      socks,
      headphones,
      guitar,
    });
    return f;
  }

  private dress(
    f: VideoFigure,
    look: Wardrobe,
    beat: number,
    intensity: number,
    t: number,
    poseMode: 'dance' | 'guitar' | 'heart' | 'sprawl' = 'dance',
  ): void {
    const c = this.costumes.get(f)!;
    const isPearl = look === 'pearl-white';
    const isBandmate = look === 'bandmate-guitar';
    const hasGuitar = look === 'chloe-guitar' || look === 'bandmate-guitar';
    const hasPhones = look === 'chloe-headphones';

    const topCol = isPearl ? PALETTE.pearlWhite : isBandmate ? '#efe5d8' : PALETTE.chloeBlush;
    const armCol = isPearl ? PALETTE.pearlWhite : isBandmate ? '#efe5d8' : '#dfb29b';
    const legCol = isBandmate ? '#445b78' : '#dfb29b';

    (f.torso.material as THREE.MeshBasicMaterial).color.set(topCol);
    for (const arm of f.arms) (arm.material as THREE.MeshBasicMaterial).color.set(armCol);
    for (const leg of f.legs) (leg.material as THREE.MeshBasicMaterial).color.set(legCol);
    for (const ft of f.feet) (ft.material as THREE.MeshBasicMaterial).color.set('#f4f5f8');

    c.skirtOuter.visible = !isBandmate;
    c.skirtRuffle.visible = !isPearl && !isBandmate;
    c.bloomers.visible = !isPearl && !isBandmate;
    (c.skirtOuter.material as THREE.MeshBasicMaterial).color.set(isPearl ? PALETTE.pearlWhite : PALETTE.chloeBlue);

    for (const sr of c.shoulderRuffles) sr.visible = !isPearl && !isBandmate;
    for (const p of c.pearls) p.visible = isPearl;
    for (const sk of c.socks) sk.visible = !isPearl && !isBandmate;
    c.headphones.visible = hasPhones;
    c.guitar.visible = hasGuitar;

    const groove = Math.sin(beat) * (4 + intensity * 5);
    let hands: [Point, Point, Point, Point];
    if (hasGuitar || poseMode === 'guitar') {
      hands = [
        [-28, -32, 16],
        [-34, -36, 22],
        [20, -36, 16],
        [10, -48 + Math.sin(beat * 2) * 4, 22],
      ];
    } else if (poseMode === 'heart') {
      hands = [
        [-22, -32, 16],
        [-8, -26, 20],
        [22, -32, 16],
        [8, -26, 20],
      ];
    } else if (poseMode === 'sprawl') {
      hands = [
        [-34, -26, -6],
        [-52, -36, -12],
        [34, -26, -6],
        [52, -36, -12],
      ];
    } else {
      hands = [
        [-26, -35 + groove * 0.5, 14],
        [-31, -50 + groove, 20],
        [26, -35 - groove * 0.5, 14],
        [31, -50 - groove, 20],
      ];
    }
    f.pose(t, hands, false);
    f.head.scene.rotation.x = -0.02 + Math.sin(beat * 0.5) * 0.03;
    f.head.scene.rotation.y -= Math.sin(beat * 0.45) * 0.12;
    f.head.scene.rotation.z = Math.sin(beat * 0.5) * 0.028;
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
    this.figures['drop-lead'].head.resize(w, h);
    this.figures['drop-harmony'].head.resize(w, h);
  }

  frame(
    t: number,
    playing: boolean,
    epoch: number,
    view: CameraView = 'wide',
    intensity = 0,
    speaker?: CharacterId,
  ): void {
    const reset = epoch !== this.epoch || this.time < 0 || Math.abs(t - this.time) > 0.25;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, Math.min(0.05, t - this.time));
    this.epoch = epoch;
    this.time = t;

    const chosen: Shot = Object.hasOwn(CAMERA, view)
      ? CAMERA[view as DropView | 'wide']
      : view === 'drop-harmony'
      ? CAMERA['drop-guitar-trio']
      : DEFAULT_SHOT;
    const { set, look } = chosen;

    for (const name of Object.keys(this.sets) as SetName[]) {
      this.sets[name].visible = name === set;
    }

    const bgMap: Record<SetName, string> = {
      card: PALETTE.cardPink,
      bar: view === 'drop-bar-close' ? PALETTE.barCrimson : PALETTE.barBg,
      bedroom: PALETTE.bedroomCrimson,
      gallery: '#382f29',
      staircase: '#cfc7bc',
      salon: '#755822',
      garden: PALETTE.duskSky,
      courtyard: PALETTE.nightCourtyard,
    };
    const bgHex = bgMap[set];
    (this.scene.background as THREE.Color).set(bgHex);
    (this.scene.fog as THREE.Fog).color.set(bgHex);

    // 144 BPM upbeat indie-rock pulse
    const beat = t * (144 / 60) * Math.PI * 2;

    if (set === 'bar') {
      for (let i = 0; i < this.barPatrons.length; i++) {
        const p = this.barPatrons[i]!;
        p.root.visible = view === 'drop-bar-dance';
        p.root.rotation.z = Math.sin(beat * 0.5 + p.phase) * 0.12;
        p.root.position.y = 6 + Math.abs(Math.sin(beat * 0.5 + p.phase)) * 4;
      }
    } else if (set === 'bedroom') {
      // Rapid neon blue / magenta / crimson laptop screen flicker (matching 0:48-1:04!)
      const glowColors = ['#5448ff', '#e838c8', '#eb384e', '#9c42ff'];
      this.laptopGlowMat.color.set(glowColors[Math.floor(t * 2.4) % glowColors.length]!);
      this.ceilingChandelier.visible = view === 'drop-ceiling';
      this.ceilingChandelier.rotation.y = t * 0.65;
    } else if (set === 'salon') {
      this.salonThirdPlayer.root.visible = view === 'drop-guitar-trio';
      this.salonThirdPlayer.root.rotation.z = Math.sin(beat * 0.5 + 1.4) * 0.08;
    } else if (set === 'garden') {
      this.swanGroup.visible = view === 'drop-swan' || view === 'drop-garden-steps';
      this.swanGroup.position.x = 54 - Math.sin(t * 0.35) * 18;
      this.swanGroup.position.y = 48 + Math.sin(t * 1.4) * 1.5;
    } else if (set === 'courtyard') {
      this.courtyardGate.visible = view === 'drop-gold-gate';
    }

    const leadFig = this.figures['drop-lead'];
    const harmFig = this.figures['drop-harmony'];
    const portrait = this.camera.aspect < 1.05;
    const harmSpeaking = speaker === 'drop-harmony' && intensity > 0.02;
    const isSprawl = view === 'drop-steps-sprawl' || view === 'drop-steps-wide';

    if (chosen.hideCast) {
      leadFig.root.visible = false;
      harmFig.root.visible = false;
    } else {
      const showLead = view !== 'drop-harmony';
      const showHarm =
        view === 'drop-harmony' ||
        harmSpeaking ||
        Boolean(chosen.harmAt && !portrait && (view === 'drop-guitar-trio' || view === 'drop-guitar-solo'));

      leadFig.root.visible = showLead;
      harmFig.root.visible = showHarm;

      const leadPos = chosen.leadAt;
      const harmPos: Point = chosen.harmAt ?? [88, 152, 10];

      if (isSprawl && !speaker) {
        // Iconic instrumental outro: sprawled dramatically across the wide limestone palace steps!
        leadFig.root.position.set(leadPos[0] - 18, 86, -12);
        leadFig.root.rotation.set(-0.88, 0.24, 0.58);
      } else {
        const bounce = Math.abs(Math.sin(beat * 0.5)) * (view.includes('leap') ? 8 : 2.5);
        leadFig.root.position.set(leadPos[0] + Math.sin(beat * 0.25) * 3.5, leadPos[1] + bounce, leadPos[2]);
        leadFig.root.rotation.set(0, Math.sin(beat * 0.25) * 0.1, 0);
      }

      harmFig.root.position.set(
        harmPos[0] - Math.sin(beat * 0.25) * 3,
        harmPos[1] + Math.abs(Math.cos(beat * 0.5)) * 2.5,
        harmPos[2],
      );
      harmFig.root.rotation.set(0, -0.16 - Math.sin(beat * 0.25) * 0.08, 0);

      const poseMode =
        isSprawl && !speaker
          ? 'sprawl'
          : view === 'drop-stairs-heart'
          ? 'heart'
          : look === 'chloe-guitar'
          ? 'guitar'
          : 'dance';
      const harmLook: Wardrobe = set === 'salon' ? 'bandmate-guitar' : look === 'pearl-white' ? 'pearl-white' : 'chloe';

      this.dress(leadFig, look, beat, speaker === 'drop-lead' ? intensity : 0.35, t, poseMode);
      this.dress(harmFig, harmLook, beat + 1.1, harmSpeaking ? intensity : 0.28, t, set === 'salon' ? 'guitar' : 'dance');
    }

    const aim = new THREE.Vector3(...chosen.aim);
    if (!chosen.hideCast) {
      const activeFig =
        view === 'drop-harmony' || (harmSpeaking && harmFig.root.visible) ? harmFig : leadFig;
      const targetPt = new THREE.Vector3(
        activeFig.root.position.x,
        activeFig.root.position.y - 4,
        activeFig.root.position.z,
      );
      if (portrait || view === 'drop-harmony' || harmSpeaking) {
        aim.lerp(targetPt, portrait ? 0.88 : 0.65);
      }
    }
    aim.x += Math.sin(t * 0.5) * 2.2;
    const dist = new THREE.Vector3(...chosen.offset);
    if (portrait && chosen.wide) dist.multiplyScalar(0.88);
    this.camera.position.copy(aim).add(dist);
    this.camera.lookAt(aim);
    this.camera.updateMatrixWorld(true);
    this.scene.updateMatrixWorld(true);

    if (leadFig.root.visible) leadFig.update(t, playing, this.camera, dt, reset);
    if (harmFig.root.visible) harmFig.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    for (const f of Object.values(this.figures)) f.dispose();
    this.props.dispose();
  }
}
