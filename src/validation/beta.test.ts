/** 베타 유효성 평가 — 케이스 정본과 **엔진**을 전수 대조한다.
 *  기대값은 전부 `beta.cases.ts` 에서 오고, 그 파일은 엔진을 import 하지 않는다.
 *  ★ 화면까지는 이 테스트가 못 본다 — `gate/check-validation.mjs` ⑦이 실측으로 잰다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import N from "../data/nuclides.json" with { type: "json" };
import {
  infiniteMediumDoseRate, semiInfiniteSurfaceDoseRate, betaRange, betaRangeCm,
  betaMassAbsorption, betaTransmission, bremsstrahlungYield,
  BETA_RANGE_MIN_MEV, BETA_RANGE_BRANCH_MEV,
} from "../engine/beta.ts";
import {
  DERIVATION_CASES, IDENTITY_CASES, FIT_CASES, BRANCH_CASE, ESTAR, DETOUR_CASE,
  BREMS_PAIRS, BREMS_CASE, DATA_CASES, WORKED_CASES, REFUSAL_CASES, UNVERIFIED,
  TOLERANCE_EXACT, TOLERANCE_WORKED, TOLERANCE_DATA,
} from "./beta.cases.ts";

type Branch = { max: number | null; mean: number | null; i: number | null; kind: string };
type Nuc = { beta?: Branch[]; beta_max_keV?: number; beta_mean_keV?: number };
const NUC = N as unknown as Record<string, Nuc>;
const BETA = Object.entries(NUC).filter(([, n]) => n.beta_max_keV && n.beta_mean_keV);

const rel = (g: number, w: number) => (w === 0 ? Math.abs(g) : Math.abs(g - w) / Math.abs(w));
const near = (g: number, w: number, tol: number, what: string) =>
  assert.ok(rel(g, w) <= tol,
    `${what}: ${g.toPrecision(12)} vs ${w.toPrecision(12)} (상대차 ${rel(g, w).toExponential(2)} > ${tol})`);

/* ── ① 정확 — 에너지보존 ── */

test("B-U-02 — MeV·Bq/kg → Gy/h 의 환산인자", () => {
  const c = DERIVATION_CASES.find((x) => x.id === "B-U-02")!;
  near(infiniteMediumDoseRate(1000, 1), c.expect, TOLERANCE_EXACT, "1 MeV · 1 Bq/kg");
});

test("항등식 — 선형성·표면 절반·영점·가법성 (베타 자료 전수)", () => {
  const E = (k: string) => NUC[k].beta_mean_keV!;
  for (const [k] of BETA) {
    near(infiniteMediumDoseRate(E(k), 2e6) / infiniteMediumDoseRate(E(k), 1e6), 2, TOLERANCE_EXACT, `농도 2배(${k})`);
    near(infiniteMediumDoseRate(2 * E(k), 1e6) / infiniteMediumDoseRate(E(k), 1e6), 2, TOLERANCE_EXACT, `에너지 2배(${k})`);
    near(semiInfiniteSurfaceDoseRate(E(k), 1e6) / infiniteMediumDoseRate(E(k), 1e6), 0.5, TOLERANCE_EXACT, `표면 절반(${k})`);
    assert.equal(infiniteMediumDoseRate(E(k), 0), 0, `영 농도(${k})`);
    near(infiniteMediumDoseRate(E(k), 3e5 + 7e5), infiniteMediumDoseRate(E(k), 3e5) + infiniteMediumDoseRate(E(k), 7e5),
      TOLERANCE_EXACT, `가법성(${k})`);
  }
  assert.equal(IDENTITY_CASES.length, 5);
});

/* ── ② 경험식 — 형태 충실도 ── */

