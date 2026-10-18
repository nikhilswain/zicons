const STEP = 0.35;
const BOW = 0.35;

export const poly = (points, radii = 0, opts = {}) => ({
  kind: "poly",
  points,
  radii: Array.isArray(radii) ? radii : points.map(() => radii),
  closed: opts.closed ?? true,
});
export const seg = (x1, y1, x2, y2) => poly([[x1, y1], [x2, y2]], 0, { closed: false });
export const path = (d) => ({ kind: "path", d });
export const soft = (d, radius) => ({ kind: "soft", d, radius });
export const dot = (x, y) => ({ kind: "dot", x, y });
export const ring = (cx, cy, r) => ({ kind: "ring", cx, cy, r });
export const arc = (cx, cy, r, from, to) => ({ kind: "arc", cx, cy, r, from, to });

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function quad(a, c, b, n) {
  const out = [];
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    const u = 1 - t;
    out.push([
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ]);
  }
  return out;
}

function cubic(a, c1, c2, b, n) {
  const out = [];
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    const u = 1 - t;
    const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    out.push([
      w[0] * a[0] + w[1] * c1[0] + w[2] * c2[0] + w[3] * b[0],
      w[0] * a[1] + w[1] * c1[1] + w[2] * c2[1] + w[3] * b[1],
    ]);
  }
  return out;
}

function line(a, b) {
  const n = Math.max(1, Math.ceil(dist(a, b) / STEP));
  const out = [];
  for (let k = 1; k <= n; k++) out.push(lerp(a, b, k / n));
  return out;
}

function svgArc(p0, rx, ry, phi, large, sweep, p1) {
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2;
  const dy = (p0[1] - p1[1]) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  let lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const coef = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cx1 = (coef * rx * y1) / ry;
  const cy1 = (-coef * ry * x1) / rx;
  const cx = cos * cx1 - sin * cy1 + (p0[0] + p1[0]) / 2;
  const cy = sin * cx1 + cos * cy1 + (p0[1] + p1[1]) / 2;
  const angle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t0 = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
  let dt = angle((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(4, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / STEP));
  const out = [];
  for (let k = 1; k <= n; k++) {
    const t = t0 + (dt * k) / n;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    out.push([cos * x - sin * y + cx, sin * x + cos * y + cy]);
  }
  return out;
}

export function parsePath(d) {
  const toks = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  const subs = [];
  let i = 0;
  let cmd = "";
  let cur = null;
  let pos = [0, 0];
  let start = [0, 0];
  let lastCtrl = null;
  const isNum = () => i < toks.length && !/^[a-zA-Z]$/.test(toks[i]);
  const num = () => parseFloat(toks[i++]);
  const pt = (rel) => {
    const x = num();
    const y = num();
    return rel ? [pos[0] + x, pos[1] + y] : [x, y];
  };
  while (i < toks.length) {
    if (!isNum()) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "M") {
      pos = pt(rel);
      start = pos;
      cur = { points: [pos], closed: false };
      subs.push(cur);
      cmd = rel ? "l" : "L";
      lastCtrl = null;
    } else if (C === "L") {
      const p = pt(rel);
      cur.points.push(...line(pos, p));
      pos = p;
      lastCtrl = null;
    } else if (C === "H") {
      const x = num();
      const p = [rel ? pos[0] + x : x, pos[1]];
      cur.points.push(...line(pos, p));
      pos = p;
      lastCtrl = null;
    } else if (C === "V") {
      const y = num();
      const p = [pos[0], rel ? pos[1] + y : y];
      cur.points.push(...line(pos, p));
      pos = p;
      lastCtrl = null;
    } else if (C === "C" || C === "S") {
      const c1 = C === "C" ? pt(rel) : lastCtrl ? [2 * pos[0] - lastCtrl[0], 2 * pos[1] - lastCtrl[1]] : pos;
      const c2 = pt(rel);
      const p = pt(rel);
      const n = Math.max(6, Math.ceil((dist(pos, c1) + dist(c1, c2) + dist(c2, p)) / STEP));
      cur.points.push(...cubic(pos, c1, c2, p, n));
      lastCtrl = c2;
      pos = p;
    } else if (C === "Q") {
      const c = pt(rel);
      const p = pt(rel);
      cur.points.push(...quad(pos, c, p, Math.max(6, Math.ceil((dist(pos, c) + dist(c, p)) / STEP))));
      pos = p;
      lastCtrl = null;
    } else if (C === "A") {
      const rx = num();
      const ry = num();
      const phi = (num() * Math.PI) / 180;
      const large = num() ? 1 : 0;
      const sweep = num() ? 1 : 0;
      const p = pt(rel);
      cur.points.push(...svgArc(pos, rx, ry, phi, large, sweep, p));
      pos = p;
      lastCtrl = null;
    } else if (C === "Z") {
      if (dist(pos, start) > 0.01) cur.points.push(...line(pos, start));
      cur.closed = true;
      pos = start;
      lastCtrl = null;
    } else {
      throw new Error(`Unsupported path command ${cmd} in "${d}"`);
    }
  }
  return subs;
}

