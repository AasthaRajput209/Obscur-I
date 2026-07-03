import * as THREE from 'three';

// Create a procedural leather texture using canvas noise for bump mapping
function createLeatherNoiseTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Fill with mid-gray base for bump mapping (128, 128, 128 = no bump)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  
  // Draw organic micro-textures (perlin-like noise simulation)
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      
      // Multi-frequency noise for leather pores
      let noiseVal = 0;
      noiseVal += Math.sin(x * 0.5) * Math.cos(y * 0.5) * 8;
      noiseVal += Math.sin(x * 1.5) * Math.sin(y * 1.0) * 4;
      noiseVal += (Math.random() - 0.5) * 12;
      
      const v = Math.min(255, Math.max(0, 128 + noiseVal));
      data[idx] = v;     // R
      data[idx+1] = v;   // G
      data[idx+2] = v;   // B
      data[idx+3] = 255; // A
    }
  }
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// Create a procedural knurling pattern texture for mechanical dials
function createKnurlingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  
  // Draw overlapping diagonal lines for knurled metal effect
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  
  for (let i = -128; i < 256; i += 8) {
    // Top-left to bottom-right
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 128, 128);
    ctx.stroke();
    
    // Top-right to bottom-left
    ctx.beginPath();
    ctx.moveTo(i + 128, 0);
    ctx.lineTo(i, 128);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 2);
  return texture;
}

