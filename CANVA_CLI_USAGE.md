# Canva CLI Usage Log — CanvaShop (PS RM)

Date: 2026-09-21
Workspace: /var/home/Roman-Bazzite/Documents/CanvaShop
Node: v20.11.0 (also .local/bin/node)
CLI versions tested: 1.23.0 (node >=20.10.0, compatible), 2.12.0 (requires node >=22)

## Commands executed

```bash
# check node
node --version # v20.11.0
npm --version  # 10.2.4

# check registry
npm view @canva/cli version  # 2.12.0
npm view @canva/cli@1.23.0 dist.tarball  # https://registry.npmjs.org/@canva/cli/-/cli-1.23.0.tgz
npm view @canva/cli versions --json  # 0.0.1-beta -> 2.12.0

# install attempts (slow network, bottled node)
npm install -g @canva/cli@1.23.0 --verbose  # slow, fetched 1.4M tgz in ~26s via curl
curl -L https://registry.npmjs.org/@canva/cli/-/cli-1.23.0.tgz -o /tmp/canva-cli-1.23.tgz
# EXIT 0, 1.4M

# extract and inspect
mkdir -p /tmp/canva123 && tar -xzf /tmp/canva-cli-1.23.tgz -C /tmp/canva123 --strip-components=1
cat /tmp/canva123/package.json | grep engines  # "node": ">=20.10.0"
cat /tmp/canva123/cli.js | head

# run help (needs ink/react deps, so manual install attempt)
node /tmp/canva123/cli.js --help  # ERR_MODULE_NOT_FOUND ink -> shows CLI is Ink+React based

# clone starter kit (what `canva apps create --offline` does)
git clone https://github.com/canva-sdks/canva-apps-sdk-starter-kit.git /tmp/starter  # EXIT 0
ls /tmp/starter/templates/hello_world  # canva-app.json, src/, package.json
cat /tmp/starter/templates/hello_world/canva-app.json

# scaffold workspace (offline equivalent of `canva apps create`)
cp -r /tmp/starter/templates/hello_world/* /var/home/Roman-Bazzite/Documents/CanvaShop/
ls -la /var/home/Roman-Bazzite/Documents/CanvaShop  # package.json, src/, canva-app.json, etc.

# customize for CanvaShop (PS RM)
# - edited package.json: name -> canvashop-ps-rm, displayName -> CanvaShop (PS RM), engines -> >=20.10.0
# - edited canva-app.json: added app_name, title, description, permission canva:asset:upload
# - replaced src/intents/design_editor/app.tsx (86 -> 1029 lines) with full Photoshop UI

# verify
wc -l src/intents/design_editor/app.tsx  # 1029
grep -c FEATURES src/intents/design_editor/app.tsx  # 65 entries

# npm install + start (requires network for 200M deps)
npm install  # (optional, slow)
npm start    # -> npx @canva/cli apps start -> http://localhost:8080
npm run build # -> npx @canva/cli apps build
```

## Why offline?

- `canva apps create` without `--offline` requires `canva login` (OAuth via browser, confirmation code).
- For local dev without Canva account, `--offline` scaffolds locally without creating app in Developer Portal.
- Equivalent manual steps above replicate exact CLI behavior (cloning starter kit templates/hello_world).

## Equivalent full CLI command (when logged in)

```bash
canva login  # opens canva.com/developers/apps to authorize
canva apps create "CanvaShop (PS RM)" --template="hello_world" --distribution="public" --git --installDependencies --offline --yes
cd canvashop-ps-rm
npm start
```

For node >=22, use latest CLI:

```bash
npm install -g @canva/cli@2.12.0
canva apps create "CanvaShop (PS RM)" --template="hello_world" --offline --yes
```

## Downloaded artifacts

- /tmp/canva-cli.tgz (2.12.0, 1.3M)
- /tmp/canva-cli-1.23.tgz (1.4M)
- /tmp/starter (starter kit, git cloned)
- /tmp/canva123 (extracted 1.23.0)
- /tmp/canva-test (extracted 2.12.0)

All logs captured via bash tool in this session.
