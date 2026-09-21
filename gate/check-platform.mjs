/** 플랫폼 껍데기 정본 실측 — **머리글이 lab 마다 다르지 않은가.**
 *
 *  계기(2026-09-16 소유주 지적 「radcalc 과 radimeter lab 화면 배경색 구성이 다르네 …
 *  상단메뉴는 동일한 배경, 폰트, 크기를 사용하면 좋겠어」). 실측해 보니 원인이 색이 아니라
 *  **토큰 이름이 lab 마다 한 칸씩 다른 것**이었다 — 우산·RadiMeter 는 `paper`=본문 ·
 *  `surface`=카드 · `panel`=머리글인데, RadCalc 에는 `paper` 가 없어 `surface` 가 본문을
 *  맡고 있었다. 그래서 **같은 값 241,242,238 이 한쪽에서는 본문보다 밝고 다른 쪽에서는
 *  어두웠다**(채널합차 +25 대 −31 — 방향이 반대였다).
 *
 *  ★ 다른 게이트가 구조적으로 못 보는 것 — 기존 검사는 전부 **한 lab 안에서** 잰다.
 *    「머리글이 본문과 갈리는가」(대비 18 이상)는 세 lab 이 다 통과하고 있었다.
 *    갈리기는 갈리는데 **서로 다른 방향으로** 갈렸기 때문이다. 그래서 이 게이트는
 *    상대값이 아니라 **절대값**을 잰다 — 정본에서 한 채널이라도 벗어나면 빨개진다.
 *  ★ 값을 여기 적어 두는 것이 요점이다. 세 레포가 각자 빌드하므로 공유 모듈을 둘 수 없고,
 *    그래서 **같은 숫자를 세 곳에 적고 셋이 함께 지킨다.** 정본을 옮길 때는 세 곳이다.
 *  ★ 칸(탭)이 없는 층은 칸 검사를 건너뛴다 — 우산에는 구획 탭이 없다(컨트롤뿐이다).
 */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

/* ───────── 플랫폼 정본 (세 레포가 같은 값을 적는다) ───────── */
const SPEC = {
  light: { paper: "rgb(232, 234, 230)", panel: "rgb(241, 242, 238)", line: "rgb(188, 191, 182)",
           idle: "rgb(82, 87, 90)", onBg: "rgb(244, 232, 212)", onInk: "rgb(168, 94, 4)" },
  dark:  { paper: "rgb(18, 21, 23)",   panel: "rgb(32, 37, 42)",   line: "rgb(73, 82, 90)",
           idle: "rgb(169, 176, 181)", onBg: "rgb(58, 46, 26)",    onInk: "rgb(242, 163, 60)" },
};
const TAB = { size: "13px", radius: "4px", padY: "6px", padX: "12px" };
const GUTTER = 148;   // 1280px 에서 글줄이 시작하는 x (우산 1048/32 · RadiMeter 1024/20 · RadCalc 1048/32)

/* ───────── 레포별 설정 ───────── */
const CONFIG = { DIST: "dist/calc", BASE: "/calc", PATHS: ["/", "/methods/", "/decay/"],
                 HAS_TABS: true, LABEL: "RadCalc" };
const { DIST, BASE, PATHS, HAS_TABS, LABEL } = CONFIG;

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png",
               ".ico": "image/x-icon", ".woff2": "font/woff2",
               ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain" };
const fail = [];
const note = (s) => console.log("   " + s);
const eq = (what, got, want) => { if (got !== want) fail.push(`${what}: ${got} (정본 ${want})`); };

