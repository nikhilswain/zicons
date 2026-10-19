<script>
  import { DEFAULTS, boilMarkup, boilPathFilter, pixelSize, resolveProps, safeId } from "zicons/render";

  let {
    d,
    size = DEFAULTS.size,
    color = DEFAULTS.color,
    strokeWidth = DEFAULTS.strokeWidth,
    absoluteStrokeWidth = false,
    boil = false,
    children,
    ...rest
  } = $props();

  const raw = $props.id();
  const r = $derived(resolveProps({ size, color, strokeWidth, absoluteStrokeWidth, boil, ...rest }));
  const id = $derived(r.boil ? safeId(raw) : undefined);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={r.width}
  height={r.height}
  viewBox="0 0 24 24"
  fill="none"
  stroke={r.stroke}
  stroke-width={r.strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  {...r.a11y}
  {...rest}
  data-zi={id}
>
  {#if id}<defs>{@html boilMarkup(id, r.boil, pixelSize(r.width))}</defs>{/if}
  <path {d} filter={id ? boilPathFilter(id, r.boil) : undefined} />
  {@render children?.()}
</svg>
