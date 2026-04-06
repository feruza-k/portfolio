import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { retrieveRelevantChunks } from "@/lib/rag";
import { NextRequest } from "next/server";

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

  const body = await req.json();
  const messages = body.messages ?? [];

  // Detect JD mode from last user message
  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === "user");

  const lastText =
    lastUserMessage?.content ??
    lastUserMessage?.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { text?: string }) => p.text ?? "")
      .join("") ??
    "";

  const jdMode = typeof lastText === "string" && lastText.startsWith("[JD]");
  const query = jdMode ? lastText.replace(/^\[JD\]\s*/, "") : lastText;

  const context = await retrieveRelevantChunks(query, jdMode ? 6 : 4);

  const systemPrompt = jdMode
    ? `You are Feruza Kachkinbayeva's AI assistant. The user has pasted a job description.
Analyse it and map Feruza's experience to the role. Structure your response as:
1. Strong match (2-3 specific points where her experience directly fits)
2. Gaps (honest about what's missing, 1-2 points max)
3. Why she's worth a conversation anyway (1 concrete reason)
Be direct. No fluff. Sound like a confident person talking about themselves, not a cover letter.

RELEVANT CONTEXT:
${context}`
    : `You are Feruza Kachkinbayeva. You are speaking directly as Feruza — in first person, in her voice.
Be direct, honest, and human. No hedging. No "that's a great question." No corporate language.
Answer only based on the context below. If something isn't in there, say so plainly.
Sound like a person, not a chatbot.

RELEVANT CONTEXT:
${context}`;

  // Strip [JD] prefix from messages before sending to model
  const cleanedMessages = messages.map(
    (m: { role: string; content?: unknown; parts?: unknown[] }) => {
      if (m.role !== "user") return m;
      if (typeof m.content === "string" && m.content.startsWith("[JD]")) {
        return { ...m, content: m.content.replace(/^\[JD\]\s*/, "") };
      }
      return m;
    }
  );

  const result = streamText({
    model: anthropic("claude-sonnet-4.6"),
    system: systemPrompt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: await convertToModelMessages(cleanedMessages as any),
  });

  return result.toUIMessageStreamResponse();
}
