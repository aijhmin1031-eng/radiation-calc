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
 *
 *  ★★ RadCalc 판(2026-10-06 ⑥) — **우산 레포 `gate/check-platform.mjs`(ab49970)를 그대로 옮기고 설정만 바꿨다.**
 *    머리글 한 줄(명세 `C:\dev\rl\HEADER-SPEC.md`)이 apex 의 모든 쪽에 같은 마크업·같은 치수로 서야 하므로 측정 함수까지
 *    같다. `PBAR`·`SPEC`·`MARK` 를 고치면 **두 레포를 함께** 고친다. 다른 점 셋 —
 *    ① 쪽마다 현재 칸이 있다(Methods·Nuclide data·Validation 쪽) — `CURRENT` 를 「쪽마다」로 둔다(우산은 0개를 요구한다)
 *    ② 본문 칸 좌측(GUTTER 148px)은 이 lab 의 모든 쪽에서 잰다 — 모든 쪽이 `max-w-content` 한 칸이다
 *    ③ 옛 lab 막대가 없으므로 `HAS_TABS` 는 꺼 둔다(옛 두 막대가 돌아오면 `check-lockup` 이 잡는다)
 */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/* ───────── 플랫폼 정본 (세 레포가 같은 값을 적는다) ───────── */
const SPEC = {
  light: { paper: "rgb(232, 234, 230)", panel: "rgb(241, 242, 238)", line: "rgb(188, 191, 182)",
           idle: "rgb(82, 87, 90)", onBg: "rgb(244, 232, 212)", onInk: "rgb(143, 78, 0)" },
  dark:  { paper: "rgb(18, 21, 23)",   panel: "rgb(32, 37, 42)",   line: "rgb(73, 82, 90)",
           idle: "rgb(169, 176, 181)", onBg: "rgb(58, 46, 26)",    onInk: "rgb(242, 163, 60)" },
};
const TAB = { size: "13px", radius: "4px", padY: "6px", padX: "12px" };
const GUTTER = 148;   // 1280px 에서 글줄이 시작하는 x (우산 1048/32 · RadiMeter 1024/20 · RadCalc 1048/32)

/* ───────── 머리글 정본 (2026-10-06 ④ — 한 줄 머리글, C:\dev\rl\HEADER-SPEC.md) ─────────
 *  소유주 「여기 상단에 놓아두는 2가지 영역이 다르네… 하나의 계산기 안에 다양한 도구가 들어있는 형태로 구성해보자」 → 「고」.
 *  플랫폼 막대(분야 칸 셋) + lab 막대(RadCalc 칸 셋) 두 줄을 **한 줄**로 합쳤다: 브랜드 · Tools ▾ · Nuclide data · Methods ·
 *  Validation · 테마 · 계정. Tools 는 `<details>` 메뉴이고 도구 일곱(두 묶음)과 자매 사이트 둘을 든다.
 *  ★ apex 의 쪽(우산 여섯 쪽 + RadCalc)이 같은 표를 든다. 하위 도메인 둘은 브랜드 뒤에 「/ RadiMeter」 등을 붙이고 자기 칸을 든다.
 *  ★ 「현재」는 앰버가 아니다 — 글자 ink · 600 · 1px line-strong · 바탕 surface. 우산 쪽에는 현재 칸이 없어 달아 보고 잰다. */
