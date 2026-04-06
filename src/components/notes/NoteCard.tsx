import Link from "next/link";
import type { NoteMetadata } from "@/lib/notes";

interface NoteCardProps {
  note: NoteMetadata;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.slug}`}
      className="group flex items-baseline gap-6 py-4 border-b border-faint hover:bg-subtle transition-colors px-1"
    >
      <span className="font-mono text-[11px] text-muted shrink-0 w-24">
        {note.formattedDate}
      </span>
      <div className="min-w-0">
        <p className="font-body text-[15px] text-ink group-hover:text-secondary transition-colors truncate">
          {note.title}
        </p>
        {note.excerpt && (
          <p className="font-body text-[13px] text-muted mt-0.5 line-clamp-2">
            {note.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
