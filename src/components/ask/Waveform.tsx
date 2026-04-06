"use client";

export function Waveform({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="flex items-center gap-1 h-8" aria-label="Audio waveform">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="block w-1 bg-map-heat origin-bottom"
          style={{
            height: "100%",
            animation: "wave-bar 0.8s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
