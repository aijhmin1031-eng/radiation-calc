/** 조판·동작 실측 — Chromium 으로 잰다.
 *  ★ 이 레포들이 밟은 함정이 전부 「빌드는 통과하는」 종류였다. 속성이 아니라
 *    getComputedStyle·getBoundingClientRect 로 재고, 계산이 실제로 도는지까지 본다. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const DIST = "dist/calc";
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml" };
const fail = [];
const note = (s) => console.log("   " + s);

// ★ 서버가 base 를 떼어 파일을 찾는다 — 브라우저가 보는 주소는 /calc/… 그대로다
const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p.startsWith("/calc")) p = p.slice(5) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
await new Promise((r) => srv.listen(4321, r));

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const paths = walk(DIST).filter((f) => f.endsWith(".html"))
  .map((f) => "/" + relative(DIST, f).replace(/index\.html$/, "").replace(/\\/g, "/"));

// ★ CI 는 `npx playwright install` 로 받은 것을 쓰고, 로컬 컨테이너는 이미 있는 것을 가리킨다.
//   판이 어긋나면 "Executable doesn't exist" 로 죽으므로 경로를 열어 둔다.
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// ★ 두 뷰포트를 돈다 — 데스크톱만 돌면 모바일 전용 UI 가 통째로 시야 밖이다
for (const vp of [{ w: 1280, h: 900, tag: "데스크톱" }, { w: 390, h: 844, tag: "모바일" }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  console.log(`\n── ${vp.tag} ${vp.w}×${vp.h} ──`);
  for (const p of paths) {
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("pageerror", (e) => errs.push(String(e)));
    pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    await pg.goto(`http://localhost:4321/calc${p}`, { waitUntil: "networkidle" });
    await pg.waitForTimeout(500);
    const m = await pg.evaluate(() => {
      const leaves = [...document.querySelectorAll("*")].filter((e) => !e.children.length && e.textContent?.trim());
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        // ★ 스크롤 컨테이너 안의 넘침은 문서를 안 넘치므로 조용하다 — 따로 잰다
        scrollers: [...document.querySelectorAll("*")]
          .filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowX))
          .map((e) => e.scrollWidth - e.clientWidth).filter((x) => x > 1).length,
        // ★★ `overflow: hidden` 은 **스크롤바도 없이 잘라낸다** — 문서도 안 넘치고
        //   스크롤 컨테이너도 아니라서 위 두 검사가 **둘 다 못 본다**(역테스트로 잡았다).
        //   실제로 /beta/ 의 표가 모바일에서 29px 잘려 셋째 열이 사라지고 있었다.
        clipped: [...document.querySelectorAll("*")]
          .filter((e) => {
            const s = getComputedStyle(e);
            if (!/hidden|clip/.test(s.overflowX)) return false;
            // ★ sr-only 는 **일부러** 1px 로 숨긴 접근성 패턴이다 — 거짓 양성이 되면
            //   게이트가 늘 빨개져 아무도 안 본다. 보이지 않는 크기는 세지 않는다.
            if (e.clientWidth <= 1 || e.clientHeight <= 1) return false;
            return e.scrollWidth - e.clientWidth > 1;
          })
          .map((e) => `${e.tagName.toLowerCase()}.${(e.className || "").toString().slice(0, 24)}(${e.scrollWidth - e.clientWidth}px)`),
        // ★★ 글자색이 배경색과 같아지는 사고가 실제로 라이브까지 나갔다(RadiMeter, 30건).
        //   ★ 그런데 글자 요소의 backgroundColor 는 보통 **투명**이다 — 자기 자신과 비교하면
        //     검사가 거의 절대 성립하지 않고 **죽은 채로 통과한다**(역테스트로 잡았다 2026-09-14).
        //     조상을 거슬러 **실제로 칠해진 색**을 찾아 비교해야 한다.
        invisible: (() => {
          const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
          const painted = (el) => {
            for (let n = el; n; n = n.parentElement) {
              const c = rgb(getComputedStyle(n).backgroundColor);
              if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3);
            }
            return [255, 255, 255];
          };
          // 완전히 같을 때만이 아니라 **읽을 수 없을 만큼 가까울 때**를 센다
          const near = (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]) < 24;
          return leaves.filter((e) => {
            const st = getComputedStyle(e), r = e.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (st.visibility === "hidden" || Number(st.opacity) < 0.1) return false;
            const fg = rgb(st.color);
            if (fg[3] !== undefined && fg[3] < 0.5) return true;   // 글자가 거의 투명하다
            return near(fg.slice(0, 3), painted(e));
          }).map((e) => `${e.tagName.toLowerCase()}.${e.className || ""}`.slice(0, 40));
        })(),
        ko: leaves.filter((e) => /[가-힣]/.test(e.textContent)).length,
      };
    });
    if (m.overflow > 0) fail.push(`${vp.tag} ${p}: 문서가 가로로 ${m.overflow}px 넘친다`);
    // 좁은 화면에서 표·내비가 가로로 스크롤하는 것은 설계된 동작이다 — 데스크톱만 결함으로 센다
    if (vp.w >= 1280 && m.scrollers > 0) fail.push(`${vp.tag} ${p}: 스크롤 컨테이너 ${m.scrollers}곳이 넘친다`);
    if (m.clipped.length > 0)
      fail.push(`${vp.tag} ${p}: 스크롤바 없이 잘린 곳 ${m.clipped.length} — ${m.clipped.slice(0, 2).join(" · ")}`);
    if (m.invisible.length > 0)
      fail.push(`${vp.tag} ${p}: 안 보이는 글자 ${m.invisible.length}곳 — ${[...new Set(m.invisible)].slice(0, 3).join(" · ")}`);
    if (m.ko > 0) fail.push(`${vp.tag} ${p}: 그려진 글자에 한국어 ${m.ko}곳`);
    if (errs.length) fail.push(`${vp.tag} ${p}: JS 오류 — ${errs[0].slice(0, 90)}`);
    note(`${p.padEnd(22)} 넘침 ${m.overflow} · 스크롤넘침 ${m.scrollers} · 잘림 ${m.clipped.length} · 안보임 ${m.invisible.length} · 한국어 ${m.ko} · 오류 ${errs.length}`);
    await pg.close();
  }
  await ctx.close();
}

/* ★★ 「열었다」는 신호를 만들지 말고 「무엇이 열렸는지」를 세라.
   화면이 뜬 것만으로는 계산이 도는지 알 수 없다 — 값을 넣고 답을 읽는다. */
