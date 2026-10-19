import { BOIL, SEEDS } from "zicons/render";

export const WOBBLE_VERSION = 1;

const filter = (id: string, freq: number, scale: number, seed: number) =>
  `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;

export function wobbleDefs(): string {
  const big = SEEDS.map((s, k) => filter(`zi-boil-${k + 1}`, BOIL.big.freq, BOIL.big.scale, s)).join("");
  const small = SEEDS.map((s, k) => filter(`zi-boil-sm-${k + 1}`, BOIL.small.freq, BOIL.small.scale, s)).join("");
  return `<svg aria-hidden="true" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">${big}${small}</svg>`;
}

export const WOBBLE_CSS = `@keyframes zi-boil{0%{filter:url(#zi-boil-1)}33.333%{filter:url(#zi-boil-2)}66.666%{filter:url(#zi-boil-3)}}
@keyframes zi-boil-sm{0%{filter:url(#zi-boil-sm-1)}33.333%{filter:url(#zi-boil-sm-2)}66.666%{filter:url(#zi-boil-sm-3)}}
.zi-boil{animation:zi-boil .36s steps(1) infinite}
.zi-boil-sm{animation:zi-boil-sm .36s steps(1) infinite}`;

export function wobbleScript(): string {
  return `(function () {
  var DEFS = ${JSON.stringify(wobbleDefs())};
  var CSS = ${JSON.stringify(WOBBLE_CSS)};
  var done = false;
  function wobble(options) {
    var o = options || {};
    if (done) return;
    if (o.respectReducedMotion && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    done = true;
    var holder = document.createElement("div");
    holder.innerHTML = DEFS;
    document.body.appendChild(holder.firstChild);
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  window.zicons = window.zicons || {};
  window.zicons.wobble = wobble;
  var auto = document.currentScript && document.currentScript.getAttribute("data-manual") === null;
  var opts = { respectReducedMotion: !!(document.currentScript && document.currentScript.hasAttribute("data-respect-reduced-motion")) };
  if (!auto) return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { wobble(opts); });
  else wobble(opts);
})();
`;
}
