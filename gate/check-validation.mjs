/** ★★★ 유효성 평가 게이트 — 「보고서가 도구를 실제로 덮고 있는가」를 잰다(2026-09-17 신설).
 *
 *  ★ `npm test` 의 `src/validation/units.test.ts` 와 층이 다르다 — 저쪽은 **엔진 함수**가
 *    손계산과 같은지를 보고, 이쪽은 셋을 본다:
 *      ① **커버리지** — 도구가 내놓는 단위 전부에 손계산이 있는가(양방향).
 *      ② **독립성** — 케이스 파일이 엔진의 **값**을 들여오지 않는가(순환논증 금지).
 *      ③ **화면 실측** — 사람이 실제로 보는 숫자가 손계산과 같은가.
 *
 *  ★★ ③ 이 없으면 유효성 평가가 **엔진에서 멈춘다.** 화면은 답을 6자리로 반올림해 그리고,
 *    단위 라벨·군 전환·표 행 짝짓기는 전부 엔진 바깥이다 — 거기서 어긋나면 엔진 테스트는
 *    전건 통과한 채로 **틀린 숫자가 라이브에 선다.** 이웃 레포가 같은 자리에서 실제로 밟았다
 *    (사전에 번역이 다 있는데 `t()` 를 한 번 빠뜨려 한국어가 라이브로 나갔다).
 *
 *  ★ ③ 은 **표 전체를 읽는다** — 고른 단위 한 줄이 아니라 그 군의 모든 줄을 읽어
 *    손계산 배수의 비와 맞댄다. 「열었다」가 아니라 「무엇이 열렸는지」를 세는 것과 같은 판단이다.
 *    커버리지 하한을 걸어 두어, 조작이 실패했는데 조용히 통과하는 일이 없게 한다.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { UNITS } from "../src/engine/units.ts";
import { UNIT_CASES, COMPOSED_CASES, BRIDGE_CASES, BASE_UNIT, QUANTITY_LABEL }
  from "../src/validation/units.cases.ts";
import { WORKED_CASES as DECAY_WORKED, HALFLIFE_REFS, IDENTITY_CASES }
  from "../src/validation/decay.cases.ts";
import { WORKED_CASES as GAMMA_WORKED, EMISSION_REFS, DERIVATION_CASES, INTERP_CASES }
  from "../src/validation/gamma.cases.ts";
import { WORKED_CASES as SA_WORKED, MASS_REFS, DERIVATION_CASES as SA_DERIV,
         IDENTITY_CASES as SA_IDENT, REFUSAL_CASES as SA_REFUSAL }
  from "../src/validation/specific-activity.cases.ts";
import { REPORTS } from "../src/validation/registry.ts";
import { createRequire } from "node:module";
const NUCLIDES = createRequire(import.meta.url)("../src/data/nuclides.json");

const DIST = "dist/calc";
const CASE_FILES = ["src/validation/units.cases.ts", "src/validation/decay.cases.ts",
                    "src/validation/gamma.cases.ts", "src/validation/specific-activity.cases.ts"];
/** ★★ **화면의 반올림은 한 가지가 아니다**(첫 판에서 이것 때문에 B-01 이 걸렸다).
 *  환산표는 `fmt(v, 6)` 로 **6자리**, 그 아래 「환산이 아닌 단계」의 으뜸 숫자는 `fmt(v, 4)` 로
 *  **4자리**다. 자를 하나로 두면 둘 중 하나가 틀린다 — 느슨하게 맞추면 표의 결함을 놓치고,
 *  빡빡하게 맞추면 멀쩡한 4자리 표기가 늘 빨개진다. **자리마다 그 자리의 자를 쓴다.** */
const TOL_TABLE = 1e-5;      // 6자리 반올림의 최대 상대오차 5×10⁻⁶ 위
const TOL_HEADLINE = 1e-3;   // 4자리 반올림의 최대 상대오차 5×10⁻⁴ 위
const fail = [];

/* ══════════════ ① 커버리지 — 양방향으로 센다 ══════════════ */
let units = 0;
for (const [q, group] of Object.entries(UNITS)) {
  if (BASE_UNIT[q] !== group.base)
    fail.push(`① ${q} 의 기준단위가 다르다: 도구 ${group.base} · 보고서 ${BASE_UNIT[q]}`);
  if (!QUANTITY_LABEL[q]) fail.push(`① ${q} 의 화면 이름이 보고서에 없다`);
  for (const u of Object.keys(group.u)) {
    units += 1;
    const hits = UNIT_CASES.filter((c) => c.quantity === q && c.unit === u);
    if (hits.length !== 1)
      fail.push(`① ${q}/${u} 의 손계산이 ${hits.length} 건이다 — 도구에 단위를 늘리면 보고서도 늘린다`);
  }
}
for (const c of UNIT_CASES)
  if (!UNITS[c.quantity] || !(c.unit in UNITS[c.quantity].u))
    fail.push(`① 보고서의 ${c.id}(${c.unit})이 도구에 없다 — 없는 것을 평가했다고 주장하게 된다`);
console.log(`① 커버리지(단위환산) — 도구 단위 ${units} · 손계산 ${UNIT_CASES.length} · 군 ${Object.keys(UNITS).length}`);

