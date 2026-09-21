/**
 * 애드센스 관점 실측 게이트 — `npm run check-adsense` (`dist/calc/` 를 읽는다).
 *
 * ★★★ **왜 이 lab 에도 필요한가**(2026-09-21 소유주 질의 「애드센스 승인 … 우린 가능할까」).
 *   이 게이트는 그동안 **RadiMeter 에만** 있었고 거기 33쪽만 쟀다. 그런데 애드센스가 보는
 *   것은 lab 하나가 아니라 **도메인 전체**이고, `radiation-lab.com` 의 색인 쪽 약 213개 중
 *   **166개가 이 lab, 그중 147개가 핵종 낱장**이다. 즉 **심사자가 보는 것의 69%를 어떤
 *   게이트도 이 관점에서 본 적이 없었다.** 「콘텐츠 통과 수준」이라는 판정은 도메인의
 *   6분의 1에 대한 판정이었다.
 *   ★ 교훈: **게이트의 시야를 「내 저장소」로 잡으면, 심사자의 시야와 어긋난다.**
 *
 * ★★ **여기서 가장 위험한 것은 핵종 낱장 147장**이다 — DB 에서 뽑아 틀에 끼운 글로 읽히면
 *   그것이 정확히 「low value content」다. 이웃 사이트가 애드센스에서 실제로 탈락한 원인이
 *   그것이었고(장 제목 7개가 글자 그대로 같고 본문만 달랐다), **문장 겹침 검사는 그것을
 *   낮게 채점한다.** 그래서 ③(문장)과 ③-2(제목의 뼈대)를 따로 잰다.
 *
 * 재는 것
 *   ① 승인 전에 있으면 안 되는 **광고 원천 0** · 밝히지 않은 제3자
 *   ② 본문 분량 — 층마다 다른 것을 묻는다(읽을 글은 어수 · 허브는 자식 수)
 *   ③ 되풀이 — 제목·설명 중복 · 8어절 겹침
 *   ③-2 **뼈대 되풀이** — 계열 안에서 제목 순서·집합이 같은가
 *   ④ 필수 문서 — 이 lab 에는 면책만 있고 나머지는 **플랫폼 층**에 있다. 그래서
 *      「이 저장소에 파일이 있는가」가 아니라 **「모든 쪽에서 닿는가」**를 묻는다
 *
 * ★ 네트워크를 쓰지 않는다 — 프록시가 거짓말을 하므로 산출물의 **선언**을 읽는다.
 *   RadiMeter 의 `web/scripts/check-adsense.mjs` 와 **같은 자**를 쓴다(8어절 자카드,
 *   상한 25% · 제목 집합 상한 55%). 자가 다르면 두 lab 의 숫자를 나란히 놓을 수 없다.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = new URL("../dist/calc/", import.meta.url).pathname.replace(/\/$/, "");
const BASE = "/calc";
const stripBase = (p) => (p === BASE ? "/" : p.startsWith(BASE + "/") ? p.slice(BASE.length) : p);

if (!existsSync(DIST)) {
  console.error(`❌ ${DIST} 가 없다 — 먼저 npm run build`);
  process.exit(1);
}

const THIN_WORDS = 250;      // 색인 쪽의 본문 어수 하한
const HUB_CHILDREN = 3;      // 허브가 데려가야 하는 자식 최소 수
const DUP_JACCARD = 0.25;    // 쪽 사이 8어절 겹침 상한
const HEAD_JACCARD = 0.55;   // 같은 계열 두 쪽의 제목 집합 겹침 상한
/** ★★★ **문턱을 무르게 하는 대신, 이유를 적은 예외를 둔다**(2026-09-21).
 *  Cs-137 의 선량률은 **전부 딸핵종 Ba-137m 의 662 keV 에서 나온다** — 두 낱장의 광자표·
 *  차폐표가 숫자까지 같은 것은 **같은 광자이기 때문**이고, 글을 어떻게 고쳐도 달라지지 않는다.
 *  ★ 상한(25%)을 올려 이 한 쌍을 덮으면 **147장 전체의 문턱이 내려간다** — 다음번 진짜
 *    되풀이가 조용히 통과할 자리를 만드는 것이다. 예외는 **쌍으로, 이유와 함께** 둔다.
 *  ★ 그리고 **예외가 낡으면 걸린다**(아래) — 안 그러면 예외가 영영 남아 감시를 먹는다. */
