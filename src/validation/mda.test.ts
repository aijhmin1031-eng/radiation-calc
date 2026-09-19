/** 검출하한 유효성 평가 — 케이스 정본과 **엔진**을 전수 대조한다.
 *  ★ 중심은 **MARSSIM 이 본문에 실은 수치 예제 셋**이다 — 남이 공표한 숫자를 재현하는지가
 *    유도만 맞고 답이 다른 일을 막는다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { criticalLevel, detectionLimit, minimumDetectableActivity, scanMdc } from "../engine/mda.ts";
import {
  DERIVATION_CASES, IDENTITY_CASES, PUBLISHED_CASES, DPRIME_TABLE, CONSTANT_CASE,
  WORKED_CASES, REFUSAL_CASES, UNVERIFIED,
  TOLERANCE_EXACT, TOLERANCE_WORKED, TOLERANCE_PUBLISHED,
} from "./mda.cases.ts";

const rel = (g: number, w: number) => (w === 0 ? Math.abs(g) : Math.abs(g - w) / Math.abs(w));
const near = (g: number, w: number, tol: number, what: string) =>
  assert.ok(rel(g, w) <= tol,
    `${what}: ${g.toPrecision(12)} vs ${w.toPrecision(12)} (상대차 ${rel(g, w).toExponential(2)} > ${tol})`);

/** 관측구간 i 초를 만든다 — 엔진은 폭/속도로 받는다. */
const scanAt = (c: typeof PUBLISHED_CASES[number]) => scanMdc({
  bgCps: c.input.bgCpm / 60,
  scanSpeedCmPerS: 5, detectorWidthCm: 5 * c.input.intervalS,
  efficiency: c.input.efficiency ?? 0.2,
  surfaceEfficiency: c.input.surfaceEfficiency,
  probeAreaCm2: c.input.probeAreaCm2,
  dPrime: c.input.dPrime, observerEff: c.input.observerEff,
});

/* ── ★ MARSSIM 의 공표 예제 — 이 보고서의 중심 ── */

test("★ MARSSIM 이 본문에 실은 수치 예제 셋을 엔진이 재현한다", () => {
  for (const c of PUBLISHED_CASES) {
    const r = scanAt(c);
    near(r.observationIntervalS, c.input.intervalS, TOLERANCE_EXACT, `${c.id} 관측구간`);
    const got = c.quantity === "mdcr" ? r.mdcr : r.scanMdc;
    near(got, c.published, TOLERANCE_PUBLISHED, `${c.id} ${c.title} (${c.locator})`);
    assert.ok(c.note.length > 20, `${c.id}: 차이의 출처가 적혀 있어야 한다`);
  }
  // ★ 앞의 둘은 **정확히** 맞아야 한다 — 원문이 반올림 없이 적은 값이다.
  for (const id of ["M-P-01", "M-P-02"]) {
    const c = PUBLISHED_CASES.find((x) => x.id === id)!;
    near(scanAt(c).mdcr, c.published, TOLERANCE_WORKED, `${id} 는 자리까지 일치해야 한다`);
  }
});

test("★ d′ 표 — 1.38 은 「참양성 95% · 거짓양성 60%」다", () => {
  const first = DPRIME_TABLE.find((r) => r.dPrime === 1.38)!;
  assert.equal(first.falsePositive, 0.60, "1.38 의 거짓양성 비율");
  assert.equal(first.truePositive, 0.95, "1.38 의 참양성 비율");
  // 25% 칸은 2.32 다 — 화면이 1.38 을 그렇게 적고 있었다.
  const quarter = DPRIME_TABLE.find((r) => r.falsePositive === 0.25)!;
  assert.equal(quarter.dPrime, 2.32);
  assert.ok(quarter.dPrime > first.dPrime, "더 엄격한 기준이 더 큰 d′ 를 요구한다");
  // ★ 화면 도움말이 되살아나면 여기서는 못 잡는다 — 게이트 ①-6 이 본다.
});

/* ── 통계 — 유도와 항등식 ── */

