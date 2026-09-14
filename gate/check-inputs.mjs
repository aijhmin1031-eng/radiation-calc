/** 입력 방어 실측 — 「잘못 넣었을 때 무엇이 나오는가」를 잰다.
 *
 *  ★ 계기: 다른 게이트는 전부 **도착 상태**만 재고 있었다(조판·링크·로고).
 *    값을 실제로 넣어 보니 활성도 −5 가 **−546.7 µSv/h** 를 정상 답과 똑같은 조판으로 냈고,
 *    ALARA 는 음수·빈칸 선량률에 체류시간을 **「unlimited」** 라고 답했다(2026-09-14).
 *    방사선 안전 도구에서 「모름」이 「무제한」으로 읽히는 것이 가장 나쁜 오답이다.
 *
 *  ★★ **「무엇이 있는가」가 아니라 「무엇이 나오면 안 되는가」를 묻는다.**
 *    답이 있는지만 보면 −546.7 도 통과한다. 그래서 세 가지를 센다 —
 *    ① 무효 입력에 **음수 답**이 뜨지 않는가 ② **NaN·Infinity·undefined** 가 새지 않는가
 *    ③ 무효 입력에 **이유가 화면에 뜨는가**(말 없이 「—」만 두면 고장으로 읽힌다).
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const DIST = "dist/calc";
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
               ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml" };
const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p.startsWith("/calc")) p = p.slice(5) || "/";
  let f = join(DIST, p);
  if (existsSync(f) && !extname(f)) f = join(f, "index.html");
  if (!existsSync(f)) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
});
/* ★ 포트를 박지 않는다 — 앞선 실행이 남긴 리스너 하나에 게이트가 EADDRINUSE 로 죽으면
   **재는 것과 무관한 이유로 빨개져** 아무도 안 보게 된다. 0 을 주고 받은 포트를 쓴다. */
await new Promise((r) => srv.listen(0, r));
const PORT = srv.address().port;

const TOOLS = ["gamma-shielding", "decay", "mda", "units", "alara", "beta", "specific-activity"];
const BAD = ["", "-5", "abc", "-0.001"];
const fail = [];
let checked = 0, reasons = 0;

const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

/** 화면에 그려진 답과 새어 나온 값을 함께 읽는다. */
const read = () => page.evaluate(() => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("*")].filter((e) => !e.children.length && e.textContent.trim());
  const big = leaf.filter((e) => parseFloat(getComputedStyle(e).fontSize) >= 24 && !e.closest("h1"));
  // 새어 나온 기계값 — 사람이 읽는 자리에 있으면 안 된다
  const leak = (main.innerText.match(/\b(NaN|Infinity|undefined)\b/) || [])[0] || null;
  // 무효 이유 — aria-invalid 인 칸에 딸린 설명
  const reason = [...main.querySelectorAll("[aria-invalid='true']")]
    .map((i) => i.closest("label,span")?.parentElement?.innerText || "").join(" ");
  return { answers: big.map((e) => e.textContent.trim()), leak, reason: reason.trim() };
});

for (const tool of TOOLS) {
  await page.goto(`http://127.0.0.1:${PORT}/calc/${tool}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const inputs = await page.$$("main input");
  if (!inputs.length) { console.log(`   ${tool}: 입력칸 없음 — 건너뜀`); continue; }

  for (let i = 0; i < inputs.length; i++) {
    for (const bad of BAD) {
      // 칸마다 깨끗한 상태에서 시작한다 — 앞 칸의 무효값이 섞이면 무엇이 원인인지 못 가린다
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(350);
      const fresh = await page.$$("main input");
      if (!fresh[i]) break;
      /* ★ 라벨은 브라우저에서 읽고, 없을 때의 이름은 **Node 쪽에서** 만든다 —
         evaluate 콜백은 직렬화돼 건너가므로 바깥의 i 가 그 안에 없다. */
      const label = await fresh[i].evaluate((el) => el.closest("label")?.innerText.split("\n")[0]?.trim() || "");
      const name = label || `입력 #${i}`;
      await fresh[i].evaluate((el, v) => {
        const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        s.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
      }, bad);
      await page.waitForTimeout(180);
      const r = await read();
      checked++;

      if (r.leak) fail.push(`${tool} · "${name}" 에 "${bad || "(빈칸)"}" → 기계값 누출 ${r.leak}`);
      // 음수 답 — 선량률·시간·질량·거리에 음수가 뜻이 있는 자리는 없다
      const neg = r.answers.find((a) => /^[−-]\s*\d/.test(a));
      if (neg) fail.push(`${tool} · "${name}" 에 "${bad || "(빈칸)"}" → 음수 답 "${neg}"`);
      // 「모름」을 「무제한」으로 읽히게 하지 않는다
      if (bad !== "" && r.answers.some((a) => /unlimited|무제한/i.test(a)))
        fail.push(`${tool} · "${name}" 에 "${bad}" → 「unlimited」`);
      if (bad !== "" && r.reason) reasons++;
    }
  }
  console.log(`   ${tool}: 입력칸 ${inputs.length}개 × 무효값 ${BAD.length}종 확인`);
}

await browser.close(); srv.close();

console.log(`\n   잰 조합 ${checked}건 · 이유가 화면에 뜬 경우 ${reasons}건`);
if (fail.length) {
  console.error(`\n❌ 입력 방어 ${fail.length}건 실패`);
  fail.slice(0, 25).forEach((f) => console.error("   " + f));
  if (fail.length > 25) console.error(`   … 외 ${fail.length - 25}건`);
  process.exit(1);
}
if (reasons === 0) {
  console.error("\n❌ 무효 입력에 이유가 한 번도 뜨지 않았다 — 검사가 헛돌고 있다");
  process.exit(1);
}
console.log("\n✅ 입력 방어 — 음수 답 0 · 기계값 누출 0 · 「모름」을 「무제한」으로 답하지 않음");
