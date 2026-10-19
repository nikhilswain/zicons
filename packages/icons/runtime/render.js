export const SEEDS = [3, 11, 23];
export const BOIL_RATE = 0.36;
export const BOIL = {
  big: { freq: 0.03, scale: 4 },
  small: { freq: 0.09, scale: 1.4 },
};
export const BIG_FROM = 32;
export const DEFAULTS = { size: 24, color: "currentColor", strokeWidth: 1.6 };

const round = (n) => Math.round(n * 1000) / 1000;

export function numericSize(size) {
  if (typeof size === "number") return Number.isFinite(size) && size > 0 ? size : null;
  if (typeof size === "string") {
    const m = /^\s*(\d+(?:\.\d+)?)\s*(?:px)?\s*$/.exec(size);
    if (m && Number(m[1]) > 0) return Number(m[1]);
  }
  return null;
}

const INTERACTIVE = "a[href],button,summary,label,[role=button],[role=link],[role=menuitem],[role=tab]";

export const pixelSize = (size) => numericSize(size) ?? DEFAULTS.size;

export function boilMode(boil) {
  if (boil === "hover") return "hover";
  if (boil === true || boil === "" || boil === "true") return "always";
  return null;
}

export function resolveProps(p = {}) {
  const size = p.size ?? DEFAULTS.size;
  const base = Number(p.strokeWidth ?? DEFAULTS.strokeWidth);
  const n = numericSize(size);
  const mode = boilMode(p.boil);
  const labelled = Boolean(p["aria-label"] || p["aria-labelledby"]);
  return {
    width: size,
    height: size,
    stroke: p.color ?? DEFAULTS.color,
    strokeWidth: p.absoluteStrokeWidth && n ? round((base * DEFAULTS.size) / n) : base,
    a11y: labelled ? { role: "img" } : { "aria-hidden": "true" },
    boil: mode && { strength: pixelSize(size) >= BIG_FROM ? "big" : "small", hover: mode === "hover" },
  };
}

export const safeId = (raw) => `zi${String(raw).replace(/[^A-Za-z0-9_-]/g, "")}`;

export function boilMarkup(id, boil, px) {
  const v = BOIL[boil.strength];
  const k = DEFAULTS.size / px;
  const filter = `<filter id="${id}-f" filterUnits="userSpaceOnUse" x="-3" y="-3" width="30" height="30"><feTurbulence type="fractalNoise" baseFrequency="${round(v.freq / k)}" numOctaves="2" seed="${SEEDS[0]}"><animate attributeName="seed" values="${SEEDS.join(";")}" dur="${BOIL_RATE}s" calcMode="discrete" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="${round(v.scale * k)}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  if (!boil.hover) return filter;
  const at = `[data-zi="${id}"]`;
  return `${filter}<style>${at}:hover path,:is(${INTERACTIVE}):is(:hover,:focus-visible) ${at} path{filter:url(#${id}-f)}</style>`;
}

export const boilPathFilter = (id, boil) => (boil && !boil.hover ? `url(#${id}-f)` : undefined);

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

let count = 0;

export function toSvg(icon, options = {}) {
  const { size, color, strokeWidth, absoluteStrokeWidth, boil, id, attrs = {}, ...aria } = options;
  const r = resolveProps({ size, color, strokeWidth, absoluteStrokeWidth, boil, ...aria, ...attrs });
  const zi = r.boil ? (id ? safeId(id) : safeId(`t${++count}`)) : null;
  const all = {
    xmlns: "http://www.w3.org/2000/svg",
    width: r.width,
    height: r.height,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: r.stroke,
    "stroke-width": r.strokeWidth,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...r.a11y,
    ...aria,
    ...attrs,
    ...(zi ? { "data-zi": zi } : {}),
  };
  const head = Object.entries(all)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => `${k}="${esc(v)}"`)
    .join(" ");
  const defs = zi ? `<defs>${boilMarkup(zi, r.boil, pixelSize(r.width))}</defs>` : "";
  const filter = zi ? boilPathFilter(zi, r.boil) : undefined;
  return `<svg ${head}>${defs}<path d="${icon.d}"${filter ? ` filter="${filter}"` : ""}/></svg>`;
}
