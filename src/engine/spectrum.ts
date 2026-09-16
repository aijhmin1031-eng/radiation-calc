import { MEV_J, DELTA_DEFAULT_KEV } from "./constants";
import { logInterp, type Row } from "./interp";
import { linearAttenuation } from "./gamma";
import type { Material } from "./types";

/** 스펙트럼 기반 차폐 — **이 lab 이 남들과 갈리는 자리다.**
 *
 *  ★★ 무료 계산기 대부분은 핵종마다 **감마상수 Γ 하나**를 들고 반가층을 「단일 에너지」
 *    표에서 읽는다. 그런데 반가층은 스펙트럼에 걸린 값이다 — Co-60 처럼 선이 둘이면
 *    둘이 서로 다른 μ 로 줄고, I-131 처럼 25개면 **얇은 층에서 저에너지선이 먼저 죽어**
 *    투과곡선이 단일 지수가 아니다(빔 경화). 「E=1.25 MeV 의 반가층」은 근사이고,
 *    **「이 핵종의 공기커마율을 절반으로 만드는 두께」**가 실무가 쓰는 값이다.
 *  ★ 우리는 IAEA 선 표와 NIST μ/ρ 를 **둘 다** 들고 있으므로 그 값을 직접 풀 수 있다.
 *    선마다 감쇠시키고 합을 목표비까지 줄이는 두께를 이분법으로 찾는다.
 *  ★ **좁은 빔이다 — 축적(buildup)을 넣지 않는다.** 실제 넓은 빔에서는 산란선이 더해져
 *    이 두께로는 절반보다 더 남는다. 화면에 그렇게 적는다(과소평가 방향).
 */

/** 선 하나가 공기커마율에 기여하는 몫 [임의단위] — Γ 의 합산항과 같은 것이다. */
export function lineWeight(eKeV: number, yPct: number, air: Row[]): number {
  const E = eKeV / 1000;
  return E * MEV_J * (yPct / 100) * (logInterp(air, E, 2) * 0.1);
}

export interface LineShare { eKeV: number; yPct: number; weight: number; share: number }

/** 선별 기여도 — 「어느 선이 선량을 만드는가」. 방출강도 순서와 **다르다**
 *  (에너지가 높을수록 커마 기여가 크므로, 강도 1% 짜리 고에너지선이 앞설 수 있다). */
export function lineShares(lines: [number, number][], air: Row[], deltaKeV = DELTA_DEFAULT_KEV): LineShare[] {
  const kept = lines.filter(([e]) => e >= deltaKeV);
  const w = kept.map(([e, y]) => ({ eKeV: e, yPct: y, weight: lineWeight(e, y, air) }));
  const tot = w.reduce((s, x) => s + x.weight, 0);
  return w.map((x) => ({ ...x, share: tot > 0 ? x.weight / tot : 0 })).sort((a, b) => b.weight - a.weight);
}

/** 커마 가중 평균 광자에너지 [keV] — 「이 핵종을 한 에너지로 보면 몇 keV 인가」. */
export function meanPhotonEnergyKeV(lines: [number, number][], air: Row[], deltaKeV = DELTA_DEFAULT_KEV): number {
  const s = lineShares(lines, air, deltaKeV);
  return s.reduce((acc, x) => acc + x.eKeV * x.share, 0);
}

/** 두께 x [cm] 를 지난 뒤 남는 공기커마율 비 (좁은 빔, 축적 없음). */
export function spectrumTransmission(
  lines: [number, number][], air: Row[], shield: Row[], material: Material, xCm: number,
  deltaKeV = DELTA_DEFAULT_KEV, densityOverride?: number,
): number {
  let bare = 0, thru = 0;
  for (const [eKeV, yPct] of lines) {
    if (eKeV < deltaKeV) continue;
    const w = lineWeight(eKeV, yPct, air);
    bare += w;
    const mu = linearAttenuation(shield, eKeV / 1000, material, densityOverride);
    thru += w * Math.exp(-mu * xCm);
  }
  return bare > 0 ? thru / bare : NaN;
}

/** 공기커마율을 `frac` 까지 줄이는 두께 [cm] — 반가층은 frac=0.5, 십가층은 0.1.
 *  ★ 이분법이다. 스펙트럼 투과는 단일 지수가 아니라서 닫힌 해가 없다. */
export function spectrumLayer(
  lines: [number, number][], air: Row[], shield: Row[], material: Material, frac: number,
  deltaKeV = DELTA_DEFAULT_KEV, densityOverride?: number,
): number {
  const T = (x: number) => spectrumTransmission(lines, air, shield, material, x, deltaKeV, densityOverride);
  if (!(T(0) > 0)) return NaN;
  let lo = 0, hi = 0.01;
  /* 위쪽 경계를 먼저 찾는다 — 물질 밀도가 3,000배 차이나므로(공기 대 텅스텐) 고정값을 쓸 수 없다. */
  for (let i = 0; i < 200 && T(hi) > frac; i++) hi *= 1.6;
  if (T(hi) > frac) return NaN;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (T(m) > frac) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export const spectrumHVL = (l: [number, number][], air: Row[], s: Row[], m: Material, d?: number) =>
  spectrumLayer(l, air, s, m, 0.5, d);
export const spectrumTVL = (l: [number, number][], air: Row[], s: Row[], m: Material, d?: number) =>
  spectrumLayer(l, air, s, m, 0.1, d);
