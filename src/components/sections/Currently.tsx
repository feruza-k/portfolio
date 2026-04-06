"use client";

import { useEffect, useState } from "react";

interface LatestCommit {
  timeAgo: string;
  repo: string;
}

export function Currently() {
  const [commit, setCommit] = useState<LatestCommit | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    async function fetchCommit() {
      try {
        const res = await fetch("/api/github");
        if (!res.ok) return;
        const data = await res.json();
        if (data.latestCommit) {
          setCommit(data.latestCommit);
          setFlash(true);
          setTimeout(() => setFlash(false), 500);
        }
      } catch {
        // Silently fail — this is an enhancement, not critical
      }
    }

    fetchCommit();
    const interval = setInterval(fetchCommit, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-32 pb-12 section-divider">
      <div className="section-label mb-4">§ 00</div>
      <div className="space-y-1.5 font-body text-[15px] text-secondary leading-relaxed">
        <p>Strategic Planning Analyst, University of Greenwich.</p>
        <p>Building AI compliance systems. Open to AI Engineer roles in London.</p>
        <p>
          <span className="text-muted font-mono text-[13px]">last commit: </span>
          {commit ? (
            <span
              className={`font-mono text-[13px] transition-colors duration-500 ${
                flash ? "text-map-heat" : "text-ink"
              }`}
            >
              {commit.timeAgo} · {commit.repo}
            </span>
          ) : (
            <span className="font-mono text-[13px] text-muted">—</span>
          )}
        </p>
      </div>
    </section>
  );
}