export function resample(points, step = STEP) {
  const out = [points[0]];
  let carry = 0;
  for (let k = 1; k < points.length; k++) {
    let a = points[k - 1];
    const b = points[k];
    let d = dist(a, b);
    while (carry + d >= step && d > 1e-9) {
      const t = (step - carry) / d;
      a = lerp(a, b, t);
      out.push(a);
      d = dist(a, b);
      carry = 0;
    }
    carry += d;
  }
  const last = points[points.length - 1];
  if (dist(out[out.length - 1], last) > 1e-6) out.push(last);
  return out;
}

function smooth(points, radius, closed) {
  const src = closed ? points.slice(0, -1) : points;
  const n = src.length;
  const w = Math.max(1, Math.round(radius / STEP));
  const out = src.map((_, k) => {
    let sx = 0;
    let sy = 0;
    let c = 0;
    for (let j = -w; j <= w; j++) {
      let idx = k + j;
      if (closed) idx = ((idx % n) + n) % n;
      else if (idx < 0 || idx >= n) continue;
      sx += src[idx][0];
      sy += src[idx][1];
      c++;
    }
    return [sx / c, sy / c];
  });
  if (!closed) {
    out[0] = src[0];
    out[n - 1] = src[n - 1];
  }
  return closed ? [...out, out[0]] : out;
}

function roundedPoly(V, R, closed, random) {
  const n = V.length;
  const cut = (i, j, rad) => {
    const l = dist(V[i], V[j]);
    return lerp(V[i], V[j], Math.min(rad, l * 0.45) / l);
  };
  const corners = V.map((v, i) => {
    const rounded = (closed || (i > 0 && i < n - 1)) && R[i] > 0;
    if (!rounded) return { a: v, b: v, v, rounded };
    return { a: cut(i, (i - 1 + n) % n, R[i]), b: cut(i, (i + 1) % n, R[i]), v, rounded };
  });
  const pts = [corners[0].b];
  const edges = closed ? n : n - 1;
  for (let e = 0; e < edges; e++) {
    const from = corners[e].b;
    const next = corners[(e + 1) % n];
    const to = next.a;
    const l = dist(from, to);
    if (l > 1e-6) {
      const k = (random() * 2 - 1) * BOW * Math.min(1, l / 8);
      const mid = [
        (from[0] + to[0]) / 2 - ((to[1] - from[1]) / l) * k,
        (from[1] + to[1]) / 2 + ((to[0] - from[0]) / l) * k,
      ];
      pts.push(...quad(from, mid, to, Math.max(4, Math.ceil(l / STEP))));
    }
    if (next.rounded) pts.push(...quad(next.a, next.v, next.b, 12));
  }
  return { points: pts, closed };
}

function circlePoints(cx, cy, r, from, to, random) {
  const p1 = random() * Math.PI * 2;
  const p2 = random() * Math.PI * 2;
  const a1 = 0.028;
  const a2 = 0.016;
  const span = to - from;
  const n = Math.max(12, Math.ceil((Math.abs(span) * r) / STEP));
  const out = [];
  for (let k = 0; k <= n; k++) {
    const t = from + (span * k) / n;
    const rr = r * (1 + a1 * Math.sin(2 * t + p1) + a2 * Math.sin(3 * t + p2));
    out.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
  }
  return out;
}

