import { SceneManager } from './sceneManager.js';
import { createHeadphoneModel } from './headphoneModel.js';
import { initScrollAnimations } from './scrollAnimation.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize custom interactive cursor
  initCustomCursor();

  // 2. Simulate luxury calibration progress bar
  initCalibrationLoader();

  // 3. Setup Three.js scene
  const container = document.getElementById('canvas-container');
  const sceneManager = new SceneManager(container);

  // 4. Generate procedural headphones model and add it to the scene
  const headphones = createHeadphoneModel();
  
  // Set initial product rotation to beautiful 3/4 angle
  headphones.rotation.y = -Math.PI / 4;
  sceneManager.scene.add(headphones);

  // 5. Initialize GSAP Scroll animations
  initScrollAnimations(sceneManager, headphones);

  // 6. Bind drawer slider controls
  initSpecsDrawer();

  // 7. Core requestAnimationFrame render loop
  function tick() {
    sceneManager.update();
    requestAnimationFrame(tick);
  }
  
  // Start loop immediately
  tick();
});

// Custom Inertial Cursor Manager
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update inner point cursor immediately
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth follow/damping loop for cursor outer ring
  function updateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Handle pointer-events: auto hover overrides
  const attachHoverEvents = () => {
    const hoverElements = document.querySelectorAll('a, .dot, .btn-luxury, .specs-close, .logo');
    hoverElements.forEach(el => {
      // Remove to prevent duplicates
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });
  };

  function onMouseEnter() {
    document.body.classList.add('cursor-hover');
  }

  function onMouseLeave() {
    document.body.classList.remove('cursor-hover');
  }

  // Run hover attachments and monitor DOM updates for future elements
  attachHoverEvents();
  
  // Custom observer to re-hook events if DOM elements change
  const observer = new MutationObserver(attachHoverEvents);
  observer.observe(document.body, { childList: true, subtree: true });
}

// Calibration Loader Loop
function initCalibrationLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loader-progress');
  
  let currentProgress = 0;
  const interval = setInterval(() => {
    // Elegant uneven progress jumps
    currentProgress += Math.random() * 12 + 4;
    
    if (currentProgress >= 100) {
      currentProgress = 100;
      clearInterval(interval);
      
      // Delay slightly before fading screen
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 1200); // Match CSS transition duration
      }, 400);
    }
    progress.style.width = `${Math.min(currentProgress, 100)}%`;
  }, 80);
}

// Luxury Specifications Drawer controls
function initSpecsDrawer() {
  const trigger = document.getElementById('specs-trigger');
  const panel = document.getElementById('specs-panel');
  const close = document.getElementById('specs-close');

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    panel.classList.add('open');
  });

  close.addEventListener('click', () => {
    panel.classList.remove('open');
  });
}