test("B-F-01·02 — 구현이 공표된 꼴과 같다 (가지 둘)", () => {
  for (const E of [0.01, 0.05, 0.2, 1.0, 2.0, 2.4999]) {
    const mg = 412 * E ** (1.265 - 0.0954 * Math.log(E));      // 공표된 꼴, mg/cm²
    near(betaRange(E), mg / 1000, TOLERANCE_WORKED, `저에너지 가지 ${E} MeV`);
  }
  for (const E of [2.5001, 3.0, 3.54, 10]) {
    const mg = 530 * E - 106;                                   // 공표된 꼴, mg/cm²
    near(betaRange(E), mg / 1000, TOLERANCE_WORKED, `고에너지 가지 ${E} MeV`);
  }
  assert.equal(BETA_RANGE_BRANCH_MEV, 2.5, "경계점");
  assert.equal(BETA_RANGE_MIN_MEV, 0.01, "적용 하한");
  assert.equal(FIT_CASES.length, 3);
});

test("B-F-04 — 두 가지의 간격이 가장 작은 곳 (경계점의 내부 증거)", () => {
  const low = (E: number) => 0.412 * E ** (1.265 - 0.0954 * Math.log(E));
  const high = (E: number) => 0.530 * E - 0.106;
  let best = { gap: Infinity, E: 0 };
  for (let E = BRANCH_CASE.searchFrom; E <= BRANCH_CASE.searchTo; E += 1e-4) {
    const g = Math.abs(high(E) - low(E)) / low(E);
    if (g < best.gap) best = { gap: g, E };
  }
  assert.ok(Math.abs(best.E - BRANCH_CASE.expectNear) <= BRANCH_CASE.expectTolerance,
    `간격 최소점 ${best.E.toFixed(4)} MeV — ${BRANCH_CASE.expectNear}±${BRANCH_CASE.expectTolerance} 이어야 한다`);
  assert.ok(best.gap < BRANCH_CASE.gapBelow, `최소 간격 ${(best.gap * 100).toFixed(4)}%`);
  // ★ 두 가지는 만나지 않는다 — 그래서 연속성으로 경계를 정할 수 없다는 것을 굳힌다.
  assert.ok(best.gap > 0, "두 적합이 정확히 만나면 이 케이스의 전제가 바뀐다");
});

test("비정은 단조 증가하고, 밀도로 나눈 두께와 어긋나지 않는다", () => {
  let prev = 0;
  for (let E = BETA_RANGE_MIN_MEV; E <= 4; E += 0.01) {
    const R = betaRange(E);
    assert.ok(R > prev, `단조 증가가 깨졌다 @${E.toFixed(2)} MeV`);
    prev = R;
  }
  for (const [E, rho] of [[1, 1], [2.2785, 1.19], [0.5459, 11.35]] as const)
    near(betaRangeCm(E, rho), betaRange(E) / rho, TOLERANCE_EXACT, `두께 환산 ${E} MeV / ${rho}`);
});

test("★ 투과율 — 두께 0 에서 1, 비정에서 정확히 0, 그 사이는 단조 감소", () => {
  for (const [k] of BETA) {
    const E = NUC[k].beta_max_keV! / 1000;
    const R = betaRange(E);
    if (!Number.isFinite(R)) continue;
    assert.equal(betaTransmission(E, 0), 1, `두께 0 (${k})`);
    assert.equal(betaTransmission(E, R), 0, `비정에서 0 (${k})`);
    assert.equal(betaTransmission(E, R * 1.5), 0, `비정 너머 0 (${k})`);
    let prev = 1;
    for (let f = 0.05; f < 1; f += 0.05) {
      const t = betaTransmission(E, R * f);
      assert.ok(t > 0 && t < prev, `단조 감소가 깨졌다 (${k} @${f.toFixed(2)}R)`);
      prev = t;
    }
    near(betaTransmission(E, R / 4), Math.exp(-betaMassAbsorption(E) * R / 4), TOLERANCE_EXACT, `지수 감쇠(${k})`);
  }
});

/* ── ESTAR — 양을 섞지 않는다 ── */

