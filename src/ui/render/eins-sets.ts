import * as THREE from 'three';
import {einsState, type EinsRoom} from '../../scene/eins-zwei-drei.ts';
import {VideoProps, type VideoPoint as Point} from './videoProps.ts';
import {propGroup} from './lithonia-set.ts';

const teal = '#437776';
const casing = '#223037';
const amber = '#ffd878';
const pink = '#fb708c';
const aqua = '#6fe9dc';
const glyphs: Record<string, string[]> = {
  E:['1111','1000','1110','1000','1111'], I:['111','010','010','010','111'],
  N:['1001','1101','1011','1001','1001'], S:['0111','1000','0110','0001','1110'],
  Z:['1111','0001','0110','1000','1111'], W:['10001','10001','10101','11011','10001'],
  D:['1110','1001','1001','1001','1110'], R:['1110','1001','1110','1010','1001'],
  '1':['010','110','010','010','111'], '2':['1110','0001','0110','1000','1111'],
  '3':['1110','0001','0110','0001','1110'], ' ':['00','00','00','00','00'],
};
export function einsLetters(p: VideoProps, parent: THREE.Object3D, text: string, at: Point, unit: number, color: string) {
  const root = propGroup(parent, at);
  const width = [...text].reduce((sum, ch) => sum + glyphs[ch][0].length + 1, 0);
  let x = -.5 * (width - 2) * unit;
  for (const char of text) {
    const pattern = glyphs[char];
    for (const [y, row] of pattern.entries()) for (const [i, pixel] of [...row].entries()) {
      if (pixel === '1') p.box(root, unit * .9, unit * .9, .55, color, [x + i * unit, (2 - y) * unit, 0]);
    }
    x += (pattern[0].length + 1) * unit;
  }
  return root;
}

function crt(p: VideoProps, parent: THREE.Object3D, pos: Point, width: number, height: number, screen: string) {
  const frame = propGroup(parent, pos);
  p.box(frame, width, height, width * .38, '#6a766d', [0, 0, 0]);
  p.box(frame, width * .88, height * .83, 2.6, '#202b2c', [0, 0, width * .205]);
  const display = p.box(frame, width * .76, height * .65, 1.3, screen, [0, 1, width * .243]);
  for (let i = 0; i < 7; i++) p.box(frame, width * .75, .3, .4, '#273b3c',
    [0, (i - 3) * height * .087 + 1, width * .254]);
  for (let i = 0; i < 3; i++) p.oval(frame, [width * (.28 - i * .092), -height * .423, width * .221],
    [1.2, 1.2, .5], i ? '#adb591' : '#f28c78');
  return {frame, display};
}

function telephone(p: VideoProps, room: THREE.Group, at: Point, color: string) {
  const root = propGroup(room, at);
  p.oval(root, [0, 4, 0], [18, 6, 12], color);
  p.oval(root, [0, 10, 3], [8, 1.8, 7], '#dbc9a9');
  for (let i = 0; i < 9; i++) {
    const q = i * Math.PI * 2 / 9;
    p.oval(root, [Math.sin(q) * 5.9, 11.65, 3 + Math.cos(q) * 5.9], [1.3, .35, 1.1], '#594c48');
  }
  p.tube(root, [-13, 13, -2], [13, 13, -2], 2.4, color);
  for (const s of [-1, 1]) p.oval(root, [s * 11, 13, 0], [5.2, 3, 5.6], color);
}

