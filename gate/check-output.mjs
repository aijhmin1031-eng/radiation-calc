/** 산출물 점검 — 빌드는 통과하는데 조용히 틀린 것들을 본다.
 *  ★ 이 레포들이 실제로 밟은 자리만 검사한다. 「있을 법한 것」을 늘리면 늘 빨개져 아무도 안 본다. */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
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
 *  (2026-09-14 실측) — 그때는 그 문서들이 우산 루트에 없었다.
 *  ★★ **2026-09-21 부터 우산 루트에 실재한다**(우산 레포 `public/{privacy,terms,contact}/`,
 *    2026-09-28 라이브 200 으로 재확인). 그래서 셋을 정확 일치로 허용한다 —
 *    「있을 법한 주소」가 아니라 **재서 확인한 주소**다.
 *  ★★ 슬래시 없는 쪽이 정본이다: 우산 자기 꼬리말·사이트맵·라이브 canonical 셋이
 *    모두 `/privacy` 다. 슬래시를 붙인 것도 200 이지만 canonical 이 딴 곳을 가리키는
 *    중복이므로 허용 목록에 넣지 않는다 — 넣으면 게이트가 중복을 승인한다. */
/** ★★ 접두 일치로만 보면 **`"/"` 가 모든 절대경로를 통과시킨다** — 이 검사가 그렇게
 *  죽어 있었고, 역테스트로 잡았다(2026-09-14). 우산 루트는 **정확 일치**로만 허용하고
 *  나머지는 접두로 본다. */
/** ★★ `/track.js` — **플랫폼 방문 집계**(2026-09-15). 우산이 오리진 루트에 두는 파일이고
 *  lab 넷이 **같은 한 벌**을 읽는다. base 를 붙이면 `/calc/track.js` 가 되어 **404 가 나고
 *  빌드는 통과하며 집계만 조용히 죽는다** — 그래서 base 밖을 가리키는 것이 **맞다.**
 *  ★ 「있을 법한 주소」를 적어 두지 않는다는 위 규칙을 지킨다: 이 파일은 우산 저장소의
 *    `public/track.js` 로 **실재한다**(정본과 경위는 그 레포 README). */
/** ★★ **플랫폼 막대의 분야 칸 셋**(2026-10-06 — 네 곳이 같은 상단 메뉴를 든다). `/calc/` · `/radimeter/` ·
 *  `/disposal/` 은 **오리진 루트 경로 그대로** 쓰는 것이 맞다(base 를 붙이면 `/calc/radimeter/` 라는 없는 주소).
 *  셋 다 우산 루트에서 이미 살아 있는 주소다(라이브 200 — 2026-10-06 `curl` 실측). `/calc/` 는 base 아래라 위 검사가 먼저 통과시키지만
 *  정본 표를 한 모양으로 둔다.
 *  ★ 그전에는 `PREFIX_OK = ["/radimeter/", "/disposal"]` 로 **접두 일치**였다 — `/radimeter/` 밑의 아무 주소나,
 *    `/disposalXYZ` 까지 통과했다. 그 접두를 쓰던 링크(옛 법무 링크 `/radimeter/privacy/` 등)는 2026-09-28 에
 *    우산 루트로 옮겨 사라졌고, 남은 것은 분야 칸 셋과 본문의 `/disposal/` 하나다. 그래서 **완전 일치**로 좁힌다
 *    (역테스트: `/radimeter/foo` 를 심으면 걸린다). */
/* ★★ 2026-10-06 ② — 분야 칸 셋은 이제 **절대 주소**다(RadiMeter·처분 lab 이 하위 도메인으로 나갔다). 루트 경로로
 *  남은 것은 이 오리진 안의 것뿐이다. `/radimeter/`·`/disposal/` 이 다시 루트 경로로 나타나면 그것은 우산의
 *  301 을 한 번 더 도는 낡은 링크다 — 그래서 허용 목록에서 뺐다. */
