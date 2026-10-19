import type { APIRoute, GetStaticPaths } from "astro";
import { Resvg } from "@resvg/resvg-js";
import { getIcon, icons } from "../../data/icons";
import { OG_FONTS, ogDefault, ogIcon } from "../../lib/og";

const HERO = ["pencil", "heart", "palette", "sparkle", "brush", "star"];

export const getStaticPaths: GetStaticPaths = () => [
  { params: { name: "default" } },
  ...icons.map((i) => ({ params: { name: i.name } })),
];

export const GET: APIRoute = ({ params }) => {
  const name = params.name!;
  const svg = name === "default" ? ogDefault(HERO.map((n) => getIcon(n).d)) : ogIcon(name, getIcon(name).d);
  const png = new Resvg(svg, { font: { fontFiles: OG_FONTS, loadSystemFonts: false, defaultFontFamily: "Shantell Sans" } }).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
