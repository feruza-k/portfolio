import fs from "fs";
import path from "path";
import matter from "gray-matter";

const NOTES_DIR = path.join(process.cwd(), "content/notes");

export interface NoteMetadata {
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  time?: string;
  working_on?: string;
  excerpt: string;
}

export interface Note extends NoteMetadata {
  content: string;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function extractExcerpt(content: string, maxLength = 120): string {
  const plain = content
    .replace(/^#+\s.*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();

  const firstParagraph = plain.split("\n\n")[0].replace(/\n/g, " ").trim();
  return firstParagraph.length > maxLength
    ? firstParagraph.slice(0, maxLength) + "…"
    : firstParagraph;
}

function getSlugs(): string[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith(".md") && f !== ".gitkeep")
    .map((f) => f.replace(/\.md$/, ""));
}

export async function getAllNotes(): Promise<NoteMetadata[]> {
  const slugs = getSlugs();
  const notes = slugs.map((slug) => {
    const filePath = path.join(NOTES_DIR, `${slug}.md`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title || slug,
      date: data.date || "",
      formattedDate: formatDate(data.date || ""),
      time: data.time,
      working_on: data.working_on,
      excerpt: extractExcerpt(content),
    };
  });

  return notes.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getRecentNotes(count: number): Promise<NoteMetadata[]> {
  const all = await getAllNotes();
  return all.slice(0, count);
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const filePath = path.join(NOTES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    formattedDate: formatDate(data.date || ""),
    time: data.time,
    working_on: data.working_on,
    excerpt: extractExcerpt(content),
    content,
  };
}
