/** 머리글 실측 — **로그인 상태와 테마 손잡이가 머리글에 있는가.**
 *
 *  계기(2026-09-15 소유주 지적 「여기서는 내가 로그인 상태인지 그냥 비로그인 상태인지
 *  알 수가 없네」). 그전에는 이 lab 머리글에 계정 표시도 테마 손잡이도 없었다 —
 *  우산과 RadiMeter 는 둘 다 들고 있었으므로 **셋 중 이 lab 만 달랐다.**
 *
 *  ★ 다른 게이트가 못 보는 것 — ① 로그인 **상태별** 화면은 저장소를 채워야만 생긴다
 *    ② 첫 그림의 글자(로그인한 사람에게 「Sign in」이 보이면 안 된다)
 *    ③ 머리글 높이 예산(줄이 하나 늘 때마다 모바일에서 40px 씩 먹는다). */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = "dist/calc";
const SB_REF = "axcikygeoxqdjwobakmd";           // 빌드에 박힌 값과 같아야 한다(아래에서 확인한다)
const BUDGET = { 1280: 80, 390: 110 };            // 머리글 높이 상한(px)
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png",
               ".json": "application/json", ".xml": "application/xml" };
const fail = [];
const note = (s) => console.log("   " + s);
const who0 = (signed) => (signed ? "로그인" : "로그아웃");

const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p.startsWith("/calc")) p = p.slice(5) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const PORT = srv.address().port;

/* ★ 저장소 칸 이름은 **빌드에 박힌 것**을 쓴다 — 게이트가 제 손으로 적은 이름으로 세션을
   심으면, 앱이 다른 칸을 보고 있어도 통과한다(검사가 자기 자신을 확인하는 꼴이다). */
const html = readFileSync(join(DIST, "decay/index.html"), "utf8");
const refInBuild = html.match(/sb-\s*"?\s*\+?\s*"?([a-z0-9]{15,})/)?.[1]
  ?? html.match(/SB_REF\s*=\s*"([a-z0-9]+)"/)?.[1] ?? "";
/* ★★ **환경변수가 없는 빌드도 정상이다**(CI·로컬). 그때는 계정 기능 자체가 꺼지므로
   머리글에 계정 표시가 **없는 것이 맞다** — 「없는 기능을 광고하지 않는다」.
   그래서 이 게이트는 두 갈래로 잰다: 켜진 빌드는 상태별 화면을, 꺼진 빌드는
   **표시가 없다는 것**을. 켜진 쪽에만 걸면 CI 가 늘 빨개져 아무도 안 본다. */
const REF = refInBuild || SB_REF;
const ON = Boolean(refInBuild);
console.log(ON ? `   계정 기능 켜진 빌드 — ref ${REF.slice(0, 6)}…` : "   계정 기능 꺼진 빌드 — 표시가 없어야 맞다");

const SESSION = JSON.stringify({
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { email: "tester@example.com", user_metadata: { name: "알토리" } },
});

const browser = await chromium.launch(LAUNCH);

