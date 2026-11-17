import * as THREE from 'three';
import {demonsState, type DemonsRoom} from '../../scene/doja-demons.ts';
import {VideoProps, type VideoPoint as Point} from './videoProps.ts';

type State = ReturnType<typeof demonsState>;
export type DemonsSets = ReturnType<typeof makeDemonsSets>;
const dark = '#0b171c';
const wood = '#34302a';
const teal = '#29464c';
const iron = '#566f70';
const brass = '#a08a60';
const FONT: Record<string, string[]> = {
  D: ['1110','1001','1001','1001','1110'],
  E: ['1111','1000','1110','1000','1111'],
  M: ['10001','11011','10101','10001','10001'],
  O: ['0110','1001','1001','1001','0110'],
  N: ['1001','1101','1011','1001','1001'],
  S: ['0111','1000','0110','0001','1110'],
  L: ['1000','1000','1000','1000','1111'],
  A: ['0110','1001','1111','1001','1001'],
};

function group(parent: THREE.Object3D, position: Point = [0, 0, 0]) {
  const root = new THREE.Group();
  root.position.set(...position);
  parent.add(root);
  return root;
}

function letters(p: VideoProps, g: THREE.Object3D, word: string, position: Point, size: number, color: string, height = 1) {
  const root = group(g, position);
  let x = -word.length * 2.65 * size;
  for (const char of word) {
    const rows = FONT[char];
    for (const [y, row] of rows.entries()) {
      for (const [column, bit] of [...row].entries()) {
        if (bit === '1') p.box(root, size * .83, size * .88 * height, .8, color, [x + column * size, (2 - y) * size * height, 0]);
      }
    }
    x += (rows[0].length + 1) * size;
  }
}

function windowFrame(p: VideoProps, g: THREE.Object3D, x: number, y: number, z: number, width: number, height: number) {
  p.box(g, width + 12, height + 12, 4, '#607c78', [x, y, z]);
  p.box(g, width, height, 5, '#183741', [x, y, z + 4]);
  for (const a of [-.24, .24]) p.box(g, 1.5, height, 4, '#596e66', [x + a * width, y, z + 7]);
  for (const b of [-.25, .25]) p.box(g, width, 2, 4, '#677a6c', [x, y + b * height, z + 7]);
  p.box(g, width, 3, 4, '#849994', [x, y, z + 7]);
  p.box(g, width * .39, height * .19, 1, '#3d6973', [x - width * .16, y + height * .27, z + 9]);
}

function lamp(p: VideoProps, g: THREE.Object3D, at: Point, color: string) {
  const [x, y, z] = at;
  p.tube(g, [x, y, z], [x, y + 25, z], 2, brass);
  p.mesh(g, new THREE.CylinderGeometry(10, 18, 20, 18), [x, y + 29, z], color);
  p.oval(g, [x, y + 20, z], [12, 2, 12], '#d5ba89');
}