function desk(p: VideoProps, room: THREE.Group, z: number, props: boolean) {
  const d = propGroup(room, [0, 0, z]);
  p.box(d, 247, 9, 91, '#9b6846', [0, 79, 0]);
  p.box(d, 236, 59, 8, '#884329', [0, 45, 37]);
  for (let i = 0; i < 6; i++) p.box(d, 229, .9, 1, '#bd7957', [0, 26 + i * 8, 41.5]);
  for (const x of [-116, 116]) for (const zz of [-34, 34]) {
    p.box(d, 9, 77, 9, '#4b4440', [x, 38.5, zz]);
  }
  if (!props) return d;
  telephone(p, d, [-50, 83, 23], '#bb4d42');
  telephone(p, d, [56, 83, 19], '#436e64');
  telephone(p, d, [99, 83, 23], '#343d46');
  const crtDesk = crt(p, d, [-94, 112, -16], 49, 47, '#bd557e');
  crtDesk.frame.rotation.y = -.16;
  const scope = crt(p, d, [115, 96, -11], 32, 24, '#80bdcb');
  scope.frame.rotation.y = -.18;
  p.oval(d, [-65, 86, -15], [16, 3, 11], '#548e9a');
  p.tube(d, [-65, 85, -15], [-65, 119, -15], 2, '#6ea9b2');
  p.tube(d, [-65, 118, -15], [-82, 129, 3], 2, '#86bfc4');
  p.mesh(d, new THREE.ConeGeometry(10, 18, 17, 1, true), [-86, 124, 6], '#78b6be').rotation.z = -.62;
  for (let i = 0; i < 18; i++) {
    const x = ((i * 23) % 113) - 56;
    const sheet = p.box(d, 28 + i % 3 * 5, .8, 18, ['#d8cdb4','#b5c2bd','#e4ce8e','#5e7a8b'][i % 4],
      [x, 84 + i % 5 * .55, -20 + (i * 13) % 51]);
    sheet.rotation.y = Math.sin(i * 2.12) * .46;
  }
  p.mesh(d, new THREE.CylinderGeometry(7, 5.4, 12, 19), [-77, 90, 32], '#e2dbc4');
  p.mesh(d, new THREE.TorusGeometry(4.2, 1, 5, 17), [-83, 90, 32], '#dfd9c7');
  for (let i = 0; i < 11; i++) p.oval(d, [-77 + Math.sin(i * 2.4) * 4.2, 96.2, 32 + Math.cos(i * 2.4) * 4.2],
    [1.1, .59, 1.1], i % 3 ? '#bc783d' : '#eeaf57');
  p.box(d, 44, 5, 25, '#c7c1a8', [5, 86, 27]);
  for (let i = 0; i < 36; i++) p.box(d, 2.6, .8, 2.7, '#675c4e', [(i % 12 - 5.5) * 3.15 + 5, 89, 20 + 4.1 * Math.floor(i / 12)]);
  return d;
}

