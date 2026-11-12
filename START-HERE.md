# Vikram R — Portfolio

This ZIP includes the complete multi-page portfolio, its eight render videos, the animated loader, and editable source files.

1. Extract the `Vikram-R-Portfolio` folder.
2. Open a terminal in that folder.
3. Run `node server.mjs`.
4. Open http://127.0.0.1:4173 in your browser.

Node.js must be installed. No package installation is needed. Use the local server so page routes and media paths work correctly.

The loader plays whenever you open or refresh the homepage with Motion enabled. On other pages it plays only on the first visit in a browser-tab session; add `?intro=1` to replay it. A Skip intro button is available, and system reduced-motion preferences are respected.

Edit names and project details in `content/projects.json`, and main page content in `content/sections/`. Run `node scripts/build-site.mjs` after editing. The generated website is in `dist/` and can be hosted as a static site.

The original supplied `controller 1.mp4` is included in `original-renders/`. Its website version is already part of Controller Studies. The remaining video files are in `dist/assets/`.

See `README.md` for more editing details and `RENDER_SOURCES.md` for video provenance.
