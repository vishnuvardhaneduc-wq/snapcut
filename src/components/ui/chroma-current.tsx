import * as THREE from 'three';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export type ChromaPattern = 'streams' | 'waves' | 'vortex' | 'radial' | 'contours';
export type ChromaShape = 'circle' | 'square';

export interface ChromaCurrentProps {
  colors?: [string, string];
  backgroundColor?: string;
  pattern?: ChromaPattern;
  centerX?: number;
  centerY?: number;
  scale?: number;
  pitch?: number;
  dotSize?: number;
  variance?: number;
  shape?: ChromaShape;
  baseDots?: number;
  stretch?: number;
  streams?: number;
  spread?: number;
  speed?: number;
  direction?: number;
  turbulence?: number;
  trail?: number;
  intensity?: number;
  bloom?: number;
  grain?: number;
  interactive?: boolean;
  stir?: number;
  plume?: number;
  intro?: boolean;
  paused?: boolean;
  dpr?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ChromaCurrentHandle {
  plume: (x?: number, y?: number, strength?: number) => void;
  replay: () => void;
}

const PATTERNS: ChromaPattern[] = ['streams', 'waves', 'vortex', 'radial', 'contours'];

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const fallbackNum = (val: number | undefined, fallback: number) => (Number.isFinite(val) ? (val as number) : fallback);

const tempColor = new THREE.Color();

const parseColor = (str: string): [number, number, number] | null => {
  const t = str.trim().toLowerCase();
  if (!t || t === 'transparent' || t === 'none' || t === 'auto') return null;
  try {
    tempColor.setStyle(t, THREE.SRGBColorSpace);
    return [tempColor.r, tempColor.g, tempColor.b];
  } catch {
    return null;
  }
};

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

const rgbToOklab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabToRgb = ([L, a, b]: [number, number, number]): [number, number, number] => {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    clamp(linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), 0, 1),
    clamp(linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), 0, 1),
    clamp(linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s), 0, 1),
  ];
};

// Permutation table for Perlin noise
const perm = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 1337;
  for (let i = 255; i > 0; i--) {
    seed = (16807 * seed) % 0x7fffffff;
    const j = seed % (i + 1);
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const table = new Uint8Array(512);
  for (let i = 0; i < 512; i++) table[i] = p[i & 255];
  return table;
})();

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

const grad = (hash: number, x: number, y: number, z: number) => {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

const perlin = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const X = xi & 255;
  const Y = yi & 255;
  const Z = zi & 255;
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = fade(xf);
  const v = fade(yf);
  const w = fade(zf);
  const A = perm[X] + Y;
  const AA = perm[A] + Z;
  const AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y;
  const BA = perm[B] + Z;
  const BB = perm[B + 1] + Z;
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  return lerp(
    w,
    lerp(
      v,
      lerp(u, grad(perm[AA], xf, yf, zf), grad(perm[BA], xf - 1, yf, zf)),
      lerp(u, grad(perm[AB], xf, yf - 1, zf), grad(perm[BB], xf - 1, yf - 1, zf))
    ),
    lerp(
      v,
      lerp(u, grad(perm[AA + 1], xf, yf, zf - 1), grad(perm[BA + 1], xf - 1, yf, zf - 1)),
      lerp(u, grad(perm[AB + 1], xf, yf - 1, zf - 1), grad(perm[BB + 1], xf - 1, yf - 1, zf - 1))
    )
  );
};

const subscribeReducedMotion = (callback: () => void) => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
};

const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const gridFragmentShader = `
uniform sampler2D uEnergy;
uniform sampler2D uFlow;
uniform vec2 uGrid;
uniform vec2 uOrigin;
uniform float uPitch;
uniform float uMaxRadius;
uniform float uBaseRadius;
uniform float uBase;
uniform float uGain;
uniform float uStretch;
uniform float uVariance;
uniform float uSquare;
uniform float uInk;
uniform float uFade;
uniform vec3 uBaseColor;
varying vec2 vUv;

float shape(vec2 q, float radius) {
  if (uSquare > 0.5) {
    vec2 d = abs(q) - vec2(radius * 0.86);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }
  return length(q) - radius;
}

void main() {
  vec2 frag = gl_FragCoord.xy - uOrigin;
  vec2 cell = floor(frag / uPitch);
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= uGrid.x || cell.y >= uGrid.y) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec2 local = frag - (cell + 0.5) * uPitch;
  vec2 uv = (cell + 0.5) / uGrid;
  vec4 energy = texture2D(uEnergy, uv);
  vec2 flow = texture2D(uFlow, uv).rg;
  float amount = max(energy.a, 0.0);
  float lit = (1.0 - exp(-amount * uGain)) * uFade;
  vec3 tint = energy.rgb / max(amount, 0.0001);
  float speed = length(flow) / max(amount, 0.0001);
  vec2 along = speed > 0.00001 ? flow / (speed * max(amount, 0.0001)) : vec2(1.0, 0.0);
  vec2 across = vec2(-along.y, along.x);
  float stretch = 1.0 + uStretch * clamp(speed * 6.0, 0.0, 1.6) * smoothstep(0.02, 0.3, lit);
  float halftone = mix(uBaseRadius, uMaxRadius, sqrt(lit));
  float panel = uMaxRadius * (0.72 + 0.28 * smoothstep(0.0, 0.45, lit));
  float radius = mix(panel, halftone, uVariance);
  vec2 q = vec2(dot(local, along) / stretch, dot(local, across));
  float d = shape(q, radius);
  float cover = 1.0 - smoothstep(-0.65, 0.65, d);
  float baseCover = (1.0 - smoothstep(-0.6, 0.6, shape(local, uBaseRadius))) * uBase * (1.0 - lit);
  if (uInk > 0.5) {
    float a = clamp(cover * lit * 2.3, 0.0, 1.0);
    vec3 color = tint * a;
    gl_FragColor = vec4(color + uBaseColor * baseCover * 0.5, a + baseCover * 0.5);
    return;
  }
  vec3 emission = tint * lit * cover * 1.6 + vec3(1.0) * max(lit - 0.82, 0.0) * cover * 0.8;
  gl_FragColor = vec4(emission + uBaseColor * baseCover, 1.0);
}
`;