console.log("\n── 계산이 실제로 도는가 (골든 벡터) ──");
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
const pg = await ctx.newPage();
const CASES = [
  { path: "/gamma-shielding/",
    state: { nuclide: "Co-60", act: 37, actU: "GBq", dist: 1, distU: "m", thick: 0,
             shieldMode: "none", delta: 20, rateU: "mGy/h", mode: "dose" },
    want: 11.31, tol: 2, what: "Co-60 1 Ci @1 m = 11.31 mGy/h" },
  { path: "/decay/",
    state: { mode: "remaining", nuclide: "Cs-137", a0: 100, unit: "GBq", t: 30.08, tu: "y" },
    want: 50, tol: 1, what: "Cs-137 1 반감기 뒤 50%" },
  { path: "/beta/",
    state: { mode: "shield", nuclide: "Y-90", absorber: "acrylic", thick: 2 },
    want: 9.198, tol: 2, what: "Y-90 아크릴 비정 9.2 mm" },
];
for (const c of CASES) {
  const s = Buffer.from(JSON.stringify(c.state), "utf8").toString("base64");
  await pg.goto(`http://localhost:4321/calc${c.path}?s=${encodeURIComponent(s)}`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(600);
  const txt = await pg.evaluate(() => document.querySelector("p.flex .num")?.textContent?.trim() ?? "");
  const got = Number(txt.replace(/,/g, "").replace(/×10.*/, ""));
  const off = Math.abs(got - c.want) / c.want * 100;
  if (!Number.isFinite(got) || off > c.tol)
    fail.push(`${c.what}: 화면이 ${txt || "(빈 값)"} 을 보인다`);
  note(`${c.what.padEnd(34)} 화면값 ${txt} (${off.toFixed(2)}%)`);
}

/* ★ 조건 복원이 못 믿을 주소에서도 무너지지 않는가 */
console.log("\n── 못 믿을 주소 ──");
for (const bad of ["?s=%%%notbase64%%%", `?s=${Buffer.from('{"nuclide":123,"act":"x"}').toString("base64")}`, "?s="]) {
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  await pg.goto(`http://localhost:4321/calc/gamma-shielding/${bad}`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(400);
  const txt = await pg.evaluate(() => document.querySelector("p.flex .num")?.textContent?.trim() ?? "");
  if (!txt || errs.length) fail.push(`못 믿을 주소 ${bad.slice(0, 24)}: 답이 ${txt || "없다"} · 오류 ${errs.length}`);
  note(`${bad.slice(0, 30).padEnd(32)} → ${txt} · 오류 ${errs.length}`);
  pg.removeAllListeners("pageerror");
}

await browser.close(); srv.close();
console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
                        : "\n✅ 조판·동작 실측 통과");
process.exit(fail.length ? 1 : 0);
