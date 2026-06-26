export type ModalId =
  | "menu"
  | "team"
  | "about"
  | "visit"
  | "privacy"
  | "cancellation";

export const MODAL_PREFIX = "modal-";

const VALID_MODALS: ModalId[] = [
  "menu",
  "team",
  "about",
  "visit",
  "privacy",
  "cancellation",
];

export function modalHash(id: ModalId): string {
  return `#${MODAL_PREFIX}${id}`;
}

export function parseModalHash(hash: string): ModalId | null {
  const id = hash.replace(/^#/, "");
  if (!id.startsWith(MODAL_PREFIX)) return null;
  const modalId = id.slice(MODAL_PREFIX.length) as ModalId;
  if (VALID_MODALS.includes(modalId)) return modalId;
  return null;
}

export interface ModalMeta {
  id: ModalId;
  title: string;
  subtitle: string;
  description?: string;
}

export const MODALS: ModalMeta[] = [
  {
    id: "menu",
    title: "Services & Pricing",
    subtitle: "Salon Menu",
    description: "All treatments and prices, organised by category.",
  },
  {
    id: "team",
    title: "Our Team",
    subtitle: "Stylists",
    description: "Meet the artists behind every transformation.",
  },
  {
    id: "about",
    title: "Craft rooted in ritual.",
    subtitle: "Our Story",
    description:
      "Japanese hospitality meets modern colour science in the heart of Singapore.",
  },
  {
    id: "visit",
    title: "Visit Us",
    subtitle: "Dempsey Hill · Singapore",
    description: "Hours, directions, and how to reach the studio.",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "Your data",
    description: "How AURA Hair Space collects, uses, and protects your information.",
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    subtitle: "Appointments",
    description: "Booking terms, notice periods, and our cancellation guidelines.",
  },
];

export function getModalMeta(id: ModalId): ModalMeta {
  return MODALS.find((m) => m.id === id)!;
}
