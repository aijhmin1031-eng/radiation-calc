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
 *  ★ 값을 여기 적어 두는 것이 요점이다. 네 레포가 각자 빌드하므로 공유 모듈을 둘 수 없고,
 *    그래서 **같은 숫자를 네 곳에 적고 넷이 함께 지킨다.** 정본을 옮길 때는 네 곳이다.
 *
 *  ★★ **2026-10-06 — 플랫폼 막대 정본을 더했다**(소유주 지시 「같은 상단 메뉴를 쓰고, 칸 이름을
 *    용도로 바꾼다. 각 lab 의 세부 메뉴는 페이지 안으로 내린다」). 머리글이 두 막대가 됐다 —
 *    ① **플랫폼 막대**(`[data-platform-bar]`, panel · line-strong): 브랜드 + 분야 칸 셋 + 컨트롤.
 *       **네 곳이 글자·순서·주소·치수까지 같다** — 아래 `PLATFORM` 이 그 정본이다.
 *    ② **lab 막대**(`[data-lab-bar]`, paper · line): lab 이름 + 그 lab 의 칸(활성 = 앰버 알약).
 *       옛 「칸 치수·활성 표시」 검사(`TAB`·`onBg`·`onInk`)는 이제 **이 막대의 칸**을 잰다.
 *    ★ 플랫폼 칸의 「현재」는 **앰버가 아니다**(명도·무게·괘선) — 앰버 알약은 lab 칸이 쓴다.
 *      한 화면에 앰버 알약이 둘 서면 「지금 어디」가 두 군데로 읽힌다. 그래서 「현재 칸이
 *      앰버로 칠해졌는가」를 **따로** 잰다(값이 정본과 다른지만 보면, 앰버가 아닌 다른 색으로
 *      틀린 것과 구분이 안 된다).
 *    ★ 좁은 화면(<640px)도 잰다 — 이름이 좁은 판으로 바뀌고 칸 줄이 제 줄로 내려가며,
 *      **320px 에서도 칸 셋이 한 줄**이어야 한다(줄 수로 잰다 — 글꼴 지표에 안 흔들린다) · 그리고 칸 끝이
 *      **글줄 안**인가(접히지 않고 거터로 넘치는 경우 — 아래 `NARROW_TINY_PADX` 주석).
 *  ★ 칸(탭)이 없는 층은 lab 칸 검사를 건너뛴다 — 우산에는 lab 막대가 없다(`HAS_TABS`).
 */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

/* ───────── 플랫폼 정본 (네 레포가 같은 값을 적는다) ───────── */
const SPEC = {
  light: { paper: "rgb(232, 234, 230)", panel: "rgb(241, 242, 238)", line: "rgb(188, 191, 182)",
           lineSoft: "rgb(216, 218, 211)", ink: "rgb(25, 27, 28)",
           idle: "rgb(82, 87, 90)", onBg: "rgb(244, 232, 212)", onInk: "rgb(143, 78, 0)" },
  dark:  { paper: "rgb(18, 21, 23)",   panel: "rgb(32, 37, 42)",   line: "rgb(73, 82, 90)",
           lineSoft: "rgb(51, 58, 65)", ink: "rgb(230, 233, 234)",
           idle: "rgb(169, 176, 181)", onBg: "rgb(58, 46, 26)",    onInk: "rgb(242, 163, 60)" },
};
const TAB = { size: "13px", radius: "4px", padY: "6px", padX: "12px" };
const GUTTER = 148;   // 1280px 에서 글줄이 시작하는 x (우산 1048/32 · RadiMeter 1024/20 · RadCalc 1048/32)

/** ★★ 플랫폼 막대 정본(2026-10-06) — 순서·주소·글자 고정. 주소는 **오리진 루트 경로 그대로**
 *  (base·basePath 를 붙이지 않는다). 넓은 화면 ≥640px · 좁은 화면 <640px. */
