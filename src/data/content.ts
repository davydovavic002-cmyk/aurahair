export type HairConcern =
  | "dry-ends"
  | "color-fading"
  | "volume-loss"
  | "frizz"
  | "scalp-sensitivity"
  | "damage";

export interface HairConcernData {
  id: HairConcern;
  label: string;
  service: string;
  serviceDetail: string;
  tip: string;
}

export interface HotSlot {
  id: string;
  day: string;
  time: string;
  stylist: string;
  available: boolean;
}

export interface Master {
  id: string;
  name: string;
  role: string;
  badge: string;
  specialty: string;
  categories: ServiceFilter[];
  bgImage: string;
  avatar: string;
  bio?: string;
  experience?: string;
}

export type ServiceFilter =
  | "coloring"
  | "cuts"
  | "care"
  | "treatments"
  | "styling";

export interface Service {
  id: string;
  name: string;
  category: ServiceFilter;
  duration: string;
  price: string;
  description: string;
  featured?: boolean;
}

export interface SalonInfo {
  city: string;
  district: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  mrt: string;
  parking: string;
}

export const SALON_INFO: SalonInfo = {
  city: "Singapore",
  district: "Dempsey Hill",
  country: "Singapore",
  address: "8D Dempsey Road, #02-12, Singapore 249672",
  phone: "+65 6234 8890",
  email: "hello@aurahair.sg",
  whatsapp: "+65 9123 4567",
  mrt: "Nearest: Orchard MRT · 8 min by taxi",
  parking: "Complimentary valet at Dempsey Hill",
};

export const OPENING_HOURS = [
  { day: "Monday", hours: "Closed" },
  { day: "Tuesday – Friday", hours: "10:00 – 20:00" },
  { day: "Saturday", hours: "09:00 – 19:00" },
  { day: "Sunday", hours: "10:00 – 17:00" },
];

export const NAV_LINKS = [
  { href: "#modal-menu", label: "Menu" },
  { href: "#modal-team", label: "Team" },
  { href: "#booking", label: "Book" },
  { href: "#modal-visit", label: "Visit" },
  { href: "#modal-about", label: "About" },
];

export const SERVICE_FILTERS: { id: ServiceFilter; label: string }[] = [
  { id: "coloring", label: "Coloring" },
  { id: "cuts", label: "Cuts" },
  { id: "care", label: "Care" },
  { id: "treatments", label: "Treatments" },
  { id: "styling", label: "Styling" },
];

/** Hero stylist browse — distinct from service menu categories */
export const STYLIST_FILTERS: { id: ServiceFilter; label: string }[] = [
  { id: "coloring", label: "Colorists" },
  { id: "cuts", label: "Cut & Style" },
  { id: "care", label: "Care" },
  { id: "treatments", label: "Treatments" },
  { id: "styling", label: "Styling" },
];

export const TAGLINE = "Search for your Stylist.";

export const STUDIO_BIO =
  "Omotenashi meets precision craft. Our concierge welcomes you at Dempsey Hill — by appointment, always at your service.";

export const STUDIO_TAGLINE_ASIA =
  "Where Japanese ritual meets modern luxury.";

