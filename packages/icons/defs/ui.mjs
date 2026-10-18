import { arc, dot, mirrorX, path, poly, rect, ring, rotate, seg } from "../lib/geometry.mjs";

const open = (points, radii) => poly(points, radii, { closed: false });
const chevron = { strokes: [open([[6.2, 9.2], [12, 15], [17.8, 9.3]], [0, 1.8, 0])] };
const frame = rect(12, 12, 16.8, 15, 2.6);
const panelLeft = {
  strokes: [frame, seg(9.2, 4.8, 9.3, 19.2), open([[13, 9.4], [15.6, 12], [13.1, 14.6]], [0, 1.2, 0])],
};
const tray = open([[4.2, 15], [4.4, 19.7], [19.6, 19.6], [19.8, 15]], [0, 2.2, 2.2, 0]);
const dockLeft = { strokes: [frame, seg(7.7, 8.4, 7.8, 15.6)] };

function cog(teeth, rOut, rIn, half, gap) {
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i * 360) / teeth - 90;
    for (const d of [-gap, -half, half, gap]) {
      const t = ((a + d) * Math.PI) / 180;
      const r = Math.abs(d) === half ? rOut : rIn;
      pts.push([12 + r * Math.cos(t), 12 + r * Math.sin(t)]);
    }
  }
  return poly(pts, 0.9);
}

export default {
  "chevron-down": chevron,
  "chevron-up": rotate(chevron, 180),
  "chevron-left": rotate(chevron, 90),
  "chevron-right": rotate(chevron, -90),
  "panel-left-open": panelLeft,
  "panel-right-open": mirrorX(panelLeft),
  grip: {
    strokes: [
      ring(9, 5.6, 0.7), ring(15, 5.6, 0.7),
      ring(9, 12, 0.7), ring(15, 12, 0.7),
      ring(9, 18.4, 0.7), ring(15, 18.4, 0.7),
    ],
  },
  "dock-left": dockLeft,
  "dock-right": mirrorX(dockLeft),
  "dock-bottom": { strokes: [frame, seg(8.4, 15.4, 15.6, 15.5)] },
  search: { strokes: [ring(10.6, 10.5, 6.3), seg(15.3, 15.3, 20, 20.1)] },
  close: { strokes: [seg(6, 6.1, 18, 17.9), seg(18, 6, 6.1, 18)] },
  check: { strokes: [open([[4.6, 12.7], [9.3, 17.4], [19.4, 6.9]], [0, 1.6, 0])] },
  loader: { strokes: [arc(12, 12, 8.2, -90, 180)] },
  settings: { strokes: [cog(7, 9.6, 6.9, 11, 19), ring(12, 12, 2.8)] },
  "layout-grid": {
    strokes: [
      rect(7.3, 7.3, 6.6, 6.6, 1.8),
      rect(16.7, 7.3, 6.6, 6.6, 1.8),
      rect(7.3, 16.7, 6.6, 6.6, 1.8),
      rect(16.7, 16.7, 6.6, 6.6, 1.8),
    ],
  },
  masonry: {
    strokes: [
      rect(7.3, 7.7, 6.6, 7.4, 1.8),
      rect(7.3, 17.1, 6.6, 5.8, 1.8),
      rect(16.7, 6.8, 6.6, 5.6, 1.8),
      rect(16.7, 16.2, 6.6, 7.6, 1.8),
    ],
  },
  list: {
    strokes: [
      dot(4.8, 6.4), seg(9, 6.4, 19.8, 6.3),
      dot(4.8, 12), seg(9, 12, 19.8, 12.1),
      dot(4.8, 17.6), seg(9, 17.6, 19.8, 17.5),
    ],
  },
  download: {
    strokes: [seg(12, 3.9, 12.1, 14.4), open([[7.7, 10.3], [12, 14.6], [16.3, 10.3]], [0, 1.4, 0]), tray],
  },
  upload: {
    strokes: [seg(12, 15, 12.1, 4.5), open([[7.7, 8.7], [12, 4.4], [16.3, 8.7]], [0, 1.4, 0]), tray],
  },
  link: rotate(
    {
      strokes: [
        open([[9.8, 7.4], [4.1, 7.5], [4.2, 16.5], [9.8, 16.6]], [0, 3.4, 3.4, 0]),
        open([[14.2, 7.4], [19.9, 7.5], [19.8, 16.5], [14.2, 16.6]], [0, 3.4, 3.4, 0]),
        seg(8.6, 12, 15.4, 12.1),
      ],
    },
    -45,
  ),
  "external-link": {
    strokes: [
      open([[11, 4.8], [4.6, 4.9], [4.7, 19.4], [19.2, 19.3], [19.1, 13]], [0, 2.4, 2.4, 2.4, 0]),
      seg(11.4, 12.6, 19.4, 4.6),
      open([[14.1, 4.3], [19.8, 4.2], [19.7, 9.9]], [0, 1.4, 0]),
    ],
  },
  share: {
    strokes: [
      open([[8.4, 9.4], [5.6, 9.5], [5.7, 20.1], [18.3, 20], [18.4, 9.4], [15.6, 9.4]], [0, 2, 2.4, 2.4, 2, 0]),
      seg(12, 14.6, 12.1, 3.7),
      open([[8.6, 7], [12.1, 3.6], [15.4, 7]], [0, 1.2, 0]),
    ],
  },
  "alert-circle": { strokes: [ring(12, 12, 8.6), seg(12, 7.5, 12.1, 12.7), dot(12, 16.4)] },
  "check-circle": { strokes: [ring(12, 12, 8.6), open([[8, 12.4], [10.9, 15.2], [16.2, 9.4]], [0, 1.2, 0])] },
};
