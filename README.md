# feruza.dev

Personal portfolio built as a working AI system. Not a static brochure.

Live at [feruza.dev](https://feruza.dev)

## What it does

One page, six sections. The centrepiece is a Claude-powered agent that answers questions about my work in first person — with optional voice.

- **Agent** — Claude Sonnet 4.6 with tool calling. RAG on thesis content, live Google Calendar booking, London LSOA dataset queries
- **Voice mode** — ElevenLabs cloned voice with sentence-level TTS streaming. Web Speech API for input. Audio piped through a high-pass filter and dynamics compressor before playback
- **London map** — 4,835 LSOAs from my MSc thesis, AHP-weighted café opportunity scores. Click any area for an AHP factor breakdown and an embedded agent chat about that specific location
- **Thoughts log** — live-read from `public/thoughts.md`, no rebuild required to update
- **Case studies** — HESA Stat Returns Hub, LifeOS

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| AI | Claude Sonnet 4.6 via Vercel AI SDK v6 |
| Embeddings | OpenAI `text-embedding-3-small` |
| Voice | ElevenLabs |
| Map | react-leaflet + CartoDB dark tiles |
| Animations | Framer Motion |
| Styles | Tailwind CSS |
| Fonts | Syne · JetBrains Mono · Inter |
| Analytics | Vercel Analytics |

## Project structure

```
src/
  app/
    page.tsx              # Single page — six scene components composed here
    api/
      agent/route.ts      # Claude streaming endpoint — RAG, LSOA query tool, calendar booking
      voice/route.ts      # ElevenLabs TTS proxy with rate limiting
  components/
    scenes/               # Landing, Agent, Map, CaseStudies, Thoughts, About
    layout/               # Navigation (scroll-spy), Footer, ParticleField, ScrollReset
  lib/
    knowledge.ts          # Reads and caches content/knowledge.md
    rag.ts                # Cosine similarity retrieval over embeddings.json
    elevenlabs.ts         # TTS helper
    calendar.ts           # Google Calendar free/busy check and event creation
    csv.ts                # Shared CSV parser used by the API route and the map client

content/
  knowledge.md            # Agent knowledge base — edit this to change what the agent knows
  embeddings.json         # Pre-computed OpenAI embeddings (gitignored — regenerate locally)

public/
  thesis.pdf              # MSc dissertation (served as a static asset, linked from the map)
  thoughts.md             # Thoughts log — edit directly, live on next page load
  data/
    london_lsoa.geojson               # 4,835 LSOAs with AHP scores (~8MB GeoJSON)
    LSOA Statistics.csv               # Per-LSOA factor data, merged at query time
    lsoa_success_levels_with_geo.csv  # Success level classifications with coordinates

scripts/
  generate-embeddings.ts  # Regenerates embeddings.json from knowledge.md (and thesis-chunks.md if present)
  convert_to_geojson.py   # Converts LSOA CSV (EPSG:27700) → GeoJSON (EPSG:4326)
  get-google-token.ts     # One-time helper to get a Google OAuth refresh token
```

## Environment variables

Required:

```bash
ANTHROPIC_API_KEY=          # Claude API
OPENAI_API_KEY=             # Embeddings only — not used for generation
ELEVENLABS_API_KEY=         # TTS
ELEVENLABS_VOICE_ID=        # Voice clone ID from the ElevenLabs dashboard
NEXT_PUBLIC_SITE_URL=       # https://feruza.dev — used for OpenGraph metadata
```

Google Calendar booking (optional — agent falls back to email instructions if not set):

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=       # Generate once: npx tsx scripts/get-google-token.ts
GOOGLE_CALENDAR_ID=         # Optional — defaults to "primary"
OWNER_EMAIL=                # Booking notification recipient
```

## Running locally

```bash
npm install
npm run dev        # localhost:3000
npm run build      # production build — catches type errors and missing env vars
```

## Updating the knowledge base

Edit `content/knowledge.md`, then regenerate embeddings:

```bash
npm run generate-embeddings
```

The agent picks up changes on the next request — no rebuild needed.

For thesis-level RAG: create `content/thesis-chunks.md` with `##`-headed sections, then run the same command. The script skips the thesis file and warns if it is absent.

## Regenerating the map data

Requires `public/data/lsoa_success_levels_with_geo.csv` and geopandas:

```bash
pip install geopandas
python scripts/convert_to_geojson.py
```

## Deploy

Linked to Vercel. Push to `main` → auto-deploys to feruza.dev.
