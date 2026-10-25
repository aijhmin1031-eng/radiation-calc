import { test } from "node:test";
import assert from "node:assert/strict";
import { polylinePath } from "./xray-chart.ts";

const box = { w: 800, h: 400, padL: 60, padR: 20, padT: 20, padB: 40 };

test("path uses only straight segments (no spline commands)", () => {
  const spec = [
    { energy: 0, fluence: 0 },
    { energy: 50, fluence: 1 },
    { energy: 100, fluence: 0 },
  ];
  const d = polylinePath(spec, box, { eMax: 100, fMax: 1, log: false });
  assert.ok(/^M[\d.\s-]+(L[\d.\s-]+)+$/.test(d.replace(/\s+/g, " ")), d);
  assert.ok(!/[CQSTAcqsta]/.test(d), "no curve commands");
});

test("log mode floors non-positive fluence (no NaN/-Infinity in path)", () => {
  const spec = [
    { energy: 0, fluence: 0 },
    { energy: 40, fluence: 1e-9 },
    { energy: 80, fluence: 1 },
  ];
  const d = polylinePath(spec, box, { eMax: 80, fMax: 1, log: true });
  assert.ok(!/(NaN|Infinity)/.test(d), d);
});
