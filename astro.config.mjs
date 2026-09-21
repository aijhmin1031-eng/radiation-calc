import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { SITE_URL_DEFAULT, BASE_PATH } from "./brand.ts";
import { NOINDEX_SLUGS } from "./src/lib/nuclide-noindex.ts";

const site = process.env.SITE_URL || SITE_URL_DEFAULT;

export default defineConfig({
  site,
  base: BASE_PATH,
  // ★ 산출 트리를 URL 공간과 같게 둔다 — 그러지 않으면 호스트마다 재작성 규칙이 필요하고
  //   루트 경로로도 같은 쪽이 열려 중복 URL 이 생긴다. 우산은 dist/ 를 한 트리로 합친다.
  outDir: "./dist/calc",
  trailingSlash: "always",
  integrations: [
    react(), mdx(), tailwind({ applyBaseStyles: false }),
    // ★ noindex 인 쪽이 사이트맵에 새는 것은 이 레포들이 되풀이해 밟은 함정이다.
    //   새 noindex 쪽을 만들면 여기서도 빼야 한다.
    // ★ 반감기 1초 미만 이성질체 10장도 뺀다 — 정본은 src/lib/nuclide-noindex.ts 다.
    //   낱장이 `noindex` 를 쓰는 것과 여기서 사이트맵을 거르는 것은 **같은 한 목록**을 본다.
    sitemap({ filter: (page) => !/\/saved\/$/.test(page)
      && !NOINDEX_SLUGS.some((s) => page.endsWith(`/nuclides/${s}/`)) }),
  ],
  // ★★ `envPrefix` 는 **Vite 설정 안**이다. Astro 최상위에 두면 조용히 무시되고,
  //   빌드는 통과하는데 **로그인·저장만 영영 꺼진 채** 배포된다(실측으로 밟았다 2026-09-14).
  //   Astro 기본은 `PUBLIC_` 뿐이라, 플랫폼이 함께 쓰는 `VITE_SUPABASE_*` 를 읽으려면 넓혀야 한다.
  vite: { envPrefix: ["PUBLIC_", "VITE_"] },
});
