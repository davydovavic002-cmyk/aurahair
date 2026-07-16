/**
 * Deploy photorealistic salon assets from local AI renders only.
 * NO internet downloads — copies/resizes files already in public/images/.
 *
 * Run: npm run deploy:photos
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "images");

/** source (in public/images/) → one or more target paths */
/** Hero + lookbook items with dedicated assets/ renders — never overwrite via deploy */
const PROTECTED = new Set([
  "space/hero-bg.jpg",
  "lookbook/platinum-glow.jpg",
  "lookbook/balayage-sun.jpg",
  "lookbook/precision-bob.jpg",
  "lookbook/scalp-ritual.jpg",
  "lookbook/editorial-updo.jpg",
  "lookbook/mens-texture.jpg",
  "lookbook/gloss-finish.jpg",
  "lookbook/colour-process.jpg",
]);

const COPY_MAP = {
  "lookbook-space.jpg": [
    "space/studio-interior.jpg",
    "lookbook/space-detail.jpg",
  ],
  "lookbook-process.jpg": [
    "space/consultation.jpg",
    "services/airtouch.jpg",
    "services/bond-repair.jpg",
  ],
  "lookbook-platinum.jpg": [
    "services/platinum.jpg",
    "lookbook/toner-refresh.jpg",
  ],
  "lookbook-texture.jpg": [
    "services/balayage.jpg",
    "lookbook/keratin-smooth.jpg",
  ],
  "lookbook-cut.jpg": ["services/precision-cut.jpg"],
};

/** Optional resize per target: [w, h, fit] */
const RESIZE = {
  "space/hero-bg.jpg": [1920, 1080, "cover"],
  "space/studio-interior.jpg": [1400, 900, "cover"],
  "space/consultation.jpg": [1200, 800, "cover"],
  "services/airtouch.jpg": [800, 500, "cover"],
  "services/balayage.jpg": [800, 500, "cover"],
  "services/platinum.jpg": [800, 500, "cover"],
  "services/precision-cut.jpg": [800, 500, "cover"],
  "services/bond-repair.jpg": [800, 500, "cover"],
  "lookbook/platinum-glow.jpg": [900, 1125, "cover"],
  "lookbook/balayage-sun.jpg": [900, 1125, "cover"],
  "lookbook/precision-bob.jpg": [900, 1125, "cover"],
  "lookbook/colour-process.jpg": [900, 1125, "cover"],
  "lookbook/gloss-finish.jpg": [900, 1125, "cover"],
  "lookbook/mens-texture.jpg": [900, 1125, "cover"],
  "lookbook/keratin-smooth.jpg": [900, 1125, "cover"],
  "lookbook/toner-refresh.jpg": [900, 1125, "cover"],
  "lookbook/space-detail.jpg": [900, 1125, "cover"],
};

async function deploy(rel, srcName) {
  if (PROTECTED.has(rel)) {
    const dest = path.join(root, rel);
    if (fs.existsSync(dest)) {
      console.log(`⊘ ${rel} (protected — kept generated asset)`);
      return false;
    }
  }

  const src = path.join(root, srcName);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ missing ${srcName}, skipping ${rel}`);
    return false;
  }

  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  let pipeline = sharp(src);
  const dims = RESIZE[rel];
  if (dims) {
    pipeline = pipeline.resize(dims[0], dims[1], { fit: dims[2], position: "centre" });
  }
  await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(dest);

  const size = fs.statSync(dest).size;
  console.log(`✓ ${rel} ← ${srcName} (${Math.round(size / 1024)} KB)`);
  return true;
}

async function main() {
  console.log("Deploying local photorealistic salon images…\n");

  let count = 0;
  for (const [src, targets] of Object.entries(COPY_MAP)) {
    for (const rel of targets) {
      if (await deploy(rel, src)) count++;
    }
  }

  fs.writeFileSync(
    path.join(root, "ATTRIBUTION.md"),
    `# Images

Photorealistic assets for AURA Hair — generated locally (no stock downloads).

- **Root renders**: \`hero.jpg\`, \`lookbook-*.jpg\` — AI-generated, bordeaux/beige brand palette
- **Deployed paths**: mapped via \`npm run deploy:photos\`
- **Portraits & specialty shots**: generated locally via Cursor GenerateImage

Regenerate layout copies: \`npm run deploy:photos\`
Master portraits & work shots: \`npm run install:photos\` (from \`assets/\`)
`,
  );

  console.log(`\nDone — ${count} files deployed from local sources.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
