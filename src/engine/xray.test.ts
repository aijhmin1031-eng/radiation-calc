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
