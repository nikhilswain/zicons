import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUP_TITLES, loadCatalog } from "./lib/catalog.mjs";
import { STYLE, iconSvg, spriteSvg } from "./lib/svg.mjs";
import { writeExports } from "./lib/exports.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const { groups, icons, untagged, stray } = await loadCatalog(root);
const paths = new Map(icons.map((i) => [i.name, i.d]));
const sorted = [...paths].sort(([a], [b]) => byName(a, b));

rmSync(join(root, "svg"), { recursive: true, force: true });
mkdirSync(join(root, "svg"));
for (const [name, d] of sorted) writeFileSync(join(root, "svg", `${name}.svg`), iconSvg(d));
writeFileSync(join(root, "sprite.svg"), spriteSvg(sorted));

mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist", "icons.json"), `${JSON.stringify(icons, null, 2)}\n`);
writeExports(join(root, "dist"), icons);

{
  const svg = (d, px) => `<svg width="${px}" height="${px}" viewBox="${STYLE.viewBox}" fill="none" stroke="currentColor" stroke-width="${STYLE.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const cell = (name) => `<figure><div class="sizes">${[14, 18, 24, 56].map((px) => svg(paths.get(name), px)).join("")}</div><figcaption>${name}</figcaption></figure>`;
  const bar = icons.filter((i) => i.group === "core" || i.group === "ui").slice(0, 14).map((i, k) => `<span class="tile${k === 1 ? " on" : ""}">${svg(i.d, 18)}</span>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>zicons</title><style>
body{margin:0;background:#0E0E10;color:#ECEBE7;font:13px/1.4 system-ui,sans-serif;padding:32px}
h1{font-size:20px;margin:0 0 4px}h2{font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:#9C9A94;margin:32px 0 12px}
.bar{display:flex;gap:2px;padding:8px;background:#141416;border-radius:6px;width:max-content}
.tile{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:4px}.tile.on{background:#2A2A2F;color:#FF6B5B}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
figure{margin:0;background:#141416;border-radius:6px;padding:14px}
.sizes{display:flex;align-items:flex-end;gap:14px}
figcaption{margin-top:10px;color:#C4C2BC;font-size:12px}
</style></head><body><h1>zicons</h1><p style="color:#9C9A94;margin:0">${paths.size} brush-drawn icons. Sizes 14 / 18 / 24 / 56 px.</p>
<h2>In a bar</h2><div class="bar">${bar}</div>
${groups.map(([g, names]) => `<h2>${GROUP_TITLES[g] ?? g}</h2><div class="grid">${names.map(cell).join("")}</div>`).join("\n")}
</body></html>`;
  writeFileSync(join(root, "gallery.html"), html);
}

if (untagged.length) console.warn(`icons without tags: ${untagged.join(", ")}`);
if (stray.length) console.warn(`tags.json names unknown icons: ${stray.join(", ")}`);
console.log(`icons: ${paths.size}`);