test("M-U-01·02 — L_C 와 L_D 의 꼴", () => {
  for (const k of [1.645, 1.96, 2.326]) {
    for (const B of [0, 1, 25, 100, 1500]) {
      near(criticalLevel(B, k), k * Math.sqrt(2 * B), TOLERANCE_EXACT, `L_C(B=${B}, k=${k})`);
      near(detectionLimit(B, k), k * k + 2 * k * Math.sqrt(2 * B), TOLERANCE_EXACT, `L_D(B=${B}, k=${k})`);
    }
  }
  assert.equal(DERIVATION_CASES.length, 4);
});

test("항등식 — 반비례·구조관계·√t", () => {
  const base = { bgCps: 2, countTimeS: 300, efficiency: 0.4 };
  for (const c of IDENTITY_CASES) {
    if (c.kind === "effInverse")
      for (const bg of [0, 1, 5, 50])
        near(minimumDetectableActivity({ ...base, bgCps: bg, efficiency: 0.2 }).mda
           / minimumDetectableActivity({ ...base, bgCps: bg, efficiency: 0.4 }).mda,
          c.expect, TOLERANCE_EXACT, `${c.id} @bg=${bg}`);
    if (c.kind === "yieldInverse")
      near(minimumDetectableActivity({ ...base, yieldFrac: 0.3 }).mda
         / minimumDetectableActivity({ ...base, yieldFrac: 0.6 }).mda, c.expect, TOLERANCE_EXACT, c.id);
    if (c.kind === "qtyInverse")
      near(minimumDetectableActivity({ ...base, sampleQty: 2 }).mda
         / minimumDetectableActivity({ ...base, sampleQty: 1 }).mda, c.expect, TOLERANCE_EXACT, c.id);
    if (c.kind === "ldIsLcPlus")
      for (const k of [1.645, 1.96, 2.326])
        for (const B of [0, 10, 100, 1000])
          near(detectionLimit(B, k) - 2 * criticalLevel(B, k), k * k, TOLERANCE_EXACT, `${c.id} @B=${B}, k=${k}`);
    if (c.kind === "zeroBg") {
      assert.equal(criticalLevel(0), 0, `${c.id} L_C(0)`);
      near(detectionLimit(0), 1.645 ** 2, TOLERANCE_EXACT, `${c.id} L_D(0)`);
    }
    if (c.kind === "sqrtTime") {
      /* ★★ **점근 방향을 거꾸로 적었다가 테스트가 잡았다**(2026-09-19). k² 항은 1/t 로,
         나머지는 1/√t 로 줄므로 **짧은 쪽에 k² 가 더 무겁게 걸린다** — 비는 2 보다 크고
         배경이 커질수록 **위에서** 2 로 내려온다. 「대충 2」가 아니라 **모양**을 잰다. */
      const ratio = (bg: number) =>
        minimumDetectableActivity({ bgCps: bg, countTimeS: 100, efficiency: 0.25 }).mda
        / minimumDetectableActivity({ bgCps: bg, countTimeS: 400, efficiency: 0.25 }).mda;
      let prev = Infinity;
      for (const bg of [5, 50, 500, 5000]) {
        const r = ratio(bg);
        assert.ok(r > c.expect, `${c.id} @bg=${bg}: 비 ${r} 가 2 보다 커야 한다`);
        assert.ok(r < prev, `${c.id} @bg=${bg}: 배경이 커질수록 2 에 가까워져야 한다`);
        prev = r;
      }
      near(ratio(5000), c.expect, 2e-3, `${c.id} 높은 배경에서 점근`);
    }
    if (c.kind === "surveyorSqrt")
      for (const p of [0.5, 0.25, 1]) {
        const r = scanMdc({ bgCps: 5, scanSpeedCmPerS: 5, detectorWidthCm: 10, efficiency: 0.2, observerEff: p });
        near(r.mdcrSurveyor / r.mdcr, 1 / Math.sqrt(p), TOLERANCE_EXACT, `${c.id} @p=${p}`);
      }
  }
  assert.equal(IDENTITY_CASES.length, 7);
});

