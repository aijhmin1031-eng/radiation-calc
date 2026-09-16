import { test } from "node:test";
import assert from "node:assert/strict";
import { convert, UNITS, exposureToAirKerma, airKermaToExposure,
         massConcFromVolConc, volConcFromMassConc, type Quantity } from "./units.ts";
import { inverseSquare, distanceForRate, stayTime, collectiveDose, hvlFromMu, tvlFromMu } from "./alara.ts";
const near = (g: number, w: number, pct: number, what: string) =>
  assert.ok(Math.abs(g - w) / Math.abs(w) * 100 < pct, `${what}: ${g.toPrecision(8)} vs ${w}`);

test("정의값 환산은 정확하다", () => {
  near(convert(1, "Ci", "Bq", "activity"), 3.7e10, 1e-9, "1 Ci");
  near(convert(1, "Bq", "dpm", "activity"), 60, 1e-9, "1 Bq = 60 dpm");
  near(convert(1, "rad", "Gy", "dose"), 0.01, 1e-9, "1 rad");
  near(convert(1, "rem", "Sv", "equivalent"), 0.01, 1e-9, "1 rem");
  near(convert(1, "R", "C/kg", "exposure"), 2.58e-4, 1e-9, "1 R");
  near(convert(1, "µCi", "Bq", "activity"), 37000, 1e-9, "1 µCi = 37 kBq");
});

test("표면오염 — dpm/100cm² 는 현장에서 제일 많이 틀리는 자리다", () => {
  near(convert(6000, "dpm/100cm²", "Bq/cm²", "surface"), 1, 1e-9, "6000 dpm/100cm² = 1 Bq/cm²");
  near(convert(1, "Bq/cm²", "Bq/m²", "surface"), 1e4, 1e-9, "1 Bq/cm² = 10⁴ Bq/m²");
});

/* ★★ **왕복만 보는 검사는 배율이 틀린 것을 못 본다**(2026-09-16 감사).
 *   `Bq/L` 이 질량 군에 잘못 들어가 1000배 틀린 채로 이 파일 전체를 통과하고 있었다 —
 *   자기 자신과 왕복하는 것은 배율이 무엇이든 성립하기 때문이다.
 *   그래서 **군마다 바깥 기준으로 확인한 쌍**을 아래에 따로 단정한다. */
const CROSS: [Quantity, string, number, string, number][] = [
  ["activity",   "Ci",         1, "GBq",   37],
  ["activity",   "mCi",        1, "MBq",   37],
  ["activity",   "kBq",        1, "dpm",   6e4],
  ["dose",       "Gy",         1, "mrad",  1e5],
  ["equivalent", "mSv",        1, "mrem",  100],
  ["exposure",   "mR",         1, "µR",    1000],
  ["surface",    "dpm/100cm²", 1, "Bq/m²", 1e4/6000],
  ["surface",    "µCi/cm²",    1, "kBq/m²", 3.7e5],
  ["massConc",   "Bq/g",       1, "Bq/kg", 1000],
  ["massConc",   "pCi/g",      1, "Bq/kg", 37],
  ["massConc",   "MBq/kg",     1, "kBq/kg", 1000],
  ["volConc",    "Bq/mL",      1, "Bq/L",  1000],
  ["volConc",    "Bq/L",       1, "Bq/m³", 1000],
  ["volConc",    "pCi/L",      1, "Bq/L",  0.037],
  ["volConc",    "µCi/mL",     1, "MBq/L", 37],
  ["volConc",    "kBq/L",      1, "Bq/mL", 1],
];
test("★ 군마다 바깥 기준으로 확인한 쌍 — 왕복이 못 보는 자리", () => {
  for (const [q, from, v, to, want] of CROSS)
    near(convert(v, from, to, q), want, 1e-9, `${v} ${from} → ${to}`);
});

/* ★★ 군이 다시 섞이는 것을 **구조로** 막는다. 사고는 「Bq/L 을 질량 군에 넣은 것」이었고,
 *   값을 하나씩 단정하는 것만으로는 다음에 늘어나는 단위를 못 지킨다. */
test("★ 농도 군은 분모를 섞지 않는다 — 질량은 질량끼리, 부피는 부피끼리", () => {
  const denom = (u: string) => u.split("/")[1] ?? "";
  const MASS = ["g", "kg"], VOL = ["L", "mL", "m³"];
  for (const u of Object.keys(UNITS.massConc.u))
    assert.ok(MASS.includes(denom(u)), `massConc 에 부피 단위가 섞였다: ${u}`);
  for (const u of Object.keys(UNITS.volConc.u))
    assert.ok(VOL.includes(denom(u)), `volConc 에 질량 단위가 섞였다: ${u}`);
  // 두 군이 같은 단위를 들면 화면에서 어느 쪽으로 환산됐는지 알 수 없다
  const shared = Object.keys(UNITS.massConc.u).filter((u) => u in UNITS.volConc.u);
  assert.deepEqual(shared, [], `두 농도 군이 같은 단위를 든다: ${shared.join(", ")}`);
});

