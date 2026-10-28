/** 수확 자료 바로잡기 — Kβ 묶음 줄 이중 계산 제거 · β− 가지 보충 · Γ 다시 굽기 (2026-10-29).
 *
 *  ★★ 결함 하나 — **Kβ X선을 두 번 셌다.** `harvest.py` 는 `rad_types=g` 를 받는데, 그 응답의 X선에는
 *    Kβ **전체**(KB) 줄과 그 **구성** 줄(K′β1 · K′β2)이 이름표 없이 함께 들어 있다. 셋을 다 실어 Kβ 가
 *    두 번 들어갔다 — I-125 의 31.359 keV 25.574% = 31.093 keV 21.014% + 31.698 keV 4.560%.
 *    Γ 가 I-125 −12.5% · Tl-201 −14.6% · Cd-109 −12.1% 만큼 높았고, 무른 줄이 남아 납 반가층은 낮았다
 *    (In-111 이 고치면 +31%).
 *  ★ 판별은 **이름표로** 한다 — `rad_types=x` 는 같은 줄에 shell(L · KA2 · KA1 · KpB1 · KB · KpB2)을 붙인다.
 *    같은 부모 준위 · 같은 원소(딸핵 d_symbol — Ir-192 는 β−→Pt · EC→Os 로 K X선이 두 벌) 안에서, KB 가
 *    K′β1 과 K′β2 사이에 있고(K′β1 하나뿐이면 그보다 위) 저장된 세기가 구성 줄 합과 **1%** 안에서 같으면 뺀다.
 *    가벼운 원소처럼 KB 와 K′β1 이 같은 줄(같은 에너지 · 같은 세기)이면 묶음이 아니다 — 수확이 이미 하나로 합쳤다.
 *    구성 줄은 남긴다. 1% 는 원천 세기가 두 자리뿐인 줄 때문이다(Eu-152m1 5.2 = 4.1 + 1.07, 0.58%).
 *  ★ **수치만으로 고르면 틀린다** — 「한 줄 = 두 줄의 합 · 에너지가 그 사이」는 무거운 원소에서 Kα1 ≈ Kα2 + Kβ 로
 *    우연히 맞는다(Re-188m · Ta-182). Cs-137 의 Kα2 도 L + K′β1 과 맞는다. 이름표 없이 빼면 진짜 줄이 빠진다.
 *  ★ 구성 줄이 0.001% 문턱에서 걸러진 경우 — 둘 다 없으면(Th-232) KB 가 유일한 표현이라 남긴다. K′β1 만 있고 K′β2 가 빠졌으면
 *    (Eu-152 의 Gd · Y-90 · Pu-239 · U-234 · Ba-133m · Nb-95m) KB 를 남기고 K′β1 을 뺀다 — KB 를 빼면 K′β2 몫이 사라지고 두면 K′β1 을
 *    두 번 센다. 판정은 원천의 K′β2 세기를 더해 합이 1% 안인지로 한다. 규칙이 구성 줄을 **자료에서** 찾기 때문에 가능한 구분이다.
 *
 *  ★★ 결함 둘 — **β− 가지가 비어 있었다.** β·α 수확(커밋 4a22cd6)은 스크립트가 남지 않았고, 순수 방출체에 가까운
 *    35종에만 가지가 실렸다. Cs-137 · Ir-192 · Lu-177 같은 쪽 13종이 베타 사정거리 · 제동복사 표 없이 서 있었다.
 *    기존 35종과 **같은 규칙**으로 채운다: `rad_types=bm`, 그 키의 부모 준위만, 세기 0.001% 초과,
 *    요약은 최대 E_max · 세기 가중 평균 · 세기 합. ★ β− 합이 1% 미만인 흔적 가지(Tc-99m 0.0037% 등 IT 이성질체)는
 *    싣지 않는다 — 실으면 Tc-99m 쪽에 베타 표가 선다. ★ 합이 105% 를 넘는 원천(Rh-106m 116.75%, ENSDF 2007)은
 *    싣지 않는다 — `data.test.ts` 의 이성질체 혼입 검사와 같은 선이다.
 *
 *  ★ Γ(`gamma_const`)는 굽는 단계가 남아 있지 않았고, 저장 값이 엔진 `gammaConstant()` 와 7종에서 어긋나
 *    있었다(Eu-152 −0.37%). 쪽은 엔진으로 다시 계산하고 순위 · 배수는 저장 값을 쓰므로 둘이 같아야 한다 —
 *    **모든 키를 엔진으로 다시 굽는다**(δ = 20 keV, 소수 여섯째 자리).
 *
 *  ★ 자료를 다시 수확하지 않는다 — 9-13 수확 뒤 Live Chart 값이 갱신된 핵종이 있어(Ra-223 83.8 keV 25.4 → 25.5%)
 *    다시 받으면 관계없는 숫자까지 바뀐다. 이름표 · β 가지만 원천에서 읽고, 고치는 것은 위 셋뿐이다.
 *  ★ 파일은 **원문을 그 자리에서 고친다** — `JSON.stringify` 로 다시 쓰면 파이썬이 쓴 `166344192.0` 이
 *    `166344192` 로 바뀌어 손대지 않은 값까지 diff 에 오른다. 새로 넣는 수는 파이썬 표기로 쓴다.
 *  ★ 두 번 돌려도 같다 — 뺀 줄은 다시 찾지 않고, 가지가 있는 키는 건너뛴다.
 *
 *  씀: npm run clean-dataset        원응답은 .cache/livechart/ 에 받아 두고 다시 쓴다
 *      npm run clean-dataset -- --dry   쓰지 않고 바뀔 것만 보인다
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gammaConstant } from "../src/engine/gamma.ts";
import { DELTA_DEFAULT_KEV } from "../src/engine/constants.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DATA = join(ROOT, "src/data/nuclides.json");
const CACHE = join(ROOT, ".cache/livechart");
const DRY = process.argv.includes("--dry");
const AIR = JSON.parse(readFileSync(join(ROOT, "src/data/attenuation.json"), "utf8")).air;

const KB_REL = 0.01, E_TOL = 5e-4, BETA_MIN_PCT = 1, BETA_MAX_PCT = 105, I_FLOOR = 0.001;

async function get(rt, base) {
  mkdirSync(CACHE, { recursive: true });
  const p = join(CACHE, `${rt}_${base}.csv`);
  if (existsSync(p)) return readFileSync(p, "utf8");
  const u = `https://nds.iaea.org/relnsd/v1/data?fields=decay_rads&nuclides=${base}&rad_types=${rt}`;
  const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`${u} → ${r.status}`);
  const t = await r.text();
  writeFileSync(p, t);
  await new Promise((s) => setTimeout(s, 250));
  return t;
}
const csv = (t) => {
  const [h, ...rows] = t.trim().split(/\r?\n/);
  const H = h.split(",");
  return rows.filter((r) => r.replace(/,/g, "")).map((r) => Object.fromEntries(r.split(",").map((v, i) => [H[i], v])));
};
const baseOf = (k) => { const m = k.match(/^([A-Z][a-z]?)-(\d+)/); return `${m[2]}${m[1].toLowerCase()}`; };

/** 키 → 부모 준위. harvest.py 와 같은 규칙: 0 이 바닥, 준위가 둘이면 「m」, 셋 이상이면 m1 · m2 … 를 에너지 순으로. */
function parentLevel(n, gRows) {
  if (n.iso === "") return 0;
  const pos = [...new Set(gRows.filter((r) => r.energy).map((r) => Math.round(+r.p_energy * 1000) / 1000))].filter((x) => x > 0).sort((a, b) => a - b);
  return n.iso === "m" ? pos[0] : pos[+n.iso.slice(1) - 1];
}
const atLevel = (r, pe) => Math.abs(+r.p_energy - pe) < 1e-3;

