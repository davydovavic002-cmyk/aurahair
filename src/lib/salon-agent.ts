/**
 * AURA salon concierge agent — simulated intent router backed by salon-db.
 *
 * Manual test prompts:
 * 1. "What slots next Saturday?"
 * 2. "Book Yuki Tuesday 10:00 — name Alex Tan, phone +65 9123 0000"
 * 3. "Cancel AURA-1001" (use ref from step 2)
 * 4. "Service prices" / "Who does balayage?"
 */

import "server-only";

import {
  cancelBooking,
  createBooking,
  findMaster,
  findService,
  formatSlotLabel,
  getBookingByRef,
  getMasters,
  getServices,
  listAvailability,
  listHotOpenSlots,
} from "@/lib/salon-db";
import {
  findDateByWeekday,
  getUpcomingDays,
  toDateKey,
  weekdayLong,
} from "@/lib/salon-schedule";
import { OPENING_HOURS, SALON_INFO } from "@/data/content";
import {
  getInitialMessage,
  type ChatMessage,
} from "@/lib/salon-agent-shared";

export type { ChatMessage };
export { getInitialMessage };

export interface AgentReply {
  text: string;
  bookingRef?: string;
}

type Intent =
  | "greeting"
  | "hours"
  | "prices"
  | "services"
  | "masters"
  | "location"
  | "availability"
  | "book"
  | "cancel"
  | "my_booking"
  | "faq_fallback";

interface PendingBook {
  masterId?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  guestName?: string;
  guestPhone?: string;
}

const pendingBySession = new Map<string, PendingBook>();

function detectIntent(q: string): Intent {
  if (/hello|hi\b|hey|good (morning|afternoon|evening)/.test(q))
    return "greeting";
  if (/cancel|cancelation|cancellation/.test(q)) return "cancel";
  if (/my booking|booking ref|confirmation|aura-\d+/i.test(q))
    return "my_booking";
  if (
    /book|reserve|appointment|schedule/.test(q) ||
    (/\d{1,2}:\d{2}/.test(q) &&
      /(mon|tue|wed|thu|fri|sat|sun|tomorrow|today)/i.test(q))
  )
    return "book";
  if (/slot|available|availability|openings|free/.test(q))
    return "availability";
  if (/price|pricing|cost|how much|menu/.test(q)) return "prices";
  if (/service|treatment|color|colour|cut|balayage|keratin/.test(q))
    return "services";
  if (/master|stylist|team|who|yuki|priya|elena|mei|sofia|james|amara|hiro/.test(q))
    return "masters";
  if (/where|location|address|visit|direction|mrt|parking|dempsey/.test(q))
    return "location";
  if (/hour|open|close|when.*open|monday|sunday|weekend/.test(q))
    return "hours";
  return "faq_fallback";
}

