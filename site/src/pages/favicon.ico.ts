import type { APIRoute } from "astro";
import { faviconIco } from "../lib/favicon";

export const GET: APIRoute = () => new Response(faviconIco([16, 32, 48]), { headers: { "Content-Type": "image/x-icon" } });