/** 파이썬 float repr — 정수값은 「.0」, 지수는 10⁻⁴ 미만 · 10¹⁶ 이상에서 두 자리로. */
function py(x) {
  if (x === null) return "null";
  if (!Number.isFinite(x)) throw new Error(`수가 아니다: ${x}`);
  const [m, ex] = x.toExponential().split("e"), p = +ex;
  if (p < -4 || p >= 16) return `${m}e${p < 0 ? "-" : "+"}${String(Math.abs(p)).padStart(2, "0")}`;
  return Number.isInteger(x) ? `${x}.0` : String(x);
}
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

/** 원문에서 키 하나의 객체 구간 [시작, 끝) — 문자열 안에 괄호가 없는 자료라 괄호 수만 센다. */
function span(text, key) {
  const s = text.indexOf(`${JSON.stringify(key)}:{`);
  if (s < 0) throw new Error(`키 없음 ${key}`);
  let i = text.indexOf("{", s), d = 0;
  for (; i < text.length; i++) { if (text[i] === "{") d++; else if (text[i] === "}" && --d === 0) return [s, i + 1]; }
  throw new Error(`객체 끝 없음 ${key}`);
}

const raw = readFileSync(DATA, "utf8");
const N = JSON.parse(raw);
let text = raw;
const log = { kbeta: [], kbetaKept: [], beta: [], betaSkipped: [], gamma: [] };

