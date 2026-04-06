import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { getKnowledgeBase } from "./knowledge";

interface Chunk {
  id: string;
  content: string;
  embedding: number[];
}

let cachedChunks: Chunk[] | null = null;

function loadChunks(): Chunk[] | null {
  if (cachedChunks) return cachedChunks;

  const embPath = path.join(process.cwd(), "content", "embeddings.json");
  if (!fs.existsSync(embPath)) return null;

  try {
    cachedChunks = JSON.parse(fs.readFileSync(embPath, "utf-8")) as Chunk[];
    return cachedChunks;
  } catch {
    return null;
  }
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function retrieveRelevantChunks(
  query: string,
  topN: number = 4
): Promise<string> {
  const chunks = loadChunks();

  if (!chunks) {
    console.warn("embeddings.json not found — falling back to full knowledge base");
    return getKnowledgeBase();
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const queryEmbedding = response.data[0].embedding;

  const scored = chunks.map((chunk) => ({
    content: chunk.content,
    score: cosine(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, topN)
    .map((c) => c.content)
    .join("\n\n---\n\n");
}
