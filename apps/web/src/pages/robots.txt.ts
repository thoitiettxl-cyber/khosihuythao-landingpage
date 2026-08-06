import type { APIRoute } from "astro";
import { hasBusinessPlaceholders } from "../config/business";

export const GET: APIRoute = ({ site }) => {
  const lines = [
    "User-agent: *",
    hasBusinessPlaceholders ? "Disallow: /" : "Allow: /",
  ];
  if (site && !hasBusinessPlaceholders)
    lines.push(`Sitemap: ${new URL("sitemap.xml", site)}`);
  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