for (const key of Object.keys(N)) {
  const n = N[key], base = baseOf(key);
  const needLines = n.lines.length > 0, needBeta = !n.beta;
  if (!needLines && !needBeta) continue;
  const gRows = csv(await get("g", base));
  if (!gRows.length) continue;                      // 감마 응답이 비는 순수 방출체(fill.py 가 채운 것) — 고칠 줄도 부모 준위도 없다
  const pe = parentLevel(n, gRows);

  /* ① Kβ 묶음 줄 */
  const drop = [];
  if (needLines) {
    const x = csv(await get("x", base)).filter((r) => atLevel(r, pe));
    const at = (e) => n.lines.find((l) => Math.abs(l[0] - e) < E_TOL);
    for (const kb of x.filter((r) => r.shell === "KB")) {
      const same = x.filter((r) => r.d_symbol === kb.d_symbol);
      const c1 = same.find((r) => r.shell === "KpB1"), c2 = same.find((r) => r.shell === "KpB2");
      const L = at(+kb.energy), J1 = c1 && at(+c1.energy), J2 = c2 && at(+c2.energy);
      if (!L) continue;                               // 0.001% 아래라 처음부터 실리지 않은 KB
      // ★ 가벼운 원소는 Kβ 가 갈리지 않아 원천이 KB 와 K′β1 을 **같은 줄**로 두 번 낸다(Co-57 7.082 keV 6.80128% 둘).
      //   harvest.py 가 그 둘을 이미 하나로 합쳤으므로 자료에는 한 줄뿐이다 — 그 줄은 Kβ 의 유일한 표현이라 빼면 안 된다.
      //   그래서 구성 줄이 KB 와 **에너지가 다른 별개의 줄**일 때만 묶음으로 본다(처음 판이 이것을 놓쳐 13줄을 잘못 뺐다).
      const between = c1 && (c2 ? +kb.energy > +c1.energy && +kb.energy < +c2.energy : +kb.energy > +c1.energy);
      const sum = (J1?.[1] ?? 0) + (J2?.[1] ?? 0);
      if (J1 && J1 !== L && (!c2 || (J2 && J2 !== L)) && between && Math.abs(L[1] - sum) <= KB_REL * L[1]) {
        drop.push(L);
        log.kbeta.push({ key, element: kb.d_symbol, kb: L, kpb1: J1, kpb2: J2 ?? null });
      } else if (J1 && J1 !== L && c2 && !J2 && between && Math.abs(L[1] - (J1[1] + +c2.intensity)) <= KB_REL * L[1]) {
        // ★ 구성 줄이 **하나만** 자료에 있는 경우(Eu-152 의 Gd: K′β1 은 있고 K′β2 는 없다) — 묶음 줄을 빼면 K′β2 몫이 사라지고,
        //   그대로 두면 K′β1 을 두 번 센다. 묶음 줄을 남기고 **있는 구성 줄을 뺀다**(Kβ 세기의 합이 그대로 남는다).
        drop.push(J1);
        log.kbeta.push({ key, element: kb.d_symbol, kb: L, kpb1: J1, kpb2: null, kept: "KB", dropped: "K′β1" });
      } else log.kbetaKept.push({ key, element: kb.d_symbol, kb: L, why: !J1 || (c2 && !J2) ? "구성 줄이 자료에 없다 — 묶음 줄이 유일한 표현" : !between ? "에너지가 구성 줄 사이가 아니다" : "세기 합이 1% 밖" });
    }
  }
  const lines = n.lines.filter((l) => !drop.includes(l));

  /* ② β− 가지 */
  let beta = null;
  if (needBeta) {
    const bm = csv(await get("bm", base)).filter((r) => atLevel(r, pe) && r.mean_energy !== "" && +r.intensity_beta > I_FLOOR);
    const br = bm.map((r) => ({ max: r.max_energy === "" ? null : +r.max_energy, mean: +r.mean_energy, i: +r.intensity_beta, kind: "b-" })).sort((a, b) => b.i - a.i);
    const Y = br.reduce((s, b) => s + b.i, 0);
    if (br.length && Y >= BETA_MIN_PCT && Y <= BETA_MAX_PCT) {
      beta = { beta: br, beta_mean_keV: round(br.reduce((s, b) => s + b.mean * b.i, 0) / Y, 2), beta_max_keV: Math.max(...br.map((b) => b.max ?? 0)), beta_yield_pct: round(Y, 3) };
      log.beta.push({ key, pe, branches: br.length, ...beta, beta: undefined });
    } else if (br.length) log.betaSkipped.push({ key, pe, yieldPct: round(Y, 3), why: Y < BETA_MIN_PCT ? `β− 합 ${round(Y, 4)}% — 흔적 가지` : `β− 합 ${round(Y, 2)}% — 원천 세기 합이 105% 를 넘는다` });
  }

  /* ③ 원문 고치기 — 이 키의 구간 안에서만 */
  if (!drop.length && !beta) continue;
  const [s, e] = span(text, key);
  let obj = text.slice(s, e);
  const ls = obj.indexOf(`"lines":[`);
  let le = ls + `"lines":`.length;
  for (let d = 0; ; le++) { if (obj[le] === "[") d++; else if (obj[le] === "]" && --d === 0) { le++; break; } }
  // 줄 토큰은 원문 표기를 그대로 살린다 — 뺀 줄만 지운다
  const kept = obj.slice(ls + `"lines":[`.length, le - 1).match(/\[[^\[\]]*\]/g) ?? [];
  const keptText = kept.filter((tok) => { const [a, b] = JSON.parse(tok); return !drop.some((d) => d[0] === a && d[1] === b); });
  if (keptText.length !== lines.length) throw new Error(`${key}: 줄 수가 맞지 않는다 ${keptText.length} ≠ ${lines.length}`);
  let after = `"lines":[${keptText.join(",")}]`;
  if (beta) after += `,"beta":[${beta.beta.map((b) => `{"max":${py(b.max)},"mean":${py(b.mean)},"i":${py(b.i)},"kind":"b-"}`).join(",")}],"beta_mean_keV":${py(beta.beta_mean_keV)},"beta_max_keV":${py(beta.beta_max_keV)},"beta_yield_pct":${py(beta.beta_yield_pct)}`;
  obj = obj.slice(0, ls) + after + obj.slice(le);
  text = text.slice(0, s) + obj + text.slice(e);
}

