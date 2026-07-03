# OBSCUR - I: Premium Interactive Product Showcase

An award-quality, highly polished interactive product showcase website for the **Obscur - I Wireless Headphones** inspired by premium cinematic motion design. 

The website is designed to feel like a luxury industrial product film translated into an interactive, scroll-driven experience. It features physically based rendering, cinematic camera sweeps, glassmorphic feature highlights, and a clean off-white studio layout.

---

## Key Features

- **Procedural 3D Model**: The entire Obscur - I headphones assembly is built procedurally inside Three.js using primitive geometries and groups. This ensures instant loading (under 100ms), 100% offline availability, and high-fidelity rendering without the need to load heavy external glTF assets.
- **Micro-Texture Details**: Includes dynamic offscreen `<canvas>` noise generators. These generate real-time leather grain and knurled metal bump-maps, reflecting light realistically under macro close-up camera angles.
- **Cinematic Lighting Rig**: A soft-box studio setup containing a primary warm Key light casting soft shadows, cool Fill light, Overhead diffuser, and a high-contrast Rim light to outline metallic edges. Includes a custom ground shadow catcher.
- **Scrub-Driven Scroll Timeline**: Uses GSAP and ScrollTrigger to link scroll progress to camera position sweeps, focus targets, product rotation, and card animations.
- **Custom Post-Processing**: Includes bloom highlights and a custom shader pass rendering vignette and film grain for a rich photographic look.
- **Tactile Parallax & Cursor**: Features custom dual-element cursor physics and mouse-move camera tilt to give a sense of depth and physical interaction.

---

## Getting Started

Since the project uses browser import maps for dependencies, there are **no package managers (npm/yarn) or compilation steps required**. 

To run the project locally:

1. Clone or download this repository.
2. Open a terminal in the project directory.
3. Start a local HTTP server. For example, using Python:
   ```bash
   python -m http.server 3000
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

*Note: Opening the `index.html` file via double-click (`file://` protocol) will fail due to standard browser security (CORS) rules around ES module imports. A local server must be used.*

---

## File Structure

- `index.html` — Layout structure, sections, import map, and typography loaders.
- `index.css` — Modern editorial styling, glassmorphic cards, layout grid lines, custom cursor styles.
- `main.js` — App manager, loading sequence, specifications slider controls, cursor physics.
- `sceneManager.js` — Three.js engine boilerplate, lighting, post-processing composer, camera drift.
- `headphoneModel.js` — Procedural 3D geometry builders, materials, canvas textures.
- `scrollAnimation.js` — GSAP scroll timeline, section navigation hooks.

---

Built by **Obscur Acoustics**.
