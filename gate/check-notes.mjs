/** ★★ **읽을 글 동선 게이트**(2026-09-26 신설) — `npm run check-notes`.
 *
 *  계기: 소유주가 화면에서 잡았다 — 「Shield materials for beta emitters … 이건 랜딩페이지에서
 *  어디로 어디로 들어와야 해? 찾기가 힘드네」. 실측하니 **허브(`/`)에서 가는 길이 0개**였고,
 *  닿는 유일한 경로가 `/beta/`(도구 쪽) **본문 산문 속의 링크 한 개**였다.
 *
 *  ★★★ **이 게이트가 고치는 것은 「무엇을 묻는가」이다.**
 *    이 쪽 셋을 세울 때 나는 「고아 쪽을 만들지 않는다」를 확인하고 통과시켰고 **그 말은
 *    맞았다** — 들어오는 링크가 저마다 하나씩 있었다. 그런데 **「고아가 아니다」와
 *    「찾을 수 있다」는 다른 층**이고, 앞엣것만 재고 뒤엣것을 잰 것처럼 넘어갔다.
 *    그래서 여기서는 자를 바꾼다 — **「허브에서 몇 번에 닿는가」**를 센다.
 *
 *  재는 것
 *    ① **등록부의 글이 허브 본문에서 보이는가** — `NOTES` 를 정본으로 읽고, 허브에 그
 *       주소로 가는 **보이는 링크**가 있는지 본다. 머리글·꼬리말은 세지 않는다:
 *       그 둘은 모든 쪽에 있어 **「허브에 있다」를 언제나 참으로 만든다**(재지 않고
 *       통과하는 검사가 된다).
 *    ② **클릭 1회로 그 쪽에 닿는가** — 실제로 눌러서 도착지를 확인한다. 「링크가 있다」와
 *       「그 링크가 거기로 간다」는 또 다른 층이다(`u()` 를 빠뜨리면 base 밖으로 간다).
 *    ③ **쪽이 실제로 서는가** — 도착한 쪽에 `h1` 이 있고 본문이 비어 있지 않은가.
 *    ④ **등록부와 산출물이 어긋나지 않는가 — 양방향이다.**
 *       · 등록부에 있는데 산출물에 그 쪽이 없다 → 죽은 카드(404 로 보낸다)
 *       · 산출물에 낱장 묶음 밖의 읽을 글이 있는데 **등록부에 없다** → **다음에 또 묻힌다.**
 *       ★ 뒤엣것이 이 게이트의 핵심이다. 앞엣것만 보면 **새 글을 등록하지 않는 것**이
 *         그대로 통과하고, 그것이 이번에 일어난 일이다.
 *    ⑤ **모바일에서도 닿는가** — 390px 에서 링크가 숨지 않는가.
 *
 *  ★ **못 보는 것**
 *    · **글이 좋은지**는 못 잰다. 분량·겹침은 `check-adsense` 가, 조판은 `check-render` 가 본다.
 *    · **허브 말고 다른 자리**(도구 쪽 산문·`/methods/`)의 링크는 세지 않는다 — 그것들은
 *      있어도 좋지만 **있다고 해서 찾을 수 있는 것은 아니다**(그것이 이 결함의 정체다).
 *    · 사람이 실제로 누르는지는 못 잰다. 보증하는 것은 **닿을 수 있다**까지다. */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { serveShell } from "./shell-assets.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist", "calc");
const BASE_PATH = "/calc";
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
                ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png",
                ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain",
                ".woff2": "font/woff2", ".ico": "image/x-icon" };

