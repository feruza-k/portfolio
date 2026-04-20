"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl glass-card flex items-center justify-center">
      <span className="font-mono text-[12px] text-muted-fg animate-pulse">
        loading map_
      </span>
    </div>
  ),
});

const ease = [0.16, 1, 0.3, 1] as const;

export function Map() {
  return (
    <section
      id="location-intelligence"
      className="relative py-32 px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.03)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="mb-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <GlobeIcon />
            </div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              London Café Site Intelligence
            </h2>
            <span className="flex items-center gap-1.5 rounded-md border border-accent/15 bg-accent/5 px-2.5 py-0.5">
              <AwardIcon />
              <span className="font-mono text-[10px] text-accent/70">SLA Master&apos;s Award 2024</span>
            </span>
          </div>
          <p className="text-sm text-muted-fg/80 max-w-2xl leading-relaxed">
            4,835 LSOAs. AHP-weighted opportunity scores. Built for my MSc thesis.
          </p>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="rounded-2xl overflow-hidden glow-primary-strong"
        >
          <MapClient filterOptions={["All", "Very High Success", "High Success", "Medium Success", "Low Success"]} />
        </motion.div>

        {/* Below map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease }}
          className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
        >
          <p className="text-[13px] text-muted-fg/70 leading-relaxed max-w-xl">
            AHP weighting synthesises{" "}
            <span className="text-foreground/90">12 site-suitability factors</span>{" "}
            — footfall potential, competition density, transport access, and demographics —
            into a single opportunity score per LSOA. Consistency ratio:{" "}
            <span className="text-foreground/90 font-mono">0.06</span>.
          </p>
          <div className="flex gap-3 shrink-0">
            <button className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/30 px-4 py-2 font-mono text-[12px] text-muted-fg/60 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.03]">
              <VolumeIcon />
              Hear methodology
            </button>
            <a
              href="/thesis.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/30 px-4 py-2 font-mono text-[12px] text-muted-fg/60 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.03]"
            >
              <FileIcon />
              Thesis PDF
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function GlobeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function AwardIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
}
function VolumeIcon() {
  return <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="1,6 1,14 5,14 11,18 11,2 5,6"/><path d="M14 6.5a5 5 0 0 1 0 7"/></svg>;
}
function FileIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