function makeOutdoor(p: VideoProps, root: THREE.Group) {
  p.box(root, 2130, 5, 1410, '#152329', [0, -7, -364]);
  p.box(root, 2080, 3, 174, '#293338', [0, -3, 254]);
  p.box(root, 2080, 3, 26, '#536161', [0, -2, 158]);
  p.box(root, 90, 3, 430, '#455653', [0, -2, -33]);
  const house = group(root, [0, 0, -390]);
  p.box(house, 462, 278, 160, '#31494e', [0, 139, 0]);
  p.box(house, 343, 184, 59, '#446067', [-50, 240, 92]);
  const roof = p.mesh(house, new THREE.ConeGeometry(300, 143, 4), [0, 334, -3], '#182a31');
  roof.rotation.y = Math.PI / 4;
  const gable = p.mesh(house, new THREE.ConeGeometry(110, 112, 4), [-60, 366, 104], '#3c5760');
  gable.rotation.y = Math.PI / 4;
  windowFrame(p, house, -57, 330, 127, 35, 59);
  for (const x of [-170, -59, 68, 177]) {
    windowFrame(p, house, x, 228, Math.abs(x) < 140 ? 123 : 87, 50, 65);
    if (x !== -59) windowFrame(p, house, x, 105, 87, 60, 76);
  }
  for (let i = 1; i < 20; i++) p.box(house, 462, 1.5, 1, '#526d70', [0, i * 14, 81]);
  p.box(house, 63, 119, 6, '#203039', [-55, 69, 86]);
  p.box(house, 417, 18, 127, '#546769', [0, 158, 122]);
  p.box(house, 429, 11, 129, '#647878', [0, 9, 121]);
  for (const x of [-195, -104, 89, 195]) {
    p.box(house, 8, 145, 8, '#78928c', [x, 83, 172]);
    p.box(house, 14, 7, 14, '#354c54', [x, 17, 172]);
  }
  for (let j = 0; j < 35; j++) {
    const x = 11.3 * (j - 17);
    if (Math.abs(x + 51) < 35) continue;
    p.box(house, 2.4, 39, 2.4, '#6e837e', [x, 37, 171]);
  }
  p.box(house, 399, 5, 5, '#758782', [0, 58, 170]);
  for (let i = 0; i < 3; i++) p.box(house, 83 + i * 11, 7, 22, '#4b5b5a', [-53, 8 - i * 3, 185 + i * 13]);
  for (const x of [-92, -15]) {
    p.box(house, 14, 31, 15, '#53605e', [x, 121, 105]);
    p.oval(house, [x, 122, 115], [4, 8, 3], '#b29a68');
  }
  for (let i = 0; i < 15; i++) {
    const side = i % 2 ? -1 : 1;
    const x = side * (237 + i % 6 * 69);
    const z = -247 - Math.floor(i / 4) * 156;
    const tall = 245 + i % 5 * 43;
    p.tube(root, [x, 0, z], [x + i * 1.7, tall, z], 8 + i % 5, '#29363a');
    for (let j = 0; j < 4; j++) {
      const a: Point = [x + i, tall * (.48 + j * .1), z];
      const b: Point = [x + 35 * (j - 1.5), tall * (.91 + j * .08), z + 32 - 17 * j];
      p.tube(root, a, b, 3 + j * .44, '#39474a');
      p.oval(root, b, [42 + i % 4 * 9, 31 + j * 4, 43], j % 2 ? '#152a30' : '#1a3338');
    }
  }
  const sale = group(root, [133, 0, 138]);
  p.box(sale, 6, 109, 8, '#73847e', [0, 54, 0]);
  p.box(sale, 75, 31, 6, '#829b97', [0, 82, 5]);
  letters(p, sale, 'SALE', [0, 82, 9], 2.9, '#4a3339');
  const mailbox = group(root, [-84, 0, 128]);
  p.box(mailbox, 8, 104, 8, iron, [0, 52, 0]);
  p.box(mailbox, 28, 23, 36, '#60757a', [0, 107, 0]);
  p.oval(mailbox, [0, 119, 0], [14, 8, 18], '#7e9294');
  p.box(mailbox, 4, 24, 8, '#8d4946', [16, 119, 0]);
  const car = group(root);
  p.box(car, 240, 40, 100, '#23363c', [0, 29, 0]);
  p.box(car, 124, 33, 79, '#13262e', [-15, 62, 0]);
  p.box(car, 134, 6, 83, '#42545b', [-15, 82, 0]);
  p.box(car, 249, 5, 102, '#515859', [0, 15, 0]);
  for (const side of [-1, 1]) {
    for (const x of [-82, 82]) {
      p.mesh(car, new THREE.CylinderGeometry(20, 20, 14, 18), [x, 20, side * 54], '#10191c').rotation.x = Math.PI / 2;
      p.oval(car, [x, 20, side * 61], [9, 9, 1], '#52666b');
    }
    p.box(car, 18, 11, 2, '#a46760', [-105, 37, side * 51]);
    p.box(car, 19, 11, 2, '#e3d8aa', [110, 37, side * 51]);
    p.box(car, 105, 23, 3, '#28414b', [-14, 64, side * 40]);
  }
  for (const z of [-34, 34]) {
    p.box(car, 2, 10, 19, '#f3e5b6', [121, 37, z]);
    p.box(car, 2, 9, 20, '#a54844', [-121, 36, z]);
  }
  const beams = group(car, [139, -1, 0]);
  for (const z of [-32, 32]) {
    const cone = p.mesh(beams, new THREE.ConeGeometry(37, 131, 12, 1, true), [53, 14, z], '#96c1be');
    cone.rotation.z = Math.PI / 2;
    Object.assign(cone.material, {transparent: true, opacity: .09, depthWrite: false});
  }
  const wheel = group(root, [0, 0, 0]);
  p.mesh(wheel, new THREE.TorusGeometry(30, 4, 8, 30), [0, 78, 156], '#253741').rotation.x = -.24;
  p.tube(wheel, [-28, 77, 153], [28, 77, 153], 2.9, iron);
  p.box(wheel, 240, 34, 24, '#29383d', [0, 40, 171]);
  return {sale, mailbox, car, wheel, beams};
}