/* ★ 붕괴는 커버리지의 뜻이 다르다 — 단위는 유한하지만 핵종은 147종이고 DDEP 가 전부를
   평가하지도 않았다. 그래서 「전수」가 아니라 **① 화면의 갈래를 빠짐없이 덮었는가**
   ② 보고서가 **없는 핵종을 평가했다고 주장하지 않는가** 를 센다. */
const DECAY_MODES = ["remaining", "when", "halflife"];
for (const m of DECAY_MODES)
  if (!DECAY_WORKED.some((c) => c.mode === m))
    fail.push(`① 붕괴 화면의 갈래 「${m}」에 손계산 케이스가 없다`);
for (const c of DECAY_WORKED)
  if (!NUCLIDES[c.nuclide]) fail.push(`① 붕괴 케이스 ${c.id} 의 ${c.nuclide} 이 자료에 없다`);
for (const r of HALFLIFE_REFS)
  if (!NUCLIDES[r.nuclide]) fail.push(`① 반감기 기준 ${r.id} 의 ${r.nuclide} 이 자료에 없다`);
{
  const ids = [...DECAY_WORKED.map((c) => c.id), ...HALFLIFE_REFS.map((r) => r.id), ...IDENTITY_CASES.map((c) => c.id)];
  if (new Set(ids).size !== ids.length) fail.push("① 붕괴 케이스 id 가 겹친다");
}
/* ★ 감마는 커버리지의 뜻이 또 다르다 — 「몇 %를 덮었나」가 아니라 **사슬의 고리를 빠짐없이
   덮었나**다. 고리 하나가 검증 밖이면 나머지가 아무리 촘촘해도 사슬이 끊긴다. */
const GAMMA_LINKS = ["derivation", "identity", "interp", "emission", "delta", "worked"];
{
  const have = { derivation: DERIVATION_CASES.length, interp: INTERP_CASES.length,
                 emission: EMISSION_REFS.length, worked: GAMMA_WORKED.length };
  for (const [k, n] of Object.entries(have))
    if (!n) fail.push(`① 감마 사슬의 고리 「${k}」에 케이스가 없다`);
  for (const r of EMISSION_REFS)
    if (!NUCLIDES[r.nuclide]) fail.push(`① 방출선 기준 ${r.id} 의 ${r.nuclide} 이 자료에 없다`);
  for (const c of GAMMA_WORKED)
    if (!NUCLIDES[c.nuclide]) fail.push(`① 감마 케이스 ${c.id} 의 ${c.nuclide} 이 자료에 없다`);
  /* ★★ **출력(Γ)을 문헌과 맞대지 않는다는 판단이 쪽에 적혀 있어야 한다.** 그 문단이 사라지면
     읽는 사람은 「그냥 안 했다」로 읽는다 — 안 한 것과 못 하는 것은 다르다. */
  const page = "src/pages/validation/gamma-shielding.astro";
  const src2 = readFileSync(page, "utf8");
  for (const must of ["Why there is no comparison against published gamma constants",
                      "different quantity", "cutoff"])
    if (!src2.includes(must))
      fail.push(`① ${page} 에서 「${must}」가 사라졌다 — 대조하지 않는 이유가 쪽에서 빠지면 안 된다`);
}
/* ★ 비방사능은 커버리지가 **전수**여야 한다 — 몰 질량은 핵종마다 다른 값이고, 하나라도
   평가 밖이면 그 핵종의 답만 조용히 옛 근사로 남을 수 있다. 147 중 147 을 요구한다.
   ★★ 그리고 **이 라운드가 찾아낸 결함이 쪽에 남아 있는지**를 함께 잰다. 결함을 고치고
     기록을 지우면, 다음 사람이 같은 자리에 같은 근사를 다시 넣는다. */
{
  const keys = Object.keys(NUCLIDES);
  const covered = new Set(MASS_REFS.map((r) => r.nuclide));
  for (const k of keys)
    if (!covered.has(k)) fail.push(`① 비방사능: ${k} 의 원자질량이 평가에 없다`);
  for (const r of MASS_REFS) {
    if (!NUCLIDES[r.nuclide]) fail.push(`① 비방사능: 평가의 ${r.nuclide} 이 자료에 없다`);
    if (!r.line) fail.push(`① 비방사능: ${r.nuclide} 의 원문 줄이 비었다 — 대조할 자리가 없다`);
  }
  for (const c of SA_WORKED)
    if (!NUCLIDES[c.nuclide]) fail.push(`① 비방사능 케이스 ${c.id} 의 ${c.nuclide} 이 자료에 없다`);
  if (!SA_REFUSAL.length) fail.push("① 비방사능: 거부 케이스가 없다");

  /* ★★ **질량수를 몰 질량으로 되돌리면 여기서 걸린다.** 근사가 살아 있을 때 통과하던
     자리이므로, 역테스트로 확인한 경계다(최악 0.4% 초과 · 0.03% 초과가 74종 이상). */
  const off = MASS_REFS.map((r) => Math.abs(r.m_u - r.a) / r.a);
  if (Math.max(...off) < 4e-3)
    fail.push("① 비방사능: 질량수와 원자질량의 최대 차가 0.4% 미만이다 — 몰 질량이 질량수로 되돌아갔다");
  if (off.filter((x) => x > 3e-4).length < 74)
    fail.push("① 비방사능: 0.03% 를 넘는 핵종이 74종 미만이다 — 근사가 되살아났을 수 있다");

  /* ★ 「독립한 둘째 평가가 없다」는 고백과 「무엇을 세우지 못하는가」가 쪽에 남아 있어야 한다.
     감마 쪽에 「공개된 Γ 와 비교하지 않는 이유」를 요구하는 것과 같은 자리다. */
  const page3 = "src/pages/validation/specific-activity.astro";
  const src3 = readFileSync(page3, "utf8");
  for (const must of ["there is no second evaluation to play against it",
                      "What this report does not establish",
                      "consistency check and a validation"])
    if (!src3.includes(must))
      fail.push(`① ${page3} 에서 「${must}」가 사라졌다 — 세우지 못하는 것을 밝히는 문장이다`);
  /* ★ 거짓 주장이 되살아나는지 — 사이트 어디에도 「0.03%」 가 다시 나오면 안 된다. */
  for (const f of ["src/pages/methods.astro", "src/lib/tools.ts",
                   "src/components/calc/SpecificActivity.tsx", "src/pages/specific-activity.astro"])
    if (readFileSync(f, "utf8").includes("0.03%"))
      fail.push(`① ${f} 에 「0.03%」 주장이 되살아났다`);
}
console.log(`① 커버리지(비방사능) — 원자질량 ${MASS_REFS.length}/${Object.keys(NUCLIDES).length}종 · ` +
            `유도 ${SA_DERIV.length} · 항등식 ${SA_IDENT.length} · 손계산 ${SA_WORKED.length} · 거부 ${SA_REFUSAL.length}`);
