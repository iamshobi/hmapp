/**
 * Writes a short soft "glass" chime WAV for shell-collect micro-interaction (~0.35s).
 * Run: node scripts/generate-shell-tap-chime.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'assets', 'shell-tap-chime.wav');

const sampleRate = 44100;
const durationSec = 0.38;
const numSamples = Math.floor(sampleRate * durationSec);
const freq1 = 784; // G5
const freq2 = 1047; // C6

function envelope(t) {
  const a = Math.min(1, t * 80);
  const r = Math.max(0, 1 - (t - 0.12) / (durationSec - 0.12));
  return a * (0.35 + 0.65 * r * r);
}

const pcm = new Int16Array(numSamples);
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const env = envelope(t);
  const s =
    0.42 * Math.sin(2 * Math.PI * freq1 * t) * env +
    0.28 * Math.sin(2 * Math.PI * freq2 * t) * env +
    0.08 * Math.sin(2 * Math.PI * 2 * freq1 * t) * env;
  pcm[i] = Math.max(-32767, Math.min(32767, Math.round(s * 12000)));
}

const dataSize = pcm.length * 2;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);
for (let i = 0; i < pcm.length; i++) {
  buffer.writeInt16LE(pcm[i], 44 + i * 2);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log('Wrote', outPath, `(${buffer.length} bytes)`);
