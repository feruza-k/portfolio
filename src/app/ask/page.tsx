import Link from "next/link";
import { ChatInterface } from "@/components/ask/ChatInterface";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Feruza — feruza.dev",
  description: "Ask Feruza anything — about her work, background, or what she'd bring to your team.",
};

export default function AskPage() {
  return (
    <main className="min-h-screen bg-dark flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <Link
          href="/"
          className="font-mono text-[11px] text-muted/50 hover:text-white/70 transition-colors tracking-wide"
        >
          ← feruza.dev
        </Link>
        <span className="font-mono text-[10px] text-muted/30 tracking-wide">
          Claude · ElevenLabs
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-20">
        <div className="w-full max-w-2xl space-y-10">

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-white leading-tight">
              Don&apos;t read about me.
              <br />
              Ask me anything.
            </h1>
            <p className="font-mono text-[11px] text-muted/40 tracking-wide">
              answers in my voice · always on
            </p>
          </div>

          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
