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
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
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
await ctx.close(); await browser.close(); srv.close();
note(`${checked}개 링크를 눌러 확인`);

console.log(fail.length ? `\n❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
  : `\n✅ 핵종 낱장 — ${dirs.length}장 · 깨진 숫자 0 · 감마 누출 0 · 본문 겹침 중앙 ${(median * 100).toFixed(1)}% · 프리필 ${checked}개 복원`);
process.exit(fail.length ? 1 : 0);
