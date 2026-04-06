"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { SuggestionChips } from "./SuggestionChips";
import { VoiceButton } from "./VoiceButton";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI SDK v6: useChat from @ai-sdk/react
  // - input/setInput removed → manage locally
  // - handleSubmit removed → use sendMessage({ text })
  // - isLoading removed → use status
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, voiceMessages]);

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
    // Prefix with [JD] so the API route switches to JD-matcher mode
    const text = jdMode ? `[JD] ${trimmed}` : trimmed;
    sendMessage({ text });
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
      const aiMsg: VoiceMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: replyText,
      };
      setVoiceMessages((prev) => [...prev, aiMsg]);
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 self-center">
        {(["type", "speak"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`font-mono text-[12px] px-4 py-1.5 border transition-colors
              ${mode === m
                ? "border-white text-white bg-white/10"
                : "border-faint/20 text-muted hover:border-faint/40 hover:text-white/70"
              }`}
          >
            {m === "type" ? "⌨ Type" : "🎤 Speak"}
          </button>
        ))}
      </div>

      {/* Suggestion chips */}
      {showSuggestions && (
        <SuggestionChips onSelect={handleChipSelect} disabled={isLoading} />
      )}

      {/* Message list */}
      {displayMessages.length > 0 && (
        <div className="space-y-4">
          {displayMessages.map((m) => {
            // v6 UIMessage uses parts[]; VoiceMessage uses content string
            const text =
              "content" in m
                ? (m as VoiceMessage).content
                : (m as { parts?: Array<{ type: string; text?: string }> }).parts
                    ?.filter((p) => p.type === "text")
                    .map((p) => p.text ?? "")
                    .join("") ?? "";

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 bg-map-heat flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-mono text-[10px] text-dark font-bold">FK</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 font-body text-[14px] leading-relaxed whitespace-pre-wrap
                    ${m.role === "user" ? "bg-white/10 text-white" : "bg-dark-surface text-white/90"}`}
                >
                  {m.role === "assistant" && !text ? (
                    <span className="inline-block w-4 h-4 border-t border-white/40 rounded-full animate-spin" />
                  ) : (
                    text
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-mono text-[10px] text-muted">you</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      {mode === "type" ? (
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={jdMode ? "Paste the job description here →" : "Ask anything about me…"}
            disabled={isLoading}
            className="flex-1 bg-dark-surface border border-faint/20 px-4 py-3 font-body text-[14px] text-white placeholder:text-muted/50 focus:outline-none focus:border-faint/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="font-mono text-[12px] px-4 py-3 border border-faint/20 text-muted hover:text-white hover:border-faint/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? "…" : "Send →"}
          </button>
        </form>
      ) : (
        <VoiceButton
          onTranscript={handleVoiceTranscript}
          isLoading={isLoading}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
}
