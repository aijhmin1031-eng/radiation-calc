import { MEV_J } from "./constants";

/** 베타 — **정확히 유도되는 것만** 싣는다.
 *
 *  ★ 피부선량(VARSKIN 급)은 **일부러 넣지 않는다.** 점커널 적분과 선원 형상·덮개
 *    가정이 필요한데, 그것을 「단순 계산기」의 한 줄 숫자로 내면 실제보다 몇 배 틀린 값을
 *    확신 있게 보여 주게 된다. 여기 있는 것은 에너지보존에서 바로 나오는 무한매질
 *    선량률과, 출처가 분명한 경험식(비정·흡수·제동복사)뿐이다. */

/** 무한매질 베타 선량률 — 에너지보존에서 **정확하다**.
 *  방출된 베타 에너지가 전부 그 자리에 잠기므로 Ḋ = Ē·A/m.
 *  @param eMeanKeV 평균 베타 에너지, @param concBqPerKg 매질 중 농도 → [Gy/h] */
export function infiniteMediumDoseRate(eMeanKeV: number, concBqPerKg: number): number {
  return (eMeanKeV / 1000) * MEV_J * concBqPerKg * 3600;
}

/** 반무한매질 표면 — 위쪽이 비어 있으니 정확히 절반이다. */
export const semiInfiniteSurfaceDoseRate = (eMeanKeV: number, concBqPerKg: number) =>
  infiniteMediumDoseRate(eMeanKeV, concBqPerKg) / 2;

/** 베타 비정 — Katz–Penfold 경험식 [g/cm²].
 *  ★ 경험식이다(±10% 수준). 0.01~3 MeV 밖에서는 다른 가지를 쓴다. */
export function betaRange(eMaxMeV: number): number {
  if (!(eMaxMeV > 0)) return NaN;
  if (eMaxMeV <= 3) return 0.412 * Math.pow(eMaxMeV, 1.265 - 0.0954 * Math.log(eMaxMeV));
  return 0.530 * eMaxMeV - 0.106;
}

/** 그 비정을 실제 두께로 — 밀도로 나눈다 [cm]. */
export const betaRangeCm = (eMaxMeV: number, densityGcm3: number) =>
  densityGcm3 > 0 ? betaRange(eMaxMeV) / densityGcm3 : NaN;

/** 베타 질량흡수계수 경험식 [cm²/g] — 얇은 흡수체의 투과율 어림에 쓴다. */
export const betaMassAbsorption = (eMaxMeV: number) =>
  eMaxMeV > 0 ? 17 / Math.pow(eMaxMeV, 1.14) : NaN;

/** 흡수체 투과율 — **비정을 넘으면 0 이다**(지수식은 0 으로 안 가므로 잘라 준다). */
export function betaTransmission(eMaxMeV: number, thicknessGcm2: number): number {
  if (thicknessGcm2 <= 0) return 1;
  if (thicknessGcm2 >= betaRange(eMaxMeV)) return 0;
  return Math.exp(-betaMassAbsorption(eMaxMeV) * thicknessGcm2);
}

/** 제동복사 수율 — 두꺼운 표적 경험식  f ≈ 3.5×10⁻⁴·Z·E_max(MeV).
 *  ★ 어림이다. 차폐재를 **낮은 Z 로 고르는 이유**를 보이는 것이 이 계산의 목적이다
 *    (납으로 베타를 막으면 X선이 새 문제로 돌아온다). */
export function bremsstrahlungYield(z: number, eMaxMeV: number): number {
  const f = 3.5e-4 * z * eMaxMeV;
  return Math.min(Math.max(f, 0), 1);
}

/** 제동복사로 나가는 일률 [MeV/s] 과 그 평균 광자에너지(≈E_max/3 어림). */
export function bremsstrahlungPower(opts: {
  activityBq: number; eMaxMeV: number; eMeanMeV: number; z: number;
}): { yieldFrac: number; photonPowerMeVPerS: number; meanPhotonMeV: number } {
  const f = bremsstrahlungYield(opts.z, opts.eMaxMeV);
  return {
    yieldFrac: f,
    photonPowerMeVPerS: opts.activityBq * opts.eMeanMeV * f,
    meanPhotonMeV: opts.eMaxMeV / 3,
  };
}
