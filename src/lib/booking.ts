import type { HotSlot, Master } from "@/data/content";

export interface BookingIntent {
  slot?: HotSlot;
  master?: Master;
  serviceName?: string;
}

export interface BookingPayload {
  masterId: string;
  serviceName: string;
  date: string;
  time: string;
  guestName: string;
  guestPhone: string;
  notes?: string;
  source?: "web" | "ai" | "admin";
}

export interface BookingResult {
  ref: string;
  stylist: string;
  serviceName: string;
  date: string;
  time: string;
  guestName: string;
  whatsappUrl?: string;
}

export async function submitBooking(
  payload: BookingPayload,
): Promise<{ ok: true; booking: BookingResult } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Booking failed." };
    }
    return {
      ok: true,
      booking: {
        ref: data.booking.ref,
        stylist: data.booking.stylist,
        serviceName: data.booking.serviceName,
        date: data.booking.date,
        time: data.booking.time,
        guestName: data.booking.guestName,
        whatsappUrl: data.whatsappUrl,
      },
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
