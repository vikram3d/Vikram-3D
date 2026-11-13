# Vikram R — Form & Motion

A black-and-cyan portfolio for Vikram R, a 3D artist and motion designer with one year of experience at Arijentek.

## Preview and edit

Run `node server.mjs`, then open http://127.0.0.1:4173/. No dependency installation is needed.

Edit project details in `content/projects.json`, content in `content/sections/`, and page composition in `scripts/build-site.mjs`. Shared design refinements are in `dist/revisions.css`.

Run `npm run build`, `npm run check`, and `node scripts/check-pages.mjs`. The build generates four main pages and seven project pages.

## Current experience

- Home: a smaller name with a cyan R; transparent glass introduction aligned with the rotating role; visible work link and credits; a larger About heading; three projects in a scroll-driven card stack.
- Navigation: a floating glass header changes on scroll, with equally sized links and no project count.
- Work: seven cartridges load eight project films into a handheld console. The four individual directional buttons use up/left for the previous project and down/right for the next. Keyboard selection, physical controls, sound, and both controller clips work. Links remain usable without JavaScript.
- Footer: a unified contact area with email, navigation, social links, motion control, and a back-to-top link replaces the previous separated closing blocks.
- Playground has been removed from the published pages, navigation, and sitemap. Its former source and car assets remain archived in this repository for possible future use; they are not loaded by the website.

## Media and motion

Project films are user-supplied. Covers are extracted frames. Project titles remain working titles pending Vikram's final names. Source attributions and font licenses are included; see `ASSET_PROVENANCE.md`.

The Motion toggle and system reduced-motion preference bypass cartridge flight, scroll pinning, and header transitions. Essential navigation and project information remain accessible without JavaScript. Michroma headings retain their bold treatment, with Coda for body text and Arial for longer introductory copy.

Live portfolio: https://vikram-form-motion.vikram700405.chatgpt.site/

## GitHub Pages

Published portfolio: https://vikram3d.github.io/Vikram-3D/

Run `npm run build:github` to generate `.github-pages-output/`. Publish that folder to the root of the existing `gh-pages` branch. The Pages build prefixes navigation, fonts, films, and scripts for the project URL; the normal `dist/` build stays compatible with local preview and root hosting.
## Responsive full-screen layout

Each main section now fills at least the available screen height. The first section accounts for the navigation bar; later sections and film panels fill a full screen. Content stays in normal flow and can grow on small or short screens, rather than being squeezed, clipped, or hidden.

`dist/fullscreen.css` handles the responsive section layout. `dist/fullscreen.js` fits active project cards to their stage and keeps the inserted cartridge attached to the console. On phones all seven cartridge choices are in a visible grid. The latest ZIP's email address, scroll-aware navigation, and four separate console direction buttons are preserved.

Validation covered 42 combinations: six page types at desktop, laptop, short-laptop, tablet, phone, small-phone, and landscape-phone sizes. Navigation, console directions, both controller films, and keyboard menu access were checked separately.
