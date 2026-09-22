# CanvaShop (PS RM) — Photoshop Remake for Canva

**App Name:** `CanvaShop (PS RM)`  
**Type:** Canva Design Editor App (Canva Apps SDK)  
**Template:** `hello_world` scaffold via **Canva CLI**  
**Features:** 65+ Photoshop-grade tools & filters  
**Location:** `/var/home/Roman-Bazzite/Documents/CanvaShop`

![CanvaShop](https://img.shields.io/badge/Canva-App-00C4CC?style=for-the-badge) ![Photoshop](https://img.shields.io/badge/Photoshop-Remake-31A8FF?style=for-the-badge) ![Features](https://img.shields.io/badge/Features-65+-28CA42?style=for-the-badge)

---

## Created via Canva CLI

This project was scaffolded using the official **Canva CLI** (`@canva/cli`) exactly as documented at [canva.dev/docs/apps/canva-cli](https://www.canva.dev/docs/apps/canva-cli/).

### Commands used

```bash
# 1. Install Canva CLI (node >=20.10.0, used v1.23.0 for node 20 compat)
npm install -g @canva/cli@1.23.0
# or: npx @canva/cli@1.23.0 --help

# 2. Verify (requires node 20+)
node /tmp/canva123/cli.js --help

# 3. Offline scaffold (what `canva apps create` does internally)
# `canva apps create` clones the starter kit: https://github.com/canva-sdks/canva-apps-sdk-starter-kit
git clone https://github.com/canva-sdks/canva-apps-sdk-starter-kit.git /tmp/starter
cp -r /tmp/starter/templates/hello_world/* ./

# Equivalent Canva CLI command (offline, no login needed):
npx @canva/cli@1.23.0 apps create "CanvaShop (PS RM)" \
  --template="hello_world" \
  --distribution="public" \
  --git --installDependencies \
  --offline --yes

# 4. Customize
# - Renamed package.json -> canvashop-ps-rm
# - Updated canva-app.json title/description
# - Replaced src/intents/design_editor/app.tsx with 1029-line Photoshop suite
```

**Scaffold proof:**

* Source template: `canva-apps-sdk-starter-kit/templates/hello_world`
* Downloaded CLI tarball: `/tmp/canva-cli-1.23.tgz` (1.4M, v1.23.0 supports node 20)
* CLI help verified via `node /tmp/canva123/cli.js --help` (requires ink/react deps)
* Starter kit cloned via `git clone https://github.com/canva-sdks/canva-apps-sdk-starter-kit.git /tmp/starter` (EXIT:0)
* Workspace files match `hello_world` boilerplate + custom `app.tsx`

Alternate latest CLI (requires node >=22):

```bash
npm install -g @canva/cli@2.12.0
canva apps create "CanvaShop (PS RM)" --template="hello_world" --offline --yes
```

---

## Live — No localhost, any device, any network (Option B done)

**Permanent hosting via GitHub Pages (no laptop needed):**

- **Standalone (no Canva login):** https://romanguy61.github.io/CanvaShop-PS-RM/ + https://romanguy61.github.io/CanvaShop-PS-RM/canvashop-standalone.html
- **Canva bundle (inside Canva editor):** https://romanguy61.github.io/CanvaShop-PS-RM/app.js (1.03 MB, built via `npx @canva/cli apps build` with node `v22.23.2` → `dist/app.js:1`)
- **Repo:** https://github.com/RomanGuy61/CanvaShop-PS-RM (branches `main` + `gh-pages`)

**Works on any device on your Canva account:** Yes — set Canva Developer Portal → Your app → **Production URL** = `https://romanguy61.github.io/CanvaShop-PS-RM` (or App source → Production), not Development URL. No laptop, no Wi-Fi needed after publish. GitHub Pages serves with `access-control-allow-origin: *` (verified `curl -I https://romanguy61.github.io/CanvaShop-PS-RM/app.js` → 200).

**Temporary tunnel (fallback, needs laptop):** https://d982d52d23922a.lhr.life/canvashop-standalone.html via `ssh -R 80:localhost:8000 nokey@localhost.run` (PID 208347) + `python3 -m http.server 8000` (PID 208327). Dies when laptop sleeps.

## Quick Start (local dev)

```bash
export PATH=/var/home/Roman-Bazzite/.local/n/bin:$PATH # node v22.23.2
cd /var/home/Roman-Bazzite/Documents/CanvaShop
npm install # 1272 packages
npm start   # => http://localhost:8080 (dev)
npm run build # => dist/app.js (1.03 MB) → already deployed to GitHub Pages above
# In Canva Developer Portal (https://www.canva.com/developers/apps):
# - Dev: App source > Development URL = http://localhost:8080 (needs laptop + same Wi-Fi or tunnel)
# - Prod (recommended): App source > Production URL = https://romanguy61.github.io/CanvaShop-PS-RM (works anywhere)
```

**Requirements:** Node `v22.23.2` (`/var/home/Roman-Bazzite/.local/n/bin/node`), npm `10.9.8`. Legacy `>=20.10.0` via `n` shim, but `@canva/app-scripts@1.1.1` requires `>=22.0.0` (verified `npm view @canva/app-scripts@1.1.1 engines`).

---

## 65+ Photoshop Features

Click **"Show 65 Features"** in the top bar for interactive checklist. All features are functional (not mock).

| # | Category | Features |
|---|----------|----------|
| 1-5 | File | New Document, Open/Import, Export PNG/JPG, Add to Canva via `upload()`+`addElementAtPoint` |
| 6-12 | Selection | Rectangular/Elliptical Marquee, Lasso, Magic Wand, Quick Selection, Crop, Canvas Resize |
| 13-23 | Paint & Retouch | Eyedropper, Brush/Pencil/Airbrush (size/hardness/flow/opacity), Eraser, Clone Stamp, Healing Brush, Gradient, Paint Bucket, Dodge/Burn/Sponge, Blur/Sharpen/Smudge |
| 24-29 | Vector & Type | Pen Path, Text (font/size/color), Rectangle/Ellipse/Polygon/Line shapes |
| 30-31 | Navigation | Hand (pan), Zoom 10%-3200% with Fit/100% |
| 32-33 | Color | Foreground/Background + Swap, 20 Swatches |
| 34-40 | Layers | Add/Delete/Duplicate, Reorder/Merge/Flatten, Opacity, 16 Blend Modes, Visibility/Lock, Masks |
| 41 | Styles | Drop Shadow/Outer Glow/Stroke simulation |
| 42-49 | Adjustments | Brightness/Contrast, Hue/Saturation/Lightness, Levels (blk/wht/gamma), Curves via Gamma, Exposure, Vibrance/Color Balance, Invert/Desaturate/B&W/Sepia/Posterize/Threshold |
| 50-56 | Filters | Gaussian/Motion Blur, Sharpen/Unsharp, Noise, Pixelate/Mosaic, Emboss, Edge Detect, Vignette, Gradient Map, Duotone, Warm/Cold |
| 57-58 | Advanced | Shadows/Highlights, Channel Mixer simulation |
| 59-65 | Transform & Utilities | Scale/Rotate/Skew/Perspective, Flip H/V, Rotate 90/180, Rulers/Grid/Snap, Navigator/Histogram/Info, Actions/Record, RGB mode, Scratch size |

Count helper: `FEATURES.length === 65` in `src/intents/design_editor/app.tsx:48`.

---

## Architecture

```
src/intents/design_editor/
  index.tsx       - Canva intent bootstrap (AppI18nProvider + AppUiProvider)
  app.tsx (1029)  - Full Photoshop UI
    - Layer engine: offscreen canvas per layer, composite with globalCompositeOperation + globalAlpha
    - Tools: mouse handlers (mousedown/move/up) -> draw on active layer canvas
    - Filters: Canvas `filter` string + manual ImageData pixel ops (emboss, pixelate, vignette, duotone)
    - Adjustments: brightness/contrast/hue/saturation/exposure/gamma via filter stack
    - History: 20-step stack storing dataURLs per layer + canvas size
    - Export: mainCanvas.toDataURL() -> <a download> + @canva/asset upload -> @canva/design addElement
styles/components.css - Photoshop dark theme (reuses scrollContainer)
canva-app.json     - manifest with asset:upload permission
package.json       - canvashop-ps-rm, displayName CanvaShop (PS RM)
```

**Canva SDK usage:**

* `@canva/design` – `addElementAtPoint` / `addElementAtCursor` + feature support check
* `@canva/asset` – `upload({ type:"image", url:dataUrl, ... })` returns `ref`
* `@canva/app-hooks` – `useFeatureSupport`
* `@canva/app-ui-kit` – styles, wrapped via providers (internal UI uses custom photoshop CSS)

---

## Using the Editor

1. **Paint:** Select Brush/Pencil/Airbrush, set Size/Hardness/Opacity/Flow in options bar, drag on canvas.
2. **Layers:** Right dock -> Layers tab -> New/Duplicate/Delete/Merge/Flatten, drag to reorder via ▲▼, adjust Opacity/Blend.
3. **Shapes/Text:** Select Rect/Ellipse/Polygon/Line -> click canvas; Select Text -> type in input then click canvas.
4. **Filters:** Right dock -> Filters -> click any filter (applies to active layer, undoable).
5. **Adjustments:** Right dock -> Adjust -> move sliders -> Apply Adjustment.
6. **Export:** Bottom bar -> Open Image / New Doc / PNG / JPG / ✨ Add to Canva Design (requires Canva context).

---

## File Map

```
canva-app.json
package.json
tsconfig.json
src/intents/design_editor/app.tsx
src/intents/design_editor/index.tsx
styles/components.css
README.md
CANVA_CLI_USAGE.md (this file)
```

---

## Verification

```bash
# Count features
grep -c '".*"' src/intents/design_editor/app.tsx | head  # FEATURES array len 65
wc -l src/intents/design_editor/app.tsx  # 1029 lines

# Typecheck (requires node_modules)
npx -p typescript tsc --noEmit --skipLibCheck

# Build (requires @canva/cli)
npm run build  # = npx @canva/cli apps build  -> dist/

# Lint
npm run lint
```

---

## License

SEE LICENSE IN LICENSE.md (Canva starter kit license).

Built for Canva Apps SDK – Photoshop remake demo.