/* ④ Γ 다시 굽기 — 모든 키 */
const M = JSON.parse(text);
for (const key of Object.keys(M)) {
  const g = round(gammaConstant(M[key], AIR, DELTA_DEFAULT_KEV), 6);
  if (g === M[key].gamma_const) continue;
  const [s, e] = span(text, key);
  const obj = text.slice(s, e).replace(/"gamma_const":[^,}]+/, `"gamma_const":${g === 0 ? "0" : py(g)}`);
  log.gamma.push({ key, from: M[key].gamma_const, to: g, pct: M[key].gamma_const ? round((100 * (g - M[key].gamma_const)) / M[key].gamma_const, 3) : null });
  text = text.slice(0, s) + obj + text.slice(e);
}

/* ⑤ 확인 — 고친 원문을 다시 읽어 뜻이 맞는지, 손대지 않은 키는 글자까지 같은지 */
const R = JSON.parse(text);
for (const key of Object.keys(N)) {
  const touched = log.kbeta.some((x) => x.key === key) || log.beta.some((x) => x.key === key) || log.gamma.some((x) => x.key === key);
  if (!touched && text.slice(...span(text, key)) !== raw.slice(...span(raw, key))) throw new Error(`${key}: 손대지 않았는데 글자가 바뀌었다`);
  const g = round(gammaConstant(R[key], AIR, DELTA_DEFAULT_KEV), 6);
  if (g !== R[key].gamma_const) throw new Error(`${key}: 저장 Γ ${R[key].gamma_const} ≠ 엔진 ${g}`);
}

console.log(`Kβ 묶음 줄 ${log.kbeta.length}줄 뺌 (${new Set(log.kbeta.map((x) => x.key)).size}키) · 남긴 KB ${log.kbetaKept.length}`);
console.log(`β− 가지 보충 ${log.beta.length}키 · 싣지 않음 ${log.betaSkipped.length}(${log.betaSkipped.map((x) => `${x.key} ${x.why}`).join(" · ")})`);
console.log(`Γ 다시 구움 ${log.gamma.length}키`);
// ★ 기록은 바꾼 것이 있을 때만 쓴다 — 두 번째 실행(바꿀 것 0)이 첫 실행의 기록을 빈 기록으로 덮어 검사를 헛돌게 한 적이 있다
if (DRY || text !== raw) writeFileSync(join(ROOT, ".cache/clean-dataset-log.json"), JSON.stringify(log, null, 1));
if (DRY) console.log("(--dry: 쓰지 않았다 · 기록 .cache/clean-dataset-log.json)");
else if (text !== raw) { writeFileSync(DATA, text); console.log(`✏️  ${DATA}`); }
else console.log("바뀐 것 없음");
