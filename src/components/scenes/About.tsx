"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    icon: <ThinkIcon />,
    label: "How I think",
    text: "I start with constraints before capabilities. Most AI systems fail not because the model isn't good enough, but because nobody decided what it shouldn't do. The architecture follows the constraint, not the other way around.",
  },
  {
    icon: <BuildIcon />,
    label: "What I'm building toward",
    text: "Working toward a Knowledge Transfer Partnership and Azure AI-102. The longer-term goal is Deloitte or similar — not because of the name, but because the problems are real and the data is messy. That's where I do my best work.",
  },
  {
    icon: <StakeIcon />,
    label: "What kind of work I want",
    text: "Build, not just advise. Systems that get deployed and used, with real stakes attached. If the data is chaotic and the requirements are unclear, I'm paying attention.",
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
              className="group glass-card-hover rounded-2xl p-6 sm:p-7"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
                {card.icon}
              </div>
              <p className="mb-3 font-display text-sm font-semibold tracking-tight text-foreground">
                {card.label}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-fg/70 group-hover:text-muted-fg transition-colors duration-300">
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
