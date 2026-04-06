"use client";

const CHIPS = [
  { label: "What's the hardest thing you've built?", jd: false },
  { label: "Why did you leave Kazakhstan?", jd: false },
  { label: "Why AI engineering, not data science?", jd: false },
  { label: "What's a technical decision you regret?", jd: false },
  { label: "What are you building right now?", jd: false },
  { label: "Match me to a job description", jd: true },
];

interface SuggestionChipsProps {
  onSelect: (text: string, jdMode: boolean) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CHIPS.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.label, chip.jd)}
          disabled={disabled}
          className={`shrink-0 font-mono text-[11px] border px-3 py-1.5 transition-colors whitespace-nowrap
            ${chip.jd
              ? "border-dark-accent text-dark-accent hover:bg-dark-accent hover:text-dark"
              : "border-faint/30 text-muted hover:border-faint hover:text-white"
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
