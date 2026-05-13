# VozClara

A LEON MARÉ product. Multilingual knowledge cloud for YouTube videos:
paste a link, get a structured Knowledge Pack — summary, key ideas,
chapters, vocabulary, quiz, quotes — in your language. Save it to your
private library. Mobile-first, installable on iOS and Android.

Deployed at https://vozclara.pages.dev.

> *Klassisch in der Haltung, modern im Werkzeug.*

---

## Architektur — alles gratis, keine Kreditkarte

```
[ iPhone Safari / Home-Screen-PWA ]
        │
        │  1. Paste a YouTube URL
        │  2. Frontend → Cloudflare Worker
        ▼
[ Cloudflare Worker · /api/transcript ]
        │  POST youtubei/v1/player with ANDROID client context
        │  → caption tracks → fetch srv3 XML → parse <p> blocks
        ▼
[ Frontend ]
        │  Translate each segment via MyMemory (DE→ES, free, no key)
        │  Cache transcript + translation in IndexedDB
        ▼
[ Render ]
        │  YouTube IFrame embed with playsinline=1 (iOS-safe)
        │  Spanish subtitle pane synced to currentTime (4 Hz poll)
        │  Optional TTS via Web Speech API (lang=es-ES, voice unlocked on tap)
        │  DE → ES learning panel below the player
```

| Component       | Technology                                       | Cost  |
| --------------- | ------------------------------------------------ | ----- |
| Frontend host   | Cloudflare Pages (custom domain, no CC)          | Free  |
| Backend         | One Cloudflare Worker, 100 k req/day free tier   | Free  |
| Translation     | MyMemory API (50 k chars/day with email)         | Free  |
| Voice           | Web Speech API (browser-native)                  | Free  |
| Cache           | IndexedDB (client only)                          | Free  |
| Fonts           | Google Fonts: Cormorant Garamond + Inter         | Free  |

---

## Local development

Prerequisites: Node 20+, Git.

```sh
# One-time install
npm install
npm --prefix worker install

# Two terminals — Vite dev server + Wrangler dev server
# Terminal A:
npm run dev               # Vite on :5173
# Terminal B:
npm run worker:dev        # Wrangler on :8787

# Vite proxies /api/* to :8787, so http://localhost:5173 works end-to-end.
```

`.env.local` (optional, recommended for normal use):

```env
VITE_TRANSLATION_EMAIL=tu-correo@leonmare.de
```

This raises the MyMemory daily quota from 5 000 to 50 000 chars.

---

## Deployment

### Cloudflare Pages — frontend

```sh
npm run build
# Push the repo to GitHub, then in Cloudflare Pages:
#   1. Connect the GitHub repo
#   2. Build command: npm run build
#   3. Build output: dist
#   4. Custom domain: vozclara.leonmare.de
```

Cloudflare will issue a free certificate. Google Workspace MX records on
`leonmare.de` remain untouched.

### Cloudflare Workers — transcript proxy

```sh
cd worker
npx wrangler login
npx wrangler deploy
```

This deploys to `vozclara-transcript.<your-subdomain>.workers.dev`. To put it
on your own domain, add a route in `wrangler.toml`:

```toml
[[routes]]
pattern = "vozclara.leonmare.de/api/*"
custom_domain = false
zone_name = "leonmare.de"
```

Then in production set `VITE_API_BASE=""` (same-origin) so the frontend
hits `vozclara.leonmare.de/api/transcript` directly.

---

## Why this stack

- **No DeepL.** DeepL Free requires a credit card to register. MyMemory does not.
- **No Vercel.** Vercel free tier increasingly nudges credit-card verification.
  Cloudflare's free tier does not.
- **No Whisper service in v1.** ~90% of YouTube videos have auto-captions via
  the Innertube/Android-client path. Videos without them get a polite message
  in Spanish instead of a slow Whisper fallback.
- **Client-side translation.** The Worker stays small and within free-tier
  request budgets. Translation traffic goes browser → MyMemory directly.
- **iOS-first.** TTS first-utterance unlock is a real button. `playsinline=1`
  on the YouTube embed prevents fullscreen takeover. Web Share Target is not
  wired (iOS Safari doesn't support it) — manual paste is the path.

---

## Brand

This tool follows LEON MARÉ Brand Foundation v5, Kapitel 16 verbatim:

- **Colors**: Navy `#0A1A3A`, Gold `#C9A24B`, Creme `#F7F3EC`, Graphit `#1A1A1A`.
- **Typography**: Cormorant Garamond (display) + Inter (body).
- **Tonalität**: classical, FAZ-register Spanish; no exclamation marks, no
  superlatives, no emoji.

---

*VozClara · interne LEON MARÉ Anwendung · Frankfurt · Donostia · Porto*
