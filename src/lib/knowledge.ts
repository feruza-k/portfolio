import fs from "fs";
import path from "path";

let cached: string | null = null;

export function getKnowledgeBase(): string {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "content/knowledge.md");
  cached = fs.readFileSync(filePath, "utf-8");
  return cached;
}
