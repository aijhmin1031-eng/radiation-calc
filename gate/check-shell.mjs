/* check-shell — 공통 셸(HEADER-SPEC v3)이 **정본 그대로** 산출물에 박혀 있는가 (2026-10-28 신설 · 정적 · 브라우저 없음).
 *  우산 저장소 `radiation-lab/gate/check-shell.mjs` 를 본떴다 — 그쪽은 public/ 의 쪽을, 이쪽은 `dist/calc/` 산출물을 잰다.
 *
 *  계기: 네 오리진이 「Radiation Lab /」 글자 말고는 글꼴 · 배경 · 메뉴 · 꼬리말 · 로그인 입구가 제각각이었다(2026-10-28 실측 17쪽).
 *  이 lab 도 우산의 막대와 같은 모양을 `.shdr-*` 라는 제 CSS 로 **다시 그려** 같은 숫자를 손으로 맞추고 있었다. 이제 정본은
 *  우산 `public/shell/`(shell.json · render.mjs · shell.css · shell.js)이고 이 저장소는 `shell/` 사본(`npm run sync-shell`)으로
 *  빌드 때 머리글 · 꼬리말을 그린다(`SiteHeader.astro` · `Base.astro`). 이 게이트는 그 결과가 **그 함수의 출력과 글자 그대로 같은지**
 *  잰다 — 쪽 틀에서 출력을 손보거나, 옛 CSS 사본이 다시 들어오거나, 사본만 갱신하고 빌드를 안 하면 빨개진다.
 *
 *  ★ 재는 것 (dist/calc/**​/index.html 전부 + 404.html — 문자열 비교라 전수가 싸다; 아래 표본 다섯은 로그에 치수를 적는 쪽)
 *    ① header.site 가 정확히 하나이고 renderHeader(spec, {section:"calc", currentHref: currentHrefFor(path), apex:true}) 와 **바이트 동일**
 *       — 「현재」 규칙(`src/lib/shell-page.mjs`: 구역 셋은 뿌리, 도구 쪽은 제 주소)도 같은 함수로 센다.
 *    ② footer.site 가 정확히 하나이고 renderFooter(...) 와 바이트 동일. pageUrl · shareText 는 꼬리말 자신이 든 값(#share-copy 의
 *       data-url · X 링크의 text=)으로 되살려 대조하고, 그 값이 쪽의 canonical(+ `<title>`)이거나 apex 홈(+ HOME_SHARE — 404 처럼
 *       canonical 이 없는 쪽, /saved/ 처럼 noindex 인 개인 쪽)인지 따로 잰다. 색인되는 쪽이 홈을 권하면 빨개진다.
 *    ③ head 에 `/shell/shell.css?v=N` · `/shell/shell.js?v=N`(N = shell.json 의 version) · 그리기 전 테마 스크립트가 있다.
 *    ④ 쪽 CSS(dist/calc/_astro/*.css + 인라인 <style>)에 옛 사본이 0 — `--c-paper:` · `.shdr-` · `.tmenu-` · `.rmt-theme` · `.share {` ·
 *       `@font-face` · `header.site {` · `.hd {`. 토큰은 shell.css 한 벌이다.
 *    ⑤ 쪽 JS(_astro/*.js + 인라인 <script>)에 테마를 **쓰는** 코드(`radmeter-v2-theme` + setItem) · 공유 복사 · 계정 라벨이 0 —
 *       shell.js 가 든다. head 의 **읽기**(getItem)는 그대로다.
 *    ⑥ 꼬리말 위 aside 가 도구 여덟 · Data sources · 면책을 든다 — 옛 꼬리말이 들던 것을 잃지 않았는가(check-output ⑦ 과 겹치지만
 *       그쪽은 「어디든 있으면」이고 이쪽은 「그 자리에」다).
 *    ⑦ shell.json — version 정수 · 모든 href 가 절대 주소(https://…radiation-lab.com/) — 어느 오리진이 그려도 같은 곳.
 *    ⑧ vendored 사본(shell/)이 우산 정본과 같은가 — 옆에 우산 체크아웃(`../radiation-lab/public/shell` 또는 SHELL_SOURCE)이 있을 때만
 *       대조해 **경고**로 적는다(실패 아님 — CI 에는 우산이 없고, 정본이 앞서 갔을 수 있다 → `npm run sync-shell`).
 *  ★ 못 보는 것 — 화면은 안 본다(치수 · 색 · 메뉴 동작은 check-platform, 브랜드 · 모바일 높이는 check-lockup, 손잡이 · 칩은
 *    check-header 가 Chromium 으로 잰다). shell.css 자체가 옳은지는 우산의 check-shell 이 잰다(이쪽은 사본을 신뢰한다). */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL_DEFAULT, BASE_PATH } from "../brand.ts";
