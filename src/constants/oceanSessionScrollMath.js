

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}


export function oceanSessionBackdropEasedU(progress01) {
  const p = clamp01(progress01);
  const lin = p;
  const easeOut = 1 - (1 - p) ** 2.1;
  return lin * 0.58 + easeOut * 0.42;
}
