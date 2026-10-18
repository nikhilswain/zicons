# zicons

A brush-drawn icon set: one even line, generously rounded corners, a little wobble. It started as the icons
of [Zketch](https://zketch.zerro.dev), the doodle app.

Browse, restyle and copy them at **[zicons.zerro.dev](https://zicons.zerro.dev)**.

## Using the icons

- **Inline SVG:** copy an icon from the site and paste it into your HTML. It takes the text colour.
- **Sprite:** host `sprite.svg` yourself and write
  `<svg width="24" height="24" stroke-width="1.6"><use href="/sprite.svg#pencil" /></svg>`.
- **Image:** `<img src="https://zicons.zerro.dev/svg/pencil.svg">`. Images draw in black, because
  `currentColor` only works inline.
- **Frameworks:** every icon page has React, Vue and Svelte versions you can copy as a component.
- **Wobble:** add `<script src="https://zicons.zerro.dev/wobble/v1.js"></script>` and give an icon the class
  `zi-boil-sm` to make its line shimmer.

npm packages are planned.

## Repository

- `packages/icons`: the drawings (`defs/`), search tags (`tags.json`) and the generator that writes `svg/`,
  `sprite.svg` and `dist/icons.json`. See its [README](packages/icons/README.md) for the style rules.
- `site`: the Astro site. It reads only `dist/icons.json`.

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run dev` builds the icons and starts the site at `http://localhost:4321`. `npm run preview` serves the
built site through Wrangler, the same way Cloudflare does.

## Deploying

The site is a static-assets Cloudflare Worker (`site/wrangler.jsonc`) on `zicons.zerro.dev`. After
`npm run build`, log in once with `npx wrangler login`, then run `npx wrangler deploy` from `site/`.

## License

MIT © 2026 Nikhil Kumar Swain (zero). See [LICENSE](LICENSE).