function makeBedroom(p: VideoProps, root: THREE.Group) {
  p.box(root, 1210, 6, 840, '#253338', [0, -6, -213]);
  p.box(root, 1040, 443, 9, '#263d43', [0, 214, -232]);
  p.box(root, 118, 182, 5, '#18292f', [132, 93, -223]);
  for (const x of [72, 192]) p.box(root, 7, 189, 10, '#587272', [x, 97, -217]);
  p.box(root, 131, 7, 10, '#617c7b', [132, 191, -217]);
  windowFrame(p, root, -253, 171, -225, 105, 148);
  const ceiling = group(root);
  for (const x of [-243, -122, 0, 122, 244]) {
    p.box(ceiling, 14, 8, 525, '#35525b', [x, 349, -33]);
    p.box(ceiling, 95, 1, 505, '#203941', [x + 59, 354, -34]);
  }
  const bed = group(root, [-61, 0, 9]);
  p.box(bed, 153, 29, 217, '#1f2e34', [0, 24, -5]);
  p.box(bed, 151, 15, 210, '#778d8c', [0, 48, -4]);
  for (const x of [-46, 46]) p.oval(bed, [x, 59, -72], [37, 9, 27], '#80999a');
  const duvet = group(bed, [0, 0, 0]);
  p.oval(duvet, [-21, 55, 25], [53, 17, 77], '#546d71');
  p.oval(duvet, [34, 54, 24], [42, 12, 77], '#60777a');
  for (let i = 0; i < 20; i++) {
    const x = (i - 9.5) * 7.4;
    const y = 59 + 11 * Math.cos(x / 60);
    p.tube(duvet, [x, y - 5, -41], [x + 3, y, 97], 1.1, i % 2 ? '#697d7b' : '#4c666b');
  }
  const rail = p.ink(bed);
  rail.begin();
  for (const z of [-110, 106]) {
    const foot = z > 0;
    for (const x of [-76, 76]) {
      const y = foot ? 65 : 116;
      p.tube(bed, [x, 6, z], [x, y, z], 2.7, iron);
      p.oval(bed, [x, y + 3, z], [4.3, 5, 4.3], '#72867d');
    }
    for (const row of [0, 1]) p.line(rail,
      Array.from({length: 27}, (_, i) => {
        const x = -76 + i * 152 / 26;
        return [x, (foot ? 56 : 99) + Math.cos(x / 76 * Math.PI / 2) * (foot ? 10 : 22) - row * 11, z] as Point;
      }), '#789391', 2.6);
    for (const x of [-49, -25, 0, 25, 49]) p.ring(rail, [x, foot ? 55 : 97, z], [9, 0, 0], [0, 7, 0], '#678080', 1.7);
  }
  rail.end();
  p.box(root, 64, 58, 49, '#423d34', [-168, 29, -69]);
  lamp(p, root, [-168, 59, -69], '#baa880');
  p.box(root, 93, 69, 57, '#242c2b', [86, 36, -130]);
  p.box(root, 74, 60, 50, '#0f1d23', [87, 103, -130]);
  const tv = p.box(root, 61, 45, 2, '#99dce4', [87, 106, -104]);
  const scan = Array.from({length: 32}, (_, i) => p.box(root, 60, .5, 1, i % 3 ? '#669ea5' : '#d6eff0', [87, 85 + i * 1.34, -102]));
  const children = [makeProxy(p, root, '#9eadaa', '#382e33', .63), makeProxy(p, root, '#8ba2a4', '#4f403a', .68)];
  return {bed, duvet, tv, scan, ceiling, children};
}

