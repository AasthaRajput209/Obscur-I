import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations(sceneManager, headphoneGroup) {
  // Update pagination indicators active class
  const dots = document.querySelectorAll('.sidebar-indicator .dot');
  function updateActiveDot(index) {
    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Bind pagination dots click events to smooth scroll to targets
  const sections = document.querySelectorAll('.section');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      sections[index].scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Track active section to update dots dynamically on scroll
  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => updateActiveDot(index),
      onEnterBack: () => updateActiveDot(index)
    });
  });

  // --- Cinematic Scroll Timeline ---
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5, // Smooth inertia scroll link
      invalidateOnRefresh: true
    }
  });

  // Set default easing for cinematic camera movement
  const cinematicEase = 'power2.inOut';

  // State 0: Intro (Initial coordinates defined as base values)
  // GSAP will animate values from this state to State 1

  // State 1: Focus on Cushion (Memory Foam & Leather)
  mainTimeline.to(sceneManager.cameraBasePos, {
    x: -1.6,
    y: -0.2,
    z: 1.8,
    ease: cinematicEase,
    duration: 1
  }, 0)
  .to(sceneManager.cameraTarget, {
    x: -1.3,
    y: -0.45,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 0)
  .to(headphoneGroup.rotation, {
    x: Math.PI * 0.08,
    y: Math.PI * 0.44,
    z: -Math.PI * 0.04,
    ease: cinematicEase,
    duration: 1
  }, 0)
  .to(headphoneGroup.position, {
    x: 0.45,
    y: 0.2,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 0)
  .to('#card-cushion', {
    opacity: 1,
    y: 0,
    ease: 'power1.out',
    duration: 0.4
  }, 0.5) // Fades in halfway through first scroll section

  // State 2: Focus on Slider (Precision Metallurgy)
  mainTimeline.to(sceneManager.cameraBasePos, {
    x: 1.4,
    y: 0.5,
    z: 1.6,
    ease: cinematicEase,
    duration: 1
  }, 1)
  .to(sceneManager.cameraTarget, {
    x: 0.9,
    y: 0.1,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 1)
  .to(headphoneGroup.rotation, {
    x: -Math.PI * 0.05,
    y: -Math.PI * 0.1,
    z: Math.PI * 0.08,
    ease: cinematicEase,
    duration: 1
  }, 1)
  .to(headphoneGroup.position, {
    x: -0.5,
    y: 0.1,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 1)
  .to('#card-cushion', {
    opacity: 0,
    y: -30,
    ease: 'power1.in',
    duration: 0.3
  }, 1) // Fade out previous card
  .to('#card-slider', {
    opacity: 1,
    y: 0,
    ease: 'power1.out',
    duration: 0.4
  }, 1.5)

  // State 3: Focus on Drivers (Acoustics & Beryllium Driver)
  mainTimeline.to(sceneManager.cameraBasePos, {
    x: -0.2,
    y: -0.3,
    z: 2.0,
    ease: cinematicEase,
    duration: 1
  }, 2)
  .to(sceneManager.cameraTarget, {
    x: -0.65,
    y: -0.4,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 2)
  .to(headphoneGroup.rotation, {
    x: 0.08,
    y: Math.PI * 0.73,
    z: 0.02,
    ease: cinematicEase,
    duration: 1
  }, 2)
  .to(headphoneGroup.position, {
    x: 0.5,
    y: 0.25,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 2)
  .to('#card-slider', {
    opacity: 0,
    y: -30,
    ease: 'power1.in',
    duration: 0.3
  }, 2)
  .to('#card-driver', {
    opacity: 1,
    y: 0,
    ease: 'power1.out',
    duration: 0.4
  }, 2.5)

  // State 4: Focus on Controls (Tactile Volume Dial)
  mainTimeline.to(sceneManager.cameraBasePos, {
    x: 1.7,
    y: -0.3,
    z: 1.8,
    ease: cinematicEase,
    duration: 1
  }, 3)
  .to(sceneManager.cameraTarget, {
    x: 1.3,
    y: -0.5,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 3)
  .to(headphoneGroup.rotation, {
    x: 0.08,
    y: -Math.PI * 0.48,
    z: -0.04,
    ease: cinematicEase,
    duration: 1
  }, 3)
  .to(headphoneGroup.position, {
    x: -0.4,
    y: 0.15,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 3)
  .to('#card-driver', {
    opacity: 0,
    y: -30,
    ease: 'power1.in',
    duration: 0.3
  }, 3)
  .to('#card-controls', {
    opacity: 1,
    y: 0,
    ease: 'power1.out',
    duration: 0.4
  }, 3.5)

  // State 5: Outro / Majestic Hero Shot Pullback
  // Let the headphones rotate smoothly through a complete full rotation loop
  mainTimeline.to(sceneManager.cameraBasePos, {
    x: 0,
    y: 0,
    z: 5.0,
    ease: cinematicEase,
    duration: 1
  }, 4)
  .to(sceneManager.cameraTarget, {
    x: 0,
    y: 0.1,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 4)
  .to(headphoneGroup.rotation, {
    x: 0.05,
    y: -Math.PI * 2.25, // Full dramatic spin
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 4)
  .to(headphoneGroup.position, {
    x: 0,
    y: 0.35,
    z: 0,
    ease: cinematicEase,
    duration: 1
  }, 4)
  .to('#card-controls', {
    opacity: 0,
    y: -30,
    ease: 'power1.in',
    duration: 0.3
  }, 4)

  // Double check and trigger scroll refresh to configure correct start/end triggers
  ScrollTrigger.refresh();
}