const TWINS = [
  ["/nuclides/ba-137m/", "/nuclides/cs-137/",
   "모녀 — Cs-137 의 광자는 전부 Ba-137m 의 662 keV 이므로 두 쪽의 스펙트럼이 같은 것이 맞다"],
];
const twinReason = (a, b) =>
  (TWINS.find(([x, y]) => (x === a && y === b) || (x === b && y === a)) || [])[2];
/** 승인 전에 있으면 안 되는 광고 원천. */
const AD_HOSTS = ["pagead2.googlesyndication.com", "googleads.g.doubleclick.net", "adservice.google.com"];
/** 이 lab 이 부르는 것으로 **밝혀져 있는** 바깥 원천. 늘리려면 플랫폼 개인정보 문서
 *  (`/radimeter/privacy/`, 정본은 `web/src/lib/third-parties.ts`)에 **먼저** 적는다. */
const DECLARED = [/\.supabase\.co$/, /^accounts\.google\.com$/];
/** 플랫폼 층의 법무 문서. 이 lab 에는 면책만 살고 나머지는 RadiMeter 밑에 산다 —
 *  **한 오리진이므로 그것이 맞는 구조**이고, 물어야 하는 것은 「닿는가」다. */
const REQUIRED_LINKS = ["/calc/disclaimer/", "/radimeter/privacy/", "/radimeter/terms/", "/radimeter/contact/"];

