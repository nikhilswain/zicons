import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const icons = join(site, "..", "packages", "icons");
const pub = join(site, "public");

mkdirSync(pub, { recursive: true });
cpSync(join(icons, "sprite.svg"), join(pub, "sprite.svg"));
rmSync(join(pub, "svg"), { recursive: true, force: true });
cpSync(join(icons, "svg"), join(pub, "svg"), { recursive: true });
