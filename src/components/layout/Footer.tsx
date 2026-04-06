export function Footer() {
  return (
    <footer className="border-t border-faint py-12 mt-24">
      <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="font-body text-[14px] text-muted space-y-0.5">
          <p className="text-ink font-body text-[14px]">Feruza Kachkinbayeva</p>
          <p>London, UK · feruza97k@gmail.com</p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/feruza-k"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[14px] text-muted hover:text-ink transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/feruza1997"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[14px] text-muted hover:text-ink transition-colors"
          >
            LinkedIn
          </a>
        </div>

        <p className="font-mono text-[11px] text-muted">
          always building · 4/∞
        </p>
      </div>
    </footer>
  );
}
