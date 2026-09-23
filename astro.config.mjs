import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { lastmodFor, HAS_GIT } from "./src/lib/lastmod.mjs";
import tailwind from "@astrojs/tailwind";
import { SITE_URL_DEFAULT, BASE_PATH } from "./brand.ts";

const site = process.env.SITE_URL || SITE_URL_DEFAULT;

/** 사이트맵이 주는 절대 주소에서 **base 를 떼어** 정본 경로로 되돌린다. */
const canonicalOf = (url) => {
  const p = new URL(url).pathname;
  const b = BASE_PATH.replace(/\/$/, "");
  return b && p.startsWith(b) ? p.slice(b.length) || "/" : p;
};

/** ★ **못 넣었으면 못 넣었다고 찍는다** — 조용하면 「넣었겠거니」 하고 넘어간다. */
if (!HAS_GIT) console.warn("[sitemap] git 이력을 읽지 못했다 — lastmod 를 쓰지 않는다(지어내지 않는다).");

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
    sitemap({
      filter: (page) => !/\/saved\/$/.test(page),
      /** `lastmod` — **쪽마다 그 내용이 마지막으로 바뀐 커밋 날짜**. 정본·판단은
       *  `src/lib/lastmod.mjs` 가 든다(빌드 시각을 박지 않는 이유, 얕은 클론을 가려내는 법).
       *  ★ 날짜를 모르는 주소는 `lastmod` **없이** 나간다 — 지어내지 않는다. */
      serialize: (item) => {
        const d = lastmodFor(canonicalOf(item.url));
        return d ? { ...item, lastmod: d } : item;
      },
    }),
  ],
  // ★★ `envPrefix` 는 **Vite 설정 안**이다. Astro 최상위에 두면 조용히 무시되고,
  //   빌드는 통과하는데 **로그인·저장만 영영 꺼진 채** 배포된다(실측으로 밟았다 2026-09-14).
  //   Astro 기본은 `PUBLIC_` 뿐이라, 플랫폼이 함께 쓰는 `VITE_SUPABASE_*` 를 읽으려면 넓혀야 한다.
  vite: { envPrefix: ["PUBLIC_", "VITE_"] },
});
