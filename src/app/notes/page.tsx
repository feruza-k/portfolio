import Link from "next/link";
import { getAllNotes } from "@/lib/notes";
import { NoteCard } from "@/components/notes/NoteCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Notes — feruza.dev",
  description: "What I'm building, thinking, and figuring out.",
};

export default async function NotesPage() {
  const notes = await getAllNotes();

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-16">
      <div className="mb-10">
        <Link
          href="/"
          className="font-mono text-[11px] text-muted hover:text-ink transition-colors"
        >
          ← feruza.dev
        </Link>
        <h1 className="font-display text-[36px] font-bold text-ink mt-4">
          Field Notes
        </h1>
        <p className="font-mono text-[12px] text-muted mt-1">
          What I&apos;m building, thinking, and figuring out.
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="font-body text-[14px] text-muted">First note coming soon.</p>
      ) : (
        <div className="border-t border-faint">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </div>
      )}
    </main>
  );
}