const PLATFORM = {
  brand: { text: "Radiation Lab", href: "https://radiation-lab.com/", label: "Radiation Lab — platform home",
           size: "16px", weight: "650", mark: 24 },
  fields: [
    { href: "https://radiation-lab.com/calc/", wide: "Dose & shielding",     narrow: "Shielding" },
    { href: "https://radimeter.radiation-lab.com/", wide: "Instrument testing",   narrow: "Instrument tests" },
    { href: "https://disposal.radiation-lab.com/", wide: "Disposal & transport", narrow: "Disposal" },
  ],
  tab: {
    wide:   { size: "13px", radius: "4px", padY: "6px", padX: "12px", gap: 4 },
    narrow: { size: "13px", radius: "4px", padY: "8px", padX: "8px",  gap: 2 },
  },
  currentWeight: "600",
  transparent: "rgba(0, 0, 0, 0)",
};
/** ★ 320px 예외 — 게이트 글꼴(DejaVu Sans, `system-ui`)에서 정본 안여백 8px 로는 칸 셋이 289px 이고
 *  가용폭이 280px 이라 한 줄에 못 든다(2026-10-06 실측). <360px 에서만 가로 안여백 6px(277px).
 *  정본 표를 바꾸는 것이 아니라 **그 폭에서만** 허용하는 값이다 — 360·390px 은 정본 8px 를 잰다.
 *  ★★ 「줄 수 1」만으로는 못 잡는다 — 칸 줄이 `nowrap` 이면 접히지 않고 **오른쪽 거터로 조용히 넘친다**
 *    (역테스트: 예외를 지우자 칸 끝 309px > 글줄 끝 300px 인데 줄 수는 1 이었다. 문서 넘침도 0).
 *    그래서 칸 줄의 오른쪽 끝이 **글줄 안**(막대 안쪽 상자의 안여백 안)에 있는지를 따로 잰다. */
const NARROW_TINY_PADX = "6px";

/* ───────── 레포별 설정 ───────── */
const CONFIG = { DIST: "dist/calc", BASE: "/calc",
                 /* 404·`/saved/` 도 이 lab 의 쪽이다 — 현재 칸이 서야 한다 */
                 PATHS: ["/", "/methods/", "/decay/", "/saved/", "/404.html"],
                 HAS_TABS: true, LABEL: "RadCalc",
                 /* 이 lab 의 모든 쪽에서 현재 칸 — 우산·`/account/` 는 null(현재 칸 0개) */
                 CURRENT: "https://radiation-lab.com/calc/" };
const { DIST, BASE, PATHS, HAS_TABS, LABEL, CURRENT } = CONFIG;
const NARROW = [390, 360, 320];

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

/** 플랫폼 막대 실측 — 넓은·좁은 화면이 같은 함수를 쓴다. */
const measurePlatform = () => {
  const cs = getComputedStyle;
  const bar = document.querySelector("[data-platform-bar]");
  if (!bar) return null;
  const vis = (el) => !!el && cs(el).display !== "none" && el.getBoundingClientRect().width > 0;
  const brand = [...bar.querySelectorAll("a")].find((a) => a.getAttribute("href") === "https://radiation-lab.com/" && !a.closest("nav"));
  const nameEl = brand && [...brand.querySelectorAll("span")].find(vis);
  const mark = brand?.querySelector("svg");
  const nav = bar.querySelector('nav[aria-label="Fields"]');
  const tabs = nav ? [...nav.querySelectorAll("a")] : [];
  const box = (el) => { const q = el.getBoundingClientRect(); return { top: q.top, bottom: q.bottom, left: q.left, right: q.right, h: q.height, w: q.width }; };
  const tab = (a) => {
    const s = cs(a);
    const shown = [...a.querySelectorAll("span")].filter(vis).map((x) => x.textContent.trim());
    return {
      href: a.getAttribute("href"), title: a.getAttribute("title"), cur: a.getAttribute("aria-current"),
      text: shown.join("|"), shownCount: shown.length,
      size: s.fontSize, radius: s.borderTopLeftRadius, padY: s.paddingTop, padX: s.paddingLeft,
      color: s.color, bg: s.backgroundColor, weight: s.fontWeight,
      border: s.borderTopColor, borderW: s.borderTopWidth, ...box(a),
    };
  };
  const T = tabs.map(tab);
  const inner = bar.firstElementChild;
  const lineTops = [...new Set(T.map((t) => Math.round(t.top)))];
  const ctl = inner?.lastElementChild;
  /* 글줄 끝 — 막대 안쪽 상자의 오른쪽 안여백 안쪽 */
  const contentRight = inner ? inner.getBoundingClientRect().right - parseFloat(cs(inner).paddingRight) : null;
  return {
    contentRight, tabsRight: T.length ? Math.max(...T.map((t) => t.right)) : null,
    bg: cs(bar).backgroundColor, line: cs(bar).borderBottomColor,
    edge: inner ? Math.round(inner.getBoundingClientRect().left + parseFloat(cs(inner).paddingLeft)) : null,
    brand: brand ? { href: brand.getAttribute("href"), label: brand.getAttribute("aria-label"),
                     text: nameEl?.textContent.trim() ?? "", size: nameEl ? cs(nameEl).fontSize : null,
                     weight: nameEl ? cs(nameEl).fontWeight : null,
                     markW: mark ? Math.round(mark.getBoundingClientRect().width) : 0,
                     pts: mark?.querySelector("polygon")?.getAttribute("points")?.trim().split(/\s+/).length ?? 0,
                     ...box(brand) } : null,
    navLabel: nav?.getAttribute("aria-label") ?? null,
    tabs: T,
    gaps: T.slice(1).map((t, i) => Math.round((t.left - T[i].right) * 10) / 10),
    tabRows: lineTops.length,
    ctl: ctl ? box(ctl) : null,
  };
};

