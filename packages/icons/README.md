# zicons

A brush-drawn icon set, first drawn for Zketch: one even, brush-drawn line with generously rounded corners.
This folder is self-contained; it can be copied anywhere and used on its own.

## Files

- `svg/<name>.svg`: one standalone SVG per icon.
- `sprite.svg`: every icon as a `<symbol id="<name>">`. Symbols leave the stroke width to the outer `<svg>`.
- `dist/icons.json`: `[{ name, group, groupTitle, tags, d }]`, the data the site reads.
- `tags.json`: search words for each icon.
- `gallery.html`: a contact sheet of every icon at 14, 18, 24 and 56 px.
- `defs/`: the drawings, written as centrelines (rounded polygons, paths, circles, arcs, dots).
- `lib/`, `build.mjs`: the generator that turns the drawings into SVG.

## Style

- 24 x 24 grid, drawing kept roughly inside 3..21.
- Stroke 2.2, round caps and joins, no fill, colour from `currentColor`.
- One even line weight. Straight edges bow very slightly; the bow is seeded from the icon name,
  so every build draws the same line.
- Rounded corners wherever a shape has one; no sharp points.
- Few strokes per icon, each one a single pen movement.

## Using the icons

Inline an SVG file to let it take the text colour, or point at the sprite and set the stroke width
on the outer `<svg>`:

```html
<span style="color:#FF6B5B">
  <svg width="18" height="18" stroke-width="2.2"><use href="sprite.svg#pencil" /></svg>
</span>
```

Or use a file directly as an image (`<img src="svg/pencil.svg">`); as an image it draws in black,
because `currentColor` only works for inline SVG.

## Building

`node build.mjs` regenerates `svg/`, `sprite.svg`, `dist/icons.json` and `gallery.html`, and writes
nothing outside this folder. It warns about icons that have no tags.
