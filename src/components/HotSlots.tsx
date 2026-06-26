"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HotSlot } from "@/data/content";
import type { BookingIntent } from "@/lib/booking";
import { BOOK_CTA_LIGHT } from "@/lib/interactive";

interface HotSlotsProps {
  slots: HotSlot[];
  onBook: (slot?: HotSlot) => void;
}

export default function HotSlots({ slots, onBook }: HotSlotsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="border border-bordeaux/20 bg-bordeaux p-5 text-white sm:p-7 lg:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
              This week
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl">
              Available Slots
            </h2>
          </div>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {slots.map((slot, index) => (
            <motion.button
              key={slot.id}
              type="button"
              disabled={!slot.available}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              onClick={() => slot.available && onBook(slot)}
              className={`group flex items-center justify-between border px-4 py-3.5 text-left transition-all duration-300 ${
                slot.available
                  ? "cursor-pointer border-white/10 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/5"
                  : "cursor-not-allowed border-white/5 opacity-40"
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {slot.day}{" "}
                  <span className="text-gold">{slot.time}</span>
                </p>
                <p className="mt-0.5 text-xs text-white/50">{slot.stylist}</p>
              </div>
              {slot.available ? (
                <span className={BOOK_CTA_LIGHT}>Reserve</span>
              ) : (
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/30">
                  Taken
                </span>
              )}
            </motion.button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onBook()}
          className="mt-5 w-full border border-gold/40 bg-gold/10 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-gold transition-all duration-300 hover:bg-gold/20"
        >
          Choose another date & time
        </button>
      </div>
    </motion.div>
  );
}

function getWeekDays(): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  intent?: BookingIntent;
}

export function BookingDrawer({
  isOpen,
  onClose,
  intent,
}: BookingDrawerProps) {
  const preselectedSlot = intent?.slot;
  const hasPresetSlot = !!preselectedSlot;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"calendar" | "confirm">("calendar");
  const weekDays = useMemo(() => getWeekDays(), []);

  useEffect(() => {
    if (!isOpen) return;

    if (preselectedSlot) {
      const match = weekDays.find(
        (d) =>
          d.toLocaleDateString("en-US", { weekday: "long" }) ===
          preselectedSlot.day
      );
      if (match) setSelectedDate(match);
      setSelectedTime(preselectedSlot.time);
      setStep("confirm");
    } else {
      setSelectedDate(null);
      setSelectedTime(null);
      setStep("calendar");
    }
  }, [isOpen, preselectedSlot, weekDays]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setSelectedDate(null);
      setSelectedTime(null);
      setStep("calendar");
    }, 400);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, handleClose]);

  const formatDay = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const serviceLabel =
    intent?.serviceName ?? "Signature Consultation";

  const stylistLabel =
    intent?.master?.name ?? preselectedSlot?.stylist;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-[var(--overlay)] backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[90vh] max-w-content overflow-y-auto rounded-t-2xl bg-drawer shadow-2xl lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:max-h-[85vh] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-none lg:border lg:border-border"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-drawer/95 px-5 py-4 backdrop-blur-md">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-dim">
                  Reserve
                </p>
                <h3 className="font-display text-xl text-foreground">
                  {step === "confirm" && hasPresetSlot
                    ? "Confirm Your Slot"
                    : "Book Your Visit"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center border border-border text-muted transition-colors hover:border-bordeaux/30 hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 pb-8">
              {step === "calendar" ? (
                <>
                  <p className="mb-3 text-sm text-muted">Select a date</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((date) => {
                      const past = isPast(date);
                      const selected =
                        selectedDate && isSameDay(date, selectedDate);
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={past}
                          onClick={() => setSelectedDate(date)}
                          className={`flex flex-col items-center rounded-sm py-2.5 text-center transition-all duration-200 ${
                            past
                              ? "cursor-not-allowed opacity-30"
                              : selected
                                ? "bg-bordeaux text-white"
                                : "hover:bg-bg-muted"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wider opacity-60">
                            {date.toLocaleDateString("en-US", {
                              weekday: "narrow",
                            })}
                          </span>
                          <span className="mt-0.5 text-sm font-medium">
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="mb-3 mt-6 text-sm text-muted">
                          Available times — {formatDay(selectedDate)}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_SLOTS.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`border py-2.5 text-sm transition-all duration-200 ${
                                selectedTime === time
                                  ? "border-bordeaux bg-bordeaux text-white"
                                  : "border-border text-muted hover:border-bordeaux/30"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep("confirm")}
                    className="mt-6 w-full bg-bordeaux py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-opacity disabled:opacity-30"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="border border-border p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
                      Confirmation
                    </p>
                    <h4 className="mt-3 font-display text-2xl text-foreground">
                      {serviceLabel}
                    </h4>
                    <div className="mt-4 space-y-2 text-sm text-muted">
                      {stylistLabel && (
                        <p>
                          <span className="text-dim">Stylist —</span>{" "}
                          {stylistLabel}
                        </p>
                      )}
                      <p>
                        <span className="text-dim">Date —</span>{" "}
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>
                        <span className="text-dim">Time —</span> {selectedTime}
                      </p>
                      <p>
                        <span className="text-dim">Studio —</span> AURA Hair
                        Space, Dempsey Hill · Singapore
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 w-full bg-bordeaux py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      hasPresetSlot ? handleClose() : setStep("calendar")
                    }
                    className="mt-2 w-full py-3 text-xs font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
                  >
                    {hasPresetSlot ? "Cancel" : "← Change date & time"}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}