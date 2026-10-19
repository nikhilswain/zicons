import { BOIL, SEEDS } from "zicons/render";

const W = 1200;
const H = 630;
const INK = "#1d1b18";
const PAPER = "#f4efe3";
const CARD = "#fffdf7";
const CORAL = "#ff6b5b";

const frame = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="#cfc6b1"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>
${body}
</svg>`;

const card = (x: number, y: number, size: number, tilt = 0) =>
  `<g transform="rotate(${tilt} ${x + size / 2} ${y + size / 2})"><rect x="${x + size * 0.03}" y="${y + size * 0.035}" width="${size}" height="${size}" rx="${size * 0.07}" fill="${INK}"/><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.07}" fill="${CARD}" stroke="${INK}" stroke-width="${Math.max(3, size * 0.012)}"/></g>`;

let count = 0;

const brush = (x: number, y: number, size: number) => {
  const id = `brush${++count}`;
  const pad = size * 0.12;
  return {
    id,
    def: `<filter id="${id}" filterUnits="userSpaceOnUse" x="${x - pad}" y="${y - pad}" width="${size + 2 * pad}" height="${size + 2 * pad}"><feTurbulence type="fractalNoise" baseFrequency="${BOIL.big.freq}" numOctaves="2" seed="${SEEDS[0]}"/><feDisplacementMap in="SourceGraphic" scale="${BOIL.big.scale * 1.5}" xChannelSelector="R" yChannelSelector="G"/></filter>`,
  };
};

const glyph = (d: string, x: number, y: number, size: number, color = INK, stroke = 1.6) => {
  const f = brush(x, y, size);
  return `<defs>${f.def}</defs><g filter="url(#${f.id})"><g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
};

const grid = (x: number, y: number, size: number) => {
  const step = size / 24;
  const lines: string[] = [];
  for (let k = 1; k < 24; k++) {
    lines.push(`M${x + k * step} ${y}V${y + size}`, `M${x} ${y + k * step}H${x + size}`);
  }
  return `<path d="${lines.join("")}" stroke="${INK}" stroke-opacity="0.07" stroke-width="1"/><rect x="${x + 3 * step}" y="${y + 3 * step}" width="${18 * step}" height="${18 * step}" fill="none" stroke="${CORAL}" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="8 7"/>`;
};

export function ogIcon(d: string, doodles: string[]): string {
  const size = 470;
  const x = (W - size) / 2;
  const y = (H - size) / 2 - 6;
  const inner = size * 0.82;
  const pad = (size - inner) / 2;
  const side = doodles
    .slice(0, 4)
    .map((dd, k) => {
      const spots = [
        [110, 120, -8],
        [130, 400, 6],
        [980, 110, 7],
        [960, 390, -5],
      ];
      const [sx, sy] = spots[k];
      return glyph(dd, sx, sy, 110, k % 2 ? CORAL : INK, 1.8);
    })
    .join("");
  return frame(`${side}${card(x, y, size, -1.2)}<g transform="rotate(-1.2 ${W / 2} ${H / 2})">${grid(x + pad, y + pad, inner)}${glyph(d, x + pad, y + pad, inner)}</g>`);
}

export function ogDefault(ds: string[]): string {
  const size = 190;
  const gap = 36;
  const cols = 5;
  const total = cols * size + (cols - 1) * gap;
  const left = (W - total) / 2;
  const tilts = [-2.4, 1.6, -0.8, 2.2, -1.6, 1.2, -2, 0.8, 2.4, -1.2];
  const tiles = ds
    .slice(0, 10)
    .map((d, k) => {
      const x = left + (k % cols) * (size + gap);
      const y = 70 + Math.floor(k / cols) * (size + 60);
      const inner = size * 0.6;
      const off = (size - inner) / 2;
      const ink = k === 2 || k === 7 ? CORAL : INK;
      return `${card(x, y, size, tilts[k])}<g transform="rotate(${tilts[k]} ${x + size / 2} ${y + size / 2})">${glyph(d, x + off, y + off, inner, ink, 1.7)}</g>`;
    })
    .join("");
  return frame(tiles);
}
