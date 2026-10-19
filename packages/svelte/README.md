# zicons-svelte

Brush-drawn [zicons](https://zicons.zerro.dev) as Svelte 5 components. One even line, rounded ends,
and a wobble you can switch on with one prop.

```sh
npm i zicons-svelte
```

```svelte
<script>
  import { PencilIcon, HeartIcon } from "zicons-svelte";
</script>

<PencilIcon />
<HeartIcon size={32} color="#ff4757" strokeWidth={1.8} />
```

Every icon is its own component, named after the icon: `pencil` is `PencilIcon`, `chevron-down` is
`ChevronDownIcon`. Browse them all at [zicons.zerro.dev](https://zicons.zerro.dev). Only the icons you
import end up in your bundle. Needs Svelte 5.20 or newer.

## Props

| Prop                  | Default        | What it does                                                      |
| --------------------- | -------------- | ----------------------------------------------------------------- |
| `size`                | `24`           | Width and height. A number (pixels) or any CSS length (`"1.5em"`). |
| `color`               | `currentColor` | Line colour. By default the icon takes the colour of its text.    |
| `strokeWidth`         | `1.6`          | Line thickness, in icon units (the icon is drawn on a 24 grid).   |
| `absoluteStrokeWidth` | `false`        | Keep the line the same thickness on screen at any numeric size.   |
| `boil`                | `false`        | `true` wobbles all the time; `"hover"` wobbles on hover or focus.  |

Anything else (`class`, `style`, `onclick`, `aria-*`) goes straight to the `<svg>`.

The icon is hidden from screen readers unless you give it a name. With `aria-label` it gets
`role="img"`:

```svelte
<button aria-label="Close"><CloseIcon /></button>
<WarningIcon aria-label="Warning" />
```

## The wobble

```svelte
<SparkleIcon boil />
<a href="/draw"><PencilIcon boil="hover" /> Draw</a>
```

`boil` makes the line shimmer like a cartoon being traced again frame by frame. `"hover"` keeps the
icon still until the icon, or the link or button around it, is hovered or focused. Each wobbling icon
carries its own tiny filter, so there is nothing to set up. Small icons get a gentle wobble, icons of
32px and up a stronger one.

The wobble ignores reduced-motion settings on purpose. To honour them, pass your own check. Read the
setting in an effect, so server-rendered pages hydrate cleanly:

```svelte
<script>
  import { SparkleIcon } from "zicons-svelte";

  let calm = $state(false);
  $effect(() => {
    calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
</script>

<SparkleIcon boil={!calm} />
```

## License

MIT, by [zero](https://zerro.dev).
