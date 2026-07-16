import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "public", "images");

const palettes = [
  ["#5C2135", "#8B3A52", "#C9A961"],
  ["#3D2B1F", "#6B4E3D", "#A68B5B"],
  ["#2C1810", "#5C2135", "#D4B896"],
  ["#1A1410", "#4A3728", "#B8956A"],
  ["#4A2030", "#7A4058", "#E8D5B5"],
  ["#352018", "#6B3A28", "#C9A961"],
  ["#2A1520", "#5C2135", "#A68B5B"],
  ["#1E1210", "#4A3028", "#D4C4A8"],
];

function svg(w, h, c1, c2, c3, label = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#FAF7F2" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#FAF7F2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  ${label ? `<text x="50%" y="88%" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.round(w * 0.04)}" fill="#FAF7F2" fill-opacity="0.25" letter-spacing="0.3em">${label}</text>` : ""}
</svg>`;
}

function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// Space
write("space/hero-bg.svg", svg(1920, 1080, "#1A1410", "#3D2B1F", "#5C2135", "AURA"));
write("space/studio-interior.svg", svg(1200, 800, "#2C1810", "#4A3728", "#6B4E3D", "STUDIO"));
write("space/consultation.svg", svg(1200, 800, "#352018", "#5C2135", "#8B3A52", "CONSULT"));

// Masters — unique avatar + bg per stylist
const masterNames = [
  "Yuki Tanaka",
  "Priya Sharma",
  "Elena Wong",
  "James Lim",
  "Mei Lin Chen",
  "Sofia Nakamura",
  "Amara Singh",
  "Hiro Sato",
];

masterNames.forEach((name, i) => {
  const [c1, c2, c3] = palettes[i];
  const id = `m${i + 1}`;
  write(`masters/${id}-portrait.svg`, svg(400, 500, c1, c2, c3, name.split(" ")[0].toUpperCase()));
  write(`masters/${id}-work.svg`, svg(800, 600, c2, c1, c3, "CRAFT"));
});

// Services
const services = [
  "consultation",
  "airtouch",
  "balayage",
  "platinum",
  "precision-cut",
  "gloss",
  "scalp-ritual",
  "bond-repair",
];
services.forEach((slug, i) => {
  const [c1, c2, c3] = palettes[i % palettes.length];
  write(`services/${slug}.svg`, svg(600, 400, c1, c2, c3, slug.replace(/-/g, " ").toUpperCase()));
});

// Lookbook
const lookbook = [
  "platinum-glow",
  "balayage-sun",
  "precision-bob",
  "scalp-ritual",
  "editorial-updo",
  "mens-texture",
  "gloss-finish",
  "colour-process",
  "bridal-trial",
  "keratin-smooth",
  "toner-refresh",
  "space-detail",
];
lookbook.forEach((slug, i) => {
  const [c1, c2, c3] = palettes[(i + 2) % palettes.length];
  write(`lookbook/${slug}.svg`, svg(800, 1000, c1, c2, c3));
});

console.log("Generated placeholder images in public/images/");