/* ───────── ① 1280px — 껍데기 · lab 칸 · 플랫폼 막대(넓은 판) × 2테마 ───────── */
for (const theme of ["light", "dark"]) {
  const S = SPEC[theme];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
  for (const path of PATHS) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}${path}`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => {
      const cs = getComputedStyle;
      const pbar = document.querySelector("[data-platform-bar]");
      const lbar = document.querySelector("[data-lab-bar]");
      /* ★ lab 칸은 **lab 막대 안의 것만** 센다 — 플랫폼 칸까지 섞으면 「비활성 칸」이 플랫폼 칸으로
         잡혀 정본(6px 12px)과 우연히 같아 통과하거나, 「현재」(테두리)를 활성 알약으로 잘못 읽는다. */
      const links = lbar ? [...lbar.querySelectorAll("nav a")].filter((a) => a.textContent.trim() && a.offsetHeight) : [];
      const on = links.find((a) => a.getAttribute("aria-current"));
      const off = links.find((a) => !a.getAttribute("aria-current"));
      const d = (el) => el && { size: cs(el).fontSize, radius: cs(el).borderTopLeftRadius,
        padY: cs(el).paddingTop, padX: cs(el).paddingLeft, color: cs(el).color, bg: cs(el).backgroundColor };
      /* ★ **글줄 시작은 H1 의 위치가 아니라 콘텐츠 칸의 왼쪽 끝이다.** 처음에 H1 을 쟀다가
         계산기 쪽에서 388px 이 나왔다 — 그 쪽 H1 은 2단 격자의 오른쪽 칸 안에 있다.
         쪽마다 안쪽 배치가 다른 것은 정상이고, **정본이 정하는 것은 칸의 위치**다.
         그래서 두 막대의 안쪽 상자와 `main` 의 **안여백 안쪽 왼쪽 끝**을 잰다. */
      const edge = (el) => el ? Math.round(el.getBoundingClientRect().left + parseFloat(cs(el).paddingLeft)) : null;
      /* ★ 폭을 정하는 상자가 `main` 자신일 때도 있고(RadCalc·RadiMeter) 그 **자식**일 때도
         있다(우산은 `main` 이 전폭이고 `section.wrap` 이 칸을 든다). 「max-width 가 걸린
         첫 상자」로 찾는다 — 마크업 이름이 아니라 **폭을 정하는 자리**를 따라간다. */
      const mainEl = document.querySelector("main");
      const col = !mainEl ? null
        : cs(mainEl).maxWidth !== "none" ? mainEl
        : [...mainEl.querySelectorAll(":scope > *")].find((el) => cs(el).maxWidth !== "none") ?? null;
      return {
        body: cs(document.body).backgroundColor,
        hdr: pbar ? cs(pbar).backgroundColor : null, line: pbar ? cs(pbar).borderBottomColor : null,
        lab: lbar ? cs(lbar).backgroundColor : null, labLine: lbar ? cs(lbar).borderBottomColor : null,
        on: d(on), off: d(off), tabs: links.length,
        hdrEdge: edge(pbar?.firstElementChild), labEdge: edge(lbar?.firstElementChild), mainEdge: edge(col),
      };
    });
    const tag = `${theme}/${path}`;
    eq(`${tag} 본문 바탕`, m.body, S.paper);
    if (m.hdr === null) fail.push(`${tag} 플랫폼 막대([data-platform-bar])가 없다`);
    eq(`${tag} 플랫폼 막대 바탕`, m.hdr, S.panel);
    eq(`${tag} 플랫폼 막대 아래선`, m.line, S.line);
    if (m.hdrEdge !== GUTTER) fail.push(`${tag} 플랫폼 막대 칸 좌측: ${m.hdrEdge}px (정본 ${GUTTER}px)`);
    if (m.mainEdge !== null && m.mainEdge !== GUTTER) fail.push(`${tag} 본문 칸 좌측: ${m.mainEdge}px (정본 ${GUTTER}px)`);
    if (HAS_TABS) {
      if (m.lab === null) fail.push(`${tag} lab 막대([data-lab-bar])가 없다`);
      else {
        /* lab 막대는 **쪽 바탕**과 같은 면이다 — 플랫폼 막대(panel)와 갈리고 쪽의 일부로 읽힌다 */
        eq(`${tag} lab 막대 바탕`, m.lab, S.paper);
        eq(`${tag} lab 막대 아래선`, m.labLine, S.lineSoft);
        if (m.labEdge !== GUTTER) fail.push(`${tag} lab 막대 칸 좌측: ${m.labEdge}px (정본 ${GUTTER}px)`);
      }
      if (!m.off) fail.push(`${tag} 비활성 lab 칸이 없다`);
      else {
        eq(`${tag} lab 칸 글자크기`, m.off.size, TAB.size);
        eq(`${tag} lab 칸 모서리`, m.off.radius, TAB.radius);
        eq(`${tag} lab 칸 세로여백`, m.off.padY, TAB.padY);
        eq(`${tag} lab 칸 가로여백`, m.off.padX, TAB.padX);
        eq(`${tag} 비활성 lab 칸 글자색`, m.off.color, S.idle);
      }
      if (m.on) {
        eq(`${tag} 활성 lab 칸 바탕`, m.on.bg, S.onBg);
        eq(`${tag} 활성 lab 칸 글자색`, m.on.color, S.onInk);
        eq(`${tag} 활성 lab 칸 글자크기`, m.on.size, TAB.size);
      }
    }

    /* ── 플랫폼 막대(넓은 판) ── */
    const P = await page.evaluate(measurePlatform);
    if (P) checkPlatform(P, `${tag}`, "wide", S, 1280);
    note(`${tag.padEnd(24)} 본문 ${m.body} · 플랫폼 ${m.hdr} · 선 ${m.line} · lab 막대 ${m.lab} · lab 칸 ${m.tabs}개` +
         (m.off ? ` ${m.off.size}/${m.off.radius}/${m.off.padY} ${m.off.padX}` : "") +
         ` · 좌측 ${m.hdrEdge}/${m.labEdge}/${m.mainEdge}px` +
         (P ? ` · 분야 「${P.tabs.map((t) => t.text).join(" · ")}」 현재 ${P.tabs.filter((t) => t.cur).map((t) => t.href).join(",") || "없음"}` : ""));
    await page.close();
  }
  await ctx.close();
}

/* ───────── ② 좁은 화면 — 좁은 판 이름 · 두 줄 · 칸 셋 한 줄 × 2테마 ───────── */
for (const theme of ["light", "dark"]) {
  const S = SPEC[theme];
  for (const w of NARROW) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, colorScheme: theme });
    /* 좁은 화면은 쪽마다 다를 것이 없다(같은 레이아웃) — 허브 + 404 로 줄인다 */
    for (const path of [PATHS[0], PATHS[PATHS.length - 1]]) {
      const page = await ctx.newPage();
      await page.goto(`http://127.0.0.1:${PORT}${BASE}${path}`, { waitUntil: "networkidle" });
      const P = await page.evaluate(measurePlatform);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const tag = `${theme}/${w}px ${path}`;
      if (!P) fail.push(`${tag}: 플랫폼 막대가 없다`);
      else {
        checkPlatform(P, tag, "narrow", S, w);
        if (ov > 0) fail.push(`${tag}: 문서가 가로로 ${ov}px 넘친다`);
        if (theme === "light" && path === PATHS[0])
          note(`${tag.padEnd(24)} 분야 「${P.tabs.map((t) => t.text).join(" · ")}」 칸 줄 ${P.tabRows} · 안여백 ${P.tabs[0]?.padY} ${P.tabs[0]?.padX} · 간격 ${P.gaps.join("/")}px · 칸 끝 ${Math.round(Math.max(...P.tabs.map((t) => t.right)))}/${w}px`);
      }
      await page.close();
    }
    await ctx.close();
  }
}

