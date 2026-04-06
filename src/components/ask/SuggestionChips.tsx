"use client";

const CHIPS = [
  { label: "What's the hardest thing you've built?", jd: false },
  { label: "Why did you leave Kazakhstan?", jd: false },
  { label: "Why AI engineering, not data science?", jd: false },
  { label: "What's a technical decision you regret?", jd: false },
  { label: "What are you building right now?", jd: false },
  { label: "Match me to a job description →", jd: true },
];

interface SuggestionChipsProps {
  onSelect: (text: string, jdMode: boolean) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] tracking-[0.15em] text-muted/40 uppercase mb-3">
        or start here
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CHIPS.filter((c) => !c.jd).map((chip) => (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.label, false)}
            disabled={disabled}
            className="text-left px-4 py-3 border border-faint/15 font-body text-[13px] text-white/50
                       hover:border-faint/40 hover:text-white/80 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* JD chip — full width, distinct */}
      <button
        onClick={() => onSelect(CHIPS[5].label.replace(" →", ""), true)}
        disabled={disabled}
        className="w-full text-left px-4 py-3 border border-dark-accent/25 font-mono text-[12px] text-dark-accent/60
                   hover:border-dark-accent/60 hover:text-dark-accent transition-colors
                   disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Match me to a job description →
      </button>
    </div>
  );
}