function makeBathroom(p: VideoProps, root: THREE.Group) {
  p.box(root, 950, 5, 610, '#697065', [0, -6, -100]);
  p.box(root, 920, 360, 10, '#2f6157', [0, 178, -153]);
  const grout = p.ink(root);
  grout.begin();
  for (let i = -17; i <= 17; i++) p.line(grout, [[i * 26, 0, -146], [i * 26, 337, -146]], '#679083', .9);
  for (let i = 1; i < 14; i++) p.line(grout, [[-450, i * 26, -146], [450, i * 26, -146]], '#719082', .9);
  grout.end();
  const arch: Point[] = [[-157, 8, -57], [-157, 241, -57], [-95, 307, -57], [94, 307, -57], [157, 241, -57], [157, 8, -57]];
  for (let i = 0; i < arch.length - 1; i++) {
    p.tube(root, arch[i], arch[i + 1], 5, '#a49265');
    const a = arch[i].map((v, k) => v + (k === 0 ? Math.sign(v) * 9 : k === 1 ? 3 : -1)) as Point;
    const b = arch[i + 1].map((v, k) => v + (k === 0 ? Math.sign(v) * 9 : k === 1 ? 3 : -1)) as Point;
    p.tube(root, a, b, 4, '#456961');
  }
  for (const side of [-1, 1]) {
    lamp(p, root, [side * 190, 182, -118], '#c6bd98');
    p.box(root, 64, 41, 5, '#72877a', [side * 282, 127, -139]);
    p.box(root, 56, 33, 6, '#324a45', [side * 282, 127, -134]);
  }
  // A porcelain rim around an actual opening keeps the water and performer legible overhead.
  const rounded = (width: number, depth: number, radius: number) => {
    const points: THREE.Vector2[] = [];
    const corners = [[width / 2 - radius, depth / 2 - radius], [-width / 2 + radius, depth / 2 - radius],
      [-width / 2 + radius, -depth / 2 + radius], [width / 2 - radius, -depth / 2 + radius]];
    for (const [i, [x, z]] of corners.entries()) {
      for (let j = 0; j <= 8; j++) {
        const a = (i + j / 8) * Math.PI / 2;
        points.push(new THREE.Vector2(x + Math.cos(a) * radius, z + Math.sin(a) * radius));
      }
    }
    return points;
  };
  const outline = rounded(282, 132, 32);
  const basin = rounded(251, 104, 27);
  const rim = new THREE.Shape(outline);
  rim.holes.push(new THREE.Path([...basin].reverse()));
  p.mesh(root, new THREE.ExtrudeGeometry(rim, {depth: 7, bevelEnabled: false, curveSegments: 12}),
    [0, 66, 2], '#c8c5ad').rotation.x = -Math.PI / 2;
  p.mesh(root, new THREE.ExtrudeGeometry(rim, {depth: 54, bevelEnabled: false, curveSegments: 12}),
    [0, 12, 2], '#68837a').rotation.x = -Math.PI / 2;
  p.mesh(root, new THREE.ShapeGeometry(new THREE.Shape(basin)), [0, 65, 2], '#102c2c').rotation.x = -Math.PI / 2;
  p.box(root, 212, 33, 2, '#4a7163', [0, 32, 69]);
  const water = group(root, [0, 65.3, 3]);
  const ripples = p.ink(water);
  ripples.begin();
  for (let i = 1; i <= 6; i++) p.ring(ripples, [0, 0, 0], [16 * i, 0, 0], [0, 0, 6 * i], i % 2 ? '#406863' : '#2d4d48', .9);
  ripples.end();
  const curtain = group(root, [0, 0, -51]);
  for (let i = 0; i < 22; i++) {
    const x = (i - 10.5) * 12.7;
    p.box(curtain, 13, 206, 2, i % 2 ? '#a1ae9c' : '#bdc4ac', [x, 166, (i % 4) * 1.1]);
  }
  p.tube(root, [-149, 270, -49], [149, 270, -49], 2, brass);
  p.tube(root, [-109, 69, -19], [-109, 94, -19], 2.8, '#a9a491');
  p.tube(root, [-109, 93, -20], [-95, 93, -8], 2.65, '#cbc3a7');
  p.oval(root, [-109, 87, -14], [9, 2, 2], '#a9a491');
  const claw = group(root, [61, 66, -53]);
  p.tube(claw, [0, -36, -9], [0, 6, 0], 5.5, '#1b3637');
  p.oval(claw, [0, 10, 0], [8, 12, 3.5], '#2d4949');
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 3.4;
    const y = 32 + (2 - Math.abs(i - 2)) * 4;
    p.tube(claw, [x, 11, 0], [x * 1.7, y, 8], 1.65, '#395c5b');
    p.tube(claw, [x * 1.7, y, 8], [x * 1.6 - 1, y + 7, 10], .8, '#81938b');
  }
  return {water, curtain, claw};
}

