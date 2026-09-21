/** 핵종 낱장 실측 — **147장을 한 틀로 찍지 않았는가.**
 *
 *  ★★ 계기(2026-09-16 소유주 「radcalc 이 사이트에 우리만의 특별한 기능을 추가할 것이 뭐가
 *    있을까? 유사한 사이트가 너무 많아」). 답으로 핵종 낱장 147장을 세웠는데, **쪽을 한꺼번에
 *    147장 늘리는 것 자체가 이 작업의 유일한 진짜 위험**이다 — 이웃 lab 이 애드센스에서 실제로
 *    탈락한 원인이 「장 제목이 글자까지 같고 본문만 다른」 글 묶음이었다.
 *
 *  ★★ **어수 검사는 이것을 못 본다.** `check-output` ⑥ 은 250어 하한만 보는데, 되풀이되는
 *    설명으로 채워도 어수는 늘어난다. 실제로 첫 판이 그랬다 — 어수는 최소 346어로 넉넉했지만
 *    낱장 사이 5-그램 겹침이 **중앙 20.8%** 였다(설명을 147번 되풀이했다). 설명을 `/nuclides/`
 *    한 곳으로 옮기고 낱장에는 그 핵종의 숫자와 판단만 남기자 **12.8%** 로 떨어졌다.
 *    그래서 이 게이트는 **겹침을 직접 잰다.**
 *
 *  ★ 함께 보는 것 — ① 숫자가 깨져 `NaN`·`Infinity`·`undefined` 로 나가지 않는가(147장이라
 *    한 종만 깨져도 사람 눈에는 안 띈다) ② 계산기로 보내는 링크가 **실제로 복원되는가**
 *    (처음에 `?n=Co-60` 으로 적었는데 그것을 읽는 코드가 아무 데도 없었다 — 「없는 기능을
 *    광고하지 않는다」) ③ 감마가 없는 핵종에 감마 값이 새지 않는가.
 */
import { chromium } from "playwright";
import { LAUNCH } from "./chromium.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = "dist/calc", BASE = "/calc", DIR = join(DIST, "nuclides");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
               ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".xml": "application/xml" };
const MEDIAN_MAX = 0.18;     // 5-그램 겹침 중앙 상한 (실측 0.128)
const PAIR_MAX = 0.55;       // 한 쌍의 상한 (실측 최대 0.41 — 같은 원소의 이웃 동위원소)
const fail = [];
const note = (s) => console.log("   " + s);

const nuc = JSON.parse(readFileSync("src/data/nuclides.json", "utf8"));
const dirs = readdirSync(DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

/* ── ① 147종이 전부 있는가 ───────────────────────────────── */
console.log("\n① 낱장이 데이터와 1:1 인가");
const want = Object.keys(nuc).map((k) => k.toLowerCase()).sort();
const got = [...dirs].sort();
const missing = want.filter((k) => !got.includes(k));
const extra = got.filter((k) => !want.includes(k));
if (missing.length) fail.push(`낱장 없음: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ` 외 ${missing.length - 6}` : ""}`);
if (extra.length) fail.push(`데이터에 없는 낱장: ${extra.join(", ")}`);
note(`데이터 ${want.length}종 · 낱장 ${got.length}장`);

/* ── ② 깨진 숫자 ─────────────────────────────────────────── */
console.log("\n② 깨진 숫자가 화면에 나갔는가 (NaN · Infinity · undefined · null)");
const pages = new Map();
for (const d of dirs) {
  const html = readFileSync(join(DIR, d, "index.html"), "utf8");
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [, ""])[1];
  const text = main.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  pages.set(d, { html, main, text });
  const bad = text.match(/\b(NaN|Infinity|undefined|null)\b/g);
  if (bad) fail.push(`${d}: 화면에 ${[...new Set(bad)].join(", ")}`);
}
note(`${dirs.length}장 훑음`);

