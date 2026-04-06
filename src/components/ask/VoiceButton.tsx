"use client";

import { useEffect, useRef, useState } from "react";
import { Waveform } from "./Waveform";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  isLoading: boolean;
  isPlaying: boolean;
}

export function VoiceButton({
  onTranscript,
  isLoading,
  isPlaying,
}: VoiceButtonProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
    };

    recognition.onresult = (e) => {
      const current = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onend = () => {
      setListening(false);
      if (transcript.trim()) {
        onTranscript(transcript.trim());
        setTranscript("");
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  if (supported === false) {
    return (
      <p className="font-mono text-[12px] text-muted text-center">
        Voice mode works best in Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Live transcript */}
      {(listening || transcript) && (
        <p className="font-mono text-[13px] text-muted max-w-sm text-center">
          {transcript || "Listening…"}
        </p>
      )}

      {/* Waveform while waiting for response */}
      <Waveform active={isLoading || isPlaying} />

      {/* Mic button */}
      {!isLoading && !isPlaying && (
        <button
          onClick={listening ? stopListening : startListening}
          className={`w-16 h-16 flex items-center justify-center border transition-all
            ${listening
              ? "border-map-heat bg-map-heat/10 animate-pulse"
              : "border-faint/40 hover:border-faint text-white"
            }`}
          aria-label={listening ? "Stop recording" : "Start recording"}
        >
          {listening ? (
            <span className="w-4 h-4 bg-map-heat block" />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white"
            >
              <rect x="7" y="1" width="6" height="11" rx="3" />
              <path d="M3 10a7 7 0 0 0 14 0M10 17v3" />
            </svg>
          )}
        </button>
      )}

      {!listening && !isLoading && !isPlaying && (
        <p className="font-mono text-[11px] text-muted/60">
          click mic, ask a question
        </p>
      )}
    </div>
  );
}
