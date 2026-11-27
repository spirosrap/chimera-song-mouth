import * as THREE from 'three';
import { BASE_PATH } from '../../base.ts';
import { CINEMATIC_INFO, type CinematicSetting } from '../../scene/cinematic-videos.ts';
import type { VideoFigure, VideoProps } from './videoProps.ts';

export const CINEMATIC_WARDROBE = {
  teardrop: { jackets: ['#365b60'], hair: ['#c49a79'] },
  lotusflower: { jackets: ['#39393c'], hair: ['#a3a0a1'] },
  prodigybreathe: { jackets: ['#4c3538', '#5a591f', '#514e45'], hair: ['#bfa558', '#c97249'] },
  batforlashes: { jackets: ['#43395a'], hair: ['#ba91af'] },
  glorybox: { jackets: ['#542f42'], hair: ['#a26b70'] },
  basementhead: { jackets: ['#2b5576', '#465750', '#37476f'], hair: ['#7eaa72', '#81abc5'] },
  miabadgirls: { jackets: ['#a45342', '#665779', '#816044'], hair: ['#e7a77c', '#be7a72'] },
};

export const CINEMATIC_FIGURES: Record<CinematicSetting, number> = {
  teardrop: 1, lotusflower: 1, prodigybreathe: 3, batforlashes: 1, glorybox: 1, basementhead: 3, miabadgirls: 3,
};

const PALETTE = {
  teardrop:      { background: '#091e28', flare: '#61b9bc', trim: '#e0af8c', speed: .26, drift: .026, effect: 0 },
  lotusflower:   { background: '#141419', flare: '#bcb7bc', trim: '#d6d0ca', speed: .51, drift: .036, effect: 1 },
  prodigybreathe:{ background: '#1e1714', flare: '#da8738', trim: '#d3be67', speed: .76, drift: .047, effect: 2 },
  batforlashes:  { background: '#141324', flare: '#9070cb', trim: '#d9add4', speed: .34, drift: .031, effect: 3 },
  glorybox:      { background: '#24121a', flare: '#c68063', trim: '#e8bc88', speed: .20, drift: .024, effect: 4 },
  basementhead:  { background: '#10182e', flare: '#99c963', trim: '#a6ce9d', speed: .68, drift: .045, effect: 5 },
  miabadgirls:   { background: '#362033', flare: '#ce7769', trim: '#edbc84', speed: .62, drift: .042, effect: 6 },
} as const;

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragment = `
  uniform sampler2D art;
  uniform vec2 crop;
  uniform vec2 pan;
  uniform vec3 flare;
  uniform float elapsed;
  uniform float energy;
  uniform float effect;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = (vUv - .5) * crop + .5 + pan;
    vec3 paper = texture2D(art, uv).rgb;
    float field = 0.0;
    if (effect < .5) {
      float water = length((vUv - vec2(.37, -.07)) * vec2(1., 2.8));
      field = pow(.5 + .5 * cos(35. * water - elapsed * 2.2), 4.) * exp(-4. * water);
    } else if (effect < 1.5) {
      field = exp(-18. * abs(vUv.x + .31 * vUv.y - .48 - .09 * sin(elapsed * .38))) * .3;
    } else if (effect < 2.5) {
      field = exp(-length((vUv - vec2(.79, .32)) * vec2(5., 7.))) * (.3 + .32 * energy);
    } else if (effect < 3.5) {
      field = exp(-5. * abs(vUv.y - .20 - .043 * sin(vUv.x * 8. - elapsed * .55))) * .27;
    } else if (effect < 4.5) {
      field = exp(-9. * abs(vUv.x - .53 - (vUv.y - .6) * .12)) * pow(vUv.y, 2.) * .52;
    } else if (effect < 5.5) {
      field = exp(-24. * abs(vUv.y - fract(elapsed * .15))) * .2;
    } else {
      field = exp(-6. * abs(vUv.y - .25 + .04 * sin(vUv.x * 9. + elapsed * .8))) * .35;
    }

    float edge = length((vUv - .5) * vec2(1.21, 1.));
    float vignette = 1.02 - .37 * smoothstep(.14, .74, edge);
    float grain = (noise(floor(vUv * vec2(1231., 687.)) + mod(floor(elapsed * 12.), 37.)) - .5) * .005;
    gl_FragColor = vec4(max(vec3(0.), paper * vignette + flare * field * .13 + grain), 1.);
    #include <colorspace_fragment>
  }
`;

export class CinematicBackdrop {
  private readonly material: THREE.ShaderMaterial;
  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private texture?: THREE.Texture;
  private disposed = false;

  constructor(private readonly setting: CinematicSetting, scene: THREE.Scene) {
    const palette = PALETTE[setting];
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        art: { value: null }, crop: { value: new THREE.Vector2() }, pan: { value: new THREE.Vector2() },
        flare: { value: new THREE.Color(palette.flare) }, elapsed: { value: 0 }, energy: { value: 0 },
        effect: { value: palette.effect },
      },
      vertexShader: vertex, fragmentShader: fragment, depthTest: false, depthWrite: false, toneMapped: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.renderOrder = -100;
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  async load() {
    const { id } = CINEMATIC_INFO[this.setting];
    const texture = await new THREE.TextureLoader().loadAsync(`${BASE_PATH}scenes/${id}/set-art.webp`);
    if (this.disposed) {
      texture.dispose();
      return;
    }
    this.texture = texture;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.material.uniforms.art.value = texture;
    this.mesh.visible = true;
  }

