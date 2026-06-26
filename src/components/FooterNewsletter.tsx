"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="border border-border bg-card p-6 backdrop-blur-sm sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
        The Edit
      </p>
      <h3 className="mt-2 font-display text-xl text-foreground">
        Salon notes &amp; quiet openings
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Occasional updates on new rituals, stylist availability, and seasonal
        care — never more than twice a month.
      </p>

      {submitted ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-sm text-bordeaux"
        >
          You&apos;re on the list. We&apos;ll be in touch.
        </motion.p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-dim focus:border-bordeaux focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 bg-bordeaux px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