function buildOffice(p: VideoProps, room: THREE.Group) {
  p.box(room, 1250, 6, 1220, '#46585c', [0, -5, -300]);
  p.box(room, 890, 440, 9, '#364e51', [0, 218, -269]);
  p.box(room, 889, 64, 6, '#3e605f', [0, 34, -262]);
  p.box(room, 134, 265, 10, '#6b6450', [22, 131, -258]);
  p.box(room, 115, 251, 6, '#835e46', [22, 128, -250]);
  p.box(room, 31, 86, 2, '#c0baa0', [-3, 169, -245]);
  p.oval(room, [67, 117, -245], [4, 4, 3], amber);
  for (let i = 0; i < 3; i++) {
    const x = -129 - i * 47;
    p.mesh(room, new THREE.CircleGeometry(15, 25), [x, 228 - i * 6, -258], '#bdbfa4');
    p.tube(room, [x, 224, -257], [x + 5 - i * 2, 237 - i * 6, -257], .8, '#454848');
  }
  for (const sign of [-1, 1]) {
    const shelf = propGroup(room, [sign * 173, 0, -159]);
    for (const x of [-53, 52]) p.box(shelf, 5, 241, 5, '#635f50', [x, 119, 0]);
    for (let row = 0; row < 5; row++) {
      p.box(shelf, 106, 5, 40, '#4b5553', [0, 9 + row * 48, -11]);
      for (let i = 0; i < 5; i++) {
        const height = 14 + (i * 9 + row * 8) % 28;
        p.box(shelf, 13 + i % 2 * 4, height, 24,
          ['#ba8764','#536b77','#777d64','#455c57','#9e715e'][(row + i) % 5],
          [(i - 2) * 19, 13 + row * 48 + height * .5, -10]);
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const x = -205 + i * 65;
    const y = 235 + Math.sin(i * 2.1) * 23;
    p.box(room, 25, 31, 2.5, i % 3 ? '#70847a' : '#ae9675', [x, y, -251]);
    p.box(room, 21, 26, 1, i % 3 ? '#31494a' : '#745541', [x, y, -249]);
  }
  p.box(room, 123, 11, 17, '#84acb5', [0, 276, -88]);
  p.box(room, 113, 5, 13, '#bce2e1', [0, 271.5, -87]);
  p.mesh(room, new THREE.CylinderGeometry(8, 8, 39, 20), [119, 24, 37], '#c54e4b');
  p.tube(room, [119, 44, 36], [116, 49, 36], 2.5, '#4d5152');
  const officeDesk = desk(p, room, 53, true);
  const pinkPos: Point = [-94, 112, 37];
  const pinkUnit = propGroup(room, pinkPos);
  p.box(pinkUnit, 64, 58, 18, '#bfbb9f', [0, 16, -10]);
  p.box(pinkUnit, 55, 49, 2.5, '#c25080', [0, 16, 0]);
  for (const x of [-19, 19]) {
    p.oval(pinkUnit, [x, 27, 2], [8, 8, 2.5], '#689fa4');
    p.oval(pinkUnit, [x, 27, 4], [3, 3.5, 1.6], '#252f3c');
  }
  p.box(pinkUnit, 24, 2.3, 1.5, '#373c3f', [13, -9, 3]);
  return {officeDesk, pinkUnit};
}

function modular(p: VideoProps, room: THREE.Group, x: number, color: string) {
  const rack = propGroup(room, [x, 0, -160]);
  p.box(rack, 94, 231, 41, '#2b353e', [0, 117, -16]);
  for (let i = 0; i < 3; i++) {
    p.box(rack, 88, 56, 2.7, i % 2 ? '#25363b' : '#353842', [0, 51 + i * 68, 7]);
    p.box(rack, 88, 4, 4, '#5e6465', [0, 23 + i * 68, 10]);
  }
  const leds: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let row = 0; row < 7; row++) for (let col = 0; col < 10; col++) {
    const y = 33 + row * 25.4;
    const k = (col - 4.5) * 7.7;
    if ((col + row) % 3 === 0) {
      const l = p.oval(rack, [k, y, 11.6], [1.63, 1.63, 1], color);
      leds.push(l);
    } else {
      p.mesh(rack, new THREE.CircleGeometry(1.7 + (row % 2) * .5, 8), [k, y, 11.8], '#97a2a6');
      p.mesh(rack, new THREE.CircleGeometry(.8, 8), [k, y, 12], '#17222a');
    }
  }
  const ink = p.ink(rack);
  ink.begin();
  for (let j = 0; j < 9; j++) {
    const beginX = Math.sin(j * 2.2) * 31;
    const endX = Math.cos(j * 1.7) * 31;
    const startY = 55 + j % 4 * 33;
    const endY = 57 + j % 5 * 26;
    p.line(ink, Array.from({length: 19}, (_, i) => {
      const u = i / 18;
      return [beginX + u * (endX - beginX), startY + u * (endY - startY) - (17 + j % 4 * 4) * Math.sin(Math.PI*u),
        12 + Math.sin(Math.PI*u) * (7 + j % 3 * 3)] as Point;
    }), ['#cf8b5d','#669fa8','#95616c','#d2b275'][j % 4], 1.35);
  }
  ink.end();
  return {rack, leds};
}

function keyboard(p: VideoProps, parent: THREE.Group, x: number) {
  const root = propGroup(parent, [x, 0, 26]);
  p.box(root, 82, 8, 25, casing, [0, 76, 0]);
  for (let i = 0; i < 16; i++) {
    p.box(root, 3.9, 1.3, 17, '#b7c4b9', [(i - 7.5)*4.4, 81, 1]);
    if (i % 5 !== 1) p.box(root, 2.4, 1.7, 10, '#293338', [(i - 7.05)*4.4, 82, -3]);
  }
  for (const sign of [-1, 1]) p.tube(root, [sign * 32, 1, -4], [-sign * 32, 70, -4], 1.5, '#52616a');
}

function buildSynthStage(p: VideoProps, room: THREE.Group) {
  p.box(room, 1420, 6, 1420, '#493e44', [0, -5, -293]);
  p.box(room, 1360, 540, 8, '#243844', [0, 262, -250]);
  p.box(room, 568, 3, 5, '#767b8a', [0, 233, -220]);
  p.box(room, 584, 3, 5, '#bb5f79', [0, 12, -199]);
  const modules = [-196, -98, 0, 98, 196].map((x,i) => modular(p, room, x, i % 2 ? amber : pink));
  const screens = [-249, 249].flatMap(x => [56, 109, 163, 214].map((y,i) => crt(p, room, [x,y,-147], 47, 43,
    i % 2 ? '#93c9c1' : '#b97f97')));
  keyboard(p, room, -173);
  keyboard(p, room, 173);
  const paths = p.ink(room);
  paths.begin();
  for (let j = 0; j < 8; j++) p.line(paths, Array.from({length: 21}, (_, i) => {
    const u = i / 20;
    return [(j - 3.5)*53 + Math.sin(u*5+j)*30, .6, u*162-160] as Point;
  }), j % 2 ? '#242b31' : '#5a5960', 1.45);
  paths.end();
  const deskOnStage = desk(p, room, 65, true);
  const panelHand = propGroup(room, [78, 121, -105]);
  p.tube(panelHand, [29,-22,40], [4,-4,4], 8, '#b34d41');
  p.oval(panelHand, [0,0,0], [8,5,5], '#c79578');
  for (let i = 0; i < 3; i++) p.tube(panelHand, [-4,-i*2,1], [-12,-i*2-1,-3], 1.6, '#c59880');
  return {modules, screens, deskOnStage, panelHand};
}

function car(p: VideoProps, room: THREE.Group) {
  const root = propGroup(room);
  const orange = '#d97a4b';
  p.box(root, 135, 43, 175, orange, [0, 35, 0]);
  p.box(root, 132, 5, 169, '#ba623d', [0, 58, 0]);
  p.box(root, 115, 44, 107, orange, [0, 75, -21]);
  p.box(root, 124, 8, 110, '#df8b69', [0, 102, -22]);
  p.box(root, 104, 34, 4, '#345e64', [0, 79, 34]);
  p.box(root, 106, 34, 4, '#284a58', [0, 79, -77]);
  for (const s of [-1, 1]) {
    p.box(root, 2, 33, 86, '#3f6468', [s * 58, 79, -20]);
    for (const z of [-59, 58]) {
      p.mesh(root, new THREE.CylinderGeometry(18,18,13,22), [s*66,19,z], '#252a30').rotation.z = Math.PI / 2;
      const hub = p.mesh(root, new THREE.CircleGeometry(9,18), [s*73,19,z], '#a4a4a0');
      hub.rotation.y = s * Math.PI / 2;
    }
    p.box(root, 106, 3, 24, '#cc654a', [s * 111, 61, -19]).rotation.z = s * .07;
    p.tube(root, [s*17,160,-37], [s*162,61,-29], 1, '#bdac86');
    p.oval(root, [s*47,42,89], [13,13,5], '#393a3c');
    p.oval(root, [s*47,42,93], [10,10,2.1], amber);
    p.oval(root, [s*50,36,-88], [9,5.5,2], '#d26763');
  }
  p.box(root, 49, 25, 6, '#31373c', [0, 40, 89]);
  for (let i = 0; i < 7; i++) p.box(root, 47, 1.1, 1, '#7d7d79', [0, 31 + i*2.6, 93]);
  p.box(root, 140, 7, 8, '#8f9190', [0, 22, 90]);
  p.box(root, 93, 5, 81, '#86785c', [0, 108, -16]);
  const gear = propGroup(root, [0, 0, -22]);
  p.box(gear, 69, 49, 51, casing, [0, 133, 0]);
  p.box(gear, 75, 9, 54, '#a6a994', [0, 162, 0]);
  for (let i = 0; i < 30; i++) p.box(gear, 2.5, 2.5, 1.1, ['#72a2a2','#c18672','#d4bd84'][i % 3],
    [(i%10-4.5)*5.7,120+Math.floor(i/10)*12,26]);
  p.mesh(gear, new THREE.CylinderGeometry(6.2,6.2,53,15), [-39,130,1], '#c95049').rotation.z = -.18;
  for (const x of [-23, 7, 26]) p.tube(gear, [x,115,28], [x + 4,159,27], 1.15, '#d3a468');
  return root;
}

function buildGarage(p: VideoProps, room: THREE.Group) {
  p.box(room, 1330, 6, 1250, '#3b4e54', [0,-5,-300]);
  p.box(room, 1210, 490, 8, '#1a2a37', [0, 244,-323]);
  const mini = car(p, room);
  const dash = propGroup(room);
  p.box(dash, 265, 30, 25, '#31393b', [0, 79, 110]);
  p.box(dash, 262, 70, 24, '#a35e4a', [0, 29, 113]);
  p.box(dash, 248, 8, 8, '#c5a684', [0, 47, 126]);
  p.box(dash, 264, 15, 11, '#a35e4a', [0, 199, 100]);
  p.box(dash, 267, 137, 16, '#244550', [0,135,-62]);
  for (const s of [-1,1]) p.tube(dash, [s*107,85,108], [s*91,195,101], 6, '#708381');
  const wheel = propGroup(dash, [-19, 101, 112]);
  p.mesh(wheel, new THREE.TorusGeometry(30,4,8,36), [0,0,0], '#101d23').rotation.x = -.3;
  p.box(wheel, 57, 4, 3, '#3e4c52', [0,0,0]);
  const map = propGroup(room, [30,60,77]);
  p.box(map, 83, .9, 45, '#c4cfbe', [0,0,0]);
  const lines = p.ink(map); lines.begin();
  for (let i=0;i<10;i++) {
    const x = (i-4.5)*7;
    p.line(lines, [[x,.7,-20],[x + 9,.7,-8],[x + 1,.7,7],[x+10,.7,20]], i % 3 ? '#85a7a6' : '#ae8371', 1.1);
  }
  lines.end();
  const breakfast = propGroup(room, [79, 84, 95]);
  p.box(breakfast, 78, 4, 51, '#c7beaa', [0,0,0]);
  p.box(breakfast, 77, 43, 4, '#d8cebb', [0,20,-24]).rotation.x = .4;
  for (let i=0;i<18;i++) p.oval(breakfast, [Math.sin(i*2.4)*26,3+Math.cos(i)*1.3,Math.cos(i*2.4)*16],
    [6.2,1.5,4.2], i%3 ? '#a9673d' : '#d18045');
  for (const x of [-18,14]) {
    p.oval(breakfast, [x,5.4,2], [13,1.8,10], '#dacda9');
    p.oval(breakfast, [x+1,7.4,2], [5.3,2.3,4.4], '#e9ae54');
  }
  const streaks = propGroup(room);
  const paths = p.ink(streaks);
  paths.begin();
  for (let i = 0; i < 43; i++) {
    const q = i * 2.4;
    p.line(paths, [[Math.cos(q)*60,91+Math.sin(q)*51,-100-i%4*19],
      [Math.cos(q)*(210+i%8*18),91+Math.sin(q)*196, 170 - i%6*32]],
    [amber,'#668e7c','#926f53'][i % 3], .94 + i % 4 * .31);
  }
  paths.end();
  return {mini, dash, wheel, map, breakfast, streaks};
}

function buildCoast(p: VideoProps, room: THREE.Group) {
  p.box(room, 1600, 9, 1840, '#7ea17d', [0,-6,-306]);
  p.box(room, 1800, 8, 1900, '#548d9e', [678,-32,-300]);
  p.box(room, 288, 4, 1100, '#7d8e72', [0,-1,-351]);
  for (const [i, x] of [-71,-29,29,71].entries()) {
    p.box(room, i % 2 ? 24 : 21, 1.1, 840, ['#bb4a4e','#d8d7c0','#d8d7c0','#506caa'][i], [x,1,-179]);
  }
  const ink = p.ink(room); ink.begin();
  for (let i=0;i<46;i++) {
    const x=330 + i%9*69,z=-774+Math.floor(i/9)*179+(i%4)*14;
    p.line(ink, [[x,-25,z],[x+32,-25,z+2],[x+70,-25,z-1]], '#9ebdc0', .8);
  }
  ink.end();
  for (let i=0;i<12;i++) {
    const x=183+i%5*29,z=-620+i*87;
    p.oval(room, [x,-15,z],[35+i%3*9,17,35+i%4*8], i%2?'#748479':'#607c77');
  }
  return {mini:car(p,room)};
}

export function buildEinsSets(p: VideoProps, scene: THREE.Scene) {
  const rooms: Record<EinsRoom, THREE.Group> = {
    office: propGroup(scene), stage: propGroup(scene), garage: propGroup(scene), coast: propGroup(scene), card: propGroup(scene),
  };
  const office = buildOffice(p,rooms.office);
  const synth = buildSynthStage(p,rooms.stage);
  const garage = buildGarage(p,rooms.garage);
  const coast = buildCoast(p,rooms.coast);
  const title = einsLetters(p, rooms.card, 'EINS ZWEI DREI', [0,177,0], 5.9, aqua);
  for (let i=0;i<7;i++) p.box(rooms.card, 372, i%2?1.6:2.6,2.5,
    [pink,amber,aqua][i%3], [0,132-i*4.1,-1]);

  function update(s: ReturnType<typeof einsState>) {
    for (const [name, room] of Object.entries(rooms)) room.visible = name === s.room;
    office.officeDesk.visible = s.view !== 'eins-pink';
    office.pinkUnit.visible = s.view === 'eins-pink';
    synth.deskOnStage.visible = s.desk;
    synth.panelHand.visible = s.view === 'eins-knob';
    synth.panelHand.rotation.z = .23 * Math.sin(s.cycle*.5);
    for (const [i,module] of synth.modules.entries()) for (const [j,light] of module.leds.entries()) {
      const on = (Math.floor(s.t*12)+i*5+j*3)%13>3;
      light.material.color.set(on ? [pink,amber,aqua][(i+j)%3] : '#38494d');
    }
    for (const [i,screen] of synth.screens.entries()) screen.display.material.color.set([aqua,pink,amber][(Math.floor(s.t*1.7)+i)%3]);
    garage.dash.visible = s.view.startsWith('eins-driver');
    garage.mini.visible = !garage.dash.visible && s.view !== 'eins-breakfast';
    garage.map.visible = s.view === 'eins-car-map';
    garage.breakfast.visible = s.view === 'eins-breakfast';
    garage.streaks.visible = s.view === 'eins-car-rush';
    garage.streaks.scale.set(1+.08*Math.sin(s.t*7),1+.1*Math.cos(s.t*6),1);
    garage.wheel.rotation.z = .16*Math.sin(s.t*4.1);
    garage.mini.position.z = s.view === 'eins-car-rush' ? 10*Math.sin(s.t*3) : -9;
    coast.mini.position.set(13*Math.sin(s.t*2),18+(s.view==='eins-coast'?11:0),31-(s.t-194.15)*32);
    coast.mini.rotation.z = .065 * Math.sin(s.t*1.8);
    title.rotation.y = .025*Math.sin(s.t);
  }
  return {rooms, office, synth, garage, coast, title, update};
}
