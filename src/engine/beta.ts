import { MEV_J } from "./constants";
import type { BetaBranch } from "./types";

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

/** Katz–Penfold 적합의 **아래 끝**. 그 아래는 적합된 자료가 없다. */
export const BETA_RANGE_MIN_MEV = 0.01;
/** 두 가지가 갈리는 곳 [MeV].
 *  ★★ **2.5 이지 3 이 아니다**(2026-09-19 유효성 평가에서 잡았다). 코드가 `<= 3` 이라
 *    2.5~3 MeV 를 저에너지 가지로 풀고 있었다. 자료에서 걸리는 것은 **Pr-144(2.996 MeV)**
 *    하나이고 어긋남은 0.69% — 적합 자체의 산포 안이라 답이 크게 틀리지는 않았지만,
 *    **공표된 식과 다른 식을 쓰면서 그 식의 이름을 다는 것**이라 고친다. */
export const BETA_RANGE_BRANCH_MEV = 2.5;

/** 베타 비정 — Katz–Penfold 경험식 [g/cm²].
 *  ★★ **경험식이다 — 정의도 평가된 핵자료도 아니다.** 알루미늄 흡수곡선에서 얻은
 *    **투사비정**에 맞춘 것이고, 그래서 ESTAR 의 CSDA(경로길이)보다 늘 짧다(우회인자).
 *    정확도 주장은 `src/validation/beta.cases.ts` 가 **실측한 값**으로 든다.
 *  ★ 적합 범위 밖에서는 답하지 않는다 — 그전에는 1 keV 를 넣어도 수를 냈다. */
export function betaRange(eMaxMeV: number): number {
  if (!(eMaxMeV >= BETA_RANGE_MIN_MEV) || !Number.isFinite(eMaxMeV)) return NaN;
  if (eMaxMeV <= BETA_RANGE_BRANCH_MEV)
    return 0.412 * Math.pow(eMaxMeV, 1.265 - 0.0954 * Math.log(eMaxMeV));
  return 0.530 * eMaxMeV - 0.106;
}

/** 그 비정을 실제 두께로 — 밀도로 나눈다 [cm]. */
export const betaRangeCm = (eMaxMeV: number, densityGcm3: number) =>
  densityGcm3 > 0 ? betaRange(eMaxMeV) / densityGcm3 : NaN;

/** 베타 질량흡수계수 경험식 [cm²/g] — 얇은 흡수체의 투과율 어림에 쓴다.
 *  ★★ **이 식의 출처를 찾지 못했다**(2026-09-19). 사이트 어디에도 인용이 없었고,
 *    유효성 평가에서도 「공표된 어느 식과 같은가」를 세우지 못했다. 그래서 보고서가
 *    **검증하지 못한 것**으로 분명히 적는다 — 있지도 않은 근거를 주장하는 것보다 낫다.
 *  ★ 비정과 **같은 범위**에서만 답한다. 0.001 MeV 를 넣으면 44 715 cm²/g 이 나왔는데,
 *    그것이 투과율 6×10⁻¹⁹⁵ 라는 **수처럼 생긴 답**으로 이어지고 있었다. */
export const betaMassAbsorption = (eMaxMeV: number) =>
  eMaxMeV >= BETA_RANGE_MIN_MEV && Number.isFinite(eMaxMeV) ? 17 / Math.pow(eMaxMeV, 1.14) : NaN;

/** 흡수체 투과율 — **비정을 넘으면 0 이다**(지수식은 0 으로 안 가므로 잘라 준다).
 *  ★★ **비정이 정의되지 않으면 투과율도 정의되지 않는다**(2026-09-19에 잡았다).
 *    그전에는 `thicknessGcm2 >= NaN` 이 false 라 **지수식으로 빠져 수를 냈다** —
 *    적합 범위 밖에서 6.4×10⁻¹⁹⁵ 같은 값이 화면에 설 수 있었다.
 *    **NaN 과의 비교가 false 인 것을 「통과」로 읽으면 가드가 뚫린다.** */
export function betaTransmission(eMaxMeV: number, thicknessGcm2: number): number {
  const R = betaRange(eMaxMeV);
  if (!Number.isFinite(R)) return NaN;
  if (!(thicknessGcm2 >= 0) || !Number.isFinite(thicknessGcm2)) return NaN;
  if (thicknessGcm2 === 0) return 1;
  if (thicknessGcm2 >= R) return 0;
  return Math.exp(-betaMassAbsorption(eMaxMeV) * thicknessGcm2);
}

/** 제동복사 수율 — 두꺼운 표적 경험식  f ≈ 3.5×10⁻⁴·Z·E_max(MeV).
 *  ★ 어림이다. 차폐재를 **낮은 Z 로 고르는 이유**를 보이는 것이 이 계산의 목적이다
 *    (납으로 베타를 막으면 X선이 새 문제로 돌아온다). */
export function bremsstrahlungYield(z: number, eMaxMeV: number): number {
  const f = 3.5e-4 * z * eMaxMeV;
  return Math.min(Math.max(f, 0), 1);
}

/** ★★ 흔적 가지 관례(소유주 결정 2026-10-29, T12) — 제동복사 몫은 **세기 1% 이상 가지의 최대 끝점**으로 계산한다.
 *  사정거리는 그대로 기록된 가지 전체의 최대 끝점이다(가장 센 베타를 막아야 한다). Co-60 의 1.49 MeV 는 0.12% 가지라
 *  그 끝점으로 낸 제동복사 몫은 거의 모든 붕괴가 내는 베타의 몫보다 몇 배 크다.
 *  ★ T13 — 낱장 · `/beta-shield-materials/` 만 이 규칙을 쓰고 **계산기는 최대 끝점**으로 계산하고 있었다(같은 핵종에서 값이
 *    달랐다). 규칙을 여기 한 곳에 두고 셋이 함께 읽는다. 1% 이상 가지가 없으면(지금 자료에는 없다) 최대 끝점으로 돌아간다. */
export const BETA_BRANCH_FLOOR_PCT = 1;
/** 제동복사를 계산할 끝점 [keV] — 위 관례. 끝점이 있는 가지가 없으면 `null`. */
export function bremsEndpointKeV(branches: readonly BetaBranch[] | undefined): number | null {
  const b = (branches ?? []).filter((x): x is BetaBranch & { max: number } => x.max != null);
  if (!b.length) return null;
  const sig = b.filter((x) => x.i >= BETA_BRANCH_FLOOR_PCT);
  return Math.max(...(sig.length ? sig : b).map((x) => x.max));
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
