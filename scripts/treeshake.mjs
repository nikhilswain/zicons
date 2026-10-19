import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import sveltePlugin from "esbuild-svelte";

const root = fileURLToPath(new URL("../", import.meta.url));
const icons = JSON.parse(readFileSync(new URL("../packages/icons/dist/icons.json", import.meta.url), "utf8"));
const other = icons.find((i) => i.name === "chevron-down").d;
const LIMIT = 8 * 1024;

const cases = [
  ["zicons", 'import { pencil, toSvg } from "zicons"; console.log(toSvg(pencil, { boil: true }));'],
  ["zicons-react", 'import { PencilIcon } from "zicons-react"; console.log(PencilIcon);'],
  ["zicons-vue", 'import { PencilIcon } from "zicons-vue"; console.log(PencilIcon);'],
  ["zicons-svelte", 'import { PencilIcon } from "zicons-svelte"; console.log(PencilIcon);'],
];

let failed = false;
for (const [pkg, contents] of cases) {
  const out = await build({
    stdin: { contents, resolveDir: root, loader: "js" },
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    conditions: ["svelte"],
    external: ["react", "vue", "svelte", "svelte/*"],
    plugins: pkg === "zicons-svelte" ? [sveltePlugin({ compilerOptions: { generate: "client" } })] : [],
    logLevel: "silent",
  });
  const code = out.outputFiles[0].text;
  const bytes = Buffer.byteLength(code);
  const leaked = code.includes(other);
  const ok = bytes <= LIMIT && !leaked;
  if (!ok) failed = true;
  console.log(`${ok ? "ok  " : "FAIL"} ${pkg.padEnd(14)} ${(bytes / 1024).toFixed(1)} KB${leaked ? ", includes another icon" : ""}`);
}
process.exit(failed ? 1 : 0);
