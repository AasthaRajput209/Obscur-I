import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Custom film grain and vignette shader for luxury film aesthetic
const CinematicShader = {
  name: 'CinematicShader',
  uniforms: {
    'tDiffuse': { value: null },
    'uNoiseAmount': { value: 0.015 },
    'uVignetteDarkness': { value: 1.0 },
    'uVignetteOffset': { value: 1.1 },
    'uTime': { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uNoiseAmount;
    uniform float uVignetteDarkness;
    uniform float uVignetteOffset;
    uniform float uTime;
    varying vec2 vUv;

    // Fast pseudo-random generator
    float random(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // 1. Film Grain
      float noise = (random(vUv + sin(uTime)) - 0.5) * uNoiseAmount;
      vec3 color = texel.rgb + noise;
      
      // 2. Vignette
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      float vignette = smoothstep(uVignetteOffset, uVignetteOffset - 0.5, dist * uVignetteDarkness);
      color *= vignette;
      
      // Output
      gl_FragColor = vec4(color, texel.a);
    }
  `
};

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.clock = new THREE.Clock();
    
    // Interaction coordinates
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    
    // Camera base coordinates
    this.cameraBasePos = new THREE.Vector3(0, 0, 5);
    this.cameraTarget = new THREE.Vector3(0, 0.1, 0);
    
    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfafafa); // Studio off-white
    this.scene.fog = new THREE.FogExp2(0xfafafa, 0.05);

    // 2. Camera Setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(this.cameraTarget);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    // Shadows & Tonemapping
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Shadow Catcher Ground Plane
    this.setupShadowCatcher();

    // 6. Post-Processing Pipeline
    this.setupPostProcessing(width, height);

    // 7. Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Adjust framing immediately for responsive screen sizes
    this.adjustFraming();
  }

  setupLighting() {
    // Ambient Light (Overall soft bounce light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Key Light (Main soft directional studio box, casting shadows)
    const keyLight = new THREE.DirectionalLight(0xfffaee, 2.5); // Soft warm tone
    keyLight.position.set(4, 5, 3.5);
    keyLight.castShadow = true;
    
    // Shadow tuning
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    const d = 2.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0006;
    keyLight.shadow.radius = 6; // Blur shadow edges
    
    this.scene.add(keyLight);

    // Fill Light (Diffused cool fill opposite to Key Light)
    const fillLight = new THREE.DirectionalLight(0xe4edff, 1.2); // Cool tint
    fillLight.position.set(-4, 2, 2);
    this.scene.add(fillLight);

    // Overhead Light (Soft top rim light)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 5, 0);
    this.scene.add(topLight);

    // Rim/Backlight (Highlights contours from behind)
    const rimLight = new THREE.PointLight(0xffffff, 3.5, 10);
    rimLight.position.set(0, 1, -4.5);
    this.scene.add(rimLight);
  }

  setupShadowCatcher() {
    // Large ground plane to receive soft shadows
    const groundGeom = new THREE.PlaneGeometry(30, 30);
    
    // Shadow material renders ONLY the shadows casting on it
    const groundMat = new THREE.ShadowMaterial({
      opacity: 0.08 // Soft, luxury shadow intensity
    });
    
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.45; // Position below headphones
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  setupPostProcessing(width, height) {
    this.composer = new EffectComposer(this.renderer);
    
    // 1. Render Pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 2. Bloom Pass (Subtle glow on metallic reflections/LEDs)
    // Resolution, Strength, Radius, Threshold
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height), 
      0.35, // Strength (subtle)
      0.45, // Radius
      0.82  // Threshold
    );
    this.composer.addPass(bloomPass);

    // 3. Custom Film Grain / Vignette Shader Pass
    this.cinematicPass = new ShaderPass(CinematicShader);
    this.composer.addPass(this.cinematicPass);

    // 4. Output/Tone-Mapping Pass
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  // Track target coordinates for cursor parallax
  onMouseMove(e) {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    this.adjustFraming();
  }

  adjustFraming() {
    // Adjust camera distance based on viewport width
    const width = window.innerWidth;
    
    if (width <= 480) {
      // Mobile zoom out
      this.cameraBasePos.z = 7.5;
    } else if (width <= 992) {
      // Tablet zoom out
      this.cameraBasePos.z = 6.2;
    } else {
      // Desktop standard
      this.cameraBasePos.z = 4.8;
    }
  }

  // Main rendering frame update
  update() {
    const time = this.clock.getElapsedTime();
    
    // 1. Update Cinematic Shader time uniform for dynamic noise
    if (this.cinematicPass) {
      this.cinematicPass.uniforms.uTime.value = time;
    }

    // 2. Smoothly interpolate (lerp) mouse movement for cursor parallax
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 3. Continuous Camera Drift (Subtle floating noise)
    const driftX = Math.sin(time * 0.4) * 0.08;
    const driftY = Math.cos(time * 0.5) * 0.08;
    
    // Combine base scroll camera position, mouse parallax, and drift
    this.camera.position.x = this.cameraBasePos.x + (this.mouse.x * 0.25) + driftX;
    this.camera.position.y = this.cameraBasePos.y + (this.mouse.y * 0.2) + driftY;
    this.camera.position.z = this.cameraBasePos.z;

    // Keep camera focused on target with small offset drift
    const dynamicTarget = this.cameraTarget.clone().add(new THREE.Vector3(driftX * 0.3, driftY * 0.3, 0));
    this.camera.lookAt(dynamicTarget);

    // 4. Render using Post-processing Composer
    this.composer.render();
  }
}