/* ── MARSSIM 상수와의 차이 ── */

test("M-C-01 — MARSSIM 의 상수 3 과 우리 k² 의 차이를 잰다", () => {
  const k = 1.645;
  let worst = 0, best = 1;
  for (const B of CONSTANT_CASE.backgrounds) {
    const ours = detectionLimit(B, k);
    const marssim = 3 + 2 * k * Math.SQRT2 * Math.sqrt(B);
    near(marssim - ours, CONSTANT_CASE.absoluteGap, TOLERANCE_EXACT, `절대차 @B=${B}`);
    assert.ok(marssim > ours === CONSTANT_CASE.marssimIsLarger, `MARSSIM 쪽이 더 크다 @B=${B}`);
    const r = (marssim - ours) / ours;
    if (B === 0) worst = r;
    if (B === 10000) best = r;
  }
  assert.ok(worst >= CONSTANT_CASE.worstAtLeast, `배경 0 에서 상대차 ${(worst * 100).toFixed(2)}%`);
  assert.ok(best <= CONSTANT_CASE.bestAtMost, `배경 10000 에서 상대차 ${(best * 100).toFixed(4)}%`);
  console.log(`  · 절대차 ${CONSTANT_CASE.absoluteGap.toFixed(6)} 계수 (배경 무관) · ` +
              `상대차 ${(worst * 100).toFixed(2)}% (B=0) → ${(best * 100).toFixed(4)}% (B=10⁴)`);
});

/* ── 손계산 ── */

test("손계산 케이스가 엔진과 10자리까지 맞는다", () => {
  for (const c of WORKED_CASES) {
    const i = c.input;
    const B = i.bgCps * (i.countTimeS ?? 1);
    const got = c.kind === "lc" ? criticalLevel(B, i.k)
      : c.kind === "ld" ? detectionLimit(B, i.k)
      : minimumDetectableActivity({
          bgCps: i.bgCps, countTimeS: i.countTimeS!, efficiency: i.efficiency!,
          yieldFrac: i.yieldFrac, sampleQty: i.sampleQty, k: i.k }).mda;
    near(got, c.expect, TOLERANCE_WORKED, `${c.id} ${c.title}`);
  }
});

/* ── 거부 ── */

test("★ 거부 동작 — 답이 없는 자리에서 수처럼 생긴 것을 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const a = c.args;
    const got = c.kind === "lc" ? criticalLevel(a.bgCounts, a.k)
      : c.kind === "ld" ? detectionLimit(a.bgCounts, a.k)
      : c.kind === "mda" ? minimumDetectableActivity(a as never).mda
      : scanMdc(a as never).scanMdc;
    assert.ok(Number.isNaN(got), `${c.id} ${c.title}: NaN 이어야 하는데 ${got}`);
  }
  assert.ok(REFUSAL_CASES.length >= 9, `거부 케이스 ${REFUSAL_CASES.length}건`);
});

/* ── 케이스 정본 자체의 건전성 ── */

test("케이스 id 가 겹치지 않고, 세우지 못한 것이 목록으로 남아 있다", () => {
  const ids = [...DERIVATION_CASES, ...IDENTITY_CASES, ...PUBLISHED_CASES, ...WORKED_CASES,
               ...REFUSAL_CASES, ...UNVERIFIED, CONSTANT_CASE].map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, `id 중복: ${ids.filter((x, i) => ids.indexOf(x) !== i)}`);
  for (const c of [...DERIVATION_CASES, ...IDENTITY_CASES, ...PUBLISHED_CASES, ...WORKED_CASES])
    assert.ok(c.steps.length >= 3, `${c.id}: 단계가 ${c.steps.length}개뿐이다`);
  assert.ok(UNVERIFIED.length >= 4, `세우지 못한 것 ${UNVERIFIED.length}건`);
  for (const u of UNVERIFIED) assert.ok(u.why.length > 40, `${u.id}: 이유가 너무 짧다`);
});
