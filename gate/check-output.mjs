/** 산출물 점검 — 빌드는 통과하는데 조용히 틀린 것들을 본다.
 *  ★ 이 레포들이 실제로 밟은 자리만 검사한다. 「있을 법한 것」을 늘리면 늘 빨개져 아무도 안 본다. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { BASE_PATH, SITE_URL_DEFAULT, SITE_NAME } from "../brand.ts";

const DIST = "dist/calc";
const fail = [];
const note = (s) => console.log("   " + s);

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const files = existsSync(DIST) ? walk(DIST) : [];
if (files.length === 0) fail.push(`${DIST} 가 비어 있다 — 빌드가 안 돌았다`);

const html = files.filter((f) => f.endsWith(".html"));
const pages = html.map((f) => ({
  f, path: "/" + relative(DIST, f).replace(/index\.html$/, "").replace(/\\/g, "/"),
  s: readFileSync(f, "utf8"),
}));
const strip = (s) => s.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ")
  .replace(/\s+/g, " ").trim();
const words = (s) => strip(s).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

console.log(`\n① 쪽 ${pages.length}장`);

/* ── base 경로 ──────────────────────────────────────────────
   ★ Astro 가 base 를 붙여 주지 않는 자리가 여럿이다 — 손으로 적은 href, redirects 의
     목적지, 스프레드 속성, is:inline 스크립트, og:image. 전부 빌드는 통과한다. */
console.log("\n② base 경로 — 내부 링크가 /calc/ 밖을 가리키지 않는가");
/** ★ base 밖으로 나가는 내부 링크는 **실제로 있는 것만** 허용한다.
 *  `/privacy/`·`/terms/` 를 오리진 루트로 걸었다가 **라이브에서 404** 가 났다
 *  (2026-09-14 실측) — 그 문서들은 플랫폼 층이지만 우산 루트에는 없고
 *  `/radimeter/` 아래에 산다. 「있을 법한 주소」를 적어 두면 게이트가 그것을 승인한다. */
/** ★★ 접두 일치로만 보면 **`"/"` 가 모든 절대경로를 통과시킨다** — 이 검사가 그렇게
 *  죽어 있었고, 역테스트로 잡았다(2026-09-14). 우산 루트는 **정확 일치**로만 허용하고
 *  나머지는 접두로 본다. */
/** ★★ `/track.js` — **플랫폼 방문 집계**(2026-09-15). 우산이 오리진 루트에 두는 파일이고
 *  lab 넷이 **같은 한 벌**을 읽는다. base 를 붙이면 `/calc/track.js` 가 되어 **404 가 나고
 *  빌드는 통과하며 집계만 조용히 죽는다** — 그래서 base 밖을 가리키는 것이 **맞다.**
 *  ★ 「있을 법한 주소」를 적어 두지 않는다는 위 규칙을 지킨다: 이 파일은 우산 저장소의
 *    `public/track.js` 로 **실재한다**(정본과 경위는 그 레포 README). */
const EXACT_OK = ["/", "/robots.txt", "/track.js"];
const PREFIX_OK = ["/radimeter/", "/disposal"];
let stray = 0;
for (const p of pages) {
  for (const m of p.s.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const h = m[1];
    if (h.startsWith(BASE_PATH)) continue;
    if (EXACT_OK.includes(h)) continue;
    if (PREFIX_OK.some((x) => h.startsWith(x))) continue;
    fail.push(`${p.path}: base 밖을 가리킨다 — ${h}`); stray++;
  }
}
note(stray === 0 ? "샌 링크 0" : `샌 링크 ${stray}`);

/* ── canonical ── */
console.log("\n③ canonical");
for (const p of pages) {
  const c = (p.s.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!c) { fail.push(`${p.path}: canonical 이 없다`); continue; }
  if (!c.startsWith(SITE_URL_DEFAULT + BASE_PATH)) fail.push(`${p.path}: canonical 이 이상하다 — ${c}`);
  if (!c.endsWith("/")) fail.push(`${p.path}: canonical 끝 슬래시가 없다 — 사이트맵과 어긋난다`);
}
note(`${pages.length}장 확인`);

/* ── noindex 가 사이트맵에 새는가 ──────────────────────────
   ★ 이 레포들이 되풀이해 밟은 함정이다(/app/ 에 이어 /search/ 도 같은 실수). */
console.log("\n④ noindex 쪽이 사이트맵에 샜는가");
const smFile = files.find((f) => /sitemap-\d+\.xml$/.test(f));
const sm = smFile ? readFileSync(smFile, "utf8") : "";
const noindex = pages.filter((p) => /name="robots"[^>]*noindex/.test(p.s));
for (const p of noindex)
  if (sm.includes(SITE_URL_DEFAULT + BASE_PATH.replace(/\/$/, "") + p.path))
    fail.push(`noindex 인 ${p.path} 가 사이트맵에 있다`);
note(`noindex ${noindex.length}장 (${noindex.map((p) => p.path).join(", ") || "없음"}) · 사이트맵 ${(sm.match(/<loc>/g) || []).length}줄`);

/* ── 한국어가 산출물에 샜는가 ───────────────────────────────
   ★ Astro 는 <!-- --> 주석을 그대로 내보낸다. 번들(.js/.css)은 일부러 뺀다 —
     거기 한국어는 의도된 것이고(주석·데이터), 넣으면 늘 빨개져 아무도 안 본다. */
console.log("\n⑤ 산출물에 한국어가 샜는가 (공개 콘텐츠는 전부 영문)");
let ko = 0;
for (const f of files.filter((x) => /\.(html|txt|xml|svg|webmanifest)$/.test(x))) {
  const hits = (readFileSync(f, "utf8").match(/[가-힣]/g) || []).length;
  if (hits) { fail.push(`${relative(DIST, f)}: 한국어 ${hits}자`); ko += hits; }
}
note(ko === 0 ? "0자" : `${ko}자`);

/* ── 얇은 쪽 ──────────────────────────────────────────────
   ★ 처분 lab 의 계산기 쪽이 산문비 16~21% 로 애드센스 위험 1순위였다.
     이 레포는 도구와 해설을 한 쪽에 두어 그것을 구조적으로 피한다 — 그 약속을 지킨다. */
console.log("\n⑥ 색인 쪽 본문 어수 (하한 250)");
const THIN = 250;
for (const p of pages) {
  if (/name="robots"[^>]*noindex/.test(p.s)) continue;
  const main = (p.s.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [, ""])[1];
  const w = words(main);
  if (w < THIN) fail.push(`${p.path}: 본문 ${w}어 — 하한 ${THIN}`);
  note(`${p.path.padEnd(22)} ${String(w).padStart(5)}어`);
}

/* ── 면책·출처 ────────────────────────────────────────────
   ★ 「무엇이 있는가」만 묻는 검사는 「무엇이 없는가」를 못 본다 —
     공개판 엑셀에 면책이 통째로 빠진 것을 오래 못 봤던 교훈이다. */
console.log("\n⑦ 면책과 출처가 모든 쪽에 있는가");
for (const p of pages) {
  if (!/do not replace|does not replace/i.test(p.s)) fail.push(`${p.path}: 면책 문구가 없다`);
  if (!p.s.includes(SITE_NAME)) fail.push(`${p.path}: 이름이 없다`);
  if (!/IAEA/.test(p.s) || !/NIST/.test(p.s)) fail.push(`${p.path}: 데이터 출처 표기가 없다`);
}
note("면책 · 이름 · IAEA/NIST 출처");

console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
                        : "\n✅ 산출물 점검 통과");
process.exit(fail.length ? 1 : 0);