/* ── ③ 감마가 없는 핵종에 감마 값이 새는가 ────────────────── */
console.log("\n③ 감마 없는 핵종에 Γ·반가층이 새는가");
let noG = 0;
for (const [d, p] of pages) {
  const key = Object.keys(nuc).find((k) => k.toLowerCase() === d);
  if (nuc[key].gamma_const > 0) continue;
  noG++;
  if (/Air kerma rate constant|Half- and tenth-value/.test(p.main))
    fail.push(`${d}: Γ 가 0 인데 감마 구획이 그려졌다`);
}
note(`Γ = 0 인 핵종 ${noG}종 — 감마 구획 0개`);

/* ── ④ 틀에 값만 갈아 끼웠는가 (5-그램 겹침) ──────────────── */
console.log("\n④ 낱장 사이 본문 겹침 (5-그램)");
const grams = (s) => {
  const w = s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const g = new Set();
  for (let i = 0; i + 5 <= w.length; i++) g.add(w.slice(i, i + 5).join(" "));
  return g;
};
/** ★ **산문만 본다** — 표의 숫자와 캡션은 자료와 UI 이지 글이 아니다. 표까지 넣으면
 *  겹침이 낮게 나와(숫자는 다 다르다) 검사가 **헛돈다**. */
const prose = new Map();
for (const [d, p] of pages) {
  const blocks = [...p.html.matchAll(/<section class="prose-doc[^"]*"[^>]*>([\s\S]*?)<\/section>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, " ")).join(" ");
  prose.set(d, grams(blocks));
}
const keys = [...prose.keys()];
const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); };
const sample = [];
for (let i = 0; i < keys.length; i++)
  for (let j = i + 1; j < keys.length; j += 7) sample.push([keys[i], keys[j], jac(prose.get(keys[i]), prose.get(keys[j]))]);
sample.sort((a, b) => a[2] - b[2]);
const median = sample[Math.floor(sample.length / 2)][2];
const worst = sample[sample.length - 1];
if (median > MEDIAN_MAX) fail.push(`본문 겹침 중앙 ${(median * 100).toFixed(1)}% — 상한 ${(MEDIAN_MAX * 100).toFixed(0)}%. 설명을 낱장마다 되풀이하고 있다`);
if (worst[2] > PAIR_MAX) fail.push(`${worst[0]}↔${worst[1]} 겹침 ${(worst[2] * 100).toFixed(1)}% — 상한 ${(PAIR_MAX * 100).toFixed(0)}%`);
note(`${sample.length}쌍 · 중앙 ${(median * 100).toFixed(1)}% · 최대 ${(worst[2] * 100).toFixed(1)}% (${worst[0]}↔${worst[1]})`);

/* ── ④-2 **심사자가 읽는 것**으로 다시 잰다 ──────────────────
   ★★★ 2026-09-20 에 ④ 가 **절반만 보고 있었다는 것**을 알았다(애드센스 관점 실측).
     두 가지가 시야 밖이었다.
     ① **자리** — ④ 는 `<section class="prose-doc">` 안만 본다. 그런데 각 구획의 설명 문단
        (「Emission probability is how often a line appears…」, 「Solved for this nuclide's whole
        photon spectrum…」, 「What this page does not tell you」의 항목들)은 **그 바깥**에 있다.
        prose-doc 156어 · 본문 전체 산문 326어 — **절반이 안 보였다.**
     ② **자** — ④ 의 `grams()` 는 `[^a-z0-9 ]` 라 **숫자를 남긴다.** 핵종마다 숫자가 다르니
        겹침이 씻겨 내려간다. 그런데 **심사자는 숫자가 아니라 문장을 읽는다.**
        같은 쪽을 두 자로 재면 숫자 포함 9.9% · 숫자 제외 31.9%로 갈렸다.
   ★★ **④ 를 고치지 않고 나란히 둔다.** ④ 는 「자료가 실제로 다른가」를 재고(그것도 필요하다),
     ④-2 는 「설명을 되풀이하는가」를 잰다. **두 질문은 다른 질문이다.**
   ★★★ 머릿수는 **되풀이 몫**이다 — 「그 쪽 산문 중 절반 이상의 다른 낱장에도 나오는 몫」.
     쌍끼리의 겹침보다 읽는 사람의 경험에 가깝다: 한 장을 열었을 때 **몇 할이 남의 쪽에서 본
     문장인가**. 2026-09-20 실측 **중앙 66.4% · 최악 80.6%**(6구획 쪽이 76.1%로 가장 심하다).
   ★ 아래 상한은 **래칫**이다 — 지금 값에 맞춰 두어 **나빠지는 것만** 막는다.
     되풀이를 허브로 옮긴 뒤 이 수들을 함께 내린다. **고치기 전 값을 박아 두는 것**이 요점이다. */
