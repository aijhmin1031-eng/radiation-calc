/** 머리글 브랜드 검사 — **한 줄 머리글**(2026-10-06 ⑥, 명세 `C:\dev\rl\HEADER-SPEC.md` §1·§2·§7).
 *
 *  ★★ 계기 — 소유주 「상단에 놓아두는 2가지 영역이 다르네… 하나의 계산기 안에 다양한 도구가 들어있는 형태로」.
 *    그전 판(2026-10-06 ③)은 두 막대(플랫폼 칸 셋 + lab 막대 `RadCalc`)를 쟀다. 이제 묻는 것:
 *    ① 머리글 막대가 **하나**다(`[data-site-header]` 1개, 옛 `[data-platform-bar]`·`[data-lab-bar]` 0개)
 *    ② 브랜드 = 팔각 마크 + `Radiation Lab` → apex 홈(절대 주소), 마크가 배경에 묻히지 않는다
 *    ③ 화면에 보이는 이름은 `Radiation Lab` 하나 — 머리글에 `RadCalc` 글자가 없다(명세 §7)
 *    ④ 모바일 머리글 높이 예산 — 두 줄(브랜드·컨트롤 / 칸)이 실측 약 90px. 줄이 하나 더 감기면(+33px) 걸린다.
 *  환경변수로 열어 두었다(다른 lab 이 같은 파일로 자기 산출물을 잴 수 있게). */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = process.env.LOCKUP_DIST || "dist/calc";
const BASE = process.env.LOCKUP_BASE ?? "/calc";
const PATHS = (process.env.LOCKUP_PATHS || "/gamma-shielding/,/methods/,/nuclides/").split(",");
const UMBRELLA = process.env.LOCKUP_UMBRELLA || "https://radiation-lab.com/";
const MOBILE_BUDGET = Number(process.env.LOCKUP_MOBILE_BUDGET || 110);

const ORIGIN = process.env.LOCKUP_ORIGIN;
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
if (!ORIGIN) await new Promise((r) => srv.listen(4322, r));
const ROOT_URL = ORIGIN || "http://localhost:4322";

const fail = [];
const browser = await chromium.launch(LAUNCH);
for (const theme of ["light", "dark"]) {
  for (const [w, h, tag] of [[1280, 900, "데스크톱"], [390, 844, "모바일"]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
    await ctx.route("**/track.js", (r) => r.fulfill({ status: 204, body: "" }));
    for (const p of PATHS) {
      const pg = await ctx.newPage();
      await pg.goto(`${ROOT_URL}${BASE}${p}`, { waitUntil: "networkidle" });
      await pg.waitForTimeout(300);
      const m = await pg.evaluate(() => {
        const heads = document.querySelectorAll("[data-site-header]");
        const head = heads[0] || document.querySelector("header") || document.body;
        const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
        const painted = (el) => { for (let n = el; n; n = n.parentElement) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3); }
          return [255, 255, 255]; };
        const brand = [...head.querySelectorAll("a")].find((a) => /Radiation Lab/.test(a.textContent) && !a.closest("nav"));
        const svg = brand?.querySelector("svg polygon");
        const markEl = svg?.closest("svg");
        let contrast = null;
        if (markEl) { const c = rgb(getComputedStyle(markEl).color).slice(0, 3), b = painted(markEl);
          contrast = Math.abs(c[0]-b[0]) + Math.abs(c[1]-b[1]) + Math.abs(c[2]-b[2]); }
        return {
          막대수: heads.length,
          옛막대: document.querySelectorAll("[data-platform-bar],[data-lab-bar]").length,
          꼭짓점: svg?.getAttribute("points")?.trim().split(/\s+/).length ?? 0,
          브랜드링크: brand ? brand.getAttribute("href") : null,
          브랜드글자: brand ? brand.textContent.replace(/\s+/g, " ").trim() : null,
          옛이름: /RadCalc/.test(head.innerText),
          대비: contrast,
          높이: Math.round(head.getBoundingClientRect().height),
        };
      });
      const at = `${theme}/${tag} ${p}`;
      if (m.막대수 !== 1) fail.push(`${at}: 머리글 막대([data-site-header])가 ${m.막대수}개 — 하나여야 한다`);
      if (m.옛막대) fail.push(`${at}: 옛 두 막대([data-platform-bar]/[data-lab-bar])가 ${m.옛막대}개 남았다`);
      if (m.꼭짓점 !== 8) fail.push(`${at}: 마크가 팔각형이 아니다 (꼭짓점 ${m.꼭짓점})`);
      if (m.브랜드링크 !== UMBRELLA) fail.push(`${at}: 브랜드가 ${UMBRELLA} 로 가지 않는다 — ${m.브랜드링크}`);
      if (m.브랜드글자 !== "Radiation Lab") fail.push(`${at}: 브랜드 글자 「${m.브랜드글자}」 — 「Radiation Lab」 이어야 한다`);
      if (m.옛이름) fail.push(`${at}: 머리글에 「RadCalc」 글자가 보인다(명세 §7)`);
      if (m.대비 != null && m.대비 < 60) fail.push(`${at}: 마크가 배경에 묻힌다 (대비 ${m.대비})`);
      if (tag === "모바일" && m.높이 > MOBILE_BUDGET) fail.push(`${at}: 모바일 머리글 ${m.높이}px — 예산 ${MOBILE_BUDGET}`);
      if (p === PATHS[0]) console.log(`  ${at.padEnd(28)} 막대 ${m.막대수} · 꼭짓점 ${m.꼭짓점} · 브랜드 ${m.브랜드링크} · 대비 ${m.대비} · 높이 ${m.높이}px`);
      await pg.close();
    }
    await ctx.close();
  }
}
await browser.close(); if (!ORIGIN) srv.close();
console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
                        : `\n✅ 머리글 브랜드 통과 — 막대 하나 · Radiation Lab → apex · 2테마 × 2뷰포트 × ${PATHS.length}쪽`);
process.exit(fail.length ? 1 : 0);
