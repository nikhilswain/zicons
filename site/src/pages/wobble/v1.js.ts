import type { APIRoute } from "astro";
import { wobbleScript } from "../../lib/wobble";

export const GET: APIRoute = () =>
  new Response(wobbleScript(), { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
