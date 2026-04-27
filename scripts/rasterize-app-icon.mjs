import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'assets', 'app-icon-source.svg');
const outPath = join(root, 'assets', 'icon.png');

const svg = readFileSync(svgPath);
await sharp(svg).resize(1024, 1024).png().toFile(outPath);
console.log('Wrote', outPath);
