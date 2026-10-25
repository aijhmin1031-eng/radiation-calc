import { test } from "node:test";
import assert from "node:assert/strict";
import { scanMdcDisplay, SCAN_UNIT } from "./scan-mdc-display.ts";

/* ★ 검증 사례 M-P-03(MARSSIM 6-43쪽, Tc-99 콘크리트) — 배경 300 cpm, 관측구간 2 s
 *   (폭 10 cm ÷ 5 cm/s), ε_i 0.36, ε_s 0.54, 탐침 126 cm², p 0.5, d′ 1.38.
 *   공표값 750 dpm/100 cm², 반올림 전 값 755.9. 화면 문자열을 그대로 고정한다. */
const MP03 = {
  bgCps: 300 / 60, scanSpeedCmPerS: 5, detectorWidthCm: 10, efficiency: 0.36,
  surfaceEfficiency: 0.54, probeAreaCm2: 126, observerEff: 0.5, dPrime: 1.38,
};

test("Scan MDC headline shows M-P-03 as 755.9 dpm/100 cm²", () => {
  const d = scanMdcDisplay(MP03);
  assert.equal(d.headline.value, "755.9");
  assert.equal(d.headline.unit, "dpm/100 cm²");
  assert.equal(SCAN_UNIT, "dpm/100 cm²");
});

test("Bq/cm² row divides by 6000, not multiplies", () => {
  assert.equal(scanMdcDisplay(MP03).inBqCm2, "0.126 Bq/cm²");
});

test("Halving the scan speed row is in dpm/100 cm² and lower by √2", () => {
  const d = scanMdcDisplay(MP03);
  assert.equal(d.halvedSpeed, "534.5 dpm/100 cm²");
  assert.ok(Math.abs(755.9 / 534.5 - Math.SQRT2) < 1e-3);
});