function makeProxy(p: VideoProps, room: THREE.Group, clothing: string, hair: string, scale: number) {
  const root = group(room);
  root.scale.setScalar(scale);
  const body = p.oval(root, [0, 54, 0], [19, 31, 13], clothing);
  const head = group(root, [0, 103, -1]);
  p.oval(head, [0, 0, 0], [14, 19, 15], '#839998');
  p.oval(head, [0, 9, -4], [15, 15, 13], hair);
  for (const side of [-1, 1]) {
    p.oval(head, [side * 5, 0, 14], [2, 2.5, 1.2], '#131e22');
    p.tube(root, [side * 14, 70, 0], [side * 26, 36, 13], 4.4, clothing);
    p.tube(root, [side * 8, 32, 1], [side * 13, 5, 18], 5.3, clothing);
  }
  return {root, body, head};
}

function makeGoat(p: VideoProps, parent: THREE.Group, x: number, z: number, spotted: boolean) {
  const g = group(parent, [x, 0, z]);
  const wool = spotted ? '#b6b2a1' : '#41413d';
  p.oval(g, [0, 43, 0], [26, 20, 35], wool);
  p.oval(g, [0, 54, 30], [14, 18, 17], '#3a3b37');
  p.oval(g, [0, 45, 42], [10, 7, 9], '#60584b');
  for (const x of [-12, 12]) {
    for (const z of [-21, 20]) p.tube(g, [x, 43, z], [x, 8, z + 3], 3.6, '#5b594d');
    p.oval(g, [x * 1.34, 61, 33], [7, 3, 4], '#675d50');
    p.oval(g, [x * .55, 58, 44], [2, 1.6, 1.5], '#c0ac72');
    p.tube(g, [x * .55, 66, 31], [x * .7, 79, 24], 2, '#9b947e');
    p.tube(g, [x * .7, 79, 24], [x * .7, 82, 17], 1.2, '#a6a18b');
  }
  return g;
}

