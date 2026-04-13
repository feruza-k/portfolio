"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SUBTITLE = "Applied AI Engineer · London";

const ease = [0.16, 1, 0.3, 1] as const;

export function Landing() {
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  // Typing effect for subtitle
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(SUBTITLE.slice(0, i));
      if (i >= SUBTITLE.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute bottom-1/4 -right-32 h-[400px] w-[400px] rounded-full bg-accent/[0.04] blur-[120px] animate-float-medium" />

      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_75%)]" />

      {/* Spinning ring */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] animate-spin-slow">
        <div className="absolute inset-0 rounded-full border border-primary" />
        <div className="absolute inset-[60px] rounded-full border border-accent/50" />
        <div className="absolute inset-[120px] rounded-full border border-primary/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-0">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
          className="mb-10 flex items-center gap-3 rounded-full border border-border/50 bg-card/40 px-5 py-2 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75 animate-ping-soft" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-terminal-green" />
          </span>
          <span className="font-mono text-[11px] text-muted-fg tracking-wider">
            AI Engineer — London, UK
          </span>
        </motion.div>

        {/* Name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="font-mono text-sm text-primary/70 tracking-[0.3em] uppercase mb-6"
        >
          Feruza Kachkinbayeva
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease }}
          className="font-display font-semibold tracking-tight leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] max-w-4xl"
        >
          I build{" "}
          <span className="gradient-text">AI systems</span>
          <br />
          that turn complex data
          <br />
          into{" "}
          <span className="gradient-text-primary">decisions</span>
          <span className="text-primary">.</span>
        </motion.h1>

        {/* Typed subtitle */}
        <div className="mt-6 h-6">
          <p className="font-mono text-sm text-muted-fg">
            {typed}
            {!typingDone && (
              <span className="inline-block w-[2px] h-[1em] bg-primary/60 align-middle ml-[1px] animate-blink" />
            )}
          </p>
        </div>

        {/* CTAs */}
        {typingDone && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <button
              onClick={() => scrollTo("agent")}
              className="group relative overflow-hidden rounded-lg bg-primary px-7 py-3 font-mono text-[13px] font-semibold text-background tracking-wide transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_24px_hsl(var(--primary)/0.4)]"
            >
              <SparklesIcon />
              Talk to my AI agent
            </button>
            <button
              onClick={() => scrollTo("work")}
              className="rounded-lg border border-border/50 bg-card/30 px-7 py-3 font-mono text-[13px] text-foreground/70 tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:text-foreground hover:bg-primary/[0.03]"
            >
              See the work
            </button>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] text-muted-fg/30 uppercase tracking-[0.3em]">
          scroll
        </span>
        <ChevronDown />
      </motion.div>

    </section>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline mr-1.5 -mt-0.5 transition-transform duration-300 group-hover:rotate-12"
      aria-hidden="true"
    >
      <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zM5 12l.73 2.18L8 15l-2.27.82L5 18l-.73-2.18L2 15l2.27-.82L5 12zm14 0l.73 2.18L22 15l-2.27.82L19 18l-.73-2.18L16 15l2.27-.82L19 12z" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <motion.svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="text-muted-fg/30"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <path d="M3 6l5 5 5-5" />
    </motion.svg>
  );
}