test("B-E-01 — 우회인자: 우리 비정 ÷ NIST 경로길이는 언제나 1 미만이다", () => {
  const rows = ESTAR[DETOUR_CASE.material].rows
    .filter((r) => r[0] >= DETOUR_CASE.fromMeV && r[0] <= DETOUR_CASE.toMeV);
  assert.ok(rows.length >= 30, `표본 ${rows.length}점`);
  let worst = 0;
  for (const [E, csda] of rows) {
    const f = betaRange(E) / csda;
    assert.ok(f < DETOUR_CASE.mustBeBelow,
      `우회인자 ${f.toFixed(4)} @${E} MeV — 1 을 넘으면 양을 잘못 짝지은 것이다`);
    if (f > worst) worst = f;
    if (E >= DETOUR_CASE.midBandFrom && E <= DETOUR_CASE.midBandTo)
      assert.ok(f >= DETOUR_CASE.midBandAtLeast, `중간대 우회인자 ${f.toFixed(4)} @${E} MeV 가 너무 작다`);
  }
  assert.ok(worst < 1, `최대 우회인자 ${worst.toFixed(4)}`);
});

test("B-E-02..05 — 제동복사의 Z 의존성을 NIST 복사수율과 대조한다", () => {
  const yieldAt = (mat: string, E: number) => {
    const r = ESTAR[mat].rows.find((x) => Math.abs(x[0] - E) < 1e-9);
    assert.ok(r, `${mat} 에 ${E} MeV 행이 없다`);
    return r![2];
  };
  for (const p of BREMS_PAIRS) {
    const zRatio = ESTAR[p.heavy].z / ESTAR[p.light].z;
    // 우리 식은 Z 에 정비례하므로 도구의 비가 Z 비와 같아야 한다 — 이것은 구현 확인이다.
    for (const E of BREMS_CASE.energiesMeV)
      near(bremsstrahlungYield(ESTAR[p.heavy].z, E) / bremsstrahlungYield(ESTAR[p.light].z, E),
        zRatio, TOLERANCE_EXACT, `${p.id} 도구의 비 @${E} MeV`);
    // 저Z 쌍은 NIST 와도 맞아야 한다 — 안 맞으면 대조 자체가 잘못된 것이다.
    if (p.id === "B-E-02")
      for (const E of BREMS_CASE.energiesMeV)
        near(yieldAt(p.heavy, E) / yieldAt(p.light, E), zRatio, BREMS_CASE.lowZPairTolerance,
          `${p.id} NIST 의 비 @${E} MeV`);
  }
});

/* ── ③ 자료 내부 정합 ── */

test("B-D-01 — 저장된 평균 베타에너지는 가지의 강도가중 평균이다 (전수)", () => {
  let worst = 0, who = "";
  for (const [k, n] of BETA) {
    const b = (n.beta ?? []).filter((x) => x.mean != null && x.i != null);
    if (!b.length) continue;
    const tot = b.reduce((s, x) => s + x.i!, 0);
    const wm = b.reduce((s, x) => s + x.i! * x.mean!, 0) / tot;
    const d = rel(wm, n.beta_mean_keV!);
    if (d > worst) { worst = d; who = k; }
    assert.ok(d <= TOLERANCE_DATA, `${DATA_CASES.weightedMean.id} ${k}: 가중평균 ${wm.toFixed(3)} vs 저장 ${n.beta_mean_keV}`);
  }
  assert.ok(BETA.length >= 30, `베타 자료 ${BETA.length}종`);
  console.log(`  · 가중평균 최대 상대차 ${worst.toExponential(2)} (${who}) · ${BETA.length}종`);
});

test("B-D-02 — 저장된 끝점은 가장 높은 가지의 끝점이다 (전수)", () => {
  for (const [k, n] of BETA) {
    const mx = (n.beta ?? []).filter((x) => x.max != null).map((x) => x.max!);
    if (!mx.length) continue;
    assert.equal(Math.max(...mx), n.beta_max_keV, `${DATA_CASES.maxIsMaxBranch.id} ${k}`);
  }
});

