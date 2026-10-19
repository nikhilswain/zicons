import type { Icon } from "../data/icons";
import { DEFAULTS, sanitize, type Settings } from "./settings";
import { WOBBLE_CSS, wobbleDefs } from "./wobble";

export type Format = "svg" | "html" | "react" | "vue" | "svelte" | "wobble";

export const FORMATS: { key: Format; label: string }[] = [
  { key: "svg", label: "SVG" },
  { key: "html", label: "HTML" },
  { key: "react", label: "React" },
  { key: "vue", label: "Vue" },
  { key: "svelte", label: "Svelte" },
  { key: "wobble", label: "+ wobble" },
];

export type Framework = "react" | "vue" | "svelte";

export const isFramework = (f: Format): f is Framework => f === "react" || f === "vue" || f === "svelte";

export const pascal = (name: string) =>
  name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

const svgTag = (s: Settings, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${s.size}" height="${s.size}" viewBox="0 0 24 24" fill="none" stroke="${s.color}" stroke-width="${s.stroke}" stroke-linecap="round" stroke-linejoin="round"${extra}>`;

export function snippet(format: Format, icon: Pick<Icon, "name" | "d">, settings: Settings): string {
  const s = sanitize(settings);
  const { name, d } = icon;
  switch (format) {
    case "svg":
      return `${svgTag(s)}<path d="${d}"/></svg>`;
    case "html":
      return `${svgTag(s, ' aria-hidden="true"')}\n  <path d="${d}"/>\n</svg>\n\n<svg width="${s.size}" height="${s.size}"${s.color === "currentColor" ? "" : ` color="${s.color}"`} fill="none" stroke="currentColor" stroke-width="${s.stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  <use href="sprite.svg#${name}"/>\n</svg>`;
    case "react":
      return `export function ${pascal(name)}Icon({ size = ${s.size}, ...props }) {
  const named = props["aria-label"] || props["aria-labelledby"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="${s.color}"
      strokeWidth={${s.stroke}}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={named ? "img" : undefined}
      aria-hidden={named ? undefined : true}
      {...props}
    >
      <path d="${d}" />
    </svg>
  );
}`;
    case "vue":
      return `<script setup>
import { computed, useAttrs } from "vue";

defineProps({ size: { type: [Number, String], default: ${s.size} } });
const attrs = useAttrs();
const named = computed(() => Boolean(attrs["aria-label"] || attrs["aria-labelledby"]));
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="${s.color}"
    stroke-width="${s.stroke}"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="named ? 'img' : undefined"
    :aria-hidden="named ? undefined : 'true'"
  >
    <path d="${d}" />
  </svg>
</template>`;
    case "svelte":
      return `<script>
  let { size = ${s.size}, ...rest } = $props();
  const named = $derived(Boolean(rest["aria-label"] || rest["aria-labelledby"]));
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="${s.color}"
  stroke-width="${s.stroke}"
  stroke-linecap="round"
  stroke-linejoin="round"
  role={named ? "img" : undefined}
  aria-hidden={named ? undefined : "true"}
  {...rest}
>
  <path d="${d}" />
</svg>`;
    case "wobble":
      return `<style>
${WOBBLE_CSS}
</style>
${wobbleDefs()}

${svgTag(s, ` class="${s.size >= 32 ? "zi-boil" : "zi-boil-sm"}"`)}<path d="${d}"/></svg>`;
  }
}

const PACKAGE: Record<Framework, string> = { react: "zicons-react", vue: "zicons-vue", svelte: "zicons-svelte" };

export function npmSnippet(framework: Framework, icon: Pick<Icon, "name">, settings: Settings): { install: string; code: string } {
  const s = sanitize(settings);
  const vue = framework === "vue";
  const C = `${pascal(icon.name)}Icon`;
  const props: string[] = [];
  if (s.size !== DEFAULTS.size) props.push(vue ? `:size="${s.size}"` : `size={${s.size}}`);
  if (s.color !== DEFAULTS.color) props.push(`color="${s.color}"`);
  if (s.stroke !== DEFAULTS.stroke) props.push(vue ? `:stroke-width="${s.stroke}"` : `strokeWidth={${s.stroke}}`);
  const tag = `<${C}${props.map((p) => ` ${p}`).join("")} />`;
  const from = `import { ${C} } from "${PACKAGE[framework]}";`;
  const code =
    framework === "react"
      ? `${from}

${tag}`
      : vue
        ? `<script setup>
${from}
</script>

<template>
  ${tag}
</template>`
        : `<script>
  ${from}
</script>

${tag}`;
  return { install: `npm i ${PACKAGE[framework]}`, code };
}
