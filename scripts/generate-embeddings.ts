import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Chunk {
  id: string;
  content: string;
  embedding: number[];
}

function chunkBySection(markdown: string): { id: string; content: string }[] {
  const lines = markdown.split("\n");
  const chunks: { id: string; content: string }[] = [];
  let currentId = "intro";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentLines.length > 0) {
        const content = currentLines.join("\n").trim();
        if (content) chunks.push({ id: currentId, content });
      }
      currentId = line.replace(/^##\s+/, "").toLowerCase().replace(/\s+/g, "-");
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
  const outPath = path.join(process.cwd(), "content", "embeddings.json");

  if (!fs.existsSync(kbPath)) {
    console.error("content/knowledge.md not found");
    process.exit(1);
  }

  const markdown = fs.readFileSync(kbPath, "utf-8");
  const rawChunks = chunkBySection(markdown);

  console.log(`Found ${rawChunks.length} sections. Generating embeddings...`);

  const chunks: Chunk[] = [];

  for (const chunk of rawChunks) {
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
