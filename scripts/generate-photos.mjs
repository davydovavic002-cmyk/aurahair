/**
 * Semantic salon illustrations → JPEG (local, no external URLs).
 * Each image matches its role: master portrait/work, space, service, lookbook result.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "images");

const BRAND = {
  cream: "#FAF7F2",
  bordeaux: "#5C2135",
  bordeauxLight: "#8B3A52",
  gold: "#A68B5B",
  goldLight: "#C9A961",
  warm: "#E8D5B5",
  dark: "#1A1410",
  skin: "#D4B896",
  skinShadow: "#B8956A",
};

/** Hair colour presets */
const HAIR = {
  platinum: ["#E8E0D4", "#C9B896", "#F5F0E8"],
  coolBlonde: ["#EDE6DA", "#D4C4A8", "#F0EBE3"],
  brunette: ["#3D2B1F", "#5C4033", "#6B4E3D"],
  balayage: ["#5C4033", "#C9A961", "#E8D5B5", "#8B6914"],
  black: ["#1A1410", "#2C1810", "#3D2B1F"],
  mensDark: ["#2C1810", "#1A1410"],
};

function bg(w, h, c1, c2, c3 = c2) {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <radialGradient id="spot" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="${BRAND.cream}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${BRAND.cream}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#spot)"/>`;
}

function hairStrands(paths, colors) {
  return paths
    .map(
      (d, i) =>
        `<path d="${d}" fill="${colors[i % colors.length]}" opacity="${0.85 - (i % 3) * 0.08}"/>`,
    )
    .join("");
}

/** Front-facing portrait with hairstyle */
function portraitScene(w, h, hairStyle, skinTone = BRAND.skin) {
  const cx = w / 2;
  const cy = h * 0.38;
  const face = `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.14}" ry="${h * 0.1}" fill="${skinTone}"/>
    <ellipse cx="${cx - w * 0.05}" cy="${cy - h * 0.01}" rx="${w * 0.018}" ry="${h * 0.012}" fill="${BRAND.dark}" opacity="0.5"/>
    <ellipse cx="${cx + w * 0.05}" cy="${cy - h * 0.01}" rx="${w * 0.018}" ry="${h * 0.012}" fill="${BRAND.dark}" opacity="0.5"/>
    <path d="M ${cx - w * 0.02} ${cy + h * 0.04} Q ${cx} ${cy + h * 0.055} ${cx + w * 0.02} ${cy + h * 0.04}" stroke="${BRAND.bordeauxLight}" stroke-width="1.5" fill="none" opacity="0.4"/>
    <path d="M ${cx - w * 0.08} ${cy + h * 0.08} Q ${cx} ${cy + h * 0.12} ${cx + w * 0.08} ${cy + h * 0.08} L ${cx + w * 0.07} ${h * 0.55} L ${cx - w * 0.07} ${h * 0.55} Z" fill="${skinTone}" opacity="0.9"/>`;

  const styles = {
    airTouch: hairStrands(
      [
        `M ${cx - w * 0.15} ${cy - h * 0.05} Q ${cx - w * 0.2} ${cy + h * 0.15} ${cx - w * 0.12} ${h * 0.45} L ${cx - w * 0.08} ${h * 0.5} Q ${cx - w * 0.05} ${cy + h * 0.2} ${cx} ${cy - h * 0.08} Q ${cx + w * 0.05} ${cy + h * 0.2} ${cx + w * 0.08} ${h * 0.5} L ${cx + w * 0.12} ${h * 0.45} Q ${cx + w * 0.2} ${cy + h * 0.15} ${cx + w * 0.15} ${cy - h * 0.05} Z`,
        `M ${cx - w * 0.1} ${cy} Q ${cx} ${cy - h * 0.12} ${cx + w * 0.1} ${cy} L ${cx + w * 0.08} ${cy + h * 0.05} Q ${cx} ${cy - h * 0.06} ${cx - w * 0.08} ${cy + h * 0.05} Z`,
      ],
      HAIR.platinum,
    ),
    platinum: hairStrands(
      [
        `M ${cx - w * 0.13} ${cy - h * 0.04} L ${cx - w * 0.11} ${h * 0.35} L ${cx + w * 0.11} ${h * 0.35} L ${cx + w * 0.13} ${cy - h * 0.04} Q ${cx} ${cy - h * 0.1} Z`,
      ],
      HAIR.coolBlonde,
    ),
    bob: hairStrands(
      [
        `M ${cx - w * 0.14} ${cy - h * 0.03} L ${cx - w * 0.16} ${cy + h * 0.18} L ${cx + w * 0.16} ${cy + h * 0.18} L ${cx + w * 0.14} ${cy - h * 0.03} Q ${cx} ${cy - h * 0.08} Z`,
      ],
      HAIR.brunette,
    ),
    mens: hairStrands(
      [
        `M ${cx - w * 0.12} ${cy - h * 0.02} Q ${cx} ${cy - h * 0.14} ${cx + w * 0.12} ${cy - h * 0.02} L ${cx + w * 0.11} ${cy + h * 0.06} Q ${cx} ${cy - h * 0.04} ${cx - w * 0.11} ${cy + h * 0.06} Z`,
      ],
      HAIR.mensDark,
    ),
    treatment: `<circle cx="${cx}" cy="${cy - h * 0.06}" r="${w * 0.12}" fill="${HAIR.brunette[0]}" opacity="0.8"/>
      <path d="M ${cx - w * 0.08} ${cy + h * 0.02} Q ${cx} ${cy + h * 0.08} ${cx + w * 0.08} ${cy + h * 0.02}" stroke="${BRAND.goldLight}" stroke-width="2" fill="none" opacity="0.5"/>`,
    balayage: hairStrands(
      [
        `M ${cx - w * 0.14} ${cy - h * 0.04} Q ${cx - w * 0.18} ${cy + h * 0.2} ${cx - w * 0.1} ${h * 0.42} L ${cx + w * 0.1} ${h * 0.42} Q ${cx + w * 0.18} ${cy + h * 0.2} ${cx + w * 0.14} ${cy - h * 0.04} Z`,
        `M ${cx - w * 0.06} ${cy + h * 0.05} Q ${cx + w * 0.04} ${cy + h * 0.15} ${cx + w * 0.08} ${cy + h * 0.25} L ${cx + w * 0.05} ${cy + h * 0.2} Q ${cx} ${cy + h * 0.08} ${cx - w * 0.04} ${cy + h * 0.12} Z`,
      ],
      HAIR.balayage,
    ),
    updo: `<ellipse cx="${cx}" cy="${cy - h * 0.08}" rx="${w * 0.11}" ry="${h * 0.09}" fill="${HAIR.brunette[1]}"/>
      <circle cx="${cx}" cy="${cy - h * 0.14}" r="${w * 0.07}" fill="${HAIR.brunette[0]}"/>
      <path d="M ${cx - w * 0.04} ${cy - h * 0.18} Q ${cx} ${cy - h * 0.22} ${cx + w * 0.04} ${cy - h * 0.18}" stroke="${BRAND.gold}" stroke-width="1" fill="none"/>`,
    gloss: hairStrands(
      [
        `M ${cx - w * 0.12} ${cy - h * 0.03} L ${cx - w * 0.1} ${h * 0.32} L ${cx + w * 0.1} ${h * 0.32} L ${cx + w * 0.12} ${cy - h * 0.03} Z`,
        `M ${cx - w * 0.04} ${cy + h * 0.05} L ${cx + w * 0.06} ${cy + h * 0.12} L ${cx + w * 0.02} ${cy + h * 0.08} Z`,
      ],
      [HAIR.coolBlonde[0], BRAND.cream, HAIR.coolBlonde[1]],
    ),
  };

  return `${face}${styles[hairStyle] ?? styles.platinum}`;
}

/** Back/side view — stylist at work */
function workScene(w, h, activity) {
  const cx = w * 0.45;
  const headY = h * 0.35;
  const chair = `<rect x="${w * 0.15}" y="${h * 0.55}" width="${w * 0.55}" height="${h * 0.08}" rx="6" fill="${BRAND.bordeaux}" opacity="0.25"/>
    <rect x="${w * 0.2}" y="${h * 0.48}" width="${w * 0.45}" height="${h * 0.12}" rx="8" fill="${BRAND.bordeauxLight}" opacity="0.15"/>`;

  const headBack = (hairColors, extra = "") =>
    `<ellipse cx="${cx}" cy="${headY}" rx="${w * 0.12}" ry="${h * 0.09}" fill="${hairColors[0]}"/>
    ${extra}
    <ellipse cx="${cx}" cy="${headY + h * 0.02}" rx="${w * 0.1}" ry="${h * 0.07}" fill="${hairColors[1] ?? hairColors[0]}" opacity="0.85"/>`;

  const hands = (tool) => {
    const base = `<path d="M ${w * 0.62} ${h * 0.28} Q ${w * 0.72} ${h * 0.32} ${w * 0.68} ${h * 0.42}" stroke="${BRAND.skin}" stroke-width="${w * 0.025}" fill="none" stroke-linecap="round"/>
      <path d="M ${w * 0.58} ${h * 0.3} Q ${w * 0.65} ${h * 0.38} ${w * 0.6} ${h * 0.45}" stroke="${BRAND.skinShadow}" stroke-width="${w * 0.02}" fill="none" stroke-linecap="round"/>`;
    const tools = {
      scissors: `${base}<line x1="${w * 0.7}" y1="${h * 0.32}" x2="${w * 0.76}" y2="${h * 0.38}" stroke="${BRAND.gold}" stroke-width="2"/><line x1="${w * 0.7}" y1="${h * 0.38}" x2="${w * 0.76}" y2="${h * 0.32}" stroke="${BRAND.gold}" stroke-width="2"/>`,
      brush: `${base}<line x1="${w * 0.68}" y1="${h * 0.35}" x2="${w * 0.78}" y2="${h * 0.25}" stroke="${BRAND.bordeaux}" stroke-width="${w * 0.015}"/><ellipse cx="${w * 0.79}" cy="${h * 0.24}" rx="${w * 0.025}" ry="${h * 0.02}" fill="${BRAND.bordeauxLight}"/>`,
      bowl: `${base}<ellipse cx="${w * 0.75}" cy="${h * 0.4}" rx="${w * 0.06}" ry="${h * 0.04}" fill="${BRAND.bordeauxLight}" opacity="0.7"/>
        <path d="M ${w * 0.69} ${h * 0.37} Q ${w * 0.72} ${h * 0.34} ${w * 0.75} ${h * 0.36}" stroke="${HAIR.platinum[0]}" stroke-width="3" fill="none" opacity="0.6"/>`,
      massage: `<path d="M ${w * 0.55} ${headY - h * 0.05} Q ${w * 0.65} ${headY} ${w * 0.58} ${headY + h * 0.05}" stroke="${BRAND.skin}" stroke-width="${w * 0.03}" fill="none"/>
        <path d="M ${w * 0.52} ${headY} Q ${w * 0.6} ${headY + h * 0.03} ${w * 0.55} ${headY + h * 0.06}" stroke="${BRAND.skinShadow}" stroke-width="${w * 0.025}" fill="none"/>`,
      foil: `${base}<rect x="${w * 0.65}" y="${h * 0.3}" width="${w * 0.08}" height="${h * 0.06}" rx="2" fill="${BRAND.cream}" opacity="0.6" transform="rotate(-15 ${w * 0.69} ${h * 0.33})"/>`,
      updo: `${base}<circle cx="${cx}" cy="${headY - h * 0.06}" r="${w * 0.05}" fill="${HAIR.brunette[0]}"/>
        <path d="M ${cx - w * 0.03} ${headY - h * 0.1} Q ${cx} ${headY - h * 0.14} ${cx + w * 0.03} ${headY - h * 0.1}" stroke="${BRAND.gold}" stroke-width="1" fill="none"/>`,
    };
    return tools[tool] ?? base;
  };

  const acts = {
    color: headBack(HAIR.platinum, `<path d="M ${cx - w * 0.08} ${headY + h * 0.05} L ${cx + w * 0.1} ${headY - h * 0.02}" stroke="${HAIR.platinum[1]}" stroke-width="4" fill="none" opacity="0.5"/>`) + hands("foil"),
    toner: headBack(HAIR.coolBlonde) + hands("brush"),
    cut: headBack(HAIR.brunette) + hands("scissors"),
    mens: headBack(HAIR.mensDark) + hands("scissors"),
    scalp: headBack(HAIR.brunette) + hands("massage"),
    balayage: headBack(HAIR.balayage, `<path d="M ${cx + w * 0.02} ${headY} Q ${cx + w * 0.12} ${headY + h * 0.08} ${cx + w * 0.08} ${headY + h * 0.12}" stroke="${HAIR.balayage[1]}" stroke-width="5" fill="none" opacity="0.7"/>`) + hands("brush"),
    bridal: headBack(HAIR.brunette) + hands("updo"),
    gloss: headBack(HAIR.coolBlonde, `<line x1="${cx - w * 0.06}" y1="${headY}" x2="${cx + w * 0.08}" y2="${headY + h * 0.04}" stroke="${BRAND.cream}" stroke-width="2" opacity="0.5"/>`) + hands("brush"),
  };

  return chair + (acts[activity] ?? acts.color);
}

/** Salon interior */
function salonScene(w, h, variant) {
  const floor = `<rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="${BRAND.bordeaux}" opacity="0.12"/>`;
  const mirror = `<rect x="${w * 0.05}" y="${h * 0.12}" width="${w * 0.35}" height="${h * 0.45}" fill="${BRAND.cream}" opacity="0.08" rx="4"/>
    <rect x="${w * 0.06}" y="${h * 0.13}" width="${w * 0.33}" height="${h * 0.43}" fill="none" stroke="${BRAND.gold}" stroke-width="1" opacity="0.3" rx="3"/>`;
  const chairs = [0.42, 0.62, 0.82]
    .map(
      (x) =>
        `<rect x="${w * (x - 0.08)}" y="${h * 0.52}" width="${w * 0.14}" height="${h * 0.18}" rx="6" fill="${BRAND.bordeauxLight}" opacity="0.35"/>
         <rect x="${w * (x - 0.06)}" y="${h * 0.44}" width="${w * 0.1}" height="${h * 0.1}" rx="4" fill="${BRAND.bordeaux}" opacity="0.25"/>`,
    )
    .join("");
  const lights = `<circle cx="${w * 0.25}" cy="${h * 0.08}" r="${w * 0.03}" fill="${BRAND.goldLight}" opacity="0.6"/>
    <circle cx="${w * 0.55}" cy="${h * 0.06}" r="${w * 0.025}" fill="${BRAND.goldLight}" opacity="0.5"/>
    <circle cx="${w * 0.8}" cy="${h * 0.08}" r="${w * 0.03}" fill="${BRAND.goldLight}" opacity="0.6"/>`;
  const plants = `<ellipse cx="${w * 0.92}" cy="${h * 0.65}" rx="${w * 0.04}" ry="${h * 0.06}" fill="${BRAND.bordeaux}" opacity="0.2"/>`;

  if (variant === "consult") {
    return (
      floor +
      mirror +
      chairs +
      lights +
      `<ellipse cx="${w * 0.55}" cy="${h * 0.38}" rx="${w * 0.06}" ry="${h * 0.05}" fill="${BRAND.skin}" opacity="0.7"/>
      <ellipse cx="${w * 0.7}" cy="${h * 0.35}" rx="${w * 0.05}" ry="${h * 0.04}" fill="${BRAND.skinShadow}" opacity="0.5"/>`
    );
  }
  if (variant === "hero") {
    return (
      floor +
      mirror +
      chairs +
      lights +
      plants +
      `<rect x="${w * 0.38}" y="${h * 0.55}" width="${w * 0.24}" height="${h * 0.04}" fill="${BRAND.gold}" opacity="0.2" rx="2"/>`
    );
  }
  return floor + mirror + chairs + lights;
}

/** Lookbook — back of head result shot */
function lookbookScene(w, h, style) {
  const cx = w / 2;
  const cy = h * 0.38;
  const shoulders = `<path d="M ${cx - w * 0.2} ${h * 0.55} Q ${cx} ${h * 0.48} ${cx + w * 0.2} ${h * 0.55} L ${cx + w * 0.15} ${h * 0.7} L ${cx - w * 0.15} ${h * 0.7} Z" fill="${BRAND.bordeaux}" opacity="0.12"/>`;

  const results = {
    platinum: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.18}" ry="${h * 0.14}" fill="${HAIR.platinum[0]}"/>
      <path d="M ${cx - w * 0.15} ${cy + h * 0.05} Q ${cx - w * 0.2} ${h * 0.35} ${cx - w * 0.12} ${h * 0.45} L ${cx + w * 0.12} ${h * 0.45} Q ${cx + w * 0.2} ${h * 0.35} ${cx + w * 0.15} ${cy + h * 0.05} Z" fill="${HAIR.platinum[1]}"/>`,
    balayage: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.17}" ry="${h * 0.13}" fill="${HAIR.balayage[0]}"/>
      <path d="M ${cx + w * 0.05} ${cy} Q ${cx + w * 0.15} ${cy + h * 0.15} ${cx + w * 0.1} ${cy + h * 0.25} L ${cx + w * 0.02} ${cy + h * 0.1} Z" fill="${HAIR.balayage[1]}" opacity="0.85"/>
      <path d="M ${cx - w * 0.08} ${cy + h * 0.05} Q ${cx - w * 0.12} ${cy + h * 0.2} ${cx - w * 0.06} ${cy + h * 0.18} Z" fill="${HAIR.balayage[2]}" opacity="0.7"/>`,
    bob: `<ellipse cx="${cx}" cy="${cy + h * 0.02}" rx="${w * 0.16}" ry="${h * 0.12}" fill="${HAIR.brunette[1]}"/>
      <rect x="${cx - w * 0.17}" y="${cy + h * 0.08}" width="${w * 0.34}" height="${h * 0.06}" rx="3" fill="${HAIR.brunette[0]}"/>`,
    scalp: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.16}" ry="${h * 0.12}" fill="${HAIR.brunette[1]}"/>
      <circle cx="${cx}" cy="${cy - h * 0.02}" r="${w * 0.08}" fill="${BRAND.goldLight}" opacity="0.15"/>
      <path d="M ${cx - w * 0.06} ${cy - h * 0.04} Q ${cx} ${cy - h * 0.08} ${cx + w * 0.06} ${cy - h * 0.04}" stroke="${BRAND.gold}" stroke-width="1" fill="none" opacity="0.4"/>`,
    updo: `<circle cx="${cx}" cy="${cy - h * 0.06}" r="${w * 0.1}" fill="${HAIR.brunette[0]}"/>
      <ellipse cx="${cx}" cy="${cy + h * 0.04}" rx="${w * 0.08}" ry="${h * 0.05}" fill="${HAIR.brunette[1]}"/>`,
    mens: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.14}" ry="${h * 0.1}" fill="${HAIR.mensDark[0]}"/>
      <path d="M ${cx - w * 0.12} ${cy - h * 0.02} Q ${cx} ${cy - h * 0.1} ${cx + w * 0.12} ${cy - h * 0.02} L ${cx + w * 0.1} ${cy + h * 0.04} Q ${cx} ${cy - h * 0.02} ${cx - w * 0.1} ${cy + h * 0.04} Z" fill="${HAIR.mensDark[1]}"/>`,
    gloss: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.17}" ry="${h * 0.13}" fill="${HAIR.coolBlonde[0]}"/>
      <line x1="${cx - w * 0.1}" y1="${cy - h * 0.04}" x2="${cx + w * 0.12}" y2="${cy + h * 0.02}" stroke="${BRAND.cream}" stroke-width="2" opacity="0.45"/>
      <line x1="${cx - w * 0.06}" y1="${cy + h * 0.04}" x2="${cx + w * 0.08}" y2="${cy + h * 0.08}" stroke="${BRAND.cream}" stroke-width="1.5" opacity="0.35"/>`,
    colour: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.17}" ry="${h * 0.13}" fill="${HAIR.platinum[0]}"/>
      <rect x="${cx - w * 0.12}" y="${cy + h * 0.02}" width="${w * 0.24}" height="${h * 0.04}" fill="${BRAND.bordeauxLight}" opacity="0.3" rx="2"/>`,
    bridal: `<circle cx="${cx}" cy="${cy - h * 0.04}" r="${w * 0.11}" fill="${HAIR.brunette[0]}"/>
      <path d="M ${cx - w * 0.08} ${cy - h * 0.08} Q ${cx} ${cy - h * 0.16} ${cx + w * 0.08} ${cy - h * 0.08}" stroke="${BRAND.goldLight}" stroke-width="1.5" fill="none"/>
      <ellipse cx="${cx}" cy="${cy + h * 0.06}" rx="${w * 0.06}" ry="${h * 0.04}" fill="${HAIR.brunette[1]}"/>`,
    keratin: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.18}" ry="${h * 0.14}" fill="${HAIR.brunette[1]}"/>
      <line x1="${cx - w * 0.14}" y1="${cy}" x2="${cx + w * 0.14}" y2="${cy + h * 0.02}" stroke="${BRAND.cream}" stroke-width="1.5" opacity="0.4"/>`,
    toner: `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.16}" ry="${h * 0.12}" fill="${HAIR.coolBlonde[1]}"/>
      <ellipse cx="${cx}" cy="${cy + h * 0.02}" rx="${w * 0.14}" ry="${h * 0.1}" fill="${HAIR.coolBlonde[0]}" opacity="0.9"/>`,
    space: salonScene(w, h, "interior"),
  };

  if (style === "space") return results.space;
  return shoulders + (results[style] ?? results.platinum);
}

