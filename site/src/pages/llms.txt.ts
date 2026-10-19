import type { APIRoute } from "astro";
import { groups, icons } from "../data/icons";
import { SITE } from "../config";
import { pascal } from "../lib/snippets";

const camel = (name: string) => name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export const GET: APIRoute = () => {
  const list = groups
    .map((g) => {
      const rows = icons
        .filter((i) => i.group === g.key)
        .map((i) => `- ${i.name}: \`${pascal(i.name)}Icon\`, core \`${camel(i.name)}\`${i.tags.length ? ` (${i.tags.join(", ")})` : ""}`);
      return `### ${g.title}\n\n${rows.join("\n")}`;
    })
    .join("\n\n");

  const body = `# zicons

> Free, MIT-licensed, brush-drawn SVG icons on a 24 grid, with an optional wobble (a "line boil" that makes the line shimmer). Packages for React, Vue, Svelte and plain JavaScript. ${icons.length} icons.

Every icon is one even stroke: \`viewBox="0 0 24 24"\`, \`fill="none"\`, \`stroke="currentColor"\`, stroke width 1.6, round caps and joins. Components are named after the icon in PascalCase with an \`Icon\` suffix (\`chevron-down\` is \`ChevronDownIcon\`). Each icon is its own export, so bundles only include what is imported.

## Install

- React: \`npm i zicons-react\`, then \`import { PencilIcon } from "zicons-react"\` and \`<PencilIcon size={32} />\`
- Vue 3: \`npm i zicons-vue\`, then \`import { PencilIcon } from "zicons-vue"\` and \`<PencilIcon :size="32" />\`
- Svelte 5: \`npm i zicons-svelte\`, then \`import { PencilIcon } from "zicons-svelte"\` and \`<PencilIcon size={32} />\`
- Plain JS: \`npm i zicons\`, then \`import { pencil, toSvg } from "zicons"\` and \`el.innerHTML = toSvg(pencil, { size: 32 })\`
- No install: copy any icon as SVG, HTML or a component from its page, or use \`${SITE.url}/svg/<name>.svg\`

## Props

- \`size\` (default 24): number in pixels or a CSS length like "1.5em"
- \`color\` (default "currentColor"): the line colour
- \`strokeWidth\` (default 1.6): line thickness in 24-grid units
- \`absoluteStrokeWidth\` (default false): keep the on-screen thickness constant at any numeric size
- \`boil\` (default false): \`true\` wobbles all the time, \`"hover"\` wobbles while the icon or its link or button is hovered or focused
- Anything else (class, style, event handlers, aria-*) goes to the \`<svg>\`. Icons are aria-hidden unless given an \`aria-label\`, which adds role="img".

## Docs

- [Browse and copy icons](${SITE.url}/): search, restyle and copy every icon
- [Use the icons](${SITE.url}/use): install, inline SVG, sprite, image, the wobble, accessibility
- [Story](${SITE.url}/story): how the icons are drawn
- [License](${SITE.url}/license): MIT, free for commercial use
- [Source](${SITE.github}): the repository

## Icons

Format: icon name: component name, core export (search words). Each icon has a page at ${SITE.url}/icons/<name>.

${list}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