const PBAR = {
  brand: { text: "Radiation Lab", href: "https://radiation-lab.com/", label: "Radiation Lab — home",
           size: "16px", weight: "650", spacing: "-0.192px", mark: 24 },   // -0.012em × 16px
  items: [
    { menu: true, long: "Tools", short: "Tools" },
    { href: "/calc/nuclides/",   long: "Nuclide data", short: "Nuclides" },
    { href: "/calc/methods/",    long: "Methods",      short: "Methods" },
    { href: "/calc/validation/", long: "Validation",   short: "Validation" },
  ],
  wide:   { size: "14px", radius: "6px", padY: "7px", padX: "12px", gap: 4 },
  narrow: { size: "13px", radius: "6px", padY: "8px", padX: "8px",  gap: 2 },
  tinyPadX: "5px",      // 360px 미만에서만 가로 안여백 5px · 글자 12px(2026-10-07 CI 의 DejaVu 에서 320px 칸 끝 302~310 > 300)
  tinySize: "12px",
  edge: 640,            // 긴 글자가 시작하는 폭
  oneRow: 1024,         // 한 줄이 되는 폭 — 그 아래는 두 줄(1줄 브랜드+컨트롤 · 2줄 칸)
  current: { weight: "600" },
  menu: {
    maxWidth: 820,
    groups: [
      { name: "Dose & shielding", items: [["/calc/gamma-shielding/", "Gamma dose rate & shielding"], ["/calc/beta/", "Beta dose rate & shielding"],
                                          ["/calc/alara/", "ALARA & job planning"]] },
      { name: "Activity & counting", items: [["/calc/units/", "Unit converter"], ["/calc/decay/", "Decay & half-life"],
                                             ["/calc/specific-activity/", "Mass & activity"], ["/calc/mda/", "Detection limits (MDA / MDC)"]] },
    ],
    more: [["https://radimeter.radiation-lab.com/", "Instrument testing"], ["https://disposal.radiation-lab.com/", "Disposal & transport"],
           ["https://tools.radiation-lab.com/", "Everyday tools"]],   // 2026-10-06 ⑦ 셋째 자매(소유주 결정)
  },
};
const SURFACE = { light: "rgb(252, 252, 250)", dark: "rgb(26, 30, 33)" };
/** 재는 폭 — 세 경계(1024 줄 · 640 글자 · 360 안여백)의 양쪽과 대표 폭. 모든 쪽에서 잰다(CSS 사본이 쪽마다 있다). */
const WIDTHS = [1280, 1024, 1023, 820, 640, 639, 390, 360, 359, 320];

/* ───────── 레포별 설정 ───────── */
/* 우산에는 구획 칸이 없다 — lab 막대가 없고, 플랫폼 막대의 「현재」 칸도 0개다(어느 lab 의 쪽도 아니다).
   그래서 lab 칸 치수(HAS_TABS)는 재지 않고 **면·선·글줄 시작 + 플랫폼 막대**를 잰다.
   ★ 플랫폼 막대는 우산의 **모든 공개 쪽**에서 잰다(2026-10-06). 본문 칸 좌측(GUTTER)은 랜딩만 잰다 —
     읽는 쪽(/about 등)은 760px 글칸이 설계이고, 막대는 쪽 폭과 따로 1048/32 를 든다. */
const CONFIG = { DIST: join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "calc"), BASE: "/calc",
                 /* 도구 쪽(메뉴의 현재 도구) · 현재 칸이 서는 쪽 둘 · 저장 · 404 */
                 PATHS: ["/gamma-shielding/", "/methods/", "/nuclides/", "/saved/", "/404.html"],
                 EDGE_PATHS: ["/gamma-shielding/", "/methods/", "/nuclides/", "/saved/", "/404.html"], CURRENT: "per-page",
                 HAS_TABS: false, LABEL: "RadCalc" };
const { DIST, BASE, PATHS, EDGE_PATHS, CURRENT, HAS_TABS, LABEL } = CONFIG;

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

/* ───────── 머리글 읽기·대조 ───────── */
const MARK = { poly: "32,6.2 50.24,13.76 57.8,32 50.24,50.24 32,57.8 13.76,50.24 6.2,32 13.76,13.76", cx: 32, cy: 32, r: 15 };
const TRANSPARENT = "rgba(0, 0, 0, 0)";

/** 막대를 읽는다. 우산 쪽에는 현재 칸이 없으므로 첫 링크 칸에 잠시 `aria-current="page"` 를 달아 「현재」 모양을 잰다 —
 *  달아 보지 않으면 그 모양이 앰버로 칠해져 있어도 영영 모른다. */