function serviceScene(w, h, type) {
  const map = {
    consultation: () => salonScene(w, h, "consult"),
    airtouch: () => workScene(w, h, "color"),
    balayage: () => workScene(w, h, "balayage"),
    platinum: () => workScene(w, h, "color"),
    "precision-cut": () => workScene(w, h, "cut"),
    gloss: () => workScene(w, h, "gloss"),
    "scalp-ritual": () => workScene(w, h, "scalp"),
    "bond-repair": () => workScene(w, h, "scalp"),
  };
  return (map[type] ?? map.consultation)();
}

function svg(w, h, bgColors, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${bg(w, h, ...bgColors)}
    ${content}
  </svg>`;
}

async function writeJpeg(rel, svgStr) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svgStr)).jpeg({ quality: 90, mozjpeg: true }).toFile(file);
  console.log(`✓ ${rel}`);
}

const MASTERS = {
  m1: { portrait: "airTouch", work: "color" },
  m2: { portrait: "platinum", work: "toner" },
  m3: { portrait: "bob", work: "cut" },
  m4: { portrait: "mens", work: "mens" },
  m5: { portrait: "treatment", work: "scalp" },
  m6: { portrait: "balayage", work: "balayage" },
  m7: { portrait: "updo", work: "bridal" },
  m8: { portrait: "gloss", work: "gloss" },
};

const BG = {
  space: [BRAND.warm, BRAND.bordeauxLight, BRAND.bordeaux],
  portrait: [BRAND.cream, BRAND.warm, BRAND.goldLight],
  work: [BRAND.bordeaux, BRAND.bordeauxLight, "#3D2B1F"],
  service: [BRAND.warm, BRAND.goldLight, BRAND.bordeauxLight],
  lookbook: [BRAND.cream, BRAND.warm, BRAND.goldLight],
};

async function main() {
  console.log("Generating semantic salon images…\n");

  await writeJpeg(
    "space/hero-bg.jpg",
    svg(1920, 1080, BG.space, salonScene(1920, 1080, "hero")),
  );
  await writeJpeg(
    "space/studio-interior.jpg",
    svg(1400, 900, BG.space, salonScene(1400, 900, "interior")),
  );
  await writeJpeg(
    "space/consultation.jpg",
    svg(1200, 800, BG.space, salonScene(1200, 800, "consult")),
  );

  for (const [id, cfg] of Object.entries(MASTERS)) {
    await writeJpeg(
      `masters/${id}-portrait.jpg`,
      svg(600, 750, BG.portrait, portraitScene(600, 750, cfg.portrait)),
    );
    await writeJpeg(
      `masters/${id}-work.jpg`,
      svg(900, 600, BG.work, workScene(900, 600, cfg.work)),
    );
  }

  for (const svc of [
    "consultation", "airtouch", "balayage", "platinum",
    "precision-cut", "gloss", "scalp-ritual", "bond-repair",
  ]) {
    await writeJpeg(
      `services/${svc}.jpg`,
      svg(800, 500, BG.service, serviceScene(800, 500, svc)),
    );
  }

  const lookbook = {
    "platinum-glow": "platinum",
    "balayage-sun": "balayage",
    "precision-bob": "bob",
    "scalp-ritual": "scalp",
    "editorial-updo": "updo",
    "mens-texture": "mens",
    "gloss-finish": "gloss",
    "colour-process": "colour",
    "bridal-trial": "bridal",
    "keratin-smooth": "keratin",
    "toner-refresh": "toner",
    "space-detail": "space",
  };

  for (const [file, style] of Object.entries(lookbook)) {
    await writeJpeg(
      `lookbook/${file}.jpg`,
      svg(900, 1125, BG.lookbook, lookbookScene(900, 1125, style)),
    );
  }

  fs.writeFileSync(
    path.join(root, "ATTRIBUTION.md"),
    `# Images\n\nSemantically illustrated assets generated locally via \`npm run generate:photos\`.\nEach file matches its context (master specialty, service type, salon space, lookbook result).\nReplace with real photography before production.\n`,
  );

  console.log("\nDone — 39 contextual images.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
