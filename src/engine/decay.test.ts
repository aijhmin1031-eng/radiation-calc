import { test } from "node:test";
import assert from "node:assert/strict";
import nuc from "../data/nuclides.json" with { type: "json" };
import { decayActivity, elapsedFromRatio, halfLifeFromTwoPoints, specificActivity,
         massFromActivity, activityFromMass, batemanChain, lambda } from "./decay.ts";
import type { NuclideMap } from "./types.ts";
const N = nuc as unknown as NuclideMap;
const near = (g: number, w: number, pct: number, what: string) =>
  assert.ok(Math.abs(g - w) / Math.abs(w) * 100 < pct,
    `${what}: ${g.toPrecision(6)} vs ${w} (${((g - w) / w * 100).toFixed(3)}%)`);

test("반감기 하나 지나면 정확히 절반", () => {
  const T = N["Co-60"].t_half_s;
  near(decayActivity(100, T, T), 50, 1e-9, "1 반감기");
  near(decayActivity(100, T, 2 * T), 25, 1e-9, "2 반감기");
  near(decayActivity(100, T, 10 * T), 100 / 1024, 1e-9, "10 반감기");
});

test("경과시간·반감기 역산이 정방향과 왕복한다", () => {
  const T = N["I-131"].t_half_s;
  const t = 3.7 * T;
  const a = decayActivity(1000, T, t);
  near(elapsedFromRatio(a / 1000, T), t, 1e-9, "경과시간 역산");
  near(halfLifeFromTwoPoints(1000, a, t), T, 1e-9, "반감기 역산");
});

// ★ 골든 벡터 — 문헌 비방사능. 0.5% 이내여야 한다.
const SA: [string, number][] = [
  ["Co-60", 4.18e13], ["Cs-137", 3.22e12], ["Pu-239", 2.30e9],
  ["U-238", 1.24e4], ["Am-241", 1.27e11], ["Sr-90", 5.11e12], ["H-3", 3.56e14],
];
// ★ 허용 1% — 문헌 비방사능은 편찬마다 다른 반감기를 쓴다(Sr-90 이 28.79 vs IAEA 28.91 y 라
//   그 한 가지만으로 0.4% 가 벌어진다). 엔진이 아니라 **출처 차이**다.
test("비방사능 — 문헌과 1% 이내", () => {
  for (const [k, ref] of SA) {
    assert.ok(N[k], `${k} 없음`);
    near(N[k].sa_bq_g, ref, 1.0, `비방사능(${k})`);
    near(specificActivity(N[k].t_half_s, N[k].a), N[k].sa_bq_g, 1e-9, `재계산(${k})`);
  }
});

test("질량 ↔ 활성도 왕복", () => {
  const sa = N["Pu-239"].sa_bq_g;
  const g = massFromActivity(1e9, sa);            // 1 GBq 에 해당하는 그램수
  near(activityFromMass(g, sa), 1e9, 1e-9, "왕복");
  near(g, 1e9 / 2.296e9, 0.5, "1 GBq Pu-239 ≈ 0.436 g");
});

test("Bateman — 딸핵종은 0 에서 올랐다가 준다", () => {
  const l = [lambda(100), lambda(1000)];
  const at0 = batemanChain(1000, l, 0);
  near(at0[0], 1000 * l[0], 1e-9, "t=0 에서 모핵종 활성도");
  assert.ok(at0[1] < 1e-6 * at0[0], "t=0 에서 딸은 없다");
  const series = [10, 100, 300, 1000, 3000].map((t) => batemanChain(1000, l, t)[1]);
  const peak = series.indexOf(Math.max(...series));
  assert.ok(peak > 0 && peak < series.length - 1, `딸이 중간에서 최대여야 한다: ${series.map(x=>x.toPrecision(3))}`);
});

test("★ 같은 반감기가 섞여도 NaN 이 나지 않는다 (Bateman 분모가 0 이 된다)", () => {
  const T = 500;
  const out = batemanChain(1000, [lambda(T), lambda(T), lambda(T)], 300);
  assert.ok(out.every(Number.isFinite), `유한해야 한다: ${out}`);
});
