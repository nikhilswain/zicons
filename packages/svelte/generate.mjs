import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { pascal } from "../icons/lib/exports.mjs";
import { loadIcons } from "../icons/lib/packages.mjs";

const at = (p) => new URL(p, import.meta.url);
const icons = loadIcons();

rmSync(at("dist"), { recursive: true, force: true });
mkdirSync(at("dist/icons"), { recursive: true });
copyFileSync(at("src/Icon.svelte"), at("dist/Icon.svelte"));
copyFileSync(at("src/types.d.ts"), at("dist/types.d.ts"));

for (const { name, d } of icons) {
  writeFileSync(
    at(`dist/icons/${pascal(name)}Icon.svelte`),
    `<script>\n  import Icon from "../Icon.svelte";\n\n  let props = $props();\n</script>\n\n<Icon d=${JSON.stringify(d)} {...props} />\n`,
  );
}

const js = icons.map(({ name }) => `export { default as ${pascal(name)}Icon } from "./icons/${pascal(name)}Icon.svelte";`);
const dts = [
  'import type { ZiconComponent } from "./types.js";',
  'export type { ZiconProps, ZiconComponent } from "./types.js";',
  ...icons.map(({ name }) => `export declare const ${pascal(name)}Icon: ZiconComponent;`),
];
writeFileSync(at("dist/index.js"), `${js.join("\n")}\n`);
writeFileSync(at("dist/index.d.ts"), `${dts.join("\n")}\n`);
console.log(`zicons-svelte: ${icons.length}`);