test("★ 질량 ↔ 부피는 환산이 아니라 밀도다 — 표로는 건널 수 없다", () => {
  // 그전 판이 여기서 1000배 틀렸다: 1 Bq/L 을 1 Bq/g 이라고 답했다.
  assert.ok(Number.isNaN(convert(1, "Bq/L", "Bq/g", "massConc")), "표는 군을 건너지 않는다");
  assert.ok(Number.isNaN(convert(1, "pCi/g", "pCi/L", "volConc")), "반대 방향도 같다");

  near(massConcFromVolConc(1), 1e-3, 1e-9, "물 1 Bq/L = 0.001 Bq/g");
  near(massConcFromVolConc(1) * 1000, 1, 1e-9, "물 1 Bq/L = 1 Bq/kg");
  near(massConcFromVolConc(convert(1, "pCi/L", "Bq/L", "volConc")) * 1000, 0.037, 1e-9,
       "먹는물: 1 pCi/L = 0.037 Bq/kg");
  near(massConcFromVolConc(1, 0.8) * 1000, 1.25, 1e-9, "밀도 0.8 이면 질량당 농도가 커진다");
  near(volConcFromMassConc(massConcFromVolConc(7.3, 1.2), 1.2), 7.3, 1e-9, "왕복");
  assert.ok(Number.isNaN(massConcFromVolConc(1, 0)), "밀도 0 은 NaN");
});

test("모든 단위가 자기 자신과 왕복한다", () => {
  for (const q of Object.keys(UNITS) as Quantity[])
    for (const u of Object.keys(UNITS[q].u)) {
      near(convert(convert(7.3, u, UNITS[q].base, q), UNITS[q].base, u, q), 7.3, 1e-9, `${q}/${u}`);
      assert.ok(Number.isFinite(convert(1, u, u, q)) && convert(1, u, u, q) === 1, `${u}→${u}`);
    }
});

test("모르는 단위는 NaN 으로 막는다 — 조용히 0 을 내지 않는다", () => {
  assert.ok(Number.isNaN(convert(1, "없는단위", "Bq", "activity")));
});

test("★ 조사선량 ↔ 공기커마는 환산이 아니라 물리다 (W값)", () => {
  const ak = exposureToAirKerma(convert(1, "R", "C/kg", "exposure"));
  near(ak, 2.58e-4 * 33.97, 1e-9, "1 R 의 공기커마");
  near(ak * 1000, 8.764, 0.1, "1 R ≈ 8.76 mGy(공기)");
  near(airKermaToExposure(ak), 2.58e-4, 1e-9, "왕복");
});

test("역제곱과 거리 역산이 왕복한다", () => {
  near(inverseSquare(100, 1, 2), 25, 1e-9, "2배 거리");
  near(inverseSquare(100, 2, 1), 400, 1e-9, "절반 거리");
  near(distanceForRate(100, 1, 25), 2, 1e-9, "25 로 낮추려면 2 m");
  assert.ok(Number.isNaN(inverseSquare(100, 0, 1)), "거리 0 은 NaN");
});

test("체류가능시간·집단선량", () => {
  near(stayTime(20, 2.5), 8, 1e-9, "20 mSv 한도 / 2.5 mSv·h⁻¹ = 8 h");
  assert.equal(stayTime(20, 0), Infinity, "선량률 0 이면 무한");
  near(collectiveDose([{ workers: 4, hours: 3, rate: 0.5 },
                        { workers: 2, hours: 1, rate: 2 }]), 10, 1e-9, "집단선량");
});

test("반가층·십가층", () => {
  const mu = 1.25;
  near(hvlFromMu(mu), Math.LN2 / mu, 1e-9, "HVL");
  near(tvlFromMu(mu) / hvlFromMu(mu), Math.log(10) / Math.LN2, 1e-9, "TVL/HVL = log₂10 ≈ 3.32");
  near(Math.exp(-mu * hvlFromMu(mu)), 0.5, 1e-9, "HVL 투과율 0.5");
  near(Math.exp(-mu * tvlFromMu(mu)), 0.1, 1e-9, "TVL 투과율 0.1");
});