/** 등록부를 **정본으로** 읽는다. 화면이 그것을 그리므로 같은 원천을 봐야 어긋남이 잡힌다. */
const notesSrc = readFileSync(join(ROOT, "src", "lib", "notes.ts"), "utf8");
const NOTE_PATHS = [...notesSrc.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
if (!NOTE_PATHS.length) {
  console.error("❌ 읽을 글 동선 — notes.ts 에서 path 를 하나도 못 읽었다");
  process.exit(1);
}

if (!existsSync(DIST)) {
  console.error(`❌ 읽을 글 동선 — 산출물이 없다(${DIST}). 먼저 npm run build`);
  process.exit(1);
}

const stripBase = (p) => (p.startsWith(BASE_PATH) ? p.slice(BASE_PATH.length) || "/" : p);
const server = createServer((req, res) => {
  let p = stripBase(decodeURIComponent(req.url.split("?")[0]));
  if (serveShell(p, res)) return;   // 공통 셸 자산 /shell/* — 플랫폼 층(우산)이 내주는 것을 흉내 낸다(gate/shell-assets.mjs)
  if (p.endsWith("/")) p += "index.html";
  if (!extname(p)) p += "/index.html";
  const f = join(DIST, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
/* ★★ 2026-10-06 ⑥ — 이 lab 의 허브는 `/methods/` 다. `/calc/` 허브는 apex 홈으로 갔다(301, 명세 §8) — apex 홈은 다른
   레포(우산)라 여기서 못 잰다. 그래서 lab 안에서 한 번에 닿는 자리는 methods 쪽의 「Longer notes」 구획이다. */
const HUB = `${ORIGIN}${BASE_PATH}/methods/`;

const issues = [];
const notes = [];
const browser = await chromium.launch(LAUNCH);

/* ①②③⑤ 허브에서 눌러 간다 */
for (const v of [{ n: "데스크톱", w: 1280, h: 900 }, { n: "폰", w: 390, h: 800 }]) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h } });
  await page.goto(HUB, { waitUntil: "load" });
  for (const path of NOTE_PATHS) {
    const href = `${BASE_PATH}${path}`;
    const sel = `main a[href="${href}"], a[href="${href}"]`;
    const seen = await page.evaluate((h) => {
      const shown = (el) => {
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          const c = getComputedStyle(n);
          if (c.display === "none" || c.visibility === "hidden" || Number(c.opacity) === 0) return false;
        }
        return true;
      };
      return [...document.querySelectorAll(`a[href="${h}"]`)]
        .filter((a) => !a.closest("header") && !a.closest("footer") && !a.closest("nav"))
        .filter((a) => shown(a) && a.getBoundingClientRect().width > 0)
        .map((a) => (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40));
    }, href);
    if (!seen.length) {
      issues.push(`허브 ${v.n} — ${path} 로 가는 본문 링크가 0개다(머리글·꼬리말은 세지 않는다)`);
      continue;
    }
    await page.click(sel);
    await page.waitForLoadState("load");
    const at = new URL(page.url()).pathname;
    if (at !== href) {
      issues.push(`허브 ${v.n} — ${path} 를 눌렀더니 ${at} 에 갔다`);
    } else {
      const body = await page.evaluate(() => ({
        h1: (document.querySelector("h1")?.textContent || "").trim().slice(0, 40),
        words: (document.querySelector("main")?.innerText || "").trim().split(/\s+/).length,
      }));
      if (!body.h1 || body.words < 50)
        issues.push(`${path} — 쪽이 서지 않는다(h1 「${body.h1}」· 본문 ${body.words}어)`);
      else notes.push(`${v.n} ${path} — 클릭 1회 · 「${body.h1}」· ${body.words}어`);
    }
    await page.goto(HUB, { waitUntil: "load" });
  }
  await page.close();
}

/* ⑥ `/notes/` 목록에서 글로 — 클릭 1회, 두 뷰포트(2026-11-01). 등록부는 `lib/articles.ts` 다. */
const articleSrc = readFileSync(join(ROOT, "src", "lib", "articles.ts"), "utf8");
const ARTICLE_SLUGS = [...articleSrc.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
if (!ARTICLE_SLUGS.length) issues.push("articles.ts 에서 slug 를 하나도 못 읽었다");
const LIST = `${BASE_PATH}/notes/`;
for (const v of [{ n: "데스크톱", w: 1280, h: 900 }, { n: "폰", w: 390, h: 800 }]) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h } });
  for (const slug of ARTICLE_SLUGS) {
    await page.goto(`${ORIGIN}${LIST}`, { waitUntil: "load" });
    const href = `${LIST}${slug}/`;
    const link = page.locator(`main [data-article-card] a[href="${href}"]`).first();
    if (!(await link.isVisible().catch(() => false))) { issues.push(`목록 ${v.n} — ${slug} 로 가는 링크가 안 보인다`); continue; }
    await link.click();
    await page.waitForLoadState("load");
    const at = new URL(page.url()).pathname;
    if (at !== href) issues.push(`목록 ${v.n} — ${slug} 를 눌렀더니 ${at} 에 갔다`);
    else notes.push(`${v.n} /notes/ → ${slug} 클릭 1회`);
  }
  await page.close();
}

await browser.close();
server.close();

/* ⑦⑧ `/notes/` 글 — 산출물을 읽는다(브라우저 없음).
 *  ★ 새 구역이라 「틀이 약속한 것」이 글마다 실제로 섰는지 잰다: 등록부 ↔ 파일 양방향 · 목록 순서 · 어수 900~1500 ·
 *    Article 구조화 데이터 · 보이는 날짜와 같은 값 · canonical · 사이트맵 · 출처 · 계산기 링크 · 계산기 쪽에서 오는 「Worked example」 줄.
 *  ★ 못 보는 것: 글이 좋은지 · 수치가 맞는지(`note-examples.test.ts` 가 잰다) · OG 그림(`check-og`). */
