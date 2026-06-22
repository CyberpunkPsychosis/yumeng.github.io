# CLAUDE.md

Guidance for AI assistants (Claude Code) working in this repository.

## What this is

A collection of small, single-page mobile web apps hosted on **GitHub Pages**, sharing one **Cloudflare Worker** as an AI proxy. There is **no build step, no framework, no package manager, and no dependencies** — every page is plain HTML + CSS + vanilla ES modules served as static files. The UI, code comments, and commit messages are in **Chinese (zh-CN)**; keep new contributions consistent with that.

The three apps:

| App | Entry | What it does | AI? |
|---|---|---|---|
| **AI 摄影教练** (photography coach) | `index.html` + `app.js` + `style.css` | Live camera viewfinder with rule-of-thirds grid, level (水平仪), zoom, on-device person-detection composition guidance, real-time/baked-in color filters & 3D LUTs, and AI shooting advice / critique | Yes |
| **错题本** (mistakes notebook) | `cuoti/index.html` + `cuoti/app.js` | Photograph a wrongly-answered question → AI extracts subject/topic/answer/analysis as JSON → stored locally in IndexedDB → list + weak-point stats | Yes |
| **到了就看 · 景点地图** (nearby attractions map) | `travel.html` + `travel.js` + `travel.css` | Geolocates the user via the AMap (高德地图) JS API and lists nearby scenic spots | No (uses AMap directly) |

## Architecture

```
Browser (camera / file / geolocation)
   │  截帧/选图 → POST {image, mode}
   ▼
Cloudflare Worker  worker/hunyuan-proxy.js   ── holds HUNYUAN_API_KEY ──▶  TokenHub (Tencent)
   /suggest endpoint                                                       hy-vision-2.0-instruct
```

- **The API key never reaches the frontend or git.** It lives only as a Worker secret (`HUNYUAN_API_KEY`). Never hardcode keys, never commit `.dev.vars`/`.env` (already in `.gitignore`).
- The Worker exposes a single route: `POST .../suggest` with JSON `{ image: "data:image/...;base64", mode }`. It returns `{ text }`. `mode` selects a system prompt: `live`, `critique`, or `cuoti`.
- TokenHub is OpenAI-compatible. Endpoint and model are constants at the top of `worker/hunyuan-proxy.js` (`HUNYUAN_URL`, `MODEL`).
- The deployed Worker URL is **hardcoded as a default** in `app.js` (`DEFAULT_PROXY`) and `cuoti/app.js` (`PROXY`): `https://hunyuan-photo-proxy.yumenglalala.workers.dev`. If the Worker is renamed/redeployed, update **both** places. The photography app also lets users override it in Settings (stored in `localStorage` under `ai_photo_proxy_url`).

## Conventions

- **Vanilla JS only.** No imports except dynamic CDN imports at runtime (e.g. MediaPipe `tasks-vision` in `app.js`, AMap script injection in `travel.js`). Do not add npm/bundler tooling.
- Every file starts with a Chinese block comment explaining its purpose — preserve this when editing.
- Shared idioms across the JS files: `const $ = (id) => document.getElementById(id)` and an `esc`/`escapeHtml` helper for HTML escaping. **Always escape user/AI-derived strings before inserting into `innerHTML`.**
- Client state persistence: `localStorage` for settings/keys; **IndexedDB** (`cuotiben` DB, `items` store) for the mistakes notebook.
- Image handling: frames/photos are downscaled to a `maxW` and JPEG-encoded before upload to keep payloads small (`captureFrame`, `fileToDataURL`).
- The `cuoti` mode prompt requires **strict JSON output** (no markdown); `cuoti/app.js#parseResult` strips code fences and slices `{...}` defensively. Keep prompt and parser in sync if you change the schema.
- Image filters: parametric presets live in the `PRESETS` array in `app.js`; bundled `.cube` 3D LUTs live in `luts/` and are listed in `LUT_FILES`. Color math is done by hand on `ImageData` (`buildLUT`/`gradePreset`/`applyCubeLUT`). Users can also import their own `.cube`.

## Development & deployment

Static pages — just serve the repo root and open in a browser. Camera/geolocation require **HTTPS or localhost**.

```bash
# Static server for the pages
python3 -m http.server 8080      # open http://localhost:8080

# Worker (AI proxy) — local
cd worker
echo 'HUNYUAN_API_KEY = "<key>"' > .dev.vars   # gitignored
wrangler dev                                    # http://localhost:8787
# then in the photography app's Settings, set proxy to http://localhost:8787
```

Deploy the Worker:

```bash
cd worker
wrangler login
wrangler secret put HUNYUAN_API_KEY
wrangler deploy
```

The pages deploy automatically via **GitHub Pages from a branch** (the Actions workflow was intentionally removed — see commit `add6b0a`). Do not re-add a Pages Actions workflow unless asked.

## Files

```
index.html / app.js / style.css   photography coach (root app)
travel.html / travel.js / travel.css   attractions map
cuoti/                            mistakes notebook (index.html, app.js, style.css)
luts/*.cube                       bundled original film LUTs
worker/hunyuan-proxy.js           Cloudflare Worker AI proxy (the only backend)
worker/wrangler.toml              Worker config (name=hunyuan-photo-proxy)
README.md                         user-facing docs (Chinese)
```

## Working in this repo

- Develop on the branch you were assigned; create it locally if missing. Commit with clear, descriptive messages (Chinese to match history is fine). **Do not open a PR unless explicitly asked.**
- When touching AI behavior, the prompts in `worker/hunyuan-proxy.js#PROMPTS` are the source of truth for tone (deliberately plain language, no jargon for `live`/`critique`; strict JSON for `cuoti`).
- Keep everything dependency-free and runnable by opening a static file.