const EXACT_OK = ["/", "/robots.txt", "/track.js", "/privacy", "/terms", "/contact", "/calc/"];
let stray = 0;
for (const p of pages) {
  for (const m of p.s.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const h = m[1];
    if (h.startsWith(BASE_PATH)) continue;
    if (EXACT_OK.includes(h)) continue;
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

/* ── ⑧ 404 쪽이 산출 루트에 있는가 ─────────────────────────────
 *  ★★ Vercel 은 **산출 루트의 `404.html`** 만 없는 주소에 내준다. Astro 는 `dist/calc/404.html` 에
 *    굽고, 그것을 올리는 것은 `scripts/copy-404.mjs`(빌드 끝)다. 그 한 단계가 빠지면 빌드는 통과하고
 *    라이브에서 평문 `NOT_FOUND` 가 나간다 — 이웃 lab 이 `404.astro` 를 두고도 그랬다(2026-10-03 실측).
 *  재는 것: 루트 사본이 있는가 · base 아래 원본과 **같은 내용**인가 · `noindex` 인가 · 이 lab 의 쪽인가(이름·길). */
console.log("\n⑧ 404 쪽이 산출 루트에 있는가");
{
  const rootFile = join(DIST, "..", "404.html");
  const baseFile = join(DIST, "404.html");
  if (!existsSync(baseFile)) fail.push("dist/calc/404.html 이 없다 — src/pages/404.astro 가 없거나 빌드가 굽지 않았다");
  else if (!existsSync(rootFile)) fail.push("dist/404.html 이 없다 — scripts/copy-404.mjs 가 빌드 끝에 안 돌았다(라이브는 평문 NOT_FOUND 가 된다)");
  else {
    const a = readFileSync(baseFile, "utf8"), b = readFileSync(rootFile, "utf8");
    if (a !== b) fail.push("dist/404.html 이 dist/calc/404.html 과 다르다 — 낡은 사본이다");
    if (!/name="robots"[^>]*noindex/.test(a)) fail.push("404 쪽에 noindex 가 없다");
    if (!a.includes(SITE_NAME)) fail.push("404 쪽에 이름이 없다 — 이 lab 의 쪽이 아니다");
    const ways = (a.match(/href="\/calc\/[^"]*"/g) || []).length;
    if (ways < 8) fail.push(`404 쪽의 길이 ${ways}개뿐이다 — 막다른 쪽`);
    note(`루트 사본 있음 · 원본과 같음 · noindex · 길 ${ways}개`);
  }
}

/* ── ⑨ 내부 링크가 실재하는 파일에 닿는가 ─────────────────────────────
 *  ★★ 계기(2026-10-06 ④). 소유주 결정으로 핵종 낱장 77장을 지웠다(「불필요한 것들은 과감하게 잘라내자」).
 *    그 쪽들로 가는 링크가 **살아남은 쪽에 177개** 있었다(목록 77 · 같은 원소의 이웃 82 · 긴 글 18). 그런데 이 lab 에는
 *    **죽은 내부 링크를 재는 게이트가 하나도 없었다** — ② 는 base 밖으로 나가는지만 보고, `check-render` 는 쪽을 열 뿐
 *    링크를 따라가지 않는다. 그래서 링크는 `NuclideRef` 한 자리에서만 그리게 했고(쪽이 없으면 이름만), 여기서 **결과**를 잰다.
 *  ★ 재는 것: base 아래를 가리키는 `href`·`src` 전부(질의·앵커는 뗀다)가 `dist/calc/` 의 파일이나 `…/index.html` 에 닿는가.
 *    base 밖(우산 루트의 법무·집계)은 ② 가 정확 일치로 본다 — 여기서 다시 보지 않는다.
 *  ★ 못 보는 것: 앵커(`#hvl`)가 그 쪽에 실제로 있는지 · 바깥 링크가 살아 있는지 · 자바스크립트가 만드는 주소. */
console.log("\n⑨ 내부 링크가 실재하는 파일에 닿는가");
{
  const ROOT_PREFIX = BASE_PATH.replace(/\/$/, "");
  const exists = (u) => {
    const rel = u.slice(ROOT_PREFIX.length).replace(/^\//, "");
    const f = join(DIST, rel);
    if (rel === "" || rel.endsWith("/")) return existsSync(join(f, "index.html"));
    return (existsSync(f) && statSync(f).isFile()) || existsSync(join(f, "index.html"));
  };
  let seen = 0; const dead = new Map();
  for (const p of pages) {
    for (const m of p.s.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const u = m[1].replace(/&amp;/g, "&").split(/[?#]/)[0];
      if (u !== ROOT_PREFIX && !u.startsWith(ROOT_PREFIX + "/")) continue;
      seen++;
      if (!exists(u)) dead.set(u, [...(dead.get(u) ?? []), p.path]);
    }
  }
  for (const [u, from] of [...dead].slice(0, 12))
    fail.push(`죽은 내부 링크 ${u} — ${from.length}쪽에서 (${[...new Set(from)].slice(0, 3).join(", ")})`);
  if (dead.size > 12) fail.push(`… 죽은 내부 주소가 ${dead.size}개다(위는 열둘)`);
  note(`내부 링크·자원 ${seen}개 · 죽은 주소 ${dead.size}개`);
}

console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
                        : "\n✅ 산출물 점검 통과");
process.exit(fail.length ? 1 : 0);
