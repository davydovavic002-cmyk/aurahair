"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Label from "@/components/ui/Label";
import { useHotSlots } from "@/lib/use-hot-slots";
import SlotSkeleton from "@/components/SlotSkeleton";
import type { HotSlot } from "@/data/content";
import { MASTERS } from "@/data/content";
import { submitBooking, type BookingIntent } from "@/lib/booking";
import { BOOK_CTA_LIGHT } from "@/lib/interactive";
import BookingStepIndicator from "@/components/BookingStepIndicator";
import SuccessCheckmark from "@/components/SuccessCheckmark";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useBookingAvailability } from "@/lib/use-booking-availability";
import {
  getTimesForDate,
  getWeekDays,
  findDateByWeekday,
  isPastDay,
  isSalonClosed,
  isDayBookable,
  canNavigateWeek,
  formatWeekRange,
  getWeekOffsetForDate,
  parseDateKey,
  toDateKey,
  weekdayLong,
} from "@/lib/salon-schedule";

interface HotSlotsProps {
  onBook: (slot?: HotSlot) => void;
}

export default function HotSlots({ onBook }: HotSlotsProps) {
  const reduced = useReducedMotion();
  const { slots, loading, live, weekLabel, empty } = useHotSlots();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="border border-bordeaux/20 bg-bordeaux p-5 text-white sm:p-7 lg:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Label variant="gold" className="text-white/90">
              {live ? `Live · ${weekLabel}` : weekLabel}
            </Label>
            <h2 className="mt-1 font-display text-xl sm:text-2xl">
              Available Slots
            </h2>
          </div>
          <span className="relative flex h-2 w-2" title={live ? "Live from salon desk" : undefined}>
            <span className={`absolute inline-flex h-full w-full rounded-full bg-gold opacity-40 ${live ? "animate-ping" : ""}`} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SlotSkeleton key={i} />)
          ) : empty ? (
            <p className="col-span-full border border-white/10 px-4 py-6 text-center text-sm text-white/60">
              No open slots this week — pick another date below.
            </p>
          ) : (
            slots.map((slot, index) => (
            <motion.button
              key={slot.id}
              type="button"
              disabled={!slot.available}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
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
                <span className="text-label-sm text-white/30">Taken</span>
              )}
            </motion.button>
          ))
          )}
        </div>

        <button
          type="button"
          onClick={() => onBook()}
          disabled={loading}
          className="focus-ring mt-5 w-full border border-gold/40 bg-gold/10 py-3.5 text-label uppercase tracking-[0.2em] text-gold transition-all duration-300 hover:bg-gold/20 disabled:opacity-40"
        >
          Choose another date & time
        </button>
      </div>
    </motion.div>
  );
}

function resolveMasterId(intent?: BookingIntent): string {
  if (intent?.master?.id) return intent.master.id;
  if (intent?.slot?.masterId) return intent.slot.masterId;
  if (intent?.slot?.stylist) {
    const stylist = intent.slot.stylist.toLowerCase();
    const match = MASTERS.find(
      (m) =>
        m.name.toLowerCase().includes(stylist.replace(/\./g, "")) ||
        m.name.split(" ")[0].toLowerCase().startsWith(stylist.split(" ")[0].toLowerCase()),
    );
    if (match) return match.id;
  }
  return MASTERS[0]?.id ?? "m1";
}

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  intent?: BookingIntent;
}

type Step = "calendar" | "details" | "success";

