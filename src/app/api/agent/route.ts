import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { fetchGitHubActivity } from "@/lib/github";
import { getKnowledgeBase } from "@/lib/knowledge";

// ── Rate limiting ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── Map data (loaded once, cached) ─────────────────────────────────────────────
let cachedMapFeatures: Array<Record<string, unknown>> | null = null;

function getMapFeatures(): Array<Record<string, unknown>> {
  if (cachedMapFeatures) return cachedMapFeatures;
  const geoPath = path.join(process.cwd(), "public", "data", "london_lsoa.geojson");
  if (!fs.existsSync(geoPath)) return [];
  const raw = JSON.parse(fs.readFileSync(geoPath, "utf-8"));
  cachedMapFeatures = (raw.features ?? []).map(
    (f: { properties: Record<string, unknown> }) => f.properties
  );
  return cachedMapFeatures!;
}

// ── System prompt ──────────────────────────────────────────────────────────────
function buildSystemPrompt(context: string): string {
  return `You are Feruza's portfolio agent. You speak as Feruza in first person, grounded in the knowledge base below.

VOICE: Direct, specific, no filler. Never say "great question", "certainly", or "I'd be happy to". Answer in 2–5 sentences unless depth is clearly needed. If you don't know something, say so.

TECHNICAL DEPTH: Go into real detail on technical questions. The LifeOS retrieval bug, the AHP consistency ratio, the HESA constraint design — explain them properly when asked.

HONESTY: Say what I don't know yet, what I'm still building, what I'd do differently. That's more interesting than a clean CV.

JD MATCHING: If someone asks to match a JD or the message starts with [JD], structure your response as: (1) 2–3 strong fits with specific evidence, (2) 1–2 honest gaps, (3) one concrete reason worth a conversation. Sound like a person, not a cover letter.

NEVER: Summarise the knowledge base unprompted. List skills. Say "Feruza has experience in..." — say "I built..." or "I worked on...". Break character unless directly asked if you're an AI.

KNOWLEDGE BASE:
${context}`;
}

// ── Route ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const uiMessages = body.messages ?? [];

  // Inject full knowledge base — it's ~15K tokens, well within context.
  // Avoids the OpenAI embeddings round-trip that was adding ~400ms before TTFT.
  const context = getKnowledgeBase();

  // Convert UIMessages → model messages (AI SDK v6)
  const messages = await convertToModelMessages(uiMessages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: buildSystemPrompt(context),
    messages,
    tools: {
      github_feed: {
        description:
          "Fetch Feruza's recent public GitHub activity and return a plain English summary of the last 5 events.",
        inputSchema: z.object({}),
        execute: async () => {
          const activity = await fetchGitHubActivity();
          if (activity.commits.length === 0) {
            return "No recent public GitHub activity found.";
          }
          const lines = activity.commits
            .slice(0, 5)
            .map((c) => `• ${c.timeAgo} — ${c.plainEnglish} (${c.repo})`);
          return lines.join("\n");
        },
      },

      jd_matcher: {
        description:
          "Analyse a job description against Feruza's background. Use when the user pastes or describes a job description.",
        inputSchema: z.object({
          jobDescription: z.string().describe("The full job description text"),
        }),
        execute: async ({ jobDescription }: { jobDescription: string }) => {
          return `Job description to match:\n${jobDescription}\n\nUse the knowledge base in your system prompt to provide: (1) 2-3 strong fits with specific evidence, (2) 1-2 honest gaps, (3) one concrete reason worth a conversation.`;
        },
      },

      map_query: {
        description:
          "Answer a natural language question about the London café site intelligence data — LSOA names, success levels, AHP scores.",
        inputSchema: z.object({
          question: z
            .string()
            .describe("Natural language question about the London LSOA data"),
        }),
        execute: async ({ question }: { question: string }) => {
          const features = getMapFeatures();
          if (features.length === 0) {
            return "Map data not available. The GeoJSON file has not been generated yet.";
          }

          const q = question.toLowerCase();

          // Count by success level
          const counts: Record<string, number> = {};
          for (const f of features) {
            const level = String(f["Success Level"] ?? "Unknown");
            counts[level] = (counts[level] ?? 0) + 1;
          }

          // Top N by AHP score
          if (q.includes("top") || q.includes("best") || q.includes("highest")) {
            const n = parseInt(q.match(/\d+/)?.[0] ?? "5");
            const sorted = [...features].sort(
              (a, b) =>
                Number(b["AHP Weighted Score"] ?? 0) -
                Number(a["AHP Weighted Score"] ?? 0)
            );
            const top = sorted.slice(0, Math.min(n, 20));
            return (
              `Top ${top.length} LSOAs by AHP score:\n` +
              top
                .map(
                  (f) =>
                    `• ${f["LSOA Name"]} (${f["LSOA11CD"]}) — ${f["Success Level"]} — score: ${Math.round(Number(f["AHP Weighted Score"])).toLocaleString()}`
                )
                .join("\n")
            );
          }

          // Filter by success level
          for (const level of Object.keys(counts)) {
            if (q.includes(level.toLowerCase())) {
              const matching = features.filter(
                (f) => f["Success Level"] === level
              );
              const sample = matching.slice(0, 5);
              return (
                `${level}: ${matching.length} LSOAs. Examples:\n` +
                sample
                  .map(
                    (f) =>
                      `• ${f["LSOA Name"]} — AHP score: ${Math.round(Number(f["AHP Weighted Score"])).toLocaleString()}`
                  )
                  .join("\n")
              );
            }
          }

          // Default: summary
          const total = features.length;
          const summary = Object.entries(counts)
            .map(([level, count]) => `${level}: ${count}`)
            .join(", ");
          return `London café site intelligence covers ${total.toLocaleString()} LSOAs. Distribution: ${summary}. The AHP score ranges from ${Math.round(Math.min(...features.map((f) => Number(f["AHP Weighted Score"] ?? 0)))).toLocaleString()} to ${Math.round(Math.max(...features.map((f) => Number(f["AHP Weighted Score"] ?? 0)))).toLocaleString()}.`;
        },
      },
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}

export const dynamic = "force-dynamic";
