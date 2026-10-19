import { writeFileSync } from "node:fs";
import { join } from "node:path";

const RESERVED = new Set(
  "break case catch class const continue debugger default delete do else enum export extends false finally for function if import in instanceof let new null return static super switch this throw true try typeof var void while with yield await implements interface package private protected public arguments eval".split(" "),
);

export const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function writeExports(dir, icons) {
  const names = icons.map((i) => {
    const id = camel(i.name);
    if (RESERVED.has(id)) throw new Error(`Icon "${i.name}" becomes the reserved word "${id}" as an export. Rename it.`);
    return [id, i];
  });
  const js = [
    'export { toSvg } from "../runtime/render.js";',
    ...names.map(([id, i]) => `export const ${id} = { name: ${JSON.stringify(i.name)}, d: ${JSON.stringify(i.d)} };`),
  ].join("\n");
  const dts = [
    'import type { IconData } from "../runtime/render.js";',
    'export type { IconData, ToSvgOptions, ZiconProps, Boil } from "../runtime/render.js";',
    'export { toSvg } from "../runtime/render.js";',
    ...names.map(([id]) => `export declare const ${id}: IconData;`),
  ].join("\n");
  writeFileSync(join(dir, "index.js"), `${js}\n`);
  writeFileSync(join(dir, "index.d.ts"), `${dts}\n`);
}