console.log("\n④-2 심사자가 읽는 것 — 산문 전체 · 숫자 제외 · 제목 틀");
const BOILER_MEDIAN_MAX = 0.30;   // 되풀이 몫 중앙 (2026-09-20 ③ 뒤 실측 0.279)
const BOILER_WORST_MAX  = 0.42;   // 한 장의 되풀이 몫 (실측 0.388, cd-109)
const WORDS_MEDIAN_MAX  = 0.19;   // 숫자 뺀 낱말 겹침 중앙 (실측 0.166)
const NEAR_DUP_MAX      = 3;   // 낱말 겹침 95% 이상인 쌍의 수 (실측 2)
const HEAD_MEDIAN_MAX   = 0.24;   // 제목 틀 겹침 중앙 (2026-09-20 ④ 뒤 실측 0.200)

/** 본문 산문만 — 표의 숫자와 곁칸은 글이 아니다. `<p>` 만 든다. */
/** ★★ `<p>` 만 세던 첫 판에 **같은 종류의 사각**이 있었다(2026-09-20, ④ 를 흉본 자리에서
 *  똑같이 밟았다). 147장의 「What this page does not tell you」는 `<li>` 목록이라
 *  **한 번도 세지 않았다** — 일반 경고 세 줄이 글자까지 같게 서 있는 동안 게이트는 초록이었다.
 *  ★ 그렇다고 `<li>` 를 통째로 넣으면 안 된다 — 거기엔 **링크 라벨**도 있다
 *    (「Decay and half-life」·「Mass and activity」). 그것은 UI 이고 147장에서 같은 것이
 *    **정상**이다. 넣으면 게이트가 영영 빨갛고, 늘 빨간 게이트는 없는 게이트다.
 *  ★ 실측으로 갈랐다 — 낱장의 `<li>` 어수 분포는 **3·5 어(라벨 572건)와 25~38 어(산문 502건)**
 *    둘뿐이고 **그 사이가 완전히 비어 있다.** 12 어는 그 20어짜리 빈 골짜기 한가운데다
 *    (경계에 걸리는 항목이 0건이므로 글꼴·문구가 조금 바뀌어도 흔들리지 않는다). */
const LI_PROSE_MIN_WORDS = 12;
const proseAll = (main) => {
  const x = main.replace(/<aside[\s\S]*?<\/aside>/gi, " ").replace(/<table[\s\S]*?<\/table>/gi, " ")
                .replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  const txt = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
  const ps = [...x.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => txt(m[1]));
  const lis = [...x.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => txt(m[1]))
    .filter((t) => t.trim().split(/\s+/).filter(Boolean).length >= LI_PROSE_MIN_WORDS);
  return [...ps, ...lis].join(" ");
};
/** ★ 숫자를 **버린다** — 남기면 핵종마다 다른 수가 겹침을 씻어 내려 검사가 헛돈다. */
const wordList = (s) => s.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter(Boolean);
const wordGrams = (w, n = 5) => {
  const g = []; for (let i = 0; i + n <= w.length; i++) g.push(w.slice(i, i + n).join(" ")); return g;
};
/** 제목에서 그 핵종을 지운다 — 남는 것이 「틀」이다. */
const headSkeleton = (main, d) => {
  const sym = d.split("-")[0], a = d.split("-")[1] ?? "";
  return [...main.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, " ").toLowerCase()
      .replace(new RegExp(`\\b${sym}\\w*[- ]?${a}\\w*\\b`, "g"), "x")
      .replace(/[0-9]+/g, "#").replace(/\s+/g, " ").trim())
    .filter(Boolean);
};