console.log(`① 커버리지(감마) — 사슬 고리 ${GAMMA_LINKS.length}가지 · 유도 ${DERIVATION_CASES.length} · ` +
            `보간 ${INTERP_CASES.length} · 방출선 ${EMISSION_REFS.length} · 손계산 ${GAMMA_WORKED.length}`);
console.log(`① 커버리지(붕괴) — 갈래 ${DECAY_MODES.length}/3 덮음 · 손계산 ${DECAY_WORKED.length} · ` +
            `반감기 기준 ${HALFLIFE_REFS.length}종(자료 ${Object.keys(NUCLIDES).length}종 중) · 항등식 ${IDENTITY_CASES.length}`);

/* ══════════════ ①-5 보고서가 스스로 내린 판정 ══════════════
   ★★★ **2026-09-19 에 이 검사가 없어서 한 라운드를 놓쳤다.** 감마 보고서가 라이브에서
     「One or more checks fail」을 띄운 채 배포돼 있었다 — 항등식 `G-ID-10` 을 케이스 정본에
     늘리면서 **쪽의 실행 표(`idRun`)에 잇는 것을 빠뜨렸고**, `relValue(undefined, 1)` 이
     NaN 이 되어 `allPass` 가 false 로 떨어진 것이다.
   ★ **`npm test` 는 잡지 못한다** — 테스트에는 그 케이스의 실행부가 제대로 있었다.
     빠진 것은 **쪽**이고, 쪽은 테스트가 보는 자리가 아니다.
   ★ **사람도 놓쳤다** — 배포 확인에서 「검사 654건」과 「한국어 0자」는 읽고 **판정 줄은 안 봤다.**
     그래서 사람이 읽는 자리를 게이트가 읽게 한다.
   ★ **「NaN 이 있는가」로는 못 잰다** — 거부 표가 NaN 을 **일부러** 그린다(단위 10 · 붕괴 6).
     보고서에서 신호가 되는 것은 **판정 줄 하나**다. */
{
  const VERDICT_OK = "All checks pass";
  const published = REPORTS.filter((x) => x.status === "published");
  /* ★ 로그는 **센 것**을 찍는다 — 「전부 통과」라고 박아 두면 실패한 판에서도 그대로 나와
     로그가 거짓말을 한다(역테스트에서 실제로 그랬다). */
  let verdictOk = 0;
  for (const r of published) {
    const f = `${DIST}/validation/${r.tool}/index.html`;
    if (!existsSync(f)) { fail.push(`①-5 보고서 쪽이 없다: ${f}`); continue; }
    if (readFileSync(f, "utf8").includes(VERDICT_OK)) verdictOk += 1;
    else fail.push(`①-5 /validation/${r.tool}/ 이 스스로 실패를 선언하고 있다 — 쪽의 판정 줄이 「${VERDICT_OK}」 가 아니다`);
  }
  /* ★ 케이스 정본의 id 가 쪽에 그려지는지도 본다 — **쪽이 그 케이스를 아예 안 드는** 경우다.
     ★★ **이것만으로는 부족하다**(역테스트로 한계를 확인했다):
       · G-ID-10 은 **그려지기는 했고 값만 NaN 이었다** → 이 검사는 통과했다. 본체는 위의 판정 줄이다.
       · 표에서 `{c.id}` 를 지워도 같은 id 가 유도 카드·상세 카드에 남아 통과한다.
       잡는 것은 **케이스를 렌더에서 통째로 뺀 경우** 하나다(S-R-03 을 빼서 확인했다). */
  const RENDERED = [
    ["units", "src/validation/units.cases.ts"],
    ["decay", "src/validation/decay.cases.ts"],
    ["gamma-shielding", "src/validation/gamma.cases.ts"],
    ["specific-activity", "src/validation/specific-activity.cases.ts"],
  ];
  let ids = 0;
  for (const [tool, caseFile] of RENDERED) {
    const f = `${DIST}/validation/${tool}/index.html`;
    if (!existsSync(f)) continue;
    const html = readFileSync(f, "utf8");
    for (const m of readFileSync(caseFile, "utf8").matchAll(/\bid:\s*"([A-Z]-[A-Z]+-\d+)"/g)) {
      ids += 1;
      if (!html.includes(m[1]))
        fail.push(`①-5 /validation/${tool}/ 에 케이스 ${m[1]} 이 그려지지 않는다 — 정본에는 있는데 쪽이 들지 않았다`);
    }
  }
  console.log(`①-5 보고서 판정 — 공개 ${published.length}건 중 ${verdictOk}건이 「${VERDICT_OK}」 · 케이스 id ${ids}개 대조`);
}

