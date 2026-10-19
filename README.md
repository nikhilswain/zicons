# zicons

A brush-drawn icon set: one even line, generously rounded corners, a little wobble. It started as the icons
of [Zketch](https://zketch.zerro.dev), the doodle app.

Browse, restyle and copy them at **[zicons.zerro.dev](https://zicons.zerro.dev)**.

## Packages

| Package | Install | Use |
| --- | --- | --- |
| [`zicons`](packages/icons) | `npm i zicons` | SVG files, the sprite, `icons.json`, and `toSvg(pencil)` for plain JS |
| [`zicons-react`](packages/react) | `npm i zicons-react` | `<PencilIcon size={32} boil />` |
| [`zicons-vue`](packages/vue) | `npm i zicons-vue` | `<PencilIcon :size="32" boil />` |
| [`zicons-svelte`](packages/svelte) | `npm i zicons-svelte` | `<PencilIcon size={32} boil />` |

Every component takes `size`, `color`, `strokeWidth`, `absoluteStrokeWidth` and `boil` (`true`, or
`"hover"` to wobble only on hover or focus). Only the icons you import end up in your bundle.

## Without npm

- **Inline SVG:** copy an icon from the site and paste it into your HTML. It takes the text colour.
- **Sprite:** host `sprite.svg` yourself and write
  `<svg width="24" height="24" stroke-width="1.6"><use href="/sprite.svg#pencil" /></svg>`.
- **Image:** `<img src="https://zicons.zerro.dev/svg/pencil.svg">`. Images draw in black, because
  `currentColor` only works inline.
- **Frameworks:** every icon page also has React, Vue and Svelte components you can paste in.
- **Wobble:** add `<script src="https://zicons.zerro.dev/wobble/v1.js"></script>` and give an icon the class
  `zi-boil-sm` to make its line shimmer.

## Repository

- `packages/icons`: the drawings (`defs/`), search tags (`tags.json`) and the generator that writes `svg/`,
  `sprite.svg` and `dist/icons.json`. See its [README](packages/icons/README.md) for the style rules.
- `packages/react`, `packages/vue`, `packages/svelte`: the framework packages. Each generates one
  component per icon from `dist/icons.json`; the shared rendering and wobble rules live in
  `packages/icons/runtime/render.js`.
- `site`: the Astro site. It reads `dist/icons.json` and the wobble values from `zicons/render`.

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run dev` builds the icons and starts the site at `http://localhost:4321`. `npm run build` builds the
icons, the three framework packages and the site. `npm test` runs the package tests (after a build), and
`npm run check:treeshake` checks that importing one icon stays small. `npm run preview` serves the built
site through Wrangler, the same way Cloudflare does.

## Publishing

All four packages share one version. After `npm run build && npm test`, publish the core first, then the
others: `npm publish -w zicons`, then `npm publish -w zicons-react -w zicons-vue -w zicons-svelte`.

## Deploying

The site is a static-assets Cloudflare Worker (`site/wrangler.jsonc`) on `zicons.zerro.dev`. After
`npm run build`, log in once with `npx wrangler login`, then run `npx wrangler deploy` from `site/`.

## License

MIT © 2026 Nikhil Kumar Swain (zero). See [LICENSE](LICENSE).
