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
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Link
          href="/"
          className="font-mono text-[12px] text-muted hover:text-white transition-colors"
        >
          ← feruza.dev
        </Link>
        <span className="font-mono text-[11px] text-muted/50">
          Powered by Claude · responds in my voice
        </span>
      </div>

      {/* Centrepiece */}
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-24">
        <div className="w-full max-w-2xl space-y-10">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-[36px] sm:text-[44px] font-bold text-white leading-tight">
              Don&apos;t read about me.
              <br />
              Ask me anything.
            </h1>
            <p className="font-mono text-[12px] text-muted">
              answers in my voice · always on
            </p>
          </div>

          {/* Chat */}
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