/* ══════════════ ② 독립성 — 기대값이 엔진에서 오면 순환논증이다 ══════════════ */
for (const f of CASE_FILES) checkIndependence(f);
function checkIndependence(CASE_FILE) {
const src = readFileSync(CASE_FILE, "utf8");
/* `import type` 은 컴파일에서 지워지므로 값을 들여오지 않는다. 그 외의 engine import 는 전부 결함. */
for (const m of src.matchAll(/^\s*import\s+(type\s+)?([^;]*?)\s*from\s*["']([^"']+)["']/gm)) {
  const [, isType, what, spec] = m;
  if (!/engine/.test(spec)) continue;
  if (isType) continue;
  if (/^\s*type\s/.test(what) || /^\{\s*type\s/.test(what)) continue;
  fail.push(`② ${CASE_FILE} 이 엔진에서 값을 들여온다 (${spec}: ${what.trim()}) — 기대값이 도구에서 나오면 대조가 순환이 된다`);
}
if (/require\(["'][^"']*engine/.test(src))
  fail.push(`② ${CASE_FILE} 이 require 로 엔진을 들여온다`);
}
console.log(`② 독립성 — 케이스 정본 ${CASE_FILES.length}개가 엔진에서 값을 들여오지 않는다 (import type 만 허용)`);

/* ══════════════ ③ 화면 실측 ══════════════ */
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
await new Promise((r) => srv.listen(0, r));
const PORT = srv.address().port;

/** 화면 표기를 수로 되돌린다 — `fmt()` 가 내는 「1.85×10⁵」·「37,000」·「—」를 읽는다. */
const SUP = "⁻⁰¹²³⁴⁵⁶⁷⁸⁹";
function parseShown(s) {
  const t = String(s).trim().replace(/,/g, "").replace(/\s/g, "");
  if (t === "—" || t === "") return NaN;
  const m = t.match(/^(-?[\d.]+)×10(.+)$/);
  if (!m) return Number(t);
  const exp = [...m[2]].map((ch) => (ch === "⁻" ? "-" : String(SUP.indexOf(ch) - 1))).join("");
  return Number(m[1]) * 10 ** Number(exp);
}

const browser = await chromium.launch(
  { ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://127.0.0.1:${PORT}/calc/units/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

/** React 제어 입력이라 `el.value` 로는 안 먹는다 — 네이티브 세터 + input 이벤트. */
const setNumber = (idx, v) => page.evaluate(([i, val]) => {
  const el = document.querySelectorAll("main input")[i];
  if (!el) throw new Error(`입력칸 ${i} 이 없다`);
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  set.call(el, String(val));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, [idx, v]);

const pickQuantity = async (label) => {
  const btn = page.locator(`[role="radio"]`, { hasText: new RegExp(`^${label}$`) });
  await btn.click({ timeout: 4000 });   // ★ 실패를 삼키지 않는다
  await page.waitForTimeout(120);
};
const pickUnit = async (unit) => {
  await page.selectOption("main select", unit, { timeout: 4000 });
  await page.waitForTimeout(120);
};
/** 환산표의 모든 줄을 읽는다 — 고른 줄 하나가 아니라 표 전체다. */
const readTable = () => page.evaluate(() =>
  [...document.querySelectorAll("main table tbody tr")].map((tr) => ({
    unit: tr.children[0].textContent.trim(),
    shown: tr.children[1].textContent.trim(),
  })));
/** 「환산이 아닌 단계」 칸의 으뜸 숫자.
 *  ★ `textContent` 로 읽으면 **단위 꼬리표까지 딸려 온다**(「8.76426mGy (air)」) — 첫 판에서
 *    그대로 읽어 전건 NaN 이 났다. 숫자는 첫 자식 텍스트 노드에 있고 단위는 `<span>` 이다. */
const readBridge = () => page.evaluate(() => {
  const el = [...document.querySelectorAll("main .card p.num")].pop();
  if (!el) return null;
  const first = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  return (first ? first.textContent : el.textContent).trim();
});

let shownCells = 0, tableStates = 0;
const worst = { r: 0, what: "—" };
const cmp = (got, want, what, tol) => {
  const r = want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want);
  if (r / tol > worst.r / (worst.tol ?? tol)) { worst.r = r; worst.what = what; worst.tol = tol; }
  if (!(r < tol)) fail.push(`③ ${what}: 화면 ${got} · 손계산 ${want} · 상대차 ${r} · 허용 ${tol}`);
};

/* ③-1 모든 군 × 모든 단위를 「넣는 단위」로 세워, 그 군의 표 전체를 읽는다.
       읽는 칸은 단위 수의 제곱 — 도구가 내놓는 환산을 화면에서 전수로 보는 것과 같다. */
for (const [q, group] of Object.entries(UNITS)) {
  await pickQuantity(QUANTITY_LABEL[q]);
  const cases = UNIT_CASES.filter((c) => c.quantity === q);
  for (const from of cases) {
    await pickUnit(from.unit);
    await setNumber(0, 1);
    await page.waitForTimeout(60);
    const rows = await readTable();
    if (rows.length !== Object.keys(group.u).length)
      fail.push(`③ ${q}/${from.unit}: 표에 ${rows.length} 줄 — 단위는 ${Object.keys(group.u).length} 개다`);
    tableStates += 1;
    for (const row of rows) {
      const to = cases.find((c) => c.unit === row.unit);
      if (!to) { fail.push(`③ ${q} 표에 보고서가 모르는 줄이 있다: ${row.unit}`); continue; }
      shownCells += 1;
      cmp(parseShown(row.shown), from.factor / to.factor, `1 ${from.unit} → ${row.unit} (${q}, 화면)`, TOL_TABLE);
    }
  }
}

/* ③-2 합성 케이스 — 값을 실어 끝에서 끝까지. */
for (const c of COMPOSED_CASES) {
  await pickQuantity(QUANTITY_LABEL[c.quantity]);
  await pickUnit(c.from);
  await setNumber(0, c.value);
  await page.waitForTimeout(80);
  const row = (await readTable()).find((r) => r.unit === c.to);
  if (!row) { fail.push(`③ ${c.id}: 표에 ${c.to} 줄이 없다`); continue; }
  shownCells += 1;
  cmp(parseShown(row.shown), c.expect, `${c.id} ${c.value} ${c.from} → ${c.to} (화면)`, TOL_TABLE);
}

/* ③-3 환산이 아닌 단계 — 밀도 칸까지 실제로 만진다. */
for (const c of BRIDGE_CASES) {
  const q = c.kind === "exposureToAirKerma" ? "exposure"
          : c.kind === "massFromVol" ? "volConc" : "massConc";
  await pickQuantity(QUANTITY_LABEL[q]);
  await pickUnit(c.input.from);
  await setNumber(0, c.input.value);
  if (c.input.density !== undefined) await setNumber(1, c.input.density);
  await page.waitForTimeout(120);
  const shown = await readBridge();
  if (shown === null) { fail.push(`③ ${c.id}: 「환산이 아닌 단계」 칸이 화면에 없다`); continue; }
  shownCells += 1;
  cmp(parseShown(shown), c.expect, `${c.id} ${c.title} (화면)`, TOL_HEADLINE);
}

/* ═══ ④ 붕괴 화면 실측 — 도구를 실제로 눌러 그려진 답을 읽는다 ═══
   ★ 붕괴 화면은 환산표와 달리 **계산 단추를 거친다.** 「눌렀다」가 아니라 「무엇이 그려졌는지」를
     센다 — 단추가 막히거나 핵종이 안 골라지면 **직전 답이 그대로 남아** 조용히 통과할 수 있다.
     그래서 고른 핵종·갈래가 화면에 실제로 섰는지 확인하고, 읽은 답의 수를 하한으로 건다.
   ★ 으뜸 답은 `fmt(v)` 로 **4자리**다(환산표는 6자리). 자리마다 그 자리의 자를 쓴다. */
const TOL_DECAY = 1e-3;                       // 으뜸 답은 4자리 — 반올림 오차 5×10⁻⁴ 위
/** ★ 검산용 수치는 **3자리**로 그려진다(`fmt(v, 3)`) — 으뜸 답과 다른 자다.
 *  첫 판에서 하나로 뒀다가 D-W-02 의 「3.9952 → 4」가 걸렸다. 화면의 반올림은 자리마다 다르다. */
const TOL_DECAY_NOTE = 5e-3;                  // 3자리 반올림의 최대 상대오차 5×10⁻³ 위
const MODE_LABEL = { remaining: "How much is left", when: "When does it reach", halflife: "Find the half-life" };
const TIME_S = { s: 1, min: 60, h: 3600, d: 86400, y: 365.2425 * 86400 };

/** 라벨로 칸을 찾는다 — 칸의 순서는 갈래마다 달라 번호로 잡으면 조용히 어긋난다. */
const setByLabel = (label, v) => page.evaluate(([lab, val]) => {
  const l = [...document.querySelectorAll("main label")].find(
    (x) => x.querySelector(".label")?.textContent.trim() === lab);
  if (!l) throw new Error(`「${lab}」 칸이 화면에 없다`);
  const el = l.querySelector("input, select");
  if (!el) throw new Error(`「${lab}」 에 입력 요소가 없다`);
  const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, String(val));
  el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
}, [label, v]);

const pickNuclide = async (key) => {
  await page.click('main button[aria-haspopup="listbox"]', { timeout: 4000 });
  await page.fill('main [role="listbox"] >> xpath=../..//input', key, { timeout: 4000 }).catch(async () => {
    await page.fill("main input[placeholder^='Type to filter']", key, { timeout: 4000 });
  });
  await page.waitForTimeout(150);
  await page.click(`main [role="option"]:has(.num:text-is("${key}"))`, { timeout: 4000 });
  await page.waitForTimeout(150);
};

/** 으뜸 답 — 숫자와, 시간일 때는 단위까지. 낡은 답(stale)이면 읽지 않는다. */
const readHeadline = () => page.evaluate(() => {
  const box = [...document.querySelectorAll("main div.rounded-lg.border")]
    .find((d) => d.querySelector("p.label") && d.querySelector("span.num"));
  if (!box) return null;
  const stale = box.className.includes("opacity-60");
  const num = box.querySelector("span.num").textContent.trim();
  const unit = box.querySelector("span.num + span")?.textContent.trim() ?? "";
  const note = box.querySelector("p.mt-2")?.textContent.trim() ?? "";
  return { stale, num, unit, note };
});

await page.goto(`http://127.0.0.1:${PORT}/calc/decay/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
let decayRead = 0;
for (const c of DECAY_WORKED) {
  await page.locator('[role="radio"]', { hasText: new RegExp(`^${MODE_LABEL[c.mode]}$`) }).click({ timeout: 4000 });
  await page.waitForTimeout(120);
  await pickNuclide(c.nuclide);
  await setByLabel(c.mode === "halflife" ? "First measurement" : "Starting activity", c.input.a0);
  await setByLabel("Unit", c.input.unit);
  if (c.mode === "when") await setByLabel("Target activity", c.input.target);
  if (c.mode === "halflife") await setByLabel("Second measurement", c.input.a1);
  if (c.mode !== "when") {
    await setByLabel(c.mode === "halflife" ? "Time between measurements" : "Elapsed time", c.input.t);
    await setByLabel("Time unit", c.input.tu);
  }
  await page.click("main button:has-text('Calculate')", { timeout: 4000 });
  await page.waitForTimeout(200);

  const h = await readHeadline();
  if (!h) { fail.push(`④ ${c.id}: 으뜸 답이 화면에 없다`); continue; }
  if (h.stale) { fail.push(`④ ${c.id}: 답이 낡은 상태다 — 계산 단추가 먹히지 않았다`); continue; }
  decayRead += 1;
  /* ★★ 시간을 답하는 갈래는 **수와 단위가 한 덩어리로** 그려진다(「27.46 y」) — 활성도 답처럼
     단위가 옆 칸에 있지 않다. 첫 판에서 그것을 모르고 읽어 세 건이 NaN 이 났다.
     화면이 초·분·시·일·해 중 무엇을 골랐는지까지 읽어야 초로 되돌릴 수 있다. */
  let got;
  if (c.expectUnit === "s") {
    const m = h.num.match(/^(.+?)\s*(s|min|h|d|y)$/);
    if (!m) { fail.push(`④ ${c.id}: 시간 답에서 단위를 못 읽었다 (「${h.num}」)`); continue; }
    got = parseShown(m[1]) * TIME_S[m[2]];
  } else {
    got = parseShown(h.num);
  }
  cmp(got, c.expect, `${c.id} ${c.nuclide} ${c.mode} (화면)`, TOL_DECAY);

  /* ★ 검산용 수치도 잰다 — 으뜸 답만 보면 이 자리가 시야 밖이다.
     갈래마다 **다른 것**을 그린다: 「반감기 몇 번」이거나 「자료값과의 차이」다. */
  if (c.secondary.kind === "halves") {
    const m = h.note.match(/([\d.]+)\s*half-li/);
    if (!m) fail.push(`④ ${c.id}: 「반감기 몇 번」이 화면에 없다 — 검산할 자리가 사라졌다`);
    else { decayRead += 1; cmp(Number(m[1]), c.secondary.expect, `${c.id} 반감기 수 (화면)`, TOL_DECAY_NOTE); }
  } else {
    const row = await page.evaluate(() => {
      const d = [...document.querySelectorAll("main dl > div")]
        .find((x) => x.querySelector("dt")?.textContent.trim().startsWith("Difference"));
      return d ? d.querySelector("dd").textContent.trim() : null;
    });
    if (!row) fail.push(`④ ${c.id}: 「Difference」 줄이 화면에 없다 — 자료값과 견줄 자리가 사라졌다`);
    else { decayRead += 1; cmp(parseShown(row.replace("%", "")), c.secondary.expect, `${c.id} 자료값과의 차이 (화면)`, TOL_DECAY_NOTE); }
  }
}
if (decayRead < DECAY_WORKED.length * 2)
  fail.push(`④ 붕괴 화면에서 읽은 값이 ${decayRead} 개뿐이다 — ${DECAY_WORKED.length * 2} 개 이상이어야 한다`);
console.log(`④ 붕괴 화면 실측 — 갈래 ${new Set(DECAY_WORKED.map((c) => c.mode)).size}가지 · 케이스 ${DECAY_WORKED.length} · 읽은 값 ${decayRead} 개 · 허용 ${TOL_DECAY}`);

/* ═══ ⑤ 감마 화면 실측 — 선량률을 실제로 눌러 읽는다 ═══
   ★ 이 화면은 핵종·거리·활성도·차폐를 모두 세워야 답이 나온다. 「눌렀다」가 아니라
     **「무엇이 그려졌는지」**를 세고, 답이 낡은 상태(stale)면 읽지 않는다. */
const TOL_GAMMA = 2e-3;   // 으뜸 답 4자리 — 반올림 5×10⁻⁴ 위, 단위 환산 여유 포함
let gammaRead = 0;
const GAMMA_SCREEN = GAMMA_WORKED.filter((c) => c.kind === "doseRate");
await page.goto(`http://127.0.0.1:${PORT}/calc/gamma-shielding/`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
for (const c of GAMMA_SCREEN) {
  await page.locator('[role="radio"]', { hasText: /^Dose rate$/ }).click({ timeout: 4000 });
  await page.waitForTimeout(120);
  await pickNuclide(c.nuclide);
  await setByLabel("Activity", c.input.activityGBq);
  await setByLabel("Unit", "GBq");
  await setByLabel("Distance", c.input.distanceM);
  await setByLabel("Distance unit", "m");
  await setByLabel("Show dose rate in", "mGy/h");
  await page.click("main button:has-text('Calculate')", { timeout: 4000 });
  await page.waitForTimeout(250);
  const h = await readHeadline();
  if (!h) { fail.push(`⑤ ${c.id}: 으뜸 답이 화면에 없다`); continue; }
  if (h.stale) { fail.push(`⑤ ${c.id}: 답이 낡은 상태다 — 계산 단추가 먹히지 않았다`); continue; }
  gammaRead += 1;
  cmp(parseShown(h.num), c.expect, `${c.id} ${c.nuclide} 선량률 (화면)`, TOL_GAMMA);
}
if (gammaRead < GAMMA_SCREEN.length)
  fail.push(`⑤ 감마 화면에서 읽은 값이 ${gammaRead} 개뿐이다 — ${GAMMA_SCREEN.length} 개여야 한다`);
console.log(`⑤ 감마 화면 실측 — 케이스 ${GAMMA_SCREEN.length} · 읽은 값 ${gammaRead} 개 · 허용 ${TOL_GAMMA}`);

/* ═══ ⑥ 비방사능 화면 실측 — 으뜸 답과 **몰 질량 줄**을 함께 읽는다 ═══
   ★★ **여기서 읽어야 할 것이 두 가지다.** 으뜸 답만 재면 「몰 질량이 질량수로 되돌아간」
     사고를 **못 잡는다** — 되돌려도 답은 0.5% 만 달라지고, 그 정도는 4자리 표시에서
     한두 자리만 움직여 화면으로는 정상으로 보인다. 그래서 화면이 **몰 질량 자체를
     드러내는지**, 그 값이 AME2020 과 같은지를 함께 잰다.
     (그전 화면은 이 자리에 「Mass number 60」을 그리고 있었다 — 값이 보이는데 틀린 값이었다.)
   ★ 으뜸 답은 `fmt(v)` 4자리이고 **크기에 따라 단위가 바뀐다**(ng·µg·mg·g·kg). 단위를 읽어
     되돌리지 않으면 10³ 배씩 어긋난 채 통과한다. */
const TOL_SA = 1e-3;                          // 으뜸 답 4자리 — 반올림 5×10⁻⁴ 위
const TOL_SA_MASS = 5e-7;                     // 몰 질량은 6자리로 그린다
const MASS_SCALE = { ng: 1e-9, "µg": 1e-6, mg: 1e-3, g: 1, kg: 1e3 };
const SA_BY_NUCLIDE = Object.fromEntries(MASS_REFS.map((r) => [r.nuclide, r]));
let saRead = 0;
const SA_SCREEN = SA_WORKED.filter((c) => c.kind !== "specificActivity");
await page.goto(`http://127.0.0.1:${PORT}/calc/specific-activity/`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

/** 「Molar mass」 줄을 읽는다 — `Rows` 는 dl > div > dt/dd 다. */
const readRow = (label) => page.evaluate((lab) => {
  const d = [...document.querySelectorAll("main dl > div")]
    .find((x) => x.querySelector("dt")?.textContent.trim().startsWith(lab));
  return d ? d.querySelector("dd").textContent.trim() : null;
}, label);

/* ⑥-1 모든 핵종에서 몰 질량 줄이 AME2020 과 같은지 — 표본이 아니라 **전수에 가깝게** 돈다.
   ★ 147 을 다 돌면 게이트가 느려지므로, 근사 오차가 큰 쪽·작은 쪽·이성질체를 고루 든다. */
const byOff = [...MASS_REFS].sort((a, b) => Math.abs(b.m_u - b.a) / b.a - Math.abs(a.m_u - a.a) / a.a);
const SAMPLE = [...new Set([
  ...byOff.slice(0, 8).map((r) => r.nuclide),
  ...byOff.slice(-4).map((r) => r.nuclide),
  ...MASS_REFS.filter((r) => r.exc_keV > 0).slice(0, 4).map((r) => r.nuclide),
  ...SA_WORKED.map((c) => c.nuclide),
])];
for (const k of SAMPLE) {
  await pickNuclide(k);
  /* ★★ **계산 단추를 눌러야 한다.** 이 화면의 아래 표는 고른 값이 아니라 **커밋된 스냅숏**
     에서 그려진다 — 안 누르면 직전 핵종의 몰 질량이 그대로 서 있고, 게이트는 147종을
     도는 시늉만 한 채 통과한다. 첫 판에서 실제로 그랬다(19종 전부 Pu-239 를 읽었다). */
  await page.click("main button:has-text('Calculate')", { timeout: 4000 });
  await page.waitForTimeout(200);
  const shown = await readRow("Molar mass");
  if (!shown) { fail.push(`⑥ ${k}: 「Molar mass」 줄이 화면에 없다 — 몰 질량이 화면에서 사라졌다`); continue; }
  const v = Number(shown.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(v)) { fail.push(`⑥ ${k}: 몰 질량을 읽을 수 없다 — 「${shown}」`); continue; }
  if (!/g\/mol/.test(shown)) fail.push(`⑥ ${k}: 몰 질량에 단위 g/mol 이 없다 — 「${shown}」`);
  saRead += 1;
  cmp(v, SA_BY_NUCLIDE[k].m_u, `${k} 몰 질량 (화면)`, TOL_SA_MASS);
  /* ★ 질량수와 **다른지**를 함께 본다 — 같으면 근사가 되살아난 것이다. */
  if (Math.abs(SA_BY_NUCLIDE[k].m_u - SA_BY_NUCLIDE[k].a) / SA_BY_NUCLIDE[k].a > 1e-4
      && Math.abs(v - SA_BY_NUCLIDE[k].a) < 5e-4)
    fail.push(`⑥ ${k}: 화면의 몰 질량이 질량수 ${SA_BY_NUCLIDE[k].a} 과 같다 — 근사가 되살아났다`);
}

/* ⑥-2 손계산 케이스를 실제로 눌러 으뜸 답을 읽는다. */
for (const c of SA_SCREEN) {
  const toMass = c.kind === "massFromActivity";
  await page.locator('[role="radio"]', { hasText: toMass ? /^Activity → mass$/ : /^Mass → activity$/ })
    .click({ timeout: 4000 });
  await page.waitForTimeout(120);
  await pickNuclide(c.nuclide);
  await setByLabel(toMass ? "Activity" : "Mass", c.input);
  await setByLabel("Unit", toMass ? "Bq" : "g");
  await page.click("main button:has-text('Calculate')", { timeout: 4000 });
  await page.waitForTimeout(250);
  const h = await readHeadline();
  if (!h) { fail.push(`⑥ ${c.id}: 으뜸 답이 화면에 없다`); continue; }
  if (h.stale) { fail.push(`⑥ ${c.id}: 답이 낡은 상태다 — 계산 단추가 먹히지 않았다`); continue; }
  const scale = toMass ? (MASS_SCALE[h.unit] ?? NaN) : 1;
  if (!Number.isFinite(scale)) { fail.push(`⑥ ${c.id}: 질량 단위 「${h.unit}」 를 모른다`); continue; }
  saRead += 1;
  cmp(parseShown(h.num) * scale, c.expect, `${c.id} ${c.nuclide} ${c.kind} (화면)`, TOL_SA);
}
if (saRead < SAMPLE.length + SA_SCREEN.length)
  fail.push(`⑥ 비방사능 화면에서 읽은 값이 ${saRead} 개뿐이다 — ${SAMPLE.length + SA_SCREEN.length} 개여야 한다`);
console.log(`⑥ 비방사능 화면 실측 — 몰 질량 ${SAMPLE.length}종 · 으뜸 답 ${SA_SCREEN.length} · ` +
            `읽은 값 ${saRead} 개 · 허용 ${TOL_SA_MASS}/${TOL_SA}`);

/* ★★ 커버리지 하한 — **조작이 가로채여도 조용히 통과하는 일**을 막는다.
   이웃 레포에서 실제로 났다: 배너가 단추를 덮어 클릭이 먹히지 않았는데 실패를 삼켜
   빈 화면을 훑고 통과했다. 「몇 개를 실제로 읽었는지」를 세면 그 자리에서 드러난다. */
const MIN_CELLS = 276 + COMPOSED_CASES.length + BRIDGE_CASES.length;
if (shownCells < MIN_CELLS)
  fail.push(`③ 화면에서 읽은 칸이 ${shownCells} 개뿐이다 — ${MIN_CELLS} 개 이상이어야 한다 (조작이 가로채였을 수 있다)`);
if (tableStates !== units)
  fail.push(`③ 표를 세운 상태가 ${tableStates} 가지 — 단위 수 ${units} 와 같아야 한다`);

console.log(`③ 화면 실측 — 표 상태 ${tableStates} 가지 · 읽은 칸 ${shownCells} 개 · ` +
            `허용에 가장 가까웠던 것 ${worst.r.toExponential(2)} (${worst.what}, 허용 ${worst.tol})`);

await browser.close();
srv.close();

if (fail.length) {
  console.error(`\n❌ 유효성 평가 게이트 ${fail.length} 건`);
  for (const f of fail) console.error(`   ${f}`);
  process.exit(1);
}
console.log("\n✅ 유효성 평가 게이트 통과");
