import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
import { stateAtTime } from './timeline.js';

export const WIDTH = 1920;
export const HEIGHT = 1080;

const COLORS = {
  background: 0xffffff, // #FFFFFF
  violet: 0x7c3aed, // #7C3AED
  markViolet: 0x9262f6, // a touch lighter so the raised mark reads on the face
};

// Tile dimensions (world units).
const TILE_SIZE = 2.4; // finished outer size, bevel included
const TILE_DEPTH = 0.42; // finished thickness, bevel included
const TILE_BEVEL = 0.075;
const TILE_CENTER_Y = 1.5; // floats above the floor; contact shadow grounds it
const LOOK_TARGET = new THREE.Vector3(0, 1.4, 0);

// Horizontal lens shift (PerspectiveCamera.filmOffset, mm on a 35 mm gauge).
// Moves the tile left of centre without skewing its perspective.
const FILM_OFFSET = 5.0;

/* ------------------------------------------------------------------ */
/* Procedural geometry                                                 */
/* ------------------------------------------------------------------ */

/** Superellipse ("squircle") outline, the familiar app-tile silhouette. */
function squircleShape(halfSize, exponent = 5, segments = 192) {
  const shape = new THREE.Shape();
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const x = halfSize * Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent);
    const y = halfSize * Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/** Turns a centreline polyline into a closed stroke outline with round caps. */
function strokeShape(points, halfWidth, capSegments = 16) {
  const normals = points.map((p, i) => {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const d = new THREE.Vector2().subVectors(b, a).normalize();
    return new THREE.Vector2(-d.y, d.x);
  });
  const outline = [];
  // Left edge, forward.
  points.forEach((p, i) => outline.push(p.clone().addScaledVector(normals[i], halfWidth)));
  // End cap.
  const last = points.length - 1;
  const endAngle = Math.atan2(normals[last].y, normals[last].x);
  for (let k = 1; k < capSegments; k++) {
    const a = endAngle - (k / capSegments) * Math.PI;
    outline.push(new THREE.Vector2(points[last].x + Math.cos(a) * halfWidth, points[last].y + Math.sin(a) * halfWidth));
  }
  // Right edge, backward.
  for (let i = last; i >= 0; i--) outline.push(points[i].clone().addScaledVector(normals[i], -halfWidth));
  // Start cap.
  const startAngle = Math.atan2(-normals[0].y, -normals[0].x);
  for (let k = 1; k < capSegments; k++) {
    const a = startAngle - (k / capSegments) * Math.PI;
    outline.push(new THREE.Vector2(points[0].x + Math.cos(a) * halfWidth, points[0].y + Math.sin(a) * halfWidth));
  }
  return new THREE.Shape(outline);
}

/** One period of a sine wave, centred on (cx, cy). */
function waveCenterline(cx, cy, halfLength, amplitude, samples = 96) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples; // 0..1
    const x = -halfLength + u * 2 * halfLength;
    pts.push(new THREE.Vector2(cx + x, cy + amplitude * Math.sin(u * Math.PI * 2)));
  }
  return pts;
}

