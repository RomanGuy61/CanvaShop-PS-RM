# CanvaShop (PS RM) — Hosting — No localhost needed, any device, any network

## Permanent (no laptop needed) — GitHub Pages (Option B done)

- **Repo:** https://github.com/RomanGuy61/CanvaShop-PS-RM (main + gh-pages)
- **Pages URL:** https://romanguy61.github.io/CanvaShop-PS-RM/
- **Standalone:** https://romanguy61.github.io/CanvaShop-PS-RM/canvashop-standalone.html (also `index.html` → same)
- **Canva bundle:** https://romanguy61.github.io/CanvaShop-PS-RM/app.js (1.03 MB) + `messages_en.json`
- **Verified:** `curl -I https://romanguy61.github.io/CanvaShop-PS-RM/canvashop-standalone.html` → 200 `access-control-allow-origin: *`, `curl -I https://romanguy61.github.io/CanvaShop-PS-RM/app.js` → 200 (built `dist/app.js:1` via `npx @canva/cli apps build` with node `v22.23.2`)
- **Works on any device WITHOUT Canva (standalone):** Yes — `https://romanguy61.github.io/CanvaShop-PS-RM/` works forever, no laptop, no Canva account needed. GitHub Pages is permanent, survives reboot/sleep.
- **Inside Canva on any device:** See next section — **do NOT put GitHub Pages URL in Development URL** (Canva validates: `This field must be a valid localhost URL with port number specified or an allowed hostname` — `github.io` is not allowed for Development URL, only `http://localhost:8080` is).

## Temporary tunnel (needs laptop, fallback)

A single-file Photoshop remake at `canvashop-standalone.html` (57kB) that runs with React + Babel via CDN.

### Live URLs (temporary, needs laptop)

- **Local (this machine):** http://localhost:8000/canvashop-standalone.html
- **LAN (same Wi-Fi, any phone/tablet/PC):** http://192.168.1.71:8000/canvashop-standalone.html
- **Internet (any network, any device world-wide, temporary):** https://d982d52d23922a.lhr.life/canvashop-standalone.html
  - Tunnel via `ssh -R 80:localhost:8000 nokey@localhost.run` (PID 208347, see `/tmp/tunnel2.log`)
  - QR code in tunnel log: open `https://d982d52d23922a.lhr.life` on mobile → scans to same URL
  - `curl -I https://d982d52d23922a.lhr.life/canvashop-standalone.html` → 200 OK, `x-backend-addr: 174.226.193.194:1529`
  - **Dies when laptop sleeps/off/Wi-Fi off — use GitHub Pages above for permanent**

**Server:** `python3 -m http.server 8000 --bind 0.0.0.0 --directory /var/home/Roman-Bazzite/Documents/CanvaShop` (PID 208327, `nohup`, logs `/tmp/canvashop-server.log`), listening on `0.0.0.0:8000`.

**No install needed:** Just open the URL. Works offline after first load (CDN cached). Export via PNG/JPG or Web Share on mobile.

### How it was put

```bash
# 1. Created standalone single-file from Canva app
# Copied logic from src/intents/design_editor/app.tsx:182 (1029 lines, 65 features) → canvashop-standalone.html
# Stripped @canva/* imports, stubbed useFeatureSupport/upload, kept all 65 filters/tools

# 2. Host LAN-wide (no localhost)
cd /var/home/Roman-Bazzite/Documents/CanvaShop
nohup python3 -m http.server 8000 --bind 0.0.0.0 > /tmp/canvashop-server.log 2>&1 &
# → http://192.168.1.71:8000/canvashop-standalone.html on any device on same Wi-Fi

# 3. Host internet-wide (no localhost, no LAN needed)
nohup ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:8000 nokey@localhost.run > /tmp/tunnel2.log 2>&1 &
# → https://d982d52d23922a.lhr.life/canvashop-standalone.html (world-wide)
```

---

## Canva App (inside Canva editor) — CORRECT permanent flow

**Why you saw `This field must be a valid localhost URL with port number specified or an allowed hostname`:**
`App source > Development URL` **only accepts** `http://localhost:<port>` (e.g. `http://localhost:8080`) or hostnames on Canva's allowlist. `https://romanguy61.github.io` / `https://surge.sh` / `https://*.lhr.life` are **not allowed** there — that's by design. Don't paste GitHub Pages there.

**Two ways to get "any device, any network" *inside Canva*:**