import { currentHrefFor, HOME_SHARE } from "../src/lib/shell-page.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist", "calc");
const spec = JSON.parse(readFileSync(join(ROOT, "shell", "shell.json"), "utf8"));
const R = await import(new URL("../shell/render.mjs", import.meta.url).href);
const V = spec.version;
const bad = [];
const note = (s) => console.log("   " + s);
const SAMPLE = ["/gamma-shielding/", "/nuclides/co-60/", "/methods/", "/saved/", "/404.html"];

/* ⑦ shell.json */
if (!Number.isInteger(V) || V < 1) bad.push(`shell.json version 이 정수가 아니다: ${V}`);
const hrefs = [];
(function walk(o) { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k === "href" || k === "home" || k === "account" || k === "disclaimer") { if (typeof v === "string") hrefs.push(v); } else walk(v); } })(spec);
for (const h of hrefs) if (!/^https:\/\/[a-z.]*radiation-lab\.com\//.test(h) && h !== "{disclaimer}") bad.push(`shell.json 에 절대 주소가 아닌 href: ${h}`);

/* 쪽 목록 — 산출물에서 뽑는다 */
if (!existsSync(DIST)) { console.error("❌ dist/calc 가 없다 — `npm run build` 먼저"); process.exit(1); }
const files = (function walk(d) { return readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]); })(DIST);
const pages = files.filter((f) => f.endsWith(".html")).map((f) => ({
  file: f, path: "/" + relative(DIST, f).replace(/index\.html$/, "").replace(/\\/g, "/"), s: readFileSync(f, "utf8").replace(/\r\n/g, "\n"),
}));
const HOME = new URL("/", SITE_URL_DEFAULT).href;
/* Astro 는 <title> 의 ' 를 &#39; 로 낸다 — 글자 엔터티 넷 + 숫자 엔터티를 되돌린다 */
const unesc = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
let hdrChars = 0, ftChars = 0, homeShares = 0;