function walk(d, out = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const htmlFiles = walk(DIST).filter((f) => f.endsWith(".html"));

/* 사이트맵이 「색인 대상」의 정본이다 — dist 의 파일 수가 아니다. */
const indexed = new Set();
for (const f of readdirSync(DIST).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
  for (const m of readFileSync(join(DIST, f), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) {
    indexed.add(stripBase(new URL(m[1]).pathname));
  }
}

const strip = (s) =>
  s.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
   .replace(/<!--[\s\S]*?-->/g, " ")
   .replace(/<[^>]+>/g, " ")
   .replace(/&[a-z#0-9]+;/gi, " ")
   .replace(/\s+/g, " ")
   .trim();
const words = (s) => { const t = strip(s); return t ? t.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length : 0; };
const grab = (h, re) => (h.match(re) || [, ""])[1].trim();

/** ★★ **되풀이되는 껍데기를 `<main>` 안에서 다시 걷어낸다**(2026-09-21).
 *  RadiMeter 는 내비·푸터가 `<main>` 밖이라 `<main>` 하나로 충분했다. 이 lab 은 **공유 줄과
 *  출처 한 줄이 `<main>` 안에** 있어서, 그대로 세면 ① 어수가 쪽마다 20~30어씩 부풀고
 *  ② **147장이 서로 겹치는 것으로 잡힌다** — 실제로 Cs-137 ↔ Ba-137m 의 겹치는 덩어리 다섯 중
 *  하나가 「computed from the iaea … share copy link x threads linkedin facebook」이었다.
 *  ★ 이것은 문턱을 무르게 하는 것이 아니라 **RadiMeter 와 같은 것을 재게 맞추는 것**이다.
 *    그 문서의 규칙 그대로다 — 「되풀이되는 껍데기는 심사자가 값어치로 세지 않는 바로 그것이다」. */
const CHROME = [
  /<div[^>]*class=["'][^"']*\bshare\b[^"']*["'][\s\S]*?<\/div>/gi,
  /<p[^>]*>\s*Computed from the IAEA[\s\S]*?<\/p>/gi,
  /* ★ 표의 **열 이름**도 껍데기다 — 「Material · HVL (mm) · TVL (mm)」는 147장에 그대로 서고,
     그것이 서 있는 것이 맞다. 세면 참고 자료 묶음이 저희끼리 베낀 것으로 잡힌다.
     ★ **`<tbody>` 는 남긴다** — 거기 값이 이 쪽의 자료이고, 두 쪽의 값이 같다면 그것은
       실제로 같은 것이므로 잡혀야 한다(Cs-137 과 Ba-137m 이 그런 경우다). */
  /<thead[\s\S]*?<\/thead>/gi,
];
const body = (m) => CHROME.reduce((acc, re) => acc.replace(re, " "), m);

const pages = [];
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  const path = "/" + relative(DIST, f).replace(/index\.html$/, "").replace(/\\/g, "/");
  pages.push({
    path, html,
    redirect: /http-equiv=["']refresh/i.test(html),
    noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html),
    indexed: indexed.has(path),
    title: grab(html, /<title>([\s\S]*?)<\/title>/i),
    desc: grab(html, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i),
    main: body((html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [, ""])[1]),
  });
}
const idx = pages.filter((p) => p.indexed);
const fail = [];

/** ★★★ **빈 측정이 통과하면 게이트가 아니다**(2026-09-21, 실제로 두 번 그랬다).
 *  Astro 는 쪽 하나가 던지면 **거기서 멈추고 dist 를 반쯤 남긴다.** 산출물을 읽는 이 게이트는
 *  그 반쪽을 그대로 재서 **「색인 0쪽 · 본문 0어 · 중복 0 · ✅ 통과」**를 찍었다 —
 *  모든 검사가 「나쁜 것이 몇 건인가」를 묻는데, 볼 것이 없으면 그 답이 전부 0 이기 때문이다.
 *  ★ **「무엇이 있는가」만 묻는 검사는 「아무것도 없는 것」을 못 본다.** 그래서 바닥을 건다.
 *    숫자는 쪽이 늘 때마다 낡지 않도록 **아주 낮게** 둔다 — 이것은 분량 검사가 아니라
 *    **「빌드가 온전한가」** 검사다(분량은 ②가 잰다). */
const FLOOR_PAGES = 100;   // 핵종 낱장만 147장이다. 100 아래면 빌드가 죽은 것이다
if (idx.length < FLOOR_PAGES) {
  console.error(`❌ 색인 쪽이 ${idx.length}개다(바닥 ${FLOOR_PAGES}) — dist 가 온전하지 않다. ` +
                `npm run build 가 중간에 죽지 않았는지 볼 것.`);
  process.exit(1);
}

/* ── ① 바깥 원천 ─────────────────────────────────────────────────────────────── */
console.log("① 바깥 원천");
const auto = new Map(), clicked = new Map();
for (const p of pages) {
  for (const m of p.html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*?\b(?:href|src)=["'](https?:\/\/[^"']+)["']/gi)) {
    let host; try { host = new URL(m[2]).host; } catch { continue; }
    if (/(^|\.)radiation-lab\.com$/.test(host)) continue;
    /* ★ `<a href>` 는 **사람이 눌러야** 나간다 — 쪽을 열었다고 IP 가 새지 않는다.
       자동으로 불리는 것(`<script src>` 등)과 같은 칸에 세면 공유 링크가 결함이 된다. */
    const bag = m[1].toLowerCase() === "a" || m[1].toLowerCase() === "area" ? clicked : auto;
    if (!bag.has(host)) bag.set(host, p.path);
  }
}
const ads = [...auto.keys()].filter((h) => AD_HOSTS.includes(h));
const undeclared = [...auto.keys()].filter((h) => !DECLARED.some((re) => re.test(h)));
console.log(`   자동으로 부르는 바깥 원천 ${auto.size}곳${auto.size ? " — " + [...auto.keys()].join(" · ") : ""}`);
console.log(`   눌러야 나가는 곳 ${clicked.size}곳${clicked.size ? " — " + [...clicked.keys()].join(" · ") : ""} (결함 아님)`);
console.log(`   광고 스크립트 ${ads.length}곳 (승인 전에는 0 이 맞다)`);
for (const h of undeclared) fail.push(`밝히지 않은 바깥 원천 — ${h} (${auto.get(h)})`);
for (const h of ads) fail.push(`승인 전인데 광고 원천이 있다 — ${h}`);

/* ── ② 본문 분량 ─────────────────────────────────────────────────────────────── */
const footerHtml = (pages.find((p) => p.path === "/")?.html.match(/<footer[\s\S]*?<\/footer>/i) || [""])[0];
const UTILITY = new Set([...footerHtml.matchAll(/href=["'](\/[^"'#?]*\/)["']/g)].map((m) => stripBase(m[1])));
for (const p of idx) {
  p.words = words(p.main);
  p.childLinks = new Set(
    [...p.main.matchAll(/href=["'](\/[^"'#?]*\/)["']/g)]
      .map((m) => stripBase(m[1]))
      .filter((h) => h !== p.path && h.startsWith(p.path)),
  ).size;
  p.layer = UTILITY.has(p.path) ? "법무·유틸" : p.childLinks >= HUB_CHILDREN ? "허브" : "읽을 글";
}
const read = idx.filter((p) => p.layer === "읽을 글");
const hubs = idx.filter((p) => p.layer === "허브");
const thin = read.filter((p) => p.words < THIN_WORDS).sort((a, b) => a.words - b.words);
const total = idx.reduce((s, p) => s + p.words, 0);
console.log("\n② 본문 분량 (`<main>` 만)");
console.log(`   색인 ${idx.length}쪽 · 합계 ${total.toLocaleString("en-US")}어 · 평균 ${Math.round(total / idx.length)}어`);
console.log(`   층: 읽을 글 ${read.length} · 허브 ${hubs.length} · 법무·유틸 ${idx.length - read.length - hubs.length}`);
console.log(`   읽을 글 중 가장 얇은 셋: ${read.slice().sort((a, b) => a.words - b.words).slice(0, 3)
  .map((p) => `${p.path}(${p.words}어)`).join(" · ")}`);
for (const p of thin) fail.push(`읽을 글이 얇다 — ${p.path} ${p.words}어(하한 ${THIN_WORDS})`);
for (const p of hubs.filter((p) => p.childLinks < HUB_CHILDREN)) fail.push(`허브가 비었다 — ${p.path}`);

/* ── ③ 되풀이 ────────────────────────────────────────────────────────────────── */
const byTitle = new Map(), byDesc = new Map();
for (const p of idx) {
  if (p.title) (byTitle.get(p.title) || byTitle.set(p.title, []).get(p.title)).push(p.path);
  if (p.desc) (byDesc.get(p.desc) || byDesc.set(p.desc, []).get(p.desc)).push(p.path);
}
const dupT = [...byTitle.entries()].filter(([, v]) => v.length > 1);
const dupD = [...byDesc.entries()].filter(([, v]) => v.length > 1);
const noDesc = idx.filter((p) => !p.desc);

function shingles(t, n = 8) {
  const w = t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}
const sh = new Map(idx.map((p) => [p.path, shingles(strip(p.main))]));
let worst = { j: 0, a: "", b: "" }, sum = 0, n = 0;
const overlaps = [];
for (let i = 0; i < idx.length; i++) for (let k = i + 1; k < idx.length; k++) {
  const a = sh.get(idx[i].path), b = sh.get(idx[k].path);
  if (!a.size || !b.size) continue;
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  const j = inter / (a.size + b.size - inter);
  sum += j; n++;
  if (j > worst.j) worst = { j, a: idx[i].path, b: idx[k].path };
  if (j > DUP_JACCARD) overlaps.push([j, idx[i].path, idx[k].path]);
}
console.log("\n③ 되풀이");
console.log(`   중복 제목 ${dupT.length}건 · 중복 설명 ${dupD.length}건 · 설명 누락 ${noDesc.length}건`);
console.log(`   ${n.toLocaleString("en-US")}쌍 — 평균 ${(sum / n * 100).toFixed(1)}% · 최대 ${(worst.j * 100).toFixed(1)}% ` +
            `(${worst.a} ↔ ${worst.b}) · 상한 ${DUP_JACCARD * 100}% 넘는 쌍 ${overlaps.length}건`);
for (const [t, v] of dupT) fail.push(`중복 제목 "${t}" ×${v.length} — ${v.slice(0, 4).join(", ")}`);
for (const [, v] of dupD) fail.push(`중복 설명 — ${v.slice(0, 4).join(", ")}`);
for (const p of noDesc) fail.push(`설명 누락 — ${p.path}`);
overlaps.sort((x, y) => y[0] - x[0]);
const left = overlaps.filter(([, a, b]) => !twinReason(a, b));
for (const [j, a, b] of left.slice(0, 8))
  fail.push(`쪽이 서로 ${(j * 100).toFixed(1)}% 겹친다 — ${a} ↔ ${b}`);
if (left.length > 8) fail.push(`… 상한을 넘는 쌍이 ${left.length}건이다(위는 가장 심한 여덟)`);
for (const [a, b, why] of TWINS) {
  const hit = overlaps.find(([, x, y]) => (x === a && y === b) || (x === b && y === a));
  if (hit) console.log(`   ↳ 예외 ${(hit[0] * 100).toFixed(1)}% — ${a} ↔ ${b}: ${why}`);
  /** ★ **낡은 예외는 결함이다.** 글이 갈라져 상한 아래로 내려왔는데 예외가 남아 있으면,
   *  그 예외는 다음번 진짜 겹침을 조용히 덮는다. 그래서 「이제 필요 없다」도 걸리게 한다. */
  else fail.push(`예외가 낡았다 — ${a} ↔ ${b} 는 이제 상한 아래다. TWINS 에서 지울 것`);
}

/* ── ③-2 뼈대 되풀이 ─────────────────────────────────────────────────────────── */
const FAMILIES = [
  ["핵종 낱장", /^\/nuclides\/[a-z0-9-]+\/$/],
  ["검증 문서", /^\/validation\/[a-z0-9-]+\/$/],
];
console.log("\n③-2 뼈대 되풀이 (제목의 계열 — 「틀에 숫자만 갈아 끼운 글」을 잡는다)");
for (const [name, re] of FAMILIES) {
  const set = idx.filter((p) => re.test(p.path));
  if (set.length < 2) { console.log(`   ${name}: ${set.length}쪽 — 비교 대상 없음`); continue; }
  for (const p of set)
    p.heads = [...p.main.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => `H${m[1]}:${strip(m[2])}`);
  /** ★★★ **이름을 지우고 센다**(2026-09-21). 그전 판은 제목을 **글자 그대로** 비교했고,
   *  낱장의 마지막 제목이 핵종 이름을 들어(`… calculators for Cs-137`) **순서가 늘 갈렸다** —
   *  그래서 「순서가 같은 묶음 0건」이라고 말했는데, **실제로는 147장 중 136장이 20개 묶음**
   *  이었고 가장 큰 묶음이 26장이었다. **한 줄이 검사를 통째로 속인 것이다.**
   *  RadiMeter 쪽 게이트도 같은 구멍을 갖고 있다 — 거기는 계열이 작아 아직 안 드러났다.
   *  ★ 지우는 것은 **주소에서 뽑은 그 쪽의 이름**뿐이다(`cs-137` · `Cs-137` · `Cs 137`).
   *    본문의 다른 낱말은 건드리지 않는다. */
  const sigs = new Map();
  for (const p of set) {
    const slug = p.path.replace(/\/$/, "").split("/").pop() || "";
    const spaced = slug.replace(/-/g, "[ -]?");
    const re = slug ? new RegExp(spaced, "gi") : null;
    const k = p.heads.map((h) => (re ? h.replace(re, "<N>") : h)).join(" | ");
    if (!sigs.has(k)) sigs.set(k, []);
    sigs.get(k).push(p.path);
  }
  const same = [...sigs.values()].filter((v) => v.length > 1);
  const covered = same.reduce((a, v) => a + v.length, 0);
  if (same.length)
    console.log(`   ↳ 이름을 지우면 같은 묶음 ${same.length}건이 ${covered}/${set.length}쪽을 덮는다` +
                ` (가장 큰 묶음 ${Math.max(...same.map((v) => v.length))}쪽)`);
  let w2 = { j: 0, a: "", b: "" }, s2 = 0, n2 = 0;
  for (let i = 0; i < set.length; i++) for (let k = i + 1; k < set.length; k++) {
    const a = new Set(set[i].heads), b = new Set(set[k].heads);
    if (!a.size || !b.size) continue;
    let inter = 0; for (const x of a) if (b.has(x)) inter++;
    const j = inter / (a.size + b.size - inter);
    s2 += j; n2++;
    if (j > w2.j) w2 = { j, a: set[i].path, b: set[k].path };
  }
  console.log(`   ${name} ${set.length}쪽 — 제목 순서가 같은 묶음 ${same.length}건 · ` +
              `제목 집합 겹침 평균 ${(s2 / n2 * 100).toFixed(1)}% · 최대 ${(w2.j * 100).toFixed(1)}%` +
              (w2.a ? ` (${w2.a} ↔ ${w2.b})` : ""));
  for (const v of same)
    fail.push(`${name}에서 **제목 순서가 글자 그대로 같은** 쪽 ${v.length}건 — ${v.slice(0, 4).join(", ")}. ` +
              `틀에 값만 갈아 끼운 글로 읽힌다(이웃 사이트가 이것으로 탈락했다)`);
  if (w2.j > HEAD_JACCARD)
    fail.push(`${name}의 두 쪽이 제목을 ${(w2.j * 100).toFixed(1)}% 공유한다(상한 ${HEAD_JACCARD * 100}%) — ${w2.a} ↔ ${w2.b}`);
}

/* ── ④ 법무 문서에 닿는가 ────────────────────────────────────────────────────── */
console.log("\n④ 법무 문서 — 이 lab 은 면책만 들고 나머지는 플랫폼 층에 있다");
const rendered = pages.filter((p) => !p.redirect && !p.noindex);
for (const link of REQUIRED_LINKS) {
  const missing = rendered.filter((p) => !p.html.includes(`href="${link}"`));
  console.log(`   ${link} — ${rendered.length - missing.length}/${rendered.length}쪽에서 닿음`);
  if (missing.length)
    fail.push(`${link} 에 안 닿는 쪽 ${missing.length}건 — ${missing.slice(0, 3).map((p) => p.path).join(", ")}`);
}

if (fail.length) {
  console.error(`\n❌ 애드센스 관점 결함 ${fail.length}건`);
  fail.forEach((f) => console.error("   " + f));
  process.exit(1);
}
console.log(`\n✅ 애드센스 관점 점검 통과 — 색인 ${idx.length}쪽 · 본문 ${total.toLocaleString("en-US")}어 · ` +
            `밝히지 않은 원천 0 · 얇은 읽을 글 0 · 중복 0 · 같은 뼈대 0 · 법무 문서 전 쪽에서 닿음 · 광고 0`);
