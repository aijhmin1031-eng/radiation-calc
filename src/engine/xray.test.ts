import { test } from "node:test";
import assert from "node:assert/strict";
import { bremSpectrum, meanEnergy, KVP_MIN, KVP_MAX } from "./xray.ts";

test("endpoint: no fluence above kVp", () => {
  const s = bremSpectrum(100);
  assert.ok(s.every((p) => (p.energy > 100 ? p.fluence === 0 : true)));
  assert.equal(s.at(-1)!.energy, 100);
});

test("grid point reproduces the table mean energy (self-consistent)", () => {
  // 60 kV is a grid point; mean energy must be a sensible brem value (soft, < kVp/2)
  const m = meanEnergy(bremSpectrum(60));
  assert.ok(m > 10 && m < 30, `mean ${m}`);
});

test("interpolation between grid points stays between neighbours", () => {
  const m60 = meanEnergy(bremSpectrum(60));
  const m70 = meanEnergy(bremSpectrum(70));
  const m65 = meanEnergy(bremSpectrum(65));
  assert.ok(m65 > m60 - 0.5 && m65 < m70 + 0.5, `${m60} ${m65} ${m70}`);
});

test("out-of-range kVp clamps, never NaN/empty", () => {
  assert.ok(bremSpectrum(5).length > 0);
  const s = bremSpectrum(9999);
  assert.ok(s.length > 0 && s.every((p) => Number.isFinite(p.fluence)));
  assert.equal(KVP_MIN, 20);
  assert.equal(KVP_MAX, 300);
});

test("no interior zero bins below the endpoint (not a picket-fence comb)", () => {
  // The continuous bremsstrahlung must carry fluence at EVERY integer keV between the
  // low-energy onset and the endpoint. A zero at e.g. every odd keV renders as a comb.
  const s = bremSpectrum(100);
  const interior = s.filter((p) => p.energy >= 20 && p.energy <= 95);
  const zeros = interior.filter((p) => p.fluence === 0).map((p) => p.energy);
  assert.equal(zeros.length, 0, `interior zero bins at keV: ${zeros.join(", ")}`);
});

/* ★ 도구 쪽 「Worked examples」·「FAQ」의 수치를 고정한다(2026-10-25 D4). */
test("Worked examples — X선 스펙트럼 쪽에 적힌 수치를 엔진이 그대로 낸다", async () => {
  const { EX } = await import("../data/worked-examples.ts");
  const D = EX.xray;
  const mean = (kv: number) => meanEnergy(bremSpectrum(kv)).toFixed(1);
  const pct = (kv: number, lo: number, hi = Infinity, d = 0) => {
    const s = bremSpectrum(kv), all = s.reduce((a, p) => a + p.fluence, 0);
    return (s.filter((p) => p.energy >= lo && p.energy < hi).reduce((a, p) => a + p.fluence, 0) / all * 100).toFixed(d);
  };
  const peak = (kv: number) => String(bremSpectrum(kv).reduce((a, p) => (p.fluence > a.fluence ? p : a)).energy);
  assert.equal(mean(70), D.m70); assert.equal(mean(90), D.m90);
  assert.equal(pct(70, 0, 20), D.below20at70); assert.equal(pct(90, 0, 20), D.below20at90);
  assert.equal(pct(70, 50, Infinity, 1), D.above50at70); assert.equal(pct(90, 50, Infinity, 1), D.above50at90);
  assert.equal(mean(60), D.m60); assert.equal(mean(120), D.m120);
  assert.equal(pct(60, 40, Infinity, 1), D.above40at60); assert.equal(pct(120, 40, Infinity, 1), D.above40at120);
  assert.equal(peak(60), D.peakKeV); assert.equal(peak(120), D.peakKeV);
});
