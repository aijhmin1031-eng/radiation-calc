import type { Nuclide } from "../engine/types";
import { betaRangeCm, bremsstrahlungYield, bremsEndpointKeV } from "../engine/beta";
import { DENSITY_G_CM3 } from "../engine/gamma";

/** 베타 계산기의 흡수체 — 베타는 **낮은 Z** 로 막는다. 그것이 그 화면의 요점이라 Z 를 함께 든다. */
export const ABSORBERS = [
  { value: "acrylic", label: "Acrylic (PMMA)", z: 6.5, rho: 1.19 },
  { value: "water", label: "Water", z: 7.4, rho: 1.0 },
  { value: "glass", label: "Glass", z: 11, rho: 2.5 },
  { value: "aluminum", label: "Aluminium", z: 13, rho: DENSITY_G_CM3.aluminum },
  { value: "iron", label: "Iron / steel", z: 26, rho: DENSITY_G_CM3.iron },
  { value: "lead", label: "Lead", z: 82, rho: DENSITY_G_CM3.lead },
] as const;
export type AbsKey = typeof ABSORBERS[number]["value"];
/** 아크릴의 Z · 밀도 정본 — 계산기 · 낱장 · 읽을 글이 모두 여기서 읽는다.
 *  ★ 판 1.2.0(2026-11-01)까지 `lib/nuclides.ts` 와 `/beta-shield-materials/` 가 1.18 g/cm³ · Z 6 을 글자로 들고 있어 계산기(1.19 · 6.5)와 갈렸다. */
export const ACRYLIC = ABSORBERS[0];

/** 계산기 흡수체 표의 줄 — 멈추는 두께는 **최대 끝점**, 제동복사는 **세기 1% 이상 가지의 최대 끝점**(`bremsEndpointKeV`).
 *  ★ T13 — 계산기만 제동복사를 최대 끝점으로 내고 있었다(Co-60 납 4.28%, 낱장 0.91%). 표를 이 함수로 빼서 테스트가
 *    계산기의 연결까지 고정한다(엔진 규칙만 재던 테스트는 계산기를 되돌려도 통과했다 — T13 교차 검토). */
export function absorberRows(n: Nuclide) {
  const eMax = (n.beta_max_keV ?? 0) / 1000;
  const bremsKeV = bremsEndpointKeV(n.beta) ?? (n.beta_max_keV ?? 0);
  const eBrems = bremsKeV / 1000;
  return {
    eMax, bremsKeV, eBrems,
    rows: ABSORBERS.map((a) => ({ ...a, stopMm: betaRangeCm(eMax, a.rho) * 10, f: bremsstrahlungYield(a.z, eBrems) })),
  };
}
