import {
  MASTERS,
  OPENING_HOURS,
  SALON_INFO,
  SERVICES,
} from "@/data/content";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const GREETING =
  "Welcome to AURA Hair Space. I'm your salon guide — ask about services, pricing, our team, booking, or how to visit us in Singapore.";

function formatHours(): string {
  return OPENING_HOURS.map((h) => `${h.day}: ${h.hours}`).join("\n");
}

function formatTopServices(): string {
  return SERVICES.filter((s) => s.featured)
    .slice(0, 5)
    .map((s) => `· ${s.name} — ${s.price} (${s.duration})`)
    .join("\n");
}

function formatMasters(): string {
  return MASTERS.slice(0, 6)
    .map((m) => `· ${m.name} — ${m.role}, ${m.specialty}`)
    .join("\n");
}

export function getAiResponse(input: string): string {
  const q = input.toLowerCase().trim();

  if (!q) return "Please type your question — I'm here to help.";

  if (/hello|hi|hey|good (morning|afternoon|evening)/.test(q)) {
    return GREETING;
  }

  if (/book|appointment|reserve|slot|schedule/.test(q)) {
    return `We operate by appointment only. You can book via the "Hot Slots" section on our homepage or tap Book on any stylist card.\n\nThis week's openings are listed live on the site. For priority booking, WhatsApp us at ${SALON_INFO.whatsapp}.`;
  }

  if (/price|pricing|cost|how much|menu|service/.test(q)) {
    return `Here are our signature services:\n\n${formatTopServices()}\n\nOpen the Menu from the navigation to see the full price list. Final pricing depends on hair length and condition — consultations are complimentary.`;
  }

  if (/color|colour|blonde|balayage|platinum|toner|highlight/.test(q)) {
    const colorServices = SERVICES.filter((s) => s.category === "coloring")
      .slice(0, 6)
      .map((s) => `· ${s.name} — ${s.price}`)
      .join("\n");
    return `Our color specialists excel in lived-in blondes and Asian hair textures:\n\n${colorServices}\n\nRecommended: Yuki Tanaka (AirTouch) or Priya Sharma (Platinum).`;
  }

  if (/cut|trim|bob|fringe|bang/.test(q)) {
    return `Precision cuts start from S$95 (women) and S$75 (men). Elena Wong leads our cut team, with James Lim for men's grooming.\n\nBang trims are S$35 — no appointment needed for existing clients on weekdays before 14:00.`;
  }

  if (/treatment|scalp|keratin|olaplex|repair|frizz|humid/.test(q)) {
    return `For Singapore's climate, clients love our Scalp Detox Ritual (from S$110) and Keratin Smoothing (from S$380).\n\nMei Lin Chen specialises in scalp care and bond repair. Add Olaplex to any color service from S$65.`;
  }

  if (/master|stylist|team|who|yuki|priya|elena/.test(q)) {
    return `Our team of ${MASTERS.length} stylists:\n\n${formatMasters()}\n\nOpen Team from the navigation for full profiles.`;
  }

  if (/where|location|address|find|visit|direction|mrt|parking|dempsey/.test(q)) {
    return `Find us at:\n${SALON_INFO.address}\n\n${SALON_INFO.mrt}\n${SALON_INFO.parking}\n\nPhone: ${SALON_INFO.phone}\nEmail: ${SALON_INFO.email}`;
  }

  if (/hour|open|close|when|time|monday|sunday|weekend/.test(q)) {
    return `Opening hours:\n\n${formatHours()}\n\nWe're closed Mondays. Last appointment starts 90 minutes before closing.`;
  }

  if (/bridal|wedding|event|updo/.test(q)) {
    return `Amara Singh leads bridal and event styling. Bridal Hair Trial from S$280 (2 hrs), Event Updo from S$150.\n\nWe recommend booking your trial 6–8 weeks before your date.`;
  }

  if (/about|story|aura|philosophy|omotenashi/.test(q)) {
    return `AURA Hair Space was founded in Singapore — where Japanese hospitality (omotenashi) meets European color science.\n\nOur Dempsey Hill studio offers unhurried, private appointments. Open About from the navigation to read our full story.`;
  }

  if (/contact|whatsapp|phone|email|call/.test(q)) {
    return `Reach our concierge:\n\nPhone: ${SALON_INFO.phone}\nWhatsApp: ${SALON_INFO.whatsapp}\nEmail: ${SALON_INFO.email}`;
  }

  return `I'm not sure about that specific detail, but I can help with services, pricing, booking, our team, hours, or directions to ${SALON_INFO.district}.\n\nTry asking "What are your prices?" or "How do I book?" — or contact us at ${SALON_INFO.phone}.`;
}

export function getInitialMessage(): ChatMessage {
  return { role: "assistant", text: GREETING };
}