function makeAttic(p: VideoProps, root: THREE.Group) {
  p.box(root, 1060, 6, 900, '#3c3830', [0, -6, -259]);
  p.box(root, 700, 315, 9, '#46392f', [0, 148, -300]);
  for (let r = 0; r < 15; r++) {
    p.box(root, 700, 15.2, 2, ['#3c332b','#4c3e31','#544533','#42392f'][r % 4], [0, 10 + r * 17, -294]);
  }
  const rafters = p.ink(root);
  rafters.begin();
  for (const z of [-298, -200, -101, -25]) {
    for (const side of [-1, 1]) {
      p.tube(root, [side * 291, 106, z], [side * 170, 260, z], 6.2, '#77614b');
      p.tube(root, [side * 170, 260, z], [0, 377, z], 6.2, '#695745');
      p.tube(root, [side * 286, 1, z], [side * 292, 106, z], 4, '#524535');
      p.tube(root, [side * 290, 179, z], [side * 206, 198, z], 3.6, '#544535');
    }
    for (let j = 0; j < 12; j++) {
      const x = (j - 5.5) * 57;
      p.line(rafters, [[x, 0, z], [x + 3, 0, z + 80]], '#6d5c4b', .8);
    }
  }
  rafters.end();
  p.tube(root, [0, 268, -71], [0, 349, -71], 1.1, '#978a71');
  p.oval(root, [0, 263, -71], [6, 9, 6], '#d3c294');
  windowFrame(p, root, -109, 173, -290, 57, 93);
  for (let i = 0; i < 13; i++) {
    const x = (i % 2 ? -1 : 1) * (164 + i % 4 * 32);
    const y = 20 + (i % 3) * 14;
    const z = -109 - i % 5 * 31;
    p.box(root, 36 + i % 4 * 15, 2 * y, 46, i % 3 ? '#695c47' : '#544b3c', [x, y, z]);
    p.box(root, 18, 6, 2, '#84775e', [x, y * 1.31, z + 24]);
  }
  const typewriter = group(root, [0, 0, 77]);
  p.box(typewriter, 117, 8, 70, '#594936', [0, 75, 0]);
  for (const x of [-46, 46]) p.tube(typewriter, [x, 0, 10], [x, 75, 10], 3.2, wood);
  p.box(typewriter, 75, 19, 42, '#242527', [0, 88, 2]);
  p.box(typewriter, 69, 6, 27, '#353332', [0, 97, -1]);
  const keys = Array.from({length: 38}, (_, i) => {
    const x = (i % 10 - 4.5) * 5.6;
    return p.oval(typewriter, [x, 99 - Math.floor(i / 10), 3 + Math.floor(i / 10) * 5], [1.9, .95, 1.95], i % 3 ? '#baaf93' : '#dfcfb4');
  });
  const page = group(typewriter, [-12, 108, -12]);
  p.box(page, 42, 34, 1.8, '#c8b38e', [0, 7, 0]);
  for (let k = 0; k < 6; k++) {
    for (let j = 0; j < 12; j++) {
      if ((k + j * 3) % 7) p.box(page, 1.7, .63, .4, '#5c493e', [-17 + j * 2.95, 17 - 4 * k, 1.4]);
    }
  }
  p.tube(typewriter, [-40, 96, -11], [40, 96, -11], 2, '#736b58');
  const goats = group(root);
  const animals = [makeGoat(p, goats, 95, 91, true), makeGoat(p, goats, -106, 44, false), makeGoat(p, goats, 130, -24, true)];
  const tape = group(root, [170, 0, 89]);
  p.box(tape, 105, 6, 74, '#624e37', [0, 69, 0]);
  p.box(tape, 73, 19, 47, '#262627', [0, 81, 0]);
  for (const x of [-16, 16]) p.oval(tape, [x, 92, 4], [10, 1, 10], '#585753');
  p.box(tape, 50, 3, 9, '#adc0a6', [0, 93, 18]);
  const torch = group(root, [40, 124, 100]);
  p.tube(torch, [0, 0, -17], [0, 0, 4], 4.1, '#655047');
  p.oval(torch, [0, 0, 5], [5.2, 5.2, 1.3], '#ebefc8');
  const glow = p.oval(torch, [0, 0, 9], [15, 15, 2.8], '#d4ebd7');
  Object.assign(glow.material, {transparent: true, depthWrite: false, opacity: .18});
  return {typewriter, page, keys, goats, animals, tape, torch};
}