export function sampleIcon(def, seed) {
  const random = rng(seed);
  return def.strokes.flatMap((s) => {
    if (s.kind === "poly") {
      const p = roundedPoly(s.points, s.radii, s.closed, random);
      return [{ points: resample(p.points), closed: p.closed }];
    }
    if (s.kind === "path") {
      return parsePath(s.d).map((sub) => ({ points: resample(sub.points), closed: sub.closed }));
    }
    if (s.kind === "soft") {
      return parsePath(s.d).map((sub) => ({
        points: smooth(resample(sub.points), s.radius, sub.closed),
        closed: sub.closed,
      }));
    }
    if (s.kind === "dot") return [{ points: [[s.x, s.y]], closed: false, dot: true }];
    if (s.kind === "ring") {
      const pts = circlePoints(s.cx, s.cy, s.r, 0, Math.PI * 2, random);
      pts[pts.length - 1] = pts[0];
      return [{ points: pts, closed: true }];
    }
    if (s.kind === "arc") {
      const rad = (deg) => (deg * Math.PI) / 180;
      return [{ points: circlePoints(s.cx, s.cy, s.r, rad(s.from), rad(s.to), random), closed: false }];
    }
    throw new Error(`Unknown stroke kind ${s.kind}`);
  });
}

export function mirrorX(def) {
  const flip = (p) => [24 - p[0], p[1]];
  return {
    strokes: def.strokes.map((s) => {
      if (s.kind === "poly") return { ...s, points: s.points.map(flip) };
      if (s.kind === "dot") return { ...s, x: 24 - s.x };
      if (s.kind === "ring") return { ...s, cx: 24 - s.cx };
      if (s.kind === "arc") return { ...s, cx: 24 - s.cx, from: 180 - s.to, to: 180 - s.from };
      throw new Error(`mirrorX does not support ${s.kind}`);
    }),
  };
}

export function rotate(def, deg) {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const turn = ([x, y]) => [12 + (x - 12) * c - (y - 12) * s, 12 + (x - 12) * s + (y - 12) * c];
  return {
    strokes: def.strokes.map((st) => {
      if (st.kind === "poly") return { ...st, points: st.points.map(turn) };
      if (st.kind === "dot") {
        const [x, y] = turn([st.x, st.y]);
        return { ...st, x, y };
      }
      if (st.kind === "ring" || st.kind === "arc") {
        const [cx, cy] = turn([st.cx, st.cy]);
        return st.kind === "arc" ? { ...st, cx, cy, from: st.from + deg, to: st.to + deg } : { ...st, cx, cy };
      }
      throw new Error(`rotate does not support ${st.kind}`);
    }),
  };
}

export function rect(cx, cy, w, h, radius, deg = 0) {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const corner = (dx, dy) => [cx + dx * c - dy * s, cy + dx * s + dy * c];
  return poly([corner(-w / 2, -h / 2), corner(w / 2, -h / 2), corner(w / 2, h / 2), corner(-w / 2, h / 2)], radius);
}

export function arrowHead(x, y, deg, len = 3.2, spread = 3) {
  const t = (deg * Math.PI) / 180;
  const d = [Math.cos(t), Math.sin(t)];
  const p = [-d[1], d[0]];
  const back = [x - len * d[0], y - len * d[1]];
  return poly(
    [[back[0] + spread * p[0], back[1] + spread * p[1]], [x, y], [back[0] - spread * p[0], back[1] - spread * p[1]]],
    [0, 1.2, 0],
    { closed: false },
  );
}

export function regular(cx, cy, sides, r, radius, startDeg = -90) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const t = ((startDeg + (i * 360) / sides) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return poly(pts, radius);
}

export function star(cx, cy, points, rOut, rIn, radii = [1.2, 0.8]) {
  const pts = [];
  const rs = [];
  for (let i = 0; i < points * 2; i++) {
    const t = ((-90 + (i * 180) / points) * Math.PI) / 180;
    const r = i % 2 ? rIn : rOut;
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    rs.push(i % 2 ? radii[1] : radii[0]);
  }
  return poly(pts, rs);
}

export const combine = (...defs) => ({ strokes: defs.flatMap((d) => d.strokes) });
