/** 비방사능 유효성 평가 — 케이스 정본과 **엔진**을 전수 대조한다.
 *  기대값은 전부 `specific-activity.cases.ts` 에서 오고, 그 파일은 엔진을 import 하지 않는다.
 *  ★ 화면까지는 이 테스트가 못 본다 — `gate/check-validation.mjs` ⑥이 실측으로 잰다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import N from "../data/nuclides.json" with { type: "json" };
import { specificActivity, massFromActivity, activityFromMass } from "../engine/decay.ts";
import {
  DERIVATION_CASES, IDENTITY_CASES, MASS_REFS, WORKED_CASES, REFUSAL_CASES,
  APPROX_BOUNDS, U_KEV, N_A_REF,
  TOLERANCE_IDENTITY, TOLERANCE_WORKED, TOLERANCE_MASS,
} from "./specific-activity.cases.ts";

type Nuc = { a: number; m_u: number; t_half_s: number; sa_bq_g: number };
const NUC = N as unknown as Record<string, Nuc>;

const rel = (got: number, want: number) => Math.abs(got - want) / Math.abs(want);
const near = (got: number, want: number, tol: number, what: string) =>
  assert.ok(rel(got, want) <= tol,
    `${what}: ${got.toPrecision(12)} vs ${want.toPrecision(12)} (상대차 ${rel(got, want).toExponential(2)} > ${tol})`);

/* ── ① 유도에서 나온 상수 ──────────────────────────────────────────────── */

test("S-U-03 — 1 u 의 keV 등가가 CODATA 표값과 맞는다", () => {
  // 인용문에 적힌 값(931.494 103 72 MeV)을 케이스에서 다시 유도한 값과 비교한다.
  near(U_KEV, 931494.10372, 1e-11, "1 u [keV]");
  near(DERIVATION_CASES.find((c) => c.id === "S-U-03")!.expect, U_KEV, 1e-11, "S-U-03 기대값");
});

test("S-ID-05 — C-12 가 정확히 12 다 (u 의 정의)", () => {
  const c12 = MASS_REFS.find((r) => r.nuclide === "C-12");
  if (c12) assert.equal(c12.mGround_u, 12, "C-12 원자질량");
  // 자료에 C-12 가 없더라도(안정핵이라 없다) 추출기가 매 회 확인한다 — scripts/masses.py.
  assert.equal(IDENTITY_CASES.find((c) => c.id === "S-ID-05")!.expect, 12);
});

/* ── ② AME2020 추출이 옳은가 — 원문의 독립한 두 열이 맞는지 ─────────────── */

test("AME2020 질량결손 항등식  m = A + Δ/c²  — 147종 전수", () => {
  let worst = 0, who = "";
  for (const r of MASS_REFS) {
    const d = rel(r.a + r.excess_keV / U_KEV, r.mGround_u);
    if (d > worst) { worst = d; who = r.nuclide; }
  }
  assert.ok(worst < 1e-9, `최대 잔차 ${worst.toExponential(2)} (${who}) — 열을 잘못 읽었다`);
  assert.equal(MASS_REFS.length, Object.keys(NUC).length, "핵종 수");
});

test("이성질체는 들뜬 에너지만큼 무겁다", () => {
  const iso = MASS_REFS.filter((r) => r.exc_keV > 0);
  assert.ok(iso.length >= 30, `이성질체 ${iso.length}종`);
  for (const r of iso) {
    near(r.m_u, r.mGround_u + r.exc_keV / U_KEV, TOLERANCE_MASS, `이성질체 질량(${r.nuclide})`);
    assert.ok(r.excLine, `${r.nuclide}: NUBASE 원문 줄이 없다`);
  }
  for (const r of MASS_REFS.filter((x) => x.exc_keV === 0))
    assert.equal(r.m_u, r.mGround_u, `바닥상태(${r.nuclide})`);
});

test("옮긴 원문 줄이 전부 실려 있다 — 독자가 대조할 수 있어야 한다", () => {
  for (const r of MASS_REFS)
    assert.ok(r.line.includes(String(r.a)), `${r.nuclide}: 원문 줄이 비었거나 질량수와 안 맞는다`);
});

/* ── ③ 엔진의 데이터가 AME2020 과 같은가 ───────────────────────────────── */

test("데이터셋의 몰 질량이 AME2020 과 일치한다 — 147종 전수", () => {
  for (const r of MASS_REFS)
    near(NUC[r.nuclide].m_u, r.m_u, TOLERANCE_MASS, `몰 질량(${r.nuclide})`);
});

test("저장된 비방사능이 반감기·AME2020 몰 질량에서 다시 나온다 — 147종 전수", () => {
  const LN2 = Math.log(2);
  for (const r of MASS_REFS) {
    const n = NUC[r.nuclide];
    near(n.sa_bq_g, (LN2 * N_A_REF) / (n.t_half_s * r.m_u), TOLERANCE_WORKED, `비방사능(${r.nuclide})`);
  }
});

