# zicons-vue

Brush-drawn [zicons](https://zicons.zerro.dev) as Vue 3 components. One even line, rounded ends, and a
wobble you can switch on with one prop.

```sh
npm i zicons-vue
```

```vue
<script setup>
import { PencilIcon, HeartIcon } from "zicons-vue";
</script>

<template>
  <PencilIcon />
  <HeartIcon :size="32" color="#ff4757" :stroke-width="1.8" />
</template>
```

Every icon is its own component, named after the icon: `pencil` is `PencilIcon`, `chevron-down` is
`ChevronDownIcon`. Browse them all at [zicons.zerro.dev](https://zicons.zerro.dev). Only the icons you
import end up in your bundle.

## Props

| Prop                    | Default        | What it does                                                      |
| ----------------------- | -------------- | ----------------------------------------------------------------- |
| `size`                  | `24`           | Width and height. A number (pixels) or any CSS length (`"1.5em"`). |
| `color`                 | `currentColor` | Line colour. By default the icon takes the colour of its text.    |
| `stroke-width`          | `1.6`          | Line thickness, in icon units (the icon is drawn on a 24 grid).   |
| `absolute-stroke-width` | `false`        | Keep the line the same thickness on screen at any numeric size.   |
| `boil`                  | `false`        | Present (or `true`) wobbles all the time; `"hover"` wobbles on hover or focus. |

Anything else (`class`, `style`, `@click`, `aria-*`) goes straight to the `<svg>`.

The icon is hidden from screen readers unless you give it a name. With `aria-label` it gets
`role="img"`:

```vue
<button aria-label="Close"><CloseIcon /></button>
<WarningIcon aria-label="Warning" />
```

## The wobble

```vue
<SparkleIcon boil />
<a href="/draw"><PencilIcon boil="hover" /> Draw</a>
```

`boil` makes the line shimmer like a cartoon being traced again frame by frame. `"hover"` keeps the
icon still until the icon, or the link or button around it, is hovered or focused. Each wobbling icon
carries its own tiny filter, so there is nothing to set up. Small icons get a gentle wobble, icons of
32px and up a stronger one.

The wobble ignores reduced-motion settings on purpose. To honour them, pass your own check. Read the
setting once mounted, so server-rendered pages hydrate cleanly:

```vue
<script setup>
import { onMounted, ref } from "vue";
import { SparkleIcon } from "zicons-vue";

const calm = ref(false);
onMounted(() => (calm.value = matchMedia("(prefers-reduced-motion: reduce)").matches));
</script>

<template>
  <SparkleIcon :boil="!calm" />
</template>
```

## License

MIT, by [zero](https://zerro.dev).
