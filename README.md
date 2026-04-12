# feruza.dev

Personal portfolio and AI engineering showcase. Not a brochure — a working system.

Live at [feruza.dev](https://feruza.dev)

## What it is

A single-scroll, scene-based site with live AI features built in:

1. **AI agent** — Claude Sonnet, RAG-powered, answers in first person. Tools: GitHub feed, JD matcher, London map query.
2. **Streaming TTS** — ElevenLabs cloned voice plays sentence-by-sentence as the agent responds. Not after — during.
3. **Speech input** — Web Speech API mic button. Speak your question, auto-submits on silence.
4. **London LSOA choropleth** — 4,835 LSOAs, AHP-weighted café opportunity scores from my MSc thesis. CartoDB dark tiles, filter pills, custom tooltips.
5. **Thesis PDF** — full 16,361-word dissertation served as a static asset. Methodology and findings also indexed into the agent knowledge base.

## Stack

- **Next.js 14** (App Router) — framework and API routes
- **Vercel AI SDK v6** — streaming text, `useChat`, `streamText`
- **Anthropic Claude Sonnet** — agent with tool use
- **ElevenLabs** — TTS voice synthesis
- **OpenAI** — embeddings for RAG (knowledge base retrieval)
- **react-leaflet** — interactive choropleth map
- **Framer Motion** — scene entrance animations
- **Tailwind CSS** — design tokens, dark theme
- **Syne + JetBrains Mono** — typography

## Structure

```
content/
  knowledge.md          # Agent knowledge base — edit to update what the agent knows
  embeddings.json       # Pre-computed OpenAI embeddings (regenerate after editing KB)

public/
  thesis.pdf            # MSc dissertation (served as static asset)
  thoughts.md           # Thoughts log (date + paragraph entries)
  data/
    london_lsoa.geojson # 4,835 London LSOAs with AHP scores (GeoJSON, ~8MB)

src/
  app/
    page.tsx            # Single page — imports all six scenes
    api/
      agent/            # Claude streaming endpoint with tool use
      voice/            # ElevenLabs TTS proxy
      github/           # GitHub events feed
  components/
    scenes/             # Landing, Agent, Map, CaseStudies, Thoughts, About
    layout/             # Navigation (scroll-spy), Footer, ScrollReset
  lib/
    knowledge.ts        # Reads content/knowledge.md
    elevenlabs.ts       # ElevenLabs TTS helper
    github.ts           # GitHub API helpers
    rag.ts              # Cosine similarity retrieval over embeddings.json

scripts/
  generate-embeddings.ts    # Re-generates embeddings.json from knowledge.md
  convert_to_geojson.py     # Converts LSOA CSV (EPSG:27700) → GeoJSON (EPSG:4326)
```

## Environment variables

```bash
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
GITHUB_TOKEN=
GITHUB_USERNAME=
NEXT_PUBLIC_GITHUB_USERNAME=
NEXT_PUBLIC_SITE_URL=
```

## Dev

```bash
npm run dev       # localhost:3000
npm run build     # production build check
```

## Updating the knowledge base

Edit `content/knowledge.md`, then regenerate embeddings:

```bash
OPENAI_API_KEY=your_key npx ts-node --project tsconfig.json scripts/generate-embeddings.ts
```

The agent picks up changes on next request — no rebuild needed.

## Regenerating the map data

Requires the source CSV (`public/data/lsoa_success_levels_with_geo.csv`) and Python with geopandas:

```bash
pip install geopandas
python scripts/convert_to_geojson.py
```

## Deploy

Linked to Vercel. Push to `main` → auto-deploy to feruza.dev.