function parseTime(q: string): string | undefined {
  const m = q.match(/\b(\d{1,2}):(\d{2})\b/);
  if (!m) return undefined;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function parseWeekdayDate(q: string): string | undefined {
  if (/today/.test(q)) return toDateKey(new Date());
  if (/tomorrow/.test(q)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateKey(d);
  }

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  for (const day of days) {
    if (q.includes(day)) {
      const capital = day.charAt(0).toUpperCase() + day.slice(1);
      const upcoming = getUpcomingDays(14);
      const match =
        upcoming.find((d) => weekdayLong(d) === capital && d >= startOfToday()) ??
        findDateByWeekday(capital, upcoming);
      if (match) return toDateKey(match);
    }
  }
  return undefined;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseMaster(q: string) {
  for (const m of getMasters()) {
    const first = m.name.split(" ")[0].toLowerCase();
    if (q.includes(m.name.toLowerCase()) || q.includes(first)) return m;
  }
  return undefined;
}

function parseService(q: string) {
  const featured = getServices().filter((s) => s.featured);
  for (const s of [...featured, ...getServices()]) {
    if (q.includes(s.name.toLowerCase())) return s;
  }
  if (/balayage/.test(q)) return findService("Full Head Balayage");
  if (/consultation|consult/.test(q)) return undefined;
  return undefined;
}

function parseName(q: string): string | undefined {
  const m =
    q.match(/(?:name[:\s]+)([a-z][a-z\s.'-]{1,40})/i) ||
    q.match(/\b(?:i'?m|i am)\s+([a-z][a-z\s.'-]{1,40})/i);
  return m?.[1]?.trim();
}

function parsePhone(q: string): string | undefined {
  const m = q.match(/(\+?\d[\d\s()-]{7,}\d)/);
  return m?.[1]?.replace(/\s+/g, " ").trim();
}

function parseRef(q: string): string | undefined {
  const m = q.match(/AURA-\d+/i);
  return m?.[0]?.toUpperCase();
}

function mergePending(sessionId: string, patch: PendingBook): PendingBook {
  const next = { ...pendingBySession.get(sessionId), ...patch };
  pendingBySession.set(sessionId, next);
  return next;
}

function clearPending(sessionId: string) {
  pendingBySession.delete(sessionId);
}

function formatHours(): string {
  return OPENING_HOURS.map((h) => `${h.day}: ${h.hours}`).join("\n");
}

function handleAvailability(q: string): string {
  const date = parseWeekdayDate(q);
  const master = parseMaster(q);

  if (date) {
    const slots = listAvailability({
      date,
      masterId: master?.id,
      onlyOpen: true,
    }).slice(0, 12);

    if (!slots.length) {
      return master
        ? `No open slots for ${master.name} on ${date}. Try another day or stylist.`
        : `No open slots on ${date}. We are closed Mondays — try another day.`;
    }

    const lines = slots.map((s) => `· ${formatSlotLabel(s)}`);
    return `Openings${master ? ` with ${master.name}` : ""} on ${date}:\n\n${lines.join("\n")}\n\nSay e.g. "Book Yuki ${weekdayLong(new Date(date + "T12:00:00"))} ${slots[0].time}, name …, phone …"`;
  }

  const hot = listHotOpenSlots(6).map((s) => `· ${formatSlotLabel(s)}`);
  return `Next openings:\n\n${hot.join("\n")}\n\nAsk "What slots next Saturday?" or book with a stylist, day, and time.`;
}

function handleBook(q: string, sessionId: string): AgentReply {
  const pending = mergePending(sessionId, {
    masterId: parseMaster(q)?.id ?? pendingBySession.get(sessionId)?.masterId,
    serviceName:
      parseService(q)?.name ?? pendingBySession.get(sessionId)?.serviceName,
    date: parseWeekdayDate(q) ?? pendingBySession.get(sessionId)?.date,
    time: parseTime(q) ?? pendingBySession.get(sessionId)?.time,
    guestName: parseName(q) ?? pendingBySession.get(sessionId)?.guestName,
    guestPhone: parsePhone(q) ?? pendingBySession.get(sessionId)?.guestPhone,
  });

  // Refresh with latest parse
  const master = parseMaster(q);
  const service = parseService(q);
  const date = parseWeekdayDate(q);
  const time = parseTime(q);
  const guestName = parseName(q);
  const guestPhone = parsePhone(q);

  const state = mergePending(sessionId, {
    ...(master ? { masterId: master.id } : {}),
    ...(service ? { serviceName: service.name } : {}),
    ...(date ? { date } : {}),
    ...(time ? { time } : {}),
    ...(guestName ? { guestName } : {}),
    ...(guestPhone ? { guestPhone } : {}),
  });

  const missing: string[] = [];
  if (!state.masterId) missing.push("stylist (e.g. Yuki)");
  if (!state.date) missing.push("day (e.g. Tuesday / tomorrow)");
  if (!state.time) missing.push("time (e.g. 10:00)");
  if (!state.guestName) missing.push("your name");
  if (!state.guestPhone) missing.push("phone");

  if (missing.length) {
    return {
      text: `I can reserve that — still need: ${missing.join(", ")}.\n\nExample:\nBook Yuki Tuesday 10:00 — name Alex Tan, phone +65 9123 0000`,
    };
  }

  const result = createBooking({
    masterId: state.masterId!,
    serviceName: state.serviceName ?? "Signature Consultation",
    date: state.date!,
    time: state.time!,
    guestName: state.guestName!,
    guestPhone: state.guestPhone!,
    source: "ai",
  });

  if (!result.ok) {
    return { text: `Could not book: ${result.error}` };
  }

  clearPending(sessionId);
  const stylist = findMaster(result.booking.masterId)?.name;
  return {
    bookingRef: result.booking.ref,
    text: `Confirmed · ${result.booking.ref}\n\n${result.booking.serviceName}\nStylist — ${stylist}\n${result.booking.date} at ${result.booking.time}\nGuest — ${result.booking.guestName}\n\nA confirmation email was logged on the desk.\nWhatsApp: ${result.whatsappUrl}\n\nCancel anytime: "Cancel ${result.booking.ref}".`,
  };
}

function handleCancel(q: string): AgentReply {
  const ref = parseRef(q);
  if (!ref) {
    return {
      text: 'Share your booking ref, e.g. "Cancel AURA-1001".',
    };
  }
  const result = cancelBooking(ref);
  if (!result.ok) return { text: result.error };
  return {
    text: `Cancelled ${result.booking.ref}. That slot is open again for others.`,
  };
}

function handleMyBooking(q: string): string {
  const ref = parseRef(q);
  if (!ref) {
    return 'Paste your ref (AURA-####) and I will look it up.';
  }
  const b = getBookingByRef(ref);
  if (!b) return `No booking found for ${ref}.`;
  const stylist = findMaster(b.masterId)?.name;
  return `${b.ref} · ${b.status}\n${b.serviceName}\n${stylist} — ${b.date} ${b.time}\nGuest — ${b.guestName}`;
}

export function runSalonAgent(
  messages: ChatMessage[],
  sessionId = "default",
): AgentReply {
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last?.text.trim()) {
    return { text: "Please type your question — I'm here to help." };
  }

  const q = last.text.toLowerCase().trim();
  const intent = detectIntent(q);

  // Continue pending book if user is supplying missing fields
  if (pendingBySession.has(sessionId) && intent !== "cancel") {
    return handleBook(q, sessionId);
  }

  switch (intent) {
    case "greeting":
      return {
        text: "Welcome to AURA Hair Space. I can check live openings, book or cancel appointments, and answer about services, prices, team, and visit info.\n\nTry: \"What slots next Saturday?\" or \"Book Yuki Tuesday 10:00\".",
      };
    case "hours":
      return {
        text: `Opening hours:\n\n${formatHours()}\n\nClosed Mondays. Last appointment starts 90 minutes before closing.`,
      };
    case "prices":
    case "services": {
      const lines = getServices()
        .filter((s) => s.featured)
        .slice(0, 6)
        .map((s) => `· ${s.name} — ${s.price} (${s.duration})`)
        .join("\n");
      return {
        text: `Signature services:\n\n${lines}\n\nFull menu is under Menu. Final pricing depends on hair length — consultations are complimentary.`,
      };
    }
    case "masters": {
      const lines = getMasters()
        .map((m) => `· ${m.name} — ${m.role}, ${m.specialty}`)
        .join("\n");
      return { text: `Our team:\n\n${lines}` };
    }
    case "location":
      return {
        text: `Find us at:\n${SALON_INFO.address}\n\n${SALON_INFO.mrt}\n${SALON_INFO.parking}\n\nPhone: ${SALON_INFO.phone}\nWhatsApp: ${SALON_INFO.whatsapp}`,
      };
    case "availability":
      return { text: handleAvailability(q) };
    case "book":
      return handleBook(q, sessionId);
    case "cancel":
      return handleCancel(q);
    case "my_booking":
      return { text: handleMyBooking(q) };
    default:
      return {
        text: `I can help with services, pricing, booking, our team, hours, or directions.\n\nTry "What are your prices?" or "Book Yuki Tuesday 10:00, name …, phone …".`,
      };
  }
}
