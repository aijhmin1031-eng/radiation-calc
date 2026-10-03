/** 접근성 실측 — axe-core 로 잰다 (2026-10-03 신설).
 *
 *  ★ 계기: 플랫폼 네 곳(우산·RadiMeter·RadCalc·M-Phreefiteq)에 axe-core 를 처음 돌리자
 *    **같은 결함 하나가 300 노드 넘게** 나왔다 — 라이트 테마의 강조색 `168 94 4` 가 종이
 *    `232 234 230` 위에서 **4.06:1**, WCAG AA 의 4.5:1 에 못 미쳤다. 링크·눈썹·활성 칸이 전부
 *    그 색이다. 사람 눈에는 「앰버-갈색 글자」로 멀쩡해 보였고, `check-render` 는 **「안 보이는
 *    글자」(글자색 ≈ 배경색)만** 잡는다 — **보이지만 기준 미달**은 그 자의 시야 밖이었다.
 *    같은 색상에서 명도만 내려(`143 78 0` → 종이 위 5.32:1) 고쳤고, **되돌아가지 않게** 이
 *    게이트를 세운다. 같은 날 이 lab 에서 더 나온 것 — ① `<nav>` 넷에 이름이 없어 화면낭독기가
 *    「navigation, navigation, navigation, navigation」으로 읽었다(`aria-label` 넷)
 *    ② 베타 흡수체 표의 가로 스크롤 영역이 키보드로 못 들어갔다(`tabIndex=0`+`role=region`).
 *
 *  ★ 재는 것 — 쪽 × 2뷰포트에 axe-core(WCAG 2.0/2.1 A·AA + best-practice)를 넣고
 *    ① **critical·serious 위반 0** — 하나라도 있으면 빨갛다(규칙 · 노드 수 · 쪽 · 예시 선택자)
 *    ② moderate·minor 는 **세어서 찍기만 한다** — 늘 빨간 게이트는 없는 게이트다
 *    ③ **다크 테마**도 잰다(쪽 셋) — 색 대비는 테마마다 다른 값이고 라이트만 보면 절반이다.
 *  ★ 쪽은 **핵종 낱장을 빼고 전수**(22쪽) + 낱장 **표본 셋**(첫·가운데·끝 — 148장은 한 틀에서
 *    나오므로 틀의 결함은 어느 한 장에나 있다; 전수는 296회라 게이트가 10분이 된다) + **404 쪽**
 *    (산출 루트의 `404.html` — Vercel 이 실제로 내주는 그 파일).
 *  ★ 못 보는 것 — axe 가 못 재는 것: 글의 뜻 · 포커스 순서가 **말이 되는지** · 그림 `alt` 가
 *    **맞는지**(있는지만 본다) · 로그인한 화면(세션 없음) · 낱장 표본 밖의 145장.
 *
 *  역테스트 둘(2026-10-03) — ① `global.css` 의 `--c-accent` 를 `168 94 4` 로 되돌리면
 *  `color-contrast [serious]` 로 걸린다 ② `Base.astro` 의 `<nav aria-label>` 하나를 지우면
 *  `landmark-unique [moderate]` 로 **참고에만** 찍힌다(빨갛지 않다 — 그것이 설계다). */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const DIST = "dist";              // ★ 산출 트리가 곧 URL 공간이다 — `/calc/…` 는 `dist/calc/…`
const BASE = "/calc";
const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png",
               ".ico": "image/x-icon", ".woff2": "font/woff2", ".jpg": "image/jpeg",
               ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain" };
/* 플랫폼 층(우산)이 내주는 파일 — check-render 와 같은 판단으로 **흉내 낸다** */
const PLATFORM_ROOT = { "/track.js": ["text/javascript", "/* platform layer stub */"] };

const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (PLATFORM_ROOT[p]) { r.writeHead(200, { "content-type": PLATFORM_ROOT[p][0] }); return r.end(PLATFORM_ROOT[p][1]); }
  let f = join(DIST, p);
  if (p.endsWith("/")) f = join(f, "index.html");
  else if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const ORIGIN = `http://127.0.0.1:${srv.address().port}`;

/* ───────── 쪽 목록 — 산출물에서 뽑는다(손으로 적으면 새 쪽이 빠지는 것이 기본값이 된다) ───────── */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const all = walk(join(DIST, "calc")).filter((f) => f.endsWith("index.html"))
  .map((f) => BASE + "/" + relative(join(DIST, "calc"), f).replace(/index\.html$/, "").replace(/\\/g, "/"))
  .sort();