test("B-D-03 — 끝점이 희귀 가지인 핵종을 빠짐없이 센다", () => {
  const rare: string[] = [];
  for (const [k, n] of BETA) {
    const b = (n.beta ?? []).filter((x) => x.max != null);
    if (b.length < 2) continue;
    const mx = b.reduce((a, x) => (x.max! > a.max! ? x : a));
    if ((mx.i ?? 100) < DATA_CASES.rareBranch.thresholdPct) rare.push(k);
  }
  // 쪽이 이름을 들어 밝히므로, 하나라도 있으면 목록이 비어 있으면 안 된다.
  assert.ok(rare.length > 0, "희귀 가지 사례가 사라졌다 — 자료가 바뀌었으면 쪽의 설명도 고쳐야 한다");
  assert.ok(rare.includes("Co-60"), `Co-60 이 목록에 있어야 한다: ${rare.join(", ")}`);
  console.log(`  · 끝점이 ${DATA_CASES.rareBranch.thresholdPct}% 미만 가지인 핵종: ${rare.join(", ")}`);
});

/* ── 손계산 ── */

test("손계산 케이스가 엔진과 10자리까지 맞는다", () => {
  for (const c of WORKED_CASES) {
    const n = NUC[c.nuclide];
    assert.ok(n, `${c.id}: ${c.nuclide} 없음`);
    const got =
      c.kind === "doseRate" ? infiniteMediumDoseRate(n.beta_mean_keV!, c.input!)
      : c.kind === "surface" ? semiInfiniteSurfaceDoseRate(n.beta_mean_keV!, c.input!)
      : c.kind === "range" ? betaRange(n.beta_max_keV! / 1000)
      : c.kind === "rangeCm" ? betaRangeCm(n.beta_max_keV! / 1000, c.density!)
      : betaTransmission(n.beta_max_keV! / 1000, c.input!);
    near(got, c.expect, TOLERANCE_WORKED, `${c.id} ${c.title}`);
  }
});

/* ── 거부 ── */

test("★ 거부 동작 — 답이 없는 자리에서 수처럼 생긴 것을 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const got =
      c.kind === "range" ? betaRange(c.args[0])
      : c.kind === "rangeCm" ? betaRangeCm(c.args[0], c.args[1])
      : c.kind === "massAbsorption" ? betaMassAbsorption(c.args[0])
      : betaTransmission(c.args[0], c.args[1]);
    assert.ok(Number.isNaN(got), `${c.id} ${c.title}: NaN 이어야 하는데 ${got}`);
  }
});

/* ── 케이스 정본 자체의 건전성 ── */

test("케이스 id 가 겹치지 않고, 세우지 못한 것이 목록으로 남아 있다", () => {
  const ids = [...DERIVATION_CASES, ...IDENTITY_CASES, ...FIT_CASES, ...WORKED_CASES,
               ...REFUSAL_CASES, ...BREMS_PAIRS, ...UNVERIFIED,
               BRANCH_CASE, DETOUR_CASE, ...Object.values(DATA_CASES)].map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, `id 중복: ${ids.filter((x, i) => ids.indexOf(x) !== i)}`);
  for (const c of [...DERIVATION_CASES, ...IDENTITY_CASES, ...WORKED_CASES])
    assert.ok(c.steps.length >= 3, `${c.id}: 손계산 단계가 ${c.steps.length}개뿐이다`);
  // ★ 「세우지 못한 것」이 비면 보고서가 스스로를 과장하는 것이다.
  assert.ok(UNVERIFIED.length >= 5, `세우지 못한 것 ${UNVERIFIED.length}건`);
  for (const u of UNVERIFIED) assert.ok(u.why.length > 40, `${u.id}: 이유가 너무 짧다`);
});
