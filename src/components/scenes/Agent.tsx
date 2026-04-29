"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WindowWithSpeech = typeof window & { SpeechRecognition?: any; webkitSpeechRecognition?: any };

const SUGGESTIONS = [
  "Schedule a call", 
  "Introduce yourself",
  "Walk me through your thesis",
  "What are you building right now?",
  "How does your AI agent actually work?"
];


function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

// Smooths AI SDK token bursts into character-by-character output while streaming.
// Snaps to full text the moment streaming ends so nothing is ever cut off.
function TypewriterText({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState(active ? "" : text);
  const textRef = useRef(text);

  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { if (!active) setDisplayed(text); }, [active, text]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setDisplayed((prev) =>
        prev.length < textRef.current.length
          ? textRef.current.slice(0, prev.length + 1)
          : prev
      );
    }, 16);
    return () => clearInterval(id);
  }, [active]);

  return <>{displayed}</>;
}


// Purple = agent speaking, Blue = user speaking, dim = idle
type SphereState = "idle" | "agent" | "user";

function PlasmaCanvas({
  state,
  caption,
  containerRef,
}: {
  state: SphereState;
  caption: string;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const colourRef = useRef(0.5); // 0=blue, 1=purple

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Size canvas to container
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const ctx = canvas.getContext("2d")!;

    function getAmp() {
      const t = tRef.current;
      if (state === "idle") return 0.05 + 0.025 * Math.abs(Math.sin(t * 0.007));
      if (state === "user") return 0.42 + 0.48 * Math.abs(Math.sin(t * 0.022)) * Math.abs(Math.cos(t * 0.015));
      return 0.38 + 0.52 * Math.abs(Math.sin(t * 0.016)) * Math.abs(Math.cos(t * 0.01));
    }

    function lerp(a: number, b: number, k: number) { return a + (b - a) * k; }

    function getColour(mix: number, depth: number, alpha: number) {
      // Blue: 99,155,255 / Purple: 167,100,255
      const r = Math.round(lerp(99, 167, mix));
      const g = Math.round(lerp(155 + depth * 50, 100 + depth * 40, mix));
      const b = 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function frame() {
      if (!canvas) return;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const t = tRef.current;
      const a = getAmp();

      const target = state === "agent" ? 1 : state === "user" ? 0 : 0.5;
      colourRef.current = lerp(colourRef.current, target, 0.04);
      const mix = colourRef.current;

      ctx.clearRect(0, 0, W, H);

      // scale to container, use smaller dimension so it fits
      const R = Math.min(W, H) * 0.22 * (0.85 + a * 0.18);
      const tilt = 0.38;

      // Outer atmospheric glow
      for (let r = R * 2.6; r > R; r -= 6) {
        const alpha = 0.009 * (1 - (r - R) / (R * 1.6)) * a;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = getColour(mix, 0.5, alpha);
        ctx.fill();
      }

      // Latitude rings
      for (let lat = -80; lat <= 80; lat += 16) {
        const latR = (lat * Math.PI) / 180;
        const ringR = R * Math.cos(latR);
        const ringY = cy + R * Math.sin(latR) * Math.cos(tilt);
        const warpAmp = a * 14 * Math.sin(lat * 0.1 + t * 0.04);
        const pts = 100;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const lng = (i / pts) * Math.PI * 2;
          const x = cx + ringR * Math.sin(lng);
          const z = ringR * Math.cos(lng);
          const depthY = z * Math.sin(tilt);
          const warp = warpAmp * Math.sin(lng * 3 + t * 0.05);
          const px = x + warp * Math.cos(lng);
          const py = ringY + depthY + warp * Math.sin(lng) * 0.5;
          if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
        }
        const depth = (Math.sin(latR) + 1) / 2;
        ctx.strokeStyle = getColour(mix, depth, 0.1 + depth * 0.55 * a);
        ctx.lineWidth = 0.7 + depth * a * 1.1;
        ctx.stroke();
      }

      // Longitude meridians
      for (let lng = 0; lng < 360; lng += 26) {
        const lngR = (lng * Math.PI) / 180;
        const pts = 70;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const lat2 = ((i / pts) - 0.5) * Math.PI;
          const ringR2 = R * Math.cos(lat2);
          const x = cx + ringR2 * Math.sin(lngR);
          const z = ringR2 * Math.cos(lngR);
          const y = cy + R * Math.sin(lat2) * Math.cos(tilt) + z * Math.sin(tilt);
          const warp = a * 9 * Math.sin(lat2 * 4 + lngR * 2 + t * 0.06);
          if (i === 0) { ctx.moveTo(x + warp, y); } else { ctx.lineTo(x + warp, y); }
        }
        const side = Math.cos(lngR);
        ctx.strokeStyle = getColour(mix, (side + 1) / 2, (0.06 + ((side + 1) / 2) * 0.25) * a);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Core glow
      for (let r = 28; r > 0; r -= 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${0.035 * ((28 - r) / 28) * a * 3.5})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + a * 5, 0, Math.PI * 2);
      ctx.fillStyle = getColour(mix, 0.85, 0.95);
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(cx - R * 0.26, cy - R * 0.26, R * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.06 * a})`;
      ctx.fill();

      tRef.current++;
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  // state changes need to restart the loop with the new colour target
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ background: "transparent" }}
      />
      {/* Caption overlay — bottom centre, single line */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {caption ? (
            <motion.p
              key={caption.slice(0, 20)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[11px] text-center leading-relaxed line-clamp-2 max-w-sm"
              style={{
                color:
                  state === "agent"
                    ? "rgba(180,150,255,0.85)"
                    : "rgba(120,180,255,0.85)",
              }}
            >
              {caption}
            </motion.p>
          ) : (
            <motion.p
              key="idle-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] text-[#6b7280]"
            >
              {state === "user" ? "listening..." : state === "agent" ? "speaking..." : ""}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {/* Speaker label top-right */}
      <div className="absolute top-3 right-4 pointer-events-none">
        <span
          className="font-mono text-[9px] tracking-widest uppercase"
          style={{
            color:
              state === "agent"
                ? "rgba(167,139,250,0.45)"
                : state === "user"
                ? "rgba(99,155,255,0.45)"
                : "transparent",
          }}
        >
          {state === "agent" ? "feruza" : state === "user" ? "you" : ""}
        </span>
      </div>
    </div>
  );
}


export function Agent() {
  const [voiceActive, setVoiceActive] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [caption, setCaption] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const voiceContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const voiceActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const startListeningRef = useRef<() => void>(() => {});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent" }),
  });
  const isLoading = status === "streaming" || status === "submitted";
  const showSuggestions = messages.length === 0 && !isLoading;

  const sphereState: SphereState = isSpeaking ? "agent" : isListening ? "user" : "idle";

  const { displayed: openingLine, done: openingDone } = useTypewriter(
    "Ask me anything — projects, decisions, what I'm building next.",
    40
  );

  // Auto scroll on new messages
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Keep scroll pinned to bottom during typewriter animation (only if user is near bottom)
  useEffect(() => {
    if (!isLoading) return;
    const el = messagesContainerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }, 50);
    return () => clearInterval(id);
  }, [isLoading]);

  // ── TTS streaming ──────────────────────────────────────────────────────────
  const spokenIds = useRef<Set<string>>(new Set());
  const ttsState = useRef<{ msgId: string; sentChars: number } | null>(null);
  const audioQueue = useRef<Promise<void>>(Promise.resolve());
  const lastSpokenText = useRef<string>("");
  const sendMessageRef = useRef(sendMessage);
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);
  useEffect(() => { voiceActiveRef.current = voiceActive; }, [voiceActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  useEffect(() => {
    if (!voiceActive) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last || spokenIds.current.has(last.id)) return;

    const fullText = extractText(last);
    if (!fullText) return;

    if (!ttsState.current || ttsState.current.msgId !== last.id) {
      ttsState.current = { msgId: last.id, sentChars: 0 };
    }

    const newText = fullText.slice(ttsState.current.sentChars);
    if (!newText) return;

    let cutoff = 0;
    if (!isLoading) {
      cutoff = newText.length;
      spokenIds.current.add(last.id);
    } else {
      const sentenceMatches = Array.from(newText.matchAll(/[.!?]+[\s\n]/g));
      if (sentenceMatches.length > 0) {
        const lastMatch = sentenceMatches[sentenceMatches.length - 1];
        cutoff = lastMatch.index! + lastMatch[0].length;
      } else if (newText.length > 120) {
        // no sentence boundary yet but enough text, fire at last comma/semicolon
        const clauseMatches = Array.from(newText.matchAll(/[,;]\s/g));
        if (clauseMatches.length === 0) return;
        const lastMatch = clauseMatches[clauseMatches.length - 1];
        cutoff = lastMatch.index! + lastMatch[0].length;
      } else {
        return;
      }
    }

    if (cutoff === 0) return;
    const toSpeak = newText.slice(0, cutoff).trim();
    if (!toSpeak) return;
    ttsState.current.sentChars += cutoff;

    const previousText = lastSpokenText.current;
    lastSpokenText.current = toSpeak;

    // pre-fetch immediately, runs in parallel while previous clip plays
    const fetchPromise = (async () => {
      const r = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: toSpeak, previousText }),
      });
      if (!r.ok) return null;
      const arrayBuffer = await r.arrayBuffer();
      const audioCtx = audioCtxRef.current;
      if (!audioCtx) return null;
      return audioCtx.decodeAudioData(arrayBuffer);
    })();

    audioQueue.current = audioQueue.current.then(async () => {
      try {
        const audioCtx = audioCtxRef.current;
        if (!audioCtx) return;
        const decoded = await fetchPromise;
        if (!decoded) return;
        // only enter speaking state once we have actual audio (prevents flicker when API fails)
        setIsSpeaking(true);
        setCaption(toSpeak);
        await new Promise<void>((resolve) => {
          const source = audioCtx.createBufferSource();
          source.buffer = decoded;

          // High-pass filter: removes low-frequency rumble from voice clone
          const highpass = audioCtx.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.value = 90;
          highpass.Q.value = 0.7;

          // Compressor: tightens dynamics, pushes noise floor down relative to speech
          const compressor = audioCtx.createDynamicsCompressor();
          compressor.threshold.value = -28;
          compressor.knee.value = 10;
          compressor.ratio.value = 8;
          compressor.attack.value = 0.004;
          compressor.release.value = 0.2;

          // Gain with fade-in/out for smooth clip transitions
          const gain = audioCtx.createGain();
          const fade = 0.06;
          const dur = decoded.duration;
          const t = audioCtx.currentTime;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(1, t + fade);
          gain.gain.setValueAtTime(1, t + Math.max(dur - fade, fade));
          gain.gain.linearRampToValueAtTime(0, t + dur);

          source.connect(highpass);
          highpass.connect(compressor);
          compressor.connect(gain);
          gain.connect(audioCtx.destination);

          source.onended = () => { audioSourceRef.current = null; resolve(); };
          audioSourceRef.current = source;
          source.start(0);
        });
      } finally {
        setIsSpeaking(false);
        setCaption("");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, voiceActive]);

  // Web Speech API: real-time recognition, auto-detects sentence end, loops
  // Defined via ref so onend can call it recursively without stale closures
  startListeningRef.current = () => {
    if (!voiceActiveRef.current || recognitionRef.current) return;
    const SR = (window as WindowWithSpeech).SpeechRecognition ?? (window as WindowWithSpeech).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      setCaption(transcript);
      if (e.results[e.results.length - 1].isFinal && transcript.trim()) {
        console.log("[voice] heard:", transcript.trim());
        sendMessageRef.current({ text: transcript.trim() });
        setTimeout(() => setCaption(""), 1200);
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== "no-speech") console.error("[speech]", e.error);
      recognitionRef.current = null;
      setIsListening(false);
    };

    rec.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      // Restart only when still in voice mode and agent is not speaking
      if (voiceActiveRef.current && !isSpeakingRef.current) {
        setTimeout(() => startListeningRef.current(), 350);
      }
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
    setCaption("");
  };

  // Pause recognition while agent speaks, restart when done
  useEffect(() => {
    if (isSpeaking) {
      recognitionRef.current?.stop();
    } else if (voiceActive && !isListening && !recognitionRef.current) {
      setTimeout(() => startListeningRef.current(), 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking]);

  const toggleVoice = useCallback(() => {
    if (voiceActive) {
      // Stop any playing TTS immediately
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setIsSpeaking(false);
      setVoiceActive(false);
      setCaption("");
      return;
    }

    const SR = (window as WindowWithSpeech).SpeechRecognition ?? (window as WindowWithSpeech).webkitSpeechRecognition;
    if (!SR) {
      setCaption("voice not supported — try Chrome");
      setTimeout(() => setCaption(""), 2500);
      return;
    }

    // create/resume AudioContext during user gesture to unlock audio autoplay
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    audioCtxRef.current.resume();

    setVoiceActive(true);
    messages.filter((m) => m.role === "assistant").forEach((m) => spokenIds.current.add(m.id));
    ttsState.current = null;
    lastSpokenText.current = "";
    setTimeout(() => startListeningRef.current(), 50);
  }, [voiceActive, messages]);

  // Deactivate voice when user explicitly clicks X
  function deactivateVoice() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setVoiceActive(false);
    setCaption("");
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
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <section id="agent" className="relative py-32 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
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
          </div>
          <p className="text-sm text-muted-fg/80 max-w-lg leading-relaxed">
            Grounded in real work. Speaks in my voice if you want.
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
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors cursor-pointer" onClick={voiceActive ? deactivateVoice : undefined} />
                <span className="h-3 w-3 rounded-full bg-accent/40 hover:bg-accent/70 transition-colors" />
                <span className="h-3 w-3 rounded-full bg-terminal-green/50 hover:bg-terminal-green transition-colors" />
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75 animate-ping-soft" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terminal-green" />
                </span>
                <span className="font-mono text-[11px] text-muted-fg/60">feruza-agent@london:~</span>
              </div>
            </div>
            {/* Show exit voice mode button when voice is active */}
            {voiceActive && (
              <button
                onClick={deactivateVoice}
                className="font-mono text-[10px] text-muted-fg/50 hover:text-muted-fg transition-colors"
              >
                exit voice
              </button>
            )}
          </div>

          {/* Message area — cross-fade between text and sphere */}
          <div className="relative h-[420px]">

            {/* Text messages */}
            <motion.div
              ref={messagesContainerRef}
              className="absolute inset-0 overflow-y-auto p-5 space-y-4"
              animate={{ opacity: voiceActive ? 0 : 1 }}
              transition={{ duration: 0.4 }}
              style={{ pointerEvents: voiceActive ? "none" : "auto" }}
            >
              {showSuggestions && (
                <div className="rounded-lg border border-terminal-green/10 bg-terminal-green/[0.04] p-3 font-mono text-[11px] text-terminal-green/70 leading-relaxed">
                  <span className="text-terminal-green/40 mr-1">◆</span>
                  {openingLine}
                  {!openingDone && (
                    <span className="inline-block w-[6px] h-[10px] ml-0.5 bg-terminal-green/60 animate-pulse" />
                  )}
                </div>
              )}
              {(() => {
                const lastMsg = messages[messages.length - 1];
                const activeId = isLoading && lastMsg?.role === "assistant" ? lastMsg.id : null;
                return messages.map((m) => {
                  const text = extractText(m);
                  const isActive = m.id === activeId;
                  return (
                    <div key={m.id}>
                      {m.role === "user" ? (
                        <div className="flex gap-3 font-mono text-sm items-baseline">
                          <span className="text-primary shrink-0">❯</span>
                          <span className="text-foreground">{text}</span>
                        </div>
                      ) : (
                        <div className="flex gap-3 font-mono text-sm">
                          <span className="shrink-0 mt-0.5 gradient-text">◆</span>
                          <span className="text-muted-fg leading-relaxed whitespace-pre-wrap">
                            {!text ? (
                              <span className="flex items-center gap-2 text-muted-fg/60 text-xs">
                                <LoaderIcon />
                                thinking...
                              </span>
                            ) : isActive ? (
                              <TypewriterText text={text} active={true} />
                            ) : text}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </motion.div>

            {/* Plasma sphere — fills entire message area */}
            <AnimatePresence>
              {voiceActive && (
                <motion.div
                  ref={voiceContainerRef}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <PlasmaCanvas
                    state={sphereState}
                    caption={caption}
                    containerRef={voiceContainerRef as React.RefObject<HTMLDivElement>}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            className={`flex items-center border-t border-border/40 bg-background/30 px-5 transition-all duration-300 ${voiceActive ? "py-4 justify-center" : "py-3.5"}`}
          >
            {voiceActive ? (
              <button
                type="button"
                onClick={toggleVoice}
                title="End voice mode"
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/30 hover:bg-primary/20 transition-all duration-300"
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/20" style={{ animationDuration: "1.4s" }} />
                    <span className="absolute -inset-3 rounded-full animate-ping bg-blue-400/10" style={{ animationDuration: "1.4s", animationDelay: "0.4s" }} />
                  </>
                )}
                <WaveformIcon active={isListening} size={20} />
              </button>
            ) : (
              <>
                <span className="mr-3 font-mono text-xs text-primary/50 select-none">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-fg/40 focus:outline-none disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={toggleVoice}
                  title="Use voice mode"
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-md bg-card/50 text-muted-fg/60 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <WaveformIcon active={false} size={14} />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <SendIcon />
                </button>
              </>
            )}
          </form>
        </motion.div>

        {/* Suggestion pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="mt-4 flex flex-wrap gap-2"
        >
          {SUGGESTIONS.map((s) => {
            const isSchedule = s.startsWith("Schedule");
            return (
              <button
                key={s}
                onClick={() => sendMessage({ text: s })}
                disabled={isLoading}
                className={
                  isSchedule
                    ? "rounded-lg border border-primary/50 bg-primary/[0.07] px-3.5 py-2 font-mono text-[11px] text-primary/90 shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all duration-300 hover:border-primary/80 hover:bg-primary/[0.13] hover:shadow-[0_0_18px_hsl(var(--primary)/0.28)] disabled:opacity-30 flex items-center gap-1.5"
                    : "rounded-lg border border-border/40 bg-card/30 px-3.5 py-2 font-mono text-[11px] text-muted-fg/70 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.03] disabled:opacity-30"
                }
              >
                {isSchedule && (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="1" y="3" width="14" height="12" rx="1.5" />
                    <path d="M5 1v4M11 1v4M1 7h14" />
                  </svg>
                )}
                {s}
              </button>
            );
          })}
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
function WaveformIcon({ active = false, size = 16 }: { active?: boolean; size?: number }) {
  const relH = [0.45, 0.75, 1, 0.65, 0.4];
  const barW = size * 0.16;
  const gap = size * 0.12;
  const totalW = relH.length * barW + (relH.length - 1) * gap;
  return (
    <svg width={totalW} height={size} viewBox={`0 0 ${totalW} ${size}`} fill="currentColor" aria-hidden="true">
      {relH.map((h, i) => {
        const barH = size * h;
        const x = i * (barW + gap);
        return (
          <motion.rect
            key={i}
            x={x}
            width={barW}
            rx={barW / 2}
            animate={active ? {
              height: [barH, barH * 0.35, barH],
              y: [(size - barH) / 2, (size - barH * 0.35) / 2, (size - barH) / 2],
            } : {
              height: barH * 0.55,
              y: (size - barH * 0.55) / 2,
            }}
            transition={active ? {
              duration: 0.55 + i * 0.06,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.09,
            } : { duration: 0.25 }}
          />
        );
      })}
    </svg>
  );
}