  frame(time: number, aspect: number, shot: number, tight: boolean, intensity: number) {
    if (!this.texture) return;
    const image = this.texture.image as HTMLImageElement;
    const sourceAspect = image.width / image.height;
    const { speed, drift } = PALETTE[this.setting];
    const zoom = (tight ? .73 : .92) - .02 * Math.cos(time * .18);
    const x = zoom * Math.min(1, aspect / sourceAspect);
    const y = zoom * Math.min(1, sourceAspect / aspect);
    const uniforms = this.material.uniforms;
    uniforms.crop.value.set(x, y);
    const marginX = (1 - x) / 2;
    const marginY = (1 - y) / 2;
    uniforms.pan.value.set(
      THREE.MathUtils.clamp(marginX * .62 * Math.sin(shot * 2.37) + drift * Math.sin(time * speed), -marginX, marginX),
      THREE.MathUtils.clamp(marginY * .32 * Math.cos(shot * 1.41) + .016 * Math.sin(time * speed * .43), -marginY, marginY),
    );
    uniforms.elapsed.value = time;
    uniforms.energy.value = intensity;
  }

  dispose() {
    this.disposed = true;
    this.texture?.dispose();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

export function dressCinematicFigure(props: VideoProps, figure: VideoFigure, setting: CinematicSetting) {
  const { trim, flare } = PALETTE[setting];
  const root = figure.root;
  for (const side of [-1, 1]) {
    props.oval(root, [side * 16, -19.5, 4], [8, 4.2, 7], flare);
    props.tube(root, [side * 17, -23, 9], [side * 6, -43, 11.5], .65, trim);
    props.oval(root, [side * 10.3, -.9, 2.2], [1.2, 2.9, 1.3], trim);
  }
  for (let i = 0; i < 4; i++) {
    props.oval(root, [0, -41 - i * 6.3, 11.3], [1.25, 1.25, .75], trim);
  }
  if (setting === 'lotusflower') {
    props.oval(root, [0, 13, 0], [10.7, 6, 10.6], '#26242b');
    props.oval(root, [0, 9, 0], [14.7, 1.5, 12.5], '#39363f');
  } else if (setting === 'teardrop' || setting === 'batforlashes') {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        const petal = props.oval(root, [side * (13 + i * 1.5), -23 - i * 2.8, 3.6],
          [2.4, 7 - i * .55, 1.4], i % 3 === 0 ? trim : flare);
        petal.rotation.z = side * (.6 + i * .14);
      }
    }
  } else if (setting === 'prodigybreathe' || setting === 'basementhead') {
    const dial = props.ink(root);
    dial.begin();
    props.ring(dial, [0, -41, 12], [8, 0, 0], [0, 8, 0], flare, 1.5);
    props.ring(dial, [0, -41, 12], [4, 0, 0], [0, 4, 0], trim, 1);
    dial.end();
  } else {
    for (let i = 0; i < 5; i++) {
      const span = 17 - 2.4 * i;
      props.tube(root, [-span, -24 - 5 * i, 10], [span, -29 - 5 * i, 11], .62, i % 2 === 0 ? trim : flare);
    }
  }
}

export function buildCinematicSet(props: VideoProps, setting: CinematicSetting, view: string) {
  const { background, flare, trim, speed, effect } = PALETTE[setting];
  const root = new THREE.Group();
  const atmosphere = new THREE.Group();
  root.add(atmosphere);
  const close = /close|portrait/.test(view);
  const particles = Array.from({ length: close ? 16 : 32 }, (_, index) => {
    const color = index % 3 === 0 ? trim : flare;
    const center = (index * 137.5) % 1;
    const size = .4 + (index % 5) * .26;
    const mote = props.oval(atmosphere, [0, 0, -24], [size, size * (effect === 2 ? 3 : 1), size], color);
    const material = mote.material as THREE.MeshBasicMaterial;
    material.transparent = true;
    material.opacity = .37;
    material.depthWrite = false;
    return { mote, phase: index * 2.39996 + center };
  });
  const instrument = props.ink(root);
  instrument.begin();
  if (!close && (effect === 0 || effect === 5)) {
    for (let i = 0; i < 3; i++) {
      const radius = 45 + i * 23;
      props.ring(instrument, [0, 4 + i * .2, -39], [radius, 0, 0], [0, 0, radius * .57], flare, .8);
    }
  }
  instrument.end();
  const animate = (time: number) => {
    for (const [i, { mote, phase }] of particles.entries()) {
      const y = 7 + (i * 37 + time * (effect === 2 ? 63 : 14) * speed) % 235;
      mote.position.set(Math.sin(phase + time * speed * .4) * (close ? 63 : 186), y, -33 - 14 * (i % 7));
    }
  };
  return { root, background, features: [], animate };
}