export function createHeadphoneModel() {
  const headphoneGroup = new THREE.Group();

  // 1. Textures & Materials
  const leatherBump = createLeatherNoiseTexture();
  const knurlingBump = createKnurlingTexture();

  // Premium Anodized Platinum/Silver Metal
  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdcdcdc,
    metalness: 1.0,
    roughness: 0.18,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5
  });

  // Polished Chrome/Silver Details
  const chromeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.05,
    clearcoat: 1.0,
    envMapIntensity: 2.0
  });

  // Soft Premium Leather (Champagne / Warm Cream off-white)
  const leatherMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeae6dd,
    metalness: 0.0,
    roughness: 0.75,
    bumpMap: leatherBump,
    bumpScale: 0.003,
    clearcoat: 0.05,
    clearcoatRoughness: 0.5
  });

  // Matte Structural Polymer (Eggshell White)
  const matteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf5f4f0,
    metalness: 0.05,
    roughness: 0.5,
    clearcoat: 0.1,
    clearcoatRoughness: 0.2
  });

  // Dark Acoustic Mesh Inside Cups
  const meshMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.85
  });

  // Glowing Indicator LED Material
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x928574,
    emissiveIntensity: 3.0
  });

  // Knurled Metal for dials
  const knurledMetalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcccccc,
    metalness: 0.95,
    roughness: 0.25,
    bumpMap: knurlingBump,
    bumpScale: 0.008,
    clearcoat: 0.2
  });

  // --- HEADBAND ASSEMBLY ---
  const headbandGroup = new THREE.Group();

  // Outer Headband Arch (Torus Segment)
  // Radius = 1.35, Tube = 0.06
  const headbandArchGeom = new THREE.TorusGeometry(1.35, 0.05, 32, 128, Math.PI);
  const headbandArch = new THREE.Mesh(headbandArchGeom, metalMaterial);
  headbandArch.rotation.x = Math.PI / 2; // Lie flat/arch vertically
  headbandArch.rotation.z = Math.PI; // Invert to arch upwards
  headbandArch.castShadow = true;
  headbandGroup.add(headbandArch);

  // Inner Leather Headband Padding (Covers 80% of arch)
  const paddingGeom = new THREE.TorusGeometry(1.31, 0.07, 32, 128, Math.PI * 0.82);
  const headbandPadding = new THREE.Mesh(paddingGeom, leatherMaterial);
  headbandPadding.rotation.x = Math.PI / 2;
  headbandPadding.rotation.z = Math.PI + (Math.PI * 0.09); // Centered
  headbandPadding.castShadow = true;
  headbandGroup.add(headbandPadding);

  // End Caps of Headband (Metal sockets)
  const capGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.1, 32);
  
  const leftCap = new THREE.Mesh(capGeom, chromeMaterial);
  leftCap.position.set(-1.35, 0.01, 0);
  leftCap.rotation.z = Math.PI / 2;
  leftCap.castShadow = true;
  headbandGroup.add(leftCap);

  const rightCap = leftCap.clone();
  rightCap.position.set(1.35, 0.01, 0);
  headbandGroup.add(rightCap);

  headphoneGroup.add(headbandGroup);


  // --- SLIDERS (YOKES) ASSEMBLY ---
  const sliderGroup = new THREE.Group();

  // Left Telescopic Rails (Dual bars style)
  const railGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.65, 16);
  
  const leftRail1 = new THREE.Mesh(railGeom, metalMaterial);
  leftRail1.position.set(-1.35, -0.3, -0.025);
  leftRail1.castShadow = true;
  sliderGroup.add(leftRail1);

  const leftRail2 = leftRail1.clone();
  leftRail2.position.set(-1.35, -0.3, 0.025);
  sliderGroup.add(leftRail2);

  // Right Telescopic Rails
  const rightRail1 = leftRail1.clone();
  rightRail1.position.set(1.35, -0.3, -0.025);
  sliderGroup.add(rightRail1);

  const rightRail2 = leftRail2.clone();
  rightRail2.position.set(1.35, -0.3, 0.025);
  sliderGroup.add(rightRail2);

  // Metal slider end brackets / cross bars
  const bracketGeom = new THREE.BoxGeometry(0.03, 0.02, 0.09);
  
  const leftBracket = new THREE.Mesh(bracketGeom, chromeMaterial);
  leftBracket.position.set(-1.35, -0.6, 0);
  leftBracket.castShadow = true;
  sliderGroup.add(leftBracket);

  const rightBracket = leftBracket.clone();
  rightBracket.position.set(1.35, -0.6, 0);
  sliderGroup.add(rightBracket);

  headphoneGroup.add(sliderGroup);


  // --- EARCUPS ASSEMBLY ---

  // Helper to create an Earcup
  function createEarcup(isRight) {
    const cupGroup = new THREE.Group();

    // Pivot Mount connecting to slider
    const pivotGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.06, 16);
    const pivot = new THREE.Mesh(pivotGeom, chromeMaterial);
    pivot.rotation.x = Math.PI / 2;
    pivot.position.set(0, 0.06, 0);
    pivot.castShadow = true;
    cupGroup.add(pivot);

    // Curved outer yoke suspension arm (holds earcup)
    const armGeom = new THREE.TorusGeometry(0.38, 0.02, 16, 64, Math.PI);
    const yokeArm = new THREE.Mesh(armGeom, metalMaterial);
    yokeArm.rotation.x = Math.PI / 2;
    yokeArm.rotation.y = Math.PI; // Face downwards
    yokeArm.position.set(0, 0.06, 0);
    yokeArm.castShadow = true;
    cupGroup.add(yokeArm);

    // Oval Earcup outer housing shell
    const outerShellGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 64);
    const outerShell = new THREE.Mesh(outerShellGeom, matteMaterial);
    outerShell.rotation.z = Math.PI / 2; // Flat face facing out/in
    // Squish it along Z axis to make it oval shape (ear shape)
    outerShell.scale.set(1.0, 1.25, 1.0);
    outerShell.castShadow = true;
    outerShell.receiveShadow = true;
    cupGroup.add(outerShell);

    // Inner Metallic Accent Bevel Ring
    const bevelGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.02, 64);
    const bevelRing = new THREE.Mesh(bevelGeom, chromeMaterial);
    bevelRing.rotation.z = Math.PI / 2;
    bevelRing.scale.set(1.0, 1.25, 1.0);
    // Offset slightly inwards from outer face
    bevelRing.position.x = isRight ? -0.07 : 0.07;
    bevelRing.castShadow = true;
    cupGroup.add(bevelRing);

    // Ear Cushion (Oval soft leather cushion)
    const cushionGeom = new THREE.TorusGeometry(0.28, 0.09, 32, 64);
    const cushion = new THREE.Mesh(cushionGeom, leatherMaterial);
    cushion.rotation.y = Math.PI / 2;
    cushion.scale.set(1.0, 1.28, 0.9); // Oval scaling
    // Positioned on the inner face
    cushion.position.x = isRight ? -0.15 : 0.15;
    cushion.castShadow = true;
    cupGroup.add(cushion);

    // Inner speaker acoustic cover / mesh
    const innerMeshGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.02, 32);
    const innerMesh = new THREE.Mesh(innerMeshGeom, meshMaterial);
    innerMesh.rotation.z = Math.PI / 2;
    innerMesh.scale.set(1.0, 1.25, 1.0);
    innerMesh.position.x = isRight ? -0.14 : 0.14;
    cupGroup.add(innerMesh);

    // LED Status indicator (Left side only)
    if (!isRight) {
      const ledGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8);
      const led = new THREE.Mesh(ledGeom, ledMaterial);
      led.rotation.z = Math.PI / 2;
      led.position.set(-0.05, -0.38, 0.12);
      cupGroup.add(led);
    }

    // Knurled control Dial (Right side only)
    if (isRight) {
      const dialGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 64);
      const dial = new THREE.Mesh(dialGeom, knurledMetalMaterial);
      dial.rotation.z = Math.PI / 2;
      dial.scale.set(1.0, 1.15, 1.0);
      dial.position.x = 0.09; // Outer side of right cup
      dial.castShadow = true;
      cupGroup.add(dial);
      
      // Dial center plate
      const dialCapGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.01, 32);
      const dialCap = new THREE.Mesh(dialCapGeom, metalMaterial);
      dialCap.rotation.z = Math.PI / 2;
      dialCap.scale.set(1.0, 1.15, 1.0);
      dialCap.position.x = 0.115;
      cupGroup.add(dialCap);
    }

    // Audio Jack / USB Ports (Bottom of cups)
    const portGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16);
    const port = new THREE.Mesh(portGeom, chromeMaterial);
    port.rotation.z = Math.PI / 2;
    port.position.set(0, -0.4, -0.05);
    cupGroup.add(port);

    return cupGroup;
  }

  // Build and position Left Cup
  const leftCup = createEarcup(false);
  leftCup.position.set(-1.35, -0.65, 0);
  leftCup.rotation.y = Math.PI * 0.04; // Tilted slightly inward (ergonomic look)
  leftCup.rotation.x = Math.PI * 0.03;
  headphoneGroup.add(leftCup);

  // Build and position Right Cup
  const rightCup = createEarcup(true);
  rightCup.position.set(1.35, -0.65, 0);
  rightCup.rotation.y = -Math.PI * 0.04; // Tilted inward
  rightCup.rotation.x = Math.PI * 0.03;
  headphoneGroup.add(rightCup);


  // Center pivot adjustments
  // Move the entire assembly slightly upward so the headphone centers cleanly
  headphoneGroup.position.y = 0.35;
  headphoneGroup.scale.set(1.4, 1.4, 1.4);

  return headphoneGroup;
}
