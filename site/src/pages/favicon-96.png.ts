import type { APIRoute } from "astro";
import { faviconPng } from "../lib/favicon";

export const GET: APIRoute = () => new Response(faviconPng(96), { headers: { "Content-Type": "image/png" } });