for (const [w, h, tag] of [[1280, 900, "데스크톱"], [390, 844, "모바일"]]) {
  console.log(`\n── ${tag} ${w}×${h} ──`);
  for (const signed of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    if (signed && ON) await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) {} },
      [`sb-${REF}-auth-token`, SESSION]);
    const pg = await ctx.newPage();
    await pg.goto(`http://localhost:${PORT}/calc/decay/`, { waitUntil: "networkidle" });
    await pg.waitForTimeout(250);

    const m = await pg.evaluate(() => {
      const hd = document.querySelector("header");
      const chip = hd.querySelector("[data-acct-chip]");
      const tg = hd.querySelector("[data-theme-toggle]");
      const vis = (e) => !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0;
      const out = hd.querySelector("[data-acct-out]"), inn = hd.querySelector("[data-acct-in]");
      const r = (e) => { const q = e.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height) }; };
      return {
        height: Math.round(hd.getBoundingClientRect().height),
        chip: !!chip, toggle: !!tg,
        signedOutShown: vis(out), signedInShown: vis(inn),
        who: inn?.getAttribute("data-who") || "",
        chipBox: chip ? r(chip) : null, tgBox: tg ? r(tg) : null,
        themeText: [...hd.querySelectorAll(".rmt-theme-on-light,.rmt-theme-on-dark")]
          .filter((e) => getComputedStyle(e).display !== "none").map((e) => e.textContent.trim()).join("/"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        /** ★★ **머리글·꼬리말이 본문과 면으로 갈리는가**(2026-09-16 소유주 지적
         *  「여기는 메뉴와 본문 배경색이 비슷해보여」). 실측 명도차가 **채널당 4**였다.
         *  ★ 원인은 팔레트 이름이 플랫폼과 **한 칸 밀려 있던 것**이었다 — 그때 이 lab 의
         *    `--c-panel` 은 순백(카드 색)이었고 본문이 `--c-surface` 였다. 같은 날 오후에
         *    이름을 우산·RadiMeter 와 같게 맞췄다(`paper`=본문 · `surface`=카드 ·
         *    `panel`=머리글). 지금 껍데기는 **`--c-panel`** 이다.
         *  ★★ **이 검사는 상대값(명도차 18 이상)이라 「방향」을 못 본다** — 머리글이 본문보다
         *    밝든 어둡든 통과한다. 그래서 lab 셋이 서로 반대 방향으로 갈려 있어도 조용했다.
         *    절대값은 `gate/check-platform.mjs` 가 잰다. 둘 다 있어야 한다.
         *  ★ **선이 아니라 면으로 잰다** — 선만 굵히면 한 바탕 위에 줄이 그어질 뿐이다. */
        bands: (() => {
          const px = (v) => (v.match(/\d+/g) || []).slice(0, 3).map(Number);
          const eff = (el) => { if (!el) return null; let n = el, c = getComputedStyle(n).backgroundColor;
            while (c === "rgba(0, 0, 0, 0)" && n.parentElement) { n = n.parentElement; c = getComputedStyle(n).backgroundColor; }
            return c; };
          const d = (a, b) => { const A = px(a || ""), B = px(b || "");
            return A.length === 3 && B.length === 3 ? Math.abs(A[0]-B[0]) + Math.abs(A[1]-B[1]) + Math.abs(A[2]-B[2]) : -1; };
          const body = getComputedStyle(document.body).backgroundColor;
          const ft = document.querySelector("footer");
          return { head: d(eff(hd), body), foot: d(eff(ft), body),
                   headW: Math.round(hd.getBoundingClientRect().width),
                   footW: ft ? Math.round(ft.getBoundingClientRect().width) : 0,
                   docW: document.documentElement.clientWidth };
        })(),
      };
    });

    const BAND_MIN = 18;  // 채널당 6 — 이보다 얕으면 스크롤 중에 경계가 안 읽힌다
    if (m.bands.head < BAND_MIN)
      fail.push(`${tag} ${who0(signed)}: 머리글이 본문과 거의 같다(명도차 ${m.bands.head}, 최소 ${BAND_MIN})`);
    if (m.bands.foot < BAND_MIN)
      fail.push(`${tag} ${who0(signed)}: 꼬리말이 본문과 거의 같다(명도차 ${m.bands.foot}, 최소 ${BAND_MIN})`);
    if (m.bands.headW !== m.bands.docW)
      fail.push(`${tag} ${who0(signed)}: 머리글 띠가 전폭이 아니다 ${m.bands.headW}/${m.bands.docW}px`);
    if (m.bands.footW !== m.bands.docW)
      fail.push(`${tag} ${who0(signed)}: 꼬리말 띠가 전폭이 아니다 ${m.bands.footW}/${m.bands.docW}px`);
    note(`층 대비 — 머리글 ${m.bands.head} · 꼬리말 ${m.bands.foot}(최소 ${BAND_MIN}) · 띠 ${m.bands.headW}px`);

    const who = signed ? "로그인" : "로그아웃";
    if (ON && !m.chip) fail.push(`${tag} ${who}: 머리글에 계정 표시가 없다`);
    if (!ON && m.chip) fail.push(`${tag} ${who}: 계정 기능이 꺼진 빌드인데 머리글이 로그인을 말한다`);
    if (!m.toggle) fail.push(`${tag} ${who}: 머리글에 테마 손잡이가 없다`);
    // ★ **첫 그림의 글자** — 로그인한 사람에게 「Sign in」이 보이면 안 되고, 그 반대도 안 된다
    if (ON && signed && m.signedOutShown) fail.push(`${tag} 로그인: 머리글이 여전히 「Sign in」을 보여 준다`);
    if (ON && signed && !m.signedInShown) fail.push(`${tag} 로그인: 이름 자리가 안 보인다`);
    if (ON && signed && m.who !== "알토리") fail.push(`${tag} 로그인: 이름이 「${m.who}」 — 세션의 이름과 다르다`);
    if (ON && !signed && !m.signedOutShown) fail.push(`${tag} 로그아웃: 「Sign in」이 안 보인다`);
    if (ON && !signed && m.signedInShown) fail.push(`${tag} 로그아웃: 로그인한 것처럼 이름 자리가 보인다`);
    // 손가락 표적 24px(WCAG 2.5.8)
    for (const [name, box] of [["계정 표시", m.chipBox], ["테마 손잡이", m.tgBox]])
      if (box && (box.h < 24 || box.w < 24)) fail.push(`${tag} ${who}: ${name} 표적 ${box.w}×${box.h} < 24`);
    if (m.overflow > 1) fail.push(`${tag} ${who}: 가로 넘침 ${m.overflow}px`);
    if (m.height > BUDGET[w]) fail.push(`${tag} ${who}: 머리글 ${m.height}px > 예산 ${BUDGET[w]}px`);
    if (!m.themeText) fail.push(`${tag} ${who}: 테마 손잡이에 글자가 없다(점만 있으면 무엇인지 모른다)`);

    // 실제로 눌러서 테마가 바뀌고 **저장되는지** — 읽기만 하던 그전 상태의 재발을 막는다
    if (!signed && m.toggle) {
      const flip = await pg.evaluate(async () => {
        const before = document.documentElement.dataset.theme || "(없음)";
        document.querySelector("[data-theme-toggle]").click();
        await new Promise((r) => setTimeout(r, 120));
        let saved = "";
        try { saved = (JSON.parse(localStorage.getItem("radmeter-v2-theme") || "{}").state || {}).mode || ""; } catch (e) {}
        return { before, after: document.documentElement.dataset.theme || "(없음)", saved,
                 pressed: document.querySelector("[data-theme-toggle]").getAttribute("aria-pressed") };
      });
      if (flip.before === flip.after) fail.push(`${tag}: 테마 손잡이를 눌러도 안 바뀐다(${flip.before})`);
      if (flip.saved !== flip.after) fail.push(`${tag}: 테마가 저장되지 않았다(화면 ${flip.after} · 저장 ${flip.saved || "없음"})`);
      if (flip.pressed !== String(flip.after === "dark")) fail.push(`${tag}: aria-pressed 가 상태와 다르다`);
      /* ★ 없는 것을 찍으려다 **게이트가 죽으면 안 된다** — 역테스트에서 실제로 죽었고,
         그러면 결함 목록 대신 스택 추적이 나와 무엇이 틀렸는지가 가려진다. */
      const box = (b) => (b ? `${b.w}×${b.h}` : "없음");
      note(`${who} — 머리글 ${m.height}px · 칩 ${box(m.chipBox)} · 손잡이 ${box(m.tgBox)} (${m.themeText || "글자없음"}) · 전환 ${flip.before}→${flip.after}(저장 ${flip.saved})`);
    } else if (!signed && !m.toggle) {
      note(`${who} — 머리글 ${m.height}px · 칩 ${m.chipBox ? "있음" : "없음"} · 손잡이 없음`);
    } else if (signed) {
      note(ON ? `${who} — 머리글 ${m.height}px · 이름 「${m.who}」 · 「Sign in」 숨김 ${!m.signedOutShown}`
              : `${who} — 머리글 ${m.height}px · 계정 표시 없음(꺼진 빌드)`);
    }
    await ctx.close();
  }
}

await browser.close();
srv.close();
console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((f) => "   " + f).join("\n")
                        : `\n✅ 머리글 — 테마 손잡이 · 계정 표시(${ON ? "켜짐: 상태 둘" : "꺼짐: 표시 없음"}) · 2뷰포트`);
process.exit(fail.length ? 1 : 0);
