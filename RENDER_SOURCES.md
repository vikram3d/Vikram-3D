# User-supplied render films

Eight films across seven projects. Working names are descriptive and awaiting Vikram’s final titles. All new media was explicitly supplied in this conversation. No brand affiliation or client relationship is claimed.

| Project | Supplied file | Deployed media | Native format |
| --- | --- | --- | --- |
| Graphics Card | graphic card0001-0720.mp4 | assets/graphics-card-render.mp4 | 1920×1080, 24 s |
| Controller Studies — Studio | controller 1.mp4 | assets/controller-studio.mp4 | 1080×1920, 4.586 s |
| Controller Studies — Cavern | controller 2.mp4 | assets/controller-cavern.mp4 | 1080×1920, 3.754 s |
| Keyboard Assembly | 0001-0123.mp4 | assets/keyboard-assembly.mp4 | 1920×1080, 5.125 s |
| Camera Study | 0001-0105.mp4 | assets/camera-study.mp4 | 1920×1080, 4.394 s |
| Automotive Study | WhatsApp Video 2026-10-30 at 12.37.36 PM (1).mp4 | assets/automotive-study.mp4 | 1280×720, 4.167 s |
| Ocean Study | WhatsApp Video 2026-10-30 at 12.37.36 PM.mp4 | assets/ocean-study.mp4 | 1280×720, 20.833 s |
| Particle Orbit | 0001-0500.mp4 | assets/particle-orbit.mp4 | 1920×1080, 20.842 s |

Paths are relative to `dist/`. New MP4s were remuxed using `-c copy -movflags +faststart`, preserving the original encoded video and audio. Cover JPGs are extracted frames, not generated artwork. Full portrait compositions are preserved in the project player. Videos load on demand; only one plays at a time, and closing a project stops and releases its film.

The FFmpeg utility came from the `@ffmpeg-installer/win32-x64` npm distribution. It is a local authoring utility, not a website runtime dependency. The source MP4s in Downloads and G: were left unchanged. Workspace originals are retained in ignored `source-assets/videos/`.
