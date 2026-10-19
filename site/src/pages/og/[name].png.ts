import type { APIRoute, GetStaticPaths } from "astro";
import { Resvg } from "@resvg/resvg-js";
import { getIcon, icons, related } from "../../data/icons";
import { ogDefault, ogIcon } from "../../lib/og";

const HERO = ["pencil", "brush", "heart", "palette", "sparkle", "cloud", "eraser", "star", "layers", "magic-wand"];

export const getStaticPaths: GetStaticPaths = () => [
  { params: { name: "default" } },
  ...icons.map((i) => ({ params: { name: i.name } })),
];

export const GET: APIRoute = ({ params }) => {
  const name = params.name!;
  const svg =
    name === "default"
      ? ogDefault(HERO.map((n) => getIcon(n).d))
      : ogIcon(
          getIcon(name).d,
          related(name, 4).map((i) => i.d),
        );
  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
