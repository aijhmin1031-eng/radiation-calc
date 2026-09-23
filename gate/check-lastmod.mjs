/**
 * 사이트맵 `lastmod` 게이트 — **적힌 날짜가 참인가**를 묻는다.
 * 판단의 정본은 `src/lib/lastmod.mjs` 머리말이고, 이 게이트는 그것이 지켜졌는지만 잰다.
 *
 * ★★ 막으려는 것은 「빠진 lastmod」가 아니라 **거짓 lastmod** 다 — 구글은 믿을 수 없는 값을
 *   무시하므로 하나가 거짓이면 **넣은 것 전부가 무효**가 된다. 무는 자리가 셋 —
 *   ① 실제 커밋에 있는 날짜인가 ② 미래가 아닌가 ③ **전 주소가 같은 날짜가 아닌가**.
 * ★ **깊은 클론에서만 전수를 요구한다** — 얕은 클론은 일부러 비우는 것이 정상이다.
 * ★ **못 보는 것**: 매핑이 엉뚱한 파일을 짚어도 그 날짜는 실제 커밋이라 통과한다. 눈으로 본다.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP = join(ROOT, "dist/calc/sitemap-0.xml");

const git = (a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
const shallow = git(["rev-parse", "--is-shallow-repository"]).trim() === "true";

const xml = readFileSync(SITEMAP, "utf8");
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: /<loc>(.*?)<\/loc>/.exec(m[1])?.[1] ?? "",
  lastmod: /<lastmod>(.*?)<\/lastmod>/.exec(m[1])?.[1] ?? null,
}));

const commitTimes = new Set(git(["log", "--format=%cI"]).trim().split("\n").map((d) => Date.parse(d)));
const fail = [];
const dated = entries.filter((e) => e.lastmod);
const now = Date.now();

for (const e of dated) {
  const t = Date.parse(e.lastmod);
  if (Number.isNaN(t)) { fail.push(`${e.loc}: lastmod 를 날짜로 읽을 수 없다 — ${e.lastmod}`); continue; }
  if (t > now) fail.push(`${e.loc}: lastmod 가 미래다 — ${e.lastmod}`);
  if (!commitTimes.has(t))
    fail.push(`${e.loc}: 실제 커밋에 없는 날짜다 — ${e.lastmod} (빌드 시각을 박았거나 지어냈다)`);
}

const distinct = new Set(dated.map((e) => e.lastmod));
if (dated.length > 1 && distinct.size === 1)
  fail.push(`전 주소가 같은 lastmod 다(${[...distinct][0]}) — 「전부 방금 바뀌었다」는 거짓말이다`);

if (!shallow && dated.length !== entries.length) {
  const miss = entries.filter((e) => !e.lastmod).map((e) => e.loc);
  fail.push(`깊은 클론인데 lastmod 없는 주소가 ${miss.length}개 — 매핑에 새 라우트를 안 넣었다:\n    ${miss.slice(0, 10).join("\n    ")}`);
}

if (fail.length) {
  console.error("check-lastmod   ❌\n  - " + fail.join("\n  - "));
  process.exit(1);
}
console.log(
  `check-lastmod   ✅ 사이트맵 lastmod 점검 통과 — 주소 ${entries.length}개 중 날짜 ${dated.length}개` +
    ` · 서로 다른 날짜 ${distinct.size}종 · 실제 커밋과 대조 전수 일치 · 미래 0건` +
    ` · 클론 ${shallow ? "얕음(경계보다 오래된 것은 일부러 비운다)" : "깊음(전수 요구)"}`,
);
