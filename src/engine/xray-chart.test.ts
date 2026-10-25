import { test } from "node:test";
import assert from "node:assert/strict";
import { polylinePath, energyTicks, fluenceTicks, scales } from "./xray-chart.ts";

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

test("energy ticks are round steps that end at or below the axis maximum", () => {
  assert.deepEqual(energyTicks(100), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(energyTicks(37), [0, 5, 10, 15, 20, 25, 30, 35]);
  assert.deepEqual(energyTicks(300), [0, 50, 100, 150, 200, 250, 300]);
  for (const kv of [20, 23, 57, 99, 143, 211, 300]) {
    const t = energyTicks(kv);
    assert.ok(t.length >= 4 && t.length <= 9, `${kv}: ${t}`);
    assert.ok(t[t.length - 1] <= kv, `${kv}: ${t}`);
  }
});

test("fluence ticks: tenths-based on the linear axis, decades on the log axis", () => {
  assert.deepEqual(fluenceTicks(false), [0, 0.2, 0.4, 0.6, 0.8, 1]);
  assert.deepEqual(fluenceTicks(true), [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1]);
});

test("scales put the axis maximum at the right edge and relative fluence 1 at the top", () => {
  const { sx, sy } = scales(box, { eMax: 80, log: false });
  assert.equal(sx(0), box.padL);
  assert.equal(sx(80), box.w - box.padR);
  assert.equal(sy(0), box.h - box.padB);
  assert.equal(sy(1), box.padT);
  const lg = scales(box, { eMax: 80, log: true });
  assert.equal(lg.sy(1), box.padT);
  assert.equal(lg.sy(1e-6), box.h - box.padB);
});
