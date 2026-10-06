/** 플랫폼 잠금장치 검사 — **세 lab 이 똑같이 답해야 하는 다섯 가지**.
 *
 *  ★ 마크업은 레포마다 다르다(Astro · Next · 정적 HTML). 파일을 맞추는 대신
 *    **보이는 결과**를 맞춘다 — 이 레포들의 게이트가 이미 그 층에서 일한다.
 *    이 파일을 세 lab 에 같은 내용으로 두고, 각자 자기 산출물을 잰다.
 *
 *  ★★ 2026-10-06 — 잠금장치(`Lockup`, 위 줄 Radiation Lab · 아래 줄 lab 이름)를 걷고 머리글이
 *    **두 막대**가 됐다(플랫폼 상단 메뉴 통일). 묻는 것은 그대로이고 **답하는 자리만** 옮겼다 —
 *    ① 「우산으로 가는 마크」 → **플랫폼 막대**(`[data-platform-bar]`)의 브랜드(마크 + Radiation Lab → `/`)
 *    ② 「lab 이름 → lab 홈」 → **lab 막대**(`[data-lab-bar]`)의 이름(→ `BASE/`). 그전에는 이름이
 *       머리글 **어딘가에** 있는지만 봤는데, 이제 lab 막대 안에 있는지와 **어디로 가는지**를 잰다.
 *    ③ 이름이 브랜드보다 작고(14 < 16px) 아래(lab 막대가 플랫폼 막대 아래)에 있다 — 층이 읽히는가.
 *    ④ 모바일 머리글 높이 예산 — 두 막대가 되며 숫자가 바뀌었다(아래 `MOBILE_BUDGET`). */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = process.env.LOCKUP_DIST || "dist/calc";
const BASE = process.env.LOCKUP_BASE || "/calc";
const PATHS = (process.env.LOCKUP_PATHS || "/,/gamma-shielding/,/methods/").split(",");
const LAB = process.env.LOCKUP_LAB || "RadCalc";
/** 모바일(390px) 머리글 높이 상한. 그전 150 은 잠금장치 한 막대(실측 106)의 예산이었다.
 *  ★ 2026-10-06 두 막대(플랫폼 + lab)가 되며 실측 **148px**(계정 표시 없는 빌드 · 계정 표시가 있으면
 *    150.5px — 이 게이트는 반올림해 151 로 찍는다)이다. 명세의 상한은 「그전 높이 + 48」= 105.5 + 48 = **153.5px** 이고, 그 안에서 줄이 하나
 *    늘면(+33px) 바로 걸리게 둔다. */
const MOBILE_BUDGET = Number(process.env.LOCKUP_MOBILE_BUDGET || 153);

/** ★ 정적 산출물이 없는 lab(Next 서버 빌드)도 잴 수 있어야 한다 —
 *  LOCKUP_ORIGIN 을 주면 내장 서버를 띄우지 않고 그 주소를 그대로 친다. */
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
    for (const p of PATHS) {
      const pg = await ctx.newPage();
      await pg.goto(`${ROOT_URL}${BASE}${p}`, { waitUntil: "networkidle" });
      await pg.waitForTimeout(350);
      const m = await pg.evaluate((lab) => {
        const head = document.querySelector("header") || document.body;
        /* ★ 두 막대가 없으면(옛 구조) 머리글 전체에서 찾는다 — 그때는 아래 「막대 안에 있는가」가 실패로 센다 */
        const pbar = head.querySelector("[data-platform-bar]");
        const lbar = head.querySelector("[data-lab-bar]");
        const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
        const painted = (el) => { for (let n = el; n; n = n.parentElement) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3); }
          return [255, 255, 255]; };
        const texts = [...(pbar || head).querySelectorAll("a")];
        const umb = texts.find((a) => /^\s*Radiation Lab\s*$/i.test(a.textContent.replace(/\s+/g, " ").trim())
                                   || /Radiation Lab/.test(a.textContent) && a.getAttribute("href") === "/");
        const labA = [...(lbar || head).querySelectorAll("a")].find((a) => a.textContent.replace(/\s+/g, " ").trim() === lab);
        const svg = (umb || head).querySelector("svg polygon");
        const pts = svg?.getAttribute("points")?.trim().split(/\s+/).length ?? 0;
        const markEl = svg?.closest("svg");
        let contrast = null;
        if (markEl) {
          const c = rgb(getComputedStyle(markEl).color).slice(0, 3), b = painted(markEl);
          contrast = Math.abs(c[0]-b[0]) + Math.abs(c[1]-b[1]) + Math.abs(c[2]-b[2]);
        }
        const fs = (el) => el ? parseFloat(getComputedStyle(el).fontSize) : null;
        return {
          마크꼭짓점: pts,
          우산링크: umb ? umb.getAttribute("href") : null,
          우산글자크기: fs(umb?.querySelector("span") ?? umb),
          lab링크: labA ? labA.getAttribute("href") : null,
          lab글자크기: fs(labA),
          마크대비: contrast,
          머리글높이: Math.round(head.getBoundingClientRect().height),
          두막대: !!pbar && !!lbar,
          우산y: umb?.getBoundingClientRect().top, laby: labA?.getBoundingClientRect().top,
        };
      }, LAB);
      const at = `${theme}/${tag} ${p}`;
      if (m.마크꼭짓점 !== 8) fail.push(`${at}: 마크 팔각형이 아니다 (꼭짓점 ${m.마크꼭짓점})`);
      if (m.우산링크 !== "/") fail.push(`${at}: "Radiation Lab" 이 우산(/)으로 가지 않는다 — ${m.우산링크}`);
      if (!m.두막대) fail.push(`${at}: 머리글에 플랫폼 막대([data-platform-bar])·lab 막대([data-lab-bar]) 둘이 다 있지 않다`);
      if (!m.lab링크) fail.push(`${at}: lab 이름 "${LAB}" 이 lab 막대에 없다`);
      else if (m.lab링크 !== `${BASE}/`) fail.push(`${at}: lab 이름 "${LAB}" 이 lab 홈(${BASE}/)으로 가지 않는다 — ${m.lab링크}`);
      if (m.우산글자크기 && m.lab글자크기 && m.lab글자크기 >= m.우산글자크기)
        fail.push(`${at}: lab 이름이 더 작지 않다 (${m.lab글자크기} vs ${m.우산글자크기})`);
      if (m.우산y != null && m.laby != null && m.laby <= m.우산y)
        fail.push(`${at}: lab 이름이 아래에 있지 않다`);
      if (m.마크대비 != null && m.마크대비 < 60)
        fail.push(`${at}: 마크가 배경에 묻힌다 (대비 ${m.마크대비})`);
      if (tag === "모바일" && m.머리글높이 > MOBILE_BUDGET) fail.push(`${at}: 모바일 머리글 ${m.머리글높이}px — 예산 ${MOBILE_BUDGET}`);
      if (p === PATHS[0]) console.log(`  ${at.padEnd(28)} 꼭짓점 ${m.마크꼭짓점} · 우산 ${m.우산링크} · ${LAB} ${m.lab글자크기}px<${m.우산글자크기}px · 대비 ${m.마크대비} · 높이 ${m.머리글높이}px`);
      await pg.close();
    }
    await ctx.close();
  }
}
await browser.close(); if (!ORIGIN) srv.close();
console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
                        : `\n✅ 잠금장치 통과 — ${LAB} · 2테마 × 2뷰포트 × ${PATHS.length}쪽`);
process.exit(fail.length ? 1 : 0);