for (const p of pages) {
  const tag = p.path;
  const here = BASE_PATH.replace(/\/$/, "") + p.path;                 // base 가 붙은 pathname — Astro.url.pathname 과 같은 꼴
  const noindex = /name="robots"[^>]*noindex/.test(p.s);
  const canonical = p.s.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const title = unesc(p.s.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");

  /* ① 머리글 */
  const heads = p.s.match(/<header class="site"[\s\S]*?<\/header>/g) || [];
  if (heads.length !== 1) bad.push(`${tag}: header.site 가 ${heads.length}개(하나여야 한다)`);
  else {
    const want = R.renderHeader(spec, { section: "calc", currentHref: currentHrefFor(here, SITE_URL_DEFAULT), apex: true });
    if (heads[0] !== want) {
      const i = [...heads[0]].findIndex((c, k) => c !== want[k]);
      bad.push(`${tag}: 머리글이 render.mjs 출력과 다르다(${heads[0].length} vs ${want.length}자, 첫 차이 ${i}번째: 「${heads[0].slice(Math.max(0, i - 20), i + 30).replace(/\n/g, "⏎")}」)`);
    }
    hdrChars = want.length;
  }
  /* ② 꼬리말 */
  const foots = p.s.match(/<footer class="site"[\s\S]*?<\/footer>/g) || [];
  if (foots.length !== 1) bad.push(`${tag}: footer.site 가 ${foots.length}개(하나여야 한다)`);
  else {
    const f = foots[0];
    const pageUrl = unesc(f.match(/id="share-copy" data-url="([^"?]+)\?/)?.[1] ?? "");
    const shareText = decodeURIComponent(f.match(/x\.com\/intent\/post\?text=([^&"]*)&amp;url=/)?.[1] ?? "");
    const want = R.renderFooter(spec, { section: "calc", pageUrl, shareText, apex: true });
    if (f !== want) bad.push(`${tag}: 꼬리말이 render.mjs 출력과 다르다(${f.length} vs ${want.length}자)`);
    if (pageUrl === HOME) {
      homeShares++;
      if (!noindex) bad.push(`${tag}: 색인되는 쪽인데 공유 줄이 apex 홈을 권한다(제 canonical 이어야 한다)`);
      if (shareText !== HOME_SHARE) bad.push(`${tag}: 홈을 권하는 공유 줄의 글이 HOME_SHARE 가 아니다 — 「${shareText}」`);
    } else {
      if (!canonical) bad.push(`${tag}: canonical 이 없는 쪽인데 공유 줄이 ${pageUrl} 을 권한다(홈이어야 한다)`);
      else if (pageUrl !== canonical) bad.push(`${tag}: 공유 줄의 주소 ${pageUrl} 가 canonical ${canonical} 과 다르다`);
      if (shareText !== title) bad.push(`${tag}: 공유 글 「${shareText}」 가 <title> 「${title}」 과 다르다`);
    }
    ftChars = want.length;
  }
  /* ③ head 자산 */
  const head = p.s.slice(0, p.s.indexOf("<body"));
  if (!head.includes(`<link rel="stylesheet" href="/shell/shell.css?v=${V}" />`)) bad.push(`${tag}: head 에 /shell/shell.css?v=${V} 가 없다`);
  if (!head.includes(`<script src="/shell/shell.js?v=${V}" defer></script>`)) bad.push(`${tag}: head 에 /shell/shell.js?v=${V} 가 없다`);
  if (!/dataset\.theme = dark \? "dark" : "light"/.test(head)) bad.push(`${tag}: head 의 그리기 전 테마 스크립트가 없다`);
  if ((head.match(/\/shell\/shell\.css/g) || []).length !== 1) bad.push(`${tag}: shell.css 링크가 하나가 아니다`);
  /* ④ 인라인 CSS · ⑤ 인라인 JS */
  const style = (p.s.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).join("\n");
  for (const left of [/--c-paper:/, /\.shdr-/, /\.tmenu-/, /\.rmt-theme/, /^\s*\.share \{/m, /@font-face/, /^\s*header\.site \{/m, /^\s*\.hd \{/m])
    if (left.test(style)) bad.push(`${tag}: 쪽의 인라인 CSS 에 옛 사본이 남았다 — ${left.source}`);
  const scripts = (p.s.match(/<script(?: [^>]*)?>[\s\S]*?<\/script>/g) || []).filter((x) => !/application\/ld\+json/.test(x)).join("\n");
  if (/radmeter-v2-theme"\s*,\s*JSON/.test(scripts) || /setItem\(\s*KEY/.test(scripts)) bad.push(`${tag}: 테마를 쓰는 스크립트가 쪽에 남았다(shell.js 가 든다)`);
  if (/data-share-copy|data-theme-toggle|data-acct-chip/.test(p.s)) bad.push(`${tag}: 옛 컴포넌트의 표식(data-share-copy · data-theme-toggle · data-acct-chip)이 남았다`);
  if (/data-site-header|class="shdr|class="tmenu/.test(p.s)) bad.push(`${tag}: 옛 자체 머리글 마크업이 남았다`);
  /* ⑥ 꼬리말 위 aside */
  const aside = p.s.match(/<aside class="site-notes[\s\S]*?<\/aside>/)?.[0];
  if (!aside) bad.push(`${tag}: 꼬리말 위 aside(site-notes)가 없다 — 도구 여덟 · 자료 출처 · 면책을 잃었다`);
  else {
    const tools = (aside.match(/href="\/calc\/[a-z-]+\/"/g) || []).length;
    if (tools < 8) bad.push(`${tag}: aside 의 도구 링크가 ${tools}개(여덟이어야 한다)`);
    if (!/IAEA/.test(aside) || !/NIST/.test(aside)) bad.push(`${tag}: aside 에 자료 출처(IAEA · NIST)가 없다`);
    if (!/do not replace/.test(aside)) bad.push(`${tag}: aside 에 면책 문단이 없다`);
  }
  if (SAMPLE.includes(p.path)) note(`${tag.padEnd(22)} 머리글 ${heads[0]?.length ?? 0}자 · 꼬리말 ${foots[0]?.length ?? 0}자 · 현재 ${(heads[0]?.match(/aria-current="page"/g) || []).length}곳 · 공유 → ${foots[0]?.includes(`data-url="${HOME}?`) ? "apex 홈" : "제 canonical"}`);
}

/* ④⑤ 묶인 CSS · JS(_astro) — Astro 는 컴포넌트 <style> · <script> 를 여기로 묶는다 */
const astro = existsSync(join(DIST, "_astro")) ? readdirSync(join(DIST, "_astro")) : [];
for (const f of astro.filter((x) => x.endsWith(".css"))) {
  const css = readFileSync(join(DIST, "_astro", f), "utf8");
  for (const left of [/--c-paper:/, /\.shdr-/, /\.tmenu-/, /\.rmt-theme/, /@font-face/, /header\.site\{/, /\.hd\{/, /\.share\{/])
    if (left.test(css)) bad.push(`_astro/${f}: 묶인 CSS 에 옛 사본이 남았다 — ${left.source}`);
}
for (const f of astro.filter((x) => x.endsWith(".js"))) {
  const js = readFileSync(join(DIST, "_astro", f), "utf8");
  if (/radmeter-v2-theme/.test(js) && /setItem/.test(js)) bad.push(`_astro/${f}: 테마를 쓰는 스크립트가 묶여 있다(shell.js 가 든다)`);
  if (/data-share-copy|data-theme-toggle|data-acct-chip/.test(js)) bad.push(`_astro/${f}: 옛 컴포넌트의 스크립트가 묶여 있다`);
}

/* ⑧ 사본이 정본과 같은가 — 경고만 */
const SRC = process.env.SHELL_SOURCE || join(ROOT, "..", "radiation-lab", "public", "shell");
const warn = [];
if (existsSync(join(SRC, "shell.json"))) {
  for (const f of ["shell.json", "render.mjs", "shell.css", "shell.js"]) {
    const a = readFileSync(join(ROOT, "shell", f), "utf8").replace(/\r\n/g, "\n");
    const b = existsSync(join(SRC, f)) ? readFileSync(join(SRC, f), "utf8").replace(/\r\n/g, "\n") : null;
    if (b === null) warn.push(`${SRC} 에 ${f} 가 없다`); else if (a !== b) warn.push(`shell/${f} 가 우산 정본(${SRC})과 다르다 — 정본이 앞섰으면 npm run sync-shell`);
  }
}

if (bad.length) { console.error(`❌ 공통 셸 v${V} — 정본에서 벗어난 것 ${bad.length}건\n`); bad.forEach((b) => console.error("  · " + b)); process.exit(1); }
console.log(`✅ 공통 셸 v${V} — ${pages.length}쪽 머리글(${hdrChars}자) · 꼬리말(${ftChars}자)이 render.mjs 출력과 글자 그대로 같다 · head 자산 ?v=${V} · 옛 사본 0(인라인 + _astro ${astro.length}개) · 홈을 권하는 쪽 ${homeShares}(noindex 만) · aside 도구 8 · shell.json 절대 주소 ${hrefs.length}개`);
for (const w of warn) console.log("   ⚠️  " + w);
if (!existsSync(join(SRC, "shell.json"))) console.log(`   (우산 정본 ${SRC} 이 옆에 없어 사본 대조는 건너뛰었다 — CI 에서는 늘 그렇다)`);
