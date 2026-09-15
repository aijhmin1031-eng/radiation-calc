/** 압축 고정 바 실측 — **스크롤한 뒤에만 존재하는 것**은 따로 재야 한다.
 *  다른 게이트는 전부 스크롤 0 에서만 재므로 이 동작은 통째로 시야 밖이다.
 *  잰다 — ① 스크롤 0 에서 숨어 있는가(탭 순서에도 없는가) ② 흐름에서 자리를 안 먹는가
 *  ③ 지나친 뒤 뜨는가(높이·불투명·맨 위) ④ 칸이 실제로 눌리는가 ⑤ 앵커가 바에 안 가리는가
 *  ⑥ JS 없이 아무 일도 안 일어나는가 ⑦ 좁은 화면에서 한 줄인가. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const DIST = "dist/calc";
const BAR_MIN = 40, BAR_MAX = 52;
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml" };
const fail = [];
const note = (s) => console.log("   " + s);

const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p.startsWith("/calc")) p = p.slice(5) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));           // 빈 포트 — 고정 포트는 EADDRINUSE 로 죽는다
const PORT = srv.address().port;
const url = (p) => `http://localhost:${PORT}/calc${p}`;

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const paths = walk(DIST).filter((f) => f.endsWith(".html"))
  .map((f) => "/" + relative(DIST, f).replace(/index\.html$/, "").replace(/\\/g, "/"));

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

for (const vp of [{ w: 1280, h: 900, tag: "데스크톱" }, { w: 360, h: 780, tag: "모바일" }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  console.log(`\n── ${vp.tag} ${vp.w}×${vp.h} ──`);
  for (const p of paths) {
    const pg = await ctx.newPage();
    await pg.goto(url(p), { waitUntil: "networkidle" });

    // ① 도착했을 때 — 숨어 있고, 흐름에서 자리를 안 먹는다
    const at0 = await pg.evaluate(() => {
      const b = document.getElementById("topbar");
      if (!b) return null;
      const s = getComputedStyle(b);
      return {
        vis: s.visibility, pos: s.position, on: b.dataset.on,
        top: b.getBoundingClientRect().top,
        linkVis: [...b.querySelectorAll("a")].map((a) => getComputedStyle(a).visibility),
        headerTop: document.querySelector("header").getBoundingClientRect().top,
        mainTop: document.getElementById("main").getBoundingClientRect().top,
        sp: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
      };
    });
    if (!at0) { fail.push(`${vp.tag} ${p}: 바가 없다`); await pg.close(); continue; }
    if (at0.vis !== "hidden") fail.push(`${vp.tag} ${p}: 스크롤 0 에서 바가 보인다(${at0.vis})`);
    if (at0.pos !== "fixed") fail.push(`${vp.tag} ${p}: 바가 fixed 가 아니다(${at0.pos}) — 흐름에서 자리를 먹는다`);
    if (at0.headerTop !== 0) fail.push(`${vp.tag} ${p}: 머리글이 ${at0.headerTop}px 밀렸다 — 바가 흐름을 먹었다`);
    if (at0.linkVis.some((v) => v !== "hidden")) fail.push(`${vp.tag} ${p}: 숨은 바의 링크가 탭 순서에 남아 있다`);

    // ③ 지나친 뒤 — 뜬다. 높이·맨 위·불투명 바탕을 잰다
    // ★ 쪽이 짧으면 머리글을 지나칠 수가 없다(/saved/ 데스크톱). 그때 바가 안 뜨는 것은
    //   결함이 아니라 설계대로다 — **실제로 지나쳤는지 재고** 아니면 건너뛴다.
    const passed = await pg.evaluate(async () => {
      // ★ 쪽 **맨 아래**에서 재지 말 것 — 붙박이는 자기 격자 칸이 끝나면 위로 밀려나는 것이
      //   정상이라, 거기서 재면 「바가 덮었다」로 잘못 읽힌다(역테스트 없이 7건이 헛돌았다).
      //   머리글은 지나치고 붙박이는 붙어 있는 **중간**에서 잰다.
      window.scrollTo(0, 400);
      await new Promise((r) => setTimeout(r, 300));
      return document.getElementById("hdr-sentinel").getBoundingClientRect().bottom <= 0;
    });
    if (!passed) { note(`${p} — 쪽이 짧아 머리글을 지나칠 수 없다(바 대상 아님)`); await pg.close(); continue; }
    await pg.waitForTimeout(150);
    const on = await pg.evaluate(() => {
      const b = document.getElementById("topbar");
      const r = b.getBoundingClientRect(), s = getComputedStyle(b);
      const inner = b.firstElementChild.getBoundingClientRect();
      const links = [...b.querySelectorAll("a")].map((a) => {
        const q = a.getBoundingClientRect();
        const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
        return { text: (a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 14),
                 w: Math.round(q.width), h: Math.round(q.height), hit: !!(hit && a.contains(hit)) };
      });
      // 한 줄인가 — 절대 픽셀이 아니라 **중심선이 하나인가**로 잰다(글꼴 지표·표적 높이에
      // 안 흔들린다. 위/아래 좌표로 재면 26px 마크와 24px 칸이 늘 두 줄로 보인다).
      const mid = r.top + r.height / 2;
      const off = [...b.querySelectorAll("a,span")]
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => { const q = e.getBoundingClientRect(); return Math.abs(q.top + q.height / 2 - mid); });
      const rows = off.every((d) => d <= 4) ? 1 : 2;
      // ★★ 바는 **다른 붙박이(sticky)를 덮는다**. 실제로 레일 제목이 18px 가려져 있었고
      //   레일은 제대로 붙어 있었으므로 「안 붙는다」로는 안 보였다 — 가린 것은 바다.
      //   붙박이가 멈추는 자리는 반드시 **바 아래**여야 한다.
      // ★★ **`top` 이 auto 인 붙박이는 붙지 않는다** — 그런데 「덮였다」 검사에는
      //   안 걸린다(아예 화면 밖으로 흘러가므로). Tailwind 임의값 안의 calc 는
      //   공백을 `_` 로 써야 하고, 안 쓰면 CSS 가 통째로 무효가 되는데 **빌드는 통과한다.**
      const loose = [...document.querySelectorAll("*")]
        .filter((e) => getComputedStyle(e).position === "sticky" && getComputedStyle(e).top === "auto")
        .map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute("aria-label") || e.className.toString().slice(0, 18)}]`);
      const under = [...document.querySelectorAll("*")]
        .filter((e) => getComputedStyle(e).position === "sticky")
        .map((e) => ({ e, q: e.getBoundingClientRect() }))
        .filter(({ q }) => q.height > 0 && q.top < r.bottom - 1 && q.bottom > r.top)
        .map(({ e, q }) => `${e.tagName.toLowerCase()}[${e.getAttribute("aria-label") || e.className.toString().slice(0, 18)}] ${Math.round(r.bottom - q.top)}px 가림`);
      return { loose, under, vis: s.visibility, top: Math.round(r.top), h: Math.round(r.height),
               bg: s.backgroundColor, z: s.zIndex, links, rows, maxOff: Math.round(Math.max(...off)),
               overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
               innerH: Math.round(inner.height) };
    });
    if (on.vis !== "visible") fail.push(`${vp.tag} ${p}: 지나쳤는데 바가 안 뜬다`);
    if (on.top !== 0) fail.push(`${vp.tag} ${p}: 바가 맨 위가 아니다(top ${on.top})`);
    if (on.h < BAR_MIN || on.h > BAR_MAX) fail.push(`${vp.tag} ${p}: 바 높이 ${on.h}px (예산 ${BAR_MIN}–${BAR_MAX})`);
    if (/rgba\(.*,\s*0?\.\d+\)/.test(on.bg)) fail.push(`${vp.tag} ${p}: 바 바탕이 반투명(${on.bg}) — 본문이 비친다`);
    if (!(Number(on.z) >= 10)) fail.push(`${vp.tag} ${p}: 바 z-index ${on.z} — 본문에 가린다`);
    if (on.overflow > 1) fail.push(`${vp.tag} ${p}: 바가 뜬 뒤 가로 넘침 ${on.overflow}px`);
    if (on.rows !== 1) fail.push(`${vp.tag} ${p}: 바 내용이 ${on.rows} 줄 — 한 줄이어야 한다`);
    for (const u of on.under) fail.push(`${vp.tag} ${p}: 바가 붙박이를 덮는다 — ${u}`);
    for (const l of on.loose) fail.push(`${vp.tag} ${p}: 붙박이인데 top 이 auto 다(안 붙는다) — ${l}`);
    // ④ 칸이 실제로 눌리는가 + 손가락 표적 24px
    for (const l of on.links) {
      if (!l.hit) fail.push(`${vp.tag} ${p}: 바의 「${l.text}」 가 무언가에 덮여 안 눌린다`);
      if (l.h < 24) fail.push(`${vp.tag} ${p}: 바의 「${l.text}」 표적 높이 ${l.h}px < 24`);
    }

    // ⑤ 앵커가 바에 안 가리는가 — scroll-padding-top 이 없으면 **정확히 바 높이만큼** 가린다
    if (at0.sp < on.h) fail.push(`${vp.tag} ${p}: scroll-padding-top ${at0.sp}px < 바 ${on.h}px — 앵커가 가린다`);
    const anchored = await pg.evaluate(() => {
      const t = document.querySelector("main [id]");
      if (!t) return null;
      location.hash = "#" + t.id;
      return new Promise((res) => setTimeout(() =>
        res({ id: t.id, top: Math.round(t.getBoundingClientRect().top) }), 250));
    });
    if (anchored && anchored.top < on.h)
      fail.push(`${vp.tag} ${p}: 앵커 #${anchored.id} 가 바 아래 ${anchored.top}px — 가린다`);

    if (p === "/" || p === "/gamma-shielding/")
      note(`${p} 바 ${on.h}px · 덮은 붙박이 ${on.under.length} · 칸 ${on.links.length} · 중심선 어긋남 ${on.maxOff}px · scroll-padding ${at0.sp}px` +
           (anchored ? ` · 앵커 #${anchored.id} top ${anchored.top}px`
                     : " · 앵커 대상 없음(쪽 안 앵커가 생기면 그때부터 잰다)"));
    await pg.close();
  }
  await ctx.close();
}

// ⑥ JS 가 없으면 아무 일도 일어나지 않는다 — 회귀 0
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const pg = await ctx.newPage();
  await pg.goto(url("/gamma-shielding/"), { waitUntil: "load" });
  await pg.evaluate(() => window.scrollTo(0, 600)).catch(() => {});
  const r = await pg.$eval("#topbar", (b) => ({ vis: getComputedStyle(b).visibility, on: b.dataset.on }));
  if (r.vis !== "hidden") fail.push(`JS 없음: 바가 보인다(${r.vis}) — 회귀가 생긴다`);
  // ★ 머리글의 화면 좌표가 아니라 **배치 방식**을 본다 — 스크롤하면 좌표는 당연히 음수다
  const hp = await pg.$eval("header", (h) => getComputedStyle(h).position);
  if (hp !== "static") fail.push(`JS 없음: 머리글 position ${hp} — 흐름에서 벗어났다`);
  note(`JS 없음 — 바 ${r.vis} · 머리글 position ${hp} (회귀 0)`);
  await ctx.close();
}

await browser.close();
srv.close();
console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((f) => "   " + f).join("\n")
                        : "\n✅ 압축 고정 바 — 전 페이지 × 두 뷰포트 통과");
process.exit(fail.length ? 1 : 0);
