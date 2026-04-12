"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export function CaseStudies() {
  return (
    <section
      id="work"
      className="relative py-32 px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center_right,hsl(var(--primary)/0.02)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The work
          </h2>
          <p className="mt-3 text-sm text-muted-fg/80 max-w-md mx-auto">
            Two systems in production. One shipped in 31 days.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* HESA */}
          <motion.article
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0, ease }}
            className="group relative glass-card-hover rounded-2xl overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-primary/20 to-primary/0" />

            <div className="p-6 sm:p-8">
              {/* Meta */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/80 text-primary transition-colors group-hover:bg-primary/10 border border-border/50">
                    <LayersIcon />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg/60">
                    University of Greenwich
                  </span>
                </div>
                <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-mono text-[10px] text-primary/80">
                  Live
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                HESA Stat Returns Hub
              </h3>
              <div className="flex items-center gap-1.5 mb-6">
                <AwardIcon />
                <span className="font-mono text-[10px] text-accent/80">
                  CFO Staff Recognition Award 2025 — Efficiency and Innovation
                </span>
              </div>

              {/* Narrative */}
              <div className="space-y-4 text-[13px] leading-relaxed">
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-primary/50">Problem</p>
                  <p className="mt-1 text-muted-fg/80">
                    HESA compliance returns are high-stakes and deadline-driven. Staff were spending hours cross-referencing guidance to answer questions that should take minutes.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-primary/50">Constraint design</p>
                  <p className="mt-1 text-muted-fg/80">
                    The AI assistant layer has one hard constraint: it cannot guess on a compliance rule. That constraint shaped the entire architecture before a line of code was written.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-primary/50">Result</p>
                  <p className="mt-1 text-foreground/90">
                    In production at the University of Greenwich. Used daily during returns cycles.
                  </p>
                </div>
              </div>

              {/* Tech */}
              <div className="mt-6 pt-5 border-t border-border/30 flex flex-wrap gap-2">
                {["Django", "React", "Azure OpenAI", "RAG", "PostgreSQL"].map((t) => (
                  <span key={t} className="border-l-2 border-border/30 pl-2 font-mono text-[10px] text-muted-fg/40">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>

          {/* LifeOS */}
          <motion.article
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="group relative glass-card-hover rounded-2xl overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-accent/20 to-accent/0" />

            <div className="p-6 sm:p-8">
              {/* Meta */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/80 text-accent transition-colors group-hover:bg-accent/10 border border-border/50">
                    <CpuIcon />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg/60">
                    31 days · 165 commits
                  </span>
                </div>
                <a
                  href="https://github.com/feruza-k/lifeos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-[10px] text-primary/60 transition-colors hover:text-primary"
                >
                  GitHub <ArrowUpRightIcon />
                </a>
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                LifeOS
              </h3>

              {/* Narrative */}
              <div className="space-y-4 text-[13px] leading-relaxed">
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50">Problem</p>
                  <p className="mt-1 text-muted-fg/80">
                    Personal context is scattered across notes, messages, calendar, and memory. I wanted a system that could surface the right thing at the right time.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50">Architecture decision</p>
                  <p className="mt-1 text-muted-fg/80">
                    Retrieval scoring layer on top of vector search — combines semantic similarity, recency, and usage frequency. Shipped it fast. It worked. But it wasn&apos;t right.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50">What I learned</p>
                  <p className="mt-1 text-foreground/90">
                    Shipping retrieval scoring too fast was the honest mistake. Working and right are different things.
                  </p>
                </div>
              </div>

              {/* Footnote */}
              <div className="mt-5 border-l-2 border-border/30 pl-3 font-mono text-[10px] text-muted-fg/40 italic leading-relaxed">
                Deadline pressure reveals what you actually optimise for.
              </div>

              {/* Tech */}
              <div className="mt-5 pt-5 border-t border-border/30 flex flex-wrap gap-2">
                {["FastAPI", "React Native", "PostgreSQL", "OpenAI", "Railway"].map((t) => (
                  <span key={t} className="border-l-2 border-border/30 pl-2 font-mono text-[10px] text-muted-fg/40">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function LayersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function CpuIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
}
function AwardIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
}
function ArrowUpRightIcon() {
  return <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 15L15 5M15 5H8M15 5v7"/></svg>;
}
