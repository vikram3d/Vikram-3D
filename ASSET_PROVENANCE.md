# Asset provenance

The original three concept images were generated with the built-in ImageGen tool for this portfolio, October 30, 2026. The gallery studies have since been replaced with Vikram’s supplied render videos and extracted cover frames. Chrome Loop was removed from the homepage on October 31 and remains a playground poster. PNG originals are retained locally under source-assets; compressed JPG copies are under dist/assets.

## hero

Use case: stylized-concept. Asset type: widescreen hero artwork for a sophisticated black 3D artist portfolio, original temporary visual. A huge sculptural loop of polished liquid chrome metal, a thick irregular torus folded and knotted upon itself, bold brutalist abstract sculpture, dramatic perspective. Centered isolated sculpture occupies 75 percent of frame on pure near-black #080808 background. Silver mirror-like metal with sharp white elongated studio reflections and a subtle restrained warm orange reflection on one lower edge. Cinematic CGI, exceptionally realistic, tactile imperfections, premium motion design studio art direction. Wide landscape 16:9 composition. No text, no typography, no logos, no watermark, no colored background or fog. Deep blacks. Entire object stays within frame.

## motion

Use case: stylized-concept. Asset type: temporary project artwork for a black 3D designer portfolio. An impossible sculptural ribbon of translucent glowing burnt orange glass twisting into a fluid arch, suspended over dark charcoal studio floor. Beautiful sculptural motion design still, folds, optical caustics, strong chiaroscuro, subtle grain. Wide landscape framing with the object fully visible and centered. Cinematic high-end CGI, elegant large negative space, black background. Original design. No text, no logos, no watermark.

## product

Use case: product-mockup. Asset type: temporary project artwork for black 3D artist portfolio. One original unbranded graphite-black gaming controller levitating at a dramatic diagonal angle in a dark studio, tactile matte polymer body, glossy analog sticks, four simple round buttons, finely detailed seams. Silver-white rim lighting, tiny warm orange accent on one button. Dramatic cinematic premium 3D product visualization, black background, subtle shadow, entire controller visible and centered with ample margins. Wide landscape composition. No text, no lettering, no logos, no watermark.

The original artwork references informed broad interaction and editorial principles. Current component adaptations are documented below. The optional Three.js room contains original procedural demo sculptures. No client logos or endorsements. User-provided biography and contact information are used with authorization.

## Particle loader

The loader is original procedural Canvas 2D code inspired by the user's reference, https://www.pinterest.com/pin/385480049349862292/ (also supplied as https://pin.it/2bW4UPlLj). The pin links to a Tumblr post describing Necessary Disorder's “Approximated Sun.” Its monochrome sphere, drifting points, and fine filament trails informed the visual direction. The reference GIF is retained only in ignored local `.qa/` files for inspection; it is not served or embedded in the portfolio. No reference code or image asset is used by the loader.

## Previous satin hero background

The hero background adapts the Gradient Waves shader from React Bits, the effect used by its homepage at https://reactbits.dev/ when inspected October 31, 2026. Source: https://reactbits.dev/r/GradientWaves-JS-CSS.json. Copyright (c) 2026 David Haz. The full MIT + Commons Clause notice is retained in `dist/vendor/react-bits-LICENSE.md`.

This earlier background is retained in `dist/hero-waves.js` and `dist/hero-waves.css`, but is no longer loaded by the homepage.

## Aero Shards hero background

The current background adapts React Bits Aero Shards, referenced by the user at https://reactbits.dev/c/backgrounds/aero-shards. Official source: https://reactbits.dev/r/AeroShards-JS-CSS.json, inspected October 31, 2026. Copyright (c) 2026 David Haz; MIT + Commons Clause notice is retained at `dist/vendor/react-bits-LICENSE.md`. The original WGSL shaders and geometry are used in `dist/aero-shards.js`, with the React lifecycle replaced by a plain-JavaScript mount function. Palette, motion settings, capped resolution, 30fps rendering and mouse-only input are customized for the portfolio.

The WebGPU runtime is vgpu 0.3.1, vendored from https://esm.sh/vgpu@0.3.1/es2022/vgpu.bundle.mjs?exports=draw,effect,frame,init,sampler,storage,surface,target,uniforms into `dist/vendor/vgpu-0.3.1.js`. Its MIT license, copyright (c) 2025 Vercel, Inc., is retained at `dist/vendor/vgpu-LICENSE.txt`. `dist/hero-aero.js` provides an original Canvas 2D glass-ribbon fallback for browsers without a working WebGPU adapter. No reference screenshot is embedded as artwork.

Personal hero copy uses the supplied biography: Vikram R, 3D artist and motion designer at Arijentek, working primarily in Blender. `dist/hero-personal.js` cycles the existing role descriptions without changing the heading's accessible name.

The current orbital variant customizes the center ribbon paths with a tilt, asymmetric offset and subtle three-wave deformation. Its icy cyan and violet palette, reduced spread and slower movement distinguish it from the original reference. The Canvas fallback also uses orbital paths.

The active hero now uses the original full-width crossing ribbon placement to match the user-supplied screenshot, retaining the cyan/violet palette. The previous orbital rotations remain confined to the unused center placement. The Canvas fallback again follows flowing ribbons.

## Coda typography

Coda-Regular.ttf and Coda-ExtraBold.ttf were supplied by Vikram in Coda.zip and are self-hosted unchanged under dist/assets/fonts/coda/. Copyright 2010–2011 Vernon Adams. Distributed under the SIL Open Font License 1.1; the full supplied OFL.txt is included beside the fonts.

## Michroma typography

Michroma-Regular.ttf was supplied by Vikram in Coda,Michroma.zip and is self-hosted unchanged under dist/assets/fonts/michroma/. Its supplied SIL Open Font License is retained in the same directory. Michroma is the display face; Coda remains the body face.

## Archivo Black typography

ArchivoBlack-Regular.ttf was supplied by Vikram in Archivo_Black,Coda,Michroma.zip and is self-hosted unchanged under dist/assets/fonts/archivo-black/. The supplied SIL Open Font License is retained beside the font. Archivo Black is the current display face; Coda remains the body face.

## Bold Michroma treatment

Michroma is restored as the current display family using the unchanged user-supplied Regular font. CSS requests a synthesized bold weight with a subtle text stroke; no separate Michroma Bold font file is claimed. The user-approved smaller hero sizes are retained.

## Corvette Playground

The user supplied G:/synovra/March/Car.blend for a temporary Playground. An isolated background Blender process exported dist/assets/car/car.glb and rendered car-preview.jpg without changing the original file or live Blender session. The car was reduced from about 4.47 million evaluated triangles to 603,278 triangles. Procedural material graphs were approximated as PBR materials for glTF. Two original tire images were missing; modeled tread is preserved with plain rubber shading. The model is requested only after the user opens the car viewer.

## Cartridge gallery reference

The game-cartridge selection and insertion interaction was recreated in original HTML/CSS/JavaScript from the user-specified Collect UI reference https://collectui.com/designs/404-page-ui-design-inspiration/a074ea19-75a1-4f4a-80b2-13b1d23e34d8. All cartridge cover artwork comes from the user’s supplied project videos. No reference video, UI artwork, or source code is redistributed. Three.js GLTFLoader and BufferGeometryUtils match the existing 0.170.0 distribution.
