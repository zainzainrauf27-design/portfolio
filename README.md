# WEB BY ZAINI — 3D Portfolio Starter

A cinematic, scroll-driven 3D portfolio starter built with Vite, Three.js and GSAP.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally (Windows PowerShell)
```powershell
cd WEB-BY-ZAINI-3D
npm.cmd install
npm.cmd run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```powershell
npm.cmd run build
npm.cmd run preview
```

## Current starter features
- Procedural Three.js luxury environment (no Blender assets required yet)
- Scroll-synchronized camera waypoints
- GSAP entrance and section reveal animations
- Responsive navigation and content
- Reduced-motion CSS support
- Editable project and contact content in `index.html`

## Before publishing
1. Replace the WhatsApp number and email in `index.html` with verified public business contact details.
2. Replace project descriptions with accurate current project status and real screenshots.
3. Add Blender GLB assets under `public/models/` and integrate them into `src/main.js`.
4. Test on desktop and real Android devices.
5. Run `npm.cmd run build` and fix all warnings/errors.

## Notes
This is the first runnable foundation, not the finished maximum-detail 3D production website. It uses procedural placeholder architecture. The Blender asset pipeline, real project screenshots, deeper camera choreography and any backend should be added in later phases.