function makeKitchen(p: VideoProps, root: THREE.Group) {
  p.box(root, 1100, 5, 840, '#6a5943', [0, -6, -192]);
  p.box(root, 1030, 385, 7, '#8b8470', [0, 185, -218]);
  const tiles = p.ink(root);
  tiles.begin();
  for (let i = -28; i <= 28; i++) p.line(tiles, [[i * 17, 71, -213], [i * 17, 242, -213]], '#b1a895', .75);
  for (let i = 4; i < 15; i++) p.line(tiles, [[-496, i * 17, -213], [496, i * 17, -213]], '#b6a998', .75);
  tiles.end();
  for (let i = 0; i < 10; i++) {
    const x = (i - 4.5) * 69;
    p.box(root, 65, 90, 41, i % 2 ? '#584b3c' : '#615343', [x, 234, -193]);
    p.box(root, 59, 82, 2, '#6e5d47', [x, 234, -171]);
    p.tube(root, [x + 18, 209, -167], [x + 18, 227, -167], 1.3, '#b0a082');
    p.box(root, 66, 76, 65, '#4c3e34', [x, 42, -174]);
    p.box(root, 63, 12, 69, '#aea28c', [x, 83, -169]);
  }
  p.box(root, 79, 183, 69, '#634d3f', [-312, 94, -116]);
  p.box(root, 76, 4, 3, '#262c2c', [-312, 126, -79]);
  for (const y of [105, 142]) p.tube(root, [-288, y - 10, -77], [-288, y + 17, -77], 2.5, '#ab967b');
  const stove = group(root, [168, 0, -99]);
  p.box(stove, 101, 81, 83, '#675b47', [0, 43, 0]);
  p.box(stove, 103, 5, 84, '#302c2b', [0, 86, 0]);
  p.box(stove, 102, 25, 7, '#a18f70', [0, 100, -36]);
  p.box(stove, 69, 50, 3, '#353634', [0, 43, 43]);
  for (const x of [-25, 25]) {
    p.mesh(stove, new THREE.TorusGeometry(13, 1.4, 6, 24), [x, 90, 15], '#957d60').rotation.x = Math.PI / 2;
    p.oval(stove, [x, 102, -30], [4, 4, 1.8], '#504138');
  }
  p.oval(stove, [-33, 99, -6], [13, 13, 14], '#32403c');
  const flames = Array.from({length: 22}, (_, i) => p.mesh(stove,
    new THREE.ConeGeometry(5 + i % 4, 31 + i % 5 * 11, 7), [0, 106, 11], ['#ee8340','#f5bc65','#f1d8a2','#e38952'][i % 4]));
  const chair = group(root, [-34, 0, -10]);
  p.oval(chair, [0, 56, 2], [22, 5, 25], '#816647');
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) p.tube(chair, [side * 18, 54, end * 19], [side * 22, 0, end * 23], 2.8, '#a88456');
    p.tube(chair, [side * 18, 59, -19], [side * 19, 114, -21], 3.1, '#8f7351');
  }
  const bent = p.ink(chair);
  bent.begin();
  for (const x of [-11, 11]) p.ring(bent, [x, 97, -21], [12, 0, 0], [0, 18, 0], '#b38a54', 2.7);
  bent.end();
  const floorShards = Array.from({length: 17}, (_, i) => {
    const m = p.mesh(root, new THREE.TetrahedronGeometry(5 + i % 3), [Math.sin(i * 3.31) * 166, 1, 58 + Math.cos(i * 1.81) * 96], '#6f8380');
    m.scale.y = .28;
    return m;
  });
  const shadow = group(root, [187, 0, -155]);
  p.oval(shadow, [0, 141, 0], [24, 26, 1], '#342d29');
  p.oval(shadow, [1, 92, 0], [24, 39, 1], '#352e2a');
  for (const side of [-1, 1]) p.tube(shadow, [side * 10, 158, 0], [side * 24, 182, 0], 2.6, '#342d29');
  return {flames, chair, floorShards, shadow};
}