const gramList = new Map(), gramSet = new Map(), heads = new Map();
for (const [d, p] of pages) {
  const g = wordGrams(wordList(proseAll(p.main)));
  gramList.set(d, g); gramSet.set(d, new Set(g));
  heads.set(d, new Set(headSkeleton(p.main, d)));
}
/* 되풀이 몫 — 각 5어절이 몇 장에 나오는지 세고, 절반 이상에 나오는 것의 비중을 잰다. */
const freq = new Map();
for (const g of gramSet.values()) for (const x of g) freq.set(x, (freq.get(x) ?? 0) + 1);
const half = keys.length / 2;
const boiler = keys.map((d) => {
  const g = gramList.get(d);
  return { d, f: g.length ? g.filter((x) => freq.get(x) >= half).length / g.length : 0 };
}).sort((a, b) => a.f - b.f);
const bMed = boiler[Math.floor(boiler.length / 2)].f, bWorst = boiler[boiler.length - 1];

const wSample = [], hSample = [];
for (let i = 0; i < keys.length; i++)
  for (let j = i + 1; j < keys.length; j += 7) {
    wSample.push(jac(gramSet.get(keys[i]), gramSet.get(keys[j])));
    hSample.push(jac(heads.get(keys[i]), heads.get(keys[j])));
  }
wSample.sort((a, b) => a - b); hSample.sort((a, b) => a - b);
const wMed = wSample[Math.floor(wSample.length / 2)], hMed = hSample[Math.floor(hSample.length / 2)];
/* 거의 같은 쌍 — **전수**로 센다(표본이 아니다). 몇 쌍인지가 곧 위험의 크기다. */
let nearDup = 0; const dupNames = [];
for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
  if (jac(gramSet.get(keys[i]), gramSet.get(keys[j])) >= 0.95) {
    nearDup++; if (dupNames.length < 6) dupNames.push(`${keys[i]}↔${keys[j]}`);
  }
}
/** 147장 **전부**에 글자까지 같은 제목 틀 — 이웃 lab 이 걸린 바로 그 모양이다. */
const allHeads = [...heads.values()];
const universal = allHeads.length ? [...allHeads[0]].filter((h) => allHeads.every((s) => s.has(h))) : [];

if (bMed > BOILER_MEDIAN_MAX)
  fail.push(`④-2 되풀이 몫 중앙 ${(bMed * 100).toFixed(1)}% — 상한 ${(BOILER_MEDIAN_MAX * 100).toFixed(0)}%. 설명을 낱장마다 되풀이한다`);
if (bWorst.f > BOILER_WORST_MAX)
  fail.push(`④-2 ${bWorst.d} 의 되풀이 몫 ${(bWorst.f * 100).toFixed(1)}% — 상한 ${(BOILER_WORST_MAX * 100).toFixed(0)}%`);
if (wMed > WORDS_MEDIAN_MAX)
  fail.push(`④-2 낱말 겹침 중앙 ${(wMed * 100).toFixed(1)}% — 상한 ${(WORDS_MEDIAN_MAX * 100).toFixed(0)}%`);
if (nearDup > NEAR_DUP_MAX)
  fail.push(`④-2 낱말이 95% 이상 같은 쌍이 ${nearDup}쌍 — 상한 ${NEAR_DUP_MAX}쌍 (${dupNames.join(", ")})`);
if (hMed > HEAD_MEDIAN_MAX)
  fail.push(`④-2 제목 틀 겹침 중앙 ${(hMed * 100).toFixed(1)}% — 상한 ${(HEAD_MEDIAN_MAX * 100).toFixed(0)}%`);
