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
  if (p.endsWith("/")) p += "index.html";
  if (!extname(p)) p += "/index.html";
  const f = join(DIST, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const HUB = `${ORIGIN}${BASE_PATH}/`;

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

await browser.close();
server.close();

/* ④ 양방향 — 등록부에 없는 읽을 글이 산출물에 있는가 */
const TOOL_SLUGS = new Set(
  [...readFileSync(join(ROOT, "src", "lib", "tools.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)]
    .map((m) => `/${m[1]}/`));
/** 읽을 글이 아닌 것 — 도구·허브·법무·유틸·낱장 묶음. 여기 없는 최상위 쪽이 후보다. */
const NOT_A_NOTE = new Set([
  "/", "/nuclides/", "/methods/", "/validation/", "/saved/", "/account/",
  "/disclaimer/", "/search/", "/404/", "/units/",
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
