"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAiResponse, getInitialMessage } from "@/lib/ai-responses";
import { useUiShell } from "@/components/UiShellProvider";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  "How do I book?",
  "Service prices",
  "Opening hours",
  "Visit us",
];

export default function AiAssistant() {
  const { isAnyOverlayOpen } = useUiShell();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAnyOverlayOpen) setOpen(false);
  }, [isAnyOverlayOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: getAiResponse(trimmed) },
      ]);
      setTyping(false);
    }, 600);
  };

  if (isAnyOverlayOpen) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-drawer shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:right-8"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
                  Concierge
                </p>
                <p className="font-display text-sm text-foreground">Salon Guide</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-foreground"
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex max-h-72 flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-hide"
            >
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`max-w-[90%] whitespace-pre-line rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-bordeaux text-white"
                      : "mr-auto border border-border bg-bg-muted text-muted"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {typing && (
                <div className="mr-auto rounded-xl border border-border bg-bg-muted px-3 py-2 text-xs text-dim">
                  ···
                </div>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-t border-border px-4 py-2 scrollbar-hide">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-dim transition-colors hover:border-bordeaux/30 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex border-t border-border"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services, booking..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-dim focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="px-4 text-sm text-bordeaux transition-opacity disabled:opacity-30"
                aria-label="Send message"
              >
                →
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux text-white shadow-[0_8px_32px_rgba(92,33,53,0.35)] sm:right-8"
        aria-label={open ? "Close salon guide" : "Open salon guide"}
      >
        {open ? (
          <span className="text-lg">✕</span>
        ) : (
          <span className="font-display text-xl">✦</span>
        )}
      </motion.button>
    </>
  );
}
