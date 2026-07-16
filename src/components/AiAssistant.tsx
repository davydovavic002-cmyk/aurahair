"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { getInitialMessage } from "@/lib/salon-agent-shared";
import { useUiShell } from "@/components/UiShellProvider";
import { usePortfolioEmbed } from "@/components/PortfolioEmbedProvider";
import IconButton from "@/components/ui/IconButton";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  "What slots next Saturday?",
  "Service prices",
  "Book Yuki Tuesday 10:00",
  "Opening hours",
];

function TypingIndicator() {
  return (
    <div className="mr-auto flex gap-1 rounded-xl border border-border bg-bg-muted px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-dim"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function AiAssistant() {
  const embedded = usePortfolioEmbed();
  const { isAnyOverlayOpen } = useUiShell();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useMemo(
    () => `web-${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  useEffect(() => {
    if (isAnyOverlayOpen) setOpen(false);
  }, [isAnyOverlayOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", text: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text ?? data.error ?? "Something went wrong.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I couldn't reach the salon desk just now. Please try again.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  if (embedded || isAnyOverlayOpen) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-drawer shadow-elevated sm:right-8"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-label text-gold">Concierge</p>
                <p className="font-display text-sm text-foreground">
                  Salon Guide · live desk
                </p>
              </div>
              <IconButton size="sm" bordered={false} onClick={() => setOpen(false)} aria-label="Close assistant">
                <X className="h-4 w-4" />
              </IconButton>
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
              {typing && <TypingIndicator />}
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-t border-border px-4 py-2 scrollbar-hide">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="focus-ring shrink-0 rounded-full border border-border px-3 py-1 text-label-sm uppercase tracking-[0.12em] text-dim transition-colors hover:border-bordeaux/30 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
              className="flex border-t border-border"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or book a stylist…"
                className="focus-ring flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-dim"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="focus-ring px-4 text-bordeaux transition-opacity disabled:opacity-30"
                aria-label="Send message"
              >
                {typing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
        className="focus-ring fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux text-white shadow-fab sm:right-8"
        aria-label={open ? "Close salon guide" : "Open salon guide"}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
      </motion.button>
    </>
  );
}