function buildTileGeometry() {
  const half = TILE_SIZE / 2 - TILE_BEVEL; // bevel grows the outline outward
  const geometry = new THREE.ExtrudeGeometry(squircleShape(half), {
    depth: TILE_DEPTH - TILE_BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: TILE_BEVEL,
    bevelSize: TILE_BEVEL,
    bevelOffset: 0,
    bevelSegments: 10,
    curveSegments: 1, // the outline is already finely sampled
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/** Raised "flow" mark: two parallel sine strokes with rounded ends. */
function buildMarkGeometry() {
  const halfWidth = 0.085;
  const shapes = [
    strokeShape(waveCenterline(-0.04, 0.2, 0.6, 0.12), halfWidth),
    strokeShape(waveCenterline(0.1, -0.2, 0.46, 0.12), halfWidth),
  ];
  const bevel = 0.026;
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 5,
    curveSegments: 1,
  });
  geometry.computeBoundingBox();
  // Back face sits on z = 0 so the mark can be placed flush on the tile face.
  geometry.translate(0, 0, -geometry.boundingBox.min.z);
  return geometry;
}

/* ------------------------------------------------------------------ */
/* Contact shadow (deterministic: re-rendered from the current pose)   */
/* ------------------------------------------------------------------ */

function createContactShadow(renderer, scene) {
  const size = { w: 7, h: 7 };
  const resolution = 1024;
  const params = { opacity: 0.26, darkness: 1.2, blur: 3.0, cameraHeight: 3.0 };

  const group = new THREE.Group();
  group.position.y = 0.001;

  const target = new THREE.WebGLRenderTarget(resolution, resolution, { type: THREE.HalfFloatType });
  target.texture.generateMipmaps = false;
  const targetBlur = new THREE.WebGLRenderTarget(resolution, resolution, { type: THREE.HalfFloatType });
  targetBlur.texture.generateMipmaps = false;

  const planeGeometry = new THREE.PlaneGeometry(size.w, size.h).rotateX(Math.PI / 2);
  const plane = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({
      map: target.texture,
      opacity: params.opacity,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  plane.renderOrder = 1;
  plane.scale.y = -1; // the shadow camera looks up, so flip back
  group.add(plane);

  const blurPlane = new THREE.Mesh(planeGeometry);
  blurPlane.visible = false;
  group.add(blurPlane);

  const shadowCamera = new THREE.OrthographicCamera(-size.w / 2, size.w / 2, size.h / 2, -size.h / 2, 0, params.cameraHeight);
  shadowCamera.rotation.x = Math.PI / 2;
  group.add(shadowCamera);

  // Depth -> alpha: nearer to the floor = darker.
  const depthMaterial = new THREE.MeshDepthMaterial();
  depthMaterial.userData.darkness = { value: params.darkness };
  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.darkness = depthMaterial.userData.darkness;
    shader.fragmentShader = /* glsl */ `
      uniform float darkness;
      ${shader.fragmentShader.replace(
        'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
        'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );',
      )}
    `;
  };
  depthMaterial.depthTest = false;
  depthMaterial.depthWrite = false;

  const hBlur = new THREE.ShaderMaterial(HorizontalBlurShader);
  hBlur.depthTest = false;
  const vBlur = new THREE.ShaderMaterial(VerticalBlurShader);
  vBlur.depthTest = false;

  function blur(amount) {
    blurPlane.visible = true;
    blurPlane.material = hBlur;
    hBlur.uniforms.tDiffuse.value = target.texture;
    hBlur.uniforms.h.value = amount / 256;
    renderer.setRenderTarget(targetBlur);
    renderer.render(blurPlane, shadowCamera);

    blurPlane.material = vBlur;
    vBlur.uniforms.tDiffuse.value = targetBlur.texture;
    vBlur.uniforms.v.value = amount / 256;
    renderer.setRenderTarget(target);
    renderer.render(blurPlane, shadowCamera);
    blurPlane.visible = false;
  }

  function update() {
    const background = scene.background;
    scene.background = null;
    plane.visible = false;
    scene.overrideMaterial = depthMaterial;

    const clearAlpha = renderer.getClearAlpha();
    renderer.setClearAlpha(0);
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, shadowCamera);
    scene.overrideMaterial = null;

    // Two blur passes: a wide soft falloff, then a smaller pass to remove banding.
    blur(params.blur);
    blur(params.blur * 0.4);

    renderer.setRenderTarget(null);
    renderer.setClearAlpha(clearAlpha);
    plane.visible = true;
    scene.background = background;
  }

  return { group, update };
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export function createFlowScene(canvas, { pixelRatio = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true, // lets the capture read the frame after render
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(WIDTH, HEIGHT, false);

  // Colour management: sRGB hex inputs are converted to the linear working space
  // (ColorManagement is on by default); output is encoded back to sRGB.
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Khronos PBR Neutral keeps the brand violet's hue/saturation (AgX would grey it)
  // and rolls highlights off gently instead of clipping them.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  // A Color background is written via the clear colour, which is not tone mapped,
  // so the frame background stays exactly #FFFFFF.
  scene.background = new THREE.Color(COLORS.background);

  // Soft studio reflections from the procedural RoomEnvironment (no image files).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = envTexture;
  scene.environmentIntensity = 0.5;

  // Lights: large soft key, cool fill, and a rim to pick out the bevels.
  const key = new THREE.DirectionalLight(0xfffaf4, 1.4);
  key.position.set(-4.5, 7.5, 6.5);
  scene.add(key);
  const fill = new THREE.HemisphereLight(0xffffff, 0xeeeaf5, 0.45);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  rim.position.set(5.5, 4.5, -4.5);
  scene.add(rim);

  // Tile.
  const tileMaterial = new THREE.MeshPhysicalMaterial({
    color: COLORS.violet,
    roughness: 0.42, // satin, not gloss
    metalness: 0.0,
    specularIntensity: 0.55, // restrained highlights
    clearcoat: 0.22,
    clearcoatRoughness: 0.38,
    sheen: 0.35,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0xc9b6fb),
  });
  const markMaterial = new THREE.MeshPhysicalMaterial({
    color: COLORS.markViolet,
    roughness: 0.34,
    metalness: 0.0,
    specularIntensity: 0.6,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
  });

  const tilePivot = new THREE.Group();
  tilePivot.position.set(0, TILE_CENTER_Y, 0);
  scene.add(tilePivot);

  const tile = new THREE.Mesh(buildTileGeometry(), tileMaterial);
  tilePivot.add(tile);

  const mark = new THREE.Mesh(buildMarkGeometry(), markMaterial);
  mark.position.z = TILE_DEPTH / 2 - 0.004; // flush on the front face
  tilePivot.add(mark);

  const shadow = createContactShadow(renderer, scene);
  scene.add(shadow.group);

  const camera = new THREE.PerspectiveCamera(28, WIDTH / HEIGHT, 0.1, 100);
  camera.filmOffset = FILM_OFFSET;

  const spherical = new THREE.Spherical();

  /**
   * Directly sets every animated property for `seconds`, then renders.
   * No state carries over between calls, so any frame can be rendered in any order.
   */
  function renderAtTime(seconds) {
    const s = stateAtTime(seconds);

    // Camera: spherical orbit around a fixed target (y-up; elevation from the horizon).
    spherical.set(s.camera.radius, Math.PI / 2 - s.camera.elevation, s.camera.azimuth);
    camera.position.setFromSpherical(spherical).add(LOOK_TARGET);
    camera.lookAt(LOOK_TARGET);
    camera.updateProjectionMatrix();

    // Tile pose.
    tilePivot.rotation.set(s.tile.pitch, s.tile.yaw, s.tile.roll, 'YXZ');
    tilePivot.updateMatrixWorld(true);

    shadow.update();
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    return s;
  }

  return { renderer, scene, camera, renderAtTime };
}
