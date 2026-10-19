# zicons-react

Brush-drawn [zicons](https://zicons.zerro.dev) as React components. One even line, rounded ends, and a
wobble you can switch on with one prop.

```sh
npm i zicons-react
```

```jsx
import { PencilIcon, HeartIcon } from "zicons-react";

<PencilIcon />
<HeartIcon size={32} color="#ff4757" strokeWidth={1.8} />
```

Every icon is its own component, named after the icon: `pencil` is `PencilIcon`, `chevron-down` is
`ChevronDownIcon`. Browse them all at [zicons.zerro.dev](https://zicons.zerro.dev). Only the icons you
import end up in your bundle.

## Props

| Prop                  | Default        | What it does                                                      |
| --------------------- | -------------- | ----------------------------------------------------------------- |
| `size`                | `24`           | Width and height. A number (pixels) or any CSS length (`"1.5em"`). |
| `color`               | `currentColor` | Line colour. By default the icon takes the colour of its text.    |
| `strokeWidth`         | `1.6`          | Line thickness, in icon units (the icon is drawn on a 24 grid).   |
| `absoluteStrokeWidth` | `false`        | Keep the line the same thickness on screen at any numeric size.   |
| `boil`                | `false`        | `true` wobbles all the time; `"hover"` wobbles on hover or focus.  |

Anything else (`className`, `style`, `onClick`, `aria-*`, a `ref`) goes straight to the `<svg>`.

The icon is hidden from screen readers unless you give it a name. With `aria-label` it gets
`role="img"`:

```jsx
<button aria-label="Close"><CloseIcon /></button>
<WarningIcon aria-label="Warning" />
```

## The wobble

```jsx
<SparkleIcon boil />
<a href="/draw"><PencilIcon boil="hover" /> Draw</a>
```

`boil` makes the line shimmer like a cartoon being traced again frame by frame. `"hover"` keeps the
icon still until the icon, or the link or button around it, is hovered or focused. Each wobbling icon
carries its own tiny filter, so there is nothing to set up. Small icons get a gentle wobble, icons of
32px and up a stronger one.

The wobble ignores reduced-motion settings on purpose. To honour them, pass your own check. Read the
setting after the first render, so server-rendered pages hydrate cleanly:

```jsx
import { useEffect, useState } from "react";

function Sparkle() {
  const [calm, setCalm] = useState(false);
  useEffect(() => setCalm(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return <SparkleIcon boil={!calm} />;
}
```

## License

MIT, by [zero](https://zerro.dev).