export function BookingDrawer({
  isOpen,
  onClose,
  intent,
}: BookingDrawerProps) {
  const reduced = useReducedMotion();
  const preselectedSlot = intent?.slot;
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("calendar");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [masterId, setMasterId] = useState("m1");

  const weekDays = useMemo(() => getWeekDays(new Date(), weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => formatWeekRange(weekDays), [weekDays]);
  const canGoPrev = canNavigateWeek(weekOffset, "prev");
  const canGoNext = canNavigateWeek(weekOffset, "next");

  const {
    slotsByDate,
    datesWithSlots,
    loading: availabilityLoading,
    error: availabilityError,
  } = useBookingAvailability(weekDays, masterId);

  const availableTimes = useMemo(() => {
    if (!selectedDate || availabilityLoading) return [];
    const scheduleTimes = getTimesForDate(selectedDate);
    const dateKey = toDateKey(selectedDate);
    const openSlots = slotsByDate[dateKey];
    if (availabilityError) return scheduleTimes;
    if (!openSlots?.length) return [];
    return scheduleTimes.filter((time) => openSlots.includes(time));
  }, [selectedDate, slotsByDate, availabilityLoading, availabilityError]);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setBookingRef(null);
    setWhatsappUrl(null);
    setSubmitting(false);
    setMasterId(resolveMasterId(intent));
    setGuestName("");
    setGuestPhone("");
    setNotes("");
    setWeekOffset(0);

    if (preselectedSlot) {
      const match = preselectedSlot.date
        ? parseDateKey(preselectedSlot.date)
        : findDateByWeekday(preselectedSlot.day, getWeekDays());
      if (match && isDayBookable(match)) {
        setWeekOffset(getWeekOffsetForDate(match));
        setSelectedDate(match);
        setSelectedTime(preselectedSlot.time);
        setStep("details");
      } else {
        setSelectedDate(null);
        setSelectedTime(null);
        setStep("calendar");
        setError(
          "That hotspot is no longer bookable — pick another date.",
        );
      }
    } else {
      setSelectedDate(null);
      setSelectedTime(null);
      setStep("calendar");
    }
  }, [isOpen, preselectedSlot, intent]);

  const handleClose = useCallback(() => {
    onClose();
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

  const serviceLabel = intent?.serviceName ?? "Signature Consultation";
  const stylistLabel =
    intent?.master?.name ??
    MASTERS.find((m) => m.id === masterId)?.name ??
    preselectedSlot?.stylist;

  const goToWeek = (offset: number) => {
    setWeekOffset(offset);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);

    const result = await submitBooking({
      masterId,
      serviceName: serviceLabel,
      date: toDateKey(selectedDate),
      time: selectedTime,
      guestName,
      guestPhone,
      notes,
      source: "web",
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBookingRef(result.booking.ref);
    setWhatsappUrl(result.booking.whatsappUrl ?? null);
    setStep("success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="embed-overlay fixed inset-0 z-[70] bg-[var(--overlay)] backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="embed-dialog-root pointer-events-none fixed inset-0 z-[70] flex items-end justify-center p-0 lg:items-center lg:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Book your visit"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="embed-dialog pointer-events-auto flex max-h-[min(90vh,900px)] w-full max-w-content flex-col overflow-hidden rounded-t-2xl bg-drawer shadow-elevated lg:rounded-2xl lg:border lg:border-border"
            >
            <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-drawer/95 backdrop-blur-md">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-label text-dim">Reserve</p>
                  <h3 className="font-display text-xl text-foreground">
                    {step === "success"
                      ? "You're booked"
                      : step === "details"
                        ? "Your details"
                        : "Book Your Visit"}
                  </h3>
                </div>
                <IconButton size="sm" onClick={handleClose} aria-label="Close">
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <BookingStepIndicator current={step} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-8">
              {error && step !== "success" && (
                <p className="mb-4 border border-bordeaux/30 bg-bordeaux-soft px-3 py-2 text-xs text-bordeaux">
                  {error}
                </p>
              )}

              {step === "calendar" && (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted">Select a date</p>
                    <div className="flex items-center gap-1.5">
                      <IconButton
                        size="sm"
                        onClick={() => goToWeek(weekOffset - 1)}
                        disabled={!canGoPrev}
                        aria-label="Previous week"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </IconButton>
                      <span className="min-w-[7.5rem] text-center text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
                        {weekLabel}
                      </span>
                      <IconButton
                        size="sm"
                        onClick={() => goToWeek(weekOffset + 1)}
                        disabled={!canGoNext}
                        aria-label="Next week"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>

                  {availabilityError && (
                    <p className="mb-3 text-xs text-dim">{availabilityError}</p>
                  )}

                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((date) => {
                      const past = isPastDay(date);
                      const closed = isSalonClosed(date);
                      const beyond = !isDayBookable(date) && !past && !closed;
                      const disabled = past || closed || beyond;
                      const selected =
                        selectedDate && isSameDay(date, selectedDate);
                      const dateKey = toDateKey(date);
                      const hasSlots =
                        !availabilityLoading &&
                        datesWithSlots.has(dateKey);
                      const noSlots =
                        !availabilityLoading &&
                        isDayBookable(date) &&
                        !datesWithSlots.has(dateKey);
                      return (
                        <button
                          key={dateKey}
                          type="button"
                          disabled={disabled}
                          title={
                            closed
                              ? "Closed"
                              : beyond
                                ? "Too far ahead"
                                : noSlots
                                  ? "No open slots"
                                  : weekdayLong(date)
                          }
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                          className={`relative flex flex-col items-center rounded-sm py-2.5 text-center transition-all duration-200 ${
                            disabled
                              ? "cursor-not-allowed opacity-30"
                              : selected
                                ? "bg-bordeaux text-white"
                                : noSlots
                                  ? "opacity-50 hover:bg-bg-muted"
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
                          {hasSlots && !selected && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-gold" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div
                        initial={reduced ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduced ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: reduced ? 0 : 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="mb-3 mt-6 text-sm text-muted">
                          Available times — {formatDay(selectedDate)}
                        </p>
                        {availabilityLoading ? (
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-10 animate-pulse border border-border bg-bg-muted"
                              />
                            ))}
                          </div>
                        ) : availableTimes.length === 0 ? (
                          <p className="text-xs text-dim">
                            No bookable times this day — try another date or week.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {availableTimes.map((time) => (
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
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep("details")}
                    className="focus-ring mt-6 w-full bg-bordeaux py-3.5 text-label uppercase tracking-[0.2em] text-white transition-opacity disabled:opacity-30"
                  >
                    Continue
                  </button>
                </>
              )}

              {step === "details" && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="rounded-md border border-border p-5">
                    <p className="text-label text-gold">Appointment</p>
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
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Input
                      label="Full name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      autoComplete="name"
                      placeholder="Alex Tan"
                    />
                    <Input
                      label="Phone / WhatsApp"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="+65 9123 4567"
                    />
                    <Input
                      label="Notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="First visit, colour consult…"
                    />
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    disabled={
                      submitting ||
                      guestName.trim().length < 2 ||
                      guestPhone.trim().length < 8
                    }
                    onClick={confirmBooking}
                    className="mt-4"
                  >
                    {submitting ? "Confirming…" : "Confirm Booking"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      if (selectedDate) {
                        setWeekOffset(getWeekOffsetForDate(selectedDate));
                      }
                      setStep("calendar");
                    }}
                    className="focus-ring mt-2 w-full py-3 text-label uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
                  >
                    ← Change date & time
                  </button>
                </motion.div>
              )}

              {step === "success" && bookingRef && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <SuccessCheckmark />
                  <p className="mt-5 text-label text-gold">Confirmed</p>
                  <p className="mt-3 font-display text-3xl text-foreground">
                    {bookingRef}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {serviceLabel} with {stylistLabel}
                    <br />
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at {selectedTime}
                  </p>
                  <p className="mt-3 text-xs text-dim">
                    Confirmation email logged on the salon desk. Save your ref
                    for the AI concierge.
                  </p>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring mt-5 block w-full border border-bordeaux/30 py-3.5 text-label uppercase tracking-[0.2em] text-bordeaux transition-colors hover:bg-bordeaux-soft"
                    >
                      Confirm on WhatsApp
                    </a>
                  )}
                  <Button variant="primary" fullWidth onClick={handleClose} className="mt-3">
                    Done
                  </Button>
                </motion.div>
              )}
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