/** ★★ 이때까지 `universal` 은 **세기만 하고 막지는 않았다.** 이웃 lab 이 애드센스에서
 *  탈락한 실측 원인이 바로 「장 제목이 **글자 그대로** 같고 본문만 달랐다」인데,
 *  그 모양을 **보고만 하고 통과시키고 있었다.** 재는 것과 막는 것은 다른 층이다.
 *  ★ 2026-09-20 에 넷을 걷어 0개로 만들었다 — 하나라도 되살아나면 그 자리에서 막는다. */
if (universal.length)
  fail.push(`④-2 147장 **전부**에 글자까지 같은 제목이 ${universal.length}개 — ${universal.map((h) => `「${h}」`).join(" ")}. 제목이 쪽마다 다른 것을 말해야 한다`);
note(`되풀이 몫 중앙 ${(bMed * 100).toFixed(1)}% · 최악 ${(bWorst.f * 100).toFixed(1)}% (${bWorst.d})`);
note(`낱말 겹침 중앙 ${(wMed * 100).toFixed(1)}% · 거의 같은 쌍 ${nearDup}쌍${dupNames.length ? ` (${dupNames.join(", ")})` : ""}`);
note(`제목 틀 중앙 ${(hMed * 100).toFixed(1)}% · 전 낱장 공통 제목 ${universal.length}개: ${universal.map((h) => `「${h}」`).join(" ")}`);

