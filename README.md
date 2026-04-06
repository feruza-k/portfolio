# feruza.dev

Personal portfolio and AI engineering showcase. Not a brochure — a working system.

## What it is

A research-document-style site with three live AI features built in:

1. **RAG chatbot** (`/ask`) — answers questions about me using a markdown knowledge base injected as Claude's context. Responds in first person, in my voice.
2. **Voice mode** — Web Speech API for input, ElevenLabs (cloned voice) for output. Works in Chrome/Edge.
3. **GitHub activity feed** — fetches commits from all public repos and translates them into plain English via Claude.

The map on the home page is a live canvas render of my MSc thesis data — café viability probability scores across London LSOAs.

## Stack

- **Next.js 14** (App Router) — framework + API routes
- **Tailwind CSS** — styling
- **Vercel AI SDK v6** — streaming chat, text generation
- **Anthropic Claude** — RAG chatbot, commit translation
- **ElevenLabs** — voice synthesis (cloned voice)
- **Framer Motion** — animations
- **gray-matter + remark** — markdown notes

## Structure

```
content/
  knowledge.md        # RAG knowledge base — edit to update chatbot context
  now.json            # "Now" page data — edit manually and push
  notes/*.md          # Field notes — add a file to publish a note

src/
  app/
    page.tsx          # Home (§00 Currently, §01 Work + map, §02 How I work, §03 Notes)
    ask/              # Full-screen chatbot page
    notes/            # Notes list + individual note pages
    now/              # Now page
    api/
      chat/           # Streaming RAG endpoint
      speak/          # ElevenLabs TTS proxy
      github/         # GitHub events → Claude plain English
  components/
    layout/           # Navbar, Footer
    sections/         # Home page sections
    map/              # Canvas heat map
    ask/              # Chatbot UI components
    notes/            # Note card
  lib/
    knowledge.ts      # Reads content/knowledge.md
    github.ts         # GitHub API helpers
    notes.ts          # Parses markdown notes
```

## Environment variables

```bash
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
GITHUB_TOKEN=
GITHUB_USERNAME=
NEXT_PUBLIC_SITE_URL=
```

## Dev

```bash
npm run dev     # localhost:3000
npm run build   # production build check
```

## Adding a note

Create `content/notes/your-slug.md`:

```markdown
---
title: Your note title
date: 2026-04-06
time: 20 minutes
working_on: Whatever you were building
---

Note content here. Plain markdown.
```

Push to GitHub → Vercel deploys → note appears at `/notes/your-slug`.

## Updating "now"

Edit `content/now.json` and push.

## Updating the knowledge base

Edit `content/knowledge.md`. Changes are picked up on the next request — no rebuild needed.

## Deploy

Linked to Vercel. Push to `main` → auto-deploy to feruza.dev.