const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f) && existsSync(f + "/index.html")) f = join(f, "index.html");
  if (p.endsWith("/")) f = join(DIST, p, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const PORT = srv.address().port;
const browser = await chromium.launch(LAUNCH);

for (const theme of ["light", "dark"]) {
  const S = SPEC[theme];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
  for (const path of PATHS) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}${path}`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => {
      const cs = getComputedStyle;
      const hdr = document.querySelector("header");
      const links = [...hdr.querySelectorAll("nav a")].filter((a) => a.textContent.trim() && a.offsetHeight);
      const on = links.find((a) => a.getAttribute("aria-current"));
      const off = links.find((a) => !a.getAttribute("aria-current"));
      const d = (el) => el && { size: cs(el).fontSize, radius: cs(el).borderTopLeftRadius,
        padY: cs(el).paddingTop, padX: cs(el).paddingLeft, color: cs(el).color, bg: cs(el).backgroundColor };
      /* ★ **글줄 시작은 H1 의 위치가 아니라 콘텐츠 칸의 왼쪽 끝이다.** 처음에 H1 을 쟀다가
         계산기 쪽에서 388px 이 나왔다 — 그 쪽 H1 은 2단 격자의 오른쪽 칸 안에 있다.
         쪽마다 안쪽 배치가 다른 것은 정상이고, **정본이 정하는 것은 칸의 위치**다.
         그래서 머리글 안쪽 상자와 `main` 의 **안여백 안쪽 왼쪽 끝**을 잰다. */
      const edge = (el) => el ? Math.round(el.getBoundingClientRect().left + parseFloat(cs(el).paddingLeft)) : null;
      const inner = hdr.querySelector(":scope > div") ?? hdr.firstElementChild;
      /* ★ 폭을 정하는 상자가 `main` 자신일 때도 있고(RadCalc·RadiMeter) 그 **자식**일 때도
         있다(우산은 `main` 이 전폭이고 `section.wrap` 이 칸을 든다). 「max-width 가 걸린
         첫 상자」로 찾는다 — 마크업 이름이 아니라 **폭을 정하는 자리**를 따라간다. */
      const mainEl = document.querySelector("main");
      const col = !mainEl ? null
        : cs(mainEl).maxWidth !== "none" ? mainEl
        : [...mainEl.querySelectorAll(":scope > *")].find((el) => cs(el).maxWidth !== "none") ?? null;
      const main = col;
      return {
        body: cs(document.body).backgroundColor,
        hdr: cs(hdr).backgroundColor, line: cs(hdr).borderBottomColor,
        on: d(on), off: d(off), tabs: links.length,
        hdrEdge: edge(inner), mainEdge: edge(main),
      };
    });
    const tag = `${theme}/${path}`;
    eq(`${tag} 본문 바탕`, m.body, S.paper);
    eq(`${tag} 머리글 바탕`, m.hdr, S.panel);
    eq(`${tag} 머리글 아래선`, m.line, S.line);
    if (m.hdrEdge !== GUTTER) fail.push(`${tag} 머리글 칸 좌측: ${m.hdrEdge}px (정본 ${GUTTER}px)`);
    if (m.mainEdge !== null && m.mainEdge !== GUTTER) fail.push(`${tag} 본문 칸 좌측: ${m.mainEdge}px (정본 ${GUTTER}px)`);
    if (HAS_TABS) {
      if (!m.off) fail.push(`${tag} 비활성 칸이 없다`);
      else {
        eq(`${tag} 칸 글자크기`, m.off.size, TAB.size);
        eq(`${tag} 칸 모서리`, m.off.radius, TAB.radius);
        eq(`${tag} 칸 세로여백`, m.off.padY, TAB.padY);
        eq(`${tag} 칸 가로여백`, m.off.padX, TAB.padX);
        eq(`${tag} 비활성 칸 글자색`, m.off.color, S.idle);
      }
      if (m.on) {
        eq(`${tag} 활성 칸 바탕`, m.on.bg, S.onBg);
        eq(`${tag} 활성 칸 글자색`, m.on.color, S.onInk);
        eq(`${tag} 활성 칸 글자크기`, m.on.size, TAB.size);
      }
    }
    note(`${tag.padEnd(26)} 본문 ${m.body} · 머리글 ${m.hdr} · 선 ${m.line} · 칸 ${m.tabs}개` +
         (m.off ? ` ${m.off.size}/${m.off.radius}/${m.off.padY} ${m.off.padX}` : "") +
         ` · 칸 좌측 머리글 ${m.hdrEdge}px` + (m.mainEdge !== null ? ` 본문 ${m.mainEdge}px` : ""));
    await page.close();
  }
  await ctx.close();
}
await browser.close(); srv.close();

if (fail.length) { console.log(`\n❌ ${LABEL} — 플랫폼 정본에서 벗어난 값 ${fail.length}건`); fail.forEach((f) => console.log("   " + f)); process.exit(1); }
console.log(`\n✅ ${LABEL} — 플랫폼 껍데기 정본과 일치(본문·머리글·아래선·칸 좌측${HAS_TABS ? " · 칸 치수·활성 표시" : ""}) × 2테마`);
