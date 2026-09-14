/** 저장 기능의 **말과 행동이 맞는가** — 있다고 말하면 실제로 있어야 한다.
 *
 *  ★★ 계기(2026-09-14 소유주 지적 「saved 이거 제대로 작동해??? 저장버튼이 없는데??」).
 *    환경변수가 없으면 `SaveBar` 가 조용히 사라지는데 **머리글의 `Saved` 칸과 낱장의 설명은
 *    그대로 남아** 있었다. 라이브에서 도구 쪽 저장 조작부가 **0개**인 채로, 낱장은
 *    「저장하면 RC-GAM-20260914-0001 같은 참조번호가 붙는다」고 자세히 설명하고 있었다.
 *
 *  ★★★ **다른 게이트가 전부 이것을 못 본다.** 조판·링크·로고·입력 방어는 「있는 것」을 재는데,
 *    이 결함은 **없는 것을 있다고 말하는 것**이다. 쪽은 200 이고 링크도 안 끊기고 조판도 멀쩡하다.
 *    그래서 「기능 켜짐」과 「그 기능의 조작부」를 **함께** 재고 어긋나면 실패시킨다.
 *
 *  두 상태 모두 통과해야 한다 —
 *    켜짐: 내비에 칸이 있고 · 도구 쪽에 저장 조작부가 있고 · 낱장이 참조번호를 설명한다
 *    꺼짐: 내비에 칸이 없고 · 도구 쪽에 저장 조작부가 없고 · 낱장이 **없다고 밝힌다**
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = "dist/calc";
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".json": "application/json", ".xml": "application/xml",
               ".svg": "image/svg+xml", ".webp": "image/webp" };
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

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const fail = [];

/* 도구 쪽 — 저장으로 이어지는 조작부가 있는가 */
await page.goto(`http://127.0.0.1:${PORT}/calc/gamma-shielding/`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
/* ★★ **머리글만 보면 샌다**(2026-09-14 실측으로 잡았다). 머리글 칸을 막았더니
   우측 레일의 「Keep a result」 묶음이 그대로 남아 「Google 로그인이 필요하다」고 말하고
   있었다. 저장을 **말하는 자리 전부**를 센다 — 머리글·레일·꼬리말 어디든. */
const tool = await page.evaluate(() => {
  const links = [...document.querySelectorAll('a[href$="/saved/"]')];
  return {
    navSaved: links.length > 0,
    where: links.map((a) => (a.closest("header") ? "머리글"
      : a.closest("aside") ? "우측 레일"
      : a.closest("footer") ? "꼬리말" : "본문")),
    saysSignIn: /needs a google sign-in/i.test(document.body.innerText),
    controls: [...document.querySelectorAll("main button, main a")]
      .map((b) => b.textContent.trim())
      .filter((t) => /^(save result|sign in with google|saving…)$/i.test(t)),
  };
});

/* 낱장 — 무엇을 말하고 있는가 */
await page.goto(`http://127.0.0.1:${PORT}/calc/saved/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const saved = await page.evaluate(() => {
  const t = document.querySelector("main").innerText.replace(/\s+/g, " ");
  return {
    claimsRefNumbers: /reference number such as/i.test(t),
    admitsOff: /not enabled on this deployment/i.test(t),
    controls: [...document.querySelectorAll("main button")].map((b) => b.textContent.trim())
      .filter((t) => /sign in with google/i.test(t)).length,
  };
});
await browser.close(); srv.close();

const on = tool.navSaved;
console.log(`   저장 기능: ${on ? "켜짐" : "꺼짐"} · 저장을 말하는 자리 ${tool.where.length}곳${tool.where.length ? ` (${tool.where.join(", ")})` : ""}`);
console.log(`   도구 쪽 저장 조작부 ${tool.controls.length}개${tool.controls.length ? ` (${tool.controls.join(", ")})` : ""}`);
console.log(`   낱장: 참조번호 설명 ${saved.claimsRefNumbers ? "있음" : "없음"} · 꺼졌다고 밝힘 ${saved.admitsOff ? "예" : "아니오"} · 로그인 단추 ${saved.controls}개`);

if (on) {
  if (!tool.controls.length)
    fail.push(`저장 링크가 ${tool.where.join("·")}에 있는데 **도구 쪽에 저장 조작부가 없다** — 없는 기능을 광고한다`);
  if (!saved.claimsRefNumbers)
    fail.push("기능이 켜졌는데 낱장이 참조번호를 설명하지 않는다");
  if (!saved.controls)
    fail.push("기능이 켜졌는데 낱장에 로그인 단추가 없다");
} else {
  if (tool.controls.length)
    fail.push("저장 링크가 없는데 도구 쪽에 저장 조작부가 있다");
  if (tool.saysSignIn)
    fail.push("저장이 꺼졌는데 쪽이 아직 **「Google 로그인이 필요하다」**고 말한다");
  if (saved.claimsRefNumbers)
    fail.push("기능이 꺼졌는데 낱장이 여전히 **참조번호가 붙는다고 설명한다** — 거짓말이다");
  if (!saved.admitsOff)
    fail.push("기능이 꺼졌는데 낱장이 그 사실을 밝히지 않는다");
}

if (fail.length) {
  console.error(`\n❌ 저장 기능의 말과 행동이 어긋난다 — ${fail.length}건`);
  fail.forEach((f) => console.error("   " + f));
  process.exit(1);
}
console.log(`\n✅ 저장 기능 — 말과 행동이 맞는다(${on ? "켜짐" : "꺼짐"} 상태로 일관)`);
