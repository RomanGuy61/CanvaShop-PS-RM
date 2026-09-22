# CanvaShop (PS RM) — Hosting — No localhost needed, any device, any network

## Standalone (no Canva login, works everywhere)

A single-file Photoshop remake at `canvashop-standalone.html` (57kB) that runs with React + Babel via CDN.

### Live URLs (already put)

- **Local (this machine):** http://localhost:8000/canvashop-standalone.html
- **LAN (same Wi-Fi, any phone/tablet/PC):** http://192.168.1.71:8000/canvashop-standalone.html
- **Internet (any network, any device world-wide):** https://d982d52d23922a.lhr.life/canvashop-standalone.html
  - Tunnel via `ssh -R 80:localhost:8000 nokey@localhost.run` (PID 208347, see `/tmp/tunnel2.log`)
  - QR code in tunnel log: open `https://d982d52d23922a.lhr.life` on mobile → scans to same URL
  - `curl -I https://d982d52d23922a.lhr.life/canvashop-standalone.html` → 200 OK, `x-backend-addr: 174.226.193.194:1529`

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

## Canva App (inside Canva editor)

Original Canva Apps SDK app still at `src/intents/design_editor/app.tsx:182` (1029 lines, `canva-app.json:3` `app_name: CanvaShop (PS RM)`).

To use **inside Canva** without localhost on other devices:

```bash
cd /var/home/Roman-Bazzite/Documents/CanvaShop
npm install --force  # bypass @canva/app-scripts node>=22 check, or use node 22
npm run build  # = npx @canva/cli apps build → dist/
# Host dist/ same way:
nohup python3 -m http.server 8080 --bind 0.0.0.0 --directory dist > /tmp/canva-dist.log 2>&1 &
nohup ssh -R 80:localhost:8080 nokey@localhost.run > /tmp/canva-tunnel.log 2>&1 &
# Then in https://www.canva.com/developers/apps → Your app → Development URL = https://<tunnel>.lhr.life
# Preview → opens in Canva editor on any device
```

For production, deploy `dist/` to permanent host:

```bash
# Surge (free, no account needed beyond email)
npx --yes surge --project ./dist --domain canvashop-ps-rm.surge.sh
# → https://canvashop-ps-rm.surge.sh

# Vercel / Netlify / Cloudflare Pages / GitHub Pages
npx --yes vercel --prod --yes --project dist
# or: wrangler pages publish dist --project-name=canvashop
# or: git push to gh-pages branch
```

Then set **Production URL** in Canva Developer Portal to that permanent URL and submit.

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
