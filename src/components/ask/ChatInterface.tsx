"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { SuggestionChips } from "./SuggestionChips";
import { Waveform } from "./Waveform";

type Mode = "type" | "speak";

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [mode, setMode] = useState<Mode>("speak");
  const [jdMode, setJdMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");

  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SR);
    if (!SR) setMode("type");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, voiceMessages]);

  function toggleMode() {
    if (speechSupported === false) return;
    setMode((m) => (m === "type" ? "speak" : "type"));
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-GB";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      transcriptRef.current = "";
    };

    recognition.onresult = (e) => {
      const current = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(current);
      transcriptRef.current = current;
    };

    recognition.onend = () => {
      setListening(false);
      const t = transcriptRef.current.trim();
      if (t) {
        handleVoiceTranscript(t);
        setTranscript("");
        transcriptRef.current = "";
      }
    };

    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function handleChipSelect(text: string, isJd: boolean) {
    setJdMode(isJd);
    if (isJd) {
      setMode("type");
      setInput("Paste the job description here and I'll map my experience to it.\n\n");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      sendMessage({ text });
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const text = jdMode ? `[JD] ${trimmed}` : trimmed;
    sendMessage({ text });
    setInput("");
    setJdMode(false);
  }

  async function handleVoiceTranscript(text: string) {
    const userMsg: VoiceMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    setVoiceMessages((prev) => [...prev, userMsg]);

    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return;

    const replyText = decodeURIComponent(res.headers.get("X-Reply-Text") ?? "");
    if (replyText) {
      setVoiceMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: replyText },
      ]);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };
    audio.play().catch(() => setIsPlaying(false));
  }

  const displayMessages = mode === "type" ? messages : voiceMessages;
  const showSuggestions = displayMessages.length === 0 && !isLoading;

  // Extract text from a message (handles both UIMessage parts[] and VoiceMessage content)
  function extractText(m: (typeof displayMessages)[number]): string {
    if ("content" in m && typeof (m as VoiceMessage).content === "string") {
      return (m as VoiceMessage).content;
    }
    return (
      (m as { parts?: Array<{ type: string; text?: string }> }).parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("") ?? ""
    );
  }

  const showVoiceLoading = mode === "speak" && (isLoading || isPlaying);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Suggestion chips — empty state */}
      {showSuggestions && (
        <SuggestionChips onSelect={handleChipSelect} disabled={isLoading} />
      )}

      {/* Message transcript */}
      {displayMessages.length > 0 && (
        <div className="space-y-8">
          {displayMessages.map((m) => {
            const text = extractText(m);
            return (
              <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
                {m.role === "assistant" ? (
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-muted/50 uppercase">
                      feruza
                    </span>
                    <div className="border-l border-map-heat/40 pl-5 font-body text-[15px] text-white/80 leading-relaxed">
                      {!text ? (
                        <span className="inline-flex gap-1 items-center text-muted/40 font-mono text-[11px]">
                          <span className="animate-pulse">thinking</span>
                          <span className="animate-[blink_1s_step-end_infinite]">_</span>
                        </span>
                      ) : (
                        text
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="font-body text-[14px] text-white/40 italic leading-relaxed">
                    {text}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Unified input bar */}
      <div className="space-y-0">
        {/* Voice loading state — waveform replaces input */}
        {showVoiceLoading ? (
          <div className="flex items-center border border-faint/15 bg-dark-surface px-5 py-4 gap-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-muted/40 shrink-0"
              title="Switch to text"
            >
              <KeyboardIcon />
            </button>
            <div className="flex-1 flex items-center">
              <Waveform active />
            </div>
            <span className="font-mono text-[11px] text-muted/30">…</span>
          </div>
        ) : mode === "type" ? (
          <form onSubmit={handleFormSubmit} className="flex border border-faint/15 bg-dark-surface">
            {speechSupported !== false && (
              <button
                type="button"
                onClick={toggleMode}
                title="Switch to voice"
                className="px-4 border-r border-faint/15 text-muted/50 hover:text-white/70 transition-colors shrink-0 flex items-center"
              >
                <MicIcon />
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={jdMode ? "Paste the job description here →" : "Ask anything…"}
              disabled={isLoading}
              className="flex-1 bg-transparent px-4 py-3.5 font-body text-[14px] text-white placeholder:text-muted/30 focus:outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 border-l border-faint/15 font-mono text-[13px] text-muted/60 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            >
              →
            </button>
          </form>
        ) : (
          /* Voice mode — idle or listening */
          <div className="flex border border-faint/15 bg-dark-surface">
            <button
              type="button"
              onClick={toggleMode}
              title="Switch to text"
              className="px-4 border-r border-faint/15 text-muted/50 hover:text-white/70 transition-colors shrink-0 flex items-center"
            >
              <KeyboardIcon />
            </button>
            <div className="flex-1 px-4 py-3.5 font-body text-[14px] min-w-0">
              {listening && transcript ? (
                <span className="text-white/60">{transcript}</span>
              ) : listening ? (
                <span className="text-map-heat/70 font-mono text-[12px] animate-pulse">
                  listening…
                </span>
              ) : (
                <span className="text-muted/30">tap mic to speak</span>
              )}
            </div>
            <button
              onClick={listening ? stopListening : startListening}
              className={`px-5 border-l border-faint/15 transition-colors shrink-0 flex items-center
                ${listening
                  ? "text-map-heat"
                  : "text-muted/50 hover:text-white/70"
                }`}
              aria-label={listening ? "Stop" : "Start recording"}
            >
              {listening ? <StopIcon /> : <MicIcon />}
            </button>
          </div>
        )}

        {/* Safari fallback */}
        {speechSupported === false && (
          <p className="font-mono text-[11px] text-muted/40 pt-2">
            voice works in Chrome or Edge
          </p>
        )}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="7" y="1" width="6" height="11" rx="3" />
      <path d="M3 10a7 7 0 0 0 14 0M10 17v3" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="22" height="16" rx="1" />
      <path d="M5 6h1M9 6h1M13 6h1M17 6h1M5 10h1M9 10h1M13 10h1M17 10h1M7 14h10" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect width="12" height="12" />
    </svg>
  );
}