/* ── ⑤ 계산기 링크가 실제로 복원되는가 ───────────────────── */
console.log("\n⑤ 계산기 프리필이 실제로 복원되는가");
const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const PORT = srv.address().port;
const browser = await chromium.launch(LAUNCH);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
let checked = 0;
for (const [key, slug] of [["Co-60", "co-60"], ["Ir-192", "ir-192"], ["Sr-90", "sr-90"], ["Am-241", "am-241"], ["Tc-99m", "tc-99m"]]) {
  const p = pages.get(slug);
  /* ★★ **표식이 붙은 링크를 센다 — 「?s= 가 있는 링크」를 세면 안 된다.**
     역테스트에서 이 구멍을 실제로 밟았다: 프리필을 동작하지 않는 `?n=` 으로 되돌렸더니
     그 링크가 `?s=` 패턴에 안 걸려 **검사 대상에서 빠지고 게이트가 통과했다.**
     검사가 자기가 아는 것만 보면, 고장난 것은 늘 시야 밖에 있다. */
  const marked = [...p.main.matchAll(/<a[^>]*data-prefill="([^"]*)"[^>]*>/g)]
    .map((m) => ({ key: m[1], href: (m[0].match(/href="([^"]*)"/) || [, ""])[1].replace(/&amp;/g, "&") }));
  if (!marked.length) { fail.push(`${slug}: 프리필 표식이 붙은 링크가 0개다`); continue; }
  for (const L of marked) {
    if (L.key !== key) fail.push(`${slug}: 표식이 ${L.key} 인데 쪽은 ${key} 다`);
    if (!/\?s=/.test(L.href)) fail.push(`${slug}: 프리필 표식이 붙었는데 주소에 ?s= 가 없다 — ${L.href}`);
  }
  const links = marked.map((m) => m.href);
  /* ★ 표식 없는 **내부** 링크가 질의문자열을 달고 있으면 그것도 결함이다 —
     `?n=Co-60` 처럼 아무도 읽지 않는 인자를 달아 두면 눌러도 기본 핵종이 뜬다.
     ★★ 처음에 링크 전부를 봤다가 **공유 단추(X·Threads·LinkedIn·Facebook)가 걸렸다** —
       그쪽 질의인자는 남의 서비스가 읽는 것이고 우리가 읽을 것이 아니다. 내부만 본다. */
  for (const m of p.main.matchAll(/<a[^>]*href="(\/[^"]*\?[^"]*)"[^>]*>/g)) {
    const [tag, href] = [m[0], m[1].replace(/&amp;/g, "&")];
    if (!/data-prefill=/.test(tag) && !/\?s=/.test(href))
      fail.push(`${slug}: 읽는 코드가 없는 질의인자가 붙은 내부 링크 — ${href}`);
  }
  for (const href of links) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${href}`, { waitUntil: "networkidle" });
    await page.waitForSelector('button[aria-haspopup="listbox"] .num', { timeout: 8000 }).catch(() => {});
    const got = await page.evaluate(() => document.querySelector('button[aria-haspopup="listbox"] .num')?.textContent.trim() ?? null);
    if (got !== key) fail.push(`${slug} → ${href.split("/")[1]}: 화면 핵종 ${got} (기대 ${key})`);
    checked++;
    await page.close();
  }
}

/* ── ⑥ 목록 표를 가로로 밀어도 「어느 행인지」가 남는가 ──────── */
console.log("\n⑥ 목록 표 — 가로 스크롤과 고정 칸");
/** ★★ 계기(2026-09-16 소유주가 화면에서 잡았다). 148행을 390px 에 넣으려고 스크롤
 *  컨테이너에 두었더니, **오른쪽으로 밀면 핵종 이름 칸이 화면 밖으로 나가**
 *  「beta-minus decay · beta · —」만 남았다 — 그 줄은 아무 뜻이 없다.
 *  ★★ **기존 게이트가 구조적으로 못 본다** — 전부 스크롤 0 에서 잰다. 압축 고정 바에서
 *    이미 배운 것과 같다: **스크롤한 뒤에만 존재하는 것은 따로 재야 한다.**
 *  ★ 두 가지를 잰다 — ① 흔한 폭에서는 **가로 스크롤이 아예 없어야** 하고(칸을 줄여서 푼다)
 *    ② 그래도 스크롤이 생기는 좁은 폭(320px)에서는 **첫 칸이 끝까지 밀어도 보여야** 한다. */
const NO_SCROLL_AT = [360, 390, 700, 900, 1024, 1280];
for (const w of [320, ...NO_SCROLL_AT]) {
  const c = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await c.newPage();
  await page.goto(`http://127.0.0.1:${PORT}${BASE}/nuclides/`, { waitUntil: "networkidle" });
  const m = await page.evaluate(() => {
    const t = document.querySelector("table"); if (!t) return null;
    const box = t.closest(".pin-first") ?? t.parentElement;
    const cell = () => {
      const td = document.querySelector("tbody tr td:first-child");
      const r = td.getBoundingClientRect();
      return { text: td.textContent.trim(), left: Math.round(r.left), visible: r.right > 0 && r.left < innerWidth };
    };
    const over = box.scrollWidth - box.clientWidth;
    const before = cell();
    box.scrollLeft = box.scrollWidth;
    const after = cell();
    box.scrollLeft = 0;
    return { over, before, after, pos: getComputedStyle(document.querySelector("tbody tr td:first-child")).position };
  });
  if (!m) { fail.push(`${w}px: 목록 표를 못 찾았다`); await c.close(); continue; }
  if (NO_SCROLL_AT.includes(w) && m.over > 0)
    fail.push(`${w}px: 목록 표에 가로 스크롤 ${m.over}px — 이 폭에서는 칸을 줄여 없애기로 했다`);
  if (m.over > 0 && !m.after.visible)
    fail.push(`${w}px: 끝까지 밀면 첫 칸(${m.after.text})이 화면 밖이다 — 행이 무엇인지 알 수 없다`);
  if (m.over > 0 && m.pos !== "sticky")
    fail.push(`${w}px: 스크롤이 생기는데 첫 칸이 고정돼 있지 않다 (position: ${m.pos})`);
  note(`${String(w).padStart(4)}px  넘침 ${String(m.over).padStart(3)}px · 끝까지 민 뒤 첫 칸 「${m.after.text}」 ${m.after.visible ? "보임" : "안 보임"}`);
  await c.close();
}

await ctx.close(); await browser.close(); srv.close();
note(`${checked}개 링크를 눌러 확인`);

console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
  : `\n✅ 핵종 낱장 — ${dirs.length}장 · 깨진 숫자 0 · 감마 누출 0 · 본문 겹침 중앙 ${(median * 100).toFixed(1)}% · 프리필 ${checked}개 복원 · 목록 표 7폭`);
process.exit(fail.length ? 1 : 0);
