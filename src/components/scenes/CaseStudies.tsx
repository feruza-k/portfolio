"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export function CaseStudies() {
  return (
    <section className="relative pb-32 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center_right,hsl(var(--primary)/0.02)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl grid gap-8 lg:grid-cols-2">

        {/* HESA */}
        <motion.article
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="group relative glass-card-hover rounded-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-primary/30 to-primary/0" />

          <div className="p-6 sm:p-8 flex flex-col h-full">
            {/* Meta row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/80 text-primary border border-border/50">
                  <LayersIcon />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg/60">
                  University of Greenwich
                </span>
              </div>
              <span className="font-mono text-[10px] text-terminal-green/80">Feature-complete</span>
            </div>

            {/* Title + award */}
            <h3 className="font-display text-xl font-semibold text-foreground mb-1">
              HESA Stat Returns Hub
            </h3>
            <div className="flex items-center gap-1.5 mb-7">
              <AwardIcon />
              <span className="font-mono text-[10px] text-accent/80">
                CFO Staff Recognition Award 2025 · Efficiency and Innovation
              </span>
            </div>

            {/* Content */}
            <div className="space-y-5 text-[13px] leading-relaxed flex-1">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-primary/50 mb-1">Problem</p>
                <p className="text-muted-fg/80 text-justify transition-colors duration-300 group-hover:text-foreground/70">
                  HESA statutory returns are a regulated workflow with hard deadlines. Missed sign-off gets reported to the Office for Students. The existing process ran on Banner extracts, Python and Alteryx scripts, Excel trackers, email chains. Hundreds of quality rules per cycle, no central view, no audit trail.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-primary/50 mb-1">What it does</p>
                <p className="text-muted-fg/80 text-justify transition-colors duration-300 group-hover:text-foreground/70">
                  Governance and submission pipeline in one tool. Role-based access, invitations, append-only audit log, multi-institution dashboard with risk scoring. The pipeline handles XML upload, lxml-based XSD validation, OVT quality report ingestion, per-rule triage and team assignment, failure drill-down, and Core File generation from the 28 TSV outputs HESA returns after sign-off.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50 mb-1">In progress</p>
                <p className="text-muted-fg/80 text-justify transition-colors duration-300 group-hover:text-foreground/70">
                  LLM module on Azure OpenAI with RAG over 200+ pages of regulatory guidance. Natural-language rule queries, tolerance-request drafting, schema-change summaries. Next phase: an agent layer that updates pipeline scripts behind a review gate, generates visualisations on demand, and drives the triage loop from intent.
                </p>
              </div>
            </div>

            {/* Tech */}
            <div className="mt-auto pt-5 border-t border-border/30 flex flex-wrap gap-2">
              {["Django", "React", "TypeScript", "PostgreSQL", "lxml", "Azure OpenAI", "RAG"].map((t) => (
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
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="group relative glass-card-hover rounded-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-accent/20 to-accent/0" />

          <div className="p-6 sm:p-8 flex flex-col h-full">
            {/* Meta row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/80 text-accent border border-border/50">
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
            <h3 className="font-display text-xl font-semibold text-foreground mb-7">
              LifeOS
            </h3>

            {/* Content */}
            <div className="space-y-5 text-[13px] leading-relaxed flex-1">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50 mb-1">What it is</p>
                <p className="text-muted-fg/80 text-justify transition-colors duration-300 group-hover:text-foreground/70">
                  A mobile-first personal operating system. Today view with energy tracking, calendar, goals, check-ins, analytics, and a conversational assistant with persistent memory. Full-stack, deployed, in daily use since Day 31.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50 mb-1">Architecture decision</p>
                <p className="text-muted-fg/80 text-justify transition-colors duration-300 group-hover:text-foreground/70">
                  The memory system went through three versions in three days. Store everything. Inject everything. Score and select. The first two were thorough. Only the third was useful. The problem was never storage — it was knowing what matters right now. The assistant uses selective injection: memories are scored against the current context and only passed to the model above a relevance threshold.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent/50 mb-1">What I learned</p>
                <p className="text-muted-fg/80 text-justify transition-colors duration-300 group-hover:text-foreground/70">
                  Working and right are different things. The lesson wasn&apos;t to slow down. It was to know what I was optimising for before I started.
                </p>
              </div>
            </div>

            {/* Tech */}
            <div className="mt-auto pt-5 border-t border-border/30 flex flex-wrap gap-2">
              {["FastAPI", "React Native", "PostgreSQL", "OpenAI", "Railway"].map((t) => (
                <span key={t} className="border-l-2 border-border/30 pl-2 font-mono text-[10px] text-muted-fg/40">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.article>

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