export const MASTERS: Master[] = [
  {
    id: "m1",
    name: "Yuki Tanaka",
    role: "Creative Director",
    badge: "Master",
    specialty: "Couture Blonde · AirTouch",
    categories: ["coloring", "treatments"],
    bgImage: "/images/lookbook-process.jpg",
    avatar: "/images/lookbook-platinum.jpg",
    bio: "Trained in Tokyo and Paris. Pioneer of AirTouch technique in Southeast Asia.",
    experience: "18 years",
  },
  {
    id: "m2",
    name: "Priya Sharma",
    role: "Senior Colorist",
    badge: "Expert",
    specialty: "Platinum · Toner Architecture",
    categories: ["coloring", "care"],
    bgImage: "/images/lookbook-texture.jpg",
    avatar: "/images/hero.jpg",
    bio: "Specialist in cool-toned blondes and corrective color for Asian hair textures.",
    experience: "12 years",
  },
  {
    id: "m3",
    name: "Elena Wong",
    role: "Cut & Style Lead",
    badge: "Senior",
    specialty: "Precision Cut · Editorial",
    categories: ["cuts", "styling"],
    bgImage: "/images/lookbook-cut.jpg",
    avatar: "/images/lookbook-platinum.jpg",
    bio: "Architectural cuts with a soft, wearable finish for tropical climates.",
    experience: "14 years",
  },
  {
    id: "m4",
    name: "James Lim",
    role: "Men's Grooming Lead",
    badge: "Senior",
    specialty: "Textured Crop · Beard Design",
    categories: ["cuts", "styling"],
    bgImage: "/images/lookbook-space.jpg",
    avatar: "/images/lookbook-process.jpg",
    bio: "Modern men's grooming with clean lines and effortless styling.",
    experience: "10 years",
  },
  {
    id: "m5",
    name: "Mei Lin Chen",
    role: "Treatment Specialist",
    badge: "Expert",
    specialty: "Scalp Ritual · Bond Repair",
    categories: ["care", "treatments"],
    bgImage: "/images/lookbook-texture.jpg",
    avatar: "/images/lookbook-cut.jpg",
    bio: "Certified in K-beauty scalp therapy and keratin bond restoration.",
    experience: "9 years",
  },
  {
    id: "m6",
    name: "Sofia Nakamura",
    role: "Balayage Artist",
    badge: "Artist",
    specialty: "Sun-Kissed Balayage · Gloss",
    categories: ["coloring", "styling"],
    bgImage: "/images/lookbook-platinum.jpg",
    avatar: "/images/lookbook-texture.jpg",
    bio: "Hand-painted dimension tailored for Singapore's light and lifestyle.",
    experience: "8 years",
  },
  {
    id: "m7",
    name: "Amara Singh",
    role: "Bridal & Events Stylist",
    badge: "Senior",
    specialty: "Bridal Updo · Event Styling",
    categories: ["styling", "cuts"],
    bgImage: "/images/hero.jpg",
    avatar: "/images/lookbook-space.jpg",
    bio: "From intimate ceremonies to gala evenings — styles that hold in humidity.",
    experience: "11 years",
  },
  {
    id: "m8",
    name: "Hiro Sato",
    role: "Junior Colorist",
    badge: "Rising",
    specialty: "Toner Refresh · Gloss Treatments",
    categories: ["coloring", "care"],
    bgImage: "/images/lookbook-process.jpg",
    avatar: "/images/hero.jpg",
    bio: "Meticulous toning and maintenance color under Yuki's mentorship.",
    experience: "4 years",
  },
];

export const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Signature Consultation",
    category: "care",
    duration: "30 min",
    price: "Complimentary",
    description: "In-depth hair analysis, lifestyle review, and personalised plan.",
    featured: true,
  },
  {
    id: "s2",
    name: "AirTouch Blonde",
    category: "coloring",
    duration: "4–5 hrs",
    price: "From S$680",
    description: "Seamless, lived-in blonde with zero harsh lines. Includes gloss finish.",
    featured: true,
  },
  {
    id: "s3",
    name: "Full Head Balayage",
    category: "coloring",
    duration: "3–4 hrs",
    price: "From S$520",
    description: "Hand-painted highlights for natural dimension and movement.",
    featured: true,
  },
  {
    id: "s4",
    name: "Platinum Transformation",
    category: "coloring",
    duration: "5–6 hrs",
    price: "From S$850",
    description: "Multi-session lightening with bond protection and toner architecture.",
    featured: true,
  },
  {
    id: "s5",
    name: "Root Touch-Up & Toner",
    category: "coloring",
    duration: "90 min",
    price: "From S$180",
    description: "Maintenance color to keep blonde fresh between full sessions.",
  },
  {
    id: "s6",
    name: "Creative Toner Refresh",
    category: "coloring",
    duration: "60 min",
    price: "From S$120",
    description: "Cool, warm, or pearl toners to refine your existing color.",
  },
  {
    id: "s7",
    name: "Precision Cut — Women",
    category: "cuts",
    duration: "60 min",
    price: "From S$95",
    description: "Architectural shape with bespoke finish for your hair type.",
    featured: true,
  },
  {
    id: "s8",
    name: "Precision Cut — Men",
    category: "cuts",
    duration: "45 min",
    price: "From S$75",
    description: "Clean lines, textured finishes, and styling guidance.",
  },
  {
    id: "s9",
    name: "Bang Trim",
    category: "cuts",
    duration: "15 min",
    price: "S$35",
    description: "Quick fringe refresh between full cuts.",
  },
  {
    id: "s10",
    name: "Wash & Blowout",
    category: "styling",
    duration: "45 min",
    price: "From S$65",
    description: "Salon wash with volumising or smoothing blowdry.",
  },
  {
    id: "s11",
    name: "Event Updo",
    category: "styling",
    duration: "90 min",
    price: "From S$150",
    description: "Elegant updo for weddings, galas, and special occasions.",
  },
  {
    id: "s12",
    name: "Bridal Hair Trial",
    category: "styling",
    duration: "2 hrs",
    price: "From S$280",
    description: "Full trial with adjustments note for your wedding day.",
  },
  {
    id: "s13",
    name: "Signature Gloss & Hydration",
    category: "care",
    duration: "45 min",
    price: "From S$85",
    description: "Keratin-infused gloss with deep hydration for dry, dull hair.",
    featured: true,
  },
  {
    id: "s14",
    name: "Scalp Detox Ritual",
    category: "treatments",
    duration: "60 min",
    price: "From S$110",
    description: "Japanese-inspired scalp cleanse, massage, and nourishing mask.",
    featured: true,
  },
  {
    id: "s15",
    name: "Bond Repair Treatment",
    category: "treatments",
    duration: "45 min",
    price: "From S$95",
    description: "Rebuilds broken bonds after chemical services or heat damage.",
  },
  {
    id: "s16",
    name: "Keratin Smoothing",
    category: "treatments",
    duration: "2–3 hrs",
    price: "From S$380",
    description: "Frizz control and shine for humid climates — lasts 3–4 months.",
  },
  {
    id: "s17",
    name: "Olaplex Stand-Alone",
    category: "treatments",
    duration: "30 min",
    price: "From S$65",
    description: "Add-on or standalone bond-building treatment.",
  },
  {
    id: "s18",
    name: "Express Root Lift Blowout",
    category: "styling",
    duration: "30 min",
    price: "From S$55",
    description: "Volume-focused blowout for fine or flat hair.",
  },
];