function checkPlatform(P, tag, mode, S, w) {
  const B = PLATFORM.brand;
  if (!P.brand) { fail.push(`${tag}: 플랫폼 브랜드(href="https://radiation-lab.com/")가 없다`); }
  else {
    eq(`${tag} 브랜드 글자`, P.brand.text, B.text);
    eq(`${tag} 브랜드 aria-label`, P.brand.label, B.label);
    eq(`${tag} 브랜드 글자크기`, P.brand.size, B.size);
    eq(`${tag} 브랜드 굵기`, P.brand.weight, B.weight);
    if (P.brand.pts !== 8) fail.push(`${tag}: 브랜드 마크가 팔각형이 아니다(꼭짓점 ${P.brand.pts})`);
    if (P.brand.markW !== B.mark) fail.push(`${tag}: 브랜드 마크 ${P.brand.markW}px (정본 ${B.mark}px)`);
  }
  if (P.navLabel !== "Fields") fail.push(`${tag}: 분야 칸 <nav aria-label="Fields"> 가 없다`);
  // 순서·주소·글자 — 칸마다 하나의 링크, 보이는 글자는 그 화면 폭의 판 하나
  const want = PLATFORM.fields;
  if (P.tabs.length !== want.length) fail.push(`${tag}: 분야 칸 ${P.tabs.length}개 (정본 ${want.length})`);
  want.forEach((f, i) => {
    const t = P.tabs[i];
    if (!t) return;
    eq(`${tag} 분야 ${i + 1} 주소`, t.href, f.href);
    eq(`${tag} 분야 ${i + 1} 글자(${mode})`, t.text, mode === "wide" ? f.wide : f.narrow);
    eq(`${tag} 분야 ${i + 1} title`, t.title, f.wide);
    if (t.shownCount !== 1) fail.push(`${tag} 분야 ${i + 1}: 보이는 판이 ${t.shownCount}개 — 넓은/좁은 중 하나여야 한다`);
    if (t.h < 24) fail.push(`${tag} 분야 ${i + 1}: 손가락 표적 높이 ${Math.round(t.h)}px < 24`);
  });
  // 치수
  const D = PLATFORM.tab[mode];
  const padX = mode === "narrow" && w < 360 ? NARROW_TINY_PADX : D.padX;
  for (const [i, t] of P.tabs.entries()) {
    eq(`${tag} 분야 ${i + 1} 글자크기`, t.size, D.size);
    eq(`${tag} 분야 ${i + 1} 모서리`, t.radius, D.radius);
    eq(`${tag} 분야 ${i + 1} 세로여백`, t.padY, D.padY);
    eq(`${tag} 분야 ${i + 1} 가로여백`, t.padX, padX);
    if (t.borderW !== "1px") fail.push(`${tag} 분야 ${i + 1}: 테두리 ${t.borderW} (정본 1px — 비활성은 투명)`);
  }
  for (const [i, g] of P.gaps.entries())
    if (Math.abs(g - D.gap) > 0.5) fail.push(`${tag}: 분야 칸 ${i + 1}–${i + 2} 사이 ${g}px (정본 ${D.gap}px)`);
  // 현재 칸 — 개수 · 그 lab 의 것인가 · 모양(앰버가 아니다)
  const cur = P.tabs.filter((t) => t.cur);
  const wantCur = CURRENT ? 1 : 0;
  if (cur.length !== wantCur) fail.push(`${tag}: 현재 칸 ${cur.length}개 (정본 ${wantCur})`);
  for (const t of cur) {
    if (t.cur !== "true") fail.push(`${tag}: 현재 칸의 aria-current="${t.cur}" (정본 "true")`);
    if (t.href !== CURRENT) fail.push(`${tag}: 현재 칸이 ${t.href} — 이 lab(${CURRENT})의 것이 아니다`);
    /* ★★ 앰버 검사는 **값 대조와 따로** 한다 — 「정본과 다르다」만 보면 앰버로 칠한 것과
       다른 색으로 틀린 것이 같은 실패로 섞여, 이 규칙(앰버는 lab 칸의 활성 전용)이 안 보인다. */
    if (t.bg === S.onBg || t.color === S.onInk || t.border === S.onInk)
      fail.push(`${tag}: 현재 분야 칸이 **앰버**다(바탕 ${t.bg} · 글자 ${t.color} · 테두리 ${t.border}) — 앰버 알약은 lab 칸의 활성 표시 전용`);
    eq(`${tag} 현재 칸 글자색`, t.color, S.ink);
    eq(`${tag} 현재 칸 굵기`, t.weight, PLATFORM.currentWeight);
    eq(`${tag} 현재 칸 테두리`, t.border, S.line);
    eq(`${tag} 현재 칸 바탕`, t.bg, PLATFORM.transparent);
  }
  for (const t of P.tabs.filter((x) => !x.cur)) {
    eq(`${tag} 비현재 칸(${t.href}) 글자색`, t.color, S.idle);
    eq(`${tag} 비현재 칸(${t.href}) 테두리`, t.border, PLATFORM.transparent);
    eq(`${tag} 비현재 칸(${t.href}) 바탕`, t.bg, PLATFORM.transparent);
  }
  // 배치 — 넓은 화면 한 줄 · 좁은 화면 두 줄(칸 셋은 브랜드 아래 제 줄, 그 줄은 한 줄)
  if (P.tabRows !== 1) fail.push(`${tag}: 분야 칸이 ${P.tabRows}줄로 접혔다 — 한 줄이어야 한다`);
  if (P.contentRight !== null && P.tabsRight !== null && P.tabsRight > P.contentRight + 0.5)
    fail.push(`${tag}: 분야 칸이 글줄 밖으로 넘친다(칸 끝 ${Math.round(P.tabsRight)}px > 글줄 끝 ${Math.round(P.contentRight)}px)`);
  if (P.brand && P.tabs.length) {
    const brandMid = (P.brand.top + P.brand.bottom) / 2;
    const tabMid = (P.tabs[0].top + P.tabs[0].bottom) / 2;
    if (mode === "wide") {
      if (Math.abs(brandMid - tabMid) > 4) fail.push(`${tag}: 넓은 화면인데 브랜드와 칸이 한 줄이 아니다(중심선 ${Math.round(brandMid)} / ${Math.round(tabMid)})`);
      if (P.ctl && Math.abs((P.ctl.top + P.ctl.bottom) / 2 - tabMid) > 4) fail.push(`${tag}: 넓은 화면인데 컨트롤이 칸과 한 줄이 아니다`);
      if (P.tabs[0].left <= P.brand.right) fail.push(`${tag}: 칸이 브랜드 뒤(오른쪽)에 있지 않다`);
    } else {
      if (P.tabs[0].top < P.brand.bottom - 1) fail.push(`${tag}: 좁은 화면인데 칸 줄이 브랜드 아래 제 줄이 아니다`);
      if (P.ctl && Math.abs((P.ctl.top + P.ctl.bottom) / 2 - brandMid) > 6) fail.push(`${tag}: 좁은 화면인데 컨트롤이 브랜드 줄에 없다`);
      if (P.edge !== null && Math.abs(P.tabs[0].left - P.edge) > 1) fail.push(`${tag}: 칸 줄이 왼쪽 정렬이 아니다(${Math.round(P.tabs[0].left)} vs 거터 ${P.edge})`);
    }
  }
}

await browser.close(); srv.close();

if (fail.length) { console.log(`\n❌ ${LABEL} — 플랫폼 정본에서 벗어난 값 ${fail.length}건`); fail.forEach((f) => console.log("   " + f)); process.exit(1); }
console.log(`\n✅ ${LABEL} — 플랫폼 껍데기 정본과 일치(본문·머리글·아래선·칸 좌측${HAS_TABS ? " · lab 막대·칸 치수·활성 표시" : ""}` +
            ` · 플랫폼 막대: 브랜드·분야 칸 글자·순서·주소·치수·현재 칸 ${CURRENT ? "1(" + CURRENT + ")" : "0"} · 좁은 화면 ${NARROW.join("/")}px 한 줄) × 2테마`);
