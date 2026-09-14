import { test } from "node:test";
import assert from "node:assert/strict";
import { criticalLevel, detectionLimit, minimumDetectableActivity, scanMdc } from "./mda.ts";
const near = (g: number, w: number, pct: number, what: string) =>
  assert.ok(Math.abs(g - w) / Math.abs(w) * 100 < pct, `${what}: ${g.toPrecision(6)} vs ${w}`);

test("Currie — 배경 100 계수에서 고전적인 값이 나온다", () => {
  // L_C = 1.645·√(2B) = 1.645·√200 = 23.26 계수
  near(criticalLevel(100), 1.645 * Math.SQRT2 * 10, 1e-9, "L_C");
  // L_D = k² + 2·L_C = 2.706 + 46.53 = 49.23  (관행식 2.71 + 4.65√B 와 같은 형태)
  near(detectionLimit(100), 1.645 ** 2 + 2 * criticalLevel(100), 1e-9, "L_D");
  near(detectionLimit(100), 2.71 + 4.65 * 10, 1.0, "관행식 2.71+4.65√B 와 1% 이내");
});

test("배경이 0 이면 L_C 는 0 이지만 L_D 는 k² 로 남는다", () => {
  assert.equal(criticalLevel(0), 0);
  near(detectionLimit(0), 1.645 ** 2, 1e-9, "L_D(0) = k²");
});

test("MDA — 세는 시간을 4배 늘리면 2배 좋아진다", () => {
  const base = { bgCps: 1, efficiency: 0.25 };
  const a = minimumDetectableActivity({ ...base, countTimeS: 60 }).mda;
  const b = minimumDetectableActivity({ ...base, countTimeS: 240 }).mda;
  assert.ok(b < a, "오래 세면 낮아진다");
  near(a / b, 2, 6, "√t 규칙 — 4배 시간이면 약 2배");
});

test("MDA — 효율이 절반이면 두 배로 나빠진다", () => {
  const p = { bgCps: 2, countTimeS: 300 };
  const a = minimumDetectableActivity({ ...p, efficiency: 0.4 }).mda;
  const b = minimumDetectableActivity({ ...p, efficiency: 0.2 }).mda;
  near(b / a, 2, 1e-6, "효율 반 → MDA 두 배");
});

test("스캔 MDC — 관측구간과 관찰자 효율", () => {
  const r = scanMdc({ bgCps: 300 / 60, scanSpeedCmPerS: 5, detectorWidthCm: 10,
                      efficiency: 0.2, surfaceEfficiency: 0.5, probeAreaCm2: 100 });
  near(r.observationIntervalS, 2, 1e-9, "10 cm 를 5 cm/s 로 = 2 s");
  assert.ok(r.mdcrSurveyor > r.mdcr, "관찰자 효율 보정은 MDC 를 올린다(보수적)");
  near(r.mdcrSurveyor / r.mdcr, Math.SQRT2, 1e-9, "p=0.5 → 1/√p = √2");
  assert.ok(r.scanMdc > 0 && Number.isFinite(r.scanMdc));
});

test("★ 느리게 훑으면 낮아진다 — 스캔 속도가 MDC 를 정한다", () => {
  const p = { bgCps: 5, detectorWidthCm: 10, efficiency: 0.2 };
  const fast = scanMdc({ ...p, scanSpeedCmPerS: 10 }).scanMdc;
  const slow = scanMdc({ ...p, scanSpeedCmPerS: 2.5 }).scanMdc;
  assert.ok(slow < fast, `느린 쪽 ${slow.toPrecision(4)} < 빠른 쪽 ${fast.toPrecision(4)}`);
  near(fast / slow, 2, 1e-6, "속도 4배 = MDC 2배");
});
