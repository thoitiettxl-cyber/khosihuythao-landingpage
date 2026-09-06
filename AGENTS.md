# AGENTS.md

## Product

Static Astro landing for KHO SỈ HUY THẢO. One job: help customers find the
shop online, then call or Zalo the two published numbers. No quote form,
cart, login, payment, live inventory, or selling prices (prices live in
KSHT/Giaban, not this site). Cloudflare Worker `/api/health` and `/api/lead`
remain in-repo but are not the landing job; do not decommission them unless
separately authorized.

Authority: `README.md`.

## Layout

- `apps/web` — Astro static site (`@landingpage/web`)
- `apps/worker` — Cloudflare Worker (`@landingpage/worker`)
- `packages/shared` — shared lead schema (`@landingpage/shared`)
- `assets-source` — original JPEGs; `apps/web/public/images` — AVIF/WebP
- `tests/e2e` — Playwright
- Public fallbacks: `apps/web/src/config/business.ts`
- Worker config: `apps/worker/wrangler.jsonc`

## Cloudflare identity

Confirmed operator account: `ngthanhhuy951@gmail.com`, account
`Ngthanhhuy951@gmail.com's Account`
(`f2e4472b4eedf1aa24c983c73e021164`). Site is GitHub Pages, not
Cloudflare Pages. This account has no Cloudflare Pages project.

Worker names: local/dev `landingpage-lead-api`; production
`landingpage-lead-api-production`. Future Worker ops use those names
with `npx wrangler@latest` (whoami, deploy, tail, secret, types).

Do not connect a Cloudflare GitHub App, Workers Builds, or Cloudflare
Pages to this repo unless architecture changes. Worker runtime secrets
live on the Worker (`TURNSTILE_SECRET`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`). GitHub Actions deploy still needs separate
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` if using
`worker.yml`; local `wrangler login` does not populate those.

## Commands (repository root)

`packageManager` is `pnpm@10.28.0`. Root scripts:

- `pnpm dev` — web only
- `pnpm dev:worker` — `wrangler dev --local`
- `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` / `pnpm e2e`
- `pnpm verify` — lint + typecheck + test + build + e2e (also CI)

There is no root `deploy:production` script. Worker production deploy is
`pnpm --filter @landingpage/worker deploy:production` with
`WORKER_SECRETS_CONFIGURED=true`.

Worker `typecheck` runs `wrangler types && tsc --noEmit` and may rewrite
committed `apps/worker/worker-configuration.d.ts`.

`pnpm e2e` starts only `@landingpage/web` at `http://127.0.0.1:4321`. It does
not start the worker.

Primary operator environment is Linux Alpine (POSIX). CI `verify` still
runs on `windows-latest`.

Wrangler operator commands always use the newest published CLI
(`npx wrangler@latest`). Do not stay on the `apps/worker` pin
(`wrangler@4.119.0`) when running login, whoami, deploy, tail, or types
from this agent. Bumping the package pin and lockfile is a separate
explicit install.

## Configuration

- Public example vars live in the repo-root `.env.example`. `apps/web` has
  no `.env.example`.
- `apps/web/src/config/business.ts` has the same public fallbacks.
- `apps/web/scripts/check-business-config.mjs` reads `process.env` only,
  and only when `DEPLOY_ENV=production`.
- Worker local example: `apps/worker/.dev.vars.example`. `.gitignore`
  lists `.dev.vars` and does not list `.env`.
- Do not commit `.env`, `.dev.vars`, or secret values (`README.md`).
- Default Wrangler env sets `TURNSTILE_MODE=disabled` and
  `NOTIFICATION_PROVIDER=noop`. `turnstile.ts` / `notify.ts` reject those
  modes when `ENVIRONMENT === "production"`.
- Production `ALLOWED_ORIGINS` is `https://khosihuythao.com`.
  `apps/web/public/CNAME` is `khosihuythao.com`.

## Deploy entry points

- Pages: `.github/workflows/pages.yml` (`workflow_dispatch`,
  `DEPLOY_ENV=production`). Web production does not require
  `LANDINGPAGE_API_URL` or `LANDINGPAGE_TURNSTILE_SITE_KEY`.
- Worker: `.github/workflows/worker.yml` (`workflow_dispatch`,
  environment `landingpage-worker-production`).

## Do not

- Install dependencies, start services, or run `pnpm verify` unless asked.
  Those write `node_modules/`, Playwright output, and may rewrite Worker types.
- Print values from `.env`, `.dev.vars`, or secret stores.
