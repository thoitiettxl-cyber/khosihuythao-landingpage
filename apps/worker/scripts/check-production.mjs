import { readFile } from "node:fs/promises";

const config = await readFile(
  new URL("../wrangler.jsonc", import.meta.url),
  "utf8",
);
const productionOrigin = /"ALLOWED_ORIGINS"\s*:\s*"(https:[^"]+)"/g;
const origins = [...config.matchAll(productionOrigin)].map((match) => match[1]);
if (
  !origins.includes("https://khosihuythao.com") ||
  process.env.WORKER_SECRETS_CONFIGURED !== "true"
) {
  console.error(
    "Production Worker configuration is incomplete. Configure the exact HTTPS origin, set Turnstile/Telegram secrets with `wrangler secret put --env production`, then set WORKER_SECRETS_CONFIGURED=true for deployment.",
  );
  process.exitCode = 1;
}