const bloomDownsampleShader = `
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
varying vec2 vUv;

vec3 tap(vec2 d) {
  vec3 c = texture2D(uSource, vUv + d * uTexel).rgb;
  float peak = max(c.r, max(c.g, c.b));
  return c * (max(peak - uThreshold, 0.0) / max(peak, 0.0001));
}

void main() {
  vec3 a = tap(vec2(-2.0, 2.0));
  vec3 b = tap(vec2(0.0, 2.0));
  vec3 c = tap(vec2(2.0, 2.0));
  vec3 d = tap(vec2(-2.0, 0.0));
  vec3 e = tap(vec2(0.0, 0.0));
  vec3 f = tap(vec2(2.0, 0.0));
  vec3 g = tap(vec2(-2.0, -2.0));
  vec3 h = tap(vec2(0.0, -2.0));
  vec3 i = tap(vec2(2.0, -2.0));
  vec3 j = tap(vec2(-1.0, 1.0));
  vec3 k = tap(vec2(1.0, 1.0));
  vec3 l = tap(vec2(-1.0, -1.0));
  vec3 m = tap(vec2(1.0, -1.0));
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  gl_FragColor = vec4(color, 1.0);
}
`;

const bloomUpsampleShader = `
uniform sampler2D uSource;
uniform vec2 uTexel;
varying vec2 vUv;

vec3 tap(vec2 d) { return texture2D(uSource, vUv + d * uTexel).rgb; }

void main() {
  vec3 color = tap(vec2(0.0)) * 4.0
    + (tap(vec2(-1.0, 0.0)) + tap(vec2(1.0, 0.0)) + tap(vec2(0.0, -1.0)) + tap(vec2(0.0, 1.0))) * 2.0
    + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
  gl_FragColor = vec4(color / 16.0, 1.0);
}
`;

