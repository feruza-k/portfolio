import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteBySlug, getAllNotes } from "@/lib/notes";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const notes = await getAllNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const note = await getNoteBySlug(params.slug);
  if (!note) return {};
  return {
    title: `${note.title} — feruza.dev`,
    description: note.excerpt,
  };
}

export default async function NotePage({ params }: PageProps) {
  const note = await getNoteBySlug(params.slug);
  if (!note) notFound();

  const processed = await remark().use(remarkHtml).process(note.content);
  const html = processed.toString();

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-16">
      <Link
        href="/notes"
        className="font-mono text-[11px] text-muted hover:text-ink transition-colors"
      >
        ← Field Notes
      </Link>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-12 items-start">
        {/* Article */}
        <article>
          <h1 className="font-display text-[32px] font-bold text-ink leading-tight mb-6">
            {note.title}
          </h1>
          <div
            className="prose-note"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Metadata sidebar */}
        <aside className="font-mono text-[11px] space-y-4 lg:pt-3 border-t border-faint lg:border-t-0 pt-6 lg:pt-0">
          <div>
            <p className="text-muted uppercase tracking-wider mb-1">Written</p>
            <p className="text-ink">{note.formattedDate}</p>
          </div>
          {note.time && (
            <div>
              <p className="text-muted uppercase tracking-wider mb-1">Time</p>
              <p className="text-ink">{note.time}</p>
            </div>
          )}
          {note.working_on && (
            <div>
              <p className="text-muted uppercase tracking-wider mb-1">Working on</p>
              <p className="text-ink">{note.working_on}</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
