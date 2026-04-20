"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

interface ThoughtEntry {
  date: string;
  body: string;
}

function parseThoughts(raw: string): ThoughtEntry[] {
  return raw
    .split(/\n{2,}/)
    .reduce<ThoughtEntry[]>((acc, block) => {
      const lines = block.trim().split("\n");
      if (lines.length < 2) return acc;
      const date = lines[0].trim();
      const body = lines.slice(1).join("\n").trim();
      if (date && body) acc.push({ date, body });
      return acc;
    }, []);
}

export function Thoughts() {
  const [entries, setEntries] = useState<ThoughtEntry[]>([]);

  useEffect(() => {
    fetch("/thoughts.md")
      .then((r) => r.text())
      .then((text) => setEntries(parseThoughts(text)))
      .catch(() => {});
  }, []);

  const latestDate = entries[0]?.date ?? "";

  return (
    <section
      id="thinking"
      className="relative py-32 px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.03)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
              <BrainIcon />
            </div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              What I&apos;m working through
            </h2>
          </div>
          <p className="text-sm text-muted-fg/80 max-w-xl leading-relaxed">
            A commit log for thinking. Not polished — that&apos;s the point.
          </p>
        </motion.div>

        {/* Log container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="rounded-xl glass-card glow-accent overflow-hidden"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-border/40 bg-card/20 px-5 py-3">
            <div className="flex items-center gap-2">
              <CommitIcon />
              <span className="font-mono text-[11px] text-muted-fg">thinking.log</span>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">
                {entries.length} entries
              </span>
            </div>
            {latestDate && (
              <div className="flex items-center gap-1.5">
                <ClockIcon />
                <span className="font-mono text-[10px] text-muted-fg/40">
                  updated {latestDate}
                </span>
              </div>
            )}
          </div>

          {/* Entries — fixed height, hidden scrollbar, bottom fade hints at overflow */}
          <div className="relative">
            <div className="h-[520px] overflow-y-auto no-scrollbar divide-y divide-border/20">
            {entries.length === 0 ? (
              <div className="px-5 py-8">
                <span className="font-mono text-[12px] text-muted-fg animate-pulse">loading_</span>
              </div>
            ) : (
              entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="group px-5 py-5 transition-all duration-300 hover:bg-accent/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[11px] text-accent/50">{entry.date}</span>
                    <span className="h-3 w-px bg-border/30" />
                    <span className="rounded-md bg-card/60 px-2 py-0.5 font-mono text-[9px] text-muted-fg/50 uppercase tracking-wider transition-colors group-hover:text-muted-fg/80">
                      thinking
                    </span>
                  </div>
                  <p className="font-mono text-xs leading-[1.8] text-muted-fg/70 group-hover:text-foreground/80 transition-colors duration-300">
                    {entry.body}
                  </p>
                </motion.div>
              ))
            )}
            </div>
            {/* Bottom fade — hints that more entries exist below */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BrainIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" aria-hidden="true"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
}
function CommitIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent/60" aria-hidden="true"><circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>;
}
function ClockIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-fg/40" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