const compositeFragmentShader = `
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec3 uBackground;
uniform float uBloomStrength;
uniform float uGrain;
uniform float uTime;
uniform float uInk;
varying vec2 vUv;

vec3 neutral(vec3 color) {
  const float start = 0.76;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < start) return color;
  const float d = 1.0 - start;
  float next = 1.0 - d * d / (peak + d - start);
  color *= next / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - next) + 1.0);
  return mix(color, vec3(next), g);
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec4 scene = texture2D(uScene, vUv);
  float n = hash(gl_FragCoord.xy + fract(uTime * 13.0) * 911.0) - 0.5;
  if (uInk > 0.5) {
    float cover = clamp(scene.a, 0.0, 1.0);
    vec3 ink = scene.rgb / max(scene.a, 0.0001);
    vec3 color = mix(uBackground, ink, cover);
    color += n * uGrain * 0.05 * smoothstep(0.0, 0.05, cover);
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    return;
  }
  vec3 emission = scene.rgb + texture2D(uBloom, vUv).rgb * uBloomStrength;
  vec3 light = neutral(max(emission, 0.0));
  light = pow(light, vec3(1.0 / 2.2));
  vec3 color = 1.0 - (1.0 - uBackground) * (1.0 - light);
  float l = max(light.r, max(light.g, light.b));
  float mask = smoothstep(0.0, 0.04, l);
  color += n * uGrain * 0.1 * mask;
  color += (hash(gl_FragCoord.xy * 1.7) - 0.5) / 255.0 * mask;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export const ChromaCurrent = forwardRef<ChromaCurrentHandle, ChromaCurrentProps>(function ChromaCurrent(
  {
    colors = ['#00f2fe', '#8b5cf6'],
    backgroundColor = 'transparent',
    pattern = 'streams',
    centerX = 0.5,
    centerY = 0.5,
    scale = 1,
    pitch = 8,
    dotSize = 0.62,
    variance = 0.35,
    shape = 'circle',
    baseDots = 0.12,
    stretch = 0.2,
    streams = 4,
    spread = 0.5,
    speed = 0.6,
    direction = 0,
    turbulence = 0.6,
    trail = 0.6,
    intensity = 1,
    bloom = 0.6,
    grain = 0.2,
    interactive = true,
    stir = 1,
    plume = 1,
    intro = true,
    paused = false,
    dpr = 2,
    children,
    className,
    style,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<{
    sync: () => void;
    plume: (x?: number, y?: number, strength?: number) => void;
    replay: () => void;
    destroy: () => void;
  } | null>(null);

  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  const config = {
    colors,
    backgroundColor,
    pattern: PATTERNS.includes(pattern) ? pattern : 'streams',
    centerX,
    centerY,
    scale,
    pitch,
    dotSize,
    variance,
    shape: shape === 'square' ? 'square' : 'circle',
    baseDots,
    stretch,
    streams,
    spread,
    speed,
    direction,
    turbulence,
    trail,
    intensity,
    bloom,
    grain,
    interactive,
    stir,
    plume,
    intro,
    paused,
    dpr,
    reduced: reducedMotion,
  };

  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
    runtimeRef.current?.sync();
  });

  useEffect(() => {
    const container = containerRef.current;
    const mount = canvasMountRef.current;
    if (!container || !mount) return;

    const doc = container.ownerDocument;
    const win = doc.defaultView ?? window;
    const canvas = doc.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    mount.appendChild(canvas);
    renderer.autoClear = false;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const plane = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    const mesh = new THREE.Mesh(plane);
    mesh.frustumCulled = false;
    scene.add(mesh);

    let gridCols = 1;
    let gridRows = 1;
    let energyData = new Float32Array(4);
    let flowData = new Float32Array(2);
    let energyTexture = new THREE.DataTexture(energyData, 1, 1, THREE.RGBAFormat, THREE.FloatType);
    let flowTexture = new THREE.DataTexture(flowData, 1, 1, THREE.RGFormat, THREE.FloatType);

    const bgColorUniform = new THREE.Color(0.04, 0.04, 0.04);
    const baseColorUniform = new THREE.Color(0.1, 0.06, 0.3);

    const gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uEnergy: { value: energyTexture },
        uFlow: { value: flowTexture },
        uGrid: { value: new THREE.Vector2(1, 1) },
        uOrigin: { value: new THREE.Vector2(0, 0) },
        uPitch: { value: 20 },
        uMaxRadius: { value: 7 },
        uBaseRadius: { value: 1.2 },
        uBase: { value: 0.12 },
        uGain: { value: 0.7 },
        uStretch: { value: 0.35 },
        uVariance: { value: 0.35 },
        uSquare: { value: 0 },
        uInk: { value: 0 },
        uFade: { value: 1 },
        uBaseColor: { value: baseColorUniform },
      },
      vertexShader,
      fragmentShader: gridFragmentShader,
      depthTest: false,
      depthWrite: false,
    });

    const createTarget = () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: false,
      });

    const sceneTarget = createTarget();
    const bloomPyramid = Array.from({ length: 5 }, createTarget);

    const bloomDownMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSource: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uThreshold: { value: 0 },
      },
      vertexShader,
      fragmentShader: bloomDownsampleShader,
      depthTest: false,
      depthWrite: false,
    });

    const bloomUpMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSource: { value: null },
        uTexel: { value: new THREE.Vector2() },
      },
      vertexShader,
      fragmentShader: bloomUpsampleShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const compositeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uScene: { value: sceneTarget.texture },
        uBloom: { value: bloomPyramid[0].texture },
        uBackground: { value: bgColorUniform },
        uBloomStrength: { value: 0.6 },
        uGrain: { value: 0.2 },
        uTime: { value: 0 },
        uInk: { value: 0 },
      },
      vertexShader,
      fragmentShader: compositeFragmentShader,
      depthTest: false,
      depthWrite: false,
    });

    const MAX_PARTICLES = 16000;
    const px = new Float32Array(MAX_PARTICLES);
    const py = new Float32Array(MAX_PARTICLES);
    const age = new Float32Array(MAX_PARTICLES);
    const life = new Float32Array(MAX_PARTICLES);
    const brightness = new Float32Array(MAX_PARTICLES);
    const colorIndex = new Float32Array(MAX_PARTICLES);
    const isPlume = new Uint8Array(MAX_PARTICLES);

    let activeParticles = 0;
    let fieldCols = 64;
    let fieldRows = 32;
    let fieldAngle = new Float32Array(2145);
    let fieldDivX = new Float32Array((fieldCols + 1) * (fieldRows + 1));
    let fieldDivY = new Float32Array((fieldCols + 1) * (fieldRows + 1));
    let isRadial = false;
    let isPeriodic = false;
    let fieldFlowX = new Float32Array(fieldCols * fieldRows);
    let fieldFlowY = new Float32Array(fieldCols * fieldRows);

    const colorPalette: Array<[number, number, number]> = Array.from({ length: 33 }, () => [1, 1, 1]);
    const pointerHistory: Array<{ x: number; y: number; vx: number; vy: number; born: number }> = [];

    let cssWidth = 0;
    let cssHeight = 0;
    let aspect = 1;
    let pixelRatio = 1;
    let isInitialized = false;
    let prevConfigHash = '';
    let prevThemeHash = '';
    let isLightBg = false;
    let lastColorSync = -10;
    let simTime = 0;
    let noiseTime = 0;
    let colorDrift = 0;
    let globalTime = 0;
    let fadeAlpha = 0;
    let introStartTime = -1;
    let animFrameId = 0;
    let lastTimestamp = 0;
    let isVisible = false;
    let isDestroyed = false;
    let isContextLost = false;
    let rngSeed = 7;
    let lastPointerPos: { x: number; y: number; t: number } | null = null;
    let pointerPressState: { id: number; x: number; y: number; time: number } | null = null;

    const pseudoRandom = () => ((rngSeed = (16807 * rngSeed) % 0x7fffffff) - 1) / 0x7ffffffe;

    const syncColors = () => {
      const cfg = configRef.current;
      const computedBg =
        parseColor(cfg.backgroundColor) ??
        (() => {
          let node: HTMLElement | null = container.parentElement;
          while (node) {
            const bgMatch = win.getComputedStyle(node).backgroundColor.match(/rgba?\(([^)]+)\)/);
            if (bgMatch) {
              const parts = bgMatch[1].split(',').map(Number.parseFloat);
              if (parts.length < 4 || parts[3] > 0.05) {
                return [parts[0] / 255, parts[1] / 255, parts[2] / 255] as [number, number, number];
              }
            }
            node = node.parentElement;
          }
          const textMatch = win.getComputedStyle(container).color.match(/rgba?\(([^)]+)\)/);
          if (textMatch) {
            const parts = textMatch[1].split(',').map(Number.parseFloat);
            return (parts[0] + parts[1] + parts[2] > 382 ? [0.04, 0.04, 0.04] : [1, 1, 1]) as [number, number, number];
          }
          return [0.04, 0.04, 0.04] as [number, number, number];
        })();

      const themeKey = [computedBg.join(','), cfg.colors[0], cfg.colors[1]].join('|');
      if (themeKey === prevThemeHash) return;
      prevThemeHash = themeKey;

      isLightBg = 0.2126 * computedBg[0] + 0.7152 * computedBg[1] + 0.0722 * computedBg[2] > 0.55;
      bgColorUniform.setRGB(computedBg[0], computedBg[1], computedBg[2]);

      const c1 = rgbToOklab(parseColor(cfg.colors[0]) ?? [0, 0.95, 1]);
      const c2 = rgbToOklab(parseColor(cfg.colors[1]) ?? [0.55, 0.36, 0.96]);

      const chroma = (c: [number, number, number]) => Math.hypot(c[1], c[2]);
      const adjustColor = (primary: [number, number, number], secondary: [number, number, number]) => {
        if (!isLightBg) return primary;
        let c = primary;
        if (chroma(primary) < 0.03 && chroma(secondary) >= 0.03) c = secondary;
        const chr = chroma(c);
        if (chr < 0.03) return [0.3, 0, 0] as [number, number, number];
        const boost = Math.max(1, 0.15 / chr);
        return [clamp(c[0], 0.34, 0.52), c[1] * boost, c[2] * boost] as [number, number, number];
      };

      const labA = adjustColor(c1, c2);
      const labB = adjustColor(c2, c1);

      for (let i = 0; i < colorPalette.length; i++) {
        const t = i / (colorPalette.length - 1);
        const interpolated = oklabToRgb([
          labA[0] + (labB[0] - labA[0]) * t,
          labA[1] + (labB[1] - labA[1]) * t,
          labA[2] + (labB[2] - labA[2]) * t,
        ]);
        colorPalette[i] = isLightBg
          ? interpolated
          : [srgbToLinear(interpolated[0]), srgbToLinear(interpolated[1]), srgbToLinear(interpolated[2])];
      }

      const baseLab = oklabToRgb([isLightBg ? 0.82 : 0.32, 0.5 * labA[1], 0.5 * labA[2]]);
      if (isLightBg) {
        baseColorUniform.setRGB(baseLab[0], baseLab[1], baseLab[2]);
      } else {
        baseColorUniform.setRGB(0.55 * srgbToLinear(baseLab[0]), 0.55 * srgbToLinear(baseLab[1]), 0.55 * srgbToLinear(baseLab[2]));
      }

      gridMaterial.uniforms.uInk.value = isLightBg ? 1 : 0;
      compositeMaterial.uniforms.uInk.value = isLightBg ? 1 : 0;
    };

    const getPaletteColor = (t: number) =>
      colorPalette[Math.round(clamp(t, 0, 1) * (colorPalette.length - 1))];

    const resizeView = () => {
      const cfg = configRef.current;
      const w = Math.round(container.clientWidth);
      const h = Math.round(container.clientHeight);
      if (w < 2 || h < 2) {
        isInitialized = false;
        return false;
      }
      const pr = Math.min(win.devicePixelRatio || 1, clamp(fallbackNum(cfg.dpr, 2), 0.5, 3));
      if (isInitialized && w === cssWidth && h === cssHeight && pr === pixelRatio) return false;

      isInitialized = true;
      cssWidth = w;
      cssHeight = h;
      aspect = cssWidth / cssHeight;
      pixelRatio = pr;

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(cssWidth, cssHeight, false);

      const renderW = Math.round(cssWidth * pixelRatio);
      const renderH = Math.round(cssHeight * pixelRatio);
      sceneTarget.setSize(renderW, renderH);

      let bw = renderW;
      let bh = renderH;
      for (const t of bloomPyramid) {
        bw = Math.max(1, Math.round(bw / 2));
        bh = Math.max(1, Math.round(bh / 2));
        t.setSize(bw, bh);
      }

      prevConfigHash = '';
      return true;
    };

    const reallocateGrid = () => {
      const pitchPx = Math.max(3, Math.round(clamp(fallbackNum(configRef.current.pitch, 8), 4, 48) * pixelRatio));
      const hash = [cssWidth, cssHeight, pixelRatio, pitchPx].join('|');
      if (hash === prevConfigHash) return;
      prevConfigHash = hash;

      const rw = Math.round(cssWidth * pixelRatio);
      const rh = Math.round(cssHeight * pixelRatio);
      gridCols = Math.ceil(rw / pitchPx) + 1;
      gridRows = Math.ceil(rh / pitchPx) + 1;

      energyData = new Float32Array(gridCols * gridRows * 4);
      flowData = new Float32Array(gridCols * gridRows * 2);

      energyTexture.dispose();
      flowTexture.dispose();

      energyTexture = new THREE.DataTexture(energyData, gridCols, gridRows, THREE.RGBAFormat, THREE.FloatType);
      flowTexture = new THREE.DataTexture(flowData, gridCols, gridRows, THREE.RGFormat, THREE.FloatType);

      energyTexture.minFilter = THREE.NearestFilter;
      energyTexture.magFilter = THREE.NearestFilter;
      energyTexture.needsUpdate = true;

      flowTexture.minFilter = THREE.NearestFilter;
      flowTexture.magFilter = THREE.NearestFilter;
      flowTexture.needsUpdate = true;

      const uniforms = gridMaterial.uniforms;
      uniforms.uEnergy.value = energyTexture;
      uniforms.uFlow.value = flowTexture;
      uniforms.uGrid.value.set(gridCols, gridRows);
      uniforms.uPitch.value = pitchPx;
      uniforms.uOrigin.value.set((rw - gridCols * pitchPx) / 2, (rh - gridRows * pitchPx) / 2);

      fieldCols = 64;
      fieldRows = Math.max(12, Math.round(64 / Math.max(aspect, 0.3)));
      fieldAngle = new Float32Array((fieldCols + 1) * (fieldRows + 1));
      fieldDivX = new Float32Array((fieldCols + 1) * (fieldRows + 1));
      fieldDivY = new Float32Array((fieldCols + 1) * (fieldRows + 1));
      fieldFlowX = new Float32Array(fieldCols * fieldRows);
      fieldFlowY = new Float32Array(fieldCols * fieldRows);
    };

    const getSimSpeed = () => 0.25 * clamp(fallbackNum(configRef.current.speed, 0.6), 0, 3);

    const updateFlowField = () => {
      const cfg = configRef.current;
      const speed = getSimSpeed();
      const pattern = cfg.pattern;
      const dirRad = (clamp(fallbackNum(cfg.direction, 0), -360, 360) * Math.PI) / 180;
      const cosD = Math.cos(dirRad);
      const sinD = Math.sin(dirRad);
      const dirSign = (cfg.direction ?? 0) < 0 ? -1 : 1;
      const turb = 0.3 * clamp(fallbackNum(cfg.turbulence, 0.6), 0, 2);
      const scl = clamp(fallbackNum(cfg.scale, 1), 0.25, 4);
      const span = aspect * Math.abs(sinD) + Math.abs(cosD);
      const cx = clamp(fallbackNum(cfg.centerX, 0.5), -1, 2) * aspect;
      const cy = 1 - clamp(fallbackNum(cfg.centerY, 0.5), -1, 2);
      const maxDist = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(aspect - cx, cy),
        Math.hypot(cx, 1 - cy),
        Math.hypot(aspect - cx, 1 - cy),
        0.2
      );
      const invScale = 1.7 / scl;
      const vortexSpin = pattern === 'vortex' ? 1.35 * scl * dirSign : 0;
      const waveFreq = 0.9 * scl;

      isRadial = isPeriodic = pattern === 'radial' || pattern === 'vortex';
      const streamOffset = 1.35 * simTime * 0.6;

      for (let r = 0; r <= fieldRows; r++) {
        const normY = r / fieldRows;
        const cyRel = normY - 0.5;
        for (let c = 0; c <= fieldCols; c++) {
          const normX = (c / fieldCols) * aspect;
          const cxRel = normX - aspect / 2;
          const uCoord = cxRel * cosD + cyRel * sinD;
          const vCoord = -cxRel * sinD + cyRel * cosD;
          const isStreams = pattern === 'streams';
          const pVal =
            perlin(1.35 * uCoord - (isStreams ? streamOffset : 0), 1.35 * vCoord * 1.2, noiseTime) +
            0.42 * perlin(1.35 * uCoord * 2.2 + 7.3 - (isStreams ? 1.3 * streamOffset : 0), 1.35 * vCoord * 2.3 - 3.1, 1.6 * noiseTime + 11.7) +
            0.16 * perlin(1.35 * uCoord * 4.6 - 2.1 - (isStreams ? 1.7 * streamOffset : 0), 1.35 * vCoord * 4.4 + 5.7, 2.3 * noiseTime + 3.3);

          const idx = r * (fieldCols + 1) + c;
          if (pattern === 'waves') {
            const phase = (uCoord / waveFreq) * Math.PI * 2 + 3.5 * vCoord + 1.2 * Math.sin(2.1 * noiseTime);
            const val = (vCoord + 0.075 * (Math.sin(phase) + 0.35 * Math.sin(2 * phase + 1.3 + noiseTime)) + 0.3 * turb * pVal) / span;
            fieldAngle[idx] = val;
            fieldDivY[idx] = val + 0.5;
          } else if (pattern === 'vortex' || pattern === 'radial') {
            const radDist = Math.hypot(normX - cx, normY - cy) / maxDist;
            const theta = Math.atan2(normY - cy, normX - cx) / (2 * Math.PI) + 0.5 + vortexSpin * radDist + 0.035 * turb * pVal;
            fieldAngle[idx] = theta;
            fieldDivY[idx] = theta - Math.floor(theta);
          } else if (pattern === 'contours') {
            const contour =
              0.62 * perlin(normX * invScale, normY * invScale, 0.9 * noiseTime) +
              0.38 * perlin(normX * invScale * 2.1 + 5.2, normY * invScale * 2.1 - 3.4, 1.4 * noiseTime + 7.7) +
              0.12 * turb * pVal;
            fieldAngle[idx] = contour;
            fieldDivY[idx] = contour / 1.1 + 0.5;
          } else {
            const stream = (vCoord + turb * pVal) / span;
            fieldAngle[idx] = stream;
            fieldDivY[idx] = stream + 0.5;
          }
        }
      }

      const flowScale =
        pattern === 'vortex'
          ? speed / Math.hypot(1 / (2 * Math.PI * 0.4 * maxDist), vortexSpin / maxDist)
          : pattern === 'radial'
          ? speed * Math.PI * 0.8 * maxDist
          : pattern === 'contours'
          ? (speed * dirSign * 1.2) / invScale
          : speed * span;

      const cellW = aspect / fieldCols;
      const cellH = 1 / fieldRows;
      const curTime = globalTime;
      const stirStrength = clamp(fallbackNum(cfg.stir, 1), 0, 3);
      const recentPointers = pointerHistory.filter((pt) => curTime - pt.born < 1.6);

      for (let r = 0; r <= fieldRows; r++) {
        const ny = r * cellH;
        for (let c = 0; c <= fieldCols; c++) {
          const nx = c * cellW;
          let stirVal = 0;
          for (const pt of recentPointers) {
            const lifeRem = 1 - (curTime - pt.born) / 1.6;
            const dx = nx - pt.x;
            const dy = ny - pt.y;
            const falloff = Math.exp(-(dx * dx + dy * dy) / 0.02) * lifeRem * lifeRem;
            stirVal += (pt.vx * dy - pt.vy * dx) * falloff * stirStrength;
          }
          fieldDivX[r * (fieldCols + 1) + c] = stirVal;
        }
      }

      const maxFlow = 3 * speed + 0.0001;
      const normalizeAngle = (v: number) => (isPeriodic ? v - Math.round(v) : v);

      for (let r = 0; r < fieldRows; r++) {
        for (let c = 0; c < fieldCols; c++) {
          const p00 = r * (fieldCols + 1) + c;
          const a00 = fieldAngle[p00];
          const a10 = fieldAngle[p00 + 1];
          const a01 = fieldAngle[p00 + fieldCols + 1];
          const a11 = fieldAngle[p00 + fieldCols + 2];

          const dY = (normalizeAngle(a01 - a00) + normalizeAngle(a11 - a10)) / (2 * cellH);
          const dX = (normalizeAngle(a10 - a00) + normalizeAngle(a11 - a01)) / (2 * cellW);
          const avgA = a00 + (normalizeAngle(a10 - a00) + normalizeAngle(a01 - a00) + normalizeAngle(a11 - a00)) / 4;
          const curl =
            0.62 +
            0.76 *
              (0.5 +
                0.5 *
                  Math.sin(
                    (pattern === 'contours'
                      ? avgA / 1.1 + 0.5
                      : isRadial
                      ? avgA - Math.floor(avgA)
                      : avgA + 0.5) *
                      Math.PI *
                      6 +
                      0.9
                  ));

          let fx = dY * flowScale * curl;
          let fy = -dX * flowScale * curl;
          const mag = Math.hypot(fx, fy);
          if (mag > maxFlow) {
            fx *= maxFlow / mag;
            fy *= maxFlow / mag;
          }

          const s00 = fieldDivX[p00];
          const s10 = fieldDivX[p00 + 1];
          const s01 = fieldDivX[p00 + fieldCols + 1];
          const s11 = fieldDivX[p00 + fieldCols + 2];

          fx += (s01 + s11 - s00 - s10) / (2 * cellH);
          fy += -(s10 + s11 - s00 - s01) / (2 * cellW);

          fieldFlowX[r * fieldCols + c] = fx;
          fieldFlowY[r * fieldCols + c] = fy;
        }
      }

      for (let i = pointerHistory.length - 1; i >= 0; i--) {
        if (curTime - pointerHistory[i].born > 1.6) pointerHistory.splice(i, 1);
      }
    };

    const sampleField = (data: Float32Array, x: number, y: number, cols: number, rows: number) => {
      const gx = clamp((x / aspect) * cols - 0.5, 0, cols - 1.001);
      const gy = clamp(y * rows - 0.5, 0, rows - 1.001);
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const tx = gx - ix;
      const ty = gy - iy;
      const v00 = data[iy * cols + ix];
      const v10 = data[iy * cols + ix + 1];
      const v01 = data[(iy + 1) * cols + ix];
      const v11 = data[(iy + 1) * cols + ix + 1];
      return v00 + (v10 - v00) * tx + (v01 - v00) * ty + (v00 - v10 - v01 + v11) * tx * ty;
    };

    const hashVal = (x: number) => {
      const t = 43758.5453123 * Math.sin(127.1 * x + 311.7);
      return t - Math.floor(t);
    };

    const sampleStreamProfile = (x: number, y: number) => {
      const cfg = configRef.current;
      const streamCount = clamp(Math.round(fallbackNum(cfg.streams, 4)), 1, 16);
      const gx = clamp((x / aspect) * fieldCols, 0, fieldCols - 0.001);
      const gy = clamp(y * fieldRows, 0, fieldRows - 0.001);
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const tx = gx - ix;
      const ty = gy - iy;
      const stride = fieldCols + 1;
      const v00 = fieldDivY[iy * stride + ix];
      const wrap = (v: number) => (isRadial ? v - Math.round(v) : v);
      const v10 = v00 + wrap(fieldDivY[iy * stride + ix + 1] - v00);
      const v01 = v00 + wrap(fieldDivY[(iy + 1) * stride + ix] - v00);
      const v11 = v00 + wrap(fieldDivY[(iy + 1) * stride + ix + 1] - v00);
      const interp = v00 + (v10 - v00) * tx + (v01 - v00) * ty + (v00 - v10 - v01 + v11) * tx * ty;
      const val = isRadial ? interp - Math.floor(interp) : interp;

      const spreadWidth = (0.3 * clamp(fallbackNum(cfg.spread, 0.5), 0.05, 1.5)) / streamCount;
      let peakProfile = 0;
      let peakIdx = 0;

      for (let i = 0; i < streamCount; i++) {
        const center = (i + 0.5 + (hashVal(3.7 * i + 1.3) - 0.5) * (isRadial ? 0.3 : 0.55)) / streamCount;
        const rad = spreadWidth * (0.55 + 0.9 * hashVal(5.1 * i + 2.9));
        let dist = val - center;
        if (isRadial) dist -= Math.round(dist);
        const intensityVal = Math.exp(-(dist * dist) / (2 * rad * rad)) * (0.55 + 0.45 * hashVal(2.3 * i + 0.7));
        if (intensityVal > peakProfile) {
          peakProfile = intensityVal;
          peakIdx = i;
        }
      }

      return { profile: peakProfile, index: peakIdx, count: streamCount };
    };

    const spawnParticle = (idx: number, isInitial: boolean) => {
      let rx = 0;
      let ry = 0;
      let streamInfo = { profile: 0, index: 0, count: 1 };

      for (let attempt = 0; attempt < 10; attempt++) {
        rx = -0.18 + pseudoRandom() * (aspect + 0.36);
        ry = -0.18 + pseudoRandom() * (1 + 0.36);
        streamInfo = sampleStreamProfile(rx, ry);
        if (pseudoRandom() < streamInfo.profile) break;
      }

      px[idx] = rx;
      py[idx] = ry;
      life[idx] = 2.8 + 3.6 * pseudoRandom();
      age[idx] = isInitial ? pseudoRandom() * life[idx] : 0;
      const rnd = pseudoRandom();
      brightness[idx] = streamInfo.profile * (0.22 + 0.78 * rnd * rnd * rnd) * 1.6;

      const cIdx = isRadial
        ? 0.5 - 0.5 * Math.cos((streamInfo.index / streamInfo.count) * Math.PI * 2)
        : streamInfo.count > 1
        ? streamInfo.index / (streamInfo.count - 1)
        : 0.5;

      colorIndex[idx] = clamp(cIdx + (pseudoRandom() - 0.5) * 0.1, 0, 1);
      isPlume[idx] = 0;
    };

    const getTargetParticleCount = () => {
      const cfg = configRef.current;
      const count = clamp(Math.round(fallbackNum(cfg.streams, 4)), 1, 16);
      const density = (gridCols * gridRows) / 6000;
      const spr = clamp(fallbackNum(cfg.spread, 0.5), 0.05, 1.5);
      return Math.round(clamp(3400 * density * Math.sqrt(count / 4) * (0.6 + 0.8 * spr), 600, 14800));
    };

    const reseedAllParticles = (isInitial: boolean) => {
      activeParticles = getTargetParticleCount();
      for (let i = 0; i < activeParticles; i++) {
        spawnParticle(i, isInitial);
      }
    };

    const triggerPlume = (x: number, y: number, strength: number) => {
      const count = Math.round(110 * clamp(strength, 0, 3));
      const col = 0.55 + 0.45 * pseudoRandom();
      for (let i = 0; i < count && activeParticles < MAX_PARTICLES; i++) {
        const pIdx = activeParticles++;
        const r = 0.055 * Math.sqrt(pseudoRandom());
        const theta = pseudoRandom() * Math.PI * 2;
        px[pIdx] = x + Math.cos(theta) * r;
        py[pIdx] = y + Math.sin(theta) * r;
        age[pIdx] = 0.25 * pseudoRandom();
        life[pIdx] = 3.2 + 2.8 * pseudoRandom();
        brightness[pIdx] = 0.32 + 0.32 * pseudoRandom();
        colorIndex[pIdx] = clamp(col + (pseudoRandom() - 0.5) * 0.18, 0, 1);
        isPlume[pIdx] = 1;
      }
    };

    const renderFrame = () => {
      if (!isInitialized) return;
      const cfg = configRef.current;

      if (performance.now() - lastColorSync > 1000) {
        lastColorSync = performance.now();
        syncColors();
      }

      reallocateGrid();

      const pitch = gridMaterial.uniforms.uPitch.value;
      const dot = clamp(fallbackNum(cfg.dotSize, 0.62), 0.1, 1);
      const uniforms = gridMaterial.uniforms;

      uniforms.uMaxRadius.value = 0.5 * pitch * dot;
      uniforms.uBaseRadius.value = Math.max(0.6 * pixelRatio, 0.5 * pitch * dot * 0.22);
      uniforms.uBase.value = clamp(fallbackNum(cfg.baseDots, 0.12), 0, 1);
      uniforms.uStretch.value = clamp(fallbackNum(cfg.stretch, 0.2), 0, 2);
      uniforms.uVariance.value = clamp(fallbackNum(cfg.variance, 0.35), 0, 1);
      uniforms.uSquare.value = cfg.shape === 'square' ? 1 : 0;

      const trailDecay = 0.08 + 0.9 * clamp(fallbackNum(cfg.trail, 0.6), 0, 1.5);
      uniforms.uGain.value = (1.05 * clamp(fallbackNum(cfg.intensity, 1), 0, 4)) / (60 * trailDecay);
      uniforms.uFade.value = fadeAlpha;

      compositeMaterial.uniforms.uGrain.value = clamp(fallbackNum(cfg.grain, 0.2), 0, 1);

      if (isLightBg) {
        gridMaterial.blending = THREE.NormalBlending;
      } else {
        gridMaterial.blending = THREE.AdditiveBlending;
      }

      mesh.material = gridMaterial;
      renderer.setRenderTarget(sceneTarget);
      renderer.setClearColor(0, 0);
      renderer.clear();
      renderer.render(scene, camera);

      const bloomAmt = isLightBg ? 0 : clamp(fallbackNum(cfg.bloom, 0.6), 0, 3);
      if (bloomAmt > 0.001) {
        let srcTarget = sceneTarget;
        mesh.material = bloomDownMaterial;
        for (const t of bloomPyramid) {
          bloomDownMaterial.uniforms.uThreshold.value = srcTarget === sceneTarget ? 0.25 : 0;
          bloomDownMaterial.uniforms.uSource.value = srcTarget.texture;
          bloomDownMaterial.uniforms.uTexel.value.set(1 / srcTarget.width, 1 / srcTarget.height);
          renderer.setRenderTarget(t);
          renderer.render(scene, camera);
          srcTarget = t;
        }

        mesh.material = bloomUpMaterial;
        for (let i = bloomPyramid.length - 1; i > 0; i--) {
          bloomUpMaterial.uniforms.uSource.value = bloomPyramid[i].texture;
          bloomUpMaterial.uniforms.uTexel.value.set(1 / bloomPyramid[i].width, 1 / bloomPyramid[i].height);
          renderer.setRenderTarget(bloomPyramid[i - 1]);
          renderer.render(scene, camera);
        }
      }

      compositeMaterial.uniforms.uBloomStrength.value = bloomAmt;
      compositeMaterial.uniforms.uTime.value = globalTime;
      mesh.material = compositeMaterial;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    };

    const stepSimulation = (dt: number) => {
      const cfg = configRef.current;
      const spd = clamp(fallbackNum(cfg.speed, 0.6), 0, 3);
      simTime += dt * getSimSpeed();
      noiseTime += dt * spd * 0.075;
      colorDrift += dt * spd * 0.2;

      updateFlowField();

      // Step particle positions
      const timeStep = Math.min(1, spd / 0.3);
      let survivingCount = 0;
      const targetCount = getTargetParticleCount();

      for (let i = 0; i < activeParticles; i++) {
        age[i] += dt * (isPlume[i] ? 1 : timeStep);
        const vx = sampleField(fieldFlowX, px[i], py[i], fieldCols, fieldRows);
        const vy = sampleField(fieldFlowY, px[i], py[i], fieldCols, fieldRows);
        px[i] += vx * dt;
        py[i] += vy * dt;

        const isOOB = px[i] < -0.25 || px[i] > aspect + 0.25 || py[i] < -0.25 || py[i] > 1.25;
        if (age[i] >= life[i] || isOOB) {
          if (isPlume[i] || survivingCount >= targetCount) continue;
          spawnParticle(i, false);
        }

        if (survivingCount !== i) {
          px[survivingCount] = px[i];
          py[survivingCount] = py[i];
          age[survivingCount] = age[i];
          life[survivingCount] = life[i];
          brightness[survivingCount] = brightness[i];
          colorIndex[survivingCount] = colorIndex[i];
          isPlume[survivingCount] = isPlume[i];
        }
        survivingCount++;
      }

      for (activeParticles = survivingCount; activeParticles < targetCount; ) {
        spawnParticle(activeParticles++, false);
      }

      // Decay grid trails
      const decayCoeff = Math.exp(-dt / (0.08 + 0.9 * clamp(fallbackNum(cfg.trail, 0.6), 0, 1.5)));
      for (let i = 0; i < energyData.length; i++) energyData[i] *= decayCoeff;
      for (let i = 0; i < flowData.length; i++) flowData[i] *= decayCoeff;

      const rw = Math.round(cssWidth * pixelRatio);
      const rh = Math.round(cssHeight * pixelRatio);
      const pitchPx = gridMaterial.uniforms.uPitch.value;
      const originX = (rw - gridCols * pitchPx) / 2;
      const originY = (rh - gridRows * pitchPx) / 2;
      const toGridX = (x: number) => ((x / aspect) * rw - originX) / pitchPx - 0.5;
      const toGridY = (y: number) => (y * rh - originY) / pitchPx - 0.5;
      const rateScale = 60 * dt;

      // Splat particles into grid
      for (let i = 0; i < activeParticles; i++) {
        const curAge = age[i];
        const envelope = Math.min(1, curAge / 0.5) * Math.min(1, (life[i] - curAge) / 0.7);
        if (envelope <= 0) continue;
        const energyAmt = brightness[i] * envelope * rateScale;
        if (energyAmt <= 0.0001) continue;

        const gx = toGridX(px[i]);
        const gy = toGridY(py[i]);
        const cellX = Math.floor(gx);
        const cellY = Math.floor(gy);
        if (cellX < -1 || cellY < -1 || cellX >= gridCols || cellY >= gridRows) continue;

        const fx = gx - cellX;
        const fy = gy - cellY;
        const col = getPaletteColor(colorIndex[i] + 0.22 * Math.sin(1.7 * px[i] + colorDrift + 4 * colorIndex[i]));
        const flowX = sampleField(fieldFlowX, px[i], py[i], fieldCols, fieldRows);
        const flowY = sampleField(fieldFlowY, px[i], py[i], fieldCols, fieldRows);

        for (let corner = 0; corner < 4; corner++) {
          const cx = cellX + (corner & 1);
          const cy = cellY + (corner >> 1);
          if (cx < 0 || cy < 0 || cx >= gridCols || cy >= gridRows) continue;

          const w = ((corner & 1) ? fx : 1 - fx) * ((corner >> 1) ? fy : 1 - fy) * energyAmt;
          const offset = cy * gridCols + cx;
          energyData[4 * offset] += col[0] * w;
          energyData[4 * offset + 1] += col[1] * w;
          energyData[4 * offset + 2] += col[2] * w;
          energyData[4 * offset + 3] += w;
          flowData[2 * offset] += flowX * w;
          flowData[2 * offset + 1] += flowY * w;
        }
      }

      energyTexture.needsUpdate = true;
      flowTexture.needsUpdate = true;
    };

    const requestFrame = () => {
      if (isDestroyed || isContextLost || !isVisible || animFrameId) return;
      animFrameId = requestAnimationFrame(animateLoop);
    };

    const animateLoop = (timestamp: number) => {
      animFrameId = 0;
      if (isDestroyed || isContextLost) return;

      const cfg = configRef.current;
      const dt = lastTimestamp && timestamp - lastTimestamp < 100
        ? Math.min(Math.max((timestamp - lastTimestamp) / 1000, 0), 0.05)
        : 1 / 60;
      lastTimestamp = timestamp;

      const isRunning = !cfg.reduced && !cfg.paused;

      if (activeParticles === 0) {
        reallocateGrid();
        const warmSteps = cfg.reduced || !cfg.intro ? 3 : 1.2;
        reallocateGrid();
        updateFlowField();
        reseedAllParticles(true);
        const stepDt = 1 / 30;
        for (let t = 0; t < warmSteps; t += stepDt) {
          stepSimulation(stepDt);
        }
        if (cfg.reduced || !cfg.intro) fadeAlpha = 1;
      }

      if (isRunning) {
        globalTime += dt;
        stepSimulation(dt);
      }

      if (cfg.intro && !cfg.reduced && fadeAlpha < 1) {
        if (introStartTime < 0) introStartTime = timestamp;
        const progress = clamp((timestamp - introStartTime) / 2200, 0, 1);
        fadeAlpha = progress * progress * (3 - 2 * progress);
      } else {
        fadeAlpha = 1;
      }

      renderFrame();

      if (isRunning && !document.hidden) {
        animFrameId = requestAnimationFrame(animateLoop);
      } else {
        lastTimestamp = 0;
      }
    };

    const getNormalizedPointer = (e: PointerEvent | MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: ((e.clientX - rect.left) / rect.width) * aspect,
        y: 1 - (e.clientY - rect.top) / rect.height,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const cfg = configRef.current;
      if (!cfg.interactive || cfg.reduced || cfg.paused) return;
      const pt = getNormalizedPointer(e);
      if (!pt) return;
      const t = globalTime;
      if (!lastPointerPos || t - lastPointerPos.t > 0.25) {
        lastPointerPos = { x: pt.x, y: pt.y, t };
        return;
      }
      const dx = pt.x - lastPointerPos.x;
      const dy = pt.y - lastPointerPos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.035) return;
      const scale = (Math.min(dist / Math.max(0.012, t - lastPointerPos.t), 3) / Math.max(dist, 0.0001)) * 0.12;
      pointerHistory.push({ x: pt.x, y: pt.y, vx: dx * scale, vy: dy * scale, born: t });
      if (pointerHistory.length > 40) pointerHistory.shift();
      lastPointerPos = { x: pt.x, y: pt.y, t };
    };

    const onPointerLeave = () => {
      lastPointerPos = null;
      pointerPressState = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      const cfg = configRef.current;
      pointerPressState = null;
      if (!cfg.interactive || cfg.reduced || cfg.paused || !e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('a,button,input,textarea,select,label,summary,[role=button],[contenteditable=true]')) {
        return;
      }
      pointerPressState = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now() };
    };

    const onPointerUp = (e: PointerEvent) => {
      const press = pointerPressState;
      pointerPressState = null;
      if (!press || press.id !== e.pointerId) return;
      const cfg = configRef.current;
      if (!cfg.interactive || cfg.reduced || cfg.paused) return;
      if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) return;
      if (performance.now() - press.time > 500) return;
      const pt = getNormalizedPointer(e);
      if (pt) {
        triggerPlume(pt.x, pt.y, clamp(fallbackNum(cfg.plume, 1), 0, 3));
        requestFrame();
      }
    };

    const onVisibilityChange = () => {
      lastTimestamp = 0;
      requestFrame();
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      cancelAnimationFrame(animFrameId);
      animFrameId = 0;
    };

    const onContextRestored = () => {
      isContextLost = false;
      prevConfigHash = '';
      requestFrame();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (resizeView()) {
        reallocateGrid();
        if (activeParticles > 0) reseedAllParticles(true);
        renderFrame();
        requestFrame();
      }
    });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        lastTimestamp = 0;
        requestFrame();
      },
      { rootMargin: '120px' }
    );

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointercancel', onPointerLeave);
    doc.addEventListener('visibilitychange', onVisibilityChange);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    resizeObserver.observe(container);
    intersectionObserver.observe(container);

    resizeView();
    syncColors();

    const runtime = {
      sync: () => {
        lastColorSync = -10;
        if (resizeView()) prevConfigHash = '';
        lastTimestamp = 0;
        if (activeParticles > 0 && Math.abs(activeParticles - getTargetParticleCount()) > 0.25 * getTargetParticleCount()) {
          reseedAllParticles(true);
        }
        if (!animFrameId && isVisible) {
          renderFrame();
          requestFrame();
        }
      },
      plume: (x?: number, y?: number, strength?: number) => {
        const cfg = configRef.current;
        if (!cfg.reduced) {
          triggerPlume(
            clamp(x ?? 0.5, 0, 1) * aspect,
            1 - clamp(y ?? 0.5, 0, 1),
            clamp(fallbackNum(strength ?? cfg.plume, 1), 0, 3)
          );
          requestFrame();
        }
      },
      replay: () => {
        introStartTime = -1;
        fadeAlpha = 0;
        activeParticles = 0;
        energyData.fill(0);
        flowData.fill(0);
        lastTimestamp = 0;
        requestFrame();
      },
      destroy: () => {
        isDestroyed = true;
        cancelAnimationFrame(animFrameId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointerleave', onPointerLeave);
        container.removeEventListener('pointercancel', onPointerLeave);
        doc.removeEventListener('visibilitychange', onVisibilityChange);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);

        plane.dispose();
        gridMaterial.dispose();
        bloomDownMaterial.dispose();
        bloomUpMaterial.dispose();
        compositeMaterial.dispose();
        energyTexture.dispose();
        flowTexture.dispose();
        sceneTarget.dispose();
        for (const t of bloomPyramid) t.dispose();
        renderer.dispose();
        canvas.remove();
      },
    };

    runtimeRef.current = runtime;

    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      plume: (x?: number, y?: number, strength?: number) => runtimeRef.current?.plume(x, y, strength),
      replay: () => runtimeRef.current?.replay(),
    }),
    []
  );

  const cleanBg = backgroundColor.trim().toLowerCase();
  const inlineBg = cleanBg === 'transparent' || cleanBg === '' ? undefined : backgroundColor;

  return (
    <div
      ref={containerRef}
      className={cn('relative isolate h-full min-h-[320px] w-full overflow-hidden', className)}
      style={{
        backgroundColor: inlineBg,
        touchAction: 'pan-y',
        ...style,
      }}
    >
      <div ref={canvasMountRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {children ? <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div> : null}
    </div>
  );
});

ChromaCurrent.displayName = 'ChromaCurrent';

export default ChromaCurrent;
