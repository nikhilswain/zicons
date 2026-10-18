import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { hash, sampleIcon } from "./geometry.mjs";
import { toPathData } from "./svg.mjs";

export const GROUP_TITLES = { core: "Tools", canvas: "Canvas", ui: "Interface", common: "General", art: "Art" };

const order = Object.keys(GROUP_TITLES);
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const rank = (group) => {
  const i = order.indexOf(group);
  return i < 0 ? order.length : i;
};

export async function loadCatalog(root) {
  const files = readdirSync(join(root, "defs"))
    .filter((f) => f.endsWith(".mjs"))
    .map((f) => f.replace(/\.mjs$/, ""))
    .sort((a, b) => rank(a) - rank(b) || byName(a, b));

  const tagsAt = join(root, "tags.json");
  const tags = existsSync(tagsAt) ? JSON.parse(readFileSync(tagsAt, "utf8")) : {};

  const groups = [];
  const icons = [];
  const seen = new Set();
  for (const group of files) {
    const mod = (await import(pathToFileURL(join(root, "defs", `${group}.mjs`)).href)).default;
    const names = Object.keys(mod);
    for (const name of names) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new Error(`Bad icon name "${name}" in ${group}.mjs`);
      if (seen.has(name)) throw new Error(`Icon "${name}" defined twice`);
      seen.add(name);
      const d = sampleIcon(mod[name], hash(name)).map(toPathData).join("");
      icons.push({ name, group, groupTitle: GROUP_TITLES[group] ?? group, tags: tags[name] ?? [], d });
    }
    groups.push([group, names]);
  }

  const stray = Object.keys(tags).filter((n) => !seen.has(n));
  return { groups, icons, untagged: icons.filter((i) => i.tags.length === 0).map((i) => i.name), stray };
}
