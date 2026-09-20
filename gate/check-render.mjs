/** 조판·동작 실측 — Chromium 으로 잰다.
 *  ★ 이 레포들이 밟은 함정이 전부 「빌드는 통과하는」 종류였다. 속성이 아니라
 *    getComputedStyle·getBoundingClientRect 로 재고, 계산이 실제로 도는지까지 본다. */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const DIST = "dist/calc";
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml" };
const fail = [];
const note = (s) => console.log("   " + s);

/** ★★ **플랫폼 층이 내주는 파일을 여기서 흉내 낸다**(2026-09-15, 방문 집계).
 *  `/track.js` 는 **우산 저장소**의 파일이고 이 lab 의 `dist/` 에는 없다 — 라이브에서는
 *  같은 오리진의 우산이 내주므로 200 이지만, 여기 서버는 `dist/calc/` 만 아는지라 404 를 낸다.
 *  그 404 가 **전 쪽에서 「JS 오류」로 세어져 게이트가 통째로 빨개졌다.**
 *  ★ 무시하지 않고 **200 으로 답한다** — 「없는 것을 못 본 척」과 「있는 것을 흉내 냄」은
 *    다르다. 앞엣것은 태그가 사라져도 통과하지만, 뒤엣것은 배포 구조를 그대로 재현한다.
 *  ★ 집계 자체가 맞게 도는지는 **우산 저장소의 게이트**가 잰다(그 파일의 주인이다). */
const PLATFORM_ROOT = { "/track.js": ["text/javascript", "/* platform layer stub */"] };

// ★ 서버가 base 를 떼어 파일을 찾는다 — 브라우저가 보는 주소는 /calc/… 그대로다
const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (PLATFORM_ROOT[p]) {
    const [type, body] = PLATFORM_ROOT[p];
    r.writeHead(200, { "content-type": type });
    return r.end(body);
  }
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

