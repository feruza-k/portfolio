"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    icon: <ThinkIcon />,
    label: "How I think",
    text: "Before I think about what a system can do, I try to settle what it shouldn't get wrong. Most failures I've seen aren't a model problem. Nobody decided the constraint first. Once you've got that, the architecture mostly writes itself.",
  },
  {
    icon: <BuildIcon />,
    label: "What I'm building toward",
    text: "Getting a model to perform well is one problem. Making that output repeatable and reliable enough for a team to build on is a different one. That second problem is what I want to work on.",
  },
  {
    icon: <StakeIcon />,
    label: "What kind of work I want",
    text: "Work that gets deployed and has something real attached to it. Not a notebook that runs once. Actual decisions changing because the system exists. The harder version of that is figuring out how to make it repeatable after it works the first time.",
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
