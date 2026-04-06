import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now — feruza.dev",
};

interface NowData {
  reading: string;
  building: string;
  studying: string;
  applying: string;
  location: string;
  updated: string;
}

function getNowData(): NowData {
  const raw = readFileSync(join(process.cwd(), "content/now.json"), "utf-8");
  return JSON.parse(raw);
}

export default function NowPage() {
  const now = getNowData();

  const rows: [string, string][] = [
    ["Reading", now.reading],
    ["Building", now.building],
    ["Studying", now.studying],
    ["Applying", now.applying],
    ["Location", now.location],
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/"
          className="font-mono text-[11px] text-muted hover:text-ink transition-colors block"
        >
          feruza.dev/now
        </Link>

        <div className="border-t border-faint pt-5 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <span className="font-mono text-[12px] text-muted w-20 shrink-0 pt-px">
                {label}
              </span>
              <span className="font-mono text-[12px] text-ink">{value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-faint pt-4">
          <span className="font-mono text-[11px] text-muted">
            Updated &nbsp; {now.updated}
          </span>
        </div>

        <Link
          href="/"
          className="font-mono text-[11px] text-muted hover:text-ink transition-colors block"
        >
          ← back
        </Link>
      </div>
    </main>
  );
}
