"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export default function FooterNewsletter() {
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="border border-border bg-card p-6 backdrop-blur-sm sm:p-8">
      <Label variant="gold">The Edit</Label>
      <h3 className="mt-2 font-display text-xl text-foreground">
        Salon notes &amp; quiet openings
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Occasional updates on new rituals, stylist availability, and seasonal
        care — never more than twice a month.
      </p>

      {submitted ? (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-sm text-bordeaux"
        >
          You&apos;re on the list. We&apos;ll be in touch.
        </motion.p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1"
          />
          <Button type="submit" variant="primary" className="sm:mb-0">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
