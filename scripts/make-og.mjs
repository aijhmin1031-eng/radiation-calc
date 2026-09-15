/**
 * 쪽별 공유 이미지(OG) 생성기 — 산출물을 `public/og/` 에 **커밋**한다.
 *
 * ★★ 계기(2026-09-15 실측). RadCalc 에는 `og:image` 가 **아예 없었다** — 누가 계산기 링크를
 *   붙이면 **그림 없는 맨 카드**가 떴다. 이웃 lab(RadiMeter)은 쪽마다 구워 두고 있었고
 *   우산도 한 장 있었다. 공유 단추를 아무리 잘 달아도 **공유된 결과물이 초라하면 소용없다.**
 *
 * ★ 왜 빌드 시점이 아닌가: 사이트를 굽는 곳은 **Vercel** 이고 거기에는 Chromium 이 없다
 *   (있는 것은 GitHub CI 다). 그래서 여기서 한 번 구워 커밋하고 Vercel 은 내보내기만 한다.
 * ★ **커밋된 산출물은 반드시 낡는다** — 제목을 고치면 그림이 어긋난다. 그래서
 *   `src/data/og-manifest.json` 에 그때의 제목을 적고 `check-og.mjs` 가 현재 제목과 대조한다.
 *
 * 실행: npm run build && npm run make-og
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist/calc/", import.meta.url).pathname;
const BASE = "/calc";
const stripBase = (p) => (p === BASE ? "/" : p.startsWith(BASE + "/") ? p.slice(BASE.length) : p);
const OUT = new URL("../public/og/", import.meta.url).pathname;
const MANIFEST = new URL("../src/data/og-manifest.json", import.meta.url).pathname;
const ART = new URL("../public/img/tools/", import.meta.url).pathname;
const EXE = process.env.CHROMIUM_PATH || undefined;

if (!existsSync(join(DIST, "sitemap-0.xml"))) {
  console.error("❌ dist 가 없다 — 먼저 `npm run build`");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const sm = readFileSync(join(DIST, "sitemap-0.xml"), "utf8");
/** ★ 매니페스트 키는 **base 없는 정본 경로**다 — 쪽의 조회도 `canonicalPath()` 로 한다.
 *  base 가 붙은 키를 넣으면 조회가 안 맞아 **전부 조용히 폴백으로 떨어진다**(이웃 lab 의 사고). */
const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => stripBase(new URL(m[1]).pathname));

const read = (p) => {
  const f = join(DIST, p === "/" ? "index.html" : p.replace(/^\//, ""), "index.html")
    .replace(/index\.html[\\/]index\.html$/, "index.html");
  const html = readFileSync(f, "utf8");
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "";
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const strip = (x) => x.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  return { heading: strip(h1) || strip(title).split(" · ")[0], title: strip(title) };
};

/** 도구 쪽이면 그 도구의 각판화를 함께 얹는다 — 허브 카드가 쓰는 바로 그 그림이라
 *  **공유 카드에서 본 것이 사이트에서 다시 나온다.** */
const artFor = (p) => {
  const slug = p.replace(/^\/|\/$/g, "");
  const f = join(ART, `${slug}.webp`);
  return slug && existsSync(f) ? "data:image/webp;base64," + readFileSync(f).toString("base64") : "";
};

const card = ({ heading, art }) => `<!doctype html><meta charset="utf-8">
<style>
  @page { margin: 0 }
  body { margin:0; width:1200px; height:630px; display:flex; background:#f7f7f5;
         font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .l { flex:1; padding:76px 64px; display:flex; flex-direction:column; justify-content:center; min-width:0; }
  .eyebrow { font-size:22px; letter-spacing:.14em; text-transform:uppercase; font-weight:600;
             color:#6b6f78; margin:0 0 20px; }
  .rule { width:104px; height:5px; background:#b06f14; margin:0 0 30px; }
  h1 { font-size:${heading.length > 34 ? 60 : 72}px; line-height:1.06; letter-spacing:-.025em;
       margin:0; color:#1c1d20; font-weight:800; }
  .foot { margin-top:34px; font-size:24px; color:#55585f; }
  .r { width:430px; display:flex; align-items:center; justify-content:center;
       background:#faf5e6; border-left:1px solid #e2e2df; }
  .r img { width:340px; height:340px; }
</style>
<div class="l">
  <p class="eyebrow">Radiation Lab · RadCalc</p>
  <div class="rule"></div>
  <h1>${heading.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</h1>
  <p class="foot">radiation-lab.com/calc</p>
</div>
${art ? `<div class="r"><img src="${art}"></div>` : ""}`;

const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const manifest = {};
for (const p of paths) {
  const { heading, title } = read(p);
  const slug = p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  await page.setContent(card({ heading, art: artFor(p) }), { waitUntil: "load" });
  await page.screenshot({ path: join(OUT, `${slug}.png`), type: "png" });
  manifest[p] = { slug, title };
  console.log(`   ${p.padEnd(22)} → og/${slug}.png   ${heading}`);
}
await browser.close();
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n✅ 공유 이미지 ${paths.length}장 · 매니페스트 갱신`);