const pagesNotesDir = join(ROOT, "src", "pages", "notes");
const articleFiles = existsSync(pagesNotesDir)
  ? readdirSync(pagesNotesDir).filter((f) => f.endsWith(".astro") && f !== "index.astro").map((f) => f.replace(/\.astro$/, ""))
  : [];
for (const f of articleFiles) if (!ARTICLE_SLUGS.includes(f)) issues.push(`src/pages/notes/${f}.astro 가 articles.ts 에 없다 — 목록에 안 선다`);
for (const s of ARTICLE_SLUGS) if (!articleFiles.includes(s)) issues.push(`articles.ts 의 ${s} 에 쪽 파일이 없다`);

const listHtml = existsSync(join(DIST, "notes", "index.html")) ? readFileSync(join(DIST, "notes", "index.html"), "utf8") : "";
const listed = [...listHtml.matchAll(/data-article-card[\s\S]*?href="\/calc\/notes\/([a-z0-9-]+)\/"[\s\S]*?<time datetime="([\d-]+)"/g)];
if (listed.length !== ARTICLE_SLUGS.length) issues.push(`목록의 글 ${listed.length}편 ≠ 등록부 ${ARTICLE_SLUGS.length}편`);
for (let i = 1; i < listed.length; i++)
  if (listed[i - 1][2] < listed[i][2]) issues.push(`목록 순서 — ${listed[i][1]} 가 더 새 글인데 아래에 있다`);

