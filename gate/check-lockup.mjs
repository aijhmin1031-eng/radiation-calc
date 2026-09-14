/** 플랫폼 잠금장치 검사 — **세 lab 이 똑같이 답해야 하는 다섯 가지**.
 *
 *  ★ 마크업은 레포마다 다르다(Astro · Next · 정적 HTML). 파일을 맞추는 대신
 *    **보이는 결과**를 맞춘다 — 이 레포들의 게이트가 이미 그 층에서 일한다.
 *    이 파일을 세 lab 에 같은 내용으로 두고, 각자 자기 산출물을 잰다. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = process.env.LOCKUP_DIST || "dist/calc";
const BASE = process.env.LOCKUP_BASE || "/calc";
const PATHS = (process.env.LOCKUP_PATHS || "/,/gamma-shielding/,/methods/").split(",");
const LAB = process.env.LOCKUP_LAB || "RadCalc";

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
await new Promise((r) => srv.listen(4322, r));

const fail = [];
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const theme of ["light", "dark"]) {
  for (const [w, h, tag] of [[1280, 900, "데스크톱"], [390, 844, "모바일"]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
    for (const p of PATHS) {
      const pg = await ctx.newPage();
      await pg.goto(`http://localhost:4322${BASE}${p}`, { waitUntil: "networkidle" });
      await pg.waitForTimeout(350);
      const m = await pg.evaluate((lab) => {
        const head = document.querySelector("header") || document.body;
        const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
        const painted = (el) => { for (let n = el; n; n = n.parentElement) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3); }
          return [255, 255, 255]; };
        const texts = [...head.querySelectorAll("a")];
        const umb = texts.find((a) => /^\s*Radiation Lab\s*$/i.test(a.textContent.replace(/\s+/g, " ").trim())
                                   || /Radiation Lab/.test(a.textContent) && a.getAttribute("href") === "/");
        const labA = texts.find((a) => a.textContent.replace(/\s+/g, " ").trim() === lab);
        const svg = head.querySelector("svg polygon");
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
          우산y: umb?.getBoundingClientRect().top, laby: labA?.getBoundingClientRect().top,
        };
      }, LAB);
      const at = `${theme}/${tag} ${p}`;
      if (m.마크꼭짓점 !== 8) fail.push(`${at}: 마크 팔각형이 아니다 (꼭짓점 ${m.마크꼭짓점})`);
      if (m.우산링크 !== "/") fail.push(`${at}: "Radiation Lab" 이 우산(/)으로 가지 않는다 — ${m.우산링크}`);
      if (!m.lab링크) fail.push(`${at}: lab 이름 "${LAB}" 이 머리글에 없다`);
      if (m.우산글자크기 && m.lab글자크기 && m.lab글자크기 >= m.우산글자크기)
        fail.push(`${at}: lab 이름이 더 작지 않다 (${m.lab글자크기} vs ${m.우산글자크기})`);
      if (m.우산y != null && m.laby != null && m.laby <= m.우산y)
        fail.push(`${at}: lab 이름이 아래에 있지 않다`);
      if (m.마크대비 != null && m.마크대비 < 60)
        fail.push(`${at}: 마크가 배경에 묻힌다 (대비 ${m.마크대비})`);
      if (tag === "모바일" && m.머리글높이 > 150) fail.push(`${at}: 모바일 머리글 ${m.머리글높이}px — 예산 150`);
      if (p === PATHS[0]) console.log(`  ${at.padEnd(28)} 꼭짓점 ${m.마크꼭짓점} · 우산 ${m.우산링크} · ${LAB} ${m.lab글자크기}px<${m.우산글자크기}px · 대비 ${m.마크대비} · 높이 ${m.머리글높이}px`);
      await pg.close();
    }
    await ctx.close();
  }
}
await browser.close(); srv.close();
console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
                        : `\n✅ 잠금장치 통과 — ${LAB} · 2테마 × 2뷰포트 × ${PATHS.length}쪽`);
process.exit(fail.length ? 1 : 0);
