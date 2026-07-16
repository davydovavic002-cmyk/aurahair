/**
 * Install Cursor-generated photorealistic assets into public/images/.
 * Run after GenerateImage batch: npm run install:photos
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const assetsDir = [
  path.join(process.cwd(), "assets"),
  path.join(process.cwd(), "..", ".cursor", "projects", "d-aurahair", "assets"),
  "C:\\Users\\79194\\.cursor\\projects\\d-aurahair\\assets",
].find((d) => fs.existsSync(d));

if (!assetsDir) {
  console.error("No assets/ directory found. Generate images first.");
  process.exit(1);
}
const root = path.join(process.cwd(), "public", "images");

/** assets filename → [target path, optional [w,h,fit]] */
const INSTALL = {
  "space-hero-bg.jpg": ["space/hero-bg.jpg", [1920, 1080, "cover"]],
  "space-studio-interior.jpg": ["space/studio-interior.jpg", [1400, 900, "cover"]],
  "space-consultation.jpg": ["space/consultation.jpg", [1200, 800, "cover"]],
  "m1-portrait.jpg": ["masters/m1-portrait.jpg", [600, 750, "cover"]],
  "m2-portrait.jpg": ["masters/m2-portrait.jpg", [600, 750, "cover"]],
  "m3-portrait.jpg": ["masters/m3-portrait.jpg", [600, 750, "cover"]],
  "m4-portrait.jpg": ["masters/m4-portrait.jpg", [600, 750, "cover"]],
  "m5-portrait.jpg": ["masters/m5-portrait.jpg", [600, 750, "cover"]],
  "m6-portrait.jpg": ["masters/m6-portrait.jpg", [600, 750, "cover"]],
  "m7-portrait.jpg": ["masters/m7-portrait.jpg", [600, 750, "cover"]],
  "m8-portrait.jpg": ["masters/m8-portrait.jpg", [600, 750, "cover"]],
  "m1-work.jpg": ["masters/m1-work.jpg", [900, 600, "cover"]],
  "m2-work.jpg": ["masters/m2-work.jpg", [900, 600, "cover"]],
  "m3-work.jpg": ["masters/m3-work.jpg", [900, 600, "cover"]],
  "m4-work.jpg": ["masters/m4-work.jpg", [900, 600, "cover"]],
  "m5-work.jpg": ["masters/m5-work.jpg", [900, 600, "cover"]],
  "m6-work.jpg": ["masters/m6-work.jpg", [900, 600, "cover"]],
  "m7-work.jpg": ["masters/m7-work.jpg", [900, 600, "cover"]],
  "m8-work.jpg": ["masters/m8-work.jpg", [900, 600, "cover"]],
  "service-consultation.jpg": ["services/consultation.jpg", [800, 500, "cover"]],
  "service-gloss.jpg": ["services/gloss.jpg", [800, 500, "cover"]],
  "service-scalp-ritual.jpg": ["services/scalp-ritual.jpg", [800, 500, "cover"]],
  "lookbook-platinum-glow.jpg": ["lookbook/platinum-glow.jpg", [900, 1125, "cover"]],
  "lookbook-balayage-sun.jpg": ["lookbook/balayage-sun.jpg", [900, 1125, "cover"]],
  "lookbook-precision-bob.jpg": ["lookbook/precision-bob.jpg", [900, 1125, "cover"]],
  "lookbook-scalp-ritual.jpg": ["lookbook/scalp-ritual.jpg", [900, 1125, "cover"]],
  "lookbook-editorial-updo.jpg": ["lookbook/editorial-updo.jpg", [900, 1125, "cover"]],
  "lookbook-mens-texture.jpg": ["lookbook/mens-texture.jpg", [900, 1125, "cover"]],
  "lookbook-gloss-finish.jpg": ["lookbook/gloss-finish.jpg", [900, 1125, "cover"]],
  "lookbook-colour-process.jpg": ["lookbook/colour-process.jpg", [900, 1125, "cover"]],
};

async function install(srcName, rel, dims) {
  const src = path.join(assetsDir, srcName);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ missing assets/${srcName}`);
    return false;
  }
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let pipeline = sharp(src);
  if (dims) {
    pipeline = pipeline.resize(dims[0], dims[1], { fit: dims[2], position: "centre" });
  }
  await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
  const size = fs.statSync(dest).size;
  console.log(`✓ ${rel} ← assets/${srcName} (${Math.round(size / 1024)} KB)`);
  return true;
}

async function main() {
  console.log("Installing generated photorealistic assets…\n");
  let n = 0;
  for (const [src, [rel, dims]] of Object.entries(INSTALL)) {
    if (await install(src, rel, dims)) n++;
  }

  const heroSrc = path.join(assetsDir, "space-hero-bg.jpg");
  const heroAsset = path.join(process.cwd(), "assets", "hero-bg.jpg");
  if (fs.existsSync(heroSrc)) {
    fs.mkdirSync(path.dirname(heroAsset), { recursive: true });
    fs.copyFileSync(heroSrc, heroAsset);
    console.log(`✓ assets/hero-bg.jpg ← assets/space-hero-bg.jpg`);
  }

  console.log(`\nInstalled ${n} generated images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