const htmlWords = (s) => s.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")
  .replace(/&[a-z#0-9]+;/gi, " ").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
const siteMap = readFileSync(join(DIST, "sitemap-0.xml"), "utf8");
const articleLine = [];
for (const slug of ARTICLE_SLUGS) {
  const f = join(DIST, "notes", slug, "index.html");
  if (!existsSync(f)) { issues.push(`${slug} — 산출물에 없다`); continue; }
  const h = readFileSync(f, "utf8");
  const bodyHtml = (h.match(/data-article-body[^>]*>([\s\S]*?)<\/section>/) || [, ""])[1];
  const w = htmlWords(bodyHtml);
  if (w < 900 || w > 1500) issues.push(`${slug} — 본문 ${w}어(900~1500)`);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [, ""])[1].replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  if (title.length > 60) issues.push(`${slug} — 제목 ${title.length}자 > 60`);
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [, ""])[1];
  if (desc.length < 90 || desc.length > 155) issues.push(`${slug} — 설명 ${desc.length}자(90~155)`);
  if (!h.includes(`rel="canonical" href="https://radiation-lab.com/calc/notes/${slug}/"`)) issues.push(`${slug} — canonical 이 자기 주소가 아니다`);
  if (!siteMap.includes(`/calc/notes/${slug}/`)) issues.push(`${slug} — 사이트맵에 없다`);
  const ld = JSON.parse((h.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/) || [, "{}"])[1]);
  const node = (ld["@graph"] || []).find((n) => n["@type"] === "Article");
  if (!node) issues.push(`${slug} — Article 구조화 데이터가 없다`);
  else {
    if (node.author?.name !== "Radiation Lab") issues.push(`${slug} — 저자가 Radiation Lab 이 아니다(${node.author?.name})`);
    const pub = (h.match(/datetime="([\d-]+)" data-article-published/) || [])[1];
    const rev = (h.match(/datetime="([\d-]+)" data-article-reviewed/) || [])[1];
    if (!pub || node.datePublished !== pub) issues.push(`${slug} — 게시일: 화면 ${pub} · 구조화 ${node.datePublished}`);
    if (!rev || node.dateModified !== rev) issues.push(`${slug} — 검토일: 화면 ${rev} · 구조화 ${node.dateModified}`);
    if (!node.image?.includes(`/og/notes-${slug}.png`)) issues.push(`${slug} — 구조화 데이터의 그림이 자기 OG 가 아니다(${node.image})`);
  }
  if (!/property="og:type" content="article"/.test(h)) issues.push(`${slug} — og:type 이 article 이 아니다`);
  const srcCount = ((h.match(/data-article-sources[^>]*>([\s\S]*?)<\/ul>/) || [, ""])[1].match(/<li/g) || []).length;
  if (srcCount < 2) issues.push(`${slug} — 출처 ${srcCount}개`);
  const calcHtml = (h.match(/data-article-calculators[^>]*>([\s\S]*?)<\/section>/) || [, ""])[1];
  if (!/href="\/calc\/[a-z0-9-]+\//.test(calcHtml)) issues.push(`${slug} — 계산기 링크가 없다`);
  /* ★ 소유주 규칙: 빈말 · 과장 · 「광고 없음」을 쓰지 않는다(About 쪽에 광고 계획이 있다). */
  const banned = bodyHtml.match(/\b(no ads|ad[- ]free|without ads|most accurate|the best|world[- ]class|cutting[- ]edge)\b/i);
  if (banned) issues.push(`${slug} — 쓰지 않기로 한 문구 「${banned[0]}」`);
  articleLine.push(`${slug} ${w}어 · 출처 ${srcCount}`);
}
const WORKED = { "/decay/": "radioactive-decay-worked-examples", "/radiopharmaceutical-decay/": "lu-177-decay-worked-example", "/mda/": "mda-worked-example" };
for (const [from, slug] of Object.entries(WORKED)) {
  const h = readFileSync(join(DIST, from.replace(/^\//, ""), "index.html"), "utf8");
  const line = (h.match(/<p data-worked-example[^>]*>([\s\S]*?)<\/p>/) || [, ""])[1];
  if (!line.includes(`/calc/notes/${slug}/`)) issues.push(`${from} — 「Worked example」 줄이 ${slug} 로 가지 않는다`);
  if (!line.includes(`href="/calc/notes/"`)) issues.push(`${from} — 「Worked example」 줄에 목록 링크가 없다`);
}
notes.push(`/notes/ ${ARTICLE_SLUGS.length}편 — ${articleLine.join(" · ")}`);

/* ④ 양방향 — 등록부에 없는 읽을 글이 산출물에 있는가 */
const TOOL_SLUGS = new Set(
  [...readFileSync(join(ROOT, "src", "lib", "tools.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)]
    .map((m) => `/${m[1]}/`));
/** 읽을 글이 아닌 것 — 도구·허브·법무·유틸·낱장 묶음. 여기 없는 최상위 쪽이 후보다. */
const NOT_A_NOTE = new Set([
  "/", "/nuclides/", "/methods/", "/validation/", "/saved/", "/account/",
  "/disclaimer/", "/search/", "/404/", "/units/",
  /* T15 — 판마다 바뀐 것의 기록. 읽을 글이 아니라 Methods 와 같은 층의 문서 쪽이다 — 쪽마다의 판 줄(꼬리말 위)과
     Methods 「Corrections」가 잇는다. */
  "/changelog/",
]);
const pagesDir = readdirSync(join(ROOT, "src", "pages"), { withFileTypes: true });
const topLevel = pagesDir
  .filter((e) => e.isFile() && e.name.endsWith(".astro") && !e.name.startsWith("["))
  .map((e) => (e.name === "index.astro" ? "/" : `/${e.name.replace(/\.astro$/, "")}/`));
const registered = new Set(NOTE_PATHS);
const unregistered = topLevel.filter(
  (p) => !registered.has(p) && !TOOL_SLUGS.has(p) && !NOT_A_NOTE.has(p));
if (unregistered.length)
  issues.push(`등록부에 없는 최상위 쪽 ${unregistered.length}개 — ${unregistered.join(" · ")}. `
    + "읽을 글이면 notes.ts 에 적고, 아니면 이 게이트의 NOT_A_NOTE 에 왜 아닌지와 함께 적는다");
else notes.push(`등록부 ${NOTE_PATHS.length}개 · 도구 ${TOOL_SLUGS.size}개 · 읽을 글이 아닌 쪽 ${NOT_A_NOTE.size}개 — 남는 것 0`);

for (const p of NOTE_PATHS) {
  if (!existsSync(join(DIST, p.replace(/^\//, ""), "index.html")))
    issues.push(`${p} — 등록부에 있는데 산출물에 없다(허브가 404 로 보낸다)`);
}

if (issues.length) {
  console.error(`❌ 읽을 글 동선 ${issues.length}건 — 허브에서 찾을 수 없다`);
  for (const i of issues) console.error("   " + i);
  for (const n of notes) console.error("   · " + n);
  process.exit(1);
}
console.log(`✅ 읽을 글 동선 통과 — 등록부 ${NOTE_PATHS.length}개 전부 허브에서 클릭 1회, 두 뷰포트`);
for (const n of notes) console.log("   · " + n);
console.log("   ※ 못 보는 것: 글이 좋은지(분량·겹침은 check-adsense · 조판은 check-render) ·");
console.log("      허브 밖의 링크(도구 산문·/methods/ — 있어도 좋지만 있다고 찾을 수 있는 것은 아니다) · 사람이 누르는지");
