"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    icon: <ThinkIcon />,
    label: "How I think",
    text: "Most of what I build starts messy: a regulator's guidance scattered across documents, six datasets that don't share a key, a day with no shape until I give it one. I'd rather spend the first effort on structure than output.",
  },
  {
    icon: <BuildIcon />,
    label: "What I'm building toward",
    text: "I've had a pipeline run clean for a cycle then break because a source changed shape, and an AI agent whose memory got worse the more I gave it, until I made it selective. Getting something to work once is easy; the real problem is making it hold up on the tenth run.",
  },
  {
    icon: <StakeIcon />,
    label: "What kind of work I want",
    text: "Pipelines and AI systems that run unattended and get trusted, not a notebook that runs once. I turned a two-week manual return into two hours, and I want to keep finding that kind of leverage.",
  },
];

export function About() {
  return (
    <section
      id="about"
      className="relative py-32 px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.03)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="mb-16 text-center"
        >
          <p className="section-label mb-4">{"// about"}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Working with me
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease }}
              className="group rounded-2xl p-6 sm:p-7 border border-border/60 bg-white/[0.025] backdrop-blur-xl shadow-[0_0_24px_hsl(var(--primary)/0.05),inset_0_1px_0_hsl(var(--primary)/0.04)] transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_0_36px_hsl(var(--primary)/0.10),inset_0_1px_0_hsl(var(--primary)/0.07)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary transition-colors group-hover:bg-primary/15">
                  {card.icon}
                </div>
                <p className="font-display text-sm font-semibold tracking-tight text-foreground/80 transition-colors duration-300 group-hover:text-foreground">
                  {card.label}
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-fg/60 transition-colors duration-300 group-hover:text-foreground/80">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThinkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function BuildIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>;
}
function StakeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