// ★ 크로미움 경로는 `gate/chromium.mjs` 한 곳이 정한다 — 열한 자리가 제각각 적고 있었다.
const browser = await chromium.launch(LAUNCH);
// ★ 두 뷰포트를 돈다 — 데스크톱만 돌면 모바일 전용 UI 가 통째로 시야 밖이다
for (const vp of [{ w: 1280, h: 900, tag: "데스크톱" }, { w: 390, h: 844, tag: "모바일" }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  console.log(`\n── ${vp.tag} ${vp.w}×${vp.h} ──`);
  for (const p of paths) {
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("pageerror", (e) => errs.push(String(e)));
    /** ★★ 「Failed to load resource: … 404」만 적혀 있으면 **무엇이 실패했는지 알 수 없다**
     *  (2026-09-20 에 이틀을 잡아먹었다 — 서버측 404 로그는 0건인데 브라우저는 404 를 본다고
     *  하니 **내 서버로 간 요청이 아니라는 것**조차 메시지만 보고는 알 수 없었다).
     *  ★ 실패한 요청의 **주소와 상태**를 함께 적는다. 게이트가 내는 말은 그것만 보고
     *    다음 손을 정할 수 있어야 한다. */
    pg.on("response", (res) => {
      if (res.status() >= 400) errs.push(`HTTP ${res.status()} ← ${res.url()}`);
    });
    pg.on("requestfailed", (req) => {
      errs.push(`요청 실패 ${req.failure()?.errorText ?? "?"} ← ${req.url()}`);
    });
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
            // ★ 말줄임(…)은 **알리면서 자르는 것**이다 — 잘렸다는 사실이 화면에 보이고
            //   전문(全文)은 DOM 에 남는다. 이 게이트가 잡으려는 것은 **아무 표시 없이**
            //   사라지는 내용이므로, 두 조건(ellipsis + nowrap)을 다 갖춘 것만 뺀다.
            //   한쪽만으로 빼면 그냥 hidden 인 것까지 새 나간다.
            if (s.textOverflow === "ellipsis" && /nowrap/.test(s.whiteSpace)) return false;
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
        /* ★★ **값 하나가 두 줄로 쪼개지면 그것은 표가 아니다**(2026-09-17 소유주가 휴대폰
           화면에서 잡았다 — 「표는 신경써서 만들자. 표 열넓이」). 유효성 평가표의
           `1.85 × 10⁵` 가 `×` 앞뒤 공백 때문에 **세 줄**로 그려지고 있었다.
           ★ 다른 검사가 구조적으로 못 본다 — 문서도 안 넘치고, 스크롤 컨테이너도 안 넘치고,
             잘리지도 않는다. **줄이 늘어날 뿐**이라 조용하다.
           ★ 칸 높이로 재면 안 된다 — 같은 줄의 **다른 칸**이 길면 높이가 함께 커져
             멀쩡한 숫자도 걸린다. `Range` 의 line box 수로 **글자가 몇 줄인지** 센다.
           ★ 두 뷰포트 모두에서 결함이다(가로 스크롤과 달리 설계된 동작일 수가 없다). */
        wrappedNums: (() => {
          const lines = (el) => {
            const r = document.createRange();
            r.selectNodeContents(el);
            return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
          };
          return [...document.querySelectorAll("td.num")]
            .filter((c) => c.textContent.trim() && lines(c) > 1)
            .map((c) => c.textContent.trim().slice(0, 28));
        })(),
        /* ★★ 가로로 스크롤하는 표는 **첫 칸이 고정돼 있어야 한다**. 오른쪽으로 밀면 식별
           칸이 화면 밖으로 나가 그 줄이 무엇인지 알 수 없다(핵종 목록에서 이미 밟았고,
           유효성 평가의 합성·물리·거부 표 셋이 같은 상태로 나갔다). `.pin-first` 가 그 장치다. */
        unpinned: [...document.querySelectorAll("table")]
          .map((t) => t.parentElement)
          .filter((sc) => sc && sc.scrollWidth - sc.clientWidth > 2 && !sc.classList.contains("pin-first"))
          .length,
        /* ★★ **세 칸의 역할이 글로 서 있는가**(2026-09-18 소유주가 화면에서 잡았다 —
           「1단열 제목이 calculators … 제목처럼 보이게 … 오른쪽은 제목이 없네」).
           실측 원인이 둘이었다: ① 칸 제목과 칸 **안**의 소제목이 같은 `.label` 이라 층이
           안 갈렸다 ② 오른쪽 칸에는 **보이는 제목이 아예 없었다**(`aria-label` 만 있었다).
           ★ 세 가지를 센다 —
             ⓐ 붙박이 레일마다 보이는 칸 제목(`.col-head`)이 있는가
                (공유 줄 같은 `aside` 는 붙박이가 아니라 걸리지 않는다)
             ⓑ 칸 제목이 소제목과 **실제로 달라 보이는가**(명도나 무게가 다른가)
             ⓒ 보이는 이름과 **보조기기가 읽는 이름**이 같은가(다르면 둘이 따로 낡는다) */
        rails: (() => {
          const out = { noHead: [], sameAsLabel: [], nameMismatch: [] };
          const rails = [...document.querySelectorAll("main nav, main aside")]
            .filter((r) => getComputedStyle(r).position === "sticky");
          for (const r of rails) {
            const h = r.querySelector(".col-head");
            if (!h) { out.noHead.push(r.getAttribute("aria-label") || r.tagName.toLowerCase()); continue; }
            const aria = r.getAttribute("aria-label");
            if (aria && aria.trim() !== h.textContent.trim())
              out.nameMismatch.push(`${aria} ≠ ${h.textContent.trim()}`);
          }
          const head = document.querySelector("main .col-head");
          const label = document.querySelector("main .label");
          if (head && label) {
            const a = getComputedStyle(head), b = getComputedStyle(label);
            if (a.color === b.color && a.fontWeight === b.fontWeight)
              out.sameAsLabel.push(`${a.color} / ${a.fontWeight}`);
          }
          return out;
        })(),
        /* ★★ **고정 칸이 줄의 표식을 먹지 않는가**(2026-09-17 실측으로 잡았다).
           고정 규칙의 특이도가 유틸리티 배경을 이겨, `/beta/` 에서 **지금 고른 흡수체 줄의
           첫 칸이 다른 줄과 완전히 같은 색**이었다 — 어느 줄을 골랐는지 화면에서 사라졌다.
           ★ 「줄에 바탕색이 있는데 그 줄의 첫 칸은 맨 줄과 같은 색」을 센다. 클래스 이름을
             묻지 않는다 — 이름을 물으면 **표식 클래스를 안 붙인 바로 그 사고**를 못 본다. */
        pinMarkerLost: [...document.querySelectorAll(".pin-first table")].flatMap((t) => {
          const rows = [...t.querySelectorAll("tbody tr")];
          const clear = (el) => getComputedStyle(el).backgroundColor === "rgba(0, 0, 0, 0)";
          const plain = rows.find((r) => clear(r) && r.children[0]);
          if (!plain) return [];
          const plainBg = getComputedStyle(plain.children[0]).backgroundColor;
          return rows
            .filter((r) => !clear(r) && r.children[0] &&
                           getComputedStyle(r.children[0]).backgroundColor === plainBg)
            .map((r) => r.children[0].textContent.trim().slice(0, 20));
        }),
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
    if (m.wrappedNums.length > 0)
      fail.push(`${vp.tag} ${p}: 두 줄로 쪼개진 숫자 ${m.wrappedNums.length}칸 — ${[...new Set(m.wrappedNums)].slice(0, 3).join(" · ")}`);
    if (m.unpinned > 0)
      fail.push(`${vp.tag} ${p}: 가로로 스크롤하는데 첫 칸이 안 고정된 표 ${m.unpinned}개`);
    if (m.rails.noHead.length > 0)
      fail.push(`${vp.tag} ${p}: 제목 없는 붙박이 레일 ${m.rails.noHead.length} — ${m.rails.noHead.join(" · ")}`);
    if (m.rails.sameAsLabel.length > 0)
      fail.push(`${vp.tag} ${p}: 칸 제목이 소제목과 같아 보인다 (${m.rails.sameAsLabel[0]})`);
    if (m.rails.nameMismatch.length > 0)
      fail.push(`${vp.tag} ${p}: 보이는 이름과 읽어 주는 이름이 다르다 — ${m.rails.nameMismatch.join(" · ")}`);
    if (m.pinMarkerLost.length > 0)
      fail.push(`${vp.tag} ${p}: 고정 칸이 줄 표식을 먹었다 ${m.pinMarkerLost.length}줄 — ${m.pinMarkerLost.slice(0, 2).join(" · ")}`);
    if (errs.length) fail.push(`${vp.tag} ${p}: JS 오류 — ${errs[0].slice(0, 90)}`);
    note(`${p.padEnd(22)} 넘침 ${m.overflow} · 스크롤넘침 ${m.scrollers} · 잘림 ${m.clipped.length} · 안보임 ${m.invisible.length} · 한국어 ${m.ko} · 쪼개진수 ${m.wrappedNums.length} · 안고정표 ${m.unpinned} · 표식먹힘 ${m.pinMarkerLost.length} · 레일제목 ${m.rails.noHead.length + m.rails.sameAsLabel.length + m.rails.nameMismatch.length} · 오류 ${errs.length}`);
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
