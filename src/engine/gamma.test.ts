import { test } from "node:test";
import assert from "node:assert/strict";
import att from "../data/attenuation.json" with { type: "json" };
import nuc from "../data/nuclides.json" with { type: "json" };
import { logInterp, type Row } from "./interp.ts";
import { gammaConstant, pointSourceDoseRate, linearAttenuation, shieldedDoseRate, bergerBuildup } from "./gamma.ts";
import type { NuclideMap } from "./types.ts";

const A = att as unknown as Record<string, Row[]>;
const N = nuc as unknown as NuclideMap;
const near = (got: number, want: number, pct: number, what: string) =>
  assert.ok(Math.abs(got - want) / want * 100 < pct,
    `${what}: 계산 ${got.toPrecision(5)} vs 기준 ${want} (${((got - want) / want * 100).toFixed(2)}%, 허용 ±${pct}%)`);

test("NIST 감쇠계수 — 문헌값과 0.5% 이내", () => {
  near(logInterp(A.air, 1.25, 2),   0.0266, 0.5, "공기 μen/ρ @1.25 MeV");
  near(logInterp(A.water, 1.0, 2),  0.0309, 0.5, "물 μen/ρ @1.0 MeV");
  near(logInterp(A.lead, 1.0, 1),   0.0710, 0.5, "납 μ/ρ @1.0 MeV");
  near(logInterp(A.lead, 0.662, 1), 0.1101, 1.5, "납 μ/ρ @662 keV (표점 사이 보간)");
  near(logInterp(A.iron, 1.0, 1),   0.0599, 0.5, "철 μ/ρ @1.0 MeV");
});

// ★ 골든 벡터 — 2026-09-13 에 IAEA+NIST 원천에서 계산해 문헌과 대조한 값.
//   엔진을 고치면 이 표가 먼저 깨진다.
const GAMMA_CONST: [string, number, number][] = [
  ["Cs-137", 0.0772, 2], ["I-131", 0.0518, 2], ["Cs-134", 0.2070, 2],
  ["Co-60", 0.3080, 2],  ["Ir-192", 0.1110, 2],
];
test("Γ 를 표에서 베끼지 않고 계산한다 — 문헌과 2% 이내 (δ=20 keV)", () => {
  for (const [k, ref, pct] of GAMMA_CONST) {
    assert.ok(N[k], `${k} 가 등록부에 없다`);
    near(gammaConstant(N[k], A.air, 20), ref, pct, `Γ(${k})`);
  }
});

test("★ δ 차단이 저에너지 방출체의 답을 좌우한다", () => {
  const am = gammaConstant(N["Am-241"], A.air, 20);
  const am10 = gammaConstant(N["Am-241"], A.air, 10);
  near(am, 0.0032, 20, "Γ(Am-241) δ=20");
  assert.ok(am10 / am > 5,
    `δ=10 이면 저에너지 X선이 지배해 값이 크게 뛰어야 한다 (실제 배수 ${(am10 / am).toFixed(1)})`);
});

test("점선원 선량률 — 역제곱이 정확히 성립한다", () => {
  const g = N["Co-60"].gamma_const;
  const at1 = pointSourceDoseRate(g, 37, 1);      // 37 GBq = 1 Ci
  const at2 = pointSourceDoseRate(g, 37, 2);
  near(at2, at1 / 4, 1e-9, "2배 거리 = 1/4");
  near(at1, g * 37, 1e-9, "1 m 에서 Ḋ = Γ·A");
});

test("차폐 — 반가층을 지나면 정확히 절반 (단색 근사·빌드업 없음)", () => {
  const E = 0.661657;                                          // 선과 같은 에너지를 쓴다
  const mu = linearAttenuation(A.lead, E, "lead");             // 1/cm
  const hvl = Math.LN2 / mu;
  const r = shieldedDoseRate({
    lines: [[661.657, 85.1]], air: A.air, shield: A.lead, material: "lead",
    activityGBq: 1, distanceM: 1, thicknessCm: hvl, mode: "attenuation",
  });
  near(r.transmission, 0.5, 1e-6, "납 반가층 투과율");  // 같은 에너지라 정확히 0.5
  near(mu, 0.1101 * 11.35, 1.5, "납 선감쇠계수 @662 keV");
});

test("빌드업은 1 이상이고 두께와 함께 는다", () => {
  assert.equal(bergerBuildup(0, 1.5, 0.05), 1);
  const b1 = bergerBuildup(2, 1.5, 0.05), b2 = bergerBuildup(4, 1.5, 0.05);
  assert.ok(b1 > 1 && b2 > b1, `B(2)=${b1} B(4)=${b2}`);
  assert.equal(bergerBuildup(3, NaN, 0.05), 1, "계수가 없으면 B=1 로 물러선다");
});

test("빌드업을 켜면 선량률이 올라간다 — 끄면 과소평가라는 뜻", () => {
  const base = { lines: [[661.657, 85.1]] as [number, number][], air: A.air, shield: A.lead,
                 material: "lead" as const, activityGBq: 37, distanceM: 1, thicknessCm: 2 };
  const off = shieldedDoseRate({ ...base, mode: "attenuation" });
  const on  = shieldedDoseRate({ ...base, mode: "buildup", berger: { a: 1.5, b: 0.05 } });
  assert.ok(on.doseRate > off.doseRate, `켠 쪽 ${on.doseRate} > 끈 쪽 ${off.doseRate}`);
});

// ★ 현장 경험칙 — 실무자가 외우고 있는 값이라 어긋나면 바로 의심받는다.
//   좁은빔(빌드업 없음) 계산이므로 2~3% 낮게 나오는 것이 정상이다.
const MGY_PER_R = 2.58e-4 * 33.97 * 1e3;   // 1 R 의 공기커마 = 8.764 mGy
test("현장 경험칙 — 1 Ci 를 1 m 에서", () => {
  const at1m = (k: string) => shieldedDoseRate({
    lines: N[k].lines, air: A.air, shield: A.lead, material: "lead",
    activityGBq: 37, distanceM: 1, thicknessCm: 0, mode: "none", deltaKeV: 20,
  }).doseRate / MGY_PER_R;
  near(at1m("Co-60"), 1.32, 4, "Co-60 ≈ 1.32 R/h");
  near(at1m("Cs-137"), 0.33, 4, "Cs-137 ≈ 0.33 R/h");
});

test("★ 조사선량률 환산 — mR/h 는 R/h 의 정확히 1000배다", () => {
  const perR = 1 / MGY_PER_R, permR = 1e3 / MGY_PER_R;
  near(permR / perR, 1000, 1e-9, "mR/h : R/h");
  near(1 * MGY_PER_R, 8.764, 0.1, "1 R = 8.76 mGy(공기)");
});

test("반가층이 재료 순서대로 는다 (662 keV)", () => {
  const hvl = (m: "lead" | "iron" | "concrete" | "water") =>
    Math.LN2 / linearAttenuation(A[m], 0.6617, m) * 10;   // mm
  assert.ok(hvl("lead") < hvl("iron"), `납 ${hvl("lead").toFixed(1)} < 철 ${hvl("iron").toFixed(1)}`);
  assert.ok(hvl("iron") < hvl("concrete"), "철 < 콘크리트");
  assert.ok(hvl("concrete") < hvl("water"), "콘크리트 < 물");
  near(hvl("lead"), 5.5, 10, "납 반가층 ≈5.5 mm (좁은빔)");
});
