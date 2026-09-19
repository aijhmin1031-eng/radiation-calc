/** 작업계획(ALARA) 유효성 평가 — 케이스 정본과 **엔진**을 전수 대조한다.
 *  ★ 대조할 바깥 자료가 없는 도구이므로 **유도·항등식·거부** 셋이 전부다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inverseSquare, distanceForRate, stayTime, collectiveDose, hvlFromMu, tvlFromMu } from "../engine/alara.ts";
import {
  DERIVATION_CASES, EXTENT_CASE, IDENTITY_CASES, WORKED_CASES, REFUSAL_CASES, UNVERIFIED,
  TOLERANCE_EXACT, TOLERANCE_WORKED,
} from "./alara.cases.ts";

const rel = (g: number, w: number) => (w === 0 ? Math.abs(g) : Math.abs(g - w) / Math.abs(w));
const near = (g: number, w: number, tol: number, what: string) =>
  assert.ok(rel(g, w) <= tol,
    `${what}: ${g.toPrecision(12)} vs ${w.toPrecision(12)} (상대차 ${rel(g, w).toExponential(2)} > ${tol})`);

const RATES = [0.01, 0.5, 2, 137];
const DISTS = [0.1, 1, 3.7, 50];

/* ── 항등식 ── */

test("A-ID-01·02·03 — 역제곱의 기하", () => {
  for (const r of RATES) for (const d of DISTS) {
    near(inverseSquare(r, d, 2 * d) / inverseSquare(r, d, d), 0.25, TOLERANCE_EXACT, `거리 2배(${r}@${d})`);
    near(inverseSquare(3 * r, d, 2 * d) / inverseSquare(r, d, 2 * d), 3, TOLERANCE_EXACT, `세기 3배(${r}@${d})`);
    for (const t of [r / 100, r / 4, r * 2]) {
      const dd = distanceForRate(r, d, t);
      near(inverseSquare(r, d, dd), t, TOLERANCE_EXACT, `왕복(${r}@${d}→${t})`);
    }
  }
});

test("A-ID-04·05 — 반가층·십가층", () => {
  for (const mu of [0.01, 0.5, 1.2, 37]) {
    near(tvlFromMu(mu) / hvlFromMu(mu), Math.log2(10), TOLERANCE_EXACT, `TVL/HVL(µ=${mu})`);
    near(hvlFromMu(2 * mu) / hvlFromMu(mu), 0.5, TOLERANCE_EXACT, `µ 2배 HVL(${mu})`);
    near(tvlFromMu(2 * mu) / tvlFromMu(mu), 0.5, TOLERANCE_EXACT, `µ 2배 TVL(${mu})`);
  }
});

test("A-ID-06·07·08 — 체류시간과 집단선량", () => {
  for (const r of RATES) {
    near(stayTime(1, r / 2) / stayTime(1, r), 2, TOLERANCE_EXACT, `선량률 절반(${r})`);
    // 화면이 곁들이는 두 값이 같은 항등식이다.
    near(stayTime(1, r / 4), stayTime(1, inverseSquare(r, 1, 2)), TOLERANCE_EXACT, `거리 2배 = 율 1/4 (${r})`);
  }
  const one = [{ workers: 3, hours: 4, rate: 0.5 }];
  const split = [{ workers: 3, hours: 2, rate: 0.5 }, { workers: 3, hours: 2, rate: 0.5 }];
  near(collectiveDose(split), collectiveDose(one), TOLERANCE_EXACT, "작업을 쪼개도 같다");
  near(collectiveDose([{ workers: 6, hours: 4, rate: 0.5 }]) / collectiveDose(one), 2, TOLERANCE_EXACT, "인원 2배");
  assert.equal(collectiveDose([]), 0, "빈 계획은 0");
  assert.equal(IDENTITY_CASES.length, 8);
});

/* ── ★★ 가정이 깨지는 자리 — 정확한 수학이라 바깥 자료가 필요 없다 ── */

