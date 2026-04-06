import Link from "next/link";
import { NoteCard } from "@/components/notes/NoteCard";
import { getRecentNotes } from "@/lib/notes";

export async function FieldNotesPreview() {
  const notes = await getRecentNotes(3);

  return (
    <section className="py-12">
      <div className="section-label mb-8">§ 03</div>

      <div className="mb-6">
        <h2 className="font-display text-[28px] font-bold text-ink">
          Field Notes
        </h2>
        <p className="font-mono text-[12px] text-muted mt-1">
          What I&apos;m building, thinking, and figuring out.
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="font-body text-[14px] text-muted">
          First note coming soon.
        </p>
      ) : (
        <div className="space-y-px border-t border-faint">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/notes"
          className="font-mono text-[13px] text-ink hover:text-muted transition-colors underline underline-offset-2"
        >
          All notes →
        </Link>
      </div>
    </section>
  );
}
