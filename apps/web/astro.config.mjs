import { defineConfig } from "astro/config";

const configuredSite = process.env.PUBLIC_SITE_URL;
const configuredBase = process.env.PUBLIC_BASE_PATH || "/";

export default defineConfig({
  output: "static",
  ...(configuredSite && !configuredSite.includes("TODO")
    ? { site: configuredSite }
    : {}),
  base: configuredBase,
  build: { assets: "_assets" },
  compressHTML: true,
  devToolbar: { enabled: false },
});