export const HAIR_CONCERNS: HairConcernData[] = [
  {
    id: "dry-ends",
    label: "Dry Ends",
    service: "Signature Gloss & Hydration",
    serviceDetail:
      "Deep conditioning with keratin-infused gloss and bond protection.",
    tip: "Apply a pea-sized amount of nourishing oil to damp ends before bed — avoid the roots.",
  },
  {
    id: "color-fading",
    label: "Color Fading",
    service: "Tonal Refresh & Bond Repair",
    serviceDetail:
      "Root-to-tip tonal revival with UV-protective sealant for blonde.",
    tip: "Rinse with cool water and use sulfate-free shampoo only.",
  },
  {
    id: "volume-loss",
    label: "Volume Loss",
    service: "Root Lift & Density Cut",
    serviceDetail:
      "Precision layering with volumizing blowout and texturizing finish.",
    tip: "Blow-dry upside down at the roots — finish with dry shampoo at the crown.",
  },
  {
    id: "frizz",
    label: "Frizz & Humidity",
    service: "Keratin Smoothing",
    serviceDetail:
      "Long-lasting frizz control designed for Singapore's tropical climate.",
    tip: "Sleep on a silk pillowcase and avoid touching hair until fully dry.",
  },
  {
    id: "scalp-sensitivity",
    label: "Scalp Sensitivity",
    service: "Scalp Detox Ritual",
    serviceDetail:
      "Gentle cleanse with botanical extracts and calming scalp massage.",
    tip: "Avoid hot water on the scalp — lukewarm rinses reduce irritation.",
  },
  {
    id: "damage",
    label: "Heat Damage",
    service: "Bond Repair Treatment",
    serviceDetail:
      "Intensive bond reconstruction with take-home care protocol.",
    tip: "Always use heat protectant and keep tools below 180°C.",
  },
];

export const HOT_SLOTS: HotSlot[] = [
  {
    id: "slot-1",
    day: "Tuesday",
    time: "10:00",
    stylist: "Yuki T.",
    available: true,
  },
  {
    id: "slot-2",
    day: "Wednesday",
    time: "14:30",
    stylist: "Priya S.",
    available: true,
  },
  {
    id: "slot-3",
    day: "Thursday",
    time: "11:00",
    stylist: "Mei Lin C.",
    available: true,
  },
  {
    id: "slot-4",
    day: "Friday",
    time: "15:00",
    stylist: "Sofia N.",
    available: true,
  },
  {
    id: "slot-5",
    day: "Saturday",
    time: "09:30",
    stylist: "Yuki T.",
    available: false,
  },
  {
    id: "slot-6",
    day: "Saturday",
    time: "13:00",
    stylist: "James L.",
    available: true,
  },
];

