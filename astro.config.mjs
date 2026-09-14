import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { SITE_URL_DEFAULT, BASE_PATH } from "./brand.ts";

const site = process.env.SITE_URL || SITE_URL_DEFAULT;

export default defineConfig({
  site,
  base: BASE_PATH,
  // ★ 산출 트리를 URL 공간과 같게 둔다 — 그러지 않으면 호스트마다 재작성 규칙이 필요하고
  //   루트 경로로도 같은 쪽이 열려 중복 URL 이 생긴다. 우산은 dist/ 를 한 트리로 합친다.
  outDir: "./dist/calc",
  trailingSlash: "always",
  envPrefix: ["PUBLIC_", "VITE_"],
  integrations: [react(), mdx(), tailwind({ applyBaseStyles: false }), sitemap()],
});
