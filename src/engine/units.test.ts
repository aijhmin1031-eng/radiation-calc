import { test } from "node:test";
import assert from "node:assert/strict";
import { convert, UNITS, exposureToAirKerma, airKermaToExposure, type Quantity } from "./units.ts";
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