export const ABOUT_STORY = {
  headline: "Craft rooted in ritual.",
  paragraphs: [
    "AURA was founded in Singapore with a simple belief: exceptional hair care is a form of hospitality. Our name draws from the Japanese concept of presence — the quiet confidence that comes when every detail is considered.",
    "In our Dempsey Hill studio, Eastern scalp rituals meet European color science. Each visit begins with tea, a consultation, and a plan tailored to your hair, climate, and lifestyle.",
    "We serve a discerning clientele across Asia-Pacific — executives, creatives, and brides who expect discretion, precision, and results that endure Singapore's humidity.",
  ],
  values: [
    {
      title: "Omotenashi",
      description: "Anticipatory hospitality — we remember your preferences before you ask.",
    },
    {
      title: "Shokunin",
      description: "Master craftsmanship — every stylist trains continuously under our directors.",
    },
    {
      title: "Ma",
      description: "Intentional space — unhurried appointments in a calm, private setting.",
    },
  ],
};

export const PRESS_MENTIONS = [
  "Vogue Singapore",
  "Harper's Bazaar",
  "Peak Magazine",
  "Asia Tatler",
  "Honeycombers",
];

export const PARTNER_BRANDS = ["Olaplex", "Kérastase", "Davines", "Oribe"];

export const FOOTER_SOCIAL = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/6591234567",
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:hello@aurahair.sg",
  },
];

export const FOOTER_HIGHLIGHTS = [
  { label: "Private suites", value: "8" },
  { label: "Expert stylists", value: "8" },
  { label: "Client return rate", value: "94%" },
];

export const FOOTER_LEGAL = [
  { href: "#modal-privacy", label: "Privacy Policy" },
  { href: "#modal-cancellation", label: "Cancellation Policy" },
];

export interface PolicySection {
  title: string;
  body: string;
}

export const PRIVACY_POLICY: PolicySection[] = [
  {
    title: "Overview",
    body: "AURA Hair Space respects your privacy. This policy explains how we collect, use, and protect personal information when you visit our website, subscribe to updates, or book an appointment at our Dempsey Hill studio.",
  },
  {
    title: "Information we collect",
    body: "We may collect your name, email address, phone number, appointment preferences, and hair consultation notes you choose to share. Website usage data is collected anonymously through standard analytics to improve your experience.",
  },
  {
    title: "How we use your data",
    body: "Your information is used solely to manage appointments, send salon communications you have opted into, personalise your visits, and improve our services. We do not sell your personal data to third parties.",
  },
  {
    title: "Data retention & security",
    body: "Client records are retained in accordance with Singapore regulations and our internal policies. We apply appropriate technical and organisational measures to protect your information against unauthorised access.",
  },
  {
    title: "Your rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting hello@aurahair.sg. You may unsubscribe from marketing emails using the link in any message.",
  },
  {
    title: "Contact",
    body: "For privacy enquiries, email hello@aurahair.sg or write to AURA Hair Space, 8D Dempsey Road, #02-12, Singapore 249672.",
  },
];

export const CANCELLATION_POLICY: PolicySection[] = [
  {
    title: "Appointments",
    body: "All services at AURA Hair Space are by appointment only. A booking confirmation is sent once your visit is reserved through our website or concierge team.",
  },
  {
    title: "Cancellation window",
    body: "We require at least 48 hours' notice to cancel or reschedule without charge. This allows us to offer the time to clients on our waitlist and fairly compensate our stylists.",
  },
  {
    title: "Late cancellations & no-shows",
    body: "Cancellations within 48 hours of your appointment, or failure to attend without notice, may incur a fee of up to 50% of the scheduled service value. Repeated no-shows may require a deposit for future bookings.",
  },
  {
    title: "Late arrivals",
    body: "Please arrive 10 minutes before your appointment. Arrivals more than 15 minutes late may require a shortened service or rescheduling, subject to stylist availability.",
  },
  {
    title: "Deposits",
    body: "Deposits may be requested for services exceeding 3 hours, bridal trials, or peak weekend appointments. Deposits are applied to your final bill and are refundable when cancellation notice is provided within the required window.",
  },
  {
    title: "Contact",
    body: "To cancel or reschedule, WhatsApp our concierge at +65 9123 4567 or email hello@aurahair.sg as early as possible.",
  },
];

export function getServicesByCategory(category: ServiceFilter): Service[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getFeaturedServices(): Service[] {
  return SERVICES.filter((s) => s.featured);
}

export function filterMastersByCategory(
  masters: Master[],
  category: ServiceFilter
): Master[] {
  return masters.filter((m) => m.categories.includes(category));
}