/* ── ④ **이 라운드의 발견** — 질량수 근사가 얼마나 틀렸나 ─────────────────── */

test("★ 질량수 근사는 「0.03% 이내」가 아니다 — 근사가 되살아나면 여기서 걸린다", () => {
  const off = MASS_REFS.map((r) => ({ r: Math.abs(r.m_u - r.a) / r.a, k: r.nuclide }));
  off.sort((x, y) => y.r - x.r);
  assert.ok(off[0].r >= APPROX_BOUNDS.worstAtLeast,
    `최악 ${(off[0].r * 100).toFixed(4)}% — 0.4% 보다 나빠야 한다`);
  assert.equal(off[0].k, APPROX_BOUNDS.worstNuclide, "최악의 핵종");
  assert.ok(off.filter((x) => x.r > 3e-4).length >= APPROX_BOUNDS.overOldClaimAtLeast,
    "0.03% 를 넘는 핵종 수");
  // 부호가 바뀐다 — 결합에너지의 모양이지 반올림이 아니다.
  const signs = new Set(MASS_REFS.map((r) => Math.sign(r.m_u - r.a)));
  assert.ok(signs.has(1) && signs.has(-1), "질량수와의 차가 양·음 모두 나와야 한다");
});

/* ── ⑤ 항등식 ─────────────────────────────────────────────────────────── */

test("S-ID-01 — 질량 ↔ 활성도 왕복, 147종 전수 양방향", () => {
  for (const [k, n] of Object.entries(NUC)) {
    near(massFromActivity(activityFromMass(2.5, n.sa_bq_g), n.sa_bq_g), 2.5, TOLERANCE_IDENTITY, `왕복 g(${k})`);
    near(activityFromMass(massFromActivity(7e9, n.sa_bq_g), n.sa_bq_g), 7e9, TOLERANCE_IDENTITY, `왕복 Bq(${k})`);
  }
});

test("S-ID-02·03·04·06 — 반비례·비례", () => {
  for (const [k, n] of Object.entries(NUC)) {
    near(specificActivity(2 * n.t_half_s, n.m_u) / specificActivity(n.t_half_s, n.m_u),
      0.5, TOLERANCE_IDENTITY, `T½ 두 배(${k})`);
    near(specificActivity(n.t_half_s, 2 * n.m_u) / specificActivity(n.t_half_s, n.m_u),
      0.5, TOLERANCE_IDENTITY, `M 두 배(${k})`);
    near(activityFromMass(10, n.sa_bq_g) / activityFromMass(1, n.sa_bq_g),
      10, TOLERANCE_IDENTITY, `질량 열 배(${k})`);
    near(activityFromMass(1, n.sa_bq_g), n.sa_bq_g, TOLERANCE_IDENTITY, `1 g 의 활성도(${k})`);
    near(massFromActivity(n.sa_bq_g, n.sa_bq_g), 1, TOLERANCE_IDENTITY, `비방사능만큼의 질량(${k})`);
  }
});

/* ── ⑥ 손계산 ─────────────────────────────────────────────────────────── */

test("손계산 케이스가 엔진과 10자리까지 맞는다", () => {
  for (const c of WORKED_CASES) {
    const n = NUC[c.nuclide];
    assert.ok(n, `${c.id}: ${c.nuclide} 없음`);
    const got =
      c.kind === "specificActivity" ? specificActivity(n.t_half_s, n.m_u)
      : c.kind === "massFromActivity" ? massFromActivity(c.input!, n.sa_bq_g)
      : activityFromMass(c.input!, n.sa_bq_g);
    near(got, c.expect, TOLERANCE_WORKED, `${c.id} ${c.title}`);
  }
});

/* ── ⑦ 거부 ───────────────────────────────────────────────────────────── */

test("★ 거부 동작 — 답이 없는 자리에서 수처럼 생긴 것을 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const got =
      c.kind === "specificActivity" ? specificActivity(c.args[0], c.args[1])
      : c.kind === "massFromActivity" ? massFromActivity(c.args[0], c.args[1])
      : activityFromMass(c.args[0], c.args[1]);
    assert.ok(Number.isNaN(got), `${c.id} ${c.title}: NaN 이어야 하는데 ${got}`);
  }
});

/* ── ⑧ 케이스 정본 자체의 건전성 ───────────────────────────────────────── */

test("케이스 id 가 겹치지 않고 손계산이 자료 안 핵종을 가리킨다", () => {
  const ids = [...DERIVATION_CASES, ...IDENTITY_CASES, ...WORKED_CASES, ...REFUSAL_CASES].map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "id 중복");
  for (const c of WORKED_CASES) assert.ok(NUC[c.nuclide], `${c.id}: ${c.nuclide}`);
  for (const c of [...DERIVATION_CASES, ...IDENTITY_CASES, ...WORKED_CASES])
    assert.ok(c.steps.length >= 3, `${c.id}: 손계산 단계가 ${c.steps.length}개뿐이다`);
});
