import { test } from "node:test";
import assert from "node:assert/strict";
import { bremSpectrum, meanEnergy } from "../engine/xray.ts";
import { XRAY_CASES } from "./xray.cases.ts";

for (const c of XRAY_CASES) {
  test(`brem mean energy ${c.kvp} kVp within ${c.tol * 100}% of SpekPy`, () => {
    const got = meanEnergy(bremSpectrum(c.kvp));
    const rel = Math.abs(got - c.meanEnergyKeV) / c.meanEnergyKeV;
    assert.ok(
      rel <= c.tol,
      `kVp ${c.kvp}: got ${got.toFixed(2)}, ref ${c.meanEnergyKeV}, rel ${(rel * 100).toFixed(2)}%`,
    );
  });
}
