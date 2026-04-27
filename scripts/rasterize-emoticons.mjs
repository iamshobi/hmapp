/**
 * Rasterize Figma-style emoticon SVGs (embedded JPEG + pattern) to app PNGs.
 * Raw JPEG extraction ignores SVG transforms — faces look wrong in a circle.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dl = process.env.EMOTICON_SRC_DIR || 'C:/Users/MSUSERSL123/Downloads';
const outDir = path.join(root, 'assets');
const names = ['emoticon1', 'emoticon2', 'emoticon3'];
const OUT = 256;

for (const name of names) {
  const svgPath = path.join(dl, `${name}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error(`Missing: ${svgPath}`);
    process.exitCode = 1;
    continue;
  }
  const buf = await sharp(svgPath)
    .resize(OUT, OUT, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  const dest = path.join(outDir, `${name}.png`);
  fs.writeFileSync(dest, buf);
  console.log(`${name}.png → ${dest} (${buf.length} bytes)`);
}
