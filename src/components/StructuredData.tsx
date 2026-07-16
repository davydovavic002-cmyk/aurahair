import { OPENING_HOURS, SALON_INFO } from "@/data/content";

export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: "AURA Hair Space",
    description:
      "Premium hair salon in Dempsey Hill, Singapore. Japanese precision, modern luxury. By appointment only.",
    url: "https://aurahair.sg",
    telephone: SALON_INFO.phone,
    email: SALON_INFO.email,
    image: "/images/space/studio-interior.jpg",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "8D Dempsey Road, #02-12",
      addressLocality: "Singapore",
      postalCode: "249672",
      addressCountry: "SG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 1.3054,
      longitude: 103.8099,
    },
    openingHoursSpecification: OPENING_HOURS.filter(
      (h) => h.hours !== "Closed"
    ).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day.replace(" – ", "-").split(" – ")[0],
      opens: h.hours.split(" – ")[0],
      closes: h.hours.split(" – ")[1],
    })),
    sameAs: ["https://www.instagram.com/"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
