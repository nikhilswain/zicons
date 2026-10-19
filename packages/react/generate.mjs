import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pascal } from "../icons/lib/exports.mjs";

const at = (p) => new URL(p, import.meta.url);
const icons = JSON.parse(readFileSync(at("../icons/dist/icons.json"), "utf8"));

rmSync(at("dist"), { recursive: true, force: true });
mkdirSync(at("dist/icons"), { recursive: true });
copyFileSync(at("src/create.js"), at("dist/create.js"));
copyFileSync(at("src/types.d.ts"), at("dist/types.d.ts"));

for (const { name, d } of icons) {
  writeFileSync(
    at(`dist/icons/${name}.js`),
    `import { createIcon } from "../create.js";\nexport default createIcon(${JSON.stringify(d)}, "${pascal(name)}Icon");\n`,
  );
}

const js = icons.map(({ name }) => `export { default as ${pascal(name)}Icon } from "./icons/${name}.js";`);
const dts = [
  'import type { ZiconComponent } from "./types.js";',
  'export type { ZiconProps, ZiconComponent } from "./types.js";',
  ...icons.map(({ name }) => `export declare const ${pascal(name)}Icon: ZiconComponent;`),
];
writeFileSync(at("dist/index.js"), `${js.join("\n")}\n`);
writeFileSync(at("dist/index.d.ts"), `${dts.join("\n")}\n`);
console.log(`zicons-react: ${icons.length}`);
