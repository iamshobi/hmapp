import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'assets', 'my-shell-collection-icon.svg');
const s = fs.readFileSync(svgPath, 'utf8');
const marker = 'fill="rgb(0%, 0%, 0%)"';
const i = s.indexOf(marker);
if (i < 0) throw new Error('Black path not found');
const j = s.indexOf('d="', i);
const k = s.indexOf('"', j + 3);
const d = s.slice(j + 3, k);
const out = `/** Auto-generated from assets/my-shell-collection-icon.svg — shell silhouette only (no white plate). */
export const MY_SHELL_COLLECTION_GLYPH_D = ${JSON.stringify(d)};
`;
const outPath = path.join(root, 'src', 'components', 'ocean', 'myShellCollectionGlyph.js');
fs.writeFileSync(outPath, out);
console.log('Wrote', outPath, 'd length', d.length);
