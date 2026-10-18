const TOLERANCE = 0.06;

const fmt = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? "0" : String(v);
};
const pair = (p) => `${fmt(p[0])} ${fmt(p[1])}`;
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

function deviation(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function simplify(points) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let best = -1;
    let at = -1;
    for (let k = s + 1; k < e; k++) {
      const d = deviation(points[k], points[s], points[e]);
      if (d > best) {
        best = d;
        at = k;
      }
    }
    if (best > TOLERANCE) {
      keep[at] = 1;
      stack.push([s, at], [at, e]);
    }
  }
  return points.filter((_, k) => keep[k]);
}

export function toPathData(stroke) {
  if (stroke.dot) return `M${pair(stroke.points[0])}h.01`;
  if (stroke.closed) {
    const ring = simplify(stroke.points).slice(0, -1);
    const n = ring.length;
    let d = `M${pair(mid(ring[n - 1], ring[0]))}`;
    for (let k = 0; k < n; k++) d += `Q${pair(ring[k])} ${pair(mid(ring[k], ring[(k + 1) % n]))}`;
    return `${d}Z`;
  }
  const pts = simplify(stroke.points);
  if (pts.length === 2) return `M${pair(pts[0])}L${pair(pts[1])}`;
  let d = `M${pair(pts[0])}`;
  for (let k = 1; k < pts.length - 1; k++) d += `Q${pair(pts[k])} ${pair(k === pts.length - 2 ? pts[k + 1] : mid(pts[k], pts[k + 1]))}`;
  return d;
}

export const STYLE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const styleAttrs = `fill="${STYLE.fill}" stroke="${STYLE.stroke}" stroke-width="${STYLE.strokeWidth}" stroke-linecap="${STYLE.strokeLinecap}" stroke-linejoin="${STYLE.strokeLinejoin}"`;
const symbolAttrs = `fill="${STYLE.fill}" stroke="${STYLE.stroke}" stroke-linecap="${STYLE.strokeLinecap}" stroke-linejoin="${STYLE.strokeLinejoin}"`;

export const iconSvg = (d) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${STYLE.viewBox}" ${styleAttrs}><path d="${d}"/></svg>\n`;

export const spriteSvg = (icons) =>
  `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${icons
    .map(([name, d]) => `<symbol id="${name}" viewBox="${STYLE.viewBox}" ${symbolAttrs}><path d="${d}"/></symbol>`)
    .join("\n")}\n</svg>\n`;