async function readBar(page) {
  return page.evaluate(() => {
    const cs = getComputedStyle;
    const hdr = document.querySelector("header");
    if (!hdr) return { missing: "header" };
    const brand = hdr.querySelector("a");
    const nm = brand && [...brand.querySelectorAll("*")].find((e) => !e.children.length && e.textContent.trim());
    const svg = brand && brand.querySelector("svg");
    const poly = svg && svg.querySelector("polygon"), circ = svg && svg.querySelector("circle");
    const nav = hdr.querySelector('nav[aria-label="Main"]');
    const els = nav ? [...nav.querySelectorAll(":scope > a, :scope > details > summary")] : [];
    const st = (a) => { const c = cs(a), r = a.getBoundingClientRect();
      return { size: c.fontSize, radius: c.borderTopLeftRadius, padY: c.paddingTop, padX: c.paddingLeft,
               color: c.color, border: c.borderTopColor, bw: c.borderTopWidth, bg: c.backgroundColor, weight: c.fontWeight,
               top: Math.round(r.top), bottom: r.bottom, left: r.left, right: r.right, w: Math.round(r.width), h: Math.round(r.height) }; };
    const items = els.map((a) => ({ menu: a.tagName === "SUMMARY", href: a.getAttribute("href"), current: a.getAttribute("aria-current"),
      shown: a.innerText.trim().replace(/\s+/g, " "), ...st(a) }));
    let probe = null;
    const firstLink = els.find((e) => e.tagName === "A");
    if (firstLink && !els.some((e) => e.getAttribute("aria-current"))) {
      firstLink.setAttribute("aria-current", "page"); probe = st(firstLink); firstLink.removeAttribute("aria-current");
    }
    return {
      ink: cs(document.body).color,
      brand: brand && { href: brand.getAttribute("href"), label: brand.getAttribute("aria-label"), text: brand.textContent.trim().replace(/\s+/g, " ") },
      nm: nm && { size: cs(nm).fontSize, weight: cs(nm).fontWeight, spacing: cs(nm).letterSpacing, color: cs(nm).color },
      mark: svg && { w: Math.round(svg.getBoundingClientRect().width), h: Math.round(svg.getBoundingClientRect().height),
        poly: poly ? poly.getAttribute("points").trim().split(/\s+/).map((p) => p.split(",").map(Number).join(",")).join(" ") : null,
        circ: circ ? [circ.getAttribute("cx"), circ.getAttribute("cy"), circ.getAttribute("r")].map(Number) : null },
      nav: !!nav, lang: nav ? (nav.closest("[lang]")?.getAttribute("lang") || "") : "",
      contentRight: (() => { const inner = hdr.querySelector(":scope > div"); return inner ? inner.getBoundingClientRect().right - parseFloat(cs(inner).paddingRight) : null; })(),
      brandBox: brand && (() => { const r = brand.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, right: r.right }; })(),
      ctlBox: (() => { const c = hdr.querySelector("#thm")?.parentElement; if (!c) return null; const r = c.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; })(),
      items, probe,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

function checkBar(tag, b, w, theme) {
  const mode = w >= PBAR.edge ? "wide" : "narrow";
  const S = SPEC[theme], D = PBAR[mode];
  const padX = mode === "narrow" && w < 360 ? PBAR.tinyPadX : D.padX;
  if (b.missing) { fail.push(`${tag} ${b.missing} 가 없다`); return; }
  if (!b.brand) fail.push(`${tag} 브랜드 링크가 없다`);
  else { eq(`${tag} 브랜드 주소`, b.brand.href, PBAR.brand.href); eq(`${tag} 브랜드 접근성 이름`, b.brand.label, PBAR.brand.label);
         eq(`${tag} 브랜드 글자`, b.brand.text, PBAR.brand.text); }
  if (!b.nm) fail.push(`${tag} 브랜드 이름 요소가 없다`);
  else { eq(`${tag} 브랜드 글자크기`, b.nm.size, PBAR.brand.size); eq(`${tag} 브랜드 굵기`, b.nm.weight, PBAR.brand.weight);
         eq(`${tag} 브랜드 자간`, b.nm.spacing, PBAR.brand.spacing); eq(`${tag} 브랜드 글자색(ink)`, b.nm.color, b.ink); }
  if (!b.mark) fail.push(`${tag} 브랜드 마크(svg)가 없다`);
  else {
    if (b.mark.w !== PBAR.brand.mark || b.mark.h !== PBAR.brand.mark) fail.push(`${tag} 마크 크기: ${b.mark.w}×${b.mark.h} (정본 ${PBAR.brand.mark})`);
    eq(`${tag} 마크 팔각 좌표`, b.mark.poly, MARK.poly); eq(`${tag} 마크 핵`, (b.mark.circ || []).join(","), [MARK.cx, MARK.cy, MARK.r].join(","));
  }
  if (!b.nav) { fail.push(`${tag} nav[aria-label="Main"] 가 없다`); return; }
  if (!/^en\b/.test(b.lang)) fail.push(`${tag} 칸 nav 의 언어가 영어가 아니다: "${b.lang}"`);
  eq(`${tag} 칸 수`, b.items.length, PBAR.items.length);
  PBAR.items.forEach((want, i) => {
    const got = b.items[i]; if (!got) return;
    const at = `${tag} 칸 ${i + 1}`;
    if (!!want.menu !== got.menu) fail.push(`${at}: ${want.menu ? "Tools 메뉴(summary)여야 한다" : "링크여야 한다"}`);
    if (!want.menu) eq(`${at} 주소`, got.href, want.href);
    eq(`${at} 보이는 글자(${mode === "wide" ? "긴" : "짧은"} 판)`, got.shown, mode === "wide" ? want.long : want.short);
  });
  const cur = b.items.filter((x) => x.current && x.current !== "false");
  if (CURRENT === null && cur.length) fail.push(`${tag} 현재 칸 ${cur.length}개 (우산 쪽은 0개)`);
  b.items.forEach((x, i) => {
    const at = `${tag} 칸 ${i + 1}`;
    eq(`${at} 글자크기`, x.size, mode === "narrow" && w < 360 ? PBAR.tinySize : D.size); eq(`${at} 모서리`, x.radius, D.radius);
    eq(`${at} 세로여백`, x.padY, D.padY); eq(`${at} 가로여백`, x.padX, padX);
    if (x.h < 24 || x.w < 24) fail.push(`${at} 손가락 표적 ${x.w}×${x.h}px (24 이상)`);
    if (cur.includes(x)) return;
    eq(`${at} 비활성 글자색(idle)`, x.color, S.idle); eq(`${at} 비활성 테두리(투명)`, x.border, TRANSPARENT);
  });
  for (let i = 1; i < b.items.length; i++) {
    const g = Math.round((b.items[i].left - b.items[i - 1].right) * 10) / 10;
    if (Math.abs(g - D.gap) > 0.5) fail.push(`${tag} 칸 사이 간격 ${i}–${i + 1}: ${g}px (정본 ${D.gap}px)`);
  }
  const rows = new Set(b.items.map((x) => x.top)).size;
  if (rows !== 1) fail.push(`${tag} 칸 넷이 ${rows}줄이다 (정본 한 줄)`);
  const right = b.items.length ? Math.max(...b.items.map((x) => x.right)) : null;
  if (right !== null && b.contentRight !== null && right > b.contentRight + 0.5)
    fail.push(`${tag} 칸 줄이 글줄 밖으로 넘친다 (칸 끝 ${Math.round(right)}px > 글줄 끝 ${Math.round(b.contentRight)}px)`);
  if (b.overflow > 0) fail.push(`${tag} 가로 넘침 ${b.overflow}px`);
  if (b.brandBox && b.items.length) {
    const mid = (r) => (r.top + r.bottom) / 2, im = mid(b.items[0]), bm = mid(b.brandBox);
    if (w >= PBAR.oneRow) {
      if (Math.abs(bm - im) > 4) fail.push(`${tag} ${PBAR.oneRow}px 이상인데 브랜드와 칸이 한 줄이 아니다`);
      if (b.ctlBox && Math.abs(mid(b.ctlBox) - im) > 4) fail.push(`${tag} ${PBAR.oneRow}px 이상인데 컨트롤이 칸과 한 줄이 아니다`);
      if (b.items[0].left <= b.brandBox.right) fail.push(`${tag} 칸이 브랜드 뒤(오른쪽)에 있지 않다`);
    } else {
      if (b.items[0].top < b.brandBox.bottom - 1) fail.push(`${tag} ${PBAR.oneRow}px 미만인데 칸 줄이 브랜드 아래 제 줄이 아니다`);
      if (b.ctlBox && Math.abs(mid(b.ctlBox) - bm) > 6) fail.push(`${tag} ${PBAR.oneRow}px 미만인데 컨트롤이 브랜드 줄에 없다`);
    }
  }
  const on = cur[0] || b.probe;
  if (on) {
    const at = `${tag} 현재 칸${cur[0] ? "" : "(달아 본 것)"}`;
    if (on.bg === S.onBg || on.color === S.onInk) fail.push(`${at}: 앰버로 칠해졌다 (바탕 ${on.bg} · 글자 ${on.color})`);
    eq(`${at} 글자색(ink)`, on.color, b.ink); eq(`${at} 굵기`, on.weight, PBAR.current.weight);
    eq(`${at} 테두리색(line-strong)`, on.border, S.line); eq(`${at} 테두리 두께`, on.bw, "1px");
    eq(`${at} 바탕(surface)`, on.bg, SURFACE[theme]);
  }
  if (tag.startsWith(`light/${PATHS[0]}@`))
    note(`${tag.padEnd(26)} 막대 — ${b.items.map((x) => `${x.shown}(${x.w}×${x.h})`).join(" · ")} · 안여백 ${b.items[0]?.padY} ${b.items[0]?.padX}` +
         ` · 칸 줄 ${rows} · 칸 끝 ${Math.round(right)}/${Math.round(b.contentRight)}px`);
}

/** Tools 메뉴 — 연다(요약을 누른다) → 도구 일곱·자매 사이트 둘·패널 자리를 잰다 → Esc 로 닫히고 포커스가 요약으로 돌아오는가. */
async function checkMenu(page, tag, w) {
  const sum = page.locator('header nav[aria-label="Main"] > details > summary');
  if (!(await sum.count())) { fail.push(`${tag} Tools 메뉴(details > summary)가 없다`); return; }
  await sum.click();
  const m = await page.evaluate(() => {
    const d = document.querySelector('header nav[aria-label="Main"] > details');
    const panel = d.querySelector(":scope > div");
    const inner = document.querySelector("header > div");
    const r = panel.getBoundingClientRect(), ir = inner.getBoundingClientRect();
    const groups = [...panel.querySelectorAll("ul")].map((ul) => ({
      name: (document.getElementById(ul.getAttribute("aria-labelledby") || "")?.textContent || "").trim(),
      items: [...ul.querySelectorAll("a")].map((a) => ({ href: a.getAttribute("href"), name: (a.querySelector("b")?.textContent || "").trim(),
        icon: !!a.querySelector("svg"), h: Math.round(a.getBoundingClientRect().height), bg: getComputedStyle(a).backgroundColor })) }));
    const more = [...panel.querySelectorAll(":scope > div:last-child a")].map((a) => ({ href: a.getAttribute("href"), name: a.textContent.trim(),
      h: Math.round(a.getBoundingClientRect().height) }));
    return { open: d.open, left: r.left, right: r.right, width: r.width, gutterL: ir.left + parseFloat(getComputedStyle(inner).paddingLeft),
             gutterR: ir.right - parseFloat(getComputedStyle(inner).paddingRight), vw: innerWidth, groups, more };
  });
  if (!m.open) { fail.push(`${tag} Tools 를 눌렀는데 열리지 않는다`); return; }
  if (Math.abs(m.left - m.gutterL) > 0.5) fail.push(`${tag} 메뉴 패널 왼쪽 ${Math.round(m.left)}px — 글줄 시작 ${Math.round(m.gutterL)}px 과 다르다`);
  if (m.right > m.gutterR + 0.5) fail.push(`${tag} 메뉴 패널이 글줄 밖으로 넘친다 (${Math.round(m.right)} > ${Math.round(m.gutterR)})`);
  if (m.width > PBAR.menu.maxWidth + 0.5) fail.push(`${tag} 메뉴 패널 폭 ${Math.round(m.width)}px (최대 ${PBAR.menu.maxWidth})`);
  eq(`${tag} 메뉴 묶음`, m.groups.map((g) => g.name).join(" | "), PBAR.menu.groups.map((g) => g.name).join(" | "));
  PBAR.menu.groups.forEach((g, i) => {
    const got = m.groups[i]; if (!got) return;
    eq(`${tag} 메뉴 「${g.name}」 도구`, got.items.map((x) => `${x.href} ${x.name}`).join(" · "), g.items.map(([h, n]) => `${h} ${n}`).join(" · "));
    got.items.forEach((x) => { if (!x.icon) fail.push(`${tag} 메뉴 ${x.name}: 아이콘이 없다`); if (x.h < 24) fail.push(`${tag} 메뉴 ${x.name}: 표적 ${x.h}px`); });
  });
  eq(`${tag} 메뉴 아래 줄(자매 사이트)`, m.more.map((x) => `${x.href} ${x.name}`).join(" · "), PBAR.menu.more.map(([h, n]) => `${h} ${n}`).join(" · "));
  m.more.forEach((x) => { if (x.h < 24) fail.push(`${tag} 메뉴 ${x.name}: 표적 ${x.h}px`); });
  await page.keyboard.press("Escape");
  const after = await page.evaluate(() => ({ open: document.querySelector('header nav[aria-label="Main"] > details').open,
    focus: document.activeElement?.tagName }));
  if (after.open) fail.push(`${tag} Esc 로 메뉴가 닫히지 않는다`);
  if (after.focus !== "SUMMARY") fail.push(`${tag} Esc 뒤 포커스가 Tools 로 돌아오지 않는다 (${after.focus})`);
  await sum.click(); await page.mouse.click(5, (await page.evaluate(() => innerHeight)) - 5);
  if (await page.evaluate(() => document.querySelector('header nav[aria-label="Main"] > details').open)) fail.push(`${tag} 바깥을 눌러도 메뉴가 닫히지 않는다`);
  if (tag.startsWith("light/") && w === 1280 && tag.includes("// ") === false && tag.endsWith("/@1280"))
    note(`${tag.padEnd(26)} 메뉴 — 패널 ${Math.round(m.left)}–${Math.round(m.right)}px · 묶음 ${m.groups.map((g) => `${g.name}(${g.items.length})`).join(" · ")} · 자매 ${m.more.length}`);
}

for (const theme of ["light", "dark"]) {
  const S = SPEC[theme];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
  for (const path of PATHS) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}${path}`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => {
      const cs = getComputedStyle;
      const hdr = document.querySelector("header");
      /* lab 칸만 — 플랫폼 막대의 칸(`nav[aria-label="Fields"]`)은 아래 PBAR 검사가 따로 잰다. */
      const links = [...hdr.querySelectorAll('nav:not([aria-label="Main"]) a')].filter((a) => a.textContent.trim() && a.offsetHeight);
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
    if (EDGE_PATHS.includes(path) && m.mainEdge !== null && m.mainEdge !== GUTTER) fail.push(`${tag} 본문 칸 좌측: ${m.mainEdge}px (정본 ${GUTTER}px)`);
    /* 같은 쪽을 폭만 바꿔 다시 잰다 — 다시 불러오지 않는다(배치는 폭이 바뀌면 다시 계산된다). */
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      checkBar(`${tag}@${w}`, await readBar(page), w, theme);
    }
    for (const w of [1280, 390]) {
      await page.setViewportSize({ width: w, height: 900 });
      await checkMenu(page, `${tag}@${w}`, w);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
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
         ` · 칸 좌측 머리글 ${m.hdrEdge}px` + (EDGE_PATHS.includes(path) && m.mainEdge !== null ? ` 본문 ${m.mainEdge}px` : ""));
    await page.close();
  }
  await ctx.close();

}

await browser.close(); srv.close();

if (fail.length) { console.log(`\n❌ ${LABEL} — 머리글 정본에서 벗어난 값 ${fail.length}건`); fail.forEach((f) => console.log("   " + f)); process.exit(1); }
console.log(`\n✅ ${LABEL} — 머리글 정본과 일치(본문·머리글·아래선·칸 좌측 · 한 줄 머리글: 브랜드·칸 넷 글자·순서·주소·치수·배치·글줄 안 ${WIDTHS.join("/")}px · 「현재」 모양(앰버 아님) · Tools 메뉴: 묶음 둘·도구 일곱·자매 둘·패널 자리·Esc·바깥 클릭 1280/390px) × 2테마 × ${PATHS.length}쪽`);
