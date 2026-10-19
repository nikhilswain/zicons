import { resolve } from "node:path";

const W = 1200;
const H = 630;
const INK = "#1d1b18";
const SOFT = "#5c5852";
const PAPER = "#f4efe3";
const CARD = "#fffdf7";
const CORAL = "#ff6b5b";
const TAPE = "#ffd96699";

export const OG_FONTS = [resolve("src/assets/og/ShantellSans-ExtraBold.ttf"), resolve("src/assets/og/Caveat-Bold.ttf")];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const frame = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="#cfc6b1"/></pattern></defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>
${body}
</svg>`;

const card = (x: number, y: number, size: number, tilt = 0) =>
  `<g transform="rotate(${tilt} ${x + size / 2} ${y + size / 2})"><rect x="${x + size * 0.03}" y="${y + size * 0.035}" width="${size}" height="${size}" rx="${size * 0.07}" fill="${INK}"/><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.07}" fill="${CARD}" stroke="${INK}" stroke-width="${Math.max(3, size * 0.012)}"/></g>`;

const glyph = (d: string, x: number, y: number, size: number, color = INK, stroke = 1.6) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/></g>`;

const grid = (x: number, y: number, size: number) => {
  const step = size / 24;
  const lines: string[] = [];
  for (let k = 1; k < 24; k++) lines.push(`M${x + k * step} ${y}V${y + size}`, `M${x} ${y + k * step}H${x + size}`);
  return `<path d="${lines.join("")}" stroke="${INK}" stroke-opacity="0.07" stroke-width="1"/><rect x="${x + 3 * step}" y="${y + 3 * step}" width="${18 * step}" height="${18 * step}" fill="none" stroke="${CORAL}" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="8 7"/>`;
};

const text = (s: string, x: number, y: number, size: number, opts: { font?: "display" | "hand"; fill?: string } = {}) =>
  `<text x="${x}" y="${y}" font-family="${opts.font === "hand" ? "Caveat" : "Shantell Sans"}" font-weight="${opts.font === "hand" ? 700 : 800}" font-size="${size}" fill="${opts.fill ?? INK}">${esc(s)}</text>`;

const tape = (s: string, x: number, y: number) =>
  `<g transform="rotate(-3 ${x} ${y})"><rect x="${x - 14}" y="${y - 38}" width="${s.length * 19 + 28}" height="50" fill="${TAPE}"/>${text(s, x, y, 40, { font: "hand" })}</g>`;

const footer = (x: number) => `${text("zicons.zerro.dev", x, 560, 30, { fill: SOFT })}`;

export function ogIcon(name: string, d: string): string {
  const size = 430;
  const x = 90;
  const y = (H - size) / 2 - 6;
  const inner = size * 0.82;
  const pad = (size - inner) / 2;
  const left = 610;
  const nameSize = Math.min(96, Math.floor(540 / (name.length * 0.62)));
  const base = 230 + nameSize;
  return frame(
    `${card(x, y, size, -1.6)}<g transform="rotate(-1.6 ${x + size / 2} ${y + size / 2})">${grid(x + pad, y + pad, inner)}${glyph(d, x + pad, y + pad, inner)}</g>` +
      tape("zicons", left + 14, 190) +
      text(name, left, base, nameSize) +
      text("free SVG for React, Vue and Svelte", left, base + 66, 46, { font: "hand" }) +
      text("brush-drawn, MIT licensed", left, base + 122, 42, { font: "hand", fill: SOFT }) +
      footer(left),
  );
}

export function ogDefault(ds: string[]): string {
  const size = 130;
  const gap = 28;
  const left = W - 90 - (3 * size + 2 * gap);
  const tilts = [-2.4, 1.6, -0.8, 2.2, -1.6, 1.2];
  const tiles = ds
    .slice(0, 6)
    .map((d, k) => {
      const x = left + (k % 3) * (size + gap);
      const y = 150 + Math.floor(k / 3) * (size + 44);
      const inner = size * 0.6;
      const off = (size - inner) / 2;
      const ink = k === 1 || k === 5 ? CORAL : INK;
      return `${card(x, y, size, tilts[k])}<g transform="rotate(${tilts[k]} ${x + size / 2} ${y + size / 2})">${glyph(d, x + off, y + off, inner, ink, 1.7)}</g>`;
    })
    .join("");
  return frame(
    tiles +
      text("zicons", 90, 270, 140) +
      text("brush-drawn icons for any site", 94, 345, 46, { font: "hand" }) +
      text("SVG, React, Vue and Svelte", 94, 400, 42, { font: "hand", fill: SOFT }) +
      footer(94),
  );
}