test("★ A-E-01 — 점선원 근사는 언제나 과대평가하고, 세 길이쯤 떨어지면 1% 안에 든다", () => {
  /** 선선원 정확해 ÷ 점근사 = arctan(x)/x,  x = L/(2d) */
  const ratio = (dOverL: number) => { const x = 1 / (2 * dOverL); return Math.atan(x) / x; };
  let prev = -1;
  for (const r of EXTENT_CASE.ratios) {
    const f = ratio(r);
    assert.ok(f < 1, `d=${r}L: 비 ${f} 가 1 미만이어야 한다 — 점근사는 과대평가다`);
    assert.ok(f > prev, `d=${r}L: 멀어질수록 1 에 가까워져야 한다`);
    prev = f;
  }
  const over = (r: number) => 1 / ratio(r) - 1;
  assert.ok(over(1) > EXTENT_CASE.atOneL_above,
    `d=L 에서 과대평가 ${(over(1) * 100).toFixed(2)}% — 한 길이로는 부족하다는 것이 요점이다`);
  assert.ok(over(3) < EXTENT_CASE.atThreeL_below,
    `d=3L 에서 과대평가 ${(over(3) * 100).toFixed(3)}%`);
  // 목표 과대평가마다 필요한 거리를 푼다 — 단조라 이분법이 된다.
  for (const t of EXTENT_CASE.targets) {
    let lo = 0.1, hi = 1000;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (over(m) > t) lo = m; else hi = m; }
    const d = (lo + hi) / 2;
    assert.ok(Number.isFinite(d) && d > 0, `목표 ${t}: 거리 ${d}`);
    near(over(d), t, 1e-6, `목표 ${t} 에서의 과대평가`);
  }
  console.log(`  · 점근사 과대평가 — d=L ${(over(1) * 100).toFixed(2)}% · d=3L ${(over(3) * 100).toFixed(3)}% · d=10L ${(over(10) * 100).toFixed(3)}%`);
});

/* ── 손계산 ── */

test("손계산 케이스가 엔진과 10자리까지 맞는다", () => {
  for (const c of WORKED_CASES) {
    const i = c.input;
    const got = c.kind === "rate" ? inverseSquare(i.rate1, i.d1, i.d2)
      : c.kind === "distance" ? distanceForRate(i.rate1, i.d1, i.target)
      : c.kind === "stay" ? stayTime(i.doseLimit, i.doseRate)
      : c.kind === "collective" ? collectiveDose(c.tasks!)
      : c.kind === "hvl" ? hvlFromMu(i.mu) : tvlFromMu(i.mu);
    near(got, c.expect, TOLERANCE_WORKED, `${c.id} ${c.title}`);
  }
});

/* ── 거부 ── */

test("★ 거부 동작 — 답이 없는 자리에서 수처럼 생긴 것을 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const a = c.args;
    const got = c.kind === "rate" ? inverseSquare(a.rate1, a.d1, a.d2)
      : c.kind === "distance" ? distanceForRate(a.rate1, a.d1, a.target)
      : c.kind === "stay" ? stayTime(a.doseLimit, a.doseRate)
      : c.kind === "collective" ? collectiveDose(c.tasks!)
      : hvlFromMu(a.mu);
    assert.ok(Number.isNaN(got), `${c.id} ${c.title}: NaN 이어야 하는데 ${got}`);
  }
  assert.ok(REFUSAL_CASES.length >= 9, `거부 케이스 ${REFUSAL_CASES.length}건`);
});

test("★ 선량률이 정확히 0 일 때만 무제한이다 — 「모름」과 가른다", () => {
  assert.equal(stayTime(20, 0), Infinity, "진짜 0 은 무제한");
  for (const bad of [NaN, -1, -0.0001, Infinity, -Infinity])
    assert.ok(Number.isNaN(stayTime(20, bad)), `선량률 ${bad} 은 답 없음이어야 한다`);
  // ★ 한도 쪽도 같은 분기를 쓴다 — 함께 센다.
  for (const bad of [NaN, -20, Infinity])
    assert.ok(Number.isNaN(stayTime(bad, 1)), `한도 ${bad} 은 답 없음이어야 한다`);
});

/* ── 케이스 정본 자체의 건전성 ── */

test("케이스 id 가 겹치지 않고, 세우지 못한 것이 목록으로 남아 있다", () => {
  const ids = [...DERIVATION_CASES, ...IDENTITY_CASES, ...WORKED_CASES, ...REFUSAL_CASES,
               ...UNVERIFIED, EXTENT_CASE].map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, `id 중복: ${ids.filter((x, i) => ids.indexOf(x) !== i)}`);
  for (const c of [...DERIVATION_CASES, ...IDENTITY_CASES, ...WORKED_CASES])
    assert.ok(c.steps.length >= 3, `${c.id}: 단계가 ${c.steps.length}개뿐이다`);
  assert.ok(UNVERIFIED.length >= 5, `세우지 못한 것 ${UNVERIFIED.length}건`);
  for (const u of UNVERIFIED) assert.ok(u.why.length > 40, `${u.id}: 이유가 너무 짧다`);
});
