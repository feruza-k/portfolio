// scripts/generate-embeddings.ts
//
// Reads two files and writes one embeddings.json:
//   content/knowledge.md       — profile KB, chunked by ## headers
//   content/thesis-chunks.md   — thesis content, chunked by ## headers
//
// Each chunk gets a unique id prefixed with its source:
//   kb:identity, kb:current-role, thesis:task1-ahp, etc.
//
// Run: npx ts-node scripts/generate-embeddings.ts
// Requires: OPENAI_API_KEY in environment

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Chunk {
  id: string;
  content: string;
  embedding: number[];
}

function chunkBySection(
  markdown: string,
  prefix: string
): { id: string; content: string }[] {
  const lines = markdown.split("\n");
  const chunks: { id: string; content: string }[] = [];
  let currentId = `${prefix}:intro`;
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentLines.length > 0) {
        const content = currentLines.join("\n").trim();
        if (content) chunks.push({ id: currentId, content });
      }
      const slug = line
        .replace(/^##\s+/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      currentId = `${prefix}:${slug}`;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Last chunk
  if (currentLines.length > 0) {
    const content = currentLines.join("\n").trim();
    if (content) chunks.push({ id: currentId, content });
  }

  return chunks;
}

async function main() {
  const kbPath = path.join(process.cwd(), "content", "knowledge.md");
  const thesisPath = path.join(process.cwd(), "content", "thesis-chunks.md");
  const outPath = path.join(process.cwd(), "content", "embeddings.json");

  if (!fs.existsSync(kbPath)) {
    console.error("content/knowledge.md not found");
    process.exit(1);
  }

  if (!fs.existsSync(thesisPath)) {
    console.error("content/thesis-chunks.md not found");
    process.exit(1);
  }

  const kbMarkdown = fs.readFileSync(kbPath, "utf-8");
  const thesisMarkdown = fs.readFileSync(thesisPath, "utf-8");

  const kbRaw = chunkBySection(kbMarkdown, "kb");
  const thesisRaw = chunkBySection(thesisMarkdown, "thesis");
  const allRaw = [...kbRaw, ...thesisRaw];

  console.log(
    `Found ${kbRaw.length} KB sections + ${thesisRaw.length} thesis sections = ${allRaw.length} total chunks`
  );
  console.log("Generating embeddings...\n");

  const chunks: Chunk[] = [];

  for (const chunk of allRaw) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk.content,
    });

    chunks.push({
      id: chunk.id,
      content: chunk.content,
      embedding: response.data[0].embedding,
    });

    console.log(`  ✓ ${chunk.id}`);
  }

  fs.writeFileSync(outPath, JSON.stringify(chunks, null, 2));
  console.log(`\nSaved ${chunks.length} chunks to content/embeddings.json`);
}

main().catch(console.error);