const nuclides = all.filter((p) => /^\/calc\/nuclides\/[^/]+\/$/.test(p));
const sample = nuclides.length ? [nuclides[0], nuclides[Math.floor(nuclides.length / 2)], nuclides[nuclides.length - 1]] : [];
const PAGES = [...all.filter((p) => !nuclides.includes(p)), ...sample];
if (!existsSync(join(DIST, "404.html"))) { console.error("❌ dist/404.html 이 없다 — `npm run build` 가 copy-404 까지 돌아야 한다"); process.exit(1); }
PAGES.push("/404.html");
/* 다크 테마는 쪽 셋 — 홈·도구 하나·읽을 글 하나(강조색·표·눈썹이 다 있는 자리) */
const DARK_PAGES = ["/calc/", "/calc/beta/", "/calc/methods/"];

const browser = await chromium.launch(LAUNCH);
const bad = new Map();   // rule → { impact, help, nodes, pages:Set, example }
const soft = new Map();
let runs = 0;

const audit = async (ctx, path, tag) => {
  const pg = await ctx.newPage();
  await pg.goto(ORIGIN + path, { waitUntil: "load" });
  await pg.waitForTimeout(400);
  await pg.addScriptTag({ content: AXE });
  const found = await pg.evaluate(async (tags) => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags } });
    return r.violations.map((v) => ({
      id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
      example: (v.nodes[0]?.target || []).join(" ") + " — " + (v.nodes[0]?.any?.[0]?.message || v.nodes[0]?.all?.[0]?.message || "").slice(0, 200),
    }));
  }, TAGS);
  runs += 1;
  for (const v of found) {
    const bucket = v.impact === "critical" || v.impact === "serious" ? bad : soft;
    const e = bucket.get(v.id) || { impact: v.impact, help: v.help, nodes: 0, pages: new Set(), example: `${tag} ${path} ${v.example}` };
    e.nodes += v.nodes; e.pages.add(`${tag} ${path}`); bucket.set(v.id, e);
  }
  await pg.close();
};

for (const [vp, width, height] of [["데스크톱", 1280, 900], ["모바일", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  for (const p of PAGES) await audit(ctx, p, vp);
  await ctx.close();
}
/* ★ 테마는 `Base.astro` 의 부팅 스크립트가 **그리기 전에** localStorage 에서 읽는다 —
 *   그 칸을 미리 채우면 첫 그림부터 다크다(토글을 누르는 것보다 배포 구조에 가깝다). */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem("radmeter-v2-theme", JSON.stringify({ state: { mode: "dark", resolved: "dark" }, version: 0 })));
  for (const p of DARK_PAGES) {
    const pg = await ctx.newPage();
    await pg.goto(ORIGIN + p, { waitUntil: "load" });
    const theme = await pg.evaluate(() => document.documentElement.dataset.theme);
    await pg.close();
    if (theme !== "dark") { console.error(`❌ ${p}: 다크 테마가 안 켜졌다(data-theme=${theme ?? "없음"}) — 부팅 스크립트나 저장 키가 바뀌었는가`); process.exit(1); }
    await audit(ctx, p, "다크");
  }
  await ctx.close();
}
await browser.close();
srv.close();

const line = ([id, e]) => `${id} [${e.impact}] — ${e.help} · 노드 ${e.nodes} · 쪽 ${e.pages.size} · 예 ${e.example}`;
if (bad.size) {
  console.error(`❌ 접근성 — critical·serious 위반 ${bad.size}규칙 (${runs}회 실측)\n`);
  for (const r of bad) console.error("  · " + line(r));
  process.exit(1);
}
console.log(`✅ 접근성 통과 — 쪽 ${PAGES.length}(낱장 표본 ${sample.length} · 404 포함) × 2뷰포트 + 다크 ${DARK_PAGES.length}쪽 = ${runs}회 · critical·serious 0 · axe-core WCAG 2.x A/AA + best-practice`);
for (const r of soft) console.log("   참고(moderate·minor): " + line(r));
console.log(`   낱장 표본: ${sample.join(" · ")}`);
console.log(`   안 본 것: 낱장 ${Math.max(nuclides.length - sample.length, 0)}장 · 로그인한 화면 · 글의 뜻·포커스 순서·alt 의 맞음`);
