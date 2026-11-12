# Vikram R — Form & Motion

A black-and-cyan portfolio for Vikram R, a 3D artist and motion designer with one year of experience at Arijentek.

## Preview and edit

Run `node server.mjs`, then open http://127.0.0.1:4173/. No dependency installation is needed.

Edit project details in `content/projects.json`, content in `content/sections/`, and page composition in `scripts/build-site.mjs`. Shared design refinements are in `dist/revisions.css`.

Run `npm run build`, `npm run check`, and `node scripts/check-pages.mjs`. The build generates four main pages and seven project pages.

## Current experience

- Home: a smaller name with a cyan R; transparent glass introduction aligned with the rotating role; visible work link and credits; a larger About heading; three projects in a scroll-driven card stack.
- Navigation: a floating glass header changes on scroll, with equally sized links and no project count.
- Work: seven cartridges load eight project films into a handheld console. Keyboard selection, physical controls, sound, and both controller clips work. Links remain usable without JavaScript.
- Footer: a unified contact area with email, navigation, social links, motion control, and a back-to-top link replaces the previous separated closing blocks.
- Playground has been removed from the published pages, navigation, and sitemap. Its former source and car assets remain archived in this repository for possible future use; they are not loaded by the website.

## Media and motion

Project films are user-supplied. Covers are extracted frames. Project titles remain working titles pending Vikram's final names. Source attributions and font licenses are included; see `ASSET_PROVENANCE.md`.

The Motion toggle and system reduced-motion preference bypass cartridge flight, scroll pinning, and header transitions. Essential navigation and project information remain accessible without JavaScript. Michroma headings retain their bold treatment, with Coda for body text and Arial for longer introductory copy.

Live portfolio: https://vikram-form-motion.vikram700405.chatgpt.site/
