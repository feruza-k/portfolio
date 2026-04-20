"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const LINKS = [
  { label: "feruza97k@gmail.com", href: "mailto:feruza97k@gmail.com", icon: <MailIcon /> },
  { label: "github.com/feruza-k",     href: "https://github.com/feruza-k",              icon: <GitHubIcon /> },
  { label: "linkedin.com/in/feruza1997", href: "https://linkedin.com/in/feruza1997",    icon: <LinkedInIcon /> },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/30 py-20 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.02)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
        className="relative mx-auto max-w-3xl flex flex-col items-center gap-10"
      >
        {/* CTA */}
        <div className="text-center">
          <p className="font-display text-xl font-semibold text-foreground mb-2">
            Let&apos;s build something that matters.
          </p>
          <p className="text-sm text-muted-fg/60">
            Open to AI engineering roles.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="group flex items-center gap-2.5 rounded-xl border border-border/30 bg-card/30 px-5 py-3 font-mono text-xs text-muted-fg/60 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.03] hover:shadow-[0_0_20px_hsl(var(--primary)/0.06)]"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}
        </div>

        {/* Signature */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-fg/25 uppercase tracking-[0.2em]">
            Built with
          </span>
          <HeartIcon />
          <span className="font-mono text-[10px] text-muted-fg/25 uppercase tracking-[0.2em]">
            by Feruza — London, 2026
          </span>
        </div>
      </motion.div>
    </footer>
  );
}

function MailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>;
}
function GitHubIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>;
}
function LinkedInIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
}
function HeartIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-primary/30" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