export function makeDemonsSets(p: VideoProps, scene: THREE.Scene) {
  const rooms: Record<DemonsRoom, THREE.Group> = {
    card: group(scene), outside: group(scene), bedroom: group(scene),
    bathroom: group(scene), attic: group(scene), kitchen: group(scene),
  };
  letters(p, rooms.card, 'DEMONS', [0, 171, 0], 9, '#ab3238', 2.1);
  const outside = makeOutdoor(p, rooms.outside);
  const bedroom = makeBedroom(p, rooms.bedroom);
  const bath = makeBathroom(p, rooms.bathroom);
  const attic = makeAttic(p, rooms.attic);
  const kitchen = makeKitchen(p, rooms.kitchen);

  function update(s: State) {
    const {view, t, pulse} = s;
    outside.sale.visible = t < 21;
    outside.mailbox.visible = t > 200;
    outside.wheel.visible = view === 'demons-driver';
    outside.car.visible = view === 'demons-car' || view === 'demons-house' || view === 'demons-last-house';
    outside.car.position.set(t < 21 ? -233 : 245 - s.car * 867, 0, t < 21 ? 93 : 210);
    outside.beams.visible = t > 213.3 && t < 220;
    outside.car.rotation.y = t < 21 ? -.33 : -.08;
    bedroom.ceiling.visible = view !== 'demons-sleep';
    bedroom.duvet.rotation.x = .016 * Math.sin(t * 1.75);
    bedroom.tv.material.color.set(t % .14 < .039 ? '#81b5bd' : '#a1d8de');
    for (const [i, line] of bedroom.scan.entries()) line.visible = (i + Math.floor(t * 34)) % 6 !== 0;
    for (const [i, child] of bedroom.children.entries()) {
      const escape = view === 'demons-escape' || view === 'demons-mailbox';
      child.root.visible = view === 'demons-tv-children' || escape;
      if (child.root.parent !== rooms[s.room]) rooms[s.room].add(child.root);
      child.root.position.set(escape ? (i ? 78 : -48) - (t - 206) * 9 : 62 + i * 52, escape ? 3 * Math.abs(Math.sin(t * 9 + i)) : 4, escape ? 24 - i * 30 : -25);
      child.root.rotation.y = escape ? .42 : Math.PI + .1 * i;
      child.head.rotation.z = .07 * Math.sin(t * 1.4 + i);
    }
    bath.curtain.visible = view === 'demons-shower' || view === 'demons-tub';
    const open = THREE.MathUtils.smoothstep(t, 82.9, 87.5);
    bath.curtain.scale.x = 1 - .8 * open;
    bath.curtain.position.x = 109 * open;
    bath.water.rotation.y = .055 * Math.sin(pulse);
    bath.claw.visible = /claw|reach|overhead|eye-mark/.test(view);
    bath.claw.position.set(view === 'demons-claw' ? 58 : 63, 63 + 17 * Math.sin(pulse * .24), view === 'demons-claw' ? 20 : -38);
    bath.claw.rotation.z = -.3 + .24 * Math.sin(t * 2.1);
    attic.typewriter.visible = s.typing;
    attic.goats.visible = s.typing && view !== 'demons-page' && view !== 'demons-keys';
    attic.tape.visible = view === 'demons-tape' || view === 'demons-investigate';
    attic.torch.visible = view === 'demons-flashlight' || view === 'demons-investigate' || view === 'demons-homeowner';
    attic.torch.position.x = 40 + Math.sin(t * 1.02) * 4;
    attic.page.position.y = 108 + 2.5 * Math.sin(t * .63);
    for (const [i, key] of attic.keys.entries()) key.position.y = 99 - Math.floor(i / 10) - (Math.floor(t * 13) % 38 === i ? .8 : 0);
    for (const [i, goat] of attic.animals.entries()) goat.rotation.y = .5 * Math.sin(t * .69 + i * 2);
    kitchen.chair.visible = view === 'demons-chair';
    kitchen.chair.rotation.z = .07 * Math.sin(t * 4);
    kitchen.shadow.visible = view === 'demons-kitchen-shadow';
    kitchen.shadow.scale.setScalar(1 + .1 * Math.sin(pulse));
    for (const [i, flame] of kitchen.flames.entries()) {
      flame.visible = t > 179.5;
      const q = t * (8 + i % 4) + i * 2.397;
      flame.position.set(Math.sin(i * 2.397) * 41 + Math.sin(q) * 4, 95 + (i % 5) * 6 + Math.sin(q * 1.37) * 5, (i % 3) * 18 - 18);
      flame.rotation.z = .23 * Math.cos(q);
      flame.scale.y = .55 + .53 * Math.abs(Math.sin(q * .7));
    }
    for (const shard of kitchen.floorShards) shard.visible = t > 193;
  }

  return {rooms, outside, bedroom, bath, attic, kitchen, update};
}
