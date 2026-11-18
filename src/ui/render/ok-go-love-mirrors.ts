import * as THREE from 'three';
import type {LovePattern} from '../../scene/ok-go-love.ts';

const modes:Record<LovePattern,number>={none:0,ellipse:1,triangle:2,balloons:3,split:4,tunnel:5,prism:6,crystal:7};

const fragment=`
uniform sampler2D portrait;
uniform float clock;
uniform float mode;
uniform float fade;
varying vec2 mirrorUv;
const float PI = 3.14159265359;

vec3 reflection(vec2 uv) {
  return texture2D(portrait, clamp(uv, vec2(0.005), vec2(0.995))).rgb;
}

void main() {
  vec2 p = (mirrorUv - 0.5) * 2.0;
  float radius = length(p);
  float phase = atan(p.y, p.x);
  vec3 tint = vec3(0.55, 0.43, 0.24);
  vec3 image = vec3(0.04, 0.05, 0.07);
  float seam = 0.0;

  if (mode == 4.0) {
    vec2 tile = floor(mirrorUv * vec2(3.0, 2.0));
    vec2 uv = fract(mirrorUv * vec2(3.0, 2.0));
    uv.x = mix(uv.x, 1.0 - uv.x, mod(tile.x + tile.y, 2.0));
    image = reflection(uv * 0.91 + 0.045);
    vec2 at = min(uv, 1.0 - uv);
    seam = 1.0 - smoothstep(0.004, 0.017, min(at.x, at.y));
  } else if (mode == 5.0) {
    float edge = max(abs(p.x), abs(p.y));
    float ring = -log(max(edge, 0.035)) / 0.368;
    vec2 uv = p * exp(0.368 * floor(ring));
    uv.x *= mod(floor(ring), 2.0) * 2.0 - 1.0;
    image = reflection(uv * 0.48 + 0.5) * exp(-0.06 * ring);
    seam = 1.0 - smoothstep(0.015, 0.075, fract(ring));
    tint = vec3(0.44, 0.63, 0.61);
  } else if (mode == 7.0) {
    vec2 grid = mirrorUv * vec2(7.0, 4.0);
    vec2 ij = floor(grid);
    vec2 uv = fract(grid);
    uv.x = mix(uv.x, 1.0 - uv.x, mod(ij.x + ij.y, 2.0));
    image = reflection(uv * 0.91 + 0.04);
    vec2 at = min(uv, 1.0 - uv);
    seam = 1.0 - smoothstep(0.008, 0.043, min(at.x, at.y));
    tint = mix(vec3(0.78, 0.51, 0.22), vec3(0.18, 0.64, 0.87),
      0.5 + 0.5 * sin(clock * 0.77));
    image += tint * (0.23 + 0.10 * sin(ij.x * 2.9 + ij.y * 0.8 + clock));
  } else {
    float sides = mode == 1.0 ? 9.0 : mode == 2.0 ? 6.0 : 12.0;
    float a = (phase + clock * 0.095) / (2.0 * PI) * sides;
    float unit = abs(fract(a) * 2.0 - 1.0);
    float tier = fract(radius * (mode == 1.0 ? 2.65 : 3.8) + 0.035 * sin(clock));
    image = reflection(vec2(0.12 + unit * 0.76, 0.10 + tier * 0.80));
    seam = max(smoothstep(0.936, 0.988, unit), smoothstep(0.958, 1.0, tier));
    if (mode == 1.0) {
      if (radius > 1.0) discard;
      seam = max(seam, smoothstep(0.974, 0.995, radius));
    }
    if (mode == 2.0) {
      float wall = min(p.y + 0.89, 0.96 - abs(p.x) * 1.65 - p.y);
      if (wall < 0.0) discard;
      seam = max(seam, 1.0 - smoothstep(0.005, 0.085, wall));
      tint = vec3(0.47 + 0.30 * unit, 0.26 + 0.42 * tier, 0.42 + 0.29 * (1.0-unit));
    }
    if (mode == 3.0) {
      vec2 xy = vec2(fract(a) - 0.5, tier - 0.5);
      float sphere = length(xy * vec2(1.0, 0.87));
      float body = 1.0 - smoothstep(0.34, 0.425, sphere);
      float color = floor(radius * 3.8) * 1.19 + floor(a) * 0.91 + 0.18 * clock;
      vec3 fruit = 0.53 + 0.46 * cos(color + vec3(0.1, 2.1, 4.0));
      fruit *= 0.72 + 0.28 * (1.0 - smoothstep(0.0, 0.50, sphere));
      fruit += vec3(0.26) * (1.0 - smoothstep(0.035, 0.25, length(xy - vec2(-0.12, 0.09))));
      image = mix(image * 0.43, fruit, body);
      tint = vec3(0.28, 0.51, 0.34);
    }
    if (mode == 6.0) {
      vec3 rainbow = 0.55 + 0.45 * cos(radius * 12.0 + floor(a) * 0.41 + clock * 0.28 + vec3(0.0, 2.1, 4.2));
      image = image * (0.50 + 0.60 * rainbow) + rainbow * 0.10;
      tint = 0.38 + rainbow * 0.43;
    }
  }
  gl_FragColor = vec4(clamp(image * 1.14 + tint * seam * 0.72, 0.0, 1.0), fade);
}`;

/** One live mouth render feeds every mirror surface and fold. */
export class LoveMirrors {
  readonly target=new THREE.WebGLRenderTarget(448,448,{depthBuffer:true});
  readonly material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{portrait:{value:this.target.texture},clock:{value:0},mode:{value:0},fade:{value:1}},
    vertexShader:`
      varying vec2 mirrorUv;
      void main() {
        mirrorUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader:fragment,
  });
  readonly screen=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material);

  constructor(scene:THREE.Scene){
    this.target.texture.repeat.x=-1;
    this.target.texture.offset.x=1;
    scene.add(this.screen);
  }

  pose(pattern:LovePattern,t:number,fade:number){
    this.screen.visible=pattern!=='none'&&fade>.001;
    this.material.uniforms.clock.value=t;
    this.material.uniforms.mode.value=modes[pattern];
    this.material.uniforms.fade.value=fade;
  }

  capture(renderer:THREE.WebGLRenderer,scene:THREE.Scene,camera:THREE.Camera){
    const previous=renderer.getRenderTarget();
    try{
      renderer.setRenderTarget(this.target);
      renderer.clear();
      renderer.render(scene,camera);
    }finally{renderer.setRenderTarget(previous);}
  }

  dispose(){
    this.screen.geometry.dispose();
    this.material.dispose();
    this.target.dispose();
  }
}