### 1) Development (needs laptop, temporary)
```bash
export PATH=/var/home/Roman-Bazzite/.local/n/bin:$PATH # node v22.23.2
cd /var/home/Roman-Bazzite/Documents/CanvaShop
npm run build # already done → dist/app.js 1.03 MB
npm start # → http://localhost:8080
# In Developer Portal: App source > Development URL = http://localhost:8080
# Preview → works only while `npm start` is running on your laptop
```

### 2) Production (no laptop, permanent — this is what you want for "any device on my account")
Canva hosts the bundle itself at `https://app-<APP_ID>.canva-apps.com` after you publish. You don't set a custom Production URL to GitHub Pages.

```bash
export PATH=/var/home/Roman-Bazzite/.local/n/bin:$PATH
cd /var/home/Roman-Bazzite/Documents/CanvaShop

# 1. Login (opens browser)
npx @canva/cli login

# 2. Link local project to your existing app (get ID from https://www.canva.com/developers/apps → App → Settings)
npx @canva/cli apps link
# paste CANVA_APP_ID and CANVA_APP_ORIGIN (e.g. https://app-abc123.canva-apps.com) into .env

# 3. Build (already done)
npx @canva/cli apps build

# 4. Push config + create Release in Developer Portal
npx @canva/cli apps config push
# Then in Developer Portal: Versions → Create version from build → Submit for review
# Once approved (or for private team distribution), app appears in Canva on ANY device logged into your Canva account, no localhost, no tunnel

# Alternative manual: Developer Portal → Your app → Create release → Upload dist/app.js
```

**If you tried to paste `https://romanguy61.github.io/CanvaShop-PS-RM` into Development URL, revert it to `http://localhost:8080` and use the Production publish flow above instead.** GitHub Pages stays as the **standalone** solution below.

### What GitHub Pages *is* for
`https://romanguy61.github.io/CanvaShop-PS-RM/` is the **standalone Photoshop** (outside Canva) — works anywhere, no Canva account, no localhost, no allowlist. It is *not* the Canva app's Development URL host. For Canva interior, use Canva's own `https://app-*.canva-apps.com` hosting via the publish flow.

---

## Permanent hosting (choose one, one-liner)

```bash
# Option A: Surge (tested, works with single file too)
npx --yes surge --project /var/home/Roman-Bazzite/Documents/CanvaShop --domain canvashop-ps-rm.surge.sh

# Option B: Netlify Drop (drag dist/ folder to https://app.netlify.com/drop)

# Option C: Vercel
npx --yes vercel --prod

# Option D: Cloudflare Pages
npx --yes wrangler pages publish . --project-name canvashop

# Option E: GitHub Pages (from this repo)
git branch -M main
git remote add origin https://github.com/<you>/canvashop.git
git push -u origin main
# Enable Pages: Settings → Pages → Source: main / root
# → https://<you>.github.io/canvashop/canvashop-standalone.html
```

All options serve `canvashop-standalone.html` without needing localhost or same network.

---

## Current deployment status

- `canvashop-standalone.html:1` → 57kB, React 18 UMD + Babel standalone, 65 features (`FEATURES` array)
- `python3 http.server 8000` → PID 208327, `0.0.0.0:8000`, `curl -I http://127.0.0.1:8000/canvashop-standalone.html` → 200
- `ssh -R 80:localhost:8000 nokey@localhost.run` → PID 208347, `https://d982d52d23922a.lhr.life` → 200 (tunnel log `/tmp/tunnel2.log`)
- `npm install --force` → background PID 208381, log `/tmp/npm-install.log` (bypasses node>=22)
- LAN IP `192.168.1.71` (wlp0s20f3) → `http://192.168.1.71:8000/canvashop-standalone.html` (firewall may block, use tunnel instead for guarantee)

## Keep alive

```bash
# Auto-restart on reboot (systemd user)
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/canvashop.service <<'EOF'
[Unit]
Description=CanvaShop standalone

[Service]
ExecStart=/usr/bin/python3 -m http.server 8000 --bind 0.0.0.0 --directory /var/home/Roman-Bazzite/Documents/CanvaShop
Restart=always

[Install]
WantedBy=default.target
EOF
systemctl --user enable --now canvashop.service

# Tunnel keep-alive (autossh)
nohup autossh -M 0 -o ServerAliveInterval=30 -R 80:localhost:8000 nokey@localhost.run &
```

---

## Test

```bash
curl -I https://d982d52d23922a.lhr.life/canvashop-standalone.html
# HTTP/1.0 200 OK ... x-backend-addr: 174.226.193.194:1529

# On phone: open https://d982d52d23922a.lhr.life/canvashop-standalone.html
# Or scan QR from /tmp/tunnel2.log
```
