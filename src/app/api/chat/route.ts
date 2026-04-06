import { streamText } from "ai";
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

// Extract plain text from a message regardless of whether it uses
// UIMessage (parts[]) or CoreMessage (content string/array) format.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(msg: any): string {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((p: { type: string }) => p.type === "text")
      .map((p: { text?: string }) => p.text ?? "")
      .join("");
  }
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: { type: string }) => p.type === "text")
      .map((p: { text?: string }) => p.text ?? "")
      .join("");
  }
  return "";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawMessages: any[] = body.messages ?? [];

  // Normalise to simple { role, content } CoreMessages
  const messages: { role: "user" | "assistant"; content: string }[] =
    rawMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: extractText(m) }))
      .filter((m) => m.content.trim().length > 0);

  const lastUserText =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const jdMode = lastUserText.startsWith("[JD]");
  const query = jdMode ? lastUserText.replace(/^\[JD\]\s*/, "") : lastUserText;

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
    : `You are Feruza Kachkinbayeva. Speak directly as Feruza — in first person, in her voice.
Be direct, honest, and human. No hedging. No "that's a great question." No corporate language.
Answer only based on the context below. If something isn't in there, say so plainly.
Sound like a person, not a chatbot.

RELEVANT CONTEXT:
${context}`;

  // Strip [JD] prefix from the actual message before sending to the model
  const cleanedMessages = messages.map((m) =>
    m.role === "user" && m.content.startsWith("[JD]")
      ? { ...m, content: m.content.replace(/^\[JD\]\s*/, "") }
      : m
  );

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: cleanedMessages,
  });

  return result.toUIMessageStreamResponse();
}
