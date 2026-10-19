# zicons

A brush-drawn icon set, first drawn for [Zketch](https://zketch.zerro.dev): one even line with
generously rounded corners, and a wobble you can switch on. Browse them at
[zicons.zerro.dev](https://zicons.zerro.dev).

This is the core package: plain SVG files, a sprite, the icon data, and a tiny `toSvg()` for plain
JavaScript. For components, use [`zicons-react`](https://www.npmjs.com/package/zicons-react),
[`zicons-vue`](https://www.npmjs.com/package/zicons-vue) or
[`zicons-svelte`](https://www.npmjs.com/package/zicons-svelte).

```sh
npm i zicons
```

## In JavaScript

```js
import { pencil, chevronDown, toSvg } from "zicons";

button.innerHTML = toSvg(pencil);
badge.innerHTML = toSvg(chevronDown, { size: 32, color: "#ff4757", boil: "hover" });
```

Each icon is a named export in camelCase (`chevron-down` is `chevronDown`), so only the icons you
import end up in your bundle. `toSvg(icon, options)` returns the SVG as a string. Options:

| Option                | Default        | What it does                                                      |
| --------------------- | -------------- | ----------------------------------------------------------------- |
| `size`                | `24`           | Width and height. A number (pixels) or any CSS length (`"1.5em"`). |
| `color`               | `currentColor` | Line colour. By default the icon takes the colour of its text.    |
| `strokeWidth`         | `1.6`          | Line thickness, in icon units (the icon is drawn on a 24 grid).   |
| `absoluteStrokeWidth` | `false`        | Keep the line the same thickness on screen at any numeric size.   |
| `boil`                | `false`        | `true` wobbles all the time; `"hover"` wobbles on hover or focus.  |
| `aria-label`          |                | Names the icon (`role="img"`). Without it the icon is `aria-hidden`. |
| `attrs`               |                | Any other attributes for the `<svg>`, like `{ class: "icon" }`.     |

## The wobble

```js
toSvg(sparkle, { boil: true });
toSvg(pencil, { boil: "hover" });
```

`boil` makes the line shimmer like a cartoon being traced again frame by frame. `"hover"` keeps the
icon still until the icon, or the link or button around it, is hovered or focused. Each wobbling icon
carries its own tiny filter, so there is nothing to set up. Small icons get a gentle wobble, icons of
32px and up a stronger one.

The wobble ignores reduced-motion settings on purpose. To honour them, pass your own check:

```js
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
el.innerHTML = toSvg(sparkle, { boil: !calm });
```

## Files

- `zicons/svg/<name>.svg`: one standalone SVG per icon.
- `zicons/sprite.svg`: every icon as a `<symbol id="<name>">`. Host it yourself and set the stroke on
  the outer `<svg>`: `<svg width="24" height="24" stroke-width="1.6"><use href="/sprite.svg#pencil" /></svg>`.
- `zicons/icons.json`: `[{ name, group, groupTitle, tags, d }]`, every icon with its search words.

An SVG used as an `<img>` draws in black, because `currentColor` only works for inline SVG.

## Style

- 24 x 24 grid, drawing kept roughly inside 3..21.
- Stroke 1.6, round caps and joins, no fill, colour from `currentColor`.
- One even line weight. Straight edges bow very slightly; the bow is seeded from the icon name,
  so every build draws the same line.
- Rounded corners wherever a shape has one; no sharp points.
- Few strokes per icon, each one a single pen movement.

## Building

In the zicons repository, `node build.mjs` regenerates `svg/`, `sprite.svg`, `dist/` and
`gallery.html` from the drawings in `defs/` and the search words in `tags.json`. It warns about icons
that have no tags.

## License

MIT, by [zero](https://zerro.dev).
