# apps/mobile/assets/images

Bundled image assets loaded via `require('../../assets/images/<name>')` (Metro
resolves the path statically, so a file must exist here before the screen that
`require`s it will bundle).

## Expected files (drop them here with these exact names)

| Filename | Source | Used by |
|---|---|---|
| `welcome-bg.jpg` | the **portrait / tall** shoreline photo | Welcome screen full-bleed background (mobile) |
| `welcome-bg-wide.jpg` | the **landscape / 16:9** shoreline photo | Welcome background on wide / web screens (optional) |

Notes:
- Keep the `.jpg` extension (these are photos). If a file is a PNG, name it
  `.png` and tell the dev so the `require(...)` path matches.
- Photography follows docs/35 §6 (activities / atmosphere; no faces to camera as
  the subject — a lone figure in landscape is fine).
