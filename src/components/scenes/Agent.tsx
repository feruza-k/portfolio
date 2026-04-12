"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const SUGGESTIONS = [
  "Walk me through your thesis",
  "What are you building right now?",
  "What's the hardest thing you've built?",
  "What's a technical decision you regret?",
];

const JD_SUGGESTION = "Match me to this JD: [paste here]";

export function Agent() {
  const [voiceOn, setVoiceOn] = useState(false);
  const [input, setInput] = useState("");
  const [jdMode, setJdMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent" }),
  });
  const isLoading = status === "streaming" || status === "submitted";
  const showSuggestions = messages.length === 0 && !isLoading;

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Voice: sentence-level streaming TTS
  // Sends each completed sentence to ElevenLabs immediately during streaming
  // so audio starts playing after the first sentence, not after the full response.
  const spokenIds = useRef<Set<string>>(new Set());
  const ttsState = useRef<{ msgId: string; sentChars: number } | null>(null);
  const audioQueue = useRef<Promise<void>>(Promise.resolve());

  // When voice toggled ON, stamp all current messages so they aren't replayed
  useEffect(() => {
    if (voiceOn) {
      messages.filter((m) => m.role === "assistant").forEach((m) => spokenIds.current.add(m.id));
      ttsState.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn]);

  useEffect(() => {
    if (!voiceOn) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last || spokenIds.current.has(last.id)) return;

    const fullText = extractText(last);
    if (!fullText) return;

    // Init tracking for this message
    if (!ttsState.current || ttsState.current.msgId !== last.id) {
      ttsState.current = { msgId: last.id, sentChars: 0 };
    }

    const newText = fullText.slice(ttsState.current.sentChars);
    if (!newText) return;

    // During streaming: only send up to the last complete sentence boundary.
    // When streaming finishes (!isLoading): flush whatever remains.
    let cutoff = 0;
    if (!isLoading) {
      cutoff = newText.length;
      spokenIds.current.add(last.id); // mark done so it's never replayed
    } else {
      // Find the last sentence boundary (. ! ?) followed by whitespace or end
      const matches = Array.from(newText.matchAll(/[.!?]+[\s\n]/g));
      if (matches.length === 0) return;
      const lastMatch = matches[matches.length - 1];
      cutoff = lastMatch.index! + lastMatch[0].length;
    }

    if (cutoff === 0) return;
    const toSpeak = newText.slice(0, cutoff).trim();
    if (!toSpeak) return;

    ttsState.current.sentChars += cutoff;

    // Chain onto audio queue — plays clips sequentially, in order
    audioQueue.current = audioQueue.current.then(async () => {
      const r = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: toSpeak }),
      });
      if (!r.ok) return;
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      await new Promise<void>((resolve) => {
        const audio = new Audio(url);
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, voiceOn]);

  // Speech-to-text via Web Speech API
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function toggleMic() {
    const SpeechRecognition =
      window.SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) return; // browser doesn't support it

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    rec.onend = () => {
      setIsListening(false);
      // auto-submit if we captured something
      setTimeout(() => {
        const trimmed = inputRef.current?.value.trim();
        if (trimmed) {
          sendMessage({ text: trimmed });
          setInput("");
        }
      }, 200);
    };

    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }

  function extractText(m: (typeof messages)[number]): string {
    return (
      m.parts
        ?.filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("") ?? ""
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const text = jdMode ? `[JD] ${trimmed}` : trimmed;
    sendMessage({ text });
    setInput("");
    setJdMode(false);
  }

  function handleSuggestion(text: string) {
    if (text === JD_SUGGESTION) {
      setJdMode(true);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      sendMessage({ text });
    }
  }

  return (
    <section
      id="agent"
      className="relative py-32 px-6"
    >
      {/* Section background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <TerminalIcon />
            </div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Ask me anything
            </h2>
            <span className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-0.5">
              <ZapIcon />
              <span className="font-mono text-[10px] text-primary">RAG-powered</span>
            </span>
          </div>
          <p className="text-sm text-muted-fg/80 max-w-lg leading-relaxed">
            Backed by a knowledge base. Grounded in real work. Speaks in my voice if you want.
          </p>
        </motion.div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="rounded-xl glass-card glow-primary-strong overflow-hidden scanlines"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-border/50 bg-card/30 px-5 py-3">
            <div className="flex items-center gap-2">
              {/* Traffic lights */}
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
                <span className="h-3 w-3 rounded-full bg-accent/40 hover:bg-accent/70 transition-colors" />
                <span className="h-3 w-3 rounded-full bg-terminal-green/50 hover:bg-terminal-green transition-colors" />
              </div>
              <span className="ml-2 font-mono text-[11px] text-muted-fg/60">
                feruza-agent@london:~
              </span>
            </div>
            <button
              onClick={() => setVoiceOn((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] transition-all duration-300 ${
                voiceOn
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-card/50 text-muted-fg hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {voiceOn ? <VolumeOnIcon /> : <VolumeOffIcon />}
              {voiceOn ? "voice on" : "voice off"}
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="h-[420px] overflow-y-auto p-5 space-y-4">
            {/* System greeting */}
            {showSuggestions && (
              <div className="rounded-lg border border-terminal-green/10 bg-terminal-green/[0.04] p-3 font-mono text-[11px] text-terminal-green/70 leading-relaxed">
                <span className="text-terminal-green/40 mr-1">SYS →</span>
                Feruza&apos;s AI agent. Ask about her work, thesis, or paste a job description.
              </div>
            )}

            {messages.map((m) => {
              const text = extractText(m);
              return (
                <div key={m.id}>
                  {m.role === "user" ? (
                    <div className="flex gap-3 font-mono text-sm">
                      <span className="text-primary shrink-0 mt-0.5">❯</span>
                      <span className="text-foreground">{text}</span>
                    </div>
                  ) : (
                    <div className="flex gap-3 font-mono text-sm">
                      <span className="shrink-0 mt-0.5 gradient-text">◆</span>
                      <span className="text-muted-fg leading-relaxed whitespace-pre-wrap">
                        {!text ? (
                          <span className="flex items-center gap-2 text-muted-fg/60 text-xs">
                            <LoaderIcon />
                            retrieving context &amp; generating response...
                          </span>
                        ) : text}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center border-t border-border/40 bg-background/30 px-5 py-3.5"
          >
            <span className="mr-3 font-mono text-xs text-primary/50 select-none">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={jdMode ? "Paste job description here →" : "Ask anything…"}
              disabled={isLoading}
              className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-fg/40 focus:outline-none disabled:opacity-40"
            />
            <button
              type="button"
              onClick={toggleMic}
              disabled={isLoading}
              title={isListening ? "Stop listening" : "Speak your question"}
              className={`ml-2 flex h-7 w-7 items-center justify-center rounded-md transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed ${
                isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-card/50 text-muted-fg/60 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <MicIcon />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <SendIcon />
            </button>
          </form>
        </motion.div>

        {/* Suggestion pills — below terminal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="mt-4 flex flex-wrap gap-2"
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              disabled={isLoading}
              className="rounded-lg border border-border/40 bg-card/30 px-3.5 py-2 font-mono text-[11px] text-muted-fg/70 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.03] disabled:opacity-30"
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => handleSuggestion(JD_SUGGESTION)}
            disabled={isLoading}
            className="rounded-lg border border-accent/20 bg-card/30 px-3.5 py-2 font-mono text-[11px] text-accent/60 transition-all duration-300 hover:border-accent/40 hover:text-accent hover:bg-accent/[0.03] disabled:opacity-30"
          >
            {JD_SUGGESTION}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function TerminalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" aria-hidden="true">
      <rect x="2" y="3" width="16" height="14" rx="2" />
      <path d="M6 8l3 3-3 3M11 14h3" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="text-primary" aria-hidden="true">
      <path d="M11 2L4 12h7l-2 6 9-10h-7l2-6z" />
    </svg>
  );
}
function VolumeOnIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <polygon points="1,6 1,14 5,14 11,18 11,2 5,6" />
      <path d="M14 6.5a5 5 0 0 1 0 7" />
    </svg>
  );
}
function VolumeOffIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <polygon points="1,6 1,14 5,14 11,18 11,2 5,6" />
      <path d="M15 9l4 4m0-4l-4 4" />
    </svg>
  );
}
function LoaderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-primary" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M18 2L9 11M18 2l-6 16-3-7-7-3 16-6z" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}
