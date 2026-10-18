export type Settings = { color: string; size: number; stroke: number; boil: boolean };

export const DEFAULTS: Settings = { color: "currentColor", size: 24, stroke: 1.6, boil: true };

const KEY = "zicons:settings";
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function sanitize(input: unknown): Settings {
  const o = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const color = typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color.toLowerCase() : DEFAULTS.color;
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.round(clamp(o.size, 12, 256)) : DEFAULTS.size;
  const stroke = typeof o.stroke === "number" && Number.isFinite(o.stroke) ? Math.round(clamp(o.stroke, 1, 3.5) * 10) / 10 : DEFAULTS.stroke;
  const boil = typeof o.boil === "boolean" ? o.boil : DEFAULTS.boil;
  return { color, size, stroke, boil };
}

export function loadSettings(): Settings {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sanitize(s)));
  } catch {}
}
