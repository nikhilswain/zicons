import type { APIRoute } from "astro";
import { faviconPng } from "../lib/favicon";

export const GET: APIRoute = () => new Response(faviconPng(180, true), { headers: { "Content-Type": "image/png" } });
