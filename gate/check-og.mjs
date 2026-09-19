/** 공유 이미지 점검 — **커밋된 산출물은 반드시 낡는다.**
 *  그림에 제목이 구워져 있으므로 제목을 고치면 그림이 어긋난다. 매니페스트에 적어 둔
 *  그때의 제목과 **지금 산출물의 제목**을 대조하고, 파일이 실제로 있는지 본다. */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist/calc", BASE = "/calc";
const stripBase = (p) => (p === BASE ? "/" : p.startsWith(BASE + "/") ? p.slice(BASE.length) : p);
const manifest = JSON.parse(readFileSync("src/data/og-manifest.json", "utf8"));
const fail = [];

if (!existsSync(join(DIST, "sitemap-0.xml"))) { console.error("❌ dist 가 없다 — 먼저 npm run build"); process.exit(1); }
const paths = [...readFileSync(join(DIST, "sitemap-0.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => stripBase(new URL(m[1]).pathname));

for (const p of paths) {
  const e = manifest[p];
  if (!e) { fail.push(`${p}: 매니페스트에 없다 — npm run make-og 를 돌릴 것`); continue; }
  const f = join(DIST, p === "/" ? "index.html" : p.replace(/^\//, ""), "index.html");
  const html = readFileSync(f.replace(/index\.html[\\/]index\.html$/, "index.html"), "utf8");
  /* ★★ **`make-og` 와 같은 정규화를 써야 한다**(2026-09-19에 잡았다). 제목에 아포스트로피가
     들어간 쪽이 처음 생기자, 산출 HTML 은 `&#39;` 로 이스케이프하는데 `make-og` 는 그것을
     풀어 매니페스트에 넣고 이쪽은 안 풀어 **「제목이 바뀌었다」가 영영 떴다.**
     같은 파일을 읽어도 **읽는 법이 다르면 다른 값**이다 — 비교하는 두 자리는 한 함수를 쓴다. */
  const unescape = (x) => x.replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  const now = unescape(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  if (now !== e.title) fail.push(`${p}: 제목이 바뀌었는데 그림이 그대로다\n       구울 때 「${e.title}」\n       지금  「${now}」`);
  if (!existsSync(join("public/og", `${e.slug}.png`))) fail.push(`${p}: public/og/${e.slug}.png 이 없다`);
  if (!html.includes(`/og/${e.slug}.png`)) fail.push(`${p}: 쪽이 자기 그림(${e.slug}.png)을 가리키지 않는다`);
}
/* 사이트맵 밖(noindex)인 쪽도 그림을 가리켜야 한다 — 없으면 홈 카드로 받는다. */
for (const f of readdirSync(DIST, { withFileTypes: true, recursive: true })
  .filter((d) => d.isFile() && d.name === "index.html")
  .map((d) => join(d.parentPath ?? d.path, d.name))) {
  const html = readFileSync(f, "utf8");
  if (!/property="og:image"/.test(html)) fail.push(`${relative(DIST, f)}: og:image 가 없다`);
}
console.log(fail.length ? `❌ ${fail.length}건\n` + fail.map((x) => "   " + x).join("\n")
  : `✅ 공유 이미지 — ${paths.length}쪽 대조(제목·파일·참조) · 전 쪽 og:image 있음`);
process.exit(fail.length ? 1 : 0);
