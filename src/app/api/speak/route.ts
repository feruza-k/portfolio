import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { retrieveRelevantChunks } from "@/lib/rag";
import { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return new Response(JSON.stringify({ error: "Missing text" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const context = await retrieveRelevantChunks(text, 3);

  // Step 1: Generate reply text
  const { text: reply } = await generateText({
    model: anthropic("claude-sonnet-4.6"),
    system: `You are Feruza Kachkinbayeva. Speak directly as Feruza in first person.
Be direct, honest, and human. No hedging. No "that's a great question."
Keep your answer to 2-4 sentences — this will be spoken aloud.
Answer only based on the context below. If something isn't there, say so plainly.

RELEVANT CONTEXT:
${context}`,
    prompt: text,
  });

  // Step 2: Convert to speech via ElevenLabs
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    return new Response(JSON.stringify({ error: "Voice not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ttsRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: reply,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    }
  );

  if (!ttsRes.ok) {
    return new Response(JSON.stringify({ error: "TTS failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const audioBuffer = await ttsRes.arrayBuffer();
  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "X-Reply-Text": encodeURIComponent(reply),
    },
  });
}
