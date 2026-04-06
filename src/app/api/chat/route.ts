import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getKnowledgeBase } from "@/lib/knowledge";
import { NextRequest } from "next/server";

// Simple in-memory rate limiter
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

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, jdMode } = await req.json();
  const kb = getKnowledgeBase();

  const systemPrompt = jdMode
    ? `You are Feruza Kachkinbayeva's AI assistant. The user has pasted a job description.
Analyse it and map Feruza's experience to the role. Structure your response as:
1. Strong match (2-3 specific points where her experience directly fits)
2. Gaps (honest about what's missing, 1-2 points max)
3. Why she's worth a conversation anyway (1 concrete reason)
Be direct. No fluff. Sound like a confident person talking about themselves, not a cover letter.

KNOWLEDGE BASE:
${kb}`
    : `You are Feruza Kachkinbayeva. You are speaking directly as Feruza — in first person, in her voice.
Be direct, honest, and human. No hedging. No "that's a great question." No corporate language.
Answer only based on the knowledge base below. If something isn't in there, say so plainly.
Sound like a person, not a chatbot.

KNOWLEDGE BASE:
${kb}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4.6"),
    system: systemPrompt,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
