import { test } from "node:test";
import assert from "node:assert/strict";
import { infiniteMediumDoseRate, semiInfiniteSurfaceDoseRate, betaRange, betaRangeCm,
         betaMassAbsorption, betaTransmission, bremsstrahlungYield, bremsstrahlungPower } from "./beta.ts";
import { MEV_J } from "./constants.ts";
const near = (g: number, w: number, pct: number, what: string) =>
  assert.ok(Math.abs(g - w) / Math.abs(w) * 100 < pct, `${what}: ${g.toPrecision(6)} vs ${w}`);

test("무한매질 선량률은 에너지보존에서 정확하다", () => {
  // 1 MeV 평균 · 1 Bq/kg → 1 MeV/s/kg = 1.602e-13 Gy/s = 5.768e-10 Gy/h
  near(infiniteMediumDoseRate(1000, 1), MEV_J * 3600, 1e-9, "1 MeV·1 Bq/kg");
  near(infiniteMediumDoseRate(195.7, 1e6), 0.1957 * MEV_J * 1e6 * 3600, 1e-9, "Sr-90 1 MBq/kg");
  assert.equal(semiInfiniteSurfaceDoseRate(500, 1e6) * 2, infiniteMediumDoseRate(500, 1e6));
});

test("선량률은 농도·에너지에 정비례한다", () => {
  near(infiniteMediumDoseRate(300, 2e6) / infiniteMediumDoseRate(300, 1e6), 2, 1e-9, "농도 2배");
  near(infiniteMediumDoseRate(600, 1e6) / infiniteMediumDoseRate(300, 1e6), 2, 1e-9, "에너지 2배");
});

// ★ Katz–Penfold 비정 — 경험식이라 ±10% 로 본다
test("베타 비정 — 알려진 값과 자릿수·경향이 맞는다", () => {
  near(betaRange(1.0), 0.412, 0.1, "1 MeV 는 정의상 0.412 g/cm²");
  near(betaRange(2.2785), 1.10, 10, "Y-90(2.28 MeV) ≈ 1.1 g/cm²");
  near(betaRange(0.5459), 0.18, 15, "Sr-90(0.546 MeV) ≈ 0.18 g/cm²");
  assert.ok(betaRange(0.01859) < 0.001, `H-3 는 종잇장도 못 뚫는다: ${betaRange(0.01859)}`);
  assert.ok(betaRange(2) > betaRange(1) && betaRange(1) > betaRange(0.5), "단조 증가");
});

test("비정을 두께로 — 알루미늄(2.699)과 물(1.0)", () => {
  near(betaRangeCm(2.2785, 1.0), betaRange(2.2785), 1e-9, "물은 밀도 1 이라 같다");
  near(betaRangeCm(2.2785, 2.699), betaRange(2.2785) / 2.699, 1e-9, "알루미늄");
  assert.ok(betaRangeCm(2.2785, 2.699) < betaRangeCm(2.2785, 1.0), "밀한 재료가 더 짧다");
});

test("★ 비정을 넘으면 투과율은 0 이다 — 지수식은 0 으로 가지 않는다", () => {
  const E = 0.5459, R = betaRange(E);
  assert.equal(betaTransmission(E, 0), 1, "두께 0");
  assert.equal(betaTransmission(E, R), 0, "비정에서 정확히 0");
  assert.equal(betaTransmission(E, R * 2), 0, "비정 너머도 0");
  const t = betaTransmission(E, R / 4);
  assert.ok(t > 0 && t < 1, `중간은 0~1: ${t}`);
  near(t, Math.exp(-betaMassAbsorption(E) * R / 4), 1e-9, "지수 감쇠");
});

test("흡수계수는 에너지가 높을수록 작다", () => {
  assert.ok(betaMassAbsorption(0.156) > betaMassAbsorption(0.546));
  assert.ok(betaMassAbsorption(0.546) > betaMassAbsorption(2.28));
});

test("★ 제동복사가 저Z 차폐를 고르는 이유를 보인다", () => {
  const acrylic = bremsstrahlungYield(6, 2.2785);   // 탄소 ≈ 아크릴
  const lead = bremsstrahlungYield(82, 2.2785);
  assert.ok(lead / acrylic > 10, `납이 훨씬 많이 낸다: 납 ${lead.toPrecision(3)} vs 아크릴 ${acrylic.toPrecision(3)}`);
  near(lead / acrylic, 82 / 6, 1e-9, "Z 에 정비례");
  assert.ok(bremsstrahlungYield(82, 10) <= 1, "분율은 1 을 못 넘는다");
  assert.equal(bremsstrahlungYield(6, 0), 0);
});

test("제동복사 일률", () => {
  const r = bremsstrahlungPower({ activityBq: 3.7e10, eMaxMeV: 2.2785, eMeanMeV: 0.9323, z: 82 });
  near(r.yieldFrac, 3.5e-4 * 82 * 2.2785, 1e-9, "수율");
  near(r.photonPowerMeVPerS, 3.7e10 * 0.9323 * r.yieldFrac, 1e-9, "일률");
  near(r.meanPhotonMeV, 2.2785 / 3, 1e-9, "평균 광자에너지 어림");
});
